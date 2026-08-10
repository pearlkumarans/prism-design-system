/* =============================================================================
   <ds-time-picker label="Start time" value="09:30">

   A time picker per UEMS DS spec. One primitive, two Phase-1 panel variants:

     variant="list"   (default) → a ds-text-input trigger + an anchored popover
                                   listbox of times at a `step` interval. The
                                   field is editable — users can type "9:30 pm",
                                   "930", "14:00" and it parses forgivingly.
     variant="inline"           → a self-contained segmented HH : MM (AM/PM)
                                   field with per-key spin editing + a stepper
                                   column. No popover.

   Canonical value is locale-independent 24-hour "HH:mm" (e.g. "14:30"); the
   display is formatted per `hour-cycle` (12 → "2:30 PM", 24 → "14:30"). This
   mirrors how <ds-date-picker> stores ISO and lets the two compose into a
   datetime picker later.

   Attributes:
     variant           "list" | "inline"           default "list"
     value             "HH:mm" (24h), e.g. "09:30"
     hour-cycle        "12" | "24"                  default "12"
     step              minutes between options      default 30   (list only)
     min, max          "HH:mm" bounds (inclusive)
     size              "small" | "medium" | "large" default "medium"
     label             default "Select time"
     label-position    "none" | "top" | "left"      default "left"
     placeholder       default derived from hour-cycle
     show-now          boolean — pinned "Now" row/button
     clearable         boolean — Clear control
     required, disabled, rtl, open
     helper-text
     validation-state  "none" | "success" | "error"

   Properties:
     value             string  "HH:mm"
     disabledTimes     Array<"HH:mm"> | (mins:number) => boolean

   Events:
     ds-time-picker-change   { value, hours, minutes }
     ds-time-picker-open
     ds-time-picker-close
     ds-time-picker-input    { raw }        (live typing, list variant)
   ============================================================================= */

import { boolAttr, enumAttr } from '../../utils/attr.js';

/* Reuse <ds-text-input> for the list trigger — single source of truth for field
   styling (size, border, focus ring, prefix-icon, states). */
import '../text-input/text-input.js';
import '../field-helper/field-helper.js';
/* Inline-variant stepper arrows reuse <ds-icon-button> (chevron up / down). */
import '../icon-button/icon-button.js';

/* Auto-load dependent stylesheets (both are light-DOM, so their CSS must be
   present even on pages that load time-picker.css individually). */
function _injectCss(id, rel) {
  if (typeof document === 'undefined' || document.getElementById(id)) return;
  const l = document.createElement('link');
  l.id = id; l.rel = 'stylesheet';
  l.href = new URL(rel, import.meta.url).href;
  document.head.appendChild(l);
}
_injectCss('ds-time-picker-ti-css', '../text-input/text-input.css');
_injectCss('ds-time-picker-fh-css', '../field-helper/field-helper.css');
_injectCss('ds-time-picker-ib-css', '../icon-button/icon-button.css');

const VARIANTS = ['list', 'inline'];
const TYPES = ['single', 'range'];
const SIZES = ['small', 'medium', 'large'];
const CYCLES = ['12', '24'];
const VALIDATIONS = ['none', 'success', 'error'];
const RANGE_SEP = ' – ';   /* en-dash separator for the range field display */

