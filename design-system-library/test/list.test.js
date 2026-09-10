/* ds-list — the dual trust model is the headline:
   · slotted <ds-list-item> innerHTML is AUTHOR markup, rendered AS-IS (a real
     <b>/<a> renders);
   · the `items` PROPERTY strings are DATA and are ESCAPED (no injected <img>).
   Plus: one <li> per entry, ordered vs unordered tag, icon style, and teardown. */
import { fixture, html, expect, nextFrame } from '@open-wc/testing';
import '../src/components/list/list.js';

const XSS = '"><img src=x onerror=alert(1)>';
const lis = (el) => el.querySelectorAll('.ds-list__item');

describe('ds-list — structure & defaults', () => {
  it('renders one <li> per items-property entry', async () => {
    const el = await fixture(html`<ds-list></ds-list>`);
    el.items = ['Alpha', 'Beta', 'Gamma'];
    await nextFrame();
    expect(lis(el).length).to.equal(3);
  });

  it('renders an <ul> for the default (disc) style', async () => {
    const el = await fixture(html`<ds-list></ds-list>`);
    el.items = ['a'];
    await nextFrame();
    expect(el.querySelector('ul.ds-list__inner')).to.exist;
    expect(el.querySelector('.ds-list--disc')).to.exist;
  });

  it('renders an <ol> for an ordered (number) style', async () => {
    const el = await fixture(html`<ds-list style-variant="number"></ds-list>`);
    el.items = ['a', 'b'];
    await nextFrame();
    expect(el.querySelector('ol.ds-list__inner')).to.exist;
  });

  it('applies the size class (default small)', async () => {
    const el = await fixture(html`<ds-list></ds-list>`);
    el.items = ['a'];
    await nextFrame();
    expect(el.querySelector('.ds-list--small')).to.exist;
  });

  it('renders a ds-icon per item for the icon style', async () => {
    const el = await fixture(html`<ds-list style-variant="icon"></ds-list>`);
    el.items = ['a'];
    await nextFrame();
    expect(el.querySelector('.ds-list__icon ds-icon')).to.exist;
  });

  it('the icon-style marker fills its box via size="100%" (svg width is 100%, not a fixed 100px)', async () => {
    /* Regression: ds-icon once coerced size with parseFloat, turning "100%" into
       100 (px) and blowing up the custom-icon marker. Percentage sizing must
       survive the sanitiser and reach the <svg width>. */
    const el = await fixture(html`<ds-list style-variant="icon"></ds-list>`);
    el.items = ['a'];
    await nextFrame();
    const icon = el.querySelector('.ds-list__icon ds-icon');
    expect(icon.getAttribute('size'), 'marker requests percentage sizing').to.equal('100%');
    await nextFrame(); // ds-icon renders its svg
    const svg = icon.querySelector('svg');
    expect(svg, 'ds-icon rendered an svg').to.exist;
    expect(svg.getAttribute('width'), 'svg fills the box, not a fixed 100px').to.equal('100%');
  });

  it('reflects rtl to dir on the inner root', async () => {
    const el = await fixture(html`<ds-list rtl></ds-list>`);
    el.items = ['a'];
    await nextFrame();
    expect(el.querySelector('.ds-list').getAttribute('dir')).to.equal('rtl');
  });
});

describe('ds-list — trust model', () => {
  it('renders SLOTTED author markup AS-IS (a real <b> element)', async () => {
    const el = await fixture(html`
      <ds-list><ds-list-item><b>bold</b> text</ds-list-item></ds-list>`);
    await nextFrame();
    const bold = el.querySelector('.ds-list__text b');
    expect(bold, 'author <b> should render as a real element').to.exist;
    expect(bold.textContent).to.equal('bold');
  });

  it('renders a slotted inline <a> author link as-is', async () => {
    const el = await fixture(html`
      <ds-list><ds-list-item><a href="/x">link</a></ds-list-item></ds-list>`);
    await nextFrame();
    const a = el.querySelector('.ds-list__text a');
    expect(a).to.exist;
    expect(a.getAttribute('href')).to.equal('/x');
  });

  it('ESCAPES an items-property string (no injected <img>, literal text)', async () => {
    const el = await fixture(html`<ds-list></ds-list>`);
    el.items = [XSS];
    await nextFrame();
    const text = el.querySelector('.ds-list__text');
    expect(text.querySelector('img'), 'data string must not inject an <img>').to.not.exist;
    expect(text.textContent).to.contain('<img');
  });

  it('accepts object items with a text field and escapes them', async () => {
    const el = await fixture(html`<ds-list></ds-list>`);
    el.items = [{ text: XSS }];
    await nextFrame();
    expect(el.querySelector('.ds-list__text img')).to.not.exist;
    expect(el.querySelector('.ds-list__text').textContent).to.contain('<img');
  });

  it('does not double-escape a plain ampersand in items data', async () => {
    const el = await fixture(html`<ds-list></ds-list>`);
    el.items = ['R&D'];
    await nextFrame();
    expect(el.querySelector('.ds-list__text').textContent).to.equal('R&D');
  });
});

