import Component from '@glimmer/component';
import { service } from '@ember/service';
import { action } from '@ember/object';

/**
 * BitLocker dashboard — Phase E PILOT. The native Ember port of
 * projects/bitlocker/layout-summary-dashboard.html. Same ds-* components and data;
 * the imperative IIFE (build DOM, setChart, innerHTML, applyStrings, ShellDrawers
 * registration) becomes tracked getters + template bindings. Language reactivity is
 * automatic (getters/`{{t}}` read i18n.lang) — no manual re-localization pass.
 */

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

// View-local message catalog (registered into the shared i18n service on create).
const MSGS = {
  en: {
    'bl.title': 'BitLocker management',
    'bl.desc': 'Encryption posture, compliance, and recovery-key coverage across your Windows fleet.',
    'bl.createPolicy': 'Create policy',
    'bl.kpi.managed': 'Managed computers', 'bl.kpi.encrypted': 'Encrypted', 'bl.kpi.inprogress': 'Encryption in progress', 'bl.kpi.noncompliant': 'Not compliant', 'bl.kpi.keys': 'Recovery keys escrowed',
    'bl.w.status': 'Encryption status', 'bl.w.os': 'Compliance by operating system', 'bl.w.auth': 'Authentication method', 'bl.w.prereq': 'Prerequisite check failures', 'bl.w.escrow': 'Recovery-key escrow', 'bl.w.deploy': 'Recent policy deployments', 'bl.w.attn': 'Systems needing attention',
    'bl.f.deploy': 'View all deployments', 'bl.f.attn': 'View all managed computers',
    'bl.s.computers': 'Computers', 'bl.s.encrypted': 'Encrypted', 'bl.s.devices': 'Devices', 'bl.s.keys': 'Keys',
    'bl.cat.encrypted': 'Encrypted', 'bl.cat.inprogress': 'In progress', 'bl.cat.notstarted': 'Not started', 'bl.cat.failed': 'Failed',
    'bl.cat.tpmonly': 'TPM only', 'bl.cat.tpmpin': 'TPM + PIN', 'bl.cat.tpmepin': 'TPM + Enhanced PIN', 'bl.cat.passphrase': 'Passphrase',
    'bl.cat.tpmno': 'TPM not owned', 'bl.cat.legacy': 'Legacy BIOS', 'bl.cat.gpo': 'GPO conflict', 'bl.cat.wmi': 'WMI error', 'bl.cat.osunsup': 'OS unsupported',
    'bl.cat.ecserver': 'EC server only',
    'bl.dep.corp': 'Corp laptops — TPM + PIN', 'bl.dep.finance': 'Finance — full drive AES-256', 'bl.dep.sales': 'Sales — used-space only', 'bl.dep.servers': 'Servers — passphrase', 'bl.dep.kiosks': 'Kiosks — TPM only',
    'bl.st.completed': 'Completed', 'bl.st.inprogress': 'In progress', 'bl.st.failed': 'Failed', 'bl.st.scheduled': 'Scheduled',
    'bl.col.computer': 'Computer', 'bl.col.os': 'Operating system', 'bl.col.issue': 'Issue', 'bl.col.reason': 'Reason', 'bl.col.seen': 'Last reported',
    'bl.iss.failed': 'Deployment failed', 'bl.iss.prereq': 'Prereq failed', 'bl.iss.noncompliant': 'Not compliant', 'bl.iss.reboot': 'Pending reboot',
    'bl.rsn.tpm': 'TPM not owned', 'bl.rsn.feat': 'BitLocker feature not enabled', 'bl.rsn.gpo': 'Conflicting BitLocker GPO', 'bl.rsn.reboot': 'Awaiting restart to encrypt', 'bl.rsn.legacy': 'Firmware in Legacy mode', 'bl.rsn.noesc': 'Recovery key not escrowed',
    'bl.time.12m': '12 min ago', 'bl.time.1h': '1 hr ago', 'bl.time.2h': '2 hrs ago', 'bl.time.3h': '3 hrs ago', 'bl.time.yesterday': 'Yesterday',
  },
  ar: {
    'bl.title': 'إدارة BitLocker',
    'bl.desc': 'وضع التشفير والامتثال وتغطية مفاتيح الاسترداد عبر أجهزة Windows لديك.',
    'bl.createPolicy': 'إنشاء سياسة',
    'bl.kpi.managed': 'الأجهزة المُدارة', 'bl.kpi.encrypted': 'مُشفّرة', 'bl.kpi.inprogress': 'التشفير قيد التقدم', 'bl.kpi.noncompliant': 'غير متوافقة', 'bl.kpi.keys': 'مفاتيح الاسترداد المحفوظة',
    'bl.w.status': 'حالة التشفير', 'bl.w.os': 'التوافق حسب نظام التشغيل', 'bl.w.auth': 'طريقة المصادقة', 'bl.w.prereq': 'إخفاقات فحص المتطلبات', 'bl.w.escrow': 'حفظ مفتاح الاسترداد', 'bl.w.deploy': 'عمليات نشر السياسات الأخيرة', 'bl.w.attn': 'الأنظمة التي تحتاج إلى انتباه',
    'bl.f.deploy': 'عرض كل عمليات النشر', 'bl.f.attn': 'عرض كل الأجهزة المُدارة',
    'bl.s.computers': 'أجهزة', 'bl.s.encrypted': 'مُشفّرة', 'bl.s.devices': 'أجهزة', 'bl.s.keys': 'مفاتيح',
    'bl.cat.encrypted': 'مُشفّرة', 'bl.cat.inprogress': 'قيد التقدم', 'bl.cat.notstarted': 'لم يبدأ', 'bl.cat.failed': 'فشل',
    'bl.cat.tpmonly': 'TPM فقط', 'bl.cat.tpmpin': 'TPM + PIN', 'bl.cat.tpmepin': 'TPM + PIN محسّن', 'bl.cat.passphrase': 'عبارة مرور',
    'bl.cat.tpmno': 'TPM غير مملوك', 'bl.cat.legacy': 'BIOS قديم', 'bl.cat.gpo': 'تعارض GPO', 'bl.cat.wmi': 'خطأ WMI', 'bl.cat.osunsup': 'نظام غير مدعوم',
    'bl.cat.ecserver': 'خادم EC فقط',
    'bl.dep.corp': 'أجهزة الشركة المحمولة — TPM + PIN', 'bl.dep.finance': 'المالية — القرص الكامل AES-256', 'bl.dep.sales': 'المبيعات — المساحة المستخدمة فقط', 'bl.dep.servers': 'الخوادم — عبارة مرور', 'bl.dep.kiosks': 'الأكشاك — TPM فقط',
    'bl.st.completed': 'مكتمل', 'bl.st.inprogress': 'قيد التقدم', 'bl.st.failed': 'فشل', 'bl.st.scheduled': 'مجدول',
    'bl.col.computer': 'الكمبيوتر', 'bl.col.os': 'نظام التشغيل', 'bl.col.issue': 'المشكلة', 'bl.col.reason': 'السبب', 'bl.col.seen': 'آخر إبلاغ',
    'bl.iss.failed': 'فشل النشر', 'bl.iss.prereq': 'فشل المتطلبات', 'bl.iss.noncompliant': 'غير متوافق', 'bl.iss.reboot': 'في انتظار إعادة التشغيل',
    'bl.rsn.tpm': 'TPM غير مملوك', 'bl.rsn.feat': 'ميزة BitLocker غير مُفعّلة', 'bl.rsn.gpo': 'سياسة GPO متعارضة لـ BitLocker', 'bl.rsn.reboot': 'في انتظار إعادة التشغيل للتشفير', 'bl.rsn.legacy': 'البرنامج الثابت في وضع Legacy', 'bl.rsn.noesc': 'مفتاح الاسترداد غير محفوظ',
    'bl.time.12m': 'قبل 12 دقيقة', 'bl.time.1h': 'قبل ساعة', 'bl.time.2h': 'قبل ساعتين', 'bl.time.3h': 'قبل 3 ساعات', 'bl.time.yesterday': 'أمس',
  },
};

