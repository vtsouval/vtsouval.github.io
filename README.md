# Vasileios Tsouvalas — academic website

Local revision of https://vtsouval.github.io. Static HTML/CSS with optional publication search and filtering; no package installation or runtime API is required.

## Preview

Run `python3 -m http.server 8000 --bind 127.0.0.1` in this directory and open http://127.0.0.1:8000. Reload the browser after edits.

## Editing

- `index.html`: introduction, research themes, publications, research code and academic profile.
- `style.css`: shared visual design and responsive layouts.
- `cv.html`: academic CV in HTML; can be printed from the browser.
- `data/publications.json`: publication records, topics, searchable keywords, summaries, verified resources and related versions.
- `scripts/build_publications.py`: run after editing publication data to update the committed static HTML.
- `js/publication-search.js`: normalization, word-prefix matching, combined filters and URL state.
- `js/site.js`: search controls, topic counts, clickable keywords and keyboard shortcuts. All publication content is available without JavaScript.
- `js/theme.js`: system-aware light/dark theme and saved preference.
- `assets/fonts/`: self-hosted Open Sans and its SIL Open Font License.
- `docs/resource-audit.md`: paper-to-repository evidence and keyword/summary sources.

Search covers titles, authors, venues, years, topics, keywords, summaries and related versions. All query terms must match; accent and punctuation differences are normalized. Topic and year filters combine with the query, and `q`, `topic` and `year` URL parameters preserve the current view. Clicking a keyword starts a fresh search across all topics and years. Press `/` to focus search or Escape to clear the query. Topic counts reflect the query and year and can overlap.

## Validation

```sh
python3 scripts/build_publications.py
python3 tests/publications.test.py
node --test tests/publication-search.test.cjs
```

The Python tests exercise generated static markup and search metadata. The Node tests exercise matching and URL/filter behavior. Browser verification notes for the current iteration are in `docs/iteration-2.md`.

The original site remains available in Git at commit `ffd25dc`; legacy assets and the original licence are retained. No remote changes have been pushed.

## Content review for the next iteration

The biography and CV are a draft based on the local CV and public academic records. Confirm preferred emphasis between LLM reasoning and federated/foundation-model research. Review teaching dates, award wording, invited talks and supervision descriptions. The portrait is the current public TU/e profile photo. The CV also mentions Bringing Functional Encryption in Federated Foundational Models (NeurIPS FL@FM 2024); verify its record before adding it.

The bibliography has 14 main entries and three related versions from the Scholar audit. It is not claimed to cover every output. The thesis is linked separately. The local CV's private under-review manuscript is excluded. Proceedings publication years may differ from event years: DeltaMask uses the BigData 2024 event label, and UbiSec explicitly notes proceedings publication in 2025.

AE-PSL, MaTU and MPSL workshop acceptance is confirmed in the respective arXiv records. The academic CV is presented as HTML to avoid exposing the local PDF's under-review work or carrying its bibliographic discrepancies into a public asset.

## Sources

- https://research.tue.nl/en/persons/vasilis-tsouvalas/
- Portrait: https://research.tue.nl/files-asset/374293530/DSC02763-2-2.jpg?w=640&f=jpg
- https://research.tue.nl/en/publications/chaos-to-harmony-taming-heterogeneity-and-communication-bottlenec/
- https://arxiv.org/abs/2607.17913
- https://arxiv.org/abs/2502.06376
- https://arxiv.org/abs/2502.06355
- https://arxiv.org/abs/2311.17299
- The local CV and Scholar audit are supporting private source material and are not copied into this repository.
