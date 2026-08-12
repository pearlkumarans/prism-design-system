import Component from '@glimmer/component';
import { service } from '@ember/service';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';

/**
 * Devices in deployment scope — Phase E. A THIRD server-driven table on the SAME
 * pattern, bound to a THIRD BFF endpoint (PrismAPI.deployments.devices →
 * /deployments/api/devices). Near-identical to deployments-list; only the columns,
 * facets, KPIs, and endpoint method differ — the point of the reusable contract.
 */

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const STATUS_STATE = { Deployed: 'success', 'In progress': 'warning', Pending: 'default', Failed: 'critical' };
const OS_ICON = { Windows: 'microsoft', macOS: 'apple', Linux: 'server-01' };

export default class DeploymentsDevices extends Component {
  @service api;
  @service router;
  @service shell;

  @tracked filters = { status: [], os: [], group: [] };
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
      this.view = dep ? await dep.devices(params) : { rows: [], total: 0, kpis: null, facets: null };
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
      { label: 'Devices', value: k.total, state: 'default', icon: 'computer' },
      { label: 'Deployed', value: k.deployed, state: 'success', icon: 'check-circle' },
      { label: 'Pending', value: k.pending, state: 'warning', icon: 'clock' },
      { label: 'Failed', value: k.failed, state: 'alert', icon: 'exclamation-circle' },
    ];
  }

  get filterGroups() {
    const fac = this.view?.facets;
    if (!fac) return [];
    const grp = (id, label) => ({ id, label, type: 'checkbox', options: (fac[id] || []).map((o) => ({ label: o.value, value: o.value, count: o.count })) });
    return [grp('status', 'Status'), grp('os', 'Operating system'), grp('group', 'Group')];
  }

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

  get bulkActions() {
    return [{ id: 'retry', label: 'Retry', icon: 'refresh' }, { id: 'remove', label: 'Remove from scope', icon: 'close' }];
  }

  toast(kind, title, description) { globalThis.dsToast?.[kind]?.({ title, description, style: 'subtle' }); }

  @action onFilterChange(event) {
    const v = event.detail?.value || event.target?.value || {};
    this.filters = { status: v.status || [], os: v.os || [], group: v.group || [] };
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

  @action onBulkAction(event) {
    const d = event.detail || {}; const n = (d.ids || []).length;
    if (d.id === 'retry') this.toast('success', 'Retry queued', `${n} device(s)`);
    else if (d.id === 'remove') this.toast('info', 'Removed from scope', `${n} device(s)`);
  }
}
