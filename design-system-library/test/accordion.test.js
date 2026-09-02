/* ds-accordion — SHADOW-DOM composite. Internals live in el.shadowRoot; the
   header carries role/aria-expanded, the body is the slotted content region.
   Slotted title/description/body are real light-DOM nodes (injection-safe by
   construction), so there's no escaping test here. type=checkbox/toggle grows a
   real leading <ds-checkbox>/<ds-toggle> in LIGHT DOM (data-acc-leading). */
import { fixture, html, expect, oneEvent, nextFrame } from '@open-wc/testing';
import '../src/components/accordion/accordion.js';

const header = (el) => el.shadowRoot.querySelector('[part="header"]');
const body   = (el) => el.shadowRoot.querySelector('[part="body"]');

describe('ds-accordion — structure & defaults', () => {
  it('builds a shadow root with a role=button header and a role=region body', async () => {
    const el = await fixture(html`<ds-accordion></ds-accordion>`);
    await nextFrame();
    expect(el.shadowRoot, 'accordion is shadow-DOM').to.exist;
    expect(header(el).getAttribute('role')).to.equal('button');
    expect(body(el).getAttribute('role')).to.equal('region');
  });

  it('renders the default title slot fallback text', async () => {
    const el = await fixture(html`<ds-accordion></ds-accordion>`);
    await nextFrame();
    const slot = el.shadowRoot.querySelector('slot[name="title"]');
    expect(slot.textContent).to.equal('Accordion Title');
  });

  it('is collapsed by default — aria-expanded="false"', async () => {
    const el = await fixture(html`<ds-accordion></ds-accordion>`);
    await nextFrame();
    expect(header(el).getAttribute('aria-expanded')).to.equal('false');
  });
});

describe('ds-accordion — expand / collapse', () => {
  it('the expanded attribute drives aria-expanded on the header', async () => {
    const el = await fixture(html`<ds-accordion expanded></ds-accordion>`);
    await nextFrame();
    expect(header(el).getAttribute('aria-expanded')).to.equal('true');
    el.removeAttribute('expanded');
    await nextFrame();
    expect(header(el).getAttribute('aria-expanded')).to.equal('false');
  });

  it('toggle() flips expanded and fires ds-accordion-toggle with the new state', async () => {
    const el = await fixture(html`<ds-accordion></ds-accordion>`);
    await nextFrame();
    setTimeout(() => el.toggle());
    const ev = await oneEvent(el, 'ds-accordion-toggle');
    expect(ev.detail.expanded).to.be.true;
    expect(el.expanded).to.be.true;
  });

  it('the expanded property setter reflects the attribute', async () => {
    const el = await fixture(html`<ds-accordion></ds-accordion>`);
    await nextFrame();
    el.expanded = true;
    expect(el.hasAttribute('expanded')).to.be.true;
    await nextFrame();
    expect(header(el).getAttribute('aria-expanded')).to.equal('true');
  });
});

describe('ds-accordion — leading control (type)', () => {
  it('type="checkbox" grows a real leading <ds-checkbox> in light DOM', async () => {
    const el = await fixture(html`<ds-accordion type="checkbox"></ds-accordion>`);
    await nextFrame();
    const cb = el.querySelector(':scope > ds-checkbox[data-acc-leading]');
    expect(cb, 'auto-created checkbox').to.exist;
    expect(cb.getAttribute('slot')).to.equal('leading-control');
  });

  it('type="toggle" grows a real leading <ds-toggle> in light DOM', async () => {
    const el = await fixture(html`<ds-accordion type="toggle"></ds-accordion>`);
    await nextFrame();
    const tg = el.querySelector(':scope > ds-toggle[data-acc-leading]');
    expect(tg, 'auto-created toggle').to.exist;
    expect(tg.getAttribute('slot')).to.equal('leading-control');
  });

  it('the leading control mirrors [expanded] via [checked]', async () => {
    const el = await fixture(html`<ds-accordion type="checkbox" expanded></ds-accordion>`);
    await nextFrame();
    const cb = el.querySelector(':scope > ds-checkbox[data-acc-leading]');
    expect(cb.hasAttribute('checked')).to.be.true;
  });

  it('an unknown type falls back to default (no leading control) — enumAttr', async () => {
    const el = await fixture(html`<ds-accordion type="bogus"></ds-accordion>`);
    await nextFrame();
    expect(el.querySelector('[data-acc-leading]')).to.not.exist;
  });
});

describe('ds-accordion — disabled & a11y', () => {
  it('wires aria-controls from the header to the body region', async () => {
    const el = await fixture(html`<ds-accordion></ds-accordion>`);
    await nextFrame();
    const controls = header(el).getAttribute('aria-controls');
    expect(controls).to.be.a('string').and.to.have.length.above(0);
    expect(body(el).id).to.equal(controls);
  });

  it('disabled: header is aria-disabled + removed from the tab order, and a click does not toggle', async () => {
    const el = await fixture(html`<ds-accordion disabled></ds-accordion>`);
    await nextFrame();
    expect(header(el).getAttribute('aria-disabled')).to.equal('true');
    expect(header(el).tabIndex).to.equal(-1);
    header(el).click();
    await nextFrame();
    expect(el.expanded, 'disabled click is a no-op').to.be.false;
  });
});

describe('ds-accordion — teardown', () => {
  it('survives disconnect → reconnect without duplicating the shadow header', async () => {
    const el = await fixture(html`<ds-accordion type="checkbox"></ds-accordion>`);
    await nextFrame();
    const parent = el.parentNode;
    el.remove();
    parent.appendChild(el);
    await nextFrame();
    expect(el.shadowRoot.querySelectorAll('[part="header"]').length).to.equal(1);
  });
});
