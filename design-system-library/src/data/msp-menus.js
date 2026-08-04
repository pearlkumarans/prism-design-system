/* =============================================================================
   MSP Central — top-level PRODUCTS + per-product module/L1/L2 wiring.

   The MSP Central shell is a 4-tier navigation:
     Tier 1  Products  → header-nav tabs   (Home · Endpoints · Network & Servers · HelpDesk)
     Tier 2  Modules   → icon module rail   (per active product)
     Tier 3  L1        → ds-sidebar-l1       (per active module)
     Tier 4  L2        → ds-sidebar-l2       (per active L1 item)

   Endpoints reuses Endpoint Central's existing menu tree (ec-menus.js) verbatim;
   Network & Servers (ITOM) and HelpDesk (SDP) use stub IA files for now.
   ============================================================================= */

import { EC_TAB_L2_MENUS, wireL1ToL2 } from './ec-menus.js';
import { ITOM_MENUS, ITOM_MODULES } from './itom-menus.js';
import { SDP_MENUS, SDP_MODULES } from './sdp-menus.js';
import { SIEM_MENUS, SIEM_MODULES } from './siem-menus.js';

/* Re-export the generic L1→L2 wiring (it reads each L1 item's own l2Groups, so
   it is product-agnostic and works unchanged for MSP Central). */
export { wireL1ToL2 };

/* ── Tier 1 — products shown as header-nav tabs ─────────────────────────────
   Labels are the MSP-facing names; the underlying product is noted in comments. */
export const MSP_PRODUCTS = [
  { id: 'home',       label: 'Home',              labelAr: 'الرئيسية',        active: true },
  { id: 'endpoints',  label: 'Endpoints',         labelAr: 'النقاط الطرفية' },  /* Endpoint Central */
  { id: 'netservers', label: 'Network & Servers', labelAr: 'الشبكة والخوادم' },/* ITOM / OpManager */
  { id: 'helpdesk',   label: 'HelpDesk',          labelAr: 'مكتب المساعدة' },   /* ServiceDesk Plus */
  { id: 'siem',       label: 'SIEM',              labelAr: 'SIEM' },            /* Log360 */
];

/* Endpoints' icon module rail — the FULL Endpoint Central module set. Labels +
   icons mirror the EC shell's TABS / TAB_ICON maps so the rail matches EC
   exactly. Modules without an EC_TAB_L2_MENUS entry simply render no L1/L2. */
const EC_MODULES = [
  { id: 'configs',   label: 'Configurations',      labelAr: 'التكوينات',                  icon: 'settings-custom' },
  { id: 'tp',        label: 'Threats & Patches',   labelAr: 'التهديدات والتصحيحات',      icon: 'patch' },
  { id: 'sd',        label: 'Software Deployment', labelAr: 'نشر البرامج',                icon: 'software' },
  { id: 'inv',       label: 'Inventory',           labelAr: 'المخزون',                    icon: 'layers' },
  { id: 'osd',       label: 'OS Deployment',       labelAr: 'نشر نظام التشغيل',           icon: 'disk' },
  { id: 'mdm',       label: 'MDM',                 labelAr: 'إدارة الأجهزة المحمولة',     icon: 'mobile-devices' },
  { id: 'tools',     label: 'Tools',               labelAr: 'الأدوات',                    icon: 'service' },
  { id: 'agent',     label: 'Agent',               labelAr: 'الوكيل',                     icon: 'computer' },
  { id: 'browsers',  label: 'Browsers',            labelAr: 'المتصفحات',                  icon: 'globe' },
  { id: 'app-ctrl',  label: 'Application Control', labelAr: 'التحكم بالتطبيقات',          icon: 'layout-grid' },
  { id: 'malware',   label: 'Malware Protection',  labelAr: 'الحماية من البرامج الضارة',  icon: 'shield' },
  { id: 'dlp',       label: 'Endpoint DLP',        labelAr: 'منع تسرّب البيانات',         icon: 'file-shield' },
  { id: 'bitlocker', label: 'BitLocker Management',labelAr: 'إدارة BitLocker',            icon: 'encryption-lock' },
  { id: 'dev-ctrl',  label: 'Device Control',      labelAr: 'التحكم بالأجهزة',            icon: 'device-control' },
  { id: 'reports',   label: 'Reports',             labelAr: 'التقارير',                   icon: 'bar-vertical-chart' },
  { id: 'support',   label: 'Support',             labelAr: 'الدعم',                      icon: 'help-circle' },
  { id: 'dex',       label: 'DEX',                 labelAr: 'DEX',                        icon: 'speedometer' },
];

