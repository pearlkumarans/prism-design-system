# Design cases — dashboards, components, color & data-viz

> Concrete, reusable design rules for Endpoint Central dashboards and data displays. Apply these when
> designing any dashboard, status tile, chart, table, or metric view. This is a **growing library** —
> append new cases in the same format as they come up.
>
> Color guidance is **token-driven**: map the named roles below to the UEMS / product Design System
> **semantic tokens** (danger / warning / caution / info / success / neutral). Don't hardcode arbitrary
> hex — use the semantic token so it stays consistent and theme-aware.

## Case 1 — Severity / status data → SEMANTIC color (one meaning per color)

When each value carries a **severity or status meaning** (Critical / High / Medium / Low; Healthy /
Vulnerable / Highly Vulnerable; Failed / In Progress / Success; Compliant / Non-compliant), every level
gets its own **meaning color** from the semantic palette:

| Meaning | Semantic token | Typical hue |
|---|---|---|
| Critical / Highly Vulnerable / Failed | `danger` | red |
| High | `warning` | orange |
| Medium / attention | `caution` | amber / yellow |
| Low / informational | `info` | blue |
| Healthy / Success / Compliant | `success` | green |
| Unknown / Not applicable | `neutral` | grey |

**Rules:** color = meaning, and it is **consistent across the whole product** — a red tile means the
same thing on every screen. Order the palette worst → best so the eye reads the most urgent first.
Always pair the color with an **icon + text label** (never color alone). This is the pattern behind
EC's Healthy / Vulnerable / Highly Vulnerable tiles.

## Case 2 — Equal-priority / same-category series → MONOCHROMATIC (one hue, vary TONE only)

When the items are the **same priority with no severity meaning** — e.g., distribution by OS, by
department, by vendor, patches-by-application, devices-by-model — do **NOT** give each a different hue.
A rainbow here implies a meaning that isn't there and adds visual noise. Use **one hue** (usually the
primary/brand token) and vary only the **tone / lightness** across the series (light → dark).

- This reads as "these are peers, differing only in quantity/label" — calm and scannable.
- **Sort by value (largest → smallest)** so darker tone = bigger value, intuitively.
- Cap at ~5–7 tone steps; beyond that, roll the tail into an "Others" bucket.
- Reserve hue changes for **real meaning** (Case 1). Monotone = "no severity here."

## Case 3 — Quantitative trend / magnitude → SEQUENTIAL single-hue scale

Heatmaps, gauges, "count over time," compliance %: single hue, light (low) → dark (high) — the same
monotone principle as Case 2 applied to a continuous measure. Only use a **diverging** scale (two hues
with a neutral middle, e.g. below-target red ↔ above-target green) when there's a **meaningful midpoint
or target**; otherwise stay single-hue.

## Case 4 — Genuinely distinct categories that must be told apart → limited categorical palette

Only when categories are truly distinct **and none is "more severe":** use a small (≤6) **colorblind-safe
categorical palette** with distinct hues, each with a text label. Never make red-vs-green the *only*
difference. If you need more than ~6, you probably want grouping or a monotone list instead.

## Cross-cutting rules (apply to every dashboard case)

- **Never rely on color alone** (WCAG 1.4.1): add labels, icons, patterns, or the value itself.
- **Contrast:** numbers/text on tiles ≥ 4.5:1; large numerals ≥ 3:1 (WCAG AA).
- **Most-important-first:** worst/critical tiles top-left; support drill-down (tile → filtered list →
  per-item detail) — EC's standard dashboard pattern (see `console-ia.md` §4).
- **Consistency:** the same status → same color + same label everywhere in the product.
- **States for every tile/chart:** empty, loading, partial/mixed, error, no-data — give the next action
  (see `console-ia.md` §5 and `support-kb-map.md`).

## Case 5 — Button hierarchy: ONE primary action per view

Only **one primary (filled / high-emphasis) button** per screen or section — the single most important
action. Everything else uses **secondary** (outline / tonal) or **tertiary** (text / link) styles.

- **Why:** two primaries compete and cancel out — the eye can't tell what to do (visual hierarchy;
  Hick's law). A single primary makes the intended next step obvious.
- **Do:** primary = the main CTA of that view (Save, Deploy, Next, Create). Secondary = Cancel, Back,
  and alternative actions. In a multi-step wizard, "Next/Save" is primary and "Back/Cancel" secondary.
- **Don't:** two filled/primary buttons side by side; a whole toolbar of primary-styled buttons (if
  many equal actions and no single main one, use secondary styles — none is primary).
- **Destructive actions** (Delete, Wipe, Uninstall) are **not** the loud primary — use a `danger`-styled
  button + a confirmation, so a high-impact action isn't the default-looking CTA.
- Primary color comes from the **primary/brand semantic token**; keep it consistent across the product.

## How to add more cases
Append below in this format so the library stays consistent:
**Case N — <when it applies> → <the rule>** · *Why* · *Do / Don't*.
