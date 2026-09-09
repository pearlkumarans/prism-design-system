/* ds-tooltip — wraps a trigger; the tip is PORTALED to <body> and positioned
   with position:fixed. Show delay 200ms, hide delay 150ms. Covers the portal,
   trigger association (aria-describedby), position/theme classes + reactivity,
   show/hide lifecycle, Escape, escaping, a11y and teardown (portal removal +
   no leaked window listeners). Timers are real, so show waits are explicit. */
import { fixture, html, expect, nextFrame } from '@open-wc/testing';
import { trackListeners } from './helpers/listeners.js';
import '../src/components/tooltip/tooltip.js';

const XSS = '<img src=x onerror=alert(1)>';
const wait = (ms) => new Promise((r) => setTimeout(r, ms));
/* > SHOW_DELAY_MS (200) so the deferred open has fired. */
const SHOWN = 260;

const trig = (el) => el.firstElementChild;

describe('ds-tooltip — portal & structure', () => {
  it('portals the tip to <body> with role=tooltip, hidden initially', async () => {
    const el = await fixture(html`<ds-tooltip text="Hint"><button>Trigger</button></ds-tooltip>`);
    expect(el._tip, 'tip missing').to.exist;
    expect(el._tip.parentNode, 'tip not portaled to <body>').to.equal(document.body);
    expect(el._tip.getAttribute('role')).to.equal('tooltip');
    expect(el._tip.getAttribute('aria-hidden')).to.equal('true');
  });

  it('renders the tip text (and icon on by default)', async () => {
    const el = await fixture(html`<ds-tooltip text="Helpful hint"><button>T</button></ds-tooltip>`);
    expect(el._tip.querySelector('.ds-tooltip__text').textContent).to.equal('Helpful hint');
    expect(el._tip.querySelector('.ds-tooltip__icon'), 'icon on by default').to.exist;
  });

  it('hides the icon when show-icon="false"', async () => {
    const el = await fixture(html`<ds-tooltip text="Hint" show-icon="false"><button>T</button></ds-tooltip>`);
    expect(el._tip.querySelector('.ds-tooltip__icon')).to.not.exist;
  });
});

describe('ds-tooltip — trigger association', () => {
  it('wires aria-describedby from the trigger to the tip id', async () => {
    const el = await fixture(html`<ds-tooltip text="Hint"><button>Trigger</button></ds-tooltip>`);
    expect(trig(el).getAttribute('aria-describedby')).to.equal(el._tip.id);
    expect(el._tip.id).to.match(/^ds-tooltip-\d+$/);
  });
});

describe('ds-tooltip — position & theme', () => {
  it('defaults to up-center placement, dark, and arrowless', async () => {
    const el = await fixture(html`<ds-tooltip text="Hint"><button>T</button></ds-tooltip>`);
    expect(el._tip.classList.contains('ds-tooltip__tip--up-center'), 'default placement').to.be.true;
    expect(el._tip.classList.contains('ds-tooltip__tip--dark')).to.be.true;
    expect(el._tip.classList.contains('ds-tooltip__tip--no-arrow'), 'arrowless by default').to.be.true;
  });

  it('reflects the position + theme attributes', async () => {
    const el = await fixture(html`<ds-tooltip text="Hint" position="down-right" theme="light"><button>T</button></ds-tooltip>`);
    expect(el._tip.classList.contains('ds-tooltip__tip--down-right')).to.be.true;
    expect(el._tip.classList.contains('ds-tooltip__tip--light')).to.be.true;
  });

  it('updates the position class reactively', async () => {
    const el = await fixture(html`<ds-tooltip text="Hint"><button>T</button></ds-tooltip>`);
    el.setAttribute('position', 'left');
    await nextFrame();
    expect(el._tip.classList.contains('ds-tooltip__tip--left')).to.be.true;
    expect(el._tip.classList.contains('ds-tooltip__tip--up-center')).to.be.false;
  });
});

describe('ds-tooltip — arrow (opt-in pointer, default off)', () => {
  it('is arrowless by default even with a directional position', async () => {
    /* position sets PLACEMENT (left); the arrow is a separate opt-in, so without
       the `arrow` attribute the tip carries --no-arrow (CSS drops the ::after). */
    const el = await fixture(html`<ds-tooltip text="Hint" position="left"><button>T</button></ds-tooltip>`);
    expect(el._tip.classList.contains('ds-tooltip__tip--left'), 'placement kept').to.be.true;
    expect(el._tip.classList.contains('ds-tooltip__tip--no-arrow'), 'arrow suppressed by default').to.be.true;
  });

  it('draws the arrow only when arrow is set — placement unchanged', async () => {
    const el = await fixture(html`<ds-tooltip text="Hint" position="left" arrow><button>T</button></ds-tooltip>`);
    expect(el._tip.classList.contains('ds-tooltip__tip--left')).to.be.true;
    expect(el._tip.classList.contains('ds-tooltip__tip--no-arrow'), 'arrow present, so no --no-arrow').to.be.false;
  });

  it('toggles the arrow reactively without changing placement', async () => {
    const el = await fixture(html`<ds-tooltip text="Hint" position="up-center" arrow><button>T</button></ds-tooltip>`);
    expect(el._tip.classList.contains('ds-tooltip__tip--no-arrow')).to.be.false;
    el.removeAttribute('arrow');
    await nextFrame();
    expect(el._tip.classList.contains('ds-tooltip__tip--up-center'), 'placement kept').to.be.true;
    expect(el._tip.classList.contains('ds-tooltip__tip--no-arrow'), 'now arrowless').to.be.true;
  });
});

