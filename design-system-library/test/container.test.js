/* ds-container — a light-DOM wrapper that decorates the HOST with `.ds-container`
   and data-* attributes; it never rewrites its children. Covers the enumAttr
   defaults reflected to data-*, the invalid fallback, optional (absent-by-default)
   data attrs, the boolean toggles, and that children are left untouched. */
import { fixture, html, expect, nextFrame } from '@open-wc/testing';
import '../src/components/container/container.js';

describe('ds-container — structure & default data-*', () => {
  it('adds .ds-container and does not touch children', async () => {
    const el = await fixture(html`<ds-container><span id="kid">hi</span></ds-container>`);
    expect(el.classList.contains('ds-container')).to.be.true;
    expect(el.querySelector('#kid'), 'child preserved').to.exist;
    expect(el.querySelector('#kid').textContent).to.equal('hi');
  });

  it('reflects the default enums to data-* (pad=md, radius=lg, variant=outline)', async () => {
    const el = await fixture(html`<ds-container></ds-container>`);
    expect(el.dataset.pad).to.equal('md');
    expect(el.dataset.radius).to.equal('lg');
    expect(el.dataset.variant).to.equal('outline');
  });

  it('leaves optional data-* absent until their attribute is set', async () => {
    const el = await fixture(html`<ds-container></ds-container>`);
    expect(el.hasAttribute('data-tone')).to.be.false;
    expect(el.hasAttribute('data-elev')).to.be.false;
    expect(el.hasAttribute('data-gap')).to.be.false;
    expect(el.hasAttribute('data-align')).to.be.false;
  });
});

describe('ds-container — enums, fallback & booleans', () => {
  it('reflects supplied padding/radius/variant/tone', async () => {
    const el = await fixture(html`<ds-container padding="lg" radius="xl" variant="filled" tone="warning"></ds-container>`);
    expect(el.dataset.pad).to.equal('lg');
    expect(el.dataset.radius).to.equal('xl');
    expect(el.dataset.variant).to.equal('filled');
    expect(el.dataset.tone).to.equal('warning');
  });

  it('falls back to the default on an invalid enum value', async () => {
    const el = await fixture(html`<ds-container variant="bogus" padding="huge"></ds-container>`);
    expect(el.dataset.variant, 'invalid variant → outline').to.equal('outline');
    expect(el.dataset.pad, 'invalid padding → md').to.equal('md');
  });

  it('toggles interactive/selected classes and stack/row data attrs', async () => {
    const el = await fixture(html`<ds-container interactive selected stack></ds-container>`);
    expect(el.classList.contains('ds-container--interactive')).to.be.true;
    expect(el.classList.contains('ds-container--selected')).to.be.true;
    expect(el.hasAttribute('data-stack')).to.be.true;
    el.removeAttribute('interactive');
    el.removeAttribute('stack');
    await nextFrame();
    expect(el.classList.contains('ds-container--interactive')).to.be.false;
    expect(el.hasAttribute('data-stack')).to.be.false;
  });
});

describe('ds-container — teardown', () => {
  it('survives disconnect → reconnect without throwing', async () => {
    const el = await fixture(html`<ds-container>x</ds-container>`);
    const parent = el.parentNode;
    el.remove();
    parent.appendChild(el);
    await nextFrame();
    expect(el.classList.contains('ds-container')).to.be.true;
  });
});
