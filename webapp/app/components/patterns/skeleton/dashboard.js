import Component from '@glimmer/component';

/**
 * Patterns::Skeleton::Dashboard — initial-load placeholder for Patterns::ModuleDashboard.
 * Mirrors the dashboard shape: a KPI row + a grid of widget/chart card placeholders.
 * Decorative (aria-hidden); replaced by the real widgets once data resolves.
 *
 *   @kpis   number of KPI placeholders (default 5)
 *   @cards  number of card placeholders (default 6)
 */
export default class SkeletonDashboard extends Component {
  get kpiCells() { return Array.from({ length: this.args.kpis || 5 }); }
  get cards() { return Array.from({ length: this.args.cards || 6 }); }
}
