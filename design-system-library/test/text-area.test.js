/* ds-text-area — dedicated suite.
   Light-DOM component (<ds-text-area> → div.ds-text-area … textarea). Field
   values live in the live <textarea>, not the `value` attribute, so a rebuild
   from an unrelated attribute must preserve typed text; a `value` attribute
   change has its own no-rebuild path. Complements the value-loss/round-trip
   guard in review-regressions.test.js with escaping, counter, events, the
   keyboard-resizable grip, a11y wiring, enumAttr fallbacks, deps and teardown.

   Exact names asserted from src/components/text-area/text-area.js:
   - events: ds-input (typing), ds-resize (grip), ds-text-area-help (label help)
   - enum defaults: state=default, size=large (SIZES medium|large), label-position=left
   - injected css ids: ds-text-area-fh-css (field-helper.css), ds-text-area-tt-css (tooltip.css) */
import { fixture, html, expect, nextFrame, oneEvent } from '@open-wc/testing';
import '../src/components/text-area/text-area.js';

const XSS = '"><img src=x onerror=alert(1)>';
const ta = (el) => el.querySelector('textarea');

describe('ds-text-area — value get/set', () => {
  it('a value attribute populates the textarea and el.value reads it back', async () => {
    const el = await fixture(html`<ds-text-area value="initial"></ds-text-area>`);
    expect(ta(el).value).to.equal('initial');
    expect(el.value).to.equal('initial');
  });

  it('setting el.value writes through to the textarea', async () => {
    const el = await fixture(html`<ds-text-area></ds-text-area>`);
    el.value = 'set via property';
    expect(ta(el).value).to.equal('set via property');
    expect(el.value).to.equal('set via property');
  });
});

describe('ds-text-area — value preservation across attribute-driven rebuilds', () => {
  it('typed text survives an unrelated attribute change (state, then size)', async () => {
    const el = await fixture(html`<ds-text-area value="initial"></ds-text-area>`);
    const t = ta(el);
    t.value = 'typed by user';
    t.dispatchEvent(new Event('input', { bubbles: true }));

    el.setAttribute('state', 'error');
    await nextFrame();
    expect(el.value, 'state change wiped typed text').to.equal('typed by user');

    el.setAttribute('size', 'medium');
    await nextFrame();
    expect(el.value, 'size change wiped typed text').to.equal('typed by user');
  });

  it('an explicit value attribute change still applies (no-rebuild path)', async () => {
    const el = await fixture(html`<ds-text-area value="initial"></ds-text-area>`);
    ta(el).value = 'typed by user';
    el.setAttribute('value', 'from attribute');
    await nextFrame();
    expect(el.value).to.equal('from attribute');
  });
});

describe('ds-text-area — escaping / injection safety', () => {
  it('round-trips reserved chars exactly and injects no node', async () => {
    const src = 'if (a < b && c > d) {}';
    const el = await fixture(html`<ds-text-area value="${src}"></ds-text-area>`);
    expect(el.value).to.equal(src);
    expect(el.querySelector('textarea *'), 'value injected a child node').to.not.exist;
    expect(el.querySelector('img[onerror]'), 'value injected an <img>').to.not.exist;
  });

  it('renders a hostile label, placeholder and helper as literal text', async () => {
    const el = await fixture(html`
      <ds-text-area label="${XSS}" placeholder="${XSS}" helper="${XSS}"></ds-text-area>`);
    await nextFrame();
    expect(el.querySelector('img[onerror]'), 'hostile attrs injected an <img>').to.not.exist;
    expect(el.querySelector('.ds-text-area__label').textContent).to.contain('<img');
    expect(ta(el).getAttribute('placeholder')).to.contain('<img');
  });
});

describe('ds-text-area — character counter', () => {
  it('shows used/max on the helper row and caps input length to the max', async () => {
    const el = await fixture(html`<ds-text-area show-counter counter="0/500"></ds-text-area>`);
    await nextFrame();
    const helper = el.querySelector('ds-field-helper');
    expect(helper.getAttribute('counter'), 'initial counter').to.equal('0/500');
    expect(ta(el).maxLength, 'maxLength derived from counter caps input').to.equal(500);
  });

  it('recomputes the counter on input', async () => {
    const el = await fixture(html`<ds-text-area show-counter counter="0/500"></ds-text-area>`);
    await nextFrame();
    const t = ta(el);
    t.value = 'hello';
    t.dispatchEvent(new Event('input', { bubbles: true }));
    expect(el.querySelector('ds-field-helper').getAttribute('counter')).to.equal('5/500');
  });
});

