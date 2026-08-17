import Component from '@glimmer/component';
import { service } from '@ember/service';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';

/**
 * Dashboard view — a saved DEX dashboard rendered (L02), a Patterns::ModuleDashboard
 * instance: the dashboard's KPIs + chart widgets. Data from PrismAPI.dex.dashboard().
 */
const EMPTY_CHART = { categories: [], series: [] };

export default class DashboardViewView extends Component {
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
      this.data = dex ? await dex.dashboard({}) : null;
      if (!this.data) throw new Error('No dashboard data');
    } catch (e) {
      this.error = e;
    } finally {
      this.isLoading = false;
    }
  }

  get header() { return { icon: 'bar-vertical-chart', title: this.data?.name || 'Dashboard', description: 'A saved experience dashboard.' }; }
  get refitKey() { return `${this.i18n?.lang ?? 'en'}:${this.data ? 1 : 0}`; }
  @action retry() { this.reload(); }

  get kpis() { return this.data?.kpis ?? []; }
  get bandChart() { return this.data?.charts?.band ?? EMPTY_CHART; }
  get trendChart() { return this.data?.charts?.trend ?? EMPTY_CHART; }
  get platformChart() { return this.data?.charts?.platform ?? EMPTY_CHART; }
}
