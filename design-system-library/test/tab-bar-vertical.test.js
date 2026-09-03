/* ds-tab-bar-vertical — vertical tablist; items via the `items` property,
   selection via the `active-id` attribute/property. Light-DOM. Covers
   structure/tablist a11y (vertical orientation), type variants (underline
   default / fill), the items API + late-set items, active-id default +
   selection, click + keyboard (Up/Down/Home/End) activation with ds-tab-change,
   disabled items, escaping, a11y and teardown (RO nulled on disconnect). */
import { fixture, html, expect, nextFrame, oneEvent } from '@open-wc/testing';
import '../src/components/tab-bar-vertical/tab-bar-vertical.js';

const XSS = '<img src=x onerror=alert(1)>';
const ITEMS = [
  { id: 'general', label: 'General', icon: 'config' },
  { id: 'notify', label: 'Notifications', icon: 'bell', badge: '12' },
  { id: 'security', label: 'Security', icon: 'shield' },
  { id: 'billing', label: 'Billing', disabled: true },
];

const root = (el) => el.querySelector('.ds-tab-bar-vertical');
const tabs = (el) => [...el.querySelectorAll('.ds-tab-bar-vertical__item')];

const withItems = async (attrs = '', items = ITEMS) => {
  const el = await fixture(`<ds-tab-bar-vertical ${attrs}></ds-tab-bar-vertical>`);
  el.items = items;
  await nextFrame();
  return el;
};

describe('ds-tab-bar-vertical — structure & a11y roles', () => {
  it('renders a vertical tablist with one tab per item', async () => {
    const el = await withItems();
    expect(root(el).getAttribute('role')).to.equal('tablist');
    expect(root(el).getAttribute('aria-orientation')).to.equal('vertical');
    expect(tabs(el).length).to.equal(4);
    expect(tabs(el)[0].getAttribute('role')).to.equal('tab');
  });

  it('mirrors aria-label onto the tablist root', async () => {
    const el = await withItems('aria-label="Settings sections"');
    expect(root(el).getAttribute('aria-label')).to.equal('Settings sections');
  });

  it('renders item labels and badges', async () => {
    const el = await withItems();
    expect(tabs(el)[0].querySelector('.ds-tab-bar-vertical__item-label').textContent.trim()).to.equal('General');
    expect(tabs(el)[1].querySelector('.ds-tab-bar-vertical__item-badge ds-badge')).to.exist;
  });
});

describe('ds-tab-bar-vertical — type variants', () => {
  it('defaults to the underline type', async () => {
    const el = await withItems();
    expect(root(el).classList.contains('ds-tab-bar-vertical--underline')).to.be.true;
  });

  it('applies the fill type from the attribute', async () => {
    const el = await withItems('type="fill"');
    expect(root(el).classList.contains('ds-tab-bar-vertical--fill')).to.be.true;
  });

  it('falls back to underline on an invalid type', async () => {
    const el = await withItems('type="bogus"');
    expect(root(el).classList.contains('ds-tab-bar-vertical--underline')).to.be.true;
  });
});

describe('ds-tab-bar-vertical — items API', () => {
  it('exposes items via the property getter', async () => {
    const el = await withItems();
    expect(el.items).to.have.lengthOf(4);
  });

  it('honors items assigned BEFORE upgrade (pending items)', async () => {
    const el = document.createElement('ds-tab-bar-vertical');
    el.items = ITEMS;
    document.body.appendChild(el);
    await nextFrame();
    expect(tabs(el).length).to.equal(4);
    el.remove();
  });

  it('re-renders when items are replaced', async () => {
    const el = await withItems();
    el.items = [{ id: 'a', label: 'Alpha' }];
    await nextFrame();
    expect(tabs(el).length).to.equal(1);
    expect(tabs(el)[0].textContent.trim()).to.equal('Alpha');
  });
});

