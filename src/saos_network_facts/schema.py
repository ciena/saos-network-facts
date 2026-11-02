# SPDX-License-Identifier: Apache-2.0
"""The JSON Schemas of the facts file (``schema/facts-v1.schema.json``) and of view properties
(``schema/view-v1.schema.json``, with the defaults and presets in ``schema/view-presets-v1.json``),
and validation against them."""

import json
from functools import cache
from importlib import resources

from jsonschema import Draft202012Validator

SCHEMA_FILE = "facts-v1.schema.json"
VIEW_SCHEMA_FILE = "view-v1.schema.json"
VIEW_PRESETS_FILE = "view-presets-v1.json"


def _load(name):
    return json.loads(resources.files(__package__).joinpath("schema", name).read_text())


@cache
def load_schema():
    return _load(SCHEMA_FILE)


@cache
def load_view_schema():
    return _load(VIEW_SCHEMA_FILE)


@cache
def load_view_presets():
    """The view defaults and presets: ``{"defaults": view, "presets": {name: view}}``."""
    return _load(VIEW_PRESETS_FILE)


def view_errors(view):
    """Every way a view file breaks the view schema, as for ``errors``; [] when valid."""
    return errors(view, load_view_schema())


def errors(document, schema=None):
    """Every way ``document`` breaks the facts schema (or ``schema``), as ``"<json path>: <message>"``
    lines; [] when valid."""
    validator = Draft202012Validator(schema or load_schema())
    out = []
    for error in sorted(validator.iter_errors(document), key=lambda e: list(e.absolute_path)):
        where = "$" + "".join(f"[{p}]" if isinstance(p, int) else f".{p}" for p in error.absolute_path)
        out.append(f"{where}: {error.message}")
    return out