describe('ds-text-area — events', () => {
  it('typing fires ds-input with the live value in detail', async () => {
    const el = await fixture(html`<ds-text-area></ds-text-area>`);
    const t = ta(el);
    setTimeout(() => {
      t.value = 'abc';
      t.dispatchEvent(new Event('input', { bubbles: true }));
    });
    const ev = await oneEvent(el, 'ds-input');
    expect(ev.detail.value).to.equal('abc');
  });

  it('the resize grip fires ds-resize on an arrow-key resize', async () => {
    const el = await fixture(html`<ds-text-area></ds-text-area>`);
    const grip = el.querySelector('.ds-text-area__resizer');
    setTimeout(() => grip.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true })));
    const ev = await oneEvent(el, 'ds-resize');
    expect(ev.detail.width, 'resize detail width').to.be.a('number');
    expect(ev.detail.height, 'resize detail height').to.be.a('number');
  });
});

describe('ds-text-area — resize grip a11y', () => {
  it('is a real focusable button with an aria-label', async () => {
    const el = await fixture(html`<ds-text-area></ds-text-area>`);
    const grip = el.querySelector('.ds-text-area__resizer');
    expect(grip.tagName).to.equal('BUTTON');
    expect(grip.type).to.equal('button');
    expect(grip.getAttribute('aria-label')).to.equal('Resize text area');
    grip.focus();
    expect(document.activeElement, 'grip is focusable').to.equal(grip);
  });

  it('an arrow key changes the field height', async () => {
    const el = await fixture(html`<ds-text-area></ds-text-area>`);
    const grip = el.querySelector('.ds-text-area__resizer');
    const field = el.querySelector('.ds-text-area__field');
    grip.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true }));
    expect(field.style.height, 'arrow key set an explicit height').to.match(/^\d+px$/);
  });

  it('is not offered while readonly or disabled', async () => {
    const ro = await fixture(html`<ds-text-area state="readonly"></ds-text-area>`);
    expect(ro.querySelector('.ds-text-area__resizer')).to.not.exist;
    const dis = await fixture(html`<ds-text-area state="disabled"></ds-text-area>`);
    expect(dis.querySelector('.ds-text-area__resizer')).to.not.exist;
  });
});

describe('ds-text-area — accessibility wiring', () => {
  it('associates the label with the textarea via for/id', async () => {
    const el = await fixture(html`<ds-text-area label="Notes"></ds-text-area>`);
    const label = el.querySelector('.ds-text-area__label');
    expect(label.getAttribute('for')).to.equal(ta(el).id);
    expect(ta(el).id).to.be.ok;
  });

  it('required reflects aria-required onto the textarea', async () => {
    const el = await fixture(html`<ds-text-area label="Notes" required></ds-text-area>`);
    expect(ta(el).getAttribute('aria-required')).to.equal('true');
    expect(ta(el).hasAttribute('required')).to.be.true;
  });

  it('state=error reflects aria-invalid onto the textarea', async () => {
    const el = await fixture(html`<ds-text-area state="error"></ds-text-area>`);
    expect(ta(el).getAttribute('aria-invalid')).to.equal('true');
  });

  it('points aria-describedby at the helper row', async () => {
    const el = await fixture(html`<ds-text-area helper="Max 500 chars"></ds-text-area>`);
    await nextFrame();
    const helper = el.querySelector('ds-field-helper');
    expect(helper).to.exist;
    expect(ta(el).getAttribute('aria-describedby')).to.equal(helper.id);
  });

  it('label-position=none keeps an accessible name via aria-label', async () => {
    const el = await fixture(html`<ds-text-area label="Notes" label-position="none"></ds-text-area>`);
    expect(el.querySelector('.ds-text-area__label'), 'label is visually hidden').to.not.exist;
    expect(ta(el).getAttribute('aria-label')).to.equal('Notes');
  });
});

describe('ds-text-area — enumAttr fallbacks', () => {
  it('invalid state / size / label-position fall back to their defaults', async () => {
    const el = await fixture(html`
      <ds-text-area state="bogus" size="bogus" label-position="bogus" label="Notes"></ds-text-area>`);
    const root = el.querySelector('.ds-text-area');
    expect(root.className, 'state → default').to.contain('ds-text-area--default');
    expect(root.className, 'size → large').to.contain('ds-text-area--large');
    expect(root.className, 'label-position → left').to.contain('ds-text-area--left');
  });
});

describe('ds-text-area — dependencies', () => {
  it('injects field-helper.css and tooltip.css once', async () => {
    await fixture(html`<ds-text-area></ds-text-area>`);
    expect(document.querySelector('link[href*="field-helper.css"]'), 'field-helper.css').to.exist;
    expect(document.querySelector('link[href*="tooltip.css"]'), 'tooltip.css').to.exist;
  });
});

describe('ds-text-area — teardown', () => {
  it('survives disconnect then reconnect without throwing or duplicating the textarea', async () => {
    const el = await fixture(html`<ds-text-area value="keep"></ds-text-area>`);
    const parent = el.parentNode;
    expect(() => {
      parent.removeChild(el);
      parent.appendChild(el);
    }).to.not.throw();
    await nextFrame();
    expect(el.querySelectorAll('textarea').length, 'exactly one textarea after reconnect').to.equal(1);
    expect(el.value).to.equal('keep');
  });
});
