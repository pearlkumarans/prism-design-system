import Component from '@glimmer/component';
import { service } from '@ember/service';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';

/**
 * Workflows — Phase E. The simplest server-driven list on the shared contract
 * (PrismAPI.deployments.workflows → /deployments/api/workflows): name / stages /
 * status, no KPIs. Add Workflow and per-row Edit both open the workflow builder
 * (a legacy view, via ContentOutlet); Delete toasts. Status filter lives in the
 * one collapsing filter surface.
 */

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const STATUS_STATE = { Active: 'success', Draft: 'default', Paused: 'moderate' };

export default class DeploymentsWorkflow extends Component {
  @service api;
  @service router;
  @service shell;

  @tracked filters = { status: [] };
  @tracked search = '';
  @tracked sort = { columnId: null, direction: null };
  @tracked page = 1;
  @tracked pageSize = 10;
  @tracked view = null;
  @tracked isLoading = true;
  @tracked error = null;
  @tracked filtering = false;
  _searchTimer = null;
  _menuId = null;

  constructor() {
    super(...arguments);
    this.reload();
  }

  async reload() {
    this.isLoading = true;
    this.error = null;
    try {
      const dep = this.api.prism?.deployments;
      const params = { ...this.filters, search: this.search, sort: this.sort.columnId, dir: this.sort.direction, page: this.page, pageSize: this.pageSize };
      this.view = dep ? await dep.workflows(params) : { rows: [], total: 0, facets: null };
    } catch (e) {
      this.error = e;
    } finally {
      this.isLoading = false;
    }
  }

  get rows() { return this.view?.rows ?? []; }
  get total() { return this.view?.total ?? 0; }

  get filterGroups() {
    const fac = this.view?.facets;
    if (!fac) return [];
    return [{ id: 'status', label: 'Status', type: 'checkbox', options: (fac.status || []).map((o) => ({ label: o.value, value: o.value, count: o.count })) }];
  }

  get columns() {
    return [
      { id: 'name', header: 'Workflow name', sortable: true, accessor: 'name' },
      { id: 'stages', header: 'Stages', align: 'end', sortable: true, accessor: 'stages' },
      { id: 'status', header: 'Status', align: 'start', sortable: true, render: (r) => `<ds-badge variant="subtle" state="${STATUS_STATE[r.status] || 'default'}" shape="rounded" size="medium">${esc(r.status)}</ds-badge>` },
      { id: 'actions', header: 'Actions', align: 'end', render: (r) => `<span class="pol-actions"><button type="button" data-act="more" data-id="${esc(r.id)}" aria-label="Row actions"><ds-icon name="more-vertical" size="16"></ds-icon></button></span>` },
    ];
  }

  get rowMenu() {
    return [
      { label: 'Edit', value: 'edit', icon: 'edit' },
      { label: 'Delete', value: 'delete', icon: 'delete' },
    ];
  }

  toast(kind, title, description) { globalThis.dsToast?.[kind]?.({ title, description, style: 'subtle' }); }

  goto(slug) { this.router.transitionTo('product.module.view', this.shell.productId, 'deployments', slug); }

  @action onAddWorkflow() { this.goto('deployments-workflow-builder'); }

  @action onTableClick(event) {
    const more = event.target.closest?.('button[data-act="more"]');
    if (!more) return;
    this._menuId = more.dataset.id;
    const menu = event.currentTarget.querySelector('.pol-row-menu');
    menu?.openFrom?.(more, { side: 'below', align: 'end', offset: 4 });
  }

  @action onRowMenuSelect(event) {
    const value = event.detail?.value;
    event.currentTarget.close?.();
    if (value === 'edit') { globalThis.__workflowEditId = this._menuId; this.goto('deployments-workflow-builder'); }
    else if (value === 'delete') this.toast('info', 'Workflow deleted', `Workflow #${this._menuId}`);
    this._menuId = null;
  }

  @action onFilterChange(event) {
    const v = event.detail?.value || event.target?.value || {};
    this.filters = { status: v.status || [] };
    this.page = 1;
    this.reload();
  }

  @action onSearch(event) {
    const value = (event.detail?.value ?? event.target?.value ?? '').trim();
    clearTimeout(this._searchTimer);
    this._searchTimer = setTimeout(() => { this.search = value; this.page = 1; this.reload(); }, 250);
  }

  @action onPage(event) { const p = Number(event.detail?.page || 1); if (p && p !== this.page) { this.page = p; this.reload(); } }
  @action onPageSize(event) { const n = Number(event.detail?.rowsPerPage || this.pageSize); if (n && n !== this.pageSize) { this.pageSize = n; this.page = 1; this.reload(); } }
  @action onSort(event) { const d = event.detail || {}; this.sort = { columnId: d.columnId || null, direction: d.direction || null }; this.page = 1; this.reload(); }
  @action onToggleFilter() { this.filtering = !this.filtering; }
}
