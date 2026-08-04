/* =============================================================================
   <ds-radio-group label="Frequency" name="freq" size="m" state="default"
                   helper="We'll send alerts based on this preference."
                   label-position="left" show-info rtl>
     label-position: left|top (default left) — also sets option flow (left→row,
       top→column) unless `orientation` overrides it.
     orientation: horizontal|vertical (optional) — lay options out in a row or a
       column independent of label-position (e.g. label on top + options in a row).
     ... configured via the `options` property:

       group.options = [
         { value: 'realtime', label: 'Real-time' },
         { value: 'daily',    label: 'Daily digest', selected: true },
         { value: 'weekly',   label: 'Weekly summary' },
         { value: 'never',    label: 'Never', disabled: true },
       ];

     Per-option `description` (optional) renders a wrapping helper line under the
     label, indented to align with it and wired via aria-describedby. It accepts
     trusted inline HTML (e.g. <strong>), like ds-inline-alert's description — keep
     callers to known-safe strings. Any described option switches the group to a
     vertical stack (descriptions need their own line):
       { value: 'machine', label: 'On each machine',
         description: 'Agents patch from <strong>each machine\'s own repos</strong>.' }

   Structure mirrors <ds-checkbox-group>: a __header (group label + optional info)
   beside/above a __body (__items + helper row). Uses role="radiogroup" +
   aria-labelledby (NOT <fieldset>/<legend>, which the Left 240px-column layout
   can't host). Cascades size / state / rtl onto the child <ds-radio> controls.

   Events: ds-radio-group-change → detail: { value }
   ============================================================================= */

import { boolAttr, enumAttr } from '../../utils/attr.js';
/* Composes the standalone single radio (as ds-checkbox-group composes ds-checkbox). */
import '../radio/radio.js';
/* Helper/note row = the shared "Form Field Helper Row" sub-component. */
import '../field-helper/field-helper.js';

/* Auto-load field-helper.css once (light-DOM, so it must be present even on
   pages that load radio-group.css individually). */
function _injectCss(id, rel) {
  if (typeof document === 'undefined' || document.getElementById(id)) return;
  const l = document.createElement('link');
  l.id = id; l.rel = 'stylesheet'; l.href = new URL(rel, import.meta.url).href;
  document.head.appendChild(l);
}
_injectCss('ds-radio-group-fh-css', '../field-helper/field-helper.css');

const SIZES = ['s', 'm', 'l', 'mobile'];
const STATES = ['default', 'error', 'disabled'];
const POSITIONS = ['none', 'left', 'top'];
const VARIANTS = ['default', 'card'];
/* Option flow. Unset = follow label-position (left→row, top→column, the historic
   coupling). Set explicitly to lay options out independent of the label. */
const ORIENTATIONS = ['horizontal', 'vertical'];

const esc = (s) => String(s)
  .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

let _uid = 0;

export class DsRadioGroup extends HTMLElement {
  static get observedAttributes() {
    return ['label', 'helper', 'size', 'state', 'label-position', 'orientation', 'name', 'rtl', 'value', 'show-info', 'variant'];
  }

  constructor() {
    super();
    /* Allow `el.options = [...]` set before upgrade. */
    if (Object.prototype.hasOwnProperty.call(this, 'options')) {
      const v = this.options; delete this.options; this._pending = v;
    }
    this._options = [];
    this._uid = ++_uid;
  }

  connectedCallback() {
    if (!this._mounted) {
      this._build();
      this._mounted = true;
      /* One delegated listener (vs per-item) — the newly-checked radio bubbles
         ds-radio-change; mirror its selection onto the options model + re-emit. */
      this.addEventListener('ds-radio-change', (e) => {
        if (!e.detail?.checked) return;
        const idx = Number(e.target?.closest?.('ds-radio')?.dataset.index);
        if (Number.isNaN(idx)) return;
        this._options.forEach((o, i) => { o.selected = (i === idx); });
        this.dispatchEvent(new CustomEvent('ds-radio-group-change', {
          bubbles: true, detail: { value: this.value },
        }));
      });
    }
    if (this._pending !== undefined) { this.options = this._pending; this._pending = undefined; }
    this._sync();
  }

