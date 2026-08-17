import Component from '@glimmer/component';
import { service } from '@ember/service';

/**
 * Sensor deployments — a DEX list (L03): sensor deployments to device targets and
 * their run status. A thin Patterns::ListView bound to PrismAPI.dex.sensorDeployments.
 */
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const STATUS_STATE = { Running: 'alert', Completed: 'success', Failed: 'critical', Scheduled: 'default' };

export default class SensorDeploymentView extends Component {
  @service api;

  header = { icon: 'settings-deploy', title: 'Sensor deployments', description: 'Sensor deployments to device targets and their run status.' };
  facets = [{ id: 'status', label: 'Status' }];

  fetch = (params) => this.api.prism.dex.sensorDeployments(params);

  kpis = (k) => [
    { label: 'Deployments', value: k.total, state: 'default', icon: 'settings-deploy' },
    { label: 'Running', value: k.running, state: 'alert', icon: 'refresh' },
    { label: 'Completed', value: k.completed, state: 'success', icon: 'circle-tick' },
    { label: 'Failed', value: k.failed, state: 'critical', icon: 'exclamation-circle' },
  ];

  get columns() {
    return [
      { id: 'sensor', header: 'Sensor', sortable: true, render: (r) => `<span class="cell-name">${esc(r.sensor)}</span>` },
      { id: 'target', header: 'Target', sortable: true, render: (r) => `<span class="cell-muted">${esc(r.target)}</span>` },
      { id: 'devices', header: 'Devices', align: 'end', sortable: true, accessor: 'devices' },
      { id: 'status', header: 'Status', sortable: true, render: (r) => `<ds-badge variant="subtle" state="${STATUS_STATE[r.status] || 'default'}" shape="rounded" size="medium">${esc(r.status)}</ds-badge>` },
      { id: 'started', header: 'Started', sortable: true, render: (r) => esc(r.started) },
    ];
  }
}
