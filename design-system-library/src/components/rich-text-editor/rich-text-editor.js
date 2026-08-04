/* =============================================================================
   <ds-rich-text-editor label="Description" placeholder="Start typing..."
                        helper="Type $ to add variables" toolbar="fixed"
                        state="default" rtl></ds-rich-text-editor>

   - toolbar: fixed | hidden
   - state: default | error | disabled | readonly
   - The contenteditable surface is intentionally minimal. For production you
     should slot in a real editor runtime (ProseMirror, Lexical, TipTap).
     The toolbar buttons use document.execCommand for basic formatting so
     the chrome is functional out-of-the-box for prototyping.

   Property:
     editor.value     — get/set HTML content

   Events:
     - ds-rte-change  detail: { value: html }
   ============================================================================= */

import { boolAttr, enumAttr } from '../../utils/attr.js';
/* Helper/counter row = the shared "Form Field Helper Row" sub-component. */
import '../field-helper/field-helper.js';

/* Auto-load field-helper.css once (both are light-DOM, so the stylesheet must
   be present even on pages that load rich-text-editor.css individually). */
function _injectCss(id, rel) {
  if (typeof document === 'undefined' || document.getElementById(id)) return;
  const l = document.createElement('link');
  l.id = id; l.rel = 'stylesheet'; l.href = new URL(rel, import.meta.url).href;
  document.head.appendChild(l);
}
_injectCss('ds-rte-fh-css', '../field-helper/field-helper.css');

const esc = (s) => String(s)
  .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

const STATES = ['default', 'error', 'disabled', 'readonly'];
const TOOLBARS = ['fixed', 'floating', 'hidden'];

let _uid = 0;

export class DsRichTextEditor extends HTMLElement {
  static get observedAttributes() {
    return ['label', 'placeholder', 'helper', 'toolbar', 'state', 'maxlength', 'show-label', 'show-helper-row', 'rtl'];
  }

  constructor() {
    super();
    this._id = `ds-rte-${++_uid}`;
    /* Bound once so connect/disconnect can add AND remove it — the document-level
       selectionchange listener must not outlive the editor (it fires on every
       caret move page-wide and would pin a detached instance). */
    this._onSelChange = () => this._updateFloating();
    if (Object.prototype.hasOwnProperty.call(this, 'value')) {
      const v = this.value; delete this.value; this._pending = v;
    }
  }

  connectedCallback() {
    if (!this._root) {
      this._initialHTML = this.innerHTML;
      this.innerHTML = '';
      this._root = document.createElement('div');
      this.appendChild(this._root);
    }
    this._render();
    if (this._pending !== undefined) { this.value = this._pending; this._pending = undefined; }
    else if (this._initialHTML) { this.value = this._initialHTML; this._initialHTML = ''; }
    /* (Re)attach the caret listener on every connect; addEventListener with the
       same reference is idempotent, so this can't double-register. */
    document.addEventListener('selectionchange', this._onSelChange);
  }

  disconnectedCallback() {
    document.removeEventListener('selectionchange', this._onSelChange);
    this._hideFloating && this._hideFloating();
  }

  attributeChangedCallback() { if (this._root) this._render(); }

  get value() { return this._body?.innerHTML || ''; }
  set value(v) { if (this._body) { this._body.innerHTML = v ?? ''; this._updateCounter(); } }

