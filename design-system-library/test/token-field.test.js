/* ds-token-field — an input-first multi-select whose chosen values render as
   removable ds-tag tokens. Covers the enumAttr size default (medium) + fallback,
   the escaped label sink, the tokens property round-trip (→ ds-tag count +
   `values`), the clear button + ds-token-clear event, the disabled state, the
   tokens-group ARIA, and a disconnect→reconnect. The suggestions dropdown portals
   to document.body (el._dropdownEl) so it is not asserted via el.querySelector. */
import { fixture, html, expect, oneEvent, nextFrame } from '@open-wc/testing';
import '../src/components/token-field/token-field.js';

const XSS = '"><img src=x onerror=alert(1)>';
const root = (el) => el.querySelector('.ds-token-field');

describe('ds-token-field — structure & enum defaults', () => {
  it('renders the root with the default size (medium) + position (top) classes', async () => {
    const el = await fixture(html`<ds-token-field label="Skills"></ds-token-field>`);
    await nextFrame();
    expect(root(el).classList.contains('ds-token-field--medium')).to.be.true;
    expect(root(el).classList.contains('ds-token-field--top')).to.be.true;
    expect(el.querySelector('[data-field]')).to.exist;
  });

  it('falls back to the default size on an invalid value (enumAttr)', async () => {
    const el = await fixture(html`<ds-token-field label="S" size="bogus"></ds-token-field>`);
    await nextFrame();
    expect(root(el).classList.contains('ds-token-field--medium')).to.be.true;
  });

  it('renders the label and its required asterisk by default', async () => {
    const el = await fixture(html`<ds-token-field label="Skills"></ds-token-field>`);
    await nextFrame();
    expect(el.querySelector('.ds-token-field__label').textContent).to.contain('Skills');
    expect(el.querySelector('.ds-token-field__required')).to.exist;
  });
});

describe('ds-token-field — tokens round-trip', () => {
  it('renders string tokens as ds-tag chips and exposes them via `values`', async () => {
    const el = await fixture(html`<ds-token-field label="S"></ds-token-field>`);
    el.tokens = ['Design', 'Figma'];
    await nextFrame();
    expect(el.querySelectorAll('[data-tag-value]').length).to.equal(2);
    expect(el.values).to.deep.equal(['Design', 'Figma']);
  });

  it('accepts object tokens and normalises value/label', async () => {
    const el = await fixture(html`<ds-token-field label="S"></ds-token-field>`);
    el.tokens = [{ label: 'United States', value: 'us' }];
    await nextFrame();
    expect(el.values).to.deep.equal(['us']);
    expect(el.tokens[0].label).to.equal('United States');
  });
});

describe('ds-token-field — escaping', () => {
  it('escapes a hostile label — renders as text, not HTML', async () => {
    const el = await fixture(html`<ds-token-field label="${XSS}"></ds-token-field>`);
    await nextFrame();
    const labelEl = el.querySelector('.ds-token-field__label');
    expect(labelEl.querySelector('img'), 'label injected an <img>').to.not.exist;
    expect(labelEl.textContent).to.contain('<img');
  });
});

describe('ds-token-field — events', () => {
  it('the clear button empties the tokens and fires ds-token-clear', async () => {
    const el = await fixture(html`<ds-token-field label="S" show-clear></ds-token-field>`);
    el.tokens = ['A', 'B'];
    await nextFrame();
    const clear = el.querySelector('[data-clear]');
    expect(clear).to.exist;
    setTimeout(() => clear.click());
    const ev = await oneEvent(el, 'ds-token-clear');
    expect(ev).to.exist;
    expect(el.values).to.deep.equal([]);
  });
});

describe('ds-token-field — state & a11y', () => {
  it('resolves the disabled state and hides the input caret', async () => {
    const el = await fixture(html`<ds-token-field label="S" disabled></ds-token-field>`);
    el.tokens = ['A'];
    await nextFrame();
    expect(root(el).dataset.state).to.equal('disabled');
    expect(el.querySelector('[data-input]')).to.not.exist;
  });

  it('resolves the filled state when it has tokens and is not focused', async () => {
    const el = await fixture(html`<ds-token-field label="S"></ds-token-field>`);
    el.tokens = ['A'];
    await nextFrame();
    expect(root(el).dataset.state).to.equal('filled');
  });

  it('groups the tokens in a labelled live region', async () => {
    const el = await fixture(html`<ds-token-field label="S"></ds-token-field>`);
    await nextFrame();
    const group = el.querySelector('[data-tokens]');
    expect(group.getAttribute('role')).to.equal('group');
    expect(group.getAttribute('aria-label')).to.equal('Selected tags');
  });
});

describe('ds-token-field — teardown', () => {
  it('survives a disconnect → reconnect without duplicating its root', async () => {
    const el = await fixture(html`<ds-token-field label="S"></ds-token-field>`);
    el.tokens = ['Keep'];
    await nextFrame();
    const parent = el.parentNode;
    el.remove();
    parent.appendChild(el);
    await nextFrame();
    expect(el.querySelectorAll('.ds-token-field').length).to.equal(1);
    expect(el.values).to.deep.equal(['Keep']);
  });
});

describe('ds-token-field — repaint-split', () => {
  it('keeps the ds-tag token node across a visual-only size change', async () => {
    const el = await fixture(html`<ds-token-field label="Skills"></ds-token-field>`);
    el.tokens = ['One'];
    await nextFrame();
    const tag = el.querySelector('[data-tag-value]');
    expect(tag, 'token tag rendered').to.exist;
    el.setAttribute('size', 'large');
    await nextFrame();
    expect(el.querySelector('[data-tag-value]'), 'same ds-tag node (not re-parsed)').to.equal(tag);
    expect(tag.getAttribute('size'), 'tag size patched in place').to.equal('large');
    expect(root(el).classList.contains('ds-token-field--large'), 'root size class applied').to.be.true;
  });
});
