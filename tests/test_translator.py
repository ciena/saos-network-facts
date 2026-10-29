# SPDX-License-Identifier: Apache-2.0
import io
import json
import urllib.error

import pytest

from saos_network_facts import translator


class FakeResponse(io.BytesIO):
    def __enter__(self):
        return self

    def __exit__(self, *exc):
        return False


@pytest.fixture
def endpoint(monkeypatch):
    """A stand-in for the MCP endpoint: records each request, answers from ``replies`` by tool name."""
    calls = []
    replies = {}

    def urlopen(request, timeout):
        body = json.loads(request.data)
        calls.append({"url": request.full_url, "headers": dict(request.header_items()), "body": body})
        if body["method"] == "initialize":
            result = {"serverInfo": {"name": "t", "version": "4.2.0"}}
        else:
            reply = replies[body["params"]["name"]]
            if isinstance(reply, Exception):
                raise reply
            result = {"structuredContent": reply}
        return FakeResponse(json.dumps({"jsonrpc": "2.0", "id": body["id"], "result": result}).encode())

    monkeypatch.setattr(translator, "urlopen", urlopen)
    monkeypatch.delenv(translator.TOKEN_ENV, raising=False)
    return calls, replies


def test_convert_without_a_token(endpoint):
    calls, replies = endpoint
    replies["convert_cli"] = {"ok": True, "data": {"config": {}}}
    t = translator.HttpTranslator("https://translator.example/")
    assert t.describe() == "translator 4.2.0 (mcp, https://translator.example)"
    assert t.parse("system config hostname A\n", "cli", "cn5164") == {"config": {}}
    assert all(c["url"] == "https://translator.example/mcp" for c in calls)
    assert all("Authorization" not in c["headers"] for c in calls)
    args = calls[-1]["body"]["params"]["arguments"]
    assert args["convert_to"] == "json" and args["cli"].startswith("system") and args["platform"] == "cn5164"


def test_token_is_sent_when_set(endpoint, monkeypatch):
    calls, replies = endpoint
    monkeypatch.setenv(translator.TOKEN_ENV, "t0ken")
    replies["convert_xml"] = {"ok": True, "data": {}}
    t = translator.HttpTranslator("https://translator.example")
    t.parse("<config/>", "xml")
    assert calls[-1]["headers"]["Authorization"] == "Bearer t0ken"
    assert "platform" not in calls[-1]["body"]["params"]["arguments"]


def test_refused_configuration(endpoint):
    _, replies = endpoint
    replies["convert_cli"] = {"ok": False, "message": "Unknown top-level command: frobnicate"}
    t = translator.HttpTranslator("https://translator.example")
    with pytest.raises(translator.TranslatorError, match="frobnicate"):
        t.parse("frobnicate\n", "cli")


def test_401_names_the_token_variable(endpoint):
    _, replies = endpoint
    replies["convert_cli"] = urllib.error.HTTPError("u", 401, "Unauthorized", {}, io.BytesIO(b'{"error":"invalid_token"}'))
    t = translator.HttpTranslator("https://translator.example")
    with pytest.raises(translator.TranslatorError, match=f"no token sent.*{translator.TOKEN_ENV}"):
        t.parse("x\n", "cli")


def test_load_translator_picks_the_backend(monkeypatch, tmp_path):
    monkeypatch.setattr(translator, "HttpTranslator", lambda url, saos_version: ("http", url))
    monkeypatch.delenv(translator.URL_ENV, raising=False)
    monkeypatch.delenv(translator.ROOT_ENV, raising=False)
    assert translator.load_translator() == ("http", translator.DEFAULT_TRANSLATOR_URL)
    monkeypatch.setenv(translator.URL_ENV, "https://elsewhere.example")
    assert translator.load_translator() == ("http", "https://elsewhere.example")
    assert translator.load_translator(url="https://given.example") == ("http", "https://given.example")
    with pytest.raises(FileNotFoundError):
        translator.load_translator(root=tmp_path)


def test_text_helpers():
    assert translator.normalise_mode_lines("conf\n a b\nconfigure \nexit\n") == "config\n a b\nconfig \nexit\n"
    assert translator.detect_format("# c\n\n  <config/>") == "xml"
    assert translator.detect_format("{# j #}\nsystem config hostname A") == "cli"
    assert translator.translator_platform("5164-10x") == "cn5164"
    assert translator.translator_platform("5162") == "cn5162"
    assert translator.translator_platform("3926v2-10x") == "cn3926"
    assert translator.translator_platform("linux") is None
