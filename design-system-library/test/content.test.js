/* ds-content — the app-shell main content area. A minimal light-DOM leaf: adds
   `.ds-content` and toggles `.ds-content--framed` from the `framed` boolean (or
   an auto-frame MutationObserver on the previous sibling). Covers render, the
   framed toggle, auto-frame, and observer teardown on disconnect. */
import { fixture, html, expect, nextFrame } from '@open-wc/testing';
import '../src/components/content/content.js';

describe('ds-content — structure & framed', () => {
  it('adds the .ds-content class and preserves children', async () => {
    const el = await fixture(html`<ds-content><p id="body">page</p></ds-content>`);
    expect(el.classList.contains('ds-content')).to.be.true;
    expect(el.querySelector('#body')).to.exist;
  });

  it('is unframed by default', async () => {
    const el = await fixture(html`<ds-content></ds-content>`);
    expect(el.classList.contains('ds-content--framed')).to.be.false;
  });

  it('applies .ds-content--framed when the framed attribute is set', async () => {
    const el = await fixture(html`<ds-content framed></ds-content>`);
    expect(el.classList.contains('ds-content--framed')).to.be.true;
  });

  it('toggles framed reactively', async () => {
    const el = await fixture(html`<ds-content framed></ds-content>`);
    el.removeAttribute('framed');
    await nextFrame();
    expect(el.classList.contains('ds-content--framed')).to.be.false;
  });
});

describe('ds-content — auto-frame', () => {
  it('auto-frames when the previous sibling carries is-hidden', async () => {
    const wrap = await fixture(html`
      <div>
        <div class="is-hidden"></div>
        <ds-content></ds-content>
      </div>
    `);
    const el = wrap.querySelector('ds-content');
    await nextFrame();
    expect(el.classList.contains('ds-content--framed')).to.be.true;
  });

  it('reacts to the previous sibling gaining is-hidden at runtime', async () => {
    const wrap = await fixture(html`
      <div>
        <div id="l2"></div>
        <ds-content></ds-content>
      </div>
    `);
    const el = wrap.querySelector('ds-content');
    expect(el.classList.contains('ds-content--framed')).to.be.false;
    wrap.querySelector('#l2').classList.add('is-hidden');
    await nextFrame();
    expect(el.classList.contains('ds-content--framed')).to.be.true;
  });
});

describe('ds-content — teardown', () => {
  it('disconnects its observer without throwing', async () => {
    const el = await fixture(html`<ds-content></ds-content>`);
    expect(() => el.remove()).to.not.throw();
    await nextFrame();
    expect(el.isConnected).to.be.false;
  });
});
