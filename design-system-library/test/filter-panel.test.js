/* ds-filter-panel — schema-driven filter side panel (sibling of criteria-filter).
   Covers structure (title / empty state / one section per group), escaping of the
   title, result-count, group label, empty-text and active-filter chips, the
   value/clear API, and teardown (the panel's docked markup is an in-place child —
   not portaled — and its four document/window listeners must all be released on
   disconnect, leaving no orphan node behind). */
import { fixture, html, expect, nextFrame } from '@open-wc/testing';
import { trackListeners } from './helpers/listeners.js';
import '../src/components/filter-panel/filter-panel.js';

const XSS = '"><img src=x onerror=alert(1)>';

const GROUPS = [
  { id: 'platform', label: 'Platform', type: 'checkbox',
    options: [{ label: 'Windows', value: 'win' }, { label: 'macOS', value: 'mac' }] },
  { id: 'status', label: 'Status', type: 'radio',
    options: [{ label: 'Active', value: 'a' }, { label: 'Retired', value: 'r' }] },
];

async function mk(groups = GROUPS) {
  const el = await fixture(html`<ds-filter-panel></ds-filter-panel>`);
  el.groups = groups;
  await nextFrame();
  return el;
}

describe('ds-filter-panel — structure', () => {
  it('renders the default "Filters" title and one section per group', async () => {
    const el = await mk();
    expect(el.querySelector('.ds-filter-panel__title').textContent).to.equal('Filters');
    expect(el.querySelectorAll('.ds-fp-group').length).to.equal(2);
    const labels = [...el.querySelectorAll('.ds-fp-group__label')].map((n) => n.textContent);
    expect(labels).to.deep.equal(['Platform', 'Status']);
  });

  it('shows the empty state when there are no groups', async () => {
    const el = await fixture(html`<ds-filter-panel></ds-filter-panel>`);
    await nextFrame();
    expect(el.querySelector('.ds-fp-empty')).to.exist;
    expect(el.querySelector('.ds-fp-empty').textContent).to.equal('No filters available.');
  });

  it('reflects a custom title and result-count in the header', async () => {
    const el = await fixture(html`<ds-filter-panel title="Refine" result-count="42"></ds-filter-panel>`);
    await nextFrame();
    expect(el.querySelector('.ds-filter-panel__title').textContent).to.equal('Refine');
    expect(el.querySelector('.ds-filter-panel__count').textContent).to.equal('42');
  });
});

describe('ds-filter-panel — escaping', () => {
  it('escapes the header title', async () => {
    const el = await fixture(html`<ds-filter-panel title="${XSS}"></ds-filter-panel>`);
    await nextFrame();
    const t = el.querySelector('.ds-filter-panel__title');
    expect(t.querySelector('img')).to.not.exist;
    expect(t.textContent).to.contain('<img');
  });

  it('escapes the result-count', async () => {
    const el = await fixture(html`<ds-filter-panel result-count="${XSS}"></ds-filter-panel>`);
    await nextFrame();
    const c = el.querySelector('.ds-filter-panel__count');
    expect(c.querySelector('img')).to.not.exist;
    expect(c.textContent).to.contain('<img');
  });

  it('escapes the empty-text', async () => {
    const el = await fixture(html`<ds-filter-panel empty-text="${XSS}"></ds-filter-panel>`);
    await nextFrame();
    const e = el.querySelector('.ds-fp-empty');
    expect(e.querySelector('img')).to.not.exist;
    expect(e.textContent).to.contain('<img');
  });

  it('escapes a group label', async () => {
    const el = await mk([{ id: 'g', label: XSS, type: 'checkbox', options: [] }]);
    const lab = el.querySelector('.ds-fp-group__label');
    expect(lab.querySelector('img')).to.not.exist;
    expect(lab.textContent).to.contain('<img');
  });

  it('escapes an active-filter chip label', async () => {
    const el = await mk([{ id: 'g', label: 'Grp', type: 'checkbox', options: [{ label: XSS, value: 'v1' }] }]);
    el.value = { g: ['v1'] };
    await nextFrame();
    const chip = el.querySelector('.ds-fp-chip');
    expect(chip, 'chip missing').to.exist;
    expect(chip.querySelector('img')).to.not.exist;
    expect(chip.textContent).to.contain('<img');
  });
});

describe('ds-filter-panel — value API', () => {
  it('round-trips the value through the getter / setter', async () => {
    const el = await mk();
    el.value = { platform: ['win'], status: 'a' };
    await nextFrame();
    expect(el.value).to.deep.equal({ platform: ['win'], status: 'a' });
  });

  it('renders a chip per active value', async () => {
    const el = await mk();
    el.value = { platform: ['win', 'mac'] };
    await nextFrame();
    expect(el.querySelectorAll('.ds-fp-chip').length).to.equal(2);
  });

  it('clear() empties the value, drops the chips, and emits ds-filter-panel-clear', async () => {
    const el = await mk();
    el.value = { platform: ['win'] };
    await nextFrame();
    let cleared = 0;
    el.addEventListener('ds-filter-panel-clear', () => (cleared += 1));
    el.clear();
    await nextFrame();
    expect(el.value).to.deep.equal({});
    expect(el.querySelectorAll('.ds-fp-chip').length).to.equal(0);
    expect(cleared).to.equal(1);
  });
});

describe('ds-filter-panel — teardown', () => {
  it('releases all document/window listeners on disconnect', async () => {
    const t = trackListeners();
    try {
      const el = await fixture(html`<ds-filter-panel></ds-filter-panel>`);
      await nextFrame();
      el.remove();
      expect(t.net(), `leaked: ${JSON.stringify(t.byType())}`).to.equal(0);
    } finally {
      t.restore();
    }
  });

  it('leaves no orphan panel node behind and does not throw', async () => {
    const el = await mk();
    expect(() => el.remove()).to.not.throw();
    expect(document.querySelector('.ds-filter-panel'), 'in-place panel not cleaned up').to.not.exist;
  });
});
