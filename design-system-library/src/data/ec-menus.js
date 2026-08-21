/* =============================================================================
   Endpoint Central — per-tab L1 module rail + L2 sub-navigation menus.

   L1 items sourced from docs/MD/left-sidebar-navigation-level-1.md.
   L2 groups+items sourced from docs/MD/left-sidebar-navigation-level-2.md
   (Product Navigation Content Reference).

   Map keyed by the top-bar tab id (matches ds-header-nav tab ids):
     {
       title?: string,          // L2 header title (currently hidden in base pages)
       hideL1?: boolean,        // When true, L1 module rail is hidden
       l1Items?: array,         // L1 module rail items
       l1Bottom?: array,        // L1 bottom items (e.g. "Update Now")
       groups?: array,          // L2 collapsible group definitions
     }

   Convenience helper:
     applyL2For(l1Element, l2Element, tabId)
   ============================================================================= */

export const EC_TAB_L2_MENUS = {

  /* Configurations */
  configs: {
    title: 'Configurations',
    hideL1: true,
    l1Items: [
      { id: 'add-config',     label: 'Add Config',     icon: 'plus',          state: 'add' },
      { id: 'configurations', label: 'Configurations', icon: 'settings',      active: true },
      { id: 'library',        label: 'Library',        icon: 'file-folder' },
      { id: 'reports',        label: 'Reports',        icon: 'file-report' },
      { id: 'settings',       label: 'Settings',       icon: 'settings' },
      { id: 'trash',          label: 'Trash',          icon: 'laptop-trash' },
    ],
    groups: [
      { id: 'add', label: 'Add Configurations', expanded: true, items: [
        { id: 'config',     label: 'Configuration', hasChildren: true },
        { id: 'templates',  label: 'Templates' },
        { id: 'collection', label: 'Collection', hasChildren: true },
      ] },
      { id: 'views', label: 'Views', expanded: true, items: [
        { id: 'all-configs', label: 'All Configurations', active: true },
        { id: 'trash',       label: 'Trash' },
      ] },
      { id: 'reports', label: 'Reports', expanded: true, items: [
        { id: 'usb-rep',    label: 'USB Reports' },
        { id: 'script-repo',label: 'Script Repository' },
      ] },
      { id: 'settings', label: 'Settings', expanded: true, items: [
        { id: 'config-set',     label: 'Configuration Settings' },
        { id: 'script-repo-set',label: 'Script Repository' },
      ] },
    ],
  },

  /* Threats & Patches — 5 panels, one per L1 item */
  tp: {
    title: 'Threats & Patches',
    l1Items: [
      { id: 'dashboard',  label: 'Dashboard',  icon: 'add-widget',     active: true },
      { id: 'threats',    label: 'Threats',    icon: 'bug', l2Groups: [
        { id: 'threats', label: 'Threats', expanded: true, items: [
          { id: 'vuln',         label: 'Vulnerabilities', active: true },
          { id: 'zero-day',     label: 'Zero-day Vulnerabilities' },
          { id: 'sys-miscfg',   label: 'System Misconfigurations' },
          { id: 'high-risk',    label: 'High Risk Software' },
          { id: 'web-miscfg',   label: 'Web Server Misconfiguration' },
          { id: 'port-audit',   label: 'Port Audit' },
          { id: 'exceptions',   label: 'Manage Exceptions' },
        ] },
      ] },
      { id: 'patches',    label: 'Patches',    icon: 'file-shield', l2Groups: [
        { id: 'patches', label: 'Patches', expanded: true, items: [
          { id: 'missing',    label: 'Missing Patches',    active: true },
          { id: 'installed',  label: 'Installed Patches',  count: 81 },
          { id: 'applicable', label: 'Applicable Patches', count: 397 },
          { id: 'priority',   label: 'Top-Priority Patches' },
          { id: 'supported',  label: 'Supported Patches',  count: '554 K' },
          { id: 'latest',     label: 'Latest Patches',     count: '78 K' },
          { id: 'detailed',   label: 'Detailed View' },
          { id: 'downloaded', label: 'Downloaded Patches' },
          { id: 'decline',    label: 'Decline Patch' },
        ] },
        { id: 'attention', label: 'Attention Required', expanded: true, items: [
          { id: 'upload', label: 'Upload Pending', count: 1 },
        ] },
      ] },
      { id: 'systems',    label: 'Systems',    icon: 'computer', l2Groups: [
        { id: 'health', label: 'Health Summary', expanded: true, items: [
          { id: 'highly-vuln', label: 'Highly Vulnerable Systems', active: true },
          { id: 'vuln',        label: 'Vulnerable Systems', count: 1 },
          { id: 'healthy',     label: 'Healthy Systems',    count: 8 },
          { id: 'health-pol',  label: 'System Health Policy' },
        ] },
        { id: 'managed', label: 'Managed Systems', expanded: true, items: [
          { id: 'scan-sys',    label: 'Scan Systems',                 count: 678 },
          { id: 'by-patches',  label: 'By Patches',                   count: 659 },
          { id: 'by-vuln',     label: 'By Vulnerabilities',           count: 3 },
          { id: 'by-miscfg',   label: 'By Misconfigurations',         count: 5 },
          { id: 'by-web',      label: 'By Web Server Misconfiguration', count: 2 },
          { id: 'by-hrs',      label: 'By High Risk Software',        count: 14 },
        ] },
        { id: 'attention', label: 'Attention Required', expanded: true, items: [
          { id: 'bios',        label: 'BIOS Mapping Status', count: 2 },
          { id: 'eol',         label: 'EOL Systems' },
          { id: 'zero-day',    label: 'Zero day found' },
          { id: 'no-contact',  label: 'Systems without Agent Contact' },
          { id: 'reboot',      label: 'Reboot Pending' },
          { id: 'macos',       label: 'macOS patching unavailable' },
          { id: 'patch-fail',  label: 'Patch Deployment Failed' },
          { id: 'sec-fail',    label: 'Failed Security Configurations' },
          { id: 'sw-uninst',   label: 'Software Uninstallation Failed' },
        ] },
      ] },
      { id: 'deployment', label: 'Deployment', icon: 'settings-deploy', l2Groups: [
        { id: 'deployment', label: 'Deployment', expanded: true, items: [
          { id: 'manual',      label: 'Manual Deployment', active: true },
          { id: 'test',        label: 'Test and Approve' },
          { id: 'auto',        label: 'Automate Patch Deployment' },
          { id: 'disable',     label: 'Disable Automatic Updates' },
          { id: 'sec-cfg',     label: 'Security Configurations' },
          { id: 'sw-uninst',   label: 'Software Uninstallation' },
          { id: 'deploy-pol',  label: 'Deployment Policies' },
          { id: 'script',      label: 'Script Repository' },
          { id: 'trash',       label: 'Trash' },
        ] },
        { id: 'tools', label: 'Tools', expanded: true, items: [
          { id: 'remote-shut', label: 'Remote Shutdown' },
          { id: 'wol',         label: 'Wake on LAN' },
        ] },
      ] },
      { id: 'compliance', label: 'Compliance', icon: 'checklist-01', l2Groups: [
        { id: 'compliance', label: 'Compliance', expanded: true, items: [
          { id: 'pol-groups',  label: 'Policy Groups', active: true },
          { id: 'map-audit',   label: 'Map and Audit Targets' },
          { id: 'quarantine',  label: 'System Quarantine Policy' },
        ] },
      ] },
      { id: 'reports',    label: 'Reports',    icon: 'file-report' },
      { id: 'settings',   label: 'Settings',   icon: 'settings', l2Groups: [
        { id: 'settings', label: 'Settings', expanded: true, items: [
          { id: 'decline',      label: 'Decline Patch', active: true },
          { id: 'health-pol',   label: 'System Health Policy' },
          { id: 'test',         label: 'Test and Approve' },
          { id: 'proxy',        label: 'Proxy Settings' },
          { id: 'patch-db',     label: 'Patch Database Settings' },
          { id: 'bios',         label: 'BIOS Credential Settings' },
          { id: 'n1',           label: 'N-1 Patch Settings', view: 'threats-patches-n1-patch-settings' },
          { id: 'redhat',       label: 'Red Hat Linux Settings' },
          { id: 'suse',         label: 'SUSE Linux Settings' },
          { id: 'linux-repo',   label: 'Linux Repository Settings', view: 'threats-patches-linux-repository-settings' },
          { id: 'cleanup',      label: 'Cleanup Settings' },
          { id: 'office-ctr',   label: 'Office Click-to-Run Settings' },
          { id: 'ssp',          label: 'Self Service Portal Settings' },
          { id: 'threat-scan',  label: 'Threat scanner settings' },
        ] },
      ] },
    ],
    l1Bottom: [
      { id: 'update-now', label: 'Update Now', icon: 'refresh-time' },
    ],
    /* Default L2 (when no specific L1 item selected) — Patches panel */
    groups: [
      { id: 'patches', label: 'Patches', expanded: true, items: [
        { id: 'missing',    label: 'Missing Patches',    active: true },
        { id: 'installed',  label: 'Installed Patches',  count: 81 },
        { id: 'applicable', label: 'Applicable Patches', count: 397 },
        { id: 'priority',   label: 'Top-Priority Patches' },
        { id: 'supported',  label: 'Supported Patches',  count: '554 K' },
        { id: 'latest',     label: 'Latest Patches',     count: '78 K' },
        { id: 'detailed',   label: 'Detailed View' },
        { id: 'downloaded', label: 'Downloaded Patches' },
        { id: 'decline',    label: 'Decline Patch' },
      ] },
      { id: 'attention', label: 'Attention Required', expanded: true, items: [
        { id: 'upload', label: 'Upload Pending', count: 1 },
      ] },
    ],
  },

  /* Software Deployment */
  sd: {
    title: 'Software Deployment',
    hideL1: true,
    l1Items: [
      { id: 'packages',   label: 'Packages',   icon: 'file-folder',    active: true },
      { id: 'library',    label: 'Library',    icon: 'file-folder' },
      { id: 'deployment', label: 'Deployment', icon: 'settings-deploy' },
      { id: 'reports',    label: 'Reports',    icon: 'file-report' },
      { id: 'settings',   label: 'Settings',   icon: 'settings' },
    ],
    groups: [
      { id: 'pkg-create', label: 'Package creation', expanded: true, items: [
        { id: 'packages',  label: 'Packages', active: true },
        { id: 'templates', label: 'Templates' },
      ] },
      { id: 'deployment', label: 'Deployment', expanded: true, items: [
        { id: 'install',  label: 'Install/Uninstall Software', hasChildren: true },
        { id: 'view-cfg', label: 'View Configurations' },
        { id: 'user-tpl', label: 'User-defined Templates' },
        { id: 'trash',    label: 'Trash' },
        { id: 'ssp',      label: 'Self Service Portal' },
      ] },
      { id: 'reports', label: 'Reports', expanded: true, items: [
        { id: 'ssp-rep',   label: 'Self Service Portal Reports' },
        { id: 'ssp-usage', label: 'SSP Usage Reports' },
      ] },
      { id: 'settings', label: 'Settings', expanded: true, items: [
        { id: 'sw-repo',     label: 'Software Repository' },
        { id: 'script-repo', label: 'Script Repository' },
        { id: 'auto-tpl',    label: 'Auto-update Templates' },
        { id: 'proxy',       label: 'Proxy Settings' },
        { id: 'deploy-pol',  label: 'Deployment Policies' },
        { id: 'pkg-clean',   label: 'Package Cleanup Settings' },
        { id: 'ssp-set',     label: 'Self Service Portal Settings' },
        { id: 'redhat',      label: 'Red Hat Linux Settings' },
      ] },
    ],
  },

  /* Deployments — unified Policy → Workflow → Deployment framework.
     Source: UEMS Unified Deployment Framework study §6 view map.
     L1 = 5 items (Dashboard · Devices · Policies · Deployments · Reports);
     Policies expands an L2 with Profiles / Workflows / Schedule policy. */
  deployments: {
    title: 'Deployments',
    l1Items: [
      { id: 'dashboard',   label: 'Dashboard',   icon: 'add-widget',      view: 'deployments-summary', active: true },
      { id: 'devices',     label: 'Devices',     icon: 'computer',        view: 'deployments-devices' },
      { id: 'policies',    label: 'Policies',    icon: 'shield',
        view: 'deployments-policy-list',
        l2Groups: [
          { id: 'policies', label: 'Policies', expanded: true, items: [
            { id: 'all-policies', label: 'All Policies', view: 'deployments-policy-list', active: true },
            { id: 'add-policy',   label: 'Add Policy',   view: 'deployments-policy' },
          ] },
          { id: 'advanced', label: 'Advanced Policies', expanded: true, items: [
            { id: 'workflows', label: 'Workflows',         view: 'deployments-workflow' },
            { id: 'schedule',  label: 'Schedule Policy', view: 'deployments-schedule' },
          ] },
        ] },
      { id: 'deployments', label: 'Deployments', icon: 'settings-deploy', view: 'deployments-list' },
      { id: 'reports',     label: 'Reports',     icon: 'file-report',     view: 'deployments-reports' },
    ],
  },

  /* Inventory */
  inv: {
    title: 'Inventory',
    hideL1: true,
    l1Items: [
      { id: 'computers', label: 'Computers',          icon: 'computer',      active: true },
      { id: 'hardware',  label: 'Hardware',           icon: 'hard-disk' },
      { id: 'software',  label: 'Software',           icon: 'file-folder' },
      { id: 'alerts',    label: 'Alerts',             icon: 'notification' },
      { id: 'prohibit',  label: 'Prohibit Software',  icon: 'cancel-circle' },
      { id: 'block',     label: 'Block Executable',   icon: 'cancel' },
      { id: 'reports',   label: 'Reports',            icon: 'file-report' },
      { id: 'settings',  label: 'Settings',           icon: 'settings' },
    ],
    groups: [
      { id: 'views', label: 'Views', expanded: true, items: [
        { id: 'computers', label: 'Computers', active: true },
        { id: 'hardware',  label: 'Hardware' },
        { id: 'software',  label: 'Software' },
        { id: 'custom-groups', label: 'Custom Groups', view: 'custom-groups-create-group' },
        { id: 'alerts',    label: 'Alerts' },
        { id: 'inv-rep',   label: 'Inventory Reports' },
      ] },
      { id: 'app-ctrl', label: 'Application Control', expanded: true, items: [
        { id: 'prohibit', label: 'Prohibit Software' },
        { id: 'block',    label: 'Block Executable' },
      ] },
      { id: 'actions', label: 'Actions / Settings', expanded: true, items: [
        { id: 'scan-sys',     label: 'Scan Systems' },
        { id: 'dev-warranty', label: 'Device Warranty', newTag: true },
        { id: 'file-scan',    label: 'File Scan Rules' },
        { id: 'scan-set',     label: 'Scan Settings' },
        { id: 'sw-metering',  label: 'Software Metering' },
        { id: 'licenses',     label: 'Manage Licenses' },
        { id: 'sw-cat',       label: 'Manage Software Category' },
        { id: 'cfg-alerts',   label: 'Configure Alerts' },
        { id: 'sched-scan',   label: 'Schedule Scan' },
      ] },
    ],
  },

  /* OS Deployment */
  osd: {
    title: 'OS Deployment',
    hideL1: true,
    l1Items: [
      { id: 'dashboard',     label: 'Dashboard',            icon: 'add-widget',     active: true },
      { id: 'online-img',    label: 'Online Imaging',       icon: 'cloud-upload' },
      { id: 'backup-user',   label: 'Backup User Profile',  icon: 'circle-tick' },
      { id: 'customize',     label: 'Customize',            icon: 'edit' },
      { id: 'deploy',        label: 'Deploy',               icon: 'settings-deploy' },
      { id: 'repository',    label: 'Repository',           icon: 'file-folder' },
      { id: 'settings',      label: 'Settings',             icon: 'settings' },
    ],
    groups: [
      { id: 'create', label: 'Create', expanded: true, items: [
        { id: 'online-img',  label: 'Online Imaging' },
        { id: 'backup-user', label: 'Backup User Profile' },
      ] },
      { id: 'customize', label: 'Customize', expanded: true, items: [
        { id: 'deploy-tpl',   label: 'Deployment template' },
        { id: 'add-apps',     label: 'Add Applications' },
        { id: 'computer-set', label: 'Computer Specific Settings' },
      ] },
      { id: 'deploy', label: 'Deploy', expanded: true, items: [
        { id: 'bootable',    label: 'Create Bootable Media' },
        { id: 'deploy-task', label: 'Deployment Task' },
        { id: 'instant',     label: 'Instant task' },
        { id: 'zero-touch',  label: 'Zero Touch Task' },
        { id: 'standalone',  label: 'Standalone Task' },
        { id: 'deploy-stat', label: 'Deployment Status' },
      ] },
      { id: 'repo', label: 'Repository', expanded: true, items: [
        { id: 'image-repo',  label: 'Image Repository' },
        { id: 'driver-repo', label: 'Driver Repository' },
      ] },
      { id: 'admin', label: 'Admin', expanded: true, items: [
        { id: 'drivers',    label: 'Drivers' },
        { id: 'remote-off', label: 'Remote Office' },
        { id: 'settings',   label: 'Settings' },
        { id: 'license',    label: 'License Details' },
        { id: 'action-log', label: 'Action Log Viewer' },
      ] },
    ],
  },

  /* MDM — 4 panels per L1 item */
  mdm: {
    title: 'MDM',
    l1Items: [
      { id: 'dashboard',  label: 'Dashboard',  icon: 'add-widget',     active: true },
      { id: 'management', label: 'Management', icon: 'settings', l2Groups: [
        { id: 'manage', label: 'Manage', expanded: true, items: [
          { id: 'groups',       label: 'Groups & Devices', active: true },
          { id: 'profiles',     label: 'Profiles' },
          { id: 'app-repo',     label: 'App Repository' },
          { id: 'app-update',   label: 'App Update Policy' },
          { id: 'tem',          label: 'Telecom Expense Mgmt' },
          { id: 'certificates', label: 'Certificates' },
          { id: 'alerts',       label: 'Alerts' },
          { id: 'content-mgmt', label: 'Content Management' },
          { id: 'auto-os',      label: 'Automate OS Updates' },
          { id: 'knox',         label: 'Knox' },
        ] },
        { id: 'tools', label: 'Tools', expanded: true, items: [
          { id: 'announce',    label: 'Announcements' },
          { id: 'remote-ctrl', label: 'Remote Control' },
        ] },
        { id: 'cond-access', label: 'Conditional Access', expanded: true, items: [
          { id: 'exchange',   label: 'Exchange' },
          { id: 'office',     label: 'Office 365' },
          { id: 'office-mam', label: 'Office 365 MAM policy' },
        ] },
        { id: 'geofence', label: 'Geofencing', expanded: true, items: [
          { id: 'fence-pol',  label: 'Fence Policy' },
          { id: 'fence-repo', label: 'Fence Repository' },
        ] },
      ] },
      { id: 'inventory',  label: 'Inventory',  icon: 'computer', l2Groups: [
        { id: 'inv', label: 'Inventory', expanded: true, items: [
          { id: 'devices',  label: 'Devices', active: true },
          { id: 'apps',     label: 'Apps' },
          { id: 'location', label: 'Location Data' },
          { id: 'scan',     label: 'Scan Devices' },
        ] },
        { id: 'inv-set', label: 'Inventory Settings', expanded: true, items: [
          { id: 'sched',    label: 'Schedule Device Scan' },
          { id: 'geo',      label: 'Geo-Tracking' },
          { id: 'battery',  label: 'Battery Level Tracking' },
          { id: 'network',  label: 'Network Performance Tracking' },
        ] },
      ] },
      { id: 'enrollment', label: 'Enrollment', icon: 'mobile-tick', l2Groups: [
        { id: 'enroll', label: 'Enroll', expanded: true, items: [
          { id: 'devices',     label: 'Devices', active: true },
          { id: 'users',       label: 'Users' },
          { id: 'self-enroll', label: 'Self Enrollment' },
          { id: 'enroll-set',  label: 'Enrollment Settings' },
          { id: 'directory',   label: 'Directory Services' },
        ] },
        { id: 'apple', label: 'Apple', expanded: true, items: [
          { id: 'abm-asm',     label: 'Apple Enrollment (ABM/ASM)' },
          { id: 'configurator',label: 'Apple Configurator' },
          { id: 'apns',        label: 'APNs certificate' },
          { id: 'me-mdm-1',    label: 'ME MDM App' },
        ] },
        { id: 'android', label: 'Android', expanded: true, items: [
          { id: 'qr',           label: 'QR Code Enrollment' },
          { id: 'zero-touch',   label: 'Zero-touch Enrollment' },
          { id: 'knox-mobile',  label: 'Knox Mobile Enrollment' },
          { id: 'nfc',          label: 'NFC Enrollment' },
          { id: 'google-play',  label: 'Managed Google Play' },
          { id: 'me-mdm-2',     label: 'ME MDM App' },
        ] },
        { id: 'windows', label: 'Windows', expanded: true, items: [
          { id: 'laptop',  label: 'Enroll Laptop/Surface Pro' },
          { id: 'azure',   label: 'Azure Enrollment (AutoPilot)' },
          { id: 'smart',   label: 'Smart Devices' },
          { id: 'me-set',  label: 'ME MDM Settings' },
        ] },
        { id: 'chrome', label: 'Chrome OS', expanded: true, items: [
          { id: 'chromebook', label: 'Chromebook Enrollment' },
        ] },
      ] },
      { id: 'reports',    label: 'Reports',    icon: 'file-report' },
      { id: 'settings',   label: 'Settings',   icon: 'settings', l2Groups: [
        { id: 'setup', label: 'Setting up MDMP', expanded: true, items: [
          { id: 'nat',   label: 'NAT Settings', active: true },
          { id: 'proxy', label: 'Proxy Settings' },
        ] },
        { id: 'privacy', label: 'Privacy Settings', expanded: true, items: [
          { id: 'dev-priv', label: 'Device Privacy' },
          { id: 'tou',      label: 'Terms of Use' },
        ] },
        { id: 'inv-set', label: 'Inventory Settings', expanded: true, items: [
          { id: 'sched',    label: 'Schedule Device Scan' },
          { id: 'geo',      label: 'Geo-Tracking' },
          { id: 'rc',       label: 'Remote Control' },
        ] },
        { id: 'integrations', label: 'Integrations', expanded: true, items: [
          { id: 'mtd', label: 'Mobile Threat Defense' },
        ] },
      ] },
      { id: 'audit',      label: 'Audit',      icon: 'checklist-01' },
    ],
    /* Default L2 — Manage panel */
    groups: [
      { id: 'manage', label: 'Manage', expanded: true, items: [
        { id: 'groups',       label: 'Groups & Devices', active: true },
        { id: 'profiles',     label: 'Profiles' },
        { id: 'app-repo',     label: 'App Repository' },
        { id: 'app-update',   label: 'App Update Policy' },
        { id: 'tem',          label: 'Telecom Expense Mgmt' },
        { id: 'certificates', label: 'Certificates' },
        { id: 'alerts',       label: 'Alerts' },
        { id: 'content-mgmt', label: 'Content Management' },
        { id: 'auto-os',      label: 'Automate OS Updates' },
        { id: 'knox',         label: 'Knox' },
      ] },
      { id: 'tools', label: 'Tools', expanded: true, items: [
        { id: 'announce',    label: 'Announcements' },
        { id: 'remote-ctrl', label: 'Remote Control' },
      ] },
      { id: 'cond-access', label: 'Conditional Access', expanded: true, items: [
        { id: 'exchange',    label: 'Exchange' },
        { id: 'office',      label: 'Office 365' },
        { id: 'office-mam',  label: 'Office 365 MAM policy' },
      ] },
      { id: 'geofence', label: 'Geofencing', expanded: true, items: [
        { id: 'fence-pol',  label: 'Fence Policy' },
        { id: 'fence-repo', label: 'Fence Repository' },
      ] },
    ],
  },

  /* Agent */
  agent: {
    title: 'Agent',
    hideL1: true,
    l1Items: [
      { id: 'dashboard',  label: 'Dashboard',      icon: 'add-widget',     active: true },
      { id: 'domain',     label: 'Domain',         icon: 'globe' },
      { id: 'remote',     label: 'Remote Offices', icon: 'building' },
      { id: 'computers',  label: 'Computers',      icon: 'computer' },
      { id: 'auto-disc',  label: 'Auto Discovery', icon: 'search' },
      { id: 'settings',   label: 'Settings',       icon: 'settings' },
    ],
    groups: [
      { id: 'som', label: 'Scope of Management', expanded: true, items: [
        { id: 'summary',   label: 'Summary', active: true },
        { id: 'domain',    label: 'Domain' },
        { id: 'remote',    label: 'Remote Offices' },
        { id: 'computers', label: 'Computers' },
        { id: 'mdm-pre',   label: 'MDM Prerequisites' },
      ] },
      { id: 'auto-disc', label: 'Auto Discovery', expanded: true, items: [
        { id: 'agent-inst', label: 'Agent Installation' },
        { id: 'ad-sync',    label: 'Active Directory Sync' },
        { id: 'azure-ap',   label: 'Azure Autopilot' },
        { id: 'abm-dep',    label: 'ABM/DEP' },
        { id: 'inactive',   label: 'Inactive Computer Policy' },
      ] },
      { id: 'settings', label: 'Settings', expanded: true, items: [
        { id: 'agent-set',   label: 'Agent Settings' },
        { id: 'ip-scope',    label: 'IP Scope' },
        { id: 'som-set',     label: 'SoM Settings' },
        { id: 'replication', label: 'Replication Policy' },
        { id: 'apns',        label: 'APNS Certificate' },
      ] },
    ],
  },

  /* Tools */
  tools: {
    title: 'Tools',
    l1Items: [
      { id: 'remote-ctrl', label: 'Remote Control',   icon: 'computer-mobile', active: true },
      { id: 'sys-mgr',     label: 'System Manager',   icon: 'settings' },
      { id: 'remote-shut', label: 'Remote Shutdown',  icon: 'cancel-circle' },
      { id: 'wol',         label: 'Wake On LAN',      icon: 'zap' },
      { id: 'chat',        label: 'Chat',             icon: 'message-chat-square' },
      { id: 'announce',    label: 'Announcement',     icon: 'notification' },
      { id: 'sys-tools',   label: 'System Tools',     icon: 'settings' },
    ],
  },

  /* Admin */
  admin: {
    title: 'Admin',
    hideL1: true,
    groups: [
      { id: 'global', label: 'Global Settings', expanded: true, items: [
        { id: 'custom-grp',  label: 'Custom Group', active: true },
        { id: 'rebrand',     label: 'Rebranding' },
        { id: 'ssp-set',     label: 'Self Service Portal Settings' },
        { id: 'cred-mgr',    label: 'Credential Manager' },
        { id: 'custom-fld',  label: 'Custom Field' },
        { id: 'custom-data', label: 'Add Custom Data for Computers' },
        { id: 'dex-mgr',     label: 'DEX Manager' },
      ] },
      { id: 'users', label: 'User Administration', expanded: true, items: [
        { id: 'users-list',  label: 'Users' },
        { id: 'role',        label: 'Role' },
        { id: 'mobile-app',  label: 'Mobile App' },
        { id: 'saml',        label: 'SAML Authentication' },
      ] },
      { id: 'agent', label: 'Agent', expanded: false, items: [
        { id: 'agent-set',   label: 'Agent Settings' },
        { id: 'som-set',     label: 'SoM Settings' },
        { id: 'azure-ap',    label: 'Azure Autopilot' },
        { id: 'apple-abm',   label: 'Apple Enrollment (ABM)' },
        { id: 'apns',        label: 'APNS Certificate' },
      ] },
      { id: 'server', label: 'Server Settings', expanded: false, items: [
        { id: 'nat',          label: 'NAT Settings' },
        { id: 'proxy',        label: 'Proxy Server' },
        { id: 'mail',         label: 'Mail Server' },
        { id: 'sms',          label: 'SMS Server' },
        { id: 'central-maint',label: 'Central Server Maintenance' },
        { id: 'central-set',  label: 'Central Server Settings' },
        { id: 'failover',     label: 'Failover Server' },
        { id: 'central-mig',  label: 'Central Server Migration' },
        { id: 'network',      label: 'Network Settings' },
      ] },
      { id: 'integrations', label: 'Integrations', expanded: false, items: [
        { id: 'sdp',          label: 'ServiceDesk Plus Settings' },
        { id: 'helpdesk',     label: 'Help Desk Settings' },
        { id: 'api-key',      label: 'API Key Management' },
        { id: 'api-explorer', label: 'API Explorer' },
        { id: 'servicenow',   label: 'ServiceNow Settings' },
        { id: 'jira',         label: 'Jira Settings' },
        { id: 'zendesk',      label: 'Zendesk' },
        { id: 'adv-analytics',label: 'Advanced Analytics' },
        { id: 'threat-scan',  label: 'Threat scanner settings' },
        { id: 'log360',       label: 'Log360 - EventLog Analyzer' },
        { id: 'splunk',       label: 'Splunk Integration' },
        { id: 'pam360',       label: 'PAM360 Settings' },
        { id: 'syslog',       label: 'Syslog' },
        { id: 'power-bi',     label: 'Power BI' },
        { id: 'more',         label: 'Need More Integrations?' },
      ] },
      { id: 'security', label: 'Security & Privacy', expanded: false, items: [
        { id: 'ssl',          label: 'Manage SSL Certificate' },
        { id: 'security-set', label: 'Security Settings' },
        { id: 'privacy',      label: 'Privacy Settings' },
        { id: 'export',       label: 'Export Settings' },
        { id: 'dpo',          label: 'DPO Dashboard' },
        { id: 'compliance',   label: 'Product Compliance' },
      ] },
      { id: 'db', label: 'Database Settings', expanded: false, items: [
        { id: 'db-set',       label: 'Database Settings' },
        { id: 'remote-db',    label: 'Remote DB Access' },
        { id: 'sql-mig',      label: 'MS SQL Migration' },
      ] },
      { id: 'patch', label: 'Patch Settings', expanded: false, items: [
        { id: 'redhat',       label: 'Red Hat Linux Settings' },
        { id: 'suse',         label: 'SUSE Linux Settings' },
        { id: 'patch-db',     label: 'Patch Database Settings' },
        { id: 'office-ctr',   label: 'Office Click-to-Run Settings' },
        { id: 'patch-dl',     label: 'Patch Download' },
        { id: 'bios-cred',    label: 'BIOS Credential Settings' },
        { id: 'n1-patch',     label: 'N-1 Patch Settings' },
      ] },
      { id: 'osd', label: 'OS Deployment', expanded: false, items: [
        { id: 'enable-osd',   label: 'Enable OS Deployment' },
        { id: 'osd-set',      label: 'OS Deployment settings' },
      ] },
      { id: 'tools-set', label: 'Tools Settings', expanded: false, items: [
        { id: 'port-set',     label: 'Port Settings' },
        { id: 'sys-mgr-set',  label: 'System Manager Settings' },
      ] },
      { id: 'inv-set', label: 'Inventory Settings', expanded: false, items: [
        { id: 'scan-set',     label: 'Scan Settings' },
        { id: 'dev-privacy',  label: 'Device Privacy' },
        { id: 'geo-tracking', label: 'Geo tracking' },
      ] },
      { id: 'cfg-set', label: 'Configuration Settings', expanded: false, items: [
        { id: 'deploy-pol',   label: 'Deployment Policies' },
        { id: 'cfg-set-base', label: 'Configuration Settings' },
        { id: 'usb-audit',    label: 'USB Audit Settings' },
      ] },
      { id: 'audit', label: 'Audit', expanded: false, items: [
        { id: 'action-log',   label: 'Action Log Viewer' },
        { id: 'alerts',       label: 'Alerts' },
      ] },
      { id: 'reports-set', label: 'Reports', expanded: false, items: [
        { id: 'ad-rep-set',   label: 'AD Report Settings' },
      ] },
    ],
  },

  /* Browsers — 3 panels per L1 */
  browsers: {
    title: 'Browsers',
    l1Items: [
      { id: 'dashboard', label: 'Dashboard',        icon: 'add-widget',          active: true },
      { id: 'manage',    label: 'Manage',           icon: 'settings', l2Groups: [
        { id: 'manage', label: 'Manage', expanded: true, items: [
          { id: 'groups',    label: 'Groups & Computers', active: true },
          { id: 'web-group', label: 'Website Group' },
          { id: 'ext-repo',  label: 'Extension Repository' },
        ] },
      ] },
      { id: 'policies',  label: 'Policies',         icon: 'file-shield', l2Groups: [
        { id: 'policies', label: 'Policies', expanded: true, items: [
          { id: 'addon-mgmt',     label: 'Add-on Management', active: true },
          { id: 'file-act',       label: 'File Activity Restriction' },
          { id: 'threat-prev',    label: 'Threat Prevention' },
          { id: 'dlp',            label: 'Data Leakage Prevention' },
          { id: 'browser-custom', label: 'Browser Customization' },
          { id: 'browser-router', label: 'Browser Router' },
          { id: 'browser-lock',   label: 'Browser Lockdown' },
          { id: 'java-mgr',       label: 'Java Manager' },
          { id: 'web-filter',     label: 'Web Filter' },
          { id: 'web-iso',        label: 'Web Isolation' },
          { id: 'browser-restr',  label: 'Browser Restriction' },
        ] },
      ] },
      { id: 'insights',  label: 'Insights',         icon: 'bar-horizontal-chart', l2Groups: [
        { id: 'insights', label: 'Insights', expanded: true, items: [
          { id: 'dashboard',      label: 'Dashboard', active: true },
          { id: 'browsers',       label: 'Browsers' },
          { id: 'browser-addons', label: 'Browser Add-ons' },
          { id: 'computers',      label: 'Computers' },
          { id: 'web-activity',   label: 'Web Activity' },
          { id: 'scan-comp',      label: 'Scan Computers' },
          { id: 'sched-scan',     label: 'Schedule Scan' },
        ] },
      ] },
      { id: 'compliance',label: 'Compliance',       icon: 'checklist-01' },
      { id: 'addons',    label: 'Add-on settings',  icon: 'settings' },
    ],
    /* Default L2 — Manage panel */
    groups: [
      { id: 'manage', label: 'Manage', expanded: true, items: [
        { id: 'groups',    label: 'Groups & Computers', active: true },
        { id: 'web-group', label: 'Website Group' },
        { id: 'ext-repo',  label: 'Extension Repository' },
      ] },
      { id: 'policies', label: 'Policies', expanded: true, items: [
        { id: 'addon-mgmt',     label: 'Add-on Management' },
        { id: 'file-act',       label: 'File Activity Restriction' },
        { id: 'threat-prev',    label: 'Threat Prevention' },
        { id: 'dlp',            label: 'Data Leakage Prevention' },
        { id: 'browser-custom', label: 'Browser Customization' },
        { id: 'browser-router', label: 'Browser Router' },
        { id: 'browser-lock',   label: 'Browser Lockdown' },
        { id: 'java-mgr',       label: 'Java Manager' },
        { id: 'web-filter',     label: 'Web Filter' },
        { id: 'web-iso',        label: 'Web Isolation' },
        { id: 'browser-restr',  label: 'Browser Restriction' },
      ] },
      { id: 'insights', label: 'Insights', expanded: true, items: [
        { id: 'dashboard',   label: 'Dashboard' },
        { id: 'browsers',    label: 'Browsers' },
        { id: 'browser-addons', label: 'Browser Add-ons' },
        { id: 'computers',   label: 'Computers' },
        { id: 'web-activity',label: 'Web Activity' },
        { id: 'scan-comp',   label: 'Scan Computers' },
        { id: 'sched-scan',  label: 'Schedule Scan' },
      ] },
    ],
  },

  /* Application Control */
  'app-ctrl': {
    title: 'Application Control',
    hideL1: true,
    l1Items: [
      { id: 'dashboard', label: 'Dashboard',           icon: 'add-widget',     active: true },
      { id: 'manage',    label: 'Manage',              icon: 'settings' },
      { id: 'deploy',    label: 'Deployment',          icon: 'settings-deploy' },
      { id: 'priv-mgmt', label: 'Privilege Management',icon: 'shield-dollar' },
      { id: 'reports',   label: 'Reports',             icon: 'file-report' },
      { id: 'settings',  label: 'Settings',            icon: 'settings' },
    ],
    groups: [
      { id: 'overview', label: 'Overview', expanded: true, items: [
        { id: 'dashboard', label: 'Dashboard', active: true },
      ] },
      { id: 'manage', label: 'Manage', expanded: true, items: [
        { id: 'app-groups', label: 'Application Groups' },
        { id: 'child-proc', label: 'Child Process' },
      ] },
      { id: 'deployment', label: 'Deployment', expanded: true, items: [
        { id: 'deploy-pol', label: 'Deploy Policy' },
        { id: 'jit',        label: 'Just In Time Access' },
        { id: 'systems',    label: 'Systems View' },
      ] },
      { id: 'priv-mgmt', label: 'Privilege Management', expanded: true, items: [
        { id: 'priv-mgmt',   label: 'Privilege Management' },
        { id: 'remove-admin',label: 'Remove Admin Rights' },
      ] },
      { id: 'reports', label: 'Reports', expanded: true, items: [
        { id: 'reports', label: 'Reports' },
      ] },
      { id: 'settings', label: 'Settings', expanded: true, items: [
        { id: 'alert-set',   label: 'Alert Settings' },
        { id: 'auto-approve',label: 'Autonomous Approval' },
      ] },
    ],
  },

  /* Malware Protection */
  malware: {
    title: 'Malware Protection',
    l1Items: [
      { id: 'dashboard',     label: 'Dashboard',          icon: 'add-widget',     active: true },
      { id: 'incidents',     label: 'Incidents',          icon: 'bug' },
      { id: 'devices',       label: 'Devices',            icon: 'mobile' },
      { id: 'anti-ransom',   label: 'Anti-Ransomware',    icon: 'shield-dollar' },
      { id: 'antivirus',     label: 'Next-Gen Antivirus', icon: 'file-shield' },
      { id: 'settings',      label: 'Settings',           icon: 'settings', l2Groups: [
        { id: 'settings', label: 'Settings', expanded: true, items: [
          { id: 'exclusion',     label: 'Exclusion', active: true },
          { id: 'cleanup',       label: 'Cleanup Settings' },
          { id: 'notification',  label: 'Notification Settings' },
          { id: 'scan',          label: 'Scan Settings' },
          { id: 'addons',        label: 'Add-on Configurations' },
        ] },
      ] },
    ],
  },

  /* Endpoint DLP */
  dlp: {
    title: 'Endpoint DLP',
    hideL1: true,
    l1Items: [
      { id: 'dashboard',     label: 'Dashboard',           icon: 'add-widget',     active: true },
      { id: 'classify',      label: 'Data Classification', icon: 'file-folder' },
      { id: 'deploy',        label: 'Policy Deployment',   icon: 'settings-deploy' },
      { id: 'insights',      label: 'Insights',            icon: 'bar-horizontal-chart' },
    ],
    groups: [
      { id: 'overview', label: 'Overview', expanded: true, items: [
        { id: 'dashboard', label: 'Dashboard', active: true },
      ] },
      { id: 'policy', label: 'Policy', expanded: true, items: [
        { id: 'classify',   label: 'Data Classification' },
        { id: 'pol-deploy', label: 'Policy Deployment' },
      ] },
      { id: 'insights', label: 'Insights', expanded: true, items: [
        { id: 'email-audit', label: 'Sensitive Email Audit' },
        { id: 'file-audit',  label: 'Sensitive File Audit' },
        { id: 'override',    label: 'Override Audit' },
        { id: 'systems',     label: 'Systems' },
      ] },
    ],
  },

  /* BitLocker Management */
  bitlocker: {
    title: 'BitLocker Management', titleAr: 'إدارة BitLocker',
    hideL1: true,
    l1Items: [
      { id: 'dashboard',  label: 'Dashboard',          labelAr: 'لوحة المعلومات',   icon: 'add-widget',     active: true },
      { id: 'pol-create', label: 'Policy Creation',    labelAr: 'إنشاء السياسة',     icon: 'edit' },
      { id: 'pol-deploy', label: 'Policy Deployment',  labelAr: 'نشر السياسة',       icon: 'settings-deploy' },
      { id: 'insights',   label: 'Insights',           labelAr: 'رؤى',               icon: 'bar-horizontal-chart' },
      { id: 'reports',    label: 'Reports',            labelAr: 'التقارير',          icon: 'file-report' },
      { id: 'recovery',   label: 'Recovery Key',       labelAr: 'مفتاح الاسترداد',   icon: 'encryption-lock' },
    ],
    /* `view` on an item → the CONTENT_VIEWS slug the shell opens on select
       (see Shell.html ds-sidebar-l2-select wiring). Items without a view are
       not-yet-built placeholders. `labelAr` → Arabic label (applyL2For, RTL). */
    groups: [
      { id: 'overview', label: 'Overview', labelAr: 'نظرة عامة', expanded: true, items: [
        { id: 'dashboard', label: 'Dashboard', labelAr: 'لوحة المعلومات', view: 'bitlocker-dashboard', active: true },
      ] },
      { id: 'policies', label: 'Policies', labelAr: 'السياسات', expanded: true, items: [
        { id: 'pol-create', label: 'Policy Creation', labelAr: 'إنشاء السياسة', view: 'bitlocker-policy-creation' },
        { id: 'pol-deploy', label: 'Policy Deployment', labelAr: 'نشر السياسة' },
      ] },
      { id: 'insights', label: 'Insights', labelAr: 'رؤى', expanded: true, items: [
        { id: 'managed-computers', label: 'Managed Computers', labelAr: 'الأجهزة المُدارة', view: 'bitlocker-managed-systems' },
        { id: 'prereq',           label: 'Encryption Prerequisites', labelAr: 'متطلبات التشفير' },
      ] },
      { id: 'reports', label: 'Reports', labelAr: 'التقارير', expanded: true, items: [
        { id: 'bl-activity', label: 'BitLocker Activity Report', labelAr: 'تقرير نشاط BitLocker', view: 'bitlocker-activity-report' },
        { id: 'tpm-rep',     label: 'TPM Reports', labelAr: 'تقارير TPM' },
      ] },
      { id: 'recovery', label: 'Recovery Key', labelAr: 'مفتاح الاسترداد', expanded: true, items: [
        { id: 'retrieve', label: 'Retrieve Recovery Key', labelAr: 'استرجاع مفتاح الاسترداد' },
      ] },
    ],
  },

  /* Device Control — 4 panels per L1 */
  'dev-ctrl': {
    title: 'Device Control',
    l1Items: [
      { id: 'dashboard', label: 'Dashboard', icon: 'add-widget',     active: true },
      { id: 'policies',  label: 'Policies',  icon: 'file-shield', l2Groups: [
        { id: 'policies', label: 'Policies', expanded: true, items: [
          { id: 'pol-create',  label: 'Policy Creation', active: true },
          { id: 'deploy-pol',  label: 'Deploy Policy' },
          { id: 'trusted',     label: 'Trusted Devices' },
          { id: 'temp-access', label: 'Temporary Access' },
        ] },
      ] },
      { id: 'insights',  label: 'Insights',  icon: 'bar-horizontal-chart', l2Groups: [
        { id: 'insights', label: 'Insights', expanded: true, items: [
          { id: 'managed',     label: 'Managed Computers', active: true },
          { id: 'summary',     label: 'Device Summary' },
          { id: 'status',      label: 'Device Status by Computer' },
          { id: 'by-type',     label: 'Computers by Device Type' },
          { id: 'recovery',    label: 'Retrieve Recovery Key' },
        ] },
        { id: 'temp-status', label: 'Temporary Access Status', expanded: true, items: [
          { id: 'dev-exempt',  label: 'Device Exemptions' },
          { id: 'type-exempt', label: 'Device Type Exemptions' },
        ] },
      ] },
      { id: 'reports',   label: 'Reports',   icon: 'file-report', l2Groups: [
        { id: 'reports', label: 'Reports', expanded: true, items: [
          { id: 'dev-audit',    label: 'Device Audit', active: true },
          { id: 'blocked',      label: 'Blocked Devices' },
          { id: 'file-tracing', label: 'File Tracing' },
          { id: 'file-shadow',  label: 'File Shadowing' },
        ] },
      ] },
      { id: 'settings',  label: 'Settings',  icon: 'settings', l2Groups: [
        { id: 'settings', label: 'Settings', expanded: true, items: [
          { id: 'audit-set',  label: 'Audit Settings', active: true },
          { id: 'alert-set',  label: 'Alert Settings' },
          { id: 'ext-grp',    label: 'Extension Grouping' },
        ] },
      ] },
    ],
    /* Default L2 — Policies panel */
    groups: [
      { id: 'policies', label: 'Policies', expanded: true, items: [
        { id: 'pol-create',  label: 'Policy Creation', active: true },
        { id: 'deploy-pol',  label: 'Deploy Policy' },
        { id: 'trusted',     label: 'Trusted Devices' },
        { id: 'temp-access', label: 'Temporary Access' },
      ] },
    ],
  },

  /* Reports */
  reports: {
    title: 'Reports',
    hideL1: true,
    groups: [
      { id: 'user-def', label: 'User-defined Reports', expanded: true, items: [
        { id: 'sched',       label: 'Schedule Reports', active: true },
        { id: 'custom-rep',  label: 'Custom Reports' },
        { id: 'custom-dash', label: 'Custom Dashboards' },
        { id: 'query',       label: 'Query Reports' },
      ] },
      { id: 'ad', label: 'Active Directory', expanded: true, items: [
        { id: 'user-rep',     label: 'User Reports' },
        { id: 'computer-rep', label: 'Computer Reports' },
        { id: 'group-rep',    label: 'Group Reports' },
        { id: 'ou-rep',       label: 'OU Reports' },
        { id: 'domain-rep',   label: 'Domain Reports' },
        { id: 'gpo-rep',      label: 'GPO Reports' },
      ] },
      { id: 'other', label: 'Other Reports', expanded: true, items: [
        { id: 'logon-rep',  label: 'User Logon Reports' },
        { id: 'power-rep',  label: 'Power Management Reports' },
        { id: 'cfg-rep',    label: 'Configuration Reports' },
        { id: 'tp-rep',     label: 'Threats & Patches Reports' },
        { id: 'ssp-rep',    label: 'Self Service Portal Reports' },
        { id: 'inv-rep',    label: 'Inventory Reports' },
        { id: 'browser-rep',label: 'Browser Reports' },
        { id: 'dc-rep',     label: 'Device Control Reports' },
        { id: 'dlp-rep',    label: 'DLP Reports' },
        { id: 'mp-rep',     label: 'Malware Protection Reports' },
        { id: 'ac-rep',     label: 'Application Control Reports' },
        { id: 'bl-rep',     label: 'BitLocker Reports' },
        { id: 'usb-rep',    label: 'USB Reports' },
        { id: 'grp-rep',    label: 'Custom Groups Reports' },
        { id: 'mdm-rep',    label: 'MDM Reports' },
      ] },
    ],
  },

  /* DEX */
  dex: {
    title: 'DEX',
    /* L2 grouped sidebar (bitlocker-style): hideL1 + `groups`, so applyL2For renders
       the grouped L2 list and hides the L1 rail. Each item's `view` is the
       CONTENT_VIEWS slug the shell routes to on ds-sidebar-l2-select; drill-down
       pages (detail/create/builder) carry `nav:` in the catalog so their list parent
       stays highlighted. Every DEX page is now reachable from the sidebar. */
    hideL1: true,
    groups: [
      { id: 'overview', label: 'Overview', expanded: true, items: [
        { id: 'dex-overview', label: 'Digital experience', view: 'dex-overview', active: true },
        { id: 'dashboards',   label: 'Dashboards',         view: 'dashboards' },
        { id: 'reports',      label: 'Reports',            view: 'reports' },
      ] },
      { id: 'devices', label: 'Devices & experience', expanded: true, items: [
        { id: 'devices',   label: 'Devices',             view: 'dex-devices' },
        { id: 'insights',  label: 'Experience insights', view: 'experience-insights' },
        { id: 'telemetry', label: 'Live telemetry',      view: 'live-telemetry' },
        { id: 'remote',    label: 'Remote actions',      view: 'remote-actions' },
      ] },
      { id: 'monitoring', label: 'Monitoring', expanded: true, items: [
        { id: 'alerts',         label: 'Alerts',         view: 'alerts' },
        { id: 'alert-profiles', label: 'Alert profiles', view: 'alert-profile-detail' },
      ] },
      { id: 'automation', label: 'Automation', expanded: true, items: [
        { id: 'sensors',     label: 'Sensors',     view: 'sensors' },
        { id: 'scripts',     label: 'Scripts',     view: 'script-detail' },
        { id: 'workflows',   label: 'Workflows',   view: 'workflows' },
        { id: 'deployments', label: 'Deployments', view: 'dex-deployments' },
      ] },
      { id: 'catalog', label: 'Catalog', expanded: true, items: [
        { id: 'extensions', label: 'Extensions', view: 'extensions' },
      ] },
      { id: 'assistant', label: 'AI', expanded: true, items: [
        { id: 'ai-assistant', label: 'AI assistant', view: 'ai-assistant' },
        { id: 'ai-settings',  label: 'AI settings',  view: 'ai-settings' },
      ] },
      { id: 'config', label: 'Configuration', expanded: true, items: [
        { id: 'settings', label: 'Settings', view: 'settings' },
      ] },
    ],
  },

};

