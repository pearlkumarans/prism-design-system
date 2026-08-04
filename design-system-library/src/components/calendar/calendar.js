/* =============================================================================
   <ds-calendar type="single" value="2026-04-26" show-footer></ds-calendar>
   <ds-calendar type="range"  value="2026-04-26/2026-05-03" show-footer></ds-calendar>

   - Single panel for `type="single"`, two side-by-side panels for `type="range"`.
   - Selecting a day fires `ds-calendar-change` with detail { value, start, end }.
   - Footer (when `show-footer` is set) emits `ds-calendar-cancel` / `ds-calendar-apply`.
   - Keyboard: arrows / Page-Up / Page-Down / Home / End / Enter / Escape.
   ============================================================================= */

import { boolAttr, enumAttr } from '../../utils/attr.js';
/* Prev/Next nav = the shared Icon Button component (Square / Tertiary); the
   month/year title that climbs Day→Month→Year = the Link (ds-text-link)
   component — neither is a raw <button>, per the spec + DS rules. */
import '../icon-button/icon-button.js';
import '../text-link/text-link.js';

/* Auto-load sub-component CSS once (light-DOM, so it must be present even on
   pages that load calendar.css individually). */
function _injectCss(id, rel) {
  if (typeof document === 'undefined' || document.getElementById(id)) return;
  const l = document.createElement('link');
  l.id = id; l.rel = 'stylesheet'; l.href = new URL(rel, import.meta.url).href;
  document.head.appendChild(l);
}
_injectCss('ds-calendar-icon-button-css', '../icon-button/icon-button.css');
_injectCss('ds-calendar-text-link-css', '../text-link/text-link.css');

const TYPES = ['single', 'range'];
const WEEKDAYS_LTR = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const WEEKDAYS_RTL = ['الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];
const MONTHS_LTR = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];
const MONTHS_RTL = [
  'يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو',
  'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر',
];
/* Legacy aliases (kept so any external code still works). */
const WEEKDAYS = WEEKDAYS_LTR;
const MONTHS   = MONTHS_LTR;

const toISO = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
const fromISO = (s) => {
  if (!s) return null;
  const [y, m, d] = s.split('-').map(Number);
  if (!y || !m || !d) return null;
  return new Date(y, m - 1, d);
};
const sameDay = (a, b) => a && b && a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
const cmp = (a, b) => (a.getTime() - b.getTime());

export class DsCalendar extends HTMLElement {
  static get observedAttributes() {
    return ['type', 'value', 'show-footer', 'rtl', 'min', 'max'];
  }

  constructor() {
    super();
    this._cursor = new Date();        // first visible month
    this._range = { start: null, end: null };
    this._selected = null;
    this._focusISO = null;            // currently focused day cell
    this._views = ['day', 'day'];     // per-panel zoom: 'day' | 'month' | 'year' (idx 0 = single)
  }

  connectedCallback() {
    if (!this._mounted) {
      this._readValue();
      this._initFocus();
      this._render();
      this._mounted = true;
    }
  }

  attributeChangedCallback(name) {
    if (!this._mounted) return;
    if (name === 'value') this._readValue();
    if (name === 'value' || name === 'type') this._initFocus();
    this._render();
  }

  _readValue() {
    const v = this.getAttribute('value') || '';
    if (this._type() === 'range') {
      const [a, b] = v.split('/');
      this._range = { start: fromISO(a), end: fromISO(b) };
    } else {
      this._selected = fromISO(v);
    }
  }

  _type() {
    return enumAttr(this, 'type', TYPES, 'single');
  }

  _initFocus() {
    const ref = this._selected || this._range.start || new Date();
    this._cursor = new Date(ref.getFullYear(), ref.getMonth(), 1);
    this._focusISO = toISO(ref);
    this._views = ['day', 'day'];   // a fresh value/type returns both panels to the day grid
  }

