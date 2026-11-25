# Development notes

## Completed in v0.1-development

- Built the companion map shell with a related historical-atlas aesthetic.
- Preserved the European Captives v1.2 map as the stable reference; no files from that application are changed here.
- Prepared all 781 North African/Ottoman person records.
- Implemented 333 inherited dates without overwriting blank source cells.
- Implemented ten source-heading Papal Periods.
- Assigned Clement VIII to the eight 1600 Tableau annexe records as a visible, reversible inference.
- Added search across both names and all six public record fields.
- Added year, Papal Period, and location-status filters.
- Added a complete CSV and a place-authority worksheet in CSV form.
- Added reviewed map points for 475 records.
- Kept 214 records with unresolved origins and 92 records without an origin fully searchable.
- Removed the European map’s destination, connection, and Rome semantics.

## Deliberately not declared stable

The interface and data rules are ready for review, but the companion map should not yet be called stable because:

1. 214 records with historical origin labels still lack reviewed coordinates.
2. Authority entries need gazetteer citations.
3. A small audience usability review remains outstanding.
4. The project owner should review modern names in parentheses and generalized regional points.

## Next review sequence

1. Open the map through GitHub Pages or a local static server.
2. Review the inherited-date and inferred-period flags in several records.
3. Review `data/place-authority.csv` by descending record count.
4. Test the seven tasks in `AUDIENCE-USABILITY.md` with representative users.
5. Correct authority entries and rebuild the data.
6. Tag v1.0 only after acceptance counts still reconcile and the outstanding place review is documented.
