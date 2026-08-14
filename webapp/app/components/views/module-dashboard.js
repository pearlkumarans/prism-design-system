import Component from '@glimmer/component';
import { service } from '@ember/service';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';

/**
 * Home · Module dashboard — the L02 landing (Layout/views/layout-module-dashboard.html),
 * a native Patterns::ModuleDashboard instance.
 *
 * Bento data is fetched from the BFF in ONE call (PrismAPI.home.dashboard() →
 * /home/api/dashboard) — KPIs, charts, list widgets, and the table. While it loads
 * the pattern shows its dashboard skeleton; a failure shows an error empty-state.
 * Charts bind via {{config-chart}} (reliable type + data); structure that isn't
 * data (tabs, table columns) stays local.
 */

// Semantic list tone → tokens (the API returns a `tone`, not CSS).
const TONE = {
  info:    { bg: 'var(--uems-bg-info-primary)',    color: 'var(--uems-icon-info)' },
  success: { bg: 'var(--uems-bg-success-primary)', color: 'var(--uems-icon-success)' },
  error:   { bg: 'var(--uems-bg-error-primary)',   color: 'var(--uems-icon-error)' },
  warning: { bg: 'var(--uems-bg-warning-primary)', color: 'var(--uems-icon-warning)' },
};
const EMPTY_CHART = { categories: [], series: [] };

export default class ModuleDashboardView extends Component {
  @service api;
  @service i18n;

  @tracked facet = 'summary';
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
      const home = this.api.prism?.home;
      this.data = home ? await home.dashboard() : null;
      if (!this.data) throw new Error('No dashboard data');
    } catch (e) {
      this.error = e;
    } finally {
      this.isLoading = false;
    }
  }

  get header() {
    return { icon: 'grid', title: 'Fleet overview', description: 'Overview of computers, patches, deployments, and configurations across your fleet.' };
  }

  // refit-charts re-runs on this key; returning to Summary (or a data load) re-lays-out the charts.
  get refitKey() { return `${this.i18n?.lang ?? 'en'}:${this.facet}:${this.data ? 1 : 0}`; }

  // Sibling dashboards — rendered in the page header's built-in tab strip.
  get tabs() {
    return [
      { id: 'summary', label: 'Summary', active: this.facet === 'summary' },
      { id: 'security', label: 'Security Dashboard', active: this.facet === 'security' },
      { id: 'zia', label: "Zia's Analysis", active: this.facet === 'zia' },
    ];
  }

  get onSummary() { return this.facet === 'summary'; }
  get facetLabel() { return (this.tabs.find((t) => t.id === this.facet) || {}).label || 'Dashboard'; }

  @action onTabChange(tab) { this.facet = (tab && tab.id) || 'summary'; }
  @action retry() { this.reload(); }

  // ── KPIs + charts (from the fetched record). ──
  get kpis() { return this.data?.kpis ?? []; }

  get osChart()       { return this.data?.charts?.os      ?? EMPTY_CHART; }
  get contactChart()  { return this.data?.charts?.contact ?? EMPTY_CHART; }
  get vulnChart()     { return this.data?.charts?.vuln    ?? EMPTY_CHART; }
  get patchChart()    { return this.data?.charts?.patch   ?? EMPTY_CHART; }
  get imgChart()      { return this.data?.charts?.img     ?? EMPTY_CHART; }
  get healthChart()   { return this.data?.charts?.health  ?? EMPTY_CHART; }
  get deployChart()   { return this.data?.charts?.deploy  ?? EMPTY_CHART; }
  get devtypeChart()  { return this.data?.charts?.devtype ?? EMPTY_CHART; }
  get imgstatChart()  { return this.data?.charts?.imgstat ?? EMPTY_CHART; }
  get driversChart()  { return this.data?.charts?.drivers ?? EMPTY_CHART; }
  get cfgsumChart()   { return this.data?.charts?.cfgsum  ?? EMPTY_CHART; }

  // ── List widgets. Software carries a semantic `tone` → resolve to tokens. ──
  get softwareRows() {
    return (this.data?.lists?.software ?? []).map((r) => ({ ...r, ...(TONE[r.tone] || TONE.info) }));
  }
  get remoteRows() { return this.data?.lists?.remote ?? []; }
  get configRows() { return this.data?.lists?.config ?? []; }

  // ── Software Repository table: columns are structure (local); rows are data. ──
  get repoColumns() {
    return [
      { id: 'name', header: 'Name', accessor: 'name' },
      { id: 'path', header: 'Path', accessor: 'path' },
    ];
  }
  get repoRows() { return this.data?.repo ?? []; }
}
