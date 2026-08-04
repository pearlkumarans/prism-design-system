import { boolAttr, enumAttr } from '../../utils/attr.js';
/* Helper/counter row = the shared "Form Field Helper Row" sub-component. */
import '../field-helper/field-helper.js';
/* Label help icon tooltip (same pattern as ds-token-field). */
import '../tooltip/tooltip.js';

/* Auto-load field-helper.css once (both are light-DOM, so the stylesheet must
   be present even on pages that load text-area.css individually). */
function _injectCss(id, rel) {
  if (typeof document === 'undefined' || document.getElementById(id)) return;
  const l = document.createElement('link');
  l.id = id; l.rel = 'stylesheet'; l.href = new URL(rel, import.meta.url).href;
  document.head.appendChild(l);
}
_injectCss('ds-text-area-fh-css', '../field-helper/field-helper.css');
_injectCss('ds-text-area-tt-css', '../tooltip/tooltip.css');

const esc = (s) => String(s)
  .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

const STATES = ['default', 'error', 'success', 'readonly', 'disabled'];
const POSITIONS = ['none', 'top', 'left'];
/* Width scale shared with ds-text-input (medium 320 / large 400). */
const SIZES = ['medium', 'large'];

let _uid = 0;

export class DsTextArea extends HTMLElement {
  static get observedAttributes() {
    return ['state', 'size', 'label-position', 'label', 'placeholder', 'value', 'required', 'helper', 'counter', 'show-counter', 'show-helper-row', 'show-label-help-icon', 'label-help', 'max-lines', 'rtl'];
  }

  constructor() { super(); this._id = `ds-ta-${++_uid}`; }

  connectedCallback() {
    if (!this._root) { this._root = document.createElement('div'); this.innerHTML = ''; this.appendChild(this._root); }
    this._render();
  }

  attributeChangedCallback(name) {
    if (!this._root) return;
    if (name === 'value' && this._textarea) this._textarea.value = this.getAttribute('value') ?? '';
    else this._render();
  }

  get value() { return this._textarea?.value ?? ''; }
  set value(v) {
    if (this._textarea) {
      this._textarea.value = v ?? '';
      this._updateCounter?.();
    }
  }

