'use strict';
const filters = document.querySelector('.filters');
if (filters) {
  const publications = [...document.querySelectorAll('.publication')];
  const count = document.querySelector('#publication-count');
  function filterPublications(topic) {
    let visible = 0;
    for (const publication of publications) {
      const matches = topic === 'all' || publication.dataset.topics.split(' ').includes(topic);
      publication.hidden = !matches;
      if (matches) visible++;
    }
    for (const button of filters.querySelectorAll('button')) {
      button.setAttribute('aria-pressed', String(button.dataset.filter === topic));
    }
    count.textContent = `${visible} research works · Related versions grouped together`;
  }
  filters.addEventListener('click', event => {
    const button = event.target.closest('button[data-filter]');
    if (button) filterPublications(button.dataset.filter);
  });
  filterPublications('all');
  filters.hidden = false;
}
