# Antora docs UI: nav, toolbar, article, TOC

Piece 3 of 6 of the camel-website redesign. Branch `feature/new-website-design`.

The six pieces: 1 foundation, 2 shared chrome, 3 Antora docs UI (this document),
4 designed Hugo pages, 5 undesigned template sweep, 6 syntax highlighting.

Landing order is **1, 6, 2, 3, 4, 5**. Pieces 1, 6 and 2 have landed.

Design source: the **Antora docs** screen in `Apache Camel Site Pages.dc.html`
(line 528 onward), with decisions recorded in the design handoff `SCOPE.md`
(2026-09-03), section 5. Both artboards were supplied by the design owner in
`Apache Camel website reference.zip`. Measurements below are read off the
artboard's inline styles and are authoritative; where `SCOPE.md` and the artboard
disagree, this document says which was chosen and why.

## Why this is its own piece

The documentation is the largest surface the site publishes and the only one
Antora renders end to end. It has its own chrome inside the page: a nav panel, a
toolbar, an article column, and a TOC rail, none of which any Hugo page renders
in full. Piece 2 stopped at the header and footer precisely so this piece could
take the inside of the page as one unit.

It is also where the redesign's verification debt sits. Piece 2 shipped without
a single page ever rendered by Antora, because `yarn build:antora` fetches every
Camel repository over the network and then fails on broken upstream xrefs. Every
Antora claim in piece 2 was checked by rendering Handlebars partials directly in
node. That is a real gap and this piece closes it first, before changing
anything.

## Scope

In scope:

- A committed local Antora build harness: a small fixture, a playbook, and a
  script, rendering real pages against the committed UI with no network.
- Rewrite `nav.css` onto the artboard's 280px panel, including moving the site
  search into it.
- Rewrite `toolbar.css`, `breadcrumbs.css` and `page-versions.css` onto the
  artboard's 46px bar.
- Rewrite the article treatment in `doc.css`: headings, lead, body, inline code,
  code blocks, tables, admonitions, lists.
- Rewrite `toc.css` and the content grid in `main.css`.
- Rewrite `pagination.css` prev/next and `tabs.css` on dark.
- Template changes in `nav.hbs`, `nav-menu.hbs`, `article.hbs`, `toolbar.hbs`,
  `header-content.hbs`.
- Delete the nav-tree filter (`99-nav-search.js`); add a `/` hotkey that focuses
  search on both template systems.

Out of scope:

- The Hugo pages themselves (pieces 4 and 5), except where they inherit the
  broad `.doc` typography by design (see decision 9).
- Syntax highlighting colors, settled in piece 6.
- The header and footer, settled in piece 2, except for removing the search
  input from the Antora header (decision 3).

## Resolved ambiguities

These were put to the design owner and answered on 2026-09-03.

1. **Docs search.** `SCOPE.md` section 5 says "move the navbar Algolia input
   here for docs pages", but the nav panel already contains an
   `input.search` that is a client-side nav-tree filter, rendered only for the
   `components` and `camel-kamelets` components, and the artboard's placeholder
   reads "Search the manual", which describes the filter rather than site-wide
   search. **Chosen: move Algolia into the nav panel** on Antora pages, and drop
   the nav-tree filter.

2. **Restyle reach.** `doc.css` styles `.doc`, which Hugo also applies to
   `/community`, `/tooling`, the security pages and others through
   `.static.doc`, and to the blog index through `.doc.blog.list`.
   **Chosen: restyle `.doc` broadly**, so pieces 4 and 5 layer page design on a
   correct baseline instead of redoing the article work.

3. **Verification harness.** **Chosen: commit it**, so later pieces and
   contributors can render the docs UI locally.

## Decisions

### 1. Local Antora build harness

`yarn build:antora` is not usable for verification: it clones ten upstream
repositories and fails on broken xrefs in `apache/camel`. The `build:antora-local-*`
scripts in `package.json` reference playbook files (`local-antora-playbook-full.yml`
and four others) that **do not exist in the repository**. They are dead entries.

New files:

