/* ds-module-rail — vertical module rail. Data-driven via the `items` property.
   Covers structure/default classes, item + more-button a11y, escaped labels,
   the select event, and disconnect cleanup of the body-portaled hover menu. */
import { fixture, html, expect, nextFrame, oneEvent } from '@open-wc/testing';
import '../src/components/module-rail/module-rail.js';

const XSS = '<img src=x onerror=alert(1)>';
const ITEMS = [
  { id: 'home', label: 'Home', icon: 'home', active: true },
  { id: 'inv', label: 'Inventory', icon: 'layers' },
];

describe('ds-module-rail — structure', () => {
  it('has the component class and renders one button per item plus the more button', async () => {
    const el = await fixture(html`<ds-module-rail></ds-module-rail>`);
    el.items = ITEMS;
    await nextFrame();
    expect(el.classList.contains('ds-module-rail')).to.be.true;
    expect(el.querySelectorAll('.ds-module-rail__item').length).to.equal(2);
    expect(el.querySelector('.ds-module-rail__more')).to.exist;
  });

  it('toggles the icons-only class from the attribute', async () => {
    const el = await fixture(html`<ds-module-rail icons-only></ds-module-rail>`);
    el.items = ITEMS;
    await nextFrame();
    expect(el.classList.contains('ds-module-rail--icons')).to.be.true;
  });
});

describe('ds-module-rail — a11y', () => {
  it('gives each item an aria-label and marks the active one aria-current', async () => {
    const el = await fixture(html`<ds-module-rail></ds-module-rail>`);
    el.items = ITEMS;
    await nextFrame();
    const first = el.querySelector('.ds-module-rail__item');
    expect(first.getAttribute('aria-label')).to.equal('Home');
    expect(first.getAttribute('aria-current')).to.equal('page');
    const second = el.querySelectorAll('.ds-module-rail__item')[1];
    expect(second.hasAttribute('aria-current')).to.be.false;
  });

  it('exposes the more button as a popup trigger', async () => {
    const el = await fixture(html`<ds-module-rail></ds-module-rail>`);
    el.items = ITEMS;
    await nextFrame();
    const more = el.querySelector('.ds-module-rail__more');
    expect(more.getAttribute('aria-haspopup')).to.equal('true');
    expect(more.getAttribute('aria-expanded')).to.equal('false');
  });
});

describe('ds-module-rail — escaping', () => {
  it('renders a hostile item label as literal text (span + aria-label)', async () => {
    const el = await fixture(html`<ds-module-rail></ds-module-rail>`);
    el.items = [{ id: 'x', label: XSS, icon: 'home' }];
    await nextFrame();
    const lbl = el.querySelector('.ds-module-rail__lbl');
    expect(lbl.querySelector('img'), 'label injected an <img>').to.not.exist;
    expect(lbl.textContent).to.contain('<img');
    const btn = el.querySelector('.ds-module-rail__item');
    expect(btn.getAttribute('aria-label')).to.contain('<img');
  });
});

describe('ds-module-rail — selection', () => {
  it('clicking an item fires ds-module-rail-select with the id + item', async () => {
    const el = await fixture(html`<ds-module-rail></ds-module-rail>`);
    el.items = ITEMS;
    await nextFrame();
    const second = el.querySelectorAll('.ds-module-rail__item')[1];
    setTimeout(() => second.click());
    const ev = await oneEvent(el, 'ds-module-rail-select');
    expect(ev.detail.id).to.equal('inv');
    expect(ev.detail.item.label).to.equal('Inventory');
  });

  it('setActive moves aria-current without firing an event', async () => {
    const el = await fixture(html`<ds-module-rail></ds-module-rail>`);
    el.items = ITEMS;
    await nextFrame();
    let fired = 0;
    el.addEventListener('ds-module-rail-select', () => (fired += 1));
    el.setActive('inv');
    await nextFrame();
    const second = el.querySelectorAll('.ds-module-rail__item')[1];
    expect(second.getAttribute('aria-current')).to.equal('page');
    expect(fired).to.equal(0);
  });
});

describe('ds-module-rail — teardown', () => {
  it('removes the body-portaled hover menu on disconnect', async () => {
    const el = await fixture(html`<ds-module-rail icons-only></ds-module-rail>`);
    el.items = ITEMS;
    await nextFrame();
    el._openMenu();
    await nextFrame();
    expect(document.querySelector('.ds-module-rail__menu'), 'menu portaled to <body>').to.exist;
    el.remove();
    expect(document.querySelector('.ds-module-rail__menu'), 'portaled menu removed on disconnect').to.not.exist;
  });

  it('survives disconnect without throwing', async () => {
    const el = await fixture(html`<ds-module-rail></ds-module-rail>`);
    el.items = ITEMS;
    await nextFrame();
    expect(() => el.remove()).to.not.throw();
  });
});

describe('ds-module-rail — repaint-split', () => {
  it('keeps each item ds-icon across a visual-only icons-only change (not re-parsed)', async () => {
    const el = await fixture(html`<ds-module-rail></ds-module-rail>`);
    el.items = ITEMS;
    await nextFrame();
    const icon = el.querySelector('.ds-module-rail__item .ds-module-rail__ic');
    expect(icon, 'item ds-icon present').to.exist;
    el.setAttribute('icons-only', '');
    await nextFrame();
    expect(el.querySelector('.ds-module-rail__item .ds-module-rail__ic'), 'same ds-icon node (not re-parsed)').to.equal(icon);
    expect(el.classList.contains('ds-module-rail--icons'), 'icons-only class applied').to.be.true;
  });
});
