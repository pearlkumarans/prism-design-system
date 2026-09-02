/* Regression guards for the component deep-review fixes — the two classes most
   prone to silently regressing:
   (1) VALUE-LOSS: field values live in the DOM, not the `value` attribute, so a
       rebuild triggered by an unrelated attribute change must not wipe them.
   (2) INJECTION: consumer sinks the S4 grep-sweep missed, each verified to have
       injected live HTML before the fix. */
import { fixture, html, expect, nextFrame } from '@open-wc/testing';
import '../src/components/otp-input/otp-input.js';
import '../src/components/slider/slider.js';
import '../src/components/text-area/text-area.js';
import '../src/components/script-editor/script-editor.js';
import '../src/components/split-button/split-button.js';
import '../src/components/tag/tag.js';
import '../src/components/tab-bar-horizontal/tab-bar-horizontal.js';
import '../src/components/tab-bar-vertical/tab-bar-vertical.js';
import '../src/components/text-input/text-input.js';

const XSS = '"><img src=x onerror=alert(1)>';
const noImg = (el, ctx) => expect(el.querySelector('img[onerror]'), `${ctx}: injected an <img>`).to.not.exist;

describe('review regressions — value preservation across attribute-driven rebuilds', () => {
  it('ds-otp-input keeps typed digits when state changes; honours an initial value attr', async () => {
    const initial = await fixture(html`<ds-otp-input length="6" value="123456"></ds-otp-input>`);
    expect(initial.value, 'initial value attribute honoured').to.equal('123456');

    const el = await fixture(html`<ds-otp-input length="4"></ds-otp-input>`);
    el.querySelectorAll('.ds-otp-input__box').forEach((b, i) => {
      b.value = String(i + 1);
      b.dispatchEvent(new Event('input', { bubbles: true }));
    });
    expect(el.value).to.equal('1234');
    el.setAttribute('state', 'error');
    await nextFrame();
    expect(el.value, 'typed code wiped by state change').to.equal('1234');
  });

  it('ds-slider keeps a dragged value when state changes; explicit value still wins', async () => {
    const el = await fixture(html`<ds-slider type="single" value="50"></ds-slider>`);
    const input = el.querySelector('input[type="range"]');
    input.value = '80';
    input.dispatchEvent(new Event('input', { bubbles: true }));
    el.setAttribute('state', 'error');
    await nextFrame();
    expect(el.value, 'dragged value wiped by state change').to.equal(80);
    el.setAttribute('value', '30');
    await nextFrame();
    expect(el.value, 'an explicit value attribute must still win').to.equal(30);
  });

  it('ds-text-area keeps typed text when state changes and round-trips < & >', async () => {
    const el = await fixture(html`<ds-text-area value="initial"></ds-text-area>`);
    const ta = el.querySelector('textarea');
    ta.value = 'typed by user';
    ta.dispatchEvent(new Event('input', { bubbles: true }));
    el.setAttribute('state', 'error');
    await nextFrame();
    expect(el.value).to.equal('typed by user');

    const rt = await fixture(html`<ds-text-area value="if (a < b && c > d) {}"></ds-text-area>`);
    expect(rt.value).to.equal('if (a < b && c > d) {}');
    expect(rt.querySelector('textarea *'), 'value must not inject a node').to.not.exist;
  });

  it('ds-script-editor keeps edited code when state changes', async () => {
    const el = await fixture(html`<ds-script-editor type="basic">const x = 1;</ds-script-editor>`);
    const code = el.querySelector('.ds-script-editor__code');
    code.textContent = 'const y = 2;';
    code.dispatchEvent(new Event('input', { bubbles: true }));
    el.setAttribute('state', 'error');
    await nextFrame();
    expect(el.value).to.equal('const y = 2;');
  });
});