- `tests/antora-ui/fixture/antora.yml` — component `fixture`, title `Camel Core`,
  version `4.18`.
- `tests/antora-ui/fixture/modules/ROOT/nav.adoc` — a tree deep enough to exercise
  nesting, carets, and the current-page pill.
- `tests/antora-ui/fixture/modules/ROOT/pages/*.adoc` — pages covering: h1, lead
  paragraph, h2/h3, inline code, a source block, a `[tabs]` block, a table with a
  header row, all five admonition types, an ordered and an unordered list, and
  prev/next pagination.
- `tests/antora-ui/build.sh` — stages, builds, and reports the output path.
- `package.json` — a `build:antora-local` script calling it.
- `.gitignore` — ignore `tests/antora-ui/out`.

**The fixture must be staged outside the repository before Antora reads it.**
Antora's git layer cannot read a git worktree, whose `.git` is a file rather than
a directory, and refuses with `Local content source must be a git repository`.
Development of this redesign happens in a worktree, so a content source pointing
at the repository itself fails exactly where verification is needed. `build.sh`
therefore copies the fixture to a `mktemp -d` directory, runs `git init` and one
commit there, generates a playbook with absolute paths, and runs Antora. This is
verified working: it produces `out/fixture/4.18/getting-started.html` in about
five seconds with `runtime.fetch: false`.

The generated playbook points `ui.bundle.url` at `antora-ui-camel/public/_`, the
same committed directory the production playbook uses, and carries the production
playbook's three asciidoc extensions (`./extensions/table.js`,
`./extensions/inline-styles.js`, `@asciidoctor/tabs`) by absolute path so tab
blocks render.

The harness is a verification tool, not a test suite. It has no assertions. Its
job is to produce a real page to measure.

Two details the fixture has to get right, both found by rendering it. Antora's
pagination partial is gated on `page.attributes.pagination`, which requires the
AsciiDoc attribute **`:page-pagination:`**; the unprefixed `:pagination:` is not
exposed and the prev/next block silently never renders. And the fixture needs a
second version, which `build.sh` produces by committing a second branch in the
staging repository, or `page-versions` and the nav's version list have nothing to
show.

### 2. Nav panel

280px, `--color-paper-2`, 1px `--color-line` right rule, sticky under the header,
`height: calc(100vh - var(--navbar-height))`, a flex column of three rows.

`.nav .panels` keeps `display: flex; flex-direction: column`. The rows:

- **Search row** (new `.nav-search`, `flex: none`): padding `14px 16px`,
  `border-bottom: 1px solid var(--color-line)`.
- **Tree** (`.nav-panel-menu`, `flex: 1 1 auto; min-height: 0`): the explicit
  `height: var(--nav-panel-height)` and its desktop variant are **deleted**, and
  so are the two tokens, whose only consumers are those two declarations
  (`nav.css:73` and `nav.css:78`; verified by grep across `antora-ui-camel/src`,
  `assets`, and `layouts`). Flex sizing replaces them, so the search row's height
  never has to be guessed. `padding-bottom: var(--drawer-height)` keeps the last
  tree item clear of the pinned context bar.
- **Context bar** (`.nav-panel-explore`) keeps `position: absolute; bottom: 0`.
  Its expansion overlays the tree, which is the existing behavior and is what the
  artboard shows in its collapsed state.

`.nav-panel-menu:not(.is-active)::after` currently uses `inset: 0` against `.nav`,
which is the nearest positioned ancestor, so the dimming overlay would cover the
new search row. `.nav-panel-menu` gets `position: relative` so the overlay is
scoped to the tree. This does not re-parent `#search_results`, which lives in the
search row, not the tree.

Measurements from the artboard:

| element | value |
|---|---|
| search field | `background: var(--color-white)`, `1px solid var(--color-line)`, radius 7px, padding `8px 11px`, font-size 13.5px |
| search placeholder | `--color-ink-soft` (see decision 10) |
| `/` hint | mono 11px, `background: var(--color-paper-2)`, padding `1px 6px`, radius 4px, right-aligned inside the field |
| tree padding | `14px 16px 20px` |
| component title | `--display-font-family` 700, 14px, `--color-ink`, `margin-bottom: 8px` |
| tree item | padding `5px 8px`, radius 6px, 13.5px/1.4, `--color-ink-2`, weight 400 |
| nested indent | 18px per level |
| current page | `--color-orange-deep`, weight 700, `background: var(--color-orange-tint)` |
| item hover | `background: var(--color-line)` (see decision 10) |
| caret | 9px, `--color-ink-muted`, rotated 90° when open |
| context bar | `border-top: 1px solid var(--color-line)`, padding `12px 16px`, 13px, `--color-ink-soft`, component name weight 600 |
| version chip | mono 12px, `background: var(--color-white)`, `1px solid var(--color-line)`, radius 6px, padding `3px 9px` |

`--nav-width` moves from 270px to 280px.

### 3. Moving search into the nav panel

`header-content.hbs` loses its `div.navbar-search` block. `nav.hbs` gains it,
wrapped in `.nav-search`:

```hbs
<div class="nav-search">
  <div class="navbar-search results-hidden">
    <input id="search" class="search" placeholder="Search the manual" autocomplete="off" maxlength="200">
    <img src="{{uiRootPath}}/img/cancel.svg" alt="Clear" id="search-cancel">
    <div id="search_results"></div>
  </div>
  <kbd class="nav-search-hint" aria-hidden="true">/</kbd>
</div>
```

**The inner container keeps the class `navbar-search`, and this is deliberate.**
`algoliasearch.bundle.js` writes `container.className = 'navbar-search'` and
`'navbar-search results-hidden'` in five places as it shows and hides results.
Keeping the class means the vendored bundle needs no change at all. Renaming it
would mean editing a vendored file, which is the higher risk.

`#search_results` is positioned in `header.css` as `position: absolute; top: var(--navbar-height)`,
which is correct for the header on Hugo pages and wrong inside the nav panel. The
same stylesheet serves both, so `nav.css` overrides it with
`.nav-search #search_results` (specificity 1,1,0), which beats the bare
`#search_results` (1,0,0) regardless of `site.css` import order. `.nav-search`
gets `position: relative` and the panel gets no `overflow` rule, so results
overflow the 280px panel to the right over the article, at `width: min(600px, 90vw)`.

`nav-menu.hbs` loses its `input.search` and the `{{#if}}` that gated it on the
`components` and `camel-kamelets` components. `99-nav-search.js` is deleted, along
with the two `.filtered` rules in `nav.css` that only it set.

The search row renders on every Antora page, including ones with no navigation,
because `nav.hbs` is unconditional while `nav-menu.hbs` is gated on
`page.navigation`.

### 4. The `/` hotkey

The artboard shows a `/` hint in the search field. A hint for a key that does
nothing is worse than no hint, so the key is implemented: a new
`antora-ui-camel/src/js/08-search-hotkey.js` focuses `#search` on `/` unless the
event target is already an input, textarea, or contenteditable, and calls
`preventDefault` so the slash is not typed into the field.

Both template systems load the same concatenated `js/site.js`
(`layouts/partials/footer.html:49` and `footer-scripts.hbs`), and both render an
element with `id="search"`, so the hotkey works on Hugo pages too, where the
input is still in the header.

### 5. Toolbar, breadcrumbs, version chip

46px, sticky at `top: var(--navbar-height)`, `background: rgb(250 247 241 / 92%)`
with `backdrop-filter: blur(8px)`, `border-bottom: 1px solid var(--color-line)`,
`padding: 0 40px`, `gap: 18px`, font-size 13.5px. `--toolbar-height` moves from
45px to 46px.

The toolbar sits inside `main.article`, to the right of the nav, which already
matches the artboard: no change to the `.body` flex structure.

Breadcrumbs are `--color-ink-soft`, with `/` separators, and the last item is
`--color-ink` weight 600. "Edit this page" is right-aligned, `--color-ink-soft`,
weight 600, hovering to `--link-font-color`.

`.home-link` is **removed** from `toolbar.hbs` and its rules deleted. The artboard
has no home affordance in the toolbar, and the header brand link already goes home.

