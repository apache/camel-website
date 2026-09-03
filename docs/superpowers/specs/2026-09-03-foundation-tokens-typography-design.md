# Foundation: tokens and typography

Piece 1 of 6 of the camel-website redesign. Branch `feature/new-website-design`.

The six pieces: 1 foundation (this document), 2 shared chrome, 3 Antora docs UI,
4 designed Hugo pages, 5 undesigned template sweep, 6 syntax highlighting theme.

Design source: `Apache Camel Home.dc.html` and `Apache Camel Site Pages.dc.html`,
with decisions recorded in the design handoff `SCOPE.md` (2026-09-03).

## Why this is its own piece

The redesign replaces the site's palette and type system at `:root` in
`antora-ui-camel/src/css/vars.css`. That single stylesheet feeds both the Hugo
pages and the Antora documentation UI, so the swap repaints roughly 15 content
sections plus every documentation page at once. Nothing else in the redesign can
be evaluated until that repaint is stable, and if it makes documentation
unreadable we want to know before building twelve page layouts on top of it.

This piece changes tokens and font plumbing only. It deliberately ships a site
that is half-repainted: new colors and type against old layouts. That is
expected and is not a defect to fix here.

## Scope

In scope:

- Add Archivo and JetBrains Mono as self-hosted faces; remove Droid Sans Mono.
- Replace the color palette at `:root` and re-point the existing semantic vars.
- Set container widths and a shared horizontal gutter.
- Repair breakage in existing stylesheets that the repaint causes, limited to
  restoring legibility and contrast.

Out of scope, deferred to later pieces:

- Header and footer markup or layout (piece 2).
- Antora nav, toolbar, article, and TOC treatments (piece 3).
- Any Hugo page layout, including the home page and `/projects/` (piece 4).
- Release notes and release partials (piece 5).
- The syntax highlighting theme in `highlight.css` (piece 6).

## Decisions

### 1. Fonts

Add to `antora-ui-camel/package.json` devDependencies:

- `@fontsource/archivo` at weights 500, 600, 700, 800.
- `@fontsource/jetbrains-mono` at weights 400, 500, 600.

Remove `typeface-droid-sans-mono`.

The repo currently mixes two font-package conventions: `@openfonts/*` for Open
Sans and the older `typeface-*` for Droid Sans Mono. We add a third,
`@fontsource/*`, because `@openfonts` is unmaintained and does not publish
Archivo. Removing Droid Sans Mono in the same change leaves two conventions
rather than three. Open Sans stays on `@openfonts` and is not touched.

New `src/css/typeface-archivo.css` and `src/css/typeface-jetbrains-mono.css`
follow the `@font-face` pattern already used by `typeface-open-sans.css`:
`font-display: swap`, a `local()` entry first, then `~@fontsource/...` woff2
and woff URLs. `postcss-url` rewrites the `~@` prefix and `gulp-rev-rewrite`
revs the files into `rev-manifest.json`; this must be confirmed by inspecting
the manifest after a bundle, not assumed.

`site.css` imports both new stylesheets and drops the
`typeface-droid-sans-mono.css` import.

### 2. Palette

Replace the color block at the top of `vars.css` `:root`. New tokens:

```
--color-paper:         #faf7f1   /* page background */
--color-paper-2:       #f4eee3   /* nav panel, table heads, tinted blocks */
--color-line:          #e7e0d5   /* borders */
--color-line-soft:     #f0e9dd   /* row dividers */
--color-line-hover:    #d9ccb8
--color-ink:           #211c17   /* headings, dark blocks, footer */
--color-ink-2:         #3a332b   /* body text */
--color-ink-soft:      #5c554c   /* secondary text */
--color-ink-muted:     #8a8074   /* eyebrows, meta */
--color-camel-orange:  #e97826   /* unchanged; primary CTA */
--color-orange-deep:   #c95f12   /* links, CTA hover */
--color-orange-tint:   #fbead8   /* chips, tip badges */
--color-orange-glow:   #f2a05a   /* accents on dark */
--color-dark-2:        #2b2620   /* code chrome on dark */
--color-dark-line:     #34302a
--color-on-dark:       #faf7f1
--color-on-dark-soft:  #c4bbac
--color-on-dark-muted: #8f867a
```

