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
import '../../src/components/counter/counter.js';
import '../../src/components/divider/divider.js';
import '../../src/components/text-link/text-link.js';
import '../../src/components/avatar/avatar.js';
import '../../src/components/icon-button/icon-button.js';
import '../../src/components/text-input/text-input.js';
import '../../src/components/text-area/text-area.js';
import '../../src/components/search-field/search-field.js';
import '../../src/components/otp-input/otp-input.js';
import '../../src/components/slider/slider.js';
import '../../src/components/radio-group/radio-group.js';
import '../../src/components/checkbox-group/checkbox-group.js';
import '../../src/components/field-helper/field-helper.js';
import '../../src/components/input-select/input-select.js';
import '../../src/components/token-field/token-field.js';
import '../../src/components/description-list/description-list.js';
import '../../src/components/item-list/item-list.js';
import '../../src/components/list/list.js';
import '../../src/components/data-table/data-table.js';
import '../../src/components/empty-state/empty-state.js';
import '../../src/components/card/card.js';
import '../../src/components/breadcrumb/breadcrumb.js';
import '../../src/components/section-header/section-header.js';
import '../../src/components/page-header/page-header.js';
import '../../src/components/tab-bar-horizontal/tab-bar-horizontal.js';
import '../../src/components/accordion/accordion.js';
import '../../src/components/dropdown-menu/dropdown-menu.js';
import '../../src/components/toast/toast.js';

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

describe('visual — buttons', () => {
  it('button-tertiary', async () => {
    await shot(await fixture(html`<ds-button variant="tertiary">Learn more</ds-button>`), 'button-tertiary');
  });
  it('button-danger', async () => {
    await shot(await fixture(html`<ds-button variant="danger">Delete</ds-button>`), 'button-danger');
  });
  it('button-outline', async () => {
    await shot(await fixture(html`<ds-button variant="outline">Export</ds-button>`), 'button-outline');
  });
  it('button-with-icon', async () => {
    await shot(await fixture(html`<ds-button variant="primary" prefix-icon="plus">Add item</ds-button>`), 'button-with-icon');
  });
  it('button-loading', async () => {
    await shot(await fixture(html`<ds-button variant="primary" loading>Saving</ds-button>`), 'button-loading');
  });
  it('icon-button', async () => {
    await shot(await fixture(html`<ds-icon-button icon="settings" label="Settings"></ds-icon-button>`), 'icon-button');
  });
});

describe('visual — indicators & chips', () => {
  it('badge-subtle-warning', async () => {
    await shot(await fixture(html`<ds-badge variant="subtle" state="warning">Warning</ds-badge>`), 'badge-subtle-warning');
  });
  it('tag-with-close', async () => {
    await shot(await fixture(html`<ds-tag label="Marketing" variant="primary" show-close></ds-tag>`), 'tag-with-close');
  });
  it('counter', async () => {
    await shot(await fixture(html`<ds-counter value="12" max="99"></ds-counter>`), 'counter');
  });
  it('toggle-off', async () => {
    await shot(await fixture(html`<ds-toggle label="Wi-Fi"></ds-toggle>`), 'toggle-off');
  });
  it('checkbox-unchecked', async () => {
    await shot(await fixture(html`<ds-checkbox label="Subscribe"></ds-checkbox>`), 'checkbox-unchecked');
  });
  it('text-link', async () => {
    await shot(await fixture(html`<ds-text-link href="/docs">Read the docs</ds-text-link>`), 'text-link');
  });
  it('avatar-initials', async () => {
    await shot(await fixture(html`<ds-avatar name="Jane Doe"></ds-avatar>`), 'avatar-initials');
  });
  it('progress-bar-indeterminate', async () => {
    const el = await fixture(frame(html`<ds-progress-bar variant="indeterminate" label="Loading"></ds-progress-bar>`, '280px'));
    await shot(el, 'progress-bar-indeterminate');
  });
  it('divider', async () => {
    const el = await fixture(frame(html`<ds-divider></ds-divider>`, '280px'));
    await shot(el, 'divider');
  });
});