describe('ds-tooltip — show / hide lifecycle', () => {
  it('mouseenter shows the tip after the show delay', async () => {
    const el = await fixture(html`<ds-tooltip text="Hint"><button>T</button></ds-tooltip>`);
    el.dispatchEvent(new Event('mouseenter'));
    expect(el._open, 'must not open before the delay').to.be.false;
    await wait(SHOWN);
    expect(el._open).to.be.true;
    expect(el._tip.dataset.visible).to.equal('true');
    expect(el._tip.getAttribute('aria-hidden')).to.equal('false');
  });

  it('mouseleave hides the tip after the hide delay', async () => {
    const el = await fixture(html`<ds-tooltip text="Hint"><button>T</button></ds-tooltip>`);
    el.dispatchEvent(new Event('mouseenter'));
    await wait(SHOWN);
    el.dispatchEvent(new Event('mouseleave'));
    await wait(200);
    expect(el._open).to.be.false;
    expect(el._tip.dataset.visible).to.equal('false');
    expect(el._tip.getAttribute('aria-hidden')).to.equal('true');
  });

  it('Escape closes an open tip immediately', async () => {
    const el = await fixture(html`<ds-tooltip text="Hint"><button>T</button></ds-tooltip>`);
    el.dispatchEvent(new Event('mouseenter'));
    await wait(SHOWN);
    expect(el._open).to.be.true;
    el.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
    expect(el._open, 'Escape hides at once').to.be.false;
    expect(el._tip.getAttribute('aria-hidden')).to.equal('true');
  });

  it('activating the trigger (pointerdown) dismisses an open tip at once', async () => {
    const el = await fixture(html`<ds-tooltip text="Hint"><button>T</button></ds-tooltip>`);
    el.dispatchEvent(new Event('mouseenter'));
    await wait(SHOWN);
    expect(el._open, 'shown by hover').to.be.true;
    /* Click starts with pointerdown; it bubbles from the trigger to the host.
       The hint must clear before whatever the click opens (menu/popover) paints. */
    trig(el).dispatchEvent(new PointerEvent('pointerdown', { bubbles: true }));
    expect(el._open, 'pointerdown hides at once').to.be.false;
    expect(el._tip.getAttribute('aria-hidden')).to.equal('true');
  });

  it('cancels a pending (pre-delay) open when the trigger is activated', async () => {
    const el = await fixture(html`<ds-tooltip text="Hint"><button>T</button></ds-tooltip>`);
    el.dispatchEvent(new Event('mouseenter'));   /* schedules the deferred open */
    trig(el).dispatchEvent(new PointerEvent('pointerdown', { bubbles: true }));
    await wait(SHOWN);                            /* the scheduled open must have been cleared */
    expect(el._open, 'a fast click never lets the tip appear').to.be.false;
    expect(el._tip.dataset.visible).to.not.equal('true');
  });
});

describe('ds-tooltip — escaping', () => {
  it('renders hostile text as literal (no injected <img>)', async () => {
    const el = await fixture(html`<ds-tooltip text="${XSS}"><button>T</button></ds-tooltip>`);
    const textEl = el._tip.querySelector('.ds-tooltip__text');
    expect(textEl.querySelector('img'), 'text injected an <img>').to.not.exist;
    expect(textEl.textContent).to.contain('<img');
  });
});

describe('ds-tooltip — a11y', () => {
  it('is accessible (trigger + describedby wiring)', async () => {
    const el = await fixture(html`<ds-tooltip text="Hint"><button>Trigger</button></ds-tooltip>`);
    await expect(el).to.be.accessible({ ignoredRules: ['color-contrast'] });
  });
});

describe('ds-tooltip — teardown', () => {
  it('removes the portaled tip from <body> on disconnect', async () => {
    const el = await fixture(html`<ds-tooltip text="Hint"><button>T</button></ds-tooltip>`);
    const tip = el._tip;
    expect(tip.parentNode).to.equal(document.body);
    el.remove();
    expect(tip.parentNode, 'tip left orphaned in <body>').to.not.equal(document.body);
  });

  it('re-portals the tip on reconnect', async () => {
    const el = await fixture(html`<ds-tooltip text="Hint"><button>T</button></ds-tooltip>`);
    const parent = el.parentNode;
    el.remove();
    parent.appendChild(el);
    await nextFrame();
    expect(el._tip.parentNode).to.equal(document.body);
  });

  it('leaks no global listeners after being opened then unmounted', async () => {
    const t = trackListeners();
    try {
      const el = await fixture(html`<ds-tooltip text="Hint"><button>T</button></ds-tooltip>`);
      el.dispatchEvent(new Event('mouseenter'));
      await wait(SHOWN);          /* opens → binds window scroll/resize reanchor */
      el.remove();                /* disconnect → _hideNow → _unbindReanchor */
      expect(t.net(), `leaked: ${JSON.stringify(t.byType())}`).to.equal(0);
    } finally {
      t.restore();
    }
  });
});
