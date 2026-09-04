# Antora Docs UI Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Repaint the Antora documentation UI (nav panel, toolbar, article, TOC, tabs, pagination) onto the redesign tokens, move site search into the docs nav panel, and commit a local Antora build harness so the work can be verified on real rendered pages.

**Architecture:** A committed fixture plus a staging script gives a real Antora
build in about five seconds with no network. Everything after that is CSS on the
existing markup, with five small Handlebars edits and one new JS file. Typography
rules are written against `.doc` so Hugo's static pages inherit the baseline;
grid geometry is scoped to `main.article` so it does not.

**Tech Stack:** Antora 3.1.7, Handlebars 4.7.9, gulp 4 + postcss, stylelint 15
(`stylelint-config-standard`), `@asciidoctor/tabs` 1.0.0-beta.3, Yarn 4.1.0 via
`.yarn/releases/yarn-4.1.0.cjs`.

**Spec:** `docs/superpowers/specs/2026-09-03-antora-docs-ui-design.md`

## Global Constraints

- **No new dependencies.** Do not run `yarn add`, `npm install`, or any package
  manager install. Everything needed is already in `node_modules`.
- **Do not push to any remote.** Commit locally only.
- **Never use bare `git stash` / `git stash pop`.** The stash stack is shared
  across worktrees. Use a temporary WIP commit instead.
- **Layout dimensions are written as `calc(N / var(--rem-base) * 1rem)`**, never
  raw `px`. Three kinds of value are deliberately exempt because they are not
  layout dimensions and must not scale with the type ramp:
  - **Hairline borders**, written as plain `1px`. This is the established
    convention in this codebase (17 occurrences across `blog.css`, `catalog.css`,
    `doc.css`, `footer.css`, `frontpage.css` and `header.css`), and scaling one
    would compute to 1.06px at the 17px mobile root and render blurry.
  - **Filter radii**, such as `blur(8px)`.
  - **Offsets that track a border rather than the type ramp**, such as the
    `bottom: -1px` on the tab underline in Task 9.
- **Do not regenerate `antora-ui-camel/public/**` during a task.** It is
  regenerated exactly once, in Task 10. Leave it dirty in between.
- **`--color-ink-muted` (`#8a8074`) must not carry text.** It measures 3.62:1 on
  `--color-paper` and 3.35:1 on `--color-paper-2`, below the 4.5:1 that text at
  these sizes needs. Use `--color-ink-soft` (`#5c554c`) for every small-text use.
  `--color-ink-muted` is used in this piece only for the nav tree carets, which
  are glyphs beside a text label.
- **Every measurement is verified with Chrome DevTools Protocol**
  `getBoundingClientRect` and `getComputedStyle` on a page produced by
  `tests/antora-ui/build.sh`, never by looking at a screenshot.
- **American English. No em dashes** in code comments or commit messages. Use
  commas, periods, semicolons, parentheses, or colons.
- `stylelint-config-standard` runs in the `antora-ui-camel` bundle task and must
  pass. `.stylelintrc` disables exactly five rules: `comment-empty-line-before`,
  `no-descending-specificity`, `custom-property-pattern`, `selector-id-pattern`
  and `selector-class-pattern`, and customizes `property-no-vendor-prefix`.
  Everything else in the standard config is live. Two consequences worth knowing
  before you write CSS: a later rule may legitimately have lower specificity than
  an earlier one, and `declaration-block-no-redundant-longhand-properties` **is**
  active, so writing `top`, `right`, `bottom` and `left` together fails the build.
  Use `inset` instead. The same applies to any other complete longhand set.
- Run yarn as `node .yarn/releases/yarn-4.1.0.cjs <script>` from the repository
  root. `yarn` is not on `PATH`.

---

## File Structure

**Created:**

| File | Responsibility |
|---|---|
| `tests/antora-ui/fixture/antora.yml` | Fixture component descriptor |
| `tests/antora-ui/fixture/modules/ROOT/nav.adoc` | Nav tree with nesting and a caret |
| `tests/antora-ui/fixture/modules/ROOT/pages/index.adoc` | Landing page, gives `getting-started` a previous link |
| `tests/antora-ui/fixture/modules/ROOT/pages/getting-started.adoc` | Every construct the redesign styles |
| `tests/antora-ui/fixture/modules/ROOT/pages/architecture.adoc` | Gives `getting-started` a next link |
| `tests/antora-ui/build.sh` | Stages the fixture outside the repo, builds, prints the output path |
| `antora-ui-camel/src/js/08-search-hotkey.js` | `/` focuses the search field |

**Modified:** `antora-ui-camel/src/css/{vars,nav,toolbar,breadcrumbs,page-versions,toc,main,doc,pagination,tabs,frontpage,header}.css`,
`antora-ui-camel/src/partials/{nav,nav-menu,article,toolbar,header-content}.hbs`,
`package.json`, `.gitignore`.

**Deleted:** `antora-ui-camel/src/js/99-nav-search.js`.

---

## Corrections already applied to the spec

The spec was written before the fixture existed. Rendering real pages found four
things it got wrong. **All four are already corrected in the spec file**, so the
spec you read is right. They are repeated here because the values differ from the
artboard, and a reviewer comparing against the artboard would otherwise flag them.

1. The spec says table header text is `--color-ink-muted`. That is 3.35:1 on
   `--color-paper-2` at 11.5px. **Use `--color-ink-soft`** (6.36:1). Same for the
   pagination eyebrow.
2. The spec says `header.css` is not touched. It is: the search *layout* rules
   move under `.header` so they stop applying to the nav panel's copy. See Task 3.
3. Antora's pagination partial is gated on `page.attributes.pagination`, which
   requires the AsciiDoc attribute **`:page-pagination:`**, not `:pagination:`.
4. `extensions/table.js` wraps *every* table in `<div class="table-wrapper">`,
   including admonition tables. The existing rule `.doc .admonitionblock > table`
   (`doc.css:315`) therefore never matches in production and is dead. Task 8
   replaces it with a correct selector.

---

## Task 1: Local Antora build harness

**Files:**
- Create: `tests/antora-ui/fixture/antora.yml`
- Create: `tests/antora-ui/fixture/modules/ROOT/nav.adoc`
- Create: `tests/antora-ui/fixture/modules/ROOT/pages/index.adoc`
- Create: `tests/antora-ui/fixture/modules/ROOT/pages/getting-started.adoc`
- Create: `tests/antora-ui/fixture/modules/ROOT/pages/architecture.adoc`
- Create: `tests/antora-ui/build.sh`
- Modify: `package.json` (scripts block)
- Modify: `.gitignore`

**Interfaces:**
- Produces: `tests/antora-ui/build.sh`, which writes
  `tests/antora-ui/out/fixture/4.18/getting-started.html` and prints that path.
  Every later task verifies against that file. Also produces
  `out/fixture/4.17/getting-started.html`, so `page-versions` has something to
  render.

**Background you need.** `yarn build:antora` is unusable for verification: it
clones ten upstream repositories and then fails on broken xrefs in `apache/camel`.
The `build:antora-local-*` scripts already in `package.json` point at five
playbook files that do not exist in the repository; leave them alone, this task
adds one working script beside them.

Antora's git layer cannot read a git worktree, whose `.git` is a file rather than
a directory. It fails with `Local content source must be a git repository`. This
redesign is developed in a worktree, so the fixture **must** be copied outside the
repository and given its own git repository before Antora reads it. That is what
`build.sh` does.

- [ ] **Step 1: Create the fixture component descriptor**

`tests/antora-ui/fixture/antora.yml`:

```yaml
name: fixture
title: Camel Core
version: '4.18'
nav:
  - modules/ROOT/nav.adoc
```

- [ ] **Step 2: Create the nav tree**

The tree needs a nested branch so the caret and the 18px indent can be measured,
and `getting-started` must sit between two other pages so prev/next both render.

`tests/antora-ui/fixture/modules/ROOT/nav.adoc`:

```asciidoc
* xref:index.adoc[What is Camel?]
* xref:getting-started.adoc[Getting Started]
* xref:architecture.adoc[Architecture]
** xref:index.adoc[Camel Context]
** xref:architecture.adoc[Routes]
```

- [ ] **Step 3: Create the three pages**

`tests/antora-ui/fixture/modules/ROOT/pages/index.adoc`:

```asciidoc
= What is Camel?

Apache Camel is an open source integration framework.
```

`tests/antora-ui/fixture/modules/ROOT/pages/architecture.adoc`:

```asciidoc
= Architecture

How the pieces fit together.
```

`tests/antora-ui/fixture/modules/ROOT/pages/getting-started.adoc`. The
`:page-pagination:` attribute is required, without the `page-` prefix Antora does
not expose it and the prev/next block never renders:

```asciidoc
= Getting Started
:page-pagination:

Apache Camel is an open source integration framework. This guide shows the
quickest path to a running route, then points you to the concepts you will
need next.

TIP: The fastest way to try Camel is the Camel CLI, no project setup required.

NOTE: Upgrading from Camel 3? Read the Camel 4.x upgrade guide first.

WARNING: This fixture exists only to render the UI. It is not documentation.

CAUTION: Changing the tokens repaints the whole site, not just this page.

IMPORTANT: Every value on this page is measured, not eyeballed.

== Install the Camel CLI

Install JBang, then install the `camel` command:

[source,bash]
----
jbang app install camel@apache/camel
camel --version
----

=== A third level heading

Body text under a third level heading.

== Your first route

Create a route file and run it.

[tabs]
====
YAML::
+
[source,yaml]
----
- from:
    uri: timer:tick
    steps:
      - log: ${body}
----

Java::
+
[source,java]
----
from("timer:tick?period=1000")
    .log("${body}");
----
====

== Key concepts

[cols="1,3"]
|===
|Concept |What it is

|Route |A path a message follows from a source endpoint to one or more destinations.
|Endpoint |A URI that names a component and its options, such as `kafka:orders`.
|Component |A factory for endpoints. Over 300 are available.
|===

== Where to go next

* Enterprise Integration Patterns, for route, transform, split and aggregate.
* Component Reference, for the connectors and their options.

. First numbered step.
. Second numbered step.

.A definition list
Exchange:: The message container that travels a route.
Processor:: A node that acts on an exchange.
```

- [ ] **Step 4: Write the build script**

`tests/antora-ui/build.sh`. Note that every path handed to Antora is absolute:
the playbook is generated in the staging directory, so relative paths would
resolve against the wrong root.

