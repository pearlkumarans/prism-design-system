/* ds-modal — general-purpose left-aligned dialog that PORTALS to <body> on open.
   Covers structure/a11y, the size enumAttr default (md) + invalid fallback,
   title/description via textContent (native `title` attr stripped), the
   open/close portal + scroll-lock lifecycle, dismiss reasons + events, and
   disconnect-while-open cleanup (scroll released, no leaked document listeners).

   NB: this modal reparents the HOST to <body> on open, so `open` must NOT be in
   the fixture template (fixture() would return an empty wrapper). Open AFTER
   mount, and assert on the portaled node. */
import { fixture, html, expect, nextFrame, oneEvent } from '@open-wc/testing';
import '../src/components/modal/modal.js';
import { trackListeners } from './helpers/listeners.js';

const XSS = '<img src=x onerror=alert(1)>';
const dialogOf = (el) => el.querySelector('[data-dialog]');

describe('ds-modal — structure & a11y', () => {
  it('builds the host with the component class and a labelled dialog', async () => {
    const el = await fixture(html`<ds-modal title="Delete item"></ds-modal>`);
    expect(el.classList.contains('ds-modal')).to.be.true;
    const dialog = dialogOf(el);
    expect(dialog).to.exist;
    expect(dialog.getAttribute('role')).to.equal('dialog');
    expect(dialog.getAttribute('aria-modal')).to.equal('true');
    expect(dialog.getAttribute('aria-labelledby')).to.equal(el._titleId);
  });

  it('renders the title from the attribute and defaults when absent', async () => {
    const withTitle = await fixture(html`<ds-modal title="Confirm"></ds-modal>`);
    expect(withTitle.querySelector('[data-title]').textContent).to.equal('Confirm');
    expect(withTitle.hasAttribute('title'), 'native title attr stripped').to.be.false;
    const bare = await fixture(html`<ds-modal></ds-modal>`);
    expect(bare.querySelector('[data-title]').textContent).to.equal('Modal title');
  });

  it('shows the description and points aria-describedby at it when present', async () => {
    const el = await fixture(html`<ds-modal title="T" description="This cannot be undone."></ds-modal>`);
    const desc = el.querySelector('[data-desc]');
    expect(desc.hidden).to.be.false;
    expect(desc.textContent).to.equal('This cannot be undone.');
    expect(dialogOf(el).getAttribute('aria-describedby')).to.equal(el._descId);
  });

  it('renders a slotted body into the body region', async () => {
    const el = await fixture(html`<ds-modal title="T"><p class="mine">Hello</p></ds-modal>`);
    expect(el.querySelector('[data-body] .mine')).to.exist;
  });

  it('is accessible when open', async () => {
    const el = await fixture(html`<ds-modal title="Delete item" description="This cannot be undone."><p>Body.</p></ds-modal>`);
    el.setAttribute('open', '');
    await nextFrame(); await nextFrame();
    await expect(el).to.be.accessible({ ignoredRules: ['color-contrast'] });
    el.remove();
  });
});

describe('ds-modal — size (enumAttr)', () => {
  it('defaults to md', async () => {
    const el = await fixture(html`<ds-modal></ds-modal>`);
    expect(el.dataset.size).to.equal('md');
  });

  it('honours a valid size', async () => {
    const el = await fixture(html`<ds-modal size="lg"></ds-modal>`);
    expect(el.dataset.size).to.equal('lg');
  });

  it('falls back to md on an invalid size', async () => {
    const el = await fixture(html`<ds-modal size="huge"></ds-modal>`);
    expect(el.dataset.size).to.equal('md');
  });
});

describe('ds-modal — header/footer toggles', () => {
  it('hides the header/footer when show-header/show-footer="false"', async () => {
    const el = await fixture(html`<ds-modal title="T" show-header="false" show-footer="false"></ds-modal>`);
    expect(el.querySelector('[data-header]').hidden).to.be.true;
    expect(el.querySelector('[data-footer]').hidden).to.be.true;
  });
});

