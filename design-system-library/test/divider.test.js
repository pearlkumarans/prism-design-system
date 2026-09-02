/* ds-divider — a light-DOM leaf that decorates the HOST with classes and
   `role="separator"`. Covers the enumAttr defaults + invalid fallback, the
   orientation → aria-orientation mirror, the with-text label (set via
   textContent, so injection-safe), and teardown. */
import { fixture, html, expect, nextFrame } from '@open-wc/testing';
import '../src/components/divider/divider.js';

const XSS = '"><img src=x onerror=alert(1)>';

describe('ds-divider — structure & defaults', () => {
  it('decorates the host with the default enum classes (horizontal/full-width/solid/thin)', async () => {
    const el = await fixture(html`<ds-divider></ds-divider>`);
    expect(el.classList.contains('ds-divider')).to.be.true;
    expect(el.classList.contains('ds-divider--horizontal')).to.be.true;
    expect(el.classList.contains('ds-divider--full-width')).to.be.true;
    expect(el.classList.contains('ds-divider--solid')).to.be.true;
    expect(el.classList.contains('ds-divider--thin')).to.be.true;
  });

  it('carries role="separator" for a11y', async () => {
    const el = await fixture(html`<ds-divider></ds-divider>`);
    expect(el.getAttribute('role')).to.equal('separator');
  });

  it('reflects supplied orientation/type/pattern/thickness', async () => {
    const el = await fixture(html`<ds-divider orientation="vertical" type="inset" pattern="dashed" thickness="medium"></ds-divider>`);
    expect(el.classList.contains('ds-divider--vertical')).to.be.true;
    expect(el.classList.contains('ds-divider--inset')).to.be.true;
    expect(el.classList.contains('ds-divider--dashed')).to.be.true;
    expect(el.classList.contains('ds-divider--medium')).to.be.true;
  });

  it('sets aria-orientation="vertical" only when vertical', async () => {
    const vert = await fixture(html`<ds-divider orientation="vertical"></ds-divider>`);
    expect(vert.getAttribute('aria-orientation')).to.equal('vertical');
    const horiz = await fixture(html`<ds-divider></ds-divider>`);
    expect(horiz.hasAttribute('aria-orientation')).to.be.false;
  });
});

describe('ds-divider — enum fallback & reactivity', () => {
  it('falls back to the default on an invalid enum value', async () => {
    const el = await fixture(html`<ds-divider pattern="bogus" orientation="sideways"></ds-divider>`);
    expect(el.classList.contains('ds-divider--solid'), 'invalid pattern → solid').to.be.true;
    expect(el.classList.contains('ds-divider--horizontal'), 'invalid orientation → horizontal').to.be.true;
  });

  it('swaps modifier classes reactively without leaving stale ones', async () => {
    const el = await fixture(html`<ds-divider pattern="solid"></ds-divider>`);
    el.setAttribute('pattern', 'dotted');
    await nextFrame();
    expect(el.classList.contains('ds-divider--dotted')).to.be.true;
    expect(el.classList.contains('ds-divider--solid')).to.be.false;
  });
});

describe('ds-divider — with-text label', () => {
  it('renders slotted text as the label for type="with-text"', async () => {
    const el = await fixture(html`<ds-divider type="with-text">Section</ds-divider>`);
    expect(el.classList.contains('ds-divider--with-text')).to.be.true;
    expect(el.textContent).to.equal('Section');
  });

  it('the label attribute wins and is rendered as text (injection-safe)', async () => {
    const el = await fixture(html`<ds-divider type="with-text" label="${XSS}">slot</ds-divider>`);
    await nextFrame();
    expect(el.querySelector('img'), 'label must not inject an <img>').to.not.exist;
    expect(el.textContent).to.contain('<img');
  });

  it('strips leftover text when NOT a with-text divider', async () => {
    const el = await fixture(html`<ds-divider>ignored</ds-divider>`);
    expect(el.textContent).to.equal('');
  });
});

describe('ds-divider — teardown', () => {
  it('survives disconnect → reconnect without throwing', async () => {
    const el = await fixture(html`<ds-divider></ds-divider>`);
    const parent = el.parentNode;
    el.remove();
    parent.appendChild(el);
    await nextFrame();
    expect(el.classList.contains('ds-divider')).to.be.true;
  });
});
