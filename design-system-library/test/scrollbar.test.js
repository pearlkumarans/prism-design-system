/* ds-scrollbar — overlay scrollbar wrapper. It has NO injection surface: slotted
   content is *adopted* into the viewport via appendChild (moved DOM nodes, never
   re-serialized), and the thumb is a createElement'd node — no attribute ever
   reaches innerHTML. Covers adoption, the non-overflow resting state
   (data-sb-disabled + non-focusable viewport), always-visible mode, orientation,
   rtl, the no-injection guarantee, and teardown. Overflow geometry needs real
   layout/CSS (not present here), so the state tests drive `_sync()` directly and
   only assert what the model guarantees. */
import { fixture, html, expect, nextFrame } from '@open-wc/testing';
import '../src/components/scrollbar/scrollbar.js';

const XSS = '"><img src=x onerror=alert(1)>';
const vp = (el) => el.querySelector('.ds-scrollbar__viewport');
const thumb = (el) => el.querySelector('.ds-scrollbar__thumb');

describe('ds-scrollbar — adoption & structure', () => {
  it('builds a viewport + thumb and adopts slotted content into the viewport', async () => {
    const el = await fixture(html`<ds-scrollbar style="height:60px"><p class="content">hello</p></ds-scrollbar>`);
    await nextFrame();
    expect(vp(el), 'viewport missing').to.exist;
    expect(thumb(el), 'thumb missing').to.exist;
    const p = vp(el).querySelector('.content');
    expect(p, 'slotted content not adopted into the viewport').to.exist;
    expect(p.textContent).to.equal('hello');
    /* host now holds exactly the viewport + thumb — content was moved, not copied */
    expect(el.children.length).to.equal(2);
  });

  it('adopts multiple slotted children', async () => {
    const el = await fixture(html`<ds-scrollbar style="height:60px"><span>a</span><span>b</span><span>c</span></ds-scrollbar>`);
    await nextFrame();
    expect(vp(el).querySelectorAll('span').length).to.equal(3);
  });

  it('is a no-injection surface — attributes never reach innerHTML', async () => {
    const el = await fixture(html`<ds-scrollbar style="height:60px"><span>x</span></ds-scrollbar>`);
    await nextFrame();
    el.setAttribute('size', XSS);
    el.setAttribute('orientation', XSS);
    await nextFrame();
    expect(el.querySelector('img'), 'an attribute leaked into innerHTML').to.not.exist;
  });
});

describe('ds-scrollbar — resting state', () => {
  it('a non-overflowing instance is data-sb-disabled with a non-focusable viewport', async () => {
    const el = await fixture(html`<ds-scrollbar style="height:60px"><span>tiny</span></ds-scrollbar>`);
    await nextFrame();
    el._sync();   /* deterministic: no scroll overflow → disabled */
    expect(el.hasAttribute('data-sb-disabled'), 'should be disabled when nothing overflows').to.be.true;
    expect(vp(el).tabIndex).to.equal(-1);
  });

  it('autohide="false" keeps the thumb permanently visible', async () => {
    const el = await fixture(html`<ds-scrollbar autohide="false" style="height:60px"><span>x</span></ds-scrollbar>`);
    await nextFrame();
    expect(el.hasAttribute('data-sb-visible')).to.be.true;
  });

  it('reflects orientation (default vertical, horizontal opt-in)', async () => {
    const v = await fixture(html`<ds-scrollbar style="height:60px"><span>x</span></ds-scrollbar>`);
    await nextFrame();
    expect(v._horizontal).to.be.false;
    const h = await fixture(html`<ds-scrollbar orientation="horizontal" style="width:60px"><span>x</span></ds-scrollbar>`);
    await nextFrame();
    expect(h._horizontal).to.be.true;
  });

  it('reflects rtl as dir="rtl" on the host', async () => {
    const el = await fixture(html`<ds-scrollbar rtl style="height:60px"><span>x</span></ds-scrollbar>`);
    await nextFrame();
    expect(el.getAttribute('dir')).to.equal('rtl');
  });
});

describe('ds-scrollbar — teardown', () => {
  it('disconnect tears down the observers without throwing', async () => {
    const el = await fixture(html`<ds-scrollbar style="height:60px"><span>x</span></ds-scrollbar>`);
    await nextFrame();
    expect(el._ro, 'ResizeObserver not created').to.exist;
    expect(el._mo, 'MutationObserver not created').to.exist;
    expect(() => el.remove()).to.not.throw();
  });

  it('reconnect after disconnect does not rebuild or duplicate the viewport', async () => {
    const el = await fixture(html`<ds-scrollbar style="height:60px"><span>x</span></ds-scrollbar>`);
    await nextFrame();
    const parent = el.parentNode;
    el.remove();
    parent.appendChild(el);
    await nextFrame();
    expect(el.querySelectorAll('.ds-scrollbar__viewport').length).to.equal(1);
    expect(el.querySelectorAll('.ds-scrollbar__thumb').length).to.equal(1);
  });
});