describe('ds-modal — escaping', () => {
  it('renders a hostile title as literal text', async () => {
    const el = await fixture(html`<ds-modal title="${XSS}"></ds-modal>`);
    const t = el.querySelector('[data-title]');
    expect(t.querySelector('img')).to.not.exist;
    expect(t.textContent).to.contain('<img');
  });

  it('renders a hostile description as literal text', async () => {
    const el = await fixture(html`<ds-modal title="T" description="${XSS}"></ds-modal>`);
    const d = el.querySelector('[data-desc]');
    expect(d.querySelector('img')).to.not.exist;
    expect(d.textContent).to.contain('<img');
  });
});

describe('ds-modal — open / close lifecycle', () => {
  it('portals to <body> and locks scroll on open, restores on close', async () => {
    const el = await fixture(html`<ds-modal title="T"></ds-modal>`);
    const home = el.parentNode;
    el.open();
    await nextFrame();
    expect(el.parentNode, 'reparents to <body> on open').to.equal(document.body);
    expect(el._scrollLocked, 'scroll locked while open').to.be.true;
    expect(document.body.style.overflow).to.equal('hidden');
    el.close();
    await nextFrame();
    expect(el.parentNode, 'returns to original parent on close').to.equal(home);
    expect(el._scrollLocked, 'scroll released on close').to.be.false;
  });

  it('emits ds-modal-open when opened', async () => {
    const el = await fixture(html`<ds-modal title="T"></ds-modal>`);
    setTimeout(() => el.open());
    const ev = await oneEvent(el, 'ds-modal-open');
    expect(ev).to.exist;
    el.close();
  });

  it('the close button dismisses with reason "close"', async () => {
    const el = await fixture(html`<ds-modal title="T"></ds-modal>`);
    el.open();
    await nextFrame();
    let reason = null;
    el.addEventListener('ds-modal-close', (e) => { if (e.detail) reason = e.detail.reason; });
    el.querySelector('[data-close]').click();
    await nextFrame();
    expect(reason).to.equal('close');
    expect(el.hasAttribute('open')).to.be.false;
  });

  it('Escape dismisses with reason "esc"', async () => {
    const el = await fixture(html`<ds-modal title="T"></ds-modal>`);
    el.open();
    await nextFrame();
    let reason = null;
    el.addEventListener('ds-modal-close', (e) => { if (e.detail) reason = e.detail.reason; });
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
    await nextFrame();
    expect(reason).to.equal('esc');
    expect(el.hasAttribute('open')).to.be.false;
  });

  it('overlay click is inert unless dismiss-on-overlay is set', async () => {
    const el = await fixture(html`<ds-modal title="T"></ds-modal>`);
    el.open();
    await nextFrame();
    el.querySelector('[data-overlay]').click();
    await nextFrame();
    expect(el.hasAttribute('open'), 'stays open without dismiss-on-overlay').to.be.true;
    el.querySelector('[data-overlay]')?.click?.();
    el.close();
  });
});

describe('ds-modal — teardown', () => {
  it('releases the scroll lock when disconnected while open', async () => {
    const el = await fixture(html`<ds-modal title="T"></ds-modal>`);
    el.open();
    await nextFrame();
    expect(el._scrollLocked).to.be.true;
    el.remove();
    expect(el._scrollLocked, 'disconnect must unlock scroll').to.be.false;
    expect(document.body.style.overflow, 'body overflow restored').to.not.equal('hidden');
    expect(el.isConnected).to.be.false;
  });

  it('leaves no leaked document listeners after opening then disconnecting', async () => {
    /* A leak is a POSITIVE net (a listener still registered after teardown).
       This modal portals itself to <body> on open, which fires an extra
       disconnect→reconnect: the disconnect calls removeEventListener('keydown')
       once as a no-op before it was ever added, so the tracked net can dip to
       -1. That is not a leak — assert the net is never positive. */
    const t = trackListeners();
    const el = await fixture(html`<ds-modal title="T"></ds-modal>`);
    el.open();
    await nextFrame();
    el.remove();
    t.restore();
    expect(t.net(), JSON.stringify(t.byType())).to.be.at.most(0);
  });
});
