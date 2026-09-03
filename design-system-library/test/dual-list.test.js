/* ds-dual-list — two-panel shuttle / transfer / pick-list. Covers structure and
   listbox roles, one row per item in both panels, the {available,selected} data
   round-trip, transfer via the buttons + move-all firing ds-dual-list-change,
   roving-tabindex keyboard navigation (Arrow/Home/End) + Enter/Space activation,
   readonly / loading / error states, axe a11y, the repaint-split (a visual-only
   attribute patches chrome in place and keeps row node identity), locked items,
   search filtering, label escaping, and teardown. */
import { fixture, html, expect, nextFrame, oneEvent } from '@open-wc/testing';
import '../src/components/dual-list/dual-list.js';

const panel = (el, side) => el.querySelector(`.ds-dual-list__panel[data-side="${side}"]`);
const list = (el, side) => panel(el, side).querySelector('.ds-dual-list__list');
const rows = (el, side) =>
  el.querySelectorAll(`.ds-dual-list__panel[data-side="${side}"] .ds-dual-list__row`);
const firstCheckbox = (el, side) =>
  el.querySelector(`.ds-dual-list__panel[data-side="${side}"] ds-checkbox`);
const ctrl = (el, action) => el.querySelector(`[data-action="${action}"]`);
const withItems = async (a = [], s = []) => {
  const el = await fixture(html`<ds-dual-list></ds-dual-list>`);
  el.items = { available: a, selected: s };
  await nextFrame();
  return el;
};

describe('ds-dual-list — structure & roles', () => {
  it('builds two labelled panels with a transfer-control column between them', async () => {
    const el = await withItems();
    expect(panel(el, 'available'), 'available panel').to.exist;
    expect(panel(el, 'selected'), 'selected panel').to.exist;
    expect(el.querySelector('.ds-dual-list__controls'), 'controls column').to.exist;
    expect(panel(el, 'available').getAttribute('role')).to.equal('group');
  });

  it('marks each list as a multiselectable listbox named by its panel title', async () => {
    const el = await withItems([{ id: 'a', label: 'Apple' }]);
    const lb = list(el, 'available');
    expect(lb.getAttribute('role')).to.equal('listbox');
    expect(lb.getAttribute('aria-multiselectable')).to.equal('true');
    const titleId = lb.getAttribute('aria-labelledby');
    expect(titleId, 'labelled by the panel title').to.be.ok;
    expect(el.querySelector(`#${titleId}`).classList.contains('ds-dual-list__title')).to.be.true;
  });

  it('gives each row role=option with aria-selected reflecting its checked state', async () => {
    const el = await withItems([{ id: 'a', label: 'Apple' }]);
    const row = rows(el, 'available')[0];
    expect(row.getAttribute('role')).to.equal('option');
    expect(row.getAttribute('aria-selected')).to.equal('false');
  });
});

describe('ds-dual-list — options rendering', () => {
  it('renders one row per item in each panel', async () => {
    const el = await withItems(
      [{ id: 'a', label: 'Apple' }, { id: 'b', label: 'Banana' }],
      [{ id: 'c', label: 'Cherry' }],
    );
    expect(rows(el, 'available').length).to.equal(2);
    expect(rows(el, 'selected').length).to.equal(1);
  });

  it('round-trips the items property as id lists', async () => {
    const el = await withItems([{ id: 'a', label: 'Apple' }, { id: 'b', label: 'Banana' }], []);
    expect(el.items).to.deep.equal({ available: ['a', 'b'], selected: [] });
  });

  it('shows the item count in each panel title', async () => {
    const el = await withItems([{ id: 'a', label: 'A' }, { id: 'b', label: 'B' }], []);
    const title = panel(el, 'available').querySelector('.ds-dual-list__title');
    expect(title.textContent).to.contain('(2)');
  });

  it('shows a contextual empty message per side when there are no items', async () => {
    const el = await withItems([], []);
    expect(list(el, 'available').querySelector('.ds-dual-list__empty').textContent).to.equal('No items');
    expect(list(el, 'selected').querySelector('.ds-dual-list__empty').textContent).to.equal('Nothing selected yet');
  });

  it('groups rows under presentation headers when grouped', async () => {
    const el = await fixture(html`<ds-dual-list grouped></ds-dual-list>`);
    el.items = {
      available: [{ id: 'a', label: 'Apple', group: 'Fruit' }, { id: 'c', label: 'Carrot', group: 'Veg' }],
      selected: [],
    };
    await nextFrame();
    const groups = list(el, 'available').querySelectorAll('.ds-dual-list__group');
    expect(groups.length).to.equal(2);
    expect(groups[0].getAttribute('role')).to.equal('presentation');
    expect([...groups].map((g) => g.textContent)).to.deep.equal(['Fruit', 'Veg']);
  });
});

