import Component from '@glimmer/component';
import { service } from '@ember/service';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';

/**
 * Workflow detail — a DEX workflow drill-down (L04), a Patterns::ListDetail
 * instance: record header (workflow · trigger/status/runs) over an Overview bento
 * (the step flow + recent runs). Data from PrismAPI.dex.workflow().
 */
const KIND_STATE = { Trigger: 'info', Condition: 'warning', Action: 'success' };
const KIND_ICON = { Trigger: 'play-circle', Condition: 'property-slider', Action: 'settings-deploy' };
const RUN_STATE = { Completed: 'success', Failed: 'critical', Running: 'alert' };

export default class WorkflowDetailView extends Component {
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
      this.data = dex ? await dex.workflow({}) : null;
      if (!this.data) throw new Error('No workflow data');
    } catch (e) {
      this.error = e;
    } finally {
      this.isLoading = false;
    }
  }

  get header() { return { icon: 'data-flow-01', title: this.data?.name || 'Workflow' }; }
  get breadcrumbs() {
    return [{ label: 'DEX', href: '#' }, { label: 'Workflows', href: '#' }, { label: this.data?.name || 'Workflow' }];
  }
  get summary() {
    const d = this.data || {};
    return [
      { label: 'Trigger', value: d.trigger || '—' },
      { label: 'Status', value: d.status || '—', status: d.status === 'Enabled' ? 'success' : d.status === 'Draft' ? 'warning' : 'default' },
      { label: 'Runs', value: String(d.runs ?? '—') },
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

  get steps() {
    return (this.data?.steps || []).map((s) => ({ ...s, state: KIND_STATE[s.kind] || 'default', icon: KIND_ICON[s.kind] || 'circle' }));
  }
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
