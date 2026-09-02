/* ds-toggle — a role="switch" button with a persistent thumb, an optional
   in-track static label, and an optional field label beside the switch. Covers
   the enumAttr size default (medium) + fallback, the checked property ↔ attribute
   round-trip, the change event + disabled gate, the switch ARIA, the textContent
   label sink (safe by construction), and a disconnect→reconnect. */
import { fixture, html, expect, oneEvent, nextFrame } from '@open-wc/testing';
import '../src/components/toggle/toggle.js';

const XSS = '"><img src=x onerror=alert(1)>';
const btn = (el) => el.querySelector('button');

describe('ds-toggle — structure & enum defaults', () => {
  it('renders a role="switch" button with the default size class', async () => {
    const el = await fixture(html`<ds-toggle aria-label="Wifi"></ds-toggle>`);
    expect(btn(el)).to.exist;
    expect(btn(el).getAttribute('role')).to.equal('switch');
    expect(btn(el).className).to.equal('ds-toggle ds-toggle--medium');
    expect(el.querySelector('.ds-toggle__thumb')).to.exist;
  });

  it('reflects the size to the button', async () => {
    const el = await fixture(html`<ds-toggle aria-label="X" size="large"></ds-toggle>`);
    expect(btn(el).classList.contains('ds-toggle--large')).to.be.true;
  });

  it('falls back to the default size on an invalid value (enumAttr)', async () => {
    const el = await fixture(html`<ds-toggle aria-label="X" size="bogus"></ds-toggle>`);
    expect(btn(el).classList.contains('ds-toggle--medium')).to.be.true;
  });
});

describe('ds-toggle — checked round-trip & ARIA', () => {
  it('checked property mirrors the attribute and drives aria-checked', async () => {
    const el = await fixture(html`<ds-toggle aria-label="X"></ds-toggle>`);
    expect(el.checked).to.be.false;
    expect(btn(el).getAttribute('aria-checked')).to.equal('false');
    el.checked = true;
    await nextFrame();
    expect(el.hasAttribute('checked')).to.be.true;
    expect(btn(el).getAttribute('aria-checked')).to.equal('true');
  });

  it('a visible field label names the switch via aria-labelledby', async () => {
    const el = await fixture(html`<ds-toggle label="Enable backups"></ds-toggle>`);
    await nextFrame();
    const labelEl = el.querySelector('.ds-toggle__label');
    expect(labelEl.textContent).to.equal('Enable backups');
    expect(btn(el).getAttribute('aria-labelledby')).to.equal(labelEl.id);
  });

  it('honours a host aria-label when there is no visible label', async () => {
    const el = await fixture(html`<ds-toggle aria-label="Dark mode"></ds-toggle>`);
    await nextFrame();
    expect(btn(el).getAttribute('aria-label')).to.equal('Dark mode');
  });
});

describe('ds-toggle — events', () => {
  it('toggles + fires ds-toggle-change on click', async () => {
    const el = await fixture(html`<ds-toggle aria-label="X"></ds-toggle>`);
    setTimeout(() => btn(el).click());
    const ev = await oneEvent(el, 'ds-toggle-change');
    expect(ev.detail.checked).to.be.true;
    expect(el.checked).to.be.true;
  });

  it('a disabled toggle does not change or emit on click', async () => {
    const el = await fixture(html`<ds-toggle aria-label="X" disabled></ds-toggle>`);
    let fired = 0;
    el.addEventListener('ds-toggle-change', () => (fired += 1));
    btn(el).click();
    await nextFrame();
    expect(fired).to.equal(0);
    expect(el.checked).to.be.false;
  });
});

describe('ds-toggle — label rendering', () => {
  it('renders a hostile label as text (textContent sink), never as HTML', async () => {
    const el = await fixture(html`<ds-toggle label="${XSS}"></ds-toggle>`);
    await nextFrame();
    const labelEl = el.querySelector('.ds-toggle__label');
    expect(labelEl.querySelector('img'), 'label injected an <img>').to.not.exist;
    expect(labelEl.textContent).to.contain('<img');
  });

  it('shows the static in-track text when show-text is set', async () => {
    const el = await fixture(html`<ds-toggle aria-label="X" show-text text="Enable"></ds-toggle>`);
    await nextFrame();
    expect(el.querySelector('.ds-toggle__text').textContent).to.equal('Enable');
  });
});

describe('ds-toggle — teardown', () => {
  it('survives a disconnect → reconnect without duplicating the button', async () => {
    const el = await fixture(html`<ds-toggle aria-label="X" checked></ds-toggle>`);
    const parent = el.parentNode;
    el.remove();
    parent.appendChild(el);
    await nextFrame();
    expect(el.querySelectorAll('button').length).to.equal(1);
    expect(el.checked).to.be.true;
  });
});
