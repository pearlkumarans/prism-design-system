/* ds-checkbox — a real <input type="checkbox"> wrapped in a <label> so box +
   label click, native form semantics work, and the hidden input keeps focus.
   Covers structure, spec default size (small), checked/disabled/error/rtl,
   indeterminate, the label attr vs slotted text, value/name reflection, the
   native + custom change events, the checked/value/disabled JS accessors,
   escaping, reactivity, a11y, and teardown. */
import { fixture, html, expect, nextFrame, oneEvent } from '@open-wc/testing';
import '../src/components/checkbox/checkbox.js';

const XSS = '<img src=x onerror=alert(1)>';
const wrap = (el) => el.querySelector('label.ds-checkbox');
const input = (el) => el.querySelector('input.ds-checkbox__input');
const labelEl = (el) => el.querySelector('.ds-checkbox__label');

describe('ds-checkbox — structure & defaults', () => {
  it('renders a label wrapping a real checkbox input + label span', async () => {
    const el = await fixture(html`<ds-checkbox label="Accept"></ds-checkbox>`);
    expect(wrap(el), 'label wrapper missing').to.exist;
    expect(input(el), 'checkbox input missing').to.exist;
    expect(input(el).type).to.equal('checkbox');
    expect(labelEl(el).textContent).to.equal('Accept');
  });

  it('links the label to the input via htmlFor / id', async () => {
    const el = await fixture(html`<ds-checkbox label="Accept"></ds-checkbox>`);
    expect(wrap(el).htmlFor).to.equal(input(el).id);
    expect(input(el).id).to.not.equal('');
  });

  it('applies the spec default size class (small)', async () => {
    const el = await fixture(html`<ds-checkbox label="X"></ds-checkbox>`);
    expect(wrap(el).classList.contains('ds-checkbox--small')).to.be.true;
  });

  it('reflects size="medium"', async () => {
    const el = await fixture(html`<ds-checkbox size="medium" label="X"></ds-checkbox>`);
    expect(wrap(el).classList.contains('ds-checkbox--medium')).to.be.true;
  });

  it('uses slotted text as the label when no label attr is given', async () => {
    const el = await fixture(html`<ds-checkbox>Slotted</ds-checkbox>`);
    expect(labelEl(el).textContent).to.equal('Slotted');
  });
});

describe('ds-checkbox — states', () => {
  it('checked sets the input checked property', async () => {
    const el = await fixture(html`<ds-checkbox checked label="X"></ds-checkbox>`);
    expect(input(el).checked).to.be.true;
  });

  it('disabled disables the input and marks the wrapper', async () => {
    const el = await fixture(html`<ds-checkbox disabled label="X"></ds-checkbox>`);
    expect(input(el).disabled).to.be.true;
    expect(wrap(el).classList.contains('ds-checkbox--disabled')).to.be.true;
    expect(wrap(el).getAttribute('aria-disabled')).to.equal('true');
  });

  it('error sets the error class + aria-invalid on the input', async () => {
    const el = await fixture(html`<ds-checkbox error label="X"></ds-checkbox>`);
    expect(wrap(el).classList.contains('ds-checkbox--error')).to.be.true;
    expect(input(el).getAttribute('aria-invalid')).to.equal('true');
  });

  it('indeterminate sets the native indeterminate property + aria-checked mixed', async () => {
    const el = await fixture(html`<ds-checkbox indeterminate label="X"></ds-checkbox>`);
    expect(input(el).indeterminate).to.be.true;
    expect(input(el).getAttribute('aria-checked')).to.equal('mixed');
  });

  it('checked wins over indeterminate (indeterminate cleared when checked)', async () => {
    const el = await fixture(html`<ds-checkbox indeterminate checked label="X"></ds-checkbox>`);
    expect(input(el).indeterminate).to.be.false;
    expect(input(el).hasAttribute('aria-checked')).to.be.false;
  });

  it('indicator="minus" applies the minus modifier class', async () => {
    const el = await fixture(html`<ds-checkbox indicator="minus" checked label="X"></ds-checkbox>`);
    expect(wrap(el).classList.contains('ds-checkbox--minus')).to.be.true;
  });

  it('reflects value + name onto the input', async () => {
    const el = await fixture(html`<ds-checkbox value="opt-a" name="prefs" label="X"></ds-checkbox>`);
    expect(input(el).value).to.equal('opt-a');
    expect(input(el).name).to.equal('prefs');
  });

  it('mirrors rtl onto the wrapper as dir="rtl"', async () => {
    const el = await fixture(html`<ds-checkbox rtl label="X"></ds-checkbox>`);
    expect(wrap(el).getAttribute('dir')).to.equal('rtl');
  });
});

