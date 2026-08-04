# `<ds-section-header>`

Labels a content group inside a page or panel — a card region, settings block,
list group, or modal body section. Not the page-level Page Header.

| Attribute | Values | Default |
|---|---|---|
| `size` | `small` \| `medium` \| `large` | `medium` |
| `style-variant` | `default` \| `with-description` \| `with-border` | `default` |
| `divider` | `none` \| `bottom` \| `both` | `none` (full-width rule, Border-Secondary) |
| `title` | string | `Section Title` |
| `description` | string | — (shown only for `with-description` / `with-border`) |
| `action-label` | string | — renders a default `ds-text-link` |
| `show-action` | `false` to hide | shown when `action-label` (or a slotted action) is set |
| `heading-level` | `1`–`6` | derived from size (large → `h2`, medium → `h3`, small → `h4`) |
| `rtl` | boolean | — |

Slot `action` to drop in a custom button/link instead of the default text link.

## Styles

- **default** — title only.
- **with-description** — title + description stacked in one text group; a trailing
  action centers against the two-line block.
- **with-border** — title + a trailing 1px rule (Border-Tertiary) + action on the
  title row, **and the description on a full-width second row below**. (Full-width
  `divider` rules are not used with this style.)

## Sizes (per Figma spec)

| Size | Title | Description | Padding-block | Title↔Desc gap | Border 2nd-row gap |
|---|---|---|---|---|---|
| small  | 12/16 Semibold | 10/14 Medium  | 8  | 2 | 2 |
| medium | 14/20 Semibold | 12/16 Regular | 12 | 4 | 4 |
| large  | 16/24 Semibold | 14/20 Regular | 16 | 2 | 6 |

## Examples

```html
<ds-section-header title="Recent Activity"></ds-section-header>

<ds-section-header title="Team Members" style-variant="with-description"
  description="People with access to this workspace."></ds-section-header>

<!-- title + rule + action on row 1, description on a full-width 2nd row -->
<ds-section-header title="Connected Devices" style-variant="with-border"
  description="All registered endpoints across your organisation"
  action-label="View All"></ds-section-header>

<ds-section-header title="Filters" size="small" divider="bottom"></ds-section-header>
```

Tokens: title `--uems-text-primary`, description `--uems-text-secondary`, trailing
rule `--uems-border-tertiary`, full-width dividers `--uems-border-secondary`,
action `ds-text-link` (`--uems-text-accent-link`). Theme-aware (light/dark/night).
