/* =============================================================================
   ds-widget — Dashboard tile / panel container (UEMS Design System 3.0).
   Spec: design-system/handoff/widget.md  (Figma node 20766:5044).

   The dashboard "widget frame": a self-contained surface (owns background,
   border, radius) wrapping a fixed chrome — Header (drag handle, title, info,
   trend badge, filter, action) + optional Footer (summary + view-all link) —
   around a SWAPPABLE body. `type` selects what the body holds:
     chart | list | table   → host slotted content (default slot)
     error | empty | no-data → the widget renders a built-in placeholder
                               (delegates to <ds-empty-state>); footer hidden.

   Same surface contract as ds-card / ds-kpi-card — the opposite of the bare
   ds-chart. A widget CONTAINS a chart; it is never itself a chart.

   Dashboard-edit affordances (the drag handle in the header + the accent ring
   and 4 resize handles) only appear when `edit-mode` is set, and then only on
   hover — or persistently while `selected`. In view mode the widget shows no
   drag/resize chrome. `selected` has no click semantics on the frame itself.

   API:
     <ds-widget
       type="chart|list|table|error|empty|no-data"   <!-- default chart -->
       title="Drivers By Class"
       show-drag show-info info-icon="info-circle"
       trend="12%" trend-status="critical" trend-icon="up-trend"
       filter-label="Last 7 days"
       show-action action-icon="settings"
       show-footer footer-summary="+41 more Drivers"
       footer-label="View all" footer-href="#"
       edit-mode selected dir="rtl">
       <!-- default slot = body content for chart/list/table -->
       <ds-chart type="column" mode="single"></ds-chart>
       <ds-icon-button slot="header-action" ...></ds-icon-button>  <!-- optional override -->
       <ds-button slot="filter" ...></ds-button>                   <!-- optional override -->
     </ds-widget>

   Events: ds-widget-action        — header action button
           ds-widget-view-all {href}— footer link
           ds-widget-retry         — state-body primary action (error/empty/no-data)
   ============================================================================= */

import { boolAttr, enumAttr } from '../../utils/attr.js';
import { watchLateChildren, stopLateChildren } from '../../utils/late-children.js';
import '../../icons/icon.js';
/* Every interactive part reuses its existing component — never custom markup. */
import '../icon-button/icon-button.js';
import '../text-link/text-link.js';
import '../badge/badge.js';
import '../button/button.js';
import '../empty-state/empty-state.js';
import '../illustration/illustration.js'; /* ds-empty-state renders <ds-illustration> but doesn't import it */
import '../chart/chart.js';
import '../data-table/data-table.js'; /* table-type body */

function _injectCss(id, rel) {
  if (typeof document === 'undefined' || document.getElementById(id)) return;
  const l = document.createElement('link');
  l.id = id; l.rel = 'stylesheet'; l.href = new URL(rel, import.meta.url).href;
  document.head.appendChild(l);
}
_injectCss('ds-widget-icon-button-css', '../icon-button/icon-button.css');
_injectCss('ds-widget-text-link-css', '../text-link/text-link.css');
_injectCss('ds-widget-badge-css', '../badge/badge.css');
_injectCss('ds-widget-button-css', '../button/button.css');
_injectCss('ds-widget-empty-state-css', '../empty-state/empty-state.css');
_injectCss('ds-widget-illustration-css', '../illustration/illustration.css');
_injectCss('ds-widget-chart-css', '../chart/chart.css?v=3');
_injectCss('ds-widget-data-table-css', '../data-table/data-table.css');

/* ds-illustration needs a sprite path. Default it (relative to this module) so
   the widget's state illustrations work on any page — a page that already set
   window.UEMS_ILLUSTRATION_SPRITE keeps its own value. */
if (typeof window !== 'undefined' && !window.UEMS_ILLUSTRATION_SPRITE) {
  window.UEMS_ILLUSTRATION_SPRITE = new URL('../../icons/illustrations.svg', import.meta.url).href;
}

const TYPES = ['chart', 'list', 'table', 'error', 'empty', 'no-data'];
const STATE_TYPES = ['error', 'empty', 'no-data'];
/* trend-status → ds-badge state */
const TREND_STATE = { success: 'success', warning: 'moderate', critical: 'critical', info: 'active' };
/* Built-in placeholder content per state type (overridable via attributes). */
/* Illustrations are the dedicated widget-state illustrations exported from the
   Figma `_Widget State Body` set (illu-state-*). Override any via attributes. */
const STATE_PRESET = {
  error:     { illustration: 'state-error',   title: "Couldn't load data", desc: 'Something went wrong while loading.', action: 'Retry' },
  empty:     { illustration: 'state-empty',   title: 'No results',         desc: 'No items match your filters.',       action: 'Reset filter' },
  'no-data': { illustration: 'empty-bar-chart', title: 'No data yet',       desc: 'Data will appear here once available.', action: '' },
};

