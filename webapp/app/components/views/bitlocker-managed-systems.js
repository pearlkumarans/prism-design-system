import Component from '@glimmer/component';
import { service } from '@ember/service';
import { action } from '@ember/object';

/**
 * BitLocker managed computers — a thin Patterns::ListView instance, kept as the
 * fully-localized example: header/columns/KPIs/facets are i18n getters (reactive
 * on language change), plus breadcrumbs and localized facet option labels via the
 * pattern's @breadcrumbs / @facetOptionLabel args.
 */
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

const MSGS = {
  en: {
    'ms.title': 'Managed computers', 'ms.desc': 'Encryption status of every BitLocker-managed Windows computer.', 'ms.deploy': 'Deploy policy',
    'ms.bc.module': 'BitLocker management', 'ms.bc.insights': 'Insights', 'ms.bc.managed': 'Managed computers',
    'ms.kpi.managed': 'Managed computers', 'ms.kpi.encrypted': 'Encrypted', 'ms.kpi.pending': 'Pending', 'ms.kpi.noncompliant': 'Not compliant',
    'ms.col.computer': 'Computer', 'ms.col.os': 'Operating system', 'ms.col.status': 'Encryption status', 'ms.col.auth': 'Authentication', 'ms.col.scope': 'Scope', 'ms.col.compliance': 'Compliance', 'ms.col.seen': 'Last reported',
    'ms.st.encrypted': 'Encrypted', 'ms.st.inprogress': 'In progress', 'ms.st.notstarted': 'Not started', 'ms.st.failed': 'Failed',
    'ms.cmp.compliant': 'Compliant', 'ms.cmp.noncompliant': 'Not compliant',
    'ms.auth.tpmonly': 'TPM only', 'ms.auth.tpmpin': 'TPM + PIN', 'ms.auth.tpmepin': 'TPM + Enhanced PIN', 'ms.auth.passphrase': 'Passphrase',
    'ms.scope.full': 'Full drive', 'ms.scope.osonly': 'OS drive only', 'ms.scope.used': 'Used space only',
    'ms.fg.status': 'Encryption status', 'ms.fg.os': 'Operating system', 'ms.fg.auth': 'Authentication', 'ms.fg.compliance': 'Compliance',
    'ms.bulk.deploy': 'Deploy policy', 'ms.bulk.retrieve': 'Retrieve recovery key',
    'ms.t.deployqueued': 'Deployment queued', 'ms.t.keysretrieved': 'Recovery keys retrieved',
  },
  ar: {
    'ms.title': 'الأجهزة المُدارة', 'ms.desc': 'حالة التشفير لكل جهاز Windows تُدار عبر BitLocker.', 'ms.deploy': 'نشر السياسة',
    'ms.bc.module': 'إدارة BitLocker', 'ms.bc.insights': 'رؤى', 'ms.bc.managed': 'الأجهزة المُدارة',
    'ms.kpi.managed': 'الأجهزة المُدارة', 'ms.kpi.encrypted': 'مُشفّرة', 'ms.kpi.pending': 'قيد الانتظار', 'ms.kpi.noncompliant': 'غير متوافقة',
    'ms.col.computer': 'الكمبيوتر', 'ms.col.os': 'نظام التشغيل', 'ms.col.status': 'حالة التشفير', 'ms.col.auth': 'المصادقة', 'ms.col.scope': 'النطاق', 'ms.col.compliance': 'التوافق', 'ms.col.seen': 'آخر إبلاغ',
    'ms.st.encrypted': 'مُشفّرة', 'ms.st.inprogress': 'قيد التقدم', 'ms.st.notstarted': 'لم يبدأ', 'ms.st.failed': 'فشل',
    'ms.cmp.compliant': 'متوافق', 'ms.cmp.noncompliant': 'غير متوافق',
    'ms.auth.tpmonly': 'TPM فقط', 'ms.auth.tpmpin': 'TPM + PIN', 'ms.auth.tpmepin': 'TPM + PIN محسّن', 'ms.auth.passphrase': 'عبارة مرور',
    'ms.scope.full': 'القرص الكامل', 'ms.scope.osonly': 'قرص نظام التشغيل فقط', 'ms.scope.used': 'المساحة المستخدمة فقط',
    'ms.fg.status': 'حالة التشفير', 'ms.fg.os': 'نظام التشغيل', 'ms.fg.auth': 'المصادقة', 'ms.fg.compliance': 'التوافق',
    'ms.bulk.deploy': 'نشر السياسة', 'ms.bulk.retrieve': 'استرجاع مفتاح الاسترداد',
    'ms.t.deployqueued': 'تم جدولة النشر', 'ms.t.keysretrieved': 'تم استرجاع مفاتيح الاسترداد',
  },
};

