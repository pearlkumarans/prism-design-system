/* ds-overlay — the scrim behind modals/drawers. The host itself is the layer.
   Covers a11y (decorative / aria-hidden), the type enumAttr default ('dim') +
   invalid normalisation, the open property, click-to-dismiss (and [static]
   suppression), scroll-lock bookkeeping, and disconnect cleanup. */
import { fixture, html, expect, nextFrame, oneEvent } from '@open-wc/testing';
import '../src/components/overlay/overlay.js';

describe('ds-overlay — structure & a11y', () => {
  it('is decorative: hidden from the a11y tree', async () => {
    const el = await fixture(html`<ds-overlay></ds-overlay>`);
    expect(el.getAttribute('aria-hidden')).to.equal('true');
  });
});

describe('ds-overlay — type (enumAttr)', () => {
  it('defaults to "dim" and reflects it to the attribute', async () => {
    const el = await fixture(html`<ds-overlay></ds-overlay>`);
    expect(el.type).to.equal('dim');
    expect(el.getAttribute('type')).to.equal('dim');
  });

  it('normalises an invalid type back to "dim"', async () => {
    const el = await fixture(html`<ds-overlay type="bogus"></ds-overlay>`);
    expect(el.type).to.equal('dim');
    expect(el.getAttribute('type')).to.equal('dim');
  });

  it('keeps a valid type', async () => {
    const el = await fixture(html`<ds-overlay type="blur"></ds-overlay>`);
    expect(el.type).to.equal('blur');
    expect(el.getAttribute('type')).to.equal('blur');
  });
});

describe('ds-overlay — open property', () => {
  it('reflects the open property to/from the attribute', async () => {
    const el = await fixture(html`<ds-overlay></ds-overlay>`);
    expect(el.open).to.be.false;
    el.open = true;
    expect(el.hasAttribute('open')).to.be.true;
    expect(el.open).to.be.true;
    el.open = false;
    expect(el.hasAttribute('open')).to.be.false;
  });
});

describe('ds-overlay — scroll lock', () => {
  it('locks background scroll while open (non-transparent)', async () => {
    const el = await fixture(html`<ds-overlay open></ds-overlay>`);
    expect(el._locked).to.be.true;
  });

  it('does not lock a transparent click-trap overlay', async () => {
    const el = await fixture(html`<ds-overlay open type="transparent"></ds-overlay>`);
    expect(el._locked).to.be.false;
  });

  it('releases the lock when open is removed', async () => {
    const el = await fixture(html`<ds-overlay open></ds-overlay>`);
    expect(el._locked).to.be.true;
    el.open = false;
    await nextFrame();
    expect(el._locked).to.be.false;
  });
});

describe('ds-overlay — dismiss', () => {
  it('fires ds-dismiss on a click of the layer itself', async () => {
    const el = await fixture(html`<ds-overlay open></ds-overlay>`);
    setTimeout(() => el.click());
    const ev = await oneEvent(el, 'ds-dismiss');
    expect(ev).to.exist;
  });

  it('suppresses ds-dismiss when [static]', async () => {
    const el = await fixture(html`<ds-overlay open static></ds-overlay>`);
    let fired = 0;
    el.addEventListener('ds-dismiss', () => (fired += 1));
    el.click();
    await nextFrame();
    expect(fired, 'a static overlay must not dismiss on click').to.equal(0);
  });
});

describe('ds-overlay — teardown', () => {
  it('releases the scroll lock on disconnect', async () => {
    const el = await fixture(html`<ds-overlay open></ds-overlay>`);
    expect(el._locked).to.be.true;
    el.remove();
    expect(el._locked, 'disconnect must unlock scroll').to.be.false;
  });
});