export class DsWidget extends HTMLElement {
  static get observedAttributes() {
    return [
      'type', 'title', 'show-drag', 'show-info', 'info-icon',
      'trend', 'trend-status', 'trend-icon',
      'filter-label', 'show-action', 'action-icon',
      'show-footer', 'footer-summary', 'footer-label', 'footer-href',
      'state-title', 'state-description', 'retry-label', 'state-illustration',
      'edit-mode', 'selected', 'state', 'dir', 'rtl',
    ];
  }

  connectedCallback() {
    /* Capture consumer children before the first render. Exclude our OWN generated
       wrappers so a re-capture (see the observer below) never swallows them. */
    if (!this._slotsCaptured) {
      this._slottedHeaderAction = this.querySelector(':scope > [slot="header-action"]') || null;
      this._slottedFilter = this.querySelector(':scope > [slot="filter"]') || null;
      this._slottedContent = [...this.children].filter((c) => !c.hasAttribute('slot') && !this._isOwnNode(c));
      this._slotsCaptured = true;
    }
    this._mounted = true;
    this._render();
    /* Frameworks (Ember/React/Vue) insert children AFTER upgrade, so the capture
       above can miss them. Re-capture + re-render when late content appears. */
    watchLateChildren(this, () => { this._slotsCaptured = false; this.connectedCallback(); });
  }

  disconnectedCallback() {
    stopLateChildren(this);
  }

  /* Our own generated wrappers all carry a `ds-widget__` class; a consumer's
     slotted content never does — so this tells the re-capture what to ignore. */
  _isOwnNode(node) {
    return !!(node.classList && Array.from(node.classList).some((k) => k.startsWith('ds-widget__')));
  }

  attributeChangedCallback(name, oldVal, newVal) {
    /* `title` collides with the native tooltip attribute — cache then strip. */
    if (name === 'title' && newVal != null) {
      this._titleText = newVal;
      this.removeAttribute('title');
      return;
    }
    if (this._mounted) this._render();
  }

