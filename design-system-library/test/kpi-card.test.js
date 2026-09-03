/* ds-kpi-card — dashboard metric tile. Covers structure + value/label, the
   size + state enumAttrs (default | wide; default/success/warning/alert), the
   loading + clickable states, reactive attribute → DOM updates, escaping of
   value + title (the native `title` attr is captured & stripped), a11y, and
   teardown (ResizeObserver disconnected, no listener leak). */
import { fixture, html, expect, nextFrame } from '@open-wc/testing';
import '../src/components/kpi-card/kpi-card.js';
import { trackListeners } from './helpers/listeners.js';

const XSS = '<img src=x onerror=alert(1)>';
const valueEl = (el) => el.querySelector('.ds-kpi-card__value');
const labelEl = (el) => el.querySelector('.ds-kpi-card__label');

describe('ds-kpi-card — structure & content', () => {
  it('renders the component class with value + label', async () => {
    const el = await fixture(html`<ds-kpi-card value="30" title="Devices"></ds-kpi-card>`);
    expect(el.classList.contains('ds-kpi-card')).to.be.true;
    expect(valueEl(el).textContent.trim()).to.equal('30');
    expect(labelEl(el).textContent).to.equal('Devices');
  });

  it('captures + strips the native `title` attribute (no browser tooltip over the card)', async () => {
    const el = await fixture(html`<ds-kpi-card value="1" title="Servers"></ds-kpi-card>`);
    expect(el.hasAttribute('title'), 'title attribute stripped off the host').to.be.false;
    expect(labelEl(el).textContent).to.equal('Servers');
  });

  it('renders a subtitle/description when present', async () => {
    const el = await fixture(html`<ds-kpi-card value="1" title="X" subtitle="Connected in 24h"></ds-kpi-card>`);
    expect(el.querySelector('.ds-kpi-card__description').textContent).to.equal('Connected in 24h');
  });
});

describe('ds-kpi-card — size (default | wide)', () => {
  it('defaults to the default size class', async () => {
    const el = await fixture(html`<ds-kpi-card value="1" title="X"></ds-kpi-card>`);
    expect(el.classList.contains('ds-kpi-card--default')).to.be.true;
    expect(el.querySelector('.ds-kpi-card__default')).to.exist;
  });

  it('renders the wide layout', async () => {
    const el = await fixture(html`<ds-kpi-card size="wide" value="1" title="X"></ds-kpi-card>`);
    expect(el.classList.contains('ds-kpi-card--wide')).to.be.true;
    expect(el.querySelector('.ds-kpi-card__wide')).to.exist;
  });
});

describe('ds-kpi-card — state (enumAttr)', () => {
  it('defaults to the default state', async () => {
    const el = await fixture(html`<ds-kpi-card value="1" title="X"></ds-kpi-card>`);
    expect(el.classList.contains('ds-kpi-card--default')).to.be.true;
  });

  it('applies a valid state class', async () => {
    const el = await fixture(html`<ds-kpi-card state="alert" value="1" title="X"></ds-kpi-card>`);
    expect(el.classList.contains('ds-kpi-card--alert')).to.be.true;
  });

  it('falls back to default on an invalid state', async () => {
    const el = await fixture(html`<ds-kpi-card state="bogus" value="1" title="X"></ds-kpi-card>`);
    expect(el.classList.contains('ds-kpi-card--default')).to.be.true;
  });
});

describe('ds-kpi-card — loading', () => {
  it('sets aria-busy + the loading class and blanks the value', async () => {
    const el = await fixture(html`<ds-kpi-card loading value="30" title="Devices"></ds-kpi-card>`);
    expect(el.classList.contains('ds-kpi-card--loading')).to.be.true;
    expect(el.getAttribute('aria-busy')).to.equal('true');
    expect(valueEl(el).textContent.trim()).to.equal('');
  });

  it('clears aria-busy when loading is removed', async () => {
    const el = await fixture(html`<ds-kpi-card loading value="30" title="X"></ds-kpi-card>`);
    el.removeAttribute('loading');
    await nextFrame();
    expect(el.hasAttribute('aria-busy')).to.be.false;
    expect(el.classList.contains('ds-kpi-card--loading')).to.be.false;
  });
});

