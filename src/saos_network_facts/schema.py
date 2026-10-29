"""The facts file's JSON Schema (``schema/facts-v1.schema.json``) and validation against it."""

import json
from functools import cache
from importlib import resources

from jsonschema import Draft202012Validator

SCHEMA_FILE = "facts-v1.schema.json"


@cache
def load_schema():
    return json.loads(resources.files(__package__).joinpath("schema", SCHEMA_FILE).read_text())


def errors(document):
    """Every way ``document`` breaks the schema, as ``"<json path>: <message>"`` lines; [] when valid."""
    validator = Draft202012Validator(load_schema())
    out = []
    for error in sorted(validator.iter_errors(document), key=lambda e: list(e.absolute_path)):
        where = "$" + "".join(f"[{p}]" if isinstance(p, int) else f".{p}" for p in error.absolute_path)
        out.append(f"{where}: {error.message}")
    return out
