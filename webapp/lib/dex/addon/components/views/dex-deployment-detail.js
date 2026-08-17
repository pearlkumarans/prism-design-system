import Component from '@glimmer/component';
import { service } from '@ember/service';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';

/**
 * Deployment detail — a DEX deployment drill-down (L04), a Patterns::ListDetail
 * instance: record header (resource · type/target/status) over an Overview bento
 * (execution-status chart + per-device results). Data from PrismAPI.dex.deployment().
 */
const STATUS_STATUS = { Running: 'alert', Completed: 'success', Failed: 'critical', Scheduled: 'default' };
const RES_STATE = { Completed: 'success', Running: 'alert', Failed: 'critical' };
const EMPTY_CHART = { categories: [], series: [] };

export default class DexDeploymentDetailView extends Component {
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
      this.data = dex ? await dex.deployment({}) : null;
      if (!this.data) throw new Error('No deployment data');
    } catch (e) {
      this.error = e;
    } finally {
      this.isLoading = false;
    }
  }

  get header() { return { icon: 'settings-deploy', title: this.data?.resource || 'Deployment' }; }
  get breadcrumbs() {
    return [{ label: 'DEX', href: '#' }, { label: 'Deployments', href: '#' }, { label: this.data?.resource || 'Deployment' }];
  }
  get summary() {
    const d = this.data || {};
    return [
      { label: 'Type', value: d.resourceType || '—' },
      { label: 'Target', value: d.target || '—' },
      { label: 'Status', value: d.status || '—', status: STATUS_STATUS[d.status] || 'default' },
    ];
  }
  get tabs() {
    return [
      { id: 'overview', label: 'Overview', active: this.facet === 'overview' },
      { id: 'devices', label: 'Devices', active: this.facet === 'devices' },
    ];
  }
  get onOverview() { return this.facet === 'overview'; }
  get facetLabel() { return (this.tabs.find((t) => t.id === this.facet) || {}).label || 'Facet'; }
  get refitKey() { return `${this.facet}:${this.data ? 1 : 0}`; }

  get statusChart() { return this.data?.statusChart || EMPTY_CHART; }
  get resultColumns() {
    return [
      { id: 'device', header: 'Device', accessor: 'device' },
      { id: 'status', header: 'Result', render: (r) => `<ds-badge variant="subtle" state="${RES_STATE[r.status] || 'default'}" shape="rounded" size="medium">${r.status}</ds-badge>` },
      { id: 'when', header: 'When', accessor: 'when' },
    ];
  }
  get resultRows() { return this.data?.results || []; }

  @action onTabChange(tab) { this.facet = (tab && tab.id) || 'overview'; }
  @action onBreadcrumbClick(event) { const a = event.target.closest?.('a[href]'); if (a) event.preventDefault(); }
  @action retry() { this.reload(); }
}
