import Component from '@glimmer/component';
import { service } from '@ember/service';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';

/**
 * DEX · Home — the DEX Manager Plus Home-tab landing (L02), a native
 * Patterns::ModuleDashboard. Replaces the generic EC "Fleet overview" (patches /
 * deployments / configs) that a point product shouldn't show: a DEX product opens
 * on its digital-experience home — overall score, trend, score-range distribution,
 * and high-priority insights. Data from PrismAPI.dex.home() (BFF /dex/api/home).
 */
const SEV_STATE = { Critical: 'critical', High: 'alert', Medium: 'warning', Low: 'default' };
const EMPTY_CHART = { categories: [], series: [] };

export default class DexHomeView extends Component {
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
      this.data = dex ? await dex.home() : null;
      if (!this.data) throw new Error('No DEX home data');
    } catch (e) {
      this.error = e;
    } finally {
      this.isLoading = false;
    }
  }

  get header() {
    return { icon: 'activity', title: 'Home', description: 'Digital experience across your managed devices.' };
  }
  get refitKey() { return `${this.i18n?.lang ?? 'en'}:${this.data ? 1 : 0}`; }

  @action retry() { this.reload(); }

  get kpis() { return this.data?.kpis ?? []; }
  get gaugeChart() { return this.data?.charts?.gauge ?? { value: 0, label: 'out of 100' }; }
  get trendChart() { return this.data?.charts?.trend ?? EMPTY_CHART; }
  get rangeChart() { return this.data?.charts?.range ?? EMPTY_CHART; }
  get insightRows() {
    return (this.data?.insights ?? []).map((i) => ({ ...i, state: SEV_STATE[i.severity] || 'default' }));
  }
}