describe('visual — form fields', () => {
  it('text-input', async () => {
    const el = await fixture(frame(html`<ds-text-input label="Email" value="ada@example.com"></ds-text-input>`, '320px'));
    await shot(el, 'text-input');
  });
  it('text-input-error', async () => {
    const el = await fixture(frame(html`<ds-text-input label="Email" value="not-an-email" state="error" helper="Enter a valid email"></ds-text-input>`, '320px'));
    await shot(el, 'text-input-error');
  });
  it('text-area', async () => {
    const el = await fixture(frame(html`<ds-text-area label="Notes" value="A short note about this record."></ds-text-area>`, '320px'));
    await shot(el, 'text-area');
  });
  it('search-field', async () => {
    const el = await fixture(frame(html`<ds-search-field placeholder="Search devices…"></ds-search-field>`, '300px'));
    await shot(el, 'search-field');
  });
  it('otp-input', async () => {
    const el = await fixture(frame(html`<ds-otp-input length="6" value="123456" label="One-time code"></ds-otp-input>`, '320px'));
    await shot(el, 'otp-input');
  });
  it('slider', async () => {
    const el = await fixture(frame(html`<ds-slider type="single" label="Volume" value="60"></ds-slider>`, '300px'));
    await shot(el, 'slider');
  });
  it('field-helper-error', async () => {
    const el = await fixture(frame(html`<ds-field-helper text="This field is required" state="error"></ds-field-helper>`, '320px'));
    await shot(el, 'field-helper-error');
  });
  it('radio-group', async () => {
    const el = await fixture(frame(html`<ds-radio-group label="Plan" label-position="top"></ds-radio-group>`, '260px'));
    el.querySelector('ds-radio-group').options = [
      { value: 'basic', label: 'Basic', selected: true }, { value: 'pro', label: 'Pro' },
    ];
    await shot(el, 'radio-group');
  });
  it('checkbox-group', async () => {
    const el = await fixture(frame(html`
      <ds-checkbox-group label="Toppings">
        <ds-checkbox label="Cheese" checked></ds-checkbox>
        <ds-checkbox label="Olives"></ds-checkbox>
      </ds-checkbox-group>`, '260px'));
    await shot(el, 'checkbox-group');
  });
  it('input-select', async () => {
    const el = await fixture(frame(html`<ds-input-select label="Region" value="us"></ds-input-select>`, '300px'));
    el.querySelector('ds-input-select').options = [
      { label: 'United States', value: 'us' }, { label: 'Canada', value: 'ca' },
    ];
    await shot(el, 'input-select');
  });
  it('token-field', async () => {
    const el = await fixture(frame(html`<ds-token-field label="Tags"></ds-token-field>`, '320px'));
    await shot(el, 'token-field');
  });
});

