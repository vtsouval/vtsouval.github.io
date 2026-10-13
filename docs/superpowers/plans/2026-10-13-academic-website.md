# Academic website implementation plan

Goal: Create a reviewable local first iteration of the user's academic website.
Spec: ../specs/2026-10-13-academic-website-design.md
Architecture: Static HTML and CSS. Python standard library generates publication HTML from a single JSON source; optional browser JavaScript filters already-rendered entries.

The user's request to start iterating authorizes this reversible local implementation. Keep all remote state unchanged. Preserve the upstream baseline in Git. Implement inline in the dedicated clone.

- [x] Build the new semantic homepage: updated introduction, three research themes, four featured works, academic background and contact.
- [x] Populate public publications from the audit and primary sources; retain version distinctions and explicit workshop/preprint labels. Do not copy the local CV's under-review manuscript into the site.
- [x] Add responsive styling, optional topic filters, academic CV page, and metadata.
- [x] Validate generated links and static content; visually inspect desktop/mobile, keyboard navigation, and publication filtering. Record any remaining content-review limitations.

Files: index.html, style.css, cv.html, js/site.js, data/publications.json, scripts/build_publications.py, README.md, robots.txt, sitemap.xml, assets/misc/favicon.svg.

Review focus: mobile overflow, content without JavaScript, no broken local assets or anchors, accurate venue distinctions, source discrepancies retained in documentation rather than silently asserted.

Verification: HTML parser checked 27 local links/resources, unique IDs, and one H1 per page. Homepage and CV returned HTTP 200. Browser confirmed 14 static publications with JavaScript disabled, four matching entries under the foundation-model filter, keyboard skip-link focus, no horizontal overflow at 300px and 390px CSS widths, and no browser warnings/errors. Desktop and mobile screenshots inspected. Independent read-only review found no material issues. External link availability was not exhaustively tested.
