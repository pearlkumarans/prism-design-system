import Component from '@glimmer/component';
import { service } from '@ember/service';

/**
 * Remote actions — a DEX list (L03): remote actions run on devices (restart, run
 * script, clear cache, …), manual and automated, with their status. A thin
 * Patterns::ListView bound to PrismAPI.dex.remoteActions. Native build (the vanilla
 * projects/dex/layout-remote-actions.html is the design reference).
 */
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const STATUS_STATE = { Completed: 'success', Running: 'alert', Failed: 'critical', Queued: 'default' };
const ACTION_ICON = { Restart: 'refresh', 'Run script': 'terminal-square', 'Clear cache': 'delete', Wake: 'power', 'Flush DNS': 'wifi', 'Kill process': 'close' };

export default class RemoteActionsView extends Component {
  @service api;

  header = {
    icon: 'settings-deploy',
    title: 'Remote actions',
    description: 'Remote actions run on your devices — manual and automated remediation.',
  };
  facets = [
    { id: 'status', label: 'Status' },
    { id: 'type', label: 'Type' },
  ];

  fetch = (params) => this.api.prism.dex.remoteActions(params);

  kpis = (k) => [
    { label: 'Actions', value: k.total, state: 'default', icon: 'settings-deploy' },
    { label: 'Running', value: k.running, state: 'alert', icon: 'refresh' },
    { label: 'Completed', value: k.completed, state: 'success', icon: 'circle-tick' },
    { label: 'Failed', value: k.failed, state: 'critical', icon: 'exclamation-circle' },
  ];

  get columns() {
    return [
      { id: 'action', header: 'Action', sortable: true, render: (r) => `<span class="cell-name"><ds-icon name="${ACTION_ICON[r.action] || 'settings-deploy'}" size="16"></ds-icon>${esc(r.action)}</span>` },
      { id: 'device', header: 'Device', sortable: true, render: (r) => `<span class="cell-name">${esc(r.device)}</span>` },
      { id: 'type', header: 'Type', sortable: true, render: (r) => `<ds-badge variant="subtle" state="${r.type === 'Automated' ? 'info' : 'default'}" shape="rounded" size="medium">${esc(r.type)}</ds-badge>` },
      { id: 'status', header: 'Status', sortable: true, render: (r) => `<ds-badge variant="subtle" state="${STATUS_STATE[r.status] || 'default'}" shape="rounded" size="medium">${esc(r.status)}</ds-badge>` },
      { id: 'initiatedBy', header: 'Initiated by', sortable: true, render: (r) => `<span class="cell-muted">${esc(r.initiatedBy)}</span>` },
      { id: 'time', header: 'When', sortable: true, render: (r) => esc(r.time) },
    ];
  }
}