describe('ds-dual-list — transfer', () => {
  it('moves a checked item to Selected and fires ds-dual-list-change', async () => {
    const el = await withItems([{ id: 'a', label: 'Apple' }, { id: 'b', label: 'Banana' }], []);
    firstCheckbox(el, 'available').click();       // checks item 'a' (sync)
    setTimeout(() => ctrl(el, 'right').click());
    const ev = await oneEvent(el, 'ds-dual-list-change');
    expect(ev.detail.selected).to.include('a');
    expect(ev.detail.available).to.not.include('a');
    expect(el.items).to.deep.equal({ available: ['b'], selected: ['a'] });
  });

  it('move-all sends every available item across at once', async () => {
    const el = await fixture(html`<ds-dual-list move-all></ds-dual-list>`);
    el.items = { available: [{ id: 'a', label: 'A' }, { id: 'b', label: 'B' }], selected: [] };
    await nextFrame();
    const allRight = ctrl(el, 'all-right');
    expect(allRight.hidden, 'move-all button is visible').to.be.false;
    setTimeout(() => allRight.click());
    const ev = await oneEvent(el, 'ds-dual-list-change');
    expect(ev.detail.available).to.deep.equal([]);
    expect(ev.detail.selected).to.have.members(['a', 'b']);
  });

  it('disables the single-move button until something is checked', async () => {
    const el = await withItems([{ id: 'a', label: 'A' }], []);
    expect(ctrl(el, 'right').hasAttribute('disabled')).to.be.true;
    firstCheckbox(el, 'available').click();
    await nextFrame();
    expect(ctrl(el, 'right').hasAttribute('disabled')).to.be.false;
  });
});

describe('ds-dual-list — keyboard (roving tabindex + activation)', () => {
  const press = (node, key) => node.dispatchEvent(new KeyboardEvent('keydown', { key, bubbles: true }));

  it('seeds exactly one tabbable row per list (roving tabindex)', async () => {
    const el = await withItems([{ id: 'a', label: 'A' }, { id: 'b', label: 'B' }], [{ id: 'c', label: 'C' }]);
    const avail = [...rows(el, 'available')];
    expect(avail.map((r) => r.tabIndex)).to.deep.equal([0, -1]);
    expect(rows(el, 'selected')[0].tabIndex).to.equal(0);
  });

  it('hides the nested checkbox input so the option is the only focus stop', async () => {
    const el = await withItems([{ id: 'a', label: 'A' }], []);
    expect(rows(el, 'available')[0].querySelector('.ds-checkbox__input').hidden).to.be.true;
  });

  it('ArrowDown / ArrowUp move the roving focus within a list', async () => {
    const el = await withItems([{ id: 'a', label: 'A' }, { id: 'b', label: 'B' }, { id: 'c', label: 'C' }], []);
    const r = [...rows(el, 'available')];
    r[0].focus();
    press(r[0], 'ArrowDown');
    expect(document.activeElement).to.equal(r[1]);
    expect(r[1].tabIndex).to.equal(0);
    expect(r[0].tabIndex).to.equal(-1);
    press(r[1], 'ArrowUp');
    expect(document.activeElement).to.equal(r[0]);
  });

  it('Home / End jump to the first / last row', async () => {
    const el = await withItems([{ id: 'a', label: 'A' }, { id: 'b', label: 'B' }, { id: 'c', label: 'C' }], []);
    const r = [...rows(el, 'available')];
    r[0].focus();
    press(r[0], 'End');
    expect(document.activeElement).to.equal(r[2]);
    press(r[2], 'Home');
    expect(document.activeElement).to.equal(r[0]);
  });

  it('does not move past the ends (no wrap)', async () => {
    const el = await withItems([{ id: 'a', label: 'A' }, { id: 'b', label: 'B' }], []);
    const r = [...rows(el, 'available')];
    r[0].focus();
    press(r[0], 'ArrowUp');
    expect(document.activeElement).to.equal(r[0]);
  });

  it('Enter toggles the focused option (aria-selected + checkbox)', async () => {
    const el = await withItems([{ id: 'a', label: 'A' }], []);
    const row = rows(el, 'available')[0];
    row.focus();
    press(row, 'Enter');
    await nextFrame();
    expect(row.getAttribute('aria-selected')).to.equal('true');
    expect(row.querySelector('ds-checkbox').hasAttribute('checked')).to.be.true;
  });

  it('Space toggles selection back off', async () => {
    const el = await withItems([{ id: 'a', label: 'A' }], []);
    const row = rows(el, 'available')[0];
    row.focus();
    press(row, ' ');
    await nextFrame();
    expect(row.getAttribute('aria-selected')).to.equal('true');
    press(row, ' ');
    await nextFrame();
    expect(row.getAttribute('aria-selected')).to.equal('false');
  });
});

