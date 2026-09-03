import { boolAttr, enumAttr } from '../../utils/attr.js';
/* The helper/note row reuses the shared <ds-field-helper> sub-component. */
import '../field-helper/field-helper.js';
import { injectCss } from '../../utils/inject-css.js';
import { escapeHtml } from '../../utils/escape.js';

/* Auto-load field-helper.css once (both are light-DOM, so the stylesheet must
   be present even on pages that load slider.css individually). Idempotent. */
injectCss('ds-slider-fh-css', '../field-helper/field-helper.css', import.meta.url);

const SIZES = ['small', 'medium', 'large'];
const TYPES = ['single', 'range'];

export class DsSlider extends HTMLElement {
  static get observedAttributes() {
    return [
      'type', 'size', 'value', 'min', 'max', 'step',
      'label', 'helper', 'show-min-max', 'min-label', 'max-label',
      'state', 'disabled', 'show-value', 'show-label', 'show-step-markers',
      'show-tooltip', 'rtl',
    ];
  }

  connectedCallback() {
    if (!this._root) {
      this._root = document.createElement('div');
      this.innerHTML = '';
      this.appendChild(this._root);
    }
    this._render();
  }

  attributeChangedCallback(name) {
    if (!this._root) return;
    /* state/size/disabled/rtl only toggle root classes / dir + the inputs'
       disabled/aria-invalid + the helper's state — none change which nodes exist.
       Repaint the chrome in place so the live range <input>s (which hold the drag
       position) and the child ds-field-helper are NOT rebuilt. value/min/max/
       step/type/… change the inputs' geometry or the node set → full render. */
    if (name === 'state' || name === 'size' || name === 'disabled' || name === 'rtl') {
      this._paintChrome();
      return;
    }
    /* An explicit `value` change honours the attribute; any OTHER attribute
       change preserves the current thumb position across the rebuild instead of
       snapping back to the stale attribute value. */
    this._explicitValue = (name === 'value');
    this._render();
  }

  /* Visual-only chrome applied to the already-rendered slider: root class / dir,
     the range <input>s' disabled + aria-invalid, and the helper state. It never
     touches the <input>s' value/min/max/step, so an in-flight drag survives.
     Byte-identical to the chrome the full _render would produce. */
  _paintChrome() {
    const size = enumAttr(this, 'size', SIZES, 'medium');
    const state = this.getAttribute('state') || '';
    const disabled = boolAttr(this, 'disabled');
    const rtl = boolAttr(this, 'rtl');
    const showTooltip = boolAttr(this, 'show-tooltip');
    const isRange = enumAttr(this, 'type', TYPES, 'single') === 'range';
    this._isRtl = rtl;

    const cls = `ds-slider ds-slider--${size}`
      + (isRange ? ' ds-slider--range' : '')
      + (state === 'error' ? ' ds-slider--error' : '')
      + (showTooltip ? ' ds-slider--has-tooltip' : '')
      + (disabled ? ' ds-slider--disabled' : '');
    this._root.className = cls;
    if (rtl) this._root.setAttribute('dir', 'rtl');
    else this._root.removeAttribute('dir');

    /* Patch the live inputs in place (never rebuild — preserves drag state). */
    this._root.querySelectorAll('.ds-slider__input').forEach((inp) => {
      if (disabled) inp.setAttribute('disabled', '');
      else inp.removeAttribute('disabled');
      if (state === 'error') inp.setAttribute('aria-invalid', 'true');
      else inp.removeAttribute('aria-invalid');
    });

    const helperEl = this._root.querySelector('.ds-slider__helper');
    if (helperEl) {
      helperEl.setAttribute('state', disabled ? 'disabled' : state === 'error' ? 'error' : 'default');
      if (rtl) helperEl.setAttribute('rtl', '');
      else helperEl.removeAttribute('rtl');
    }
  }

  /* Single mode → number; Range mode → "start,end" string. */
  get value() {
    if (this._isRange) {
      const lo = Number(this._inputLow?.value ?? 0);
      const hi = Number(this._inputHigh?.value ?? 100);
      return [lo, hi];
    }
    return Number(this._input?.value ?? this.getAttribute('value') ?? 50);
  }
  set value(v) {
    if (Array.isArray(v)) {
      this.setAttribute('value', `${v[0]},${v[1]}`);
    } else {
      this.setAttribute('value', String(v));
    }
  }

