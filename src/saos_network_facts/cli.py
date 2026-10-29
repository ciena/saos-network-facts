"""``saos-network-facts``: extract per-device facts from configurations, or validate a facts file."""

import argparse
import json
import sys
from pathlib import Path

from . import SCHEMA_VERSION, __version__, extract, schema
from .translator import DEFAULT_TRANSLATOR_URL, ROOT_ENV, SAOS_VERSION, TOKEN_ENV, URL_ENV, TranslatorError, load_translator


def write_json(document, out):
    text = json.dumps(document, indent=2, sort_keys=True) + "\n"
    if out == "-":
        sys.stdout.write(text)
    else:
        Path(out).write_text(text)


def cmd_extract(args):
    if not args.configs and not args.clab:
        print("extract: give --configs, --clab or both", file=sys.stderr)
        return 2
    devices = extract.collect(args.configs, args.clab, args.platform_map)
    translator = None
    if not args.no_saos10 and extract.needs_translator(devices):
        translator = load_translator(args.translator_root, args.translator_url, args.saos_version)
        print(translator.describe(), file=sys.stderr)
    records = []
    for device in devices:
        record = extract.device_facts(device, translator, args.jobs, args.recipe)
        records.append(record)
        if not args.quiet or record["status"] in ("error", "partial"):
            print(extract.summary_line(record), file=sys.stderr)
    write_json(extract.document(records, translator), args.output)
    counts = {s: sum(1 for r in records if r["status"] == s) for s in ("ok", "partial", "error", "skipped")}
    print(f"devices {len(records)} / ok {counts['ok']} / partial {counts['partial']} / errors {counts['error']} "
          f"/ skipped {counts['skipped']}", file=sys.stderr)
    return 1 if counts["error"] or counts["partial"] else 0


def cmd_validate(args):
    bad = 0
    for name in args.files:
        try:
            doc = json.loads(Path(name).read_text())
        except (OSError, json.JSONDecodeError) as exc:
            print(f"{name}: {exc}", file=sys.stderr)
            bad += 1
            continue
        problems = schema.errors(doc)
        if isinstance(doc, list):
            problems.insert(0, "$: a bare list of device records is the pre-schema format; schema v1 is an object "
                               "{schema_version, generator, devices}")
        for problem in problems:
            print(f"{name}: {problem}", file=sys.stderr)
        if problems:
            bad += 1
        else:
            print(f"{name}: valid (schema {doc.get('schema_version')})")
    return 1 if bad else 0


def parser():
    p = argparse.ArgumentParser(prog="saos-network-facts", description=__doc__)
    p.add_argument("--version", action="version", version=f"%(prog)s {__version__} (schema {SCHEMA_VERSION})")
    sub = p.add_subparsers(dest="command", required=True)

    e = sub.add_parser("extract", help="extract facts from configuration files",
                       description="Extract per-device facts from SAOS 6 / 8 / 10 configurations into a facts file.")
    e.add_argument("--configs", nargs="+", metavar="PATH",
                   help="configuration directories or files (one device per file or per subdirectory; "
                        "files sharing a name up to the first dot are one device, applied in name order)")
    e.add_argument("--clab", metavar="FILE", help="a containerlab topology: node kinds and types, and startup-config files")
    e.add_argument("--platform-map", metavar="FILE",
                   help="YAML/JSON {devices: {NAME: {type, platform, extractor, configs}}} for what the files do not say")
    e.add_argument("-o", "--output", default="-", metavar="FILE", help="the facts file to write (default: stdout)")
    e.add_argument("--recipe", metavar="NAME", help="label every device record with this recipe / lab name")
    e.add_argument("--no-saos10", action="store_true", help="skip SAOS 10 devices (no translator calls)")
    e.add_argument("--translator-url", metavar="URL",
                   help=f"a translator MCP endpoint (env {URL_ENV}; default {DEFAULT_TRANSLATOR_URL}; "
                        f"a token in {TOKEN_ENV} is sent when set)")
    e.add_argument("--translator-root", metavar="DIR", help=f"a local translator checkout instead of the endpoint (env {ROOT_ENV})")
    e.add_argument("--saos-version", default=SAOS_VERSION, help=f"the SAOS 10 release the translator parses for (default {SAOS_VERSION})")
    e.add_argument("--jobs", type=int, default=8, help="parallel translator calls per device (endpoint only; default 8)")
    e.add_argument("--quiet", action="store_true", help="print only errors, partial devices and the summary")
    e.set_defaults(func=cmd_extract)

    v = sub.add_parser("validate", help="validate facts files against the schema")
    v.add_argument("files", nargs="+", metavar="FILE")
    v.set_defaults(func=cmd_validate)
    return p


def main(argv=None):
    args = parser().parse_args(argv)
    try:
        return args.func(args)
    except (FileNotFoundError, ImportError, ValueError, TranslatorError) as exc:
        print(f"{args.command}: {exc}", file=sys.stderr)
        return 2