describe('ds-dual-list — states', () => {
  it('loading: adds the loading class, shows skeletons, disables search', async () => {
    const el = await withItems([{ id: 'a', label: 'A' }], []);
    el.setAttribute('loading', '');
    await nextFrame();
    expect(el.classList.contains('ds-dual-list--loading')).to.be.true;
    expect(list(el, 'available').querySelectorAll('.ds-dual-list__skeleton').length).to.be.greaterThan(0);
    expect(rows(el, 'available').length, 'rows replaced by skeletons').to.equal(0);
    expect(panel(el, 'available').querySelector('ds-search-field').hasAttribute('disabled')).to.be.true;
  });

  it('readonly: hides the controls + search and disables every checkbox', async () => {
    const el = await fixture(html`<ds-dual-list searchable readonly></ds-dual-list>`);
    el.items = { available: [{ id: 'a', label: 'A' }], selected: [] };
    await nextFrame();
    expect(el.classList.contains('ds-dual-list--readonly')).to.be.true;
    expect(el.querySelector('.ds-dual-list__controls').hidden).to.be.true;
    expect(panel(el, 'available').querySelector('.ds-dual-list__search').hidden).to.be.true;
    expect(firstCheckbox(el, 'available').hasAttribute('disabled')).to.be.true;
  });

  it('error + error-message: reveals the helper row and marks panels invalid', async () => {
    const el = await withItems([{ id: 'a', label: 'A' }], []);
    el.setAttribute('error', '');
    el.setAttribute('error-message', 'Pick at least one');
    await nextFrame();
    expect(el.classList.contains('ds-dual-list--error')).to.be.true;
    const helper = el.querySelector('.ds-dual-list__helper');
    expect(helper.hidden).to.be.false;
    expect(helper.getAttribute('text')).to.equal('Pick at least one');
    expect(panel(el, 'available').getAttribute('aria-invalid')).to.equal('true');
    expect(list(el, 'available').getAttribute('aria-describedby')).to.equal(helper.id);
  });

  it('renders locked selected items as non-draggable with a locked class', async () => {
    const el = await withItems([], [{ id: 's1', label: 'Pinned', locked: true }]);
    const row = rows(el, 'selected')[0];
    expect(row.classList.contains('ds-dual-list__row--locked')).to.be.true;
    expect(row.draggable).to.be.false;
  });
});

