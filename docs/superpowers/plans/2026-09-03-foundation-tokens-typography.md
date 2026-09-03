# Foundation: Tokens and Typography Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the site's font stack, color palette, and container widths at `:root` in the shared Antora UI stylesheet, so every later piece of the redesign builds on settled tokens.

**Architecture:** All work happens in `antora-ui-camel`, whose `src/css` bundle is consumed by both the Antora documentation and every Hugo page. Tokens are added first as unreferenced declarations, then the existing semantic vars are re-pointed at them in one atomic commit, then the stylesheets that hardcoded greys are repaired. No markup, no layout, no page templates.

**Tech Stack:** CSS custom properties, gulp 4 + postcss (`postcss-import`, `postcss-url`, `postcss-custom-properties`, `autoprefixer`, `cssnano`), stylelint 15 with `stylelint-config-standard`, Yarn workspaces, Hugo, Antora.

**Spec:** `docs/superpowers/specs/2026-09-03-foundation-tokens-typography-design.md`

## Global Constraints

- Branch is `feature/new-website-design`. This is a git worktree; never use bare `git stash` / `git stash pop`.
- `--rem-base` stays at `18`. Every px value from the artboards is written as `calc(N / var(--rem-base) * 1rem)`.
- `--color-camel-orange` keeps `#e97826`. Do not redeclare it; `stylelint-config-standard` rejects duplicate custom properties in one block.
- `--color-asf-dark-blue`, `--color-asf-moderate-blue`, `--color-asf-light-blue`, `--color-camel-orange-light`, and the `--color-smoke-*` / `--color-gray-*` / `--color-jet-*` ramps stay declared. Only their references change.
- No new dependencies beyond `@fontsource/archivo` and `@fontsource/jetbrains-mono`, both already approved.
- `highlight.css` is not touched by this plan. Piece 6 owns it and lands immediately after this piece.
- Every task ends with `yarn workspace antora-ui-camel run build` succeeding. That task runs stylelint, so a lint failure is a build failure.
- American English. No em dashes in code comments or docs.
- **Line numbers are hints; the quoted text is authoritative.** Every line number in this plan was read against `vars.css` as it stands at the plan's commit. Tasks 2 and 3 insert nineteen lines into that file between them, so from Task 4 onward the numbers drift. Every edit below also quotes the exact declaration it replaces, and each is unique in its file. Locate by the quoted text, use the line number only to find the neighborhood, and never edit a line whose current content does not match the quoted "From" text.
- **Do not pin assertions to the minifier's output shape.** `gulp.d/tasks/build.js:57` runs `postcss-calc` only in preview mode, so a production bundle may carry either `calc(1200 / 18 * 1rem)` or a reduced `66.66…rem`, depending on cssnano. Assertions on computed lengths accept both forms.

## Deviations from the spec

The spec was written before the build pipeline and `base.css` were read in full. Six corrections, all reflected in the tasks below. Raise them with the author if any is unwelcome.

1. **Verification item 1 is wrong.** Fonts are not revved. `gulp.d/tasks/build.js:41-53` uses `postcss-url` to copy each `woff`/`woff2` to `public/_/font/<basename>` and rewrite the URL to `../font/<basename>`. `rev-manifest.json` will never contain a font entry. The correct evidence is the file appearing in `public/_/font/` and the built CSS referencing it.
2. **Spec section 3 is wrong about `pre`.** It says "`pre` inherits its color". It does not: `base.css:49-54` sets `color: var(--code-font-color)` on `code, kbd, pre`. So re-pointing `--code-font-color` to ink and `--pre-background` to ink makes code blocks ink-on-ink. The `--pre-font-color` binding is therefore mandatory in the same commit as the re-point, not optional cleanup. Task 5 does both together.
3. **Added: bind `--display-font-family`.** The spec declares the token but never binds it to a selector. No heading anywhere binds a font family today; they all inherit `--body-font-family` from `body` in `base.css:29-35`. Without a binding, Archivo is downloaded and never rendered, and the piece cannot be evaluated against the artboards. Task 2 adds one element-level rule in `base.css`.
4. **Added: `gulpfile.js` needs an edit.** `glob.formatcss` (`gulpfile.js:21-25`) excludes the two generated typeface files from `gulp format`. Removing `typeface-droid-sans-mono.css` while leaving its exclusion behind leaves a stale path, and the two new typeface files need the same exclusion. Task 2 handles it.
5. **Flagged, not changed:** `.doc h1` through `.doc h6` carry `text-transform: uppercase` (`doc.css:19-31`). The artboards use sentence-case display headings. Uppercase Archivo at weight 800 will not match the design. This is a heading treatment, so it belongs to piece 3, but it means heading fidelity cannot be judged during this piece's visual check.
6. **Aliased vars need no separate edit.** `--nav-background` and `--toolbar-background` already resolve through `--panel-background`; `--toolbar-border-color` and `--toc-border-color` already resolve through `--panel-border-color`. Re-pointing the two parents satisfies the spec's table for all six. Do not add redundant declarations.

## File structure

| File | Responsibility | Tasks |
|---|---|---|
| `antora-ui-camel/package.json` | Font package dependencies | 1, 2 |
| `antora-ui-camel/src/css/typeface-archivo.css` | `@font-face` declarations for Archivo (new) | 1 |
| `antora-ui-camel/src/css/typeface-jetbrains-mono.css` | `@font-face` declarations for JetBrains Mono (new) | 1 |
| `antora-ui-camel/src/css/typeface-droid-sans-mono.css` | Deleted | 2 |
| `antora-ui-camel/src/css/site.css` | Import order | 1, 2 |
| `antora-ui-camel/gulpfile.js` | Format glob exclusions | 2 |
| `antora-ui-camel/src/css/vars.css` | All tokens: palette, semantics, type, widths | 3, 4, 5 |
| `antora-ui-camel/src/css/base.css` | Element defaults: heading font family | 2 |
| `antora-ui-camel/src/css/doc.css` | `--pre-font-color` binding, repaint repair | 5, 6 |

Build output for every verification step is `antora-ui-camel/public/_/`, per `gulpfile.js:9-12` (`destDir = 'public/_'`).

## A note on testing

This piece has no unit-testable surface: it is a stylesheet token change, and the repo has no CSS test harness to add to. Classical TDD does not apply and pretending otherwise would produce tests that cannot fail. The substitute used throughout is a **shell assertion against the build output** that provably fails before the change and passes after. Each task states the failing command first and the same command as the pass check. Task 7 is the human visual gate that no assertion can replace.

