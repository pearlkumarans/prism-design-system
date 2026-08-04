/* =============================================================================
   <ds-file-upload variant="form|prominent" multiple
                   label="Attachment" required label-position="left|top"
                   placeholder="Choose file (or) drop here"
                   zone-hint="Drag file here or" button-label="Browse"
                   helper="Only .csv files are supported" show-helper
                   accept=".csv" expanded disabled rtl></ds-file-upload>

   Optional field `label` (+ `required` and `label-position`, default top) renders the
   same label-row anatomy as ds-text-input / the other form fields, so a file upload
   drops into a form field stack cleanly.

   File upload in two styles (Figma "File Upload 2.0", set 22034:1812136):
     • form      — 40px input-like field with placeholder + Browse button.
     • prominent — 78px dashed drop zone with hint + Upload button; while a
                   single upload is in flight the zone itself hosts the file row.

   The component renders selection/progress UI; the consumer owns the actual
   upload. Set `el.files` to drive the lifecycle:

     el.files = [{ id, name, status: 'uploading'|'scanning'|'success'|'error',
                   progress: 0-100, statusText: 'Virus found' }];
     el.updateFile(id, { progress: 80 });
     el.removeFile(id);  el.clear();  el.openPicker();

   The visual state is derived from `files` (any error → error, any busy →
   uploading, all success → success) plus the `disabled` attribute; drag-over
   shows the Drop treatment.

   Events (detail listed):
     - ds-file-upload-select   { files: File[] }     picker or drop
     - ds-file-upload-cancel   { file }              ✕ during upload
     - ds-file-upload-retry    { file }              ↻ on an error row
     - ds-file-upload-remove   { file }              ✕ on success/error row
     - ds-file-upload-toggle   { expanded }          summary row chevron
   ============================================================================= */

import { boolAttr, enumAttr } from '../../utils/attr.js';
import '../field-helper/field-helper.js';
import '../progress-bar/progress-bar.js';
import '../button/button.js';

function _injectCss(id, rel) {
  if (typeof document === 'undefined' || document.getElementById(id)) return;
  const l = document.createElement('link');
  l.id = id; l.rel = 'stylesheet'; l.href = new URL(rel, import.meta.url).href;
  document.head.appendChild(l);
}
_injectCss('ds-file-upload-css', './file-upload.css');
_injectCss('ds-file-upload-fh-css', '../field-helper/field-helper.css');
_injectCss('ds-file-upload-pb-css', '../progress-bar/progress-bar.css');
_injectCss('ds-file-upload-btn-css', '../button/button.css');

const esc = (s) => String(s)
  .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

const VARIANTS = ['form', 'prominent'];
const STATUS_ICON = {
  uploading: 'file',
  scanning: 'file-scan',
  success: 'tick',
  error: 'exclamation-circle',
};
let _uid = 0;

const boolAttrDefault = (el, name, defaultValue) => {
  if (!el.hasAttribute(name)) return defaultValue;
  return el.getAttribute(name) !== 'false';
};

/* Normalise a file entry to { id, name, status, progress, statusText }. */
const normFile = (f) => ({
  id: String(f.id ?? f.name),
  name: String(f.name ?? ''),
  status: ['uploading', 'scanning', 'success', 'error'].includes(f.status) ? f.status : 'uploading',
  progress: Math.min(100, Math.max(0, Number(f.progress ?? 0))),
  statusText: f.statusText != null ? String(f.statusText) : '',
});

export class DsFileUpload extends HTMLElement {
  static get observedAttributes() {
    return [
      'variant', 'multiple', 'placeholder', 'zone-hint', 'button-label',
      'helper', 'show-helper', 'accept', 'expanded', 'disabled', 'rtl',
      'label', 'required', 'label-position',
    ];
  }

  constructor() {
    super();
    this._files = [];
    this._dragDepth = 0;
  }

  connectedCallback() {
    if (!this._root) {
      this._id = `ds-file-upload-${++_uid}`;
      this._root = document.createElement('div');
      this.innerHTML = '';
      this.appendChild(this._root);
      /* Hidden native input keeps picker + form semantics. */
      this._input = document.createElement('input');
      this._input.type = 'file';
      this._input.className = 'ds-file-upload__input';
      this._input.tabIndex = -1;
      this._input.setAttribute('aria-hidden', 'true');
      this._input.addEventListener('change', () => {
        const files = Array.from(this._input.files || []);
        if (files.length) this._emitSelect(files);
        this._input.value = '';
      });
      this.appendChild(this._input);
    }
    this._render();
  }

