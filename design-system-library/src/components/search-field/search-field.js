/* =============================================================================
   <ds-search-field
     size="small | medium | large"
     placeholder="Search…"
     value="…"
     show-shortcut
     shortcut-label="⌘K"
     loading
     disabled
     error
     rtl></ds-search-field>

   A text input specialized for search per docs/MD/search-field.md.
   - Auto-derives the `filled` visual state when the input has a value
   - Auto-shows a Clear (×) button in filled/error states; click or Esc clears
   - Auto-swaps the trailing area for a spinner when [loading] is set
   - Optional ⌘K chip via show-shortcut
   - Fires:
       ds-search-field-input    detail: { value }
       ds-search-field-submit   detail: { value }    (Enter key)
       ds-search-field-clear    detail: {}
   ============================================================================= */

import { boolAttr, enumAttr } from '../../utils/attr.js';

const SIZES = ['small', 'medium', 'large'];

let _uid = 0;

export class DsSearchField extends HTMLElement {
  static get observedAttributes() {
    return [
      'size', 'placeholder', 'value',
      'show-shortcut', 'shortcut-label',
      'loading', 'disabled', 'error', 'rtl',
    ];
  }

  constructor() {
    super();
    this._uid = ++_uid;
  }

  connectedCallback() {
    if (!this._mounted) {
      this._build();
      this._mounted = true;
    }
    this._sync();
  }

  attributeChangedCallback(name, _old, _new) {
    if (!this._mounted) return;
    /* `value` attribute → push to native input, then sync state. */
    if (name === 'value' && this._input && this._input.value !== (_new ?? '')) {
      this._input.value = _new ?? '';
    }
    this._sync();
  }

  /* ── Public value mirror (input.value source of truth) ─────────── */
  get value() { return this._input ? this._input.value : (this.getAttribute('value') || ''); }
  set value(v) {
    const next = v == null ? '' : String(v);
    if (this._input) this._input.value = next;
    if (next) this.setAttribute('value', next); else this.removeAttribute('value');
    this._sync();
  }

  focus(opts) { this._input?.focus(opts); }
  blur()      { this._input?.blur(); }

