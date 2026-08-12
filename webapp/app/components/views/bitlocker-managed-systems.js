import Component from '@glimmer/component';
import { service } from '@ember/service';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';

/**
 * BitLocker managed computers — Phase E view + the DATA-LAYER spike, now with
 * SERVER-SIDE filtering. Filter changes re-query the BFF (server/bff.mjs) rather
 * than filtering client-side; the server returns the filtered rows PLUS aggregates
 * (KPIs + facet counts) computed over the FULL dataset, so those stay stable as the
 * user filters — the classic server-driven-table contract.
 */

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

const MSGS = {
  en: {
    'ms.title': 'Managed computers', 'ms.desc': 'Encryption status of every BitLocker-managed Windows computer.', 'ms.deploy': 'Deploy policy',
    'ms.bc.module': 'BitLocker management', 'ms.bc.insights': 'Insights', 'ms.bc.managed': 'Managed computers',
    'ms.kpi.managed': 'Managed computers', 'ms.kpi.encrypted': 'Encrypted', 'ms.kpi.pending': 'Pending', 'ms.kpi.noncompliant': 'Not compliant',
    'ms.filters': 'Filters', 'ms.updating': 'Updating…',
    'ms.col.computer': 'Computer', 'ms.col.os': 'Operating system', 'ms.col.status': 'Encryption status', 'ms.col.auth': 'Authentication', 'ms.col.scope': 'Scope', 'ms.col.compliance': 'Compliance', 'ms.col.seen': 'Last reported',
    'ms.st.encrypted': 'Encrypted', 'ms.st.inprogress': 'In progress', 'ms.st.notstarted': 'Not started', 'ms.st.failed': 'Failed',
    'ms.cmp.compliant': 'Compliant', 'ms.cmp.noncompliant': 'Not compliant',
    'ms.auth.tpmonly': 'TPM only', 'ms.auth.tpmpin': 'TPM + PIN', 'ms.auth.tpmepin': 'TPM + Enhanced PIN', 'ms.auth.passphrase': 'Passphrase',
    'ms.scope.full': 'Full drive', 'ms.scope.osonly': 'OS drive only', 'ms.scope.used': 'Used space only',
    'ms.fg.status': 'Encryption status', 'ms.fg.os': 'Operating system', 'ms.fg.auth': 'Authentication', 'ms.fg.compliance': 'Compliance',
    'ms.bulk.deploy': 'Deploy policy', 'ms.bulk.retrieve': 'Retrieve recovery key',
    'ms.empty.title': 'No BitLocker data yet', 'ms.empty.desc': 'No managed computers are reporting BitLocker status on this server. Deploy a policy to start.',
    'ms.err.title': "Couldn't load managed computers", 'ms.err.desc': 'The BitLocker report request failed. Is the BFF running (server/bff.mjs)?',
    'ms.t.deployqueued': 'Deployment queued', 'ms.t.keysretrieved': 'Recovery keys retrieved',
  },
  ar: {
    'ms.title': 'الأجهزة المُدارة', 'ms.desc': 'حالة التشفير لكل جهاز Windows تُدار عبر BitLocker.', 'ms.deploy': 'نشر السياسة',
    'ms.bc.module': 'إدارة BitLocker', 'ms.bc.insights': 'رؤى', 'ms.bc.managed': 'الأجهزة المُدارة',
    'ms.kpi.managed': 'الأجهزة المُدارة', 'ms.kpi.encrypted': 'مُشفّرة', 'ms.kpi.pending': 'قيد الانتظار', 'ms.kpi.noncompliant': 'غير متوافقة',
    'ms.filters': 'عوامل التصفية', 'ms.updating': 'جارٍ التحديث…',
    'ms.col.computer': 'الكمبيوتر', 'ms.col.os': 'نظام التشغيل', 'ms.col.status': 'حالة التشفير', 'ms.col.auth': 'المصادقة', 'ms.col.scope': 'النطاق', 'ms.col.compliance': 'التوافق', 'ms.col.seen': 'آخر إبلاغ',
    'ms.st.encrypted': 'مُشفّرة', 'ms.st.inprogress': 'قيد التقدم', 'ms.st.notstarted': 'لم يبدأ', 'ms.st.failed': 'فشل',
    'ms.cmp.compliant': 'متوافق', 'ms.cmp.noncompliant': 'غير متوافق',
    'ms.auth.tpmonly': 'TPM فقط', 'ms.auth.tpmpin': 'TPM + PIN', 'ms.auth.tpmepin': 'TPM + PIN محسّن', 'ms.auth.passphrase': 'عبارة مرور',
    'ms.scope.full': 'القرص الكامل', 'ms.scope.osonly': 'قرص نظام التشغيل فقط', 'ms.scope.used': 'المساحة المستخدمة فقط',
    'ms.fg.status': 'حالة التشفير', 'ms.fg.os': 'نظام التشغيل', 'ms.fg.auth': 'المصادقة', 'ms.fg.compliance': 'التوافق',
    'ms.bulk.deploy': 'نشر السياسة', 'ms.bulk.retrieve': 'استرجاع مفتاح الاسترداد',
    'ms.empty.title': 'لا توجد بيانات BitLocker بعد', 'ms.empty.desc': 'لا توجد أجهزة مُدارة تُبلّغ عن حالة BitLocker على هذا الخادم.',
    'ms.err.title': 'تعذّر تحميل الأجهزة المُدارة', 'ms.err.desc': 'فشل طلب تقرير BitLocker. هل خدمة BFF قيد التشغيل؟',
    'ms.t.deployqueued': 'تم جدولة النشر', 'ms.t.keysretrieved': 'تم استرجاع مفاتيح الاسترداد',
  },
};

