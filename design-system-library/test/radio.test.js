/* ds-radio — a standalone single radio wrapping a real <input type="radio"> in a
   <label>. Covers checked/disabled/value round-trip, a11y (native radio role,
   aria-disabled), slotted + attribute labels, native radio grouping by name, the
   ds-radio-change event, label escaping, and teardown. */
import { fixture, html, expect, nextFrame, oneEvent } from '@open-wc/testing';
import '../src/components/radio/radio.js';

const input = (el) => el.querySelector('.ds-radio__input');
const labelText = (el) => el.querySelector('.ds-radio__label');

describe('ds-radio — structure & labels', () => {
  it('renders a real <input type="radio"> inside a label', async () => {
    const el = await fixture(html`<ds-radio label="Option A" value="a"></ds-radio>`);
    const i = input(el);
    expect(i).to.exist;
    expect(i.type).to.equal('radio');
    expect(el.querySelector('label.ds-radio')).to.exist;
  });

  it('uses the label attribute for the visible text', async () => {
    const el = await fixture(html`<ds-radio label="Option A"></ds-radio>`);
    expect(labelText(el).textContent).to.equal('Option A');
  });

  it('captures slotted text as the label', async () => {
    const el = await fixture(html`<ds-radio value="a">Slotted label</ds-radio>`);
    expect(labelText(el).textContent).to.equal('Slotted label');
  });

  it('applies the default size class (s)', async () => {
    const el = await fixture(html`<ds-radio label="A"></ds-radio>`);
    expect(el.querySelector('.ds-radio--s')).to.exist;
  });

  it('maps the medium alias to size m', async () => {
    const el = await fixture(html`<ds-radio label="A" size="medium"></ds-radio>`);
    expect(el.querySelector('.ds-radio--m')).to.exist;
  });
});

describe('ds-radio — state', () => {
  it('reflects checked onto the input and the property', async () => {
    const el = await fixture(html`<ds-radio label="A" checked></ds-radio>`);
    expect(input(el).checked).to.be.true;
    expect(el.checked).to.be.true;
  });

  it('reflects disabled onto the input and aria-disabled on the wrapper', async () => {
    const el = await fixture(html`<ds-radio label="A" disabled></ds-radio>`);
    expect(input(el).disabled).to.be.true;
    expect(el.querySelector('label.ds-radio').getAttribute('aria-disabled')).to.equal('true');
  });

  it('round-trips the value property', async () => {
    const el = await fixture(html`<ds-radio label="A" value="a"></ds-radio>`);
    expect(el.value).to.equal('a');
    el.value = 'b';
    await nextFrame();
    expect(el.getAttribute('value')).to.equal('b');
    expect(input(el).value).to.equal('b');
  });

  it('sets aria-invalid on the input in the error state', async () => {
    const el = await fixture(html`<ds-radio label="A" error></ds-radio>`);
    expect(input(el).getAttribute('aria-invalid')).to.equal('true');
  });
});

describe('ds-radio — grouping & events', () => {
  it('fires ds-radio-change with checked + value on selection', async () => {
    const el = await fixture(html`<ds-radio label="A" value="a"></ds-radio>`);
    setTimeout(() => el.click());
    const ev = await oneEvent(el, 'ds-radio-change');
    expect(ev.detail.checked).to.be.true;
    expect(ev.detail.value).to.equal('a');
  });

  it('deselects same-name siblings when one is chosen', async () => {
    const wrap = await fixture(html`
      <div>
        <ds-radio name="grp" value="a" label="A" checked></ds-radio>
        <ds-radio name="grp" value="b" label="B"></ds-radio>
      </div>`);
    const [a, b] = wrap.querySelectorAll('ds-radio');
    b.click();
    await nextFrame();
    expect(b.hasAttribute('checked')).to.be.true;
    expect(a.hasAttribute('checked'), 'sibling should be deselected').to.be.false;
  });
});

describe('ds-radio — escaping & teardown', () => {
  it('renders a hostile label as literal text (no injected <img>)', async () => {
    const el = await fixture(html`<ds-radio label='"><img src=x onerror=alert(1)>'></ds-radio>`);
    await nextFrame();
    expect(labelText(el).querySelector('img')).to.not.exist;
    expect(labelText(el).textContent).to.contain('<img');
  });

  it('disconnects without throwing', async () => {
    const el = await fixture(html`<ds-radio label="A"></ds-radio>`);
    expect(() => el.remove()).to.not.throw();
  });
});
