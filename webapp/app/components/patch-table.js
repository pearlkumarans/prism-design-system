import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';

/**
 * Demonstrates the full Ember ⇄ Web Component contract against the REAL
 * `ds-data-table` component (unmodified, straight from @uems/design-system):
 *
 *   1. Array PROPERTIES (`columns`, `rows`) pushed in via the {{set-prop}} modifier.
 *   2. Custom EVENTS (`ds-data-table-selection`, `ds-data-table-sort`) handled with
 *      the built-in {{on}} modifier, updating tracked state.
 *   3. Reactivity BOTH ways — clicking the ds-button mutates tracked `rows`, and
 *      the modifier re-pushes the new array into the element, which re-renders.
 */
export default class PatchTable extends Component {
  // Column defs use the component's own shape: { id, header, accessor, render? }.
  columns = [
    { id: 'patch', header: 'Patch', accessor: 'patch' },
    { id: 'severity', header: 'Severity', accessor: 'severity' },
    { id: 'systems', header: 'Affected systems', accessor: 'systems' },
  ];

  @tracked rows = [
    { patch: 'KB5034441', severity: 'Critical', systems: 128 },
    { patch: 'KB5034123', severity: 'Important', systems: 54 },
    { patch: 'KB5033920', severity: 'Moderate', systems: 12 },
  ];

  @tracked lastEvent = '— no interaction yet —';
  @tracked selectedCount = 0;

  @action
  addRow() {
    const n = this.rows.length + 1;
    // New array reference → set-prop re-runs → the WC gets fresh rows.
    this.rows = [
      ...this.rows,
      { patch: `KB90000${n}`, severity: 'Important', systems: n * 7 },
    ];
    this.lastEvent = `Added row ${n} from Ember state`;
  }

  @action
  onSelection(event) {
    const selected = event.detail?.selected ?? event.detail?.rows ?? [];
    this.selectedCount = Array.isArray(selected) ? selected.length : 0;
    this.lastEvent = `ds-data-table-selection → ${this.selectedCount} row(s)`;
  }

  @action
  onSort(event) {
    const { columnId, column, direction } = event.detail ?? {};
    this.lastEvent = `ds-data-table-sort → ${columnId ?? column ?? '?'} (${direction ?? '?'})`;
  }
}