describe('visual — content & data', () => {
  it('description-list', async () => {
    const el = await fixture(frame(html`<ds-description-list></ds-description-list>`, '340px'));
    el.querySelector('ds-description-list').items = [
      { term: 'Status', description: 'Active' }, { term: 'Owner', description: 'Jane Doe' }, { term: 'Region', description: 'US East' },
    ];
    await shot(el, 'description-list');
  });
  it('item-list', async () => {
    const el = await fixture(frame(html`<ds-item-list divider="line"></ds-item-list>`, '420px'));
    el.querySelector('ds-item-list').items = [
      { text: '23 devices pending enrollment', icon: 'exclamation-circle', status: 'critical', meta: 'Security \u00b7 3 mins ago' },
      { text: 'MacBook-Pro-Dev-09 enrolled', icon: 'circle-tick', status: 'success', meta: 'admin \u00b7 2 hours ago' },
    ];
    await shot(el, 'item-list');
  });
  it('item-list (release note: inline link + trailing badge)', async () => {
    const el = await fixture(frame(html`<ds-item-list divider="dashed"></ds-item-list>`, '420px'));
    el.querySelector('ds-item-list').items = [
      { metaPosition: 'above', meta: '11.3.2456 \u00b7 4 Sep 2026',
        text: 'Agent reconnect backoff is now adaptive',
        description: 'Agents on flaky links reconnect on a widening interval.',
        link: 'Read more' },
      { text: 'DESKTOP-4471-QA', icon: 'laptop', lead: 'box', status: 'success',
        meta: 'Windows 11', trailing: { badge: 'Online' } },
    ];
    await shot(el, 'item-list-link-and-badge');
  });
  it('item-list (timeline, icon marker)', async () => {
    const el = await fixture(frame(html`<ds-item-list variant="timeline" timeline-marker="icon"></ds-item-list>`, '420px'));
    el.querySelector('ds-item-list').items = [
      { text: 'Deployment created', icon: 'clock', meta: '10:02 AM' },
      { text: 'Package distributed to 412 devices', icon: 'circle-tick', status: 'success', meta: '10:14 AM' },
      { text: '9 devices failed', icon: 'exclamation-circle', status: 'critical', meta: '10:31 AM' },
    ];
    await shot(el, 'item-list-timeline-icon');
  });
  it('item-list (timeline)', async () => {
    const el = await fixture(frame(html`<ds-item-list variant="timeline"></ds-item-list>`, '420px'));
    el.querySelector('ds-item-list').items = [
      { text: 'Deployment created', status: 'default', meta: '10:02 AM' },
      { text: 'Package distributed to 412 devices', status: 'success', meta: '10:14 AM' },
      { text: '9 devices failed', status: 'critical', meta: '10:31 AM' },
    ];
    await shot(el, 'item-list-timeline');
  });
  it('list', async () => {
    const el = await fixture(frame(html`<ds-list></ds-list>`, '260px'));
    el.querySelector('ds-list').items = ['Alpha', 'Beta', 'Gamma'];
    await shot(el, 'list');
  });
  it('data-table', async () => {
    const el = await fixture(frame(html`<ds-data-table selection-mode="none"></ds-data-table>`, '460px'));
    const t = el.querySelector('ds-data-table');
    t.columns = [{ id: 'name', header: 'Name', accessor: 'name' }, { id: 'role', header: 'Role', accessor: 'role' }];
    t.rows = [{ id: '1', name: 'Ada Lovelace', role: 'Admin' }, { id: '2', name: 'Grace Hopper', role: 'User' }];
    await shot(el, 'data-table');
  });
  it('empty-state', async () => {
    const el = await fixture(frame(html`<ds-empty-state type="centered" title="No results" description="Try a different filter."></ds-empty-state>`, '380px'));
    await shot(el, 'empty-state');
  });
  it('card', async () => {
    const el = await fixture(frame(html`<ds-card><p style="margin:0">Card body content sits in the default slot.</p></ds-card>`, '320px'));
    await shot(el, 'card');
  });
  it('toast', async () => {
    const el = await fixture(frame(html`<ds-toast status="success" title="Saved" description="Your changes are live."></ds-toast>`, '380px'));
    await shot(el, 'toast');
  });
});

describe('visual — nav & structure', () => {
  it('breadcrumb', async () => {
    const el = await fixture(frame(html`<ds-breadcrumb><a href="/">Home</a><a href="/reports">Reports</a><a href="/reports/q3">Q3</a></ds-breadcrumb>`, '360px'));
    await shot(el, 'breadcrumb');
  });
  it('section-header', async () => {
    const el = await fixture(frame(html`<ds-section-header title="Team members"></ds-section-header>`, '360px'));
    await shot(el, 'section-header');
  });
  it('page-header', async () => {
    const el = await fixture(frame(html`<ds-page-header title="Devices" description="All managed endpoints"></ds-page-header>`, '460px'));
    await shot(el, 'page-header');
  });
  it('tab-bar-horizontal', async () => {
    const el = await fixture(frame(html`<ds-tab-bar-horizontal aria-label="Sections"></ds-tab-bar-horizontal>`, '420px'));
    el.querySelector('ds-tab-bar-horizontal').items = [
      { id: 'overview', label: 'Overview', icon: 'home' }, { id: 'activity', label: 'Activity', icon: 'activity' }, { id: 'members', label: 'Members', icon: 'mail-user' },
    ];
    await shot(el, 'tab-bar-horizontal');
  });
  it('accordion', async () => {
    const el = await fixture(frame(html`<ds-accordion initial-expanded><span slot="title">Advanced settings</span><div slot="body">Body content inside the panel.</div></ds-accordion>`, '380px'));
    await shot(el, 'accordion');
  });
  it('dropdown-menu-open', async () => {
    const el = await fixture(frame(html`<ds-dropdown-menu open aria-label="Actions"></ds-dropdown-menu>`, '240px'));
    el.querySelector('ds-dropdown-menu').items = [
      { label: 'Edit', value: 'edit', icon: 'edit' }, { label: 'Duplicate', value: 'dup', icon: 'copy' }, { label: 'Delete', value: 'del', icon: 'trash', danger: true },
    ];
    await shot(el, 'dropdown-menu-open');
  });
});
