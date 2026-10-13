# Vasileios Tsouvalas — academic website

Local first revision of https://vtsouval.github.io. Static HTML/CSS with optional publication filters; no package installation or runtime API is required.

## Preview

Run `python3 -m http.server 8000 --bind 127.0.0.1` in this directory and open http://127.0.0.1:8000. Reload the browser after edits.

## Editing

- `index.html`: introduction, research themes, selected work and academic profile.
- `style.css`: shared visual design and responsive layouts.
- `cv.html`: academic CV in HTML; can be printed from the browser.
- `data/publications.json`: publication records, topics, resources and related versions.
- `scripts/build_publications.py`: run after editing publication data to update the committed static HTML.
- `js/site.js`: optional filters. All publication content is available without JavaScript.

The original site remains available in Git at commit `ffd25dc`; legacy assets and the original licence are retained. No remote changes have been pushed.

## Content review for the next iteration

The biography and CV are a draft based on the local CV and public academic records. Confirm preferred emphasis between LLM reasoning and federated/foundation-model research. Review teaching dates, award wording, invited talks and supervision descriptions. A portrait can be added once selected. The CV also mentions Bringing Functional Encryption in Federated Foundational Models (NeurIPS FL@FM 2024); verify its record before adding it.

The bibliography has 14 main entries and three related versions from the Scholar audit. It is not claimed to cover every output. The thesis is linked separately. The local CV's private under-review manuscript is excluded. Proceedings publication years may differ from event years: DeltaMask uses the BigData 2024 event label, and UbiSec explicitly notes proceedings publication in 2025.

AE-PSL, MaTU and MPSL workshop acceptance is confirmed in the respective arXiv records. The academic CV is presented as HTML to avoid exposing the local PDF's under-review work or carrying its bibliographic discrepancies into a public asset.

## Sources

- https://research.tue.nl/en/persons/vasilis-tsouvalas/
- https://research.tue.nl/en/publications/chaos-to-harmony-taming-heterogeneity-and-communication-bottlenec/
- https://arxiv.org/abs/2607.17913
- https://arxiv.org/abs/2502.06376
- https://arxiv.org/abs/2502.06355
- https://arxiv.org/abs/2311.17299
- The local CV and Scholar audit are supporting private source material and are not copied into this repository.
