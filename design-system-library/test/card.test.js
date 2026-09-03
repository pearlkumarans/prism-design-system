/* ds-card — the generic content surface. Host owns the class + role=group; the
   markup rebuilds into header / body / footer regions. Covers structure, spec
   defaults (elevated/medium), type/size/state variants, the stripped-title
   contract (avoids a native tooltip), footer link, slotted content preservation,
   title/subtitle/footer escaping, reactivity, a11y, and teardown. */
import { fixture, html, expect, nextFrame, oneEvent } from '@open-wc/testing';
import '../src/components/card/card.js';

const XSS = '<img src=x onerror=alert(1)>';
const titleEl = (el) => el.querySelector('.ds-card__title');
const bodyEl = (el) => el.querySelector('.ds-card__body');
const footerLink = (el) => el.querySelector('.ds-card__footer [data-footer-action]');

describe('ds-card — structure & defaults', () => {
  it('renders header / body / footer regions on a group host', async () => {
    const el = await fixture(html`<ds-card title="Devices"></ds-card>`);
    expect(el.getAttribute('role')).to.equal('group');
    expect(el.querySelector('.ds-card__header'), 'header missing').to.exist;
    expect(bodyEl(el), 'body missing').to.exist;
    expect(el.querySelector('.ds-card__footer'), 'footer missing').to.exist;
  });

  it('applies the spec default classes (elevated / medium)', async () => {
    const el = await fixture(html`<ds-card title="X"></ds-card>`);
    expect(el.classList.contains('ds-card')).to.be.true;
    expect(el.classList.contains('ds-card--elevated')).to.be.true;
    expect(el.classList.contains('ds-card--medium')).to.be.true;
  });

  it('reflects supplied type + size', async () => {
    const el = await fixture(html`<ds-card type="outlined" size="large" title="X"></ds-card>`);
    expect(el.classList.contains('ds-card--outlined')).to.be.true;
    expect(el.classList.contains('ds-card--large')).to.be.true;
  });

  it('falls back to defaults on invalid enums', async () => {
    const el = await fixture(html`<ds-card type="glass" size="huge" title="X"></ds-card>`);
    expect(el.classList.contains('ds-card--elevated')).to.be.true;
    expect(el.classList.contains('ds-card--medium')).to.be.true;
  });
});

describe('ds-card — title contract', () => {
  it('renders the title in an h3 and strips the native title attribute off the host', async () => {
    const el = await fixture(html`<ds-card title="Server status"></ds-card>`);
    expect(titleEl(el).textContent).to.equal('Server status');
    expect(el.hasAttribute('title'), 'title attr must be stripped to avoid a browser tooltip').to.be.false;
  });

  it('uses the title as the host aria-label', async () => {
    const el = await fixture(html`<ds-card title="Server status"></ds-card>`);
    expect(el.getAttribute('aria-label')).to.equal('Server status');
  });

  it('renders the subtitle when supplied', async () => {
    const el = await fixture(html`<ds-card title="X" subtitle="Supporting text"></ds-card>`);
    expect(el.querySelector('.ds-card__subtitle').textContent).to.equal('Supporting text');
  });

  it('hides the subtitle with show-subtitle="false"', async () => {
    const el = await fixture(html`<ds-card title="X" subtitle="Sub" show-subtitle="false"></ds-card>`);
    expect(el.querySelector('.ds-card__subtitle')).to.not.exist;
  });
});