```bash
#!/usr/bin/env bash
# Render the Antora UI against a small local fixture, with no network access.
#
# The production playbook is not usable for UI work: it clones ten upstream
# repositories and fails on broken xrefs. This renders real pages in seconds.
#
# The fixture is copied out of the repository before Antora reads it. Antora's
# git layer cannot read a git worktree, whose .git is a file rather than a
# directory, and this redesign is developed in a worktree.
set -euo pipefail

REPO="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
OUT="$REPO/tests/antora-ui/out"
STAGE="$(mktemp -d)"
trap 'rm -rf "$STAGE"' EXIT

cp -R "$REPO/tests/antora-ui/fixture" "$STAGE/fixture"
git -C "$STAGE" init -q
git -C "$STAGE" add -A
git -C "$STAGE" -c user.email=fixture@example.invalid -c user.name=fixture \
  -c commit.gpgsign=false commit -q -m fixture

# A second version so the page version switcher and the nav version list have
# something to render.
git -C "$STAGE" checkout -q -b v4.17
sed -i.bak "s/version: '4.18'/version: '4.17'/" "$STAGE/fixture/antora.yml"
rm -f "$STAGE/fixture/antora.yml.bak"
git -C "$STAGE" add -A
git -C "$STAGE" -c user.email=fixture@example.invalid -c user.name=fixture \
  -c commit.gpgsign=false commit -q -m v4.17
git -C "$STAGE" checkout -q -

cat > "$STAGE/playbook.yml" <<EOF
site:
  title: Apache Camel
  url: https://camel.apache.org
content:
  sources:
    - url: $STAGE
      branches: [HEAD, v4.17]
      start_path: fixture
ui:
  bundle:
    url: $REPO/antora-ui-camel/public/_
asciidoc:
  extensions:
    - $REPO/extensions/table.js
    - $REPO/extensions/inline-styles.js
    - $REPO/node_modules/@asciidoctor/tabs
output:
  dir: $OUT
runtime:
  fetch: false
EOF

rm -rf "$OUT"
"$REPO/node_modules/.bin/antora" "$STAGE/playbook.yml"

echo "Rendered: $OUT/fixture/4.18/getting-started.html"
```

Make it executable: `chmod +x tests/antora-ui/build.sh`.

- [ ] **Step 5: Add the yarn script**

In `package.json`, add one entry to `scripts`, immediately after
`"build:antora-local-quick"`:

```json
    "build:antora-ui": "tests/antora-ui/build.sh"
```

- [ ] **Step 6: Ignore the output**

Append to `.gitignore`:

```
/tests/antora-ui/out
```

- [ ] **Step 7: Run it and verify the output**

Run: `node .yarn/releases/yarn-4.1.0.cjs build:antora-ui`

Expected: exits 0 and prints a `Rendered:` line. Then verify each of these is
present in `tests/antora-ui/out/fixture/4.18/getting-started.html`, which proves
the fixture actually exercises what later tasks measure:

```bash
for s in 'class="admonitionblock tip"' 'class="admonitionblock caution"' \
         'class="admonitionblock important"' 'class="admonitionblock warning"' \
         'class="ulist tablist"' 'class="tabpanel"' \
         'class="table-wrapper"><table class="tableblock' \
         'class="dlist"' '<nav class="pagination"' \
         'class="page-versions"' 'class="nav-panel-explore"' \
         'class="nav-item-toggle"' 'data-depth="2"'; do
  grep -q "$s" tests/antora-ui/out/fixture/4.18/getting-started.html \
    && echo "ok   $s" || echo "MISS $s"
done
```

Expected: thirteen `ok` lines, zero `MISS`. If any line misses, the fixture is
wrong; fix it before continuing, because every later task's verification depends
on these constructs existing.

- [ ] **Step 8: Confirm the output is not tracked**

Run: `git status --porcelain tests/antora-ui`

Expected: only the fixture files and `build.sh`. No `out/` entries.

- [ ] **Step 9: Commit**

```bash
git add tests/antora-ui package.json .gitignore
git commit -m "test: add a local Antora build harness for UI work"
```

---

## Task 2: Tokens

**Files:**
- Modify: `antora-ui-camel/src/css/vars.css`
- Modify: `antora-ui-camel/src/css/frontpage.css:16`
- Modify: `antora-ui-camel/src/css/nav.css:321`

**Interfaces:**
- Produces: the tokens every later task consumes. Names and values are fixed
  here; later tasks must use them and must not introduce new hex literals.

**Background you need.** `--doc-line-height` is not only the article's. Three
consumers outside `.doc` read it, and all three are pinned to the current value
`1.6` in this task *before* the token moves to `1.7`, so this piece changes only
the article. One of them matters more than the others: `--footer-line-height`
feeds the footer, whose `--footer-height: 39rem` was measured against the
rendered footer in a previous piece and carries a long comment explaining why.
Letting the footer's line-height drift would silently invalidate that
measurement.

- [ ] **Step 1: Pin the three non-article line-height consumers**

In `vars.css`, change the footer line:

```css
  /* Pinned rather than tracking --doc-line-height, which moved to 1.7 for the
     article. --footer-height was measured against the footer at 1.6 and must
     not drift. */
  --footer-line-height: 1.6;
```

In `frontpage.css`, inside `section.frontpage`, replace
`line-height: var(--doc-line-height);` with:

```css
  /* Pinned rather than tracking --doc-line-height, which moved to 1.7 for the
     article. The home page is redesigned in piece 4. */
  line-height: 1.6;
```

In `nav.css`, inside `.nav-panel-explore .components`, replace
`line-height: var(--doc-line-height);` with:

```css
  line-height: 1.6;
```

- [ ] **Step 2: Change the existing tokens**

In `vars.css`, apply exactly these changes:

```css
  --toolbar-background: rgb(250 247 241 / 92%);
  --page-version-menu-background: var(--color-white);
  --doc-font-size--desktop: calc(16 / var(--rem-base) * 1rem);
  --doc-line-height: 1.7;
  --navbar-height: calc(66 / var(--rem-base) * 1rem);
  --toolbar-height: calc(46 / var(--rem-base) * 1rem);
  --nav-width: calc(280 / var(--rem-base) * 1rem);
  --toc-width: calc(220 / var(--rem-base) * 1rem);
  --toc-width--widescreen: calc(220 / var(--rem-base) * 1rem);
```

`--navbar-height` is listed only to confirm it stays at 66. Do not change it.

Do **not** delete `--nav-panel-height` or `--nav-panel-height--desktop` here.
Their consumers at `nav.css:73` and `nav.css:78` are removed in Task 4, and the
tokens go with them. Deleting them now leaves two broken declarations.

- [ ] **Step 3: Add the admonition chip tokens**

In `vars.css`, in the `/* admonitions */` block, after `--warning-on-color`, add:

```css
  /* Admonition chip pairs. Each chip's text is measured at or above 4.5:1 on
     its own tint. TIP and NOTE use the orange pair per SCOPE.md section 2. */
  --caution-tint: #f7e9f6;
  --caution-chip-font-color: #8e3b8a; /* 5.71:1 on --caution-tint */
  --important-tint: #fce9e9;
  --important-chip-font-color: #b02525; /* 5.73:1 on --important-tint */
  --warning-tint: #fdf0dc;
  --warning-chip-font-color: #8a5209; /* 5.67:1 on --warning-tint */
```

- [ ] **Step 4: Add the tab token**

In `vars.css`, immediately after `--syntax-prompt`, add:

```css
  /* Idle tab label in a code tab bar. SCOPE.md section 2a; 6.47:1 on
     --pre-background. */
  --code-tab-idle-font-color: #a89f92;
```

- [ ] **Step 5: Build to confirm the stylesheet still lints and compiles**

Run: `cd antora-ui-camel && node ../.yarn/releases/yarn-4.1.0.cjs build`

Expected: exits 0, no stylelint errors.

- [ ] **Step 6: Verify the three pins actually hold**

Run `bash tests/antora-ui/build.sh` is **not** enough here, because Task 2 has not
yet rebuilt `antora-ui-camel/public/**` and the harness reads that directory. For
this step only, confirm by reading the source: `--footer-line-height`,
`section.frontpage`, and `.nav-panel-explore .components` each carry a literal
`1.6` and none of them references `--doc-line-height`.

Run: `grep -rn 'var(--doc-line-height)' antora-ui-camel/src/css/`

Expected: exactly one hit, `doc.css:5`.

- [ ] **Step 7: Commit**

```bash
git add antora-ui-camel/src/css/vars.css antora-ui-camel/src/css/frontpage.css antora-ui-camel/src/css/nav.css
git commit -m "style(docs): retarget tokens for the docs UI redesign"
```

---

## Task 3: Move site search into the docs nav panel

**Files:**
- Modify: `antora-ui-camel/src/partials/header-content.hbs`
- Modify: `antora-ui-camel/src/partials/nav.hbs`
- Modify: `antora-ui-camel/src/partials/nav-menu.hbs`
- Modify: `antora-ui-camel/src/css/header.css` (search layout rules only)
- Modify: `antora-ui-camel/src/css/nav.css` (add the `.nav-search` block)
- Create: `antora-ui-camel/src/js/08-search-hotkey.js`
- Delete: `antora-ui-camel/src/js/99-nav-search.js`

**Interfaces:**
- Consumes: `--color-line`, `--color-line-hover`, `--color-white`,
  `--color-paper-2`, `--color-ink`, `--color-ink-soft`, `--color-camel-orange`,
  `--monospace-font-family`, `--body-font-family` from Task 2.
- Produces: `.nav-search` as the first child of `.nav .panels`. Task 4 sizes the
  rows around it and must not restyle anything inside `.nav-search`.

**Background you need.** `antora-ui-camel/src/js/vendor/algoliasearch.bundle.js`
writes `container.className = 'navbar-search'` and
`container.className = 'navbar-search results-hidden'` in five places as it shows
and hides results, where `container` is `document.querySelector('#search').parentNode`.
**Keep the class `navbar-search` on the input's parent inside the nav panel.**
That is why the new markup nests a `.navbar-search` div inside `.nav-search`: the
vendored bundle then needs no change at all, which is the lower-risk option.

Because that class is reused, `header.css`'s search rules would also apply to the
nav copy. One of them, `@media (width <= 500px) { .navbar-search { display: none } }`,
would hide search in the nav panel at phone widths, defeating the whole point of
the move. Rather than fight it with overrides, the *layout* rules move under
`.header`. The rules that style the contents of the results panel stay global,
because both contexts want them.

- [ ] **Step 1: Remove the search block from the Antora header**

In `header-content.hbs`, delete these five lines from inside
`<div class="navbar-actions">`:

```hbs
        <div class="navbar-search results-hidden">
          <input id="search" class="search" placeholder="Search" autocomplete="off" maxlength="200">
          <img src="{{uiRootPath}}/img/cancel.svg" alt="Clear" id="search-cancel">
          <div id="search_results"></div>
        </div>
```

Leave `layouts/partials/header.html` alone. Hugo pages keep their header search.

- [ ] **Step 2: Add the search row to the nav**

Replace the whole of `nav.hbs` with:

```hbs
<div class="nav-container"{{#if page.component}} data-component="{{page.component.name}}" data-version="{{page.version}}"{{/if}}>
  <aside class="nav" aria-label="Side menu">
    <div class="panels">
      <div class="nav-search">
        <div class="navbar-search results-hidden">
          <input id="search" class="search" placeholder="Search the manual" autocomplete="off" maxlength="200">
          <img src="{{uiRootPath}}/img/cancel.svg" alt="Clear" id="search-cancel">
          <div id="search_results"></div>
        </div>
        <kbd class="nav-search-hint" aria-hidden="true">/</kbd>
      </div>
{{> nav-menu}}
{{> nav-explore}}
    </div>
  </aside>
</div>
```

`uiRootPath` is available at the top level of `nav.hbs`. It would need
`@root.uiRootPath` only inside an `{{#each}}`, and there is none here.

- [ ] **Step 3: Remove the old nav-tree filter input**

In `nav-menu.hbs`, delete these three lines:

```hbs
  {{#if (or (eq @root.page.component.name 'components') (eq @root.page.component.name 'camel-kamelets'))}}
  <input class="search" placeholder="Quick lookup">
  {{/if}}
```

- [ ] **Step 4: Delete the filter script and its dead CSS**

```bash
git rm antora-ui-camel/src/js/99-nav-search.js
```

In `nav.css`, delete these two rules, which only that script ever set:

```css
.nav-item[data-depth="2"] > .filtered {
  display: none;
}
```

```css
.nav-item[data-depth="3"] > .filtered {
  display: none;
}
```

Also delete the four `.nav-panel-menu input.search` rules in `nav.css`
(the block starting `.nav-panel-menu input.search {` and the three
`.nav-panel-menu input.search:focus` / `:valid ~ .nav-menu ...` rules that follow
it). They styled the removed input.

- [ ] **Step 5: Write the hotkey script**

`antora-ui-camel/src/js/08-search-hotkey.js`:

```js
document.addEventListener('DOMContentLoaded', function () {
  var search = document.getElementById('search')
  if (!search) return
  document.addEventListener('keydown', function (e) {
    if (e.key !== '/' || e.ctrlKey || e.metaKey || e.altKey) return
    var target = e.target
    if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable)) return
    e.preventDefault()
    search.focus()
  })
})
```

Both template systems concatenate `src/js/*.js` into `js/site.js` and both render
an element with `id="search"`, so this works on Hugo pages too, where the input is
still in the header.

- [ ] **Step 6: Scope the header's search layout rules**

In `header.css`, add a `.header ` prefix to exactly these selectors, and to no
others. **The selector text is authoritative, not the line number**: you edit
`nav.css` and `header.css` in this same task, so lines shift under you.

| line | from | to |
|---|---|---|
| 201 | `.navbar-search {` | `.header .navbar-search {` |
| 205 | `.navbar-search input {` | `.header .navbar-search input {` |
| 221 | `.navbar-search input:focus-within {` | `.header .navbar-search input:focus-within {` |
| 226 | `#search-cancel {` | `.header #search-cancel {` |
| 235 | `#search_results {` | `.header #search_results {` |
| 359 | `.navbar-search {` (inside `@media (width <= 1024px)`) | `.header .navbar-search {` |
| 363 | `.navbar-search input {` (same media block) | `.header .navbar-search input {` |
| 367 | `#search-cancel {` (same media block) | `.header #search-cancel {` |
| 371 | `#search_results {` (same media block) | `.header #search_results {` |

In the `@media (width <= 500px)` block, split the grouped selector so only the
header copy is hidden:

```css
@media (width <= 500px) {
  /* Below this, the brand, CTA and burger alone fill the bar. Search and the
     GitHub link are dropped rather than pushing the burger off-screen. GitHub
     stays reachable in the footer. The docs nav panel keeps its own copy of
     search, which is why this is scoped to the header. */
  .header .navbar-search,
  .navbar-github {
    display: none;
  }
}
```

Leave every other `#search_results` rule global: the scrollbar rules,
`.result_header`, `#search_results div.result`, `#search_results div.heading`,
`#search_results dt`, `#search_results dd`, `#search_results a`,
`.result_summary`, `#search_results div.footer-search`, `div.footer-search h4`,
`.no_search_results`, `.algolia-docsearch-suggestion--highlight`, and
`.results-hidden #search_results`. Both contexts want those.

- [ ] **Step 7: Style the nav search row**

In `nav.css`, insert this block immediately after the `.nav .panels` rule:

```css
.nav-search {
  flex: none;
  padding: calc(14 / var(--rem-base) * 1rem) calc(16 / var(--rem-base) * 1rem);
  border-bottom: 1px solid var(--color-line);
  position: relative;
}

.nav-search .navbar-search {
  padding: 0;
}

.nav-search input.search {
  width: 100%;
  margin: 0;
  border: 1px solid var(--color-line);
  border-radius: calc(7 / var(--rem-base) * 1rem);
  padding: calc(8 / var(--rem-base) * 1rem) calc(34 / var(--rem-base) * 1rem)
           calc(8 / var(--rem-base) * 1rem) calc(32 / var(--rem-base) * 1rem);
  background: var(--color-white) no-repeat calc(11 / var(--rem-base) * 1rem) center /
              calc(13 / var(--rem-base) * 1rem) url("../img/search.svg");
  color: var(--color-ink);
  font-family: var(--body-font-family);
  font-size: calc(13.5 / var(--rem-base) * 1rem);
  caret-color: var(--color-camel-orange);
  outline: 0;
}

.nav-search input.search::placeholder {
  color: var(--color-ink-soft);
}

.nav-search input.search:focus {
  border-color: var(--color-line-hover);
}

.nav-search-hint {
  position: absolute;
  top: 50%;
  right: calc(27 / var(--rem-base) * 1rem);
  transform: translateY(-50%);
  padding: calc(1 / var(--rem-base) * 1rem) calc(6 / var(--rem-base) * 1rem);
  border-radius: calc(4 / var(--rem-base) * 1rem);
  background: var(--color-paper-2);
  color: var(--color-ink-soft);
  font-family: var(--monospace-font-family);
  font-size: calc(11 / var(--rem-base) * 1rem);
  pointer-events: none;
}

.nav-search #search-cancel {
  position: absolute;
  top: 50%;
  right: calc(27 / var(--rem-base) * 1rem);
  bottom: auto;
  left: auto;
  margin: 0;
  transform: translateY(-50%);
}

.nav-search #search_results {
  position: absolute;
  top: 100%;
  left: calc(16 / var(--rem-base) * 1rem);
  width: min(600px, 90vw);
  max-width: none;
  min-width: 0;
  margin: 0;
  border: 1px solid var(--color-line);
  border-radius: calc(7 / var(--rem-base) * 1rem);
  background: var(--color-white);
}
```

The `/` hint and the clear button share a position. That is correct: the clear
button is `display: none` until a query exists, and the vendored bundle sets
`cancel.style.display = 'block'` only then. Hide the hint at the same moment:

```css
.nav-search:focus-within .nav-search-hint {
  display: none;
}
```

Place that rule after `.nav-search-hint`. The `:focus-within` has to sit on
`.nav-search`, not on `.navbar-search`: `#search-cancel` is inside
`.navbar-search` but `.nav-search-hint` is its sibling, so a selector rooted at
`.navbar-search` cannot reach the hint at all.

- [ ] **Step 8: Rebuild the UI and the harness**

```bash
cd antora-ui-camel && node ../.yarn/releases/yarn-4.1.0.cjs build && cd ..
node .yarn/releases/yarn-4.1.0.cjs build:antora-ui
```

Expected: both exit 0. The bundle task writes into `antora-ui-camel/public/**`,
which stays uncommitted until Task 10; the harness reads it, so it must be built
before the harness runs. This is true of every task from here on.

- [ ] **Step 9: Verify the markup moved**

```bash
grep -c 'navbar-search' tests/antora-ui/out/fixture/4.18/getting-started.html
grep -o 'class="nav-search"' tests/antora-ui/out/fixture/4.18/getting-started.html
grep -o 'id="search"' tests/antora-ui/out/fixture/4.18/getting-started.html
grep -c 'navbar-actions' tests/antora-ui/out/fixture/4.18/getting-started.html
```

Expected: `navbar-search` appears once, `nav-search` once, `id="search"` once,
`navbar-actions` once. If `id="search"` appears twice, the header block was not
removed and Algolia will bind to the wrong one.

- [ ] **Step 10: Verify behavior in a browser**

Open `tests/antora-ui/out/fixture/4.18/getting-started.html` and, using Chrome
DevTools Protocol, confirm all five:

1. `document.querySelectorAll('#search').length === 1`.
2. The search input's `getBoundingClientRect()` sits inside the nav panel's rect.
3. At a 390px viewport, `getComputedStyle(document.querySelector('.nav-search .navbar-search')).display !== 'none'` once the nav drawer is open. This is the rule that Step 6 exists to protect.
4. Dispatching a `keydown` with `key: '/'` on `document.body` leaves `document.activeElement` as the search input, and the input's value is still empty.
5. Dispatching the same `keydown` while the input is already focused does not
   call `preventDefault`, so a `/` can still be typed into a query.

- [ ] **Step 11: Verify the Hugo header still works**

Build the Hugo site or open any existing page that uses
`layouts/partials/header.html`, and confirm the header still contains
`div.navbar-search` with an `input#search`, and that its rect is inside the
header. Nothing about Hugo's search should have changed.

- [ ] **Step 12: Commit**

```bash
git add antora-ui-camel/src/partials antora-ui-camel/src/css/header.css antora-ui-camel/src/css/nav.css antora-ui-camel/src/js
git commit -m "feat(docs): move site search into the documentation nav panel"
```

---

## Task 4: Nav panel

**Files:**
- Modify: `antora-ui-camel/src/css/nav.css`
- Modify: `antora-ui-camel/src/css/vars.css` (delete two tokens)

**Interfaces:**
- Consumes: `.nav-search` from Task 3, and `--nav-width` (280px) from Task 2.
- Produces: nothing later tasks depend on.

**Background you need.** `.nav .panels` is already `display: flex; flex-direction: column`.
`.nav-panel-menu` currently carries an explicit `height: var(--nav-panel-height)`,
computed as the nav height minus the drawer height. Adding a search row above it
would make that arithmetic wrong. Flex sizing replaces it, so no height has to be
guessed, and the two tokens are then dead. Their only consumers are `nav.css:73`
and `nav.css:78`; that was verified by grepping `antora-ui-camel/src`, `assets`,
and `layouts`. Re-verify before deleting.

`.nav-panel-explore` keeps `position: absolute; bottom: 0`. Its `.components` list
expands upward over the tree when clicked, and that overlay behavior is what
`01-nav.js` implements. Do not convert it to a flex row; that would change
behavior this piece has no mandate to change.

