/* ds-button-group — LIGHT-DOM composite. One primitive, three selection modes
   with the correct ARIA per mode: single→radiogroup + aria-checked, multi→group
   + aria-pressed, none→plain buttons. Roving tabindex (one Tab stop). Data-driven
   labels are escaped. In the bare case the host IS the group track. */
import { fixture, html, expect, oneEvent, nextFrame } from '@open-wc/testing';
import '../src/components/button-group/button-group.js';

const items = (el) => Array.from(el.querySelectorAll('.ds-button-group__item'));
const XSS = '<img src=x onerror=alert(1)>';

describe('ds-button-group — structure & selection modes', () => {
  it('single mode (default): host is a radiogroup, items are role=radio', async () => {
    const el = await fixture(html`<ds-button-group></ds-button-group>`);
    el.items = [{ value: 'a', label: 'A' }, { value: 'b', label: 'B' }];
    await nextFrame();
    expect(el.getAttribute('role')).to.equal('radiogroup');
    const btns = items(el);
    expect(btns.length).to.equal(2);
    expect(btns[0].getAttribute('role')).to.equal('radio');
  });

  it('multi mode: role=group, items expose aria-pressed', async () => {
    const el = await fixture(html`<ds-button-group selection-mode="multi"></ds-button-group>`);
    el.items = [{ value: 'a', label: 'A' }, { value: 'b', label: 'B' }];
    await nextFrame();
    expect(el.getAttribute('role')).to.equal('group');
    expect(items(el)[0].hasAttribute('aria-pressed')).to.be.true;
  });

  it('none mode: role=group, no aria-checked / aria-pressed', async () => {
    const el = await fixture(html`<ds-button-group selection-mode="none"></ds-button-group>`);
    el.items = [{ value: 'a', label: 'A' }];
    await nextFrame();
    expect(el.getAttribute('role')).to.equal('group');
    const btn = items(el)[0];
    expect(btn.hasAttribute('aria-checked')).to.be.false;
    expect(btn.hasAttribute('aria-pressed')).to.be.false;
  });

  it('an unknown selection-mode falls back to single (radiogroup) — enumAttr', async () => {
    const el = await fixture(html`<ds-button-group selection-mode="bogus"></ds-button-group>`);
    el.items = [{ value: 'a', label: 'A' }];
    await nextFrame();
    expect(el.getAttribute('role')).to.equal('radiogroup');
  });
});

describe('ds-button-group — value & roving tabindex', () => {
  it('value round-trips and marks the selected radio aria-checked', async () => {
    const el = await fixture(html`<ds-button-group></ds-button-group>`);
    el.items = [{ value: 'a', label: 'A' }, { value: 'b', label: 'B' }];
    el.value = 'a';
    await nextFrame();
    expect(el.value).to.equal('a');
    expect(items(el)[0].getAttribute('aria-checked')).to.equal('true');
    expect(items(el)[1].getAttribute('aria-checked')).to.equal('false');
  });

  it('values getter parses a comma list (multi)', async () => {
    const el = await fixture(html`<ds-button-group selection-mode="multi"></ds-button-group>`);
    el.items = [{ value: 'a', label: 'A' }, { value: 'b', label: 'B' }];
    el.values = ['a', 'b'];
    await nextFrame();
    expect(el.values).to.eql(['a', 'b']);
  });

  it('exactly one item is a tab stop (roving tabindex)', async () => {
    const el = await fixture(html`<ds-button-group></ds-button-group>`);
    el.items = [{ value: 'a', label: 'A' }, { value: 'b', label: 'B' }, { value: 'c', label: 'C' }];
    await nextFrame();
    const stops = items(el).filter((b) => b.tabIndex === 0);
    expect(stops.length).to.equal(1);
  });
});

describe('ds-button-group — events', () => {
  it('clicking an item emits ds-button-group-change with the value (single)', async () => {
    const el = await fixture(html`<ds-button-group></ds-button-group>`);
    el.items = [{ value: 'a', label: 'A' }, { value: 'b', label: 'B' }];
    await nextFrame();
    setTimeout(() => items(el)[1].click());
    const ev = await oneEvent(el, 'ds-button-group-change');
    expect(ev.detail.value).to.equal('b');
  });

  it('multi click emits ds-button-group-change with a values array', async () => {
    const el = await fixture(html`<ds-button-group selection-mode="multi"></ds-button-group>`);
    el.items = [{ value: 'a', label: 'A' }, { value: 'b', label: 'B' }];
    await nextFrame();
    setTimeout(() => items(el)[0].click());
    const ev = await oneEvent(el, 'ds-button-group-change');
    expect(ev.detail.values).to.eql(['a']);
  });

  it('none mode emits ds-button-group-item-click', async () => {
    const el = await fixture(html`<ds-button-group selection-mode="none"></ds-button-group>`);
    el.items = [{ value: 'go', label: 'Go' }];
    await nextFrame();
    setTimeout(() => items(el)[0].click());
    const ev = await oneEvent(el, 'ds-button-group-item-click');
    expect(ev.detail.value).to.equal('go');
  });
});

describe('ds-button-group — escaping & select-all', () => {
  it('escapes item labels (renders as text, not HTML)', async () => {
    const el = await fixture(html`<ds-button-group></ds-button-group>`);
    el.items = [{ value: 'a', label: XSS }];
    await nextFrame();
    const label = el.querySelector('.ds-button-group__label');
    expect(label.querySelector('img'), 'label injected an <img>').to.not.exist;
    expect(label.textContent).to.contain('<img');
  });

  it('show-select-all + multi renders a real <ds-text-link> select-all control', async () => {
    const el = await fixture(html`<ds-button-group selection-mode="multi" show-select-all></ds-button-group>`);
    el.items = [{ value: 'a', label: 'A' }, { value: 'b', label: 'B' }];
    await nextFrame();
    const link = el.querySelector('ds-text-link.ds-button-group__select-all');
    expect(link, 'select-all link').to.exist;
    expect(link.getAttribute('label')).to.equal('Select all');
  });
});

describe('ds-button-group — teardown', () => {
  it('survives disconnect → reconnect without throwing or duplicating items', async () => {
    const el = await fixture(html`<ds-button-group></ds-button-group>`);
    el.items = [{ value: 'a', label: 'A' }, { value: 'b', label: 'B' }];
    await nextFrame();
    const parent = el.parentNode;
    el.remove();
    parent.appendChild(el);
    await nextFrame();
    expect(items(el).length).to.equal(2);
  });
});
