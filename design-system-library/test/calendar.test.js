/* ds-calendar — LIGHT-DOM composite. Renders a role=grid day grid (single: one
   panel, range: two), a role=dialog host, and (with show-footer) a Cancel/Apply
   row of real <ds-button>s. Selecting a day reflects `value` and fires
   ds-calendar-change. value/type are reflected properties (round-trip). */
import { fixture, html, expect, oneEvent, nextFrame } from '@open-wc/testing';
import '../src/components/calendar/calendar.js';

describe('ds-calendar — structure & a11y', () => {
  it('exposes the host as a labelled dialog', async () => {
    const el = await fixture(html`<ds-calendar value="2026-04-26"></ds-calendar>`);
    await nextFrame();
    expect(el.getAttribute('role')).to.equal('dialog');
    expect(el.getAttribute('aria-label')).to.equal('Date picker');
  });

  it('renders a role=grid with gridcell day buttons', async () => {
    const el = await fixture(html`<ds-calendar value="2026-04-26"></ds-calendar>`);
    await nextFrame();
    expect(el.querySelector('[role="grid"]'), 'grid').to.exist;
    expect(el.querySelectorAll('[role="gridcell"]').length).to.be.greaterThan(0);
  });

  it('exactly one day cell is a tab stop (roving focus)', async () => {
    const el = await fixture(html`<ds-calendar value="2026-04-26"></ds-calendar>`);
    await nextFrame();
    const stops = Array.from(el.querySelectorAll('.ds-calendar__day')).filter((c) => c.tabIndex === 0);
    expect(stops.length).to.equal(1);
  });
});

describe('ds-calendar — value & type', () => {
  it('value round-trips and marks the matching day aria-selected (single)', async () => {
    const el = await fixture(html`<ds-calendar value="2026-04-26"></ds-calendar>`);
    await nextFrame();
    expect(el.value).to.equal('2026-04-26');
    const cell = el.querySelector('[data-iso="2026-04-26"]');
    expect(cell, 'the selected day cell').to.exist;
    expect(cell.getAttribute('aria-selected')).to.equal('true');
  });

  it('an unknown type falls back to single (one panel) — enumAttr', async () => {
    const el = await fixture(html`<ds-calendar type="bogus" value="2026-04-26"></ds-calendar>`);
    await nextFrame();
    expect(el.classList.contains('ds-calendar--single')).to.be.true;
    expect(el.querySelectorAll('.ds-calendar__panel').length).to.equal(1);
  });

  it('type="range" renders two linked month panels and round-trips its value', async () => {
    const el = await fixture(html`<ds-calendar type="range" value="2026-04-01/2026-04-10"></ds-calendar>`);
    await nextFrame();
    expect(el.value).to.equal('2026-04-01/2026-04-10');
    expect(el.querySelectorAll('.ds-calendar__panel').length).to.equal(2);
  });

  it('the value property setter reflects to the attribute', async () => {
    const el = await fixture(html`<ds-calendar></ds-calendar>`);
    await nextFrame();
    el.value = '2026-05-01';
    expect(el.getAttribute('value')).to.equal('2026-05-01');
  });
});

describe('ds-calendar — min / max gating', () => {
  it('disables day cells before `min`', async () => {
    const el = await fixture(html`<ds-calendar value="2026-04-15" min="2026-04-10"></ds-calendar>`);
    await nextFrame();
    const before = el.querySelector('[data-iso="2026-04-05"]');
    expect(before.disabled, 'a day before min is disabled').to.be.true;
    expect(before.getAttribute('aria-disabled')).to.equal('true');
  });
});

describe('ds-calendar — footer & events', () => {
  it('show-footer renders Cancel / Apply as real <ds-button>s', async () => {
    const el = await fixture(html`<ds-calendar value="2026-04-26" show-footer></ds-calendar>`);
    await nextFrame();
    const btns = el.querySelectorAll('.ds-calendar__footer ds-button');
    expect(btns.length).to.equal(2);
  });

  it('clicking a day emits ds-calendar-change with a detail payload', async () => {
    const el = await fixture(html`<ds-calendar value="2026-04-26"></ds-calendar>`);
    await nextFrame();
    const cell = el.querySelector('[data-iso="2026-04-15"]');
    setTimeout(() => cell.click());
    const ev = await oneEvent(el, 'ds-calendar-change');
    expect(ev.detail).to.exist;
    expect(ev.detail.value).to.equal('2026-04-15');
  });

  it('Apply emits ds-calendar-apply', async () => {
    const el = await fixture(html`<ds-calendar value="2026-04-26" show-footer></ds-calendar>`);
    await nextFrame();
    const apply = el.querySelector('[data-cal-action="apply"]');
    setTimeout(() => apply.click());
    const ev = await oneEvent(el, 'ds-calendar-apply');
    expect(ev).to.exist;
  });
});

describe('ds-calendar — teardown', () => {
  it('survives disconnect → reconnect without throwing or duplicating the grid', async () => {
    const el = await fixture(html`<ds-calendar value="2026-04-26"></ds-calendar>`);
    await nextFrame();
    const parent = el.parentNode;
    el.remove();
    parent.appendChild(el);
    await nextFrame();
    expect(el.querySelectorAll('[role="grid"]').length).to.equal(1);
  });
});
