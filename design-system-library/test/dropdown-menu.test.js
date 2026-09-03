/* ds-dropdown-menu — the panel menu. Covers injection safety (data-derived
   labels render as text), render/structure from `.items`, the item-type matrix
   (item / heading / divider / select / multi-select / select-tick), the open
   visibility split (toggles _panel.hidden without rebuilding the list), the
   selection + change events, disabled items, a11y (role per type), keyboard
   focus on open, rtl, and teardown (global listeners via test/helpers/listeners.js). */
import { fixture, html, expect, nextFrame, oneEvent } from '@open-wc/testing';
import '../src/components/dropdown-menu/dropdown-menu.js';
import { trackListeners } from './helpers/listeners.js';

const A11Y = { ignoredRules: ['color-contrast'] };
const items = (el) => [...el.querySelectorAll('.ds-dropdown-menu__item')];
const labels = (el) => [...el.querySelectorAll('.ds-dropdown-menu__item-label')];

/* Build a menu, assign items, and settle a frame. `open` mounts it visible. */
async function mk(itemList, { open = false, type } = {}) {
  const el = await fixture(html`<ds-dropdown-menu></ds-dropdown-menu>`);
  if (type) el.setAttribute('type', type);
  if (open) el.setAttribute('open', '');
  el.items = itemList;
  await nextFrame();
  return el;
}

const THREE = [
  { label: 'Edit', value: 'edit', icon: 'edit' },
  { label: 'Duplicate', value: 'dup' },
  { label: 'Delete', value: 'delete', danger: true },
];

describe('ds-dropdown-menu — injection safety', () => {
  it('escapes data-derived item labels — no HTML is injected', async () => {
    const el = await fixture(html`<ds-dropdown-menu open></ds-dropdown-menu>`);
    el.items = [
      { label: '<img src=x onerror=alert(1)>', value: '1' },
      { label: 'A & B <b>bold</b>', value: '2' },
    ];
    await nextFrame();

    const lbls = labels(el);
    expect(lbls.length, 'items did not render').to.equal(2);
    // No element was parsed out of the label string.
    expect(el.querySelector('.ds-dropdown-menu__item-label img'), 'label injected an <img>').to.not.exist;
    expect(el.querySelector('.ds-dropdown-menu__item-label b'), 'label injected a <b>').to.not.exist;
    // The literal text is preserved.
    expect(lbls[0].textContent).to.contain('<img');
    expect(lbls[1].textContent).to.contain('<b>bold</b>');
  });

  it('escapes description and badge text', async () => {
    const el = await fixture(html`<ds-dropdown-menu open></ds-dropdown-menu>`);
    el.items = [{ label: 'Item', value: '1', description: '<i>d</i>', badge: '<u>b</u>' }];
    await nextFrame();
    expect(el.querySelector('.ds-dropdown-menu__item-description i')).to.not.exist;
    expect(el.querySelector('.ds-dropdown-menu__item-badge u')).to.not.exist;
  });
});

describe('ds-dropdown-menu — render & structure', () => {
  it('renders a panel + list with one item per data entry', async () => {
    const el = await mk(THREE, { open: true });
    expect(el.querySelector('.ds-dropdown-menu'), 'panel missing').to.exist;
    expect(el.querySelector('.ds-dropdown-menu__list'), 'list missing').to.exist;
    expect(items(el).length).to.equal(3);
    expect(labels(el).map((l) => l.textContent)).to.deep.equal(['Edit', 'Duplicate', 'Delete']);
  });

  it('renders an item icon and the danger modifier', async () => {
    const el = await mk(THREE, { open: true });
    expect(items(el)[0].querySelector('.ds-dropdown-menu__item-icon ds-icon')).to.exist;
    expect(items(el)[2].classList.contains('ds-dropdown-menu__item--danger')).to.be.true;
  });

  it('shows an empty-state row when there are no real options', async () => {
    const el = await mk([{ type: 'heading', label: 'Group' }, { type: 'divider' }], { open: true });
    expect(items(el).length, 'no interactive items').to.equal(0);
    expect(el.querySelector('.ds-dropdown-menu__empty')).to.exist;
  });
});

