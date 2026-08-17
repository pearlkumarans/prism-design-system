import Component from '@glimmer/component';
import { service } from '@ember/service';
import { action } from '@ember/object';

/**
 * Missing Patches — a Threats & Patches list (L03): patches missing across the
 * fleet, ranked by severity, with approval + deployment bulk actions. A thin
 * Patterns::ListView instance bound to PrismAPI.threatsPatches.missingPatches;
 * the pattern owns the server-driven-table machinery. The catalog's legacy file
 * for this slug was a stub, so this is a native build.
 */
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const SEV_STATE = { Critical: 'critical', Important: 'alert', Moderate: 'warning', Low: 'default' };
const APPROVAL_STATE = { Approved: 'success', 'Not approved': 'warning', Declined: 'default' };
const PLATFORM_ICON = { Windows: 'microsoft', macOS: 'apple', Linux: 'terminal-square' };

export default class MissingPatchesView extends Component {
  @service api;

  header = {
    icon: 'patch',
    title: 'Missing patches',
    description: 'Patches missing across your managed systems, ranked by severity.',
  };
  facets = [
    { id: 'severity', label: 'Severity' },
    { id: 'vendor', label: 'Vendor' },
    { id: 'approval', label: 'Approval' },
    { id: 'platform', label: 'Platform' },
  ];
  bulkActions = [
    { id: 'approve', label: 'Approve', icon: 'circle-tick' },
    { id: 'deploy', label: 'Deploy patches', icon: 'settings-deploy' },
  ];

  fetch = (params) => this.api.prism.threatsPatches.missingPatches(params);

  kpis = (k) => [
    { label: 'Missing patches', value: k.total, state: 'default', icon: 'patch' },
    { label: 'Critical', value: k.critical, state: 'critical', icon: 'exclamation-circle' },
    { label: 'Systems affected', value: k.systemsAffected, state: 'warning', icon: 'computer' },
    { label: 'Pending approval', value: k.pendingApproval, state: 'alert', icon: 'clock' },
  ];

  get columns() {
    return [
      { id: 'bulletinId', header: 'Bulletin', sortable: true, render: (r) => `<span class="cell-name">${esc(r.bulletinId)}</span>` },
      { id: 'title', header: 'Patch', sortable: true, render: (r) => esc(r.title) },
      { id: 'severity', header: 'Severity', sortable: true, render: (r) => `<ds-badge variant="subtle" state="${SEV_STATE[r.severity] || 'default'}" shape="rounded" size="medium">${esc(r.severity)}</ds-badge>` },
      { id: 'vendor', header: 'Vendor', sortable: true, render: (r) => `<span class="cell-muted">${esc(r.vendor)}</span>` },
      { id: 'platform', header: 'Platform', sortable: true, render: (r) => `<span class="cell-name"><ds-icon name="${PLATFORM_ICON[r.platform] || 'computer'}" size="16"></ds-icon>${esc(r.platform)}</span>` },
      { id: 'missingSystems', header: 'Missing on', align: 'end', sortable: true, accessor: 'missingSystems' },
      { id: 'approval', header: 'Approval', sortable: true, render: (r) => `<ds-badge variant="subtle" state="${APPROVAL_STATE[r.approval] || 'default'}" shape="rounded" size="medium">${esc(r.approval)}</ds-badge>` },
      { id: 'reboot', header: 'Reboot', sortable: true, render: (r) => (r.reboot === 'Yes' ? `<ds-badge variant="subtle" state="warning" shape="rounded" size="medium">Yes</ds-badge>` : `<span class="cell-muted">No</span>`) },
      { id: 'released', header: 'Released', sortable: true, render: (r) => esc(r.released) },
    ];
  }

  @action onBulkAction(event) {
    const d = event.detail || {}; const n = (d.ids || []).length;
    const toast = (kind, title, desc) => globalThis.dsToast?.[kind]?.({ title, description: desc, style: 'subtle' });
    if (d.id === 'approve') toast('success', 'Patches approved', `${n} patch(es)`);
    else if (d.id === 'deploy') toast('success', 'Patch deployment queued', `${n} patch(es)`);
  }
}
