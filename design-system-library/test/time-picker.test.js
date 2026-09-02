/* ds-time-picker — a time field with a `list` (default) and an `inline` variant.
   The list variant is a ds-text-input trigger + a portaled listbox popover.
   Covers the enumAttr size default (medium) + fallback, the label textContent
   sink, the value ↔ display round-trip per hour-cycle, the open + change events,
   combobox/listbox ARIA, the inline segmented variant, and a disconnect→reconnect.
   The popover portals to document.body, so it's inspected via el._popover. */
import { fixture, html, expect, oneEvent, nextFrame } from '@open-wc/testing';
import '../src/components/time-picker/time-picker.js';

const XSS = '"><img src=x onerror=alert(1)>';

describe('ds-time-picker — structure & defaults (list variant)', () => {
  it('renders the list frame, the text-input trigger, and a role="listbox" list', async () => {
    const el = await fixture(html`<ds-time-picker label="Start"></ds-time-picker>`);
    await nextFrame();
    expect(el.classList.contains('ds-time-picker')).to.be.true;
    expect(el.querySelector('.ds-time-picker__frame')).to.exist;
    expect(el.querySelector('.ds-time-picker__input')).to.exist;
    expect(el.querySelector('.ds-time-picker__list').getAttribute('role')).to.equal('listbox');
  });

  it('applies the default label-position (left) and size (medium) classes', async () => {
    const el = await fixture(html`<ds-time-picker label="Start"></ds-time-picker>`);
    await nextFrame();
    expect(el.classList.contains('ds-time-picker--left')).to.be.true;
    expect(el.classList.contains('ds-time-picker--size-medium')).to.be.true;
  });

  it('falls back to the default size on an invalid value (enumAttr)', async () => {
    const el = await fixture(html`<ds-time-picker label="Start" size="bogus"></ds-time-picker>`);
    await nextFrame();
    expect(el.classList.contains('ds-time-picker--size-medium')).to.be.true;
  });

  it('renders the label text', async () => {
    const el = await fixture(html`<ds-time-picker label="Start time"></ds-time-picker>`);
    await nextFrame();
    expect(el.querySelector('.ds-time-picker__label').textContent).to.contain('Start time');
  });
});

describe('ds-time-picker — value round-trip', () => {
  it('reflects a 24h value into a 12h display (default hour-cycle)', async () => {
    const el = await fixture(html`<ds-time-picker label="T" value="09:30"></ds-time-picker>`);
    await nextFrame();
    expect(el.value).to.equal('09:30');
    expect(el._field.value).to.equal('9:30 AM');
  });

  it('formats the display per hour-cycle="24"', async () => {
    const el = await fixture(html`<ds-time-picker label="T" value="14:30" hour-cycle="24"></ds-time-picker>`);
    await nextFrame();
    expect(el._field.value).to.equal('14:30');
  });

  it('round-trips a value set via the property', async () => {
    const el = await fixture(html`<ds-time-picker label="T"></ds-time-picker>`);
    el.value = '08:15';
    await nextFrame();
    expect(el.getAttribute('value')).to.equal('08:15');
    expect(el.value).to.equal('08:15');
  });
});

describe('ds-time-picker — escaping', () => {
  it('renders a hostile label as text (textContent sink), never as HTML', async () => {
    const el = await fixture(html`<ds-time-picker label="${XSS}"></ds-time-picker>`);
    await nextFrame();
    const labelEl = el.querySelector('.ds-time-picker__label');
    expect(labelEl.querySelector('img'), 'label injected an <img>').to.not.exist;
    expect(labelEl.textContent).to.contain('<img');
  });
});

describe('ds-time-picker — events', () => {
  it('opens on the `open` attribute and fires ds-time-picker-open', async () => {
    const el = await fixture(html`<ds-time-picker label="T"></ds-time-picker>`);
    await nextFrame();
    setTimeout(() => el.setAttribute('open', ''));
    const ev = await oneEvent(el, 'ds-time-picker-open');
    expect(ev).to.exist;
    expect(el._isOpen).to.be.true;
    expect(el._popover.hidden).to.be.false;
  });

  it('picking an option commits the value and fires ds-time-picker-change', async () => {
    const el = await fixture(html`<ds-time-picker label="T" step="60"></ds-time-picker>`);
    el.setAttribute('open', '');
    await nextFrame();
    const opt = el._popover.querySelector('[data-mins]');
    expect(opt).to.exist;
    setTimeout(() => opt.dispatchEvent(new MouseEvent('mousedown', { bubbles: true })));
    const ev = await oneEvent(el, 'ds-time-picker-change');
    expect(ev.detail.value).to.exist;
    expect(el.value).to.not.equal('');
  });
});

describe('ds-time-picker — a11y & inline variant', () => {
  it('the trigger is a combobox with a listbox popup', async () => {
    const el = await fixture(html`<ds-time-picker label="T"></ds-time-picker>`);
    await nextFrame();
    expect(el._inputWrap.getAttribute('role')).to.equal('combobox');
    expect(el._inputWrap.getAttribute('aria-haspopup')).to.equal('listbox');
  });

  it('the inline variant renders segmented HH/MM spinbutton inputs', async () => {
    const el = await fixture(html`<ds-time-picker variant="inline" label="T"></ds-time-picker>`);
    await nextFrame();
    expect(el.classList.contains('ds-time-picker--inline')).to.be.true;
    expect(el.querySelector('.ds-time-picker__inline-field')).to.exist;
    expect(el.querySelectorAll('.ds-time-picker__seg[role="spinbutton"]').length).to.be.greaterThan(0);
  });
});

describe('ds-time-picker — teardown', () => {
  it('survives a disconnect → reconnect without duplicating its frame or throwing', async () => {
    const el = await fixture(html`<ds-time-picker label="T" value="09:30"></ds-time-picker>`);
    await nextFrame();
    const parent = el.parentNode;
    el.remove();
    parent.appendChild(el);
    await nextFrame();
    expect(el.querySelectorAll('.ds-time-picker__frame').length).to.equal(1);
    expect(el.value).to.equal('09:30');
  });
});
