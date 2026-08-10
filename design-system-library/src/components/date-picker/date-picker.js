/* =============================================================================
   <ds-date-picker label="Due date" required show-presets show-footer>

   A date picker per UEMS DS spec:
     - type="single"  → one input + single calendar
     - type="range"   → two inputs + dual calendar
     - show-presets   → optional left column with quick-select shortcuts
                         (Today, Yesterday, Last 7 days, Last 30 days,
                          This month, Last month, Custom)
     - show-footer    → optional Clear / Cancel / Apply row.
                        When on, selections are staged until Apply.

   Attributes:
     type              "single" | "range"            default "single"
     value             ISO single ("YYYY-MM-DD") or "YYYY-MM-DD/YYYY-MM-DD"
     label             default "Select Date"
     required          boolean
     disabled          boolean
     placeholder       default "DD/MM/YYYY"
     format            default "DD/MM/YYYY"
     min, max          passthrough to <ds-calendar>
     helper-text
     validation-state  "none" | "success" | "error"
     show-presets      boolean (default false)
     show-footer       boolean (default false)
     apply-label / cancel-label / clear-label
     rtl, open

   Events:
     ds-date-picker-change   { type, value, start?, end? }
     ds-date-picker-open
     ds-date-picker-close
   ============================================================================= */

import { boolAttr, enumAttr } from '../../utils/attr.js';
/* Reuse <ds-text-input> for the trigger field — single source of truth for
   input styling (size, border, focus ring, prefix-icon, etc.). */
import '../text-input/text-input.js';

/* Auto-load text-input.css so the slotted <ds-text-input> in light DOM is
   styled regardless of which page hosts the date picker. */
if (typeof document !== 'undefined') {
  const id = 'ds-date-picker-text-input-css';
  if (!document.getElementById(id)) {
    const link = document.createElement('link');
    link.id = id;
    link.rel = 'stylesheet';
    link.href = new URL('../text-input/text-input.css', import.meta.url).href;
    document.head.appendChild(link);
  }
}

/* Helper/note row = the shared "Form Field Helper Row" sub-component. */
import '../field-helper/field-helper.js';
/* Embedded time picker (inline variant) for the datetime mode (`enable-time`). */
import '../time-picker/time-picker.js';
if (typeof document !== 'undefined') {
  [['ds-date-picker-fh-css', '../field-helper/field-helper.css'],
   ['ds-date-picker-tp-css', '../time-picker/time-picker.css']].forEach(([id, rel]) => {
    if (document.getElementById(id)) return;
    const link = document.createElement('link');
    link.id = id; link.rel = 'stylesheet';
    link.href = new URL(rel, import.meta.url).href;
    document.head.appendChild(link);
  });
}

const TYPES = ['single', 'range'];
const VALIDATIONS = ['none', 'success', 'error'];
const CYCLES = ['12', '24'];

/* Datetime value helpers — value is "YYYY-MM-DD" (date) or "YYYY-MM-DDTHH:mm". */
const dateOf = (v) => (v || '').split('T')[0];
const timeOf = (v) => { const i = (v || '').indexOf('T'); return i >= 0 ? v.slice(i + 1) : ''; };
const fmtTime = (hhmm, cycle) => {
  if (!/^\d{1,2}:\d{2}$/.test(hhmm || '')) return '';
  let [h, m] = hhmm.split(':').map(Number);
  if (cycle === '24') return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
  const ap = h < 12 ? 'AM' : 'PM'; let hr = h % 12; if (hr === 0) hr = 12;
  return `${hr}:${String(m).padStart(2, '0')} ${ap}`;
};
/* Lenient "9:30 pm" / "21:30" / "930" → "HH:mm" (24h), or null. */
const parseTimeStr = (raw, cycle) => {
  if (!raw) return null;
  let s = String(raw).trim().toLowerCase(); let ap = null;
  const m = /([ap])\.?m?\.?$/.exec(s);
  if (m) { ap = m[1]; s = s.slice(0, m.index).trim(); }
  s = s.replace(/[^\d:]/g, ''); if (!s) return null;
  let h, mm;
  if (s.includes(':')) { const [hs, ms = ''] = s.split(':'); h = parseInt(hs, 10); mm = ms === '' ? 0 : parseInt(ms, 10); }
  else if (s.length <= 2) { h = parseInt(s, 10); mm = 0; }
  else { h = parseInt(s.slice(0, -2), 10); mm = parseInt(s.slice(-2), 10); }
  if (isNaN(h)) return null; if (isNaN(mm)) mm = 0;
  if (ap) { if (h === 12) h = 0; if (ap === 'p') h += 12; }
  if (h > 23 || mm > 59 || h < 0 || mm < 0) return null;
  return `${String(h).padStart(2, '0')}:${String(mm).padStart(2, '0')}`;
};
const SIZES = ['small', 'medium', 'large'];

