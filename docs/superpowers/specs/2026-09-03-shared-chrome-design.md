# Shared chrome: header, footer, buttons

Piece 2 of 6 of the camel-website redesign. Branch `feature/new-website-design`.

The six pieces: 1 foundation, 2 shared chrome (this document), 3 Antora docs UI,
4 designed Hugo pages, 5 undesigned template sweep, 6 syntax highlighting.

Landing order is **1, 6, 2, 3, 4, 5**. Pieces 1 and 6 have landed. This piece
builds directly on the tokens they settled.

Design source: `Apache Camel Home.dc.html` and `Apache Camel Site Pages.dc.html`,
with decisions recorded in the design handoff `SCOPE.md` (2026-09-03), section 3.

**Correction, made during implementation.** This document was written believing
the artboard files were not available on the implementing machine, and everything
below was derived from `SCOPE.md`'s prose plus the decisions recorded under
"Resolved ambiguities". The design owner then supplied
`Apache Camel website reference.zip`, which contains both artboards along with a
drop-in `integration/` package for `/projects/`. The artboards are therefore
authoritative for measurements, and the reconciliation is recorded in
"Artboard reconciliation" below. Where `SCOPE.md` is silent or self-contradictory,
this document still states what was chosen and who chose it.

One resolution the artboards confirm rather than overturn: the footer really does
show four columns with no Documentation column, so ambiguity 5 below was a genuine
conflict in the source and its five-column resolution stands.

## Why this is its own piece

The header and footer appear on every page the site publishes, in two template
systems that do not share code: Hugo renders `layouts/partials/header.html` and
`footer.html`, Antora renders `antora-ui-camel/src/partials/header-content.hbs`
and `footer-content.hbs`. The two files are supposed to be the same markup.

They are not. Five divergences exist today:

| item | Hugo | Antora |
|---|---|---|
| Tooling in the Overview column | present | absent |
| user stories link text | "Who Uses Camel" | "User stories" |
| mailing list href | `/community/mailing-list` | `/community/mailing-list/` |
| RSS icon in the footer | present | absent |
| Netlify remark | present | absent |

Hand-syncing has already failed. A rewrite that restructures both files is
exactly when that failure compounds, so this piece removes the duplication
rather than reproducing it.

## Scope

In scope:

- Single-source the footer content and social links into a data file both
  template systems read.
- Reduce and reorder the header menu; move Download to a CTA and Trust to the
  footer.
- Rewrite header and footer markup in both template systems.
- Rewrite `header.css` and `footer.css` onto the redesign tokens.
- Apply `--static-max-width--desktop` and `--page-padding-x` to the header and
  footer inner containers on every page, documentation included.
- Restyle `.button.dark` and `.button.light`; add `.button.on-dark`.

Out of scope, deferred to later pieces:

- The Antora nav panel, toolbar, article, and TOC, including the second search
  field that `SCOPE.md` section 5 places in the nav panel (piece 3).
- Every Hugo page body, including the home page and `/projects/` (piece 4).
- Release notes and release partials (piece 5).
- Mobile layout beyond keeping the existing breakpoints working, per
  `SCOPE.md`'s own out-of-scope note.

## Resolved ambiguities

`SCOPE.md` section 3 does not account for four things present in the header
today, and its footer paragraph contradicts itself. The design owner ruled on
each on 2026-09-03. These are decisions, not inferences.

1. **Search stays in the header.** Section 3 moves search into the Antora nav
   panel, which exists only on documentation pages, and specifies no header
   search field. Taken literally that removes site search from every Hugo page.
   The Algolia input stays in the header on all pages, restyled; section 5's nav
   panel field is an addition for documentation pages, and is piece 3's work.

2. **Trust moves to the footer.** Section 3 names five header links;
   `config.toml` has seven. Download becomes the CTA, and Trust moves to the
   About column.

3. **The header keeps GitHub only.** The other four social icons (Zulip,
   Twitter, LinkedIn, RSS) drop from the header. All five remain in the footer.

4. **The CTA reads "Get Started" on the home page and `/projects/` only**,
   pointing at `/manual/getting-started.html`. Every other page, Hugo or Antora,
   reads "Download" and points at `/download/`.

5. **The footer has five columns, not four.** Section 3 asks for "4 columns
   (brand + blurb / Overview / Community / About)" and also for the "Same link
   set as today's footer". Those conflict: today has four columns of links, so
   giving one of four slots to the brand leaves nowhere for the eight
   Documentation links. The link set is the harder constraint, so the brand
   column makes it five and no link is lost.

## Decisions

### 1. Single-sourced chrome data

New `data/chrome.yaml` holds the footer columns, the social links, and the legal
strip. Hugo reads it as `.Site.Data.chrome`; `config.toml` already mounts
`data/` to `data`, so no configuration change is needed.