const STATUS_STATE = { Encrypted: 'success', 'In progress': 'warning', 'Not started': 'default', Failed: 'critical' };
const COMPLIANCE_STATE = { Compliant: 'success', 'Not compliant': 'critical' };
const STATUS_KEY = { Encrypted: 'ms.st.encrypted', 'In progress': 'ms.st.inprogress', 'Not started': 'ms.st.notstarted', Failed: 'ms.st.failed' };
const CMP_KEY = { Compliant: 'ms.cmp.compliant', 'Not compliant': 'ms.cmp.noncompliant' };
const AUTH_KEY = { 'TPM only': 'ms.auth.tpmonly', 'TPM + PIN': 'ms.auth.tpmpin', 'TPM + Enhanced PIN': 'ms.auth.tpmepin', Passphrase: 'ms.auth.passphrase' };
const SCOPE_KEY = { 'Full drive': 'ms.scope.full', 'OS drive only': 'ms.scope.osonly', 'Used space only': 'ms.scope.used' };
const OS_ICON = { 'Windows 11 Pro': 'microsoft', 'Windows 11 Ent': 'microsoft', 'Windows 10 Ent': 'microsoft', 'Windows 10 Pro': 'microsoft', 'Windows 8.1 Ent': 'microsoft', 'Server 2019': 'server-01' };

export default class BitlockerManagedSystems extends Component {
  @service api;
  @service i18n;
  @service router;
  @service shell;

  @tracked filters = { status: [], os: [], auth: [], compliance: [] };
  @tracked search = '';
  @tracked sort = { columnId: null, direction: null };
  @tracked page = 1;
  @tracked pageSize = 12;
  @tracked view = null;      // last successful { available, rows, total, kpis, facets }
  @tracked isLoading = true; // true during the initial load AND each re-fetch
  @tracked error = null;
  @tracked filtering = false;
  _searchTimer = null;

  constructor() {
    super(...arguments);
    this.i18n.addMessages(MSGS);
    this.reload();
  }

  // Server round-trip: availability + the filtered/searched/paginated page. The
  // server owns filtering, search AND paging; we only pass params.
  async reload() {
    this.isLoading = true;
    this.error = null;
    try {
      const bl = this.api.prism?.bitlocker;
      const available = bl ? await bl.resourceAvailable() : true;
      const params = { ...this.filters, search: this.search, sort: this.sort.columnId, dir: this.sort.direction, page: this.page, pageSize: this.pageSize };
      const body = available && bl ? await bl.listComputers(params) : { rows: [], total: 0, kpis: null, facets: null };
      this.view = { available, ...body };
    } catch (e) {
      this.error = e;
    } finally {
      this.isLoading = false;
    }
  }

  get total() { return this.view?.total ?? 0; }

  get t() {
    this.i18n.lang; // eslint-disable-line no-unused-expressions
    return (k) => this.i18n.t(k);
  }
  tv(map, v) { return this.t(map[v] || v); }

  get rows() { return this.view?.rows ?? []; }

  get kpis() {
    const k = this.view?.kpis;
    if (!k) return [];
    return [
      { label: this.t('ms.kpi.managed'), value: k.managed, state: 'default', icon: 'computer' },
      { label: this.t('ms.kpi.encrypted'), value: k.encrypted, state: 'success', icon: 'lock' },
      { label: this.t('ms.kpi.pending'), value: k.pending, state: 'warning', icon: 'clock' },
      { label: this.t('ms.kpi.noncompliant'), value: k.noncompliant, state: 'alert', icon: 'exclamation-circle' },
    ];
  }