describe('ds-checkbox — events & accessors', () => {
  it('emits ds-checkbox-change when the input toggles', async () => {
    const el = await fixture(html`<ds-checkbox value="v" label="X"></ds-checkbox>`);
    setTimeout(() => input(el).click());
    const ev = await oneEvent(el, 'ds-checkbox-change');
    expect(ev.detail.checked).to.be.true;
    expect(ev.detail.value).to.equal('v');
  });

  it('a user toggle reflects back to the checked attribute', async () => {
    const el = await fixture(html`<ds-checkbox label="X"></ds-checkbox>`);
    input(el).click();
    await nextFrame();
    expect(el.hasAttribute('checked')).to.be.true;
  });

  it('the checked JS accessor reads + writes the attribute', async () => {
    const el = await fixture(html`<ds-checkbox label="X"></ds-checkbox>`);
    expect(el.checked).to.be.false;
    el.checked = true;
    await nextFrame();
    expect(el.hasAttribute('checked')).to.be.true;
    expect(input(el).checked).to.be.true;
  });

  it('the value + disabled JS accessors work', async () => {
    const el = await fixture(html`<ds-checkbox label="X"></ds-checkbox>`);
    el.value = 'z';
    el.disabled = true;
    await nextFrame();
    expect(el.value).to.equal('z');
    expect(el.disabled).to.be.true;
    expect(input(el).disabled).to.be.true;
  });

  it('click() delegates to the inner input', async () => {
    const el = await fixture(html`<ds-checkbox label="X"></ds-checkbox>`);
    el.click();
    await nextFrame();
    expect(input(el).checked).to.be.true;
  });
});

describe('ds-checkbox — escaping & reactivity', () => {
  it('escapes a hostile label — no <img> injected (label is textContent)', async () => {
    const el = await fixture(html`<ds-checkbox label="${XSS}"></ds-checkbox>`);
    await nextFrame();
    expect(el.querySelector('img')).to.not.exist;
    expect(labelEl(el).textContent).to.contain('<img');
  });

  it('updates the checked state when the attribute changes after mount', async () => {
    const el = await fixture(html`<ds-checkbox label="X"></ds-checkbox>`);
    el.setAttribute('checked', '');
    await nextFrame();
    expect(input(el).checked).to.be.true;
    el.removeAttribute('checked');
    await nextFrame();
    expect(input(el).checked).to.be.false;
  });

  it('updates the label text when the attribute changes after mount', async () => {
    const el = await fixture(html`<ds-checkbox label="Old"></ds-checkbox>`);
    el.setAttribute('label', 'New');
    await nextFrame();
    expect(labelEl(el).textContent).to.equal('New');
  });
});

describe('ds-checkbox — a11y & teardown', () => {
  it('is accessible', async () => {
    const el = await fixture(html`<ds-checkbox label="Accept terms"></ds-checkbox>`);
    await expect(el).to.be.accessible({ ignoredRules: ['color-contrast'] });
  });

  it('survives disconnect → reconnect without throwing or duplicating the input', async () => {
    const el = await fixture(html`<ds-checkbox label="Accept"></ds-checkbox>`);
    const parent = el.parentNode;
    el.remove();
    parent.appendChild(el);
    await nextFrame();
    expect(el.querySelectorAll('input.ds-checkbox__input').length).to.equal(1);
    expect(labelEl(el).textContent).to.equal('Accept');
  });
});