/* Convenience helper for shells:
     applyL2For(shellL1, shellL2, tabId)
   - 'home' → hides both L1 and L2
   - tab with a menu config → sets L1 items; sets L2 from the active L1 item's
     `l2Groups` if present, else falls back to cfg.groups, else hides L2
   - tab with no config → leaves shells alone */
/* Toggle hide via the `is-hidden` CSS class so the host page can animate
   the transition (max-width + opacity). Falls back to display:none style if
   the class system isn't wired (graceful degradation). */
function setHidden(el, hide) {
  if (!el) return;
  el.classList.toggle('is-hidden', !!hide);
  el.style.display = '';
}

/* Localize a menu label/item to Arabic when requested — uses the `labelAr`
   field if present, else falls back to the English `label`. Backward-compatible:
   modules without `labelAr` stay English. Clones (never mutates the shared cfg). */
/* Resolve one nav item's label for the active language: the central label catalog
   (window.UEMSNavLabels[lang] = English → string, sourced from EC via
   build-nav-labels.mjs), then the legacy inline labelAr for Arabic, then English. */
function _locLabel(item, lang) {
  const en = item.label;
  const map = (typeof window !== 'undefined' && window.UEMSNavLabels && window.UEMSNavLabels[lang]) || null;
  if (map && map[en] != null) return map[en];
  if (lang === 'ar' && item.labelAr) return item.labelAr;
  return en;
}
function _locItems(items, lang) {
  if (lang === 'en' || !Array.isArray(items)) return items;
  return items.map((it) => ({
    ...it,
    label: _locLabel(it, lang),
    items: it.items ? _locItems(it.items, lang) : it.items,
    l2Groups: it.l2Groups ? _locGroups(it.l2Groups, lang) : it.l2Groups,
  }));
}
function _locGroups(groups, lang) {
  if (lang === 'en' || !Array.isArray(groups)) return groups;
  return groups.map((g) => ({ ...g, label: _locLabel(g, lang), items: _locItems(g.items, lang) }));
}

