---
name: nav-wiring-and-menu-conventions
description: How to treat left-nav menus and nav wiring when building Prism shell pages
metadata:
  type: feedback
---

Two standing rules for building pages in the Prism Endpoint-Central shell (Layout/Shell.html):

1. **Don't remove or rename existing product menu items to fit a page.** The L1/L2 menu in
   `design-system-library/src/data/ec-menus.js` mirrors the real Endpoint Central product IA. Leave real items in
   place as placeholders (no `view`) even if their page isn't built yet, and add `view` to the
   closest matching item (or add a new item). Removing them loses product fidelity. (User called
   this out after I dropped `Insights > Managed Computers` and expected `Encryption Prerequisites`.)

2. **Nav wiring is default work, not an extra.** Registering a view in `CONTENT_VIEWS` only makes
   it routable — a page isn't done until it's *reachable*: add `view:` to the matching L2 item and
   wire the breadcrumb (real href + click interceptor → openContentView). This is now documented as
   Step 4b in the generate-layout skill. Verify nav actually navigates before calling a page done.

**Why:** the shell IS the product surface; a page nobody can click to, or a menu that no longer
matches the product, reads as broken. See [[bitlocker-module-build]] for the concrete wiring pattern
(ds-sidebar-l2-select handler + syncL2Active in Shell.html; crumbNav interceptor per page).