---

### Task 1: Add Archivo and JetBrains Mono faces

Purely additive. Droid Sans Mono stays wired up, so nothing changes visually. This isolates "did the font pipeline accept a `@fontsource` package" from every later question.

**Files:**
- Modify: `antora-ui-camel/package.json` (devDependencies)
- Create: `antora-ui-camel/src/css/typeface-archivo.css`
- Create: `antora-ui-camel/src/css/typeface-jetbrains-mono.css`
- Modify: `antora-ui-camel/src/css/site.css:1-2`

**Interfaces:**
- Consumes: nothing.
- Produces: the font families `'Archivo'` (weights 500, 600, 700, 800) and `'JetBrains Mono'` (weights 400, 500, 600), available to any stylesheet in the bundle.

- [ ] **Step 1: Write the failing assertion**

Run this now and record the output. It is the check Step 7 repeats.

```bash
cd antora-ui-camel && ls public/_/font/ 2>/dev/null | grep -c -E 'archivo|jetbrains' || echo 0
```

Expected: `0`, or an error that `public/_/font/` does not exist.

- [ ] **Step 2: Install the packages**

```bash
yarn workspace antora-ui-camel add -D @fontsource/archivo @fontsource/jetbrains-mono
```

- [ ] **Step 3: Confirm the real filenames before writing any CSS**

`@fontsource` v5 names static faces `<family>-<subset>-<weight>-<style>.woff2`. Confirm rather than trust:

```bash
ls node_modules/@fontsource/archivo/files/ | grep -E 'latin-(500|600|700|800)-normal'
ls node_modules/@fontsource/jetbrains-mono/files/ | grep -E 'latin-(400|500|600)-normal'
```

Expected, seven files:

```
archivo-latin-500-normal.woff2
archivo-latin-600-normal.woff2
archivo-latin-700-normal.woff2
archivo-latin-800-normal.woff2
jetbrains-mono-latin-400-normal.woff2
jetbrains-mono-latin-500-normal.woff2
jetbrains-mono-latin-600-normal.woff2
```

If a package is Yarn PnP-zipped and `node_modules` does not exist, use `yarn workspace antora-ui-camel exec ls $(yarn workspace antora-ui-camel exec node -p "require('path').dirname(require.resolve('@fontsource/archivo/package.json'))")/files` instead. If any listed name differs from the expected list above, use the name that `ls` printed in the `url()` values in Steps 4 and 5 and change nothing else.

Only `.woff2` is declared. `browserslist` is `last 2 versions` (`package.json:14-16`), every browser in that range supports woff2, and unlike Open Sans these faces have no legacy consumer to serve `.woff` to.

- [ ] **Step 4: Create `antora-ui-camel/src/css/typeface-archivo.css`**

```css
/* archivo-500normal - latin */
@font-face {
  font-family: Archivo;
  font-style: normal;
  font-display: swap;
  font-weight: 500;
  src:
    local('Archivo Medium'),
    local('Archivo-Medium'),
    url('~@fontsource/archivo/files/archivo-latin-500-normal.woff2') format('woff2');
}
/* archivo-600normal - latin */
@font-face {
  font-family: Archivo;
  font-style: normal;
  font-display: swap;
  font-weight: 600;
  src:
    local('Archivo SemiBold'),
    local('Archivo-SemiBold'),
    url('~@fontsource/archivo/files/archivo-latin-600-normal.woff2') format('woff2');
}
/* archivo-700normal - latin */
@font-face {
  font-family: Archivo;
  font-style: normal;
  font-display: swap;
  font-weight: 700;
  src:
    local('Archivo Bold'),
    local('Archivo-Bold'),
    url('~@fontsource/archivo/files/archivo-latin-700-normal.woff2') format('woff2');
}
/* archivo-800normal - latin */
@font-face {
  font-family: Archivo;
  font-style: normal;
  font-display: swap;
  font-weight: 800;
  src:
    local('Archivo ExtraBold'),
    local('Archivo-ExtraBold'),
    url('~@fontsource/archivo/files/archivo-latin-800-normal.woff2') format('woff2');
}
```

The `~` prefix is not a bundler convention here. `postcss-url` strips exactly one leading character with `asset.pathname.substr(1)` and hands the rest to `require.resolve` (`gulp.d/tasks/build.js:44-46`). Dropping the `~` breaks resolution silently.

`font-family: Archivo` is unquoted because `stylelint-config-standard` enforces `font-family-name-quotes: always-where-recommended`, which rejects quotes around a single-word family name. `'JetBrains Mono'` keeps its quotes because it contains a space.

- [ ] **Step 5: Create `antora-ui-camel/src/css/typeface-jetbrains-mono.css`**

```css
/* jetbrains-mono-400normal - latin */
@font-face {
  font-family: 'JetBrains Mono';
  font-style: normal;
  font-display: swap;
  font-weight: 400;
  src:
    local('JetBrains Mono Regular'),
    local('JetBrainsMono-Regular'),
    url('~@fontsource/jetbrains-mono/files/jetbrains-mono-latin-400-normal.woff2') format('woff2');
}
/* jetbrains-mono-500normal - latin */
@font-face {
  font-family: 'JetBrains Mono';
  font-style: normal;
  font-display: swap;
  font-weight: 500;
  src:
    local('JetBrains Mono Medium'),
    local('JetBrainsMono-Medium'),
    url('~@fontsource/jetbrains-mono/files/jetbrains-mono-latin-500-normal.woff2') format('woff2');
}
/* jetbrains-mono-600normal - latin */
@font-face {
  font-family: 'JetBrains Mono';
  font-style: normal;
  font-display: swap;
  font-weight: 600;
  src:
    local('JetBrains Mono SemiBold'),
    local('JetBrainsMono-SemiBold'),
    url('~@fontsource/jetbrains-mono/files/jetbrains-mono-latin-600-normal.woff2') format('woff2');
}
```

- [ ] **Step 6: Add the imports in `antora-ui-camel/src/css/site.css`**

Replace lines 1-2:

```css
@import url('typeface-open-sans.css');
@import url('typeface-droid-sans-mono.css');
```

with:

```css
@import url('typeface-open-sans.css');
@import url('typeface-droid-sans-mono.css');
@import url('typeface-archivo.css');
@import url('typeface-jetbrains-mono.css');
```

