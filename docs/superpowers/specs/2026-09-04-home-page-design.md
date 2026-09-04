# Home Page Redesign (piece 4a)

**Design references:** `Apache Camel Home.dc.html` (Home view and All Camel Projects view),
`design_handoff_camel_website_redesign/integration/` (the pre-written `/projects/` slice).
**Scope memo:** `SCOPE.md` §4 (route table), §6 item 4 (order of work).
**Predecessors:** pieces 1 (tokens + typography), 6 (syntax highlighting), 2 (shared chrome),
3 (Antora docs UI), all landed on `feature/new-website-design`.

## Goal

Replace the shortcode-driven front page with the Home screen from the design reference, and
land the `/projects/` page that Home links to.

## Scope

**In scope**

- `layouts/index.html`, `content/_index.md`, `data/home.yaml`, `antora-ui-camel/src/css/frontpage.css`
- A new JS module for the DSL tabs and the hero copy button
- The `/projects/` page from the handoff's integration package
- Two one-line corrections in files this piece already touches: the `config.toml` menu label
  "Documentation" to "Docs", and the header search field restyled to the new tokens
- A committed Hugo build and screenshot harness under `tests/hugo/`

**Out of scope**

Docs index, Download, Security, Community, Tooling, Blog list (deferred; the design owner
reassesses after this piece ships). Every undesigned template stays as it is. Mobile work is
limited to keeping the existing 1024px and 626px breakpoints working.

## Decisions

### D1. Content lives in `data/home.yaml`, not in markdown

`content/_index.md` is reduced to front matter (title, description, keywords). All copy moves to
`data/home.yaml` and `layouts/index.html` loops it.

This follows the pattern the handoff's `/projects/` slice already establishes with
`data/projects.yaml`, and the one SCOPE names for `data/docs-projects.yaml`. It also removes the
`section`, `div`, and `icon` shortcode nesting that makes the current page unreadable. Those
shortcodes stay in the repo; other pages still use them.

### D2. The four headline statistics are verified, not copied

The design's figures are illustrative. Measured on 2026-09-04 against `apache/camel`:

| Design claim | Measured | Ship |
|---|---|---|
| 100k+ commits | 83,428 commits on `main` | **83,000+** |
| 1,600+ contributors | 1,583 distinct authors (329 GitHub accounts) | **1,500+** |
| 311 components | 398 `*-component.html` pages in the built docs | **390+** |
| 300+ releases | 307 tags | **300+** |

Two of the four overstated the project. `data/home.yaml` carries a comment recording the source
and the date for each, so the next person to touch them knows what they are and how to recheck.

`data/projects.yaml` ships as the design owner authored it, including its per-project activity
figures. That was an explicit decision: those numbers are the owner's, not the design file's.

**Copy consistency:** the design's hero lead and the first feature chip both say "300+
connectors". Both become "390+" to agree with the stat strip. `config.toml`'s
`organizationDescription` says "350+ connectors" and is left alone; see Open Items.

### D3. Header search stays on Hugo pages

SCOPE §3 moves search into the Antora nav panel, and piece 3 did that. Hugo pages have no nav
panel to host it, so removing it from the header would leave them with no search at all. The
header field stays and is restyled to the new tokens. Docs pages keep the nav-panel field.
Search therefore appears in one place per section, never two on the same page.

### D4. Hero art is the camel mark in the gradient panel

`logo-d.svg` at 62% width inside the rounded radial-gradient panel, as the design shows.
`camel-gears.svg` is not referenced by the new home page; it stays in the repo for other pages.

### D5. `/projects/` lands in this piece

Home's "Explore all Camel projects →" button and the footer's "All projects" link both target
`/projects/`, which does not exist. Shipping Home without it means either a dead link that fails
`check:links` or a temporary target to be reworked later.

The handoff ships the page pre-written. `layouts/partials/header.html` already special-cases
`/projects/` for its CTA label, so piece 2 anticipated it.

**The shipped layout does not build as-is.** Line 3 of `layouts/projects/list.html` reads:

```
{{- $manifest := .Site.Data "rev-manifest" }}
```

`.Site.Data` is a map, not a method, so Hugo fails with "can't give argument to non-function".
The variable is never used; the template resolves icons inline with
`index site.Data "rev-manifest"`. The line is deleted when the file lands.

