/* Keep this script blocking in <head> so the resolved theme is set before paint. */
(() => {
  'use strict';

  const storageKey = 'site-theme';
  const labels = { auto: 'Auto', light: 'Light', dark: 'Dark' };
  const media = window.matchMedia('(prefers-color-scheme: dark)');
  const normalize = value => value === 'light' || value === 'dark' ? value : 'auto';
  let preference = 'auto';
  let button;
  let menu;

  try { preference = normalize(window.localStorage.getItem(storageKey)); }
  catch (_) { /* Private browsing or file URLs may not expose storage. */ }

  function apply() {
    const resolved = preference === 'auto' ? (media.matches ? 'dark' : 'light') : preference;
    document.documentElement.dataset.theme = resolved;
    document.documentElement.dataset.themePreference = preference;

    let meta = document.querySelector('meta[name="theme-color"]');
    if (!meta) {
      meta = document.createElement('meta');
      meta.name = 'theme-color';
      document.head.append(meta);
    }
    meta.setAttribute('content', resolved === 'dark' ? '#0e1216' : '#ffffff');

    if (!button || !menu) return;
    const description = `Color theme: ${labels[preference]}${preference === 'auto' ? ` (currently ${labels[resolved]})` : ''}`;
    button.setAttribute('aria-label', description);
    button.setAttribute('title', description);
    button.querySelector('[data-theme-label]').textContent = labels[preference];
    button.querySelectorAll('[data-theme-icon]').forEach(icon => {
      icon.toggleAttribute('hidden', icon.dataset.themeIcon !== preference);
    });
    menu.querySelectorAll('input[name="theme"]').forEach(input => {
      input.checked = input.value === preference;
    });
  }

  function choose(value) {
    preference = normalize(value);
    apply();
    try {
      if (preference === 'auto') window.localStorage.removeItem(storageKey);
      else window.localStorage.setItem(storageKey, preference);
    } catch (_) { /* The choice still applies for this page. */ }
  }

  apply();
  const followSystem = () => { if (preference === 'auto') apply(); };
  if (media.addEventListener) media.addEventListener('change', followSystem);
  else media.addListener(followSystem);

  window.addEventListener('storage', event => {
    if (event.key !== storageKey && event.key !== null) return;
    preference = normalize(event.newValue);
    apply();
  });

  function initialize() {
    button = document.querySelector('#theme-toggle');
    menu = document.querySelector('#theme-menu');
    if (!button || !menu) return;
    const picker = button.closest('.theme-picker');
    if (!picker) return;

    const close = (restoreFocus = false) => {
      menu.hidden = true;
      button.setAttribute('aria-expanded', 'false');
      if (restoreFocus) button.focus({ preventScroll: true });
    };
    const open = () => {
      menu.hidden = false;
      button.setAttribute('aria-expanded', 'true');
      menu.querySelector('input:checked').focus({ preventScroll: true });
    };

    apply();
    button.hidden = false;
    button.addEventListener('click', () => menu.hidden ? open() : close());
    button.addEventListener('keydown', event => {
      if (event.key === 'ArrowDown') {
        event.preventDefault();
        open();
      }
    });
    menu.addEventListener('change', event => {
      if (event.target.name === 'theme' && event.target.type === 'radio') choose(event.target.value);
    });
    document.addEventListener('keydown', event => {
      if (event.key === 'Escape' && !menu.hidden) {
        event.preventDefault();
        close(true);
      }
    });
    document.addEventListener('pointerdown', event => {
      if (!menu.hidden && !picker.contains(event.target)) close();
    });
    picker.addEventListener('focusout', event => {
      // Label activation can briefly leave focus unset before checking its radio.
      if (event.relatedTarget && !picker.contains(event.relatedTarget)) close();
    });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', initialize, { once: true });
  else initialize();
})();
