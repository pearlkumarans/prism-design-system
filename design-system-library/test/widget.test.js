/* ds-widget — the dashboard "widget frame" (light-DOM container).

   This suite pins the TWO slot-preservation contracts a recent review
   established (see the VISUAL_ONLY comment block in widget.js):

     1. VISUAL-ONLY toggle (`selected` / `edit-mode` / `state` / `rtl` / `dir`)
        must NOT detach or reset the slotted body — it repaints host
        classes/attrs in place via `_paintState()`, never `innerHTML`.
     2. A STRUCTURAL re-render (`title`, `type`, …) rebuilds the markup via
        `_render()` but must re-home the SAME captured body node exactly once —
        never drop it, and never replace it with the default chart.

   ds-widget is LIGHT-DOM: everything is queried with `el.querySelector`, never a
   shadowRoot. Its generated chrome all carries a `ds-widget__` class; consumer
   body content lands in the `[data-slot="content"]` wrapper. */
import { fixture, html, expect, nextFrame, oneEvent } from '@open-wc/testing';
import '../src/components/widget/widget.js';
import '../src/components/chart/chart.js';

/* MutationObserver-backed late-child recovery needs a couple of frames to fire. */
const settle = async () => { await nextFrame(); await nextFrame(); };
const contentSlot = (el) => el.querySelector('[data-slot="content"]');

describe('ds-widget — visual-only toggles preserve the slotted body (_paintState)', () => {
  it('keeps the exact slotted <ds-chart> node connected across a `selected` toggle', async () => {
    const el = await fixture(html`
      <ds-widget type="chart" title="Drivers by class">
        <ds-chart type="column" mode="single"></ds-chart>
      </ds-widget>`);
    await nextFrame();

    const chart = el.querySelector('ds-chart');
    expect(chart, 'slotted chart not homed on first render').to.exist;
    expect(contentSlot(el).contains(chart), 'chart not inside the content slot').to.be.true;

    el.setAttribute('selected', '');
    await nextFrame();

    // Same node instance, still connected, still in the same content wrapper —
    // the selection ring must not have rebuilt innerHTML and dropped it.
    expect(el.querySelector('ds-chart'), 'chart instance changed').to.equal(chart);
    expect(chart.isConnected, 'chart detached by selected toggle').to.be.true;
    expect(contentSlot(el).contains(chart), 'chart left the content slot').to.be.true;
    expect(el.classList.contains('ds-widget--selected'), 'selected class not painted').to.be.true;
  });

  it('keeps the same body node across edit-mode, state and rtl toggles', async () => {
    const el = await fixture(html`
      <ds-widget type="chart" title="W">
        <div id="probe">body</div>
      </ds-widget>`);
    await nextFrame();
    const probe = el.querySelector('#probe');
    expect(probe).to.exist;

    for (const [attr, val] of [['edit-mode', ''], ['state', 'selected'], ['rtl', '']]) {
      el.setAttribute(attr, val);
      await nextFrame();
      expect(el.querySelector('#probe'), `probe replaced after ${attr}`).to.equal(probe);
      expect(probe.isConnected, `probe detached after ${attr}`).to.be.true;
      expect(contentSlot(el).contains(probe), `probe left content slot after ${attr}`).to.be.true;
    }
    // Not duplicated by the repeated repaints.
    expect(el.querySelectorAll('#probe').length, 'probe duplicated').to.equal(1);
  });
});

describe('ds-widget — structural re-render re-homes the body (no drop, no duplicate)', () => {
  it('keeps the slotted body exactly once and injects no default chart when `title` changes', async () => {
    const el = await fixture(html`
      <ds-widget type="chart" title="Old">
        <div id="probe">body</div>
      </ds-widget>`);
    await nextFrame();
    const probe = el.querySelector('#probe');

    el.setAttribute('title', 'New');   // structural: rebuilds markup, re-homes the body
    await nextFrame();

    expect(el.querySelector('#probe'), 'body node identity lost on re-render').to.equal(probe);
    expect(el.querySelectorAll('#probe').length, 'body duplicated on re-render').to.equal(1);
    expect(contentSlot(el).contains(probe), 'body not re-homed into content slot').to.be.true;
    // The default <ds-chart> is only injected when there is NO slotted content —
    // it must not have replaced/joined the real body.
    expect(el.querySelector('[data-slot="content"] ds-chart'), 'default chart wrongly injected').to.not.exist;
  });

  it('injects the default column chart only for a bare type="chart" widget', async () => {
    const el = await fixture(html`<ds-widget type="chart" title="Bare"></ds-widget>`);
    await nextFrame();
    const chart = el.querySelector('[data-slot="content"] ds-chart');
    expect(chart, 'default chart not rendered for bare widget').to.exist;
    expect(chart.getAttribute('type')).to.equal('column');
  });
});

describe('ds-widget — late children merged by identity', () => {
  it('homes a body node appended after upgrade into the content slot exactly once', async () => {
    const el = await fixture(html`<ds-widget type="chart"></ds-widget>`);
    const body = document.createElement('div');
    body.id = 'late-body';
    el.appendChild(body);
    await settle();

    expect(contentSlot(el).contains(body), 'late body not homed into content slot').to.be.true;
    expect([...el.children].includes(body), 'late body stranded as a direct host child').to.be.false;
    expect(el.querySelectorAll('#late-body').length, 'late body duplicated').to.equal(1);
    // The merge is by node identity, so the widget's own wrappers survive.
    const stray = [...el.children].some((c) => !String(c.className || '').startsWith('ds-widget__'));
    expect(stray, 'own wrapper swallowed / consumer node leaked').to.be.false;
  });

  it('homes a late header-action into the header-action slot', async () => {
    const el = await fixture(html`<ds-widget title="W" show-action></ds-widget>`);
    const action = document.createElement('ds-icon-button');
    action.setAttribute('slot', 'header-action');
    el.appendChild(action);
    await settle();

    expect(el.querySelector('[data-slot="header-action"]').contains(action),
      'late header-action not routed into its slot').to.be.true;
    expect(el.querySelector(':scope > [slot="header-action"]'),
      'header-action stranded on the host').to.not.exist;
  });
});

