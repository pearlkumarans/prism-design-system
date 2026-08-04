/* =============================================================================
   Network & Servers (ITOM / OpManager MSP) — module rail + L1/L2 menus.

   STUB IA — a representative slice of OpManager's navigation so the MSP Central
   shell has a working second product. Replace with the real ITOM IA when it's
   modelled (mirror the shape of ec-menus.js `EC_TAB_L2_MENUS`).

   Shape per module id:
     { hideL1?, l1Items?: [{ id, label, icon, active?, l2Groups? }], groups? }
   ============================================================================= */

/* Icon module rail (Tier 2) — one entry per ITOM module. */
export const ITOM_MODULES = [
  { id: 'dashboard', label: 'Dashboard', labelAr: 'لوحة المعلومات', icon: 'add-widget' },
  { id: 'monitors',  label: 'Monitors',  labelAr: 'المراقبة',       icon: 'computer' },
  { id: 'alarms',    label: 'Alarms',    labelAr: 'الإنذارات',      icon: 'shield' },
  { id: 'maps',      label: 'Maps',      labelAr: 'الخرائط',        icon: 'globe' },
  { id: 'reports',   label: 'Reports',   labelAr: 'التقارير',       icon: 'bar-vertical-chart' },
];

/* Per-module L1 + L2 (Tier 3 + Tier 4). */
export const ITOM_MENUS = {
  dashboard: { hideL1: true },

  monitors: {
    l1Items: [
      { id: 'devices', label: 'Devices', icon: 'computer', active: true, l2Groups: [
        { id: 'by-type', label: 'By type', expanded: true, items: [
          { id: 'routers',   label: 'Routers',   count: 12, active: true },
          { id: 'switches',  label: 'Switches',  count: 34 },
          { id: 'servers',   label: 'Servers',   count: 58 },
          { id: 'firewalls', label: 'Firewalls', count: 6 },
        ] },
      ] },
      { id: 'interfaces', label: 'Interfaces', icon: 'layers' },
      { id: 'wan',        label: 'WAN',        icon: 'globe' },
    ],
  },

  alarms: {
    l1Items: [
      { id: 'active', label: 'Active Alarms', icon: 'shield', active: true, l2Groups: [
        { id: 'severity', label: 'Severity', expanded: true, items: [
          { id: 'critical',  label: 'Critical',  count: 4,  active: true },
          { id: 'trouble',   label: 'Trouble',   count: 11 },
          { id: 'attention', label: 'Attention', count: 23 },
          { id: 'clear',     label: 'Clear' },
        ] },
      ] },
      { id: 'history', label: 'Alarm History', icon: 'file-report' },
    ],
  },

  maps: { hideL1: true },

  reports: {
    l1Items: [
      { id: 'availability', label: 'Availability', icon: 'bar-vertical-chart', active: true, l2Groups: [
        { id: 'reports', label: 'Reports', expanded: true, items: [
          { id: 'uptime', label: 'Uptime', active: true },
          { id: 'health', label: 'Health' },
          { id: 'sla',    label: 'SLA compliance' },
        ] },
      ] },
      { id: 'performance', label: 'Performance', icon: 'speedometer' },
    ],
  },
};
