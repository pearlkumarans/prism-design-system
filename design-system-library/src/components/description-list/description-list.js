/* =============================================================================
   <ds-description-list> — term/value metadata pairs (maps to native <dl>).
   Spec: handoff/description-list.md  (Figma 20097:607638, based on PatternFly)

   Usage:
     const dl = document.createElement('ds-description-list');
     dl.setAttribute('columns', '2');            // 1 | 2 | 3 | auto   (default 1)
                                                 // auto = fill available width
                                                 // with as many columns as fit
     dl.setAttribute('orientation', 'horizontal');// stacked | horizontal
     dl.items = [
       { term: 'Status', description: 'Active' },
       { term: 'Owner',  description: 'Jane Doe', help: 'The billing owner', editable: true },
       { term: 'Region', description: '' },       // empty → renders an em-dash
     ];
     dl.addEventListener('ds-description-list-edit', e => …e.detail.index/term/item);
     dl.addEventListener('ds-description-list-help', e => …);

   Attributes: columns (1|2|3|auto — auto packs as many columns as the width fits),
               orientation (stacked|horizontal|horizontal-auto), rtl.
   Property:   items — Array<{ term, description, help?, editable?, type?, … }>.

   `type` picks how the value renders (each maps to an existing Prism component):
     • 'text'    (default) — plain text; empty → em-dash
     • 'status'  → ds-status-indicator   { status:'success', description:'Active' }
     • 'badge'   → ds-badge              { type:'badge', state:'warning', description:'Pending', variant?, icon? }
     • 'link'    → ds-text-link          { type:'link', description:'KB5028166', href:'…', icon? }
     • 'tags'    → ds-tag[]              { type:'tags', tags:['Prod', {label:'US', variant:'success'}] }
     • 'user'    → ds-avatar + name      { type:'user', name:'Jane Doe', avatar?, email? }
     • 'icon'    → ds-icon + text        { type:'icon', icon:'shield', description:'Verified' }
     • 'progress'→ ds-progress-bar       { type:'progress', value:72, valueLabel?, variant? }
     • 'toggle'  → ds-toggle             { type:'toggle', checked:true, disabled? }
     • 'copy'    → text + copy button    { type:'copy', description:'a1b2c3…' }
   (Back-compat: an item with `status` and no `type` is treated as type:'status'.)

   Events: ds-description-list-{edit|help|toggle|copy} — detail { index, term, item, … }.
   ============================================================================= */
import { boolAttr, enumAttr } from '../../utils/attr.js';
import '../../icons/icon.js';
import '../icon-button/icon-button.js';
import '../tooltip/tooltip.js';
/* A value may be rendered as one of several Prism components (see `type`). */
import '../status-indicator/status-indicator.js';
import '../badge/badge.js';
import '../tag/tag.js';
import '../text-link/text-link.js';
import '../avatar/avatar.js';
import '../progress-bar/progress-bar.js';
import '../toggle/toggle.js';
import { injectCss } from '../../utils/inject-css.js';
import { escapeHtml } from '../../utils/escape.js';

/* Auto-load light-DOM sub-component stylesheets once (so this works on pages
   that link description-list.css individually, not just the bundled index.css). */
injectCss('ds-description-list-css', './description-list.css', import.meta.url);
injectCss('ds-description-list-ib-css', '../icon-button/icon-button.css', import.meta.url);
injectCss('ds-description-list-tt-css', '../tooltip/tooltip.css', import.meta.url);
injectCss('ds-description-list-si-css', '../status-indicator/status-indicator.css', import.meta.url);
injectCss('ds-description-list-bg-css', '../badge/badge.css', import.meta.url);
injectCss('ds-description-list-tag-css', '../tag/tag.css', import.meta.url);
injectCss('ds-description-list-tl-css', '../text-link/text-link.css', import.meta.url);
injectCss('ds-description-list-av-css', '../avatar/avatar.css', import.meta.url);
injectCss('ds-description-list-pb-css', '../progress-bar/progress-bar.css', import.meta.url);
injectCss('ds-description-list-tg-css', '../toggle/toggle.css', import.meta.url);

const COLUMNS = ['1', '2', '3', 'auto'];
const ORIENTATIONS = ['stacked', 'horizontal', 'horizontal-auto'];

export class DsDescriptionList extends HTMLElement {
  static get observedAttributes() { return ['columns', 'orientation', 'rtl']; }

  constructor() {
    super();
    /* Reclaim an `items` assigned before upgrade (a plain data property would
       otherwise shadow the accessor below). Same guard as ds-list. */
    if (Object.prototype.hasOwnProperty.call(this, 'items')) {
      const v = this.items;
      delete this.items;
      this._pendingItems = v;
    }
    this._items = [];
  }