`.nav-panel-menu:not(.is-active)::after` dims the tree when the explore panel is
open. It uses `inset: 0` against the nearest positioned ancestor, which is `.nav`,
so today it would dim the new search row too. Giving `.nav-panel-menu`
`position: relative` scopes it. This does not re-parent `#search_results`, which
lives in `.nav-search`, a sibling.

- [ ] **Step 1: Confirm the two tokens are dead**

Run: `grep -rn 'nav-panel-height' antora-ui-camel/ assets/ layouts/ --include='*.css' --include='*.hbs' --include='*.html' --include='*.js' | grep -v '/public/'`

Expected: exactly **four** hits, all in files you are about to edit: two
declarations in `vars.css`, and two usages in `nav.css` (the `.nav-panel-menu`
rule and its desktop media variant). If anything beyond those four appears, stop
and keep the tokens. Line numbers will have shifted since the plan was written,
so match on the selector, not the line.

- [ ] **Step 2: Switch the tree to flex sizing**

In `nav.css`, replace the `.nav-panel-menu` rule and the two media blocks that set
its height:

```css
.nav-panel-menu {
  display: flex;
  flex-direction: column;
  flex: 1 1 auto;
  min-height: 0;
  padding-bottom: var(--drawer-height);
  position: relative;
}

@media screen and (width <= 1024px) {
  .nav-panel-menu {
    margin-top: var(--navbar-height);
  }
}
```

That deletes the `height: var(--nav-panel-height)` declaration and the whole
`@media screen and (width >= 1025px) { .nav-panel-menu { height: ... } }` block.

In `vars.css`, delete these two lines:

```css
  --nav-panel-height: calc(var(--nav-height) - var(--drawer-height));
  --nav-panel-height--desktop: calc(var(--nav-height--desktop) - var(--drawer-height));
```

- [ ] **Step 3: Repaint the panel container**

In `nav.css`, replace the `.nav` rule and its `@media screen and (width >= 769px)`
box-shadow rule with:

```css
.nav {
  background: var(--nav-background);
  border-right: 1px solid var(--nav-border-color);
  height: var(--nav-height);
  position: relative;
  top: var(--toolbar-height);
}

@media screen and (width >= 769px) {
  .nav {
    box-shadow: none;
  }
}
```

Leave the `@media screen and (width >= 1025px)` `.nav` rule as it is.

- [ ] **Step 4: Style the tree**

Replace the `.nav-menu` rule's padding, and the `.nav-menu h3.title`, `.nav-list`,
`.nav-item`, and current-page rules, with:

```css
.nav-menu {
  min-height: 0;
  width: 100%;
  padding: calc(14 / var(--rem-base) * 1rem) calc(16 / var(--rem-base) * 1rem) calc(20 / var(--rem-base) * 1rem);
  line-height: var(--nav-line-height);
  position: relative;
  word-break: break-word;
  overflow-y: auto;
  flex: 1 1 auto;
}

.nav-menu h3.title {
  color: var(--nav-heading-font-color);
  font-family: var(--display-font-family);
  font-size: calc(14 / var(--rem-base) * 1rem);
  font-weight: 700;
  margin: 0 0 calc(8 / var(--rem-base) * 1rem);
  padding: 0;
}

.nav-list {
  margin: 0;
  padding: 0;
}

.nav-item {
  list-style: none;
  margin-top: 0;
}

.nav-menu a.nav-link,
.nav-menu .nav-text {
  display: block;
  padding: calc(5 / var(--rem-base) * 1rem) calc(8 / var(--rem-base) * 1rem);
  border-radius: calc(6 / var(--rem-base) * 1rem);
  color: var(--color-ink-2);
  font-size: calc(13.5 / var(--rem-base) * 1rem);
  font-weight: 400;
  line-height: 1.4;
}

.nav-menu a.nav-link:hover,
.nav-menu .nav-text:hover {
  background: var(--color-line);
  color: var(--color-ink);
  text-decoration: none;
}

.is-current-page > .nav-link,
.is-current-page > .nav-text {
  background: var(--color-orange-tint);
  color: var(--color-orange-deep);
  font-weight: 700;
}
```

The old `.nav-menu` rule's `top: 2.5rem` and `margin-bottom: var(--drawer-height)`
go away: the row is positioned by flex now, and `.nav-panel-menu`'s
`padding-bottom` already clears the pinned context bar.

Delete the depth rules that set `line-height` and `padding-left` per level. The
list is authoritative; there are five of them:

- `.nav-item[data-depth="1"] > a.nav-link, .nav-item[data-depth="1"] > .nav-text`
- `.nav-item[data-depth="1"] > .nav-list a`
- `.nav-item[data-depth="2"] > a.nav-link`
- `.nav-item[data-depth="2"] > .nav-list a`
- `.nav-item[data-depth="3"] > a.nav-link`

Replace them with a single indent rule:

```css
.nav-item .nav-list {
  margin-left: calc(18 / var(--rem-base) * 1rem);
}
```

The first of those five is the one that bolded every top-level entry. It goes with
the rest: the artboard gives every level the same weight, and only the current
page is distinguished.

- [ ] **Step 5: Style the caret**

Replace `.nav-item-toggle`:

```css
.nav-item-toggle {
  background: transparent url("../img/caret.svg") no-repeat center / calc(9 / var(--rem-base) * 1rem);
  border: none;
  outline: none;
  line-height: inherit;
  position: absolute;
  height: calc(24 / var(--rem-base) * 1rem);
  width: calc(16 / var(--rem-base) * 1rem);
  margin-left: calc(-16 / var(--rem-base) * 1rem);
  opacity: 0.7;
}
```

Keep the existing `.nav-item.is-active > .nav-item-toggle { transform: rotate(90deg); }`.

`caret.svg` is a monochrome asset, so the caret's color comes from the file, not
from a token. `opacity: 0.7` on `--color-paper-2` approximates the artboard's
`--color-ink-muted`. Measure it in Step 8 and adjust the opacity if it reads
darker or lighter than `#8a8074`.

- [ ] **Step 6: Style the pinned context bar**

Replace `.nav-panel-explore .context` and its two chevron rules:

```css
.nav-panel-explore .context {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: var(--drawer-height);
  padding: 0 calc(16 / var(--rem-base) * 1rem);
  border-top: 1px solid var(--color-line);
  box-shadow: none;
  color: var(--color-ink-soft);
  cursor: pointer;
  font-size: calc(13 / var(--rem-base) * 1rem);
  line-height: 1;
}

.nav-panel-explore .context .title {
  font-weight: 600;
}

.nav-panel-explore .context .noversion,
.nav-panel-explore .context .version {
  display: block;
  padding: calc(3 / var(--rem-base) * 1rem) calc(22 / var(--rem-base) * 1rem)
           calc(3 / var(--rem-base) * 1rem) calc(9 / var(--rem-base) * 1rem);
  border: 1px solid var(--color-line);
  border-radius: calc(6 / var(--rem-base) * 1rem);
  background: var(--color-white) url("../img/chevron.svg") no-repeat
              right calc(8 / var(--rem-base) * 1rem) top 50% / auto calc(7 / var(--rem-base) * 1rem);
  font-family: var(--monospace-font-family);
  font-size: calc(12 / var(--rem-base) * 1rem);
}
```

- [ ] **Step 7: Build and render**

```bash
cd antora-ui-camel && node ../.yarn/releases/yarn-4.1.0.cjs build && cd ..
node .yarn/releases/yarn-4.1.0.cjs build:antora-ui
```

Expected: both exit 0.

- [ ] **Step 8: Measure**

On `tests/antora-ui/out/fixture/4.18/getting-started.html` at a 1400px viewport,
using `getBoundingClientRect` and `getComputedStyle`:

| assertion | expected |
|---|---|
| `.nav-container` width | 280px |
| `.nav` `border-right-width` | 1px |
| `.nav-search` bottom edge is above `.nav-menu` top edge | true |
| `.nav-menu` `overflow-y` | `auto` |
| `.nav-menu` scrolls independently (set `scrollTop = 50`, read it back) | 50 |
| `.nav-panel-explore .context` bottom edge equals `.nav` bottom edge | within 1px |
| current page link `background-color` | `rgb(251, 234, 216)` |
| current page link `color` | `rgb(168, 78, 13)` |
| current page link `border-radius` | 6px |
| a `[data-depth="2"]` link's left edge minus a `[data-depth="1"]` link's left edge | 18px |
| `.nav-item-toggle` rendered caret width | 9px |
| context bar version chip `font-family` | starts with `JetBrains Mono` |

Also confirm the tree still reaches its last item: scroll `.nav-menu` to the
bottom and check the last `.nav-link`'s rect does not overlap the context bar's
rect.

- [ ] **Step 9: Commit**

```bash
git add antora-ui-camel/src/css/nav.css antora-ui-camel/src/css/vars.css
git commit -m "style(docs): repaint the documentation nav panel"
```

---

## Task 5: Toolbar, breadcrumbs, version chip

**Files:**
- Modify: `antora-ui-camel/src/css/toolbar.css`
- Modify: `antora-ui-camel/src/css/breadcrumbs.css`
- Modify: `antora-ui-camel/src/css/page-versions.css`
- Modify: `antora-ui-camel/src/partials/toolbar.hbs`

**Interfaces:**
- Consumes: `--toolbar-height` (46px), `--toolbar-background`
  (`rgb(250 247 241 / 92%)`), `--page-version-menu-background` (white) from Task 2.
- Produces: nothing later tasks depend on.

**Background you need.** `.toolbar` is also applied by Hugo, as an empty
`<div class="static toolbar">` in `layouts/_default/single.html`. Adding a bottom
border to `.toolbar` would draw a stray rule across every Hugo static page, so
`.static.toolbar` must cancel it.

`.home-link` is removed. The artboard has no home affordance in the toolbar and
the header brand link already goes home. `.page-versions` stays, restyled: it
jumps to the same page in another version, which nothing else on the page offers,
and removing a working documentation feature is not a call this piece is entitled
to make just because an artboard did not draw it.

- [ ] **Step 1: Remove the home link**

In `toolbar.hbs`, delete these three lines:

```hbs
  {{#with site.homeUrl}}
  <a href="{{{relativize this}}}" class="home-link{{#if @root.page.home}} is-current{{/if}}"></a>
  {{/with}}
```

In `toolbar.css`, delete the `.home-link` rule and the
`.home-link:hover, .home-link.is-current` rule.

In `breadcrumbs.css`, delete the now-dead rule:

```css
a + .breadcrumbs {
  padding-left: 0.05rem;
}
```

- [ ] **Step 2: Repaint the toolbar**

In `toolbar.css`, replace the `.toolbar` and `.static.toolbar` rules:

```css
.toolbar {
  align-items: center;
  background-color: var(--toolbar-background);
  backdrop-filter: blur(8px);
  border-bottom: 1px solid var(--toolbar-border-color);
  box-shadow: none;
  color: var(--color-ink-soft);
  display: flex;
  font-size: calc(13.5 / var(--rem-base) * 1rem);
  gap: calc(18 / var(--rem-base) * 1rem);
  height: var(--toolbar-height);
  justify-content: flex-start;
  padding: 0 calc(40 / var(--rem-base) * 1rem);
  position: sticky;
  top: var(--navbar-height);
  z-index: var(--z-index-toolbar);
}

.static.toolbar {
  border-bottom: 0;
  box-shadow: none;
  margin: 0;
  max-width: 100vw;
}
```

`blur(8px)` is a raw pixel value on purpose. It is a filter radius, not a layout
dimension, so it does not scale with `--rem-base`.

At and below 1024px the toolbar's horizontal padding of 40px is too wide for a
phone. Add, inside the existing `@media screen and (width <= 1024px)` block:

```css
  .toolbar {
    padding: 0 calc(16 / var(--rem-base) * 1rem);
  }
```

- [ ] **Step 3: Style the breadcrumbs**

In `breadcrumbs.css`, replace the `.breadcrumbs` rule and the `li::after` rule,
and add the three color rules:

```css
.breadcrumbs {
  display: none;
  flex: 1 1;
  min-width: 0;
  padding: 0;
  line-height: var(--nav-line-height);
}

.breadcrumbs li::after {
  content: '/';
  padding: 0 calc(8 / var(--rem-base) * 1rem);
}

.toolbar .breadcrumbs a {
  color: var(--color-ink-soft);
}

.toolbar .breadcrumbs a:hover {
  color: var(--link-font-color);
}

.toolbar .breadcrumbs li:last-of-type a {
  color: var(--color-ink);
  font-weight: 600;
  text-decoration: none;
}
```

`.toolbar a { color: inherit }` in `toolbar.css` is specificity (0,1,1); the last
rule above is (0,3,1) and wins.

- [ ] **Step 4: Style the version chip and the edit link**

In `page-versions.css`, replace `.page-versions` and
`.page-versions .version-menu-toggle`, and repaint the menu:

```css
.page-versions {
  display: none;
  margin: 0;
  position: relative;
  line-height: 1;
}

.page-versions .version-menu-toggle {
  border: 1px solid var(--color-line);
  border-radius: calc(6 / var(--rem-base) * 1rem);
  background: var(--color-white) url("../img/chevron.svg") no-repeat
              right calc(8 / var(--rem-base) * 1rem) top 50% / auto calc(7 / var(--rem-base) * 1rem);
  color: var(--color-ink-soft);
  cursor: pointer;
  font-family: var(--monospace-font-family);
  font-size: calc(12 / var(--rem-base) * 1rem);
  outline: none;
  padding: calc(3 / var(--rem-base) * 1rem) calc(22 / var(--rem-base) * 1rem)
           calc(3 / var(--rem-base) * 1rem) calc(9 / var(--rem-base) * 1rem);
  position: relative;
  z-index: var(--z-index-page-version-menu);
}

.page-versions .version-menu {
  border: 1px solid var(--color-line);
  border-radius: calc(6 / var(--rem-base) * 1rem);
  background-color: var(--page-version-menu-background);
  padding: calc(30 / var(--rem-base) * 1rem) calc(9 / var(--rem-base) * 1rem)
           calc(8 / var(--rem-base) * 1rem);
  position: absolute;
  top: 0;
  left: 0;
  min-width: 100%;
  font-family: var(--monospace-font-family);
  font-size: calc(12 / var(--rem-base) * 1rem);
}
```

Leave the `@media screen and (width >= 1025px) { .page-versions { display: block } }`
block and the `.version` rules as they are.

In `toolbar.css`, replace `.toolbar .edit-this-page a`:

```css
.toolbar .edit-this-page a {
  color: var(--color-ink-soft);
  font-weight: 600;
}

.toolbar .edit-this-page a:hover {
  color: var(--link-font-color);
}
```

and change `.edit-this-page` to drop its right padding, which the toolbar's
padding now provides:

```css
.edit-this-page {
  display: none;
  padding: 0;
}
```

- [ ] **Step 5: Build and render**

```bash
cd antora-ui-camel && node ../.yarn/releases/yarn-4.1.0.cjs build && cd ..
node .yarn/releases/yarn-4.1.0.cjs build:antora-ui
```

Expected: both exit 0.

- [ ] **Step 6: Measure**

On the rendered page at 1400px:

| assertion | expected |
|---|---|
| `.toolbar` height | 46px |
| `.toolbar` `border-bottom-width` | 1px |
| `.toolbar` `background-color` | `rgba(250, 247, 241, 0.92)` |
| `.toolbar` `backdrop-filter` | `blur(8px)` |
| `.toolbar` top offset while scrolled | 66px |
| `.breadcrumbs li:last-of-type a` color | `rgb(33, 28, 23)` |
| `.breadcrumbs li:first-of-type a` color | `rgb(92, 85, 76)` |
| `.edit-this-page` right edge to `.toolbar` right edge | 40px |
| `.page-versions .version-menu-toggle` `font-family` | starts with `JetBrains Mono` |
| `document.querySelectorAll('.home-link').length` | 0 |

Then open any Hugo page rendered from `layouts/_default/single.html` and confirm
`.static.toolbar` has `border-bottom-width: 0px`, so no stray rule appears.

- [ ] **Step 7: Commit**

```bash
git add antora-ui-camel/src/css/toolbar.css antora-ui-camel/src/css/breadcrumbs.css antora-ui-camel/src/css/page-versions.css antora-ui-camel/src/partials/toolbar.hbs
git commit -m "style(docs): repaint the documentation toolbar"
```

---

## Task 6: Content grid and TOC

**Files:**
- Modify: `antora-ui-camel/src/css/main.css`
- Modify: `antora-ui-camel/src/css/toc.css`

**Interfaces:**
- Consumes: `--toc-width` (220px) from Task 2.
- Produces: `main.article > .content` as a grid whose first column holds `.doc`.
  Task 7 and Task 8 style what is inside that column and must not set margins on
  `.doc` that would fight the grid's padding.

**Background you need.** Hugo's `layouts/_default/single.html` also renders
`<main><div class="content">`, and its pages are 1200px wide, not the 1180px the
docs grid uses. Antora's `main.hbs` renders `<main class="article">`, so the class
is the discriminator. Scope the grid to `main.article > .content` and leave
`main > .content` alone.

`main.css:23` currently sets `aside.toc.sidebar { flex: 0 0 var(--toc-width); min-width: 15rem }`.
In a grid, `min-width: 15rem` (270px) would force the 220px column wider. It must go.

- [ ] **Step 1: Add the docs grid**

In `main.css`, inside the existing `@media screen and (width >= 1025px)` block,
after the `main > .content { display: flex; }` rule, add:

```css
  main.article > .content {
    display: grid;
    grid-template-columns: minmax(0, 1fr) var(--toc-width);
    gap: calc(56 / var(--rem-base) * 1rem);
    max-width: calc(1180 / var(--rem-base) * 1rem);
    padding: calc(44 / var(--rem-base) * 1rem) calc(40 / var(--rem-base) * 1rem)
             calc(80 / var(--rem-base) * 1rem);
  }

  main.article > .content > .doc {
    margin: 0;
    max-width: none;
    padding: 0;
  }
```

`main.article > .content` is specificity (0,2,1) and beats `main > .content` at
(0,1,1), so ordering inside the block does not matter.

- [ ] **Step 2: Fix the sidebar's minimum width**

In `main.css`, replace:

```css
  aside.toc.sidebar {
    flex: 0 0 var(--toc-width);
    min-width: 15rem;
  }
```

with:

```css
  aside.toc.sidebar {
    flex: 0 0 var(--toc-width);
    min-width: 0;
  }
```

- [ ] **Step 3: Repaint the TOC**

Replace the contents of `toc.css` with:

```css
.toc-menu {
  color: var(--toc-font-color);
}

.toc.sidebar .toc-menu {
  margin-right: 0;
  position: sticky;
  top: var(--toc-top);
}

.toc .toc-menu h3 {
  color: var(--color-ink-soft);
  font-family: var(--monospace-font-family);
  font-size: calc(12 / var(--rem-base) * 1rem);
  font-weight: 600;
  letter-spacing: 0.08em;
  line-height: 1.3;
  margin: 0;
  padding-bottom: calc(10 / var(--rem-base) * 1rem);
  text-transform: uppercase;
}

.toc.sidebar .toc-menu h3 {
  display: block;
  height: auto;
}

.toc .toc-menu ul {
  font-size: calc(13.5 / var(--rem-base) * 1rem);
  line-height: var(--toc-line-height);
  list-style: none;
  margin: 0;
  padding: 0;
}

.toc.sidebar .toc-menu ul {
  max-height: var(--toc-height);
  overflow-y: auto;
}

.toc .toc-menu li {
  margin: 0;
}

.toc .toc-menu li[data-level='2'] a {
  padding-left: calc(24 / var(--rem-base) * 1rem);
}

.toc .toc-menu li[data-level='3'] a {
  padding-left: calc(36 / var(--rem-base) * 1rem);
}

@media screen and (width <= 1024px) {
  .toc .toc-menu ul li ul li ul li a {
    padding-left: calc(24 / var(--rem-base) * 1rem);
  }
}

.toc .toc-menu a {
  border-left: 2px solid var(--color-line);
  color: var(--color-ink-soft);
  display: block;
  padding: calc(6 / var(--rem-base) * 1rem) 0 calc(6 / var(--rem-base) * 1rem)
           calc(12 / var(--rem-base) * 1rem);
  text-decoration: none;
}

.sidebar.toc .toc-menu a {
  display: block;
  outline: none;
}

.toc .toc-menu a:hover {
  border-left-color: var(--color-line-hover);
  color: var(--color-ink);
}

.toc .toc-menu a.is-active {
  border-left-color: var(--color-camel-orange);
  color: var(--color-ink);
  font-weight: 600;
}

.sidebar.toc .toc-menu a:focus {
  background: var(--panel-background);
}

.toc .toc-menu .is-hidden-toc {
  display: none !important;
}
```

The `@media screen and (width >= 1025px)` block that reduced the heading and list
font sizes is gone: the sizes above are already the desktop sizes.

- [ ] **Step 4: Build and render**

```bash
cd antora-ui-camel && node ../.yarn/releases/yarn-4.1.0.cjs build && cd ..
node .yarn/releases/yarn-4.1.0.cjs build:antora-ui
```

Expected: both exit 0.

- [ ] **Step 5: Measure**