`--color-camel-orange` keeps its current value, so it is retained rather than
redefined. `--color-camel-orange-light` and the greyscale ramp
(`--color-smoke-*`, `--color-gray-*`, `--color-jet-*`) stay declared until a
later piece proves nothing references them; deleting them here would break
stylesheets this piece is not otherwise touching.

`--color-asf-dark-blue`, `--color-asf-moderate-blue`, and
`--color-asf-light-blue` stay declared but are removed from all UI chrome. They
remain available for the ASF logo and branding only.

Semantic vars are re-pointed as follows:

| var | new value |
|---|---|
| `--body-background` | `var(--color-paper)` |
| `--body-font-color`, `--doc-font-color` | `var(--color-ink-2)` |
| `--heading-font-color` | `var(--color-ink)` |
| `--link-font-color` | `var(--color-orange-deep)` |
| `--link_hover-font-color` | `var(--color-camel-orange)` |
| `--panel-background`, `--nav-background`, `--toolbar-background` | `var(--color-paper-2)` |
| `--panel-border-color`, `--nav-border-color`, `--toolbar-border-color`, `--toc-border-color` | `var(--color-line)` |
| `--nav-heading-font-color`, `--toc-heading-font-color` | `var(--color-ink)` |
| `--navbar-background` | `rgb(250 247 241 / 90%)` |
| `--navbar-font-color` | `var(--color-ink-soft)` |
| `--navbar-hover-font-color` | `var(--color-ink)` |
| `--footer-background` | `var(--color-ink)` |
| `--footer-font-color`, `--footer-link-font-color` | `var(--color-on-dark-soft)` |
| `--table-border-color` | `var(--color-line)` |

### 3. Two vars that carry two values

`SCOPE.md` specifies a single value for two contexts in two places. Both are
resolved here by splitting the token rather than by adding selector overrides,
so later pieces have something to bind to.

Headings: `SCOPE.md` asks for weight 800 on h1 and 700 on h2 and h3.
`--heading-font-weight` becomes `700`, and a new `--heading-font-weight-display`
is `800` for h1 and any display heading.

Code: `SCOPE.md` asks for ink backgrounds on `pre` blocks and paper-2 on inline
`code`, with inverted text colors to match. Split into:

- `--pre-background: var(--color-ink)` and a new `--pre-font-color:
  var(--color-on-dark)`. `--pre-font-color` does not exist today; `pre` inherits
  its color, so `doc.css` needs to start binding it.
- `--code-background: var(--color-paper-2)`, `--code-font-color: var(--color-ink)`

`--code-font-color` currently resolves to ASF moderate blue and is referenced by
`doc.css`; re-pointing it to ink is the change that removes blue from inline
code.

### 4. Typography vars

| var | new value |
|---|---|
| `--body-font-family` | `'Open Sans', system-ui, sans-serif` |
| `--display-font-family` (new) | `'Archivo', sans-serif` |
| `--monospace-font-family` | `'JetBrains Mono', ui-monospace, monospace` |

`--rem-base` stays at 18. Every px value taken from the artboards is expressed
as `calc(N / var(--rem-base) * 1rem)`, matching the convention already used in
`projects.css` and `frontpage.css`.

### 5. Containers

The artboards lay out marketing pages as a centered 1200px container with 32px
side padding. The Antora docs screen is not a centered container: a 280px nav is
fixed left, and the article plus 220px TOC is capped at 1180px within the
remaining space, which fits inside the existing 1366px. So the two widths
diverge:

| var | value | applies to |
|---|---|---|
| `--static-max-width--desktop` | `calc(1200 / var(--rem-base) * 1rem)` | `.static`, `.blog`, `.projects`, Hugo pages |
| `--frontpage-max-width` | `var(--static-max-width--desktop)` | home page |
| `--doc-max-width--desktop` | unchanged at 1366 | Antora article area |
| `--page-padding-x` (new) | `calc(32 / var(--rem-base) * 1rem)` | all containers |

Header and footer inner containers bind `--static-max-width--desktop` on every
page, documentation included, so the site chrome aligns across Hugo and Antora
even though the docs article area stays wider. Applying that is piece 2's work;
this piece only defines the tokens it needs.

## Files touched

- `antora-ui-camel/package.json` — add two deps, remove one.
- `antora-ui-camel/src/css/vars.css` — the palette, semantic re-points, type,
  containers.
- `antora-ui-camel/src/css/typeface-archivo.css` — new.
- `antora-ui-camel/src/css/typeface-jetbrains-mono.css` — new.
- `antora-ui-camel/src/css/site.css` — import changes.
- Existing stylesheets, for repaint repair only, expected to be `doc.css`,
  `nav.css`, and `base.css`. `highlight.css` is deliberately not touched; see
  "Accepted temporary regression" below.

## Verification

Evidence required before this piece is called done:

1. `yarn workspace antora-ui-camel run build` completes, and `rev-manifest.json`
   contains revved entries for the Archivo and JetBrains Mono woff2 files.
2. Stylelint passes as part of the bundle task.
3. `grep -ri "droid sans" antora-ui-camel/src` returns nothing.
4. `yarn build && yarn checks` passes, covering html-validate, deadlinks, and
   redirects.
5. A Hugo page and an Antora documentation page are both loaded in a browser and
   compared against the corresponding artboard screen. Body text, headings,
   inline code, code blocks, tables, admonitions, and links are checked for
   contrast and legibility.
6. No element still renders in ASF blue except the ASF logo.

Item 5 is a judgment call and is the reason this piece exists. If documentation
legibility regresses, that is a finding to report and resolve before piece 2,
not something to work around in later pieces. Syntax-highlighted code is
excluded from item 5; see below.

## Accepted temporary regression

`highlight.css` is tuned against a light `--pre-background`. This piece sets
`--pre-background` to `--color-ink` without touching that theme, so highlighted
code renders light-on-dark token colors against a dark ground and will look
wrong on every page that carries a code block. That is a known and accepted
consequence, scoped to piece 6, not a defect to report during review of this
piece.

The reason for splitting it: choosing a dark highlight theme is a design
decision with no reference in the artboards, and folding it into the token swap
would make the riskiest piece of the redesign larger and harder to review. The
cost of the split is that the branch carries visibly broken code blocks between
piece 1 and piece 6, so piece 6 should not be deferred far.

## Risks

- **The docs repaint is the whole risk.** Documentation was never designed
  against this palette. The `Antora docs` screen in `Apache Camel Site Pages`
  covers nav, toolbar, article, and TOC, but not every AsciiDoc construct the
  documentation actually uses. Constructs with no design reference get tokens
  and nothing else.
- **Admonitions.** `SCOPE.md` keeps the semantic hues but moves TIP and NOTE to
  an orange tint with an orange left rule. The remaining three keep hues chosen
  against a white background and need a contrast check on paper.
- **Mobile.** `--body-font-size` is 17px below desktop, so `calc(N / 18 * 1rem)`
  values are about 6 percent smaller there. Existing behavior, but it means px
  fidelity to the artboards holds only at desktop.

## Follow-ups, not this piece

- Removing the unused greyscale ramp once later pieces prove nothing binds it.
- Deciding whether `--color-camel-orange-light` survives the redesign.
- The `.button.dark/.light` pill radius change, which `SCOPE.md` puts in shared
  chrome (piece 2).
