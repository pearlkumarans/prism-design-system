import Component from '@glimmer/component';
import { service } from '@ember/service';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';

/**
 * Device execution — Phase E, the DETAIL archetype. A drill-down page (breadcrumb
 * + summary meta header), fed by a by-name record (PrismAPI.deployments.deviceExecution),
 * NOT the list query contract. Renders a hand-rolled SVG donut, a per-stage table,
 * and a slide-in execution-timeline panel — faithful to layout-deployment-device.
 */

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const STATUS_STATE = { Succeeded: 'success', Failed: 'critical', 'Yet to Apply': 'warning', 'In Progress': 'info', 'Retry In Progress': 'info' };
const badge = (s) => `<ds-badge variant="subtle" state="${STATUS_STATE[s] || 'default'}" shape="rounded" size="medium">${esc(s)}</ds-badge>`;
const DONUT = { g: 'var(--uems-bg-success-solid, #16a34a)', r: 'var(--uems-bg-error-solid, #dc2626)', n: 'var(--uems-bg-warning-solid, #f59e0b)' };

export default class DeploymentsDeviceExecution extends Component {
  @service api;
  @service router;
  @service shell;

  @tracked rec = null;
  @tracked isLoading = true;
  @tracked error = null;
  @tracked panelOpen = false;

  constructor() {
    super(...arguments);
    this._onKey = (e) => { if (e.key === 'Escape') this.closePanel(); };
    document.addEventListener('keydown', this._onKey);
    this.reload();
  }

  willDestroy() {
    super.willDestroy(...arguments);
    document.removeEventListener('keydown', this._onKey);
  }

  async reload() {
    this.isLoading = true;
    this.error = null;
    try {
      const dep = this.api.prism?.deployments;
      const name = globalThis.__deploymentDeviceName || undefined;
      this.rec = dep ? await dep.deviceExecution({ name }) : null;
    } catch (e) {
      this.error = e;
    } finally {
      this.isLoading = false;
    }
  }

  get header() {
    return { icon: 'computer', title: this.rec?.name, description: this.description };
  }

  get breadcrumbs() {
    const r = this.rec;
    if (!r) return [];
    return [{ label: 'Deployments', href: '#' }, { label: r.batch, href: '#' }, { label: r.name }];
  }

  get summary() {
    const r = this.rec;
    if (!r) return [];
    return [
      { label: 'Status', value: r.status, status: STATUS_STATE[r.status] || 'default' },
      { label: 'Domain', value: r.domain },
      { label: 'Remote office', value: r.site },
      { label: 'Last contact', value: r.lastContact },
    ];
  }

  get description() {
    const r = this.rec;
    return r ? `${r.domain} · ${r.site} · Logged on: ${r.loggedOn} · Last contact ${r.lastContact}` : '';
  }

  // SVG donut geometry: each slice → a circle with stroke-dasharray + offset.
  get donutSegments() {
    const d = this.rec?.donut;
    if (!d) return [];
    const total = d.succeeded + d.failed + d.waiting || 1;
    const order = [['succeeded', DONUT.g], ['failed', DONUT.r], ['waiting', DONUT.n]];
    let off = 0;
    const segs = [];
    for (const [key, color] of order) {
      const val = d[key];
      if (val <= 0) continue;
      const pct = (val / total) * 100;
      segs.push({ color, dash: `${pct.toFixed(3)} ${(100 - pct).toFixed(3)}`, offset: (-off).toFixed(3) });
      off += pct;
    }
    return segs;
  }

  get donutTotal() { const d = this.rec?.donut; return d ? d.succeeded + d.failed + d.waiting : 0; }

  get legend() {
    const d = this.rec?.donut;
    if (!d) return [];
    return [
      { label: 'Succeeded', color: DONUT.g, value: d.succeeded },
      { label: 'Failed', color: DONUT.r, value: d.failed },
      { label: 'Yet to apply', color: DONUT.n, value: d.waiting },
    ];
  }

  get columns() {
    return [
      { id: 'name', header: 'Configuration name', accessor: 'name' },
      { id: 'type', header: 'Type', accessor: 'type' },
      { id: 'status', header: 'Status', render: (r) => badge(r.status) },
      { id: 'retry', header: 'Retry status', render: (r) => (r.retry === '—' ? '<span style="color:var(--uems-text-tertiary)">—</span>' : badge(r.retry)) },
      { id: 'remarks', header: 'Remarks', accessor: 'remarks' },
      { id: 'at', header: 'Executed at', accessor: 'at' },
    ];
  }

  get stages() { return this.rec?.stages ?? []; }
  get timeline() { return this.rec?.timeline ?? []; }

  @action openPanel() { this.panelOpen = true; }
  @action closePanel() { this.panelOpen = false; }
  @action onTableClick(event) { if (event.target.closest?.('tr, [role="row"]')) this.openPanel(); }

  // Breadcrumb crumbs → navigate back up the drill-down.
  @action onBreadcrumbClick(event) {
    const a = event.target.closest?.('a[href]');
    if (!a) return;
    const label = (a.textContent || '').trim();
    if (label === 'Deployments') { event.preventDefault(); this.router.transitionTo('product.module.view', this.shell.productId, 'deployments', 'deployments-list'); }
  }
}
