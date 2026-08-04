# Page Header

The Page Header is a full-width layout component that anchors every page. It provides a consistent location for the breadcrumb trail, page title, contextual actions, metadata summary, and tab-based navigation. Four `Structure` variants progressively compose these zones to match page complexity.

**Figma source:** [UEMS Design System 3.0 — Page Header page](https://www.figma.com/design/DahIgbIJrSkzyP3OoHaDaG/UEMS---Design-System-3.0?node-id=17220-1199408)  
**Component node:** `17220:1199408` (Page Header component set)  
**Last updated:** 2026-04-14

---

## Anatomy

**Default (breadcrumb + title + actions)**
```
┌──────────────────────────────────────────────────────────────────────────────┐
│  Label › Label › Label                                                        │
│  Page Title ˅  ☆  + Badge                          Button   Button   ···    │
└──────────────────────────────────────────────────────────────────────────────┘
```

**With Summary (+ metadata row)**
```
┌──────────────────────────────────────────────────────────────────────────────┐
│  Label › Label › Label                                                        │
│  Page Title ˅  ☆  + Badge                          Button   Button   ···    │
│  Status ● Active    Created Mar 15, 2026    Owner John Doe    Priority + Badge│
└──────────────────────────────────────────────────────────────────────────────┘
```

**With Tabs (+ tab navigation row)**
```
┌──────────────────────────────────────────────────────────────────────────────┐
│  Label › Label › Label                                                        │
│  Page Title ˅  ☆  + Badge                          Button   Button   ···    │
│  ┌ Tab Menu 34 ┐  Tab Menu 66    Tab Menu 66    Tab Menu 66    Tab Menu 66   │
│  ────────────────────────────────────────────────────────────────────────────│
└──────────────────────────────────────────────────────────────────────────────┘
```

**Full (breadcrumb + title + summary + tabs)**
```
┌──────────────────────────────────────────────────────────────────────────────┐
│  Label › Label › Label                                                        │
│  Page Title ˅  ☆  + Badge                          Button   Button   ···    │
│  Status ● Active    Created Mar 15, 2026    Owner John Doe    Priority + Badge│
│  ┌ Tab Menu 34 ┐  Tab Menu 66    Tab Menu 66    Tab Menu 66    Tab Menu 66   │
│  ────────────────────────────────────────────────────────────────────────────│
└──────────────────────────────────────────────────────────────────────────────┘
```

| Part | Description |
|---|---|
| **Breadcrumb** | 3-item breadcrumb trail showing navigation hierarchy. Ancestors use `Text/Text-Quaternary`; current page uses `Text/Text-Primary`. |
| **Back Icon** | Optional back-navigation icon before the title (hidden by default). |
| **Page Title** | Primary `h1`-level text (16 px Semibold). Accompanied by a dropdown chevron, favourite star, and a status badge. |
| **Chevron** | 16 × 16 px dropdown indicator for contextual title menus. |
| **Star** | 20 × 20 px favourite / bookmark toggle icon. |
| **Title Badge** | Status badge component (e.g. Active, Critical) positioned after the star. |
| **Description** | Optional subtitle below the title text (hidden by default). |
| **Actions** | Right-aligned row containing a secondary button, primary button, and overflow (`···`) icon button. |
| **Summary Section** | Horizontal row of 4 metadata items (Status, Created, Owner, Priority). Visible in `With Summary` and `Full`. |
| **Tab Bar** | Underline-style tab navigation with 5 tabs, each with a label, icon, and count badge. Visible in `With Tabs` and `Full`. |
| **Divider** | 1 px rule below the summary section or tabs. Uses `Border/Border-Tertiary`. |

---

## Variants

### Structure

The single variant axis controls which zones are composed into the header:

| Value | Zones included | Height |
|---|---|---|
| `Default` | Breadcrumb + Title + Actions | 101 px |
| `With Summary` | Breadcrumb + Title + Actions + Summary row + Divider | 137 px |
| `With Tabs` | Breadcrumb + Title + Actions + Tab bar | 137 px |
| `Full` | Breadcrumb + Title + Actions + Summary row + Tab bar | 173 px |

> **No additional variant axes exist** (no size, no direction/RTL axis on the component set itself). RTL is handled at the sub-component level via the embedded Breadcrumb, Tab Bar, and Button instances.

---

## Props / API

### Variant prop

| Prop | Type | Default | Description |
|---|---|---|---|
| `structure` | `'Default' \| 'With Summary' \| 'With Tabs' \| 'Full'` | `'Default'` | Controls which rows are rendered. |

### Title area toggles

| Prop | Type | Default | Description |
|---|---|---|---|
| `title` | `string` | `"Page Title"` | The primary page title text. |
| `showBreadcrumbs` | `boolean` | `true` | Shows or hides the breadcrumb row. |
| `showBackIcon` | `boolean` | `false` | Shows a back-navigation icon before the title. |
| `showChevron` | `boolean` | `true` | Shows the dropdown chevron next to the title. |
| `showStar` | `boolean` | `true` | Shows the favourite/star icon. |
| `showBadge` | `boolean` | `true` | Shows the status badge after the star. |
| `showDescription` | `boolean` | `false` | Shows the optional description subtitle below the title. |
| `description` | `string` | `"A brief description of this page and its purpose."` | Subtitle text, visible only when `showDescription=true`. |

### Actions

| Prop | Type | Default | Description |
|---|---|---|---|
| `showActions` | `boolean` | `true` | Shows or hides the entire actions row. |
| `showOverflow` | `boolean` | `true` | Shows or hides the overflow (`···`) icon button. |
| `primaryAction` | `ReactNode` | Primary Button | Instance-swap slot for the primary action button. |
| `secondaryAction` | `ReactNode` | Secondary Button | Instance-swap slot for the secondary action button. |
| `overflowMenu` | `ReactNode` | Icon Button (Tertiary) | Instance-swap slot for the overflow menu trigger. |

### Sub-component instance-swaps

| Prop | Type | Default | Description |
|---|---|---|---|
| `badge` | `ReactNode` | Badge (Success state) | Instance-swap slot for the title area status badge. |

---

## Child Layer Structure

```
Page Header (VERTICAL, paddingTop/Bottom: 12 px, gap: 12 px)
└── Content (VERTICAL, FILL width, gap: 12 px)
    ├── Breadcrumbs row (HORIZONTAL, paddingLeft/Right: 20 px)
    │   └── Breadcrumb instance (Count=3, Overflow=False)
    │       ├── Item 1 (Leading Icon [hidden] + Label)
    │       ├── Separator › (12×12 chevron)
    │       ├── Item 2 (Leading Icon [hidden] + Label)
    │       ├── Separator ›
    │       └── Current Page (Leading Icon [hidden] + Label)
    ├── page title content (HORIZONTAL, FILL, paddingLeft/Right: 20 px, gap: 8 px)
    │   ├── Title Row (VERTICAL, FILL, gap: 4 px)
    │   │   └── Leading Section (HORIZONTAL, HUG, gap: 12 px)
    │   │       ├── Back Icon [hidden by default]
    │   │       ├── Page Title frame (gap: 4 px)
    │   │       │   ├── Title TEXT — "Page Title"
    │   │       │   └── chevron-down icon (16×16)
    │   │       ├── star icon (20×20)
    │   │       ├── Badge instance
    │   │       └── Description TEXT [hidden by default]
    │   └── Actions (HORIZONTAL, HUG, gap: 8 px)
    │       ├── Secondary Button instance (69×36)
    │       ├── Primary Button instance (69×36)
    │       └── Overflow Menu icon button (24×24)
    ├── Summary Section [visible in With Summary + Full] (HORIZONTAL, paddingLeft/Right: 20 px, gap: 24 px)
    │   ├── Summary Item 1 (gap: 8 px) — Label "Status" + Status Indicator instance
    │   ├── Summary Item 2 (gap: 8 px) — Label "Created" + Value "Mar 15, 2026"
    │   ├── Summary Item 3 (gap: 8 px) — Label "Owner" + Value "John Doe"
    │   └── Summary Item 4 (gap: 8 px) — Label "Priority" + Badge instance
    ├── Divider [1 px, Border-Tertiary — visible in With Summary]
    └── Tab bar [visible in With Tabs + Full] (VERTICAL, paddingLeft/Right: 20 px)
        └── Tab Bar instance (Underline, Count=5, Direction=Horizontal)
            ├── Tab Item (Active) — Icon + "Tab Menu" + count "34"
            ├── Tab Item (Default) × 4 — Icon + "Tab Menu" + count "66"
            └── Underline Divider (FILL × 1 px)
```

---

## Design Tokens

### Text colours

| Token | Usage |
|---|---|
| `Text/Text-Primary` | Page title, current breadcrumb item, summary values, secondary button label, inactive tab label |
| `Text/Text-Secondary` | Summary labels (Status / Created / Owner / Priority), tab count badge text |
| `Text/Text-Quaternary` | Breadcrumb ancestor item labels |
| `Text/Text-White` | Primary button label |
| `Text/Text-Accent-Primary` | Active tab label |
| `Text/Text-Success` | Success badge text |
| `Text/Text-Error` | Critical/Error badge text |

### Icon colours

| Token | Usage |
|---|---|
| `Border/Icon/Icon-Primary` | Star icon, inactive tab icons |
| `Border/Icon/Icon-Tertiary` | Breadcrumb separator chevrons |
| `Border/Icon/Icon-Accent` | Active tab icon |
| `Border/Icon/Icon-Success` | Success badge icon |
| `Border/Icon/Icon-Error` | Critical badge icon |

### Backgrounds

| Token | Usage |
|---|---|
| `Background/BG-Button-Primary` | Primary button fill (gradient stop 1) |
| `Background/BG-Button-Primary-Hover` | Primary button fill (gradient stop 2) |
| `Background/BG-Secondary` | Secondary button fill |
| `Background/BG-Success-Primary` | Success badge background |
| `Background/BG-Success-Solid` | Status indicator success dot |
| `Background/BG-Error-Primary` | Critical badge background |
| `Background/BG-Secondary-alt` | Tab count badge fill |

### Borders

| Token | Usage |
|---|---|
| `Border/Border-Tertiary` | Divider line below summary section |
| `Border/Border-Accent` | Active tab underline stroke |

### Spacing

| Token | Value | Usage |
|---|---|---|
| `spacing/4` | 4 px | Breadcrumb item gap; Page Title frame gap; tab element gap |
| `spacing/8` | 8 px | Title content row item spacing; tab item padding V; actions gap |
| `spacing/12` | 12 px | Outer padding T/B; row gap; leading section gap; button padding H |
| `spacing/20` | 20 px | Horizontal padding on all rows (breadcrumb, title, summary, tabs) |

### Border radius

| Token | Value | Usage |
|---|---|---|
| `border-radius/radius-4` | 4 px | Title badge corner radius |
| `border-radius/radius-6` | 6 px | Status indicator corner radius |
| `border-radius/radius-pill` | 9999 px | Tab count badge |
| `radius/radius-s` | 8 px | Button corner radius |

---

## Typography

| Element | Font | Size | Weight | Line Height | Token |
|---|---|---|---|---|---|
| Page Title | Zoho Puvi | 16 px | Semibold (600) | 24 px | `body/Large/SemiBold` |
| Breadcrumb (ancestor) | Zoho Puvi | 12 px | Medium (500) | 16 px | `body/Small/Medium` |
| Breadcrumb (current page) | Zoho Puvi | 12 px | Medium (500) | 16 px | `body/Small/Medium` |
| Summary label | Zoho Puvi | 12 px | Regular (400) | 16 px | `body/Small/Default` |
| Summary value | Zoho Puvi | 12 px | Regular (400) | 16 px | `body/Small/Default` |
| Tab label | Zoho Puvi | 14 px | Medium (500) | 20 px | `body/Default/Medium` |
| Tab count badge | Zoho Puvi | 10 px | Medium (500) | 14 px | `body/Xsmall/Default` |
| Button label | Zoho Puvi | 14 px | Medium (500) | 20 px | `body/Default/Medium` |
| Title Badge text | Zoho Puvi | 12 px | Medium (500) | 16 px | `body/Small/Medium` |

---

## Sizing Reference

| Variant | Width | Height | Rows included |
|---|---|---|---|
| `Default` | 960 px | 101 px | Breadcrumb + Title + Actions |
| `With Summary` | 960 px | 137 px | + Summary row + Divider |
| `With Tabs` | 960 px | 137 px | + Tab bar |
| `Full` | 960 px | 173 px | + Summary row + Tab bar |

| Property | Value | Token |
|---|---|---|
| Outer padding top / bottom | 12 px | `spacing/12` |
| Horizontal padding (all rows) | 20 px | `spacing/20` |
| Row gap (between rows) | 12 px | `spacing/12` |
| Leading section element gap | 12 px | `spacing/12` |
| Title text ↔ chevron gap | 4 px | `spacing/4` |
| Actions button gap | 8 px | `spacing/8` |
| Summary item gap | 24 px | — |
| Summary label ↔ value gap | 8 px | `spacing/8` |
| Tab item internal gap | 8 px | `spacing/8` |
| Tab item gap | 12 px | `spacing/12` |
| Button height | 36 px | — |
| Overflow icon size | 24 × 24 px | — |

---

## Summary Section (Metadata Row)

The Summary Section contains **4 fixed metadata item slots** with a 24 px gap between them:

| Slot | Default label | Default value type | Notes |
|---|---|---|---|
| 1 | `Status` | Status Indicator component | Dot + label (e.g. "● Active"). Success/Error/Warning states supported. |
| 2 | `Created` | Plain text | Date string (e.g. "Mar 15, 2026"). |
| 3 | `Owner` | Plain text | User name (e.g. "John Doe"). |
| 4 | `Priority` | Badge component | e.g. "Critical". Instance-swappable. |

> Slots 1 and 4 use embedded component instances (Status Indicator and Badge) rather than plain text values. Replace with appropriate component instances when customising.

---

## Tab Bar

The embedded Tab Bar instance exposes **5 tab slots**, each containing:
- An **icon** (20 × 20 px, instance-swappable)
- A **label** text (default `"Tab Menu"`)
- A **count badge** pill (default `"34"` on active, `"66"` on others)

Tab state: the first tab is `Active`; all others are `Default`. The active tab uses `Text/Text-Accent-Primary` and `Border/Border-Accent` underline.

---

## Usage

### When to use

- As the **top-level header for every page** in the application.
- Use `Default` for simple pages with no contextual metadata or tab navigation.
- Use `With Summary` when the page has key metadata that users frequently reference (status, owner, dates, priority).
- Use `With Tabs` when a single page contains multiple distinct content sections navigable by tab.
- Use `Full` for complex record or detail pages that require both metadata context and tabbed content areas.

### When not to use

- **Inside a card, modal, or panel** — use [Section Header](./section-header.md) or a custom heading instead.
- **For secondary/nested pages** where breadcrumbs would exceed 3 levels — simplify the information architecture.
- **As a section header within a page** — use [Section Header](./section-header.md).

### Do / Don't

| Do | Don't |
|---|---|
| Choose the `Structure` that matches page complexity — start with `Default` | Default to `Full` on every page regardless of content needs |
| Keep the `title` to one short, descriptive noun phrase (2–4 words) | Use a full sentence or question as the page title |
| Use `showChevron=true` only when the title triggers a dropdown/context menu | Show the chevron as decoration without a real interaction behind it |
| Use `showBadge=true` to communicate the record's current status | Stack multiple badges in the title area |
| Use `showBackIcon=true` on modal-like full-page detail views with a clear parent | Show both breadcrumbs and a back icon simultaneously — pick one |
| Keep summary labels short (1–2 words: "Status", "Owner", "Due") | Write descriptive phrases as metadata labels |
| Limit Summary Section to the 4 most relevant metadata fields | Add more than 4 metadata items — the layout overflows |
| Use the `primaryAction` for the single most important page-level action | Put more than 2 labelled buttons in the actions area |
| Put destructive or rare actions behind the overflow (`···`) menu | Surface destructive actions as top-level buttons |
| Set meaningful tab count badges that update dynamically | Show `0` in every tab count badge |

---

## Accessibility

| Concern | Requirement |
|---|---|
| **Landmark** | Wrap the Page Header in `<header>` for page-level landmark semantics. |
| **Heading level** | The page title should render as `<h1>`. There must be exactly one `<h1>` per page. |
| **Breadcrumb** | Wrap in `<nav aria-label="Breadcrumb">`. Mark the current page item with `aria-current="page"`. |
| **Actions** | Each button must have a visible label or `aria-label`. The overflow button needs `aria-label="More actions"` and `aria-haspopup="true"`. |
| **Chevron** | If the title chevron opens a menu, use `aria-haspopup="menu"` and `aria-expanded` on the trigger. |
| **Star / Favourite** | Use `aria-label="Add to favourites"` / `aria-pressed` (toggle button). |
| **Tabs** | Use `role="tablist"`, `role="tab"`, `aria-selected`, and `aria-controls` on the Tab Bar. Active tab must have `aria-selected="true"`. |
| **Count badges** | Associate count text with tabs via `aria-label` on the tab, e.g. `aria-label="Tab Menu, 34 items"`. |
| **Summary labels** | Use `<dl>` / `<dt>` / `<dd>` structure for metadata key-value pairs for screen reader comprehension. |
| **Focus order** | Tab order should follow visual reading order: breadcrumb → title actions (chevron, star) → buttons → tabs. |
| **Skip link** | Provide a "Skip to main content" link that jumps past the Page Header for keyboard and screen reader users. |
| **Contrast** | `Text/Text-Quaternary` (breadcrumb ancestors) must meet WCAG AA 4.5:1 on the page background. |
| **RTL** | RTL is handled at sub-component level (Breadcrumb, Tab Bar, Buttons each have RTL variant properties). Set `dir="rtl"` on the page `<html>` or `<header>` element. |

---

## Code Examples

### Default — title with actions

```tsx
<PageHeader
  structure="Default"
  title="User Management"
  showBadge
  badge={<Badge status="Success" label="Active" />}
  primaryAction={<Button variant="Primary" size="Small">Create User</Button>}
  secondaryAction={<Button variant="Secondary" size="Small">Export</Button>}
/>
```

### With Summary — record detail page

```tsx
<PageHeader
  structure="With Summary"
  title="Invoice #1042"
  badge={<Badge status="Warning" label="Pending" />}
  showStar
  primaryAction={<Button variant="Primary" size="Small">Approve</Button>}
  secondaryAction={<Button variant="Secondary" size="Small">Edit</Button>}
  summaryItems={[
    { label: "Status",  value: <StatusIndicator status="Warning" label="Pending" /> },
    { label: "Created", value: "Mar 15, 2026" },
    { label: "Owner",   value: "John Doe" },
    { label: "Priority", value: <Badge status="Error" label="Critical" /> },
  ]}
/>
```

### With Tabs — tabbed content page

```tsx
<PageHeader
  structure="With Tabs"
  title="Project Alpha"
  badge={<Badge status="Success" label="Active" />}
  primaryAction={<Button variant="Primary" size="Small">Add Task</Button>}
  secondaryAction={<Button variant="Secondary" size="Small">Settings</Button>}
  tabs={[
    { label: "Overview",   count: 0,  active: true },
    { label: "Tasks",      count: 34 },
    { label: "Files",      count: 12 },
    { label: "Discussion", count: 5  },
    { label: "Timeline",   count: 0  },
  ]}
/>
```

### Full — complex record page

```tsx
<PageHeader
  structure="Full"
  title="Customer: Acme Corp"
  badge={<Badge status="Success" label="Active" />}
  showStar
  showChevron
  primaryAction={<Button variant="Primary" size="Small">New Deal</Button>}
  secondaryAction={<Button variant="Secondary" size="Small">Edit</Button>}
  summaryItems={[
    { label: "Status",  value: <StatusIndicator status="Success" label="Active" /> },
    { label: "Created", value: "Jan 10, 2025" },
    { label: "Owner",   value: "Jane Smith" },
    { label: "Tier",    value: <Badge status="Info" label="Enterprise" /> },
  ]}
  tabs={[
    { label: "Overview",  count: 0,  active: true },
    { label: "Contacts",  count: 18 },
    { label: "Deals",     count: 7  },
    { label: "Activities",count: 42 },
    { label: "Files",     count: 11 },
  ]}
/>
```

### Minimal — no breadcrumb, no badge, no overflow

```tsx
<PageHeader
  structure="Default"
  title="Settings"
  showBreadcrumbs={false}
  showBadge={false}
  showStar={false}
  showChevron={false}
  showOverflow={false}
  primaryAction={<Button variant="Primary" size="Small">Save Changes</Button>}
  secondaryAction={<Button variant="Secondary" size="Small">Cancel</Button>}
/>
```

### With back icon (no breadcrumb)

```tsx
<PageHeader
  structure="Default"
  title="Edit Profile"
  showBreadcrumbs={false}
  showBackIcon
  showBadge={false}
  showChevron={false}
  showStar={false}
  primaryAction={<Button variant="Primary" size="Small">Save</Button>}
  secondaryAction={<Button variant="Secondary" size="Small">Discard</Button>}
/>
```

---

## Related Components

| Component | When to use instead |
|---|---|
| [Section Header](./section-header.md) | Labelled heading for a sub-section within a page |
| [Breadcrumb](./breadcrumb.md) | Standalone breadcrumb navigation without a full page header |
| [Tabs](./tabs.md) | Standalone tab navigation not anchored to a page header |
| [Top Navigation](./top-navigation.md) | Application-level navigation bar fixed at the top of the viewport |
