import Component from '@glimmer/component';
import { service } from '@ember/service';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';

/**
 * BitLocker · Create encryption policy — Phase E form pilot #2. Finishes the
 * BitLocker module (dashboard + managed-computers + this) and closes the nav loop:
 * both dashboards' "Create/Deploy policy" buttons route here.
 *
 * Demonstrates CONDITIONAL fields cleanly: the legacy toggled `hidden` imperatively
 * (syncPin/syncRotate); here they're `{{#if}}` on tracked state — min-PIN-length
 * shows only for TPM+PIN, rotation interval only when rotation is on.
 */

const MSGS = {
  en: {
    'pf.title': 'Create encryption policy',
    'pf.desc': 'Define how BitLocker encrypts, authenticates, and escrows recovery keys before you deploy to devices.',
    'pf.bc.module': 'BitLocker management', 'pf.bc.policies': 'Policies', 'pf.bc.create': 'Create policy',
    'pf.sh.details': 'Policy details', 'pf.sh.details.d': 'Name this policy so technicians can recognise it during deployment.',
    'pf.sh.drive': 'Drive encryption', 'pf.sh.drive.d': 'Choose what to encrypt and which algorithm to use.',
    'pf.sh.auth': 'Authentication', 'pf.sh.auth.d': 'How users unlock the OS drive at startup.',
    'pf.sh.startup': 'Startup enforcement', 'pf.sh.startup.d': 'Control how strictly the startup prompt is applied.',
    'pf.sh.recovery': 'Recovery key', 'pf.sh.recovery.d': 'Where recovery keys are stored and whether they rotate.',
    'pf.name': 'Policy name', 'pf.name.ph': 'e.g. Corp laptops — TPM + PIN',
    'pf.desc.lbl': 'Description', 'pf.desc.ph': 'Optional notes about scope and intent',
    'pf.scope': 'Encryption scope', 'pf.algo': 'Encryption algorithm', 'pf.auth': 'Authentication mode',
    'pf.pinlen': 'Minimum PIN length', 'pf.startup': 'Password prompt', 'pf.rotdays': 'Rotation interval',
    'pf.encrypt.lbl': 'Encrypt on deploy', 'pf.escrow.lbl': 'Back up to Active Directory', 'pf.rotate.lbl': 'Rotate recovery keys',
    'pf.o.full': 'Full drive', 'pf.o.os': 'OS drive only', 'pf.o.used': 'Used space only',
    'pf.o.xts256': 'XTS-AES 256 (recommended)', 'pf.o.xts128': 'XTS-AES 128', 'pf.o.aes256': 'AES-CBC 256', 'pf.o.aes128': 'AES-CBC 128',
    'pf.o.tpm': 'TPM only', 'pf.o.tpmpin': 'TPM + PIN', 'pf.o.tpmepin': 'TPM + Enhanced PIN', 'pf.o.passphrase': 'Passphrase (non-TPM)',
    'pf.o.enforce': 'Enforce immediately', 'pf.o.skip': 'Allow users to skip (grace window)',
    'pf.o.chars': 'characters', 'pf.o.d7': 'Every 7 days', 'pf.o.d30': 'Every 30 days', 'pf.o.d90': 'Every 90 days',
    'pf.cancel': 'Cancel', 'pf.draft': 'Save as draft', 'pf.create': 'Create policy',
    'pf.t.created': 'Policy created', 'pf.t.draft': 'Draft saved', 'pf.t.cancel': 'Changes discarded',
  },
  ar: {
    'pf.title': 'إنشاء سياسة تشفير',
    'pf.desc': 'حدّد كيفية تشفير BitLocker والمصادقة وحفظ مفاتيح الاسترداد قبل النشر على الأجهزة.',
    'pf.bc.module': 'إدارة BitLocker', 'pf.bc.policies': 'السياسات', 'pf.bc.create': 'إنشاء سياسة',
    'pf.sh.details': 'تفاصيل السياسة', 'pf.sh.details.d': 'سمِّ هذه السياسة ليتعرّف عليها الفنيون أثناء النشر.',
    'pf.sh.drive': 'تشفير القرص', 'pf.sh.drive.d': 'اختر ما تريد تشفيره والخوارزمية المستخدمة.',
    'pf.sh.auth': 'المصادقة', 'pf.sh.auth.d': 'كيف يفتح المستخدمون قرص نظام التشغيل عند بدء التشغيل.',
    'pf.sh.startup': 'فرض بدء التشغيل', 'pf.sh.startup.d': 'تحكّم في مدى صرامة تطبيق مطالبة بدء التشغيل.',
    'pf.sh.recovery': 'مفتاح الاسترداد', 'pf.sh.recovery.d': 'أين تُخزّن مفاتيح الاسترداد وهل يتم تدويرها.',
    'pf.name': 'اسم السياسة', 'pf.name.ph': 'مثال: أجهزة الشركة المحمولة — TPM + PIN',
    'pf.desc.lbl': 'الوصف', 'pf.desc.ph': 'ملاحظات اختيارية حول النطاق والغرض',
    'pf.scope': 'نطاق التشفير', 'pf.algo': 'خوارزمية التشفير', 'pf.auth': 'وضع المصادقة',
    'pf.pinlen': 'الحد الأدنى لطول PIN', 'pf.startup': 'مطالبة كلمة المرور', 'pf.rotdays': 'فترة التدوير',
    'pf.encrypt.lbl': 'التشفير عند النشر', 'pf.escrow.lbl': 'النسخ الاحتياطي إلى Active Directory', 'pf.rotate.lbl': 'تدوير مفاتيح الاسترداد',
    'pf.o.full': 'القرص الكامل', 'pf.o.os': 'قرص نظام التشغيل فقط', 'pf.o.used': 'المساحة المستخدمة فقط',
    'pf.o.xts256': 'XTS-AES 256 (مُوصى به)', 'pf.o.xts128': 'XTS-AES 128', 'pf.o.aes256': 'AES-CBC 256', 'pf.o.aes128': 'AES-CBC 128',
    'pf.o.tpm': 'TPM فقط', 'pf.o.tpmpin': 'TPM + PIN', 'pf.o.tpmepin': 'TPM + PIN محسّن', 'pf.o.passphrase': 'عبارة مرور (بدون TPM)',
    'pf.o.enforce': 'الفرض فورًا', 'pf.o.skip': 'السماح للمستخدمين بالتخطي (فترة سماح)',
    'pf.o.chars': 'حرفًا', 'pf.o.d7': 'كل 7 أيام', 'pf.o.d30': 'كل 30 يومًا', 'pf.o.d90': 'كل 90 يومًا',
    'pf.cancel': 'إلغاء', 'pf.draft': 'حفظ كمسودة', 'pf.create': 'إنشاء سياسة',
    'pf.t.created': 'تم إنشاء السياسة', 'pf.t.draft': 'تم حفظ المسودة', 'pf.t.cancel': 'تم تجاهل التغييرات',
  },
};

