/* Teardown / leak regression suite.
   Guards the four teardown fixes so these exact leaks can't silently return:
     - header-nav         document 'click' listener (added on connect)
     - rich-text-editor   document 'selectionchange' listener (added on connect)
     - breadcrumb         overflow-menu outside-click listener (added on open)
     - page-header        inline-menu outside-click listeners (added on open)
*/
import { fixture, html, expect, nextFrame } from '@open-wc/testing';
import { trackListeners } from './helpers/listeners.js';

import '../src/components/header-nav/header-nav.js';
import '../src/components/rich-text-editor/rich-text-editor.js';
import '../src/components/breadcrumb/breadcrumb.js';
import '../src/components/page-header/page-header.js';

describe('teardown — no leaked global listeners', () => {
  it('header-nav removes its document listener on disconnect', async () => {
    const t = trackListeners();
    try {
      const el = await fixture(html`<ds-header-nav></ds-header-nav>`);
      await nextFrame();
      el.remove();
      expect(t.net(), `leaked: ${JSON.stringify(t.byType())}`).to.equal(0);
    } finally {
      t.restore();
    }
  });

  it('rich-text-editor balances selectionchange across mount/unmount', async () => {
    const t = trackListeners();
    try {
      const el = await fixture(html`<ds-rich-text-editor></ds-rich-text-editor>`);
      await nextFrame();
      el.remove();
      expect(t.byType(), 'listeners left registered').to.deep.equal({});
    } finally {
      t.restore();
    }
  });

  it('rich-text-editor survives repeated mount/unmount without accumulating', async () => {
    const t = trackListeners();
    try {
      for (let i = 0; i < 5; i++) {
        const el = await fixture(html`<ds-rich-text-editor></ds-rich-text-editor>`);
        await nextFrame();
        el.remove();
      }
      expect(t.net(), `accumulated: ${JSON.stringify(t.byType())}`).to.equal(0);
    } finally {
      t.restore();
    }
  });

  it('breadcrumb flushes an open overflow menu on disconnect', async () => {
    const el = await fixture(html`<ds-breadcrumb></ds-breadcrumb>`);
    let flushed = false;
    // Simulate "menu open": the component tracks its close fn here.
    el._closeOverflow = () => { flushed = true; el._closeOverflow = null; };
    el.remove();
    expect(flushed, 'disconnectedCallback did not run _closeOverflow').to.be.true;
  });

  it('page-header flushes pending inline-menu closes on disconnect', async () => {
    const el = await fixture(html`<ds-page-header title="Devices"></ds-page-header>`);
    expect(el._pendingCloses, '_pendingCloses set missing').to.be.instanceOf(Set);
    let flushed = false;
    el._pendingCloses.add(() => { flushed = true; });
    el.remove();
    expect(flushed, 'disconnectedCallback did not flush _pendingCloses').to.be.true;
    expect(el._pendingCloses.size).to.equal(0);
  });
});