const startOfDay = (d) => new Date(d.getFullYear(), d.getMonth(), d.getDate());
const addDays = (d, n) => {
  const r = new Date(d); r.setDate(r.getDate() + n); return r;
};
const startOfMonth = (d) => new Date(d.getFullYear(), d.getMonth(), 1);
const endOfMonth = (d) => new Date(d.getFullYear(), d.getMonth() + 1, 0);

const DEFAULT_PRESETS = [
  { id: 'today',       label: 'Today',
    getRange: () => { const t = startOfDay(new Date()); return [t, t]; } },
  { id: 'yesterday',   label: 'Yesterday',
    getRange: () => { const y = addDays(startOfDay(new Date()), -1); return [y, y]; } },
  { id: 'last7',       label: 'Last 7 days',
    getRange: () => { const t = startOfDay(new Date()); return [addDays(t, -6), t]; } },
  { id: 'last30',      label: 'Last 30 days',
    getRange: () => { const t = startOfDay(new Date()); return [addDays(t, -29), t]; } },
  { id: 'thisMonth',   label: 'This month',
    getRange: () => { const t = new Date(); return [startOfMonth(t), endOfMonth(t)]; } },
  { id: 'lastMonth',   label: 'Last month',
    getRange: () => {
      const t = new Date(); const lm = new Date(t.getFullYear(), t.getMonth() - 1, 1);
      return [startOfMonth(lm), endOfMonth(lm)];
    } },
  { id: 'custom',      label: 'Custom', getRange: () => null },
];

const MONTHS = [
  'January','February','March','April','May','June',
  'July','August','September','October','November','December',
];

const pad2 = (n) => String(n).padStart(2, '0');
const fmtInput = (date, pattern = 'DD/MM/YYYY') => {
  if (!(date instanceof Date) || isNaN(date)) return '';
  return pattern
    .replace('DD', pad2(date.getDate()))
    .replace('MM', pad2(date.getMonth() + 1))
    .replace('YYYY', String(date.getFullYear()));
};
const fmtDay = (d) =>
  d ? `${d.getDate()} ${MONTHS[d.getMonth()]}, ${d.getFullYear()}` : '';
const toISO = (d) => d ? `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}` : '';
const fromISO = (s) => {
  if (!s) return null;
  const [y, m, d] = s.split('-').map(Number);
  if (!y || !m || !d) return null;
  return new Date(y, m - 1, d);
};
const parseInputStr = (str, pattern = 'DD/MM/YYYY') => {
  if (!str) return null;
  const tokens = pattern.match(/(DD|MM|YYYY)/g) || [];
  const parts = str.split(/[\/\-.\s]/);
  if (parts.length !== 3) return null;
  const obj = {};
  tokens.forEach((token, i) => { obj[token] = parseInt(parts[i], 10); });
  if (!obj.DD || !obj.MM || !obj.YYYY) return null;
  const d = new Date(obj.YYYY, obj.MM - 1, obj.DD);
  return isNaN(d) ? null : d;
};

let pickerUid = 0;

export class DsDatePicker extends HTMLElement {
  static get observedAttributes() {
    return [
      'type', 'value', 'label', 'required', 'disabled',
      'placeholder', 'format', 'min', 'max',
      'helper-text', 'validation-state',
      'show-presets', 'show-footer',
      'apply-label', 'cancel-label', 'clear-label',
      'label-position', 'size', 'rtl', 'open',
      'enable-time', 'hour-cycle', 'time-step', 'time-label',
    ];
  }

