import Component from '@glimmer/component';
import { service } from '@ember/service';
import { action } from '@ember/object';

/**
 * Extensions — the DEX extensions marketplace as a list (L03): integrations,
 * content/sensor packs, and automations, with install status. A thin
 * Patterns::ListView bound to PrismAPI.dex.extensions.
 */
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const CAT_ICON = { Integration: 'data-flow-01', 'Content pack': 'layers', 'Sensor pack': 'speedometer', 'Report pack': 'bar-vertical-chart', Automation: 'settings-deploy' };

export default class ExtensionsView extends Component {
  @service api;

  header = { icon: 'product', title: 'Extensions', description: 'Integrations, content packs, and automations to extend DEX.' };
  facets = [
    { id: 'category', label: 'Category' },
    { id: 'publisher', label: 'Publisher' },
    { id: 'platform', label: 'Platform' },
  ];
  bulkActions = [{ id: 'install', label: 'Install', icon: 'download' }];

  fetch = (params) => this.api.prism.dex.extensions(params);

  kpis = (k) => [
    { label: 'Extensions', value: k.total, state: 'default', icon: 'product' },
    { label: 'Installed', value: k.installed, state: 'success', icon: 'circle-tick' },
    { label: 'Available', value: k.available, state: 'default', icon: 'download' },
    { label: 'Publishers', value: k.publishers, state: 'default', icon: 'building' },
  ];

  get columns() {
    return [
      { id: 'name', header: 'Extension', sortable: true, render: (r) => `<span class="cell-name"><ds-icon name="${CAT_ICON[r.category] || 'product'}" size="16"></ds-icon>${esc(r.name)}</span>` },
      { id: 'publisher', header: 'Publisher', sortable: true, render: (r) => `<span class="cell-muted">${esc(r.publisher)}</span>` },
      { id: 'category', header: 'Category', sortable: true, render: (r) => `<span class="cell-muted">${esc(r.category)}</span>` },
      { id: 'platform', header: 'Platform', sortable: true, render: (r) => `<span class="cell-muted">${esc(r.platform)}</span>` },
      { id: 'installed', header: 'Status', sortable: true, render: (r) => (r.installed ? `<ds-badge variant="subtle" state="success" shape="rounded" size="medium">Installed</ds-badge>` : `<ds-badge variant="subtle" state="default" shape="rounded" size="medium">Available</ds-badge>`) },
      { id: 'version', header: 'Version', sortable: true, render: (r) => `<span class="cell-muted">${esc(r.version)}</span>` },
    ];
  }

  @action onBulkAction(event) {
    const d = event.detail || {}; const n = (d.ids || []).length;
    const toast = (kind, title, desc) => globalThis.dsToast?.[kind]?.({ title, description: desc, style: 'subtle' });
    if (d.id === 'install') toast('success', 'Extensions installed', `${n} extension(s)`);
  }
}
