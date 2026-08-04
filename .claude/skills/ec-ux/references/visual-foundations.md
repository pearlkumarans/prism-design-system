# Visual hierarchy & applying the design system

> **The Design System (DS) already owns the tokens** — the spacing scale, control heights, type scale,
> radius, and colours. This skill does **not** redefine them. Its job is two things the DS can't do for you:
> (1) get the **hierarchy** right, and (2) pick the **right size / variant of each component for its
> context**. Always cite the DS token; never invent pixel values or a parallel scale.

## 1. Hierarchy — the main job

- **Build order with, in priority: size → weight → colour/contrast → spacing → position.** Combine a couple;
  don't rely on one alone.
- **One clear focal point per screen** — the primary action or the key metric. Everything else supports it.
  If everything is bold/coloured/large, nothing leads (Von Restorff; see `ux-laws.md`).
- **Reading order:** top-left → down (F/Z); most important content top-left; primary action bottom-right in a
  form/wizard footer; worst-first on health tiles.
- **De-emphasise the secondary** — quieter colour, lighter weight, smaller variant — so the primary stands
  out (ties to the one-primary-button rule). Secondary buttons stay quiet; only the one primary is loud.
- **Alignment is hierarchy too** — left-align labels/text, align to the DS grid, keep consistent edges.
- **Whitespace (from the DS scale) is structure** — it groups and gives the focal point room. Use the DS
  spacing tokens; don't hand-tune margins.

## 2. Pick the right size / variant for the context (don't default to "small")

Choosing the correct DS size for each element is a hierarchy decision — the size should reflect the
element's **importance** and its **context's density/legibility**, not just "whatever's smallest."

- **Table badges/pills → medium, not small.** A status/severity badge in a table row carries meaning and
  must read at row scale — use the **medium** variant. *Small* badges are only for genuinely secondary,
  tight, inline spots (metadata inside a dense cell, a count next to a label). Example of the bug: a status
  badge shown at `small` in a fleet table — bump it to `medium` so it's legible while scanning 50+ rows.
- **Buttons:** the primary action uses the DS default/emphasised size; secondary/tertiary are the quieter/
  smaller variants. Never a tiny primary or a loud secondary.
- **Headings:** match the DS heading level to section depth (page title > section > subsection) — don't skip
  levels or use a small heading for a major section.
- **Icons:** size to match the adjacent text/control from the DS icon sizes; don't mix random icon sizes.
- **Inputs/controls in a row** share the DS control height — never mismatched heights.
- **Rule of thumb:** *bigger/medium for meaningful, scannable things; small only for truly secondary or
  inline.* When unsure between two DS sizes, pick the one that matches the element's role in the hierarchy.

## 3. Consistency of size per role

Same context → same size, every time: **every table badge the same variant**, every primary button the same
size, every section heading the same level. Mixed sizes for the same role break both the rhythm (which the
DS gives you) and the hierarchy (which you own).

## In a brief / review
Check: (a) is there **one clear focal point** and a sensible reading order? (b) is each component the **right
DS size/variant for its context and importance** — e.g. table badge *medium*, not *small*? (c) are
**same-role elements consistent**? Reference DS tokens/variants by name; flag any element whose size fights
its hierarchy (too small to scan, or too loud for a secondary role).
