import Component from '@glimmer/component';
import { service } from '@ember/service';
import { action } from '@ember/object';

/**
 * Workflows — a DEX list (L03): automation workflows (trigger → conditions →
 * actions), with status and run counts. A thin Patterns::ListView bound to
 * PrismAPI.dex.workflows.
 */
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const STATUS_STATE = { Enabled: 'success', Disabled: 'default', Draft: 'warning' };

export default class WorkflowsView extends Component {
  @service api;

  header = { icon: 'data-flow-01', title: 'Workflows', description: 'Automation workflows that remediate experience issues on your fleet.' };
  facets = [{ id: 'status', label: 'Status' }];
  bulkActions = [
    { id: 'enable', label: 'Enable', icon: 'circle-tick' },
    { id: 'trash', label: 'Move to trash', icon: 'delete' },
  ];

  fetch = (params) => this.api.prism.dex.workflows(params);

  kpis = (k) => [
    { label: 'Workflows', value: k.total, state: 'default', icon: 'data-flow-01' },
    { label: 'Enabled', value: k.enabled, state: 'success', icon: 'circle-tick' },
    { label: 'Draft', value: k.draft, state: 'warning', icon: 'edit' },
    { label: 'Disabled', value: k.disabled, state: 'default', icon: 'clock' },
  ];

  get columns() {
    return [
      { id: 'name', header: 'Workflow', sortable: true, render: (r) => `<span class="cell-name"><ds-icon name="data-flow-01" size="16"></ds-icon>${esc(r.name)}</span>` },
      { id: 'trigger', header: 'Trigger', sortable: true, render: (r) => `<span class="cell-muted">${esc(r.trigger)}</span>` },
      { id: 'status', header: 'Status', sortable: true, render: (r) => `<ds-badge variant="subtle" state="${STATUS_STATE[r.status] || 'default'}" shape="rounded" size="medium">${esc(r.status)}</ds-badge>` },
      { id: 'runs', header: 'Runs', align: 'end', sortable: true, accessor: 'runs' },
      { id: 'lastRun', header: 'Last run', sortable: true, render: (r) => esc(r.lastRun) },
    ];
  }

  @action onBulkAction(event) {
    const d = event.detail || {}; const n = (d.ids || []).length;
    const toast = (kind, title, desc) => globalThis.dsToast?.[kind]?.({ title, description: desc, style: 'subtle' });
    if (d.id === 'enable') toast('success', 'Workflows enabled', `${n} workflow(s)`);
    else if (d.id === 'trash') toast('info', 'Moved to trash', `${n} workflow(s)`);
  }
}
