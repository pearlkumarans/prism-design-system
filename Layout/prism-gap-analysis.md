# Prism Gap Analysis — what's needed to ship `layouts.md`

> Companion to `layouts.md` v1.3. This file lists every component the page-layout spec needs that Prism doesn't yet ship, mapped to Prism's remaining "in-progress" categories (`Cards · Widgets · KPIs · Popovers`) or flagged as net-new.

## Summary

The 22 page layouts in `layouts.md` use:

- **38 Prism components that exist today** — directly referenced (Page header, Sidebar Nav L1/L2, Tab Bars, Data table, **Modal**, **Confirmation Modal**, Fullscreen Modal, **Menu**, **Dropdown menu**, Empty state, **Right pane** — which now hosts Quick Links — and more).
- **~11 true component gaps** — items that need genuinely new visual or interaction work to land in Prism (see §1).
- **~16 composition patterns** — items that look like missing components but are actually assemblies of existing Prism atoms; they need pattern documentation, not new components (see §2).

**Recently resolved (formerly gaps):**

- **Dialogs** category → Prism now ships **Modal** (default) and **Confirmation Modal**.
- **Menus** category → Prism now ships **Menu** and **Dropdown menu**.
- **Quick links footer** → folded into **Right pane** (no longer a separate page primitive).
- **Bulk action bar** and **Filter sidebar** → composed from existing **Menu** / **Button** / **Counter** / **Checkbox**; documented as patterns.
- **Form section · Form footer · Wizard footer · Activity feed · Score banner · Key-value group · Checklist group · Benefit list · Branded hero · Setup step list · Link section · Variable token panel · Icon picker · Legend** → all reclassified as composition patterns (they assemble from existing Prism atoms — no new component work).

The remaining true gaps cluster around three areas: **dashboards** (KPI tile, Chart card), **catalog surfaces** (Catalog card, Add tile, Info card), and **specialty workflows** (Stepper, Dual-list panel, Map canvas, Diagram canvas, Config panel, Preview pane, Canvas, Node palette).

## 1. True component gaps (need new Prism specs)

These items need genuine visual or interaction work in Prism. Layouts that depend on them should either wait for the component or use the §8.2 placeholder recipe in `layouts.md`.

### High priority — block Tier 1 layouts (L02, L03, L04, L08)

| Gap component | Used in | Maps to Prism category | Effort hint |
|---|---|---|---|
| **Stepper** (horizontal + vertical) | L08 | New (suggest `specs/molecules/stepper.md`) | Medium — two layouts + state model |
| **KPI tile** | L02, L03, L04 | **KPIs** (in-progress) | Medium — design + variants + skeleton |
| **Chart card** | L02 | **Widgets** (in-progress) | High — donut · bar · gauge · heatmap variants |

### Medium priority — block Tier 2 layouts (L11, L12, L14)

| Gap component | Used in | Maps to Prism category | Effort hint |
|---|---|---|---|
| **Catalog card** | L12, L18 | **Cards** (in-progress) | Medium |
| **Add tile** | L12 | **Cards** (variant of Catalog card) | Low |
| **Info card** | L05, L14 | **Cards** (hosted inside Right pane) | Low |
| **Dual-list panel** + **Transfer controls** | L11 | New (suggest `specs/organisms/dual-list-picker.md`) | Medium |

### Low priority — Tier 3 specialty (L17–L20)

Domain-specific surfaces; ship when the matching workflow needs to land.

| Gap component | Used in | Maps to Prism category | Effort hint |
|---|---|---|---|
| **Map canvas** | L17 | New (third-party wrapper) | Medium |
| **Diagram canvas** | L18 | New | Medium |
| **Config panel** + **Preview pane** | L19 | New | High |
| **Canvas** + **Node palette** | L20 | New | High |

## 2. Composition patterns (no new Prism components needed)

These look like missing components but are actually compositions over existing Prism atoms. They need pattern documentation, not new specs. Detailed recipes are in `layouts.md §8.1`.