`.page-versions` **stays** in the toolbar, restyled as a mono chip matching the
nav's version chip. The artboard does not show it, but it is a distinct feature
from the nav's component switcher: it jumps to the *same page* in another version,
which nothing else on the page offers. Removing a working documentation feature
because an artboard did not draw it is not a design decision this piece is
entitled to make.

`.nav-toggle` stays, unchanged, for widths at or below 1024px. It is the only way
to reach the nav panel, and therefore search, on a phone.

### 6. Content grid

`main > .content` becomes a grid. From the artboard:
`grid-template-columns: minmax(0, 1fr) 220px; gap: 56px; padding: 44px 40px 80px; max-width: 1180px`.

**The grid is scoped to `main.article > .content`, not to `main > .content`.**
Hugo's `layouts/_default/single.html` also renders `<main><div class="content">`,
and `SCOPE.md` section 2 gives Hugo pages `--static-max-width--desktop` (1200px),
not 1180px. Antora's `main.hbs` renders `<main class="article">`, so the class is
a reliable discriminator. Typography reaches broadly (decision 9); geometry does
not.

`--doc-max-width--desktop` stays at 1366px, as `SCOPE.md` says. It bounds `.doc`;
the 1180px cap bounds the grid that contains it.

`--toc-width` and `--toc-width--widescreen` both become 220px. The artboard's rail
is a fixed width, so the widescreen step is redundant, but the token has a live
consumer at `main.css:53` and both are set rather than one deleted.

### 7. Article

`article.hbs` gains an eyebrow above the h1, rendered only when the page has a
component, so the 404 branch does not get one:

```hbs
{{#with page.component.title}}
<div class="doc-eyebrow">{{this}}</div>
{{/with}}
```

`SCOPE.md` section 5 says the eyebrow is the component name. The artboard shows
"User Manual", which is the second breadcrumb rather than the component, but
`SCOPE.md` is the design owner's written instruction and is followed.

| element | value |
|---|---|
| eyebrow | mono 12px, weight 600, `--color-orange-deep`, `letter-spacing: 0.08em`, uppercase |
| h1 | `--display-font-family` 800, 42px, `letter-spacing: -0.03em`, `margin: 10px 0 0`, line-height 1.05 |
| lead | 16.5px/1.7, `--color-ink-2`, `margin: 20px 0 0` |
| h2 | `--display-font-family` 700, 26px, `letter-spacing: -0.02em`, `margin: 44px 0 0`, `padding-top: 8px` |
| body | 16px/1.7, `--color-ink-2` |
| inline code | mono 14.5px, `background: var(--color-paper-2)`, padding `2px 6px`, radius 4px |
| code block | mono 13.5px/1.7, `--syntax-text` on `--color-ink`, radius 10px, padding `18px 20px`, `margin: 14px 0 0` |
| lists | 16px/1.8, `padding-left: 22px` |

`text-transform: uppercase` is **removed** from the `.doc h1`–`h6` rule, and the
`::after` divider and negative horizontal margins are removed from
`.doc h2:not(.discrete)`. Both are load-bearing removals: the artboard's headings
are sentence case with no rule beneath them.

The lead treatment targets `.doc > h1.page + .paragraph > p` and
`#preamble > .sectionbody > .paragraph:first-child > p`, which are the two shapes
Antora produces for a first paragraph.

`.doc a` keeps its existing dotted-underline treatment. The artboard's inline
links carry no explicit style, so it says nothing about underlines, and piece 1
deliberately repainted them.

**Tables.** `width: 100%`, `margin-top: 16px`, font-size 15px, radius 10px,
`background: var(--color-white)`, `1px solid var(--color-line)`. Header row:
`background: var(--color-paper-2)`, mono 11.5px, uppercase, `letter-spacing: 0.06em`,
`--color-ink-soft`, weight 600, padding `11px 16px`, left-aligned. Body cells:
padding `12px 16px`, `border-top: 1px solid var(--color-line-soft)`. The border,
radius and background go on `.doc .table-wrapper` where one is present, because a
`border-radius` on a `table` element does not clip its children reliably.

