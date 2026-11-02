# SPDX-License-Identifier: Apache-2.0
"""The view schema: its defaults, presets and the example view files validate; bad views do not."""

import json
from pathlib import Path

import pytest

from saos_network_facts import schema

VIEWS = Path(__file__).parent / "fixtures" / "views"


def test_the_defaults_set_every_property_and_validate():
    defaults = schema.load_view_presets()["defaults"]
    assert schema.view_errors(defaults) == []
    every = set(schema.load_view_schema()["properties"]) - {"preset"}
    assert set(defaults) == every


def test_every_preset_validates_and_is_named_in_the_schema():
    presets = schema.load_view_presets()["presets"]
    assert set(presets) == set(schema.load_view_schema()["$defs"]["PresetName"]["enum"])
    for name, preset in presets.items():
        assert schema.view_errors(preset) == [], name
        assert schema.view_errors({**preset, "preset": name}) == [], name


@pytest.mark.parametrize("path", sorted(VIEWS.glob("*.view.json")), ids=lambda p: p.name)
def test_example_views_validate(path):
    assert schema.view_errors(json.loads(path.read_text())) == []


@pytest.mark.parametrize("view", [
    {"view_version": "2.0"},
    {"preset": "poster"},
    {"layers": ["physical", "optical"]},
    {"frames": {"start": "middle"}},
    {"frames": {"period_s": 0}},
    {"layout": {"hints": {"PE1": [0]}}},
    {"camera": "orbit"},
    {"device_info": ["role"]},
])
def test_bad_views_do_not_validate(view):
    assert schema.view_errors(view) != []
