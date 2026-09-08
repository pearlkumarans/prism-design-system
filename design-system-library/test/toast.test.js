/* ds-toast + ds-toaster — transient notifications.
   ds-toast: role/aria-live by status, escaped title/description, close event,
   persistent (duration=0 / error). ds-toaster: spawns escaped toasts and
   enforces `max`. */
import { fixture, html, expect, nextFrame } from '@open-wc/testing';
import '../src/components/toast/toast.js';

const XSS = '<img src=x onerror=alert(1)>';

describe('ds-toast — structure & status a11y', () => {
  it('info is polite/status', async () => {
    const el = await fixture(html`<ds-toast status="info" title="Hi"></ds-toast>`);
    await nextFrame();
    const root = el._root;
    expect(root.getAttribute('role')).to.equal('status');
    expect(root.getAttribute('aria-live')).to.equal('polite');
    expect(root.classList.contains('ds-toast--info')).to.be.true;
    expect(root.classList.contains('ds-toast--intense'), 'default style-variant').to.be.true;
  });

  it('error escalates to assertive/alert', async () => {
    const el = await fixture(html`<ds-toast status="error" title="Boom"></ds-toast>`);
    await nextFrame();
    expect(el._root.getAttribute('role')).to.equal('alert');
    expect(el._root.getAttribute('aria-live')).to.equal('assertive');
  });

  it('warning also uses assertive/alert (shared per the a11y table)', async () => {
    const el = await fixture(html`<ds-toast status="warning" title="Careful"></ds-toast>`);
    await nextFrame();
    expect(el._root.getAttribute('role')).to.equal('alert');
    expect(el._root.getAttribute('aria-live')).to.equal('assertive');
  });

  it('falls back to the info status class on an invalid status (enumAttr)', async () => {
    const el = await fixture(html`<ds-toast status="bogus" title="X"></ds-toast>`);
    await nextFrame();
    expect(el._root.classList.contains('ds-toast--info')).to.be.true;
  });
});

describe('ds-toast — escaping', () => {
  it('escapes the title', async () => {
    const el = await fixture(html`<ds-toast title="${XSS}"></ds-toast>`);
    await nextFrame();
    const t = el._root.querySelector('.ds-toast__title');
    expect(t.querySelector('img'), 'title injected an <img>').to.not.exist;
    expect(t.textContent).to.contain('<img');
  });

  it('escapes the description', async () => {
    const el = await fixture(html`<ds-toast title="T" description="${XSS}"></ds-toast>`);
    await nextFrame();
    const d = el._root.querySelector('.ds-toast__description');
    expect(d.querySelector('img')).to.not.exist;
    expect(d.textContent).to.contain('<img');
  });
});

describe('ds-toast — dismiss & persistence', () => {
  it('close button fires ds-toast-close and marks the toast exiting', async () => {
    const el = await fixture(html`<ds-toast title="Bye"></ds-toast>`);
    await nextFrame();
    let fired = 0;
    el.addEventListener('ds-toast-close', () => (fired += 1));
    el._root.querySelector('[data-close]').click();
    expect(fired, 'close event fired').to.equal(1);
    expect(el._exiting, 'toast entered its exit phase').to.be.true;
  });

  it('duration="0" is persistent: no countdown bar', async () => {
    const el = await fixture(html`<ds-toast title="Stay" duration="0"></ds-toast>`);
    await nextFrame();
    expect(el._root.querySelector('.ds-toast__timeout')).to.not.exist;
  });

  it('errors are persistent: no countdown bar even with a duration', async () => {
    const el = await fixture(html`<ds-toast status="error" title="Err" duration="5000"></ds-toast>`);
    await nextFrame();
    expect(el._root.querySelector('.ds-toast__timeout')).to.not.exist;
  });
});

describe('ds-toaster — spawning & max', () => {
  it('renders a region with an accessible label', async () => {
    const el = await fixture(html`<ds-toaster></ds-toaster>`);
    await nextFrame();
    expect(el.getAttribute('role')).to.equal('region');
    expect(el.getAttribute('aria-label')).to.equal('Notifications');
  });

  it('.toast() spawns a ds-toast with escaped content', async () => {
    const el = await fixture(html`<ds-toaster></ds-toaster>`);
    await nextFrame();
    const t = el.toast({ title: XSS, description: XSS });
    await nextFrame();
    expect(t.tagName.toLowerCase()).to.equal('ds-toast');
    expect(t.parentElement).to.equal(el);
    const title = t._root.querySelector('.ds-toast__title');
    expect(title.querySelector('img')).to.not.exist;
    expect(title.textContent).to.contain('<img');
  });

  it('.error() spawns an assertive toast', async () => {
    const el = await fixture(html`<ds-toaster></ds-toaster>`);
    await nextFrame();
    const t = el.error({ title: 'Down' });
    await nextFrame();
    expect(t.getAttribute('status')).to.equal('error');
    expect(t._root.getAttribute('role')).to.equal('alert');
  });

  it('enforces max: the oldest overflow toast is dismissed', async () => {
    const el = await fixture(html`<ds-toaster max="2"></ds-toaster>`);
    await nextFrame();
    const first = el.toast({ title: 'one' });
    el.toast({ title: 'two' });
    el.toast({ title: 'three' });   /* exceeds max=2 → oldest dismissed */
    await nextFrame();
    expect(first._exiting, 'oldest toast dismissed once max exceeded').to.be.true;
    const live = el._toasts().filter((t) => t.dataset.tExit === undefined);
    expect(live.length).to.be.at.most(2);
  });
});