### D6. Neutral muted label colors move to `--color-ink-soft`

The design uses `#7a7164` for the stat-strip labels, the projects group titles, and the
"← Back to home" link. Measured against the surfaces they sit on:

| Text | On | Ratio | 4.5:1 |
|---|---|---|---|
| `#7a7164` | `#f4eee3` paper-2 | 4.16:1 | fails |
| `#7a7164` | `#faf7f1` paper | 4.49:1 | fails |
| `#8a8074` (`--color-ink-muted`) | `#f4eee3` | 3.35:1 | fails |
| `#5c554c` (`--color-ink-soft`) | `#f4eee3` | 6.36:1 | passes |

All of these are small text carrying real information, so they take `--color-ink-soft`. The
visual difference is slight and the fix is free. This does **not** extend to the orange accent
colors; see Open Items.

### D7. One new JS module, `09-home.js`

The handoff says to reuse `06-copy-to-clipboard.js`. That module is hard-scoped to
`.doc pre.highlight, .doc .literalblock pre` and rewrites Antora listing blocks. It will never
match the hero, and widening it would put docs-specific DOM surgery on the front page.

`09-home.js` handles the DSL tabs and the hero copy button, following the conventions of
`08-search-hotkey.js`: an IIFE, `'use strict'`, no dependencies, and a no-op when its elements
are absent (it loads on every page in the bundle).

**Tabs contract.** The template emits all three panels; the two inactive ones carry the `hidden`
attribute. Buttons are `role="tab"` inside `role="tablist"` with `aria-selected` and
`aria-controls`; panels are `role="tabpanel"`. Clicking a tab flips `hidden` and `aria-selected`.
Arrow keys move between tabs. Without JavaScript the YAML panel is visible and the tabs are
inert, which is the accepted degradation.

**Copy contract.** The button writes the command to the clipboard, swaps its label to "Copied!"
for 1600ms, and restores it. `navigator.clipboard` absent means the button is not rendered.

## File structure

| File | Change |
|---|---|
| `data/home.yaml` | Create. All home page copy and figures. |
| `layouts/index.html` | Rewrite. Loops `data/home.yaml`; no shortcodes. |
| `content/_index.md` | Reduce to front matter. |
| `antora-ui-camel/src/css/frontpage.css` | Rewrite. 435 lines of old layout out. |
| `antora-ui-camel/src/js/09-home.js` | Create. DSL tabs, hero copy. |
| `data/projects.yaml` | Create from the handoff, unmodified. |
| `layouts/projects/list.html` | Create from the handoff, minus the broken line. |
| `content/projects/_index.md` | Create from the handoff, unmodified. |
| `antora-ui-camel/src/css/projects.css` | Create from the handoff, retargeted to the new tokens. |
| `antora-ui-camel/src/css/site.css` | Add `@import url('projects.css');`. |
| `antora-ui-camel/src/css/header.css` | Restyle the search field. |
| `config.toml` | Menu label "Documentation" to "Docs". |
| `tests/hugo/build.sh` | Create. Build and screenshot harness. |

`frontpage.css` keeps its `a.button` rules, which piece 1 already retargeted and which the
header and other pages consume. Everything from `div.frontpage.news` through the old
`functionalities`, `projects`, and `apache` section rules is deleted, along with the
`text-transform: uppercase` on `section.frontpage h1, h2` that currently shouts every heading.

## Sections

Container for every section: `max-width: 1200px`, `padding: 0 32px`, centered. Cards share one
hover treatment: `border-color: --color-line-hover`, `box-shadow: 0 14px 34px -22px rgb(33 28 23 / 35%)`,
`translateY(-2px)`, 150ms.

**Hero.** Grid `1.05fr 0.95fr`, gap 56px, padding `64px 32px 56px`. Left: eyebrow pill (mono
12.5px/500, orange-deep on orange-tint, 6px 12px, 20px radius) reading "In production since 2007
· Apache License 2.0"; h1 Archivo 800 60px, line-height 1.02, letter-spacing -0.03em; tagline
Archivo 600 25px in ink-2; lead 17.5px/1.55 in ink-soft, max-width 520px; two buttons
(`.button.dark` "Get Started →", `.button.light` "What is Camel?"); then the CLI bar. Right: the
art panel, `aspect-ratio: 1/0.86`, 16px radius, `radial-gradient(circle at 50% 50%, --color-paper-2 0%, --color-paper 70%)`,
1px line border, mark at 62% with `drop-shadow(0 30px 50px rgb(233 120 38 / 30%))`.