- [ ] **Step 7: Build and run the assertion**

```bash
yarn workspace antora-ui-camel run build
cd antora-ui-camel && ls public/_/font/ | grep -E 'archivo|jetbrains'
```

Expected: the build succeeds (stylelint included) and the seven woff2 files from Step 3 are listed. If stylelint objects to a family name's quoting, follow its message; do not silence the rule.

- [ ] **Step 8: Commit**

```bash
git add antora-ui-camel/package.json antora-ui-camel/src/css/typeface-archivo.css antora-ui-camel/src/css/typeface-jetbrains-mono.css antora-ui-camel/src/css/site.css yarn.lock
git commit -m "build(ui): add Archivo and JetBrains Mono webfonts"
```

If the lockfile lives elsewhere in this Yarn setup, `git status` will show it. Stage whatever the install modified.

---

### Task 2: Retire Droid Sans Mono and set the type stack

Switches the site's monospace face and gives headings their display family. First visible change: every code span, code block, and heading changes typeface.

**Files:**
- Modify: `antora-ui-camel/src/css/vars.css:35`, `:37`
- Modify: `antora-ui-camel/src/css/base.css` (append one rule)
- Modify: `antora-ui-camel/src/css/site.css` (remove one import)
- Delete: `antora-ui-camel/src/css/typeface-droid-sans-mono.css`
- Modify: `antora-ui-camel/gulpfile.js:21-25`
- Modify: `antora-ui-camel/package.json` (remove one devDependency)

**Interfaces:**
- Consumes: the `'Archivo'` and `'JetBrains Mono'` families from Task 1.
- Produces: `--display-font-family`, bound to `h1` through `h6` document-wide. Later pieces set heading size, weight, and case; they do not set family again.

- [ ] **Step 1: Write the failing assertion**

```bash
grep -ri "droid sans" antora-ui-camel/src antora-ui-camel/gulpfile.js antora-ui-camel/package.json
```

Expected: matches in `vars.css`, `site.css`, `typeface-droid-sans-mono.css`, `gulpfile.js`, and `package.json`.

- [ ] **Step 2: Update the type vars in `antora-ui-camel/src/css/vars.css`**

Replace line 35:

```css
  --body-font-family: 'Open Sans', sans-serif;
```

with:

```css
  --body-font-family: 'Open Sans', system-ui, sans-serif;
  --display-font-family: Archivo, sans-serif;
```

Replace line 37:

```css
  --monospace-font-family: 'Droid Sans Mono', 'DejaVu Sans Mono', monospace;
```

with:

```css
  --monospace-font-family: 'JetBrains Mono', ui-monospace, monospace;
```

- [ ] **Step 3: Bind the display family in `antora-ui-camel/src/css/base.css`**

Insert immediately after the `body` rule that ends at line 35, before the `a {` rule:

```css
h1,
h2,
h3,
h4,
h5,
h6 {
  font-family: var(--display-font-family);
}
```

This is an element-level default, matching what `base.css` already does for `body`, `a`, and `code, kbd, pre`. Every heading on both Hugo and Antora pages inherits from it, and the more specific rules in `doc.css` continue to win on color, weight, and case.

- [ ] **Step 4: Remove the Droid Sans Mono import from `antora-ui-camel/src/css/site.css`**

Delete this line entirely:

```css
@import url('typeface-droid-sans-mono.css');
```

- [ ] **Step 5: Delete the stylesheet and the package**

```bash
git rm antora-ui-camel/src/css/typeface-droid-sans-mono.css
yarn workspace antora-ui-camel remove typeface-droid-sans-mono
```

- [ ] **Step 6: Fix the format glob in `antora-ui-camel/gulpfile.js`**

Replace lines 21-25:

```js
  formatcss: [
    `${srcDir}/css/**/*.css`,
    `!${srcDir}/css/**/typeface-droid-sans-mono.css`,
    `!${srcDir}/css/**/typeface-open-sans.css`,
  ],
```

with:

```js
  formatcss: [
    `${srcDir}/css/**/*.css`,
    `!${srcDir}/css/**/typeface-archivo.css`,
    `!${srcDir}/css/**/typeface-jetbrains-mono.css`,
    `!${srcDir}/css/**/typeface-open-sans.css`,
  ],
```

The exclusion list holds machine-shaped `@font-face` files that `gulp format` would reflow. The two new files belong in it for the same reason the old one did.

- [ ] **Step 7: Build and run the assertion**

```bash
yarn workspace antora-ui-camel run build
grep -ri "droid sans" antora-ui-camel/src antora-ui-camel/gulpfile.js antora-ui-camel/package.json; echo "exit: $?"
```

Expected: the build succeeds and grep prints nothing with `exit: 1`. Also confirm the old font is gone from the output:

```bash
ls antora-ui-camel/public/_/font/ | grep -i droid; echo "exit: $?"
```

Expected: nothing, `exit: 1`. If a stale `droid-sans-mono` file is still listed, run `yarn workspace antora-ui-camel run clean` and rebuild; `postcss-url` only copies, it never prunes.

- [ ] **Step 8: Commit**

Do **not** use `git add -A`. The working tree carries unrelated in-progress work that must stay uncommitted: `antora-ui-camel/src/css/projects.css` is untracked, and `site.css` already holds an uncommitted `@import url('projects.css');` line from that work. A blanket add sweeps both into this commit.

`site.css` therefore needs a partial stage. Its two changes are far apart, so `git add -p` offers them as separate hunks: accept the hunk near the top that removes the Droid Sans Mono import, and decline the one near the bottom that adds the `projects.css` import.

```bash
git add antora-ui-camel/src/css/vars.css antora-ui-camel/src/css/base.css antora-ui-camel/gulpfile.js antora-ui-camel/package.json yarn.lock
git add -p antora-ui-camel/src/css/site.css
git commit -m "style(ui): switch monospace to JetBrains Mono, add Archivo display family"
```

The deletion of `typeface-droid-sans-mono.css` is already staged by the `git rm` in Step 5. Before committing, confirm the staged set with `git status --short` and check that `projects.css` is still listed as untracked and `site.css` still shows unstaged changes.

---

### Task 3: Add the redesign palette

Additive only. Every token in this task is declared and referenced by nothing, so the built site is byte-for-byte unchanged apart from the new declarations. Reviewing this separately means a mistyped hex is caught as a mistyped hex, not as a mysterious repaint.

