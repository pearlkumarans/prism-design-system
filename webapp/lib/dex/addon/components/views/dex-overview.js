import Component from '@glimmer/component';
import { service } from '@ember/service';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';

/**
 * DEX · Overview — the DEX (dex) tab landing, a native Patterns::ModuleDashboard
 * instance (L02). Fleet-level digital-experience summary: overall experience score,
 * score-band distribution, trend, per-platform/office breakdowns, top issues, and
 * the lowest-scoring devices.
 *
 * One BFF call (PrismAPI.dex.overview() → /dex/api/overview) returns the whole
 * aggregated record, computed from the same dataset the DEX devices list/detail
 * use, so the numbers reconcile. Charts bind via {{config-chart}}; mirrors
 * views/acme-inventory-overview for consistency.
 */
const BAND_STATE = { Good: 'success', Average: 'warning', Poor: 'critical' };
const EMPTY_CHART = { categories: [], series: [] };

export default class DexOverviewView extends Component {
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
      const dex = this.api.prism?.dex;
      this.data = dex ? await dex.overview() : null;
      if (!this.data) throw new Error('No DEX overview data');
    } catch (e) {
      this.error = e;
    } finally {
      this.isLoading = false;
    }
  }

  get header() {
    return {
      icon: 'activity',
      title: 'Digital experience overview',
      description: 'Fleet-wide experience score, trends, and the devices that need attention.',
    };
  }

  get refitKey() { return `${this.i18n?.lang ?? 'en'}:${this.data ? 1 : 0}`; }

  @action retry() { this.reload(); }

  // ── KPIs + charts. ──
  get kpis() { return this.data?.kpis ?? []; }

  get bandChart()       { return this.data?.charts?.band       ?? EMPTY_CHART; }
  get trendChart()      { return this.data?.charts?.trend      ?? EMPTY_CHART; }
  get platformChart()   { return this.data?.charts?.platform   ?? EMPTY_CHART; }
  get officeChart()     { return this.data?.charts?.office     ?? EMPTY_CHART; }
  get onboardingChart() { return this.data?.charts?.onboarding ?? EMPTY_CHART; }

  // ── List widgets. ──
  get issueRows() { return this.data?.lists?.issues ?? []; }
  get lowestRows() {
    return (this.data?.lists?.lowest ?? []).map((d) => ({ ...d, state: BAND_STATE[d.band] || 'default' }));
  }
}
