import { boolAttr } from '../../utils/attr.js';
/* Composed sub-components — import so the box is self-contained. */
import '../tab-bar-horizontal/tab-bar-horizontal.js';
import '../scrollbar/scrollbar.js';
import '../badge/badge.js';
/* Rows are <ds-inline-alert> (the Message Banner) — register it too. */
import '../inline-alert/inline-alert.js';

let _uid = 0;

/**
 * <ds-message-box> — in-app notification panel.
 * Spec: design-system/handoff/MessageBox.md (Figma 18844:338665)
 *
 * Collapsible card grouping messages under two tabs (Alerts / Information),
 * listed as <ds-inline-alert> rows in a custom-scrollbar region. Title is fixed
 * ("Notifications"). Compose, don't rebuild: it wires ds-tab-bar-horizontal,
 * ds-scrollbar and ds-inline-alert; the panel chrome + tab/list switching is its own.
 *
 *   <ds-message-box tab="alerts" alerts-count="12" information-count="3">
 *     <ds-inline-alert slot="alerts" type="warning" style-variant="subtle" …></ds-inline-alert>
 *     <ds-inline-alert slot="information" type="info" style-variant="subtle" …></ds-inline-alert>
 *   </ds-message-box>
 *
 * Attributes: tab (alerts|information, default alerts), expanded ("false" to
 * collapse; default expanded), show-badge, alerts-count, information-count, rtl.
 */
export class DsMessageBox extends HTMLElement {
  static get observedAttributes() {
    return ['tab', 'expanded', 'show-badge', 'alerts-count', 'information-count', 'rtl'];
  }

  connectedCallback() {
    if (!this._built) {
      this._uid = ++_uid;
      /* Adopt + group the slotted rows by their `slot` (default → alerts). */
      this._groups = { alerts: [], information: [] };
      [...this.children].forEach(el => {
        const g = el.getAttribute('slot') === 'information' ? 'information' : 'alerts';
        this._groups[g].push(el);
      });
      this.innerHTML = '';
      this._root = document.createElement('div');
      this.appendChild(this._root);
      this._built = true;
    }
    this._render();
  }

  attributeChangedCallback(name) {
    if (!this._built) return;
    /* Expand/collapse is animated in place — a full re-render would reset the
       grid-template-rows track to its target value and skip the transition. */
    if (name === 'expanded') { this._applyExpanded(); return; }
    this._render();
  }

  get _expanded() { return this.getAttribute('expanded') !== 'false'; }
  get _tab() { return this.getAttribute('tab') === 'information' ? 'information' : 'alerts'; }
  _count(group) {
    const attr = this.getAttribute(group === 'information' ? 'information-count' : 'alerts-count');
    if (attr != null && attr !== '') return attr;
    return String(this._groups[group].length);
  }

  _render() {
    const expanded = this._expanded;
    const tab = this._tab;
    const rtl = boolAttr(this, 'rtl');
    const showBadge = boolAttr(this, 'show-badge');
    const bodyId = `ds-mb-body-${this._uid}`;
    const total = this._groups.alerts.length + this._groups.information.length;

    let cls = 'ds-message-box';
    if (expanded) cls += ' is-expanded';
    this._root.className = cls;
    if (rtl) this._root.setAttribute('dir', 'rtl'); else this._root.removeAttribute('dir');

    this._root.innerHTML = `
      <div class="ds-message-box__header" part="header">
        <button type="button" class="ds-message-box__toggle" aria-expanded="${expanded}" aria-controls="${bodyId}">
          <span class="ds-message-box__chevron" aria-hidden="true">
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M6 9l6 6 6-6"/></svg>
          </span>
          <span class="ds-message-box__title">Notifications</span>
          ${showBadge ? `<ds-badge class="ds-message-box__count" type="neutral">${total}</ds-badge>` : ''}
        </button>
        <ds-tab-bar-horizontal class="ds-message-box__tabs" type="fill"${rtl ? ' rtl' : ''}></ds-tab-bar-horizontal>
      </div>
      <div class="ds-message-box__body" id="${bodyId}" role="tabpanel"${expanded ? '' : ' aria-hidden="true"'}>
        <div class="ds-message-box__body-inner">
          <ds-scrollbar class="ds-message-box__scroll"${rtl ? ' rtl' : ''}>
            <div class="ds-message-box__list"></div>
          </ds-scrollbar>
        </div>
      </div>
    `;

    /* Tab switcher — Alerts | Information with live counts. Collapsed = no active tab. */
    const tabs = this._root.querySelector('.ds-message-box__tabs');
    tabs.items = [
      { id: 'alerts', label: rtl ? 'التنبيهات' : 'Alerts', badge: { text: this._count('alerts'), variant: 'intense', state: 'moderate' } },
      { id: 'information', label: rtl ? 'المعلومات' : 'Information', badge: { text: this._count('information'), variant: 'intense', state: 'active' } },
    ];
    tabs.setAttribute('active-id', expanded ? tab : '');
    /* Collapsed: the tab bar always force-marks the first tab active; strip it so
       NO tab is active (default look + working hover). */
    if (!expanded) this._stripActiveTabs(tabs);
    tabs.addEventListener('ds-tab-change', (e) => {
      this.setAttribute('tab', e.detail.id);
      if (!this._expanded) this.setAttribute('expanded', 'true'); // selecting a tab expands
      this.dispatchEvent(new CustomEvent('tab-change', { detail: { tab: e.detail.id }, bubbles: true }));
    });
    /* When collapsed, the tab bar won't fire ds-tab-change for the tab it already
       treats as active (the first one — active-id falls back to it), so clicking
       e.g. "Alerts" wouldn't expand. Catch the raw click and expand to that tab. */
    tabs.addEventListener('click', (e) => {
      if (this._expanded) return;
      const item = e.target.closest('.ds-tab-bar-horizontal__item');
      if (!item) return;
      if (item.dataset.id) this.setAttribute('tab', item.dataset.id);
      this.setAttribute('expanded', 'true');
      this.dispatchEvent(new CustomEvent('toggle', { detail: { expanded: true }, bubbles: true }));
    });

    /* Expand/collapse */
    this._root.querySelector('.ds-message-box__toggle').addEventListener('click', () => {
      const next = !this._expanded;
      this.setAttribute('expanded', next ? 'true' : 'false');
      this.dispatchEvent(new CustomEvent('toggle', { detail: { expanded: next }, bubbles: true }));
    });

    /* Active group rows always populate the list so the body has content to
       animate to/from — collapse is a visual grid-height transition, not an
       unmount. The grid track (0fr) hides them when collapsed. */
    const list = this._root.querySelector('.ds-message-box__list');
    const rows = this._groups[tab];
    rows.forEach(row => {
      if (rtl) row.setAttribute('rtl', ''); else row.removeAttribute('rtl');
      list.appendChild(row);
    });
    this._capToThreeRows(list, rows.length);
  }

