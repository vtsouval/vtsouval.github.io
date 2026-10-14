(function () {
  'use strict';
  const tools = document.querySelector('.publication-tools');
  const filters = document.querySelector('.filters');
  const input = document.querySelector('#publication-search');
  const count = document.querySelector('#publication-count');
  const clear = document.querySelector('#clear-search');
  const reset = document.querySelector('#reset-search');
  const empty = document.querySelector('#publication-empty');
  const search = window.PublicationSearch;
  if (!tools || !filters || !input || !count || !clear || !reset || !empty || !search) return;

  const records = [...document.querySelectorAll('.publication')].map(element => ({
    element,
    search: element.dataset.search || element.textContent,
    topics: (element.dataset.topics || '').split(/\s+/),
    year: element.dataset.year,
  }));
  const buttons = [...filters.querySelectorAll('button[data-filter]')];
  for (const button of buttons) {
    if (button.querySelector('.filter-count')) continue;
    const badge = document.createElement('span');
    badge.className = 'filter-count';
    button.append(document.createTextNode(' '), badge);
  }
  const options = { topics: buttons.map(button => button.dataset.filter), years: ['all'] };
  let state = search.readState(window.location.search, options);

  function render(syncURL = true) {
    let visible = 0;
    for (const record of records) {
      const matches = search.matchesPublication(record, state);
      record.element.hidden = !matches;
      if (matches) visible++;
    }
    const topicCounts = search.countByTopic(records, state, options.topics);
    for (const button of buttons) {
      button.setAttribute('aria-pressed', String(button.dataset.filter === state.topic));
      button.querySelector('.filter-count').textContent = topicCounts[button.dataset.filter];
    }
    input.value = state.query;
    clear.hidden = !state.query;
    empty.hidden = visible > 0;
    count.textContent = visible === records.length ? `${visible} publications` : `${visible} of ${records.length} publications`;
    if (syncURL) {
      const url = window.location.pathname + search.writeState(window.location.search, state) + window.location.hash;
      try { window.history.replaceState(window.history.state, '', url); } catch (_) { /* Filtering also works when local-file history is restricted. */ }
    }
  }

  input.addEventListener('input', () => {
    state.query = input.value;
    render();
  });
  input.addEventListener('keydown', event => {
    if (event.key !== 'Escape' || !state.query) return;
    event.preventDefault();
    state.query = '';
    render();
  });
  clear.addEventListener('click', () => {
    state.query = '';
    render();
    input.focus();
  });
  reset.addEventListener('click', () => {
    state = { query: '', topic: 'all', year: 'all' };
    render();
    input.focus();
  });
  filters.addEventListener('click', event => {
    const button = event.target.closest('button[data-filter]');
    if (!button || !filters.contains(button)) return;
    state.topic = button.dataset.filter;
    render();
  });
  for (const link of document.querySelectorAll('[data-research-topic]')) {
    link.addEventListener('click', event => {
      if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      const topic = link.dataset.researchTopic;
      if (!options.topics.includes(topic)) return;
      event.preventDefault();
      // A research direction starts a fresh view, independent of earlier searches.
      state = { query: '', topic, year: 'all' };
      const url = window.location.pathname + search.writeState(window.location.search, state) + '#publications';
      try { window.history.pushState(window.history.state, '', url); } catch (_) { /* Keep local navigation functional without History API support. */ }
      render(false);
      const heading = document.querySelector('#publications-title');
      heading.focus({ preventScroll: true });
      document.querySelector('#publications').scrollIntoView({ block: 'start' });
    });
  }
  window.addEventListener('popstate', () => {
    state = search.readState(window.location.search, options);
    render(false);
  });
  document.addEventListener('keydown', event => {
    if (document.querySelector('dialog[open]')) return;
    if (event.key !== '/' || event.defaultPrevented || event.ctrlKey || event.metaKey || event.altKey || event.isComposing) return;
    if (event.target.closest('input, textarea, select, [contenteditable]:not([contenteditable="false"])')) return;
    event.preventDefault();
    input.focus();
  });

  render(false);
  tools.hidden = false;
  filters.hidden = false;
})();
