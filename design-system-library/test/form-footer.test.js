/* ds-form-footer — sticky form action bar. Left status/content area + a
   right-aligned button group. Covers structure, the show-left toggle,
   left-text escaping (textContent, not innerHTML), action slotting, RTL,
   reactive re-render, a11y, and teardown (no listener leak). */
import { fixture, html, expect, nextFrame } from '@open-wc/testing';
import '../src/components/form-footer/form-footer.js';
import { trackListeners } from './helpers/listeners.js';

const XSS = '<img src=x onerror=alert(1)>';
const leftArea = (el) => el.querySelector('.ds-form-footer__left');
const actionArea = (el) => el.querySelector('.ds-form-footer__actions');

describe('ds-form-footer — structure & defaults', () => {
  it('renders the component class, a left area and an actions area', async () => {
    const el = await fixture(html`<ds-form-footer></ds-form-footer>`);
    expect(el.classList.contains('ds-form-footer')).to.be.true;
    expect(leftArea(el), 'left area shown by default').to.exist;
    expect(actionArea(el), 'actions area always present').to.exist;
  });

  it('exposes group semantics with a default aria-label', async () => {
    const el = await fixture(html`<ds-form-footer></ds-form-footer>`);
    expect(el.getAttribute('role')).to.equal('group');
    expect(el.getAttribute('aria-label')).to.equal('Form actions');
  });

  it('uses a custom label as the aria-label', async () => {
    const el = await fixture(html`<ds-form-footer label="Save bar"></ds-form-footer>`);
    expect(el.getAttribute('aria-label')).to.equal('Save bar');
  });
});

describe('ds-form-footer — actions & left slotting', () => {
  it('re-homes slot="action" children into the actions area (moved, not cloned)', async () => {
    const el = await fixture(html`<ds-form-footer>
      <ds-button slot="action" variant="secondary">Cancel</ds-button>
      <ds-button slot="action" variant="primary">Save</ds-button>
    </ds-form-footer>`);
    const btns = actionArea(el).querySelectorAll('ds-button');
    expect(btns.length, 'both action buttons land in the actions area').to.equal(2);
    expect(btns[1].textContent).to.equal('Save');
  });

  it('re-homes unmarked default children as actions too', async () => {
    const el = await fixture(html`<ds-form-footer>
      <ds-button variant="primary">Apply</ds-button>
    </ds-form-footer>`);
    expect(actionArea(el).querySelectorAll('ds-button').length).to.equal(1);
  });

  it('places slot="left" content into the left area', async () => {
    const el = await fixture(html`<ds-form-footer>
      <span slot="left">Last saved 2 min ago</span>
      <ds-button slot="action">Save</ds-button>
    </ds-form-footer>`);
    expect(leftArea(el).textContent).to.contain('Last saved');
  });

  it('renders left-text as a status span', async () => {
    const el = await fixture(html`<ds-form-footer left-text="Draft"></ds-form-footer>`);
    const status = el.querySelector('.ds-form-footer__status');
    expect(status).to.exist;
    expect(status.textContent).to.equal('Draft');
  });
});

describe('ds-form-footer — show-left toggle', () => {
  it('collapses the left area (and adds the --no-left class) when show-left="false"', async () => {
    const el = await fixture(html`<ds-form-footer show-left="false" left-text="x"></ds-form-footer>`);
    expect(leftArea(el), 'left area removed').to.not.exist;
    expect(el.classList.contains('ds-form-footer--no-left')).to.be.true;
  });

  it('reactively re-renders when show-left flips', async () => {
    const el = await fixture(html`<ds-form-footer left-text="x"></ds-form-footer>`);
    expect(leftArea(el)).to.exist;
    el.setAttribute('show-left', 'false');
    await nextFrame();
    expect(leftArea(el)).to.not.exist;
    el.setAttribute('show-left', 'true');
    await nextFrame();
    expect(leftArea(el)).to.exist;
  });
});

describe('ds-form-footer — RTL', () => {
  it('mirrors via dir="rtl" from the rtl attribute', async () => {
    const el = await fixture(html`<ds-form-footer rtl></ds-form-footer>`);
    expect(el.getAttribute('dir')).to.equal('rtl');
  });
});

