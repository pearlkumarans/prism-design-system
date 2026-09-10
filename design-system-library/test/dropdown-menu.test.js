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
  /* The styling assertions need the real stylesheet — the shared harness does not
     load component CSS, so every colour would read as an inherited default. Each
     load races a timer and never rejects, so a stalled sheet cannot hang the run. */
  before(async () => {
    const HREFS = ['/src/tokens/primitives.css', '/src/tokens/spacing.css',
      '/src/tokens/typography.css', '/src/tokens/tokens.css',
      '/src/components/dropdown-menu/dropdown-menu.css'];
    await Promise.all(HREFS.map((href) => new Promise((resolve) => {
      if (document.querySelector(`link[href="${href}"]`)) return resolve();
      const link = Object.assign(document.createElement('link'), { rel: 'stylesheet', href });
      link.addEventListener('load', resolve);
      link.addEventListener('error', resolve);
      setTimeout(resolve, 2000);
      document.head.appendChild(link);
    })));
    await nextFrame();
  });

  const colourOf = (row) => getComputedStyle(row).color;

  it('mutes the WHOLE row, not just its label', async () => {
    /* A greyed label beside a full-colour icon reads as low contrast, not as
       unavailable. */
    const el = await mk([
      { label: 'Deploy', value: 'd', icon: 'rocket', description: 'No agent', disabled: true },
    ], { open: true, type: 'action' });
    const row = items(el)[0];
    const muted = colourOf(row);
    for (const sel of ['.ds-dropdown-menu__item-icon', '.ds-dropdown-menu__item-description']) {
      const part = row.querySelector(sel);
      if (part) expect(getComputedStyle(part).color, sel).to.equal(muted);
    }
    expect(getComputedStyle(row).cursor).to.equal('not-allowed');
  });

  it('drops the hover wash — a row that lights up reads as clickable', async () => {
    const el = await mk([{ label: 'Off', value: 'off', disabled: true }], { open: true });
    const row = items(el)[0];
    /* :hover cannot be forced from script, so assert the declared rule instead. */
    const sheet = [...document.styleSheets].find((s) => (s.href || '').includes('dropdown-menu.css'));
    const rules = [...(sheet ? sheet.cssRules : [])].map((r) => r.cssText).join('\n');
    expect(rules).to.contain('[aria-disabled="true"]:hover');
    expect(getComputedStyle(row).backgroundColor, 'no resting wash').to.equal('rgba(0, 0, 0, 0)');
  });

  it('overrides danger — an unavailable Delete must not stay red', async () => {
    const el = await mk([
      { label: 'Delete', value: 'x', icon: 'delete', danger: true, disabled: true },
      { label: 'Rename', value: 'r', disabled: true },
    ], { open: true, type: 'action' });
    const [danger, plain] = items(el);
    expect(colourOf(danger), 'danger disabled matches plain disabled').to.equal(colourOf(plain));
  });

  it('overrides the selected accent in select and multi-select', async () => {
    /* The selected wash comes from aria-checked / aria-selected at the same
       specificity, so this only holds because the disabled rule pairs the
       attributes — source order alone would lose. */
    for (const type of ['select', 'multi-select']) {
      const el = await mk([
        { label: 'A', value: 'a', selected: true },
        { label: 'B', value: 'b', selected: true, disabled: true },
      ], { open: true, type });
      const [on, off] = items(el);
      expect(colourOf(off), `${type}: disabled is not accented`).to.not.equal(colourOf(on));
      expect(getComputedStyle(off).backgroundColor, `${type}: no accent wash`).to.equal('rgba(0, 0, 0, 0)');
    }
  });

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

  /* ── Nested (cascade) menus — `subItems` ──────────────────────────────── */
  describe('nested menus', () => {
    const NESTED = [
      { label: 'Deploy', value: 'deploy' },
      { label: 'Export', value: 'export', subItems: [
        { label: 'CSV', value: 'csv' },
        { label: 'PDF', value: 'pdf', subItems: [
          { label: 'Portrait', value: 'p' },
          { label: 'Landscape', value: 'l', subItems: [{ label: 'Too deep', value: 'x' }] },
        ] },
      ] },
    ];
    const flyouts = () => [...document.querySelectorAll('ds-dropdown-menu.ds-dropdown-menu--cascade-sub[open]')];
    const row = (el, re) => items(el).find((r) => re.test(r.textContent));
    /* The flyouts live on <body>, outside the fixture, so clear them by hand. */
    afterEach(() => document.querySelectorAll('ds-dropdown-menu.ds-dropdown-menu--cascade-sub')
      .forEach((n) => n.remove()));

    it('marks a subItems row as a popup and gives it a chevron', async () => {
      const el = await mk(NESTED, { open: true, type: 'action' });
      const r = row(el, /Export/);
      expect(r.hasAttribute('data-has-sub')).to.be.true;
      expect(r.getAttribute('aria-haspopup')).to.equal('menu');
      expect(r.getAttribute('aria-expanded')).to.equal('false');
      expect(r.querySelector('.ds-dropdown-menu__item-chevron')).to.exist;
      /* A plain row stays plain. */
      expect(row(el, /Deploy/).hasAttribute('aria-haspopup')).to.be.false;
    });

    it('opens the flyout on the forward arrow, inheriting type + rtl', async () => {
      const el = await mk(NESTED, { open: true, type: 'action' });
      el.setAttribute('rtl', '');
      await nextFrame();
      const r = row(el, /Export/);
      r.focus();
      /* RTL mirrors the open key to ArrowLeft. */
      r.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowLeft', bubbles: true }));
      await nextFrame();
      const [sub] = flyouts();
      expect(sub, 'flyout opened').to.exist;
      expect(sub.getAttribute('type'), 'inherits action').to.equal('action');
      expect(sub.hasAttribute('rtl'), 'inherits rtl').to.be.true;
      expect(r.getAttribute('aria-expanded')).to.equal('true');
      expect(sub.contains(document.activeElement), 'focus moved into the flyout').to.be.true;
    });

    it('peels one level at a time on the back arrow and Escape', async () => {
      const el = await mk(NESTED, { open: true, type: 'action' });
      const exportRow = row(el, /Export/);
      exportRow.focus();
      exportRow.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true }));
      await nextFrame();
      const l2 = flyouts()[0];
      const pdf = [...l2.querySelectorAll('.ds-dropdown-menu__item')].find((r) => /PDF/.test(r.textContent));
      pdf.focus();
      pdf.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true }));
      await nextFrame();
      expect(flyouts().length, 'two levels open').to.equal(2);

      /* Escape closes only the deepest, returning focus to the row that owns it. */
      document.activeElement.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
      await nextFrame();
      expect(flyouts().length, 'back to one level').to.equal(1);
      expect(document.activeElement).to.equal(pdf);

      /* Back-arrow closes the last one; the root menu stays open. */
      document.activeElement.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowLeft', bubbles: true }));
      await nextFrame();
      expect(flyouts().length, 'all flyouts closed').to.equal(0);
      expect(document.activeElement).to.equal(exportRow);
      expect(el.hasAttribute('open'), 'root menu still open').to.be.true;
      expect(exportRow.getAttribute('aria-expanded')).to.equal('false');
    });

    it('re-fires a leaf select on the root menu with its parent attached', async () => {
      const el = await mk(NESTED, { open: true, type: 'action' });
      const r = row(el, /Export/);
      r.focus();
      r.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true }));
      await nextFrame();
      const listener = oneEvent(el, 'ds-dropdown-select');
      flyouts()[0].querySelector('.ds-dropdown-menu__item').click();
      const { detail } = await listener;
      expect(detail.value).to.equal('csv');
      expect(detail.parent.label, 'parent row attached').to.equal('Export');
      expect(el.hasAttribute('open'), 'root menu closed after a leaf select').to.be.false;
    });

    it('stops cascading at the depth cap', async () => {
      const el = await mk(NESTED, { open: true, type: 'action' });
      const r = row(el, /Export/);
      r.focus();
      r.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true }));
      await nextFrame();
      const pdf = [...flyouts()[0].querySelectorAll('.ds-dropdown-menu__item')].find((x) => /PDF/.test(x.textContent));
      pdf.focus();
      pdf.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true }));
      await nextFrame();
      const l3 = flyouts().find((s) => s._subDepth === 3);
      expect(l3, 'third level opened').to.exist;
      /* Landscape declares subItems but sits at the cap — no affordance offered. */
      const landscape = [...l3.querySelectorAll('.ds-dropdown-menu__item')].find((x) => /Landscape/.test(x.textContent));
      expect(landscape.hasAttribute('data-has-sub'), 'no cascade past the cap').to.be.false;
      expect(landscape.querySelector('.ds-dropdown-menu__item-chevron'), 'no chevron past the cap').to.not.exist;
    });

    it('keeps the whole chain open while the cursor moves out to the third level', async () => {
      /* Regression: moving into L3 necessarily LEAVES L2, and that mouseleave
         starts a close timer on L1. Entering L3 only cancelled its immediate
         owner's (L2's) timer, so L1 closed L2 180ms later and took L3 with it —
         the third level was unreachable by mouse. */
      const el = await mk(NESTED, { open: true, type: 'action' });
      const enter = (n) => n.dispatchEvent(new MouseEvent('mouseenter', { bubbles: false }));
      const leave = (n) => n.dispatchEvent(new MouseEvent('mouseleave', { bubbles: false }));
      const panelOf = (n) => n.querySelector('.ds-dropdown-menu');

      enter(row(el, /Export/));                       // open L2
      await nextFrame();
      const l2 = flyouts()[0];
      leave(panelOf(el)); enter(l2);                  // cursor crosses into L2
      const pdf = [...l2.querySelectorAll('.ds-dropdown-menu__item')].find((r) => /PDF/.test(r.textContent));
      enter(pdf);                                      // open L3
      await nextFrame();
      const l3 = flyouts().find((s) => s._subDepth === 3);
      expect(l3, 'third level opened').to.exist;

      /* The move that used to kill it: leave L2 (arming L1's timer), enter L3. */
      leave(panelOf(l2)); leave(l2); enter(l3);
      await new Promise((r) => setTimeout(r, 300));   // past the 180ms close delay
      expect(flyouts().length, 'both flyouts still open with the cursor in L3').to.equal(2);
    });

    it('never renders a title row on a flyout', async () => {
      /* The title belongs to the ROOT menu and is opt-in even there. Repeating it
         down the cascade restates the row the user just came from. */
      const el = await mk(NESTED, { open: true, type: 'action' });
      el.setAttribute('show-title', '');
      el.setAttribute('title', 'Actions');
      await nextFrame();
      expect(el.querySelector('.ds-dropdown-menu__title'), 'root keeps its title').to.exist;

      const r = row(el, /Export/);
      r.focus();
      r.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true }));
      await nextFrame();
      const [sub] = flyouts();
      expect(sub.hasAttribute('show-title'), 'flyout is not given show-title').to.be.false;
      expect(sub.querySelector('.ds-dropdown-menu__title'), 'flyout renders no title row').to.not.exist;
    });

    it('still renders section headings inside a flyout', async () => {
      /* The title ROW is withheld from flyouts; heading ITEMS are not — they are
         how a flyout labels its groups. */
      const el = await mk([
        { type: 'heading', label: 'Organise' },
        { label: 'Move to', value: 'move', subItems: [
          { type: 'heading', label: 'Infrastructure' },
          { label: 'Servers', value: 'servers' },
          { type: 'divider' },
          { type: 'heading', label: 'End user' },
          { label: 'Laptops', value: 'laptops' },
        ] },
        { type: 'heading', label: 'Edit' },
        { label: 'Rename', value: 'rename' },
      ], { open: true, type: 'default' });
      /* Headings are not a flyout-only device — the root list groups the same way. */
      expect([...el.querySelectorAll('.ds-dropdown-menu__section-heading')].map((h) => h.textContent.trim()))
        .to.eql(['Organise', 'Edit']);
      const r = row(el, /Move to/);
      r.focus();
      r.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true }));
      await nextFrame();
      const [sub] = flyouts();
      const heads = [...sub.querySelectorAll('.ds-dropdown-menu__section-heading')];
      expect(heads.map((h) => h.textContent.trim())).to.eql(['Infrastructure', 'End user']);
      expect(sub.querySelector('.ds-dropdown-menu__title'), 'still no title row').to.not.exist;
      expect(sub.querySelectorAll('.ds-dropdown-menu__divider').length, 'divider survives too').to.be.greaterThan(0);
    });

    it('does not steal focus when a flyout opens on hover', async () => {
      /* Hover-opening must leave the focus ring where the user put it — only the
         keyboard path moves focus into the flyout. */
      const el = await mk(NESTED, { open: true, type: 'action' });
      const r = row(el, /Export/);
      const before = document.activeElement;
      r.dispatchEvent(new MouseEvent('mouseenter', { bubbles: false }));
      await nextFrame();
      await nextFrame();
      const [sub] = flyouts();
      expect(sub, 'flyout opened on hover').to.exist;
      expect(sub.contains(document.activeElement), 'focus did NOT move into the flyout').to.be.false;
      expect(document.activeElement, 'focus stayed where it was').to.equal(before);
    });

    it('ignores subItems in select / multi-select', async () => {
      for (const type of ['select', 'multi-select']) {
        const el = await mk(NESTED, { open: true, type });
        const r = row(el, /Export/);
        expect(r.hasAttribute('data-has-sub'), `${type}: no cascade`).to.be.false;
        expect(r.querySelector('.ds-dropdown-menu__item-chevron'), `${type}: no chevron`).to.not.exist;
        r.focus();
        r.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true }));
        await nextFrame();
        expect(flyouts().length, `${type}: nothing opened`).to.equal(0);
      }
    });
  });
});

