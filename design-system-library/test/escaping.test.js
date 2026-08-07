/* Consistency escaping sweep — data-derived labels/values across nav, sidebar,
   tooltip, and kpi surfaces must render as text, never as HTML. Also guards
   against double-escaping (a plain "&" must stay "&", not become "&amp;"). */
import { fixture, html, expect, nextFrame } from '@open-wc/testing';
import '../src/components/tooltip/tooltip.js';
import '../src/components/sidebar-l1/sidebar-l1.js';
import '../src/components/sidebar-l2/sidebar-l2.js';
import '../src/components/kpi-card/kpi-card.js';
import '../src/components/header-nav/header-nav.js';

const XSS = '<img src=x onerror=alert(1)>';

describe('escaping sweep — labels render as text', () => {
  it('ds-tooltip escapes its text', async () => {
    const el = await fixture(html`<ds-tooltip text="${XSS}"><button>trigger</button></ds-tooltip>`);
    await nextFrame();
    const span = el._tip.querySelector('.ds-tooltip__text');
    expect(span.querySelector('img'), 'tooltip text injected an <img>').to.not.exist;
    expect(span.textContent).to.contain('<img');
  });

  it('ds-sidebar-l1 escapes item labels', async () => {
    const el = await fixture(html`<ds-sidebar-l1></ds-sidebar-l1>`);
    el.items = [{ id: 'a', label: XSS, icon: 'home' }];
    await nextFrame();
    expect(el.querySelector('.ds-sidebar-l1__label-text img')).to.not.exist;
    expect(el.querySelector('.ds-sidebar-l1__label-text').textContent).to.contain('<img');
  });

  it('ds-sidebar-l2 escapes item labels', async () => {
    const el = await fixture(html`<ds-sidebar-l2></ds-sidebar-l2>`);
    el.groups = [{ type: 'item', id: 'a', label: XSS }];
    await nextFrame();
    expect(el.querySelector('.ds-sidebar-l2__item-label img')).to.not.exist;
    expect(el.querySelector('.ds-sidebar-l2__item-label').textContent).to.contain('<img');
  });

  it('ds-header-nav escapes tab labels', async () => {
    const el = await fixture(html`<ds-header-nav variant="endpoint-central"></ds-header-nav>`);
    el.tabs = [{ id: 'x', label: XSS, active: true }];
    await nextFrame();
    const tab = el.querySelector('.ds-header-nav__tab');
    expect(tab.querySelector('img')).to.not.exist;
    expect(tab.textContent).to.contain('<img');
  });

  it('ds-kpi-card escapes label and value', async () => {
    const el = await fixture(html`<ds-kpi-card label="${XSS}" value="<b>9</b>"></ds-kpi-card>`);
    await nextFrame();
    expect(el.querySelector('.ds-kpi-card__label img'), 'label injected').to.not.exist;
    expect(el.querySelector('.ds-kpi-card__value b'), 'value injected').to.not.exist;
  });

  it('does not double-escape a plain ampersand', async () => {
    const el = await fixture(html`<ds-header-nav variant="endpoint-central"></ds-header-nav>`);
    el.tabs = [{ id: 'x', label: 'R&D', active: true }];
    await nextFrame();
    expect(el.querySelector('.ds-header-nav__tab').textContent.trim()).to.equal('R&D');
  });
});
