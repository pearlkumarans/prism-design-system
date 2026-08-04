# UEMS Design System — Component Documentation Guideline

> This is the **master guideline** for creating any component documentation page in the UEMS Design System. Every component page must follow this exact structure, section order, and content pattern. Use this document as the single source of truth when building a new component HTML page.

---

## 1. File & Page Setup

Every component page begins with these fixed elements.

### 1.1 File Naming

```
{ComponentName}.html
```

Use the exact component name in **PascalCase** or **Kebab-case** matching the sidebar list (e.g., `Button.html`, `Date-picker.html`, `Action-bar.html`).

### 1.2 Page Title

```html
<title>{ComponentName} — UEMS Design System</title>
```

### 1.3 Theme Support

The root `<html>` element must carry `data-theme="light"` by default. All color values must reference CSS custom properties (`--prism-*`) so both light and dark themes render correctly.

### 1.4 Font

All text uses the **Zoho Puvi** font family loaded via `@font-face` declarations (weights 100–950, including italic variants at 400, 600, 700).

---

## 2. Global Layout (Three-Column Grid)

```
┌──────────────────────────────────────────────────────────┐
│                     Navigation Bar (72px)                 │
├────────────┬─────────────────────────────┬───────────────┤
│  Left      │       Main Panel            │  Right TOC    │
│  Sidebar   │  ┌─────────────────────┐    │  Sidebar      │
│  (260px)   │  │  Page Header        │    │  (240px)      │
│            │  │  Tab Bar            │    │               │
│  - Search  │  │  Tab Content        │    │  - On This    │
│  - Comp    │  │                     │    │    Page       │
│    List    │  │                     │    │  - Resources  │
│            │  └─────────────────────┘    │               │
└────────────┴─────────────────────────────┴───────────────┘
```

### 2.1 Navigation Bar (shared across all pages)

Fixed top bar, 72px height, glassmorphic backdrop blur.

| Element | Details |
|---------|---------|
| Logo | "UEMS" (gradient text, 24px, weight 800) + "Design System" (13px, uppercase) |
| Nav Links | Overview · UI Framework · **Components** (active) · Foundation · AI Experience · Accessibility · Library |
| Theme Toggle | Moon/Sun icon button — switches `data-theme` between `light` and `dark` |

### 2.2 Left Sidebar (shared across all component pages)

Sticky sidebar, 260px wide, scrollable.

| Element | Details |
|---------|---------|
| Search Bar | Pill-shaped input with magnifying glass icon + `⌘K` shortcut badge |
| Heading | "Components" — 11px uppercase, 0.1em letter-spacing |
| Navigation List | Alphabetical list of all components. **Current component** gets `class="sidebar-link active"` with a 4px blue left indicator bar |

### 2.3 Right TOC Sidebar

Sticky sidebar, 240px wide.

| Element | Details |
|---------|---------|
| "On this page" heading | 11px uppercase, bold |
| TOC List | Auto-generated from all `h2[id]` and `h3[id]` inside the active tab panel. Active heading highlighted via IntersectionObserver scroll-spy |
| Resources section | Divider, then: "Download MD" link (to `MD/{componentname}.md`) and "Figma Design" link (to Figma URL with `node-id`) |

---

## 3. Page Header Area

This sits at the top of the main panel, **above** all tab content.

| Element | Spec |
|---------|------|
| Title | Component name. Gradient text (`--logo-gradient`), 48px, weight 800, `letter-spacing: -0.03em` |
| Description | 1–2 sentences summarizing purpose, key capabilities, variant/size count. 20px, weight 400, `line-height: 1.5`, max-width 900px |
| Tab Bar | Pill-shaped segmented control with 5 buttons: **Overview** · **Style** · **Usage** · **Code** · **Accessibility**. Active tab gets `--prism-violet` background + white text + box-shadow |

**Writing the description — follow this pattern:**

> The {ComponentName} is {what it is / what it does}. It supports {key feature 1}, {key feature 2}, and {key feature 3}.

---

## 4. Tab Content Sections

Each tab maps to a hidden `<div class="tab-content" id="tab-{name}">`. Only the active tab is displayed. The TOC sidebar regenerates whenever a tab is switched.

---

### TAB 1: Overview (`tab-overview`)

This tab gives a quick visual introduction to the component.

#### 4.1.1 Anatomy