  _render() {
    const isRange = this._type() === 'range';
    const showFooter = boolAttr(this, 'show-footer');
    const rtl = boolAttr(this, 'rtl');

    this.classList.add('ds-calendar');
    this.classList.toggle('ds-calendar--range', isRange);
    this.classList.toggle('ds-calendar--single', !isRange);
    if (rtl) this.setAttribute('dir', 'rtl');
    else this.removeAttribute('dir');
    this.setAttribute('role', 'dialog');
    this.setAttribute('aria-label', isRange ? 'Date range picker' : 'Date picker');

    // Range = two linked panels of consecutive months; the layout always keeps
    // both panels so it never shrinks. Each panel owns its OWN zoom level
    // (this._views[idx]), so climbing month/year affects only the clicked panel
    // — the other stays in the day grid. Single mode is one panel.
    const c = this._cursor;
    const months = isRange
      ? [new Date(c), new Date(c.getFullYear(), c.getMonth() + 1, 1)]
      : [new Date(c)];

    this.innerHTML = '';
    const panels = document.createElement('div');
    panels.className = 'ds-calendar__panels';
    months.forEach((m, idx) => panels.appendChild(this._renderPanel(m, idx, months.length)));
    this.appendChild(panels);

    if (showFooter) {
      const footer = document.createElement('div');
      footer.className = 'ds-calendar__footer';
      footer.innerHTML = `
        <ds-button variant="outline" size="small" data-cal-action="cancel">Cancel</ds-button>
        <ds-button variant="primary" size="small" data-cal-action="apply">Apply</ds-button>
      `;
      this.appendChild(footer);
      footer.addEventListener('click', (e) => {
        const action = e.target.closest('[data-cal-action]')?.dataset.calAction;
        if (action === 'cancel') this.dispatchEvent(new CustomEvent('ds-calendar-cancel', { bubbles: true }));
        if (action === 'apply') this.dispatchEvent(new CustomEvent('ds-calendar-apply', { bubbles: true, detail: this._detail() }));
      });
    }

    // Bind keyboard once
    if (!this._kbBound) {
      this.addEventListener('keydown', (e) => this._onKeydown(e));
      this._kbBound = true;
    }
  }

  /* Aligned 12-year page (base 2020 so 2026 → 2020–2031). */
  _yearPageStart(year) {
    const yMod = ((year - 2020) % 12 + 12) % 12;
    return year - yMod;
  }

