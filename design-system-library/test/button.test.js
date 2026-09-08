/* ds-button — the reference base component. Covers the native-button contract,
   the reactive `label`-attr pattern (whose absence broke confirmation-modal),
   loading/disabled semantics, icon rendering + escaping (the S1 class), the
   click gate, late-child label reclaim, and the imperative proxies. */
import { fixture, html, expect, oneEvent, nextFrame } from '@open-wc/testing';
import '../src/components/button/button.js';

const innerBtn = (el) => el.querySelector('button');
const labelEl = (el) => el.querySelector('.ds-button__label');
const prefixEl = (el) => el.querySelector('.ds-button__prefix');
const suffixEl = (el) => el.querySelector('.ds-button__suffix');

describe('ds-button — structure & native semantics', () => {
  it('renders a single real <button> as its child (form semantics intact)', async () => {
    const el = await fixture(html`<ds-button>Save</ds-button>`);
    const btn = innerBtn(el);
    expect(btn, 'inner <button> missing').to.exist;
    expect(el.children.length, 'host should have exactly one element child').to.equal(1);
    expect(el.children[0]).to.equal(btn);
    expect(labelEl(el).textContent).to.equal('Save');
  });

  it('applies the default variant + size classes (primary / small)', async () => {
    const el = await fixture(html`<ds-button>Go</ds-button>`);
    expect(innerBtn(el).className).to.equal('ds-button ds-button--primary ds-button--small');
  });

  it('reflects variant + size to the inner button', async () => {
    const el = await fixture(html`<ds-button variant="destructive" size="large">Delete</ds-button>`);
    expect(innerBtn(el).classList.contains('ds-button--destructive')).to.be.true;
    expect(innerBtn(el).classList.contains('ds-button--large')).to.be.true;
  });

  it('falls back to the default variant on an invalid value (enumAttr)', async () => {
    const el = await fixture(html`<ds-button variant="bogus">X</ds-button>`);
    expect(innerBtn(el).classList.contains('ds-button--primary')).to.be.true;
  });

  it('reflects `type` to the inner button (submit / reset / default)', async () => {
    const submit = await fixture(html`<ds-button type="submit">S</ds-button>`);
    expect(innerBtn(submit).type).to.equal('submit');
    const bare = await fixture(html`<ds-button>B</ds-button>`);
    expect(innerBtn(bare).type).to.equal('button');
  });
});

describe('ds-button — reactive label', () => {
  it('the `label` attribute wins over slotted content and updates reactively', async () => {
    const el = await fixture(html`<ds-button label="Attr">Slotted</ds-button>`);
    expect(labelEl(el).textContent).to.equal('Attr');
    el.setAttribute('label', 'Updated');
    await nextFrame();
    expect(labelEl(el).textContent).to.equal('Updated');
  });

  it('removing the `label` attribute restores the slotted label', async () => {
    const el = await fixture(html`<ds-button label="Attr">Slotted</ds-button>`);
    el.removeAttribute('label');
    await nextFrame();
    expect(labelEl(el).textContent).to.equal('Slotted');
  });

  it('reclaims a label appended AFTER upgrade (framework insertion order)', async () => {
    const el = await fixture(html`<ds-button></ds-button>`);
    el.appendChild(document.createTextNode('Late'));
    await nextFrame();
    expect(labelEl(el).textContent).to.equal('Late');
    // the stray text node was moved into the label, not left beside the button
    expect(el.children.length).to.equal(1);
  });
});

describe('ds-button — disabled & loading', () => {
  it('disabled disables the inner button and blocks click', async () => {
    const el = await fixture(html`<ds-button disabled>Nope</ds-button>`);
    expect(innerBtn(el).disabled).to.be.true;
    let fired = 0;
    el.addEventListener('click', () => (fired += 1));
    el.click();
    innerBtn(el).click();
    await nextFrame();
    expect(fired, 'a disabled button must not emit click').to.equal(0);
  });

  it('loading: disables, sets aria-busy, shows the spinner, hides the suffix, keeps the label', async () => {
    const el = await fixture(html`<ds-button loading suffix-icon="chevron-down">Saving</ds-button>`);
    const btn = innerBtn(el);
    expect(btn.disabled).to.be.true;
    expect(btn.getAttribute('aria-busy')).to.equal('true');
    expect(prefixEl(el).querySelector('.ds-button__spinner'), 'spinner replaces the prefix').to.exist;
    expect(suffixEl(el).style.display).to.equal('none');
    expect(labelEl(el).textContent, 'label stays visible while loading').to.equal('Saving');
  });

  it('clears aria-busy + spinner when loading is removed', async () => {
    const el = await fixture(html`<ds-button loading>Saving</ds-button>`);
    el.removeAttribute('loading');
    await nextFrame();
    expect(innerBtn(el).hasAttribute('aria-busy')).to.be.false;
    expect(prefixEl(el).querySelector('.ds-button__spinner')).to.not.exist;
  });
});

