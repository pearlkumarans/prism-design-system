/* =============================================================================
   <ds-checkbox-group label="Notify me about" help-text="..." size="medium"
                      label-position="left" state="default"
                      show-help-icon show-counter counter="2/5" name="prefs"
                      value="comments,mentions" rtl>
     <ds-checkbox value="comments"  label="Comments"></ds-checkbox>
     <ds-checkbox value="mentions"  label="Mentions"></ds-checkbox>
     <ds-checkbox value="reminders" label="Reminders"></ds-checkbox>
   </ds-checkbox-group>

   - Renders a <fieldset>-style structure (header + items + helper row).
   - Cascades size / state / rtl onto child <ds-checkbox> elements.
   - `value` is comma-separated for HTML simplicity; the `values` JS getter
     returns an array. Emits `ds-checkbox-group-change` with `{ values }`.
   ============================================================================= */

import { boolAttr, enumAttr } from '../../utils/attr.js';
import { watchLateChildren, stopLateChildren } from '../../utils/late-children.js';
/* The helper/note row reuses the shared <ds-field-helper> sub-component. */
import '../field-helper/field-helper.js';

/* Auto-load field-helper.css once (both are light-DOM, so the stylesheet must
   be present even on pages that load checkbox-group.css individually). */
function _injectCss(id, rel) {
  if (typeof document === 'undefined' || document.getElementById(id)) return;
  const l = document.createElement('link');
  l.id = id; l.rel = 'stylesheet'; l.href = new URL(rel, import.meta.url).href;
  document.head.appendChild(l);
}
_injectCss('ds-checkbox-group-fh-css', '../field-helper/field-helper.css');

const POSITIONS = ['none', 'left', 'top'];
const SIZES = ['small', 'medium'];
const STATES = ['default', 'error', 'disabled'];

const INFO_SVG = `
  <svg width="16" height="16" focusable="false" aria-hidden="true">
    <use href="${(typeof window !== 'undefined' && window.UEMS_ICON_SPRITE) || '/icons.svg'}#icon-info-circle"></use>
  </svg>`;

export class DsCheckboxGroup extends HTMLElement {
  static get observedAttributes() {
    return [
      'label', 'label-position', 'size', 'state', 'help-text',
      'show-help-icon', 'show-helper-row', 'show-counter', 'counter', 'value',
      'name', 'rtl',
    ];
  }

  constructor() {
    super();
    this._items = []; // captured original child <ds-checkbox> items
  }

  connectedCallback() {
    if (!this._mounted) {
      this._items = [...this.children].filter((c) => c.tagName?.toLowerCase() === 'ds-checkbox');
      this.innerHTML = '';
      this._build();
      this._mounted = true;
      // Bubble individual changes up as a group change event
      this.addEventListener('ds-checkbox-change', () => this._emitChange());
    }
    this._sync();
    /* Frameworks insert <ds-checkbox> after upgrade; append any that leak in. */
    watchLateChildren(this, (late) => {
      const boxes = late.filter((n) => n.tagName?.toLowerCase() === 'ds-checkbox');
      if (!boxes.length) return;
      boxes.forEach((b) => this._itemsEl.appendChild(b));
      this._items = [...this._itemsEl.children];
      this._sync();
    });
  }

  disconnectedCallback() {
    stopLateChildren(this);
  }

  attributeChangedCallback() {
    if (this._mounted) this._sync();
  }

  _build() {
    const sprite = (typeof window !== 'undefined' && window.UEMS_ICON_SPRITE) || '/icons.svg';

    const header = document.createElement('div');
    header.className = 'ds-checkbox-group__header';
    header.innerHTML = `
      <span class="ds-checkbox-group__label"></span>
      <span class="ds-checkbox-group__info" aria-hidden="true" hidden>
        <svg width="20" height="20" focusable="false" aria-hidden="true">
          <use href="${sprite}#icon-help-circle"></use>
        </svg>
      </span>`;

    const body = document.createElement('div');
    body.className = 'ds-checkbox-group__body';

    const items = document.createElement('div');
    items.className = 'ds-checkbox-group__items';
    items.setAttribute('role', 'group');
    this._items.forEach((it) => items.appendChild(it));

    /* Helper/note row = the shared <ds-field-helper> directly (no wrapper div) so
       it self-collapses to zero when empty and never leaves the body's gap
       reserving blank space below the options — identical behaviour to
       ds-text-input / ds-input-select. */
    const helper = document.createElement('ds-field-helper');
    helper.className = 'ds-checkbox-group__helper';

    body.append(items, helper);
    /* header + body live in a __frame so the flex layout sits on the frame, not
       the host — the host is a `container-type` query container, letting the
       left↔stacked switch respond to the field's own width (see CSS). */
    const frame = document.createElement('div');
    frame.className = 'ds-checkbox-group__frame';
    frame.append(header, body);
    this.append(frame);

    this._header     = header;
    this._labelEl    = header.querySelector('.ds-checkbox-group__label');
    this._infoEl     = header.querySelector('.ds-checkbox-group__info');
    this._items      = [...items.children]; // preserved references after move
    this._itemsEl    = items;
    this._helperEl   = helper;   // the <ds-field-helper> itself
    this._helpEl     = helper;   // same element (no wrapper)
  }