The artboard's first column is `font-weight: 700; white-space: nowrap`. The weight
is adopted; **`nowrap` is not**. `doc.css:179-182` sets `width: 25%; overflow-wrap: anywhere`
on the first cell specifically to break long property names, and the component
reference has 300-plus pages of option tables that would otherwise overflow. That
existing rule stays.

**Admonitions.** The artboard draws two treatments: TIP as a white card with an
inline chip, NOTE as an orange left rule with the label above the text. Antora
emits identical markup for all five types (`table > tr > td.icon + td.content`),
so two structures cannot both be expressed. All five get **one** structure:

```
background: var(--color-white);
border: 1px solid var(--color-line);
border-left: 3px solid <type rule color>;
border-radius: 0 12px 12px 0;
padding: 16px 20px;
```

with the `td.icon` becoming a chip: mono 11px, weight 600, uppercase,
`letter-spacing: 0.04em`, padding `3px 8px`, radius 20px, and `td.content` at
14.5px/1.6 in `--color-ink-soft`.

`SCOPE.md` section 2 asks for "semantic hues but ... `--color-orange-tint` for
TIP/NOTE with an orange left rule". So TIP and NOTE take orange; the other three
keep their existing hues and gain a tint. Three new tint tokens, each with chip
text measured at or above 4.5:1 on its own tint:

| type | rule | chip background | chip text | ratio |
|---|---|---|---|---|
| tip, note | `--color-camel-orange` | `--color-orange-tint` `#fbead8` | `--color-orange-deep` `#a84e0d` | 4.75:1 |
| caution | `--caution-color` `#a0439c` | `--caution-tint` `#f7e9f6` | `--caution-chip-font-color` `#8e3b8a` | 5.71:1 |
| important | `--important-color` `#d32f2f` | `--important-tint` `#fce9e9` | `--important-chip-font-color` `#b02525` | 5.73:1 |
| warning | `--warning-color` `#e18114` | `--warning-tint` `#fdf0dc` | `--warning-chip-font-color` `#8a5209` | 5.67:1 |

The 3px left rule is **not** held to WCAG 1.4.11's 3:1. `--color-camel-orange` on
white is 2.93:1 and `--warning-color` is 2.86:1. The rule is decorative: the chip
states the admonition type in text at 4.5:1 or better, so the color is not the
sole carrier of that information. This is a deliberate reading of 1.4.11, recorded
here so a reviewer does not have to re-derive it.

The existing `.doc .admonitionblock .icon i::after` uses `writing-mode: tb-rl` to
run the label vertically. That goes; the chip is horizontal.

Antora emits the admonition as a two-cell table, `td.icon` beside `td.content`,
which already gives the chip-left, text-right arrangement with no structural
change. One correction falls out of that: `extensions/table.js` is a postprocessor
that wraps **every** table in `<div class="table-wrapper">`, admonition tables
included, so the existing rule `.doc .admonitionblock > table` never matches and
is dead in production. It becomes `.doc .admonitionblock table`, and the card
treatment that `.table-wrapper` now carries has to be cancelled inside
`.admonitionblock`.

### 8. TOC, pagination, tabs

**TOC.** 220px, sticky at `--toc-top`. Its existing formula
`calc(var(--body-top) + var(--toolbar-height))` needs no change: once
`--toolbar-height` moves to 46px it evaluates to 66 + 18 + 46 = 130px at the
desktop root font-size of 18px, which is the artboard's value exactly. Below the
1025px breakpoint the root font-size is 17px and the sidebar TOC is hidden, so
the difference there does not surface. "Contents" becomes an eyebrow: mono
12px, weight 600, `--color-ink-soft`, `letter-spacing: 0.08em`, uppercase,
`padding-bottom: 10px`. Items: padding `6px 0 6px 12px`, 13.5px,
`border-left: 2px solid var(--color-line)`, `--color-ink-soft`. Active:
`--color-ink`, weight 600, `border-left-color: var(--color-camel-orange)`. Hover:
`--color-ink`, `border-left-color: var(--color-line-hover)`.

