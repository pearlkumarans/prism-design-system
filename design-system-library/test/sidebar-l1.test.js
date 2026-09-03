/* ds-sidebar-l1 — the icon rail. Items come from the `items` / `bottomItems`
   properties; the collapse toggle is an opt-in bottom item. Covers item render,
   active state, collapsed toggle (attr + property + event), the select event,
   disabled items, escaping, a11y, and teardown. */
import { fixture, html, expect, nextFrame, oneEvent } from '@open-wc/testing';
import '../src/components/sidebar-l1/sidebar-l1.js';

const ITEMS = [
  { id: 'home', label: 'Home', icon: 'home', active: true },
  { id: 'devices', label: 'Devices', icon: 'laptop' },
  { id: 'reports', label: 'Reports', icon: 'file-report', disabled: true },
];

const build = async (items = ITEMS, attrs = {}, bottom) => {
  const el = await fixture(html`<ds-sidebar-l1></ds-sidebar-l1>`);
  Object.entries(attrs).forEach(([k, v]) => el.setAttribute(k, v));
  el.items = items.map((i) => ({ ...i }));
  if (bottom) el.bottomItems = bottom.map((i) => ({ ...i }));
  await nextFrame();
  return el;
};

const nav = (el) => el.querySelector('nav.ds-sidebar-l1');
const listItems = (el) => el.querySelectorAll('.ds-sidebar-l1__list .ds-sidebar-l1__item');

describe('ds-sidebar-l1 — structure', () => {
  it('renders a labelled nav root', async () => {
    const el = await build();
    expect(nav(el)).to.exist;
    expect(nav(el).getAttribute('aria-label')).to.equal('Main navigation');
  });

  it('renders one item per entry with its icon and label', async () => {
    const el = await build();
    const rows = listItems(el);
    expect(rows.length).to.equal(3);
    expect(rows[0].querySelector('ds-icon').getAttribute('name')).to.equal('home');
    expect(rows[0].querySelector('.ds-sidebar-l1__label-text').textContent).to.equal('Home');
  });

  it('renders the sliding active indicator element', async () => {
    const el = await build();
    expect(el.querySelector('.ds-sidebar-l1__indicator')).to.exist;
  });
});

describe('ds-sidebar-l1 — active & disabled state', () => {
  it('marks the active item with the class + aria-current', async () => {
    const el = await build();
    const active = el.querySelector('.ds-sidebar-l1__item--active');
    expect(active).to.exist;
    expect(active.getAttribute('aria-current')).to.equal('page');
    expect(active.querySelector('.ds-sidebar-l1__label-text').textContent).to.equal('Home');
  });

  it('renders a disabled item as a button with aria-disabled + tabindex -1', async () => {
    const el = await build();
    const rows = listItems(el);
    const reports = [...rows].find((r) => r.getAttribute('aria-label') === 'Reports');
    expect(reports.tagName).to.equal('BUTTON');
    expect(reports.getAttribute('aria-disabled')).to.equal('true');
    expect(reports.getAttribute('tabindex')).to.equal('-1');
  });

  it('renders a linkful item as an anchor with href', async () => {
    const el = await build([{ id: 'ext', label: 'Docs', icon: 'book', href: '/docs' }]);
    const a = el.querySelector('.ds-sidebar-l1__item');
    expect(a.tagName).to.equal('A');
    expect(a.getAttribute('href')).to.equal('/docs');
  });
});