  get filterGroups() {
    const fac = this.view?.facets;
    if (!fac) return [];
    const t = this.t;
    const grp = (id, labelKey, keyMap) => ({
      id, label: t(labelKey), type: 'checkbox',
      options: (fac[id] || []).map((o) => ({ label: keyMap ? this.tv(keyMap, o.value) : o.value, value: o.value, count: o.count })),
    });
    return [grp('status', 'ms.fg.status', STATUS_KEY), grp('os', 'ms.fg.os', null), grp('auth', 'ms.fg.auth', AUTH_KEY), grp('compliance', 'ms.fg.compliance', CMP_KEY)];
  }

  get columns() {
    const t = this.t, tv = (m, v) => this.tv(m, v);
    return [
      { id: 'name', header: t('ms.col.computer'), sortable: true, render: (r) => `<span class="cell-name"><ds-icon name="${OS_ICON[r.os] || 'computer'}" size="16"></ds-icon>${esc(r.name)}</span>` },
      { id: 'os', header: t('ms.col.os'), sortable: true, render: (r) => `<span class="cell-muted">${esc(r.os)}</span>` },
      { id: 'status', header: t('ms.col.status'), sortable: true, render: (r) => `<ds-badge variant="subtle" state="${STATUS_STATE[r.status] || 'default'}" shape="rounded" size="medium">${esc(tv(STATUS_KEY, r.status))}</ds-badge>` },
      { id: 'auth', header: t('ms.col.auth'), sortable: true, render: (r) => esc(tv(AUTH_KEY, r.auth)) },
      { id: 'scope', header: t('ms.col.scope'), sortable: true, render: (r) => `<span class="cell-muted">${esc(tv(SCOPE_KEY, r.scope))}</span>` },
      { id: 'compliance', header: t('ms.col.compliance'), sortable: true, render: (r) => `<ds-badge variant="subtle" state="${COMPLIANCE_STATE[r.compliance] || 'default'}" shape="rounded" size="medium">${esc(tv(CMP_KEY, r.compliance))}</ds-badge>` },
      { id: 'seen', header: t('ms.col.seen'), sortable: true, render: (r) => esc(r.seen) },
    ];
  }

  get bulkActions() {
    return [
      { id: 'deploy', label: this.t('ms.bulk.deploy'), icon: 'settings-deploy' },
      { id: 'retrieve', label: this.t('ms.bulk.retrieve'), icon: 'key' },
    ];
  }

  get breadcrumbs() {
    return [{ label: this.t('ms.bc.module'), href: '#' }, { label: this.t('ms.bc.insights') }, { label: this.t('ms.bc.managed') }];
  }

  toast(kind, title, description) {
    globalThis.dsToast?.[kind]?.({ title, description, style: 'subtle' });
  }

  @action onFilterChange(event) {
    const v = event.detail?.value || event.target?.value || {};
    this.filters = { status: v.status || [], os: v.os || [], auth: v.auth || [], compliance: v.compliance || [] };
    this.page = 1;         // narrowing resets to page 1
    this.reload();         // SERVER-SIDE re-query
  }

  @action onSearch(event) {
    const value = (event.detail?.value ?? event.target?.value ?? '').trim();
    // Debounce so typing coalesces into one request instead of one per keystroke.
    clearTimeout(this._searchTimer);
    this._searchTimer = setTimeout(() => {
      this.search = value;
      this.page = 1;
      this.reload();
    }, 250);
  }

  @action onPage(event) {
    const p = Number(event.detail?.page || 1);
    if (p && p !== this.page) { this.page = p; this.reload(); }
  }

  @action onPageSize(event) {
    const n = Number(event.detail?.rowsPerPage || this.pageSize);
    if (n && n !== this.pageSize) { this.pageSize = n; this.page = 1; this.reload(); }
  }

  @action onSort(event) {
    const d = event.detail || {};
    this.sort = { columnId: d.columnId || null, direction: d.direction || null };
    this.page = 1;   // re-sort starts from page 1
    this.reload();   // SERVER-SIDE: sort the full set, return page 1
  }

  @action onToggleFilter() { this.filtering = !this.filtering; }

  @action onBulkAction(event) {
    const d = event.detail || {}; const n = (d.ids || []).length;
    if (d.id === 'deploy') this.toast('success', this.t('ms.t.deployqueued'), `${n}`);
    else if (d.id === 'retrieve') this.toast('info', this.t('ms.t.keysretrieved'), '');
  }

  @action deploy() {
    this.router.transitionTo('product.module.view', this.shell.productId, 'bitlocker', 'bitlocker-policy-creation');
  }
}