export default class BitlockerPolicyCreation extends Component {
  @service i18n;
  @service router;
  @service shell;

  @tracked auth = 'tpm';
  @tracked rotate = false;

  constructor() {
    super(...arguments);
    this.i18n.addMessages(MSGS);
  }

  get t() {
    this.i18n.lang; // eslint-disable-line no-unused-expressions
    return (k) => this.i18n.t(k);
  }

  get breadcrumbs() {
    const t = this.t;
    return [{ label: t('pf.bc.module'), href: '#' }, { label: t('pf.bc.policies') }, { label: t('pf.bc.create') }];
  }

  _opts(pairs, selected) {
    const t = this.t;
    return pairs.map(([value, key]) => ({ value, label: t(key), selected: value === selected }));
  }

  get scopeOptions() { return this._opts([['full', 'pf.o.full'], ['os', 'pf.o.os'], ['used', 'pf.o.used']], 'full'); }
  get algoOptions() { return this._opts([['xts256', 'pf.o.xts256'], ['xts128', 'pf.o.xts128'], ['aes256', 'pf.o.aes256'], ['aes128', 'pf.o.aes128']], 'xts256'); }
  get authOptions() { return this._opts([['tpm', 'pf.o.tpm'], ['tpm-pin', 'pf.o.tpmpin'], ['tpm-epin', 'pf.o.tpmepin'], ['passphrase', 'pf.o.passphrase']], this.auth); }
  get startupOptions() { return this._opts([['enforce', 'pf.o.enforce'], ['skip', 'pf.o.skip']], 'enforce'); }
  get rotateDaysOptions() { return this._opts([['7', 'pf.o.d7'], ['30', 'pf.o.d30'], ['90', 'pf.o.d90']], '7'); }
  get pinLenOptions() {
    const t = this.t;
    return Array.from({ length: 15 }, (_, i) => ({ value: String(i + 6), label: `${i + 6} ${t('pf.o.chars')}`, selected: i === 0 }));
  }

  // Conditional fields — the whole point vs the imperative `hidden` toggling.
  get showPin() { return this.auth === 'tpm-pin' || this.auth === 'tpm-epin'; }
  get showRotateDays() { return this.rotate; }

  toast(kind, title) { globalThis.dsToast?.[kind]?.({ title, style: 'subtle' }); }

  @action onAuthChange(event) { const v = event.detail?.value; if (v) this.auth = v; }
  @action onRotateChange(event) { this.rotate = !!event.detail?.checked; }

  @action cancel() {
    this.toast('info', this.t('pf.t.cancel'));
    this.router.transitionTo('product.module.view', this.shell.productId, 'bitlocker', 'bitlocker-dashboard');
  }
  @action saveDraft() { this.toast('success', this.t('pf.t.draft')); }
  @action create() {
    this.toast('success', this.t('pf.t.created'));
    this.router.transitionTo('product.module.view', this.shell.productId, 'bitlocker', 'bitlocker-managed-systems');
  }
}