  _renderPanel(monthDate, idx, total) {
    /* Pick locale arrays based on rtl attribute so month names + weekday
       headers switch to Arabic in RTL mode. */
    const isRtl = boolAttr(this, 'rtl');
    const MONTHS = isRtl ? MONTHS_RTL : MONTHS_LTR;
    const WEEKDAYS = isRtl ? WEEKDAYS_RTL : WEEKDAYS_LTR;
    const view = this._views[idx] || 'day';

    const panel = document.createElement('div');
    panel.className = 'ds-calendar__panel';

    // Header
    const header = document.createElement('div');
    header.className = 'ds-calendar__header';
    const showPrev = idx === 0;
    const showNext = idx === total - 1;
    /* Swap chevron icons in RTL so each arrow points in the reading direction:
       in RTL, "previous" (older) is to the right → chevron-right;
       "next" (newer) is to the left → chevron-left. */
    const prevIcon = isRtl ? 'chevron-right' : 'chevron-left';
    const nextIcon = isRtl ? 'chevron-left'  : 'chevron-right';

    /* Title label per view: Day → "March 2026", Month → "2026",
       Year → "2020 – 2031". Day/Month titles are buttons that climb the zoom. */
    const yr = monthDate.getFullYear();
    let titleText;
    if (view === 'day') titleText = `${MONTHS[monthDate.getMonth()]} ${yr}`;
    else if (view === 'month') titleText = `${yr}`;
    else { const ps = this._yearPageStart(yr); titleText = `${ps} – ${ps + 11}`; }
    const titleIsButton = view !== 'year';
    /* While the OTHER panel is in a picker (month/year), freeze this panel's
       nav + title so the two sides can't be navigated/climbed independently —
       this removes the mixed-step edge case and keeps both-picker unreachable. */
    const frozen = total > 1 && (this._views[1 - idx] || 'day') !== 'day';
    const navDisabled = frozen ? ' disabled' : '';

    header.innerHTML = `
      ${showPrev
        ? `<ds-icon-button class="ds-calendar__nav" data-nav="prev" shape="circle" type="tertiary-grey" size="large" icon="${prevIcon}" label="${isRtl ? 'السابق' : 'Previous'}" no-tooltip${navDisabled}></ds-icon-button>`
        : `<span></span>`}
      ${titleIsButton
        ? `<ds-text-link class="ds-calendar__title" data-title variant="primary" size="medium" underline="none" aria-live="polite"${frozen ? ' disabled' : ''}>${titleText}</ds-text-link>`
        : `<span class="ds-calendar__title ds-calendar__title--static" aria-live="polite">${titleText}</span>`}
      ${showNext
        ? `<ds-icon-button class="ds-calendar__nav" data-nav="next" shape="circle" type="tertiary-grey" size="large" icon="${nextIcon}" label="${isRtl ? 'التالي' : 'Next'}" no-tooltip${navDisabled}></ds-icon-button>`
        : `<span></span>`}
    `;
    /* Nav steps by view: Day ±1 month · Month ±1 year · Year ±12 years. */
    header.querySelectorAll('[data-nav]').forEach((b) => {
      b.addEventListener('click', () => {
        if (frozen) return;
        const dir = b.dataset.nav === 'next' ? 1 : -1;
        const c = this._cursor;
        if (view === 'day') this._cursor = new Date(c.getFullYear(), c.getMonth() + dir, 1);
        else if (view === 'month') this._cursor = new Date(c.getFullYear() + dir, c.getMonth(), 1);
        else this._cursor = new Date(c.getFullYear() + dir * 12, c.getMonth(), 1);
        this._render();
      });
    });
    /* Title climbs Day → Month → Year for THIS panel only — the other panel
       keeps its own zoom level (range: clicking one side doesn't change both). */
    header.querySelector('[data-title]')?.addEventListener('click', () => {
      if (frozen) return;
      this._views[idx] = view === 'day' ? 'month' : 'year';
      this._render();
    });
    panel.appendChild(header);

    // Month / Year views use the Period-cell grid instead of the day grid.
    if (view !== 'day') {
      this._appendPeriodBody(panel, monthDate, idx);
      return panel;
    }

    // Weekdays
    const weekRow = document.createElement('div');
    weekRow.className = 'ds-calendar__weekdays';
    weekRow.setAttribute('role', 'row');
    WEEKDAYS.forEach((w) => {
      const cell = document.createElement('span');
      cell.className = 'ds-calendar__weekday';
      cell.setAttribute('role', 'columnheader');
      cell.setAttribute('aria-label', w);
      cell.textContent = w;
      weekRow.appendChild(cell);
    });
    panel.appendChild(weekRow);

    // Grid (6 weeks × 7 days = 42 cells)
    const grid = document.createElement('div');
    grid.className = 'ds-calendar__grid';
    grid.setAttribute('role', 'grid');
    grid.setAttribute('aria-label', `${MONTHS[monthDate.getMonth()]} ${monthDate.getFullYear()}`); // MONTHS already locale-aware (see top of _renderPanel)

    const firstOfMonth = new Date(monthDate.getFullYear(), monthDate.getMonth(), 1);
    const startWeekday = firstOfMonth.getDay(); // 0..6, Sun-first
    const startDate = new Date(firstOfMonth);
    startDate.setDate(firstOfMonth.getDate() - startWeekday);

    /* Render only the weeks this month actually spans (4–6 rows). This keeps the
       leading prev-month + trailing next-month fill, but never a WHOLE extra row
       made up only of next-month dates — the last row always holds the month's
       final day. */
    const daysInMonth = new Date(monthDate.getFullYear(), monthDate.getMonth() + 1, 0).getDate();
    const totalCells = Math.ceil((startWeekday + daysInMonth) / 7) * 7;

    const today = new Date();
    const min = fromISO(this.getAttribute('min'));
    const max = fromISO(this.getAttribute('max'));

    for (let i = 0; i < totalCells; i++) {
      const d = new Date(startDate);
      d.setDate(startDate.getDate() + i);

      const iso = toISO(d);
      const outside = d.getMonth() !== monthDate.getMonth();
      const isToday = sameDay(d, today);
      const disabled = (min && cmp(d, min) < 0) || (max && cmp(d, max) > 0);

      const cell = document.createElement('button');
      cell.type = 'button';
      cell.className = 'ds-calendar__day';
      cell.setAttribute('role', 'gridcell');
      cell.setAttribute('data-iso', iso);
      cell.setAttribute('aria-label', `${d.getDate()} ${MONTHS[d.getMonth()]} ${d.getFullYear()}`);
      // Day number wrapped in a span so the circle is independent of the cell
      // (cells host the range-band; the inner span hosts the accent circle).
      const inner = document.createElement('span');
      inner.className = 'ds-calendar__day-inner';
      inner.textContent = String(d.getDate());
      cell.appendChild(inner);
      cell.tabIndex = iso === this._focusISO ? 0 : -1;

      if (outside) cell.classList.add('ds-calendar__day--outside');
      // Weekend marker — Sun (0) and Sat (6) get red text via CSS
      if (d.getDay() === 0 || d.getDay() === 6) cell.dataset.weekend = 'true';
      if (isToday && !outside) cell.classList.add('ds-calendar__day--today');
      if (disabled) {
        cell.disabled = true;
        cell.setAttribute('aria-disabled', 'true');
      }

      // Selection / range styling — only for cells that belong to THIS panel's
      // month. Otherwise the same date renders as selected in two panels and
      // duplicates the visual (e.g. May 31 also appearing as range-end in June).
      if (!outside) {
        if (this._type() === 'single') {
          if (sameDay(d, this._selected)) {
            cell.classList.add('ds-calendar__day--selected');
            cell.setAttribute('aria-selected', 'true');
          }
        } else {
          const { start, end } = this._range;
          const hasRange = start && end && !sameDay(start, end);
          if (hasRange) {
            if (sameDay(d, start)) cell.classList.add('ds-calendar__day--range-start');
            if (sameDay(d, end))   cell.classList.add('ds-calendar__day--range-end');
            if (cmp(d, start) > 0 && cmp(d, end) < 0) cell.classList.add('ds-calendar__day--in-range');
          } else if (start && sameDay(d, start)) {
            /* Lone start (or single-day range) = a solid circle, not a cap. */
            cell.classList.add('ds-calendar__day--selected');
          }
          if ((start && sameDay(d, start)) || (end && sameDay(d, end))) {
            cell.setAttribute('aria-selected', 'true');
          }
        }
      }

      cell.addEventListener('click', () => this._selectDay(d));
      grid.appendChild(cell);
    }

    panel.appendChild(grid);
    return panel;
  }

