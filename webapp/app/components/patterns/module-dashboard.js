import Component from '@glimmer/component';
import { action } from '@ember/object';

/**
 * Patterns::ModuleDashboard — the L02 module-dashboard archetype
 * (Layout/views/layout-module-dashboard.html). Provides the dashboard frame:
 * page header (+breadcrumbs, +actions, +sibling-dashboard tabs), the scrolling
 * body, the uniform KPI row, and the chart-refit wiring (charts re-lay-out when
 * @refitKey changes, e.g. on a language flip). The bento grid of widgets/charts
 * differs per dashboard, so it is a yielded :body block.
 *
 *   <Patterns::ModuleDashboard @header=… @kpis=[{label,value,state,icon}]
 *       @tabs=[{id,label,active}] @refitKey=… @onTabChange=…>
 *     <:headerActions> <ds-button …/> </:headerActions>
 *     <:body>
 *       <div class="bl-grid"> <ds-widget … {{config-chart …}}></ds-widget> </div>
 *     </:body>
 *   </Patterns::ModuleDashboard>
 *
 * FacetTabs: pass @tabs to render sibling dashboards in the header's built-in tab
 * strip (not a separate tab bar). @onTabChange(tab) fires on select.
 */
export default class ModuleDashboardPattern extends Component {
  get header() { return this.args.header ?? {}; }
  get kpis() { return this.args.kpis ?? []; }
  // @loading — opt-in: a fetching dashboard renders Skeleton::Dashboard until ready.

  // ds-page-header emits ds-page-header-tab with detail.tab on facet select.
  @action onTab(event) { this.args.onTabChange?.(event?.detail?.tab); }
}
