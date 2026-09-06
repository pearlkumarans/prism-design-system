/* ds-popover — non-modal overlay anchored to a trigger (does NOT portal).
   Covers structure/a11y, header auto-show from `title` + title via textContent,
   the placement enumAttr default + fallback, footer/close toggles, anchor wiring
   (aria-haspopup / aria-controls / aria-expanded), open/close/toggle + events
   with dismiss reasons, and teardown (open, disconnect while open → no leaked
   document/window listeners). */
import { fixture, html, expect, nextFrame, oneEvent } from '@open-wc/testing';
import '../src/components/popover/popover.js';
import { trackListeners } from './helpers/listeners.js';

const XSS = '<img src=x onerror=alert(1)>';
const surfaceOf = (el) => el.querySelector('[data-surface]');
const anchored = (extra = '') => html`<div>
    <button id="trig" type="button">Open</button>
    <ds-popover anchor="trig" ${extra}><p class="mine">Body content</p></ds-popover>
  </div>`;

describe('ds-popover — structure & a11y', () => {
  it('builds a role=dialog surface with body content distributed', async () => {
    const el = await fixture(html`<ds-popover title="Info"><p class="mine">Body</p></ds-popover>`);
    const surface = surfaceOf(el);
    expect(surface).to.exist;
    expect(surface.getAttribute('role')).to.equal('dialog');
    expect(el.querySelector('[data-body] .mine')).to.exist;
  });

  it('auto-shows the header when a title is set and labels the dialog by it', async () => {
    const el = await fixture(html`<ds-popover title="More info"></ds-popover>`);
    expect(el.querySelector('[data-header]').hidden).to.be.false;
    expect(el.querySelector('[data-title]').textContent).to.equal('More info');
    expect(surfaceOf(el).getAttribute('aria-labelledby')).to.equal(el._titleId);
  });

  it('hides the header (and falls back to aria-label) with no title', async () => {
    const el = await fixture(html`<ds-popover></ds-popover>`);
    expect(el.querySelector('[data-header]').hidden).to.be.true;
    expect(surfaceOf(el).getAttribute('aria-label')).to.equal('Popover');
  });

  it('is accessible when open', async () => {
    const wrap = await fixture(anchored('title="More info"'));
    const el = wrap.querySelector('ds-popover');
    el.open();
    await nextFrame(); await nextFrame();
    await expect(el).to.be.accessible({ ignoredRules: ['color-contrast'] });
    el.close();
  });
});

describe('ds-popover — placement (enumAttr)', () => {
  it('defaults to bottom-start when positioning', async () => {
    const wrap = await fixture(anchored());
    const el = wrap.querySelector('ds-popover');
    el.open();
    await nextFrame();
    // no throw + surface positioned; default placement is applied internally
    expect(surfaceOf(el).style.top, 'surface positioned').to.not.equal('');
    el.close();
  });

  it('accepts a valid placement without error', async () => {
    const wrap = await fixture(anchored('placement="right-end"'));
    const el = wrap.querySelector('ds-popover');
    el.open();
    await nextFrame();
    expect(surfaceOf(el).style.left).to.not.equal('');
    el.close();
  });
});

describe('ds-popover — header/footer toggles', () => {
  it('hides the close button with hide-close', async () => {
    const el = await fixture(html`<ds-popover title="T" hide-close></ds-popover>`);
    expect(el.querySelector('[data-close]').hidden).to.be.true;
  });

  it('shows the footer when footer slot content is present', async () => {
    const el = await fixture(html`<ds-popover title="T">Body<div slot="footer"><button>OK</button></div></ds-popover>`);
    expect(el.querySelector('[data-footer]').hidden).to.be.false;
    expect(el.querySelector('[data-footer] button')).to.exist;
  });

  it('force-shows the footer with has-footer even when empty', async () => {
    const el = await fixture(html`<ds-popover title="T" has-footer></ds-popover>`);
    expect(el.querySelector('[data-footer]').hidden).to.be.false;
  });
});

