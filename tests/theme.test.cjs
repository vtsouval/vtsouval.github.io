const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');
const vm = require('node:vm');

const source = fs.readFileSync(path.join(__dirname, '../js/theme.js'), 'utf8');

function page({ saved = null, dark = false, blocked = false, legacyMedia = false, missingMeta = false } = {}) {
  const listeners = new Map();
  const events = target => ({
    addEventListener(type, handler) { listeners.set(`${target}:${type}`, handler); },
  });
  const element = (name, props = {}) => ({
    ...events(name), hidden: false, attributes: {},
    setAttribute(key, value) { this.attributes[key] = value; },
    getAttribute(key) { return this.attributes[key]; },
    toggleAttribute(key, force) {
      if (force) this.attributes[key] = '';
      else delete this.attributes[key];
    },
    focus() { document.activeElement = this; },
    ...props,
  });
  const label = element('label');
  const icons = ['auto', 'light', 'dark'].map(value => element(value, { dataset: { themeIcon: value } }));
  const radios = ['auto', 'light', 'dark'].map(value => element(`radio-${value}`, { value, name: 'theme', type: 'radio' }));
  const button = element('button', {
    hidden: true,
    querySelector: () => label,
    querySelectorAll: () => icons,
  });
  const menu = element('menu', {
    hidden: true,
    querySelector: () => radios.find(radio => radio.checked),
    querySelectorAll: () => radios,
    contains: target => target === menu || radios.includes(target),
  });
  const picker = element('picker', { contains: target => target === button || menu.contains(target) });
  button.closest = () => picker;
  const meta = element('meta');
  let hasMeta = !missingMeta;
  const document = {
    ...events('document'), readyState: 'loading', activeElement: null,
    documentElement: { dataset: {} },
    createElement: () => meta,
    head: { append(node) { assert.equal(node, meta); hasMeta = true; } },
    querySelector(selector) {
      if (selector === '#theme-toggle') return button;
      if (selector === '#theme-menu') return menu;
      if (selector === 'meta[name="theme-color"]') return hasMeta ? meta : null;
      throw new Error(`Unexpected query: ${selector}`);
    },
  };
  const media = { matches: dark };
  if (legacyMedia) media.addListener = handler => listeners.set('media:change', handler);
  else media.addEventListener = events('media').addEventListener;
  const storage = {
    getItem() { if (blocked) throw new Error('Storage unavailable'); return saved; },
    setItem(key, value) { if (blocked) throw new Error('Storage unavailable'); saved = value; },
    removeItem() { if (blocked) throw new Error('Storage unavailable'); saved = null; },
  };
  const window = { ...events('window'), localStorage: storage, matchMedia: () => media };
  const emit = (target, type, event = {}) => listeners.get(`${target}:${type}`)?.(event);
  vm.runInNewContext(source, { window, document, localStorage: storage });
  return {
    document, button, menu, label, icons, radios, meta, emit,
    get saved() { return saved; },
    ready() { emit('document', 'DOMContentLoaded'); },
    os(value) { media.matches = value; emit('media', 'change', { matches: value }); },
    choose(value) { emit('menu', 'change', { target: radios.find(radio => radio.value === value) }); },
  };
}

test('fresh and invalid preferences resolve before DOM ready and follow later OS changes', () => {
  for (const saved of [null, 'invalid', 'auto']) {
    const p = page({ saved, dark: true });
    assert.equal(p.document.documentElement.dataset.theme, 'dark');
    assert.equal(p.document.documentElement.dataset.themePreference, 'auto');
    assert.equal(p.meta.attributes.content, '#0e1216');
    p.os(false);
    assert.equal(p.document.documentElement.dataset.theme, 'light');
    assert.equal(p.meta.attributes.content, '#ffffff');
    p.ready();
    assert.equal(p.label.textContent, 'Auto');
    assert.equal(p.button.hidden, false);
    assert.deepEqual(p.icons.map(icon => 'hidden' in icon.attributes), [false, true, true]);
  }
});