  _render() {
    const state = enumAttr(this, 'state', STATES, 'default');
    const size = enumAttr(this, 'size', SIZES, 'large');
    const position = enumAttr(this, 'label-position', POSITIONS, 'left');
    const label = this.getAttribute('label') || '';
    const placeholder = this.getAttribute('placeholder') || '';
    const value = this.getAttribute('value') ?? '';
    const required = boolAttr(this, 'required');
    const helper = this.getAttribute('helper') || '';
    const counter = this.getAttribute('counter') || '';
    const showCounter = boolAttr(this, 'show-counter');
    const showHelperRow = (helper || showCounter) && (!this.hasAttribute('show-helper-row') || this.getAttribute('show-helper-row') !== 'false');
    /* Spec default for max-lines is 2 (each line = 20 px). */
    const maxLines = parseInt(this.getAttribute('max-lines') || '2', 10);
    const rtl = boolAttr(this, 'rtl');

    this._root.className = `ds-text-area ds-text-area--${state} ds-text-area--${position} ds-text-area--${size}`;
    if (rtl) this._root.setAttribute('dir', 'rtl');
    else this._root.removeAttribute('dir');

    /* Label row: label + required(*) + optional help-circle icon — the same
       pattern as ds-text-input / ds-token-field. With `label-help` text the
       icon gets a hover tooltip; it always emits ds-text-area-help on click. */
    const showLabelHelp = boolAttr(this, 'show-label-help-icon');
    const labelHelpText = this.getAttribute('label-help') || '';
    const labelHelpBtn = `<button type="button" class="ds-text-area__label-help" aria-label="${labelHelpText ? esc(labelHelpText) : 'Help'}" data-label-help><ds-icon name="help-circle" size="16"></ds-icon></button>`;
    const labelHelpHTML = showLabelHelp
      ? (labelHelpText
          ? `<ds-tooltip class="ds-text-area__label-help-tip" text="${esc(labelHelpText)}" position="up-center" theme="dark"${rtl ? ' rtl' : ''}>${labelHelpBtn}</ds-tooltip>`
          : labelHelpBtn)
      : '';
    /* label-position="none" hides the label; kept as an accessible name via
       aria-label on the textarea (set after render). */
    const labelHTML = (label && position !== 'none')
      ? `<span class="ds-text-area__label-row"><label class="ds-text-area__label" for="${this._id}">${label}${required ? '<span class="ds-text-area__required">*</span>' : ''}</label>${labelHelpHTML}</span>`
      : '';

    /* The whole helper row is one <ds-field-helper id="…-helper"> (icon + text
       + counter), so aria-describedby points at it (spec a11y requirement). */
    const helperId  = `${this._id}-helper`;
    const describedBy = (showHelperRow && (helper || (showCounter && counter))) ? helperId : '';

    const fieldHTML = `<div class="ds-text-area__field">
      <textarea id="${this._id}" placeholder="${placeholder}" rows="${maxLines}"
                ${state === 'readonly' ? 'readonly aria-readonly="true"' : ''}
                ${state === 'disabled' ? 'disabled' : ''}
                ${required ? 'required aria-required="true"' : ''}
                ${state === 'error' ? 'aria-invalid="true"' : ''}
                ${describedBy ? `aria-describedby="${describedBy}"` : ''}>${value.replace(/</g, '&lt;')}</textarea>
    </div>`;

    /* Helper/counter row = shared <ds-field-helper>. State drives colour + icon;
       counter pins to the trailing edge. Hide the icon on a counter-only row. */
    const helperState = state === 'error' ? 'error'
      : state === 'success' ? 'success'
      : state === 'disabled' ? 'disabled' : 'default';
    const helperHTML = showHelperRow
      ? `<ds-field-helper class="ds-text-area__helper-row" id="${helperId}"
           text="${esc(helper)}" state="${helperState}"
           ${helper ? '' : 'show-icon="false"'}
           ${showCounter && counter ? `counter="${esc(counter)}"` : ''}
           ${rtl ? 'rtl' : ''}></ds-field-helper>`
      : '';

    if (position === 'left') {
      this._root.innerHTML = `<div class="ds-text-area__label-col">${labelHTML}</div><div class="ds-text-area__body">${fieldHTML}${helperHTML}</div>`;
    } else {
      this._root.innerHTML = `${labelHTML}<div class="ds-text-area__body">${fieldHTML}${helperHTML}</div>`;
    }

    this._textarea = this._root.querySelector('textarea');
    if (position === 'none' && label) this._textarea.setAttribute('aria-label', label);

    /* Live counter — same contract as ds-text-input: derive the max from the
       counter attr ("0/500" → 500), cap the input length, and recompute
       "<len>/<max>" on every change. */
    const helperEl = this._root.querySelector('ds-field-helper');
    let maxChars = null;
    if (counter) { const m = /\/\s*(\d+)/.exec(counter); if (m) maxChars = parseInt(m[1], 10); }
    if (maxChars != null) this._textarea.maxLength = maxChars;
    const updateCounter = () => {
      if (showCounter && helperEl && maxChars != null) {
        helperEl.setAttribute('counter', `${this._textarea.value.length}/${maxChars}`);
      }
    };
    this._updateCounter = updateCounter; /* value setter re-syncs the counter */
    updateCounter(); // sync to the initial value on render

    this._textarea.addEventListener('input', () => {
      updateCounter();
      this.dispatchEvent(new CustomEvent('ds-input', { bubbles: true, detail: { value: this._textarea.value } }));
    });

    this._root.querySelector('[data-label-help]')?.addEventListener('click', () => {
      this.dispatchEvent(new CustomEvent('ds-text-area-help', { bubbles: true }));
    });

    /* Custom corner resize grip — pinned to the field's edge (the native
       textarea grip sits inset of the field padding) and resizes BOTH axes,
       clamped to the body container's width. Not offered while readonly/disabled. */
    this._field = this._root.querySelector('.ds-text-area__field');
    if (state !== 'disabled' && state !== 'readonly') {
      const grip = document.createElement('button');
      grip.type = 'button';
      grip.className = 'ds-text-area__resizer';
      grip.setAttribute('aria-label', 'Resize text area');
      /* Classic native-textarea grip glyph: two short diagonal lines. */
      grip.innerHTML = `<svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
        <path d="M11 5.5 5.5 11M11 9.5 9.5 11" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
      </svg>`;
      this._field.appendChild(grip);
      this._wireResizer(grip, rtl, maxLines);
    }
    /* Re-apply a user-dragged size across re-renders (attribute changes). */
    if (this._size) this._sizeTo(this._size.w, this._size.h);
  }

