import Component from '@glimmer/component';
import { service } from '@ember/service';
import { action } from '@ember/object';

/**
 * Reports — a DEX list (L03): scheduled and on-demand experience reports. A thin
 * Patterns::ListView bound to PrismAPI.dex.reports.
 */
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const FMT_ICON = { PDF: 'file', CSV: 'file', XLSX: 'file' };

export default class ReportsView extends Component {
  @service api;

  header = { icon: 'bar-vertical-chart', title: 'Reports', description: 'Scheduled and on-demand reports on your fleet’s digital experience.' };
  facets = [
    { id: 'type', label: 'Type' },
    { id: 'schedule', label: 'Schedule' },
    { id: 'format', label: 'Format' },
  ];
  bulkActions = [
    { id: 'generate', label: 'Generate', icon: 'refresh' },
    { id: 'delete', label: 'Delete', icon: 'delete' },
  ];

  fetch = (params) => this.api.prism.dex.reports(params);

  kpis = (k) => [
    { label: 'Reports', value: k.total, state: 'default', icon: 'bar-vertical-chart' },
    { label: 'Scheduled', value: k.scheduled, state: 'success', icon: 'clock' },
    { label: 'On demand', value: k.ondemand, state: 'default', icon: 'refresh' },
    { label: 'Types', value: k.types, state: 'default', icon: 'layers' },
  ];

  get columns() {
    return [
      { id: 'name', header: 'Report', sortable: true, render: (r) => `<span class="cell-name"><ds-icon name="${FMT_ICON[r.format] || 'file'}" size="16"></ds-icon>${esc(r.name)}</span>` },
      { id: 'type', header: 'Type', sortable: true, render: (r) => `<span class="cell-muted">${esc(r.type)}</span>` },
      { id: 'schedule', header: 'Schedule', sortable: true, render: (r) => `<ds-badge variant="subtle" state="${r.schedule === 'On demand' ? 'default' : 'info'}" shape="rounded" size="medium">${esc(r.schedule)}</ds-badge>` },
      { id: 'format', header: 'Format', sortable: true, render: (r) => `<span class="cell-muted">${esc(r.format)}</span>` },
      { id: 'lastRun', header: 'Last generated', sortable: true, render: (r) => esc(r.lastRun) },
    ];
  }

  @action onBulkAction(event) {
    const d = event.detail || {}; const n = (d.ids || []).length;
    const toast = (kind, title, desc) => globalThis.dsToast?.[kind]?.({ title, description: desc, style: 'subtle' });
    if (d.id === 'generate') toast('info', 'Report generation queued', `${n} report(s)`);
    else if (d.id === 'delete') toast('info', 'Reports deleted', `${n} report(s)`);
  }
}