  attributeChangedCallback(name) {
    if (!this._mounted) return;
    if (name === 'value') {
      const v = this.getAttribute('value');
      this._options.forEach((o) => { o.selected = (o.value === v); });
    }
    this._sync();
  }

  get options() { return this._options; }
  set options(v) { this._options = Array.isArray(v) ? v.slice() : []; if (this._mounted) this._sync(); }

  get value() { return this._options.find((o) => o.selected)?.value ?? null; }
  set value(v) {
    this._options.forEach((o) => { o.selected = (o.value === v); });
    if (this._mounted) this._sync();
  }

  /* Build the stable shell once: header (label + info) + body (items + helper).
     The item list is (re)rendered from `options` in _sync; the helper row is a
     persistent <ds-field-helper> instance. */
  _build() {
    const sprite = (typeof window !== 'undefined' && window.UEMS_ICON_SPRITE) || '/icons.svg';
    this._labelId = `ds-rg-label-${this._uid}`;
    /* header + body live in a __frame so the flex layout sits on the frame, not
       the host — the host is a `container-type` query container, letting the
       left↔stacked switch respond to the field's own width (see CSS). */
    this.innerHTML = `
      <div class="ds-radio-group__frame">
        <div class="ds-radio-group__header">
          <span class="ds-radio-group__label" id="${this._labelId}"></span>
          <span class="ds-radio-group__info" aria-hidden="true" hidden>
            <svg width="20" height="20" focusable="false" aria-hidden="true">
              <use href="${sprite}#icon-help-circle"></use>
            </svg>
          </span>
        </div>
        <div class="ds-radio-group__body">
          <div class="ds-radio-group__items" role="radiogroup" aria-labelledby="${this._labelId}"></div>
          <div class="ds-radio-group__helper">
            <ds-field-helper class="ds-radio-group__help"></ds-field-helper>
          </div>
        </div>
      </div>`;

    this._header  = this.querySelector('.ds-radio-group__header');
    this._labelEl = this.querySelector('.ds-radio-group__label');
    this._infoEl  = this.querySelector('.ds-radio-group__info');
    this._itemsEl = this.querySelector('.ds-radio-group__items');
    this._helperEl = this.querySelector('.ds-radio-group__helper');
    this._helpEl  = this.querySelector('.ds-radio-group__help');
  }

  _sync() {
    const label    = this.getAttribute('label') || '';
    const helper   = this.getAttribute('helper') || '';
    const size     = enumAttr(this, 'size',           SIZES,     's');
    const state    = enumAttr(this, 'state',          STATES,    'default');
    const position = enumAttr(this, 'label-position', POSITIONS, 'left');
    const variant  = enumAttr(this, 'variant',        VARIANTS,  'default');
    const orientation = ORIENTATIONS.includes(this.getAttribute('orientation')) ? this.getAttribute('orientation') : '';
    const rtl      = boolAttr(this, 'rtl');
    const showInfo = boolAttr(this, 'show-info');

    this.classList.add('ds-radio-group');
    this.classList.toggle('ds-radio-group--left', position === 'left');
    this.classList.toggle('ds-radio-group--top',  position === 'top');
    this.classList.toggle('ds-radio-group--none', position === 'none');
    this.classList.toggle('ds-radio-group--horizontal', orientation === 'horizontal');
    this.classList.toggle('ds-radio-group--vertical',   orientation === 'vertical');
    this.classList.toggle('ds-radio-group--card', variant === 'card');
    this.classList.toggle('ds-radio-group--has-desc', this._options.some((o) => o.description != null && o.description !== ''));
    this.classList.toggle('ds-radio-group--error',    state === 'error');
    this.classList.toggle('ds-radio-group--disabled', state === 'disabled');
    if (rtl) this.setAttribute('dir', 'rtl'); else this.removeAttribute('dir');

    // Header. label-position="none" hides it entirely; the label text stays in
    // the (hidden) span so the group's aria-labelledby still resolves an
    // accessible name for screen readers.
    this._labelEl.textContent = label;
    this._header.hidden = position === 'none' || !(label || showInfo);
    this._infoEl.hidden = !(showInfo && label);

    // Items — cascade size / state / rtl onto each child <ds-radio>.
    this._renderItems(size, state, rtl);

    // Helper row (shared <ds-field-helper>): state drives colour + leading icon.
    const helperState = state === 'error' ? 'error' : state === 'disabled' ? 'disabled' : 'default';
    this._helpEl.setAttribute('text', helper);
    this._helpEl.setAttribute('state', helperState);
    if (rtl) this._helpEl.setAttribute('rtl', ''); else this._helpEl.removeAttribute('rtl');
    this._helperEl.hidden = !helper;
  }