  attributeChangedCallback() { if (this._root) this._render(); }

  /* ---------------------------------------------------------------- API -- */
  get files() { return this._files.map((f) => ({ ...f })); }
  set files(list) {
    this._files = Array.isArray(list) ? list.map(normFile) : [];
    if (this._root) this._render();
  }

  updateFile(id, patch) {
    const f = this._files.find((x) => x.id === String(id));
    if (!f) return;
    Object.assign(f, normFile({ ...f, ...patch }));
    this._render();
  }

  removeFile(id) {
    this._files = this._files.filter((x) => x.id !== String(id));
    this._render();
  }

  clear() { this.files = []; }

  openPicker() {
    if (boolAttr(this, 'disabled')) return;
    this._input.multiple = boolAttr(this, 'multiple');
    const accept = this.getAttribute('accept');
    if (accept) this._input.setAttribute('accept', accept);
    else this._input.removeAttribute('accept');
    this._input.click();
  }

  /* ------------------------------------------------------------ derived -- */
  get _state() {
    if (boolAttr(this, 'disabled')) return 'disabled';
    if (this._dragDepth > 0) return 'drop';
    if (!this._files.length) return 'default';
    if (this._files.some((f) => f.status === 'error')) return 'error';
    if (this._files.some((f) => f.status === 'uploading' || f.status === 'scanning')) return 'uploading';
    return 'success';
  }

  _emit(name, detail) {
    this.dispatchEvent(new CustomEvent(name, { bubbles: true, detail }));
  }

  _emitSelect(files) {
    const multiple = boolAttr(this, 'multiple');
    this._emit('ds-file-upload-select', { files: multiple ? files : files.slice(0, 1) });
  }

  /* ------------------------------------------------------------- render -- */
  _render() {
    const variant = enumAttr(this, 'variant', VARIANTS, 'form');
    const multiple = boolAttr(this, 'multiple');
    const disabled = boolAttr(this, 'disabled');
    const rtl = boolAttr(this, 'rtl');
    const state = this._state;
    const showHelper = boolAttrDefault(this, 'show-helper', true);
    const helper = this.getAttribute('helper') || '';
    const expanded = boolAttrDefault(this, 'expanded', true);

    /* Field label — same anatomy as the other form fields (label-row + required
       `*`, label-position left|top). Optional: only rendered when `label` is set. */
    const label = this.getAttribute('label') || '';
    const required = boolAttr(this, 'required');
    const labelPos = enumAttr(this, 'label-position', ['left', 'top'], 'top');

    const placeholder = this.getAttribute('placeholder')
      || (multiple ? 'Choose files (or) drop here' : 'Choose file (or) drop here');
    const zoneHint = this.getAttribute('zone-hint')
      || (multiple ? 'Drag files here or' : 'Drag file here or');
    const buttonLabel = this.getAttribute('button-label')
      || (variant === 'prominent' ? 'Upload' : 'Browse');

    this._root.className = [
      'ds-file-upload',
      `ds-file-upload--${variant}`,
      `ds-file-upload--state-${state}`,
      multiple ? 'ds-file-upload--multiple' : '',
      disabled ? 'ds-file-upload--disabled' : '',
      label ? `ds-file-upload--label-${labelPos}` : '',
    ].filter(Boolean).join(' ');
    if (rtl) this._root.setAttribute('dir', 'rtl');
    else this._root.removeAttribute('dir');

    /* Single-type busy file (drives in-field / in-zone status). */
    const single = !multiple && this._files.length ? this._files[0] : null;

    const boxContent = variant === 'form'
      ? this._formBoxHtml(single, placeholder, buttonLabel, disabled)
      : this._promBoxHtml(single, zoneHint, buttonLabel, disabled, state);

    const listHtml = multiple && this._files.length
      ? this._filesHtml(expanded)
      : '';

    const helperState = state === 'error' ? 'error'
      : state === 'success' ? 'success'
      : state === 'disabled' ? 'disabled' : 'default';
    const helperHtml = showHelper && helper
      ? `<ds-field-helper id="${this._id}-helper" text="${esc(helper)}" state="${helperState}" show-icon="${helperState === 'error' || helperState === 'success'}"${rtl ? ' rtl' : ''}></ds-field-helper>`
      : '';

    const labelId = `${this._id}-label`;
    const labelHtml = label
      ? `<span class="ds-file-upload__label-row"><label class="ds-file-upload__label" id="${labelId}">${esc(label)}${required ? '<span class="ds-file-upload__required">*</span>' : ''}</label></span>`
      : '';

    /* Box + list + helper are the "field body"; the label sits beside (left) or
       above (top) it, matching ds-text-input's label-col / label-row anatomy. */
    const bodyHtml = `
      <div class="ds-file-upload__body">
        <div class="ds-file-upload__box" role="button" tabindex="${disabled ? -1 : 0}"
             aria-disabled="${disabled}"
             ${label ? `aria-labelledby="${labelId}"` : `aria-label="${esc(placeholder)}"`}
             ${helperHtml ? `aria-describedby="${this._id}-helper"` : ''}>
          ${boxContent}
        </div>
        ${listHtml}
        ${helperHtml}
      </div>`;

    this._root.innerHTML = !label
      ? bodyHtml
      : labelPos === 'left'
        ? `<div class="ds-file-upload__label-col">${labelHtml}</div>${bodyHtml}`
        : `${labelHtml}${bodyHtml}`;

    this._wire(disabled);
  }

