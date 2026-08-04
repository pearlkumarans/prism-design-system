# Visual review output — MANDATORY format & where it goes

> A critique is only useful if it's **seen**. Every review produces the FULL visual output below —
> annotated + corrected — regardless of environment or how "clean" the design looks. Never reply with a
> one-line "looks fine", never skip the corrected view, never degrade to plain prose because a tool is
> missing. If the design is strong, still do the full treatment and call out the wins + minor issues.

## The two views (always both)

1. **Annotated** — recreate the UI faithfully (layout, copy, state), pin **numbered, severity-coloured
   markers** on the problem elements, add a **legend strip** (1 line per marker), and stack **colour-coded
   issue cards** (icon + severity + `#N` + title + *Why it hurts* + *Fix*), ordered by severity.
2. **Corrected** — same layout/state with every fix applied, **green ✓ badges** in the same spots, and a
   **"Changes applied"** summary listing each fix.

## Severity colours (markers + cards)

| Severity | Marker | Card bg | Card border-left | Card TEXT (explicit) |
|---|---|---|---|---|
| Critical | `#dc2626` | `#fef2f2` | `#dc2626` | title `#7f1d1d`, body `#374151` |
| Important | `#ca8a04` | `#fffbeb` | `#ca8a04` | title `#713f12`, body `#374151` |
| Polish | `#ea580c` | `#fff7ed` | `#ea580c` | title `#7c2d12`, body `#374151` |
| Suggestion | `#2563eb` | `#eff6ff` | `#2563eb` | title `#1e3a8a`, body `#374151` |
| Fixed | `#16a34a` | `#f0fdf4` | `#16a34a` | title `#14532d`, body `#374151` |

## Readability rule (do not skip)

**Every text element gets an EXPLICIT colour.** On a coloured/tinted background, set a dark colour from the
same family (see table) — never let text inherit, because inherited text flips to white in dark mode and
becomes invisible on a light tint. Marker numbers are white on the severity fill. Aim WCAG AA contrast.

## Where the output goes — environment-aware (this is why it sometimes "doesn't show")

- **If a visual-widget tool is available** (Cowork / claude.ai — `show_widget` / visualize): render **two
  widgets** inline (annotated, then corrected).
- **If NOT available** (local Claude Code / VS Code, plain API — no widget tool): **write a self-contained
  `.html` file** into the project (e.g. `ux-review-<screen>.html`) containing BOTH views on one page with
  **inline CSS and explicit hex colours**, then tell the user to open it in a browser. Do **not** downgrade
  to a plain-text list just because widgets aren't available — the visual is the whole point.
- Either path uses the **same structure, severity colours, and readability rule**. A short markdown summary
  (wins + priority list) accompanies the visual, never replaces it.

## Self-contained HTML skeleton (for the `.html` file path)

```html
<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>UX review</title><style>
body{font-family:-apple-system,Segoe UI,Roboto,sans-serif;background:#f9fafb;color:#111827;margin:0;padding:20px;}
.wrap{max-width:900px;margin:0 auto;}
.cv{position:relative;background:#fff;border:1px solid #e5e7eb;border-radius:8px;padding:14px;overflow:hidden;}
.mk{position:absolute;width:22px;height:22px;border-radius:50%;display:inline-flex;align-items:center;justify-content:center;font:700 12px/1 sans-serif;color:#fff;box-shadow:0 2px 6px rgba(0,0,0,.15),0 0 0 2px #fff;}
.c1{background:#dc2626}.c2{background:#ca8a04}.c3{background:#ea580c}.c4{background:#2563eb}.ok{background:#16a34a}
.card{border-radius:8px;padding:12px 14px;margin-top:10px;border:1px solid;border-left-width:4px;}
.k1{background:#fef2f2;border-color:#fecaca;border-left-color:#dc2626}
.k2{background:#fffbeb;border-color:#fde68a;border-left-color:#ca8a04}
.k3{background:#fff7ed;border-color:#fed7aa;border-left-color:#ea580c}
.k4{background:#eff6ff;border-color:#bfdbfe;border-left-color:#2563eb}
.ct{font:600 14px/1.4 sans-serif;} .k1 .ct{color:#7f1d1d}.k2 .ct{color:#713f12}.k3 .ct{color:#7c2d12}.k4 .ct{color:#1e3a8a}
.stx{font-size:12.5px;color:#374151;line-height:1.5;margin:4px 0 0}
.sl{font:700 9.5px/1 sans-serif;letter-spacing:.07em;color:#6b7280;text-transform:uppercase;margin-top:8px}
h2{font-weight:500;font-size:16px;} .changes{background:#f0fdf4;border:1px solid #bbf7d0;border-left:4px solid #16a34a;border-radius:8px;padding:12px;margin-top:12px;} .changes div{font-size:12.5px;color:#14532d;padding:2px 0}
</style></head><body><div class="wrap">
  <h2>UX review — [screen]</h2>
  <div class="cv"><!-- recreated UI + <span class="mk c1" style="top:..;left:..">1</span> markers --></div>
  <!-- legend strip -->
  <!-- issue cards: <div class="card k1"><div class="ct">…</div><div class="sl">Why</div><p class="stx">…</p><div class="sl">Fix</div><p class="stx">…</p></div> -->
  <h2 style="margin-top:20px">Corrected</h2>
  <div class="cv"><!-- same UI, fixes applied, <span class="mk ok" style="top:..;left:..">1</span> --></div>
  <div class="changes"><div>✓ #1 …</div><div>✓ #2 …</div></div>
</div></body></html>
```

## Enforcement checklist (every review)
- [ ] Both annotated AND corrected produced (widget or `.html`).
- [ ] 4–8 severity-coloured markers + legend + colour-coded cards (Why + Fix).
- [ ] Every text element has an explicit colour (readable in light AND dark).
- [ ] Corrected view has green ✓ badges + "Changes applied".
- [ ] Never a bare one-line summary in place of the visual.
