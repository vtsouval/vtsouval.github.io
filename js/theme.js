/* Apply the saved/system theme before rendering; failure to persist is harmless. */
(() => {
  const media = window.matchMedia('(prefers-color-scheme: dark)');
  let preference;
  try { preference = localStorage.getItem('site-theme'); } catch (_) { /* Storage may be disabled. */ }
  if (!['light', 'dark'].includes(preference)) preference = null;
  function apply(theme) {
    document.documentElement.dataset.theme = theme;
    const button = document.querySelector('#theme-toggle');
    if (button) {
      const label = `Switch to ${theme === 'dark' ? 'light' : 'dark'} theme`;
      button.setAttribute('aria-label', label);
      button.setAttribute('title', label);
    }
  }
  apply(preference || (media.matches ? 'dark' : 'light'));
  media.addEventListener('change', event => {
    if (!preference) apply(event.matches ? 'dark' : 'light');
  });
  document.addEventListener('DOMContentLoaded', () => {
    const button = document.querySelector('#theme-toggle');
    if (!button) return;
    button.hidden = false;
    apply(document.documentElement.dataset.theme);
    button.addEventListener('click', () => {
      preference = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
      apply(preference);
      try { localStorage.setItem('site-theme', preference); } catch (_) { /* Session still works. */ }
    });
  });
})();
