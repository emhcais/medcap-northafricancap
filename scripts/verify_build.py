#!/usr/bin/env python3
"""Acceptance checks for the prepared static application."""
import csv
import json
from collections import Counter
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
DATA = ROOT / "data"
payload = json.loads((DATA / "app-data.json").read_text(encoding="utf-8"))
records = payload["records"]

assert len(records) == 781
assert Counter(r["dateBasis"] for r in records) == {"explicit": 448, "inherited": 333}
assert Counter(r["papalPeriodBasis"] for r in records) == {"source_section_heading": 773, "inferred_from_date": 8}
assert sum(r["hasOrigin"] for r in records) == 689
assert sum(not r["hasOrigin"] for r in records) == 92
assert len({r["placeOfOrigin"] for r in records if r["hasOrigin"]}) == 269
assert all(r["papalPeriod"] == "Clement VIII" and r["dateYear"] == 1600 for r in records if r["papalPeriodBasis"] == "inferred_from_date")
assert all(r["dateDisplay"] and r["dateIso"] for r in records)
assert all(not (r["dateBasis"] == "inherited" and r["dateSource"]) for r in records)
assert all(r["latitude"] is None and r["longitude"] is None for r in records if not r["hasOrigin"])
assert not any("Rome" in (r["modernPlace"] or "") for r in records)

with (DATA / "north-african-captives-complete.csv").open(encoding="utf-8-sig", newline="") as handle:
    csv_rows = list(csv.DictReader(handle))
assert len(csv_rows) == 781

html = (ROOT / "index.html").read_text(encoding="utf-8")
js = (ROOT / "app.js").read_text(encoding="utf-8")
for label in ["Original Name", "Baptismal Name", "Place of Origin", "Age", "Date", "Papal Period"]:
    assert label in js or label in html
for forbidden in ["connection toggle", "Rome marker"]:
    assert forbidden not in html.lower()

print("Acceptance checks passed")
