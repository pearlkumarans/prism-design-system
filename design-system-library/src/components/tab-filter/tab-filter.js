/* =============================================================================
   <ds-tab-filter value="open" rtl aria-label="Filter status">
   </ds-tab-filter>

   Options via property:
     el.options = [
       { value: 'all',    label: 'All',    badge: 99 },
       { value: 'open',   label: 'Open',   badge: 12 },
       { value: 'closed', label: 'Closed', badge: 7 },
     ];

   Tab Filter is a single-select segmented control — always one option
   selected, and selection commits immediately on click or arrow key.
   Use this for FILTERING one dataset, not for switching between sections
   (use <ds-tab-bar-horizontal> for that).

   Events:
     - ds-tab-filter-change   detail: { value, option }
   ============================================================================= */

import { boolAttr } from '../../utils/attr.js';
import { escapeHtml } from '../../utils/escape.js';

let _uid = 0;

export class DsTabFilter extends HTMLElement {
  static get observedAttributes() {
    return ['value', 'size', 'rtl', 'disabled', 'aria-label', 'aria-labelledby'];
  }

  constructor() {
    super();
    this._uid = ++_uid;
    if (Object.prototype.hasOwnProperty.call(this, 'options')) {
      const v = this.options;
      delete this.options;
      this._pendingOptions = v;
    }
    this._options = [];
  }

  connectedCallback() {
    if (!this._mounted) {
      this.innerHTML = '';
      this._root = document.createElement('div');
      this.appendChild(this._root);
      this._mounted = true;
    }
    if (this._pendingOptions !== undefined) {
      this.options = this._pendingOptions;
      this._pendingOptions = undefined;
    }
    this._render();
  }

  attributeChangedCallback(name) {
    if (!this._mounted) return;
    /* A value change just slides the active card to the new tab — no rebuild,
       so the indicator can animate across. Everything else rebuilds. */
    if (name === 'value') this._syncActive(true);
    else this._render();
  }

  disconnectedCallback() { this._ro?.disconnect(); }

  // ---- Public API ---------------------------------------------------------
  get options() { return this._options; }
  set options(v) {
    this._options = Array.isArray(v) ? v.slice() : [];
    if (this._mounted) this._render();
  }

  get value() {
    return this.getAttribute('value')
      || (this._options[0] && String(this._options[0].value)) || '';
  }
  set value(v) {
    if (v == null || v === '') this.removeAttribute('value');
    else this.setAttribute('value', String(v));
  }

  // ---- Render -------------------------------------------------------------
  _render() {
    const rtl = boolAttr(this, 'rtl');
    const disabled = boolAttr(this, 'disabled');
    const size = this.getAttribute('size') === 'small' ? 'small' : 'medium';
    const value = this.value;

    /* Product rule: Tab Filter supports 2–5 tabs in a single row. */
    if (this._options.length > 5) {
      // eslint-disable-next-line no-console
      console.warn(`[ds-tab-filter] ${this._options.length} tabs supplied; the control supports a maximum of 5. Reduce the data or use an overflow menu.`);
    }

    this._root.className = 'ds-tab-filter'
      + (size === 'small' ? ' ds-tab-filter--small' : '')
      + (disabled ? ' ds-tab-filter--disabled' : '');
    this._size = size;
    /* Use radiogroup semantics — Tab Filter is a single-select choice
       affecting a query, not a navigation tablist whose panels swap. */
    this._root.setAttribute('role', 'radiogroup');
    if (rtl) this._root.setAttribute('dir', 'rtl');
    else this._root.removeAttribute('dir');

    const ariaLabel = this.getAttribute('aria-label');
    const ariaLabelledBy = this.getAttribute('aria-labelledby');
    if (ariaLabel) this._root.setAttribute('aria-label', ariaLabel);
    else this._root.removeAttribute('aria-label');
    if (ariaLabelledBy) this._root.setAttribute('aria-labelledby', ariaLabelledBy);
    else this._root.removeAttribute('aria-labelledby');

    /* A single sliding "card" (the active indicator) sits behind the buttons;
       it translates + resizes between tabs so selection glides across the row
       instead of snapping (spec: slide white card to new tab, 200ms ease-out). */
    this._root.innerHTML =
      '<span class="ds-tab-filter__indicator" aria-hidden="true"></span>'
      + this._options.map((opt, idx) =>
        this._renderOption(opt, idx, value, rtl, disabled)).join('');
    this._indicator = this._root.querySelector('.ds-tab-filter__indicator');

    this._wire();
    this._syncActive(false);    /* position the card under the active tab, no slide */

    /* Reposition (no animation) when the control resizes — covers web-font
       reflow, container resize, and hidden→visible. Skipped while a slide is
       in flight: the active label going Medium nudges the track width and would
       otherwise fire the observer and SNAP the card mid-glide. */
    if (!this._ro && typeof ResizeObserver !== 'undefined') {
      this._ro = new ResizeObserver(() => {
        if (this._animating) return;
        this._positionIndicator(this._activeBtn, false);
      });
      this._ro.observe(this._root);
    }
  }

  /* Apply active state to the buttons + glide the indicator card to the active
     one. `animate` false = snap into place (initial render / resize). */
  _syncActive(animate) {
    if (!this._mounted || !this._root) return;
    const value = this.value;
    let active = null;
    this._root.querySelectorAll('.ds-tab-filter__option').forEach((btn, i) => {
      const isActive = String(btn.dataset.value) === String(value) || (!value && i === 0);
      btn.classList.toggle('ds-tab-filter__option--active', isActive);
      btn.setAttribute('aria-checked', isActive ? 'true' : 'false');
      btn.tabIndex = (isActive && !btn.disabled) ? 0 : -1;
      if (isActive) active = btn;
    });
    this._activeBtn = active;
    this._positionIndicator(active, animate);
  }

