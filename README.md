# Vasileios Tsouvalas — academic website

Source for https://vtsouval.github.io, published through GitHub Pages from `main`. Static HTML/CSS with optional publication search and filtering. Visitors need no runtime API; Scholar metrics are refreshed during the scheduled build.

## Preview

Run `python3 -m http.server 8000 --bind 127.0.0.1` in this directory and open http://127.0.0.1:8000. Reload the browser after edits.

## Editing

- `index.html`: opening profile and timeline, research-area tiles and publications.
- `journey.css` and `js/journey.js`: responsive profile and collapsible timeline. Present starts collapsed; year links reveal their details. Keyboard navigation, reduced motion and printing are supported.
- `data/scholar-metrics.json` and `scripts/update_scholar.py`: verified all-time citation and h-index snapshot, with the source date exposed on the Scholar tile. Run `python3 scripts/update_scholar.py --refresh` to update locally.
- `.github/workflows/pages.yml`: validates and publishes `main`, with a daily Scholar refresh and manual run option. Only static resources staged by `scripts/stage_site.py` are deployed.
- `style.css`: shared visual design and responsive layouts.
- `cv.html` and `cv.css`: responsive academic CV, with a section index, aligned dates and print styling.
- `js/layout.js`: keeps anchor clearance and the CV index aligned with the actual header height after wrapping, rotation, zoom and font loading.
- `js/cv.js`: optional current-section highlighting for the CV index; navigation remains functional without JavaScript.
- `data/publications.json`: publication records, topics, searchable keywords, summaries, verified resources and related versions.
- `scripts/build_publications.py`: run after editing publication data to update the committed static HTML.
- `publications.css`: compact publication rows, resource icons, paired venue versions and native expandable short abstracts. Text uses relative sizing, and abstract paragraphs fill the available width. Keywords and event details remain searchable without appearing in the rows.
- `js/publication-search.js`: normalization, word-prefix matching, combined filters and URL state.
- `js/publication-cards.js`: one expanded abstract at a time, whole-row pointer targets, native keyboard activation, and independent author/resource links.
- `js/site.js`: search controls, topic counts and keyboard shortcuts. All publication content is available without JavaScript.
- `js/theme.js` and `theme.css`: a single icon cycling System → Light → Dark, persistent choices, automatic OS following, and accessible names describing the next action. Shared with the local robotics project.
- `research.css`: responsive research-area tiles with separate publication and project links.
- `data/research-areas.json` and `scripts/build_research.py`: shared area names, descriptions and overlapping paper assignments. See `docs/research-areas.md` for the mapping audit and Nousphera synchronization command.
- `assets/icons.svg`: source for the adaptive icons; run `python3 scripts/build_icons.py` after editing icons or HTML. The builder embeds SVG geometry, so icons need no external sprite request. Publication generation also rebuilds its icons.
- `assets/fonts/`: self-hosted Open Sans and Source Serif 4 Medium Italic, with their SIL Open Font Licenses. Source Serif 4 highlights research phrases; the Latin WOFF2 comes from the [Google Fonts distribution](https://fonts.google.com/specimen/Source+Serif+4), at weight 500 and optical size 24.
- `assets/certificates/`: the author's NVIDIA competency certificates, linked from the CV alongside the official workshop pages.
- `docs/resource-audit.md`: paper-to-repository evidence and keyword/summary sources.

Search covers titles, authors, venues, years, topics, keywords, summaries and related versions. All query terms must match; accent and punctuation differences are normalized. Research-area filters combine with the query, and `q` and `topic` URL parameters preserve the current view. Years remain searchable as text; there is no separate year dropdown. Press `/` to focus search or Escape to clear the query. Topic counts reflect the query and can overlap.

## Validation

```sh
python3 scripts/build_research.py
python3 scripts/build_publications.py
python3 tests/publications.test.py
python3 tests/icons.test.py
python3 tests/research-areas.test.py
python3 tests/scholar.test.py
node --test tests/*.test.cjs
```

The Python tests exercise generated static markup and search metadata. The Node tests exercise matching, URL/filter behavior and theme selection. Icon tests check self-contained SVG generation and rebuild stability. Layout tests cover header changes, font loading and resize fallback. Design and source notes are in `docs/iteration-2.md`, `docs/iteration-3.md` , `docs/iteration-4.md` `docs/iteration-5.md` and `docs/iteration-6.md`.

The original site remains available in Git at commit `ffd25dc`; legacy assets and the original licence are retained. The revised site is published on GitHub Pages; the original revision branch is retained.

## Content review for the next iteration

The biography and CV use the local CV, public academic records and the author's confirmations. The portrait is the public TU/e profile photo. Conference participation, Flower talk attribution and academic-service roles were confirmed by the author. Technical and program committee roles are grouped as "Committee Roles" in the compact profile; the CV retains the specific roles and venues.

The bibliography has 14 main entries and linked related versions. The thesis is linked separately. Four under-review manuscripts appear only as titles and submission venues in the timeline, with the author's permission; their PDFs are not published. Proceedings publication years may differ from event years.

AE-PSL, MaTU and MPSL workshop acceptance is confirmed in the respective arXiv records. The academic CV is presented as HTML.

## Scholar refresh

The deployment checks the public Google Scholar profile once daily at 05:23 UTC, as well as on pushes and manual workflow runs. The parser verifies the profile identity and reads the **All** column. This is a daily snapshot, not a real-time API. Google may block automated requests; in that case the workflow retains the most recent verified snapshot and its original date, rather than displaying zero or inventing a new update time. Each run first reads the currently published snapshot so a failed refresh cannot roll back a previous successful update. No Google credentials or paid API are used.

GitHub can disable scheduled workflows in inactive public repositories; check the Actions tab if the displayed source date stops advancing. The snapshot date is available in the Scholar tile's tooltip and accessible label, and in `/data/scholar-metrics.json`.

## Sources

- https://research.tue.nl/en/persons/vasilis-tsouvalas/
- Portrait: https://research.tue.nl/files-asset/374293530/DSC02763-2-2.jpg?w=640&f=jpg
- https://research.tue.nl/en/publications/chaos-to-harmony-taming-heterogeneity-and-communication-bottlenec/
- https://arxiv.org/abs/2607.17913
- https://arxiv.org/abs/2502.06376
- https://arxiv.org/abs/2502.06355
- https://arxiv.org/abs/2311.17299
- The local CV and Scholar audit are supporting private source material and are not copied into this repository.