  _render() {
    const type = enumAttr(this, 'type', TYPES, 'single');
    const size = enumAttr(this, 'size', SIZES, 'medium');
    const min = this.getAttribute('min') ?? '0';
    const max = this.getAttribute('max') ?? '100';
    const step = this.getAttribute('step') ?? '1';
    /* Preserve a dragged value across a non-value rebuild: the thumb position
       lives in the range <input>s and isn't reflected to the attribute, so
       reading the attribute would snap it back (e.g. setting state="error" after
       a drag). The refs are nulled to the inactive kind in each render below, so
       this reads the correct live inputs. First render / explicit value change →
       read the attribute. */
    const liveValue = (this._inputLow && this._inputHigh)
      ? `${this._inputLow.value},${this._inputHigh.value}`
      : (this._input ? this._input.value : null);
    const rawValue = (liveValue != null && !this._explicitValue)
      ? liveValue
      : (this.getAttribute('value') ?? (type === 'range' ? '20,80' : '50'));
    this._explicitValue = false;
    const label = this.getAttribute('label') || 'Label';
    const helper = this.getAttribute('helper') || '';
    const minLabel = this.getAttribute('min-label') || min;
    const maxLabel = this.getAttribute('max-label') || max;
    const showMinMax = boolAttr(this, 'show-min-max');
    const showValue = !this.hasAttribute('show-value') || this.getAttribute('show-value') !== 'false';
    const showLabel = !this.hasAttribute('show-label') || this.getAttribute('show-label') !== 'false';
    const showStepMarkers = boolAttr(this, 'show-step-markers');
    const showTooltip = boolAttr(this, 'show-tooltip');
    const state = this.getAttribute('state') || '';
    const disabled = boolAttr(this, 'disabled');
    const rtl = boolAttr(this, 'rtl');
    this._isRtl = rtl;
    const isRange = type === 'range';
    this._isRange = isRange;

    /* Parse "lo,hi" for range, single number for single. */
    let valLo = 0, valHi = 0, singleVal = 0;
    if (isRange) {
      const parts = rawValue.split(',').map((s) => Number(s.trim()));
      valLo = Number.isFinite(parts[0]) ? parts[0] : Number(min);
      valHi = Number.isFinite(parts[1]) ? parts[1] : Number(max);
      if (valHi < valLo) [valLo, valHi] = [valHi, valLo];
    } else {
      singleVal = Number(rawValue);
    }
    const valueDisplay = isRange ? `${valLo} – ${valHi}` : String(singleVal);

    const cls = `ds-slider ds-slider--${size}`
      + (isRange ? ' ds-slider--range' : '')
      + (state === 'error' ? ' ds-slider--error' : '')
      + (showTooltip ? ' ds-slider--has-tooltip' : '')
      + (disabled ? ' ds-slider--disabled' : '');
    this._root.className = cls;
    if (rtl) this._root.setAttribute('dir', 'rtl');
    else this._root.removeAttribute('dir');

    /* Step markers: emit one tick per step between min and max. Hidden by
       default; shown via show-step-markers when steps ≤ ~12. */
    const numericMin = Number(min);
    const numericMax = Number(max);
    const numericStep = Math.max(1, Number(step));
    const ticks = [];
    if (showStepMarkers) {
      for (let v = numericMin; v <= numericMax; v += numericStep) {
        const pct = ((v - numericMin) / (numericMax - numericMin)) * 100;
        /* Logical inset-inline-start so ticks render from the leading edge
           in both LTR and RTL. */
        ticks.push(`<span class="ds-slider__tick" style="inset-inline-start:${pct}%"></span>`);
      }
    }

    /* min/max/step come straight from consumer attributes into the input HTML —
       escape them (a hostile `min="0\" onfocus=…"` would otherwise inject an
       attribute). `value` is already Number-coerced above, so it's safe. */
    const minA = escapeHtml(min), maxA = escapeHtml(max), stepA = escapeHtml(step);
    const labelA = escapeHtml(label);
    const trackHTML = isRange
      ? `<div class="ds-slider__track-row" data-range>
           <div class="ds-slider__track-bg"></div>
           <div class="ds-slider__track-fill" data-fill></div>
           ${ticks.join('')}
           <input class="ds-slider__input ds-slider__input--low"  type="range" data-which="low"
                  min="${minA}" max="${maxA}" step="${stepA}" value="${valLo}"
                  ${disabled ? 'disabled' : ''} aria-label="${labelA} start"
                  ${state === 'error' ? 'aria-invalid="true"' : ''} />
           <input class="ds-slider__input ds-slider__input--high" type="range" data-which="high"
                  min="${minA}" max="${maxA}" step="${stepA}" value="${valHi}"
                  ${disabled ? 'disabled' : ''} aria-label="${labelA} end"
                  ${state === 'error' ? 'aria-invalid="true"' : ''} />
           ${showTooltip ? `<span class="ds-slider__tooltip" data-tip-low>${valLo}</span><span class="ds-slider__tooltip" data-tip-high>${valHi}</span>` : ''}
         </div>`
      : `<div class="ds-slider__track-row">
           ${ticks.join('')}
           <input class="ds-slider__input" type="range"
                  min="${minA}" max="${maxA}" step="${stepA}" value="${singleVal}"
                  ${disabled ? 'disabled' : ''} aria-label="${labelA}"
                  ${state === 'error' ? 'aria-invalid="true"' : ''} />
           ${showTooltip ? `<span class="ds-slider__tooltip" data-tip>${singleVal}</span>` : ''}
         </div>`;

    this._root.innerHTML = `
      ${showLabel || showValue ? `<div class="ds-slider__row">
        ${showLabel ? `<label class="ds-slider__label">${escapeHtml(label)}</label>` : ''}
        ${showValue ? `<span class="ds-slider__value" data-value>${valueDisplay}</span>` : ''}
      </div>` : ''}
      ${trackHTML}
      ${showMinMax ? `<div class="ds-slider__minmax"><span>${escapeHtml(minLabel)}</span><span>${escapeHtml(maxLabel)}</span></div>` : ''}
      ${helper ? `<ds-field-helper class="ds-slider__helper" text="${escapeHtml(helper)}" state="${disabled ? 'disabled' : state === 'error' ? 'error' : 'default'}"${rtl ? ' rtl' : ''}></ds-field-helper>` : ''}
    `;

    this._valueEl = this._root.querySelector('[data-value]');
    if (isRange) {
      this._input = null;   /* keep the live-value capture honest across a type switch */
      this._inputLow  = this._root.querySelector('[data-which="low"]');
      this._inputHigh = this._root.querySelector('[data-which="high"]');
      this._fillEl    = this._root.querySelector('[data-fill]');
      this._updateRangeFill();
      const onInput = (which) => () => {
        // Prevent thumbs from crossing each other.
        let lo = Number(this._inputLow.value);
        let hi = Number(this._inputHigh.value);
        if (which === 'low' && lo > hi) { lo = hi; this._inputLow.value = lo; }
        if (which === 'high' && hi < lo) { hi = lo; this._inputHigh.value = hi; }
        this._updateRangeFill();
        if (this._valueEl) this._valueEl.textContent = `${lo} – ${hi}`;
        this.dispatchEvent(new CustomEvent('ds-slider-input', { bubbles: true, detail: { value: [lo, hi] } }));
      };
      this._inputLow.addEventListener('input', onInput('low'));
      this._inputHigh.addEventListener('input', onInput('high'));
      this._inputLow.addEventListener('change', () => this.dispatchEvent(
        new CustomEvent('ds-slider-change', { bubbles: true, detail: { value: this.value } })));
      this._inputHigh.addEventListener('change', () => this.dispatchEvent(
        new CustomEvent('ds-slider-change', { bubbles: true, detail: { value: this.value } })));
    } else {
      this._inputLow = this._inputHigh = null;   /* honest live-value capture across a type switch */
      this._input = this._root.querySelector('input');
      this._updateSingleFill();
      this._input.addEventListener('input', () => {
        this._updateSingleFill();
        if (this._valueEl) this._valueEl.textContent = this._input.value;
        this.dispatchEvent(new CustomEvent('ds-slider-input', { bubbles: true, detail: { value: Number(this._input.value) } }));
      });
      this._input.addEventListener('change', () => {
        this.dispatchEvent(new CustomEvent('ds-slider-change', { bubbles: true, detail: { value: Number(this._input.value) } }));
      });
    }
  }

