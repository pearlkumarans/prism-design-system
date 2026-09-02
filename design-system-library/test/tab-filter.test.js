/* ds-tab-filter — single-select segmented filter. Options via the `options`
   property; radiogroup semantics; selection commits on click / arrow key.
   Covers structure/a11y, the value default, escaping, selection + keyboard
   events, size/disabled classes, and disconnect cleanup. */
import { fixture, html, expect, nextFrame, oneEvent } from '@open-wc/testing';
import '../src/components/tab-filter/tab-filter.js';

const XSS = '<img src=x onerror=alert(1)>';
const OPTS = [
  { value: 'all', label: 'All', badge: 99 },
  { value: 'open', label: 'Open', badge: 12 },
  { value: 'closed', label: 'Closed', badge: 7 },
];

describe('ds-tab-filter — structure & a11y', () => {
  it('renders a radiogroup with one radio per option', async () => {
    const el = await fixture(html`<ds-tab-filter></ds-tab-filter>`);
    el.options = OPTS;
    await nextFrame();
    expect(el._root.classList.contains('ds-tab-filter')).to.be.true;
    expect(el._root.getAttribute('role')).to.equal('radiogroup');
    const radios = el._root.querySelectorAll('.ds-tab-filter__option');
    expect(radios.length).to.equal(3);
    expect(radios[0].getAttribute('role')).to.equal('radio');
  });

  it('reflects aria-label onto the radiogroup', async () => {
    const el = await fixture(html`<ds-tab-filter aria-label="Filter status"></ds-tab-filter>`);
    el.options = OPTS;
    await nextFrame();
    expect(el._root.getAttribute('aria-label')).to.equal('Filter status');
  });

  it('defaults the value to the first option and marks it checked', async () => {
    const el = await fixture(html`<ds-tab-filter></ds-tab-filter>`);
    el.options = OPTS;
    await nextFrame();
    expect(el.value).to.equal('all');
    const radios = el._root.querySelectorAll('.ds-tab-filter__option');
    expect(radios[0].getAttribute('aria-checked')).to.equal('true');
    expect(radios[1].getAttribute('aria-checked')).to.equal('false');
  });
});

describe('ds-tab-filter — size & disabled', () => {
  it('is medium by default and small via the size attribute', async () => {
    const def = await fixture(html`<ds-tab-filter></ds-tab-filter>`);
    def.options = OPTS;
    await nextFrame();
    expect(def._root.classList.contains('ds-tab-filter--small')).to.be.false;
    const small = await fixture(html`<ds-tab-filter size="small"></ds-tab-filter>`);
    small.options = OPTS;
    await nextFrame();
    expect(small._root.classList.contains('ds-tab-filter--small')).to.be.true;
  });

  it('applies the disabled class from the attribute', async () => {
    const el = await fixture(html`<ds-tab-filter disabled></ds-tab-filter>`);
    el.options = OPTS;
    await nextFrame();
    expect(el._root.classList.contains('ds-tab-filter--disabled')).to.be.true;
  });
});

describe('ds-tab-filter — escaping', () => {
  it('renders a hostile option label as literal text', async () => {
    const el = await fixture(html`<ds-tab-filter></ds-tab-filter>`);
    el.options = [{ value: 'a', label: XSS }];
    await nextFrame();
    const lbl = el._root.querySelector('.ds-tab-filter__option-label');
    expect(lbl.querySelector('img'), 'label injected an <img>').to.not.exist;
    expect(lbl.textContent).to.contain('<img');
  });
});

describe('ds-tab-filter — selection', () => {
  it('clicking an option fires ds-tab-filter-change with value + option', async () => {
    const el = await fixture(html`<ds-tab-filter></ds-tab-filter>`);
    el.options = OPTS;
    await nextFrame();
    const second = el._root.querySelectorAll('.ds-tab-filter__option')[1];
    setTimeout(() => second.click());
    const ev = await oneEvent(el, 'ds-tab-filter-change');
    expect(ev.detail.value).to.equal('open');
    expect(ev.detail.option.label).to.equal('Open');
    expect(el.value).to.equal('open');
  });

  it('does not re-fire when the already-selected option is clicked', async () => {
    const el = await fixture(html`<ds-tab-filter></ds-tab-filter>`);
    el.options = OPTS;
    await nextFrame();
    let fired = 0;
    el.addEventListener('ds-tab-filter-change', () => (fired += 1));
    el._root.querySelector('.ds-tab-filter__option').click();  /* the active first tab */
    await nextFrame();
    expect(fired).to.equal(0);
  });

  it('ArrowRight commits the next option', async () => {
    const el = await fixture(html`<ds-tab-filter></ds-tab-filter>`);
    el.options = OPTS;
    await nextFrame();
    const active = el._root.querySelector('.ds-tab-filter__option');
    active.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true }));
    await nextFrame();
    expect(el.value).to.equal('open');
  });
});

describe('ds-tab-filter — teardown', () => {
  it('survives disconnect and clears its ResizeObserver reference', async () => {
    const el = await fixture(html`<ds-tab-filter></ds-tab-filter>`);
    el.options = OPTS;
    await nextFrame();
    expect(() => el.remove()).to.not.throw();
    expect(el._ro, 'RO nulled so a reconnect can re-create it').to.equal(null);
  });
});
