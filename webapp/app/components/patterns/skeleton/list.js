import Component from '@glimmer/component';

/**
 * Patterns::Skeleton::List — the initial-load placeholder for Patterns::ListView.
 * Per the Prism 300ms–2s loading tier: a skeleton that MATCHES the layout shape
 * (KPI row + toolbar + table rows) rather than a generic spinner. Purely decorative
 * (aria-hidden); the real content replaces it once data resolves.
 *
 *   @columns  number of table columns to mirror (default 6)
 *   @rows     number of placeholder rows (default 8)
 *   @kpis     truthy → show a KPI placeholder row
 */
export default class SkeletonList extends Component {
  get cols() { return Array.from({ length: this.args.columns || 6 }); }
  get rows() { return Array.from({ length: this.args.rows || 8 }); }
  get kpiCells() { return Array.from({ length: 4 }); }
}