  constructor() {
    super();
    this._uid = ++pickerUid;
    this._isOpen = false;
    this._staged = '';     // Staged value while popover is open with show-footer
    this._committed = '';  // Last committed value (for Cancel revert)
    this._activePresetId = null;  // Explicitly chosen preset ('custom' has no value to derive from)
    this._docClickHandler = (e) => {
      if (!this._isOpen) return;
      /* Use composedPath so an "outside" check survives the synchronous
         re-render that follows a day click — the original e.target gets
         detached when the calendar pane is rebuilt, but composedPath was
         captured at dispatch time and still lists this host. */
      const path = typeof e.composedPath === 'function' ? e.composedPath() : [];
      /* The popover is portaled to <body>, so it is no longer a descendant of
         the host — treat clicks inside it as "inside" too. */
      if (path.includes(this) || (this._popover && path.includes(this._popover))) return;
      this._close();
    };
    this._docKeyHandler = (e) => {
      if (e.key === 'Escape' && this._isOpen) this._close();
    };
  }

  connectedCallback() {
    if (!this._mounted) {
      this._build();
      this._mounted = true;
    }
    this._sync();
  }

  disconnectedCallback() {
    document.removeEventListener('click', this._docClickHandler);
    document.removeEventListener('keydown', this._docKeyHandler);
    this._unbindReanchor();
    // Remove the portaled popover so it never leaks after the host is gone.
    if (this._popover && this._popover.parentNode) this._popover.parentNode.removeChild(this._popover);
  }

  attributeChangedCallback(name) {
    if (!this._mounted) return;
    if (name === 'open') {
      const wantOpen = boolAttr(this, 'open');
      if (wantOpen) this._open();
      else this._close();
      return;
    }
    this._sync();
  }

