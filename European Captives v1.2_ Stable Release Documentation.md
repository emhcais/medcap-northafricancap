# Mediterranean Captivity Project
## European Captives Map: Stable Release v1.2

**Status:** Stable baseline approved for continued project development  
**Release:** European Captives Map v1.2  
**Repository:** https://github.com/emhcais/medcapversion3  
**Scope:** European Captives, approximately 1500–1800

### Release decision
Version 1.2 is the **stable reference version** for the European Captives map. Its visual appearance, layout, and navigation should be preserved unless a future change is explicitly approved. “Stable” records the project's chosen baseline, not a guarantee that every browser or hosting environment has been independently tested.

### Development history
| Stage | Main outcome |
|---|---|
| Dataset evaluation | Evaluated the original 3,137 European Captives records and mapping uncertainties. |
| v1.0 | First Leaflet prototype: mapped origins and captivity locations, search, date filtering, and documented connections. |
| v1.1 | Returned to the clearer v1 visual design; added help, location filters, Reset Filters, a single CSV download, and an API-key-free OpenStreetMap basemap. Preserved unmappable records without Gibraltar placeholder markers. |
| **v1.2 (stable)** | Refined controls and historical records while retaining v1.1 styling and navigation. |

### Stable v1.2 behavior
- **Map:** Both origins and captivity locations are available; documented connections are **on by default**, including after Reset Filters.
- **Shown on the map:** Both, Origins, Captivity, No Location Data, in that order.
- **No Location Data:** Map remains visible without markers; a searchable list presents the **733 records with neither mapped location**.
- **Time filter:** Both slider handles use matching color and opacity.
- **Heading:** Main **European Captives** title remains; the redundant “Mediterranean Captivity Project · Version 1.1” heading was removed.
- **Historical record:** Name; Place of Origin; Place of Captivity; Convert; Date; Ship Name; Source; Notes; Record ID. Source and Notes come from separate original CSV columns. A small normalized-year/January 1 explanation appears below Date rather than in the main interface.
- **Data access:** Search includes all **3,137 records**, including those without map coordinates. One public download provides the complete CSV; GeoJSON is not promoted as a download.
- **Historical integrity:** The original research dataset is preserved; artificial Strait of Gibraltar coordinates do not appear as captivity markers. Connecting lines indicate documented associations, not necessarily actual routes.
- **Hosting:** Static Leaflet site on GitHub Pages; no CARTO API key or local Python installation required to view the published site.

### Source and release management
1. Keep the original CSV unchanged as the research source of record.
2. Preserve the v1.2 ZIP and repository state as the rollback baseline. Consider creating a GitHub release/tag named `v1.2-stable` once the deployed site is checked.
3. Record future modifications in `CHANGELOG.md` and document affected files before publishing.
4. Test map loading, filters, connections, search (including unmapped records), record field order, CSV download, and browser readability after each deployment.
5. Publish changes through the GitHub repository and verify the GitHub Pages deployment in **Actions** and **Settings → Pages**.

### Next phase: North African Captives
The next workstream is to **evaluate the North African Captives dataset** before adapting the stable European map architecture. Inventory its columns, records, dates, origin/captivity evidence, uncertainty, and historical place names; preserve the original data; then create a separate mapping dataset. Reuse v1.2's layout and controls wherever appropriate, but do not assume the two datasets have identical schemas or geographic conventions.

**Longer-term objective:** Separate European and North African maps, followed by a comparative Mediterranean interface and WordPress.com integration.

### Release note
This document records the agreed stable baseline and handoff. It does not itself modify the GitHub repository or deploy the map.
