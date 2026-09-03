/* ds-badge — a light-DOM label chip; the host element IS the badge, so classes
   land on `this`. Covers structure, spec defaults (intense/default/medium/pill),
   variant/state/size/shape via attributes, icon rendering + escaping, the
   interactive/disabled a11y sync + click gate, reactivity, and teardown. */
import { fixture, html, expect, nextFrame } from '@open-wc/testing';
import '../src/components/badge/badge.js';

const XSS = '<img src=x onerror=alert(1)>';
const iconWrap = (el) => el.querySelector('.ds-badge__icon');
const labelEl = (el) => el.querySelector('.ds-badge__label');

describe('ds-badge — structure & defaults', () => {
  it('renders the badge class on the host and a label span', async () => {
    const el = await fixture(html`<ds-badge label="Active"></ds-badge>`);
    expect(el.classList.contains('ds-badge')).to.be.true;
    expect(labelEl(el), 'label span missing').to.exist;
    expect(labelEl(el).textContent).to.equal('Active');
  });

  it('applies the spec default classes (intense / default / medium / pill)', async () => {
    const el = await fixture(html`<ds-badge label="X"></ds-badge>`);
    expect(el.classList.contains('ds-badge--intense')).to.be.true;
    expect(el.classList.contains('ds-badge--default')).to.be.true;
    expect(el.classList.contains('ds-badge--medium')).to.be.true;
    expect(el.classList.contains('ds-badge--pill')).to.be.true;
  });

  it('reflects supplied variant / state / size / shape', async () => {
    const el = await fixture(html`<ds-badge variant="subtle" state="success" size="large" shape="rounded" label="Up"></ds-badge>`);
    expect(el.classList.contains('ds-badge--subtle')).to.be.true;
    expect(el.classList.contains('ds-badge--success')).to.be.true;
    expect(el.classList.contains('ds-badge--large')).to.be.true;
    expect(el.classList.contains('ds-badge--rounded')).to.be.true;
  });

  it('falls back to defaults on invalid enums', async () => {
    const el = await fixture(html`<ds-badge variant="bogus" state="huge" size="tiny" shape="oval" label="X"></ds-badge>`);
    expect(el.classList.contains('ds-badge--intense')).to.be.true;
    expect(el.classList.contains('ds-badge--default')).to.be.true;
    expect(el.classList.contains('ds-badge--medium')).to.be.true;
    expect(el.classList.contains('ds-badge--pill')).to.be.true;
  });

  it('mirrors rtl onto the host as dir="rtl"', async () => {
    const el = await fixture(html`<ds-badge rtl label="X"></ds-badge>`);
    expect(el.getAttribute('dir')).to.equal('rtl');
  });
});

describe('ds-badge — every state', () => {
  const STATES = ['default', 'active', 'critical', 'moderate', 'important', 'success', 'acknowledge'];
  STATES.forEach((state) => {
    it(`renders the ${state} state class`, async () => {
      const el = await fixture(html`<ds-badge state="${state}" label="X"></ds-badge>`);
      expect(el.classList.contains(`ds-badge--${state}`)).to.be.true;
    });
  });
});