New `antora-ui-camel/src/helpers/withChromeData.js` gives the Antora templates
the same structure. It mirrors `withMenuData.js`, which already reads
`config.toml` off disk with a working-directory-then-parent fallback, and parses
YAML with `js-yaml`. Both `js-yaml` (^4.3.1) and `toml` (^3.0.0) are already
dependencies of `antora-ui-camel`, so this adds none.

The header menu is not moved into this file. It already comes from
`config.toml`'s `menu.main` through `withMenuData.js`, and that stays.

Content of the file, with the five divergences resolved toward the Hugo template
except for the mailing list href, where Antora's trailing slash is the correct
form:

- **Overview:** Blog, Documentation, Tooling, Community (`/community/support/`),
  Download, All projects (`/projects/`, new).
- **Documentation:** User Manual, Components, Camel-K, Camel Kafka Connector,
  Camel Quarkus, Camel Spring Boot, Camel Karaf, FAQ.
- **Community:** Support, Contributing, Mailing Lists
  (`/community/mailing-list/`), Who Uses Camel, Articles, Books, Team.
- **About:** Acknowledgments, Apache Events, License, Security, Sponsorship,
  Thanks, Trust (`/trust/`, new).
- **Social:** GitHub, Zulip, Twitter, LinkedIn, RSS.
- **Legal strip:** Privacy Policy, Code of Conduct, Sitemap.

Two content oddities are carried forward unchanged rather than silently fixed,
because consolidating the two files is not a license to edit their contents:

- Overview's "Community" points at `/community/support/`, not `/community/`,
  even though the header's Community link points at `/community/`. That is
  today's Hugo behavior in both files.
- The brand column's blurb had no source when this was written, so the
  implementation used the first sentence of `config.toml`'s
  `params.organizationDescription`. The artboards supply the real copy:
  "Open source integration framework. An Apache Software Foundation project,
  available under the Apache v2 license." That is what `data/chrome.yaml` now
  carries. See "Artboard reconciliation".

The copyright paragraph stays in the templates rather than the data file,
because it interpolates the current year through two different helpers
(`now.Format "2006"` in Hugo, `now_year` in handlebars). The Netlify remark
stays in the Hugo template alone: it is conditional on `getenv "CAMEL_ENV"` and
has no Antora equivalent.

### 2. `config.toml` menu

`menu.main` is reduced to the five header links and reordered to `SCOPE.md`'s
sequence:

| name | url | weight |
|---|---|---|
| Documentation | `/docs/` | 1 |
| Tooling | `/tooling/` | 2 |
| Security | `/security/` | 3 |
| Community | `/community/` | 4 |
| Blog | `/blog/` | 5 |

Download and Trust are removed from the menu; both remain reachable, Download as
the header CTA and Trust from the footer About column.

Every `pre = "img/*.svg"` entry is removed, along with the `pre` passthrough in
`withMenuData.js` and the `<img>` in both header templates. The header becomes
text-only and mobile drops the icon tiles, and `pre` is referenced nowhere else:
verified by search across `layouts/`, `antora-ui-camel/src/partials/`, and
`antora-ui-camel/src/helpers/`.

### 3. Header markup

Both template systems converge on one structure:

```
header.header
  nav.navbar
    div.navbar-inner
      a.navbar-brand
        img.navbar-logo      36px, img/logo-d.svg
        span.navbar-wordmark "Apache Camel"
      div#topbar-nav.navbar-menu
        a.navbar-item        x5, from menu.main
      div.navbar-actions
        div.navbar-search    input#search, #search-cancel, #search_results
        a.brand-icon         GitHub only
        a.button.cta         Get Started or Download
      button.navbar-burger
```

`div.navbar-inner` is new. The header has no inner container today, which is why
it cannot align with page content. It carries the width and gutter from decision
7.

The `id` values `topbar-nav`, `search`, `search-cancel`, and `search_results`
are preserved exactly. `src/js/` binds to all four, and this piece changes no
JavaScript.

The CTA is a Hugo template conditional on the home page and `/projects/`. The
Antora templates hardcode Download, since no documentation page is either.

The elements removed: the `<img>` icon inside each menu link, four of the five
social icons, `div.navbar-fill`, and `div.break-row`. The last two exist only to
force the search field onto its own row on mobile, which the new layout does not
need.

### 4. `header.css`

- `--navbar-height` goes from 73px to `calc(66 / var(--rem-base) * 1rem)`.
- `--navbar-mobile-height` loses its `4rem +` term, since nothing wraps to a
  second row any more.
- The bar is `--navbar-background` (already `rgb(250 247 241 / 90%)` from piece
  1) plus `backdrop-filter: blur(10px)`, with a 1px `--color-line` bottom
  border replacing the on-scroll box-shadow at `header.css:28-30`.
