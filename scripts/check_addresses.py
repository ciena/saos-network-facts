#!/usr/bin/env python3
# SPDX-License-Identifier: Apache-2.0
"""Check that every IP address in the repository is a private or documentation address.

This is a public repository: lab, customer and internal addresses must not enter it. Every text
file git tracks is scanned (binary files are skipped) and each IPv4 / IPv6 address found must be
in one of:

    IPv4  10.0.0.0/8, 172.16.0.0/12, 192.168.0.0/16 (RFC 1918),
          192.0.2.0/24, 198.51.100.0/24, 203.0.113.0/24 (RFC 5737), and 0.0.0.0/8
          ("this network", RFC 1122 §3.2.1.3: never a host's address; OSPF area ids such as
          0.0.0.0 and 0.0.0.1 are written in it)
    IPv6  2001:db8::/32 (RFC 3849), and :: / ::1

A dotted quad or colon group that is not a valid address (``1.2.3.4.5``, ``10.12.00.0228``, a MAC
address, ``std::map`` or ``a::b``: an IPv6 token needs a decimal digit) is not reported, nor is a
section number written after ``§`` (``RFC 4271 §9.1.2.2``). Well-known protocol addresses the
code must name are listed one by one in PROTOCOL_ADDRESSES.

    scripts/check_addresses.py            # the tracked files; exit 1 on any other address
    scripts/check_addresses.py FILE ...   # these files instead
"""

import ipaddress
import re
import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent

ALLOWED = [ipaddress.ip_network(n) for n in (
    "10.0.0.0/8", "172.16.0.0/12", "192.168.0.0/16",
    "192.0.2.0/24", "198.51.100.0/24", "203.0.113.0/24",
    "0.0.0.0/8",
    "2001:db8::/32",
)]
ALLOWED_HOSTS = {ipaddress.ip_address(a) for a in ("::", "::1")}
# Protocol constants, not lab or customer addresses: each with where it is defined.
PROTOCOL_ADDRESSES = {
    ipaddress.ip_address("224.0.0.5"): "OSPF AllSPFRouters (RFC 2328 §A.1)",
}

# Not scanned: npm lockfiles pin package versions and integrity hashes, not addresses, and are
# written by npm. Nothing else is excluded; generated files that are tracked are scanned.
EXCLUDED = {"js/package-lock.json", "viewer/package-lock.json"}

IPV4 = re.compile(r"(?<![\w.§])(?:\d{1,3}\.){3}\d{1,3}(?![\w.]*\d)")
IPV6 = re.compile(r"(?<![\w:.])(?:[0-9A-Fa-f]{0,4}:){2,7}[0-9A-Fa-f]{0,4}(?![\w:])")


def tracked_files():
    out = subprocess.run(["git", "-C", str(ROOT), "ls-files", "-z"], capture_output=True, text=True, check=True).stdout
    return [p for p in out.split("\0") if p and p not in EXCLUDED and (ROOT / p).is_file()]


def addresses(line):
    """The valid IPv4 and IPv6 addresses written in a line of text."""
    for pattern in (IPV4, IPV6):
        for match in pattern.finditer(line):
            token = match.group(0)
            if pattern is IPV6 and token != "::" and not re.search(r"\d", token):
                continue  # `a::b`, `std::map`: code, not an address (an address has a digit)
            try:
                yield ipaddress.ip_address(token)
            except ValueError:
                continue  # a version string, a MAC address, `a::b` in code: not an address


def allowed(address):
    return address in ALLOWED_HOSTS or address in PROTOCOL_ADDRESSES or any(address in network for network in ALLOWED)


def check_text(text):
    """[(line number, address)] for every address in `text` outside the allowed ranges."""
    return [(n, str(a)) for n, line in enumerate(text.splitlines(), 1) for a in addresses(line) if not allowed(a)]


def check_file(path):
    data = Path(path).read_bytes()
    if b"\0" in data[:8192]:
        return []  # binary
    return check_text(data.decode("utf-8", errors="replace"))


def main(argv=None):
    argv = sys.argv[1:] if argv is None else argv
    paths = argv or tracked_files()
    bad = []
    for path in paths:
        for line, address in check_file(ROOT / path if not argv else path):
            bad.append(f"{path}:{line}: {address}")
    if bad:
        print("Addresses outside RFC 1918 / RFC 5737 / 2001:db8::/32:")
        print("\n".join(f"  {b}" for b in bad))
        return 1
    print(f"{len(paths)} files: every address is RFC 1918, RFC 5737 or 2001:db8::/32")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
