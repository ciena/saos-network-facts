# SPDX-License-Identifier: Apache-2.0
"""The SAOS 10 translator, which turns a CLI or NETCONF XML configuration into pivot JSON.

SAOS 10 configurations are parsed by the translator, not here: its ``convert_cli`` / ``convert_xml``
tools (``convert_to: json``) return one JSON document keyed by YANG module, which ``saos10`` walks.
The translator is reached one of two ways:

* an MCP endpoint over HTTP (``POST <url>/mcp``, stateless JSON-RPC): ``--translator-url`` or
  ``SAOS10_TRANSLATOR_URL``, else ``DEFAULT_TRANSLATOR_URL``. The two convert tools are open from
  translator 4.2.0, so no token is needed; when ``SAOS10_TRANSLATOR_TOKEN`` is set it is sent as a
  bearer token;
* a local translator checkout (``--translator-root`` or ``SAOS10_TRANSLATOR_ROOT``), imported in
  process; run under the checkout's own virtualenv.

Nothing here is translator code: the HTTP client speaks only the MCP protocol.
"""

import json
import os
import re
import sys
import time
import urllib.error
import urllib.request
from pathlib import Path

from . import __version__

# The hosted translator, the default endpoint. Kept in this one constant; override it with
# --translator-url or SAOS10_TRANSLATOR_URL, or use --translator-root for a local checkout.
DEFAULT_TRANSLATOR_URL = "https://dgwl7tykn828q.cloudfront.net"
SAOS_VERSION = "10_12_00_0228"
TOKEN_ENV = "SAOS10_TRANSLATOR_TOKEN"
URL_ENV = "SAOS10_TRANSLATOR_URL"
ROOT_ENV = "SAOS10_TRANSLATOR_ROOT"
MCP_PROTOCOL = "2025-06-18"
CONFIG_ALIAS = re.compile(r"^(\s*)(conf|configure)(\s*)$")
PLATFORM_ALIASES = {"3926v2": "cn3926"}
SAOS10_MODEL = re.compile(r"^(?:cn)?(\d{4}(?:v\d)?)(?:-10x)?$")


def normalise_mode_lines(text):
    """The configuration with the ``conf`` / ``configure`` aliases spelled ``config``. Nothing else
    is touched: ``config``, ``exit``, ``apply`` and ``return`` are commands the device and the
    translator both understand, and line numbers are preserved for the diagnostics."""
    return "\n".join(CONFIG_ALIAS.sub(r"\1config\3", line) for line in text.splitlines()) + ("\n" if text.endswith("\n") else "")


def detect_format(text):
    """``xml`` or ``cli``, decided by the first line that is not blank and not a comment."""
    for line in text.splitlines():
        stripped = line.strip()
        if not stripped or stripped.startswith("#") or stripped.startswith("{#"):
            continue
        return "xml" if stripped.startswith("<") else "cli"
    return "cli"


def translator_platform(device_type):
    """The translator platform (``cn5164``) for a SAOS 10 device type (``5164-10x``, ``5164``,
    ``cn5164``), or None when the type does not name a model."""
    match = SAOS10_MODEL.match(str(device_type or ""))
    if not match:
        return None
    model = match.group(1)
    return PLATFORM_ALIASES.get(model, f"cn{model}")


def prepare(text):
    """``(fmt, text)`` as it is sent to the translator."""
    fmt = detect_format(text)
    return fmt, (normalise_mode_lines(text) if fmt == "cli" else text)


class TranslatorError(Exception):
    """The translator refused a configuration, or could not be reached."""


class LocalTranslator:
    """The translator's Python ``api`` module, imported from a checkout."""

    parallel = False  # the Python module shares YANG state; keep its calls on one thread

    def __init__(self, root, saos_version=SAOS_VERSION):
        self.root = Path(root)
        self.saos_version = saos_version
        if not (self.root / "api.py").is_file():
            raise FileNotFoundError(f"SAOS 10 translator checkout not found at {self.root} (api.py missing)")
        if str(self.root) not in sys.path:
            sys.path.insert(0, str(self.root))
        try:
            import api  # the translator's public module
        except ModuleNotFoundError as exc:
            raise ImportError(
                f"the translator at {self.root} needs {exc.name!r}; run with the translator's own "
                "virtualenv or install its requirements in this interpreter"
            ) from exc
        self.api = api
        self.version = "unknown"
        pyproject = self.root / "pyproject.toml"
        if pyproject.is_file():
            m = re.search(r'^version\s*=\s*"([^"]+)"', pyproject.read_text(), re.M)
            if m:
                self.version = m.group(1)

    def describe(self):
        return f"translator {self.version} (local)"

    def parse(self, text, fmt, platform=None):
        convert = self.api.xml_to_json if fmt == "xml" else self.api.cli_to_json
        try:
            return convert(text, self.saos_version, allow_placeholders=True)
        except Exception as exc:  # the translator raises its own parse errors
            raise TranslatorError(str(exc).splitlines()[0] if str(exc) else type(exc).__name__) from exc