  _render() {
    const label = this.getAttribute('label') || 'Label';
    const placeholder = this.getAttribute('placeholder') || 'Start typing...';
    const helper = this.getAttribute('helper') || '';
    const toolbar = enumAttr(this, 'toolbar', TOOLBARS, 'fixed');
    const state = enumAttr(this, 'state', STATES, 'default');
    const showLabel = !this.hasAttribute('show-label') || this.getAttribute('show-label') !== 'false';
    const showHelper = !this.hasAttribute('show-helper-row') || this.getAttribute('show-helper-row') !== 'false';
    const maxLength = parseInt(this.getAttribute('maxlength') || '', 10);
    const hasMax = Number.isFinite(maxLength) && maxLength > 0;
    const rtl = boolAttr(this, 'rtl');
    const isDisabled = state === 'disabled';
    const isReadonly = state === 'readonly';
    const editable = !(isDisabled || isReadonly);

    /* Helper/counter row = shared <ds-field-helper>. It points aria-describedby
       at itself; state drives its colour + leading icon. */
    const helperRowShown = showHelper && (helper || hasMax);
    const helperId = `${this._id}-helper`;
    const helperState = state === 'error' ? 'error' : (isDisabled ? 'disabled' : 'default');

    const cls = `ds-rte ds-rte--${state} ds-rte--toolbar-${toolbar}`;
    const previousValue = this._body?.innerHTML || '';

    /* Spec: Disabled and Read Only render WITHOUT a toolbar. Floating shows a
       compact popover (B/I/U · link · block-style) overlaid on the body when
       the editor is focused. Hidden renders no toolbar. Fixed renders the
       full toolbar pinned to the top of the editor frame. */
    const fullToolbarHTML = `<div class="ds-rte__toolbar" role="toolbar" aria-label="Formatting">
      <select class="ds-rte__select" data-cmd="formatBlock" aria-label="Block style">
        <option value="P">Normal</option>
        <option value="H1">Heading 1</option>
        <option value="H2">Heading 2</option>
        <option value="H3">Heading 3</option>
        <option value="BLOCKQUOTE">Quote</option>
      </select>
      <span class="ds-rte__toolbar-sep"></span>
      <div class="ds-rte__toolbar-group">
        <button type="button" class="ds-rte__btn" data-cmd="bold"      aria-label="Bold"><ds-icon name="bold" size="16"></ds-icon></button>
        <button type="button" class="ds-rte__btn" data-cmd="italic"    aria-label="Italic"><ds-icon name="italic" size="16"></ds-icon></button>
        <button type="button" class="ds-rte__btn" data-cmd="underline" aria-label="Underline"><ds-icon name="text-underline" size="16"></ds-icon></button>
      </div>
      <span class="ds-rte__toolbar-sep ds-rte__opt"></span>
      <div class="ds-rte__toolbar-group ds-rte__opt">
        <button type="button" class="ds-rte__btn" data-cmd="insertUnorderedList" aria-label="Bulleted list"><ds-icon name="list-bullet" size="16"></ds-icon></button>
        <button type="button" class="ds-rte__btn" data-cmd="insertOrderedList"   aria-label="Numbered list"><ds-icon name="list-number" size="16"></ds-icon></button>
      </div>
      <span class="ds-rte__toolbar-sep ds-rte__opt"></span>
      <div class="ds-rte__toolbar-group ds-rte__opt">
        <button type="button" class="ds-rte__btn" data-cmd="justifyLeft"   aria-label="Align left"><ds-icon name="align-left" size="16"></ds-icon></button>
        <button type="button" class="ds-rte__btn" data-cmd="justifyCenter" aria-label="Align center"><ds-icon name="align-center" size="16"></ds-icon></button>
        <button type="button" class="ds-rte__btn" data-cmd="justifyRight"  aria-label="Align right"><ds-icon name="align-right" size="16"></ds-icon></button>
      </div>
      <span class="ds-rte__toolbar-sep ds-rte__opt"></span>
      <div class="ds-rte__toolbar-group ds-rte__opt">
        <button type="button" class="ds-rte__btn" data-cmd="createLink" aria-label="Insert link"><ds-icon name="link" size="16"></ds-icon></button>
        <button type="button" class="ds-rte__btn" data-cmd="image"      aria-label="Insert image"><ds-icon name="image" size="16"></ds-icon></button>
      </div>
      <span class="ds-rte__toolbar-sep" style="margin-left: auto;"></span>
      <button type="button" class="ds-rte__btn ds-rte__btn--more" data-cmd="more" aria-label="More formatting options" aria-expanded="false"><ds-icon name="more-horizontal" size="16"></ds-icon></button>
    </div>`;

    /* Floating toolbar: compact set (B/I/U · link · block-style) per spec, with
       a small arrow pointing down to the selection. Visibility is driven by
       CSS (only shown when the editor frame has focus). */
    const floatingToolbarHTML = `<div class="ds-rte__floating" role="toolbar" aria-label="Formatting">
      <span class="ds-rte__floating-handle" aria-label="Move toolbar" title="Drag to move"><ds-icon name="move-vertical" size="16"></ds-icon></span>
      <span class="ds-rte__toolbar-sep"></span>
      <button type="button" class="ds-rte__btn" data-cmd="bold"      aria-label="Bold"><ds-icon name="bold" size="16"></ds-icon></button>
      <button type="button" class="ds-rte__btn" data-cmd="italic"    aria-label="Italic"><ds-icon name="italic" size="16"></ds-icon></button>
      <button type="button" class="ds-rte__btn" data-cmd="underline" aria-label="Underline"><ds-icon name="text-underline" size="16"></ds-icon></button>
      <span class="ds-rte__toolbar-sep"></span>
      <button type="button" class="ds-rte__btn" data-cmd="createLink" aria-label="Insert link"><ds-icon name="link" size="16"></ds-icon></button>
      <span class="ds-rte__toolbar-sep"></span>
      <select class="ds-rte__select" data-cmd="formatBlock" aria-label="Block style">
        <option value="P">Normal</option>
        <option value="H1">Heading 1</option>
        <option value="H2">Heading 2</option>
        <option value="H3">Heading 3</option>
        <option value="BLOCKQUOTE">Quote</option>
      </select>
    </div>`;

    /* Spec: toolbar removed in Disabled and Read Only. */
    const showToolbarChrome = !(isDisabled || isReadonly) && toolbar !== 'hidden';
    const toolbarHTML = !showToolbarChrome
      ? ''
      : (toolbar === 'floating' ? floatingToolbarHTML : fullToolbarHTML);

    this._root.innerHTML = `
      <div class="${cls}" ${rtl ? 'dir="rtl"' : ''}>
        ${showLabel ? `<label class="ds-rte__label">${label}</label>` : ''}
        <div class="ds-rte__frame">
          ${toolbarHTML}
          <div class="ds-rte__body"
               role="textbox" aria-multiline="true" aria-label="${label}"
               data-placeholder="${placeholder}"
               ${editable ? 'contenteditable="true"' : 'contenteditable="false"'}
               ${isDisabled ? 'aria-disabled="true"' : ''}
               ${isReadonly ? 'aria-readonly="true"' : ''}
               ${state === 'error' ? 'aria-invalid="true"' : ''}
               ${helperRowShown ? `aria-describedby="${helperId}"` : ''}></div>
          ${editable ? `<div class="ds-rte__resize-grip" title="Drag to resize" aria-hidden="true"><svg viewBox="0 0 12 12" fill="currentColor"><path d="M11 11H9v-2h2v2zm0-4H7v-2h2v2h2v2zm-4 4H5v-2h2v2z"/></svg></div>` : ''}
        </div>
        ${helperRowShown ? `<ds-field-helper class="ds-rte__helper-row" id="${helperId}"
          text="${esc(helper)}" state="${helperState}"
          ${helper ? '' : 'show-icon="false"'}
          ${hasMax ? `counter="0/${maxLength}"` : ''}
          ${rtl ? 'rtl' : ''}></ds-field-helper>` : ''}
      </div>
    `;

    this._body = this._root.querySelector('.ds-rte__body');
    if (previousValue) this._body.innerHTML = previousValue;
    this._wire();
  }

