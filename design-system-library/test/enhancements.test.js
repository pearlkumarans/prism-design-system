/* Behaviour regression suite for the shared-component enhancements added this
   cycle. Assertions stay at the DOM / attribute / JS-state level so they don't
   depend on each component's stylesheet being loaded. */
import { fixture, html, expect, nextFrame } from '@open-wc/testing';

import '../src/components/button/button.js';
import '../src/components/radio-group/radio-group.js';
import '../src/components/slider/slider.js';

describe('ds-button — label attribute', () => {
  it('drives the label, updates reactively, and keeps the rendered button', async () => {
    const el = await fixture(html`<ds-button variant="primary">Save</ds-button>`);
    const label = () => el.querySelector('.ds-button__label');

    expect(label().textContent).to.equal('Save');

    el.setAttribute('label', 'Apply');
    expect(label().textContent).to.equal('Apply');
    // The internal <button> chrome must survive an attribute update.
    expect(el.querySelector('button.ds-button'), 'button chrome destroyed').to.exist;

    el.removeAttribute('label');
    expect(label().textContent, 'slotted label not restored').to.equal('Save');
  });
});

describe('ds-radio-group — per-option description', () => {
  it('renders a description per option, wires aria-describedby, and stacks vertically', async () => {
    const el = await fixture(html`<ds-radio-group label="Source" label-position="top"></ds-radio-group>`);
    el.options = [
      { value: 'a', label: 'A', description: 'uses <strong>native</strong> repos', selected: true },
      { value: 'b', label: 'B', description: 'default only' },
    ];
    await nextFrame();

    const descs = el.querySelectorAll('.ds-radio-group__option-desc');
    expect(descs.length, 'a description per option').to.equal(2);
    expect(descs[0].querySelector('strong'), 'inline HTML in description').to.exist;

    const input = el.querySelector('ds-radio[value="a"] .ds-radio__input');
    const descId = input.getAttribute('aria-describedby');
    expect(descId, 'aria-describedby not set').to.be.a('string');
    expect(el.querySelector('#' + CSS.escape(descId)), 'aria target missing').to.exist;

    expect(el.classList.contains('ds-radio-group--has-desc'), 'vertical-stack class missing').to.be.true;
  });

  it('keeps the group info icon hidden unless show-info is set', async () => {
    const plain = await fixture(html`<ds-radio-group label="X" label-position="top"></ds-radio-group>`);
    expect(plain.querySelector('.ds-radio-group__info').hasAttribute('hidden'), 'info should be hidden').to.be.true;

    const withInfo = await fixture(html`<ds-radio-group label="X" show-info label-position="top"></ds-radio-group>`);
    expect(withInfo.querySelector('.ds-radio-group__info').hasAttribute('hidden'), 'info should be shown').to.be.false;
  });
});

describe('ds-slider — degenerate range guard', () => {
  it('does not emit NaN fill when min === max', async () => {
    const el = await fixture(html`<ds-slider min="5" max="5" value="5"></ds-slider>`);
    await nextFrame();
    const input = el.querySelector('input[type="range"]');
    expect(input.style.getPropertyValue('--_s-pct')).to.not.contain('NaN');
  });

  it('computes a normal fill percentage for a valid range', async () => {
    const el = await fixture(html`<ds-slider min="0" max="100" value="25"></ds-slider>`);
    await nextFrame();
    const input = el.querySelector('input[type="range"]');
    expect(input.style.getPropertyValue('--_s-pct')).to.equal('25%');
  });
});
