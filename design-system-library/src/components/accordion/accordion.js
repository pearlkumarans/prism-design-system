/* =============================================================================
   <ds-accordion> — Web Component
   Spec: ./accordion.md
   ============================================================================= */

import { boolAttr, enumAttr, reflectBool } from '../../utils/attr.js';
/* Register <ds-checkbox> + <ds-toggle> so the accordion can reuse them as
   its leading controls (type="checkbox" / type="toggle"). */
import '../checkbox/checkbox.js';
import '../toggle/toggle.js';

/* Auto-load checkbox.css + toggle.css since the accordion now reuses these
   components in light DOM. Idempotent — each is injected only once per
   document. */
function _injectStylesheet(id, relativePath) {
  if (typeof document === 'undefined') return;
  if (document.getElementById(id)) return;
  const link = document.createElement('link');
  link.id = id;
  link.rel = 'stylesheet';
  link.href = new URL(relativePath, import.meta.url).href;
  document.head.appendChild(link);
}
_injectStylesheet('ds-accordion-cb-css',     '../checkbox/checkbox.css');
_injectStylesheet('ds-accordion-toggle-css', '../toggle/toggle.css');

let uid = 0;

const TEMPLATE = (sprite) => `
  <style>
    :host {
      display: block; width: 100%; box-sizing: border-box;
      font-family: var(--font-family-sans); color: var(--uems-text-primary);
      border-radius: var(--radius-md); overflow: hidden;
      /* Filled variant (default): the whole accordion shares one bg so the
         header and body read as a single rounded surface. */
      background-color: var(--uems-bg-secondary-alt);
    }
    :host([variant="outlined"]) {
      border: 1px solid var(--uems-border-tertiary);   /* #E1E4EB — both collapsed & expanded */
      background-color: var(--uems-bg-base);
    }
    /* Filled: borderless at rest (spec), but once Expanded the white body needs
       a perimeter to read as a contained card. Reserve the 1px with a
       transparent border so expanding causes no layout shift. */
    :host(:not([variant="outlined"])) { border: 1px solid transparent; }
    :host(:not([variant="outlined"])[expanded]) { border-color: var(--uems-border-tertiary); }
    /* The header's click/keydown handlers bail when disabled, so clicks are
       already blocked — keep pointer-events on + not-allowed cursor so the
       cursor shows (pointer-events:none would suppress it entirely). */
    :host([disabled]) { opacity: 0.5; }
    :host([disabled]) [part="header"] { cursor: not-allowed; }
    :host([rtl]) [part="header"] { flex-direction: row-reverse; text-align: end; }

    [part="header"] {
      display: flex; align-items: center; gap: var(--spacing-8);
      width: 100%; padding: var(--spacing-8) var(--spacing-16); min-height: 40px;
      border: 0; background: transparent;
      cursor: pointer; text-align: start; font: inherit; color: inherit;
      box-sizing: border-box;
      transition: background-color 180ms cubic-bezier(0.4, 0, 0.2, 1),
                  box-shadow 180ms cubic-bezier(0.4, 0, 0.2, 1);
    }
    :host([variant="outlined"]) [part="header"] { min-height: 40px; }
    /* Hover per Style: Filled → BG-Secondary-hover; Outlined → BG-Primary-hover
       fill + host border re-tints to Border-Tertiary (spec). */
    :host(:not([variant="outlined"])) [part="header"]:hover { background-color: var(--uems-bg-secondary-hover); }
    :host([variant="outlined"]) [part="header"]:hover { background-color: var(--uems-bg-primary-hover); }
    :host([variant="outlined"]:hover) { border-color: var(--uems-border-tertiary); }
    /* Subtle press feedback */
    [part="header"]:active { background-color: var(--uems-bg-tertiary, var(--uems-bg-secondary-hover)); }

    /* Per spec: 2px Border-Accent focus ring rendered OUTSIDE the header stroke. */
    [part="header"]:focus-visible {
      outline: 2px solid var(--uems-border-accent-focus);
      outline-offset: 2px;
    }

    [part="leading"] {
      display: inline-flex; align-items: center; justify-content: center;
      flex: 0 0 auto;
      color: var(--uems-icon-tertiary);     /* spec: chevron caret = Icon-Tertiary */
    }
    /* Default chevron fallback — a 24×24 icon button (radius 4) holding a 16px
       caret, per spec. Collapsed → points down; Expanded → rotate 180° (up). */
    [part="leading"] .acc-chevron {
      display: inline-flex; align-items: center; justify-content: center;
      width: 24px; height: 24px;
      border-radius: var(--radius-sm);
      transform-origin: center;
      transition: transform 280ms cubic-bezier(0.4, 0, 0.2, 1);
    }
    [part="leading"] .acc-chevron svg {
      width: 16px; height: 16px;
    }
    :host([expanded]) [part="leading"] .acc-chevron { transform: rotate(180deg); }

    /* Title + description stack — when a [slot="description"] is present, it
       sits under the title with a smaller, secondary tone. Hidden when the
       accordion is expanded so the body content takes over. */
    [part="title-stack"] {
      flex: 1 1 auto; min-width: 0;
      display: flex; flex-direction: column; gap: 2px;
      overflow: hidden;
    }
    [part="description"] {
      font-size: var(--font-size-12);
      color: var(--uems-text-secondary);
      line-height: var(--line-height-snug);
      overflow: hidden; text-overflow: ellipsis;
      /* Hidden by default. A previous :not(:has(*)) check never fired — the
         wrapper always holds a slot element child — so the empty box stayed
         a flex item and its 2px column gap pushed the title off-center (and
         made it jump when [expanded] later removed it). Show only when a
         description is actually slotted; the title then stays centered with no
         expand/collapse shift. */
      display: none;
    }
    :host(:has([slot="description"])) [part="description"] { display: block; }
    :host([expanded]) [part="description"] { display: none; }

    [part="title"] {
      min-width: 0;
      overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
      font-size: var(--font-size-14); font-weight: var(--font-weight-medium);
      line-height: var(--line-height-snug); color: var(--uems-text-primary);
      display: block;
    }

    [part="badge"], [part="action"] {
      flex: 0 0 auto;
      display: inline-flex;
      align-items: center;
    }
    /* Hide the badge/action wrappers if no slotted content — keeps header
       gap-clean when consumer only provides a title. */
    [part="badge"]:not(:has(*)), [part="action"]:not(:has(*)) { display: none; }

    /* Trailing chevron — opt-in via [show-trailing], off by default per spec. */
    [part="trailing"] {
      display: none;
      align-items: center;
      flex: 0 0 16px;
      width: 16px; height: 16px;
      color: var(--uems-icon-tertiary, var(--uems-text-tertiary));
    }
    :host([show-trailing]) [part="trailing"] { display: inline-flex; }
    :host([rtl]) [part="trailing"] svg { transform: scaleX(-1); }

    /* Smooth expand/collapse:
       grid-template-rows 0fr -> 1fr animates intrinsic height with pure CSS,
       no JS measurement / no max-height ceiling, works for any body size.
       Outer [part=body] is the grid container; inner .acc-body-inner is the
       grid child that holds padding + content (min-height:0 + overflow:hidden
       to clip while animating). */
    [part="body"] {
      display: grid;
      grid-template-rows: 0fr;
      background: var(--uems-bg-primary-alt);   /* body surface = white (both styles) */
      transition: grid-template-rows 320ms cubic-bezier(0.4, 0, 0.2, 1);
    }
    :host([expanded]) [part="body"] {
      grid-template-rows: 1fr;
    }
    .acc-body-inner {
      min-height: 0;
      overflow: hidden;
      display: flex; flex-direction: column; gap: var(--spacing-12);  /* body gap 12 */
      padding: 0 var(--spacing-16);
      color: var(--uems-text-secondary);
      font-size: var(--font-size-14); line-height: var(--line-height-normal);
      /* Divider drawn with an inset shadow, NOT a border: a border has layout
         height, so when collapsed (grid row 0fr) its 1px keeps the white body
         peeking below the header. box-shadow adds zero height → true 0 collapse. */
      transition: padding 280ms cubic-bezier(0.4, 0, 0.2, 1),
                  box-shadow 200ms cubic-bezier(0.4, 0, 0.2, 1);
    }
    /* Once the open animation finishes, allow children (dropdown popovers,
       tooltips, date pickers, etc.) to escape the body's bounds. JS toggles
       data-open-settled on [part="body"] via transitionend. */
    [part="body"][data-open-settled] .acc-body-inner {
      overflow: visible;
    }
    /* When expanded, restore real padding + divider color. */
    :host([expanded]) .acc-body-inner {
      padding: var(--spacing-16);              /* body padding 16 (all) */
      box-shadow: inset 0 1px 0 0 var(--uems-border-tertiary);
    }

    /* Honor users with reduced-motion preference */
    @media (prefers-reduced-motion: reduce) {
      [part="body"],
      .acc-body-inner,
      [part="leading"] .acc-chevron,
      [part="header"] {
        transition: none !important;
      }
    }

    /* Hide slot wrappers when their named slot is empty */
    .slot-empty { display: none !important; }
  </style>

  <div part="header" role="button" tabindex="0" aria-expanded="false">
    <span part="leading" aria-hidden="true">
      <slot name="leading-control">
        <span class="acc-chevron">
          <svg width="16" height="16" focusable="false" aria-hidden="true">
            <use href="${sprite}#icon-chevron-down"></use>
          </svg>
        </span>
      </slot>
    </span>
    <span part="title-stack">
      <span part="title"><slot name="title">Accordion Title</slot></span>
      <span part="description"><slot name="description"></slot></span>
    </span>
    <span part="badge"><slot name="badge"></slot></span>
    <span part="action"><slot name="action"></slot></span>
    <span part="trailing" aria-hidden="true">
      <svg width="16" height="16" focusable="false" aria-hidden="true">
        <use href="${sprite}#icon-chevron-right"></use>
      </svg>
    </span>
  </div>
  <div part="body" role="region">
    <div class="acc-body-inner">
      <slot name="body"></slot>
      <slot name="body2"></slot>
      <slot name="body3"></slot>
      <slot name="body4"></slot>
      <slot name="body5"></slot>
      <slot name="body6"></slot>
      <slot name="body7"></slot>
      <slot name="body8"></slot>
      <slot></slot>
    </div>
  </div>
`;