**Purpose:** Show the component's internal structure with numbered callouts.

**Layout:**
- `anatomy-diagram` container — full width, `border-radius: 16px`, top 3px gradient accent bar (blue → light blue → cyan)
- Center: visual representation of the component with numbered marker circles (①②③...) pointing to each part
- Below: `anat-legend` grid (3 columns) — each item has a numbered circle + **Part Name** (bold, 14.5px) + description (13px, muted)

**Content required:**

```
For each anatomical part, provide:
  Number:      Sequential (1, 2, 3...)
  Name:        Short label (e.g., "Container", "Label", "Icon", "Handle", "Track")
  Description: 1 sentence explaining the part's role and whether it is optional/required
```

**Adapt for your component:** A Checkbox might have ① Container ② Checkmark Icon ③ Label Text. A Slider might have ① Track ② Thumb ③ Fill ④ Label ⑤ Value Display.

---

#### 4.1.2 Live Demo

**Purpose:** Let users interact with the component in a sandboxed preview.

**Layout:**
- `demo-container` with rounded borders
- `demo-toolbar` header bar with a "Preview" pill badge
- `demo-canvas` — dot-grid background, flex-centered, min-height 280px
- Component instances arranged in rows, showing primary variants first, then secondary variants, then size variations

**Content required:**

```
Row 1: Most prominent variant configurations (with icons if applicable)
Row 2: Additional semantic variants (success, warning, etc.) if they exist
Row 3: Medium size examples (if component has size variants)
Row 4: Small size examples (progressively smaller/lighter opacity)
```

**Adapt for your component:** A Checkbox demo might show: unchecked, checked, indeterminate, disabled states. An Accordion might show: single open, multiple open, disabled panel.

---

#### 4.1.3 Content Guidelines (Do / Don't)

**Purpose:** Quick-reference best practices.

**Layout:** `do-dont-grid` — two-column grid.

| Card | Style |
|------|-------|
| Do card | Green top border (`#22c55e`), `✓` prefix on each bullet, green label |
| Don't card | Red top border (`#ef4444`), `✗` prefix on each bullet, red label |

**Content required:**

```
DO (3–5 items):   Short, actionable positive guidelines.
DON'T (2–4 items): Common misuses or anti-patterns to avoid.
```

**Writing style:** Start each item with an action verb. Keep to one sentence. Be specific, not vague.

---

### TAB 2: Style (`tab-style`)

This tab documents every visual specification needed for implementation.

#### 4.2.1 Variants

**Purpose:** Enumerate all visual variants with their intended use.

**Layout:** Full-width table.

| Column | Content |
|--------|---------|
| Variant | Bold name (e.g., Primary, Secondary, Outline, Destructive) |
| Usage | 1-sentence description of when to use this variant |
| Example | Live rendered instance of the component in that variant |

**Include every variant the component supports.** If there are no variants, skip this section.

---

#### 4.2.2 States

**Purpose:** Show all interaction states.

**Layout:** Grid of `state-card` elements (typically 5 columns, adapt count to match actual states).

**Standard states to document (include all that apply):**

| State | What to show |
|-------|-------------|
| Default | Resting appearance — background, border, text color |
| Hover | Visual change on mouse hover — color shift, shadow, scale |
| Focus | Focus ring specs — width, color, offset, border-radius |
| Active/Pressed | Appearance during click/press |
| Loading | Spinner, disabled interaction, `aria-busy` |
| Disabled | Muted colors, `cursor: not-allowed`, no interaction |
| Error | Red border/text (for input-type components) |
| Selected/Checked | Active selection state (for toggles, checkboxes, radios) |
| Indeterminate | Partial selection (for checkboxes with mixed children) |

**Only include states that apply to your component.**

---

#### 4.2.3 Sizes

**Purpose:** Document dimensional specs for each size variant.

**Layout:** `size-table` — full-width table.

| Column | Content |
|--------|---------|
| Size | Name (Large, Medium, Small, Xsmall) |
| Height | Pixel value |
| Padding | Horizontal × Vertical in px |
| Font | Font-size / Line-height |
| Icon | Icon dimensions in px |
| Preview | Live rendered instance at that size |

**If the component has no size variants, document the single default size.**

---

#### 4.2.4 Color Tokens

**Purpose:** Map each variant to its design token values.

**Layout:** `size-table`.

