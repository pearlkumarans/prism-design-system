import Component from '@glimmer/component';
import { service } from '@ember/service';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';

/**
 * Alert detail — a DEX alert drill-down (L04), a Patterns::ListDetail instance:
 * record header (alert identity · severity/device/status) over an Overview bento
 * (event timeline + affected devices). Data from PrismAPI.dex.alert().
 */
const SEV_STATUS = { Critical: 'critical', High: 'alert', Medium: 'warning', Low: 'success' };
const STATUS_STATUS = { Active: 'alert', Acknowledged: 'warning', Resolved: 'success' };

export default class AlertDetailView extends Component {
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
      this.data = dex ? await dex.alert({}) : null;
      if (!this.data) throw new Error('No alert data');
    } catch (e) {
      this.error = e;
    } finally {
      this.isLoading = false;
    }
  }

  get header() { return { icon: 'notification', title: this.data?.title || 'Alert' }; }
  get breadcrumbs() {
    return [{ label: 'DEX', href: '#' }, { label: 'Alerts', href: '#' }, { label: this.data?.title || 'Alert' }];
  }
  get summary() {
    const d = this.data || {};
    return [
      { label: 'Severity', value: d.severity || '—', status: SEV_STATUS[d.severity] || 'default' },
      { label: 'Device', value: d.device || '—' },
      { label: 'Status', value: d.status || '—', status: STATUS_STATUS[d.status] || 'default' },
    ];
  }
  get tabs() {
    return [
      { id: 'overview', label: 'Overview', active: this.facet === 'overview' },
      { id: 'devices', label: 'Affected devices', active: this.facet === 'devices' },
    ];
  }
  get onOverview() { return this.facet === 'overview'; }
  get facetLabel() { return (this.tabs.find((t) => t.id === this.facet) || {}).label || 'Facet'; }
  get refitKey() { return `${this.facet}:${this.data ? 1 : 0}`; }

  get timeline() { return this.data?.timeline || []; }
  get deviceColumns() {
    return [
      { id: 'name', header: 'Device', accessor: 'name' },
      { id: 'platform', header: 'Platform', accessor: 'platform' },
      { id: 'score', header: 'Experience score', accessor: 'score', align: 'end' },
    ];
  }
  get deviceRows() { return this.data?.devices || []; }

  @action onTabChange(tab) { this.facet = (tab && tab.id) || 'overview'; }
  @action onBreadcrumbClick(event) { const a = event.target.closest?.('a[href]'); if (a) event.preventDefault(); }
  @action retry() { this.reload(); }
}
