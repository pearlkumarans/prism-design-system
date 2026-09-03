/* ds-split-button — a primary action button paired with a caret that opens a
   ds-dropdown-menu of secondary actions. Light-DOM: query `el.querySelector`.
   Covers structure/group semantics, spec defaults (small/primary), the
   primary + caret buttons, label/icon reactivity, disabled/loading, the
   menuItems property wiring the dropdown, the three custom events, escaping,
   a11y and teardown. */
import { fixture, html, expect, nextFrame, oneEvent } from '@open-wc/testing';
import { trackListeners } from './helpers/listeners.js';
import '../src/components/split-button/split-button.js';

const XSS = '<img src=x onerror=alert(1)>';
const MENU = [
  { label: 'Duplicate', value: 'dup' },
  { label: 'Archive', value: 'arch' },
];

const root = (el) => el.querySelector('.ds-split-button');
const mainBtn = (el) => el.querySelector('[data-main]');
const chevBtn = (el) => el.querySelector('[data-chev]');

describe('ds-split-button — structure & group semantics', () => {
  it('renders a single root with a primary + caret button', async () => {
    const el = await fixture(html`<ds-split-button label="Save"></ds-split-button>`);
    expect(root(el), 'root missing').to.exist;
    expect(el.children.length, 'host has exactly one element child').to.equal(1);
    expect(mainBtn(el), 'primary button missing').to.exist;
    expect(chevBtn(el), 'caret button missing').to.exist;
  });

  it('exposes group semantics with an options aria-label', async () => {
    const el = await fixture(html`<ds-split-button label="Save"></ds-split-button>`);
    expect(root(el).getAttribute('role')).to.equal('group');
    expect(root(el).getAttribute('aria-label')).to.equal('Save options');
  });

  it('the caret advertises a collapsed menu popup', async () => {
    const el = await fixture(html`<ds-split-button label="Save"></ds-split-button>`);
    expect(chevBtn(el).getAttribute('aria-haspopup')).to.equal('menu');
    expect(chevBtn(el).getAttribute('aria-expanded')).to.equal('false');
  });
});

describe('ds-split-button — spec defaults & variants', () => {
  it('defaults to small + primary', async () => {
    const el = await fixture(html`<ds-split-button label="Go"></ds-split-button>`);
    expect(root(el).classList.contains('ds-split-button--small')).to.be.true;
    expect(root(el).classList.contains('ds-split-button--primary')).to.be.true;
  });

  it('reflects size + variant attributes', async () => {
    const el = await fixture(html`<ds-split-button label="Go" size="large" variant="outline"></ds-split-button>`);
    expect(root(el).classList.contains('ds-split-button--large')).to.be.true;
    expect(root(el).classList.contains('ds-split-button--outline')).to.be.true;
  });

  it('falls back to the default variant on an invalid value', async () => {
    const el = await fixture(html`<ds-split-button label="Go" variant="bogus"></ds-split-button>`);
    expect(root(el).classList.contains('ds-split-button--primary')).to.be.true;
  });
});

describe('ds-split-button — label & icon', () => {
  it('the label attribute wins over slotted content and updates reactively', async () => {
    const el = await fixture(html`<ds-split-button label="Attr">Slotted</ds-split-button>`);
    expect(mainBtn(el).querySelector('span').textContent).to.equal('Attr');
    el.setAttribute('label', 'Updated');
    await nextFrame();
    expect(mainBtn(el).querySelector('span').textContent).to.equal('Updated');
  });

  it('falls back to the slotted label, then to "Action"', async () => {
    const slotted = await fixture(html`<ds-split-button>Deploy</ds-split-button>`);
    expect(mainBtn(slotted).querySelector('span').textContent).to.equal('Deploy');
    const bare = await fixture(html`<ds-split-button></ds-split-button>`);
    expect(mainBtn(bare).querySelector('span').textContent).to.equal('Action');
  });

  it('renders a leading icon in the primary button when icon is set', async () => {
    const el = await fixture(html`<ds-split-button label="Add" icon="add"></ds-split-button>`);
    const icon = mainBtn(el).querySelector('ds-icon');
    expect(icon).to.exist;
    expect(icon.getAttribute('name')).to.equal('add');
  });
});

describe('ds-split-button — disabled & loading', () => {
  it('disabled disables both buttons and marks the group', async () => {
    const el = await fixture(html`<ds-split-button label="Save" disabled></ds-split-button>`);
    expect(mainBtn(el).disabled).to.be.true;
    expect(chevBtn(el).disabled).to.be.true;
    expect(root(el).getAttribute('aria-disabled')).to.equal('true');
  });

  it('loading swaps in a spinner and sets aria-busy', async () => {
    const el = await fixture(html`<ds-split-button label="Save" loading></ds-split-button>`);
    expect(root(el).classList.contains('ds-split-button--loading')).to.be.true;
    expect(root(el).getAttribute('aria-busy')).to.equal('true');
    expect(root(el).querySelector('.ds-split-button__spinner'), 'spinner missing').to.exist;
    expect(mainBtn(el), 'no action button while loading').to.not.exist;
  });

  it('clears aria-busy + spinner when loading is removed', async () => {
    const el = await fixture(html`<ds-split-button label="Save" loading></ds-split-button>`);
    el.removeAttribute('loading');
    await nextFrame();
    expect(root(el).hasAttribute('aria-busy')).to.be.false;
    expect(root(el).querySelector('.ds-split-button__spinner')).to.not.exist;
    expect(mainBtn(el)).to.exist;
  });
});