  /* Data: [{ term, description, help?, editable? }] */
  get items() { return this._items.slice(); }
  set items(v) { this._items = Array.isArray(v) ? v.slice() : []; if (this._root) this._render(); }

  connectedCallback() {
    if (!this._root) {
      this.innerHTML = '';
      this._root = document.createElement('dl');
      this.appendChild(this._root);
    }
    if (this._pendingItems !== undefined) {
      this.items = this._pendingItems;
      this._pendingItems = undefined;
    }
    this._render();
  }

  attributeChangedCallback(name) {
    if (!this._root) return;
    /* columns + orientation only change the grid class / data attr — repaint in
       place so the value ds-icons and typed sub-components keep their identity.
       `rtl` also propagates into the typed value children (rtlA in _valueHtml),
       so it rebuilds. */
    if (name === 'columns' || name === 'orientation') this._paintChrome();
    else this._render();
  }

  /* Grid class + column data attr + direction only — no innerHTML rebuild. */
  _paintChrome() {
    const columns = enumAttr(this, 'columns', COLUMNS, '1');
    const orientation = enumAttr(this, 'orientation', ORIENTATIONS, 'stacked');
    const rtl = boolAttr(this, 'rtl');
    this._root.className = `ds-description-list ds-description-list--${orientation}`;
    this._root.dataset.columns = columns;
    if (rtl) this._root.setAttribute('dir', 'rtl'); else this._root.removeAttribute('dir');
  }

  _render() {
    const rtl = boolAttr(this, 'rtl');

    /* Root chrome — shared with the visual-only path. */
    this._paintChrome();

    this._root.innerHTML = this._items.map((it, i) => {
      const term = escapeHtml(it.term ?? '');
      /* Empty value reads as an em-dash rather than a blank <dd> (spec edge case). */
      const hasValue = it.description != null && String(it.description).trim() !== '';
      const value = hasValue ? escapeHtml(it.description) : '—';

      const help = it.help
        ? `<ds-tooltip class="ds-description-list__help-tip" text="${escapeHtml(it.help)}" position="up-center" show-icon="false">`
          + `<button type="button" class="ds-description-list__help" data-help="${i}" aria-label="About ${term}">`
          + `<ds-icon name="help-circle" size="14"></ds-icon></button></ds-tooltip>`
        : '';

      const edit = it.editable
        ? `<ds-icon-button class="ds-description-list__edit" data-edit="${i}" shape="square" `
          + `type="tertiary-grey" size="small" icon="edit" label="Edit ${term}"></ds-icon-button>`
        : '';

      /* The value can render as one of several Prism components (see `type`). */
      const valueInner = this._valueHtml(it, i, term, hasValue, value, rtl);

      return (
        `<div class="ds-description-list__item">`
        /* `term` is already escaped (top of _render) and `help` is a built,
           already-escaped HTML fragment — interpolate both raw, never re-escape. */
        + `<dt class="ds-description-list__term"><span class="ds-description-list__term-text">${term}</span>${help}</dt>`
        + `<dd class="ds-description-list__value${hasValue ? '' : ' ds-description-list__value--empty'}">`
        + `${valueInner}${edit}</dd>`
        + `</div>`
      );
    }).join('');

    this._wire();
  }

