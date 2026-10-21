# Traveller packs

Rebuild all four PDFs:

    node tools/pdf/export.js > tools/pdf/data.json
    python3 tools/pdf/build.py tools/pdf/data.json tools/pdf/out bd
    python3 tools/pdf/build.py tools/pdf/data.json tools/pdf/out gj
    python3 tools/pdf/build.py tools/pdf/data.json tools/pdf/out kelly
    python3 tools/pdf/build.py tools/pdf/data.json tools/pdf/out      # master

Each pack is cover, letter, things to remember, packing list, itinerary,
confirmations. Everything comes from `lib/data.js` except the prose in
`content.py` and the confirmation transcriptions in `emails.py`.

Unbooked items are dropped by the export — a pack only carries what is real.
Flights with `bagsWarn` are highlighted in red so a bag that still has to be
bought cannot be missed.

## Real printed emails

`emails.py` holds transcriptions. To use the genuine articles instead, print
each confirmation from Gmail to PDF, drop them in a folder named per party,
then:

    PRINTED_KELLY=9 python3 tools/pdf/build.py tools/pdf/data.json tools/pdf/out kelly
    python3 tools/pdf/merge.py tools/pdf/out/hawaii27-kelly.pdf <folder> final.pdf

The build then emits a divider page instead of the transcriptions and the
printed emails are stapled on the back, in filename order.