describe('ds-list — title', () => {
  it('renders a heading (default h3) and labels the list with it', async () => {
    const el = await fixture(html`<ds-list title="Section"></ds-list>`);
    el.items = ['a'];
    await nextFrame();
    const h = el.querySelector('.ds-list__title');
    expect(h).to.exist;
    expect(h.tagName.toLowerCase()).to.equal('h3');
    expect(h.textContent).to.equal('Section');
    expect(el.querySelector('.ds-list__inner').getAttribute('aria-labelledby')).to.equal(h.id);
  });

  it('honours heading-level', async () => {
    const el = await fixture(html`<ds-list title="T" heading-level="2"></ds-list>`);
    el.items = ['a'];
    await nextFrame();
    expect(el.querySelector('.ds-list__title').tagName.toLowerCase()).to.equal('h2');
  });

  it('escapes the title (no injected markup)', async () => {
    const el = await fixture(html`<ds-list></ds-list>`);
    el.setAttribute('title', XSS);
    el.items = ['a'];
    await nextFrame();
    const h = el.querySelector('.ds-list__title');
    expect(h.querySelector('img')).to.not.exist;
    expect(h.textContent).to.include('<img');
  });

  it('no title → no heading, no aria-labelledby', async () => {
    const el = await fixture(html`<ds-list></ds-list>`);
    el.items = ['a'];
    await nextFrame();
    expect(el.querySelector('.ds-list__title')).to.not.exist;
    expect(el.querySelector('.ds-list__inner').hasAttribute('aria-labelledby')).to.be.false;
  });
});

describe('ds-list — clickable items (href → ds-text-link)', () => {
  it('renders an item with href as a secondary, no-underline ds-text-link', async () => {
    const el = await fixture(html`<ds-list></ds-list>`);
    el.items = [{ text: 'Docs', href: '/docs' }];
    await nextFrame();
    const link = el.querySelector('.ds-list__link');
    expect(link).to.exist;
    expect(link.tagName.toLowerCase()).to.equal('ds-text-link');
    expect(link.getAttribute('variant')).to.equal('secondary');
    expect(link.getAttribute('underline')).to.equal('none');
    expect(link.getAttribute('href')).to.equal('/docs');
  });

  it('items without href stay plain text (mixed list)', async () => {
    const el = await fixture(html`<ds-list></ds-list>`);
    el.items = [{ text: 'Linked', href: '/x' }, 'Plain'];
    await nextFrame();
    expect(el.querySelectorAll('.ds-list__link').length).to.equal(1);
    expect(lis(el).length).to.equal(2);
  });

  it('maps the list size onto the link size', async () => {
    const el = await fixture(html`<ds-list size="large"></ds-list>`);
    el.items = [{ text: 'a', href: '/a' }];
    await nextFrame();
    expect(el.querySelector('.ds-list__link').getAttribute('size')).to.equal('large');
  });

  it('target="_blank" is passed through and the anchor gets rel="noopener"', async () => {
    const el = await fixture(html`<ds-list></ds-list>`);
    el.items = [{ text: 'Ext', href: 'https://x.com', target: '_blank' }];
    await nextFrame();
    const link = el.querySelector('.ds-list__link');
    expect(link.getAttribute('target')).to.equal('_blank');
    await nextFrame();
    expect(link.querySelector('a').getAttribute('rel')).to.contain('noopener');
  });

  it('reads href from a slotted <ds-list-item>', async () => {
    const el = await fixture(html`<ds-list><ds-list-item href="/s">Slotted</ds-list-item></ds-list>`);
    await nextFrame();
    const link = el.querySelector('.ds-list__link');
    expect(link).to.exist;
    expect(link.getAttribute('href')).to.equal('/s');
  });

  it('escapes an href from items data (no injected markup)', async () => {
    const el = await fixture(html`<ds-list></ds-list>`);
    el.items = [{ text: 'x', href: XSS }];
    await nextFrame();
    expect(el.querySelector('.ds-list__inner img')).to.not.exist;
  });
});

describe('ds-list — teardown', () => {
  it('disconnects without throwing', async () => {
    const el = await fixture(html`<ds-list></ds-list>`);
    el.items = ['a'];
    await nextFrame();
    expect(() => el.remove()).to.not.throw();
  });
});
