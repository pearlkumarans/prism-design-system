/* ds-text-link — wraps an inner <a>. Covers the anchor structure, the spec
   default classes (primary/small/underline-none), href/target/rel wiring,
   disabled semantics, leading/trailing icons, the reactive `label` attribute,
   and escaping of both the label and icon names. */
import { fixture, html, expect, nextFrame } from '@open-wc/testing';
import '../src/components/text-link/text-link.js';

const XSS = '<img src=x onerror=alert(1)>';
const anchor = (el) => el.querySelector('a');

describe('ds-text-link — structure & defaults', () => {
  it('renders a single inner <a> with the slotted label', async () => {
    const el = await fixture(html`<ds-text-link href="/x">Docs</ds-text-link>`);
    expect(anchor(el), 'inner <a> missing').to.exist;
    expect(anchor(el).textContent.trim()).to.equal('Docs');
  });

  it('applies the default variant/size/underline classes (primary/small/none)', async () => {
    const el = await fixture(html`<ds-text-link href="/x">Docs</ds-text-link>`);
    const a = anchor(el);
    expect(a.classList.contains('ds-text-link--primary')).to.be.true;
    expect(a.classList.contains('ds-text-link--small')).to.be.true;
    expect(a.classList.contains('ds-text-link--underline-none')).to.be.true;
  });

  it('reflects supplied variant/size/underline', async () => {
    const el = await fixture(html`<ds-text-link variant="danger" size="large" underline="always" href="/x">D</ds-text-link>`);
    const a = anchor(el);
    expect(a.classList.contains('ds-text-link--danger')).to.be.true;
    expect(a.classList.contains('ds-text-link--large')).to.be.true;
    expect(a.classList.contains('ds-text-link--underline-always')).to.be.true;
  });

  it('falls back to defaults on invalid enums', async () => {
    const el = await fixture(html`<ds-text-link variant="bogus" size="huge" href="/x">D</ds-text-link>`);
    const a = anchor(el);
    expect(a.classList.contains('ds-text-link--primary')).to.be.true;
    expect(a.classList.contains('ds-text-link--small')).to.be.true;
  });

  it('applies the surface variant class (color:inherit is defined in CSS)', async () => {
    // Surface is the on-a-coloured-surface variant; its rule is `color: inherit` so the
    // container controls the colour. (The harness loads no component CSS, so we assert
    // the class here; the live colour inheritance is covered by the toast integration.)
    const el = await fixture(html`<ds-text-link variant="surface" href="/x">On surface</ds-text-link>`);
    const a = anchor(el);
    expect(a.classList.contains('ds-text-link--surface')).to.be.true;
  });
});

describe('ds-text-link — href, target & disabled', () => {
  it('sets href when enabled', async () => {
    const el = await fixture(html`<ds-text-link href="/docs">Docs</ds-text-link>`);
    expect(anchor(el).getAttribute('href')).to.equal('/docs');
  });

  it('hardens target="_blank" with rel="noopener noreferrer"', async () => {
    const el = await fixture(html`<ds-text-link href="/x" target="_blank">Docs</ds-text-link>`);
    expect(anchor(el).getAttribute('target')).to.equal('_blank');
    expect(anchor(el).getAttribute('rel')).to.equal('noopener noreferrer');
  });

  it('disabled removes href and sets aria-disabled', async () => {
    const el = await fixture(html`<ds-text-link href="/x" disabled>Docs</ds-text-link>`);
    expect(anchor(el).hasAttribute('href')).to.be.false;
    expect(anchor(el).getAttribute('aria-disabled')).to.equal('true');
  });
});

describe('ds-text-link — icons, reactive label & escaping', () => {
  it('renders leading/trailing icons as ds-icon inside icon spans', async () => {
    const el = await fixture(html`<ds-text-link href="/x" leading-icon="add" trailing-icon="chevron-down">D</ds-text-link>`);
    const icons = el.querySelectorAll('.ds-text-link__icon ds-icon');
    expect(icons.length).to.equal(2);
    expect(icons[0].getAttribute('name')).to.equal('add');
    expect(icons[1].getAttribute('name')).to.equal('chevron-down');
  });

  it('the label attribute wins over slotted text and updates reactively', async () => {
    const el = await fixture(html`<ds-text-link href="/x" label="Attr">Slotted</ds-text-link>`);
    expect(anchor(el).textContent).to.contain('Attr');
    el.setAttribute('label', 'Updated');
    await nextFrame();
    expect(anchor(el).textContent).to.contain('Updated');
  });

  it('escapes a hostile label — no <img> injected', async () => {
    const el = await fixture(html`<ds-text-link href="/x" label="${XSS}">x</ds-text-link>`);
    await nextFrame();
    expect(anchor(el).querySelector('img')).to.not.exist;
    expect(anchor(el).textContent).to.contain('<img');
  });

  it('escapes a hostile icon name — no injected attribute breakout', async () => {
    const el = await fixture(html`<ds-text-link href="/x" leading-icon='x" onload="alert(1)'>x</ds-text-link>`);
    await nextFrame();
    const icon = el.querySelector('.ds-text-link__icon ds-icon');
    expect(icon, 'exactly one ds-icon renders').to.exist;
    expect(icon.hasAttribute('onload'), 'no injected onload attribute').to.be.false;
  });
});

describe('ds-text-link — repaint-split', () => {
  it('keeps the leading ds-icon node across a visual-only variant change', async () => {
    const el = await fixture(html`<ds-text-link href="/x" leading-icon="external" variant="primary">Docs</ds-text-link>`);
    await nextFrame();
    const icon = el.querySelector('.ds-text-link__icon ds-icon');
    expect(icon, 'leading icon rendered').to.exist;
    el.setAttribute('variant', 'danger');
    await nextFrame();
    expect(el.querySelector('.ds-text-link__icon ds-icon'), 'same ds-icon node (not re-parsed)').to.equal(icon);
    expect(anchor(el).classList.contains('ds-text-link--danger'), 'variant class applied').to.be.true;
  });
});
