/* Native details keep keyboard access; the surrounding row is a pointer target. */
(() => {
  'use strict';
  const cards = [...document.querySelectorAll('.publication')];
  const disclosures = cards.map(card => card.querySelector('.pub-disclosure'));
  const closeOthers = active => disclosures.forEach(details => {
    if (details && details !== active) details.open = false;
  });
  cards.forEach((card, index) => {
    const details = disclosures[index];
    if (!details) return;
    details.addEventListener('toggle', () => { if (details.open) closeOthers(details); });
    card.addEventListener('click', event => {
      if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.altKey || event.shiftKey) return;
      if (event.target.closest('a, button, input, select, textarea, [contenteditable="true"]')) return;
      if (window.getSelection()?.isCollapsed === false) return;
      if (event.target.closest('summary')) {
        if (!details.open) closeOthers(details);
        return; // Preserve native Enter/Space activation and focus semantics.
      }
      if (!details.open) closeOthers(details);
      details.open = !details.open;
    });
  });
})();
