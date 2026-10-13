(function () {
  'use strict';
  const entries = [...document.querySelectorAll('.cv-index a[href^="#"]')]
    .map(link => ({ link, section: document.getElementById(link.hash.slice(1)) }))
    .filter(entry => entry.section);
  if (!entries.length) return;

  const header = document.querySelector('.site-header');
  let scheduled = false;

  function updateCurrentSection() {
    scheduled = false;
    const root = document.documentElement;
    const scrollPadding = parseFloat(getComputedStyle(root).scrollPaddingTop) || 0;
    const headerBottom = header ? header.getBoundingClientRect().bottom : 0;
    const threshold = Math.max(scrollPadding, headerBottom + 16) + 2;
    let current = entries[0];

    for (const entry of entries) {
      if (entry.section.getBoundingClientRect().top <= threshold) current = entry;
    }
    // The final section may be too short to reach the top of the viewport.
    if (window.scrollY + window.innerHeight >= root.scrollHeight - 2) {
      current = entries[entries.length - 1];
    }
    for (const entry of entries) {
      if (entry === current) entry.link.setAttribute('aria-current', 'location');
      else entry.link.removeAttribute('aria-current');
    }
  }

  function scheduleUpdate() {
    if (scheduled) return;
    scheduled = true;
    window.requestAnimationFrame(updateCurrentSection);
  }

  window.addEventListener('scroll', scheduleUpdate, { passive: true });
  window.addEventListener('resize', scheduleUpdate);
  window.addEventListener('hashchange', scheduleUpdate);
  window.addEventListener('pageshow', scheduleUpdate);
  if (document.fonts) document.fonts.ready.then(scheduleUpdate);
  scheduleUpdate();
})();