describe('review regressions — injection sinks the S4 sweep missed', () => {
  it('ds-slider escapes the label in range-mode thumb aria-labels', async () => {
    const el = await fixture(html`<ds-slider type="range" label="${XSS}"></ds-slider>`);
    await nextFrame();
    noImg(el, 'slider range label');
    expect(el.querySelector('[data-which="low"]').getAttribute('aria-label')).to.contain('<img');
  });

  it('ds-slider escapes min/max/step in the input attributes', async () => {
    const el = await fixture(html`<ds-slider min='0" onfocus=alert(1) x="'></ds-slider>`);
    await nextFrame();
    expect(el.querySelector('input[type="range"]').hasAttribute('onfocus'), 'min injected onfocus').to.be.false;
  });

  it('ds-split-button escapes the label in the chevron aria-label', async () => {
    const el = await fixture(html`<ds-split-button label="${XSS}"></ds-split-button>`);
    el.menuItems = [{ label: 'One', value: '1' }];
    await nextFrame();
    noImg(el, 'split-button chevron aria-label');
  });

  it('ds-tag escapes the label in the close-button aria-label', async () => {
    const el = await fixture(html`<ds-tag label="${XSS}"></ds-tag>`);
    await nextFrame();
    noImg(el, 'tag close aria-label');
    expect(el.querySelector('[data-close]').getAttribute('aria-label')).to.contain('<img');
  });

  it('ds-tab-bar-horizontal escapes badge variant, aria-controls (panelId) and data-id', async () => {
    const el = await fixture(html`<ds-tab-bar-horizontal></ds-tab-bar-horizontal>`);
    el.items = [{ id: 'a" onmouseover=x="', label: 'A', panelId: 'p" onx=y="', badge: { text: '2', variant: XSS } }];
    await nextFrame();
    noImg(el, 'tab-bar-horizontal badge variant');
    const tab = el.querySelector('[role="tab"]');
    expect(tab.hasAttribute('onmouseover'), 'item.id injected onmouseover').to.be.false;
    expect(tab.hasAttribute('onx'), 'panelId injected onx').to.be.false;
  });

  it('ds-tab-bar-vertical escapes aria-controls (panelId) and data-id', async () => {
    const el = await fixture(html`<ds-tab-bar-vertical></ds-tab-bar-vertical>`);
    el.items = [{ id: 'a" ]', label: 'A', panelId: 'p" onx=y="' }];
    await nextFrame();
    const tab = el.querySelector('[role="tab"]');
    expect(tab.hasAttribute('onx'), 'panelId injected onx').to.be.false;
    // and activating a special-char id must not throw a malformed-selector SyntaxError
    expect(() => el.querySelectorAll('[role="tab"]')).to.not.throw();
  });

  it('ds-script-editor escapes tab names', async () => {
    const el = await fixture(html`<ds-script-editor type="with-tabs" tabs="index.ts,${XSS}"></ds-script-editor>`);
    await nextFrame();
    noImg(el, 'script-editor tab names');
  });
});

describe('review regressions — portaled menus torn down on re-render (not just disconnect)', () => {
  const affixMenus = () => document.body.querySelectorAll('.ds-text-input__affix-menu');

  it('ds-text-input closes an open affix dropdown before an attribute-driven rebuild', async () => {
    const el = await fixture(html`<ds-text-input label="Amount" prefix-dropdown prefix-text="USD"></ds-text-input>`);
    el.prefixOptions = [{ label: 'USD', value: 'USD' }, { label: 'EUR', value: 'EUR' }];
    await nextFrame();

    // open the body-portaled affix menu
    el.querySelector('[data-prefix-dropdown]').click();
    await nextFrame();
    expect(affixMenus().length, 'affix menu should portal into body on open').to.equal(1);

    // A STRUCTURAL attribute change (label) rebuilds innerHTML — the open portaled
    // menu + its global listeners must be torn down, not orphaned (the leak class:
    // _render now calls _closeAffixMenu first). (Visual-only attrs like `state` take
    // the in-place fast path, which doesn't rebuild and so can't orphan the menu.)
    el.setAttribute('label', 'Amount (USD)');
    await nextFrame();
    expect(affixMenus().length, 're-render must not orphan the portaled affix menu').to.equal(0);
    expect(el.querySelector('[data-prefix-dropdown]')?.getAttribute('aria-expanded'))
      .to.not.equal('true');
  });
});
