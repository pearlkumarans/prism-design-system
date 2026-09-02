/* ds-icon-button — a real <button> with shape/type/size enum attrs, a sprite
   <ds-icon> glyph, an aria-label, aria-pressed for the `selected` state, and an
   auto-tooltip when a label is present. Covers the enumAttr defaults (square /
   primary / xl) + fallback, the escaped icon-name sink, click/focus proxies, and
   a disconnect→reconnect. `no-tooltip` is used where a predictable single-button
   DOM is needed. */
import { fixture, html, expect, oneEvent, nextFrame } from '@open-wc/testing';
import '../src/components/icon-button/icon-button.js';

const XSS = '"><img src=x onerror=alert(1)>';
const innerBtn = (el) => el.querySelector('button');

describe('ds-icon-button — structure & enum defaults', () => {
  it('renders a single real <button> with the default shape/type/size classes', async () => {
    const el = await fixture(html`<ds-icon-button icon="trash" label="Delete" no-tooltip></ds-icon-button>`);
    const btn = innerBtn(el);
    expect(btn).to.exist;
    expect(btn.className).to.equal('ds-icon-button ds-icon-button--square ds-icon-button--primary ds-icon-button--xl');
    expect(btn.type).to.equal('button');
  });

  it('reflects shape / type / size to the inner button', async () => {
    const el = await fixture(html`<ds-icon-button icon="trash" label="D" no-tooltip shape="circle" type="danger" size="large"></ds-icon-button>`);
    expect(innerBtn(el).classList.contains('ds-icon-button--circle')).to.be.true;
    expect(innerBtn(el).classList.contains('ds-icon-button--danger')).to.be.true;
    expect(innerBtn(el).classList.contains('ds-icon-button--large')).to.be.true;
  });

  it('falls back to the default type on an invalid value (enumAttr)', async () => {
    const el = await fixture(html`<ds-icon-button icon="trash" label="D" no-tooltip type="bogus"></ds-icon-button>`);
    expect(innerBtn(el).classList.contains('ds-icon-button--primary')).to.be.true;
  });

  it('falls back to the default size (xl) on an invalid value', async () => {
    const el = await fixture(html`<ds-icon-button icon="trash" label="D" no-tooltip size="bogus"></ds-icon-button>`);
    expect(innerBtn(el).classList.contains('ds-icon-button--xl')).to.be.true;
  });
});

describe('ds-icon-button — icon', () => {
  it('renders the glyph as a <ds-icon> with the size-mapped px (xl → 20)', async () => {
    const el = await fixture(html`<ds-icon-button icon="trash" label="D" no-tooltip></ds-icon-button>`);
    expect(el._icon).to.exist;
    expect(el._icon.getAttribute('name')).to.equal('trash');
    expect(el._icon.getAttribute('size')).to.equal('20');
  });

  it('escapes a hostile icon name — no HTML injection', async () => {
    const el = await fixture(html`<ds-icon-button icon="${XSS}" label="D" no-tooltip></ds-icon-button>`);
    await nextFrame();
    expect(el.querySelector('img'), 'icon name injected an <img>').to.not.exist;
    expect(el._icon.getAttribute('name')).to.contain('<img');
  });
});

describe('ds-icon-button — a11y & state', () => {
  it('exposes the label as aria-label on the button', async () => {
    const el = await fixture(html`<ds-icon-button icon="trash" label="Delete" no-tooltip></ds-icon-button>`);
    expect(innerBtn(el).getAttribute('aria-label')).to.equal('Delete');
  });

  it('selected sets aria-pressed + the selected class; clearing removes them', async () => {
    const el = await fixture(html`<ds-icon-button icon="trash" label="D" no-tooltip selected></ds-icon-button>`);
    expect(innerBtn(el).getAttribute('aria-pressed')).to.equal('true');
    expect(innerBtn(el).classList.contains('ds-icon-button--selected')).to.be.true;
    el.removeAttribute('selected');
    await nextFrame();
    expect(innerBtn(el).hasAttribute('aria-pressed')).to.be.false;
  });

  it('disabled disables the inner button', async () => {
    const el = await fixture(html`<ds-icon-button icon="trash" label="D" no-tooltip disabled></ds-icon-button>`);
    expect(innerBtn(el).disabled).to.be.true;
  });

  it('wraps the button in a ds-tooltip when a label is present (no no-tooltip)', async () => {
    const el = await fixture(html`<ds-icon-button icon="trash" label="Delete"></ds-icon-button>`);
    const tip = el.querySelector('ds-tooltip.ds-icon-button__tip');
    expect(tip).to.exist;
    expect(tip.getAttribute('text')).to.equal('Delete');
  });
});

describe('ds-icon-button — events & teardown', () => {
  it('emits a click that bubbles from the inner button', async () => {
    const el = await fixture(html`<ds-icon-button icon="trash" label="D" no-tooltip></ds-icon-button>`);
    setTimeout(() => el.click());
    const ev = await oneEvent(el, 'click');
    expect(ev).to.exist;
  });

  it('focus() / blur() delegate to the inner button', async () => {
    const el = await fixture(html`<ds-icon-button icon="trash" label="D" no-tooltip></ds-icon-button>`);
    el.focus();
    expect(document.activeElement).to.equal(innerBtn(el));
    el.blur();
    expect(document.activeElement).to.not.equal(innerBtn(el));
  });

  it('survives a disconnect → reconnect without duplicating the button', async () => {
    const el = await fixture(html`<ds-icon-button icon="trash" label="D" no-tooltip></ds-icon-button>`);
    const parent = el.parentNode;
    el.remove();
    parent.appendChild(el);
    await nextFrame();
    expect(el.querySelectorAll('button').length).to.equal(1);
    expect(el._icon.getAttribute('name')).to.equal('trash');
  });
});