describe('ds-split-button — menu', () => {
  it('has no menu element until menuItems is set', async () => {
    const el = await fixture(html`<ds-split-button label="Save"></ds-split-button>`);
    expect(el.querySelector('.ds-split-button__menu')).to.not.exist;
  });

  it('renders a ds-dropdown-menu and forwards items when menuItems is set', async () => {
    const el = await fixture(html`<ds-split-button label="Save"></ds-split-button>`);
    el.menuItems = MENU;
    await nextFrame();
    const menu = el.querySelector('.ds-split-button__menu');
    expect(menu, 'dropdown menu missing').to.exist;
    expect(menu.items).to.have.lengthOf(2);
    expect(el.querySelectorAll('.ds-split-button__menu .ds-dropdown-menu__item').length).to.equal(2);
  });

  it('clicking the caret toggles the menu open and syncs aria-expanded', async () => {
    const el = await fixture(html`<ds-split-button label="Save"></ds-split-button>`);
    el.menuItems = MENU;
    await nextFrame();
    chevBtn(el).click();
    await nextFrame();
    expect(el.querySelector('.ds-split-button__menu').hasAttribute('open')).to.be.true;
    expect(chevBtn(el).getAttribute('aria-expanded')).to.equal('true');
  });
});

describe('ds-split-button — events', () => {
  it('the primary button emits ds-split-button-main', async () => {
    const el = await fixture(html`<ds-split-button label="Save"></ds-split-button>`);
    setTimeout(() => mainBtn(el).click());
    const ev = await oneEvent(el, 'ds-split-button-main');
    expect(ev).to.exist;
  });

  it('the caret emits ds-split-button-menu', async () => {
    const el = await fixture(html`<ds-split-button label="Save"></ds-split-button>`);
    setTimeout(() => chevBtn(el).click());
    const ev = await oneEvent(el, 'ds-split-button-menu');
    expect(ev).to.exist;
  });

  it('picking a menu item emits ds-split-button-menu-select with the pick detail', async () => {
    const el = await fixture(html`<ds-split-button label="Save"></ds-split-button>`);
    el.menuItems = MENU;
    await nextFrame();
    chevBtn(el).click();          /* open */
    await nextFrame();
    const item = el.querySelector('.ds-split-button__menu .ds-dropdown-menu__item');
    setTimeout(() => item.click());
    const ev = await oneEvent(el, 'ds-split-button-menu-select');
    expect(ev.detail.value).to.equal('dup');
  });
});

describe('ds-split-button — escaping', () => {
  it('renders a hostile label as literal text (no injected <img>)', async () => {
    const el = await fixture(html`<ds-split-button label="${XSS}"></ds-split-button>`);
    const span = mainBtn(el).querySelector('span');
    expect(span.querySelector('img'), 'label injected an <img>').to.not.exist;
    expect(span.textContent).to.contain('<img');
  });

  it('escapes a hostile icon name — no attribute break-out', async () => {
    const el = await fixture(html`<ds-split-button label="Save" icon='x" onload="alert(1)'></ds-split-button>`);
    await nextFrame();
    const icon = mainBtn(el).querySelector('ds-icon');
    expect(icon, 'exactly one ds-icon').to.exist;
    expect(icon.hasAttribute('onload'), 'no injected onload attribute').to.be.false;
  });
});

describe('ds-split-button — a11y', () => {
  it('is accessible', async () => {
    const el = await fixture(html`<ds-split-button label="Save"></ds-split-button>`);
    el.menuItems = MENU;
    await nextFrame();
    await expect(el).to.be.accessible({ ignoredRules: ['color-contrast'] });
  });
});

describe('ds-split-button — teardown', () => {
  it('survives disconnect → reconnect without duplicating buttons or throwing', async () => {
    const el = await fixture(html`<ds-split-button label="Save" icon="add"></ds-split-button>`);
    el.menuItems = MENU;
    await nextFrame();
    const parent = el.parentNode;
    expect(() => el.remove()).to.not.throw();
    parent.appendChild(el);
    await nextFrame();
    expect(el.querySelectorAll('[data-main]').length, 'exactly one primary button').to.equal(1);
    expect(el.querySelectorAll('[data-chev]').length, 'exactly one caret button').to.equal(1);
  });

  it('leaks no global listeners across mount → unmount', async () => {
    const t = trackListeners();
    try {
      const el = await fixture(html`<ds-split-button label="Save"></ds-split-button>`);
      el.menuItems = MENU;
      await nextFrame();
      el.remove();
      expect(t.net(), `leaked: ${JSON.stringify(t.byType())}`).to.equal(0);
    } finally {
      t.restore();
    }
  });
});
