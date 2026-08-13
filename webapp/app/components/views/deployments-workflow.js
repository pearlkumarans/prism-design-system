import Component from '@glimmer/component';
import { service } from '@ember/service';
import { action } from '@ember/object';

/**
 * Workflows — a thin Patterns::ListView instance (no KPIs, per-row Edit/Delete
 * menu). Add Workflow and Edit both open the workflow builder (legacy view).
 */
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const STATUS_STATE = { Active: 'success', Draft: 'default', Paused: 'moderate' };

export default class DeploymentsWorkflow extends Component {
  @service api;
  @service router;
  @service shell;

  header = {
    icon: 'route',
    title: 'Workflows',
    description: 'Stack policies into stages — pre-deployment activities, notifications, retries — and run them in order.',
  };
  facets = [{ id: 'status', label: 'Status' }];
  rowMenu = [
    { label: 'Edit', value: 'edit', icon: 'edit' },
    { label: 'Delete', value: 'delete', icon: 'delete' },
  ];

  fetch = (params) => this.api.prism.deployments.workflows(params);

  get columns() {
    return [
      { id: 'name', header: 'Workflow name', sortable: true, accessor: 'name' },
      { id: 'stages', header: 'Stages', align: 'end', sortable: true, accessor: 'stages' },
      { id: 'status', header: 'Status', align: 'start', sortable: true, render: (r) => `<ds-badge variant="subtle" state="${STATUS_STATE[r.status] || 'default'}" shape="rounded" size="medium">${esc(r.status)}</ds-badge>` },
      { id: 'actions', header: 'Actions', align: 'end', render: (r) => `<span class="pol-actions"><button type="button" data-act="more" data-id="${esc(r.id)}" aria-label="Row actions"><ds-icon name="more-vertical" size="16"></ds-icon></button></span>` },
    ];
  }

  goto(slug) { this.router.transitionTo('product.module.view', this.shell.productId, 'deployments', slug); }

  @action onAddWorkflow() { this.goto('deployments-workflow-builder'); }

  @action onRowMenu(value, id) {
    if (value === 'edit') { globalThis.__workflowEditId = id; this.goto('deployments-workflow-builder'); }
    else if (value === 'delete') globalThis.dsToast?.info?.({ title: 'Workflow deleted', description: `Workflow #${id}`, style: 'subtle' });
  }
}
