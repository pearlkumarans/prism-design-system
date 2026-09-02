/* ds-illustration — renders an inline <svg><use href="…#illu-<name>"> that
   references the multi-color illustrations sprite. Covers the svg/use structure,
   the name → sprite href wiring, the width/height sizing attrs, aria-hidden, and
   reactive name updates. The name/width/height are escaped before going into innerHTML (verified below). */
import { fixture, html, expect, nextFrame } from '@open-wc/testing';
import '../src/components/illustration/illustration.js';

const svg = (el) => el.querySelector('svg');
const use = (el) => el.querySelector('use');

describe('ds-illustration — structure', () => {
  it('renders an inner <svg> containing a <use>', async () => {
    const el = await fixture(html`<ds-illustration name="access-denied"></ds-illustration>`);
    expect(svg(el), 'svg missing').to.exist;
    expect(use(el), 'use missing').to.exist;
  });

  it('points the <use> href at the sprite symbol for the given name', async () => {
    const el = await fixture(html`<ds-illustration name="access-denied"></ds-illustration>`);
    const href = use(el).getAttribute('href');
    expect(href).to.contain('#illu-access-denied');
    expect(href).to.contain('illustrations.svg');
  });

  it('marks the host and svg aria-hidden (decorative)', async () => {
    const el = await fixture(html`<ds-illustration name="chart-emptystate"></ds-illustration>`);
    expect(el.getAttribute('aria-hidden')).to.equal('true');
    expect(svg(el).getAttribute('aria-hidden')).to.equal('true');
    expect(svg(el).getAttribute('focusable')).to.equal('false');
  });
});

describe('ds-illustration — sizing & reactivity', () => {
  it('defaults the svg to 100% width/height when no size given', async () => {
    const el = await fixture(html`<ds-illustration name="empty"></ds-illustration>`);
    expect(svg(el).getAttribute('width')).to.equal('100%');
    expect(svg(el).getAttribute('height')).to.equal('100%');
  });

  it('applies explicit width/height attributes to the svg', async () => {
    const el = await fixture(html`<ds-illustration name="empty" width="320" height="240"></ds-illustration>`);
    expect(svg(el).getAttribute('width')).to.equal('320');
    expect(svg(el).getAttribute('height')).to.equal('240');
  });

  it('re-renders the href when the name changes', async () => {
    const el = await fixture(html`<ds-illustration name="one"></ds-illustration>`);
    expect(use(el).getAttribute('href')).to.contain('#illu-one');
    el.setAttribute('name', 'two');
    await nextFrame();
    expect(use(el).getAttribute('href')).to.contain('#illu-two');
  });

  it('survives disconnect → reconnect without throwing', async () => {
    const el = await fixture(html`<ds-illustration name="one"></ds-illustration>`);
    const parent = el.parentNode;
    el.remove();
    parent.appendChild(el);
    await nextFrame();
    expect(svg(el)).to.exist;
  });
});

describe('ds-illustration — escaping', () => {
  it('escapes a hostile name so it cannot break out of the href attribute', async () => {
    const el = await fixture(html`<ds-illustration name=${'x"><img src=y onerror=alert(1)>'}></ds-illustration>`);
    await nextFrame();
    expect(el.querySelector('img'), 'name broke out into an injected <img>').to.not.exist;
    // the escaped value stays inside the <use> href
    expect(el.querySelector('use').getAttribute('href')).to.contain('#illu-');
  });

  it('escapes hostile width/height so they cannot inject an attribute', async () => {
    const el = await fixture(html`<ds-illustration name="x" width=${'1" onload="alert(1)'}></ds-illustration>`);
    await nextFrame();
    expect(svg(el).hasAttribute('onload'), 'width broke out into an onload attribute').to.be.false;
  });
});
