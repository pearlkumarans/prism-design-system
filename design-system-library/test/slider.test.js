/* ds-slider — dedicated suite.
   Covers single/range rendering, the value get/set contract (single number vs
   [low,high] range array), fill reflection, the _explicitValue drag-preservation
   guard, injection safety on label/min/max/step, event emission, enumAttr
   fallbacks, a11y wiring, the auto-injected field-helper stylesheet, and
   disconnect/reconnect teardown.

   ds-slider is a LIGHT-DOM component: everything lives under el (a child
   div.ds-slider), so we query el.querySelector — never a shadowRoot.

   This complements the partial coverage in review-regressions.test.js
   (value-loss + injection) and enhancements.test.js (degenerate-range guard,
   live thumb-cross clamp) without re-asserting those cases verbatim. */
import { fixture, html, expect, nextFrame, oneEvent } from '@open-wc/testing';
import '../src/components/slider/slider.js';

const XSS = '"><img src=x onerror=alert(1)>';

describe('ds-slider — single mode rendering', () => {
  it('renders exactly one range input under the light-DOM root', async () => {
    const el = await fixture(html`<ds-slider type="single" value="50"></ds-slider>`);
    await nextFrame();
    expect(el.shadowRoot, 'component should be light-DOM').to.not.exist;
    expect(el.querySelector('.ds-slider'), 'root div missing').to.exist;
    expect(el.querySelectorAll('input[type="range"]').length).to.equal(1);
  });

  it('honours min/max/step on the input', async () => {
    const el = await fixture(html`<ds-slider min="10" max="200" step="5" value="50"></ds-slider>`);
    await nextFrame();
    const input = el.querySelector('input[type="range"]');
    expect(input.min).to.equal('10');
    expect(input.max).to.equal('200');
    expect(input.step).to.equal('5');
  });

  it('defaults value to 50 when the attribute is absent', async () => {
    const el = await fixture(html`<ds-slider type="single"></ds-slider>`);
    await nextFrame();
    expect(el.value).to.equal(50);
    expect(el.querySelector('input[type="range"]').value).to.equal('50');
  });

  it('reflects the value to the input and the fill percentage', async () => {
    const el = await fixture(html`<ds-slider min="0" max="100" value="25"></ds-slider>`);
    await nextFrame();
    const input = el.querySelector('input[type="range"]');
    expect(input.value).to.equal('25');
    // fill is exposed as the --_s-pct custom property on the input.
    expect(input.style.getPropertyValue('--_s-pct')).to.equal('25%');
  });
});

describe('ds-slider — value get/set contract (single)', () => {
  it('the setter round-trips a scalar through the value attribute and the getter returns a Number', async () => {
    const el = await fixture(html`<ds-slider value="10"></ds-slider>`);
    await nextFrame();
    el.value = 73;
    await nextFrame();
    expect(el.getAttribute('value')).to.equal('73');
    expect(el.value).to.be.a('number').that.equals(73);
    expect(el.querySelector('input[type="range"]').value).to.equal('73');
  });
});

describe('ds-slider — range mode rendering', () => {
  it('renders two inputs tagged low/high with the value as [low,high]', async () => {
    const el = await fixture(html`<ds-slider type="range" min="0" max="100" value="20,80"></ds-slider>`);
    await nextFrame();
    expect(el.querySelector('.ds-slider--range'), 'range modifier class missing').to.exist;
    expect(el.querySelector('[data-which="low"]'), 'low thumb missing').to.exist;
    expect(el.querySelector('[data-which="high"]'), 'high thumb missing').to.exist;
    expect(el.value).to.deep.equal([20, 80]);
  });

  it('the value setter round-trips an array through the "lo,hi" attribute', async () => {
    const el = await fixture(html`<ds-slider type="range" value="20,80"></ds-slider>`);
    await nextFrame();
    el.value = [15, 45];
    await nextFrame();
    expect(el.getAttribute('value')).to.equal('15,45');
    expect(el.value).to.deep.equal([15, 45]);
  });

  it('swaps a reversed value at render time so low never renders above high', async () => {
    // Distinct from the live drag-clamp: here the incoming attribute is inverted
    // and the render normalises it (line: if (valHi < valLo) swap).
    const el = await fixture(html`<ds-slider type="range" min="0" max="100" value="80,20"></ds-slider>`);
    await nextFrame();
    expect(Number(el.querySelector('[data-which="low"]').value)).to.equal(20);
    expect(Number(el.querySelector('[data-which="high"]').value)).to.equal(80);
    expect(el.value).to.deep.equal([20, 80]);
  });
});

describe('ds-slider — value preservation across attribute rebuilds', () => {
  it('keeps a dragged single value when an unrelated attr changes, then lets an explicit value win', async () => {
    const el = await fixture(html`<ds-slider type="single" value="50"></ds-slider>`);
    await nextFrame();
    const input = el.querySelector('input[type="range"]');
    input.value = '80';
    input.dispatchEvent(new Event('input', { bubbles: true }));
    // A non-value attribute rebuild must NOT snap the thumb back to value="50".
    el.setAttribute('disabled', '');
    await nextFrame();
    expect(el.value, 'dragged value lost on disabled toggle').to.equal(80);
    // An explicit value attribute re-asserts control (the _explicitValue contract).
    el.setAttribute('value', '30');
    await nextFrame();
    expect(el.value, 'explicit value must win').to.equal(30);
  });

  it('keeps a dragged range value across a non-value rebuild', async () => {
    const el = await fixture(html`<ds-slider type="range" value="20,80"></ds-slider>`);
    await nextFrame();
    const low = el.querySelector('[data-which="low"]');
    low.value = '35';
    low.dispatchEvent(new Event('input', { bubbles: true }));
    el.setAttribute('size', 'large');
    await nextFrame();
    expect(el.value).to.deep.equal([35, 80]);
  });
});

