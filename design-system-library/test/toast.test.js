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
    expect(root.classList.contains('ds-toast--filled'), 'default style-variant').to.be.true;
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
    el.setAttribute('style-variant', 'filled');
    await nextFrame();
    expect(el._root.querySelector('.ds-toast__icon ds-icon'), 'same ds-icon node (not re-parsed)').to.equal(icon);
    expect(el._root.classList.contains('ds-toast--filled'), 'style-variant class applied').to.be.true;
  });
});
