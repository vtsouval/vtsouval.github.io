# Academic website revision — first iteration

## Purpose

Present Vasileios Tsouvalas's academic profile, research contributions and achievements clearly, and improve discoverability. The user identified academic visibility as the primary purpose and Aaqib Saeed's website as a reference to improve upon. Work locally and iterate before publication.

## Direction

Use a restrained editorial layout: warm white background, dark text, a deep blue accent, strong typography, generous spacing, and research figures where they explain a contribution. Keep the introduction compact. Give selected work more visual prominence than the complete bibliography.

Compared with a compact text-only academic page, this gives contributions more context. Compared with a large visual portfolio, it keeps academic information easy to scan and maintain. Aaqib's site informs the clarity of the navigation and thematic organisation; do not copy its biography, content, or identity.

## Homepage structure

1. Introduction: name, postdoctoral role at TU/e, a short research statement, and direct Scholar, GitHub, ORCID, CV and email links where verified.
2. Research themes: reasoning in language models; efficient distributed adaptation of foundation models; learning with limited or imperfect supervision. Treat this ordering as provisional, since the user's preferred emphasis is not yet confirmed.
3. Selected work: four initial features covering DeltaMask, Many-Task Federated Fine-Tuning, EncCluster, and FedLN. Each has a short contribution summary, verified venue/status and direct resources. Selection can change during iteration. Describe individual responsibility only where established.
4. Publications: complete verified public bibliography, newest first; label journals, conferences, workshops and preprints accurately. Keep related versions adjacent while preserving distinct citations. Add optional topic filters without hiding the underlying content from non-JavaScript clients.
5. Academic profile: PhD and thesis, teaching and supervision, awards, talks and service. Use concise subsections with dates.
6. Contact: direct email and professional profiles.

## Content and evidence

The current site still says PhD student and features three 2022 projects. TU/e confirms a postdoc role and the PhD awarded on 2 July 2025. The local CV records a postdoc in LLM reasoning from September 2025 and further teaching, supervision and achievements.

Use these sources during implementation:

- https://research.tue.nl/en/persons/vasilis-tsouvalas/
- https://research.tue.nl/en/publications/chaos-to-harmony-taming-heterogeneity-and-communication-bottlenec/
- https://scholar.google.com/citations?user=FgPQz3QAAAAJ&hl=en
- The existing website and repository bibliography/figures.
- Local CV: `/Users/vtsouval/Documents/Job Hunting/CV.pdf`.
- Local audit: `/Users/vtsouval/Documents/Job Hunting/Publicity/scholar-audit-2026-10-13/`.

Cross-check bibliographic details against publisher records. The CV and public records differ on some dates and author lists, so the CV is not the authority for publication metadata. The audit contains snapshots and assessments, not a guarantee of current publication status. Do not publish private under-review work merely because it appears in a local CV. Do not invent new research results, honours, or claims about reasoning faithfulness. Omit unverified details from the first public-facing draft.

A portrait is not present in the cloned repository. Use an appropriate existing public profile portrait only if available and verified; otherwise use a text-led first iteration without a placeholder or generated likeness. Review the CV before copying it into public assets.

## Implementation boundaries

Keep GitHub Pages and the existing domain. Use semantic static HTML and CSS, with minimal JavaScript for optional filtering. No framework, external database, login, paid services or deployment are required. Preserve existing asset paths and licence attribution.

Replace the legacy template dependency in the homepage rather than carrying its custom elements and JavaScript visibility gate forward. Leave historical unused files in place during the first iteration; removal can follow a separate usage audit.

Core content and links must work without JavaScript. Use native anchors and details elements where suitable. Store publication metadata in one editable source if a generation step is introduced, and commit the generated HTML so GitHub Pages serves complete content. No runtime API or Scholar scraping dependency.

Add accurate page title, description, canonical URL, social metadata and Person structured data using verified public details. Supply robots/sitemap files when the final route set is known. These support discoverability; no ranking improvement is guaranteed.

## Baseline findings

- Repository: https://github.com/vtsouval/vtsouval.github.io
- Baseline commit: `ffd25dc86315c3012c469659ec3d82d55ff14f69` on `main`.
- Local iteration branch: `website-revision`.
- Static `index.html`; package manifest has no build or test scripts.
- Content starts hidden and is revealed by JavaScript.
- Existing BibTeX links target `master`, while the remote branch list exposes only `main`.
- Social metadata is incomplete; package metadata names the upstream worldmodels template.

## Verification and iteration

Preview using a localhost-only static server. Inspect desktop and narrow mobile layouts for wrapping, overflow, image sizing and navigation. Check keyboard focus and readable contrast. Verify local resources, anchor targets, publication links, and browser errors. Confirm the core page remains readable without JavaScript.

First review: layout, research emphasis and selected projects. Second review: exact biography, academic achievements and publication completeness. Publication to GitHub Pages is a later step after the local result is reviewed.

## Review status

This is the proposed written design for the first revision. The repository is cloned and the baseline is ready for local preview; the redesigned homepage has not yet been implemented.
