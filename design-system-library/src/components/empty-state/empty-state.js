/* =============================================================================
   <ds-empty-state
       type="centered|steps|option-cards|promo"   (default: centered)
       illustration="common-search"
       title="No results found"
       description="Try a different search term or clear the filters."
       primary-label="Clear filters"
       secondary-label="Learn more"
       supported="windows,macos,linux"
       useful-link="#" watch-video="#"
       size="md" rtl></ds-empty-state>

   Four layouts (one per Figma `Type` variant of the Empty State set):
     • centered      illustration → title → description → actions → footer
     • steps         title/description → step cards → primary action → footer
     • option-cards  title/description → banner → option cards
     • promo         media/logo + title/description + action + footer │ benefits

   Composes <ds-illustration>, <ds-button>, <ds-badge>, <ds-icon>.
   description supports inline HTML via the slot:
       <ds-empty-state ...><span slot="description">… <a href="…">Learn more</a></span></ds-empty-state>

   Content collections are set as JS properties:
     el.steps    = [{ badge, label, icon }]
     el.options  = [{ icon, title, description, actionLabel, actionIcon }]
     el.benefits = ['Seamless integration …', …]

   Events (bubbles + composed):
     ds-empty-state-primary | ds-empty-state-secondary
     ds-empty-state-banner  | ds-empty-state-dismiss
     ds-empty-state-option  (detail: { index })
   ============================================================================= */

import { boolAttr, enumAttr } from '../../utils/attr.js';

/* Boolean attr that defaults to `def` when absent; `foo="false"` turns it off
   (matches the show-* convention used across the form-field components). */
const boolAttrDefault = (el, name, def) =>
  el.hasAttribute(name) ? el.getAttribute(name) !== 'false' : def;

const TYPES = ['centered', 'steps', 'option-cards', 'promo'];
const SIZES = ['sm', 'md', 'lg'];
let _esUid = 0;
const OS_ICON = {
  windows: 'microsoft', macos: 'apple', apple: 'apple',
  linux: 'terminal-square', android: 'android', ios: 'apple', chromeos: 'chrome',
};
const esc = (s) => String(s == null ? '' : s)
  .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

export class DsEmptyState extends HTMLElement {
  static get observedAttributes() {
    return [
      'type', 'illustration', 'media', 'title', 'description',
      'primary-label', 'secondary-label',
      'show-illustration', 'show-media', 'show-primary', 'show-secondary',
      'show-banner', 'show-feature-benefits', 'show-footer',
      'supported', 'supported-label', 'show-supported',
      'useful-link', 'useful-link-label', 'watch-video', 'watch-video-label',
      'banner-text', 'banner-action-label', 'benefits-label',
      'size', 'rtl',
    ];
  }

  /* Content collections (DOM-only props) */
  get steps() { return this._steps || []; }
  set steps(v) { this._steps = Array.isArray(v) ? v.slice() : []; if (this._root) this._render(); }
  get options() { return this._options || []; }
  set options(v) { this._options = Array.isArray(v) ? v.slice() : []; if (this._root) this._render(); }
  get benefits() { return this._benefits || []; }
  set benefits(v) { this._benefits = Array.isArray(v) ? v.slice() : []; if (this._root) this._render(); }

  connectedCallback() {
    if (!this._root) {
      this._descriptionSlot = [...this.querySelectorAll('[slot="description"]')];
      this._titleId = `ds-empty-state-${++_esUid}-title`;
      this._root = document.createElement('div');
      this.innerHTML = '';
      this.appendChild(this._root);
    }
    this._render();
  }

  attributeChangedCallback() { if (this._root) this._render(); }

  /* ---- shared region builders --------------------------------------- */
  _headerHTML(title, description) {
    const titleHTML = title
      ? `<h2 class="ds-empty-state__title" id="${this._titleId}">${esc(title)}</h2>` : '';
    const descHTML = (this._descriptionSlot && this._descriptionSlot.length)
      ? `<p class="ds-empty-state__description" data-slot></p>`
      : (description ? `<p class="ds-empty-state__description">${description}</p>` : '');
    return `<div class="ds-empty-state__header">${titleHTML}${descHTML}</div>`;
  }

