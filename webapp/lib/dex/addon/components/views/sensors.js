import Component from '@glimmer/component';
import { service } from '@ember/service';
import { action } from '@ember/object';

/**
 * Sensors — a DEX list (L03): the custom sensors (scripts/queries) that collect
 * device signals, with type/platform/category/status and bulk enable/deploy. A thin
 * Patterns::ListView bound to PrismAPI.dex.sensors. Native build.
 */
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const STATUS_STATE = { Enabled: 'success', Disabled: 'default' };
const PLATFORM_ICON = { Windows: 'microsoft', macOS: 'apple', Linux: 'terminal-square' };
const TYPE_ICON = { Script: 'terminal-square', Query: 'data-01', 'Registry check': 'settings' };

export default class SensorsView extends Component {
  @service api;

  header = { icon: 'speedometer', title: 'Sensors', description: 'Custom sensors that collect experience signals from your devices.' };
  facets = [
    { id: 'platform', label: 'Platform' },
    { id: 'category', label: 'Category' },
    { id: 'status', label: 'Status' },
    { id: 'type', label: 'Type' },
  ];
  bulkActions = [
    { id: 'enable', label: 'Enable', icon: 'circle-tick' },
    { id: 'deploy', label: 'Deploy', icon: 'settings-deploy' },
  ];

  fetch = (params) => this.api.prism.dex.sensors(params);

  kpis = (k) => [
    { label: 'Sensors', value: k.total, state: 'default', icon: 'speedometer' },
    { label: 'Enabled', value: k.enabled, state: 'success', icon: 'circle-tick' },
    { label: 'Deployments', value: k.deployments, state: 'default', icon: 'settings-deploy' },
    { label: 'Disabled', value: k.disabled, state: 'warning', icon: 'clock' },
  ];

  get columns() {
    return [
      { id: 'name', header: 'Sensor', sortable: true, render: (r) => `<span class="cell-name"><ds-icon name="${TYPE_ICON[r.type] || 'terminal-square'}" size="16"></ds-icon>${esc(r.name)}</span>` },
      { id: 'type', header: 'Type', sortable: true, render: (r) => `<span class="cell-muted">${esc(r.type)}</span>` },
      { id: 'platform', header: 'Platform', sortable: true, render: (r) => `<span class="cell-name"><ds-icon name="${PLATFORM_ICON[r.platform] || 'computer'}" size="16"></ds-icon>${esc(r.platform)}</span>` },
      { id: 'category', header: 'Category', sortable: true, render: (r) => `<span class="cell-muted">${esc(r.category)}</span>` },
      { id: 'status', header: 'Status', sortable: true, render: (r) => `<ds-badge variant="subtle" state="${STATUS_STATE[r.status] || 'default'}" shape="rounded" size="medium">${esc(r.status)}</ds-badge>` },
      { id: 'deployments', header: 'Deployments', align: 'end', sortable: true, accessor: 'deployments' },
      { id: 'lastRun', header: 'Last run', sortable: true, render: (r) => esc(r.lastRun) },
    ];
  }

  @action onBulkAction(event) {
    const d = event.detail || {}; const n = (d.ids || []).length;
    const toast = (kind, title, desc) => globalThis.dsToast?.[kind]?.({ title, description: desc, style: 'subtle' });
    if (d.id === 'enable') toast('success', 'Sensors enabled', `${n} sensor(s)`);
    else if (d.id === 'deploy') toast('info', 'Deployment queued', `${n} sensor(s)`);
  }
}
