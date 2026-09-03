/* ds-drawer — an anchored side sheet: overlay + panel (header / scrolling body /
   footer). Covers build/structure, spec defaults (right / m / modal), the
   show-* toggles, slot distribution, open/close via attribute + methods, the
   open/close/back events, Esc + overlay dismissal, aria semantics, the title
   textContent contract, reactivity, a11y, and — the load-bearing case — no
   leaked global keydown listener across an open→remove teardown. */
import { fixture, html, expect, nextFrame, oneEvent } from '@open-wc/testing';
import { trackListeners } from './helpers/listeners.js';
import '../src/components/drawer/drawer.js';

const panel = (el) => el.querySelector('[data-panel]');
const overlay = (el) => el.querySelector('[data-overlay]');
const titleEl = (el) => el.querySelector('[data-title]');
const body = (el) => el.querySelector('[data-body]');

describe('ds-drawer — structure & defaults', () => {
  it('builds an overlay + a dialog panel with header, body, footer', async () => {
    const el = await fixture(html`<ds-drawer title="Filters"></ds-drawer>`);
    expect(overlay(el), 'overlay missing').to.exist;
    expect(panel(el), 'panel missing').to.exist;
    expect(panel(el).getAttribute('role')).to.equal('dialog');
    expect(el.querySelector('[data-header]')).to.exist;
    expect(body(el)).to.exist;
    expect(el.querySelector('[data-footer]')).to.exist;
  });

  it('applies the spec defaults (side right / size m / modal true)', async () => {
    const el = await fixture(html`<ds-drawer title="X"></ds-drawer>`);
    expect(el.dataset.side).to.equal('right');
    expect(el.dataset.size).to.equal('m');
    expect(el.dataset.modal).to.equal('true');
    expect(panel(el).getAttribute('aria-modal')).to.equal('true');
  });

  it('reflects side + size', async () => {
    const el = await fixture(html`<ds-drawer side="left" size="l" title="X"></ds-drawer>`);
    expect(el.dataset.side).to.equal('left');
    expect(el.dataset.size).to.equal('l');
  });

  it('falls back to defaults on invalid enums', async () => {
    const el = await fixture(html`<ds-drawer side="top" size="xxl" title="X"></ds-drawer>`);
    expect(el.dataset.side).to.equal('right');
    expect(el.dataset.size).to.equal('m');
  });

  it('labels the panel by the title heading', async () => {
    const el = await fixture(html`<ds-drawer title="Filters"></ds-drawer>`);
    expect(titleEl(el).textContent).to.equal('Filters');
    expect(panel(el).getAttribute('aria-labelledby')).to.equal(titleEl(el).id);
    expect(titleEl(el).id).to.not.equal('');
  });

  it('non-modal reflects aria-modal false', async () => {
    const el = await fixture(html`<ds-drawer modal="false" title="X"></ds-drawer>`);
    expect(el.dataset.modal).to.equal('false');
    expect(panel(el).getAttribute('aria-modal')).to.equal('false');
  });
});

describe('ds-drawer — toggles & slots', () => {
  it('shows the close button by default and hides it with show-close="false"', async () => {
    const on = await fixture(html`<ds-drawer title="X"></ds-drawer>`);
    expect(on.querySelector('[data-close]').hidden).to.be.false;
    const off = await fixture(html`<ds-drawer title="X" show-close="false"></ds-drawer>`);
    expect(off.querySelector('[data-close]').hidden).to.be.true;
  });

  it('shows the back button only when show-back is set', async () => {
    const off = await fixture(html`<ds-drawer title="X"></ds-drawer>`);
    expect(off.querySelector('[data-back]').hidden).to.be.true;
    const on = await fixture(html`<ds-drawer title="X" show-back></ds-drawer>`);
    expect(on.querySelector('[data-back]').hidden).to.be.false;
  });

  it('hides the header / footer with show-header / show-footer = "false"', async () => {
    const el = await fixture(html`<ds-drawer title="X" show-header="false" show-footer="false"></ds-drawer>`);
    expect(el.querySelector('[data-header]').hidden).to.be.true;
    expect(el.querySelector('[data-footer]').hidden).to.be.true;
  });

  it('renders the subtitle when supplied', async () => {
    const el = await fixture(html`<ds-drawer title="X" subtitle="Sub"></ds-drawer>`);
    const sub = el.querySelector('[data-subtitle]');
    expect(sub.hidden).to.be.false;
    expect(sub.textContent).to.equal('Sub');
  });

  it('distributes slotted content into body / footer regions', async () => {
    const el = await fixture(html`
      <ds-drawer title="X">
        <p class="in-body">Body content</p>
        <span slot="footer-start"><a href="#" class="fstart">Reset</a></span>
        <button slot="footer" class="faction">Apply</button>
      </ds-drawer>`);
    expect(body(el).querySelector('.in-body'), 'default content not homed into body').to.exist;
    expect(el.querySelector('[data-footer-start] .fstart')).to.exist;
    expect(el.querySelector('[data-footer-actions] .faction')).to.exist;
  });

  it('mirrors rtl onto the host as dir="rtl"', async () => {
    const el = await fixture(html`<ds-drawer title="X" rtl></ds-drawer>`);
    expect(el.getAttribute('dir')).to.equal('rtl');
  });
});