**Pagination.** The prev/next links become two-line: a mono 11.5px
`--color-ink-soft` eyebrow reading `← Previous` and `Next →`, over the page title
in weight 700 `--color-ink`. The existing `::after` chevrons are removed, since
the arrows move into the eyebrow text. `border-top: 1px solid var(--color-line)`,
`margin-top: 56px`, `padding-top: 24px`.

`nav.pagination` is Antora's; Hugo's blog pagination is `ul.pagination` inside a
`nav` with no class, so there is no selector collision. Piece 4 owns that one.

**Tabs.** `@asciidoctor/tabs` on dark: container `background: var(--color-ink)`,
radius 10px, `1px solid var(--color-dark-line)`, `overflow: hidden`. Tab list:
`display: flex; gap: 2px; padding: 10px 12px 0`,
`border-bottom: 1px solid var(--color-dark-line)`. Tabs: mono 12.5px, weight 600,
padding `7px 14px 11px`, idle `--code-tab-idle-font-color`, active `--syntax-text`,
with a 2px `--color-camel-orange` underline inset 10px from each side. Content
`pre` gets `margin: 0; padding: 18px 20px` and no background of its own.

`--code-tab-idle-font-color: #a89f92` is the value `SCOPE.md` section 2a gives.
It measures 6.47:1 on `--pre-background`.

### 9. Restyle reach

The typography, code, table, list and admonition rules above are written against
`.doc` and therefore apply to Hugo's `.static.doc` pages as well as Antora's. This
is intended: pieces 4 and 5 then start from a correct baseline instead of redoing
the article work, and it avoids the guard selectors that produced most of piece 2's
defects.

The consequence is that roughly eight Hugo pages (`/community`, `/tooling`,
`/security`, and the other `_default/single.html` sections) change appearance
during this piece, before their own designs land. That is expected, not a
regression.

`layouts/blog/list.html` and `layouts/_default/taxonomy.html` apply
`.doc blog list` to a `main` element with no `.content` child, so the grid rule
does not reach them; `blog.css` and `category.css` continue to own their look.

### 10. Token changes

Added:

| token | value | why |
|---|---|---|
| `--caution-tint` | `#f7e9f6` | admonition chip |
| `--caution-chip-font-color` | `#8e3b8a` | 5.71:1 on its tint |
| `--important-tint` | `#fce9e9` | admonition chip |
| `--important-chip-font-color` | `#b02525` | 5.73:1 on its tint |
| `--warning-tint` | `#fdf0dc` | admonition chip |
| `--warning-chip-font-color` | `#8a5209` | 5.67:1 on its tint |
| `--code-tab-idle-font-color` | `#a89f92` | `SCOPE.md` 2a; 6.47:1 on ink |

Changed:

| token | from | to |
|---|---|---|
| `--nav-width` | 270px | 280px |
| `--toolbar-height` | 45px | 46px |
| `--toc-width` | 162px | 220px |
| `--toc-width--widescreen` | 216px | 220px |
| `--doc-font-size--desktop` | 17px | 16px |
| `--doc-line-height` | 1.6 | 1.7 |
| `--footer-line-height` | `var(--doc-line-height)` | `1.6` |

Deleted: `--nav-panel-height`, `--nav-panel-height--desktop`.

**`--doc-line-height` has three consumers outside `.doc`**, and all three are
pinned to 1.6 before the token moves, so this piece changes nothing but the
article:

- `--footer-line-height` in `vars.css`. This one matters more than the others:
  `--footer-height: 39rem` was measured against the rendered footer in piece 2 and
  carries a fourteen-line comment explaining why. Letting the footer's line-height
  drift would silently invalidate that measurement.
- `frontpage.css:16`, pinned to a literal `1.6`. Piece 4 owns the home page.
- `nav.css:321`, the explore panel's component list, pinned to a literal `1.6`.

