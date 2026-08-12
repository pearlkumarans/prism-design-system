import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

module('Unit | Service | i18n', function (hooks) {
  setupTest(hooks);

  hooks.afterEach(function () {
    document.documentElement.removeAttribute('dir');
    document.documentElement.removeAttribute('lang');
  });

  test('t() resolves registered messages, echoes unknown keys, switches language', function (assert) {
    const i18n = this.owner.lookup('service:i18n');
    i18n.addMessages({ en: { 'x.title': 'Hello' }, ar: { 'x.title': 'مرحبا' } });

    assert.strictEqual(i18n.t('x.title'), 'Hello', 'en by default');
    assert.strictEqual(i18n.t('x.missing'), 'x.missing', 'unknown key echoes (never blank)');

    i18n.setLang('ar');
    assert.strictEqual(i18n.t('x.title'), 'مرحبا', 'resolves in ar after switch');
    assert.strictEqual(i18n.dir, 'rtl', 'ar reports rtl');
  });

  test('setLang mirrors document dir + notifies subscribers', function (assert) {
    const i18n = this.owner.lookup('service:i18n');
    let seen = null;
    i18n.onLangChange((lang) => (seen = lang));

    i18n.setLang('ar');
    assert.strictEqual(document.documentElement.getAttribute('dir'), 'rtl', 'html dir=rtl');
    assert.strictEqual(seen, 'ar', 'onLangChange listener fired');

    i18n.setLang('en');
    assert.strictEqual(document.documentElement.getAttribute('dir'), 'ltr', 'html dir=ltr');
    assert.strictEqual(seen, 'en', 'listener fired again');
  });
});
