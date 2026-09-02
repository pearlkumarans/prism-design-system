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

describe('ds-list — teardown', () => {
  it('disconnects without throwing', async () => {
    const el = await fixture(html`<ds-list></ds-list>`);
    el.items = ['a'];
    await nextFrame();
    expect(() => el.remove()).to.not.throw();
  });
});
