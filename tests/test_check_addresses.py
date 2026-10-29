# SPDX-License-Identifier: Apache-2.0
"""scripts/check_addresses.py: only private and documentation addresses in the repository."""

import importlib.util
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
spec = importlib.util.spec_from_file_location("check_addresses", ROOT / "scripts" / "check_addresses.py")
check = importlib.util.module_from_spec(spec)
spec.loader.exec_module(check)


def test_allowed_ranges_pass():
    text = "\n".join([
        "10.1.2.3 172.16.0.1 172.31.255.254 192.168.1.1",  # RFC 1918
        "192.0.2.1 198.51.100.7/31 203.0.113.255",  # RFC 5737
        "0.0.0.0 area 0.0.0.0 area 0.0.0.1",  # 0.0.0.0/8: this network, OSPF area ids
        "2001:db8::1 2001:db8:0:1::/64 :: ::1",  # RFC 3849, unspecified, loopback
    ])
    assert check.check_text(text) == []


# The addresses that must fail are put together at run time, so this file itself passes the check.
def v4(*octets):
    return ".".join(map(str, octets))


def v6(*groups):
    return ":".join(groups)


def test_other_addresses_fail_with_their_line():
    public, above_172, dns = v4(20, 10, 10, 1), v4(172, 32, 0, 1), v4(8, 8, 8, 8)
    v6_public, link_local = v6("2001", "4860", "", "8888"), v6("fe80", "", "1")
    text = f"ok 10.0.0.1\nloopback {public}/32\nlink {above_172} and {dns}\nv6 {v6_public} {link_local}"
    assert check.check_text(text) == [(2, public), (3, above_172), (3, dns), (4, v6_public), (4, link_local)]


def test_what_is_not_an_address():
    text = "\n".join([
        "version 1.2.3.4.5, SAOS 10.12.00.0228, 999.1.1.1",  # version strings, not valid addresses
        "RFC 4271 §9.1.2.2 and ISO 10589 §7.3.15.1",  # section numbers
        "std::map a::b MAC 02:00:00:00:00:01 time 10:20:30",  # IPv6-looking code and MACs
    ])
    assert check.check_text(text) == []


def test_protocol_constants_are_named_one_by_one():
    assert check.check_text("const ALL_SPF_ROUTERS = '224.0.0.5';") == []
    all_dr_routers = v4(224, 0, 0, 6)
    assert check.check_text(all_dr_routers) == [(1, all_dr_routers)]


def test_lockfiles_are_the_only_exclusions():
    assert check.EXCLUDED == {"js/package-lock.json", "viewer/package-lock.json"}


def test_the_tracked_files_pass():
    assert check.main([]) == 0