describe('ds-dual-list — accessibility', () => {
  it('has no axe violations in a populated, multi-state render', async () => {
    const el = await withItems(
      [{ id: 'a', label: 'Apple' }, { id: 'b', label: 'Banana' }],
      [{ id: 'c', label: 'Cherry' }, { id: 's', label: 'Pinned', locked: true }],
    );
    await expect(el).to.be.accessible({ ignoredRules: ['color-contrast'] });
  });

  it('stays accessible with search, move-all and an error message on', async () => {
    const el = await fixture(html`<ds-dual-list searchable move-all error error-message="Required"></ds-dual-list>`);
    el.items = { available: [{ id: 'a', label: 'Apple' }], selected: [{ id: 'c', label: 'Cherry' }] };
    await nextFrame();
    await expect(el).to.be.accessible({ ignoredRules: ['color-contrast'] });
  });
});

describe('ds-dual-list — repaint-split (reactivity & node identity)', () => {
  it('a visual-only attribute patches chrome in place — rows keep node identity', async () => {
    const el = await withItems([{ id: 'a', label: 'Apple' }, { id: 'b', label: 'Banana' }], []);
    const before = rows(el, 'available')[0];
    el.setAttribute('move-all', '');            // chrome-only → _paintChrome, no list rebuild
    await nextFrame();
    expect(el.classList.contains('ds-dual-list--move-all')).to.be.true;
    expect(rows(el, 'available')[0], 'same row DOM node after chrome paint').to.equal(before);
  });

  it('toggling searchable shows/hides the search without rebuilding rows', async () => {
    const el = await withItems([{ id: 'a', label: 'Apple' }], []);
    const before = rows(el, 'available')[0];
    el.setAttribute('searchable', '');
    await nextFrame();
    expect(panel(el, 'available').querySelector('.ds-dual-list__search').hidden).to.be.false;
    expect(rows(el, 'available')[0]).to.equal(before);
    el.removeAttribute('searchable');
    await nextFrame();
    expect(panel(el, 'available').querySelector('.ds-dual-list__search').hidden).to.be.true;
    expect(rows(el, 'available')[0], 'still the same node').to.equal(before);
  });

  it('a structural attribute (loading) does rebuild the list', async () => {
    const el = await withItems([{ id: 'a', label: 'Apple' }], []);
    const before = rows(el, 'available')[0];
    el.setAttribute('loading', '');
    await nextFrame();
    expect(rows(el, 'available').length).to.equal(0);      // rows gone → skeletons
    el.removeAttribute('loading');
    await nextFrame();
    expect(rows(el, 'available')[0], 'rebuilt, not the original node').to.not.equal(before);
  });
});

describe('ds-dual-list — search', () => {
  it('filters the visible rows by label', async () => {
    const el = await fixture(html`<ds-dual-list searchable></ds-dual-list>`);
    el.items = { available: [{ id: 'a', label: 'Apple' }, { id: 'b', label: 'Banana' }], selected: [] };
    await nextFrame();
    const search = panel(el, 'available').querySelector('ds-search-field');
    search.dispatchEvent(new CustomEvent('ds-search-field-input', { detail: { value: 'Ban' }, bubbles: true }));
    await nextFrame();
    expect(rows(el, 'available').length).to.equal(1);
    expect(rows(el, 'available')[0].querySelector('.ds-checkbox__label').textContent).to.equal('Banana');
  });
});

describe('ds-dual-list — escaping & teardown', () => {
  it('renders a hostile item label as literal text (no injected <img>)', async () => {
    const el = await withItems([{ id: 'x', label: '"><img src=x onerror=alert(1)>' }], []);
    const row = rows(el, 'available')[0];
    expect(row.querySelector('img')).to.not.exist;
    expect(row.querySelector('.ds-checkbox__label').textContent).to.contain('<img');
  });

  it('disconnects without throwing', async () => {
    const el = await withItems([{ id: 'a', label: 'Apple' }], []);
    expect(() => el.remove()).to.not.throw();
  });

  it('survives a disconnect → reconnect without duplicating panels or throwing', async () => {
    const el = await withItems([{ id: 'a', label: 'Apple' }], []);
    const parent = el.parentNode;
    el.remove();
    parent.appendChild(el);
    await nextFrame();
    expect(el.querySelectorAll('.ds-dual-list__panel').length).to.equal(2);
    expect(rows(el, 'available').length).to.equal(1);
  });
});
