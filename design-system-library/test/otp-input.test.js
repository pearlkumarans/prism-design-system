/* ds-otp-input — dedicated suite.
   The component is light-DOM: a `.ds-otp-input` root wraps a `role="group"`
   `.ds-otp-input__fields` container holding one `.ds-otp-input__box` <input> per
   digit. The typed code lives ONLY in those box <input>s (never reflected to the
   `value` attribute), so the getter reads the live boxes once built, or the
   `value` attribute on the first render. `length` is clamped to 4 or 6.

   Coverage here complements the single value-preservation guard in
   review-regressions.test.js: length clamping, the value getter/setter, deferred
   upgrade (`_pendingValue`), numeric-only entry, auto-advance/backspace/arrow
   focus, paste distribution, escaping, a11y, enumAttr fallback, and teardown. */
import { fixture, html, expect, nextFrame, oneEvent } from '@open-wc/testing';
import '../src/components/otp-input/otp-input.js';

const XSS = '"><img src=x onerror=alert(1)>';
const boxes = (el) => [...el.querySelectorAll('.ds-otp-input__box')];
const group = (el) => el.querySelector('.ds-otp-input__fields');

/* Type a digit into a box the way a user would — set the raw value then fire the
   `input` event the component listens on. */
const typeInto = (box, ch) => {
  box.value = ch;
  box.dispatchEvent(new Event('input', { bubbles: true }));
};
const keydown = (box, key) =>
  box.dispatchEvent(new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true }));

describe('ds-otp-input — length', () => {
  it('length="4" renders 4 boxes', async () => {
    const el = await fixture(html`<ds-otp-input length="4"></ds-otp-input>`);
    await nextFrame();
    expect(boxes(el).length).to.equal(4);
  });

  it('length="6" renders 6 boxes', async () => {
    const el = await fixture(html`<ds-otp-input length="6"></ds-otp-input>`);
    await nextFrame();
    expect(boxes(el).length).to.equal(6);
  });

  it('an absent length defaults to 6', async () => {
    const el = await fixture(html`<ds-otp-input></ds-otp-input>`);
    await nextFrame();
    expect(boxes(el).length).to.equal(6);
  });

  it('an out-of-range length clamps to 6 (only 4 and 6 are valid)', async () => {
    // _readLength() returns n only when n === 4 || n === 6, else 6.
    const five = await fixture(html`<ds-otp-input length="5"></ds-otp-input>`);
    await nextFrame();
    expect(boxes(five).length, 'length=5 clamps to 6').to.equal(6);

    const eight = await fixture(html`<ds-otp-input length="8"></ds-otp-input>`);
    await nextFrame();
    expect(boxes(eight).length, 'length=8 clamps to 6').to.equal(6);
  });
});

describe('ds-otp-input — value getter / setter', () => {
  it('an initial value attribute populates the boxes and el.value on first render', async () => {
    const el = await fixture(html`<ds-otp-input length="6" value="123456"></ds-otp-input>`);
    await nextFrame();
    expect(el.value).to.equal('123456');
    expect(boxes(el).map((b) => b.value)).to.deep.equal(['1', '2', '3', '4', '5', '6']);
  });

  it('el.value concatenates whatever was typed into the boxes', async () => {
    const el = await fixture(html`<ds-otp-input length="4"></ds-otp-input>`);
    await nextFrame();
    boxes(el).forEach((b, i) => typeInto(b, String(i + 1)));
    expect(el.value).to.equal('1234');
  });

  it('the value setter truncates to the box count', async () => {
    const el = await fixture(html`<ds-otp-input length="4"></ds-otp-input>`);
    await nextFrame();
    el.value = '123456';
    expect(el.value).to.equal('1234');
    expect(boxes(el).map((b) => b.value)).to.deep.equal(['1', '2', '3', '4']);
  });
});

