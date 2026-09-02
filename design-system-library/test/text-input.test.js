/* ds-text-input — the core form field. Headline contracts: (1) live value + focus
   survive an attribute-driven change; (2) visual-only attrs (size/state/rtl) update
   IN PLACE without rebuilding the field (no lost input node / re-wired listeners),
   while structural attrs (label/label-position/affixes) still rebuild. */
import { fixture, html, expect, nextFrame } from '@open-wc/testing';
import '../src/components/text-input/text-input.js';

describe('ds-text-input — structure & value', () => {
  it('renders the root, a label bound to the input, and the input', async () => {
    const el = await fixture(html`<ds-text-input label="Email"></ds-text-input>`);
    await nextFrame();
    const input = el.querySelector('input');
    const label = el.querySelector('.ds-text-input__label');
    expect(input, 'input').to.exist;
    expect(label.getAttribute('for')).to.equal(input.id);
    expect(label.textContent).to.contain('Email');
  });

  it('value attribute populates the input; getter/setter round-trip', async () => {
    const el = await fixture(html`<ds-text-input value="hello"></ds-text-input>`);
    await nextFrame();
    expect(el.value).to.equal('hello');
    el.value = 'world';
    expect(el.querySelector('input').value).to.equal('world');
  });

  it('required and a describedby helper wire the a11y attributes', async () => {
    const el = await fixture(html`<ds-text-input label="Name" required helper="Required"></ds-text-input>`);
    await nextFrame();
    const input = el.querySelector('input');
    expect(input.getAttribute('aria-required')).to.equal('true');
    const helper = el.querySelector('ds-field-helper');
    expect(input.getAttribute('aria-describedby')).to.equal(helper.id);
  });
});

describe('ds-text-input — visual-only attrs update in place (perf contract)', () => {
  it('a state change keeps the same input node (no rebuild) and toggles aria-invalid + helper state', async () => {
    const el = await fixture(html`<ds-text-input label="Amount" helper="Enter a value"></ds-text-input>`);
    await nextFrame();
    const input = el.querySelector('input');
    const helper = el.querySelector('ds-field-helper');
    input._probe = 'kept';

    el.setAttribute('state', 'error');
    await nextFrame();

    expect(el.querySelector('input'), 'input node identity').to.equal(input);
    expect(el.querySelector('input')._probe, 'field not rebuilt').to.equal('kept');
    expect(input.getAttribute('aria-invalid')).to.equal('true');
    expect(el.querySelector('.ds-text-input').classList.contains('ds-text-input--error')).to.be.true;
    expect(helper.getAttribute('state')).to.equal('error');

    // clearing the error removes aria-invalid + reverts helper state, still no rebuild
    el.setAttribute('state', 'default');
    await nextFrame();
    expect(el.querySelector('input'), 'still same node').to.equal(input);
    expect(input.hasAttribute('aria-invalid')).to.be.false;
    expect(helper.getAttribute('state')).to.equal('default');
  });

  it('state=disabled / readonly toggle the input flags in place', async () => {
    const el = await fixture(html`<ds-text-input label="X"></ds-text-input>`);
    await nextFrame();
    const input = el.querySelector('input');
    el.setAttribute('state', 'disabled');
    await nextFrame();
    expect(el.querySelector('input')).to.equal(input);
    expect(input.disabled).to.be.true;
    el.setAttribute('state', 'readonly');
    await nextFrame();
    expect(input.disabled).to.be.false;
    expect(input.hasAttribute('readonly')).to.be.true;
    expect(input.getAttribute('aria-readonly')).to.equal('true');
  });

  it('a size change is in place (same input node)', async () => {
    const el = await fixture(html`<ds-text-input label="X" size="medium"></ds-text-input>`);
    await nextFrame();
    const input = el.querySelector('input');
    el.setAttribute('size', 'small');
    await nextFrame();
    expect(el.querySelector('input')).to.equal(input);
    expect(el.querySelector('.ds-text-input').classList.contains('ds-text-input--small')).to.be.true;
  });

  it('preserves typed text + caret across a state change (no wipe)', async () => {
    const el = await fixture(html`<ds-text-input label="X"></ds-text-input>`);
    await nextFrame();
    const input = el.querySelector('input');
    input.value = 'typed by user';
    input.dispatchEvent(new Event('input', { bubbles: true }));
    el.setAttribute('state', 'error');
    await nextFrame();
    expect(el.value).to.equal('typed by user');
  });
});

describe('ds-text-input — structural attrs still rebuild', () => {
  it('a label change rebuilds and shows the new label', async () => {
    const el = await fixture(html`<ds-text-input label="Old"></ds-text-input>`);
    await nextFrame();
    el.setAttribute('label', 'New');
    await nextFrame();
    expect(el.querySelector('.ds-text-input__label').textContent).to.contain('New');
  });
});

describe('ds-text-input — escaping & teardown', () => {
  it('escapes a hostile label and placeholder — no injected node', async () => {
    const el = await fixture(html`<ds-text-input label=${'<img src=x onerror=alert(1)>'} placeholder=${'"><img src=y onerror=alert(2)>'}></ds-text-input>`);
    await nextFrame();
    expect(el.querySelector('img[onerror]'), 'injected an <img>').to.not.exist;
  });

  it('survives disconnect -> reconnect without duplicating the input', async () => {
    const el = await fixture(html`<ds-text-input label="X" value="v"></ds-text-input>`);
    await nextFrame();
    const parent = el.parentNode;
    el.remove();
    parent.appendChild(el);
    await nextFrame();
    expect(el.querySelectorAll('input').length).to.equal(1);
  });
});
