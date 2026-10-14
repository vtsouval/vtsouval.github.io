/* Progressive enhancement: static milestones become a keyboard-accessible journey. */
(() => {
  'use strict';
  const journey = document.querySelector('[data-journey]');
  if (!journey) return;
  const panels = [...journey.querySelectorAll('.journey-panel')];
  const tablist = journey.querySelector('.journey-stops');
  const map = journey.querySelector('.journey-map');
  const road = journey.querySelector('.journey-road-base');
  const traveled = journey.querySelector('.journey-road-traveled');
  const previous = journey.querySelector('.journey-previous');
  const next = journey.querySelector('.journey-next');
  const position = journey.querySelector('.journey-position');
  const yearSelect = journey.querySelector('.journey-year-select');
  const compact = window.matchMedia('(max-width: 1023px)');
  if (!panels.length || !tablist || !map || !road || !traveled || !previous || !next) return;
  const stage = journey.querySelector('.journey-stage');
  const connector = journey.querySelector('.journey-connector');
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  let selected = 0;
  let points = [];
  // Keep the summary visible; the event rail and all supplemental notes share
  // one disclosure. Without JavaScript the original chronology stays readable.
  const disclosures = panels.map((panel, index) => {
    const heading = panel.querySelector('.journey-detail-heading');
    const details = document.createElement('div');
    details.className = 'journey-details';
    details.id = panel.id + '-details';
    [...panel.children].filter(child => child !== heading).forEach(child => details.append(child));
    panel.append(details);
    const toggle = document.createElement('button');
    toggle.type = 'button';
    toggle.className = 'journey-toggle';
    toggle.setAttribute('aria-controls', details.id);
    const chevron = document.createElement('span');
    chevron.className = 'journey-toggle-chevron';
    chevron.setAttribute('aria-hidden', 'true');
    toggle.append(chevron);
    toggle.addEventListener('click', () => {
      setExpanded(index, details.hidden);
      drawConnector();
    });
    heading.append(toggle);
    return { details, toggle };
  });
  const tabs = panels.map((panel, index) => {
    const count = panel.querySelectorAll('.journey-event').length;
    const columns = count > 4 ? 3 : count;
    panel.style.setProperty('--event-count', columns);
    panel.dataset.columns = String(columns);
    panel.dataset.flow = count > 1 ? 'row' : 'column';
    if (yearSelect) {
      const option = document.createElement('option');
      option.value = String(index);
      option.textContent = panel.dataset.year;
      yearSelect.append(option);
    }
    const tab = document.createElement('button');
    tab.type = 'button';
    tab.className = 'journey-stop';
    tab.id = panel.id + '-tab';
    tab.dataset.tone = panel.dataset.tone;
    tab.setAttribute('role', 'tab');
    tab.setAttribute('aria-controls', panel.id);
    tab.setAttribute('aria-label', panel.dataset.year + ': ' + panel.dataset.label);
    const copy = document.createElement('span');
    copy.className = 'journey-stop-copy';
    const year = document.createElement('span');
    year.className = 'journey-stop-year';
    year.textContent = panel.dataset.year;
    if (panel.dataset.year === 'Present') {
      const live = document.createElement('span');
      live.className = 'journey-live';
      live.setAttribute('aria-hidden', 'true');
      year.append(live);
    }
    copy.append(year);
    const marker = document.createElement('span');
    marker.className = 'journey-marker';
    marker.append(panel.querySelector('.journey-detail-icon svg').cloneNode(true));
    tab.append(copy, marker);
    tab.addEventListener('click', () => select(index, {
      userInitiated: true,
      expanded: index !== selected || disclosures[index].details.hidden
    }));
    panel.setAttribute('role', 'tabpanel');
    panel.setAttribute('aria-labelledby', tab.id);
    panel.tabIndex = 0;
    tablist.append(tab);
    return tab;
  });

  function setExpanded(index, expanded) {
    const { details, toggle } = disclosures[index];
    details.hidden = !expanded;
    panels[index].dataset.expanded = String(expanded);
    toggle.setAttribute('aria-expanded', String(expanded));
    toggle.setAttribute('aria-label', `${expanded ? 'Hide' : 'Show'} ${panels[index].dataset.year} timeline details`);
  }

  // The curve follows the actual marker centers, including responsive widths.
  function pathThrough(stops) {
    if (!stops.length) return '';
    let path = `M ${stops[0].x} ${stops[0].y}`;
    for (let i = 1; i < stops.length; i++) {
      const a = stops[i - 1], b = stops[i];
      const middle = (a.x + b.x) / 2;
      path += ` C ${middle} ${a.y}, ${middle} ${b.y}, ${b.x} ${b.y}`;
    }
    return path;
  }

  function drawRoad() {
    const origin = journey.querySelector('.journey-map-inner').getBoundingClientRect();
    points = tabs.map(tab => {
      const box = tab.querySelector('.journey-marker').getBoundingClientRect();
      return { x: box.left - origin.left + box.width / 2, y: box.top - origin.top + box.height / 2 };
    });
    road.setAttribute('d', pathThrough(points));
    traveled.setAttribute('d', pathThrough(points.slice(0, selected + 1)));
    drawConnector();
  }

  // Attach the open year's sequence to its marker, including while panning.
  function drawConnector() {
    if (!stage || !connector) return;
    if (compact.matches) { connector.setAttribute('hidden', ''); return; }
    const origin = stage.getBoundingClientRect();
    const viewport = map.getBoundingClientRect();
    const marker = tabs[selected].querySelector('.journey-marker').getBoundingClientRect();
    const startX = marker.left + marker.width / 2;
    // An offscreen year must never appear connected to a different visible stop.
    const outside = startX < viewport.left + marker.width / 2 || startX > viewport.right - marker.width / 2;
    connector.toggleAttribute('hidden', outside);
    if (outside) return;
    const panel = panels[selected];
    const heading = panel.querySelector('.journey-detail-heading');
    const headingBox = heading.getBoundingClientRect();
    const dot = getComputedStyle(heading, '::before');
    const x = startX - origin.left;
    const y = marker.bottom - origin.top + 6;
    const endX = headingBox.left - origin.left + parseFloat(dot.left) + parseFloat(dot.width) / 2;
    const endY = headingBox.top - origin.top + parseFloat(dot.top) + parseFloat(dot.height) / 2;
    const bendY = endY - 28;
    const direction = endX >= x ? 1 : -1;
    const radius = Math.min(14, Math.abs(endX - x) / 2, Math.max(0, (bendY - y) / 2));
    const path = `M ${x} ${y} V ${bendY - radius} Q ${x} ${bendY} ${x + direction * radius} ${bendY} H ${endX - direction * radius} Q ${endX} ${bendY} ${endX} ${bendY + radius} V ${endY}`;
    connector.style.height = `${endY + 2}px`;
    connector.dataset.tone = panel.dataset.tone;
    connector.querySelector('path').setAttribute('d', path);
  }
  let drawFrame;
  map.addEventListener('scroll', () => {
    if (drawFrame) return;
    drawFrame = requestAnimationFrame(() => { drawFrame = null; drawConnector(); });
  }, { passive: true });

  function revealTab(animate) {
    // Scroll only this strip; never jump the containing document to a tab.
    const tab = tabs[selected];
    const left = tab.getBoundingClientRect().left - map.getBoundingClientRect().left + map.scrollLeft;
    map.scrollTo({ left: left - (map.clientWidth - tab.offsetWidth) / 2, behavior: animate && !reducedMotion.matches ? 'smooth' : 'instant' });
  }

  function select(index, { focus = false, reveal = true, userInitiated = false, expanded = true } = {}) {
    // Persistent mobile controls return readers to the start of the chosen year.
    const returnToStart = userInitiated && compact.matches && journey.getBoundingClientRect().top < parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--header-height')) - 8;
    selected = Math.max(0, Math.min(panels.length - 1, index));
    tabs.forEach((tab, i) => {
      tab.setAttribute('aria-selected', String(i === selected));
      tab.tabIndex = i === selected ? 0 : -1;
      panels[i].hidden = i !== selected;
      setExpanded(i, i === selected && expanded);
    });
    if (yearSelect) yearSelect.value = String(selected);
    previous.disabled = selected === 0;
    next.disabled = selected === panels.length - 1;
    position.textContent = `${String(selected + 1).padStart(2, '0')} / ${String(panels.length).padStart(2, '0')}`;
    traveled.setAttribute('d', pathThrough(points.slice(0, selected + 1)));
    if (focus) tabs[selected].focus({ preventScroll: true });
    if (reveal) revealTab(true);
    drawConnector();
    if (returnToStart) journey.scrollIntoView({ behavior: 'instant', block: 'start' });
  }

  tablist.addEventListener('keydown', event => {
    const current = tabs.indexOf(event.target);
    if (current < 0 || event.altKey || event.ctrlKey || event.metaKey) return;
    let index;
    if (event.key === 'ArrowRight') index = Math.min(current + 1, tabs.length - 1);
    else if (event.key === 'ArrowLeft') index = Math.max(current - 1, 0);
    else if (event.key === 'Home') index = 0;
    else if (event.key === 'End') index = tabs.length - 1;
    else return;
    event.preventDefault();
    select(index, { focus: true, userInitiated: true });
  });
  previous.addEventListener('click', () => select(selected - 1, { userInitiated: true }));
  next.addEventListener('click', () => select(selected + 1, { userInitiated: true }));
  yearSelect?.addEventListener('change', () => select(Number(yearSelect.value), { userInitiated: true }));
  function followHash() {
    const index = panels.findIndex(panel => '#' + panel.id === window.location.hash);
    if (index >= 0) select(index);
  }
  journey.classList.add('journey-enhanced');
  map.hidden = false;
  journey.querySelector('.journey-controls').hidden = false;
  const linkedIndex = panels.findIndex(panel => '#' + panel.id === window.location.hash);
  const presentIndex = panels.findIndex(panel => panel.dataset.year === 'Present');
  const initialIndex = linkedIndex >= 0 ? linkedIndex : presentIndex >= 0 ? presentIndex : panels.length - 1;
  select(initialIndex, { reveal: false, expanded: linkedIndex >= 0 });
  drawRoad();
  revealTab(false);
  window.addEventListener('hashchange', followHash);
  // A same-page link must also re-open a year after it was collapsed, even when
  // its hash is already current and the browser does not fire hashchange.
  document.addEventListener('click', event => {
    if (event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
    const href = event.target.closest('a[href]')?.getAttribute('href');
    const index = panels.findIndex(panel => '#' + panel.id === href);
    if (index >= 0) select(index);
  }, true);
  function resize() { drawRoad(); revealTab(false); }
  if (typeof ResizeObserver !== 'undefined') new ResizeObserver(resize).observe(map);
  else window.addEventListener('resize', resize);
  document.fonts?.ready.then(drawRoad);
})();
