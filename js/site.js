(function () {
  'use strict';
  const tools = document.querySelector('.publication-tools');
  const filters = document.querySelector('.filters');
  const input = document.querySelector('#publication-search');
  const yearSelect = document.querySelector('#publication-year');
  const count = document.querySelector('#publication-count');
  const clear = document.querySelector('#clear-search');
  const reset = document.querySelector('#reset-search');
  const empty = document.querySelector('#publication-empty');
  const search = window.PublicationSearch;
  if (!tools || !filters || !input || !yearSelect || !count || !clear || !reset || !empty || !search) return;

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
  const years = [...new Set(records.map(record => record.year))].filter(Boolean).sort((a, b) => Number(b) - Number(a));
  while (yearSelect.options.length > 1) yearSelect.remove(1);
  for (const year of years) {
    const option = document.createElement('option');
    option.value = year;
    option.textContent = year;
    yearSelect.append(option);
  }
  const options = { topics: buttons.map(button => button.dataset.filter), years: ['all', ...years] };
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
    yearSelect.value = state.year;
    clear.hidden = !state.query;
    empty.hidden = visible > 0;
    count.textContent = `${visible} of ${records.length} research works`;
    if (syncURL) {
      const url = window.location.pathname + search.writeState(window.location.search, state) + window.location.hash;
      window.history.replaceState(window.history.state, '', url);
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
  yearSelect.addEventListener('change', () => {
    state.year = yearSelect.value;
    render();
  });
  filters.addEventListener('click', event => {
    const button = event.target.closest('button[data-filter]');
    if (!button || !filters.contains(button)) return;
    state.topic = button.dataset.filter;
    render();
  });
  for (const keyword of document.querySelectorAll('.pub-keyword[data-keyword]')) {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'pub-keyword';
    button.dataset.keyword = keyword.dataset.keyword;
    button.textContent = keyword.textContent;
    keyword.replaceWith(button);
    button.addEventListener('click', () => {
      state = { query: button.dataset.keyword, topic: 'all', year: 'all' };
      render();
      input.focus({ preventScroll: true });
      tools.scrollIntoView({ block: 'start' });
    });
  }
  window.addEventListener('popstate', () => {
    state = search.readState(window.location.search, options);
    render(false);
  });
  document.addEventListener('keydown', event => {
    if (event.key !== '/' || event.defaultPrevented || event.ctrlKey || event.metaKey || event.altKey || event.isComposing) return;
    if (event.target.closest('input, textarea, select, [contenteditable]:not([contenteditable="false"])')) return;
    event.preventDefault();
    input.focus();
  });

  render(false);
  tools.hidden = false;
  filters.hidden = false;
})();