  /* The tab bar always force-marks one item active; strip it so a collapsed box
     shows no active tab (plain default tabs + working hover). Run now + after
     its own render settles. */
  _stripActiveTabs(tabs) {
    const strip = () => tabs.querySelectorAll('.ds-tab-bar-horizontal__item--active').forEach((it) => {
      it.classList.remove('ds-tab-bar-horizontal__item--active');
      it.setAttribute('aria-selected', 'false');
    });
    strip();
    requestAnimationFrame(strip);
  }

  /* Expand/collapse without a full re-render, so the grid-template-rows CSS
     transition plays. Toggles the state class, aria, and tab activeness. */
  _applyExpanded() {
    const expanded = this._expanded;
    this._root.classList.toggle('is-expanded', expanded);

    const body = this._root.querySelector('.ds-message-box__body');
    if (body) { if (expanded) body.removeAttribute('aria-hidden'); else body.setAttribute('aria-hidden', 'true'); }

    const toggle = this._root.querySelector('.ds-message-box__toggle');
    if (toggle) toggle.setAttribute('aria-expanded', String(expanded));

    const tabs = this._root.querySelector('.ds-message-box__tabs');
    if (tabs) {
      tabs.setAttribute('active-id', expanded ? this._tab : '');
      if (!expanded) this._stripActiveTabs(tabs);
    }
  }

  /* Show at most 3 message rows; beyond that, cap the scroll viewport so the
     overlay scrollbar engages. Rows vary in height, so measure the 3rd row. */
  _capToThreeRows(list, count) {
    this._capRO && this._capRO.disconnect();
    const scroll = this._root.querySelector('.ds-message-box__scroll');
    if (!scroll) return;
    if (count <= 3) { scroll.style.removeProperty('--ds-mb-max-height'); return; }
    const apply = () => {
      const items = [...list.children];
      if (items.length <= 3) { scroll.style.removeProperty('--ds-mb-max-height'); return; }
      const maxH = Math.round(items[2].getBoundingClientRect().bottom - list.getBoundingClientRect().top);
      if (maxH > 0) {
        scroll.style.setProperty('--ds-mb-max-height', maxH + 'px');
        const vp = scroll.querySelector('.ds-scrollbar__viewport');
        if (vp) vp.scrollTop = 0;   // start at the first message, not scrolled
      }
    };
    /* Slotted ds-inline-alert rows render asynchronously, so a one-shot measure
       races them. Run now + after a frame + a short backstop, and keep a
       ResizeObserver for later content changes. Setting the viewport's
       max-height doesn't resize the list, so the observer won't loop. */
    requestAnimationFrame(apply);
    setTimeout(apply, 80);
    this._capRO = new ResizeObserver(apply);
    this._capRO.observe(list);
  }

  disconnectedCallback() { this._capRO && this._capRO.disconnect(); }
}

if (typeof customElements !== 'undefined' && !customElements.get('ds-message-box')) {
  customElements.define('ds-message-box', DsMessageBox);
}
