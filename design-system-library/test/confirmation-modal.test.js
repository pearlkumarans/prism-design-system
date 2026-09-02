/* ds-confirmation-modal — compact alertdialog that portals to <body> on open.
   Covers structure/a11y, the enumAttr variant default ('warning', NOT medium),
   text escaping via textContent, open/close portal + scroll-lock lifecycle,
   the action events, and disconnect cleanup (scroll lock released). */
import { fixture, html, expect, nextFrame, oneEvent } from '@open-wc/testing';
import '../src/components/confirmation-modal/confirmation-modal.js';

const XSS = '<img src=x onerror=alert(1)>';

describe('ds-confirmation-modal — structure & a11y', () => {
  it('builds the host with the component class and an alertdialog', async () => {
    const el = await fixture(html`<ds-confirmation-modal></ds-confirmation-modal>`);
    await nextFrame();
    expect(el.classList.contains('ds-confirmation-modal')).to.be.true;
    const dialog = el.querySelector('[data-dialog]');
    expect(dialog).to.exist;
    expect(dialog.getAttribute('role')).to.equal('alertdialog');
    expect(dialog.getAttribute('aria-modal')).to.equal('true');
    expect(dialog.getAttribute('aria-labelledby')).to.equal(el._titleId);
    expect(dialog.getAttribute('aria-describedby')).to.equal(el._bodyId);
  });

  it('renders the default title and footer button labels', async () => {
    const el = await fixture(html`<ds-confirmation-modal></ds-confirmation-modal>`);
    await nextFrame();
    expect(el._titleEl.textContent).to.equal('Modal title');
    expect(el._btns.primary.getAttribute('label')).to.equal('Continue');
    expect(el._btns.secondary.getAttribute('label')).to.equal('Cancel');
    /* Tertiary is hidden until a label is supplied. */
    expect(el._btns.tertiary.hidden).to.be.true;
  });
});

describe('ds-confirmation-modal — variant (enumAttr)', () => {
  it('defaults to the "warning" variant when none is set', async () => {
    const el = await fixture(html`<ds-confirmation-modal></ds-confirmation-modal>`);
    await nextFrame();
    expect(el.dataset.variant).to.equal('warning');
  });

  it('falls back to "warning" on an invalid variant', async () => {
    const el = await fixture(html`<ds-confirmation-modal variant="bogus"></ds-confirmation-modal>`);
    await nextFrame();
    expect(el.dataset.variant).to.equal('warning');
  });

  it('honours a valid variant and maps the primary button variant', async () => {
    const el = await fixture(html`<ds-confirmation-modal variant="destructive"></ds-confirmation-modal>`);
    await nextFrame();
    expect(el.dataset.variant).to.equal('destructive');
    expect(el._btns.primary.getAttribute('variant')).to.equal('destructive');
  });
});

describe('ds-confirmation-modal — escaping', () => {
  it('renders a hostile title as literal text, never HTML', async () => {
    const el = await fixture(html`<ds-confirmation-modal title="${XSS}"></ds-confirmation-modal>`);
    await nextFrame();
    expect(el._titleEl.querySelector('img'), 'title injected an <img>').to.not.exist;
    expect(el._titleEl.textContent).to.contain('<img');
  });

  it('renders a hostile description as literal text', async () => {
    const el = await fixture(html`<ds-confirmation-modal description="${XSS}"></ds-confirmation-modal>`);
    await nextFrame();
    expect(el._descEl.querySelector('img')).to.not.exist;
    expect(el._descEl.textContent).to.contain('<img');
  });
});

describe('ds-confirmation-modal — open / close lifecycle', () => {
  it('portals to <body> and locks scroll on open, restores on close', async () => {
    const el = await fixture(html`<ds-confirmation-modal></ds-confirmation-modal>`);
    const home = el.parentNode;
    el.open();
    await nextFrame();
    expect(el.parentNode, 'reparents to <body> on open').to.equal(document.body);
    expect(el._scrollLocked, 'scroll locked while open').to.be.true;
    el.close();
    await nextFrame();
    expect(el.parentNode, 'returns to its original parent on close').to.equal(home);
    expect(el._scrollLocked, 'scroll released on close').to.be.false;
  });

  it('emits ds-confirmation-open when opened', async () => {
    const el = await fixture(html`<ds-confirmation-modal></ds-confirmation-modal>`);
    setTimeout(() => el.open());
    const ev = await oneEvent(el, 'ds-confirmation-open');
    expect(ev).to.exist;
  });

  it('primary click fires ds-confirmation-primary and auto-closes', async () => {
    const el = await fixture(html`<ds-confirmation-modal></ds-confirmation-modal>`);
    el.open();
    await nextFrame();
    let fired = 0;
    el.addEventListener('ds-confirmation-primary', () => (fired += 1));
    el._btns.primary.querySelector('button').click();
    await nextFrame();
    expect(fired, 'primary event fired').to.equal(1);
    expect(el.hasAttribute('open'), 'modal auto-closes on primary').to.be.false;
  });
});

describe('ds-confirmation-modal — teardown', () => {
  it('releases the scroll lock when disconnected while open', async () => {
    const el = await fixture(html`<ds-confirmation-modal></ds-confirmation-modal>`);
    el.open();
    await nextFrame();
    expect(el._scrollLocked).to.be.true;
    el.remove();
    expect(el._scrollLocked, 'disconnect must unlock scroll').to.be.false;
    expect(el.isConnected).to.be.false;
  });
});
