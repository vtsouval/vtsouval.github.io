const test = require('node:test');
const assert = require('node:assert/strict');
const vm = require('node:vm');
const fs = require('node:fs');
const path = require('node:path');
function fixture() {
  let selection = false;
  const cards = Array.from({ length:3 }, () => {
    const listeners = {};
    const details = { open:false, addEventListener: (name, callback) => { listeners[name] = callback; } };
    return { details, listeners, querySelector: () => details, addEventListener: (name, callback) => { listeners[name] = callback; } };
  });
  vm.runInNewContext(fs.readFileSync(path.join(__dirname,'../js/publication-cards.js'),'utf8'), {
    document: { querySelectorAll: () => cards },
    window: { getSelection: () => ({ isCollapsed:!selection }) },
  });
  return { cards, select(value) { selection = value; },
    click(index, kind = 'body') {
      const target = { closest(selector) {
        if (kind === 'summary' && selector === 'summary') return {};
        if (kind === 'link' && selector.includes('a,')) return {};
        return null;
      } };
      cards[index].listeners.click({ target, button:0, defaultPrevented:false });
      if (kind === 'summary') { cards[index].details.open = !cards[index].details.open; cards[index].listeners.toggle(); }
    } };
}
test('clicking the publication body opens it, closes its sibling, and toggles it closed', () => {
  const p = fixture(); p.click(0); assert.equal(p.cards[0].details.open, true);
  p.click(1); assert.deepEqual(p.cards.map(c => c.details.open), [false,true,false]);
  p.click(1); assert.deepEqual(p.cards.map(c => c.details.open), [false,false,false]);
});
test('native summary keyboard activation is kept and has the same exclusivity', () => {
  const p = fixture(); p.click(0); p.click(2,'summary');
  assert.deepEqual(p.cards.map(c => c.details.open), [false,false,true]);
  p.click(2,'summary'); assert.equal(p.cards[2].details.open, false);
});
test('resource and author links do not toggle a publication', () => {
  const p = fixture(); p.click(0); p.click(1,'link'); p.click(0,'link');
  assert.deepEqual(p.cards.map(c => c.details.open), [true,false,false]);
});
test('selecting abstract text does not collapse the tile', () => {
  const p = fixture(); p.click(0); p.select(true); p.click(0);
  assert.equal(p.cards[0].details.open, true);
});