/* ── Tier 2 — per-product config: the module rail + the menu map that drives
   L1/L2, plus the module the product lands on. `home` is the overview (no rail). */
export const MSP_PRODUCT_CONFIG = {
  home:       { home: true, modules: [],           menus: null },
  endpoints:  { modules: EC_MODULES,   menus: EC_TAB_L2_MENUS, defaultModule: 'tp' },
  netservers: { modules: ITOM_MODULES, menus: ITOM_MENUS,      defaultModule: 'monitors' },
  helpdesk:   { modules: SDP_MODULES,  menus: SDP_MENUS,       defaultModule: 'requests' },
  siem:       { modules: SIEM_MODULES, menus: SIEM_MENUS,      defaultModule: 'incidents' },
};

/* Toggle hide via the `is-hidden` class (same contract as ec-menus' setHidden),
   so the shell can animate the transition if it wants. */
function setHidden(el, hide) {
  if (!el) return;
  el.classList.toggle('is-hidden', !!hide);
  el.style.display = '';
}

/* ── RTL localization — swap `label` for `labelAr` when lang==='ar', else keep
   English (same contract as ec-menus' _locItems/_locGroups). Non-mutating. ── */
function locItems(items, lang) {
  if (lang !== 'ar' || !Array.isArray(items)) return items;
  return items.map((it) => ({ ...it, label: it.labelAr || it.label }));
}
function locGroups(groups, lang) {
  if (lang !== 'ar' || !Array.isArray(groups)) return groups;
  return groups.map((g) => ({ ...g, label: g.labelAr || g.label, items: locItems(g.items, lang) }));
}

/* Product tabs, localized for the header-nav. */
export function mspProducts(lang) {
  return locItems(MSP_PRODUCTS, lang);
}

/* Apply a product's active module to the shell rails: populate L1 from the
   module's l1Items, and L2 from the module's active (or first) L1 item's
   l2Groups. Mirrors ec-menus' applyL2For but parameterised on any menu map. */
export function applyMspModule(shellL1, shellL2, menus, moduleId, lang) {
  const cfg = menus && menus[moduleId];
  const hideL1 = !cfg || !!cfg.hideL1 || !Array.isArray(cfg.l1Items);

  setHidden(shellL1, hideL1);
  if (shellL1 && cfg && Array.isArray(cfg.l1Items) && !hideL1) {
    shellL1.items = locItems(cfg.l1Items, lang);
    shellL1.bottomItems = locItems(cfg.l1Bottom, lang) || [];
  }

  /* L2 groups: prefer the active L1 item's own l2Groups; otherwise (no active
     item, or the module hides its L1 rail) fall back to the module's top-level
     `groups`. This mirrors ec-menus' applyL2For exactly, so EC modules that use
     the `hideL1 + groups` pattern (configs, sd, inv, osd, agent, app-ctrl, dlp,
     bitlocker, reports, admin) show their L2 just like in Shell.html. */
  let l2Groups = null;
  if (cfg) {
    const activeItem = (cfg.l1Items || []).find((it) => it.active);
    if (activeItem && Array.isArray(activeItem.l2Groups) && activeItem.l2Groups.length) {
      l2Groups = activeItem.l2Groups;
    } else if (!activeItem || cfg.hideL1) {
      l2Groups = cfg.groups || null;
    }
  }

  const hideL2 = !l2Groups;
  setHidden(shellL2, hideL2);
  if (shellL2 && l2Groups && !hideL2) shellL2.groups = locGroups(l2Groups, lang);
  if (shellL2) {
    shellL2.setAttribute('show-search', 'false');
    shellL2.removeAttribute('title');
    shellL2.removeAttribute('show-back');
  }
}

/* Populate the module rail for a product (icon-only) with the first/default
   module active. Returns the id of the module that ended up active. */
export function applyMspRail(railEl, productId, lang) {
  const cfg = MSP_PRODUCT_CONFIG[productId];
  if (!railEl || !cfg) return null;
  const modules = locItems(cfg.modules || [], lang);
  const activeId = cfg.defaultModule || (modules[0] && modules[0].id) || null;
  railEl.items = modules.map((m) => ({ ...m, active: m.id === activeId }));
  return activeId;
}