  _render() {
    const type = enumAttr(this, 'type', TYPES, 'chart');
    const isState = STATE_TYPES.includes(type);
    const title = this._titleText || '';
    const showDrag = this.getAttribute('show-drag') !== 'false';
    const showInfo = boolAttr(this, 'show-info');
    const infoIcon = this.getAttribute('info-icon') || 'info-circle';
    const trend = this.getAttribute('trend') || '';
    const trendStatus = enumAttr(this, 'trend-status', Object.keys(TREND_STATE), 'info');
    const trendIcon = this.getAttribute('trend-icon') || 'up-trend';
    const filterLabel = this.getAttribute('filter-label') || '';
    const showAction = this.getAttribute('show-action') !== 'false';
    const actionIcon = this.getAttribute('action-icon') || 'settings';
    const showFooter = this.getAttribute('show-footer') !== 'false' && !isState;
    const footerSummary = this.getAttribute('footer-summary') || '';
    const footerLabel = this.getAttribute('footer-label') || 'View all';
    const footerHref = this.getAttribute('footer-href') || '#';
    const selected = boolAttr(this, 'selected') || this.getAttribute('state') === 'selected';
    const editMode = boolAttr(this, 'edit-mode');
    const rtl = boolAttr(this, 'rtl') || this.getAttribute('dir') === 'rtl';

    [...this.classList].forEach((c) => { if (c.startsWith('ds-widget')) this.classList.remove(c); });
    this.classList.add('ds-widget', `ds-widget--${type}`);
    if (editMode) this.classList.add('ds-widget--edit');
    if (selected) this.classList.add('ds-widget--selected');
    if (rtl) this.setAttribute('dir', 'rtl');

    if (!this.hasAttribute('role')) this.setAttribute('role', 'group');
    if (title && !this.hasAttribute('aria-label')) this.setAttribute('aria-label', title);
    if (selected) this.setAttribute('aria-selected', 'true'); else this.removeAttribute('aria-selected');

    /* ---- Header ---- */
    const header = `
      <div class="ds-widget__header">
        <div class="ds-widget__title-area">
          ${showDrag ? '<ds-icon-button class="ds-widget__drag" type="tertiary-grey" size="small" icon="move-vertical" label="Drag to reorder" no-tooltip></ds-icon-button>' : ''}
          ${title ? `<h3 class="ds-widget__title">${title}</h3>` : ''}
          ${showInfo ? `<ds-icon class="ds-widget__info" name="${infoIcon}" size="18"></ds-icon>` : ''}
        </div>
        <div class="ds-widget__trailing">
          ${trend ? `<ds-badge variant="subtle" state="${TREND_STATE[trendStatus]}" size="medium" shape="pill" icon="${trendIcon}" label="${trend}"></ds-badge>` : ''}
          ${(filterLabel || this._slottedFilter) ? '<span class="ds-widget__filter" data-slot="filter"></span>' : ''}
          ${showAction ? '<span class="ds-widget__action" data-slot="header-action"></span>' : ''}
        </div>
      </div>`;

    /* ---- Body ---- */
    let body;
    if (isState) {
      const p = STATE_PRESET[type];
      const st = this.getAttribute('state-title') || p.title;
      const sd = this.getAttribute('state-description') || p.desc;
      const retry = this.getAttribute('retry-label') || p.action;
      const illo = this.getAttribute('state-illustration') || p.illustration;
      body = `
        <div class="ds-widget__body ds-widget__body--state">
          <ds-empty-state size="sm" illustration="${illo}" title="${st}" description="${sd}"
            ${retry ? `primary-label="${retry}"` : ''}></ds-empty-state>
        </div>`;
    } else {
      body = '<div class="ds-widget__body" data-slot="content"></div>';
    }

    /* ---- Footer ---- */
    const footer = showFooter ? `
      <div class="ds-widget__footer">
        <span class="ds-widget__summary">${footerSummary}</span>
        <ds-text-link class="ds-widget__view-all" variant="primary" size="small" href="${footerHref}" trailing-icon="chevron-right" data-view-all>${footerLabel}</ds-text-link>
      </div>` : '';

    /* ---- Selection ring + resize handles (visual only) ---- */
    const overlay = `
      <div class="ds-widget__selected-ring" aria-hidden="true"></div>
      <div class="ds-widget__handles" aria-hidden="true">
        <span class="ds-widget__handle ds-widget__handle--tl"></span>
        <span class="ds-widget__handle ds-widget__handle--tr"></span>
        <span class="ds-widget__handle ds-widget__handle--bl"></span>
        <span class="ds-widget__handle ds-widget__handle--br"></span>
      </div>`;

    /* Chrome lives in a clipped surface (rounded corners); the ring + handles
       sit OUTSIDE it on the host, which stays overflow:visible. */
    this.innerHTML = `<div class="ds-widget__surface">${header}${body}${footer}</div>${overlay}`;

    /* Re-insert (move, not clone) captured consumer nodes. */
    if (filterLabel || this._slottedFilter) {
      const slot = this.querySelector('[data-slot="filter"]');
      if (this._slottedFilter) slot.appendChild(this._slottedFilter);
      else {
        /* Build the node and set the label via the attribute (not raw innerHTML),
           so a filter label with `<`/`&` renders literally. */
        const fb = document.createElement('ds-button');
        fb.setAttribute('variant', 'outline');
        fb.setAttribute('size', 'xsmall');
        fb.setAttribute('suffix-icon', 'chevron-down');
        fb.setAttribute('label', filterLabel);
        slot.appendChild(fb);
      }
    }
    if (showAction) {
      const slot = this.querySelector('[data-slot="header-action"]');
      if (this._slottedHeaderAction) slot.appendChild(this._slottedHeaderAction);
      else slot.innerHTML = `<ds-icon-button type="tertiary-grey" size="xl" icon="${actionIcon}" label="Widget settings" no-tooltip data-header-action></ds-icon-button>`;
    }
    if (!isState) {
      const contentSlot = this.querySelector('[data-slot="content"]');
      if (contentSlot) {
        if (this._slottedContent.length) {
          this._slottedContent.forEach((n) => contentSlot.appendChild(n));
        } else if (type === 'chart') {
          /* Sensible default so a bare <ds-widget type="chart"> renders. */
          contentSlot.innerHTML = '<ds-chart type="column" mode="single"></ds-chart>';
        }
      }
      /* A table widget uses <ds-data-table> for the grid ONLY — the widget's own
         header + footer replace the table's toolbar + footer, so force them off. */
      if (type === 'table') {
        this.querySelectorAll('[data-slot="content"] ds-data-table').forEach((dt) => {
          dt.setAttribute('show-toolbar', 'false');
          dt.setAttribute('show-footer', 'false');
        });
      }
    }

    /* ---- Events ---- */
    this.querySelector('[data-header-action]')?.addEventListener('click', () => {
      this.dispatchEvent(new CustomEvent('ds-widget-action', { bubbles: true }));
    });
    this.querySelector('[data-view-all]')?.addEventListener('click', () => {
      this.dispatchEvent(new CustomEvent('ds-widget-view-all', { bubbles: true, detail: { href: footerHref } }));
    });
    if (isState) {
      /* ds-empty-state hardcodes its primary action as primary/medium, but the
         Figma _Widget State Body uses an Outline / Xsmall button — restyle it. */
      const sBtn = this.querySelector('.ds-widget__body--state ds-button[data-primary]');
      if (sBtn) {
        sBtn.setAttribute('variant', 'outline');
        sBtn.setAttribute('size', 'xsmall');
      }
      /* Catch the action click and surface it as a widget-level event. */
      (sBtn || this.querySelector('.ds-widget__body--state button'))?.addEventListener('click', () => {
        this.dispatchEvent(new CustomEvent('ds-widget-retry', { bubbles: true }));
      });
    }
  }
}

if (typeof customElements !== 'undefined' && !customElements.get('ds-widget')) {
  customElements.define('ds-widget', DsWidget);
}
