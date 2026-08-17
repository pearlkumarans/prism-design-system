import Component from '@glimmer/component';
import { service } from '@ember/service';
import { action } from '@ember/object';

/**
 * Dashboards — a DEX list (L03): saved experience dashboards. A thin
 * Patterns::ListView bound to PrismAPI.dex.dashboards.
 */
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

export default class DashboardsView extends Component {
  @service api;

  header = { icon: 'bar-vertical-chart', title: 'Dashboards', description: 'Saved experience dashboards you and your team have built.' };
  facets = [{ id: 'owner', label: 'Owner' }];
  bulkActions = [
    { id: 'share', label: 'Share', icon: 'share-01' },
    { id: 'delete', label: 'Delete', icon: 'delete' },
  ];

  fetch = (params) => this.api.prism.dex.dashboards(params);

  kpis = (k) => [
    { label: 'Dashboards', value: k.total, state: 'default', icon: 'bar-vertical-chart' },
    { label: 'Shared', value: k.shared, state: 'success', icon: 'share-01' },
    { label: 'Mine', value: k.mine, state: 'default', icon: 'user' },
    { label: 'Widgets', value: k.widgets, state: 'default', icon: 'grid' },
  ];

  get columns() {
    return [
      { id: 'name', header: 'Dashboard', sortable: true, render: (r) => `<span class="cell-name"><ds-icon name="bar-vertical-chart" size="16"></ds-icon>${esc(r.name)}</span>` },
      { id: 'owner', header: 'Owner', sortable: true, render: (r) => `<span class="cell-muted">${esc(r.owner)}</span>` },
      { id: 'widgets', header: 'Widgets', align: 'end', sortable: true, accessor: 'widgets' },
      { id: 'shared', header: 'Shared', sortable: true, render: (r) => (r.shared ? `<ds-badge variant="subtle" state="success" shape="rounded" size="medium">Shared</ds-badge>` : `<span class="cell-muted">Private</span>`) },
      { id: 'modified', header: 'Modified', sortable: true, render: (r) => esc(r.modified) },
    ];
  }

  @action onBulkAction(event) {
    const d = event.detail || {}; const n = (d.ids || []).length;
    const toast = (kind, title, desc) => globalThis.dsToast?.[kind]?.({ title, description: desc, style: 'subtle' });
    if (d.id === 'share') toast('success', 'Dashboards shared', `${n} dashboard(s)`);
    else if (d.id === 'delete') toast('info', 'Dashboards deleted', `${n} dashboard(s)`);
  }
}
