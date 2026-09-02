/* ds-message-box — LIGHT-DOM composite notification panel. Collapsible card that
   groups slotted <ds-inline-alert> rows under two tabs (Alerts / Information) via
   a real ds-tab-bar-horizontal, with per-tab counts. Expand/collapse is animated
   IN PLACE (attribute-only path, no full re-render) so the body node is stable. */
import { fixture, html, expect, oneEvent, nextFrame } from '@open-wc/testing';
import '../src/components/message-box/message-box.js';

const box = (rows = `
  <ds-inline-alert slot="alerts" type="warning" title="A1"></ds-inline-alert>
  <ds-inline-alert slot="alerts" type="warning" title="A2"></ds-inline-alert>
  <ds-inline-alert slot="information" type="info" title="I1"></ds-inline-alert>
`) => fixture(`<ds-message-box>${rows}</ds-message-box>`);

describe('ds-message-box — structure & defaults', () => {
  it('renders the panel with the fixed "Notifications" title', async () => {
    const el = await box();
    await nextFrame();
    expect(el.querySelector('.ds-message-box'), 'panel root').to.exist;
    expect(el.querySelector('.ds-message-box__title').textContent).to.equal('Notifications');
  });

  it('is expanded by default — is-expanded class + aria-expanded=true', async () => {
    const el = await box();
    await nextFrame();
    expect(el.querySelector('.ds-message-box').classList.contains('is-expanded')).to.be.true;
    expect(el.querySelector('.ds-message-box__toggle').getAttribute('aria-expanded')).to.equal('true');
  });

  it('expanded="false" collapses — no is-expanded, aria-expanded=false', async () => {
    const el = await fixture(`<ds-message-box expanded="false"></ds-message-box>`);
    await nextFrame();
    expect(el.querySelector('.ds-message-box').classList.contains('is-expanded')).to.be.false;
    expect(el.querySelector('.ds-message-box__toggle').getAttribute('aria-expanded')).to.equal('false');
  });

  it('mounts a real ds-tab-bar-horizontal', async () => {
    const el = await box();
    await nextFrame();
    expect(el.querySelector('ds-tab-bar-horizontal.ds-message-box__tabs')).to.exist;
  });
});

describe('ds-message-box — tab counts', () => {
  it('derives per-tab counts from the slotted rows', async () => {
    const el = await box();
    await nextFrame();
    const tabs = el.querySelector('.ds-message-box__tabs');
    expect(tabs.items[0].badge.text).to.equal('2');   // alerts
    expect(tabs.items[1].badge.text).to.equal('1');   // information
  });

  it('an explicit count attribute overrides the derived count', async () => {
    const el = await fixture(`
      <ds-message-box alerts-count="12">
        <ds-inline-alert slot="alerts" type="warning" title="A1"></ds-inline-alert>
      </ds-message-box>`);
    await nextFrame();
    const tabs = el.querySelector('.ds-message-box__tabs');
    expect(tabs.items[0].badge.text).to.equal('12');
  });

  it('show-badge renders a total-count ds-badge in the header', async () => {
    const el = await box();
    await nextFrame();
    el.setAttribute('show-badge', '');
    await nextFrame();
    const badge = el.querySelector('.ds-message-box__count');
    expect(badge, 'total badge').to.exist;
    expect(badge.textContent).to.equal('3');
  });
});

describe('ds-message-box — tab switch & list', () => {
  it('the active tab drives which group populates the list', async () => {
    const el = await box();
    await nextFrame();
    // default tab = alerts → 2 rows
    expect(el.querySelector('.ds-message-box__list').children.length).to.equal(2);
    el.setAttribute('tab', 'information');
    await nextFrame();
    expect(el.querySelector('.ds-message-box__list').children.length).to.equal(1);
  });
});

describe('ds-message-box — expand / collapse in place', () => {
  it('collapsing keeps the SAME body node (animated in place, not re-rendered)', async () => {
    const el = await box();
    await nextFrame();
    const body = el.querySelector('.ds-message-box__body');
    el.setAttribute('expanded', 'false');
    await nextFrame();
    expect(el.querySelector('.ds-message-box__body')).to.equal(body);
    expect(body.getAttribute('aria-hidden'), 'body hidden when collapsed').to.equal('true');
    expect(el.querySelector('.ds-message-box').classList.contains('is-expanded')).to.be.false;
  });

  it('the toggle button emits a toggle event with the next expanded state', async () => {
    const el = await box();
    await nextFrame();
    setTimeout(() => el.querySelector('.ds-message-box__toggle').click());
    const ev = await oneEvent(el, 'toggle');
    expect(ev.detail.expanded).to.equal(false);
  });
});

describe('ds-message-box — teardown', () => {
  it('disconnect does not throw and cleans up (single panel on reconnect)', async () => {
    const el = await box();
    await nextFrame();
    const parent = el.parentNode;
    el.remove();          // disconnectedCallback: disconnect RO + stop late-children
    parent.appendChild(el);
    await nextFrame();
    expect(el.querySelectorAll('.ds-message-box').length).to.equal(1);
  });
});
