/* ds-chart — resize reflow is coalesced to one render per animation frame, so a
   resize drag doesn't rebuild the SVG on every ResizeObserver tick. */
import { fixture, html, expect, nextFrame } from '@open-wc/testing';
import '../src/components/chart/chart.js';

const twoFrames = () => new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));

describe('ds-chart — resize reflow coalescing', () => {
  it('collapses a burst of resize callbacks into a single reflow', async () => {
    const el = await fixture(html`<ds-chart></ds-chart>`);
    await nextFrame();
    // Isolate from the real ResizeObserver/IntersectionObserver so we measure
    // only the coalescing of our own _scheduleReflow() burst.
    el._ro?.disconnect(); el._ro = null;
    el._io?.disconnect(); el._io = null;

    let reflows = 0;
    const orig = el._reflow.bind(el);
    el._reflow = () => { reflows++; return orig(); };

    el._scheduleReflow();
    el._scheduleReflow();
    el._scheduleReflow();
    el._scheduleReflow();
    expect(reflows, 'should not reflow synchronously per tick').to.equal(0);

    await twoFrames();
    expect(reflows, 'burst should coalesce to exactly one reflow').to.equal(1);
  });

  it('cancels a pending reflow when disconnected', async () => {
    const el = await fixture(html`<ds-chart></ds-chart>`);
    await nextFrame();
    el._ro?.disconnect(); el._ro = null;
    el._io?.disconnect(); el._io = null;

    let reflows = 0;
    const orig = el._reflow.bind(el);
    el._reflow = () => { reflows++; return orig(); };

    el._scheduleReflow();
    el.remove(); // disconnectedCallback cancels the queued frame
    await twoFrames();
    expect(reflows, 'a queued reflow must not fire after disconnect').to.equal(0);
  });
});
