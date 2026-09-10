/* ds-icon — sprite <svg><use> glyph. Covers the size sanitiser (numeric px,
   percentage passthrough, unit stripping, hostile fallback) and name
   sanitisation, since both are interpolated into an innerHTML string. */
import { fixture, html, expect, nextFrame } from '@open-wc/testing';
import '../src/icons/icon.js';

const svgOf = (el) => el.querySelector('svg');

describe('ds-icon — size sanitiser', () => {
  it('passes a numeric size straight to the svg', async () => {
    const el = await fixture(html`<ds-icon name="star" size="24"></ds-icon>`);
    expect(svgOf(el).getAttribute('width')).to.equal('24');
    expect(svgOf(el).getAttribute('height')).to.equal('24');
  });

  it('keeps a plain percentage so markers can fill their box (ds-list size="100%")', async () => {
    const el = await fixture(html`<ds-icon name="star" size="100%"></ds-icon>`);
    expect(svgOf(el).getAttribute('width'), 'percentage survives the sanitiser').to.equal('100%');
    expect(svgOf(el).getAttribute('height')).to.equal('100%');
  });

  it('accepts a fractional percentage', async () => {
    const el = await fixture(html`<ds-icon name="star" size="12.5%"></ds-icon>`);
    expect(svgOf(el).getAttribute('width')).to.equal('12.5%');
  });

  it('strips a unit off a numeric length (px → number)', async () => {
    const el = await fixture(html`<ds-icon name="star" size="24px"></ds-icon>`);
    expect(svgOf(el).getAttribute('width')).to.equal('24');
  });

  it('defaults to 20 when size is missing', async () => {
    const el = await fixture(html`<ds-icon name="star"></ds-icon>`);
    expect(svgOf(el).getAttribute('width')).to.equal('20');
  });

  it('falls back to 20 on a hostile size — no attribute breakout', async () => {
    const el = await fixture(html`<ds-icon name="star" size='"><img src=x onerror=alert(1)>'></ds-icon>`);
    expect(svgOf(el).getAttribute('width')).to.equal('20');
    expect(el.querySelector('img'), 'no injected <img>').to.not.exist;
  });

  it('reacts to a size change', async () => {
    const el = await fixture(html`<ds-icon name="star" size="16"></ds-icon>`);
    el.setAttribute('size', '100%');
    await nextFrame();
    expect(svgOf(el).getAttribute('width')).to.equal('100%');
  });
});

describe('ds-icon — name sanitiser', () => {
  it('references the sprite id for a clean name', async () => {
    const el = await fixture(html`<ds-icon name="chevron-down" size="20"></ds-icon>`);
    expect(el.querySelector('use').getAttribute('href')).to.contain('#icon-chevron-down');
  });

  it('strips non-id characters from a hostile name — no breakout', async () => {
    const el = await fixture(html`<ds-icon name='star"></use><script>x' size="20"></ds-icon>`);
    expect(el.querySelector('script'), 'no injected <script>').to.not.exist;
    // stripped to sprite-id chars only
    expect(el.querySelector('use').getAttribute('href')).to.match(/#icon-[a-zA-Z0-9_-]*$/);
  });
});
