/* Regression suite for the late-children recovery primitive
   (src/utils/late-children.js).

   Root cause it guards against: light-DOM components capture their consumer
   children ONCE, synchronously, in connectedCallback. That is fine for static
   HTML but WRONG for frameworks (Ember/Glimmer, React, Vue) that append children
   AFTER the element upgrades — the capture runs on an empty element and the
   content is stranded outside the rendered surface.

   Each test upgrades an EMPTY element (fixture renders it with no children), then
   appends content afterwards to simulate the framework, and asserts the component
   re-homes it. A microtask/frame is awaited so the MutationObserver can fire. */
import { fixture, html, expect, nextFrame } from '@open-wc/testing';

import '../src/components/button/button.js';
import '../src/components/card/card.js';
import '../src/components/widget/widget.js';
import '../src/components/page-header/page-header.js';
import '../src/components/form-footer/form-footer.js';
import '../src/components/breadcrumb/breadcrumb.js';
import '../src/components/drawer/drawer.js';
import '../src/components/modal/modal.js';
import '../src/components/popover/popover.js';
import '../src/components/section-header/section-header.js';
import '../src/components/empty-state/empty-state.js';

const settle = async () => { await nextFrame(); await nextFrame(); };

describe('late-children — content injected after upgrade is recovered', () => {
  it('ds-button reclaims a bare-text label appended after upgrade', async () => {
    const el = await fixture(html`<ds-button variant="primary"></ds-button>`);
    el.appendChild(document.createTextNode('Create policy'));   // Glimmer-style late label
    await settle();

    expect(el.querySelector('.ds-button__label').textContent.trim()).to.equal('Create policy');
    const inner = el.querySelector('button');
    const stray = [...el.childNodes].filter((n) => n !== inner && !(n.nodeType === 3 && !n.textContent.trim()));
    expect(stray.length, 'label left stranded beside the button').to.equal(0);
  });

  it('ds-card re-homes body content appended after upgrade', async () => {
    const el = await fixture(html`<ds-card></ds-card>`);
    const p = document.createElement('p');
    p.textContent = 'late body';
    el.appendChild(p);
    await settle();

    expect(el.contains(p), 'content dropped from the card').to.be.true;
    expect([...el.children].includes(p), 'content stranded as a direct host child').to.be.false;
    const stray = [...el.children].some((c) => !String(c.className || '').startsWith('ds-card__'));
    expect(stray, 'a non-card node is stranded outside the surface').to.be.false;
  });

  it('ds-widget re-homes content appended after upgrade (and does not loop)', async () => {
    const el = await fixture(html`<ds-widget type="chart"></ds-widget>`);
    const content = document.createElement('div');
    content.className = 'late-content';
    el.appendChild(content);
    await settle();

    expect(el.contains(content), 'content dropped from the widget').to.be.true;
    expect([...el.children].includes(content), 'content stranded as a direct host child').to.be.false;
    const stray = [...el.children].some((c) => !String(c.className || '').startsWith('ds-widget__'));
    expect(stray, 'a non-widget node is stranded outside the surface').to.be.false;
  });

  it('ds-page-header re-homes an actions node appended after upgrade', async () => {
    const el = await fixture(html`<ds-page-header></ds-page-header>`);
    const btn = document.createElement('ds-button');
    btn.setAttribute('slot', 'actions');
    el.appendChild(btn);
    await settle();

    expect(el.querySelector(':scope > [slot="actions"]'), 'actions left stranded on the host').to.not.exist;
    expect(el.contains(btn), 'actions node dropped').to.be.true;
  });

  it('ds-form-footer re-homes an action appended after upgrade', async () => {
    const el = await fixture(html`<ds-form-footer></ds-form-footer>`);
    const btn = document.createElement('ds-button');
    el.appendChild(btn);
    await settle();

    expect([...el.children].includes(btn), 'action stranded as a direct host child').to.be.false;
    expect(el.contains(btn), 'action dropped from the footer').to.be.true;
  });

  it('ds-breadcrumb re-homes crumbs appended after upgrade', async () => {
    const el = await fixture(html`<ds-breadcrumb></ds-breadcrumb>`);
    const a = document.createElement('a');
    a.href = '#';
    a.textContent = 'Home';
    el.appendChild(a);
    await settle();

    // The trail is rebuilt into a generated <ol data-ds-internal>; the raw <a>
    // must not remain a stray direct child.
    expect([...el.children].includes(a), 'raw crumb stranded as a direct host child').to.be.false;
    expect(el.querySelector('[data-ds-internal]'), 'trail not rendered').to.exist;
  });

  it('ds-drawer distributes header + body slots injected after upgrade', async () => {
    const el = await fixture(html`<ds-drawer></ds-drawer>`);
    const header = document.createElement('div');
    header.setAttribute('slot', 'header');
    header.textContent = 'Record name';
    const body = document.createElement('p');
    body.textContent = 'late body';
    el.appendChild(header);
    el.appendChild(body);
    await settle();

    expect(el.querySelector('.ds-drawer__header').contains(header), 'header slot not routed into the header').to.be.true;
    expect(el.querySelector('.ds-drawer__body').contains(body), 'body content not routed into the body').to.be.true;
    const stray = [...el.children].some((c) => !String(c.className || '').startsWith('ds-drawer__'));
    expect(stray, 'slotted content stranded outside the panel').to.be.false;
  });

  it('ds-modal distributes body + footer slots injected after upgrade', async () => {
    const el = await fixture(html`<ds-modal></ds-modal>`);
    const body = document.createElement('p');
    body.textContent = 'late body';
    const footer = document.createElement('ds-button');
    footer.setAttribute('slot', 'footer');
    el.appendChild(body);
    el.appendChild(footer);
    await settle();

    expect(el.querySelector('.ds-modal__body').contains(body), 'body content not routed').to.be.true;
    const stray = [...el.children].some((c) => !String(c.className || '').startsWith('ds-modal__'));
    expect(stray, 'slotted content stranded outside the panel').to.be.false;
  });

  it('ds-popover routes body content injected after upgrade', async () => {
    const el = await fixture(html`<ds-popover></ds-popover>`);
    const body = document.createElement('p');
    body.textContent = 'late body';
    el.appendChild(body);
    await settle();

    expect(el.querySelector('.ds-popover__body').contains(body), 'body content not routed').to.be.true;
    const stray = [...el.children].some((c) => !String(c.className || '').startsWith('ds-popover__'));
    expect(stray, 'slotted content stranded outside the popover').to.be.false;
  });

  it('ds-section-header re-homes an action slot injected after upgrade', async () => {
    // The action region is opt-in (show-action) + needs a label or slotted action.
    const el = await fixture(html`<ds-section-header title="H" show-action></ds-section-header>`);
    const action = document.createElement('ds-button');
    action.setAttribute('slot', 'action');
    el.appendChild(action);
    await settle();

    expect([...el.children].includes(action), 'action stranded as a direct host child').to.be.false;
    expect(el.contains(action), 'action dropped').to.be.true;
  });

  it('ds-empty-state re-homes a description slot injected after upgrade', async () => {
    const el = await fixture(html`<ds-empty-state title="Empty"></ds-empty-state>`);
    const desc = document.createElement('span');
    desc.setAttribute('slot', 'description');
    desc.textContent = 'late description';
    el.appendChild(desc);
    await settle();

    expect([...el.children].includes(desc), 'description stranded as a direct host child').to.be.false;
    expect(el.contains(desc), 'description dropped').to.be.true;
  });

  it('static HTML (children present at upgrade) is untouched — no double-projection', async () => {
    const el = await fixture(html`<ds-button variant="primary">Save</ds-button>`);
    await settle();
    expect(el.querySelector('.ds-button__label').textContent.trim()).to.equal('Save');
    expect(el.querySelectorAll('.ds-button__label').length, 'label duplicated').to.equal(1);
  });
});
