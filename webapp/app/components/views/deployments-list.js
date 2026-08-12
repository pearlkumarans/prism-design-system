import Component from '@glimmer/component';
import { service } from '@ember/service';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';

/**
 * Deployments list — Phase E, and proof the data-layer pattern REUSES cleanly.
 * Binds the SECOND BFF endpoint (PrismAPI.deployments.list → /deployments/api/list)
 * with the identical server-driven-table contract as managed-computers: filter,
 * debounced search, sort, paginate — all server-side; KPIs + facets full-dataset.
 * Structurally a near-copy of bitlocker-managed-systems (different resource + columns).
 */

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

const STATUS_STATE = { Success: 'success', 'In progress': 'warning', Failed: 'critical', Scheduled: 'default' };
const TYPE_ICON = { Software: 'settings-deploy', Patch: 'file-shield', Configuration: 'settings', Script: 'script-editor' };
const PLATFORM_ICON = { Windows: 'microsoft', macOS: 'apple', Linux: 'server-01' };

export default class DeploymentsList extends Component {
  @service api;
  @service router;
  @service shell;

  @tracked filters = { status: [], type: [], platform: [] };
  @tracked search = '';
  @tracked sort = { columnId: null, direction: null };
  @tracked page = 1;
  @tracked pageSize = 12;
  @tracked view = null;
  @tracked isLoading = true;
  @tracked error = null;
  @tracked filtering = false;
  _searchTimer = null;

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
      const body = dep ? await dep.list(params) : { rows: [], total: 0, kpis: null, facets: null };
      this.view = body;
    } catch (e) {
      this.error = e;
    } finally {
      this.isLoading = false;
    }
  }

  get rows() { return this.view?.rows ?? []; }
  get total() { return this.view?.total ?? 0; }

  get kpis() {
    const k = this.view?.kpis;
    if (!k) return [];
    return [
      { label: 'Deployments', value: k.total, state: 'default', icon: 'settings-deploy' },
      { label: 'Succeeded', value: k.success, state: 'success', icon: 'check-circle' },
      { label: 'In progress', value: k.running, state: 'warning', icon: 'clock' },
      { label: 'Failed', value: k.failed, state: 'alert', icon: 'exclamation-circle' },
    ];
  }

  get filterGroups() {
    const fac = this.view?.facets;
    if (!fac) return [];
    const grp = (id, label) => ({ id, label, type: 'checkbox', options: (fac[id] || []).map((o) => ({ label: o.value, value: o.value, count: o.count })) });
    return [grp('status', 'Status'), grp('type', 'Type'), grp('platform', 'Platform')];
  }

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

  get bulkActions() {
    return [
      { id: 'rerun', label: 'Re-run', icon: 'refresh' },
      { id: 'cancel', label: 'Cancel', icon: 'close' },
    ];
  }

  toast(kind, title, description) {
    globalThis.dsToast?.[kind]?.({ title, description, style: 'subtle' });
  }

  @action onFilterChange(event) {
    const v = event.detail?.value || event.target?.value || {};
    this.filters = { status: v.status || [], type: v.type || [], platform: v.platform || [] };
    this.page = 1;
    this.reload();
  }

  @action onSearch(event) {
    const value = (event.detail?.value ?? event.target?.value ?? '').trim();
    clearTimeout(this._searchTimer);
    this._searchTimer = setTimeout(() => { this.search = value; this.page = 1; this.reload(); }, 250);
  }

  @action onPage(event) {
    const p = Number(event.detail?.page || 1);
    if (p && p !== this.page) { this.page = p; this.reload(); }
  }

  @action onPageSize(event) {
    const n = Number(event.detail?.rowsPerPage || this.pageSize);
    if (n && n !== this.pageSize) { this.pageSize = n; this.page = 1; this.reload(); }
  }

  @action onSort(event) {
    const d = event.detail || {};
    this.sort = { columnId: d.columnId || null, direction: d.direction || null };
    this.page = 1;
    this.reload();
  }

  @action onToggleFilter() { this.filtering = !this.filtering; }

  @action onBulkAction(event) {
    const d = event.detail || {}; const n = (d.ids || []).length;
    if (d.id === 'rerun') this.toast('success', 'Re-run queued', `${n} deployment(s)`);
    else if (d.id === 'cancel') this.toast('info', 'Cancelled', `${n} deployment(s)`);
  }

  @action createDeployment() {
    this.router.transitionTo('product.module.view', this.shell.productId, 'deployments', 'deployments-create');
  }
}