**`--color-ink-muted` (`#8a8074`) is not used for body-sized text in this piece.**
It measures 3.62:1 on `--color-paper` and 3.35:1 on `--color-paper-2`, below the
4.5:1 that 12-to-14px text needs. The artboard uses it for breadcrumbs, the
"Contents" eyebrow, the search placeholder, and tree carets. This piece uses
`--color-ink-soft` (`#5c554c`, 6.87:1 and 6.36:1) for **every** small-text use in
this piece, which is those four plus the table header row and the pagination
eyebrow, and keeps `--color-ink-muted` only for the nav tree carets, which are
glyphs beside a text label. This follows the precedent piece 1 set when it moved
`SCOPE.md`'s `#c95f12` to `#a84e0d` for the same reason.

## Files touched

Created:

- `tests/antora-ui/fixture/antora.yml`
- `tests/antora-ui/fixture/modules/ROOT/nav.adoc`
- `tests/antora-ui/fixture/modules/ROOT/pages/*.adoc`
- `tests/antora-ui/build.sh`
- `antora-ui-camel/src/js/08-search-hotkey.js`

Modified:

- `antora-ui-camel/src/css/`: `vars.css`, `nav.css`, `toolbar.css`,
  `breadcrumbs.css`, `page-versions.css`, `toc.css`, `main.css`, `doc.css`,
  `pagination.css`, `tabs.css`, `frontpage.css`, `header.css`
- `antora-ui-camel/src/partials/`: `nav.hbs`, `nav-menu.hbs`, `article.hbs`,
  `toolbar.hbs`, `header-content.hbs`
- `package.json`, `.gitignore`
- `antora-ui-camel/public/**` (regenerated bundle)

Deleted:

- `antora-ui-camel/src/js/99-nav-search.js`

`header.css` is touched for one reason only. The nav panel's copy of search keeps
the class `navbar-search` so the vendored Algolia bundle needs no change, which
means `header.css`'s rules would reach it. One of them,
`@media (width <= 500px) { .navbar-search { display: none } }`, would hide search
in the nav panel at phone widths and defeat the move. The search *layout* rules
therefore move under `.header`; the rules that style the contents of the results
panel stay global, because both contexts want them.

Not touched: `footer.css`.

## Verification

Every claim is measured on a page produced by `tests/antora-ui/build.sh`, using
Chrome DevTools Protocol `getBoundingClientRect` and `getComputedStyle` rather
than screenshot inspection. Piece 2 established that standard after two defects
passed visual checks.

Required checks:

1. `yarn build` in `antora-ui-camel` exits 0, stylelint included.
2. `tests/antora-ui/build.sh` renders without error at `runtime.fetch: false`.
3. Nav panel measures 280px; search row, tree, and context bar all reachable;
   tree scrolls independently.
4. Search: typing in the nav field produces Algolia results; the results panel is
   not clipped by the panel; `/` focuses the field from anywhere on the page and
   does not type a slash; the `/` hint is present.
5. Search still works from the header on a Hugo page.
6. Toolbar measures 46px; breadcrumbs and "Edit this page" render; the version
   chip renders on a page with multiple versions.
7. Article: eyebrow, h1, lead, h2, body, inline code, code block, table, all five
   admonitions, lists, and prev/next all match the measurements in decisions 7
   and 8.
8. TOC measures 220px, sticks at 130px, and its active item tracks scroll.
9. Tabs render on dark with the orange active underline.
10. A Hugo `.static.doc` page (`/community/`) renders with the new typography and
    keeps a 1200px container, not 1180px.
11. Contrast: every ratio in decisions 7 and 10 re-measured against the rendered
    computed colors, not against the values written here.
12. The regenerated `antora-ui-camel/public/**` is reproducible: a second
    `yarn build` leaves the tree clean.

## Risks

**The harness fixture is not the real corpus.** It exercises the constructs the
artboard shows. The real documentation contains constructs it does not: deeply
nested navigation, `dlist` definition lists, `colist` callouts, sidebar and
example blocks, the Camel Quarkus badge markup, and tables that are far wider
than the fixture's. The article rules are written against `.doc` broadly, so
those constructs inherit new type without being looked at. Spot-checking them
means adding them to the fixture, and the fixture should grow when a defect is
found in one.