**Files:**
- Modify: `antora-ui-camel/src/css/vars.css` (insert after line 27)

**Interfaces:**
- Consumes: nothing.
- Produces: seventeen `--color-*` tokens consumed by Tasks 5 and 6. `--color-camel-orange` is *not* among them; it already exists at line 23 with the correct value.

- [ ] **Step 1: Write the failing assertion**

```bash
grep -c -- "--color-paper" antora-ui-camel/src/css/vars.css
```

Expected: `0`.

- [ ] **Step 2: Insert the palette**

In `antora-ui-camel/src/css/vars.css`, immediately after line 27 (`--color-wheat: #f5deb3;`) and before the `/* fonts */` comment on line 28:

```css
  /* redesign palette, 2026 site design */
  --color-paper: #faf7f1;
  --color-paper-2: #f4eee3;
  --color-line: #e7e0d5;
  --color-line-soft: #f0e9dd;
  --color-line-hover: #d9ccb8;
  --color-ink: #211c17;
  --color-ink-2: #3a332b;
  --color-ink-soft: #5c554c;
  --color-ink-muted: #8a8074;
  --color-orange-deep: #c95f12;
  --color-orange-tint: #fbead8;
  --color-orange-glow: #f2a05a;
  --color-dark-2: #2b2620;
  --color-dark-line: #34302a;
  --color-on-dark: #faf7f1;
  --color-on-dark-soft: #c4bbac;
  --color-on-dark-muted: #8f867a;
```

Do not add `--color-camel-orange: #e97826;`. It is already declared at line 23 with that exact value, and `stylelint-config-standard`'s `declaration-block-no-duplicate-custom-properties` rule fails the build on a second declaration in the same block.

- [ ] **Step 3: Build and run the assertion**

```bash
yarn workspace antora-ui-camel run build
grep -c -- "--color-paper:" antora-ui-camel/src/css/vars.css
```

Expected: build succeeds, grep prints `1`.

- [ ] **Step 4: Confirm nothing rendered differently**

```bash
grep -o "#faf7f1" antora-ui-camel/public/_/css/*.css | head
```

Expected: no matches, or matches only from `projects.css`'s own page-scoped `--projects-paper`. `postcss-custom-properties` inlines resolved values, and nothing references the new tokens yet, so an unreferenced token contributes no output. A match anywhere else means a token was accidentally referenced and this task is no longer additive.

- [ ] **Step 5: Commit**

```bash
git add antora-ui-camel/src/css/vars.css
git commit -m "style(ui): declare the redesign color palette"
```

---

### Task 4: Container widths

Independent of color, and it fails in a visibly different way (layout, not contrast), so it is worth its own reviewable commit.

**Files:**
- Modify: `antora-ui-camel/src/css/vars.css:131`, `:159`

**Interfaces:**
- Consumes: nothing from earlier tasks.
- Produces: `--page-padding-x`, a horizontal gutter token. Nothing binds it in this piece; piece 2 applies it to the header, footer, and page containers.

- [ ] **Step 1: Write the failing assertion**

1200 at `--rem-base: 18` is `66.6667rem`; 1366 is `75.8889rem`. `postcss-custom-properties` inlines the token, and cssnano may or may not reduce the `calc()`, so match either form.

```bash
grep -o -E "66\.66[0-9]*rem|1200 ?/ ?18|1200 / var" antora-ui-camel/public/_/css/*.css | head; echo "exit: $?"
```

Expected: nothing, `exit: 1`.

- [ ] **Step 2: Change `--frontpage-max-width`**

`antora-ui-camel/src/css/vars.css:131`, replace:

```css
  --frontpage-max-width: calc(1366 / var(--rem-base) * 1rem);
```

with:

```css
  --frontpage-max-width: var(--static-max-width--desktop);
```

- [ ] **Step 3: Change `--static-max-width--desktop` and add the gutter**

`antora-ui-camel/src/css/vars.css:159`, replace:

```css
  --static-max-width--desktop: calc(1366 / var(--rem-base) * 1rem);
```

with:

```css
  --static-max-width--desktop: calc(1200 / var(--rem-base) * 1rem);
  --page-padding-x: calc(32 / var(--rem-base) * 1rem);
```

Leave `--doc-max-width--desktop` on line 158 at 1366. The Antora article area is not a centered marketing container: a fixed-left nav plus the article and TOC grid fits inside 1366, and narrowing it would reflow every documentation page for no design reason.

- [ ] **Step 4: Build and run the assertion**

```bash
yarn workspace antora-ui-camel run build
grep -o -E "66\.66[0-9]*rem|1200 ?/ ?18|1200 / var" antora-ui-camel/public/_/css/*.css | head
```

Expected: at least one match. `--static-max-width--desktop` has five consumers (`static.css:41`, `projects.css:13`, `footer.css:17`, `blog.css:249`, `blog.css:306`) and `--frontpage-max-width` one (`frontpage.css:18`), so several are expected.

- [ ] **Step 5: Confirm the docs width is untouched**

```bash
grep -o -E "75\.88[0-9]*rem|1366 ?/ ?18|1366 / var" antora-ui-camel/public/_/css/*.css | head
```

Expected: at least one match, from `--doc-max-width--desktop`. Zero matches means the `--doc-max-width--desktop` declaration was changed by mistake.

- [ ] **Step 6: Commit**

```bash
git add antora-ui-camel/src/css/vars.css
git commit -m "style(ui): set marketing containers to 1200px, keep docs at 1366px"
```

---

### Task 5: Re-point the semantic vars

The repaint. This is the commit that changes how the whole site looks, and it is deliberately atomic: splitting it leaves intermediate commits where, for example, code blocks are ink text on an ink ground.

**Files:**
- Modify: `antora-ui-camel/src/css/vars.css` (twenty-two re-points, two additions)
- Modify: `antora-ui-camel/src/css/doc.css:579-586`

**Interfaces:**
- Consumes: the `--color-*` tokens from Task 3.
- Produces: `--pre-font-color` (bound in `doc.css`) and `--heading-font-weight-display` (declared, bound by pieces 3 and 4).

- [ ] **Step 1: Write the failing assertion**

ASF blue must survive only as an unreferenced token. After this task, no resolved value in the built CSS should be `#303284` or `#4f51ae`.

```bash
grep -o -E "#303284|#4f51ae" antora-ui-camel/public/_/css/*.css | sort | uniq -c
```

Expected: matches for both. Record the counts.