  /* Render the value (<dd> inner) for one item, dispatching on `type`.
     Back-compat: an `it.status` with no `type` is treated as type:'status'. */
  _valueHtml(it, i, term, hasValue, value, rtl) {
    const type = it.type || (it.status ? 'status' : 'text');
    /* `term`, `value`, `label` and `fallback` are ALREADY escaped by the caller
       — interpolate them raw. Only RAW `it.*` fields (status/variant/icon/href/…)
       get escaped at their sink below. Re-escaping the pre-escaped locals was a
       double-escape bug (values rendered a literal `&amp;`). */
    const label = hasValue ? value : '';          // `value` is already escaped
    const fallback = label || term;               // typed values fall back to the term
    const rtlA = rtl ? ' rtl' : '';

    switch (type) {
      case 'status':
        return `<ds-status-indicator class="ds-description-list__status" size="large" status="${escapeHtml(it.status || 'default')}" label="${fallback}"${rtlA}></ds-status-indicator>`;

      case 'badge':
        return `<ds-badge variant="${escapeHtml(it.variant || 'subtle')}" state="${escapeHtml(it.state || 'default')}" size="large"`
          + `${it.icon ? ` icon="${escapeHtml(it.icon)}"` : ''}${rtlA}>${fallback}</ds-badge>`;

      case 'link':
        return `<ds-text-link href="${escapeHtml(it.href || '#')}" size="medium"`
          + `${it.icon ? ` leading-icon="${escapeHtml(it.icon)}"` : ''}${rtlA}>${fallback}</ds-text-link>`;

      case 'tags': {
        const tags = Array.isArray(it.tags) ? it.tags : [];
        if (!tags.length) return `<span class="ds-description-list__value-text">—</span>`;
        return `<span class="ds-description-list__tags">`
          + tags.map((t) => {
            const tl = escapeHtml(typeof t === 'string' ? t : (t && t.label != null ? t.label : ''));
            const tv = escapeHtml((t && t.variant) || 'neutral');
            return `<ds-tag variant="${tv}" size="medium" label="${tl}" show-close="false"></ds-tag>`;
          }).join('') + `</span>`;
      }

      case 'user': {
        /* Escape RAW it.name once; else reuse the already-escaped label. `email`
           is a built (already-escaped) fragment — both interpolate raw below. */
        const name = it.name != null ? escapeHtml(it.name) : (label || '');
        const avatarAttr = it.avatar ? ` src="${escapeHtml(it.avatar)}"` : '';
        const email = it.email
          ? `<span class="ds-description-list__user-email">${escapeHtml(it.email)}</span>` : '';
        return `<span class="ds-description-list__user">`
          + `<ds-avatar size="small" name="${name}"${avatarAttr}></ds-avatar>`
          + `<span class="ds-description-list__user-txt"><span>${name || '—'}</span>${email}</span></span>`;
      }

      case 'icon':
        return `<span class="ds-description-list__icon-val">`
          + `<ds-icon name="${escapeHtml(it.icon || 'info-circle')}" size="16"></ds-icon>`
          + `<span>${fallback || '—'}</span></span>`;

      case 'progress': {
        const v = Math.max(0, Math.min(100, Number(it.value) || 0));
        const vl = it.valueLabel != null ? escapeHtml(String(it.valueLabel)) : (v + '%');
        /* The term already labels the row, so suppress the bar's built-in label
           ("Progress") and render just the bar + our own percentage. */
        return `<span class="ds-description-list__progress">`
          + `<ds-progress-bar size="small" value="${escapeHtml(v)}" show-label="false" variant="${escapeHtml(it.variant || 'default')}"></ds-progress-bar>`
          + `<span class="ds-description-list__progress-pct">${vl}</span></span>`;
      }

      case 'toggle':
        return `<ds-toggle class="ds-description-list__toggle" data-toggle="${i}" size="small"`
          + `${it.checked ? ' checked' : ''}${it.disabled ? ' disabled' : ''}${rtlA} label="${term}"></ds-toggle>`;

      case 'copy':
        return `<span class="ds-description-list__copy">`
          + `<span class="ds-description-list__value-text">${label || '—'}</span>`
          + `<ds-icon-button class="ds-description-list__copy-btn" data-copy="${i}" shape="square" type="tertiary-grey" size="small" icon="copy" label="Copy ${term}"></ds-icon-button></span>`;

      default: /* text */
        return `<span class="ds-description-list__value-text">${value}</span>`;
    }
  }

  _wire() {
    this._root.querySelectorAll('[data-edit]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const i = Number(btn.getAttribute('data-edit'));
        const item = this._items[i];
        this.dispatchEvent(new CustomEvent('ds-description-list-edit', {
          bubbles: true, detail: { index: i, term: item?.term, item },
        }));
      });
    });
    this._root.querySelectorAll('[data-help]').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        const i = Number(btn.getAttribute('data-help'));
        const item = this._items[i];
        this.dispatchEvent(new CustomEvent('ds-description-list-help', {
          bubbles: true, detail: { index: i, term: item?.term, item },
        }));
      });
    });
    /* type:'toggle' — reflect the flip back into data and emit an event. */
    this._root.querySelectorAll('.ds-description-list__toggle').forEach((tg) => {
      tg.addEventListener('ds-toggle-change', (e) => {
        const i = Number(tg.getAttribute('data-toggle'));
        const checked = e.detail?.checked ?? tg.checked;
        if (this._items[i]) this._items[i].checked = checked;
        this.dispatchEvent(new CustomEvent('ds-description-list-toggle', {
          bubbles: true, detail: { index: i, checked, term: this._items[i]?.term, item: this._items[i] },
        }));
      });
    });
    /* type:'copy' — copy the value text to the clipboard, then emit an event. */
    this._root.querySelectorAll('[data-copy]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const i = Number(btn.getAttribute('data-copy'));
        const item = this._items[i];
        const text = item?.description != null ? String(item.description) : '';
        if (navigator.clipboard?.writeText) navigator.clipboard.writeText(text).catch(() => {});
        this.dispatchEvent(new CustomEvent('ds-description-list-copy', {
          bubbles: true, detail: { index: i, value: text, term: item?.term, item },
        }));
      });
    });
  }
}

if (typeof customElements !== 'undefined' && !customElements.get('ds-description-list')) {
  customElements.define('ds-description-list', DsDescriptionList);
}
