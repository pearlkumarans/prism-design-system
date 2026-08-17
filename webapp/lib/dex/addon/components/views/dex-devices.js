import Component from '@glimmer/component';
import { service } from '@ember/service';
import { action } from '@ember/object';

/**
 * DEX devices — a thin Patterns::ListView instance bound to PrismAPI.dex.devices.
 * Fully localized (en/ar): header/columns/KPIs/facets are i18n getters (reactive
 * on language change), enum values (DEX status, score band, remarks) translated via
 * tv() maps + the pattern's @facetOptionLabel. The device name drills into the
 * dex-device-detail record page via @onRowLink. Experience score + DEX status are
 * SEMANTIC (good green / average amber / poor red).
 */
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const PLATFORM_ICON = { Windows: 'microsoft', macOS: 'apple', Linux: 'server-01' };
const scoreState = (s) => (s >= 71 ? 'success' : s >= 31 ? 'moderate' : 'critical');

const DEXSTATUS_KEY = { Enabled: 'dx.st.enabled', 'Yet to enable': 'dx.st.pending' };
const BAND_KEY = { Good: 'dx.band.good', Average: 'dx.band.avg', Poor: 'dx.band.poor' };
const REMARK_KEY = {
  'High disk latency': 'dx.rk.disk', 'Slow logon': 'dx.rk.logon', 'High CPU': 'dx.rk.cpu',
  'Memory pressure': 'dx.rk.mem', 'Weak Wi-Fi': 'dx.rk.wifi', 'App crashes': 'dx.rk.crash',
  'Slow boot': 'dx.rk.boot', Healthy: 'dx.rk.healthy', 'Unsupported OS': 'dx.rk.unsupported',
  'Battery drain': 'dx.rk.battery', 'Agent not deployed': 'dx.rk.notdeployed',
};
const FACET_KEYMAP = { dexStatus: DEXSTATUS_KEY, band: BAND_KEY };

const MSGS = {
  en: {
    'dx.title': 'Devices',
    'dx.desc': 'Per-device digital experience scores, DEX status, and remarks across your fleet.',
    'dx.kpi.devices': 'Devices', 'dx.kpi.avg': 'Avg. experience', 'dx.kpi.good': 'Good experience', 'dx.kpi.poor': 'Poor experience',
    'dx.col.name': 'Device name', 'dx.col.domain': 'Domain name', 'dx.col.score': 'Experience score', 'dx.col.os': 'Operating system', 'dx.col.status': 'DEX status', 'dx.col.office': 'Remote office', 'dx.col.remarks': 'Remarks',
    'dx.fg.os': 'Operating system', 'dx.fg.status': 'DEX status', 'dx.fg.office': 'Remote office', 'dx.fg.band': 'Experience score',
    'dx.st.enabled': 'Enabled', 'dx.st.pending': 'Yet to enable',
    'dx.band.good': 'Good', 'dx.band.avg': 'Average', 'dx.band.poor': 'Poor',
    'dx.rk.disk': 'High disk latency', 'dx.rk.logon': 'Slow logon', 'dx.rk.cpu': 'High CPU', 'dx.rk.mem': 'Memory pressure', 'dx.rk.wifi': 'Weak Wi-Fi', 'dx.rk.crash': 'App crashes', 'dx.rk.boot': 'Slow boot', 'dx.rk.healthy': 'Healthy', 'dx.rk.unsupported': 'Unsupported OS', 'dx.rk.battery': 'Battery drain', 'dx.rk.notdeployed': 'Agent not deployed',
  },
  ar: {
    'dx.title': 'الأجهزة',
    'dx.desc': 'درجات التجربة الرقمية لكل جهاز، وحالة DEX، والملاحظات عبر أسطولك.',
    'dx.kpi.devices': 'الأجهزة', 'dx.kpi.avg': 'متوسط التجربة', 'dx.kpi.good': 'تجربة جيدة', 'dx.kpi.poor': 'تجربة ضعيفة',
    'dx.col.name': 'اسم الجهاز', 'dx.col.domain': 'اسم النطاق', 'dx.col.score': 'درجة التجربة', 'dx.col.os': 'نظام التشغيل', 'dx.col.status': 'حالة DEX', 'dx.col.office': 'المكتب البعيد', 'dx.col.remarks': 'ملاحظات',
    'dx.fg.os': 'نظام التشغيل', 'dx.fg.status': 'حالة DEX', 'dx.fg.office': 'المكتب البعيد', 'dx.fg.band': 'درجة التجربة',
    'dx.st.enabled': 'مُفعّل', 'dx.st.pending': 'لم يُفعّل بعد',
    'dx.band.good': 'جيد', 'dx.band.avg': 'متوسط', 'dx.band.poor': 'ضعيف',
    'dx.rk.disk': 'زمن وصول القرص مرتفع', 'dx.rk.logon': 'تسجيل دخول بطيء', 'dx.rk.cpu': 'استخدام المعالج مرتفع', 'dx.rk.mem': 'ضغط الذاكرة', 'dx.rk.wifi': 'إشارة Wi-Fi ضعيفة', 'dx.rk.crash': 'تعطّل التطبيقات', 'dx.rk.boot': 'إقلاع بطيء', 'dx.rk.healthy': 'سليم', 'dx.rk.unsupported': 'نظام تشغيل غير مدعوم', 'dx.rk.battery': 'نفاد البطارية', 'dx.rk.notdeployed': 'الوكيل غير مُثبّت',
  },
};