describe('ds-otp-input — value preservation across rebuilds', () => {
  it('typed code survives an unrelated attribute change (size)', async () => {
    const el = await fixture(html`<ds-otp-input length="4"></ds-otp-input>`);
    await nextFrame();
    boxes(el).forEach((b, i) => typeInto(b, String(i + 1)));
    expect(el.value).to.equal('1234');

    el.setAttribute('size', 'large'); // forces an innerHTML rebuild
    await nextFrame();
    expect(el.value, 'typed code wiped by the rebuild').to.equal('1234');
  });

  it('state="error" sets aria-invalid on every box and keeps the typed code', async () => {
    const el = await fixture(html`<ds-otp-input length="4"></ds-otp-input>`);
    await nextFrame();
    boxes(el).forEach((b, i) => typeInto(b, String(i + 1)));

    el.setAttribute('state', 'error');
    await nextFrame();
    expect(el.value, 'typed code preserved through error state').to.equal('1234');
    boxes(el).forEach((b) => {
      expect(b.getAttribute('aria-invalid')).to.equal('true');
    });
  });
});

describe('ds-otp-input — deferred upgrade (_pendingValue)', () => {
  it('a value set BEFORE connection sticks once the boxes are built', async () => {
    // Property set on an upgraded-but-unconnected element: the setter has no
    // boxes yet, so it stashes _pendingValue; connectedCallback applies it.
    const el = document.createElement('ds-otp-input');
    el.setAttribute('length', '4');
    el.value = '99';
    document.body.appendChild(el);
    await nextFrame();

    expect(el.value).to.equal('99');
    expect(boxes(el).slice(0, 2).map((b) => b.value)).to.deep.equal(['9', '9']);
    el.remove();
  });
});

describe('ds-otp-input — numeric-only entry', () => {
  it('a non-digit is rejected (the box does not accept a letter)', async () => {
    const el = await fixture(html`<ds-otp-input length="4"></ds-otp-input>`);
    await nextFrame();
    typeInto(boxes(el)[0], 'a');
    expect(boxes(el)[0].value, 'letter stripped from box').to.equal('');
    expect(el.value).to.equal('');
  });

  it('only the last character is kept when multiple chars land in a box', async () => {
    const el = await fixture(html`<ds-otp-input length="4"></ds-otp-input>`);
    await nextFrame();
    typeInto(boxes(el)[0], '12'); // e.g. an OS suggestion dumping two digits
    expect(boxes(el)[0].value).to.equal('2');
  });
});

describe('ds-otp-input — focus behaviour', () => {
  it('typing a digit auto-advances focus to the next box', async () => {
    const el = await fixture(html`<ds-otp-input length="4"></ds-otp-input>`);
    await nextFrame();
    const b = boxes(el);
    b[0].focus();
    typeInto(b[0], '5');
    expect(document.activeElement).to.equal(b[1]);
  });

  it('Backspace on an empty box moves focus to the previous box', async () => {
    const el = await fixture(html`<ds-otp-input length="4"></ds-otp-input>`);
    await nextFrame();
    const b = boxes(el);
    b[1].focus();
    expect(b[1].value).to.equal(''); // empty box
    keydown(b[1], 'Backspace');
    expect(document.activeElement).to.equal(b[0]);
  });

  it('ArrowRight / ArrowLeft move focus between boxes', async () => {
    const el = await fixture(html`<ds-otp-input length="4"></ds-otp-input>`);
    await nextFrame();
    const b = boxes(el);
    b[0].focus();
    keydown(b[0], 'ArrowRight');
    expect(document.activeElement, 'ArrowRight → next').to.equal(b[1]);
    keydown(b[1], 'ArrowLeft');
    expect(document.activeElement, 'ArrowLeft → previous').to.equal(b[0]);
  });
});

describe('ds-otp-input — paste distribution', () => {
  it('pasting "123456" fills the boxes', async () => {
    const el = await fixture(html`<ds-otp-input length="6"></ds-otp-input>`);
    await nextFrame();
    const b = boxes(el);
    // The handler reads (e.clipboardData || window.clipboardData).getData('text').
    // A DataTransfer on the ClipboardEvent is unreliable across engines, so drive
    // it deterministically with a minimal clipboardData stub.
    const evt = new Event('paste', { bubbles: true, cancelable: true });
    Object.defineProperty(evt, 'clipboardData', { value: { getData: () => '123456' } });
    b[0].focus();
    b[0].dispatchEvent(evt);
    expect(el.value).to.equal('123456');
    expect(b.map((x) => x.value)).to.deep.equal(['1', '2', '3', '4', '5', '6']);
  });
});

