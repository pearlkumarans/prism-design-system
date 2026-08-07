/* Accessibility smoke tests (axe-core via @open-wc/testing). Structural a11y —
   roles, names, labels, aria wiring. color-contrast is skipped because the test
   harness doesn't load component CSS, so computed colors aren't meaningful. */
import { fixture, html, expect, nextFrame } from '@open-wc/testing';
import '../src/components/button/button.js';
import '../src/components/checkbox/checkbox.js';
import '../src/components/radio-group/radio-group.js';
import '../src/components/text-input/text-input.js';
import '../src/components/badge/badge.js';

const A11Y = { ignoredRules: ['color-contrast'] };

describe('accessibility (axe)', () => {
  it('ds-button has an accessible name', async () => {
    const el = await fixture(html`<ds-button variant="primary">Save changes</ds-button>`);
    await expect(el).to.be.accessible(A11Y);
  });

  it('ds-checkbox is labelled', async () => {
    const el = await fixture(html`<ds-checkbox label="Accept terms"></ds-checkbox>`);
    await expect(el).to.be.accessible(A11Y);
  });

  it('ds-radio-group exposes a labelled radiogroup', async () => {
    const el = await fixture(html`<ds-radio-group label="Plan" label-position="top"></ds-radio-group>`);
    el.options = [
      { value: 'a', label: 'Basic', selected: true },
      { value: 'b', label: 'Pro' },
    ];
    await nextFrame();
    await expect(el).to.be.accessible(A11Y);
  });

  it('ds-text-input is labelled', async () => {
    const el = await fixture(html`<ds-text-input label="Email address"></ds-text-input>`);
    await expect(el).to.be.accessible(A11Y);
  });

  it('ds-badge is accessible', async () => {
    const el = await fixture(html`<ds-badge>Active</ds-badge>`);
    await expect(el).to.be.accessible(A11Y);
  });
});
