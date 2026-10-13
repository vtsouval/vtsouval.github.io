const assert = require('node:assert/strict');
const test = require('node:test');
const { matchesPublication, countByTopic, readState, writeState } = require('../js/publication-search.js');

const papers = [
  {
    search: 'DeltaMask: Vision Foundation Models V. Tsouvalas Y. M. Asano IEEE BigData 2024 federated foundation efficient probabilistic masking Fine-Tuning communication budgets Related version: Federated Fine-Tuning via Probabilistic Masking FM-Wild ICML',
    topics: ['federated', 'foundation', 'efficient'],
    year: '2024',
  },
  {
    search: 'Café: Speech Recognition A. García 2025 ICASSP supervision audio learning robust representations for noisy environments',
    topics: ['supervision'],
    year: '2025',
  },
];

test('matches every query term regardless of case, accents, punctuation, or order', () => {
  assert.equal(matchesPublication(papers[1], { query: 'GARCIA, café! speech' }), true);
  assert.equal(matchesPublication(papers[1], { query: 'cafe nonexistent' }), false);
  assert.equal(matchesPublication(papers[1], { query: '  ' }), true);
});

test('treats hyphenated and spaced fine tuning alike', () => {
  assert.equal(matchesPublication(papers[0], { query: 'fine tuning' }), true);
  assert.equal(matchesPublication(papers[0], { query: 'fine-tuning' }), true);
  assert.equal(matchesPublication(papers[0], { query: 'fine–tuning' }), true);
});

test('finds metadata, keywords, summary text, and related versions', () => {
  for (const query of ['Asano', 'IEEE 2024', 'probabilistic masking', 'communication budgets', 'FM-Wild ICML']) {
    assert.equal(matchesPublication(papers[0], { query }), true, query);
  }
});

test('combines text, topic, and year without changing publication order', () => {
  const state = { query: 'learning', topic: 'supervision', year: '2025' };
  assert.deepEqual(papers.filter(paper => matchesPublication(paper, state)), [papers[1]]);
  assert.equal(matchesPublication(papers[1], { ...state, year: '2024' }), false);
  assert.equal(matchesPublication(papers[1], { ...state, topic: 'federated' }), false);
  assert.equal(matchesPublication(papers[1], { ...state, query: 'vision' }), false);
  assert.deepEqual(papers.filter(paper => matchesPublication(paper, {})), papers);
});

test('an unmatched multiword search returns no publications', () => {
  assert.deepEqual(papers.filter(paper => matchesPublication(paper, { query: 'quantum computing' })), []);
});

test('topic counts include overlapping topics and ignore the selected topic', () => {
  const topics = ['all', 'federated', 'foundation', 'efficient', 'supervision'];
  assert.deepEqual(countByTopic(papers, { query: '', year: 'all', topic: 'foundation' }, topics), {
    all: 2, federated: 1, foundation: 1, efficient: 1, supervision: 1,
  });
});

test('topic counts stay conditioned on both the query and year', () => {
  const topics = ['all', 'foundation', 'supervision'];
  assert.deepEqual(countByTopic(papers, { query: 'speech', year: '2025', topic: 'foundation' }, topics), {
    all: 1, foundation: 0, supervision: 1,
  });
  assert.deepEqual(countByTopic(papers, { query: 'speech', year: '2024', topic: 'all' }, topics), {
    all: 0, foundation: 0, supervision: 0,
  });
});

test('restores valid shared filters and ignores unknown topic and year values', () => {
  const options = { topics: ['all', 'foundation', 'supervision'], years: ['all', '2024', '2025'] };
  assert.deepEqual(readState('?q=fine+tuning&topic=foundation&year=2024', options), {
    query: 'fine tuning', topic: 'foundation', year: '2024',
  });
  assert.deepEqual(readState('?q=speech&topic=unknown&year=1900', options), {
    query: 'speech', topic: 'all', year: 'all',
  });
});

test('syncs only publication state and removes cleared filters', () => {
  assert.equal(writeState('?ref=profile', { query: 'fine tuning', topic: 'foundation', year: '2024' }),
    '?ref=profile&q=fine+tuning&topic=foundation&year=2024');
  assert.equal(writeState('?ref=profile&q=old&topic=foundation&year=2024', { query: '', topic: 'all', year: 'all' }),
    '?ref=profile');
  assert.equal(writeState('?q=old', { query: '', topic: 'all', year: 'all' }), '');
});

test('preserves a literal search for all in a shared URL', () => {
  assert.equal(writeState('', { query: 'all', topic: 'all', year: 'all' }), '?q=all');
});
