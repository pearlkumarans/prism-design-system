import Component from '@glimmer/component';
import { service } from '@ember/service';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';

/**
 * Sensor run — a DEX sensor run-log drill-down (L04), a Patterns::ListDetail
 * instance: record header (run · status/devices/duration) over an Overview bento
 * (run output + per-device results). Data from PrismAPI.dex.sensorRun().
 */
const RES_STATE = { Succeeded: 'success', Failed: 'critical' };

export default class SensorRunView extends Component {
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
      this.data = dex ? await dex.sensorRun({}) : null;
      if (!this.data) throw new Error('No sensor run data');
    } catch (e) {
      this.error = e;
    } finally {
      this.isLoading = false;
    }
  }

  get header() { return { icon: 'terminal-square', title: this.data ? `${this.data.sensor} — run log` : 'Run log' }; }
  get breadcrumbs() {
    return [{ label: 'DEX', href: '#' }, { label: 'Sensors', href: '#' }, { label: this.data?.sensor || 'Sensor', href: '#' }, { label: 'Run log' }];
  }
  get summary() {
    const d = this.data || {};
    return [
      { label: 'Status', value: d.status || '—', status: d.status === 'Completed' ? 'success' : d.status === 'Failed' ? 'critical' : 'default' },
      { label: 'Devices', value: String(d.stats?.devices ?? '—') },
      { label: 'Duration', value: d.duration || '—' },
    ];
  }
  get tabs() {
    return [
      { id: 'overview', label: 'Overview', active: this.facet === 'overview' },
      { id: 'results', label: 'Results', active: this.facet === 'results' },
    ];
  }
  get onOverview() { return this.facet === 'overview'; }
  get facetLabel() { return (this.tabs.find((t) => t.id === this.facet) || {}).label || 'Facet'; }
  get refitKey() { return `${this.facet}:${this.data ? 1 : 0}`; }

  get output() { return this.data?.output || ''; }
  get resultColumns() {
    return [
      { id: 'device', header: 'Device', accessor: 'device' },
      { id: 'status', header: 'Result', render: (r) => `<ds-badge variant="subtle" state="${RES_STATE[r.status] || 'default'}" shape="rounded" size="medium">${r.status}</ds-badge>` },
      { id: 'value', header: 'Value', accessor: 'value', align: 'end' },
      { id: 'when', header: 'When', accessor: 'when' },
    ];
  }
  get resultRows() { return this.data?.results || []; }

  @action onTabChange(tab) { this.facet = (tab && tab.id) || 'overview'; }
  @action onBreadcrumbClick(event) { const a = event.target.closest?.('a[href]'); if (a) event.preventDefault(); }
  @action retry() { this.reload(); }
}
