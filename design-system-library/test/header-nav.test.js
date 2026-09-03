/* ds-header-nav — product chrome / top bar. Covers structure (brand + product
   name), the variant enumAttr default + fallback, right-cluster show-* toggles,
   customer-label + user-initials rendering AND reactive update, product-name
   escaping, RTL, a11y, and teardown (the single document click listener is
   released — no leak). */
import { fixture, html, expect, nextFrame } from '@open-wc/testing';
import '../src/components/header-nav/header-nav.js';
import { trackListeners } from './helpers/listeners.js';

const XSS = '<img src=x onerror=alert(1)>';
const product = (el) => el.querySelector('.ds-header-nav__product');
const customerLabel = (el) => el.querySelector('.ds-header-nav__customer-label');
const avatarEl = (el) => el.querySelector('.ds-header-nav__avatar ds-avatar');

describe('ds-header-nav — structure & role', () => {
  it('renders the component class, banner role and the brand product name', async () => {
    const el = await fixture(html`<ds-header-nav></ds-header-nav>`);
    expect(el.classList.contains('ds-header-nav')).to.be.true;
    expect(el.getAttribute('role')).to.equal('banner');
    expect(el.querySelector('.ds-header-nav__brand')).to.exist;
    expect(product(el).textContent).to.equal('Endpoint Central');
  });

  it('honours a custom product-name', async () => {
    const el = await fixture(html`<ds-header-nav product-name="My Console"></ds-header-nav>`);
    expect(product(el).textContent).to.equal('My Console');
  });
});

describe('ds-header-nav — variant (enumAttr)', () => {
  it('defaults to endpoint-central', async () => {
    const el = await fixture(html`<ds-header-nav></ds-header-nav>`);
    expect(el.dataset.variant).to.equal('endpoint-central');
  });

  it('falls back to endpoint-central on an invalid variant', async () => {
    const el = await fixture(html`<ds-header-nav variant="bogus"></ds-header-nav>`);
    expect(el.dataset.variant).to.equal('endpoint-central');
  });

  it('honours a valid variant and maps its product name', async () => {
    const el = await fixture(html`<ds-header-nav variant="patch-manager-plus"></ds-header-nav>`);
    expect(el.dataset.variant).to.equal('patch-manager-plus');
    expect(product(el).textContent).to.equal('Patch Manager Plus');
  });
});

describe('ds-header-nav — right-cluster toggles', () => {
  it('shows utility icons (settings) by default and hides on ="false"', async () => {
    const on = await fixture(html`<ds-header-nav></ds-header-nav>`);
    expect(on.querySelector('[data-action="settings"]'), 'settings on by default').to.exist;
    const off = await fixture(html`<ds-header-nav show-settings="false"></ds-header-nav>`);
    expect(off.querySelector('[data-action="settings"]'), 'settings hidden').to.not.exist;
  });

  it('hides the avatar when show-avatar="false"', async () => {
    const el = await fixture(html`<ds-header-nav show-avatar="false"></ds-header-nav>`);
    expect(avatarEl(el)).to.not.exist;
  });

  it('customer selector is opt-in on non-MSP variants; default-on for MSP', async () => {
    const plain = await fixture(html`<ds-header-nav></ds-header-nav>`);
    expect(customerLabel(plain), 'off by default on endpoint-central').to.not.exist;
    const msp = await fixture(html`<ds-header-nav variant="endpoint-central-msp"></ds-header-nav>`);
    expect(customerLabel(msp), 'on by default for MSP').to.exist;
  });
});

describe('ds-header-nav — customer-label', () => {
  it('renders the default customer label when the selector is enabled', async () => {
    const el = await fixture(html`<ds-header-nav show-customer-selector></ds-header-nav>`);
    expect(customerLabel(el).textContent).to.equal('All Customers');
  });

  it('renders a custom customer-label and updates it reactively', async () => {
    const el = await fixture(html`<ds-header-nav show-customer-selector customer-label="Head Office"></ds-header-nav>`);
    expect(customerLabel(el).textContent).to.equal('Head Office');
    el.setAttribute('customer-label', 'Remote Office');
    await nextFrame();
    expect(customerLabel(el).textContent).to.equal('Remote Office');
  });
});

describe('ds-header-nav — user-initials', () => {
  it('renders a default avatar initial set and honours user-initials', async () => {
    const bare = await fixture(html`<ds-header-nav></ds-header-nav>`);
    expect(avatarEl(bare).getAttribute('name')).to.equal('AM');
    const named = await fixture(html`<ds-header-nav user-initials="KV"></ds-header-nav>`);
    expect(avatarEl(named).getAttribute('name')).to.equal('KV');
  });

  it('updates the avatar initials reactively', async () => {
    const el = await fixture(html`<ds-header-nav user-initials="KV"></ds-header-nav>`);
    el.setAttribute('user-initials', 'ZZ');
    await nextFrame();
    expect(avatarEl(el).getAttribute('name')).to.equal('ZZ');
  });
});

describe('ds-header-nav — RTL & escaping', () => {
  it('mirrors via dir="rtl" and clears it when removed', async () => {
    const el = await fixture(html`<ds-header-nav rtl></ds-header-nav>`);
    expect(el.getAttribute('dir')).to.equal('rtl');
    el.removeAttribute('rtl');
    await nextFrame();
    expect(el.hasAttribute('dir')).to.be.false;
  });

  it('renders a hostile product-name as literal text, never HTML', async () => {
    const el = await fixture(html`<ds-header-nav product-name="${XSS}"></ds-header-nav>`);
    expect(product(el).querySelector('img'), 'no injected <img> in product name').to.not.exist;
    expect(product(el).textContent).to.contain('<img');
  });

  it('renders a hostile customer-label as literal text', async () => {
    const el = await fixture(html`<ds-header-nav show-customer-selector customer-label="${XSS}"></ds-header-nav>`);
    expect(customerLabel(el).querySelector('img')).to.not.exist;
    expect(customerLabel(el).textContent).to.contain('<img');
  });
});

describe('ds-header-nav — a11y', () => {
  it('is accessible', async () => {
    const el = await fixture(html`<ds-header-nav variant="endpoint-central-msp"></ds-header-nav>`);
    await nextFrame();
    await expect(el).to.be.accessible({ ignoredRules: ['color-contrast'] });
  });
});

describe('ds-header-nav — teardown', () => {
  it('connect → disconnect releases the document click listener (no leak)', async () => {
    const t = trackListeners();
    const el = await fixture(html`<ds-header-nav></ds-header-nav>`);
    el.remove();
    t.restore();
    expect(t.net(), JSON.stringify(t.byType())).to.equal(0);
    expect(el.isConnected).to.be.false;
  });

  it('survives disconnect → reconnect without throwing', async () => {
    const el = await fixture(html`<ds-header-nav></ds-header-nav>`);
    const parent = el.parentNode;
    el.remove();
    parent.appendChild(el);
    await nextFrame();
    expect(el.querySelectorAll('.ds-header-nav__brand').length).to.equal(1);
  });
});