const DEPLOYS = [
  { icon: 'shield', k: 'bl.dep.corp', badge: 'completed', state: 'success' },
  { icon: 'shield', k: 'bl.dep.finance', badge: 'inprogress', state: 'warning' },
  { icon: 'shield', k: 'bl.dep.sales', badge: 'completed', state: 'success' },
  { icon: 'shield', k: 'bl.dep.servers', badge: 'failed', state: 'critical' },
  { icon: 'shield', k: 'bl.dep.kiosks', badge: 'scheduled', state: 'default' },
];
const ISSUE_STATE = { failed: 'critical', prereq: 'warning', noncompliant: 'critical', reboot: 'warning' };
const ATTN = [
  { id: 1, name: 'FIN-WKS-2043', os: 'Windows 11 Pro', issue: 'failed', rsn: 'bl.rsn.tpm', code: '0x80310018', seen: 'bl.time.12m' },
  { id: 2, name: 'SRV-DC-01', os: 'Server 2019', issue: 'prereq', rsn: 'bl.rsn.feat', code: '', seen: 'bl.time.1h' },
  { id: 3, name: 'SALES-LT-118', os: 'Windows 10 Ent', issue: 'noncompliant', rsn: 'bl.rsn.gpo', code: '', seen: 'bl.time.2h' },
  { id: 4, name: 'ENG-WKS-770', os: 'Windows 11 Pro', issue: 'reboot', rsn: 'bl.rsn.reboot', code: '', seen: 'bl.time.3h' },
  { id: 5, name: 'HR-LT-052', os: 'Windows 10 Pro', issue: 'failed', rsn: 'bl.rsn.legacy', code: '0x80310048', seen: 'bl.time.yesterday' },
  { id: 6, name: 'OPS-WKS-311', os: 'Windows 8.1 Ent', issue: 'noncompliant', rsn: 'bl.rsn.noesc', code: '', seen: 'bl.time.yesterday' },
];

