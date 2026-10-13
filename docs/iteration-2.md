# Academic website — second local iteration, 2026-10-13

This iteration supersedes the first iteration's serif visual direction. The user requested close alignment with Aaqib Saeed's typography and layout, clearer responsive behavior, paper keyword search, and verified GitHub links. Work remains local on `website-revision`.

## Design and behavior

- Open Sans, restrained blue links, white background, compact academic navigation, a 1080px content container and a circular portrait follow the reference at https://aqibsaeed.github.io/.
- Light/dark palettes, responsive layouts, visible keyboard focus and reduced-motion support are shared with the CV.
- The publication list uses short venue labels, consistent resource icons, four visible keyword chips, collapsed summaries and related-version disclosures. The search index includes every keyword, not just the four visible chips.
- The topic filtering and counts draw on https://yukimasano.github.io/publications/. Free-text keyword search, combined year filters, keyboard shortcuts and persistent query URLs extend that pattern.
- Fourteen main works and three related versions are retained. Nine main works have verified repository links. Nousphera, FederatedML and the personal GitHub profile have a dedicated research-code section.
- Keywords and summaries come from public paper abstracts/records. Repository associations were checked against public READMEs, titles, paper identifiers or DOI references. See `resource-audit.md`; execution or reproducibility of those repositories has not been tested.

## Verification

- Ten Node search tests and four Python generator tests pass.
- Browser checks cover query/topic/year combinations, empty results and reset, accent normalization, URL restoration, clickable keywords, summaries, theme persistence, and full static content with JavaScript disabled.
- Mobile checks at 320px and 390px CSS widths show no horizontal overflow; the CV was also checked at 390px.
- A review found that keyword clicks near the bottom could leave the focused search field offscreen. The keyword handler now scrolls the toolbar into view; verified on mobile with the field below the sticky header and matching results visible.
- Local links, fragments, SVG symbols and fonts resolve. Open Sans and the portrait load locally without runtime font requests.

## Assets

Open Sans is distributed under the included SIL Open Font License in `assets/fonts/OFL.txt`. The portrait is copied from the user's public TU/e profile, with its source URL recorded in the README. SVG interface icons are local. Legacy assets and the original license are retained.

## Remaining content decisions

The local CV and earlier audit identify a workshop item needing a verified public bibliographic record. It remains excluded. The biography, teaching and recognition wording remain open to the author's editorial review. No unverified code association or private under-review manuscript has been added.