  /* Form field content per state. */
  _formBoxHtml(single, placeholder, buttonLabel, disabled) {
    const browse = `<ds-button class="ds-file-upload__browse" variant="secondary" size="small"${disabled ? ' disabled' : ''}>${esc(buttonLabel)}</ds-button>`;
    if (single) {
      if (single.status === 'uploading' || single.status === 'scanning') {
        return `
          <span class="ds-file-upload__file-icon"><ds-icon name="${STATUS_ICON[single.status]}" size="16"></ds-icon></span>
          <span class="ds-file-upload__name" title="">${esc(single.name)}</span>
          ${single.status === 'scanning'
            ? '<span class="ds-file-upload__status ds-file-upload__status--scanning">Scanning…</span>'
            : `<ds-progress-bar class="ds-file-upload__progress" size="small" value="${single.progress}" show-label="false"></ds-progress-bar>`}
          ${this._actionBtn('cancel', single.id, 'close', `Cancel upload of ${single.name}`)}
        `;
      }
      if (single.status === 'error') {
        return `
          <span class="ds-file-upload__name ds-file-upload__name--error">${esc(single.name)}</span>
          <span class="ds-file-upload__state-icon ds-file-upload__state-icon--error"><ds-icon name="exclamation-circle" size="16"></ds-icon></span>
          ${browse}
        `;
      }
      /* success */
      return `
        <span class="ds-file-upload__name">${esc(single.name)}</span>
        <span class="ds-file-upload__state-icon ds-file-upload__state-icon--success"><ds-icon name="tick" size="16"></ds-icon></span>
        ${browse}
      `;
    }
    return `
      <span class="ds-file-upload__placeholder">${esc(placeholder)}</span>
      ${browse}
    `;
  }

  /* Prominent drop-zone content per state. */
  _promBoxHtml(single, zoneHint, buttonLabel, disabled, state) {
    if (state === 'drop') {
      return '<span class="ds-file-upload__hint">Drop here</span>';
    }
    if (single) {
      /* Single busy: the zone hosts the file row (Figma: File Item in-zone). */
      return `<div class="ds-file-upload__zone-item">${this._itemHtml(single)}</div>`;
    }
    return `
      <span class="ds-file-upload__hint">${esc(zoneHint)}</span>
      <ds-button class="ds-file-upload__browse" variant="primary" size="xsmall"${disabled ? ' disabled' : ''}>${esc(buttonLabel)}</ds-button>
    `;
  }

  /* One 28px file row (shared by the multiple list and the prominent zone). */
  _itemHtml(f) {
    const actions = {
      uploading: this._actionBtn('cancel', f.id, 'close', `Cancel upload of ${f.name}`),
      scanning: '',
      success: this._actionBtn('remove', f.id, 'close', `Remove ${f.name}`),
      error: this._actionBtn('retry', f.id, 'refresh', `Retry upload of ${f.name}`)
        + this._actionBtn('remove', f.id, 'close', `Remove ${f.name}`),
    }[f.status];

    const middle = {
      uploading: `<ds-progress-bar class="ds-file-upload__progress" size="small" value="${f.progress}" show-label="false"></ds-progress-bar>
                  <span class="ds-file-upload__pct">${Math.round(f.progress)}%</span>`,
      scanning: '<span class="ds-file-upload__status ds-file-upload__status--scanning">Scanning…</span>',
      success: '',
      error: f.statusText ? `<span class="ds-file-upload__status ds-file-upload__status--error">${esc(f.statusText)}</span>` : '',
    }[f.status];

    return `
      <div class="ds-file-upload__item ds-file-upload__item--${f.status}" data-id="${esc(f.id)}">
        <span class="ds-file-upload__item-icon ds-file-upload__item-icon--${f.status}"><ds-icon name="${STATUS_ICON[f.status]}" size="16"></ds-icon></span>
        <span class="ds-file-upload__name">${esc(f.name)}</span>
        ${middle}
        ${actions}
      </div>
    `;
  }

