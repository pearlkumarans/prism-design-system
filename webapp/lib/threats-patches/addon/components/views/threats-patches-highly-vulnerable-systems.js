import Component from '@glimmer/component';
import { service } from '@ember/service';
import { action } from '@ember/object';

/**
 * Highly Vulnerable Systems — the Threats & Patches landing (L03 list), a thin
 * Patterns::ListView instance bound to PrismAPI.threatsPatches.highlyVulnerableSystems.
 * Config only; the pattern owns the server-driven-table machinery. (The catalog's
 * legacy file for this slug was missing, so this is a native build, not a port.)
 */
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const RISK_STATE = { Critical: 'critical', High: 'alert', Medium: 'warning', Low: 'default' };
const OS_ICON = { Windows: 'microsoft', Ubuntu: 'terminal-square', RHEL: 'terminal-square', macOS: 'apple' };
const osIcon = (os) => OS_ICON[(os || '').split(' ')[0]] || 'computer';

export default class ThreatsPatchesHighlyVulnerableSystems extends Component {
  @service api;

  header = {
    icon: 'bug',
    title: 'Highly vulnerable systems',
    description: 'Systems ranked by vulnerability and missing-patch risk across your fleet.',
  };
  facets = [
    { id: 'risk', label: 'Risk' },
    { id: 'os', label: 'OS' },
    { id: 'group', label: 'Group' },
  ];
  bulkActions = [
    { id: 'scan', label: 'Scan now', icon: 'refresh' },
    { id: 'deploy', label: 'Deploy patches', icon: 'settings-deploy' },
  ];

  fetch = (params) => this.api.prism.threatsPatches.highlyVulnerableSystems(params);

  kpis = (k) => [
    { label: 'Vulnerable systems', value: k.total, state: 'default', icon: 'computer' },
    { label: 'Critical', value: k.critical, state: 'alert', icon: 'exclamation-circle' },
    { label: 'High', value: k.high, state: 'warning', icon: 'exclamation-triangle' },
    { label: 'Exploitable', value: k.exploitable, state: 'critical', icon: 'shield' },
  ];

  get columns() {
    return [
      { id: 'name', header: 'System', sortable: true, render: (r) => `<span class="cell-name"><ds-icon name="${osIcon(r.os)}" size="16"></ds-icon>${esc(r.name)}</span>` },
      { id: 'os', header: 'OS', sortable: true, render: (r) => `<span class="cell-muted">${esc(r.os)}</span>` },
      { id: 'risk', header: 'Risk', sortable: true, render: (r) => `<ds-badge variant="subtle" state="${RISK_STATE[r.risk] || 'default'}" shape="rounded" size="medium">${esc(r.risk)}</ds-badge>` },
      { id: 'vulnerabilities', header: 'Vulnerabilities', align: 'end', sortable: true, accessor: 'vulnerabilities' },
      { id: 'missingPatches', header: 'Missing patches', align: 'end', sortable: true, accessor: 'missingPatches' },
      { id: 'exploitable', header: 'Exploitable', align: 'end', sortable: true, render: (r) => (r.exploitable > 0 ? `<ds-badge variant="subtle" state="critical" shape="rounded" size="medium">${r.exploitable}</ds-badge>` : `<span class="cell-muted">0</span>`) },
      { id: 'group', header: 'Group', sortable: true, render: (r) => `<span class="cell-muted">${esc(r.group)}</span>` },
      { id: 'lastScan', header: 'Last scan', sortable: true, render: (r) => esc(r.lastScan) },
    ];
  }

  @action onBulkAction(event) {
    const d = event.detail || {}; const n = (d.ids || []).length;
    const toast = (kind, title, desc) => globalThis.dsToast?.[kind]?.({ title, description: desc, style: 'subtle' });
    if (d.id === 'scan') toast('info', 'Scan queued', `${n} system(s)`);
    else if (d.id === 'deploy') toast('success', 'Patch deployment queued', `${n} system(s)`);
  }
}