describe('ds-toast — repaint-split', () => {
  it('keeps the status ds-icon node across a visual-only style-variant change', async () => {
    const el = await fixture(html`<ds-toast status="success" style-variant="subtle" title="Saved"></ds-toast>`);
    await nextFrame();
    const icon = el._root.querySelector('.ds-toast__icon ds-icon');
    expect(icon, 'status icon rendered').to.exist;
    el.setAttribute('style-variant', 'intense');
    await nextFrame();
    expect(el._root.querySelector('.ds-toast__icon ds-icon'), 'same ds-icon node (not re-parsed)').to.equal(icon);
    expect(el._root.classList.contains('ds-toast--intense'), 'style-variant class applied').to.be.true;
  });
});

describe('ds-toast — CTA (surface text-link)', () => {
  it('renders the CTA as a <ds-text-link> (not a button)', async () => {
    const el = await fixture(html`<ds-toast title="T" cta-text="View Details" cta-href="/x"></ds-toast>`);
    await nextFrame();
    const cta = el._root.querySelector('.ds-toast__cta');
    expect(cta, 'CTA rendered').to.exist;
    expect(cta.tagName.toLowerCase(), 'CTA is a ds-text-link, not a <button>').to.equal('ds-text-link');
    expect(cta.getAttribute('label')).to.equal('View Details');
    expect(cta.getAttribute('href')).to.equal('/x');
  });

  it('CTA variant tracks the toast style: subtle→primary (own colour), intense→surface (white)', async () => {
    const sub = await fixture(html`<ds-toast style-variant="subtle" status="error" title="T" cta-text="Retry"></ds-toast>`);
    await nextFrame();
    // subtle: the link uses its OWN primary colour, not a per-status custom colour
    expect(sub._root.querySelector('.ds-toast__cta').getAttribute('variant')).to.equal('primary');

    const int = await fixture(html`<ds-toast style-variant="intense" status="error" title="T" cta-text="Retry"></ds-toast>`);
    await nextFrame();
    expect(int._root.querySelector('.ds-toast__cta').getAttribute('variant')).to.equal('surface');
  });

  it('toggling style-variant swaps the CTA variant in place (no rebuild)', async () => {
    const el = await fixture(html`<ds-toast style-variant="subtle" title="T" cta-text="Go"></ds-toast>`);
    await nextFrame();
    const cta = el._root.querySelector('.ds-toast__cta');
    expect(cta.getAttribute('variant')).to.equal('primary');
    el.setAttribute('style-variant', 'intense');
    await nextFrame();
    expect(el._root.querySelector('.ds-toast__cta'), 'same CTA node (repaint, not rebuild)').to.equal(cta);
    expect(cta.getAttribute('variant')).to.equal('surface');
  });

  it('an event-only CTA (no href) still fires ds-toast-cta on click', async () => {
    const el = await fixture(html`<ds-toast title="T" cta-text="Undo"></ds-toast>`);
    await nextFrame();
    const cta = el._root.querySelector('.ds-toast__cta');
    expect(cta.tagName.toLowerCase()).to.equal('ds-text-link');
    expect(cta.hasAttribute('href'), 'event-only CTA has no href').to.be.false;
    let fired = 0;
    el.addEventListener('ds-toast-cta', () => (fired += 1));
    cta.click();
    expect(fired, 'ds-toast-cta fired').to.equal(1);
  });

  it('escapes CTA text passed to the link label', async () => {
    const el = await fixture(html`<ds-toast title="T" cta-text="${XSS}"></ds-toast>`);
    await nextFrame();
    const cta = el._root.querySelector('.ds-toast__cta');
    expect(cta.querySelector('img'), 'CTA injected an <img>').to.not.exist;
    expect(cta.textContent).to.contain('<img');
  });
});
