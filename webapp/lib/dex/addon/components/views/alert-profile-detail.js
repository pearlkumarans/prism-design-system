import Component from '@glimmer/component';
import { service } from '@ember/service';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';

/**
 * Alert profile detail — a DEX alert-profile config view (L04), a Patterns::ListDetail
 * instance: record header (profile · status) over an Overview bento (alert rules,
 * targets, notification). Data from PrismAPI.dex.alertProfile().
 */
const SEV_STATE = { Critical: 'critical', High: 'alert', Medium: 'warning', Low: 'default' };

export default class AlertProfileDetailView extends Component {
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
      this.data = dex ? await dex.alertProfile({}) : null;
      if (!this.data) throw new Error('No alert profile data');
    } catch (e) {
      this.error = e;
    } finally {
      this.isLoading = false;
    }
  }

  get header() { return { icon: 'notification', title: this.data?.name || 'Alert profile' }; }
  get breadcrumbs() {
    return [{ label: 'DEX', href: '#' }, { label: 'Alert profiles', href: '#' }, { label: this.data?.name || 'Alert profile' }];
  }
  get summary() {
    const d = this.data || {};
    return [
      { label: 'Status', value: d.status || '—', status: d.status === 'Enabled' ? 'success' : 'default' },
      { label: 'Rules', value: String((d.rules || []).length) },
      { label: 'Targets', value: String((d.targets || []).length) },
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

  get description() { return this.data?.description || ''; }
  get ruleColumns() {
    return [
      { id: 'metric', header: 'Metric', accessor: 'metric' },
      { id: 'condition', header: 'Condition', accessor: 'condition' },
      { id: 'severity', header: 'Severity', render: (r) => `<ds-badge variant="subtle" state="${SEV_STATE[r.severity] || 'default'}" shape="rounded" size="medium">${r.severity}</ds-badge>` },
    ];
  }
  get ruleRows() { return this.data?.rules || []; }
  get targets() { return this.data?.targets || []; }
  get notificationItems() { return this.data?.notification || []; }

  @action onTabChange(tab) { this.facet = (tab && tab.id) || 'overview'; }
  @action onBreadcrumbClick(event) { const a = event.target.closest?.('a[href]'); if (a) event.preventDefault(); }
  @action retry() { this.reload(); }
}
