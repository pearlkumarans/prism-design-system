import Component from '@glimmer/component';
import { service } from '@ember/service';

/**
 * Experience insights — a DEX list (L03): experience issues detected across the
 * fleet (disk latency, high CPU, slow logon, …), ranked by severity. A thin
 * Patterns::ListView bound to PrismAPI.dex.insights. Native build (the vanilla
 * projects/dex/layout-experience-insights.html is the design reference).
 */
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const SEV_STATE = { Critical: 'critical', High: 'alert', Medium: 'warning', Low: 'default' };
const STATUS_STATE = { Active: 'alert', Monitoring: 'warning', Resolved: 'success' };
const IMPACT_STATE = { High: 'critical', Medium: 'warning', Low: 'default' };
const CAT_ICON = { Disk: 'hard-disk', CPU: 'cpu-chip', Memory: 'activity', Network: 'wifi', Boot: 'clock', 'App crashes': 'exclamation-triangle' };

export default class ExperienceInsightsView extends Component {
  @service api;

  header = {
    icon: 'light-bulb',
    title: 'Experience insights',
    description: 'Experience issues detected across your fleet, ranked by severity.',
  };
  facets = [
    { id: 'category', label: 'Category' },
    { id: 'severity', label: 'Severity' },
    { id: 'status', label: 'Status' },
  ];

  fetch = (params) => this.api.prism.dex.insights(params);

  kpis = (k) => [
    { label: 'Insights', value: k.total, state: 'default', icon: 'light-bulb' },
    { label: 'Critical', value: k.critical, state: 'critical', icon: 'exclamation-circle' },
    { label: 'Devices affected', value: k.affected, state: 'warning', icon: 'computer' },
    { label: 'Active', value: k.active, state: 'alert', icon: 'activity' },
  ];

  get columns() {
    return [
      { id: 'title', header: 'Insight', sortable: true, render: (r) => `<span class="cell-name"><ds-icon name="${CAT_ICON[r.category] || 'light-bulb'}" size="16"></ds-icon>${esc(r.title)}</span>` },
      { id: 'category', header: 'Category', sortable: true, render: (r) => `<span class="cell-muted">${esc(r.category)}</span>` },
      { id: 'severity', header: 'Severity', sortable: true, render: (r) => `<ds-badge variant="subtle" state="${SEV_STATE[r.severity] || 'default'}" shape="rounded" size="medium">${esc(r.severity)}</ds-badge>` },
      { id: 'affected', header: 'Devices', align: 'end', sortable: true, accessor: 'affected' },
      { id: 'impact', header: 'Impact', sortable: true, render: (r) => `<ds-badge variant="subtle" state="${IMPACT_STATE[r.impact] || 'default'}" shape="rounded" size="medium">${esc(r.impact)}</ds-badge>` },
      { id: 'status', header: 'Status', sortable: true, render: (r) => `<ds-badge variant="subtle" state="${STATUS_STATE[r.status] || 'default'}" shape="rounded" size="medium">${esc(r.status)}</ds-badge>` },
      { id: 'detected', header: 'Detected', sortable: true, render: (r) => esc(r.detected) },
    ];
  }
}