  /* Month / Year picker grid (3×4 of _Period Cell pills). */
  _appendPeriodBody(panel, refDate, idx = 0) {
    const isRtl = boolAttr(this, 'rtl');
    const MONTHS_SHORT = isRtl
      ? MONTHS_RTL
      : ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const view = this._views[idx] || 'day';
    const today = new Date();
    const min = fromISO(this.getAttribute('min'));
    const max = fromISO(this.getAttribute('max'));
    const sel = this._selected || this._range.start;   // selected reference
    const year = refDate.getFullYear();

    const grid = document.createElement('div');
    grid.className = 'ds-calendar__periods';
    grid.setAttribute('role', 'grid');

    const makeCell = (label, { isToday, isSelected, isDisabled, onClick, ariaLabel }) => {
      const cell = document.createElement('button');
      cell.type = 'button';
      cell.className = 'ds-calendar__period'
        + (isToday ? ' ds-calendar__period--today' : '')
        + (isSelected ? ' ds-calendar__period--selected' : '');
      cell.textContent = label;
      cell.setAttribute('role', 'gridcell');
      cell.setAttribute('aria-label', ariaLabel);
      if (isSelected) cell.setAttribute('aria-selected', 'true');
      if (isToday) cell.setAttribute('aria-current', 'date');
      if (isDisabled) { cell.disabled = true; cell.setAttribute('aria-disabled', 'true'); }
      else cell.addEventListener('click', onClick);
      grid.appendChild(cell);
    };

    if (view === 'month') {
      for (let m = 0; m < 12; m++) {
        const mStart = new Date(year, m, 1);
        const mEnd = new Date(year, m + 1, 0);
        const disabled = (min && cmp(mEnd, min) < 0) || (max && cmp(mStart, max) > 0);
        makeCell(MONTHS_SHORT[m], {
          isToday: year === today.getFullYear() && m === today.getMonth(),
          isSelected: !!sel && sel.getFullYear() === year && sel.getMonth() === m,
          isDisabled: disabled,
          ariaLabel: `${MONTHS_SHORT[m]} ${year}`,
          /* Keep the picked month in THIS panel's slot (offset by idx) so a
             pick in the right panel doesn't jump to the left. Only this panel
             drops back to the day grid. */
          onClick: () => { this._cursor = new Date(year, m - idx, 1); this._views[idx] = 'day'; this._render(); },
        });
      }
    } else { // year
      const ps = this._yearPageStart(year);
      for (let i = 0; i < 12; i++) {
        const y = ps + i;
        const yStart = new Date(y, 0, 1);
        const yEnd = new Date(y, 11, 31);
        const disabled = (min && cmp(yEnd, min) < 0) || (max && cmp(yStart, max) > 0);
        makeCell(String(y), {
          isToday: y === today.getFullYear(),
          isSelected: !!sel && sel.getFullYear() === y,
          isDisabled: disabled,
          ariaLabel: String(y),
          /* Climb this panel from Year → Month on its own slot (offset by idx),
             leaving the other panel untouched. */
          onClick: () => { this._cursor = new Date(y, this._cursor.getMonth() - idx, 1); this._views[idx] = 'month'; this._render(); },
        });
      }
    }

    panel.appendChild(grid);
  }

