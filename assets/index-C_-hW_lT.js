(function(){let e=document.createElement(`link`).relList;if(e&&e.supports&&e.supports(`modulepreload`))return;for(let e of document.querySelectorAll(`link[rel="modulepreload"]`))n(e);new MutationObserver(e=>{for(let t of e)if(t.type===`childList`)for(let e of t.addedNodes)e.tagName===`LINK`&&e.rel===`modulepreload`&&n(e)}).observe(document,{childList:!0,subtree:!0});function t(e){let t={};return e.integrity&&(t.integrity=e.integrity),e.referrerPolicy&&(t.referrerPolicy=e.referrerPolicy),t.credentials=e.crossOrigin===`use-credentials`?`include`:e.crossOrigin===`anonymous`?`omit`:`same-origin`,t}function n(e){if(e.ep)return;e.ep=!0;let n=t(e);fetch(e.href,n)}})();var e=`{
  "devices": [
    {
      "device": "CE1",
      "extractor": "saos10",
      "facts": {
        "bgp": {
          "instances": []
        },
        "cfm": {
          "meps": []
        },
        "classifiers": {
          "if1": []
        },
        "evpn_instances": [],
        "fds": [
          {
            "mode": "vpls",
            "name": "if1"
          }
        ],
        "fps": [
          {
            "classifiers": [
              "if1"
            ],
            "fd": "if1",
            "logical_port": "1",
            "name": "if1"
          }
        ],
        "gateway": null,
        "hostname": "CE1",
        "interfaces": [
          {
            "description": null,
            "fd": null,
            "ip": "10.40.40.1/32",
            "ipv4": [
              "10.40.40.1/32"
            ],
            "ipv6": [],
            "kind": "loopback",
            "mtu": "1500",
            "name": "lb1",
            "vlan": null,
            "vrf": null,
            "vs": null
          },
          {
            "description": null,
            "fd": "if1",
            "ip": "172.20.10.2/30",
            "ipv4": [
              "172.20.10.2/30"
            ],
            "ipv6": [],
            "kind": "ip",
            "mtu": "1500",
            "name": "if1",
            "vlan": null,
            "vrf": "default",
            "vs": null
          }
        ],
        "isis": {
          "instances": [],
          "interfaces": []
        },
        "l2vpn_services": [],
        "lags": [],
        "lines": 6,
        "objects": 6,
        "ospf": {
          "instances": [],
          "interfaces": []
        },
        "peers": [],
        "ports": {
          "1": {
            "description": null,
            "lag": null,
            "roles": [
              "fp"
            ],
            "vlans": []
          }
        },
        "pseudowires": [],
        "recognised": 6,
        "rings": [],
        "segment_routing": {
          "flex_algorithms": [],
          "policies": [],
          "prefix_sids": [],
          "segment_lists": {},
          "srgb": [],
          "srv6": {
            "locators": []
          }
        },
        "segments": [],
        "static_routes": [
          {
            "description": null,
            "family": "ipv4",
            "interface": null,
            "next_hop": "172.20.20.1",
            "preference": null,
            "prefix": "10.40.40.0/24",
            "tag": null,
            "vrf": "default"
          }
        ],
        "sub_ports": [],
        "tp_corouted_tunnels": [],
        "vlans": {},
        "vrf_instances": [],
        "vrfs": []
      },
      "platform": "cn3984",
      "recipe": "Adaptive-SR-CFM",
      "status": "ok",
      "templates": [
        "CE1/01-CE_create.xml"
      ],
      "type": "3984-10x"
    },
    {
      "device": "P2",
      "extractor": "saos10",
      "facts": {
        "bgp": {
          "instances": []
        },
        "cfm": {
          "meps": []
        },
        "classifiers": {
          "Untagged": [],
          "if1": [],
          "if2": [],
          "if3": [],
          "if4": [],
          "ring-vlan-100": [
            "100"
          ]
        },
        "evpn_instances": [],
        "fds": [
          {
            "mode": "vpls",
            "name": "if1"
          },
          {
            "mode": "vpls",
            "name": "if2"
          },
          {
            "mode": "vpls",
            "name": "if3"
          },
          {
            "mode": "vpls",
            "name": "if4"
          },
          {
            "mode": "vpls",
            "name": "ring-data"
          }
        ],
        "fps": [
          {
            "classifiers": [
              "if1"
            ],
            "fd": "if1",
            "logical_port": "1",
            "name": "if1"
          },
          {
            "classifiers": [
              "if2"
            ],
            "fd": "if2",
            "logical_port": "2",
            "name": "if2"
          },
          {
            "classifiers": [
              "if3"
            ],
            "fd": "if3",
            "logical_port": "3",
            "name": "if3"
          },
          {
            "classifiers": [
              "if4"
            ],
            "fd": "if4",
            "logical_port": "4",
            "name": "if4"
          },
          {
            "classifiers": [
              "ring-vlan-100"
            ],
            "fd": "ring-data",
            "logical_port": "1",
            "name": "ring-data_1"
          },
          {
            "classifiers": [
              "ring-vlan-100"
            ],
            "fd": "ring-data",
            "logical_port": "3",
            "name": "ring-data_3"
          },
          {
            "classifiers": [
              "ring-vlan-100"
            ],
            "fd": "ring-data",
            "logical_port": "4",
            "name": "ring-data_4"
          }
        ],
        "gateway": null,
        "hostname": "P2",
        "interfaces": [
          {
            "description": null,
            "fd": null,
            "ip": "10.255.10.2/32",
            "ipv4": [
              "10.255.10.2/32"
            ],
            "ipv6": [],
            "isis": "Interop",
            "kind": "loopback",
            "mtu": "1500",
            "name": "lb1",
            "vlan": null,
            "vrf": null,
            "vs": null
          },
          {
            "description": null,
            "fd": "if1",
            "ip": "172.30.10.2/30",
            "ipv4": [
              "172.30.10.2/30"
            ],
            "ipv6": [],
            "isis": "Interop",
            "kind": "ip",
            "mtu": "1500",
            "name": "if1",
            "vlan": null,
            "vrf": "default",
            "vs": null
          },
          {
            "description": null,
            "fd": "if2",
            "ip": "172.30.10.9/30",
            "ipv4": [
              "172.30.10.9/30"
            ],
            "ipv6": [],
            "isis": "Interop",
            "kind": "ip",
            "mtu": "1500",
            "name": "if2",
            "vlan": null,
            "vrf": "default",
            "vs": null
          },
          {
            "description": null,
            "fd": "if3",
            "ip": "172.30.10.13/30",
            "ipv4": [
              "172.30.10.13/30"
            ],
            "ipv6": [],
            "isis": "Interop",
            "kind": "ip",
            "mtu": "1500",
            "name": "if3",
            "vlan": null,
            "vrf": "default",
            "vs": null
          },
          {
            "description": null,
            "fd": "if4",
            "ip": "172.30.10.21/30",
            "ipv4": [
              "172.30.10.21/30"
            ],
            "ipv6": [],
            "isis": "Interop",
            "kind": "ip",
            "mtu": "1500",
            "name": "if4",
            "vlan": null,
            "vrf": "default",
            "vs": null
          }
        ],
        "isis": {
          "instances": [
            {
              "address_families": [
                "ipv4 unicast"
              ],
              "area": "49.0001.0102.5501.0002.00",
              "area_id": "49.0001",
              "level": "level-1",
              "multi_topology": null,
              "name": "Interop",
              "net": "49.0001.0102.5501.0002.00",
              "nets": [
                "49.0001.0102.5501.0002.00"
              ],
              "sr_enabled": true,
              "srv6_enabled": false,
              "srv6_locators": [],
              "system_id": "0102.5501.0002"
            }
          ],
          "interfaces": [
            {
              "address_families": [
                "ipv4 unicast"
              ],
              "instance": "Interop",
              "interface": "lb1",
              "level": null,
              "metrics": [],
              "type": "point-to-point"
            },
            {
              "address_families": [
                "ipv4 unicast"
              ],
              "instance": "Interop",
              "interface": "if1",
              "level": "level-1",
              "metrics": [],
              "type": "point-to-point"
            },
            {
              "address_families": [
                "ipv4 unicast"
              ],
              "instance": "Interop",
              "interface": "if2",
              "level": "level-1",
              "metrics": [],
              "type": "point-to-point"
            },
            {
              "address_families": [
                "ipv4 unicast"
              ],
              "instance": "Interop",
              "interface": "if3",
              "level": "level-1",
              "metrics": [],
              "type": "point-to-point"
            },
            {
              "address_families": [
                "ipv4 unicast"
              ],
              "instance": "Interop",
              "interface": "if4",
              "level": "level-1",
              "metrics": [],
              "type": "point-to-point"
            }
          ]
        },
        "l2vpn_services": [],
        "lags": [],
        "lines": 16,
        "objects": 16,
        "ospf": {
          "instances": [],
          "interfaces": []
        },
        "peers": [],
        "ports": {
          "1": {
            "description": null,
            "lag": null,
            "roles": [
              "ring",
              "fp"
            ],
            "vlans": [
              "100"
            ]
          },
          "2": {
            "description": null,
            "lag": null,
            "roles": [
              "fp"
            ],
            "vlans": []
          },
          "3": {
            "description": null,
            "lag": null,
            "roles": [
              "ring",
              "fp"
            ],
            "vlans": [
              "100"
            ]
          },
          "4": {
            "description": null,
            "lag": null,
            "roles": [
              "ring",
              "fp"
            ],
            "vlans": [
              "100"
            ]
          }
        },
        "pseudowires": [],
        "recognised": 13,
        "rings": [
          {
            "east": "3",
            "instances": [
              {
                "members": [
                  "ring-data"
                ],
                "name": "erp-core",
                "raps_level": "7",
                "raps_vid": "4094",
                "revertive": true,
                "rpl": [
                  {
                    "interface": "1",
                    "port": "port0",
                    "role": "none"
                  },
                  {
                    "interface": "3",
                    "port": "port1",
                    "role": "none"
                  }
                ],
                "sub_ring_of": null,
                "termination": null,
                "timers": {
                  "guard": "500",
                  "hold_off": null,
                  "wtr": "1"
                },
                "type": "major",
                "virtual_channel": null
              }
            ],
            "name": "ring-core",
            "ports": [
              {
                "hold_off": null,
                "interface": "1",
                "name": "port0"
              },
              {
                "hold_off": null,
                "interface": "3",
                "name": "port1"
              }
            ],
            "ring_id": "1",
            "west": "1"
          },
          {
            "east": "4",
            "instances": [
              {
                "members": [
                  "ring-data"
                ],
                "name": "erp-access",
                "raps_level": "7",
                "raps_vid": "4093",
                "revertive": null,
                "rpl": [
                  {
                    "interface": "4",
                    "port": "port1",
                    "role": "none"
                  }
                ],
                "sub_ring_of": "ring-core",
                "termination": null,
                "timers": {
                  "guard": null,
                  "hold_off": null,
                  "wtr": "1"
                },
                "type": "sub",
                "virtual_channel": false
              }
            ],
            "name": "ring-access",
            "ports": [
              {
                "hold_off": null,
                "interface": "3",
                "name": "port0"
              },
              {
                "hold_off": null,
                "interface": "4",
                "name": "port1"
              }
            ],
            "ring_id": "2",
            "west": "3"
          }
        ],
        "segment_routing": {
          "flex_algorithms": [],
          "policies": [],
          "prefix_sids": [
            {
              "interface": "lb1",
              "node": true,
              "prefix": "10.255.10.2/32",
              "sid": "2",
              "value_type": "index"
            }
          ],
          "segment_lists": {},
          "srgb": [
            {
              "instance": "Interop",
              "lower": "16000",
              "upper": "17000"
            }
          ],
          "srv6": {
            "locators": []
          }
        },
        "segments": [],
        "static_routes": [],
        "sub_ports": [],
        "tp_corouted_tunnels": [],
        "vlans": {
          "100": {
            "ports": [
              "1",
              "3",
              "4"
            ]
          }
        },
        "vrf_instances": [],
        "vrfs": []
      },
      "platform": "cn5166",
      "recipe": "Adaptive-SR-CFM",
      "status": "ok",
      "templates": [
        "P2/01-P_createldp.xml",
        "P2/02-P_advertisemapping.xml",
        "P2/03-G8032_ringCreate.xml"
      ],
      "type": "5166-10x"
    },
    {
      "device": "P3",
      "extractor": "saos10",
      "facts": {
        "bgp": {
          "instances": []
        },
        "cfm": {
          "meps": [
            {
              "ccm_interval": "1s",
              "direction": "up",
              "interface": "testcfm_1",
              "level": null,
              "ma": "testcfm",
              "md": "md3",
              "mep_id": "22",
              "port": "1",
              "service": "testcfm",
              "vlan": null
            }
          ]
        },
        "classifiers": {
          "Untagged": [],
          "if1": [],
          "if2": [],
          "if3": [],
          "ring-vlan-100": [
            "100"
          ]
        },
        "evpn_instances": [],
        "fds": [
          {
            "mode": "vpls",
            "name": "if1"
          },
          {
            "mode": "vpls",
            "name": "if2"
          },
          {
            "mode": "vpls",
            "name": "if3"
          },
          {
            "mode": "vpws",
            "name": "testcfm"
          },
          {
            "mode": "vpws",
            "name": "testsat"
          },
          {
            "mode": "vpls",
            "name": "ring-data"
          }
        ],
        "fps": [
          {
            "classifiers": [
              "if1"
            ],
            "fd": "if1",
            "logical_port": "21",
            "name": "if1"
          },
          {
            "classifiers": [
              "if2"
            ],
            "fd": "if2",
            "logical_port": "22",
            "name": "if2"
          },
          {
            "classifiers": [
              "if3"
            ],
            "fd": "if3",
            "logical_port": "23",
            "name": "if3"
          },
          {
            "classifiers": [
              "Untagged"
            ],
            "fd": "testcfm",
            "logical_port": "1",
            "name": "testcfm_1"
          },
          {
            "classifiers": [
              "Untagged"
            ],
            "fd": "testsat",
            "logical_port": "24",
            "name": "testsat_1"
          },
          {
            "classifiers": [
              "ring-vlan-100"
            ],
            "fd": "ring-data",
            "logical_port": "23",
            "name": "ring-data_23"
          },
          {
            "classifiers": [
              "ring-vlan-100"
            ],
            "fd": "ring-data",
            "logical_port": "21",
            "name": "ring-data_21"
          }
        ],
        "gateway": null,
        "hostname": "P3",
        "interfaces": [
          {
            "description": null,
            "fd": null,
            "ip": "10.255.10.3/32",
            "ipv4": [
              "10.255.10.3/32"
            ],
            "ipv6": [],
            "isis": "Interop",
            "kind": "loopback",
            "mtu": "1500",
            "name": "lb1",
            "vlan": null,
            "vrf": null,
            "vs": null
          },
          {
            "description": null,
            "fd": "if1",
            "ip": "172.30.10.6/30",
            "ipv4": [
              "172.30.10.6/30"
            ],
            "ipv6": [],
            "isis": "Interop",
            "kind": "ip",
            "mtu": "1500",
            "name": "if1",
            "vlan": null,
            "vrf": "default",
            "vs": null
          },
          {
            "description": null,
            "fd": "if2",
            "ip": "172.30.10.10/30",
            "ipv4": [
              "172.30.10.10/30"
            ],
            "ipv6": [],
            "isis": "Interop",
            "kind": "ip",
            "mtu": "1500",
            "name": "if2",
            "vlan": null,
            "vrf": "default",
            "vs": null
          },
          {
            "description": null,
            "fd": "if3",
            "ip": "172.30.10.17/30",
            "ipv4": [
              "172.30.10.17/30"
            ],
            "ipv6": [],
            "isis": "Interop",
            "kind": "ip",
            "mtu": "1500",
            "name": "if3",
            "vlan": null,
            "vrf": "default",
            "vs": null
          }
        ],
        "isis": {
          "instances": [
            {
              "address_families": [
                "ipv4 unicast"
              ],
              "area": "49.0001.0102.5501.0003.00",
              "area_id": "49.0001",
              "level": "level-1",
              "multi_topology": null,
              "name": "Interop",
              "net": "49.0001.0102.5501.0003.00",
              "nets": [
                "49.0001.0102.5501.0003.00"
              ],
              "sr_enabled": true,
              "srv6_enabled": false,
              "srv6_locators": [],
              "system_id": "0102.5501.0003"
            }
          ],
          "interfaces": [
            {
              "address_families": [
                "ipv4 unicast"
              ],
              "instance": "Interop",
              "interface": "lb1",
              "level": null,
              "metrics": [],
              "type": "point-to-point"
            },
            {
              "address_families": [
                "ipv4 unicast"
              ],
              "instance": "Interop",
              "interface": "if1",
              "level": "level-1",
              "metrics": [],
              "type": "point-to-point"
            },
            {
              "address_families": [
                "ipv4 unicast"
              ],
              "instance": "Interop",
              "interface": "if2",
              "level": "level-1",
              "metrics": [],
              "type": "point-to-point"
            },
            {
              "address_families": [
                "ipv4 unicast"
              ],
              "instance": "Interop",
              "interface": "if3",
              "level": "level-1",
              "metrics": [],
              "type": "point-to-point"
            }
          ]
        },
        "l2vpn_services": [
          {
            "fd": "testsat",
            "mtu": null,
            "name": "testsat",
            "pseudowires": [
              "testsat"
            ],
            "signaling_type": "ldp"
          },
          {
            "fd": "testcfm",
            "mtu": null,
            "name": "testcfm",
            "pseudowires": [
              "testcfm"
            ],
            "signaling_type": "ldp"
          }
        ],
        "lags": [],
        "lines": 28,
        "objects": 28,
        "ospf": {
          "instances": [],
          "interfaces": []
        },
        "peers": [],
        "ports": {
          "1": {
            "description": null,
            "lag": null,
            "roles": [
              "fp",
              "cfm-mep"
            ],
            "vlans": []
          },
          "21": {
            "description": null,
            "lag": null,
            "roles": [
              "ring",
              "fp"
            ],
            "vlans": [
              "100"
            ]
          },
          "22": {
            "description": null,
            "lag": null,
            "roles": [
              "fp"
            ],
            "vlans": []
          },
          "23": {
            "description": null,
            "lag": null,
            "roles": [
              "ring",
              "fp"
            ],
            "vlans": [
              "100"
            ]
          },
          "24": {
            "description": null,
            "lag": null,
            "roles": [
              "fp"
            ],
            "vlans": []
          }
        },
        "pseudowires": [
          {
            "in_label": null,
            "kind": "configured",
            "mode": "spoke",
            "name": "testsat",
            "out_label": null,
            "peer": "10.255.10.4",
            "pw_id": "200",
            "service": "testsat",
            "service_type": "vpws",
            "tunnel": null,
            "tunnel_color": null,
            "tunnel_type": null
          },
          {
            "in_label": null,
            "kind": "configured",
            "mode": "spoke",
            "name": "testcfm",
            "out_label": null,
            "peer": "10.255.10.6",
            "pw_id": "100",
            "service": "testcfm",
            "service_type": "vpws",
            "tunnel": null,
            "tunnel_color": "2",
            "tunnel_type": "sr-policy"
          }
        ],
        "recognised": 19,
        "rings": [
          {
            "east": "21",
            "instances": [
              {
                "members": [
                  "ring-data"
                ],
                "name": "erp-core",
                "raps_level": "7",
                "raps_vid": "4094",
                "revertive": true,
                "rpl": [
                  {
                    "interface": "23",
                    "port": "port0",
                    "role": "owner"
                  },
                  {
                    "interface": "21",
                    "port": "port1",
                    "role": "none"
                  }
                ],
                "sub_ring_of": null,
                "termination": null,
                "timers": {
                  "guard": "500",
                  "hold_off": null,
                  "wtr": "1"
                },
                "type": "major",
                "virtual_channel": null
              }
            ],
            "name": "ring-core",
            "ports": [
              {
                "hold_off": null,
                "interface": "23",
                "name": "port0"
              },
              {
                "hold_off": null,
                "interface": "21",
                "name": "port1"
              }
            ],
            "ring_id": "1",
            "west": "23"
          }
        ],
        "segment_routing": {
          "flex_algorithms": [],
          "policies": [
            {
              "candidate_paths": [
                {
                  "discriminator": "1",
                  "flex_algorithm": null,
                  "origin": "local",
                  "originator": "10.255.10.3",
                  "preference": "100",
                  "segment_lists": [
                    "PE3_PE6"
                  ]
                }
              ],
              "color": "2",
              "endpoint": "10.255.10.6",
              "name": "SR3to6color2",
              "source": "10.255.10.3"
            }
          ],
          "prefix_sids": [
            {
              "interface": "lb1",
              "node": true,
              "prefix": "10.255.10.3/32",
              "sid": "3",
              "value_type": "index"
            }
          ],
          "segment_lists": {
            "PE3_PE6": [
              "16004",
              "16006"
            ]
          },
          "srgb": [
            {
              "instance": "Interop",
              "lower": "16000",
              "upper": "17000"
            }
          ],
          "srv6": {
            "locators": []
          }
        },
        "segments": [],
        "static_routes": [],
        "sub_ports": [],
        "tp_corouted_tunnels": [],
        "vlans": {
          "100": {
            "ports": [
              "23",
              "21"
            ]
          }
        },
        "vrf_instances": [],
        "vrfs": []
      },
      "platform": "cn5144",
      "recipe": "Adaptive-SR-CFM",
      "status": "ok",
      "templates": [
        "P3/01-P_createldp.xml",
        "P3/02-P_advertisemapping.xml",
        "P3/03-PE1_SR_Policies.xml",
        "P3/04-P_servicesCreate.xml",
        "P3/05-P_l2vpnCreate.xml",
        "P3/06-P_cfmCreate.xml",
        "P3/07-P_satCreateall.xml",
        "P3/08-G8032_ringCreate.xml"
      ],
      "type": "5144-10x"
    },
    {
      "device": "P7",
      "extractor": "saos10",
      "facts": {
        "bgp": {
          "instances": []
        },
        "cfm": {
          "meps": []
        },
        "classifiers": {
          "Untagged": [],
          "if1": [],
          "if2": [],
          "if3": []
        },
        "evpn_instances": [],
        "fds": [
          {
            "mode": "vpls",
            "name": "if1"
          },
          {
            "mode": "vpls",
            "name": "if2"
          },
          {
            "mode": "vpls",
            "name": "if3"
          }
        ],
        "fps": [
          {
            "classifiers": [
              "if1"
            ],
            "fd": "if1",
            "logical_port": "1",
            "name": "if1"
          },
          {
            "classifiers": [
              "if2"
            ],
            "fd": "if2",
            "logical_port": "2",
            "name": "if2"
          },
          {
            "classifiers": [
              "if3"
            ],
            "fd": "if3",
            "logical_port": "3",
            "name": "if3"
          }
        ],
        "gateway": null,
        "hostname": "P7",
        "interfaces": [
          {
            "description": null,
            "fd": null,
            "ip": "10.255.10.7/32",
            "ipv4": [
              "10.255.10.7/32"
            ],
            "ipv6": [],
            "isis": "Interop",
            "kind": "loopback",
            "mtu": "1500",
            "name": "lb1",
            "vlan": null,
            "vrf": null,
            "vs": null
          },
          {
            "description": null,
            "fd": "if1",
            "ip": "172.30.10.34/30",
            "ipv4": [
              "172.30.10.34/30"
            ],
            "ipv6": [],
            "isis": "Interop",
            "kind": "ip",
            "mtu": "1500",
            "name": "if1",
            "vlan": null,
            "vrf": "default",
            "vs": null
          },
          {
            "description": null,
            "fd": "if2",
            "ip": "172.30.10.41/30",
            "ipv4": [
              "172.30.10.41/30"
            ],
            "ipv6": [],
            "isis": "Interop",
            "kind": "ip",
            "mtu": "1500",
            "name": "if2",
            "vlan": null,
            "vrf": "default",
            "vs": null
          },
          {
            "description": null,
            "fd": "if3",
            "ip": "172.30.10.45/30",
            "ipv4": [
              "172.30.10.45/30"
            ],
            "ipv6": [],
            "isis": "Interop",
            "kind": "ip",
            "mtu": "1500",
            "name": "if3",
            "vlan": null,
            "vrf": "default",
            "vs": null
          }
        ],
        "isis": {
          "instances": [
            {
              "address_families": [
                "ipv4 unicast"
              ],
              "area": "49.0001.0102.5501.0007.00",
              "area_id": "49.0001",
              "level": "level-1",
              "multi_topology": null,
              "name": "Interop",
              "net": "49.0001.0102.5501.0007.00",
              "nets": [
                "49.0001.0102.5501.0007.00"
              ],
              "sr_enabled": true,
              "srv6_enabled": false,
              "srv6_locators": [],
              "system_id": "0102.5501.0007"
            }
          ],
          "interfaces": [
            {
              "address_families": [
                "ipv4 unicast"
              ],
              "instance": "Interop",
              "interface": "lb1",
              "level": null,
              "metrics": [],
              "type": "point-to-point"
            },
            {
              "address_families": [
                "ipv4 unicast"
              ],
              "instance": "Interop",
              "interface": "if1",
              "level": "level-1",
              "metrics": [],
              "type": "point-to-point"
            },
            {
              "address_families": [
                "ipv4 unicast"
              ],
              "instance": "Interop",
              "interface": "if2",
              "level": "level-1",
              "metrics": [],
              "type": "point-to-point"
            },
            {
              "address_families": [
                "ipv4 unicast"
              ],
              "instance": "Interop",
              "interface": "if3",
              "level": "level-1",
              "metrics": [],
              "type": "point-to-point"
            }
          ]
        },
        "l2vpn_services": [],
        "lags": [],
        "lines": 12,
        "objects": 12,
        "ospf": {
          "instances": [],
          "interfaces": []
        },
        "peers": [],
        "ports": {
          "1": {
            "description": null,
            "lag": null,
            "roles": [
              "fp"
            ],
            "vlans": []
          },
          "2": {
            "description": null,
            "lag": null,
            "roles": [
              "fp"
            ],
            "vlans": []
          },
          "3": {
            "description": null,
            "lag": null,
            "roles": [
              "fp"
            ],
            "vlans": []
          }
        },
        "pseudowires": [],
        "recognised": 9,
        "rings": [],
        "segment_routing": {
          "flex_algorithms": [],
          "policies": [],
          "prefix_sids": [
            {
              "interface": "lb1",
              "node": true,
              "prefix": "10.255.10.7/32",
              "sid": "7",
              "value_type": "index"
            }
          ],
          "segment_lists": {},
          "srgb": [
            {
              "instance": "Interop",
              "lower": "16000",
              "upper": "17000"
            }
          ],
          "srv6": {
            "locators": []
          }
        },
        "segments": [],
        "static_routes": [],
        "sub_ports": [],
        "tp_corouted_tunnels": [],
        "vlans": {},
        "vrf_instances": [],
        "vrfs": []
      },
      "platform": "cn5171",
      "recipe": "Adaptive-SR-CFM",
      "status": "ok",
      "templates": [
        "P7/01-P_createldp.xml",
        "P7/02-P_advertisemapping.xml"
      ],
      "type": "5171-10x"
    },
    {
      "device": "P8",
      "extractor": "saos10",
      "facts": {
        "bgp": {
          "instances": [
            {
              "as": "65000",
              "cluster_id": null,
              "route_reflector": false,
              "router_id": "10.255.10.8",
              "srv6_locator": null,
              "srv6_locators": {}
            }
          ]
        },
        "cfm": {
          "meps": []
        },
        "classifiers": {
          "Untagged": [],
          "if1": [],
          "if2": [],
          "if3": []
        },
        "evpn_instances": [],
        "fds": [
          {
            "mode": "vpls",
            "name": "if1"
          },
          {
            "mode": "vpls",
            "name": "if2"
          },
          {
            "mode": "vpls",
            "name": "if3"
          }
        ],
        "fps": [
          {
            "classifiers": [
              "if1"
            ],
            "fd": "if1",
            "logical_port": "1",
            "name": "if1"
          },
          {
            "classifiers": [
              "if2"
            ],
            "fd": "if2",
            "logical_port": "2",
            "name": "if2"
          },
          {
            "classifiers": [
              "if3"
            ],
            "fd": "if3",
            "logical_port": "3",
            "name": "if3"
          }
        ],
        "gateway": null,
        "hostname": "P8",
        "interfaces": [
          {
            "description": null,
            "fd": null,
            "ip": "10.255.10.8/32",
            "ipv4": [
              "10.255.10.8/32"
            ],
            "ipv6": [],
            "isis": "Interop",
            "kind": "loopback",
            "mtu": "1500",
            "name": "lb1",
            "vlan": null,
            "vrf": null,
            "vs": null
          },
          {
            "description": null,
            "fd": "if1",
            "ip": "172.30.10.38/30",
            "ipv4": [
              "172.30.10.38/30"
            ],
            "ipv6": [],
            "isis": "Interop",
            "kind": "ip",
            "mtu": "1500",
            "name": "if1",
            "vlan": null,
            "vrf": "default",
            "vs": null
          },
          {
            "description": null,
            "fd": "if2",
            "ip": "172.30.10.42/30",
            "ipv4": [
              "172.30.10.42/30"
            ],
            "ipv6": [],
            "isis": "Interop",
            "kind": "ip",
            "mtu": "1500",
            "name": "if2",
            "vlan": null,
            "vrf": "default",
            "vs": null
          },
          {
            "description": null,
            "fd": "if3",
            "ip": "172.30.10.49/30",
            "ipv4": [
              "172.30.10.49/30"
            ],
            "ipv6": [],
            "isis": "Interop",
            "kind": "ip",
            "mtu": "1500",
            "name": "if3",
            "vlan": null,
            "vrf": "default",
            "vs": null
          }
        ],
        "isis": {
          "instances": [
            {
              "address_families": [
                "ipv4 unicast"
              ],
              "area": "49.0001.0102.5501.0008.00",
              "area_id": "49.0001",
              "level": "level-1",
              "multi_topology": null,
              "name": "Interop",
              "net": "49.0001.0102.5501.0008.00",
              "nets": [
                "49.0001.0102.5501.0008.00"
              ],
              "sr_enabled": true,
              "srv6_enabled": false,
              "srv6_locators": [],
              "system_id": "0102.5501.0008"
            }
          ],
          "interfaces": [
            {
              "address_families": [
                "ipv4 unicast"
              ],
              "instance": "Interop",
              "interface": "lb1",
              "level": null,
              "metrics": [],
              "type": "point-to-point"
            },
            {
              "address_families": [
                "ipv4 unicast"
              ],
              "instance": "Interop",
              "interface": "if1",
              "level": "level-1",
              "metrics": [],
              "type": "point-to-point"
            },
            {
              "address_families": [
                "ipv4 unicast"
              ],
              "instance": "Interop",
              "interface": "if2",
              "level": "level-1",
              "metrics": [],
              "type": "point-to-point"
            },
            {
              "address_families": [
                "ipv4 unicast"
              ],
              "instance": "Interop",
              "interface": "if3",
              "level": "level-1",
              "metrics": [],
              "type": "point-to-point"
            }
          ]
        },
        "l2vpn_services": [],
        "lags": [],
        "lines": 13,
        "objects": 13,
        "ospf": {
          "instances": [],
          "interfaces": []
        },
        "peers": [
          {
            "address_families": [
              "vpnv4 unicast"
            ],
            "ip": "10.255.10.6",
            "kind": "bgp",
            "name": "as65000",
            "peer_group": null,
            "remote_as": "65000",
            "route_reflector_client": false,
            "vrf": null
          }
        ],
        "ports": {
          "1": {
            "description": null,
            "lag": null,
            "roles": [
              "fp"
            ],
            "vlans": []
          },
          "2": {
            "description": null,
            "lag": null,
            "roles": [
              "fp"
            ],
            "vlans": []
          },
          "3": {
            "description": null,
            "lag": null,
            "roles": [
              "fp"
            ],
            "vlans": []
          }
        },
        "pseudowires": [],
        "recognised": 10,
        "rings": [],
        "segment_routing": {
          "flex_algorithms": [],
          "policies": [],
          "prefix_sids": [
            {
              "interface": "lb1",
              "node": true,
              "prefix": "10.255.10.8/32",
              "sid": "8",
              "value_type": "index"
            }
          ],
          "segment_lists": {},
          "srgb": [
            {
              "instance": "Interop",
              "lower": "16000",
              "upper": "17000"
            }
          ],
          "srv6": {
            "locators": []
          }
        },
        "segments": [],
        "static_routes": [],
        "sub_ports": [],
        "tp_corouted_tunnels": [],
        "vlans": {},
        "vrf_instances": [],
        "vrfs": []
      },
      "platform": "cn5164",
      "recipe": "Adaptive-SR-CFM",
      "status": "ok",
      "templates": [
        "P8/01-P_createldp.xml",
        "P8/02-P_advertisemapping.xml"
      ],
      "type": "5164-10x"
    },
    {
      "device": "PE1",
      "extractor": "saos10",
      "facts": {
        "bgp": {
          "instances": [
            {
              "as": "65000",
              "cluster_id": null,
              "route_reflector": false,
              "router_id": "10.255.10.1",
              "srv6_locator": null,
              "srv6_locators": {}
            }
          ]
        },
        "cfm": {
          "meps": []
        },
        "classifiers": {
          "Untagged": [],
          "if1": [],
          "if2": [],
          "if3": [],
          "ring-vlan-100": [
            "100"
          ]
        },
        "evpn_instances": [],
        "fds": [
          {
            "mode": "vpls",
            "name": "if1"
          },
          {
            "mode": "vpls",
            "name": "if2"
          },
          {
            "mode": "vpls",
            "name": "if3"
          },
          {
            "mode": "vpws",
            "name": "testsat"
          },
          {
            "mode": "vpls",
            "name": "ring-data"
          }
        ],
        "fps": [
          {
            "classifiers": [
              "if1"
            ],
            "fd": "if1",
            "logical_port": "1",
            "name": "if1"
          },
          {
            "classifiers": [
              "if2"
            ],
            "fd": "if2",
            "logical_port": "2",
            "name": "if2"
          },
          {
            "classifiers": [
              "if3"
            ],
            "fd": "if3",
            "logical_port": "3",
            "name": "if3"
          },
          {
            "classifiers": [
              "Untagged"
            ],
            "fd": "testsat",
            "logical_port": "4",
            "name": "testsat_1"
          },
          {
            "classifiers": [
              "ring-vlan-100"
            ],
            "fd": "ring-data",
            "logical_port": "1",
            "name": "ring-data_1"
          },
          {
            "classifiers": [
              "ring-vlan-100"
            ],
            "fd": "ring-data",
            "logical_port": "2",
            "name": "ring-data_2"
          }
        ],
        "gateway": null,
        "hostname": "PE1",
        "interfaces": [
          {
            "description": null,
            "fd": null,
            "ip": "10.255.10.1/32",
            "ipv4": [
              "10.255.10.1/32"
            ],
            "ipv6": [],
            "isis": "Interop",
            "kind": "loopback",
            "mtu": "1500",
            "name": "lb1",
            "vlan": null,
            "vrf": null,
            "vs": null
          },
          {
            "description": null,
            "fd": "if1",
            "ip": "172.30.10.1/30",
            "ipv4": [
              "172.30.10.1/30"
            ],
            "ipv6": [],
            "isis": "Interop",
            "kind": "ip",
            "mtu": "1500",
            "name": "if1",
            "vlan": null,
            "vrf": "default",
            "vs": null
          },
          {
            "description": null,
            "fd": "if2",
            "ip": "172.30.10.5/30",
            "ipv4": [
              "172.30.10.5/30"
            ],
            "ipv6": [],
            "isis": "Interop",
            "kind": "ip",
            "mtu": "1500",
            "name": "if2",
            "vlan": null,
            "vrf": "default",
            "vs": null
          },
          {
            "description": null,
            "fd": "if3",
            "ip": "172.20.10.1/30",
            "ipv4": [
              "172.20.10.1/30"
            ],
            "ipv6": [],
            "kind": "ip",
            "mtu": "1500",
            "name": "if3",
            "vlan": null,
            "vrf": "default",
            "vs": null
          }
        ],
        "isis": {
          "instances": [
            {
              "address_families": [
                "ipv4 unicast"
              ],
              "area": "49.0001.0102.5501.0001.00",
              "area_id": "49.0001",
              "level": "level-1",
              "multi_topology": null,
              "name": "Interop",
              "net": "49.0001.0102.5501.0001.00",
              "nets": [
                "49.0001.0102.5501.0001.00"
              ],
              "sr_enabled": true,
              "srv6_enabled": false,
              "srv6_locators": [],
              "system_id": "0102.5501.0001"
            }
          ],
          "interfaces": [
            {
              "address_families": [
                "ipv4 unicast"
              ],
              "instance": "Interop",
              "interface": "lb1",
              "level": null,
              "metrics": [],
              "type": "point-to-point"
            },
            {
              "address_families": [
                "ipv4 unicast"
              ],
              "instance": "Interop",
              "interface": "if1",
              "level": "level-1",
              "metrics": [],
              "type": "point-to-point"
            },
            {
              "address_families": [
                "ipv4 unicast"
              ],
              "instance": "Interop",
              "interface": "if2",
              "level": "level-1",
              "metrics": [],
              "type": "point-to-point"
            }
          ]
        },
        "l2vpn_services": [
          {
            "fd": "testsat",
            "mtu": null,
            "name": "testsat",
            "pseudowires": [
              "testsat"
            ],
            "signaling_type": "ldp"
          }
        ],
        "lags": [],
        "lines": 24,
        "objects": 24,
        "ospf": {
          "instances": [],
          "interfaces": []
        },
        "peers": [
          {
            "address_families": [
              "vpnv4 unicast"
            ],
            "ip": "10.255.10.6",
            "kind": "bgp",
            "name": "as65000",
            "peer_group": null,
            "remote_as": "65000",
            "route_reflector_client": false,
            "vrf": null
          }
        ],
        "ports": {
          "1": {
            "description": null,
            "lag": null,
            "roles": [
              "ring",
              "fp"
            ],
            "vlans": [
              "100"
            ]
          },
          "2": {
            "description": null,
            "lag": null,
            "roles": [
              "ring",
              "fp"
            ],
            "vlans": [
              "100"
            ]
          },
          "3": {
            "description": null,
            "lag": null,
            "roles": [
              "fp"
            ],
            "vlans": []
          },
          "4": {
            "description": null,
            "lag": null,
            "roles": [
              "fp"
            ],
            "vlans": []
          }
        },
        "pseudowires": [
          {
            "in_label": null,
            "kind": "configured",
            "mode": "spoke",
            "name": "testsat",
            "out_label": null,
            "peer": "10.255.10.9",
            "pw_id": "100",
            "service": "testsat",
            "service_type": "vpws",
            "tunnel": null,
            "tunnel_color": "2",
            "tunnel_type": "sr-policy"
          }
        ],
        "recognised": 19,
        "rings": [
          {
            "east": "2",
            "instances": [
              {
                "members": [
                  "ring-data"
                ],
                "name": "erp-core",
                "raps_level": "7",
                "raps_vid": "4094",
                "revertive": true,
                "rpl": [
                  {
                    "interface": "1",
                    "port": "port0",
                    "role": "none"
                  },
                  {
                    "interface": "2",
                    "port": "port1",
                    "role": "none"
                  }
                ],
                "sub_ring_of": null,
                "termination": null,
                "timers": {
                  "guard": "500",
                  "hold_off": null,
                  "wtr": "1"
                },
                "type": "major",
                "virtual_channel": null
              }
            ],
            "name": "ring-core",
            "ports": [
              {
                "hold_off": null,
                "interface": "1",
                "name": "port0"
              },
              {
                "hold_off": null,
                "interface": "2",
                "name": "port1"
              }
            ],
            "ring_id": "1",
            "west": "1"
          }
        ],
        "segment_routing": {
          "flex_algorithms": [],
          "policies": [
            {
              "candidate_paths": [
                {
                  "discriminator": "1",
                  "flex_algorithm": null,
                  "origin": "local",
                  "originator": "10.255.10.1",
                  "preference": "100",
                  "segment_lists": [
                    "PE1_PE9"
                  ]
                }
              ],
              "color": "2",
              "endpoint": "10.255.10.9",
              "name": "SR1to9color2",
              "source": "10.255.10.1"
            }
          ],
          "prefix_sids": [
            {
              "interface": "lb1",
              "node": true,
              "prefix": "10.255.10.1/32",
              "sid": "1",
              "value_type": "index"
            }
          ],
          "segment_lists": {
            "PE1_PE9": [
              "16003",
              "16004",
              "16009"
            ]
          },
          "srgb": [
            {
              "instance": "Interop",
              "lower": "16000",
              "upper": "17000"
            }
          ],
          "srv6": {
            "locators": []
          }
        },
        "segments": [],
        "static_routes": [],
        "sub_ports": [],
        "tp_corouted_tunnels": [],
        "vlans": {
          "100": {
            "ports": [
              "1",
              "2"
            ]
          }
        },
        "vrf_instances": [],
        "vrfs": []
      },
      "platform": "cn5170",
      "recipe": "Adaptive-SR-CFM",
      "status": "ok",
      "templates": [
        "PE1/01-P_createldp.xml",
        "PE1/02-P_advertisemapping.xml",
        "PE1/03-PE1_SR_Policies.xml",
        "PE1/04-P_servicesCreate.xml",
        "PE1/05-P_l2vpnCreate.xml",
        "PE1/06-P_satCreateall.xml",
        "PE1/07-G8032_ringCreate.xml"
      ],
      "type": "5170-10x"
    },
    {
      "device": "PE4",
      "extractor": "saos10",
      "facts": {
        "bgp": {
          "instances": [
            {
              "as": "65000",
              "cluster_id": null,
              "route_reflector": false,
              "router_id": "10.255.10.4",
              "srv6_locator": null,
              "srv6_locators": {}
            }
          ]
        },
        "cfm": {
          "meps": []
        },
        "classifiers": {
          "Untagged": [],
          "if1": [],
          "if2": [],
          "if3": [],
          "ring-vlan-100": [
            "100"
          ]
        },
        "evpn_instances": [],
        "fds": [
          {
            "mode": "vpls",
            "name": "if1"
          },
          {
            "mode": "vpls",
            "name": "if2"
          },
          {
            "mode": "vpls",
            "name": "if3"
          },
          {
            "mode": "vpws",
            "name": "testsat"
          },
          {
            "mode": "vpls",
            "name": "ring-data"
          }
        ],
        "fps": [
          {
            "classifiers": [
              "if1"
            ],
            "fd": "if1",
            "logical_port": "1",
            "name": "if1"
          },
          {
            "classifiers": [
              "if2"
            ],
            "fd": "if2",
            "logical_port": "2",
            "name": "if2"
          },
          {
            "classifiers": [
              "if3"
            ],
            "fd": "if3",
            "logical_port": "3",
            "name": "if3"
          },
          {
            "classifiers": [
              "Untagged"
            ],
            "fd": "testsat",
            "logical_port": "4",
            "name": "testsat_1"
          },
          {
            "classifiers": [
              "ring-vlan-100"
            ],
            "fd": "ring-data",
            "logical_port": "1",
            "name": "ring-data_1"
          },
          {
            "classifiers": [
              "ring-vlan-100"
            ],
            "fd": "ring-data",
            "logical_port": "2",
            "name": "ring-data_2"
          },
          {
            "classifiers": [
              "ring-vlan-100"
            ],
            "fd": "ring-data",
            "logical_port": "3",
            "name": "ring-data_3"
          }
        ],
        "gateway": null,
        "hostname": "PE4",
        "interfaces": [
          {
            "description": null,
            "fd": null,
            "ip": "10.255.10.4/32",
            "ipv4": [
              "10.255.10.4/32"
            ],
            "ipv6": [],
            "isis": "Interop",
            "kind": "loopback",
            "mtu": "1500",
            "name": "lb1",
            "vlan": null,
            "vrf": null,
            "vs": null
          },
          {
            "description": null,
            "fd": "if1",
            "ip": "172.30.10.14/30",
            "ipv4": [
              "172.30.10.14/30"
            ],
            "ipv6": [],
            "isis": "Interop",
            "kind": "ip",
            "mtu": "1500",
            "name": "if1",
            "vlan": null,
            "vrf": "default",
            "vs": null
          },
          {
            "description": null,
            "fd": "if2",
            "ip": "172.30.10.18/30",
            "ipv4": [
              "172.30.10.18/30"
            ],
            "ipv6": [],
            "isis": "Interop",
            "kind": "ip",
            "mtu": "1500",
            "name": "if2",
            "vlan": null,
            "vrf": "default",
            "vs": null
          },
          {
            "description": null,
            "fd": "if3",
            "ip": "172.30.10.25/30",
            "ipv4": [
              "172.30.10.25/30"
            ],
            "ipv6": [],
            "isis": "Interop",
            "kind": "ip",
            "mtu": "1500",
            "name": "if3",
            "vlan": null,
            "vrf": "default",
            "vs": null
          }
        ],
        "isis": {
          "instances": [
            {
              "address_families": [
                "ipv4 unicast"
              ],
              "area": "49.0001.0102.5501.0004.00",
              "area_id": "49.0001",
              "level": "level-1",
              "multi_topology": null,
              "name": "Interop",
              "net": "49.0001.0102.5501.0004.00",
              "nets": [
                "49.0001.0102.5501.0004.00"
              ],
              "sr_enabled": true,
              "srv6_enabled": false,
              "srv6_locators": [],
              "system_id": "0102.5501.0004"
            }
          ],
          "interfaces": [
            {
              "address_families": [
                "ipv4 unicast"
              ],
              "instance": "Interop",
              "interface": "lb1",
              "level": null,
              "metrics": [],
              "type": "point-to-point"
            },
            {
              "address_families": [
                "ipv4 unicast"
              ],
              "instance": "Interop",
              "interface": "if1",
              "level": "level-1",
              "metrics": [],
              "type": "point-to-point"
            },
            {
              "address_families": [
                "ipv4 unicast"
              ],
              "instance": "Interop",
              "interface": "if2",
              "level": "level-1",
              "metrics": [],
              "type": "point-to-point"
            },
            {
              "address_families": [
                "ipv4 unicast"
              ],
              "instance": "Interop",
              "interface": "if3",
              "level": "level-1",
              "metrics": [],
              "type": "point-to-point"
            }
          ]
        },
        "l2vpn_services": [
          {
            "fd": "testsat",
            "mtu": null,
            "name": "testsat",
            "pseudowires": [
              "testsat"
            ],
            "signaling_type": "ldp"
          }
        ],
        "lags": [],
        "lines": 24,
        "objects": 24,
        "ospf": {
          "instances": [],
          "interfaces": []
        },
        "peers": [
          {
            "address_families": [
              "vpnv4 unicast"
            ],
            "ip": "10.255.10.6",
            "kind": "bgp",
            "name": "as65000",
            "peer_group": null,
            "remote_as": "65000",
            "route_reflector_client": false,
            "vrf": null
          }
        ],
        "ports": {
          "1": {
            "description": null,
            "lag": null,
            "roles": [
              "ring",
              "fp"
            ],
            "vlans": [
              "100"
            ]
          },
          "2": {
            "description": null,
            "lag": null,
            "roles": [
              "ring",
              "fp"
            ],
            "vlans": [
              "100"
            ]
          },
          "3": {
            "description": null,
            "lag": null,
            "roles": [
              "ring",
              "fp"
            ],
            "vlans": [
              "100"
            ]
          },
          "4": {
            "description": null,
            "lag": null,
            "roles": [
              "fp"
            ],
            "vlans": []
          }
        },
        "pseudowires": [
          {
            "in_label": null,
            "kind": "configured",
            "mode": "spoke",
            "name": "testsat",
            "out_label": null,
            "peer": "10.255.10.3",
            "pw_id": "200",
            "service": "testsat",
            "service_type": "vpws",
            "tunnel": null,
            "tunnel_color": null,
            "tunnel_type": null
          }
        ],
        "recognised": 19,
        "rings": [
          {
            "east": "2",
            "instances": [
              {
                "members": [
                  "ring-data"
                ],
                "name": "erp-core",
                "raps_level": "7",
                "raps_vid": "4094",
                "revertive": true,
                "rpl": [
                  {
                    "interface": "1",
                    "port": "port0",
                    "role": "none"
                  },
                  {
                    "interface": "2",
                    "port": "port1",
                    "role": "neighbor"
                  }
                ],
                "sub_ring_of": null,
                "termination": null,
                "timers": {
                  "guard": "500",
                  "hold_off": null,
                  "wtr": "1"
                },
                "type": "major",
                "virtual_channel": null
              }
            ],
            "name": "ring-core",
            "ports": [
              {
                "hold_off": null,
                "interface": "1",
                "name": "port0"
              },
              {
                "hold_off": null,
                "interface": "2",
                "name": "port1"
              }
            ],
            "ring_id": "1",
            "west": "1"
          },
          {
            "east": "3",
            "instances": [
              {
                "members": [
                  "ring-data"
                ],
                "name": "erp-access",
                "raps_level": "7",
                "raps_vid": "4093",
                "revertive": null,
                "rpl": [
                  {
                    "interface": "3",
                    "port": "port1",
                    "role": "none"
                  }
                ],
                "sub_ring_of": "ring-core",
                "termination": null,
                "timers": {
                  "guard": null,
                  "hold_off": null,
                  "wtr": "1"
                },
                "type": "sub",
                "virtual_channel": false
              }
            ],
            "name": "ring-access",
            "ports": [
              {
                "hold_off": null,
                "interface": "2",
                "name": "port0"
              },
              {
                "hold_off": null,
                "interface": "3",
                "name": "port1"
              }
            ],
            "ring_id": "2",
            "west": "2"
          }
        ],
        "segment_routing": {
          "flex_algorithms": [],
          "policies": [
            {
              "candidate_paths": [
                {
                  "discriminator": "1",
                  "flex_algorithm": null,
                  "origin": "local",
                  "originator": "10.255.10.4",
                  "preference": "100",
                  "segment_lists": [
                    "PE4_PE3"
                  ]
                }
              ],
              "color": "2",
              "endpoint": "10.255.10.3",
              "name": "SR4to3color2",
              "source": "10.255.10.4"
            }
          ],
          "prefix_sids": [
            {
              "interface": "lb1",
              "node": true,
              "prefix": "10.255.10.4/32",
              "sid": "4",
              "value_type": "index"
            }
          ],
          "segment_lists": {
            "PE4_PE3": [
              "16003"
            ]
          },
          "srgb": [
            {
              "instance": "Interop",
              "lower": "16000",
              "upper": "17000"
            }
          ],
          "srv6": {
            "locators": []
          }
        },
        "segments": [],
        "static_routes": [],
        "sub_ports": [],
        "tp_corouted_tunnels": [],
        "vlans": {
          "100": {
            "ports": [
              "1",
              "2",
              "3"
            ]
          }
        },
        "vrf_instances": [],
        "vrfs": []
      },
      "platform": "cn5170",
      "recipe": "Adaptive-SR-CFM",
      "status": "ok",
      "templates": [
        "PE4/01-P_createldp.xml",
        "PE4/02-P_advertisemapping.xml",
        "PE4/03-PE1_SR_Policies.xml",
        "PE4/04-P_servicesCreate.xml",
        "PE4/05-P_l2vpnCreate.xml",
        "PE4/06-P_satCreateall.xml",
        "PE4/07-G8032_ringCreate.xml"
      ],
      "type": "5170-10x"
    },
    {
      "device": "PE5",
      "extractor": "saos10",
      "facts": {
        "bgp": {
          "instances": [
            {
              "as": "65000",
              "cluster_id": null,
              "route_reflector": false,
              "router_id": "10.255.10.5",
              "srv6_locator": null,
              "srv6_locators": {}
            }
          ]
        },
        "cfm": {
          "meps": []
        },
        "classifiers": {
          "Untagged": [],
          "if1": [],
          "if2": [],
          "if3": [],
          "ring-vlan-100": [
            "100"
          ]
        },
        "evpn_instances": [],
        "fds": [
          {
            "mode": "vpls",
            "name": "if1"
          },
          {
            "mode": "vpls",
            "name": "if2"
          },
          {
            "mode": "vpls",
            "name": "if3"
          },
          {
            "mode": "vpls",
            "name": "ring-data"
          }
        ],
        "fps": [
          {
            "classifiers": [
              "if1"
            ],
            "fd": "if1",
            "logical_port": "1",
            "name": "if1"
          },
          {
            "classifiers": [
              "if2"
            ],
            "fd": "if2",
            "logical_port": "2",
            "name": "if2"
          },
          {
            "classifiers": [
              "if3"
            ],
            "fd": "if3",
            "logical_port": "3",
            "name": "if3"
          },
          {
            "classifiers": [
              "ring-vlan-100"
            ],
            "fd": "ring-data",
            "logical_port": "1",
            "name": "ring-data_1"
          },
          {
            "classifiers": [
              "ring-vlan-100"
            ],
            "fd": "ring-data",
            "logical_port": "2",
            "name": "ring-data_2"
          }
        ],
        "gateway": null,
        "hostname": "PE5",
        "interfaces": [
          {
            "description": null,
            "fd": null,
            "ip": "10.255.10.5/32",
            "ipv4": [
              "10.255.10.5/32"
            ],
            "ipv6": [],
            "isis": "Interop",
            "kind": "loopback",
            "mtu": "1500",
            "name": "lb1",
            "vlan": null,
            "vrf": null,
            "vs": null
          },
          {
            "description": null,
            "fd": "if1",
            "ip": "172.30.10.22/30",
            "ipv4": [
              "172.30.10.22/30"
            ],
            "ipv6": [],
            "isis": "Interop",
            "kind": "ip",
            "mtu": "1500",
            "name": "if1",
            "vlan": null,
            "vrf": "default",
            "vs": null
          },
          {
            "description": null,
            "fd": "if2",
            "ip": "172.30.10.29/30",
            "ipv4": [
              "172.30.10.29/30"
            ],
            "ipv6": [],
            "isis": "Interop",
            "kind": "ip",
            "mtu": "1500",
            "name": "if2",
            "vlan": null,
            "vrf": "default",
            "vs": null
          },
          {
            "description": null,
            "fd": "if3",
            "ip": "172.30.10.33/30",
            "ipv4": [
              "172.30.10.33/30"
            ],
            "ipv6": [],
            "isis": "Interop",
            "kind": "ip",
            "mtu": "1500",
            "name": "if3",
            "vlan": null,
            "vrf": "default",
            "vs": null
          }
        ],
        "isis": {
          "instances": [
            {
              "address_families": [
                "ipv4 unicast"
              ],
              "area": "49.0001.0102.5501.0005.00",
              "area_id": "49.0001",
              "level": "level-1",
              "multi_topology": null,
              "name": "Interop",
              "net": "49.0001.0102.5501.0005.00",
              "nets": [
                "49.0001.0102.5501.0005.00"
              ],
              "sr_enabled": true,
              "srv6_enabled": false,
              "srv6_locators": [],
              "system_id": "0102.5501.0005"
            }
          ],
          "interfaces": [
            {
              "address_families": [
                "ipv4 unicast"
              ],
              "instance": "Interop",
              "interface": "lb1",
              "level": null,
              "metrics": [],
              "type": "point-to-point"
            },
            {
              "address_families": [
                "ipv4 unicast"
              ],
              "instance": "Interop",
              "interface": "if1",
              "level": "level-1",
              "metrics": [],
              "type": "point-to-point"
            },
            {
              "address_families": [
                "ipv4 unicast"
              ],
              "instance": "Interop",
              "interface": "if2",
              "level": "level-1",
              "metrics": [],
              "type": "point-to-point"
            },
            {
              "address_families": [
                "ipv4 unicast"
              ],
              "instance": "Interop",
              "interface": "if3",
              "level": "level-1",
              "metrics": [],
              "type": "point-to-point"
            }
          ]
        },
        "l2vpn_services": [],
        "lags": [],
        "lines": 17,
        "objects": 17,
        "ospf": {
          "instances": [],
          "interfaces": []
        },
        "peers": [
          {
            "address_families": [
              "vpnv4 unicast"
            ],
            "ip": "10.255.10.6",
            "kind": "bgp",
            "name": "as65000",
            "peer_group": null,
            "remote_as": "65000",
            "route_reflector_client": false,
            "vrf": null
          }
        ],
        "ports": {
          "1": {
            "description": null,
            "lag": null,
            "roles": [
              "ring",
              "fp"
            ],
            "vlans": [
              "100"
            ]
          },
          "2": {
            "description": null,
            "lag": null,
            "roles": [
              "ring",
              "fp"
            ],
            "vlans": [
              "100"
            ]
          },
          "3": {
            "description": null,
            "lag": null,
            "roles": [
              "fp"
            ],
            "vlans": []
          }
        },
        "pseudowires": [],
        "recognised": 14,
        "rings": [
          {
            "east": "2",
            "instances": [
              {
                "members": [
                  "ring-data"
                ],
                "name": "erp-access",
                "raps_level": "7",
                "raps_vid": "4093",
                "revertive": null,
                "rpl": [
                  {
                    "interface": "1",
                    "port": "port0",
                    "role": "none"
                  },
                  {
                    "interface": "2",
                    "port": "port1",
                    "role": "neighbor"
                  }
                ],
                "sub_ring_of": null,
                "termination": null,
                "timers": {
                  "guard": null,
                  "hold_off": null,
                  "wtr": "1"
                },
                "type": "sub",
                "virtual_channel": false
              }
            ],
            "name": "ring-access",
            "ports": [
              {
                "hold_off": null,
                "interface": "1",
                "name": "port0"
              },
              {
                "hold_off": null,
                "interface": "2",
                "name": "port1"
              }
            ],
            "ring_id": "2",
            "west": "1"
          }
        ],
        "segment_routing": {
          "flex_algorithms": [],
          "policies": [],
          "prefix_sids": [
            {
              "interface": "lb1",
              "node": true,
              "prefix": "10.255.10.5/32",
              "sid": "5",
              "value_type": "index"
            }
          ],
          "segment_lists": {},
          "srgb": [
            {
              "instance": "Interop",
              "lower": "16000",
              "upper": "17000"
            }
          ],
          "srv6": {
            "locators": []
          }
        },
        "segments": [],
        "static_routes": [],
        "sub_ports": [],
        "tp_corouted_tunnels": [],
        "vlans": {
          "100": {
            "ports": [
              "1",
              "2"
            ]
          }
        },
        "vrf_instances": [],
        "vrfs": []
      },
      "platform": "cn5166",
      "recipe": "Adaptive-SR-CFM",
      "status": "ok",
      "templates": [
        "PE5/01-P_createldp.xml",
        "PE5/02-P_advertisemapping.xml",
        "PE5/03-G8032_ringCreate.xml"
      ],
      "type": "5166-10x"
    },
    {
      "device": "PE6",
      "extractor": "saos10",
      "facts": {
        "bgp": {
          "instances": [
            {
              "as": "65000",
              "cluster_id": null,
              "route_reflector": true,
              "router_id": "10.255.10.6",
              "srv6_locator": null,
              "srv6_locators": {}
            }
          ]
        },
        "cfm": {
          "meps": [
            {
              "ccm_interval": "1s",
              "direction": "up",
              "interface": "testcfm_1",
              "level": null,
              "ma": "testcfm",
              "md": "md3",
              "mep_id": "33",
              "port": "5",
              "service": "testcfm",
              "vlan": null
            }
          ]
        },
        "classifiers": {
          "Untagged": [],
          "if1": [],
          "if2": [],
          "if3": [],
          "ring-vlan-100": [
            "100"
          ]
        },
        "evpn_instances": [],
        "fds": [
          {
            "mode": "vpls",
            "name": "if1"
          },
          {
            "mode": "vpls",
            "name": "if2"
          },
          {
            "mode": "vpls",
            "name": "if3"
          },
          {
            "mode": "vpws",
            "name": "testcfm"
          },
          {
            "mode": "vpls",
            "name": "ring-data"
          }
        ],
        "fps": [
          {
            "classifiers": [
              "if1"
            ],
            "fd": "if1",
            "logical_port": "1",
            "name": "if1"
          },
          {
            "classifiers": [
              "if2"
            ],
            "fd": "if2",
            "logical_port": "2",
            "name": "if2"
          },
          {
            "classifiers": [
              "if3"
            ],
            "fd": "if3",
            "logical_port": "3",
            "name": "if3"
          },
          {
            "classifiers": [
              "Untagged"
            ],
            "fd": "testcfm",
            "logical_port": "5",
            "name": "testcfm_1"
          },
          {
            "classifiers": [
              "ring-vlan-100"
            ],
            "fd": "ring-data",
            "logical_port": "2",
            "name": "ring-data_2"
          },
          {
            "classifiers": [
              "ring-vlan-100"
            ],
            "fd": "ring-data",
            "logical_port": "1",
            "name": "ring-data_1"
          }
        ],
        "gateway": null,
        "hostname": "PE6",
        "interfaces": [
          {
            "description": null,
            "fd": null,
            "ip": "10.255.10.6/32",
            "ipv4": [
              "10.255.10.6/32"
            ],
            "ipv6": [],
            "isis": "Interop",
            "kind": "loopback",
            "mtu": "1500",
            "name": "lb1",
            "vlan": null,
            "vrf": null,
            "vs": null
          },
          {
            "description": null,
            "fd": "if1",
            "ip": "172.30.10.26/30",
            "ipv4": [
              "172.30.10.26/30"
            ],
            "ipv6": [],
            "isis": "Interop",
            "kind": "ip",
            "mtu": "1500",
            "name": "if1",
            "vlan": null,
            "vrf": "default",
            "vs": null
          },
          {
            "description": null,
            "fd": "if2",
            "ip": "172.30.10.30/30",
            "ipv4": [
              "172.30.10.30/30"
            ],
            "ipv6": [],
            "isis": "Interop",
            "kind": "ip",
            "mtu": "1500",
            "name": "if2",
            "vlan": null,
            "vrf": "default",
            "vs": null
          },
          {
            "description": null,
            "fd": "if3",
            "ip": "172.30.10.37/30",
            "ipv4": [
              "172.30.10.37/30"
            ],
            "ipv6": [],
            "isis": "Interop",
            "kind": "ip",
            "mtu": "1500",
            "name": "if3",
            "vlan": null,
            "vrf": "default",
            "vs": null
          }
        ],
        "isis": {
          "instances": [
            {
              "address_families": [
                "ipv4 unicast"
              ],
              "area": "49.0001.0102.5501.0006.00",
              "area_id": "49.0001",
              "level": "level-1",
              "multi_topology": null,
              "name": "Interop",
              "net": "49.0001.0102.5501.0006.00",
              "nets": [
                "49.0001.0102.5501.0006.00"
              ],
              "sr_enabled": true,
              "srv6_enabled": false,
              "srv6_locators": [],
              "system_id": "0102.5501.0006"
            }
          ],
          "interfaces": [
            {
              "address_families": [
                "ipv4 unicast"
              ],
              "instance": "Interop",
              "interface": "lb1",
              "level": null,
              "metrics": [],
              "type": "point-to-point"
            },
            {
              "address_families": [
                "ipv4 unicast"
              ],
              "instance": "Interop",
              "interface": "if1",
              "level": "level-1",
              "metrics": [],
              "type": "point-to-point"
            },
            {
              "address_families": [
                "ipv4 unicast"
              ],
              "instance": "Interop",
              "interface": "if2",
              "level": "level-1",
              "metrics": [],
              "type": "point-to-point"
            },
            {
              "address_families": [
                "ipv4 unicast"
              ],
              "instance": "Interop",
              "interface": "if3",
              "level": "level-1",
              "metrics": [],
              "type": "point-to-point"
            }
          ]
        },
        "l2vpn_services": [
          {
            "fd": "testcfm",
            "mtu": null,
            "name": "testcfm",
            "pseudowires": [
              "testcfm"
            ],
            "signaling_type": "ldp"
          }
        ],
        "lags": [],
        "lines": 24,
        "objects": 24,
        "ospf": {
          "instances": [],
          "interfaces": []
        },
        "peers": [
          {
            "address_families": [
              "vpnv4 unicast"
            ],
            "ip": "10.255.10.1",
            "kind": "bgp",
            "name": "as65000",
            "peer_group": null,
            "remote_as": "65000",
            "route_reflector_client": true,
            "vrf": null
          },
          {
            "address_families": [
              "vpnv4 unicast"
            ],
            "ip": "10.255.10.4",
            "kind": "bgp",
            "name": "as65000",
            "peer_group": null,
            "remote_as": "65000",
            "route_reflector_client": true,
            "vrf": null
          },
          {
            "address_families": [
              "vpnv4 unicast"
            ],
            "ip": "10.255.10.5",
            "kind": "bgp",
            "name": "as65000",
            "peer_group": null,
            "remote_as": "65000",
            "route_reflector_client": true,
            "vrf": null
          },
          {
            "address_families": [
              "vpnv4 unicast"
            ],
            "ip": "10.255.10.9",
            "kind": "bgp",
            "name": "as65000",
            "peer_group": null,
            "remote_as": "65000",
            "route_reflector_client": true,
            "vrf": null
          }
        ],
        "ports": {
          "1": {
            "description": null,
            "lag": null,
            "roles": [
              "ring",
              "fp"
            ],
            "vlans": [
              "100"
            ]
          },
          "2": {
            "description": null,
            "lag": null,
            "roles": [
              "ring",
              "fp"
            ],
            "vlans": [
              "100"
            ]
          },
          "3": {
            "description": null,
            "lag": null,
            "roles": [
              "fp"
            ],
            "vlans": []
          },
          "5": {
            "description": null,
            "lag": null,
            "roles": [
              "fp",
              "cfm-mep"
            ],
            "vlans": []
          }
        },
        "pseudowires": [
          {
            "in_label": null,
            "kind": "configured",
            "mode": "spoke",
            "name": "testcfm",
            "out_label": null,
            "peer": "10.255.10.3",
            "pw_id": "100",
            "service": "testcfm",
            "service_type": "vpws",
            "tunnel": null,
            "tunnel_color": "2",
            "tunnel_type": "sr-policy"
          }
        ],
        "recognised": 20,
        "rings": [
          {
            "east": "1",
            "instances": [
              {
                "members": [
                  "ring-data"
                ],
                "name": "erp-access",
                "raps_level": "7",
                "raps_vid": "4093",
                "revertive": null,
                "rpl": [
                  {
                    "interface": "2",
                    "port": "port0",
                    "role": "owner"
                  },
                  {
                    "interface": "1",
                    "port": "port1",
                    "role": "none"
                  }
                ],
                "sub_ring_of": null,
                "termination": null,
                "timers": {
                  "guard": null,
                  "hold_off": null,
                  "wtr": "1"
                },
                "type": "sub",
                "virtual_channel": false
              }
            ],
            "name": "ring-access",
            "ports": [
              {
                "hold_off": null,
                "interface": "2",
                "name": "port0"
              },
              {
                "hold_off": null,
                "interface": "1",
                "name": "port1"
              }
            ],
            "ring_id": "2",
            "west": "2"
          }
        ],
        "segment_routing": {
          "flex_algorithms": [],
          "policies": [
            {
              "candidate_paths": [
                {
                  "discriminator": "1",
                  "flex_algorithm": null,
                  "origin": "local",
                  "originator": "10.255.10.6",
                  "preference": "100",
                  "segment_lists": [
                    "PE6_PE3"
                  ]
                }
              ],
              "color": "2",
              "endpoint": "10.255.10.3",
              "name": "SR6to3color2",
              "source": "10.255.10.6"
            }
          ],
          "prefix_sids": [
            {
              "interface": "lb1",
              "node": true,
              "prefix": "10.255.10.6/32",
              "sid": "6",
              "value_type": "index"
            }
          ],
          "segment_lists": {
            "PE6_PE3": [
              "16004",
              "16003"
            ]
          },
          "srgb": [
            {
              "instance": "Interop",
              "lower": "16000",
              "upper": "17000"
            }
          ],
          "srv6": {
            "locators": []
          }
        },
        "segments": [],
        "static_routes": [],
        "sub_ports": [],
        "tp_corouted_tunnels": [],
        "vlans": {
          "100": {
            "ports": [
              "2",
              "1"
            ]
          }
        },
        "vrf_instances": [],
        "vrfs": []
      },
      "platform": "cn5164",
      "recipe": "Adaptive-SR-CFM",
      "status": "ok",
      "templates": [
        "PE6/01-P_createldp.xml",
        "PE6/02-P_advertisemapping.xml",
        "PE6/03-PE1_SR_Policies.xml",
        "PE6/04-P_servicesCreate.xml",
        "PE6/05-P_l2vpnCreate.xml",
        "PE6/06-P_cfmCreate.xml",
        "PE6/07-G8032_ringCreate.xml"
      ],
      "type": "5164-10x"
    },
    {
      "device": "PE9",
      "extractor": "saos10",
      "facts": {
        "bgp": {
          "instances": [
            {
              "as": "65000",
              "cluster_id": null,
              "route_reflector": false,
              "router_id": "10.255.10.9",
              "srv6_locator": null,
              "srv6_locators": {}
            }
          ]
        },
        "cfm": {
          "meps": []
        },
        "classifiers": {
          "Untagged": [],
          "if1": [],
          "if2": []
        },
        "evpn_instances": [],
        "fds": [
          {
            "mode": "vpls",
            "name": "if1"
          },
          {
            "mode": "vpls",
            "name": "if2"
          },
          {
            "mode": "vpws",
            "name": "testsat"
          }
        ],
        "fps": [
          {
            "classifiers": [
              "if1"
            ],
            "fd": "if1",
            "logical_port": "1",
            "name": "if1"
          },
          {
            "classifiers": [
              "if2"
            ],
            "fd": "if2",
            "logical_port": "2",
            "name": "if2"
          },
          {
            "classifiers": [
              "Untagged"
            ],
            "fd": "testsat",
            "logical_port": "4",
            "name": "testsat_1"
          }
        ],
        "gateway": null,
        "hostname": "PE9",
        "interfaces": [
          {
            "description": null,
            "fd": null,
            "ip": "10.255.10.9/32",
            "ipv4": [
              "10.255.10.9/32"
            ],
            "ipv6": [],
            "isis": "Interop",
            "kind": "loopback",
            "mtu": "1500",
            "name": "lb1",
            "vlan": null,
            "vrf": null,
            "vs": null
          },
          {
            "description": null,
            "fd": "if1",
            "ip": "172.30.10.46/30",
            "ipv4": [
              "172.30.10.46/30"
            ],
            "ipv6": [],
            "isis": "Interop",
            "kind": "ip",
            "mtu": "1500",
            "name": "if1",
            "vlan": null,
            "vrf": "default",
            "vs": null
          },
          {
            "description": null,
            "fd": "if2",
            "ip": "172.30.10.50/30",
            "ipv4": [
              "172.30.10.50/30"
            ],
            "ipv6": [],
            "isis": "Interop",
            "kind": "ip",
            "mtu": "1500",
            "name": "if2",
            "vlan": null,
            "vrf": "default",
            "vs": null
          }
        ],
        "isis": {
          "instances": [
            {
              "address_families": [
                "ipv4 unicast"
              ],
              "area": "49.0001.0102.5501.0009.00",
              "area_id": "49.0001",
              "level": "level-1",
              "multi_topology": null,
              "name": "Interop",
              "net": "49.0001.0102.5501.0009.00",
              "nets": [
                "49.0001.0102.5501.0009.00"
              ],
              "sr_enabled": true,
              "srv6_enabled": false,
              "srv6_locators": [],
              "system_id": "0102.5501.0009"
            }
          ],
          "interfaces": [
            {
              "address_families": [
                "ipv4 unicast"
              ],
              "instance": "Interop",
              "interface": "lb1",
              "level": null,
              "metrics": [],
              "type": "point-to-point"
            },
            {
              "address_families": [
                "ipv4 unicast"
              ],
              "instance": "Interop",
              "interface": "if1",
              "level": "level-1",
              "metrics": [],
              "type": "point-to-point"
            },
            {
              "address_families": [
                "ipv4 unicast"
              ],
              "instance": "Interop",
              "interface": "if2",
              "level": "level-1",
              "metrics": [],
              "type": "point-to-point"
            }
          ]
        },
        "l2vpn_services": [
          {
            "fd": "testsat",
            "mtu": null,
            "name": "testsat",
            "pseudowires": [
              "testsat"
            ],
            "signaling_type": "ldp"
          }
        ],
        "lags": [],
        "lines": 20,
        "objects": 20,
        "ospf": {
          "instances": [],
          "interfaces": []
        },
        "peers": [
          {
            "address_families": [
              "vpnv4 unicast"
            ],
            "ip": "10.255.10.6",
            "kind": "bgp",
            "name": "as65000",
            "peer_group": null,
            "remote_as": "65000",
            "route_reflector_client": false,
            "vrf": null
          }
        ],
        "ports": {
          "1": {
            "description": null,
            "lag": null,
            "roles": [
              "fp"
            ],
            "vlans": []
          },
          "2": {
            "description": null,
            "lag": null,
            "roles": [
              "fp"
            ],
            "vlans": []
          },
          "4": {
            "description": null,
            "lag": null,
            "roles": [
              "fp"
            ],
            "vlans": []
          }
        },
        "pseudowires": [
          {
            "in_label": null,
            "kind": "configured",
            "mode": "spoke",
            "name": "testsat",
            "out_label": null,
            "peer": "10.255.10.1",
            "pw_id": "100",
            "service": "testsat",
            "service_type": "vpws",
            "tunnel": null,
            "tunnel_color": "2",
            "tunnel_type": "sr-policy"
          }
        ],
        "recognised": 15,
        "rings": [],
        "segment_routing": {
          "flex_algorithms": [],
          "policies": [
            {
              "candidate_paths": [
                {
                  "discriminator": "1",
                  "flex_algorithm": null,
                  "origin": "local",
                  "originator": "10.255.10.9",
                  "preference": "100",
                  "segment_lists": [
                    "PE9_PE1"
                  ]
                }
              ],
              "color": "2",
              "endpoint": "10.255.10.1",
              "name": "SR9to1color2",
              "source": "10.255.10.9"
            }
          ],
          "prefix_sids": [
            {
              "interface": "lb1",
              "node": true,
              "prefix": "10.255.10.9/32",
              "sid": "9",
              "value_type": "index"
            }
          ],
          "segment_lists": {
            "PE9_PE1": [
              "16004",
              "16003",
              "16001"
            ]
          },
          "srgb": [
            {
              "instance": "Interop",
              "lower": "16000",
              "upper": "17000"
            }
          ],
          "srv6": {
            "locators": []
          }
        },
        "segments": [],
        "static_routes": [],
        "sub_ports": [],
        "tp_corouted_tunnels": [],
        "vlans": {},
        "vrf_instances": [],
        "vrfs": []
      },
      "platform": "cn5171",
      "recipe": "Adaptive-SR-CFM",
      "status": "ok",
      "templates": [
        "PE9/01-P_createldp.xml",
        "PE9/02-P_advertisemapping.xml",
        "PE9/03-PE1_SR_Policies.xml",
        "PE9/04-P_servicesCreate.xml",
        "PE9/05-P_l2vpnCreate.xml",
        "PE9/06-P_satCreateall.xml"
      ],
      "type": "5171-10x"
    }
  ],
  "generator": {
    "name": "saos-network-facts",
    "translator": "translator 4.2.1 (mcp, https://dgwl7tykn828q.cloudfront.net)",
    "version": "0.9.0"
  },
  "schema_version": "1.7.0"
}
`,t=[`ce`,`pe`,`p`];function n(e,t){let n=e.nodes.find(e=>e.id===t);if(!n)throw Error(`unknown node ${t}`);return n}function r(e,t){return e.nodes.findIndex(e=>e.id===t)+1}function i(e,t){return e.links.filter(e=>e.a.node===t||e.b.node===t)}function a(e,t){if(e.a.node===t)return{local:e.a,remote:e.b,localSide:`a`};if(e.b.node===t)return{local:e.b,remote:e.a,localSide:`b`};throw Error(`${t} is not on link ${e.id}`)}function o(e,t,n){let r=[];for(let n of i(e,t)){let e=a(n,t).localSide;r.push(n[e].if);for(let t of n.members)r.push(t[e])}return[...new Set(r)].sort().indexOf(n)+1}function s(e){let n=[],r=new Set;for(let i of e.nodes)r.has(i.id)&&n.push(`duplicate node ${i.id}`),r.add(i.id),t.includes(i.role)||n.push(`${i.id}: bad role ${i.role}`),i.role!==`ce`&&!i.loopback&&n.push(`${i.id}: router without loopback`);for(let t of e.links){for(let e of[t.a,t.b])r.has(e.node)||n.push(`${t.id}: unknown node ${e.node}`);t.members?.length||n.push(`${t.id}: no members`)}return n}var c=Symbol.for(`yaml.alias`),l=Symbol.for(`yaml.document`),u=Symbol.for(`yaml.map`),d=Symbol.for(`yaml.pair`),f=Symbol.for(`yaml.scalar`),p=Symbol.for(`yaml.seq`),m=Symbol.for(`yaml.node.type`),h=e=>!!e&&typeof e==`object`&&e[m]===c,g=e=>!!e&&typeof e==`object`&&e[m]===l,_=e=>!!e&&typeof e==`object`&&e[m]===u,v=e=>!!e&&typeof e==`object`&&e[m]===d,y=e=>!!e&&typeof e==`object`&&e[m]===f,b=e=>!!e&&typeof e==`object`&&e[m]===p;function x(e){if(e&&typeof e==`object`)switch(e[m]){case u:case p:return!0}return!1}function S(e){if(e&&typeof e==`object`)switch(e[m]){case c:case u:case f:case p:return!0}return!1}var C=e=>(y(e)||x(e))&&!!e.anchor,w=Symbol(`break visit`),T=Symbol(`skip children`),E=Symbol(`remove node`);function D(e,t){let n=k(t);g(e)?O(null,e.contents,n,Object.freeze([e]))===E&&(e.contents=null):O(null,e,n,Object.freeze([]))}D.BREAK=w,D.SKIP=T,D.REMOVE=E;function O(e,t,n,r){let i=A(e,t,n,r);if(S(i)||v(i))return j(e,r,i),O(e,i,n,r);if(typeof i!=`symbol`){if(x(t)){r=Object.freeze(r.concat(t));for(let e=0;e<t.items.length;++e){let i=O(e,t.items[e],n,r);if(typeof i==`number`)e=i-1;else if(i===w)return w;else i===E&&(t.items.splice(e,1),--e)}}else if(v(t)){r=Object.freeze(r.concat(t));let e=O(`key`,t.key,n,r);if(e===w)return w;e===E&&(t.key=null);let i=O(`value`,t.value,n,r);if(i===w)return w;i===E&&(t.value=null)}}return i}function k(e){return typeof e==`object`&&(e.Collection||e.Node||e.Value)?Object.assign({Alias:e.Node,Map:e.Node,Scalar:e.Node,Seq:e.Node},e.Value&&{Map:e.Value,Scalar:e.Value,Seq:e.Value},e.Collection&&{Map:e.Collection,Seq:e.Collection},e):e}function A(e,t,n,r){if(typeof n==`function`)return n(e,t,r);if(_(t))return n.Map?.(e,t,r);if(b(t))return n.Seq?.(e,t,r);if(v(t))return n.Pair?.(e,t,r);if(y(t))return n.Scalar?.(e,t,r);if(h(t))return n.Alias?.(e,t,r)}function j(e,t,n){let r=t[t.length-1];if(x(r))r.items[e]=n;else if(v(r))e===`key`?r.key=n:r.value=n;else if(g(r))r.contents=n;else{let e=h(r)?`alias`:`scalar`;throw Error(`Cannot replace node with ${e} parent`)}}function M(e){if(/[\x00-\x19\s,[\]{}]/.test(e)){let t=`Anchor must not contain whitespace or control characters: ${JSON.stringify(e)}`;throw Error(t)}return!0}function N(e,t,n,r){if(r&&typeof r==`object`){if(Array.isArray(r))for(let t=0,n=r.length;t<n;++t){let n=r[t],i=N(e,r,String(t),n);i===void 0?delete r[t]:i!==n&&(r[t]=i)}else if(r instanceof Map)for(let t of Array.from(r.keys())){let n=r.get(t),i=N(e,r,t,n);i===void 0?r.delete(t):i!==n&&r.set(t,i)}else if(r instanceof Set)for(let t of Array.from(r)){let n=N(e,r,t,t);n===void 0?r.delete(t):n!==t&&(r.delete(t),r.add(n))}else for(let[t,n]of Object.entries(r)){let i=N(e,r,t,n);i===void 0?delete r[t]:i!==n&&(r[t]=i)}}return e.call(t,n,r)}function P(e,t,n){if(Array.isArray(e))return e.map((e,t)=>P(e,String(t),n));if(e&&typeof e.toJSON==`function`){if(!n||!C(e))return e.toJSON(t,n);let r={aliasCount:0,count:1,res:void 0};n.anchors.set(e,r),n.onCreate=e=>{r.res=e,delete n.onCreate};let i=e.toJSON(t,n);return n.onCreate&&n.onCreate(i),i}return typeof e==`bigint`&&!n?.keep?Number(e):e}var ee=class{constructor(e){Object.defineProperty(this,m,{value:e})}clone(){let e=Object.create(Object.getPrototypeOf(this),Object.getOwnPropertyDescriptors(this));return this.range&&(e.range=this.range.slice()),e}toJS(e,{mapAsMap:t,maxAliasCount:n,onAnchor:r,reviver:i}={}){if(!g(e))throw TypeError(`A document argument is required`);let a={anchors:new Map,doc:e,keep:!0,mapAsMap:t===!0,mapKeyWarned:!1,maxAliasCount:typeof n==`number`?n:100},o=P(this,``,a);if(typeof r==`function`)for(let{count:e,res:t}of a.anchors.values())r(t,e);return typeof i==`function`?N(i,{"":o},``,o):o}},te=class extends ee{constructor(e){super(c),this.source=e,Object.defineProperty(this,"tag",{set(){throw Error(`Alias nodes cannot have tags`)}})}resolve(e,t){if(t?.maxAliasCount===0)throw ReferenceError(`Alias resolution is disabled`);let n;t?.aliasResolveCache?n=t.aliasResolveCache:(n=[],D(e,{Node:(e,t)=>{(h(t)||C(t))&&n.push(t)}}),t&&(t.aliasResolveCache=n));let r;for(let e of n){if(e===this)break;e.anchor===this.source&&(r=e)}if(r&&t){let{anchors:e,doc:n,maxAliasCount:i}=t,a=e.get(r);if(a||=(P(r,null,t),e.get(r)),a?.res===void 0)throw ReferenceError(`This should not happen: Alias anchor was not resolved?`);if(i>=0&&(a.count+=1,a.aliasCount===0&&(a.aliasCount=ne(n,r,e)),a.count*a.aliasCount>i))throw ReferenceError(`Excessive alias count indicates a resource exhaustion attack`)}return r}toJSON(e,t){if(!t)return{source:this.source};let n=this.resolve(t.doc,t);if(!n){let e=`Unresolved alias (the anchor must be set before the alias): ${this.source}`;throw ReferenceError(e)}return t.anchors.get(n).res}toString(e,t,n){let r=`*${this.source}`;if(e){if(M(this.source),e.options.verifyAliasOrder&&!e.anchors.has(this.source)){let e=`Unresolved alias (the anchor must be set before the alias): ${this.source}`;throw Error(e)}if(e.implicitKey)return`${r} `}return r}};function ne(e,t,n){if(h(t)){let r=t.resolve(e),i=n&&r&&n.get(r);return i?i.count*i.aliasCount:0}if(x(t)){let r=0;for(let i of t.items){let t=ne(e,i,n);t>r&&(r=t)}return r}if(v(t)){let r=ne(e,t.key,n),i=ne(e,t.value,n);return Math.max(r,i)}return 1}var re=e=>!e||typeof e!=`function`&&typeof e!=`object`,F=class extends ee{constructor(e){super(f),this.value=e}toJSON(e,t){return t?.keep?this.value:P(this.value,e,t)}toString(){return String(this.value)}};F.BLOCK_FOLDED=`BLOCK_FOLDED`,F.BLOCK_LITERAL=`BLOCK_LITERAL`,F.PLAIN=`PLAIN`,F.QUOTE_DOUBLE=`QUOTE_DOUBLE`,F.QUOTE_SINGLE=`QUOTE_SINGLE`;var ie=`tag:yaml.org,2002:`;function ae(e,t,n){if(t){let e=n.filter(e=>e.tag===t),r=e.find(e=>!e.format)??e[0];if(!r)throw Error(`Tag ${t} not found`);return r}return n.find(t=>t.identify?.(e)&&!t.format)}function I(e,t,n){if(g(e)&&(e=e.contents),S(e))return e;if(v(e)){let t=n.schema[u].createNode?.(n.schema,null,n);return t.items.push(e),t}(e instanceof String||e instanceof Number||e instanceof Boolean||typeof BigInt<`u`&&e instanceof BigInt)&&(e=e.valueOf());let{aliasDuplicateObjects:r,onAnchor:i,onTagObj:a,schema:o,sourceObjects:s}=n,c;if(r&&e&&typeof e==`object`){if(c=s.get(e),c)return c.anchor??(c.anchor=i(e)),new te(c.anchor);c={anchor:null,node:null},s.set(e,c)}t?.startsWith(`!!`)&&(t=ie+t.slice(2));let l=ae(e,t,o.tags);if(!l){if(e&&typeof e.toJSON==`function`&&(e=e.toJSON()),!e||typeof e!=`object`){let t=new F(e);return c&&(c.node=t),t}l=e instanceof Map?o[u]:Symbol.iterator in Object(e)?o[p]:o[u]}a&&(a(l),delete n.onTagObj);let d=l?.createNode?l.createNode(n.schema,e,n):typeof l?.nodeClass?.from==`function`?l.nodeClass.from(n.schema,e,n):new F(e);return t?d.tag=t:l.default||(d.tag=l.tag),c&&(c.node=d),d}function oe(e,t,n){let r=n;for(let e=t.length-1;e>=0;--e){let n=t[e];if(typeof n==`number`&&Number.isInteger(n)&&n>=0){let e=[];e[n]=r,r=e}else r=new Map([[n,r]])}return I(r,void 0,{aliasDuplicateObjects:!1,keepUndefined:!1,onAnchor:()=>{throw Error(`This should not happen, please report a bug.`)},schema:e,sourceObjects:new Map})}var se=e=>e==null||typeof e==`object`&&!!e[Symbol.iterator]().next().done,ce=class extends ee{constructor(e,t){super(e),Object.defineProperty(this,"schema",{value:t,configurable:!0,enumerable:!1,writable:!0})}clone(e){let t=Object.create(Object.getPrototypeOf(this),Object.getOwnPropertyDescriptors(this));return e&&(t.schema=e),t.items=t.items.map(t=>S(t)||v(t)?t.clone(e):t),this.range&&(t.range=this.range.slice()),t}addIn(e,t){if(se(e))this.add(t);else{let[n,...r]=e,i=this.get(n,!0);if(x(i))i.addIn(r,t);else if(i===void 0&&this.schema)this.set(n,oe(this.schema,r,t));else throw Error(`Expected YAML collection at ${n}. Remaining path: ${r}`)}}deleteIn(e){let[t,...n]=e;if(n.length===0)return this.delete(t);let r=this.get(t,!0);if(x(r))return r.deleteIn(n);throw Error(`Expected YAML collection at ${t}. Remaining path: ${n}`)}getIn(e,t){let[n,...r]=e,i=this.get(n,!0);return r.length===0?!t&&y(i)?i.value:i:x(i)?i.getIn(r,t):void 0}hasAllNullValues(e){return this.items.every(t=>{if(!v(t))return!1;let n=t.value;return n==null||e&&y(n)&&n.value==null&&!n.commentBefore&&!n.comment&&!n.tag})}hasIn(e){let[t,...n]=e;if(n.length===0)return this.has(t);let r=this.get(t,!0);return x(r)?r.hasIn(n):!1}setIn(e,t){let[n,...r]=e;if(r.length===0)this.set(n,t);else{let e=this.get(n,!0);if(x(e))e.setIn(r,t);else if(e===void 0&&this.schema)this.set(n,oe(this.schema,r,t));else throw Error(`Expected YAML collection at ${n}. Remaining path: ${r}`)}}},le=e=>e.replace(/^(?!$)(?: $)?/gm,`#`);function ue(e,t){return/^\n+$/.test(e)?e.substring(1):t?e.replace(/^(?! *$)/gm,t):e}var L=(e,t,n)=>e.endsWith(`
`)?ue(n,t):n.includes(`
`)?`
`+ue(n,t):(e.endsWith(` `)?``:` `)+n,de=`flow`,fe=`block`,R=`quoted`;function z(e,t,n=`flow`,{indentAtStart:r,lineWidth:i=80,minContentWidth:a=20,onFold:o,onOverflow:s}={}){if(!i||i<0)return e;i<a&&(a=0);let c=Math.max(1+a,1+i-t.length);if(e.length<=c)return e;let l=[],u={},d=i-t.length;typeof r==`number`&&(r>i-Math.max(2,a)?l.push(0):d=i-r);let f,p,m=!1,h=-1,g=-1,_=-1;n===`block`&&(h=pe(e,h,t.length),h!==-1&&(d=h+c));for(let r;r=e[h+=1];){if(n===`quoted`&&r===`\\`){switch(g=h,e[h+1]){case`x`:h+=3;break;case`u`:h+=5;break;case`U`:h+=9;break;default:h+=1}_=h}if(r===`
`)n===`block`&&(h=pe(e,h,t.length)),d=h+t.length+c,f=void 0;else{if(r===` `&&p&&p!==` `&&p!==`
`&&p!==`	`){let t=e[h+1];t&&t!==` `&&t!==`
`&&t!==`	`&&(f=h)}if(h>=d){if(f)l.push(f),d=f+c,f=void 0;else if(n===`quoted`){for(;p===` `||p===`	`;)p=r,r=e[h+=1],m=!0;let t=h>_+1?h-2:g-1;if(u[t])return e;l.push(t),u[t]=!0,d=t+c,f=void 0}else m=!0}}p=r}if(m&&s&&s(),l.length===0)return e;o&&o();let v=e.slice(0,l[0]);for(let r=0;r<l.length;++r){let i=l[r],a=l[r+1]||e.length;i===0?v=`\n${t}${e.slice(0,a)}`:(n===`quoted`&&u[i]&&(v+=`${e[i]}\\`),v+=`\n${t}${e.slice(i+1,a)}`)}return v}function pe(e,t,n){let r=t,i=t+1,a=e[i];for(;a===` `||a===`	`;)if(t<i+n)a=e[++t];else{do a=e[++t];while(a&&a!==`
`);r=t,i=t+1,a=e[i]}return r}var B=(e,t)=>({indentAtStart:t?e.indent.length:e.indentAtStart,lineWidth:e.options.lineWidth,minContentWidth:e.options.minContentWidth}),V=e=>/^(%|---|\.\.\.)/m.test(e);function me(e,t,n){if(!t||t<0)return!1;let r=t-n,i=e.length;if(i<=r)return!1;for(let t=0,n=0;t<i;++t)if(e[t]===`
`){if(t-n>r)return!0;if(n=t+1,i-n<=r)return!1}return!0}function he(e,t){let n=JSON.stringify(e);if(t.options.doubleQuotedAsJSON)return n;let{implicitKey:r}=t,i=t.options.doubleQuotedMinMultiLineLength,a=t.indent||(V(e)?`  `:``),o=``,s=0;for(let e=0,t=n[e];t;t=n[++e])if(t===` `&&n[e+1]===`\\`&&n[e+2]===`n`&&(o+=n.slice(s,e)+`\\ `,e+=1,s=e,t=`\\`),t===`\\`)switch(n[e+1]){case`u`:{o+=n.slice(s,e);let t=n.substr(e+2,4);switch(t){case`0000`:o+=`\\0`;break;case`0007`:o+=`\\a`;break;case`000b`:o+=`\\v`;break;case`001b`:o+=`\\e`;break;case`0085`:o+=`\\N`;break;case`00a0`:o+=`\\_`;break;case`2028`:o+=`\\L`;break;case`2029`:o+=`\\P`;break;default:t.substr(0,2)===`00`?o+=`\\x`+t.substr(2):o+=n.substr(e,6)}e+=5,s=e+1}break;case`n`:if(r||n[e+2]===`"`||n.length<i)e+=1;else{for(o+=n.slice(s,e)+`

`;n[e+2]===`\\`&&n[e+3]===`n`&&n[e+4]!==`"`;)o+=`
`,e+=2;o+=a,n[e+2]===` `&&(o+=`\\`),e+=1,s=e+1}break;default:e+=1}return o=s?o+n.slice(s):n,r?o:z(o,a,R,B(t,!1))}function ge(e,t){if(t.options.singleQuote===!1||t.implicitKey&&e.includes(`
`)||/[ \t]\n|\n[ \t]/.test(e))return he(e,t);let n=t.indent||(V(e)?`  `:``),r=`'`+e.replace(/'/g,`''`).replace(/\n+/g,`$&\n${n}`)+`'`;return t.implicitKey?r:z(r,n,de,B(t,!1))}function _e(e,t){let{singleQuote:n}=t.options,r;if(n===!1)r=he;else{let t=e.includes(`"`),i=e.includes(`'`);r=t&&!i?ge:i&&!t?he:n?ge:he}return r(e,t)}var ve;try{ve=RegExp(`(^|(?<!
))
+(?!
|$)`,`g`)}catch{ve=/\n+(?!\n|$)/g}function ye({comment:e,type:t,value:n},r,i,a){let{blockQuote:o,commentString:s,lineWidth:c}=r.options;if(!o||/\n[\t ]+$/.test(n))return _e(n,r);let l=r.indent||(r.forceBlockIndent||V(n)?`  `:``),u=o===`literal`?!0:o===`folded`||t===F.BLOCK_FOLDED?!1:t===F.BLOCK_LITERAL||!me(n,c,l.length);if(!n)return u?`|
`:`>
`;let d,f;for(f=n.length;f>0;--f){let e=n[f-1];if(e!==`
`&&e!==`	`&&e!==` `)break}let p=n.substring(f),m=p.indexOf(`
`);m===-1?d=`-`:n===p||m!==p.length-1?(d=`+`,a&&a()):d=``,p&&=(n=n.slice(0,-p.length),p[p.length-1]===`
`&&(p=p.slice(0,-1)),p.replace(ve,`$&${l}`));let h=!1,g,_=-1;for(g=0;g<n.length;++g){let e=n[g];if(e===` `)h=!0;else if(e===`
`)_=g;else break}let v=n.substring(0,_<g?_+1:g);v&&=(n=n.substring(v.length),v.replace(/\n+/g,`$&${l}`));let y=(h?l?`2`:`1`:``)+d;if(e&&(y+=` `+s(e.replace(/ ?[\r\n]+/g,` `)),i&&i()),!u){let e=n.replace(/\n+/g,`
$&`).replace(/(?:^|\n)([\t ].*)(?:([\n\t ]*)\n(?![\n\t ]))?/g,`$1$2`).replace(/\n+/g,`$&${l}`),i=!1,a=B(r,!0);o!==`folded`&&t!==F.BLOCK_FOLDED&&(a.onOverflow=()=>{i=!0});let s=z(`${v}${e}${p}`,l,fe,a);if(!i)return`>${y}\n${l}${s}`}return n=n.replace(/\n+/g,`$&${l}`),`|${y}\n${l}${v}${n}${p}`}function be(e,t,n,r){let{type:i,value:a}=e,{actualString:o,implicitKey:s,indent:c,indentStep:l,inFlow:u}=t;if(s&&a.includes(`
`)||u&&/[[\]{},]/.test(a))return _e(a,t);if(/^[\n\t ,[\]{}#&*!|>'"%@`]|^[?-]$|^[?-][ \t]|[\n:][ \t]|[ \t]\n|[\n\t ]#|[\n\t :]$/.test(a))return s||u||!a.includes(`
`)?_e(a,t):ye(e,t,n,r);if(!s&&!u&&i!==F.PLAIN&&a.includes(`
`))return ye(e,t,n,r);if(V(a)){if(c===``)return t.forceBlockIndent=!0,ye(e,t,n,r);if(s&&c===l)return _e(a,t)}let d=a.replace(/\n+/g,`$&\n${c}`);if(o){let e=e=>e.default&&e.tag!==`tag:yaml.org,2002:str`&&e.test?.test(d),{compat:n,tags:r}=t.doc.schema;if(r.some(e)||n?.some(e))return _e(a,t)}return s?d:z(d,c,de,B(t,!1))}function xe(e,t,n,r){let{implicitKey:i,inFlow:a}=t,o=typeof e.value==`string`?e:Object.assign({},e,{value:String(e.value)}),{type:s}=e;s!==F.QUOTE_DOUBLE&&/[\x00-\x08\x0b-\x1f\x7f-\x9f\u{D800}-\u{DFFF}]/u.test(o.value)&&(s=F.QUOTE_DOUBLE);let c=e=>{switch(e){case F.BLOCK_FOLDED:case F.BLOCK_LITERAL:return i||a?_e(o.value,t):ye(o,t,n,r);case F.QUOTE_DOUBLE:return he(o.value,t);case F.QUOTE_SINGLE:return ge(o.value,t);case F.PLAIN:return be(o,t,n,r);default:return null}},l=c(s);if(l===null){let{defaultKeyType:e,defaultStringType:n}=t.options,r=i&&e||n;if(l=c(r),l===null)throw Error(`Unsupported default string type ${r}`)}return l}function Se(e,t){let n=Object.assign({blockQuote:!0,commentString:le,defaultKeyType:null,defaultStringType:`PLAIN`,directives:null,doubleQuotedAsJSON:!1,doubleQuotedMinMultiLineLength:40,falseStr:`false`,flowCollectionPadding:!0,indentSeq:!0,lineWidth:80,minContentWidth:20,nullStr:`null`,simpleKeys:!1,singleQuote:null,trailingComma:!1,trueStr:`true`,verifyAliasOrder:!0},e.schema.toStringOptions,t),r;switch(n.collectionStyle){case`block`:r=!1;break;case`flow`:r=!0;break;default:r=null}return{anchors:new Set,doc:e,flowCollectionPadding:n.flowCollectionPadding?` `:``,indent:``,indentStep:typeof n.indent==`number`?` `.repeat(n.indent):`  `,inFlow:r,options:n}}function Ce(e,t){if(t.tag){let n=e.filter(e=>e.tag===t.tag);if(n.length>0)return n.find(e=>e.format===t.format)??n[0]}let n,r;if(y(t)){r=t.value;let i=e.filter(e=>e.identify?.(r));if(i.length>1){let e=i.filter(e=>e.test);e.length>0&&(i=e)}n=i.find(e=>e.format===t.format)??i.find(e=>!e.format)}else r=t,n=e.find(e=>e.nodeClass&&r instanceof e.nodeClass);if(!n){let e=r?.constructor?.name??(r===null?`null`:typeof r);throw Error(`Tag not resolved for ${e} value`)}return n}function we(e,t,{anchors:n,doc:r}){if(!r.directives)return``;let i=[],a=(y(e)||x(e))&&e.anchor;a&&M(a)&&(n.add(a),i.push(`&${a}`));let o=e.tag??(t.default?null:t.tag);return o&&i.push(r.directives.tagString(o)),i.join(` `)}function Te(e,t,n,r){if(v(e))return e.toString(t,n,r);if(h(e)){if(t.doc.directives)return e.toString(t);if(t.resolvedAliases?.has(e))throw TypeError(`Cannot stringify circular structure without alias nodes`);t.resolvedAliases?t.resolvedAliases.add(e):t.resolvedAliases=new Set([e]),e=e.resolve(t.doc)}let i,a=S(e)?e:t.doc.createNode(e,{onTagObj:e=>i=e});i??=Ce(t.doc.schema.tags,a);let o=we(a,i,t);o.length>0&&(t.indentAtStart=(t.indentAtStart??0)+o.length+1);let s=typeof i.stringify==`function`?i.stringify(a,t,n,r):y(a)?xe(a,t,n,r):a.toString(t,n,r);return o?y(a)||s[0]===`{`||s[0]===`[`?`${o} ${s}`:`${o}\n${t.indent}${s}`:s}function Ee({key:e,value:t},n,r,i){let{allNullValues:a,doc:o,indent:s,indentStep:c,options:{commentString:l,indentSeq:u,simpleKeys:d}}=n,f=S(e)&&e.comment||null;if(d){if(f)throw Error(`With simple keys, key nodes cannot have comments`);if(x(e)||!S(e)&&typeof e==`object`)throw Error(`With simple keys, collection cannot be used as a key value`)}let p=!d&&(!e||f&&t==null&&!n.inFlow||x(e)||(y(e)?e.type===F.BLOCK_FOLDED||e.type===F.BLOCK_LITERAL:typeof e==`object`));n=Object.assign({},n,{allNullValues:!1,implicitKey:!p&&(d||!a),indent:s+c});let m=!1,h=!1,g=Te(e,n,()=>m=!0,()=>h=!0);if(!p&&!n.inFlow&&g.length>1024){if(d)throw Error(`With simple keys, single line scalar must not span more than 1024 characters`);p=!0}if(n.inFlow){if(a||t==null)return m&&r&&r(),g===``?`?`:p?`? ${g}`:g}else if(a&&!d||t==null&&p)return g=`? ${g}`,f&&!m?g+=L(g,n.indent,l(f)):h&&i&&i(),g;m&&(f=null),p?(f&&(g+=L(g,n.indent,l(f))),g=`? ${g}\n${s}:`):(g=`${g}:`,f&&(g+=L(g,n.indent,l(f))));let _,v,C;S(t)?(_=!!t.spaceBefore,v=t.commentBefore,C=t.comment):(_=!1,v=null,C=null,t&&typeof t==`object`&&(t=o.createNode(t))),n.implicitKey=!1,!p&&!f&&y(t)&&(n.indentAtStart=g.length+1),h=!1,!u&&c.length>=2&&!n.inFlow&&!p&&b(t)&&!t.flow&&!t.tag&&!t.anchor&&(n.indent=n.indent.substring(2));let w=!1,T=Te(t,n,()=>w=!0,()=>h=!0),E=` `;if(f||_||v){if(E=_?`
`:``,v){let e=l(v);E+=`\n${ue(e,n.indent)}`}T===``&&!n.inFlow?E===`
`&&C&&(E=`

`):E+=`\n${n.indent}`}else if(!p&&x(t)){let e=T[0],r=T.indexOf(`
`),i=r!==-1,a=n.inFlow??t.flow??t.items.length===0;if(i||!a){let t=!1;if(i&&(e===`&`||e===`!`)){let n=T.indexOf(` `);e===`&`&&n!==-1&&n<r&&T[n+1]===`!`&&(n=T.indexOf(` `,n+1)),(n===-1||r<n)&&(t=!0)}t||(E=`\n${n.indent}`)}}else(T===``||T[0]===`
`)&&(E=``);return g+=E+T,n.inFlow?w&&r&&r():C&&!w?g+=L(g,n.indent,l(C)):h&&i&&i(),g}function De(e,t){(e===`debug`||e===`warn`)&&console.warn(t)}var Oe=`<<`,ke={identify:e=>e===Oe||typeof e==`symbol`&&e.description===Oe,default:`key`,tag:`tag:yaml.org,2002:merge`,test:/^<<$/,resolve:()=>Object.assign(new F(Symbol(Oe)),{addToJSMap:je}),stringify:()=>Oe},Ae=(e,t)=>(ke.identify(t)||y(t)&&(!t.type||t.type===F.PLAIN)&&ke.identify(t.value))&&e?.doc.schema.tags.some(e=>e.tag===ke.tag&&e.default);function je(e,t,n){let r=Ne(e,n);if(b(r))for(let n of r.items)Me(e,t,n);else if(Array.isArray(r))for(let n of r)Me(e,t,n);else Me(e,t,r)}function Me(e,t,n){let r=Ne(e,n);if(!_(r))throw Error(`Merge sources must be maps or map aliases`);let i=r.toJSON(null,e,Map);for(let[e,n]of i)t instanceof Map?t.has(e)||t.set(e,n):t instanceof Set?t.add(e):Object.prototype.hasOwnProperty.call(t,e)||Object.defineProperty(t,e,{value:n,writable:!0,enumerable:!0,configurable:!0});return t}function Ne(e,t){return e&&h(t)?t.resolve(e.doc,e):t}function Pe(e,t,{key:n,value:r}){if(S(n)&&n.addToJSMap)n.addToJSMap(e,t,r);else if(Ae(e,n))je(e,t,r);else{let i=P(n,``,e);if(t instanceof Map)t.set(i,P(r,i,e));else if(t instanceof Set)t.add(i);else{let a=Fe(n,i,e),o=P(r,a,e);a in t?Object.defineProperty(t,a,{value:o,writable:!0,enumerable:!0,configurable:!0}):t[a]=o}}return t}function Fe(e,t,n){if(t===null)return``;if(typeof t!=`object`)return String(t);if(S(e)&&n?.doc){let t=Se(n.doc,{});t.anchors=new Set;for(let e of n.anchors.keys())t.anchors.add(e.anchor);t.inFlow=!0,t.inStringifyKey=!0;let r=e.toString(t);if(!n.mapKeyWarned){let e=JSON.stringify(r);e.length>40&&(e=e.substring(0,36)+`..."`),De(n.doc.options.logLevel,`Keys with collection values will be stringified due to JS Object restrictions: ${e}. Set mapAsMap: true to use object keys.`),n.mapKeyWarned=!0}return r}return JSON.stringify(t)}function Ie(e,t,n){return new Le(I(e,void 0,n),I(t,void 0,n))}var Le=class e{constructor(e,t=null){Object.defineProperty(this,m,{value:d}),this.key=e,this.value=t}clone(t){let{key:n,value:r}=this;return S(n)&&(n=n.clone(t)),S(r)&&(r=r.clone(t)),new e(n,r)}toJSON(e,t){return Pe(t,t?.mapAsMap?new Map:{},this)}toString(e,t,n){return e?.doc?Ee(this,e,t,n):JSON.stringify(this)}};function Re(e,t,n){return(t.inFlow??e.flow?Be:ze)(e,t,n)}function ze({comment:e,items:t},n,{blockItemPrefix:r,flowChars:i,itemIndent:a,onChompKeep:o,onComment:s}){let{indent:c,options:{commentString:l}}=n,u=Object.assign({},n,{indent:a,type:null}),d=!1,f=[];for(let e=0;e<t.length;++e){let i=t[e],o=null;if(S(i))!d&&i.spaceBefore&&f.push(``),Ve(n,f,i.commentBefore,d),i.comment&&(o=i.comment);else if(v(i)){let e=S(i.key)?i.key:null;e&&(!d&&e.spaceBefore&&f.push(``),Ve(n,f,e.commentBefore,d))}d=!1;let s=Te(i,u,()=>o=null,()=>d=!0);o&&(s+=L(s,a,l(o))),d&&o&&(d=!1),f.push(r+s)}let p;if(f.length===0)p=i.start+i.end;else{p=f[0];for(let e=1;e<f.length;++e){let t=f[e];p+=t?`\n${c}${t}`:`
`}}return e?(p+=`
`+ue(l(e),c),s&&s()):d&&o&&o(),p}function Be({items:e},t,{flowChars:n,itemIndent:r}){let{indent:i,indentStep:a,flowCollectionPadding:o,options:{commentString:s}}=t;r+=a;let c=Object.assign({},t,{indent:r,inFlow:!0,type:null}),l=!1,u=0,d=[];for(let n=0;n<e.length;++n){let i=e[n],a=null;if(S(i))i.spaceBefore&&d.push(``),Ve(t,d,i.commentBefore,!1),i.comment&&(a=i.comment);else if(v(i)){let e=S(i.key)?i.key:null;e&&(e.spaceBefore&&d.push(``),Ve(t,d,e.commentBefore,!1),e.comment&&(l=!0));let n=S(i.value)?i.value:null;n?(n.comment&&(a=n.comment),n.commentBefore&&(l=!0)):i.value==null&&e?.comment&&(a=e.comment)}a&&(l=!0);let o=Te(i,c,()=>a=null);l||=d.length>u||o.includes(`
`),n<e.length-1?o+=`,`:t.options.trailingComma&&(t.options.lineWidth>0&&(l||=d.reduce((e,t)=>e+t.length+2,2)+(o.length+2)>t.options.lineWidth),l&&(o+=`,`)),a&&(o+=L(o,r,s(a))),d.push(o),u=d.length}let{start:f,end:p}=n;if(d.length===0)return f+p;if(!l){let e=d.reduce((e,t)=>e+t.length+2,2);l=t.options.lineWidth>0&&e>t.options.lineWidth}if(l){let e=f;for(let t of d)e+=t?`\n${a}${i}${t}`:`
`;return`${e}\n${i}${p}`}return`${f}${o}${d.join(` `)}${o}${p}`}function Ve({indent:e,options:{commentString:t}},n,r,i){if(r&&i&&(r=r.replace(/^\n+/,``)),r){let i=ue(t(r),e);n.push(i.trimStart())}}function He(e,t){let n=y(t)?t.value:t;for(let r of e)if(v(r)&&(r.key===t||r.key===n||y(r.key)&&r.key.value===n))return r}var Ue=class extends ce{static get tagName(){return`tag:yaml.org,2002:map`}constructor(e){super(u,e),this.items=[]}static from(e,t,n){let{keepUndefined:r,replacer:i}=n,a=new this(e),o=(e,o)=>{if(typeof i==`function`)o=i.call(t,e,o);else if(Array.isArray(i)&&!i.includes(e))return;(o!==void 0||r)&&a.items.push(Ie(e,o,n))};if(t instanceof Map)for(let[e,n]of t)o(e,n);else if(t&&typeof t==`object`)for(let e of Object.keys(t))o(e,t[e]);return typeof e.sortMapEntries==`function`&&a.items.sort(e.sortMapEntries),a}add(e,t){let n;n=v(e)?e:!e||typeof e!=`object`||!(`key`in e)?new Le(e,e?.value):new Le(e.key,e.value);let r=He(this.items,n.key),i=this.schema?.sortMapEntries;if(r){if(!t)throw Error(`Key ${n.key} already set`);y(r.value)&&re(n.value)?r.value.value=n.value:r.value=n.value}else if(i){let e=this.items.findIndex(e=>i(n,e)<0);e===-1?this.items.push(n):this.items.splice(e,0,n)}else this.items.push(n)}delete(e){let t=He(this.items,e);return t?this.items.splice(this.items.indexOf(t),1).length>0:!1}get(e,t){let n=He(this.items,e)?.value;return(!t&&y(n)?n.value:n)??void 0}has(e){return!!He(this.items,e)}set(e,t){this.add(new Le(e,t),!0)}toJSON(e,t,n){let r=n?new n:t?.mapAsMap?new Map:{};t?.onCreate&&t.onCreate(r);for(let e of this.items)Pe(t,r,e);return r}toString(e,t,n){if(!e)return JSON.stringify(this);for(let e of this.items)if(!v(e))throw Error(`Map items must all be pairs; found ${JSON.stringify(e)} instead`);return!e.allNullValues&&this.hasAllNullValues(!1)&&(e=Object.assign({},e,{allNullValues:!0})),Re(this,e,{blockItemPrefix:``,flowChars:{start:`{`,end:`}`},itemIndent:e.indent||``,onChompKeep:n,onComment:t})}},We={collection:`map`,default:!0,nodeClass:Ue,tag:`tag:yaml.org,2002:map`,resolve(e,t){return _(e)||t(`Expected a mapping for this tag`),e},createNode:(e,t,n)=>Ue.from(e,t,n)},Ge=class extends ce{static get tagName(){return`tag:yaml.org,2002:seq`}constructor(e){super(p,e),this.items=[]}add(e){this.items.push(e)}delete(e){let t=Ke(e);return typeof t==`number`&&this.items.splice(t,1).length>0}get(e,t){let n=Ke(e);if(typeof n!=`number`)return;let r=this.items[n];return!t&&y(r)?r.value:r}has(e){let t=Ke(e);return typeof t==`number`&&t<this.items.length}set(e,t){let n=Ke(e);if(typeof n!=`number`)throw Error(`Expected a valid index, not ${e}.`);let r=this.items[n];y(r)&&re(t)?r.value=t:this.items[n]=t}toJSON(e,t){let n=[];t?.onCreate&&t.onCreate(n);let r=0;for(let e of this.items)n.push(P(e,String(r++),t));return n}toString(e,t,n){return e?Re(this,e,{blockItemPrefix:`- `,flowChars:{start:`[`,end:`]`},itemIndent:(e.indent||``)+`  `,onChompKeep:n,onComment:t}):JSON.stringify(this)}static from(e,t,n){let{replacer:r}=n,i=new this(e);if(t&&Symbol.iterator in Object(t)){let e=0;for(let a of t){if(typeof r==`function`){let n=t instanceof Set?a:String(e++);a=r.call(t,n,a)}i.items.push(I(a,void 0,n))}}return i}};function Ke(e){let t=y(e)?e.value:e;return t&&typeof t==`string`&&(t=Number(t)),typeof t==`number`&&Number.isInteger(t)&&t>=0?t:null}var qe={collection:`seq`,default:!0,nodeClass:Ge,tag:`tag:yaml.org,2002:seq`,resolve(e,t){return b(e)||t(`Expected a sequence for this tag`),e},createNode:(e,t,n)=>Ge.from(e,t,n)};function Je(e){return typeof e==`bigint`||Number.isInteger(e)}var Ye=({value:e})=>JSON.stringify(e),Xe=[{identify:e=>typeof e==`string`,default:!0,tag:`tag:yaml.org,2002:str`,resolve:e=>e,stringify:Ye},{identify:e=>e==null,createNode:()=>new F(null),default:!0,tag:`tag:yaml.org,2002:null`,test:/^null$/,resolve:()=>null,stringify:Ye},{identify:e=>typeof e==`boolean`,default:!0,tag:`tag:yaml.org,2002:bool`,test:/^true$|^false$/,resolve:e=>e===`true`,stringify:Ye},{identify:Je,default:!0,tag:`tag:yaml.org,2002:int`,test:/^-?(?:0|[1-9][0-9]*)$/,resolve:(e,t,{intAsBigInt:n})=>n?BigInt(e):parseInt(e,10),stringify:({value:e})=>Je(e)?e.toString():JSON.stringify(e)},{identify:e=>typeof e==`number`,default:!0,tag:`tag:yaml.org,2002:float`,test:/^-?(?:0|[1-9][0-9]*)(?:\.[0-9]*)?(?:[eE][-+]?[0-9]+)?$/,resolve:e=>parseFloat(e),stringify:Ye}];[We,qe].concat(Xe,{default:!0,tag:``,test:/^/,resolve(e,t){return t(`Unresolved plain scalar ${JSON.stringify(e)}`),e}});function Ze(e,t,n){let{replacer:r}=n,i=new Ge(e);i.tag=`tag:yaml.org,2002:pairs`;let a=0;if(t&&Symbol.iterator in Object(t))for(let e of t){typeof r==`function`&&(e=r.call(t,String(a++),e));let o,s;if(Array.isArray(e)){if(e.length===2)o=e[0],s=e[1];else throw TypeError(`Expected [key, value] tuple: ${e}`)}else if(e&&e instanceof Object){let t=Object.keys(e);if(t.length===1)o=t[0],s=e[o];else throw TypeError(`Expected tuple with one key, not ${t.length} keys`)}else o=e;i.items.push(Ie(o,s,n))}return i}var Qe=class e extends Ge{constructor(){super(),this.add=Ue.prototype.add.bind(this),this.delete=Ue.prototype.delete.bind(this),this.get=Ue.prototype.get.bind(this),this.has=Ue.prototype.has.bind(this),this.set=Ue.prototype.set.bind(this),this.tag=e.tag}toJSON(e,t){if(!t)return super.toJSON(e);let n=new Map;t?.onCreate&&t.onCreate(n);for(let e of this.items){let r,i;if(v(e)?(r=P(e.key,``,t),i=P(e.value,r,t)):r=P(e,``,t),n.has(r))throw Error(`Ordered maps must not include duplicate keys`);n.set(r,i)}return n}static from(e,t,n){let r=Ze(e,t,n),i=new this;return i.items=r.items,i}};Qe.tag=`tag:yaml.org,2002:omap`;var $e=class e extends Ue{constructor(t){super(t),this.tag=e.tag}add(e){let t;t=v(e)?e:e&&typeof e==`object`&&`key`in e&&`value`in e&&e.value===null?new Le(e.key,null):new Le(e,null),He(this.items,t.key)||this.items.push(t)}get(e,t){let n=He(this.items,e);return!t&&v(n)?y(n.key)?n.key.value:n.key:n}set(e,t){if(typeof t!=`boolean`)throw Error(`Expected boolean value for set(key, value) in a YAML set, not ${typeof t}`);let n=He(this.items,e);n&&!t?this.items.splice(this.items.indexOf(n),1):!n&&t&&this.items.push(new Le(e))}toJSON(e,t){return super.toJSON(e,t,Set)}toString(e,t,n){if(!e)return JSON.stringify(this);if(this.hasAllNullValues(!0))return super.toString(Object.assign({},e,{allNullValues:!0}),t,n);throw Error(`Set items must all have null values`)}static from(e,t,n){let{replacer:r}=n,i=new this(e);if(t&&Symbol.iterator in Object(t))for(let e of t)typeof r==`function`&&(e=r.call(t,e,e)),i.items.push(Ie(e,null,n));return i}};$e.tag=`tag:yaml.org,2002:set`;var et=Symbol(`break visit`),tt=Symbol(`skip children`),nt=Symbol(`remove item`);function rt(e,t){`type`in e&&e.type===`document`&&(e={start:e.start,value:e.value}),it(Object.freeze([]),e,t)}rt.BREAK=et,rt.SKIP=tt,rt.REMOVE=nt,rt.itemAtPath=(e,t)=>{let n=e;for(let[e,r]of t){let t=n?.[e];if(t&&`items`in t)n=t.items[r];else return}return n},rt.parentCollection=(e,t)=>{let n=rt.itemAtPath(e,t.slice(0,-1)),r=t[t.length-1][0],i=n?.[r];if(i&&`items`in i)return i;throw Error(`Parent collection not found`)};function it(e,t,n){let r=n(t,e);if(typeof r==`symbol`)return r;for(let i of[`key`,`value`]){let a=t[i];if(a&&`items`in a){for(let t=0;t<a.items.length;++t){let r=it(Object.freeze(e.concat([[i,t]])),a.items[t],n);if(typeof r==`number`)t=r-1;else if(r===et)return et;else r===nt&&(a.items.splice(t,1),--t)}typeof r==`function`&&i===`key`&&(r=r(t,e))}}return typeof r==`function`?r(t,e):r}var at={ACTIVITY:1,TIMEOUT:2,AGGREGATION:4,SYNCHRONIZATION:8,COLLECTING:16,DISTRIBUTING:32,DEFAULTED:64,EXPIRED:128};function ot(e){return Object.entries(at).filter(([,t])=>e&t).map(([e])=>e.toLowerCase())}function st(e,t,n){let r=at,i=r.ACTIVITY|r.AGGREGATION|(n.lacp.shortTimeout?r.TIMEOUT:0),a={};for(let n of e.links){let o=t.has(n.id),s=n.members.map((a,s)=>{let c=!o&&!t.has(a.id);if(!n.lag)return{id:a.id,up:c,distributing:c};let l=i|r.SYNCHRONIZATION|r.COLLECTING|r.DISTRIBUTING,u=c?l:i;return{id:a.id,up:c,distributing:c,port:s+1,key:e.links.indexOf(n)+1,actorState:u,partnerState:c?l:0}}),c=s.filter(e=>e.distributing).map(e=>e.id).sort();a[n.id]={id:n.id,lag:n.lag,up:c.length>0,members:s,distributing:c}}return a}function ct(e,t,n){let r=e.distributing;if(r.length===0)return null;if(r.length===1)return{member:r[0],hash:null,index:0,of:1};let i=n.lacp.hash(t),a=i%r.length;return{member:r[a],hash:i,index:a,of:r.length}}function lt(e){let t=e.split(`.`).map(Number);if(t.length!==4||t.some(e=>!Number.isInteger(e)||e<0||e>255))throw Error(`bad IPv4 address: ${e}`);return(t[0]<<24|t[1]<<16|t[2]<<8|t[3])>>>0}function ut(e){return[e>>>24,e>>>16&255,e>>>8&255,e&255].join(`.`)}function dt(e){let[t,n]=e.split(`/`),r=n===void 0?32:Number(n),i=r===0?0:4294967295<<32-r>>>0;return{net:(lt(t)&i)>>>0,bits:r,mask:i}}function ft(e,t){let{net:n,mask:r}=dt(t);return(lt(e)&r)>>>0===n}function pt(e,t){let n=null;for(let r of e)ft(t,r.prefix)&&(!n||dt(r.prefix).bits>dt(n.prefix).bits)&&(n=r);return n}function mt(e,t){return lt(e)-lt(t)}var ht=e=>e.role!==`ce`;function gt(e){return`${e.systemId}.00-00`}function _t(e,t){let r=[];for(let i of e.links)i.kind===`core`&&ht(n(e,i.a.node))&&ht(n(e,i.b.node))&&r.push({link:i.id,a:i.a.node,b:i.b.node,metric:i.metric,...i.cost?{cost:{a:i.cost.a,b:i.cost.b}}:{},state:t[i.id].up?`Up`:`Down`});return r}function vt(e,t,r,i=1,a){let o=n(e,t),s=[],c=[{prefix:`${o.loopback}/32`,metric:0}];for(let i of r){if(i.a!==t&&i.b!==t)continue;let r=e.links.find(e=>e.id===i.link);if(i.state!==`Up`)continue;let a=i.a===t?i.b:i.a,o=i.cost?.[i.a===t?`a`:`b`]??i.metric;s.push({neighbor:a,systemId:n(e,a).systemId,metric:o,link:i.link}),c.push({prefix:r.subnet,metric:o})}return s.sort((e,t)=>e.neighbor.localeCompare(t.neighbor)||e.link.localeCompare(t.link)),c.sort((e,t)=>mt(e.prefix.split(`/`)[0],t.prefix.split(`/`)[0])),{lspId:gt(o),origin:t,seq:i,lifetime:a?.isis.lspLifetimeS??1200,isReach:s,ipReach:c}}function yt(e,t){let n={},r=0;for(let i of e){if(n[i]!==void 0)continue;let e=[i];for(n[i]=r;e.length;){let i=e.pop();for(let a of t){if(a.state!==`Up`)continue;let t=a.a===i?a.b:a.b===i?a.a:null;t&&n[t]===void 0&&(n[t]=r,e.push(t))}}r++}return n}function bt(e,t){let n=Object.fromEntries(e.map(e=>[e.origin,e])),r={[t]:0},i={[t]:[]},a=new Set,o=(e,t,r)=>n[t]?.isReach.some(t=>t.neighbor===e&&t.link===r);for(;;){let e=null;for(let t of Object.keys(r))a.has(t)||(e===null||r[t]<r[e]||r[t]===r[e]&&t<e)&&(e=t);if(e===null)break;a.add(e);for(let s of n[e]?.isReach??[]){if(!o(e,s.neighbor,s.link)||a.has(s.neighbor))continue;let n=r[e]+s.metric,c=e===t?[{node:s.neighbor,link:s.link}]:i[e];r[s.neighbor]===void 0||n<r[s.neighbor]?(r[s.neighbor]=n,i[s.neighbor]=[...c]):n===r[s.neighbor]&&(i[s.neighbor]=xt(i[s.neighbor],c))}}return{dist:r,nextHops:i}}function xt(e,t){let n=[...e];for(let e of t)n.some(t=>t.node===e.node&&t.link===e.link)||n.push(e);return n.sort((e,t)=>e.node.localeCompare(t.node)||e.link.localeCompare(t.link))}function St(e,t,n){let r={};for(let i of e){let e=n.dist[i.origin];if(e!==void 0)for(let a of i.ipReach){let o=e+a.metric,s=n.nextHops[i.origin],c=r[a.prefix],l=i.origin===t;!c||o<c.metric||l&&!c.local?r[a.prefix]={prefix:a.prefix,metric:o,nextHops:[...s],origin:i.origin,local:l}:o===c.metric&&!c.local&&(c.nextHops=xt(c.nextHops,s))}}return r}function Ct(e,t,n,r={}){let i=e.nodes.filter(ht).map(e=>e.id),a=_t(e,t),o=Object.fromEntries(i.map(t=>[t,vt(e,t,a,r[t]??1,n)])),s=yt(i,a),c={},l={},u={};for(let e of i)c[e]=i.filter(t=>s[t]===s[e]).map(e=>o[e]),l[e]=bt(c[e],e),u[e]=St(c[e],e,l[e]);return{routers:i,adjacencies:a,lsps:o,lsdb:c,spf:l,rib:u}}function wt(e,t,n,r,i=r.isis.floodHopDelayMs){let a=e.adjacencies.filter(e=>e.state===`Up`),o=e=>a.filter(t=>t.a===e||t.b===e).map(t=>({node:t.a===e?t.b:t.a,link:t.link})).sort((e,t)=>e.node.localeCompare(t.node)),s=Object.fromEntries(e.routers.map(n=>[n,e.lsps[t]?.seq??0]));s[t]=n.seq;let c=[],l=o(t).map(e=>({t:i,from:t,to:e.node,link:e.link}));for(;l.length;){let e=l[0].t,t=l.filter(t=>t.t===e);l=l.filter(t=>t.t!==e);let r={},a=[];t.sort((e,t)=>e.to.localeCompare(t.to)||e.from.localeCompare(t.from));for(let e of t){(r[e.to]??=new Set).add(e.from);let t;n.seq>s[e.to]?(s[e.to]=n.seq,a.push(e.to),t=`installed`):t=`duplicate`,c.push({...e,seq:n.seq,result:t})}for(let t of a)for(let n of o(t))r[t].has(n.node)||l.push({t:e+i,from:t,to:n.node,link:n.link});l.sort((e,t)=>e.t-t.t)}return c}var Tt=`0.0.0.0`,Et=2147483649,Dt=`224.0.0.5`,Ot=e=>`0x${(e>>>0).toString(16).padStart(8,`0`)}`;function kt(e){if(e==null||e===``)return null;let t=String(e).trim();if(/^\d+$/.test(t)){let e=Number(t)>>>0;return[24,16,8,0].map(t=>e>>>t&255).join(`.`)}return t}var At=(e,t)=>n(e,t).routerId??n(e,t).loopback;function jt(e,t){return kt(t.area)??kt(e.ospf?.area)??`0.0.0.0`}function Mt(e,t){return e.cost?.[t]??e.metric??10}function Nt(e,t){let r=[];for(let i of e.links){if(i.kind!==`core`||!ht(n(e,i.a.node))||!ht(n(e,i.b.node)))continue;let a=t[i.id].up;r.push({link:i.id,a:i.a.node,b:i.b.node,area:jt(e,i),metric:Mt(i,`a`),cost:{a:Mt(i,`a`),b:Mt(i,`b`)},state:a?`Up`:`Down`,nbrState:a?`Full`:`Down`})}return r}function Pt(e,t,n){let r=new Set(t.filter(e=>e.a===n||e.b===n).map(e=>e.area));return r.add(Ft(e,t,n)),[...r].sort((e,t)=>e===`0.0.0.0`?-1:t===`0.0.0.0`?1:mt(e,t))}function Ft(e,t,r){let i=kt(n(e,r).loopbackArea);if(i)return i;let a=t.filter(e=>e.a===r||e.b===r).map(e=>e.area);return!a.length||a.includes(`0.0.0.0`)?a.length?Tt:kt(e.ospf?.area)??`0.0.0.0`:[...a].sort(mt)[0]}function It(e,t,r,i,a=Et){let o=n(e,t),s=[],c=[];Ft(e,i,t)===r&&c.push({type:3,prefix:`${o.loopback}/32`,metric:0});for(let n of i){if(n.area!==r||n.a!==t&&n.b!==t)continue;let i=n.a===t?`a`:`b`,a=e.links.find(e=>e.id===n.link),o=n.cost[i];if(n.state===`Up`){let t=i===`a`?n.b:n.a;s.push({type:1,neighbor:t,linkId:At(e,t),linkData:a[i].ip,metric:o,link:n.link})}n.state===`Up`&&a.subnet&&c.push({type:3,prefix:a.subnet,metric:o})}s.sort((e,t)=>e.neighbor.localeCompare(t.neighbor)||e.link.localeCompare(t.link)),c.sort((e,t)=>mt(e.prefix.split(`/`)[0],t.prefix.split(`/`)[0]));let l=At(e,t);return{lsType:1,lsId:l,advRouter:l,origin:t,area:r,seq:a,age:0,abr:Pt(e,i,t).length>1,links:s,stubs:c,isReach:s.map(e=>({neighbor:e.neighbor,link:e.link,metric:e.metric})),ipReach:c.map(e=>({prefix:e.prefix,metric:e.metric}))}}function Lt(e,t,n){let r=new Set([n]),i=[n];for(;i.length;){let n=i.pop();for(let a of e){if(a.area!==t||a.state!==`Up`)continue;let e=a.a===n?a.b:a.b===n?a.a:null;e&&!r.has(e)&&(r.add(e),i.push(e))}}return r}var Rt=(e,t)=>{let n=[...e];for(let e of t)n.some(t=>t.node===e.node&&t.link===e.link)||n.push(e);return n.sort((e,t)=>e.node.localeCompare(t.node)||e.link.localeCompare(t.link))};function zt(e,t,n,r={}){let i=e.nodes.filter(ht).map(e=>e.id),a=Nt(e,t),o={};for(let t of i)o[t]=Pt(e,a,t);let s=[...new Set(Object.values(o).flat())].sort((e,t)=>e===`0.0.0.0`?-1:t===`0.0.0.0`?1:mt(e,t)),c={};for(let t of i)c[t]=Object.fromEntries(o[t].map(n=>[n,It(e,t,n,a,r[t]??2147483649)]));let l={},u={},d={};for(let e of i){l[e]={},u[e]={},d[e]={};for(let t of o[e]){let n=Lt(a,t,e);l[e][t]=i.filter(e=>n.has(e)&&c[e][t]).map(e=>c[e][t]),u[e][t]=bt(l[e][t],e),d[e][t]=St(l[e][t],e,u[e][t])}}let f=Object.fromEntries(s.map(e=>[e,[]])),p=i.filter(e=>o[e].length>1),m=(t,n,r)=>{for(let i of r){if(i.metric===void 0)continue;let r=f[n].find(e=>e.origin===t&&e.prefix===i.prefix);r?r.metric=Math.min(r.metric,i.metric):f[n].push({lsType:3,origin:t,advRouter:At(e,t),area:n,prefix:i.prefix,metric:i.metric})}},h=(e,t)=>new Set(Object.keys(d[e][t]??{}));for(let e of p)for(let t of o[e])t!==`0.0.0.0`&&o[e].includes(`0.0.0.0`)&&m(e,Tt,Object.values(d[e][t]).filter(t=>!h(e,Tt).has(t.prefix)));let g={},_=(e,t)=>{let n={},r=u[e][t];for(let i of f[t]){if(i.origin===e||r.dist[i.origin]===void 0)continue;let a=r.dist[i.origin]+i.metric,o=r.nextHops[i.origin],s=n[i.prefix];!s||a<s.metric?n[i.prefix]={prefix:i.prefix,metric:a,nextHops:[...o],origin:i.origin,local:!1,type:`inter`,area:t}:a===s.metric&&(s.nextHops=Rt(s.nextHops,o))}return n};for(let e of i)o[e].includes(`0.0.0.0`)&&(g[e]=_(e,Tt));for(let e of p)for(let t of o[e]){if(t===`0.0.0.0`)continue;let n=h(e,t);for(let r of o[e])r!==t&&m(e,t,Object.values(d[e][r]).filter(e=>!n.has(e.prefix)));o[e].includes(`0.0.0.0`)&&m(e,t,Object.values(g[e]??{}).filter(e=>!n.has(e.prefix)))}for(let e of i)o[e].includes(`0.0.0.0`)&&o[e].length>1||o[e].includes(`0.0.0.0`)||(g[e]=Object.assign({},...o[e].map(t=>_(e,t))));let v={};for(let e of i){v[e]={};for(let t of o[e])for(let n of Object.values(d[e][t])){let r=v[e][n.prefix],i={...n,type:`intra`,area:t};!r||n.local||!r.local&&n.metric<r.metric?v[e][n.prefix]=i:!r.local&&n.metric===r.metric&&(r.nextHops=Rt(r.nextHops,n.nextHops))}for(let t of Object.values(g[e]??{}))v[e][t.prefix]||(v[e][t.prefix]=t)}return{protocol:`ospf`,routers:i,areas:o,abrs:p,adjacencies:a,lsas:c,lsdb:l,summaries:f,spf:u,rib:v}}function Bt(e,t){return{routers:e.routers.filter(n=>e.areas[n].includes(t)),adjacencies:e.adjacencies.filter(e=>e.area===t),lsps:Object.fromEntries(e.routers.filter(n=>e.lsas[n][t]).map(n=>[n,e.lsas[n][t]]))}}var Vt={1:10/3,2:10,3:100,4:1e3,5:1e4,6:6e4,7:6e5},Ht=3.5;function Ut(e){return Ht*Vt[e]}function Wt(e){return`01:80:c2:00:00:3${e}`}function Gt(e,t,r,i={pseudowires:[]}){let a=[];for(let i of e.cfm?.linkMegs===!1?[]:e.links){if(i.kind!==`core`||!ht(n(e,i.a.node))||!ht(n(e,i.b.node)))continue;let o=t[i.id].up,s=r.cfm.linkMdLevel,c=r.cfm.ccmIntervalCode;a.push({id:`MEG-${i.id}`,link:i.id,level:s,intervalCode:c,intervalMs:Vt[c],meps:[{mepId:1,node:i.a.node,if:i.a.if,direction:`down`,defect:o?null:`DefRemoteCCM`,rdi:!o},{mepId:2,node:i.b.node,if:i.b.if,direction:`down`,defect:o?null:`DefRemoteCCM`,rdi:!o}]})}for(let t of e.cfm?.megs??[]){let e=i.pseudowires.find(e=>e.id===t.pseudowire)?.state===`Up`,n=t.intervalCode??r.cfm.serviceCcmIntervalCode;a.push({id:t.id,pseudowire:t.pseudowire,level:t.level??r.cfm.serviceMdLevel,intervalCode:n,intervalMs:Vt[n],meps:t.meps.map(t=>({...t,direction:`up`,defect:e?null:`DefRemoteCCM`,rdi:!e}))})}return{megs:a}}function Kt(e,{durationMs:t,failAtMs:n=null}){let r=e.intervalMs,i=Ht*r,[a,o]=e.meps,s=[];for(let e=0;e*r<t;e++)s.push({t:e*r,from:a,to:o,seq:e+1}),s.push({t:e*r+r/2,from:o,to:a,seq:e+1});s.sort((e,t)=>e.t-t.t||e.from.mepId-t.from.mepId);let c={[a.mepId]:0,[o.mepId]:0},l={[a.mepId]:null,[o.mepId]:null},u=[],d=e=>{for(let t of[a,o]){let n=c[t.mepId]+i;l[t.mepId]===null&&n<=e&&(l[t.mepId]=n,u.push({t:n,kind:`defect`,mep:t,text:`MEP ${t.mepId} on ${t.node}: DefRemoteCCM (no CCM for ${Ht} x ${qt(r)})`}))}};for(let e of s){d(e.t);let t=n!==null&&e.t>=n,r=l[e.from.mepId]!==null;u.push({t:e.t,kind:`ccm`,from:e.from,to:e.to,seq:e.seq,rdi:r,lost:t}),t||(c[e.to.mepId]=e.t)}return d(t),u.sort((e,t)=>e.t-t.t||(e.kind===`defect`?-1:1)),{events:u,defectAt:{[a.mepId]:l[a.mepId],[o.mepId]:l[o.mepId]}}}function qt(e){return e>=1e3?`${e/1e3} s`:`${Number.isInteger(e)?e:e.toFixed(2)} ms`}var Jt=`0x0022`,Yt=e=>{let t={};return Object.fromEntries((e.tpTunnels??[]).map(e=>(t[e.src]=(t[e.src]??0)+1,[e.id,e.tunnelNum??t[e.src]])))};function Xt(e,t,r,i){let a=r.mplsTp.globalId,o=t=>n(e,t).routerId??n(e,t).loopback,s=t.lspNum??(t.role===`backup`?2:1),c=`${a}::${o(t.src)}::${i}::${a}::${o(t.dst)}::${i}`;return{tunnelId:c,lspId:`${c}::${s}`,lspNum:s,tunnelNum:i,meps:{[t.src]:`${a}::${o(t.src)}::${i}::${s}`,[t.dst]:`${a}::${o(t.dst)}::${i}::${s}`}}}function Zt(e,t){return e?e.kind===`cfm`?Ut(e.intervalCode??2):(e.intervalMs??t.bfd.intervalMs)*(e.detectMult??t.bfd.detectMult):null}function Qt(e,t){let n=[],r=t.hops.length;r<2&&n.push(`fewer than two hops`),(t.hops[0]?.node!==t.src||t.hops.at(-1)?.node!==t.dst)&&n.push(`hops do not run from source to destination`);for(let i=0;i+1<r;i++){let[r,a]=[t.hops[i],t.hops[i+1]],o=e.links.find(e=>e.id===t.links?.[i]);o?[o.a.node,o.b.node].includes(r.node)&&[o.a.node,o.b.node].includes(a.node)||n.push(`link ${o.id} does not join ${r.node} and ${a.node}`):n.push(`${r.node}-${a.node}: no link ${t.links?.[i]??``}`.trim()),r.fwdOut!==a.fwdIn&&n.push(`forward ${r.node} out ${r.fwdOut??`-`} != ${a.node} in ${a.fwdIn??`-`}`),a.revOut!==r.revIn&&n.push(`reverse ${a.node} out ${a.revOut??`-`} != ${r.node} in ${r.revIn??`-`}`)}return n}function $t(e,t,n){let r=Yt(e),i={},a={},o=[],s=(e,t,n)=>{t!=null&&(i[e]??={},i[e][t]?o.push(`${e}: label ${t} used by ${i[e][t].tunnel} and ${n.tunnel}`):i[e][t]={inLabel:t,...n})},c=(e.tpTunnels??[]).map(i=>{let o=Xt(e,i,n,r[i.id]),c=i.admin??`up`,l=i.hops.length,u=Qt(e,i);c===`up`&&(i.hops.forEach((e,t)=>{t>0&&s(e.node,e.fwdIn,t<l-1?{tunnel:i.id,dir:`fwd`,op:`swap`,outLabel:e.fwdOut,link:i.links[t],next:i.hops[t+1].node}:{tunnel:i.id,dir:`fwd`,op:`pop`,outLabel:null,link:null,next:null}),t<l-1&&s(e.node,e.revIn,t>0?{tunnel:i.id,dir:`rev`,op:`swap`,outLabel:e.revOut,link:i.links[t-1],next:i.hops[t-1].node}:{tunnel:i.id,dir:`rev`,op:`pop`,outLabel:null,link:null,next:null})}),(a[i.src]??={})[i.id]={dir:`fwd`,outLabel:i.hops[0].fwdOut,link:i.links[0],next:i.hops[1]?.node},(a[i.dst]??={})[i.id]={dir:`rev`,outLabel:i.hops[l-1].revOut,link:i.links[l-2],next:i.hops[l-2]?.node});let d=(i.links??[]).filter(e=>t[e]&&!t[e].up),f=i.oam??null,p={},m=[];for(let[e,t]of[[i.src,i.links?.[0]],[i.dst,i.links?.at(-1)]]){let n=null;c===`up`?f&&(d.length||u.length)?n=`${f.kind.toUpperCase()} loss of continuity`:d.includes(t)&&(n=`interface on ${t} down`):n=`admin down`,p[e]=n?`Down`:`Up`,n&&m.push(`${e}: ${n}`)}d.length&&m.push(`link${d.length>1?`s`:``} ${d.join(`, `)} down${f?``:Object.values(p).every(e=>e===`Up`)?`: undetected without OAM, traffic black-holed`:``}`),m.push(...u.map(e=>`label error: ${e}`));let h=c===`up`&&!d.length&&!u.length;return{...i,role:i.role??`primary`,ids:o,admin:c,path:i.hops.map(e=>e.node),broken:d,configErrors:u,oam:f,detectionMs:Zt(f,n),endState:p,state:h?`Up`:`Down`,reasons:m}});return{tunnels:c,groups:c.filter(e=>e.role!==`backup`).map(e=>{let t=c.filter(t=>t.role===`backup`&&t.protects===e.id).map(e=>e.id),n=Object.fromEntries([e.src,e.dst].map(n=>[n,en(c,e,t,n).id]));return{primary:e.id,backups:t,active:n}}),lfib:i,head:a,conflicts:o}}function en(e,t,n,r){if(t.endState[r]===`Up`)return t;for(let t of n){let n=e.find(e=>e.id===t);if(n.endState[r]===`Up`)return n}return t}function tn(e,t,n){let r=e.groups.find(e=>e.primary===t||e.backups.includes(t)),i=r?r.active[n]??t:t;return e.tunnels.find(e=>e.id===i)??null}function nn(e,t){return t.routers.map(t=>`${n(e,t).loopback}/32`).sort((e,t)=>mt(e.split(`/`)[0],t.split(`/`)[0]))}function rn(e,t){return`${n(e,t).loopback}/32`}function an(e,t,n,r){let i={},a={};for(let o of t.routers){i[o]={},a[o]={};for(let s of nn(e,t)){let e=t.rib[o][s];if(!e||e.local)continue;let c=e.nextHops.map(e=>({...e,label:r(e.node,s)})).filter(e=>e.label!==void 0);if(!c.length)continue;a[o][s]={fec:s,nextHops:c,metric:e.metric};let l=n(o,s);l!==void 0&&l!==3&&(i[o][l]={inLabel:l,fec:s,nextHops:c.map(e=>({node:e.node,link:e.link,op:e.label===3?`pop`:`swap`,outLabel:e.label===3?null:e.label}))})}}return{lfib:i,ftn:a}}var on={mode:`ldp`,name:`LDP (RFC 5036)`,build(e,t,n){let i=t.adjacencies.filter(e=>e.state===`Up`).map(e=>({a:e.a,b:e.b,link:e.link,state:`Operational`})),a=e=>[...new Set(i.filter(t=>t.a===e||t.b===e).map(t=>t.a===e?t.b:t.a))],o={};for(let i of t.routers){o[i]={};let a=n.mpls.ldpLabelBase(r(e,i));for(let n of nn(e,t))n===rn(e,i)?o[i][n]=3:t.rib[i][n]?o[i][n]=a++:a++}let s={};for(let e of t.routers){s[e]={};for(let[t,n]of Object.entries(o[e])){let r=Object.fromEntries(a(e).filter(e=>o[e][t]!==void 0).map(e=>[e,o[e][t]]));s[e][t]={local:n,remote:r}}}let{lfib:c,ftn:l}=an(e,t,(e,t)=>o[e][t],(e,t)=>a(e).length?o[e][t]:void 0);return{mode:`ldp`,sessions:i,bindings:s,lfib:c,ftn:l}}},sn=(e,t)=>e.srgb??t.mpls.srgb;function cn(e,t,i){let a=n(e,i);return sn(e,t).base+(a.sidIndex??r(e,a.id))}function ln(e,t,n){return e.nodes.find(r=>r.role!==`ce`&&r.loopback&&cn(e,t,r.id)===n)?.id}var un={ldp:on,sr:{mode:`sr`,name:`SR-MPLS (RFC 8402/8667)`,build(e,t,n){let{base:i}=sn(e,n),a=t=>{let n=e.nodes.find(e=>`${e.loopback}/32`===t);return n.sidIndex??r(e,n.id)},o=(n,r)=>{if(t.rib[n][r])return r===rn(e,n)?3:i+a(r)},s={};for(let n of t.routers){s[n]={};for(let r of nn(e,t))t.rib[n][r]&&(s[n][r]={local:i+a(r),sidIndex:a(r),php:r===rn(e,n)})}let{lfib:c,ftn:l}=an(e,t,(t,n)=>n===rn(e,t)?void 0:o(t,n),o);return{mode:`sr`,sessions:[],bindings:s,lfib:c,ftn:l}}},none:{mode:`none`,name:`static only (no LDP/SR)`,build(){return{mode:`none`,sessions:[],bindings:{},lfib:{},ftn:{}}}}},dn={IGP:0,EGP:1,INCOMPLETE:2};function fn(e){if(!e.length)return{best:null,reason:`no candidates`};let t=[...e],n=[[`highest LOCAL_PREF (§9.1.1)`,e=>-e.localPref],[`shortest AS_PATH (§9.1.2.2 a)`,e=>e.asPath.length],[`lowest ORIGIN (§9.1.2.2 b)`,e=>e.origin]];for(let[e,r]of n){let n=Math.min(...t.map(r)),i=t.filter(e=>r(e)===n);if(i.length===1&&t.length>1)return{best:i[0],reason:e};t=i}let r=new Map;for(let e of t){let t=r.get(e.neighborAs);(!t||e.med<t)&&r.set(e.neighborAs,e.med)}let i=t.filter(e=>e.med===r.get(e.neighborAs));if(i.length===1&&t.length>1)return{best:i[0],reason:`lowest MED, same neighbour AS (§9.1.2.2 c)`};t=i;let a=[[`eBGP over iBGP (§9.1.2.2 d)`,e=>+!e.ebgp],[`lowest IGP cost to NEXT_HOP (§9.1.2.2 e)`,e=>e.igpCost],[`lowest BGP Identifier (§9.1.2.2 f)`,e=>lt(e.bgpId)],[`lowest peer address (§9.1.2.2 g)`,e=>lt(e.peerAddr)]];for(let[e,n]of a){let r=Math.min(...t.map(n)),i=t.filter(e=>n(e)===r);if(i.length===1&&t.length>1)return{best:i[0],reason:e};t=i}return{best:t[0],reason:t.length===e.length&&t.length===1?`only path`:`identical`}}function pn(e,t){if(!t.ce)return[];let r=n(e,t.ce),i=e.links.find(e=>e.id===t.link);return[r.lan,i.subnet].filter(Boolean)}function mn(e,t,n=()=>!0){let r=[],i=[];if(t.ce){let n=e.links.find(e=>e.id===t.link),a=n.a.node===t.ce?n.a:n.b;for(let o of pn(e,t)){let e=o===n.subnet;i.push(o),r.push({prefix:o,type:e?`connected`:`static`,via:{node:t.ce,link:n.id,ip:e?null:a.ip}})}}let a=[];for(let o of t.interfaces??[]){if(i.push(o.prefix),o.kind===`loopback`){r.push({prefix:o.prefix,type:`local`,if:o.name,via:{node:t.pe,link:null,ip:null}});continue}if(o.link&&!n(o.link))continue;let s=o.link?e.links.find(e=>e.id===o.link):null,c=s?s.a.node===t.pe?s.b:s.a:null;a.push({...o,far:c}),r.push({prefix:o.prefix,type:`connected`,if:o.name,via:{node:c?.node??null,link:s?.id??null,ip:null}})}let o={};for(let e of t.statics??[])(o[e.prefix]??=[]).push(e);for(let[e,t]of Object.entries(o)){i.push(e);let n=[...t].sort((e,t)=>(e.preference??1)-(t.preference??1)).map(e=>{let t=a.find(t=>ft(e.nextHop,t.prefix));return{nextHop:e.nextHop,preference:e.preference??1,resolved:!!t,if:t?.name??null,via:t?{node:t.far?.node??null,link:t.link??null,ip:e.nextHop}:null}}),o=n.find(e=>e.resolved);n.forEach(e=>e.state=e===o?`active`:e.resolved?`standby`:`unresolved`),o&&r.push({prefix:e,type:`static`,preference:o.preference,if:o.if,via:o.via,alternatives:n})}return{routes:r,candidates:[...new Set(i)]}}function hn(e,t){if(e.bgp?.sessions)return e.bgp.sessions;let n=[];for(let e=0;e<t.length;e++)for(let r=e+1;r<t.length;r++)n.push({a:t[e],b:t[r],client:null});return n}function gn(e,t,i,a,o=null){let s=e=>!o||o[e]?.up!==!1,c=e.nodes.filter(e=>e.role===`pe`).map(e=>e.id),l=t=>n(e,t).loopback,u=(e,n)=>!!t.rib[e]?.[`${l(n)}/32`],d=hn(e,c).map(({a:e,b:t,client:n=null,configuredOn:r=null})=>{let i=r?[e,t].filter(e=>!r.includes(e)):[],a=u(e,t)&&u(t,e),o={a:e,b:t,client:n,aAddr:l(e),bAddr:l(t),state:a&&!i.length?`Established`:`Active`};return i.length?o.reason=`not configured on ${i.join(`, `)}`:a||(o.reason=`loopbacks unreachable`),o}),f=[...new Set(d.flatMap(e=>[e.a,e.b]))].sort(),p=(e,t)=>d.find(n=>n.a===e&&n.b===t||n.a===t&&n.b===e),m=(e,t)=>p(e,t)?.state===`Established`,h=e=>f.filter(t=>t!==e&&m(e,t)),g=(e,t)=>p(e,t)?.client===t,_={},v={};for(let t of c){_[t]=[],v[t]={};let n=a.mpls.vpnLabelBase(r(e,t));for(let r of e.vrfs??[])for(let i of r.sites.filter(e=>e.pe===t)){let{routes:o,candidates:c}=mn(e,i,s),u=Object.fromEntries(c.map(e=>[e,n++]));for(let e of o){if((v[t][r.name]??={})[e.prefix])continue;v[t][r.name][e.prefix]={...e,vpnLabel:u[e.prefix]};let n=e.prefix;_[t].push({vrf:r.name,rd:i.rd,prefix:n,label:u[n],nextHop:l(t),originator:t,rts:r.rt.export,origin:dn.INCOMPLETE,asPath:[],localPref:a.bgp.localPref,med:0,site:i})}}}let y={};for(let e of f)y[e]=h(e).flatMap(e=>(_[e]??[]).map(t=>({...t,from:e,clusterList:[]})));for(let e=!0,t=0;e&&t<f.length+1;t++){e=!1;for(let t of f)for(let n of[...y[t]]){if(n.clusterList.includes(t))continue;let r=h(t).filter(e=>e!==n.from&&e!==n.originator&&(g(t,n.from)||g(t,e)));for(let i of r)y[i].some(e=>e.originator===n.originator&&e.rd===n.rd&&e.prefix===n.prefix&&e.from===t)||n.clusterList.includes(i)||(y[i].push({...n,from:t,reflectedBy:t,originatorId:n.originator,clusterList:[t,...n.clusterList]}),e=!0)}}let b={};for(let n of c){y[n]??=[],b[n]={};for(let r of e.vrfs??[]){if(!r.sites.some(e=>e.pe===n))continue;let a={...v[n][r.name]??{}},o=y[n].filter(e=>e.rts.some(e=>r.rt.import.includes(e))),s={};for(let e of o)(s[e.prefix]??=[]).push(e);for(let[r,o]of Object.entries(s)){if(a[r])continue;let s=o.filter(e=>t.rib[n][`${e.nextHop}/32`]&&i.ftn[n]?.[`${e.nextHop}/32`]).map(r=>({...r,neighborAs:e.asn,ebgp:!1,igpCost:t.rib[n][`${r.nextHop}/32`].metric,bgpId:r.originator===r.from?r.nextHop:l(r.from),peerAddr:l(r.from)})),{best:c,reason:u}=fn(s);c&&(a[r]={prefix:r,type:`bgp`,rd:c.rd,nextHop:c.nextHop,from:c.from,vpnLabel:c.label,igpCost:c.igpCost,reason:u,candidates:s.length})}b[n][r.name]=Object.fromEntries(Object.entries(a).sort(([e],[t])=>mt(e.split(`/`)[0],t.split(`/`)[0])))}}return{pes:c,speakers:f,sessions:d,originated:_,adjRibIn:y,vrfs:b}}var _n={NR:0,MS:7,SF:11,FS:13};function vn(e){return`01:19:a7:00:00:${(Number.isInteger(Number(e))&&Number(e)>=0&&Number(e)<=255?Number(e):1).toString(16).padStart(2,`0`)}`}function yn(e,t){let n=t.g8032;return{wtrMin:e.wtrMin??n.wtrMin,guardMs:e.guardMs??n.guardMs,holdOffMs:e.holdOffMs??n.holdOffMs,revertive:e.revertive??!0}}function bn(e,t,n){return e.nodes.find(e=>e.node===t)?.ports.find(e=>e.link===n)??null}function xn(e,t,n,r={}){let i=[];for(let a of e.rings??[]){let o=yn(a,n),s=a.links.filter(e=>!t[e]?.up),c=[],l;if(!a.rpl)l=`no-rpl`;else if(s.length){l=`protection`;for(let t of s){let n=e.links.find(e=>e.id===t);for(let e of[n.a.node,n.b.node])bn(a,e,t)&&c.push({node:e,link:t,why:`SF`})}}else l=`idle`,c.push({node:a.rpl.owner,link:a.rpl.link,why:`RPL`}),a.rpl.neighbor&&c.push({node:a.rpl.neighbor,link:a.rpl.link,why:`RPL`});let u=r[a.id];u&&(c=u.blocked,l=u.state??l),i.push({id:a.id,name:a.name,type:a.type,rapsVid:a.rapsVid,level:a.level,state:l,failed:s,blocked:c,timers:o,links:a.links,nodes:a.nodes.map(e=>e.node)})}return{rings:i}}function Sn(e,t){return!e.failed.includes(t)&&!e.blocked.some(e=>e.link===t)}function Cn(e,t,n,r,i){let o=[t.rings.find(e=>e.id===n)],s=e.rings.find(e=>e.id===n);s?.subRingOf&&o.push(t.rings.find(e=>e.id===s.subRingOf));let c=o.filter(Boolean).flatMap(e=>e.links.filter(t=>Sn(e,t))),l=[[r]],u=new Set([r]),d=new Map;for(;l.length;){let t=l.shift(),n=t.at(-1);if(n===i){let e=[];for(let n=1;n<t.length;n++)e.push(d.get(`${t[n-1]}>${t[n]}`));return{nodes:t,links:e}}for(let r of c){let i=e.links.find(e=>e.id===r);if(i.a.node!==n&&i.b.node!==n)continue;let o=a(i,n).remote.node;u.has(o)||(u.add(o),d.set(`${n}>${o}`,r),l.push([...t,o]))}}return null}function wn(e,t,n,{rb:r=!1,dnf:i=!1,bpr:a=0}={},o,s){let c=s.nodes.findIndex(e=>e.id===t)+1,l=Object.keys(_n).find(e=>_n[e]===n);return[{name:`Ethernet II`,fields:{dst:vn(e.ringId??e.id),src:o.mac(c,1),"VLAN (R-APS)":e.rapsVid??`-`,ethertype:`0x8902 (CFM)`}},{name:`R-APS`,fields:{"MEG level":e.level??`-`,version:1,opcode:40,request:`${l} (${n.toString(2).padStart(4,`0`)})`,RB:+!!r,DNF:+!!i,BPR:a,"node id":o.mac(c,1)}}]}function Tn(e,t,n,{avoid:r=null}={}){let i=[],o=new Set([n]),s=[n],c=new Map;for(let n=1;s.length;n++){let l=[];for(let u of s)for(let s of t.links){if(s===r||s===c.get(u))continue;let t=e.links.find(e=>e.id===s);if(t.a.node!==u&&t.b.node!==u)continue;let d=a(t,u).remote.node;o.has(d)||(o.add(d),c.set(d,s),i.push({from:u,to:d,link:s,depth:n}),l.push(d))}s=l}return i}function En(e,t,n,r,i){let a=[],o=r,s=[...i];for(let r=0;s.length&&r<64;r++){let r=s[0];if(ln(e,n,r)===o){s=s.slice(1);continue}let i=t.lfib[o]?.[r];if(!i)return{hops:a,end:o,error:`${o}: no LFIB entry for ${r}`};let c=i.nextHops[0];s=c.op===`pop`?s.slice(1):[c.outLabel,...s.slice(1)],a.push({from:o,to:c.node,link:c.link,stack:s}),o=c.node}return{hops:a,end:o,error:s.length?`forwarding loop`:null}}function Dn(e,t,r,i){return{policies:(e.srPolicies??[]).map(a=>{let o=e.nodes.find(e=>e.loopback===a.endpoint)?.id??null,s=a.segmentList.sids.map(t=>({label:t,node:ln(e,i,t)??null})),c={...a,endpointNode:o,sids:s,valid:!1,path:[a.headend],hops:[]};if(r.mode!==`sr`)return{...c,reason:`SR-MPLS is not the active label mode`};if(!o)return{...c,reason:`endpoint ${a.endpoint} is no router loopback`};let l=s.find(e=>!e.node);if(l)return{...c,reason:`SID ${l.label} is no Prefix-SID in the SRGB`};let u=s.find(r=>r.node!==a.headend&&!t.rib[a.headend]?.[`${n(e,r.node).loopback}/32`]);if(u)return{...c,reason:`SID ${u.label} (${u.node}) unreachable from ${a.headend}`};let{hops:d,end:f,error:p}=En(e,r,i,a.headend,a.segmentList.sids);return p?{...c,hops:d,reason:p}:f===o?{...c,valid:!0,reason:`valid`,hops:d,path:[a.headend,...d.map(e=>e.to)]}:{...c,hops:d,reason:`segment list ends at ${f}, not the endpoint ${o}`}})}}function On(e,t,n,r){return e.policies.find(e=>e.headend===t&&e.color===n&&e.endpointNode===r)??null}function kn(e,t,r,i,a,o=e=>e[0]){let s=[...a];for(;s.length&&ln(e,r,s[0])===i;)s=s.slice(1);if(!s.length)return{stack:[],nextHop:null};let c=ln(e,r,s[0]),l=t.ftn[i]?.[`${n(e,c).loopback}/32`];if(!l)return{stack:s,nextHop:null};let u=o(l.nextHops);return{stack:u.label===3?s.slice(1):[u.label,...s.slice(1)],nextHop:u,top:s[0],target:c}}function An(e,t,r,i,a,o,s,c){if(o.underlay===`mpls-tp`){let e=c&&tn(c,o.tunnel,o.node);if(!e)return{error:`no MPLS-TP tunnel ${o.tunnel}`};if(![e.src,e.dst].includes(o.node)||![e.src,e.dst].includes(s))return{error:`tunnel ${e.id} does not join ${o.node} and ${s}`};if(e.endState[o.node]!==`Up`)return{error:`MPLS-TP tunnel ${e.id} down at ${o.node}`};let t=c.head[o.node][e.id],n=o.node===e.src?e.path:[...e.path].reverse();return{kind:`mpls-tp`,tunnel:e.id,configured:o.tunnel,switched:e.id!==o.tunnel,dir:t.dir,stack:[t.outLabel],link:t.link,next:t.next,path:n}}let l=`${n(e,s).loopback}/32`;if(o.underlay===`sr-policy`){let e=On(i,o.node,o.color,s);return e?e.valid?{kind:`sr-policy`,policy:e.name,stack:e.segmentList.sids,path:e.path}:{error:`SR policy ${e.name} invalid: ${e.reason}`}:{error:`no SR policy color ${o.color} to ${s}`}}return r.ftn[o.node]?.[l]?o.underlay===`sr`?r.mode===`sr`?{kind:`sr`,stack:[cn(e,a,s)]}:{error:`underlay SR but SR-MPLS is not the active label mode`}:o.underlay===`ldp`?r.mode===`ldp`?{kind:`ldp`,stack:null}:{error:`underlay LDP but LDP is not the active label mode`}:{error:`unknown underlay ${o.underlay}`}:{error:`no LSP to ${l}`}}function jn(e,t,i,a,o,s=null){let c={},l={};return{pseudowires:(e.pseudowires??[]).map(u=>{let d=u.ends.map(t=>{let n=t.rxLabel;return u.static||(c[t.node]??=o.mpls.pwLabelBase(r(e,t.node)),n=c[t.node]++),(l[t.node]??={})[n]={pw:u.id,end:u.ends.indexOf(t)},n}),[f,p]=u.ends.map(e=>e.node),m=t=>`${n(e,t).loopback}/32`,h=u.static?`static`:t.rib[f]?.[m(p)]&&t.rib[p]?.[m(f)]?`Operational`:`Non-existent`,g=u.ends.map((n,r)=>{let c=u.ends[1-r].node,l=u.static?n.txLabel:d[1-r];return{...n,peer:c,localLabel:d[r],remoteLabel:l,transport:An(e,t,i,a,o,n,c,s)}}),_=[];if(h===`Non-existent`&&_.push(`targeted LDP ${f}-${p} down (loopbacks unreachable)`),u.static)for(let[e,t]of g.entries())t.txLabel!==d[1-e]&&_.push(`${t.node} sends PW label ${t.txLabel}, ${g[1-e].node} expects ${d[1-e]}`);for(let e of g)e.transport.error&&_.push(`${e.node}: ${e.transport.error}`);return{...u,tldp:h,ends:g,state:_.length?`Down`:`Up`,reasons:_}}),pwLabels:l}}function Mn(e){let t=2166136261;for(let n=0;n<e.length;n++)t^=e.charCodeAt(n),t=Math.imul(t,16777619)>>>0;return t>>>0}var Nn={name:`RFC reference (vendor-neutral)`,mac(e,t){let n=e=>e.toString(16).padStart(2,`0`);return`02:00:00:${n(e)}:${n(t)}:00`},mpls:{ldpLabelBase:e=>24e3+e*1e3,vpnLabelBase:e=>1e5+e*1e3,pwLabelBase:e=>2e5+e*1e3,srgb:{base:16e3,size:8e3}},isis:{defaultMetric:10,helloIntervalS:10,holdMultiplier:3,lspLifetimeS:1200,lspGenDelayMs:50,floodHopDelayMs:10,spfDelayMs:50},ospf:{defaultCost:10,helloIntervalS:10,deadIntervalS:40,lsaGenDelayMs:50,floodHopDelayMs:10,spfDelayMs:50},bfd:{intervalMs:10,detectMult:3},mplsTp:{globalId:0,protectionSwitchMs:50},bgp:{holdTimeS:90,updateDelayMs:10,localPref:100},lacp:{systemPriority:32768,shortTimeout:!0,hash(e){return Mn([e.src,e.dst,e.proto,e.sport,e.dport].join(`|`))}},g8032:{wtrMin:5,guardMs:500,holdOffMs:0,rapsBurstMs:10/3,rapsPeriodS:5,rapsHopDelayMs:10,repairAfterS:60},cfm:{linkMdLevel:2,ccmIntervalCode:2,serviceMdLevel:4,serviceCcmIntervalCode:4}},Pn={routers:[],adjacencies:[],lsps:{},lsdb:{},spf:{},rib:{}};function Fn(e,{failures:t=[],labelMode:n=`ldp`,vendor:r=Nn,isisSeqs:i={},ospfSeqs:a={},ringOverrides:o={}}={}){let c=s(e);if(c.length)throw Error(`invalid topology: ${c.join(`; `)}`);let l=new Set(t),u=st(e,l,r),d=e.igp??`isis`;if(![`isis`,`ospf`].includes(d))throw Error(`unknown IGP ${d}`);let f=d===`isis`?Ct(e,u,r,i):Pn,p=d===`ospf`?zt(e,u,r,a):{...Pn,areas:{},abrs:[],lsas:{},summaries:{}},m=d===`ospf`?p:f,h=un[n];if(!h)throw Error(`unknown label mode ${n}`);let g=h.build(e,m,r),_=gn(e,m,g,r,u),v=Dn(e,m,g,r),y=$t(e,u,r),b=jn(e,m,g,v,r,y),x=Gt(e,u,r,b),S=xn(e,u,r,o);return{topo:e,vendor:r,failures:[...l].sort(),labelMode:n,links:u,igpName:d,igp:m,isis:f,ospf:p,mpls:g,bgp:_,sr:v,tp:y,vpws:b,cfm:x,g8032:S}}var In={IPV4:`0x0800`,MPLS:`0x8847`,CFM:`0x8902`},Ln={isis:`IS-IS`,ospf:`OSPF`},Rn={src:`192.168.1.10`,dst:`192.168.2.20`,proto:`UDP`,sport:49152,dport:5001};function zn(e,t,n){return e.vendor.mac(r(e.topo,t),o(e.topo,t,n))}function Bn(e,t,n){return t.length===1?t[0]:t[e.vendor.lacp.hash(n)%t.length]}function Vn(e,t,n,r){let i=e.topo.links.find(e=>e.id===n),{local:o,remote:s}=a(i,t),c=e.links[n],l=ct(c,r,e.vendor);return{link:i,local:o,remote:s,member:l?.member??null,selection:i.lag?l:null}}function Hn(e,t,n){return{name:`Ethernet II`,fields:{dst:zn(e,t.remote.node,t.remote.if),src:zn(e,t.local.node,t.local.if),ethertype:n}}}function Un(e){let t=e.labels.map((t,n)=>({name:`MPLS`,fields:{label:t.label,tc:0,s:+(n===e.labels.length-1),ttl:t.ttl,role:t.role}}));if(e.inner)t.push(...e.inner);else{t.push({name:`IPv4`,fields:{src:e.ip.src,dst:e.ip.dst,ttl:e.ip.ttl,protocol:e.ip.proto}});let n=e.ip.proto===`TCP`?`TCP`:`UDP`;t.push({name:n,fields:{sport:e.l4.sport,dport:e.l4.dport}})}return e.app&&t.push(e.app),t}function Wn(e){if(!e.selection)return[];let t=e.selection;return t.hash===null?[`LAG ${e.local.if}: one distributing member -> ${t.member}`]:[`LAG ${e.local.if}: hash(5-tuple) = 0x${t.hash.toString(16).padStart(8,`0`)} mod ${t.of} = ${t.index} -> member ${t.member}`]}function Gn(e,t,n){for(let r of e.topo.vrfs??[])if(r.sites.some(e=>e.pe===t&&(e.link===n||(e.interfaces??[]).some(e=>e.link===n))))return r.name;return null}function Kn(e,t,r){return n(e.topo,t).loopback===r||e.topo.links.some(e=>[e.a,e.b].some(e=>e.node===t&&e.ip===r))?!0:(e.topo.vrfs??[]).some(e=>e.sites.some(e=>e.pe===t&&(e.interfaces??[]).some(e=>e.ip===r)))}function qn(e,t){return e.topo.links.some(e=>e.subnet&&ft(t,e.subnet))||e.topo.nodes.some(e=>e.loopback===t||e.lan&&ft(t,e.lan))?!0:(e.topo.vrfs??[]).some(e=>e.sites.some(e=>(e.interfaces??[]).some(e=>ft(t,e.prefix))))}function Jn(e,t,r){let i=n(e.topo,t),a=e.topo.links.filter(e=>e.a.node===t||e.b.node===t),o=a.filter(e=>e.subnet&&ft(r,e.subnet)).map(e=>({prefix:e.subnet,link:e,type:`connected`})),s=(i.routes??[]).filter(e=>ft(r,e.prefix)).map(e=>({...e,link:a.find(t=>t.subnet&&ft(e.nextHop,t.subnet)),type:`static`}));return[...o,...s].filter(e=>e.link).sort((e,t)=>Number(t.prefix.split(`/`)[1])-Number(e.prefix.split(`/`)[1]))[0]??null}function Yn(e,t,r,{flow:i,inLink:o=null,maxHops:s=16,vrf:c=null}={}){let l=[],u=t,d=o;for(let t=0;t<s;t++){let o=n(e.topo,u),s=[],f=null,p=t===0&&c?c:o.role===`pe`?Gn(e,u,d):null,m=null,h=(e,t)=>(l.push({node:u,title:t,lookup:f,actions:s,headers:Un(r),moves:[],status:e}),l),g=r.labels.length&&o.role!==`ce`?e.tp?.lfib[u]?.[r.labels[0].label]:null;if(g){let t=r.labels[0],n=e.tp.tunnels.find(e=>e.id===g.tunnel),i=g.dir===`fwd`?`forward`:`reverse`,a=t.ttl-1;f={table:`LFIB (MPLS-TP static)`,key:`in-label ${t.label}`,result:`${g.op} (tunnel ${n.id}, ${i}${g.next?` -> ${g.next}`:`, end point`})`},g.op===`swap`?(r.labels[0]={...t,label:g.outLabel,ttl:a},s.push(`swap ${t.label} -> ${g.outLabel} (static ${i} LSP of ${n.id}), TTL ${t.ttl} -> ${a}`),m={link:g.link,title:`Swap at ${u} (MPLS-TP ${i})`}):(r.labels.shift(),s.push(`pop ${t.label}: ${i} LSP of ${n.id} ends here (no PHP in MPLS-TP)`))}if(!m&&r.labels.length&&o.role!==`ce`){let t=r.labels[0],n=e.mpls.lfib[u]?.[t.label],a=Object.entries(e.bgp.vrfs[u]??{}).flatMap(([e,n])=>Object.values(n).filter(e=>e.type!==`bgp`&&e.vpnLabel===t.label).map(t=>({vrf:e,route:t})))[0],o=e.vpws?.pwLabels[u]?.[t.label];if(n){let a=Bn(e,n.nextHops,i),o=t.ttl-1;if(f={table:`LFIB (${e.mpls.mode.toUpperCase()})`,key:`in-label ${t.label}`,result:`${a.op} -> ${a.node} (FEC ${n.fec})`},a.op===`swap`){r.labels[0]={...t,label:a.outLabel,ttl:o};let n=e.mpls.mode===`sr`?`continue (swap)`:`swap`;s.push(`${n} ${t.label} -> ${a.outLabel}, TTL ${t.ttl} -> ${o}`)}else r.labels.shift(),r.labels.length?r.labels[0]={...r.labels[0],ttl:Math.min(r.labels[0].ttl,o)}:r.ip&&(r.ip.ttl=Math.min(r.ip.ttl,o)),s.push(`pop ${t.label} (PHP: next hop advertised implicit-null)`);m={link:a.link,title:`${a.op===`swap`?`Swap`:`Pop (PHP)`} at ${u}`}}else if(a){let e=t.ttl-1;r.labels.shift(),r.ip.ttl=Math.min(r.ip.ttl,e),p=a.vrf,f={table:`LFIB (BGP VPN labels)`,key:`in-label ${t.label}`,result:`pop, VRF ${p}`},s.push(`pop VPN label ${t.label} (bottom of stack), continue in VRF ${p}`)}else if(o){let n=e.vpws.pseudowires.find(e=>e.id===o.pw),i=n.ends[o.end];return r.labels.shift(),f={table:`LFIB (${f?`MPLS-TP pop, then `:``}PW labels)`,key:`in-label ${t.label}`,result:`PW ${n.pwid} (${n.service}) -> AC ${i.ac.name} port ${i.ac.port}`},s.push(`pop PW label ${t.label} (bottom of stack)`,`send the customer frame out on AC ${i.ac.name} (port ${i.ac.port})`),h(`delivered`,`${u} delivers on AC port ${i.ac.port}`)}else if(t.label===13&&r.oam)return r.labels.shift(),f={table:`LFIB`,key:`in-label 13 (GAL)`,result:`G-ACh: to the OAM end point`},s.push(`pop GAL 13: Associated Channel ${r.oam}`),h(`delivered`,`${u} MEP receives the OAM packet`);else return f={table:`LFIB`,key:`in-label ${t.label}`,result:`no entry`},s.push(`drop: unknown label`),h(`dropped`,`Drop at ${u}`)}if(!m&&!r.ip)return s.push(`drop: label stack empty, no IP header`),h(`dropped`,`Drop at ${u}`);if(!m){let t=r.ip.dst;if(o.role===`ce`&&Kn(e,u,t)&&d)return f={table:`${u} RIB`,key:t,result:`local address`},s.push(`deliver to the local stack`),h(`delivered`,`Received by ${u}`);if(o.role===`ce`&&o.host){let n=Jn(e,u,t);if(!n&&d&&!qn(e,t))return f={table:`${u} routes`,key:t,result:`not a lab address`},s.push(`forward ${t} out of the lab (beyond the modeled topology)`),h(`delivered`,`${u} forwards it out of the lab`);if(!n)return f={table:`${u} routes`,key:t,result:`no route`},s.push(`drop: no route`),h(`dropped`,`Drop at ${u}`);let i=a(n.link,u).remote;f={table:`${u} routes`,key:t,result:`${n.prefix} ${n.type===`static`?`via ${n.nextHop}`:`connected`} (${i.node})`},--r.ip.ttl,s.push(`IP TTL -> ${r.ip.ttl}`),m={link:n.link.id,title:`${u} routes to ${i.node}`}}else if(o.role===`ce`){if(o.lan&&ft(t,o.lan))return f={table:`${u} RIB`,key:t,result:`${o.lan} connected`},--r.ip.ttl,s.push(`deliver on LAN ${o.lan}`),h(`delivered`,`Delivered by ${u}`);let n=(e.topo.vrfs??[]).flatMap(e=>e.sites).find(e=>e.ce===u);if(!n)return s.push(`drop: no route`),h(`dropped`,`Drop at ${u}`);let i=e.topo.links.find(e=>e.id===n.link);f={table:`${u} RIB`,key:t,result:`0.0.0.0/0 static via ${a(i,u).remote.ip} (${n.pe})`},--r.ip.ttl,s.push(`IP TTL -> ${r.ip.ttl}`),m={link:i.id,title:`${u} routes to ${n.pe}`}}else if(p){let n=pt(Object.values(e.bgp.vrfs[u]?.[p]??{}),t);if(!n)return f={table:`VRF ${p}`,key:t,result:`no route`},s.push(`drop: no route in VRF`),h(`dropped`,`Drop at ${u}`);if(n.type===`bgp`){let a=`${n.nextHop}/32`,o=e.mpls.ftn[u][a],c=Bn(e,o.nextHops,i);f={table:`VRF ${p}`,key:t,result:`${n.prefix} via BGP NH ${n.nextHop} VPN label ${n.vpnLabel}; FTN ${a} -> ${c.node}`},--r.ip.ttl;let l=r.ip.ttl;r.labels=[{label:n.vpnLabel,ttl:l,role:`VPN`}],s.push(`push VPN label ${n.vpnLabel} (BGP, from ${n.from})`),c.label===3?s.push(`no transport label: ${c.node} is the egress (implicit-null)`):(r.labels.unshift({label:c.label,ttl:l,role:e.mpls.mode===`sr`?`SR`:`LDP`}),s.push(`push transport label ${c.label} (${e.mpls.mode.toUpperCase()} FEC ${a})`)),m={link:c.link,title:`${u} VRF lookup, push labels`}}else if(n.type===`local`)return f={table:`VRF ${p}`,key:t,result:`${n.prefix} local (${n.if})`},s.push(`deliver to the local stack in VRF ${p}`),h(`delivered`,`Received by ${u} (VRF ${p} ${n.if})`);else{let e=n.type===`static`?` ${n.via.ip} preference ${n.preference}${n.alternatives?.length>1?` (${n.alternatives.filter(e=>e.state!==`active`).map(e=>`${e.nextHop} pref ${e.preference} ${e.state}`).join(`, `)})`:``}`:``;if(f={table:`VRF ${p}`,key:t,result:`${n.prefix} ${n.type}${e} via ${n.via.node??`-`}`},!n.via.link)return s.push(`drop: the interface is not cabled`),h(`dropped`,`Drop at ${u}`);r.labels.length===0&&!s.length&&--r.ip.ttl,m={link:n.via.link,title:`${u} VRF ${p} -> ${n.via.node}`}}}else{if(o.loopback===t)return f={table:`${u} global RIB`,key:t,result:`local (loopback)`},s.push(`deliver to local stack`),h(`delivered`,`Received by ${u}`);let n=pt(Object.values(e.igp.rib[u]??{}),t);if(!n||!n.nextHops.length)return f={table:`${u} global RIB`,key:t,result:`no route`},s.push(`drop: no route`),h(`dropped`,`Drop at ${u}`);let a=e.mpls.ftn[u]?.[n.prefix];if(--r.ip.ttl,a){let o=Bn(e,a.nextHops,i);f={table:`${u} global RIB + FTN`,key:t,result:`${n.prefix} ${Ln[e.igpName]} metric ${n.metric} -> ${o.node}`},o.label!==3&&(r.labels=[{label:o.label,ttl:r.ip.ttl,role:e.mpls.mode===`sr`?`SR`:`LDP`}],s.push(`push ${e.mpls.mode.toUpperCase()} label ${o.label}`)),m={link:o.link,title:`${u} routes into LSP`}}else{let r=Bn(e,n.nextHops,i);f={table:`${u} global RIB`,key:t,result:`${n.prefix} ${Ln[e.igpName]} metric ${n.metric} -> ${r.node}`},m={link:r.link,title:`${u} IP forward`}}}}let _=Vn(e,u,m.link,i);s.push(...Wn(_));let v=Hn(e,_,r.labels.length?In.MPLS:In.IPV4);if(l.push({node:u,title:m.title,lookup:f,actions:s,headers:[v,...Un(r)],moves:[{from:u,to:_.remote.node,link:_.link.id,member:_.member}],status:`forward`}),!e.links[_.link.id].up)return l.push({node:u,title:`Link ${_.link.id} is down`,actions:[`drop`],headers:[],moves:[],status:`dropped`}),l;d=_.link.id,u=_.remote.node}return l.push({node:u,title:`TTL / hop limit exceeded`,actions:[`drop`],headers:[],moves:[],status:`dropped`}),l}function Xn(e,t){let r=n(e.topo,t);if(r.role!==`ce`||!r.lan)throw Error(`${t} is not a CE with a LAN`);return r}function Zn(e,t=`CE1`,n=`CE2`,r={}){let i=Xn(e,t),a=Xn(e,n),o=(e,t)=>e.replace(/\.0\/\d+$/,`.${t}`),s={...Rn,src:o(i.lan,10),dst:o(a.lan,20),...r},c=Yn(e,t,{ip:{src:s.src,dst:s.dst,ttl:64,proto:s.proto},l4:{sport:s.sport,dport:s.dport},labels:[]},{flow:s});return{kind:`data`,layer:`physical`,title:`Data plane ${t} -> ${n} (L3VPN, ${e.mpls.mode.toUpperCase()})`,flow:s,steps:c,delivered:c.at(-1).status===`delivered`}}function Qn(e,t=`PE1`){let r=e.isis.lsps[t];if(!r)throw Error(`${t} does not run IS-IS`);let i={...r,seq:r.seq+1},a=n(e.topo,t),o=e.topo.isis?.level??2,s=(t,n,r)=>[{name:`IEEE 802.3`,fields:{dst:`09:00:2b:00:00:05 (AllISs)`,src:zn(e,t,Vn(e,t,e.topo.links.find(e=>e.id===r).id,{src:t,dst:n,proto:`ISIS`,sport:0,dport:0}).local.if),length:`(LLC + PDU)`}},{name:`LLC`,fields:{dsap:`0xfe`,ssap:`0xfe`,control:`0x03`}},{name:`IS-IS`,fields:{nlpid:`0x83`,pduType:o===1?`18 (L1 LSP)`:`20 (L2 LSP)`,lspId:i.lspId,seq:`0x${i.seq.toString(16).padStart(8,`0`)}`,lifetime:i.lifetime}},{name:`TLV 22 Ext IS Reach`,fields:Object.fromEntries(i.isReach.map(e=>[`${e.neighbor}.00`,`metric ${e.metric}`]))},{name:`TLV 135 Ext IP Reach`,fields:Object.fromEntries(i.ipReach.map(e=>[e.prefix,`metric ${e.metric}`]))}],c=wt(e.isis,t,i,e.vendor),l=[{node:t,t:0,title:`${t} originates LSP ${i.lspId} seq ${i.seq}`,lookup:null,actions:[`${gt(a)}: ${i.isReach.length} IS neighbours, ${i.ipReach.length} prefixes`,`set SRM on every Up circuit`],headers:s(t,i.isReach[0]?.neighbor??t,i.isReach[0]?.link??e.topo.links[0].id),moves:[],status:`forward`}],u=[...new Set(c.map(e=>e.t))];for(let e of u){let t=c.filter(t=>t.t===e);l.push({node:t[0].from,t:e,title:`t=${e} ms: ${t.length} LSP transmission${t.length>1?`s`:``}`,lookup:{table:`LSDB`,key:i.lspId,result:t.map(e=>`${e.to}: ${e.result}`).join(`, `)},actions:t.map(e=>e.result===`installed`?`${e.from} -> ${e.to}: newer seq, install, ack (PSNP), flood on other circuits`:`${e.from} -> ${e.to}: same seq already held, ack (PSNP), discard`),headers:s(t[0].from,t[0].to,t[0].link),moves:t.map(e=>({from:e.from,to:e.to,link:e.link,member:null,duplicate:e.result!==`installed`})),status:`forward`})}return l.push({node:t,t:u.at(-1)??0,title:`Flood complete: LSDBs synchronized`,actions:[`every router holds ${i.lspId} seq ${i.seq}`,`SPF runs only if the LSP content changed`],headers:[],moves:[],status:`delivered`}),{kind:`isis`,layer:`isis`,title:`IS-IS LSP flood from ${t}`,steps:l,transmissions:c}}function $n(e,t=null,{count:n=4,failAfter:r=null}={}){let i=t?e.cfm.megs.find(e=>e.id===t):e.cfm.megs[0];if(!i)throw Error(`no MEG ${t}`);if(i.pseudowire)return rr(e,i);let a=i.intervalMs,o=r===null?null:r*a,{events:s}=Kt(i,{durationMs:o===null?n*a:o+4*a,failAtMs:o}),c=e.topo.links.find(e=>e.id===i.link),l=s.map(t=>{if(t.kind===`defect`)return{node:t.mep.node,t:t.t,title:`t=${qt(t.t)}: ${t.mep.node} declares loss of continuity`,actions:[t.text,`raise fault alarm; set RDI in transmitted CCMs; signal clients (IS-IS) the link is down`],headers:[],moves:[],status:`dropped`};let n=t.from;return{node:n.node,t:t.t,title:`t=${qt(t.t)}: CCM seq ${t.seq} MEP ${n.mepId} (${n.node}) -> MEP ${t.to.mepId}${t.lost?` LOST`:``}`,actions:[t.lost?`link failed: frame never arrives`:`${t.to.node} resets rMEPwhile (${qt(3.5*a)})`,...t.rdi?[`RDI set`]:[]],headers:[{name:`Ethernet II`,fields:{dst:Wt(i.level),src:zn(e,n.node,n.if),ethertype:In.CFM}},{name:`CFM CCM`,fields:{mdLevel:i.level,version:0,opcode:`1 (CCM)`,flags:`RDI=${+!!t.rdi}, interval=${i.intervalCode} (${qt(a)})`,sequence:t.seq,mepId:n.mepId,maid:`${i.id}`}}],moves:[{from:n.node,to:t.to.node,link:c.id,member:null,lost:t.lost}],status:t.lost?`dropped`:`forward`}});return{kind:`ccm`,layer:`cfm`,title:`CCM stream on ${i.id}${o===null?``:` with link failure`}`,meg:i,steps:l}}function er(e,t,r,i){let a=t.ends[r],o=a.node,s=a.transport,c={src:o,dst:a.peer,proto:`ETH`,sport:0,dport:t.pwid},l=[`frame in on AC ${a.ac.name} (port ${a.ac.port}): VPWS ${t.service}, PW ${t.pwid} to ${a.peer}`],u=`${n(e.topo,a.peer).loopback}/32`;if(t.state!==`Up`){let e={table:`PW table`,key:`PW ${t.pwid}`,result:`Down`};return[{node:o,title:`${o}: PW ${t.pwid} is down`,lookup:e,actions:[...l,...t.reasons.map(e=>`down: ${e}`)],headers:i,moves:[],status:`dropped`}]}let d,f,p;if(s.kind===`mpls-tp`){d=s.stack,f={node:s.next,link:s.link};let n=e.tp.tunnels.find(e=>e.id===s.tunnel);p={table:`PW -> MPLS-TP tunnel`,key:`PW ${t.pwid} (static)`,result:`tunnel ${s.tunnel} ${s.dir===`fwd`?`forward`:`reverse`} LSP, out label ${s.stack[0]} -> ${s.next}`},l.push(`push static PW label ${a.remoteLabel} (configured transmit label)`,`push tunnel label ${s.stack[0]} (${s.dir===`fwd`?`forward`:`reverse`} LSP ${n.ids.lspId})`),s.switched&&l.push(`protection: working tunnel ${s.configured} failed, sending on ${s.tunnel} (RFC 6378)`)}else if(s.kind===`ldp`)f=Bn(e,e.mpls.ftn[o][u].nextHops,c),d=f.label===3?[]:[f.label],p={table:`FTN (LDP)`,key:u,result:`label ${f.label===3?`implicit-null`:f.label} -> ${f.node}`},l.push(`push PW label ${a.remoteLabel} (advertised by ${a.peer}, RFC 8077)`,d.length?`push LDP label ${d[0]}`:`no transport label: ${f.node} is the egress`);else{let t=kn(e.topo,e.mpls,e.vendor,o,s.stack,t=>Bn(e,t,c));d=t.stack,f=t.nextHop,p=s.kind===`sr-policy`?{table:`SR policy (RFC 9256)`,key:`color ${a.color}, endpoint ${u.split(`/`)[0]}`,result:`${s.policy}: segment list [${s.stack.join(`, `)}]`}:{table:`FTN (SR)`,key:u,result:`Prefix-SID ${s.stack[0]}`},l.push(`push PW label ${a.remoteLabel} (advertised by ${a.peer}, RFC 8077)`,`push ${s.kind===`sr-policy`?`segment list`:`SID`} [${s.stack.join(`, `)}]`),t.top!==void 0&&d.length<s.stack.length&&l.push(`top SID ${t.top} is ${t.target}, adjacent with PHP: not imposed`)}if(!f)return[{node:o,title:`${o}: no next hop`,lookup:p,actions:[...l,`drop`],headers:i,moves:[],status:`dropped`}];let m=s.kind===`ldp`?`LDP`:s.kind===`mpls-tp`?`TP`:`SR`,h={inner:i,labels:[...d.map(e=>({label:e,ttl:255,role:m})),{label:a.remoteLabel,ttl:255,role:`PW`}]},g=Vn(e,o,f.link,c);l.push(...Wn(g));let _={node:o,title:`${o} VPWS ${t.service}: push PW + ${s.kind===`sr-policy`?`SR policy`:s.kind===`mpls-tp`?`MPLS-TP tunnel`:m} labels`,lookup:p,actions:l,headers:[Hn(e,g,In.MPLS),...Un(h)],moves:[{from:o,to:g.remote.node,link:g.link.id,member:g.member}],status:`forward`};return e.links[g.link.id].up?[_,...Yn(e,g.remote.node,h,{flow:c,inLink:g.link.id})]:[_,{node:o,title:`Link ${g.link.id} is down`,actions:[`drop`],headers:[],moves:[],status:`dropped`}]}function tr(e,t){let n=t?e.ends.findIndex(e=>e.node===t):0;if(n<0)throw Error(`${t} is not an end of PW ${e.id}`);return n}function nr(e,t=null,n=null){let r=t?e.vpws.pseudowires.find(e=>e.id===t):e.vpws.pseudowires[0];if(!r)throw Error(`no pseudowire ${t}`);let i=tr(r,n),a=r.ends[i],o=er(e,r,i,[{name:`Ethernet II (customer)`,fields:{dst:`00:00:5e:00:53:02`,src:`00:00:5e:00:53:01`,ethertype:In.IPV4}},{name:`Payload`,fields:{classifier:`untagged`,note:`carried unchanged (RFC 4448 raw mode, no control word)`}}]),s=a.transport.kind===`sr-policy`?`SR policy ${a.transport.policy}`:a.transport.kind===`mpls-tp`?`MPLS-TP tunnel ${a.transport.tunnel}`:(a.transport.kind??`no transport`).toUpperCase();return{kind:`vpws`,layer:`physical`,title:`VPWS ${r.service} ${a.node} -> ${a.peer} over ${s}`,pw:r,steps:o,delivered:o.at(-1).status===`delivered`}}function rr(e,t){let n=e.vpws.pseudowires.find(e=>e.id===t.pseudowire);if(!n)throw Error(`MEG ${t.id}: no pseudowire ${t.pseudowire}`);let r=t.intervalMs,i=[];for(let[a,o]of t.meps.entries()){let s=t.meps[1-a],c=er(e,n,tr(n,o.node),[{name:`Ethernet II`,fields:{dst:Wt(t.level),src:zn(e,o.node,o.if),ethertype:In.CFM}},{name:`CFM CCM`,fields:{mdLevel:t.level,version:0,opcode:`1 (CCM)`,flags:`RDI=${+!!o.rdi}, interval=${t.intervalCode} (${qt(r)})`,sequence:1,mepId:o.mepId,maid:t.id}}]);c[0].title=`Up MEP ${o.mepId} on ${o.node} sends CCM 1 into ${n.service}`;let l=c.at(-1);l.status===`delivered`&&(l.title=`MEP ${s.mepId} on ${s.node} receives CCM from MEP ${o.mepId}`,l.actions.push(`MEP ${s.mepId}: CCM from remote MEP ${o.mepId}, level ${t.level}, MAID ${t.id} match -> reset rMEPwhile (${qt(3.5*r)})`)),i.push(...c)}let a=n.ends.map(e=>e.transport.path?e.transport.path.join(` -> `):e.transport.kind??`none`),o=t.meps.some(e=>e.defect);return i.push({node:t.meps[0].node,title:o?`Loss of continuity on both MEPs`:`CCMs every ${qt(r)} each way`,actions:[`MEP ${t.meps[0].mepId} (${t.meps[0].node}) <-> MEP ${t.meps[1].mepId} (${t.meps[1].node}), MD level ${t.level}, Up MEPs on the ACs`,`transport per direction: ${n.ends[0].node}: ${a[0]}; ${n.ends[1].node}: ${a[1]}`,o?`no CCMs: ${n.reasons.join(`; `)} -> DefRemoteCCM after ${qt(3.5*r)}`:`a MEP declares DefRemoteCCM after ${qt(3.5*r)} without CCMs (802.1Q §20.20)`],headers:[],moves:[],status:o?`dropped`:`delivered`}),{kind:`ccm`,layer:`cfm`,title:`CCM between MEPs ${t.meps.map(e=>e.mepId).join(` and `)} over VPWS ${n.service}`,meg:t,steps:i}}function ir(e,t){let n=e.ospf;return!n||new Set(Object.values(n.areas).flat()).size<2?[]:n.areas[t]??[]}function ar(e,t=null,r=null){let i=e.ospf,a=t??i.routers[0];if(!i.lsas[a])throw Error(`${a} does not run OSPF`);let o=r??i.areas[a][0],s=i.lsas[a][o];if(!s)throw Error(`${a} has no interface in area ${o}`);let c={...s,seq:s.seq+1},l=Bt(i,o),u=(t,r)=>{let i=e.topo.links.find(e=>e.id===r),a=i?Vn(e,t,i.id,{src:t,dst:Dt,proto:`OSPF`,sport:0,dport:0}):null;return[...a?[{name:`Ethernet II`,fields:{dst:`01:00:5e:00:00:05`,src:zn(e,t,a.local.if),ethertype:In.IPV4}}]:[],{name:`IPv4`,fields:{src:a?.local.ip??n(e.topo,t).loopback,dst:`${Dt} (AllSPFRouters)`,ttl:1,protocol:`89 (OSPF)`}},{name:`OSPF`,fields:{version:2,type:`4 (Link State Update)`,routerId:n(e.topo,t).routerId??n(e.topo,t).loopback,areaId:o,lsas:1}},{name:`Router-LSA`,fields:{lsAge:1,lsType:`1 (Router-LSA)`,linkStateId:c.lsId,advRouter:c.advRouter,seq:Ot(c.seq),flags:c.abr?`B (area border)`:`-`,links:c.links.length+c.stubs.length}},{name:`Router-LSA links`,fields:Object.fromEntries([...c.links.map(e=>[`p2p ${e.linkId}`,`data ${e.linkData}, metric ${e.metric}`]),...c.stubs.map(e=>[`stub ${e.prefix}`,`metric ${e.metric}`])])}]},d=wt(l,a,c,e.vendor,e.vendor.ospf.floodHopDelayMs),f=[{node:a,t:0,title:`${a} originates Router-LSA ${c.lsId} seq ${Ot(c.seq)} (area ${o})`,lookup:null,actions:[`${c.links.length} point-to-point links, ${c.stubs.length} stub networks`,`send an LS Update on every Full adjacency in the area`],headers:u(a,c.links[0]?.link),moves:[],status:`forward`}];for(let e of[...new Set(d.map(e=>e.t))]){let t=d.filter(t=>t.t===e);f.push({node:t[0].from,t:e,title:`t=${e} ms: ${t.length} LS Update${t.length>1?`s`:``}`,lookup:{table:`LSDB area ${o}`,key:`Router-LSA ${c.lsId}`,result:t.map(e=>`${e.to}: ${e.result}`).join(`, `)},actions:t.map(e=>e.result===`installed`?`${e.from} -> ${e.to}: newer seq, install, LS Ack, flood out the other interfaces in area ${o} (§13.3)`:`${e.from} -> ${e.to}: same instance already held, LS Ack, discard`),headers:u(t[0].from,t[0].link),moves:t.map(e=>({from:e.from,to:e.to,link:e.link,member:null,duplicate:e.result!==`installed`})),status:`forward`})}return f.push({node:a,t:d.at(-1)?.t??0,title:`Flood complete: area ${o} LSDBs synchronized`,actions:[`every router in area ${o} holds Router-LSA ${c.lsId} seq ${Ot(c.seq)}`,`SPF runs only if the LSA content changed`],headers:[],moves:[],status:`delivered`}),{kind:`ospf`,layer:`isis`,title:`OSPF Router-LSA flood from ${a} (area ${o})`,steps:f,transmissions:d}}function or(e,t=null){let n=t?e.tp.tunnels.find(e=>e.id===t):e.tp.tunnels[0];if(!n)throw Error(`no MPLS-TP tunnel ${t}`);let r=[];for(let[t,i]of[[n.src,`fwd`],[n.dst,`rev`]]){let a=t===n.src?n.dst:n.src,o=e.tp.head[t]?.[n.id],s=i===`fwd`?`forward`:`reverse`,c=`${Jt} (BFD CC, RFC 6428), MEP ${n.ids.meps[t]} -> ${n.ids.meps[a]}`,l={name:`G-ACh BFD CC`,fields:{ach:`0x1 ver 0, channel ${Jt}`,myDiscr:n.ids.meps[t],yourDiscr:n.ids.meps[a],interval:n.oam?`${n.oam.intervalMs??e.vendor.bfd.intervalMs} ms`:`- (no OAM configured: shown for the label path)`}};if(!o){r.push({node:t,title:`${t}: tunnel ${n.id} not installed (${n.admin})`,actions:n.reasons,headers:[],moves:[],status:`dropped`});continue}let u={inner:[],labels:[{label:o.outLabel,ttl:255,role:`TP`},{label:13,ttl:1,role:`GAL`}],app:l,oam:c},d={src:t,dst:a,proto:`TP`,sport:0,dport:0},f=Vn(e,t,o.link,d),p={node:t,title:`${t} sends CC on the ${s} LSP of ${n.id}`,lookup:{table:`MPLS-TP tunnel (static)`,key:n.ids.lspId,result:`out label ${o.outLabel} -> ${o.next}`},actions:[`push GAL 13 (G-ACh), push ${s} LSP label ${o.outLabel}`,...Wn(f)],headers:[Hn(e,f,In.MPLS),...Un(u)],moves:[{from:t,to:f.remote.node,link:f.link.id,member:f.member}],status:`forward`};r.push(p),e.links[f.link.id].up?r.push(...Yn(e,f.remote.node,u,{flow:d,inLink:f.link.id})):r.push({node:t,title:`Link ${f.link.id} is down`,actions:[`drop`],headers:[],moves:[],status:`dropped`})}let i=n.detectionMs===null?`no proactive OAM: only a local interface failure is seen`:`loss of continuity after ${qt(n.detectionMs)} without CC`;return r.push({node:n.src,title:`Tunnel ${n.id}: ${n.state}`,actions:[`LSP_ID ${n.ids.lspId} (RFC 6370)`,`path ${n.path.join(` -> `)}, reverse on the same hops`,i,...n.reasons],headers:[],moves:[],status:n.state===`Up`?`delivered`:`dropped`}),{kind:`tp`,layer:`mpls`,title:`MPLS-TP tunnel ${n.id}: ${n.src} <-> ${n.dst}`,tunnel:n,steps:r}}function sr(e,t,r,{vrf:i=null,...a}={}){let o=n(e.topo,t);if(o.role!==`ce`&&!i)throw Error(`${t} is not a host or CE (give a VRF to source from a PE)`);let s=i?(e.topo.vrfs??[]).find(e=>e.name===i)?.sites.find(e=>e.pe===t)?.interfaces?.find(e=>e.kind===`loopback`):null;if(i&&!s)throw Error(`${t} has no loopback in VRF ${i}`);let c=s?.ip??e.topo.links.flatMap(e=>[e.a,e.b]).find(e=>e.node===t&&e.ip)?.ip??o.lan?.replace(/\.0\/\d+$/,`.10`),l={...Rn,src:c,dst:r,...a},u=Yn(e,t,{ip:{src:c,dst:r,ttl:64,proto:l.proto},l4:{sport:l.sport,dport:l.dport},labels:[]},{flow:l,vrf:i});return{kind:`host`,layer:`physical`,title:`${t}${i?` (VRF ${i})`:``} -> ${r} (${e.mpls.mode.toUpperCase()})`,flow:l,steps:u,delivered:u.at(-1).status===`delivered`}}function cr(e,t){let n=e.links.find(e=>e.id===t||e.members.some(e=>e.id===t));if(!n)throw Error(`unknown link or member ${t}`);return n}function lr(e,t){return Object.fromEntries(Object.values(e.mpls.lfib[t]??{}).map(e=>[e.fec,e]))}function ur(e){return e?e.nextHops.map(t=>(t.op===`swap`?`swap ${e.inLabel}->${t.outLabel}`:`pop ${e.inLabel}`)+` to ${t.node}`).join(`, `):`none`}function dr(e,t,{labelMode:r=`ldp`,vendor:i,detection:a=`ccm`,from:o=null,to:s=null,host:c=null}={}){let l={labelMode:r,...i?{vendor:i}:{}},u=Fn(e,l),d=u.vendor,f=cr(e,t),p=e.nodes.filter(e=>e.role===`ce`&&e.lan).map(e=>e.id),m=o??p[0],h=s??p[1],g=e=>c?sr(e,c.from,c.dst,{vrf:c.vrf??null}):m&&h?Zn(e,m,h):null,_=g(u),v=[],y=(e,t,n,r,i={})=>v.push({t:e,layer:t,node:i.node??f.a.node,title:`t=${qt(e)}: ${n}`,actions:r,headers:i.headers??[],moves:i.moves??[],status:i.status??`forward`,highlight:i.highlight??{links:[f.id]},...i.network?{network:i.network}:{}});y(0,`physical`,`${t} fails`,[`${f.lag&&t!==f.id?`LAG member`:`link`} ${t} stops carrying frames`],{status:`dropped`});let b=(d.lacp.shortTimeout?1:30)*3*1e3,x=`no LACPDU for 3 x ${d.lacp.shortTimeout?`1 s (short timeout)`:`30 s (long timeout)`}: partner info expired (802.1AX §6.4.12)`;if(Fn(e,{...l,failures:[t]}).links[f.id].up){let n=Fn(e,{...l,failures:[t]}),r=u.links[f.id].members.find(e=>e.id===t),i=n.links[f.id].members.find(e=>e.id===t),o=a===`los`?0:b;a!==`los`&&y(0,`physical`,`${t}: frames lost until LACP notices`,[`silent failure: the member stays up at both ends, flows hashed onto it are dropped`],{status:`dropped`}),y(o,`physical`,`LACP removes ${t} from ${f.a.if}`,[...a===`los`?[`loss of signal: the port goes down at once`]:[x],`port disabled: Selected -> UNSELECTED, Mux leaves COLLECTING_DISTRIBUTING (802.1AX §6.4.14-15)`,`actor state 0x${r.actorState.toString(16)} [${ot(r.actorState).join(`,`)}] -> 0x${i.actorState.toString(16)} [${ot(i.actorState).join(`,`)}]`,`distributing members: ${u.links[f.id].distributing.join(`, `)} -> ${n.links[f.id].distributing.join(`, `)}`]),y(o,`cfm`,`CCMs on MEG-${f.id} keep flowing`,[`MEPs sit on the aggregated interface; no loss of continuity`]),y(o,`isis`,`${u.igpName===`ospf`?`OSPF neighbour stays Full`:`IS-IS adjacency stays Up`}`,[`LAG still up (min-links 1): no LSP/LSA change, no SPF`]);let s=g(n);if(s){let e=e=>e.steps.flatMap(e=>e.moves).find(e=>e.link===f.id)?.member;y(o,`physical`,`Flows rehash onto the surviving members`,[`${c?`${c.from}->${c.dst}`:`${m}->${h}`} flow: member ${e(_)??`-`} -> ${e(s)??`-`}`],{status:`delivered`})}return{before:u,after:n,walkBefore:_,walkAfter:s,replay:{kind:`replay`,layer:`physical`,title:`Failure replay: ${t}`,steps:v}}}let S=[f.a.node,f.b.node],C={},w=u.igpName===`ospf`,T=u.igp.adjacencies.some(e=>e.link===f.id),E=u.cfm.megs.find(e=>e.link===f.id);if(a===`ccm`&&E){let e=2*E.intervalMs,{defectAt:t}=Kt(E,{durationMs:e+5*E.intervalMs,failAtMs:e});for(let n of E.meps)C[n.node]=t[n.mepId]-e;for(let e of E.meps)y(C[e.node],`cfm`,`${e.node} MEP ${e.mepId}: loss of continuity`,[`no CCM for 3.5 x ${qt(E.intervalMs)} -> DefRemoteCCM; RDI set`,`interface ${e.if} declared down to IS-IS`],{node:e.node,status:`dropped`})}else if(a===`ccm`&&f.bfd){let e=d.bfd.intervalMs*d.bfd.detectMult;for(let t of S)C[t]=e,y(e,`physical`,`${t}: BFD session on ${f.id} Down`,[`no BFD Control packet for ${d.bfd.detectMult} x ${qt(d.bfd.intervalMs)} -> Down (Control Detection Time Expired)`,`clients (the IGP) told the neighbour is gone`],{node:t,status:`dropped`})}else if(a===`ccm`&&f.lag)for(let e of S)C[e]=b,y(b,`physical`,`${e}: ${f.id} members expire, LAG down`,[x,`no member distributing: the aggregated interface goes down`],{node:e,status:`dropped`});else if(a===`ccm`&&T){let e=w?d.ospf.deadIntervalS*1e3:d.isis.holdMultiplier*d.isis.helloIntervalS*1e3,t=w?`no Hello for RouterDeadInterval ${qt(e)} (RFC 2328 §10.3 InactivityTimer)`:`no IIH for the holding time ${d.isis.holdMultiplier} x ${qt(d.isis.helloIntervalS*1e3)} (ISO 10589)`;y(0,`physical`,`Silent failure: no CFM MEG or BFD on the link`,[`both interfaces stay up; traffic onto the link is dropped until the IGP notices`],{status:`dropped`});for(let n of S)C[n]=e,y(e,`isis`,`${n}: ${w?`OSPF`:`IS-IS`} hold timer on ${f.id} expires`,[t],{node:n,status:`dropped`})}else if(a===`ccm`){for(let e of S)C[e]=0;y(0,`physical`,`Silent failure: nothing watches the link`,[`no CFM MEG, BFD, LACP or IGP adjacency on it: both interfaces stay up and traffic onto it is dropped`],{status:`dropped`})}else{for(let e of S)C[e]=0;y(0,`physical`,`Loss of signal at both ends`,S.map(e=>`${e}: interface down`),{status:`dropped`})}let D=T?S.filter(e=>w?u.ospf.lsas[e]:u.isis.lsps[e]):[],O=w?u.ospf.adjacencies.find(e=>e.link===f.id)?.area:null,k=Object.fromEntries(w?D.map(e=>[e,Math.max(...Object.values(u.ospf.lsas[e]).map(e=>e.seq))+1]):D.map(e=>[e,u.isis.lsps[e].seq+1])),A=Fn(e,{...l,failures:[t],...w?{ospfSeqs:k}:{isisSeqs:k}}),j={};for(let e of w&&O?D:[]){let t=C[e];y(t,`isis`,`${e}: OSPF neighbour ${S.find(t=>t!==e)} on ${f.id} Full -> Down`,[`Router-LSA changes: schedule re-origination`],{node:e});let n=t+d.ospf.lsaGenDelayMs,r=A.ospf.lsas[e][O];y(n,`isis`,`${e} originates Router-LSA ${r.lsId} seq ${Ot(r.seq)} (area ${O})`,[`p2p neighbours now: ${r.links.map(e=>e.neighbor).join(`, `)||`none`}`],{node:e}),j[e]=Math.min(j[e]??1/0,t);let i={...Bt(u.ospf,O),adjacencies:A.ospf.adjacencies.filter(e=>e.area===O)};for(let t of wt(i,e,r,d,d.ospf.floodHopDelayMs)){let r=n+t.t;t.result===`installed`&&(j[t.to]=Math.min(j[t.to]??1/0,r)),y(r,`isis`,`${e}'s LSA ${t.from} -> ${t.to}: ${t.result}`,[t.result===`installed`?`newer seq: install, LS Ack, flood on`:`already held: LS Ack, discard`],{node:t.to,moves:[{from:t.from,to:t.to,link:t.link,member:null,duplicate:t.result!==`installed`}],highlight:{links:[f.id,t.link]}})}}if(w&&O)for(let e of u.ospf.routers)j[e]===void 0&&JSON.stringify(u.ospf.rib[e])!==JSON.stringify(A.ospf.rib[e])&&(j[e]=Math.max(0,...Object.values(j))+d.ospf.floodHopDelayMs);for(let e of w?[]:D){let t=C[e];y(t,`isis`,`${e}: IS-IS adjacency on ${f.id} Down`,[`remove from TLV 22, schedule LSP regeneration`],{node:e});let n=t+d.isis.lspGenDelayMs,r=A.isis.lsps[e];y(n,`isis`,`${e} originates ${r.lspId} seq ${r.seq}`,[`IS neighbours now: ${r.isReach.map(e=>e.neighbor).join(`, `)||`none`}`],{node:e}),j[e]=Math.min(j[e]??1/0,t);let i={routers:u.isis.routers,adjacencies:A.isis.adjacencies,lsps:u.isis.lsps};for(let t of wt(i,e,r,d)){let r=n+t.t;t.result===`installed`&&(j[t.to]=Math.min(j[t.to]??1/0,r)),y(r,`isis`,`${e}'s LSP ${t.from} -> ${t.to}: ${t.result}`,[t.result===`installed`?`newer seq: install and flood on`:`already held: ack and discard`],{node:t.to,moves:[{from:t.from,to:t.to,link:t.link,member:null,duplicate:t.result!==`installed`}],highlight:{links:[f.id,t.link]}})}}let M=w?d.ospf.spfDelayMs:d.isis.spfDelayMs;for(let t of u.igp.routers){if(j[t]===void 0)continue;let r=j[t]+M,i=[];for(let[e,n]of Object.entries(u.igp.rib[t])){if(!e.endsWith(`/32`))continue;let r=A.igp.rib[t][e],a=n.nextHops.map(e=>e.node).join(`+`)||`local`,o=r?r.nextHops.map(e=>e.node).join(`+`)||`local`:`unreachable`;r&&a===o&&r.metric===n.metric||i.push(`${e}: via ${a} (${n.metric}) -> ${r?`via ${o} (${r.metric})`:`unreachable`}`)}let a=lr(u,t),o=lr(A,t);for(let e of new Set([...Object.keys(a),...Object.keys(o)])){let t=ur(a[e]),n=ur(o[e]);t!==n&&i.push(`LFIB ${e}: ${t} -> ${n}`)}let s=A.mpls.mode===`none`?`SPF`:`SPF + ${A.mpls.mode.toUpperCase()} LFIB update`;if(y(r,A.mpls.mode===`none`?`isis`:`mpls`,`${t}: ${s}`,i.length?i:[`SPF: no best-path change`],{node:t,highlight:{links:[f.id],nodes:[t]}}),n(e,t).role===`pe`){let e=[];for(let[n,r]of Object.entries(u.bgp.vrfs[t]??{}))for(let i of Object.values(r).filter(e=>e.type===`bgp`)){let r=A.bgp.vrfs[t]?.[n]?.[i.prefix];r?.type===`bgp`?e.push(`${n} ${i.prefix}: NH ${i.nextHop} still resolved (IGP ${i.igpCost} -> ${r.igpCost}), kept`):e.push(`${n} ${i.prefix}: NH ${i.nextHop} unreachable -> removed (RFC 4271 §9.1.2.1)`)}e.length&&y(r,`bgp`,`${t}: BGP next-hop tracking`,e,{node:t})}}for(let e of A.bgp.sessions.filter(e=>e.state!==`Established`))u.bgp.sessions.find(t=>t.a===e.a&&t.b===e.b)?.state===`Established`&&y(d.bgp.holdTimeS*1e3,`bgp`,`iBGP ${e.a}-${e.b} HoldTimer expires`,[`no KEEPALIVE for the hold time: Established -> Idle (Event 10), Adj-RIB-In flushed`],{node:e.a,status:`dropped`});mr(u,A,f,C,y),hr(u,A,f,C,y);let N=fr(e,u,A,f,C,a,y);v.sort((e,t)=>e.t-t.t);let P=g(A),ee=v.at(-1).t,te=A.sr.policies.map(e=>`SR policy ${e.name}: ${e.valid?e.path.join(` -> `):`invalid (${e.reason})`}`),ne=A.tp.tunnels.map(e=>`MPLS-TP ${e.id}: ${e.state}${e.reasons.length?` (${e.reasons.join(`; `)})`:``}`),re=A.vpws.pseudowires.map(e=>`PW ${e.id}: ${e.state}${e.reasons.length?` (${e.reasons.join(`; `)})`:``}`),F=P?P.delivered?`Converged: traffic restored`:`Converged: destination unreachable`:`Converged`,ie=P?P.delivered?`delivered`:`dropped`:A.vpws.pseudowires.some(e=>e.state!==`Up`)?`dropped`:`delivered`,ae=A.g8032.rings.filter(e=>e.links.includes(f.id)).map(e=>`G.8032 ${e.name}: ${e.state}${e.state===`protection`?` (RPL forwarding, ${f.id} blocked)`:``}`);y(ee,`physical`,F,[...P?[`${c?`${c.from} -> ${c.dst}`:`${m} -> ${h}`}: ${P.steps.flatMap(e=>e.moves).map(e=>e.to).join(` -> `)}`]:[],...te,...ne,...re,...ae],{status:ie,...N.length?{network:`after`}:{}});let I={};if(N.length){let t=Object.fromEntries(N.map(e=>[e.ring.id,{blocked:[f.a.node,f.b.node].map(e=>({node:e,link:f.id,why:`recovered`})),state:`pending`}]));I.pending=Fn(e,{...l,ringOverrides:t}),pr(e,u,f,N,ee,y),v.sort((e,t)=>e.t-t.t)}return{before:u,after:A,walkBefore:_,walkAfter:P,networks:I,replay:{kind:`replay`,layer:`physical`,title:`Failure replay: ${t}`,steps:v}}}function fr(e,t,n,r,i,a,o){let s=t.vendor,c=[],l=[r.a.node,r.b.node],u=t.cfm.megs.find(e=>e.link===r.id);for(let d of t.g8032.rings){if(!d.links.includes(r.id))continue;let t=e.rings.find(e=>e.id===d.id),f={links:[r.id,...t.links]},p=t.members.length?t.members.join(`, `):`the ring VLANs`;if(!t.rpl){o(0,`ring`,`${t.name}: no RPL owner`,[`the facts configure no RPL owner on this ring: the view cannot replay its protection switch`],{status:`dropped`,highlight:f});continue}let m=r.id===t.rpl.link,h=0;for(let n of l){let c=bn(t,n,r.id),g=(i[n]??0)+d.timers.holdOffMs,_=a===`los`?`loss of signal on ring port ${c.name} (${c.if}): local Signal Fail`:u||r.bfd?`${u?`CFM`:`BFD`} on the link: loss of continuity -> Signal Fail on ring port ${c.name} (${c.if})`:`no CFM MEP on ring port ${c.name} (${c.if}) in the facts: the port stays up, and G.8032 sees the failure only when the port is declared down at t=${qt(i[n]??0)}; until then frames of ${p} into ${r.id} are dropped`;o(g,`ring`,`${n}: ${t.name} Signal Fail on ${r.id}`,[_,...d.timers.holdOffMs?[`hold-off ${d.timers.holdOffMs} ms before acting (§10.1.8)`]:[],m?`ring port ${c.name} is the RPL port: it was blocked already; flush the FDB`:`block ring port ${c.name}, flush the FDB`,`send R-APS(SF) on both ring ports: 3 frames ${qt(s.g8032.rapsBurstMs)} apart, then every ${s.g8032.rapsPeriodS} s (§10.1.9)`],{node:n,status:m?`forward`:`dropped`,highlight:f,network:`after`});for(let i of Tn(e,t,n,{avoid:r.id})){let r=g+i.depth*s.g8032.rapsHopDelayMs;h=Math.max(h,r);let a=[`R-APS(SF) from ${n} (node id, BPR): flush the FDB (§10.1.10)`];i.to===t.rpl.owner&&!m&&a.push(`RPL owner: unblock the RPL port on ${t.rpl.link}`),i.to===t.rpl.neighbor&&!m&&a.push(`RPL neighbour: unblock the RPL port on ${t.rpl.link}`),l.includes(i.to)&&a.push(`in Signal Fail itself: its port on the failed link stays blocked`),t.type===`sub`&&t.interconnect.includes(i.to)&&a.push(`interconnection node: the sub-ring's R-APS channel ends here (no virtual channel), nothing is sent onto the major ring`),o(r,`ring`,`${t.name} R-APS(SF) ${i.from} -> ${i.to}`,a,{node:i.to,moves:[{from:i.from,to:i.to,link:i.link,member:null}],headers:wn(t,n,_n.SF,{},s,e),highlight:f,network:`after`})}}let g=Cn(e,n.g8032,t.id,l[0],l[1]);o(h,`ring`,`${t.name}: protection state`,[m?`the failed link is the RPL: it was blocked already, so the ring forwards as before; R-APS(SF) replaces R-APS(NR, RB) on the ring`:`RPL ${t.rpl.link} forwarding (unblocked by ${t.rpl.owner}${t.rpl.neighbor?` and ${t.rpl.neighbor}`:``}); ${r.id} blocked at ${l.join(` and `)}`,g?`${p}: ${l[0]} -> ${l[1]} now ${g.nodes.join(` -> `)}${t.subRingOf?` (through the interconnection nodes when it crosses the major ring)`:``}`:`${p}: ${l[0]} and ${l[1]} are no longer joined by the ring`,`R-APS(SF) repeats every ${s.g8032.rapsPeriodS} s while the failure lasts`],{node:t.rpl.owner,status:g?`delivered`:`dropped`,highlight:f,network:`after`}),c.push({ring:t,state:d,tProtection:h})}return c}function pr(e,t,n,r,i,a){let o=t.vendor,s=[n.a.node,n.b.node],c=Math.max(i+1e3,o.g8032.repairAfterS*1e3),l=r.map(e=>e.ring.name).join(`, `);a(c,`physical`,`${n.id} repaired`,[`both ends see the link up again (model: the replay repairs it ${o.g8032.repairAfterS} s after the failure)`,`${l}: the ring ports on it stay blocked until R-APS says otherwise`],{status:`forward`,highlight:{links:[n.id]},network:`pending`});for(let{ring:i,state:l}of r){let r={links:[n.id,...i.links]},u=l.timers,d=i.rpl&&n.id===i.rpl.link,f=null;for(let t of s){let s=bn(i,t,n.id);a(c,`ring`,`${t}: ${i.name} Signal Fail cleared on ${n.id}`,[`ring port ${s.name} (${s.if}) up: clear SF, keep the port blocked`,`start the guard timer (${u.guardMs} ms, §10.1.5): R-APS received meanwhile is ignored, so stale R-APS(SF) still circulating cannot reopen the failure`,`send R-APS(NR) on both ring ports`],{node:t,highlight:r,network:`pending`});for(let s of Tn(e,i,t,{avoid:n.id})){let n=c+s.depth*o.g8032.rapsHopDelayMs,l=[`R-APS(NR) from ${t}: no request pending at ${t}`];s.to===i.rpl.owner&&(f=f===null?n:Math.min(f,n),l.push(u.revertive?`RPL owner, revertive: start wait-to-restore (${u.wtrMin} min, §10.1.4 c)`:`RPL owner, non-revertive: no WTR; the RPL keeps forwarding`)),a(n,`ring`,`${i.name} R-APS(NR) ${s.from} -> ${s.to}`,l,{node:s.to,moves:[{from:s.from,to:s.to,link:s.link,member:null}],headers:wn(i,t,_n.NR,{},o,e),highlight:r,network:`pending`})}}if(a(c+u.guardMs,`ring`,`${s.join(`, `)}: ${i.name} guard timer expires`,[`R-APS is accepted again on the recovered ports`],{node:s[0],highlight:r,network:`pending`}),!i.rpl)continue;if(!u.revertive){a(f??c,`ring`,`${i.name}: non-revertive, stays as it is`,[`RPL ${i.rpl.link} keeps forwarding; ${n.id} stays blocked at ${s.join(` and `)} until an operator clears it (§10.1.4)`],{node:i.rpl.owner,highlight:r,network:`pending`});continue}let p=(f??c)+u.wtrMin*6e4;a(p,`ring`,`${i.rpl.owner}: ${i.name} WTR expires`,[`block the RPL port on ${i.rpl.link}, flush the FDB`,`send R-APS(NR, RB) on both ring ports (§10.1.4 c)`],{node:i.rpl.owner,highlight:r,network:`pending`});let m=p;for(let t of Tn(e,i,i.rpl.owner)){let c=p+t.depth*o.g8032.rapsHopDelayMs;m=Math.max(m,c);let l=[`R-APS(NR, RB) from ${i.rpl.owner}: flush the FDB`];s.includes(t.to)&&!d&&l.push(`unblock the recovered ring port on ${n.id}`),t.to===i.rpl.neighbor&&l.push(d?`RPL neighbour: the recovered port is the RPL, it stays blocked`:`RPL neighbour: block the RPL port on ${i.rpl.link}`),a(c,`ring`,`${i.name} R-APS(NR, RB) ${t.from} -> ${t.to}`,l,{node:t.to,moves:[{from:t.from,to:t.to,link:t.link,member:null}],headers:wn(i,i.rpl.owner,_n.NR,{rb:!0},o,e),highlight:r,network:`pending`})}let h=Cn(e,t.g8032,i.id,s[0],s[1]);a(m,`ring`,`${i.name}: idle state restored`,[`RPL ${i.rpl.link} blocked by ${i.rpl.owner}${i.rpl.neighbor?` and ${i.rpl.neighbor}`:``}${d?``:`; ${n.id} forwarding again`}`,...h?[`${i.members.join(`, `)||`the ring VLANs`}: ${s[0]} -> ${s[1]} again ${h.nodes.join(` -> `)}`]:[]],{node:i.rpl.owner,status:`delivered`,highlight:r,network:`before`})}}function mr(e,t,n,r,i){let a=e.vendor,o={};for(let a of e.tp.tunnels){if(!a.links.includes(n.id))continue;let e=t.tp.tunnels.find(e=>e.id===a.id),s={highlight:{links:[n.id,...a.links]}};for(let t of[a.src,a.dst]){if(a.endState[t]===e.endState[t]){i(0,`mpls`,`${t}: tunnel ${a.id} still Up`,[`no OAM on the LSP and the failed link is not its own interface: the failure is not seen`,`traffic into the tunnel is black-holed`],{node:t,status:`dropped`,...s});continue}let c=e.oam?e.detectionMs:r[t]??0;o[`${a.id}|${t}`]=c;let l=e.oam?[`${e.oam.kind.toUpperCase()} CC on ${a.ids.lspId}: nothing received for ${qt(e.detectionMs)} -> loss of continuity`,`tunnel Down at this end (Signal Fail)`]:[`interface on ${n.id} down -> tunnel Down at this end`];i(c,`mpls`,`${t}: tunnel ${a.id} Down`,l,{node:t,status:`dropped`,...s})}}for(let r of t.tp.groups){let s=e.tp.groups.find(e=>e.primary===r.primary);for(let[e,c]of Object.entries(r.active)){if(s?.active[e]===c)continue;let l=Math.max(0,...Object.entries(o).filter(([t])=>t.endsWith(`|${e}`)).map(([,e])=>e)),u=t.tp.tunnels.find(e=>e.id===c);i(l+a.mplsTp.protectionSwitchMs,`mpls`,`${e}: protection switch ${s?.active[e]??r.primary} -> ${c}`,[`Signal Fail on the working LSP: select the protection LSP (RFC 6378 §4.3, 1:1)`,`now sending on ${u.path.join(` -> `)}`],{node:e,highlight:{links:[n.id,...u.links]}})}}let s=Math.max(0,...Object.values(o))+a.mplsTp.protectionSwitchMs;for(let n of t.vpws.pseudowires){let t=e.vpws.pseudowires.find(e=>e.id===n.id);if(!t||!n.ends.some(e=>e.underlay===`mpls-tp`))continue;let r=e=>e.ends.map(e=>`${e.node}: ${e.transport.tunnel??e.transport.error??`-`}`).join(`, `);if(t.state===n.state&&r(t)===r(n))continue;let a=t.state===n.state?`stays ${n.state}, on ${n.ends.map(e=>e.transport.tunnel).join(` / `)}`:`${t.state} -> ${n.state}`;i(s,`pw`,`PW ${n.pwid} (${n.service}): ${a}`,[`tunnels: ${r(t)} -> ${r(n)}`,...n.reasons],{node:n.ends[0].node,status:n.state===`Up`?`delivered`:`dropped`})}}function hr(e,t,n,r,i){let a=e.vendor,o=e=>e?`${e.type}${e.type===`static`?` via ${e.via.ip} pref ${e.preference}`:e.type===`bgp`?` NH ${e.nextHop}`:``}`:`none`,s=e=>r[e]??0;for(let n of e.bgp.pes)for(let[r,c]of Object.entries(e.bgp.vrfs[n]??{})){let l=t.bgp.vrfs[n]?.[r]??{},u=[];for(let e of new Set([...Object.keys(c),...Object.keys(l)])){let[t,n]=[c[e],l[e]];if(t?.type===`bgp`||n?.type===`bgp`||o(t)===o(n))continue;let r=n?.alternatives?.filter(e=>e.state===`unresolved`).map(e=>`${e.nextHop} pref ${e.preference} unresolved (interface down)`)??[];u.push(`${e}: ${o(t)} -> ${o(n)}${r.length?` (${r.join(`, `)})`:``}`)}if(!u.length)continue;let d=s(n);i(d,`bgp`,`${n}: VRF ${r} routes`,u,{node:n});let f=e=>`${e.prefix}|${e.label}|${e.nextHop}`,p=new Map(e.bgp.originated[n].filter(e=>e.vrf===r).map(e=>[e.prefix,e])),m=new Map(t.bgp.originated[n].filter(e=>e.vrf===r).map(e=>[e.prefix,e])),h=[...m.keys()].filter(e=>p.has(e)&&f(p.get(e))===f(m.get(e))&&u.some(t=>t.startsWith(`${e}:`))),g=[...p.keys()].filter(e=>!m.has(e)),_=[...m.keys()].filter(e=>!p.has(e)),v=[...h.map(e=>`${e}: still exported (next hop ${m.get(e).nextHop}, VPN label ${m.get(e).label} unchanged): no UPDATE needed`),...g.map(e=>`${e}: MP_UNREACH_NLRI (withdraw) to ${t.bgp.sessions.filter(e=>e.a===n||e.b===n).map(e=>e.a===n?e.b:e.a).join(`, `)||`no peer`}`),..._.map(e=>`${e}: UPDATE, label ${m.get(e).label}`)];v.length&&i(d+a.bgp.updateDelayMs,`bgp`,`${n}: BGP VPN-IPv4 export`,v,{node:n});for(let s of e.bgp.pes){if(s===n||!g.length&&!_.length)continue;let c=[...g,..._].filter(n=>o(e.bgp.vrfs[s]?.[r]?.[n])!==o(t.bgp.vrfs[s]?.[r]?.[n]));c.length&&i(d+2*a.bgp.updateDelayMs,`bgp`,`${s}: VRF ${r} updated`,c.map(n=>`${n}: ${o(e.bgp.vrfs[s]?.[r]?.[n])} -> ${o(t.bgp.vrfs[s]?.[r]?.[n])}`),{node:s})}}}var gr=`0.0.0`,_r=class extends Error{name=`FactsFormatError`};function vr(e){let t=typeof e==`string`?JSON.parse(e):e;if(Array.isArray(t))return{schema_version:gr,generator:{name:`legacy`,version:``,translator:null},devices:t};if(!t||typeof t!=`object`)throw new _r(`a facts file is a JSON object`);let n=t;if(Number(String(n.schema_version??``).split(`.`)[0])!==1)throw new _r(`schema_version ${JSON.stringify(n.schema_version)}: this reader reads 1.x`);if(!Array.isArray(n.devices))throw new _r(`devices: expected a list of device records`);return n}function yr(e){let t=new Map;for(let n of e.devices)(n.status===`ok`||n.status===`partial`)&&n.facts&&t.set(n.device,n.facts);return t}var br=[`loopback`,`lag`,`ettp`,`management`,`system`];function xr(e){return!!e.ip&&!br.includes(e.kind)}function Sr(e,t){let n=e.ports??{},r=String(t),i=n[r]?.lag??null,a=[r,...i?[i]:[]],o=(e.interfaces??[]).filter(xr),s=e.classifiers??{},c=new Map((e.isis?.interfaces??[]).map(e=>[e.interface,e.instance??null])),l=[],u=(e,t)=>{l.some(t=>t.name===e.name)||l.push({name:e.name,ip:e.ip,vlan:t,isis:e.isis??c.get(e.name)??null,lag:i})};for(let t of e.fps??[]){if(!t.fd||!t.logical_port||!a.includes(String(t.logical_port)))continue;let e=o.find(e=>e.fd===t.fd);e&&u(e,(t.classifiers??[]).flatMap(e=>s[e]??[])[0]??null)}for(let e of a)for(let t of n[e]?.vlans??[]){let e=o.find(e=>e.vlan!==null&&e.vlan!==void 0&&String(e.vlan)===String(t));e&&u(e,String(t))}return l}function Cr(e){return(e.interfaces??[]).filter(e=>e.kind===`loopback`&&e.ip).map(e=>({name:e.name,ip:e.ip,isis:e.isis??null}))}function wr(e){if(!e)return null;let t=e.trim().split(`.`);return t.length<5?null:t}function Tr(e){let t=wr(e);return t?t.slice(0,-4).join(`.`):null}function Er(e){return e.area_id?e.area_id:e.net?Tr(e.net):Tr(e.area)??e.area??null}function Dr(e){let t=/([12])$/.exec(String(e).trim());return t?Number(t[1]):null}function Or(e,t,n){let r=Dr(n);if(r===null)return null;for(let n of e.isis?.interfaces??[]){if(n.interface!==t)continue;let e=(n.metrics??[]).find(e=>Dr(e.level)===r),i=e?.wide_metric??e?.metric??null;if(i!==null&&i!==``&&Number.isFinite(Number(i)))return Number(i)}return null}function kr(e){let t=(typeof e==`string`?e:e?.ccm_interval)??null;if(t===null)return null;let n=String(t).trim().toLowerCase(),r={1:10/3,2:10,3:100,4:1e3,5:1e4,6:6e4,7:6e5}[n];if(r!==void 0)return r;let i=/^(\d+(?:\.\d+)?)\s*(ms|s|sec|min)$/.exec(n);if(!i)return null;let a=Number(i[1]),o=i[2];return o===`ms`?Math.abs(a-3.3)<.1?10/3:a:o===`min`?a*6e4:a*1e3}function Ar(e){return e&&`facts`in e&&!(`hostname`in e)?e.facts:e}function jr(e){return(Ar(e)?.rings??[]).map(e=>({...e,ports:e.ports??[],instances:e.instances??[]}))}var Mr=400,Nr=50,Pr=30;function Fr(e,t){let n=e.length;if(!n)return{};let r=new Map(e.map((e,t)=>[e,t])),i=t.map(([e,t])=>[r.get(e),r.get(t)]).filter(([e,t])=>e!==void 0&&t!==void 0&&e!==t),a=e.map((e,t)=>({x:Math.cos(2*Math.PI*t/n)*10,z:Math.sin(2*Math.PI*t/n)*10})),o=Math.sqrt(400/n),s=5;for(let e=0;e<Mr;e++){let e=a.map(()=>({x:0,z:0}));for(let t=0;t<n;t++)for(let r=t+1;r<n;r++){let n=a[t].x-a[r].x,i=a[t].z-a[r].z,s=Math.max(Math.hypot(n,i),.01),c=o*o/s;e[t].x+=n/s*c,e[t].z+=i/s*c,e[r].x-=n/s*c,e[r].z-=i/s*c}for(let[t,n]of i){let r=a[t].x-a[n].x,i=a[t].z-a[n].z,s=Math.max(Math.hypot(r,i),.01),c=s*s/o;e[t].x-=r/s*c,e[t].z-=i/s*c,e[n].x+=r/s*c,e[n].z+=i/s*c}for(let t=0;t<n;t++){let n=Math.max(Math.hypot(e[t].x,e[t].z),.01);a[t].x+=e[t].x/n*Math.min(n,s),a[t].z+=e[t].z/n*Math.min(n,s)}s=Math.max(.05,s*.985)}return Lr(e,a)}function Ir(e,t){let n=t?.positions??t??{},r=e=>(Array.isArray(e)?e:[e?.x,e?.y??e?.z]).map(Number),i=e.filter(e=>n[e]!==void 0&&r(n[e]).every(Number.isFinite)),a=e.filter(e=>!i.includes(e));return a.length||!e.length?{pos:{},missing:a}:{pos:Lr(e,e.map(e=>({x:r(n[e])[0],z:r(n[e])[1]}))),missing:a}}function Lr(e,t){let n=e=>Math.max(...t.map(t=>t[e]))-Math.min(...t.map(t=>t[e]));if(n(`z`)>n(`x`))for(let e of t)[e.x,e.z]=[e.z,e.x];let r=(Math.max(...t.map(e=>e.x))+Math.min(...t.map(e=>e.x)))/2,i=(Math.max(...t.map(e=>e.z))+Math.min(...t.map(e=>e.z)))/2,a=Math.min(Nr/(n(`x`)||1),Pr/(n(`z`)||1)),o=e=>Math.round(e*100)/100;return Object.fromEntries(e.map((e,n)=>[e,{x:o((t[n].x-r)*a),z:o((t[n].z-i)*a)}]))}var Rr=10;function zr(e){let t=/^(\d{1,3}(?:\.\d{1,3}){3})\/(\d{1,2})$/.exec(e??``);if(!t)return null;let n=Number(t[2]);return n>32?null:{ip:t[1],len:n,subnet:`${ut(dt(`${t[1]}/${n}`).net)}/${n}`}}function Br(e,t){for(let n of Object.keys(e.ports??{}))if(Sr(e,n).some(e=>e.name===t))return e.ports[n].lag??n;return null}function Vr(e,t){if(!t)return null;let n=e.lags??[];return n.find(e=>e.name===t)??n.find(n=>n.name===e.ports?.[t]?.lag)??null}function Hr(e,t){let n=e=>String(e).split(/(\d+)/),r=n(e),i=n(t);for(let e=0;e<Math.max(r.length,i.length);e++){let[t,n]=[r[e]??``,i[e]??``];if(t!==n)return/^\d+$/.test(t)&&/^\d+$/.test(n)?Number(t)-Number(n):t<n?-1:1}return 0}function Ur(e,t,n,r){let i={lag:!1,members:[{id:e,a:t.if,b:n.if}]};if(!t.lag&&!n.lag)return i;if(!t.lag||!n.lag)return r.warn(`${e}: ${t.lag?t.node:n.node} rides LAG ${(t.lag??n.lag).name}, ${t.lag?n.node:t.node} no LAG; drawn as a plain link`),i;let a=Math.min(t.lag.members.length,n.lag.members.length);if(!a)return r.warn(`${e}: LAG ${t.lag.members.length?`${n.node} ${n.lag.name}`:`${t.node} ${t.lag.name}`} has no members; drawn as a plain link`),i;t.lag.members.length!==n.lag.members.length&&r.warn(`${e}: ${t.node} ${t.lag.name} has ${t.lag.members.length} members, ${n.node} ${n.lag.name} ${n.lag.members.length}; ${a} are drawn`);let[o,s]=[t,n].map(e=>[...e.lag.members].sort(Hr)),c=[];for(let t=0;t<a;t++)c.push({id:`${e}/${t+1}`,a:o[t],b:s[t]});return{lag:!0,members:c}}function Wr(e){let t=String(e??``);if(/1-?L?2$/i.test(t))return 2;let n=/([12])$/.exec(t);return n?Number(n[1]):null}var Gr=e=>e==null||e===``?null:Number(e),Kr=class{constructor(){this.items=[],this.warnings=[]}add(e,t,n,r){this.items.push({layer:e,source:t,item:n,detail:r})}warn(e){this.warnings.push(e)}get gaps(){let e={};for(let t of this.items)(e[t.layer]??=[]).push(t);return e}};function qr(e){let t=(e.ospf?.instances??[]).filter(e=>!e.vrf||e.vrf==="default"),n=new Set(t.map(e=>e.name));return{instances:t,interfaces:new Map((e.ospf?.interfaces??[]).filter(e=>n.has(e.instance)).map(e=>[e.interface,e]))}}function Jr(e,t){let n=t=>[...e.values()].filter(t).length,r=n(e=>e.isis?.instances?.length),i=n(e=>qr(e).instances.length),a=i>r?`ospf`:`isis`;return r&&i&&t.warn(`IS-IS on ${r} and OSPF on ${i} devices: the view runs one IGP, ${a===`ospf`?`OSPF`:`IS-IS`}`),a}function Yr(e,t,n){if(e===`isis`)return!!n.isis;let r=qr(t).interfaces.get(n.name);return!!r&&!r.passive}function Xr(e,t,n){let r=[];for(let[i,a]of e){let e=qr(a),o=Cr(a),s=(t===`ospf`?o.find(t=>e.interfaces.has(t.name)):o.find(e=>e.isis))??o[0]??null,c=s?zr(s.ip)?.ip??null:null,l=a.isis?.instances?.[0]??null,u=t===`ospf`?e.instances.length>0:!!l,d=(u||(a.tp_corouted_tunnels??[]).length>0)&&!!c,f={id:i,role:d?`p`:`ce`,pos:{x:0,z:0}};if(c&&(f.loopback=c),l?.system_id&&(f.systemId=l.system_id),t===`ospf`&&d){let t=e.instances[0]?.router_id;t&&(f.routerId=t);let n=kt(e.interfaces.get(s.name)?.area);n&&(f.loopbackArea=n)}if(d){let e=(a.segment_routing?.prefix_sids??[]).find(e=>e.prefix===`${c}/32`);e?.value_type===`index`&&(f.sidIndex=Number(e.sid)),t===`isis`&&l&&!l.system_id&&n.warn(`${i}: IS-IS instance ${l.name} has no NET; its LSP ID is made up`)}else u&&n.warn(`${i}: runs ${t===`ospf`?`OSPF`:`IS-IS`} but has no loopback address; shown as a host`);r.push(f)}return r}function Zr(e,t,n,r){let i=[e.a,e.b].map(e=>qr(t.get(e.node)).interfaces.get(e.if)??null),a=i.map(e=>kt(e?.area));a[0]&&a[1]&&a[0]!==a[1]&&n.warn(`${e.id}: OSPF areas ${a[0]} and ${a[1]} on its two ends; no adjacency forms on a real network, the view uses ${a[0]}`),e.area=a[0]??a[1]??`0.0.0.0`,!a[0]&&!a[1]&&r.area++;let o=i.map(e=>Gr(e?.metric));o.some(e=>e===null)&&r.metric++;let[s,c]=o.map(e=>e??Nn.ospf.defaultCost);e.metric=s,s!==c&&(e.cost={a:s,b:c}),i.every(e=>e?.bfd)&&(e.bfd=!0)}function Qr(e,t,n,r){let i=[e.a,e.b].map(e=>Or(t.get(e.node),e.if,n));i.some(e=>e===null)&&r.metric++;let[a,o]=i.map(e=>e??Rr);e.metric=a,a!==o&&(e.cost={a,b:o})}function $r(e,t,n,r,i){let a=new Map;for(let[t,r]of e)for(let e of r.interfaces??[])if(xr(e))for(let i of e.ipv4?.length?e.ipv4:[e.ip]){let o=zr(i);if(!o||o.len>=32)continue;a.has(o.subnet)||a.set(o.subnet,[]);let s=Br(r,e.name);a.get(o.subnet).push({node:t,if:e.name,ip:o.ip,port:s,lag:Vr(r,s),igp:Yr(n,r,e)})}let o=Object.fromEntries(t.map(e=>[e.id,e.role])),s=[],c=new Set,l=e=>{let t=e=>e.length===2&&e[0].node!==e[1].node?e:null;return t(e)??(e.length>2?t(e.filter(e=>e.igp)):null)},u=n===`ospf`?`OSPF`:`IS-IS`;for(let[e,t]of a){let n=l(t);if(!n){t.length>2&&i.warn(`${e}: ${t.length} interfaces (${t.map(e=>`${e.node} ${e.if}`).join(`, `)}) and no two of different devices run ${u}; only point-to-point links are drawn`);continue}let[r,a]=n;if(t.length>2){let n=t.filter(e=>e!==r&&e!==a);i.warn(`${e}: ${t.length} interfaces; drawn between the two that run ${u} (${r.node} ${r.if}, ${a.node} ${a.if}), ignoring ${n.map(e=>`${e.node} ${e.if}`).join(`, `)}`)}let d=o[r.node]!==`ce`&&o[a.node]!==`ce`&&r.igp&&a.igp,f=`${r.node}-${a.node}`;c.has(f)&&(f=`${f} ${e}`),c.add(f);let p=e=>({node:e.node,if:e.if,ip:e.ip,...e.port?{port:e.port}:{}}),{lag:m,members:h}=Ur(f,r,a,i);s.push({id:f,kind:d?`core`:`access`,...d?{metric:Rr}:{},subnet:e,lag:m,a:p(r),b:p(a),members:h})}let d=s.filter(e=>e.lag);d.length&&(i.add(`physical`,`facts`,`${d.length} LAG links`,`links whose interfaces ride a LAG at both ends: ${d.map(e=>`${e.id} (${e.members.length} members)`).join(`, `)}`),i.add(`physical`,`derived`,`LAG member pairing`,`the facts do not say which member faces which: members are paired by port in natural order at both ends (29/30 with 29/30)`));let f=s.filter(e=>e.kind===`core`),p=n===`ospf`?`OSPF`:`IS-IS`;if(i.add(`physical`,`derived`,`${s.length} links`,`from interface subnets (two routed interfaces of different devices in one IPv4 subnet; management interfaces and loopbacks never link); ${f.length} core (${p} at both ends), ${s.length-f.length} access`),n===`isis`&&f.length){let t={metric:0};for(let n of f)Qr(n,e,r,t);i.add(`isis`,t.metric?`default`:`facts`,`link metrics`,t.metric?`${t.metric} of ${f.length} core links have an end without a level-${r} metric in the facts: metric ${Rr} there`:`per interface level-${r} metric (wide, else narrow)`)}if(n===`ospf`){let t={area:0,metric:0};for(let n of f)Zr(n,e,i,t);let n=[...new Set(f.map(e=>e.area))].sort();i.add(`ospf`,t.area?`default`:`facts`,`areas`,`${n.join(`, `)||`-`}, from the area networks covering each interface${t.area?`; ${t.area} links in no area on either end are in the backbone`:``}`),i.add(`ospf`,t.metric?`default`:`facts`,`interface costs`,t.metric?`${t.metric} links have an end without a configured metric: cost ${Nn.ospf.defaultCost} there`:`per interface metric`),i.add(`ospf`,`facts`,`BFD`,`${f.filter(e=>e.bfd).length} links with BFD on both ends`),i.add(`ospf`,`default`,`network type and timers`,`point-to-point on every core link; hello ${Nn.ospf.helloIntervalS} s, dead ${Nn.ospf.deadIntervalS} s (engine model values)`)}return s}function ei(e,t,n,r){let i=new Set(n.map(e=>e.id)),a=new Map;for(let t of e.links??[])a.set(`${t.a.device}|${t.a.port}`,`${t.b.device}|${t.b.port}`),a.set(`${t.b.device}|${t.b.port}`,`${t.a.device}|${t.a.port}`);let o=(e,t)=>e.port&&a.has(`${e.node}|${e.port}`)&&a.get(`${e.node}|${e.port}`)!==`${t.node}|${t.port}`,s=t.filter(e=>!e.lag&&(o(e.a,e.b)||o(e.b,e.a)));for(let e of s){e.bridged=[e.a,e.b].map(e=>`${e.node} ${e.if} (port ${e.port??`?`}, cabled to ${(a.get(`${e.node}|${e.port}`)??`?`).replace(`|`,` port `)})`).join(`, `);for(let t of[e.a,e.b])delete t.port}s.length&&r.add(`physical`,`derived`,`${s.length} subnets over a bridged domain`,`${s.map(e=>`${e.id} (${e.subnet}): ${e.bridged}`).join(`; `)}: the file's links[] cable those ports to other devices, so the subnet is an L3 adjacency over a bridged domain (a ring VLAN, a service), drawn as a link with no ports; the cables are drawn as L2 links`);let c=(e,n)=>t.some(t=>t.a.node===e&&t.a.port===n||t.b.node===e&&t.b.port===n),l=new Set(t.map(e=>e.id)),u=0;for(let n of e.links??[]){let[e,r]=[n.a,n.b];if(!i.has(e.device)||!i.has(r.device)||e.device===r.device||c(e.device,e.port)||c(r.device,r.port))continue;let a=`${e.device}-${r.device}`;l.has(a)&&(a=`${a} ${e.port}/${r.port}`),l.add(a),t.push({id:a,kind:`l2`,lag:!1,a:{node:e.device,if:e.port,port:e.port},b:{node:r.device,if:r.port,port:r.port},members:[{id:a,a:e.port,b:r.port}]}),u+=1}u&&r.add(`physical`,`facts`,`${u} L2 links`,`from the file's links[] (the extractor's topology): between two ports that no addressed link joins; no subnet, so no IGP and no routes over them`)}function ti(e){let t=new Map;for(let[n,r]of e)for(let e of r.interfaces??[])for(let r of[e.ip,...e.ipv4??[]]){let e=zr(r);e&&!t.has(e.ip)&&t.set(e.ip,n)}return t}function ni(e,t,n){let r=new Map,i=null;for(let[a,o]of e){i??=Gr(o.bgp?.instances?.[0]?.as);for(let e of(o.peers??[]).filter(e=>e.kind===`bgp`&&!e.vrf)){let i=t.get(e.ip);if(!i){n.warn(`${a}: BGP neighbour ${e.ip} is no device of this file`);continue}let o=[a,i].sort().join(`|`),s=r.get(o)??{a:[a,i].sort()[0],b:[a,i].sort()[1],client:null,configuredOn:[]};s.configuredOn.push(a),e.route_reflector_client&&(s.client=i),r.set(o,s)}}let a=[...r.values()];if(a.length){let t=[...new Set([...e].filter(([,e])=>e.bgp?.instances?.some(e=>e.route_reflector)).map(([e])=>e))];n.add(`bgp`,`facts`,`${a.length} iBGP sessions`,`neighbours matched to the device owning each address${t.length?`; route reflector ${t.join(`, `)}`:``}`)}for(let e of a)e.configuredOn.length===1&&n.warn(`BGP ${e.a}-${e.b}: configured on ${e.configuredOn[0]} only`);return{sessions:a,asn:i}}function ri(e,t){let n=[];for(let[r,i]of e){let e=i.segment_routing;for(let i of e?.policies??[]){let a=[...i.candidate_paths??[]].sort((e,t)=>(Gr(t.preference)??0)-(Gr(e.preference)??0)).find(e=>e.segment_lists?.length)?.segment_lists[0],o=a?e.segment_lists?.[a]:null;o?.length?n.push({name:i.name,headend:r,color:Gr(i.color),endpoint:i.endpoint,segmentList:{name:a,sids:o.map(Number)}}):t.warn(`${r}: SR policy ${i.name} has no explicit segment list in the facts; not drawn`)}}return n.length&&t.add(`mpls`,`facts`,`${n.length} SR policies`,`headend, color, endpoint and the segment list of the preferred candidate path`),n}function ii(e,t){let n=[];for(let[t,r]of e)for(let e of r.segment_routing?.srgb??[])n.push({name:t,base:Number(e.lower),size:Number(e.upper)-Number(e.lower)+1});if(!n.length)return null;let[r]=n;return n.some(e=>e.base!==r.base||e.size!==r.size)&&t.warn(`SRGB differs between devices; ${r.base}-${r.base+r.size-1} (${r.name}) is used for all`),t.add(`mpls`,`facts`,`SRGB`,`${r.base}-${r.base+r.size-1}; node SIDs are the loopbacks' prefix SID indexes`),{base:r.base,size:r.size}}function ai(e,t,n){let r=[...e].flatMap(([e,t])=>(t.tp_corouted_tunnels??[]).map(t=>({node:e,name:t.name,source:t.source,destination:t.destination,kind:/ingress/.test(t.type??``)?`ingress`:/egress/.test(t.type??``)?`egress`:`transit`,role:t.role??`primary`,primary:t.primary?.name??null,admin:t.admin_state===`disable`?`down`:`up`,fwdIn:Gr(t.forward_in_label),fwdOut:Gr(t.forward_out_label),revIn:Gr(t.reverse_in_label),revOut:Gr(t.reverse_out_label),nextHop:t.next_hop_ip??null,prevHop:t.prev_hop_ip??null,bfd:t.bfd?.enabled?{intervalMs:t.bfd.interval_ms??null}:null}))),i=new Set,a=[],o=(e,n)=>{let r=t.find(t=>t.a.node===e&&t.b.ip===n||t.b.node===e&&t.a.ip===n);return r?{link:r,near:r.a.node===e?r.a:r.b,far:r.a.node===e?r.b:r.a}:null};for(let e of r.filter(e=>e.kind===`ingress`)){let t=`${e.node} tunnel ${e.name}`,s=e=>({node:e.node,name:e.name,fwdIn:e.fwdIn,fwdOut:e.fwdOut,revIn:e.revIn,revOut:e.revOut}),c=[s(e)],l=[],u=[e],d=e,f=null;for(;d.kind!==`egress`&&!f;){let a=o(d.node,d.nextHop);if(!a){f=`${d.node}: next hop ${d.nextHop} is on none of its links`;break}let p=r.find(t=>t.node===a.far.node&&!i.has(t)&&!u.includes(t)&&t.kind!==`ingress`&&t.source===e.source&&t.destination===e.destination&&t.fwdIn===d.fwdOut);p?(p.prevHop&&p.prevHop!==a.near.ip&&n.warn(`${t}: ${p.node} prev hop ${p.prevHop} is not ${d.node}'s address ${a.near.ip} on ${a.link.id}`),u.push(p),l.push(a.link.id),c.push(s(p)),d=p,c.length>64&&(f=`loop`)):f=`${a.far.node}: no segment of ${e.source} -> ${e.destination} with forward in label ${d.fwdOut}`}if(f){n.warn(`${t}: ${f}; not drawn`);continue}for(let e of u)i.add(e);let p=e.bfd??d.bfd;a.push({id:a.some(t=>t.id===e.name)?`${e.node}:${e.name}`:e.name,name:e.name,src:e.node,dst:d.node,role:e.role,primaryName:e.primary,...e.admin===`down`?{admin:`down`}:{},hops:c,links:l,oam:p?{kind:`bfd`,...p.intervalMs?{intervalMs:p.intervalMs}:{}}:null})}for(let e of a){if(e.role===`backup`){let t=a.find(t=>t.role!==`backup`&&t.src===e.src&&t.name===e.primaryName);t?e.protects=t.id:n.warn(`${e.src} tunnel ${e.name}: backup of ${e.primaryName}, which is no tunnel here`)}delete e.primaryName}for(let e of r.filter(e=>!i.has(e)))n.warn(`${e.node}: tunnel segment ${e.name} (${e.kind}, ${e.source} -> ${e.destination}) is on no stitched tunnel`);if(r.length){let e=a.filter(e=>e.oam).length;n.add(`mpls-tp`,`facts`,`${a.length} co-routed tunnels`,`stitched from ${r.length} per-node segments: per-hop labels in both directions, next / previous hops`),a.length&&(n.add(`mpls-tp`,`facts`,`1:1 protection`,`${a.filter(e=>e.protects).length} backup tunnels`),n.add(`mpls-tp`,`facts`,`proactive OAM (LSP BFD)`,`${e} of ${a.length} tunnels; a tunnel without it only sees its own interfaces fail`),n.add(`mpls-tp`,`derived`,`tunnel numbers (RFC 6370)`,`ordinal per source node; Global_ID 0`),n.add(`mpls-tp`,`default`,`protection timers`,`switch in ${Nn.mplsTp.protectionSwitchMs} ms; reversion hold time not modeled`))}return a}function oi(e,t){let n=(e.l2vpn_services??[]).find(e=>e.name===t)?.fd??t,r=(e.fps??[]).find(e=>e.fd===n);return r?{port:r.logical_port??null,name:r.name}:{port:null,name:null}}function si(e,t,n){return e.find(e=>e.role!==`backup`&&(e.src===t&&e.hops[0].name===n||e.dst===t&&e.hops.at(-1).name===n))}function ci(e,t,n,r,i,a){let o={node:e,ac:oi(t,n.service)};if(n.tunnel_type===`sr-policy`)o.underlay=`sr-policy`,o.color=Gr(n.tunnel_color);else if(/corouted/.test(n.tunnel_type??``)&&n.tunnel){let t=si(i,e,n.tunnel);t||a.warn(`${e}: PW ${n.name} rides MPLS-TP tunnel ${n.tunnel}, which is not stitched`),o.underlay=`mpls-tp`,o.tunnel=t?.id??n.tunnel,o.rxLabel=Gr(n.in_label),o.txLabel=Gr(n.out_label)}else n.tunnel_type||n.tunnel?(a.warn(`${e}: PW ${n.name} rides ${n.tunnel_type??`tunnel ${n.tunnel}`}, which the view does not model; shown over the Prefix-SID`),o.underlay=`sr`):(o.underlay=t.segment_routing?.prefix_sids?.length?`sr`:`ldp`,a.add(`pw`,`derived`,`${e} PW ${n.name} to ${r}`,`no tunnel type configured: resolved over the peer's ${o.underlay===`sr`?`Prefix-SID (SR-MPLS)`:`LDP LSP`}`));return o}function li(e,t,n,r){let i=new Set,a=[];for(let[o,s]of e)(s.pseudowires??[]).forEach((c,l)=>{if(i.has(`${o}#${l}`))return;let u=t.get(c.peer),d=u?e.get(u):null,f=d?(d.pseudowires??[]).findIndex((e,n)=>!i.has(`${u}#${n}`)&&e.pw_id===c.pw_id&&t.get(e.peer)===o):-1;if(f<0){r.warn(`${o}: PW ${c.name} (id ${c.pw_id}) to ${c.peer}: ${u?`${u} has no PW ${c.pw_id} back`:`no device has that address`}; not drawn`);return}i.add(`${o}#${l}`).add(`${u}#${f}`);let p=d.pseudowires[f];p.service!==c.service&&r.warn(`PW ${c.pw_id} ${o}-${u}: service ${c.service} at ${o}, ${p.service} at ${u}`);let m=[ci(o,s,c,u,n,r),ci(u,d,p,o,n,r)];a.push({id:`${c.service??c.name} ${o}-${u}`,service:c.service??c.name,serviceType:c.service_type??p.service_type??null,pwid:Gr(c.pw_id),...m.every(e=>e.underlay===`mpls-tp`)?{static:!0}:{},ends:m})});a.length&&r.add(`pw`,`facts`,`${a.length} pseudowires`,`paired by PW id where each end names the other as peer; transport from tunnel type and color`);let o=a.filter(e=>e.static).length;return o&&r.add(`pw`,`facts`,`${o} static pseudowires on MPLS-TP`,`transmit / receive labels and the tunnel as configured`),a}function ui(e,t,n){let r=[...new Set(t.map(e=>e.ccm_interval).filter(e=>e!=null))];if(!r.length)return null;r.length>1&&n.warn(`CFM ${e}: CCM interval ${r.join(` and `)} on its two MEPs; the view uses ${r[0]}`);let i=kr(r[0]),a=Object.keys(Vt).find(e=>Math.abs(Vt[e]-i)<.01);return i===null||!a?(n.warn(`CFM ${e}: CCM interval "${r[0]}" is ${i===null?`not an interval the view knows`:`no 802.1Q CCM interval`}; shown at 1 s`),null):{ms:i,code:Number(a)}}function di(e,t,n){let r=new Map;for(let[t,n]of e)for(let e of n.cfm?.meps??[]){let n=`${e.md??``}/${e.ma}`;r.has(n)||r.set(n,[]),r.get(n).push({...e,node:t})}let i=[],a=[];for(let[e,o]of r){if(o.length!==2){n.warn(`CFM ${e}: ${o.length} MEP(s); only MEGs with two MEPs are drawn`);continue}let r=o.map(e=>e.node),s=t.find(e=>e.ends.every(e=>r.includes(e.node))&&o.every(t=>!t.service||t.service===e.service));if(!s){n.warn(`CFM ${e}: no pseudowire joins ${r.join(` and `)} on service ${o[0].service}; not drawn`);continue}let c=o.map(e=>Gr(e.level)).find(e=>e!==null)??null,l=ui(e,o,n);i.push({id:o[0].ma,md:o[0].md,pseudowire:s.id,...c===null?{}:{level:c},...l?{intervalCode:l.code}:{},meps:o.map(e=>({mepId:Gr(e.mep_id),node:e.node,if:e.interface??e.port??``}))}),c===null&&n.add(`cfm`,`default`,`MEG ${o[0].ma} level`,`no MD level in the facts: shown at the default service level 4 (MEF 30.1)`),l||a.push(o[0].ma)}return i.length&&(n.add(`cfm`,`facts`,`${i.length} service MEGs`,`Up MEPs of one MD / MA on two devices, watching the pseudowire between them`),n.add(`cfm`,a.length?`default`:`facts`,`CCM interval`,a.length?`${a.length===i.length?`the facts carry no CCM interval`:`no CCM interval in the facts for MEG ${a.join(`, `)}`}: shown at 1 s${a.length===i.length?``:` there`}`:`each MEG's as configured on its maintenance association (ccm_interval)`)),i}function fi(e,t){return t.type!==`sub`||e.ports.length!==2?e.ports:t.termination===`west`||t.termination===`east`?e.ports.filter(e=>e.name===t.termination):t.rpl.length===1?e.ports.filter(e=>e.name===t.rpl[0].port):e.ports}var pi=e=>e.ring_id!==null&&e.ring_id!==void 0&&e.ring_id!==``;function mi(e,t){let n=new Map;for(let[,t]of e)for(let e of jr(t))pi(e)&&n.set(e.name,new Set([...n.get(e.name)??[],String(e.ring_id)]));return(e,r)=>{if(pi(r))return{key:String(r.ring_id),ringId:String(r.ring_id),joinedBy:`id`};let i=n.get(r.name);return i?i.size===1?{key:[...i][0],ringId:[...i][0],joinedBy:`id`}:(t.warn(`${e}: ring ${r.name} has no ring id and ${r.name} is ring id ${[...i].join(` and `)} on other devices; it cannot be joined with either`),{key:`${e}:${r.name}`,ringId:null,joinedBy:`device`}):{key:`name:${r.name}`,ringId:null,joinedBy:`name`}}}function hi(e,t,n){let r=(e,n)=>t.find(t=>t.a.node===e&&t.a.port===n||t.b.node===e&&t.b.port===n)??null,i=mi(e,n),a=new Map,o=new Map;for(let[t,s]of e)for(let e of jr(s)){let s=e.instances[0]??null;e.instances.length>1&&n.warn(`${t}: ring ${e.name} has ${e.instances.length} protection instances; the view shows the first (${s.name})`);let{key:c,ringId:l,joinedBy:u}=i(t,e);o.set(`${t}|${e.name}`,c),a.has(c)||a.set(c,{id:c,ringId:l,joinedBy:u,name:e.name,type:s?.type??null,rapsVid:Gr(s?.raps_vid),level:Gr(s?.raps_level),virtualChannel:s?.virtual_channel??null,revertive:s?.revertive??null,wtrMin:Gr(s?.timers?.wtr),guardMs:Gr(s?.timers?.guard),holdOffMs:Gr(s?.timers?.hold_off),members:[],nodes:[],links:[],rpl:null,subRingOf:null,interconnect:[]});let d=a.get(c);if(d.name!==e.name&&n.warn(`ring id ${c}: named ${d.name} on ${d.nodes[0]?.node} and ${e.name} on ${t}`),d.joinedBy===`name`&&s&&d.nodes.length){let r=d.nodes[0].node;Gr(s.raps_vid)!==null&&d.rapsVid!==null&&Gr(s.raps_vid)!==d.rapsVid&&n.warn(`ring ${e.name} (joined by name, no ring id): R-APS VID ${d.rapsVid} on ${r} and ${s.raps_vid} on ${t}; the two may be different rings`),s.type&&d.type&&s.type!==d.type&&n.warn(`ring ${e.name} (joined by name, no ring id): a ${d.type} ring on ${r} and a ${s.type} ring on ${t}; the two may be different rings`)}for(let e of s?.members??[])d.members.includes(e)||d.members.push(e);let f=(s?fi(e,s):e.ports).map(i=>{let a=i.interface?r(t,i.interface):null;return a||n.warn(`${t}: ring ${e.name} port ${i.name} (${i.interface??`no interface`}) is on no link of the view (no addressed interface rides it and the file's links[] do not name it); the ring is drawn without it`),{name:i.name,if:i.interface??null,link:a?.id??null}}),p=e=>s?.rpl.find(t=>t.role===e)??null,m=p(`owner`),h=p(`neighbor`);d.nodes.push({node:t,ring:e.name,instance:s?.name??null,ports:f,rpl:m?`owner`:h?`neighbor`:null,rplPort:(m??h)?.port??null,terminates:!!(s&&s.type===`sub`&&f.length<e.ports.length),subRingOf:s?.sub_ring_of??null})}let s=[...a.values()];for(let e of s){let t=new Map;for(let n of e.nodes)for(let e of n.ports)e.link&&t.set(e.link,[...t.get(e.link)??[],n.node]);for(let[r,i]of t)i.length===2?e.links.push(r):n.warn(`ring ${e.name}: ${i[0]} has a ring port on ${r} but the far end does not; the link is not on the ring`);e.interconnect=e.nodes.filter(e=>e.terminates||e.subRingOf).map(e=>e.node);let r=e.nodes.map(e=>e.subRingOf&&o.get(`${e.node}|${e.subRingOf}`)).find(Boolean);r&&(e.subRingOf=r);let i=e.nodes.filter(e=>e.rpl===`owner`),a=e.nodes.filter(e=>e.rpl===`neighbor`);i.length>1&&n.warn(`ring ${e.name}: RPL owner on ${i.map(e=>e.node).join(` and `)}; the view uses ${i[0].node}`);let s=i[0]??null;if(s){let t=s.ports.find(e=>e.name===s.rplPort)?.link??null;if(!t||!e.links.includes(t))n.warn(`ring ${e.name}: the RPL owner's port ${s.rplPort} on ${s.node} is on no link of the ring; no RPL drawn`);else{let r=a.find(e=>e.ports.some(n=>n.name===e.rplPort&&n.link===t))??null;a.length&&!r&&n.warn(`ring ${e.name}: RPL neighbour ${a.map(e=>e.node).join(`, `)} is not at the other end of the RPL ${t}`),e.rpl={link:t,owner:s.node,neighbor:r?.node??null}}}else n.warn(`ring ${e.name}: no RPL owner configured; the view cannot say which port blocks`);e.path=gi(e)}if(s.length){let e=s.filter(e=>e.type===`major`).length;n.add(`ring`,`facts`,`${s.length} G.8032 rings`,`${e} major, ${s.length-e} sub-ring; ring ports, R-APS VID and level, RPL owner / neighbour, protected forwarding domains and timers as configured`),n.add(`ring`,`derived`,`ring links`,`a link whose two ends are ring ports of the same ring on their devices (an addressed link, or one of the links[] in the file); a ring port on neither cannot be placed`);let t=s.filter(e=>e.joinedBy===`name`);t.length&&n.add(`ring`,`derived`,`rings joined by name`,`${t.map(e=>e.name).join(`, `)}: no device configures a ring id (a SAOS 10 CLI config leaves ring-id out; the YANG default is 1), so the devices' rings of that name are one ring and its R-APS group MAC uses ring id 1`),s.filter(e=>e.type===`sub`).length&&n.add(`ring`,`derived`,`interconnection nodes`,`a node where a sub-ring instance names one port (SAOS 10) or terminates on a port (SAOS 6 / 8); the sub-ring is attached to the ring that shares its other port`);let r=s.filter(e=>e.wtrMin===null||e.guardMs===null||e.holdOffMs===null||e.revertive===null);r.length&&n.add(`ring`,`default`,`protection timers`,`WTR ${Nn.g8032.wtrMin} min, guard ${Nn.g8032.guardMs} ms, hold-off ${Nn.g8032.holdOffMs} ms, revertive (G.8032 defaults) where ${r.length===s.length?`a ring`:r.map(e=>e.name).join(`, `)} does not configure them`)}return s}function gi(e){let t=new Map,n=e=>e.split(` `)[0].split(`-`),r=e.links.map(t=>{let r=e.nodes.filter(e=>e.ports.some(e=>e.link===t)).map(e=>e.node);return{id:t,a:r[0]??n(t)[0],b:r[1]??n(t)[1]}});for(let e of r)t.set(e.a,[...t.get(e.a)??[],{node:e.b,link:e.id}]),t.set(e.b,[...t.get(e.b)??[],{node:e.a,link:e.id}]);let i=[...t.keys()].find(e=>t.get(e).length===1)??e.rpl?.owner??[...t.keys()][0];if(!i)return{nodes:e.nodes.map(e=>e.node),links:[],closed:!1};let a=[i],o=new Set,s=i;for(;;){let e=(t.get(s)??[]).find(e=>!o.has(e.link));if(!e)break;if(o.add(e.link),e.node===i)return{nodes:a,links:[...o],closed:!0};a.push(e.node),s=e.node}return{nodes:a,links:[...o],closed:!1}}function _i(e,t){return e.map(e=>({id:e.id,name:e.service,type:e.serviceType??`vpws`,pseudowire:e.id,meg:t.find(t=>t.pseudowire===e.id)?.id??null,ends:e.ends.map(e=>({node:e.node,port:e.ac.port,fp:e.ac.name}))}))}function vi(e,t,n,r){let i=e.map(e=>e.id);if(n){let{pos:e,missing:t}=Ir(i,n);if(!t.length)return r.add(`physical`,`authored`,`positions`,`from the positions file`),e;r.warn(`positions: no position for ${t.join(`, `)}; the layout is computed instead`)}return r.add(`physical`,`derived`,`positions`,`the facts carry no layout: a force-directed layout of the links`),Fr(i,t.map(e=>[e.a.node,e.b.node]))}function yi(e,{name:t,positions:n}={}){let r=vr(e),i=yr(r),a=new Kr;if(!i.size)throw Error(`no device in this facts file has facts (status ok or partial)`);for(let e of r.devices)i.has(e.device)||a.warn(`${e.device}: ${e.status}${e.reason?` (${e.reason})`:``}; not shown`);let o=Jr(i,a),s=[...new Set([...i.values()].map(e=>Wr(e.isis?.instances?.[0]?.level)).filter(Boolean))],c=Xr(i,o,a),l=$r(i,c,o,s[0]??2,a);ei(r,l,c,a);let u=ti(i),d=ni(i,u,a),f=ii(i,a),p=ri(i,a),m=ai(i,l,a),h=li(i,u,m,a),g=di(i,h,a),_=hi(i,l,a),v=new Set([...d.sessions.flatMap(e=>[e.a,e.b]),...h.flatMap(e=>e.ends.map(e=>e.node))]);for(let e of l)if(e.kind===`access`)for(let t of[e.a,e.b])v.add(t.node);for(let e of c)e.role!==`ce`&&v.has(e.id)&&(e.role=`pe`);a.add(`physical`,`derived`,`roles`,`CE: no ${o===`ospf`?`OSPF`:`IS-IS`} and no MPLS-TP tunnel; PE: a router that speaks BGP, ends a pseudowire or faces a CE; P: the other routers`);let y=c.filter(e=>e.role!==`ce`);if(o===`isis`){s.length>1&&a.warn(`IS-IS levels ${s.join(` and `)} mixed; the view runs one level (${s[0]})`);let e=[...new Set([...i.values()].map(e=>e.isis?.instances?.[0]).filter(Boolean).map(Er).filter(Boolean))];y.length&&a.add(`isis`,`facts`,`IS-IS`,`level ${s[0]??2}, area ${e.join(`, `)||`?`}; system ids from the NETs`)}else{let e=[...new Set([...i.values()].flatMap(e=>qr(e).instances.map(e=>e.name)))],t=y.filter(e=>!e.routerId).map(e=>e.id);a.add(`ospf`,`facts`,`OSPF`,`instance ${e.join(`, `)} on ${y.length-t.length===y.length?`every router`:`${y.length-t.length} of ${y.length} routers`}; the IGP of this view`),a.add(`ospf`,t.length?`default`:`facts`,`router ids`,t.length?`${t.join(`, `)}: no router id configured, the loopback is used`:`ospf instance router-id`)}let b=vi(c,l,n,a);for(let e of c)e.pos=b[e.id];let x=r.devices.find(e=>e.recipe)?.recipe,S=h.some(e=>e.ends.some(e=>e.underlay===`ldp`)),C=f?`sr`:m.length&&!S?`none`:`ldp`,w={name:t??x??`facts import`,asn:d.asn??65e3,igp:o,...o===`ospf`?{ospf:{area:Tt}}:{isis:{level:s[0]??2}},...f?{srgb:f}:{},nodes:c,links:l,vrfs:[],bgp:{sessions:d.sessions},srPolicies:p,tpTunnels:m,pseudowires:h,cfm:{linkMegs:!1,megs:g},rings:_};return{topology:w,file:r,devices:i,services:_i(h,g),labelMode:C,report:{topology:w,gaps:a.gaps,warnings:a.warnings}}}function bi(e){let t=new URLSearchParams(e),n=e=>t.get(e)?.trim()||null;return{facts:n(`facts`),positions:n(`positions`),labs:n(`labs`),lab:n(`lab`)}}var xi=(e,t)=>new URL(e,t).href;async function Si(e,t){let n=await e(t);if(!n.ok)throw Error(`${t}: HTTP ${n.status}`);return n.text()}async function Ci(e,t){let n=await Si(e,t);try{return JSON.parse(n)}catch(e){throw Error(`${t}: not JSON (${e.message})`)}}async function wi(e,t,{optional:n=!1}={}){let r;if(n){let n=await e(t);if(!n.ok)return null;try{r=JSON.parse(await n.text())}catch{return null}}else r=await Ci(e,t);let i=Array.isArray(r)?r:r?.labs;if(!Array.isArray(i)||!i.length)throw Error(`${t}: expected { "labs": [{ "id", "title", "facts" }, ...] }`);let a=i.map((e,n)=>{if(!e?.id||!e.facts)throw Error(`${t}: lab ${n+1} needs an id and a facts URL`);return{id:String(e.id),title:e.title??String(e.id),facts:xi(e.facts,t),...e.positions?{positions:xi(e.positions,t)}:{}}}),o=new Set(a.map(e=>e.id));if(o.size!==a.length)throw Error(`${t}: lab ids are not unique`);let s=i.find(e=>e.default===!0)?.id??(Array.isArray(r)?null:r.default);return{url:t,labs:a,defaultId:s&&o.has(String(s))?String(s):a[0].id}}async function Ti(e,t){let[n,r]=await Promise.all([Si(e,t.facts),t.positions?Ci(e,t.positions):null]);return{...t,factsText:n,positions:r}}async function Ei(e,{base:t,fetch:n}){if(e.facts)return{index:null,lab:await Ti(n,{id:null,title:null,facts:xi(e.facts,t),...e.positions?{positions:xi(e.positions,t)}:{}})};let r=!e.labs&&!e.lab,i=await wi(n,xi(e.labs??`labs/index.json`,t),{optional:r});if(!i)return null;let a=e.lab??i.defaultId,o=i.labs.find(e=>e.id===a);if(!o)throw Error(`no lab "${a}" in ${i.url}`);return{index:i,lab:await Ti(n,o)}}var Di={LEFT:0,MIDDLE:1,RIGHT:2,ROTATE:0,DOLLY:1,PAN:2},Oi={ROTATE:0,PAN:1,DOLLY_PAN:2,DOLLY_ROTATE:3},ki=1e3,Ai=1001,ji=1002,Mi=1003,Ni=1004,Pi=1005,Fi=1006,Ii=1007,Li=1008,Ri=1009,zi=1010,Bi=1011,Vi=1012,Hi=1013,Ui=1014,Wi=1015,Gi=1016,Ki=1017,qi=1018,Ji=1020,Yi=35902,Xi=1021,Zi=1022,Qi=1023,$i=1024,ea=1025,ta=1026,na=1027,ra=1028,ia=1029,aa=1030,oa=1031,sa=1033,ca=33776,la=33777,ua=33778,da=33779,fa=35840,pa=35841,ma=35842,ha=35843,ga=36196,_a=37492,va=37496,ya=37808,ba=37809,xa=37810,Sa=37811,Ca=37812,wa=37813,Ta=37814,Ea=37815,Da=37816,Oa=37817,ka=37818,Aa=37819,ja=37820,Ma=37821,Na=36492,Pa=36494,Fa=36495,Ia=36283,La=36284,Ra=36285,za=36286,Ba=2300,Va=2301,Ha=2302,Ua=2400,Wa=2401,Ga=2402,Ka=3200,qa=3201,Ja=`srgb`,Ya=`srgb-linear`,Xa=`display-p3`,Za=`display-p3-linear`,Qa=`linear`,$a=`srgb`,eo=`rec709`,to=7680,no=35044,ro=2e3,io=class{addEventListener(e,t){this._listeners===void 0&&(this._listeners={});let n=this._listeners;n[e]===void 0&&(n[e]=[]),n[e].indexOf(t)===-1&&n[e].push(t)}hasEventListener(e,t){if(this._listeners===void 0)return!1;let n=this._listeners;return n[e]!==void 0&&n[e].indexOf(t)!==-1}removeEventListener(e,t){if(this._listeners===void 0)return;let n=this._listeners[e];if(n!==void 0){let e=n.indexOf(t);e!==-1&&n.splice(e,1)}}dispatchEvent(e){if(this._listeners===void 0)return;let t=this._listeners[e.type];if(t!==void 0){e.target=this;let n=t.slice(0);for(let t=0,r=n.length;t<r;t++)n[t].call(this,e);e.target=null}}},ao=`00.01.02.03.04.05.06.07.08.09.0a.0b.0c.0d.0e.0f.10.11.12.13.14.15.16.17.18.19.1a.1b.1c.1d.1e.1f.20.21.22.23.24.25.26.27.28.29.2a.2b.2c.2d.2e.2f.30.31.32.33.34.35.36.37.38.39.3a.3b.3c.3d.3e.3f.40.41.42.43.44.45.46.47.48.49.4a.4b.4c.4d.4e.4f.50.51.52.53.54.55.56.57.58.59.5a.5b.5c.5d.5e.5f.60.61.62.63.64.65.66.67.68.69.6a.6b.6c.6d.6e.6f.70.71.72.73.74.75.76.77.78.79.7a.7b.7c.7d.7e.7f.80.81.82.83.84.85.86.87.88.89.8a.8b.8c.8d.8e.8f.90.91.92.93.94.95.96.97.98.99.9a.9b.9c.9d.9e.9f.a0.a1.a2.a3.a4.a5.a6.a7.a8.a9.aa.ab.ac.ad.ae.af.b0.b1.b2.b3.b4.b5.b6.b7.b8.b9.ba.bb.bc.bd.be.bf.c0.c1.c2.c3.c4.c5.c6.c7.c8.c9.ca.cb.cc.cd.ce.cf.d0.d1.d2.d3.d4.d5.d6.d7.d8.d9.da.db.dc.dd.de.df.e0.e1.e2.e3.e4.e5.e6.e7.e8.e9.ea.eb.ec.ed.ee.ef.f0.f1.f2.f3.f4.f5.f6.f7.f8.f9.fa.fb.fc.fd.fe.ff`.split(`.`),oo=1234567,so=Math.PI/180,co=180/Math.PI;function lo(){let e=Math.random()*4294967295|0,t=Math.random()*4294967295|0,n=Math.random()*4294967295|0,r=Math.random()*4294967295|0;return(ao[e&255]+ao[e>>8&255]+ao[e>>16&255]+ao[e>>24&255]+`-`+ao[t&255]+ao[t>>8&255]+`-`+ao[t>>16&15|64]+ao[t>>24&255]+`-`+ao[n&63|128]+ao[n>>8&255]+`-`+ao[n>>16&255]+ao[n>>24&255]+ao[r&255]+ao[r>>8&255]+ao[r>>16&255]+ao[r>>24&255]).toLowerCase()}function uo(e,t,n){return Math.max(t,Math.min(n,e))}function fo(e,t){return(e%t+t)%t}function po(e,t,n,r,i){return r+(e-t)*(i-r)/(n-t)}function mo(e,t,n){return e===t?0:(n-e)/(t-e)}function ho(e,t,n){return(1-n)*e+n*t}function go(e,t,n,r){return ho(e,t,1-Math.exp(-n*r))}function _o(e,t=1){return t-Math.abs(fo(e,t*2)-t)}function vo(e,t,n){return e<=t?0:e>=n?1:(e=(e-t)/(n-t),e*e*(3-2*e))}function yo(e,t,n){return e<=t?0:e>=n?1:(e=(e-t)/(n-t),e*e*e*(e*(e*6-15)+10))}function bo(e,t){return e+Math.floor(Math.random()*(t-e+1))}function xo(e,t){return e+Math.random()*(t-e)}function So(e){return e*(.5-Math.random())}function Co(e){e!==void 0&&(oo=e);let t=oo+=1831565813;return t=Math.imul(t^t>>>15,t|1),t^=t+Math.imul(t^t>>>7,t|61),((t^t>>>14)>>>0)/4294967296}function wo(e){return e*so}function To(e){return e*co}function Eo(e){return!(e&e-1)&&e!==0}function Do(e){return 2**Math.ceil(Math.log(e)/Math.LN2)}function Oo(e){return 2**Math.floor(Math.log(e)/Math.LN2)}function ko(e,t,n,r,i){let a=Math.cos,o=Math.sin,s=a(n/2),c=o(n/2),l=a((t+r)/2),u=o((t+r)/2),d=a((t-r)/2),f=o((t-r)/2),p=a((r-t)/2),m=o((r-t)/2);switch(i){case`XYX`:e.set(s*u,c*d,c*f,s*l);break;case`YZY`:e.set(c*f,s*u,c*d,s*l);break;case`ZXZ`:e.set(c*d,c*f,s*u,s*l);break;case`XZX`:e.set(s*u,c*m,c*p,s*l);break;case`YXY`:e.set(c*p,s*u,c*m,s*l);break;case`ZYZ`:e.set(c*m,c*p,s*u,s*l);break;default:console.warn(`THREE.MathUtils: .setQuaternionFromProperEuler() encountered an unknown order: `+i)}}function Ao(e,t){switch(t.constructor){case Float32Array:return e;case Uint32Array:return e/4294967295;case Uint16Array:return e/65535;case Uint8Array:return e/255;case Int32Array:return Math.max(e/2147483647,-1);case Int16Array:return Math.max(e/32767,-1);case Int8Array:return Math.max(e/127,-1);default:throw Error(`Invalid component type.`)}}function jo(e,t){switch(t.constructor){case Float32Array:return e;case Uint32Array:return Math.round(e*4294967295);case Uint16Array:return Math.round(e*65535);case Uint8Array:return Math.round(e*255);case Int32Array:return Math.round(e*2147483647);case Int16Array:return Math.round(e*32767);case Int8Array:return Math.round(e*127);default:throw Error(`Invalid component type.`)}}var Mo={DEG2RAD:so,RAD2DEG:co,generateUUID:lo,clamp:uo,euclideanModulo:fo,mapLinear:po,inverseLerp:mo,lerp:ho,damp:go,pingpong:_o,smoothstep:vo,smootherstep:yo,randInt:bo,randFloat:xo,randFloatSpread:So,seededRandom:Co,degToRad:wo,radToDeg:To,isPowerOfTwo:Eo,ceilPowerOfTwo:Do,floorPowerOfTwo:Oo,setQuaternionFromProperEuler:ko,normalize:jo,denormalize:Ao},H=class e{constructor(t=0,n=0){e.prototype.isVector2=!0,this.x=t,this.y=n}get width(){return this.x}set width(e){this.x=e}get height(){return this.y}set height(e){this.y=e}set(e,t){return this.x=e,this.y=t,this}setScalar(e){return this.x=e,this.y=e,this}setX(e){return this.x=e,this}setY(e){return this.y=e,this}setComponent(e,t){switch(e){case 0:this.x=t;break;case 1:this.y=t;break;default:throw Error(`index is out of range: `+e)}return this}getComponent(e){switch(e){case 0:return this.x;case 1:return this.y;default:throw Error(`index is out of range: `+e)}}clone(){return new this.constructor(this.x,this.y)}copy(e){return this.x=e.x,this.y=e.y,this}add(e){return this.x+=e.x,this.y+=e.y,this}addScalar(e){return this.x+=e,this.y+=e,this}addVectors(e,t){return this.x=e.x+t.x,this.y=e.y+t.y,this}addScaledVector(e,t){return this.x+=e.x*t,this.y+=e.y*t,this}sub(e){return this.x-=e.x,this.y-=e.y,this}subScalar(e){return this.x-=e,this.y-=e,this}subVectors(e,t){return this.x=e.x-t.x,this.y=e.y-t.y,this}multiply(e){return this.x*=e.x,this.y*=e.y,this}multiplyScalar(e){return this.x*=e,this.y*=e,this}divide(e){return this.x/=e.x,this.y/=e.y,this}divideScalar(e){return this.multiplyScalar(1/e)}applyMatrix3(e){let t=this.x,n=this.y,r=e.elements;return this.x=r[0]*t+r[3]*n+r[6],this.y=r[1]*t+r[4]*n+r[7],this}min(e){return this.x=Math.min(this.x,e.x),this.y=Math.min(this.y,e.y),this}max(e){return this.x=Math.max(this.x,e.x),this.y=Math.max(this.y,e.y),this}clamp(e,t){return this.x=Math.max(e.x,Math.min(t.x,this.x)),this.y=Math.max(e.y,Math.min(t.y,this.y)),this}clampScalar(e,t){return this.x=Math.max(e,Math.min(t,this.x)),this.y=Math.max(e,Math.min(t,this.y)),this}clampLength(e,t){let n=this.length();return this.divideScalar(n||1).multiplyScalar(Math.max(e,Math.min(t,n)))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this}negate(){return this.x=-this.x,this.y=-this.y,this}dot(e){return this.x*e.x+this.y*e.y}cross(e){return this.x*e.y-this.y*e.x}lengthSq(){return this.x*this.x+this.y*this.y}length(){return Math.sqrt(this.x*this.x+this.y*this.y)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)}normalize(){return this.divideScalar(this.length()||1)}angle(){return Math.atan2(-this.y,-this.x)+Math.PI}angleTo(e){let t=Math.sqrt(this.lengthSq()*e.lengthSq());if(t===0)return Math.PI/2;let n=this.dot(e)/t;return Math.acos(uo(n,-1,1))}distanceTo(e){return Math.sqrt(this.distanceToSquared(e))}distanceToSquared(e){let t=this.x-e.x,n=this.y-e.y;return t*t+n*n}manhattanDistanceTo(e){return Math.abs(this.x-e.x)+Math.abs(this.y-e.y)}setLength(e){return this.normalize().multiplyScalar(e)}lerp(e,t){return this.x+=(e.x-this.x)*t,this.y+=(e.y-this.y)*t,this}lerpVectors(e,t,n){return this.x=e.x+(t.x-e.x)*n,this.y=e.y+(t.y-e.y)*n,this}equals(e){return e.x===this.x&&e.y===this.y}fromArray(e,t=0){return this.x=e[t],this.y=e[t+1],this}toArray(e=[],t=0){return e[t]=this.x,e[t+1]=this.y,e}fromBufferAttribute(e,t){return this.x=e.getX(t),this.y=e.getY(t),this}rotateAround(e,t){let n=Math.cos(t),r=Math.sin(t),i=this.x-e.x,a=this.y-e.y;return this.x=i*n-a*r+e.x,this.y=i*r+a*n+e.y,this}random(){return this.x=Math.random(),this.y=Math.random(),this}*[Symbol.iterator](){yield this.x,yield this.y}},U=class e{constructor(t,n,r,i,a,o,s,c,l){e.prototype.isMatrix3=!0,this.elements=[1,0,0,0,1,0,0,0,1],t!==void 0&&this.set(t,n,r,i,a,o,s,c,l)}set(e,t,n,r,i,a,o,s,c){let l=this.elements;return l[0]=e,l[1]=r,l[2]=o,l[3]=t,l[4]=i,l[5]=s,l[6]=n,l[7]=a,l[8]=c,this}identity(){return this.set(1,0,0,0,1,0,0,0,1),this}copy(e){let t=this.elements,n=e.elements;return t[0]=n[0],t[1]=n[1],t[2]=n[2],t[3]=n[3],t[4]=n[4],t[5]=n[5],t[6]=n[6],t[7]=n[7],t[8]=n[8],this}extractBasis(e,t,n){return e.setFromMatrix3Column(this,0),t.setFromMatrix3Column(this,1),n.setFromMatrix3Column(this,2),this}setFromMatrix4(e){let t=e.elements;return this.set(t[0],t[4],t[8],t[1],t[5],t[9],t[2],t[6],t[10]),this}multiply(e){return this.multiplyMatrices(this,e)}premultiply(e){return this.multiplyMatrices(e,this)}multiplyMatrices(e,t){let n=e.elements,r=t.elements,i=this.elements,a=n[0],o=n[3],s=n[6],c=n[1],l=n[4],u=n[7],d=n[2],f=n[5],p=n[8],m=r[0],h=r[3],g=r[6],_=r[1],v=r[4],y=r[7],b=r[2],x=r[5],S=r[8];return i[0]=a*m+o*_+s*b,i[3]=a*h+o*v+s*x,i[6]=a*g+o*y+s*S,i[1]=c*m+l*_+u*b,i[4]=c*h+l*v+u*x,i[7]=c*g+l*y+u*S,i[2]=d*m+f*_+p*b,i[5]=d*h+f*v+p*x,i[8]=d*g+f*y+p*S,this}multiplyScalar(e){let t=this.elements;return t[0]*=e,t[3]*=e,t[6]*=e,t[1]*=e,t[4]*=e,t[7]*=e,t[2]*=e,t[5]*=e,t[8]*=e,this}determinant(){let e=this.elements,t=e[0],n=e[1],r=e[2],i=e[3],a=e[4],o=e[5],s=e[6],c=e[7],l=e[8];return t*a*l-t*o*c-n*i*l+n*o*s+r*i*c-r*a*s}invert(){let e=this.elements,t=e[0],n=e[1],r=e[2],i=e[3],a=e[4],o=e[5],s=e[6],c=e[7],l=e[8],u=l*a-o*c,d=o*s-l*i,f=c*i-a*s,p=t*u+n*d+r*f;if(p===0)return this.set(0,0,0,0,0,0,0,0,0);let m=1/p;return e[0]=u*m,e[1]=(r*c-l*n)*m,e[2]=(o*n-r*a)*m,e[3]=d*m,e[4]=(l*t-r*s)*m,e[5]=(r*i-o*t)*m,e[6]=f*m,e[7]=(n*s-c*t)*m,e[8]=(a*t-n*i)*m,this}transpose(){let e,t=this.elements;return e=t[1],t[1]=t[3],t[3]=e,e=t[2],t[2]=t[6],t[6]=e,e=t[5],t[5]=t[7],t[7]=e,this}getNormalMatrix(e){return this.setFromMatrix4(e).invert().transpose()}transposeIntoArray(e){let t=this.elements;return e[0]=t[0],e[1]=t[3],e[2]=t[6],e[3]=t[1],e[4]=t[4],e[5]=t[7],e[6]=t[2],e[7]=t[5],e[8]=t[8],this}setUvTransform(e,t,n,r,i,a,o){let s=Math.cos(i),c=Math.sin(i);return this.set(n*s,n*c,-n*(s*a+c*o)+a+e,-r*c,r*s,-r*(-c*a+s*o)+o+t,0,0,1),this}scale(e,t){return this.premultiply(No.makeScale(e,t)),this}rotate(e){return this.premultiply(No.makeRotation(-e)),this}translate(e,t){return this.premultiply(No.makeTranslation(e,t)),this}makeTranslation(e,t){return e.isVector2?this.set(1,0,e.x,0,1,e.y,0,0,1):this.set(1,0,e,0,1,t,0,0,1),this}makeRotation(e){let t=Math.cos(e),n=Math.sin(e);return this.set(t,-n,0,n,t,0,0,0,1),this}makeScale(e,t){return this.set(e,0,0,0,t,0,0,0,1),this}equals(e){let t=this.elements,n=e.elements;for(let e=0;e<9;e++)if(t[e]!==n[e])return!1;return!0}fromArray(e,t=0){for(let n=0;n<9;n++)this.elements[n]=e[n+t];return this}toArray(e=[],t=0){let n=this.elements;return e[t]=n[0],e[t+1]=n[1],e[t+2]=n[2],e[t+3]=n[3],e[t+4]=n[4],e[t+5]=n[5],e[t+6]=n[6],e[t+7]=n[7],e[t+8]=n[8],e}clone(){return new this.constructor().fromArray(this.elements)}},No=new U;function Po(e){for(let t=e.length-1;t>=0;--t)if(e[t]>=65535)return!0;return!1}function Fo(e){return document.createElementNS(`http://www.w3.org/1999/xhtml`,e)}function Io(){let e=Fo(`canvas`);return e.style.display=`block`,e}var Lo={};function Ro(e){e in Lo||(Lo[e]=!0,console.warn(e))}function zo(e,t,n){return new Promise(function(r,i){function a(){switch(e.clientWaitSync(t,e.SYNC_FLUSH_COMMANDS_BIT,0)){case e.WAIT_FAILED:i();break;case e.TIMEOUT_EXPIRED:setTimeout(a,n);break;default:r()}}setTimeout(a,n)})}function Bo(e){let t=e.elements;t[2]=.5*t[2]+.5*t[3],t[6]=.5*t[6]+.5*t[7],t[10]=.5*t[10]+.5*t[11],t[14]=.5*t[14]+.5*t[15]}function Vo(e){let t=e.elements;t[11]===-1?(t[10]=-t[10]-1,t[14]=-t[14]):(t[10]=-t[10],t[14]=-t[14]+1)}var Ho=new U().set(.8224621,.177538,0,.0331941,.9668058,0,.0170827,.0723974,.9105199),Uo=new U().set(1.2249401,-.2249404,0,-.0420569,1.0420571,0,-.0196376,-.0786361,1.0982735),Wo={[Ya]:{transfer:Qa,primaries:eo,luminanceCoefficients:[.2126,.7152,.0722],toReference:e=>e,fromReference:e=>e},[Ja]:{transfer:$a,primaries:eo,luminanceCoefficients:[.2126,.7152,.0722],toReference:e=>e.convertSRGBToLinear(),fromReference:e=>e.convertLinearToSRGB()},[Za]:{transfer:Qa,primaries:`p3`,luminanceCoefficients:[.2289,.6917,.0793],toReference:e=>e.applyMatrix3(Uo),fromReference:e=>e.applyMatrix3(Ho)},[Xa]:{transfer:$a,primaries:`p3`,luminanceCoefficients:[.2289,.6917,.0793],toReference:e=>e.convertSRGBToLinear().applyMatrix3(Uo),fromReference:e=>e.applyMatrix3(Ho).convertLinearToSRGB()}},Go=new Set([Ya,Za]),W={enabled:!0,_workingColorSpace:Ya,get workingColorSpace(){return this._workingColorSpace},set workingColorSpace(e){if(!Go.has(e))throw Error(`Unsupported working color space, "${e}".`);this._workingColorSpace=e},convert:function(e,t,n){if(this.enabled===!1||t===n||!t||!n)return e;let r=Wo[t].toReference,i=Wo[n].fromReference;return i(r(e))},fromWorkingColorSpace:function(e,t){return this.convert(e,this._workingColorSpace,t)},toWorkingColorSpace:function(e,t){return this.convert(e,t,this._workingColorSpace)},getPrimaries:function(e){return Wo[e].primaries},getTransfer:function(e){return e===``?Qa:Wo[e].transfer},getLuminanceCoefficients:function(e,t=this._workingColorSpace){return e.fromArray(Wo[t].luminanceCoefficients)}};function Ko(e){return e<.04045?e*.0773993808:(e*.9478672986+.0521327014)**2.4}function qo(e){return e<.0031308?e*12.92:1.055*e**.41666-.055}var Jo,Yo=class{static getDataURL(e){if(/^data:/i.test(e.src)||typeof HTMLCanvasElement>`u`)return e.src;let t;if(e instanceof HTMLCanvasElement)t=e;else{Jo===void 0&&(Jo=Fo(`canvas`)),Jo.width=e.width,Jo.height=e.height;let n=Jo.getContext(`2d`);e instanceof ImageData?n.putImageData(e,0,0):n.drawImage(e,0,0,e.width,e.height),t=Jo}return t.width>2048||t.height>2048?(console.warn(`THREE.ImageUtils.getDataURL: Image converted to jpg for performance reasons`,e),t.toDataURL(`image/jpeg`,.6)):t.toDataURL(`image/png`)}static sRGBToLinear(e){if(typeof HTMLImageElement<`u`&&e instanceof HTMLImageElement||typeof HTMLCanvasElement<`u`&&e instanceof HTMLCanvasElement||typeof ImageBitmap<`u`&&e instanceof ImageBitmap){let t=Fo(`canvas`);t.width=e.width,t.height=e.height;let n=t.getContext(`2d`);n.drawImage(e,0,0,e.width,e.height);let r=n.getImageData(0,0,e.width,e.height),i=r.data;for(let e=0;e<i.length;e++)i[e]=Ko(i[e]/255)*255;return n.putImageData(r,0,0),t}if(e.data){let t=e.data.slice(0);for(let e=0;e<t.length;e++)t instanceof Uint8Array||t instanceof Uint8ClampedArray?t[e]=Math.floor(Ko(t[e]/255)*255):t[e]=Ko(t[e]);return{data:t,width:e.width,height:e.height}}return console.warn(`THREE.ImageUtils.sRGBToLinear(): Unsupported image type. No color space conversion applied.`),e}},Xo=0,Zo=class{constructor(e=null){this.isSource=!0,Object.defineProperty(this,"id",{value:Xo++}),this.uuid=lo(),this.data=e,this.dataReady=!0,this.version=0}set needsUpdate(e){e===!0&&this.version++}toJSON(e){let t=e===void 0||typeof e==`string`;if(!t&&e.images[this.uuid]!==void 0)return e.images[this.uuid];let n={uuid:this.uuid,url:``},r=this.data;if(r!==null){let e;if(Array.isArray(r)){e=[];for(let t=0,n=r.length;t<n;t++)r[t].isDataTexture?e.push(Qo(r[t].image)):e.push(Qo(r[t]))}else e=Qo(r);n.url=e}return t||(e.images[this.uuid]=n),n}};function Qo(e){return typeof HTMLImageElement<`u`&&e instanceof HTMLImageElement||typeof HTMLCanvasElement<`u`&&e instanceof HTMLCanvasElement||typeof ImageBitmap<`u`&&e instanceof ImageBitmap?Yo.getDataURL(e):e.data?{data:Array.from(e.data),width:e.width,height:e.height,type:e.data.constructor.name}:(console.warn(`THREE.Texture: Unable to serialize Texture.`),{})}var $o=0,es=class e extends io{constructor(t=e.DEFAULT_IMAGE,n=e.DEFAULT_MAPPING,r=Ai,i=Ai,a=Fi,o=Li,s=Qi,c=Ri,l=e.DEFAULT_ANISOTROPY,u=``){super(),this.isTexture=!0,Object.defineProperty(this,"id",{value:$o++}),this.uuid=lo(),this.name=``,this.source=new Zo(t),this.mipmaps=[],this.mapping=n,this.channel=0,this.wrapS=r,this.wrapT=i,this.magFilter=a,this.minFilter=o,this.anisotropy=l,this.format=s,this.internalFormat=null,this.type=c,this.offset=new H(0,0),this.repeat=new H(1,1),this.center=new H(0,0),this.rotation=0,this.matrixAutoUpdate=!0,this.matrix=new U,this.generateMipmaps=!0,this.premultiplyAlpha=!1,this.flipY=!0,this.unpackAlignment=4,this.colorSpace=u,this.userData={},this.version=0,this.onUpdate=null,this.isRenderTargetTexture=!1,this.pmremVersion=0}get image(){return this.source.data}set image(e=null){this.source.data=e}updateMatrix(){this.matrix.setUvTransform(this.offset.x,this.offset.y,this.repeat.x,this.repeat.y,this.rotation,this.center.x,this.center.y)}clone(){return new this.constructor().copy(this)}copy(e){return this.name=e.name,this.source=e.source,this.mipmaps=e.mipmaps.slice(0),this.mapping=e.mapping,this.channel=e.channel,this.wrapS=e.wrapS,this.wrapT=e.wrapT,this.magFilter=e.magFilter,this.minFilter=e.minFilter,this.anisotropy=e.anisotropy,this.format=e.format,this.internalFormat=e.internalFormat,this.type=e.type,this.offset.copy(e.offset),this.repeat.copy(e.repeat),this.center.copy(e.center),this.rotation=e.rotation,this.matrixAutoUpdate=e.matrixAutoUpdate,this.matrix.copy(e.matrix),this.generateMipmaps=e.generateMipmaps,this.premultiplyAlpha=e.premultiplyAlpha,this.flipY=e.flipY,this.unpackAlignment=e.unpackAlignment,this.colorSpace=e.colorSpace,this.userData=JSON.parse(JSON.stringify(e.userData)),this.needsUpdate=!0,this}toJSON(e){let t=e===void 0||typeof e==`string`;if(!t&&e.textures[this.uuid]!==void 0)return e.textures[this.uuid];let n={metadata:{version:4.6,type:`Texture`,generator:`Texture.toJSON`},uuid:this.uuid,name:this.name,image:this.source.toJSON(e).uuid,mapping:this.mapping,channel:this.channel,repeat:[this.repeat.x,this.repeat.y],offset:[this.offset.x,this.offset.y],center:[this.center.x,this.center.y],rotation:this.rotation,wrap:[this.wrapS,this.wrapT],format:this.format,internalFormat:this.internalFormat,type:this.type,colorSpace:this.colorSpace,minFilter:this.minFilter,magFilter:this.magFilter,anisotropy:this.anisotropy,flipY:this.flipY,generateMipmaps:this.generateMipmaps,premultiplyAlpha:this.premultiplyAlpha,unpackAlignment:this.unpackAlignment};return Object.keys(this.userData).length>0&&(n.userData=this.userData),t||(e.textures[this.uuid]=n),n}dispose(){this.dispatchEvent({type:`dispose`})}transformUv(e){if(this.mapping!==300)return e;if(e.applyMatrix3(this.matrix),e.x<0||e.x>1)switch(this.wrapS){case ki:e.x-=Math.floor(e.x);break;case Ai:e.x=e.x<0?0:1;break;case ji:Math.abs(Math.floor(e.x)%2)===1?e.x=Math.ceil(e.x)-e.x:e.x-=Math.floor(e.x)}if(e.y<0||e.y>1)switch(this.wrapT){case ki:e.y-=Math.floor(e.y);break;case Ai:e.y=e.y<0?0:1;break;case ji:Math.abs(Math.floor(e.y)%2)===1?e.y=Math.ceil(e.y)-e.y:e.y-=Math.floor(e.y)}return this.flipY&&(e.y=1-e.y),e}set needsUpdate(e){e===!0&&(this.version++,this.source.needsUpdate=!0)}set needsPMREMUpdate(e){e===!0&&this.pmremVersion++}};es.DEFAULT_IMAGE=null,es.DEFAULT_MAPPING=300,es.DEFAULT_ANISOTROPY=1;var ts=class e{constructor(t=0,n=0,r=0,i=1){e.prototype.isVector4=!0,this.x=t,this.y=n,this.z=r,this.w=i}get width(){return this.z}set width(e){this.z=e}get height(){return this.w}set height(e){this.w=e}set(e,t,n,r){return this.x=e,this.y=t,this.z=n,this.w=r,this}setScalar(e){return this.x=e,this.y=e,this.z=e,this.w=e,this}setX(e){return this.x=e,this}setY(e){return this.y=e,this}setZ(e){return this.z=e,this}setW(e){return this.w=e,this}setComponent(e,t){switch(e){case 0:this.x=t;break;case 1:this.y=t;break;case 2:this.z=t;break;case 3:this.w=t;break;default:throw Error(`index is out of range: `+e)}return this}getComponent(e){switch(e){case 0:return this.x;case 1:return this.y;case 2:return this.z;case 3:return this.w;default:throw Error(`index is out of range: `+e)}}clone(){return new this.constructor(this.x,this.y,this.z,this.w)}copy(e){return this.x=e.x,this.y=e.y,this.z=e.z,this.w=e.w===void 0?1:e.w,this}add(e){return this.x+=e.x,this.y+=e.y,this.z+=e.z,this.w+=e.w,this}addScalar(e){return this.x+=e,this.y+=e,this.z+=e,this.w+=e,this}addVectors(e,t){return this.x=e.x+t.x,this.y=e.y+t.y,this.z=e.z+t.z,this.w=e.w+t.w,this}addScaledVector(e,t){return this.x+=e.x*t,this.y+=e.y*t,this.z+=e.z*t,this.w+=e.w*t,this}sub(e){return this.x-=e.x,this.y-=e.y,this.z-=e.z,this.w-=e.w,this}subScalar(e){return this.x-=e,this.y-=e,this.z-=e,this.w-=e,this}subVectors(e,t){return this.x=e.x-t.x,this.y=e.y-t.y,this.z=e.z-t.z,this.w=e.w-t.w,this}multiply(e){return this.x*=e.x,this.y*=e.y,this.z*=e.z,this.w*=e.w,this}multiplyScalar(e){return this.x*=e,this.y*=e,this.z*=e,this.w*=e,this}applyMatrix4(e){let t=this.x,n=this.y,r=this.z,i=this.w,a=e.elements;return this.x=a[0]*t+a[4]*n+a[8]*r+a[12]*i,this.y=a[1]*t+a[5]*n+a[9]*r+a[13]*i,this.z=a[2]*t+a[6]*n+a[10]*r+a[14]*i,this.w=a[3]*t+a[7]*n+a[11]*r+a[15]*i,this}divideScalar(e){return this.multiplyScalar(1/e)}setAxisAngleFromQuaternion(e){this.w=2*Math.acos(e.w);let t=Math.sqrt(1-e.w*e.w);return t<1e-4?(this.x=1,this.y=0,this.z=0):(this.x=e.x/t,this.y=e.y/t,this.z=e.z/t),this}setAxisAngleFromRotationMatrix(e){let t,n,r,i,a=.01,o=.1,s=e.elements,c=s[0],l=s[4],u=s[8],d=s[1],f=s[5],p=s[9],m=s[2],h=s[6],g=s[10];if(Math.abs(l-d)<a&&Math.abs(u-m)<a&&Math.abs(p-h)<a){if(Math.abs(l+d)<o&&Math.abs(u+m)<o&&Math.abs(p+h)<o&&Math.abs(c+f+g-3)<o)return this.set(1,0,0,0),this;t=Math.PI;let e=(c+1)/2,s=(f+1)/2,_=(g+1)/2,v=(l+d)/4,y=(u+m)/4,b=(p+h)/4;return e>s&&e>_?e<a?(n=0,r=.707106781,i=.707106781):(n=Math.sqrt(e),r=v/n,i=y/n):s>_?s<a?(n=.707106781,r=0,i=.707106781):(r=Math.sqrt(s),n=v/r,i=b/r):_<a?(n=.707106781,r=.707106781,i=0):(i=Math.sqrt(_),n=y/i,r=b/i),this.set(n,r,i,t),this}let _=Math.sqrt((h-p)*(h-p)+(u-m)*(u-m)+(d-l)*(d-l));return Math.abs(_)<.001&&(_=1),this.x=(h-p)/_,this.y=(u-m)/_,this.z=(d-l)/_,this.w=Math.acos((c+f+g-1)/2),this}setFromMatrixPosition(e){let t=e.elements;return this.x=t[12],this.y=t[13],this.z=t[14],this.w=t[15],this}min(e){return this.x=Math.min(this.x,e.x),this.y=Math.min(this.y,e.y),this.z=Math.min(this.z,e.z),this.w=Math.min(this.w,e.w),this}max(e){return this.x=Math.max(this.x,e.x),this.y=Math.max(this.y,e.y),this.z=Math.max(this.z,e.z),this.w=Math.max(this.w,e.w),this}clamp(e,t){return this.x=Math.max(e.x,Math.min(t.x,this.x)),this.y=Math.max(e.y,Math.min(t.y,this.y)),this.z=Math.max(e.z,Math.min(t.z,this.z)),this.w=Math.max(e.w,Math.min(t.w,this.w)),this}clampScalar(e,t){return this.x=Math.max(e,Math.min(t,this.x)),this.y=Math.max(e,Math.min(t,this.y)),this.z=Math.max(e,Math.min(t,this.z)),this.w=Math.max(e,Math.min(t,this.w)),this}clampLength(e,t){let n=this.length();return this.divideScalar(n||1).multiplyScalar(Math.max(e,Math.min(t,n)))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this.z=Math.floor(this.z),this.w=Math.floor(this.w),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this.z=Math.ceil(this.z),this.w=Math.ceil(this.w),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this.z=Math.round(this.z),this.w=Math.round(this.w),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this.z=Math.trunc(this.z),this.w=Math.trunc(this.w),this}negate(){return this.x=-this.x,this.y=-this.y,this.z=-this.z,this.w=-this.w,this}dot(e){return this.x*e.x+this.y*e.y+this.z*e.z+this.w*e.w}lengthSq(){return this.x*this.x+this.y*this.y+this.z*this.z+this.w*this.w}length(){return Math.sqrt(this.x*this.x+this.y*this.y+this.z*this.z+this.w*this.w)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)+Math.abs(this.z)+Math.abs(this.w)}normalize(){return this.divideScalar(this.length()||1)}setLength(e){return this.normalize().multiplyScalar(e)}lerp(e,t){return this.x+=(e.x-this.x)*t,this.y+=(e.y-this.y)*t,this.z+=(e.z-this.z)*t,this.w+=(e.w-this.w)*t,this}lerpVectors(e,t,n){return this.x=e.x+(t.x-e.x)*n,this.y=e.y+(t.y-e.y)*n,this.z=e.z+(t.z-e.z)*n,this.w=e.w+(t.w-e.w)*n,this}equals(e){return e.x===this.x&&e.y===this.y&&e.z===this.z&&e.w===this.w}fromArray(e,t=0){return this.x=e[t],this.y=e[t+1],this.z=e[t+2],this.w=e[t+3],this}toArray(e=[],t=0){return e[t]=this.x,e[t+1]=this.y,e[t+2]=this.z,e[t+3]=this.w,e}fromBufferAttribute(e,t){return this.x=e.getX(t),this.y=e.getY(t),this.z=e.getZ(t),this.w=e.getW(t),this}random(){return this.x=Math.random(),this.y=Math.random(),this.z=Math.random(),this.w=Math.random(),this}*[Symbol.iterator](){yield this.x,yield this.y,yield this.z,yield this.w}},ns=class extends io{constructor(e=1,t=1,n={}){super(),this.isRenderTarget=!0,this.width=e,this.height=t,this.depth=1,this.scissor=new ts(0,0,e,t),this.scissorTest=!1,this.viewport=new ts(0,0,e,t);let r={width:e,height:t,depth:1};n=Object.assign({generateMipmaps:!1,internalFormat:null,minFilter:Fi,depthBuffer:!0,stencilBuffer:!1,resolveDepthBuffer:!0,resolveStencilBuffer:!0,depthTexture:null,samples:0,count:1},n);let i=new es(r,n.mapping,n.wrapS,n.wrapT,n.magFilter,n.minFilter,n.format,n.type,n.anisotropy,n.colorSpace);i.flipY=!1,i.generateMipmaps=n.generateMipmaps,i.internalFormat=n.internalFormat,this.textures=[];let a=n.count;for(let e=0;e<a;e++)this.textures[e]=i.clone(),this.textures[e].isRenderTargetTexture=!0;this.depthBuffer=n.depthBuffer,this.stencilBuffer=n.stencilBuffer,this.resolveDepthBuffer=n.resolveDepthBuffer,this.resolveStencilBuffer=n.resolveStencilBuffer,this.depthTexture=n.depthTexture,this.samples=n.samples}get texture(){return this.textures[0]}set texture(e){this.textures[0]=e}setSize(e,t,n=1){if(this.width!==e||this.height!==t||this.depth!==n){this.width=e,this.height=t,this.depth=n;for(let r=0,i=this.textures.length;r<i;r++)this.textures[r].image.width=e,this.textures[r].image.height=t,this.textures[r].image.depth=n;this.dispose()}this.viewport.set(0,0,e,t),this.scissor.set(0,0,e,t)}clone(){return new this.constructor().copy(this)}copy(e){this.width=e.width,this.height=e.height,this.depth=e.depth,this.scissor.copy(e.scissor),this.scissorTest=e.scissorTest,this.viewport.copy(e.viewport),this.textures.length=0;for(let t=0,n=e.textures.length;t<n;t++)this.textures[t]=e.textures[t].clone(),this.textures[t].isRenderTargetTexture=!0;let t=Object.assign({},e.texture.image);return this.texture.source=new Zo(t),this.depthBuffer=e.depthBuffer,this.stencilBuffer=e.stencilBuffer,this.resolveDepthBuffer=e.resolveDepthBuffer,this.resolveStencilBuffer=e.resolveStencilBuffer,e.depthTexture!==null&&(this.depthTexture=e.depthTexture.clone()),this.samples=e.samples,this}dispose(){this.dispatchEvent({type:`dispose`})}},rs=class extends ns{constructor(e=1,t=1,n={}){super(e,t,n),this.isWebGLRenderTarget=!0}},is=class extends es{constructor(e=null,t=1,n=1,r=1){super(null),this.isDataArrayTexture=!0,this.image={data:e,width:t,height:n,depth:r},this.magFilter=Mi,this.minFilter=Mi,this.wrapR=Ai,this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1,this.layerUpdates=new Set}addLayerUpdate(e){this.layerUpdates.add(e)}clearLayerUpdates(){this.layerUpdates.clear()}},as=class extends es{constructor(e=null,t=1,n=1,r=1){super(null),this.isData3DTexture=!0,this.image={data:e,width:t,height:n,depth:r},this.magFilter=Mi,this.minFilter=Mi,this.wrapR=Ai,this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1}},os=class{constructor(e=0,t=0,n=0,r=1){this.isQuaternion=!0,this._x=e,this._y=t,this._z=n,this._w=r}static slerpFlat(e,t,n,r,i,a,o){let s=n[r+0],c=n[r+1],l=n[r+2],u=n[r+3],d=i[a+0],f=i[a+1],p=i[a+2],m=i[a+3];if(o===0)e[t+0]=s,e[t+1]=c,e[t+2]=l,e[t+3]=u;else if(o===1)e[t+0]=d,e[t+1]=f,e[t+2]=p,e[t+3]=m;else{if(u!==m||s!==d||c!==f||l!==p){let e=1-o,t=s*d+c*f+l*p+u*m,n=t>=0?1:-1,r=1-t*t;if(r>2**-52){let i=Math.sqrt(r),a=Math.atan2(i,t*n);e=Math.sin(e*a)/i,o=Math.sin(o*a)/i}let i=o*n;if(s=s*e+d*i,c=c*e+f*i,l=l*e+p*i,u=u*e+m*i,e===1-o){let e=1/Math.sqrt(s*s+c*c+l*l+u*u);s*=e,c*=e,l*=e,u*=e}}e[t]=s,e[t+1]=c,e[t+2]=l,e[t+3]=u}}static multiplyQuaternionsFlat(e,t,n,r,i,a){let o=n[r],s=n[r+1],c=n[r+2],l=n[r+3],u=i[a],d=i[a+1],f=i[a+2],p=i[a+3];return e[t]=o*p+l*u+s*f-c*d,e[t+1]=s*p+l*d+c*u-o*f,e[t+2]=c*p+l*f+o*d-s*u,e[t+3]=l*p-o*u-s*d-c*f,e}get x(){return this._x}set x(e){this._x=e,this._onChangeCallback()}get y(){return this._y}set y(e){this._y=e,this._onChangeCallback()}get z(){return this._z}set z(e){this._z=e,this._onChangeCallback()}get w(){return this._w}set w(e){this._w=e,this._onChangeCallback()}set(e,t,n,r){return this._x=e,this._y=t,this._z=n,this._w=r,this._onChangeCallback(),this}clone(){return new this.constructor(this._x,this._y,this._z,this._w)}copy(e){return this._x=e.x,this._y=e.y,this._z=e.z,this._w=e.w,this._onChangeCallback(),this}setFromEuler(e,t=!0){let n=e._x,r=e._y,i=e._z,a=e._order,o=Math.cos,s=Math.sin,c=o(n/2),l=o(r/2),u=o(i/2),d=s(n/2),f=s(r/2),p=s(i/2);switch(a){case`XYZ`:this._x=d*l*u+c*f*p,this._y=c*f*u-d*l*p,this._z=c*l*p+d*f*u,this._w=c*l*u-d*f*p;break;case`YXZ`:this._x=d*l*u+c*f*p,this._y=c*f*u-d*l*p,this._z=c*l*p-d*f*u,this._w=c*l*u+d*f*p;break;case`ZXY`:this._x=d*l*u-c*f*p,this._y=c*f*u+d*l*p,this._z=c*l*p+d*f*u,this._w=c*l*u-d*f*p;break;case`ZYX`:this._x=d*l*u-c*f*p,this._y=c*f*u+d*l*p,this._z=c*l*p-d*f*u,this._w=c*l*u+d*f*p;break;case`YZX`:this._x=d*l*u+c*f*p,this._y=c*f*u+d*l*p,this._z=c*l*p-d*f*u,this._w=c*l*u-d*f*p;break;case`XZY`:this._x=d*l*u-c*f*p,this._y=c*f*u-d*l*p,this._z=c*l*p+d*f*u,this._w=c*l*u+d*f*p;break;default:console.warn(`THREE.Quaternion: .setFromEuler() encountered an unknown order: `+a)}return t===!0&&this._onChangeCallback(),this}setFromAxisAngle(e,t){let n=t/2,r=Math.sin(n);return this._x=e.x*r,this._y=e.y*r,this._z=e.z*r,this._w=Math.cos(n),this._onChangeCallback(),this}setFromRotationMatrix(e){let t=e.elements,n=t[0],r=t[4],i=t[8],a=t[1],o=t[5],s=t[9],c=t[2],l=t[6],u=t[10],d=n+o+u;if(d>0){let e=.5/Math.sqrt(d+1);this._w=.25/e,this._x=(l-s)*e,this._y=(i-c)*e,this._z=(a-r)*e}else if(n>o&&n>u){let e=2*Math.sqrt(1+n-o-u);this._w=(l-s)/e,this._x=.25*e,this._y=(r+a)/e,this._z=(i+c)/e}else if(o>u){let e=2*Math.sqrt(1+o-n-u);this._w=(i-c)/e,this._x=(r+a)/e,this._y=.25*e,this._z=(s+l)/e}else{let e=2*Math.sqrt(1+u-n-o);this._w=(a-r)/e,this._x=(i+c)/e,this._y=(s+l)/e,this._z=.25*e}return this._onChangeCallback(),this}setFromUnitVectors(e,t){let n=e.dot(t)+1;return n<2**-52?(n=0,Math.abs(e.x)>Math.abs(e.z)?(this._x=-e.y,this._y=e.x,this._z=0,this._w=n):(this._x=0,this._y=-e.z,this._z=e.y,this._w=n)):(this._x=e.y*t.z-e.z*t.y,this._y=e.z*t.x-e.x*t.z,this._z=e.x*t.y-e.y*t.x,this._w=n),this.normalize()}angleTo(e){return 2*Math.acos(Math.abs(uo(this.dot(e),-1,1)))}rotateTowards(e,t){let n=this.angleTo(e);if(n===0)return this;let r=Math.min(1,t/n);return this.slerp(e,r),this}identity(){return this.set(0,0,0,1)}invert(){return this.conjugate()}conjugate(){return this._x*=-1,this._y*=-1,this._z*=-1,this._onChangeCallback(),this}dot(e){return this._x*e._x+this._y*e._y+this._z*e._z+this._w*e._w}lengthSq(){return this._x*this._x+this._y*this._y+this._z*this._z+this._w*this._w}length(){return Math.sqrt(this._x*this._x+this._y*this._y+this._z*this._z+this._w*this._w)}normalize(){let e=this.length();return e===0?(this._x=0,this._y=0,this._z=0,this._w=1):(e=1/e,this._x*=e,this._y*=e,this._z*=e,this._w*=e),this._onChangeCallback(),this}multiply(e){return this.multiplyQuaternions(this,e)}premultiply(e){return this.multiplyQuaternions(e,this)}multiplyQuaternions(e,t){let n=e._x,r=e._y,i=e._z,a=e._w,o=t._x,s=t._y,c=t._z,l=t._w;return this._x=n*l+a*o+r*c-i*s,this._y=r*l+a*s+i*o-n*c,this._z=i*l+a*c+n*s-r*o,this._w=a*l-n*o-r*s-i*c,this._onChangeCallback(),this}slerp(e,t){if(t===0)return this;if(t===1)return this.copy(e);let n=this._x,r=this._y,i=this._z,a=this._w,o=a*e._w+n*e._x+r*e._y+i*e._z;if(o<0?(this._w=-e._w,this._x=-e._x,this._y=-e._y,this._z=-e._z,o=-o):this.copy(e),o>=1)return this._w=a,this._x=n,this._y=r,this._z=i,this;let s=1-o*o;if(s<=2**-52){let e=1-t;return this._w=e*a+t*this._w,this._x=e*n+t*this._x,this._y=e*r+t*this._y,this._z=e*i+t*this._z,this.normalize(),this}let c=Math.sqrt(s),l=Math.atan2(c,o),u=Math.sin((1-t)*l)/c,d=Math.sin(t*l)/c;return this._w=a*u+this._w*d,this._x=n*u+this._x*d,this._y=r*u+this._y*d,this._z=i*u+this._z*d,this._onChangeCallback(),this}slerpQuaternions(e,t,n){return this.copy(e).slerp(t,n)}random(){let e=2*Math.PI*Math.random(),t=2*Math.PI*Math.random(),n=Math.random(),r=Math.sqrt(1-n),i=Math.sqrt(n);return this.set(r*Math.sin(e),r*Math.cos(e),i*Math.sin(t),i*Math.cos(t))}equals(e){return e._x===this._x&&e._y===this._y&&e._z===this._z&&e._w===this._w}fromArray(e,t=0){return this._x=e[t],this._y=e[t+1],this._z=e[t+2],this._w=e[t+3],this._onChangeCallback(),this}toArray(e=[],t=0){return e[t]=this._x,e[t+1]=this._y,e[t+2]=this._z,e[t+3]=this._w,e}fromBufferAttribute(e,t){return this._x=e.getX(t),this._y=e.getY(t),this._z=e.getZ(t),this._w=e.getW(t),this._onChangeCallback(),this}toJSON(){return this.toArray()}_onChange(e){return this._onChangeCallback=e,this}_onChangeCallback(){}*[Symbol.iterator](){yield this._x,yield this._y,yield this._z,yield this._w}},G=class e{constructor(t=0,n=0,r=0){e.prototype.isVector3=!0,this.x=t,this.y=n,this.z=r}set(e,t,n){return n===void 0&&(n=this.z),this.x=e,this.y=t,this.z=n,this}setScalar(e){return this.x=e,this.y=e,this.z=e,this}setX(e){return this.x=e,this}setY(e){return this.y=e,this}setZ(e){return this.z=e,this}setComponent(e,t){switch(e){case 0:this.x=t;break;case 1:this.y=t;break;case 2:this.z=t;break;default:throw Error(`index is out of range: `+e)}return this}getComponent(e){switch(e){case 0:return this.x;case 1:return this.y;case 2:return this.z;default:throw Error(`index is out of range: `+e)}}clone(){return new this.constructor(this.x,this.y,this.z)}copy(e){return this.x=e.x,this.y=e.y,this.z=e.z,this}add(e){return this.x+=e.x,this.y+=e.y,this.z+=e.z,this}addScalar(e){return this.x+=e,this.y+=e,this.z+=e,this}addVectors(e,t){return this.x=e.x+t.x,this.y=e.y+t.y,this.z=e.z+t.z,this}addScaledVector(e,t){return this.x+=e.x*t,this.y+=e.y*t,this.z+=e.z*t,this}sub(e){return this.x-=e.x,this.y-=e.y,this.z-=e.z,this}subScalar(e){return this.x-=e,this.y-=e,this.z-=e,this}subVectors(e,t){return this.x=e.x-t.x,this.y=e.y-t.y,this.z=e.z-t.z,this}multiply(e){return this.x*=e.x,this.y*=e.y,this.z*=e.z,this}multiplyScalar(e){return this.x*=e,this.y*=e,this.z*=e,this}multiplyVectors(e,t){return this.x=e.x*t.x,this.y=e.y*t.y,this.z=e.z*t.z,this}applyEuler(e){return this.applyQuaternion(cs.setFromEuler(e))}applyAxisAngle(e,t){return this.applyQuaternion(cs.setFromAxisAngle(e,t))}applyMatrix3(e){let t=this.x,n=this.y,r=this.z,i=e.elements;return this.x=i[0]*t+i[3]*n+i[6]*r,this.y=i[1]*t+i[4]*n+i[7]*r,this.z=i[2]*t+i[5]*n+i[8]*r,this}applyNormalMatrix(e){return this.applyMatrix3(e).normalize()}applyMatrix4(e){let t=this.x,n=this.y,r=this.z,i=e.elements,a=1/(i[3]*t+i[7]*n+i[11]*r+i[15]);return this.x=(i[0]*t+i[4]*n+i[8]*r+i[12])*a,this.y=(i[1]*t+i[5]*n+i[9]*r+i[13])*a,this.z=(i[2]*t+i[6]*n+i[10]*r+i[14])*a,this}applyQuaternion(e){let t=this.x,n=this.y,r=this.z,i=e.x,a=e.y,o=e.z,s=e.w,c=2*(a*r-o*n),l=2*(o*t-i*r),u=2*(i*n-a*t);return this.x=t+s*c+a*u-o*l,this.y=n+s*l+o*c-i*u,this.z=r+s*u+i*l-a*c,this}project(e){return this.applyMatrix4(e.matrixWorldInverse).applyMatrix4(e.projectionMatrix)}unproject(e){return this.applyMatrix4(e.projectionMatrixInverse).applyMatrix4(e.matrixWorld)}transformDirection(e){let t=this.x,n=this.y,r=this.z,i=e.elements;return this.x=i[0]*t+i[4]*n+i[8]*r,this.y=i[1]*t+i[5]*n+i[9]*r,this.z=i[2]*t+i[6]*n+i[10]*r,this.normalize()}divide(e){return this.x/=e.x,this.y/=e.y,this.z/=e.z,this}divideScalar(e){return this.multiplyScalar(1/e)}min(e){return this.x=Math.min(this.x,e.x),this.y=Math.min(this.y,e.y),this.z=Math.min(this.z,e.z),this}max(e){return this.x=Math.max(this.x,e.x),this.y=Math.max(this.y,e.y),this.z=Math.max(this.z,e.z),this}clamp(e,t){return this.x=Math.max(e.x,Math.min(t.x,this.x)),this.y=Math.max(e.y,Math.min(t.y,this.y)),this.z=Math.max(e.z,Math.min(t.z,this.z)),this}clampScalar(e,t){return this.x=Math.max(e,Math.min(t,this.x)),this.y=Math.max(e,Math.min(t,this.y)),this.z=Math.max(e,Math.min(t,this.z)),this}clampLength(e,t){let n=this.length();return this.divideScalar(n||1).multiplyScalar(Math.max(e,Math.min(t,n)))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this.z=Math.floor(this.z),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this.z=Math.ceil(this.z),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this.z=Math.round(this.z),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this.z=Math.trunc(this.z),this}negate(){return this.x=-this.x,this.y=-this.y,this.z=-this.z,this}dot(e){return this.x*e.x+this.y*e.y+this.z*e.z}lengthSq(){return this.x*this.x+this.y*this.y+this.z*this.z}length(){return Math.sqrt(this.x*this.x+this.y*this.y+this.z*this.z)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)+Math.abs(this.z)}normalize(){return this.divideScalar(this.length()||1)}setLength(e){return this.normalize().multiplyScalar(e)}lerp(e,t){return this.x+=(e.x-this.x)*t,this.y+=(e.y-this.y)*t,this.z+=(e.z-this.z)*t,this}lerpVectors(e,t,n){return this.x=e.x+(t.x-e.x)*n,this.y=e.y+(t.y-e.y)*n,this.z=e.z+(t.z-e.z)*n,this}cross(e){return this.crossVectors(this,e)}crossVectors(e,t){let n=e.x,r=e.y,i=e.z,a=t.x,o=t.y,s=t.z;return this.x=r*s-i*o,this.y=i*a-n*s,this.z=n*o-r*a,this}projectOnVector(e){let t=e.lengthSq();if(t===0)return this.set(0,0,0);let n=e.dot(this)/t;return this.copy(e).multiplyScalar(n)}projectOnPlane(e){return ss.copy(this).projectOnVector(e),this.sub(ss)}reflect(e){return this.sub(ss.copy(e).multiplyScalar(2*this.dot(e)))}angleTo(e){let t=Math.sqrt(this.lengthSq()*e.lengthSq());if(t===0)return Math.PI/2;let n=this.dot(e)/t;return Math.acos(uo(n,-1,1))}distanceTo(e){return Math.sqrt(this.distanceToSquared(e))}distanceToSquared(e){let t=this.x-e.x,n=this.y-e.y,r=this.z-e.z;return t*t+n*n+r*r}manhattanDistanceTo(e){return Math.abs(this.x-e.x)+Math.abs(this.y-e.y)+Math.abs(this.z-e.z)}setFromSpherical(e){return this.setFromSphericalCoords(e.radius,e.phi,e.theta)}setFromSphericalCoords(e,t,n){let r=Math.sin(t)*e;return this.x=r*Math.sin(n),this.y=Math.cos(t)*e,this.z=r*Math.cos(n),this}setFromCylindrical(e){return this.setFromCylindricalCoords(e.radius,e.theta,e.y)}setFromCylindricalCoords(e,t,n){return this.x=e*Math.sin(t),this.y=n,this.z=e*Math.cos(t),this}setFromMatrixPosition(e){let t=e.elements;return this.x=t[12],this.y=t[13],this.z=t[14],this}setFromMatrixScale(e){let t=this.setFromMatrixColumn(e,0).length(),n=this.setFromMatrixColumn(e,1).length(),r=this.setFromMatrixColumn(e,2).length();return this.x=t,this.y=n,this.z=r,this}setFromMatrixColumn(e,t){return this.fromArray(e.elements,t*4)}setFromMatrix3Column(e,t){return this.fromArray(e.elements,t*3)}setFromEuler(e){return this.x=e._x,this.y=e._y,this.z=e._z,this}setFromColor(e){return this.x=e.r,this.y=e.g,this.z=e.b,this}equals(e){return e.x===this.x&&e.y===this.y&&e.z===this.z}fromArray(e,t=0){return this.x=e[t],this.y=e[t+1],this.z=e[t+2],this}toArray(e=[],t=0){return e[t]=this.x,e[t+1]=this.y,e[t+2]=this.z,e}fromBufferAttribute(e,t){return this.x=e.getX(t),this.y=e.getY(t),this.z=e.getZ(t),this}random(){return this.x=Math.random(),this.y=Math.random(),this.z=Math.random(),this}randomDirection(){let e=Math.random()*Math.PI*2,t=Math.random()*2-1,n=Math.sqrt(1-t*t);return this.x=n*Math.cos(e),this.y=t,this.z=n*Math.sin(e),this}*[Symbol.iterator](){yield this.x,yield this.y,yield this.z}},ss=new G,cs=new os,ls=class{constructor(e=new G(1/0,1/0,1/0),t=new G(-1/0,-1/0,-1/0)){this.isBox3=!0,this.min=e,this.max=t}set(e,t){return this.min.copy(e),this.max.copy(t),this}setFromArray(e){this.makeEmpty();for(let t=0,n=e.length;t<n;t+=3)this.expandByPoint(ds.fromArray(e,t));return this}setFromBufferAttribute(e){this.makeEmpty();for(let t=0,n=e.count;t<n;t++)this.expandByPoint(ds.fromBufferAttribute(e,t));return this}setFromPoints(e){this.makeEmpty();for(let t=0,n=e.length;t<n;t++)this.expandByPoint(e[t]);return this}setFromCenterAndSize(e,t){let n=ds.copy(t).multiplyScalar(.5);return this.min.copy(e).sub(n),this.max.copy(e).add(n),this}setFromObject(e,t=!1){return this.makeEmpty(),this.expandByObject(e,t)}clone(){return new this.constructor().copy(this)}copy(e){return this.min.copy(e.min),this.max.copy(e.max),this}makeEmpty(){return this.min.x=this.min.y=this.min.z=1/0,this.max.x=this.max.y=this.max.z=-1/0,this}isEmpty(){return this.max.x<this.min.x||this.max.y<this.min.y||this.max.z<this.min.z}getCenter(e){return this.isEmpty()?e.set(0,0,0):e.addVectors(this.min,this.max).multiplyScalar(.5)}getSize(e){return this.isEmpty()?e.set(0,0,0):e.subVectors(this.max,this.min)}expandByPoint(e){return this.min.min(e),this.max.max(e),this}expandByVector(e){return this.min.sub(e),this.max.add(e),this}expandByScalar(e){return this.min.addScalar(-e),this.max.addScalar(e),this}expandByObject(e,t=!1){e.updateWorldMatrix(!1,!1);let n=e.geometry;if(n!==void 0){let r=n.getAttribute(`position`);if(t===!0&&r!==void 0&&e.isInstancedMesh!==!0)for(let t=0,n=r.count;t<n;t++)e.isMesh===!0?e.getVertexPosition(t,ds):ds.fromBufferAttribute(r,t),ds.applyMatrix4(e.matrixWorld),this.expandByPoint(ds);else e.boundingBox===void 0?(n.boundingBox===null&&n.computeBoundingBox(),fs.copy(n.boundingBox)):(e.boundingBox===null&&e.computeBoundingBox(),fs.copy(e.boundingBox)),fs.applyMatrix4(e.matrixWorld),this.union(fs)}let r=e.children;for(let e=0,n=r.length;e<n;e++)this.expandByObject(r[e],t);return this}containsPoint(e){return e.x>=this.min.x&&e.x<=this.max.x&&e.y>=this.min.y&&e.y<=this.max.y&&e.z>=this.min.z&&e.z<=this.max.z}containsBox(e){return this.min.x<=e.min.x&&e.max.x<=this.max.x&&this.min.y<=e.min.y&&e.max.y<=this.max.y&&this.min.z<=e.min.z&&e.max.z<=this.max.z}getParameter(e,t){return t.set((e.x-this.min.x)/(this.max.x-this.min.x),(e.y-this.min.y)/(this.max.y-this.min.y),(e.z-this.min.z)/(this.max.z-this.min.z))}intersectsBox(e){return e.max.x>=this.min.x&&e.min.x<=this.max.x&&e.max.y>=this.min.y&&e.min.y<=this.max.y&&e.max.z>=this.min.z&&e.min.z<=this.max.z}intersectsSphere(e){return this.clampPoint(e.center,ds),ds.distanceToSquared(e.center)<=e.radius*e.radius}intersectsPlane(e){let t,n;return e.normal.x>0?(t=e.normal.x*this.min.x,n=e.normal.x*this.max.x):(t=e.normal.x*this.max.x,n=e.normal.x*this.min.x),e.normal.y>0?(t+=e.normal.y*this.min.y,n+=e.normal.y*this.max.y):(t+=e.normal.y*this.max.y,n+=e.normal.y*this.min.y),e.normal.z>0?(t+=e.normal.z*this.min.z,n+=e.normal.z*this.max.z):(t+=e.normal.z*this.max.z,n+=e.normal.z*this.min.z),t<=-e.constant&&n>=-e.constant}intersectsTriangle(e){if(this.isEmpty())return!1;this.getCenter(ys),bs.subVectors(this.max,ys),ps.subVectors(e.a,ys),ms.subVectors(e.b,ys),hs.subVectors(e.c,ys),gs.subVectors(ms,ps),_s.subVectors(hs,ms),vs.subVectors(ps,hs);let t=[0,-gs.z,gs.y,0,-_s.z,_s.y,0,-vs.z,vs.y,gs.z,0,-gs.x,_s.z,0,-_s.x,vs.z,0,-vs.x,-gs.y,gs.x,0,-_s.y,_s.x,0,-vs.y,vs.x,0];return!Cs(t,ps,ms,hs,bs)||(t=[1,0,0,0,1,0,0,0,1],!Cs(t,ps,ms,hs,bs))?!1:(xs.crossVectors(gs,_s),t=[xs.x,xs.y,xs.z],Cs(t,ps,ms,hs,bs))}clampPoint(e,t){return t.copy(e).clamp(this.min,this.max)}distanceToPoint(e){return this.clampPoint(e,ds).distanceTo(e)}getBoundingSphere(e){return this.isEmpty()?e.makeEmpty():(this.getCenter(e.center),e.radius=this.getSize(ds).length()*.5),e}intersect(e){return this.min.max(e.min),this.max.min(e.max),this.isEmpty()&&this.makeEmpty(),this}union(e){return this.min.min(e.min),this.max.max(e.max),this}applyMatrix4(e){return this.isEmpty()||(us[0].set(this.min.x,this.min.y,this.min.z).applyMatrix4(e),us[1].set(this.min.x,this.min.y,this.max.z).applyMatrix4(e),us[2].set(this.min.x,this.max.y,this.min.z).applyMatrix4(e),us[3].set(this.min.x,this.max.y,this.max.z).applyMatrix4(e),us[4].set(this.max.x,this.min.y,this.min.z).applyMatrix4(e),us[5].set(this.max.x,this.min.y,this.max.z).applyMatrix4(e),us[6].set(this.max.x,this.max.y,this.min.z).applyMatrix4(e),us[7].set(this.max.x,this.max.y,this.max.z).applyMatrix4(e),this.setFromPoints(us)),this}translate(e){return this.min.add(e),this.max.add(e),this}equals(e){return e.min.equals(this.min)&&e.max.equals(this.max)}},us=[new G,new G,new G,new G,new G,new G,new G,new G],ds=new G,fs=new ls,ps=new G,ms=new G,hs=new G,gs=new G,_s=new G,vs=new G,ys=new G,bs=new G,xs=new G,Ss=new G;function Cs(e,t,n,r,i){for(let a=0,o=e.length-3;a<=o;a+=3){Ss.fromArray(e,a);let o=i.x*Math.abs(Ss.x)+i.y*Math.abs(Ss.y)+i.z*Math.abs(Ss.z),s=t.dot(Ss),c=n.dot(Ss),l=r.dot(Ss);if(Math.max(-Math.max(s,c,l),Math.min(s,c,l))>o)return!1}return!0}var ws=new ls,Ts=new G,Es=new G,Ds=class{constructor(e=new G,t=-1){this.isSphere=!0,this.center=e,this.radius=t}set(e,t){return this.center.copy(e),this.radius=t,this}setFromPoints(e,t){let n=this.center;t===void 0?ws.setFromPoints(e).getCenter(n):n.copy(t);let r=0;for(let t=0,i=e.length;t<i;t++)r=Math.max(r,n.distanceToSquared(e[t]));return this.radius=Math.sqrt(r),this}copy(e){return this.center.copy(e.center),this.radius=e.radius,this}isEmpty(){return this.radius<0}makeEmpty(){return this.center.set(0,0,0),this.radius=-1,this}containsPoint(e){return e.distanceToSquared(this.center)<=this.radius*this.radius}distanceToPoint(e){return e.distanceTo(this.center)-this.radius}intersectsSphere(e){let t=this.radius+e.radius;return e.center.distanceToSquared(this.center)<=t*t}intersectsBox(e){return e.intersectsSphere(this)}intersectsPlane(e){return Math.abs(e.distanceToPoint(this.center))<=this.radius}clampPoint(e,t){let n=this.center.distanceToSquared(e);return t.copy(e),n>this.radius*this.radius&&(t.sub(this.center).normalize(),t.multiplyScalar(this.radius).add(this.center)),t}getBoundingBox(e){return this.isEmpty()?(e.makeEmpty(),e):(e.set(this.center,this.center),e.expandByScalar(this.radius),e)}applyMatrix4(e){return this.center.applyMatrix4(e),this.radius*=e.getMaxScaleOnAxis(),this}translate(e){return this.center.add(e),this}expandByPoint(e){if(this.isEmpty())return this.center.copy(e),this.radius=0,this;Ts.subVectors(e,this.center);let t=Ts.lengthSq();if(t>this.radius*this.radius){let e=Math.sqrt(t),n=(e-this.radius)*.5;this.center.addScaledVector(Ts,n/e),this.radius+=n}return this}union(e){return e.isEmpty()?this:this.isEmpty()?(this.copy(e),this):(this.center.equals(e.center)===!0?this.radius=Math.max(this.radius,e.radius):(Es.subVectors(e.center,this.center).setLength(e.radius),this.expandByPoint(Ts.copy(e.center).add(Es)),this.expandByPoint(Ts.copy(e.center).sub(Es))),this)}equals(e){return e.center.equals(this.center)&&e.radius===this.radius}clone(){return new this.constructor().copy(this)}},Os=new G,ks=new G,As=new G,js=new G,Ms=new G,Ns=new G,Ps=new G,Fs=class{constructor(e=new G,t=new G(0,0,-1)){this.origin=e,this.direction=t}set(e,t){return this.origin.copy(e),this.direction.copy(t),this}copy(e){return this.origin.copy(e.origin),this.direction.copy(e.direction),this}at(e,t){return t.copy(this.origin).addScaledVector(this.direction,e)}lookAt(e){return this.direction.copy(e).sub(this.origin).normalize(),this}recast(e){return this.origin.copy(this.at(e,Os)),this}closestPointToPoint(e,t){t.subVectors(e,this.origin);let n=t.dot(this.direction);return n<0?t.copy(this.origin):t.copy(this.origin).addScaledVector(this.direction,n)}distanceToPoint(e){return Math.sqrt(this.distanceSqToPoint(e))}distanceSqToPoint(e){let t=Os.subVectors(e,this.origin).dot(this.direction);return t<0?this.origin.distanceToSquared(e):(Os.copy(this.origin).addScaledVector(this.direction,t),Os.distanceToSquared(e))}distanceSqToSegment(e,t,n,r){ks.copy(e).add(t).multiplyScalar(.5),As.copy(t).sub(e).normalize(),js.copy(this.origin).sub(ks);let i=e.distanceTo(t)*.5,a=-this.direction.dot(As),o=js.dot(this.direction),s=-js.dot(As),c=js.lengthSq(),l=Math.abs(1-a*a),u,d,f,p;if(l>0){if(u=a*s-o,d=a*o-s,p=i*l,u>=0){if(d>=-p){if(d<=p){let e=1/l;u*=e,d*=e,f=u*(u+a*d+2*o)+d*(a*u+d+2*s)+c}else d=i,u=Math.max(0,-(a*d+o)),f=-u*u+d*(d+2*s)+c}else d=-i,u=Math.max(0,-(a*d+o)),f=-u*u+d*(d+2*s)+c}else d<=-p?(u=Math.max(0,-(-a*i+o)),d=u>0?-i:Math.min(Math.max(-i,-s),i),f=-u*u+d*(d+2*s)+c):d<=p?(u=0,d=Math.min(Math.max(-i,-s),i),f=d*(d+2*s)+c):(u=Math.max(0,-(a*i+o)),d=u>0?i:Math.min(Math.max(-i,-s),i),f=-u*u+d*(d+2*s)+c)}else d=a>0?-i:i,u=Math.max(0,-(a*d+o)),f=-u*u+d*(d+2*s)+c;return n&&n.copy(this.origin).addScaledVector(this.direction,u),r&&r.copy(ks).addScaledVector(As,d),f}intersectSphere(e,t){Os.subVectors(e.center,this.origin);let n=Os.dot(this.direction),r=Os.dot(Os)-n*n,i=e.radius*e.radius;if(r>i)return null;let a=Math.sqrt(i-r),o=n-a,s=n+a;return s<0?null:o<0?this.at(s,t):this.at(o,t)}intersectsSphere(e){return this.distanceSqToPoint(e.center)<=e.radius*e.radius}distanceToPlane(e){let t=e.normal.dot(this.direction);if(t===0)return e.distanceToPoint(this.origin)===0?0:null;let n=-(this.origin.dot(e.normal)+e.constant)/t;return n>=0?n:null}intersectPlane(e,t){let n=this.distanceToPlane(e);return n===null?null:this.at(n,t)}intersectsPlane(e){let t=e.distanceToPoint(this.origin);return t===0||e.normal.dot(this.direction)*t<0}intersectBox(e,t){let n,r,i,a,o,s,c=1/this.direction.x,l=1/this.direction.y,u=1/this.direction.z,d=this.origin;return c>=0?(n=(e.min.x-d.x)*c,r=(e.max.x-d.x)*c):(n=(e.max.x-d.x)*c,r=(e.min.x-d.x)*c),l>=0?(i=(e.min.y-d.y)*l,a=(e.max.y-d.y)*l):(i=(e.max.y-d.y)*l,a=(e.min.y-d.y)*l),n>a||i>r||((i>n||isNaN(n))&&(n=i),(a<r||isNaN(r))&&(r=a),u>=0?(o=(e.min.z-d.z)*u,s=(e.max.z-d.z)*u):(o=(e.max.z-d.z)*u,s=(e.min.z-d.z)*u),n>s||o>r)||((o>n||n!==n)&&(n=o),(s<r||r!==r)&&(r=s),r<0)?null:this.at(n>=0?n:r,t)}intersectsBox(e){return this.intersectBox(e,Os)!==null}intersectTriangle(e,t,n,r,i){Ms.subVectors(t,e),Ns.subVectors(n,e),Ps.crossVectors(Ms,Ns);let a=this.direction.dot(Ps),o;if(a>0){if(r)return null;o=1}else if(a<0)o=-1,a=-a;else return null;js.subVectors(this.origin,e);let s=o*this.direction.dot(Ns.crossVectors(js,Ns));if(s<0)return null;let c=o*this.direction.dot(Ms.cross(js));if(c<0||s+c>a)return null;let l=-o*js.dot(Ps);return l<0?null:this.at(l/a,i)}applyMatrix4(e){return this.origin.applyMatrix4(e),this.direction.transformDirection(e),this}equals(e){return e.origin.equals(this.origin)&&e.direction.equals(this.direction)}clone(){return new this.constructor().copy(this)}},Is=class e{constructor(t,n,r,i,a,o,s,c,l,u,d,f,p,m,h,g){e.prototype.isMatrix4=!0,this.elements=[1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1],t!==void 0&&this.set(t,n,r,i,a,o,s,c,l,u,d,f,p,m,h,g)}set(e,t,n,r,i,a,o,s,c,l,u,d,f,p,m,h){let g=this.elements;return g[0]=e,g[4]=t,g[8]=n,g[12]=r,g[1]=i,g[5]=a,g[9]=o,g[13]=s,g[2]=c,g[6]=l,g[10]=u,g[14]=d,g[3]=f,g[7]=p,g[11]=m,g[15]=h,this}identity(){return this.set(1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1),this}clone(){return new e().fromArray(this.elements)}copy(e){let t=this.elements,n=e.elements;return t[0]=n[0],t[1]=n[1],t[2]=n[2],t[3]=n[3],t[4]=n[4],t[5]=n[5],t[6]=n[6],t[7]=n[7],t[8]=n[8],t[9]=n[9],t[10]=n[10],t[11]=n[11],t[12]=n[12],t[13]=n[13],t[14]=n[14],t[15]=n[15],this}copyPosition(e){let t=this.elements,n=e.elements;return t[12]=n[12],t[13]=n[13],t[14]=n[14],this}setFromMatrix3(e){let t=e.elements;return this.set(t[0],t[3],t[6],0,t[1],t[4],t[7],0,t[2],t[5],t[8],0,0,0,0,1),this}extractBasis(e,t,n){return e.setFromMatrixColumn(this,0),t.setFromMatrixColumn(this,1),n.setFromMatrixColumn(this,2),this}makeBasis(e,t,n){return this.set(e.x,t.x,n.x,0,e.y,t.y,n.y,0,e.z,t.z,n.z,0,0,0,0,1),this}extractRotation(e){let t=this.elements,n=e.elements,r=1/Ls.setFromMatrixColumn(e,0).length(),i=1/Ls.setFromMatrixColumn(e,1).length(),a=1/Ls.setFromMatrixColumn(e,2).length();return t[0]=n[0]*r,t[1]=n[1]*r,t[2]=n[2]*r,t[3]=0,t[4]=n[4]*i,t[5]=n[5]*i,t[6]=n[6]*i,t[7]=0,t[8]=n[8]*a,t[9]=n[9]*a,t[10]=n[10]*a,t[11]=0,t[12]=0,t[13]=0,t[14]=0,t[15]=1,this}makeRotationFromEuler(e){let t=this.elements,n=e.x,r=e.y,i=e.z,a=Math.cos(n),o=Math.sin(n),s=Math.cos(r),c=Math.sin(r),l=Math.cos(i),u=Math.sin(i);if(e.order===`XYZ`){let e=a*l,n=a*u,r=o*l,i=o*u;t[0]=s*l,t[4]=-s*u,t[8]=c,t[1]=n+r*c,t[5]=e-i*c,t[9]=-o*s,t[2]=i-e*c,t[6]=r+n*c,t[10]=a*s}else if(e.order===`YXZ`){let e=s*l,n=s*u,r=c*l,i=c*u;t[0]=e+i*o,t[4]=r*o-n,t[8]=a*c,t[1]=a*u,t[5]=a*l,t[9]=-o,t[2]=n*o-r,t[6]=i+e*o,t[10]=a*s}else if(e.order===`ZXY`){let e=s*l,n=s*u,r=c*l,i=c*u;t[0]=e-i*o,t[4]=-a*u,t[8]=r+n*o,t[1]=n+r*o,t[5]=a*l,t[9]=i-e*o,t[2]=-a*c,t[6]=o,t[10]=a*s}else if(e.order===`ZYX`){let e=a*l,n=a*u,r=o*l,i=o*u;t[0]=s*l,t[4]=r*c-n,t[8]=e*c+i,t[1]=s*u,t[5]=i*c+e,t[9]=n*c-r,t[2]=-c,t[6]=o*s,t[10]=a*s}else if(e.order===`YZX`){let e=a*s,n=a*c,r=o*s,i=o*c;t[0]=s*l,t[4]=i-e*u,t[8]=r*u+n,t[1]=u,t[5]=a*l,t[9]=-o*l,t[2]=-c*l,t[6]=n*u+r,t[10]=e-i*u}else if(e.order===`XZY`){let e=a*s,n=a*c,r=o*s,i=o*c;t[0]=s*l,t[4]=-u,t[8]=c*l,t[1]=e*u+i,t[5]=a*l,t[9]=n*u-r,t[2]=r*u-n,t[6]=o*l,t[10]=i*u+e}return t[3]=0,t[7]=0,t[11]=0,t[12]=0,t[13]=0,t[14]=0,t[15]=1,this}makeRotationFromQuaternion(e){return this.compose(zs,e,Bs)}lookAt(e,t,n){let r=this.elements;return Us.subVectors(e,t),Us.lengthSq()===0&&(Us.z=1),Us.normalize(),Vs.crossVectors(n,Us),Vs.lengthSq()===0&&(Math.abs(n.z)===1?Us.x+=1e-4:Us.z+=1e-4,Us.normalize(),Vs.crossVectors(n,Us)),Vs.normalize(),Hs.crossVectors(Us,Vs),r[0]=Vs.x,r[4]=Hs.x,r[8]=Us.x,r[1]=Vs.y,r[5]=Hs.y,r[9]=Us.y,r[2]=Vs.z,r[6]=Hs.z,r[10]=Us.z,this}multiply(e){return this.multiplyMatrices(this,e)}premultiply(e){return this.multiplyMatrices(e,this)}multiplyMatrices(e,t){let n=e.elements,r=t.elements,i=this.elements,a=n[0],o=n[4],s=n[8],c=n[12],l=n[1],u=n[5],d=n[9],f=n[13],p=n[2],m=n[6],h=n[10],g=n[14],_=n[3],v=n[7],y=n[11],b=n[15],x=r[0],S=r[4],C=r[8],w=r[12],T=r[1],E=r[5],D=r[9],O=r[13],k=r[2],A=r[6],j=r[10],M=r[14],N=r[3],P=r[7],ee=r[11],te=r[15];return i[0]=a*x+o*T+s*k+c*N,i[4]=a*S+o*E+s*A+c*P,i[8]=a*C+o*D+s*j+c*ee,i[12]=a*w+o*O+s*M+c*te,i[1]=l*x+u*T+d*k+f*N,i[5]=l*S+u*E+d*A+f*P,i[9]=l*C+u*D+d*j+f*ee,i[13]=l*w+u*O+d*M+f*te,i[2]=p*x+m*T+h*k+g*N,i[6]=p*S+m*E+h*A+g*P,i[10]=p*C+m*D+h*j+g*ee,i[14]=p*w+m*O+h*M+g*te,i[3]=_*x+v*T+y*k+b*N,i[7]=_*S+v*E+y*A+b*P,i[11]=_*C+v*D+y*j+b*ee,i[15]=_*w+v*O+y*M+b*te,this}multiplyScalar(e){let t=this.elements;return t[0]*=e,t[4]*=e,t[8]*=e,t[12]*=e,t[1]*=e,t[5]*=e,t[9]*=e,t[13]*=e,t[2]*=e,t[6]*=e,t[10]*=e,t[14]*=e,t[3]*=e,t[7]*=e,t[11]*=e,t[15]*=e,this}determinant(){let e=this.elements,t=e[0],n=e[4],r=e[8],i=e[12],a=e[1],o=e[5],s=e[9],c=e[13],l=e[2],u=e[6],d=e[10],f=e[14],p=e[3],m=e[7],h=e[11],g=e[15];return p*(+i*s*u-r*c*u-i*o*d+n*c*d+r*o*f-n*s*f)+m*(+t*s*f-t*c*d+i*a*d-r*a*f+r*c*l-i*s*l)+h*(+t*c*u-t*o*f-i*a*u+n*a*f+i*o*l-n*c*l)+g*(-r*o*l-t*s*u+t*o*d+r*a*u-n*a*d+n*s*l)}transpose(){let e=this.elements,t;return t=e[1],e[1]=e[4],e[4]=t,t=e[2],e[2]=e[8],e[8]=t,t=e[6],e[6]=e[9],e[9]=t,t=e[3],e[3]=e[12],e[12]=t,t=e[7],e[7]=e[13],e[13]=t,t=e[11],e[11]=e[14],e[14]=t,this}setPosition(e,t,n){let r=this.elements;return e.isVector3?(r[12]=e.x,r[13]=e.y,r[14]=e.z):(r[12]=e,r[13]=t,r[14]=n),this}invert(){let e=this.elements,t=e[0],n=e[1],r=e[2],i=e[3],a=e[4],o=e[5],s=e[6],c=e[7],l=e[8],u=e[9],d=e[10],f=e[11],p=e[12],m=e[13],h=e[14],g=e[15],_=u*h*c-m*d*c+m*s*f-o*h*f-u*s*g+o*d*g,v=p*d*c-l*h*c-p*s*f+a*h*f+l*s*g-a*d*g,y=l*m*c-p*u*c+p*o*f-a*m*f-l*o*g+a*u*g,b=p*u*s-l*m*s-p*o*d+a*m*d+l*o*h-a*u*h,x=t*_+n*v+r*y+i*b;if(x===0)return this.set(0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0);let S=1/x;return e[0]=_*S,e[1]=(m*d*i-u*h*i-m*r*f+n*h*f+u*r*g-n*d*g)*S,e[2]=(o*h*i-m*s*i+m*r*c-n*h*c-o*r*g+n*s*g)*S,e[3]=(u*s*i-o*d*i-u*r*c+n*d*c+o*r*f-n*s*f)*S,e[4]=v*S,e[5]=(l*h*i-p*d*i+p*r*f-t*h*f-l*r*g+t*d*g)*S,e[6]=(p*s*i-a*h*i-p*r*c+t*h*c+a*r*g-t*s*g)*S,e[7]=(a*d*i-l*s*i+l*r*c-t*d*c-a*r*f+t*s*f)*S,e[8]=y*S,e[9]=(p*u*i-l*m*i-p*n*f+t*m*f+l*n*g-t*u*g)*S,e[10]=(a*m*i-p*o*i+p*n*c-t*m*c-a*n*g+t*o*g)*S,e[11]=(l*o*i-a*u*i-l*n*c+t*u*c+a*n*f-t*o*f)*S,e[12]=b*S,e[13]=(l*m*r-p*u*r+p*n*d-t*m*d-l*n*h+t*u*h)*S,e[14]=(p*o*r-a*m*r-p*n*s+t*m*s+a*n*h-t*o*h)*S,e[15]=(a*u*r-l*o*r+l*n*s-t*u*s-a*n*d+t*o*d)*S,this}scale(e){let t=this.elements,n=e.x,r=e.y,i=e.z;return t[0]*=n,t[4]*=r,t[8]*=i,t[1]*=n,t[5]*=r,t[9]*=i,t[2]*=n,t[6]*=r,t[10]*=i,t[3]*=n,t[7]*=r,t[11]*=i,this}getMaxScaleOnAxis(){let e=this.elements,t=e[0]*e[0]+e[1]*e[1]+e[2]*e[2],n=e[4]*e[4]+e[5]*e[5]+e[6]*e[6],r=e[8]*e[8]+e[9]*e[9]+e[10]*e[10];return Math.sqrt(Math.max(t,n,r))}makeTranslation(e,t,n){return e.isVector3?this.set(1,0,0,e.x,0,1,0,e.y,0,0,1,e.z,0,0,0,1):this.set(1,0,0,e,0,1,0,t,0,0,1,n,0,0,0,1),this}makeRotationX(e){let t=Math.cos(e),n=Math.sin(e);return this.set(1,0,0,0,0,t,-n,0,0,n,t,0,0,0,0,1),this}makeRotationY(e){let t=Math.cos(e),n=Math.sin(e);return this.set(t,0,n,0,0,1,0,0,-n,0,t,0,0,0,0,1),this}makeRotationZ(e){let t=Math.cos(e),n=Math.sin(e);return this.set(t,-n,0,0,n,t,0,0,0,0,1,0,0,0,0,1),this}makeRotationAxis(e,t){let n=Math.cos(t),r=Math.sin(t),i=1-n,a=e.x,o=e.y,s=e.z,c=i*a,l=i*o;return this.set(c*a+n,c*o-r*s,c*s+r*o,0,c*o+r*s,l*o+n,l*s-r*a,0,c*s-r*o,l*s+r*a,i*s*s+n,0,0,0,0,1),this}makeScale(e,t,n){return this.set(e,0,0,0,0,t,0,0,0,0,n,0,0,0,0,1),this}makeShear(e,t,n,r,i,a){return this.set(1,n,i,0,e,1,a,0,t,r,1,0,0,0,0,1),this}compose(e,t,n){let r=this.elements,i=t._x,a=t._y,o=t._z,s=t._w,c=i+i,l=a+a,u=o+o,d=i*c,f=i*l,p=i*u,m=a*l,h=a*u,g=o*u,_=s*c,v=s*l,y=s*u,b=n.x,x=n.y,S=n.z;return r[0]=(1-(m+g))*b,r[1]=(f+y)*b,r[2]=(p-v)*b,r[3]=0,r[4]=(f-y)*x,r[5]=(1-(d+g))*x,r[6]=(h+_)*x,r[7]=0,r[8]=(p+v)*S,r[9]=(h-_)*S,r[10]=(1-(d+m))*S,r[11]=0,r[12]=e.x,r[13]=e.y,r[14]=e.z,r[15]=1,this}decompose(e,t,n){let r=this.elements,i=Ls.set(r[0],r[1],r[2]).length(),a=Ls.set(r[4],r[5],r[6]).length(),o=Ls.set(r[8],r[9],r[10]).length();this.determinant()<0&&(i=-i),e.x=r[12],e.y=r[13],e.z=r[14],Rs.copy(this);let s=1/i,c=1/a,l=1/o;return Rs.elements[0]*=s,Rs.elements[1]*=s,Rs.elements[2]*=s,Rs.elements[4]*=c,Rs.elements[5]*=c,Rs.elements[6]*=c,Rs.elements[8]*=l,Rs.elements[9]*=l,Rs.elements[10]*=l,t.setFromRotationMatrix(Rs),n.x=i,n.y=a,n.z=o,this}makePerspective(e,t,n,r,i,a,o=ro){let s=this.elements,c=2*i/(t-e),l=2*i/(n-r),u=(t+e)/(t-e),d=(n+r)/(n-r),f,p;if(o===2e3)f=-(a+i)/(a-i),p=-2*a*i/(a-i);else if(o===2001)f=-a/(a-i),p=-a*i/(a-i);else throw Error(`THREE.Matrix4.makePerspective(): Invalid coordinate system: `+o);return s[0]=c,s[4]=0,s[8]=u,s[12]=0,s[1]=0,s[5]=l,s[9]=d,s[13]=0,s[2]=0,s[6]=0,s[10]=f,s[14]=p,s[3]=0,s[7]=0,s[11]=-1,s[15]=0,this}makeOrthographic(e,t,n,r,i,a,o=ro){let s=this.elements,c=1/(t-e),l=1/(n-r),u=1/(a-i),d=(t+e)*c,f=(n+r)*l,p,m;if(o===2e3)p=(a+i)*u,m=-2*u;else if(o===2001)p=i*u,m=-1*u;else throw Error(`THREE.Matrix4.makeOrthographic(): Invalid coordinate system: `+o);return s[0]=2*c,s[4]=0,s[8]=0,s[12]=-d,s[1]=0,s[5]=2*l,s[9]=0,s[13]=-f,s[2]=0,s[6]=0,s[10]=m,s[14]=-p,s[3]=0,s[7]=0,s[11]=0,s[15]=1,this}equals(e){let t=this.elements,n=e.elements;for(let e=0;e<16;e++)if(t[e]!==n[e])return!1;return!0}fromArray(e,t=0){for(let n=0;n<16;n++)this.elements[n]=e[n+t];return this}toArray(e=[],t=0){let n=this.elements;return e[t]=n[0],e[t+1]=n[1],e[t+2]=n[2],e[t+3]=n[3],e[t+4]=n[4],e[t+5]=n[5],e[t+6]=n[6],e[t+7]=n[7],e[t+8]=n[8],e[t+9]=n[9],e[t+10]=n[10],e[t+11]=n[11],e[t+12]=n[12],e[t+13]=n[13],e[t+14]=n[14],e[t+15]=n[15],e}},Ls=new G,Rs=new Is,zs=new G(0,0,0),Bs=new G(1,1,1),Vs=new G,Hs=new G,Us=new G,Ws=new Is,Gs=new os,Ks=class e{constructor(t=0,n=0,r=0,i=e.DEFAULT_ORDER){this.isEuler=!0,this._x=t,this._y=n,this._z=r,this._order=i}get x(){return this._x}set x(e){this._x=e,this._onChangeCallback()}get y(){return this._y}set y(e){this._y=e,this._onChangeCallback()}get z(){return this._z}set z(e){this._z=e,this._onChangeCallback()}get order(){return this._order}set order(e){this._order=e,this._onChangeCallback()}set(e,t,n,r=this._order){return this._x=e,this._y=t,this._z=n,this._order=r,this._onChangeCallback(),this}clone(){return new this.constructor(this._x,this._y,this._z,this._order)}copy(e){return this._x=e._x,this._y=e._y,this._z=e._z,this._order=e._order,this._onChangeCallback(),this}setFromRotationMatrix(e,t=this._order,n=!0){let r=e.elements,i=r[0],a=r[4],o=r[8],s=r[1],c=r[5],l=r[9],u=r[2],d=r[6],f=r[10];switch(t){case`XYZ`:this._y=Math.asin(uo(o,-1,1)),Math.abs(o)<.9999999?(this._x=Math.atan2(-l,f),this._z=Math.atan2(-a,i)):(this._x=Math.atan2(d,c),this._z=0);break;case`YXZ`:this._x=Math.asin(-uo(l,-1,1)),Math.abs(l)<.9999999?(this._y=Math.atan2(o,f),this._z=Math.atan2(s,c)):(this._y=Math.atan2(-u,i),this._z=0);break;case`ZXY`:this._x=Math.asin(uo(d,-1,1)),Math.abs(d)<.9999999?(this._y=Math.atan2(-u,f),this._z=Math.atan2(-a,c)):(this._y=0,this._z=Math.atan2(s,i));break;case`ZYX`:this._y=Math.asin(-uo(u,-1,1)),Math.abs(u)<.9999999?(this._x=Math.atan2(d,f),this._z=Math.atan2(s,i)):(this._x=0,this._z=Math.atan2(-a,c));break;case`YZX`:this._z=Math.asin(uo(s,-1,1)),Math.abs(s)<.9999999?(this._x=Math.atan2(-l,c),this._y=Math.atan2(-u,i)):(this._x=0,this._y=Math.atan2(o,f));break;case`XZY`:this._z=Math.asin(-uo(a,-1,1)),Math.abs(a)<.9999999?(this._x=Math.atan2(d,c),this._y=Math.atan2(o,i)):(this._x=Math.atan2(-l,f),this._y=0);break;default:console.warn(`THREE.Euler: .setFromRotationMatrix() encountered an unknown order: `+t)}return this._order=t,n===!0&&this._onChangeCallback(),this}setFromQuaternion(e,t,n){return Ws.makeRotationFromQuaternion(e),this.setFromRotationMatrix(Ws,t,n)}setFromVector3(e,t=this._order){return this.set(e.x,e.y,e.z,t)}reorder(e){return Gs.setFromEuler(this),this.setFromQuaternion(Gs,e)}equals(e){return e._x===this._x&&e._y===this._y&&e._z===this._z&&e._order===this._order}fromArray(e){return this._x=e[0],this._y=e[1],this._z=e[2],e[3]!==void 0&&(this._order=e[3]),this._onChangeCallback(),this}toArray(e=[],t=0){return e[t]=this._x,e[t+1]=this._y,e[t+2]=this._z,e[t+3]=this._order,e}_onChange(e){return this._onChangeCallback=e,this}_onChangeCallback(){}*[Symbol.iterator](){yield this._x,yield this._y,yield this._z,yield this._order}};Ks.DEFAULT_ORDER=`XYZ`;var qs=class{constructor(){this.mask=1}set(e){this.mask=1<<e>>>0}enable(e){this.mask|=1<<e}enableAll(){this.mask=-1}toggle(e){this.mask^=1<<e}disable(e){this.mask&=~(1<<e)}disableAll(){this.mask=0}test(e){return(this.mask&e.mask)!==0}isEnabled(e){return!!(this.mask&1<<e)}},Js=0,Ys=new G,Xs=new os,Zs=new Is,Qs=new G,$s=new G,ec=new G,tc=new os,nc=new G(1,0,0),rc=new G(0,1,0),ic=new G(0,0,1),ac={type:`added`},oc={type:`removed`},sc={type:`childadded`,child:null},cc={type:`childremoved`,child:null},lc=class e extends io{constructor(){super(),this.isObject3D=!0,Object.defineProperty(this,"id",{value:Js++}),this.uuid=lo(),this.name=``,this.type=`Object3D`,this.parent=null,this.children=[],this.up=e.DEFAULT_UP.clone();let t=new G,n=new Ks,r=new os,i=new G(1,1,1);function a(){r.setFromEuler(n,!1)}function o(){n.setFromQuaternion(r,void 0,!1)}n._onChange(a),r._onChange(o),Object.defineProperties(this,{position:{configurable:!0,enumerable:!0,value:t},rotation:{configurable:!0,enumerable:!0,value:n},quaternion:{configurable:!0,enumerable:!0,value:r},scale:{configurable:!0,enumerable:!0,value:i},modelViewMatrix:{value:new Is},normalMatrix:{value:new U}}),this.matrix=new Is,this.matrixWorld=new Is,this.matrixAutoUpdate=e.DEFAULT_MATRIX_AUTO_UPDATE,this.matrixWorldAutoUpdate=e.DEFAULT_MATRIX_WORLD_AUTO_UPDATE,this.matrixWorldNeedsUpdate=!1,this.layers=new qs,this.visible=!0,this.castShadow=!1,this.receiveShadow=!1,this.frustumCulled=!0,this.renderOrder=0,this.animations=[],this.userData={}}onBeforeShadow(){}onAfterShadow(){}onBeforeRender(){}onAfterRender(){}applyMatrix4(e){this.matrixAutoUpdate&&this.updateMatrix(),this.matrix.premultiply(e),this.matrix.decompose(this.position,this.quaternion,this.scale)}applyQuaternion(e){return this.quaternion.premultiply(e),this}setRotationFromAxisAngle(e,t){this.quaternion.setFromAxisAngle(e,t)}setRotationFromEuler(e){this.quaternion.setFromEuler(e,!0)}setRotationFromMatrix(e){this.quaternion.setFromRotationMatrix(e)}setRotationFromQuaternion(e){this.quaternion.copy(e)}rotateOnAxis(e,t){return Xs.setFromAxisAngle(e,t),this.quaternion.multiply(Xs),this}rotateOnWorldAxis(e,t){return Xs.setFromAxisAngle(e,t),this.quaternion.premultiply(Xs),this}rotateX(e){return this.rotateOnAxis(nc,e)}rotateY(e){return this.rotateOnAxis(rc,e)}rotateZ(e){return this.rotateOnAxis(ic,e)}translateOnAxis(e,t){return Ys.copy(e).applyQuaternion(this.quaternion),this.position.add(Ys.multiplyScalar(t)),this}translateX(e){return this.translateOnAxis(nc,e)}translateY(e){return this.translateOnAxis(rc,e)}translateZ(e){return this.translateOnAxis(ic,e)}localToWorld(e){return this.updateWorldMatrix(!0,!1),e.applyMatrix4(this.matrixWorld)}worldToLocal(e){return this.updateWorldMatrix(!0,!1),e.applyMatrix4(Zs.copy(this.matrixWorld).invert())}lookAt(e,t,n){e.isVector3?Qs.copy(e):Qs.set(e,t,n);let r=this.parent;this.updateWorldMatrix(!0,!1),$s.setFromMatrixPosition(this.matrixWorld),this.isCamera||this.isLight?Zs.lookAt($s,Qs,this.up):Zs.lookAt(Qs,$s,this.up),this.quaternion.setFromRotationMatrix(Zs),r&&(Zs.extractRotation(r.matrixWorld),Xs.setFromRotationMatrix(Zs),this.quaternion.premultiply(Xs.invert()))}add(e){if(arguments.length>1){for(let e=0;e<arguments.length;e++)this.add(arguments[e]);return this}return e===this?(console.error(`THREE.Object3D.add: object can't be added as a child of itself.`,e),this):(e&&e.isObject3D?(e.removeFromParent(),e.parent=this,this.children.push(e),e.dispatchEvent(ac),sc.child=e,this.dispatchEvent(sc),sc.child=null):console.error(`THREE.Object3D.add: object not an instance of THREE.Object3D.`,e),this)}remove(e){if(arguments.length>1){for(let e=0;e<arguments.length;e++)this.remove(arguments[e]);return this}let t=this.children.indexOf(e);return t!==-1&&(e.parent=null,this.children.splice(t,1),e.dispatchEvent(oc),cc.child=e,this.dispatchEvent(cc),cc.child=null),this}removeFromParent(){let e=this.parent;return e!==null&&e.remove(this),this}clear(){return this.remove(...this.children)}attach(e){return this.updateWorldMatrix(!0,!1),Zs.copy(this.matrixWorld).invert(),e.parent!==null&&(e.parent.updateWorldMatrix(!0,!1),Zs.multiply(e.parent.matrixWorld)),e.applyMatrix4(Zs),e.removeFromParent(),e.parent=this,this.children.push(e),e.updateWorldMatrix(!1,!0),e.dispatchEvent(ac),sc.child=e,this.dispatchEvent(sc),sc.child=null,this}getObjectById(e){return this.getObjectByProperty(`id`,e)}getObjectByName(e){return this.getObjectByProperty(`name`,e)}getObjectByProperty(e,t){if(this[e]===t)return this;for(let n=0,r=this.children.length;n<r;n++){let r=this.children[n].getObjectByProperty(e,t);if(r!==void 0)return r}}getObjectsByProperty(e,t,n=[]){this[e]===t&&n.push(this);let r=this.children;for(let i=0,a=r.length;i<a;i++)r[i].getObjectsByProperty(e,t,n);return n}getWorldPosition(e){return this.updateWorldMatrix(!0,!1),e.setFromMatrixPosition(this.matrixWorld)}getWorldQuaternion(e){return this.updateWorldMatrix(!0,!1),this.matrixWorld.decompose($s,e,ec),e}getWorldScale(e){return this.updateWorldMatrix(!0,!1),this.matrixWorld.decompose($s,tc,e),e}getWorldDirection(e){this.updateWorldMatrix(!0,!1);let t=this.matrixWorld.elements;return e.set(t[8],t[9],t[10]).normalize()}raycast(){}traverse(e){e(this);let t=this.children;for(let n=0,r=t.length;n<r;n++)t[n].traverse(e)}traverseVisible(e){if(this.visible===!1)return;e(this);let t=this.children;for(let n=0,r=t.length;n<r;n++)t[n].traverseVisible(e)}traverseAncestors(e){let t=this.parent;t!==null&&(e(t),t.traverseAncestors(e))}updateMatrix(){this.matrix.compose(this.position,this.quaternion,this.scale),this.matrixWorldNeedsUpdate=!0}updateMatrixWorld(e){this.matrixAutoUpdate&&this.updateMatrix(),(this.matrixWorldNeedsUpdate||e)&&(this.matrixWorldAutoUpdate===!0&&(this.parent===null?this.matrixWorld.copy(this.matrix):this.matrixWorld.multiplyMatrices(this.parent.matrixWorld,this.matrix)),this.matrixWorldNeedsUpdate=!1,e=!0);let t=this.children;for(let n=0,r=t.length;n<r;n++)t[n].updateMatrixWorld(e)}updateWorldMatrix(e,t){let n=this.parent;if(e===!0&&n!==null&&n.updateWorldMatrix(!0,!1),this.matrixAutoUpdate&&this.updateMatrix(),this.matrixWorldAutoUpdate===!0&&(this.parent===null?this.matrixWorld.copy(this.matrix):this.matrixWorld.multiplyMatrices(this.parent.matrixWorld,this.matrix)),t===!0){let e=this.children;for(let t=0,n=e.length;t<n;t++)e[t].updateWorldMatrix(!1,!0)}}toJSON(e){let t=e===void 0||typeof e==`string`,n={};t&&(e={geometries:{},materials:{},textures:{},images:{},shapes:{},skeletons:{},animations:{},nodes:{}},n.metadata={version:4.6,type:`Object`,generator:`Object3D.toJSON`});let r={};r.uuid=this.uuid,r.type=this.type,this.name!==``&&(r.name=this.name),this.castShadow===!0&&(r.castShadow=!0),this.receiveShadow===!0&&(r.receiveShadow=!0),this.visible===!1&&(r.visible=!1),this.frustumCulled===!1&&(r.frustumCulled=!1),this.renderOrder!==0&&(r.renderOrder=this.renderOrder),Object.keys(this.userData).length>0&&(r.userData=this.userData),r.layers=this.layers.mask,r.matrix=this.matrix.toArray(),r.up=this.up.toArray(),this.matrixAutoUpdate===!1&&(r.matrixAutoUpdate=!1),this.isInstancedMesh&&(r.type=`InstancedMesh`,r.count=this.count,r.instanceMatrix=this.instanceMatrix.toJSON(),this.instanceColor!==null&&(r.instanceColor=this.instanceColor.toJSON())),this.isBatchedMesh&&(r.type=`BatchedMesh`,r.perObjectFrustumCulled=this.perObjectFrustumCulled,r.sortObjects=this.sortObjects,r.drawRanges=this._drawRanges,r.reservedRanges=this._reservedRanges,r.visibility=this._visibility,r.active=this._active,r.bounds=this._bounds.map(e=>({boxInitialized:e.boxInitialized,boxMin:e.box.min.toArray(),boxMax:e.box.max.toArray(),sphereInitialized:e.sphereInitialized,sphereRadius:e.sphere.radius,sphereCenter:e.sphere.center.toArray()})),r.maxInstanceCount=this._maxInstanceCount,r.maxVertexCount=this._maxVertexCount,r.maxIndexCount=this._maxIndexCount,r.geometryInitialized=this._geometryInitialized,r.geometryCount=this._geometryCount,r.matricesTexture=this._matricesTexture.toJSON(e),this._colorsTexture!==null&&(r.colorsTexture=this._colorsTexture.toJSON(e)),this.boundingSphere!==null&&(r.boundingSphere={center:r.boundingSphere.center.toArray(),radius:r.boundingSphere.radius}),this.boundingBox!==null&&(r.boundingBox={min:r.boundingBox.min.toArray(),max:r.boundingBox.max.toArray()}));function i(t,n){return t[n.uuid]===void 0&&(t[n.uuid]=n.toJSON(e)),n.uuid}if(this.isScene)this.background&&(this.background.isColor?r.background=this.background.toJSON():this.background.isTexture&&(r.background=this.background.toJSON(e).uuid)),this.environment&&this.environment.isTexture&&this.environment.isRenderTargetTexture!==!0&&(r.environment=this.environment.toJSON(e).uuid);else if(this.isMesh||this.isLine||this.isPoints){r.geometry=i(e.geometries,this.geometry);let t=this.geometry.parameters;if(t!==void 0&&t.shapes!==void 0){let n=t.shapes;if(Array.isArray(n))for(let t=0,r=n.length;t<r;t++){let r=n[t];i(e.shapes,r)}else i(e.shapes,n)}}if(this.isSkinnedMesh&&(r.bindMode=this.bindMode,r.bindMatrix=this.bindMatrix.toArray(),this.skeleton!==void 0&&(i(e.skeletons,this.skeleton),r.skeleton=this.skeleton.uuid)),this.material!==void 0){if(Array.isArray(this.material)){let t=[];for(let n=0,r=this.material.length;n<r;n++)t.push(i(e.materials,this.material[n]));r.material=t}else r.material=i(e.materials,this.material)}if(this.children.length>0){r.children=[];for(let t=0;t<this.children.length;t++)r.children.push(this.children[t].toJSON(e).object)}if(this.animations.length>0){r.animations=[];for(let t=0;t<this.animations.length;t++){let n=this.animations[t];r.animations.push(i(e.animations,n))}}if(t){let t=a(e.geometries),r=a(e.materials),i=a(e.textures),o=a(e.images),s=a(e.shapes),c=a(e.skeletons),l=a(e.animations),u=a(e.nodes);t.length>0&&(n.geometries=t),r.length>0&&(n.materials=r),i.length>0&&(n.textures=i),o.length>0&&(n.images=o),s.length>0&&(n.shapes=s),c.length>0&&(n.skeletons=c),l.length>0&&(n.animations=l),u.length>0&&(n.nodes=u)}return n.object=r,n;function a(e){let t=[];for(let n in e){let r=e[n];delete r.metadata,t.push(r)}return t}}clone(e){return new this.constructor().copy(this,e)}copy(e,t=!0){if(this.name=e.name,this.up.copy(e.up),this.position.copy(e.position),this.rotation.order=e.rotation.order,this.quaternion.copy(e.quaternion),this.scale.copy(e.scale),this.matrix.copy(e.matrix),this.matrixWorld.copy(e.matrixWorld),this.matrixAutoUpdate=e.matrixAutoUpdate,this.matrixWorldAutoUpdate=e.matrixWorldAutoUpdate,this.matrixWorldNeedsUpdate=e.matrixWorldNeedsUpdate,this.layers.mask=e.layers.mask,this.visible=e.visible,this.castShadow=e.castShadow,this.receiveShadow=e.receiveShadow,this.frustumCulled=e.frustumCulled,this.renderOrder=e.renderOrder,this.animations=e.animations.slice(),this.userData=JSON.parse(JSON.stringify(e.userData)),t===!0)for(let t=0;t<e.children.length;t++){let n=e.children[t];this.add(n.clone())}return this}};lc.DEFAULT_UP=new G(0,1,0),lc.DEFAULT_MATRIX_AUTO_UPDATE=!0,lc.DEFAULT_MATRIX_WORLD_AUTO_UPDATE=!0;var uc=new G,dc=new G,fc=new G,pc=new G,mc=new G,hc=new G,gc=new G,_c=new G,vc=new G,yc=new G,bc=new ts,xc=new ts,Sc=new ts,Cc=class e{constructor(e=new G,t=new G,n=new G){this.a=e,this.b=t,this.c=n}static getNormal(e,t,n,r){r.subVectors(n,t),uc.subVectors(e,t),r.cross(uc);let i=r.lengthSq();return i>0?r.multiplyScalar(1/Math.sqrt(i)):r.set(0,0,0)}static getBarycoord(e,t,n,r,i){uc.subVectors(r,t),dc.subVectors(n,t),fc.subVectors(e,t);let a=uc.dot(uc),o=uc.dot(dc),s=uc.dot(fc),c=dc.dot(dc),l=dc.dot(fc),u=a*c-o*o;if(u===0)return i.set(0,0,0),null;let d=1/u,f=(c*s-o*l)*d,p=(a*l-o*s)*d;return i.set(1-f-p,p,f)}static containsPoint(e,t,n,r){return this.getBarycoord(e,t,n,r,pc)!==null&&pc.x>=0&&pc.y>=0&&pc.x+pc.y<=1}static getInterpolation(e,t,n,r,i,a,o,s){return this.getBarycoord(e,t,n,r,pc)===null?(s.x=0,s.y=0,`z`in s&&(s.z=0),`w`in s&&(s.w=0),null):(s.setScalar(0),s.addScaledVector(i,pc.x),s.addScaledVector(a,pc.y),s.addScaledVector(o,pc.z),s)}static getInterpolatedAttribute(e,t,n,r,i,a){return bc.setScalar(0),xc.setScalar(0),Sc.setScalar(0),bc.fromBufferAttribute(e,t),xc.fromBufferAttribute(e,n),Sc.fromBufferAttribute(e,r),a.setScalar(0),a.addScaledVector(bc,i.x),a.addScaledVector(xc,i.y),a.addScaledVector(Sc,i.z),a}static isFrontFacing(e,t,n,r){return uc.subVectors(n,t),dc.subVectors(e,t),uc.cross(dc).dot(r)<0}set(e,t,n){return this.a.copy(e),this.b.copy(t),this.c.copy(n),this}setFromPointsAndIndices(e,t,n,r){return this.a.copy(e[t]),this.b.copy(e[n]),this.c.copy(e[r]),this}setFromAttributeAndIndices(e,t,n,r){return this.a.fromBufferAttribute(e,t),this.b.fromBufferAttribute(e,n),this.c.fromBufferAttribute(e,r),this}clone(){return new this.constructor().copy(this)}copy(e){return this.a.copy(e.a),this.b.copy(e.b),this.c.copy(e.c),this}getArea(){return uc.subVectors(this.c,this.b),dc.subVectors(this.a,this.b),uc.cross(dc).length()*.5}getMidpoint(e){return e.addVectors(this.a,this.b).add(this.c).multiplyScalar(1/3)}getNormal(t){return e.getNormal(this.a,this.b,this.c,t)}getPlane(e){return e.setFromCoplanarPoints(this.a,this.b,this.c)}getBarycoord(t,n){return e.getBarycoord(t,this.a,this.b,this.c,n)}getInterpolation(t,n,r,i,a){return e.getInterpolation(t,this.a,this.b,this.c,n,r,i,a)}containsPoint(t){return e.containsPoint(t,this.a,this.b,this.c)}isFrontFacing(t){return e.isFrontFacing(this.a,this.b,this.c,t)}intersectsBox(e){return e.intersectsTriangle(this)}closestPointToPoint(e,t){let n=this.a,r=this.b,i=this.c,a,o;mc.subVectors(r,n),hc.subVectors(i,n),_c.subVectors(e,n);let s=mc.dot(_c),c=hc.dot(_c);if(s<=0&&c<=0)return t.copy(n);vc.subVectors(e,r);let l=mc.dot(vc),u=hc.dot(vc);if(l>=0&&u<=l)return t.copy(r);let d=s*u-l*c;if(d<=0&&s>=0&&l<=0)return a=s/(s-l),t.copy(n).addScaledVector(mc,a);yc.subVectors(e,i);let f=mc.dot(yc),p=hc.dot(yc);if(p>=0&&f<=p)return t.copy(i);let m=f*c-s*p;if(m<=0&&c>=0&&p<=0)return o=c/(c-p),t.copy(n).addScaledVector(hc,o);let h=l*p-f*u;if(h<=0&&u-l>=0&&f-p>=0)return gc.subVectors(i,r),o=(u-l)/(u-l+(f-p)),t.copy(r).addScaledVector(gc,o);let g=1/(h+m+d);return a=m*g,o=d*g,t.copy(n).addScaledVector(mc,a).addScaledVector(hc,o)}equals(e){return e.a.equals(this.a)&&e.b.equals(this.b)&&e.c.equals(this.c)}},wc={aliceblue:15792383,antiquewhite:16444375,aqua:65535,aquamarine:8388564,azure:15794175,beige:16119260,bisque:16770244,black:0,blanchedalmond:16772045,blue:255,blueviolet:9055202,brown:10824234,burlywood:14596231,cadetblue:6266528,chartreuse:8388352,chocolate:13789470,coral:16744272,cornflowerblue:6591981,cornsilk:16775388,crimson:14423100,cyan:65535,darkblue:139,darkcyan:35723,darkgoldenrod:12092939,darkgray:11119017,darkgreen:25600,darkgrey:11119017,darkkhaki:12433259,darkmagenta:9109643,darkolivegreen:5597999,darkorange:16747520,darkorchid:10040012,darkred:9109504,darksalmon:15308410,darkseagreen:9419919,darkslateblue:4734347,darkslategray:3100495,darkslategrey:3100495,darkturquoise:52945,darkviolet:9699539,deeppink:16716947,deepskyblue:49151,dimgray:6908265,dimgrey:6908265,dodgerblue:2003199,firebrick:11674146,floralwhite:16775920,forestgreen:2263842,fuchsia:16711935,gainsboro:14474460,ghostwhite:16316671,gold:16766720,goldenrod:14329120,gray:8421504,green:32768,greenyellow:11403055,grey:8421504,honeydew:15794160,hotpink:16738740,indianred:13458524,indigo:4915330,ivory:16777200,khaki:15787660,lavender:15132410,lavenderblush:16773365,lawngreen:8190976,lemonchiffon:16775885,lightblue:11393254,lightcoral:15761536,lightcyan:14745599,lightgoldenrodyellow:16448210,lightgray:13882323,lightgreen:9498256,lightgrey:13882323,lightpink:16758465,lightsalmon:16752762,lightseagreen:2142890,lightskyblue:8900346,lightslategray:7833753,lightslategrey:7833753,lightsteelblue:11584734,lightyellow:16777184,lime:65280,limegreen:3329330,linen:16445670,magenta:16711935,maroon:8388608,mediumaquamarine:6737322,mediumblue:205,mediumorchid:12211667,mediumpurple:9662683,mediumseagreen:3978097,mediumslateblue:8087790,mediumspringgreen:64154,mediumturquoise:4772300,mediumvioletred:13047173,midnightblue:1644912,mintcream:16121850,mistyrose:16770273,moccasin:16770229,navajowhite:16768685,navy:128,oldlace:16643558,olive:8421376,olivedrab:7048739,orange:16753920,orangered:16729344,orchid:14315734,palegoldenrod:15657130,palegreen:10025880,paleturquoise:11529966,palevioletred:14381203,papayawhip:16773077,peachpuff:16767673,peru:13468991,pink:16761035,plum:14524637,powderblue:11591910,purple:8388736,rebeccapurple:6697881,red:16711680,rosybrown:12357519,royalblue:4286945,saddlebrown:9127187,salmon:16416882,sandybrown:16032864,seagreen:3050327,seashell:16774638,sienna:10506797,silver:12632256,skyblue:8900331,slateblue:6970061,slategray:7372944,slategrey:7372944,snow:16775930,springgreen:65407,steelblue:4620980,tan:13808780,teal:32896,thistle:14204888,tomato:16737095,turquoise:4251856,violet:15631086,wheat:16113331,white:16777215,whitesmoke:16119285,yellow:16776960,yellowgreen:10145074},Tc={h:0,s:0,l:0},Ec={h:0,s:0,l:0};function Dc(e,t,n){return n<0&&(n+=1),n>1&&--n,n<1/6?e+(t-e)*6*n:n<1/2?t:n<2/3?e+(t-e)*6*(2/3-n):e}var K=class{constructor(e,t,n){return this.isColor=!0,this.r=1,this.g=1,this.b=1,this.set(e,t,n)}set(e,t,n){if(t===void 0&&n===void 0){let t=e;t&&t.isColor?this.copy(t):typeof t==`number`?this.setHex(t):typeof t==`string`&&this.setStyle(t)}else this.setRGB(e,t,n);return this}setScalar(e){return this.r=e,this.g=e,this.b=e,this}setHex(e,t=Ja){return e=Math.floor(e),this.r=(e>>16&255)/255,this.g=(e>>8&255)/255,this.b=(e&255)/255,W.toWorkingColorSpace(this,t),this}setRGB(e,t,n,r=W.workingColorSpace){return this.r=e,this.g=t,this.b=n,W.toWorkingColorSpace(this,r),this}setHSL(e,t,n,r=W.workingColorSpace){if(e=fo(e,1),t=uo(t,0,1),n=uo(n,0,1),t===0)this.r=this.g=this.b=n;else{let r=n<=.5?n*(1+t):n+t-n*t,i=2*n-r;this.r=Dc(i,r,e+1/3),this.g=Dc(i,r,e),this.b=Dc(i,r,e-1/3)}return W.toWorkingColorSpace(this,r),this}setStyle(e,t=Ja){function n(t){t!==void 0&&parseFloat(t)<1&&console.warn(`THREE.Color: Alpha component of `+e+` will be ignored.`)}let r;if(r=/^(\w+)\(([^\)]*)\)/.exec(e)){let i,a=r[1],o=r[2];switch(a){case`rgb`:case`rgba`:if(i=/^\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(o))return n(i[4]),this.setRGB(Math.min(255,parseInt(i[1],10))/255,Math.min(255,parseInt(i[2],10))/255,Math.min(255,parseInt(i[3],10))/255,t);if(i=/^\s*(\d+)\%\s*,\s*(\d+)\%\s*,\s*(\d+)\%\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(o))return n(i[4]),this.setRGB(Math.min(100,parseInt(i[1],10))/100,Math.min(100,parseInt(i[2],10))/100,Math.min(100,parseInt(i[3],10))/100,t);break;case`hsl`:case`hsla`:if(i=/^\s*(\d*\.?\d+)\s*,\s*(\d*\.?\d+)\%\s*,\s*(\d*\.?\d+)\%\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(o))return n(i[4]),this.setHSL(parseFloat(i[1])/360,parseFloat(i[2])/100,parseFloat(i[3])/100,t);break;default:console.warn(`THREE.Color: Unknown color model `+e)}}else if(r=/^\#([A-Fa-f\d]+)$/.exec(e)){let n=r[1],i=n.length;if(i===3)return this.setRGB(parseInt(n.charAt(0),16)/15,parseInt(n.charAt(1),16)/15,parseInt(n.charAt(2),16)/15,t);if(i===6)return this.setHex(parseInt(n,16),t);console.warn(`THREE.Color: Invalid hex color `+e)}else if(e&&e.length>0)return this.setColorName(e,t);return this}setColorName(e,t=Ja){let n=wc[e.toLowerCase()];return n===void 0?console.warn(`THREE.Color: Unknown color `+e):this.setHex(n,t),this}clone(){return new this.constructor(this.r,this.g,this.b)}copy(e){return this.r=e.r,this.g=e.g,this.b=e.b,this}copySRGBToLinear(e){return this.r=Ko(e.r),this.g=Ko(e.g),this.b=Ko(e.b),this}copyLinearToSRGB(e){return this.r=qo(e.r),this.g=qo(e.g),this.b=qo(e.b),this}convertSRGBToLinear(){return this.copySRGBToLinear(this),this}convertLinearToSRGB(){return this.copyLinearToSRGB(this),this}getHex(e=Ja){return W.fromWorkingColorSpace(Oc.copy(this),e),Math.round(uo(Oc.r*255,0,255))*65536+Math.round(uo(Oc.g*255,0,255))*256+Math.round(uo(Oc.b*255,0,255))}getHexString(e=Ja){return(`000000`+this.getHex(e).toString(16)).slice(-6)}getHSL(e,t=W.workingColorSpace){W.fromWorkingColorSpace(Oc.copy(this),t);let n=Oc.r,r=Oc.g,i=Oc.b,a=Math.max(n,r,i),o=Math.min(n,r,i),s,c,l=(o+a)/2;if(o===a)s=0,c=0;else{let e=a-o;switch(c=l<=.5?e/(a+o):e/(2-a-o),a){case n:s=(r-i)/e+(r<i?6:0);break;case r:s=(i-n)/e+2;break;case i:s=(n-r)/e+4}s/=6}return e.h=s,e.s=c,e.l=l,e}getRGB(e,t=W.workingColorSpace){return W.fromWorkingColorSpace(Oc.copy(this),t),e.r=Oc.r,e.g=Oc.g,e.b=Oc.b,e}getStyle(e=Ja){W.fromWorkingColorSpace(Oc.copy(this),e);let t=Oc.r,n=Oc.g,r=Oc.b;return e===`srgb`?`rgb(${Math.round(t*255)},${Math.round(n*255)},${Math.round(r*255)})`:`color(${e} ${t.toFixed(3)} ${n.toFixed(3)} ${r.toFixed(3)})`}offsetHSL(e,t,n){return this.getHSL(Tc),this.setHSL(Tc.h+e,Tc.s+t,Tc.l+n)}add(e){return this.r+=e.r,this.g+=e.g,this.b+=e.b,this}addColors(e,t){return this.r=e.r+t.r,this.g=e.g+t.g,this.b=e.b+t.b,this}addScalar(e){return this.r+=e,this.g+=e,this.b+=e,this}sub(e){return this.r=Math.max(0,this.r-e.r),this.g=Math.max(0,this.g-e.g),this.b=Math.max(0,this.b-e.b),this}multiply(e){return this.r*=e.r,this.g*=e.g,this.b*=e.b,this}multiplyScalar(e){return this.r*=e,this.g*=e,this.b*=e,this}lerp(e,t){return this.r+=(e.r-this.r)*t,this.g+=(e.g-this.g)*t,this.b+=(e.b-this.b)*t,this}lerpColors(e,t,n){return this.r=e.r+(t.r-e.r)*n,this.g=e.g+(t.g-e.g)*n,this.b=e.b+(t.b-e.b)*n,this}lerpHSL(e,t){this.getHSL(Tc),e.getHSL(Ec);let n=ho(Tc.h,Ec.h,t),r=ho(Tc.s,Ec.s,t),i=ho(Tc.l,Ec.l,t);return this.setHSL(n,r,i),this}setFromVector3(e){return this.r=e.x,this.g=e.y,this.b=e.z,this}applyMatrix3(e){let t=this.r,n=this.g,r=this.b,i=e.elements;return this.r=i[0]*t+i[3]*n+i[6]*r,this.g=i[1]*t+i[4]*n+i[7]*r,this.b=i[2]*t+i[5]*n+i[8]*r,this}equals(e){return e.r===this.r&&e.g===this.g&&e.b===this.b}fromArray(e,t=0){return this.r=e[t],this.g=e[t+1],this.b=e[t+2],this}toArray(e=[],t=0){return e[t]=this.r,e[t+1]=this.g,e[t+2]=this.b,e}fromBufferAttribute(e,t){return this.r=e.getX(t),this.g=e.getY(t),this.b=e.getZ(t),this}toJSON(){return this.getHex()}*[Symbol.iterator](){yield this.r,yield this.g,yield this.b}},Oc=new K;K.NAMES=wc;var kc=0,Ac=class extends io{constructor(){super(),this.isMaterial=!0,Object.defineProperty(this,"id",{value:kc++}),this.uuid=lo(),this.name=``,this.type=`Material`,this.blending=1,this.side=0,this.vertexColors=!1,this.opacity=1,this.transparent=!1,this.alphaHash=!1,this.blendSrc=204,this.blendDst=205,this.blendEquation=100,this.blendSrcAlpha=null,this.blendDstAlpha=null,this.blendEquationAlpha=null,this.blendColor=new K(0,0,0),this.blendAlpha=0,this.depthFunc=3,this.depthTest=!0,this.depthWrite=!0,this.stencilWriteMask=255,this.stencilFunc=519,this.stencilRef=0,this.stencilFuncMask=255,this.stencilFail=to,this.stencilZFail=to,this.stencilZPass=to,this.stencilWrite=!1,this.clippingPlanes=null,this.clipIntersection=!1,this.clipShadows=!1,this.shadowSide=null,this.colorWrite=!0,this.precision=null,this.polygonOffset=!1,this.polygonOffsetFactor=0,this.polygonOffsetUnits=0,this.dithering=!1,this.alphaToCoverage=!1,this.premultipliedAlpha=!1,this.forceSinglePass=!1,this.visible=!0,this.toneMapped=!0,this.userData={},this.version=0,this._alphaTest=0}get alphaTest(){return this._alphaTest}set alphaTest(e){this._alphaTest>0!=e>0&&this.version++,this._alphaTest=e}onBeforeRender(){}onBeforeCompile(){}customProgramCacheKey(){return this.onBeforeCompile.toString()}setValues(e){if(e!==void 0)for(let t in e){let n=e[t];if(n===void 0){console.warn(`THREE.Material: parameter '${t}' has value of undefined.`);continue}let r=this[t];r===void 0?console.warn(`THREE.Material: '${t}' is not a property of THREE.${this.type}.`):r&&r.isColor?r.set(n):r&&r.isVector3&&n&&n.isVector3?r.copy(n):this[t]=n}}toJSON(e){let t=e===void 0||typeof e==`string`;t&&(e={textures:{},images:{}});let n={metadata:{version:4.6,type:`Material`,generator:`Material.toJSON`}};n.uuid=this.uuid,n.type=this.type,this.name!==``&&(n.name=this.name),this.color&&this.color.isColor&&(n.color=this.color.getHex()),this.roughness!==void 0&&(n.roughness=this.roughness),this.metalness!==void 0&&(n.metalness=this.metalness),this.sheen!==void 0&&(n.sheen=this.sheen),this.sheenColor&&this.sheenColor.isColor&&(n.sheenColor=this.sheenColor.getHex()),this.sheenRoughness!==void 0&&(n.sheenRoughness=this.sheenRoughness),this.emissive&&this.emissive.isColor&&(n.emissive=this.emissive.getHex()),this.emissiveIntensity!==void 0&&this.emissiveIntensity!==1&&(n.emissiveIntensity=this.emissiveIntensity),this.specular&&this.specular.isColor&&(n.specular=this.specular.getHex()),this.specularIntensity!==void 0&&(n.specularIntensity=this.specularIntensity),this.specularColor&&this.specularColor.isColor&&(n.specularColor=this.specularColor.getHex()),this.shininess!==void 0&&(n.shininess=this.shininess),this.clearcoat!==void 0&&(n.clearcoat=this.clearcoat),this.clearcoatRoughness!==void 0&&(n.clearcoatRoughness=this.clearcoatRoughness),this.clearcoatMap&&this.clearcoatMap.isTexture&&(n.clearcoatMap=this.clearcoatMap.toJSON(e).uuid),this.clearcoatRoughnessMap&&this.clearcoatRoughnessMap.isTexture&&(n.clearcoatRoughnessMap=this.clearcoatRoughnessMap.toJSON(e).uuid),this.clearcoatNormalMap&&this.clearcoatNormalMap.isTexture&&(n.clearcoatNormalMap=this.clearcoatNormalMap.toJSON(e).uuid,n.clearcoatNormalScale=this.clearcoatNormalScale.toArray()),this.dispersion!==void 0&&(n.dispersion=this.dispersion),this.iridescence!==void 0&&(n.iridescence=this.iridescence),this.iridescenceIOR!==void 0&&(n.iridescenceIOR=this.iridescenceIOR),this.iridescenceThicknessRange!==void 0&&(n.iridescenceThicknessRange=this.iridescenceThicknessRange),this.iridescenceMap&&this.iridescenceMap.isTexture&&(n.iridescenceMap=this.iridescenceMap.toJSON(e).uuid),this.iridescenceThicknessMap&&this.iridescenceThicknessMap.isTexture&&(n.iridescenceThicknessMap=this.iridescenceThicknessMap.toJSON(e).uuid),this.anisotropy!==void 0&&(n.anisotropy=this.anisotropy),this.anisotropyRotation!==void 0&&(n.anisotropyRotation=this.anisotropyRotation),this.anisotropyMap&&this.anisotropyMap.isTexture&&(n.anisotropyMap=this.anisotropyMap.toJSON(e).uuid),this.map&&this.map.isTexture&&(n.map=this.map.toJSON(e).uuid),this.matcap&&this.matcap.isTexture&&(n.matcap=this.matcap.toJSON(e).uuid),this.alphaMap&&this.alphaMap.isTexture&&(n.alphaMap=this.alphaMap.toJSON(e).uuid),this.lightMap&&this.lightMap.isTexture&&(n.lightMap=this.lightMap.toJSON(e).uuid,n.lightMapIntensity=this.lightMapIntensity),this.aoMap&&this.aoMap.isTexture&&(n.aoMap=this.aoMap.toJSON(e).uuid,n.aoMapIntensity=this.aoMapIntensity),this.bumpMap&&this.bumpMap.isTexture&&(n.bumpMap=this.bumpMap.toJSON(e).uuid,n.bumpScale=this.bumpScale),this.normalMap&&this.normalMap.isTexture&&(n.normalMap=this.normalMap.toJSON(e).uuid,n.normalMapType=this.normalMapType,n.normalScale=this.normalScale.toArray()),this.displacementMap&&this.displacementMap.isTexture&&(n.displacementMap=this.displacementMap.toJSON(e).uuid,n.displacementScale=this.displacementScale,n.displacementBias=this.displacementBias),this.roughnessMap&&this.roughnessMap.isTexture&&(n.roughnessMap=this.roughnessMap.toJSON(e).uuid),this.metalnessMap&&this.metalnessMap.isTexture&&(n.metalnessMap=this.metalnessMap.toJSON(e).uuid),this.emissiveMap&&this.emissiveMap.isTexture&&(n.emissiveMap=this.emissiveMap.toJSON(e).uuid),this.specularMap&&this.specularMap.isTexture&&(n.specularMap=this.specularMap.toJSON(e).uuid),this.specularIntensityMap&&this.specularIntensityMap.isTexture&&(n.specularIntensityMap=this.specularIntensityMap.toJSON(e).uuid),this.specularColorMap&&this.specularColorMap.isTexture&&(n.specularColorMap=this.specularColorMap.toJSON(e).uuid),this.envMap&&this.envMap.isTexture&&(n.envMap=this.envMap.toJSON(e).uuid,this.combine!==void 0&&(n.combine=this.combine)),this.envMapRotation!==void 0&&(n.envMapRotation=this.envMapRotation.toArray()),this.envMapIntensity!==void 0&&(n.envMapIntensity=this.envMapIntensity),this.reflectivity!==void 0&&(n.reflectivity=this.reflectivity),this.refractionRatio!==void 0&&(n.refractionRatio=this.refractionRatio),this.gradientMap&&this.gradientMap.isTexture&&(n.gradientMap=this.gradientMap.toJSON(e).uuid),this.transmission!==void 0&&(n.transmission=this.transmission),this.transmissionMap&&this.transmissionMap.isTexture&&(n.transmissionMap=this.transmissionMap.toJSON(e).uuid),this.thickness!==void 0&&(n.thickness=this.thickness),this.thicknessMap&&this.thicknessMap.isTexture&&(n.thicknessMap=this.thicknessMap.toJSON(e).uuid),this.attenuationDistance!==void 0&&this.attenuationDistance!==1/0&&(n.attenuationDistance=this.attenuationDistance),this.attenuationColor!==void 0&&(n.attenuationColor=this.attenuationColor.getHex()),this.size!==void 0&&(n.size=this.size),this.shadowSide!==null&&(n.shadowSide=this.shadowSide),this.sizeAttenuation!==void 0&&(n.sizeAttenuation=this.sizeAttenuation),this.blending!==1&&(n.blending=this.blending),this.side!==0&&(n.side=this.side),this.vertexColors===!0&&(n.vertexColors=!0),this.opacity<1&&(n.opacity=this.opacity),this.transparent===!0&&(n.transparent=!0),this.blendSrc!==204&&(n.blendSrc=this.blendSrc),this.blendDst!==205&&(n.blendDst=this.blendDst),this.blendEquation!==100&&(n.blendEquation=this.blendEquation),this.blendSrcAlpha!==null&&(n.blendSrcAlpha=this.blendSrcAlpha),this.blendDstAlpha!==null&&(n.blendDstAlpha=this.blendDstAlpha),this.blendEquationAlpha!==null&&(n.blendEquationAlpha=this.blendEquationAlpha),this.blendColor&&this.blendColor.isColor&&(n.blendColor=this.blendColor.getHex()),this.blendAlpha!==0&&(n.blendAlpha=this.blendAlpha),this.depthFunc!==3&&(n.depthFunc=this.depthFunc),this.depthTest===!1&&(n.depthTest=this.depthTest),this.depthWrite===!1&&(n.depthWrite=this.depthWrite),this.colorWrite===!1&&(n.colorWrite=this.colorWrite),this.stencilWriteMask!==255&&(n.stencilWriteMask=this.stencilWriteMask),this.stencilFunc!==519&&(n.stencilFunc=this.stencilFunc),this.stencilRef!==0&&(n.stencilRef=this.stencilRef),this.stencilFuncMask!==255&&(n.stencilFuncMask=this.stencilFuncMask),this.stencilFail!==7680&&(n.stencilFail=this.stencilFail),this.stencilZFail!==7680&&(n.stencilZFail=this.stencilZFail),this.stencilZPass!==7680&&(n.stencilZPass=this.stencilZPass),this.stencilWrite===!0&&(n.stencilWrite=this.stencilWrite),this.rotation!==void 0&&this.rotation!==0&&(n.rotation=this.rotation),this.polygonOffset===!0&&(n.polygonOffset=!0),this.polygonOffsetFactor!==0&&(n.polygonOffsetFactor=this.polygonOffsetFactor),this.polygonOffsetUnits!==0&&(n.polygonOffsetUnits=this.polygonOffsetUnits),this.linewidth!==void 0&&this.linewidth!==1&&(n.linewidth=this.linewidth),this.dashSize!==void 0&&(n.dashSize=this.dashSize),this.gapSize!==void 0&&(n.gapSize=this.gapSize),this.scale!==void 0&&(n.scale=this.scale),this.dithering===!0&&(n.dithering=!0),this.alphaTest>0&&(n.alphaTest=this.alphaTest),this.alphaHash===!0&&(n.alphaHash=!0),this.alphaToCoverage===!0&&(n.alphaToCoverage=!0),this.premultipliedAlpha===!0&&(n.premultipliedAlpha=!0),this.forceSinglePass===!0&&(n.forceSinglePass=!0),this.wireframe===!0&&(n.wireframe=!0),this.wireframeLinewidth>1&&(n.wireframeLinewidth=this.wireframeLinewidth),this.wireframeLinecap!==`round`&&(n.wireframeLinecap=this.wireframeLinecap),this.wireframeLinejoin!==`round`&&(n.wireframeLinejoin=this.wireframeLinejoin),this.flatShading===!0&&(n.flatShading=!0),this.visible===!1&&(n.visible=!1),this.toneMapped===!1&&(n.toneMapped=!1),this.fog===!1&&(n.fog=!1),Object.keys(this.userData).length>0&&(n.userData=this.userData);function r(e){let t=[];for(let n in e){let r=e[n];delete r.metadata,t.push(r)}return t}if(t){let t=r(e.textures),i=r(e.images);t.length>0&&(n.textures=t),i.length>0&&(n.images=i)}return n}clone(){return new this.constructor().copy(this)}copy(e){this.name=e.name,this.blending=e.blending,this.side=e.side,this.vertexColors=e.vertexColors,this.opacity=e.opacity,this.transparent=e.transparent,this.blendSrc=e.blendSrc,this.blendDst=e.blendDst,this.blendEquation=e.blendEquation,this.blendSrcAlpha=e.blendSrcAlpha,this.blendDstAlpha=e.blendDstAlpha,this.blendEquationAlpha=e.blendEquationAlpha,this.blendColor.copy(e.blendColor),this.blendAlpha=e.blendAlpha,this.depthFunc=e.depthFunc,this.depthTest=e.depthTest,this.depthWrite=e.depthWrite,this.stencilWriteMask=e.stencilWriteMask,this.stencilFunc=e.stencilFunc,this.stencilRef=e.stencilRef,this.stencilFuncMask=e.stencilFuncMask,this.stencilFail=e.stencilFail,this.stencilZFail=e.stencilZFail,this.stencilZPass=e.stencilZPass,this.stencilWrite=e.stencilWrite;let t=e.clippingPlanes,n=null;if(t!==null){let e=t.length;n=Array(e);for(let r=0;r!==e;++r)n[r]=t[r].clone()}return this.clippingPlanes=n,this.clipIntersection=e.clipIntersection,this.clipShadows=e.clipShadows,this.shadowSide=e.shadowSide,this.colorWrite=e.colorWrite,this.precision=e.precision,this.polygonOffset=e.polygonOffset,this.polygonOffsetFactor=e.polygonOffsetFactor,this.polygonOffsetUnits=e.polygonOffsetUnits,this.dithering=e.dithering,this.alphaTest=e.alphaTest,this.alphaHash=e.alphaHash,this.alphaToCoverage=e.alphaToCoverage,this.premultipliedAlpha=e.premultipliedAlpha,this.forceSinglePass=e.forceSinglePass,this.visible=e.visible,this.toneMapped=e.toneMapped,this.userData=JSON.parse(JSON.stringify(e.userData)),this}dispose(){this.dispatchEvent({type:`dispose`})}set needsUpdate(e){e===!0&&this.version++}onBuild(){console.warn(`Material: onBuild() has been removed.`)}},jc=class extends Ac{constructor(e){super(),this.isMeshBasicMaterial=!0,this.type=`MeshBasicMaterial`,this.color=new K(16777215),this.map=null,this.lightMap=null,this.lightMapIntensity=1,this.aoMap=null,this.aoMapIntensity=1,this.specularMap=null,this.alphaMap=null,this.envMap=null,this.envMapRotation=new Ks,this.combine=0,this.reflectivity=1,this.refractionRatio=.98,this.wireframe=!1,this.wireframeLinewidth=1,this.wireframeLinecap=`round`,this.wireframeLinejoin=`round`,this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.color.copy(e.color),this.map=e.map,this.lightMap=e.lightMap,this.lightMapIntensity=e.lightMapIntensity,this.aoMap=e.aoMap,this.aoMapIntensity=e.aoMapIntensity,this.specularMap=e.specularMap,this.alphaMap=e.alphaMap,this.envMap=e.envMap,this.envMapRotation.copy(e.envMapRotation),this.combine=e.combine,this.reflectivity=e.reflectivity,this.refractionRatio=e.refractionRatio,this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this.wireframeLinecap=e.wireframeLinecap,this.wireframeLinejoin=e.wireframeLinejoin,this.fog=e.fog,this}},Mc=new G,Nc=new H,Pc=class{constructor(e,t,n=!1){if(Array.isArray(e))throw TypeError(`THREE.BufferAttribute: array should be a Typed Array.`);this.isBufferAttribute=!0,this.name=``,this.array=e,this.itemSize=t,this.count=e===void 0?0:e.length/t,this.normalized=n,this.usage=no,this.updateRanges=[],this.gpuType=Wi,this.version=0}onUploadCallback(){}set needsUpdate(e){e===!0&&this.version++}setUsage(e){return this.usage=e,this}addUpdateRange(e,t){this.updateRanges.push({start:e,count:t})}clearUpdateRanges(){this.updateRanges.length=0}copy(e){return this.name=e.name,this.array=new e.array.constructor(e.array),this.itemSize=e.itemSize,this.count=e.count,this.normalized=e.normalized,this.usage=e.usage,this.gpuType=e.gpuType,this}copyAt(e,t,n){e*=this.itemSize,n*=t.itemSize;for(let r=0,i=this.itemSize;r<i;r++)this.array[e+r]=t.array[n+r];return this}copyArray(e){return this.array.set(e),this}applyMatrix3(e){if(this.itemSize===2)for(let t=0,n=this.count;t<n;t++)Nc.fromBufferAttribute(this,t),Nc.applyMatrix3(e),this.setXY(t,Nc.x,Nc.y);else if(this.itemSize===3)for(let t=0,n=this.count;t<n;t++)Mc.fromBufferAttribute(this,t),Mc.applyMatrix3(e),this.setXYZ(t,Mc.x,Mc.y,Mc.z);return this}applyMatrix4(e){for(let t=0,n=this.count;t<n;t++)Mc.fromBufferAttribute(this,t),Mc.applyMatrix4(e),this.setXYZ(t,Mc.x,Mc.y,Mc.z);return this}applyNormalMatrix(e){for(let t=0,n=this.count;t<n;t++)Mc.fromBufferAttribute(this,t),Mc.applyNormalMatrix(e),this.setXYZ(t,Mc.x,Mc.y,Mc.z);return this}transformDirection(e){for(let t=0,n=this.count;t<n;t++)Mc.fromBufferAttribute(this,t),Mc.transformDirection(e),this.setXYZ(t,Mc.x,Mc.y,Mc.z);return this}set(e,t=0){return this.array.set(e,t),this}getComponent(e,t){let n=this.array[e*this.itemSize+t];return this.normalized&&(n=Ao(n,this.array)),n}setComponent(e,t,n){return this.normalized&&(n=jo(n,this.array)),this.array[e*this.itemSize+t]=n,this}getX(e){let t=this.array[e*this.itemSize];return this.normalized&&(t=Ao(t,this.array)),t}setX(e,t){return this.normalized&&(t=jo(t,this.array)),this.array[e*this.itemSize]=t,this}getY(e){let t=this.array[e*this.itemSize+1];return this.normalized&&(t=Ao(t,this.array)),t}setY(e,t){return this.normalized&&(t=jo(t,this.array)),this.array[e*this.itemSize+1]=t,this}getZ(e){let t=this.array[e*this.itemSize+2];return this.normalized&&(t=Ao(t,this.array)),t}setZ(e,t){return this.normalized&&(t=jo(t,this.array)),this.array[e*this.itemSize+2]=t,this}getW(e){let t=this.array[e*this.itemSize+3];return this.normalized&&(t=Ao(t,this.array)),t}setW(e,t){return this.normalized&&(t=jo(t,this.array)),this.array[e*this.itemSize+3]=t,this}setXY(e,t,n){return e*=this.itemSize,this.normalized&&(t=jo(t,this.array),n=jo(n,this.array)),this.array[e+0]=t,this.array[e+1]=n,this}setXYZ(e,t,n,r){return e*=this.itemSize,this.normalized&&(t=jo(t,this.array),n=jo(n,this.array),r=jo(r,this.array)),this.array[e+0]=t,this.array[e+1]=n,this.array[e+2]=r,this}setXYZW(e,t,n,r,i){return e*=this.itemSize,this.normalized&&(t=jo(t,this.array),n=jo(n,this.array),r=jo(r,this.array),i=jo(i,this.array)),this.array[e+0]=t,this.array[e+1]=n,this.array[e+2]=r,this.array[e+3]=i,this}onUpload(e){return this.onUploadCallback=e,this}clone(){return new this.constructor(this.array,this.itemSize).copy(this)}toJSON(){let e={itemSize:this.itemSize,type:this.array.constructor.name,array:Array.from(this.array),normalized:this.normalized};return this.name!==``&&(e.name=this.name),this.usage!==35044&&(e.usage=this.usage),e}},Fc=class extends Pc{constructor(e,t,n){super(new Uint16Array(e),t,n)}},Ic=class extends Pc{constructor(e,t,n){super(new Uint32Array(e),t,n)}},q=class extends Pc{constructor(e,t,n){super(new Float32Array(e),t,n)}},Lc=0,Rc=new Is,zc=new lc,Bc=new G,Vc=new ls,Hc=new ls,Uc=new G,Wc=class e extends io{constructor(){super(),this.isBufferGeometry=!0,Object.defineProperty(this,"id",{value:Lc++}),this.uuid=lo(),this.name=``,this.type=`BufferGeometry`,this.index=null,this.attributes={},this.morphAttributes={},this.morphTargetsRelative=!1,this.groups=[],this.boundingBox=null,this.boundingSphere=null,this.drawRange={start:0,count:1/0},this.userData={}}getIndex(){return this.index}setIndex(e){return this.index=Array.isArray(e)?new(Po(e)?Ic:Fc)(e,1):e,this}getAttribute(e){return this.attributes[e]}setAttribute(e,t){return this.attributes[e]=t,this}deleteAttribute(e){return delete this.attributes[e],this}hasAttribute(e){return this.attributes[e]!==void 0}addGroup(e,t,n=0){this.groups.push({start:e,count:t,materialIndex:n})}clearGroups(){this.groups=[]}setDrawRange(e,t){this.drawRange.start=e,this.drawRange.count=t}applyMatrix4(e){let t=this.attributes.position;t!==void 0&&(t.applyMatrix4(e),t.needsUpdate=!0);let n=this.attributes.normal;if(n!==void 0){let t=new U().getNormalMatrix(e);n.applyNormalMatrix(t),n.needsUpdate=!0}let r=this.attributes.tangent;return r!==void 0&&(r.transformDirection(e),r.needsUpdate=!0),this.boundingBox!==null&&this.computeBoundingBox(),this.boundingSphere!==null&&this.computeBoundingSphere(),this}applyQuaternion(e){return Rc.makeRotationFromQuaternion(e),this.applyMatrix4(Rc),this}rotateX(e){return Rc.makeRotationX(e),this.applyMatrix4(Rc),this}rotateY(e){return Rc.makeRotationY(e),this.applyMatrix4(Rc),this}rotateZ(e){return Rc.makeRotationZ(e),this.applyMatrix4(Rc),this}translate(e,t,n){return Rc.makeTranslation(e,t,n),this.applyMatrix4(Rc),this}scale(e,t,n){return Rc.makeScale(e,t,n),this.applyMatrix4(Rc),this}lookAt(e){return zc.lookAt(e),zc.updateMatrix(),this.applyMatrix4(zc.matrix),this}center(){return this.computeBoundingBox(),this.boundingBox.getCenter(Bc).negate(),this.translate(Bc.x,Bc.y,Bc.z),this}setFromPoints(e){let t=[];for(let n=0,r=e.length;n<r;n++){let r=e[n];t.push(r.x,r.y,r.z||0)}return this.setAttribute(`position`,new q(t,3)),this}computeBoundingBox(){this.boundingBox===null&&(this.boundingBox=new ls);let e=this.attributes.position,t=this.morphAttributes.position;if(e&&e.isGLBufferAttribute)console.error(`THREE.BufferGeometry.computeBoundingBox(): GLBufferAttribute requires a manual bounding box.`,this),this.boundingBox.set(new G(-1/0,-1/0,-1/0),new G(1/0,1/0,1/0));else{if(e!==void 0){if(this.boundingBox.setFromBufferAttribute(e),t)for(let e=0,n=t.length;e<n;e++){let n=t[e];Vc.setFromBufferAttribute(n),this.morphTargetsRelative?(Uc.addVectors(this.boundingBox.min,Vc.min),this.boundingBox.expandByPoint(Uc),Uc.addVectors(this.boundingBox.max,Vc.max),this.boundingBox.expandByPoint(Uc)):(this.boundingBox.expandByPoint(Vc.min),this.boundingBox.expandByPoint(Vc.max))}}else this.boundingBox.makeEmpty();(isNaN(this.boundingBox.min.x)||isNaN(this.boundingBox.min.y)||isNaN(this.boundingBox.min.z))&&console.error(`THREE.BufferGeometry.computeBoundingBox(): Computed min/max have NaN values. The "position" attribute is likely to have NaN values.`,this)}}computeBoundingSphere(){this.boundingSphere===null&&(this.boundingSphere=new Ds);let e=this.attributes.position,t=this.morphAttributes.position;if(e&&e.isGLBufferAttribute)console.error(`THREE.BufferGeometry.computeBoundingSphere(): GLBufferAttribute requires a manual bounding sphere.`,this),this.boundingSphere.set(new G,1/0);else if(e){let n=this.boundingSphere.center;if(Vc.setFromBufferAttribute(e),t)for(let e=0,n=t.length;e<n;e++){let n=t[e];Hc.setFromBufferAttribute(n),this.morphTargetsRelative?(Uc.addVectors(Vc.min,Hc.min),Vc.expandByPoint(Uc),Uc.addVectors(Vc.max,Hc.max),Vc.expandByPoint(Uc)):(Vc.expandByPoint(Hc.min),Vc.expandByPoint(Hc.max))}Vc.getCenter(n);let r=0;for(let t=0,i=e.count;t<i;t++)Uc.fromBufferAttribute(e,t),r=Math.max(r,n.distanceToSquared(Uc));if(t)for(let i=0,a=t.length;i<a;i++){let a=t[i],o=this.morphTargetsRelative;for(let t=0,i=a.count;t<i;t++)Uc.fromBufferAttribute(a,t),o&&(Bc.fromBufferAttribute(e,t),Uc.add(Bc)),r=Math.max(r,n.distanceToSquared(Uc))}this.boundingSphere.radius=Math.sqrt(r),isNaN(this.boundingSphere.radius)&&console.error(`THREE.BufferGeometry.computeBoundingSphere(): Computed radius is NaN. The "position" attribute is likely to have NaN values.`,this)}}computeTangents(){let e=this.index,t=this.attributes;if(e===null||t.position===void 0||t.normal===void 0||t.uv===void 0){console.error(`THREE.BufferGeometry: .computeTangents() failed. Missing required attributes (index, position, normal or uv)`);return}let n=t.position,r=t.normal,i=t.uv;this.hasAttribute(`tangent`)===!1&&this.setAttribute(`tangent`,new Pc(new Float32Array(4*n.count),4));let a=this.getAttribute(`tangent`),o=[],s=[];for(let e=0;e<n.count;e++)o[e]=new G,s[e]=new G;let c=new G,l=new G,u=new G,d=new H,f=new H,p=new H,m=new G,h=new G;function g(e,t,r){c.fromBufferAttribute(n,e),l.fromBufferAttribute(n,t),u.fromBufferAttribute(n,r),d.fromBufferAttribute(i,e),f.fromBufferAttribute(i,t),p.fromBufferAttribute(i,r),l.sub(c),u.sub(c),f.sub(d),p.sub(d);let a=1/(f.x*p.y-p.x*f.y);isFinite(a)&&(m.copy(l).multiplyScalar(p.y).addScaledVector(u,-f.y).multiplyScalar(a),h.copy(u).multiplyScalar(f.x).addScaledVector(l,-p.x).multiplyScalar(a),o[e].add(m),o[t].add(m),o[r].add(m),s[e].add(h),s[t].add(h),s[r].add(h))}let _=this.groups;_.length===0&&(_=[{start:0,count:e.count}]);for(let t=0,n=_.length;t<n;++t){let n=_[t],r=n.start,i=n.count;for(let t=r,n=r+i;t<n;t+=3)g(e.getX(t+0),e.getX(t+1),e.getX(t+2))}let v=new G,y=new G,b=new G,x=new G;function S(e){b.fromBufferAttribute(r,e),x.copy(b);let t=o[e];v.copy(t),v.sub(b.multiplyScalar(b.dot(t))).normalize(),y.crossVectors(x,t);let n=y.dot(s[e])<0?-1:1;a.setXYZW(e,v.x,v.y,v.z,n)}for(let t=0,n=_.length;t<n;++t){let n=_[t],r=n.start,i=n.count;for(let t=r,n=r+i;t<n;t+=3)S(e.getX(t+0)),S(e.getX(t+1)),S(e.getX(t+2))}}computeVertexNormals(){let e=this.index,t=this.getAttribute(`position`);if(t!==void 0){let n=this.getAttribute(`normal`);if(n===void 0)n=new Pc(new Float32Array(t.count*3),3),this.setAttribute(`normal`,n);else for(let e=0,t=n.count;e<t;e++)n.setXYZ(e,0,0,0);let r=new G,i=new G,a=new G,o=new G,s=new G,c=new G,l=new G,u=new G;if(e)for(let d=0,f=e.count;d<f;d+=3){let f=e.getX(d+0),p=e.getX(d+1),m=e.getX(d+2);r.fromBufferAttribute(t,f),i.fromBufferAttribute(t,p),a.fromBufferAttribute(t,m),l.subVectors(a,i),u.subVectors(r,i),l.cross(u),o.fromBufferAttribute(n,f),s.fromBufferAttribute(n,p),c.fromBufferAttribute(n,m),o.add(l),s.add(l),c.add(l),n.setXYZ(f,o.x,o.y,o.z),n.setXYZ(p,s.x,s.y,s.z),n.setXYZ(m,c.x,c.y,c.z)}else for(let e=0,o=t.count;e<o;e+=3)r.fromBufferAttribute(t,e+0),i.fromBufferAttribute(t,e+1),a.fromBufferAttribute(t,e+2),l.subVectors(a,i),u.subVectors(r,i),l.cross(u),n.setXYZ(e+0,l.x,l.y,l.z),n.setXYZ(e+1,l.x,l.y,l.z),n.setXYZ(e+2,l.x,l.y,l.z);this.normalizeNormals(),n.needsUpdate=!0}}normalizeNormals(){let e=this.attributes.normal;for(let t=0,n=e.count;t<n;t++)Uc.fromBufferAttribute(e,t),Uc.normalize(),e.setXYZ(t,Uc.x,Uc.y,Uc.z)}toNonIndexed(){function t(e,t){let n=e.array,r=e.itemSize,i=e.normalized,a=new n.constructor(t.length*r),o=0,s=0;for(let i=0,c=t.length;i<c;i++){o=e.isInterleavedBufferAttribute?t[i]*e.data.stride+e.offset:t[i]*r;for(let e=0;e<r;e++)a[s++]=n[o++]}return new Pc(a,r,i)}if(this.index===null)return console.warn(`THREE.BufferGeometry.toNonIndexed(): BufferGeometry is already non-indexed.`),this;let n=new e,r=this.index.array,i=this.attributes;for(let e in i){let a=i[e],o=t(a,r);n.setAttribute(e,o)}let a=this.morphAttributes;for(let e in a){let i=[],o=a[e];for(let e=0,n=o.length;e<n;e++){let n=o[e],a=t(n,r);i.push(a)}n.morphAttributes[e]=i}n.morphTargetsRelative=this.morphTargetsRelative;let o=this.groups;for(let e=0,t=o.length;e<t;e++){let t=o[e];n.addGroup(t.start,t.count,t.materialIndex)}return n}toJSON(){let e={metadata:{version:4.6,type:`BufferGeometry`,generator:`BufferGeometry.toJSON`}};if(e.uuid=this.uuid,e.type=this.type,this.name!==``&&(e.name=this.name),Object.keys(this.userData).length>0&&(e.userData=this.userData),this.parameters!==void 0){let t=this.parameters;for(let n in t)t[n]!==void 0&&(e[n]=t[n]);return e}e.data={attributes:{}};let t=this.index;t!==null&&(e.data.index={type:t.array.constructor.name,array:Array.prototype.slice.call(t.array)});let n=this.attributes;for(let t in n){let r=n[t];e.data.attributes[t]=r.toJSON(e.data)}let r={},i=!1;for(let t in this.morphAttributes){let n=this.morphAttributes[t],a=[];for(let t=0,r=n.length;t<r;t++){let r=n[t];a.push(r.toJSON(e.data))}a.length>0&&(r[t]=a,i=!0)}i&&(e.data.morphAttributes=r,e.data.morphTargetsRelative=this.morphTargetsRelative);let a=this.groups;a.length>0&&(e.data.groups=JSON.parse(JSON.stringify(a)));let o=this.boundingSphere;return o!==null&&(e.data.boundingSphere={center:o.center.toArray(),radius:o.radius}),e}clone(){return new this.constructor().copy(this)}copy(e){this.index=null,this.attributes={},this.morphAttributes={},this.groups=[],this.boundingBox=null,this.boundingSphere=null;let t={};this.name=e.name;let n=e.index;n!==null&&this.setIndex(n.clone(t));let r=e.attributes;for(let e in r){let n=r[e];this.setAttribute(e,n.clone(t))}let i=e.morphAttributes;for(let e in i){let n=[],r=i[e];for(let e=0,i=r.length;e<i;e++)n.push(r[e].clone(t));this.morphAttributes[e]=n}this.morphTargetsRelative=e.morphTargetsRelative;let a=e.groups;for(let e=0,t=a.length;e<t;e++){let t=a[e];this.addGroup(t.start,t.count,t.materialIndex)}let o=e.boundingBox;o!==null&&(this.boundingBox=o.clone());let s=e.boundingSphere;return s!==null&&(this.boundingSphere=s.clone()),this.drawRange.start=e.drawRange.start,this.drawRange.count=e.drawRange.count,this.userData=e.userData,this}dispose(){this.dispatchEvent({type:`dispose`})}},Gc=new Is,Kc=new Fs,qc=new Ds,Jc=new G,Yc=new G,Xc=new G,Zc=new G,Qc=new G,$c=new G,el=new G,tl=new G,nl=class extends lc{constructor(e=new Wc,t=new jc){super(),this.isMesh=!0,this.type=`Mesh`,this.geometry=e,this.material=t,this.updateMorphTargets()}copy(e,t){return super.copy(e,t),e.morphTargetInfluences!==void 0&&(this.morphTargetInfluences=e.morphTargetInfluences.slice()),e.morphTargetDictionary!==void 0&&(this.morphTargetDictionary=Object.assign({},e.morphTargetDictionary)),this.material=Array.isArray(e.material)?e.material.slice():e.material,this.geometry=e.geometry,this}updateMorphTargets(){let e=this.geometry.morphAttributes,t=Object.keys(e);if(t.length>0){let n=e[t[0]];if(n!==void 0){this.morphTargetInfluences=[],this.morphTargetDictionary={};for(let e=0,t=n.length;e<t;e++){let t=n[e].name||String(e);this.morphTargetInfluences.push(0),this.morphTargetDictionary[t]=e}}}}getVertexPosition(e,t){let n=this.geometry,r=n.attributes.position,i=n.morphAttributes.position,a=n.morphTargetsRelative;t.fromBufferAttribute(r,e);let o=this.morphTargetInfluences;if(i&&o){$c.set(0,0,0);for(let n=0,r=i.length;n<r;n++){let r=o[n],s=i[n];r!==0&&(Qc.fromBufferAttribute(s,e),a?$c.addScaledVector(Qc,r):$c.addScaledVector(Qc.sub(t),r))}t.add($c)}return t}raycast(e,t){let n=this.geometry,r=this.material,i=this.matrixWorld;r!==void 0&&(n.boundingSphere===null&&n.computeBoundingSphere(),qc.copy(n.boundingSphere),qc.applyMatrix4(i),Kc.copy(e.ray).recast(e.near),!(qc.containsPoint(Kc.origin)===!1&&(Kc.intersectSphere(qc,Jc)===null||Kc.origin.distanceToSquared(Jc)>(e.far-e.near)**2))&&(Gc.copy(i).invert(),Kc.copy(e.ray).applyMatrix4(Gc),(n.boundingBox===null||Kc.intersectsBox(n.boundingBox)!==!1)&&this._computeIntersections(e,t,Kc)))}_computeIntersections(e,t,n){let r,i=this.geometry,a=this.material,o=i.index,s=i.attributes.position,c=i.attributes.uv,l=i.attributes.uv1,u=i.attributes.normal,d=i.groups,f=i.drawRange;if(o!==null){if(Array.isArray(a))for(let i=0,s=d.length;i<s;i++){let s=d[i],p=a[s.materialIndex],m=Math.max(s.start,f.start),h=Math.min(o.count,Math.min(s.start+s.count,f.start+f.count));for(let i=m,a=h;i<a;i+=3){let a=o.getX(i),d=o.getX(i+1),f=o.getX(i+2);r=il(this,p,e,n,c,l,u,a,d,f),r&&(r.faceIndex=Math.floor(i/3),r.face.materialIndex=s.materialIndex,t.push(r))}}else{let i=Math.max(0,f.start),s=Math.min(o.count,f.start+f.count);for(let d=i,f=s;d<f;d+=3){let i=o.getX(d),s=o.getX(d+1),f=o.getX(d+2);r=il(this,a,e,n,c,l,u,i,s,f),r&&(r.faceIndex=Math.floor(d/3),t.push(r))}}}else if(s!==void 0){if(Array.isArray(a))for(let i=0,o=d.length;i<o;i++){let o=d[i],p=a[o.materialIndex],m=Math.max(o.start,f.start),h=Math.min(s.count,Math.min(o.start+o.count,f.start+f.count));for(let i=m,a=h;i<a;i+=3){let a=i,s=i+1,d=i+2;r=il(this,p,e,n,c,l,u,a,s,d),r&&(r.faceIndex=Math.floor(i/3),r.face.materialIndex=o.materialIndex,t.push(r))}}else{let i=Math.max(0,f.start),o=Math.min(s.count,f.start+f.count);for(let s=i,d=o;s<d;s+=3){let i=s,o=s+1,d=s+2;r=il(this,a,e,n,c,l,u,i,o,d),r&&(r.faceIndex=Math.floor(s/3),t.push(r))}}}}};function rl(e,t,n,r,i,a,o,s){let c;if(c=t.side===1?r.intersectTriangle(o,a,i,!0,s):r.intersectTriangle(i,a,o,t.side===0,s),c===null)return null;tl.copy(s),tl.applyMatrix4(e.matrixWorld);let l=n.ray.origin.distanceTo(tl);return l<n.near||l>n.far?null:{distance:l,point:tl.clone(),object:e}}function il(e,t,n,r,i,a,o,s,c,l){e.getVertexPosition(s,Yc),e.getVertexPosition(c,Xc),e.getVertexPosition(l,Zc);let u=rl(e,t,n,r,Yc,Xc,Zc,el);if(u){let e=new G;Cc.getBarycoord(el,Yc,Xc,Zc,e),i&&(u.uv=Cc.getInterpolatedAttribute(i,s,c,l,e,new H)),a&&(u.uv1=Cc.getInterpolatedAttribute(a,s,c,l,e,new H)),o&&(u.normal=Cc.getInterpolatedAttribute(o,s,c,l,e,new G),u.normal.dot(r.direction)>0&&u.normal.multiplyScalar(-1));let t={a:s,b:c,c:l,normal:new G,materialIndex:0};Cc.getNormal(Yc,Xc,Zc,t.normal),u.face=t,u.barycoord=e}return u}var al=class e extends Wc{constructor(e=1,t=1,n=1,r=1,i=1,a=1){super(),this.type=`BoxGeometry`,this.parameters={width:e,height:t,depth:n,widthSegments:r,heightSegments:i,depthSegments:a};let o=this;r=Math.floor(r),i=Math.floor(i),a=Math.floor(a);let s=[],c=[],l=[],u=[],d=0,f=0;p(`z`,`y`,`x`,-1,-1,n,t,e,a,i,0),p(`z`,`y`,`x`,1,-1,n,t,-e,a,i,1),p(`x`,`z`,`y`,1,1,e,n,t,r,a,2),p(`x`,`z`,`y`,1,-1,e,n,-t,r,a,3),p(`x`,`y`,`z`,1,-1,e,t,n,r,i,4),p(`x`,`y`,`z`,-1,-1,e,t,-n,r,i,5),this.setIndex(s),this.setAttribute(`position`,new q(c,3)),this.setAttribute(`normal`,new q(l,3)),this.setAttribute(`uv`,new q(u,2));function p(e,t,n,r,i,a,p,m,h,g,_){let v=a/h,y=p/g,b=a/2,x=p/2,S=m/2,C=h+1,w=g+1,T=0,E=0,D=new G;for(let a=0;a<w;a++){let o=a*y-x;for(let s=0;s<C;s++)D[e]=(s*v-b)*r,D[t]=o*i,D[n]=S,c.push(D.x,D.y,D.z),D[e]=0,D[t]=0,D[n]=m>0?1:-1,l.push(D.x,D.y,D.z),u.push(s/h),u.push(1-a/g),T+=1}for(let e=0;e<g;e++)for(let t=0;t<h;t++){let n=d+t+C*e,r=d+t+C*(e+1),i=d+(t+1)+C*(e+1),a=d+(t+1)+C*e;s.push(n,r,a),s.push(r,i,a),E+=6}o.addGroup(f,E,_),f+=E,d+=T}}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(t){return new e(t.width,t.height,t.depth,t.widthSegments,t.heightSegments,t.depthSegments)}};function ol(e){let t={};for(let n in e){t[n]={};for(let r in e[n]){let i=e[n][r];i&&(i.isColor||i.isMatrix3||i.isMatrix4||i.isVector2||i.isVector3||i.isVector4||i.isTexture||i.isQuaternion)?i.isRenderTargetTexture?(console.warn(`UniformsUtils: Textures of render targets cannot be cloned via cloneUniforms() or mergeUniforms().`),t[n][r]=null):t[n][r]=i.clone():Array.isArray(i)?t[n][r]=i.slice():t[n][r]=i}}return t}function sl(e){let t={};for(let n=0;n<e.length;n++){let r=ol(e[n]);for(let e in r)t[e]=r[e]}return t}function cl(e){let t=[];for(let n=0;n<e.length;n++)t.push(e[n].clone());return t}function ll(e){let t=e.getRenderTarget();return t===null?e.outputColorSpace:t.isXRRenderTarget===!0?t.texture.colorSpace:W.workingColorSpace}var ul={clone:ol,merge:sl},dl=`void main() {
	gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
}`,fl=`void main() {
	gl_FragColor = vec4( 1.0, 0.0, 0.0, 1.0 );
}`,pl=class extends Ac{constructor(e){super(),this.isShaderMaterial=!0,this.type=`ShaderMaterial`,this.defines={},this.uniforms={},this.uniformsGroups=[],this.vertexShader=dl,this.fragmentShader=fl,this.linewidth=1,this.wireframe=!1,this.wireframeLinewidth=1,this.fog=!1,this.lights=!1,this.clipping=!1,this.forceSinglePass=!0,this.extensions={clipCullDistance:!1,multiDraw:!1},this.defaultAttributeValues={color:[1,1,1],uv:[0,0],uv1:[0,0]},this.index0AttributeName=void 0,this.uniformsNeedUpdate=!1,this.glslVersion=null,e!==void 0&&this.setValues(e)}copy(e){return super.copy(e),this.fragmentShader=e.fragmentShader,this.vertexShader=e.vertexShader,this.uniforms=ol(e.uniforms),this.uniformsGroups=cl(e.uniformsGroups),this.defines=Object.assign({},e.defines),this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this.fog=e.fog,this.lights=e.lights,this.clipping=e.clipping,this.extensions=Object.assign({},e.extensions),this.glslVersion=e.glslVersion,this}toJSON(e){let t=super.toJSON(e);t.glslVersion=this.glslVersion,t.uniforms={};for(let n in this.uniforms){let r=this.uniforms[n].value;r&&r.isTexture?t.uniforms[n]={type:`t`,value:r.toJSON(e).uuid}:r&&r.isColor?t.uniforms[n]={type:`c`,value:r.getHex()}:r&&r.isVector2?t.uniforms[n]={type:`v2`,value:r.toArray()}:r&&r.isVector3?t.uniforms[n]={type:`v3`,value:r.toArray()}:r&&r.isVector4?t.uniforms[n]={type:`v4`,value:r.toArray()}:r&&r.isMatrix3?t.uniforms[n]={type:`m3`,value:r.toArray()}:r&&r.isMatrix4?t.uniforms[n]={type:`m4`,value:r.toArray()}:t.uniforms[n]={value:r}}Object.keys(this.defines).length>0&&(t.defines=this.defines),t.vertexShader=this.vertexShader,t.fragmentShader=this.fragmentShader,t.lights=this.lights,t.clipping=this.clipping;let n={};for(let e in this.extensions)this.extensions[e]===!0&&(n[e]=!0);return Object.keys(n).length>0&&(t.extensions=n),t}},ml=class extends lc{constructor(){super(),this.isCamera=!0,this.type=`Camera`,this.matrixWorldInverse=new Is,this.projectionMatrix=new Is,this.projectionMatrixInverse=new Is,this.coordinateSystem=ro}copy(e,t){return super.copy(e,t),this.matrixWorldInverse.copy(e.matrixWorldInverse),this.projectionMatrix.copy(e.projectionMatrix),this.projectionMatrixInverse.copy(e.projectionMatrixInverse),this.coordinateSystem=e.coordinateSystem,this}getWorldDirection(e){return super.getWorldDirection(e).negate()}updateMatrixWorld(e){super.updateMatrixWorld(e),this.matrixWorldInverse.copy(this.matrixWorld).invert()}updateWorldMatrix(e,t){super.updateWorldMatrix(e,t),this.matrixWorldInverse.copy(this.matrixWorld).invert()}clone(){return new this.constructor().copy(this)}},hl=new G,gl=new H,_l=new H,vl=class extends ml{constructor(e=50,t=1,n=.1,r=2e3){super(),this.isPerspectiveCamera=!0,this.type=`PerspectiveCamera`,this.fov=e,this.zoom=1,this.near=n,this.far=r,this.focus=10,this.aspect=t,this.view=null,this.filmGauge=35,this.filmOffset=0,this.updateProjectionMatrix()}copy(e,t){return super.copy(e,t),this.fov=e.fov,this.zoom=e.zoom,this.near=e.near,this.far=e.far,this.focus=e.focus,this.aspect=e.aspect,this.view=e.view===null?null:Object.assign({},e.view),this.filmGauge=e.filmGauge,this.filmOffset=e.filmOffset,this}setFocalLength(e){let t=.5*this.getFilmHeight()/e;this.fov=co*2*Math.atan(t),this.updateProjectionMatrix()}getFocalLength(){let e=Math.tan(so*.5*this.fov);return .5*this.getFilmHeight()/e}getEffectiveFOV(){return co*2*Math.atan(Math.tan(so*.5*this.fov)/this.zoom)}getFilmWidth(){return this.filmGauge*Math.min(this.aspect,1)}getFilmHeight(){return this.filmGauge/Math.max(this.aspect,1)}getViewBounds(e,t,n){hl.set(-1,-1,.5).applyMatrix4(this.projectionMatrixInverse),t.set(hl.x,hl.y).multiplyScalar(-e/hl.z),hl.set(1,1,.5).applyMatrix4(this.projectionMatrixInverse),n.set(hl.x,hl.y).multiplyScalar(-e/hl.z)}getViewSize(e,t){return this.getViewBounds(e,gl,_l),t.subVectors(_l,gl)}setViewOffset(e,t,n,r,i,a){this.aspect=e/t,this.view===null&&(this.view={enabled:!0,fullWidth:1,fullHeight:1,offsetX:0,offsetY:0,width:1,height:1}),this.view.enabled=!0,this.view.fullWidth=e,this.view.fullHeight=t,this.view.offsetX=n,this.view.offsetY=r,this.view.width=i,this.view.height=a,this.updateProjectionMatrix()}clearViewOffset(){this.view!==null&&(this.view.enabled=!1),this.updateProjectionMatrix()}updateProjectionMatrix(){let e=this.near,t=e*Math.tan(so*.5*this.fov)/this.zoom,n=2*t,r=this.aspect*n,i=-.5*r,a=this.view;if(this.view!==null&&this.view.enabled){let e=a.fullWidth,o=a.fullHeight;i+=a.offsetX*r/e,t-=a.offsetY*n/o,r*=a.width/e,n*=a.height/o}let o=this.filmOffset;o!==0&&(i+=e*o/this.getFilmWidth()),this.projectionMatrix.makePerspective(i,i+r,t,t-n,e,this.far,this.coordinateSystem),this.projectionMatrixInverse.copy(this.projectionMatrix).invert()}toJSON(e){let t=super.toJSON(e);return t.object.fov=this.fov,t.object.zoom=this.zoom,t.object.near=this.near,t.object.far=this.far,t.object.focus=this.focus,t.object.aspect=this.aspect,this.view!==null&&(t.object.view=Object.assign({},this.view)),t.object.filmGauge=this.filmGauge,t.object.filmOffset=this.filmOffset,t}},yl=-90,bl=1,xl=class extends lc{constructor(e,t,n){super(),this.type=`CubeCamera`,this.renderTarget=n,this.coordinateSystem=null,this.activeMipmapLevel=0;let r=new vl(yl,bl,e,t);r.layers=this.layers,this.add(r);let i=new vl(yl,bl,e,t);i.layers=this.layers,this.add(i);let a=new vl(yl,bl,e,t);a.layers=this.layers,this.add(a);let o=new vl(yl,bl,e,t);o.layers=this.layers,this.add(o);let s=new vl(yl,bl,e,t);s.layers=this.layers,this.add(s);let c=new vl(yl,bl,e,t);c.layers=this.layers,this.add(c)}updateCoordinateSystem(){let e=this.coordinateSystem,t=this.children.concat(),[n,r,i,a,o,s]=t;for(let e of t)this.remove(e);if(e===2e3)n.up.set(0,1,0),n.lookAt(1,0,0),r.up.set(0,1,0),r.lookAt(-1,0,0),i.up.set(0,0,-1),i.lookAt(0,1,0),a.up.set(0,0,1),a.lookAt(0,-1,0),o.up.set(0,1,0),o.lookAt(0,0,1),s.up.set(0,1,0),s.lookAt(0,0,-1);else if(e===2001)n.up.set(0,-1,0),n.lookAt(-1,0,0),r.up.set(0,-1,0),r.lookAt(1,0,0),i.up.set(0,0,1),i.lookAt(0,1,0),a.up.set(0,0,-1),a.lookAt(0,-1,0),o.up.set(0,-1,0),o.lookAt(0,0,1),s.up.set(0,-1,0),s.lookAt(0,0,-1);else throw Error(`THREE.CubeCamera.updateCoordinateSystem(): Invalid coordinate system: `+e);for(let e of t)this.add(e),e.updateMatrixWorld()}update(e,t){this.parent===null&&this.updateMatrixWorld();let{renderTarget:n,activeMipmapLevel:r}=this;this.coordinateSystem!==e.coordinateSystem&&(this.coordinateSystem=e.coordinateSystem,this.updateCoordinateSystem());let[i,a,o,s,c,l]=this.children,u=e.getRenderTarget(),d=e.getActiveCubeFace(),f=e.getActiveMipmapLevel(),p=e.xr.enabled;e.xr.enabled=!1;let m=n.texture.generateMipmaps;n.texture.generateMipmaps=!1,e.setRenderTarget(n,0,r),e.render(t,i),e.setRenderTarget(n,1,r),e.render(t,a),e.setRenderTarget(n,2,r),e.render(t,o),e.setRenderTarget(n,3,r),e.render(t,s),e.setRenderTarget(n,4,r),e.render(t,c),n.texture.generateMipmaps=m,e.setRenderTarget(n,5,r),e.render(t,l),e.setRenderTarget(u,d,f),e.xr.enabled=p,n.texture.needsPMREMUpdate=!0}},Sl=class extends es{constructor(e,t,n,r,i,a,o,s,c,l){e=e===void 0?[]:e,t=t===void 0?301:t,super(e,t,n,r,i,a,o,s,c,l),this.isCubeTexture=!0,this.flipY=!1}get images(){return this.image}set images(e){this.image=e}},Cl=class extends rs{constructor(e=1,t={}){super(e,e,t),this.isWebGLCubeRenderTarget=!0;let n={width:e,height:e,depth:1},r=[n,n,n,n,n,n];this.texture=new Sl(r,t.mapping,t.wrapS,t.wrapT,t.magFilter,t.minFilter,t.format,t.type,t.anisotropy,t.colorSpace),this.texture.isRenderTargetTexture=!0,this.texture.generateMipmaps=t.generateMipmaps!==void 0&&t.generateMipmaps,this.texture.minFilter=t.minFilter===void 0?Fi:t.minFilter}fromEquirectangularTexture(e,t){this.texture.type=t.type,this.texture.colorSpace=t.colorSpace,this.texture.generateMipmaps=t.generateMipmaps,this.texture.minFilter=t.minFilter,this.texture.magFilter=t.magFilter;let n={uniforms:{tEquirect:{value:null}},vertexShader:`

				varying vec3 vWorldDirection;

				vec3 transformDirection( in vec3 dir, in mat4 matrix ) {

					return normalize( ( matrix * vec4( dir, 0.0 ) ).xyz );

				}

				void main() {

					vWorldDirection = transformDirection( position, modelMatrix );

					#include <begin_vertex>
					#include <project_vertex>

				}
			`,fragmentShader:`

				uniform sampler2D tEquirect;

				varying vec3 vWorldDirection;

				#include <common>

				void main() {

					vec3 direction = normalize( vWorldDirection );

					vec2 sampleUV = equirectUv( direction );

					gl_FragColor = texture2D( tEquirect, sampleUV );

				}
			`},r=new al(5,5,5),i=new pl({name:`CubemapFromEquirect`,uniforms:ol(n.uniforms),vertexShader:n.vertexShader,fragmentShader:n.fragmentShader,side:1,blending:0});i.uniforms.tEquirect.value=t;let a=new nl(r,i),o=t.minFilter;return t.minFilter===1008&&(t.minFilter=Fi),new xl(1,10,this).update(e,a),t.minFilter=o,a.geometry.dispose(),a.material.dispose(),this}clear(e,t,n,r){let i=e.getRenderTarget();for(let i=0;i<6;i++)e.setRenderTarget(this,i),e.clear(t,n,r);e.setRenderTarget(i)}},wl=new G,Tl=new G,El=new U,Dl=class{constructor(e=new G(1,0,0),t=0){this.isPlane=!0,this.normal=e,this.constant=t}set(e,t){return this.normal.copy(e),this.constant=t,this}setComponents(e,t,n,r){return this.normal.set(e,t,n),this.constant=r,this}setFromNormalAndCoplanarPoint(e,t){return this.normal.copy(e),this.constant=-t.dot(this.normal),this}setFromCoplanarPoints(e,t,n){let r=wl.subVectors(n,t).cross(Tl.subVectors(e,t)).normalize();return this.setFromNormalAndCoplanarPoint(r,e),this}copy(e){return this.normal.copy(e.normal),this.constant=e.constant,this}normalize(){let e=1/this.normal.length();return this.normal.multiplyScalar(e),this.constant*=e,this}negate(){return this.constant*=-1,this.normal.negate(),this}distanceToPoint(e){return this.normal.dot(e)+this.constant}distanceToSphere(e){return this.distanceToPoint(e.center)-e.radius}projectPoint(e,t){return t.copy(e).addScaledVector(this.normal,-this.distanceToPoint(e))}intersectLine(e,t){let n=e.delta(wl),r=this.normal.dot(n);if(r===0)return this.distanceToPoint(e.start)===0?t.copy(e.start):null;let i=-(e.start.dot(this.normal)+this.constant)/r;return i<0||i>1?null:t.copy(e.start).addScaledVector(n,i)}intersectsLine(e){let t=this.distanceToPoint(e.start),n=this.distanceToPoint(e.end);return t<0&&n>0||n<0&&t>0}intersectsBox(e){return e.intersectsPlane(this)}intersectsSphere(e){return e.intersectsPlane(this)}coplanarPoint(e){return e.copy(this.normal).multiplyScalar(-this.constant)}applyMatrix4(e,t){let n=t||El.getNormalMatrix(e),r=this.coplanarPoint(wl).applyMatrix4(e),i=this.normal.applyMatrix3(n).normalize();return this.constant=-r.dot(i),this}translate(e){return this.constant-=e.dot(this.normal),this}equals(e){return e.normal.equals(this.normal)&&e.constant===this.constant}clone(){return new this.constructor().copy(this)}},Ol=new Ds,kl=new G,Al=class{constructor(e=new Dl,t=new Dl,n=new Dl,r=new Dl,i=new Dl,a=new Dl){this.planes=[e,t,n,r,i,a]}set(e,t,n,r,i,a){let o=this.planes;return o[0].copy(e),o[1].copy(t),o[2].copy(n),o[3].copy(r),o[4].copy(i),o[5].copy(a),this}copy(e){let t=this.planes;for(let n=0;n<6;n++)t[n].copy(e.planes[n]);return this}setFromProjectionMatrix(e,t=ro){let n=this.planes,r=e.elements,i=r[0],a=r[1],o=r[2],s=r[3],c=r[4],l=r[5],u=r[6],d=r[7],f=r[8],p=r[9],m=r[10],h=r[11],g=r[12],_=r[13],v=r[14],y=r[15];if(n[0].setComponents(s-i,d-c,h-f,y-g).normalize(),n[1].setComponents(s+i,d+c,h+f,y+g).normalize(),n[2].setComponents(s+a,d+l,h+p,y+_).normalize(),n[3].setComponents(s-a,d-l,h-p,y-_).normalize(),n[4].setComponents(s-o,d-u,h-m,y-v).normalize(),t===2e3)n[5].setComponents(s+o,d+u,h+m,y+v).normalize();else if(t===2001)n[5].setComponents(o,u,m,v).normalize();else throw Error(`THREE.Frustum.setFromProjectionMatrix(): Invalid coordinate system: `+t);return this}intersectsObject(e){if(e.boundingSphere!==void 0)e.boundingSphere===null&&e.computeBoundingSphere(),Ol.copy(e.boundingSphere).applyMatrix4(e.matrixWorld);else{let t=e.geometry;t.boundingSphere===null&&t.computeBoundingSphere(),Ol.copy(t.boundingSphere).applyMatrix4(e.matrixWorld)}return this.intersectsSphere(Ol)}intersectsSprite(e){return Ol.center.set(0,0,0),Ol.radius=.7071067811865476,Ol.applyMatrix4(e.matrixWorld),this.intersectsSphere(Ol)}intersectsSphere(e){let t=this.planes,n=e.center,r=-e.radius;for(let e=0;e<6;e++)if(t[e].distanceToPoint(n)<r)return!1;return!0}intersectsBox(e){let t=this.planes;for(let n=0;n<6;n++){let r=t[n];if(kl.x=r.normal.x>0?e.max.x:e.min.x,kl.y=r.normal.y>0?e.max.y:e.min.y,kl.z=r.normal.z>0?e.max.z:e.min.z,r.distanceToPoint(kl)<0)return!1}return!0}containsPoint(e){let t=this.planes;for(let n=0;n<6;n++)if(t[n].distanceToPoint(e)<0)return!1;return!0}clone(){return new this.constructor().copy(this)}};function jl(){let e=null,t=!1,n=null,r=null;function i(t,a){n(t,a),r=e.requestAnimationFrame(i)}return{start:function(){t!==!0&&n!==null&&(r=e.requestAnimationFrame(i),t=!0)},stop:function(){e.cancelAnimationFrame(r),t=!1},setAnimationLoop:function(e){n=e},setContext:function(t){e=t}}}function Ml(e){let t=new WeakMap;function n(t,n){let r=t.array,i=t.usage,a=r.byteLength,o=e.createBuffer();e.bindBuffer(n,o),e.bufferData(n,r,i),t.onUploadCallback();let s;if(r instanceof Float32Array)s=e.FLOAT;else if(r instanceof Uint16Array)s=t.isFloat16BufferAttribute?e.HALF_FLOAT:e.UNSIGNED_SHORT;else if(r instanceof Int16Array)s=e.SHORT;else if(r instanceof Uint32Array)s=e.UNSIGNED_INT;else if(r instanceof Int32Array)s=e.INT;else if(r instanceof Int8Array)s=e.BYTE;else if(r instanceof Uint8Array)s=e.UNSIGNED_BYTE;else if(r instanceof Uint8ClampedArray)s=e.UNSIGNED_BYTE;else throw Error(`THREE.WebGLAttributes: Unsupported buffer data format: `+r);return{buffer:o,type:s,bytesPerElement:r.BYTES_PER_ELEMENT,version:t.version,size:a}}function r(t,n,r){let i=n.array,a=n.updateRanges;if(e.bindBuffer(r,t),a.length===0)e.bufferSubData(r,0,i);else{a.sort((e,t)=>e.start-t.start);let t=0;for(let e=1;e<a.length;e++){let n=a[t],r=a[e];r.start<=n.start+n.count+1?n.count=Math.max(n.count,r.start+r.count-n.start):(++t,a[t]=r)}a.length=t+1;for(let t=0,n=a.length;t<n;t++){let n=a[t];e.bufferSubData(r,n.start*i.BYTES_PER_ELEMENT,i,n.start,n.count)}n.clearUpdateRanges()}n.onUploadCallback()}function i(e){return e.isInterleavedBufferAttribute&&(e=e.data),t.get(e)}function a(n){n.isInterleavedBufferAttribute&&(n=n.data);let r=t.get(n);r&&(e.deleteBuffer(r.buffer),t.delete(n))}function o(e,i){if(e.isInterleavedBufferAttribute&&(e=e.data),e.isGLBufferAttribute){let n=t.get(e);(!n||n.version<e.version)&&t.set(e,{buffer:e.buffer,type:e.type,bytesPerElement:e.elementSize,version:e.version});return}let a=t.get(e);if(a===void 0)t.set(e,n(e,i));else if(a.version<e.version){if(a.size!==e.array.byteLength)throw Error(`THREE.WebGLAttributes: The size of the buffer attribute's array buffer does not match the original size. Resizing buffer attributes is not supported.`);r(a.buffer,e,i),a.version=e.version}}return{get:i,remove:a,update:o}}var Nl=class e extends Wc{constructor(e=1,t=1,n=1,r=1){super(),this.type=`PlaneGeometry`,this.parameters={width:e,height:t,widthSegments:n,heightSegments:r};let i=e/2,a=t/2,o=Math.floor(n),s=Math.floor(r),c=o+1,l=s+1,u=e/o,d=t/s,f=[],p=[],m=[],h=[];for(let e=0;e<l;e++){let t=e*d-a;for(let n=0;n<c;n++){let r=n*u-i;p.push(r,-t,0),m.push(0,0,1),h.push(n/o),h.push(1-e/s)}}for(let e=0;e<s;e++)for(let t=0;t<o;t++){let n=t+c*e,r=t+c*(e+1),i=t+1+c*(e+1),a=t+1+c*e;f.push(n,r,a),f.push(r,i,a)}this.setIndex(f),this.setAttribute(`position`,new q(p,3)),this.setAttribute(`normal`,new q(m,3)),this.setAttribute(`uv`,new q(h,2))}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(t){return new e(t.width,t.height,t.widthSegments,t.heightSegments)}},J={alphahash_fragment:`#ifdef USE_ALPHAHASH
	if ( diffuseColor.a < getAlphaHashThreshold( vPosition ) ) discard;
#endif`,alphahash_pars_fragment:`#ifdef USE_ALPHAHASH
	const float ALPHA_HASH_SCALE = 0.05;
	float hash2D( vec2 value ) {
		return fract( 1.0e4 * sin( 17.0 * value.x + 0.1 * value.y ) * ( 0.1 + abs( sin( 13.0 * value.y + value.x ) ) ) );
	}
	float hash3D( vec3 value ) {
		return hash2D( vec2( hash2D( value.xy ), value.z ) );
	}
	float getAlphaHashThreshold( vec3 position ) {
		float maxDeriv = max(
			length( dFdx( position.xyz ) ),
			length( dFdy( position.xyz ) )
		);
		float pixScale = 1.0 / ( ALPHA_HASH_SCALE * maxDeriv );
		vec2 pixScales = vec2(
			exp2( floor( log2( pixScale ) ) ),
			exp2( ceil( log2( pixScale ) ) )
		);
		vec2 alpha = vec2(
			hash3D( floor( pixScales.x * position.xyz ) ),
			hash3D( floor( pixScales.y * position.xyz ) )
		);
		float lerpFactor = fract( log2( pixScale ) );
		float x = ( 1.0 - lerpFactor ) * alpha.x + lerpFactor * alpha.y;
		float a = min( lerpFactor, 1.0 - lerpFactor );
		vec3 cases = vec3(
			x * x / ( 2.0 * a * ( 1.0 - a ) ),
			( x - 0.5 * a ) / ( 1.0 - a ),
			1.0 - ( ( 1.0 - x ) * ( 1.0 - x ) / ( 2.0 * a * ( 1.0 - a ) ) )
		);
		float threshold = ( x < ( 1.0 - a ) )
			? ( ( x < a ) ? cases.x : cases.y )
			: cases.z;
		return clamp( threshold , 1.0e-6, 1.0 );
	}
#endif`,alphamap_fragment:`#ifdef USE_ALPHAMAP
	diffuseColor.a *= texture2D( alphaMap, vAlphaMapUv ).g;
#endif`,alphamap_pars_fragment:`#ifdef USE_ALPHAMAP
	uniform sampler2D alphaMap;
#endif`,alphatest_fragment:`#ifdef USE_ALPHATEST
	#ifdef ALPHA_TO_COVERAGE
	diffuseColor.a = smoothstep( alphaTest, alphaTest + fwidth( diffuseColor.a ), diffuseColor.a );
	if ( diffuseColor.a == 0.0 ) discard;
	#else
	if ( diffuseColor.a < alphaTest ) discard;
	#endif
#endif`,alphatest_pars_fragment:`#ifdef USE_ALPHATEST
	uniform float alphaTest;
#endif`,aomap_fragment:`#ifdef USE_AOMAP
	float ambientOcclusion = ( texture2D( aoMap, vAoMapUv ).r - 1.0 ) * aoMapIntensity + 1.0;
	reflectedLight.indirectDiffuse *= ambientOcclusion;
	#if defined( USE_CLEARCOAT ) 
		clearcoatSpecularIndirect *= ambientOcclusion;
	#endif
	#if defined( USE_SHEEN ) 
		sheenSpecularIndirect *= ambientOcclusion;
	#endif
	#if defined( USE_ENVMAP ) && defined( STANDARD )
		float dotNV = saturate( dot( geometryNormal, geometryViewDir ) );
		reflectedLight.indirectSpecular *= computeSpecularOcclusion( dotNV, ambientOcclusion, material.roughness );
	#endif
#endif`,aomap_pars_fragment:`#ifdef USE_AOMAP
	uniform sampler2D aoMap;
	uniform float aoMapIntensity;
#endif`,batching_pars_vertex:`#ifdef USE_BATCHING
	#if ! defined( GL_ANGLE_multi_draw )
	#define gl_DrawID _gl_DrawID
	uniform int _gl_DrawID;
	#endif
	uniform highp sampler2D batchingTexture;
	uniform highp usampler2D batchingIdTexture;
	mat4 getBatchingMatrix( const in float i ) {
		int size = textureSize( batchingTexture, 0 ).x;
		int j = int( i ) * 4;
		int x = j % size;
		int y = j / size;
		vec4 v1 = texelFetch( batchingTexture, ivec2( x, y ), 0 );
		vec4 v2 = texelFetch( batchingTexture, ivec2( x + 1, y ), 0 );
		vec4 v3 = texelFetch( batchingTexture, ivec2( x + 2, y ), 0 );
		vec4 v4 = texelFetch( batchingTexture, ivec2( x + 3, y ), 0 );
		return mat4( v1, v2, v3, v4 );
	}
	float getIndirectIndex( const in int i ) {
		int size = textureSize( batchingIdTexture, 0 ).x;
		int x = i % size;
		int y = i / size;
		return float( texelFetch( batchingIdTexture, ivec2( x, y ), 0 ).r );
	}
#endif
#ifdef USE_BATCHING_COLOR
	uniform sampler2D batchingColorTexture;
	vec3 getBatchingColor( const in float i ) {
		int size = textureSize( batchingColorTexture, 0 ).x;
		int j = int( i );
		int x = j % size;
		int y = j / size;
		return texelFetch( batchingColorTexture, ivec2( x, y ), 0 ).rgb;
	}
#endif`,batching_vertex:`#ifdef USE_BATCHING
	mat4 batchingMatrix = getBatchingMatrix( getIndirectIndex( gl_DrawID ) );
#endif`,begin_vertex:`vec3 transformed = vec3( position );
#ifdef USE_ALPHAHASH
	vPosition = vec3( position );
#endif`,beginnormal_vertex:`vec3 objectNormal = vec3( normal );
#ifdef USE_TANGENT
	vec3 objectTangent = vec3( tangent.xyz );
#endif`,bsdfs:`float G_BlinnPhong_Implicit( ) {
	return 0.25;
}
float D_BlinnPhong( const in float shininess, const in float dotNH ) {
	return RECIPROCAL_PI * ( shininess * 0.5 + 1.0 ) * pow( dotNH, shininess );
}
vec3 BRDF_BlinnPhong( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in vec3 specularColor, const in float shininess ) {
	vec3 halfDir = normalize( lightDir + viewDir );
	float dotNH = saturate( dot( normal, halfDir ) );
	float dotVH = saturate( dot( viewDir, halfDir ) );
	vec3 F = F_Schlick( specularColor, 1.0, dotVH );
	float G = G_BlinnPhong_Implicit( );
	float D = D_BlinnPhong( shininess, dotNH );
	return F * ( G * D );
} // validated`,iridescence_fragment:`#ifdef USE_IRIDESCENCE
	const mat3 XYZ_TO_REC709 = mat3(
		 3.2404542, -0.9692660,  0.0556434,
		-1.5371385,  1.8760108, -0.2040259,
		-0.4985314,  0.0415560,  1.0572252
	);
	vec3 Fresnel0ToIor( vec3 fresnel0 ) {
		vec3 sqrtF0 = sqrt( fresnel0 );
		return ( vec3( 1.0 ) + sqrtF0 ) / ( vec3( 1.0 ) - sqrtF0 );
	}
	vec3 IorToFresnel0( vec3 transmittedIor, float incidentIor ) {
		return pow2( ( transmittedIor - vec3( incidentIor ) ) / ( transmittedIor + vec3( incidentIor ) ) );
	}
	float IorToFresnel0( float transmittedIor, float incidentIor ) {
		return pow2( ( transmittedIor - incidentIor ) / ( transmittedIor + incidentIor ));
	}
	vec3 evalSensitivity( float OPD, vec3 shift ) {
		float phase = 2.0 * PI * OPD * 1.0e-9;
		vec3 val = vec3( 5.4856e-13, 4.4201e-13, 5.2481e-13 );
		vec3 pos = vec3( 1.6810e+06, 1.7953e+06, 2.2084e+06 );
		vec3 var = vec3( 4.3278e+09, 9.3046e+09, 6.6121e+09 );
		vec3 xyz = val * sqrt( 2.0 * PI * var ) * cos( pos * phase + shift ) * exp( - pow2( phase ) * var );
		xyz.x += 9.7470e-14 * sqrt( 2.0 * PI * 4.5282e+09 ) * cos( 2.2399e+06 * phase + shift[ 0 ] ) * exp( - 4.5282e+09 * pow2( phase ) );
		xyz /= 1.0685e-7;
		vec3 rgb = XYZ_TO_REC709 * xyz;
		return rgb;
	}
	vec3 evalIridescence( float outsideIOR, float eta2, float cosTheta1, float thinFilmThickness, vec3 baseF0 ) {
		vec3 I;
		float iridescenceIOR = mix( outsideIOR, eta2, smoothstep( 0.0, 0.03, thinFilmThickness ) );
		float sinTheta2Sq = pow2( outsideIOR / iridescenceIOR ) * ( 1.0 - pow2( cosTheta1 ) );
		float cosTheta2Sq = 1.0 - sinTheta2Sq;
		if ( cosTheta2Sq < 0.0 ) {
			return vec3( 1.0 );
		}
		float cosTheta2 = sqrt( cosTheta2Sq );
		float R0 = IorToFresnel0( iridescenceIOR, outsideIOR );
		float R12 = F_Schlick( R0, 1.0, cosTheta1 );
		float T121 = 1.0 - R12;
		float phi12 = 0.0;
		if ( iridescenceIOR < outsideIOR ) phi12 = PI;
		float phi21 = PI - phi12;
		vec3 baseIOR = Fresnel0ToIor( clamp( baseF0, 0.0, 0.9999 ) );		vec3 R1 = IorToFresnel0( baseIOR, iridescenceIOR );
		vec3 R23 = F_Schlick( R1, 1.0, cosTheta2 );
		vec3 phi23 = vec3( 0.0 );
		if ( baseIOR[ 0 ] < iridescenceIOR ) phi23[ 0 ] = PI;
		if ( baseIOR[ 1 ] < iridescenceIOR ) phi23[ 1 ] = PI;
		if ( baseIOR[ 2 ] < iridescenceIOR ) phi23[ 2 ] = PI;
		float OPD = 2.0 * iridescenceIOR * thinFilmThickness * cosTheta2;
		vec3 phi = vec3( phi21 ) + phi23;
		vec3 R123 = clamp( R12 * R23, 1e-5, 0.9999 );
		vec3 r123 = sqrt( R123 );
		vec3 Rs = pow2( T121 ) * R23 / ( vec3( 1.0 ) - R123 );
		vec3 C0 = R12 + Rs;
		I = C0;
		vec3 Cm = Rs - T121;
		for ( int m = 1; m <= 2; ++ m ) {
			Cm *= r123;
			vec3 Sm = 2.0 * evalSensitivity( float( m ) * OPD, float( m ) * phi );
			I += Cm * Sm;
		}
		return max( I, vec3( 0.0 ) );
	}
#endif`,bumpmap_pars_fragment:`#ifdef USE_BUMPMAP
	uniform sampler2D bumpMap;
	uniform float bumpScale;
	vec2 dHdxy_fwd() {
		vec2 dSTdx = dFdx( vBumpMapUv );
		vec2 dSTdy = dFdy( vBumpMapUv );
		float Hll = bumpScale * texture2D( bumpMap, vBumpMapUv ).x;
		float dBx = bumpScale * texture2D( bumpMap, vBumpMapUv + dSTdx ).x - Hll;
		float dBy = bumpScale * texture2D( bumpMap, vBumpMapUv + dSTdy ).x - Hll;
		return vec2( dBx, dBy );
	}
	vec3 perturbNormalArb( vec3 surf_pos, vec3 surf_norm, vec2 dHdxy, float faceDirection ) {
		vec3 vSigmaX = normalize( dFdx( surf_pos.xyz ) );
		vec3 vSigmaY = normalize( dFdy( surf_pos.xyz ) );
		vec3 vN = surf_norm;
		vec3 R1 = cross( vSigmaY, vN );
		vec3 R2 = cross( vN, vSigmaX );
		float fDet = dot( vSigmaX, R1 ) * faceDirection;
		vec3 vGrad = sign( fDet ) * ( dHdxy.x * R1 + dHdxy.y * R2 );
		return normalize( abs( fDet ) * surf_norm - vGrad );
	}
#endif`,clipping_planes_fragment:`#if NUM_CLIPPING_PLANES > 0
	vec4 plane;
	#ifdef ALPHA_TO_COVERAGE
		float distanceToPlane, distanceGradient;
		float clipOpacity = 1.0;
		#pragma unroll_loop_start
		for ( int i = 0; i < UNION_CLIPPING_PLANES; i ++ ) {
			plane = clippingPlanes[ i ];
			distanceToPlane = - dot( vClipPosition, plane.xyz ) + plane.w;
			distanceGradient = fwidth( distanceToPlane ) / 2.0;
			clipOpacity *= smoothstep( - distanceGradient, distanceGradient, distanceToPlane );
			if ( clipOpacity == 0.0 ) discard;
		}
		#pragma unroll_loop_end
		#if UNION_CLIPPING_PLANES < NUM_CLIPPING_PLANES
			float unionClipOpacity = 1.0;
			#pragma unroll_loop_start
			for ( int i = UNION_CLIPPING_PLANES; i < NUM_CLIPPING_PLANES; i ++ ) {
				plane = clippingPlanes[ i ];
				distanceToPlane = - dot( vClipPosition, plane.xyz ) + plane.w;
				distanceGradient = fwidth( distanceToPlane ) / 2.0;
				unionClipOpacity *= 1.0 - smoothstep( - distanceGradient, distanceGradient, distanceToPlane );
			}
			#pragma unroll_loop_end
			clipOpacity *= 1.0 - unionClipOpacity;
		#endif
		diffuseColor.a *= clipOpacity;
		if ( diffuseColor.a == 0.0 ) discard;
	#else
		#pragma unroll_loop_start
		for ( int i = 0; i < UNION_CLIPPING_PLANES; i ++ ) {
			plane = clippingPlanes[ i ];
			if ( dot( vClipPosition, plane.xyz ) > plane.w ) discard;
		}
		#pragma unroll_loop_end
		#if UNION_CLIPPING_PLANES < NUM_CLIPPING_PLANES
			bool clipped = true;
			#pragma unroll_loop_start
			for ( int i = UNION_CLIPPING_PLANES; i < NUM_CLIPPING_PLANES; i ++ ) {
				plane = clippingPlanes[ i ];
				clipped = ( dot( vClipPosition, plane.xyz ) > plane.w ) && clipped;
			}
			#pragma unroll_loop_end
			if ( clipped ) discard;
		#endif
	#endif
#endif`,clipping_planes_pars_fragment:`#if NUM_CLIPPING_PLANES > 0
	varying vec3 vClipPosition;
	uniform vec4 clippingPlanes[ NUM_CLIPPING_PLANES ];
#endif`,clipping_planes_pars_vertex:`#if NUM_CLIPPING_PLANES > 0
	varying vec3 vClipPosition;
#endif`,clipping_planes_vertex:`#if NUM_CLIPPING_PLANES > 0
	vClipPosition = - mvPosition.xyz;
#endif`,color_fragment:`#if defined( USE_COLOR_ALPHA )
	diffuseColor *= vColor;
#elif defined( USE_COLOR )
	diffuseColor.rgb *= vColor;
#endif`,color_pars_fragment:`#if defined( USE_COLOR_ALPHA )
	varying vec4 vColor;
#elif defined( USE_COLOR )
	varying vec3 vColor;
#endif`,color_pars_vertex:`#if defined( USE_COLOR_ALPHA )
	varying vec4 vColor;
#elif defined( USE_COLOR ) || defined( USE_INSTANCING_COLOR ) || defined( USE_BATCHING_COLOR )
	varying vec3 vColor;
#endif`,color_vertex:`#if defined( USE_COLOR_ALPHA )
	vColor = vec4( 1.0 );
#elif defined( USE_COLOR ) || defined( USE_INSTANCING_COLOR ) || defined( USE_BATCHING_COLOR )
	vColor = vec3( 1.0 );
#endif
#ifdef USE_COLOR
	vColor *= color;
#endif
#ifdef USE_INSTANCING_COLOR
	vColor.xyz *= instanceColor.xyz;
#endif
#ifdef USE_BATCHING_COLOR
	vec3 batchingColor = getBatchingColor( getIndirectIndex( gl_DrawID ) );
	vColor.xyz *= batchingColor.xyz;
#endif`,common:`#define PI 3.141592653589793
#define PI2 6.283185307179586
#define PI_HALF 1.5707963267948966
#define RECIPROCAL_PI 0.3183098861837907
#define RECIPROCAL_PI2 0.15915494309189535
#define EPSILON 1e-6
#ifndef saturate
#define saturate( a ) clamp( a, 0.0, 1.0 )
#endif
#define whiteComplement( a ) ( 1.0 - saturate( a ) )
float pow2( const in float x ) { return x*x; }
vec3 pow2( const in vec3 x ) { return x*x; }
float pow3( const in float x ) { return x*x*x; }
float pow4( const in float x ) { float x2 = x*x; return x2*x2; }
float max3( const in vec3 v ) { return max( max( v.x, v.y ), v.z ); }
float average( const in vec3 v ) { return dot( v, vec3( 0.3333333 ) ); }
highp float rand( const in vec2 uv ) {
	const highp float a = 12.9898, b = 78.233, c = 43758.5453;
	highp float dt = dot( uv.xy, vec2( a,b ) ), sn = mod( dt, PI );
	return fract( sin( sn ) * c );
}
#ifdef HIGH_PRECISION
	float precisionSafeLength( vec3 v ) { return length( v ); }
#else
	float precisionSafeLength( vec3 v ) {
		float maxComponent = max3( abs( v ) );
		return length( v / maxComponent ) * maxComponent;
	}
#endif
struct IncidentLight {
	vec3 color;
	vec3 direction;
	bool visible;
};
struct ReflectedLight {
	vec3 directDiffuse;
	vec3 directSpecular;
	vec3 indirectDiffuse;
	vec3 indirectSpecular;
};
#ifdef USE_ALPHAHASH
	varying vec3 vPosition;
#endif
vec3 transformDirection( in vec3 dir, in mat4 matrix ) {
	return normalize( ( matrix * vec4( dir, 0.0 ) ).xyz );
}
vec3 inverseTransformDirection( in vec3 dir, in mat4 matrix ) {
	return normalize( ( vec4( dir, 0.0 ) * matrix ).xyz );
}
mat3 transposeMat3( const in mat3 m ) {
	mat3 tmp;
	tmp[ 0 ] = vec3( m[ 0 ].x, m[ 1 ].x, m[ 2 ].x );
	tmp[ 1 ] = vec3( m[ 0 ].y, m[ 1 ].y, m[ 2 ].y );
	tmp[ 2 ] = vec3( m[ 0 ].z, m[ 1 ].z, m[ 2 ].z );
	return tmp;
}
bool isPerspectiveMatrix( mat4 m ) {
	return m[ 2 ][ 3 ] == - 1.0;
}
vec2 equirectUv( in vec3 dir ) {
	float u = atan( dir.z, dir.x ) * RECIPROCAL_PI2 + 0.5;
	float v = asin( clamp( dir.y, - 1.0, 1.0 ) ) * RECIPROCAL_PI + 0.5;
	return vec2( u, v );
}
vec3 BRDF_Lambert( const in vec3 diffuseColor ) {
	return RECIPROCAL_PI * diffuseColor;
}
vec3 F_Schlick( const in vec3 f0, const in float f90, const in float dotVH ) {
	float fresnel = exp2( ( - 5.55473 * dotVH - 6.98316 ) * dotVH );
	return f0 * ( 1.0 - fresnel ) + ( f90 * fresnel );
}
float F_Schlick( const in float f0, const in float f90, const in float dotVH ) {
	float fresnel = exp2( ( - 5.55473 * dotVH - 6.98316 ) * dotVH );
	return f0 * ( 1.0 - fresnel ) + ( f90 * fresnel );
} // validated`,cube_uv_reflection_fragment:`#ifdef ENVMAP_TYPE_CUBE_UV
	#define cubeUV_minMipLevel 4.0
	#define cubeUV_minTileSize 16.0
	float getFace( vec3 direction ) {
		vec3 absDirection = abs( direction );
		float face = - 1.0;
		if ( absDirection.x > absDirection.z ) {
			if ( absDirection.x > absDirection.y )
				face = direction.x > 0.0 ? 0.0 : 3.0;
			else
				face = direction.y > 0.0 ? 1.0 : 4.0;
		} else {
			if ( absDirection.z > absDirection.y )
				face = direction.z > 0.0 ? 2.0 : 5.0;
			else
				face = direction.y > 0.0 ? 1.0 : 4.0;
		}
		return face;
	}
	vec2 getUV( vec3 direction, float face ) {
		vec2 uv;
		if ( face == 0.0 ) {
			uv = vec2( direction.z, direction.y ) / abs( direction.x );
		} else if ( face == 1.0 ) {
			uv = vec2( - direction.x, - direction.z ) / abs( direction.y );
		} else if ( face == 2.0 ) {
			uv = vec2( - direction.x, direction.y ) / abs( direction.z );
		} else if ( face == 3.0 ) {
			uv = vec2( - direction.z, direction.y ) / abs( direction.x );
		} else if ( face == 4.0 ) {
			uv = vec2( - direction.x, direction.z ) / abs( direction.y );
		} else {
			uv = vec2( direction.x, direction.y ) / abs( direction.z );
		}
		return 0.5 * ( uv + 1.0 );
	}
	vec3 bilinearCubeUV( sampler2D envMap, vec3 direction, float mipInt ) {
		float face = getFace( direction );
		float filterInt = max( cubeUV_minMipLevel - mipInt, 0.0 );
		mipInt = max( mipInt, cubeUV_minMipLevel );
		float faceSize = exp2( mipInt );
		highp vec2 uv = getUV( direction, face ) * ( faceSize - 2.0 ) + 1.0;
		if ( face > 2.0 ) {
			uv.y += faceSize;
			face -= 3.0;
		}
		uv.x += face * faceSize;
		uv.x += filterInt * 3.0 * cubeUV_minTileSize;
		uv.y += 4.0 * ( exp2( CUBEUV_MAX_MIP ) - faceSize );
		uv.x *= CUBEUV_TEXEL_WIDTH;
		uv.y *= CUBEUV_TEXEL_HEIGHT;
		#ifdef texture2DGradEXT
			return texture2DGradEXT( envMap, uv, vec2( 0.0 ), vec2( 0.0 ) ).rgb;
		#else
			return texture2D( envMap, uv ).rgb;
		#endif
	}
	#define cubeUV_r0 1.0
	#define cubeUV_m0 - 2.0
	#define cubeUV_r1 0.8
	#define cubeUV_m1 - 1.0
	#define cubeUV_r4 0.4
	#define cubeUV_m4 2.0
	#define cubeUV_r5 0.305
	#define cubeUV_m5 3.0
	#define cubeUV_r6 0.21
	#define cubeUV_m6 4.0
	float roughnessToMip( float roughness ) {
		float mip = 0.0;
		if ( roughness >= cubeUV_r1 ) {
			mip = ( cubeUV_r0 - roughness ) * ( cubeUV_m1 - cubeUV_m0 ) / ( cubeUV_r0 - cubeUV_r1 ) + cubeUV_m0;
		} else if ( roughness >= cubeUV_r4 ) {
			mip = ( cubeUV_r1 - roughness ) * ( cubeUV_m4 - cubeUV_m1 ) / ( cubeUV_r1 - cubeUV_r4 ) + cubeUV_m1;
		} else if ( roughness >= cubeUV_r5 ) {
			mip = ( cubeUV_r4 - roughness ) * ( cubeUV_m5 - cubeUV_m4 ) / ( cubeUV_r4 - cubeUV_r5 ) + cubeUV_m4;
		} else if ( roughness >= cubeUV_r6 ) {
			mip = ( cubeUV_r5 - roughness ) * ( cubeUV_m6 - cubeUV_m5 ) / ( cubeUV_r5 - cubeUV_r6 ) + cubeUV_m5;
		} else {
			mip = - 2.0 * log2( 1.16 * roughness );		}
		return mip;
	}
	vec4 textureCubeUV( sampler2D envMap, vec3 sampleDir, float roughness ) {
		float mip = clamp( roughnessToMip( roughness ), cubeUV_m0, CUBEUV_MAX_MIP );
		float mipF = fract( mip );
		float mipInt = floor( mip );
		vec3 color0 = bilinearCubeUV( envMap, sampleDir, mipInt );
		if ( mipF == 0.0 ) {
			return vec4( color0, 1.0 );
		} else {
			vec3 color1 = bilinearCubeUV( envMap, sampleDir, mipInt + 1.0 );
			return vec4( mix( color0, color1, mipF ), 1.0 );
		}
	}
#endif`,defaultnormal_vertex:`vec3 transformedNormal = objectNormal;
#ifdef USE_TANGENT
	vec3 transformedTangent = objectTangent;
#endif
#ifdef USE_BATCHING
	mat3 bm = mat3( batchingMatrix );
	transformedNormal /= vec3( dot( bm[ 0 ], bm[ 0 ] ), dot( bm[ 1 ], bm[ 1 ] ), dot( bm[ 2 ], bm[ 2 ] ) );
	transformedNormal = bm * transformedNormal;
	#ifdef USE_TANGENT
		transformedTangent = bm * transformedTangent;
	#endif
#endif
#ifdef USE_INSTANCING
	mat3 im = mat3( instanceMatrix );
	transformedNormal /= vec3( dot( im[ 0 ], im[ 0 ] ), dot( im[ 1 ], im[ 1 ] ), dot( im[ 2 ], im[ 2 ] ) );
	transformedNormal = im * transformedNormal;
	#ifdef USE_TANGENT
		transformedTangent = im * transformedTangent;
	#endif
#endif
transformedNormal = normalMatrix * transformedNormal;
#ifdef FLIP_SIDED
	transformedNormal = - transformedNormal;
#endif
#ifdef USE_TANGENT
	transformedTangent = ( modelViewMatrix * vec4( transformedTangent, 0.0 ) ).xyz;
	#ifdef FLIP_SIDED
		transformedTangent = - transformedTangent;
	#endif
#endif`,displacementmap_pars_vertex:`#ifdef USE_DISPLACEMENTMAP
	uniform sampler2D displacementMap;
	uniform float displacementScale;
	uniform float displacementBias;
#endif`,displacementmap_vertex:`#ifdef USE_DISPLACEMENTMAP
	transformed += normalize( objectNormal ) * ( texture2D( displacementMap, vDisplacementMapUv ).x * displacementScale + displacementBias );
#endif`,emissivemap_fragment:`#ifdef USE_EMISSIVEMAP
	vec4 emissiveColor = texture2D( emissiveMap, vEmissiveMapUv );
	totalEmissiveRadiance *= emissiveColor.rgb;
#endif`,emissivemap_pars_fragment:`#ifdef USE_EMISSIVEMAP
	uniform sampler2D emissiveMap;
#endif`,colorspace_fragment:`gl_FragColor = linearToOutputTexel( gl_FragColor );`,colorspace_pars_fragment:`
const mat3 LINEAR_SRGB_TO_LINEAR_DISPLAY_P3 = mat3(
	vec3( 0.8224621, 0.177538, 0.0 ),
	vec3( 0.0331941, 0.9668058, 0.0 ),
	vec3( 0.0170827, 0.0723974, 0.9105199 )
);
const mat3 LINEAR_DISPLAY_P3_TO_LINEAR_SRGB = mat3(
	vec3( 1.2249401, - 0.2249404, 0.0 ),
	vec3( - 0.0420569, 1.0420571, 0.0 ),
	vec3( - 0.0196376, - 0.0786361, 1.0982735 )
);
vec4 LinearSRGBToLinearDisplayP3( in vec4 value ) {
	return vec4( value.rgb * LINEAR_SRGB_TO_LINEAR_DISPLAY_P3, value.a );
}
vec4 LinearDisplayP3ToLinearSRGB( in vec4 value ) {
	return vec4( value.rgb * LINEAR_DISPLAY_P3_TO_LINEAR_SRGB, value.a );
}
vec4 LinearTransferOETF( in vec4 value ) {
	return value;
}
vec4 sRGBTransferOETF( in vec4 value ) {
	return vec4( mix( pow( value.rgb, vec3( 0.41666 ) ) * 1.055 - vec3( 0.055 ), value.rgb * 12.92, vec3( lessThanEqual( value.rgb, vec3( 0.0031308 ) ) ) ), value.a );
}`,envmap_fragment:`#ifdef USE_ENVMAP
	#ifdef ENV_WORLDPOS
		vec3 cameraToFrag;
		if ( isOrthographic ) {
			cameraToFrag = normalize( vec3( - viewMatrix[ 0 ][ 2 ], - viewMatrix[ 1 ][ 2 ], - viewMatrix[ 2 ][ 2 ] ) );
		} else {
			cameraToFrag = normalize( vWorldPosition - cameraPosition );
		}
		vec3 worldNormal = inverseTransformDirection( normal, viewMatrix );
		#ifdef ENVMAP_MODE_REFLECTION
			vec3 reflectVec = reflect( cameraToFrag, worldNormal );
		#else
			vec3 reflectVec = refract( cameraToFrag, worldNormal, refractionRatio );
		#endif
	#else
		vec3 reflectVec = vReflect;
	#endif
	#ifdef ENVMAP_TYPE_CUBE
		vec4 envColor = textureCube( envMap, envMapRotation * vec3( flipEnvMap * reflectVec.x, reflectVec.yz ) );
	#else
		vec4 envColor = vec4( 0.0 );
	#endif
	#ifdef ENVMAP_BLENDING_MULTIPLY
		outgoingLight = mix( outgoingLight, outgoingLight * envColor.xyz, specularStrength * reflectivity );
	#elif defined( ENVMAP_BLENDING_MIX )
		outgoingLight = mix( outgoingLight, envColor.xyz, specularStrength * reflectivity );
	#elif defined( ENVMAP_BLENDING_ADD )
		outgoingLight += envColor.xyz * specularStrength * reflectivity;
	#endif
#endif`,envmap_common_pars_fragment:`#ifdef USE_ENVMAP
	uniform float envMapIntensity;
	uniform float flipEnvMap;
	uniform mat3 envMapRotation;
	#ifdef ENVMAP_TYPE_CUBE
		uniform samplerCube envMap;
	#else
		uniform sampler2D envMap;
	#endif
	
#endif`,envmap_pars_fragment:`#ifdef USE_ENVMAP
	uniform float reflectivity;
	#if defined( USE_BUMPMAP ) || defined( USE_NORMALMAP ) || defined( PHONG ) || defined( LAMBERT )
		#define ENV_WORLDPOS
	#endif
	#ifdef ENV_WORLDPOS
		varying vec3 vWorldPosition;
		uniform float refractionRatio;
	#else
		varying vec3 vReflect;
	#endif
#endif`,envmap_pars_vertex:`#ifdef USE_ENVMAP
	#if defined( USE_BUMPMAP ) || defined( USE_NORMALMAP ) || defined( PHONG ) || defined( LAMBERT )
		#define ENV_WORLDPOS
	#endif
	#ifdef ENV_WORLDPOS
		
		varying vec3 vWorldPosition;
	#else
		varying vec3 vReflect;
		uniform float refractionRatio;
	#endif
#endif`,envmap_physical_pars_fragment:`#ifdef USE_ENVMAP
	vec3 getIBLIrradiance( const in vec3 normal ) {
		#ifdef ENVMAP_TYPE_CUBE_UV
			vec3 worldNormal = inverseTransformDirection( normal, viewMatrix );
			vec4 envMapColor = textureCubeUV( envMap, envMapRotation * worldNormal, 1.0 );
			return PI * envMapColor.rgb * envMapIntensity;
		#else
			return vec3( 0.0 );
		#endif
	}
	vec3 getIBLRadiance( const in vec3 viewDir, const in vec3 normal, const in float roughness ) {
		#ifdef ENVMAP_TYPE_CUBE_UV
			vec3 reflectVec = reflect( - viewDir, normal );
			reflectVec = normalize( mix( reflectVec, normal, roughness * roughness) );
			reflectVec = inverseTransformDirection( reflectVec, viewMatrix );
			vec4 envMapColor = textureCubeUV( envMap, envMapRotation * reflectVec, roughness );
			return envMapColor.rgb * envMapIntensity;
		#else
			return vec3( 0.0 );
		#endif
	}
	#ifdef USE_ANISOTROPY
		vec3 getIBLAnisotropyRadiance( const in vec3 viewDir, const in vec3 normal, const in float roughness, const in vec3 bitangent, const in float anisotropy ) {
			#ifdef ENVMAP_TYPE_CUBE_UV
				vec3 bentNormal = cross( bitangent, viewDir );
				bentNormal = normalize( cross( bentNormal, bitangent ) );
				bentNormal = normalize( mix( bentNormal, normal, pow2( pow2( 1.0 - anisotropy * ( 1.0 - roughness ) ) ) ) );
				return getIBLRadiance( viewDir, bentNormal, roughness );
			#else
				return vec3( 0.0 );
			#endif
		}
	#endif
#endif`,envmap_vertex:`#ifdef USE_ENVMAP
	#ifdef ENV_WORLDPOS
		vWorldPosition = worldPosition.xyz;
	#else
		vec3 cameraToVertex;
		if ( isOrthographic ) {
			cameraToVertex = normalize( vec3( - viewMatrix[ 0 ][ 2 ], - viewMatrix[ 1 ][ 2 ], - viewMatrix[ 2 ][ 2 ] ) );
		} else {
			cameraToVertex = normalize( worldPosition.xyz - cameraPosition );
		}
		vec3 worldNormal = inverseTransformDirection( transformedNormal, viewMatrix );
		#ifdef ENVMAP_MODE_REFLECTION
			vReflect = reflect( cameraToVertex, worldNormal );
		#else
			vReflect = refract( cameraToVertex, worldNormal, refractionRatio );
		#endif
	#endif
#endif`,fog_vertex:`#ifdef USE_FOG
	vFogDepth = - mvPosition.z;
#endif`,fog_pars_vertex:`#ifdef USE_FOG
	varying float vFogDepth;
#endif`,fog_fragment:`#ifdef USE_FOG
	#ifdef FOG_EXP2
		float fogFactor = 1.0 - exp( - fogDensity * fogDensity * vFogDepth * vFogDepth );
	#else
		float fogFactor = smoothstep( fogNear, fogFar, vFogDepth );
	#endif
	gl_FragColor.rgb = mix( gl_FragColor.rgb, fogColor, fogFactor );
#endif`,fog_pars_fragment:`#ifdef USE_FOG
	uniform vec3 fogColor;
	varying float vFogDepth;
	#ifdef FOG_EXP2
		uniform float fogDensity;
	#else
		uniform float fogNear;
		uniform float fogFar;
	#endif
#endif`,gradientmap_pars_fragment:`#ifdef USE_GRADIENTMAP
	uniform sampler2D gradientMap;
#endif
vec3 getGradientIrradiance( vec3 normal, vec3 lightDirection ) {
	float dotNL = dot( normal, lightDirection );
	vec2 coord = vec2( dotNL * 0.5 + 0.5, 0.0 );
	#ifdef USE_GRADIENTMAP
		return vec3( texture2D( gradientMap, coord ).r );
	#else
		vec2 fw = fwidth( coord ) * 0.5;
		return mix( vec3( 0.7 ), vec3( 1.0 ), smoothstep( 0.7 - fw.x, 0.7 + fw.x, coord.x ) );
	#endif
}`,lightmap_pars_fragment:`#ifdef USE_LIGHTMAP
	uniform sampler2D lightMap;
	uniform float lightMapIntensity;
#endif`,lights_lambert_fragment:`LambertMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.specularStrength = specularStrength;`,lights_lambert_pars_fragment:`varying vec3 vViewPosition;
struct LambertMaterial {
	vec3 diffuseColor;
	float specularStrength;
};
void RE_Direct_Lambert( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in LambertMaterial material, inout ReflectedLight reflectedLight ) {
	float dotNL = saturate( dot( geometryNormal, directLight.direction ) );
	vec3 irradiance = dotNL * directLight.color;
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
void RE_IndirectDiffuse_Lambert( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in LambertMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
#define RE_Direct				RE_Direct_Lambert
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Lambert`,lights_pars_begin:`uniform bool receiveShadow;
uniform vec3 ambientLightColor;
#if defined( USE_LIGHT_PROBES )
	uniform vec3 lightProbe[ 9 ];
#endif
vec3 shGetIrradianceAt( in vec3 normal, in vec3 shCoefficients[ 9 ] ) {
	float x = normal.x, y = normal.y, z = normal.z;
	vec3 result = shCoefficients[ 0 ] * 0.886227;
	result += shCoefficients[ 1 ] * 2.0 * 0.511664 * y;
	result += shCoefficients[ 2 ] * 2.0 * 0.511664 * z;
	result += shCoefficients[ 3 ] * 2.0 * 0.511664 * x;
	result += shCoefficients[ 4 ] * 2.0 * 0.429043 * x * y;
	result += shCoefficients[ 5 ] * 2.0 * 0.429043 * y * z;
	result += shCoefficients[ 6 ] * ( 0.743125 * z * z - 0.247708 );
	result += shCoefficients[ 7 ] * 2.0 * 0.429043 * x * z;
	result += shCoefficients[ 8 ] * 0.429043 * ( x * x - y * y );
	return result;
}
vec3 getLightProbeIrradiance( const in vec3 lightProbe[ 9 ], const in vec3 normal ) {
	vec3 worldNormal = inverseTransformDirection( normal, viewMatrix );
	vec3 irradiance = shGetIrradianceAt( worldNormal, lightProbe );
	return irradiance;
}
vec3 getAmbientLightIrradiance( const in vec3 ambientLightColor ) {
	vec3 irradiance = ambientLightColor;
	return irradiance;
}
float getDistanceAttenuation( const in float lightDistance, const in float cutoffDistance, const in float decayExponent ) {
	float distanceFalloff = 1.0 / max( pow( lightDistance, decayExponent ), 0.01 );
	if ( cutoffDistance > 0.0 ) {
		distanceFalloff *= pow2( saturate( 1.0 - pow4( lightDistance / cutoffDistance ) ) );
	}
	return distanceFalloff;
}
float getSpotAttenuation( const in float coneCosine, const in float penumbraCosine, const in float angleCosine ) {
	return smoothstep( coneCosine, penumbraCosine, angleCosine );
}
#if NUM_DIR_LIGHTS > 0
	struct DirectionalLight {
		vec3 direction;
		vec3 color;
	};
	uniform DirectionalLight directionalLights[ NUM_DIR_LIGHTS ];
	void getDirectionalLightInfo( const in DirectionalLight directionalLight, out IncidentLight light ) {
		light.color = directionalLight.color;
		light.direction = directionalLight.direction;
		light.visible = true;
	}
#endif
#if NUM_POINT_LIGHTS > 0
	struct PointLight {
		vec3 position;
		vec3 color;
		float distance;
		float decay;
	};
	uniform PointLight pointLights[ NUM_POINT_LIGHTS ];
	void getPointLightInfo( const in PointLight pointLight, const in vec3 geometryPosition, out IncidentLight light ) {
		vec3 lVector = pointLight.position - geometryPosition;
		light.direction = normalize( lVector );
		float lightDistance = length( lVector );
		light.color = pointLight.color;
		light.color *= getDistanceAttenuation( lightDistance, pointLight.distance, pointLight.decay );
		light.visible = ( light.color != vec3( 0.0 ) );
	}
#endif
#if NUM_SPOT_LIGHTS > 0
	struct SpotLight {
		vec3 position;
		vec3 direction;
		vec3 color;
		float distance;
		float decay;
		float coneCos;
		float penumbraCos;
	};
	uniform SpotLight spotLights[ NUM_SPOT_LIGHTS ];
	void getSpotLightInfo( const in SpotLight spotLight, const in vec3 geometryPosition, out IncidentLight light ) {
		vec3 lVector = spotLight.position - geometryPosition;
		light.direction = normalize( lVector );
		float angleCos = dot( light.direction, spotLight.direction );
		float spotAttenuation = getSpotAttenuation( spotLight.coneCos, spotLight.penumbraCos, angleCos );
		if ( spotAttenuation > 0.0 ) {
			float lightDistance = length( lVector );
			light.color = spotLight.color * spotAttenuation;
			light.color *= getDistanceAttenuation( lightDistance, spotLight.distance, spotLight.decay );
			light.visible = ( light.color != vec3( 0.0 ) );
		} else {
			light.color = vec3( 0.0 );
			light.visible = false;
		}
	}
#endif
#if NUM_RECT_AREA_LIGHTS > 0
	struct RectAreaLight {
		vec3 color;
		vec3 position;
		vec3 halfWidth;
		vec3 halfHeight;
	};
	uniform sampler2D ltc_1;	uniform sampler2D ltc_2;
	uniform RectAreaLight rectAreaLights[ NUM_RECT_AREA_LIGHTS ];
#endif
#if NUM_HEMI_LIGHTS > 0
	struct HemisphereLight {
		vec3 direction;
		vec3 skyColor;
		vec3 groundColor;
	};
	uniform HemisphereLight hemisphereLights[ NUM_HEMI_LIGHTS ];
	vec3 getHemisphereLightIrradiance( const in HemisphereLight hemiLight, const in vec3 normal ) {
		float dotNL = dot( normal, hemiLight.direction );
		float hemiDiffuseWeight = 0.5 * dotNL + 0.5;
		vec3 irradiance = mix( hemiLight.groundColor, hemiLight.skyColor, hemiDiffuseWeight );
		return irradiance;
	}
#endif`,lights_toon_fragment:`ToonMaterial material;
material.diffuseColor = diffuseColor.rgb;`,lights_toon_pars_fragment:`varying vec3 vViewPosition;
struct ToonMaterial {
	vec3 diffuseColor;
};
void RE_Direct_Toon( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in ToonMaterial material, inout ReflectedLight reflectedLight ) {
	vec3 irradiance = getGradientIrradiance( geometryNormal, directLight.direction ) * directLight.color;
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
void RE_IndirectDiffuse_Toon( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in ToonMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
#define RE_Direct				RE_Direct_Toon
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Toon`,lights_phong_fragment:`BlinnPhongMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.specularColor = specular;
material.specularShininess = shininess;
material.specularStrength = specularStrength;`,lights_phong_pars_fragment:`varying vec3 vViewPosition;
struct BlinnPhongMaterial {
	vec3 diffuseColor;
	vec3 specularColor;
	float specularShininess;
	float specularStrength;
};
void RE_Direct_BlinnPhong( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in BlinnPhongMaterial material, inout ReflectedLight reflectedLight ) {
	float dotNL = saturate( dot( geometryNormal, directLight.direction ) );
	vec3 irradiance = dotNL * directLight.color;
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
	reflectedLight.directSpecular += irradiance * BRDF_BlinnPhong( directLight.direction, geometryViewDir, geometryNormal, material.specularColor, material.specularShininess ) * material.specularStrength;
}
void RE_IndirectDiffuse_BlinnPhong( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in BlinnPhongMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
#define RE_Direct				RE_Direct_BlinnPhong
#define RE_IndirectDiffuse		RE_IndirectDiffuse_BlinnPhong`,lights_physical_fragment:`PhysicalMaterial material;
material.diffuseColor = diffuseColor.rgb * ( 1.0 - metalnessFactor );
vec3 dxy = max( abs( dFdx( nonPerturbedNormal ) ), abs( dFdy( nonPerturbedNormal ) ) );
float geometryRoughness = max( max( dxy.x, dxy.y ), dxy.z );
material.roughness = max( roughnessFactor, 0.0525 );material.roughness += geometryRoughness;
material.roughness = min( material.roughness, 1.0 );
#ifdef IOR
	material.ior = ior;
	#ifdef USE_SPECULAR
		float specularIntensityFactor = specularIntensity;
		vec3 specularColorFactor = specularColor;
		#ifdef USE_SPECULAR_COLORMAP
			specularColorFactor *= texture2D( specularColorMap, vSpecularColorMapUv ).rgb;
		#endif
		#ifdef USE_SPECULAR_INTENSITYMAP
			specularIntensityFactor *= texture2D( specularIntensityMap, vSpecularIntensityMapUv ).a;
		#endif
		material.specularF90 = mix( specularIntensityFactor, 1.0, metalnessFactor );
	#else
		float specularIntensityFactor = 1.0;
		vec3 specularColorFactor = vec3( 1.0 );
		material.specularF90 = 1.0;
	#endif
	material.specularColor = mix( min( pow2( ( material.ior - 1.0 ) / ( material.ior + 1.0 ) ) * specularColorFactor, vec3( 1.0 ) ) * specularIntensityFactor, diffuseColor.rgb, metalnessFactor );
#else
	material.specularColor = mix( vec3( 0.04 ), diffuseColor.rgb, metalnessFactor );
	material.specularF90 = 1.0;
#endif
#ifdef USE_CLEARCOAT
	material.clearcoat = clearcoat;
	material.clearcoatRoughness = clearcoatRoughness;
	material.clearcoatF0 = vec3( 0.04 );
	material.clearcoatF90 = 1.0;
	#ifdef USE_CLEARCOATMAP
		material.clearcoat *= texture2D( clearcoatMap, vClearcoatMapUv ).x;
	#endif
	#ifdef USE_CLEARCOAT_ROUGHNESSMAP
		material.clearcoatRoughness *= texture2D( clearcoatRoughnessMap, vClearcoatRoughnessMapUv ).y;
	#endif
	material.clearcoat = saturate( material.clearcoat );	material.clearcoatRoughness = max( material.clearcoatRoughness, 0.0525 );
	material.clearcoatRoughness += geometryRoughness;
	material.clearcoatRoughness = min( material.clearcoatRoughness, 1.0 );
#endif
#ifdef USE_DISPERSION
	material.dispersion = dispersion;
#endif
#ifdef USE_IRIDESCENCE
	material.iridescence = iridescence;
	material.iridescenceIOR = iridescenceIOR;
	#ifdef USE_IRIDESCENCEMAP
		material.iridescence *= texture2D( iridescenceMap, vIridescenceMapUv ).r;
	#endif
	#ifdef USE_IRIDESCENCE_THICKNESSMAP
		material.iridescenceThickness = (iridescenceThicknessMaximum - iridescenceThicknessMinimum) * texture2D( iridescenceThicknessMap, vIridescenceThicknessMapUv ).g + iridescenceThicknessMinimum;
	#else
		material.iridescenceThickness = iridescenceThicknessMaximum;
	#endif
#endif
#ifdef USE_SHEEN
	material.sheenColor = sheenColor;
	#ifdef USE_SHEEN_COLORMAP
		material.sheenColor *= texture2D( sheenColorMap, vSheenColorMapUv ).rgb;
	#endif
	material.sheenRoughness = clamp( sheenRoughness, 0.07, 1.0 );
	#ifdef USE_SHEEN_ROUGHNESSMAP
		material.sheenRoughness *= texture2D( sheenRoughnessMap, vSheenRoughnessMapUv ).a;
	#endif
#endif
#ifdef USE_ANISOTROPY
	#ifdef USE_ANISOTROPYMAP
		mat2 anisotropyMat = mat2( anisotropyVector.x, anisotropyVector.y, - anisotropyVector.y, anisotropyVector.x );
		vec3 anisotropyPolar = texture2D( anisotropyMap, vAnisotropyMapUv ).rgb;
		vec2 anisotropyV = anisotropyMat * normalize( 2.0 * anisotropyPolar.rg - vec2( 1.0 ) ) * anisotropyPolar.b;
	#else
		vec2 anisotropyV = anisotropyVector;
	#endif
	material.anisotropy = length( anisotropyV );
	if( material.anisotropy == 0.0 ) {
		anisotropyV = vec2( 1.0, 0.0 );
	} else {
		anisotropyV /= material.anisotropy;
		material.anisotropy = saturate( material.anisotropy );
	}
	material.alphaT = mix( pow2( material.roughness ), 1.0, pow2( material.anisotropy ) );
	material.anisotropyT = tbn[ 0 ] * anisotropyV.x + tbn[ 1 ] * anisotropyV.y;
	material.anisotropyB = tbn[ 1 ] * anisotropyV.x - tbn[ 0 ] * anisotropyV.y;
#endif`,lights_physical_pars_fragment:`struct PhysicalMaterial {
	vec3 diffuseColor;
	float roughness;
	vec3 specularColor;
	float specularF90;
	float dispersion;
	#ifdef USE_CLEARCOAT
		float clearcoat;
		float clearcoatRoughness;
		vec3 clearcoatF0;
		float clearcoatF90;
	#endif
	#ifdef USE_IRIDESCENCE
		float iridescence;
		float iridescenceIOR;
		float iridescenceThickness;
		vec3 iridescenceFresnel;
		vec3 iridescenceF0;
	#endif
	#ifdef USE_SHEEN
		vec3 sheenColor;
		float sheenRoughness;
	#endif
	#ifdef IOR
		float ior;
	#endif
	#ifdef USE_TRANSMISSION
		float transmission;
		float transmissionAlpha;
		float thickness;
		float attenuationDistance;
		vec3 attenuationColor;
	#endif
	#ifdef USE_ANISOTROPY
		float anisotropy;
		float alphaT;
		vec3 anisotropyT;
		vec3 anisotropyB;
	#endif
};
vec3 clearcoatSpecularDirect = vec3( 0.0 );
vec3 clearcoatSpecularIndirect = vec3( 0.0 );
vec3 sheenSpecularDirect = vec3( 0.0 );
vec3 sheenSpecularIndirect = vec3(0.0 );
vec3 Schlick_to_F0( const in vec3 f, const in float f90, const in float dotVH ) {
    float x = clamp( 1.0 - dotVH, 0.0, 1.0 );
    float x2 = x * x;
    float x5 = clamp( x * x2 * x2, 0.0, 0.9999 );
    return ( f - vec3( f90 ) * x5 ) / ( 1.0 - x5 );
}
float V_GGX_SmithCorrelated( const in float alpha, const in float dotNL, const in float dotNV ) {
	float a2 = pow2( alpha );
	float gv = dotNL * sqrt( a2 + ( 1.0 - a2 ) * pow2( dotNV ) );
	float gl = dotNV * sqrt( a2 + ( 1.0 - a2 ) * pow2( dotNL ) );
	return 0.5 / max( gv + gl, EPSILON );
}
float D_GGX( const in float alpha, const in float dotNH ) {
	float a2 = pow2( alpha );
	float denom = pow2( dotNH ) * ( a2 - 1.0 ) + 1.0;
	return RECIPROCAL_PI * a2 / pow2( denom );
}
#ifdef USE_ANISOTROPY
	float V_GGX_SmithCorrelated_Anisotropic( const in float alphaT, const in float alphaB, const in float dotTV, const in float dotBV, const in float dotTL, const in float dotBL, const in float dotNV, const in float dotNL ) {
		float gv = dotNL * length( vec3( alphaT * dotTV, alphaB * dotBV, dotNV ) );
		float gl = dotNV * length( vec3( alphaT * dotTL, alphaB * dotBL, dotNL ) );
		float v = 0.5 / ( gv + gl );
		return saturate(v);
	}
	float D_GGX_Anisotropic( const in float alphaT, const in float alphaB, const in float dotNH, const in float dotTH, const in float dotBH ) {
		float a2 = alphaT * alphaB;
		highp vec3 v = vec3( alphaB * dotTH, alphaT * dotBH, a2 * dotNH );
		highp float v2 = dot( v, v );
		float w2 = a2 / v2;
		return RECIPROCAL_PI * a2 * pow2 ( w2 );
	}
#endif
#ifdef USE_CLEARCOAT
	vec3 BRDF_GGX_Clearcoat( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in PhysicalMaterial material) {
		vec3 f0 = material.clearcoatF0;
		float f90 = material.clearcoatF90;
		float roughness = material.clearcoatRoughness;
		float alpha = pow2( roughness );
		vec3 halfDir = normalize( lightDir + viewDir );
		float dotNL = saturate( dot( normal, lightDir ) );
		float dotNV = saturate( dot( normal, viewDir ) );
		float dotNH = saturate( dot( normal, halfDir ) );
		float dotVH = saturate( dot( viewDir, halfDir ) );
		vec3 F = F_Schlick( f0, f90, dotVH );
		float V = V_GGX_SmithCorrelated( alpha, dotNL, dotNV );
		float D = D_GGX( alpha, dotNH );
		return F * ( V * D );
	}
#endif
vec3 BRDF_GGX( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in PhysicalMaterial material ) {
	vec3 f0 = material.specularColor;
	float f90 = material.specularF90;
	float roughness = material.roughness;
	float alpha = pow2( roughness );
	vec3 halfDir = normalize( lightDir + viewDir );
	float dotNL = saturate( dot( normal, lightDir ) );
	float dotNV = saturate( dot( normal, viewDir ) );
	float dotNH = saturate( dot( normal, halfDir ) );
	float dotVH = saturate( dot( viewDir, halfDir ) );
	vec3 F = F_Schlick( f0, f90, dotVH );
	#ifdef USE_IRIDESCENCE
		F = mix( F, material.iridescenceFresnel, material.iridescence );
	#endif
	#ifdef USE_ANISOTROPY
		float dotTL = dot( material.anisotropyT, lightDir );
		float dotTV = dot( material.anisotropyT, viewDir );
		float dotTH = dot( material.anisotropyT, halfDir );
		float dotBL = dot( material.anisotropyB, lightDir );
		float dotBV = dot( material.anisotropyB, viewDir );
		float dotBH = dot( material.anisotropyB, halfDir );
		float V = V_GGX_SmithCorrelated_Anisotropic( material.alphaT, alpha, dotTV, dotBV, dotTL, dotBL, dotNV, dotNL );
		float D = D_GGX_Anisotropic( material.alphaT, alpha, dotNH, dotTH, dotBH );
	#else
		float V = V_GGX_SmithCorrelated( alpha, dotNL, dotNV );
		float D = D_GGX( alpha, dotNH );
	#endif
	return F * ( V * D );
}
vec2 LTC_Uv( const in vec3 N, const in vec3 V, const in float roughness ) {
	const float LUT_SIZE = 64.0;
	const float LUT_SCALE = ( LUT_SIZE - 1.0 ) / LUT_SIZE;
	const float LUT_BIAS = 0.5 / LUT_SIZE;
	float dotNV = saturate( dot( N, V ) );
	vec2 uv = vec2( roughness, sqrt( 1.0 - dotNV ) );
	uv = uv * LUT_SCALE + LUT_BIAS;
	return uv;
}
float LTC_ClippedSphereFormFactor( const in vec3 f ) {
	float l = length( f );
	return max( ( l * l + f.z ) / ( l + 1.0 ), 0.0 );
}
vec3 LTC_EdgeVectorFormFactor( const in vec3 v1, const in vec3 v2 ) {
	float x = dot( v1, v2 );
	float y = abs( x );
	float a = 0.8543985 + ( 0.4965155 + 0.0145206 * y ) * y;
	float b = 3.4175940 + ( 4.1616724 + y ) * y;
	float v = a / b;
	float theta_sintheta = ( x > 0.0 ) ? v : 0.5 * inversesqrt( max( 1.0 - x * x, 1e-7 ) ) - v;
	return cross( v1, v2 ) * theta_sintheta;
}
vec3 LTC_Evaluate( const in vec3 N, const in vec3 V, const in vec3 P, const in mat3 mInv, const in vec3 rectCoords[ 4 ] ) {
	vec3 v1 = rectCoords[ 1 ] - rectCoords[ 0 ];
	vec3 v2 = rectCoords[ 3 ] - rectCoords[ 0 ];
	vec3 lightNormal = cross( v1, v2 );
	if( dot( lightNormal, P - rectCoords[ 0 ] ) < 0.0 ) return vec3( 0.0 );
	vec3 T1, T2;
	T1 = normalize( V - N * dot( V, N ) );
	T2 = - cross( N, T1 );
	mat3 mat = mInv * transposeMat3( mat3( T1, T2, N ) );
	vec3 coords[ 4 ];
	coords[ 0 ] = mat * ( rectCoords[ 0 ] - P );
	coords[ 1 ] = mat * ( rectCoords[ 1 ] - P );
	coords[ 2 ] = mat * ( rectCoords[ 2 ] - P );
	coords[ 3 ] = mat * ( rectCoords[ 3 ] - P );
	coords[ 0 ] = normalize( coords[ 0 ] );
	coords[ 1 ] = normalize( coords[ 1 ] );
	coords[ 2 ] = normalize( coords[ 2 ] );
	coords[ 3 ] = normalize( coords[ 3 ] );
	vec3 vectorFormFactor = vec3( 0.0 );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 0 ], coords[ 1 ] );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 1 ], coords[ 2 ] );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 2 ], coords[ 3 ] );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 3 ], coords[ 0 ] );
	float result = LTC_ClippedSphereFormFactor( vectorFormFactor );
	return vec3( result );
}
#if defined( USE_SHEEN )
float D_Charlie( float roughness, float dotNH ) {
	float alpha = pow2( roughness );
	float invAlpha = 1.0 / alpha;
	float cos2h = dotNH * dotNH;
	float sin2h = max( 1.0 - cos2h, 0.0078125 );
	return ( 2.0 + invAlpha ) * pow( sin2h, invAlpha * 0.5 ) / ( 2.0 * PI );
}
float V_Neubelt( float dotNV, float dotNL ) {
	return saturate( 1.0 / ( 4.0 * ( dotNL + dotNV - dotNL * dotNV ) ) );
}
vec3 BRDF_Sheen( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, vec3 sheenColor, const in float sheenRoughness ) {
	vec3 halfDir = normalize( lightDir + viewDir );
	float dotNL = saturate( dot( normal, lightDir ) );
	float dotNV = saturate( dot( normal, viewDir ) );
	float dotNH = saturate( dot( normal, halfDir ) );
	float D = D_Charlie( sheenRoughness, dotNH );
	float V = V_Neubelt( dotNV, dotNL );
	return sheenColor * ( D * V );
}
#endif
float IBLSheenBRDF( const in vec3 normal, const in vec3 viewDir, const in float roughness ) {
	float dotNV = saturate( dot( normal, viewDir ) );
	float r2 = roughness * roughness;
	float a = roughness < 0.25 ? -339.2 * r2 + 161.4 * roughness - 25.9 : -8.48 * r2 + 14.3 * roughness - 9.95;
	float b = roughness < 0.25 ? 44.0 * r2 - 23.7 * roughness + 3.26 : 1.97 * r2 - 3.27 * roughness + 0.72;
	float DG = exp( a * dotNV + b ) + ( roughness < 0.25 ? 0.0 : 0.1 * ( roughness - 0.25 ) );
	return saturate( DG * RECIPROCAL_PI );
}
vec2 DFGApprox( const in vec3 normal, const in vec3 viewDir, const in float roughness ) {
	float dotNV = saturate( dot( normal, viewDir ) );
	const vec4 c0 = vec4( - 1, - 0.0275, - 0.572, 0.022 );
	const vec4 c1 = vec4( 1, 0.0425, 1.04, - 0.04 );
	vec4 r = roughness * c0 + c1;
	float a004 = min( r.x * r.x, exp2( - 9.28 * dotNV ) ) * r.x + r.y;
	vec2 fab = vec2( - 1.04, 1.04 ) * a004 + r.zw;
	return fab;
}
vec3 EnvironmentBRDF( const in vec3 normal, const in vec3 viewDir, const in vec3 specularColor, const in float specularF90, const in float roughness ) {
	vec2 fab = DFGApprox( normal, viewDir, roughness );
	return specularColor * fab.x + specularF90 * fab.y;
}
#ifdef USE_IRIDESCENCE
void computeMultiscatteringIridescence( const in vec3 normal, const in vec3 viewDir, const in vec3 specularColor, const in float specularF90, const in float iridescence, const in vec3 iridescenceF0, const in float roughness, inout vec3 singleScatter, inout vec3 multiScatter ) {
#else
void computeMultiscattering( const in vec3 normal, const in vec3 viewDir, const in vec3 specularColor, const in float specularF90, const in float roughness, inout vec3 singleScatter, inout vec3 multiScatter ) {
#endif
	vec2 fab = DFGApprox( normal, viewDir, roughness );
	#ifdef USE_IRIDESCENCE
		vec3 Fr = mix( specularColor, iridescenceF0, iridescence );
	#else
		vec3 Fr = specularColor;
	#endif
	vec3 FssEss = Fr * fab.x + specularF90 * fab.y;
	float Ess = fab.x + fab.y;
	float Ems = 1.0 - Ess;
	vec3 Favg = Fr + ( 1.0 - Fr ) * 0.047619;	vec3 Fms = FssEss * Favg / ( 1.0 - Ems * Favg );
	singleScatter += FssEss;
	multiScatter += Fms * Ems;
}
#if NUM_RECT_AREA_LIGHTS > 0
	void RE_Direct_RectArea_Physical( const in RectAreaLight rectAreaLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight ) {
		vec3 normal = geometryNormal;
		vec3 viewDir = geometryViewDir;
		vec3 position = geometryPosition;
		vec3 lightPos = rectAreaLight.position;
		vec3 halfWidth = rectAreaLight.halfWidth;
		vec3 halfHeight = rectAreaLight.halfHeight;
		vec3 lightColor = rectAreaLight.color;
		float roughness = material.roughness;
		vec3 rectCoords[ 4 ];
		rectCoords[ 0 ] = lightPos + halfWidth - halfHeight;		rectCoords[ 1 ] = lightPos - halfWidth - halfHeight;
		rectCoords[ 2 ] = lightPos - halfWidth + halfHeight;
		rectCoords[ 3 ] = lightPos + halfWidth + halfHeight;
		vec2 uv = LTC_Uv( normal, viewDir, roughness );
		vec4 t1 = texture2D( ltc_1, uv );
		vec4 t2 = texture2D( ltc_2, uv );
		mat3 mInv = mat3(
			vec3( t1.x, 0, t1.y ),
			vec3(    0, 1,    0 ),
			vec3( t1.z, 0, t1.w )
		);
		vec3 fresnel = ( material.specularColor * t2.x + ( vec3( 1.0 ) - material.specularColor ) * t2.y );
		reflectedLight.directSpecular += lightColor * fresnel * LTC_Evaluate( normal, viewDir, position, mInv, rectCoords );
		reflectedLight.directDiffuse += lightColor * material.diffuseColor * LTC_Evaluate( normal, viewDir, position, mat3( 1.0 ), rectCoords );
	}
#endif
void RE_Direct_Physical( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight ) {
	float dotNL = saturate( dot( geometryNormal, directLight.direction ) );
	vec3 irradiance = dotNL * directLight.color;
	#ifdef USE_CLEARCOAT
		float dotNLcc = saturate( dot( geometryClearcoatNormal, directLight.direction ) );
		vec3 ccIrradiance = dotNLcc * directLight.color;
		clearcoatSpecularDirect += ccIrradiance * BRDF_GGX_Clearcoat( directLight.direction, geometryViewDir, geometryClearcoatNormal, material );
	#endif
	#ifdef USE_SHEEN
		sheenSpecularDirect += irradiance * BRDF_Sheen( directLight.direction, geometryViewDir, geometryNormal, material.sheenColor, material.sheenRoughness );
	#endif
	reflectedLight.directSpecular += irradiance * BRDF_GGX( directLight.direction, geometryViewDir, geometryNormal, material );
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
void RE_IndirectDiffuse_Physical( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
void RE_IndirectSpecular_Physical( const in vec3 radiance, const in vec3 irradiance, const in vec3 clearcoatRadiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight) {
	#ifdef USE_CLEARCOAT
		clearcoatSpecularIndirect += clearcoatRadiance * EnvironmentBRDF( geometryClearcoatNormal, geometryViewDir, material.clearcoatF0, material.clearcoatF90, material.clearcoatRoughness );
	#endif
	#ifdef USE_SHEEN
		sheenSpecularIndirect += irradiance * material.sheenColor * IBLSheenBRDF( geometryNormal, geometryViewDir, material.sheenRoughness );
	#endif
	vec3 singleScattering = vec3( 0.0 );
	vec3 multiScattering = vec3( 0.0 );
	vec3 cosineWeightedIrradiance = irradiance * RECIPROCAL_PI;
	#ifdef USE_IRIDESCENCE
		computeMultiscatteringIridescence( geometryNormal, geometryViewDir, material.specularColor, material.specularF90, material.iridescence, material.iridescenceFresnel, material.roughness, singleScattering, multiScattering );
	#else
		computeMultiscattering( geometryNormal, geometryViewDir, material.specularColor, material.specularF90, material.roughness, singleScattering, multiScattering );
	#endif
	vec3 totalScattering = singleScattering + multiScattering;
	vec3 diffuse = material.diffuseColor * ( 1.0 - max( max( totalScattering.r, totalScattering.g ), totalScattering.b ) );
	reflectedLight.indirectSpecular += radiance * singleScattering;
	reflectedLight.indirectSpecular += multiScattering * cosineWeightedIrradiance;
	reflectedLight.indirectDiffuse += diffuse * cosineWeightedIrradiance;
}
#define RE_Direct				RE_Direct_Physical
#define RE_Direct_RectArea		RE_Direct_RectArea_Physical
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Physical
#define RE_IndirectSpecular		RE_IndirectSpecular_Physical
float computeSpecularOcclusion( const in float dotNV, const in float ambientOcclusion, const in float roughness ) {
	return saturate( pow( dotNV + ambientOcclusion, exp2( - 16.0 * roughness - 1.0 ) ) - 1.0 + ambientOcclusion );
}`,lights_fragment_begin:`
vec3 geometryPosition = - vViewPosition;
vec3 geometryNormal = normal;
vec3 geometryViewDir = ( isOrthographic ) ? vec3( 0, 0, 1 ) : normalize( vViewPosition );
vec3 geometryClearcoatNormal = vec3( 0.0 );
#ifdef USE_CLEARCOAT
	geometryClearcoatNormal = clearcoatNormal;
#endif
#ifdef USE_IRIDESCENCE
	float dotNVi = saturate( dot( normal, geometryViewDir ) );
	if ( material.iridescenceThickness == 0.0 ) {
		material.iridescence = 0.0;
	} else {
		material.iridescence = saturate( material.iridescence );
	}
	if ( material.iridescence > 0.0 ) {
		material.iridescenceFresnel = evalIridescence( 1.0, material.iridescenceIOR, dotNVi, material.iridescenceThickness, material.specularColor );
		material.iridescenceF0 = Schlick_to_F0( material.iridescenceFresnel, 1.0, dotNVi );
	}
#endif
IncidentLight directLight;
#if ( NUM_POINT_LIGHTS > 0 ) && defined( RE_Direct )
	PointLight pointLight;
	#if defined( USE_SHADOWMAP ) && NUM_POINT_LIGHT_SHADOWS > 0
	PointLightShadow pointLightShadow;
	#endif
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_POINT_LIGHTS; i ++ ) {
		pointLight = pointLights[ i ];
		getPointLightInfo( pointLight, geometryPosition, directLight );
		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_POINT_LIGHT_SHADOWS )
		pointLightShadow = pointLightShadows[ i ];
		directLight.color *= ( directLight.visible && receiveShadow ) ? getPointShadow( pointShadowMap[ i ], pointLightShadow.shadowMapSize, pointLightShadow.shadowIntensity, pointLightShadow.shadowBias, pointLightShadow.shadowRadius, vPointShadowCoord[ i ], pointLightShadow.shadowCameraNear, pointLightShadow.shadowCameraFar ) : 1.0;
		#endif
		RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if ( NUM_SPOT_LIGHTS > 0 ) && defined( RE_Direct )
	SpotLight spotLight;
	vec4 spotColor;
	vec3 spotLightCoord;
	bool inSpotLightMap;
	#if defined( USE_SHADOWMAP ) && NUM_SPOT_LIGHT_SHADOWS > 0
	SpotLightShadow spotLightShadow;
	#endif
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SPOT_LIGHTS; i ++ ) {
		spotLight = spotLights[ i ];
		getSpotLightInfo( spotLight, geometryPosition, directLight );
		#if ( UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS )
		#define SPOT_LIGHT_MAP_INDEX UNROLLED_LOOP_INDEX
		#elif ( UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS )
		#define SPOT_LIGHT_MAP_INDEX NUM_SPOT_LIGHT_MAPS
		#else
		#define SPOT_LIGHT_MAP_INDEX ( UNROLLED_LOOP_INDEX - NUM_SPOT_LIGHT_SHADOWS + NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS )
		#endif
		#if ( SPOT_LIGHT_MAP_INDEX < NUM_SPOT_LIGHT_MAPS )
			spotLightCoord = vSpotLightCoord[ i ].xyz / vSpotLightCoord[ i ].w;
			inSpotLightMap = all( lessThan( abs( spotLightCoord * 2. - 1. ), vec3( 1.0 ) ) );
			spotColor = texture2D( spotLightMap[ SPOT_LIGHT_MAP_INDEX ], spotLightCoord.xy );
			directLight.color = inSpotLightMap ? directLight.color * spotColor.rgb : directLight.color;
		#endif
		#undef SPOT_LIGHT_MAP_INDEX
		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS )
		spotLightShadow = spotLightShadows[ i ];
		directLight.color *= ( directLight.visible && receiveShadow ) ? getShadow( spotShadowMap[ i ], spotLightShadow.shadowMapSize, spotLightShadow.shadowIntensity, spotLightShadow.shadowBias, spotLightShadow.shadowRadius, vSpotLightCoord[ i ] ) : 1.0;
		#endif
		RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if ( NUM_DIR_LIGHTS > 0 ) && defined( RE_Direct )
	DirectionalLight directionalLight;
	#if defined( USE_SHADOWMAP ) && NUM_DIR_LIGHT_SHADOWS > 0
	DirectionalLightShadow directionalLightShadow;
	#endif
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_DIR_LIGHTS; i ++ ) {
		directionalLight = directionalLights[ i ];
		getDirectionalLightInfo( directionalLight, directLight );
		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_DIR_LIGHT_SHADOWS )
		directionalLightShadow = directionalLightShadows[ i ];
		directLight.color *= ( directLight.visible && receiveShadow ) ? getShadow( directionalShadowMap[ i ], directionalLightShadow.shadowMapSize, directionalLightShadow.shadowIntensity, directionalLightShadow.shadowBias, directionalLightShadow.shadowRadius, vDirectionalShadowCoord[ i ] ) : 1.0;
		#endif
		RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if ( NUM_RECT_AREA_LIGHTS > 0 ) && defined( RE_Direct_RectArea )
	RectAreaLight rectAreaLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_RECT_AREA_LIGHTS; i ++ ) {
		rectAreaLight = rectAreaLights[ i ];
		RE_Direct_RectArea( rectAreaLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if defined( RE_IndirectDiffuse )
	vec3 iblIrradiance = vec3( 0.0 );
	vec3 irradiance = getAmbientLightIrradiance( ambientLightColor );
	#if defined( USE_LIGHT_PROBES )
		irradiance += getLightProbeIrradiance( lightProbe, geometryNormal );
	#endif
	#if ( NUM_HEMI_LIGHTS > 0 )
		#pragma unroll_loop_start
		for ( int i = 0; i < NUM_HEMI_LIGHTS; i ++ ) {
			irradiance += getHemisphereLightIrradiance( hemisphereLights[ i ], geometryNormal );
		}
		#pragma unroll_loop_end
	#endif
#endif
#if defined( RE_IndirectSpecular )
	vec3 radiance = vec3( 0.0 );
	vec3 clearcoatRadiance = vec3( 0.0 );
#endif`,lights_fragment_maps:`#if defined( RE_IndirectDiffuse )
	#ifdef USE_LIGHTMAP
		vec4 lightMapTexel = texture2D( lightMap, vLightMapUv );
		vec3 lightMapIrradiance = lightMapTexel.rgb * lightMapIntensity;
		irradiance += lightMapIrradiance;
	#endif
	#if defined( USE_ENVMAP ) && defined( STANDARD ) && defined( ENVMAP_TYPE_CUBE_UV )
		iblIrradiance += getIBLIrradiance( geometryNormal );
	#endif
#endif
#if defined( USE_ENVMAP ) && defined( RE_IndirectSpecular )
	#ifdef USE_ANISOTROPY
		radiance += getIBLAnisotropyRadiance( geometryViewDir, geometryNormal, material.roughness, material.anisotropyB, material.anisotropy );
	#else
		radiance += getIBLRadiance( geometryViewDir, geometryNormal, material.roughness );
	#endif
	#ifdef USE_CLEARCOAT
		clearcoatRadiance += getIBLRadiance( geometryViewDir, geometryClearcoatNormal, material.clearcoatRoughness );
	#endif
#endif`,lights_fragment_end:`#if defined( RE_IndirectDiffuse )
	RE_IndirectDiffuse( irradiance, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
#endif
#if defined( RE_IndirectSpecular )
	RE_IndirectSpecular( radiance, iblIrradiance, clearcoatRadiance, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
#endif`,logdepthbuf_fragment:`#if defined( USE_LOGDEPTHBUF )
	gl_FragDepth = vIsPerspective == 0.0 ? gl_FragCoord.z : log2( vFragDepth ) * logDepthBufFC * 0.5;
#endif`,logdepthbuf_pars_fragment:`#if defined( USE_LOGDEPTHBUF )
	uniform float logDepthBufFC;
	varying float vFragDepth;
	varying float vIsPerspective;
#endif`,logdepthbuf_pars_vertex:`#ifdef USE_LOGDEPTHBUF
	varying float vFragDepth;
	varying float vIsPerspective;
#endif`,logdepthbuf_vertex:`#ifdef USE_LOGDEPTHBUF
	vFragDepth = 1.0 + gl_Position.w;
	vIsPerspective = float( isPerspectiveMatrix( projectionMatrix ) );
#endif`,map_fragment:`#ifdef USE_MAP
	vec4 sampledDiffuseColor = texture2D( map, vMapUv );
	#ifdef DECODE_VIDEO_TEXTURE
		sampledDiffuseColor = vec4( mix( pow( sampledDiffuseColor.rgb * 0.9478672986 + vec3( 0.0521327014 ), vec3( 2.4 ) ), sampledDiffuseColor.rgb * 0.0773993808, vec3( lessThanEqual( sampledDiffuseColor.rgb, vec3( 0.04045 ) ) ) ), sampledDiffuseColor.w );
	
	#endif
	diffuseColor *= sampledDiffuseColor;
#endif`,map_pars_fragment:`#ifdef USE_MAP
	uniform sampler2D map;
#endif`,map_particle_fragment:`#if defined( USE_MAP ) || defined( USE_ALPHAMAP )
	#if defined( USE_POINTS_UV )
		vec2 uv = vUv;
	#else
		vec2 uv = ( uvTransform * vec3( gl_PointCoord.x, 1.0 - gl_PointCoord.y, 1 ) ).xy;
	#endif
#endif
#ifdef USE_MAP
	diffuseColor *= texture2D( map, uv );
#endif
#ifdef USE_ALPHAMAP
	diffuseColor.a *= texture2D( alphaMap, uv ).g;
#endif`,map_particle_pars_fragment:`#if defined( USE_POINTS_UV )
	varying vec2 vUv;
#else
	#if defined( USE_MAP ) || defined( USE_ALPHAMAP )
		uniform mat3 uvTransform;
	#endif
#endif
#ifdef USE_MAP
	uniform sampler2D map;
#endif
#ifdef USE_ALPHAMAP
	uniform sampler2D alphaMap;
#endif`,metalnessmap_fragment:`float metalnessFactor = metalness;
#ifdef USE_METALNESSMAP
	vec4 texelMetalness = texture2D( metalnessMap, vMetalnessMapUv );
	metalnessFactor *= texelMetalness.b;
#endif`,metalnessmap_pars_fragment:`#ifdef USE_METALNESSMAP
	uniform sampler2D metalnessMap;
#endif`,morphinstance_vertex:`#ifdef USE_INSTANCING_MORPH
	float morphTargetInfluences[ MORPHTARGETS_COUNT ];
	float morphTargetBaseInfluence = texelFetch( morphTexture, ivec2( 0, gl_InstanceID ), 0 ).r;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		morphTargetInfluences[i] =  texelFetch( morphTexture, ivec2( i + 1, gl_InstanceID ), 0 ).r;
	}
#endif`,morphcolor_vertex:`#if defined( USE_MORPHCOLORS )
	vColor *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		#if defined( USE_COLOR_ALPHA )
			if ( morphTargetInfluences[ i ] != 0.0 ) vColor += getMorph( gl_VertexID, i, 2 ) * morphTargetInfluences[ i ];
		#elif defined( USE_COLOR )
			if ( morphTargetInfluences[ i ] != 0.0 ) vColor += getMorph( gl_VertexID, i, 2 ).rgb * morphTargetInfluences[ i ];
		#endif
	}
#endif`,morphnormal_vertex:`#ifdef USE_MORPHNORMALS
	objectNormal *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		if ( morphTargetInfluences[ i ] != 0.0 ) objectNormal += getMorph( gl_VertexID, i, 1 ).xyz * morphTargetInfluences[ i ];
	}
#endif`,morphtarget_pars_vertex:`#ifdef USE_MORPHTARGETS
	#ifndef USE_INSTANCING_MORPH
		uniform float morphTargetBaseInfluence;
		uniform float morphTargetInfluences[ MORPHTARGETS_COUNT ];
	#endif
	uniform sampler2DArray morphTargetsTexture;
	uniform ivec2 morphTargetsTextureSize;
	vec4 getMorph( const in int vertexIndex, const in int morphTargetIndex, const in int offset ) {
		int texelIndex = vertexIndex * MORPHTARGETS_TEXTURE_STRIDE + offset;
		int y = texelIndex / morphTargetsTextureSize.x;
		int x = texelIndex - y * morphTargetsTextureSize.x;
		ivec3 morphUV = ivec3( x, y, morphTargetIndex );
		return texelFetch( morphTargetsTexture, morphUV, 0 );
	}
#endif`,morphtarget_vertex:`#ifdef USE_MORPHTARGETS
	transformed *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		if ( morphTargetInfluences[ i ] != 0.0 ) transformed += getMorph( gl_VertexID, i, 0 ).xyz * morphTargetInfluences[ i ];
	}
#endif`,normal_fragment_begin:`float faceDirection = gl_FrontFacing ? 1.0 : - 1.0;
#ifdef FLAT_SHADED
	vec3 fdx = dFdx( vViewPosition );
	vec3 fdy = dFdy( vViewPosition );
	vec3 normal = normalize( cross( fdx, fdy ) );
#else
	vec3 normal = normalize( vNormal );
	#ifdef DOUBLE_SIDED
		normal *= faceDirection;
	#endif
#endif
#if defined( USE_NORMALMAP_TANGENTSPACE ) || defined( USE_CLEARCOAT_NORMALMAP ) || defined( USE_ANISOTROPY )
	#ifdef USE_TANGENT
		mat3 tbn = mat3( normalize( vTangent ), normalize( vBitangent ), normal );
	#else
		mat3 tbn = getTangentFrame( - vViewPosition, normal,
		#if defined( USE_NORMALMAP )
			vNormalMapUv
		#elif defined( USE_CLEARCOAT_NORMALMAP )
			vClearcoatNormalMapUv
		#else
			vUv
		#endif
		);
	#endif
	#if defined( DOUBLE_SIDED ) && ! defined( FLAT_SHADED )
		tbn[0] *= faceDirection;
		tbn[1] *= faceDirection;
	#endif
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	#ifdef USE_TANGENT
		mat3 tbn2 = mat3( normalize( vTangent ), normalize( vBitangent ), normal );
	#else
		mat3 tbn2 = getTangentFrame( - vViewPosition, normal, vClearcoatNormalMapUv );
	#endif
	#if defined( DOUBLE_SIDED ) && ! defined( FLAT_SHADED )
		tbn2[0] *= faceDirection;
		tbn2[1] *= faceDirection;
	#endif
#endif
vec3 nonPerturbedNormal = normal;`,normal_fragment_maps:`#ifdef USE_NORMALMAP_OBJECTSPACE
	normal = texture2D( normalMap, vNormalMapUv ).xyz * 2.0 - 1.0;
	#ifdef FLIP_SIDED
		normal = - normal;
	#endif
	#ifdef DOUBLE_SIDED
		normal = normal * faceDirection;
	#endif
	normal = normalize( normalMatrix * normal );
#elif defined( USE_NORMALMAP_TANGENTSPACE )
	vec3 mapN = texture2D( normalMap, vNormalMapUv ).xyz * 2.0 - 1.0;
	mapN.xy *= normalScale;
	normal = normalize( tbn * mapN );
#elif defined( USE_BUMPMAP )
	normal = perturbNormalArb( - vViewPosition, normal, dHdxy_fwd(), faceDirection );
#endif`,normal_pars_fragment:`#ifndef FLAT_SHADED
	varying vec3 vNormal;
	#ifdef USE_TANGENT
		varying vec3 vTangent;
		varying vec3 vBitangent;
	#endif
#endif`,normal_pars_vertex:`#ifndef FLAT_SHADED
	varying vec3 vNormal;
	#ifdef USE_TANGENT
		varying vec3 vTangent;
		varying vec3 vBitangent;
	#endif
#endif`,normal_vertex:`#ifndef FLAT_SHADED
	vNormal = normalize( transformedNormal );
	#ifdef USE_TANGENT
		vTangent = normalize( transformedTangent );
		vBitangent = normalize( cross( vNormal, vTangent ) * tangent.w );
	#endif
#endif`,normalmap_pars_fragment:`#ifdef USE_NORMALMAP
	uniform sampler2D normalMap;
	uniform vec2 normalScale;
#endif
#ifdef USE_NORMALMAP_OBJECTSPACE
	uniform mat3 normalMatrix;
#endif
#if ! defined ( USE_TANGENT ) && ( defined ( USE_NORMALMAP_TANGENTSPACE ) || defined ( USE_CLEARCOAT_NORMALMAP ) || defined( USE_ANISOTROPY ) )
	mat3 getTangentFrame( vec3 eye_pos, vec3 surf_norm, vec2 uv ) {
		vec3 q0 = dFdx( eye_pos.xyz );
		vec3 q1 = dFdy( eye_pos.xyz );
		vec2 st0 = dFdx( uv.st );
		vec2 st1 = dFdy( uv.st );
		vec3 N = surf_norm;
		vec3 q1perp = cross( q1, N );
		vec3 q0perp = cross( N, q0 );
		vec3 T = q1perp * st0.x + q0perp * st1.x;
		vec3 B = q1perp * st0.y + q0perp * st1.y;
		float det = max( dot( T, T ), dot( B, B ) );
		float scale = ( det == 0.0 ) ? 0.0 : inversesqrt( det );
		return mat3( T * scale, B * scale, N );
	}
#endif`,clearcoat_normal_fragment_begin:`#ifdef USE_CLEARCOAT
	vec3 clearcoatNormal = nonPerturbedNormal;
#endif`,clearcoat_normal_fragment_maps:`#ifdef USE_CLEARCOAT_NORMALMAP
	vec3 clearcoatMapN = texture2D( clearcoatNormalMap, vClearcoatNormalMapUv ).xyz * 2.0 - 1.0;
	clearcoatMapN.xy *= clearcoatNormalScale;
	clearcoatNormal = normalize( tbn2 * clearcoatMapN );
#endif`,clearcoat_pars_fragment:`#ifdef USE_CLEARCOATMAP
	uniform sampler2D clearcoatMap;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	uniform sampler2D clearcoatNormalMap;
	uniform vec2 clearcoatNormalScale;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	uniform sampler2D clearcoatRoughnessMap;
#endif`,iridescence_pars_fragment:`#ifdef USE_IRIDESCENCEMAP
	uniform sampler2D iridescenceMap;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	uniform sampler2D iridescenceThicknessMap;
#endif`,opaque_fragment:`#ifdef OPAQUE
diffuseColor.a = 1.0;
#endif
#ifdef USE_TRANSMISSION
diffuseColor.a *= material.transmissionAlpha;
#endif
gl_FragColor = vec4( outgoingLight, diffuseColor.a );`,packing:`vec3 packNormalToRGB( const in vec3 normal ) {
	return normalize( normal ) * 0.5 + 0.5;
}
vec3 unpackRGBToNormal( const in vec3 rgb ) {
	return 2.0 * rgb.xyz - 1.0;
}
const float PackUpscale = 256. / 255.;const float UnpackDownscale = 255. / 256.;const float ShiftRight8 = 1. / 256.;
const float Inv255 = 1. / 255.;
const vec4 PackFactors = vec4( 1.0, 256.0, 256.0 * 256.0, 256.0 * 256.0 * 256.0 );
const vec2 UnpackFactors2 = vec2( UnpackDownscale, 1.0 / PackFactors.g );
const vec3 UnpackFactors3 = vec3( UnpackDownscale / PackFactors.rg, 1.0 / PackFactors.b );
const vec4 UnpackFactors4 = vec4( UnpackDownscale / PackFactors.rgb, 1.0 / PackFactors.a );
vec4 packDepthToRGBA( const in float v ) {
	if( v <= 0.0 )
		return vec4( 0., 0., 0., 0. );
	if( v >= 1.0 )
		return vec4( 1., 1., 1., 1. );
	float vuf;
	float af = modf( v * PackFactors.a, vuf );
	float bf = modf( vuf * ShiftRight8, vuf );
	float gf = modf( vuf * ShiftRight8, vuf );
	return vec4( vuf * Inv255, gf * PackUpscale, bf * PackUpscale, af );
}
vec3 packDepthToRGB( const in float v ) {
	if( v <= 0.0 )
		return vec3( 0., 0., 0. );
	if( v >= 1.0 )
		return vec3( 1., 1., 1. );
	float vuf;
	float bf = modf( v * PackFactors.b, vuf );
	float gf = modf( vuf * ShiftRight8, vuf );
	return vec3( vuf * Inv255, gf * PackUpscale, bf );
}
vec2 packDepthToRG( const in float v ) {
	if( v <= 0.0 )
		return vec2( 0., 0. );
	if( v >= 1.0 )
		return vec2( 1., 1. );
	float vuf;
	float gf = modf( v * 256., vuf );
	return vec2( vuf * Inv255, gf );
}
float unpackRGBAToDepth( const in vec4 v ) {
	return dot( v, UnpackFactors4 );
}
float unpackRGBToDepth( const in vec3 v ) {
	return dot( v, UnpackFactors3 );
}
float unpackRGToDepth( const in vec2 v ) {
	return v.r * UnpackFactors2.r + v.g * UnpackFactors2.g;
}
vec4 pack2HalfToRGBA( const in vec2 v ) {
	vec4 r = vec4( v.x, fract( v.x * 255.0 ), v.y, fract( v.y * 255.0 ) );
	return vec4( r.x - r.y / 255.0, r.y, r.z - r.w / 255.0, r.w );
}
vec2 unpackRGBATo2Half( const in vec4 v ) {
	return vec2( v.x + ( v.y / 255.0 ), v.z + ( v.w / 255.0 ) );
}
float viewZToOrthographicDepth( const in float viewZ, const in float near, const in float far ) {
	return ( viewZ + near ) / ( near - far );
}
float orthographicDepthToViewZ( const in float depth, const in float near, const in float far ) {
	return depth * ( near - far ) - near;
}
float viewZToPerspectiveDepth( const in float viewZ, const in float near, const in float far ) {
	return ( ( near + viewZ ) * far ) / ( ( far - near ) * viewZ );
}
float perspectiveDepthToViewZ( const in float depth, const in float near, const in float far ) {
	return ( near * far ) / ( ( far - near ) * depth - far );
}`,premultiplied_alpha_fragment:`#ifdef PREMULTIPLIED_ALPHA
	gl_FragColor.rgb *= gl_FragColor.a;
#endif`,project_vertex:`vec4 mvPosition = vec4( transformed, 1.0 );
#ifdef USE_BATCHING
	mvPosition = batchingMatrix * mvPosition;
#endif
#ifdef USE_INSTANCING
	mvPosition = instanceMatrix * mvPosition;
#endif
mvPosition = modelViewMatrix * mvPosition;
gl_Position = projectionMatrix * mvPosition;`,dithering_fragment:`#ifdef DITHERING
	gl_FragColor.rgb = dithering( gl_FragColor.rgb );
#endif`,dithering_pars_fragment:`#ifdef DITHERING
	vec3 dithering( vec3 color ) {
		float grid_position = rand( gl_FragCoord.xy );
		vec3 dither_shift_RGB = vec3( 0.25 / 255.0, -0.25 / 255.0, 0.25 / 255.0 );
		dither_shift_RGB = mix( 2.0 * dither_shift_RGB, -2.0 * dither_shift_RGB, grid_position );
		return color + dither_shift_RGB;
	}
#endif`,roughnessmap_fragment:`float roughnessFactor = roughness;
#ifdef USE_ROUGHNESSMAP
	vec4 texelRoughness = texture2D( roughnessMap, vRoughnessMapUv );
	roughnessFactor *= texelRoughness.g;
#endif`,roughnessmap_pars_fragment:`#ifdef USE_ROUGHNESSMAP
	uniform sampler2D roughnessMap;
#endif`,shadowmap_pars_fragment:`#if NUM_SPOT_LIGHT_COORDS > 0
	varying vec4 vSpotLightCoord[ NUM_SPOT_LIGHT_COORDS ];
#endif
#if NUM_SPOT_LIGHT_MAPS > 0
	uniform sampler2D spotLightMap[ NUM_SPOT_LIGHT_MAPS ];
#endif
#ifdef USE_SHADOWMAP
	#if NUM_DIR_LIGHT_SHADOWS > 0
		uniform sampler2D directionalShadowMap[ NUM_DIR_LIGHT_SHADOWS ];
		varying vec4 vDirectionalShadowCoord[ NUM_DIR_LIGHT_SHADOWS ];
		struct DirectionalLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform DirectionalLightShadow directionalLightShadows[ NUM_DIR_LIGHT_SHADOWS ];
	#endif
	#if NUM_SPOT_LIGHT_SHADOWS > 0
		uniform sampler2D spotShadowMap[ NUM_SPOT_LIGHT_SHADOWS ];
		struct SpotLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform SpotLightShadow spotLightShadows[ NUM_SPOT_LIGHT_SHADOWS ];
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
		uniform sampler2D pointShadowMap[ NUM_POINT_LIGHT_SHADOWS ];
		varying vec4 vPointShadowCoord[ NUM_POINT_LIGHT_SHADOWS ];
		struct PointLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
			float shadowCameraNear;
			float shadowCameraFar;
		};
		uniform PointLightShadow pointLightShadows[ NUM_POINT_LIGHT_SHADOWS ];
	#endif
	float texture2DCompare( sampler2D depths, vec2 uv, float compare ) {
		return step( compare, unpackRGBAToDepth( texture2D( depths, uv ) ) );
	}
	vec2 texture2DDistribution( sampler2D shadow, vec2 uv ) {
		return unpackRGBATo2Half( texture2D( shadow, uv ) );
	}
	float VSMShadow (sampler2D shadow, vec2 uv, float compare ){
		float occlusion = 1.0;
		vec2 distribution = texture2DDistribution( shadow, uv );
		float hard_shadow = step( compare , distribution.x );
		if (hard_shadow != 1.0 ) {
			float distance = compare - distribution.x ;
			float variance = max( 0.00000, distribution.y * distribution.y );
			float softness_probability = variance / (variance + distance * distance );			softness_probability = clamp( ( softness_probability - 0.3 ) / ( 0.95 - 0.3 ), 0.0, 1.0 );			occlusion = clamp( max( hard_shadow, softness_probability ), 0.0, 1.0 );
		}
		return occlusion;
	}
	float getShadow( sampler2D shadowMap, vec2 shadowMapSize, float shadowIntensity, float shadowBias, float shadowRadius, vec4 shadowCoord ) {
		float shadow = 1.0;
		shadowCoord.xyz /= shadowCoord.w;
		shadowCoord.z += shadowBias;
		bool inFrustum = shadowCoord.x >= 0.0 && shadowCoord.x <= 1.0 && shadowCoord.y >= 0.0 && shadowCoord.y <= 1.0;
		bool frustumTest = inFrustum && shadowCoord.z <= 1.0;
		if ( frustumTest ) {
		#if defined( SHADOWMAP_TYPE_PCF )
			vec2 texelSize = vec2( 1.0 ) / shadowMapSize;
			float dx0 = - texelSize.x * shadowRadius;
			float dy0 = - texelSize.y * shadowRadius;
			float dx1 = + texelSize.x * shadowRadius;
			float dy1 = + texelSize.y * shadowRadius;
			float dx2 = dx0 / 2.0;
			float dy2 = dy0 / 2.0;
			float dx3 = dx1 / 2.0;
			float dy3 = dy1 / 2.0;
			shadow = (
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx0, dy0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( 0.0, dy0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx1, dy0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx2, dy2 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( 0.0, dy2 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx3, dy2 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx0, 0.0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx2, 0.0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy, shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx3, 0.0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx1, 0.0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx2, dy3 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( 0.0, dy3 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx3, dy3 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx0, dy1 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( 0.0, dy1 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx1, dy1 ), shadowCoord.z )
			) * ( 1.0 / 17.0 );
		#elif defined( SHADOWMAP_TYPE_PCF_SOFT )
			vec2 texelSize = vec2( 1.0 ) / shadowMapSize;
			float dx = texelSize.x;
			float dy = texelSize.y;
			vec2 uv = shadowCoord.xy;
			vec2 f = fract( uv * shadowMapSize + 0.5 );
			uv -= f * texelSize;
			shadow = (
				texture2DCompare( shadowMap, uv, shadowCoord.z ) +
				texture2DCompare( shadowMap, uv + vec2( dx, 0.0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, uv + vec2( 0.0, dy ), shadowCoord.z ) +
				texture2DCompare( shadowMap, uv + texelSize, shadowCoord.z ) +
				mix( texture2DCompare( shadowMap, uv + vec2( -dx, 0.0 ), shadowCoord.z ),
					 texture2DCompare( shadowMap, uv + vec2( 2.0 * dx, 0.0 ), shadowCoord.z ),
					 f.x ) +
				mix( texture2DCompare( shadowMap, uv + vec2( -dx, dy ), shadowCoord.z ),
					 texture2DCompare( shadowMap, uv + vec2( 2.0 * dx, dy ), shadowCoord.z ),
					 f.x ) +
				mix( texture2DCompare( shadowMap, uv + vec2( 0.0, -dy ), shadowCoord.z ),
					 texture2DCompare( shadowMap, uv + vec2( 0.0, 2.0 * dy ), shadowCoord.z ),
					 f.y ) +
				mix( texture2DCompare( shadowMap, uv + vec2( dx, -dy ), shadowCoord.z ),
					 texture2DCompare( shadowMap, uv + vec2( dx, 2.0 * dy ), shadowCoord.z ),
					 f.y ) +
				mix( mix( texture2DCompare( shadowMap, uv + vec2( -dx, -dy ), shadowCoord.z ),
						  texture2DCompare( shadowMap, uv + vec2( 2.0 * dx, -dy ), shadowCoord.z ),
						  f.x ),
					 mix( texture2DCompare( shadowMap, uv + vec2( -dx, 2.0 * dy ), shadowCoord.z ),
						  texture2DCompare( shadowMap, uv + vec2( 2.0 * dx, 2.0 * dy ), shadowCoord.z ),
						  f.x ),
					 f.y )
			) * ( 1.0 / 9.0 );
		#elif defined( SHADOWMAP_TYPE_VSM )
			shadow = VSMShadow( shadowMap, shadowCoord.xy, shadowCoord.z );
		#else
			shadow = texture2DCompare( shadowMap, shadowCoord.xy, shadowCoord.z );
		#endif
		}
		return mix( 1.0, shadow, shadowIntensity );
	}
	vec2 cubeToUV( vec3 v, float texelSizeY ) {
		vec3 absV = abs( v );
		float scaleToCube = 1.0 / max( absV.x, max( absV.y, absV.z ) );
		absV *= scaleToCube;
		v *= scaleToCube * ( 1.0 - 2.0 * texelSizeY );
		vec2 planar = v.xy;
		float almostATexel = 1.5 * texelSizeY;
		float almostOne = 1.0 - almostATexel;
		if ( absV.z >= almostOne ) {
			if ( v.z > 0.0 )
				planar.x = 4.0 - v.x;
		} else if ( absV.x >= almostOne ) {
			float signX = sign( v.x );
			planar.x = v.z * signX + 2.0 * signX;
		} else if ( absV.y >= almostOne ) {
			float signY = sign( v.y );
			planar.x = v.x + 2.0 * signY + 2.0;
			planar.y = v.z * signY - 2.0;
		}
		return vec2( 0.125, 0.25 ) * planar + vec2( 0.375, 0.75 );
	}
	float getPointShadow( sampler2D shadowMap, vec2 shadowMapSize, float shadowIntensity, float shadowBias, float shadowRadius, vec4 shadowCoord, float shadowCameraNear, float shadowCameraFar ) {
		float shadow = 1.0;
		vec3 lightToPosition = shadowCoord.xyz;
		
		float lightToPositionLength = length( lightToPosition );
		if ( lightToPositionLength - shadowCameraFar <= 0.0 && lightToPositionLength - shadowCameraNear >= 0.0 ) {
			float dp = ( lightToPositionLength - shadowCameraNear ) / ( shadowCameraFar - shadowCameraNear );			dp += shadowBias;
			vec3 bd3D = normalize( lightToPosition );
			vec2 texelSize = vec2( 1.0 ) / ( shadowMapSize * vec2( 4.0, 2.0 ) );
			#if defined( SHADOWMAP_TYPE_PCF ) || defined( SHADOWMAP_TYPE_PCF_SOFT ) || defined( SHADOWMAP_TYPE_VSM )
				vec2 offset = vec2( - 1, 1 ) * shadowRadius * texelSize.y;
				shadow = (
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.xyy, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.yyy, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.xyx, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.yyx, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.xxy, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.yxy, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.xxx, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.yxx, texelSize.y ), dp )
				) * ( 1.0 / 9.0 );
			#else
				shadow = texture2DCompare( shadowMap, cubeToUV( bd3D, texelSize.y ), dp );
			#endif
		}
		return mix( 1.0, shadow, shadowIntensity );
	}
#endif`,shadowmap_pars_vertex:`#if NUM_SPOT_LIGHT_COORDS > 0
	uniform mat4 spotLightMatrix[ NUM_SPOT_LIGHT_COORDS ];
	varying vec4 vSpotLightCoord[ NUM_SPOT_LIGHT_COORDS ];
#endif
#ifdef USE_SHADOWMAP
	#if NUM_DIR_LIGHT_SHADOWS > 0
		uniform mat4 directionalShadowMatrix[ NUM_DIR_LIGHT_SHADOWS ];
		varying vec4 vDirectionalShadowCoord[ NUM_DIR_LIGHT_SHADOWS ];
		struct DirectionalLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform DirectionalLightShadow directionalLightShadows[ NUM_DIR_LIGHT_SHADOWS ];
	#endif
	#if NUM_SPOT_LIGHT_SHADOWS > 0
		struct SpotLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform SpotLightShadow spotLightShadows[ NUM_SPOT_LIGHT_SHADOWS ];
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
		uniform mat4 pointShadowMatrix[ NUM_POINT_LIGHT_SHADOWS ];
		varying vec4 vPointShadowCoord[ NUM_POINT_LIGHT_SHADOWS ];
		struct PointLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
			float shadowCameraNear;
			float shadowCameraFar;
		};
		uniform PointLightShadow pointLightShadows[ NUM_POINT_LIGHT_SHADOWS ];
	#endif
#endif`,shadowmap_vertex:`#if ( defined( USE_SHADOWMAP ) && ( NUM_DIR_LIGHT_SHADOWS > 0 || NUM_POINT_LIGHT_SHADOWS > 0 ) ) || ( NUM_SPOT_LIGHT_COORDS > 0 )
	vec3 shadowWorldNormal = inverseTransformDirection( transformedNormal, viewMatrix );
	vec4 shadowWorldPosition;
#endif
#if defined( USE_SHADOWMAP )
	#if NUM_DIR_LIGHT_SHADOWS > 0
		#pragma unroll_loop_start
		for ( int i = 0; i < NUM_DIR_LIGHT_SHADOWS; i ++ ) {
			shadowWorldPosition = worldPosition + vec4( shadowWorldNormal * directionalLightShadows[ i ].shadowNormalBias, 0 );
			vDirectionalShadowCoord[ i ] = directionalShadowMatrix[ i ] * shadowWorldPosition;
		}
		#pragma unroll_loop_end
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
		#pragma unroll_loop_start
		for ( int i = 0; i < NUM_POINT_LIGHT_SHADOWS; i ++ ) {
			shadowWorldPosition = worldPosition + vec4( shadowWorldNormal * pointLightShadows[ i ].shadowNormalBias, 0 );
			vPointShadowCoord[ i ] = pointShadowMatrix[ i ] * shadowWorldPosition;
		}
		#pragma unroll_loop_end
	#endif
#endif
#if NUM_SPOT_LIGHT_COORDS > 0
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SPOT_LIGHT_COORDS; i ++ ) {
		shadowWorldPosition = worldPosition;
		#if ( defined( USE_SHADOWMAP ) && UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS )
			shadowWorldPosition.xyz += shadowWorldNormal * spotLightShadows[ i ].shadowNormalBias;
		#endif
		vSpotLightCoord[ i ] = spotLightMatrix[ i ] * shadowWorldPosition;
	}
	#pragma unroll_loop_end
#endif`,shadowmask_pars_fragment:`float getShadowMask() {
	float shadow = 1.0;
	#ifdef USE_SHADOWMAP
	#if NUM_DIR_LIGHT_SHADOWS > 0
	DirectionalLightShadow directionalLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_DIR_LIGHT_SHADOWS; i ++ ) {
		directionalLight = directionalLightShadows[ i ];
		shadow *= receiveShadow ? getShadow( directionalShadowMap[ i ], directionalLight.shadowMapSize, directionalLight.shadowIntensity, directionalLight.shadowBias, directionalLight.shadowRadius, vDirectionalShadowCoord[ i ] ) : 1.0;
	}
	#pragma unroll_loop_end
	#endif
	#if NUM_SPOT_LIGHT_SHADOWS > 0
	SpotLightShadow spotLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SPOT_LIGHT_SHADOWS; i ++ ) {
		spotLight = spotLightShadows[ i ];
		shadow *= receiveShadow ? getShadow( spotShadowMap[ i ], spotLight.shadowMapSize, spotLight.shadowIntensity, spotLight.shadowBias, spotLight.shadowRadius, vSpotLightCoord[ i ] ) : 1.0;
	}
	#pragma unroll_loop_end
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
	PointLightShadow pointLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_POINT_LIGHT_SHADOWS; i ++ ) {
		pointLight = pointLightShadows[ i ];
		shadow *= receiveShadow ? getPointShadow( pointShadowMap[ i ], pointLight.shadowMapSize, pointLight.shadowIntensity, pointLight.shadowBias, pointLight.shadowRadius, vPointShadowCoord[ i ], pointLight.shadowCameraNear, pointLight.shadowCameraFar ) : 1.0;
	}
	#pragma unroll_loop_end
	#endif
	#endif
	return shadow;
}`,skinbase_vertex:`#ifdef USE_SKINNING
	mat4 boneMatX = getBoneMatrix( skinIndex.x );
	mat4 boneMatY = getBoneMatrix( skinIndex.y );
	mat4 boneMatZ = getBoneMatrix( skinIndex.z );
	mat4 boneMatW = getBoneMatrix( skinIndex.w );
#endif`,skinning_pars_vertex:`#ifdef USE_SKINNING
	uniform mat4 bindMatrix;
	uniform mat4 bindMatrixInverse;
	uniform highp sampler2D boneTexture;
	mat4 getBoneMatrix( const in float i ) {
		int size = textureSize( boneTexture, 0 ).x;
		int j = int( i ) * 4;
		int x = j % size;
		int y = j / size;
		vec4 v1 = texelFetch( boneTexture, ivec2( x, y ), 0 );
		vec4 v2 = texelFetch( boneTexture, ivec2( x + 1, y ), 0 );
		vec4 v3 = texelFetch( boneTexture, ivec2( x + 2, y ), 0 );
		vec4 v4 = texelFetch( boneTexture, ivec2( x + 3, y ), 0 );
		return mat4( v1, v2, v3, v4 );
	}
#endif`,skinning_vertex:`#ifdef USE_SKINNING
	vec4 skinVertex = bindMatrix * vec4( transformed, 1.0 );
	vec4 skinned = vec4( 0.0 );
	skinned += boneMatX * skinVertex * skinWeight.x;
	skinned += boneMatY * skinVertex * skinWeight.y;
	skinned += boneMatZ * skinVertex * skinWeight.z;
	skinned += boneMatW * skinVertex * skinWeight.w;
	transformed = ( bindMatrixInverse * skinned ).xyz;
#endif`,skinnormal_vertex:`#ifdef USE_SKINNING
	mat4 skinMatrix = mat4( 0.0 );
	skinMatrix += skinWeight.x * boneMatX;
	skinMatrix += skinWeight.y * boneMatY;
	skinMatrix += skinWeight.z * boneMatZ;
	skinMatrix += skinWeight.w * boneMatW;
	skinMatrix = bindMatrixInverse * skinMatrix * bindMatrix;
	objectNormal = vec4( skinMatrix * vec4( objectNormal, 0.0 ) ).xyz;
	#ifdef USE_TANGENT
		objectTangent = vec4( skinMatrix * vec4( objectTangent, 0.0 ) ).xyz;
	#endif
#endif`,specularmap_fragment:`float specularStrength;
#ifdef USE_SPECULARMAP
	vec4 texelSpecular = texture2D( specularMap, vSpecularMapUv );
	specularStrength = texelSpecular.r;
#else
	specularStrength = 1.0;
#endif`,specularmap_pars_fragment:`#ifdef USE_SPECULARMAP
	uniform sampler2D specularMap;
#endif`,tonemapping_fragment:`#if defined( TONE_MAPPING )
	gl_FragColor.rgb = toneMapping( gl_FragColor.rgb );
#endif`,tonemapping_pars_fragment:`#ifndef saturate
#define saturate( a ) clamp( a, 0.0, 1.0 )
#endif
uniform float toneMappingExposure;
vec3 LinearToneMapping( vec3 color ) {
	return saturate( toneMappingExposure * color );
}
vec3 ReinhardToneMapping( vec3 color ) {
	color *= toneMappingExposure;
	return saturate( color / ( vec3( 1.0 ) + color ) );
}
vec3 CineonToneMapping( vec3 color ) {
	color *= toneMappingExposure;
	color = max( vec3( 0.0 ), color - 0.004 );
	return pow( ( color * ( 6.2 * color + 0.5 ) ) / ( color * ( 6.2 * color + 1.7 ) + 0.06 ), vec3( 2.2 ) );
}
vec3 RRTAndODTFit( vec3 v ) {
	vec3 a = v * ( v + 0.0245786 ) - 0.000090537;
	vec3 b = v * ( 0.983729 * v + 0.4329510 ) + 0.238081;
	return a / b;
}
vec3 ACESFilmicToneMapping( vec3 color ) {
	const mat3 ACESInputMat = mat3(
		vec3( 0.59719, 0.07600, 0.02840 ),		vec3( 0.35458, 0.90834, 0.13383 ),
		vec3( 0.04823, 0.01566, 0.83777 )
	);
	const mat3 ACESOutputMat = mat3(
		vec3(  1.60475, -0.10208, -0.00327 ),		vec3( -0.53108,  1.10813, -0.07276 ),
		vec3( -0.07367, -0.00605,  1.07602 )
	);
	color *= toneMappingExposure / 0.6;
	color = ACESInputMat * color;
	color = RRTAndODTFit( color );
	color = ACESOutputMat * color;
	return saturate( color );
}
const mat3 LINEAR_REC2020_TO_LINEAR_SRGB = mat3(
	vec3( 1.6605, - 0.1246, - 0.0182 ),
	vec3( - 0.5876, 1.1329, - 0.1006 ),
	vec3( - 0.0728, - 0.0083, 1.1187 )
);
const mat3 LINEAR_SRGB_TO_LINEAR_REC2020 = mat3(
	vec3( 0.6274, 0.0691, 0.0164 ),
	vec3( 0.3293, 0.9195, 0.0880 ),
	vec3( 0.0433, 0.0113, 0.8956 )
);
vec3 agxDefaultContrastApprox( vec3 x ) {
	vec3 x2 = x * x;
	vec3 x4 = x2 * x2;
	return + 15.5 * x4 * x2
		- 40.14 * x4 * x
		+ 31.96 * x4
		- 6.868 * x2 * x
		+ 0.4298 * x2
		+ 0.1191 * x
		- 0.00232;
}
vec3 AgXToneMapping( vec3 color ) {
	const mat3 AgXInsetMatrix = mat3(
		vec3( 0.856627153315983, 0.137318972929847, 0.11189821299995 ),
		vec3( 0.0951212405381588, 0.761241990602591, 0.0767994186031903 ),
		vec3( 0.0482516061458583, 0.101439036467562, 0.811302368396859 )
	);
	const mat3 AgXOutsetMatrix = mat3(
		vec3( 1.1271005818144368, - 0.1413297634984383, - 0.14132976349843826 ),
		vec3( - 0.11060664309660323, 1.157823702216272, - 0.11060664309660294 ),
		vec3( - 0.016493938717834573, - 0.016493938717834257, 1.2519364065950405 )
	);
	const float AgxMinEv = - 12.47393;	const float AgxMaxEv = 4.026069;
	color *= toneMappingExposure;
	color = LINEAR_SRGB_TO_LINEAR_REC2020 * color;
	color = AgXInsetMatrix * color;
	color = max( color, 1e-10 );	color = log2( color );
	color = ( color - AgxMinEv ) / ( AgxMaxEv - AgxMinEv );
	color = clamp( color, 0.0, 1.0 );
	color = agxDefaultContrastApprox( color );
	color = AgXOutsetMatrix * color;
	color = pow( max( vec3( 0.0 ), color ), vec3( 2.2 ) );
	color = LINEAR_REC2020_TO_LINEAR_SRGB * color;
	color = clamp( color, 0.0, 1.0 );
	return color;
}
vec3 NeutralToneMapping( vec3 color ) {
	const float StartCompression = 0.8 - 0.04;
	const float Desaturation = 0.15;
	color *= toneMappingExposure;
	float x = min( color.r, min( color.g, color.b ) );
	float offset = x < 0.08 ? x - 6.25 * x * x : 0.04;
	color -= offset;
	float peak = max( color.r, max( color.g, color.b ) );
	if ( peak < StartCompression ) return color;
	float d = 1. - StartCompression;
	float newPeak = 1. - d * d / ( peak + d - StartCompression );
	color *= newPeak / peak;
	float g = 1. - 1. / ( Desaturation * ( peak - newPeak ) + 1. );
	return mix( color, vec3( newPeak ), g );
}
vec3 CustomToneMapping( vec3 color ) { return color; }`,transmission_fragment:`#ifdef USE_TRANSMISSION
	material.transmission = transmission;
	material.transmissionAlpha = 1.0;
	material.thickness = thickness;
	material.attenuationDistance = attenuationDistance;
	material.attenuationColor = attenuationColor;
	#ifdef USE_TRANSMISSIONMAP
		material.transmission *= texture2D( transmissionMap, vTransmissionMapUv ).r;
	#endif
	#ifdef USE_THICKNESSMAP
		material.thickness *= texture2D( thicknessMap, vThicknessMapUv ).g;
	#endif
	vec3 pos = vWorldPosition;
	vec3 v = normalize( cameraPosition - pos );
	vec3 n = inverseTransformDirection( normal, viewMatrix );
	vec4 transmitted = getIBLVolumeRefraction(
		n, v, material.roughness, material.diffuseColor, material.specularColor, material.specularF90,
		pos, modelMatrix, viewMatrix, projectionMatrix, material.dispersion, material.ior, material.thickness,
		material.attenuationColor, material.attenuationDistance );
	material.transmissionAlpha = mix( material.transmissionAlpha, transmitted.a, material.transmission );
	totalDiffuse = mix( totalDiffuse, transmitted.rgb, material.transmission );
#endif`,transmission_pars_fragment:`#ifdef USE_TRANSMISSION
	uniform float transmission;
	uniform float thickness;
	uniform float attenuationDistance;
	uniform vec3 attenuationColor;
	#ifdef USE_TRANSMISSIONMAP
		uniform sampler2D transmissionMap;
	#endif
	#ifdef USE_THICKNESSMAP
		uniform sampler2D thicknessMap;
	#endif
	uniform vec2 transmissionSamplerSize;
	uniform sampler2D transmissionSamplerMap;
	uniform mat4 modelMatrix;
	uniform mat4 projectionMatrix;
	varying vec3 vWorldPosition;
	float w0( float a ) {
		return ( 1.0 / 6.0 ) * ( a * ( a * ( - a + 3.0 ) - 3.0 ) + 1.0 );
	}
	float w1( float a ) {
		return ( 1.0 / 6.0 ) * ( a *  a * ( 3.0 * a - 6.0 ) + 4.0 );
	}
	float w2( float a ){
		return ( 1.0 / 6.0 ) * ( a * ( a * ( - 3.0 * a + 3.0 ) + 3.0 ) + 1.0 );
	}
	float w3( float a ) {
		return ( 1.0 / 6.0 ) * ( a * a * a );
	}
	float g0( float a ) {
		return w0( a ) + w1( a );
	}
	float g1( float a ) {
		return w2( a ) + w3( a );
	}
	float h0( float a ) {
		return - 1.0 + w1( a ) / ( w0( a ) + w1( a ) );
	}
	float h1( float a ) {
		return 1.0 + w3( a ) / ( w2( a ) + w3( a ) );
	}
	vec4 bicubic( sampler2D tex, vec2 uv, vec4 texelSize, float lod ) {
		uv = uv * texelSize.zw + 0.5;
		vec2 iuv = floor( uv );
		vec2 fuv = fract( uv );
		float g0x = g0( fuv.x );
		float g1x = g1( fuv.x );
		float h0x = h0( fuv.x );
		float h1x = h1( fuv.x );
		float h0y = h0( fuv.y );
		float h1y = h1( fuv.y );
		vec2 p0 = ( vec2( iuv.x + h0x, iuv.y + h0y ) - 0.5 ) * texelSize.xy;
		vec2 p1 = ( vec2( iuv.x + h1x, iuv.y + h0y ) - 0.5 ) * texelSize.xy;
		vec2 p2 = ( vec2( iuv.x + h0x, iuv.y + h1y ) - 0.5 ) * texelSize.xy;
		vec2 p3 = ( vec2( iuv.x + h1x, iuv.y + h1y ) - 0.5 ) * texelSize.xy;
		return g0( fuv.y ) * ( g0x * textureLod( tex, p0, lod ) + g1x * textureLod( tex, p1, lod ) ) +
			g1( fuv.y ) * ( g0x * textureLod( tex, p2, lod ) + g1x * textureLod( tex, p3, lod ) );
	}
	vec4 textureBicubic( sampler2D sampler, vec2 uv, float lod ) {
		vec2 fLodSize = vec2( textureSize( sampler, int( lod ) ) );
		vec2 cLodSize = vec2( textureSize( sampler, int( lod + 1.0 ) ) );
		vec2 fLodSizeInv = 1.0 / fLodSize;
		vec2 cLodSizeInv = 1.0 / cLodSize;
		vec4 fSample = bicubic( sampler, uv, vec4( fLodSizeInv, fLodSize ), floor( lod ) );
		vec4 cSample = bicubic( sampler, uv, vec4( cLodSizeInv, cLodSize ), ceil( lod ) );
		return mix( fSample, cSample, fract( lod ) );
	}
	vec3 getVolumeTransmissionRay( const in vec3 n, const in vec3 v, const in float thickness, const in float ior, const in mat4 modelMatrix ) {
		vec3 refractionVector = refract( - v, normalize( n ), 1.0 / ior );
		vec3 modelScale;
		modelScale.x = length( vec3( modelMatrix[ 0 ].xyz ) );
		modelScale.y = length( vec3( modelMatrix[ 1 ].xyz ) );
		modelScale.z = length( vec3( modelMatrix[ 2 ].xyz ) );
		return normalize( refractionVector ) * thickness * modelScale;
	}
	float applyIorToRoughness( const in float roughness, const in float ior ) {
		return roughness * clamp( ior * 2.0 - 2.0, 0.0, 1.0 );
	}
	vec4 getTransmissionSample( const in vec2 fragCoord, const in float roughness, const in float ior ) {
		float lod = log2( transmissionSamplerSize.x ) * applyIorToRoughness( roughness, ior );
		return textureBicubic( transmissionSamplerMap, fragCoord.xy, lod );
	}
	vec3 volumeAttenuation( const in float transmissionDistance, const in vec3 attenuationColor, const in float attenuationDistance ) {
		if ( isinf( attenuationDistance ) ) {
			return vec3( 1.0 );
		} else {
			vec3 attenuationCoefficient = -log( attenuationColor ) / attenuationDistance;
			vec3 transmittance = exp( - attenuationCoefficient * transmissionDistance );			return transmittance;
		}
	}
	vec4 getIBLVolumeRefraction( const in vec3 n, const in vec3 v, const in float roughness, const in vec3 diffuseColor,
		const in vec3 specularColor, const in float specularF90, const in vec3 position, const in mat4 modelMatrix,
		const in mat4 viewMatrix, const in mat4 projMatrix, const in float dispersion, const in float ior, const in float thickness,
		const in vec3 attenuationColor, const in float attenuationDistance ) {
		vec4 transmittedLight;
		vec3 transmittance;
		#ifdef USE_DISPERSION
			float halfSpread = ( ior - 1.0 ) * 0.025 * dispersion;
			vec3 iors = vec3( ior - halfSpread, ior, ior + halfSpread );
			for ( int i = 0; i < 3; i ++ ) {
				vec3 transmissionRay = getVolumeTransmissionRay( n, v, thickness, iors[ i ], modelMatrix );
				vec3 refractedRayExit = position + transmissionRay;
		
				vec4 ndcPos = projMatrix * viewMatrix * vec4( refractedRayExit, 1.0 );
				vec2 refractionCoords = ndcPos.xy / ndcPos.w;
				refractionCoords += 1.0;
				refractionCoords /= 2.0;
		
				vec4 transmissionSample = getTransmissionSample( refractionCoords, roughness, iors[ i ] );
				transmittedLight[ i ] = transmissionSample[ i ];
				transmittedLight.a += transmissionSample.a;
				transmittance[ i ] = diffuseColor[ i ] * volumeAttenuation( length( transmissionRay ), attenuationColor, attenuationDistance )[ i ];
			}
			transmittedLight.a /= 3.0;
		
		#else
		
			vec3 transmissionRay = getVolumeTransmissionRay( n, v, thickness, ior, modelMatrix );
			vec3 refractedRayExit = position + transmissionRay;
			vec4 ndcPos = projMatrix * viewMatrix * vec4( refractedRayExit, 1.0 );
			vec2 refractionCoords = ndcPos.xy / ndcPos.w;
			refractionCoords += 1.0;
			refractionCoords /= 2.0;
			transmittedLight = getTransmissionSample( refractionCoords, roughness, ior );
			transmittance = diffuseColor * volumeAttenuation( length( transmissionRay ), attenuationColor, attenuationDistance );
		
		#endif
		vec3 attenuatedColor = transmittance * transmittedLight.rgb;
		vec3 F = EnvironmentBRDF( n, v, specularColor, specularF90, roughness );
		float transmittanceFactor = ( transmittance.r + transmittance.g + transmittance.b ) / 3.0;
		return vec4( ( 1.0 - F ) * attenuatedColor, 1.0 - ( 1.0 - transmittedLight.a ) * transmittanceFactor );
	}
#endif`,uv_pars_fragment:`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
	varying vec2 vUv;
#endif
#ifdef USE_MAP
	varying vec2 vMapUv;
#endif
#ifdef USE_ALPHAMAP
	varying vec2 vAlphaMapUv;
#endif
#ifdef USE_LIGHTMAP
	varying vec2 vLightMapUv;
#endif
#ifdef USE_AOMAP
	varying vec2 vAoMapUv;
#endif
#ifdef USE_BUMPMAP
	varying vec2 vBumpMapUv;
#endif
#ifdef USE_NORMALMAP
	varying vec2 vNormalMapUv;
#endif
#ifdef USE_EMISSIVEMAP
	varying vec2 vEmissiveMapUv;
#endif
#ifdef USE_METALNESSMAP
	varying vec2 vMetalnessMapUv;
#endif
#ifdef USE_ROUGHNESSMAP
	varying vec2 vRoughnessMapUv;
#endif
#ifdef USE_ANISOTROPYMAP
	varying vec2 vAnisotropyMapUv;
#endif
#ifdef USE_CLEARCOATMAP
	varying vec2 vClearcoatMapUv;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	varying vec2 vClearcoatNormalMapUv;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	varying vec2 vClearcoatRoughnessMapUv;
#endif
#ifdef USE_IRIDESCENCEMAP
	varying vec2 vIridescenceMapUv;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	varying vec2 vIridescenceThicknessMapUv;
#endif
#ifdef USE_SHEEN_COLORMAP
	varying vec2 vSheenColorMapUv;
#endif
#ifdef USE_SHEEN_ROUGHNESSMAP
	varying vec2 vSheenRoughnessMapUv;
#endif
#ifdef USE_SPECULARMAP
	varying vec2 vSpecularMapUv;
#endif
#ifdef USE_SPECULAR_COLORMAP
	varying vec2 vSpecularColorMapUv;
#endif
#ifdef USE_SPECULAR_INTENSITYMAP
	varying vec2 vSpecularIntensityMapUv;
#endif
#ifdef USE_TRANSMISSIONMAP
	uniform mat3 transmissionMapTransform;
	varying vec2 vTransmissionMapUv;
#endif
#ifdef USE_THICKNESSMAP
	uniform mat3 thicknessMapTransform;
	varying vec2 vThicknessMapUv;
#endif`,uv_pars_vertex:`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
	varying vec2 vUv;
#endif
#ifdef USE_MAP
	uniform mat3 mapTransform;
	varying vec2 vMapUv;
#endif
#ifdef USE_ALPHAMAP
	uniform mat3 alphaMapTransform;
	varying vec2 vAlphaMapUv;
#endif
#ifdef USE_LIGHTMAP
	uniform mat3 lightMapTransform;
	varying vec2 vLightMapUv;
#endif
#ifdef USE_AOMAP
	uniform mat3 aoMapTransform;
	varying vec2 vAoMapUv;
#endif
#ifdef USE_BUMPMAP
	uniform mat3 bumpMapTransform;
	varying vec2 vBumpMapUv;
#endif
#ifdef USE_NORMALMAP
	uniform mat3 normalMapTransform;
	varying vec2 vNormalMapUv;
#endif
#ifdef USE_DISPLACEMENTMAP
	uniform mat3 displacementMapTransform;
	varying vec2 vDisplacementMapUv;
#endif
#ifdef USE_EMISSIVEMAP
	uniform mat3 emissiveMapTransform;
	varying vec2 vEmissiveMapUv;
#endif
#ifdef USE_METALNESSMAP
	uniform mat3 metalnessMapTransform;
	varying vec2 vMetalnessMapUv;
#endif
#ifdef USE_ROUGHNESSMAP
	uniform mat3 roughnessMapTransform;
	varying vec2 vRoughnessMapUv;
#endif
#ifdef USE_ANISOTROPYMAP
	uniform mat3 anisotropyMapTransform;
	varying vec2 vAnisotropyMapUv;
#endif
#ifdef USE_CLEARCOATMAP
	uniform mat3 clearcoatMapTransform;
	varying vec2 vClearcoatMapUv;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	uniform mat3 clearcoatNormalMapTransform;
	varying vec2 vClearcoatNormalMapUv;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	uniform mat3 clearcoatRoughnessMapTransform;
	varying vec2 vClearcoatRoughnessMapUv;
#endif
#ifdef USE_SHEEN_COLORMAP
	uniform mat3 sheenColorMapTransform;
	varying vec2 vSheenColorMapUv;
#endif
#ifdef USE_SHEEN_ROUGHNESSMAP
	uniform mat3 sheenRoughnessMapTransform;
	varying vec2 vSheenRoughnessMapUv;
#endif
#ifdef USE_IRIDESCENCEMAP
	uniform mat3 iridescenceMapTransform;
	varying vec2 vIridescenceMapUv;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	uniform mat3 iridescenceThicknessMapTransform;
	varying vec2 vIridescenceThicknessMapUv;
#endif
#ifdef USE_SPECULARMAP
	uniform mat3 specularMapTransform;
	varying vec2 vSpecularMapUv;
#endif
#ifdef USE_SPECULAR_COLORMAP
	uniform mat3 specularColorMapTransform;
	varying vec2 vSpecularColorMapUv;
#endif
#ifdef USE_SPECULAR_INTENSITYMAP
	uniform mat3 specularIntensityMapTransform;
	varying vec2 vSpecularIntensityMapUv;
#endif
#ifdef USE_TRANSMISSIONMAP
	uniform mat3 transmissionMapTransform;
	varying vec2 vTransmissionMapUv;
#endif
#ifdef USE_THICKNESSMAP
	uniform mat3 thicknessMapTransform;
	varying vec2 vThicknessMapUv;
#endif`,uv_vertex:`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
	vUv = vec3( uv, 1 ).xy;
#endif
#ifdef USE_MAP
	vMapUv = ( mapTransform * vec3( MAP_UV, 1 ) ).xy;
#endif
#ifdef USE_ALPHAMAP
	vAlphaMapUv = ( alphaMapTransform * vec3( ALPHAMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_LIGHTMAP
	vLightMapUv = ( lightMapTransform * vec3( LIGHTMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_AOMAP
	vAoMapUv = ( aoMapTransform * vec3( AOMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_BUMPMAP
	vBumpMapUv = ( bumpMapTransform * vec3( BUMPMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_NORMALMAP
	vNormalMapUv = ( normalMapTransform * vec3( NORMALMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_DISPLACEMENTMAP
	vDisplacementMapUv = ( displacementMapTransform * vec3( DISPLACEMENTMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_EMISSIVEMAP
	vEmissiveMapUv = ( emissiveMapTransform * vec3( EMISSIVEMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_METALNESSMAP
	vMetalnessMapUv = ( metalnessMapTransform * vec3( METALNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_ROUGHNESSMAP
	vRoughnessMapUv = ( roughnessMapTransform * vec3( ROUGHNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_ANISOTROPYMAP
	vAnisotropyMapUv = ( anisotropyMapTransform * vec3( ANISOTROPYMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_CLEARCOATMAP
	vClearcoatMapUv = ( clearcoatMapTransform * vec3( CLEARCOATMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	vClearcoatNormalMapUv = ( clearcoatNormalMapTransform * vec3( CLEARCOAT_NORMALMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	vClearcoatRoughnessMapUv = ( clearcoatRoughnessMapTransform * vec3( CLEARCOAT_ROUGHNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_IRIDESCENCEMAP
	vIridescenceMapUv = ( iridescenceMapTransform * vec3( IRIDESCENCEMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	vIridescenceThicknessMapUv = ( iridescenceThicknessMapTransform * vec3( IRIDESCENCE_THICKNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SHEEN_COLORMAP
	vSheenColorMapUv = ( sheenColorMapTransform * vec3( SHEEN_COLORMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SHEEN_ROUGHNESSMAP
	vSheenRoughnessMapUv = ( sheenRoughnessMapTransform * vec3( SHEEN_ROUGHNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SPECULARMAP
	vSpecularMapUv = ( specularMapTransform * vec3( SPECULARMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SPECULAR_COLORMAP
	vSpecularColorMapUv = ( specularColorMapTransform * vec3( SPECULAR_COLORMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SPECULAR_INTENSITYMAP
	vSpecularIntensityMapUv = ( specularIntensityMapTransform * vec3( SPECULAR_INTENSITYMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_TRANSMISSIONMAP
	vTransmissionMapUv = ( transmissionMapTransform * vec3( TRANSMISSIONMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_THICKNESSMAP
	vThicknessMapUv = ( thicknessMapTransform * vec3( THICKNESSMAP_UV, 1 ) ).xy;
#endif`,worldpos_vertex:`#if defined( USE_ENVMAP ) || defined( DISTANCE ) || defined ( USE_SHADOWMAP ) || defined ( USE_TRANSMISSION ) || NUM_SPOT_LIGHT_COORDS > 0
	vec4 worldPosition = vec4( transformed, 1.0 );
	#ifdef USE_BATCHING
		worldPosition = batchingMatrix * worldPosition;
	#endif
	#ifdef USE_INSTANCING
		worldPosition = instanceMatrix * worldPosition;
	#endif
	worldPosition = modelMatrix * worldPosition;
#endif`,background_vert:`varying vec2 vUv;
uniform mat3 uvTransform;
void main() {
	vUv = ( uvTransform * vec3( uv, 1 ) ).xy;
	gl_Position = vec4( position.xy, 1.0, 1.0 );
}`,background_frag:`uniform sampler2D t2D;
uniform float backgroundIntensity;
varying vec2 vUv;
void main() {
	vec4 texColor = texture2D( t2D, vUv );
	#ifdef DECODE_VIDEO_TEXTURE
		texColor = vec4( mix( pow( texColor.rgb * 0.9478672986 + vec3( 0.0521327014 ), vec3( 2.4 ) ), texColor.rgb * 0.0773993808, vec3( lessThanEqual( texColor.rgb, vec3( 0.04045 ) ) ) ), texColor.w );
	#endif
	texColor.rgb *= backgroundIntensity;
	gl_FragColor = texColor;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,backgroundCube_vert:`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
	gl_Position.z = gl_Position.w;
}`,backgroundCube_frag:`#ifdef ENVMAP_TYPE_CUBE
	uniform samplerCube envMap;
#elif defined( ENVMAP_TYPE_CUBE_UV )
	uniform sampler2D envMap;
#endif
uniform float flipEnvMap;
uniform float backgroundBlurriness;
uniform float backgroundIntensity;
uniform mat3 backgroundRotation;
varying vec3 vWorldDirection;
#include <cube_uv_reflection_fragment>
void main() {
	#ifdef ENVMAP_TYPE_CUBE
		vec4 texColor = textureCube( envMap, backgroundRotation * vec3( flipEnvMap * vWorldDirection.x, vWorldDirection.yz ) );
	#elif defined( ENVMAP_TYPE_CUBE_UV )
		vec4 texColor = textureCubeUV( envMap, backgroundRotation * vWorldDirection, backgroundBlurriness );
	#else
		vec4 texColor = vec4( 0.0, 0.0, 0.0, 1.0 );
	#endif
	texColor.rgb *= backgroundIntensity;
	gl_FragColor = texColor;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,cube_vert:`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
	gl_Position.z = gl_Position.w;
}`,cube_frag:`uniform samplerCube tCube;
uniform float tFlip;
uniform float opacity;
varying vec3 vWorldDirection;
void main() {
	vec4 texColor = textureCube( tCube, vec3( tFlip * vWorldDirection.x, vWorldDirection.yz ) );
	gl_FragColor = texColor;
	gl_FragColor.a *= opacity;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,depth_vert:`#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
varying vec2 vHighPrecisionZW;
void main() {
	#include <uv_vertex>
	#include <batching_vertex>
	#include <skinbase_vertex>
	#include <morphinstance_vertex>
	#ifdef USE_DISPLACEMENTMAP
		#include <beginnormal_vertex>
		#include <morphnormal_vertex>
		#include <skinnormal_vertex>
	#endif
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vHighPrecisionZW = gl_Position.zw;
}`,depth_frag:`#if DEPTH_PACKING == 3200
	uniform float opacity;
#endif
#include <common>
#include <packing>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
varying vec2 vHighPrecisionZW;
void main() {
	vec4 diffuseColor = vec4( 1.0 );
	#include <clipping_planes_fragment>
	#if DEPTH_PACKING == 3200
		diffuseColor.a = opacity;
	#endif
	#include <map_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <logdepthbuf_fragment>
	float fragCoordZ = 0.5 * vHighPrecisionZW[0] / vHighPrecisionZW[1] + 0.5;
	#if DEPTH_PACKING == 3200
		gl_FragColor = vec4( vec3( 1.0 - fragCoordZ ), opacity );
	#elif DEPTH_PACKING == 3201
		gl_FragColor = packDepthToRGBA( fragCoordZ );
	#elif DEPTH_PACKING == 3202
		gl_FragColor = vec4( packDepthToRGB( fragCoordZ ), 1.0 );
	#elif DEPTH_PACKING == 3203
		gl_FragColor = vec4( packDepthToRG( fragCoordZ ), 0.0, 1.0 );
	#endif
}`,distanceRGBA_vert:`#define DISTANCE
varying vec3 vWorldPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <batching_vertex>
	#include <skinbase_vertex>
	#include <morphinstance_vertex>
	#ifdef USE_DISPLACEMENTMAP
		#include <beginnormal_vertex>
		#include <morphnormal_vertex>
		#include <skinnormal_vertex>
	#endif
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <worldpos_vertex>
	#include <clipping_planes_vertex>
	vWorldPosition = worldPosition.xyz;
}`,distanceRGBA_frag:`#define DISTANCE
uniform vec3 referencePosition;
uniform float nearDistance;
uniform float farDistance;
varying vec3 vWorldPosition;
#include <common>
#include <packing>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <clipping_planes_pars_fragment>
void main () {
	vec4 diffuseColor = vec4( 1.0 );
	#include <clipping_planes_fragment>
	#include <map_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	float dist = length( vWorldPosition - referencePosition );
	dist = ( dist - nearDistance ) / ( farDistance - nearDistance );
	dist = saturate( dist );
	gl_FragColor = packDepthToRGBA( dist );
}`,equirect_vert:`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
}`,equirect_frag:`uniform sampler2D tEquirect;
varying vec3 vWorldDirection;
#include <common>
void main() {
	vec3 direction = normalize( vWorldDirection );
	vec2 sampleUV = equirectUv( direction );
	gl_FragColor = texture2D( tEquirect, sampleUV );
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,linedashed_vert:`uniform float scale;
attribute float lineDistance;
varying float vLineDistance;
#include <common>
#include <uv_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	vLineDistance = scale * lineDistance;
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <fog_vertex>
}`,linedashed_frag:`uniform vec3 diffuse;
uniform float opacity;
uniform float dashSize;
uniform float totalSize;
varying float vLineDistance;
#include <common>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <fog_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	if ( mod( vLineDistance, totalSize ) > dashSize ) {
		discard;
	}
	vec3 outgoingLight = vec3( 0.0 );
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	outgoingLight = diffuseColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
}`,meshbasic_vert:`#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <envmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#if defined ( USE_ENVMAP ) || defined ( USE_SKINNING )
		#include <beginnormal_vertex>
		#include <morphnormal_vertex>
		#include <skinbase_vertex>
		#include <skinnormal_vertex>
		#include <defaultnormal_vertex>
	#endif
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <worldpos_vertex>
	#include <envmap_vertex>
	#include <fog_vertex>
}`,meshbasic_frag:`uniform vec3 diffuse;
uniform float opacity;
#ifndef FLAT_SHADED
	varying vec3 vNormal;
#endif
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_pars_fragment>
#include <fog_pars_fragment>
#include <specularmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <specularmap_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	#ifdef USE_LIGHTMAP
		vec4 lightMapTexel = texture2D( lightMap, vLightMapUv );
		reflectedLight.indirectDiffuse += lightMapTexel.rgb * lightMapIntensity * RECIPROCAL_PI;
	#else
		reflectedLight.indirectDiffuse += vec3( 1.0 );
	#endif
	#include <aomap_fragment>
	reflectedLight.indirectDiffuse *= diffuseColor.rgb;
	vec3 outgoingLight = reflectedLight.indirectDiffuse;
	#include <envmap_fragment>
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,meshlambert_vert:`#define LAMBERT
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <envmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <envmap_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,meshlambert_frag:`#define LAMBERT
uniform vec3 diffuse;
uniform vec3 emissive;
uniform float opacity;
#include <common>
#include <packing>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_pars_fragment>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_lambert_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <specularmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <specularmap_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_lambert_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + totalEmissiveRadiance;
	#include <envmap_fragment>
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,meshmatcap_vert:`#define MATCAP
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <color_pars_vertex>
#include <displacementmap_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <fog_vertex>
	vViewPosition = - mvPosition.xyz;
}`,meshmatcap_frag:`#define MATCAP
uniform vec3 diffuse;
uniform float opacity;
uniform sampler2D matcap;
varying vec3 vViewPosition;
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <fog_pars_fragment>
#include <normal_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	vec3 viewDir = normalize( vViewPosition );
	vec3 x = normalize( vec3( viewDir.z, 0.0, - viewDir.x ) );
	vec3 y = cross( viewDir, x );
	vec2 uv = vec2( dot( x, normal ), dot( y, normal ) ) * 0.495 + 0.5;
	#ifdef USE_MATCAP
		vec4 matcapColor = texture2D( matcap, uv );
	#else
		vec4 matcapColor = vec4( vec3( mix( 0.2, 0.8, uv.y ) ), 1.0 );
	#endif
	vec3 outgoingLight = diffuseColor.rgb * matcapColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,meshnormal_vert:`#define NORMAL
#if defined( FLAT_SHADED ) || defined( USE_BUMPMAP ) || defined( USE_NORMALMAP_TANGENTSPACE )
	varying vec3 vViewPosition;
#endif
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphinstance_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
#if defined( FLAT_SHADED ) || defined( USE_BUMPMAP ) || defined( USE_NORMALMAP_TANGENTSPACE )
	vViewPosition = - mvPosition.xyz;
#endif
}`,meshnormal_frag:`#define NORMAL
uniform float opacity;
#if defined( FLAT_SHADED ) || defined( USE_BUMPMAP ) || defined( USE_NORMALMAP_TANGENTSPACE )
	varying vec3 vViewPosition;
#endif
#include <packing>
#include <uv_pars_fragment>
#include <normal_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( 0.0, 0.0, 0.0, opacity );
	#include <clipping_planes_fragment>
	#include <logdepthbuf_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	gl_FragColor = vec4( packNormalToRGB( normal ), diffuseColor.a );
	#ifdef OPAQUE
		gl_FragColor.a = 1.0;
	#endif
}`,meshphong_vert:`#define PHONG
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <envmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphinstance_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <envmap_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,meshphong_frag:`#define PHONG
uniform vec3 diffuse;
uniform vec3 emissive;
uniform vec3 specular;
uniform float shininess;
uniform float opacity;
#include <common>
#include <packing>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_pars_fragment>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_phong_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <specularmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <specularmap_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_phong_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + reflectedLight.directSpecular + reflectedLight.indirectSpecular + totalEmissiveRadiance;
	#include <envmap_fragment>
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,meshphysical_vert:`#define STANDARD
varying vec3 vViewPosition;
#ifdef USE_TRANSMISSION
	varying vec3 vWorldPosition;
#endif
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
#ifdef USE_TRANSMISSION
	vWorldPosition = worldPosition.xyz;
#endif
}`,meshphysical_frag:`#define STANDARD
#ifdef PHYSICAL
	#define IOR
	#define USE_SPECULAR
#endif
uniform vec3 diffuse;
uniform vec3 emissive;
uniform float roughness;
uniform float metalness;
uniform float opacity;
#ifdef IOR
	uniform float ior;
#endif
#ifdef USE_SPECULAR
	uniform float specularIntensity;
	uniform vec3 specularColor;
	#ifdef USE_SPECULAR_COLORMAP
		uniform sampler2D specularColorMap;
	#endif
	#ifdef USE_SPECULAR_INTENSITYMAP
		uniform sampler2D specularIntensityMap;
	#endif
#endif
#ifdef USE_CLEARCOAT
	uniform float clearcoat;
	uniform float clearcoatRoughness;
#endif
#ifdef USE_DISPERSION
	uniform float dispersion;
#endif
#ifdef USE_IRIDESCENCE
	uniform float iridescence;
	uniform float iridescenceIOR;
	uniform float iridescenceThicknessMinimum;
	uniform float iridescenceThicknessMaximum;
#endif
#ifdef USE_SHEEN
	uniform vec3 sheenColor;
	uniform float sheenRoughness;
	#ifdef USE_SHEEN_COLORMAP
		uniform sampler2D sheenColorMap;
	#endif
	#ifdef USE_SHEEN_ROUGHNESSMAP
		uniform sampler2D sheenRoughnessMap;
	#endif
#endif
#ifdef USE_ANISOTROPY
	uniform vec2 anisotropyVector;
	#ifdef USE_ANISOTROPYMAP
		uniform sampler2D anisotropyMap;
	#endif
#endif
varying vec3 vViewPosition;
#include <common>
#include <packing>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <iridescence_fragment>
#include <cube_uv_reflection_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_physical_pars_fragment>
#include <fog_pars_fragment>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_physical_pars_fragment>
#include <transmission_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <clearcoat_pars_fragment>
#include <iridescence_pars_fragment>
#include <roughnessmap_pars_fragment>
#include <metalnessmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <roughnessmap_fragment>
	#include <metalnessmap_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <clearcoat_normal_fragment_begin>
	#include <clearcoat_normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_physical_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 totalDiffuse = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse;
	vec3 totalSpecular = reflectedLight.directSpecular + reflectedLight.indirectSpecular;
	#include <transmission_fragment>
	vec3 outgoingLight = totalDiffuse + totalSpecular + totalEmissiveRadiance;
	#ifdef USE_SHEEN
		float sheenEnergyComp = 1.0 - 0.157 * max3( material.sheenColor );
		outgoingLight = outgoingLight * sheenEnergyComp + sheenSpecularDirect + sheenSpecularIndirect;
	#endif
	#ifdef USE_CLEARCOAT
		float dotNVcc = saturate( dot( geometryClearcoatNormal, geometryViewDir ) );
		vec3 Fcc = F_Schlick( material.clearcoatF0, material.clearcoatF90, dotNVcc );
		outgoingLight = outgoingLight * ( 1.0 - material.clearcoat * Fcc ) + ( clearcoatSpecularDirect + clearcoatSpecularIndirect ) * material.clearcoat;
	#endif
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,meshtoon_vert:`#define TOON
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,meshtoon_frag:`#define TOON
uniform vec3 diffuse;
uniform vec3 emissive;
uniform float opacity;
#include <common>
#include <packing>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <gradientmap_pars_fragment>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_toon_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_toon_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + totalEmissiveRadiance;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,points_vert:`uniform float size;
uniform float scale;
#include <common>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
#ifdef USE_POINTS_UV
	varying vec2 vUv;
	uniform mat3 uvTransform;
#endif
void main() {
	#ifdef USE_POINTS_UV
		vUv = ( uvTransform * vec3( uv, 1 ) ).xy;
	#endif
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <project_vertex>
	gl_PointSize = size;
	#ifdef USE_SIZEATTENUATION
		bool isPerspective = isPerspectiveMatrix( projectionMatrix );
		if ( isPerspective ) gl_PointSize *= ( scale / - mvPosition.z );
	#endif
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <worldpos_vertex>
	#include <fog_vertex>
}`,points_frag:`uniform vec3 diffuse;
uniform float opacity;
#include <common>
#include <color_pars_fragment>
#include <map_particle_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <fog_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	vec3 outgoingLight = vec3( 0.0 );
	#include <logdepthbuf_fragment>
	#include <map_particle_fragment>
	#include <color_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	outgoingLight = diffuseColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
}`,shadow_vert:`#include <common>
#include <batching_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <shadowmap_pars_vertex>
void main() {
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphinstance_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <worldpos_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,shadow_frag:`uniform vec3 color;
uniform float opacity;
#include <common>
#include <packing>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <logdepthbuf_pars_fragment>
#include <shadowmap_pars_fragment>
#include <shadowmask_pars_fragment>
void main() {
	#include <logdepthbuf_fragment>
	gl_FragColor = vec4( color, opacity * ( 1.0 - getShadowMask() ) );
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
}`,sprite_vert:`uniform float rotation;
uniform vec2 center;
#include <common>
#include <uv_pars_vertex>
#include <fog_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	vec4 mvPosition = modelViewMatrix[ 3 ];
	vec2 scale = vec2( length( modelMatrix[ 0 ].xyz ), length( modelMatrix[ 1 ].xyz ) );
	#ifndef USE_SIZEATTENUATION
		bool isPerspective = isPerspectiveMatrix( projectionMatrix );
		if ( isPerspective ) scale *= - mvPosition.z;
	#endif
	vec2 alignedPosition = ( position.xy - ( center - vec2( 0.5 ) ) ) * scale;
	vec2 rotatedPosition;
	rotatedPosition.x = cos( rotation ) * alignedPosition.x - sin( rotation ) * alignedPosition.y;
	rotatedPosition.y = sin( rotation ) * alignedPosition.x + cos( rotation ) * alignedPosition.y;
	mvPosition.xy += rotatedPosition;
	gl_Position = projectionMatrix * mvPosition;
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <fog_vertex>
}`,sprite_frag:`uniform vec3 diffuse;
uniform float opacity;
#include <common>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <fog_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	vec3 outgoingLight = vec3( 0.0 );
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	outgoingLight = diffuseColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
}`},Y={common:{diffuse:{value:new K(16777215)},opacity:{value:1},map:{value:null},mapTransform:{value:new U},alphaMap:{value:null},alphaMapTransform:{value:new U},alphaTest:{value:0}},specularmap:{specularMap:{value:null},specularMapTransform:{value:new U}},envmap:{envMap:{value:null},envMapRotation:{value:new U},flipEnvMap:{value:-1},reflectivity:{value:1},ior:{value:1.5},refractionRatio:{value:.98}},aomap:{aoMap:{value:null},aoMapIntensity:{value:1},aoMapTransform:{value:new U}},lightmap:{lightMap:{value:null},lightMapIntensity:{value:1},lightMapTransform:{value:new U}},bumpmap:{bumpMap:{value:null},bumpMapTransform:{value:new U},bumpScale:{value:1}},normalmap:{normalMap:{value:null},normalMapTransform:{value:new U},normalScale:{value:new H(1,1)}},displacementmap:{displacementMap:{value:null},displacementMapTransform:{value:new U},displacementScale:{value:1},displacementBias:{value:0}},emissivemap:{emissiveMap:{value:null},emissiveMapTransform:{value:new U}},metalnessmap:{metalnessMap:{value:null},metalnessMapTransform:{value:new U}},roughnessmap:{roughnessMap:{value:null},roughnessMapTransform:{value:new U}},gradientmap:{gradientMap:{value:null}},fog:{fogDensity:{value:25e-5},fogNear:{value:1},fogFar:{value:2e3},fogColor:{value:new K(16777215)}},lights:{ambientLightColor:{value:[]},lightProbe:{value:[]},directionalLights:{value:[],properties:{direction:{},color:{}}},directionalLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},directionalShadowMap:{value:[]},directionalShadowMatrix:{value:[]},spotLights:{value:[],properties:{color:{},position:{},direction:{},distance:{},coneCos:{},penumbraCos:{},decay:{}}},spotLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},spotLightMap:{value:[]},spotShadowMap:{value:[]},spotLightMatrix:{value:[]},pointLights:{value:[],properties:{color:{},position:{},decay:{},distance:{}}},pointLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{},shadowCameraNear:{},shadowCameraFar:{}}},pointShadowMap:{value:[]},pointShadowMatrix:{value:[]},hemisphereLights:{value:[],properties:{direction:{},skyColor:{},groundColor:{}}},rectAreaLights:{value:[],properties:{color:{},position:{},width:{},height:{}}},ltc_1:{value:null},ltc_2:{value:null}},points:{diffuse:{value:new K(16777215)},opacity:{value:1},size:{value:1},scale:{value:1},map:{value:null},alphaMap:{value:null},alphaMapTransform:{value:new U},alphaTest:{value:0},uvTransform:{value:new U}},sprite:{diffuse:{value:new K(16777215)},opacity:{value:1},center:{value:new H(.5,.5)},rotation:{value:0},map:{value:null},mapTransform:{value:new U},alphaMap:{value:null},alphaMapTransform:{value:new U},alphaTest:{value:0}}},Pl={basic:{uniforms:sl([Y.common,Y.specularmap,Y.envmap,Y.aomap,Y.lightmap,Y.fog]),vertexShader:J.meshbasic_vert,fragmentShader:J.meshbasic_frag},lambert:{uniforms:sl([Y.common,Y.specularmap,Y.envmap,Y.aomap,Y.lightmap,Y.emissivemap,Y.bumpmap,Y.normalmap,Y.displacementmap,Y.fog,Y.lights,{emissive:{value:new K(0)}}]),vertexShader:J.meshlambert_vert,fragmentShader:J.meshlambert_frag},phong:{uniforms:sl([Y.common,Y.specularmap,Y.envmap,Y.aomap,Y.lightmap,Y.emissivemap,Y.bumpmap,Y.normalmap,Y.displacementmap,Y.fog,Y.lights,{emissive:{value:new K(0)},specular:{value:new K(1118481)},shininess:{value:30}}]),vertexShader:J.meshphong_vert,fragmentShader:J.meshphong_frag},standard:{uniforms:sl([Y.common,Y.envmap,Y.aomap,Y.lightmap,Y.emissivemap,Y.bumpmap,Y.normalmap,Y.displacementmap,Y.roughnessmap,Y.metalnessmap,Y.fog,Y.lights,{emissive:{value:new K(0)},roughness:{value:1},metalness:{value:0},envMapIntensity:{value:1}}]),vertexShader:J.meshphysical_vert,fragmentShader:J.meshphysical_frag},toon:{uniforms:sl([Y.common,Y.aomap,Y.lightmap,Y.emissivemap,Y.bumpmap,Y.normalmap,Y.displacementmap,Y.gradientmap,Y.fog,Y.lights,{emissive:{value:new K(0)}}]),vertexShader:J.meshtoon_vert,fragmentShader:J.meshtoon_frag},matcap:{uniforms:sl([Y.common,Y.bumpmap,Y.normalmap,Y.displacementmap,Y.fog,{matcap:{value:null}}]),vertexShader:J.meshmatcap_vert,fragmentShader:J.meshmatcap_frag},points:{uniforms:sl([Y.points,Y.fog]),vertexShader:J.points_vert,fragmentShader:J.points_frag},dashed:{uniforms:sl([Y.common,Y.fog,{scale:{value:1},dashSize:{value:1},totalSize:{value:2}}]),vertexShader:J.linedashed_vert,fragmentShader:J.linedashed_frag},depth:{uniforms:sl([Y.common,Y.displacementmap]),vertexShader:J.depth_vert,fragmentShader:J.depth_frag},normal:{uniforms:sl([Y.common,Y.bumpmap,Y.normalmap,Y.displacementmap,{opacity:{value:1}}]),vertexShader:J.meshnormal_vert,fragmentShader:J.meshnormal_frag},sprite:{uniforms:sl([Y.sprite,Y.fog]),vertexShader:J.sprite_vert,fragmentShader:J.sprite_frag},background:{uniforms:{uvTransform:{value:new U},t2D:{value:null},backgroundIntensity:{value:1}},vertexShader:J.background_vert,fragmentShader:J.background_frag},backgroundCube:{uniforms:{envMap:{value:null},flipEnvMap:{value:-1},backgroundBlurriness:{value:0},backgroundIntensity:{value:1},backgroundRotation:{value:new U}},vertexShader:J.backgroundCube_vert,fragmentShader:J.backgroundCube_frag},cube:{uniforms:{tCube:{value:null},tFlip:{value:-1},opacity:{value:1}},vertexShader:J.cube_vert,fragmentShader:J.cube_frag},equirect:{uniforms:{tEquirect:{value:null}},vertexShader:J.equirect_vert,fragmentShader:J.equirect_frag},distanceRGBA:{uniforms:sl([Y.common,Y.displacementmap,{referencePosition:{value:new G},nearDistance:{value:1},farDistance:{value:1e3}}]),vertexShader:J.distanceRGBA_vert,fragmentShader:J.distanceRGBA_frag},shadow:{uniforms:sl([Y.lights,Y.fog,{color:{value:new K(0)},opacity:{value:1}}]),vertexShader:J.shadow_vert,fragmentShader:J.shadow_frag}};Pl.physical={uniforms:sl([Pl.standard.uniforms,{clearcoat:{value:0},clearcoatMap:{value:null},clearcoatMapTransform:{value:new U},clearcoatNormalMap:{value:null},clearcoatNormalMapTransform:{value:new U},clearcoatNormalScale:{value:new H(1,1)},clearcoatRoughness:{value:0},clearcoatRoughnessMap:{value:null},clearcoatRoughnessMapTransform:{value:new U},dispersion:{value:0},iridescence:{value:0},iridescenceMap:{value:null},iridescenceMapTransform:{value:new U},iridescenceIOR:{value:1.3},iridescenceThicknessMinimum:{value:100},iridescenceThicknessMaximum:{value:400},iridescenceThicknessMap:{value:null},iridescenceThicknessMapTransform:{value:new U},sheen:{value:0},sheenColor:{value:new K(0)},sheenColorMap:{value:null},sheenColorMapTransform:{value:new U},sheenRoughness:{value:1},sheenRoughnessMap:{value:null},sheenRoughnessMapTransform:{value:new U},transmission:{value:0},transmissionMap:{value:null},transmissionMapTransform:{value:new U},transmissionSamplerSize:{value:new H},transmissionSamplerMap:{value:null},thickness:{value:0},thicknessMap:{value:null},thicknessMapTransform:{value:new U},attenuationDistance:{value:0},attenuationColor:{value:new K(0)},specularColor:{value:new K(1,1,1)},specularColorMap:{value:null},specularColorMapTransform:{value:new U},specularIntensity:{value:1},specularIntensityMap:{value:null},specularIntensityMapTransform:{value:new U},anisotropyVector:{value:new H},anisotropyMap:{value:null},anisotropyMapTransform:{value:new U}}]),vertexShader:J.meshphysical_vert,fragmentShader:J.meshphysical_frag};var Fl={r:0,b:0,g:0},Il=new Ks,Ll=new Is;function Rl(e,t,n,r,i,a,o){let s=new K(0),c=a===!0?0:1,l,u,d=null,f=0,p=null;function m(e){let r=e.isScene===!0?e.background:null;return r&&r.isTexture&&(r=(e.backgroundBlurriness>0?n:t).get(r)),r}function h(t){let n=!1,i=m(t);i===null?_(s,c):i&&i.isColor&&(_(i,1),n=!0);let a=e.xr.getEnvironmentBlendMode();a===`additive`?r.buffers.color.setClear(0,0,0,1,o):a===`alpha-blend`&&r.buffers.color.setClear(0,0,0,0,o),(e.autoClear||n)&&(r.buffers.depth.setTest(!0),r.buffers.depth.setMask(!0),r.buffers.color.setMask(!0),e.clear(e.autoClearColor,e.autoClearDepth,e.autoClearStencil))}function g(t,n){let r=m(n);r&&(r.isCubeTexture||r.mapping===306)?(u===void 0&&(u=new nl(new al(1,1,1),new pl({name:`BackgroundCubeMaterial`,uniforms:ol(Pl.backgroundCube.uniforms),vertexShader:Pl.backgroundCube.vertexShader,fragmentShader:Pl.backgroundCube.fragmentShader,side:1,depthTest:!1,depthWrite:!1,fog:!1})),u.geometry.deleteAttribute(`normal`),u.geometry.deleteAttribute(`uv`),u.onBeforeRender=function(e,t,n){this.matrixWorld.copyPosition(n.matrixWorld)},Object.defineProperty(u.material,"envMap",{get:function(){return this.uniforms.envMap.value}}),i.update(u)),Il.copy(n.backgroundRotation),Il.x*=-1,Il.y*=-1,Il.z*=-1,r.isCubeTexture&&r.isRenderTargetTexture===!1&&(Il.y*=-1,Il.z*=-1),u.material.uniforms.envMap.value=r,u.material.uniforms.flipEnvMap.value=r.isCubeTexture&&r.isRenderTargetTexture===!1?-1:1,u.material.uniforms.backgroundBlurriness.value=n.backgroundBlurriness,u.material.uniforms.backgroundIntensity.value=n.backgroundIntensity,u.material.uniforms.backgroundRotation.value.setFromMatrix4(Ll.makeRotationFromEuler(Il)),u.material.toneMapped=W.getTransfer(r.colorSpace)!==$a,(d!==r||f!==r.version||p!==e.toneMapping)&&(u.material.needsUpdate=!0,d=r,f=r.version,p=e.toneMapping),u.layers.enableAll(),t.unshift(u,u.geometry,u.material,0,0,null)):r&&r.isTexture&&(l===void 0&&(l=new nl(new Nl(2,2),new pl({name:`BackgroundMaterial`,uniforms:ol(Pl.background.uniforms),vertexShader:Pl.background.vertexShader,fragmentShader:Pl.background.fragmentShader,side:0,depthTest:!1,depthWrite:!1,fog:!1})),l.geometry.deleteAttribute(`normal`),Object.defineProperty(l.material,"map",{get:function(){return this.uniforms.t2D.value}}),i.update(l)),l.material.uniforms.t2D.value=r,l.material.uniforms.backgroundIntensity.value=n.backgroundIntensity,l.material.toneMapped=W.getTransfer(r.colorSpace)!==$a,r.matrixAutoUpdate===!0&&r.updateMatrix(),l.material.uniforms.uvTransform.value.copy(r.matrix),(d!==r||f!==r.version||p!==e.toneMapping)&&(l.material.needsUpdate=!0,d=r,f=r.version,p=e.toneMapping),l.layers.enableAll(),t.unshift(l,l.geometry,l.material,0,0,null))}function _(t,n){t.getRGB(Fl,ll(e)),r.buffers.color.setClear(Fl.r,Fl.g,Fl.b,n,o)}return{getClearColor:function(){return s},setClearColor:function(e,t=1){s.set(e),c=t,_(s,c)},getClearAlpha:function(){return c},setClearAlpha:function(e){c=e,_(s,c)},render:h,addToRenderList:g}}function zl(e,t){let n=e.getParameter(e.MAX_VERTEX_ATTRIBS),r={},i=f(null),a=i,o=!1;function s(n,r,i,s,c){let u=!1,f=d(s,i,r);a!==f&&(a=f,l(a.object)),u=p(n,s,i,c),u&&m(n,s,i,c),c!==null&&t.update(c,e.ELEMENT_ARRAY_BUFFER),(u||o)&&(o=!1,b(n,r,i,s),c!==null&&e.bindBuffer(e.ELEMENT_ARRAY_BUFFER,t.get(c).buffer))}function c(){return e.createVertexArray()}function l(t){return e.bindVertexArray(t)}function u(t){return e.deleteVertexArray(t)}function d(e,t,n){let i=n.wireframe===!0,a=r[e.id];a===void 0&&(a={},r[e.id]=a);let o=a[t.id];o===void 0&&(o={},a[t.id]=o);let s=o[i];return s===void 0&&(s=f(c()),o[i]=s),s}function f(e){let t=[],r=[],i=[];for(let e=0;e<n;e++)t[e]=0,r[e]=0,i[e]=0;return{geometry:null,program:null,wireframe:!1,newAttributes:t,enabledAttributes:r,attributeDivisors:i,object:e,attributes:{},index:null}}function p(e,t,n,r){let i=a.attributes,o=t.attributes,s=0,c=n.getAttributes();for(let t in c)if(c[t].location>=0){let n=i[t],r=o[t];if(r===void 0&&(t===`instanceMatrix`&&e.instanceMatrix&&(r=e.instanceMatrix),t===`instanceColor`&&e.instanceColor&&(r=e.instanceColor)),n===void 0||n.attribute!==r||r&&n.data!==r.data)return!0;s++}return a.attributesNum!==s||a.index!==r}function m(e,t,n,r){let i={},o=t.attributes,s=0,c=n.getAttributes();for(let t in c)if(c[t].location>=0){let n=o[t];n===void 0&&(t===`instanceMatrix`&&e.instanceMatrix&&(n=e.instanceMatrix),t===`instanceColor`&&e.instanceColor&&(n=e.instanceColor));let r={};r.attribute=n,n&&n.data&&(r.data=n.data),i[t]=r,s++}a.attributes=i,a.attributesNum=s,a.index=r}function h(){let e=a.newAttributes;for(let t=0,n=e.length;t<n;t++)e[t]=0}function g(e){_(e,0)}function _(t,n){let r=a.newAttributes,i=a.enabledAttributes,o=a.attributeDivisors;r[t]=1,i[t]===0&&(e.enableVertexAttribArray(t),i[t]=1),o[t]!==n&&(e.vertexAttribDivisor(t,n),o[t]=n)}function v(){let t=a.newAttributes,n=a.enabledAttributes;for(let r=0,i=n.length;r<i;r++)n[r]!==t[r]&&(e.disableVertexAttribArray(r),n[r]=0)}function y(t,n,r,i,a,o,s){s===!0?e.vertexAttribIPointer(t,n,r,a,o):e.vertexAttribPointer(t,n,r,i,a,o)}function b(n,r,i,a){h();let o=a.attributes,s=i.getAttributes(),c=r.defaultAttributeValues;for(let r in s){let i=s[r];if(i.location>=0){let s=o[r];if(s===void 0&&(r===`instanceMatrix`&&n.instanceMatrix&&(s=n.instanceMatrix),r===`instanceColor`&&n.instanceColor&&(s=n.instanceColor)),s!==void 0){let r=s.normalized,o=s.itemSize,c=t.get(s);if(c===void 0)continue;let l=c.buffer,u=c.type,d=c.bytesPerElement,f=u===e.INT||u===e.UNSIGNED_INT||s.gpuType===1013;if(s.isInterleavedBufferAttribute){let t=s.data,c=t.stride,p=s.offset;if(t.isInstancedInterleavedBuffer){for(let e=0;e<i.locationSize;e++)_(i.location+e,t.meshPerAttribute);n.isInstancedMesh!==!0&&a._maxInstanceCount===void 0&&(a._maxInstanceCount=t.meshPerAttribute*t.count)}else for(let e=0;e<i.locationSize;e++)g(i.location+e);e.bindBuffer(e.ARRAY_BUFFER,l);for(let e=0;e<i.locationSize;e++)y(i.location+e,o/i.locationSize,u,r,c*d,(p+o/i.locationSize*e)*d,f)}else{if(s.isInstancedBufferAttribute){for(let e=0;e<i.locationSize;e++)_(i.location+e,s.meshPerAttribute);n.isInstancedMesh!==!0&&a._maxInstanceCount===void 0&&(a._maxInstanceCount=s.meshPerAttribute*s.count)}else for(let e=0;e<i.locationSize;e++)g(i.location+e);e.bindBuffer(e.ARRAY_BUFFER,l);for(let e=0;e<i.locationSize;e++)y(i.location+e,o/i.locationSize,u,r,o*d,o/i.locationSize*e*d,f)}}else if(c!==void 0){let t=c[r];if(t!==void 0)switch(t.length){case 2:e.vertexAttrib2fv(i.location,t);break;case 3:e.vertexAttrib3fv(i.location,t);break;case 4:e.vertexAttrib4fv(i.location,t);break;default:e.vertexAttrib1fv(i.location,t)}}}}v()}function x(){w();for(let e in r){let t=r[e];for(let e in t){let n=t[e];for(let e in n)u(n[e].object),delete n[e];delete t[e]}delete r[e]}}function S(e){if(r[e.id]===void 0)return;let t=r[e.id];for(let e in t){let n=t[e];for(let e in n)u(n[e].object),delete n[e];delete t[e]}delete r[e.id]}function C(e){for(let t in r){let n=r[t];if(n[e.id]===void 0)continue;let i=n[e.id];for(let e in i)u(i[e].object),delete i[e];delete n[e.id]}}function w(){T(),o=!0,a!==i&&(a=i,l(a.object))}function T(){i.geometry=null,i.program=null,i.wireframe=!1}return{setup:s,reset:w,resetDefaultState:T,dispose:x,releaseStatesOfGeometry:S,releaseStatesOfProgram:C,initAttributes:h,enableAttribute:g,disableUnusedAttributes:v}}function Bl(e,t,n){let r;function i(e){r=e}function a(t,i){e.drawArrays(r,t,i),n.update(i,r,1)}function o(t,i,a){a!==0&&(e.drawArraysInstanced(r,t,i,a),n.update(i,r,a))}function s(e,i,a){if(a===0)return;t.get(`WEBGL_multi_draw`).multiDrawArraysWEBGL(r,e,0,i,0,a);let o=0;for(let e=0;e<a;e++)o+=i[e];n.update(o,r,1)}function c(e,i,a,s){if(a===0)return;let c=t.get(`WEBGL_multi_draw`);if(c===null)for(let t=0;t<e.length;t++)o(e[t],i[t],s[t]);else{c.multiDrawArraysInstancedWEBGL(r,e,0,i,0,s,0,a);let t=0;for(let e=0;e<a;e++)t+=i[e];for(let e=0;e<s.length;e++)n.update(t,r,s[e])}}this.setMode=i,this.render=a,this.renderInstances=o,this.renderMultiDraw=s,this.renderMultiDrawInstances=c}function Vl(e,t,n,r){let i;function a(){if(i!==void 0)return i;if(t.has(`EXT_texture_filter_anisotropic`)===!0){let n=t.get(`EXT_texture_filter_anisotropic`);i=e.getParameter(n.MAX_TEXTURE_MAX_ANISOTROPY_EXT)}else i=0;return i}function o(t){return t===1023||r.convert(t)===e.getParameter(e.IMPLEMENTATION_COLOR_READ_FORMAT)}function s(n){let i=n===1016&&(t.has(`EXT_color_buffer_half_float`)||t.has(`EXT_color_buffer_float`));return!(n!==1009&&r.convert(n)!==e.getParameter(e.IMPLEMENTATION_COLOR_READ_TYPE)&&n!==1015&&!i)}function c(t){if(t===`highp`){if(e.getShaderPrecisionFormat(e.VERTEX_SHADER,e.HIGH_FLOAT).precision>0&&e.getShaderPrecisionFormat(e.FRAGMENT_SHADER,e.HIGH_FLOAT).precision>0)return`highp`;t=`mediump`}return t===`mediump`&&e.getShaderPrecisionFormat(e.VERTEX_SHADER,e.MEDIUM_FLOAT).precision>0&&e.getShaderPrecisionFormat(e.FRAGMENT_SHADER,e.MEDIUM_FLOAT).precision>0?`mediump`:`lowp`}let l=n.precision===void 0?`highp`:n.precision,u=c(l);u!==l&&(console.warn(`THREE.WebGLRenderer:`,l,`not supported, using`,u,`instead.`),l=u);let d=n.logarithmicDepthBuffer===!0,f=n.reverseDepthBuffer===!0&&t.has(`EXT_clip_control`);if(f===!0){let e=t.get(`EXT_clip_control`);e.clipControlEXT(e.LOWER_LEFT_EXT,e.ZERO_TO_ONE_EXT)}let p=e.getParameter(e.MAX_TEXTURE_IMAGE_UNITS),m=e.getParameter(e.MAX_VERTEX_TEXTURE_IMAGE_UNITS),h=e.getParameter(e.MAX_TEXTURE_SIZE),g=e.getParameter(e.MAX_CUBE_MAP_TEXTURE_SIZE),_=e.getParameter(e.MAX_VERTEX_ATTRIBS),v=e.getParameter(e.MAX_VERTEX_UNIFORM_VECTORS),y=e.getParameter(e.MAX_VARYING_VECTORS),b=e.getParameter(e.MAX_FRAGMENT_UNIFORM_VECTORS),x=m>0,S=e.getParameter(e.MAX_SAMPLES);return{isWebGL2:!0,getMaxAnisotropy:a,getMaxPrecision:c,textureFormatReadable:o,textureTypeReadable:s,precision:l,logarithmicDepthBuffer:d,reverseDepthBuffer:f,maxTextures:p,maxVertexTextures:m,maxTextureSize:h,maxCubemapSize:g,maxAttributes:_,maxVertexUniforms:v,maxVaryings:y,maxFragmentUniforms:b,vertexTextures:x,maxSamples:S}}function Hl(e){let t=this,n=null,r=0,i=!1,a=!1,o=new Dl,s=new U,c={value:null,needsUpdate:!1};this.uniform=c,this.numPlanes=0,this.numIntersection=0,this.init=function(e,t){let n=e.length!==0||t||r!==0||i;return i=t,r=e.length,n},this.beginShadows=function(){a=!0,u(null)},this.endShadows=function(){a=!1},this.setGlobalState=function(e,t){n=u(e,t,0)},this.setState=function(t,o,s){let d=t.clippingPlanes,f=t.clipIntersection,p=t.clipShadows,m=e.get(t);if(!i||d===null||d.length===0||a&&!p)a?u(null):l();else{let e=a?0:r,t=e*4,i=m.clippingState||null;c.value=i,i=u(d,o,t,s);for(let e=0;e!==t;++e)i[e]=n[e];m.clippingState=i,this.numIntersection=f?this.numPlanes:0,this.numPlanes+=e}};function l(){c.value!==n&&(c.value=n,c.needsUpdate=r>0),t.numPlanes=r,t.numIntersection=0}function u(e,n,r,i){let a=e===null?0:e.length,l=null;if(a!==0){if(l=c.value,i!==!0||l===null){let t=r+a*4,i=n.matrixWorldInverse;s.getNormalMatrix(i),(l===null||l.length<t)&&(l=new Float32Array(t));for(let t=0,n=r;t!==a;++t,n+=4)o.copy(e[t]).applyMatrix4(i,s),o.normal.toArray(l,n),l[n+3]=o.constant}c.value=l,c.needsUpdate=!0}return t.numPlanes=a,t.numIntersection=0,l}}function Ul(e){let t=new WeakMap;function n(e,t){return t===303?e.mapping=301:t===304&&(e.mapping=302),e}function r(r){if(r&&r.isTexture){let a=r.mapping;if(a===303||a===304){if(t.has(r)){let e=t.get(r).texture;return n(e,r.mapping)}{let a=r.image;if(a&&a.height>0){let o=new Cl(a.height);return o.fromEquirectangularTexture(e,r),t.set(r,o),r.addEventListener(`dispose`,i),n(o.texture,r.mapping)}return null}}}return r}function i(e){let n=e.target;n.removeEventListener(`dispose`,i);let r=t.get(n);r!==void 0&&(t.delete(n),r.dispose())}function a(){t=new WeakMap}return{get:r,dispose:a}}var Wl=class extends ml{constructor(e=-1,t=1,n=1,r=-1,i=.1,a=2e3){super(),this.isOrthographicCamera=!0,this.type=`OrthographicCamera`,this.zoom=1,this.view=null,this.left=e,this.right=t,this.top=n,this.bottom=r,this.near=i,this.far=a,this.updateProjectionMatrix()}copy(e,t){return super.copy(e,t),this.left=e.left,this.right=e.right,this.top=e.top,this.bottom=e.bottom,this.near=e.near,this.far=e.far,this.zoom=e.zoom,this.view=e.view===null?null:Object.assign({},e.view),this}setViewOffset(e,t,n,r,i,a){this.view===null&&(this.view={enabled:!0,fullWidth:1,fullHeight:1,offsetX:0,offsetY:0,width:1,height:1}),this.view.enabled=!0,this.view.fullWidth=e,this.view.fullHeight=t,this.view.offsetX=n,this.view.offsetY=r,this.view.width=i,this.view.height=a,this.updateProjectionMatrix()}clearViewOffset(){this.view!==null&&(this.view.enabled=!1),this.updateProjectionMatrix()}updateProjectionMatrix(){let e=(this.right-this.left)/(2*this.zoom),t=(this.top-this.bottom)/(2*this.zoom),n=(this.right+this.left)/2,r=(this.top+this.bottom)/2,i=n-e,a=n+e,o=r+t,s=r-t;if(this.view!==null&&this.view.enabled){let e=(this.right-this.left)/this.view.fullWidth/this.zoom,t=(this.top-this.bottom)/this.view.fullHeight/this.zoom;i+=e*this.view.offsetX,a=i+e*this.view.width,o-=t*this.view.offsetY,s=o-t*this.view.height}this.projectionMatrix.makeOrthographic(i,a,o,s,this.near,this.far,this.coordinateSystem),this.projectionMatrixInverse.copy(this.projectionMatrix).invert()}toJSON(e){let t=super.toJSON(e);return t.object.zoom=this.zoom,t.object.left=this.left,t.object.right=this.right,t.object.top=this.top,t.object.bottom=this.bottom,t.object.near=this.near,t.object.far=this.far,this.view!==null&&(t.object.view=Object.assign({},this.view)),t}},Gl=4,Kl=[.125,.215,.35,.446,.526,.582],ql=20,Jl=new Wl,Yl=new K,Xl=null,Zl=0,Ql=0,$l=!1,eu=(1+Math.sqrt(5))/2,tu=1/eu,nu=[new G(-eu,tu,0),new G(eu,tu,0),new G(-tu,0,eu),new G(tu,0,eu),new G(0,eu,-tu),new G(0,eu,tu),new G(-1,1,-1),new G(1,1,-1),new G(-1,1,1),new G(1,1,1)],ru=class{constructor(e){this._renderer=e,this._pingPongRenderTarget=null,this._lodMax=0,this._cubeSize=0,this._lodPlanes=[],this._sizeLods=[],this._sigmas=[],this._blurMaterial=null,this._cubemapMaterial=null,this._equirectMaterial=null,this._compileMaterial(this._blurMaterial)}fromScene(e,t=0,n=.1,r=100){Xl=this._renderer.getRenderTarget(),Zl=this._renderer.getActiveCubeFace(),Ql=this._renderer.getActiveMipmapLevel(),$l=this._renderer.xr.enabled,this._renderer.xr.enabled=!1,this._setSize(256);let i=this._allocateTargets();return i.depthBuffer=!0,this._sceneToCubeUV(e,n,r,i),t>0&&this._blur(i,0,0,t),this._applyPMREM(i),this._cleanup(i),i}fromEquirectangular(e,t=null){return this._fromTexture(e,t)}fromCubemap(e,t=null){return this._fromTexture(e,t)}compileCubemapShader(){this._cubemapMaterial===null&&(this._cubemapMaterial=lu(),this._compileMaterial(this._cubemapMaterial))}compileEquirectangularShader(){this._equirectMaterial===null&&(this._equirectMaterial=cu(),this._compileMaterial(this._equirectMaterial))}dispose(){this._dispose(),this._cubemapMaterial!==null&&this._cubemapMaterial.dispose(),this._equirectMaterial!==null&&this._equirectMaterial.dispose()}_setSize(e){this._lodMax=Math.floor(Math.log2(e)),this._cubeSize=2**this._lodMax}_dispose(){this._blurMaterial!==null&&this._blurMaterial.dispose(),this._pingPongRenderTarget!==null&&this._pingPongRenderTarget.dispose();for(let e=0;e<this._lodPlanes.length;e++)this._lodPlanes[e].dispose()}_cleanup(e){this._renderer.setRenderTarget(Xl,Zl,Ql),this._renderer.xr.enabled=$l,e.scissorTest=!1,ou(e,0,0,e.width,e.height)}_fromTexture(e,t){e.mapping===301||e.mapping===302?this._setSize(e.image.length===0?16:e.image[0].width||e.image[0].image.width):this._setSize(e.image.width/4),Xl=this._renderer.getRenderTarget(),Zl=this._renderer.getActiveCubeFace(),Ql=this._renderer.getActiveMipmapLevel(),$l=this._renderer.xr.enabled,this._renderer.xr.enabled=!1;let n=t||this._allocateTargets();return this._textureToCubeUV(e,n),this._applyPMREM(n),this._cleanup(n),n}_allocateTargets(){let e=3*Math.max(this._cubeSize,112),t=4*this._cubeSize,n={magFilter:Fi,minFilter:Fi,generateMipmaps:!1,type:Gi,format:Qi,colorSpace:Ya,depthBuffer:!1},r=au(e,t,n);if(this._pingPongRenderTarget===null||this._pingPongRenderTarget.width!==e||this._pingPongRenderTarget.height!==t){this._pingPongRenderTarget!==null&&this._dispose(),this._pingPongRenderTarget=au(e,t,n);let{_lodMax:r}=this;({sizeLods:this._sizeLods,lodPlanes:this._lodPlanes,sigmas:this._sigmas}=iu(r)),this._blurMaterial=su(r,e,t)}return r}_compileMaterial(e){let t=new nl(this._lodPlanes[0],e);this._renderer.compile(t,Jl)}_sceneToCubeUV(e,t,n,r){let i=new vl(90,1,t,n),a=[1,-1,1,1,1,1],o=[1,1,1,-1,-1,-1],s=this._renderer,c=s.autoClear,l=s.toneMapping;s.getClearColor(Yl),s.toneMapping=0,s.autoClear=!1;let u=new jc({name:`PMREM.Background`,side:1,depthWrite:!1,depthTest:!1}),d=new nl(new al,u),f=!1,p=e.background;p?p.isColor&&(u.color.copy(p),e.background=null,f=!0):(u.color.copy(Yl),f=!0);for(let t=0;t<6;t++){let n=t%3;n===0?(i.up.set(0,a[t],0),i.lookAt(o[t],0,0)):n===1?(i.up.set(0,0,a[t]),i.lookAt(0,o[t],0)):(i.up.set(0,a[t],0),i.lookAt(0,0,o[t]));let c=this._cubeSize;ou(r,n*c,t>2?c:0,c,c),s.setRenderTarget(r),f&&s.render(d,i),s.render(e,i)}d.geometry.dispose(),d.material.dispose(),s.toneMapping=l,s.autoClear=c,e.background=p}_textureToCubeUV(e,t){let n=this._renderer,r=e.mapping===301||e.mapping===302;r?(this._cubemapMaterial===null&&(this._cubemapMaterial=lu()),this._cubemapMaterial.uniforms.flipEnvMap.value=e.isRenderTargetTexture===!1?-1:1):this._equirectMaterial===null&&(this._equirectMaterial=cu());let i=r?this._cubemapMaterial:this._equirectMaterial,a=new nl(this._lodPlanes[0],i),o=i.uniforms;o.envMap.value=e;let s=this._cubeSize;ou(t,0,0,3*s,2*s),n.setRenderTarget(t),n.render(a,Jl)}_applyPMREM(e){let t=this._renderer,n=t.autoClear;t.autoClear=!1;let r=this._lodPlanes.length;for(let t=1;t<r;t++){let n=Math.sqrt(this._sigmas[t]*this._sigmas[t]-this._sigmas[t-1]*this._sigmas[t-1]),i=nu[(r-t-1)%nu.length];this._blur(e,t-1,t,n,i)}t.autoClear=n}_blur(e,t,n,r,i){let a=this._pingPongRenderTarget;this._halfBlur(e,a,t,n,r,`latitudinal`,i),this._halfBlur(a,e,n,n,r,`longitudinal`,i)}_halfBlur(e,t,n,r,i,a,o){let s=this._renderer,c=this._blurMaterial;a!==`latitudinal`&&a!==`longitudinal`&&console.error(`blur direction must be either latitudinal or longitudinal!`);let l=new nl(this._lodPlanes[r],c),u=c.uniforms,d=this._sizeLods[n]-1,f=isFinite(i)?Math.PI/(2*d):2*Math.PI/39,p=i/f,m=isFinite(i)?1+Math.floor(3*p):ql;m>ql&&console.warn(`sigmaRadians, ${i}, is too large and will clip, as it requested ${m} samples when the maximum is set to ${ql}`);let h=[],g=0;for(let e=0;e<ql;++e){let t=e/p,n=Math.exp(-t*t/2);h.push(n),e===0?g+=n:e<m&&(g+=2*n)}for(let e=0;e<h.length;e++)h[e]=h[e]/g;u.envMap.value=e.texture,u.samples.value=m,u.weights.value=h,u.latitudinal.value=a===`latitudinal`,o&&(u.poleAxis.value=o);let{_lodMax:_}=this;u.dTheta.value=f,u.mipInt.value=_-n;let v=this._sizeLods[r];ou(t,3*v*(r>_-Gl?r-_+Gl:0),4*(this._cubeSize-v),3*v,2*v),s.setRenderTarget(t),s.render(l,Jl)}};function iu(e){let t=[],n=[],r=[],i=e,a=e-Gl+1+Kl.length;for(let o=0;o<a;o++){let a=2**i;n.push(a);let s=1/a;o>e-Gl?s=Kl[o-e+Gl-1]:o===0&&(s=0),r.push(s);let c=1/(a-2),l=-c,u=1+c,d=[l,l,u,l,u,u,l,l,u,u,l,u],f=new Float32Array(108),p=new Float32Array(72),m=new Float32Array(36);for(let e=0;e<6;e++){let t=e%3*2/3-1,n=e>2?0:-1,r=[t,n,0,t+2/3,n,0,t+2/3,n+1,0,t,n,0,t+2/3,n+1,0,t,n+1,0];f.set(r,18*e),p.set(d,12*e);let i=[e,e,e,e,e,e];m.set(i,6*e)}let h=new Wc;h.setAttribute(`position`,new Pc(f,3)),h.setAttribute(`uv`,new Pc(p,2)),h.setAttribute(`faceIndex`,new Pc(m,1)),t.push(h),i>Gl&&i--}return{lodPlanes:t,sizeLods:n,sigmas:r}}function au(e,t,n){let r=new rs(e,t,n);return r.texture.mapping=306,r.texture.name=`PMREM.cubeUv`,r.scissorTest=!0,r}function ou(e,t,n,r,i){e.viewport.set(t,n,r,i),e.scissor.set(t,n,r,i)}function su(e,t,n){let r=new Float32Array(ql),i=new G(0,1,0);return new pl({name:`SphericalGaussianBlur`,defines:{n:ql,CUBEUV_TEXEL_WIDTH:1/t,CUBEUV_TEXEL_HEIGHT:1/n,CUBEUV_MAX_MIP:`${e}.0`},uniforms:{envMap:{value:null},samples:{value:1},weights:{value:r},latitudinal:{value:!1},dTheta:{value:0},mipInt:{value:0},poleAxis:{value:i}},vertexShader:uu(),fragmentShader:`

			precision mediump float;
			precision mediump int;

			varying vec3 vOutputDirection;

			uniform sampler2D envMap;
			uniform int samples;
			uniform float weights[ n ];
			uniform bool latitudinal;
			uniform float dTheta;
			uniform float mipInt;
			uniform vec3 poleAxis;

			#define ENVMAP_TYPE_CUBE_UV
			#include <cube_uv_reflection_fragment>

			vec3 getSample( float theta, vec3 axis ) {

				float cosTheta = cos( theta );
				// Rodrigues' axis-angle rotation
				vec3 sampleDirection = vOutputDirection * cosTheta
					+ cross( axis, vOutputDirection ) * sin( theta )
					+ axis * dot( axis, vOutputDirection ) * ( 1.0 - cosTheta );

				return bilinearCubeUV( envMap, sampleDirection, mipInt );

			}

			void main() {

				vec3 axis = latitudinal ? poleAxis : cross( poleAxis, vOutputDirection );

				if ( all( equal( axis, vec3( 0.0 ) ) ) ) {

					axis = vec3( vOutputDirection.z, 0.0, - vOutputDirection.x );

				}

				axis = normalize( axis );

				gl_FragColor = vec4( 0.0, 0.0, 0.0, 1.0 );
				gl_FragColor.rgb += weights[ 0 ] * getSample( 0.0, axis );

				for ( int i = 1; i < n; i++ ) {

					if ( i >= samples ) {

						break;

					}

					float theta = dTheta * float( i );
					gl_FragColor.rgb += weights[ i ] * getSample( -1.0 * theta, axis );
					gl_FragColor.rgb += weights[ i ] * getSample( theta, axis );

				}

			}
		`,blending:0,depthTest:!1,depthWrite:!1})}function cu(){return new pl({name:`EquirectangularToCubeUV`,uniforms:{envMap:{value:null}},vertexShader:uu(),fragmentShader:`

			precision mediump float;
			precision mediump int;

			varying vec3 vOutputDirection;

			uniform sampler2D envMap;

			#include <common>

			void main() {

				vec3 outputDirection = normalize( vOutputDirection );
				vec2 uv = equirectUv( outputDirection );

				gl_FragColor = vec4( texture2D ( envMap, uv ).rgb, 1.0 );

			}
		`,blending:0,depthTest:!1,depthWrite:!1})}function lu(){return new pl({name:`CubemapToCubeUV`,uniforms:{envMap:{value:null},flipEnvMap:{value:-1}},vertexShader:uu(),fragmentShader:`

			precision mediump float;
			precision mediump int;

			uniform float flipEnvMap;

			varying vec3 vOutputDirection;

			uniform samplerCube envMap;

			void main() {

				gl_FragColor = textureCube( envMap, vec3( flipEnvMap * vOutputDirection.x, vOutputDirection.yz ) );

			}
		`,blending:0,depthTest:!1,depthWrite:!1})}function uu(){return`

		precision mediump float;
		precision mediump int;

		attribute float faceIndex;

		varying vec3 vOutputDirection;

		// RH coordinate system; PMREM face-indexing convention
		vec3 getDirection( vec2 uv, float face ) {

			uv = 2.0 * uv - 1.0;

			vec3 direction = vec3( uv, 1.0 );

			if ( face == 0.0 ) {

				direction = direction.zyx; // ( 1, v, u ) pos x

			} else if ( face == 1.0 ) {

				direction = direction.xzy;
				direction.xz *= -1.0; // ( -u, 1, -v ) pos y

			} else if ( face == 2.0 ) {

				direction.x *= -1.0; // ( -u, v, 1 ) pos z

			} else if ( face == 3.0 ) {

				direction = direction.zyx;
				direction.xz *= -1.0; // ( -1, v, -u ) neg x

			} else if ( face == 4.0 ) {

				direction = direction.xzy;
				direction.xy *= -1.0; // ( -u, -1, v ) neg y

			} else if ( face == 5.0 ) {

				direction.z *= -1.0; // ( u, v, -1 ) neg z

			}

			return direction;

		}

		void main() {

			vOutputDirection = getDirection( uv, faceIndex );
			gl_Position = vec4( position, 1.0 );

		}
	`}function du(e){let t=new WeakMap,n=null;function r(r){if(r&&r.isTexture){let o=r.mapping,s=o===303||o===304,c=o===301||o===302;if(s||c){let o=t.get(r),l=o===void 0?0:o.texture.pmremVersion;if(r.isRenderTargetTexture&&r.pmremVersion!==l)return n===null&&(n=new ru(e)),o=s?n.fromEquirectangular(r,o):n.fromCubemap(r,o),o.texture.pmremVersion=r.pmremVersion,t.set(r,o),o.texture;if(o!==void 0)return o.texture;{let l=r.image;return s&&l&&l.height>0||c&&l&&i(l)?(n===null&&(n=new ru(e)),o=s?n.fromEquirectangular(r):n.fromCubemap(r),o.texture.pmremVersion=r.pmremVersion,t.set(r,o),r.addEventListener(`dispose`,a),o.texture):null}}}return r}function i(e){let t=0;for(let n=0;n<6;n++)e[n]!==void 0&&t++;return t===6}function a(e){let n=e.target;n.removeEventListener(`dispose`,a);let r=t.get(n);r!==void 0&&(t.delete(n),r.dispose())}function o(){t=new WeakMap,n!==null&&(n.dispose(),n=null)}return{get:r,dispose:o}}function fu(e){let t={};function n(n){if(t[n]!==void 0)return t[n];let r;switch(n){case`WEBGL_depth_texture`:r=e.getExtension(`WEBGL_depth_texture`)||e.getExtension(`MOZ_WEBGL_depth_texture`)||e.getExtension(`WEBKIT_WEBGL_depth_texture`);break;case`EXT_texture_filter_anisotropic`:r=e.getExtension(`EXT_texture_filter_anisotropic`)||e.getExtension(`MOZ_EXT_texture_filter_anisotropic`)||e.getExtension(`WEBKIT_EXT_texture_filter_anisotropic`);break;case`WEBGL_compressed_texture_s3tc`:r=e.getExtension(`WEBGL_compressed_texture_s3tc`)||e.getExtension(`MOZ_WEBGL_compressed_texture_s3tc`)||e.getExtension(`WEBKIT_WEBGL_compressed_texture_s3tc`);break;case`WEBGL_compressed_texture_pvrtc`:r=e.getExtension(`WEBGL_compressed_texture_pvrtc`)||e.getExtension(`WEBKIT_WEBGL_compressed_texture_pvrtc`);break;default:r=e.getExtension(n)}return t[n]=r,r}return{has:function(e){return n(e)!==null},init:function(){n(`EXT_color_buffer_float`),n(`WEBGL_clip_cull_distance`),n(`OES_texture_float_linear`),n(`EXT_color_buffer_half_float`),n(`WEBGL_multisampled_render_to_texture`),n(`WEBGL_render_shared_exponent`)},get:function(e){let t=n(e);return t===null&&Ro(`THREE.WebGLRenderer: `+e+` extension not supported.`),t}}}function pu(e,t,n,r){let i={},a=new WeakMap;function o(e){let s=e.target;s.index!==null&&t.remove(s.index);for(let e in s.attributes)t.remove(s.attributes[e]);for(let e in s.morphAttributes){let n=s.morphAttributes[e];for(let e=0,r=n.length;e<r;e++)t.remove(n[e])}s.removeEventListener(`dispose`,o),delete i[s.id];let c=a.get(s);c&&(t.remove(c),a.delete(s)),r.releaseStatesOfGeometry(s),s.isInstancedBufferGeometry===!0&&delete s._maxInstanceCount,n.memory.geometries--}function s(e,t){return i[t.id]===!0||(t.addEventListener(`dispose`,o),i[t.id]=!0,n.memory.geometries++),t}function c(n){let r=n.attributes;for(let n in r)t.update(r[n],e.ARRAY_BUFFER);let i=n.morphAttributes;for(let n in i){let r=i[n];for(let n=0,i=r.length;n<i;n++)t.update(r[n],e.ARRAY_BUFFER)}}function l(e){let n=[],r=e.index,i=e.attributes.position,o=0;if(r!==null){let e=r.array;o=r.version;for(let t=0,r=e.length;t<r;t+=3){let r=e[t+0],i=e[t+1],a=e[t+2];n.push(r,i,i,a,a,r)}}else if(i!==void 0){let e=i.array;o=i.version;for(let t=0,r=e.length/3-1;t<r;t+=3){let e=t+0,r=t+1,i=t+2;n.push(e,r,r,i,i,e)}}else return;let s=new(Po(n)?Ic:Fc)(n,1);s.version=o;let c=a.get(e);c&&t.remove(c),a.set(e,s)}function u(e){let t=a.get(e);if(t){let n=e.index;n!==null&&t.version<n.version&&l(e)}else l(e);return a.get(e)}return{get:s,update:c,getWireframeAttribute:u}}function mu(e,t,n){let r;function i(e){r=e}let a,o;function s(e){a=e.type,o=e.bytesPerElement}function c(t,i){e.drawElements(r,i,a,t*o),n.update(i,r,1)}function l(t,i,s){s!==0&&(e.drawElementsInstanced(r,i,a,t*o,s),n.update(i,r,s))}function u(e,i,o){if(o===0)return;t.get(`WEBGL_multi_draw`).multiDrawElementsWEBGL(r,i,0,a,e,0,o);let s=0;for(let e=0;e<o;e++)s+=i[e];n.update(s,r,1)}function d(e,i,s,c){if(s===0)return;let u=t.get(`WEBGL_multi_draw`);if(u===null)for(let t=0;t<e.length;t++)l(e[t]/o,i[t],c[t]);else{u.multiDrawElementsInstancedWEBGL(r,i,0,a,e,0,c,0,s);let t=0;for(let e=0;e<s;e++)t+=i[e];for(let e=0;e<c.length;e++)n.update(t,r,c[e])}}this.setMode=i,this.setIndex=s,this.render=c,this.renderInstances=l,this.renderMultiDraw=u,this.renderMultiDrawInstances=d}function hu(e){let t={geometries:0,textures:0},n={frame:0,calls:0,triangles:0,points:0,lines:0};function r(t,r,i){switch(n.calls++,r){case e.TRIANGLES:n.triangles+=t/3*i;break;case e.LINES:n.lines+=t/2*i;break;case e.LINE_STRIP:n.lines+=i*(t-1);break;case e.LINE_LOOP:n.lines+=i*t;break;case e.POINTS:n.points+=i*t;break;default:console.error(`THREE.WebGLInfo: Unknown draw mode:`,r)}}function i(){n.calls=0,n.triangles=0,n.points=0,n.lines=0}return{memory:t,render:n,programs:null,autoReset:!0,reset:i,update:r}}function gu(e,t,n){let r=new WeakMap,i=new ts;function a(a,o,s){let c=a.morphTargetInfluences,l=o.morphAttributes.position||o.morphAttributes.normal||o.morphAttributes.color,u=l===void 0?0:l.length,d=r.get(o);if(d===void 0||d.count!==u){d!==void 0&&d.texture.dispose();let e=o.morphAttributes.position!==void 0,n=o.morphAttributes.normal!==void 0,a=o.morphAttributes.color!==void 0,s=o.morphAttributes.position||[],c=o.morphAttributes.normal||[],l=o.morphAttributes.color||[],f=0;e===!0&&(f=1),n===!0&&(f=2),a===!0&&(f=3);let p=o.attributes.position.count*f,m=1;p>t.maxTextureSize&&(m=Math.ceil(p/t.maxTextureSize),p=t.maxTextureSize);let h=new Float32Array(p*m*4*u),g=new is(h,p,m,u);g.type=Wi,g.needsUpdate=!0;let _=f*4;for(let t=0;t<u;t++){let r=s[t],o=c[t],u=l[t],d=p*m*4*t;for(let t=0;t<r.count;t++){let s=t*_;e===!0&&(i.fromBufferAttribute(r,t),h[d+s+0]=i.x,h[d+s+1]=i.y,h[d+s+2]=i.z,h[d+s+3]=0),n===!0&&(i.fromBufferAttribute(o,t),h[d+s+4]=i.x,h[d+s+5]=i.y,h[d+s+6]=i.z,h[d+s+7]=0),a===!0&&(i.fromBufferAttribute(u,t),h[d+s+8]=i.x,h[d+s+9]=i.y,h[d+s+10]=i.z,h[d+s+11]=u.itemSize===4?i.w:1)}}d={count:u,texture:g,size:new H(p,m)},r.set(o,d);function v(){g.dispose(),r.delete(o),o.removeEventListener(`dispose`,v)}o.addEventListener(`dispose`,v)}if(a.isInstancedMesh===!0&&a.morphTexture!==null)s.getUniforms().setValue(e,`morphTexture`,a.morphTexture,n);else{let t=0;for(let e=0;e<c.length;e++)t+=c[e];let n=o.morphTargetsRelative?1:1-t;s.getUniforms().setValue(e,`morphTargetBaseInfluence`,n),s.getUniforms().setValue(e,`morphTargetInfluences`,c)}s.getUniforms().setValue(e,`morphTargetsTexture`,d.texture,n),s.getUniforms().setValue(e,`morphTargetsTextureSize`,d.size)}return{update:a}}function _u(e,t,n,r){let i=new WeakMap;function a(a){let o=r.render.frame,c=a.geometry,l=t.get(a,c);if(i.get(l)!==o&&(t.update(l),i.set(l,o)),a.isInstancedMesh&&(a.hasEventListener(`dispose`,s)===!1&&a.addEventListener(`dispose`,s),i.get(a)!==o&&(n.update(a.instanceMatrix,e.ARRAY_BUFFER),a.instanceColor!==null&&n.update(a.instanceColor,e.ARRAY_BUFFER),i.set(a,o))),a.isSkinnedMesh){let e=a.skeleton;i.get(e)!==o&&(e.update(),i.set(e,o))}return l}function o(){i=new WeakMap}function s(e){let t=e.target;t.removeEventListener(`dispose`,s),n.remove(t.instanceMatrix),t.instanceColor!==null&&n.remove(t.instanceColor)}return{update:a,dispose:o}}var vu=class extends es{constructor(e,t,n,r,i,a,o,s,c,l=ta){if(l!==1026&&l!==1027)throw Error(`DepthTexture format must be either THREE.DepthFormat or THREE.DepthStencilFormat`);n===void 0&&l===1026&&(n=Ui),n===void 0&&l===1027&&(n=Ji),super(null,r,i,a,o,s,l,n,c),this.isDepthTexture=!0,this.image={width:e,height:t},this.magFilter=o===void 0?Mi:o,this.minFilter=s===void 0?Mi:s,this.flipY=!1,this.generateMipmaps=!1,this.compareFunction=null}copy(e){return super.copy(e),this.compareFunction=e.compareFunction,this}toJSON(e){let t=super.toJSON(e);return this.compareFunction!==null&&(t.compareFunction=this.compareFunction),t}},yu=new es,bu=new vu(1,1),xu=new is,Su=new as,Cu=new Sl,wu=[],Tu=[],Eu=new Float32Array(16),Du=new Float32Array(9),Ou=new Float32Array(4);function ku(e,t,n){let r=e[0];if(r<=0||r>0)return e;let i=t*n,a=wu[i];if(a===void 0&&(a=new Float32Array(i),wu[i]=a),t!==0){r.toArray(a,0);for(let r=1,i=0;r!==t;++r)i+=n,e[r].toArray(a,i)}return a}function Au(e,t){if(e.length!==t.length)return!1;for(let n=0,r=e.length;n<r;n++)if(e[n]!==t[n])return!1;return!0}function ju(e,t){for(let n=0,r=t.length;n<r;n++)e[n]=t[n]}function Mu(e,t){let n=Tu[t];n===void 0&&(n=new Int32Array(t),Tu[t]=n);for(let r=0;r!==t;++r)n[r]=e.allocateTextureUnit();return n}function Nu(e,t){let n=this.cache;n[0]!==t&&(e.uniform1f(this.addr,t),n[0]=t)}function Pu(e,t){let n=this.cache;if(t.x!==void 0)(n[0]!==t.x||n[1]!==t.y)&&(e.uniform2f(this.addr,t.x,t.y),n[0]=t.x,n[1]=t.y);else{if(Au(n,t))return;e.uniform2fv(this.addr,t),ju(n,t)}}function Fu(e,t){let n=this.cache;if(t.x!==void 0)(n[0]!==t.x||n[1]!==t.y||n[2]!==t.z)&&(e.uniform3f(this.addr,t.x,t.y,t.z),n[0]=t.x,n[1]=t.y,n[2]=t.z);else if(t.r!==void 0)(n[0]!==t.r||n[1]!==t.g||n[2]!==t.b)&&(e.uniform3f(this.addr,t.r,t.g,t.b),n[0]=t.r,n[1]=t.g,n[2]=t.b);else{if(Au(n,t))return;e.uniform3fv(this.addr,t),ju(n,t)}}function Iu(e,t){let n=this.cache;if(t.x!==void 0)(n[0]!==t.x||n[1]!==t.y||n[2]!==t.z||n[3]!==t.w)&&(e.uniform4f(this.addr,t.x,t.y,t.z,t.w),n[0]=t.x,n[1]=t.y,n[2]=t.z,n[3]=t.w);else{if(Au(n,t))return;e.uniform4fv(this.addr,t),ju(n,t)}}function Lu(e,t){let n=this.cache,r=t.elements;if(r===void 0){if(Au(n,t))return;e.uniformMatrix2fv(this.addr,!1,t),ju(n,t)}else{if(Au(n,r))return;Ou.set(r),e.uniformMatrix2fv(this.addr,!1,Ou),ju(n,r)}}function Ru(e,t){let n=this.cache,r=t.elements;if(r===void 0){if(Au(n,t))return;e.uniformMatrix3fv(this.addr,!1,t),ju(n,t)}else{if(Au(n,r))return;Du.set(r),e.uniformMatrix3fv(this.addr,!1,Du),ju(n,r)}}function zu(e,t){let n=this.cache,r=t.elements;if(r===void 0){if(Au(n,t))return;e.uniformMatrix4fv(this.addr,!1,t),ju(n,t)}else{if(Au(n,r))return;Eu.set(r),e.uniformMatrix4fv(this.addr,!1,Eu),ju(n,r)}}function Bu(e,t){let n=this.cache;n[0]!==t&&(e.uniform1i(this.addr,t),n[0]=t)}function Vu(e,t){let n=this.cache;if(t.x!==void 0)(n[0]!==t.x||n[1]!==t.y)&&(e.uniform2i(this.addr,t.x,t.y),n[0]=t.x,n[1]=t.y);else{if(Au(n,t))return;e.uniform2iv(this.addr,t),ju(n,t)}}function Hu(e,t){let n=this.cache;if(t.x!==void 0)(n[0]!==t.x||n[1]!==t.y||n[2]!==t.z)&&(e.uniform3i(this.addr,t.x,t.y,t.z),n[0]=t.x,n[1]=t.y,n[2]=t.z);else{if(Au(n,t))return;e.uniform3iv(this.addr,t),ju(n,t)}}function Uu(e,t){let n=this.cache;if(t.x!==void 0)(n[0]!==t.x||n[1]!==t.y||n[2]!==t.z||n[3]!==t.w)&&(e.uniform4i(this.addr,t.x,t.y,t.z,t.w),n[0]=t.x,n[1]=t.y,n[2]=t.z,n[3]=t.w);else{if(Au(n,t))return;e.uniform4iv(this.addr,t),ju(n,t)}}function Wu(e,t){let n=this.cache;n[0]!==t&&(e.uniform1ui(this.addr,t),n[0]=t)}function Gu(e,t){let n=this.cache;if(t.x!==void 0)(n[0]!==t.x||n[1]!==t.y)&&(e.uniform2ui(this.addr,t.x,t.y),n[0]=t.x,n[1]=t.y);else{if(Au(n,t))return;e.uniform2uiv(this.addr,t),ju(n,t)}}function Ku(e,t){let n=this.cache;if(t.x!==void 0)(n[0]!==t.x||n[1]!==t.y||n[2]!==t.z)&&(e.uniform3ui(this.addr,t.x,t.y,t.z),n[0]=t.x,n[1]=t.y,n[2]=t.z);else{if(Au(n,t))return;e.uniform3uiv(this.addr,t),ju(n,t)}}function qu(e,t){let n=this.cache;if(t.x!==void 0)(n[0]!==t.x||n[1]!==t.y||n[2]!==t.z||n[3]!==t.w)&&(e.uniform4ui(this.addr,t.x,t.y,t.z,t.w),n[0]=t.x,n[1]=t.y,n[2]=t.z,n[3]=t.w);else{if(Au(n,t))return;e.uniform4uiv(this.addr,t),ju(n,t)}}function Ju(e,t,n){let r=this.cache,i=n.allocateTextureUnit();r[0]!==i&&(e.uniform1i(this.addr,i),r[0]=i);let a;this.type===e.SAMPLER_2D_SHADOW?(bu.compareFunction=515,a=bu):a=yu,n.setTexture2D(t||a,i)}function Yu(e,t,n){let r=this.cache,i=n.allocateTextureUnit();r[0]!==i&&(e.uniform1i(this.addr,i),r[0]=i),n.setTexture3D(t||Su,i)}function Xu(e,t,n){let r=this.cache,i=n.allocateTextureUnit();r[0]!==i&&(e.uniform1i(this.addr,i),r[0]=i),n.setTextureCube(t||Cu,i)}function Zu(e,t,n){let r=this.cache,i=n.allocateTextureUnit();r[0]!==i&&(e.uniform1i(this.addr,i),r[0]=i),n.setTexture2DArray(t||xu,i)}function Qu(e){switch(e){case 5126:return Nu;case 35664:return Pu;case 35665:return Fu;case 35666:return Iu;case 35674:return Lu;case 35675:return Ru;case 35676:return zu;case 5124:case 35670:return Bu;case 35667:case 35671:return Vu;case 35668:case 35672:return Hu;case 35669:case 35673:return Uu;case 5125:return Wu;case 36294:return Gu;case 36295:return Ku;case 36296:return qu;case 35678:case 36198:case 36298:case 36306:case 35682:return Ju;case 35679:case 36299:case 36307:return Yu;case 35680:case 36300:case 36308:case 36293:return Xu;case 36289:case 36303:case 36311:case 36292:return Zu}}function $u(e,t){e.uniform1fv(this.addr,t)}function ed(e,t){let n=ku(t,this.size,2);e.uniform2fv(this.addr,n)}function td(e,t){let n=ku(t,this.size,3);e.uniform3fv(this.addr,n)}function nd(e,t){let n=ku(t,this.size,4);e.uniform4fv(this.addr,n)}function rd(e,t){let n=ku(t,this.size,4);e.uniformMatrix2fv(this.addr,!1,n)}function id(e,t){let n=ku(t,this.size,9);e.uniformMatrix3fv(this.addr,!1,n)}function ad(e,t){let n=ku(t,this.size,16);e.uniformMatrix4fv(this.addr,!1,n)}function od(e,t){e.uniform1iv(this.addr,t)}function sd(e,t){e.uniform2iv(this.addr,t)}function cd(e,t){e.uniform3iv(this.addr,t)}function ld(e,t){e.uniform4iv(this.addr,t)}function ud(e,t){e.uniform1uiv(this.addr,t)}function dd(e,t){e.uniform2uiv(this.addr,t)}function fd(e,t){e.uniform3uiv(this.addr,t)}function pd(e,t){e.uniform4uiv(this.addr,t)}function md(e,t,n){let r=this.cache,i=t.length,a=Mu(n,i);Au(r,a)||(e.uniform1iv(this.addr,a),ju(r,a));for(let e=0;e!==i;++e)n.setTexture2D(t[e]||yu,a[e])}function hd(e,t,n){let r=this.cache,i=t.length,a=Mu(n,i);Au(r,a)||(e.uniform1iv(this.addr,a),ju(r,a));for(let e=0;e!==i;++e)n.setTexture3D(t[e]||Su,a[e])}function gd(e,t,n){let r=this.cache,i=t.length,a=Mu(n,i);Au(r,a)||(e.uniform1iv(this.addr,a),ju(r,a));for(let e=0;e!==i;++e)n.setTextureCube(t[e]||Cu,a[e])}function _d(e,t,n){let r=this.cache,i=t.length,a=Mu(n,i);Au(r,a)||(e.uniform1iv(this.addr,a),ju(r,a));for(let e=0;e!==i;++e)n.setTexture2DArray(t[e]||xu,a[e])}function vd(e){switch(e){case 5126:return $u;case 35664:return ed;case 35665:return td;case 35666:return nd;case 35674:return rd;case 35675:return id;case 35676:return ad;case 5124:case 35670:return od;case 35667:case 35671:return sd;case 35668:case 35672:return cd;case 35669:case 35673:return ld;case 5125:return ud;case 36294:return dd;case 36295:return fd;case 36296:return pd;case 35678:case 36198:case 36298:case 36306:case 35682:return md;case 35679:case 36299:case 36307:return hd;case 35680:case 36300:case 36308:case 36293:return gd;case 36289:case 36303:case 36311:case 36292:return _d}}var yd=class{constructor(e,t,n){this.id=e,this.addr=n,this.cache=[],this.type=t.type,this.setValue=Qu(t.type)}},bd=class{constructor(e,t,n){this.id=e,this.addr=n,this.cache=[],this.type=t.type,this.size=t.size,this.setValue=vd(t.type)}},xd=class{constructor(e){this.id=e,this.seq=[],this.map={}}setValue(e,t,n){let r=this.seq;for(let i=0,a=r.length;i!==a;++i){let a=r[i];a.setValue(e,t[a.id],n)}}},Sd=/(\w+)(\])?(\[|\.)?/g;function Cd(e,t){e.seq.push(t),e.map[t.id]=t}function wd(e,t,n){let r=e.name,i=r.length;for(Sd.lastIndex=0;;){let a=Sd.exec(r),o=Sd.lastIndex,s=a[1],c=a[2]===`]`,l=a[3];if(c&&(s|=0),l===void 0||l===`[`&&o+2===i){Cd(n,l===void 0?new yd(s,e,t):new bd(s,e,t));break}{let e=n.map[s];e===void 0&&(e=new xd(s),Cd(n,e)),n=e}}}var Td=class{constructor(e,t){this.seq=[],this.map={};let n=e.getProgramParameter(t,e.ACTIVE_UNIFORMS);for(let r=0;r<n;++r){let n=e.getActiveUniform(t,r);wd(n,e.getUniformLocation(t,n.name),this)}}setValue(e,t,n,r){let i=this.map[t];i!==void 0&&i.setValue(e,n,r)}setOptional(e,t,n){let r=t[n];r!==void 0&&this.setValue(e,n,r)}static upload(e,t,n,r){for(let i=0,a=t.length;i!==a;++i){let a=t[i],o=n[a.id];o.needsUpdate!==!1&&a.setValue(e,o.value,r)}}static seqWithValue(e,t){let n=[];for(let r=0,i=e.length;r!==i;++r){let i=e[r];i.id in t&&n.push(i)}return n}};function Ed(e,t,n){let r=e.createShader(t);return e.shaderSource(r,n),e.compileShader(r),r}var Dd=37297,Od=0;function kd(e,t){let n=e.split(`
`),r=[],i=Math.max(t-6,0),a=Math.min(t+6,n.length);for(let e=i;e<a;e++){let i=e+1;r.push(`${i===t?`>`:` `} ${i}: ${n[e]}`)}return r.join(`
`)}function Ad(e){let t=W.getPrimaries(W.workingColorSpace),n=W.getPrimaries(e),r;switch(t===n?r=``:t===`p3`&&n===`rec709`?r=`LinearDisplayP3ToLinearSRGB`:t===`rec709`&&n===`p3`&&(r=`LinearSRGBToLinearDisplayP3`),e){case Ya:case Za:return[r,`LinearTransferOETF`];case Ja:case Xa:return[r,`sRGBTransferOETF`];default:return console.warn(`THREE.WebGLProgram: Unsupported color space:`,e),[r,`LinearTransferOETF`]}}function jd(e,t,n){let r=e.getShaderParameter(t,e.COMPILE_STATUS),i=e.getShaderInfoLog(t).trim();if(r&&i===``)return``;let a=/ERROR: 0:(\d+)/.exec(i);if(a){let r=parseInt(a[1]);return n.toUpperCase()+`

`+i+`

`+kd(e.getShaderSource(t),r)}return i}function Md(e,t){let n=Ad(t);return`vec4 ${e}( vec4 value ) { return ${n[0]}( ${n[1]}( value ) ); }`}function Nd(e,t){let n;switch(t){case 1:n=`Linear`;break;case 2:n=`Reinhard`;break;case 3:n=`Cineon`;break;case 4:n=`ACESFilmic`;break;case 6:n=`AgX`;break;case 7:n=`Neutral`;break;case 5:n=`Custom`;break;default:console.warn(`THREE.WebGLProgram: Unsupported toneMapping:`,t),n=`Linear`}return`vec3 `+e+`( vec3 color ) { return `+n+`ToneMapping( color ); }`}var Pd=new G;function Fd(){return W.getLuminanceCoefficients(Pd),[`float luminance( const in vec3 rgb ) {`,`	const vec3 weights = vec3( ${Pd.x.toFixed(4)}, ${Pd.y.toFixed(4)}, ${Pd.z.toFixed(4)} );`,`	return dot( weights, rgb );`,`}`].join(`
`)}function Id(e){return[e.extensionClipCullDistance?`#extension GL_ANGLE_clip_cull_distance : require`:``,e.extensionMultiDraw?`#extension GL_ANGLE_multi_draw : require`:``].filter(zd).join(`
`)}function Ld(e){let t=[];for(let n in e){let r=e[n];r!==!1&&t.push(`#define `+n+` `+r)}return t.join(`
`)}function Rd(e,t){let n={},r=e.getProgramParameter(t,e.ACTIVE_ATTRIBUTES);for(let i=0;i<r;i++){let r=e.getActiveAttrib(t,i),a=r.name,o=1;r.type===e.FLOAT_MAT2&&(o=2),r.type===e.FLOAT_MAT3&&(o=3),r.type===e.FLOAT_MAT4&&(o=4),n[a]={type:r.type,location:e.getAttribLocation(t,a),locationSize:o}}return n}function zd(e){return e!==``}function Bd(e,t){let n=t.numSpotLightShadows+t.numSpotLightMaps-t.numSpotLightShadowsWithMaps;return e.replace(/NUM_DIR_LIGHTS/g,t.numDirLights).replace(/NUM_SPOT_LIGHTS/g,t.numSpotLights).replace(/NUM_SPOT_LIGHT_MAPS/g,t.numSpotLightMaps).replace(/NUM_SPOT_LIGHT_COORDS/g,n).replace(/NUM_RECT_AREA_LIGHTS/g,t.numRectAreaLights).replace(/NUM_POINT_LIGHTS/g,t.numPointLights).replace(/NUM_HEMI_LIGHTS/g,t.numHemiLights).replace(/NUM_DIR_LIGHT_SHADOWS/g,t.numDirLightShadows).replace(/NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS/g,t.numSpotLightShadowsWithMaps).replace(/NUM_SPOT_LIGHT_SHADOWS/g,t.numSpotLightShadows).replace(/NUM_POINT_LIGHT_SHADOWS/g,t.numPointLightShadows)}function Vd(e,t){return e.replace(/NUM_CLIPPING_PLANES/g,t.numClippingPlanes).replace(/UNION_CLIPPING_PLANES/g,t.numClippingPlanes-t.numClipIntersection)}var Hd=/^[ \t]*#include +<([\w\d./]+)>/gm;function Ud(e){return e.replace(Hd,Gd)}var Wd=new Map;function Gd(e,t){let n=J[t];if(n===void 0){let e=Wd.get(t);if(e!==void 0)n=J[e],console.warn(`THREE.WebGLRenderer: Shader chunk "%s" has been deprecated. Use "%s" instead.`,t,e);else throw Error(`Can not resolve #include <`+t+`>`)}return Ud(n)}var Kd=/#pragma unroll_loop_start\s+for\s*\(\s*int\s+i\s*=\s*(\d+)\s*;\s*i\s*<\s*(\d+)\s*;\s*i\s*\+\+\s*\)\s*{([\s\S]+?)}\s+#pragma unroll_loop_end/g;function qd(e){return e.replace(Kd,Jd)}function Jd(e,t,n,r){let i=``;for(let e=parseInt(t);e<parseInt(n);e++)i+=r.replace(/\[\s*i\s*\]/g,`[ `+e+` ]`).replace(/UNROLLED_LOOP_INDEX/g,e);return i}function Yd(e){let t=`precision ${e.precision} float;
	precision ${e.precision} int;
	precision ${e.precision} sampler2D;
	precision ${e.precision} samplerCube;
	precision ${e.precision} sampler3D;
	precision ${e.precision} sampler2DArray;
	precision ${e.precision} sampler2DShadow;
	precision ${e.precision} samplerCubeShadow;
	precision ${e.precision} sampler2DArrayShadow;
	precision ${e.precision} isampler2D;
	precision ${e.precision} isampler3D;
	precision ${e.precision} isamplerCube;
	precision ${e.precision} isampler2DArray;
	precision ${e.precision} usampler2D;
	precision ${e.precision} usampler3D;
	precision ${e.precision} usamplerCube;
	precision ${e.precision} usampler2DArray;
	`;return e.precision===`highp`?t+=`
#define HIGH_PRECISION`:e.precision===`mediump`?t+=`
#define MEDIUM_PRECISION`:e.precision===`lowp`&&(t+=`
#define LOW_PRECISION`),t}function Xd(e){let t=`SHADOWMAP_TYPE_BASIC`;return e.shadowMapType===1?t=`SHADOWMAP_TYPE_PCF`:e.shadowMapType===2?t=`SHADOWMAP_TYPE_PCF_SOFT`:e.shadowMapType===3&&(t=`SHADOWMAP_TYPE_VSM`),t}function Zd(e){let t=`ENVMAP_TYPE_CUBE`;if(e.envMap)switch(e.envMapMode){case 301:case 302:t=`ENVMAP_TYPE_CUBE`;break;case 306:t=`ENVMAP_TYPE_CUBE_UV`}return t}function Qd(e){let t=`ENVMAP_MODE_REFLECTION`;if(e.envMap)switch(e.envMapMode){case 302:t=`ENVMAP_MODE_REFRACTION`}return t}function $d(e){let t=`ENVMAP_BLENDING_NONE`;if(e.envMap)switch(e.combine){case 0:t=`ENVMAP_BLENDING_MULTIPLY`;break;case 1:t=`ENVMAP_BLENDING_MIX`;break;case 2:t=`ENVMAP_BLENDING_ADD`}return t}function ef(e){let t=e.envMapCubeUVHeight;if(t===null)return null;let n=Math.log2(t)-2,r=1/t;return{texelWidth:1/(3*Math.max(2**n,112)),texelHeight:r,maxMip:n}}function tf(e,t,n,r){let i=e.getContext(),a=n.defines,o=n.vertexShader,s=n.fragmentShader,c=Xd(n),l=Zd(n),u=Qd(n),d=$d(n),f=ef(n),p=Id(n),m=Ld(a),h=i.createProgram(),g,_,v=n.glslVersion?`#version `+n.glslVersion+`
`:``;n.isRawShaderMaterial?(g=[`#define SHADER_TYPE `+n.shaderType,`#define SHADER_NAME `+n.shaderName,m].filter(zd).join(`
`),g.length>0&&(g+=`
`),_=[`#define SHADER_TYPE `+n.shaderType,`#define SHADER_NAME `+n.shaderName,m].filter(zd).join(`
`),_.length>0&&(_+=`
`)):(g=[Yd(n),`#define SHADER_TYPE `+n.shaderType,`#define SHADER_NAME `+n.shaderName,m,n.extensionClipCullDistance?`#define USE_CLIP_DISTANCE`:``,n.batching?`#define USE_BATCHING`:``,n.batchingColor?`#define USE_BATCHING_COLOR`:``,n.instancing?`#define USE_INSTANCING`:``,n.instancingColor?`#define USE_INSTANCING_COLOR`:``,n.instancingMorph?`#define USE_INSTANCING_MORPH`:``,n.useFog&&n.fog?`#define USE_FOG`:``,n.useFog&&n.fogExp2?`#define FOG_EXP2`:``,n.map?`#define USE_MAP`:``,n.envMap?`#define USE_ENVMAP`:``,n.envMap?`#define `+u:``,n.lightMap?`#define USE_LIGHTMAP`:``,n.aoMap?`#define USE_AOMAP`:``,n.bumpMap?`#define USE_BUMPMAP`:``,n.normalMap?`#define USE_NORMALMAP`:``,n.normalMapObjectSpace?`#define USE_NORMALMAP_OBJECTSPACE`:``,n.normalMapTangentSpace?`#define USE_NORMALMAP_TANGENTSPACE`:``,n.displacementMap?`#define USE_DISPLACEMENTMAP`:``,n.emissiveMap?`#define USE_EMISSIVEMAP`:``,n.anisotropy?`#define USE_ANISOTROPY`:``,n.anisotropyMap?`#define USE_ANISOTROPYMAP`:``,n.clearcoatMap?`#define USE_CLEARCOATMAP`:``,n.clearcoatRoughnessMap?`#define USE_CLEARCOAT_ROUGHNESSMAP`:``,n.clearcoatNormalMap?`#define USE_CLEARCOAT_NORMALMAP`:``,n.iridescenceMap?`#define USE_IRIDESCENCEMAP`:``,n.iridescenceThicknessMap?`#define USE_IRIDESCENCE_THICKNESSMAP`:``,n.specularMap?`#define USE_SPECULARMAP`:``,n.specularColorMap?`#define USE_SPECULAR_COLORMAP`:``,n.specularIntensityMap?`#define USE_SPECULAR_INTENSITYMAP`:``,n.roughnessMap?`#define USE_ROUGHNESSMAP`:``,n.metalnessMap?`#define USE_METALNESSMAP`:``,n.alphaMap?`#define USE_ALPHAMAP`:``,n.alphaHash?`#define USE_ALPHAHASH`:``,n.transmission?`#define USE_TRANSMISSION`:``,n.transmissionMap?`#define USE_TRANSMISSIONMAP`:``,n.thicknessMap?`#define USE_THICKNESSMAP`:``,n.sheenColorMap?`#define USE_SHEEN_COLORMAP`:``,n.sheenRoughnessMap?`#define USE_SHEEN_ROUGHNESSMAP`:``,n.mapUv?`#define MAP_UV `+n.mapUv:``,n.alphaMapUv?`#define ALPHAMAP_UV `+n.alphaMapUv:``,n.lightMapUv?`#define LIGHTMAP_UV `+n.lightMapUv:``,n.aoMapUv?`#define AOMAP_UV `+n.aoMapUv:``,n.emissiveMapUv?`#define EMISSIVEMAP_UV `+n.emissiveMapUv:``,n.bumpMapUv?`#define BUMPMAP_UV `+n.bumpMapUv:``,n.normalMapUv?`#define NORMALMAP_UV `+n.normalMapUv:``,n.displacementMapUv?`#define DISPLACEMENTMAP_UV `+n.displacementMapUv:``,n.metalnessMapUv?`#define METALNESSMAP_UV `+n.metalnessMapUv:``,n.roughnessMapUv?`#define ROUGHNESSMAP_UV `+n.roughnessMapUv:``,n.anisotropyMapUv?`#define ANISOTROPYMAP_UV `+n.anisotropyMapUv:``,n.clearcoatMapUv?`#define CLEARCOATMAP_UV `+n.clearcoatMapUv:``,n.clearcoatNormalMapUv?`#define CLEARCOAT_NORMALMAP_UV `+n.clearcoatNormalMapUv:``,n.clearcoatRoughnessMapUv?`#define CLEARCOAT_ROUGHNESSMAP_UV `+n.clearcoatRoughnessMapUv:``,n.iridescenceMapUv?`#define IRIDESCENCEMAP_UV `+n.iridescenceMapUv:``,n.iridescenceThicknessMapUv?`#define IRIDESCENCE_THICKNESSMAP_UV `+n.iridescenceThicknessMapUv:``,n.sheenColorMapUv?`#define SHEEN_COLORMAP_UV `+n.sheenColorMapUv:``,n.sheenRoughnessMapUv?`#define SHEEN_ROUGHNESSMAP_UV `+n.sheenRoughnessMapUv:``,n.specularMapUv?`#define SPECULARMAP_UV `+n.specularMapUv:``,n.specularColorMapUv?`#define SPECULAR_COLORMAP_UV `+n.specularColorMapUv:``,n.specularIntensityMapUv?`#define SPECULAR_INTENSITYMAP_UV `+n.specularIntensityMapUv:``,n.transmissionMapUv?`#define TRANSMISSIONMAP_UV `+n.transmissionMapUv:``,n.thicknessMapUv?`#define THICKNESSMAP_UV `+n.thicknessMapUv:``,n.vertexTangents&&n.flatShading===!1?`#define USE_TANGENT`:``,n.vertexColors?`#define USE_COLOR`:``,n.vertexAlphas?`#define USE_COLOR_ALPHA`:``,n.vertexUv1s?`#define USE_UV1`:``,n.vertexUv2s?`#define USE_UV2`:``,n.vertexUv3s?`#define USE_UV3`:``,n.pointsUvs?`#define USE_POINTS_UV`:``,n.flatShading?`#define FLAT_SHADED`:``,n.skinning?`#define USE_SKINNING`:``,n.morphTargets?`#define USE_MORPHTARGETS`:``,n.morphNormals&&n.flatShading===!1?`#define USE_MORPHNORMALS`:``,n.morphColors?`#define USE_MORPHCOLORS`:``,n.morphTargetsCount>0?`#define MORPHTARGETS_TEXTURE_STRIDE `+n.morphTextureStride:``,n.morphTargetsCount>0?`#define MORPHTARGETS_COUNT `+n.morphTargetsCount:``,n.doubleSided?`#define DOUBLE_SIDED`:``,n.flipSided?`#define FLIP_SIDED`:``,n.shadowMapEnabled?`#define USE_SHADOWMAP`:``,n.shadowMapEnabled?`#define `+c:``,n.sizeAttenuation?`#define USE_SIZEATTENUATION`:``,n.numLightProbes>0?`#define USE_LIGHT_PROBES`:``,n.logarithmicDepthBuffer?`#define USE_LOGDEPTHBUF`:``,n.reverseDepthBuffer?`#define USE_REVERSEDEPTHBUF`:``,`uniform mat4 modelMatrix;`,`uniform mat4 modelViewMatrix;`,`uniform mat4 projectionMatrix;`,`uniform mat4 viewMatrix;`,`uniform mat3 normalMatrix;`,`uniform vec3 cameraPosition;`,`uniform bool isOrthographic;`,`#ifdef USE_INSTANCING`,`	attribute mat4 instanceMatrix;`,`#endif`,`#ifdef USE_INSTANCING_COLOR`,`	attribute vec3 instanceColor;`,`#endif`,`#ifdef USE_INSTANCING_MORPH`,`	uniform sampler2D morphTexture;`,`#endif`,`attribute vec3 position;`,`attribute vec3 normal;`,`attribute vec2 uv;`,`#ifdef USE_UV1`,`	attribute vec2 uv1;`,`#endif`,`#ifdef USE_UV2`,`	attribute vec2 uv2;`,`#endif`,`#ifdef USE_UV3`,`	attribute vec2 uv3;`,`#endif`,`#ifdef USE_TANGENT`,`	attribute vec4 tangent;`,`#endif`,`#if defined( USE_COLOR_ALPHA )`,`	attribute vec4 color;`,`#elif defined( USE_COLOR )`,`	attribute vec3 color;`,`#endif`,`#ifdef USE_SKINNING`,`	attribute vec4 skinIndex;`,`	attribute vec4 skinWeight;`,`#endif`,`
`].filter(zd).join(`
`),_=[Yd(n),`#define SHADER_TYPE `+n.shaderType,`#define SHADER_NAME `+n.shaderName,m,n.useFog&&n.fog?`#define USE_FOG`:``,n.useFog&&n.fogExp2?`#define FOG_EXP2`:``,n.alphaToCoverage?`#define ALPHA_TO_COVERAGE`:``,n.map?`#define USE_MAP`:``,n.matcap?`#define USE_MATCAP`:``,n.envMap?`#define USE_ENVMAP`:``,n.envMap?`#define `+l:``,n.envMap?`#define `+u:``,n.envMap?`#define `+d:``,f?`#define CUBEUV_TEXEL_WIDTH `+f.texelWidth:``,f?`#define CUBEUV_TEXEL_HEIGHT `+f.texelHeight:``,f?`#define CUBEUV_MAX_MIP `+f.maxMip+`.0`:``,n.lightMap?`#define USE_LIGHTMAP`:``,n.aoMap?`#define USE_AOMAP`:``,n.bumpMap?`#define USE_BUMPMAP`:``,n.normalMap?`#define USE_NORMALMAP`:``,n.normalMapObjectSpace?`#define USE_NORMALMAP_OBJECTSPACE`:``,n.normalMapTangentSpace?`#define USE_NORMALMAP_TANGENTSPACE`:``,n.emissiveMap?`#define USE_EMISSIVEMAP`:``,n.anisotropy?`#define USE_ANISOTROPY`:``,n.anisotropyMap?`#define USE_ANISOTROPYMAP`:``,n.clearcoat?`#define USE_CLEARCOAT`:``,n.clearcoatMap?`#define USE_CLEARCOATMAP`:``,n.clearcoatRoughnessMap?`#define USE_CLEARCOAT_ROUGHNESSMAP`:``,n.clearcoatNormalMap?`#define USE_CLEARCOAT_NORMALMAP`:``,n.dispersion?`#define USE_DISPERSION`:``,n.iridescence?`#define USE_IRIDESCENCE`:``,n.iridescenceMap?`#define USE_IRIDESCENCEMAP`:``,n.iridescenceThicknessMap?`#define USE_IRIDESCENCE_THICKNESSMAP`:``,n.specularMap?`#define USE_SPECULARMAP`:``,n.specularColorMap?`#define USE_SPECULAR_COLORMAP`:``,n.specularIntensityMap?`#define USE_SPECULAR_INTENSITYMAP`:``,n.roughnessMap?`#define USE_ROUGHNESSMAP`:``,n.metalnessMap?`#define USE_METALNESSMAP`:``,n.alphaMap?`#define USE_ALPHAMAP`:``,n.alphaTest?`#define USE_ALPHATEST`:``,n.alphaHash?`#define USE_ALPHAHASH`:``,n.sheen?`#define USE_SHEEN`:``,n.sheenColorMap?`#define USE_SHEEN_COLORMAP`:``,n.sheenRoughnessMap?`#define USE_SHEEN_ROUGHNESSMAP`:``,n.transmission?`#define USE_TRANSMISSION`:``,n.transmissionMap?`#define USE_TRANSMISSIONMAP`:``,n.thicknessMap?`#define USE_THICKNESSMAP`:``,n.vertexTangents&&n.flatShading===!1?`#define USE_TANGENT`:``,n.vertexColors||n.instancingColor||n.batchingColor?`#define USE_COLOR`:``,n.vertexAlphas?`#define USE_COLOR_ALPHA`:``,n.vertexUv1s?`#define USE_UV1`:``,n.vertexUv2s?`#define USE_UV2`:``,n.vertexUv3s?`#define USE_UV3`:``,n.pointsUvs?`#define USE_POINTS_UV`:``,n.gradientMap?`#define USE_GRADIENTMAP`:``,n.flatShading?`#define FLAT_SHADED`:``,n.doubleSided?`#define DOUBLE_SIDED`:``,n.flipSided?`#define FLIP_SIDED`:``,n.shadowMapEnabled?`#define USE_SHADOWMAP`:``,n.shadowMapEnabled?`#define `+c:``,n.premultipliedAlpha?`#define PREMULTIPLIED_ALPHA`:``,n.numLightProbes>0?`#define USE_LIGHT_PROBES`:``,n.decodeVideoTexture?`#define DECODE_VIDEO_TEXTURE`:``,n.logarithmicDepthBuffer?`#define USE_LOGDEPTHBUF`:``,n.reverseDepthBuffer?`#define USE_REVERSEDEPTHBUF`:``,`uniform mat4 viewMatrix;`,`uniform vec3 cameraPosition;`,`uniform bool isOrthographic;`,n.toneMapping===0?``:`#define TONE_MAPPING`,n.toneMapping===0?``:J.tonemapping_pars_fragment,n.toneMapping===0?``:Nd(`toneMapping`,n.toneMapping),n.dithering?`#define DITHERING`:``,n.opaque?`#define OPAQUE`:``,J.colorspace_pars_fragment,Md(`linearToOutputTexel`,n.outputColorSpace),Fd(),n.useDepthPacking?`#define DEPTH_PACKING `+n.depthPacking:``,`
`].filter(zd).join(`
`)),o=Ud(o),o=Bd(o,n),o=Vd(o,n),s=Ud(s),s=Bd(s,n),s=Vd(s,n),o=qd(o),s=qd(s),n.isRawShaderMaterial!==!0&&(v=`#version 300 es
`,g=[p,`#define attribute in`,`#define varying out`,`#define texture2D texture`].join(`
`)+`
`+g,_=[`#define varying in`,n.glslVersion===`300 es`?``:`layout(location = 0) out highp vec4 pc_fragColor;`,n.glslVersion===`300 es`?``:`#define gl_FragColor pc_fragColor`,`#define gl_FragDepthEXT gl_FragDepth`,`#define texture2D texture`,`#define textureCube texture`,`#define texture2DProj textureProj`,`#define texture2DLodEXT textureLod`,`#define texture2DProjLodEXT textureProjLod`,`#define textureCubeLodEXT textureLod`,`#define texture2DGradEXT textureGrad`,`#define texture2DProjGradEXT textureProjGrad`,`#define textureCubeGradEXT textureGrad`].join(`
`)+`
`+_);let y=v+g+o,b=v+_+s,x=Ed(i,i.VERTEX_SHADER,y),S=Ed(i,i.FRAGMENT_SHADER,b);i.attachShader(h,x),i.attachShader(h,S),n.index0AttributeName===void 0?n.morphTargets===!0&&i.bindAttribLocation(h,0,`position`):i.bindAttribLocation(h,0,n.index0AttributeName),i.linkProgram(h);function C(t){if(e.debug.checkShaderErrors){let n=i.getProgramInfoLog(h).trim(),r=i.getShaderInfoLog(x).trim(),a=i.getShaderInfoLog(S).trim(),o=!0,s=!0;if(i.getProgramParameter(h,i.LINK_STATUS)===!1){if(o=!1,typeof e.debug.onShaderError==`function`)e.debug.onShaderError(i,h,x,S);else{let e=jd(i,x,`vertex`),r=jd(i,S,`fragment`);console.error(`THREE.WebGLProgram: Shader Error `+i.getError()+` - VALIDATE_STATUS `+i.getProgramParameter(h,i.VALIDATE_STATUS)+`

Material Name: `+t.name+`
Material Type: `+t.type+`

Program Info Log: `+n+`
`+e+`
`+r)}}else n===``?(r===``||a===``)&&(s=!1):console.warn(`THREE.WebGLProgram: Program Info Log:`,n);s&&(t.diagnostics={runnable:o,programLog:n,vertexShader:{log:r,prefix:g},fragmentShader:{log:a,prefix:_}})}i.deleteShader(x),i.deleteShader(S),w=new Td(i,h),T=Rd(i,h)}let w;this.getUniforms=function(){return w===void 0&&C(this),w};let T;this.getAttributes=function(){return T===void 0&&C(this),T};let E=n.rendererExtensionParallelShaderCompile===!1;return this.isReady=function(){return E===!1&&(E=i.getProgramParameter(h,Dd)),E},this.destroy=function(){r.releaseStatesOfProgram(this),i.deleteProgram(h),this.program=void 0},this.type=n.shaderType,this.name=n.shaderName,this.id=Od++,this.cacheKey=t,this.usedTimes=1,this.program=h,this.vertexShader=x,this.fragmentShader=S,this}var nf=0,rf=class{constructor(){this.shaderCache=new Map,this.materialCache=new Map}update(e){let t=e.vertexShader,n=e.fragmentShader,r=this._getShaderStage(t),i=this._getShaderStage(n),a=this._getShaderCacheForMaterial(e);return a.has(r)===!1&&(a.add(r),r.usedTimes++),a.has(i)===!1&&(a.add(i),i.usedTimes++),this}remove(e){let t=this.materialCache.get(e);for(let e of t)e.usedTimes--,e.usedTimes===0&&this.shaderCache.delete(e.code);return this.materialCache.delete(e),this}getVertexShaderID(e){return this._getShaderStage(e.vertexShader).id}getFragmentShaderID(e){return this._getShaderStage(e.fragmentShader).id}dispose(){this.shaderCache.clear(),this.materialCache.clear()}_getShaderCacheForMaterial(e){let t=this.materialCache,n=t.get(e);return n===void 0&&(n=new Set,t.set(e,n)),n}_getShaderStage(e){let t=this.shaderCache,n=t.get(e);return n===void 0&&(n=new af(e),t.set(e,n)),n}},af=class{constructor(e){this.id=nf++,this.code=e,this.usedTimes=0}};function of(e,t,n,r,i,a,o){let s=new qs,c=new rf,l=new Set,u=[],d=i.logarithmicDepthBuffer,f=i.reverseDepthBuffer,p=i.vertexTextures,m=i.precision,h={MeshDepthMaterial:`depth`,MeshDistanceMaterial:`distanceRGBA`,MeshNormalMaterial:`normal`,MeshBasicMaterial:`basic`,MeshLambertMaterial:`lambert`,MeshPhongMaterial:`phong`,MeshToonMaterial:`toon`,MeshStandardMaterial:`physical`,MeshPhysicalMaterial:`physical`,MeshMatcapMaterial:`matcap`,LineBasicMaterial:`basic`,LineDashedMaterial:`dashed`,PointsMaterial:`points`,ShadowMaterial:`shadow`,SpriteMaterial:`sprite`};function g(e){return l.add(e),e===0?`uv`:`uv${e}`}function _(a,s,u,_,v){let y=_.fog,b=v.geometry,x=a.isMeshStandardMaterial?_.environment:null,S=(a.isMeshStandardMaterial?n:t).get(a.envMap||x),C=S&&S.mapping===306?S.image.height:null,w=h[a.type];a.precision!==null&&(m=i.getMaxPrecision(a.precision),m!==a.precision&&console.warn(`THREE.WebGLProgram.getParameters:`,a.precision,`not supported, using`,m,`instead.`));let T=b.morphAttributes.position||b.morphAttributes.normal||b.morphAttributes.color,E=T===void 0?0:T.length,D=0;b.morphAttributes.position!==void 0&&(D=1),b.morphAttributes.normal!==void 0&&(D=2),b.morphAttributes.color!==void 0&&(D=3);let O,k,A,j;if(w){let e=Pl[w];O=e.vertexShader,k=e.fragmentShader}else O=a.vertexShader,k=a.fragmentShader,c.update(a),A=c.getVertexShaderID(a),j=c.getFragmentShaderID(a);let M=e.getRenderTarget(),N=v.isInstancedMesh===!0,P=v.isBatchedMesh===!0,ee=!!a.map,te=!!a.matcap,ne=!!S,re=!!a.aoMap,F=!!a.lightMap,ie=!!a.bumpMap,ae=!!a.normalMap,I=!!a.displacementMap,oe=!!a.emissiveMap,se=!!a.metalnessMap,ce=!!a.roughnessMap,le=a.anisotropy>0,ue=a.clearcoat>0,L=a.dispersion>0,de=a.iridescence>0,fe=a.sheen>0,R=a.transmission>0,z=le&&!!a.anisotropyMap,pe=ue&&!!a.clearcoatMap,B=ue&&!!a.clearcoatNormalMap,V=ue&&!!a.clearcoatRoughnessMap,me=de&&!!a.iridescenceMap,he=de&&!!a.iridescenceThicknessMap,ge=fe&&!!a.sheenColorMap,_e=fe&&!!a.sheenRoughnessMap,ve=!!a.specularMap,ye=!!a.specularColorMap,be=!!a.specularIntensityMap,xe=R&&!!a.transmissionMap,Se=R&&!!a.thicknessMap,Ce=!!a.gradientMap,we=!!a.alphaMap,Te=a.alphaTest>0,Ee=!!a.alphaHash,De=!!a.extensions,Oe=0;a.toneMapped&&(M===null||M.isXRRenderTarget===!0)&&(Oe=e.toneMapping);let ke={shaderID:w,shaderType:a.type,shaderName:a.name,vertexShader:O,fragmentShader:k,defines:a.defines,customVertexShaderID:A,customFragmentShaderID:j,isRawShaderMaterial:a.isRawShaderMaterial===!0,glslVersion:a.glslVersion,precision:m,batching:P,batchingColor:P&&v._colorsTexture!==null,instancing:N,instancingColor:N&&v.instanceColor!==null,instancingMorph:N&&v.morphTexture!==null,supportsVertexTextures:p,outputColorSpace:M===null?e.outputColorSpace:M.isXRRenderTarget===!0?M.texture.colorSpace:Ya,alphaToCoverage:!!a.alphaToCoverage,map:ee,matcap:te,envMap:ne,envMapMode:ne&&S.mapping,envMapCubeUVHeight:C,aoMap:re,lightMap:F,bumpMap:ie,normalMap:ae,displacementMap:p&&I,emissiveMap:oe,normalMapObjectSpace:ae&&a.normalMapType===1,normalMapTangentSpace:ae&&a.normalMapType===0,metalnessMap:se,roughnessMap:ce,anisotropy:le,anisotropyMap:z,clearcoat:ue,clearcoatMap:pe,clearcoatNormalMap:B,clearcoatRoughnessMap:V,dispersion:L,iridescence:de,iridescenceMap:me,iridescenceThicknessMap:he,sheen:fe,sheenColorMap:ge,sheenRoughnessMap:_e,specularMap:ve,specularColorMap:ye,specularIntensityMap:be,transmission:R,transmissionMap:xe,thicknessMap:Se,gradientMap:Ce,opaque:a.transparent===!1&&a.blending===1&&a.alphaToCoverage===!1,alphaMap:we,alphaTest:Te,alphaHash:Ee,combine:a.combine,mapUv:ee&&g(a.map.channel),aoMapUv:re&&g(a.aoMap.channel),lightMapUv:F&&g(a.lightMap.channel),bumpMapUv:ie&&g(a.bumpMap.channel),normalMapUv:ae&&g(a.normalMap.channel),displacementMapUv:I&&g(a.displacementMap.channel),emissiveMapUv:oe&&g(a.emissiveMap.channel),metalnessMapUv:se&&g(a.metalnessMap.channel),roughnessMapUv:ce&&g(a.roughnessMap.channel),anisotropyMapUv:z&&g(a.anisotropyMap.channel),clearcoatMapUv:pe&&g(a.clearcoatMap.channel),clearcoatNormalMapUv:B&&g(a.clearcoatNormalMap.channel),clearcoatRoughnessMapUv:V&&g(a.clearcoatRoughnessMap.channel),iridescenceMapUv:me&&g(a.iridescenceMap.channel),iridescenceThicknessMapUv:he&&g(a.iridescenceThicknessMap.channel),sheenColorMapUv:ge&&g(a.sheenColorMap.channel),sheenRoughnessMapUv:_e&&g(a.sheenRoughnessMap.channel),specularMapUv:ve&&g(a.specularMap.channel),specularColorMapUv:ye&&g(a.specularColorMap.channel),specularIntensityMapUv:be&&g(a.specularIntensityMap.channel),transmissionMapUv:xe&&g(a.transmissionMap.channel),thicknessMapUv:Se&&g(a.thicknessMap.channel),alphaMapUv:we&&g(a.alphaMap.channel),vertexTangents:!!b.attributes.tangent&&(ae||le),vertexColors:a.vertexColors,vertexAlphas:a.vertexColors===!0&&!!b.attributes.color&&b.attributes.color.itemSize===4,pointsUvs:v.isPoints===!0&&!!b.attributes.uv&&(ee||we),fog:!!y,useFog:a.fog===!0,fogExp2:!!y&&y.isFogExp2,flatShading:a.flatShading===!0,sizeAttenuation:a.sizeAttenuation===!0,logarithmicDepthBuffer:d,reverseDepthBuffer:f,skinning:v.isSkinnedMesh===!0,morphTargets:b.morphAttributes.position!==void 0,morphNormals:b.morphAttributes.normal!==void 0,morphColors:b.morphAttributes.color!==void 0,morphTargetsCount:E,morphTextureStride:D,numDirLights:s.directional.length,numPointLights:s.point.length,numSpotLights:s.spot.length,numSpotLightMaps:s.spotLightMap.length,numRectAreaLights:s.rectArea.length,numHemiLights:s.hemi.length,numDirLightShadows:s.directionalShadowMap.length,numPointLightShadows:s.pointShadowMap.length,numSpotLightShadows:s.spotShadowMap.length,numSpotLightShadowsWithMaps:s.numSpotLightShadowsWithMaps,numLightProbes:s.numLightProbes,numClippingPlanes:o.numPlanes,numClipIntersection:o.numIntersection,dithering:a.dithering,shadowMapEnabled:e.shadowMap.enabled&&u.length>0,shadowMapType:e.shadowMap.type,toneMapping:Oe,decodeVideoTexture:ee&&a.map.isVideoTexture===!0&&W.getTransfer(a.map.colorSpace)===`srgb`,premultipliedAlpha:a.premultipliedAlpha,doubleSided:a.side===2,flipSided:a.side===1,useDepthPacking:a.depthPacking>=0,depthPacking:a.depthPacking||0,index0AttributeName:a.index0AttributeName,extensionClipCullDistance:De&&a.extensions.clipCullDistance===!0&&r.has(`WEBGL_clip_cull_distance`),extensionMultiDraw:(De&&a.extensions.multiDraw===!0||P)&&r.has(`WEBGL_multi_draw`),rendererExtensionParallelShaderCompile:r.has(`KHR_parallel_shader_compile`),customProgramCacheKey:a.customProgramCacheKey()};return ke.vertexUv1s=l.has(1),ke.vertexUv2s=l.has(2),ke.vertexUv3s=l.has(3),l.clear(),ke}function v(t){let n=[];if(t.shaderID?n.push(t.shaderID):(n.push(t.customVertexShaderID),n.push(t.customFragmentShaderID)),t.defines!==void 0)for(let e in t.defines)n.push(e),n.push(t.defines[e]);return t.isRawShaderMaterial===!1&&(y(n,t),b(n,t),n.push(e.outputColorSpace)),n.push(t.customProgramCacheKey),n.join()}function y(e,t){e.push(t.precision),e.push(t.outputColorSpace),e.push(t.envMapMode),e.push(t.envMapCubeUVHeight),e.push(t.mapUv),e.push(t.alphaMapUv),e.push(t.lightMapUv),e.push(t.aoMapUv),e.push(t.bumpMapUv),e.push(t.normalMapUv),e.push(t.displacementMapUv),e.push(t.emissiveMapUv),e.push(t.metalnessMapUv),e.push(t.roughnessMapUv),e.push(t.anisotropyMapUv),e.push(t.clearcoatMapUv),e.push(t.clearcoatNormalMapUv),e.push(t.clearcoatRoughnessMapUv),e.push(t.iridescenceMapUv),e.push(t.iridescenceThicknessMapUv),e.push(t.sheenColorMapUv),e.push(t.sheenRoughnessMapUv),e.push(t.specularMapUv),e.push(t.specularColorMapUv),e.push(t.specularIntensityMapUv),e.push(t.transmissionMapUv),e.push(t.thicknessMapUv),e.push(t.combine),e.push(t.fogExp2),e.push(t.sizeAttenuation),e.push(t.morphTargetsCount),e.push(t.morphAttributeCount),e.push(t.numDirLights),e.push(t.numPointLights),e.push(t.numSpotLights),e.push(t.numSpotLightMaps),e.push(t.numHemiLights),e.push(t.numRectAreaLights),e.push(t.numDirLightShadows),e.push(t.numPointLightShadows),e.push(t.numSpotLightShadows),e.push(t.numSpotLightShadowsWithMaps),e.push(t.numLightProbes),e.push(t.shadowMapType),e.push(t.toneMapping),e.push(t.numClippingPlanes),e.push(t.numClipIntersection),e.push(t.depthPacking)}function b(e,t){s.disableAll(),t.supportsVertexTextures&&s.enable(0),t.instancing&&s.enable(1),t.instancingColor&&s.enable(2),t.instancingMorph&&s.enable(3),t.matcap&&s.enable(4),t.envMap&&s.enable(5),t.normalMapObjectSpace&&s.enable(6),t.normalMapTangentSpace&&s.enable(7),t.clearcoat&&s.enable(8),t.iridescence&&s.enable(9),t.alphaTest&&s.enable(10),t.vertexColors&&s.enable(11),t.vertexAlphas&&s.enable(12),t.vertexUv1s&&s.enable(13),t.vertexUv2s&&s.enable(14),t.vertexUv3s&&s.enable(15),t.vertexTangents&&s.enable(16),t.anisotropy&&s.enable(17),t.alphaHash&&s.enable(18),t.batching&&s.enable(19),t.dispersion&&s.enable(20),t.batchingColor&&s.enable(21),e.push(s.mask),s.disableAll(),t.fog&&s.enable(0),t.useFog&&s.enable(1),t.flatShading&&s.enable(2),t.logarithmicDepthBuffer&&s.enable(3),t.reverseDepthBuffer&&s.enable(4),t.skinning&&s.enable(5),t.morphTargets&&s.enable(6),t.morphNormals&&s.enable(7),t.morphColors&&s.enable(8),t.premultipliedAlpha&&s.enable(9),t.shadowMapEnabled&&s.enable(10),t.doubleSided&&s.enable(11),t.flipSided&&s.enable(12),t.useDepthPacking&&s.enable(13),t.dithering&&s.enable(14),t.transmission&&s.enable(15),t.sheen&&s.enable(16),t.opaque&&s.enable(17),t.pointsUvs&&s.enable(18),t.decodeVideoTexture&&s.enable(19),t.alphaToCoverage&&s.enable(20),e.push(s.mask)}function x(e){let t=h[e.type],n;if(t){let e=Pl[t];n=ul.clone(e.uniforms)}else n=e.uniforms;return n}function S(t,n){let r;for(let e=0,t=u.length;e<t;e++){let t=u[e];if(t.cacheKey===n){r=t,++r.usedTimes;break}}return r===void 0&&(r=new tf(e,n,t,a),u.push(r)),r}function C(e){if(--e.usedTimes===0){let t=u.indexOf(e);u[t]=u[u.length-1],u.pop(),e.destroy()}}function w(e){c.remove(e)}function T(){c.dispose()}return{getParameters:_,getProgramCacheKey:v,getUniforms:x,acquireProgram:S,releaseProgram:C,releaseShaderCache:w,programs:u,dispose:T}}function sf(){let e=new WeakMap;function t(t){return e.has(t)}function n(t){let n=e.get(t);return n===void 0&&(n={},e.set(t,n)),n}function r(t){e.delete(t)}function i(t,n,r){e.get(t)[n]=r}function a(){e=new WeakMap}return{has:t,get:n,remove:r,update:i,dispose:a}}function cf(e,t){return e.groupOrder===t.groupOrder?e.renderOrder===t.renderOrder?e.material.id===t.material.id?e.z===t.z?e.id-t.id:e.z-t.z:e.material.id-t.material.id:e.renderOrder-t.renderOrder:e.groupOrder-t.groupOrder}function lf(e,t){return e.groupOrder===t.groupOrder?e.renderOrder===t.renderOrder?e.z===t.z?e.id-t.id:t.z-e.z:e.renderOrder-t.renderOrder:e.groupOrder-t.groupOrder}function uf(){let e=[],t=0,n=[],r=[],i=[];function a(){t=0,n.length=0,r.length=0,i.length=0}function o(n,r,i,a,o,s){let c=e[t];return c===void 0?(c={id:n.id,object:n,geometry:r,material:i,groupOrder:a,renderOrder:n.renderOrder,z:o,group:s},e[t]=c):(c.id=n.id,c.object=n,c.geometry=r,c.material=i,c.groupOrder=a,c.renderOrder=n.renderOrder,c.z=o,c.group=s),t++,c}function s(e,t,a,s,c,l){let u=o(e,t,a,s,c,l);a.transmission>0?r.push(u):a.transparent===!0?i.push(u):n.push(u)}function c(e,t,a,s,c,l){let u=o(e,t,a,s,c,l);a.transmission>0?r.unshift(u):a.transparent===!0?i.unshift(u):n.unshift(u)}function l(e,t){n.length>1&&n.sort(e||cf),r.length>1&&r.sort(t||lf),i.length>1&&i.sort(t||lf)}function u(){for(let n=t,r=e.length;n<r;n++){let t=e[n];if(t.id===null)break;t.id=null,t.object=null,t.geometry=null,t.material=null,t.group=null}}return{opaque:n,transmissive:r,transparent:i,init:a,push:s,unshift:c,finish:u,sort:l}}function df(){let e=new WeakMap;function t(t,n){let r=e.get(t),i;return r===void 0?(i=new uf,e.set(t,[i])):n>=r.length?(i=new uf,r.push(i)):i=r[n],i}function n(){e=new WeakMap}return{get:t,dispose:n}}function ff(){let e={};return{get:function(t){if(e[t.id]!==void 0)return e[t.id];let n;switch(t.type){case`DirectionalLight`:n={direction:new G,color:new K};break;case`SpotLight`:n={position:new G,direction:new G,color:new K,distance:0,coneCos:0,penumbraCos:0,decay:0};break;case`PointLight`:n={position:new G,color:new K,distance:0,decay:0};break;case`HemisphereLight`:n={direction:new G,skyColor:new K,groundColor:new K};break;case`RectAreaLight`:n={color:new K,position:new G,halfWidth:new G,halfHeight:new G}}return e[t.id]=n,n}}}function pf(){let e={};return{get:function(t){if(e[t.id]!==void 0)return e[t.id];let n;switch(t.type){case`DirectionalLight`:n={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new H};break;case`SpotLight`:n={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new H};break;case`PointLight`:n={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new H,shadowCameraNear:1,shadowCameraFar:1e3}}return e[t.id]=n,n}}}var mf=0;function hf(e,t){return(t.castShadow?2:0)-(e.castShadow?2:0)+ +!!t.map-!!e.map}function gf(e){let t=new ff,n=pf(),r={version:0,hash:{directionalLength:-1,pointLength:-1,spotLength:-1,rectAreaLength:-1,hemiLength:-1,numDirectionalShadows:-1,numPointShadows:-1,numSpotShadows:-1,numSpotMaps:-1,numLightProbes:-1},ambient:[0,0,0],probe:[],directional:[],directionalShadow:[],directionalShadowMap:[],directionalShadowMatrix:[],spot:[],spotLightMap:[],spotShadow:[],spotShadowMap:[],spotLightMatrix:[],rectArea:[],rectAreaLTC1:null,rectAreaLTC2:null,point:[],pointShadow:[],pointShadowMap:[],pointShadowMatrix:[],hemi:[],numSpotLightShadowsWithMaps:0,numLightProbes:0};for(let e=0;e<9;e++)r.probe.push(new G);let i=new G,a=new Is,o=new Is;function s(i){let a=0,o=0,s=0;for(let e=0;e<9;e++)r.probe[e].set(0,0,0);let c=0,l=0,u=0,d=0,f=0,p=0,m=0,h=0,g=0,_=0,v=0;i.sort(hf);for(let e=0,y=i.length;e<y;e++){let y=i[e],b=y.color,x=y.intensity,S=y.distance,C=y.shadow&&y.shadow.map?y.shadow.map.texture:null;if(y.isAmbientLight)a+=b.r*x,o+=b.g*x,s+=b.b*x;else if(y.isLightProbe){for(let e=0;e<9;e++)r.probe[e].addScaledVector(y.sh.coefficients[e],x);v++}else if(y.isDirectionalLight){let e=t.get(y);if(e.color.copy(y.color).multiplyScalar(y.intensity),y.castShadow){let e=y.shadow,t=n.get(y);t.shadowIntensity=e.intensity,t.shadowBias=e.bias,t.shadowNormalBias=e.normalBias,t.shadowRadius=e.radius,t.shadowMapSize=e.mapSize,r.directionalShadow[c]=t,r.directionalShadowMap[c]=C,r.directionalShadowMatrix[c]=y.shadow.matrix,p++}r.directional[c]=e,c++}else if(y.isSpotLight){let e=t.get(y);e.position.setFromMatrixPosition(y.matrixWorld),e.color.copy(b).multiplyScalar(x),e.distance=S,e.coneCos=Math.cos(y.angle),e.penumbraCos=Math.cos(y.angle*(1-y.penumbra)),e.decay=y.decay,r.spot[u]=e;let i=y.shadow;if(y.map&&(r.spotLightMap[g]=y.map,g++,i.updateMatrices(y),y.castShadow&&_++),r.spotLightMatrix[u]=i.matrix,y.castShadow){let e=n.get(y);e.shadowIntensity=i.intensity,e.shadowBias=i.bias,e.shadowNormalBias=i.normalBias,e.shadowRadius=i.radius,e.shadowMapSize=i.mapSize,r.spotShadow[u]=e,r.spotShadowMap[u]=C,h++}u++}else if(y.isRectAreaLight){let e=t.get(y);e.color.copy(b).multiplyScalar(x),e.halfWidth.set(y.width*.5,0,0),e.halfHeight.set(0,y.height*.5,0),r.rectArea[d]=e,d++}else if(y.isPointLight){let e=t.get(y);if(e.color.copy(y.color).multiplyScalar(y.intensity),e.distance=y.distance,e.decay=y.decay,y.castShadow){let e=y.shadow,t=n.get(y);t.shadowIntensity=e.intensity,t.shadowBias=e.bias,t.shadowNormalBias=e.normalBias,t.shadowRadius=e.radius,t.shadowMapSize=e.mapSize,t.shadowCameraNear=e.camera.near,t.shadowCameraFar=e.camera.far,r.pointShadow[l]=t,r.pointShadowMap[l]=C,r.pointShadowMatrix[l]=y.shadow.matrix,m++}r.point[l]=e,l++}else if(y.isHemisphereLight){let e=t.get(y);e.skyColor.copy(y.color).multiplyScalar(x),e.groundColor.copy(y.groundColor).multiplyScalar(x),r.hemi[f]=e,f++}}d>0&&(e.has(`OES_texture_float_linear`)===!0?(r.rectAreaLTC1=Y.LTC_FLOAT_1,r.rectAreaLTC2=Y.LTC_FLOAT_2):(r.rectAreaLTC1=Y.LTC_HALF_1,r.rectAreaLTC2=Y.LTC_HALF_2)),r.ambient[0]=a,r.ambient[1]=o,r.ambient[2]=s;let y=r.hash;(y.directionalLength!==c||y.pointLength!==l||y.spotLength!==u||y.rectAreaLength!==d||y.hemiLength!==f||y.numDirectionalShadows!==p||y.numPointShadows!==m||y.numSpotShadows!==h||y.numSpotMaps!==g||y.numLightProbes!==v)&&(r.directional.length=c,r.spot.length=u,r.rectArea.length=d,r.point.length=l,r.hemi.length=f,r.directionalShadow.length=p,r.directionalShadowMap.length=p,r.pointShadow.length=m,r.pointShadowMap.length=m,r.spotShadow.length=h,r.spotShadowMap.length=h,r.directionalShadowMatrix.length=p,r.pointShadowMatrix.length=m,r.spotLightMatrix.length=h+g-_,r.spotLightMap.length=g,r.numSpotLightShadowsWithMaps=_,r.numLightProbes=v,y.directionalLength=c,y.pointLength=l,y.spotLength=u,y.rectAreaLength=d,y.hemiLength=f,y.numDirectionalShadows=p,y.numPointShadows=m,y.numSpotShadows=h,y.numSpotMaps=g,y.numLightProbes=v,r.version=mf++)}function c(e,t){let n=0,s=0,c=0,l=0,u=0,d=t.matrixWorldInverse;for(let t=0,f=e.length;t<f;t++){let f=e[t];if(f.isDirectionalLight){let e=r.directional[n];e.direction.setFromMatrixPosition(f.matrixWorld),i.setFromMatrixPosition(f.target.matrixWorld),e.direction.sub(i),e.direction.transformDirection(d),n++}else if(f.isSpotLight){let e=r.spot[c];e.position.setFromMatrixPosition(f.matrixWorld),e.position.applyMatrix4(d),e.direction.setFromMatrixPosition(f.matrixWorld),i.setFromMatrixPosition(f.target.matrixWorld),e.direction.sub(i),e.direction.transformDirection(d),c++}else if(f.isRectAreaLight){let e=r.rectArea[l];e.position.setFromMatrixPosition(f.matrixWorld),e.position.applyMatrix4(d),o.identity(),a.copy(f.matrixWorld),a.premultiply(d),o.extractRotation(a),e.halfWidth.set(f.width*.5,0,0),e.halfHeight.set(0,f.height*.5,0),e.halfWidth.applyMatrix4(o),e.halfHeight.applyMatrix4(o),l++}else if(f.isPointLight){let e=r.point[s];e.position.setFromMatrixPosition(f.matrixWorld),e.position.applyMatrix4(d),s++}else if(f.isHemisphereLight){let e=r.hemi[u];e.direction.setFromMatrixPosition(f.matrixWorld),e.direction.transformDirection(d),u++}}}return{setup:s,setupView:c,state:r}}function _f(e){let t=new gf(e),n=[],r=[];function i(e){l.camera=e,n.length=0,r.length=0}function a(e){n.push(e)}function o(e){r.push(e)}function s(){t.setup(n)}function c(e){t.setupView(n,e)}let l={lightsArray:n,shadowsArray:r,camera:null,lights:t,transmissionRenderTarget:{}};return{init:i,state:l,setupLights:s,setupLightsView:c,pushLight:a,pushShadow:o}}function vf(e){let t=new WeakMap;function n(n,r=0){let i=t.get(n),a;return i===void 0?(a=new _f(e),t.set(n,[a])):r>=i.length?(a=new _f(e),i.push(a)):a=i[r],a}function r(){t=new WeakMap}return{get:n,dispose:r}}var yf=class extends Ac{constructor(e){super(),this.isMeshDepthMaterial=!0,this.type=`MeshDepthMaterial`,this.depthPacking=Ka,this.map=null,this.alphaMap=null,this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.wireframe=!1,this.wireframeLinewidth=1,this.setValues(e)}copy(e){return super.copy(e),this.depthPacking=e.depthPacking,this.map=e.map,this.alphaMap=e.alphaMap,this.displacementMap=e.displacementMap,this.displacementScale=e.displacementScale,this.displacementBias=e.displacementBias,this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this}},bf=class extends Ac{constructor(e){super(),this.isMeshDistanceMaterial=!0,this.type=`MeshDistanceMaterial`,this.map=null,this.alphaMap=null,this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.setValues(e)}copy(e){return super.copy(e),this.map=e.map,this.alphaMap=e.alphaMap,this.displacementMap=e.displacementMap,this.displacementScale=e.displacementScale,this.displacementBias=e.displacementBias,this}},xf=`void main() {
	gl_Position = vec4( position, 1.0 );
}`,Sf=`uniform sampler2D shadow_pass;
uniform vec2 resolution;
uniform float radius;
#include <packing>
void main() {
	const float samples = float( VSM_SAMPLES );
	float mean = 0.0;
	float squared_mean = 0.0;
	float uvStride = samples <= 1.0 ? 0.0 : 2.0 / ( samples - 1.0 );
	float uvStart = samples <= 1.0 ? 0.0 : - 1.0;
	for ( float i = 0.0; i < samples; i ++ ) {
		float uvOffset = uvStart + i * uvStride;
		#ifdef HORIZONTAL_PASS
			vec2 distribution = unpackRGBATo2Half( texture2D( shadow_pass, ( gl_FragCoord.xy + vec2( uvOffset, 0.0 ) * radius ) / resolution ) );
			mean += distribution.x;
			squared_mean += distribution.y * distribution.y + distribution.x * distribution.x;
		#else
			float depth = unpackRGBAToDepth( texture2D( shadow_pass, ( gl_FragCoord.xy + vec2( 0.0, uvOffset ) * radius ) / resolution ) );
			mean += depth;
			squared_mean += depth * depth;
		#endif
	}
	mean = mean / samples;
	squared_mean = squared_mean / samples;
	float std_dev = sqrt( squared_mean - mean * mean );
	gl_FragColor = pack2HalfToRGBA( vec2( mean, std_dev ) );
}`;function Cf(e,t,n){let r=new Al,i=new H,a=new H,o=new ts,s=new yf({depthPacking:qa}),c=new bf,l={},u=n.maxTextureSize,d={0:1,1:0,2:2},f=new pl({defines:{VSM_SAMPLES:8},uniforms:{shadow_pass:{value:null},resolution:{value:new H},radius:{value:4}},vertexShader:xf,fragmentShader:Sf}),p=f.clone();p.defines.HORIZONTAL_PASS=1;let m=new Wc;m.setAttribute(`position`,new Pc(new Float32Array([-1,-1,.5,3,-1,.5,-1,3,.5]),3));let h=new nl(m,f),g=this;this.enabled=!1,this.autoUpdate=!0,this.needsUpdate=!1,this.type=1;let _=this.type;this.render=function(t,n,s){if(g.enabled===!1||g.autoUpdate===!1&&g.needsUpdate===!1||t.length===0)return;let c=e.getRenderTarget(),l=e.getActiveCubeFace(),d=e.getActiveMipmapLevel(),f=e.state;f.setBlending(0),f.buffers.color.setClear(1,1,1,1),f.buffers.depth.setTest(!0),f.setScissorTest(!1);let p=_!==3&&this.type===3,m=_===3&&this.type!==3;for(let c=0,l=t.length;c<l;c++){let l=t[c],d=l.shadow;if(d===void 0){console.warn(`THREE.WebGLShadowMap:`,l,`has no shadow.`);continue}if(d.autoUpdate===!1&&d.needsUpdate===!1)continue;i.copy(d.mapSize);let h=d.getFrameExtents();if(i.multiply(h),a.copy(d.mapSize),(i.x>u||i.y>u)&&(i.x>u&&(a.x=Math.floor(u/h.x),i.x=a.x*h.x,d.mapSize.x=a.x),i.y>u&&(a.y=Math.floor(u/h.y),i.y=a.y*h.y,d.mapSize.y=a.y)),d.map===null||p===!0||m===!0){let e=this.type===3?{}:{minFilter:Mi,magFilter:Mi};d.map!==null&&d.map.dispose(),d.map=new rs(i.x,i.y,e),d.map.texture.name=l.name+`.shadowMap`,d.camera.updateProjectionMatrix()}e.setRenderTarget(d.map),e.clear();let g=d.getViewportCount();for(let e=0;e<g;e++){let t=d.getViewport(e);o.set(a.x*t.x,a.y*t.y,a.x*t.z,a.y*t.w),f.viewport(o),d.updateMatrices(l,e),r=d.getFrustum(),b(n,s,d.camera,l,this.type)}d.isPointLightShadow!==!0&&this.type===3&&v(d,s),d.needsUpdate=!1}_=this.type,g.needsUpdate=!1,e.setRenderTarget(c,l,d)};function v(n,r){let a=t.update(h);f.defines.VSM_SAMPLES!==n.blurSamples&&(f.defines.VSM_SAMPLES=n.blurSamples,p.defines.VSM_SAMPLES=n.blurSamples,f.needsUpdate=!0,p.needsUpdate=!0),n.mapPass===null&&(n.mapPass=new rs(i.x,i.y)),f.uniforms.shadow_pass.value=n.map.texture,f.uniforms.resolution.value=n.mapSize,f.uniforms.radius.value=n.radius,e.setRenderTarget(n.mapPass),e.clear(),e.renderBufferDirect(r,null,a,f,h,null),p.uniforms.shadow_pass.value=n.mapPass.texture,p.uniforms.resolution.value=n.mapSize,p.uniforms.radius.value=n.radius,e.setRenderTarget(n.map),e.clear(),e.renderBufferDirect(r,null,a,p,h,null)}function y(t,n,r,i){let a=null,o=r.isPointLight===!0?t.customDistanceMaterial:t.customDepthMaterial;if(o!==void 0)a=o;else if(a=r.isPointLight===!0?c:s,e.localClippingEnabled&&n.clipShadows===!0&&Array.isArray(n.clippingPlanes)&&n.clippingPlanes.length!==0||n.displacementMap&&n.displacementScale!==0||n.alphaMap&&n.alphaTest>0||n.map&&n.alphaTest>0){let e=a.uuid,t=n.uuid,r=l[e];r===void 0&&(r={},l[e]=r);let i=r[t];i===void 0&&(i=a.clone(),r[t]=i,n.addEventListener(`dispose`,x)),a=i}if(a.visible=n.visible,a.wireframe=n.wireframe,i===3?a.side=n.shadowSide===null?n.side:n.shadowSide:a.side=n.shadowSide===null?d[n.side]:n.shadowSide,a.alphaMap=n.alphaMap,a.alphaTest=n.alphaTest,a.map=n.map,a.clipShadows=n.clipShadows,a.clippingPlanes=n.clippingPlanes,a.clipIntersection=n.clipIntersection,a.displacementMap=n.displacementMap,a.displacementScale=n.displacementScale,a.displacementBias=n.displacementBias,a.wireframeLinewidth=n.wireframeLinewidth,a.linewidth=n.linewidth,r.isPointLight===!0&&a.isMeshDistanceMaterial===!0){let t=e.properties.get(a);t.light=r}return a}function b(n,i,a,o,s){if(n.visible===!1)return;if(n.layers.test(i.layers)&&(n.isMesh||n.isLine||n.isPoints)&&(n.castShadow||n.receiveShadow&&s===3)&&(!n.frustumCulled||r.intersectsObject(n))){n.modelViewMatrix.multiplyMatrices(a.matrixWorldInverse,n.matrixWorld);let r=t.update(n),c=n.material;if(Array.isArray(c)){let t=r.groups;for(let l=0,u=t.length;l<u;l++){let u=t[l],d=c[u.materialIndex];if(d&&d.visible){let t=y(n,d,o,s);n.onBeforeShadow(e,n,i,a,r,t,u),e.renderBufferDirect(a,null,r,t,n,u),n.onAfterShadow(e,n,i,a,r,t,u)}}}else if(c.visible){let t=y(n,c,o,s);n.onBeforeShadow(e,n,i,a,r,t,null),e.renderBufferDirect(a,null,r,t,n,null),n.onAfterShadow(e,n,i,a,r,t,null)}}let c=n.children;for(let e=0,t=c.length;e<t;e++)b(c[e],i,a,o,s)}function x(e){e.target.removeEventListener(`dispose`,x);for(let t in l){let n=l[t],r=e.target.uuid;r in n&&(n[r].dispose(),delete n[r])}}}var wf={0:1,2:6,4:7,3:5,1:0,6:2,7:4,5:3};function Tf(e){function t(){let t=!1,n=new ts,r=null,i=new ts(0,0,0,0);return{setMask:function(n){r!==n&&!t&&(e.colorMask(n,n,n,n),r=n)},setLocked:function(e){t=e},setClear:function(t,r,a,o,s){s===!0&&(t*=o,r*=o,a*=o),n.set(t,r,a,o),i.equals(n)===!1&&(e.clearColor(t,r,a,o),i.copy(n))},reset:function(){t=!1,r=null,i.set(-1,0,0,0)}}}function n(){let t=!1,n=!1,r=null,i=null,a=null;return{setReversed:function(e){n=e},setTest:function(t){t?I(e.DEPTH_TEST):oe(e.DEPTH_TEST)},setMask:function(n){r!==n&&!t&&(e.depthMask(n),r=n)},setFunc:function(t){if(n&&(t=wf[t]),i!==t){switch(t){case 0:e.depthFunc(e.NEVER);break;case 1:e.depthFunc(e.ALWAYS);break;case 2:e.depthFunc(e.LESS);break;case 3:e.depthFunc(e.LEQUAL);break;case 4:e.depthFunc(e.EQUAL);break;case 5:e.depthFunc(e.GEQUAL);break;case 6:e.depthFunc(e.GREATER);break;case 7:e.depthFunc(e.NOTEQUAL);break;default:e.depthFunc(e.LEQUAL)}i=t}},setLocked:function(e){t=e},setClear:function(t){a!==t&&(e.clearDepth(t),a=t)},reset:function(){t=!1,r=null,i=null,a=null}}}function r(){let t=!1,n=null,r=null,i=null,a=null,o=null,s=null,c=null,l=null;return{setTest:function(n){t||(n?I(e.STENCIL_TEST):oe(e.STENCIL_TEST))},setMask:function(r){n!==r&&!t&&(e.stencilMask(r),n=r)},setFunc:function(t,n,o){(r!==t||i!==n||a!==o)&&(e.stencilFunc(t,n,o),r=t,i=n,a=o)},setOp:function(t,n,r){(o!==t||s!==n||c!==r)&&(e.stencilOp(t,n,r),o=t,s=n,c=r)},setLocked:function(e){t=e},setClear:function(t){l!==t&&(e.clearStencil(t),l=t)},reset:function(){t=!1,n=null,r=null,i=null,a=null,o=null,s=null,c=null,l=null}}}let i=new t,a=new n,o=new r,s=new WeakMap,c=new WeakMap,l={},u={},d=new WeakMap,f=[],p=null,m=!1,h=null,g=null,_=null,v=null,y=null,b=null,x=null,S=new K(0,0,0),C=0,w=!1,T=null,E=null,D=null,O=null,k=null,A=e.getParameter(e.MAX_COMBINED_TEXTURE_IMAGE_UNITS),j=!1,M=0,N=e.getParameter(e.VERSION);N.indexOf(`WebGL`)===-1?N.indexOf(`OpenGL ES`)!==-1&&(M=parseFloat(/^OpenGL ES (\d)/.exec(N)[1]),j=M>=2):(M=parseFloat(/^WebGL (\d)/.exec(N)[1]),j=M>=1);let P=null,ee={},te=e.getParameter(e.SCISSOR_BOX),ne=e.getParameter(e.VIEWPORT),re=new ts().fromArray(te),F=new ts().fromArray(ne);function ie(t,n,r,i){let a=new Uint8Array(4),o=e.createTexture();e.bindTexture(t,o),e.texParameteri(t,e.TEXTURE_MIN_FILTER,e.NEAREST),e.texParameteri(t,e.TEXTURE_MAG_FILTER,e.NEAREST);for(let o=0;o<r;o++)t===e.TEXTURE_3D||t===e.TEXTURE_2D_ARRAY?e.texImage3D(n,0,e.RGBA,1,1,i,0,e.RGBA,e.UNSIGNED_BYTE,a):e.texImage2D(n+o,0,e.RGBA,1,1,0,e.RGBA,e.UNSIGNED_BYTE,a);return o}let ae={};ae[e.TEXTURE_2D]=ie(e.TEXTURE_2D,e.TEXTURE_2D,1),ae[e.TEXTURE_CUBE_MAP]=ie(e.TEXTURE_CUBE_MAP,e.TEXTURE_CUBE_MAP_POSITIVE_X,6),ae[e.TEXTURE_2D_ARRAY]=ie(e.TEXTURE_2D_ARRAY,e.TEXTURE_2D_ARRAY,1,1),ae[e.TEXTURE_3D]=ie(e.TEXTURE_3D,e.TEXTURE_3D,1,1),i.setClear(0,0,0,1),a.setClear(1),o.setClear(0),I(e.DEPTH_TEST),a.setFunc(3),R(!1),z(1),I(e.CULL_FACE),de(0);function I(t){l[t]!==!0&&(e.enable(t),l[t]=!0)}function oe(t){l[t]!==!1&&(e.disable(t),l[t]=!1)}function se(t,n){return u[t]!==n&&(e.bindFramebuffer(t,n),u[t]=n,t===e.DRAW_FRAMEBUFFER&&(u[e.FRAMEBUFFER]=n),t===e.FRAMEBUFFER&&(u[e.DRAW_FRAMEBUFFER]=n),!0)}function ce(t,n){let r=f,i=!1;if(t){r=d.get(n),r===void 0&&(r=[],d.set(n,r));let a=t.textures;if(r.length!==a.length||r[0]!==e.COLOR_ATTACHMENT0){for(let t=0,n=a.length;t<n;t++)r[t]=e.COLOR_ATTACHMENT0+t;r.length=a.length,i=!0}}else r[0]!==e.BACK&&(r[0]=e.BACK,i=!0);i&&e.drawBuffers(r)}function le(t){return p!==t&&(e.useProgram(t),p=t,!0)}let ue={100:e.FUNC_ADD,101:e.FUNC_SUBTRACT,102:e.FUNC_REVERSE_SUBTRACT};ue[103]=e.MIN,ue[104]=e.MAX;let L={200:e.ZERO,201:e.ONE,202:e.SRC_COLOR,204:e.SRC_ALPHA,210:e.SRC_ALPHA_SATURATE,208:e.DST_COLOR,206:e.DST_ALPHA,203:e.ONE_MINUS_SRC_COLOR,205:e.ONE_MINUS_SRC_ALPHA,209:e.ONE_MINUS_DST_COLOR,207:e.ONE_MINUS_DST_ALPHA,211:e.CONSTANT_COLOR,212:e.ONE_MINUS_CONSTANT_COLOR,213:e.CONSTANT_ALPHA,214:e.ONE_MINUS_CONSTANT_ALPHA};function de(t,n,r,i,a,o,s,c,l,u){if(t===0)m===!0&&(oe(e.BLEND),m=!1);else if(m===!1&&(I(e.BLEND),m=!0),t!==5){if(t!==h||u!==w){if((g!==100||y!==100)&&(e.blendEquation(e.FUNC_ADD),g=100,y=100),u)switch(t){case 1:e.blendFuncSeparate(e.ONE,e.ONE_MINUS_SRC_ALPHA,e.ONE,e.ONE_MINUS_SRC_ALPHA);break;case 2:e.blendFunc(e.ONE,e.ONE);break;case 3:e.blendFuncSeparate(e.ZERO,e.ONE_MINUS_SRC_COLOR,e.ZERO,e.ONE);break;case 4:e.blendFuncSeparate(e.ZERO,e.SRC_COLOR,e.ZERO,e.SRC_ALPHA);break;default:console.error(`THREE.WebGLState: Invalid blending: `,t)}else switch(t){case 1:e.blendFuncSeparate(e.SRC_ALPHA,e.ONE_MINUS_SRC_ALPHA,e.ONE,e.ONE_MINUS_SRC_ALPHA);break;case 2:e.blendFunc(e.SRC_ALPHA,e.ONE);break;case 3:e.blendFuncSeparate(e.ZERO,e.ONE_MINUS_SRC_COLOR,e.ZERO,e.ONE);break;case 4:e.blendFunc(e.ZERO,e.SRC_COLOR);break;default:console.error(`THREE.WebGLState: Invalid blending: `,t)}_=null,v=null,b=null,x=null,S.set(0,0,0),C=0,h=t,w=u}}else a||=n,o||=r,s||=i,(n!==g||a!==y)&&(e.blendEquationSeparate(ue[n],ue[a]),g=n,y=a),(r!==_||i!==v||o!==b||s!==x)&&(e.blendFuncSeparate(L[r],L[i],L[o],L[s]),_=r,v=i,b=o,x=s),(c.equals(S)===!1||l!==C)&&(e.blendColor(c.r,c.g,c.b,l),S.copy(c),C=l),h=t,w=!1}function fe(t,n){t.side===2?oe(e.CULL_FACE):I(e.CULL_FACE);let r=t.side===1;n&&(r=!r),R(r),t.blending===1&&t.transparent===!1?de(0):de(t.blending,t.blendEquation,t.blendSrc,t.blendDst,t.blendEquationAlpha,t.blendSrcAlpha,t.blendDstAlpha,t.blendColor,t.blendAlpha,t.premultipliedAlpha),a.setFunc(t.depthFunc),a.setTest(t.depthTest),a.setMask(t.depthWrite),i.setMask(t.colorWrite);let s=t.stencilWrite;o.setTest(s),s&&(o.setMask(t.stencilWriteMask),o.setFunc(t.stencilFunc,t.stencilRef,t.stencilFuncMask),o.setOp(t.stencilFail,t.stencilZFail,t.stencilZPass)),B(t.polygonOffset,t.polygonOffsetFactor,t.polygonOffsetUnits),t.alphaToCoverage===!0?I(e.SAMPLE_ALPHA_TO_COVERAGE):oe(e.SAMPLE_ALPHA_TO_COVERAGE)}function R(t){T!==t&&(t?e.frontFace(e.CW):e.frontFace(e.CCW),T=t)}function z(t){t===0?oe(e.CULL_FACE):(I(e.CULL_FACE),t!==E&&(t===1?e.cullFace(e.BACK):t===2?e.cullFace(e.FRONT):e.cullFace(e.FRONT_AND_BACK))),E=t}function pe(t){t!==D&&(j&&e.lineWidth(t),D=t)}function B(t,n,r){t?(I(e.POLYGON_OFFSET_FILL),(O!==n||k!==r)&&(e.polygonOffset(n,r),O=n,k=r)):oe(e.POLYGON_OFFSET_FILL)}function V(t){t?I(e.SCISSOR_TEST):oe(e.SCISSOR_TEST)}function me(t){t===void 0&&(t=e.TEXTURE0+A-1),P!==t&&(e.activeTexture(t),P=t)}function he(t,n,r){r===void 0&&(r=P===null?e.TEXTURE0+A-1:P);let i=ee[r];i===void 0&&(i={type:void 0,texture:void 0},ee[r]=i),(i.type!==t||i.texture!==n)&&(P!==r&&(e.activeTexture(r),P=r),e.bindTexture(t,n||ae[t]),i.type=t,i.texture=n)}function ge(){let t=ee[P];t!==void 0&&t.type!==void 0&&(e.bindTexture(t.type,null),t.type=void 0,t.texture=void 0)}function _e(){try{e.compressedTexImage2D.apply(e,arguments)}catch(e){console.error(`THREE.WebGLState:`,e)}}function ve(){try{e.compressedTexImage3D.apply(e,arguments)}catch(e){console.error(`THREE.WebGLState:`,e)}}function ye(){try{e.texSubImage2D.apply(e,arguments)}catch(e){console.error(`THREE.WebGLState:`,e)}}function be(){try{e.texSubImage3D.apply(e,arguments)}catch(e){console.error(`THREE.WebGLState:`,e)}}function xe(){try{e.compressedTexSubImage2D.apply(e,arguments)}catch(e){console.error(`THREE.WebGLState:`,e)}}function Se(){try{e.compressedTexSubImage3D.apply(e,arguments)}catch(e){console.error(`THREE.WebGLState:`,e)}}function Ce(){try{e.texStorage2D.apply(e,arguments)}catch(e){console.error(`THREE.WebGLState:`,e)}}function we(){try{e.texStorage3D.apply(e,arguments)}catch(e){console.error(`THREE.WebGLState:`,e)}}function Te(){try{e.texImage2D.apply(e,arguments)}catch(e){console.error(`THREE.WebGLState:`,e)}}function Ee(){try{e.texImage3D.apply(e,arguments)}catch(e){console.error(`THREE.WebGLState:`,e)}}function De(t){re.equals(t)===!1&&(e.scissor(t.x,t.y,t.z,t.w),re.copy(t))}function Oe(t){F.equals(t)===!1&&(e.viewport(t.x,t.y,t.z,t.w),F.copy(t))}function ke(t,n){let r=c.get(n);r===void 0&&(r=new WeakMap,c.set(n,r));let i=r.get(t);i===void 0&&(i=e.getUniformBlockIndex(n,t.name),r.set(t,i))}function Ae(t,n){let r=c.get(n).get(t);s.get(n)!==r&&(e.uniformBlockBinding(n,r,t.__bindingPointIndex),s.set(n,r))}function je(){e.disable(e.BLEND),e.disable(e.CULL_FACE),e.disable(e.DEPTH_TEST),e.disable(e.POLYGON_OFFSET_FILL),e.disable(e.SCISSOR_TEST),e.disable(e.STENCIL_TEST),e.disable(e.SAMPLE_ALPHA_TO_COVERAGE),e.blendEquation(e.FUNC_ADD),e.blendFunc(e.ONE,e.ZERO),e.blendFuncSeparate(e.ONE,e.ZERO,e.ONE,e.ZERO),e.blendColor(0,0,0,0),e.colorMask(!0,!0,!0,!0),e.clearColor(0,0,0,0),e.depthMask(!0),e.depthFunc(e.LESS),e.clearDepth(1),e.stencilMask(4294967295),e.stencilFunc(e.ALWAYS,0,4294967295),e.stencilOp(e.KEEP,e.KEEP,e.KEEP),e.clearStencil(0),e.cullFace(e.BACK),e.frontFace(e.CCW),e.polygonOffset(0,0),e.activeTexture(e.TEXTURE0),e.bindFramebuffer(e.FRAMEBUFFER,null),e.bindFramebuffer(e.DRAW_FRAMEBUFFER,null),e.bindFramebuffer(e.READ_FRAMEBUFFER,null),e.useProgram(null),e.lineWidth(1),e.scissor(0,0,e.canvas.width,e.canvas.height),e.viewport(0,0,e.canvas.width,e.canvas.height),l={},P=null,ee={},u={},d=new WeakMap,f=[],p=null,m=!1,h=null,g=null,_=null,v=null,y=null,b=null,x=null,S=new K(0,0,0),C=0,w=!1,T=null,E=null,D=null,O=null,k=null,re.set(0,0,e.canvas.width,e.canvas.height),F.set(0,0,e.canvas.width,e.canvas.height),i.reset(),a.reset(),o.reset()}return{buffers:{color:i,depth:a,stencil:o},enable:I,disable:oe,bindFramebuffer:se,drawBuffers:ce,useProgram:le,setBlending:de,setMaterial:fe,setFlipSided:R,setCullFace:z,setLineWidth:pe,setPolygonOffset:B,setScissorTest:V,activeTexture:me,bindTexture:he,unbindTexture:ge,compressedTexImage2D:_e,compressedTexImage3D:ve,texImage2D:Te,texImage3D:Ee,updateUBOMapping:ke,uniformBlockBinding:Ae,texStorage2D:Ce,texStorage3D:we,texSubImage2D:ye,texSubImage3D:be,compressedTexSubImage2D:xe,compressedTexSubImage3D:Se,scissor:De,viewport:Oe,reset:je}}function Ef(e,t,n,r){let i=Df(r);switch(n){case Xi:return e*t;case $i:return e*t;case ea:return e*t*2;case ra:return e*t/i.components*i.byteLength;case ia:return e*t/i.components*i.byteLength;case aa:return e*t*2/i.components*i.byteLength;case oa:return e*t*2/i.components*i.byteLength;case Zi:return e*t*3/i.components*i.byteLength;case Qi:return e*t*4/i.components*i.byteLength;case sa:return e*t*4/i.components*i.byteLength;case ca:case la:return Math.floor((e+3)/4)*Math.floor((t+3)/4)*8;case ua:case da:return Math.floor((e+3)/4)*Math.floor((t+3)/4)*16;case pa:case ha:return Math.max(e,16)*Math.max(t,8)/4;case fa:case ma:return Math.max(e,8)*Math.max(t,8)/2;case ga:case _a:return Math.floor((e+3)/4)*Math.floor((t+3)/4)*8;case va:return Math.floor((e+3)/4)*Math.floor((t+3)/4)*16;case ya:return Math.floor((e+3)/4)*Math.floor((t+3)/4)*16;case ba:return Math.floor((e+4)/5)*Math.floor((t+3)/4)*16;case xa:return Math.floor((e+4)/5)*Math.floor((t+4)/5)*16;case Sa:return Math.floor((e+5)/6)*Math.floor((t+4)/5)*16;case Ca:return Math.floor((e+5)/6)*Math.floor((t+5)/6)*16;case wa:return Math.floor((e+7)/8)*Math.floor((t+4)/5)*16;case Ta:return Math.floor((e+7)/8)*Math.floor((t+5)/6)*16;case Ea:return Math.floor((e+7)/8)*Math.floor((t+7)/8)*16;case Da:return Math.floor((e+9)/10)*Math.floor((t+4)/5)*16;case Oa:return Math.floor((e+9)/10)*Math.floor((t+5)/6)*16;case ka:return Math.floor((e+9)/10)*Math.floor((t+7)/8)*16;case Aa:return Math.floor((e+9)/10)*Math.floor((t+9)/10)*16;case ja:return Math.floor((e+11)/12)*Math.floor((t+9)/10)*16;case Ma:return Math.floor((e+11)/12)*Math.floor((t+11)/12)*16;case Na:case Pa:case Fa:return Math.ceil(e/4)*Math.ceil(t/4)*16;case Ia:case La:return Math.ceil(e/4)*Math.ceil(t/4)*8;case Ra:case za:return Math.ceil(e/4)*Math.ceil(t/4)*16}throw Error(`Unable to determine texture byte length for ${n} format.`)}function Df(e){switch(e){case Ri:case zi:return{byteLength:1,components:1};case Vi:case Bi:case Gi:return{byteLength:2,components:1};case Ki:case qi:return{byteLength:2,components:4};case Ui:case Hi:case Wi:return{byteLength:4,components:1};case Yi:return{byteLength:4,components:3}}throw Error(`Unknown texture type ${e}.`)}function Of(e,t,n,r,i,a,o){let s=t.has(`WEBGL_multisampled_render_to_texture`)?t.get(`WEBGL_multisampled_render_to_texture`):null,c=typeof navigator>`u`?!1:/OculusBrowser/g.test(navigator.userAgent),l=new H,u=new WeakMap,d,f=new WeakMap,p=!1;try{p=typeof OffscreenCanvas<`u`&&new OffscreenCanvas(1,1).getContext(`2d`)!==null}catch{}function m(e,t){return p?new OffscreenCanvas(e,t):Fo(`canvas`)}function h(e,t,n){let r=1,i=V(e);if((i.width>n||i.height>n)&&(r=n/Math.max(i.width,i.height)),r<1){if(typeof HTMLImageElement<`u`&&e instanceof HTMLImageElement||typeof HTMLCanvasElement<`u`&&e instanceof HTMLCanvasElement||typeof ImageBitmap<`u`&&e instanceof ImageBitmap||typeof VideoFrame<`u`&&e instanceof VideoFrame){let n=Math.floor(r*i.width),a=Math.floor(r*i.height);d===void 0&&(d=m(n,a));let o=t?m(n,a):d;return o.width=n,o.height=a,o.getContext(`2d`).drawImage(e,0,0,n,a),console.warn(`THREE.WebGLRenderer: Texture has been resized from (`+i.width+`x`+i.height+`) to (`+n+`x`+a+`).`),o}return`data`in e&&console.warn(`THREE.WebGLRenderer: Image in DataTexture is too big (`+i.width+`x`+i.height+`).`),e}return e}function g(e){return e.generateMipmaps&&e.minFilter!==1003&&e.minFilter!==1006}function _(t){e.generateMipmap(t)}function v(n,r,i,a,o=!1){if(n!==null){if(e[n]!==void 0)return e[n];console.warn(`THREE.WebGLRenderer: Attempt to use non-existing WebGL internal format '`+n+`'`)}let s=r;if(r===e.RED&&(i===e.FLOAT&&(s=e.R32F),i===e.HALF_FLOAT&&(s=e.R16F),i===e.UNSIGNED_BYTE&&(s=e.R8)),r===e.RED_INTEGER&&(i===e.UNSIGNED_BYTE&&(s=e.R8UI),i===e.UNSIGNED_SHORT&&(s=e.R16UI),i===e.UNSIGNED_INT&&(s=e.R32UI),i===e.BYTE&&(s=e.R8I),i===e.SHORT&&(s=e.R16I),i===e.INT&&(s=e.R32I)),r===e.RG&&(i===e.FLOAT&&(s=e.RG32F),i===e.HALF_FLOAT&&(s=e.RG16F),i===e.UNSIGNED_BYTE&&(s=e.RG8)),r===e.RG_INTEGER&&(i===e.UNSIGNED_BYTE&&(s=e.RG8UI),i===e.UNSIGNED_SHORT&&(s=e.RG16UI),i===e.UNSIGNED_INT&&(s=e.RG32UI),i===e.BYTE&&(s=e.RG8I),i===e.SHORT&&(s=e.RG16I),i===e.INT&&(s=e.RG32I)),r===e.RGB_INTEGER&&(i===e.UNSIGNED_BYTE&&(s=e.RGB8UI),i===e.UNSIGNED_SHORT&&(s=e.RGB16UI),i===e.UNSIGNED_INT&&(s=e.RGB32UI),i===e.BYTE&&(s=e.RGB8I),i===e.SHORT&&(s=e.RGB16I),i===e.INT&&(s=e.RGB32I)),r===e.RGBA_INTEGER&&(i===e.UNSIGNED_BYTE&&(s=e.RGBA8UI),i===e.UNSIGNED_SHORT&&(s=e.RGBA16UI),i===e.UNSIGNED_INT&&(s=e.RGBA32UI),i===e.BYTE&&(s=e.RGBA8I),i===e.SHORT&&(s=e.RGBA16I),i===e.INT&&(s=e.RGBA32I)),r===e.RGB&&i===e.UNSIGNED_INT_5_9_9_9_REV&&(s=e.RGB9_E5),r===e.RGBA){let t=o?Qa:W.getTransfer(a);i===e.FLOAT&&(s=e.RGBA32F),i===e.HALF_FLOAT&&(s=e.RGBA16F),i===e.UNSIGNED_BYTE&&(s=t===`srgb`?e.SRGB8_ALPHA8:e.RGBA8),i===e.UNSIGNED_SHORT_4_4_4_4&&(s=e.RGBA4),i===e.UNSIGNED_SHORT_5_5_5_1&&(s=e.RGB5_A1)}return(s===e.R16F||s===e.R32F||s===e.RG16F||s===e.RG32F||s===e.RGBA16F||s===e.RGBA32F)&&t.get(`EXT_color_buffer_float`),s}function y(t,n){let r;return t?n===null||n===1014||n===1020?r=e.DEPTH24_STENCIL8:n===1015?r=e.DEPTH32F_STENCIL8:n===1012&&(r=e.DEPTH24_STENCIL8,console.warn(`DepthTexture: 16 bit depth attachment is not supported with stencil. Using 24-bit attachment.`)):n===null||n===1014||n===1020?r=e.DEPTH_COMPONENT24:n===1015?r=e.DEPTH_COMPONENT32F:n===1012&&(r=e.DEPTH_COMPONENT16),r}function b(e,t){return g(e)===!0||e.isFramebufferTexture&&e.minFilter!==1003&&e.minFilter!==1006?Math.log2(Math.max(t.width,t.height))+1:e.mipmaps!==void 0&&e.mipmaps.length>0?e.mipmaps.length:e.isCompressedTexture&&Array.isArray(e.image)?t.mipmaps.length:1}function x(e){let t=e.target;t.removeEventListener(`dispose`,x),C(t),t.isVideoTexture&&u.delete(t)}function S(e){let t=e.target;t.removeEventListener(`dispose`,S),T(t)}function C(e){let t=r.get(e);if(t.__webglInit===void 0)return;let n=e.source,i=f.get(n);if(i){let r=i[t.__cacheKey];r.usedTimes--,r.usedTimes===0&&w(e),Object.keys(i).length===0&&f.delete(n)}r.remove(e)}function w(t){let n=r.get(t);e.deleteTexture(n.__webglTexture);let i=t.source,a=f.get(i);delete a[n.__cacheKey],o.memory.textures--}function T(t){let n=r.get(t);if(t.depthTexture&&t.depthTexture.dispose(),t.isWebGLCubeRenderTarget)for(let t=0;t<6;t++){if(Array.isArray(n.__webglFramebuffer[t]))for(let r=0;r<n.__webglFramebuffer[t].length;r++)e.deleteFramebuffer(n.__webglFramebuffer[t][r]);else e.deleteFramebuffer(n.__webglFramebuffer[t]);n.__webglDepthbuffer&&e.deleteRenderbuffer(n.__webglDepthbuffer[t])}else{if(Array.isArray(n.__webglFramebuffer))for(let t=0;t<n.__webglFramebuffer.length;t++)e.deleteFramebuffer(n.__webglFramebuffer[t]);else e.deleteFramebuffer(n.__webglFramebuffer);if(n.__webglDepthbuffer&&e.deleteRenderbuffer(n.__webglDepthbuffer),n.__webglMultisampledFramebuffer&&e.deleteFramebuffer(n.__webglMultisampledFramebuffer),n.__webglColorRenderbuffer)for(let t=0;t<n.__webglColorRenderbuffer.length;t++)n.__webglColorRenderbuffer[t]&&e.deleteRenderbuffer(n.__webglColorRenderbuffer[t]);n.__webglDepthRenderbuffer&&e.deleteRenderbuffer(n.__webglDepthRenderbuffer)}let i=t.textures;for(let t=0,n=i.length;t<n;t++){let n=r.get(i[t]);n.__webglTexture&&(e.deleteTexture(n.__webglTexture),o.memory.textures--),r.remove(i[t])}r.remove(t)}let E=0;function D(){E=0}function O(){let e=E;return e>=i.maxTextures&&console.warn(`THREE.WebGLTextures: Trying to use `+e+` texture units while this GPU supports only `+i.maxTextures),E+=1,e}function k(e){let t=[];return t.push(e.wrapS),t.push(e.wrapT),t.push(e.wrapR||0),t.push(e.magFilter),t.push(e.minFilter),t.push(e.anisotropy),t.push(e.internalFormat),t.push(e.format),t.push(e.type),t.push(e.generateMipmaps),t.push(e.premultiplyAlpha),t.push(e.flipY),t.push(e.unpackAlignment),t.push(e.colorSpace),t.join()}function A(t,i){let a=r.get(t);if(t.isVideoTexture&&pe(t),t.isRenderTargetTexture===!1&&t.version>0&&a.__version!==t.version){let e=t.image;if(e===null)console.warn(`THREE.WebGLRenderer: Texture marked for update but no image data found.`);else if(e.complete===!1)console.warn(`THREE.WebGLRenderer: Texture marked for update but image is incomplete`);else{F(a,t,i);return}}n.bindTexture(e.TEXTURE_2D,a.__webglTexture,e.TEXTURE0+i)}function j(t,i){let a=r.get(t);t.version>0&&a.__version!==t.version?F(a,t,i):n.bindTexture(e.TEXTURE_2D_ARRAY,a.__webglTexture,e.TEXTURE0+i)}function M(t,i){let a=r.get(t);t.version>0&&a.__version!==t.version?F(a,t,i):n.bindTexture(e.TEXTURE_3D,a.__webglTexture,e.TEXTURE0+i)}function N(t,i){let a=r.get(t);t.version>0&&a.__version!==t.version?ie(a,t,i):n.bindTexture(e.TEXTURE_CUBE_MAP,a.__webglTexture,e.TEXTURE0+i)}let P={[ki]:e.REPEAT,[Ai]:e.CLAMP_TO_EDGE,[ji]:e.MIRRORED_REPEAT},ee={[Mi]:e.NEAREST,[Ni]:e.NEAREST_MIPMAP_NEAREST,[Pi]:e.NEAREST_MIPMAP_LINEAR,[Fi]:e.LINEAR,[Ii]:e.LINEAR_MIPMAP_NEAREST,[Li]:e.LINEAR_MIPMAP_LINEAR},te={512:e.NEVER,519:e.ALWAYS,513:e.LESS,515:e.LEQUAL,514:e.EQUAL,518:e.GEQUAL,516:e.GREATER,517:e.NOTEQUAL};function ne(n,a){if(a.type===1015&&t.has(`OES_texture_float_linear`)===!1&&(a.magFilter===1006||a.magFilter===1007||a.magFilter===1005||a.magFilter===1008||a.minFilter===1006||a.minFilter===1007||a.minFilter===1005||a.minFilter===1008)&&console.warn(`THREE.WebGLRenderer: Unable to use linear filtering with floating point textures. OES_texture_float_linear not supported on this device.`),e.texParameteri(n,e.TEXTURE_WRAP_S,P[a.wrapS]),e.texParameteri(n,e.TEXTURE_WRAP_T,P[a.wrapT]),(n===e.TEXTURE_3D||n===e.TEXTURE_2D_ARRAY)&&e.texParameteri(n,e.TEXTURE_WRAP_R,P[a.wrapR]),e.texParameteri(n,e.TEXTURE_MAG_FILTER,ee[a.magFilter]),e.texParameteri(n,e.TEXTURE_MIN_FILTER,ee[a.minFilter]),a.compareFunction&&(e.texParameteri(n,e.TEXTURE_COMPARE_MODE,e.COMPARE_REF_TO_TEXTURE),e.texParameteri(n,e.TEXTURE_COMPARE_FUNC,te[a.compareFunction])),t.has(`EXT_texture_filter_anisotropic`)===!0){if(a.magFilter===1003||a.minFilter!==1005&&a.minFilter!==1008||a.type===1015&&t.has(`OES_texture_float_linear`)===!1)return;if(a.anisotropy>1||r.get(a).__currentAnisotropy){let o=t.get(`EXT_texture_filter_anisotropic`);e.texParameterf(n,o.TEXTURE_MAX_ANISOTROPY_EXT,Math.min(a.anisotropy,i.getMaxAnisotropy())),r.get(a).__currentAnisotropy=a.anisotropy}}}function re(t,n){let r=!1;t.__webglInit===void 0&&(t.__webglInit=!0,n.addEventListener(`dispose`,x));let i=n.source,a=f.get(i);a===void 0&&(a={},f.set(i,a));let s=k(n);if(s!==t.__cacheKey){a[s]===void 0&&(a[s]={texture:e.createTexture(),usedTimes:0},o.memory.textures++,r=!0),a[s].usedTimes++;let i=a[t.__cacheKey];i!==void 0&&(a[t.__cacheKey].usedTimes--,i.usedTimes===0&&w(n)),t.__cacheKey=s,t.__webglTexture=a[s].texture}return r}function F(t,o,s){let c=e.TEXTURE_2D;(o.isDataArrayTexture||o.isCompressedArrayTexture)&&(c=e.TEXTURE_2D_ARRAY),o.isData3DTexture&&(c=e.TEXTURE_3D);let l=re(t,o),u=o.source;n.bindTexture(c,t.__webglTexture,e.TEXTURE0+s);let d=r.get(u);if(u.version!==d.__version||l===!0){n.activeTexture(e.TEXTURE0+s);let t=W.getPrimaries(W.workingColorSpace),r=o.colorSpace===``?null:W.getPrimaries(o.colorSpace),f=o.colorSpace===``||t===r?e.NONE:e.BROWSER_DEFAULT_WEBGL;e.pixelStorei(e.UNPACK_FLIP_Y_WEBGL,o.flipY),e.pixelStorei(e.UNPACK_PREMULTIPLY_ALPHA_WEBGL,o.premultiplyAlpha),e.pixelStorei(e.UNPACK_ALIGNMENT,o.unpackAlignment),e.pixelStorei(e.UNPACK_COLORSPACE_CONVERSION_WEBGL,f);let p=h(o.image,!1,i.maxTextureSize);p=B(o,p);let m=a.convert(o.format,o.colorSpace),x=a.convert(o.type),S=v(o.internalFormat,m,x,o.colorSpace,o.isVideoTexture);ne(c,o);let C,w=o.mipmaps,T=o.isVideoTexture!==!0,E=d.__version===void 0||l===!0,D=u.dataReady,O=b(o,p);if(o.isDepthTexture)S=y(o.format===na,o.type),E&&(T?n.texStorage2D(e.TEXTURE_2D,1,S,p.width,p.height):n.texImage2D(e.TEXTURE_2D,0,S,p.width,p.height,0,m,x,null));else if(o.isDataTexture){if(w.length>0){T&&E&&n.texStorage2D(e.TEXTURE_2D,O,S,w[0].width,w[0].height);for(let t=0,r=w.length;t<r;t++)C=w[t],T?D&&n.texSubImage2D(e.TEXTURE_2D,t,0,0,C.width,C.height,m,x,C.data):n.texImage2D(e.TEXTURE_2D,t,S,C.width,C.height,0,m,x,C.data);o.generateMipmaps=!1}else T?(E&&n.texStorage2D(e.TEXTURE_2D,O,S,p.width,p.height),D&&n.texSubImage2D(e.TEXTURE_2D,0,0,0,p.width,p.height,m,x,p.data)):n.texImage2D(e.TEXTURE_2D,0,S,p.width,p.height,0,m,x,p.data)}else if(o.isCompressedTexture){if(o.isCompressedArrayTexture){T&&E&&n.texStorage3D(e.TEXTURE_2D_ARRAY,O,S,w[0].width,w[0].height,p.depth);for(let t=0,r=w.length;t<r;t++)if(C=w[t],o.format!==1023){if(m!==null){if(T){if(D){if(o.layerUpdates.size>0){let r=Ef(C.width,C.height,o.format,o.type);for(let i of o.layerUpdates){let a=C.data.subarray(i*r/C.data.BYTES_PER_ELEMENT,(i+1)*r/C.data.BYTES_PER_ELEMENT);n.compressedTexSubImage3D(e.TEXTURE_2D_ARRAY,t,0,0,i,C.width,C.height,1,m,a,0,0)}o.clearLayerUpdates()}else n.compressedTexSubImage3D(e.TEXTURE_2D_ARRAY,t,0,0,0,C.width,C.height,p.depth,m,C.data,0,0)}}else n.compressedTexImage3D(e.TEXTURE_2D_ARRAY,t,S,C.width,C.height,p.depth,0,C.data,0,0)}else console.warn(`THREE.WebGLRenderer: Attempt to load unsupported compressed texture format in .uploadTexture()`)}else T?D&&n.texSubImage3D(e.TEXTURE_2D_ARRAY,t,0,0,0,C.width,C.height,p.depth,m,x,C.data):n.texImage3D(e.TEXTURE_2D_ARRAY,t,S,C.width,C.height,p.depth,0,m,x,C.data)}else{T&&E&&n.texStorage2D(e.TEXTURE_2D,O,S,w[0].width,w[0].height);for(let t=0,r=w.length;t<r;t++)C=w[t],o.format===1023?T?D&&n.texSubImage2D(e.TEXTURE_2D,t,0,0,C.width,C.height,m,x,C.data):n.texImage2D(e.TEXTURE_2D,t,S,C.width,C.height,0,m,x,C.data):m===null?console.warn(`THREE.WebGLRenderer: Attempt to load unsupported compressed texture format in .uploadTexture()`):T?D&&n.compressedTexSubImage2D(e.TEXTURE_2D,t,0,0,C.width,C.height,m,C.data):n.compressedTexImage2D(e.TEXTURE_2D,t,S,C.width,C.height,0,C.data)}}else if(o.isDataArrayTexture){if(T){if(E&&n.texStorage3D(e.TEXTURE_2D_ARRAY,O,S,p.width,p.height,p.depth),D){if(o.layerUpdates.size>0){let t=Ef(p.width,p.height,o.format,o.type);for(let r of o.layerUpdates){let i=p.data.subarray(r*t/p.data.BYTES_PER_ELEMENT,(r+1)*t/p.data.BYTES_PER_ELEMENT);n.texSubImage3D(e.TEXTURE_2D_ARRAY,0,0,0,r,p.width,p.height,1,m,x,i)}o.clearLayerUpdates()}else n.texSubImage3D(e.TEXTURE_2D_ARRAY,0,0,0,0,p.width,p.height,p.depth,m,x,p.data)}}else n.texImage3D(e.TEXTURE_2D_ARRAY,0,S,p.width,p.height,p.depth,0,m,x,p.data)}else if(o.isData3DTexture)T?(E&&n.texStorage3D(e.TEXTURE_3D,O,S,p.width,p.height,p.depth),D&&n.texSubImage3D(e.TEXTURE_3D,0,0,0,0,p.width,p.height,p.depth,m,x,p.data)):n.texImage3D(e.TEXTURE_3D,0,S,p.width,p.height,p.depth,0,m,x,p.data);else if(o.isFramebufferTexture){if(E){if(T)n.texStorage2D(e.TEXTURE_2D,O,S,p.width,p.height);else{let t=p.width,r=p.height;for(let i=0;i<O;i++)n.texImage2D(e.TEXTURE_2D,i,S,t,r,0,m,x,null),t>>=1,r>>=1}}}else if(w.length>0){if(T&&E){let t=V(w[0]);n.texStorage2D(e.TEXTURE_2D,O,S,t.width,t.height)}for(let t=0,r=w.length;t<r;t++)C=w[t],T?D&&n.texSubImage2D(e.TEXTURE_2D,t,0,0,m,x,C):n.texImage2D(e.TEXTURE_2D,t,S,m,x,C);o.generateMipmaps=!1}else if(T){if(E){let t=V(p);n.texStorage2D(e.TEXTURE_2D,O,S,t.width,t.height)}D&&n.texSubImage2D(e.TEXTURE_2D,0,0,0,m,x,p)}else n.texImage2D(e.TEXTURE_2D,0,S,m,x,p);g(o)&&_(c),d.__version=u.version,o.onUpdate&&o.onUpdate(o)}t.__version=o.version}function ie(t,o,s){if(o.image.length!==6)return;let c=re(t,o),l=o.source;n.bindTexture(e.TEXTURE_CUBE_MAP,t.__webglTexture,e.TEXTURE0+s);let u=r.get(l);if(l.version!==u.__version||c===!0){n.activeTexture(e.TEXTURE0+s);let t=W.getPrimaries(W.workingColorSpace),r=o.colorSpace===``?null:W.getPrimaries(o.colorSpace),d=o.colorSpace===``||t===r?e.NONE:e.BROWSER_DEFAULT_WEBGL;e.pixelStorei(e.UNPACK_FLIP_Y_WEBGL,o.flipY),e.pixelStorei(e.UNPACK_PREMULTIPLY_ALPHA_WEBGL,o.premultiplyAlpha),e.pixelStorei(e.UNPACK_ALIGNMENT,o.unpackAlignment),e.pixelStorei(e.UNPACK_COLORSPACE_CONVERSION_WEBGL,d);let f=o.isCompressedTexture||o.image[0].isCompressedTexture,p=o.image[0]&&o.image[0].isDataTexture,m=[];for(let e=0;e<6;e++)!f&&!p?m[e]=h(o.image[e],!0,i.maxCubemapSize):m[e]=p?o.image[e].image:o.image[e],m[e]=B(o,m[e]);let y=m[0],x=a.convert(o.format,o.colorSpace),S=a.convert(o.type),C=v(o.internalFormat,x,S,o.colorSpace),w=o.isVideoTexture!==!0,T=u.__version===void 0||c===!0,E=l.dataReady,D=b(o,y);ne(e.TEXTURE_CUBE_MAP,o);let O;if(f){w&&T&&n.texStorage2D(e.TEXTURE_CUBE_MAP,D,C,y.width,y.height);for(let t=0;t<6;t++){O=m[t].mipmaps;for(let r=0;r<O.length;r++){let i=O[r];o.format===1023?w?E&&n.texSubImage2D(e.TEXTURE_CUBE_MAP_POSITIVE_X+t,r,0,0,i.width,i.height,x,S,i.data):n.texImage2D(e.TEXTURE_CUBE_MAP_POSITIVE_X+t,r,C,i.width,i.height,0,x,S,i.data):x===null?console.warn(`THREE.WebGLRenderer: Attempt to load unsupported compressed texture format in .setTextureCube()`):w?E&&n.compressedTexSubImage2D(e.TEXTURE_CUBE_MAP_POSITIVE_X+t,r,0,0,i.width,i.height,x,i.data):n.compressedTexImage2D(e.TEXTURE_CUBE_MAP_POSITIVE_X+t,r,C,i.width,i.height,0,i.data)}}}else{if(O=o.mipmaps,w&&T){O.length>0&&D++;let t=V(m[0]);n.texStorage2D(e.TEXTURE_CUBE_MAP,D,C,t.width,t.height)}for(let t=0;t<6;t++)if(p){w?E&&n.texSubImage2D(e.TEXTURE_CUBE_MAP_POSITIVE_X+t,0,0,0,m[t].width,m[t].height,x,S,m[t].data):n.texImage2D(e.TEXTURE_CUBE_MAP_POSITIVE_X+t,0,C,m[t].width,m[t].height,0,x,S,m[t].data);for(let r=0;r<O.length;r++){let i=O[r].image[t].image;w?E&&n.texSubImage2D(e.TEXTURE_CUBE_MAP_POSITIVE_X+t,r+1,0,0,i.width,i.height,x,S,i.data):n.texImage2D(e.TEXTURE_CUBE_MAP_POSITIVE_X+t,r+1,C,i.width,i.height,0,x,S,i.data)}}else{w?E&&n.texSubImage2D(e.TEXTURE_CUBE_MAP_POSITIVE_X+t,0,0,0,x,S,m[t]):n.texImage2D(e.TEXTURE_CUBE_MAP_POSITIVE_X+t,0,C,x,S,m[t]);for(let r=0;r<O.length;r++){let i=O[r];w?E&&n.texSubImage2D(e.TEXTURE_CUBE_MAP_POSITIVE_X+t,r+1,0,0,x,S,i.image[t]):n.texImage2D(e.TEXTURE_CUBE_MAP_POSITIVE_X+t,r+1,C,x,S,i.image[t])}}}g(o)&&_(e.TEXTURE_CUBE_MAP),u.__version=l.version,o.onUpdate&&o.onUpdate(o)}t.__version=o.version}function ae(t,i,o,c,l,u){let d=a.convert(o.format,o.colorSpace),f=a.convert(o.type),p=v(o.internalFormat,d,f,o.colorSpace);if(!r.get(i).__hasExternalTextures){let t=Math.max(1,i.width>>u),r=Math.max(1,i.height>>u);l===e.TEXTURE_3D||l===e.TEXTURE_2D_ARRAY?n.texImage3D(l,u,p,t,r,i.depth,0,d,f,null):n.texImage2D(l,u,p,t,r,0,d,f,null)}n.bindFramebuffer(e.FRAMEBUFFER,t),z(i)?s.framebufferTexture2DMultisampleEXT(e.FRAMEBUFFER,c,l,r.get(o).__webglTexture,0,R(i)):(l===e.TEXTURE_2D||l>=e.TEXTURE_CUBE_MAP_POSITIVE_X&&l<=e.TEXTURE_CUBE_MAP_NEGATIVE_Z)&&e.framebufferTexture2D(e.FRAMEBUFFER,c,l,r.get(o).__webglTexture,u),n.bindFramebuffer(e.FRAMEBUFFER,null)}function I(t,n,r){if(e.bindRenderbuffer(e.RENDERBUFFER,t),n.depthBuffer){let i=n.depthTexture,a=i&&i.isDepthTexture?i.type:null,o=y(n.stencilBuffer,a),c=n.stencilBuffer?e.DEPTH_STENCIL_ATTACHMENT:e.DEPTH_ATTACHMENT,l=R(n);z(n)?s.renderbufferStorageMultisampleEXT(e.RENDERBUFFER,l,o,n.width,n.height):r?e.renderbufferStorageMultisample(e.RENDERBUFFER,l,o,n.width,n.height):e.renderbufferStorage(e.RENDERBUFFER,o,n.width,n.height),e.framebufferRenderbuffer(e.FRAMEBUFFER,c,e.RENDERBUFFER,t)}else{let t=n.textures;for(let i=0;i<t.length;i++){let o=t[i],c=a.convert(o.format,o.colorSpace),l=a.convert(o.type),u=v(o.internalFormat,c,l,o.colorSpace),d=R(n);r&&z(n)===!1?e.renderbufferStorageMultisample(e.RENDERBUFFER,d,u,n.width,n.height):z(n)?s.renderbufferStorageMultisampleEXT(e.RENDERBUFFER,d,u,n.width,n.height):e.renderbufferStorage(e.RENDERBUFFER,u,n.width,n.height)}}e.bindRenderbuffer(e.RENDERBUFFER,null)}function oe(t,i){if(i&&i.isWebGLCubeRenderTarget)throw Error(`Depth Texture with cube render targets is not supported`);if(n.bindFramebuffer(e.FRAMEBUFFER,t),!(i.depthTexture&&i.depthTexture.isDepthTexture))throw Error(`renderTarget.depthTexture must be an instance of THREE.DepthTexture`);r.get(i.depthTexture).__webglTexture&&i.depthTexture.image.width===i.width&&i.depthTexture.image.height===i.height||(i.depthTexture.image.width=i.width,i.depthTexture.image.height=i.height,i.depthTexture.needsUpdate=!0),A(i.depthTexture,0);let a=r.get(i.depthTexture).__webglTexture,o=R(i);if(i.depthTexture.format===1026)z(i)?s.framebufferTexture2DMultisampleEXT(e.FRAMEBUFFER,e.DEPTH_ATTACHMENT,e.TEXTURE_2D,a,0,o):e.framebufferTexture2D(e.FRAMEBUFFER,e.DEPTH_ATTACHMENT,e.TEXTURE_2D,a,0);else if(i.depthTexture.format===1027)z(i)?s.framebufferTexture2DMultisampleEXT(e.FRAMEBUFFER,e.DEPTH_STENCIL_ATTACHMENT,e.TEXTURE_2D,a,0,o):e.framebufferTexture2D(e.FRAMEBUFFER,e.DEPTH_STENCIL_ATTACHMENT,e.TEXTURE_2D,a,0);else throw Error(`Unknown depthTexture format`)}function se(t){let i=r.get(t),a=t.isWebGLCubeRenderTarget===!0;if(i.__boundDepthTexture!==t.depthTexture){let e=t.depthTexture;if(i.__depthDisposeCallback&&i.__depthDisposeCallback(),e){let t=()=>{delete i.__boundDepthTexture,delete i.__depthDisposeCallback,e.removeEventListener(`dispose`,t)};e.addEventListener(`dispose`,t),i.__depthDisposeCallback=t}i.__boundDepthTexture=e}if(t.depthTexture&&!i.__autoAllocateDepthBuffer){if(a)throw Error(`target.depthTexture not supported in Cube render targets`);oe(i.__webglFramebuffer,t)}else if(a){i.__webglDepthbuffer=[];for(let r=0;r<6;r++)if(n.bindFramebuffer(e.FRAMEBUFFER,i.__webglFramebuffer[r]),i.__webglDepthbuffer[r]===void 0)i.__webglDepthbuffer[r]=e.createRenderbuffer(),I(i.__webglDepthbuffer[r],t,!1);else{let n=t.stencilBuffer?e.DEPTH_STENCIL_ATTACHMENT:e.DEPTH_ATTACHMENT,a=i.__webglDepthbuffer[r];e.bindRenderbuffer(e.RENDERBUFFER,a),e.framebufferRenderbuffer(e.FRAMEBUFFER,n,e.RENDERBUFFER,a)}}else if(n.bindFramebuffer(e.FRAMEBUFFER,i.__webglFramebuffer),i.__webglDepthbuffer===void 0)i.__webglDepthbuffer=e.createRenderbuffer(),I(i.__webglDepthbuffer,t,!1);else{let n=t.stencilBuffer?e.DEPTH_STENCIL_ATTACHMENT:e.DEPTH_ATTACHMENT,r=i.__webglDepthbuffer;e.bindRenderbuffer(e.RENDERBUFFER,r),e.framebufferRenderbuffer(e.FRAMEBUFFER,n,e.RENDERBUFFER,r)}n.bindFramebuffer(e.FRAMEBUFFER,null)}function ce(t,n,i){let a=r.get(t);n!==void 0&&ae(a.__webglFramebuffer,t,t.texture,e.COLOR_ATTACHMENT0,e.TEXTURE_2D,0),i!==void 0&&se(t)}function le(t){let i=t.texture,s=r.get(t),c=r.get(i);t.addEventListener(`dispose`,S);let l=t.textures,u=t.isWebGLCubeRenderTarget===!0,d=l.length>1;if(d||(c.__webglTexture===void 0&&(c.__webglTexture=e.createTexture()),c.__version=i.version,o.memory.textures++),u){s.__webglFramebuffer=[];for(let t=0;t<6;t++)if(i.mipmaps&&i.mipmaps.length>0){s.__webglFramebuffer[t]=[];for(let n=0;n<i.mipmaps.length;n++)s.__webglFramebuffer[t][n]=e.createFramebuffer()}else s.__webglFramebuffer[t]=e.createFramebuffer()}else{if(i.mipmaps&&i.mipmaps.length>0){s.__webglFramebuffer=[];for(let t=0;t<i.mipmaps.length;t++)s.__webglFramebuffer[t]=e.createFramebuffer()}else s.__webglFramebuffer=e.createFramebuffer();if(d)for(let t=0,n=l.length;t<n;t++){let n=r.get(l[t]);n.__webglTexture===void 0&&(n.__webglTexture=e.createTexture(),o.memory.textures++)}if(t.samples>0&&z(t)===!1){s.__webglMultisampledFramebuffer=e.createFramebuffer(),s.__webglColorRenderbuffer=[],n.bindFramebuffer(e.FRAMEBUFFER,s.__webglMultisampledFramebuffer);for(let n=0;n<l.length;n++){let r=l[n];s.__webglColorRenderbuffer[n]=e.createRenderbuffer(),e.bindRenderbuffer(e.RENDERBUFFER,s.__webglColorRenderbuffer[n]);let i=a.convert(r.format,r.colorSpace),o=a.convert(r.type),c=v(r.internalFormat,i,o,r.colorSpace,t.isXRRenderTarget===!0),u=R(t);e.renderbufferStorageMultisample(e.RENDERBUFFER,u,c,t.width,t.height),e.framebufferRenderbuffer(e.FRAMEBUFFER,e.COLOR_ATTACHMENT0+n,e.RENDERBUFFER,s.__webglColorRenderbuffer[n])}e.bindRenderbuffer(e.RENDERBUFFER,null),t.depthBuffer&&(s.__webglDepthRenderbuffer=e.createRenderbuffer(),I(s.__webglDepthRenderbuffer,t,!0)),n.bindFramebuffer(e.FRAMEBUFFER,null)}}if(u){n.bindTexture(e.TEXTURE_CUBE_MAP,c.__webglTexture),ne(e.TEXTURE_CUBE_MAP,i);for(let n=0;n<6;n++)if(i.mipmaps&&i.mipmaps.length>0)for(let r=0;r<i.mipmaps.length;r++)ae(s.__webglFramebuffer[n][r],t,i,e.COLOR_ATTACHMENT0,e.TEXTURE_CUBE_MAP_POSITIVE_X+n,r);else ae(s.__webglFramebuffer[n],t,i,e.COLOR_ATTACHMENT0,e.TEXTURE_CUBE_MAP_POSITIVE_X+n,0);g(i)&&_(e.TEXTURE_CUBE_MAP),n.unbindTexture()}else if(d){for(let i=0,a=l.length;i<a;i++){let a=l[i],o=r.get(a);n.bindTexture(e.TEXTURE_2D,o.__webglTexture),ne(e.TEXTURE_2D,a),ae(s.__webglFramebuffer,t,a,e.COLOR_ATTACHMENT0+i,e.TEXTURE_2D,0),g(a)&&_(e.TEXTURE_2D)}n.unbindTexture()}else{let r=e.TEXTURE_2D;if((t.isWebGL3DRenderTarget||t.isWebGLArrayRenderTarget)&&(r=t.isWebGL3DRenderTarget?e.TEXTURE_3D:e.TEXTURE_2D_ARRAY),n.bindTexture(r,c.__webglTexture),ne(r,i),i.mipmaps&&i.mipmaps.length>0)for(let n=0;n<i.mipmaps.length;n++)ae(s.__webglFramebuffer[n],t,i,e.COLOR_ATTACHMENT0,r,n);else ae(s.__webglFramebuffer,t,i,e.COLOR_ATTACHMENT0,r,0);g(i)&&_(r),n.unbindTexture()}t.depthBuffer&&se(t)}function ue(t){let i=t.textures;for(let a=0,o=i.length;a<o;a++){let o=i[a];if(g(o)){let i=t.isWebGLCubeRenderTarget?e.TEXTURE_CUBE_MAP:e.TEXTURE_2D,a=r.get(o).__webglTexture;n.bindTexture(i,a),_(i),n.unbindTexture()}}}let L=[],de=[];function fe(t){if(t.samples>0){if(z(t)===!1){let i=t.textures,a=t.width,o=t.height,s=e.COLOR_BUFFER_BIT,l=t.stencilBuffer?e.DEPTH_STENCIL_ATTACHMENT:e.DEPTH_ATTACHMENT,u=r.get(t),d=i.length>1;if(d)for(let t=0;t<i.length;t++)n.bindFramebuffer(e.FRAMEBUFFER,u.__webglMultisampledFramebuffer),e.framebufferRenderbuffer(e.FRAMEBUFFER,e.COLOR_ATTACHMENT0+t,e.RENDERBUFFER,null),n.bindFramebuffer(e.FRAMEBUFFER,u.__webglFramebuffer),e.framebufferTexture2D(e.DRAW_FRAMEBUFFER,e.COLOR_ATTACHMENT0+t,e.TEXTURE_2D,null,0);n.bindFramebuffer(e.READ_FRAMEBUFFER,u.__webglMultisampledFramebuffer),n.bindFramebuffer(e.DRAW_FRAMEBUFFER,u.__webglFramebuffer);for(let n=0;n<i.length;n++){if(t.resolveDepthBuffer&&(t.depthBuffer&&(s|=e.DEPTH_BUFFER_BIT),t.stencilBuffer&&t.resolveStencilBuffer&&(s|=e.STENCIL_BUFFER_BIT)),d){e.framebufferRenderbuffer(e.READ_FRAMEBUFFER,e.COLOR_ATTACHMENT0,e.RENDERBUFFER,u.__webglColorRenderbuffer[n]);let t=r.get(i[n]).__webglTexture;e.framebufferTexture2D(e.DRAW_FRAMEBUFFER,e.COLOR_ATTACHMENT0,e.TEXTURE_2D,t,0)}e.blitFramebuffer(0,0,a,o,0,0,a,o,s,e.NEAREST),c===!0&&(L.length=0,de.length=0,L.push(e.COLOR_ATTACHMENT0+n),t.depthBuffer&&t.resolveDepthBuffer===!1&&(L.push(l),de.push(l),e.invalidateFramebuffer(e.DRAW_FRAMEBUFFER,de)),e.invalidateFramebuffer(e.READ_FRAMEBUFFER,L))}if(n.bindFramebuffer(e.READ_FRAMEBUFFER,null),n.bindFramebuffer(e.DRAW_FRAMEBUFFER,null),d)for(let t=0;t<i.length;t++){n.bindFramebuffer(e.FRAMEBUFFER,u.__webglMultisampledFramebuffer),e.framebufferRenderbuffer(e.FRAMEBUFFER,e.COLOR_ATTACHMENT0+t,e.RENDERBUFFER,u.__webglColorRenderbuffer[t]);let a=r.get(i[t]).__webglTexture;n.bindFramebuffer(e.FRAMEBUFFER,u.__webglFramebuffer),e.framebufferTexture2D(e.DRAW_FRAMEBUFFER,e.COLOR_ATTACHMENT0+t,e.TEXTURE_2D,a,0)}n.bindFramebuffer(e.DRAW_FRAMEBUFFER,u.__webglMultisampledFramebuffer)}else if(t.depthBuffer&&t.resolveDepthBuffer===!1&&c){let n=t.stencilBuffer?e.DEPTH_STENCIL_ATTACHMENT:e.DEPTH_ATTACHMENT;e.invalidateFramebuffer(e.DRAW_FRAMEBUFFER,[n])}}}function R(e){return Math.min(i.maxSamples,e.samples)}function z(e){let n=r.get(e);return e.samples>0&&t.has(`WEBGL_multisampled_render_to_texture`)===!0&&n.__useRenderToTexture!==!1}function pe(e){let t=o.render.frame;u.get(e)!==t&&(u.set(e,t),e.update())}function B(e,t){let n=e.colorSpace,r=e.format,i=e.type;return e.isCompressedTexture===!0||e.isVideoTexture===!0||n!==`srgb-linear`&&n!==``&&(W.getTransfer(n)===`srgb`?(r!==1023||i!==1009)&&console.warn(`THREE.WebGLTextures: sRGB encoded textures have to use RGBAFormat and UnsignedByteType.`):console.error(`THREE.WebGLTextures: Unsupported texture color space:`,n)),t}function V(e){return typeof HTMLImageElement<`u`&&e instanceof HTMLImageElement?(l.width=e.naturalWidth||e.width,l.height=e.naturalHeight||e.height):typeof VideoFrame<`u`&&e instanceof VideoFrame?(l.width=e.displayWidth,l.height=e.displayHeight):(l.width=e.width,l.height=e.height),l}this.allocateTextureUnit=O,this.resetTextureUnits=D,this.setTexture2D=A,this.setTexture2DArray=j,this.setTexture3D=M,this.setTextureCube=N,this.rebindTextures=ce,this.setupRenderTarget=le,this.updateRenderTargetMipmap=ue,this.updateMultisampleRenderTarget=fe,this.setupDepthRenderbuffer=se,this.setupFrameBufferTexture=ae,this.useMultisampledRTT=z}function kf(e,t){function n(n,r=``){let i,a=W.getTransfer(r);if(n===1009)return e.UNSIGNED_BYTE;if(n===1017)return e.UNSIGNED_SHORT_4_4_4_4;if(n===1018)return e.UNSIGNED_SHORT_5_5_5_1;if(n===35902)return e.UNSIGNED_INT_5_9_9_9_REV;if(n===1010)return e.BYTE;if(n===1011)return e.SHORT;if(n===1012)return e.UNSIGNED_SHORT;if(n===1013)return e.INT;if(n===1014)return e.UNSIGNED_INT;if(n===1015)return e.FLOAT;if(n===1016)return e.HALF_FLOAT;if(n===1021)return e.ALPHA;if(n===1022)return e.RGB;if(n===1023)return e.RGBA;if(n===1024)return e.LUMINANCE;if(n===1025)return e.LUMINANCE_ALPHA;if(n===1026)return e.DEPTH_COMPONENT;if(n===1027)return e.DEPTH_STENCIL;if(n===1028)return e.RED;if(n===1029)return e.RED_INTEGER;if(n===1030)return e.RG;if(n===1031)return e.RG_INTEGER;if(n===1033)return e.RGBA_INTEGER;if(n===33776||n===33777||n===33778||n===33779){if(a===`srgb`){if(i=t.get(`WEBGL_compressed_texture_s3tc_srgb`),i!==null){if(n===33776)return i.COMPRESSED_SRGB_S3TC_DXT1_EXT;if(n===33777)return i.COMPRESSED_SRGB_ALPHA_S3TC_DXT1_EXT;if(n===33778)return i.COMPRESSED_SRGB_ALPHA_S3TC_DXT3_EXT;if(n===33779)return i.COMPRESSED_SRGB_ALPHA_S3TC_DXT5_EXT}else return null}else if(i=t.get(`WEBGL_compressed_texture_s3tc`),i!==null){if(n===33776)return i.COMPRESSED_RGB_S3TC_DXT1_EXT;if(n===33777)return i.COMPRESSED_RGBA_S3TC_DXT1_EXT;if(n===33778)return i.COMPRESSED_RGBA_S3TC_DXT3_EXT;if(n===33779)return i.COMPRESSED_RGBA_S3TC_DXT5_EXT}else return null}if(n===35840||n===35841||n===35842||n===35843){if(i=t.get(`WEBGL_compressed_texture_pvrtc`),i!==null){if(n===35840)return i.COMPRESSED_RGB_PVRTC_4BPPV1_IMG;if(n===35841)return i.COMPRESSED_RGB_PVRTC_2BPPV1_IMG;if(n===35842)return i.COMPRESSED_RGBA_PVRTC_4BPPV1_IMG;if(n===35843)return i.COMPRESSED_RGBA_PVRTC_2BPPV1_IMG}else return null}if(n===36196||n===37492||n===37496){if(i=t.get(`WEBGL_compressed_texture_etc`),i!==null){if(n===36196||n===37492)return a===`srgb`?i.COMPRESSED_SRGB8_ETC2:i.COMPRESSED_RGB8_ETC2;if(n===37496)return a===`srgb`?i.COMPRESSED_SRGB8_ALPHA8_ETC2_EAC:i.COMPRESSED_RGBA8_ETC2_EAC}else return null}if(n===37808||n===37809||n===37810||n===37811||n===37812||n===37813||n===37814||n===37815||n===37816||n===37817||n===37818||n===37819||n===37820||n===37821){if(i=t.get(`WEBGL_compressed_texture_astc`),i!==null){if(n===37808)return a===`srgb`?i.COMPRESSED_SRGB8_ALPHA8_ASTC_4x4_KHR:i.COMPRESSED_RGBA_ASTC_4x4_KHR;if(n===37809)return a===`srgb`?i.COMPRESSED_SRGB8_ALPHA8_ASTC_5x4_KHR:i.COMPRESSED_RGBA_ASTC_5x4_KHR;if(n===37810)return a===`srgb`?i.COMPRESSED_SRGB8_ALPHA8_ASTC_5x5_KHR:i.COMPRESSED_RGBA_ASTC_5x5_KHR;if(n===37811)return a===`srgb`?i.COMPRESSED_SRGB8_ALPHA8_ASTC_6x5_KHR:i.COMPRESSED_RGBA_ASTC_6x5_KHR;if(n===37812)return a===`srgb`?i.COMPRESSED_SRGB8_ALPHA8_ASTC_6x6_KHR:i.COMPRESSED_RGBA_ASTC_6x6_KHR;if(n===37813)return a===`srgb`?i.COMPRESSED_SRGB8_ALPHA8_ASTC_8x5_KHR:i.COMPRESSED_RGBA_ASTC_8x5_KHR;if(n===37814)return a===`srgb`?i.COMPRESSED_SRGB8_ALPHA8_ASTC_8x6_KHR:i.COMPRESSED_RGBA_ASTC_8x6_KHR;if(n===37815)return a===`srgb`?i.COMPRESSED_SRGB8_ALPHA8_ASTC_8x8_KHR:i.COMPRESSED_RGBA_ASTC_8x8_KHR;if(n===37816)return a===`srgb`?i.COMPRESSED_SRGB8_ALPHA8_ASTC_10x5_KHR:i.COMPRESSED_RGBA_ASTC_10x5_KHR;if(n===37817)return a===`srgb`?i.COMPRESSED_SRGB8_ALPHA8_ASTC_10x6_KHR:i.COMPRESSED_RGBA_ASTC_10x6_KHR;if(n===37818)return a===`srgb`?i.COMPRESSED_SRGB8_ALPHA8_ASTC_10x8_KHR:i.COMPRESSED_RGBA_ASTC_10x8_KHR;if(n===37819)return a===`srgb`?i.COMPRESSED_SRGB8_ALPHA8_ASTC_10x10_KHR:i.COMPRESSED_RGBA_ASTC_10x10_KHR;if(n===37820)return a===`srgb`?i.COMPRESSED_SRGB8_ALPHA8_ASTC_12x10_KHR:i.COMPRESSED_RGBA_ASTC_12x10_KHR;if(n===37821)return a===`srgb`?i.COMPRESSED_SRGB8_ALPHA8_ASTC_12x12_KHR:i.COMPRESSED_RGBA_ASTC_12x12_KHR}else return null}if(n===36492||n===36494||n===36495){if(i=t.get(`EXT_texture_compression_bptc`),i!==null){if(n===36492)return a===`srgb`?i.COMPRESSED_SRGB_ALPHA_BPTC_UNORM_EXT:i.COMPRESSED_RGBA_BPTC_UNORM_EXT;if(n===36494)return i.COMPRESSED_RGB_BPTC_SIGNED_FLOAT_EXT;if(n===36495)return i.COMPRESSED_RGB_BPTC_UNSIGNED_FLOAT_EXT}else return null}if(n===36283||n===36284||n===36285||n===36286){if(i=t.get(`EXT_texture_compression_rgtc`),i!==null){if(n===36492)return i.COMPRESSED_RED_RGTC1_EXT;if(n===36284)return i.COMPRESSED_SIGNED_RED_RGTC1_EXT;if(n===36285)return i.COMPRESSED_RED_GREEN_RGTC2_EXT;if(n===36286)return i.COMPRESSED_SIGNED_RED_GREEN_RGTC2_EXT}else return null}return n===1020?e.UNSIGNED_INT_24_8:e[n]===void 0?null:e[n]}return{convert:n}}var Af=class extends vl{constructor(e=[]){super(),this.isArrayCamera=!0,this.cameras=e}},jf=class extends lc{constructor(){super(),this.isGroup=!0,this.type=`Group`}},Mf={type:`move`},Nf=class{constructor(){this._targetRay=null,this._grip=null,this._hand=null}getHandSpace(){return this._hand===null&&(this._hand=new jf,this._hand.matrixAutoUpdate=!1,this._hand.visible=!1,this._hand.joints={},this._hand.inputState={pinching:!1}),this._hand}getTargetRaySpace(){return this._targetRay===null&&(this._targetRay=new jf,this._targetRay.matrixAutoUpdate=!1,this._targetRay.visible=!1,this._targetRay.hasLinearVelocity=!1,this._targetRay.linearVelocity=new G,this._targetRay.hasAngularVelocity=!1,this._targetRay.angularVelocity=new G),this._targetRay}getGripSpace(){return this._grip===null&&(this._grip=new jf,this._grip.matrixAutoUpdate=!1,this._grip.visible=!1,this._grip.hasLinearVelocity=!1,this._grip.linearVelocity=new G,this._grip.hasAngularVelocity=!1,this._grip.angularVelocity=new G),this._grip}dispatchEvent(e){return this._targetRay!==null&&this._targetRay.dispatchEvent(e),this._grip!==null&&this._grip.dispatchEvent(e),this._hand!==null&&this._hand.dispatchEvent(e),this}connect(e){if(e&&e.hand){let t=this._hand;if(t)for(let n of e.hand.values())this._getHandJoint(t,n)}return this.dispatchEvent({type:`connected`,data:e}),this}disconnect(e){return this.dispatchEvent({type:`disconnected`,data:e}),this._targetRay!==null&&(this._targetRay.visible=!1),this._grip!==null&&(this._grip.visible=!1),this._hand!==null&&(this._hand.visible=!1),this}update(e,t,n){let r=null,i=null,a=null,o=this._targetRay,s=this._grip,c=this._hand;if(e&&t.session.visibilityState!==`visible-blurred`){if(c&&e.hand){a=!0;for(let r of e.hand.values()){let e=t.getJointPose(r,n),i=this._getHandJoint(c,r);e!==null&&(i.matrix.fromArray(e.transform.matrix),i.matrix.decompose(i.position,i.rotation,i.scale),i.matrixWorldNeedsUpdate=!0,i.jointRadius=e.radius),i.visible=e!==null}let r=c.joints[`index-finger-tip`],i=c.joints[`thumb-tip`],o=r.position.distanceTo(i.position);c.inputState.pinching&&o>.025?(c.inputState.pinching=!1,this.dispatchEvent({type:`pinchend`,handedness:e.handedness,target:this})):!c.inputState.pinching&&o<=.015&&(c.inputState.pinching=!0,this.dispatchEvent({type:`pinchstart`,handedness:e.handedness,target:this}))}else s!==null&&e.gripSpace&&(i=t.getPose(e.gripSpace,n),i!==null&&(s.matrix.fromArray(i.transform.matrix),s.matrix.decompose(s.position,s.rotation,s.scale),s.matrixWorldNeedsUpdate=!0,i.linearVelocity?(s.hasLinearVelocity=!0,s.linearVelocity.copy(i.linearVelocity)):s.hasLinearVelocity=!1,i.angularVelocity?(s.hasAngularVelocity=!0,s.angularVelocity.copy(i.angularVelocity)):s.hasAngularVelocity=!1));o!==null&&(r=t.getPose(e.targetRaySpace,n),r===null&&i!==null&&(r=i),r!==null&&(o.matrix.fromArray(r.transform.matrix),o.matrix.decompose(o.position,o.rotation,o.scale),o.matrixWorldNeedsUpdate=!0,r.linearVelocity?(o.hasLinearVelocity=!0,o.linearVelocity.copy(r.linearVelocity)):o.hasLinearVelocity=!1,r.angularVelocity?(o.hasAngularVelocity=!0,o.angularVelocity.copy(r.angularVelocity)):o.hasAngularVelocity=!1,this.dispatchEvent(Mf)))}return o!==null&&(o.visible=r!==null),s!==null&&(s.visible=i!==null),c!==null&&(c.visible=a!==null),this}_getHandJoint(e,t){if(e.joints[t.jointName]===void 0){let n=new jf;n.matrixAutoUpdate=!1,n.visible=!1,e.joints[t.jointName]=n,e.add(n)}return e.joints[t.jointName]}},Pf=`
void main() {

	gl_Position = vec4( position, 1.0 );

}`,Ff=`
uniform sampler2DArray depthColor;
uniform float depthWidth;
uniform float depthHeight;

void main() {

	vec2 coord = vec2( gl_FragCoord.x / depthWidth, gl_FragCoord.y / depthHeight );

	if ( coord.x >= 1.0 ) {

		gl_FragDepth = texture( depthColor, vec3( coord.x - 1.0, coord.y, 1 ) ).r;

	} else {

		gl_FragDepth = texture( depthColor, vec3( coord.x, coord.y, 0 ) ).r;

	}

}`,If=class{constructor(){this.texture=null,this.mesh=null,this.depthNear=0,this.depthFar=0}init(e,t,n){if(this.texture===null){let r=new es,i=e.properties.get(r);i.__webglTexture=t.texture,(t.depthNear!=n.depthNear||t.depthFar!=n.depthFar)&&(this.depthNear=t.depthNear,this.depthFar=t.depthFar),this.texture=r}}getMesh(e){if(this.texture!==null&&this.mesh===null){let t=e.cameras[0].viewport,n=new pl({vertexShader:Pf,fragmentShader:Ff,uniforms:{depthColor:{value:this.texture},depthWidth:{value:t.z},depthHeight:{value:t.w}}});this.mesh=new nl(new Nl(20,20),n)}return this.mesh}reset(){this.texture=null,this.mesh=null}getDepthTexture(){return this.texture}},Lf=class extends io{constructor(e,t){super();let n=this,r=null,i=1,a=null,o=`local-floor`,s=1,c=null,l=null,u=null,d=null,f=null,p=null,m=new If,h=t.getContextAttributes(),g=null,_=null,v=[],y=[],b=new H,x=null,S=new vl;S.layers.enable(1),S.viewport=new ts;let C=new vl;C.layers.enable(2),C.viewport=new ts;let w=[S,C],T=new Af;T.layers.enable(1),T.layers.enable(2);let E=null,D=null;this.cameraAutoUpdate=!0,this.enabled=!1,this.isPresenting=!1,this.getController=function(e){let t=v[e];return t===void 0&&(t=new Nf,v[e]=t),t.getTargetRaySpace()},this.getControllerGrip=function(e){let t=v[e];return t===void 0&&(t=new Nf,v[e]=t),t.getGripSpace()},this.getHand=function(e){let t=v[e];return t===void 0&&(t=new Nf,v[e]=t),t.getHandSpace()};function O(e){let t=y.indexOf(e.inputSource);if(t===-1)return;let n=v[t];n!==void 0&&(n.update(e.inputSource,e.frame,c||a),n.dispatchEvent({type:e.type,data:e.inputSource}))}function k(){r.removeEventListener(`select`,O),r.removeEventListener(`selectstart`,O),r.removeEventListener(`selectend`,O),r.removeEventListener(`squeeze`,O),r.removeEventListener(`squeezestart`,O),r.removeEventListener(`squeezeend`,O),r.removeEventListener(`end`,k),r.removeEventListener(`inputsourceschange`,A);for(let e=0;e<v.length;e++){let t=y[e];t!==null&&(y[e]=null,v[e].disconnect(t))}E=null,D=null,m.reset(),e.setRenderTarget(g),f=null,d=null,u=null,r=null,_=null,re.stop(),n.isPresenting=!1,e.setPixelRatio(x),e.setSize(b.width,b.height,!1),n.dispatchEvent({type:`sessionend`})}this.setFramebufferScaleFactor=function(e){i=e,n.isPresenting===!0&&console.warn(`THREE.WebXRManager: Cannot change framebuffer scale while presenting.`)},this.setReferenceSpaceType=function(e){o=e,n.isPresenting===!0&&console.warn(`THREE.WebXRManager: Cannot change reference space type while presenting.`)},this.getReferenceSpace=function(){return c||a},this.setReferenceSpace=function(e){c=e},this.getBaseLayer=function(){return d===null?f:d},this.getBinding=function(){return u},this.getFrame=function(){return p},this.getSession=function(){return r},this.setSession=async function(l){if(r=l,r!==null){if(g=e.getRenderTarget(),r.addEventListener(`select`,O),r.addEventListener(`selectstart`,O),r.addEventListener(`selectend`,O),r.addEventListener(`squeeze`,O),r.addEventListener(`squeezestart`,O),r.addEventListener(`squeezeend`,O),r.addEventListener(`end`,k),r.addEventListener(`inputsourceschange`,A),h.xrCompatible!==!0&&await t.makeXRCompatible(),x=e.getPixelRatio(),e.getSize(b),r.renderState.layers===void 0){let n={antialias:h.antialias,alpha:!0,depth:h.depth,stencil:h.stencil,framebufferScaleFactor:i};f=new XRWebGLLayer(r,t,n),r.updateRenderState({baseLayer:f}),e.setPixelRatio(1),e.setSize(f.framebufferWidth,f.framebufferHeight,!1),_=new rs(f.framebufferWidth,f.framebufferHeight,{format:Qi,type:Ri,colorSpace:e.outputColorSpace,stencilBuffer:h.stencil})}else{let n=null,a=null,o=null;h.depth&&(o=h.stencil?t.DEPTH24_STENCIL8:t.DEPTH_COMPONENT24,n=h.stencil?na:ta,a=h.stencil?Ji:Ui);let s={colorFormat:t.RGBA8,depthFormat:o,scaleFactor:i};u=new XRWebGLBinding(r,t),d=u.createProjectionLayer(s),r.updateRenderState({layers:[d]}),e.setPixelRatio(1),e.setSize(d.textureWidth,d.textureHeight,!1),_=new rs(d.textureWidth,d.textureHeight,{format:Qi,type:Ri,depthTexture:new vu(d.textureWidth,d.textureHeight,a,void 0,void 0,void 0,void 0,void 0,void 0,n),stencilBuffer:h.stencil,colorSpace:e.outputColorSpace,samples:h.antialias?4:0,resolveDepthBuffer:d.ignoreDepthValues===!1})}_.isXRRenderTarget=!0,this.setFoveation(s),c=null,a=await r.requestReferenceSpace(o),re.setContext(r),re.start(),n.isPresenting=!0,n.dispatchEvent({type:`sessionstart`})}},this.getEnvironmentBlendMode=function(){if(r!==null)return r.environmentBlendMode},this.getDepthTexture=function(){return m.getDepthTexture()};function A(e){for(let t=0;t<e.removed.length;t++){let n=e.removed[t],r=y.indexOf(n);r>=0&&(y[r]=null,v[r].disconnect(n))}for(let t=0;t<e.added.length;t++){let n=e.added[t],r=y.indexOf(n);if(r===-1){for(let e=0;e<v.length;e++)if(e>=y.length){y.push(n),r=e;break}else if(y[e]===null){y[e]=n,r=e;break}if(r===-1)break}let i=v[r];i&&i.connect(n)}}let j=new G,M=new G;function N(e,t,n){j.setFromMatrixPosition(t.matrixWorld),M.setFromMatrixPosition(n.matrixWorld);let r=j.distanceTo(M),i=t.projectionMatrix.elements,a=n.projectionMatrix.elements,o=i[14]/(i[10]-1),s=i[14]/(i[10]+1),c=(i[9]+1)/i[5],l=(i[9]-1)/i[5],u=(i[8]-1)/i[0],d=(a[8]+1)/a[0],f=o*u,p=o*d,m=r/(-u+d),h=m*-u;if(t.matrixWorld.decompose(e.position,e.quaternion,e.scale),e.translateX(h),e.translateZ(m),e.matrixWorld.compose(e.position,e.quaternion,e.scale),e.matrixWorldInverse.copy(e.matrixWorld).invert(),i[10]===-1)e.projectionMatrix.copy(t.projectionMatrix),e.projectionMatrixInverse.copy(t.projectionMatrixInverse);else{let t=o+m,n=s+m,i=f-h,a=p+(r-h),u=c*s/n*t,d=l*s/n*t;e.projectionMatrix.makePerspective(i,a,u,d,t,n),e.projectionMatrixInverse.copy(e.projectionMatrix).invert()}}function P(e,t){t===null?e.matrixWorld.copy(e.matrix):e.matrixWorld.multiplyMatrices(t.matrixWorld,e.matrix),e.matrixWorldInverse.copy(e.matrixWorld).invert()}this.updateCamera=function(e){if(r===null)return;let t=e.near,n=e.far;m.texture!==null&&(m.depthNear>0&&(t=m.depthNear),m.depthFar>0&&(n=m.depthFar)),T.near=C.near=S.near=t,T.far=C.far=S.far=n,(E!==T.near||D!==T.far)&&(r.updateRenderState({depthNear:T.near,depthFar:T.far}),E=T.near,D=T.far);let i=e.parent,a=T.cameras;P(T,i);for(let e=0;e<a.length;e++)P(a[e],i);a.length===2?N(T,S,C):T.projectionMatrix.copy(S.projectionMatrix),ee(e,T,i)};function ee(e,t,n){n===null?e.matrix.copy(t.matrixWorld):(e.matrix.copy(n.matrixWorld),e.matrix.invert(),e.matrix.multiply(t.matrixWorld)),e.matrix.decompose(e.position,e.quaternion,e.scale),e.updateMatrixWorld(!0),e.projectionMatrix.copy(t.projectionMatrix),e.projectionMatrixInverse.copy(t.projectionMatrixInverse),e.isPerspectiveCamera&&(e.fov=co*2*Math.atan(1/e.projectionMatrix.elements[5]),e.zoom=1)}this.getCamera=function(){return T},this.getFoveation=function(){if(d!==null||f!==null)return s},this.setFoveation=function(e){s=e,d!==null&&(d.fixedFoveation=e),f!==null&&f.fixedFoveation!==void 0&&(f.fixedFoveation=e)},this.hasDepthSensing=function(){return m.texture!==null},this.getDepthSensingMesh=function(){return m.getMesh(T)};let te=null;function ne(t,i){if(l=i.getViewerPose(c||a),p=i,l!==null){let t=l.views;f!==null&&(e.setRenderTargetFramebuffer(_,f.framebuffer),e.setRenderTarget(_));let n=!1;t.length!==T.cameras.length&&(T.cameras.length=0,n=!0);for(let r=0;r<t.length;r++){let i=t[r],a=null;if(f!==null)a=f.getViewport(i);else{let t=u.getViewSubImage(d,i);a=t.viewport,r===0&&(e.setRenderTargetTextures(_,t.colorTexture,d.ignoreDepthValues?void 0:t.depthStencilTexture),e.setRenderTarget(_))}let o=w[r];o===void 0&&(o=new vl,o.layers.enable(r),o.viewport=new ts,w[r]=o),o.matrix.fromArray(i.transform.matrix),o.matrix.decompose(o.position,o.quaternion,o.scale),o.projectionMatrix.fromArray(i.projectionMatrix),o.projectionMatrixInverse.copy(o.projectionMatrix).invert(),o.viewport.set(a.x,a.y,a.width,a.height),r===0&&(T.matrix.copy(o.matrix),T.matrix.decompose(T.position,T.quaternion,T.scale)),n===!0&&T.cameras.push(o)}let i=r.enabledFeatures;if(i&&i.includes(`depth-sensing`)){let n=u.getDepthInformation(t[0]);n&&n.isValid&&n.texture&&m.init(e,n,r.renderState)}}for(let e=0;e<v.length;e++){let t=y[e],n=v[e];t!==null&&n!==void 0&&n.update(t,i,c||a)}te&&te(t,i),i.detectedPlanes&&n.dispatchEvent({type:`planesdetected`,data:i}),p=null}let re=new jl;re.setAnimationLoop(ne),this.setAnimationLoop=function(e){te=e},this.dispose=function(){}}},Rf=new Ks,zf=new Is;function Bf(e,t){function n(e,t){e.matrixAutoUpdate===!0&&e.updateMatrix(),t.value.copy(e.matrix)}function r(t,n){n.color.getRGB(t.fogColor.value,ll(e)),n.isFog?(t.fogNear.value=n.near,t.fogFar.value=n.far):n.isFogExp2&&(t.fogDensity.value=n.density)}function i(e,t,n,r,i){t.isMeshBasicMaterial||t.isMeshLambertMaterial?a(e,t):t.isMeshToonMaterial?(a(e,t),d(e,t)):t.isMeshPhongMaterial?(a(e,t),u(e,t)):t.isMeshStandardMaterial?(a(e,t),f(e,t),t.isMeshPhysicalMaterial&&p(e,t,i)):t.isMeshMatcapMaterial?(a(e,t),m(e,t)):t.isMeshDepthMaterial?a(e,t):t.isMeshDistanceMaterial?(a(e,t),h(e,t)):t.isMeshNormalMaterial?a(e,t):t.isLineBasicMaterial?(o(e,t),t.isLineDashedMaterial&&s(e,t)):t.isPointsMaterial?c(e,t,n,r):t.isSpriteMaterial?l(e,t):t.isShadowMaterial?(e.color.value.copy(t.color),e.opacity.value=t.opacity):t.isShaderMaterial&&(t.uniformsNeedUpdate=!1)}function a(e,r){e.opacity.value=r.opacity,r.color&&e.diffuse.value.copy(r.color),r.emissive&&e.emissive.value.copy(r.emissive).multiplyScalar(r.emissiveIntensity),r.map&&(e.map.value=r.map,n(r.map,e.mapTransform)),r.alphaMap&&(e.alphaMap.value=r.alphaMap,n(r.alphaMap,e.alphaMapTransform)),r.bumpMap&&(e.bumpMap.value=r.bumpMap,n(r.bumpMap,e.bumpMapTransform),e.bumpScale.value=r.bumpScale,r.side===1&&(e.bumpScale.value*=-1)),r.normalMap&&(e.normalMap.value=r.normalMap,n(r.normalMap,e.normalMapTransform),e.normalScale.value.copy(r.normalScale),r.side===1&&e.normalScale.value.negate()),r.displacementMap&&(e.displacementMap.value=r.displacementMap,n(r.displacementMap,e.displacementMapTransform),e.displacementScale.value=r.displacementScale,e.displacementBias.value=r.displacementBias),r.emissiveMap&&(e.emissiveMap.value=r.emissiveMap,n(r.emissiveMap,e.emissiveMapTransform)),r.specularMap&&(e.specularMap.value=r.specularMap,n(r.specularMap,e.specularMapTransform)),r.alphaTest>0&&(e.alphaTest.value=r.alphaTest);let i=t.get(r),a=i.envMap,o=i.envMapRotation;a&&(e.envMap.value=a,Rf.copy(o),Rf.x*=-1,Rf.y*=-1,Rf.z*=-1,a.isCubeTexture&&a.isRenderTargetTexture===!1&&(Rf.y*=-1,Rf.z*=-1),e.envMapRotation.value.setFromMatrix4(zf.makeRotationFromEuler(Rf)),e.flipEnvMap.value=a.isCubeTexture&&a.isRenderTargetTexture===!1?-1:1,e.reflectivity.value=r.reflectivity,e.ior.value=r.ior,e.refractionRatio.value=r.refractionRatio),r.lightMap&&(e.lightMap.value=r.lightMap,e.lightMapIntensity.value=r.lightMapIntensity,n(r.lightMap,e.lightMapTransform)),r.aoMap&&(e.aoMap.value=r.aoMap,e.aoMapIntensity.value=r.aoMapIntensity,n(r.aoMap,e.aoMapTransform))}function o(e,t){e.diffuse.value.copy(t.color),e.opacity.value=t.opacity,t.map&&(e.map.value=t.map,n(t.map,e.mapTransform))}function s(e,t){e.dashSize.value=t.dashSize,e.totalSize.value=t.dashSize+t.gapSize,e.scale.value=t.scale}function c(e,t,r,i){e.diffuse.value.copy(t.color),e.opacity.value=t.opacity,e.size.value=t.size*r,e.scale.value=i*.5,t.map&&(e.map.value=t.map,n(t.map,e.uvTransform)),t.alphaMap&&(e.alphaMap.value=t.alphaMap,n(t.alphaMap,e.alphaMapTransform)),t.alphaTest>0&&(e.alphaTest.value=t.alphaTest)}function l(e,t){e.diffuse.value.copy(t.color),e.opacity.value=t.opacity,e.rotation.value=t.rotation,t.map&&(e.map.value=t.map,n(t.map,e.mapTransform)),t.alphaMap&&(e.alphaMap.value=t.alphaMap,n(t.alphaMap,e.alphaMapTransform)),t.alphaTest>0&&(e.alphaTest.value=t.alphaTest)}function u(e,t){e.specular.value.copy(t.specular),e.shininess.value=Math.max(t.shininess,1e-4)}function d(e,t){t.gradientMap&&(e.gradientMap.value=t.gradientMap)}function f(e,t){e.metalness.value=t.metalness,t.metalnessMap&&(e.metalnessMap.value=t.metalnessMap,n(t.metalnessMap,e.metalnessMapTransform)),e.roughness.value=t.roughness,t.roughnessMap&&(e.roughnessMap.value=t.roughnessMap,n(t.roughnessMap,e.roughnessMapTransform)),t.envMap&&(e.envMapIntensity.value=t.envMapIntensity)}function p(e,t,r){e.ior.value=t.ior,t.sheen>0&&(e.sheenColor.value.copy(t.sheenColor).multiplyScalar(t.sheen),e.sheenRoughness.value=t.sheenRoughness,t.sheenColorMap&&(e.sheenColorMap.value=t.sheenColorMap,n(t.sheenColorMap,e.sheenColorMapTransform)),t.sheenRoughnessMap&&(e.sheenRoughnessMap.value=t.sheenRoughnessMap,n(t.sheenRoughnessMap,e.sheenRoughnessMapTransform))),t.clearcoat>0&&(e.clearcoat.value=t.clearcoat,e.clearcoatRoughness.value=t.clearcoatRoughness,t.clearcoatMap&&(e.clearcoatMap.value=t.clearcoatMap,n(t.clearcoatMap,e.clearcoatMapTransform)),t.clearcoatRoughnessMap&&(e.clearcoatRoughnessMap.value=t.clearcoatRoughnessMap,n(t.clearcoatRoughnessMap,e.clearcoatRoughnessMapTransform)),t.clearcoatNormalMap&&(e.clearcoatNormalMap.value=t.clearcoatNormalMap,n(t.clearcoatNormalMap,e.clearcoatNormalMapTransform),e.clearcoatNormalScale.value.copy(t.clearcoatNormalScale),t.side===1&&e.clearcoatNormalScale.value.negate())),t.dispersion>0&&(e.dispersion.value=t.dispersion),t.iridescence>0&&(e.iridescence.value=t.iridescence,e.iridescenceIOR.value=t.iridescenceIOR,e.iridescenceThicknessMinimum.value=t.iridescenceThicknessRange[0],e.iridescenceThicknessMaximum.value=t.iridescenceThicknessRange[1],t.iridescenceMap&&(e.iridescenceMap.value=t.iridescenceMap,n(t.iridescenceMap,e.iridescenceMapTransform)),t.iridescenceThicknessMap&&(e.iridescenceThicknessMap.value=t.iridescenceThicknessMap,n(t.iridescenceThicknessMap,e.iridescenceThicknessMapTransform))),t.transmission>0&&(e.transmission.value=t.transmission,e.transmissionSamplerMap.value=r.texture,e.transmissionSamplerSize.value.set(r.width,r.height),t.transmissionMap&&(e.transmissionMap.value=t.transmissionMap,n(t.transmissionMap,e.transmissionMapTransform)),e.thickness.value=t.thickness,t.thicknessMap&&(e.thicknessMap.value=t.thicknessMap,n(t.thicknessMap,e.thicknessMapTransform)),e.attenuationDistance.value=t.attenuationDistance,e.attenuationColor.value.copy(t.attenuationColor)),t.anisotropy>0&&(e.anisotropyVector.value.set(t.anisotropy*Math.cos(t.anisotropyRotation),t.anisotropy*Math.sin(t.anisotropyRotation)),t.anisotropyMap&&(e.anisotropyMap.value=t.anisotropyMap,n(t.anisotropyMap,e.anisotropyMapTransform))),e.specularIntensity.value=t.specularIntensity,e.specularColor.value.copy(t.specularColor),t.specularColorMap&&(e.specularColorMap.value=t.specularColorMap,n(t.specularColorMap,e.specularColorMapTransform)),t.specularIntensityMap&&(e.specularIntensityMap.value=t.specularIntensityMap,n(t.specularIntensityMap,e.specularIntensityMapTransform))}function m(e,t){t.matcap&&(e.matcap.value=t.matcap)}function h(e,n){let r=t.get(n).light;e.referencePosition.value.setFromMatrixPosition(r.matrixWorld),e.nearDistance.value=r.shadow.camera.near,e.farDistance.value=r.shadow.camera.far}return{refreshFogUniforms:r,refreshMaterialUniforms:i}}function Vf(e,t,n,r){let i={},a={},o=[],s=e.getParameter(e.MAX_UNIFORM_BUFFER_BINDINGS);function c(e,t){let n=t.program;r.uniformBlockBinding(e,n)}function l(e,n){let o=i[e.id];o===void 0&&(m(e),o=u(e),i[e.id]=o,e.addEventListener(`dispose`,g));let s=n.program;r.updateUBOMapping(e,s);let c=t.render.frame;a[e.id]!==c&&(f(e),a[e.id]=c)}function u(t){let n=d();t.__bindingPointIndex=n;let r=e.createBuffer(),i=t.__size,a=t.usage;return e.bindBuffer(e.UNIFORM_BUFFER,r),e.bufferData(e.UNIFORM_BUFFER,i,a),e.bindBuffer(e.UNIFORM_BUFFER,null),e.bindBufferBase(e.UNIFORM_BUFFER,n,r),r}function d(){for(let e=0;e<s;e++)if(o.indexOf(e)===-1)return o.push(e),e;return console.error(`THREE.WebGLRenderer: Maximum number of simultaneously usable uniforms groups reached.`),0}function f(t){let n=i[t.id],r=t.uniforms,a=t.__cache;e.bindBuffer(e.UNIFORM_BUFFER,n);for(let t=0,n=r.length;t<n;t++){let n=Array.isArray(r[t])?r[t]:[r[t]];for(let r=0,i=n.length;r<i;r++){let i=n[r];if(p(i,t,r,a)===!0){let t=i.__offset,n=Array.isArray(i.value)?i.value:[i.value],r=0;for(let a=0;a<n.length;a++){let o=n[a],s=h(o);typeof o==`number`||typeof o==`boolean`?(i.__data[0]=o,e.bufferSubData(e.UNIFORM_BUFFER,t+r,i.__data)):o.isMatrix3?(i.__data[0]=o.elements[0],i.__data[1]=o.elements[1],i.__data[2]=o.elements[2],i.__data[3]=0,i.__data[4]=o.elements[3],i.__data[5]=o.elements[4],i.__data[6]=o.elements[5],i.__data[7]=0,i.__data[8]=o.elements[6],i.__data[9]=o.elements[7],i.__data[10]=o.elements[8],i.__data[11]=0):(o.toArray(i.__data,r),r+=s.storage/Float32Array.BYTES_PER_ELEMENT)}e.bufferSubData(e.UNIFORM_BUFFER,t,i.__data)}}}e.bindBuffer(e.UNIFORM_BUFFER,null)}function p(e,t,n,r){let i=e.value,a=t+`_`+n;if(r[a]===void 0)return r[a]=typeof i==`number`||typeof i==`boolean`?i:i.clone(),!0;{let e=r[a];if(typeof i==`number`||typeof i==`boolean`){if(e!==i)return r[a]=i,!0}else if(e.equals(i)===!1)return e.copy(i),!0}return!1}function m(e){let t=e.uniforms,n=0;for(let e=0,r=t.length;e<r;e++){let r=Array.isArray(t[e])?t[e]:[t[e]];for(let e=0,t=r.length;e<t;e++){let t=r[e],i=Array.isArray(t.value)?t.value:[t.value];for(let e=0,r=i.length;e<r;e++){let r=i[e],a=h(r),o=n%16,s=o%a.boundary,c=o+s;n+=s,c!==0&&16-c<a.storage&&(n+=16-c),t.__data=new Float32Array(a.storage/Float32Array.BYTES_PER_ELEMENT),t.__offset=n,n+=a.storage}}}let r=n%16;return r>0&&(n+=16-r),e.__size=n,e.__cache={},this}function h(e){let t={boundary:0,storage:0};return typeof e==`number`||typeof e==`boolean`?(t.boundary=4,t.storage=4):e.isVector2?(t.boundary=8,t.storage=8):e.isVector3||e.isColor?(t.boundary=16,t.storage=12):e.isVector4?(t.boundary=16,t.storage=16):e.isMatrix3?(t.boundary=48,t.storage=48):e.isMatrix4?(t.boundary=64,t.storage=64):e.isTexture?console.warn(`THREE.WebGLRenderer: Texture samplers can not be part of an uniforms group.`):console.warn(`THREE.WebGLRenderer: Unsupported uniform value type.`,e),t}function g(t){let n=t.target;n.removeEventListener(`dispose`,g);let r=o.indexOf(n.__bindingPointIndex);o.splice(r,1),e.deleteBuffer(i[n.id]),delete i[n.id],delete a[n.id]}function _(){for(let t in i)e.deleteBuffer(i[t]);o=[],i={},a={}}return{bind:c,update:l,dispose:_}}var Hf=class{constructor(e={}){let{canvas:t=Io(),context:n=null,depth:r=!0,stencil:i=!1,alpha:a=!1,antialias:o=!1,premultipliedAlpha:s=!0,preserveDrawingBuffer:c=!1,powerPreference:l=`default`,failIfMajorPerformanceCaveat:u=!1}=e;this.isWebGLRenderer=!0;let d;if(n!==null){if(typeof WebGLRenderingContext<`u`&&n instanceof WebGLRenderingContext)throw Error(`THREE.WebGLRenderer: WebGL 1 is not supported since r163.`);d=n.getContextAttributes().alpha}else d=a;let f=new Uint32Array(4),p=new Int32Array(4),m=null,h=null,g=[],_=[];this.domElement=t,this.debug={checkShaderErrors:!0,onShaderError:null},this.autoClear=!0,this.autoClearColor=!0,this.autoClearDepth=!0,this.autoClearStencil=!0,this.sortObjects=!0,this.clippingPlanes=[],this.localClippingEnabled=!1,this._outputColorSpace=Ja,this.toneMapping=0,this.toneMappingExposure=1;let v=this,y=!1,b=0,x=0,S=null,C=-1,w=null,T=new ts,E=new ts,D=null,O=new K(0),k=0,A=t.width,j=t.height,M=1,N=null,P=null,ee=new ts(0,0,A,j),te=new ts(0,0,A,j),ne=!1,re=new Al,F=!1,ie=!1,ae=new Is,I=new Is,oe=new G,se=new ts,ce={background:null,fog:null,environment:null,overrideMaterial:null,isScene:!0},le=!1;function ue(){return S===null?M:1}let L=n;function de(e,n){return t.getContext(e,n)}try{let e={alpha:!0,depth:r,stencil:i,antialias:o,premultipliedAlpha:s,preserveDrawingBuffer:c,powerPreference:l,failIfMajorPerformanceCaveat:u};if(`setAttribute`in t&&t.setAttribute(`data-engine`,`three.js r169`),t.addEventListener(`webglcontextlost`,Pe,!1),t.addEventListener(`webglcontextrestored`,Fe,!1),t.addEventListener(`webglcontextcreationerror`,Ie,!1),L===null){let t=`webgl2`;if(L=de(t,e),L===null)throw de(t)?Error(`Error creating WebGL context with your selected attributes.`):Error(`Error creating WebGL context.`)}}catch(e){throw console.error(`THREE.WebGLRenderer: `+e.message),e}let fe,R,z,pe,B,V,me,he,ge,_e,ve,ye,be,xe,Se,Ce,we,Te,Ee,De,Oe,ke,Ae,je;function Me(){fe=new fu(L),fe.init(),ke=new kf(L,fe),R=new Vl(L,fe,e,ke),z=new Tf(L),R.reverseDepthBuffer&&z.buffers.depth.setReversed(!0),pe=new hu(L),B=new sf,V=new Of(L,fe,z,B,R,ke,pe),me=new Ul(v),he=new du(v),ge=new Ml(L),Ae=new zl(L,ge),_e=new pu(L,ge,pe,Ae),ve=new _u(L,_e,ge,pe),Ee=new gu(L,R,V),Ce=new Hl(B),ye=new of(v,me,he,fe,R,Ae,Ce),be=new Bf(v,B),xe=new df,Se=new vf(fe),Te=new Rl(v,me,he,z,ve,d,s),we=new Cf(v,ve,R),je=new Vf(L,pe,R,z),De=new Bl(L,fe,pe),Oe=new mu(L,fe,pe),pe.programs=ye.programs,v.capabilities=R,v.extensions=fe,v.properties=B,v.renderLists=xe,v.shadowMap=we,v.state=z,v.info=pe}Me();let Ne=new Lf(v,L);this.xr=Ne,this.getContext=function(){return L},this.getContextAttributes=function(){return L.getContextAttributes()},this.forceContextLoss=function(){let e=fe.get(`WEBGL_lose_context`);e&&e.loseContext()},this.forceContextRestore=function(){let e=fe.get(`WEBGL_lose_context`);e&&e.restoreContext()},this.getPixelRatio=function(){return M},this.setPixelRatio=function(e){e!==void 0&&(M=e,this.setSize(A,j,!1))},this.getSize=function(e){return e.set(A,j)},this.setSize=function(e,n,r=!0){Ne.isPresenting?console.warn(`THREE.WebGLRenderer: Can't change size while VR device is presenting.`):(A=e,j=n,t.width=Math.floor(e*M),t.height=Math.floor(n*M),r===!0&&(t.style.width=e+`px`,t.style.height=n+`px`),this.setViewport(0,0,e,n))},this.getDrawingBufferSize=function(e){return e.set(A*M,j*M).floor()},this.setDrawingBufferSize=function(e,n,r){A=e,j=n,M=r,t.width=Math.floor(e*r),t.height=Math.floor(n*r),this.setViewport(0,0,e,n)},this.getCurrentViewport=function(e){return e.copy(T)},this.getViewport=function(e){return e.copy(ee)},this.setViewport=function(e,t,n,r){e.isVector4?ee.set(e.x,e.y,e.z,e.w):ee.set(e,t,n,r),z.viewport(T.copy(ee).multiplyScalar(M).round())},this.getScissor=function(e){return e.copy(te)},this.setScissor=function(e,t,n,r){e.isVector4?te.set(e.x,e.y,e.z,e.w):te.set(e,t,n,r),z.scissor(E.copy(te).multiplyScalar(M).round())},this.getScissorTest=function(){return ne},this.setScissorTest=function(e){z.setScissorTest(ne=e)},this.setOpaqueSort=function(e){N=e},this.setTransparentSort=function(e){P=e},this.getClearColor=function(e){return e.copy(Te.getClearColor())},this.setClearColor=function(){Te.setClearColor.apply(Te,arguments)},this.getClearAlpha=function(){return Te.getClearAlpha()},this.setClearAlpha=function(){Te.setClearAlpha.apply(Te,arguments)},this.clear=function(e=!0,t=!0,n=!0){let r=0;if(e){let e=!1;if(S!==null){let t=S.texture.format;e=t===1033||t===1031||t===1029}if(e){let e=S.texture.type,t=e===1009||e===1014||e===1012||e===1020||e===1017||e===1018,n=Te.getClearColor(),r=Te.getClearAlpha(),i=n.r,a=n.g,o=n.b;t?(f[0]=i,f[1]=a,f[2]=o,f[3]=r,L.clearBufferuiv(L.COLOR,0,f)):(p[0]=i,p[1]=a,p[2]=o,p[3]=r,L.clearBufferiv(L.COLOR,0,p))}else r|=L.COLOR_BUFFER_BIT}t&&(r|=L.DEPTH_BUFFER_BIT,L.clearDepth(+!this.capabilities.reverseDepthBuffer)),n&&(r|=L.STENCIL_BUFFER_BIT,this.state.buffers.stencil.setMask(4294967295)),L.clear(r)},this.clearColor=function(){this.clear(!0,!1,!1)},this.clearDepth=function(){this.clear(!1,!0,!1)},this.clearStencil=function(){this.clear(!1,!1,!0)},this.dispose=function(){t.removeEventListener(`webglcontextlost`,Pe,!1),t.removeEventListener(`webglcontextrestored`,Fe,!1),t.removeEventListener(`webglcontextcreationerror`,Ie,!1),xe.dispose(),Se.dispose(),B.dispose(),me.dispose(),he.dispose(),ve.dispose(),Ae.dispose(),je.dispose(),ye.dispose(),Ne.dispose(),Ne.removeEventListener(`sessionstart`,Ue),Ne.removeEventListener(`sessionend`,We),Ge.stop()};function Pe(e){e.preventDefault(),console.log(`THREE.WebGLRenderer: Context Lost.`),y=!0}function Fe(){console.log(`THREE.WebGLRenderer: Context Restored.`),y=!1;let e=pe.autoReset,t=we.enabled,n=we.autoUpdate,r=we.needsUpdate,i=we.type;Me(),pe.autoReset=e,we.enabled=t,we.autoUpdate=n,we.needsUpdate=r,we.type=i}function Ie(e){console.error(`THREE.WebGLRenderer: A WebGL context could not be created. Reason: `,e.statusMessage)}function Le(e){let t=e.target;t.removeEventListener(`dispose`,Le),Re(t)}function Re(e){ze(e),B.remove(e)}function ze(e){let t=B.get(e).programs;t!==void 0&&(t.forEach(function(e){ye.releaseProgram(e)}),e.isShaderMaterial&&ye.releaseShaderCache(e))}this.renderBufferDirect=function(e,t,n,r,i,a){t===null&&(t=ce);let o=i.isMesh&&i.matrixWorld.determinant()<0,s=et(e,t,n,r,i);z.setMaterial(r,o);let c=n.index,l=1;if(r.wireframe===!0){if(c=_e.getWireframeAttribute(n),c===void 0)return;l=2}let u=n.drawRange,d=n.attributes.position,f=u.start*l,p=(u.start+u.count)*l;a!==null&&(f=Math.max(f,a.start*l),p=Math.min(p,(a.start+a.count)*l)),c===null?d!=null&&(f=Math.max(f,0),p=Math.min(p,d.count)):(f=Math.max(f,0),p=Math.min(p,c.count));let m=p-f;if(m<0||m===1/0)return;Ae.setup(i,r,s,n,c);let h,g=De;if(c!==null&&(h=ge.get(c),g=Oe,g.setIndex(h)),i.isMesh)r.wireframe===!0?(z.setLineWidth(r.wireframeLinewidth*ue()),g.setMode(L.LINES)):g.setMode(L.TRIANGLES);else if(i.isLine){let e=r.linewidth;e===void 0&&(e=1),z.setLineWidth(e*ue()),i.isLineSegments?g.setMode(L.LINES):i.isLineLoop?g.setMode(L.LINE_LOOP):g.setMode(L.LINE_STRIP)}else i.isPoints?g.setMode(L.POINTS):i.isSprite&&g.setMode(L.TRIANGLES);if(i.isBatchedMesh){if(i._multiDrawInstances!==null)g.renderMultiDrawInstances(i._multiDrawStarts,i._multiDrawCounts,i._multiDrawCount,i._multiDrawInstances);else if(fe.get(`WEBGL_multi_draw`))g.renderMultiDraw(i._multiDrawStarts,i._multiDrawCounts,i._multiDrawCount);else{let e=i._multiDrawStarts,t=i._multiDrawCounts,n=i._multiDrawCount,a=c?ge.get(c).bytesPerElement:1,o=B.get(r).currentProgram.getUniforms();for(let r=0;r<n;r++)o.setValue(L,`_gl_DrawID`,r),g.render(e[r]/a,t[r])}}else if(i.isInstancedMesh)g.renderInstances(f,m,i.count);else if(n.isInstancedBufferGeometry){let e=n._maxInstanceCount===void 0?1/0:n._maxInstanceCount,t=Math.min(n.instanceCount,e);g.renderInstances(f,m,t)}else g.render(f,m)};function Be(e,t,n){e.transparent===!0&&e.side===2&&e.forceSinglePass===!1?(e.side=1,e.needsUpdate=!0,Ze(e,t,n),e.side=0,e.needsUpdate=!0,Ze(e,t,n),e.side=2):Ze(e,t,n)}this.compile=function(e,t,n=null){n===null&&(n=e),h=Se.get(n),h.init(t),_.push(h),n.traverseVisible(function(e){e.isLight&&e.layers.test(t.layers)&&(h.pushLight(e),e.castShadow&&h.pushShadow(e))}),e!==n&&e.traverseVisible(function(e){e.isLight&&e.layers.test(t.layers)&&(h.pushLight(e),e.castShadow&&h.pushShadow(e))}),h.setupLights();let r=new Set;return e.traverse(function(e){if(!(e.isMesh||e.isPoints||e.isLine||e.isSprite))return;let t=e.material;if(t){if(Array.isArray(t))for(let i=0;i<t.length;i++){let a=t[i];Be(a,n,e),r.add(a)}else Be(t,n,e),r.add(t)}}),_.pop(),h=null,r},this.compileAsync=function(e,t,n=null){let r=this.compile(e,t,n);return new Promise(t=>{function n(){r.forEach(function(e){B.get(e).currentProgram.isReady()&&r.delete(e)}),r.size===0?t(e):setTimeout(n,10)}fe.get(`KHR_parallel_shader_compile`)===null?setTimeout(n,10):n()})};let Ve=null;function He(e){Ve&&Ve(e)}function Ue(){Ge.stop()}function We(){Ge.start()}let Ge=new jl;Ge.setAnimationLoop(He),typeof self<`u`&&Ge.setContext(self),this.setAnimationLoop=function(e){Ve=e,Ne.setAnimationLoop(e),e===null?Ge.stop():Ge.start()},Ne.addEventListener(`sessionstart`,Ue),Ne.addEventListener(`sessionend`,We),this.render=function(e,t){if(t!==void 0&&t.isCamera!==!0){console.error(`THREE.WebGLRenderer.render: camera is not an instance of THREE.Camera.`);return}if(y===!0)return;if(e.matrixWorldAutoUpdate===!0&&e.updateMatrixWorld(),t.parent===null&&t.matrixWorldAutoUpdate===!0&&t.updateMatrixWorld(),Ne.enabled===!0&&Ne.isPresenting===!0&&(Ne.cameraAutoUpdate===!0&&Ne.updateCamera(t),t=Ne.getCamera()),e.isScene===!0&&e.onBeforeRender(v,e,t,S),h=Se.get(e,_.length),h.init(t),_.push(h),I.multiplyMatrices(t.projectionMatrix,t.matrixWorldInverse),re.setFromProjectionMatrix(I),ie=this.localClippingEnabled,F=Ce.init(this.clippingPlanes,ie),m=xe.get(e,g.length),m.init(),g.push(m),Ne.enabled===!0&&Ne.isPresenting===!0){let e=v.xr.getDepthSensingMesh();e!==null&&Ke(e,t,-1/0,v.sortObjects)}Ke(e,t,0,v.sortObjects),m.finish(),v.sortObjects===!0&&m.sort(N,P),le=Ne.enabled===!1||Ne.isPresenting===!1||Ne.hasDepthSensing()===!1,le&&Te.addToRenderList(m,e),this.info.render.frame++,F===!0&&Ce.beginShadows();let n=h.state.shadowsArray;we.render(n,e,t),F===!0&&Ce.endShadows(),this.info.autoReset===!0&&this.info.reset();let r=m.opaque,i=m.transmissive;if(h.setupLights(),t.isArrayCamera){let n=t.cameras;if(i.length>0)for(let t=0,a=n.length;t<a;t++){let a=n[t];Je(r,i,e,a)}le&&Te.render(e);for(let t=0,r=n.length;t<r;t++){let r=n[t];qe(m,e,r,r.viewport)}}else i.length>0&&Je(r,i,e,t),le&&Te.render(e),qe(m,e,t);S!==null&&(V.updateMultisampleRenderTarget(S),V.updateRenderTargetMipmap(S)),e.isScene===!0&&e.onAfterRender(v,e,t),Ae.resetDefaultState(),C=-1,w=null,_.pop(),_.length>0?(h=_[_.length-1],F===!0&&Ce.setGlobalState(v.clippingPlanes,h.state.camera)):h=null,g.pop(),m=g.length>0?g[g.length-1]:null};function Ke(e,t,n,r){if(e.visible===!1)return;if(e.layers.test(t.layers)){if(e.isGroup)n=e.renderOrder;else if(e.isLOD)e.autoUpdate===!0&&e.update(t);else if(e.isLight)h.pushLight(e),e.castShadow&&h.pushShadow(e);else if(e.isSprite){if(!e.frustumCulled||re.intersectsSprite(e)){r&&se.setFromMatrixPosition(e.matrixWorld).applyMatrix4(I);let t=ve.update(e),i=e.material;i.visible&&m.push(e,t,i,n,se.z,null)}}else if((e.isMesh||e.isLine||e.isPoints)&&(!e.frustumCulled||re.intersectsObject(e))){let t=ve.update(e),i=e.material;if(r&&(e.boundingSphere===void 0?(t.boundingSphere===null&&t.computeBoundingSphere(),se.copy(t.boundingSphere.center)):(e.boundingSphere===null&&e.computeBoundingSphere(),se.copy(e.boundingSphere.center)),se.applyMatrix4(e.matrixWorld).applyMatrix4(I)),Array.isArray(i)){let r=t.groups;for(let a=0,o=r.length;a<o;a++){let o=r[a],s=i[o.materialIndex];s&&s.visible&&m.push(e,t,s,n,se.z,o)}}else i.visible&&m.push(e,t,i,n,se.z,null)}}let i=e.children;for(let e=0,a=i.length;e<a;e++)Ke(i[e],t,n,r)}function qe(e,t,n,r){let i=e.opaque,a=e.transmissive,o=e.transparent;h.setupLightsView(n),F===!0&&Ce.setGlobalState(v.clippingPlanes,n),r&&z.viewport(T.copy(r)),i.length>0&&Ye(i,t,n),a.length>0&&Ye(a,t,n),o.length>0&&Ye(o,t,n),z.buffers.depth.setTest(!0),z.buffers.depth.setMask(!0),z.buffers.color.setMask(!0),z.setPolygonOffset(!1)}function Je(e,t,n,r){if((n.isScene===!0?n.overrideMaterial:null)!==null)return;h.state.transmissionRenderTarget[r.id]===void 0&&(h.state.transmissionRenderTarget[r.id]=new rs(1,1,{generateMipmaps:!0,type:fe.has(`EXT_color_buffer_half_float`)||fe.has(`EXT_color_buffer_float`)?Gi:Ri,minFilter:Li,samples:4,stencilBuffer:i,resolveDepthBuffer:!1,resolveStencilBuffer:!1,colorSpace:W.workingColorSpace}));let a=h.state.transmissionRenderTarget[r.id],o=r.viewport||T;a.setSize(o.z,o.w);let s=v.getRenderTarget();v.setRenderTarget(a),v.getClearColor(O),k=v.getClearAlpha(),k<1&&v.setClearColor(16777215,.5),v.clear(),le&&Te.render(n);let c=v.toneMapping;v.toneMapping=0;let l=r.viewport;if(r.viewport!==void 0&&(r.viewport=void 0),h.setupLightsView(r),F===!0&&Ce.setGlobalState(v.clippingPlanes,r),Ye(e,n,r),V.updateMultisampleRenderTarget(a),V.updateRenderTargetMipmap(a),fe.has(`WEBGL_multisampled_render_to_texture`)===!1){let e=!1;for(let i=0,a=t.length;i<a;i++){let a=t[i],o=a.object,s=a.geometry,c=a.material,l=a.group;if(c.side===2&&o.layers.test(r.layers)){let t=c.side;c.side=1,c.needsUpdate=!0,Xe(o,n,r,s,c,l),c.side=t,c.needsUpdate=!0,e=!0}}e===!0&&(V.updateMultisampleRenderTarget(a),V.updateRenderTargetMipmap(a))}v.setRenderTarget(s),v.setClearColor(O,k),l!==void 0&&(r.viewport=l),v.toneMapping=c}function Ye(e,t,n){let r=t.isScene===!0?t.overrideMaterial:null;for(let i=0,a=e.length;i<a;i++){let a=e[i],o=a.object,s=a.geometry,c=r===null?a.material:r,l=a.group;o.layers.test(n.layers)&&Xe(o,t,n,s,c,l)}}function Xe(e,t,n,r,i,a){e.onBeforeRender(v,t,n,r,i,a),e.modelViewMatrix.multiplyMatrices(n.matrixWorldInverse,e.matrixWorld),e.normalMatrix.getNormalMatrix(e.modelViewMatrix),i.onBeforeRender(v,t,n,r,e,a),i.transparent===!0&&i.side===2&&i.forceSinglePass===!1?(i.side=1,i.needsUpdate=!0,v.renderBufferDirect(n,t,r,i,e,a),i.side=0,i.needsUpdate=!0,v.renderBufferDirect(n,t,r,i,e,a),i.side=2):v.renderBufferDirect(n,t,r,i,e,a),e.onAfterRender(v,t,n,r,i,a)}function Ze(e,t,n){t.isScene!==!0&&(t=ce);let r=B.get(e),i=h.state.lights,a=h.state.shadowsArray,o=i.state.version,s=ye.getParameters(e,i.state,a,t,n),c=ye.getProgramCacheKey(s),l=r.programs;r.environment=e.isMeshStandardMaterial?t.environment:null,r.fog=t.fog,r.envMap=(e.isMeshStandardMaterial?he:me).get(e.envMap||r.environment),r.envMapRotation=r.environment!==null&&e.envMap===null?t.environmentRotation:e.envMapRotation,l===void 0&&(e.addEventListener(`dispose`,Le),l=new Map,r.programs=l);let u=l.get(c);if(u!==void 0){if(r.currentProgram===u&&r.lightsStateVersion===o)return $e(e,s),u}else s.uniforms=ye.getUniforms(e),e.onBeforeCompile(s,v),u=ye.acquireProgram(s,c),l.set(c,u),r.uniforms=s.uniforms;let d=r.uniforms;return(!e.isShaderMaterial&&!e.isRawShaderMaterial||e.clipping===!0)&&(d.clippingPlanes=Ce.uniform),$e(e,s),r.needsLights=nt(e),r.lightsStateVersion=o,r.needsLights&&(d.ambientLightColor.value=i.state.ambient,d.lightProbe.value=i.state.probe,d.directionalLights.value=i.state.directional,d.directionalLightShadows.value=i.state.directionalShadow,d.spotLights.value=i.state.spot,d.spotLightShadows.value=i.state.spotShadow,d.rectAreaLights.value=i.state.rectArea,d.ltc_1.value=i.state.rectAreaLTC1,d.ltc_2.value=i.state.rectAreaLTC2,d.pointLights.value=i.state.point,d.pointLightShadows.value=i.state.pointShadow,d.hemisphereLights.value=i.state.hemi,d.directionalShadowMap.value=i.state.directionalShadowMap,d.directionalShadowMatrix.value=i.state.directionalShadowMatrix,d.spotShadowMap.value=i.state.spotShadowMap,d.spotLightMatrix.value=i.state.spotLightMatrix,d.spotLightMap.value=i.state.spotLightMap,d.pointShadowMap.value=i.state.pointShadowMap,d.pointShadowMatrix.value=i.state.pointShadowMatrix),r.currentProgram=u,r.uniformsList=null,u}function Qe(e){if(e.uniformsList===null){let t=e.currentProgram.getUniforms();e.uniformsList=Td.seqWithValue(t.seq,e.uniforms)}return e.uniformsList}function $e(e,t){let n=B.get(e);n.outputColorSpace=t.outputColorSpace,n.batching=t.batching,n.batchingColor=t.batchingColor,n.instancing=t.instancing,n.instancingColor=t.instancingColor,n.instancingMorph=t.instancingMorph,n.skinning=t.skinning,n.morphTargets=t.morphTargets,n.morphNormals=t.morphNormals,n.morphColors=t.morphColors,n.morphTargetsCount=t.morphTargetsCount,n.numClippingPlanes=t.numClippingPlanes,n.numIntersection=t.numClipIntersection,n.vertexAlphas=t.vertexAlphas,n.vertexTangents=t.vertexTangents,n.toneMapping=t.toneMapping}function et(e,t,n,r,i){t.isScene!==!0&&(t=ce),V.resetTextureUnits();let a=t.fog,o=r.isMeshStandardMaterial?t.environment:null,s=S===null?v.outputColorSpace:S.isXRRenderTarget===!0?S.texture.colorSpace:Ya,c=(r.isMeshStandardMaterial?he:me).get(r.envMap||o),l=r.vertexColors===!0&&!!n.attributes.color&&n.attributes.color.itemSize===4,u=!!n.attributes.tangent&&(!!r.normalMap||r.anisotropy>0),d=!!n.morphAttributes.position,f=!!n.morphAttributes.normal,p=!!n.morphAttributes.color,m=0;r.toneMapped&&(S===null||S.isXRRenderTarget===!0)&&(m=v.toneMapping);let g=n.morphAttributes.position||n.morphAttributes.normal||n.morphAttributes.color,_=g===void 0?0:g.length,y=B.get(r),b=h.state.lights;if(F===!0&&(ie===!0||e!==w)){let t=e===w&&r.id===C;Ce.setState(r,e,t)}let x=!1;r.version===y.__version?y.needsLights&&y.lightsStateVersion!==b.state.version?x=!0:y.outputColorSpace===s?i.isBatchedMesh&&y.batching===!1||!i.isBatchedMesh&&y.batching===!0||i.isBatchedMesh&&y.batchingColor===!0&&i.colorTexture===null||i.isBatchedMesh&&y.batchingColor===!1&&i.colorTexture!==null||i.isInstancedMesh&&y.instancing===!1||!i.isInstancedMesh&&y.instancing===!0||i.isSkinnedMesh&&y.skinning===!1||!i.isSkinnedMesh&&y.skinning===!0||i.isInstancedMesh&&y.instancingColor===!0&&i.instanceColor===null||i.isInstancedMesh&&y.instancingColor===!1&&i.instanceColor!==null||i.isInstancedMesh&&y.instancingMorph===!0&&i.morphTexture===null||i.isInstancedMesh&&y.instancingMorph===!1&&i.morphTexture!==null?x=!0:y.envMap===c?r.fog===!0&&y.fog!==a||y.numClippingPlanes!==void 0&&(y.numClippingPlanes!==Ce.numPlanes||y.numIntersection!==Ce.numIntersection)?x=!0:y.vertexAlphas===l&&y.vertexTangents===u&&y.morphTargets===d&&y.morphNormals===f&&y.morphColors===p&&y.toneMapping===m?y.morphTargetsCount!==_&&(x=!0):x=!0:x=!0:x=!0:(x=!0,y.__version=r.version);let T=y.currentProgram;x===!0&&(T=Ze(r,t,i));let E=!1,D=!1,O=!1,k=T.getUniforms(),A=y.uniforms;if(z.useProgram(T.program)&&(E=!0,D=!0,O=!0),r.id!==C&&(C=r.id,D=!0),E||w!==e){R.reverseDepthBuffer?(ae.copy(e.projectionMatrix),Bo(ae),Vo(ae),k.setValue(L,`projectionMatrix`,ae)):k.setValue(L,`projectionMatrix`,e.projectionMatrix),k.setValue(L,`viewMatrix`,e.matrixWorldInverse);let t=k.map.cameraPosition;t!==void 0&&t.setValue(L,oe.setFromMatrixPosition(e.matrixWorld)),R.logarithmicDepthBuffer&&k.setValue(L,`logDepthBufFC`,2/(Math.log(e.far+1)/Math.LN2)),(r.isMeshPhongMaterial||r.isMeshToonMaterial||r.isMeshLambertMaterial||r.isMeshBasicMaterial||r.isMeshStandardMaterial||r.isShaderMaterial)&&k.setValue(L,`isOrthographic`,e.isOrthographicCamera===!0),w!==e&&(w=e,D=!0,O=!0)}if(i.isSkinnedMesh){k.setOptional(L,i,`bindMatrix`),k.setOptional(L,i,`bindMatrixInverse`);let e=i.skeleton;e&&(e.boneTexture===null&&e.computeBoneTexture(),k.setValue(L,`boneTexture`,e.boneTexture,V))}i.isBatchedMesh&&(k.setOptional(L,i,`batchingTexture`),k.setValue(L,`batchingTexture`,i._matricesTexture,V),k.setOptional(L,i,`batchingIdTexture`),k.setValue(L,`batchingIdTexture`,i._indirectTexture,V),k.setOptional(L,i,`batchingColorTexture`),i._colorsTexture!==null&&k.setValue(L,`batchingColorTexture`,i._colorsTexture,V));let N=n.morphAttributes;if((N.position!==void 0||N.normal!==void 0||N.color!==void 0)&&Ee.update(i,n,T),(D||y.receiveShadow!==i.receiveShadow)&&(y.receiveShadow=i.receiveShadow,k.setValue(L,`receiveShadow`,i.receiveShadow)),r.isMeshGouraudMaterial&&r.envMap!==null&&(A.envMap.value=c,A.flipEnvMap.value=c.isCubeTexture&&c.isRenderTargetTexture===!1?-1:1),r.isMeshStandardMaterial&&r.envMap===null&&t.environment!==null&&(A.envMapIntensity.value=t.environmentIntensity),D&&(k.setValue(L,`toneMappingExposure`,v.toneMappingExposure),y.needsLights&&tt(A,O),a&&r.fog===!0&&be.refreshFogUniforms(A,a),be.refreshMaterialUniforms(A,r,M,j,h.state.transmissionRenderTarget[e.id]),Td.upload(L,Qe(y),A,V)),r.isShaderMaterial&&r.uniformsNeedUpdate===!0&&(Td.upload(L,Qe(y),A,V),r.uniformsNeedUpdate=!1),r.isSpriteMaterial&&k.setValue(L,`center`,i.center),k.setValue(L,`modelViewMatrix`,i.modelViewMatrix),k.setValue(L,`normalMatrix`,i.normalMatrix),k.setValue(L,`modelMatrix`,i.matrixWorld),r.isShaderMaterial||r.isRawShaderMaterial){let e=r.uniformsGroups;for(let t=0,n=e.length;t<n;t++){let n=e[t];je.update(n,T),je.bind(n,T)}}return T}function tt(e,t){e.ambientLightColor.needsUpdate=t,e.lightProbe.needsUpdate=t,e.directionalLights.needsUpdate=t,e.directionalLightShadows.needsUpdate=t,e.pointLights.needsUpdate=t,e.pointLightShadows.needsUpdate=t,e.spotLights.needsUpdate=t,e.spotLightShadows.needsUpdate=t,e.rectAreaLights.needsUpdate=t,e.hemisphereLights.needsUpdate=t}function nt(e){return e.isMeshLambertMaterial||e.isMeshToonMaterial||e.isMeshPhongMaterial||e.isMeshStandardMaterial||e.isShadowMaterial||e.isShaderMaterial&&e.lights===!0}this.getActiveCubeFace=function(){return b},this.getActiveMipmapLevel=function(){return x},this.getRenderTarget=function(){return S},this.setRenderTargetTextures=function(e,t,n){B.get(e.texture).__webglTexture=t,B.get(e.depthTexture).__webglTexture=n;let r=B.get(e);r.__hasExternalTextures=!0,r.__autoAllocateDepthBuffer=n===void 0,r.__autoAllocateDepthBuffer||fe.has(`WEBGL_multisampled_render_to_texture`)===!0&&(console.warn(`THREE.WebGLRenderer: Render-to-texture extension was disabled because an external texture was provided`),r.__useRenderToTexture=!1)},this.setRenderTargetFramebuffer=function(e,t){let n=B.get(e);n.__webglFramebuffer=t,n.__useDefaultFramebuffer=t===void 0},this.setRenderTarget=function(e,t=0,n=0){S=e,b=t,x=n;let r=!0,i=null,a=!1,o=!1;if(e){let s=B.get(e);if(s.__useDefaultFramebuffer!==void 0)z.bindFramebuffer(L.FRAMEBUFFER,null),r=!1;else if(s.__webglFramebuffer===void 0)V.setupRenderTarget(e);else if(s.__hasExternalTextures)V.rebindTextures(e,B.get(e.texture).__webglTexture,B.get(e.depthTexture).__webglTexture);else if(e.depthBuffer){let t=e.depthTexture;if(s.__boundDepthTexture!==t){if(t!==null&&B.has(t)&&(e.width!==t.image.width||e.height!==t.image.height))throw Error(`WebGLRenderTarget: Attached DepthTexture is initialized to the incorrect size.`);V.setupDepthRenderbuffer(e)}}let c=e.texture;(c.isData3DTexture||c.isDataArrayTexture||c.isCompressedArrayTexture)&&(o=!0);let l=B.get(e).__webglFramebuffer;e.isWebGLCubeRenderTarget?(i=Array.isArray(l[t])?l[t][n]:l[t],a=!0):i=e.samples>0&&V.useMultisampledRTT(e)===!1?B.get(e).__webglMultisampledFramebuffer:Array.isArray(l)?l[n]:l,T.copy(e.viewport),E.copy(e.scissor),D=e.scissorTest}else T.copy(ee).multiplyScalar(M).floor(),E.copy(te).multiplyScalar(M).floor(),D=ne;if(z.bindFramebuffer(L.FRAMEBUFFER,i)&&r&&z.drawBuffers(e,i),z.viewport(T),z.scissor(E),z.setScissorTest(D),a){let r=B.get(e.texture);L.framebufferTexture2D(L.FRAMEBUFFER,L.COLOR_ATTACHMENT0,L.TEXTURE_CUBE_MAP_POSITIVE_X+t,r.__webglTexture,n)}else if(o){let r=B.get(e.texture),i=t||0;L.framebufferTextureLayer(L.FRAMEBUFFER,L.COLOR_ATTACHMENT0,r.__webglTexture,n||0,i)}C=-1},this.readRenderTargetPixels=function(e,t,n,r,i,a,o){if(!(e&&e.isWebGLRenderTarget)){console.error(`THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not THREE.WebGLRenderTarget.`);return}let s=B.get(e).__webglFramebuffer;if(e.isWebGLCubeRenderTarget&&o!==void 0&&(s=s[o]),s){z.bindFramebuffer(L.FRAMEBUFFER,s);try{let o=e.texture,s=o.format,c=o.type;if(!R.textureFormatReadable(s)){console.error(`THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not in RGBA or implementation defined format.`);return}if(!R.textureTypeReadable(c)){console.error(`THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not in UnsignedByteType or implementation defined type.`);return}t>=0&&t<=e.width-r&&n>=0&&n<=e.height-i&&L.readPixels(t,n,r,i,ke.convert(s),ke.convert(c),a)}finally{let e=S===null?null:B.get(S).__webglFramebuffer;z.bindFramebuffer(L.FRAMEBUFFER,e)}}},this.readRenderTargetPixelsAsync=async function(e,t,n,r,i,a,o){if(!(e&&e.isWebGLRenderTarget))throw Error(`THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not THREE.WebGLRenderTarget.`);let s=B.get(e).__webglFramebuffer;if(e.isWebGLCubeRenderTarget&&o!==void 0&&(s=s[o]),s){let o=e.texture,c=o.format,l=o.type;if(!R.textureFormatReadable(c))throw Error(`THREE.WebGLRenderer.readRenderTargetPixelsAsync: renderTarget is not in RGBA or implementation defined format.`);if(!R.textureTypeReadable(l))throw Error(`THREE.WebGLRenderer.readRenderTargetPixelsAsync: renderTarget is not in UnsignedByteType or implementation defined type.`);if(t>=0&&t<=e.width-r&&n>=0&&n<=e.height-i){z.bindFramebuffer(L.FRAMEBUFFER,s);let e=L.createBuffer();L.bindBuffer(L.PIXEL_PACK_BUFFER,e),L.bufferData(L.PIXEL_PACK_BUFFER,a.byteLength,L.STREAM_READ),L.readPixels(t,n,r,i,ke.convert(c),ke.convert(l),0);let o=S===null?null:B.get(S).__webglFramebuffer;z.bindFramebuffer(L.FRAMEBUFFER,o);let u=L.fenceSync(L.SYNC_GPU_COMMANDS_COMPLETE,0);return L.flush(),await zo(L,u,4),L.bindBuffer(L.PIXEL_PACK_BUFFER,e),L.getBufferSubData(L.PIXEL_PACK_BUFFER,0,a),L.deleteBuffer(e),L.deleteSync(u),a}throw Error(`THREE.WebGLRenderer.readRenderTargetPixelsAsync: requested read bounds are out of range.`)}},this.copyFramebufferToTexture=function(e,t=null,n=0){e.isTexture!==!0&&(Ro(`WebGLRenderer: copyFramebufferToTexture function signature has changed.`),t=arguments[0]||null,e=arguments[1]);let r=2**-n,i=Math.floor(e.image.width*r),a=Math.floor(e.image.height*r),o=t===null?0:t.x,s=t===null?0:t.y;V.setTexture2D(e,0),L.copyTexSubImage2D(L.TEXTURE_2D,n,0,0,o,s,i,a),z.unbindTexture()},this.copyTextureToTexture=function(e,t,n=null,r=null,i=0){e.isTexture!==!0&&(Ro(`WebGLRenderer: copyTextureToTexture function signature has changed.`),r=arguments[0]||null,e=arguments[1],t=arguments[2],i=arguments[3]||0,n=null);let a,o,s,c,l,u;n===null?(a=e.image.width,o=e.image.height,s=0,c=0):(a=n.max.x-n.min.x,o=n.max.y-n.min.y,s=n.min.x,c=n.min.y),r===null?(l=0,u=0):(l=r.x,u=r.y);let d=ke.convert(t.format),f=ke.convert(t.type);V.setTexture2D(t,0),L.pixelStorei(L.UNPACK_FLIP_Y_WEBGL,t.flipY),L.pixelStorei(L.UNPACK_PREMULTIPLY_ALPHA_WEBGL,t.premultiplyAlpha),L.pixelStorei(L.UNPACK_ALIGNMENT,t.unpackAlignment);let p=L.getParameter(L.UNPACK_ROW_LENGTH),m=L.getParameter(L.UNPACK_IMAGE_HEIGHT),h=L.getParameter(L.UNPACK_SKIP_PIXELS),g=L.getParameter(L.UNPACK_SKIP_ROWS),_=L.getParameter(L.UNPACK_SKIP_IMAGES),v=e.isCompressedTexture?e.mipmaps[i]:e.image;L.pixelStorei(L.UNPACK_ROW_LENGTH,v.width),L.pixelStorei(L.UNPACK_IMAGE_HEIGHT,v.height),L.pixelStorei(L.UNPACK_SKIP_PIXELS,s),L.pixelStorei(L.UNPACK_SKIP_ROWS,c),e.isDataTexture?L.texSubImage2D(L.TEXTURE_2D,i,l,u,a,o,d,f,v.data):e.isCompressedTexture?L.compressedTexSubImage2D(L.TEXTURE_2D,i,l,u,v.width,v.height,d,v.data):L.texSubImage2D(L.TEXTURE_2D,i,l,u,a,o,d,f,v),L.pixelStorei(L.UNPACK_ROW_LENGTH,p),L.pixelStorei(L.UNPACK_IMAGE_HEIGHT,m),L.pixelStorei(L.UNPACK_SKIP_PIXELS,h),L.pixelStorei(L.UNPACK_SKIP_ROWS,g),L.pixelStorei(L.UNPACK_SKIP_IMAGES,_),i===0&&t.generateMipmaps&&L.generateMipmap(L.TEXTURE_2D),z.unbindTexture()},this.copyTextureToTexture3D=function(e,t,n=null,r=null,i=0){e.isTexture!==!0&&(Ro(`WebGLRenderer: copyTextureToTexture3D function signature has changed.`),n=arguments[0]||null,r=arguments[1]||null,e=arguments[2],t=arguments[3],i=arguments[4]||0);let a,o,s,c,l,u,d,f,p,m=e.isCompressedTexture?e.mipmaps[i]:e.image;n===null?(a=m.width,o=m.height,s=m.depth,c=0,l=0,u=0):(a=n.max.x-n.min.x,o=n.max.y-n.min.y,s=n.max.z-n.min.z,c=n.min.x,l=n.min.y,u=n.min.z),r===null?(d=0,f=0,p=0):(d=r.x,f=r.y,p=r.z);let h=ke.convert(t.format),g=ke.convert(t.type),_;if(t.isData3DTexture)V.setTexture3D(t,0),_=L.TEXTURE_3D;else if(t.isDataArrayTexture||t.isCompressedArrayTexture)V.setTexture2DArray(t,0),_=L.TEXTURE_2D_ARRAY;else{console.warn(`THREE.WebGLRenderer.copyTextureToTexture3D: only supports THREE.DataTexture3D and THREE.DataTexture2DArray.`);return}L.pixelStorei(L.UNPACK_FLIP_Y_WEBGL,t.flipY),L.pixelStorei(L.UNPACK_PREMULTIPLY_ALPHA_WEBGL,t.premultiplyAlpha),L.pixelStorei(L.UNPACK_ALIGNMENT,t.unpackAlignment);let v=L.getParameter(L.UNPACK_ROW_LENGTH),y=L.getParameter(L.UNPACK_IMAGE_HEIGHT),b=L.getParameter(L.UNPACK_SKIP_PIXELS),x=L.getParameter(L.UNPACK_SKIP_ROWS),S=L.getParameter(L.UNPACK_SKIP_IMAGES);L.pixelStorei(L.UNPACK_ROW_LENGTH,m.width),L.pixelStorei(L.UNPACK_IMAGE_HEIGHT,m.height),L.pixelStorei(L.UNPACK_SKIP_PIXELS,c),L.pixelStorei(L.UNPACK_SKIP_ROWS,l),L.pixelStorei(L.UNPACK_SKIP_IMAGES,u),e.isDataTexture||e.isData3DTexture?L.texSubImage3D(_,i,d,f,p,a,o,s,h,g,m.data):t.isCompressedArrayTexture?L.compressedTexSubImage3D(_,i,d,f,p,a,o,s,h,m.data):L.texSubImage3D(_,i,d,f,p,a,o,s,h,g,m),L.pixelStorei(L.UNPACK_ROW_LENGTH,v),L.pixelStorei(L.UNPACK_IMAGE_HEIGHT,y),L.pixelStorei(L.UNPACK_SKIP_PIXELS,b),L.pixelStorei(L.UNPACK_SKIP_ROWS,x),L.pixelStorei(L.UNPACK_SKIP_IMAGES,S),i===0&&t.generateMipmaps&&L.generateMipmap(_),z.unbindTexture()},this.initRenderTarget=function(e){B.get(e).__webglFramebuffer===void 0&&V.setupRenderTarget(e)},this.initTexture=function(e){e.isCubeTexture?V.setTextureCube(e,0):e.isData3DTexture?V.setTexture3D(e,0):e.isDataArrayTexture||e.isCompressedArrayTexture?V.setTexture2DArray(e,0):V.setTexture2D(e,0),z.unbindTexture()},this.resetState=function(){b=0,x=0,S=null,z.reset(),Ae.reset()},typeof __THREE_DEVTOOLS__<`u`&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent(`observe`,{detail:this}))}get coordinateSystem(){return ro}get outputColorSpace(){return this._outputColorSpace}set outputColorSpace(e){this._outputColorSpace=e;let t=this.getContext();t.drawingBufferColorSpace=e===`display-p3`?`display-p3`:`srgb`,t.unpackColorSpace=W.workingColorSpace===`display-p3-linear`?`display-p3`:`srgb`}},Uf=class extends lc{constructor(){super(),this.isScene=!0,this.type=`Scene`,this.background=null,this.environment=null,this.fog=null,this.backgroundBlurriness=0,this.backgroundIntensity=1,this.backgroundRotation=new Ks,this.environmentIntensity=1,this.environmentRotation=new Ks,this.overrideMaterial=null,typeof __THREE_DEVTOOLS__<`u`&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent(`observe`,{detail:this}))}copy(e,t){return super.copy(e,t),e.background!==null&&(this.background=e.background.clone()),e.environment!==null&&(this.environment=e.environment.clone()),e.fog!==null&&(this.fog=e.fog.clone()),this.backgroundBlurriness=e.backgroundBlurriness,this.backgroundIntensity=e.backgroundIntensity,this.backgroundRotation.copy(e.backgroundRotation),this.environmentIntensity=e.environmentIntensity,this.environmentRotation.copy(e.environmentRotation),e.overrideMaterial!==null&&(this.overrideMaterial=e.overrideMaterial.clone()),this.matrixAutoUpdate=e.matrixAutoUpdate,this}toJSON(e){let t=super.toJSON(e);return this.fog!==null&&(t.object.fog=this.fog.toJSON()),this.backgroundBlurriness>0&&(t.object.backgroundBlurriness=this.backgroundBlurriness),this.backgroundIntensity!==1&&(t.object.backgroundIntensity=this.backgroundIntensity),t.object.backgroundRotation=this.backgroundRotation.toArray(),this.environmentIntensity!==1&&(t.object.environmentIntensity=this.environmentIntensity),t.object.environmentRotation=this.environmentRotation.toArray(),t}},Wf=class extends Ac{constructor(e){super(),this.isLineBasicMaterial=!0,this.type=`LineBasicMaterial`,this.color=new K(16777215),this.map=null,this.linewidth=1,this.linecap=`round`,this.linejoin=`round`,this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.color.copy(e.color),this.map=e.map,this.linewidth=e.linewidth,this.linecap=e.linecap,this.linejoin=e.linejoin,this.fog=e.fog,this}},Gf=new G,Kf=new G,qf=new Is,Jf=new Fs,Yf=new Ds,Xf=new G,Zf=new G,Qf=class extends lc{constructor(e=new Wc,t=new Wf){super(),this.isLine=!0,this.type=`Line`,this.geometry=e,this.material=t,this.updateMorphTargets()}copy(e,t){return super.copy(e,t),this.material=Array.isArray(e.material)?e.material.slice():e.material,this.geometry=e.geometry,this}computeLineDistances(){let e=this.geometry;if(e.index===null){let t=e.attributes.position,n=[0];for(let e=1,r=t.count;e<r;e++)Gf.fromBufferAttribute(t,e-1),Kf.fromBufferAttribute(t,e),n[e]=n[e-1],n[e]+=Gf.distanceTo(Kf);e.setAttribute(`lineDistance`,new q(n,1))}else console.warn(`THREE.Line.computeLineDistances(): Computation only possible with non-indexed BufferGeometry.`);return this}raycast(e,t){let n=this.geometry,r=this.matrixWorld,i=e.params.Line.threshold,a=n.drawRange;if(n.boundingSphere===null&&n.computeBoundingSphere(),Yf.copy(n.boundingSphere),Yf.applyMatrix4(r),Yf.radius+=i,e.ray.intersectsSphere(Yf)===!1)return;qf.copy(r).invert(),Jf.copy(e.ray).applyMatrix4(qf);let o=i/((this.scale.x+this.scale.y+this.scale.z)/3),s=o*o,c=this.isLineSegments?2:1,l=n.index,u=n.attributes.position;if(l!==null){let n=Math.max(0,a.start),r=Math.min(l.count,a.start+a.count);for(let i=n,a=r-1;i<a;i+=c){let n=l.getX(i),r=l.getX(i+1),a=$f(this,e,Jf,s,n,r);a&&t.push(a)}if(this.isLineLoop){let i=l.getX(r-1),a=l.getX(n),o=$f(this,e,Jf,s,i,a);o&&t.push(o)}}else{let n=Math.max(0,a.start),r=Math.min(u.count,a.start+a.count);for(let i=n,a=r-1;i<a;i+=c){let n=$f(this,e,Jf,s,i,i+1);n&&t.push(n)}if(this.isLineLoop){let i=$f(this,e,Jf,s,r-1,n);i&&t.push(i)}}}updateMorphTargets(){let e=this.geometry.morphAttributes,t=Object.keys(e);if(t.length>0){let n=e[t[0]];if(n!==void 0){this.morphTargetInfluences=[],this.morphTargetDictionary={};for(let e=0,t=n.length;e<t;e++){let t=n[e].name||String(e);this.morphTargetInfluences.push(0),this.morphTargetDictionary[t]=e}}}}};function $f(e,t,n,r,i,a){let o=e.geometry.attributes.position;if(Gf.fromBufferAttribute(o,i),Kf.fromBufferAttribute(o,a),n.distanceSqToSegment(Gf,Kf,Xf,Zf)>r)return;Xf.applyMatrix4(e.matrixWorld);let s=t.ray.origin.distanceTo(Xf);if(!(s<t.near||s>t.far))return{distance:s,point:Zf.clone().applyMatrix4(e.matrixWorld),index:i,face:null,faceIndex:null,barycoord:null,object:e}}var ep=new G,tp=new G,np=class extends Qf{constructor(e,t){super(e,t),this.isLineSegments=!0,this.type=`LineSegments`}computeLineDistances(){let e=this.geometry;if(e.index===null){let t=e.attributes.position,n=[];for(let e=0,r=t.count;e<r;e+=2)ep.fromBufferAttribute(t,e),tp.fromBufferAttribute(t,e+1),n[e]=e===0?0:n[e-1],n[e+1]=n[e]+ep.distanceTo(tp);e.setAttribute(`lineDistance`,new q(n,1))}else console.warn(`THREE.LineSegments.computeLineDistances(): Computation only possible with non-indexed BufferGeometry.`);return this}},rp=class{constructor(){this.type=`Curve`,this.arcLengthDivisions=200}getPoint(){return console.warn(`THREE.Curve: .getPoint() not implemented.`),null}getPointAt(e,t){let n=this.getUtoTmapping(e);return this.getPoint(n,t)}getPoints(e=5){let t=[];for(let n=0;n<=e;n++)t.push(this.getPoint(n/e));return t}getSpacedPoints(e=5){let t=[];for(let n=0;n<=e;n++)t.push(this.getPointAt(n/e));return t}getLength(){let e=this.getLengths();return e[e.length-1]}getLengths(e=this.arcLengthDivisions){if(this.cacheArcLengths&&this.cacheArcLengths.length===e+1&&!this.needsUpdate)return this.cacheArcLengths;this.needsUpdate=!1;let t=[],n,r=this.getPoint(0),i=0;t.push(0);for(let a=1;a<=e;a++)n=this.getPoint(a/e),i+=n.distanceTo(r),t.push(i),r=n;return this.cacheArcLengths=t,t}updateArcLengths(){this.needsUpdate=!0,this.getLengths()}getUtoTmapping(e,t){let n=this.getLengths(),r=0,i=n.length,a;a=t||e*n[i-1];let o=0,s=i-1,c;for(;o<=s;)if(r=Math.floor(o+(s-o)/2),c=n[r]-a,c<0)o=r+1;else if(c>0)s=r-1;else{s=r;break}if(r=s,n[r]===a)return r/(i-1);let l=n[r],u=n[r+1]-l,d=(a-l)/u;return(r+d)/(i-1)}getTangent(e,t){let n=1e-4,r=e-n,i=e+n;r<0&&(r=0),i>1&&(i=1);let a=this.getPoint(r),o=this.getPoint(i),s=t||(a.isVector2?new H:new G);return s.copy(o).sub(a).normalize(),s}getTangentAt(e,t){let n=this.getUtoTmapping(e);return this.getTangent(n,t)}computeFrenetFrames(e,t){let n=new G,r=[],i=[],a=[],o=new G,s=new Is;for(let t=0;t<=e;t++){let n=t/e;r[t]=this.getTangentAt(n,new G)}i[0]=new G,a[0]=new G;let c=Number.MAX_VALUE,l=Math.abs(r[0].x),u=Math.abs(r[0].y),d=Math.abs(r[0].z);l<=c&&(c=l,n.set(1,0,0)),u<=c&&(c=u,n.set(0,1,0)),d<=c&&n.set(0,0,1),o.crossVectors(r[0],n).normalize(),i[0].crossVectors(r[0],o),a[0].crossVectors(r[0],i[0]);for(let t=1;t<=e;t++){if(i[t]=i[t-1].clone(),a[t]=a[t-1].clone(),o.crossVectors(r[t-1],r[t]),o.length()>2**-52){o.normalize();let e=Math.acos(uo(r[t-1].dot(r[t]),-1,1));i[t].applyMatrix4(s.makeRotationAxis(o,e))}a[t].crossVectors(r[t],i[t])}if(t===!0){let t=Math.acos(uo(i[0].dot(i[e]),-1,1));t/=e,r[0].dot(o.crossVectors(i[0],i[e]))>0&&(t=-t);for(let n=1;n<=e;n++)i[n].applyMatrix4(s.makeRotationAxis(r[n],t*n)),a[n].crossVectors(r[n],i[n])}return{tangents:r,normals:i,binormals:a}}clone(){return new this.constructor().copy(this)}copy(e){return this.arcLengthDivisions=e.arcLengthDivisions,this}toJSON(){let e={metadata:{version:4.6,type:`Curve`,generator:`Curve.toJSON`}};return e.arcLengthDivisions=this.arcLengthDivisions,e.type=this.type,e}fromJSON(e){return this.arcLengthDivisions=e.arcLengthDivisions,this}},ip=class extends rp{constructor(e=0,t=0,n=1,r=1,i=0,a=Math.PI*2,o=!1,s=0){super(),this.isEllipseCurve=!0,this.type=`EllipseCurve`,this.aX=e,this.aY=t,this.xRadius=n,this.yRadius=r,this.aStartAngle=i,this.aEndAngle=a,this.aClockwise=o,this.aRotation=s}getPoint(e,t=new H){let n=t,r=Math.PI*2,i=this.aEndAngle-this.aStartAngle,a=Math.abs(i)<2**-52;for(;i<0;)i+=r;for(;i>r;)i-=r;i<2**-52&&(i=a?0:r),this.aClockwise===!0&&!a&&(i===r?i=-r:i-=r);let o=this.aStartAngle+e*i,s=this.aX+this.xRadius*Math.cos(o),c=this.aY+this.yRadius*Math.sin(o);if(this.aRotation!==0){let e=Math.cos(this.aRotation),t=Math.sin(this.aRotation),n=s-this.aX,r=c-this.aY;s=n*e-r*t+this.aX,c=n*t+r*e+this.aY}return n.set(s,c)}copy(e){return super.copy(e),this.aX=e.aX,this.aY=e.aY,this.xRadius=e.xRadius,this.yRadius=e.yRadius,this.aStartAngle=e.aStartAngle,this.aEndAngle=e.aEndAngle,this.aClockwise=e.aClockwise,this.aRotation=e.aRotation,this}toJSON(){let e=super.toJSON();return e.aX=this.aX,e.aY=this.aY,e.xRadius=this.xRadius,e.yRadius=this.yRadius,e.aStartAngle=this.aStartAngle,e.aEndAngle=this.aEndAngle,e.aClockwise=this.aClockwise,e.aRotation=this.aRotation,e}fromJSON(e){return super.fromJSON(e),this.aX=e.aX,this.aY=e.aY,this.xRadius=e.xRadius,this.yRadius=e.yRadius,this.aStartAngle=e.aStartAngle,this.aEndAngle=e.aEndAngle,this.aClockwise=e.aClockwise,this.aRotation=e.aRotation,this}},ap=class extends ip{constructor(e,t,n,r,i,a){super(e,t,n,n,r,i,a),this.isArcCurve=!0,this.type=`ArcCurve`}};function op(){let e=0,t=0,n=0,r=0;function i(i,a,o,s){e=i,t=o,n=-3*i+3*a-2*o-s,r=2*i-2*a+o+s}return{initCatmullRom:function(e,t,n,r,a){i(t,n,a*(n-e),a*(r-t))},initNonuniformCatmullRom:function(e,t,n,r,a,o,s){let c=(t-e)/a-(n-e)/(a+o)+(n-t)/o,l=(n-t)/o-(r-t)/(o+s)+(r-n)/s;c*=o,l*=o,i(t,n,c,l)},calc:function(i){let a=i*i,o=a*i;return e+t*i+n*a+r*o}}}var sp=new G,cp=new op,lp=new op,up=new op,dp=class extends rp{constructor(e=[],t=!1,n=`centripetal`,r=.5){super(),this.isCatmullRomCurve3=!0,this.type=`CatmullRomCurve3`,this.points=e,this.closed=t,this.curveType=n,this.tension=r}getPoint(e,t=new G){let n=t,r=this.points,i=r.length,a=(i-+!this.closed)*e,o=Math.floor(a),s=a-o;this.closed?o+=o>0?0:(Math.floor(Math.abs(o)/i)+1)*i:s===0&&o===i-1&&(o=i-2,s=1);let c,l;this.closed||o>0?c=r[(o-1)%i]:(sp.subVectors(r[0],r[1]).add(r[0]),c=sp);let u=r[o%i],d=r[(o+1)%i];if(this.closed||o+2<i?l=r[(o+2)%i]:(sp.subVectors(r[i-1],r[i-2]).add(r[i-1]),l=sp),this.curveType===`centripetal`||this.curveType===`chordal`){let e=this.curveType===`chordal`?.5:.25,t=c.distanceToSquared(u)**+e,n=u.distanceToSquared(d)**+e,r=d.distanceToSquared(l)**+e;n<1e-4&&(n=1),t<1e-4&&(t=n),r<1e-4&&(r=n),cp.initNonuniformCatmullRom(c.x,u.x,d.x,l.x,t,n,r),lp.initNonuniformCatmullRom(c.y,u.y,d.y,l.y,t,n,r),up.initNonuniformCatmullRom(c.z,u.z,d.z,l.z,t,n,r)}else this.curveType===`catmullrom`&&(cp.initCatmullRom(c.x,u.x,d.x,l.x,this.tension),lp.initCatmullRom(c.y,u.y,d.y,l.y,this.tension),up.initCatmullRom(c.z,u.z,d.z,l.z,this.tension));return n.set(cp.calc(s),lp.calc(s),up.calc(s)),n}copy(e){super.copy(e),this.points=[];for(let t=0,n=e.points.length;t<n;t++){let n=e.points[t];this.points.push(n.clone())}return this.closed=e.closed,this.curveType=e.curveType,this.tension=e.tension,this}toJSON(){let e=super.toJSON();e.points=[];for(let t=0,n=this.points.length;t<n;t++){let n=this.points[t];e.points.push(n.toArray())}return e.closed=this.closed,e.curveType=this.curveType,e.tension=this.tension,e}fromJSON(e){super.fromJSON(e),this.points=[];for(let t=0,n=e.points.length;t<n;t++){let n=e.points[t];this.points.push(new G().fromArray(n))}return this.closed=e.closed,this.curveType=e.curveType,this.tension=e.tension,this}};function fp(e,t,n,r,i){let a=(r-t)*.5,o=(i-n)*.5,s=e*e,c=e*s;return(2*n-2*r+a+o)*c+(-3*n+3*r-2*a-o)*s+a*e+n}function pp(e,t){let n=1-e;return n*n*t}function mp(e,t){return 2*(1-e)*e*t}function hp(e,t){return e*e*t}function gp(e,t,n,r){return pp(e,t)+mp(e,n)+hp(e,r)}function _p(e,t){let n=1-e;return n*n*n*t}function vp(e,t){let n=1-e;return 3*n*n*e*t}function yp(e,t){return 3*(1-e)*e*e*t}function bp(e,t){return e*e*e*t}function xp(e,t,n,r,i){return _p(e,t)+vp(e,n)+yp(e,r)+bp(e,i)}var Sp=class extends rp{constructor(e=new H,t=new H,n=new H,r=new H){super(),this.isCubicBezierCurve=!0,this.type=`CubicBezierCurve`,this.v0=e,this.v1=t,this.v2=n,this.v3=r}getPoint(e,t=new H){let n=t,r=this.v0,i=this.v1,a=this.v2,o=this.v3;return n.set(xp(e,r.x,i.x,a.x,o.x),xp(e,r.y,i.y,a.y,o.y)),n}copy(e){return super.copy(e),this.v0.copy(e.v0),this.v1.copy(e.v1),this.v2.copy(e.v2),this.v3.copy(e.v3),this}toJSON(){let e=super.toJSON();return e.v0=this.v0.toArray(),e.v1=this.v1.toArray(),e.v2=this.v2.toArray(),e.v3=this.v3.toArray(),e}fromJSON(e){return super.fromJSON(e),this.v0.fromArray(e.v0),this.v1.fromArray(e.v1),this.v2.fromArray(e.v2),this.v3.fromArray(e.v3),this}},Cp=class extends rp{constructor(e=new G,t=new G,n=new G,r=new G){super(),this.isCubicBezierCurve3=!0,this.type=`CubicBezierCurve3`,this.v0=e,this.v1=t,this.v2=n,this.v3=r}getPoint(e,t=new G){let n=t,r=this.v0,i=this.v1,a=this.v2,o=this.v3;return n.set(xp(e,r.x,i.x,a.x,o.x),xp(e,r.y,i.y,a.y,o.y),xp(e,r.z,i.z,a.z,o.z)),n}copy(e){return super.copy(e),this.v0.copy(e.v0),this.v1.copy(e.v1),this.v2.copy(e.v2),this.v3.copy(e.v3),this}toJSON(){let e=super.toJSON();return e.v0=this.v0.toArray(),e.v1=this.v1.toArray(),e.v2=this.v2.toArray(),e.v3=this.v3.toArray(),e}fromJSON(e){return super.fromJSON(e),this.v0.fromArray(e.v0),this.v1.fromArray(e.v1),this.v2.fromArray(e.v2),this.v3.fromArray(e.v3),this}},wp=class extends rp{constructor(e=new H,t=new H){super(),this.isLineCurve=!0,this.type=`LineCurve`,this.v1=e,this.v2=t}getPoint(e,t=new H){let n=t;return e===1?n.copy(this.v2):(n.copy(this.v2).sub(this.v1),n.multiplyScalar(e).add(this.v1)),n}getPointAt(e,t){return this.getPoint(e,t)}getTangent(e,t=new H){return t.subVectors(this.v2,this.v1).normalize()}getTangentAt(e,t){return this.getTangent(e,t)}copy(e){return super.copy(e),this.v1.copy(e.v1),this.v2.copy(e.v2),this}toJSON(){let e=super.toJSON();return e.v1=this.v1.toArray(),e.v2=this.v2.toArray(),e}fromJSON(e){return super.fromJSON(e),this.v1.fromArray(e.v1),this.v2.fromArray(e.v2),this}},Tp=class extends rp{constructor(e=new G,t=new G){super(),this.isLineCurve3=!0,this.type=`LineCurve3`,this.v1=e,this.v2=t}getPoint(e,t=new G){let n=t;return e===1?n.copy(this.v2):(n.copy(this.v2).sub(this.v1),n.multiplyScalar(e).add(this.v1)),n}getPointAt(e,t){return this.getPoint(e,t)}getTangent(e,t=new G){return t.subVectors(this.v2,this.v1).normalize()}getTangentAt(e,t){return this.getTangent(e,t)}copy(e){return super.copy(e),this.v1.copy(e.v1),this.v2.copy(e.v2),this}toJSON(){let e=super.toJSON();return e.v1=this.v1.toArray(),e.v2=this.v2.toArray(),e}fromJSON(e){return super.fromJSON(e),this.v1.fromArray(e.v1),this.v2.fromArray(e.v2),this}},Ep=class extends rp{constructor(e=new H,t=new H,n=new H){super(),this.isQuadraticBezierCurve=!0,this.type=`QuadraticBezierCurve`,this.v0=e,this.v1=t,this.v2=n}getPoint(e,t=new H){let n=t,r=this.v0,i=this.v1,a=this.v2;return n.set(gp(e,r.x,i.x,a.x),gp(e,r.y,i.y,a.y)),n}copy(e){return super.copy(e),this.v0.copy(e.v0),this.v1.copy(e.v1),this.v2.copy(e.v2),this}toJSON(){let e=super.toJSON();return e.v0=this.v0.toArray(),e.v1=this.v1.toArray(),e.v2=this.v2.toArray(),e}fromJSON(e){return super.fromJSON(e),this.v0.fromArray(e.v0),this.v1.fromArray(e.v1),this.v2.fromArray(e.v2),this}},Dp=class extends rp{constructor(e=new G,t=new G,n=new G){super(),this.isQuadraticBezierCurve3=!0,this.type=`QuadraticBezierCurve3`,this.v0=e,this.v1=t,this.v2=n}getPoint(e,t=new G){let n=t,r=this.v0,i=this.v1,a=this.v2;return n.set(gp(e,r.x,i.x,a.x),gp(e,r.y,i.y,a.y),gp(e,r.z,i.z,a.z)),n}copy(e){return super.copy(e),this.v0.copy(e.v0),this.v1.copy(e.v1),this.v2.copy(e.v2),this}toJSON(){let e=super.toJSON();return e.v0=this.v0.toArray(),e.v1=this.v1.toArray(),e.v2=this.v2.toArray(),e}fromJSON(e){return super.fromJSON(e),this.v0.fromArray(e.v0),this.v1.fromArray(e.v1),this.v2.fromArray(e.v2),this}},Op=Object.freeze({__proto__:null,ArcCurve:ap,CatmullRomCurve3:dp,CubicBezierCurve:Sp,CubicBezierCurve3:Cp,EllipseCurve:ip,LineCurve:wp,LineCurve3:Tp,QuadraticBezierCurve:Ep,QuadraticBezierCurve3:Dp,SplineCurve:class extends rp{constructor(e=[]){super(),this.isSplineCurve=!0,this.type=`SplineCurve`,this.points=e}getPoint(e,t=new H){let n=t,r=this.points,i=(r.length-1)*e,a=Math.floor(i),o=i-a,s=r[a===0?a:a-1],c=r[a],l=r[a>r.length-2?r.length-1:a+1],u=r[a>r.length-3?r.length-1:a+2];return n.set(fp(o,s.x,c.x,l.x,u.x),fp(o,s.y,c.y,l.y,u.y)),n}copy(e){super.copy(e),this.points=[];for(let t=0,n=e.points.length;t<n;t++){let n=e.points[t];this.points.push(n.clone())}return this}toJSON(){let e=super.toJSON();e.points=[];for(let t=0,n=this.points.length;t<n;t++){let n=this.points[t];e.points.push(n.toArray())}return e}fromJSON(e){super.fromJSON(e),this.points=[];for(let t=0,n=e.points.length;t<n;t++){let n=e.points[t];this.points.push(new H().fromArray(n))}return this}}}),kp=class e extends Wc{constructor(e=1,t=1,n=1,r=32,i=1,a=!1,o=0,s=Math.PI*2){super(),this.type=`CylinderGeometry`,this.parameters={radiusTop:e,radiusBottom:t,height:n,radialSegments:r,heightSegments:i,openEnded:a,thetaStart:o,thetaLength:s};let c=this;r=Math.floor(r),i=Math.floor(i);let l=[],u=[],d=[],f=[],p=0,m=[],h=n/2,g=0;_(),a===!1&&(e>0&&v(!0),t>0&&v(!1)),this.setIndex(l),this.setAttribute(`position`,new q(u,3)),this.setAttribute(`normal`,new q(d,3)),this.setAttribute(`uv`,new q(f,2));function _(){let a=new G,_=new G,v=0,y=(t-e)/n;for(let c=0;c<=i;c++){let l=[],g=c/i,v=g*(t-e)+e;for(let e=0;e<=r;e++){let t=e/r,i=t*s+o,c=Math.sin(i),m=Math.cos(i);_.x=v*c,_.y=-g*n+h,_.z=v*m,u.push(_.x,_.y,_.z),a.set(c,y,m).normalize(),d.push(a.x,a.y,a.z),f.push(t,1-g),l.push(p++)}m.push(l)}for(let n=0;n<r;n++)for(let r=0;r<i;r++){let i=m[r][n],a=m[r+1][n],o=m[r+1][n+1],s=m[r][n+1];e>0&&(l.push(i,a,s),v+=3),t>0&&(l.push(a,o,s),v+=3)}c.addGroup(g,v,0),g+=v}function v(n){let i=p,a=new H,m=new G,_=0,v=n===!0?e:t,y=n===!0?1:-1;for(let e=1;e<=r;e++)u.push(0,h*y,0),d.push(0,y,0),f.push(.5,.5),p++;let b=p;for(let e=0;e<=r;e++){let t=e/r*s+o,n=Math.cos(t),i=Math.sin(t);m.x=v*i,m.y=h*y,m.z=v*n,u.push(m.x,m.y,m.z),d.push(0,y,0),a.x=n*.5+.5,a.y=i*.5*y+.5,f.push(a.x,a.y),p++}for(let e=0;e<r;e++){let t=i+e,r=b+e;n===!0?l.push(r,r+1,t):l.push(r+1,r,t),_+=3}c.addGroup(g,_,n===!0?1:2),g+=_}}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(t){return new e(t.radiusTop,t.radiusBottom,t.height,t.radialSegments,t.heightSegments,t.openEnded,t.thetaStart,t.thetaLength)}},Ap=class e extends kp{constructor(e=1,t=1,n=32,r=1,i=!1,a=0,o=Math.PI*2){super(0,e,t,n,r,i,a,o),this.type=`ConeGeometry`,this.parameters={radius:e,height:t,radialSegments:n,heightSegments:r,openEnded:i,thetaStart:a,thetaLength:o}}static fromJSON(t){return new e(t.radius,t.height,t.radialSegments,t.heightSegments,t.openEnded,t.thetaStart,t.thetaLength)}},jp=new G,Mp=new G,Np=new G,Pp=new Cc,Fp=class extends Wc{constructor(e=null,t=1){if(super(),this.type=`EdgesGeometry`,this.parameters={geometry:e,thresholdAngle:t},e!==null){let n=1e4,r=Math.cos(so*t),i=e.getIndex(),a=e.getAttribute(`position`),o=i?i.count:a.count,s=[0,0,0],c=[`a`,`b`,`c`],l=[,,,],u={},d=[];for(let e=0;e<o;e+=3){i?(s[0]=i.getX(e),s[1]=i.getX(e+1),s[2]=i.getX(e+2)):(s[0]=e,s[1]=e+1,s[2]=e+2);let{a:t,b:o,c:f}=Pp;if(t.fromBufferAttribute(a,s[0]),o.fromBufferAttribute(a,s[1]),f.fromBufferAttribute(a,s[2]),Pp.getNormal(Np),l[0]=`${Math.round(t.x*n)},${Math.round(t.y*n)},${Math.round(t.z*n)}`,l[1]=`${Math.round(o.x*n)},${Math.round(o.y*n)},${Math.round(o.z*n)}`,l[2]=`${Math.round(f.x*n)},${Math.round(f.y*n)},${Math.round(f.z*n)}`,l[0]!==l[1]&&l[1]!==l[2]&&l[2]!==l[0])for(let e=0;e<3;e++){let t=(e+1)%3,n=l[e],i=l[t],a=Pp[c[e]],o=Pp[c[t]],f=`${n}_${i}`,p=`${i}_${n}`;p in u&&u[p]?(Np.dot(u[p].normal)<=r&&(d.push(a.x,a.y,a.z),d.push(o.x,o.y,o.z)),u[p]=null):f in u||(u[f]={index0:s[e],index1:s[t],normal:Np.clone()})}}for(let e in u)if(u[e]){let{index0:t,index1:n}=u[e];jp.fromBufferAttribute(a,t),Mp.fromBufferAttribute(a,n),d.push(jp.x,jp.y,jp.z),d.push(Mp.x,Mp.y,Mp.z)}this.setAttribute(`position`,new q(d,3))}}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}},Ip=class e extends Wc{constructor(e=.5,t=1,n=32,r=1,i=0,a=Math.PI*2){super(),this.type=`RingGeometry`,this.parameters={innerRadius:e,outerRadius:t,thetaSegments:n,phiSegments:r,thetaStart:i,thetaLength:a},n=Math.max(3,n),r=Math.max(1,r);let o=[],s=[],c=[],l=[],u=e,d=(t-e)/r,f=new G,p=new H;for(let e=0;e<=r;e++){for(let e=0;e<=n;e++){let r=i+e/n*a;f.x=u*Math.cos(r),f.y=u*Math.sin(r),s.push(f.x,f.y,f.z),c.push(0,0,1),p.x=(f.x/t+1)/2,p.y=(f.y/t+1)/2,l.push(p.x,p.y)}u+=d}for(let e=0;e<r;e++){let t=e*(n+1);for(let e=0;e<n;e++){let r=e+t,i=r,a=r+n+1,s=r+n+2,c=r+1;o.push(i,a,c),o.push(a,s,c)}}this.setIndex(o),this.setAttribute(`position`,new q(s,3)),this.setAttribute(`normal`,new q(c,3)),this.setAttribute(`uv`,new q(l,2))}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(t){return new e(t.innerRadius,t.outerRadius,t.thetaSegments,t.phiSegments,t.thetaStart,t.thetaLength)}},Lp=class e extends Wc{constructor(e=1,t=32,n=16,r=0,i=Math.PI*2,a=0,o=Math.PI){super(),this.type=`SphereGeometry`,this.parameters={radius:e,widthSegments:t,heightSegments:n,phiStart:r,phiLength:i,thetaStart:a,thetaLength:o},t=Math.max(3,Math.floor(t)),n=Math.max(2,Math.floor(n));let s=Math.min(a+o,Math.PI),c=0,l=[],u=new G,d=new G,f=[],p=[],m=[],h=[];for(let f=0;f<=n;f++){let g=[],_=f/n,v=0;f===0&&a===0?v=.5/t:f===n&&s===Math.PI&&(v=-.5/t);for(let n=0;n<=t;n++){let s=n/t;u.x=-e*Math.cos(r+s*i)*Math.sin(a+_*o),u.y=e*Math.cos(a+_*o),u.z=e*Math.sin(r+s*i)*Math.sin(a+_*o),p.push(u.x,u.y,u.z),d.copy(u).normalize(),m.push(d.x,d.y,d.z),h.push(s+v,1-_),g.push(c++)}l.push(g)}for(let e=0;e<n;e++)for(let r=0;r<t;r++){let t=l[e][r+1],i=l[e][r],o=l[e+1][r],c=l[e+1][r+1];(e!==0||a>0)&&f.push(t,i,c),(e!==n-1||s<Math.PI)&&f.push(i,o,c)}this.setIndex(f),this.setAttribute(`position`,new q(p,3)),this.setAttribute(`normal`,new q(m,3)),this.setAttribute(`uv`,new q(h,2))}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(t){return new e(t.radius,t.widthSegments,t.heightSegments,t.phiStart,t.phiLength,t.thetaStart,t.thetaLength)}},Rp=class e extends Wc{constructor(e=1,t=.4,n=12,r=48,i=Math.PI*2){super(),this.type=`TorusGeometry`,this.parameters={radius:e,tube:t,radialSegments:n,tubularSegments:r,arc:i},n=Math.floor(n),r=Math.floor(r);let a=[],o=[],s=[],c=[],l=new G,u=new G,d=new G;for(let a=0;a<=n;a++)for(let f=0;f<=r;f++){let p=f/r*i,m=a/n*Math.PI*2;u.x=(e+t*Math.cos(m))*Math.cos(p),u.y=(e+t*Math.cos(m))*Math.sin(p),u.z=t*Math.sin(m),o.push(u.x,u.y,u.z),l.x=e*Math.cos(p),l.y=e*Math.sin(p),d.subVectors(u,l).normalize(),s.push(d.x,d.y,d.z),c.push(f/r),c.push(a/n)}for(let e=1;e<=n;e++)for(let t=1;t<=r;t++){let n=(r+1)*e+t-1,i=(r+1)*(e-1)+t-1,o=(r+1)*(e-1)+t,s=(r+1)*e+t;a.push(n,i,s),a.push(i,o,s)}this.setIndex(a),this.setAttribute(`position`,new q(o,3)),this.setAttribute(`normal`,new q(s,3)),this.setAttribute(`uv`,new q(c,2))}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(t){return new e(t.radius,t.tube,t.radialSegments,t.tubularSegments,t.arc)}},zp=class e extends Wc{constructor(e=new Dp(new G(-1,-1,0),new G(-1,1,0),new G(1,1,0)),t=64,n=1,r=8,i=!1){super(),this.type=`TubeGeometry`,this.parameters={path:e,tubularSegments:t,radius:n,radialSegments:r,closed:i};let a=e.computeFrenetFrames(t,i);this.tangents=a.tangents,this.normals=a.normals,this.binormals=a.binormals;let o=new G,s=new G,c=new H,l=new G,u=[],d=[],f=[],p=[];m(),this.setIndex(p),this.setAttribute(`position`,new q(u,3)),this.setAttribute(`normal`,new q(d,3)),this.setAttribute(`uv`,new q(f,2));function m(){for(let e=0;e<t;e++)h(e);h(i===!1?t:0),_(),g()}function h(i){l=e.getPointAt(i/t,l);let c=a.normals[i],f=a.binormals[i];for(let e=0;e<=r;e++){let t=e/r*Math.PI*2,i=Math.sin(t),a=-Math.cos(t);s.x=a*c.x+i*f.x,s.y=a*c.y+i*f.y,s.z=a*c.z+i*f.z,s.normalize(),d.push(s.x,s.y,s.z),o.x=l.x+n*s.x,o.y=l.y+n*s.y,o.z=l.z+n*s.z,u.push(o.x,o.y,o.z)}}function g(){for(let e=1;e<=t;e++)for(let t=1;t<=r;t++){let n=(r+1)*(e-1)+(t-1),i=(r+1)*e+(t-1),a=(r+1)*e+t,o=(r+1)*(e-1)+t;p.push(n,i,o),p.push(i,a,o)}}function _(){for(let e=0;e<=t;e++)for(let n=0;n<=r;n++)c.x=e/t,c.y=n/r,f.push(c.x,c.y)}}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}toJSON(){let e=super.toJSON();return e.path=this.parameters.path.toJSON(),e}static fromJSON(t){return new e(new Op[t.path.type]().fromJSON(t.path),t.tubularSegments,t.radius,t.radialSegments,t.closed)}},Bp=class extends Ac{constructor(e){super(),this.isMeshStandardMaterial=!0,this.defines={STANDARD:``},this.type=`MeshStandardMaterial`,this.color=new K(16777215),this.roughness=1,this.metalness=0,this.map=null,this.lightMap=null,this.lightMapIntensity=1,this.aoMap=null,this.aoMapIntensity=1,this.emissive=new K(0),this.emissiveIntensity=1,this.emissiveMap=null,this.bumpMap=null,this.bumpScale=1,this.normalMap=null,this.normalMapType=0,this.normalScale=new H(1,1),this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.roughnessMap=null,this.metalnessMap=null,this.alphaMap=null,this.envMap=null,this.envMapRotation=new Ks,this.envMapIntensity=1,this.wireframe=!1,this.wireframeLinewidth=1,this.wireframeLinecap=`round`,this.wireframeLinejoin=`round`,this.flatShading=!1,this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.defines={STANDARD:``},this.color.copy(e.color),this.roughness=e.roughness,this.metalness=e.metalness,this.map=e.map,this.lightMap=e.lightMap,this.lightMapIntensity=e.lightMapIntensity,this.aoMap=e.aoMap,this.aoMapIntensity=e.aoMapIntensity,this.emissive.copy(e.emissive),this.emissiveMap=e.emissiveMap,this.emissiveIntensity=e.emissiveIntensity,this.bumpMap=e.bumpMap,this.bumpScale=e.bumpScale,this.normalMap=e.normalMap,this.normalMapType=e.normalMapType,this.normalScale.copy(e.normalScale),this.displacementMap=e.displacementMap,this.displacementScale=e.displacementScale,this.displacementBias=e.displacementBias,this.roughnessMap=e.roughnessMap,this.metalnessMap=e.metalnessMap,this.alphaMap=e.alphaMap,this.envMap=e.envMap,this.envMapRotation.copy(e.envMapRotation),this.envMapIntensity=e.envMapIntensity,this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this.wireframeLinecap=e.wireframeLinecap,this.wireframeLinejoin=e.wireframeLinejoin,this.flatShading=e.flatShading,this.fog=e.fog,this}},Vp=class extends Wf{constructor(e){super(),this.isLineDashedMaterial=!0,this.type=`LineDashedMaterial`,this.scale=1,this.dashSize=3,this.gapSize=1,this.setValues(e)}copy(e){return super.copy(e),this.scale=e.scale,this.dashSize=e.dashSize,this.gapSize=e.gapSize,this}};function Hp(e,t,n){return!e||!n&&e.constructor===t?e:typeof t.BYTES_PER_ELEMENT==`number`?new t(e):Array.prototype.slice.call(e)}function Up(e){return ArrayBuffer.isView(e)&&!(e instanceof DataView)}var Wp=class{constructor(e,t,n,r){this.parameterPositions=e,this._cachedIndex=0,this.resultBuffer=r===void 0?new t.constructor(n):r,this.sampleValues=t,this.valueSize=n,this.settings=null,this.DefaultSettings_={}}evaluate(e){let t=this.parameterPositions,n=this._cachedIndex,r=t[n],i=t[n-1];validate_interval:{seek:{let a;linear_scan:{forward_scan:if(!(e<r)){for(let a=n+2;;){if(r===void 0){if(e<i)break forward_scan;return n=t.length,this._cachedIndex=n,this.copySampleValue_(n-1)}if(n===a)break;if(i=r,r=t[++n],e<r)break seek}a=t.length;break linear_scan}if(!(e>=i)){let o=t[1];e<o&&(n=2,i=o);for(let a=n-2;;){if(i===void 0)return this._cachedIndex=0,this.copySampleValue_(0);if(n===a)break;if(r=i,i=t[--n-1],e>=i)break seek}a=n,n=0;break linear_scan}break validate_interval}for(;n<a;){let r=n+a>>>1;e<t[r]?a=r:n=r+1}if(r=t[n],i=t[n-1],i===void 0)return this._cachedIndex=0,this.copySampleValue_(0);if(r===void 0)return n=t.length,this._cachedIndex=n,this.copySampleValue_(n-1)}this._cachedIndex=n,this.intervalChanged_(n,i,r)}return this.interpolate_(n,i,e,r)}getSettings_(){return this.settings||this.DefaultSettings_}copySampleValue_(e){let t=this.resultBuffer,n=this.sampleValues,r=this.valueSize,i=e*r;for(let e=0;e!==r;++e)t[e]=n[i+e];return t}interpolate_(){throw Error(`call to abstract method`)}intervalChanged_(){}},Gp=class extends Wp{constructor(e,t,n,r){super(e,t,n,r),this._weightPrev=-0,this._offsetPrev=-0,this._weightNext=-0,this._offsetNext=-0,this.DefaultSettings_={endingStart:Ua,endingEnd:Ua}}intervalChanged_(e,t,n){let r=this.parameterPositions,i=e-2,a=e+1,o=r[i],s=r[a];if(o===void 0)switch(this.getSettings_().endingStart){case Wa:i=e,o=2*t-n;break;case Ga:i=r.length-2,o=t+r[i]-r[i+1];break;default:i=e,o=n}if(s===void 0)switch(this.getSettings_().endingEnd){case Wa:a=e,s=2*n-t;break;case Ga:a=1,s=n+r[1]-r[0];break;default:a=e-1,s=t}let c=(n-t)*.5,l=this.valueSize;this._weightPrev=c/(t-o),this._weightNext=c/(s-n),this._offsetPrev=i*l,this._offsetNext=a*l}interpolate_(e,t,n,r){let i=this.resultBuffer,a=this.sampleValues,o=this.valueSize,s=e*o,c=s-o,l=this._offsetPrev,u=this._offsetNext,d=this._weightPrev,f=this._weightNext,p=(n-t)/(r-t),m=p*p,h=m*p,g=-d*h+2*d*m-d*p,_=(1+d)*h+(-1.5-2*d)*m+(-.5+d)*p+1,v=(-1-f)*h+(1.5+f)*m+.5*p,y=f*h-f*m;for(let e=0;e!==o;++e)i[e]=g*a[l+e]+_*a[c+e]+v*a[s+e]+y*a[u+e];return i}},Kp=class extends Wp{constructor(e,t,n,r){super(e,t,n,r)}interpolate_(e,t,n,r){let i=this.resultBuffer,a=this.sampleValues,o=this.valueSize,s=e*o,c=s-o,l=(n-t)/(r-t),u=1-l;for(let e=0;e!==o;++e)i[e]=a[c+e]*u+a[s+e]*l;return i}},qp=class extends Wp{constructor(e,t,n,r){super(e,t,n,r)}interpolate_(e){return this.copySampleValue_(e-1)}},Jp=class{constructor(e,t,n,r){if(e===void 0)throw Error(`THREE.KeyframeTrack: track name is undefined`);if(t===void 0||t.length===0)throw Error(`THREE.KeyframeTrack: no keyframes in track named `+e);this.name=e,this.times=Hp(t,this.TimeBufferType),this.values=Hp(n,this.ValueBufferType),this.setInterpolation(r||this.DefaultInterpolation)}static toJSON(e){let t=e.constructor,n;if(t.toJSON!==this.toJSON)n=t.toJSON(e);else{n={name:e.name,times:Hp(e.times,Array),values:Hp(e.values,Array)};let t=e.getInterpolation();t!==e.DefaultInterpolation&&(n.interpolation=t)}return n.type=e.ValueTypeName,n}InterpolantFactoryMethodDiscrete(e){return new qp(this.times,this.values,this.getValueSize(),e)}InterpolantFactoryMethodLinear(e){return new Kp(this.times,this.values,this.getValueSize(),e)}InterpolantFactoryMethodSmooth(e){return new Gp(this.times,this.values,this.getValueSize(),e)}setInterpolation(e){let t;switch(e){case Ba:t=this.InterpolantFactoryMethodDiscrete;break;case Va:t=this.InterpolantFactoryMethodLinear;break;case Ha:t=this.InterpolantFactoryMethodSmooth}if(t===void 0){let t=`unsupported interpolation for `+this.ValueTypeName+` keyframe track named `+this.name;if(this.createInterpolant===void 0){if(e!==this.DefaultInterpolation)this.setInterpolation(this.DefaultInterpolation);else throw Error(t)}return console.warn(`THREE.KeyframeTrack:`,t),this}return this.createInterpolant=t,this}getInterpolation(){switch(this.createInterpolant){case this.InterpolantFactoryMethodDiscrete:return Ba;case this.InterpolantFactoryMethodLinear:return Va;case this.InterpolantFactoryMethodSmooth:return Ha}}getValueSize(){return this.values.length/this.times.length}shift(e){if(e!==0){let t=this.times;for(let n=0,r=t.length;n!==r;++n)t[n]+=e}return this}scale(e){if(e!==1){let t=this.times;for(let n=0,r=t.length;n!==r;++n)t[n]*=e}return this}trim(e,t){let n=this.times,r=n.length,i=0,a=r-1;for(;i!==r&&n[i]<e;)++i;for(;a!==-1&&n[a]>t;)--a;if(++a,i!==0||a!==r){i>=a&&(a=Math.max(a,1),i=a-1);let e=this.getValueSize();this.times=n.slice(i,a),this.values=this.values.slice(i*e,a*e)}return this}validate(){let e=!0,t=this.getValueSize();t-Math.floor(t)!==0&&(console.error(`THREE.KeyframeTrack: Invalid value size in track.`,this),e=!1);let n=this.times,r=this.values,i=n.length;i===0&&(console.error(`THREE.KeyframeTrack: Track is empty.`,this),e=!1);let a=null;for(let t=0;t!==i;t++){let r=n[t];if(typeof r==`number`&&isNaN(r)){console.error(`THREE.KeyframeTrack: Time is not a valid number.`,this,t,r),e=!1;break}if(a!==null&&a>r){console.error(`THREE.KeyframeTrack: Out of order keys.`,this,t,r,a),e=!1;break}a=r}if(r!==void 0&&Up(r))for(let t=0,n=r.length;t!==n;++t){let n=r[t];if(isNaN(n)){console.error(`THREE.KeyframeTrack: Value is not a valid number.`,this,t,n),e=!1;break}}return e}optimize(){let e=this.times.slice(),t=this.values.slice(),n=this.getValueSize(),r=this.getInterpolation()===Ha,i=e.length-1,a=1;for(let o=1;o<i;++o){let i=!1,s=e[o];if(s!==e[o+1]&&(o!==1||s!==e[0])){if(r)i=!0;else{let e=o*n,r=e-n,a=e+n;for(let o=0;o!==n;++o){let n=t[e+o];if(n!==t[r+o]||n!==t[a+o]){i=!0;break}}}}if(i){if(o!==a){e[a]=e[o];let r=o*n,i=a*n;for(let e=0;e!==n;++e)t[i+e]=t[r+e]}++a}}if(i>0){e[a]=e[i];for(let e=i*n,r=a*n,o=0;o!==n;++o)t[r+o]=t[e+o];++a}return a===e.length?(this.times=e,this.values=t):(this.times=e.slice(0,a),this.values=t.slice(0,a*n)),this}clone(){let e=this.times.slice(),t=this.values.slice(),n=this.constructor,r=new n(this.name,e,t);return r.createInterpolant=this.createInterpolant,r}};Jp.prototype.TimeBufferType=Float32Array,Jp.prototype.ValueBufferType=Float32Array,Jp.prototype.DefaultInterpolation=Va;var Yp=class extends Jp{constructor(e,t,n){super(e,t,n)}};Yp.prototype.ValueTypeName=`bool`,Yp.prototype.ValueBufferType=Array,Yp.prototype.DefaultInterpolation=Ba,Yp.prototype.InterpolantFactoryMethodLinear=void 0,Yp.prototype.InterpolantFactoryMethodSmooth=void 0;var Xp=class extends Jp{};Xp.prototype.ValueTypeName=`color`;var Zp=class extends Jp{};Zp.prototype.ValueTypeName=`number`;var Qp=class extends Wp{constructor(e,t,n,r){super(e,t,n,r)}interpolate_(e,t,n,r){let i=this.resultBuffer,a=this.sampleValues,o=this.valueSize,s=(n-t)/(r-t),c=e*o;for(let e=c+o;c!==e;c+=4)os.slerpFlat(i,0,a,c-o,a,c,s);return i}},$p=class extends Jp{InterpolantFactoryMethodLinear(e){return new Qp(this.times,this.values,this.getValueSize(),e)}};$p.prototype.ValueTypeName=`quaternion`,$p.prototype.InterpolantFactoryMethodSmooth=void 0;var em=class extends Jp{constructor(e,t,n){super(e,t,n)}};em.prototype.ValueTypeName=`string`,em.prototype.ValueBufferType=Array,em.prototype.DefaultInterpolation=Ba,em.prototype.InterpolantFactoryMethodLinear=void 0,em.prototype.InterpolantFactoryMethodSmooth=void 0;var tm=class extends Jp{};tm.prototype.ValueTypeName=`vector`;var nm=class extends lc{constructor(e,t=1){super(),this.isLight=!0,this.type=`Light`,this.color=new K(e),this.intensity=t}dispose(){}copy(e,t){return super.copy(e,t),this.color.copy(e.color),this.intensity=e.intensity,this}toJSON(e){let t=super.toJSON(e);return t.object.color=this.color.getHex(),t.object.intensity=this.intensity,this.groundColor!==void 0&&(t.object.groundColor=this.groundColor.getHex()),this.distance!==void 0&&(t.object.distance=this.distance),this.angle!==void 0&&(t.object.angle=this.angle),this.decay!==void 0&&(t.object.decay=this.decay),this.penumbra!==void 0&&(t.object.penumbra=this.penumbra),this.shadow!==void 0&&(t.object.shadow=this.shadow.toJSON()),this.target!==void 0&&(t.object.target=this.target.uuid),t}},rm=new Is,im=new G,am=new G,om=class{constructor(e){this.camera=e,this.intensity=1,this.bias=0,this.normalBias=0,this.radius=1,this.blurSamples=8,this.mapSize=new H(512,512),this.map=null,this.mapPass=null,this.matrix=new Is,this.autoUpdate=!0,this.needsUpdate=!1,this._frustum=new Al,this._frameExtents=new H(1,1),this._viewportCount=1,this._viewports=[new ts(0,0,1,1)]}getViewportCount(){return this._viewportCount}getFrustum(){return this._frustum}updateMatrices(e){let t=this.camera,n=this.matrix;im.setFromMatrixPosition(e.matrixWorld),t.position.copy(im),am.setFromMatrixPosition(e.target.matrixWorld),t.lookAt(am),t.updateMatrixWorld(),rm.multiplyMatrices(t.projectionMatrix,t.matrixWorldInverse),this._frustum.setFromProjectionMatrix(rm),n.set(.5,0,0,.5,0,.5,0,.5,0,0,.5,.5,0,0,0,1),n.multiply(rm)}getViewport(e){return this._viewports[e]}getFrameExtents(){return this._frameExtents}dispose(){this.map&&this.map.dispose(),this.mapPass&&this.mapPass.dispose()}copy(e){return this.camera=e.camera.clone(),this.intensity=e.intensity,this.bias=e.bias,this.radius=e.radius,this.mapSize.copy(e.mapSize),this}clone(){return new this.constructor().copy(this)}toJSON(){let e={};return this.intensity!==1&&(e.intensity=this.intensity),this.bias!==0&&(e.bias=this.bias),this.normalBias!==0&&(e.normalBias=this.normalBias),this.radius!==1&&(e.radius=this.radius),(this.mapSize.x!==512||this.mapSize.y!==512)&&(e.mapSize=this.mapSize.toArray()),e.camera=this.camera.toJSON(!1).object,delete e.camera.matrix,e}},sm=class extends om{constructor(){super(new Wl(-5,5,5,-5,.5,500)),this.isDirectionalLightShadow=!0}},cm=class extends nm{constructor(e,t){super(e,t),this.isDirectionalLight=!0,this.type=`DirectionalLight`,this.position.copy(lc.DEFAULT_UP),this.updateMatrix(),this.target=new lc,this.shadow=new sm}dispose(){this.shadow.dispose()}copy(e){return super.copy(e),this.target=e.target.clone(),this.shadow=e.shadow.clone(),this}},lm=class extends nm{constructor(e,t){super(e,t),this.isAmbientLight=!0,this.type=`AmbientLight`}},um=`\\[\\]\\.:\\/`,dm=RegExp(`[\\[\\]\\.:\\/]`,`g`),fm=`[^\\[\\]\\.:\\/]`,pm=`[^`+um.replace(`\\.`,``)+`]`,mm=`((?:WC+[\\/:])*)`.replace(`WC`,fm),hm=`(WCOD+)?`.replace(`WCOD`,pm),gm=`(?:\\.(WC+)(?:\\[(.+)\\])?)?`.replace(`WC`,fm),_m=`\\.(WC+)(?:\\[(.+)\\])?`.replace(`WC`,fm),vm=RegExp(`^`+mm+hm+gm+_m+`$`),ym=[`material`,`materials`,`bones`,`map`],bm=class{constructor(e,t,n){let r=n||xm.parseTrackName(t);this._targetGroup=e,this._bindings=e.subscribe_(t,r)}getValue(e,t){this.bind();let n=this._targetGroup.nCachedObjects_,r=this._bindings[n];r!==void 0&&r.getValue(e,t)}setValue(e,t){let n=this._bindings;for(let r=this._targetGroup.nCachedObjects_,i=n.length;r!==i;++r)n[r].setValue(e,t)}bind(){let e=this._bindings;for(let t=this._targetGroup.nCachedObjects_,n=e.length;t!==n;++t)e[t].bind()}unbind(){let e=this._bindings;for(let t=this._targetGroup.nCachedObjects_,n=e.length;t!==n;++t)e[t].unbind()}},xm=class e{constructor(t,n,r){this.path=n,this.parsedPath=r||e.parseTrackName(n),this.node=e.findNode(t,this.parsedPath.nodeName),this.rootNode=t,this.getValue=this._getValue_unbound,this.setValue=this._setValue_unbound}static create(t,n,r){return t&&t.isAnimationObjectGroup?new e.Composite(t,n,r):new e(t,n,r)}static sanitizeNodeName(e){return e.replace(/\s/g,`_`).replace(dm,``)}static parseTrackName(e){let t=vm.exec(e);if(t===null)throw Error(`PropertyBinding: Cannot parse trackName: `+e);let n={nodeName:t[2],objectName:t[3],objectIndex:t[4],propertyName:t[5],propertyIndex:t[6]},r=n.nodeName&&n.nodeName.lastIndexOf(`.`);if(r!==void 0&&r!==-1){let e=n.nodeName.substring(r+1);ym.indexOf(e)!==-1&&(n.nodeName=n.nodeName.substring(0,r),n.objectName=e)}if(n.propertyName===null||n.propertyName.length===0)throw Error(`PropertyBinding: can not parse propertyName from trackName: `+e);return n}static findNode(e,t){if(t===void 0||t===``||t===`.`||t===-1||t===e.name||t===e.uuid)return e;if(e.skeleton){let n=e.skeleton.getBoneByName(t);if(n!==void 0)return n}if(e.children){let n=function(e){for(let r=0;r<e.length;r++){let i=e[r];if(i.name===t||i.uuid===t)return i;let a=n(i.children);if(a)return a}return null},r=n(e.children);if(r)return r}return null}_getValue_unavailable(){}_setValue_unavailable(){}_getValue_direct(e,t){e[t]=this.targetObject[this.propertyName]}_getValue_array(e,t){let n=this.resolvedProperty;for(let r=0,i=n.length;r!==i;++r)e[t++]=n[r]}_getValue_arrayElement(e,t){e[t]=this.resolvedProperty[this.propertyIndex]}_getValue_toArray(e,t){this.resolvedProperty.toArray(e,t)}_setValue_direct(e,t){this.targetObject[this.propertyName]=e[t]}_setValue_direct_setNeedsUpdate(e,t){this.targetObject[this.propertyName]=e[t],this.targetObject.needsUpdate=!0}_setValue_direct_setMatrixWorldNeedsUpdate(e,t){this.targetObject[this.propertyName]=e[t],this.targetObject.matrixWorldNeedsUpdate=!0}_setValue_array(e,t){let n=this.resolvedProperty;for(let r=0,i=n.length;r!==i;++r)n[r]=e[t++]}_setValue_array_setNeedsUpdate(e,t){let n=this.resolvedProperty;for(let r=0,i=n.length;r!==i;++r)n[r]=e[t++];this.targetObject.needsUpdate=!0}_setValue_array_setMatrixWorldNeedsUpdate(e,t){let n=this.resolvedProperty;for(let r=0,i=n.length;r!==i;++r)n[r]=e[t++];this.targetObject.matrixWorldNeedsUpdate=!0}_setValue_arrayElement(e,t){this.resolvedProperty[this.propertyIndex]=e[t]}_setValue_arrayElement_setNeedsUpdate(e,t){this.resolvedProperty[this.propertyIndex]=e[t],this.targetObject.needsUpdate=!0}_setValue_arrayElement_setMatrixWorldNeedsUpdate(e,t){this.resolvedProperty[this.propertyIndex]=e[t],this.targetObject.matrixWorldNeedsUpdate=!0}_setValue_fromArray(e,t){this.resolvedProperty.fromArray(e,t)}_setValue_fromArray_setNeedsUpdate(e,t){this.resolvedProperty.fromArray(e,t),this.targetObject.needsUpdate=!0}_setValue_fromArray_setMatrixWorldNeedsUpdate(e,t){this.resolvedProperty.fromArray(e,t),this.targetObject.matrixWorldNeedsUpdate=!0}_getValue_unbound(e,t){this.bind(),this.getValue(e,t)}_setValue_unbound(e,t){this.bind(),this.setValue(e,t)}bind(){let t=this.node,n=this.parsedPath,r=n.objectName,i=n.propertyName,a=n.propertyIndex;if(t||(t=e.findNode(this.rootNode,n.nodeName),this.node=t),this.getValue=this._getValue_unavailable,this.setValue=this._setValue_unavailable,!t){console.warn(`THREE.PropertyBinding: No target node found for track: `+this.path+`.`);return}if(r){let e=n.objectIndex;switch(r){case`materials`:if(!t.material){console.error(`THREE.PropertyBinding: Can not bind to material as node does not have a material.`,this);return}if(!t.material.materials){console.error(`THREE.PropertyBinding: Can not bind to material.materials as node.material does not have a materials array.`,this);return}t=t.material.materials;break;case`bones`:if(!t.skeleton){console.error(`THREE.PropertyBinding: Can not bind to bones as node does not have a skeleton.`,this);return}t=t.skeleton.bones;for(let n=0;n<t.length;n++)if(t[n].name===e){e=n;break}break;case`map`:if(`map`in t){t=t.map;break}if(!t.material){console.error(`THREE.PropertyBinding: Can not bind to material as node does not have a material.`,this);return}if(!t.material.map){console.error(`THREE.PropertyBinding: Can not bind to material.map as node.material does not have a map.`,this);return}t=t.material.map;break;default:if(t[r]===void 0){console.error(`THREE.PropertyBinding: Can not bind to objectName of node undefined.`,this);return}t=t[r]}if(e!==void 0){if(t[e]===void 0){console.error(`THREE.PropertyBinding: Trying to bind to objectIndex of objectName, but is undefined.`,this,t);return}t=t[e]}}let o=t[i];if(o===void 0){let e=n.nodeName;console.error(`THREE.PropertyBinding: Trying to update property for track: `+e+`.`+i+` but it wasn't found.`,t);return}let s=this.Versioning.None;this.targetObject=t,t.needsUpdate===void 0?t.matrixWorldNeedsUpdate!==void 0&&(s=this.Versioning.MatrixWorldNeedsUpdate):s=this.Versioning.NeedsUpdate;let c=this.BindingType.Direct;if(a!==void 0){if(i===`morphTargetInfluences`){if(!t.geometry){console.error(`THREE.PropertyBinding: Can not bind to morphTargetInfluences because node does not have a geometry.`,this);return}if(!t.geometry.morphAttributes){console.error(`THREE.PropertyBinding: Can not bind to morphTargetInfluences because node does not have a geometry.morphAttributes.`,this);return}t.morphTargetDictionary[a]!==void 0&&(a=t.morphTargetDictionary[a])}c=this.BindingType.ArrayElement,this.resolvedProperty=o,this.propertyIndex=a}else o.fromArray!==void 0&&o.toArray!==void 0?(c=this.BindingType.HasFromToArray,this.resolvedProperty=o):Array.isArray(o)?(c=this.BindingType.EntireArray,this.resolvedProperty=o):this.propertyName=i;this.getValue=this.GetterByBindingType[c],this.setValue=this.SetterByBindingTypeAndVersioning[c][s]}unbind(){this.node=null,this.getValue=this._getValue_unbound,this.setValue=this._setValue_unbound}};xm.Composite=bm,xm.prototype.BindingType={Direct:0,EntireArray:1,ArrayElement:2,HasFromToArray:3},xm.prototype.Versioning={None:0,NeedsUpdate:1,MatrixWorldNeedsUpdate:2},xm.prototype.GetterByBindingType=[xm.prototype._getValue_direct,xm.prototype._getValue_array,xm.prototype._getValue_arrayElement,xm.prototype._getValue_toArray],xm.prototype.SetterByBindingTypeAndVersioning=[[xm.prototype._setValue_direct,xm.prototype._setValue_direct_setNeedsUpdate,xm.prototype._setValue_direct_setMatrixWorldNeedsUpdate],[xm.prototype._setValue_array,xm.prototype._setValue_array_setNeedsUpdate,xm.prototype._setValue_array_setMatrixWorldNeedsUpdate],[xm.prototype._setValue_arrayElement,xm.prototype._setValue_arrayElement_setNeedsUpdate,xm.prototype._setValue_arrayElement_setMatrixWorldNeedsUpdate],[xm.prototype._setValue_fromArray,xm.prototype._setValue_fromArray_setNeedsUpdate,xm.prototype._setValue_fromArray_setMatrixWorldNeedsUpdate]];var Sm=new Is,Cm=class{constructor(e,t,n=0,r=1/0){this.ray=new Fs(e,t),this.near=n,this.far=r,this.camera=null,this.layers=new qs,this.params={Mesh:{},Line:{threshold:1},LOD:{},Points:{threshold:1},Sprite:{}}}set(e,t){this.ray.set(e,t)}setFromCamera(e,t){t.isPerspectiveCamera?(this.ray.origin.setFromMatrixPosition(t.matrixWorld),this.ray.direction.set(e.x,e.y,.5).unproject(t).sub(this.ray.origin).normalize(),this.camera=t):t.isOrthographicCamera?(this.ray.origin.set(e.x,e.y,(t.near+t.far)/(t.near-t.far)).unproject(t),this.ray.direction.set(0,0,-1).transformDirection(t.matrixWorld),this.camera=t):console.error(`THREE.Raycaster: Unsupported camera type: `+t.type)}setFromXRController(e){return Sm.identity().extractRotation(e.matrixWorld),this.ray.origin.setFromMatrixPosition(e.matrixWorld),this.ray.direction.set(0,0,-1).applyMatrix4(Sm),this}intersectObject(e,t=!0,n=[]){return Tm(e,this,n,t),n.sort(wm),n}intersectObjects(e,t=!0,n=[]){for(let r=0,i=e.length;r<i;r++)Tm(e[r],this,n,t);return n.sort(wm),n}};function wm(e,t){return e.distance-t.distance}function Tm(e,t,n,r){let i=!0;if(e.layers.test(t.layers)&&e.raycast(t,n)===!1&&(i=!1),i===!0&&r===!0){let r=e.children;for(let e=0,i=r.length;e<i;e++)Tm(r[e],t,n,!0)}}var Em=class{constructor(e=1,t=0,n=0){return this.radius=e,this.phi=t,this.theta=n,this}set(e,t,n){return this.radius=e,this.phi=t,this.theta=n,this}copy(e){return this.radius=e.radius,this.phi=e.phi,this.theta=e.theta,this}makeSafe(){let e=1e-6;return this.phi=Math.max(e,Math.min(Math.PI-e,this.phi)),this}setFromVector3(e){return this.setFromCartesianCoords(e.x,e.y,e.z)}setFromCartesianCoords(e,t,n){return this.radius=Math.sqrt(e*e+t*t+n*n),this.radius===0?(this.theta=0,this.phi=0):(this.theta=Math.atan2(e,n),this.phi=Math.acos(uo(t/this.radius,-1,1))),this}clone(){return new this.constructor().copy(this)}},Dm=class extends io{constructor(e,t=null){super(),this.object=e,this.domElement=t,this.enabled=!0,this.state=-1,this.keys={},this.mouseButtons={LEFT:null,MIDDLE:null,RIGHT:null},this.touches={ONE:null,TWO:null}}connect(){}disconnect(){}dispose(){}update(){}};typeof __THREE_DEVTOOLS__<`u`&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent(`register`,{detail:{revision:`169`}})),typeof window<`u`&&(window.__THREE__?console.warn(`WARNING: Multiple instances of Three.js being imported.`):window.__THREE__=`169`);var Om=class extends lc{constructor(e=document.createElement(`div`)){super(),this.isCSS2DObject=!0,this.element=e,this.element.style.position=`absolute`,this.element.style.userSelect=`none`,this.element.setAttribute(`draggable`,!1),this.center=new H(.5,.5),this.addEventListener(`removed`,function(){this.traverse(function(e){e.element instanceof Element&&e.element.parentNode!==null&&e.element.parentNode.removeChild(e.element)})})}copy(e,t){return super.copy(e,t),this.element=e.element.cloneNode(!0),this.center=e.center,this}},km=new G,Am=new Is,jm=new Is,Mm=new G,Nm=new G,Pm=class{constructor(e={}){let t=this,n,r,i,a,o={objects:new WeakMap},s=e.element===void 0?document.createElement(`div`):e.element;s.style.overflow=`hidden`,this.domElement=s,this.getSize=function(){return{width:n,height:r}},this.render=function(e,t){e.matrixWorldAutoUpdate===!0&&e.updateMatrixWorld(),t.parent===null&&t.matrixWorldAutoUpdate===!0&&t.updateMatrixWorld(),Am.copy(t.matrixWorldInverse),jm.multiplyMatrices(t.projectionMatrix,Am),l(e,e,t),f(e)},this.setSize=function(e,t){n=e,r=t,i=n/2,a=r/2,s.style.width=e+`px`,s.style.height=t+`px`};function c(e){e.isCSS2DObject&&(e.element.style.display=`none`);for(let t=0,n=e.children.length;t<n;t++)c(e.children[t])}function l(e,n,r){if(e.visible===!1)c(e);else{if(e.isCSS2DObject){km.setFromMatrixPosition(e.matrixWorld),km.applyMatrix4(jm);let c=km.z>=-1&&km.z<=1&&e.layers.test(r.layers)===!0,l=e.element;l.style.display=c===!0?``:`none`,c===!0&&(e.onBeforeRender(t,n,r),l.style.transform=`translate(`+-100*e.center.x+`%,`+-100*e.center.y+`%)translate(`+(km.x*i+i)+`px,`+(-km.y*a+a)+`px)`,l.parentNode!==s&&s.appendChild(l),e.onAfterRender(t,n,r));let d={distanceToCameraSquared:u(r,e)};o.objects.set(e,d)}for(let t=0,i=e.children.length;t<i;t++)l(e.children[t],n,r)}}function u(e,t){return Mm.setFromMatrixPosition(e.matrixWorld),Nm.setFromMatrixPosition(t.matrixWorld),Mm.distanceToSquared(Nm)}function d(e){let t=[];return e.traverseVisible(function(e){e.isCSS2DObject&&t.push(e)}),t}function f(e){let t=d(e).sort(function(e,t){return e.renderOrder===t.renderOrder?o.objects.get(e).distanceToCameraSquared-o.objects.get(t).distanceToCameraSquared:t.renderOrder-e.renderOrder}),n=t.length;for(let e=0,r=t.length;e<r;e++)t[e].element.style.zIndex=n-e}}},Fm=[{id:`physical`,name:`Physical / LAG`,y:0,color:9148584},{id:`ring`,name:`G.8032 rings`,y:6,color:14922561},{id:`isis`,name:`IGP (IS-IS / OSPF)`,y:12,color:4176208},{id:`mpls`,name:`MPLS: SR policies / LSPs / MPLS-TP`,y:18,color:13801762},{id:`bgp`,name:`BGP`,y:24,color:10711543},{id:`pw`,name:`Pseudowires (VPWS)`,y:30,color:16218298},{id:`cfm`,name:`CFM MEG`,y:36,color:3786191}],Im=7979263,Lm=15763518,Rm=e=>Fm.find(t=>t.id===e)?.y??0,zm={ospf:`isis`,"mpls-tp":`mpls`},Bm=e=>Fm.find(t=>t.id===(zm[e]??e))?.color??16777215,Vm=16736086;function Hm(e){return`#${e.toString(16).padStart(6,`0`)}`}function Um(e,t,n){let r=document.createElement(`div`);r.className=t,r.textContent=e;let i=new Om(r);return i.position.copy(n),i}function Wm(e,t,n,r){let i=new G().subVectors(t,e),a=new nl(new kp(n,n,i.length(),10,1,!0),r);return a.position.copy(e).addScaledVector(i,.5),a.quaternion.setFromUnitVectors(new G(0,1,0),i.normalize()),a}function Gm(e,t,n=1){let r=new Qf(new Wc().setFromPoints(e),new Vp({color:t,dashSize:.6,gapSize:.4,transparent:!0,opacity:n}));return r.computeLineDistances(),r}function Km(e,t,n=1){return new Qf(new Wc().setFromPoints(e),new Wf({color:t,transparent:n<1,opacity:n}))}function qm(e,t,n,r,i=.7){let a=new G(t.x-e.x,0,t.z-e.z).normalize();return new G(-a.z,0,a.x).multiplyScalar((n-(r-1)/2)*i)}var Jm=class{constructor(e){this.scene=e,this.root=new jf,e.add(this.root),this.groups={},this.visible=Object.fromEntries(Fm.map(e=>[e.id,!0])),this.pickables=[],this.linkMeshes={}}pos(e,t=`physical`){let n=this.net.topo.nodes.find(t=>t.id===e);return new G(n.pos.x,Rm(t),n.pos.z)}linkPoint(e,t,n,r,i,a){let o=this.pos(n,a),s=this.pos(r,a),c=this.net.topo.links.find(t=>t.id===e),l=t?c.members.findIndex(e=>e.id===t):-1,u=l>=0&&c.members.length>1?qm(this.pos(c.a.node),this.pos(c.b.node),l,c.members.length):new G;return new G().lerpVectors(o,s,i).add(u)}setVisible(e,t){this.visible[e]=t,this.groups[e]&&(this.groups[e].visible=t)}dispose(){this.root.traverse(e=>{e.geometry?.dispose(),e.material&&[].concat(e.material).forEach(e=>e.dispose()),e.element&&e.element.remove()}),this.scene.remove(this.root),this.root=new jf,this.scene.add(this.root)}build(e){this.dispose(),this.net=e,this.groups={},this.pickables=[],this.linkMeshes={};let t=e.topo.nodes.map(e=>e.pos.x),n=e.topo.nodes.map(e=>e.pos.z),r={x0:Math.min(...t)-6,x1:Math.max(...t)+6,z0:Math.min(...n)-6,z1:Math.max(...n)+6};this.box=r;for(let t of Fm){let n=new jf;n.name=t.id,n.visible=this.visible[t.id];let i=new nl(new Nl(r.x1-r.x0,r.z1-r.z0),new jc({color:t.color,transparent:!0,opacity:.06,side:2,depthWrite:!1}));i.rotation.x=-Math.PI/2,i.position.set((r.x0+r.x1)/2,t.y-.05,(r.z0+r.z1)/2),n.add(i);let a=new np(new Fp(i.geometry),new Wf({color:t.color,transparent:!0,opacity:.35}));a.rotation.copy(i.rotation),a.position.copy(i.position),n.add(a);let o=Um(t.name,`layer-label`,new G(r.x0+(r.x1-r.x0)*.25,t.y,r.z1+.5));o.element.style.color=Hm(t.color),n.add(o),this[`build_${t.id}`](n,e,t),this.groups[t.id]=n,this.root.add(n)}let i=new Wf({color:3819093,transparent:!0,opacity:.6});for(let t of e.topo.nodes){let e=t.role===`ce`?0:t.role===`pe`?Fm.at(-1).y:Rm(`mpls`),n=new Qf(new Wc().setFromPoints([this.pos(t.id),this.pos(t.id).setY(e)]),i);this.root.add(n)}}build_physical(e,t){let n={ce:7239297,pe:4892927,p:3113463};for(let r of t.topo.nodes){let t=new nl(r.role===`ce`?new kp(1.1,1.1,1.2,20):new al(2.4,1.2,2.4),new Bp({color:n[r.role],roughness:.5,metalness:.2}));t.position.copy(this.pos(r.id)).setY(.6),t.userData.node=r.id,this.pickables.push(t),e.add(t);let i=r.loopback?` ${r.loopback}`:r.lan?` ${r.lan}`:``;e.add(Um(`${r.id}${i}`,`node-label`,this.pos(r.id).setY(-1.3)))}for(let n of t.topo.links){let r=t.links[n.id],i=this.pos(n.a.node).setY(.6),a=this.pos(n.b.node).setY(.6),o=[];n.members.forEach((t,s)=>{let c=r.members[s].up,l=qm(i,a,s,n.members.length),u=new Bp({color:c?n.kind===`access`?7239297:10135480:Vm,transparent:!c,opacity:c?1:.5});o.push(u),e.add(Wm(i.clone().add(l),a.clone().add(l),.13,u))}),this.linkMeshes[n.id]=o;let s=new G().lerpVectors(i,a,.5);if(n.lag){let t=new nl(new Rp(.9,.08,8,24),new Bp({color:r.up?15774761:Vm}));t.position.copy(s);let o=new G().subVectors(a,i).normalize();t.quaternion.setFromUnitVectors(new G(0,0,1),o),e.add(t),e.add(Um(`${n.a.if} LAG ${r.distributing.length}/${n.members.length}`,`edge-label`,s.clone().setY(2)))}}}build_ring(e,t,n){(t.g8032?.rings??[]).forEach((r,i)=>{let a=t.topo.rings.find(e=>e.id===r.id),o=a.type===`sub`,s=o?Im:n.color,c=n.y+.3+(o?.7:0);for(let t of r.nodes){let n=new nl(new Lp(o?.4:.5,16,12),new Bp({color:s}));n.position.copy(this.pos(t)).setY(c),e.add(n)}for(let n of a.links){let i=t.topo.links.find(e=>e.id===n),o=this.pos(i.a.node).setY(c),l=this.pos(i.b.node).setY(c),u=r.failed.includes(n);e.add(u?Gm([o,l],Vm):Km([o,l],s));for(let t of r.blocked.filter(e=>e.link===n)){let n=this.pos(t.node).setY(c),r=t.node===i.a.node?l:o,s=new G().lerpVectors(n,r,.2),u=new G().subVectors(r,n).normalize(),d=new nl(new al(1.6,.5,.25),new Bp({color:t.why===`RPL`?Lm:Vm}));d.position.copy(s),d.quaternion.setFromUnitVectors(new G(0,0,1),u),e.add(d);let f=t.why===`RPL`?t.node===a.rpl?.owner?`RPL owner`:`RPL`:t.why===`SF`?`blocked (SF)`:`blocked (recovered)`;e.add(Um(f,`edge-label`,s.clone().setY(c+.7)))}}let l=a.rpl?t.topo.links.find(e=>e.id===a.rpl.link):null,u=l?new G().lerpVectors(this.pos(l.a.node),this.pos(l.b.node),.5):this.pos(r.nodes[0]),d=Um(`${a.name}${a.ringId===null?``:` (ring ${a.ringId})`} ${o?`sub-ring`:`major ring`} · R-APS VID ${a.rapsVid??`?`} · ${r.state}`,`edge-label`,u.setY(c+1.6+i*.8));d.element.style.color=Hm(s),e.add(d)})}build_isis(e,t,n){let r=new Set(t.igp.adjacencies.map(e=>e.area));for(let r of t.igp.routers){let t=new nl(new Lp(.55,16,12),new Bp({color:n.color}));t.position.copy(this.pos(r,`isis`)),e.add(t)}for(let i of t.igp.adjacencies){let t=i.state===`Up`,a=[this.pos(i.a,`isis`),this.pos(i.b,`isis`)];e.add(t?Km(a,n.color):Gm(a,Vm));let o=i.cost&&i.cost.a!==i.cost.b?`${i.cost.a}/${i.cost.b}`:`${i.metric}`,s=i.area&&r.size>1?` · area ${i.area}`:``;e.add(Um(`${o}${s}`,`edge-label`,new G().lerpVectors(a[0],a[1],.5).setY(n.y+.6)))}}tube(e,t,n,r){let i=t.map(e=>this.pos(e).setY(n)),a=new dp(i,!1,`catmullrom`,.1);e.add(new nl(new zp(a,40*t.length,.09,6),new jc({color:r})));let o=i.at(-1),s=new nl(new Ap(.35,.9,12),new jc({color:r}));s.position.copy(o),s.quaternion.setFromUnitVectors(new G(0,1,0),new G().subVectors(o,a.getPoint(.97)).normalize()),e.add(s)}build_mpls(e,t,n){let r=0;for(let i of t.tp.tunnels){let t=i.state===`Up`;for(let[a,o]of[[`fwd`,i.path],[`rev`,[...i.path].reverse()]]){let s=n.y+.5+r,c=t?i.role===`backup`?10381827:a===`fwd`?n.color:15912032:Vm;this.tube(e,o,s,c);for(let t=0;t+1<o.length;t++){let n=i.hops.find(e=>e.node===o[t]),r=a===`fwd`?n.fwdOut:n.revOut,c=new G().lerpVectors(this.pos(o[t],`mpls`),this.pos(o[t+1],`mpls`),a===`fwd`?.38:.62).setY(s+.5);e.add(Um(String(r),`edge-label`,c))}r+=.9}e.add(Um(`${i.id}${i.role===`backup`?` (backup)`:``} ${i.state}${i.oam?` · ${i.oam.kind.toUpperCase()}`:``}`,`edge-label`,this.pos(i.src).setY(n.y+r)))}if(t.sr.policies.length){t.sr.policies.forEach((t,i)=>{let a=n.y+.5+r+i*1.1,o=t.valid?i%2?15912032:n.color:Vm,s=t.valid?t.path:[t.headend,t.endpointNode??t.headend];s.length>1&&this.tube(e,s,a,o);let c=this.pos(t.headend).setY(a+.6);e.add(Um(`${t.name} [${t.segmentList.sids.join(` `)}]${t.valid?``:` INVALID`}`,`edge-label`,c))});return}let i=t.topo.nodes.filter(e=>e.role===`pe`).map(e=>e.id),a=0;for(let o of i)for(let s of i){if(o===s)continue;let i=`${t.topo.nodes.find(e=>e.id===s).loopback}/32`,c=[o],l=t.mpls.ftn[o]?.[i]?.nextHops[0],u=[],d=o,f=0;for(;l&&f++<16&&(u.push({from:d,to:l.node,label:l.label}),c.push(l.node),d=l.node,d!==s);){let e=t.mpls.lfib[d]?.[l.label];if(!e)break;let n=e.nextHops[0];l={node:n.node,label:n.op===`pop`?3:n.outLabel}}if(c.at(-1)!==s)continue;let p=.5+r+a*1.2,m=a%2?15912032:n.color;this.tube(e,c,n.y+p,m);for(let t of u){let r=a%2?.62:.38,i=new G().lerpVectors(this.pos(t.from,`mpls`),this.pos(t.to,`mpls`),r).setY(n.y+p+.5);e.add(Um(t.label===3?`imp-null`:String(t.label),`edge-label`,i))}a++}}build_bgp(e,t,n){for(let r of t.bgp.speakers){let t=new nl(new Lp(.7,16,12),new Bp({color:n.color}));t.position.copy(this.pos(r,`bgp`)),e.add(t)}for(let r of t.bgp.sessions){let i=this.pos(r.a,`bgp`),a=this.pos(r.b,`bgp`),o=new G().lerpVectors(i,a,.5).setY(n.y+4),s=new Dp(i,o,a).getPoints(40);e.add(r.state===`Established`?Km(s,n.color):Gm(s,Vm));let c=t.topo.bgp?.sessions?r.client?`RR client ${r.client}`:``:`VPNv4`;e.add(Um(`iBGP ${r.state}${c?` · ${c}`:``}`,`edge-label`,o.clone().setY(n.y+2.4)))}}build_pw(e,t,n){t.vpws.pseudowires.forEach((t,r)=>{let[i,a]=t.ends.map(e=>this.pos(e.node,`pw`)),o=t.state===`Up`,s=new G().lerpVectors(i,a,.5).setY(n.y+3+r*1.2);e.add((o?Km:Gm)(new Dp(i,s,a).getPoints(40),o?n.color:Vm));for(let r of t.ends){let t=new nl(new Lp(.5,16,12),new Bp({color:n.color}));t.position.copy(this.pos(r.node,`pw`)),e.add(t)}let c=[...new Set(t.ends.map(e=>e.transport.tunnel??e.transport.policy??e.underlay))].join(` / `);e.add(Um(`${t.service} PW ${t.pwid} ${t.state} · ${c}`,`edge-label`,s.clone().setY(s.y-.8)))})}build_cfm(e,t,n){for(let r of t.cfm.megs.filter(e=>e.pseudowire)){let[t,i]=r.meps.map(e=>this.pos(e.node,`cfm`)),a=r.meps.some(e=>e.defect),o=new G().lerpVectors(t,i,.5).setY(n.y+3),s=new Dp(t,o,i);e.add(Gm(s.getPoints(40),a?Vm:n.color,.9));for(let[t,i]of[[r.meps[0],.1],[r.meps[1],.9]]){let r=new nl(new Ap(.4,.9,12),new Bp({color:t.defect?Vm:n.color}));r.position.copy(s.getPoint(i)),e.add(r),e.add(Um(`MEP ${t.mepId}`,`edge-label`,s.getPoint(i).setY(s.getPoint(i).y+.9)))}e.add(Um(`${r.id} MD${r.level} ${r.intervalMs>=1e3?`${r.intervalMs/1e3} s`:`${r.intervalMs} ms`}${a?` DEFECT`:``}`,`edge-label`,o.clone().setY(o.y-.8)))}for(let r of t.cfm.megs.filter(e=>!e.pseudowire)){let i=t.topo.links.find(e=>e.id===r.link),a=this.pos(i.a.node,`cfm`),o=this.pos(i.b.node,`cfm`),s=r.meps.some(e=>e.defect);e.add(Gm([a,o],s?Vm:n.color,.9));for(let[t,i,s]of[[r.meps[0],a,o],[r.meps[1],o,a]]){let r=new G().lerpVectors(i,s,.18),a=new nl(new Ap(.4,.9,12),new Bp({color:t.defect?Vm:n.color}));a.position.copy(r),a.quaternion.setFromUnitVectors(new G(0,1,0),new G().subVectors(s,i).normalize()),e.add(a)}e.add(Um(`MD${r.level} ${r.intervalMs} ms${s?` DEFECT`:``}`,`edge-label`,new G().lerpVectors(a,o,.5).setY(n.y+.6)))}}highlight(e=[]){for(let[t,n]of Object.entries(this.linkMeshes))for(let r of n)r.emissive?.setHex(e.includes(t)?8006144:0)}},Ym={"Ethernet II":`#8b98a8`,"IEEE 802.3":`#8b98a8`,LLC:`#6e7681`,MPLS:`#d29922`,IPv4:`#4aa8ff`,UDP:`#58a6ff`,TCP:`#58a6ff`,"IS-IS":`#3fb950`,OSPF:`#3fb950`,"Router-LSA":`#3fb950`,"Router-LSA links":`#3fb950`,"G-ACh BFD CC":`#d29922`,"BGP UPDATE":`#a371f7`,"CFM CCM":`#39c5cf`,"R-APS":`#e3b341`,"Ethernet II (customer)":`#f778ba`,Payload:`#f778ba`},Xm={facts:`#3fb950`,authored:`#58a6ff`,derived:`#8b98a8`,default:`#d29922`},X=e=>String(e).replace(/[&<>"]/g,e=>({"&":`&amp;`,"<":`&lt;`,">":`&gt;`,'"':`&quot;`})[e]);function Zm(e,t,n){e.innerHTML=``,t?.steps.forEach((r,i)=>{let a=document.createElement(`li`);a.className=r.status;let o=r.layer??t.layer;a.innerHTML=`<span class="n">${i+1}</span><span class="layer-tag" style="background:${Hm(Bm(o))}">${X(o)}</span><span class="t">${X(r.title)}</span>`,a.addEventListener(`click`,()=>n(i)),e.appendChild(a)})}function Qm(e,t){[...e.children].forEach((e,n)=>e.classList.toggle(`active`,n===t)),e.children[t]?.scrollIntoView({block:`nearest`})}function $m(e){let t=Object.entries(e.fields).filter(([,e])=>e!=null).map(([e,t])=>`<tr><td>${X(e)}</td><td>${X(t)}</td></tr>`).join(``);return`<div class="hdr" style="border-color:${Ym[e.name]??(e.name.startsWith(`TLV`)?`#3fb950`:`#8b98a8`)}"><div class="name">${X(e.name)}</div><table>${t}</table></div>`}function eh(e,t){if(!t){e.innerHTML=``;return}let n=t.moves.length===1?t.moves[0]:null;e.innerHTML=`
    <div class="kv">at <b>${X(t.node)}</b>${n?` &rarr; ${X(n.to)} on ${X(n.link)}${n.member&&n.member!==n.link?` (member ${X(n.member)})`:``}`:``}</div>
    ${t.lookup?`<div class="lookup"><b>${X(t.lookup.table)}</b> &middot; key ${X(t.lookup.key)}<br/>${X(t.lookup.result)}</div>`:``}
    <ul class="actions">${t.actions.map(e=>`<li>${X(e)}</li>`).join(``)}</ul>
    ${t.headers.length?`<h2>Header stack (outermost first)</h2><div class="stack">${t.headers.map($m).join(``)}</div>`:``}
  `}function th(e,t){return t.length?`<table class="tbl"><tr>${e.map(e=>`<th>${X(e)}</th>`).join(``)}</tr>${t.map(e=>`<tr>${e.map(e=>`<td>${X(e)}</td>`).join(``)}</tr>`).join(``)}</table>`:`<p class="sub">none</p>`}function nh(e,t,n){let r=t.topo.nodes.find(e=>e.id===n);if(!r){e.innerHTML=``;return}let i=`<h2 style="color:var(--text);font-size:14px;text-transform:none">${X(r.id)} <span class="sub">${r.role.toUpperCase()} ${X(r.loopback??r.lan??``)}${r.model?` · ${X(r.model)}`:``}</span></h2>`,a=t.topo.links.filter(e=>e.a.node===n||e.b.node===n).map(e=>{let t=e.a.node===n?e.a:e.b,r=e.a.node===n?e.b:e.a;return[t.if,t.port??`-`,t.ip??`-`,`${r.node}${r.port?`:${r.port}`:``}`]});if(i+=`<h2>Interfaces</h2>`,i+=th([`if`,`port`,`address`,`to`],a),t.ospf.lsas[n]&&(i+=`<h2>OSPF neighbours</h2>`,i+=th([`neighbour`,`link`,`area`,`cost`,`state`],t.ospf.adjacencies.filter(e=>e.a===n||e.b===n).map(e=>[e.a===n?e.b:e.a,e.link,e.area,e.cost[e.a===n?`a`:`b`],e.nbrState]))),t.igp.rib[n]){let e=t.igpName===`ospf`;i+=`<h2>${e?`OSPF`:`IS-IS`} routes</h2>`,i+=th(e?[`prefix`,`metric`,`type`,`next hop`]:[`prefix`,`metric`,`next hop`],Object.values(t.igp.rib[n]).map(t=>[t.prefix,t.metric,...e?[`${t.type} ${t.area}`]:[],t.local?`local`:t.nextHops.map(e=>`${e.node} (${e.link})`).join(`, `)]))}t.igp.rib[n]&&t.mpls.mode!==`none`&&(i+=`<h2>LFIB (${t.mpls.mode.toUpperCase()})</h2>`,i+=th([`in`,`FEC`,`op`,`out`,`next hop`],Object.values(t.mpls.lfib[n]??{}).flatMap(e=>e.nextHops.map(t=>[e.inLabel,e.fec,t.op,t.outLabel??`-`,t.node]))));let o=Object.values(t.tp.lfib[n]??{}),s=Object.entries(t.tp.head[n]??{});if(o.length||s.length){i+=`<h2>MPLS-TP static LSPs</h2>`,i+=th([`tunnel`,`dir`,`in`,`op`,`out`,`next hop`],[...s.map(([e,t])=>[e,t.dir,`(ingress)`,`push`,t.outLabel,t.next]),...o.map(e=>[e.tunnel,e.dir,e.inLabel,e.op,e.outLabel??`-`,e.next??`(end point)`])]);let e=t.tp.tunnels.filter(e=>e.src===n||e.dst===n);e.length&&(i+=th([`tunnel`,`role`,`LSP_ID (RFC 6370)`,`here`,`OAM`],e.map(e=>[e.id,e.role,e.ids.lspId,e.endState[n],e.oam?`${e.oam.kind} ${e.detectionMs} ms`:`none`])))}for(let[e,r]of Object.entries(t.bgp.vrfs[n]??{}))i+=`<h2>VRF ${X(e)}</h2>`,i+=th([`prefix`,`type`,`via`,`VPN label`],Object.values(r).map(e=>[e.prefix,e.type===`static`?`static pref ${e.preference}`:e.type,e.type===`bgp`?`${e.nextHop} (IGP ${e.igpCost})`:e.type===`local`?e.if:`${e.via.ip??``} ${e.via.node??`-`}${e.alternatives?.length>1?` [${e.alternatives.filter(e=>e.state!==`active`).map(e=>`${e.nextHop} pref ${e.preference} ${e.state}`).join(`, `)}]`:``}`.trim(),e.vpnLabel]));let c=t.sr.policies.filter(e=>e.headend===n);c.length&&(i+=`<h2>SR policies (headend)</h2>`,i+=th([`name`,`color`,`endpoint`,`segment list`,`state`],c.map(e=>[e.name,e.color,e.endpoint,e.segmentList.sids.join(` `),e.valid?e.path.join(`>`):e.reason])));let l=t.vpws.pseudowires.flatMap(e=>e.ends.filter(e=>e.node===n).map(t=>[e.service,e.pwid,t.peer,`${t.ac.name} (${t.ac.port})`,t.localLabel,t.remoteLabel,t.transport.tunnel??t.transport.policy??t.underlay,e.state]));l.length&&(i+=`<h2>Pseudowires</h2>`,i+=th([`service`,`pwid`,`peer`,`AC`,`in`,`out`,`via`,`state`],l));let u=t.topo.links.filter(e=>e.lag&&(e.a.node===n||e.b.node===n));for(let e of u){let n=t.links[e.id];i+=`<h2>LACP ${X(e.id)}</h2>`,i+=th([`member`,`actor state`,`flags`],n.members.map(e=>[e.id,`0x${e.actorState.toString(16).padStart(2,`0`)}`,ot(e.actorState).join(` `)]))}let d=t.cfm.megs.flatMap(e=>e.meps.filter(e=>e.node===n).map(t=>[e.id,t.mepId,t.direction,t.if,t.defect??`ok`]));d.length&&(i+=`<h2>CFM MEPs</h2>`,i+=th([`MEG`,`MEP`,`dir`,`if`,`state`],d)),e.innerHTML=i}function rh(e,t){if(!t){e.innerHTML=``;return}let{topology:n,gaps:r,warnings:i}=t,a=e=>`<span class="layer-tag" style="background:${Xm[e]}">${X(e)}</span>`,o=`<h2 style="color:var(--text);font-size:14px;text-transform:none">${X(n.name)}</h2>`;o+=`<p class="sub">Where each layer's data came from: ${Object.keys(Xm).map(a).join(` `)}. Authored, derived and default items are not in the configurations.</p>`;for(let[e,t]of Object.entries(r)){o+=`<h2><span class="layer-tag" style="background:${Hm(Bm(e))}">${X(e)}</span></h2>`,o+=`<ul class="gaps">`;for(let e of t)o+=`<li>${a(e.source)} <b>${X(e.item)}</b>: ${X(e.detail)}</li>`;o+=`</ul>`}i.length&&(o+=`<h2>Import warnings</h2><ul class="gaps">${i.map(e=>`<li>${X(e)}</li>`).join(``)}</ul>`),e.innerHTML=o}var ih=e=>String(e??``).replace(/[&<>"]/g,e=>({"&":`&amp;`,"<":`&lt;`,">":`&gt;`,'"':`&quot;`})[e]),ah=e=>e==null||e===``?`-`:e,oh=e=>`#device=${encodeURIComponent(e)}`,sh=e=>`#service=${encodeURIComponent(e)}`,ch=e=>`<a href="${oh(e)}">${ih(e)}</a>`,lh=e=>`<a href="${sh(e.id)}">${ih(e.name)}</a>`;function uh(e,t){if(!t.length)return`<p class="sub">none</p>`;let n=e=>`<td>${e&&typeof e==`object`&&`html`in e?e.html:ih(ah(e))}</td>`;return`<table class="tbl"><tr>${e.map(e=>`<th>${ih(e)}</th>`).join(``)}</tr>${t.map(e=>`<tr>${e.map(n).join(``)}</tr>`).join(``)}</table>`}function dh(e){return`<table class="kvt">${e.map(([e,t])=>`<tr><td>${ih(e)}</td><td>${t&&typeof t==`object`&&`html`in t?t.html:ih(ah(t))}</td></tr>`).join(``)}</table>`}function fh(e){let t=e.transport;return t.error?`down: ${t.error}`:t.kind===`sr-policy`?`SR policy ${t.policy} [${t.stack.join(` `)}]`:t.kind===`sr`?`Prefix-SID ${t.stack.join(` `)}`:t.kind===`mpls-tp`?`MPLS-TP ${t.tunnel}${t.switched?` (protecting ${t.configured})`:``} [${t.stack.join(` `)}]`:t.kind??e.underlay}function ph(e,t,n){let{file:r,topology:i,services:a}=t,o=r.generator??{},s=Object.fromEntries(i.nodes.map(e=>[e.id,e.role])),c=`<h2 class="title">${ih(i.name)}</h2>`;c+=`<p class="sub">Facts schema ${ih(r.schema_version)} · ${ih(o.name)} ${ih(o.version)}${o.translator?` · ${ih(o.translator.replace(/\s*\(.*\)$/,``))}`:``}</p>`,c+=`<h2>Devices</h2>`,c+=uh([`device`,`type`,`role`,`loopback`,`status`,`PWs`,`MEPs`],r.devices.map(e=>{let t=i.nodes.find(t=>t.id===e.device);return[t?{html:ch(e.device)}:e.device,e.type,t?s[e.device].toUpperCase():`-`,t?.loopback,e.status,e.facts?.pseudowires?.length??0,e.facts?.cfm?.meps?.length??0]})),c+=`<h2>Services</h2>`,c+=uh([`service`,`ends`,`PW id`,`transport`,`state`,`MEG`],a.map(e=>{let t=n.vpws.pseudowires.find(t=>t.id===e.pseudowire),r=[...new Set(t.ends.map(e=>({"sr-policy":`SR policy`,sr:`Prefix-SID`,"mpls-tp":`MPLS-TP`})[e.transport.kind]??e.transport.kind??`down`))];return[{html:lh(e)},{html:e.ends.map(e=>ch(e.node)).join(` – `)},t.pwid,r.join(` / `),t.state,e.meg]})),c+=`<h2>SR policies</h2>`,c+=uh([`policy`,`headend`,`color`,`endpoint`,`segment list`,`path`],n.sr.policies.map(e=>[e.name,{html:ch(e.headend)},e.color,e.endpointNode??e.endpoint,e.segmentList.sids.join(` `),e.valid?e.path.join(` > `):e.reason])),n.tp.tunnels.length&&(c+=`<h2>MPLS-TP tunnels</h2>`,c+=uh([`tunnel`,`role`,`path`,`OAM`,`state`],n.tp.tunnels.map(e=>[e.id,e.role===`backup`?`backup of ${e.protects??`?`}`:e.role,e.path.join(` > `),e.oam?`${e.oam.kind.toUpperCase()}${e.oam.intervalMs?` ${e.oam.intervalMs} ms`:``}`:null,`${e.state}${e.reasons.length?` (${e.reasons.join(`; `)})`:``}`]))),c+=`<h2>BGP sessions</h2>`,c+=uh([`a`,`b`,`RR client`,`state`],n.bgp.sessions.map(e=>[{html:ch(e.a)},{html:ch(e.b)},e.client,`${e.state}${e.reason?` (${e.reason})`:``}`])),i.rings?.length&&(c+=`<h2>G.8032 rings</h2>`,c+=uh([`ring`,`type`,`R-APS VID`,`nodes`,`RPL`,`protects`,`state`],i.rings.map(e=>{let t=n.g8032.rings.find(t=>t.id===e.id),r=e.type===`sub`?`sub-ring${e.subRingOf?` of ${i.rings.find(t=>t.id===e.subRingOf)?.name??e.subRingOf}`:``}`:e.type===`major`?`major ring`:null;return[`${e.name}${e.ringId===null?``:` (${e.ringId})`}`,r,e.rapsVid,{html:e.path.nodes.map(ch).join(` – `)+(e.path.closed?` – ${ch(e.path.nodes[0])}`:``)},e.rpl?`${e.rpl.link}: owner ${e.rpl.owner}${e.rpl.neighbor?`, neighbour ${e.rpl.neighbor}`:``}`:`no owner`,e.members.join(`, `),`${t.state}${t.failed.length?` (${t.failed.join(`, `)} down)`:``}`]}))),e.innerHTML=c}function mh(e,t,n,r){let i=t.file.devices.find(e=>e.device===r);if(!i){e.innerHTML=`<p class="sub">No device ${ih(r)} in this facts file.</p>`;return}let a=i.facts??{},o=t.topology.nodes.find(e=>e.id===r),s=a.isis?.instances?.[0],c=a.segment_routing,l=a.bgp?.instances?.[0],u=c?.prefix_sids?.find(e=>e.node),d=c?.srgb?.[0],f=`<h2 class="title">${ih(r)} <span class="sub">${ih(o?o.role.toUpperCase():`not shown`)}</span></h2>`;f+=dh([[`type`,i.type],[`platform`,i.platform],[`extractor`,i.extractor],[`status`,`${i.status}${i.reason?` (${i.reason})`:``}`],[`hostname`,a.hostname],[`files`,{html:(i.templates??[]).map(ih).join(`<br/>`)||`-`}]]),s&&(f+=`<h2>IS-IS</h2>`,f+=dh([[`instance`,s.name],[`level`,s.level],[`NET`,s.net],[`area`,Er(s)],[`system id`,s.system_id],[`segment routing`,s.sr_enabled===null||s.sr_enabled===void 0?null:s.sr_enabled?`enabled`:`disabled`]]));let p=(a.ospf?.instances??[])[0];if(p&&(f+=`<h2>OSPF</h2>`,f+=dh([[`instance`,p.name],[`router id`,p.router_id],[`VRF`,p.vrf],[`areas`,p.areas.map(e=>`${e.area}${e.type?` (${e.type})`:``}`).join(`, `)]]),f+=uh([`interface`,`area`,`type`,`metric`,`passive`,`BFD`],(a.ospf.interfaces??[]).filter(e=>e.instance===p.name).map(e=>[e.interface,e.area,e.type,e.metric,e.passive?`yes`:`no`,e.bfd?`yes`:`no`]))),c&&(d||u)&&(f+=`<h2>Segment routing</h2>`,f+=dh([[`SRGB`,d?`${d.lower}-${d.upper}`:null],[`node SID`,u?`${u.prefix} ${u.value_type} ${u.sid}${d&&u.value_type===`index`?` (label ${Number(d.lower)+Number(u.sid)})`:``}`:null]])),l){f+=`<h2>BGP</h2>`,f+=dh([[`AS`,l.as],[`router id`,l.router_id],[`route reflector`,l.route_reflector?`yes${l.cluster_id?`, cluster ${l.cluster_id}`:``}`:`no`]]);let e=Object.fromEntries(t.topology.nodes.map(e=>[e.loopback,e.id]));f+=uh([`neighbour`,`device`,`AS`,`RR client`,`families`,`session`],(a.peers??[]).filter(e=>e.kind===`bgp`).map(t=>{let i=e[t.ip],a=i&&n.bgp.sessions.find(e=>[e.a,e.b].includes(r)&&[e.a,e.b].includes(i));return[t.ip,i?{html:ch(i)}:null,t.remote_as,t.route_reflector_client?`yes`:`no`,(t.address_families??[]).join(`, `),a?`${a.state}${a.reason?` (${a.reason})`:``}`:null]}))}let m=(t.topology.rings??[]).filter(e=>e.nodes.some(e=>e.node===r));m.length&&(f+=`<h2>G.8032 rings</h2>`,f+=uh([`ring`,`type`,`ring ports`,`RPL role`,`R-APS VID / level`,`WTR / guard / hold-off`,`revertive`],m.map(e=>{let t=e.nodes.find(e=>e.node===r),i=n.g8032.rings.find(t=>t.id===e.id).blocked.filter(e=>e.node===r).map(e=>e.link);return[e.name,e.type===`sub`?`sub-ring${t.terminates?` (terminates here)`:``}`:e.type,t.ports.map(e=>`${e.name}: port ${ah(e.if)} -> ${e.link??`no link`}${i.includes(e.link)?` [blocked]`:``}`).join(`; `),t.rpl?`${t.rpl} (${t.rplPort})`:null,`${ah(e.rapsVid)} / ${ah(e.level)}`,`${e.wtrMin??`default`} min / ${e.guardMs??`default`} ms / ${e.holdOffMs??`default`} ms`,e.revertive===null?`default (yes)`:e.revertive?`yes`:`no`]})));let h=t.services.filter(e=>e.ends.some(e=>e.node===r));h.length&&(f+=`<h2>Services</h2>`,f+=uh([`service`,`AC`,`peer`],h.map(e=>{let t=e.ends.find(e=>e.node===r),n=e.ends.find(e=>e!==t);return[{html:lh(e)},`${ah(t.fp)} (port ${ah(t.port)})`,{html:ch(n.node)}]}))),e.innerHTML=`${f}<div class="engine-node"></div>`,o&&nh(e.querySelector(`.engine-node`),n,r)}function hh(e,t,n,r,i){let a=t.services.find(e=>e.id===r);if(!a){e.innerHTML=`<p class="sub">No service ${ih(r)}.</p>`;return}let o=n.vpws.pseudowires.find(e=>e.id===a.pseudowire),s=a.meg&&n.cfm.megs.find(e=>e.id===a.meg),c=`<h2 class="title">${ih(a.name)} <span class="sub">${ih(a.type.toUpperCase())} · PW ${ih(o.pwid)} · ${ih(o.state)}</span></h2>`;o.reasons.length&&(c+=`<ul class="gaps">${o.reasons.map(e=>`<li class="warn">${ih(e)}</li>`).join(``)}</ul>`),c+=`<h2>Pseudowire ends</h2>`,c+=uh([`end`,`AC`,`PW label in / out`,`transport`,`path`],o.ends.map(e=>[{html:ch(e.node)},`${ah(e.ac.name)} (port ${ah(e.ac.port)})`,`${e.localLabel} / ${e.remoteLabel}`,fh(e),e.transport.path?e.transport.path.join(` > `):`${e.node} > … > ${e.peer} (IGP shortest path)`])),c+=o.static?`<p class="sub">Static pseudowire: the PW labels are configured at each end (no targeted LDP).</p>`:`<p class="sub">Targeted LDP between the loopbacks: ${ih(o.tldp)}. PW labels are allocated by the view (the facts carry none for LDP-signalled PWs).</p>`,s&&(c+=`<h2>CFM</h2>`,c+=dh([[`MD / MA`,`${ah(t.topology.cfm.megs.find(e=>e.id===s.id)?.md)} / ${s.id}`],[`level`,s.level],[`CCM interval`,s.intervalMs>=1e3?`${s.intervalMs/1e3} s`:`${s.intervalMs} ms`]]),c+=uh([`MEP`,`device`,`flow point`,`direction`,`state`],s.meps.map(e=>[e.mepId,{html:ch(e.node)},e.if,e.direction,e.defect??`ok`]))),c+=`<div class="row">`;for(let e of o.ends)c+=`<button type="button" data-walk-from="${ih(e.node)}">Walk a frame from ${ih(e.node)}</button>`;s&&(c+=`<button type="button" data-walk-ccm>CCM stream</button>`),c+=`</div>`,e.innerHTML=c;for(let t of e.querySelectorAll(`[data-walk-from]`))t.addEventListener(`click`,()=>i.walkPw(o.id,t.dataset.walkFrom));e.querySelector(`[data-walk-ccm]`)?.addEventListener(`click`,()=>i.walkCcm(s.id))}var gh=1100;function _h(e){let t=e.headers.filter(e=>e.name===`MPLS`).map(e=>e.fields.label);if(t.length)return`MPLS ${t.join(` | `)}`;let n=e.headers.map(e=>e.name);return n.includes(`IS-IS`)?`LSP`:n.includes(`CFM CCM`)?`CCM`:n.includes(`R-APS`)?e.headers.find(e=>e.name===`R-APS`).fields.request.split(` `)[0]===`SF`?`R-APS(SF)`:`R-APS(NR)`:n.includes(`BGP UPDATE`)?`BGP`:n.includes(`IPv4`)?`IPv4`:``}var vh=class{constructor(e,t){this.scene=e,this.layers=t,this.group=new jf,e.add(this.group),this.packets=[],this.pulse=null}clear(){for(let e of this.packets)e.label?.element.remove(),this.group.remove(e.mesh),e.mesh.geometry.dispose(),e.mesh.material.dispose();this.packets=[],this.pulse&&=(this.group.remove(this.pulse.mesh),null)}show(e,t){this.clear();let n=e.layer??t,r=e.status===`dropped`?16736086:Bm(n===`physical`?`mpls`:n),i=_h(e);for(let t of e.moves){let a=new nl(new Lp(.45,16,12),new Bp({color:t.duplicate?9148584:r,emissive:t.duplicate?0:r,emissiveIntensity:.6}));this.group.add(a);let o=null;if(i&&e.moves.length===1){let e=document.createElement(`div`);e.className=`pkt-label`,e.textContent=i,o=new Om(e),o.position.set(0,1.1,0),a.add(o)}this.packets.push({mesh:a,move:t,layer:n,label:o})}if(!e.moves.length&&e.node){let t=this.layers.pos(e.node,n),i=new nl(new Ip(1.4,1.7,32),new jc({color:r,side:2,transparent:!0,opacity:.9}));i.rotation.x=-Math.PI/2,i.position.copy(t).setY(t.y+.1),this.group.add(i),this.pulse={mesh:i}}this.update(0)}update(e){for(let t of this.packets){let n=t.move.lost?Math.min(e,.5):e,r=this.layers.linkPoint(t.move.link,t.move.member,t.move.from,t.move.to,n,t.layer);r.y+=t.layer===`physical`?1.2:.6,t.mesh.position.copy(r),t.move.lost&&e>.5&&(t.mesh.material.color.setHex(16736086),t.mesh.material.emissive.setHex(16736086),t.mesh.scale.setScalar(Math.max(.05,1.5-e*1.5)))}if(this.pulse){let t=1+.25*Math.sin(e*Math.PI*4);this.pulse.mesh.scale.set(t,t,t)}}},yh={type:`change`},bh={type:`start`},xh={type:`end`},Sh=new Fs,Ch=new Dl,wh=Math.cos(70*Mo.DEG2RAD),Th=new G,Eh=2*Math.PI,Z={NONE:-1,ROTATE:0,DOLLY:1,PAN:2,TOUCH_ROTATE:3,TOUCH_PAN:4,TOUCH_DOLLY_PAN:5,TOUCH_DOLLY_ROTATE:6},Dh=1e-6,Oh=class extends Dm{constructor(e,t=null){super(e,t),this.state=Z.NONE,this.enabled=!0,this.target=new G,this.cursor=new G,this.minDistance=0,this.maxDistance=1/0,this.minZoom=0,this.maxZoom=1/0,this.minTargetRadius=0,this.maxTargetRadius=1/0,this.minPolarAngle=0,this.maxPolarAngle=Math.PI,this.minAzimuthAngle=-1/0,this.maxAzimuthAngle=1/0,this.enableDamping=!1,this.dampingFactor=.05,this.enableZoom=!0,this.zoomSpeed=1,this.enableRotate=!0,this.rotateSpeed=1,this.enablePan=!0,this.panSpeed=1,this.screenSpacePanning=!0,this.keyPanSpeed=7,this.zoomToCursor=!1,this.autoRotate=!1,this.autoRotateSpeed=2,this.keys={LEFT:`ArrowLeft`,UP:`ArrowUp`,RIGHT:`ArrowRight`,BOTTOM:`ArrowDown`},this.mouseButtons={LEFT:Di.ROTATE,MIDDLE:Di.DOLLY,RIGHT:Di.PAN},this.touches={ONE:Oi.ROTATE,TWO:Oi.DOLLY_PAN},this.target0=this.target.clone(),this.position0=this.object.position.clone(),this.zoom0=this.object.zoom,this._domElementKeyEvents=null,this._lastPosition=new G,this._lastQuaternion=new os,this._lastTargetPosition=new G,this._quat=new os().setFromUnitVectors(e.up,new G(0,1,0)),this._quatInverse=this._quat.clone().invert(),this._spherical=new Em,this._sphericalDelta=new Em,this._scale=1,this._panOffset=new G,this._rotateStart=new H,this._rotateEnd=new H,this._rotateDelta=new H,this._panStart=new H,this._panEnd=new H,this._panDelta=new H,this._dollyStart=new H,this._dollyEnd=new H,this._dollyDelta=new H,this._dollyDirection=new G,this._mouse=new H,this._performCursorZoom=!1,this._pointers=[],this._pointerPositions={},this._controlActive=!1,this._onPointerMove=Ah.bind(this),this._onPointerDown=kh.bind(this),this._onPointerUp=jh.bind(this),this._onContextMenu=Rh.bind(this),this._onMouseWheel=Ph.bind(this),this._onKeyDown=Fh.bind(this),this._onTouchStart=Ih.bind(this),this._onTouchMove=Lh.bind(this),this._onMouseDown=Mh.bind(this),this._onMouseMove=Nh.bind(this),this._interceptControlDown=zh.bind(this),this._interceptControlUp=Bh.bind(this),this.domElement!==null&&this.connect(),this.update()}connect(){this.domElement.addEventListener(`pointerdown`,this._onPointerDown),this.domElement.addEventListener(`pointercancel`,this._onPointerUp),this.domElement.addEventListener(`contextmenu`,this._onContextMenu),this.domElement.addEventListener(`wheel`,this._onMouseWheel,{passive:!1}),this.domElement.getRootNode().addEventListener(`keydown`,this._interceptControlDown,{passive:!0,capture:!0}),this.domElement.style.touchAction=`none`}disconnect(){this.domElement.removeEventListener(`pointerdown`,this._onPointerDown),this.domElement.removeEventListener(`pointermove`,this._onPointerMove),this.domElement.removeEventListener(`pointerup`,this._onPointerUp),this.domElement.removeEventListener(`pointercancel`,this._onPointerUp),this.domElement.removeEventListener(`wheel`,this._onMouseWheel),this.domElement.removeEventListener(`contextmenu`,this._onContextMenu),this.stopListenToKeyEvents(),this.domElement.getRootNode().removeEventListener(`keydown`,this._interceptControlDown,{capture:!0}),this.domElement.style.touchAction=`auto`}dispose(){this.disconnect()}getPolarAngle(){return this._spherical.phi}getAzimuthalAngle(){return this._spherical.theta}getDistance(){return this.object.position.distanceTo(this.target)}listenToKeyEvents(e){e.addEventListener(`keydown`,this._onKeyDown),this._domElementKeyEvents=e}stopListenToKeyEvents(){this._domElementKeyEvents!==null&&(this._domElementKeyEvents.removeEventListener(`keydown`,this._onKeyDown),this._domElementKeyEvents=null)}saveState(){this.target0.copy(this.target),this.position0.copy(this.object.position),this.zoom0=this.object.zoom}reset(){this.target.copy(this.target0),this.object.position.copy(this.position0),this.object.zoom=this.zoom0,this.object.updateProjectionMatrix(),this.dispatchEvent(yh),this.update(),this.state=Z.NONE}update(e=null){let t=this.object.position;Th.copy(t).sub(this.target),Th.applyQuaternion(this._quat),this._spherical.setFromVector3(Th),this.autoRotate&&this.state===Z.NONE&&this._rotateLeft(this._getAutoRotationAngle(e)),this.enableDamping?(this._spherical.theta+=this._sphericalDelta.theta*this.dampingFactor,this._spherical.phi+=this._sphericalDelta.phi*this.dampingFactor):(this._spherical.theta+=this._sphericalDelta.theta,this._spherical.phi+=this._sphericalDelta.phi);let n=this.minAzimuthAngle,r=this.maxAzimuthAngle;isFinite(n)&&isFinite(r)&&(n<-Math.PI?n+=Eh:n>Math.PI&&(n-=Eh),r<-Math.PI?r+=Eh:r>Math.PI&&(r-=Eh),n<=r?this._spherical.theta=Math.max(n,Math.min(r,this._spherical.theta)):this._spherical.theta=this._spherical.theta>(n+r)/2?Math.max(n,this._spherical.theta):Math.min(r,this._spherical.theta)),this._spherical.phi=Math.max(this.minPolarAngle,Math.min(this.maxPolarAngle,this._spherical.phi)),this._spherical.makeSafe(),this.enableDamping===!0?this.target.addScaledVector(this._panOffset,this.dampingFactor):this.target.add(this._panOffset),this.target.sub(this.cursor),this.target.clampLength(this.minTargetRadius,this.maxTargetRadius),this.target.add(this.cursor);let i=!1;if(this.zoomToCursor&&this._performCursorZoom||this.object.isOrthographicCamera)this._spherical.radius=this._clampDistance(this._spherical.radius);else{let e=this._spherical.radius;this._spherical.radius=this._clampDistance(this._spherical.radius*this._scale),i=e!=this._spherical.radius}if(Th.setFromSpherical(this._spherical),Th.applyQuaternion(this._quatInverse),t.copy(this.target).add(Th),this.object.lookAt(this.target),this.enableDamping===!0?(this._sphericalDelta.theta*=1-this.dampingFactor,this._sphericalDelta.phi*=1-this.dampingFactor,this._panOffset.multiplyScalar(1-this.dampingFactor)):(this._sphericalDelta.set(0,0,0),this._panOffset.set(0,0,0)),this.zoomToCursor&&this._performCursorZoom){let e=null;if(this.object.isPerspectiveCamera){let t=Th.length();e=this._clampDistance(t*this._scale);let n=t-e;this.object.position.addScaledVector(this._dollyDirection,n),this.object.updateMatrixWorld(),i=!!n}else if(this.object.isOrthographicCamera){let t=new G(this._mouse.x,this._mouse.y,0);t.unproject(this.object);let n=this.object.zoom;this.object.zoom=Math.max(this.minZoom,Math.min(this.maxZoom,this.object.zoom/this._scale)),this.object.updateProjectionMatrix(),i=n!==this.object.zoom;let r=new G(this._mouse.x,this._mouse.y,0);r.unproject(this.object),this.object.position.sub(r).add(t),this.object.updateMatrixWorld(),e=Th.length()}else console.warn(`WARNING: OrbitControls.js encountered an unknown camera type - zoom to cursor disabled.`),this.zoomToCursor=!1;e!==null&&(this.screenSpacePanning?this.target.set(0,0,-1).transformDirection(this.object.matrix).multiplyScalar(e).add(this.object.position):(Sh.origin.copy(this.object.position),Sh.direction.set(0,0,-1).transformDirection(this.object.matrix),Math.abs(this.object.up.dot(Sh.direction))<wh?this.object.lookAt(this.target):(Ch.setFromNormalAndCoplanarPoint(this.object.up,this.target),Sh.intersectPlane(Ch,this.target))))}else if(this.object.isOrthographicCamera){let e=this.object.zoom;this.object.zoom=Math.max(this.minZoom,Math.min(this.maxZoom,this.object.zoom/this._scale)),e!==this.object.zoom&&(this.object.updateProjectionMatrix(),i=!0)}return this._scale=1,this._performCursorZoom=!1,i||this._lastPosition.distanceToSquared(this.object.position)>Dh||8*(1-this._lastQuaternion.dot(this.object.quaternion))>Dh||this._lastTargetPosition.distanceToSquared(this.target)>Dh?(this.dispatchEvent(yh),this._lastPosition.copy(this.object.position),this._lastQuaternion.copy(this.object.quaternion),this._lastTargetPosition.copy(this.target),!0):!1}_getAutoRotationAngle(e){return e===null?Eh/60/60*this.autoRotateSpeed:Eh/60*this.autoRotateSpeed*e}_getZoomScale(e){let t=Math.abs(e*.01);return .95**(this.zoomSpeed*t)}_rotateLeft(e){this._sphericalDelta.theta-=e}_rotateUp(e){this._sphericalDelta.phi-=e}_panLeft(e,t){Th.setFromMatrixColumn(t,0),Th.multiplyScalar(-e),this._panOffset.add(Th)}_panUp(e,t){this.screenSpacePanning===!0?Th.setFromMatrixColumn(t,1):(Th.setFromMatrixColumn(t,0),Th.crossVectors(this.object.up,Th)),Th.multiplyScalar(e),this._panOffset.add(Th)}_pan(e,t){let n=this.domElement;if(this.object.isPerspectiveCamera){let r=this.object.position;Th.copy(r).sub(this.target);let i=Th.length();i*=Math.tan(this.object.fov/2*Math.PI/180),this._panLeft(2*e*i/n.clientHeight,this.object.matrix),this._panUp(2*t*i/n.clientHeight,this.object.matrix)}else this.object.isOrthographicCamera?(this._panLeft(e*(this.object.right-this.object.left)/this.object.zoom/n.clientWidth,this.object.matrix),this._panUp(t*(this.object.top-this.object.bottom)/this.object.zoom/n.clientHeight,this.object.matrix)):(console.warn(`WARNING: OrbitControls.js encountered an unknown camera type - pan disabled.`),this.enablePan=!1)}_dollyOut(e){this.object.isPerspectiveCamera||this.object.isOrthographicCamera?this._scale/=e:(console.warn(`WARNING: OrbitControls.js encountered an unknown camera type - dolly/zoom disabled.`),this.enableZoom=!1)}_dollyIn(e){this.object.isPerspectiveCamera||this.object.isOrthographicCamera?this._scale*=e:(console.warn(`WARNING: OrbitControls.js encountered an unknown camera type - dolly/zoom disabled.`),this.enableZoom=!1)}_updateZoomParameters(e,t){if(!this.zoomToCursor)return;this._performCursorZoom=!0;let n=this.domElement.getBoundingClientRect(),r=e-n.left,i=t-n.top,a=n.width,o=n.height;this._mouse.x=r/a*2-1,this._mouse.y=-(i/o)*2+1,this._dollyDirection.set(this._mouse.x,this._mouse.y,1).unproject(this.object).sub(this.object.position).normalize()}_clampDistance(e){return Math.max(this.minDistance,Math.min(this.maxDistance,e))}_handleMouseDownRotate(e){this._rotateStart.set(e.clientX,e.clientY)}_handleMouseDownDolly(e){this._updateZoomParameters(e.clientX,e.clientX),this._dollyStart.set(e.clientX,e.clientY)}_handleMouseDownPan(e){this._panStart.set(e.clientX,e.clientY)}_handleMouseMoveRotate(e){this._rotateEnd.set(e.clientX,e.clientY),this._rotateDelta.subVectors(this._rotateEnd,this._rotateStart).multiplyScalar(this.rotateSpeed);let t=this.domElement;this._rotateLeft(Eh*this._rotateDelta.x/t.clientHeight),this._rotateUp(Eh*this._rotateDelta.y/t.clientHeight),this._rotateStart.copy(this._rotateEnd),this.update()}_handleMouseMoveDolly(e){this._dollyEnd.set(e.clientX,e.clientY),this._dollyDelta.subVectors(this._dollyEnd,this._dollyStart),this._dollyDelta.y>0?this._dollyOut(this._getZoomScale(this._dollyDelta.y)):this._dollyDelta.y<0&&this._dollyIn(this._getZoomScale(this._dollyDelta.y)),this._dollyStart.copy(this._dollyEnd),this.update()}_handleMouseMovePan(e){this._panEnd.set(e.clientX,e.clientY),this._panDelta.subVectors(this._panEnd,this._panStart).multiplyScalar(this.panSpeed),this._pan(this._panDelta.x,this._panDelta.y),this._panStart.copy(this._panEnd),this.update()}_handleMouseWheel(e){this._updateZoomParameters(e.clientX,e.clientY),e.deltaY<0?this._dollyIn(this._getZoomScale(e.deltaY)):e.deltaY>0&&this._dollyOut(this._getZoomScale(e.deltaY)),this.update()}_handleKeyDown(e){let t=!1;switch(e.code){case this.keys.UP:e.ctrlKey||e.metaKey||e.shiftKey?this._rotateUp(Eh*this.rotateSpeed/this.domElement.clientHeight):this._pan(0,this.keyPanSpeed),t=!0;break;case this.keys.BOTTOM:e.ctrlKey||e.metaKey||e.shiftKey?this._rotateUp(-Eh*this.rotateSpeed/this.domElement.clientHeight):this._pan(0,-this.keyPanSpeed),t=!0;break;case this.keys.LEFT:e.ctrlKey||e.metaKey||e.shiftKey?this._rotateLeft(Eh*this.rotateSpeed/this.domElement.clientHeight):this._pan(this.keyPanSpeed,0),t=!0;break;case this.keys.RIGHT:e.ctrlKey||e.metaKey||e.shiftKey?this._rotateLeft(-Eh*this.rotateSpeed/this.domElement.clientHeight):this._pan(-this.keyPanSpeed,0),t=!0}t&&(e.preventDefault(),this.update())}_handleTouchStartRotate(e){if(this._pointers.length===1)this._rotateStart.set(e.pageX,e.pageY);else{let t=this._getSecondPointerPosition(e),n=.5*(e.pageX+t.x),r=.5*(e.pageY+t.y);this._rotateStart.set(n,r)}}_handleTouchStartPan(e){if(this._pointers.length===1)this._panStart.set(e.pageX,e.pageY);else{let t=this._getSecondPointerPosition(e),n=.5*(e.pageX+t.x),r=.5*(e.pageY+t.y);this._panStart.set(n,r)}}_handleTouchStartDolly(e){let t=this._getSecondPointerPosition(e),n=e.pageX-t.x,r=e.pageY-t.y,i=Math.sqrt(n*n+r*r);this._dollyStart.set(0,i)}_handleTouchStartDollyPan(e){this.enableZoom&&this._handleTouchStartDolly(e),this.enablePan&&this._handleTouchStartPan(e)}_handleTouchStartDollyRotate(e){this.enableZoom&&this._handleTouchStartDolly(e),this.enableRotate&&this._handleTouchStartRotate(e)}_handleTouchMoveRotate(e){if(this._pointers.length==1)this._rotateEnd.set(e.pageX,e.pageY);else{let t=this._getSecondPointerPosition(e),n=.5*(e.pageX+t.x),r=.5*(e.pageY+t.y);this._rotateEnd.set(n,r)}this._rotateDelta.subVectors(this._rotateEnd,this._rotateStart).multiplyScalar(this.rotateSpeed);let t=this.domElement;this._rotateLeft(Eh*this._rotateDelta.x/t.clientHeight),this._rotateUp(Eh*this._rotateDelta.y/t.clientHeight),this._rotateStart.copy(this._rotateEnd)}_handleTouchMovePan(e){if(this._pointers.length===1)this._panEnd.set(e.pageX,e.pageY);else{let t=this._getSecondPointerPosition(e),n=.5*(e.pageX+t.x),r=.5*(e.pageY+t.y);this._panEnd.set(n,r)}this._panDelta.subVectors(this._panEnd,this._panStart).multiplyScalar(this.panSpeed),this._pan(this._panDelta.x,this._panDelta.y),this._panStart.copy(this._panEnd)}_handleTouchMoveDolly(e){let t=this._getSecondPointerPosition(e),n=e.pageX-t.x,r=e.pageY-t.y,i=Math.sqrt(n*n+r*r);this._dollyEnd.set(0,i),this._dollyDelta.set(0,(this._dollyEnd.y/this._dollyStart.y)**+this.zoomSpeed),this._dollyOut(this._dollyDelta.y),this._dollyStart.copy(this._dollyEnd);let a=(e.pageX+t.x)*.5,o=(e.pageY+t.y)*.5;this._updateZoomParameters(a,o)}_handleTouchMoveDollyPan(e){this.enableZoom&&this._handleTouchMoveDolly(e),this.enablePan&&this._handleTouchMovePan(e)}_handleTouchMoveDollyRotate(e){this.enableZoom&&this._handleTouchMoveDolly(e),this.enableRotate&&this._handleTouchMoveRotate(e)}_addPointer(e){this._pointers.push(e.pointerId)}_removePointer(e){delete this._pointerPositions[e.pointerId];for(let t=0;t<this._pointers.length;t++)if(this._pointers[t]==e.pointerId){this._pointers.splice(t,1);return}}_isTrackingPointer(e){for(let t=0;t<this._pointers.length;t++)if(this._pointers[t]==e.pointerId)return!0;return!1}_trackPointer(e){let t=this._pointerPositions[e.pointerId];t===void 0&&(t=new H,this._pointerPositions[e.pointerId]=t),t.set(e.pageX,e.pageY)}_getSecondPointerPosition(e){let t=e.pointerId===this._pointers[0]?this._pointers[1]:this._pointers[0];return this._pointerPositions[t]}_customWheelEvent(e){let t=e.deltaMode,n={clientX:e.clientX,clientY:e.clientY,deltaY:e.deltaY};switch(t){case 1:n.deltaY*=16;break;case 2:n.deltaY*=100}return e.ctrlKey&&!this._controlActive&&(n.deltaY*=10),n}};function kh(e){this.enabled!==!1&&(this._pointers.length===0&&(this.domElement.setPointerCapture(e.pointerId),this.domElement.addEventListener(`pointermove`,this._onPointerMove),this.domElement.addEventListener(`pointerup`,this._onPointerUp)),!this._isTrackingPointer(e)&&(this._addPointer(e),e.pointerType===`touch`?this._onTouchStart(e):this._onMouseDown(e)))}function Ah(e){this.enabled!==!1&&(e.pointerType===`touch`?this._onTouchMove(e):this._onMouseMove(e))}function jh(e){switch(this._removePointer(e),this._pointers.length){case 0:this.domElement.releasePointerCapture(e.pointerId),this.domElement.removeEventListener(`pointermove`,this._onPointerMove),this.domElement.removeEventListener(`pointerup`,this._onPointerUp),this.dispatchEvent(xh),this.state=Z.NONE;break;case 1:let t=this._pointers[0],n=this._pointerPositions[t];this._onTouchStart({pointerId:t,pageX:n.x,pageY:n.y})}}function Mh(e){let t;switch(e.button){case 0:t=this.mouseButtons.LEFT;break;case 1:t=this.mouseButtons.MIDDLE;break;case 2:t=this.mouseButtons.RIGHT;break;default:t=-1}switch(t){case Di.DOLLY:if(this.enableZoom===!1)return;this._handleMouseDownDolly(e),this.state=Z.DOLLY;break;case Di.ROTATE:if(e.ctrlKey||e.metaKey||e.shiftKey){if(this.enablePan===!1)return;this._handleMouseDownPan(e),this.state=Z.PAN}else{if(this.enableRotate===!1)return;this._handleMouseDownRotate(e),this.state=Z.ROTATE}break;case Di.PAN:if(e.ctrlKey||e.metaKey||e.shiftKey){if(this.enableRotate===!1)return;this._handleMouseDownRotate(e),this.state=Z.ROTATE}else{if(this.enablePan===!1)return;this._handleMouseDownPan(e),this.state=Z.PAN}break;default:this.state=Z.NONE}this.state!==Z.NONE&&this.dispatchEvent(bh)}function Nh(e){switch(this.state){case Z.ROTATE:if(this.enableRotate===!1)return;this._handleMouseMoveRotate(e);break;case Z.DOLLY:if(this.enableZoom===!1)return;this._handleMouseMoveDolly(e);break;case Z.PAN:if(this.enablePan===!1)return;this._handleMouseMovePan(e)}}function Ph(e){this.enabled!==!1&&this.enableZoom!==!1&&this.state===Z.NONE&&(e.preventDefault(),this.dispatchEvent(bh),this._handleMouseWheel(this._customWheelEvent(e)),this.dispatchEvent(xh))}function Fh(e){this.enabled!==!1&&this.enablePan!==!1&&this._handleKeyDown(e)}function Ih(e){switch(this._trackPointer(e),this._pointers.length){case 1:switch(this.touches.ONE){case Oi.ROTATE:if(this.enableRotate===!1)return;this._handleTouchStartRotate(e),this.state=Z.TOUCH_ROTATE;break;case Oi.PAN:if(this.enablePan===!1)return;this._handleTouchStartPan(e),this.state=Z.TOUCH_PAN;break;default:this.state=Z.NONE}break;case 2:switch(this.touches.TWO){case Oi.DOLLY_PAN:if(this.enableZoom===!1&&this.enablePan===!1)return;this._handleTouchStartDollyPan(e),this.state=Z.TOUCH_DOLLY_PAN;break;case Oi.DOLLY_ROTATE:if(this.enableZoom===!1&&this.enableRotate===!1)return;this._handleTouchStartDollyRotate(e),this.state=Z.TOUCH_DOLLY_ROTATE;break;default:this.state=Z.NONE}break;default:this.state=Z.NONE}this.state!==Z.NONE&&this.dispatchEvent(bh)}function Lh(e){switch(this._trackPointer(e),this.state){case Z.TOUCH_ROTATE:if(this.enableRotate===!1)return;this._handleTouchMoveRotate(e),this.update();break;case Z.TOUCH_PAN:if(this.enablePan===!1)return;this._handleTouchMovePan(e),this.update();break;case Z.TOUCH_DOLLY_PAN:if(this.enableZoom===!1&&this.enablePan===!1)return;this._handleTouchMoveDollyPan(e),this.update();break;case Z.TOUCH_DOLLY_ROTATE:if(this.enableZoom===!1&&this.enableRotate===!1)return;this._handleTouchMoveDollyRotate(e),this.update();break;default:this.state=Z.NONE}}function Rh(e){this.enabled!==!1&&e.preventDefault()}function zh(e){e.key===`Control`&&(this._controlActive=!0,this.domElement.getRootNode().addEventListener(`keyup`,this._interceptControlUp,{passive:!0,capture:!0}))}function Bh(e){e.key===`Control`&&(this._controlActive=!1,this.domElement.getRootNode().removeEventListener(`keyup`,this._interceptControlUp,{passive:!0,capture:!0}))}function Vh(e,t){let n=new Hf({canvas:e,antialias:!0});n.setPixelRatio(Math.min(window.devicePixelRatio,2)),n.setSize(window.innerWidth,window.innerHeight);let r=new Pm;r.setSize(window.innerWidth,window.innerHeight),Object.assign(r.domElement.style,{position:`fixed`,inset:`0`,pointerEvents:`none`}),t.appendChild(r.domElement);let i=new Uf;i.background=new K(856343);let a=new vl(45,window.innerWidth/window.innerHeight,.1,1e3);a.position.set(2,44,68);let o=new Oh(a,n.domElement);o.enableDamping=!0,o.dampingFactor=.08,o.target.set(2,9,-3),o.minDistance=10,o.maxDistance=200,i.add(new lm(16777215,.6));let s=new cm(16777215,1.2);s.position.set(20,50,30),i.add(s);let c=new cm(8952319,.4);return c.position.set(-30,20,-20),i.add(c),window.addEventListener(`resize`,()=>{a.aspect=window.innerWidth/window.innerHeight,a.updateProjectionMatrix(),n.setSize(window.innerWidth,window.innerHeight),r.setSize(window.innerWidth,window.innerHeight)}),{renderer:n,labels:r,scene:i,camera:a,controls:o}}var Q=e=>document.getElementById(e),Hh=`M7 5v14l12-7z`,Uh=`M6 5h4v14H6zM14 5h4v14h-4z`,Wh=`Adaptive-SR-CFM (example)`,{renderer:Gh,labels:Kh,scene:qh,camera:Jh,controls:Yh}=Vh(Q(`scene`),Q(`stage`)),Xh=new Jm(qh),Zh=new vh(qh,Xh),$={imp:null,net:null,failures:[],walk:null,step:0,playing:!1,speed:1,elapsed:0,replay:null};function Qh(e,t,n=null){let r;try{r=yi(e,{name:t??void 0,positions:n})}catch(e){return $h(`${t??`facts`}: ${e.message}`),!1}return $h(null),$.imp=r,$.failures=[],$.replay=null,dg(null),eg(),tg(),rh(Q(`tab-import`),r.report),cg(),ag(),!0}function $h(e){Q(`facts-error`).hidden=!e,Q(`facts-error`).textContent=e??``}function eg(e=null){let{imp:t}=$;$.net=e??Fn(t.topology,{labelMode:t.labelMode,failures:$.failures}),Xh.build($.net),Q(`topo-name`).textContent=`${t.topology.name} · ${t.topology.nodes.length} devices, ${t.topology.links.length} links`,Q(`fail-state`).textContent=$.failures.length?`Down: ${$.failures.join(`, `)}`:`All links up`,ph(Q(`tab-overview`),t,$.net),rg.tab===`device`&&mh(Q(`tab-device`),t,$.net,rg.id),rg.tab===`service`&&hh(Q(`tab-service`),t,$.net,rg.id,lg)}function tg(){let{x0:e,x1:t,z0:n,z1:r}=Xh.box,i=(e+t)/2,a=(n+r)/2,o=Math.max(t-e,(r-n)*1.6);Yh.target.set(i,13,a),Jh.position.set(i,13+o*.85,a+o*1.4),ng(),Yh.update()}function ng(){let e=window.innerWidth,t=window.innerHeight,n=Q(`controls`).getBoundingClientRect(),r=Q(`detail`).getBoundingClientRect(),i=e>900&&!document.body.classList.contains(`topology-only`)?(r.width-n.width)/2:0;Jh.setViewOffset(e,t,i,0,e,t),Jh.updateProjectionMatrix()}window.addEventListener(`resize`,ng);var rg={tab:`overview`,id:null};function ig(e){for(let t of document.querySelectorAll(`.tabs button`))t.classList.toggle(`active`,t.dataset.tab===e);for(let t of[`overview`,`device`,`service`,`walk`,`import`])Q(`tab-${t}`).hidden=t!==e;rg.tab=e}function ag(){let e=decodeURIComponent(location.hash.slice(1));document.body.classList.toggle(`topology-only`,e===`topology`),ng();let[t,...n]=e.split(`=`),r=n.join(`=`);$.imp&&(t===`device`&&r?(rg.id=r,mh(Q(`tab-device`),$.imp,$.net,r),ig(`device`)):t===`service`&&r?(rg.id=r,hh(Q(`tab-service`),$.imp,$.net,r,lg),ig(`service`)):(rg.tab===`device`||rg.tab===`service`||e===``)&&ig(`overview`))}window.addEventListener(`hashchange`,ag);for(let e of document.querySelectorAll(`.tabs button`))e.addEventListener(`click`,()=>{e.dataset.tab===`overview`&&history.replaceState(null,``,location.pathname+location.search),ig(e.dataset.tab)});Q(`p-panels`).addEventListener(`click`,()=>{location.hash=document.body.classList.contains(`topology-only`)?``:`topology`});for(let e of Fm){let t=document.createElement(`label`);t.innerHTML=`<input type="checkbox" checked data-layer="${e.id}"/><span class="swatch" style="background:${Hm(e.color)}"></span>${e.name}`,t.querySelector(`input`).addEventListener(`change`,t=>Xh.setVisible(e.id,t.target.checked)),Q(`layer-toggles`).appendChild(t)}function og(e,t){let n=e.value;e.innerHTML=t.map(e=>`<option value="${e.value}">${e.label}</option>`).join(``),t.some(e=>e.value===n)&&(e.value=n)}function sg(){let e=Q(`walk-params`),t=Q(`walk-kind`).value,n=$.net;e.innerHTML=``;let r=(t,n)=>{let r=document.createElement(`select`);return r.id=t,og(r,n),e.appendChild(r),r};if(t===`tp`)r(`wp-a`,n.tp.tunnels.map(e=>({value:e.id,label:`${e.id} (${e.src}–${e.dst})${e.role===`backup`?` backup`:``}`})));else if(t===`vpws`){let e=r(`wp-a`,n.vpws.pseudowires.map(e=>({value:e.id,label:`${e.service} PW ${e.pwid} (${e.ends.map(e=>e.node).join(`–`)})`}))),t=r(`wp-b`,[]),i=()=>og(t,(n.vpws.pseudowires.find(t=>t.id===e.value)?.ends??[]).map(e=>({value:e.node,label:`from ${e.node}`})));e.addEventListener(`change`,i),i()}else if(t===`ccm`)r(`wp-a`,n.cfm.megs.map(e=>({value:e.id,label:`MEG ${e.id}`})));else{let e=r(`wp-a`,n.igp.routers.map(e=>({value:e,label:`origin ${e}`})));if(n.igpName===`ospf`&&n.igp.routers.some(e=>ir(n,e).length)){let t=r(`wp-b`,[]),i=()=>og(t,ir(n,e.value).map(e=>({value:e,label:`area ${e}`})));e.addEventListener(`change`,i),i()}}Q(`walk-run`).disabled=!e.querySelector(`select`)?.options.length}function cg(){let e={vpws:$.net.vpws.pseudowires.length>0,ccm:$.net.cfm.megs.length>0,tp:$.net.tp.tunnels.length>0,isis:$.net.igp.routers.length>0};Q(`walk-kind`).querySelector(`option[value="isis"]`).textContent=$.net.igpName===`ospf`?`OSPF LSA flood`:`IS-IS LSP flood`;for(let t of Q(`walk-kind`).options)t.disabled=!e[t.value];e[Q(`walk-kind`).value]||(Q(`walk-kind`).value=Object.keys(e).find(t=>e[t])??`vpws`),sg(),og(Q(`fail-target`),$.imp.topology.links.flatMap(e=>[{value:e.id,label:`${e.id} (${e.kind}${e.lag?`, LAG`:``})`},...e.lag?e.members.map(e=>({value:e.id,label:`\u2003member ${e.id} (${e.a}\u2013${e.b})`})):[]]))}Q(`walk-kind`).addEventListener(`change`,sg);var lg={walkPw:(e,t)=>ug(()=>nr($.net,e,t)),walkCcm:e=>ug(()=>$n($.net,e))};function ug(e){$.replay&&pg();try{dg(e())}catch(e){dg({title:e.message,steps:[]})}ig(`walk`),$.playing=!0,mg()}Q(`walk-run`).addEventListener(`click`,()=>{let e=Q(`walk-kind`).value,t=Q(`wp-a`)?.value,n=Q(`wp-b`)?.value;e===`vpws`?lg.walkPw(t,n):e===`ccm`?lg.walkCcm(t):ug(e===`tp`?()=>or($.net,t):()=>$.net.igpName===`ospf`?ar($.net,t,n??null):Qn($.net,t))});function dg(e){$.walk=e,$.step=0,$.elapsed=0,Q(`walk-title`).textContent=e?.title??`No walk`,Zm(Q(`step-list`),e,e=>fg(e)),fg(0)}function fg(e){let t=$.walk?.steps??[];$.step=Math.max(0,Math.min(e,t.length-1)),$.elapsed=0;let n=t[$.step];Q(`p-pos`).textContent=`${t.length?$.step+1:0} / ${t.length}`,n?($.replay&&eg({before:$.replay.before,after:$.replay.after,...$.replay.networks}[n.network]??($.step===t.length-1?$.replay.after:$.replay.before)),Qm(Q(`step-list`),$.step),eh(Q(`step-detail`),n),Xh.highlight(n.highlight?.links??n.moves.map(e=>e.link)),Zh.show(n,$.walk.layer)):(Zh.clear(),Xh.highlight([]),eh(Q(`step-detail`),null))}Q(`fail-run`).addEventListener(`click`,()=>{let e=Q(`fail-target`).value;if(!e)return;let t=Q(`fail-detection`).value,{before:n,after:r,networks:i,replay:a}=dr($.imp.topology,e,{labelMode:$.imp.labelMode,detection:t});$.failures=[e],$.replay={before:n,after:r,networks:i},dg(a),ig(`walk`),$.playing=!0,mg(),Q(`fail-state`).textContent=`Down: ${e}`});function pg(){$.failures=[],$.replay=null,eg()}Q(`fail-restore`).addEventListener(`click`,()=>{pg(),dg(null)});function mg(){Q(`p-play-icon`).setAttribute(`d`,$.playing?Uh:Hh)}Q(`p-play`).addEventListener(`click`,()=>{$.playing=!$.playing,mg()}),Q(`p-prev`).addEventListener(`click`,()=>fg($.step-1)),Q(`p-next`).addEventListener(`click`,()=>fg($.step+1)),Q(`p-speed`).addEventListener(`input`,e=>$.speed=Number(e.target.value)),window.addEventListener(`keydown`,e=>{e.target.closest(`input, select`)||(e.key===` `?(e.preventDefault(),Q(`p-play`).click()):e.key===`ArrowLeft`?fg($.step-1):e.key===`ArrowRight`&&fg($.step+1))});var hg=new Cm,gg=new H,_g=null;Gh.domElement.addEventListener(`pointerdown`,e=>_g={x:e.clientX,y:e.clientY}),Gh.domElement.addEventListener(`pointerup`,e=>{if(!_g||Math.hypot(e.clientX-_g.x,e.clientY-_g.y)>4)return;gg.set(e.clientX/window.innerWidth*2-1,-(e.clientY/window.innerHeight)*2+1),hg.setFromCamera(gg,Jh);let t=hg.intersectObjects(Xh.pickables)[0];t&&(location.hash=`device=${encodeURIComponent(t.object.userData.node)}`)}),Q(`facts-file`).addEventListener(`change`,async e=>{let t=e.target.files[0];t&&(Qh(await t.text(),t.name.replace(/\.json$/i,``))&&(location.hash=``),e.target.value=``)}),Q(`facts-example`).addEventListener(`click`,()=>{Qh(e,Wh),history.replaceState(null,``,location.pathname)}),window.addEventListener(`dragover`,e=>e.preventDefault()),window.addEventListener(`drop`,async e=>{e.preventDefault();let t=e.dataTransfer.files[0];t&&Qh(await t.text(),t.name.replace(/\.json$/i,``))&&(location.hash=``)});var vg=performance.now();function yg(e){let t=e-vg;vg=e;let n=$.walk?.steps??[];$.playing&&n.length&&($.elapsed+=t*$.speed,$.elapsed>=1800&&($.step<n.length-1?fg($.step+1):($.playing=!1,mg()))),Zh.update(Math.min(1,$.elapsed/gh)),Yh.update(),Gh.render(qh,Jh),Kh.render(qh,Jh),requestAnimationFrame(yg)}var bg=null;function xg(e){return Qh(e.factsText,e.title,e.positions)}function Sg(){let e=Q(`lab-select`);e.hidden=!bg||bg.labs.length<2,bg&&og(e,bg.labs.map(e=>({value:e.id,label:e.title})))}Q(`lab-select`).addEventListener(`change`,async e=>{let t=bg?.labs.find(t=>t.id===e.target.value);if(t)try{if(xg(await Ti(fetch,t))){let e=new URLSearchParams(location.search);e.set(`lab`,t.id),history.replaceState(null,``,`${location.pathname}?${e}`)}}catch(e){$h(e.message)}});async function Cg(){let t=null;try{t=await Ei(bi(location.search),{base:location.href,fetch})}catch(t){Qh(e,Wh),$h(`${t.message}; showing the example`);return}t?(bg=t.index,Sg(),bg&&(Q(`lab-select`).value=t.lab.id),xg(t.lab)):Qh(e,Wh)}Cg(),requestAnimationFrame(yg);