| Column | Content |
|--------|---------|
| Variant | Name |
| Background Token | Token name (e.g., `bg-secondary`, `Gradients/Primary`) |
| Value | Hex value or gradient string |
| Text | Text color hex |

**Include tokens for:** background, text, border, icon, hover-background, and any other color properties used.

---

#### 4.2.5 Spacing Tokens

**Purpose:** Document internal spacing using design system tokens.

**Layout:** `size-table`.

| Column | Content |
|--------|---------|
| Size | Size variant name |
| H-Padding | Horizontal padding in px |
| V-Padding | Vertical padding in px |
| Gap | Internal gap between child elements in px |
| Token | Design system token name (e.g., `spacing/16px`) |

---

#### 4.2.6 Corner Radius

**Purpose:** Show border-radius values per size, with visual examples.

**Layout:** Flex row of cards, each containing a dashed-border rectangle showing the actual radius.

**Content required for each size:**

```
Size label → Radius value (px) → Token name (e.g., radius/radius-s)
```

---

#### 4.2.7 Typography

**Purpose:** Document font specifications per size.

**Layout:**
- Large "Aa" preview block with font family name ("Zoho Puvi") and "Primary System Font" subtitle
- Grid of weight samples — highlight the weight used by this component (blue bottom border + blue background tint)
- Table with columns: Size | Token | Font Size | Line Height | Letter Spacing

---

### TAB 3: Usage (`tab-usage`)

This tab provides contextual guidelines for designers and developers.

#### 4.3.1 When and Where to Use

**Purpose:** Clear guidance on appropriate and inappropriate usage.

**Layout:** Two-column grid of cards.

| Card | Icon | Content |
|------|------|---------|
| When to use | Blue checkmark | 3–5 bulleted scenarios where the component is the right choice |
| When NOT to use | Red X | 2–4 bulleted anti-patterns, each suggesting an alternative component |

**Writing style:** Each bullet starts with "To..." (positive) or describes a scenario + recommends an alternative (negative). Be specific about **which** alternative component to use instead.

---

#### 4.3.2 Alignment & Placement

**Purpose:** Spatial positioning rules within common UI contexts.

**Layout:** `doc-list` with left blue accent border.

**Content required:** One item per common UI context where the component appears. Each item has a **bold context label** followed by the placement rule.

**Common contexts to consider:**

```
Forms, Modals/Dialogs, Data Tables, Page Headers, Sidebars,
Toolbars, Cards, Navigation, Inline/Floating, Mobile/Responsive
```

**Only include contexts relevant to your component.**

---

#### 4.3.3 Complete Do's and Don'ts

