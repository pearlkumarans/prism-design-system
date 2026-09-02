/* ds-field-helper — the shared "Form Field Helper Row" (leading status icon +
   helper text + optional trailing counter). Covers the enumAttr state default +
   fallback, per-state icon glyph, the escaped text sink, the collapse-when-empty
   behaviour, the alert/live-region ARIA, and a disconnect→reconnect. */
import { fixture, html, expect, nextFrame } from '@open-wc/testing';
import '../src/components/field-helper/field-helper.js';

const XSS = '"><img src=x onerror=alert(1)>';
const root = (el) => el.querySelector('.ds-field-helper');

describe('ds-field-helper — structure & defaults', () => {
  it('renders the row and applies the default state class', async () => {
    const el = await fixture(html`<ds-field-helper text="Code sent"></ds-field-helper>`);
    await nextFrame();
    expect(root(el)).to.exist;
    expect(root(el).className).to.equal('ds-field-helper ds-field-helper--default');
    expect(el.querySelector('.ds-field-helper__text').textContent).to.equal('Code sent');
  });

  it('accepts the helper text from slotted content', async () => {
    const el = await fixture(html`<ds-field-helper>Slotted text</ds-field-helper>`);
    await nextFrame();
    expect(el.querySelector('.ds-field-helper__text').textContent).to.equal('Slotted text');
  });

  it('falls back to the default state on an invalid value (enumAttr)', async () => {
    const el = await fixture(html`<ds-field-helper text="X" state="bogus"></ds-field-helper>`);
    await nextFrame();
    expect(root(el).classList.contains('ds-field-helper--default')).to.be.true;
  });

  it('maps the spec alias `negative` onto the `error` state', async () => {
    const el = await fixture(html`<ds-field-helper text="X" state="negative"></ds-field-helper>`);
    await nextFrame();
    expect(root(el).classList.contains('ds-field-helper--error')).to.be.true;
  });
});

describe('ds-field-helper — icon', () => {
  it('renders the per-state status glyph as a <ds-icon> (default → info-circle)', async () => {
    const el = await fixture(html`<ds-field-helper text="Hi"></ds-field-helper>`);
    await nextFrame();
    const icon = el.querySelector('.ds-field-helper__icon ds-icon');
    expect(icon).to.exist;
    expect(icon.getAttribute('name')).to.equal('info-circle');
    expect(icon.getAttribute('size')).to.equal('12');
  });

  it('success state uses the tick glyph', async () => {
    const el = await fixture(html`<ds-field-helper text="Saved" state="success"></ds-field-helper>`);
    await nextFrame();
    expect(el.querySelector('.ds-field-helper__icon ds-icon').getAttribute('name')).to.equal('tick');
  });

  it('hides the icon when show-icon="false"', async () => {
    const el = await fixture(html`<ds-field-helper text="Hi" show-icon="false"></ds-field-helper>`);
    await nextFrame();
    expect(el.querySelector('.ds-field-helper__icon')).to.not.exist;
  });
});

describe('ds-field-helper — counter & escaping', () => {
  it('renders the character counter', async () => {
    const el = await fixture(html`<ds-field-helper text="Hi" counter="12/232"></ds-field-helper>`);
    await nextFrame();
    expect(el.querySelector('.ds-field-helper__counter').textContent).to.equal('12/232');
  });

  it('escapes a hostile text value — renders as text, not HTML', async () => {
    const el = await fixture(html`<ds-field-helper text="${XSS}"></ds-field-helper>`);
    await nextFrame();
    const textEl = el.querySelector('.ds-field-helper__text');
    expect(textEl.querySelector('img'), 'text injected an <img>').to.not.exist;
    expect(textEl.textContent).to.contain('<img');
  });
});

describe('ds-field-helper — ARIA & collapse', () => {
  it('error is an assertive alert live-region', async () => {
    const el = await fixture(html`<ds-field-helper text="Bad" state="error"></ds-field-helper>`);
    await nextFrame();
    expect(el.getAttribute('role')).to.equal('alert');
    expect(el.getAttribute('aria-live')).to.equal('assertive');
  });

  it('non-error rows are polite and carry no alert role', async () => {
    const el = await fixture(html`<ds-field-helper text="Ok"></ds-field-helper>`);
    await nextFrame();
    expect(el.hasAttribute('role')).to.be.false;
    expect(el.getAttribute('aria-live')).to.equal('polite');
  });

  it('collapses the host when there is neither text nor counter', async () => {
    const el = await fixture(html`<ds-field-helper></ds-field-helper>`);
    await nextFrame();
    expect(el.style.display).to.equal('none');
    expect(root(el).className).to.equal('ds-field-helper');
  });
});

describe('ds-field-helper — teardown', () => {
  it('survives a disconnect → reconnect without duplicating its row', async () => {
    const el = await fixture(html`<ds-field-helper text="Reattach"></ds-field-helper>`);
    const parent = el.parentNode;
    el.remove();
    parent.appendChild(el);
    await nextFrame();
    expect(el.querySelectorAll('.ds-field-helper').length).to.equal(1);
    expect(el.querySelector('.ds-field-helper__text').textContent).to.equal('Reattach');
  });
});
