# Event and organizer artwork

These files identify conferences, research talks and professional development
activities on the personal website. They are served locally; no logo CDN or
external request is needed to render them.

- `sources.json` records the original source URLs, file hashes and formats.
- `marks/manifest.json` maps the displayed identities to their local files.
- `scripts/build_brand_assets.py` extracts the NeurIPS, ICML, ICASSP 2022,
  NVIDIA, Flower, NDSS and Springer emblems from official SVG geometry. Paths and transforms
  are preserved, not approximated or traced.
- NEAT, IJCAI 2025, ICASSP 2024, ASCI, DeepLearn, IRDTA and Lorentz Center use
  official raster artwork. They are not misrepresented as vector files.
  DeepLearn has a lossless whitespace crop recorded in the mark manifest.
- `custom/` contains superseded approximate illustrations. The website no
  longer uses them.
- The venue registry in `data/venues.json` also covers ECML-PKDD 2026,
  ACL ARR, NDSS, PerCom 2022/2023, CIKM 2025 and ICASSP 2027.
  Original raster logos remain raster files at their native aspect ratio.
- ACM, IEEE and Elsevier marks identify the publisher on journal or
  proceedings metadata when a distinct venue emblem is unavailable.
  UbiSec uses the Springer publisher emblem, not an invented conference logo.
  Elsevier's vector mark comes from the CC0 Simple Icons collection;
  its trademark remains the publisher's.
- `scripts/venue_assets.py` renders the shared badge markup; publication
  builds use this registry so manual HTML edits are not needed to retain icons.
- The degree confetti is original SVG geometry in `assets/icons.svg`.
  Its brief CSS animation has light/dark palettes, a static reduced-motion
  fallback, and no JavaScript or external animation dependency.
- `scripts/build_raster_marks.cjs` crops the official IEEE Big Data network
  emblem and the IRIS emblem/wordmark, excluding the TU/e portion. It writes
  transparent light/dark PNGs at their original resolution with no geometric
  redraw. Crop coordinates and source URLs are recorded in the manifests.
  Dark variants change the palette for contrast; the original sources remain.
  Springer has a pair of 360×440 PNGs rendered from the original vector emblem;
  its orange baseline is preserved in both themes.
- `data/publication-venue-audit.json` records badge coverage and event sources
  for all publications and related versions. Event locations are independent of
  attendance. Journals and preprints do not inherit their publisher's location.

Full-color artwork keeps its source colors on a white backing in both themes.
Monochrome Flower, NDSS, ECML-PKDD, arXiv and Elsevier marks receive a
light/dark CSS treatment; their source geometry stays unchanged. ACL ARR's
high-resolution raster uses grayscale/multiply in light mode and
grayscale/invert/screen in dark mode. This blends away its opaque white
interior while preserving the original lettering and antialiased edges.
Original aspect ratios are preserved with `object-fit: contain`; adjacent text
names the venue, so the logo images have empty alt text to avoid repetition.

Artwork and trademarks belong to their respective organizations. Local
normalization and embedding do not imply authorship, endorsement or a new
license. When better official vector originals become available, replace the
raster asset and update its provenance rather than tracing an approximation.
