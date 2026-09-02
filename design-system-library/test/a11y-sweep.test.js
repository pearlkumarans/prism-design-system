/* Library-wide accessibility gate (axe-core via @open-wc/testing).
   Each component is mounted the way a correct consumer would — with a visible
   label / accessible name / real data — so an axe failure here means a REAL a11y
   defect, not a bad test mount. color-contrast is ignored because the harness
   doesn't load component CSS (computed colours aren't meaningful).

   Scope: in-place (non-portaled) components (~40 of them). Overlays that portal
   their content to <body> (modal/drawer/dropdown/popover/tooltip) need axe run at
   document level after opening — a tracked follow-up, not covered here yet. */
import { fixture, html, expect, nextFrame } from '@open-wc/testing';

import '../src/components/button/button.js';
import '../src/components/button-group/button-group.js';
import '../src/components/checkbox/checkbox.js';
import '../src/components/checkbox-group/checkbox-group.js';
import '../src/components/radio-group/radio-group.js';
import '../src/components/toggle/toggle.js';
import '../src/components/text-input/text-input.js';
import '../src/components/text-area/text-area.js';
import '../src/components/otp-input/otp-input.js';
import '../src/components/search-field/search-field.js';
import '../src/components/field-helper/field-helper.js';
import '../src/components/file-upload/file-upload.js';
import '../src/components/slider/slider.js';
import '../src/components/token-field/token-field.js';
import '../src/components/input-select/input-select.js';
import '../src/components/badge/badge.js';
import '../src/components/tag/tag.js';
import '../src/components/text-link/text-link.js';
import '../src/components/status-indicator/status-indicator.js';
import '../src/components/progress-bar/progress-bar.js';
import '../src/components/inline-alert/inline-alert.js';
import '../src/components/empty-state/empty-state.js';
import '../src/components/kpi-card/kpi-card.js';
import '../src/components/list/list.js';
import '../src/components/description-list/description-list.js';
import '../src/components/data-table/data-table.js';
import '../src/components/chart/chart.js';
import '../src/components/avatar/avatar.js';
import '../src/components/illustration/illustration.js';
import '../src/components/counter/counter.js';
import '../src/components/divider/divider.js';
import '../src/components/icon-button/icon-button.js';
import '../src/components/breadcrumb/breadcrumb.js';
import '../src/components/stepper/stepper.js';
import '../src/components/tab-bar-horizontal/tab-bar-horizontal.js';
import '../src/components/tab-bar-vertical/tab-bar-vertical.js';
import '../src/components/tab-filter/tab-filter.js';
import '../src/components/section-header/section-header.js';
import '../src/components/page-header/page-header.js';
import '../src/components/accordion/accordion.js';
import '../src/components/sidebar-l1/sidebar-l1.js';
import '../src/components/module-rail/module-rail.js';

const A11Y = { ignoredRules: ['color-contrast'] };
// axe on the whole subtree after a component has rendered/settled
const a11y = async (el) => { await nextFrame(); await expect(el).to.be.accessible(A11Y); };

describe('a11y sweep — form controls', () => {
  it('ds-button', async () => a11y(await fixture(html`<ds-button variant="primary">Save changes</ds-button>`)));

  it('ds-button-group', async () => {
    const el = await fixture(html`<ds-button-group aria-label="Date range"></ds-button-group>`);
    el.items = [{ value: 'd', label: 'Day' }, { value: 'w', label: 'Week' }];
    await a11y(el);
  });

  it('ds-checkbox', async () => a11y(await fixture(html`<ds-checkbox label="Accept terms"></ds-checkbox>`)));

  it('ds-checkbox-group', async () => a11y(await fixture(html`
    <ds-checkbox-group label="Toppings">
      <ds-checkbox label="Cheese"></ds-checkbox>
      <ds-checkbox label="Olives"></ds-checkbox>
    </ds-checkbox-group>`)));

  it('ds-radio-group', async () => {
    const el = await fixture(html`<ds-radio-group label="Plan" label-position="top"></ds-radio-group>`);
    el.options = [{ value: 'a', label: 'Basic', selected: true }, { value: 'b', label: 'Pro' }];
    await a11y(el);
  });

  it('ds-toggle', async () => a11y(await fixture(html`<ds-toggle label="Wi-Fi"></ds-toggle>`)));
  it('ds-text-input', async () => a11y(await fixture(html`<ds-text-input label="Email address"></ds-text-input>`)));
  it('ds-text-area', async () => a11y(await fixture(html`<ds-text-area label="Notes"></ds-text-area>`)));
  it('ds-otp-input', async () => a11y(await fixture(html`<ds-otp-input length="6" label="One-time code"></ds-otp-input>`)));
  it('ds-search-field', async () => a11y(await fixture(html`<ds-search-field label="Search"></ds-search-field>`)));
  it('ds-field-helper', async () => a11y(await fixture(html`<ds-field-helper text="We never share your email."></ds-field-helper>`)));
  it('ds-file-upload', async () => a11y(await fixture(html`<ds-file-upload label="Attachment" variant="prominent" zone-hint="Drop here"></ds-file-upload>`)));
  it('ds-slider', async () => a11y(await fixture(html`<ds-slider type="single" label="Volume" value="50"></ds-slider>`)));
  it('ds-token-field', async () => a11y(await fixture(html`<ds-token-field label="Tags"></ds-token-field>`)));

  it('ds-input-select', async () => {
    const el = await fixture(html`<ds-input-select label="Region"></ds-input-select>`);
    el.options = [{ label: 'United States', value: 'us' }, { label: 'Canada', value: 'ca' }];
    await a11y(el);
  });
});