describe('ds-badge — icon', () => {
  it('renders an icon wrapper with a ds-icon at the size-appropriate glyph size', async () => {
    for (const [size, px] of [['small', '8'], ['medium', '12'], ['large', '16']]) {
      const el = await fixture(html`<ds-badge size="${size}" icon="check" label="X"></ds-badge>`);
      const icon = iconWrap(el).querySelector('ds-icon');
      expect(icon, `${size} icon missing`).to.exist;
      expect(icon.getAttribute('name')).to.equal('check');
      expect(icon.getAttribute('size'), `${size} → ${px}px`).to.equal(px);
    }
  });

  it('leaves a consumer [slot="icon"] element untouched (no injected ds-icon)', async () => {
    const el = await fixture(html`<ds-badge icon="check" label="X"><span slot="icon">*</span></ds-badge>`);
    expect(el.querySelector('.ds-badge__icon')).to.not.exist;
    expect(el.querySelector('[slot="icon"]')).to.exist;
  });

  it('escapes a hostile icon name — no attribute breakout', async () => {
    const el = await fixture(html`<ds-badge icon='x" onload="alert(1)' label="X"></ds-badge>`);
    await nextFrame();
    const icon = iconWrap(el).querySelector('ds-icon');
    expect(icon).to.exist;
    expect(icon.hasAttribute('onload'), 'no injected onload attribute').to.be.false;
    expect(iconWrap(el).children.length).to.equal(1);
  });

  it('escapes a hostile label — no <img> injected (label is textContent)', async () => {
    const el = await fixture(html`<ds-badge label="${XSS}"></ds-badge>`);
    await nextFrame();
    expect(el.querySelector('img')).to.not.exist;
    expect(labelEl(el).textContent).to.contain('<img');
  });
});

describe('ds-badge — interactive & disabled', () => {
  it('interactive makes the host focusable (tabindex 0, role button)', async () => {
    const el = await fixture(html`<ds-badge interactive label="Filter"></ds-badge>`);
    expect(el.getAttribute('tabindex')).to.equal('0');
    expect(el.getAttribute('role')).to.equal('button');
  });

  it('disabled drops out of tab order and sets aria-disabled', async () => {
    const el = await fixture(html`<ds-badge interactive disabled label="Filter"></ds-badge>`);
    expect(el.getAttribute('tabindex')).to.equal('-1');
    expect(el.getAttribute('aria-disabled')).to.equal('true');
  });

  it('disabled blocks click activation (capture-phase gate)', async () => {
    const el = await fixture(html`<ds-badge interactive disabled label="Filter"></ds-badge>`);
    let fired = 0;
    el.addEventListener('click', () => (fired += 1));
    el.click();
    await nextFrame();
    expect(fired, 'a disabled badge must not emit click to consumer handlers').to.equal(0);
  });
});

describe('ds-badge — reactivity', () => {
  it('updates the state class when the attribute changes after mount', async () => {
    const el = await fixture(html`<ds-badge state="success" label="X"></ds-badge>`);
    el.setAttribute('state', 'critical');
    await nextFrame();
    expect(el.classList.contains('ds-badge--critical')).to.be.true;
    expect(el.classList.contains('ds-badge--success')).to.be.false;
  });

  it('updates the label text when the attribute changes after mount', async () => {
    const el = await fixture(html`<ds-badge label="Old"></ds-badge>`);
    el.setAttribute('label', 'New');
    await nextFrame();
    expect(labelEl(el).textContent).to.equal('New');
  });

  it('removing the icon attribute drops the icon wrapper', async () => {
    const el = await fixture(html`<ds-badge icon="check" label="X"></ds-badge>`);
    expect(iconWrap(el)).to.exist;
    el.removeAttribute('icon');
    await nextFrame();
    expect(iconWrap(el)).to.not.exist;
  });

  it('clears dir when rtl is removed', async () => {
    const el = await fixture(html`<ds-badge rtl label="X"></ds-badge>`);
    el.removeAttribute('rtl');
    await nextFrame();
    expect(el.hasAttribute('dir')).to.be.false;
  });
});

describe('ds-badge — a11y & teardown', () => {
  it('is accessible', async () => {
    const el = await fixture(html`<ds-badge state="success" icon="check" label="Active"></ds-badge>`);
    await expect(el).to.be.accessible({ ignoredRules: ['color-contrast'] });
  });

  it('survives disconnect → reconnect without throwing or duplicating the label', async () => {
    const el = await fixture(html`<ds-badge icon="check" label="Active"></ds-badge>`);
    const parent = el.parentNode;
    el.remove();
    parent.appendChild(el);
    await nextFrame();
    expect(el.querySelectorAll('.ds-badge__label').length).to.equal(1);
    expect(el.querySelectorAll('.ds-badge__icon').length).to.equal(1);
  });
});