  /* Position the indicator over a button. Uses physical offsets (offsetLeft)
     so it stays correct in both LTR and RTL. */
  _positionIndicator(btn, animate) {
    const ind = this._indicator;
    if (!ind) return;
    if (!btn) { ind.style.opacity = '0'; return; }
    if (!animate) ind.style.transition = 'none';
    ind.style.opacity = '1';
    ind.style.left = `${btn.offsetLeft}px`;
    ind.style.top = `${btn.offsetTop}px`;
    ind.style.width = `${btn.offsetWidth}px`;
    ind.style.height = `${btn.offsetHeight}px`;
    if (!animate) {
      void ind.offsetWidth;          /* flush so the snap doesn't animate */
      ind.style.transition = '';     /* restore the CSS transition for next slide */
    } else {
      /* Hold an animating flag for the slide so the ResizeObserver (fired by the
         active label's Medium-weight width nudge) can't snap us mid-glide. */
      this._animating = true;
      clearTimeout(this._animTimer);
      this._animTimer = setTimeout(() => { this._animating = false; }, 260);
    }
  }

  _renderOption(opt, idx, value, rtl, groupDisabled) {
    const isActive = String(opt.value) === String(value)
      || (!value && idx === 0);
    const isDisabled = !!opt.disabled || !!groupDisabled;
    const id = `ds-tf-${this._uid}-${idx}`;
    const label = (rtl && opt.labelRtl) ? opt.labelRtl : (opt.label ?? '');

    const iconSize = this._size === 'small' ? 16 : 20;
    const iconHTML = opt.icon
      ? `<span class="ds-tab-filter__option-icon" aria-hidden="true">
           <ds-icon name="${escapeHtml(opt.icon)}" size="${iconSize}"></ds-icon>
         </span>`
      : '';

    /* Badge: hide when absent or when the count is 0 (spec edge case) —
       a "0" filter shows no badge even if a badge value is supplied. */
    let badgeHTML = '';
    if (opt.badge != null && opt.badge !== false
        && opt.badge !== 0 && String(opt.badge) !== '0') {
      const badgeText = typeof opt.badge === 'object' ? '' : String(opt.badge);
      badgeHTML = `<span class="ds-tab-filter__option-badge"><ds-badge variant="subtle" state="default" size="small">${badgeText}</ds-badge></span>`;
    }

    const cls = [
      'ds-tab-filter__option',
      isActive ? 'ds-tab-filter__option--active' : '',
      isDisabled ? 'ds-tab-filter__option--disabled' : '',
    ].filter(Boolean).join(' ');

    return `<button
              type="button"
              role="radio"
              id="${id}"
              class="${cls}"
              aria-checked="${isActive ? 'true' : 'false'}"
              ${isDisabled ? 'aria-disabled="true" disabled' : ''}
              tabindex="${isActive && !isDisabled ? 0 : -1}"
              data-value="${escapeHtml(opt.value)}"
              data-index="${idx}">
              ${iconHTML}
              <span class="ds-tab-filter__option-label">${escapeHtml(label)}</span>
              ${badgeHTML}
            </button>`;
  }

  _wire() {
    this._root.querySelectorAll('.ds-tab-filter__option').forEach((btn) => {
      const idx = Number(btn.dataset.index);
      const opt = this._options[idx];
      if (!opt || opt.disabled) return;

      btn.addEventListener('click', () => this._select(opt));
      btn.addEventListener('keydown', (e) => this._onKeydown(e, idx));
    });
  }

  _select(opt) {
    if (!opt || opt.disabled) return;
    if (String(this.value) === String(opt.value)) return;
    this.value = opt.value;
    requestAnimationFrame(() => {
      const next = this._root.querySelector(`[data-value="${opt.value}"]`);
      next?.focus?.();
    });
    this.dispatchEvent(new CustomEvent('ds-tab-filter-change', {
      bubbles: true,
      detail: { value: String(opt.value), option: opt },
    }));
  }

  _onKeydown(e, currentIdx) {
    /* ←/→ commit immediately (filter selection updates the view live). RTL
       flips them. ↑/↓ are no-ops per the spec — Tab Filter is always
       horizontal. */
    const focusable = [];
    this._options.forEach((o, i) => {
      if (!o.disabled) focusable.push(i);
    });
    if (!focusable.length) return;

    const rtl = boolAttr(this, 'rtl');
    const at = focusable.indexOf(currentIdx);
    let nextIdx = null;

    const KEY_NEXT = rtl ? 'ArrowLeft'  : 'ArrowRight';
    const KEY_PREV = rtl ? 'ArrowRight' : 'ArrowLeft';

    if (e.key === KEY_NEXT) {
      e.preventDefault();
      nextIdx = focusable[(at + 1) % focusable.length];
    } else if (e.key === KEY_PREV) {
      e.preventDefault();
      nextIdx = focusable[(at - 1 + focusable.length) % focusable.length];
    } else if (e.key === 'Home') {
      e.preventDefault();
      nextIdx = focusable[0];
    } else if (e.key === 'End') {
      e.preventDefault();
      nextIdx = focusable[focusable.length - 1];
    } else if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      this._select(this._options[currentIdx]);
      return;
    }

    if (nextIdx == null) return;
    this._select(this._options[nextIdx]);
  }
}

if (typeof customElements !== 'undefined' && !customElements.get('ds-tab-filter')) {
  customElements.define('ds-tab-filter', DsTabFilter);
}