export default class DexDevices extends Component {
  @service api;
  @service i18n;
  @service router;
  @service shell;

  facets = [
    { id: 'platform', label: 'dx.fg.os' },
    { id: 'dexStatus', label: 'dx.fg.status' },
    { id: 'office', label: 'dx.fg.office' },
    { id: 'band', label: 'dx.fg.band' },
  ];

  constructor() {
    super(...arguments);
    this.i18n.addMessages(MSGS);
  }

  get t() { this.i18n.lang; return (k) => this.i18n.t(k); } // eslint-disable-line no-unused-expressions
  tv(map, v) { return this.t(map[v] || v); }

  get header() {
    const t = this.t;
    return { icon: 'computer', title: t('dx.title'), description: t('dx.desc') };
  }

  get localizedFacets() {
    const t = this.t;
    return this.facets.map((f) => ({ id: f.id, label: t(f.label) }));
  }

  facetOptionLabel = (id, value) => (FACET_KEYMAP[id] ? this.tv(FACET_KEYMAP[id], value) : value);

  fetch = (params) => this.api.prism.dex.devices(params);

  get kpis() {
    const t = this.t;
    return (k) => [
      { label: t('dx.kpi.devices'), value: k.total, state: 'default', icon: 'computer' },
      { label: t('dx.kpi.avg'), value: k.avg, state: k.avg >= 71 ? 'success' : k.avg >= 31 ? 'warning' : 'alert', icon: 'speedometer' },
      { label: t('dx.kpi.good'), value: k.good, state: 'success', icon: 'circle-tick' },
      { label: t('dx.kpi.poor'), value: k.poor, state: 'alert', icon: 'exclamation-circle' },
    ];
  }

  get columns() {
    const t = this.t, tv = (m, v) => this.tv(m, v);
    return [
      { id: 'name', header: t('dx.col.name'), sortable: true, render: (r) => `<span class="cell-name"><ds-icon name="${PLATFORM_ICON[r.platform] || 'computer'}" size="16"></ds-icon><a href="#" data-row-link data-id="${esc(r.id)}" class="cell-link">${esc(r.name)}</a></span>` },
      { id: 'domain', header: t('dx.col.domain'), sortable: true, render: (r) => `<span class="cell-muted">${esc(r.domain)}</span>` },
      { id: 'score', header: t('dx.col.score'), align: 'end', sortable: true, render: (r) => (r.score == null ? '<span class="cell-muted">—</span>' : `<ds-badge variant="subtle" state="${scoreState(r.score)}" shape="rounded" size="medium">${r.score}</ds-badge>`) },
      { id: 'os', header: t('dx.col.os'), sortable: true, render: (r) => `<span class="cell-muted">${esc(r.os)}</span>` },
      { id: 'dexStatus', header: t('dx.col.status'), sortable: true, render: (r) => `<ds-badge variant="subtle" state="${r.dexStatus === 'Enabled' ? 'success' : 'default'}" shape="rounded" size="medium">${esc(tv(DEXSTATUS_KEY, r.dexStatus))}</ds-badge>` },
      { id: 'office', header: t('dx.col.office'), sortable: true, render: (r) => `<span class="cell-muted">${esc(r.office)}</span>` },
      { id: 'remarks', header: t('dx.col.remarks'), render: (r) => `<span class="cell-muted">${esc(tv(REMARK_KEY, r.remarks))}</span>` },
    ];
  }

  // Device name → drill into the record page. Hand the selected id off via a
  // global (same seam the legacy view uses); the detail fetches by id.
  @action openDevice(id) {
    window.DEX_SELECTED = { id };
    this.router.transitionTo('product.module.view', this.shell.productId, 'dex', 'dex-device-detail');
  }
}