describe('ds-dropdown-menu — item types', () => {
  it('renders headings and dividers as presentational rows', async () => {
    const el = await mk([
      { type: 'heading', label: 'Actions' },
      { label: 'Rename', value: 'r' },
      { type: 'divider' },
      { label: 'Delete', value: 'd' },
    ], { open: true });
    expect(el.querySelector('.ds-dropdown-menu__section-heading')).to.exist;
    const div = el.querySelector('.ds-dropdown-menu__list .ds-dropdown-menu__divider');
    expect(div, 'divider row missing').to.exist;
    expect(div.getAttribute('role')).to.equal('separator');
    expect(items(el).length, 'two real items around the divider').to.equal(2);
  });

  it('select: panel is a listbox and rows are options backed by a radio', async () => {
    const el = await mk([
      { label: 'A', value: 'a', selected: true },
      { label: 'B', value: 'b' },
    ], { open: true, type: 'select' });
    expect(el.querySelector('.ds-dropdown-menu').getAttribute('role')).to.equal('listbox');
    expect(items(el)[0].getAttribute('role')).to.equal('option');
    expect(items(el)[0].getAttribute('aria-selected')).to.equal('true');
    expect(items(el)[0].querySelector('ds-radio'), 'select uses a radio indicator').to.exist;
  });

  it('multi-select: panel is a dialog and rows are checkboxes', async () => {
    const el = await mk([
      { label: 'A', value: 'a', selected: true },
      { label: 'B', value: 'b' },
    ], { open: true, type: 'multi-select' });
    expect(el.querySelector('.ds-dropdown-menu').getAttribute('role')).to.equal('dialog');
    expect(items(el)[0].getAttribute('role')).to.equal('checkbox');
    expect(items(el)[0].getAttribute('aria-checked')).to.equal('true');
    expect(items(el)[0].querySelector('ds-checkbox'), 'multi-select uses a checkbox indicator').to.exist;
  });

  it('select-tick: multi-selectable listbox with a tick on selected rows', async () => {
    const el = await mk([
      { label: 'A', value: 'a', selected: true },
      { label: 'B', value: 'b' },
    ], { open: true, type: 'select-tick' });
    const panel = el.querySelector('.ds-dropdown-menu');
    expect(panel.getAttribute('role')).to.equal('listbox');
    expect(panel.getAttribute('aria-multiselectable')).to.equal('true');
    expect(items(el)[0].getAttribute('role')).to.equal('option');
    expect(items(el)[0].querySelector('.ds-dropdown-menu__tick ds-icon'), 'selected row shows a tick').to.exist;
  });
});

describe('ds-dropdown-menu — open / close (visibility split)', () => {
  it('the `open` attribute toggles _panel.hidden WITHOUT rebuilding the list', async () => {
    const el = await mk(THREE);                 // built closed; list already rendered
    const firstLi = items(el)[0];
    expect(firstLi, 'list should render while closed').to.exist;
    expect(el._panel.hidden, 'starts hidden').to.be.true;

    el.open();
    await nextFrame();
    expect(el._panel.hidden, 'open() reveals the panel').to.be.false;
    expect(items(el)[0], 'open must not rebuild the list').to.equal(firstLi);

    el.close();
    await nextFrame();
    expect(el._panel.hidden, 'close() hides the panel').to.be.true;

    el.open();
    await nextFrame();
    expect(el._panel.hidden).to.be.false;
    // Same <li> node across the whole open → close → open cycle.
    expect(items(el)[0], 'reopen must not rebuild the list').to.equal(firstLi);
  });
});

describe('ds-dropdown-menu — selection & change events', () => {
  it('default menu: clicking a row emits ds-dropdown-select with its value', async () => {
    const el = await mk(THREE, { open: true });
    setTimeout(() => items(el)[0].click());
    const ev = await oneEvent(el, 'ds-dropdown-select');
    expect(ev.detail.value).to.equal('edit');
    expect(ev.detail.item.label).to.equal('Edit');
  });

  it('multi-select: toggling a row emits ds-dropdown-change with the values', async () => {
    const el = await mk([
      { label: 'A', value: 'a' },
      { label: 'B', value: 'b', selected: true },
    ], { open: true, type: 'multi-select' });
    setTimeout(() => items(el)[0].click());
    const ev = await oneEvent(el, 'ds-dropdown-change');
    expect(ev.detail.value).to.equal('a');
    expect(ev.detail.selected).to.equal(true);
    expect(ev.detail.values).to.have.members(['a', 'b']);
    // In-place aria update — no full rebuild.
    expect(items(el)[0].getAttribute('aria-checked')).to.equal('true');
  });

  it('select-tick: toggling a row emits ds-dropdown-change and keeps the menu open', async () => {
    const el = await mk([{ label: 'A', value: 'a' }], { open: true, type: 'select-tick' });
    setTimeout(() => items(el)[0].click());
    const ev = await oneEvent(el, 'ds-dropdown-change');
    expect(ev.detail.value).to.equal('a');
    expect(el.hasAttribute('open'), 'select-tick stays open on toggle').to.be.true;
  });
});