  _renderItems(size, state, rtl) {
    const name = this.getAttribute('name') || `ds-radio-${this._uid}`;
    const groupDisabled = state === 'disabled';
    const isCard = enumAttr(this, 'variant', VARIANTS, 'default') === 'card';
    /* Indent descriptions by (radio circle + gap) so they sit under the label. */
    const circle = size === 's' ? 16 : size === 'l' ? 24 : 20;
    const gap = size === 'mobile' ? 12 : 8;
    this._itemsEl.style.setProperty('--ds-rg-desc-indent', `${circle + gap}px`);

    this._itemsEl.innerHTML = this._options.map((o, i) => {
      const hasDesc = o.description != null && o.description !== '';
      const radio = `<ds-radio name="${esc(name)}" value="${esc(o.value)}" label="${esc(o.label ?? o.value)}"`
        + ` size="${size}" data-index="${i}"`
        + (o.selected ? ' checked' : '')
        + ((o.disabled || groupDisabled) ? ' disabled' : '')
        + (state === 'error' ? ' error' : '')
        + (rtl ? ' rtl' : '') + '></ds-radio>';
      const tip = o.info
        ? `<ds-tooltip class="ds-radio-group__option-info" text="${esc(o.info)}" show-icon="false" position="up-center"><ds-icon name="info-circle" size="16"></ds-icon></ds-tooltip>`
        : '';
      /* Trusted inline HTML (e.g. <strong>) — like ds-inline-alert's description. */
      const desc = hasDesc
        ? `<span class="ds-radio-group__option-desc" id="ds-rg-desc-${this._uid}-${i}">${o.description}</span>`
        : '';
      /* The .ds-radio-group__option wrapper only earns its keep when it carries the
         card surface, a per-option info tooltip, OR a description. A described option
         stacks the radio (+info) over the description via an inner control row;
         otherwise the <ds-radio> goes straight into __items (like ds-checkbox-group). */
      if (!isCard && !o.info && !hasDesc) return radio;
      if (hasDesc) {
        return `<span class="ds-radio-group__option ds-radio-group__option--described">`
          + `<span class="ds-radio-group__option-control">${radio}${tip}</span>${desc}</span>`;
      }
      return `<span class="ds-radio-group__option">${radio}${tip}</span>`;
    }).join('');

    /* Associate each described radio's input with its description for screen readers
       (ds-radio is light-DOM, so its input is queryable after this innerHTML set). */
    this._options.forEach((o, i) => {
      if (o.description == null || o.description === '') return;
      const input = this._itemsEl.querySelector(`ds-radio[data-index="${i}"] .ds-radio__input`);
      if (input) input.setAttribute('aria-describedby', `ds-rg-desc-${this._uid}-${i}`);
    });
  }
}

if (typeof customElements !== 'undefined' && !customElements.get('ds-radio-group')) {
  customElements.define('ds-radio-group', DsRadioGroup);
}