  _wire() {
    if (!this._body) return;
    this._helper = this._root.querySelector('.ds-rte__helper-row');
    this._updateCounter();
    this._wireResize();
    this._wireFloating();
    this._body.addEventListener('input', () => {
      this._updateCounter();
      this.dispatchEvent(new CustomEvent('ds-rte-change', { bubbles: true, detail: { value: this.value } }));
    });
    this._root.querySelectorAll('.ds-rte__btn').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        const cmd = btn.dataset.cmd;
        if (cmd === 'more') {
          /* Responsive overflow: toggle the collapsed secondary groups open. */
          const rte = this._root.querySelector('.ds-rte');
          const open = rte.classList.toggle('ds-rte--toolbar-expanded');
          btn.setAttribute('aria-expanded', open ? 'true' : 'false');
          return;
        }
        if (!cmd) return;
        if (cmd === 'createLink') {
          const url = prompt('Enter URL');
          if (url) this._exec('createLink', url);
        } else if (cmd === 'image') {
          const src = prompt('Enter image URL');
          if (src) this._exec('insertImage', src);
        } else {
          this._exec(cmd);
        }
      });
    });
    const select = this._root.querySelector('.ds-rte__select');
    if (select) {
      select.addEventListener('change', (e) => {
        this._exec('formatBlock', `<${e.target.value}>`);
      });
    }
  }

  /* Counter shows used/max. Counts the body's visible text length — variable
     chips count as their literal `$variable$` token text (textContent), per the
     global convention in the spec. */
  _updateCounter() {
    if (!this._helper) return;
    const max = parseInt(this.getAttribute('maxlength') || '', 10);
    if (!Number.isFinite(max) || max <= 0) return;
    const used = (this._body?.textContent || '').length;
    this._helper.setAttribute('counter', `${used}/${max}`);
  }

  /* Drag the bottom-right grip to resize the frame in BOTH directions. The
     frame's parent (.ds-rte) is a stretch flex-column, so we opt the frame out
     of the cross-axis stretch (align-self) to let the dragged width stick. */
  _wireResize() {
    const grip = this._root.querySelector('.ds-rte__resize-grip');
    const frame = this._root.querySelector('.ds-rte__frame');
    if (!grip || !frame) return;
    grip.addEventListener('pointerdown', (e) => {
      e.preventDefault();
      const host = this._root.querySelector('.ds-rte');
      const maxW = Math.max(280, host ? host.clientWidth : 640);
      const startX = e.clientX, startY = e.clientY;
      const startW = frame.offsetWidth, startH = frame.offsetHeight;
      frame.style.alignSelf = 'flex-start';
      try { grip.setPointerCapture(e.pointerId); } catch {}
      const onMove = (ev) => {
        frame.style.width = Math.min(maxW, Math.max(280, startW + (ev.clientX - startX))) + 'px';
        frame.style.height = Math.max(96, startH + (ev.clientY - startY)) + 'px';
      };
      const onUp = () => {
        try { grip.releasePointerCapture(e.pointerId); } catch {}
        grip.removeEventListener('pointermove', onMove);
        grip.removeEventListener('pointerup', onUp);
      };
      grip.addEventListener('pointermove', onMove);
      grip.addEventListener('pointerup', onUp);
    });
  }

  /* Floating toolbar: a bubble that appears ONLY on a text selection, anchored
     just above the selection (flips below if there's no room). It never reserves
     space in the body, so it can't block content. The user can drag it anywhere
     inside the frame. Esc / collapsing the selection hides it. Listeners attach
     once (this._root persists across re-renders). */
  _wireFloating() {
    if (this._floatingWired) return;
    this._floatingWired = true;

    const reposition = () => this._updateFloating();
    /* selectionchange is managed by connect/disconnect (this._onSelChange) so it
       can be removed when the editor leaves the DOM — do NOT add it here. */
    this._body && this._body.addEventListener('keyup', reposition);
    this.addEventListener('keydown', (e) => { if (e.key === 'Escape') this._hideFloating(); });

    /* Drag the leading move handle (⋮⋮) to reposition the bubble. */
    this._root.addEventListener('pointerdown', (e) => {
      const handle = e.target.closest && e.target.closest('.ds-rte__floating-handle');
      if (!handle) return;
      const fl = handle.closest('.ds-rte__floating');
      if (!fl) return;
      e.preventDefault();
      this._floatPinned = true;                 // keep dragged position until next selection
      const frame = this._root.querySelector('.ds-rte__frame');
      const startLeft = fl.offsetLeft, startTop = fl.offsetTop;
      const sx = e.clientX, sy = e.clientY;
      try { fl.setPointerCapture(e.pointerId); } catch {}
      const move = (ev) => {
        let l = startLeft + (ev.clientX - sx), t = startTop + (ev.clientY - sy);
        l = Math.max(4, Math.min(l, frame.clientWidth - fl.offsetWidth - 4));
        t = Math.max(4, Math.min(t, frame.clientHeight - fl.offsetHeight - 4));
        fl.style.left = l + 'px'; fl.style.top = t + 'px';
      };
      const up = () => { fl.removeEventListener('pointermove', move); fl.removeEventListener('pointerup', up); };
      fl.addEventListener('pointermove', move);
      fl.addEventListener('pointerup', up);
    });
  }

  _hideFloating() {
    const fl = this._root && this._root.querySelector('.ds-rte__floating');
    if (fl) fl.classList.remove('ds-rte__floating--visible');
    this._floatPinned = false;
  }

  _updateFloating() {
    const toolbar = enumAttr(this, 'toolbar', TOOLBARS, 'fixed');
    const fl = this._root && this._root.querySelector('.ds-rte__floating');
    if (toolbar !== 'floating' || !fl || !this._body) return;
    const sel = window.getSelection();
    if (!sel || sel.isCollapsed || sel.rangeCount === 0) { this._hideFloating(); return; }
    const range = sel.getRangeAt(0);
    if (!this._body.contains(range.commonAncestorContainer)) { this._hideFloating(); return; }
    const rect = range.getBoundingClientRect();
    if (!rect || (rect.width === 0 && rect.height === 0)) { this._hideFloating(); return; }

    fl.classList.add('ds-rte__floating--visible');
    if (this._floatPinned) return;              // user dragged it — respect their position
    const frame = this._root.querySelector('.ds-rte__frame');
    const fr = frame.getBoundingClientRect();
    const flW = fl.offsetWidth, flH = fl.offsetHeight;
    let left = rect.left - fr.left + rect.width / 2 - flW / 2;
    let top = rect.top - fr.top - flH - 8;       // above the selection
    if (top < 4) top = rect.bottom - fr.top + 8; // not enough room → below
    left = Math.max(4, Math.min(left, frame.clientWidth - flW - 4));
    top = Math.max(4, Math.min(top, frame.clientHeight - flH - 4));
    fl.style.left = left + 'px';
    fl.style.top = top + 'px';
  }

  _exec(command, value = null) {
    if (!this._body) return;
    this._body.focus();
    try { document.execCommand(command, false, value); } catch {}
    this.dispatchEvent(new CustomEvent('ds-rte-change', { bubbles: true, detail: { value: this.value } }));
  }
}

if (typeof customElements !== 'undefined' && !customElements.get('ds-rich-text-editor')) {
  customElements.define('ds-rich-text-editor', DsRichTextEditor);
}
