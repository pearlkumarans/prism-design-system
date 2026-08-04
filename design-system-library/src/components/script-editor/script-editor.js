import { boolAttr, enumAttr } from '../../utils/attr.js';

const TYPES = ['basic', 'with-toolbar', 'with-line-numbers', 'with-tabs', 'full-ide'];
const STATES = ['default', 'error', 'disabled', 'readonly'];
const SIZES = ['small', 'medium', 'large'];

export class DsScriptEditor extends HTMLElement {
  static get observedAttributes() { return ['type', 'state', 'size', 'language', 'value', 'tabs', 'show-status', 'error-text', 'rtl']; }

  connectedCallback() {
    if (!this._root) {
      this._initialValue = this.textContent.trim();
      this.innerHTML = '';
      this._root = document.createElement('div');
      this.appendChild(this._root);
    }
    this._render();
  }

  attributeChangedCallback(name) {
    if (!this._root) return;
    if (name === 'value' && this._codeEl) this._codeEl.textContent = this.getAttribute('value') ?? '';
    else this._render();
  }

  get value() { return this._codeEl?.textContent ?? ''; }
  set value(v) { if (this._codeEl) this._codeEl.textContent = v ?? ''; }

  _render() {
    const type = enumAttr(this, 'type', TYPES, 'basic');
    const state = enumAttr(this, 'state', STATES, 'default');
    const size = enumAttr(this, 'size', SIZES, 'medium');
    const language = this.getAttribute('language') || 'TypeScript';
    const value = this.getAttribute('value') ?? this._initialValue ?? '';
    const tabs = (this.getAttribute('tabs') || 'index.ts').split(',').map((s) => s.trim()).filter(Boolean);
    const showStatus = !this.hasAttribute('show-status') || this.getAttribute('show-status') !== 'false';
    const errorText = this.getAttribute('error-text') || '';
    const editable = state !== 'disabled' && state !== 'readonly';
    const showToolbar = type === 'with-toolbar' || type === 'full-ide';
    const showTabs = type === 'with-tabs' || type === 'full-ide';
    const showLineNumbers = type === 'with-line-numbers' || type === 'full-ide';

    const rtl = boolAttr(this, 'rtl');
    const cls = `ds-script-editor ds-script-editor--${size} ds-script-editor--${state}`;
    this._root.className = cls;
    this._root.style.position = 'relative';
    /* Chrome (tabs, toolbar, status bar) mirrors via dir="rtl". The code area
       itself stays LTR — programming languages are inherently left-to-right
       (English keywords, ASCII operators). The .ds-script-editor__code
       element keeps a forced ltr direction via CSS. */
    if (rtl) this._root.setAttribute('dir', 'rtl');
    else this._root.removeAttribute('dir');

    /* Each tab leads with a document icon (folded-corner doc) per spec. */
    const tabsHTML = showTabs
      ? `<div class="ds-script-editor__tabs">${tabs.map((t, i) => `
          <button class="ds-script-editor__tab${i === 0 ? ' ds-script-editor__tab--active' : ''}" type="button">
            <ds-icon name="doc" size="12"></ds-icon>
            <span>${t}</span>
          </button>`).join('')}</div>`
      : '';

    const LABELS = rtl
      ? { run: 'تشغيل', stop: 'إيقاف', copy: 'نسخ', settings: 'إعدادات' }
      : { run: 'Run',  stop: 'Stop',  copy: 'Copy', settings: 'Settings' };
    const toolbarHTML = showToolbar
      ? `<div class="ds-script-editor__toolbar">
           <button class="ds-script-editor__btn" type="button">▶ ${LABELS.run}</button>
           <button class="ds-script-editor__btn" type="button">■ ${LABELS.stop}</button>
           <button class="ds-script-editor__btn" type="button">⧉ ${LABELS.copy}</button>
           <button class="ds-script-editor__btn" type="button">⚙ ${LABELS.settings}</button>
           <span class="ds-script-editor__lang-badge">${language}</span>
         </div>`
      : '';

    const lines = (value || '').split('\n');
    const numbers = lines.map((_, i) => i + 1).join('\n');
    const gutterHTML = showLineNumbers
      ? `<pre class="ds-script-editor__gutter" aria-hidden="true">${numbers}</pre>`
      : '';

    /* Status bar gets aria-live so error counts (e.g. "2 Errors") are announced. */
    const lnColLabel  = rtl ? 'سطر 1، عمود 1' : 'Ln 1, Col 1';
    const spacesLabel = rtl ? 'مسافات: 2'   : 'Spaces: 2';
    const statusHTML = showStatus
      ? `<div class="ds-script-editor__status" aria-live="polite">
           <span>${state === 'error' && errorText ? errorText : language}</span>
           <span style="margin-inline-start: auto;">${lnColLabel}</span>
           <span>UTF-8</span>
           <span>${spacesLabel}</span>
         </div>`
      : '';

    /* FullIDE: terminal/problems/output panel below the code area. */
    const showTerminal = type === 'full-ide';
    const terminalHTML = showTerminal
      ? `<div class="ds-script-editor__terminal" role="region" aria-label="${rtl ? 'الطرفية' : 'Terminal'}">
           <div class="ds-script-editor__terminal-tabs">
             <button class="ds-script-editor__terminal-tab ds-script-editor__terminal-tab--active" type="button">${rtl ? 'الطرفية' : 'TERMINAL'}</button>
             <button class="ds-script-editor__terminal-tab" type="button">${rtl ? 'المشاكل' : 'PROBLEMS'}</button>
             <button class="ds-script-editor__terminal-tab" type="button">${rtl ? 'المخرجات' : 'OUTPUT'}</button>
           </div>
           <pre class="ds-script-editor__terminal-output">$ npm run dev
&gt; vite --open
VITE v5.2.0  ready in 342ms</pre>
         </div>`
      : '';

    this._root.innerHTML = `
      ${tabsHTML}
      ${toolbarHTML}
      <div class="ds-script-editor__body">
        ${gutterHTML}
        <div class="ds-script-editor__code"
             role="textbox" aria-multiline="true" aria-label="Code editor"
             ${editable ? 'contenteditable="true"' : 'contenteditable="false"'}
             ${state === 'readonly' ? 'aria-readonly="true"' : ''}
             ${state === 'disabled' ? 'aria-disabled="true"' : ''}>${value.replace(/</g, '&lt;')}</div>
        ${state === 'readonly' ? `<span class="ds-script-editor__readonly-badge">${rtl ? 'للقراءة فقط' : 'READ ONLY'}</span>` : ''}
      </div>
      ${terminalHTML}
      ${statusHTML}
    `;
    this._codeEl = this._root.querySelector('.ds-script-editor__code');
    this._codeEl.addEventListener('input', () => {
      this.dispatchEvent(new CustomEvent('ds-script-change', { bubbles: true, detail: { value: this.value } }));
    });
  }
}

if (typeof customElements !== 'undefined' && !customElements.get('ds-script-editor')) {
  customElements.define('ds-script-editor', DsScriptEditor);
}