describe('ds-sidebar-l1 — collapsed', () => {
  it('adds the collapsed class and wraps items in tooltips when collapsed', async () => {
    const el = await build(ITEMS, { collapsed: '' });
    expect(nav(el).classList.contains('ds-sidebar-l1--collapsed')).to.be.true;
    expect(el.querySelector('.ds-sidebar-l1__tip')).to.exist;
  });

  it('reflects the collapsed property → attribute and re-renders', async () => {
    const el = await build();
    expect(el.collapsed).to.be.false;
    el.collapsed = true;
    await nextFrame();
    expect(el.hasAttribute('collapsed')).to.be.true;
    expect(nav(el).classList.contains('ds-sidebar-l1--collapsed')).to.be.true;
  });

  it('renders the collapse toggle only when show-collapse is set', async () => {
    const off = await build();
    expect(off.querySelector('.ds-sidebar-l1__toggle-row')).to.not.exist;
    const on = await build(ITEMS, { 'show-collapse': '' });
    expect(on.querySelector('.ds-sidebar-l1__toggle-row')).to.exist;
  });

  it('clicking the toggle flips collapsed and emits ds-sidebar-l1-toggle', async () => {
    const el = await build(ITEMS, { 'show-collapse': '' });
    const toggle = el.querySelector('.ds-sidebar-l1__toggle-row .ds-sidebar-l1__item');
    setTimeout(() => toggle.click());
    const ev = await oneEvent(el, 'ds-sidebar-l1-toggle');
    expect(ev.detail.collapsed).to.be.true;
    expect(el.hasAttribute('collapsed')).to.be.true;
  });
});

describe('ds-sidebar-l1 — bottom items', () => {
  it('renders bottomItems in a separate bottom list', async () => {
    const el = await build(ITEMS, {}, [{ id: 'help', label: 'Help', icon: 'info-circle' }]);
    const bottom = el.querySelector('.ds-sidebar-l1__bottom');
    expect(bottom).to.exist;
    expect(bottom.querySelector('.ds-sidebar-l1__label-text').textContent).to.equal('Help');
  });
});

describe('ds-sidebar-l1 — selection', () => {
  it('emits ds-sidebar-l1-select and moves active on click', async () => {
    const el = await build();
    const devices = [...listItems(el)].find((r) => r.getAttribute('aria-label') === 'Devices');
    setTimeout(() => devices.click());
    const ev = await oneEvent(el, 'ds-sidebar-l1-select');
    expect(ev.detail.id).to.equal('devices');
    expect(devices.classList.contains('ds-sidebar-l1__item--active')).to.be.true;
    expect(devices.getAttribute('aria-current')).to.equal('page');
  });

  it('does not emit select for a disabled item', async () => {
    const el = await build();
    let fired = 0;
    el.addEventListener('ds-sidebar-l1-select', () => (fired += 1));
    const reports = [...listItems(el)].find((r) => r.getAttribute('aria-label') === 'Reports');
    reports.click();
    await nextFrame();
    expect(fired).to.equal(0);
  });
});

describe('ds-sidebar-l1 — escaping', () => {
  it('renders a hostile label as literal text (no injected <img>)', async () => {
    const el = await build([{ id: 'x', label: '<img src=x onerror=alert(1)>', icon: 'home' }]);
    expect(nav(el).querySelector('img')).to.not.exist;
    expect(el.querySelector('.ds-sidebar-l1__label-text').textContent).to.contain('<img');
  });
});

describe('ds-sidebar-l1 — a11y', () => {
  it('is accessible with items + an active row', async () => {
    const el = await build();
    await expect(el).to.be.accessible({ ignoredRules: ['color-contrast'] });
  });

  it('is accessible when collapsed', async () => {
    const el = await build(ITEMS, { collapsed: '' });
    await expect(el).to.be.accessible({ ignoredRules: ['color-contrast'] });
  });
});

describe('ds-sidebar-l1 — teardown', () => {
  it('disconnects without throwing', async () => {
    const el = await build();
    expect(() => el.remove()).to.not.throw();
  });

  it('survives disconnect → reconnect without duplicating items', async () => {
    const el = await build();
    const parent = el.parentNode;
    el.remove();
    parent.appendChild(el);
    await nextFrame();
    expect(el.querySelectorAll('nav.ds-sidebar-l1').length).to.equal(1);
    expect(listItems(el).length).to.equal(3);
  });
});
