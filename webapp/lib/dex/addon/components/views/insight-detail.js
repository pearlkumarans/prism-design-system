import Component from '@glimmer/component';
import { service } from '@ember/service';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';

/**
 * Insight detail — a DEX experience-insight drill-down (L04), a Patterns::ListDetail
 * instance: record header (insight identity · category/severity summary · facet tabs)
 * over an Overview bento (affected-devices trend, contributing factors, affected
 * devices, remediation). Data from PrismAPI.dex.insight(); this base fetches by id
 * (insight-cpu overrides insightParams for the CPU-specialised record).
 */
const SEV_STATUS = { Critical: 'critical', High: 'alert', Medium: 'warning', Low: 'success' };
const EMPTY_CHART = { categories: [], series: [] };

export default class InsightDetailView extends Component {
  @service api;

  @tracked data = null;
  @tracked isLoading = true;
  @tracked error = null;
  @tracked facet = 'overview';

  constructor() {
    super(...arguments);
    this.reload();
  }

  // insight-cpu overrides this to fetch the CPU-specialised record.
  get insightParams() { return {}; }

  async reload() {
    this.isLoading = true;
    this.error = null;
    try {
      const dex = this.api.prism?.dex;
      this.data = dex ? await dex.insight(this.insightParams) : null;
      if (!this.data) throw new Error('No insight data');
    } catch (e) {
      this.error = e;
    } finally {
      this.isLoading = false;
    }
  }

  get headerIcon() { return 'light-bulb'; }
  get header() { return { icon: this.headerIcon, title: this.data?.title || 'Insight' }; }
  get breadcrumbs() {
    return [{ label: 'DEX', href: '#' }, { label: 'Insights', href: '#' }, { label: this.data?.title || 'Insight' }];
  }
  get summary() {
    const d = this.data || {};
    return [
      { label: 'Category', value: d.category || '—' },
      { label: 'Severity', value: d.severity || '—', status: SEV_STATUS[d.severity] || 'default' },
      { label: 'Devices affected', value: String(d.affected ?? '—') },
    ];
  }
  get tabs() {
    return [
      { id: 'overview', label: 'Overview', active: this.facet === 'overview' },
      { id: 'devices', label: 'Affected devices', active: this.facet === 'devices' },
      { id: 'remediation', label: 'Remediation', active: this.facet === 'remediation' },
    ];
  }
  get onOverview() { return this.facet === 'overview'; }
  get facetLabel() { return (this.tabs.find((t) => t.id === this.facet) || {}).label || 'Facet'; }
  get refitKey() { return `${this.facet}:${this.data ? 1 : 0}`; }

  get trendChart() { return this.data?.trend || EMPTY_CHART; }
  get factorsChart() { return this.data?.factors || EMPTY_CHART; }
  get deviceColumns() {
    return [
      { id: 'name', header: 'Device', accessor: 'name' },
      { id: 'platform', header: 'Platform', accessor: 'platform' },
      { id: 'score', header: 'Score', accessor: 'score', align: 'end' },
      { id: 'impact', header: 'Impact', accessor: 'impact' },
    ];
  }
  get deviceRows() { return this.data?.devices || []; }
  get remediationRows() { return this.data?.remediation || []; }

  @action onTabChange(tab) { this.facet = (tab && tab.id) || 'overview'; }
  @action onBreadcrumbClick(event) { const a = event.target.closest?.('a[href]'); if (a) event.preventDefault(); }
  @action retry() { this.reload(); }
}