test('retains explicit stored choices and Auto clears the override', () => {
  for (const saved of ['light', 'dark']) {
    const p = page({ saved, dark: saved === 'light' });
    assert.equal(p.document.documentElement.dataset.theme, saved);
    p.ready();
    p.os(false);
    p.os(true);
    assert.equal(p.document.documentElement.dataset.theme, saved);
    p.choose('auto');
    assert.equal(p.saved, null);
    assert.equal(p.document.documentElement.dataset.theme, 'dark');
    p.os(false);
    assert.equal(p.document.documentElement.dataset.theme, 'light');
    p.choose('dark');
    assert.equal(p.saved, 'dark');
    assert.equal(p.label.textContent, 'Dark');
    assert.deepEqual(p.icons.map(icon => 'hidden' in icon.attributes), [true, true, false]);
    assert.deepEqual(p.radios.map(radio => radio.checked), [false, false, true]);
  }
});

test('blocked storage and legacy media APIs still allow changes for this page', () => {
  const p = page({ blocked: true, legacyMedia: true });
  p.ready();
  p.choose('dark');
  assert.equal(p.document.documentElement.dataset.theme, 'dark');
  p.choose('auto');
  p.os(true);
  assert.equal(p.document.documentElement.dataset.theme, 'dark');
});

test('opening focuses the selected radio, Escape restores focus, and outside pointer closes', () => {
  const p = page();
  p.ready();
  p.emit('button', 'click');
  assert.equal(p.menu.hidden, false);
  assert.equal(p.button.attributes['aria-expanded'], 'true');
  assert.equal(p.document.activeElement, p.radios[0]);
  p.choose('light');
  assert.equal(p.menu.hidden, false, 'keep native radio keyboard navigation available');
  p.emit('document', 'keydown', { key: 'Escape', preventDefault() {} });
  assert.equal(p.menu.hidden, true);
  assert.equal(p.document.activeElement, p.button);
  p.emit('button', 'click');
  p.emit('document', 'pointerdown', { target: {} });
  assert.equal(p.menu.hidden, true);
  assert.equal(p.button.attributes['aria-expanded'], 'false');
});

test('storage changes from another page and storage clear synchronize the visible selection', () => {
  const p = page();
  p.ready();
  p.emit('window', 'storage', { key: 'site-theme', newValue: 'dark' });
  assert.equal(p.document.documentElement.dataset.theme, 'dark');
  assert.equal(p.label.textContent, 'Dark');
  p.emit('window', 'storage', { key: 'unrelated', newValue: 'light' });
  assert.equal(p.document.documentElement.dataset.theme, 'dark');
  p.emit('window', 'storage', { key: null, newValue: null });
  assert.equal(p.label.textContent, 'Auto');
  assert.equal(p.document.documentElement.dataset.theme, 'light');
});

test('radio label focus transitions stay open; moving focus outside closes without stealing it', () => {
  const p = page();
  p.ready();
  p.emit('button', 'click');
  p.document.activeElement = null;
  p.emit('picker', 'focusout', { relatedTarget: null });
  assert.equal(p.menu.hidden, false, 'label activation may temporarily leave focus unset');
  p.document.activeElement = p.radios[1];
  p.emit('picker', 'focusout', { relatedTarget: p.radios[1] });
  assert.equal(p.menu.hidden, false);
  const outside = {};
  p.document.activeElement = outside;
  p.emit('picker', 'focusout', { relatedTarget: outside });
  assert.equal(p.menu.hidden, true);
  assert.equal(p.document.activeElement, outside);
});

test('creates missing browser theme metadata before DOM ready', () => {
  const p = page({ missingMeta: true, dark: true });
  assert.equal(p.meta.name, 'theme-color');
  assert.equal(p.meta.attributes.content, '#0e1216');
});