On the rendered page **at 1460px**, not 1400px. The nav panel takes a fixed 280px,
so the content column can only reach its 1180px cap at 280 + 1180 = 1460px of
viewport. At 1400px it correctly measures 1120px. Measure the cap at 1460px and,
if you want a second data point, confirm it tracks the viewport below that.

| assertion | expected |
|---|---|
| `main.article > .content` `display` | `grid` |
| `main.article > .content` width at 1460px | 1180px |
| `aside.toc.sidebar` width | 220px |
| gap between `.doc` right edge and `aside.toc.sidebar` left edge | 56px |
| `.doc` left edge to `main.article > .content` left edge | 40px |
| `.toc-menu` sticky top after scrolling 800px | 130px |
| `.toc .toc-menu h3` `font-family` | starts with `JetBrains Mono` |
| `.toc .toc-menu h3` color | `rgb(92, 85, 76)` |
| `.toc .toc-menu a` `border-left-width` | 2px |
| `.toc .toc-menu a.is-active` `border-left-color` after scrolling to a heading | `rgb(233, 120, 38)` |

- [ ] **Step 6: Verify a Hugo static page kept its own width**

Render or open a page from `layouts/_default/single.html` and confirm its
`main > .content` is **not** `display: grid` and is not capped at 1180px. If it
is, the selector was written as `main > .content` instead of `main.article > .content`.

- [ ] **Step 7: Commit**

```bash
git add antora-ui-camel/src/css/main.css antora-ui-camel/src/css/toc.css
git commit -m "style(docs): grid the article column and repaint the TOC"
```

---

## Task 7: Article typography, code blocks, lists

**Files:**
- Modify: `antora-ui-camel/src/css/doc.css`
- Modify: `antora-ui-camel/src/partials/article.hbs`

**Interfaces:**
- Consumes: the grid from Task 6, `--doc-font-size--desktop` (16px) and
  `--doc-line-height` (1.7) from Task 2.
- Produces: `.doc-eyebrow`, a new element Task 8 does not touch.

**Background you need.** These rules are written against `.doc`, which Hugo also
applies to its static pages through `.static.doc`. That is intended: pieces 4 and
5 then start from a correct baseline. Roughly eight Hugo pages change appearance
in this task, before their own designs land. That is expected, not a regression.

Antora's real markup, confirmed by rendering the fixture:

```html
<article class="doc">
<h1 class="page">Getting Started</h1>
<div id="preamble"><div class="sectionbody">
<div class="paragraph"><p>Lead paragraph...</p></div>
...
<div class="sect1">
<h2 id="_install"><a class="anchor" href="#_install"></a>Install the Camel CLI</h2>
<div class="sectionbody">
<div class="listingblock"><div class="content">
<pre class="highlightjs highlight"><code class="language-bash hljs" data-lang="bash">...</code></pre>
</div></div>
```

Note that for a highlighted block the background sits on the `code` element, not
on the `pre`. Both selectors in the existing
`.doc pre:not(.highlight), .doc pre.highlight code` rule must carry the new
radius and padding.

- [ ] **Step 1: Add the eyebrow to the template**

In `article.hbs`, insert the eyebrow **immediately before** the
`{{#with page.title}}...{{/with}}` block, so it precedes the `h1` in the DOM:

```hbs
{{#with page.component.title}}
<div class="doc-eyebrow">{{this}}</div>
{{/with}}
```

It must sit inside the `{{else}}` branch, so the 404 layout does not get one.

**This is DOM order, not a CSS reorder, and that is deliberate.** An earlier
draft of this plan put the eyebrow after the `h1` and lifted it visually with
`display: flex; flex-direction: column` on `.doc` plus `order: -1`, in order to
keep `h1.page:first-child` matching. That approach is wrong and must not be used.
Making `.doc` a flex container turns `.sect1` into a flex item, which establishes
a block formatting context, which stops its first child's margin from collapsing
through it. `#preamble + .sect1, .doc .sect1 + .sect1` sets `margin-top: 2rem`
(36px) and Step 5 gives `h2` a `margin-top` of 44px. Today those collapse to 44px;
under flex they would sum to 80px at **every section boundary**, on every
documentation page and on the eight-plus Hugo pages that share `.doc`.

- [ ] **Step 2: Stop shouting the headings**

In `doc.css`, in the `.doc h1, .doc h2, ... .doc h6` rule, delete the line:

```css
  text-transform: uppercase;
```

- [ ] **Step 3: Style the h1 and the eyebrow**

The `h1` is no longer the first child of `.doc`, because the eyebrow now precedes
it, so the two `:first-child` qualifiers on the `.doc` half must be dropped or the
rules stop matching entirely. Leave the `.static` half alone: Hugo static pages
have no eyebrow and their `h1` is still first.

Replace the `.static > h1:first-child, .doc > h1.page:first-child` rule:

```css
.static > h1:first-child,
.doc > h1.page {
  font-size: calc(42 / var(--rem-base) * 1rem);
  font-weight: var(--heading-font-weight-display);
  letter-spacing: -0.03em;
  line-height: 1.05;
  margin: calc(10 / var(--rem-base) * 1rem) 0 0;
}
```

and the image rule just below it, for the same reason:

```css
.doc > h1.page img {
  width: 2rem;
}
```

Relaxing these is safe: `article.hbs` renders `h1.page` exactly once, so
`:first-child` was only ever describing its position, never discriminating between
candidates. Those two are the only `:first-child` selectors in `doc.css` that
apply to a direct child of `.doc`; the rest sit inside tables, admonitions,
checklists, example blocks, sidebar blocks, colists and `kbd` sequences, none of
which this change touches.

Add, immediately after it:

```css
.doc .doc-eyebrow {
  color: var(--color-orange-deep);
  font-family: var(--monospace-font-family);
  font-size: calc(12 / var(--rem-base) * 1rem);
  font-weight: 600;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}
```

Do **not** add `display: flex`, `flex-direction: column`, or `order: -1` anywhere.
`.doc` stays in normal block flow. The eyebrow sits above the `h1` because it
precedes it in the DOM, per Step 1.

Because `.doc` stays block-level, margins between its children still collapse, so
`.sect1`'s 36px `margin-top` and the `h2`'s 44px collapse to 44px as they do
today. Step 9 verifies that number; if it reads 80px, something reintroduced a
block formatting context on `.sect1` and that is the first thing to look for.

- [ ] **Step 4: Style the lead paragraph**

Add after the eyebrow rule:

```css
.doc > h1.page + .paragraph > p,
.doc > #preamble > .sectionbody > .paragraph:first-child > p {
  font-size: calc(16.5 / var(--rem-base) * 1rem);
  line-height: 1.7;
  margin: calc(20 / var(--rem-base) * 1rem) 0 0;
}
```

Both selectors are needed: Antora emits `#preamble` when the page has sections,
and a bare `.paragraph` when it does not.

- [ ] **Step 5: Style h2**

Replace `.doc h2:not(.discrete)`:

```css
.doc h2:not(.discrete) {
  font-size: calc(26 / var(--rem-base) * 1rem);
  letter-spacing: -0.02em;
  margin: calc(44 / var(--rem-base) * 1rem) 0 0;
  overflow-wrap: break-word;
  padding: calc(8 / var(--rem-base) * 1rem) 0 0;
}
```

Delete the whole `.doc h2:not(.discrete)::after` rule. The artboard has no rule
beneath a heading.

- [ ] **Step 6: Style inline code**

Replace `.doc p code, .doc thead code`:

```css
.doc p code,
.doc thead code {
  background: var(--code-background);
  border-radius: calc(4 / var(--rem-base) * 1rem);
  color: var(--code-font-color);
  font-size: calc(14.5 / var(--rem-base) * 1rem);
  overflow-wrap: break-word;
  padding: calc(2 / var(--rem-base) * 1rem) calc(6 / var(--rem-base) * 1rem);
}
```

Delete the media block that made inline code larger than body text on tablets:

```css
@media screen and (width <= 1024px) and (width >= 480px) {
  .doc p code,
  .doc thead code {
    font-size: var(--body-font-size);
  }
}
```

It sets inline code to 17px against a 16px body, which fights the new sizing.

- [ ] **Step 7: Style code blocks**

Replace `.doc pre`:

```css
.doc pre {
  font-size: calc(13.5 / var(--rem-base) * 1rem);
  line-height: 1.7;
  margin: 0;
}
```

Replace `.doc pre:not(.highlight), .doc pre.highlight code`:

```css
.doc pre:not(.highlight),
.doc pre.highlight code {
  background: var(--pre-background);
  border-radius: calc(10 / var(--rem-base) * 1rem);
  box-shadow: none;
  color: var(--pre-font-color);
  display: block;
  overflow-x: auto;
  padding: calc(18 / var(--rem-base) * 1rem) calc(20 / var(--rem-base) * 1rem);
}
```

Add, so a code block sits 14px below its lead-in paragraph rather than the shared
18px used by every other block type:

```css
.doc .listingblock {
  margin-top: calc(14 / var(--rem-base) * 1rem);
}
```

- [ ] **Step 8: Style lists**

Replace `.doc ol, .doc ul`:

```css
.doc ol,
.doc ul {
  margin: 0;
  padding: 0 0 0 calc(22 / var(--rem-base) * 1rem);
}
```

Add:

```css
.doc .olist > ol,
.doc .ulist > ul {
  line-height: 1.8;
}
```

- [ ] **Step 9: Build, render, measure**

```bash
cd antora-ui-camel && node ../.yarn/releases/yarn-4.1.0.cjs build && cd ..
node .yarn/releases/yarn-4.1.0.cjs build:antora-ui
```

On the rendered page at 1400px:

| assertion | expected |
|---|---|
| `.doc-eyebrow` top edge is above `h1.page` top edge | true |
| `.doc-eyebrow` `text-transform` | `uppercase` |
| `.doc-eyebrow` color | `rgb(168, 78, 13)` |
| `.doc-eyebrow` text content | `Camel Core` |
| `h1.page` `font-size` | 42px |
| `h1.page` `font-weight` | 800 |
| `h1.page` `text-transform` | `none` |
| lead `p` `font-size` | 16.5px |
| first `h2` `font-size` | 26px |
| `getComputedStyle(h2, '::after').content` | `none` |
| body `p` `font-size` | 16px |
| body `p` `line-height` | 27.2px (16 x 1.7) |
| inline `code` `font-size` | 14.5px |
| `pre.highlight code` `border-radius` | 10px |
| `pre.highlight code` `padding` | 18px 20px |
| `pre.highlight code` `box-shadow` | `none` |
| `.ulist > ul` `padding-left` | 22px |
| gap between one `.sect1` and the next section's `h2` | 44px, not 80px |

That last row is the margin-collapse check. 44px means `.sect1`'s 36px `margin-top`
collapsed with the `h2`'s 44px, as it should in normal block flow. 80px means the
two summed, which would mean `.doc` or `.sect1` acquired a block formatting
context somewhere. Measure it, do not assume it.