describe('ds-dropdown-menu — disabled items', () => {
  it('marks a disabled row and never fires select on click', async () => {
    const el = await mk([
      { label: 'Off', value: 'off', disabled: true },
      { label: 'On', value: 'on' },
    ], { open: true });
    const off = items(el)[0];
    expect(off.getAttribute('aria-disabled')).to.equal('true');
    expect(off.getAttribute('tabindex')).to.equal('-1');

    let fired = 0;
    el.addEventListener('ds-dropdown-select', () => (fired += 1));
    off.click();
    await nextFrame();
    expect(fired, 'a disabled row must not select').to.equal(0);
  });
});

describe('ds-dropdown-menu — keyboard focus', () => {
  it('focuses the first ENABLED item when opened', async () => {
    const el = await mk([
      { label: 'Off', value: 'off', disabled: true },
      { label: 'On', value: 'on' },
      { label: 'Also', value: 'also' },
    ]);
    el.open();
    await nextFrame();
    await nextFrame();
    expect(document.activeElement, 'first enabled row should receive focus').to.equal(items(el)[1]);
  });
});

describe('ds-dropdown-menu — rtl', () => {
  it('mirrors rtl onto the panel as dir="rtl"', async () => {
    const el = await fixture(html`<ds-dropdown-menu rtl open></ds-dropdown-menu>`);
    el.items = THREE;
    await nextFrame();
    expect(el._panel.getAttribute('dir')).to.equal('rtl');
    el.removeAttribute('rtl');
    await nextFrame();
    expect(el._panel.hasAttribute('dir')).to.be.false;
  });
});

describe('ds-dropdown-menu — accessibility', () => {
  it('a default (menu) panel with menuitems is accessible', async () => {
    const el = await mk(THREE, { open: true });
    await expect(el).to.be.accessible(A11Y);
  });

  // The `select` panel is role="listbox", which REQUIRES an accessible name; it is
  // now named from the title (default "Menu"), so axe passes. (A default menu needs
  // no name.) Regression guard for the naming fix.
  it('the select (listbox) panel is named + accessible', async () => {
    const el = await mk([
      { label: 'A', value: 'a', selected: true },
      { label: 'B', value: 'b' },
    ], { open: true, type: 'select' });
    const panel = el.querySelector('[role="listbox"]');
    expect(panel, 'listbox panel missing').to.exist;
    expect(panel.getAttribute('aria-label'), 'listbox has no accessible name').to.be.a('string').with.length.greaterThan(0);
    await expect(el).to.be.accessible(A11Y);
  });
});

describe('ds-dropdown-menu — teardown', () => {
  it('connect → disconnect leaves no global listener leak', async () => {
    const anchor = await fixture(html`<button>Open</button>`);
    const t = trackListeners();
    try {
      const el = await fixture(html`<ds-dropdown-menu></ds-dropdown-menu>`);
      el.items = THREE;
      await nextFrame();
      // Exercise the global bindings: keydown (connect), scroll/resize
      // (positionFrom reanchor), and the document outside-close (openFrom).
      el.openFrom(anchor);
      await nextFrame();
      el.remove();
    } finally {
      t.restore();
    }
    expect(t.net(), JSON.stringify(t.byType())).to.equal(0);
  });

  it('survives a disconnect → reconnect without throwing or duplicating the panel', async () => {
    const el = await mk(THREE, { open: true });
    const parent = el.parentNode;
    expect(() => { el.remove(); parent.appendChild(el); }).to.not.throw();
    await nextFrame();
    expect(el.querySelectorAll('.ds-dropdown-menu').length, 'exactly one panel after reconnect').to.equal(1);
    expect(items(el).length).to.equal(3);
  });
});