describe('ds-slider — injection safety', () => {
  it('renders a hostile range label as a literal aria-label, not markup', async () => {
    const el = await fixture(html`<ds-slider type="range" label="${XSS}"></ds-slider>`);
    await nextFrame();
    expect(el.querySelector('img[onerror]'), 'label injected an <img>').to.not.exist;
    const aria = el.querySelector('[data-which="low"]').getAttribute('aria-label');
    expect(aria).to.contain('<img');            // literal text, decoded by getAttribute
    expect(aria.endsWith(' start')).to.be.true; // suffix still appended
  });

  it('does not let a hostile min/max/step inject an attribute onto the input', async () => {
    const el = await fixture(html`<ds-slider min='0" onfocus=alert(1) x="' max='9" onblur=x="' step='1" onmouseover=x="'></ds-slider>`);
    await nextFrame();
    const input = el.querySelector('input[type="range"]');
    expect(input.hasAttribute('onfocus'), 'min injected onfocus').to.be.false;
    expect(input.hasAttribute('onblur'), 'max injected onblur').to.be.false;
    expect(input.hasAttribute('onmouseover'), 'step injected onmouseover').to.be.false;
  });
});

describe('ds-slider — events', () => {
  it('fires ds-slider-input with a Number detail while dragging a single slider', async () => {
    const el = await fixture(html`<ds-slider type="single" value="50"></ds-slider>`);
    await nextFrame();
    const input = el.querySelector('input[type="range"]');
    setTimeout(() => {
      input.value = '64';
      input.dispatchEvent(new Event('input', { bubbles: true }));
    });
    const ev = await oneEvent(el, 'ds-slider-input');
    expect(ev.detail.value).to.equal(64);
  });

  it('fires ds-slider-change with the array value on a range commit', async () => {
    const el = await fixture(html`<ds-slider type="range" value="20,80"></ds-slider>`);
    await nextFrame();
    const high = el.querySelector('[data-which="high"]');
    setTimeout(() => {
      high.value = '70';
      high.dispatchEvent(new Event('change', { bubbles: true }));
    });
    const ev = await oneEvent(el, 'ds-slider-change');
    expect(ev.detail.value).to.deep.equal([20, 70]);
  });
});

describe('ds-slider — enumAttr fallbacks', () => {
  it('falls back to single mode for an unknown type', async () => {
    const el = await fixture(html`<ds-slider type="bogus" value="40"></ds-slider>`);
    await nextFrame();
    expect(el.querySelectorAll('input[type="range"]').length, 'unknown type should render single').to.equal(1);
    expect(el.value).to.equal(40);
  });

  it('falls back to the medium size class for an unknown size', async () => {
    const el = await fixture(html`<ds-slider size="ginormous"></ds-slider>`);
    await nextFrame();
    expect(el.querySelector('.ds-slider--medium'), 'unknown size should default to medium').to.exist;
  });
});

describe('ds-slider — accessibility', () => {
  it('labels the single input and marks it invalid in the error state', async () => {
    const el = await fixture(html`<ds-slider label="Volume" state="error"></ds-slider>`);
    await nextFrame();
    const input = el.querySelector('input[type="range"]');
    expect(input.getAttribute('aria-label')).to.equal('Volume');
    expect(input.getAttribute('aria-invalid')).to.equal('true');
    expect(el.querySelector('.ds-slider--error'), 'error modifier class missing').to.exist;
  });

  it('gives each range thumb a distinct start/end aria-label', async () => {
    const el = await fixture(html`<ds-slider type="range" label="Price"></ds-slider>`);
    await nextFrame();
    expect(el.querySelector('[data-which="low"]').getAttribute('aria-label')).to.equal('Price start');
    expect(el.querySelector('[data-which="high"]').getAttribute('aria-label')).to.equal('Price end');
  });
});

describe('ds-slider — dependencies & teardown', () => {
  it('injects the shared field-helper stylesheet exactly once', async () => {
    await fixture(html`<ds-slider></ds-slider>`);
    const links = document.querySelectorAll('#ds-slider-fh-css');
    expect(links.length, 'field-helper stylesheet not injected once').to.equal(1);
    expect(links[0].getAttribute('href')).to.contain('field-helper.css');
  });

  it('survives disconnect then reconnect without throwing or duplicating inputs', async () => {
    const el = await fixture(html`<ds-slider type="single" value="55"></ds-slider>`);
    await nextFrame();
    const parent = el.parentNode;
    el.remove();
    await nextFrame();
    expect(() => parent.appendChild(el)).to.not.throw();
    await nextFrame();
    expect(el.querySelectorAll('input[type="range"]').length, 'reconnect duplicated inputs').to.equal(1);
    expect(el.value).to.equal(55);
  });
});

describe('ds-slider — repaint-split', () => {
  it('keeps the live range input node (and its dragged value) across a visual-only state change', async () => {
    const el = await fixture(html`<ds-slider type="single" value="40"></ds-slider>`);
    await nextFrame();
    const input = el.querySelector('input[type="range"]');
    expect(input, 'range input rendered').to.exist;
    input.value = '73';                       // simulate an in-flight drag position
    el.setAttribute('state', 'error');
    await nextFrame();
    expect(el.querySelector('input[type="range"]'), 'same input node (not rebuilt)').to.equal(input);
    expect(input.value, 'dragged value preserved').to.equal('73');
    expect(input.getAttribute('aria-invalid'), 'error state patched onto input').to.equal('true');
    expect(el.querySelector('.ds-slider').classList.contains('ds-slider--error'), 'error class applied').to.be.true;
  });
});