- [ ] **Step 10: Check a Hugo static page**

Open a page rendered from `layouts/_default/single.html`. Its `h1` should now be
sentence case at 42px and its `h2` should have no rule beneath it. This is the
intended broad reach, not a defect.

- [ ] **Step 11: Commit**

```bash
git add antora-ui-camel/src/css/doc.css antora-ui-camel/src/partials/article.hbs
git commit -m "style(docs): repaint article typography, code blocks and lists"
```

---

## Task 8: Tables and admonitions

**Files:**
- Modify: `antora-ui-camel/src/css/doc.css`

**Interfaces:**
- Consumes: the six admonition chip tokens from Task 2.
- Produces: nothing later tasks depend on.

**Background you need.** `extensions/table.js` is a postprocessor that wraps
**every** `<table>` in `<div class="table-wrapper">`, including admonition tables.
Two consequences:

1. The existing rule `.doc .admonitionblock > table` (`doc.css:315`) never matches
   in production. It is dead. Replace it with `.doc .admonitionblock table`.
2. The card treatment goes on `.table-wrapper`, which therefore has to be cancelled
   inside `.admonitionblock`.

`.table-wrapper` already has `overflow-x: auto`. That makes it a scroll container,
and scroll containers clip to their `border-radius`, so the rounded corners work
without `overflow: hidden`, which would have broken horizontal scrolling on wide
tables.

The rendered admonition markup is a two-cell table, which already gives the
artboard's chip-left, text-right arrangement without changing any structure:

```html
<div class="admonitionblock tip">
<div class="table-wrapper"><table>
<tr>
<td class="icon"><i class="fa icon-tip" title="Tip"></i></td>
<td class="content">Tip body.</td>
</tr>
</table></div>
</div>
```

The artboard draws TIP as a chip card and NOTE as an orange left rule with the
label above. Antora emits identical markup for all five types, so two structures
cannot both be expressed. All five get the card, and the type shows in the chip's
color and in its text.

- [ ] **Step 1: Give content tables the card**

In `doc.css`, replace the `.doc .table-wrapper` rule:

```css
.doc .table-wrapper {
  background: var(--color-white);
  border: 1px solid var(--color-line);
  border-radius: calc(10 / var(--rem-base) * 1rem);
  margin: calc(16 / var(--rem-base) * 1rem) 0 0;
  overflow-x: auto;
}
```

Keep the four `.doc .table-wrapper::-webkit-scrollbar*` rules unchanged.

- [ ] **Step 2: Restyle the table itself**

Replace `.doc table.tableblock`, `.doc table.tableblock thead th`, and
`.doc table.tableblock td, .doc table.tableblock > :not(thead) th`:

```css
.doc table.tableblock {
  border-collapse: collapse;
  font-size: calc(15 / var(--rem-base) * 1rem);
  margin: 0;
}

.doc table.tableblock thead th {
  background: var(--color-paper-2);
  border-bottom: 1px solid var(--color-line);
  color: var(--color-ink-soft);
  font-family: var(--monospace-font-family);
  font-size: calc(11.5 / var(--rem-base) * 1rem);
  font-weight: 600;
  letter-spacing: 0.06em;
  padding: calc(11 / var(--rem-base) * 1rem) calc(16 / var(--rem-base) * 1rem);
  text-align: left;
  text-transform: uppercase;
}

.doc table.tableblock td,
.doc table.tableblock > :not(thead) th {
  border-top: 1px solid var(--color-line-soft);
  border-bottom: 0;
  padding: calc(12 / var(--rem-base) * 1rem) calc(16 / var(--rem-base) * 1rem);
}

.doc table.tableblock tbody tr:first-child > td,
.doc table.tableblock tbody tr:first-child > th {
  border-top: 0;
}
```

The first column also gains `font-weight: 700`. Add it by **editing the existing**
`.doc table.tableblock tbody tr td:first-child` rule in place, so it reads:

```css
/* breaks long property names */
.doc table.tableblock tbody tr td:first-child {
  width: 25%;
  overflow-wrap: anywhere;
  font-weight: 700;
}
```

Do not add a second rule with that selector: `stylelint-config-standard` enables
`no-duplicate-selectors` and the bundle build would fail.

The header text is `--color-ink-soft`, not the `--color-ink-muted` the artboard
uses. `#8a8074` is 3.35:1 on `--color-paper-2` at 11.5px, which fails. This is one
of the four spec corrections listed at the top of this plan.

Delete the unscoped rule near the end of the file, which the above supersedes:

```css
table.tableblock thead {
  background: var(--color-paper-2);
  font-weight: var(--body-font-weight-bold);
}
```

Note what is deliberately **not** adopted: the artboard's first column is
`white-space: nowrap`. The existing `width: 25%; overflow-wrap: anywhere` stays
instead, because the component reference has over three hundred pages of option
tables whose names would blow the column out under `nowrap`.

- [ ] **Step 3: Turn admonitions into cards**

Replace `.doc .admonitionblock`:

```css
.doc .admonitionblock {
  background: var(--color-white);
  border: 1px solid var(--color-line);
  border-left: calc(3 / var(--rem-base) * 1rem) solid var(--color-camel-orange);
  border-radius: 0 calc(12 / var(--rem-base) * 1rem) calc(12 / var(--rem-base) * 1rem) 0;
  box-shadow: none;
  margin: calc(28 / var(--rem-base) * 1rem) 0 0;
  padding: calc(16 / var(--rem-base) * 1rem) calc(20 / var(--rem-base) * 1rem);
}
```

Cancel the card treatment on the wrapper Antora puts inside it:

```css
.doc .admonitionblock .table-wrapper {
  background: none;
  border: 0;
  border-radius: 0;
  margin: 0;
  overflow: visible;
}
```

Replace `.doc .admonitionblock > table` (the dead selector) with:

```css
.doc .admonitionblock table {
  border-collapse: collapse;
  position: relative;
  table-layout: auto;
  width: 100%;
}
```

`table-layout` changes from `fixed` to `auto` so the chip cell can shrink to its
content.

- [ ] **Step 4: Style the chip and the content cell**

Replace `.doc .admonitionblock .icon` and the five per-type `.icon` rules:

```css
.doc .admonitionblock td.icon {
  padding: 0 calc(14 / var(--rem-base) * 1rem) 0 0;
  vertical-align: top;
  white-space: nowrap;
  width: 1px;
}

.doc .admonitionblock .icon i {
  background: var(--color-orange-tint);
  border-radius: calc(20 / var(--rem-base) * 1rem);
  color: var(--color-orange-deep);
  display: inline-block;
  font-family: var(--monospace-font-family);
  font-size: calc(11 / var(--rem-base) * 1rem);
  font-style: normal;
  font-weight: 600;
  height: auto;
  letter-spacing: 0.04em;
  line-height: 1.4;
  padding: calc(3 / var(--rem-base) * 1rem) calc(8 / var(--rem-base) * 1rem);
  text-transform: uppercase;
}

.doc .admonitionblock .icon i::after {
  content: attr(title);
  hyphens: none;
  writing-mode: horizontal-tb;
}

.doc .admonitionblock.caution {
  border-left-color: var(--caution-color);
}

.doc .admonitionblock.caution .icon i {
  background: var(--caution-tint);
  color: var(--caution-chip-font-color);
}

.doc .admonitionblock.important {
  border-left-color: var(--important-color);
}

.doc .admonitionblock.important .icon i {
  background: var(--important-tint);
  color: var(--important-chip-font-color);
}

.doc .admonitionblock.warning {
  border-left-color: var(--warning-color);
}

.doc .admonitionblock.warning .icon i {
  background: var(--warning-tint);
  color: var(--warning-chip-font-color);
}
```

`tip` and `note` need no per-type rule: they take the orange defaults above, which
is what `SCOPE.md` section 2 asks for.

The old `writing-mode: tb-rl` on the label is replaced by `horizontal-tb`. The
chip runs horizontally now.

Replace the two content rules:

```css
.doc .admonitionblock p,
.doc .admonitionblock td.content {
  font-size: calc(14.5 / var(--rem-base) * 1rem);
  line-height: 1.6;
}

.doc .admonitionblock td.content {
  background: none;
  color: var(--color-ink-soft);
  padding: 0;
  width: auto;
}
```

- [ ] **Step 5: Build, render, measure**

```bash
cd antora-ui-camel && node ../.yarn/releases/yarn-4.1.0.cjs build && cd ..
node .yarn/releases/yarn-4.1.0.cjs build:antora-ui
```

On the rendered page at 1400px:

| assertion | expected |
|---|---|
| content table's `.table-wrapper` `border-radius` | 10px |
| content table's `.table-wrapper` `background-color` | `rgb(255, 255, 255)` |
| `thead th` `background-color` | `rgb(244, 238, 227)` |
| `thead th` `color` | `rgb(92, 85, 76)` |
| `thead th` `font-family` | starts with `JetBrains Mono` |
| `thead th` `padding` | 11px 16px |
| `tbody td` `padding` | 12px 16px |
| first `tbody tr` `td` `border-top-width` | 0px |
| second `tbody tr` `td` `border-top-color` | `rgb(240, 233, 221)` |
| admonition `.table-wrapper` `border-width` | 0px |
| `.admonitionblock.tip` `border-left-color` | `rgb(233, 120, 38)` |
| `.admonitionblock.caution` `border-left-color` | `rgb(160, 67, 156)` |
| `.admonitionblock.important` `.icon i` `color` | `rgb(176, 37, 37)` |
| `.admonitionblock.warning` `.icon i` `background-color` | `rgb(253, 240, 220)` |
| every `.icon i` `writing-mode` | `horizontal-tb` |
| chip's rect is left of and above the content cell's rect | true, for all five |
| `.admonitionblock td.content` `font-size` | 14.5px |

- [ ] **Step 6: Re-measure the contrast on the rendered colors**

Do not trust the values in this plan. Read the computed `color` and
`background-color` off each of the five chips as rendered, compute the WCAG ratio
from those, and confirm each is at or above 4.5:1. Report the five numbers.

- [ ] **Step 7: Commit**

```bash
git add antora-ui-camel/src/css/doc.css
git commit -m "style(docs): card tables and admonitions"
```

---

## Task 9: Pagination and tabs

**Files:**
- Modify: `antora-ui-camel/src/css/pagination.css`
- Modify: `antora-ui-camel/src/css/tabs.css`

**Interfaces:**
- Consumes: `--code-tab-idle-font-color` from Task 2.
- Produces: nothing later tasks depend on.

**Background you need.** `nav.pagination` is Antora's prev/next block. Hugo's blog
pagination is `<ul class="pagination">` inside a `<nav>` with no class, so there is
no selector collision; piece 4 owns that one.

