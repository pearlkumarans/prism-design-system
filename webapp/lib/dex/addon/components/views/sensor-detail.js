import Component from '@glimmer/component';
import { service } from '@ember/service';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';

/**
 * Sensor detail — a DEX sensor drill-down (L04), a Patterns::ListDetail instance:
 * record header (sensor · type/platform/status) over an Overview bento (script,
 * targets, recent runs). Data from PrismAPI.dex.sensor().
 */
const RUN_STATE = { Completed: 'success', Failed: 'critical', Running: 'alert' };

export default class SensorDetailView extends Component {
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
      this.data = dex ? await dex.sensor({}) : null;
      if (!this.data) throw new Error('No sensor data');
    } catch (e) {
      this.error = e;
    } finally {
      this.isLoading = false;
    }
  }

  get header() { return { icon: 'speedometer', title: this.data?.name || 'Sensor' }; }
  get breadcrumbs() {
    return [{ label: 'DEX', href: '#' }, { label: 'Sensors', href: '#' }, { label: this.data?.name || 'Sensor' }];
  }
  get summary() {
    const d = this.data || {};
    return [
      { label: 'Type', value: d.type || '—' },
      { label: 'Platform', value: d.platform || '—' },
      { label: 'Status', value: d.status || '—', status: d.status === 'Enabled' ? 'success' : 'default' },
    ];
  }
  get tabs() {
    return [
      { id: 'overview', label: 'Overview', active: this.facet === 'overview' },
      { id: 'runs', label: 'Runs', active: this.facet === 'runs' },
    ];
  }
  get onOverview() { return this.facet === 'overview'; }
  get facetLabel() { return (this.tabs.find((t) => t.id === this.facet) || {}).label || 'Facet'; }
  get refitKey() { return `${this.facet}:${this.data ? 1 : 0}`; }

  get script() { return this.data?.script || ''; }
  get targets() { return this.data?.targets || []; }
  get runColumns() {
    return [
      { id: 'started', header: 'Started', accessor: 'started' },
      { id: 'status', header: 'Status', render: (r) => `<ds-badge variant="subtle" state="${RUN_STATE[r.status] || 'default'}" shape="rounded" size="medium">${r.status}</ds-badge>` },
      { id: 'devices', header: 'Devices', accessor: 'devices', align: 'end' },
      { id: 'duration', header: 'Duration', accessor: 'duration', align: 'end' },
    ];
  }
  get runRows() { return this.data?.runs || []; }

  @action onTabChange(tab) { this.facet = (tab && tab.id) || 'overview'; }
  @action onBreadcrumbClick(event) { const a = event.target.closest?.('a[href]'); if (a) event.preventDefault(); }
  @action retry() { this.reload(); }
}