describe('ds-form-footer — escaping', () => {
  it('renders a hostile left-text as literal text, never HTML', async () => {
    const el = await fixture(html`<ds-form-footer left-text="${XSS}"></ds-form-footer>`);
    expect(el.querySelector('.ds-form-footer__left img'), 'no injected <img>').to.not.exist;
    expect(el.querySelector('.ds-form-footer__status').textContent).to.contain('<img');
  });
});

describe('ds-form-footer — a11y', () => {
  it('is accessible with content', async () => {
    const el = await fixture(html`<ds-form-footer left-text="Draft saved">
      <ds-button slot="action" variant="secondary">Cancel</ds-button>
      <ds-button slot="action" variant="primary">Save</ds-button>
    </ds-form-footer>`);
    await expect(el).to.be.accessible({ ignoredRules: ['color-contrast'] });
  });
});

describe('ds-form-footer — teardown', () => {
  it('connect → disconnect leaves no leaked global listeners', async () => {
    const t = trackListeners();
    const el = await fixture(html`<ds-form-footer left-text="x">
      <ds-button slot="action">Save</ds-button>
    </ds-form-footer>`);
    el.remove();
    t.restore();
    expect(t.net(), JSON.stringify(t.byType())).to.equal(0);
    expect(el.isConnected).to.be.false;
  });

  it('survives a disconnect → reconnect without throwing or duplicating regions', async () => {
    const el = await fixture(html`<ds-form-footer left-text="x"></ds-form-footer>`);
    const parent = el.parentNode;
    el.remove();
    parent.appendChild(el);
    await nextFrame();
    expect(el.querySelectorAll('.ds-form-footer__actions').length).to.equal(1);
  });
});

describe('ds-form-footer — repaint-split', () => {
  it('keeps the slotted action button across a visual-only live change (not detached)', async () => {
    const el = await fixture(html`<ds-form-footer>
      <ds-button slot="action" variant="primary">Save</ds-button>
    </ds-form-footer>`);
    const btn = actionArea(el).querySelector('ds-button');
    expect(btn, 'action button present').to.exist;
    el.setAttribute('live', '');
    await nextFrame();
    expect(actionArea(el).querySelector('ds-button'), 'same button node (not detached / re-appended)').to.equal(btn);
    expect(leftArea(el).getAttribute('aria-live'), 'live applied').to.equal('polite');
  });
});

/* Regression — the `dir` self-retrigger loop.

   `dir` is an observed attribute AND the paint path writes it when `rtl` is set.
   setAttribute fires attributeChangedCallback even when the value is UNCHANGED,
   so an unguarded write re-entered the paint forever: "Maximum call stack size
   exceeded", and the component never finished rendering. It shipped on three
   docs pages. ds-card and ds-widget already carried the guard; these did not.

   These COUNT PAINTS rather than expecting a throw: the overflow surfaces as an
   uncaught window error from a re-entrant callback, not as an exception thrown
   back into setAttribute, so an assertion on the return value sees nothing and
   passes even when the bug is present (verified — the first version of this
   block passed against the unfixed code). A bounded call count is the thing
   that actually distinguishes fixed from broken. */
describe('ds-form-footer — dir must not re-enter its own paint', () => {
  it('ds-form-footer paints a bounded number of times when rtl is set', async () => {
    const el = await fixture(html`<ds-form-footer></ds-form-footer>`);
    await nextFrame();
    const proto = Object.getPrototypeOf(el);
    const orig = proto._paintChrome;
    let calls = 0;
    proto._paintChrome = function (...a) { calls += 1; if (calls > 50) return; return orig.apply(this, a); };
    try {
      el.setAttribute('rtl', '');
      await nextFrame();
      expect(calls, '_paintChrome re-entered itself — the dir guard is missing').to.be.lessThan(10);
      expect(el.getAttribute('dir'), 'rtl still applied').to.equal('rtl');
    } finally {
      proto._paintChrome = orig;
    }
  });

});