| Pattern | Used in | Composed from |
|---|---|---|
| **Form section** | L06, L07, L08, L10 | Heading + **Divider** + Text field / Text area / Dropdown / Checkbox / Radio button / Switch / Slider / Date picker / Calendar / OTP input / Script editor + Inline message |
| **Form footer** | L06, L07, L10, L11, L21 | Sticky bar + **Button** group |
| **Wizard footer** | L08 | Form footer variant for wizard nav (`Cancel` · `Previous` · `Next` / `Finish` / `Save as Draft`) |
| **Bulk action bar** | L03 | **Counter** + **Button** group + **Menu** / **Dropdown menu** + **Link** |
| **Filter sidebar** | L03 variant B | **Menu** + **Checkbox** + **Counter** + **Link** |
| **Quick Links group** | L02, L03, L05 (in Right pane) | Heading + **Divider** + **Link** stack |
| **Activity feed** | L02 (in Right pane) | **Avatar** + text + timestamp rows + **Divider** day groupings |
| **Key-value group** | L05 | Label / value grid; **Status indicator** or **Badges** for state |
| **Key-value strip** | L15 | Horizontal label / value pairs with vertical **Divider** |
| **Score banner** | L16 | **Progress bar** + headline + summary text |
| **Checklist group / row** | L16 | Label + **Status indicator** + `Modify` **Button** |
| **Benefit list** | L13, L14 | **Icon** + heading + supporting text rows |
| **Branded hero** | L14 | Logo + headline + **Button** + secondary **Link** |
| **Setup step list** | L14 | Numbered cards with **Icon** + title + description + per-step **Button** |
| **Link section** | L22 | Section heading + **Divider** + **Link** stack |
| **Variable token panel** | L21 (in Right pane) | Heading + **Divider** + **Tag** chip list |
| **Icon picker** | L21 | **Modal** (sm) + **Text field** search + **Icon** grid |
| **Legend** | L18 | **Tag** chips + caption text |

## Existing Prism components that may need extension

These exist but need small extensions to fully serve the page layouts.

| Prism component | Extension needed | For |
|---|---|---|
| **Page header** | Inline editable name **Text field** variant; record-context variant with **Avatar** + **Status indicator** | L04, L06, L08, L20, L21 |
| **Data table** | Documented states for: skeleton loading, sticky header, in-row hover actions, empty body using **Empty state**, bulk-action header (used with the inline-composed Bulk action bar) | L03, L15, all list surfaces |
| **Tab Bar Vertical** | Verify counts ≥6 categories don't break responsive behavior | L07 vertical variant |
| **Right pane** | Document the Quick Links group variant (heading + Divider + Link list); confirm drawer variant that slides over content | L02/L03/L05 Quick Links; L17 marker detail; L20 node inspector |
| **Inline message** | Page-level full-width banner variant (vs. inline-only) | All layouts' `SystemBanner` / `PageBanner` slots |
| **Snackbar** | Undo action chip with timer per Prism confirmation pattern (Low severity) | L03/L04/L05 destructive actions |
| **Menu** / **Dropdown menu** | Bulk-action overflow variant; checkbox-with-counter list variant for use as a Filter sidebar | L03 Bulk action bar; L03 Filter sidebar |
| **Modal** *(default)* | Confirm width tiers (sm 480 / md 640 / lg 880) and per-tier use cases | L09 short forms · detail viewers · simple pickers |

## Net-new categories worth adding to Prism

Some true gaps don't fit Prism's published in-progress list cleanly. Consider naming these as new categories under `specs/`:

| Suggested category | Rationale | Initial members |
|---|---|---|
| `Form primitives` | Form-level state machines (not inputs themselves) | Stepper |
| `Builder surfaces` | Specialty editing canvases | Config panel, Preview pane, Canvas, Node palette |
| `Map / Diagram` | Visual canvases for non-form content | Map canvas, Diagram canvas |

## Suggested phasing

Build the true gaps in this order to unlock page layouts cleanly. Composition patterns can be documented in parallel — they don't block the component roadmap.

1. **Stepper** — unlocks L08 wizards across the product.
2. **KPI tile + Chart card** (Prism KPIs and Widgets in-progress categories) — unlocks L02 dashboards and the optional KPI rows in L03, L04.
3. **Card family** — Catalog card · Add tile · Info card. Unlocks L05, L12, L14, L18.
4. **Dual-list panel + Transfer controls** — unlocks L11 dual-list pickers.
5. **Specialty surfaces** — Map canvas · Diagram canvas · Config panel · Preview pane · Canvas · Node palette. Ship as the matching workflows land (L17–L20).

Phases 1–3 cover ~85 % of the 198-screen sample.

## Unused Prism components

Components that exist in Prism but aren't named as page-level slots in `layouts.md`. They're still used — slotted inside `Form section`, table cells, or page header actions — but the page-layout spec doesn't headline them.

`Avatar · Accordion · Badges · Button · Calendar · Checkbox · Counter · Date picker · Divider · Dropdown · Dropdown menu · Icon · Link · Menu · OTP input · Progress bar · Radio button · Script editor · Slider · Split button · Status indicator · Switch · Tag · Text area · Text field · Tooltip · Zia Experience`

`Zia Experience` is the AI-assistant surface — slot it as a **Right pane** variant or floating launcher case by case; not a default page slot.

`Menu` and `Dropdown menu` are used inside the inline-composed Bulk action bar (L03) and Filter sidebar (L03 variant B), but aren't called out as standalone page-layout slots since they appear inside other primitives.