- Menu links become Open Sans 600, `calc(14.5 / var(--rem-base) * 1rem)`,
  `--color-ink-soft`, hover `--color-ink`. This deletes the `text-transform:
  uppercase` at `header.css:43` and `:225`, and the entire `::after`
  width-animation block at `header.css:46-57`.
- The wordmark is `--display-font-family` at weight 800,
  `calc(19 / var(--rem-base) * 1rem)`.
- `.nav-logo`'s background-image PNG at `nav.css:392-400` is deleted; the inline
  `<img>` replaces it.
- Mobile drops the orange tile grid at `header.css:153-200` for a plain stacked
  list. The burger and its `is-active` toggle are untouched.
- The search input loses `--color-smoke-50` for `--color-paper-2`, gains a 7px
  radius, and drops the hardcoded `#ed8225` caret and `#eaeaec` focus border for
  tokens.

### 5. Footer markup and `footer.css`

Five columns on `--footer-background` (ink): brand, then Overview,
Documentation, Community, About. The brand column carries the logo, the
"Apache Camel" wordmark, and the blurb named in decision 1.

- Column titles: `--display-font-family` 700, `calc(13 / var(--rem-base) *
  1rem)`, uppercase, `--color-on-dark`.
- Links: `calc(14 / var(--rem-base) * 1rem)`, `--color-on-dark-soft`, hover
  `--color-on-dark`.
- The legal strip sits below a 1px `--color-dark-line` rule spanning the
  container, replacing the 25rem centered `::after` hairline at
  `footer.css:26-36`.
- `--footer-height`'s empirical `23rem` is re-measured against the five-column
  layout rather than kept on faith.

The `<input type="checkbox">` plus `<label>` accordion that collapses columns on
mobile is kept unchanged. It is existing mobile behavior, and mobile is out of
scope.

`.footer-tools` ("Edit this Page", "Back to top") keeps its current position
above the footer and is restyled to tokens only.

### 6. Buttons

`.button.dark` and `.button.light` in `frontpage.css:77-105`:

- radius `3rem` becomes `8px`
- padding becomes `calc(13 / var(--rem-base) * 1rem) calc(25 / var(--rem-base) *
  1rem)`
- weight becomes 700
- `.button.dark`: `--color-camel-orange` ground, white text, hover
  `--color-orange-deep`
- `.button.light`: white ground, `--color-line` border, `--color-ink` text
- `.button.on-dark` (new): transparent ground, `--color-dark-line` border,
  `--color-on-dark` text

The dead selectors `.button-light` and `.button-dark` at `static.css:34-35` and
`frontpage.css:373` are deleted. Real usage in the repo is `class="button dark"`
(49 occurrences) and `class="button light"` (17); the hyphenated forms match
nothing.

### 7. Containers

`div.navbar-inner` and `footer .footer` both bind:

```
max-width: var(--static-max-width--desktop);
padding-inline: var(--page-padding-x);
margin-inline: auto;
```

This applies on documentation pages too. The Antora article area keeps its wider
`--doc-max-width--desktop`, per piece 1's spec: the chrome aligns across Hugo
and Antora even though the docs body is wider.

## Artboard reconciliation

Added during implementation, once `Apache Camel website reference.zip` arrived.
Measurements come from `design/Apache Camel Home.dc.html`. Every px value is
still written `calc(N / var(--rem-base) * 1rem)`, and every color still resolves
through a token; the artboard's literal hex values are only used to confirm which
token applies.

Header, artboard lines 34 to 49:

| property | artboard | what this spec had said |
|---|---|---|
| `.navbar` position | `sticky`, `top: 0` | `fixed` |
| `.navbar-inner` gap | 28px | 24px |
| `.navbar-brand` gap | 11px | 10px |
| `.navbar-wordmark` | adds `letter-spacing: -0.02em` | omitted |
| `.navbar-cta` | `padding: 9px 18px`, `border-radius: 7px` | inherited the body button |

The header CTA is deliberately smaller than both the body button (13px by 24px,
8px radius, artboard line 193) and the hero button (14px by 26px, 8px radius,
line 64). It therefore needs its own rule rather than inheriting `.button.dark`.

The artboard header carries no search field and no GitHub icon. Both stay, under
resolved ambiguities 1 and 3, which the design owner ruled on. The consequence is
that the right-hand cluster holds two more items than the artboard's spacing was
measured for, so it reads tighter than the design at narrow desktop widths. This
is a known, accepted deviation rather than an oversight.

Footer, artboard lines 247 to 287:

| property | artboard | first implementation |
|---|---|---|
| grid gap | 40px | 32px |
| container padding | `56px 32px 40px` | `1.5rem 0` plus `--page-padding-x` |
| `.footer-logo` | 34px | 40px |
| `.footer-wordmark` | 18px | 19px |
| `.footer-blurb` | 13.5px, `line-height: 1.6`, `margin: 16px 0 0`, `max-width: 280px` | 14px, `max-width: 28ch` |
| column title | `margin-bottom: 14px` | 12px |
| link spacing | 10px gap | `margin-bottom: 8px` |
| legal rule | full-bleed `border-top` **above** the copyright | hairline **below** it |
| copyright | 12.5px, `--color-on-dark-muted` | inherited |

The footer logo and wordmark are one step smaller than the header's 36px and
19px. That is intentional in the artboard, not a rounding difference.

## Files touched

- `data/chrome.yaml`: new.
- `antora-ui-camel/src/helpers/withChromeData.js`: new.
- `antora-ui-camel/src/helpers/withMenuData.js`: drop the `pre` passthrough.
- `config.toml`: menu reduced, reordered, `pre` entries removed.
- `layouts/partials/header.html`: header markup.
- `layouts/partials/footer.html`: footer markup.
- `antora-ui-camel/src/partials/header-content.hbs`: header markup.
- `antora-ui-camel/src/partials/footer-content.hbs`: footer markup.
- `antora-ui-camel/src/css/vars.css`: navbar heights.
- `antora-ui-camel/src/css/header.css`: rewrite.
- `antora-ui-camel/src/css/footer.css`: rewrite.
- `antora-ui-camel/src/css/nav.css`: delete `.nav-logo`.
- `antora-ui-camel/src/css/frontpage.css`: buttons.
- `antora-ui-camel/src/css/static.css`: delete dead button selectors.
- `antora-ui-camel/public/_/`: regenerated bundle, in its own commit.

## Verification

1. `cd antora-ui-camel && yarn build` succeeds, which runs stylelint.
2. `GITHUB_TOKEN="$(gh auth token)" yarn build:hugo` succeeds with zero errors.
   The token is required; without it `getJSON` calls in `layouts/blog/*` and
   `layouts/partials/releases/*` hit the anonymous rate limit and the build dies
   with over a hundred environmental errors.
3. `yarn check:html` passes.
4. **The footer link sets rendered by the two template systems are identical.**
   Extract every footer href and link text from a built Hugo page and from a
   built Antora page, sort, and diff. This is the assertion that tests the point
   of the piece: it fails today on all five divergences and passes only if
   single-sourcing works. It is the one check that must not be skipped.
5. The header renders the same five links on both, in the same order, and no
   page ships a menu icon `<img>`.
6. Headless Chrome screenshots of one Hugo page and one Antora documentation
   page at desktop and at a mobile width, checked for: 66px bar, blurred paper
   ground with a warm bottom rule, sentence-case links, the orange CTA reading
   the correct label, header and footer edges aligned with each other, five
   footer columns on ink, and a plain stacked list rather than orange tiles
   under the burger.

Item 6 is a judgment call and stays with the design owner, as in piece 1.

`yarn build` as a whole and `yarn check:links` still cannot pass, for reasons
outside this work and unchanged since piece 1: `build:antora` fails on two
broken xrefs in `apache/camel`'s own `key-value-repository.adoc`, and
`check:links` invokes `deadlinks-linux`, a Linux-only binary.

## Risks

- **The Antora build cannot be run locally.** `build:antora` has been failing on
  upstream xrefs since before this branch. The handlebars templates therefore
  cannot be exercised by a real Antora run, and must be verified against the
  documentation pages already present in `public/` from an earlier successful
  build. A template change that breaks only under a fresh Antora run would not
  be caught here. This is the largest risk in the piece.
- **`withChromeData.js` runs at UI-bundle time, not at Antora time.** Like
  `withMenuData.js`, it resolves its path relative to the working directory. If
  the bundle is ever built from a directory other than `antora-ui-camel` or the
  repository root, the fallback fails. The existing helper has the same
  constraint, so this adds no new failure mode, but the new helper must reuse
  the same fallback rather than inventing one.
- **Removing `pre` from `config.toml` touches a file Antora also parses.**
  `withMenuData.js` reads `config.toml` directly, so a malformed edit breaks the
  documentation build as well as the Hugo build.
- **The five-column footer is wider than the four-column one.** At the 1200px
  container it may crowd. If it does, the brand column is the one to let wrap
  first, since it carries no links.

## Follow-ups, not this piece

- The second search field in the Antora nav panel (`SCOPE.md` section 5), which
  is piece 3.
- Trimming the 903 KB highlight.js bundle, recorded in the piece 1 plan under
  "Findings from piece 6".
- Deciding whether `--color-camel-orange-light` and the unused greyscale ramps
  survive, carried forward from piece 1.
