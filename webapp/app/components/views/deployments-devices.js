import Component from '@glimmer/component';
import { service } from '@ember/service';
import { action } from '@ember/object';

/**
 * Devices in deployment scope — now a thin instance of Patterns::ListView. All the
 * server-driven-table machinery lives in the pattern; this view is just config:
 * the data source, columns, facets, KPI mapping, and bulk actions.
 */
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const STATUS_STATE = { Deployed: 'success', 'In progress': 'warning', Pending: 'default', Failed: 'critical' };
const OS_ICON = { Windows: 'microsoft', macOS: 'apple', Linux: 'server-01' };

export default class DeploymentsDevices extends Component {
  @service api;

  header = {
    icon: 'computer',
    title: 'Devices in deployment scope',
    description: 'Every device targeted by a deployment, with its current execution status.',
  };
  facets = [
    { id: 'status', label: 'Status' },
    { id: 'os', label: 'Operating system' },
    { id: 'group', label: 'Group' },
  ];
  bulkActions = [
    { id: 'retry', label: 'Retry', icon: 'refresh' },
    { id: 'remove', label: 'Remove from scope', icon: 'close' },
  ];

  fetch = (params) => this.api.prism.deployments.devices(params);

  kpis = (k) => [
    { label: 'Devices', value: k.total, state: 'default', icon: 'computer' },
    { label: 'Deployed', value: k.deployed, state: 'success', icon: 'check-circle' },
    { label: 'Pending', value: k.pending, state: 'warning', icon: 'clock' },
    { label: 'Failed', value: k.failed, state: 'alert', icon: 'exclamation-circle' },
  ];

  get columns() {
    return [
      { id: 'name', header: 'Device', sortable: true, render: (r) => `<span class="cell-name"><ds-icon name="${OS_ICON[r.os] || 'computer'}" size="16"></ds-icon>${esc(r.name)}</span>` },
      { id: 'os', header: 'Operating system', sortable: true, render: (r) => `<span class="cell-muted">${esc(r.os)}</span>` },
      { id: 'status', header: 'Status', sortable: true, render: (r) => `<ds-badge variant="subtle" state="${STATUS_STATE[r.status] || 'default'}" shape="rounded" size="medium">${esc(r.status)}</ds-badge>` },
      { id: 'deployments', header: 'Active deployments', align: 'end', sortable: true, accessor: 'deployments' },
      { id: 'lastRun', header: 'Last run', sortable: true, render: (r) => esc(r.lastRun) },
      { id: 'group', header: 'Group', sortable: true, render: (r) => `<span class="cell-muted">${esc(r.group)}</span>` },
    ];
  }

  @action onBulkAction(event) {
    const d = event.detail || {};
    const n = (d.ids || []).length;
    if (d.id === 'retry') globalThis.dsToast?.success?.({ title: 'Retry queued', description: `${n} device(s)`, style: 'subtle' });
    else if (d.id === 'remove') globalThis.dsToast?.info?.({ title: 'Removed from scope', description: `${n} device(s)`, style: 'subtle' });
  }
}
