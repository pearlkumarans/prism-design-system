/* ds-fullscreen-modal — full-viewport dialog that portals to <body> on open.
   Covers structure/a11y, the leading-tone enumAttr default ('info') + invalid
   fallback, text escaping via textContent, open/close portal + scroll-lock
   lifecycle, action events, and disconnect cleanup. */
import { fixture, html, expect, nextFrame, oneEvent } from '@open-wc/testing';
import '../src/components/fullscreen-modal/fullscreen-modal.js';

const XSS = '<img src=x onerror=alert(1)>';

describe('ds-fullscreen-modal — structure & a11y', () => {
  it('builds the host with the component class and a dialog', async () => {
    const el = await fixture(html`<ds-fullscreen-modal></ds-fullscreen-modal>`);
    await nextFrame();
    expect(el.classList.contains('ds-fullscreen-modal')).to.be.true;
    const dialog = el.querySelector('[data-dialog]');
    expect(dialog).to.exist;
    expect(dialog.getAttribute('role')).to.equal('dialog');
    expect(dialog.getAttribute('aria-modal')).to.equal('true');
    expect(dialog.getAttribute('aria-labelledby')).to.equal(el._titleId);
  });

  it('renders default title and footer button labels', async () => {
    const el = await fixture(html`<ds-fullscreen-modal></ds-fullscreen-modal>`);
    await nextFrame();
    expect(el._titleEl.textContent).to.equal('Modal title');
    expect(el._btns.primary.getAttribute('label')).to.equal('Confirm');
    expect(el._btns.secondary.getAttribute('label')).to.equal('Cancel');
    expect(el._btns.tertiary.hidden).to.be.true;
  });

  it('hides the leading icon by default and shows it when leading-icon is set', async () => {
    const bare = await fixture(html`<ds-fullscreen-modal></ds-fullscreen-modal>`);
    await nextFrame();
    expect(bare._leading.hidden, 'icon off by default').to.be.true;
    const withIcon = await fixture(html`<ds-fullscreen-modal leading-icon="info-circle"></ds-fullscreen-modal>`);
    await nextFrame();
    expect(withIcon._leading.hidden).to.be.false;
    expect(withIcon._leadingIcon.getAttribute('name')).to.equal('info-circle');
  });
});

describe('ds-fullscreen-modal — leading-tone (enumAttr)', () => {
  it('defaults to the "info" tone', async () => {
    const el = await fixture(html`<ds-fullscreen-modal></ds-fullscreen-modal>`);
    await nextFrame();
    expect(el.dataset.tone).to.equal('info');
  });

  it('falls back to "info" on an invalid tone', async () => {
    const el = await fixture(html`<ds-fullscreen-modal leading-tone="bogus"></ds-fullscreen-modal>`);
    await nextFrame();
    expect(el.dataset.tone).to.equal('info');
  });

  it('honours a valid tone', async () => {
    const el = await fixture(html`<ds-fullscreen-modal leading-tone="success"></ds-fullscreen-modal>`);
    await nextFrame();
    expect(el.dataset.tone).to.equal('success');
  });
});

describe('ds-fullscreen-modal — escaping', () => {
  it('renders a hostile title as literal text', async () => {
    const el = await fixture(html`<ds-fullscreen-modal title="${XSS}"></ds-fullscreen-modal>`);
    await nextFrame();
    expect(el._titleEl.querySelector('img')).to.not.exist;
    expect(el._titleEl.textContent).to.contain('<img');
  });

  it('renders a hostile description as literal text', async () => {
    const el = await fixture(html`<ds-fullscreen-modal description="${XSS}"></ds-fullscreen-modal>`);
    await nextFrame();
    expect(el._descEl.querySelector('img')).to.not.exist;
    expect(el._descEl.textContent).to.contain('<img');
  });
});

describe('ds-fullscreen-modal — open / close lifecycle', () => {
  it('portals to <body> and locks scroll on open, restores on close', async () => {
    const el = await fixture(html`<ds-fullscreen-modal></ds-fullscreen-modal>`);
    const home = el.parentNode;
    el.open();
    await nextFrame();
    expect(el.parentNode).to.equal(document.body);
    expect(el._scrollLocked).to.be.true;
    el.close();
    await nextFrame();
    expect(el.parentNode).to.equal(home);
    expect(el._scrollLocked).to.be.false;
  });

  it('emits ds-fullscreen-open when opened', async () => {
    const el = await fixture(html`<ds-fullscreen-modal></ds-fullscreen-modal>`);
    setTimeout(() => el.open());
    const ev = await oneEvent(el, 'ds-fullscreen-open');
    expect(ev).to.exist;
  });

  it('primary click fires ds-fullscreen-primary and auto-closes', async () => {
    const el = await fixture(html`<ds-fullscreen-modal></ds-fullscreen-modal>`);
    el.open();
    await nextFrame();
    let fired = 0;
    el.addEventListener('ds-fullscreen-primary', () => (fired += 1));
    el._btns.primary.querySelector('button').click();
    await nextFrame();
    expect(fired).to.equal(1);
    expect(el.hasAttribute('open')).to.be.false;
  });
});

describe('ds-fullscreen-modal — teardown', () => {
  it('releases the scroll lock when disconnected while open', async () => {
    const el = await fixture(html`<ds-fullscreen-modal></ds-fullscreen-modal>`);
    el.open();
    await nextFrame();
    expect(el._scrollLocked).to.be.true;
    el.remove();
    expect(el._scrollLocked).to.be.false;
    expect(el.isConnected).to.be.false;
  });
});
