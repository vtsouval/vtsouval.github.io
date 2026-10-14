/* Blocking in <head>: resolve the saved or system theme before the first paint. */
(() => {
  'use strict';
  const storageKey = 'site-theme';
  const modes = ['auto', 'light', 'dark'];
  const labels = { auto: 'System', light: 'Light', dark: 'Dark' };
  const media = window.matchMedia('(prefers-color-scheme: dark)');
  const normalize = value => modes.includes(value) ? value : 'auto';
  let preference = 'auto';
  let button;
  try { preference = normalize(window.localStorage.getItem(storageKey)); }
  catch (_) { /* The system default also works without persistent storage. */ }
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
    if (!button) return;
    const next = modes[(modes.indexOf(preference) + 1) % modes.length];
    const current = labels[preference] + (preference === 'auto' ? ` (${labels[resolved]})` : '');
    const description = `Color theme: ${current}. Switch to ${labels[next]}.`;
    button.setAttribute('aria-label', description);
    button.setAttribute('title', description);
    button.querySelectorAll('[data-theme-icon]').forEach(icon => {
      icon.toggleAttribute('hidden', icon.dataset.themeIcon !== preference);
    });
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
    if (!button) return;
    apply();
    button.hidden = false;
    button.addEventListener('click', () => {
      preference = modes[(modes.indexOf(preference) + 1) % modes.length];
      apply();
      try {
        if (preference === 'auto') window.localStorage.removeItem(storageKey);
        else window.localStorage.setItem(storageKey, preference);
      } catch (_) { /* The choice remains usable for this page. */ }
    });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', initialize, { once: true });
  else initialize();
})();