describe('ds-dropdown-menu — in-menu search (show-search)', () => {
  const OPTS = [
    { label: 'Apple', value: 'apple' },
    { label: 'Banana', value: 'banana' },
    { label: 'Cherry', value: 'cherry', description: 'a stone fruit' },
  ];
  const visible = (el) => items(el).filter((li) => !li.hidden);
  const visLabels = (el) => visible(el).map((li) => li.querySelector('.ds-dropdown-menu__item-label').textContent);
  const search = (el) => el.querySelector('[data-search]');
  const typeInto = (el, value) => search(el).dispatchEvent(new CustomEvent('ds-search-field-input', { detail: { value }, bubbles: true }));

  async function mkSearch(type = 'select') {
    const el = await mk(OPTS, { open: true, type });
    el.setAttribute('show-search', '');
    await nextFrame();
    return el;
  }

  it('renders a ds-search-field for a select-type menu with show-search', async () => {
    const el = await mkSearch('select');
    expect(search(el), 'search field rendered').to.exist;
    expect(search(el).tagName.toLowerCase()).to.equal('ds-search-field');
  });

  it('does NOT render search on a command (default/action) menu', async () => {
    const el = await mk(THREE, { open: true, type: 'default' });
    el.setAttribute('show-search', '');
    await nextFrame();
    expect(search(el), 'no search on a command menu').to.not.exist;
  });

  it('filters options by label/description as the query changes', async () => {
    const el = await mkSearch('select');
    typeInto(el, 'an');            // Banana
    expect(visLabels(el)).to.deep.equal(['Banana']);
    typeInto(el, 'stone');         // matches Cherry via its description
    expect(visLabels(el)).to.deep.equal(['Cherry']);
    typeInto(el, '');              // all back
    expect(visLabels(el)).to.deep.equal(['Apple', 'Banana', 'Cherry']);
  });

  it('shows a "No results" row when nothing matches, and clears it when emptied', async () => {
    const el = await mkSearch('select');
    typeInto(el, 'zzz');
    expect(el.querySelector('.ds-dropdown-menu__no-results'), 'no-results shown').to.exist;
    expect(visible(el).length, 'no options visible').to.equal(0);
    el.querySelector('[data-search]').dispatchEvent(new CustomEvent('ds-search-field-clear', { bubbles: true }));
    expect(el.querySelector('.ds-dropdown-menu__no-results'), 'no-results cleared on clear').to.not.exist;
    expect(visible(el).length, 'all options visible again').to.equal(3);
  });

  it('filtering leaves selection untouched', async () => {
    const el = await mkSearch('multi-select');
    el.items = [{ label: 'Apple', value: 'apple', selected: true }, { label: 'Banana', value: 'banana' }];
    await nextFrame();
    typeInto(el, 'ban');
    expect(el.selectedValues ? el.selectedValues : el._items.filter((i) => i.selected).map((i) => i.value))
      .to.deep.equal(['apple']);   // apple still selected though filtered out
  });

  it('the query survives a re-render (items update re-applies the filter)', async () => {
    const el = await mkSearch('select');
    typeInto(el, 'err');           // Cherry
    el.items = OPTS.slice();       // force a re-render
    await nextFrame();
    expect(visLabels(el)).to.deep.equal(['Cherry']);
    expect(search(el).getAttribute('value')).to.equal('err');
  });
});