  /* ── Build light-DOM markup once ───────────────────────────────── */
  _build() {
    const inputId = `ds-search-${this._uid}`;
    this.innerHTML = `
      <div class="ds-search-field" part="root">
        <span class="ds-search-field__icon" aria-hidden="true" data-icon-search></span>
        <input
          id="${inputId}"
          class="ds-search-field__input"
          type="search"
          autocomplete="off"
          spellcheck="false"
          enterkeyhint="search"
          data-input
        />
        <span class="ds-search-field__trailing" data-trailing></span>
      </div>`;

    this._root  = this.querySelector('.ds-search-field');
    this._input = this.querySelector('[data-input]');
    this._iconSlot = this.querySelector('[data-icon-search]');
    this._trailing = this.querySelector('[data-trailing]');

    /* Inject the search icon (uses the icon sprite for visual consistency
       with the rest of the system; falls back to inline SVG when no sprite
       is configured so the field still works in isolation). */
    this._iconSlot.innerHTML = this._svg('search');

    /* Wire input events */
    this._input.addEventListener('input', () => {
      this._reflectValue();
      this._sync();
      this.dispatchEvent(new CustomEvent('ds-search-field-input', {
        bubbles: true,
        detail: { value: this._input.value },
      }));
    });
    this._input.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this._input.value !== '') {
        e.stopPropagation();
        this._clear('keyboard');
      } else if (e.key === 'Enter') {
        this.dispatchEvent(new CustomEvent('ds-search-field-submit', {
          bubbles: true,
          detail: { value: this._input.value },
        }));
      }
    });

    /* Focus the input when the user clicks the chrome (icon / padding). */
    this._root.addEventListener('mousedown', (e) => {
      const t = e.target;
      if (t === this._root || t === this._iconSlot || t.closest?.('[data-icon-search]')) {
        e.preventDefault();
        this._input.focus();
      }
    });
  }

  _reflectValue() {
    const v = this._input.value;
    if (v) this.setAttribute('value', v);
    else this.removeAttribute('value');
  }

  _clear(source) {
    this._input.value = '';
    this.removeAttribute('value');
    this._sync();
    this._input.focus();
    this.dispatchEvent(new CustomEvent('ds-search-field-input', {
      bubbles: true, detail: { value: '' },
    }));
    this.dispatchEvent(new CustomEvent('ds-search-field-clear', {
      bubbles: true, detail: { source: source || 'click' },
    }));
  }

  /* ── Per-frame state sync — classes + ARIA + trailing slot ─────── */
  _sync() {
    const size       = enumAttr(this, 'size', SIZES, 'small');
    const showShort  = boolAttr(this, 'show-shortcut');
    const shortLabel = this.getAttribute('shortcut-label') || '⌘K';
    const loading    = boolAttr(this, 'loading');
    const disabled   = boolAttr(this, 'disabled');
    const error      = boolAttr(this, 'error');
    const rtl        = boolAttr(this, 'rtl');
    const ph         = this.getAttribute('placeholder');
    const valueAttr  = this.getAttribute('value');

    /* Push value attribute → input (only when input is empty, to avoid
       clobbering user typing). Must run BEFORE deriving `filled` so an
       attribute-initialised value shows its Clear button on first render. */
    if (valueAttr != null && !this._input.value) {
      this._input.value = valueAttr;
    }

    const filled     = !!(this._input && this._input.value);

    if (ph != null) this._input.setAttribute('placeholder', ph);

    /* Container classes */
    const cls = this._root.classList;
    [...cls].forEach((c) => { if (c.startsWith('ds-search-field--')) cls.remove(c); });
    cls.add(`ds-search-field--${size}`);
    if (filled)   cls.add('ds-search-field--filled');
    if (loading)  cls.add('ds-search-field--loading');
    if (disabled) cls.add('ds-search-field--disabled');
    if (error)    cls.add('ds-search-field--error');

    /* RTL */
    if (rtl) this._root.setAttribute('dir', 'rtl');
    else this._root.removeAttribute('dir');

    /* Input flags */
    this._input.disabled = disabled;
    if (loading) this._input.setAttribute('aria-busy', 'true');
    else this._input.removeAttribute('aria-busy');
    if (error) this._input.setAttribute('aria-invalid', 'true');
    else this._input.removeAttribute('aria-invalid');

    /* Trailing slot — pick exactly one element based on state priority:
       loading → spinner; filled or error → clear button; otherwise shortcut
       chip (only if show-shortcut). */
    let trailingHTML = '';
    if (loading) {
      trailingHTML = '<span class="ds-search-field__loader" role="status" aria-label="Searching"></span>';
    } else if ((filled || error) && !disabled) {
      trailingHTML = `
        <button type="button" class="ds-search-field__clear" aria-label="Clear search" data-clear>
          ${this._svg('close', 16)}
        </button>`;
    } else if (showShort && !disabled) {
      trailingHTML = `<kbd class="ds-search-field__shortcut">${shortLabel}</kbd>`;
    }
    if (this._trailing.innerHTML !== trailingHTML) {
      this._trailing.innerHTML = trailingHTML;
      this._trailing.querySelector('[data-clear]')?.addEventListener('click', () => this._clear('button'));
    }
  }

  /* SVG helper — references the icon sprite when available, falls back to
     inline path so the field renders correctly even when no sprite is set. */
  _svg(name, sizePx) {
    const sprite = (typeof window !== 'undefined' && window.UEMS_ICON_SPRITE !== undefined)
      ? window.UEMS_ICON_SPRITE
      : '/icons.svg';
    const size = sizePx ? `width="${sizePx}" height="${sizePx}"` : 'width="100%" height="100%"';
    return `<svg ${size} focusable="false" aria-hidden="true" style="display:block"><use href="${sprite}#icon-${name}"></use></svg>`;
  }
}

if (typeof customElements !== 'undefined' && !customElements.get('ds-search-field')) {
  customElements.define('ds-search-field', DsSearchField);
}
