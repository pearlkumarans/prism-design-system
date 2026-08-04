# L07 — Tabbed Form / Settings

**Demo:** `Layout/views/layout-tabbed-form.html` · standalone + `Shell.html?view=tabbed-form`
**Taxonomy:** `Layout/layouts.md` → L07
**Built on:** L06 (`layout-sectioned-form.html`) — same section + field conventions.

Group related settings into top-level categories. Use when settings fall into
distinct categories (≤ 5 → horizontal tabs; > 5 → vertical sub-nav variant).

## Anatomy

```
ds-content (main)
└── .lay (height:100%, flex column)
    ├── ds-page-header               title "Configuration Settings" + breadcrumb + description
    ├── .lay__tabs                   ds-tab-bar-horizontal (type="underline") — full-width divider under
    ├── .lay__scroll (flex:1)
    │   ├── .lay__panel[general]     Identity (name, description) · Status (radio)
    │   ├── .lay__panel[deployment]  Policy (select, retry) · Schedule (select)   [hidden]
    │   ├── .lay__panel[notifications] Alerts (checkbox-group, recipients)         [hidden]
    │   └── .lay__panel[advanced]    Performance (throttle, script)               [hidden]
    └── ds-form-footer (sticky)      "All changes saved" · Cancel (outline) · Save (primary)
```

## Slot → component (delta from L06)

Everything reuses L06's mapping (ds-section-header `with-border`, component-native
`label-position="left"` medium fields, sticky `ds-form-footer`). L07 adds:

| Region | Component | Key attrs |
|---|---|---|
| Category tabs (≤5) | `ds-tab-bar-horizontal` | top; `type="underline"`, `active-id`, `.items`, emits `ds-tab-change` |
| Category sub-nav (>5) | `ds-tab-bar-vertical` | fixed-width left column; same API |
| Tab panels | `.lay__panel[data-panel]` | one per category; `hidden` toggled on `ds-tab-change` |

**Adaptive layout:** the view picks the tab bar by category count — `TABS.length > 5`
→ vertical left sub-nav (`.lay[data-tabs="vertical"]`), else horizontal top tabs. Both
tab bars are in the markup; CSS shows the active one. This demo ships 6 categories,
so it renders the **vertical** variant.

All components already registered — **no new abstractions**.

## Rules (taxonomy)

- **≤ 5 categories → horizontal tabs; > 5 → vertical sub-nav** (`ds-tab-bar-vertical`). Never mix.
- Save applies across **all** categories on submit (unless a Publish split is explicit).
- Each panel is an independent L06 sectioned form; first field of the active panel
  is focused on tab change.

## Reuse notes

- Cloned the L06 dual-mode scaffold + CSS (`.lay`, `.lay__scroll`, `.lay__section`,
  `.lay__fields`, 8px field gap, section `with-border`).
- Inline choice groups use `.frm-group--inline` (radio/checkbox options in a row,
  group help "?" hidden) — the generalized, class-scoped form of L06's id-scoped rules.
- Registered in `Shell.html` → `CONTENT_VIEWS['tabbed-form']`.

## Decisions to confirm

1. **Vertical variant — implemented.** Both variants are built and chosen adaptively
   by category count (≤5 horizontal / >5 vertical). This demo ships 6 → vertical.
2. **Per-tab vs global validation.** Currently Save toasts globally; if categories
   need independent save/validation, wire per-panel.
