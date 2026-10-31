# saos-network-facts

Extract per-device network facts from SAOS 6/8/10 configurations into a versioned, vendor-neutral schema.

Give it a directory of device configurations (and optionally a containerlab topology) and it writes
one JSON facts file: per device, the hostname, interfaces and addresses, ports, VLANs, LAGs,
forwarding domains and flow points, IS-IS (level, area, NET, interface metrics), OSPF (instances, areas, interfaces),
segment routing (SRGB, prefix and node SIDs, SR policies), BGP (neighbours, route reflection),
MPLS-TP co-routed tunnels, pseudowires and L2VPN services, and CFM MEPs. Diagram tools,
topology viewers and presentation builds read that file instead of parsing configurations
themselves. The file follows a published JSON Schema, so readers can pin a schema version.

- **Python** (`saos_network_facts`, CLI `saos-network-facts`): the extractor.
- **npm** (`@ciena/saos-network-facts`, in [`js/`](js/)): the schema, TypeScript types and a reader.
- **Viewer** ([`viewer/`](viewer/)): a static site that shows a facts file in 3D; released as a
  download to stage next to your own facts ([below](#use-the-viewer-in-your-repo)).

## Install

```bash
pip install "git+https://github.com/ciena/saos-network-facts@v0.4.0"
saos-network-facts --version
```

Python 3.11 or later; the only dependencies are PyYAML and jsonschema.

## Extract

```bash
# a directory of configurations: one device per file (PE1.cfg) or per subdirectory (PE1/01-base.cfg, ...)
saos-network-facts extract --configs configs/ -o facts.json

# a containerlab lab: node kinds and types from the topology, configs from startup-config
saos-network-facts extract --clab topo.clab.yml -o facts.json

# both: the topology for the devices, another directory for their configurations
saos-network-facts extract --clab topo.clab.yml --configs solutions/ -o facts.json

# device types the files do not say, for a plain configs directory
saos-network-facts extract --configs configs/ --platform-map devices.yaml -o facts.json

saos-network-facts validate facts.json
```

How files map to devices:

- a file is a device named after the file up to its first dot (`PE_1.cfg.partial` is `PE_1`); files
  that share that name are one device, applied in name order (`R1.day0.cfg`, `R1.day1.cfg`). Each
  file adds to the earlier ones: a SAOS 10 object a later file mentions again keeps the leaves it
  does not set (a base file's `type loopback` survives a device file's address);
- a subdirectory is a device; its files are applied in name order;
- `--clab`: every node is a device; its `startup-config` is its configuration unless `--configs`
  has files for it. Nodes of other kinds (Linux hosts) are recorded as `skipped`;
- `--platform-map`: YAML or JSON, `devices: {NAME: {type, platform, extractor, configs}}` (or
  `NAME: TYPE`), for what the inputs do not say.

Which parser reads a device: the platform map's `extractor`, else the device type (`*-6x`, `*-8x`:
SAOS 6/8; `*-10x`: SAOS 10), else the containerlab kind (`ciena_saos`: SAOS 10), else the files
themselves (XML, or CLI not written as SAOS 6 `verb [noun] action` commands, is SAOS 10).

A SAOS 10 device needs its translator platform (`cn5164`): the platform map's `platform`, else the
device type (`5164-10x`, `5164`, `cn5164`). The translator's convert tools require one from 4.2.1 and
have no default, so a SAOS 10 device with neither (a configs directory with no platform map, say) is
recorded as `error` with that reason and its files are not sent; give it a type or platform:

```yaml
devices:
  PE3: 5164-10x          # the type, or
  PE4: {platform: cn5164}
```

Other options: `--recipe NAME` labels every record, `--no-saos10` skips SAOS 10 devices, `--jobs N`
sets parallel translator calls, `--quiet` prints only problems. The exit status is 1 when a device
is `error` or `partial` (the facts file is still written), 2 on bad arguments.

### SAOS 10 and the translator

SAOS 6 and SAOS 8 configurations are parsed here. SAOS 10 configurations (CLI or NETCONF XML) are
parsed by the SAOS 10 translator, whose `convert_cli` / `convert_xml` MCP tools return the
configuration as JSON keyed by YANG module; this package walks that JSON. No translator code ships
here: the client speaks only the MCP protocol over HTTP.

By default the client uses the **hosted translator** at `https://dgwl7tykn828q.cloudfront.net`
(`POST /mcp`). It needs no account or token, so `saos-network-facts extract` works out of the box on
SAOS 10 configurations. Each SAOS 10 configuration file is sent to that endpoint to be parsed; to
keep configurations on your machine, use a local translator checkout (`--translator-root`), or skip
SAOS 10 devices with `--no-saos10`. SAOS 6 / 8 files never leave your machine. The translator in use
is recorded in the facts file (`generator.translator`).

| Setting | Flag | Environment |
|---|---|---|
| Translator endpoint (default: the hosted translator above) | `--translator-url URL` | `SAOS10_TRANSLATOR_URL` |
| Bearer token, sent only when set (the convert tools need none from translator 4.2.0) | | `SAOS10_TRANSLATOR_TOKEN` |
| A local translator checkout instead of an endpoint (run under its virtualenv) | `--translator-root DIR` | `SAOS10_TRANSLATOR_ROOT` |
| SAOS 10 release to parse for (default `10_12_00_0228`) | `--saos-version V` | |

The flag wins over the environment; `SAOS10_TRANSLATOR_URL` wins over `SAOS10_TRANSLATOR_ROOT`.
When the endpoint throttles (HTTP 429), fails (5xx) or the connection drops, each request is tried
up to 3 times, waiting 1 s and then 2 s; other errors (a 4xx such as 401) fail at once. `--jobs N`
(default 8) bounds the parallel requests for one device; lower it if you are throttled.

A file the translator rejects is listed in the device's `failed_templates` and the device is
`partial`; its other files still count.

## The facts file

```json
{
  "schema_version": "1.7.0",
  "generator": {"name": "saos-network-facts", "version": "0.10.0", "translator": "translator 4.2.1 (mcp, https://...)"},
  "devices": [
    {
      "device": "PE1", "type": "5164", "platform": "cn5164", "extractor": "saos10",
      "templates": ["configs/PE1.cfg"], "status": "ok",
      "facts": {
        "hostname": "PE1",
        "interfaces": [{"name": "lb0", "kind": "loopback", "ip": "192.0.2.1/32", "isis": "CORE", "...": "..."}],
        "isis": {"instances": [{"name": "CORE", "level": "level-2", "net": "49.0001.1920.0000.2001.00", "area_id": "49.0001", "...": "..."}]},
        "segment_routing": {"srgb": [{"instance": "CORE", "lower": "16000", "upper": "23999"}],
                            "prefix_sids": [{"prefix": "192.0.2.1/32", "sid": "1", "value_type": "index", "node": true, "...": "..."}]},
        "...": "..."
      }
    }
  ],
  "links": [{"a": {"device": "PE1", "port": "1"}, "b": {"device": "PE2", "port": "1"}}]
}
```

`links` (since schema 1.5) is present only when `--clab` was given: the topology's links, as declared.

The full schema, with a description on every field, is
[`src/saos_network_facts/schema/facts-v1.schema.json`](src/saos_network_facts/schema/facts-v1.schema.json)
(also shipped in the npm package as `@ciena/saos-network-facts/schema`). Per device record:

| Field | |
|---|---|
| `device`, `type`, `platform` | the device name, its type as the inputs give it, the SAOS 10 translator platform |
| `extractor` | `saos6` (SAOS 6/8), `saos10`, or null |
| `templates` | its configuration files, in apply order |
| `status` | `ok`, `partial` (some SAOS 10 files failed), `error`, `skipped` (with `reason`) |
| `facts` | null unless `ok` / `partial` |

Facts (all devices): `hostname`, `interfaces`, `gateway`, `vlans`, `ports`, `lags`, `sub_ports`,
`rings` (G.8032 rings, since schema 1.5 with `ring_id`, `ports` and protection `instances`; see
[Rings](#rings)), `peers` (MPLS VCs, MPLS-TP tunnel ends, BGP neighbours with `route_reflector_client`;
what a SAOS 10 neighbour inherits from its `peer-group` is resolved into it; since schema 1.7 a BGP
neighbour carries its `vrf`, set for the CE neighbours of an L3VPN VRF),
`isis` (`instances` with `level`, `nets`, `net`, `area_id`, `system_id`, `sr_enabled` and, SAOS 10
since schema 1.6, `address_families`, `multi_topology`, `srv6_enabled`, `srv6_locators`; `interfaces`
with `level`, `type`, since schema 1.3 `metrics` (per level the narrow `metric` and `wide_metric`)
and, SAOS 10 since schema 1.6, `address_families`), `segment_routing` (`srgb`, `prefix_sids`,
`policies`, `segment_lists`; SAOS 10 since schema 1.6 `srv6.locators` and `flex_algorithms`, see
[SRv6, Flex-Algo and EVPN](#srv6-flex-algo-and-evpn)),
`bgp` (`instances` with `router_id`, `cluster_id`, `route_reflector` and, SAOS 10 since schema 1.7,
`srv6_locator` / `srv6_locators` per address family; BGP `peers` carry `peer_group` since schema
1.6), `pseudowires` (`peer`,
`pw_id`, labels, `mode`, `tunnel_type` and `tunnel_color` since schema 1.1, `service`,
`service_type`), `cfm` (`meps` with `md`, `ma`, `mep_id`, `level`, `direction`, `port`, `vlan` and,
since schema 1.4, `ccm_interval` as written, null when the MA leaves the default),
`lines`, `recognised`. SAOS 10 only: `fds`, `fps`,
`classifiers`, `vrfs`, `segments` (EVPN ethernet segments), `objects`, and since schema 1.2 `ospf`
(`instances` with `router_id`, `vrf` and `areas` with their `networks`; `interfaces` with `area`,
`type`, `metric`, timers, `passive`, `bfd`), `tp_corouted_tunnels` (each node's segment of a static
MPLS-TP co-routed tunnel: `source`, `destination`, `type` ingress / transit / egress, `role`,
`primary` of a backup, forward and reverse in / out labels, next / previous hop, LSP `bfd`) and
`l2vpn_services` (`fd`, `pseudowires`, `mtu`, `signaling_type`), since schema 1.6
`evpn_instances`, and since schema 1.7 `vrf_instances` and `static_routes` (see
[VRFs and static routes](#vrfs-and-static-routes)).

Values read from a configuration are text as written (`"mtu": "9000"`); flags the extractor derives
are booleans. Segment routing, BGP, OSPF and MPLS-TP tunnels are extracted from SAOS 10 only.

**Compatibility.** `schema_version` is semver. Within 1.x, new versions only add optional fields, so
a reader must ignore fields it does not know; a breaking change is schema 2.

### SRv6, Flex-Algo and EVPN

Since schema 1.6, SAOS 10 devices also carry their SRv6 locators, Flex-Algo definitions, the IS-IS
address families and the EVPN instances (all optional fields: older files stay valid):

```json
{
  "segment_routing": {
    "srv6": {"locators": [{"name": "LOC-ALGO128", "prefix": "2001:db8:f8:1::/64", "sid_type": "u-sid",
                           "algorithm": "128", "block_length": "32", "node_length": "16", "function_length": null,
                           "end_behavior": null, "instances": ["CORE"]}]},
    "flex_algorithms": [{"algorithm": "128", "metric_type": "latency", "advertise_definition": true, "priority": "200",
                         "admin_groups": {"include_any": [], "include_all": [], "exclude_any": ["SLOW"]}, "srlg_exclude": []}]
  },
  "isis": {"instances": [{"name": "CORE", "address_families": ["ipv6 unicast"], "multi_topology": true,
                          "srv6_enabled": true, "srv6_locators": ["LOC", "LOC-ALGO128"], "...": "..."}]},
  "evpn_instances": [{"evi": "200", "type": "vpws", "fd": "FD-VPWS-200", "fds": ["FD-VPWS-200"],
                      "local_service_id": "1", "remote_service_id": "2", "control_word": false,
                      "route_distinguisher": "192.0.2.1:200", "route_targets": [{"route_target": "0:64500:200", "type": "both"}],
                      "srv6_locator": "LOC-ALGO128", "sr_policy_color": null, "description": null}]
}
```

- A locator with no `instances` is advertised in every IS-IS instance; an instance's `srv6_locators`
  lists the locators it advertises and `srv6_enabled` is true when there is one.
- An IS-IS interface runs IPv4 unicast unless `ipv4-unicast-default-disable` is set, plus each
  `address-family` it configures; the instance's `address_families` is their union, so an IPv6-only
  IGP reads `["ipv6 unicast"]`.
- `evpn_instances[].type` is `vpls`, `vpws` or `fxc` (VLAN-aware flexible cross-connect); the two ends
  of an EVPN-VPWS share the EVI and mirror `local_service_id` / `remote_service_id`. VRFs (L3VPN) are
  in `vrf_instances` (schema 1.7, below).

### VRFs and static routes

Since schema 1.7, SAOS 10 devices also carry their VRFs and static routes (optional fields: older
files stay valid). A VRF merges the `vrf` list entry with what BGP (`bgp instance <as> vrf <name>`)
and MPLS label management say about it; existing objects are bound to it rather than repeated:
interfaces by their `vrf`, CE neighbours as BGP `peers` with `vrf` set, static routes by `vrf`.

```json
{
  "vrf_instances": [{"name": "CUST-A", "description": "L3VPN service A", "role": null, "bgp_as": "64500",
                     "route_distinguisher": "0:64500:1", "address_families": ["ipv4 unicast", "ipv6 unicast"],
                     "route_targets": [{"route_target": "0:64500:1", "type": "both", "address_family": null},
                                       {"route_target": "0:64500:6", "type": "import", "address_family": "ipv6 unicast"}],
                     "srv6_locators": {"ipv4 unicast": "LOC", "ipv6 unicast": "LOC-ALGO128"},
                     "srv6_locator_address": null, "srv6_sid_type": null, "sr_policy_color": null,
                     "label_allocation": {}, "redistribute": {}, "interfaces": ["CE-A"]}],
  "static_routes": [{"vrf": "CUST-A", "prefix": "198.51.100.128/25", "family": "ipv4", "next_hop": "198.51.100.1",
                     "interface": null, "preference": null, "tag": null, "description": "CE-A site LAN"}],
  "peers": [{"kind": "bgp", "name": "as64500", "ip": "198.51.100.1", "remote_as": "64510", "vrf": "CUST-A",
             "address_families": ["ipv4 unicast"], "route_reflector_client": false, "peer_group": null}]
}
```

- A route target with a null `address_family` applies to every address family of the VRF; `type` is
  `import`, `export` or `both`.
- `srv6_locators` gives, per VRF address family, the locator its L3 service SIDs (End.DT4 / End.DT6)
  come from: the address family's own, else the BGP instance's `vpnv4 unicast` / `vpnv6 unicast`
  locator, else the instance's `segment-routing srv6 locator` (the device's order of precedence). It
  is empty for a VRF that does not run over SRv6: an L3VPN over MPLS or SR-MPLS shows its VPN label
  mode in `label_allocation` (`{"ipv4": "per-vrf"}`), a management VRF has `role` `management`.
- `static_routes` holds one entry per next hop of each `rib vrf <name> ipv4|ipv6 <prefix>`; `vrf` is
  `default` for the global table, and a route through an interface alone (`Null0`) has a null
  `next_hop`.

### Rings

G.8032 Ethernet ring protection is read from SAOS 10 `g8032-rings` and from SAOS 6 / 8
`ring-protection logical-ring` / `virtual-ring`, into the same shape, one `rings[]` entry per ring the
device is on:

```json
{
  "name": "ring_2", "ring_id": "2", "west": "2", "east": "3",
  "ports": [{"name": "port0", "interface": "2", "hold_off": null}, {"name": "port1", "interface": "3", "hold_off": null}],
  "instances": [{
    "name": "erp_2", "raps_vid": "4089", "raps_level": "7", "type": "sub", "virtual_channel": false,
    "termination": null, "sub_ring_of": "ring_1",
    "rpl": [{"port": "port1", "interface": "3", "role": "owner"}],
    "members": ["ring_1-fd"], "timers": {"wtr": "1", "guard": null, "hold_off": null}, "revertive": null
  }]
}
```

- `west` / `east` are the ring ports: SAOS 6 / 8 `west-port` / `east-port`, SAOS 10 the interfaces of
  `port0` / `port1`; `ports` lists them under their configured names. Each gets the `ring` role in `ports`.
- `instances` are the protection instances on the ring (SAOS 10 `erp-instance`, SAOS 6 / 8 virtual
  ring): the R-APS channel (`raps_vid`, `raps_level`: the MEG / MD level), `type` `major` or `sub`
  (`virtual_channel` says whether a SAOS 10 sub-ring has one; SAOS 6 / 8 `termination` says which
  port a sub-ring terminates on, or `none` when it passes through), `rpl` (the RPL role per ring
  port: `owner`, `neighbor`, `next-neighbor`, or an explicit `none`), `members` (what it protects:
  SAOS 10 forwarding domains, SAOS 6 VLANs, SAOS 8 virtual switches), `timers` (`wtr` in minutes,
  `guard` and `hold_off` in milliseconds) and `revertive`.
- Everything is as configured: nothing is filled in from the device defaults, and null means the
  configuration does not say. The one derived field is `sub_ring_of`: on an interconnection node, a
  sub-ring instance whose ring shares a port with another ring of the device is attached to that ring.
- With `--clab`, the topology's `links` are written at the top level, so a reader can follow a ring
  from port to port without addresses (ring ports usually have none).

## Example

**[ciena.github.io/saos-network-facts](https://ciena.github.io/saos-network-facts/)** shows the
facts of a ten-device SAOS 10 lab (segment routing, SR policies, VPWS pseudowires, CFM, iBGP route
reflection, a G.8032 major ring and sub-ring) in the [viewer](viewer/): one plane per layer over
the topology, a panel per device and per service, packet walks and link-failure replays (a ring
link's with the R-APS protection switch and the revert after the repair). The site also stages the
`g8032-two-ring` fixture lab (a pure L2 ring lab, its links from the containerlab topology) and the
`g8032-by-name` fixture lab (a SAOS 10 CLI ring without ring ids, joined by name) and the
`srv6-evpn` fixture lab (an IPv6-only IS-IS core with SRv6 locators, Flex-Algo 128 and EVPN-VPLS /
EVPN-VPWS over SRv6): pick one in the page's lab menu or open
[`?lab=g8032-two-ring`](https://ciena.github.io/saos-network-facts/?lab=g8032-two-ring),
[`?lab=g8032-by-name`](https://ciena.github.io/saos-network-facts/?lab=g8032-by-name) or
[`?lab=srv6-evpn`](https://ciena.github.io/saos-network-facts/?lab=srv6-evpn).
*Load your facts.json* there to see your own network; the file stays in your browser.

![The Adaptive-SR-CFM example in the viewer](docs/example.png)

The example lives in [`examples/adaptive-sr-cfm/`](examples/adaptive-sr-cfm/): the rendered
startup configurations, the platform map and the facts file. To regenerate the facts and the site
from the committed configurations ([SOURCE.md](examples/adaptive-sr-cfm/SOURCE.md) has the details):

```bash
cd examples/adaptive-sr-cfm
saos-network-facts extract --configs configs --platform-map devices.yaml --recipe Adaptive-SR-CFM -o facts.json
cd ../../viewer && npm ci && npm run build      # the site, in dist/
```

The build stages `labs/index.json` beside the page with the example (the default lab) and the
`g8032-two-ring`, `g8032-by-name` and `srv6-evpn` fixture labs, from `viewer/labs.config.js`; the page opens that index as any staged
site would (below).

The site is built by `.github/workflows/pages.yml`, which deploys `main` to the `gh-pages` branch
that GitHub Pages serves. Every pull request gets a live preview of its own at
`https://ciena.github.io/saos-network-facts/pr-preview/pr-<N>/`, linked from a comment on the PR
(`.github/workflows/pr-preview.yml`); a pull request from a fork gets the built site as the
`site-preview` artifact of its run instead. [CONTRIBUTING.md](CONTRIBUTING.md#previewing-the-site)
has the details.

## Use the viewer in your repo

Every release carries the built viewer, `saos-network-facts-viewer-X.Y.Z.tgz`: a static site
(`index.html`, `assets/`) with relative paths, so it runs from any directory of any web server,
private GitHub Pages included. Put your facts files beside it and point the page at them:

| URL | Opens |
|---|---|
| `index.html?facts=facts.json` | that facts file (relative to the page) |
| `index.html?facts=facts.json&positions=positions.json` | the same, with authored node positions |
| `index.html?labs=labs/index.json` | the default lab of a lab index, with a picker for the others |
| `index.html?labs=labs/index.json&lab=core` | lab `core` of that index |
| `index.html?lab=core` | lab `core` of `labs/index.json` beside the page |
| `index.html` | the default lab of `labs/index.json` beside the page when the site stages one, else the bundled example; *Load your facts.json* still opens a local file |

A lab index lists facts files (URLs relative to the index). Its default lab, the one `?labs=` and a
bare `index.html` open, is the lab marked `"default": true`, else the one the index's top-level
`"default"` names by id, else the first:

```json
{
  "labs": [
    {"id": "core", "title": "Core lab", "facts": "core/facts.json", "positions": "core/positions.json", "default": true},
    {"id": "metro", "title": "Metro ring", "facts": "metro/facts.json"}
  ]
}
```

Positions are optional: `{"positions": {"PE1": [100, 300], "P1": [300, 150], ...}}`, diagram
coordinates in any unit with y down, one per device (else the view lays the topology out itself).
In CI, for example a GitHub Pages workflow:

```yaml
      - name: Stage the viewer with our facts
        env:
          GH_TOKEN: ${{ github.token }}
        run: |
          mkdir -p site
          gh release download v0.7.0 --repo ciena/saos-network-facts \
            --pattern 'saos-network-facts-viewer-*.tgz' --output viewer.tgz
          tar -xzf viewer.tgz -C site
          mkdir -p site/labs && cp -r facts/* site/labs/    # facts files, positions and labs/index.json
      - uses: actions/upload-pages-artifact@v3
        with:
          path: site
```

Then link to `.../index.html` (it opens the index's default lab) or `.../index.html?lab=<id>`. The
page fetches the facts from the same site, so they stay as private as the site that serves them.

## Reading facts from JavaScript / TypeScript

```ts
import { readFacts } from "@ciena/saos-network-facts/node";
import { ccmIntervalMs, devicesByName, interfacesOnPort, isisArea, isisMetric, ringsOf, ringMembers } from "@ciena/saos-network-facts";

const facts = readFacts("facts.json");          // schema 1.x (or a pre-schema bare list)
const pe1 = devicesByName(facts).get("PE1")!;
interfacesOnPort(pe1, "1");                     // [{ name: "PE1-PE2", ip: "198.51.100.0/31", vlan: null, isis: "CORE", lag: null }]
isisArea(pe1.isis.instances[0]!);               // "49.0001"
isisMetric(pe1, "PE1-PE2", 2);                  // 100: the level-2 wide metric, else the narrow one, else null
ccmIntervalMs(pe1.cfm.meps[0]!);                // 10: the MA's CCM interval ("10ms", "1s", "1sec", "3.3ms", an 802.1Q index) in ms, else null
ringsOf(pe1);                                   // the device's G.8032 rings with their ports and instances ([] here)
ringMembers(facts, 1);                          // [{ device, ring }] for every device on ring id 1
```

The main entry point has no Node dependencies (`parseFacts(json)` for browsers); see [`js/`](js/).

## Development

See [CONTRIBUTING.md](CONTRIBUTING.md). In short: `pip install -e '.[dev]'`, `ruff check .`,
`pytest`; in `js/`: `npm ci`, `npm test`. Tests never call a translator: SAOS 10 replies are
recorded in `tests/fixtures/pivots.json`.

## License

[Apache-2.0](LICENSE). Copyright 2026 Ciena Corporation; see [NOTICE](NOTICE).