export function applyL2For(shellL1, shellL2, tabId, lang) {
  const cfg = EC_TAB_L2_MENUS[tabId];
  const isHome = tabId === 'home';
  const hideL1 = isHome || (cfg && cfg.hideL1);

  setHidden(shellL1, hideL1);
  if (shellL1 && cfg && cfg.l1Items && !hideL1) {
    shellL1.items = _locItems(cfg.l1Items, lang);
    shellL1.bottomItems = _locItems(cfg.l1Bottom, lang) || [];
  }

  /* Pick L2 groups based on the active L1 item (if any). */
  let l2Groups = null;
  if (cfg) {
    const activeItem = (cfg.l1Items || []).find((it) => it.active);
    if (activeItem && Array.isArray(activeItem.l2Groups) && activeItem.l2Groups.length) {
      l2Groups = activeItem.l2Groups;
    } else if (!activeItem || cfg.hideL1) {
      l2Groups = cfg.groups || null;
    }
  }
  const hideL2 = isHome || !l2Groups;

  setHidden(shellL2, hideL2);
  if (shellL2 && l2Groups && !hideL2) shellL2.groups = _locGroups(l2Groups, lang);
  if (shellL2) {
    shellL2.removeAttribute('title');
    shellL2.removeAttribute('show-back');
    shellL2.setAttribute('show-search', 'false');
  }
}

/* Wire L1 item selection → L2 panel swap. When an L1 item carries an
   `l2Groups` array (multi-panel modules), clicking that item swaps the L2.
   If the selected L1 item has NO l2Groups, the L2 panel hides entirely. */
export function wireL1ToL2(shellL1, shellL2) {
  if (!shellL1 || !shellL2) return;
  shellL1.addEventListener('ds-sidebar-l1-select', (e) => {
    const item = e.detail?.item;
    if (!item) return;
    if (Array.isArray(item.l2Groups) && item.l2Groups.length) {
      shellL2.groups = item.l2Groups;
      setHidden(shellL2, false);
    } else {
      setHidden(shellL2, true);
    }
  });
}