export default class BitlockerDashboard extends Component {
  @service i18n;
  @service router;
  @service shell;

  constructor() {
    super(...arguments);
    this.i18n.addMessages(MSGS);
  }

  // Local translate that consumes i18n.lang so getters recompute on language flip.
  get t() {
    this.i18n.lang; // eslint-disable-line no-unused-expressions
    return (k) => this.i18n.t(k);
  }

  get statusChart() {
    const t = this.t;
    return { categories: [t('bl.cat.encrypted'), t('bl.cat.inprogress'), t('bl.cat.notstarted'), t('bl.cat.failed')], series: [{ name: t('bl.s.computers'), values: [142, 14, 15, 15], colors: ['green', 'yellow', 'grey', 'red'] }] };
  }
  get osChart() {
    const t = this.t;
    return { categories: ['Windows 11', 'Windows 10', 'Windows 8.1', 'Server 2019'], series: [{ name: t('bl.s.encrypted'), values: [88, 74, 12, 12], color: 'blue' }] };
  }
  get authChart() {
    const t = this.t;
    return { categories: [t('bl.cat.tpmonly'), t('bl.cat.tpmpin'), t('bl.cat.tpmepin'), t('bl.cat.passphrase')], series: [{ name: t('bl.s.computers'), values: [61, 58, 15, 8] }] };
  }
  get prereqChart() {
    const t = this.t;
    return { categories: [t('bl.cat.tpmno'), t('bl.cat.legacy'), t('bl.cat.gpo'), t('bl.cat.wmi'), t('bl.cat.osunsup')], series: [{ name: t('bl.s.devices'), values: [6, 4, 3, 1, 1], color: 'orange' }] };
  }
  get escrowChart() {
    const t = this.t;
    return { categories: ['Active Directory', t('bl.cat.ecserver')], series: [{ name: t('bl.s.keys'), values: [96, 42], colors: ['blue', 'green'] }] };
  }

  get deploys() {
    const t = this.t;
    return DEPLOYS.map((d) => ({ icon: d.icon, label: t(d.k), state: d.state, badgeLabel: t('bl.st.' + d.badge) }));
  }

  get columns() {
    const t = this.t;
    return [
      { id: 'name', header: t('bl.col.computer'), render: (r) => `<span class="bl-name"><ds-icon name="microsoft" size="16"></ds-icon>${esc(r.name)}</span>` },
      { id: 'os', header: t('bl.col.os'), accessor: 'os' },
      { id: 'issue', header: t('bl.col.issue'), render: (r) => `<ds-badge variant="subtle" state="${ISSUE_STATE[r.issue] || 'default'}" size="medium" shape="rounded">${esc(t('bl.iss.' + r.issue))}</ds-badge>` },
      { id: 'reason', header: t('bl.col.reason'), render: (r) => `<span class="cell-muted">${esc(t(r.rsn) + (r.code ? ' (' + r.code + ')' : ''))}</span>` },
      { id: 'seen', header: t('bl.col.seen'), render: (r) => esc(t(r.seen)) },
    ];
  }
  get rows() {
    return ATTN.map((r) => ({ ...r }));
  }

  @action
  createPolicy() {
    this.router.transitionTo('product.module.view', this.shell.productId, 'bitlocker', 'bitlocker-policy-creation');
  }
}
