const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');
const vm = require('node:vm');
const source = fs.readFileSync(path.join(__dirname, '../js/theme.js'), 'utf8');
function page({ saved = null, dark = false, blocked = false, legacyMedia = false, missingMeta = false } = {}) {
  const listeners = new Map();
  const events = target => ({ addEventListener(type, handler) { listeners.set(`${target}:${type}`, handler); } });
  const element = (name, props = {}) => ({
    ...events(name), hidden: false, attributes: {},
    setAttribute(key, value) { this.attributes[key] = value; },
    toggleAttribute(key, force) { if (force) this.attributes[key] = ''; else delete this.attributes[key]; },
    ...props,
  });
  const icons = ['auto', 'light', 'dark'].map(value => element(value, { dataset: { themeIcon: value } }));
  const button = element('button', { hidden: true, querySelectorAll: () => icons });
  const meta = element('meta');
  let hasMeta = !missingMeta;
  const document = {
    ...events('document'), readyState: 'loading', documentElement: { dataset: {} },
    createElement: () => meta,
    head: { append(node) { assert.equal(node, meta); hasMeta = true; } },
    querySelector(selector) {
      if (selector === '#theme-toggle') return button;
      if (selector === '#theme-menu') return null;
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
  vm.runInNewContext(source, { window, document });
  return { document, button, icons, meta, emit, get saved() { return saved; },
    ready() { emit('document', 'DOMContentLoaded'); }, click() { emit('button', 'click'); },
    os(value) { media.matches = value; emit('media', 'change', { matches: value }); } };
}
test('system theme resolves before paint and follows later OS changes', () => {
  for (const saved of [null, 'invalid', 'auto']) {
    const p = page({ saved, dark: true });
    assert.equal(p.document.documentElement.dataset.theme, 'dark');
    assert.equal(p.meta.attributes.content, '#0e1216');
    p.ready();
    assert.equal(p.button.hidden, false);
    assert.match(p.button.attributes['aria-label'], /System.*Dark.*Light/i);
    assert.deepEqual(p.icons.map(icon => 'hidden' in icon.attributes), [false, true, true]);
    p.os(false);
    assert.equal(p.document.documentElement.dataset.theme, 'light');
  }
});
test('one click cycles System to Light to Dark to System, restoring OS following', () => {
  const p = page({ dark: true }); p.ready();
  for (const [preference, resolved, saved, icon] of [['light','light','light',1], ['dark','dark','dark',2], ['auto','dark',null,0]]) {
    p.click();
    assert.equal(p.document.documentElement.dataset.themePreference, preference);
    assert.equal(p.document.documentElement.dataset.theme, resolved);
    assert.equal(p.saved, saved);
    assert.equal(p.icons.filter(i => !('hidden' in i.attributes)).length, 1);
    assert.equal('hidden' in p.icons[icon].attributes, false);
  }
  p.os(false); assert.equal(p.document.documentElement.dataset.theme, 'light');
});
test('explicit preferences persist across page loads and ignore OS changes', () => {
  for (const saved of ['light', 'dark']) {
    const p = page({ saved }); p.ready(); p.os(true); p.os(false);
    assert.equal(p.document.documentElement.dataset.theme, saved);
    assert.match(p.button.attributes['aria-label'], new RegExp(saved, 'i'));
  }
});
test('blocked storage and legacy media APIs still allow cycling', () => {
  const p = page({ blocked: true, legacyMedia: true }); p.ready();
  p.click(); p.click(); assert.equal(p.document.documentElement.dataset.theme, 'dark');
  p.click(); p.os(false); assert.equal(p.document.documentElement.dataset.theme, 'light');
});
test('other-page changes update both the palette and current icon', () => {
  const p = page(); p.ready();
  p.emit('window','storage',{ key:'site-theme', newValue:'dark' });
  assert.equal(p.document.documentElement.dataset.theme, 'dark');
  assert.deepEqual(p.icons.map(icon => 'hidden' in icon.attributes), [true,true,false]);
  p.emit('window','storage',{ key:'unrelated', newValue:'light' });
  assert.equal(p.document.documentElement.dataset.theme, 'dark');
  p.emit('window','storage',{ key:null, newValue:null });
  assert.equal(p.document.documentElement.dataset.themePreference, 'auto');
});
test('missing theme metadata is created before DOM ready', () => {
  const p = page({ missingMeta:true, dark:true });
  assert.equal(p.meta.name, 'theme-color');
  assert.equal(p.meta.attributes.content, '#0e1216');
});