describe('ds-drawer — open / close lifecycle', () => {
  it('open() sets the open attribute and emits ds-drawer-open', async () => {
    const el = await fixture(html`<ds-drawer title="X"></ds-drawer>`);
    setTimeout(() => el.open());
    const ev = await oneEvent(el, 'ds-drawer-open');
    expect(ev).to.exist;
    expect(el.hasAttribute('open')).to.be.true;
  });

  it('close() removes the open attribute and emits ds-drawer-close', async () => {
    const el = await fixture(html`<ds-drawer title="X" open></ds-drawer>`);
    setTimeout(() => el.close());
    const ev = await oneEvent(el, 'ds-drawer-close');
    expect(ev).to.exist;
    expect(el.hasAttribute('open')).to.be.false;
  });

  /* NOTE: dismissal fires ds-drawer-close TWICE — once from _onClose (no reason)
     and once from _dismiss (with the reason). We collect every close event and
     assert the reason is delivered by at least one of them (current behavior;
     see the suspected-defect note in the report). */
  const collectCloseReasons = (el) => {
    const reasons = [];
    el.addEventListener('ds-drawer-close', (e) => reasons.push(e.detail?.reason));
    return reasons;
  };

  it('Escape dismisses a modal drawer with reason "esc"', async () => {
    const el = await fixture(html`<ds-drawer title="X" open></ds-drawer>`);
    await nextFrame();
    const reasons = collectCloseReasons(el);
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
    await nextFrame();
    expect(reasons).to.include('esc');
    expect(el.hasAttribute('open')).to.be.false;
  });

  it('overlay click dismisses with reason "overlay" by default', async () => {
    const el = await fixture(html`<ds-drawer title="X" open></ds-drawer>`);
    await nextFrame();
    const reasons = collectCloseReasons(el);
    overlay(el).click();
    await nextFrame();
    expect(reasons).to.include('overlay');
    expect(el.hasAttribute('open')).to.be.false;
  });

  it('dismiss-on-overlay="false" keeps the drawer open on overlay click', async () => {
    const el = await fixture(html`<ds-drawer title="X" open dismiss-on-overlay="false"></ds-drawer>`);
    await nextFrame();
    overlay(el).click();
    await nextFrame();
    expect(el.hasAttribute('open')).to.be.true;
  });

  it('the back button emits ds-drawer-back', async () => {
    const el = await fixture(html`<ds-drawer title="X" show-back open></ds-drawer>`);
    await nextFrame();
    setTimeout(() => el.querySelector('[data-back]').click());
    const ev = await oneEvent(el, 'ds-drawer-back');
    expect(ev).to.exist;
  });
});

describe('ds-drawer — escaping & reactivity', () => {
  it('a hostile title cannot inject markup (rendered as textContent)', async () => {
    const el = await fixture(html`<ds-drawer title="<img src=x onerror=alert(1)>"></ds-drawer>`);
    await nextFrame();
    expect(el.querySelector('[data-title] img')).to.not.exist;
    expect(titleEl(el).textContent).to.contain('<img');
  });

  it('updates the title text when the attribute changes after mount', async () => {
    const el = await fixture(html`<ds-drawer title="Old"></ds-drawer>`);
    el.setAttribute('title', 'New');
    await nextFrame();
    expect(titleEl(el).textContent).to.equal('New');
  });
});

describe('ds-drawer — a11y & teardown', () => {
  it('is accessible when open', async () => {
    const el = await fixture(html`<ds-drawer title="Filters" open><p>Body</p></ds-drawer>`);
    await nextFrame();
    await expect(el).to.be.accessible({ ignoredRules: ['color-contrast'] });
  });

  it('leaks no global keydown listener across an open → remove teardown', async () => {
    const t = trackListeners();
    try {
      const el = await fixture(html`<ds-drawer title="X" open></ds-drawer>`);
      await nextFrame();
      el.remove();
      expect(t.net(), `leaked: ${JSON.stringify(t.byType())}`).to.equal(0);
    } finally {
      t.restore();
    }
  });

  it('balances its keydown listener across repeated open/close cycles', async () => {
    const t = trackListeners();
    try {
      const el = await fixture(html`<ds-drawer title="X"></ds-drawer>`);
      // Each open adds the document keydown listener; each close removes it.
      // (Leave the drawer closed & attached — disconnect also calls removeEventListener,
      //  which the raw call-counting tracker would read as an extra -1, not a leak.)
      for (let i = 0; i < 5; i++) { el.open(); await nextFrame(); el.close(); await nextFrame(); }
      expect(t.net(), `accumulated: ${JSON.stringify(t.byType())}`).to.equal(0);
    } finally {
      t.restore();
    }
  });

  it('survives disconnect → reconnect without duplicating the panel', async () => {
    const el = await fixture(html`<ds-drawer title="Filters"></ds-drawer>`);
    const parent = el.parentNode;
    el.remove();
    parent.appendChild(el);
    await nextFrame();
    expect(el.querySelectorAll('[data-panel]').length).to.equal(1);
  });
});