describe('ds-tab-bar-vertical — selection', () => {
  it('defaults the active tab to the first item', async () => {
    const el = await withItems();
    expect(el.activeId).to.equal('general');
    expect(tabs(el)[0].getAttribute('aria-selected')).to.equal('true');
    expect(tabs(el)[1].getAttribute('aria-selected')).to.equal('false');
  });

  it('honors an explicit active-id attribute', async () => {
    const el = await withItems('active-id="security"');
    expect(tabs(el)[2].getAttribute('aria-selected')).to.equal('true');
    expect(tabs(el)[2].classList.contains('ds-tab-bar-vertical__item--active')).to.be.true;
  });

  it('moves selection reactively when active-id changes', async () => {
    const el = await withItems();
    el.setAttribute('active-id', 'notify');
    await nextFrame();
    expect(tabs(el)[1].getAttribute('aria-selected')).to.equal('true');
    expect(tabs(el)[0].getAttribute('aria-selected')).to.equal('false');
  });
});

describe('ds-tab-bar-vertical — activation', () => {
  it('clicking a tab activates it and fires ds-tab-change', async () => {
    const el = await withItems();
    setTimeout(() => tabs(el)[2].click());
    const ev = await oneEvent(el, 'ds-tab-change');
    expect(ev.detail.id).to.equal('security');
    expect(ev.detail.item.label).to.equal('Security');
    expect(el.activeId).to.equal('security');
  });

  it('does not re-fire when the already-active tab is clicked', async () => {
    const el = await withItems();
    let fired = 0;
    el.addEventListener('ds-tab-change', () => (fired += 1));
    tabs(el)[0].click();
    await nextFrame();
    expect(fired).to.equal(0);
  });

  it('ArrowDown activates the next tab (vertical orientation)', async () => {
    const el = await withItems();
    tabs(el)[0].dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true }));
    await nextFrame();
    expect(el.activeId).to.equal('notify');
  });

  it('ArrowUp wraps to the last focusable tab', async () => {
    const el = await withItems();
    tabs(el)[0].dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowUp', bubbles: true }));
    await nextFrame();
    expect(el.activeId).to.equal('security');   /* billing is disabled → skipped */
  });

  it('Home jumps to the first tab', async () => {
    const el = await withItems('active-id="security"');
    tabs(el)[2].dispatchEvent(new KeyboardEvent('keydown', { key: 'Home', bubbles: true }));
    await nextFrame();
    expect(el.activeId).to.equal('general');
  });
});

describe('ds-tab-bar-vertical — disabled items', () => {
  it('marks a disabled item and never activates it on click', async () => {
    const el = await withItems();
    const disabled = tabs(el)[3];
    expect(disabled.disabled).to.be.true;
    expect(disabled.getAttribute('aria-disabled')).to.equal('true');
    let fired = 0;
    el.addEventListener('ds-tab-change', () => (fired += 1));
    disabled.click();
    await nextFrame();
    expect(fired).to.equal(0);
    expect(el.activeId).to.equal('general');
  });
});

describe('ds-tab-bar-vertical — escaping', () => {
  it('renders a hostile item label as literal text (no injected <img>)', async () => {
    const el = await withItems('', [{ id: 'x', label: XSS }]);
    const lbl = tabs(el)[0].querySelector('.ds-tab-bar-vertical__item-label');
    expect(lbl.querySelector('img'), 'label injected an <img>').to.not.exist;
    expect(lbl.textContent).to.contain('<img');
  });
});

describe('ds-tab-bar-vertical — a11y', () => {
  it('is accessible', async () => {
    const el = await withItems('aria-label="Settings sections"');
    await expect(el).to.be.accessible({ ignoredRules: ['color-contrast'] });
  });
});

describe('ds-tab-bar-vertical — teardown', () => {
  it('nulls its ResizeObserver on disconnect so a reconnect re-creates it', async () => {
    const el = await withItems();
    expect(el._ro, 'RO should exist while mounted').to.not.equal(null);
    expect(() => el.remove()).to.not.throw();
    expect(el._ro, 'RO nulled on disconnect').to.equal(null);
  });

  it('survives disconnect → reconnect without duplicating tabs', async () => {
    const el = await withItems();
    const parent = el.parentNode;
    el.remove();
    parent.appendChild(el);
    await nextFrame();
    expect(tabs(el).length, 'exactly four tabs after reconnect').to.equal(4);
    expect(el.querySelectorAll('.ds-tab-bar-vertical').length).to.equal(1);
  });
});