const esc = (s) => String(s).replace(/[&<>"]/g, (c) =>
  ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

const DAY_MINS = 24 * 60;
const pad2 = (n) => String(n).padStart(2, '0');
const clamp = (n, lo, hi) => Math.max(lo, Math.min(hi, n));
const mod = (n, m) => ((n % m) + m) % m;

/* "HH:mm" (24h) → minutes-since-midnight (0..1439), or null. */
const hhmmToMins = (str) => {
  if (!/^\d{1,2}:\d{2}$/.test(str || '')) return null;
  const [h, m] = str.split(':').map(Number);
  if (h > 23 || m > 59) return null;
  return h * 60 + m;
};
const minsToHHMM = (mins) => `${pad2(Math.floor(mins / 60))}:${pad2(mins % 60)}`;

/* minutes → display string per hour-cycle. */
const fmtDisplay = (mins, cycle) => {
  if (mins == null) return '';
  const h = Math.floor(mins / 60), m = mins % 60;
  if (cycle === '24') return `${pad2(h)}:${pad2(m)}`;
  const ap = h < 12 ? 'AM' : 'PM';
  let hr = h % 12; if (hr === 0) hr = 12;
  return `${hr}:${pad2(m)} ${ap}`;
};

/* Forgiving parse of a typed string → minutes, or null. Accepts:
     "9", "9:30", "930", "0930", "1430", "2:30 pm", "2p", "12:00am". */
const parseTyped = (raw, cycle) => {
  if (raw == null) return null;
  let s = String(raw).trim().toLowerCase();
  if (!s) return null;
  let ap = null;
  const apMatch = /([ap])\.?m?\.?$/.exec(s);
  if (apMatch) { ap = apMatch[1]; s = s.slice(0, apMatch.index).trim(); }
  s = s.replace(/[^\d:]/g, '');
  if (!s) return null;
  let h, m;
  if (s.includes(':')) {
    const [hs, ms = ''] = s.split(':');
    h = parseInt(hs, 10); m = ms === '' ? 0 : parseInt(ms, 10);
  } else if (s.length <= 2) {
    h = parseInt(s, 10); m = 0;
  } else {
    h = parseInt(s.slice(0, -2), 10); m = parseInt(s.slice(-2), 10);
  }
  if (isNaN(h)) return null;
  if (isNaN(m)) m = 0;
  if (ap) {                       // 12-hour meridiem normalisation
    if (h === 12) h = 0;
    if (ap === 'p') h += 12;
  }
  if (h > 23 || m > 59 || h < 0 || m < 0) return null;
  return h * 60 + m;
};

const nowMins = () => { const d = new Date(); return d.getHours() * 60 + d.getMinutes(); };

let tpUid = 0;

export class DsTimePicker extends HTMLElement {
  static get observedAttributes() {
    return [
      'variant', 'type', 'value', 'hour-cycle', 'step', 'min', 'max',
      'size', 'label', 'label-position', 'placeholder',
      'show-now', 'clearable', 'required', 'disabled',
      'helper-text', 'validation-state', 'rtl', 'open',
    ];
  }

  constructor() {
    super();
    this._uid = ++tpUid;
    this._isOpen = false;
    this._activeMins = null;   // highlighted option in the list
    this._disabledTimes = null;
    this._presets = null;
    this._rStart = null; this._rEnd = null; this._rStep = 'start';  // range picking state
    // deferred-upgrade recovery — a property may be set before the element upgrades
    for (const prop of ['value', 'disabledTimes', 'presets']) {
      if (Object.prototype.hasOwnProperty.call(this, prop)) {
        const v = this[prop]; delete this[prop]; this[prop] = v;
      }
    }
    this._docClickHandler = (e) => {
      if (!this._isOpen) return;
      const path = typeof e.composedPath === 'function' ? e.composedPath() : [];
      if (path.includes(this) || (this._popover && path.includes(this._popover))) return;
      this._close();
    };
    this._docKeyHandler = (e) => {
      if (e.key === 'Escape' && this._isOpen) { e.stopPropagation(); this._closeAndRefocus(); }
    };
  }

  connectedCallback() {
    if (!this._mounted) { this._build(); this._mounted = true; }
    this._sync();
  }

  disconnectedCallback() {
    document.removeEventListener('click', this._docClickHandler);
    document.removeEventListener('keydown', this._docKeyHandler, true);
    this._unbindReanchor();
    if (this._popover && this._popover.parentNode) this._popover.parentNode.removeChild(this._popover);
  }

  attributeChangedCallback(name) {
    if (!this._mounted) return;
    /* Structural rebuilds: switching variant, or switching type in the inline
       variant (single = one segment group, range = two). The list variant
       handles a type switch in _renderList, so it only needs a re-sync. */
    if (name === 'variant' || (name === 'type' && this._variant === 'inline')) {
      if (this._popover && this._popover.parentNode) this._popover.parentNode.removeChild(this._popover);
      this._mounted = false; this._cal = null;
      this._build(); this._mounted = true; this._sync();
      return;
    }
    if (name === 'open') {
      if (boolAttr(this, 'open')) this._open(); else this._close();
      return;
    }
    this._sync();
  }

  /* ---- config accessors -------------------------------------------------- */
  get _variant() { return enumAttr(this, 'variant', VARIANTS, 'list'); }
  get _cycle()   { return enumAttr(this, 'hour-cycle', CYCLES, '12'); }
  get _step()    { return Math.max(1, parseInt(this.getAttribute('step') || '30', 10) || 30); }
  get _minMins() { return hhmmToMins(this.getAttribute('min')) ?? 0; }
  get _maxMins() { return hhmmToMins(this.getAttribute('max')) ?? (DAY_MINS - 1); }
  get _type()    { return enumAttr(this, 'type', TYPES, 'single'); }

  _isDisabledMins(mins) {
    if (mins < this._minMins || mins > this._maxMins) return true;
    const d = this._disabledTimes;
    if (typeof d === 'function') return !!d(mins);
    if (Array.isArray(d)) return d.map(hhmmToMins).includes(mins);
    return false;
  }

  /* Range value helpers — value is "HH:mm/HH:mm". */
  _rangeFromValue() {
    const [s, e] = (this.getAttribute('value') || '').split('/');
    return { s: hhmmToMins(s), e: hhmmToMins(e) };
  }
  _fmtRangeDisplay(sMins, eMins) {
    if (sMins == null && eMins == null) return '';
    const c = this._cycle;
    return `${sMins == null ? '' : fmtDisplay(sMins, c)}${RANGE_SEP}${eMins == null ? '' : fmtDisplay(eMins, c)}`;
  }

  /* ======================================================================= */
  /*  BUILD                                                                   */
  /* ======================================================================= */
  _build() {
    this.classList.add('ds-time-picker');
    if (this._variant === 'inline') this._buildInline();
    else this._buildList();
  }

  _buildList() {
    this.classList.remove('ds-time-picker--inline');
    this.innerHTML = `
      <div class="ds-time-picker__frame">
        <div class="ds-time-picker__label-col">
          <label class="ds-time-picker__label" id="ds-tp-${this._uid}-label"></label>
        </div>
        <div class="ds-time-picker__field-col">
          <ds-text-input
            class="ds-time-picker__input"
            size="medium"
            prefix-icon="clock"
            label-position="top"
            show-helper-row="false"
            autocomplete="off"
            role="combobox"
            aria-haspopup="listbox"
            aria-expanded="false"
          ></ds-text-input>
          <ds-field-helper class="ds-time-picker__helper" hidden></ds-field-helper>
        </div>
      </div>
      <div class="ds-time-picker__popover" role="dialog" aria-modal="false" hidden>
        <ul class="ds-time-picker__list" role="listbox" id="ds-tp-${this._uid}-list" tabindex="-1"></ul>
      </div>`;

    this._labelEl   = this.querySelector('.ds-time-picker__label');
    this._helperEl  = this.querySelector('.ds-time-picker__helper');
    this._inputWrap = this.querySelector('.ds-time-picker__input');
    this._popover   = this.querySelector('.ds-time-picker__popover');
    this._listEl    = this.querySelector('.ds-time-picker__list');

    /* Live accessor for the current inner <input> (ds-text-input re-renders it
       on attribute change, so never cache a stale reference). */
    Object.defineProperty(this, '_field', {
      get: () => this._inputWrap.querySelector('input'),
      configurable: true,
    });

    /* Event delegation on the wrapper survives text-input's inner re-renders. */
    this._inputWrap.addEventListener('mousedown', (e) => {
      /* The built-in clear button (`clearable`) handles its own click — don't
         toggle the popover for it. */
      if (e.target.closest('[data-clear]')) return;
      const inputEl = this._field;
      if (inputEl && e.target !== inputEl) { e.preventDefault(); inputEl.focus(); }
      this._toggle();
    });
    this._inputWrap.addEventListener('focusin', () => this._open());
    /* `clearable` → ds-text-input renders its clear affordance and fires this. */
    this._inputWrap.addEventListener('ds-text-input-clear', () => {
      if (this._type === 'range') this._clearRange(); else this._commitMins(null);
      if (this._isOpen) this._renderList();
    });
    this._inputWrap.addEventListener('input', () => {
      this.dispatchEvent(new CustomEvent('ds-time-picker-input', {
        bubbles: true, detail: { raw: this._field ? this._field.value : '' },
      }));
      if (!this._isOpen) this._open();
      this._renderList();     // live-filter to typed text
    });
    this._inputWrap.addEventListener('keydown', (e) => this._onFieldKeydown(e));
    this._inputWrap.addEventListener('change', () => this._commitTyped());

    this._listEl.addEventListener('mousedown', (e) => {
      // Range end-step "back to start" link.
      if (e.target.closest('[data-rback]')) { e.preventDefault(); this._rStep = 'start'; this._renderList(); return; }
      const opt = e.target.closest('[data-mins], [data-range]');
      if (!opt || opt.getAttribute('aria-disabled') === 'true') return;
      e.preventDefault();                 // keep field focus
      if (opt.dataset.range != null) {    // whole-range preset
        this._commitRangeValue(opt.dataset.range);
        this._closeAndRefocus();
        return;
      }
      const mins = parseInt(opt.dataset.mins, 10);
      if (this._type === 'range') { this._pickRange(mins); return; }
      this._commitMins(mins);
      this._closeAndRefocus();
    });
  }

  _buildInline() {
    this.classList.add('ds-time-picker--inline');
    const cyc = this._cycle;
    const isRange = this._type === 'range';
    /* One segment group per endpoint. `side` is "" for single, "start"/"end"
       for range — carried on each control via data-side so handlers resolve the
       owning group. */
    const group = (side, lbl) => `
      <input class="ds-time-picker__seg" data-seg="h" data-side="${side}" inputmode="numeric"
             role="spinbutton" aria-label="Hour${lbl}" autocomplete="off" placeholder="HH" />
      <span class="ds-time-picker__colon" aria-hidden="true">:</span>
      <input class="ds-time-picker__seg" data-seg="m" data-side="${side}" inputmode="numeric"
             role="spinbutton" aria-label="Minute${lbl}" autocomplete="off" placeholder="MM" />
      <button type="button" class="ds-time-picker__ampm" data-seg="ap" data-side="${side}"
              ${cyc === '24' ? 'hidden' : ''} aria-label="AM or PM${lbl}">AM</button>`;
    const segmentsInner = isRange
      ? group('start', ' (start)')
        + `<span class="ds-time-picker__range-dash" aria-hidden="true">${RANGE_SEP.trim()}</span>`
        + group('end', ' (end)')
      : group('', '');
    this.innerHTML = `
      <div class="ds-time-picker__label-col">
        <label class="ds-time-picker__label" id="ds-tp-${this._uid}-label"></label>
      </div>
      <div class="ds-time-picker__field-col">
        <div class="ds-time-picker__inline-field" role="group">
          <div class="ds-time-picker__segments">${segmentsInner}</div>
          <ds-icon-button class="ds-time-picker__clear" size="xsmall" type="tertiary-grey"
            shape="square" no-tooltip icon="cancel" label="Clear" hidden></ds-icon-button>
          <div class="ds-time-picker__steppers" aria-hidden="true">
            <ds-icon-button class="ds-time-picker__step" data-dir="up"
              size="xsmall" type="tertiary-grey" shape="square" no-tooltip
              icon="chevron-up" label="Increment"></ds-icon-button>
            <ds-icon-button class="ds-time-picker__step" data-dir="down"
              size="xsmall" type="tertiary-grey" shape="square" no-tooltip
              icon="chevron-down" label="Decrement"></ds-icon-button>
          </div>
        </div>
        <ds-field-helper class="ds-time-picker__helper" hidden></ds-field-helper>
      </div>`;

    this._labelEl  = this.querySelector('.ds-time-picker__label');
    this._helperEl = this.querySelector('.ds-time-picker__helper');
    this._inlineEl = this.querySelector('.ds-time-picker__inline-field');
    this._clearBtn = this.querySelector('.ds-time-picker__clear');

    // Build a group descriptor per side; attach `_grp` to each control.
    const sides = isRange ? ['start', 'end'] : [''];
    this._groups = sides.map((side) => {
      const sel = `[data-side="${side}"]`;
      const grp = {
        side,
        elH:  this._inlineEl.querySelector(`.ds-time-picker__seg[data-seg="h"]${sel}`),
        elM:  this._inlineEl.querySelector(`.ds-time-picker__seg[data-seg="m"]${sel}`),
        elAP: this._inlineEl.querySelector(`.ds-time-picker__ampm[data-seg="ap"]${sel}`),
        state: { h: '', m: '', ap: 'AM' },
      };
      [grp.elH, grp.elM, grp.elAP].forEach((el) => { el._grp = grp; });
      return grp;
    });
    this._allSegEls = this._groups.flatMap((g) => [g.elH, g.elM, g.elAP]);
    this._focusedSeg = this._groups[0].elH;

    this._groups.forEach((grp) => {
      [grp.elH, grp.elM].forEach((seg) => {
        seg.addEventListener('focus', () => { this._focusedSeg = seg; seg.select?.(); });
        seg.addEventListener('keydown', (e) => this._onSegKeydown(e, seg));
        seg.addEventListener('beforeinput', (e) => this._onSegBeforeInput(e, seg));
        seg.addEventListener('blur', () => this._normaliseSeg(seg));
      });
      grp.elAP.addEventListener('focus', () => { this._focusedSeg = grp.elAP; });
      grp.elAP.addEventListener('click', () => this._toggleAP(grp));
      grp.elAP.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowUp' || e.key === 'ArrowDown') { e.preventDefault(); this._toggleAP(grp); }
        else if (/^[aApP]$/.test(e.key)) { e.preventDefault(); this._setAP(grp, /[aA]/.test(e.key) ? 'AM' : 'PM'); }
      });
    });

    this.querySelectorAll('.ds-time-picker__step').forEach((btn) => {
      /* Steppers are a decorative mouse affordance — keyboard uses the segment
         spinbuttons' arrow keys. Keep the <ds-icon-button>'s inner <button> out
         of the tab order (the wrapper is aria-hidden). */
      btn.querySelector('button')?.setAttribute('tabindex', '-1');
      btn.addEventListener('mousedown', (e) => {
        e.preventDefault();               // keep segment focus; don't focus the arrow
        const seg = this._focusedSeg || this._groups[0].elH;
        this._stepSeg(seg, btn.dataset.dir === 'up' ? +1 : -1);
      });
    });
    this._clearBtn.querySelector('button')?.setAttribute('tabindex', '-1');
    this._clearBtn.addEventListener('mousedown', (e) => {
      e.preventDefault();
      this._clearInline();
    });
  }

  /* Flat, visual-order list of focusable segments (AP only in 12-hour mode). */
  _orderedSegs() {
    const list = [];
    this._groups.forEach((g) => { list.push(g.elH, g.elM); if (this._cycle === '12') list.push(g.elAP); });
    return list;
  }

  _clearInline() {
    if (boolAttr(this, 'disabled')) return;
    this._groups.forEach((g) => { g.state.h = ''; g.state.m = ''; });
    this._paintSegments();
    if (this.getAttribute('value')) { this.removeAttribute('value'); this._emitChange(); }
    this._groups[0].elH.focus();
    this._syncInline(false, enumAttr(this, 'validation-state', VALIDATIONS, 'none'), null, null, boolAttr(this, 'rtl'));
  }

  /* ======================================================================= */
  /*  SYNC (attributes → DOM)                                                 */
  /* ======================================================================= */
  _sync() {
    const disabled = boolAttr(this, 'disabled');
    const rtl = boolAttr(this, 'rtl');
    const required = boolAttr(this, 'required');
    const validation = enumAttr(this, 'validation-state', VALIDATIONS, 'none');
    const size = enumAttr(this, 'size', SIZES, 'medium');
    const labelPos = enumAttr(this, 'label-position', ['none', 'top', 'left'], 'left');
    const labelText = this.getAttribute('label') ?? 'Select time';
    const helper = this.getAttribute('helper-text') || '';

    this.classList.toggle('ds-time-picker--left', labelPos === 'left');
    this.classList.toggle('ds-time-picker--top', labelPos === 'top');
    this.classList.toggle('ds-time-picker--none', labelPos === 'none');
    this.classList.toggle('ds-time-picker--size-small',  size === 'small');
    this.classList.toggle('ds-time-picker--size-medium', size === 'medium');
    this.classList.toggle('ds-time-picker--size-large',  size === 'large');
    this.classList.toggle('ds-time-picker--disabled', disabled);
    if (rtl) this.setAttribute('dir', 'rtl'); else this.removeAttribute('dir');
    this.dataset.validation = validation;

    // Label (+ required marker)
    if (this._labelEl && labelPos !== 'none') {
      this._labelEl.textContent = labelText;
      if (required) {
        const star = document.createElement('span');
        star.className = 'ds-time-picker__required'; star.textContent = '*';
        this._labelEl.appendChild(star);
      }
    }

    // Helper row (shared field-helper — state drives icon + colour)
    if (this._helperEl) {
      const helperState = disabled ? 'disabled'
        : validation === 'error' ? 'error'
        : validation === 'success' ? 'success' : 'default';
      this._helperEl.setAttribute('text', helper);
      this._helperEl.setAttribute('state', helperState);
      if (rtl) this._helperEl.setAttribute('rtl', ''); else this._helperEl.removeAttribute('rtl');
      this._helperEl.hidden = !helper;
    }

    if (this._variant === 'inline') this._syncInline(disabled, validation, labelPos, labelText, rtl);
    else this._syncList(disabled, validation, size, labelPos, labelText, rtl);
  }

  _syncList(disabled, validation, size, labelPos, labelText, rtl) {
    const ti = this._inputWrap;
    ti.setAttribute('size', size);
    if (labelPos === 'none' && labelText) {
      ti.setAttribute('label', labelText); ti.setAttribute('label-position', 'none');
    } else {
      ti.removeAttribute('label'); ti.setAttribute('label-position', 'top');
    }
    const singlePh = this._cycle === '24' ? 'HH:MM' : 'HH:MM AM/PM';
    ti.setAttribute('placeholder', this.getAttribute('placeholder')
      || (this._type === 'range' ? `Start${RANGE_SEP}End` : singlePh));
    this.classList.toggle('ds-time-picker--range', this._type === 'range');
    if (disabled) ti.setAttribute('state', 'disabled');
    else if (validation === 'error') ti.setAttribute('state', 'error');
    else if (validation === 'success') ti.setAttribute('state', 'success');
    else ti.setAttribute('state', 'default');
    if (rtl) ti.setAttribute('rtl', ''); else ti.removeAttribute('rtl');
    if (boolAttr(this, 'clearable') && !disabled) ti.setAttribute('show-clear', '');
    else ti.removeAttribute('show-clear');

    // Reflect the current value into the field text.
    let display;
    if (this._type === 'range') {
      const { s, e } = this._rangeFromValue();
      display = this._fmtRangeDisplay(s, e);
    } else {
      const mins = hhmmToMins(this.getAttribute('value'));
      display = mins == null ? '' : fmtDisplay(mins, this._cycle);
    }
    ti.setAttribute('value', display);
    if (this._field) this._field.value = display;
    this._field?.setAttribute('aria-controls', `ds-tp-${this._uid}-list`);
  }

  _syncInline(disabled, validation, labelPos, labelText, rtl) {
    this._inlineEl.classList.toggle('is-error', validation === 'error');
    this._inlineEl.classList.toggle('is-success', validation === 'success');
    this._inlineEl.setAttribute('aria-label', labelPos === 'none' ? labelText : 'Time');
    this.classList.toggle('ds-time-picker--range', this._type === 'range');
    this._allSegEls.forEach((el) => {
      if (disabled) el.setAttribute('disabled', ''); else el.removeAttribute('disabled');
    });
    this._groups.forEach((g) => { g.elAP.hidden = this._cycle === '24'; });
    /* Load each group's state from the value only when it DIFFERS from what the
       segments already represent — so an external `value` change drives the
       field, while an internal keystroke (which just wrote the same value)
       doesn't clobber a half-typed segment ("4" then "5" must build "45"). */
    let hasValue;
    if (this._type === 'range') {
      const { s, e } = this._rangeFromValue();
      if (s != null && s !== this._segmentsToMins(this._groups[0])) this._minsToSegments(s, this._groups[0]);
      if (e != null && e !== this._segmentsToMins(this._groups[1])) this._minsToSegments(e, this._groups[1]);
      hasValue = s != null && e != null;
    } else {
      const mins = hhmmToMins(this.getAttribute('value'));
      if (mins != null && mins !== this._segmentsToMins(this._groups[0])) this._minsToSegments(mins, this._groups[0]);
      hasValue = mins != null;
    }
    this._paintSegments();
    // Clear affordance — only when `clearable`, enabled, and there's a value.
    if (this._clearBtn) this._clearBtn.hidden = !(boolAttr(this, 'clearable') && !disabled && hasValue);
  }

  /* ======================================================================= */
  /*  LIST VARIANT                                                            */
  /* ======================================================================= */
  _renderList() {
    if (!this._listEl) return;
    if (this._type === 'range') return this._renderRangeList();
    return this._renderSingleList();
  }

  /* Custom preset rows (`.presets` = [{label, value}]). value is "HH:mm"
     (single) or "HH:mm/HH:mm" (range). Rendered pinned at the top of the list. */
  _presetRows() {
    if (!Array.isArray(this._presets) || !this._presets.length) return [];
    const isRange = this._type === 'range';
    return this._presets.map((p) => {
      if (isRange) {
        const [s, e] = String(p.value || '').split('/');
        if (hhmmToMins(s) == null || hhmmToMins(e) == null) return '';
        return `<li class="ds-time-picker__option ds-time-picker__option--preset" role="option"
                    data-range="${esc(p.value)}">${esc(p.label)}</li>`;
      }
      const mins = hhmmToMins(p.value);
      if (mins == null) return '';
      return `<li class="ds-time-picker__option ds-time-picker__option--preset" role="option"
                  data-mins="${mins}">${esc(p.label)}</li>`;
    }).filter(Boolean);
  }

  _renderSingleList() {
    const cycle = this._cycle;
    const selected = hhmmToMins(this.getAttribute('value'));
    const step = this._step;
    // Optional live filter from typed text.
    const rawTyped = this._field ? this._field.value.trim() : '';
    const typedMins = rawTyped ? parseTyped(rawTyped, cycle) : null;
    const filter = rawTyped && typedMins == null ? rawTyped.toLowerCase() : null;

    const rows = filter ? [] : this._presetRows();
    if (!filter && boolAttr(this, 'show-now')) {
      const nm = nowMins();
      rows.push(`<li class="ds-time-picker__option ds-time-picker__option--now" role="option"
                     data-mins="${nm}" data-now="1">Now &middot; ${fmtDisplay(nm, cycle)}</li>`);
    }
    let firstEnabled = null;
    for (let t = this._minMins; t <= this._maxMins; t += step) {
      const label = fmtDisplay(t, cycle);
      if (filter && !label.toLowerCase().includes(filter)) continue;
      const disabled = this._isDisabledMins(t);
      const isSel = t === selected;
      if (!disabled && firstEnabled == null) firstEnabled = t;
      rows.push(
        `<li class="ds-time-picker__option${isSel ? ' is-selected' : ''}" role="option"
             id="ds-tp-${this._uid}-opt-${t}" data-mins="${t}"
             aria-selected="${isSel ? 'true' : 'false'}"
             ${disabled ? 'aria-disabled="true"' : ''}>${label}</li>`
      );
    }
    if (!rows.length) rows.push(`<li class="ds-time-picker__empty" role="presentation">No matching time</li>`);
    this._listEl.innerHTML = rows.join('');

    // Active-descendant defaults to selection, else typed match, else first enabled.
    this._activeMins = selected != null && !this._isDisabledMins(selected)
      ? selected : (typedMins != null ? typedMins : firstEnabled);
    this._paintActive();
    this._scrollActiveIntoView();
  }

  /* Range picker — a two-step flow in the SAME single listbox: pick Start, then
     the list re-renders to pick End (times after start). Keeps the single-list
     roving-tabindex keyboard model intact; the field shows "start – end" live. */
  _renderRangeList() {
    const cycle = this._cycle, step = this._step;
    const picking = this._rStep || 'start';
    const rows = this._presetRows();
    if (picking === 'start') {
      rows.push(`<li class="ds-time-picker__rhead" role="presentation">Start time</li>`);
    } else {
      const sTxt = this._rStart != null ? fmtDisplay(this._rStart, cycle) : '';
      rows.push(`<li class="ds-time-picker__rhead" role="presentation">`
        + `<button type="button" class="ds-time-picker__rback" data-rback aria-label="Back to start time">&lsaquo; ${esc(sTxt)}</button>`
        + `<span>End time</span></li>`);
    }
    const selMins = picking === 'start' ? this._rStart : this._rEnd;
    let firstEnabled = null, optCount = 0;
    for (let t = this._minMins; t <= this._maxMins; t += step) {
      if (picking === 'end' && this._rStart != null && t <= this._rStart) continue;  // end after start
      const disabled = this._isDisabledMins(t);
      const isSel = t === selMins;
      if (!disabled && firstEnabled == null) firstEnabled = t;
      optCount++;
      rows.push(
        `<li class="ds-time-picker__option${isSel ? ' is-selected' : ''}" role="option"
             id="ds-tp-${this._uid}-opt-${t}" data-mins="${t}"
             aria-selected="${isSel ? 'true' : 'false'}"
             ${disabled ? 'aria-disabled="true"' : ''}>${fmtDisplay(t, cycle)}</li>`
      );
    }
    if (!optCount) rows.push(`<li class="ds-time-picker__empty" role="presentation">No times available</li>`);
    this._listEl.innerHTML = rows.join('');
    this._activeMins = (selMins != null && !this._isDisabledMins(selMins)) ? selMins : firstEnabled;
    this._paintActive();
    this._scrollActiveIntoView();
  }

  _pickRange(mins) {
    if ((this._rStep || 'start') === 'start') {
      this._rStart = mins;
      if (this._rEnd != null && this._rEnd <= mins) this._rEnd = null;
      this._rStep = 'end';
      if (this._field) this._field.value = this._fmtRangeDisplay(this._rStart, this._rEnd);
      this._renderList();          // stay open; show the End step
    } else {
      this._rEnd = mins;
      this._commitRange();
      this._closeAndRefocus();
    }
  }

  _commitRange() {
    if (this._rStart == null || this._rEnd == null) return;
    const v = `${minsToHHMM(this._rStart)}/${minsToHHMM(this._rEnd)}`;
    const prev = this.getAttribute('value') || '';
    this.setAttribute('value', v);
    if (v !== prev) this._emitChange();
  }

  _commitRangeValue(str) {           // preset "HH:mm/HH:mm"
    const [s, e] = String(str).split('/');
    const sm = hhmmToMins(s), em = hhmmToMins(e);
    if (sm == null || em == null) return;
    this._rStart = sm; this._rEnd = em;
    this._commitRange();
  }

  _clearRange() {
    this._rStart = null; this._rEnd = null; this._rStep = 'start';
    if (this.getAttribute('value')) { this.removeAttribute('value'); this._emitChange(); }
    if (this._field) this._field.value = '';
  }

  _paintActive() {
    if (!this._listEl) return;
    this._listEl.querySelectorAll('.is-active').forEach((el) => el.classList.remove('is-active'));
    const el = this._activeMins == null ? null
      : this._listEl.querySelector(`[data-mins="${this._activeMins}"]`);
    if (el) {
      el.classList.add('is-active');
      this._field?.setAttribute('aria-activedescendant', el.id || '');
    } else {
      this._field?.removeAttribute('aria-activedescendant');
    }
  }

  _scrollActiveIntoView() {
    this._scrollOptionIntoView(
      this._listEl?.querySelector('.is-active') || this._listEl?.querySelector('.is-selected')
    );
  }

  /* Scroll ONLY the list's own scroll container to reveal `el` — never call
     el.scrollIntoView(), which also scrolls every scrollable ancestor (and the
     page): the popover is portaled to <body> with position:fixed, so a native
     scrollIntoView would yank the whole page to the popover and thrash the
     scroll-reanchor handler. Here we adjust list.scrollTop by the overflow delta
     only, which leaves the page untouched. */
  _scrollOptionIntoView(el) {
    const list = this._listEl;
    if (!el || !list) return;
    const lr = list.getBoundingClientRect();
    const er = el.getBoundingClientRect();
    if (er.top < lr.top) list.scrollTop -= (lr.top - er.top);
    else if (er.bottom > lr.bottom) list.scrollTop += (er.bottom - lr.bottom);
  }

  _moveActive(dir) {
    const opts = [...this._listEl.querySelectorAll('[data-mins]:not([aria-disabled="true"])')];
    if (!opts.length) return;
    let idx = opts.findIndex((el) => parseInt(el.dataset.mins, 10) === this._activeMins);
    idx = idx === -1 ? (dir > 0 ? 0 : opts.length - 1) : clamp(idx + dir, 0, opts.length - 1);
    this._activeMins = parseInt(opts[idx].dataset.mins, 10);
    this._paintActive();
    this._scrollOptionIntoView(opts[idx]);
  }

  _onFieldKeydown(e) {
    switch (e.key) {
      case 'ArrowDown': e.preventDefault(); if (!this._isOpen) this._open(); else this._moveActive(+1); break;
      case 'ArrowUp':   e.preventDefault(); if (!this._isOpen) this._open(); else this._moveActive(-1); break;
      case 'Enter':
        if (this._isOpen && this._activeMins != null) {
          e.preventDefault();
          if (this._type === 'range') this._pickRange(this._activeMins);
          else { this._commitMins(this._activeMins); this._close(); }
        } else this._commitTyped();
        break;
      case 'Home': if (this._isOpen) { e.preventDefault(); this._activeMins = null; this._moveActive(+1); } break;
      case 'End':  if (this._isOpen) { e.preventDefault(); this._activeMins = null; this._moveActive(-1); } break;
      case 'Tab':  if (this._isOpen) this._close(); break;
      default: break;
    }
  }

  _commitTyped() {
    if (!this._field) return;
    const raw = this._field.value.trim();
    if (this._type === 'range') return this._commitTypedRange(raw);
    if (!raw) { this._commitMins(null); return; }
    const mins = parseTyped(raw, this._cycle);
    if (mins == null || this._isDisabledMins(mins)) {
      // Revert to the last valid value's display.
      const cur = hhmmToMins(this.getAttribute('value'));
      this._field.value = cur == null ? '' : fmtDisplay(cur, this._cycle);
      return;
    }
    this._commitMins(mins);
  }

  _commitTypedRange(raw) {
    const revert = () => {
      const { s, e } = this._rangeFromValue();
      if (this._field) this._field.value = this._fmtRangeDisplay(s, e);
    };
    if (!raw) { this._clearRange(); return; }
    const parts = raw.split(/\s*(?:–|—|-|\bto\b|\/)\s*/i).map((p) => p.trim()).filter(Boolean);
    const s = parseTyped(parts[0], this._cycle);
    const e = parts[1] != null ? parseTyped(parts[1], this._cycle) : null;
    if (s == null || e == null || e <= s || this._isDisabledMins(s) || this._isDisabledMins(e)) {
      revert();
      return;
    }
    this._rStart = s; this._rEnd = e;
    this._commitRange();
  }

  _toggle() { if (this._isOpen) this._close(); else this._open(); }

  /* Close the list but keep focus on the field for keyboard continuity. The
     `_suppressReopen` flag is held true across the synchronous focus() so the
     field's own `focusin` handler doesn't immediately re-open what we just closed
     (the cause of the "dropdown reopens after selecting / Escape" bug). */
  _closeAndRefocus() {
    this._close();
    this._suppressReopen = true;
    this._field?.focus();
    this._suppressReopen = false;
  }

  _open() {
    if (this._isOpen || this._suppressReopen || boolAttr(this, 'disabled') || this._variant !== 'list') return;
    this._isOpen = true;
    if (this._type === 'range') {      // seed picking state from the committed value, start at step 1
      const { s, e } = this._rangeFromValue();
      this._rStart = s; this._rEnd = e; this._rStep = 'start';
    }
    if (this._popover.parentNode !== document.body) document.body.appendChild(this._popover);
    this._popover.hidden = false;      // unhide BEFORE rendering so scrollIntoView can measure
    this._renderList();
    this._position();
    this._bindReanchor();
    this.setAttribute('open', '');
    this._field?.setAttribute('aria-expanded', 'true');
    document.addEventListener('click', this._docClickHandler);
    document.addEventListener('keydown', this._docKeyHandler, true);
    this.dispatchEvent(new CustomEvent('ds-time-picker-open', { bubbles: true }));
  }

  _close() {
    if (!this._isOpen) return;
    this._isOpen = false;
    this._popover.hidden = true;
    this._unbindReanchor();
    this.removeAttribute('open');
    this._field?.setAttribute('aria-expanded', 'false');
    this._field?.removeAttribute('aria-activedescendant');
    document.removeEventListener('click', this._docClickHandler);
    document.removeEventListener('keydown', this._docKeyHandler, true);
    this.dispatchEvent(new CustomEvent('ds-time-picker-close', { bubbles: true }));
  }

  /* Portal to <body> + position:fixed so no ancestor overflow/transform can clip
     it. Anchored under the field, flips above when short on space. */
  _position() {
    const pop = this._popover;
    const anchor = this._inputWrap || this;
    const r = anchor.getBoundingClientRect();
    if (!r.width && !r.height) return;
    pop.style.position = 'fixed'; pop.style.margin = '0'; pop.style.zIndex = '9999';
    pop.style.minWidth = `${Math.round(r.width)}px`;
    const ph = pop.offsetHeight, pw = pop.offsetWidth || r.width;
    const vw = window.innerWidth, vh = window.innerHeight, M = 8, GAP = 6;
    let top = r.bottom + GAP, left = r.left;
    if (top + ph > vh - M && r.top - ph - GAP >= M) top = r.top - ph - GAP;
    left = Math.max(M, Math.min(left, vw - pw - M));
    top = Math.max(M, Math.min(top, vh - ph - M));
    pop.style.top = `${Math.round(top)}px`;
    pop.style.left = `${Math.round(left)}px`;
    pop.style.right = 'auto'; pop.style.bottom = 'auto';
  }

  _bindReanchor() {
    if (this._reanchor) return;
    this._reanchor = (e) => {
      if (!this._isOpen) return;
      /* Ignore the list's OWN internal scroll (capture-phase scroll fires for
         descendants too) — only page/ancestor scrolls should re-anchor. */
      if (e && e.type === 'scroll' && e.target && this._popover.contains(e.target)) return;
      this._position();
    };
    window.addEventListener('scroll', this._reanchor, true);
    window.addEventListener('resize', this._reanchor);
  }
  _unbindReanchor() {
    if (!this._reanchor) return;
    window.removeEventListener('scroll', this._reanchor, true);
    window.removeEventListener('resize', this._reanchor);
    this._reanchor = null;
  }

  /* ======================================================================= */
  /*  INLINE VARIANT                                                          */
  /* ======================================================================= */
  _minsToSegments(mins, grp) {
    const st = grp.state;
    const h24 = Math.floor(mins / 60), m = mins % 60;
    if (this._cycle === '24') {
      st.h = pad2(h24);
    } else {
      st.ap = h24 < 12 ? 'AM' : 'PM';
      let hr = h24 % 12; if (hr === 0) hr = 12;
      st.h = pad2(hr);
    }
    st.m = pad2(m);
  }

  /* Canonical minutes for a group's current segment strings, or null if the
     entry is incomplete/invalid. */
  _segmentsToMins(grp) {
    const st = grp.state;
    const h = parseInt(st.h, 10);
    const m = parseInt(st.m, 10);
    if (isNaN(h) || isNaN(m)) return null;
    let h24 = h;
    if (this._cycle === '12') {
      if (h < 1 || h > 12) return null;
      h24 = h % 12; if (st.ap === 'PM') h24 += 12;
    } else if (h > 23) return null;
    if (m > 59) return null;
    return h24 * 60 + m;
  }

  _groupEmpty(grp) { return grp.state.h === '' && grp.state.m === ''; }

  _paintSegments() { this._groups.forEach((g) => this._paintGroup(g)); }
  _paintGroup(grp) {
    const st = grp.state;
    grp.elH.value = st.h;
    grp.elM.value = st.m;
    grp.elAP.textContent = st.ap;
    const hMaxHi = this._cycle === '12' ? 12 : 23;
    const hMinLo = this._cycle === '12' ? 1 : 0;
    this._setSpin(grp.elH, hMinLo, hMaxHi, st.h,
      st.h ? (this._cycle === '12' && st.h === '00' ? '12' : st.h) : 'Empty');
    this._setSpin(grp.elM, 0, 59, st.m, st.m || 'Empty');
    grp.elAP.setAttribute('aria-label', st.ap === 'AM' ? 'AM' : 'PM');
  }
  _setSpin(el, lo, hi, val, text) {
    el.setAttribute('aria-valuemin', lo);
    el.setAttribute('aria-valuemax', hi);
    if (val === '' || isNaN(parseInt(val, 10))) el.removeAttribute('aria-valuenow');
    else el.setAttribute('aria-valuenow', parseInt(val, 10));
    el.setAttribute('aria-valuetext', text);
  }

  _onSegBeforeInput(e, seg) {
    // Only digits; we manage the value ourselves for masked 2-char behaviour.
    if (e.inputType && e.inputType.startsWith('insert')) {
      e.preventDefault();
      const ch = e.data;
      if (!/^\d$/.test(ch || '')) return;
      this._typeDigit(seg, ch);
    } else if (e.inputType && e.inputType.startsWith('delete')) {
      e.preventDefault();
      const grp = seg._grp;
      grp.state[seg === grp.elH ? 'h' : 'm'] = '';
      this._paintGroup(grp);
      this._commitInline();
    }
  }

  _typeDigit(seg, ch) {
    const grp = seg._grp;
    const isH = seg === grp.elH;
    const key = isH ? 'h' : 'm';
    let cur = grp.state[key];
    // Start fresh if the segment already holds 2 chars.
    let next = cur.length >= 2 ? ch : cur + ch;
    const n = parseInt(next, 10);
    const hiFirst = isH ? (this._cycle === '12' ? 1 : 2) : 5;   // first-digit ceiling for auto-advance
    let advance = false;
    if (next.length === 1) {
      // A first digit that can't be extended completes the segment immediately.
      if (parseInt(ch, 10) > hiFirst) { next = pad2(parseInt(ch, 10)); advance = true; }
    } else {
      // Second digit: clamp to valid range.
      const hi = isH ? (this._cycle === '12' ? 12 : 23) : 59;
      const lo = isH && this._cycle === '12' ? 1 : 0;
      if (n > hi) next = pad2(hi); else if (n < lo) next = pad2(lo); else next = pad2(n);
      advance = true;
    }
    grp.state[key] = next;
    this._paintGroup(grp);
    this._commitInline();
    if (advance) this._advanceFrom(seg);
  }

  /* Move focus to the next focusable segment (across groups for range). */
  _advanceFrom(seg) {
    const order = this._orderedSegs();
    const i = order.indexOf(seg);
    if (i >= 0 && i + 1 < order.length) { const nx = order[i + 1]; nx.focus(); nx.select?.(); }
  }

  _normaliseSeg(seg) {
    const grp = seg._grp;
    const isH = seg === grp.elH;
    const key = isH ? 'h' : 'm';
    let v = grp.state[key];
    if (v === '') return;
    let n = parseInt(v, 10);
    if (isNaN(n)) { grp.state[key] = ''; }
    else {
      const hi = isH ? (this._cycle === '12' ? 12 : 23) : 59;
      const lo = isH && this._cycle === '12' ? 1 : 0;
      grp.state[key] = pad2(clamp(n, lo, hi));
    }
    this._paintGroup(grp);
    this._commitInline();
  }

  _onSegKeydown(e, seg) {
    const order = this._orderedSegs();
    const i = order.indexOf(seg);
    switch (e.key) {
      case 'ArrowUp':   e.preventDefault(); this._stepSeg(seg, +1); break;
      case 'ArrowDown': e.preventDefault(); this._stepSeg(seg, -1); break;
      case 'ArrowRight': if (i >= 0 && i + 1 < order.length) { e.preventDefault(); order[i + 1].focus(); } break;
      case 'ArrowLeft':  if (i > 0) { e.preventDefault(); order[i - 1].focus(); } break;
      case ':': case ' ': if (i >= 0 && i + 1 < order.length) { e.preventDefault(); order[i + 1].focus(); } break;
      default: break;
    }
  }

  _stepSeg(seg, delta) {
    if (boolAttr(this, 'disabled')) return;
    const grp = seg._grp;
    if (seg === grp.elAP) { this._toggleAP(grp); return; }
    const isH = seg === grp.elH;
    const key = isH ? 'h' : 'm';
    const hi = isH ? (this._cycle === '12' ? 12 : 23) : 59;
    let cur = parseInt(grp.state[key], 10);
    if (isNaN(cur)) cur = isH ? (this._cycle === '12' ? 12 : 0) : 0;
    let next;
    if (isH && this._cycle === '12') next = ((cur - 1 + delta + 12) % 12) + 1;   // wrap 1..12
    else next = mod(cur + delta, hi + 1);                                        // wrap 0..hi
    grp.state[key] = pad2(next);
    this._paintGroup(grp);
    this._commitInline();
    seg.focus?.();
  }

  _toggleAP(grp) { this._setAP(grp, grp.state.ap === 'AM' ? 'PM' : 'AM'); }
  _setAP(grp, ap) {
    if (boolAttr(this, 'disabled')) return;
    grp.state.ap = ap;
    this._paintGroup(grp);
    this._commitInline();
  }

  _commitInline() {
    const prev = this.getAttribute('value') || '';
    if (this._type === 'range') {
      const [gs, ge] = this._groups;
      if (this._groupEmpty(gs) && this._groupEmpty(ge)) {
        if (prev) { this.removeAttribute('value'); this._emitChange(); }
        return;
      }
      const s = this._segmentsToMins(gs), e = this._segmentsToMins(ge);
      // Only commit a complete, valid, ordered range; partial edits keep prev.
      if (s == null || e == null || e <= s || this._isDisabledMins(s) || this._isDisabledMins(e)) return;
      const next = `${minsToHHMM(s)}/${minsToHHMM(e)}`;
      if (next !== prev) { this.setAttribute('value', next); this._emitChange(); }
      return;
    }
    const g = this._groups[0];
    const mins = this._segmentsToMins(g);
    if (mins == null) {
      if (this._groupEmpty(g)) { if (prev) { this.removeAttribute('value'); this._emitChange(); } }
      return;
    }
    if (this._isDisabledMins(mins)) return;
    const next = minsToHHMM(mins);
    if (next !== prev) { this.setAttribute('value', next); this._emitChange(); }
  }

  /* ======================================================================= */
  /*  SHARED                                                                  */
  /* ======================================================================= */
  _commitMins(mins) {
    if (mins == null) { if (this.getAttribute('value')) { this.removeAttribute('value'); this._emitChange(); } return; }
    if (this._isDisabledMins(mins)) return;
    const next = minsToHHMM(mins);
    const prev = this.getAttribute('value') || '';
    this.setAttribute('value', next);
    if (this._field) this._field.value = fmtDisplay(mins, this._cycle);
    if (next !== prev) this._emitChange();
  }

  _emitChange() {
    const value = this.getAttribute('value') || '';
    let detail;
    if (this._type === 'range') {
      const { s, e } = this._rangeFromValue();
      detail = { value, start: s == null ? null : minsToHHMM(s), end: e == null ? null : minsToHHMM(e) };
    } else {
      const mins = hhmmToMins(value);
      detail = { value, hours: mins == null ? null : Math.floor(mins / 60), minutes: mins == null ? null : mins % 60 };
    }
    this.dispatchEvent(new CustomEvent('ds-time-picker-change', { bubbles: true, composed: true, detail }));
  }

  // Public API
  get value() { return this.getAttribute('value') || ''; }
  set value(v) {
    if (v) this.setAttribute('value', v); else this.removeAttribute('value');
  }
  get disabledTimes() { return this._disabledTimes; }
  set disabledTimes(v) { this._disabledTimes = v; if (this._mounted) this._sync(); }
  get presets() { return this._presets; }
  set presets(v) { this._presets = Array.isArray(v) ? v : null; if (this._isOpen) this._renderList(); }
}

if (typeof customElements !== 'undefined' && !customElements.get('ds-time-picker')) {
  customElements.define('ds-time-picker', DsTimePicker);
}
