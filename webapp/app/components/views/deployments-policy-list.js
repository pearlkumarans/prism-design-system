import Component from '@glimmer/component';
import { service } from '@ember/service';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';

/**
 * All policies — Phase E. A server-driven list on the SAME contract as the other
 * lists (PrismAPI.deployments.policies → /deployments/api/policies), but a plainer
 * shape faithful to the legacy layout-policy-list: NO KPIs, a clickable name that
 * drills to the policy detail, an Add-policy split button, and a per-row Edit/Delete
 * menu. Filters (category / type / status) live in the one collapsing filter surface.
 */

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const SCOPE_ICON = (scope) => (scope === 'user' ? 'user' : 'computer');
const STATUS_STATE = {
  Draft: 'default',
  'Ready to Execute': 'success',
  Executed: 'success',
  'In Progress': 'info',
  'In Progress (Failed)': 'critical',
  Suspended: 'moderate',
  Rejected: 'critical',
  Expired: 'default',
};

export default class DeploymentsPolicyList extends Component {
  @service api;
  @service router;
  @service shell;

  @tracked filters = { platform: [], type: [], status: [] };
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
      this.view = dep ? await dep.policies(params) : { rows: [], total: 0, facets: null };
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
    const grp = (id, label) => ({ id, label, type: 'checkbox', options: (fac[id] || []).map((o) => ({ label: o.value, value: o.value, count: o.count })) });
    return [grp('platform', 'Category'), grp('type', 'Type'), grp('status', 'Status')];
  }

  get columns() {
    return [
      { id: 'name', header: 'Policy name', sortable: true, render: (r) => `<span class="pol-cell-name"><ds-icon name="${SCOPE_ICON(r.scope)}" size="16"></ds-icon><a class="pol-name-link" data-policy-id="${esc(r.id)}" href="#">${esc(r.name)}</a></span>` },
      { id: 'platform', header: 'Category', sortable: true, accessor: 'platform' },
      { id: 'type', header: 'Type', sortable: true, accessor: 'type' },
      { id: 'status', header: 'Status', sortable: true, render: (r) => `<ds-badge variant="subtle" state="${STATUS_STATE[r.status] || 'default'}" shape="rounded" size="medium">${esc(r.status)}</ds-badge>` },
      { id: 'createdBy', header: 'Created by', sortable: true, accessor: 'createdBy' },
      { id: 'modified', header: 'Last modified', sortable: true, accessor: 'modified' },
      { id: 'modifiedBy', header: 'Last modified by', sortable: true, accessor: 'modifiedBy' },
      { id: 'actions', header: 'Actions', align: 'end', render: (r) => `<span class="pol-actions"><button type="button" data-act="more" data-id="${esc(r.id)}" aria-label="Row actions"><ds-icon name="more-vertical" size="16"></ds-icon></button></span>` },
    ];
  }

  get addPolicyMenu() {
    return [
      { value: 'windows', label: 'Windows', icon: 'microsoft' },
      { value: 'mac', label: 'Mac', icon: 'apple' },
      { value: 'linux', label: 'Linux', icon: 'terminal-square' },
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

  // Name link → policy detail; Actions "more" → open the row menu anchored to the button.
  @action onTableClick(event) {
    const more = event.target.closest?.('button[data-act="more"]');
    if (more) {
      this._menuId = more.dataset.id;
      const menu = event.currentTarget.querySelector('.pol-row-menu');
      menu?.openFrom?.(more, { side: 'below', align: 'end', offset: 4 });
      return;
    }
    const link = event.target.closest?.('.pol-name-link');
    if (link) {
      event.preventDefault();
      this.goto('deployments-policy-detail');
    }
  }

  @action onRowMenuSelect(event) {
    const value = event.detail?.value;
    event.currentTarget.close?.();
    if (value === 'edit') this.goto('deployments-policy-detail');
    else if (value === 'delete') this.toast('info', 'Policy deleted', `Policy #${this._menuId}`);
    this._menuId = null;
  }

  @action onAddPolicy(event) {
    // main click or a menu OS pick both start policy creation.
    if (event?.type === 'ds-split-button-menu-select' && event.detail?.value) {
      globalThis.__addPolicyPendingOS = event.detail.value;
    }
    this.goto('deployments-policy');
  }

  @action onFilterChange(event) {
    const v = event.detail?.value || event.target?.value || {};
    this.filters = { platform: v.platform || [], type: v.type || [], status: v.status || [] };
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
