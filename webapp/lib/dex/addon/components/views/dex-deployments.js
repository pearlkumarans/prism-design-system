import Component from '@glimmer/component';
import { service } from '@ember/service';
import { action } from '@ember/object';

/**
 * Deployments — a DEX list (L03): deployments of sensors/scripts/content packs to
 * device targets, with run status. A thin Patterns::ListView bound to
 * PrismAPI.dex.deployments. (Namespaced dex-deployments to avoid the EC
 * Deployments module's slugs.)
 */
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const STATUS_STATE = { Running: 'alert', Completed: 'success', Failed: 'critical', Scheduled: 'default' };
const TYPE_ICON = { Sensor: 'speedometer', Script: 'terminal-square', 'Content pack': 'layers' };

export default class DexDeploymentsView extends Component {
  @service api;

  header = { icon: 'settings-deploy', title: 'Deployments', description: 'Deployments of sensors, scripts, and content packs to your devices.' };
  facets = [
    { id: 'status', label: 'Status' },
    { id: 'resourceType', label: 'Type' },
  ];
  bulkActions = [
    { id: 'retry', label: 'Retry', icon: 'refresh' },
    { id: 'stop', label: 'Stop', icon: 'close' },
  ];

  fetch = (params) => this.api.prism.dex.deployments(params);

  kpis = (k) => [
    { label: 'Deployments', value: k.total, state: 'default', icon: 'settings-deploy' },
    { label: 'Running', value: k.running, state: 'alert', icon: 'refresh' },
    { label: 'Completed', value: k.completed, state: 'success', icon: 'circle-tick' },
    { label: 'Failed', value: k.failed, state: 'critical', icon: 'exclamation-circle' },
  ];

  get columns() {
    return [
      { id: 'resource', header: 'Resource', sortable: true, render: (r) => `<span class="cell-name"><ds-icon name="${TYPE_ICON[r.resourceType] || 'settings-deploy'}" size="16"></ds-icon>${esc(r.resource)}</span>` },
      { id: 'resourceType', header: 'Type', sortable: true, render: (r) => `<span class="cell-muted">${esc(r.resourceType)}</span>` },
      { id: 'target', header: 'Target', sortable: true, render: (r) => `<span class="cell-muted">${esc(r.target)}</span>` },
      { id: 'devices', header: 'Devices', align: 'end', sortable: true, accessor: 'devices' },
      { id: 'status', header: 'Status', sortable: true, render: (r) => `<ds-badge variant="subtle" state="${STATUS_STATE[r.status] || 'default'}" shape="rounded" size="medium">${esc(r.status)}</ds-badge>` },
      { id: 'started', header: 'Started', sortable: true, render: (r) => esc(r.started) },
    ];
  }

  @action onBulkAction(event) {
    const d = event.detail || {}; const n = (d.ids || []).length;
    const toast = (kind, title, desc) => globalThis.dsToast?.[kind]?.({ title, description: desc, style: 'subtle' });
    if (d.id === 'retry') toast('info', 'Deployments retried', `${n} deployment(s)`);
    else if (d.id === 'stop') toast('info', 'Deployments stopped', `${n} deployment(s)`);
  }
}
