---
name: UEMS Typography Tokens
description: The typography layer of the UEMS Design System — 43 composite token sets (body, display, code, special sizes, underline variants) covering all 41 Figma text styles, across 4 density scales and 3 typeface modes.
type: foundation
status: stable
category: Foundation / Tokens
figma:
  file: UEMS — Design System 3.0
  fileKey: DahIgbIJrSkzyP3OoHaDaG
  collections:
    - { name: Typography, id: "VariableCollectionId:10584:28496", variables: 132, modes: "Default / Large / XLarge / Small" }
    - { name: Font-family, id: "VariableCollectionId:10611:4115", modes: "Zoho Puvi / Lato / Roboto" }
    - { name: Type primitives, id: "VariableCollectionId:10660:7704", variables: 28 }
output:
  css: typography-tokens.css
generated: 2026-06-11
---

# UEMS Typography Tokens

> The typography layer: **43 composite token sets covering all 41 Figma text styles** — each a family + weight + size + line-height bundle — responding to two independent switches: `data-type-scale` (density: Default/Large/XLarge/Small) and `data-font` (typeface: Zoho Puvi/Lato/Roboto). Color is not part of this layer; pair with `--uems-text-*` from [uems-theme-tokens.md](./uems-theme-tokens.md).

## Usage

```html
<html data-type-scale="large" data-font="lato">  <!-- both optional -->
```

```css
.page-title {
  font-family: var(--uems-type-body-title-semibold-family);
  font-weight: var(--uems-type-body-title-semibold-weight);
  font-size: var(--uems-type-body-title-semibold-size);
  line-height: var(--uems-type-body-title-semibold-line-height);
}
```

Token shape: `--uems-type-{group}-{size-tier}-{weight-tier}-{family|weight|size|line-height}`.

## Primitives

| Group | Tokens |
|---|---|
| `--uems-font-size-{n}` | 9, 10, 11, 12, 13, 14, 16, 18, 20, 24, 28, 32, 36 (px) |
| `--uems-line-height-{n}` | keyed by font size: 9→14, 10→14, 12→16, 14→20, 16→24, 18→28, 20→30, 24→32, 28→36, 32→44, 36→46 (px) |
| `--uems-font-weight-{k}` | regular=400, medium=500, semibold=600, bold=700 |
| `--uems-font-family` / `--uems-font-family-code` | per `data-font` mode: Zoho Puvi / Lato / Roboto |

## Style matrix

Font size per scale mode (line-height follows the size via the pairing above).

| Style | Weights | Default | Large | XLarge | Small |
|---|---|---|---|---|---|
| `body/default` | Regular, Medium, SemiBold, Bold | 14px | 16px | 18px | 12px |
| `body/large` | Regular, Medium, SemiBold, Bold | 16px | 18px | 20px | 14px |
| `body/small` | default(Regular), Medium, SemiBold, Bold | 12px | 14px | 16px | 10px |
| `body/xsmall` | default(Medium), Medium, SemiBold, Bold | 10px | 12px | 14px | 9px |
| `body/title` | Regular, Medium, SemiBold | 18px | 20px | 18px | 16px |
| `display/small` | Regular, SemiBold, Bold | 24px | 24px | 28px | 20px |
| `display/medium` | Regular, SemiBold, Bold | 28px | 28px | 32px | 24px |
| `display/large` | Regular, SemiBold, Bold | 32px | 32px | 36px | 28px |
| `code/default` (mono) | Regular, SemiBold, Bold | 14px | 16px | 18px | 12px |
| `code/large` (mono) | Regular, SemiBold, Bold | 16px | 18px | 20px | 14px |
| `body/small-11` (scale-invariant) | Regular, Medium, SemiBold | 11px | 11px | 11px | 11px |
| `body/small-13` (scale-invariant) | Regular, Medium, SemiBold | 13px | 13px | 13px | 13px |
| `body/{default,large,small}/medium-underline` | Medium + underline | aliases the medium tier per scale | | | |