- [ ] **Step 2: Re-point the base and navbar vars in `antora-ui-camel/src/css/vars.css`**

| Line | From | To |
|---|---|---|
| 34 | `--body-font-color: var(--color-jet-50);` | `--body-font-color: var(--color-ink-2);` |
| 40 | `--body-background: var(--color-white);` | `--body-background: var(--color-paper);` |
| 41 | `--panel-background: var(--color-smoke-10);` | `--panel-background: var(--color-paper-2);` |
| 42 | `--panel-border-color: var(--color-smoke-90);` | `--panel-border-color: var(--color-line);` |
| 49 | `--navbar-background: var(--color-white);` | `--navbar-background: rgb(250 247 241 / 90%);` |
| 50 | `--navbar-font-color: var(--color-camel-orange);` | `--navbar-font-color: var(--color-ink-soft);` |
| 51 | `--navbar-hover-font-color: var(--color-camel-orange);` | `--navbar-hover-font-color: var(--color-ink);` |

`--navbar-background` is a literal `rgb()` rather than a token because it carries 90% alpha for the translucent sticky bar; there is no opaque token that expresses it.

Do not touch `--nav-background` (line 62) or `--toolbar-background` (line 70). Both already read `var(--panel-background)` and now resolve to paper-2. The same goes for `--toolbar-border-color` (line 71) and `--toc-border-color` (line 79), which read `var(--panel-border-color)`.

- [ ] **Step 3: Re-point the nav, toc, and doc vars**

| Line | From | To |
|---|---|---|
| 63 | `--nav-border-color: var(--color-smoke-50);` | `--nav-border-color: var(--color-line);` |
| 65 | `--nav-heading-font-color: var(--color-asf-dark-blue);` | `--nav-heading-font-color: var(--color-ink);` |
| 78 | `--toc-heading-font-color: var(--doc-font-color);` | `--toc-heading-font-color: var(--color-ink);` |
| 93 | `--doc-font-color: var(--color-jet-50);` | `--doc-font-color: var(--color-ink-2);` |
| 99 | `--heading-font-color: var(--color-asf-dark-blue);` | `--heading-font-color: var(--color-ink);` |
| 103 | `--link-font-color: #585ac2;` | `--link-font-color: var(--color-orange-deep);` |
| 104 | `--link_hover-font-color: #104d92;` | `--link_hover-font-color: var(--color-camel-orange);` |
| 127 | `--table-border-color: var(--color-asf-moderate-blue);` | `--table-border-color: var(--color-line);` |

Line 78 changes from an alias to a direct token on purpose. TOC headings previously matched body text; the design gives them full heading ink.

- [ ] **Step 4: Invert the footer**

The footer goes from a light grey band to a dark ink one, so its two text tokens invert with it. All three must change together; a light-grey text token on an ink ground is unreadable.

| Line | From | To |
|---|---|---|
| 134 | `--footer-background: var(--color-smoke-50);` | `--footer-background: var(--color-ink);` |
| 135 | `--footer-font-color: var(--color-gray-70);` | `--footer-font-color: var(--color-on-dark-soft);` |
| 137 | `--footer-link-font-color: var(--color-jet-80);` | `--footer-link-font-color: var(--color-on-dark-soft);` |

`--footer-font-color` has three consumers and one of them is not text: `footer.css:103` paints it as a `background` on a divider. Warm off-white is correct there too. `--footer-link-font-color` currently has no consumer in any stylesheet; it is re-pointed anyway so the token is not left holding a value that contradicts the surface it names.

`--footer-after-background` is left alone in this task and repaired in Task 6, where the rest of the now-wrong greys are handled.

- [ ] **Step 5: Split the heading weight token**

`antora-ui-camel/src/css/vars.css:100`, replace:

```css
  --heading-font-weight: bold;
```

with:

```css
  --heading-font-weight: 700;
  --heading-font-weight-display: 800;
```

`SCOPE.md` gives one token two values, 800 for h1 and 700 for h2 and h3. Splitting the token rather than adding selector overrides gives pieces 3 and 4 something to bind. `700` replaces `bold` because Archivo ships discrete weights and the numeric form makes the 700/800 pairing legible side by side. The two are equivalent to a browser.

- [ ] **Step 6: Split the code color tokens**

`antora-ui-camel/src/css/vars.css`, replace line 113-114:

```css
  --code-background: var(--panel-background);
  --code-font-color: var(--color-asf-moderate-blue);
```

with:

```css
  --code-background: var(--color-paper-2);
  --code-font-color: var(--color-ink);
```

and replace line 119-120:

```css
  --pre-background: var(--panel-background);
  --pre-border-color: var(--panel-border-color);
```

with:

```css
  --pre-background: var(--color-ink);
  --pre-font-color: var(--color-on-dark);
  --pre-border-color: var(--color-dark-line);
```

`--code-background` stops aliasing `--panel-background` even though both now resolve to paper-2. Inline code and nav panels are unrelated surfaces that later pieces will move independently.

`--pre-border-color` changes because `doc.css:582` paints it as `box-shadow: inset 0 0 1.75px`. A paper-colored inset glow inside a near-black block reads as a rendering artifact.

- [ ] **Step 7: Bind `--pre-font-color` in `antora-ui-camel/src/css/doc.css`**

This step is what keeps code blocks readable. `base.css:49-54` sets `color: var(--code-font-color)` on `code, kbd, pre`, so without it every code block is `#211c17` text on a `#211c17` ground.

Replace `doc.css:579-586`:

```css
.doc pre:not(.highlight),
.doc pre.highlight code {
  background: var(--pre-background);
  box-shadow: inset 0 0 1.75px var(--pre-border-color);
  display: block;
  overflow-x: auto;
  padding: 0.75rem;
}
```

with:

```css
.doc pre:not(.highlight),
.doc pre.highlight code {
  background: var(--pre-background);
  box-shadow: inset 0 0 1.75px var(--pre-border-color);
  color: var(--pre-font-color);
  display: block;
  overflow-x: auto;
  padding: 0.75rem;
}
```

This selector already owns both shapes the docs produce: an unhighlighted `pre`, and the `code` inside a `pre.highlight`. Adding `color` here beats `base.css` on specificity without touching the element-level rule that inline `code` and `kbd` still rely on.

- [ ] **Step 8: Build and run the assertion**

```bash
yarn workspace antora-ui-camel run build
grep -o -E "#303284|#4f51ae" antora-ui-camel/public/_/css/*.css | sort | uniq -c; echo "exit: $?"
```

