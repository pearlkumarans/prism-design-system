/* =============================================================================
   SIEM (Log360 MSP) — module rail + L1/L2 menus.

   STUB IA — a representative slice of Log360 / SIEM navigation so the MSP Central
   shell has a working fourth product. Replace with the real SIEM IA when it's
   modelled (mirror the shape of ec-menus.js `EC_TAB_L2_MENUS`).
   ============================================================================= */

/* Icon module rail (Tier 2) — one entry per SIEM module. */
export const SIEM_MODULES = [
  { id: 'dashboard',  label: 'Dashboard',   labelAr: 'لوحة المعلومات', icon: 'add-widget' },
  { id: 'incidents',  label: 'Incidents',   labelAr: 'الحوادث',        icon: 'shield' },
  { id: 'logs',       label: 'Log Search',  labelAr: 'بحث السجلات',    icon: 'file-report' },
  { id: 'compliance', label: 'Compliance',  labelAr: 'الامتثال',       icon: 'checklist-01' },
  { id: 'reports',    label: 'Reports',     labelAr: 'التقارير',       icon: 'bar-vertical-chart' },
];

/* Per-module L1 + L2 (Tier 3 + Tier 4). */
export const SIEM_MENUS = {
  dashboard: { hideL1: true },

  incidents: {
    l1Items: [
      { id: 'active', label: 'Active Incidents', icon: 'shield', active: true, l2Groups: [
        { id: 'severity', label: 'Severity', expanded: true, items: [
          { id: 'critical', label: 'Critical', count: 6,  active: true },
          { id: 'high',     label: 'High',     count: 18 },
          { id: 'medium',   label: 'Medium',   count: 44 },
          { id: 'low',      label: 'Low' },
        ] },
      ] },
      { id: 'assigned', label: 'Assigned to me', icon: 'file-report' },
      { id: 'rules',    label: 'Correlation Rules', icon: 'settings-custom' },
    ],
  },

  logs: {
    l1Items: [
      { id: 'search', label: 'Search', icon: 'file-report', active: true, l2Groups: [
        { id: 'sources', label: 'Log sources', expanded: true, items: [
          { id: 'windows',  label: 'Windows', count: 128, active: true },
          { id: 'firewall', label: 'Firewalls', count: 12 },
          { id: 'cloud',    label: 'Cloud', count: 9 },
        ] },
      ] },
      { id: 'saved',   label: 'Saved searches', icon: 'layers' },
    ],
  },

  compliance: {
    l1Items: [
      { id: 'reports', label: 'Compliance Reports', icon: 'checklist-01', active: true, l2Groups: [
        { id: 'std', label: 'Standards', expanded: true, items: [
          { id: 'pci',   label: 'PCI DSS', active: true },
          { id: 'hipaa', label: 'HIPAA' },
          { id: 'gdpr',  label: 'GDPR' },
        ] },
      ] },
    ],
  },

  reports: { hideL1: true },
};