describe('ds-card — toggles & state', () => {
  it('omits the body with show-body="false"', async () => {
    const el = await fixture(html`<ds-card title="X" show-body="false"></ds-card>`);
    expect(bodyEl(el)).to.not.exist;
  });

  it('omits the footer with show-footer="false"', async () => {
    const el = await fixture(html`<ds-card title="X" show-footer="false"></ds-card>`);
    expect(el.querySelector('.ds-card__footer')).to.not.exist;
  });

  it('renders the footer link with the supplied label + href', async () => {
    const el = await fixture(html`<ds-card title="X" footer-label="Manage" footer-href="/manage"></ds-card>`);
    const link = footerLink(el);
    expect(link, 'footer link missing').to.exist;
    expect(link.textContent.trim()).to.equal('Manage');
    expect(link.getAttribute('href')).to.equal('/manage');
  });

  it('adds the selected + disabled state classes and aria-disabled', async () => {
    const el = await fixture(html`<ds-card title="X" selected disabled></ds-card>`);
    expect(el.classList.contains('ds-card--selected')).to.be.true;
    expect(el.classList.contains('ds-card--disabled')).to.be.true;
    expect(el.getAttribute('aria-disabled')).to.equal('true');
  });

  it('renders a media region when show-media is set', async () => {
    const el = await fixture(html`<ds-card title="X" show-media></ds-card>`);
    expect(el.querySelector('.ds-card__media')).to.exist;
  });

  it('mirrors rtl onto the host as dir="rtl"', async () => {
    const el = await fixture(html`<ds-card title="X" rtl></ds-card>`);
    expect(el.getAttribute('dir')).to.equal('rtl');
  });
});

describe('ds-card — slotted content', () => {
  it('moves default-slot content into the body region', async () => {
    const el = await fixture(html`<ds-card title="X"><p class="mine">Body</p></ds-card>`);
    const mine = bodyEl(el).querySelector('.mine');
    expect(mine, 'consumer content not homed into body').to.exist;
    expect(mine.textContent).to.equal('Body');
  });

  it('emits ds-card-action when the footer link is activated', async () => {
    const el = await fixture(html`<ds-card title="X" footer-label="Go" footer-href="/go"></ds-card>`);
    setTimeout(() => footerLink(el).click());
    const ev = await oneEvent(el, 'ds-card-action');
    expect(ev.detail.href).to.equal('/go');
  });
});

describe('ds-card — escaping', () => {
  it('escapes a hostile title — no <img> injected', async () => {
    const el = await fixture(html`<ds-card title="${XSS}"></ds-card>`);
    await nextFrame();
    expect(el.querySelector('img')).to.not.exist;
    expect(titleEl(el).textContent).to.contain('<img');
  });

  it('escapes a hostile subtitle — no <img> injected', async () => {
    const el = await fixture(html`<ds-card title="X" subtitle="${XSS}"></ds-card>`);
    await nextFrame();
    expect(el.querySelector('img')).to.not.exist;
  });

  it('escapes a hostile footer href — no attribute breakout', async () => {
    const el = await fixture(html`<ds-card title="X" footer-href='/x" onmouseover="alert(1)'></ds-card>`);
    await nextFrame();
    const link = footerLink(el);
    expect(link).to.exist;
    expect(link.hasAttribute('onmouseover')).to.be.false;
  });
});

describe('ds-card — reactivity', () => {
  it('repaints the type class when the attribute changes after mount', async () => {
    const el = await fixture(html`<ds-card type="elevated" title="X"></ds-card>`);
    el.setAttribute('type', 'filled');
    await nextFrame();
    expect(el.classList.contains('ds-card--filled')).to.be.true;
    expect(el.classList.contains('ds-card--elevated')).to.be.false;
  });

  it('toggling selected on/off updates the state class without losing body content', async () => {
    const el = await fixture(html`<ds-card title="X"><p class="mine">Body</p></ds-card>`);
    el.setAttribute('selected', '');
    await nextFrame();
    expect(el.classList.contains('ds-card--selected')).to.be.true;
    expect(bodyEl(el).querySelector('.mine'), 'visual-only repaint must not drop slotted content').to.exist;
    el.removeAttribute('selected');
    await nextFrame();
    expect(el.classList.contains('ds-card--selected')).to.be.false;
  });
});

describe('ds-card — a11y & teardown', () => {
  it('is accessible', async () => {
    const el = await fixture(html`<ds-card title="Devices" subtitle="12 online"><p>Body</p></ds-card>`);
    await expect(el).to.be.accessible({ ignoredRules: ['color-contrast'] });
  });

  it('survives disconnect → reconnect without throwing or duplicating the header', async () => {
    const el = await fixture(html`<ds-card title="Devices"><p class="mine">Body</p></ds-card>`);
    const parent = el.parentNode;
    el.remove();
    parent.appendChild(el);
    await nextFrame();
    expect(el.querySelectorAll('.ds-card__header').length).to.equal(1);
    expect(titleEl(el).textContent).to.equal('Devices');
  });
});
