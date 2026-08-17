import Service from '@ember/service';
import { tracked } from '@glimmer/tracking';

/**
 * i18n — Phase A. Replaces the English-only ShellCtx stub with a real message
 * catalog. Injected views register their strings via addMessages() and resolve
 * via t(); flipping the language mirrors `dir` and notifies subscribers, exactly
 * the ShellCtx.applyDir / onLangChange contract the dual-mode views expect.
 */
export default class I18nService extends Service {
  @tracked lang = 'en';
  _messages = { en: {} };
  _listeners = new Set();

  get dir() {
    return this.lang === 'ar' ? 'rtl' : 'ltr';
  }

  addMessages(map) {
    for (const lang of Object.keys(map || {})) {
      this._messages[lang] = Object.assign(this._messages[lang] || {}, map[lang]);
    }
  }

  t(key) {
    const table = this._messages[this.lang] || {};
    if (table[key] != null) return table[key];
    return this._messages.en?.[key] != null ? this._messages.en[key] : key;
  }

  onLangChange(cb) {
    this._listeners.add(cb);
    return () => this._listeners.delete(cb);
  }

  setLang(lang) {
    this.lang = lang;
    const rtl = lang === 'ar';
    document.documentElement.setAttribute('dir', rtl ? 'rtl' : 'ltr');
    document.documentElement.setAttribute('lang', lang);
    const notify = () => {
      this._listeners.forEach((cb) => {
        try { cb(lang); } catch (_) { /* a bad listener shouldn't break the flip */ }
      });
      // Injected drawers listen for this to re-render in the new language.
      document.dispatchEvent(new CustomEvent('shell:langchange', { detail: { lang } }));
    };
    notify();
    // Load the central per-locale catalog (Layout/i18n/locales/<lang>.json) and
    // re-notify once its strings are registered, so views re-render with them.
    if (typeof window !== 'undefined' && window.UEMSi18n) {
      window.UEMSi18n.ensure(lang, (m) => this.addMessages(m)).then(notify).catch(() => {});
    }
  }

  applyDir(lang) {
    this.setLang(lang); // ShellCtx.applyDir alias
  }
}