**Purpose:** Expanded guidelines (more detailed than Overview tab's quick version).

**Layout:** `do-dont-grid` — two-column.

**Content required:** 4–6 items per card. Each item has a **bold rule title** followed by a detailed explanation sentence.

**This section should cover:**
- Visual hierarchy rules
- Grouping/composition rules
- Content/labeling rules
- Interaction feedback rules
- Accessibility pairing rules

---

#### 4.3.4 Related Components

**Purpose:** Cross-reference complementary or similar components.

**Layout:** `related-grid` — flex-wrap row of `related-chip` pill links. Each chip has a small SVG icon + component name + link to its page.

**Content required:** 3–6 related components. Choose components that are:
- Frequently used alongside this component
- Commonly confused with this component
- Sub-components or parent components

---

#### 4.3.5 References

**Purpose:** Link to implementation resources and design tokens.

**Layout:** `doc-list` with blue accent border.

**Content required:**

```
• Figma Node:      {node-id} — Component Set: {ComponentName}
• Typography:      {Font family and weight used}
• Border Radius:   {token name = pixel value}
• Total Variants:  {variants × sizes × states × icon-options = total count}
```

---

#### 4.3.6 Feedback Banner

**Purpose:** Gather user feedback on the documentation page.

**Layout:** Full-width banner with gradient background, centered question text, two pill buttons.

```
Text:    "Was this page helpful?"
Subtext: "Help us improve by sharing your feedback on this component's documentation."
Buttons: [Not helpful]  [Yes, helpful (primary)]
```

**This section is identical on every component page — copy as-is.**

---

### TAB 4: Code (`tab-code`)

This tab provides implementation guidance for developers.

#### 4.4.1 Live Code Playground

**Purpose:** Interactive configurator that generates copy-paste-ready HTML + CSS.

**Layout:**
- `code-playground` container
- `cp-toolbar` — row of dropdown controls for each configurable property
- `cp-preview` — live rendering area (supports light/dark preview toggle)
- `cp-code-header` — "HTML & CSS" label + Copy Code button + CodeSandbox link
- `cp-code-area` — dark background code block with syntax highlighting + Show more/less toggle

**Controls to define for your component (adapt these):**

| Control | Type | Options |
|---------|------|---------|
| Theme | Select | Light, Dark |
| Variant | Select | List all variants |
| Size | Select | List all sizes |
| {Property 3} | Select | Component-specific options (e.g., Icon position, State, Orientation) |
| Direction | Select | LTR, RTL |

**JavaScript required:**
- `updatePlayground()` function that reads all control values, updates the preview element's classes/attributes, and generates the corresponding HTML + CSS code string
- `escapeHtml()` helper for safe code display
- Copy-to-clipboard handler
- Show more/less toggle for long code blocks

---

#### 4.4.2 Component API & Properties

**Purpose:** Document all configurable properties for the Ember component.

**Layout:** `size-table`.

| Column | Content |
|--------|---------|
| Property | Prop name in `code` style |
| Type | TypeScript-style type union (e.g., `'primary' \| 'secondary' \| 'outline'`) |
| Default | Default value |
| Description | What the property controls |

**Include every public property, even if optional.**

---

#### 4.4.3 Implementation Example

**Purpose:** Show a real-world Ember/Handlebars usage snippet.

**Layout:** Dark code block with One Dark syntax highlighting colors.

**Template pattern:**

```hbs
<!-- MyApp/templates/components/{use-case-name}.hbs -->
<Uems{ComponentName}
  @{prop1}="{value}"
  @{prop2}="{value}"
  @{dynamicProp}={{this.someProperty}}
>
  {slot content if applicable}
</Uems{ComponentName}>
```

**Choose a common, realistic use case** — e.g., a form submission button, a data table with filters, a modal with form fields.

---

#### 4.4.4 RTL Support

**Purpose:** Document right-to-left layout behavior.

**Layout:** `doc-list`.

**Content required:**
- How layout direction mirrors (what moves where)
- Text direction behavior (`auto` vs explicit)
- Spacing/padding mirroring rules
- Icon position swap behavior

**If the component has no directional behavior, this section can be omitted.**

---

### TAB 5: Accessibility (`tab-accessibility`)

This tab ensures the component meets WCAG 2.1 Level AA compliance.

#### 4.5.1 Keyboard Interaction

**Purpose:** Document all keyboard shortcuts and focus behavior.

**Layout:** `size-table` with Key | Action columns.

**Standard keys to document (include all that apply):**

| Key | Typical Action |
|-----|---------------|
| `Tab` | Move focus to the next focusable element |
| `Shift + Tab` | Move focus to the previous focusable element |
| `Enter` | Activate the component / confirm selection |
| `Space` | Toggle state / activate |
| `Escape` | Dismiss / close / cancel |
| `Arrow Up/Down` | Navigate options vertically |
| `Arrow Left/Right` | Navigate options horizontally / adjust value |
| `Home` / `End` | Jump to first/last option |
| `Page Up` / `Page Down` | Large step navigation (for sliders, long lists) |

**Only include keys relevant to your component.**

---

#### 4.5.2 ARIA Attributes & Screen Reader Guidance

**Purpose:** Ensure assistive technology support.

**Layout:** `doc-list` with inline `<code>` elements for ARIA attributes.

**Content required:**

```
• Which native HTML element to use (and which to avoid)
• Required aria-* attributes for each state/scenario
• Screen reader announcement behavior
• Live region considerations
• Label and description requirements
```

**Key ARIA attributes to consider for each component:**

| Attribute | When to use |
|-----------|------------|
| `aria-label` | Icon-only elements, unlabeled controls |
| `aria-labelledby` | When a visible label exists elsewhere |
| `aria-describedby` | Additional help text or error messages |
| `aria-disabled` | When disabled but should remain focusable |
| `aria-busy` | During loading states |
| `aria-pressed` | Toggle buttons |
| `aria-expanded` | Expandable/collapsible content |
| `aria-selected` | Selectable items |
| `aria-checked` | Checkboxes, radio buttons |
| `aria-live` | Dynamic content updates |
| `role` | When semantic HTML is insufficient |

---

#### 4.5.3 Focus State Design

**Purpose:** Specify the exact visual focus indicator.

**Layout:** `doc-list`.

**Content required:**

```
• Focus ring: {width}px solid using {color/token}
• Offset: {px} from component edge
• Border radius: {px} (should be slightly larger than component radius)
• Inner container: retains default/resting state background
```

---

#### 4.5.4 Color Contrast (WCAG AA)

**Purpose:** Prove that all color combinations meet accessibility standards.

**Layout:** Grid of contrast preview cards.

**Each card contains:**
- Color swatch showing text on background
- Variant name label
- Color hex values (e.g., `#FFFFFF on #006AFF`)
- Contrast ratio badge (e.g., `4.5:1`)
- Pass/Fail status chip (`WCAG AA Pass` in green, or `WCAG AA Fail` in red)

**Include a card for every variant** that uses a colored background.

**Info callout (copy as-is to every page):**

> **WCAG 2.1 Level AA Requires:** A contrast ratio of at least **4.5:1** for normal text (like most component labels) and **3.0:1** for large text and UI components (like icons and focus rings).

---

#### 4.5.5 Touch Target Size

**Purpose:** Ensure mobile accessibility.

**Layout:** Card with a visual box (48px dashed border) + text explanation.

**Content required:**

```
Minimum Target: 48×48px
{Explain how smaller component sizes meet this requirement — e.g.,
invisible transparent padding, spacing from adjacent targets, etc.}
```

---

## 5. Shared Functional JavaScript

Every component page includes these shared scripts at the bottom of `<body>`.

### 5.1 Dynamic TOC Generator

```
updateTOC(targetTabId)
  → Scans all h2[id] and h3[id] in the active tab panel
  → Generates <li><a class="toc-link"> elements in .toc-nav
  → Attaches smooth-scroll click handlers
  → Calls initScrollSpy()
```

### 5.2 Scroll Spy (IntersectionObserver)

```
initScrollSpy()
  → Observes all heading elements referenced by TOC links
  → rootMargin: '-80px 0px -60% 0px'
  → Toggles .active class on the matching TOC link
```

### 5.3 Tab Switching

```
Tab click handler:
  → Removes .active from all .tab-item buttons
  → Adds .active to clicked tab
  → Hides all .tab-content panels
  → Shows the matching panel
  → Calls updateTOC(targetPanelId)
  → Smooth-scrolls to top
```

### 5.4 Theme Toggle

```
Theme toggle click:
  → Toggles data-theme="light" on <html>
  → Swaps Moon ↔ Sun icon visibility
  → Saves preference to localStorage
```

---

## 6. CSS Class Reference

### Layout Classes

| Class | Purpose |
|-------|---------|
| `.components-layout` | Top-level 2-column grid (sidebar + main) |
| `.sidebar` | Left navigation sidebar |
| `.main-panel` | Primary content area |
| `.main-content-area` | Inner grid: content + TOC sidebar |
| `.main-content-inner` | Scrollable content column |
| `.toc-sidebar` | Right table-of-contents sidebar |

### Content Classes

| Class | Purpose |
|-------|---------|
| `.doc-section` | Section wrapper (margin-bottom: 64px) |
| `.doc-section-title` | Section heading (h2, 32px, weight 400) |
| `.doc-section-subtitle` | Section description (16px, muted, max-width 720px) |
| `.doc-h3` | Sub-section heading (h3, 20px, weight 600) — can include `.h3-badge` |
| `.doc-divider` | Horizontal rule between sections |
| `.doc-list` | Styled unordered list with blue left accent |
| `.do-dont-grid` | Two-column grid for Do/Don't cards |
| `.do-card` / `.dont-card` | Green/Red bordered guideline cards |
| `.related-grid` | Flex-wrap container for related component chips |
| `.related-chip` | Pill-shaped link to a related component |
| `.feedback-banner` | Bottom feedback collection banner |
| `.size-table` | Full-width specification table |

### Interactive Classes

| Class | Purpose |
|-------|---------|
| `.demo-container` | Live demo wrapper |
| `.demo-canvas` | Dot-grid preview area |
| `.code-playground` | Code tab interactive configurator |
| `.cp-toolbar` | Playground control bar |
| `.cp-preview` | Playground preview area |
| `.cp-code-area` | Dark code output block |
| `.accordion-item` | Collapsible section (if used in Overview) |
| `.state-card` | Individual state display card |

---

## 7. Quality Checklist

Use this checklist before publishing any new component page:

### Structure
- [ ] File named `{ComponentName}.html` with correct `<title>`
- [ ] Left sidebar has the component marked as `active`
- [ ] Page header has gradient title + description + all 5 tab buttons
- [ ] All 5 tab panels exist with correct IDs (`tab-overview`, `tab-style`, `tab-usage`, `tab-code`, `tab-accessibility`)
- [ ] TOC sidebar dynamically populates from active tab headings
- [ ] Resources section links to correct MD download + Figma URL with `node-id`

### Overview Tab
- [ ] Anatomy diagram with numbered markers + legend grid
- [ ] Live demo with interactive component instances showing variants and sizes
- [ ] Content Guidelines Do/Don't cards (minimum 3 Do + 2 Don't)