  _actionsHTML({ primaryOnly = false } = {}) {
    const primaryLabel = this.getAttribute('primary-label') || '';
    const secondaryLabel = this.getAttribute('secondary-label') || '';
    const showPrimary = primaryLabel && boolAttrDefault(this, 'show-primary', true);
    const showSecondary = !primaryOnly && secondaryLabel && boolAttrDefault(this, 'show-secondary', true);
    if (!showPrimary && !showSecondary) return '';
    return `<div class="ds-empty-state__actions">
      ${showSecondary ? `<ds-button variant="secondary" size="medium" data-secondary>${esc(secondaryLabel)}</ds-button>` : ''}
      ${showPrimary ? `<ds-button variant="primary" size="medium" data-primary>${esc(primaryLabel)}</ds-button>` : ''}
    </div>`;
  }

  _footerHTML() {
    if (!boolAttrDefault(this, 'show-footer', true)) return '';
    const supportedLabel = this.getAttribute('supported-label') || 'Supported';
    const supported = (this.getAttribute('supported') || '').split(',').map((s) => s.trim()).filter(Boolean);
    const showSupported = supported.length > 0 && boolAttrDefault(this, 'show-supported', true);
    const ul = this.getAttribute('useful-link');
    const wv = this.getAttribute('watch-video');
    const ulLabel = this.getAttribute('useful-link-label') || 'Useful link';
    const wvLabel = this.getAttribute('watch-video-label') || 'Watch Video';

    const supportedHTML = showSupported
      ? `<span class="ds-empty-state__supported">
           <span class="ds-empty-state__supported-label">${esc(supportedLabel)}</span>
           <span class="ds-empty-state__supported-icons" role="list">
             ${supported.map((id) => `<ds-icon name="${OS_ICON[id] || id}" size="16" role="listitem" aria-label="${esc(id)}"></ds-icon>`).join('')}
           </span>
         </span>` : '';
    const links = [];
    if (ul != null) links.push(`<ds-text-link class="ds-empty-state__link" href="${esc(ul || '#')}" leading-icon="link" size="small">${esc(ulLabel)}</ds-text-link>`);
    if (wv != null) links.push(`<ds-text-link class="ds-empty-state__link" href="${esc(wv || '#')}" leading-icon="video" size="small">${esc(wvLabel)}</ds-text-link>`);
    const linksHTML = links.length
      ? `<span class="ds-empty-state__links">${links.join('<span class="ds-empty-state__sep" aria-hidden="true">/</span>')}</span>` : '';
    if (!supportedHTML && !linksHTML) return '';
    const divider = (supportedHTML && linksHTML) ? `<span class="ds-empty-state__footer-sep" aria-hidden="true"></span>` : '';
    return `<div class="ds-empty-state__footer">${supportedHTML}${divider}${linksHTML}</div>`;
  }

  _mediaHTML(size) {
    const illustration = this.getAttribute('illustration') || '';
    if (!illustration || !boolAttrDefault(this, 'show-illustration', true)) return '';
    const iSize = size === 'sm' ? 'small' : size === 'lg' ? 'large' : 'medium';
    return `<div class="ds-empty-state__illustration"><ds-illustration name="${esc(illustration)}" size="${iSize}"></ds-illustration></div>`;
  }

  /* ---- type templates ----------------------------------------------- */
  _stepsHTML() {
    const items = this.steps.length ? this.steps
      : [{ badge: 'Step 1', label: 'Step one' }, { badge: 'Step 2', label: 'Step two' }, { badge: 'Step 3', label: 'Step three' }];
    return `<div class="ds-empty-state__steps" role="list">
      ${items.map((s) => `<div class="ds-empty-state__step" role="listitem">
        ${s.icon ? `<span class="ds-empty-state__step-icon"><ds-icon name="${esc(s.icon)}" size="32"></ds-icon></span>` : '<span class="ds-empty-state__step-icon"></span>'}
        ${s.badge ? `<ds-badge variant="subtle" state="active" size="small">${esc(s.badge)}</ds-badge>` : ''}
        <span class="ds-empty-state__step-label">${esc(s.label || '')}</span>
      </div>`).join('')}
    </div>`;
  }

  _bannerHTML() {
    const text = this.getAttribute('banner-text');
    if (text == null || !boolAttrDefault(this, 'show-banner', true)) return '';
    const actionLabel = this.getAttribute('banner-action-label') || '';
    return `<div class="ds-empty-state__banner" role="status">
      <ds-icon class="ds-empty-state__banner-icon" name="info-circle" size="20"></ds-icon>
      <span class="ds-empty-state__banner-text">${esc(text)}</span>
      ${actionLabel ? `<ds-button variant="primary" size="small" data-banner-action>${esc(actionLabel)}</ds-button>` : ''}
    </div>`;
  }