## Text style coverage (41/41)

Every Figma text style and the token set that serves it:

| Figma text style | Token base | Note |
|---|---|---|
| `Display/Title/{Regular,Medium,SemiBold}` | `--uems-type-body-title-{regular,medium,semibold}` | Title lives under `body/` in variables |
| `Display/Small/{Regular,SemiBold,Bold}` | `--uems-type-display-small-*` | |
| `Display/Medium/{Regular,SemoBold,Bold}` | `--uems-type-display-medium-*` | "SemoBold" typo in Figma → `semibold` |
| `Display/Large/{Regular,SemiBold,Bold}` | `--uems-type-display-large-*` | |
| `Text/Default/{Regular,Medium,SemiBold,bold}` | `--uems-type-body-default-*` | |
| `Text/Default/Medium-Underline` | `--uems-type-body-default-medium-underline-*` | adds `-decoration` |
| `Text/large/{Regular,Medium,SemiBold,Bold}` | `--uems-type-body-large-*` | |
| `Text/large/Medium-Underline` | `--uems-type-body-large-medium-underline-*` | adds `-decoration` |
| `Text/small/{Regular,Medium,SemiBold}` | `--uems-type-body-small-{default,medium,semibold}` | Regular tier is named `default` |
| `Text/small/Medium-Underline` | `--uems-type-body-small-medium-underline-*` | adds `-decoration` |
| `Text/xsmall/{Regular,Medium,SemiBold,Bold}` | `--uems-type-body-xsmall-{default,medium,semibold,bold}` | ⚠ both `default` and the Figma "Regular" style render Medium weight |
| `Text/Special-Sizes/small-11/{Regular,Medium,SemiBold}` | `--uems-type-body-small-11-*` | text-style only; scale-invariant; ⚠ SemiBold line-height is 16px |
| `Text/Special-Sizes/small-13/{Regular,Medium,SemiBold}` | `--uems-type-body-small-13-*` | text-style only; scale-invariant |
| `Code/Default/{Regular,SemiBold,Bold}` | `--uems-type-code-default-*` | ⚠ Figma styles render Regular weight for all three |
| `Code/Large/{Regular,bold}` | `--uems-type-code-large-{regular,bold}` | `semibold` tokens also exist (variables only) |

## Known gaps in the Figma source

These exist in Figma today and are reproduced (not invented) by this export — fix upstream, then regenerate:

| Where | Issue |
|---|---|
| `body/xsmall/default` | Binds the **Medium** weight, not Regular (the `Text/xsmall/Regular` text style has the same defect) |
| `body/small`, `body/xsmall` | Regular tier is named **Default** — inconsistent with every other group; kept verbatim in token names |
| `body/xsmall` | No **Medium** variable tier — the `Text/xsmall/Medium` text style exists, so a `medium` token set is emitted here to cover it |
| `body/title` | No **Bold** tier |
| `display/*` | No **Medium** tier in any display size |
| Sizes 11 / 13 | Font-size primitives exist but **no line-height primitives** and no Typography variables; exported here as scale-invariant token sets with line-heights derived from the text styles |
| `small-11/SemiBold` | Line-height 16px while Regular/Medium use 14px — kept verbatim, flagged in the CSS |
| Text styles | `Display/Medium/SemoBold` typo; `Code/*` SemiBold/Bold text styles render Regular weight; `Code/Large/SemiBold` style missing (variables exist and ARE exported) |

## Notes

- The `Font-family` collection also holds stray component-prop variables (`Boolean`, `Label`, `Prefix`, …) — they are not typography and are excluded from this export.
- Figma stores weights as strings (`Regular`/`Medium`/`SemiBold`/`Bold`); the CSS maps them to 400/500/600/700.
- Load order is independent of the color files; this file is self-contained.

---

*Generated from UEMS Design System 3.0 · collections `Typography` + `Font-family` + `Type primitives` · 2026-06-11 · `node generate-typography.js`*
