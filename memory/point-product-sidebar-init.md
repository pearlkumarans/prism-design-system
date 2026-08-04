---
name: point-product-sidebar-init
description: How point products load their L1/L2 sidebar at init in Shell.html, and the rAF-at-init gotcha
metadata:
  type: reference
---

**Point products (`?product=<id>`) land on their primary module tab so the sidebar loads.**
Shell.html init calls `selectTab('home')` first, then opens a module only if there's a `?view` or the
product declares a `defaultView`. Products WITHOUT a defaultView (mdm, bsp, acp, dcp, dlp, mpp, osd,
rap, dxm, …) previously stayed on Home → no L1/L2 sidebar. Fix (in `openView` init block): a final
`else if (!_view && !_validTab && _prod.tabs)` selects `_prod.tabs.find(id => id !== 'home')`. Every
product tab already has an L2 menu in `design-system-library/src/data/ec-menus.js` (`EC_TAB_L2_MENUS`), so `selectTab`
+ `applyL2For` populate the rail. EC (`tabs: null`) intentionally stays on Home.

**Two gotchas that cost time here:**
1. **Don't reuse the module-scope `_tab` for the primary tab** — `selectTab(id)` sets `_tab = id`, so
   the `selectTab('home')` call at init clobbers `_tab` to `'home'` before the branch runs. Recompute
   `_prod.tabs.find(id => id !== 'home')` inline.
2. **`requestAnimationFrame` does NOT fire in the preview/background tab.** `customElements.whenDefined(x)`
   resolves, but a `requestAnimationFrame(() => …)` inside its `.then` never runs when the page isn't
   actively painting (headless/preview). The `defaultView` path works because it calls `openView`
   directly (no rAF). So at init, call `selectTab(...)` **directly** in the `.then`, not wrapped in rAF.
   (The old `#leftnav-<tab>` preview hash-hook still wraps in rAF — that's why it can look flaky in the
   preview.)

**Landing selects the FIRST menu item** (`landOnFirstMenuItem()` in Shell.html, called right after
`selectTab(primaryTab)` in the product-landing branch): if the L1 rail is visible → first L1 item is
made active (and if that item carries `l2Groups`, L2 is shown with its first sub-item active); if the
module is `hideL1` → the first L2 group's first item is made active. Reads the LIVE `l1El.items` /
`l2El.groups` that `applyL2For` populated (the shell only imports `applyL2For`/`wireL1ToL2`, not the raw
`EC_TAB_L2_MENUS`), and clones before reassigning so the sidebar components re-render. Verified: mdm (L1)
→ Dashboard; acp (hideL1) → L2 Dashboard with full L2 rail; EC (tabs:null) unaffected, stays on Home.

L2 note: a product whose first L1 item is a Dashboard with no `l2Groups` (mdm, dcp) shows L1 only until an
L1 item with sub-nav (Management, Policies) is clicked — by design.