`tabs.css` imports `@asciidoctor/tabs/dist/css/tabs.css` at the top, then overrides
it. The package's rules you are fighting are:

```css
.tablist > ul li { background-color: #fff; border: 1px solid #dcdcdc; border-bottom: 0; padding: 0.25em 1em; font-weight: bold; }
.tabs:not(.is-loading) .tablist li:not(.is-selected) { background-color: #f5f5f5; }
.tabs:not(.is-loading) .tablist li.is-selected::after { background-color: inherit; height: 3px; bottom: -1.5px; left: 0; right: 0; }
.tabpanel { background-color: #fff; padding: 1.25em; border: 1px solid #dcdcdc; }
.tablist.ulist > ul li + li { margin-left: 0.25em; }
```

The `is-loading` variants exist so the first tab looks selected before the script
runs. Every override must cover both the `is-loading` and the settled state, or
the tab bar flashes the wrong colors on load.

The rendered markup is `div.openblock.tabs > div.content > (div.ulist.tablist > ul > li.tab, div.tabpanel, div.tabpanel)`.

- [ ] **Step 1: Rewrite pagination**

Replace the contents of `pagination.css` with:

```css
nav.pagination {
  border-top: 1px solid var(--color-line);
  display: flex;
  line-height: 1;
  margin: calc(56 / var(--rem-base) * 1rem) 0 0;
  padding: calc(24 / var(--rem-base) * 1rem) 0 0;
}

nav.pagination span {
  display: flex;
  flex: 50%;
  flex-direction: column;
}

nav.pagination .prev {
  padding-right: 0.5rem;
}

nav.pagination .next {
  margin-left: auto;
  padding-left: 0.5rem;
  text-align: right;
}

nav.pagination span::before {
  color: var(--color-ink-soft);
  font-family: var(--monospace-font-family);
  font-size: calc(11.5 / var(--rem-base) * 1rem);
  padding-bottom: calc(4 / var(--rem-base) * 1rem);
}

nav.pagination .prev::before {
  content: '\2190 Previous';
}

nav.pagination .next::before {
  content: 'Next \2192';
}

nav.pagination a {
  background: none;
  color: var(--color-ink);
  font-weight: 700;
  line-height: 1.3;
  position: relative;
}

nav.pagination a:hover {
  color: var(--link-font-color);
}
```

That deletes the `nav.pagination a::before, nav.pagination a::after` rule and both
chevron rules; the arrows live in the eyebrow text now. `background: none` on the
link cancels the dotted underline `.doc a` paints, which does not belong on a
two-line block link.

- [ ] **Step 2: Put the tabs on dark**

Replace the contents of `tabs.css` with:

```css
@import url('@asciidoctor/tabs/dist/css/tabs.css');

.doc .tabs {
  margin: calc(14 / var(--rem-base) * 1rem) 0 0;
}

.doc .tabs > .content {
  background: var(--color-ink);
  border: 1px solid var(--color-dark-line);
  border-radius: calc(10 / var(--rem-base) * 1rem);
  overflow: hidden;
}

.doc .tabs .tablist > ul {
  border-bottom: 1px solid var(--color-dark-line);
  gap: calc(2 / var(--rem-base) * 1rem);
  padding: calc(10 / var(--rem-base) * 1rem) calc(12 / var(--rem-base) * 1rem) 0;
}

.doc .tabs .tablist > ul li {
  background: none;
  border: 0;
  color: var(--code-tab-idle-font-color);
  font-family: var(--monospace-font-family);
  font-size: calc(12.5 / var(--rem-base) * 1rem);
  font-weight: 600;
  padding: calc(7 / var(--rem-base) * 1rem) calc(14 / var(--rem-base) * 1rem)
           calc(11 / var(--rem-base) * 1rem);
}

.doc .tabs .tablist.ulist > ul li + li {
  margin-left: 0;
}

.doc .tabs.is-loading .tablist li:not(:first-child),
.doc .tabs:not(.is-loading) .tablist li:not(.is-selected) {
  background: none;
}

.doc .tabs.is-loading .tablist li:first-child,
.doc .tabs:not(.is-loading) .tablist li.is-selected {
  color: var(--syntax-text);
}

.doc .tabs.is-loading .tablist li:first-child::after,
.doc .tabs:not(.is-loading) .tablist li.is-selected::after {
  background: var(--color-camel-orange);
  bottom: -1px;
  height: 2px;
  left: calc(10 / var(--rem-base) * 1rem);
  right: calc(10 / var(--rem-base) * 1rem);
}

.doc .tabs .tabpanel {
  background: none;
  border: 0;
  padding: 0;
}

.doc .tabs .tabpanel .listingblock {
  margin: 0;
}

.doc .tabs .tabpanel pre:not(.highlight),
.doc .tabs .tabpanel pre.highlight code {
  border-radius: 0;
}
```

`bottom: -1px` is a raw pixel value on purpose: it offsets the underline against
the container's 1px border, so it must track the border, not the rem base.

- [ ] **Step 3: Build, render, measure**

```bash
cd antora-ui-camel && node ../.yarn/releases/yarn-4.1.0.cjs build && cd ..
node .yarn/releases/yarn-4.1.0.cjs build:antora-ui
```

On the rendered page at 1400px:

| assertion | expected |
|---|---|
| `nav.pagination` `border-top-width` | 1px |
| `nav.pagination .prev::before` `content` | `← Previous` |
| `nav.pagination .next::before` `content` | `Next →` |
| `nav.pagination .prev::before` `font-family` | starts with `JetBrains Mono` |
| `nav.pagination a` `color` | `rgb(33, 28, 23)` |
| `nav.pagination a` `background-image` | `none` |
| `.tabs > .content` `background-color` | `rgb(33, 28, 23)` |
| `.tabs > .content` `border-radius` | 10px |
| selected tab `color` | `rgb(240, 233, 223)` |
| idle tab `color` | `rgb(168, 159, 146)` |
| selected tab `::after` `background-color` | `rgb(233, 120, 38)` |
| selected tab `::after` `height` | 2px |
| `.tabpanel` `background-color` | `rgba(0, 0, 0, 0)` |
| `.tabpanel pre.highlight code` `border-radius` | 0px |

- [ ] **Step 4: Check the pre-script state**

Reload the page with JavaScript disabled, so `.tabs` keeps its `is-loading` class,
and confirm the first tab still reads as selected: light text and an orange
underline, not the package's white-on-grey default. If it does not, an
`is-loading` variant is missing from one of the override rules.

- [ ] **Step 5: Commit**

```bash
git add antora-ui-camel/src/css/pagination.css antora-ui-camel/src/css/tabs.css
git commit -m "style(docs): repaint pagination and put code tabs on dark"
```

---

## Task 10: Full verification, bundle regeneration, records

**Files:**
- Modify: `antora-ui-camel/public/**` (regenerated)
- Modify: `docs/superpowers/specs/2026-09-03-antora-docs-ui-design.md`
- Modify: `docs/superpowers/plans/2026-09-03-antora-docs-ui.md`

**Interfaces:**
- Consumes: everything.
- Produces: the committed bundle the production playbook reads.

**Background you need.** `antora-ui-camel/public/**` is a generated directory that
is nonetheless committed, because `antora-playbook-production.yml` points
`ui.bundle.url` at `antora-ui-camel/public/_`. It is regenerated exactly once, at
the end, so the earlier tasks' review diffs are readable.

- [ ] **Step 1: Run every check**

```bash
cd antora-ui-camel && node ../.yarn/releases/yarn-4.1.0.cjs build && cd ..
node .yarn/releases/yarn-4.1.0.cjs build:antora-ui
```

Expected: both exit 0, stylelint clean.

- [ ] **Step 2: Confirm the bundle is reproducible**

Run the `antora-ui-camel` build a second time, then:

```bash
git status --porcelain antora-ui-camel/public
```

Expected: the same set of files as after the first run, with no additional churn
between runs. If a file changes on every build, say so; do not hide it.

- [ ] **Step 3: Walk the whole page once**

On `tests/antora-ui/out/fixture/4.18/getting-started.html` at 1400px, confirm all
of these render and none overlaps another: nav search row, nav tree, nav context
bar, toolbar with breadcrumbs and version chip and edit link, eyebrow, h1, lead,
h2, h3, inline code, code block, tab block, table, five admonitions, both list
types, definition list, prev/next, TOC rail.

Then repeat at 1024px and at 390px. At 390px the nav is a drawer: open it with the
toolbar's `.nav-toggle` and confirm search is reachable and visible.

- [ ] **Step 4: Check a Hugo page**

Build Hugo (`node .yarn/releases/yarn-4.1.0.cjs build:hugo`) or open an existing
rendered page, and confirm on a `_default/single.html` page:

- header search still present and working
- `main > .content` is not a grid and not capped at 1180px
- `.static.toolbar` draws no border
- the article has the new typography

- [ ] **Step 5: Correct the spec**

The four corrections listed at the top of this plan are already in the spec. If
implementation found anything else the spec gets wrong, add a section titled
`## Corrections, made during implementation` to
`docs/superpowers/specs/2026-09-03-antora-docs-ui-design.md` recording each one:
what the spec said, what is true, and how you know. If nothing else was found,
skip this step and say so.

- [ ] **Step 6: Record open items**

Add an `## Open items` section to this plan file listing anything left unresolved,
each with what it costs and who has to decide.

- [ ] **Step 7: Commit**

```bash
git add antora-ui-camel/public
git commit -m "chore: regen antora-ui bundle for the docs UI redesign"
git add docs/superpowers
git commit -m "docs: record corrections and open items for the docs UI redesign"
```

---

## Self-review

**Spec coverage.** Every decision in the spec maps to a task: decision 1 to Task 1,
decision 2 to Task 4, decision 3 to Task 3, decision 4 to Task 3, decision 5 to
Task 5, decision 6 to Task 6, decision 7 to Tasks 7 and 8, decision 8 to Tasks 6
and 9, decision 9 to Task 7's broad `.doc` selectors, decision 10 to Task 2. The
spec's verification list items 1 through 12 are distributed across the per-task
measurement steps and Task 10.

**Known gaps, deliberate.** The spec's risk section notes that the fixture does
not cover `colist`, `sidebarblock`, `exampleblock`, `quoteblock`, or the Camel
Quarkus badge markup. Those inherit new typography without being looked at. That
is recorded as a risk rather than a task, because designing them is piece 5's job.

**Type consistency.** `.nav-search` (Task 3) is sized by Task 4 and never
restyled. `.doc-eyebrow` (Task 7) is not touched by Task 8. `main.article > .content`
(Task 6) is the only grid selector and is not reintroduced elsewhere. The six
admonition chip tokens are named in Task 2 and used only in Task 8, with matching
spelling. `--code-tab-idle-font-color` is named in Task 2 and used only in Task 9.
