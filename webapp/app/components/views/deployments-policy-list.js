import Component from '@glimmer/component';
import { service } from '@ember/service';
import { action } from '@ember/object';

/**
 * All policies — a thin Patterns::ListView instance (no KPIs). The name column
 * drills to the policy detail (data-row-link → @onRowLink); a per-row Edit/Delete
 * menu and an Add-policy split button round it out.
 */
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const SCOPE_ICON = (scope) => (scope === 'user' ? 'user' : 'computer');
const STATUS_STATE = {
  Draft: 'default', 'Ready to Execute': 'success', Executed: 'success', 'In Progress': 'info',
  'In Progress (Failed)': 'critical', Suspended: 'moderate', Rejected: 'critical', Expired: 'default',
};

export default class DeploymentsPolicyList extends Component {
  @service api;
  @service router;
  @service shell;

  header = {
    icon: 'shield',
    title: 'All policies',
    description: 'Every policy created in your Administrative Group — profile, software, patch, script.',
  };
  facets = [
    { id: 'platform', label: 'Category' },
    { id: 'type', label: 'Type' },
    { id: 'status', label: 'Status' },
  ];
  addPolicyMenu = [
    { value: 'windows', label: 'Windows', icon: 'microsoft' },
    { value: 'mac', label: 'Mac', icon: 'apple' },
    { value: 'linux', label: 'Linux', icon: 'terminal-square' },
  ];
  rowMenu = [
    { label: 'Edit', value: 'edit', icon: 'edit' },
    { label: 'Delete', value: 'delete', icon: 'delete' },
  ];

  fetch = (params) => this.api.prism.deployments.policies(params);

  get columns() {
    return [
      { id: 'name', header: 'Policy name', sortable: true, render: (r) => `<span class="pol-cell-name"><ds-icon name="${SCOPE_ICON(r.scope)}" size="16"></ds-icon><a class="pol-name-link" data-row-link data-id="${esc(r.id)}" href="#">${esc(r.name)}</a></span>` },
      { id: 'platform', header: 'Category', sortable: true, accessor: 'platform' },
      { id: 'type', header: 'Type', sortable: true, accessor: 'type' },
      { id: 'status', header: 'Status', sortable: true, render: (r) => `<ds-badge variant="subtle" state="${STATUS_STATE[r.status] || 'default'}" shape="rounded" size="medium">${esc(r.status)}</ds-badge>` },
      { id: 'createdBy', header: 'Created by', sortable: true, accessor: 'createdBy' },
      { id: 'modified', header: 'Last modified', sortable: true, accessor: 'modified' },
      { id: 'modifiedBy', header: 'Last modified by', sortable: true, accessor: 'modifiedBy' },
      { id: 'actions', header: 'Actions', align: 'end', render: (r) => `<span class="pol-actions"><button type="button" data-act="more" data-id="${esc(r.id)}" aria-label="Row actions"><ds-icon name="more-vertical" size="16"></ds-icon></button></span>` },
    ];
  }

  goto(slug) { this.router.transitionTo('product.module.view', this.shell.productId, 'deployments', slug); }

  @action onRowLink() { this.goto('deployments-policy-detail'); }

  @action onRowMenu(value, id) {
    if (value === 'edit') this.goto('deployments-policy-detail');
    else if (value === 'delete') globalThis.dsToast?.info?.({ title: 'Policy deleted', description: `Policy #${id}`, style: 'subtle' });
  }

  @action onAddPolicy(event) {
    if (event?.type === 'ds-split-button-menu-select' && event.detail?.value) globalThis.__addPolicyPendingOS = event.detail.value;
    this.goto('deployments-policy');
  }
}