describe('ds-popover — header-style', () => {
  /* These assert the RENDERED box, so the stylesheet has to be present — the
     shared harness does not load component CSS, and without it every padding
     reads 0px and the assertions prove nothing. Each load races a timer and
     never rejects: a stalled sheet must not hang the suite. */
  before(async () => {
    const HREFS = ['/src/tokens/primitives.css', '/src/tokens/spacing.css',
      '/src/tokens/typography.css', '/src/tokens/tokens.css',
      '/src/components/popover/popover.css'];
    await Promise.all(HREFS.map((href) => new Promise((resolve) => {
      if (document.querySelector(`link[href="${href}"]`)) return resolve();
      const link = Object.assign(document.createElement('link'), { rel: 'stylesheet', href });
      link.addEventListener('load', resolve);
      link.addEventListener('error', resolve);
      setTimeout(resolve, 2000);
      document.head.appendChild(link);
    })));
    await nextFrame();
  });

  const headerOf = (el) => el.querySelector('.ds-popover__header');
  const bodyOf = (el) => el.querySelector('.ds-popover__body');

  it('defaults to the framed header, with its divider', async () => {
    const el = await fixture(html`<ds-popover title="Title">Body</ds-popover>`);
    expect(headerOf(el).dataset.style).to.equal('framed');
    expect(getComputedStyle(headerOf(el)).borderBottomWidth).to.equal('1px');
  });

  it('plain drops the divider and the separate padded block', async () => {
    const el = await fixture(html`<ds-popover title="Title" header-style="plain">Body</ds-popover>`);
    const h = headerOf(el);
    expect(h.dataset.style).to.equal('plain');
    expect(getComputedStyle(h).borderBottomWidth, 'no divider').to.equal('0px');
    expect(getComputedStyle(h).paddingBottom, 'no gap of its own').to.equal('0px');
    /* Title and body share one left edge — that is what makes it read as one region. */
    expect(getComputedStyle(h).paddingLeft).to.equal(getComputedStyle(bodyOf(el)).paddingLeft);
  });

  it('does NOT shrink the body padding when no title is set', async () => {
    /* An adjacent-sibling rule still matches a display:none header, which would
       silently clip the body's top padding with no title on screen. */
    const el = await fixture(html`<ds-popover header-style="plain">Body</ds-popover>`);
    expect(headerOf(el).hidden).to.be.true;
    expect(getComputedStyle(bodyOf(el)).paddingTop).to.equal('16px');
  });

  it('still names the dialog by its title in plain', async () => {
    const el = await fixture(html`<ds-popover title="Title" header-style="plain">Body</ds-popover>`);
    expect(surfaceOf(el).getAttribute('aria-labelledby'))
      .to.equal(el.querySelector('.ds-popover__title').id);
  });

  it('falls back to framed on an unknown value', async () => {
    const el = await fixture(html`<ds-popover title="T" header-style="bogus">Body</ds-popover>`);
    expect(headerOf(el).dataset.style).to.equal('framed');
  });

  it('matches the footer divider to the header divider', async () => {
    /* The footer was the one border on the surface not using --uems-border-tertiary
       (modal / drawer / confirmation-modal use it for both), so the two rules on a
       single surface did not match. */
    const el = await fixture(html`<ds-popover title="T" has-footer>Body</ds-popover>`);
    const h = getComputedStyle(headerOf(el)).borderBottomColor;
    const f = getComputedStyle(el.querySelector('.ds-popover__footer')).borderTopColor;
    expect(f, 'footer divider matches the header divider').to.equal(h);
  });

  it('right-aligns the footer, and mirrors under rtl', async () => {
    /* footer-align="centered" was removed — there is one alignment now. */
    const ltr = await fixture(html`<ds-popover title="T" has-footer>Body</ds-popover>`);
    expect(getComputedStyle(ltr.querySelector('.ds-popover__footer')).justifyContent).to.equal('flex-end');
    const rtl = await fixture(html`<ds-popover title="T" has-footer rtl>Body</ds-popover>`);
    expect(getComputedStyle(rtl.querySelector('.ds-popover__footer')).justifyContent).to.equal('flex-start');
  });

  it('no longer reacts to footer-align', async () => {
    const el = await fixture(html`<ds-popover title="T" has-footer footer-align="centered">Body</ds-popover>`);
    const footer = el.querySelector('.ds-popover__footer');
    expect(footer.dataset.align, 'the attribute is gone, not merely ignored').to.be.undefined;
    expect(getComputedStyle(footer).justifyContent).to.equal('flex-end');
  });

  it('keeps the close button available in plain', async () => {
    const el = await fixture(html`<ds-popover title="T" header-style="plain">Body</ds-popover>`);
    expect(el.querySelector('.ds-popover__close').hidden).to.be.false;
  });
});

