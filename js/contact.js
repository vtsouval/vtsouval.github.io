(() => {
  'use strict';
  const dialog = document.getElementById('contact-dialog');
  // Leave the email link usable when modal dialogs are unavailable.
  if (!dialog || typeof dialog.showModal !== 'function') return;

  const root = document.documentElement;
  let opener;
  let backdropPointer;
  let closeTimer;
  const triggers = [];

  function open(trigger) {
    if (dialog.open) return;
    opener = trigger || document.activeElement;
    dialog.showModal();
    root.classList.add('contact-open');
    triggers.forEach(button => button.setAttribute('aria-expanded', 'true'));
  }

  function finishClose() {
    clearTimeout(closeTimer);
    if (dialog.open) dialog.close();
  }

  function close() {
    if (!dialog.open || dialog.classList.contains('is-closing')) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      finishClose();
      return;
    }
    dialog.classList.add('is-closing');
    // Retain native modality during exit; the fallback also handles missing CSS.
    closeTimer = setTimeout(finishClose, 260);
  }

  dialog.addEventListener('animationend', event => {
    if (event.target === dialog && event.animationName === 'contact-exit') finishClose();
  });
  dialog.addEventListener('cancel', event => { event.preventDefault(); close(); });

  for (const link of document.querySelectorAll('[data-contact-open]')) {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'nav-contact';
    button.textContent = link.textContent;
    button.setAttribute('aria-haspopup', 'dialog');
    button.setAttribute('aria-controls', dialog.id);
    button.setAttribute('aria-expanded', 'false');
    triggers.push(button);
    link.replaceWith(button);
    button.addEventListener('click', () => open(button));
  }

  dialog.querySelector('[data-contact-close]').addEventListener('click', close);
  dialog.addEventListener('close', () => {
    clearTimeout(closeTimer);
    dialog.classList.remove('is-closing');
    root.classList.remove('contact-open');
    triggers.forEach(button => button.setAttribute('aria-expanded', 'false'));
    backdropPointer = undefined;
    // Old shared contact URLs still work, without leaving a dead fragment.
    if (location.hash === '#contact') {
      try { history.replaceState(history.state, '', location.pathname + location.search); }
      catch (_) { /* The panel still closes if history changes are restricted. */ }
    }
    if (opener && opener.isConnected) opener.focus({ preventScroll: true });
  });

  function outsidePanel(event) {
    const rect = dialog.getBoundingClientRect();
    return event.clientX < rect.left || event.clientX > rect.right ||
      event.clientY < rect.top || event.clientY > rect.bottom;
  }

  // A drag starting inside the panel must not dismiss it on the backdrop.
  dialog.addEventListener('pointerdown', event => {
    backdropPointer = event.button === 0 && outsidePanel(event) ? event.pointerId : undefined;
  });
  dialog.addEventListener('pointerup', event => {
    if (backdropPointer === event.pointerId && outsidePanel(event)) close();
    backdropPointer = undefined;
  });
  dialog.addEventListener('pointercancel', () => { backdropPointer = undefined; });

  function openFromHash() {
    if (location.hash === '#contact') open(document.querySelector('.nav-contact'));
  }
  window.addEventListener('hashchange', openFromHash);
  openFromHash();
})();