describe('ds-kpi-card — clickable', () => {
  it('exposes button semantics (role/tabindex/aria-label) when clickable', async () => {
    const el = await fixture(html`<ds-kpi-card clickable value="30" title="Devices"></ds-kpi-card>`);
    expect(el.getAttribute('role')).to.equal('button');
    expect(el.getAttribute('tabindex')).to.equal('0');
    expect(el.getAttribute('aria-label')).to.equal('Devices, 30');
    expect(el.classList.contains('ds-kpi-card--clickable')).to.be.true;
  });

  it('emits ds-kpi-card-select on click when clickable', async () => {
    const el = await fixture(html`<ds-kpi-card clickable value="30" title="Devices"></ds-kpi-card>`);
    let detail = null;
    el.addEventListener('ds-kpi-card-select', (e) => (detail = e.detail));
    el.click();
    await nextFrame();
    expect(detail, 'select event fired').to.exist;
    expect(detail.source).to.equal('card');
  });

  it('drops button semantics when clickable is removed', async () => {
    const el = await fixture(html`<ds-kpi-card clickable value="1" title="X"></ds-kpi-card>`);
    el.removeAttribute('clickable');
    await nextFrame();
    expect(el.hasAttribute('role')).to.be.false;
    expect(el.hasAttribute('tabindex')).to.be.false;
  });
});

describe('ds-kpi-card — reactivity', () => {
  it('updates the value when the value attribute changes', async () => {
    const el = await fixture(html`<ds-kpi-card value="30" title="X"></ds-kpi-card>`);
    el.setAttribute('value', '42');
    await nextFrame();
    expect(valueEl(el).textContent.trim()).to.equal('42');
  });

  it('updates the label when the title changes', async () => {
    const el = await fixture(html`<ds-kpi-card value="1" title="Old"></ds-kpi-card>`);
    el.setAttribute('title', 'New');
    await nextFrame();
    expect(labelEl(el).textContent).to.equal('New');
  });
});

describe('ds-kpi-card — escaping', () => {
  it('renders a hostile value as literal text', async () => {
    const el = await fixture(html`<ds-kpi-card value="${XSS}" title="X"></ds-kpi-card>`);
    expect(valueEl(el).querySelector('img'), 'no injected <img> in value').to.not.exist;
    expect(valueEl(el).textContent).to.contain('<img');
  });

  it('renders a hostile title/label as literal text', async () => {
    const el = await fixture(html`<ds-kpi-card value="1" title="${XSS}"></ds-kpi-card>`);
    expect(labelEl(el).querySelector('img')).to.not.exist;
    expect(labelEl(el).textContent).to.contain('<img');
  });
});

describe('ds-kpi-card — a11y', () => {
  it('is accessible as a static tile', async () => {
    const el = await fixture(html`<ds-kpi-card value="30" title="Devices" subtitle="Connected in 24h"></ds-kpi-card>`);
    await expect(el).to.be.accessible({ ignoredRules: ['color-contrast'] });
  });

  it('is accessible as a clickable tile', async () => {
    const el = await fixture(html`<ds-kpi-card clickable value="30" title="Devices"></ds-kpi-card>`);
    await expect(el).to.be.accessible({ ignoredRules: ['color-contrast'] });
  });
});

describe('ds-kpi-card — teardown', () => {
  it('connect → disconnect leaves no leaked global listeners', async () => {
    const t = trackListeners();
    const el = await fixture(html`<ds-kpi-card clickable value="30" title="Devices"></ds-kpi-card>`);
    el.remove();
    t.restore();
    expect(t.net(), JSON.stringify(t.byType())).to.equal(0);
    expect(el.isConnected).to.be.false;
  });

  it('survives disconnect → reconnect without duplicating the body', async () => {
    const el = await fixture(html`<ds-kpi-card value="30" title="Devices"></ds-kpi-card>`);
    const parent = el.parentNode;
    el.remove();
    parent.appendChild(el);
    await nextFrame();
    expect(el.querySelectorAll('.ds-kpi-card__default').length).to.equal(1);
    expect(valueEl(el).textContent.trim()).to.equal('30');
  });
});
