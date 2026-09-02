/* ds-inline-alert — LIGHT-DOM composite. type/style-variant drive the role +
   aria-live (error/warning → alert/assertive, else status/polite). title +
   description are escaped; a nested custom body is preserved across the
   attribute-driven re-render. Action + dismiss reuse real ds-text-link /
   ds-icon-button and emit ds-inline-alert-action / -dismiss. */
import { fixture, html, expect, oneEvent, nextFrame } from '@open-wc/testing';
import '../src/components/inline-alert/inline-alert.js';

const root = (el) => el.querySelector('.ds-inline-alert');
const XSS = '<img src=x onerror=alert(1)>';

describe('ds-inline-alert — structure & role', () => {
  it('default type=info → role=status, aria-live=polite, subtle variant', async () => {
    const el = await fixture(html`<ds-inline-alert title="Heads up"></ds-inline-alert>`);
    await nextFrame();
    const r = root(el);
    expect(r, '.ds-inline-alert root').to.exist;
    expect(r.getAttribute('role')).to.equal('status');
    expect(r.getAttribute('aria-live')).to.equal('polite');
    expect(r.classList.contains('ds-inline-alert--subtle')).to.be.true;
  });

  it('type=error → role=alert, aria-live=assertive', async () => {
    const el = await fixture(html`<ds-inline-alert type="error" title="Failed"></ds-inline-alert>`);
    await nextFrame();
    expect(root(el).getAttribute('role')).to.equal('alert');
    expect(root(el).getAttribute('aria-live')).to.equal('assertive');
  });

  it('type=warning → role=alert (assertive)', async () => {
    const el = await fixture(html`<ds-inline-alert type="warning" title="Careful"></ds-inline-alert>`);
    await nextFrame();
    expect(root(el).getAttribute('role')).to.equal('alert');
  });

  it('an unknown type falls back to info (role=status) — enumAttr', async () => {
    const el = await fixture(html`<ds-inline-alert type="bogus" title="X"></ds-inline-alert>`);
    await nextFrame();
    expect(root(el).getAttribute('role')).to.equal('status');
    expect(root(el).classList.contains('ds-inline-alert--info')).to.be.true;
  });

  it('renders the type icon as a <ds-icon>', async () => {
    const el = await fixture(html`<ds-inline-alert type="success" title="Done"></ds-inline-alert>`);
    await nextFrame();
    const icon = el.querySelector('.ds-inline-alert__icon ds-icon');
    expect(icon).to.exist;
    expect(icon.getAttribute('name')).to.equal('circle-tick');
  });
});

describe('ds-inline-alert — escaping', () => {
  it('escapes the title and description (rendered as text)', async () => {
    const el = await fixture(html`<ds-inline-alert type="info" title=${XSS} description=${XSS}></ds-inline-alert>`);
    await nextFrame();
    const title = el.querySelector('.ds-inline-alert__title');
    const desc = el.querySelector('.ds-inline-alert__description');
    expect(title.querySelector('img'), 'title injected').to.not.exist;
    expect(title.textContent).to.contain('<img');
    expect(desc.querySelector('img'), 'description injected').to.not.exist;
    expect(desc.textContent).to.contain('<img');
  });
});

describe('ds-inline-alert — custom body preservation', () => {
  it('moves a nested custom body into the rebuilt alert body', async () => {
    const el = await fixture(html`<ds-inline-alert type="info" title="T"><span class="mine">custom</span></ds-inline-alert>`);
    await nextFrame();
    const moved = el.querySelector('.ds-inline-alert__custom .mine');
    expect(moved, 'custom body preserved').to.exist;
    expect(moved.textContent).to.equal('custom');
  });
});

describe('ds-inline-alert — action & dismiss', () => {
  it('renders an action as a real <ds-text-link>[data-action]', async () => {
    const el = await fixture(html`<ds-inline-alert type="info" title="T" action="Retry"></ds-inline-alert>`);
    await nextFrame();
    const link = el.querySelector('ds-text-link[data-action]');
    expect(link, 'action link').to.exist;
    expect(link.textContent).to.contain('Retry');
  });

  it('clicking the action emits ds-inline-alert-action', async () => {
    const el = await fixture(html`<ds-inline-alert type="info" title="T" action="Retry"></ds-inline-alert>`);
    await nextFrame();
    const link = el.querySelector('[data-action]');
    setTimeout(() => link.click());
    const ev = await oneEvent(el, 'ds-inline-alert-action');
    expect(ev).to.exist;
  });

  it('Enter on the action also emits ds-inline-alert-action', async () => {
    const el = await fixture(html`<ds-inline-alert type="info" title="T" action="Retry"></ds-inline-alert>`);
    await nextFrame();
    const link = el.querySelector('[data-action]');
    let fired = 0;
    el.addEventListener('ds-inline-alert-action', () => (fired += 1));
    link.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
    expect(fired).to.equal(1);
  });

  it('show-dismiss renders a dismiss control that emits ds-inline-alert-dismiss and removes the host', async () => {
    const el = await fixture(html`<ds-inline-alert type="info" title="T" show-dismiss></ds-inline-alert>`);
    await nextFrame();
    const btn = el.querySelector('.ds-inline-alert__dismiss[data-dismiss]');
    expect(btn, 'dismiss control').to.exist;
    let fired = 0;
    el.addEventListener('ds-inline-alert-dismiss', () => (fired += 1));
    btn.click();
    expect(fired).to.equal(1);
    expect(el.isConnected, 'host removed on dismiss').to.be.false;
  });
});

describe('ds-inline-alert — teardown', () => {
  it('survives disconnect → reconnect without throwing or duplicating the root', async () => {
    const el = await fixture(html`<ds-inline-alert type="info" title="T"></ds-inline-alert>`);
    await nextFrame();
    const parent = el.parentNode;
    el.remove();
    parent.appendChild(el);
    await nextFrame();
    expect(el.querySelectorAll('.ds-inline-alert').length).to.equal(1);
  });
});
