/* ds-dual-list — two-panel shuttle/transfer. Covers one row per item, the
   {available,selected} data round-trip, row a11y (role=option), transfer moving
   items + firing ds-dual-list-change, locked items being non-draggable, search
   filtering, label escaping, and teardown. */
import { fixture, html, expect, nextFrame, oneEvent } from '@open-wc/testing';
import '../src/components/dual-list/dual-list.js';

const rows = (el, side) =>
  el.querySelectorAll(`.ds-dual-list__panel[data-side="${side}"] .ds-dual-list__row`);
const firstCheckbox = (el, side) =>
  el.querySelector(`.ds-dual-list__panel[data-side="${side}"] ds-checkbox`);

describe('ds-dual-list — data & structure', () => {
  it('renders one row per item in each panel', async () => {
    const el = await fixture(html`<ds-dual-list></ds-dual-list>`);
    el.items = {
      available: [{ id: 'a', label: 'Apple' }, { id: 'b', label: 'Banana' }],
      selected: [{ id: 'c', label: 'Cherry' }],
    };
    await nextFrame();
    expect(rows(el, 'available').length).to.equal(2);
    expect(rows(el, 'selected').length).to.equal(1);
  });

  it('round-trips the items property as id lists', async () => {
    const el = await fixture(html`<ds-dual-list></ds-dual-list>`);
    el.items = {
      available: [{ id: 'a', label: 'Apple' }, { id: 'b', label: 'Banana' }],
      selected: [],
    };
    await nextFrame();
    expect(el.items).to.deep.equal({ available: ['a', 'b'], selected: [] });
  });

  it('gives each row role=option', async () => {
    const el = await fixture(html`<ds-dual-list></ds-dual-list>`);
    el.items = { available: [{ id: 'a', label: 'Apple' }], selected: [] };
    await nextFrame();
    expect(rows(el, 'available')[0].getAttribute('role')).to.equal('option');
  });

  it('shows the item count in each panel title', async () => {
    const el = await fixture(html`<ds-dual-list></ds-dual-list>`);
    el.items = { available: [{ id: 'a', label: 'Apple' }, { id: 'b', label: 'B' }], selected: [] };
    await nextFrame();
    const title = el.querySelector('.ds-dual-list__panel[data-side="available"] .ds-dual-list__title');
    expect(title.textContent).to.contain('(2)');
  });
});

describe('ds-dual-list — transfer', () => {
  it('moves a checked item to Selected and fires ds-dual-list-change', async () => {
    const el = await fixture(html`<ds-dual-list></ds-dual-list>`);
    el.items = {
      available: [{ id: 'a', label: 'Apple' }, { id: 'b', label: 'Banana' }],
      selected: [],
    };
    await nextFrame();
    firstCheckbox(el, 'available').click();       // checks item 'a' (sync)
    setTimeout(() => el.querySelector('[data-action="right"]').click());
    const ev = await oneEvent(el, 'ds-dual-list-change');
    expect(ev.detail.selected).to.include('a');
    expect(ev.detail.available).to.not.include('a');
    expect(el.items).to.deep.equal({ available: ['b'], selected: ['a'] });
  });
});

describe('ds-dual-list — locked items', () => {
  it('renders locked selected items as non-draggable with a locked class', async () => {
    const el = await fixture(html`<ds-dual-list></ds-dual-list>`);
    el.items = { available: [], selected: [{ id: 's1', label: 'Pinned', locked: true }] };
    await nextFrame();
    const row = rows(el, 'selected')[0];
    expect(row.classList.contains('ds-dual-list__row--locked')).to.be.true;
    expect(row.draggable).to.be.false;
  });
});

describe('ds-dual-list — search', () => {
  it('filters the visible rows by label', async () => {
    const el = await fixture(html`<ds-dual-list searchable></ds-dual-list>`);
    el.items = {
      available: [{ id: 'a', label: 'Apple' }, { id: 'b', label: 'Banana' }],
      selected: [],
    };
    await nextFrame();
    const search = el.querySelector('.ds-dual-list__panel[data-side="available"] ds-search-field');
    search.dispatchEvent(new CustomEvent('ds-search-field-input', {
      detail: { value: 'Ban' }, bubbles: true,
    }));
    await nextFrame();
    expect(rows(el, 'available').length).to.equal(1);
    expect(rows(el, 'available')[0].querySelector('.ds-checkbox__label').textContent).to.equal('Banana');
  });
});

describe('ds-dual-list — escaping & teardown', () => {
  it('renders a hostile item label as literal text (no injected <img>)', async () => {
    const el = await fixture(html`<ds-dual-list></ds-dual-list>`);
    el.items = { available: [{ id: 'x', label: '"><img src=x onerror=alert(1)>' }], selected: [] };
    await nextFrame();
    const row = rows(el, 'available')[0];
    expect(row.querySelector('img')).to.not.exist;
    expect(row.querySelector('.ds-checkbox__label').textContent).to.contain('<img');
  });

  it('disconnects without throwing', async () => {
    const el = await fixture(html`<ds-dual-list></ds-dual-list>`);
    el.items = { available: [{ id: 'a', label: 'Apple' }], selected: [] };
    await nextFrame();
    expect(() => el.remove()).to.not.throw();
  });
});