**CLI bar.** Max-width 520px, ink background, 9px radius, 1px dark-line border, overflow hidden.
Code in mono 13.5px, padding 14px 16px, `white-space: nowrap` with ellipsis; the `$` glyph in
`--color-prompt`. Copy button: `--color-dark-2` background, 1px dark-line left border, mono
12px/600, padding 0 16px, `align-self: stretch`, hover `#3a342c`. Command:
`camel init hello.yaml && camel run hello.yaml`.

**Stat strip.** Full-bleed band, paper-2 background, 1px line top and bottom. Inner flex, padding
`30px 32px`, gap `12px 48px`. Label Archivo 700 15px in ink-2. Four stats, gap 44px: number
Archivo 800 26px in orange-deep (26px bold clears the 3:1 large-text threshold at 3.55:1),
label 12px/600 uppercase, letter-spacing 0.06em, in ink-soft per D6.

**Get started.** Padding `76px 32px 20px`. Centered header: mono eyebrow 12.5px/600 uppercase
letter-spacing 0.08em in orange-deep, "Get Started Your Way"; h2 Archivo 800 38px,
letter-spacing -0.025em, "Three clear paths". Grid `repeat(3, 1fr)`, gap 22px. Card: white, 1px
line, 14px radius, 28px padding, column flex. Title row: h3 Archivo 700 20px plus optional badge
(mono 10.5px/600, white on camel-orange, 3px 8px, 20px radius, uppercase). Description 15px/1.55
ink-soft, `flex: 1`. Code block: mono 12.5px/1.6, syntax-text on ink, 9px radius, 14px 15px.
Link orange-deep 700 14.5px, "Start with {name} →".

**Features.** Padding `66px 32px 20px`. Eyebrow "Why developers choose Camel", h2 "Built for real
integration work". Grid `repeat(3, 1fr)`, gap 20px. Card white, 13px radius, 26px padding. Tag
chip 38px square, 9px radius, orange-tint background, Archivo 800 16px orange-deep. h3 Archivo
700 18px. Body 14.5px/1.55 ink-soft.

**Code example.** Padding `66px 32px 20px`. Eyebrow "See it in action", h2 "Route messages from
Kafka to a database", subhead 16px ink-soft. Panel max-width 820px, ink background, 14px radius,
1px dark-line border, `box-shadow: 0 24px 60px -30px rgb(33 28 23 / 50%)`. Tablist: flex, gap
2px, padding `12px 14px 0`, 1px dark-line bottom border. Tab mono 13px/600, padding
`9px 16px 13px`; active in syntax-text with a 2px camel-orange underline inset 12px and pinned
at `bottom: -1px`; idle in `--code-tab-idle-font-color`. Panel `pre` mono 13.5px/1.7,
padding 22px 24px, min-height 200px. Run bar: padding `14px 24px`, 1px dark-line top border,
`--color-dark-3` background, `$` in `--color-prompt`, command in `--color-on-dark-dim`.

**Tiles.** Padding `66px 32px 20px`. Eyebrow "Core Projects", h2 "Start with what most teams
use", subhead. Grid `repeat(4, 1fr)`, gap 18px. Card white, 13px radius, 24px padding, column
flex: 34px icon, h3 Archivo 700 17px, body 14px/1.5 with `flex: 1`, link orange-deep 700 13.5px.
Centered `.button.light` below, margin-top 34px, "Explore all Camel projects →".

**Closing band.** Section margin `72px auto 0`. Inner ink background, 18px radius, padding
`52px 48px`, flex wrap, gap 24px. Left column `flex: 1`, min-width 280px: h2 Archivo 800 30px in
on-dark, body 16px/1.55 in on-dark-soft, max-width 560px. Buttons: `.button.dark` "Be involved",
`.button.on-dark` "How to contribute".

**Responsive.** At 1024px the 3-column and 4-column grids become 2, the hero stacks to one column
with the art panel below, and the stat strip wraps. At 626px every grid becomes 1 column and the
closing band's buttons stack full width.

## New tokens

