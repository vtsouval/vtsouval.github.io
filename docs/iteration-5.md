# Research navigation and theme refinement — 2026-10-13

The introduction and CV now reflect distributed learning, efficient foundation models, limited supervision, privacy and fairness, and evaluation of language-model reasoning. Private research material was used only to understand these broad directions. No unpublished manuscript titles, details, submission claims, links, or PDFs were added.

Removed explanatory search copy and repetitive section captions. Search still covers all indexed metadata and supports the slash shortcut. The manually controlled, swipeable research carousel links five directions to existing public topics. It clears earlier query/year filters, moves keyboard focus to Publications, and preserves Back navigation. There is no automatic rotation, and reduced motion is respected.

Auto is the default theme; Light and Dark remain explicit saved choices. Auto follows later system changes and clears overrides. The compact picker uses native radios, keyboard navigation, Escape and outside-click dismissal. Fixed premature closure during radio-label activation, SVG hidden-attribute handling, and focus scrolling. Theme colors and favicon adapt, and a CSS system-theme fallback works without JavaScript.

SVG geometry is embedded in both public pages, including generated publications, to remove external sprite dependencies. The deterministic icon builder also refreshes existing inline icons after a sprite edit. Publication history writes are guarded so filtering remains usable when a browser restricts the History API.

## Verification

- 17 Node tests, five publication-generator tests and five icon-builder tests pass.
- Local file/fragment references and duplicate HTML IDs checked; publication and icon generation are idempotent.
- Desktop and 390px mobile views checked in light and dark themes without horizontal overflow.
- Verified carousel boundaries, fresh topic filters, prior-search restoration with Back, native theme selection, persistence, Auto system updates, and CV layout.
- With JavaScript disabled, all 14 public entries remain available, icons render without sprite requests, and the dark system palette applies.
- Browser console clean in the final preview. Direct file-URL browser inspection is blocked by the browser environment; visual verification used the localhost preview. Self-contained icons and restricted-history behavior are covered structurally and by tests.

Changes remain local. No website deployment or external-profile edits.
