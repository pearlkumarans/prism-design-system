/* Visual-regression baselines for a representative set of components, rendered
   STYLED (tokens + component CSS loaded — see web-test-runner.visual.config.js).
   Each test screenshots the element and diffs it against a committed baseline.

   Add a component: mount it the way it should LOOK, then `shot(el, 'name')`. First
   run (or `npm run test:visual:update`) writes the baseline; later runs compare. */
import { fixture, html } from '@open-wc/testing';
import { visualDiff } from '@web/test-runner-visual-regression';
import { settleStyles } from './styled.js';

import '../../src/components/button/button.js';
import '../../src/components/badge/badge.js';
import '../../src/components/tag/tag.js';
import '../../src/components/status-indicator/status-indicator.js';
import '../../src/components/progress-bar/progress-bar.js';
import '../../src/components/toggle/toggle.js';
import '../../src/components/checkbox/checkbox.js';
import '../../src/components/inline-alert/inline-alert.js';
import '../../src/components/kpi-card/kpi-card.js';
import '../../src/components/stepper/stepper.js';
import '../../src/components/tab-filter/tab-filter.js';

const shot = async (el, name) => { await settleStyles(); await visualDiff(el, name); };
/* Fixed-width white frame for prop-driven / layout components. */
const frame = (inner, w = '360px') => html`
  <div style="display:inline-block; background:#fff; padding:16px; width:${w}; box-sizing:border-box;">${inner}</div>`;

describe('visual — leaf controls', () => {
  it('button-primary', async () => {
    await shot(await fixture(html`<ds-button variant="primary">Save changes</ds-button>`), 'button-primary');
  });
  it('button-secondary', async () => {
    await shot(await fixture(html`<ds-button variant="secondary">Cancel</ds-button>`), 'button-secondary');
  });
  it('badge', async () => {
    await shot(await fixture(html`<ds-badge state="active" icon="tick">Active</ds-badge>`), 'badge-active');
  });
  it('tag', async () => {
    await shot(await fixture(html`<ds-tag label="Marketing" variant="primary"></ds-tag>`), 'tag-primary');
  });
  it('status-indicator', async () => {
    await shot(await fixture(html`<ds-status-indicator status="active" label="Online"></ds-status-indicator>`), 'status-indicator-active');
  });
  it('toggle-on', async () => {
    await shot(await fixture(html`<ds-toggle label="Wi-Fi" checked></ds-toggle>`), 'toggle-on');
  });
  it('checkbox-checked', async () => {
    await shot(await fixture(html`<ds-checkbox label="Accept terms" checked></ds-checkbox>`), 'checkbox-checked');
  });
});

describe('visual — composed', () => {
  it('progress-bar', async () => {
    const el = await fixture(frame(html`<ds-progress-bar value="60" label="Upload"></ds-progress-bar>`, '280px'));
    await shot(el, 'progress-bar-60');
  });
  it('inline-alert-info', async () => {
    const el = await fixture(frame(html`<ds-inline-alert type="info" title="Heads up" description="Your trial ends in 3 days."></ds-inline-alert>`, '420px'));
    await shot(el, 'inline-alert-info');
  });
  it('kpi-card', async () => {
    const el = await fixture(frame(html`<ds-kpi-card value="1,284" label="Active users" show-trend trend="12" trend-tone="positive"></ds-kpi-card>`, '260px'));
    await shot(el, 'kpi-card');
  });
  it('stepper', async () => {
    const el = await fixture(frame(html`<ds-stepper></ds-stepper>`, '460px'));
    el.querySelector('ds-stepper').steps = [
      { id: 'a', label: 'Account', status: 'completed' },
      { id: 'b', label: 'Profile', status: 'active' },
      { id: 'c', label: 'Review' },
    ];
    await shot(el, 'stepper-3');
  });
  it('tab-filter', async () => {
    const el = await fixture(frame(html`<ds-tab-filter aria-label="Status"></ds-tab-filter>`, '360px'));
    el.querySelector('ds-tab-filter').options = [
      { value: 'all', label: 'All' }, { value: 'open', label: 'Open' }, { value: 'closed', label: 'Closed' },
    ];
    await shot(el, 'tab-filter-3');
  });
});
