/* ds-date-picker — ISO ↔ display formatting (the logic most prone to off-by-one
   and format bugs), value round-trip, and the open event. */
import { fixture, html, expect, oneEvent, nextFrame } from '@open-wc/testing';
import '../src/components/date-picker/date-picker.js';

const inputVal = (el) => el.querySelector('input')?.value;

describe('ds-date-picker — value formatting', () => {
  it('formats an ISO value to DD/MM/YYYY', async () => {
    const el = await fixture(html`<ds-date-picker format="DD/MM/YYYY"></ds-date-picker>`);
    el.value = '2024-03-07';
    await nextFrame();
    expect(inputVal(el)).to.equal('07/03/2024');
  });

  it('respects an MM/DD/YYYY format', async () => {
    const el = await fixture(html`<ds-date-picker format="MM/DD/YYYY"></ds-date-picker>`);
    el.value = '2024-03-07';
    await nextFrame();
    expect(inputVal(el)).to.equal('03/07/2024');
  });

  it('is timezone-safe — no off-by-one at the year boundary', async () => {
    const el = await fixture(html`<ds-date-picker format="DD/MM/YYYY"></ds-date-picker>`);
    el.value = '2024-01-01';
    await nextFrame();
    expect(inputVal(el)).to.equal('01/01/2024'); // never 31/12/2023
  });

  it('formats a range value with both endpoints', async () => {
    const el = await fixture(html`<ds-date-picker type="range" format="DD/MM/YYYY"></ds-date-picker>`);
    el.value = '2024-03-01/2024-03-10';
    await nextFrame();
    expect(inputVal(el)).to.equal('01/03/2024 → 10/03/2024');
  });
});

describe('ds-date-picker — value API', () => {
  it('round-trips value through the attribute and clears cleanly', async () => {
    const el = await fixture(html`<ds-date-picker></ds-date-picker>`);
    el.value = '2024-12-25';
    expect(el.getAttribute('value')).to.equal('2024-12-25');
    expect(el.value).to.equal('2024-12-25');
    el.value = '';
    await nextFrame();
    expect(el.hasAttribute('value')).to.be.false;
    expect(inputVal(el)).to.equal('');
  });

  it('ignores an unparseable value without crashing', async () => {
    const el = await fixture(html`<ds-date-picker format="DD/MM/YYYY"></ds-date-picker>`);
    el.value = 'not-a-date';
    await nextFrame();
    expect(inputVal(el)).to.equal(''); // empty display, no throw
  });
});

describe('ds-date-picker — open', () => {
  it('emits ds-date-picker-open when the open attribute is set', async () => {
    const el = await fixture(html`<ds-date-picker></ds-date-picker>`);
    setTimeout(() => el.setAttribute('open', ''));
    const ev = await oneEvent(el, 'ds-date-picker-open');
    expect(ev).to.exist;
  });
});
