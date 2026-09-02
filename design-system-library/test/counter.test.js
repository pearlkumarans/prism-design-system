/* ds-counter — a numeric pill. Renders one `.ds-counter__value` span whose
   text comes from the `value` attribute (set via textContent, so injection is a
   non-event). Covers the spec defaults (subtle/active/small, NOT medium), the
   overflow cap, the aria-label fallback, the value proxy, and rtl mirroring. */
import { fixture, html, expect, nextFrame } from '@open-wc/testing';
import '../src/components/counter/counter.js';

const XSS = '<img src=x onerror=alert(1)>';
const valueEl = (el) => el.querySelector('.ds-counter__value');

describe('ds-counter — structure & defaults', () => {
  it('renders a single .ds-counter__value span', async () => {
    const el = await fixture(html`<ds-counter value="7"></ds-counter>`);
    expect(valueEl(el), 'value span missing').to.exist;
    expect(valueEl(el).textContent).to.equal('7');
  });

  it('applies the spec default classes (subtle / active / small)', async () => {
    const el = await fixture(html`<ds-counter value="1"></ds-counter>`);
    expect(el.classList.contains('ds-counter--subtle')).to.be.true;
    expect(el.classList.contains('ds-counter--active')).to.be.true;
    expect(el.classList.contains('ds-counter--small')).to.be.true;
  });

  it('captures slotted text as the value when no value attribute is set', async () => {
    const el = await fixture(html`<ds-counter>142</ds-counter>`);
    expect(el.getAttribute('value')).to.equal('142');
    expect(valueEl(el).textContent).to.equal('142');
  });
});

describe('ds-counter — enums & overflow', () => {
  it('reflects supplied variant/state/size', async () => {
    const el = await fixture(html`<ds-counter variant="intense" state="critical" size="large" value="3"></ds-counter>`);
    expect(el.classList.contains('ds-counter--intense')).to.be.true;
    expect(el.classList.contains('ds-counter--critical')).to.be.true;
    expect(el.classList.contains('ds-counter--large')).to.be.true;
  });

  it('falls back to defaults on invalid enum values', async () => {
    const el = await fixture(html`<ds-counter variant="bogus" state="nope" value="1"></ds-counter>`);
    expect(el.classList.contains('ds-counter--subtle')).to.be.true;
    expect(el.classList.contains('ds-counter--active')).to.be.true;
  });

  it('caps the display at "{max}+" when value exceeds max', async () => {
    const el = await fixture(html`<ds-counter value="150" max="99"></ds-counter>`);
    expect(valueEl(el).textContent).to.equal('99+');
  });

  it('shows the raw value when at or below max', async () => {
    const el = await fixture(html`<ds-counter value="42" max="99"></ds-counter>`);
    expect(valueEl(el).textContent).to.equal('42');
  });
});

describe('ds-counter — a11y, reactivity & injection', () => {
  it('falls back aria-label to the value when none supplied', async () => {
    const el = await fixture(html`<ds-counter value="9"></ds-counter>`);
    expect(el.getAttribute('aria-label')).to.equal('9');
  });

  it('updates the display reactively via the value setter', async () => {
    const el = await fixture(html`<ds-counter value="1"></ds-counter>`);
    el.value = 5;
    await nextFrame();
    expect(el.getAttribute('value')).to.equal('5');
    expect(valueEl(el).textContent).to.equal('5');
  });

  it('mirrors rtl onto the host as dir="rtl"', async () => {
    const el = await fixture(html`<ds-counter value="1" rtl></ds-counter>`);
    expect(el.getAttribute('dir')).to.equal('rtl');
    el.removeAttribute('rtl');
    await nextFrame();
    expect(el.hasAttribute('dir')).to.be.false;
  });

  it('renders a hostile value as text — no <img> injected', async () => {
    const el = await fixture(html`<ds-counter value="${XSS}"></ds-counter>`);
    await nextFrame();
    expect(el.querySelector('img')).to.not.exist;
    expect(valueEl(el).textContent).to.contain('<img');
  });
});
