import Component from '@glimmer/component';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';

/**
 * Patterns::ListView — the L03 list archetype (Layout/views/layout-list-view.html)
 * as ONE reusable component. It owns the server-driven-table state machine
 * (filter · search · sort · paginate) and the whole .bl-list chrome (header, KPIs,
 * collapsing filter panel, data-table, loading/error). Callers supply data + config
 * via args, so a concrete list view is just a fetch fn + columns + a few defs.
 *
 * Args
 *   @fetch      (params) => Promise<{rows,total,kpis,facets}>            REQUIRED
 *   @columns    ds-data-table column defs                               REQUIRED
 *   @header     { icon, title, description }
 *   @facets     [{ id, label }] — filter groups are built from result.facets[id]
 *   @kpis       (kpis) => [{ label, value, state, icon }]  · falsy ⇒ no KPI row
 *   @bulkActions [{ id, label, icon }]
 *   @rowMenu    [{ label, value, icon }] — per-row ⋮ menu; a column must render
 *                 <button data-act="more" data-id="…">
 *   @selectionMode 'multi' | 'none'   (default 'multi')
 *   @pageSize   number                (default 12)
 *   @rowsPerPageOptions e.g. "10,25,50"
 *   @onBulkAction(event) · @onRowMenu(value, id) · @onRowLink(id) — a name column
 *                 can render <a data-row-link data-id="…"> to drill down
 *   Block  <:headerActions> … </:headerActions>  → ds-page-header actions slot
 */
export default class ListViewPattern extends Component {
  @tracked filters = {};
  @tracked search = '';
  @tracked sort = { columnId: null, direction: null };
  @tracked page = 1;
  @tracked pageSize;
  @tracked view = null;
  @tracked isLoading = true;
  @tracked error = null;
  @tracked filtering = false;
  _searchTimer = null;
  _menuId = null;

  constructor() {
    super(...arguments);
    this.pageSize = this.args.pageSize ?? 12;
    const f = {};
    (this.args.facets ?? []).forEach(({ id }) => { f[id] = []; });
    this.filters = f;
    this.reload();
  }

  get header() { return this.args.header ?? {}; }
  get selectionMode() { return this.args.selectionMode ?? 'multi'; }
  get columns() { return this.args.columns ?? []; }
  get bulkActions() { return this.args.bulkActions ?? []; }
  get rowMenu() { return this.args.rowMenu ?? []; }
  get hasRowMenu() { return this.rowMenu.length > 0; }
  get rows() { return this.view?.rows ?? []; }
  get total() { return this.view?.total ?? 0; }

  get kpis() {
    const fn = this.args.kpis;
    const k = this.view?.kpis;
    return fn && k ? fn(k) : [];
  }

  get filterGroups() {
    const fac = this.view?.facets;
    const defs = this.args.facets;
    if (!fac || !defs) return [];
    const optLabel = this.args.facetOptionLabel; // (id, value) => display label (i18n)
    return defs.map(({ id, label }) => ({
      id,
      label,
      type: 'checkbox',
      options: (fac[id] || []).map((o) => ({ label: optLabel ? optLabel(id, o.value) : o.value, value: o.value, count: o.count })),
    }));
  }

  @action async reload() {
    this.isLoading = true;
    this.error = null;
    try {
      const params = { ...this.filters, search: this.search, sort: this.sort.columnId, dir: this.sort.direction, page: this.page, pageSize: this.pageSize };
      this.view = await this.args.fetch(params);
    } catch (e) {
      this.error = e;
    } finally {
      this.isLoading = false;
    }
  }

  @action onFilterChange(event) {
    const v = event.detail?.value || event.target?.value || {};
    const next = {};
    (this.args.facets ?? []).forEach(({ id }) => { next[id] = v[id] || []; });
    this.filters = next;
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
  @action onBulkAction(event) { this.args.onBulkAction?.(event); }

  // Row interactions delegated by data attributes on cell markup.
  @action onTableClick(event) {
    const more = event.target.closest?.('button[data-act="more"]');
    if (more) {
      this._menuId = more.dataset.id;
      event.currentTarget.querySelector('.bl-list__rowmenu')?.openFrom?.(more, { side: 'below', align: 'end', offset: 4 });
      return;
    }
    const link = event.target.closest?.('[data-row-link]');
    if (link) { event.preventDefault(); this.args.onRowLink?.(link.dataset.id); }
  }

  @action onRowMenuSelect(event) {
    const value = event.detail?.value;
    event.currentTarget.close?.();
    this.args.onRowMenu?.(value, this._menuId);
    this._menuId = null;
  }
}
