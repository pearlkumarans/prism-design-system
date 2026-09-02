/* ds-status-indicator — a dot (or replacement icon) + label inside a plain
   <span> root. Covers the structure, spec defaults (neutral/small), the
   icon-replaces-dot rule, the dot-only aria-label fallback, and label escaping. */
import { fixture, html, expect, nextFrame } from '@open-wc/testing';
import '../src/components/status-indicator/status-indicator.js';

const XSS = '<img src=x onerror=alert(1)>';
const root = (el) => el.querySelector('span.ds-status-indicator');
const label = (el) => el.querySelector('.ds-status-indicator__label');
const dot = (el) => el.querySelector('.ds-status-indicator__dot');

describe('ds-status-indicator — structure & defaults', () => {
  it('renders a root span with a dot and a label', async () => {
    const el = await fixture(html`<ds-status-indicator label="Online"></ds-status-indicator>`);
    expect(root(el), 'root span missing').to.exist;
    expect(dot(el), 'dot missing').to.exist;
    expect(label(el).textContent).to.equal('Online');
  });

  it('applies the spec default classes (neutral / small)', async () => {
    const el = await fixture(html`<ds-status-indicator label="X"></ds-status-indicator>`);
    expect(root(el).classList.contains('ds-status-indicator--neutral')).to.be.true;
    expect(root(el).classList.contains('ds-status-indicator--small')).to.be.true;
  });

  it('uses slotted text as the label', async () => {
    const el = await fixture(html`<ds-status-indicator>Degraded</ds-status-indicator>`);
    expect(label(el).textContent).to.equal('Degraded');
  });

  it('reflects supplied status/size and toggles disabled/interactive classes', async () => {
    const el = await fixture(html`<ds-status-indicator status="success" size="large" disabled interactive label="Up"></ds-status-indicator>`);
    expect(root(el).classList.contains('ds-status-indicator--success')).to.be.true;
    expect(root(el).classList.contains('ds-status-indicator--large')).to.be.true;
    expect(root(el).classList.contains('ds-status-indicator--disabled')).to.be.true;
    expect(root(el).classList.contains('ds-status-indicator--interactive')).to.be.true;
  });

  it('falls back to defaults on invalid enums', async () => {
    const el = await fixture(html`<ds-status-indicator status="bogus" size="huge" label="X"></ds-status-indicator>`);
    expect(root(el).classList.contains('ds-status-indicator--neutral')).to.be.true;
    expect(root(el).classList.contains('ds-status-indicator--small')).to.be.true;
  });
});

describe('ds-status-indicator — icon, dot-only a11y & escaping', () => {
  it('an icon replaces the dot', async () => {
    const el = await fixture(html`<ds-status-indicator icon="check" label="Done"></ds-status-indicator>`);
    expect(dot(el), 'dot should be replaced by icon').to.not.exist;
    const icon = el.querySelector('.ds-status-indicator__icon ds-icon');
    expect(icon).to.exist;
    expect(icon.getAttribute('name')).to.equal('check');
  });

  it('dot-only mode (show-label="false") hides the label and sets aria-label', async () => {
    const el = await fixture(html`<ds-status-indicator label="Online" show-label="false"></ds-status-indicator>`);
    expect(label(el), 'label hidden').to.not.exist;
    expect(root(el).getAttribute('aria-label')).to.equal('Online');
  });

  it('escapes a hostile label — no <img> injected', async () => {
    const el = await fixture(html`<ds-status-indicator label="${XSS}"></ds-status-indicator>`);
    await nextFrame();
    expect(el.querySelector('img')).to.not.exist;
    expect(label(el).textContent).to.contain('<img');
  });

  it('escapes a hostile icon name — no attribute breakout', async () => {
    const el = await fixture(html`<ds-status-indicator icon='x" onload="alert(1)' label="X"></ds-status-indicator>`);
    await nextFrame();
    const icon = el.querySelector('.ds-status-indicator__icon ds-icon');
    expect(icon).to.exist;
    expect(icon.hasAttribute('onload')).to.be.false;
  });
});