  _optionsHTML() {
    const items = this.options;
    if (!items.length) return '';
    return `<div class="ds-empty-state__options">
      ${items.map((o, i) => `<div class="ds-empty-state__option">
        ${o.icon ? `<div class="ds-empty-state__option-icon"><ds-illustration name="${esc(o.icon)}" size="small"></ds-illustration></div>` : ''}
        <h3 class="ds-empty-state__option-title">${esc(o.title || '')}</h3>
        ${o.description ? `<p class="ds-empty-state__option-desc">${o.description}</p>` : ''}
        ${o.actionLabel ? `<ds-button variant="outline" size="medium" data-option="${i}"${o.actionIcon ? ` prefix-icon="${esc(o.actionIcon)}"` : ''}>${esc(o.actionLabel)}</ds-button>` : ''}
      </div>`).join('')}
    </div>`;
  }

  _benefitsHTML() {
    if (!boolAttrDefault(this, 'show-feature-benefits', true)) return '';
    const items = this.benefits;
    if (!items.length) return '';
    const label = this.getAttribute('benefits-label') || 'Feature Benefits';
    return `<div class="ds-empty-state__benefits">
      <p class="ds-empty-state__benefits-label">${esc(label)}</p>
      <ds-list class="ds-empty-state__benefit-list" style-variant="icon" size="medium">
        ${items.map((b) => `<ds-list-item icon="circle-tick">${esc(b)}</ds-list-item>`).join('')}
      </ds-list>
    </div>`;
  }

  _render() {
    const type = enumAttr(this, 'type', TYPES, 'centered');
    const size = enumAttr(this, 'size', SIZES, 'md');
    const rtl = boolAttr(this, 'rtl');
    const title = this.getAttribute('title') || '';
    const description = this.getAttribute('description') || '';

    this._root.className = `ds-empty-state ds-empty-state--${type} ds-empty-state--${size}`;
    this._root.setAttribute('role', 'region');
    if (title) this._root.setAttribute('aria-labelledby', this._titleId);
    else this._root.removeAttribute('aria-labelledby');
    if (rtl) this._root.setAttribute('dir', 'rtl'); else this._root.removeAttribute('dir');

    let html = '';
    if (type === 'steps') {
      html = this._headerHTML(title, description) + this._stepsHTML() + this._actionsHTML({ primaryOnly: true }) + this._footerHTML();
    } else if (type === 'option-cards') {
      html = this._headerHTML(title, description) + this._bannerHTML() + this._optionsHTML();
    } else if (type === 'promo') {
      const media = boolAttrDefault(this, 'show-media', true) && this.getAttribute('media')
        ? `<div class="ds-empty-state__media"><ds-illustration name="${esc(this.getAttribute('media'))}" size="small"></ds-illustration></div>` : '';
      const left = `<div class="ds-empty-state__col">${media}${this._headerHTML(title, description)}${this._actionsHTML({ primaryOnly: true })}${this._footerHTML()}</div>`;
      const benefits = this._benefitsHTML();
      const divider = benefits ? `<span class="ds-empty-state__divider" aria-hidden="true"></span>` : '';
      html = left + divider + benefits;
    } else { /* centered */
      html = this._mediaHTML(size) + this._headerHTML(title, description) + this._actionsHTML() + this._footerHTML();
    }
    this._root.innerHTML = html;

    // Re-insert slotted description nodes
    const slotTarget = this._root.querySelector('[data-slot]');
    if (slotTarget) this._descriptionSlot.forEach((node) => slotTarget.appendChild(node));

    // Wire events
    const emit = (name, detail) => this.dispatchEvent(new CustomEvent(name, { bubbles: true, composed: true, detail }));
    this._root.querySelector('[data-primary]')?.addEventListener('click', () => emit('ds-empty-state-primary'));
    this._root.querySelector('[data-secondary]')?.addEventListener('click', () => emit('ds-empty-state-secondary'));
    this._root.querySelector('[data-banner-action]')?.addEventListener('click', () => emit('ds-empty-state-banner'));
    this._root.querySelectorAll('[data-option]').forEach((btn) =>
      btn.addEventListener('click', () => emit('ds-empty-state-option', { index: Number(btn.getAttribute('data-option')) })));
  }
}

if (typeof customElements !== 'undefined' && !customElements.get('ds-empty-state')) {
  customElements.define('ds-empty-state', DsEmptyState);
}