  _updateSingleFill() {
    if (!this._input) return;
    const min = Number(this._input.min || 0);
    const max = Number(this._input.max || 100);
    const val = Number(this._input.value);
    const span = (max - min) || 1;   // guard degenerate min===max (avoid NaN%)
    const pct = ((val - min) / span) * 100;
    this._input.style.setProperty('--_s-pct', `${pct}%`);
    const tip = this._root.querySelector('[data-tip]');
    if (tip) { tip.style.setProperty('--_tip-pos', `${pct}`); tip.textContent = this._input.value; }
  }

  _updateRangeFill() {
    if (!this._inputLow || !this._inputHigh || !this._fillEl) return;
    const min = Number(this._inputLow.min || 0);
    const max = Number(this._inputLow.max || 100);
    const lo = Number(this._inputLow.value);
    const hi = Number(this._inputHigh.value);
    const span = (max - min) || 1;   // guard degenerate min===max (avoid NaN%)
    const loPct = ((lo - min) / span) * 100;
    const hiPct = ((hi - min) / span) * 100;
    /* Use logical inset-inline-* properties so the fill grows from the
       leading edge in both LTR and RTL automatically. */
    this._fillEl.style.left = '';
    this._fillEl.style.right = '';
    this._fillEl.style.insetInlineStart = `${loPct}%`;
    this._fillEl.style.insetInlineEnd   = `${100 - hiPct}%`;
    const tipLo = this._root.querySelector('[data-tip-low]');
    const tipHi = this._root.querySelector('[data-tip-high]');
    if (tipLo) { tipLo.style.setProperty('--_tip-pos', `${loPct}`); tipLo.textContent = String(lo); }
    if (tipHi) { tipHi.style.setProperty('--_tip-pos', `${hiPct}`); tipHi.textContent = String(hi); }
  }
}

if (typeof customElements !== 'undefined' && !customElements.get('ds-slider')) {
  customElements.define('ds-slider', DsSlider);
}