describe('ds-button — icons', () => {
  it('renders prefix/suffix icons with the size-appropriate glyph size', async () => {
    const el = await fixture(html`<ds-button size="xsmall" prefix-icon="add" suffix-icon="chevron-down">X</ds-button>`);
    const pre = prefixEl(el).querySelector('ds-icon');
    const suf = suffixEl(el).querySelector('ds-icon');
    expect(pre.getAttribute('name')).to.equal('add');
    expect(pre.getAttribute('size'), 'xsmall → 12px icon').to.equal('12');
    expect(suf.getAttribute('size')).to.equal('12');
  });

  it('maps size → icon px (large/medium 20, small 16, xsmall 12)', async () => {
    for (const [size, px] of [['large', '20'], ['medium', '20'], ['small', '16'], ['xsmall', '12']]) {
      const el = await fixture(html`<ds-button size="${size}" prefix-icon="add">X</ds-button>`);
      expect(prefixEl(el).querySelector('ds-icon').getAttribute('size'), `${size} icon size`).to.equal(px);
    }
  });

  it('hides the prefix/suffix wrapper when no icon is set', async () => {
    const el = await fixture(html`<ds-button>Plain</ds-button>`);
    expect(prefixEl(el).style.display).to.equal('none');
    expect(suffixEl(el).style.display).to.equal('none');
  });

  it('escapes a hostile icon name — no HTML injection (S1)', async () => {
    const el = await fixture(html`<ds-button prefix-icon='x" onload="alert(1)'>X</ds-button>`);
    await nextFrame();
    // the value cannot break out of the attribute → exactly one ds-icon, no stray nodes
    expect(prefixEl(el).children.length).to.equal(1);
    expect(prefixEl(el).querySelector('ds-icon')).to.exist;
    expect(prefixEl(el).querySelector('ds-icon').hasAttribute('onload'), 'no injected onload attribute').to.be.false;
  });
});

describe('ds-button — events & proxies', () => {
  it('emits a native click when enabled', async () => {
    const el = await fixture(html`<ds-button>Click</ds-button>`);
    setTimeout(() => el.click());
    const ev = await oneEvent(el, 'click');
    expect(ev).to.exist;
  });

  it('click() / focus() / blur() delegate to the inner button', async () => {
    const el = await fixture(html`<ds-button>Focusable</ds-button>`);
    el.focus();
    expect(document.activeElement).to.equal(innerBtn(el));
    el.blur();
    expect(document.activeElement).to.not.equal(innerBtn(el));
  });

  it('mirrors rtl onto the inner button as dir="rtl"', async () => {
    const el = await fixture(html`<ds-button rtl>rtl</ds-button>`);
    expect(innerBtn(el).getAttribute('dir')).to.equal('rtl');
    el.removeAttribute('rtl');
    await nextFrame();
    expect(innerBtn(el).hasAttribute('dir')).to.be.false;
  });
});

describe('ds-button — teardown', () => {
  it('survives a disconnect → reconnect without duplicating the button or throwing', async () => {
    const el = await fixture(html`<ds-button prefix-icon="add">Reattach</ds-button>`);
    const parent = el.parentNode;
    el.remove();
    parent.appendChild(el);
    await nextFrame();
    expect(el.querySelectorAll('button').length, 'exactly one inner button after reconnect').to.equal(1);
    expect(labelEl(el).textContent).to.equal('Reattach');
  });
});

describe('ds-button — surface variant colours', () => {
  /* Colour assertions need the real stylesheet: the shared harness does not load
     component CSS, so color/border-color would read as initial values. Each load
     races a timer and never rejects — a stalled sheet must not hang the suite. */
  before(async () => {
    const HREFS = ['/src/tokens/primitives.css', '/src/tokens/spacing.css',
      '/src/tokens/typography.css', '/src/tokens/tokens.css',
      '/src/components/button/button.css'];
    await Promise.all(HREFS.map((href) => new Promise((resolve) => {
      if (document.querySelector(`link[href="${href}"]`)) return resolve();
      const link = Object.assign(document.createElement('link'), { rel: 'stylesheet', href });
      link.addEventListener('load', resolve);
      link.addEventListener('error', resolve);
      setTimeout(resolve, 2000);
      document.head.appendChild(link);
    })));
    await nextFrame();
  });

  /* Resolve a token through the browser so both sides of the comparison are the
     same rgb() string — and so the assertion holds in either theme rather than
     pinning a hex that only matches the one this harness happens to run in. */
  const resolved = (value) => {
    const probe = document.createElement('span');
    probe.style.color = value;
    document.body.appendChild(probe);
    const out = getComputedStyle(probe).color;
    probe.remove();
    return out;
  };
  const surface = (el) => el.querySelector('.ds-button');

  it('renders the border and the label in the accent colour', async () => {
    const el = await fixture(html`<ds-button variant="surface">Get Quote</ds-button>`);
    await nextFrame();
    const cs = getComputedStyle(surface(el));
    expect(cs.color, 'label is accent').to.equal(resolved('var(--uems-text-accent-link)'));
    expect(cs.borderTopColor, 'border is accent').to.equal(resolved('var(--uems-border-accent)'));
  });

  it('keeps the label and border matched, not a shade apart', async () => {
    /* Both tokens resolve to the same hyperlink blue; if either is retargeted the
       pairing should be a deliberate decision, not a silent drift. */
    const el = await fixture(html`<ds-button variant="surface">Book Now</ds-button>`);
    await nextFrame();
    const cs = getComputedStyle(surface(el));
    expect(cs.color).to.equal(cs.borderTopColor);
  });

  it('keeps its opaque surface fill — it is not an outline button', async () => {
    const el = await fixture(html`<ds-button variant="surface">Get Quote</ds-button>`);
    await nextFrame();
    const bg = getComputedStyle(surface(el)).backgroundColor;
    expect(bg, 'not transparent').to.not.equal('rgba(0, 0, 0, 0)');
    expect(bg).to.equal(resolved('var(--uems-bg-primary-alt)'));
  });

  it('drops the accent when disabled', async () => {
    const el = await fixture(html`<ds-button variant="surface" disabled>Get Quote</ds-button>`);
    await nextFrame();
    const cs = getComputedStyle(surface(el));
    expect(cs.color, 'label goes neutral').to.equal(resolved('var(--uems-text-disabled)'));
    expect(cs.borderTopColor, 'border goes neutral').to.equal(resolved('var(--uems-border-disabled)'));
  });
});