**Search moves for docs but not for Hugo.** Piece 2 hid `.navbar-search` below
500px to keep the burger reachable. After this piece, docs pages regain search at
phone widths through the nav drawer; Hugo pages still do not have it below 500px.
The site now has search in two places depending on section. That is what
`SCOPE.md` section 5 asks for, but it is a real inconsistency and the design owner
should see it on a phone before piece 4 closes.

**Header parity between the two systems is now intentionally broken.** Piece 2
established that `layouts/partials/header.html` and `header-content.hbs` render
the same markup, and treated any difference as a defect. The Antora header now
deliberately lacks the search block. Any parity check inherited from piece 2 must
be updated to expect exactly this divergence and no other.

**The nav-tree filter is removed.** The `components` and `camel-kamelets`
components had a client-side filter over their navigation, which is genuinely
useful on a tree of several hundred entries. Algolia search is not a replacement
for filtering a visible tree. The design owner chose this; it is recorded so the
loss is not discovered later as a bug.

## Corrections, made during implementation

Found after the four corrections already recorded above, while implementing and
verifying the piece.

1. **Eyebrow margin collapse.** The plan called for a flex-based lift to place
   the eyebrow above the h1 without a margin-collapse gap. That approach was
   removed before Task 7 ran: making `.doc` a flex container turns each
   `.sect1` into a flex item, which establishes a block formatting context and
   stops its first child's margin from collapsing through it. That would have
   made `.sect1`'s 36px top margin and the following `h2`'s 44px top margin sum
   to 80px at every section boundary instead of collapsing to 44px. What
   shipped instead: the eyebrow precedes the `h1` in the DOM and the
   `:first-child` qualifiers on the `.doc` half of the rule were dropped.
   Measured at 43.98px after the change.
2. **Pagination arrow escape.** The spec and plan describe the previous-link
   eyebrow as `content: '\2190 Previous'`. Written that way, it renders as
   `←Previous` with no space: a CSS hex escape consumes one trailing
   whitespace character as its terminator (CSS Syntax Module Level 3, section
   4.3.7). It is written as two concatenated strings instead:
   `content: '\2190' ' Previous';`. The sibling `content: 'Next \2192'` does
   not share the defect, because its escape sits at the end of the string with
   nothing after it to consume.
3. **Admonition chip baseline.** The admonition chip (`.admonitionblock .icon
   i`) needed `vertical-align: top`. Without it, the pill baseline-aligns
   inside `td.icon` and sits about 5px below the content cell's text on all
   five admonition types. `td.icon`'s own `vertical-align: top` aligns the
   cell box within the table row; it does nothing for the inline chip's
   position within the cell.
4. **Orphaned tokens.** Eleven tokens were orphaned by this piece and deleted
   in Task 9: `--toolbar-font-color`, `--toolbar-muted-color`,
   `--section-divider-color`, `--admonition-background`,
   `--admonition-label-font-weight`, the five `--*-on-color` tokens, and
   `--table-border-color`. The five `--*-color` admonition tokens (`--tip-color`,
   `--note-color`, `--caution-color`, `--important-color`, `--warning-color`)
   are not part of that list: they still have live consumers, feeding the
   admonition left rules and the Camel Quarkus badge styling.
5. **Grid cap reachability.** The content grid reaches its 1180px cap only at
   1460px of viewport, because the nav panel takes a fixed 280px. The spec's
   geometry is correct; an early measurement table paired the 1180px cap with
   a 1400px viewport, which cannot reach it (1400px minus the 280px nav leaves
   1120px for the grid's own box, before its own padding).

## Follow-ups, not this piece

- Restoring a nav-tree filter alongside site search, if the loss above proves to
  matter.
- Search at phone widths on Hugo pages, which needs a design decision piece 4
  should make.
- Growing the fixture toward the constructs listed under risks.
- The dead `build:antora-local-*` entries in `package.json`, which reference five
  playbook files that do not exist. This piece adds one working script and leaves
  the dead ones alone rather than widening its diff.
