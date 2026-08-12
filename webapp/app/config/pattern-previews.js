/**
 * pattern-previews — the gallery registry. Each entry maps a stable /patterns/<id>
 * URL to the pattern's canonical example view (rendered in isolation), so each
 * archetype can be reviewed on its own without hunting for a real page that uses it.
 */
export const PATTERN_PREVIEWS = [
  { id: 'empty-state', label: 'Empty state', spec: 'L13', component: 'views/deployments-summary', desc: 'Full-page centered Prism empty state (illustration · title · description · primary action).' },
  { id: 'list-view', label: 'List view', spec: 'L03', component: 'views/deployments-list', desc: 'Server-driven table — filter · search · sort · paginate, KPI row, bulk actions.' },
  { id: 'module-dashboard', label: 'Module dashboard', spec: 'L02', component: 'views/bitlocker-dashboard', desc: 'KPI row over a bento grid of chart / list / table widgets.' },
  { id: 'list-detail', label: 'List detail', spec: 'L04', component: 'views/deployments-device-execution', desc: 'Record detail — full header (breadcrumbs · summary) + widget grid + slide-in panel.' },
  { id: 'sectioned-form', label: 'Sectioned form', spec: 'L06', component: 'views/sectioned-form', desc: 'Sectioned form with a pinned footer and a Save-as menu.' },
  { id: 'tabbed-form', label: 'Tabbed form', spec: 'L07', component: 'views/tabbed-form', desc: 'Tabbed settings — a tab strip swapping sectioned-form panels.' },
];

export const previewById = (id) => PATTERN_PREVIEWS.find((p) => p.id === id) ?? null;
