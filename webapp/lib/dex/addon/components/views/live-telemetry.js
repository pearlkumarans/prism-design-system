import Component from '@glimmer/component';
import { service } from '@ember/service';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';

/**
 * Live telemetry — per-device real-time metric feed (L04), a Patterns::ListDetail
 * instance: record header (device · current CPU/mem/disk) over a bento of CPU /
 * memory / disk / network time-series + top processes. Data from
 * PrismAPI.dex.telemetry().
 */
const EMPTY_CHART = { categories: [], series: [] };

export default class LiveTelemetryView extends Component {
  @service api;

  @tracked data = null;
  @tracked isLoading = true;
  @tracked error = null;
  @tracked facet = 'live';

  constructor() {
    super(...arguments);
    this.reload();
  }

  async reload() {
    this.isLoading = true;
    this.error = null;
    try {
      const dex = this.api.prism?.dex;
      this.data = dex ? await dex.telemetry({}) : null;
      if (!this.data) throw new Error('No telemetry data');
    } catch (e) {
      this.error = e;
    } finally {
      this.isLoading = false;
    }
  }

  get device() { return this.data?.device || 'Device'; }
  get header() { return { icon: 'activity', title: this.device }; }
  get breadcrumbs() {
    return [{ label: 'DEX', href: '#' }, { label: 'Devices', href: '#' }, { label: this.device, href: '#' }, { label: 'Live telemetry' }];
  }
  get summary() {
    const c = this.data?.current || {};
    return [
      { label: 'CPU', value: c.cpu != null ? `${c.cpu}%` : '—', status: c.cpu > 80 ? 'critical' : c.cpu > 60 ? 'warning' : 'success' },
      { label: 'Memory', value: c.mem != null ? `${c.mem}%` : '—', status: c.mem > 85 ? 'critical' : c.mem > 70 ? 'warning' : 'success' },
      { label: 'Disk I/O', value: c.disk != null ? `${c.disk}%` : '—' },
    ];
  }
  get tabs() {
    return [
      { id: 'live', label: 'Live', active: this.facet === 'live' },
      { id: 'processes', label: 'Processes', active: this.facet === 'processes' },
    ];
  }
  get onLive() { return this.facet === 'live'; }
  get facetLabel() { return (this.tabs.find((t) => t.id === this.facet) || {}).label || 'Facet'; }
  get refitKey() { return `${this.facet}:${this.data ? 1 : 0}`; }

  get cpuChart() { return this.data?.series?.cpu || EMPTY_CHART; }
  get memChart() { return this.data?.series?.mem || EMPTY_CHART; }
  get diskChart() { return this.data?.series?.disk || EMPTY_CHART; }
  get netChart() { return this.data?.series?.net || EMPTY_CHART; }

  get processColumns() {
    return [
      { id: 'name', header: 'Process', accessor: 'name' },
      { id: 'cpu', header: 'CPU %', accessor: 'cpu', align: 'end' },
      { id: 'mem', header: 'Memory %', accessor: 'mem', align: 'end' },
    ];
  }
  get processRows() { return this.data?.processes || []; }

  @action onTabChange(tab) { this.facet = (tab && tab.id) || 'live'; }
  @action onBreadcrumbClick(event) { const a = event.target.closest?.('a[href]'); if (a) event.preventDefault(); }
  @action retry() { this.reload(); }
}
