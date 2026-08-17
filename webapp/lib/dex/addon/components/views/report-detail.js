import Component from '@glimmer/component';
import { service } from '@ember/service';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';

/**
 * Report detail — a DEX report drill-down (L04), a Patterns::ListDetail instance:
 * record header (report · type/schedule/format) over an Overview bento (trend chart,
 * report parameters, metric table). Data from PrismAPI.dex.report().
 */
const EMPTY_CHART = { categories: [], series: [] };

export default class ReportDetailView extends Component {
  @service api;

  @tracked data = null;
  @tracked isLoading = true;
  @tracked error = null;
  @tracked facet = 'overview';

  constructor() {
    super(...arguments);
    this.reload();
  }

  async reload() {
    this.isLoading = true;
    this.error = null;
    try {
      const dex = this.api.prism?.dex;
      this.data = dex ? await dex.report({}) : null;
      if (!this.data) throw new Error('No report data');
    } catch (e) {
      this.error = e;
    } finally {
      this.isLoading = false;
    }
  }

  get header() { return { icon: 'bar-vertical-chart', title: this.data?.name || 'Report' }; }
  get breadcrumbs() {
    return [{ label: 'DEX', href: '#' }, { label: 'Reports', href: '#' }, { label: this.data?.name || 'Report' }];
  }
  get summary() {
    const d = this.data || {};
    return [
      { label: 'Type', value: d.type || '—' },
      { label: 'Schedule', value: d.schedule || '—' },
      { label: 'Format', value: d.format || '—' },
    ];
  }
  get tabs() {
    return [
      { id: 'overview', label: 'Overview', active: this.facet === 'overview' },
      { id: 'history', label: 'History', active: this.facet === 'history' },
    ];
  }
  get onOverview() { return this.facet === 'overview'; }
  get facetLabel() { return (this.tabs.find((t) => t.id === this.facet) || {}).label || 'Facet'; }
  get refitKey() { return `${this.facet}:${this.data ? 1 : 0}`; }

  get chart() { return this.data?.chart || EMPTY_CHART; }
  get paramItems() { return this.data?.summary || []; }
  get metricColumns() {
    return [
      { id: 'metric', header: 'Metric', accessor: 'metric' },
      { id: 'value', header: 'Value', accessor: 'value', align: 'end' },
      { id: 'change', header: 'Change', accessor: 'change', align: 'end' },
    ];
  }
  get metricRows() { return this.data?.rows || []; }

  @action onTabChange(tab) { this.facet = (tab && tab.id) || 'overview'; }
  @action onBreadcrumbClick(event) { const a = event.target.closest?.('a[href]'); if (a) event.preventDefault(); }
  @action retry() { this.reload(); }
}