Expected: nothing, `exit: 1`. Any remaining match is a stylesheet referencing `--color-asf-dark-blue` or `--color-asf-moderate-blue` directly. Find it with `grep -rn "color-asf" antora-ui-camel/src/css/` and re-point it to the matching ink or line token.

- [ ] **Step 9: Confirm code blocks are not ink on ink**

```bash
grep -o -E "\.doc pre[^{]*\{[^}]*\}" antora-ui-camel/public/_/css/*.css | grep -c "faf7f1"
```

Expected: at least `1`. Zero means Step 7 did not survive minification and the `--pre-font-color` binding is missing.

- [ ] **Step 10: Commit**

```bash
git add antora-ui-camel/src/css/vars.css antora-ui-camel/src/css/doc.css
git commit -m "style(ui): repaint the site onto the redesign palette"
```

---

### Task 6: Repair what the repaint broke

Bounded cleanup. Two kinds of breakage qualify: light greys that now sit on a dark ground, in the code block and the inverted footer, and hardcoded greys inside the article body that read as a color error against warm paper. Navbar and nav-panel greys are deliberately left alone; they are chrome, and pieces 2 and 3 redraw those surfaces entirely.

**Files:**
- Modify: `antora-ui-camel/src/css/vars.css` (six declarations)
- Modify: `antora-ui-camel/src/css/doc.css` (two rules)

**Interfaces:**
- Consumes: the palette from Task 3 and the repaint from Task 5.
- Produces: nothing new.

- [ ] **Step 1: Write the failing assertion**

`#e1e1e1` (`--color-smoke-90`) is the table head background, `#f0f0f0` (`--color-smoke-70`) backs abstracts and sidebars, and `#808080` (`--color-gray-50`) backs the footer's inner blocks. Each loses consumers in this task without disappearing.

```bash
grep -o -E "#e1e1e1|#f0f0f0|#808080" antora-ui-camel/public/_/css/*.css | sort | uniq -c
```

Expected: matches for all three. **Record the counts**; Step 7 compares against them.

- [ ] **Step 2: Re-point the article-body surfaces in `antora-ui-camel/src/css/vars.css`**

| Line | From | To |
|---|---|---|
| 106 | `--abstract-background: var(--color-smoke-70);` | `--abstract-background: var(--color-paper-2);` |
| 115 | `--example-background: var(--color-white);` | `--example-background: var(--color-paper);` |
| 116 | `--example-border-color: var(--color-gray-10);` | `--example-border-color: var(--color-line);` |
| 126 | `--sidebar-background: var(--color-smoke-70);` | `--sidebar-background: var(--color-paper-2);` |

Leave `--navbar-menu-hover-background` (line 59), `--nav-secondary-background` (line 68), and `--page-version-menu-background` (line 74) on `--color-smoke-70`. They are navbar and documentation chrome, owned by pieces 2 and 3.

- [ ] **Step 3: Fix the grey blocks left inside the inverted footer**

`antora-ui-camel/src/css/vars.css:136`, replace:

```css
  --footer-after-background: var(--color-gray-50);
```

with:

```css
  --footer-after-background: var(--color-dark-line);
```

`--color-gray-50` is `#808080`. Task 5 turned the footer ink, and `footer.css:33` and `footer.css:57` paint this token as a background inside it, so mid-grey slabs now sit on near-black. `--color-dark-line` is the palette's dark-on-dark separator and is what those two surfaces are for.

- [ ] **Step 4: Re-point the annotation color for the dark ground**

`antora-ui-camel/src/css/vars.css:121`, replace:

```css
  --pre-annotation-font-color: var(--color-gray-10);
```

with:

```css
  --pre-annotation-font-color: var(--color-on-dark-muted);
```

`--color-gray-10` is `#c1c1c1`, a cool grey. Its two consumers, the language label at `doc.css:612-625` and the source toolbox at `doc.css:630-640`, both sit on the now-dark `pre`. `#8f867a` on `#211c17` measures about 4.7:1, above the 4.5:1 threshold, and matches the warm cast of the rest of the dark surface.

- [ ] **Step 5: Fix the table head in `antora-ui-camel/src/css/doc.css`**

Find this rule near line 855:

```css
table.tableblock thead {
  background: var(--color-smoke-90);
  font-weight: var(--body-font-weight-bold);
}
```

Replace it with:

```css
table.tableblock thead {
  background: var(--color-paper-2);
  font-weight: var(--body-font-weight-bold);
}
```

- [ ] **Step 6: Fix the code block scrollbar in `antora-ui-camel/src/css/doc.css`**

`--scrollbar-track-color` is `#c1c1c1` and `--scrollbar-thumb-color` is `#8e8e8e`. Both are global tokens tuned for light surfaces, and `doc.css:592-605` paints them inside the now-dark code block, where a near-white track cuts a bright band across it. Scope an override rather than changing the global tokens, which other surfaces still use correctly.

Replace `doc.css:592-605`:

```css
.doc pre.highlight code::-webkit-scrollbar-track {
  background: var(--scrollbar-track-color);
  border-radius: var(--scrollbar-radius);
}

.doc pre.highlight code::-webkit-scrollbar-thumb {
  background: var(--scrollbar-thumb-color);
  border-radius: var(--scrollbar-radius);
}

.doc pre.highlight code::-webkit-scrollbar-thumb:hover,
.doc pre.highlight code::-webkit-scrollbar-thumb:active {
  background: var(--scrollbar-thumb-active-color);
}
```

with:

```css
.doc pre.highlight code::-webkit-scrollbar-track {
  background: var(--color-dark-2);
  border-radius: var(--scrollbar-radius);
}

.doc pre.highlight code::-webkit-scrollbar-thumb {
  background: var(--color-dark-line);
  border-radius: var(--scrollbar-radius);
}

.doc pre.highlight code::-webkit-scrollbar-thumb:hover,
.doc pre.highlight code::-webkit-scrollbar-thumb:active {
  background: var(--color-on-dark-muted);
}
```

- [ ] **Step 7: Build and run the assertion**

```bash
yarn workspace antora-ui-camel run build
grep -o -E "#e1e1e1|#f0f0f0|#808080" antora-ui-camel/public/_/css/*.css | sort | uniq -c
```

Both hexes stay present, at lower counts. Do not expect either to reach zero:

- `#e1e1e1` keeps two consumers that this piece does not own, `catalog.css:26` and `blog.css:228`. What must disappear is the `doc.css:856` table head, plus the `--panel-border-color` uses that Task 5 already moved.
- `#f0f0f0` keeps the three chrome surfaces named in Step 2. If it reaches zero, a chrome token was changed that should not have been.
- `#808080` keeps `--scrollbar-thumb-active-color` on light surfaces. Only the footer consumer goes.

Confirm the two rules this task actually removed:

```bash
grep -c "table.tableblock thead{background:#e1e1e1" antora-ui-camel/public/_/css/*.css
```

Expected: `0`. A non-zero count means Step 5 did not take.

- [ ] **Step 8: Commit**

```bash
git add antora-ui-camel/src/css/vars.css antora-ui-camel/src/css/doc.css
git commit -m "style(ui): repair surfaces broken by the palette repaint"
```

---

### Task 7: Verification pass

No code. This is the gate the piece exists for, and it is the reason piece 1 was separated from the rest of the redesign: if the documentation becomes unreadable on the new palette, that has to surface before twelve page layouts are built on top of it.

**Files:** none.

**Interfaces:**
- Consumes: everything above.
- Produces: a written finding, either "clear to proceed to piece 6" or a list of legibility problems to resolve first.

- [ ] **Step 1: Full site build**

```bash
yarn build
```

Expected: `build:antora`, `build:hugo`, `build:post`, and `build:minify` all succeed.

- [ ] **Step 2: Site checks**

```bash
yarn checks
```

Expected: `check:links`, `check:html`, and `check:redirects` all pass. This piece changes no markup, so a new failure here means a stylesheet broke a template's assumptions.

- [ ] **Step 3: Confirm ASF blue is gone from the rendered output**

```bash
find public -name '*.css' -exec grep -o -E "#303284|#4f51ae|#7375bf" {} + | sort | uniq -c; echo "exit: $?"
```

Search `public/` recursively rather than a pinned path: the exact publish layout of the UI bundle under the Hugo output was not verified when this plan was written, and a wrong path makes the assertion pass on zero files. Confirm the search actually found stylesheets with `find public -name '*.css' | head` before trusting an empty result.

Expected: nothing, `exit: 1`. The ASF logo is an image asset and is unaffected.

- [ ] **Step 4: Serve the site**

```bash
yarn preview:hugo
```

- [ ] **Step 5: Compare a Hugo page against its artboard**

Open the home page and `/projects/`. Compare against the `Apache Camel Home` artboard and the projects screen. Check, in order: page background is warm paper and not white; body text is ink-2 and not grey; headings render in Archivo, not Open Sans; links are `#c95f12` and turn `#e97826` on hover; the container is 1200px wide with even gutters; the footer is a dark ink band with warm off-white text.

Note that `projects.css` still carries its own page-scoped `--projects-*` tokens duplicating the new `:root` values. That is expected. Piece 4 deletes them.

- [ ] **Step 6: Compare an Antora documentation page against its artboard**

Open any page under `/manual/` or a component's docs. Compare against the `Antora docs` screen in `Apache Camel Site Pages`. Check: nav panel and toolbar are paper-2 on paper; nav and TOC headings are ink, not blue; body copy holds contrast at the reduced 17px mobile size as well as desktop; tables read correctly with paper-2 heads and warm line borders; the five admonition types are all legible on paper; inline code is ink on paper-2 rather than blue; code blocks are warm off-white on near-black, with a readable language label and no bright scrollbar band.

**Skip syntax-highlighted code entirely.** `highlight.css` is still tuned for a light `pre` background, so highlighted tokens render dark-on-dark until piece 6 lands. That window is known and accepted. Judge only the unhighlighted `pre` and the block chrome.

- [ ] **Step 7: Record the finding**

If everything holds, say so and move to the piece 6 plan. If documentation legibility regressed, write the specific failures down with the page and construct, and resolve them before piece 6. Do not work around a legibility problem in a later piece; that is exactly the failure mode this gate exists to prevent.

Remember that **this piece cannot merge on its own.** Piece 6 stacks directly on it so that no reviewer ever sees the branch with broken code blocks.

---

## Open items after implementation

All nine implementation commits landed (`7aada581` through `08bbc4a9`) and every review is clean. Four things remain, recorded here because they outlive the scratch workspace.

### 1. Two link colors failed WCAG AA — resolved

`--link-font-color: var(--color-orange-deep)` was `#c95f12` on `#faf7f1`, which measures **3.83:1** against a 4.5:1 threshold for normal text. `--link_hover-font-color: var(--color-camel-orange)` was `#e97826` on `#faf7f1`, **2.73:1**, and is *lighter* than the resting color, so hovering weakened the link instead of strengthening it. The values the redesign replaced were 5.83:1, so this was a regression rather than an inherited problem.

Both values came from `SCOPE.md` section 2 and both are brand palette colors, so they were left exactly as specified until the design owner ruled on them. **The design owner approved darkening them on 2026-09-03.**

Both surfaces were held to the threshold, not just paper: links land on `--color-paper-2` (`#f4eee3`) in nav panels, table heads, and tinted blocks, and that is the harsher of the two.

| token | was | now | paper | paper-2 |
|---|---|---|---|---|
| `--color-orange-deep` (rest) | `#c95f12` | `#a84e0d` | 5.22 | 4.84 |
| `--link_hover-font-color` | `#e97826` | `#853c09` (new `--color-orange-deeper`) | 7.42 | 6.87 |

Both new values sit at hue 25° and ~92% saturation, matching `#c95f12`, so they are pure lightness steps down the existing brand ramp rather than a different color. `#b0520e` was rejected: 4.84 on paper but **4.48** on paper-2, missing AA by a hair. `--color-camel-orange` is untouched and remains the primary brand orange for CTAs, chips, and accents.

Hover now *darkens*. No orange bright enough to read as brighter than rest can clear 4.5:1, so the design's brighten-on-hover intent cannot survive an AA requirement. The gradient underline is painted with `--link-font-color`, so it darkens in step and the hover affordance strengthens on two channels at once.

`--color-orange-deep` had exactly one consumer, and `SCOPE.md` gives its purpose as "links, hover on CTA". Piece 2's CTA hover uses it as a background under white text, where the darkening improves white-on-it from 4.09 to 5.58, so it was redefined in place rather than shadowed by a link-only token. Both deviations from `SCOPE.md` are commented at their declaration sites in `vars.css`.