  _selectDay(d) {
    /* Spec: dates outside [min,max] are Disabled and must not be selectable —
       including via keyboard Enter, which bypasses the cell's disabled attr. */
    const min = fromISO(this.getAttribute('min'));
    const max = fromISO(this.getAttribute('max'));
    if ((min && cmp(d, min) < 0) || (max && cmp(d, max) > 0)) return;

    if (this._type() === 'single') {
      this._selected = d;
      this.setAttribute('value', toISO(d));
    } else {
      const { start, end } = this._range;
      if (!start || (start && end)) {
        // Start a new range
        this._range = { start: d, end: null };
      } else if (cmp(d, start) < 0) {
        // Selected earlier than start → swap
        this._range = { start: d, end: start };
      } else {
        this._range = { start, end: d };
      }
      const v = this._range.end
        ? `${toISO(this._range.start)}/${toISO(this._range.end)}`
        : `${toISO(this._range.start)}`;
      this.setAttribute('value', v);
    }
    this._focusISO = toISO(d);
    this.dispatchEvent(new CustomEvent('ds-calendar-change', {
      bubbles: true,
      detail: this._detail(),
    }));
    this._render();
  }

  _detail() {
    if (this._type() === 'single') {
      return { value: this._selected ? toISO(this._selected) : null };
    }
    return {
      start: this._range.start ? toISO(this._range.start) : null,
      end: this._range.end ? toISO(this._range.end) : null,
    };
  }

  _onKeydown(e) {
    /* Arrow nav drives the day grid only; Month/Year views are click-driven.
       Run only if an active panel is showing the day grid. */
    const activeViews = this._type() === 'range' ? this._views : [this._views[0]];
    if (!activeViews.includes('day')) return;
    const focus = fromISO(this._focusISO);
    if (!focus) return;
    let next;
    switch (e.key) {
      case 'ArrowLeft':  next = new Date(focus); next.setDate(focus.getDate() - 1); break;
      case 'ArrowRight': next = new Date(focus); next.setDate(focus.getDate() + 1); break;
      case 'ArrowUp':    next = new Date(focus); next.setDate(focus.getDate() - 7); break;
      case 'ArrowDown':  next = new Date(focus); next.setDate(focus.getDate() + 7); break;
      case 'PageUp':     next = new Date(focus); next.setMonth(focus.getMonth() - 1); break;
      case 'PageDown':   next = new Date(focus); next.setMonth(focus.getMonth() + 1); break;
      case 'Home':       next = new Date(focus); next.setDate(focus.getDate() - focus.getDay()); break;
      case 'End':        next = new Date(focus); next.setDate(focus.getDate() + (6 - focus.getDay())); break;
      case 'Enter':
      case ' ':          this._selectDay(focus); e.preventDefault(); return;
      case 'Escape':     this.dispatchEvent(new CustomEvent('ds-calendar-cancel', { bubbles: true })); return;
      default: return;
    }
    e.preventDefault();
    this._focusISO = toISO(next);
    // Move cursor if we walked off-screen
    if (next.getMonth() !== this._cursor.getMonth() || next.getFullYear() !== this._cursor.getFullYear()) {
      this._cursor = new Date(next.getFullYear(), next.getMonth(), 1);
    }
    this._render();
    requestAnimationFrame(() => {
      this.querySelector(`[data-iso="${this._focusISO}"]`)?.focus();
    });
  }
}

if (typeof customElements !== 'undefined' && !customElements.get('ds-calendar')) {
  customElements.define('ds-calendar', DsCalendar);
}
