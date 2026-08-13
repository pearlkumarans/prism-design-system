/* Regression suite for ds-page-header collapse-on-scroll target resolution.

   Bug: _setupScrollCollapse ran at upgrade and resolved its scroll-target THEN.
   Frameworks (Ember/Glimmer, React, Vue) insert the sibling scroll container
   AFTER the header upgrades, so the target wasn't found and the header bound to
   window — which never scrolls when an inner container owns the scroll. The
   header then never minimized. The fix retries until the named target appears. */
import { fixture, html, expect, nextFrame } from '@open-wc/testing';

import '../src/components/page-header/page-header.js';

const frames = async (n = 8) => { for (let i = 0; i < n; i++) await nextFrame(); };

const mountWithLateScroller = async (cls) => {
  const wrap = await fixture(html`<div></div>`);
  const ph = document.createElement('ds-page-header');
  ph.setAttribute('collapse-on-scroll', '');
  ph.setAttribute('scroll-target', `.${cls}`);
  ph.setAttribute('title', 'Header');
  wrap.appendChild(ph);           // upgrades now — target does NOT exist yet
  await nextFrame();

  // A frame later, the scroll container appears (framework sibling insertion).
  const scroller = document.createElement('div');
  scroller.className = cls;
  scroller.style.cssText = 'height:100px;overflow:auto';
  const tall = document.createElement('div');
  tall.style.height = '1000px';
  scroller.appendChild(tall);
  wrap.appendChild(scroller);
  await frames();
  return { ph, scroller };
};

describe('ds-page-header — collapse-on-scroll target resolution', () => {
  it('binds to a scroll-target inserted AFTER upgrade, not window', async () => {
    const { ph, scroller } = await mountWithLateScroller('late-scroll');
    expect(ph._scroller, 'header bound to window instead of the late target').to.equal(scroller);
  });

  it('minimizes on scroll down and restores on scroll up', async () => {
    const { ph, scroller } = await mountWithLateScroller('late-scroll-2');

    scroller.scrollTop = 300;
    scroller.dispatchEvent(new Event('scroll'));
    expect(ph.classList.contains('ds-page-header--collapsed'), 'did not minimize on scroll down').to.be.true;

    scroller.scrollTop = 0;
    scroller.dispatchEvent(new Event('scroll'));
    expect(ph.classList.contains('ds-page-header--collapsed'), 'did not restore on scroll up').to.be.false;
  });
});
