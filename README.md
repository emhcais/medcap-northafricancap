# Captives from North Africa and the Ottoman World

A browser-only Leaflet companion to the stable **European Captives v1.2** map.

## Development status

This is **v0.1-development**, not a stable public release. It includes all 781 person records and the approved data rules, but the historical place authority remains incomplete.

Current map coverage:

- 475 records with reviewed/generalized map points
- 214 records with a documented origin still awaiting place review
- 92 records with no recorded origin

All 781 records remain searchable and downloadable.

## Implemented features

- Exact title: **Captives from North Africa and the Ottoman World**
- Original and baptismal names shown with equal prominence
- Six-field historical records in the approved order
- Search across both names, historical and modern origins, age, date, and Papal Period
- All records / Mapped origins / No location data views
- Date range filter, 1600–1699
- Multi-period Papal Period filter with counts
- Transparent inherited-date and inferred-period notes
- Historical place name first, reviewed modern reference in parentheses
- Aggregated origin points; no Rome destination and no route lines
- Complete CSV download and visible access to unmapped records
- Responsive and keyboard-oriented interface

## Data rules

See [METHODOLOGY.md](METHODOLOGY.md). Key rules:

- 333 blank date cells inherit the preceding explicit date in a separate derived field.
- Source date cells remain blank in `dateSource`; inherited records are flagged.
- Bold papal headings govern subsequent records until the next heading.
- Eight 1600 Tableau annexe records receive Clement VIII as a marked chronological inference.
- Unresolved historical places are left off the map rather than guessed.

## Preview locally

Use any static web server. For example, VS Code’s Live Server extension or:

```bash
python3 -m http.server 8000
```

Then open `http://localhost:8000`. Opening `index.html` directly may prevent the browser from loading `data/app-data.json`.

## Publish on GitHub Pages

Upload the contents of this folder to a dedicated repository or collection directory. Keep `index.html` at the publishing root and deploy with GitHub Pages. The site uses Leaflet and OpenStreetMap tiles from external services.

Do not replace or overwrite the stable European map.

## Rebuild data

Place the source XLSX outside the public repository and run:

```bash
python3 scripts/prepare_data.py "Le Bapteme Des Musulmans Esclaves A Rome-2.xlsx" data
```

The script uses only Python's standard library.

## Documentation

- [Methodology](METHODOLOGY.md)
- [Audience and usability](AUDIENCE-USABILITY.md)
- [Dataset comparison plan](COMPARISON-PLAN.md)
- [Stable European v1.2 reference](STABLE-VERSION-REFERENCE.md)
- [Place review workflow](PLACE-REVIEW.md)
