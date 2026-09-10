/* ds-beacon — passive coach-mark hotspot. A pulsing dot (ds-status-indicator)
   pinned to an anchor corner that reveals a tip (ds-popover) on hover/click.
   Covers: structure (trigger + pulse dot), a11y wiring, corner positioning, tip
   open/close + events, keyboard toggle, dismiss + persistence, and the seen gate. */
import { fixture, html, expect, nextFrame, oneEvent } from '@open-wc/testing';
import '../src/components/beacon/beacon.js';

function sweep() {
  document.querySelectorAll('ds-popover.ds-beacon__tip').forEach((n) => n.remove());
}
afterEach(() => sweep());

const beacon = (attrs = '') => html`
  <div>
    <button id="anc" style="position:absolute;left:100px;top:80px;width:120px;height:36px;">Anchor</button>
    <ds-beacon anchor="anc" title="New thing" body="Try it." ${''}></ds-beacon>
  </div>`;

async function mount(extra = {}) {
  const wrap = await fixture(html`
    <div>
      <button id="anc" style="position:fixed;left:100px;top:80px;width:120px;height:36px;">Anchor</button>
    </div>`);
  const el = document.createElement('ds-beacon');
  el.setAttribute('anchor', 'anc');
  el.setAttribute('title', 'New thing');
  el.setAttribute('body', 'Try it.');
  Object.entries(extra).forEach(([k, v]) => el.setAttribute(k, v));
  wrap.appendChild(el);
  await nextFrame();
  return el;
}

describe('ds-beacon — structure & a11y', () => {
  it('builds a trigger button wrapping a pulsing status-indicator dot', async () => {
    const el = await mount();
    const trigger = el.querySelector('.ds-beacon__trigger');
    expect(trigger).to.exist;
    expect(trigger.getAttribute('aria-haspopup')).to.equal('dialog');
    expect(trigger.getAttribute('aria-expanded')).to.equal('false');
    expect(trigger.getAttribute('aria-label')).to.equal('New thing');
    const dot = el.querySelector('ds-status-indicator[pulse]');
    expect(dot).to.exist;
    expect(dot.hasAttribute('pulse')).to.be.true;
  });

  it('pins the trigger to the anchor corner (JS sets inline left/top)', async () => {
    const el = await mount({ placement: 'top-end' });
    const trigger = el.querySelector('.ds-beacon__trigger');
    // CSS isn't loaded in the unit env; assert the positioning JS ran (inline coords).
    expect(trigger.style.left).to.not.equal('');
    expect(trigger.style.top).to.not.equal('');
  });
});

describe('ds-beacon — tip open/close', () => {
  it('opens the tip on trigger click and fires ds-beacon-open', async () => {
    const el = await mount({ trigger: 'click' });
    const opened = oneEvent(el, 'ds-beacon-open');
    el.querySelector('.ds-beacon__trigger').click();
    await opened;
    const tip = document.querySelector('ds-popover.ds-beacon__tip');
    expect(tip).to.exist;
    expect(tip.hasAttribute('open')).to.be.true;
    expect(tip.getAttribute('title')).to.equal('New thing');
    expect(el.querySelector('.ds-beacon__trigger').getAttribute('aria-expanded')).to.equal('true');
  });

  it('toggles closed on a second activation', async () => {
    const el = await mount({ trigger: 'click' });
    el.querySelector('.ds-beacon__trigger').click();
    await nextFrame();
    const closed = oneEvent(el, 'ds-beacon-close');
    el.querySelector('.ds-beacon__trigger').click();
    await closed;
    expect(el._open).to.be.false;
  });

  it('Enter on the trigger toggles the tip', async () => {
    const el = await mount();
    const opened = oneEvent(el, 'ds-beacon-open');
    el.querySelector('.ds-beacon__trigger').dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
    await opened;
    expect(el._open).to.be.true;
  });
});

describe('ds-beacon — dismiss & persistence', () => {
  const KEY = 'uems-beacon-seen:test.beacon.v1';
  afterEach(() => { try { localStorage.removeItem(KEY); } catch (_) {} });

  it('dismiss() hides the beacon, fires the event, and writes the seen flag', async () => {
    const el = await mount({ 'persist-key': 'test.beacon.v1', dismissible: '' });
    const dismissed = oneEvent(el, 'ds-beacon-dismiss');
    el.dismiss();
    await dismissed;
    expect(el.hidden).to.be.true;
    expect(localStorage.getItem(KEY)).to.equal('1');
  });

  it('does not render when already seen', async () => {
    localStorage.setItem(KEY, '1');
    const el = await mount({ 'persist-key': 'test.beacon.v1' });
    expect(el.hidden).to.be.true;
    expect(el.querySelector('.ds-beacon__trigger')).to.not.exist;
  });
});