describe('ds-otp-input — events', () => {
  it('emits ds-otp-change on entry and ds-otp-complete when all boxes are filled', async () => {
    const el = await fixture(html`<ds-otp-input length="4"></ds-otp-input>`);
    await nextFrame();
    let changes = 0;
    let completeValue = null;
    el.addEventListener('ds-otp-change', () => { changes += 1; });
    el.addEventListener('ds-otp-complete', (e) => { completeValue = e.detail.value; });

    boxes(el).forEach((b, i) => typeInto(b, String(i + 1)));
    expect(changes, 'one change per digit').to.equal(4);
    expect(completeValue, 'complete fires with the full code').to.equal('1234');
  });

  it('ds-otp-change carries the current value in detail', async () => {
    const el = await fixture(html`<ds-otp-input length="4"></ds-otp-input>`);
    await nextFrame();
    setTimeout(() => typeInto(boxes(el)[0], '7'));
    const e = await oneEvent(el, 'ds-otp-change');
    expect(e.detail.value).to.equal('7');
  });
});

describe('ds-otp-input — accessibility', () => {
  it('exposes role=group with an aria-label, one-time-code autocomplete, and per-digit labels', async () => {
    const el = await fixture(html`<ds-otp-input length="6" label="Verification code"></ds-otp-input>`);
    await nextFrame();
    const g = group(el);
    expect(g.getAttribute('role')).to.equal('group');
    expect(g.getAttribute('aria-label')).to.equal('Verification code');
    boxes(el).forEach((b, i) => {
      expect(b.getAttribute('aria-label')).to.equal(`Digit ${i + 1} of 6`);
      expect(b.getAttribute('autocomplete')).to.equal('one-time-code');
      expect(b.getAttribute('inputmode')).to.equal('numeric');
    });
  });

  it('falls back to a "One-time code" group label when no label is given', async () => {
    const el = await fixture(html`<ds-otp-input length="4"></ds-otp-input>`);
    await nextFrame();
    expect(group(el).getAttribute('aria-label')).to.equal('One-time code');
  });
});

describe('ds-otp-input — escaping', () => {
  it('renders a hostile label as literal text (no injected <img>)', async () => {
    const el = await fixture(html`<ds-otp-input length="4" label=${XSS}></ds-otp-input>`);
    await nextFrame();
    expect(el.querySelector('img[onerror]'), 'hostile label injected an <img>').to.not.exist;
    // aria-label carries the raw string, not parsed markup.
    expect(group(el).getAttribute('aria-label')).to.equal(XSS);
  });
});

describe('ds-otp-input — enumAttr fallbacks', () => {
  it('an invalid size falls back to medium', async () => {
    const el = await fixture(html`<ds-otp-input length="4" size="huge"></ds-otp-input>`);
    await nextFrame();
    const root = el.querySelector('.ds-otp-input');
    expect(root.classList.contains('ds-otp-input--medium')).to.be.true;
    expect(root.classList.contains('ds-otp-input--huge')).to.be.false;
  });

  it('an invalid label-position falls back to top (label stays visible)', async () => {
    const el = await fixture(html`<ds-otp-input length="4" label="Code" label-position="sideways"></ds-otp-input>`);
    await nextFrame();
    expect(el.querySelector('.ds-otp-input__label'), 'label shown for default top position').to.exist;
  });
});

describe('ds-otp-input — teardown', () => {
  it('disconnect then reconnect does not throw or duplicate boxes', async () => {
    const el = await fixture(html`<ds-otp-input length="4"></ds-otp-input>`);
    await nextFrame();
    const parent = el.parentNode;
    parent.removeChild(el);
    expect(() => parent.appendChild(el)).to.not.throw();
    await nextFrame();
    expect(boxes(el).length, 'exactly one set of boxes after reconnect').to.equal(4);
  });
});