  _sync() {
    const position = enumAttr(this, 'label-position', POSITIONS, 'left');
    const size     = enumAttr(this, 'size',           SIZES,     'small');
    const state    = enumAttr(this, 'state',          STATES,    'default');
    const rtl      = boolAttr(this, 'rtl');

    const showHelpIcon = this.hasAttribute('show-help-icon')
      ? boolAttr(this, 'show-help-icon')
      : true; // default true per spec
    const showHelperRow = this.hasAttribute('show-helper-row')
      ? boolAttr(this, 'show-helper-row')
      : true; // default true per spec
    const showCounter  = boolAttr(this, 'show-counter');
    const labelText    = this.getAttribute('label')       || '';
    const helpText     = this.getAttribute('help-text')   || '';
    const counterText  = this.getAttribute('counter')     || '';
    const checkedValues = (this.getAttribute('value') || '')
      .split(',').map((s) => s.trim()).filter(Boolean);
    const name = this.getAttribute('name');

    this.classList.add('ds-checkbox-group');
    this.classList.toggle('ds-checkbox-group--left', position === 'left');
    this.classList.toggle('ds-checkbox-group--top',  position === 'top');
    this.classList.toggle('ds-checkbox-group--none', position === 'none');
    this.classList.toggle('ds-checkbox-group--error',    state === 'error');
    this.classList.toggle('ds-checkbox-group--disabled', state === 'disabled');

    if (rtl) this.setAttribute('dir', 'rtl');
    else this.removeAttribute('dir');

    this._labelEl.textContent = labelText;
    this._infoEl.hidden = !(showHelpIcon && labelText);
    /* label-position="none" hides the header; keep the group named for screen
       readers by moving the label text onto the items group's aria-label. */
    this._header.hidden = position === 'none';
    if (position === 'none' && labelText) this._itemsEl.setAttribute('aria-label', labelText);
    else this._itemsEl.removeAttribute('aria-label');

    /* Helper/note row via <ds-field-helper>: state drives its colour + leading
       icon (info-circle → exclamation-circle on error); the counter (when shown)
       is pinned to the trailing edge inside the same row. */
    const showCounterText = showCounter && counterText;
    this._helpEl.setAttribute('text', helpText);
    this._helpEl.setAttribute('state', state === 'error' ? 'error' : state === 'disabled' ? 'disabled' : 'default');
    if (rtl) this._helpEl.setAttribute('rtl', '');
    else this._helpEl.removeAttribute('rtl');
    /* No help text but a counter → drop the leading icon so the row is just the
       counter pinned trailing. */
    if (helpText) this._helpEl.removeAttribute('show-icon');
    else this._helpEl.setAttribute('show-icon', 'false');
    if (showCounterText) this._helpEl.setAttribute('counter', counterText);
    else this._helpEl.removeAttribute('counter');
    this._helpEl.hidden = !(helpText || showCounterText);
    this._helperEl.hidden = !(showHelperRow && (helpText || showCounterText));

    // Cascade onto children
    this._items.forEach((cb) => {
      cb.setAttribute('size', size);
      if (rtl) cb.setAttribute('rtl', '');
      else cb.removeAttribute('rtl');
      if (state === 'disabled') cb.setAttribute('disabled', '');
      else cb.removeAttribute('disabled');
      if (state === 'error') cb.setAttribute('error', '');
      else cb.removeAttribute('error');
      if (name) cb.setAttribute('name', name);

      // Apply controlled `value` selection
      const v = cb.getAttribute('value') ?? '';
      if (checkedValues.includes(v)) cb.setAttribute('checked', '');
      else if (this.hasAttribute('value')) cb.removeAttribute('checked');
    });
  }

  _emitChange() {
    this.dispatchEvent(new CustomEvent('ds-checkbox-group-change', {
      bubbles: true, composed: true,
      detail: { values: this.values },
    }));
  }

  get values() {
    return this._items
      .filter((cb) => cb.hasAttribute('checked'))
      .map((cb) => cb.getAttribute('value') ?? '');
  }
  set values(arr) {
    this.setAttribute('value', (Array.isArray(arr) ? arr : []).join(','));
  }
}

if (typeof customElements !== 'undefined' && !customElements.get('ds-checkbox-group')) {
  customElements.define('ds-checkbox-group', DsCheckboxGroup);
}