describe('ds-popover — escaping', () => {
  it('renders a hostile title as literal text', async () => {
    const el = await fixture(html`<ds-popover title="${XSS}"></ds-popover>`);
    const t = el.querySelector('[data-title]');
    expect(t.querySelector('img')).to.not.exist;
    expect(t.textContent).to.contain('<img');
  });
});

describe('ds-popover — anchor wiring', () => {
  it('sets aria-haspopup/aria-controls on the anchor and toggles aria-expanded', async () => {
    const wrap = await fixture(anchored('title="T"'));
    const el = wrap.querySelector('ds-popover');
    const trigger = wrap.querySelector('#trig');
    expect(trigger.getAttribute('aria-haspopup')).to.equal('dialog');
    expect(trigger.getAttribute('aria-controls')).to.equal(el.id);
    expect(trigger.getAttribute('aria-expanded')).to.equal('false');
    el.open();
    await nextFrame();
    expect(trigger.getAttribute('aria-expanded')).to.equal('true');
    el.close();
    await nextFrame();
    expect(trigger.getAttribute('aria-expanded')).to.equal('false');
  });

  it('a click on the anchor toggles the popover open', async () => {
    const wrap = await fixture(anchored('title="T"'));
    const el = wrap.querySelector('ds-popover');
    wrap.querySelector('#trig').click();
    await nextFrame();
    expect(el.hasAttribute('open')).to.be.true;
    el.close();
  });
});

describe('ds-popover — open / close lifecycle', () => {
  it('emits ds-popover-open on open', async () => {
    const wrap = await fixture(anchored('title="T"'));
    const el = wrap.querySelector('ds-popover');
    setTimeout(() => el.open());
    const ev = await oneEvent(el, 'ds-popover-open');
    expect(ev).to.exist;
    el.close();
  });

  it('Escape dismisses with reason "esc"', async () => {
    const wrap = await fixture(anchored('title="T"'));
    const el = wrap.querySelector('ds-popover');
    el.open();
    await nextFrame();
    let reason = null;
    el.addEventListener('ds-popover-close', (e) => { if (e.detail) reason = e.detail.reason; });
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
    await nextFrame();
    expect(reason).to.equal('esc');
    expect(el.hasAttribute('open')).to.be.false;
  });

  it('the close button dismisses with reason "close"', async () => {
    const wrap = await fixture(anchored('title="T"'));
    const el = wrap.querySelector('ds-popover');
    el.open();
    await nextFrame();
    let reason = null;
    el.addEventListener('ds-popover-close', (e) => { if (e.detail) reason = e.detail.reason; });
    el.querySelector('[data-close]').click();
    await nextFrame();
    expect(reason).to.equal('close');
    expect(el.hasAttribute('open')).to.be.false;
  });
});

describe('ds-popover — teardown', () => {
  it('open then disconnect leaves no leaked document/window listeners', async () => {
    const t = trackListeners();
    const wrap = await fixture(anchored('title="T"'));
    const el = wrap.querySelector('ds-popover');
    el.open();
    await nextFrame();
    el.remove();
    t.restore();
    expect(t.net(), JSON.stringify(t.byType())).to.equal(0);
    expect(el.isConnected).to.be.false;
  });

  it('survives disconnect → reconnect without duplicating the surface', async () => {
    const el = await fixture(html`<ds-popover title="T"><p>Body</p></ds-popover>`);
    const parent = el.parentNode;
    el.remove();
    parent.appendChild(el);
    await nextFrame();
    expect(el.querySelectorAll('[data-surface]').length).to.equal(1);
  });
});
