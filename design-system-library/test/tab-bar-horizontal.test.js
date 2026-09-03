/* ds-tab-bar-horizontal — horizontal tablist; items via the `items` property,
   selection via the `active-id` attribute/property. Light-DOM. Covers
   structure/tablist a11y, type variants (underline default / fill), the items
   API + late-set (pending) items, active-id default + selection, click +
   keyboard activation with the ds-tab-change event, disabled items, escaping,
   a11y and teardown. */
import { fixture, html, expect, nextFrame, oneEvent } from '@open-wc/testing';
import '../src/components/tab-bar-horizontal/tab-bar-horizontal.js';

const XSS = '<img src=x onerror=alert(1)>';
const ITEMS = [
  { id: 'overview', label: 'Overview', icon: 'home' },
  { id: 'activity', label: 'Activity', icon: 'activity', badge: '12' },
  { id: 'members', label: 'Members', icon: 'mail-user' },
  { id: 'settings', label: 'Settings', disabled: true },
];

const root = (el) => el.querySelector('.ds-tab-bar-horizontal');
const scroller = (el) => el.querySelector('.ds-tab-bar-horizontal__scroller');
const tabs = (el) => [...el.querySelectorAll('.ds-tab-bar-horizontal__item')];

const withItems = async (attrs = '', items = ITEMS) => {
  const el = await fixture(`<ds-tab-bar-horizontal ${attrs}></ds-tab-bar-horizontal>`);
  el.items = items;
  await nextFrame();
  return el;
};

describe('ds-tab-bar-horizontal — structure & a11y roles', () => {
  it('renders a horizontal tablist with one tab per item', async () => {
    const el = await withItems();
    expect(root(el), 'root missing').to.exist;
    expect(scroller(el).getAttribute('role')).to.equal('tablist');
    expect(scroller(el).getAttribute('aria-orientation')).to.equal('horizontal');
    expect(tabs(el).length).to.equal(4);
    expect(tabs(el)[0].getAttribute('role')).to.equal('tab');
  });

  it('mirrors aria-label onto the tablist', async () => {
    const el = await withItems('aria-label="Sections"');
    expect(scroller(el).getAttribute('aria-label')).to.equal('Sections');
  });

  it('renders item labels and badges', async () => {
    const el = await withItems();
    expect(tabs(el)[0].querySelector('.ds-tab-bar-horizontal__item-label').textContent.trim()).to.equal('Overview');
    expect(tabs(el)[1].querySelector('.ds-tab-bar-horizontal__item-badge ds-badge')).to.exist;
  });
});

describe('ds-tab-bar-horizontal — type variants', () => {
  it('defaults to the underline type', async () => {
    const el = await withItems();
    expect(root(el).classList.contains('ds-tab-bar-horizontal--underline')).to.be.true;
  });

  it('applies the fill type from the attribute', async () => {
    const el = await withItems('type="fill"');
    expect(root(el).classList.contains('ds-tab-bar-horizontal--fill')).to.be.true;
  });

  it('falls back to underline on an invalid type', async () => {
    const el = await withItems('type="bogus"');
    expect(root(el).classList.contains('ds-tab-bar-horizontal--underline')).to.be.true;
  });
});

describe('ds-tab-bar-horizontal — items API', () => {
  it('exposes items via the property getter', async () => {
    const el = await withItems();
    expect(el.items).to.have.lengthOf(4);
  });

  it('honors items assigned BEFORE upgrade (pending items)', async () => {
    const el = document.createElement('ds-tab-bar-horizontal');
    el.items = ITEMS;                 /* set before connect */
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

describe('ds-tab-bar-horizontal — selection', () => {
  it('defaults the active tab to the first item', async () => {
    const el = await withItems();
    expect(el.activeId).to.equal('overview');
    expect(tabs(el)[0].getAttribute('aria-selected')).to.equal('true');
    expect(tabs(el)[1].getAttribute('aria-selected')).to.equal('false');
  });

  it('honors an explicit active-id attribute', async () => {
    const el = await withItems('active-id="members"');
    expect(tabs(el)[2].getAttribute('aria-selected')).to.equal('true');
    expect(tabs(el)[2].classList.contains('ds-tab-bar-horizontal__item--active')).to.be.true;
  });

  it('moves selection reactively when active-id changes', async () => {
    const el = await withItems();
    el.setAttribute('active-id', 'activity');
    await nextFrame();
    expect(tabs(el)[1].getAttribute('aria-selected')).to.equal('true');
    expect(tabs(el)[0].getAttribute('aria-selected')).to.equal('false');
  });
});

describe('ds-tab-bar-horizontal — activation', () => {
  it('clicking a tab activates it and fires ds-tab-change', async () => {
    const el = await withItems();
    setTimeout(() => tabs(el)[2].click());
    const ev = await oneEvent(el, 'ds-tab-change');
    expect(ev.detail.id).to.equal('members');
    expect(ev.detail.item.label).to.equal('Members');
    expect(el.activeId).to.equal('members');
  });

  it('does not re-fire when the already-active tab is clicked', async () => {
    const el = await withItems();
    let fired = 0;
    el.addEventListener('ds-tab-change', () => (fired += 1));
    tabs(el)[0].click();      /* already active */
    await nextFrame();
    expect(fired).to.equal(0);
  });

  it('ArrowRight activates the next tab', async () => {
    const el = await withItems();
    tabs(el)[0].dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true }));
    await nextFrame();
    expect(el.activeId).to.equal('activity');
  });

  it('End jumps past the disabled tab to the last focusable tab', async () => {
    const el = await withItems();
    tabs(el)[0].dispatchEvent(new KeyboardEvent('keydown', { key: 'End', bubbles: true }));
    await nextFrame();
    expect(el.activeId).to.equal('members');
  });
});

describe('ds-tab-bar-horizontal — disabled items', () => {
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
    expect(el.activeId).to.equal('overview');
  });
});

describe('ds-tab-bar-horizontal — escaping', () => {
  it('renders a hostile item label as literal text (no injected <img>)', async () => {
    const el = await withItems('', [{ id: 'x', label: XSS }]);
    const lbl = tabs(el)[0].querySelector('.ds-tab-bar-horizontal__item-label');
    expect(lbl.querySelector('img'), 'label injected an <img>').to.not.exist;
    expect(lbl.textContent).to.contain('<img');
  });
});

describe('ds-tab-bar-horizontal — a11y', () => {
  it('is accessible', async () => {
    const el = await withItems('aria-label="Sections"');
    await expect(el).to.be.accessible({ ignoredRules: ['color-contrast'] });
  });
});

describe('ds-tab-bar-horizontal — teardown', () => {
  it('survives disconnect → reconnect without duplicating tabs or throwing', async () => {
    const el = await withItems();
    const parent = el.parentNode;
    expect(() => el.remove()).to.not.throw();
    parent.appendChild(el);
    await nextFrame();
    expect(tabs(el).length, 'exactly four tabs after reconnect').to.equal(4);
    expect(el.querySelectorAll('.ds-tab-bar-horizontal__scroller').length).to.equal(1);
  });
});