  _build() {
    this.classList.add('ds-date-picker');
    /* Single input for both single and range. For range, the input displays
       the value as "DD/MM/YYYY → DD/MM/YYYY" so the user always sees one
       compact field — much cleaner than two side-by-side inputs. */
    this.innerHTML = `
      <div class="ds-date-picker__frame">
        <div class="ds-date-picker__label-col">
          <label class="ds-date-picker__label" id="ds-dp-${this._uid}-label"></label>
        </div>
        <div class="ds-date-picker__field-col">
          <div class="ds-date-picker__inputs">
            <ds-text-input
              class="ds-date-picker__input"
              size="medium"
              prefix-icon="calendar"
              label-position="top"
              show-helper-row="false"
              autocomplete="off"
            ></ds-text-input>
          </div>
          <ds-field-helper class="ds-date-picker__helper" hidden></ds-field-helper>
        </div>
      </div>
      <div class="ds-date-picker__popover" role="dialog" aria-modal="false" hidden>
        <div class="ds-date-picker__body">
          <div class="ds-date-picker__presets" role="tablist" hidden></div>
          <div class="ds-date-picker__pane"></div>
        </div>
        <div class="ds-date-picker__time" hidden>
          <ds-time-picker class="ds-date-picker__time-picker" variant="inline"></ds-time-picker>
        </div>
        <div class="ds-date-picker__footer" hidden>
          <ds-button variant="tertiary" size="small" data-act="clear">Clear</ds-button>
          <span class="ds-date-picker__footer-spacer"></span>
          <ds-button variant="outline" size="small" data-act="cancel">Cancel</ds-button>
          <ds-button variant="primary" size="small" data-act="apply">Apply</ds-button>
        </div>
      </div>`;

    this._labelEl   = this.querySelector('.ds-date-picker__label');
    this._helperEl  = this.querySelector('.ds-date-picker__helper');
    this._popover   = this.querySelector('.ds-date-picker__popover');
    this._presetsEl = this.querySelector('.ds-date-picker__presets');
    this._paneEl    = this.querySelector('.ds-date-picker__pane');
    this._timeRow   = this.querySelector('.ds-date-picker__time');
    this._timePicker = this.querySelector('.ds-date-picker__time-picker');
    this._footerEl  = this.querySelector('.ds-date-picker__footer');
    this._timeVal   = '';   // "HH:mm" held while datetime mode is active

    /* Time picker (datetime mode) → recompose the value with the new time. */
    this._timePicker.addEventListener('ds-time-picker-change', (e) => {
      this._timeVal = e.detail.value || '';
      this._onTimeChange();
    });
    /* Keep clicks inside the embedded time picker from bubbling to the date
       popover's outside-click handler (it lives in the same portaled popover,
       so composedPath already covers it — but the inline field's own focus
       shouldn't re-trigger date logic). */

    this._inputWrap = this.querySelector('.ds-date-picker__input');
    /* ds-text-input re-renders its inner <input> on every attribute change.
       Any direct listener attached to the input gets detached when the
       attribute fires (e.g. when we sync placeholder/state/value in _sync).
       Use EVENT DELEGATION on the wrapper instead — these listeners survive
       the re-renders. */
    this._inputWrap.addEventListener('focusin', () => this._open());
    this._inputWrap.addEventListener('mousedown', (e) => {
      /* Clicking the wrapper opens the popover even before focus moves to
         the input. Without this, a click on the wrapper padding or icon
         (which doesn't focus the input) wouldn't open the picker. */
      const inputEl = this._inputWrap.querySelector('input');
      if (!inputEl) return;
      if (e.target !== inputEl) {
        e.preventDefault();   // don't blur the input if already focused
        inputEl.focus();
        this._open();
      }
    });
    this._inputWrap.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowDown' || e.key === ' ') { e.preventDefault(); this._open(); }
    });
    this._inputWrap.addEventListener('change', () => this._tryParseInput());
    /* Provide a live accessor so other code (and our own _sync) always grabs
       the CURRENT inner input rather than a stale cached reference. */
    Object.defineProperty(this, '_field', {
      get: () => this._inputWrap.querySelector('input'),
      configurable: true,
    });

    this._footerEl.addEventListener('click', (e) => {
      const act = e.target.closest('[data-act]')?.dataset.act;
      if (act === 'apply')  this._apply();
      if (act === 'cancel') this._cancelAndClose();
      if (act === 'clear')  this._clearStaged();
    });
  }

  /* Datetime mode is single-type only (range datetime is out of scope for now). */
  get _enableTime() { return boolAttr(this, 'enable-time') && enumAttr(this, 'type', TYPES, 'single') === 'single'; }
  get _cycle() { return enumAttr(this, 'hour-cycle', CYCLES, '12'); }

  /* Called when the embedded time picker changes. Recompose value = date + time.
     If no date is chosen yet, just hold the time (_timeVal) until one is. */
  _onTimeChange() {
    if (!this._enableTime) return;
    const showFooter = boolAttr(this, 'show-footer');
    const cur = showFooter ? (this._staged || this.getAttribute('value') || '') : (this.getAttribute('value') || '');
    const d = dateOf(cur);
    if (!d) return;                                  // no date yet — keep the time staged
    this._writeValue(`${d}T${this._timeVal || '00:00'}`);
  }

  _sync() {
    const type = enumAttr(this, 'type', TYPES, 'single');
    const validation = enumAttr(this, 'validation-state', VALIDATIONS, 'none');
    const required = boolAttr(this, 'required');
    const disabled = boolAttr(this, 'disabled');
    const showPresets = boolAttr(this, 'show-presets');
    const showFooter = boolAttr(this, 'show-footer');
    const rtl = boolAttr(this, 'rtl');
    /* Label position: default 'left' (matches the other form fields).
       'none' hides the label; the text is preserved as an accessible name by
       forwarding it to the inner text field as aria-label (label-position="none"). */
    const labelPos = enumAttr(this, 'label-position', ['none', 'top', 'left'], 'left');
    this.classList.toggle('ds-date-picker--left', labelPos === 'left');
    this.classList.toggle('ds-date-picker--top', labelPos === 'top');
    this.classList.toggle('ds-date-picker--none', labelPos === 'none');
    /* Field size — mirrors ds-text-input's small/medium/large scale (36/40/44px).
       We toggle a host class for per-size widths and forward `size` to the inner
       text field so its height + font track the same tokens. */
    const size = enumAttr(this, 'size', SIZES, 'medium');
    this.classList.toggle('ds-date-picker--size-small',  size === 'small');
    this.classList.toggle('ds-date-picker--size-medium', size === 'medium');
    this.classList.toggle('ds-date-picker--size-large',  size === 'large');
    this._inputWrap.setAttribute('size', size);
    const labelText = this.getAttribute('label') ?? 'Select Date';
    if (labelPos === 'none' && labelText) {
      this._inputWrap.setAttribute('label', labelText);
      this._inputWrap.setAttribute('label-position', 'none');
    } else {
      this._inputWrap.removeAttribute('label');
      this._inputWrap.setAttribute('label-position', 'top');
    }
    const placeholder = this.getAttribute('placeholder') || 'DD/MM/YYYY';
    const format = this.getAttribute('format') || 'DD/MM/YYYY';
    const helper = this.getAttribute('helper-text') || '';
    const value = this.getAttribute('value') || '';

    this.dataset.type = type;
    this.dataset.validation = validation;
    if (rtl) this.setAttribute('dir', 'rtl');
    else this.removeAttribute('dir');

    // Label + required marker
    this._labelEl.textContent = labelText;
    if (required) {
      const star = document.createElement('span');
      star.className = 'ds-date-picker__required';
      star.textContent = '*';
      this._labelEl.appendChild(star);
    }

    // Single input for both single + range types.
    const isRange = type === 'range';
    let displayPh = isRange ? `${placeholder} → ${placeholder}` : placeholder;
    if (this._enableTime) displayPh = `${placeholder} ${this._cycle === '24' ? 'HH:MM' : 'HH:MM AM/PM'}`;
    /* Sync state to the <ds-text-input> wrapper — it re-renders its inner
       <input> when attributes change. */
    this._inputWrap.setAttribute('placeholder', displayPh);
    if (disabled) this._inputWrap.setAttribute('state', 'disabled');
    else if (validation === 'error')   this._inputWrap.setAttribute('state', 'error');
    else if (validation === 'success') this._inputWrap.setAttribute('state', 'success');
    else this._inputWrap.setAttribute('state', 'default');
    if (rtl) this._inputWrap.setAttribute('rtl', '');
    else this._inputWrap.removeAttribute('rtl');
    /* Range input is wider since it displays two dates in one field. */
    this._inputWrap.classList.toggle('ds-date-picker__input--range', isRange);

    // Reflect parsed value into the field (and onto the wrapper so it persists across re-renders).
    const displayValue = this._formatDisplayValue(value, isRange, format);
    this._inputWrap.setAttribute('value', displayValue);
    if (this._field) this._field.value = displayValue;

    // Helper text — shared <ds-field-helper> (state drives icon + colour).
    const helperState = disabled ? 'disabled'
      : validation === 'error' ? 'error'
      : validation === 'success' ? 'success' : 'default';
    this._helperEl.setAttribute('text', helper);
    this._helperEl.setAttribute('state', helperState);
    if (rtl) this._helperEl.setAttribute('rtl', '');
    else this._helperEl.removeAttribute('rtl');
    this._helperEl.hidden = !helper;

    // Presets visibility + render
    this._presetsEl.hidden = !showPresets;
    if (showPresets) this._renderPresets();

    // Footer visibility + button labels
    this._footerEl.hidden = !showFooter;
    if (showFooter) {
      this._setBtnLabel('apply',  this.getAttribute('apply-label')  || 'Apply');
      this._setBtnLabel('cancel', this.getAttribute('cancel-label') || 'Cancel');
      this._setBtnLabel('clear',  this.getAttribute('clear-label')  || 'Clear');
    }

    // Calendar pane
    this._renderPane(type);

    // Datetime mode — show + configure the embedded inline time picker.
    const enableTime = this._enableTime;
    this._timeRow.hidden = !enableTime;
    this.classList.toggle('ds-date-picker--datetime', enableTime);
    if (enableTime) {
      const tp = this._timePicker;
      // Use the time picker's OWN built-in label (left) — no hand-rolled caption.
      tp.setAttribute('label', this.getAttribute('time-label') || 'Time');
      tp.setAttribute('label-position', 'left');
      tp.setAttribute('hour-cycle', this._cycle);
      const tStep = this.getAttribute('time-step');
      if (tStep) tp.setAttribute('step', tStep); else tp.removeAttribute('step');
      if (disabled) tp.setAttribute('disabled', ''); else tp.removeAttribute('disabled');
      if (rtl) tp.setAttribute('rtl', ''); else tp.removeAttribute('rtl');
      // Seed the time from the current value (or keep the held time).
      const t = timeOf(value) || this._timeVal;
      this._timeVal = t;
      if (t) tp.setAttribute('value', t); else tp.removeAttribute('value');
    }
  }

  /* Update <ds-button> text without clobbering its upgraded inner structure
     (the upgrade moves the label into a child <span class="ds-button__label">). */
  _setBtnLabel(act, text) {
    const dsBtn = this._footerEl.querySelector(`[data-act="${act}"]`);
    if (!dsBtn) return;
    const inner = dsBtn.querySelector('.ds-button__label');
    if (inner) inner.textContent = text;
    else dsBtn.textContent = text;
  }

  _renderPresets() {
    /* Derive the active preset from the current value; if there's no value but
       the user explicitly clicked "custom", keep custom highlighted. */
    let activeId = this._findActivePresetId(this._currentDisplayValue());
    if (!activeId && this._activePresetId === 'custom') activeId = 'custom';
    this._presetsEl.innerHTML = DEFAULT_PRESETS.map((p) =>
      `<button type="button" class="ds-date-picker__preset"
               role="tab" data-preset-id="${p.id}"
               aria-pressed="${p.id === activeId ? 'true' : 'false'}">${p.label}</button>`
    ).join('');
    this._presetsEl.querySelectorAll('[data-preset-id]').forEach((btn) => {
      btn.addEventListener('click', () => this._applyPreset(btn.dataset.presetId));
    });
  }

  /* Match the current value against each preset's getRange() output. If the
     value matches a preset, return its id. If a value is set but matches no
     preset, return 'custom' (user-picked). If no value, return null. */
  _findActivePresetId(value) {
    value = dateOf(value);   // presets are date-only; ignore any time suffix
    if (!value) return null;
    const type = enumAttr(this, 'type', TYPES, 'single');
    for (const preset of DEFAULT_PRESETS) {
      if (preset.id === 'custom') continue;
      const range = preset.getRange();
      if (!range) continue;
      const [start, end] = range;
      const expected = type === 'range'
        ? `${toISO(start)}/${toISO(end)}`
        : toISO(start);
      if (expected === value) return preset.id;
    }
    return 'custom';
  }

  _applyPreset(id) {
    const preset = DEFAULT_PRESETS.find((p) => p.id === id);
    if (!preset) return;
    /* Remember an explicit 'custom' click — it clears the value so there is
       nothing for _findActivePresetId to derive from, but the button should
       still read as selected. Real presets derive their active state from the
       value they write, so clear the override. */
    this._activePresetId = id === 'custom' ? 'custom' : null;
    if (id === 'custom') {
      // Clear value so the user can pick fresh in the calendar.
      this._writeValue('');
      return;
    }
    const range = preset.getRange();
    if (!range) return;
    const [start, end] = range;
    const type = enumAttr(this, 'type', TYPES, 'single');
    if (type === 'range') {
      this._writeValue(`${toISO(start)}/${toISO(end)}`);
    } else {
      this._writeValue(toISO(start));
    }
  }

  _renderPane(type) {
    const min = this.getAttribute('min') || '';
    const max = this.getAttribute('max') || '';
    const rtl = boolAttr(this, 'rtl');
    const value = dateOf(this._currentDisplayValue());   // calendar works on the date part only
    const calType = type === 'range' ? 'range' : 'single';

    /* Reuse the existing calendar when only the value/min/max/rtl changed —
       rebuilding it on every day click was the root cause of the popover
       closing mid-range-pick (the calendar's day cell got detached, and the
       document click handler treated the bubbling click as "outside"). */
    if (this._cal && this._calType === calType) {
      if (value) this._cal.setAttribute('value', value);
      else       this._cal.removeAttribute('value');
      if (min)   this._cal.setAttribute('min', min);   else this._cal.removeAttribute('min');
      if (max)   this._cal.setAttribute('max', max);   else this._cal.removeAttribute('max');
      if (rtl)   this._cal.setAttribute('rtl', '');    else this._cal.removeAttribute('rtl');
      return;
    }

    this._paneEl.innerHTML = '';
    const cal = document.createElement('ds-calendar');
    cal.setAttribute('type', calType);
    if (rtl) cal.setAttribute('rtl', '');
    if (min) cal.setAttribute('min', min);
    if (max) cal.setAttribute('max', max);
    if (value) cal.setAttribute('value', value);
    cal.addEventListener('ds-calendar-change', (e) => {
      const t = enumAttr(this, 'type', TYPES, 'single');
      if (t === 'single') {
        this._writeValue(e.detail.value || '');
      } else {
        if (e.detail.start && e.detail.end) {
          this._writeValue(`${e.detail.start}/${e.detail.end}`);
        } else if (e.detail.start) {
          this._writeValue(e.detail.start);
        }
      }
    });
    this._paneEl.appendChild(cal);
    this._cal = cal;
    this._calType = calType;
  }

  /* When show-footer is on, edits are staged; otherwise they commit immediately. */
  _writeValue(v) {
    /* Datetime mode: a bare date from the calendar/preset is combined with the
       held time. (_onTimeChange passes an already-composed "…T…" string.) */
    if (this._enableTime && v && !v.includes('T') && !v.includes('/')) {
      if (!this._timeVal) this._timeVal = '00:00';
      v = `${v}T${this._timeVal}`;
    }
    const showFooter = boolAttr(this, 'show-footer');
    if (showFooter) {
      this._staged = v;
      this._reflectStagedToInputs();
      /* Also reflect the staged value into the calendar highlight and the active
         preset — otherwise picking a preset (or a day) updates only the input
         text while the calendar and preset row stay on the old selection. */
      if (this._cal) {
        if (this._staged) this._cal.setAttribute('value', dateOf(this._staged));
        else this._cal.removeAttribute('value');
      }
      if (boolAttr(this, 'show-presets')) this._renderPresets();
    } else {
      this._setValueAttr(v);
      this._emitChange();
      // Commit-on-pick closes the popover for single picks; range stays open
      // until both endpoints are set. In datetime mode the popover stays open so
      // the user can also set the time (closes on outside-click / Escape / Apply).
      const type = enumAttr(this, 'type', TYPES, 'single');
      if (!this._enableTime && (type === 'single' || (type === 'range' && v.includes('/')))) this._close();
    }
  }

  _reflectStagedToInputs() {
    const type = enumAttr(this, 'type', TYPES, 'single');
    const format = this.getAttribute('format') || 'DD/MM/YYYY';
    if (this._field) this._field.value = this._formatDisplayValue(this._staged || '', type === 'range', format);
  }

  /* Renders the underlying ISO value(s) into the user-facing input string.
     Range form: "DD/MM/YYYY → DD/MM/YYYY". If only the start half is
     available (mid-pick), shows just the start to give live feedback. */
  _formatDisplayValue(value, isRange, format) {
    if (!value) return '';
    if (isRange) {
      const [s, e] = value.split('/');
      const sd = fromISO(s);
      const ed = fromISO(e);
      if (sd && ed) return `${fmtInput(sd, format)} → ${fmtInput(ed, format)}`;
      if (sd)       return fmtInput(sd, format);
      return '';
    }
    const d = fromISO(dateOf(value));
    if (!d) return '';
    let out = fmtInput(d, format);
    const t = timeOf(value);               // datetime mode → append the time
    if (t) out += ` ${fmtTime(t, this._cycle)}`;
    return out;
  }

  _currentDisplayValue() {
    return boolAttr(this, 'show-footer')
      ? (this._staged || this.getAttribute('value') || '')
      : (this.getAttribute('value') || '');
  }

  _setValueAttr(v) {
    if (v) this.setAttribute('value', v);
    else this.removeAttribute('value');
  }

  _apply() {
    this._setValueAttr(this._staged);
    this._emitChange();
    this._close();
  }

  _cancelAndClose() {
    this._staged = this._committed;
    this._reflectStagedToInputs();
    this._close();
  }

  _clearStaged() {
    this._staged = '';
    this._activePresetId = null;
    this._reflectStagedToInputs();
    // Re-render calendar + presets so they reflect the cleared selection
    const type = enumAttr(this, 'type', TYPES, 'single');
    this._renderPane(type);
    if (boolAttr(this, 'show-presets')) this._renderPresets();
  }

  _tryParseInput() {
    if (!this._field) return;
    const format = this.getAttribute('format') || 'DD/MM/YYYY';
    const type = enumAttr(this, 'type', TYPES, 'single');
    const raw = this._field.value.trim();
    if (!raw) return;

    if (type === 'range') {
      /* Accept any common separator the user might type between two dates:
         "→", "->", "-", "–", "—", "to", or "/". Whitespace around the
         separator is optional. Single-date input still works (just sets
         the start endpoint). */
      const parts = raw.split(/\s*(?:→|->|–|—|-|\bto\b|\/)\s*/i)
        .map((p) => p.trim())
        .filter(Boolean);
      const startD = parseInputStr(parts[0], format);
      const endD   = parts[1] ? parseInputStr(parts[1], format) : null;
      if (!startD) return;
      if (endD) this._writeValue(`${toISO(startD)}/${toISO(endD)}`);
      else      this._writeValue(toISO(startD));
    } else if (this._enableTime) {
      // Datetime: split a trailing time ("15/04/2026 9:30 AM") from the date.
      const m = raw.match(/^(.*?)[\s,]+(\d{1,2}:\d{2}(?:\s*[ap]\.?m?\.?)?)$/i);
      const dateStr = m ? m[1].trim() : raw;
      const timeStr = m ? m[2].trim() : null;
      const d = parseInputStr(dateStr, format);
      if (!d) return;
      if (timeStr) { const t = parseTimeStr(timeStr, this._cycle); if (t) this._timeVal = t; }
      this._writeValue(toISO(d));       // composes with _timeVal
    } else {
      const d = parseInputStr(raw, format);
      if (!d) return;
      this._writeValue(toISO(d));
    }
  }

  _open() {
    if (this._isOpen || boolAttr(this, 'disabled')) return;
    this._isOpen = true;
    this._committed = this.getAttribute('value') || '';
    this._staged = this._committed;
    /* Portal the popover to <body> + position:fixed so it can NEVER be clipped
       by an ancestor's overflow (card, scroll container, table cell) or
       transform. Anchored to the input, re-anchored on scroll/resize. */
    if (this._popover.parentNode !== document.body) document.body.appendChild(this._popover);
    this._popover.hidden = false;
    this._positionPopover();
    this._bindReanchor();
    this.setAttribute('open', '');
    document.addEventListener('click', this._docClickHandler);
    document.addEventListener('keydown', this._docKeyHandler);
    this.dispatchEvent(new CustomEvent('ds-date-picker-open', { bubbles: true }));
  }

  _close() {
    if (!this._isOpen) return;
    this._isOpen = false;
    this._popover.hidden = true;
    this._unbindReanchor();
    this.removeAttribute('open');
    document.removeEventListener('click', this._docClickHandler);
    document.removeEventListener('keydown', this._docKeyHandler);
    this.dispatchEvent(new CustomEvent('ds-date-picker-close', { bubbles: true }));
  }

  /* Anchor the portaled popover under the input with position:fixed, flipping
     above and clamping to stay fully inside the viewport. */
  _positionPopover() {
    const pop = this._popover;
    const anchor = this._inputWrap || this;
    const r = anchor.getBoundingClientRect();
    if (!r.width && !r.height) return;
    pop.style.position = 'fixed';
    pop.style.margin = '0';
    pop.style.zIndex = '9999';
    const pw = pop.offsetWidth;
    const ph = pop.offsetHeight;
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const M = 8;
    const GAP = 8;
    let top = r.bottom + GAP;
    let left = r.left;
    if (top + ph > vh - M && r.top - ph - GAP >= M) top = r.top - ph - GAP; // flip up
    left = Math.max(M, Math.min(left, vw - pw - M));
    top = Math.max(M, Math.min(top, vh - ph - M));
    pop.style.top = `${Math.round(top)}px`;
    pop.style.left = `${Math.round(left)}px`;
    pop.style.right = 'auto';
    pop.style.bottom = 'auto';
  }

  _bindReanchor() {
    if (this._reanchor) return;
    this._reanchor = () => { if (this._isOpen) this._positionPopover(); };
    window.addEventListener('scroll', this._reanchor, true);
    window.addEventListener('resize', this._reanchor);
  }

  _unbindReanchor() {
    if (!this._reanchor) return;
    window.removeEventListener('scroll', this._reanchor, true);
    window.removeEventListener('resize', this._reanchor);
    this._reanchor = null;
  }

  _emitChange() {
    const type = enumAttr(this, 'type', TYPES, 'single');
    const value = this.getAttribute('value') || '';
    let detail;
    if (type === 'range') {
      const [s, e] = value.split('/');
      detail = { type, value, start: s || null, end: e || null };
    } else if (this._enableTime) {
      detail = { type, value, date: dateOf(value) || null, time: timeOf(value) || null };
    } else {
      detail = { type, value };
    }
    this.dispatchEvent(new CustomEvent('ds-date-picker-change', {
      bubbles: true, composed: true, detail,
    }));
  }

  // Convenience accessors
  get value() { return this.getAttribute('value') || ''; }
  set value(v) { this._setValueAttr(v); }
  get type() { return enumAttr(this, 'type', TYPES, 'single'); }
  set type(v) { this.setAttribute('type', v); }
}

if (typeof customElements !== 'undefined' && !customElements.get('ds-date-picker')) {
  customElements.define('ds-date-picker', DsDatePicker);
}
