/* ds-right-pane — the 48px utility rail. Covers the default top/bottom lists +
   theme toggle, the `topItems`/`bottomItems` custom model, active state, escaping
   of item label (aria-label) + icon name, the select + theme events, and teardown
   (disconnect must null the ResizeObserver / theme MutationObserver and remove the
   body-portaled ⋮ overflow ds-dropdown-menu — no orphan left in document.body). */
import { fixture, html, expect, oneEvent, nextFrame } from '@open-wc/testing';
import '../src/components/right-pane/right-pane.js';

const XSS = '"><img src=x onerror=alert(1)>';
const rail = (el) => el.querySelector('.ds-right-pane');
const btns = (el) => [...el.querySelectorAll('.ds-right-pane__top .ds-right-pane__btn, .ds-right-pane__bottom .ds-right-pane__btn')];

describe('ds-right-pane — structure', () => {
  it('renders the top + bottom lists and a theme toggle by default', async () => {
    const el = await fixture(html`<ds-right-pane></ds-right-pane>`);
    await nextFrame();
    expect(rail(el), 'rail root missing').to.exist;
    expect(el.querySelector('.ds-right-pane__top')).to.exist;
    expect(el.querySelector('.ds-right-pane__bottom')).to.exist;
    expect(el.querySelector('[data-id="__theme__"]'), 'theme toggle present by default').to.exist;
  });

  it('hide-theme-toggle removes the theme toggle', async () => {
    const el = await fixture(html`<ds-right-pane hide-theme-toggle></ds-right-pane>`);
    await nextFrame();
    expect(el.querySelector('[data-id="__theme__"]')).to.not.exist;
  });
});

describe('ds-right-pane — custom items', () => {
  it('renders one plain rail button per topItems entry', async () => {
    const el = await fixture(html`<ds-right-pane hide-theme-toggle></ds-right-pane>`);
    el.topItems = [{ id: 'a', icon: 'home', label: 'Home' }, { id: 'b', icon: 'help-circle', label: 'Help' }];
    el.bottomItems = [];
    await nextFrame();
    const top = [...el.querySelectorAll('.ds-right-pane__top .ds-right-pane__btn')];
    expect(top.map((b) => b.dataset.id)).to.deep.equal(['a', 'b']);
    expect(top[0].querySelector('ds-icon').getAttribute('name')).to.equal('home');
  });

  it('renders a ds-icon-button when the item declares a `button` slot', async () => {
    const el = await fixture(html`<ds-right-pane hide-theme-toggle></ds-right-pane>`);
    el.topItems = [{ id: 'mob', icon: 'mobile', label: 'Mobile', button: 'tertiary-grey' }];
    el.bottomItems = [];
    await nextFrame();
    const ib = el.querySelector('.ds-right-pane__ib');
    expect(ib, 'ds-icon-button not rendered').to.exist;
    expect(ib.tagName.toLowerCase()).to.equal('ds-icon-button');
    expect(ib.dataset.id).to.equal('mob');
  });

  it('marks an active plain item with aria-pressed', async () => {
    const el = await fixture(html`<ds-right-pane hide-theme-toggle></ds-right-pane>`);
    el.topItems = [{ id: 'a', icon: 'home', label: 'Home', active: true }];
    el.bottomItems = [];
    await nextFrame();
    const b = el.querySelector('.ds-right-pane__btn[data-id="a"]');
    expect(b.getAttribute('aria-pressed')).to.equal('true');
  });
});

describe('ds-right-pane — escaping', () => {
  it('escapes an item label into aria-label without injecting a node', async () => {
    const el = await fixture(html`<ds-right-pane hide-theme-toggle></ds-right-pane>`);
    el.topItems = [{ id: 'a', icon: 'home', label: XSS }];
    el.bottomItems = [];
    await nextFrame();
    const b = el.querySelector('.ds-right-pane__btn[data-id="a"]');
    expect(el.querySelector('img[onerror]'), 'label injected an <img>').to.not.exist;
    expect(b.getAttribute('aria-label')).to.contain('<img');
  });

  it('escapes a hostile icon name', async () => {
    const el = await fixture(html`<ds-right-pane hide-theme-toggle></ds-right-pane>`);
    el.topItems = [{ id: 'a', icon: XSS, label: 'Safe' }];
    el.bottomItems = [];
    await nextFrame();
    const icon = el.querySelector('.ds-right-pane__btn[data-id="a"] ds-icon');
    expect(el.querySelector('img[onerror]'), 'icon name injected an <img>').to.not.exist;
    expect(icon.getAttribute('name')).to.contain('<img');
  });
});

describe('ds-right-pane — events', () => {
  it('emits ds-right-pane-select with the item id on click', async () => {
    const el = await fixture(html`<ds-right-pane hide-theme-toggle></ds-right-pane>`);
    el.topItems = [{ id: 'help', icon: 'help-circle', label: 'Help' }];
    el.bottomItems = [];
    await nextFrame();
    const b = el.querySelector('.ds-right-pane__btn[data-id="help"]');
    setTimeout(() => b.click());
    const ev = await oneEvent(el, 'ds-right-pane-select');
    expect(ev.detail.id).to.equal('help');
  });

  it('emits ds-right-pane-theme when the theme toggle is clicked', async () => {
    const el = await fixture(html`<ds-right-pane></ds-right-pane>`);
    await nextFrame();
    const toggle = el.querySelector('[data-id="__theme__"]');
    setTimeout(() => toggle.click());
    const ev = await oneEvent(el, 'ds-right-pane-theme');
    expect(ev.detail.theme).to.be.oneOf(['light', 'dark']);
  });
});

describe('ds-right-pane — teardown', () => {
  it('disconnect nulls the observers and does not throw', async () => {
    const el = await fixture(html`<ds-right-pane></ds-right-pane>`);
    await nextFrame();
    expect(() => el.remove()).to.not.throw();
    expect(el._ro, 'ResizeObserver not released').to.equal(null);
    expect(el._themeMo, 'theme MutationObserver not released').to.equal(null);
  });

  it('removes the body-portaled overflow menu on disconnect', async () => {
    const el = await fixture(html`<ds-right-pane></ds-right-pane>`);
    await nextFrame();
    /* Force the ⋮ overflow menu to exist (it is normally created lazily on
       overflow) and confirm it is portaled to <body>, then that disconnect
       reclaims it. */
    el._ensureMenu();
    expect(document.querySelector('.ds-right-pane__overflow-dd'), 'menu should be portaled to body').to.exist;
    el.remove();
    expect(document.querySelector('.ds-right-pane__overflow-dd'), 'portaled menu leaked').to.not.exist;
    expect(el._menu).to.equal(null);
  });
});