### 2. The verification gate has not been run

Criteria 1, 2, 3, and 6 are met and were verified mechanically. Criterion 4 (`yarn build && yarn checks`) cannot pass for reasons outside this work, listed in item 4. **Criterion 5, the visual comparison against the artboards, has not been performed** and no agent can perform it.

Run `yarn preview:hugo`, then work through Task 7 steps 5 and 6 above. Two things must not be judged during that pass: syntax-highlighted code, because `highlight.css` still carries the old light theme and piece 6 owns it, and heading case, because `.doc` headings still carry `text-transform: uppercase` and piece 3 owns it.

### 3. The rebuilt UI bundle is committed and reproducible

Resolved. `antora-ui-camel/public/_` is tracked (115 files) and this repo's history carries dedicated regen commits, so by convention a `src/css` change ships with its rebuilt bundle. That regen is commit `22630dee`, producing `site-a08aeff1d4.css`.

It was built from committed source only. A later clean rebuild against a clean working tree reproduced the identical hash and left `git status` empty, so the tracked artifact is byte-for-byte what tracked source produces.

**The tracked bundle is now one commit stale**, by decision: the item 1 link-color fix changed `vars.css` without regenerating it, because piece 6 lands immediately after and touches CSS again. One regen commit covers both. Piece 1 was never independently mergeable anyway. Regenerate at the end of piece 6 with `cd antora-ui-camel && yarn build`, and confirm `git status` is empty on a second run before trusting the artifact.

### 4. Build status, and the GITHUB_TOKEN requirement

`yarn build:hugo` **passes**: 861 pages, exit 0, zero errors. Verified end to end, with the rendered pages referencing `site-a08aeff1d4.css`, all seven new woff2 files present, no Droid Sans Mono, and zero ASF blue anywhere in the served stylesheet.

**A Hugo build needs `GITHUB_TOKEN` set.** Without it, `getJSON` calls to `api.github.com` in `layouts/blog/*` and `layouts/partials/releases/*` hit the anonymous rate limit and the build dies with over a hundred errors that look alarming but are purely environmental. `config.toml:28` already whitelists the variable for `getenv` and the partials send it as a Bearer header, so `GITHUB_TOKEN="$(gh auth token)" yarn build:hugo` is enough locally.

`yarn build:antora` still fails, for reasons entirely outside this repo: two broken xrefs in `apache/camel`'s own `docs/user-manual/modules/ROOT/pages/key-value-repository.adoc`, targeting `components:eips:cache-eip.adoc` and `components:ROOT:state-store-component.adoc`. Since `yarn build` is sequential, this masks the now-passing Hugo step.

`check:links` cannot run on macOS at all: `check:links` invokes `deadlinks-linux`, a Linux-only binary.

### 5. Deferred minors

None block a merge. In rough priority order: `blog.css:70` keeps a `#fff` gradient stop that now shows as a faint white line against paper; `header.css:299` gives the search panel the navbar's 90% alpha with no `backdrop-filter` in the bundle; `header.css:332` puts `.result_header` in ink inside an anchor, weakening link affordance; `blog.css:328` renders the active pagination pill in near-black; `--nav-panel-divider-color` is now lighter than the panel it divides. The last four are all header, nav, or pagination chrome that pieces 2 and 3 repaint anyway.

### 6. Findings from piece 6, syntax highlighting

Piece 6 landed on top of this one. Three things it turned up are worth recording
because they are not obvious from `SCOPE.md` and outlive the piece.

**The hljs bundle ships 191 languages and is not trimmed.**
`src/js/vendor/highlight.bundle.js` calls `require('highlight.js')`, the full
package entry point, which auto-registers every language. Its nine explicit
`registerLanguage` calls are therefore redundant no-ops. The built artifact is
**903 KB raw, 286 KB gzipped**, served on every documentation page, for roughly
20 languages actually in use. Switching to `highlight.js/lib/core` with an
explicit registration list would cut about 90 percent of it.

Deliberately left for its own change. The language list can only be enumerated
from the built tree, and this site aggregates documentation from `apache/camel`
and sibling repositories, so a language used by a repository not represented in
the local build would silently lose highlighting. That needs its own
verification pass rather than a ride-along in a color-theme commit.

**Twenty-seven code blocks cannot be highlighted at all.** `uri` (11), `log`
(7), `java-properties` (3), `edi` (2), `dataweave` (2), and `datasonnet` (2)
have no highlight.js grammar. They render as flat base-color text, which is
correct and legible. Nothing to do unless someone writes grammars.

**The bash prompt glyph is unreachable from CSS.** `SCOPE.md` section 2a asks
for `#e0805a` on the shell `$`. Only the `shell`, `console`, and `shellsession`
grammars tokenize it, as a plain `.hljs-meta`; the `bash` grammar leaves it as
text. Since `.hljs-meta` also covers Java annotations and XML declarations, the
rule is scoped by language in `highlight.css`. The 1075 `bash` blocks keep an
uncolored prompt, and no stylesheet can change that.

## Deferred to later pieces

Recorded here so nothing in this plan gets mistaken for an oversight.

- **Piece 2, shared chrome:** applying `--page-padding-x` to the header, footer, and page containers; binding those containers to `--static-max-width--desktop` on documentation pages too; the `.button.dark` and `.button.light` pill radius.
- **Piece 3, Antora docs UI:** the admonition treatment. `SCOPE.md` keeps the semantic hues but moves TIP and NOTE to an orange tint with an orange left rule. That guidance is easy to miss, because a markdown glitch at `SCOPE.md:74` crams it into the last cell of the Widths table. Also `text-transform: uppercase` on `.doc` headings, and the navbar and nav-panel greys left on `--color-smoke-70` by Task 6.
- **Piece 4, designed Hugo pages:** binding `--heading-font-weight-display` to h1, and deleting the `--projects-*` page-scoped tokens now duplicated at `:root`.
- **Piece 6, syntax highlighting:** done. `highlight.css` rewritten onto shared
  `--syntax-*` tokens and a new `chroma.css` added for Hugo blog posts, both per
  `SCOPE.md` section 2a. See "Findings from piece 6" above for what it turned up.
- **Cleanup, unscheduled:** removing the `--color-smoke-*`, `--color-gray-*`, and `--color-jet-*` ramps once later pieces prove nothing binds them, and deciding whether `--color-camel-orange-light` survives.
