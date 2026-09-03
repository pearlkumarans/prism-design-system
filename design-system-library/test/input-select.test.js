/* ds-input-select — a combobox trigger + portaled dropdown menu. Covers the
   enumAttr size default (medium) + fallback, the escaped label sink, the
   value/option round-trip, the open/clear events, the portal-to-body dropdown,
   combobox ARIA, and a disconnect→reconnect. The open panel is portaled to
   document.body, so it's inspected via el._dropdownEl. */
import { fixture, html, expect, oneEvent, nextFrame } from '@open-wc/testing';
import '../src/components/input-select/input-select.js';

const XSS = '"><img src=x onerror=alert(1)>';
const root = (el) => el.querySelector('.ds-input-select');
const trigger = (el) => el.querySelector('[data-trigger]');

describe('ds-input-select — structure & enum defaults', () => {
  it('renders the root with the default size (medium) + position (left) classes', async () => {
    const el = await fixture(html`<ds-input-select label="Region"></ds-input-select>`);
    await nextFrame();
    expect(root(el).classList.contains('ds-input-select--medium')).to.be.true;
    expect(root(el).classList.contains('ds-input-select--left')).to.be.true;
    expect(trigger(el)).to.exist;
    expect(trigger(el).getAttribute('role')).to.equal('combobox');
  });

  it('falls back to the default size on an invalid value (enumAttr)', async () => {
    const el = await fixture(html`<ds-input-select label="R" size="bogus"></ds-input-select>`);
    await nextFrame();
    expect(root(el).classList.contains('ds-input-select--medium')).to.be.true;
  });

  it('renders the required asterisk by default and the label text', async () => {
    const el = await fixture(html`<ds-input-select label="Region"></ds-input-select>`);
    await nextFrame();
    expect(el.querySelector('.ds-input-select__label').textContent).to.contain('Region');
    expect(el.querySelector('.ds-input-select__required')).to.exist;
  });
});

describe('ds-input-select — value round-trip', () => {
  it('resolves the value to its option label in the trigger', async () => {
    const el = await fixture(html`<ds-input-select label="Region"></ds-input-select>`);
    el.options = [{ label: 'United States', value: 'us' }, { label: 'Canada', value: 'ca' }];
    el.value = 'us';
    await nextFrame();
    expect(el.value).to.equal('us');
    expect(el.querySelector('.ds-input-select__value').textContent.trim()).to.equal('United States');
  });

  it('shows the placeholder when there is no selection', async () => {
    const el = await fixture(html`<ds-input-select label="R" placeholder="Pick one"></ds-input-select>`);
    await nextFrame();
    expect(el.querySelector('.ds-input-select__value--placeholder').textContent.trim()).to.equal('Pick one');
  });
});

describe('ds-input-select — escaping', () => {
  it('escapes a hostile label — renders as text, not HTML', async () => {
    const el = await fixture(html`<ds-input-select label="${XSS}"></ds-input-select>`);
    await nextFrame();
    const labelEl = el.querySelector('.ds-input-select__label');
    expect(labelEl.querySelector('img'), 'label injected an <img>').to.not.exist;
    expect(labelEl.textContent).to.contain('<img');
  });
});

describe('ds-input-select — events & portal', () => {
  it('opens on trigger click, fires ds-input-select-open, and portals the dropdown to <body>', async () => {
    const el = await fixture(html`<ds-input-select label="R"></ds-input-select>`);
    await nextFrame();
    setTimeout(() => trigger(el).click());
    const ev = await oneEvent(el, 'ds-input-select-open');
    expect(ev).to.exist;
    expect(el._isOpen).to.be.true;
    expect(el._dropdownEl).to.exist;
    expect(el._dropdownEl.parentNode).to.equal(document.body);
  });

  it('the clear button empties the value and fires ds-input-select-clear', async () => {
    const el = await fixture(html`<ds-input-select label="R" show-clear value="us"></ds-input-select>`);
    el.options = [{ label: 'US', value: 'us' }];
    await nextFrame();
    const clear = el.querySelector('[data-clear]');
    expect(clear).to.exist;
    setTimeout(() => clear.click());
    const ev = await oneEvent(el, 'ds-input-select-clear');
    expect(ev).to.exist;
    expect(el.value).to.equal('');
  });
});

describe('ds-input-select — a11y', () => {
  it('marks the combobox required + haspopup and labels it', async () => {
    const el = await fixture(html`<ds-input-select label="Region"></ds-input-select>`);
    await nextFrame();
    expect(trigger(el).getAttribute('aria-required')).to.equal('true');
    expect(trigger(el).getAttribute('aria-haspopup')).to.equal('menu');
    expect(trigger(el).getAttribute('aria-labelledby')).to.equal(`${el._id}-label`);
  });

  it('multi mode adds the multi class and a listbox popup', async () => {
    const el = await fixture(html`<ds-input-select label="R" multi></ds-input-select>`);
    await nextFrame();
    expect(root(el).classList.contains('ds-input-select--multi')).to.be.true;
    expect(trigger(el).getAttribute('aria-haspopup')).to.equal('listbox');
  });
});

describe('ds-input-select — repaint-split', () => {
  it('keeps the portaled dropdown node across a visual-only size change (no re-portal)', async () => {
    const el = await fixture(html`<ds-input-select label="R"></ds-input-select>`);
    await nextFrame();
    el._open();               // open + portal the dropdown to <body>
    await nextFrame();
    const dd = el._dropdownEl;
    expect(dd, 'dropdown portaled').to.exist;
    expect(dd.parentNode).to.equal(document.body);
    el.setAttribute('size', 'large');
    await nextFrame();
    // same node, still portaled — the chrome paint did NOT tear down / re-portal it
    expect(el._dropdownEl, 'same portaled dropdown node').to.equal(dd);
    expect(dd.parentNode, 'still in <body>').to.equal(document.body);
    expect(root(el).classList.contains('ds-input-select--large'), 'size class applied').to.be.true;
  });
});

describe('ds-input-select — teardown', () => {
  it('survives a disconnect → reconnect without duplicating its root', async () => {
    const el = await fixture(html`<ds-input-select label="R"></ds-input-select>`);
    const parent = el.parentNode;
    el.remove();
    parent.appendChild(el);
    await nextFrame();
    expect(el.querySelectorAll('.ds-input-select').length).to.equal(1);
    expect(trigger(el)).to.exist;
  });
});