export class DsAccordion extends HTMLElement {
  static get observedAttributes() {
    return ['variant', 'type', 'expanded', 'disabled', 'rtl'];
  }

  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this._id = `ds-accordion-${++uid}`;
  }

  connectedCallback() {
    const sprite = (typeof window !== 'undefined' && window.UEMS_ICON_SPRITE) || '/icons.svg';
    if (!this.shadowRoot.firstElementChild) {
      this.shadowRoot.innerHTML = TEMPLATE(sprite);
      this._wire();
    }
    this._sync();
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (!this.shadowRoot.firstElementChild) return;
    if (name === 'type') this._renderLeading();
    /* Clear "open settled" the moment we leave the expanded state so the
       body re-clips during the collapse animation. The expanded → settled
       flip happens in the transitionend listener wired in _wire(). */
    if (name === 'expanded' && newValue === null && this._body) {
      delete this._body.dataset.openSettled;
    }
    this._sync();
  }

  _wire() {
    this._header = this.shadowRoot.querySelector('[part="header"]');
    this._body   = this.shadowRoot.querySelector('[part="body"]');
    this._body.id = `${this._id}-body`;
    this._header.setAttribute('aria-controls', this._body.id);

    /* When the grid-template-rows open animation finishes, mark the body
       as "settled" so embedded dropdown popovers can extend past it. */
    this._body.addEventListener('transitionend', (e) => {
      if (e.propertyName !== 'grid-template-rows') return;
      if (boolAttr(this, 'expanded')) {
        this._body.dataset.openSettled = '';
      } else {
        delete this._body.dataset.openSettled;
      }
    });

    this._header.addEventListener('click', (e) => {
      if (boolAttr(this, 'disabled')) return;
      /* Click anywhere on the header — action slot, checkbox/toggle leading,
         title, description, badge — toggles expanded. Exception: the
         auto-created leading <ds-checkbox> / <ds-toggle> dispatches its own
         change event which we mirror below; toggling twice would cancel
         itself out. */
      const path = e.composedPath();
      const inAccLeading = path.some((n) => n.nodeType === 1 && n.matches?.(
        'ds-checkbox[data-acc-leading], ds-checkbox[data-acc-leading] *, ' +
        'ds-toggle[data-acc-leading], ds-toggle[data-acc-leading] *'
      ));
      if (inAccLeading) return;
      this.toggle();
    });

    /* Sync expanded ← auto-leading control state changes (keyboard + click). */
    const onLeadingChange = (e) => {
      const t = e.target;
      if (t && t.matches?.('[data-acc-leading]')) {
        this.expanded = !!e.detail?.checked;
        e.stopPropagation();
      }
    };
    this.addEventListener('ds-checkbox-change', onLeadingChange);
    this.addEventListener('ds-toggle-change',   onLeadingChange);

    this._header.addEventListener('keydown', (e) => {
      if (boolAttr(this, 'disabled')) return;
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        this.toggle();
      }
    });

    this._renderLeading();
  }

  _renderLeading() {
    /* Reuse the real <ds-checkbox> / <ds-toggle> components so the leading
       control is visually + behaviourally identical to its standalone form.
       Auto-created elements carry [data-acc-leading] so we can distinguish
       them from any consumer-added children. */
    const type = enumAttr(this, 'type', ['default', 'checkbox', 'toggle'], 'default');
    const cb = this.querySelector(':scope > ds-checkbox[data-acc-leading]');
    const tg = this.querySelector(':scope > ds-toggle[data-acc-leading]');

    if (type === 'checkbox') {
      if (tg) tg.remove();
      let el = cb;
      if (!el) {
        el = document.createElement('ds-checkbox');
        el.setAttribute('data-acc-leading', '');
        el.setAttribute('slot', 'leading-control');
        el.setAttribute('tabindex', '-1');
        this.appendChild(el);
      }
      el.toggleAttribute('checked', boolAttr(this, 'expanded'));
    } else if (type === 'toggle') {
      if (cb) cb.remove();
      let el = tg;
      if (!el) {
        el = document.createElement('ds-toggle');
        el.setAttribute('data-acc-leading', '');
        el.setAttribute('slot', 'leading-control');
        el.setAttribute('size', 'small');
        el.setAttribute('tabindex', '-1');
        this.appendChild(el);
      }
      el.toggleAttribute('checked', boolAttr(this, 'expanded'));
    } else {
      if (cb) cb.remove();
      if (tg) tg.remove();
    }
  }

  _sync() {
    const expanded = boolAttr(this, 'expanded');
    const disabled = boolAttr(this, 'disabled');
    if (this._header) {
      this._header.setAttribute('aria-expanded', String(expanded));
      this._header.setAttribute('aria-disabled', String(disabled));
      this._header.tabIndex = disabled ? -1 : 0;
    }
    /* Keep the auto-leading <ds-checkbox> / <ds-toggle> in lock-step with
       [expanded]. Both components reflect [checked] for their visual. */
    const leading = this.querySelector(':scope > [data-acc-leading]');
    if (leading) {
      leading.toggleAttribute('checked', expanded);
      if (disabled) leading.setAttribute('disabled', '');
      else leading.removeAttribute('disabled');
    }
  }

  toggle() {
    this.expanded = !this.expanded;
  }

  get expanded() { return boolAttr(this, 'expanded'); }
  set expanded(value) {
    const next = !!value;
    reflectBool(this, 'expanded', next);
    this.dispatchEvent(new CustomEvent('ds-accordion-toggle', {
      bubbles: true, composed: true, detail: { expanded: next },
    }));
  }

  get disabled() { return boolAttr(this, 'disabled'); }
  set disabled(value) { reflectBool(this, 'disabled', !!value); }
}

if (typeof customElements !== 'undefined' && !customElements.get('ds-accordion')) {
  customElements.define('ds-accordion', DsAccordion);
}