  /* Apply a resize: width goes on the body (lifting its default max-width cap so it
     can grow past 320/400 up to the container), height on the field. The body is a
     flex item (`flex:1` / stretched), so an explicit width is otherwise ignored —
     drop grow + stretch so the set width actually takes. */
  _sizeTo(w, h) {
    const body = this._root.querySelector('.ds-text-area__body');
    if (body) {
      body.style.flex = '0 0 auto';
      body.style.alignSelf = 'flex-start';
      body.style.maxWidth = 'none';
      body.style.width = `${w}px`;
    }
    this._field.style.height = `${h}px`;
  }

  _wireResizer(grip, rtl, maxLines) {
    const MIN_W = 160;
    const minH = maxLines * 20 + 18; /* rows + field padding/border */
    const body = this._root.querySelector('.ds-text-area__body');
    /* Resolve direction at interaction time from the computed style, so a horizontal
       drag grows the field the correct way whether RTL comes from the `rtl` attr OR
       an inherited RTL page (the grip sits at the inline-end edge, which flips with
       the resolved direction — the drag sign must flip with it). */
    const rtlNow = () => getComputedStyle(this._field).direction === 'rtl' || rtl;
    /* Max width = the real available column, NOT the body's default max-width cap
       (320/400) — otherwise the field starts at that cap and can only ever shrink,
       so horizontal resize looks dead ("vertical only"). Measure the body's parent
       content box minus any left-layout label column, so growth stays container-bound. */
    const availW = () => {
      const parent = body.parentElement || this._root;
      const pcs = getComputedStyle(parent);
      let w = parent.clientWidth - (parseFloat(pcs.paddingLeft) || 0) - (parseFloat(pcs.paddingRight) || 0);
      const labelCol = this._root.querySelector('.ds-text-area__label-col');
      if (labelCol && parent.contains(labelCol)) w -= labelCol.getBoundingClientRect().width + 8;
      return Math.max(MIN_W, w);
    };
    const clamp = (w, h) => [
      Math.min(availW(), Math.max(MIN_W, w)),
      Math.min(window.innerHeight * 0.8, Math.max(minH, h)),
    ];

    grip.addEventListener('pointerdown', (e) => {
      e.preventDefault();
      const dir = rtlNow() ? -1 : 1;
      const r = this._field.getBoundingClientRect();
      const sx = e.clientX, sy = e.clientY, sw = r.width, sh = r.height;
      const move = (ev) => {
        const dw = (ev.clientX - sx) * dir;
        this._applySize(...clamp(sw + dw, sh + (ev.clientY - sy)));
      };
      const up = () => {
        window.removeEventListener('pointermove', move);
        window.removeEventListener('pointerup', up);
      };
      window.addEventListener('pointermove', move);
      window.addEventListener('pointerup', up);
    });

    /* Double-click resets to the natural (attribute-driven) size. */
    grip.addEventListener('dblclick', () => {
      this._size = null;
      if (body) { body.style.flex = ''; body.style.alignSelf = ''; body.style.maxWidth = ''; body.style.width = ''; }
      this._field.style.width = '';
      this._field.style.height = '';
    });

    /* Keyboard: arrows resize in 8px steps (grip is a real, focusable button). */
    grip.addEventListener('keydown', (e) => {
      const step = { ArrowRight: [8, 0], ArrowLeft: [-8, 0], ArrowDown: [0, 8], ArrowUp: [0, -8] }[e.key];
      if (!step) return;
      e.preventDefault();
      const r = this._field.getBoundingClientRect();
      this._applySize(...clamp(r.width + step[0] * (rtlNow() ? -1 : 1), r.height + step[1]));
    });
  }

  _applySize(w, h) {
    this._size = { w: Math.round(w), h: Math.round(h) };
    this._sizeTo(this._size.w, this._size.h);
    this.dispatchEvent(new CustomEvent('ds-resize', { bubbles: true, detail: { width: this._size.w, height: this._size.h } }));
  }
}

if (typeof customElements !== 'undefined' && !customElements.get('ds-text-area')) {
  customElements.define('ds-text-area', DsTextArea);
}