### Style Tab
- [ ] Variants table (all variants documented)
- [ ] States grid (all applicable states visualized)
- [ ] Sizes table (all sizes with complete specs)
- [ ] Color tokens table (every variant mapped to tokens)
- [ ] Spacing tokens table (every size mapped to spacing values)
- [ ] Corner radius visual cards
- [ ] Typography table with font weight highlight

### Usage Tab
- [ ] When to Use / When NOT to Use (two-column cards)
- [ ] Alignment & Placement rules (context-specific)
- [ ] Detailed Do's and Don'ts (4+ items per card)
- [ ] Related components (3–6 chips)
- [ ] References (Figma node, typography, radius, variant count)
- [ ] Feedback banner

### Code Tab
- [ ] Interactive playground with configurable controls
- [ ] Generated HTML + CSS output with syntax highlighting
- [ ] Copy Code + CodeSandbox actions
- [ ] Component API properties table (all props)
- [ ] Ember/Handlebars implementation example
- [ ] RTL support documentation (if applicable)

### Accessibility Tab
- [ ] Keyboard interaction table (all applicable keys)
- [ ] ARIA attributes and screen reader guidance (5+ items)
- [ ] Focus state design specs
- [ ] Color contrast cards for every colored variant (with ratio + WCAG pass/fail)
- [ ] Touch target size documentation (48×48px minimum)

