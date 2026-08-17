import Component from '@glimmer/component';
import { service } from '@ember/service';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';

/**
 * DEX device detail — the DETAIL archetype (Patterns::ListDetail). A drill-down
 * from the devices list (id handed off via window.DEX_SELECTED), fed by a by-id
 * record (PrismAPI.dex.device): summary meta header + a 14-day experience-score
 * trend (ds-chart line) and a contributing-factors table in ds-widget cards.
 * Localized en/ar. Experience score bands are SEMANTIC (good/average/poor).
 */
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const scoreState = (s) => (s >= 71 ? 'success' : s >= 31 ? 'moderate' : 'critical');
const BAND_KEY = { Good: 'dd.band.good', Average: 'dd.band.avg', Poor: 'dd.band.poor', na: 'dd.band.na' };

const MSGS = {
  en: {
    'dd.bc.devices': 'Devices',
    'dd.sum.score': 'Experience score', 'dd.sum.status': 'DEX status', 'dd.sum.domain': 'Domain', 'dd.sum.os': 'Operating system', 'dd.sum.office': 'Remote office', 'dd.sum.agent': 'Agent', 'dd.sum.model': 'Model', 'dd.sum.seen': 'Last reported',
    'dd.trend.title': 'Experience score — last 14 days', 'dd.trend.series': 'Experience',
    'dd.factors.title': 'Contributing factors',
    'dd.col.factor': 'Factor', 'dd.col.score': 'Score', 'dd.col.weight': 'Weight', 'dd.col.status': 'Status',
    'dd.agent.live': 'Live', 'dd.agent.down': 'Down',
    'dd.st.enabled': 'Enabled', 'dd.st.pending': 'Yet to enable',
    'dd.band.good': 'Good', 'dd.band.avg': 'Average', 'dd.band.poor': 'Poor', 'dd.band.na': '—',
    'dd.err.title': 'Couldn’t load device', 'dd.err.desc': 'The request failed. Is the BFF running (server/bff.mjs)?', 'dd.err.retry': 'Retry',
  },
  ar: {
    'dd.bc.devices': 'الأجهزة',
    'dd.sum.score': 'درجة التجربة', 'dd.sum.status': 'حالة DEX', 'dd.sum.domain': 'النطاق', 'dd.sum.os': 'نظام التشغيل', 'dd.sum.office': 'المكتب البعيد', 'dd.sum.agent': 'الوكيل', 'dd.sum.model': 'الطراز', 'dd.sum.seen': 'آخر إبلاغ',
    'dd.trend.title': 'درجة التجربة — آخر 14 يومًا', 'dd.trend.series': 'التجربة',
    'dd.factors.title': 'العوامل المساهمة',
    'dd.col.factor': 'العامل', 'dd.col.score': 'الدرجة', 'dd.col.weight': 'الوزن', 'dd.col.status': 'الحالة',
    'dd.agent.live': 'مباشر', 'dd.agent.down': 'متوقف',
    'dd.st.enabled': 'مُفعّل', 'dd.st.pending': 'لم يُفعّل بعد',
    'dd.band.good': 'جيد', 'dd.band.avg': 'متوسط', 'dd.band.poor': 'ضعيف', 'dd.band.na': '—',
    'dd.err.title': 'تعذّر تحميل الجهاز', 'dd.err.desc': 'فشل الطلب. هل خادم BFF قيد التشغيل (server/bff.mjs)؟', 'dd.err.retry': 'إعادة المحاولة',
  },
};

export default class DexDeviceDetail extends Component {
  @service api;
  @service i18n;
  @service router;
  @service shell;

  @tracked rec = null;
  @tracked isLoading = true;
  @tracked error = null;

  constructor() {
    super(...arguments);
    this.i18n.addMessages(MSGS);
    this.reload();
  }

  get t() { this.i18n.lang; return (k) => this.i18n.t(k); } // eslint-disable-line no-unused-expressions
  tv(map, v) { return this.t(map[v] || v); }

  @action async reload() {
    this.isLoading = true;
    this.error = null;
    try {
      const dex = this.api.prism?.dex;
      const id = (window.DEX_SELECTED && window.DEX_SELECTED.id) || 1;
      this.rec = dex ? await dex.device({ id }) : null;
    } catch (e) {
      this.error = e;
    } finally {
      this.isLoading = false;
    }
  }

  get header() {
    const r = this.rec;
    return { icon: 'computer', title: r?.name, description: r ? `${r.domain} · ${r.office} · ${r.os}` : '' };
  }

  get breadcrumbs() {
    const r = this.rec;
    if (!r) return [];
    return [{ label: this.t('dd.bc.devices'), href: '#' }, { label: r.name }];
  }

  get summary() {
    const r = this.rec, t = this.t;
    if (!r) return [];
    return [
      { label: t('dd.sum.score'), value: r.score == null ? '—' : String(r.score), status: r.score == null ? 'default' : scoreState(r.score) },
      { label: t('dd.sum.status'), value: this.tv({ Enabled: 'dd.st.enabled', 'Yet to enable': 'dd.st.pending' }, r.dexStatus), status: r.dexStatus === 'Enabled' ? 'success' : 'default' },
      { label: t('dd.sum.agent'), value: r.agent === 'live' ? t('dd.agent.live') : t('dd.agent.down'), status: r.agent === 'live' ? 'success' : 'critical' },
      { label: t('dd.sum.domain'), value: r.domain },
      { label: t('dd.sum.os'), value: r.os },
      { label: t('dd.sum.office'), value: r.office },
      { label: t('dd.sum.model'), value: r.model },
      { label: t('dd.sum.seen'), value: r.lastSeen },
    ];
  }

  // 14-day experience-score trend → ds-chart line data, fed via {{config-chart}}.
  get trendChart() {
    const tr = this.rec?.trend;
    if (!tr) return { categories: [], series: [] };
    return { categories: tr.days, series: [{ name: this.t('dd.trend.series'), values: tr.values, colors: ['blue'] }] };
  }

  get trendTitle() { return this.t('dd.trend.title'); }
  get factorsTitle() { return this.t('dd.factors.title'); }

  get columns() {
    const t = this.t, tv = (m, v) => this.tv(m, v);
    return [
      { id: 'factor', header: t('dd.col.factor'), accessor: 'factor' },
      { id: 'score', header: t('dd.col.score'), align: 'end', render: (r) => `<ds-badge variant="subtle" state="${scoreState(r.score)}" shape="rounded" size="medium">${r.score}</ds-badge>` },
      { id: 'weight', header: t('dd.col.weight'), align: 'end', accessor: 'weight' },
      { id: 'status', header: t('dd.col.status'), render: (r) => `<ds-badge variant="subtle" state="${scoreState(r.score)}" shape="rounded" size="medium">${esc(tv(BAND_KEY, r.band))}</ds-badge>` },
    ];
  }

  get subScores() { return this.rec?.subScores ?? []; }

  get errText() {
    const t = this.t;
    return { title: t('dd.err.title'), desc: t('dd.err.desc'), retry: t('dd.err.retry') };
  }

  @action onBreadcrumbClick(event) {
    const a = event.target.closest?.('a[href]');
    if (!a) return;
    event.preventDefault();
    this.router.transitionTo('product.module.view', this.shell.productId, 'dex', 'dex-devices');
  }
}