const STATUS_STATE = { Encrypted: 'success', 'In progress': 'warning', 'Not started': 'default', Failed: 'critical' };
const COMPLIANCE_STATE = { Compliant: 'success', 'Not compliant': 'critical' };
const STATUS_KEY = { Encrypted: 'ms.st.encrypted', 'In progress': 'ms.st.inprogress', 'Not started': 'ms.st.notstarted', Failed: 'ms.st.failed' };
const CMP_KEY = { Compliant: 'ms.cmp.compliant', 'Not compliant': 'ms.cmp.noncompliant' };
const AUTH_KEY = { 'TPM only': 'ms.auth.tpmonly', 'TPM + PIN': 'ms.auth.tpmpin', 'TPM + Enhanced PIN': 'ms.auth.tpmepin', Passphrase: 'ms.auth.passphrase' };
const SCOPE_KEY = { 'Full drive': 'ms.scope.full', 'OS drive only': 'ms.scope.osonly', 'Used space only': 'ms.scope.used' };
const FACET_KEYMAP = { status: STATUS_KEY, auth: AUTH_KEY, compliance: CMP_KEY };
const OS_ICON = { 'Windows 11 Pro': 'microsoft', 'Windows 11 Ent': 'microsoft', 'Windows 10 Ent': 'microsoft', 'Windows 10 Pro': 'microsoft', 'Windows 8.1 Ent': 'microsoft', 'Server 2019': 'server-01' };

export default class BitlockerManagedSystems extends Component {
  @service api;
  @service i18n;
  @service router;
  @service shell;

  facets = [
    { id: 'status', label: 'ms.fg.status' },
    { id: 'os', label: 'ms.fg.os' },
    { id: 'auth', label: 'ms.fg.auth' },
    { id: 'compliance', label: 'ms.fg.compliance' },
  ];

  constructor() {
    super(...arguments);
    this.i18n.addMessages(MSGS);
  }

  get t() { this.i18n.lang; return (k) => this.i18n.t(k); } // eslint-disable-line no-unused-expressions
  tv(map, v) { return this.t(map[v] || v); }

  get header() {
    const t = this.t;
    return { icon: 'computer', title: t('ms.title'), description: t('ms.desc') };
  }

  get breadcrumbs() {
    const t = this.t;
    return [{ label: t('ms.bc.module'), href: '#' }, { label: t('ms.bc.insights') }, { label: t('ms.bc.managed') }];
  }

  get localizedFacets() {
    const t = this.t;
    return this.facets.map((f) => ({ id: f.id, label: t(f.label) }));
  }

  facetOptionLabel = (id, value) => (FACET_KEYMAP[id] ? this.tv(FACET_KEYMAP[id], value) : value);

  fetch = async (params) => {
    const bl = this.api.prism?.bitlocker;
    if (!bl) return { rows: [], total: 0, kpis: null, facets: null };
    const available = await bl.resourceAvailable();
    return available ? bl.listComputers(params) : { rows: [], total: 0, kpis: null, facets: null };
  };

  get kpis() {
    const t = this.t;
    return (k) => [
      { label: t('ms.kpi.managed'), value: k.managed, state: 'default', icon: 'computer' },
      { label: t('ms.kpi.encrypted'), value: k.encrypted, state: 'success', icon: 'lock' },
      { label: t('ms.kpi.pending'), value: k.pending, state: 'warning', icon: 'clock' },
      { label: t('ms.kpi.noncompliant'), value: k.noncompliant, state: 'alert', icon: 'exclamation-circle' },
    ];
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
    const t = this.t;
    return [
      { id: 'deploy', label: t('ms.bulk.deploy'), icon: 'settings-deploy' },
      { id: 'retrieve', label: t('ms.bulk.retrieve'), icon: 'key' },
    ];
  }

  @action onBulkAction(event) {
    const d = event.detail || {}; const n = (d.ids || []).length;
    const toast = (kind, title, desc) => globalThis.dsToast?.[kind]?.({ title, description: desc, style: 'subtle' });
    if (d.id === 'deploy') toast('success', this.t('ms.t.deployqueued'), `${n}`);
    else if (d.id === 'retrieve') toast('info', this.t('ms.t.keysretrieved'), '');
  }

  @action deploy() {
    this.router.transitionTo('product.module.view', this.shell.productId, 'bitlocker', 'bitlocker-policy-creation');
  }
}
