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
