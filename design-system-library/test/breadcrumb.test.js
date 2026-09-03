/* ds-breadcrumb — wraps slotted crumbs in an <ol>, injects separators, marks the
   last item current, and collapses the middle into a "…" overflow menu past
   max-visible. Covers structure, spec default size, aria semantics, separators,
   home icon, overflow collapse, reactivity, separator escaping, a11y, and the
   no-leaked-listener teardown (overflow menu adds a document listener only when
   open; a plain mount/unmount must not leak). */
import { fixture, html, expect, nextFrame } from '@open-wc/testing';
import { trackListeners } from './helpers/listeners.js';
import '../src/components/breadcrumb/breadcrumb.js';

const trail = () => html`
  <ds-breadcrumb>
    <a href="/">Settings</a>
    <a href="/security">Security</a>
    <span>Policies</span>
  </ds-breadcrumb>`;

const list = (el) => el.querySelector('ol.ds-breadcrumb__list');
const items = (el) => el.querySelectorAll('.ds-breadcrumb__item');
const seps = (el) => el.querySelectorAll('.ds-breadcrumb__separator');

describe('ds-breadcrumb — structure & semantics', () => {
  it('renders an <ol> with one item per crumb', async () => {
    const el = await fixture(trail());
    await nextFrame();
    expect(list(el), 'ordered list missing').to.exist;
    expect(items(el).length).to.equal(3);
  });

  it('applies navigation role + default aria-label', async () => {
    const el = await fixture(trail());
    await nextFrame();
    expect(el.getAttribute('role')).to.equal('navigation');
    expect(el.getAttribute('aria-label')).to.equal('Breadcrumb');
  });

  it('applies the spec default size class (small)', async () => {
    const el = await fixture(trail());
    await nextFrame();
    expect(el.classList.contains('ds-breadcrumb')).to.be.true;
    expect(el.classList.contains('ds-breadcrumb--small')).to.be.true;
  });

  it('reflects size="medium"', async () => {
    const el = await fixture(html`
      <ds-breadcrumb size="medium"><a href="/">A</a><span>B</span></ds-breadcrumb>`);
    await nextFrame();
    expect(el.classList.contains('ds-breadcrumb--medium')).to.be.true;
    expect(el.classList.contains('ds-breadcrumb--small')).to.be.false;
  });

  it('marks the last crumb as the current page', async () => {
    const el = await fixture(trail());
    await nextFrame();
    const last = items(el)[items(el).length - 1];
    expect(last.classList.contains('ds-breadcrumb__item--current')).to.be.true;
    expect(last.querySelector('[aria-current="page"]')).to.exist;
  });

  it('inserts a separator between crumbs (n-1 for n items)', async () => {
    const el = await fixture(trail());
    await nextFrame();
    expect(seps(el).length).to.equal(2);
  });

  it('does not mark non-last crumbs as current', async () => {
    const el = await fixture(trail());
    await nextFrame();
    expect(el.querySelectorAll('[aria-current="page"]').length).to.equal(1);
  });
});

describe('ds-breadcrumb — home icon & rtl', () => {
  it('renders a home icon on the first crumb when home-icon is set', async () => {
    const el = await fixture(html`
      <ds-breadcrumb home-icon><a href="/">Home</a><span>Here</span></ds-breadcrumb>`);
    await nextFrame();
    expect(el.querySelector('.ds-breadcrumb__home ds-icon')).to.exist;
  });

  it('mirrors rtl onto the host as dir="rtl"', async () => {
    const el = await fixture(html`
      <ds-breadcrumb rtl><a href="/">A</a><span>B</span></ds-breadcrumb>`);
    await nextFrame();
    expect(el.getAttribute('dir')).to.equal('rtl');
  });
});

describe('ds-breadcrumb — overflow collapse', () => {
  const long = () => html`
    <ds-breadcrumb overflow>
      <a href="/1">One</a>
      <a href="/2">Two</a>
      <a href="/3">Three</a>
      <a href="/4">Four</a>
      <span>Five</span>
    </ds-breadcrumb>`;

  it('collapses the middle into a "…" overflow trigger past max-visible', async () => {
    const el = await fixture(long());
    await nextFrame();
    const collapsed = el.querySelector('.ds-breadcrumb__item--collapsed');
    expect(collapsed, 'collapsed token missing').to.exist;
    expect(collapsed.querySelector('.ds-breadcrumb__overflow-btn')).to.exist;
  });

  it('keeps the first crumb, the last two ancestors + current visible when collapsed', async () => {
    const el = await fixture(long());
    await nextFrame();
    // first + '…' + last-3 + last-2 + last-1  ⇒ 4 real items + 1 collapsed
    const real = el.querySelectorAll('.ds-breadcrumb__item:not(.ds-breadcrumb__item--collapsed)');
    expect(real.length).to.equal(4);
    expect(el.querySelector('.ds-breadcrumb__item--current [aria-current="page"]').textContent).to.equal('Five');
  });
});

describe('ds-breadcrumb — reactivity & escaping', () => {
  it('re-renders when a crumb attribute changes after mount', async () => {
    const el = await fixture(html`
      <ds-breadcrumb><a href="/">A</a><a href="/b">B</a><span>C</span></ds-breadcrumb>`);
    await nextFrame();
    expect(el.classList.contains('ds-breadcrumb--small')).to.be.true;
    el.setAttribute('size', 'medium');
    await nextFrame();
    expect(el.classList.contains('ds-breadcrumb--medium')).to.be.true;
  });

  it('escapes a hostile separator name — no attribute breakout on the ds-icon', async () => {
    const el = await fixture(html`
      <ds-breadcrumb separator='x" onload="alert(1)'><a href="/">A</a><span>B</span></ds-breadcrumb>`);
    await nextFrame();
    const sepIcon = el.querySelector('.ds-breadcrumb__separator ds-icon');
    expect(sepIcon).to.exist;
    expect(sepIcon.hasAttribute('onload')).to.be.false;
  });
});

describe('ds-breadcrumb — a11y & teardown', () => {
  it('is accessible', async () => {
    const el = await fixture(trail());
    await nextFrame();
    await expect(el).to.be.accessible({ ignoredRules: ['color-contrast'] });
  });

  it('leaks no global listener across mount → unmount', async () => {
    const t = trackListeners();
    try {
      const el = await fixture(trail());
      await nextFrame();
      el.remove();
      expect(t.net(), `leaked: ${JSON.stringify(t.byType())}`).to.equal(0);
    } finally {
      t.restore();
    }
  });

  it('flushes an open overflow menu on disconnect', async () => {
    const el = await fixture(trail());
    await nextFrame();
    let flushed = false;
    el._closeOverflow = () => { flushed = true; el._closeOverflow = null; };
    el.remove();
    expect(flushed, 'disconnectedCallback did not run _closeOverflow').to.be.true;
  });

  it('survives disconnect → reconnect without throwing or duplicating the list', async () => {
    const el = await fixture(trail());
    await nextFrame();
    const parent = el.parentNode;
    el.remove();
    parent.appendChild(el);
    await nextFrame();
    expect(el.querySelectorAll('ol.ds-breadcrumb__list').length).to.equal(1);
  });
});
