# Mobile and tablet refinement — 2026-10-13

The main navigation uses a compact two-row arrangement on phones while retaining flexible wrapping for enlarged text. Touch devices get larger theme, carousel, publication-filter, search-clear and profile controls. Search and year inputs use 16px text to avoid focus zoom on iOS. Paper keywords and expandable summaries have more comfortable touch spacing.

The header's measured height now controls anchor clearance and the CV index position. It updates after resizing, font loading and restored-page navigation, with a resize fallback when ResizeObserver is unavailable. The CV index is bounded by the visible viewport and independently scrollable on short landscape screens; phone layouts retain an inline, wrapping section index. CSS includes a vh fallback for browsers without dvh support.

## Verification

- 20 Node tests, five publication tests and five icon-builder tests pass.
- Chrome responsive emulation checked at 320×740, 390×740, 768×1024, 844×390 and 1024×768. These are browser simulations, not physical iOS/Android device tests.
- Inspected light and dark mobile layouts, readable publication rows, wrapped controls and the tablet CV. No visible horizontal page overflow in the inspected layouts.
- Verified carousel navigation opens its publication topic, mobile search narrows to the two split-learning papers, and clearing restores all 14 entries.
- Verified tablet CV anchor clearance and scrolled the landscape CV index to activate its final Publications link.
- Static asset URLs bumped to v6; publication content and private-draft boundaries are unchanged.

The full academic website revision was published from main via GitHub Pages before this follow-up responsive pass. The local paper library is a separate workspace resource outside this repository.