describe('a11y sweep — data & feedback', () => {
  it('ds-badge', async () => a11y(await fixture(html`<ds-badge>Active</ds-badge>`)));
  it('ds-tag', async () => a11y(await fixture(html`<ds-tag label="Marketing"></ds-tag>`)));
  it('ds-text-link', async () => a11y(await fixture(html`<ds-text-link href="/docs">Read the docs</ds-text-link>`)));
  it('ds-status-indicator', async () => a11y(await fixture(html`<ds-status-indicator status="active" label="Online"></ds-status-indicator>`)));
  it('ds-progress-bar', async () => a11y(await fixture(html`<ds-progress-bar value="40" label="Upload progress"></ds-progress-bar>`)));
  it('ds-inline-alert', async () => a11y(await fixture(html`<ds-inline-alert type="info" title="Heads up" description="Your trial ends soon."></ds-inline-alert>`)));
  it('ds-empty-state', async () => a11y(await fixture(html`<ds-empty-state type="centered" title="No results" description="Try a different filter."></ds-empty-state>`)));
  it('ds-kpi-card', async () => a11y(await fixture(html`<ds-kpi-card value="1,234" label="Active users"></ds-kpi-card>`)));
  it('ds-counter', async () => a11y(await fixture(html`<ds-counter value="7" aria-label="7 unread"></ds-counter>`)));
  it('ds-divider', async () => a11y(await fixture(html`<ds-divider></ds-divider>`)));
  it('ds-illustration', async () => a11y(await fixture(html`<ds-illustration name="empty-box"></ds-illustration>`)));
  it('ds-avatar (initials)', async () => a11y(await fixture(html`<ds-avatar name="Jane Doe"></ds-avatar>`)));
  it('ds-icon-button', async () => a11y(await fixture(html`<ds-icon-button icon="settings" label="Settings"></ds-icon-button>`)));

  it('ds-list', async () => {
    const el = await fixture(html`<ds-list></ds-list>`);
    el.items = ['Alpha', 'Beta', 'Gamma'];
    await a11y(el);
  });

  it('ds-description-list', async () => {
    const el = await fixture(html`<ds-description-list></ds-description-list>`);
    el.items = [{ term: 'Status', description: 'Active' }, { term: 'Owner', description: 'Jane Doe' }];
    await a11y(el);
  });

  it('ds-data-table', async () => {
    const el = await fixture(html`<ds-data-table selection-mode="none"></ds-data-table>`);
    el.columns = [{ id: 'name', header: 'Name', accessor: 'name' }, { id: 'role', header: 'Role', accessor: 'role' }];
    el.rows = [{ id: '1', name: 'Ada', role: 'Admin' }, { id: '2', name: 'Grace', role: 'User' }];
    await a11y(el);
  });

  it('ds-chart', async () => {
    const el = await fixture(html`<ds-chart type="column" title="Revenue"></ds-chart>`);
    el.data = { categories: ['Q1', 'Q2', 'Q3'], series: [{ name: 'Revenue', values: [10, 20, 30] }] };
    await a11y(el);
  });
});

describe('a11y sweep — nav & structure', () => {
  it('ds-breadcrumb', async () => a11y(await fixture(html`
    <ds-breadcrumb><a href="/">Home</a><a href="/reports">Reports</a><a href="/reports/q3">Q3</a></ds-breadcrumb>`)));

  it('ds-section-header', async () => a11y(await fixture(html`<ds-section-header title="Team members"></ds-section-header>`)));
  it('ds-page-header', async () => a11y(await fixture(html`<ds-page-header title="Devices" description="All managed endpoints"></ds-page-header>`)));

  it('ds-accordion', async () => a11y(await fixture(html`
    <ds-accordion><span slot="title">Advanced settings</span><div slot="body">Body content</div></ds-accordion>`)));

  it('ds-stepper', async () => {
    const el = await fixture(html`<ds-stepper></ds-stepper>`);
    el.steps = [{ id: 'a', label: 'Account', status: 'completed' }, { id: 'b', label: 'Profile', status: 'active' }, { id: 'c', label: 'Done' }];
    await a11y(el);
  });

  it('ds-tab-bar-horizontal', async () => {
    const el = await fixture(html`<ds-tab-bar-horizontal aria-label="Sections"></ds-tab-bar-horizontal>`);
    el.items = [{ id: 'overview', label: 'Overview', icon: 'home' }, { id: 'activity', label: 'Activity', icon: 'activity' }];
    await a11y(el);
  });

  it('ds-tab-bar-vertical', async () => {
    const el = await fixture(html`<ds-tab-bar-vertical aria-label="Settings"></ds-tab-bar-vertical>`);
    el.items = [{ id: 'general', label: 'General', icon: 'config' }, { id: 'security', label: 'Security', icon: 'shield' }];
    await a11y(el);
  });

  it('ds-tab-filter', async () => {
    const el = await fixture(html`<ds-tab-filter aria-label="Status filter"></ds-tab-filter>`);
    el.options = [{ value: 'all', label: 'All' }, { value: 'open', label: 'Open' }, { value: 'closed', label: 'Closed' }];
    await a11y(el);
  });

  it('ds-sidebar-l1', async () => {
    const el = await fixture(html`<ds-sidebar-l1 aria-label="Primary"></ds-sidebar-l1>`);
    el.items = [{ id: 'home', label: 'Home', icon: 'home', active: true }, { id: 'devices', label: 'Devices', icon: 'layers' }];
    await a11y(el);
  });

  it('ds-module-rail', async () => {
    const el = await fixture(html`<ds-module-rail aria-label="Modules"></ds-module-rail>`);
    el.items = [{ id: 'home', label: 'Home', icon: 'home', active: true }, { id: 'reports', label: 'Reports', icon: 'bar-vertical-chart' }];
    await a11y(el);
  });
});
