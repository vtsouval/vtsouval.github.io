(() => {
  'use strict';
  const root = document.documentElement;
  const header = document.querySelector('.site-header');
  const updateHeight = () => root.style.setProperty('--header-height', Math.ceil(header.getBoundingClientRect().height) + 'px');
  updateHeight();
  if (typeof ResizeObserver !== 'undefined') new ResizeObserver(updateHeight).observe(header);
  const nav = document.querySelector('.section-nav');
  if (!nav) return;
  const tabs = [...nav.querySelectorAll('a')];
  const panels = [...document.querySelectorAll('.panel')];
  nav.setAttribute('role', 'tablist');
  tabs.forEach((tab, index) => {
    tab.setAttribute('role', 'tab');
    tab.setAttribute('aria-controls', panels[index].id);
    panels[index].setAttribute('role', 'tabpanel');
    panels[index].tabIndex = 0;
    tab.addEventListener('click', event => {
      event.preventDefault();
      history.pushState(null, '', tab.getAttribute('href'));
      show(index);
      nav.scrollIntoView({ block: 'start', behavior: 'instant' });
    });
    tab.addEventListener('keydown', event => {
      let next;
      if (event.key === 'ArrowRight') next = (index + 1) % tabs.length;
      else if (event.key === 'ArrowLeft') next = (index + tabs.length - 1) % tabs.length;
      else if (event.key === 'Home') next = 0;
      else if (event.key === 'End') next = tabs.length - 1;
      else return;
      event.preventDefault();
      tabs[next].focus();
      tabs[next].click();
    });
  });
  function show(index) {
    tabs.forEach((tab, i) => {
      tab.setAttribute('aria-selected', String(i === index));
      tab.tabIndex = i === index ? 0 : -1;
      panels[i].hidden = i !== index;
    });
    if (index !== 0) document.querySelector('video').pause();
  }
  function followHash() {
    const target = location.hash.slice(1);
    const index = panels.findIndex(panel => panel.id === target || (target === 'demo' && panel.id === 'overview'));
    show(index < 0 ? 0 : index);
    if (target === 'demo') document.querySelector('#demo').scrollIntoView({ block: 'start' });
  }
  window.addEventListener('hashchange', followHash);
  window.addEventListener('popstate', followHash);
  followHash();
})();
