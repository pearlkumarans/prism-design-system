import Component from '@glimmer/component';
import { service } from '@ember/service';
import { action } from '@ember/object';

/**
 * Alerts — a DEX list (L03): experience alerts raised by alert profiles, with
 * severity/status and bulk acknowledge/resolve. A thin Patterns::ListView bound to
 * PrismAPI.dex.alerts. Native build (projects/dex/layout-alerts.html is the reference).
 */
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const SEV_STATE = { Critical: 'critical', High: 'alert', Medium: 'warning', Low: 'default' };
const STATUS_STATE = { Active: 'alert', Acknowledged: 'warning', Resolved: 'success' };

export default class AlertsView extends Component {
  @service api;

  header = {
    icon: 'notification',
    title: 'Alerts',
    description: 'Experience alerts raised across your fleet by alert profiles.',
  };
  facets = [
    { id: 'severity', label: 'Severity' },
    { id: 'status', label: 'Status' },
    { id: 'profile', label: 'Profile' },
  ];
  bulkActions = [
    { id: 'ack', label: 'Acknowledge', icon: 'circle-tick' },
    { id: 'resolve', label: 'Resolve', icon: 'check' },
  ];

  fetch = (params) => this.api.prism.dex.alerts(params);

  kpis = (k) => [
    { label: 'Alerts', value: k.total, state: 'default', icon: 'notification' },
    { label: 'Critical', value: k.critical, state: 'critical', icon: 'exclamation-circle' },
    { label: 'Active', value: k.active, state: 'alert', icon: 'activity' },
    { label: 'Acknowledged', value: k.acknowledged, state: 'warning', icon: 'clock' },
  ];

  get columns() {
    return [
      { id: 'title', header: 'Alert', sortable: true, render: (r) => `<span class="cell-name">${esc(r.title)}</span>` },
      { id: 'severity', header: 'Severity', sortable: true, render: (r) => `<ds-badge variant="subtle" state="${SEV_STATE[r.severity] || 'default'}" shape="rounded" size="medium">${esc(r.severity)}</ds-badge>` },
      { id: 'device', header: 'Device', sortable: true, render: (r) => `<span class="cell-name">${esc(r.device)}</span>` },
      { id: 'status', header: 'Status', sortable: true, render: (r) => `<ds-badge variant="subtle" state="${STATUS_STATE[r.status] || 'default'}" shape="rounded" size="medium">${esc(r.status)}</ds-badge>` },
      { id: 'profile', header: 'Profile', sortable: true, render: (r) => `<span class="cell-muted">${esc(r.profile)}</span>` },
      { id: 'triggered', header: 'Triggered', sortable: true, render: (r) => esc(r.triggered) },
    ];
  }

  @action onBulkAction(event) {
    const d = event.detail || {}; const n = (d.ids || []).length;
    const toast = (kind, title, desc) => globalThis.dsToast?.[kind]?.({ title, description: desc, style: 'subtle' });
    if (d.id === 'ack') toast('info', 'Alerts acknowledged', `${n} alert(s)`);
    else if (d.id === 'resolve') toast('success', 'Alerts resolved', `${n} alert(s)`);
  }
}