  /* Multiple-type list + summary row. */
  _filesHtml(expanded) {
    const total = this._files.length;
    const done = this._files.filter((f) => f.status === 'success').length;
    const failed = this._files.filter((f) => f.status === 'error').length;
    const busy = this._files.some((f) => f.status === 'uploading' || f.status === 'scanning');

    const summaryText = this.getAttribute('summary-text')
      || (busy ? `Uploading files (${done} of ${total})…`
        : failed ? `${failed} of ${total} files failed`
        : `All files uploaded (${total})`);
    const summaryState = busy ? 'uploading' : failed ? 'error' : 'success';

    /* Summary only earns its row when there's a list to manage. */
    const summary = total > 1 ? `
      <button type="button" class="ds-file-upload__summary ds-file-upload__summary--${summaryState}"
              aria-expanded="${expanded}">
        <ds-icon name="chevron-${expanded ? 'up' : 'down'}" size="16"></ds-icon>
        <span class="ds-file-upload__summary-text">${esc(summaryText)}</span>
      </button>` : '';

    const rows = (expanded || total === 1)
      ? this._files.map((f) => this._itemHtml(f)).join('')
      : '';

    return `<div class="ds-file-upload__files">
      ${rows ? `<div class="ds-file-upload__list">${rows}</div>` : ''}
      ${summary}
    </div>`;
  }

  _actionBtn(action, id, icon, label) {
    return `<button type="button" class="ds-file-upload__action" data-action="${action}" data-id="${esc(id)}" aria-label="${esc(label)}">
      <ds-icon name="${icon}" size="16"></ds-icon>
    </button>`;
  }

  /* -------------------------------------------------------------- wiring -- */
  _wire(disabled) {
    const box = this._root.querySelector('.ds-file-upload__box');

    if (!disabled) {
      box.addEventListener('click', (e) => {
        if (e.target.closest('.ds-file-upload__action')) return;
        this.openPicker();
      });
      box.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); this.openPicker(); }
      });

      /* Drag & drop — depth counter survives child enter/leave churn. */
      box.addEventListener('dragenter', (e) => {
        e.preventDefault();
        this._dragDepth++;
        if (this._dragDepth === 1) this._render();
      });
      box.addEventListener('dragover', (e) => { e.preventDefault(); });
      box.addEventListener('dragleave', () => {
        this._dragDepth = Math.max(0, this._dragDepth - 1);
        if (this._dragDepth === 0) this._render();
      });
      box.addEventListener('drop', (e) => {
        e.preventDefault();
        this._dragDepth = 0;
        const files = Array.from(e.dataTransfer?.files || []);
        this._render();
        if (files.length) this._emitSelect(files);
      });
    }

    /* Row actions (cancel / retry / remove) — present in box and list. */
    this._root.querySelectorAll('.ds-file-upload__action').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const file = this._files.find((f) => f.id === btn.dataset.id);
        if (!file) return;
        this._emit(`ds-file-upload-${btn.dataset.action}`, { file: { ...file } });
      });
    });

    const summary = this._root.querySelector('.ds-file-upload__summary');
    if (summary) {
      summary.addEventListener('click', () => {
        const expanded = !boolAttrDefault(this, 'expanded', true);
        this.setAttribute('expanded', String(expanded));
        this._emit('ds-file-upload-toggle', { expanded });
      });
    }

    /* Browse/Upload button rides on the box's click handler; stop double fire. */
    const browse = this._root.querySelector('.ds-file-upload__browse');
    if (browse && !disabled) {
      browse.addEventListener('click', (e) => {
        e.stopPropagation();
        this.openPicker();
      });
    }
  }
}

if (typeof customElements !== 'undefined' && !customElements.get('ds-file-upload')) {
  customElements.define('ds-file-upload', DsFileUpload);
}
