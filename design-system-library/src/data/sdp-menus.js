/* =============================================================================
   HelpDesk (ServiceDesk Plus MSP) — module rail + L1/L2 menus.

   STUB IA — a representative slice of ServiceDesk Plus navigation so the MSP
   Central shell has a working third product. Replace with the real SDP IA when
   it's modelled (mirror the shape of ec-menus.js `EC_TAB_L2_MENUS`).
   ============================================================================= */

/* Icon module rail (Tier 2) — one entry per SDP module. */
export const SDP_MODULES = [
  { id: 'requests', label: 'Requests', labelAr: 'الطلبات',    icon: 'help-circle' },
  { id: 'problems', label: 'Problems', labelAr: 'المشكلات',   icon: 'bug' },
  { id: 'changes',  label: 'Changes',  labelAr: 'التغييرات',  icon: 'settings-custom' },
  { id: 'assets',   label: 'Assets',   labelAr: 'الأصول',     icon: 'layers' },
  { id: 'reports',  label: 'Reports',  labelAr: 'التقارير',   icon: 'bar-vertical-chart' },
];

/* Per-module L1 + L2 (Tier 3 + Tier 4). */
export const SDP_MENUS = {
  requests: {
    l1Items: [
      { id: 'all', label: 'All Requests', icon: 'help-circle', active: true, l2Groups: [
        { id: 'views', label: 'Views', expanded: true, items: [
          { id: 'open',       label: 'Open',       count: 37, active: true },
          { id: 'overdue',    label: 'Overdue',    count: 8 },
          { id: 'unassigned', label: 'Unassigned', count: 12 },
          { id: 'onhold',     label: 'On hold',    count: 5 },
          { id: 'closed',     label: 'Closed' },
        ] },
      ] },
      { id: 'approvals', label: 'Approvals', icon: 'file-report' },
    ],
  },

  problems: {
    l1Items: [
      { id: 'all', label: 'All Problems', icon: 'bug', active: true, l2Groups: [
        { id: 'views', label: 'Views', expanded: true, items: [
          { id: 'open', label: 'Open', count: 5, active: true },
          { id: 'root', label: 'Root cause pending', count: 2 },
          { id: 'known', label: 'Known errors' },
        ] },
      ] },
    ],
  },

  changes: {
    l1Items: [
      { id: 'all', label: 'All Changes', icon: 'settings-custom', active: true, l2Groups: [
        { id: 'views', label: 'Views', expanded: true, items: [
          { id: 'upcoming', label: 'Upcoming',      count: 3, active: true },
          { id: 'cab',      label: 'Awaiting CAB',  count: 2 },
          { id: 'rollout',  label: 'In rollout' },
        ] },
      ] },
    ],
  },

  assets: {
    l1Items: [
      { id: 'all', label: 'All Assets', icon: 'layers', active: true, l2Groups: [
        { id: 'type', label: 'By type', expanded: true, items: [
          { id: 'workstations', label: 'Workstations', count: 142, active: true },
          { id: 'servers',      label: 'Servers',      count: 28 },
          { id: 'network',      label: 'Network devices', count: 64 },
          { id: 'software',     label: 'Software' },
        ] },
      ] },
    ],
  },

  reports: { hideL1: true },
};