### Cross-Cutting
- [ ] Both themes (light + dark) tested and rendering correctly
- [ ] All `id` attributes set on h2/h3 headings for TOC + scroll-spy
- [ ] Theme toggle persists via `localStorage`
- [ ] All component CSS scoped within the page (no global leaks)
- [ ] Responsive behavior verified at common breakpoints

---

## 8. Common Figma URL Pattern

```
https://www.figma.com/design/{FileKey}/UEMS---Design-System-3.0?node-id={NodeId}
```

Replace `{FileKey}` and `{NodeId}` with the actual values from the Figma component inspection panel.

---

## 9. CSS Custom Properties Reference

These variables power the theming system. **Never use raw hex values** — always reference these tokens.

| Variable | Light Mode | Dark Mode | Usage |
|----------|-----------|-----------|-------|
| `--prism-black` | `#ffffff` | `#0a0a0c` | Page background |
| `--prism-violet` | `#2563eb` | `#2563eb` | Primary accent |
| `--prism-violet-light` | `#1d4ed8` | `#60a5fa` | Lighter accent |
| `--prism-fuchsia` | `#0284c7` | `#0ea5e9` | Secondary accent |
| `--prism-cyan` | `#0891b2` | `#06b6d4` | Tertiary accent |
| `--prism-surface` | `rgba(37,99,235,0.028)` | `rgba(255,255,255,0.05)` | Card backgrounds |
| `--prism-surface-hover` | `rgba(37,99,235,0.055)` | `rgba(255,255,255,0.09)` | Hover state backgrounds |
| `--prism-border` | `rgba(37,99,235,0.10)` | `rgba(255,255,255,0.07)` | Border color |
| `--prism-text` | `#1a1a2e` | `rgba(255,255,255,0.92)` | Primary text |
| `--prism-text-muted` | `#64748b` | `rgba(255,255,255,0.48)` | Secondary/muted text |

---

*This guideline is derived from the Button component reference implementation. All section patterns, class names, and layout structures are production-verified.*
