# Generating Pages with AI — a User's Guide

A guide for anyone who wants to create new screens in this product **by prompting an AI**
(Claude Code or similar) — no need to write code yourself. If you're the AI/agent, read
`AGENTS.md` and the `generate-layout` skill instead; this page is for the human.

> **Prefer a visual version?** Open `design-system-library/docs/generating-pages.html` in the browser — the same
> guide styled as a design-system doc page. (Serve the repo root, e.g.
> `http://localhost:8790/design-system-library/docs/generating-pages.html`.)

---

## 1. What this is

The product is built as two parts:

- **The shell** (`Layout/Shell.html`) — the fixed frame of the app: top navigation, side
  menus, the right-hand utility rail, theming, and a small "router" that swaps content in
  and out of the middle area.
- **Pages** — the content that fills that middle area (a form, a list, a detail view, a
  dashboard). Each page is a self-contained file.

Think of the shell as a **picture frame with navigation**, and each page as a **picture** you
slot into it. You describe the picture you want in plain English; the AI builds it from
proven templates and hangs it in the frame for you.

**You don't write code.** You describe the page; the AI generates the file, styles it with
the design system, and wires it into the shell so you can open it.

---

## 2. How it works (the mental model)

Four things are worth understanding — no code required:

1. **One shared shell drives everything.** Every page you generate runs inside the same
   `Layout/Shell.html`, so it automatically gets the product's header, menus, theme, and
   navigation.
2. **Pages are grouped by project/task.** They live under `projects/<project-name>/`. Keeping
   one project (or task) per folder keeps related screens together.
3. **Pages are built from templates ("archetypes").** Rather than inventing layouts, the AI
   starts from a proven pattern — a form, a list, a detail page, or a dashboard — and fills it
   with your content using the design-system components. That's why generated pages look
   consistent with the rest of the product.
4. **Each page is registered with a short name (a "slug").** The slug is how you open the page
   (e.g. `?view=demo-deployments`). Slugs describe *what the page is*, not the template it
   came from.

---

## 3. How to view a generated page

Once a page exists, you can reach it three ways:

- **By URL** — add `?view=<slug>` to the shell address:
  `http://localhost:8790/Layout/Shell.html?view=demo-deployments`
- **By clicking a tab** — if the AI wired a module tab to the page (e.g. the *Software
  Deployment* tab opens the demo deployments list), just click it.
- **In-flow** — pages can link to each other (a form's *Save* opens a list, a list row opens a
  detail, etc.).

You can also open a page's file **directly** in the browser (outside the shell) — useful for
previewing a single screen.

> To preview locally you need a small web server running at the project root
> (e.g. `python3 -m http.server 8790`). Opening files with `file://` won't work because pages
> are fetched over the network.

---

## 4. How to prompt for good results

The AI produces the best pages when your prompt answers a few questions. You don't need all
of them — anything you leave out, the AI will choose a sensible default or ask.

**The recipe — mention as many as apply:**

1. **Project / task name** — which folder it belongs to (e.g. "under project `acme`").
2. **What the page is for** — its purpose in plain words. This becomes the slug and title.
3. **Which kind of page** — pick an archetype (see §5) or let the AI choose:
   *form*, *list*, *detail*, or *dashboard*.
4. **Where it lives** — which module/tab (Home, Configurations, Threats & Patches, Software
   Deployment, Inventory, Reports…). Optionally: "make it the default when I click that tab."
5. **The important content** — fields for a form, columns/KPIs for a list, sections for a
   detail, widgets for a dashboard.
6. **Navigation** — what should happen on actions (e.g. "Save goes to the device list", "a row
   opens the device detail").

### Good prompt examples

> "Under project **acme**, create a **form page** to *configure a firewall rule*, on the
> **Configurations** tab. Fields: rule name, direction (inbound/outbound), protocol, port
> range, action (allow/block). On **Save**, go to the firewall rules list."

> "Add a **list page** called *patch approvals* under project **acme**, on **Threats &
> Patches**. Columns: patch name, severity badge, affected devices, status. Include KPI cards
> for Approved / Pending / Declined. Clicking a patch opens its detail page."

> "Make a **dashboard** for project **acme** *inventory overview*, and open it when I click the
> **Inventory** tab. Show KPI tiles for total assets, and charts for assets by OS and by
> warranty status."

### Vague vs. specific

| Vague (AI has to guess) | Specific (better output) |
|---|---|
| "Make a settings page." | "Under project `acme`, a **tabbed form** for *agent settings* on the Configurations tab, with tabs General, Network, Security." |
| "Add a list." | "A **list page** *managed devices* on Inventory: columns device, platform, status badge, owner, last seen; row → device detail." |
| "Build a dashboard." | "A **dashboard** *security overview* on Threats & Patches with KPI tiles (vulnerable, patched, at-risk) and a donut of severity." |

### Iterating

After the first version, refine in plain language:

- "Add a KPI row above the table."
- "Make the page header collapse when I scroll."
- "Change the Save button to go to the deployments list instead."
- "Add a Status column with a colored badge."
- "Rename the page to *deployment history*."

### Ask for a check

End with **"verify it in the browser"** and the AI will load the page, click through it, and
confirm it works (and show you a screenshot) before calling it done.

---

## 5. The building blocks (archetypes)

Ask for whichever fits; the AI adapts it to your content.

| Ask for a… | You get | Good for |
|---|---|---|
| **Form** (sectioned) | A scrolling form split into titled sections + a pinned footer | Create/edit records with several groups of fields |
| **Tabbed form** | A form with category tabs | Longer settings split into categories |
| **List** | A data table with KPIs, search, filters, pagination | Browsing/managing many records |
| **Detail** | A record page with header, summary, tabs, info cards | Inspecting one item |
| **Dashboard** | KPI tiles + charts + widgets | A module's landing/overview screen |

See `projects/demo/` for a working example of a **form → list → detail** flow.

---

## 6. Tips & gotchas

- **Name by purpose, not template.** "create-deployment", "patch-approvals" — not
  "sectioned-form" or "list-view". It's what you'll type in the URL.
- **One project folder per feature/task** keeps things tidy and shareable.
- **Give real-ish sample content** (field names, column names) — it makes the page instantly
  useful and easier to review.
- **Design consistency is automatic** — pages use the shared component library and design
  tokens, so you don't need to specify colors, fonts, or spacing.
- **If a page opens blank**, tell the AI — it's usually a one-line wiring fix.

---

## 7. Related docs

- `projects/README.md` — folder layout and the worked `demo/` example.
- `AGENTS.md` — the technical contract (for the AI/agent, or curious humans).
- `.claude/skills/generate-layout/` — the Claude Code skill that automates all of this.
- `Layout/layouts.md` — catalogue of the built-in layout patterns.
