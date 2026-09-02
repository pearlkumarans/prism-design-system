/* ds-search-field — a search-specialized text input. Covers the enumAttr size
   default (small) + fallback, the value ↔ input round-trip (attribute + property),
   the derived filled state + clear button, the input/submit/clear events, the
   escaped shortcut-label sink, disabled/error ARIA, and a disconnect→reconnect.
   NOTE: its leading glyph is an inline <use href> SVG (not <ds-icon>), so no icon
   element is asserted. */
import { fixture, html, expect, oneEvent, nextFrame } from '@open-wc/testing';
import '../src/components/search-field/search-field.js';

const XSS = '"><img src=x onerror=alert(1)>';
const root = (el) => el.querySelector('.ds-search-field');
const input = (el) => el.querySelector('[data-input]');

describe('ds-search-field — structure & enum defaults', () => {
  it('renders the field with the default size (small) class and a search input', async () => {
    const el = await fixture(html`<ds-search-field></ds-search-field>`);
    await nextFrame();
    expect(root(el)).to.exist;
    expect(root(el).classList.contains('ds-search-field--small')).to.be.true;
    expect(input(el).getAttribute('type')).to.equal('search');
  });

  it('falls back to the default size on an invalid value (enumAttr)', async () => {
    const el = await fixture(html`<ds-search-field size="bogus"></ds-search-field>`);
    await nextFrame();
    expect(root(el).classList.contains('ds-search-field--small')).to.be.true;
  });
});

describe('ds-search-field — value round-trip & filled state', () => {
  it('reflects the value attribute into the input and derives the filled state', async () => {
    const el = await fixture(html`<ds-search-field value="metrics"></ds-search-field>`);
    await nextFrame();
    expect(el.value).to.equal('metrics');
    expect(input(el).value).to.equal('metrics');
    expect(root(el).classList.contains('ds-search-field--filled')).to.be.true;
  });

  it('round-trips a value set via the property', async () => {
    const el = await fixture(html`<ds-search-field></ds-search-field>`);
    el.value = 'foo';
    await nextFrame();
    expect(el.value).to.equal('foo');
    expect(input(el).value).to.equal('foo');
    expect(el.getAttribute('value')).to.equal('foo');
  });

  it('shows a Clear button in the filled state', async () => {
    const el = await fixture(html`<ds-search-field value="x"></ds-search-field>`);
    await nextFrame();
    expect(el.querySelector('[data-clear]')).to.exist;
  });
});

describe('ds-search-field — events', () => {
  it('fires ds-search-field-input on typing', async () => {
    const el = await fixture(html`<ds-search-field></ds-search-field>`);
    await nextFrame();
    input(el).value = 'abc';
    setTimeout(() => input(el).dispatchEvent(new Event('input', { bubbles: true })));
    const ev = await oneEvent(el, 'ds-search-field-input');
    expect(ev.detail.value).to.equal('abc');
  });

  it('fires ds-search-field-submit on Enter', async () => {
    const el = await fixture(html`<ds-search-field value="q"></ds-search-field>`);
    await nextFrame();
    setTimeout(() => input(el).dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true })));
    const ev = await oneEvent(el, 'ds-search-field-submit');
    expect(ev.detail.value).to.equal('q');
  });

  it('fires ds-search-field-clear when the Clear button is clicked', async () => {
    const el = await fixture(html`<ds-search-field value="x"></ds-search-field>`);
    await nextFrame();
    const clear = el.querySelector('[data-clear]');
    setTimeout(() => clear.click());
    const ev = await oneEvent(el, 'ds-search-field-clear');
    expect(ev).to.exist;
    expect(el.value).to.equal('');
  });
});

describe('ds-search-field — escaping', () => {
  it('escapes a hostile shortcut label — renders as text, not HTML', async () => {
    const el = await fixture(html`<ds-search-field show-shortcut shortcut-label="${XSS}"></ds-search-field>`);
    await nextFrame();
    const kbd = el.querySelector('.ds-search-field__shortcut');
    expect(kbd).to.exist;
    expect(kbd.querySelector('img'), 'shortcut label injected an <img>').to.not.exist;
    expect(kbd.textContent).to.contain('<img');
  });
});

describe('ds-search-field — state & a11y', () => {
  it('disabled disables the input and sets the disabled class', async () => {
    const el = await fixture(html`<ds-search-field disabled></ds-search-field>`);
    await nextFrame();
    expect(input(el).disabled).to.be.true;
    expect(root(el).classList.contains('ds-search-field--disabled')).to.be.true;
  });

  it('error sets aria-invalid on the input', async () => {
    const el = await fixture(html`<ds-search-field error></ds-search-field>`);
    await nextFrame();
    expect(input(el).getAttribute('aria-invalid')).to.equal('true');
  });
});

describe('ds-search-field — teardown', () => {
  it('survives a disconnect → reconnect without duplicating the field', async () => {
    const el = await fixture(html`<ds-search-field value="keep"></ds-search-field>`);
    const parent = el.parentNode;
    el.remove();
    parent.appendChild(el);
    await nextFrame();
    expect(el.querySelectorAll('.ds-search-field').length).to.equal(1);
    expect(el.querySelectorAll('input').length).to.equal(1);
    expect(el.value).to.equal('keep');
  });
});
