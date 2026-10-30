# Adaptive-SR-CFM: where this example comes from

Ten SAOS 10 devices from a Ciena internal lab recipe (Adaptive-SR-CFM), *SR with rerouting on
TCA*: an IS-IS level-1 segment-routing core (SRGB 16000-17000, a node SID per loopback), SR
policies of color 2 between PE pairs, VPWS services over pseudowires (two steered onto those SR
policies, one over the peer's Prefix-SID), a CFM up-MEP pair with delay measurement on one service,
and iBGP with PE6 as route reflector. CE1 hangs off PE1.

The configurations are the recipe's startup configurations as the lab renders them to boot the
devices, with the addresses outside RFC 1918 renumbered (below); `facts.json` was extracted from
them with saos-network-facts 0.5.0 and translator 4.2.1 (the hosted translator).

## Files

| Path | |
|---|---|
| `configs/<DEVICE>/<NN>-<template>.xml` | each device's startup configuration (NETCONF XML), one file per template, `NN` = the order the lab applies them |
| `devices.yaml` | the platform map: each device's type, which the files do not say |
| `facts.json` | `saos-network-facts extract` of the above (schema 1.5) |

## Regenerate

```bash
# 1. extract (SAOS 10: the files go to the translator, the hosted one by default)
cd examples/adaptive-sr-cfm
saos-network-facts extract --configs configs --platform-map devices.yaml --recipe Adaptive-SR-CFM -o facts.json
saos-network-facts validate facts.json

# 2. the site (viewer/ imports this facts.json)
cd ../../viewer && npm ci && npm run build
```

Expect `devices 10 / ok 10 / partial 0 / errors 0 / skipped 0`.

## What was left out or scrubbed

- Only the rendered startup configurations are here: nothing else of the recipe (its variables,
  documentation, diagram or other templates) is copied, and its author is not named.
- The templates configure the data plane only: no management interface, management or lab
  controller addresses, users, passwords, SNMP communities or keys appear in the rendered files.
  XML comments were stripped; this render had none.
- The SAT sessions name their peer by MAC address; the two MACs of real lab units are replaced by
  locally administered ones (`02:00:00:00:00:01`, `02:00:00:00:00:02`).
- Lab addresses outside RFC 1918 renumbered into RFC 1918: the loopbacks are now in
  10.255.10.0/24 and the core links in 172.30.10.0/24, each keeping its last octet. The IS-IS
  system ids are re-derived from the new loopbacks (`0102.5501.000N` for 10.255.10.N); the area
  and NSEL of each NET are unchanged.
- Kept as rendered: the other data-plane addresses (the CE link 172.20.10.0/30, the CE's
  10.40.40.0/24 and its static next hop 172.20.20.1), device names, types and YANG namespaces.
