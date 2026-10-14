const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const test = require('node:test');
const source = fs.readFileSync(require('node:path').join(__dirname, '../js/contact.js'), 'utf8');

function page({ reduced = false } = {}) {
  const timers = new Map();
  let timerID = 0;
  const node = () => {
    const handlers = {};
    const classes = new Set();
    return {
      attributes: {}, isConnected: true,
      classList: { add: v => classes.add(v), remove: v => classes.delete(v), contains: v => classes.has(v) },
      addEventListener(type, fn) { (handlers[type] ||= []).push(fn); },
      emit(type, extra = {}) {
        const event = { target: this, preventDefault() { this.defaultPrevented = true; }, ...extra };
        for (const fn of handlers[type] || []) fn(event);
        return event;
      },
      setAttribute(k, v) { this.attributes[k] = v; },
      focus() { document.activeElement = this; },
    };
  };
  const close = node(), dialog = node(), trigger = node(), root = node();
  let button;
  trigger.textContent = 'Contact';
  trigger.replaceWith = n => { button = n; };
  Object.assign(dialog, {
    id: 'contact-dialog', open: false,
    showModal() { this.open = true; },
    close() { this.open = false; this.emit('close'); },
    querySelector: () => close,
    getBoundingClientRect: () => ({ left: 20, right: 400, top: 60, bottom: 260 }),
  });
  const document = {
    documentElement: root, activeElement: trigger,
    getElementById: () => dialog,
    querySelectorAll: () => [trigger],
    querySelector: () => button,
    createElement: node,
  };
  const window = { matchMedia: () => ({ matches: reduced }), addEventListener() {} };
  const setTimeout = fn => { timers.set(++timerID, fn); return timerID; };
  const clearTimeout = id => timers.delete(id);
  vm.runInNewContext(source, { document, window, location: { hash: '' }, setTimeout, clearTimeout });
  return { dialog, button, close, root, document,
    finishAnimation() { dialog.emit('animationend', { animationName: 'contact-exit' }); },
    timeout() { for (const [id, fn] of timers) { timers.delete(id); fn(); } },
  };
}

test('close waits for the upward animation, then restores focus and scroll', () => {
  const p = page();
  p.button.emit('click');
  assert.equal(p.dialog.open, true);
  assert.equal(p.button.attributes['aria-expanded'], 'true');
  p.close.emit('click');
  assert.equal(p.dialog.open, true);
  assert.equal(p.dialog.classList.contains('is-closing'), true);
  p.finishAnimation();
  assert.equal(p.dialog.open, false);
  assert.equal(p.root.classList.contains('contact-open'), false);
  assert.equal(p.document.activeElement, p.button);
  assert.equal(p.button.attributes['aria-expanded'], 'false');
});

test('Escape follows the same exit path and cannot leave the page locked', () => {
  const p = page(); p.button.emit('click');
  assert.equal(p.dialog.emit('cancel').defaultPrevented, true);
  assert.equal(p.dialog.open, true);
  p.timeout();
  assert.equal(p.dialog.open, false);
  assert.equal(p.root.classList.contains('contact-open'), false);
});

test('reduced motion closes immediately', () => {
  const p = page({ reduced: true }); p.button.emit('click'); p.close.emit('click');
  assert.equal(p.dialog.open, false);
  assert.equal(p.document.activeElement, p.button);
});

test('backdrop clicks close but drags from inside the panel do not', () => {
  const p = page(); p.button.emit('click');
  p.dialog.emit('pointerdown', { button: 0, pointerId: 1, clientX: 40, clientY: 100 });
  p.dialog.emit('pointerup', { pointerId: 1, clientX: 500, clientY: 100 });
  assert.equal(p.dialog.classList.contains('is-closing'), false);
  p.dialog.emit('pointerdown', { button: 0, pointerId: 2, clientX: 500, clientY: 100 });
  p.dialog.emit('pointerup', { pointerId: 2, clientX: 500, clientY: 100 });
  assert.equal(p.dialog.classList.contains('is-closing'), true);
  p.finishAnimation();
  assert.equal(p.dialog.open, false);
});