class HttpTranslator:
    """A translator MCP endpoint (``POST <url>/mcp``, stateless JSON-RPC, JSON replies). The convert
    tools answer ``{"ok", "data"}`` in ``structuredContent``. A token is optional: when one is given
    (or set in ``SAOS10_TRANSLATOR_TOKEN``) requests carry ``Authorization: Bearer <token>``."""

    parallel = True  # the endpoint is stateless: calls from several threads are fine
    RETRIES = 3  # attempts per request on 429, 5xx and network errors; the waits between them grow 1 s, 2 s

    def __init__(self, url, token=None, timeout=120, saos_version=SAOS_VERSION):
        self.url = url.rstrip("/")
        self.token = token or os.environ.get(TOKEN_ENV) or None
        self.timeout = timeout
        self.saos_version = saos_version
        self._ids = iter(range(1, 1 << 62))
        info = self._rpc("initialize", {"protocolVersion": MCP_PROTOCOL, "capabilities": {},
                                        "clientInfo": {"name": "saos-network-facts", "version": __version__}})
        self.version = (info.get("serverInfo") or {}).get("version", "unknown")

    def describe(self):
        return f"translator {self.version} (mcp, {self.url})"

    def _rpc(self, method, params):
        data = json.dumps({"jsonrpc": "2.0", "id": next(self._ids), "method": method, "params": params}).encode()
        headers = {"Content-Type": "application/json", "Accept": "application/json, text/event-stream"}
        if self.token:
            headers["Authorization"] = f"Bearer {self.token}"
        for attempt in range(1, self.RETRIES + 1):
            request = urllib.request.Request(self.url + "/mcp", data=data, headers=headers)
            try:
                with urlopen(request, timeout=self.timeout) as response:
                    reply = json.loads(response.read())
                break
            except urllib.error.HTTPError as exc:
                detail = exc.read().decode(errors="replace")[:300]
                if exc.code == 401:
                    detail = f"{'the token was refused' if self.token else 'no token sent'} (set {TOKEN_ENV}): {detail}"
                if not retryable(exc.code) or attempt == self.RETRIES:
                    raise TranslatorError(f"{method}: HTTP {exc.code}: {detail}") from None
            except (urllib.error.URLError, TimeoutError, OSError) as exc:
                if attempt == self.RETRIES:
                    raise TranslatorError(f"{method}: {exc}") from None
            sleep(attempt)
        if "error" in reply:
            raise TranslatorError(f"{method}: {reply['error'].get('message', reply['error'])}")
        return reply.get("result") or {}

    def _tool(self, name, arguments):
        """A tool's structured reply."""
        result = self._rpc("tools/call", {"name": name, "arguments": arguments})
        if "structuredContent" in result:
            return result["structuredContent"]
        body = "".join(c.get("text", "") for c in result.get("content") or [] if c.get("type") == "text")
        if result.get("isError"):
            return {"ok": False, "message": body or f"{name} failed"}
        return json.loads(body) if body else {}

    def parse(self, text, fmt, platform=None):
        """Pivot JSON, or raises TranslatorError with the translator's message."""
        arguments = {"convert_to": "json", "saos_version": self.saos_version, fmt: text,
                     "allow_placeholders": True, "slots_populated": True}
        if platform:
            arguments["platform"] = platform
        reply = self._tool(f"convert_{fmt}", arguments)
        if not reply.get("ok"):
            raise TranslatorError(failure_message(reply, "convert failed"))
        return reply.get("data")


def failure_message(reply, default):
    """Why a tool said ``ok: false``: its message, else its error code, else the validation message
    (where the translator puts schema errors such as an unknown element in XML)."""
    return reply.get("message") or reply.get("error") or (reply.get("validation") or {}).get("message") or default


def retryable(status):
    """Worth another attempt: the endpoint is throttling (429) or failing (5xx). Other 4xx are final."""
    return status == 429 or 500 <= status <= 599


def urlopen(request, timeout):
    """Indirection so tests can stand in for the network."""
    return urllib.request.urlopen(request, timeout=timeout)


def sleep(seconds):
    """Indirection so tests need not wait out the backoff."""
    time.sleep(seconds)


def load_translator(root=None, url=None, saos_version=SAOS_VERSION):
    """A translator backend: an explicit ``url`` or ``root``, else ``SAOS10_TRANSLATOR_URL``, else
    ``SAOS10_TRANSLATOR_ROOT``, else ``DEFAULT_TRANSLATOR_URL``."""
    if url:
        return HttpTranslator(url, saos_version=saos_version)
    root = root or (None if os.environ.get(URL_ENV) else os.environ.get(ROOT_ENV))
    if root:
        return LocalTranslator(Path(os.path.expanduser(root)), saos_version=saos_version)
    return HttpTranslator(os.environ.get(URL_ENV) or DEFAULT_TRANSLATOR_URL, saos_version=saos_version)
