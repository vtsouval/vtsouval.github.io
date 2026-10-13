/* A manually controlled, swipeable strip. All links remain available without JS. */
(() => {
  const track = document.querySelector('#research-track');
  const previous = document.querySelector('#research-prev');
  const next = document.querySelector('#research-next');
  const position = document.querySelector('#research-position');
  const controls = document.querySelector('.research-controls');
  if (!track || !previous || !next || !position || !controls) return;
  const cards = [...track.querySelectorAll('.research-card')];
  if (!cards.length) return;
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  function update() {
    const viewport = track.getBoundingClientRect();
    const visible = cards.map((card, index) => ({ rect: card.getBoundingClientRect(), index }))
      .filter(({ rect }) => Math.min(rect.right, viewport.right) - Math.max(rect.left, viewport.left) > rect.width / 2);
    const first = (visible[0]?.index ?? 0) + 1;
    const last = (visible.at(-1)?.index ?? 0) + 1;
    const label = first === last ? `${first} / ${cards.length}` : `${first}–${last} / ${cards.length}`;
    if (position.textContent !== label) position.textContent = label;
    previous.disabled = track.scrollLeft <= 2;
    next.disabled = track.scrollLeft >= track.scrollWidth - track.clientWidth - 2;
    controls.hidden = track.scrollWidth <= track.clientWidth + 2;
  }
  function move(direction) {
    const step = cards[1] ? cards[1].offsetLeft - cards[0].offsetLeft : cards[0].offsetWidth;
    track.scrollBy({ left: direction * step, behavior: reducedMotion.matches ? 'instant' : 'smooth' });
  }
  previous.addEventListener('click', () => move(-1));
  next.addEventListener('click', () => move(1));
  let frame;
  track.addEventListener('scroll', () => {
    cancelAnimationFrame(frame);
    frame = requestAnimationFrame(update);
  }, { passive: true });
  window.addEventListener('resize', update);
  if (window.ResizeObserver) new ResizeObserver(update).observe(track);
  document.fonts?.ready.then(update);
  update();
})();
