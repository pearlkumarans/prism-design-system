import Component from '@glimmer/component';
import { service } from '@ember/service';
import { action } from '@ember/object';

/**
 * Deployments list — a thin Patterns::ListView instance (bound to
 * PrismAPI.deployments.list). Config only; the pattern owns the table machinery.
 */
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const STATUS_STATE = { Success: 'success', 'In progress': 'warning', Failed: 'critical', Scheduled: 'default' };
const TYPE_ICON = { Software: 'settings-deploy', Patch: 'file-shield', Configuration: 'settings', Script: 'script-editor' };
const PLATFORM_ICON = { Windows: 'microsoft', macOS: 'apple', Linux: 'server-01' };

export default class DeploymentsList extends Component {
  @service api;
  @service router;
  @service shell;

  header = {
    icon: 'settings-deploy',
    title: 'Deployments',
    description: 'Software, patch, configuration, and script deployments across your fleet.',
  };
  facets = [
    { id: 'status', label: 'Status' },
    { id: 'type', label: 'Type' },
    { id: 'platform', label: 'Platform' },
  ];
  bulkActions = [
    { id: 'rerun', label: 'Re-run', icon: 'refresh' },
    { id: 'cancel', label: 'Cancel', icon: 'close' },
  ];

  fetch = (params) => this.api.prism.deployments.list(params);

  kpis = (k) => [
    { label: 'Deployments', value: k.total, state: 'default', icon: 'settings-deploy' },
    { label: 'Succeeded', value: k.success, state: 'success', icon: 'check-circle' },
    { label: 'In progress', value: k.running, state: 'warning', icon: 'clock' },
    { label: 'Failed', value: k.failed, state: 'alert', icon: 'exclamation-circle' },
  ];

  get columns() {
    return [
      { id: 'name', header: 'Deployment', sortable: true, render: (r) => `<span class="cell-name"><ds-icon name="${TYPE_ICON[r.type] || 'settings-deploy'}" size="16"></ds-icon>${esc(r.name)}</span>` },
      { id: 'type', header: 'Type', sortable: true, render: (r) => `<span class="cell-muted">${esc(r.type)}</span>` },
      { id: 'platform', header: 'Platform', sortable: true, render: (r) => `<span class="cell-name"><ds-icon name="${PLATFORM_ICON[r.platform] || 'computer'}" size="16"></ds-icon>${esc(r.platform)}</span>` },
      { id: 'status', header: 'Status', sortable: true, render: (r) => `<ds-badge variant="subtle" state="${STATUS_STATE[r.status] || 'default'}" shape="rounded" size="medium">${esc(r.status)}</ds-badge>` },
      { id: 'target', header: 'Target', sortable: true, render: (r) => `<span class="cell-muted">${esc(r.target)}</span>` },
      { id: 'devices', header: 'Devices', align: 'end', sortable: true, accessor: 'devices' },
      { id: 'created', header: 'Created', sortable: true, render: (r) => esc(r.created) },
    ];
  }

  @action onBulkAction(event) {
    const d = event.detail || {}; const n = (d.ids || []).length;
    const toast = (kind, title, desc) => globalThis.dsToast?.[kind]?.({ title, description: desc, style: 'subtle' });
    if (d.id === 'rerun') toast('success', 'Re-run queued', `${n} deployment(s)`);
    else if (d.id === 'cancel') toast('info', 'Cancelled', `${n} deployment(s)`);
  }

  @action createDeployment() {
    this.router.transitionTo('product.module.view', this.shell.productId, 'deployments', 'deployments-create');
  }
}
