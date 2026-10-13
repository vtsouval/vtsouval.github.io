(function (root, factory) {
  'use strict';
  const search = factory();
  if (typeof module === 'object' && module.exports) module.exports = search;
  else root.PublicationSearch = search;
})(typeof globalThis === 'object' ? globalThis : this, function () {
  'use strict';

  function normalize(text) {
    return String(text ?? '')
      .normalize('NFKD')
      .replace(/\p{M}/gu, '')
      .toLowerCase()
      .replace(/[^\p{L}\p{N}]+/gu, ' ')
      .trim();
  }

  function matchesPublication(publication, state = {}) {
    if (state.topic && state.topic !== 'all' && !publication.topics.includes(state.topic)) return false;
    if (state.year && state.year !== 'all' && String(publication.year) !== String(state.year)) return false;
    const words = normalize(publication.search).split(/\s+/);
    const query = normalize(state.query);
    return !query || query.split(/\s+/).every(term => words.some(word => word.startsWith(term)));
  }

  function countByTopic(publications, state, topics) {
    const matches = publications.filter(publication => matchesPublication(publication, { ...state, topic: 'all' }));
    return Object.fromEntries(topics.map(topic => [
      topic,
      topic === 'all' ? matches.length : matches.filter(publication => publication.topics.includes(topic)).length,
    ]));
  }

  function readState(search, options) {
    const params = new URLSearchParams(search);
    const topic = params.get('topic');
    const year = params.get('year');
    return {
      query: params.get('q') || '',
      topic: options.topics.includes(topic) ? topic : 'all',
      year: options.years.includes(year) ? year : 'all',
    };
  }

  function writeState(search, state) {
    const params = new URLSearchParams(search);
    for (const [key, value] of [['q', state.query], ['topic', state.topic], ['year', state.year]]) {
      if (value && (key === 'q' || value !== 'all')) params.set(key, value);
      else params.delete(key);
    }
    const query = params.toString();
    return query ? `?${query}` : '';
  }

  return { matchesPublication, countByTopic, readState, writeState };
});
