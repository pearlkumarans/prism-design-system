import Component from '@glimmer/component';
import { service } from '@ember/service';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';

/**
 * Inventory · Overview — the Inventory (inv) tab landing, a native
 * Patterns::ModuleDashboard instance (L02). Replaces the legacy
 * ../projects/acme/layout-inventory-overview.html injection (which never
 * existed — the entry 404'd), so the Inventory tab now lands on a real dashboard.
 *
 * One BFF call (PrismAPI.inventory.overview() → /inventory/api/overview) returns
 * the whole composite record — KPIs, charts, list widgets, and the hardware
 * table. Charts bind via {{config-chart}}; structure (tabs, table columns) is
 * local. Mirrors views/module-dashboard for consistency.
 */

// Semantic list tone → tokens (the API returns a `tone`, not CSS).
const TONE = {
  info:    { bg: 'var(--uems-bg-info-primary)',    color: 'var(--uems-icon-info)' },
  success: { bg: 'var(--uems-bg-success-primary)', color: 'var(--uems-icon-success)' },
  error:   { bg: 'var(--uems-bg-error-primary)',   color: 'var(--uems-icon-error)' },
  warning: { bg: 'var(--uems-bg-warning-primary)', color: 'var(--uems-icon-warning)' },
};
const EMPTY_CHART = { categories: [], series: [] };

export default class AcmeInventoryOverviewView extends Component {
  @service api;
  @service i18n;

  @tracked data = null;
  @tracked isLoading = true;
  @tracked error = null;

  constructor() {
    super(...arguments);
    this.reload();
  }

  async reload() {
    this.isLoading = true;
    this.error = null;
    try {
      const inv = this.api.prism?.inventory;
      this.data = inv ? await inv.overview() : null;
      if (!this.data) throw new Error('No inventory data');
    } catch (e) {
      this.error = e;
    } finally {
      this.isLoading = false;
    }
  }

  get header() {
    return {
      icon: 'server-01',
      title: 'Inventory overview',
      description: 'Hardware and software inventory across your managed computers.',
    };
  }

  // config-chart re-lays-out on this key (language flip or a data load).
  get refitKey() { return `${this.i18n?.lang ?? 'en'}:${this.data ? 1 : 0}`; }

  @action retry() { this.reload(); }

  // ── KPIs + charts (from the fetched record). ──
  get kpis() { return this.data?.kpis ?? []; }

  get osChart()      { return this.data?.charts?.os      ?? EMPTY_CHART; }
  get mfrChart()     { return this.data?.charts?.mfr     ?? EMPTY_CHART; }
  get swcatChart()   { return this.data?.charts?.swcat   ?? EMPTY_CHART; }
  get licenseChart() { return this.data?.charts?.license ?? EMPTY_CHART; }
  get scanChart()    { return this.data?.charts?.scan    ?? EMPTY_CHART; }
  get devtypeChart() { return this.data?.charts?.devtype ?? EMPTY_CHART; }
  get memoryChart()  { return this.data?.charts?.memory  ?? EMPTY_CHART; }

  // ── List widgets. Software carries a semantic `tone` → resolve to tokens. ──
  get softwareRows() {
    return (this.data?.lists?.software ?? []).map((r) => ({ ...r, ...(TONE[r.tone] || TONE.info) }));
  }
  get warrantyRows() { return this.data?.lists?.warranty ?? []; }

  // ── Hardware inventory table: columns are structure (local); rows are data. ──
  get hardwareColumns() {
    return [
      { id: 'name', header: 'Computer', accessor: 'name' },
      { id: 'manufacturer', header: 'Manufacturer', accessor: 'manufacturer' },
      { id: 'model', header: 'Model', accessor: 'model' },
      { id: 'memory', header: 'Memory', accessor: 'memory' },
      { id: 'disk', header: 'Disk', accessor: 'disk' },
    ];
  }
  get hardwareRows() { return this.data?.hardware ?? []; }
}