Four values in the design have no token and are used more than once:

| Token | Value | Use |
|---|---|---|
| `--color-dark-3` | `#1c1813` | The code panel's run bar, one step darker than ink |
| `--color-prompt` | `#e0805a` | The `$` glyph in the hero bar and the run bar |
| `--color-on-dark-dim` | `#cabfb0` | Command text in the run bar |
| `--color-button-on-dark-border` | `#4a443c` | `.button.on-dark` border, visible on ink |

`--color-button-on-dark-border` replaces the current `--color-dark-line` on `.button.on-dark`,
which is nearly invisible against ink. Every other color resolves to an existing token.

## Data schema

```yaml
hero:
  eyebrow: string
  title: string
  tagline: string
  lead: string
  primary_cta:   { label: string, url: string }
  secondary_cta: { label: string, url: string }
  command: string
stats:
  label: string
  items: [ { num: string, label: string, source: string } ]
get_started:
  eyebrow: string
  heading: string
  items: [ { name, badge, description, code, url } ]
features:
  eyebrow: string
  heading: string
  items: [ { tag, title, body } ]
example:
  eyebrow: string
  heading: string
  subhead: string
  run_command: string
  tabs: [ { id, label, code } ]
tiles:
  eyebrow: string
  heading: string
  subhead: string
  items: [ { name, icon, description, url } ]
  cta: { label: string, url: string }
closing:
  heading: string
  body: string
  primary_cta:   { label: string, url: string }
  secondary_cta: { label: string, url: string }
```

`stats.items[].source` is a comment-style provenance string, rendered nowhere, recording where
each figure came from and when.

## Verification

Every task builds the site, and every task that changes something visible is looked at.

`tests/hugo/build.sh` builds to a scratch directory, serves it, and writes screenshots. It
resolves the GitHub token itself via `gh auth token` when `GITHUB_TOKEN` is unset, so no subagent
handles the credential and it never reaches a transcript or a log. Without a token the build
fails with 32 rate-limit errors on `getJSON` calls that back the release-note pages, which is why
the harness owns this rather than each caller.

Baseline as of 2026-09-04: `hugo` exits 0 with zero errors in about 7 seconds.

**Acceptance for each task** is a measurement and a look:

1. `hugo` exits 0 with no new errors.
2. `yarn workspace antora-ui-camel run bundle` passes stylelint.
3. `html-validate` passes on the changed pages.
4. Named elements are measured with `getComputedStyle` / `getBoundingClientRect` against the
   values in this spec.
5. A screenshot of the page at 1440px, 1024px, and 626px is captured and reviewed.

Step 5 is not optional. Piece 3 shipped three Critical defects that property measurement could
not see, because measuring an element says nothing about what is painted on top of it.

## Quality gates

- Stylelint `stylelint-config-standard` with the repo's five disabled rules. Sizes use the
  `calc(N / var(--rem-base) * 1rem)` idiom; raw `px` only for hairlines and rule widths, matching
  the convention confirmed across 22 existing occurrences.
- `html-validate` on `public`. Card grids are lists, per the handoff's note.
- No inline styles. No new npm dependencies.
- Text below 18.66px meets 4.5:1 against its own background, except the orange accents recorded
  in Open Items.
- No token is deleted until its last consumer is gone, verified per token.

## Open items for the design owner

1. **Orange accent contrast.** `--color-orange-deep` (`#c95f12`) reaches 3.83:1 on paper and
   3.48:1 on orange-tint. Body links, the hero eyebrow pill, the section eyebrows, and the card
   links are all below 4.5:1. The palette is the owner's and shipped site-wide in pieces 1
   through 3, so this piece does not change it, but the home page makes it prominent. Darkening
   the accent to about `#b4530c` would clear 4.5:1 on paper.
2. **Connector count.** This page says "390+"; `config.toml`'s `organizationDescription` says
   "350+". Both are true against 398, but they disagree. The description is used for SEO and
   structured data and was left alone.
3. **Stat maintenance.** The four figures are hand-maintained with a recorded date. Nothing
   refreshes them automatically.
4. **No-JS tabs.** Java and XML are unreachable without JavaScript.
5. **Deferred pages.** Docs index, Download, Security, Community, Tooling, and Blog list remain
   on the old styling and will look inconsistent with Home until the next piece.
