/* ds-avatar — SHADOW-DOM composite. Content (image / initials / placeholder /
   hover glyph) is rendered into el.shadowRoot's [part="content"]; a hostile src
   or name is escaped at the innerHTML sink. Editable avatars are exposed as
   role=button + tabindex=0 with synthesized Enter/Space activation. */
import { fixture, html, expect, nextFrame } from '@open-wc/testing';
import '../src/components/avatar/avatar.js';

const content = (el) => el.shadowRoot.querySelector('[part="content"]');

describe('ds-avatar — type resolution & structure', () => {
  it('with neither name nor src, falls back to the placeholder glyph', async () => {
    const el = await fixture(html`<ds-avatar></ds-avatar>`);
    await nextFrame();
    expect(content(el).querySelector('.placeholder'), 'placeholder').to.exist;
    expect(content(el).querySelector('.initials')).to.not.exist;
  });

  it('a name (no src) renders initials', async () => {
    const el = await fixture(html`<ds-avatar name="Jane Doe"></ds-avatar>`);
    await nextFrame();
    const initials = content(el).querySelector('.initials');
    expect(initials, 'initials span').to.exist;
    expect(initials.textContent).to.equal('JD');
  });

  it('type="hover" renders the hover-fill glyph regardless of name/src', async () => {
    const el = await fixture(html`<ds-avatar type="hover" name="Jane"></ds-avatar>`);
    await nextFrame();
    expect(content(el).querySelector('.hover-fill')).to.exist;
  });

  it('an unknown size falls back to medium — placeholder glyph is 20px (enumAttr)', async () => {
    const el = await fixture(html`<ds-avatar size="bogus"></ds-avatar>`);
    await nextFrame();
    expect(content(el).querySelector('svg').getAttribute('width')).to.equal('20');
  });

  it('size="large" sizes the placeholder glyph to 24px', async () => {
    const el = await fixture(html`<ds-avatar size="large"></ds-avatar>`);
    await nextFrame();
    expect(content(el).querySelector('svg').getAttribute('width')).to.equal('24');
  });
});

describe('ds-avatar — escaping', () => {
  it('escapes a hostile image src — the src cannot break out into an event handler', async () => {
    const el = await fixture(html`<ds-avatar type="image" src=${'" onerror=alert(1) x="'}></ds-avatar>`);
    await nextFrame();
    const c = content(el);
    /* The invalid src may trigger the graceful image-error fallback (src dropped
       → placeholder), but the security property holds regardless: the escaped
       src can never form a separate onerror attribute. */
    expect(c.querySelector('img[onerror]'), 'no injected onerror attribute').to.not.exist;
    expect(c.innerHTML).to.not.match(/\sonerror\s*=/, 'src must not break out into an attribute');
  });

  it('renders an image with only alt + src attributes (valid src, no fallback)', async () => {
    const GIF = 'data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==';
    const el = await fixture(html`<ds-avatar type="image" name="Ada" src=${GIF}></ds-avatar>`);
    await nextFrame();
    const img = content(el).querySelector('img');
    expect(img, 'img rendered').to.exist;
    expect(img.getAttributeNames().sort()).to.eql(['alt', 'src']);
  });

  it('escapes a hostile name in initials — no injected element', async () => {
    const el = await fixture(html`<ds-avatar name=${'<img src=x onerror=alert(1)>'}></ds-avatar>`);
    await nextFrame();
    expect(content(el).querySelector('img'), 'name injected an <img>').to.not.exist;
    expect(content(el).querySelector('.initials').textContent).to.contain('<');
  });
});

describe('ds-avatar — editable a11y', () => {
  it('editable exposes role=button, a tab stop, and an accessible name', async () => {
    const el = await fixture(html`<ds-avatar editable name="Jane"></ds-avatar>`);
    await nextFrame();
    expect(el.getAttribute('role')).to.equal('button');
    expect(el.tabIndex).to.equal(0);
    expect(el.getAttribute('aria-label')).to.contain('Jane');
  });

  it('non-editable is not a button and exposes an "<name> avatar" label', async () => {
    const el = await fixture(html`<ds-avatar name="Jane"></ds-avatar>`);
    await nextFrame();
    expect(el.hasAttribute('role')).to.be.false;
    expect(el.getAttribute('aria-label')).to.equal('Jane avatar');
  });

  it('Enter on an editable avatar synthesizes a native click', async () => {
    const el = await fixture(html`<ds-avatar editable name="Jane"></ds-avatar>`);
    await nextFrame();
    let clicks = 0;
    el.addEventListener('click', () => (clicks += 1));
    el.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
    expect(clicks).to.equal(1);
  });

  it('disabled + editable drops the tab stop and Enter does not activate', async () => {
    const el = await fixture(html`<ds-avatar editable disabled name="Jane"></ds-avatar>`);
    await nextFrame();
    expect(el.tabIndex).to.equal(-1);
    let clicks = 0;
    el.addEventListener('click', () => (clicks += 1));
    el.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
    expect(clicks).to.equal(0);
  });
});

describe('ds-avatar — teardown', () => {
  it('survives disconnect → reconnect without throwing or duplicating content', async () => {
    const el = await fixture(html`<ds-avatar name="Jane Doe"></ds-avatar>`);
    await nextFrame();
    const parent = el.parentNode;
    el.remove();
    parent.appendChild(el);
    await nextFrame();
    expect(el.shadowRoot.querySelectorAll('[part="content"]').length).to.equal(1);
  });
});

describe('ds-avatar — repaint-split', () => {
  it('keeps the content <img> node across a visual-only size change (no re-fetch)', async () => {
    const GIF = 'data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==';
    const el = await fixture(html`<ds-avatar type="image" name="Ada" src=${GIF}></ds-avatar>`);
    await nextFrame();
    const img = content(el).querySelector('img');
    expect(img, 'img rendered').to.exist;
    el.setAttribute('size', 'large');
    await nextFrame();
    expect(content(el).querySelector('img'), 'same <img> node (not re-parsed / re-fetched)').to.equal(img);
    // Visual change applied: the hover overlay glyph is now sized for `large` (24px).
    expect(el.shadowRoot.querySelector('[part="overlay"] svg').getAttribute('width')).to.equal('24');
  });
});
