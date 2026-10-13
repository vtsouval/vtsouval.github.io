const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const source = fs.readFileSync(require('node:path').join(__dirname, '../js/layout.js'), 'utf8');

function fixture({ observer = true, header = true } = {}) {
  let height = 67;
  const properties = new Map();
  const events = new Map();
  let resized;
  const element = { getBoundingClientRect: () => ({ height }) };
  const context = {
    document: {
      querySelector: () => header ? element : null,
      documentElement: { style: { setProperty: (key, value) => properties.set(key, value) } },
      fonts: { ready: Promise.resolve() }
    },
    window: { addEventListener: (name, callback) => events.set(name, callback) }
  };
  if (observer) context.ResizeObserver = class {
    constructor(callback) { resized = callback; }
    observe(target) { assert.equal(target, element); }
  };
  vm.runInNewContext(source, context);
  return { properties, events, resize: () => resized(), setHeight: value => { height = value; } };
}

test('anchor clearance follows navigation wrapping and fractional heights', () => {
  const page = fixture();
  assert.equal(page.properties.get('--header-height'), '67px');
  page.setHeight(104.25);
  page.resize();
  assert.equal(page.properties.get('--header-height'), '105px');
  page.setHeight(0);
  page.resize();
  assert.equal(page.properties.get('--header-height'), '105px');
});

test('font loading and restored pages refresh clearance without ResizeObserver', async () => {
  const page = fixture({ observer: false });
  page.setHeight(112);
  await Promise.resolve();
  assert.equal(page.properties.get('--header-height'), '112px');
  page.setHeight(66);
  page.events.get('resize')();
  assert.equal(page.properties.get('--header-height'), '66px');
  page.setHeight(105);
  page.events.get('pageshow')();
  assert.equal(page.properties.get('--header-height'), '105px');
});

test('pages without the shared header need no layout listeners', () => {
  const page = fixture({ header: false });
  assert.equal(page.properties.size, 0);
  assert.equal(page.events.size, 0);
});