describe('ds-widget — built-in state bodies', () => {
  it('type="empty" renders the built-in empty body and hides the footer', async () => {
    const el = await fixture(html`<ds-widget type="empty" show-footer footer-summary="+3 more"></ds-widget>`);
    await nextFrame();
    const state = el.querySelector('.ds-widget__body--state');
    expect(state, 'state body not rendered').to.exist;
    expect(state.querySelector('ds-empty-state'), 'empty-state placeholder not delegated').to.exist;
    // Footer is force-hidden for state types even when show-footer is set.
    expect(el.querySelector('.ds-widget__footer'), 'footer shown on a state widget').to.not.exist;
  });

  it('type="error" surfaces the retry action as ds-widget-retry', async () => {
    const el = await fixture(html`<ds-widget type="error"></ds-widget>`);
    await nextFrame();
    const retry = el.querySelector('.ds-widget__body--state ds-button[data-primary]');
    expect(retry, 'retry action not rendered in the error body').to.exist;

    setTimeout(() => retry.click());
    const ev = await oneEvent(el, 'ds-widget-retry');
    expect(ev, 'ds-widget-retry not dispatched').to.exist;
  });
});

describe('ds-widget — injection safety', () => {
  it('renders a hostile title, trend label and footer summary as literal text', async () => {
    const payload = '"><img src=x onerror=alert(1)>';
    const el = await fixture(html`
      <ds-widget
        title=${payload}
        trend=${payload} trend-status="critical"
        show-footer footer-summary=${payload}></ds-widget>`);
    await nextFrame();

    expect(el.querySelector('img[onerror]'), 'hostile markup was injected').to.not.exist;
    expect(el.querySelector('.ds-widget__title').textContent).to.contain('<img');
    expect(el.querySelector('.ds-widget__summary').textContent).to.contain('<img');
  });
});

describe('ds-widget — accessibility', () => {
  it('exposes role=group and mirrors the title into aria-label', async () => {
    const el = await fixture(html`<ds-widget title="Drivers by class"></ds-widget>`);
    await nextFrame();
    expect(el.getAttribute('role')).to.equal('group');
    expect(el.getAttribute('aria-label')).to.equal('Drivers by class');
  });

  it('reflects `selected` into aria-selected and clears it when unset', async () => {
    const el = await fixture(html`<ds-widget title="W" selected></ds-widget>`);
    await nextFrame();
    expect(el.getAttribute('aria-selected')).to.equal('true');

    el.removeAttribute('selected');
    await nextFrame();
    expect(el.hasAttribute('aria-selected'), 'aria-selected not cleared').to.be.false;
  });
});

describe('ds-widget — enum fallbacks', () => {
  it('falls back to type="chart" for an unknown type', async () => {
    const el = await fixture(html`<ds-widget type="bogus" title="W"></ds-widget>`);
    await nextFrame();
    expect(el.classList.contains('ds-widget--chart'), 'unknown type did not fall back to chart').to.be.true;
    // A chart-type widget hosts a body slot rather than a built-in state body.
    expect(contentSlot(el), 'content slot missing after type fallback').to.exist;
    expect(el.querySelector('.ds-widget__body--state'), 'state body wrongly rendered').to.not.exist;
  });

  it('falls back to trend-status="info" (badge state=active) for an unknown trend-status', async () => {
    const el = await fixture(html`<ds-widget title="W" trend="12%" trend-status="bogus"></ds-widget>`);
    await nextFrame();
    const badge = el.querySelector('.ds-widget__trailing ds-badge');
    expect(badge, 'trend badge not rendered').to.exist;
    expect(badge.getAttribute('state')).to.equal('active');
  });
});

describe('ds-widget — lifecycle', () => {
  it('survives a disconnect → reconnect without throwing or duplicating the body', async () => {
    const el = await fixture(html`
      <ds-widget type="chart" title="W">
        <div id="probe">body</div>
      </ds-widget>`);
    await nextFrame();
    const parent = el.parentNode;

    parent.removeChild(el);   // disconnectedCallback → stopLateChildren
    parent.appendChild(el);   // connectedCallback again (capture already done)
    await settle();

    expect(el.querySelectorAll('#probe').length, 'body duplicated after reconnect').to.equal(1);
    expect(el.querySelector('#probe').isConnected, 'body lost after reconnect').to.be.true;
    expect(el.querySelectorAll('.ds-widget__surface').length, 'surface duplicated after reconnect').to.equal(1);
  });

  it('rtl sets dir once without a re-entrant loop', async () => {
    const el = await fixture(html`<ds-widget title="W"></ds-widget>`);
    await nextFrame();
    el.setAttribute('rtl', '');    // _paintState writes dir="rtl", guarded against re-entry
    await nextFrame();
    expect(el.getAttribute('dir')).to.equal('rtl');
    expect(el.querySelectorAll('.ds-widget__surface').length, 'markup corrupted by rtl repaint').to.equal(1);
  });
});
