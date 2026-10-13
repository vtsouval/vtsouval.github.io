(function () {
  'use strict';
  const header = document.querySelector('.site-header');
  if (!header) return;

  // Navigation can wrap after rotation, zoom or font loading. Share its actual
  // height with anchor scrolling and the CV's independently scrollable index.
  function updateHeaderHeight() {
    const height = Math.ceil(header.getBoundingClientRect().height);
    if (height > 0) document.documentElement.style.setProperty('--header-height', height + 'px');
  }

  updateHeaderHeight();
  if (typeof ResizeObserver !== 'undefined') {
    new ResizeObserver(updateHeaderHeight).observe(header);
  } else {
    window.addEventListener('resize', updateHeaderHeight);
  }
  window.addEventListener('pageshow', updateHeaderHeight);
  if (document.fonts) document.fonts.ready.then(updateHeaderHeight);
})();
