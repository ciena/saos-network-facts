# Viewer test fixtures

Synthetic facts files the viewer tests read that the extractor cases in `tests/fixtures/` do not
produce. Device names and addresses (RFC 5737 / RFC 3849 documentation ranges) are made up.

- `srv6-ospf.facts.json`: SRv6 over a two-area OSPF core. The `ospf-tp` ring (`PE1 - P1 - PE2 - P2 -
  PE1`, costs 10 / 20) from `tests/fixtures/expected/ospf-tp.facts.json`, with PE2, its loopback and
  its two links moved to area 0.0.0.1 (P1 and P2 become area border routers) and one algorithm-0 SRv6
  locator `LOC` per router (`2001:db8:f0:<n>::/64`). Edited by hand from that file; validated against
  the schema by `tests/test_extract.py::test_expected_facts_validate`.
