# Shared Chrome Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rebuild the site header and footer on the redesign tokens in both template systems, single-sourcing the footer content so the two stop drifting.

**Architecture:** The footer content moves into `data/chrome.yaml`, which Hugo reads natively and a new `withChromeData.js` handlebars helper reads off disk, mirroring the existing `withMenuData.js`. The header menu is already single-sourced through `config.toml`. Markup lands before CSS in both cases, so a reviewer can reject a DOM change without judging its paint.

**Tech Stack:** Hugo Go templates, Handlebars 4.7, `js-yaml` 4, gulp 4 with postcss, stylelint 15, CSS custom properties.

**Spec:** `docs/superpowers/specs/2026-09-03-shared-chrome-design.md`

## Global Constraints

- Branch is `feature/new-website-design`. This is a git worktree; never use bare `git stash` / `git stash pop`.
- **No new dependencies.** `js-yaml` (^4.3.1), `toml` (^3.0.0) and `handlebars` (4.7.9) are all already resolvable.
- **`#search`'s direct parent must carry exactly `class="navbar-search results-hidden"` and nothing else.** `src/js/vendor/algoliasearch.bundle.js:214` takes `search.parentNode` as its container and then *assigns* `container.className = 'navbar-search results-hidden'` at four points (`:247`, `:253`, `:348`, `:356`). Any extra class on that element is silently erased on the first interaction. `#search_results` must stay a descendant of that container, because `.results-hidden #search_results { display: none }` is what hides it.
- **Preserve these ids verbatim:** `topbar-nav`, `search`, `search-cancel`, `search_results`, `top`. `algoliasearch.bundle.js` and `05-navbar.js` query all of them.
- **Preserve the burger contract:** `button.navbar-burger[data-target="topbar-nav"]`. `05-navbar.js` toggles `is-active` on the button, on `getElementById(el.dataset.target)`, and `is-clipped--navbar` on `<html>`.
- `--rem-base` stays at 18. Every px value from the artboards is written as `calc(N / var(--rem-base) * 1rem)`.
- Every task that touches `antora-ui-camel/src` ends with `cd antora-ui-camel && yarn build` succeeding. That task runs stylelint, so a lint failure is a build failure.
- **`yarn` is not on PATH in this environment.** Use `node .yarn/releases/yarn-4.1.0.cjs <script>` from the repo root, or `node ../.yarn/releases/yarn-4.1.0.cjs <script>` from `antora-ui-camel`.
- **A Hugo build needs `GITHUB_TOKEN`.** Without it, `getJSON` calls in `layouts/blog/*` and `layouts/partials/releases/*` hit the anonymous rate limit and the build dies with over a hundred environmental errors. Use `GITHUB_TOKEN="$(gh auth token)" node .yarn/releases/yarn-4.1.0.cjs build:hugo`.
- **Do not regenerate `antora-ui-camel/public/_` per task.** The bundle is tracked; Task 7 regenerates it once, in its own commit, as the repo's existing regen commits do.
- American English. No em dashes in code comments, commit messages, or docs.
- **Line numbers are hints; the quoted text is authoritative.** Locate by the quoted text and never edit a line whose current content does not match.

## Why the Antora side is testable without Antora

`yarn build:antora` fails on two broken xrefs in `apache/camel`'s own `key-value-repository.adoc`, and has since before this branch. It cannot be used to verify the handlebars templates.

Instead, the templates are rendered directly in node with Handlebars, which is already resolvable. This has been proven to work against the current `footer-content.hbs`:

```
rendered ok, 30 links
#top | Back to top
/blog/ | Blog
...
```

Every Antora-side assertion in this plan uses that mechanism. It is faster than an Antora build and it isolates the template from Antora's own failures.

## File structure

| File | Responsibility | Tasks |
|---|---|---|
| `data/chrome.yaml` | Footer columns, social links, legal strip, brand copy (new) | 1 |
| `antora-ui-camel/src/helpers/withChromeData.js` | Expose `data/chrome.yaml` to handlebars (new) | 1 |
| `antora-ui-camel/src/helpers/withMenuData.js` | Drop the `pre` passthrough | 4 |
| `config.toml` | Header menu: five items, reordered, no icons | 4 |
| `layouts/partials/footer.html` | Hugo footer markup | 2 |
| `antora-ui-camel/src/partials/footer-content.hbs` | Antora footer markup | 2 |
| `layouts/partials/header.html` | Hugo header markup | 4 |
| `antora-ui-camel/src/partials/header-content.hbs` | Antora header markup | 4 |
| `antora-ui-camel/src/css/footer.css` | Footer paint | 3 |
| `antora-ui-camel/src/css/header.css` | Header paint | 5 |
| `antora-ui-camel/src/css/nav.css` | Delete `.nav-logo` | 5 |
| `antora-ui-camel/src/css/vars.css` | Navbar heights | 5 |
| `antora-ui-camel/src/css/frontpage.css` | Buttons | 6 |
| `antora-ui-camel/src/css/static.css` | Delete dead button selectors | 6 |
| `antora-ui-camel/public/_/` | Regenerated bundle | 7 |

The verification script lives in the scratchpad, not the repo. Promoting it to `tests/chrome-parity.js` with a `check:chrome` yarn script is a follow-up, not this plan; the spec did not budget for a committed check.

---

### Task 1: Chrome data file and Antora helper

Purely additive. Nothing consumes the data yet, so the site is unchanged. This isolates "can both template systems read one file" from every question about markup.

**Files:**
- Create: `data/chrome.yaml`
- Create: `antora-ui-camel/src/helpers/withChromeData.js`

**Interfaces:**
- Consumes: nothing.
- Produces:
  - Hugo: `.Site.Data.chrome` with keys `brand` (`name`, `blurb`), `columns` (list of `{title, id, links}`), `social` (list of `{name, icon, url, title}`), `legal` (list of `{name, url, external}`). Link objects are `{name, url}` plus optional `external: true`.
  - Handlebars: block helper `withChromeData`, exposing `@brand`, `@columns`, `@social`, `@legal` in its body. Every `url` is already prefixed with `siteRootPath` unless it is absolute.

- [ ] **Step 1: Write the failing assertion**

Run this now and record the output. Step 5 is the passing counterpart.

```bash
cd antora-ui-camel && node -e "
const H=require('handlebars');
H.registerHelper('withChromeData', require('./src/helpers/withChromeData.js'));
console.log(H.compile('{{#withChromeData}}{{#each @columns}}{{title}} {{/each}}{{/withChromeData}}')({siteRootPath:''}));
"; echo "exit: $?"
```

Expected: a failure, `Cannot find module './src/helpers/withChromeData.js'`.

- [ ] **Step 2: Create `data/chrome.yaml`**

Every link below is copied from `layouts/partials/footer.html` as it stands, with the five divergences resolved per the spec and the two new links added.

```yaml
# Shared site chrome. Read by Hugo as .Site.Data.chrome and by the Antora UI
# through src/helpers/withChromeData.js. Edit here, never in the templates.
brand:
  name: Apache Camel
  blurb: >-
    Apache Camel is an open source integration framework with 350+ connectors
    for databases, APIs, message brokers, and cloud services.

columns:
  - title: Overview
    id: overview
    links:
      - { name: Blog, url: /blog/ }
      - { name: Documentation, url: /docs/ }
      - { name: Tooling, url: /tooling/ }
      - { name: Community, url: /community/support/ }
      - { name: Download, url: /download/ }
      - { name: All projects, url: /projects/ }
  - title: Documentation
    id: documentation
    links:
      - { name: User Manual, url: /manual/ }
      - { name: Components, url: /components/next/index.html }
      - { name: Camel-K, url: /camel-k/next/ }
      - { name: Camel Kafka Connector, url: /camel-kafka-connector/next/ }
      - { name: Camel Quarkus, url: /camel-quarkus/next/ }
      - { name: Camel Spring Boot, url: /camel-spring-boot/next/ }
      - { name: Camel Karaf, url: /camel-karaf/latest/ }
      - { name: FAQ, url: /manual/faq/index.html }
  - title: Community
    id: community
    links:
      - { name: Support, url: /community/support/ }
      - { name: Contributing, url: /community/contributing/ }
      - { name: Mailing Lists, url: /community/mailing-list/ }
      - { name: Who Uses Camel, url: /community/user-stories/ }
      - { name: Articles, url: /community/articles/ }
      - { name: Books, url: /community/books/ }
      - { name: Team, url: /community/team/ }
  - title: About
    id: about
    links:
      - { name: Acknowledgments, url: /acknowledgments/ }
      - { name: Apache Events, url: 'https://www.apache.org/events/current-event.html', external: true }
      - { name: License, url: 'https://www.apache.org/licenses/', external: true }
      - { name: Security, url: 'https://www.apache.org/security/', external: true }
      - { name: Sponsorship, url: 'https://www.apache.org/foundation/sponsorship.html', external: true }
      - { name: Thanks, url: 'https://www.apache.org/foundation/thanks.html', external: true }
      - { name: Trust, url: /trust/ }

social:
  - { name: GitHub, icon: github, url: 'https://github.com/apache/camel/', title: Collaborate on GitHub, external: true }
  - { name: Zulip, icon: zulip, url: 'https://camel.zulipchat.com', title: Chat on Zulip, external: true }
  - { name: Twitter, icon: twitter, url: 'https://twitter.com/ApacheCamel', title: Follow Apache Camel on Twitter, external: true }
  - { name: LinkedIn, icon: linkedin, url: 'https://www.linkedin.com/groups/2447439/', title: Apache Camel group on Linkedin, external: true }
  - { name: RSS, icon: rss, url: /blog/index.xml, title: Subscribe to RSS Feed }

legal:
  - { name: Privacy Policy, url: 'https://privacy.apache.org/policies/privacy-policy-public.html', external: true }
  - { name: Code of Conduct, url: 'https://www.apache.org/foundation/policies/conduct', external: true }
  - { name: Sitemap, url: /sitemap/ }
```

- [ ] **Step 3: Create `antora-ui-camel/src/helpers/withChromeData.js`**

The path resolution deliberately copies `withMenuData.js`: working directory first, parent second. Antora runs from the repository root; `gulp preview` runs from `antora-ui-camel`. Do not invent a different scheme.

```js
'use strict'

const fs = require('fs')
const path = require('path')
const yaml = require('js-yaml')

const absolute = /^(?:https?:)?\/\//

let dataPath = path.join(process.cwd(), 'data', 'chrome.yaml')
try {
  fs.accessSync(dataPath)
} catch (err) {
  dataPath = path.resolve(process.cwd(), '..', 'data', 'chrome.yaml')
  fs.accessSync(dataPath)
}

// js-yaml 4's load() uses the safe schema by default; safeLoad was removed in
// v4 because it became redundant. This is not PyYAML's unsafe load.
const chromeData = yaml.load(fs.readFileSync(dataPath, 'utf8'))

const mapLink = (link, siteRootPath) => {
  return Object.assign({}, link, {
    url: absolute.test(link.url) ? link.url : siteRootPath + link.url,
  })
}

module.exports = (options) => {
  const siteRootPath = options.data.root.siteRootPath
  return options.fn(this, {
    data: {
      brand: chromeData.brand,
      columns: chromeData.columns.map((column) => ({
        title: column.title,
        id: column.id,
        links: column.links.map((link) => mapLink(link, siteRootPath)),
      })),
      social: chromeData.social.map((link) => mapLink(link, siteRootPath)),
      legal: chromeData.legal.map((link) => mapLink(link, siteRootPath)),
    },
  })
}
```

- [ ] **Step 4: Verify Hugo sees the data**

```bash
GITHUB_TOKEN="$(gh auth token)" node .yarn/releases/yarn-4.1.0.cjs build:hugo 2>&1 | tail -3
```

Expected: success. The data file is not referenced by any template yet, so this only proves the YAML parses under Hugo's loader.

- [ ] **Step 5: Verify both readers agree**

```bash
cd antora-ui-camel && node -e "
const fs=require('fs'), yaml=require('js-yaml'), H=require('handlebars');
H.registerHelper('withChromeData', require('./src/helpers/withChromeData.js'));
const raw = yaml.load(fs.readFileSync('../data/chrome.yaml','utf8'));
const rendered = H.compile('{{#withChromeData}}{{#each @columns}}{{#each links}}{{url}}\n{{/each}}{{/each}}{{/withChromeData}}')({siteRootPath:''}).trim().split('\n');
const expected = raw.columns.flatMap(c => c.links.map(l => l.url));
const ok = rendered.length === expected.length && rendered.every((u,i) => u === expected[i]);
console.log('yaml links:', expected.length, 'helper links:', rendered.length, ok ? 'PASS' : 'FAIL');
process.exit(ok ? 0 : 1);
"
```

Expected: `yaml links: 28 helper links: 28 PASS`.


- [ ] **Step 6: Commit**

```bash
git add data/chrome.yaml antora-ui-camel/src/helpers/withChromeData.js
git commit -m "feat(chrome): single source the footer content"
```

---

### Task 2: Footer markup in both template systems

The task that justifies the piece. Both footers stop carrying literal `<dd>` lists and iterate the shared data instead, which makes the five divergences impossible rather than merely fixed.

Class names are deliberately left alone (`footer`, `resources`, `context`, `footer-icons`). Renaming them buys nothing and would break the paint before Task 3 lands.

**Files:**
- Modify: `layouts/partials/footer.html:8-81`
- Modify: `antora-ui-camel/src/partials/footer-content.hbs:5-96`

**Interfaces:**
- Consumes: `.Site.Data.chrome` and the `withChromeData` helper from Task 1.
- Produces: both systems render one `.footer-brand` div followed by four `dl.footer-column`, then `p.remark`, `.resources`, `.footer-icons`. The mobile accordion ids stay `footer-toggle-<column id>`.

- [ ] **Step 1: Write the failing parity assertion**

Write this to the scratchpad, not the repo. Steps 5 and 7 rerun it.

```bash
cat > /tmp/chrome-parity.js <<'PARITY'
const fs = require('fs'), path = require('path'), H = require('handlebars')
const root = process.argv[2] || '.'
const ui = path.join(root, 'antora-ui-camel')
const hugoFile = process.argv[3]

H.registerHelper('now_year', require(path.join(ui, 'src/helpers/now_year.js')))
try {
  H.registerHelper('withChromeData', require(path.join(ui, 'src/helpers/withChromeData.js')))
} catch (e) { console.error('withChromeData not available:', e.message) }

const hbs = H.compile(fs.readFileSync(path.join(ui, 'src/partials/footer-content.hbs'), 'utf8'))
const antora = hbs({ siteRootPath: '', uiRootPath: '/_' })
const hugo = fs.readFileSync(hugoFile, 'utf8')

const slice = (s) => (s.match(/<footer[\s\S]*?<\/footer>/) || [''])[0]
const links = (s) => [...slice(s).matchAll(/<a[^>]*href="([^"]*)"[^>]*>([\s\S]*?)<\/a>/g)]
  .map((m) => m[1] + ' | ' + m[2].replace(/<[^>]*>/g, '').trim())
  .filter((l) => !l.startsWith('#'))
  .sort()

const a = links(antora), h = links(hugo)
const onlyAntora = a.filter((x) => !h.includes(x))
const onlyHugo = h.filter((x) => !a.includes(x))
console.log('antora footer links:', a.length, ' hugo footer links:', h.length)
if (onlyAntora.length) console.log('ONLY ANTORA:\n  ' + onlyAntora.join('\n  '))
if (onlyHugo.length) console.log('ONLY HUGO:\n  ' + onlyHugo.join('\n  '))
const bad = onlyAntora.length || onlyHugo.length
console.log(bad ? 'FAIL' : 'PASS: footer link sets are identical')
process.exit(bad ? 1 : 0)
PARITY
node /tmp/chrome-parity.js . public/index.html; echo "exit: $?"
```

Expected: `FAIL`, listing the known divergences (Tooling only in Hugo, "User stories" versus "Who Uses Camel", the mailing-list trailing slash, the RSS icon).

If `public/index.html` does not exist, build first with `GITHUB_TOKEN="$(gh auth token)" node .yarn/releases/yarn-4.1.0.cjs build:hugo`.

- [ ] **Step 2: Rewrite the Hugo footer columns**

Replace `layouts/partials/footer.html:9-54`, from `<figure class="logo">` through the closing `</dl>` of the About block, with:

```go-html-template
            {{ $chrome := .Site.Data.chrome }}
            <div class="footer-brand">
                <img class="footer-logo" src="{{ path.Join "_" (index .Site.Data "rev-manifest" "img/logo-d.svg") | relURL }}" alt="Apache Camel Logo"
                    aria-label="white silhouette of a camel in front of a sand dune">
                <span class="footer-wordmark">{{ $chrome.brand.name }}</span>
                <p class="footer-blurb">{{ $chrome.brand.blurb }}</p>
            </div>
            {{ range $chrome.columns }}
            <input id="footer-toggle-{{ .id }}" type="checkbox" title="Show/Hide {{ .title }} section" />
            <dl class="footer-column">
                <dt><label for="footer-toggle-{{ .id }}">{{ .title }}</label><label for="footer-toggle-{{ .id }}">&#65291;</label></dt>
                {{ range .links }}
                <dd><a href="{{ .url | relURL }}"{{ if .external }} target="_blank" rel="noopener noreferrer nofollow" title="{{ .name }}"{{ end }}>{{ .name }}</a></dd>
                {{ end }}
            </dl>
            {{ end }}
```

Then replace the `.resources` block (`:64-74`) and the `.footer-icons` block (`:75-81`) with:

```go-html-template
            <div class="resources">
                {{ range $chrome.legal }}
                <div class="context">
                    <a href="{{ .url | relURL }}"{{ if .external }} target="_blank" rel="noopener noreferrer nofollow"{{ end }}>{{ .name }}</a>
                </div>
                {{ end }}
            </div>
            <div class="footer-icons">
                {{ range $chrome.social }}
                <a href="{{ .url | relURL }}"{{ if .external }} rel="noopener noreferrer nofollow"{{ end }} title="{{ .title }}"><svg class="brand-icon" focusable="false"><use href="{{ path.Join "_" (index $.Site.Data "rev-manifest" "img/brand-logos.svg") | relURL }}#{{ .icon }}" /></svg></a>
                {{ end }}
            </div>
```

Note `$.Site.Data` inside the `range`: `.` is rebound to the loop item, so the site-level lookup needs the root context. Using `.Site.Data` there fails the build.

Leave `p.remark` exactly as it is, including the Netlify conditional. It is template logic, not data.

- [ ] **Step 3: Rewrite the Antora footer columns**

Replace the `<footer>` element in `antora-ui-camel/src/partials/footer-content.hbs` with:

```handlebars
    <footer>
      {{#withChromeData}}
        <div class="footer">
            <div class="footer-brand">
                <img class="footer-logo" src="{{@root.uiRootPath}}/img/logo-d.svg" alt="Apache Camel Logo"
                    aria-label="white silhouette of a camel in front of a sand dune">
                <span class="footer-wordmark">{{@brand.name}}</span>
                <p class="footer-blurb">{{@brand.blurb}}</p>
            </div>
            {{#each @columns}}
            <input id="footer-toggle-{{id}}" type="checkbox" title="Show/Hide {{title}} section" />
            <dl class="footer-column">
                <dt><label for="footer-toggle-{{id}}">{{title}}</label><label for="footer-toggle-{{id}}">&#65291;</label></dt>
                {{#each links}}
                <dd><a href="{{url}}"{{#if external}} target="_blank" rel="noopener noreferrer nofollow" title="{{name}}"{{/if}}>{{name}}</a></dd>
                {{/each}}
            </dl>
            {{/each}}
            <p class="remark">
                &copy; 2004-{{now_year}} The <a href="https://apache.org">Apache Software Foundation</a>.<br>
                Apache Camel, Camel, Apache, the Apache feather logo, and the Apache Camel project logo are trademarks of
                The Apache Software Foundation. All other marks mentioned may be trademarks or registered trademarks of
                their respective owners.
            </p>
            <div class="resources">
                {{#each @legal}}
                <div class="context">
                    <a href="{{url}}"{{#if external}} target="_blank" rel="noopener noreferrer nofollow"{{/if}}>{{name}}</a>
                </div>
                {{/each}}
            </div>
            <div class="footer-icons">
                {{#each @social}}
                <a href="{{url}}"{{#if external}} rel="noopener noreferrer nofollow"{{/if}} title="{{title}}"><svg class="brand-icon" focusable="false"><use xlink:href="{{@root.uiRootPath}}/img/brand-logos.svg#{{icon}}" /></svg></a>
                {{/each}}
            </div>
        </div>
      {{/withChromeData}}
    </footer>
```

Note `{{@root.uiRootPath}}` rather than `{{uiRootPath}}`. Inside `{{#each}}` handlebars rebinds the context per item, so the bare name resolves to nothing and the icons silently vanish with a truncated `xlink:href`. `@root` reaches the original template context from any depth, which is why it is used for the logo too.

- [ ] **Step 4: Confirm the helper reaches the bundle**

No action needed: `gulp.d/tasks/build.js:130` globs `helpers/*.js`. Confirm with:

```bash
cd antora-ui-camel && node ../.yarn/releases/yarn-4.1.0.cjs build && ls public/_/helpers/ | grep -c withChromeData
```

Expected: build succeeds, output `1`.

- [ ] **Step 5: Rebuild Hugo and run the parity check**

```bash
GITHUB_TOKEN="$(gh auth token)" node .yarn/releases/yarn-4.1.0.cjs build:hugo 2>&1 | tail -3
node /tmp/chrome-parity.js . public/index.html; echo "exit: $?"
```

Expected: `PASS: footer link sets are identical`, `exit: 0`, and the same count on both sides.

The count is 37 at the time of writing: 28 column links (Overview 6, Documentation 8, Community 7, About 7), 3 legal, 5 social, and the `apache.org` link inside the copyright paragraph. Treat the equality as the assertion and the number as a sanity check, not the other way round.

If it fails on href form rather than on content, the cause is almost certainly `relURL` versus the raw path. Compare one differing pair by eye before changing the data file; the data is the source of truth and the templates are what should bend.

- [ ] **Step 6: Confirm the accordion ids still match their labels**

```bash
grep -o 'footer-toggle-[a-z]*' public/index.html | sort -u
```

Expected exactly: `footer-toggle-about`, `footer-toggle-community`, `footer-toggle-documentation`, `footer-toggle-overview`. Any other value means an `id` in `chrome.yaml` disagrees with the label `for` attribute or the CSS.

- [ ] **Step 7: Commit**

```bash
git add layouts/partials/footer.html antora-ui-camel/src/partials/footer-content.hbs
git commit -m "feat(chrome): render both footers from the shared data"
```

---

### Task 3: Footer CSS

**Files:**
- Modify: `antora-ui-camel/src/css/footer.css`
- Modify: `antora-ui-camel/src/css/vars.css` (`--footer-height` only)

**Interfaces:**
- Consumes: `.footer-brand`, `.footer-logo`, `.footer-wordmark`, `.footer-blurb`, `dl.footer-column` from Task 2.
- Produces: nothing later tasks depend on.

- [ ] **Step 1: Write the failing assertion**

```bash
grep -c "footer-column\|footer-brand" antora-ui-camel/src/css/footer.css
```

Expected: `0`. The stylesheet has no rules for the new elements, so the brand column and the five-column grid are unstyled.

- [ ] **Step 2: Replace the container rule with a five-column grid**

Replace the existing `footer .footer` rule:

```css
footer .footer {
  display: grid;
  grid-template-columns: 1.4fr repeat(4, 1fr);
  gap: calc(32 / var(--rem-base) * 1rem);
  width: 100%;
  max-width: var(--static-max-width--desktop);
  margin-inline: auto;
  padding-inline: var(--page-padding-x);
}
```

The checkbox inputs that drive the mobile accordion are grid items too. Keep them out of the flow at desktop with the rule the stylesheet already uses for them, or add `footer .footer > input[type='checkbox'] { display: none; }` inside the desktop media query only. Do not delete the inputs: the mobile accordion depends on them.

- [ ] **Step 3: Add the brand column**

```css
.footer-brand {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: calc(12 / var(--rem-base) * 1rem);
}

.footer-logo {
  width: calc(40 / var(--rem-base) * 1rem);
}

.footer-wordmark {
  font-family: var(--display-font-family);
  font-weight: 800;
  font-size: calc(19 / var(--rem-base) * 1rem);
  color: var(--color-on-dark);
}

.footer-blurb {
  font-size: calc(14 / var(--rem-base) * 1rem);
  color: var(--color-on-dark-muted);
  margin: 0;
  max-width: 28ch;
}
```

`--color-on-dark-muted` is `#8f867a`, which measures 4.71:1 on `--color-ink`. That clears AA for the blurb.

- [ ] **Step 4: Style column titles and links**

```css
.footer-column dt {
  font-family: var(--display-font-family);
  font-weight: 700;
  font-size: calc(13 / var(--rem-base) * 1rem);
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--color-on-dark);
  margin-bottom: calc(12 / var(--rem-base) * 1rem);
}

.footer-column dd {
  margin: 0 0 calc(8 / var(--rem-base) * 1rem);
}

.footer-column dd a {
  font-size: calc(14 / var(--rem-base) * 1rem);
  color: var(--color-on-dark-soft);
}

.footer-column dd a:hover {
  color: var(--color-on-dark);
}
```

- [ ] **Step 5: Span the legal rule across the container**

`footer .footer p.remark::after` draws a 25rem centered hairline at `footer.css:26-36`. Change `width: 25rem;` to `width: 100%;` and `margin: 2rem auto 1rem;` to `margin: 2rem 0 1rem;`.

- [ ] **Step 6: Restyle `.footer-tools`**

The "Edit this Page" and "Back to top" strip sits above the footer and keeps its position. It is tokens only, no layout change. In `footer.css`, replace whatever colors the `.footer-tools` rules carry with:

```css
.footer-tools {
  color: var(--color-ink-muted);
  font-size: calc(13 / var(--rem-base) * 1rem);
}

.footer-tools a {
  color: var(--color-ink-soft);
}

.footer-tools a:hover {
  color: var(--color-ink);
}
```

`.footer-tools` sits on `--color-paper`, not on the ink footer, so it takes ink-family colors rather than on-dark ones. Getting this backwards makes it invisible.

- [ ] **Step 7: Re-measure `--footer-height`**

`vars.css` carries `--footer-height: 23rem;` with a comment calling it empirical. Five columns and a brand blurb change the height. Take the screenshot in Step 8 first, measure the rendered footer, and either set the token to the measured value or delete it along with the `min-height` on `footer` if it no longer earns its keep. Do not leave the old number in place unverified.

- [ ] **Step 8: Build, serve, screenshot**

```bash
cd antora-ui-camel && node ../.yarn/releases/yarn-4.1.0.cjs build && cd ..
NEW=$(ls antora-ui-camel/public/_/css/site-*.css | head -1)
OLD=$(ls public/_/css/site-*.css | head -1)
cp "$NEW" "$OLD"
cd public && (python3 -m http.server 8899 >/dev/null 2>&1 &) ; sleep 2 ; cd ..
"/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" --headless=new --disable-gpu \
  --hide-scrollbars --window-size=1400,2600 --virtual-time-budget=8000 \
  --screenshot=/tmp/footer.png http://localhost:8899/index.html
```

`public/` is gitignored, so overwriting the built CSS under its old hashed name is safe and lets the already-built pages pick up new styles without a full rebuild.

Read `/tmp/footer.png` and check: five columns on ink, uppercase Archivo titles, warm off-white links, the blurb wrapping at a readable measure, the legal rule spanning the container, and the footer's left and right edges aligned with the page content above it.

- [ ] **Step 9: Commit**

```bash
git add antora-ui-camel/src/css/footer.css antora-ui-camel/src/css/vars.css
git commit -m "style(chrome): paint the five column footer on ink"
```

---

### Task 4: Header menu config and markup

`config.toml` and both header templates must change together. Removing `pre` while a template still renders `{{ .Pre }}` produces an `<img>` with an empty `src`, which html-validate rejects and browsers resolve against the page URL.

**Files:**
- Modify: `config.toml:43-90`
- Modify: `antora-ui-camel/src/helpers/withMenuData.js`
- Modify: `layouts/partials/header.html:56-92`
- Modify: `antora-ui-camel/src/partials/header-content.hbs`

**Interfaces:**
- Consumes: `menu.main` through `.Site.Menus.main` (Hugo) and `withMenuData` (handlebars).
- Produces: `div.navbar-inner` wrapping `a.navbar-brand`, `div#topbar-nav.navbar-menu`, `div.navbar-actions`, and `button.navbar-burger`. Task 5 styles exactly these names.

- [ ] **Step 1: Write the failing assertion**

```bash
grep -c 'navbar-item-section\|navbar-topics\|navbar-fill\|break-row' layouts/partials/header.html antora-ui-camel/src/partials/header-content.hbs
grep -c 'pre = ' config.toml
```

Expected: non-zero on all three.

- [ ] **Step 2: Reduce and reorder `menu.main`**

Replace the whole `[[menu.main]]` run in `config.toml:43-90` with:

```toml
[[menu.main]]
    name = "Documentation"
    identifier = "docs"
    weight = 1
    url = "/docs/"

[[menu.main]]
    name = "Tooling"
    identifier = "tooling"
    weight = 2
    url = "/tooling/"

[[menu.main]]
    name = "Security"
    identifier = "security"
    weight = 3
    url = "/security/"

[[menu.main]]
    name = "Community"
    identifier = "community"
    weight = 4
    url = "/community/"

[[menu.main]]
    name = "Blog"
    identifier = "blog"
    weight = 5
    url = "/blog/"
```

Download and Trust are gone: Download becomes the CTA below, Trust is already in the footer About column from Task 1. Every `pre` entry is gone with them.

`withMenuData.js` parses this same file, so a malformed edit breaks the documentation build as well as the Hugo build.

- [ ] **Step 3: Drop `pre` from the menu helper**

In `antora-ui-camel/src/helpers/withMenuData.js`, delete the line `pre: item.pre,` from `createMenu` and the line `pre: item.pre,` from `mapItem`. Nothing else in that file changes.

- [ ] **Step 4: Rewrite the Hugo header**

Replace `layouts/partials/header.html:56-92`, from `<header class="header"` through `<a id="top"></a>`, with:

```go-html-template
    {{ $ctaLabel := "Download" }}
    {{ $ctaURL := "/download/" }}
    {{ if or .Page.IsHome (eq .Page.RelPermalink "/projects/") }}
        {{ $ctaLabel = "Get Started" }}
        {{ $ctaURL = "/manual/getting-started.html" }}
    {{ end }}
    <header class="header" aria-label="Header">
        <nav class="navbar" aria-label="Main menu">
            <div class="navbar-inner">
                <a class="navbar-brand" href="{{ .Site.BaseURL | relURL }}" title="{{ .Site.Title }}">
                    <img class="navbar-logo" src="{{ path.Join "_" (index .Site.Data "rev-manifest" "img/logo-d.svg") | relURL }}" alt="">
                    <span class="navbar-wordmark">Apache Camel</span>
                </a>
                <div id="topbar-nav" class="navbar-menu">
                    {{ range .Site.Menus.main }}
                    <a class="navbar-item" href="{{ .URL | relURL }}">{{ .Name }}</a>
                    {{ end }}
                </div>
                <div class="navbar-actions">
                    <div class="navbar-search results-hidden">
                        <input id="search" class="search" placeholder="Search" autocomplete="off" maxlength="200">
                        <img src="{{ path.Join "_" (index .Site.Data "rev-manifest" "img/cancel.svg") | relURL }}" alt="Clear" id="search-cancel">
                        <div id="search_results"></div>
                    </div>
                    <a class="navbar-github" rel="noopener noreferrer nofollow" href="https://github.com/apache/camel/" title="Collaborate on GitHub"><svg focusable="false" class="brand-icon"><use href="{{ path.Join "_" (index .Site.Data "rev-manifest" "img/brand-logos.svg") | relURL }}#github" /></svg></a>
                    <a class="button dark navbar-cta" href="{{ $ctaURL | relURL }}">{{ $ctaLabel }}</a>
                </div>
                <button class="navbar-burger" data-target="topbar-nav" type="button" aria-label="Menu">
                    <span></span>
                    <span></span>
                    <span></span>
                </button>
            </div>
        </nav>
    </header>
    <a id="top"></a>
```

`div.navbar-search` carries exactly `navbar-search results-hidden` and nothing else, per the global constraint. The `alt=""` on the logo is deliberate: the adjacent wordmark already names the link, so a second accessible name would be redundant.

- [ ] **Step 5: Rewrite the Antora header**

Replace the `<header>` element through `<a id="top"></a>` in `antora-ui-camel/src/partials/header-content.hbs` with:

```handlebars
<header class="header">
  <nav class="navbar" aria-label="Main menu">
    <div class="navbar-inner">
      <a class="navbar-brand" href="{{siteRootPath}}">
        <img class="navbar-logo" src="{{uiRootPath}}/img/logo-d.svg" alt="">
        <span class="navbar-wordmark">Apache Camel</span>
      </a>
      <div id="topbar-nav" class="navbar-menu">
        {{#withMenuData}}
          {{#each @items}}
            <a class="navbar-item" href="{{url}}">{{name}}</a>
          {{/each}}
        {{/withMenuData}}
      </div>
      <div class="navbar-actions">
        <div class="navbar-search results-hidden">
          <input id="search" class="search" placeholder="Search" autocomplete="off" maxlength="200">
          <img src="{{uiRootPath}}/img/cancel.svg" alt="Clear" id="search-cancel">
          <div id="search_results"></div>
        </div>
        <a class="navbar-github" rel="noopener noreferrer nofollow" href="https://github.com/apache/camel/" title="Collaborate on GitHub"><svg focusable="false" class="brand-icon"><use xlink:href="{{uiRootPath}}/img/brand-logos.svg#github" /></svg></a>
        <a class="button dark navbar-cta" href="{{siteRootPath}}/download/">Download</a>
      </div>
      <button class="navbar-burger" data-target="topbar-nav" type="button" aria-label="Menu">
        <span></span>
        <span></span>
        <span></span>
      </button>
    </div>
  </nav>
</header>
<a id="top"></a>
```

The CTA is unconditionally Download: no documentation page is the home page or `/projects/`.

- [ ] **Step 6: Rebuild and assert the Hugo DOM**

```bash
cd antora-ui-camel && node ../.yarn/releases/yarn-4.1.0.cjs build && cd ..
GITHUB_TOKEN="$(gh auth token)" node .yarn/releases/yarn-4.1.0.cjs build:hugo 2>&1 | tail -3
node /tmp/header-check.js
```

with `/tmp/header-check.js`:

```javascript
const fs = require('fs')
const home = fs.readFileSync('public/index.html', 'utf8')
const header = (home.match(/<header[\s\S]*?<\/header>/) || [''])[0]
const nav = (header.match(/<div id="topbar-nav"[\s\S]*?<\/div>/) || [''])[0]
const links = [...nav.matchAll(/<a[^>]*>([^<]*)<\/a>/g)].map((m) => m[1].trim())

const checks = [
  ['five nav links', links.length === 5],
  ['nav order', links.join(',') === 'Documentation,Tooling,Security,Community,Blog'],
  ['no menu icons', !nav.includes('<img')],
  ['search container exact', header.includes('class="navbar-search results-hidden"')],
  ['search ids intact', ['id="search"', 'id="search-cancel"', 'id="search_results"'].every((s) => header.includes(s))],
  ['burger target', header.includes('data-target="topbar-nav"')],
  ['one github icon', (header.match(/#github/g) || []).length === 1],
  ['cta says Get Started on home', /navbar-cta[^>]*>\s*Get Started/.test(header)],
  ['navbar-inner present', header.includes('class="navbar-inner"')],
]
let bad = 0
for (const [name, ok] of checks) { if (!ok) bad++; console.log((ok ? 'PASS  ' : 'FAIL  ') + name) }
console.log('nav links:', links.join(' | '))
process.exit(bad ? 1 : 0)
```

Expected: nine PASS lines, exit 0.

- [ ] **Step 7: Assert the CTA flips on a non-marketing page**

```bash
node -e "
const fs=require('fs');
const p=fs.readFileSync('public/download/index.html','utf8');
const ok=/navbar-cta[^>]*>\s*Download/.test(p);
console.log(ok?'PASS: CTA reads Download off the marketing pages':'FAIL');
process.exit(ok?0:1)"
```

- [ ] **Step 8: Assert the Antora header renders the same five links**

```bash
cd antora-ui-camel && node -e "
const fs=require('fs'), H=require('handlebars');
H.registerHelper('withMenuData', require('./src/helpers/withMenuData.js'));
const out=H.compile(fs.readFileSync('src/partials/header-content.hbs','utf8'))({siteRootPath:'', uiRootPath:'/_'});
const nav=(out.match(/<div id=\"topbar-nav\"[\s\S]*?<\/div>/)||[''])[0];
const links=[...nav.matchAll(/<a[^>]*>([^<]*)<\/a>/g)].map(m=>m[1].trim()).filter(Boolean);
const ok = links.join(',')==='Documentation,Tooling,Security,Community,Blog' && !nav.includes('<img');
console.log(links.join(' | '));
console.log(ok?'PASS: antora header matches hugo':'FAIL');
process.exit(ok?0:1)"
```

- [ ] **Step 9: Commit**

```bash
git add config.toml antora-ui-camel/src/helpers/withMenuData.js \
        layouts/partials/header.html antora-ui-camel/src/partials/header-content.hbs
git commit -m "feat(chrome): rebuild the header markup in both template systems"
```

---

### Task 5: Header CSS

The header looks wrong between Tasks 4 and 5, because the old stylesheet targets classes the new markup no longer has. That window is expected and closes here.

**Files:**
- Modify: `antora-ui-camel/src/css/vars.css` (navbar heights)
- Modify: `antora-ui-camel/src/css/header.css`
- Modify: `antora-ui-camel/src/css/nav.css:392-400`

**Interfaces:**
- Consumes: the markup from Task 4.
- Produces: nothing later tasks depend on.

- [ ] **Step 1: Write the failing assertion**

```bash
grep -c "navbar-inner\|navbar-wordmark\|navbar-actions\|navbar-cta" antora-ui-camel/src/css/header.css
grep -c "navbar-topics" antora-ui-camel/src/css/header.css
```

Expected: `0` for the first, non-zero for the second. The stylesheet still targets the removed classes and knows nothing of the new ones.

- [ ] **Step 2: Set the bar height**

In `vars.css`, change `--navbar-height` from `calc(73 / var(--rem-base) * 1rem)` to `calc(66 / var(--rem-base) * 1rem)`, and change `--navbar-mobile-height` from `calc(4rem + var(--navbar-height))` to `var(--navbar-height)`. Nothing wraps to a second row any more, so the extra 4rem is dead space.

- [ ] **Step 3: Repaint the bar and add the inner container**

Replace the `.navbar` rule and delete the scroll shadow at `header.css:28-30`:

```css
.navbar {
  background: var(--navbar-background);
  backdrop-filter: blur(10px);
  border-bottom: 1px solid var(--color-line);
  color: var(--navbar-font-color);
  font-size: calc(14.5 / var(--rem-base) * 1rem);
  height: var(--navbar-height);
  position: fixed;
  top: 0;
  width: 100%;
  z-index: var(--z-index-navbar);
}

.navbar-inner {
  display: flex;
  align-items: center;
  gap: calc(24 / var(--rem-base) * 1rem);
  height: 100%;
  width: 100%;
  max-width: var(--static-max-width--desktop);
  margin-inline: auto;
  padding-inline: var(--page-padding-x);
}
```

Delete the `html:not([data-scroll='0']) .navbar` box-shadow rule. `05-navbar.js` still writes `data-scroll`, which is harmless and used elsewhere.

- [ ] **Step 4: Style the brand**

```css
.navbar-brand {
  display: flex;
  align-items: center;
  gap: calc(10 / var(--rem-base) * 1rem);
  flex: none;
  height: auto;
}

.navbar-logo {
  width: calc(36 / var(--rem-base) * 1rem);
  height: calc(36 / var(--rem-base) * 1rem);
}

.navbar-wordmark {
  font-family: var(--display-font-family);
  font-weight: 800;
  font-size: calc(19 / var(--rem-base) * 1rem);
  color: var(--color-ink);
  white-space: nowrap;
}
```

The old `.navbar-brand` rule sets `flex-grow: 1` and a fixed height for the whole bar; both go, because the brand is now just the logo and wordmark rather than a wrapper around everything.

- [ ] **Step 5: Style the links**

Replace the desktop `@media` block at `header.css:40-62` and the `.navbar-item` rules at `:220-232` with:

```css
.navbar-menu {
  display: flex;
  align-items: center;
  gap: calc(22 / var(--rem-base) * 1rem);
}

.navbar-item {
  font-weight: 600;
  font-size: calc(14.5 / var(--rem-base) * 1rem);
  color: var(--color-ink-soft);
  text-transform: none;
  white-space: nowrap;
}

.navbar-item:hover {
  color: var(--color-ink);
}
```

This deletes the `text-transform: uppercase` and the whole `::after` width-animation block. `--color-ink-soft` is `#5c554c`, 6.87:1 on paper, so the resting state clears AA comfortably.

- [ ] **Step 6: Style the actions cluster**

```css
.navbar-actions {
  display: flex;
  align-items: center;
  gap: calc(14 / var(--rem-base) * 1rem);
  margin-left: auto;
}

.navbar-github .brand-icon {
  height: calc(20 / var(--rem-base) * 1rem);
  width: calc(20 / var(--rem-base) * 1rem);
  fill: var(--color-ink-soft);
  display: block;
}

.navbar-github:hover .brand-icon {
  fill: var(--color-ink);
}

.navbar-cta {
  margin: 0;
}
```

`margin-left: auto` is what pushes the cluster right, replacing the deleted `.navbar-fill` spacer.

- [ ] **Step 7: Restyle the search field**

Replace the `.navbar-search input` rule at `header.css:263-275`:

```css
.navbar-search {
  position: relative;
  padding: 0;
}

.navbar-search input {
  border: 1px solid var(--color-line);
  border-radius: calc(7 / var(--rem-base) * 1rem);
  width: calc(200 / var(--rem-base) * 1rem);
  margin: 0;
  padding: calc(6 / var(--rem-base) * 1rem) calc(10 / var(--rem-base) * 1rem)
           calc(6 / var(--rem-base) * 1rem) calc(30 / var(--rem-base) * 1rem);
  font-family: var(--body-font-family);
  font-size: calc(14 / var(--rem-base) * 1rem);
  caret-color: var(--color-camel-orange);
  background: no-repeat 0.5rem center / 0.9rem url('../img/search.svg');
  background-color: var(--color-paper-2);
  color: var(--color-ink);
  outline: 0;
}

.navbar-search input:focus-within {
  background-color: var(--color-white);
  border-color: var(--color-line-hover);
}
```

This removes the hardcoded `#ed8225` caret and `#eaeaec` focus border and the `--color-smoke-50` ground. `#search_results` keeps its own rules; only its `top` offset needs checking against the shorter bar.

- [ ] **Step 8: Replace the mobile tiles with a plain list**

Delete the entire orange tile block at `header.css:153-200` (the `.navbar-item` sizing, the `background: var(--color-camel-orange)`, `border-radius: 15px`, the icon sizing, `.navbar-item.navbar-topics` and its three nested font-size media queries). Replace with:

```css
@media screen and (width <= 1024px) {
  .navbar-menu {
    display: none;
  }

  .navbar-menu.is-active {
    display: flex;
    flex-direction: column;
    align-items: stretch;
    gap: 0;
    position: absolute;
    top: var(--navbar-height);
    left: 0;
    right: 0;
    max-height: calc(100vh - var(--navbar-height));
    overflow-y: auto;
    background: var(--color-paper);
    border-bottom: 1px solid var(--color-line);
    padding: calc(8 / var(--rem-base) * 1rem) var(--page-padding-x);
  }

  .navbar-menu.is-active .navbar-item {
    padding: calc(12 / var(--rem-base) * 1rem) 0;
    border-bottom: 1px solid var(--color-line-soft);
  }

  .navbar-burger {
    display: block;
  }
}
```

Keep the `.navbar-burger` span geometry and its `is-active` transforms exactly as they are. Also delete the mobile `.break-row`, `.navbar-fill`, and `.navbar-tools` rules at `header.css:435-490`, since none of those elements exist any more; keep the `#search_results` mobile rule and update its `top` to `var(--navbar-height)`.

- [ ] **Step 9: Delete the old logo background**

Delete the `.nav-logo` rule at `nav.css:392-400` entirely. The inline `<img class="navbar-logo">` replaces it, and no template emits `class="nav-logo"` any more.

Verify:

```bash
grep -rn "nav-logo" antora-ui-camel/src layouts; echo "exit: $?"
```

Expected: no matches, `exit: 1`.

- [ ] **Step 10: Build, screenshot desktop and mobile**

```bash
cd antora-ui-camel && node ../.yarn/releases/yarn-4.1.0.cjs build && cd ..
NEW=$(ls antora-ui-camel/public/_/css/site-*.css | head -1)
OLD=$(ls public/_/css/site-*.css | head -1)
cp "$NEW" "$OLD"
cd public && (python3 -m http.server 8899 >/dev/null 2>&1 &) ; sleep 2 ; cd ..
CH="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
"$CH" --headless=new --disable-gpu --hide-scrollbars --window-size=1400,900 \
  --virtual-time-budget=8000 --screenshot=/tmp/header-desktop.png http://localhost:8899/index.html
"$CH" --headless=new --disable-gpu --hide-scrollbars --window-size=390,844 \
  --virtual-time-budget=8000 --screenshot=/tmp/header-mobile.png http://localhost:8899/index.html
"$CH" --headless=new --disable-gpu --hide-scrollbars --window-size=1400,900 \
  --virtual-time-budget=8000 --screenshot=/tmp/header-docs.png \
  http://localhost:8899/camel-core/getting-started/index.html
```

Read all three. Check on desktop: a 66px bar, warm paper ground with a blurred backdrop and a single warm bottom rule, 36px camel mark and Archivo wordmark at the left, five sentence-case links, search field, one GitHub icon, orange CTA reading "Get Started". Check that the header's left and right edges line up with the footer's. Check on mobile: burger visible, and tapping it is not testable headlessly, so instead confirm no orange tiles are present in the stylesheet. Check on the docs page: the same bar, with the CTA reading "Download".

- [ ] **Step 11: Commit**

```bash
git add antora-ui-camel/src/css/header.css antora-ui-camel/src/css/nav.css antora-ui-camel/src/css/vars.css
git commit -m "style(chrome): repaint the header as a 66px paper bar"
```

---

### Task 6: Buttons

**Files:**
- Modify: `antora-ui-camel/src/css/frontpage.css:77-105`
- Modify: `antora-ui-camel/src/css/static.css:34-35`
- Modify: `antora-ui-camel/src/css/frontpage.css:373`

**Interfaces:**
- Consumes: `.button.dark` from the header CTA in Task 4.
- Produces: `.button.on-dark`, available to piece 4's dark bands.

- [ ] **Step 1: Write the failing assertion**

```bash
grep -n "border-radius: 3rem" antora-ui-camel/src/css/frontpage.css
grep -rn "button-light\|button-dark" antora-ui-camel/src/css/
```

Expected: the 3rem pill radius is present, and the dead hyphenated selectors are present in `static.css` and `frontpage.css`.

- [ ] **Step 2: Restyle the buttons**

Replace `frontpage.css:77-105`:

```css
a.button,
section.frontpage a.button {
  white-space: nowrap;
  margin: 0.5rem;
  background-image: none;
  border-radius: calc(8 / var(--rem-base) * 1rem);
  font-weight: 700;
  padding: calc(13 / var(--rem-base) * 1rem) calc(25 / var(--rem-base) * 1rem);
  display: inline-block;
  line-height: 1;
}

header.frontpage a.button {
  padding: calc(14 / var(--rem-base) * 1rem) calc(26 / var(--rem-base) * 1rem);
}

a.button.dark,
section.frontpage a.button.dark {
  background-color: var(--color-camel-orange);
  color: var(--color-white);
}

a.button.dark:hover,
section.frontpage a.button.dark:hover {
  background-color: var(--color-orange-deep);
  color: var(--color-white);
}

a.button.light,
a.button.light:hover {
  background-color: var(--color-white);
  border: 1px solid var(--color-line);
  color: var(--color-ink);
}

a.button.on-dark,
a.button.on-dark:hover {
  background-color: transparent;
  border: 1px solid var(--color-dark-line);
  color: var(--color-on-dark);
}
```

The old rule collapsed `.dark` and `.dark:hover` into one selector, so hover did nothing. Splitting them is what makes `--color-orange-deep` reachable. White on `--color-orange-deep` (`#a84e0d`) measures 5.58:1, and white on `--color-camel-orange` measures 2.93:1, so the hover state is the stronger of the two. That is a known consequence of the brand orange, not a defect introduced here.

- [ ] **Step 3: Delete the dead selectors**

In `static.css:33-37`, the rule is:

```css
.static .icon a,
.static a.button-light,
.static a.button-dark {
  background-image: none;
}
```

Reduce it to `.static .icon a { background-image: none; }`. Then delete the `header.frontpage a.button-light` rule at `frontpage.css:373` and the `.static .button-light` rule at `static.css:80`.

Nothing in the repo emits those class names: real usage is `class="button dark"` (49) and `class="button light"` (17).

- [ ] **Step 4: Verify no live selector was deleted**

```bash
grep -rho 'class="[^"]*button[^"]*"' layouts/ content/ antora-ui-camel/src/partials/ \
  | sed 's/.*class="//;s/"//' | sort -u
grep -rn "button-light\|button-dark" antora-ui-camel/src/css/; echo "exit: $?"
```

Expected: the first lists only `button dark`, `button light`, and the unrelated `resp-sharing-button*` classes. The second finds nothing, `exit: 1`.

- [ ] **Step 5: Build and screenshot**

```bash
cd antora-ui-camel && node ../.yarn/releases/yarn-4.1.0.cjs build && cd ..
NEW=$(ls antora-ui-camel/public/_/css/site-*.css | head -1)
cp "$NEW" "$(ls public/_/css/site-*.css | head -1)"
"/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" --headless=new --disable-gpu \
  --hide-scrollbars --window-size=1400,1200 --virtual-time-budget=8000 \
  --screenshot=/tmp/buttons.png http://localhost:8899/index.html
```

Read `/tmp/buttons.png`. Check: 8px corners rather than pills, orange fill on dark buttons, a warm hairline border on light ones, and the header CTA matching the body buttons.

- [ ] **Step 6: Commit**

```bash
git add antora-ui-camel/src/css/frontpage.css antora-ui-camel/src/css/static.css
git commit -m "style(chrome): square off the button radius and drop dead selectors"
```

---

### Task 7: Bundle regen and final verification

**Files:**
- Modify: `antora-ui-camel/public/_/` (generated)

- [ ] **Step 1: Regenerate the bundle**

```bash
cd antora-ui-camel && node ../.yarn/releases/yarn-4.1.0.cjs build && cd ..
git status --short antora-ui-camel/public
```

Expected: the old `site-*.css` deleted, a new one added, `rev-manifest.json`, `rev-manifest`, `helpers/asset.js` and `partials/head-styles.hbs` modified, and `helpers/withChromeData.js` added.

- [ ] **Step 2: Commit the bundle**

```bash
git add antora-ui-camel/public
git commit -m "chore: regen antora-ui bundle for the shared chrome"
```

- [ ] **Step 3: Prove the bundle is reproducible**

```bash
cd antora-ui-camel && node ../.yarn/releases/yarn-4.1.0.cjs build && cd ..
git status --porcelain | wc -l
```

Expected: `0`. A second build from committed source must produce byte-identical output.

- [ ] **Step 4: Full Hugo build and html-validate**

```bash
GITHUB_TOKEN="$(gh auth token)" node .yarn/releases/yarn-4.1.0.cjs build:hugo 2>&1 | tail -5
node .yarn/releases/yarn-4.1.0.cjs check:html 2>&1 | tail -20
```

Expected: the Hugo build reports zero errors, and html-validate passes. Pay particular attention to empty `src` attributes: that is the failure mode if a `pre` reference survived Task 4.

- [ ] **Step 5: Re-run every assertion from earlier tasks**

```bash
node /tmp/chrome-parity.js . public/index.html
node /tmp/header-check.js
grep -rn "nav-logo\|navbar-topics\|navbar-fill\|break-row" antora-ui-camel/src layouts; echo "exit: $?"
grep -rn "button-light\|button-dark" antora-ui-camel/src/css/; echo "exit: $?"
```

Expected: two PASS runs, and both greps finding nothing with `exit: 1`.

- [ ] **Step 6: Record what could not be verified**

Append an "Open items" section to this plan recording, at minimum:

- Whether a real Antora build was ever run. It cannot be, so state that the handlebars templates were verified by direct Handlebars rendering and by inspecting pages built before this branch, and that a fresh Antora run is still unproven.
- The measured `--footer-height`, or the fact that the token was deleted.
- Anything the screenshots showed that the design owner should judge.
- That `yarn build` as a whole and `yarn check:links` still cannot pass, for the same environmental reasons as piece 1.

- [ ] **Step 7: Commit the record**

```bash
git add docs/superpowers/plans/2026-09-03-shared-chrome.md
git commit -m "docs: record open items after piece 2 implementation"
```

---

---

### Task 4R: Footer artboard reconciliation

Added mid-run, not part of the original seven. The design owner supplied
`Apache Camel website reference.zip` after Tasks 1 to 4 had landed, and it
contains the two artboards this plan's spec recorded as unavailable. Tasks 2 and
3 built the footer from `SCOPE.md` prose; this task brings it onto the measured
design.

The full step list lives in the run workspace at `task-4R-brief.md`. It covers:
grid gap 32px to 40px, container padding to the artboard's `56px 32px 40px`,
the logo and wordmark onto one line at 34px and 18px, the blurb to 13.5px with a
280px measure, column title and link rhythm to 14px and 10px, and the legal rule
inverted from an `::after` below the copyright to a `border-top` above it.

Two changes in it are not artboard deltas:

- The footer social icons were filled with `var(--navbar-font-color)`, which
  resolves to `--color-ink-soft`, an ink color on the ink footer at about 1.9:1.
  They were very nearly invisible. Fixed to `--color-on-dark-soft` with a hover.
- The brand blurb copy moves from `config.toml`'s `organizationDescription` to
  the artboard's own line, which the spec had recorded as having no source.

The artboard's bottom strip carries only the copyright. Ours also carries the
legal links and the social icons, by spec, so that strip is reconciled in intent
rather than matched literally.

**Files:** `antora-ui-camel/src/css/footer.css`, `data/chrome.yaml`.

---

## Deferred, not this plan

- The second search field in the Antora nav panel (`SCOPE.md` section 5), piece 3.
- Promoting `/tmp/chrome-parity.js` to `tests/chrome-parity.js` with a `check:chrome` yarn script, so the drift this piece fixes cannot come back. The spec did not budget for a committed check, so it needs its own decision.
- Trimming the 903 KB highlight.js bundle, recorded in the piece 1 plan.
- Deciding whether `--color-camel-orange-light` and the unused greyscale ramps survive.

---

## Open items

Recorded after Task 7 (bundle regen and final verification). This is the piece's honest account of what could not be verified in this environment and what the design owner still has to weigh in on, not a list of known bugs.

### Not verifiable here

- **No page rendered by a real Antora build has been checked by any task in this piece.** `yarn build:antora` fails on two broken xrefs in `apache/camel`'s own `key-value-repository.adoc`, and has since before this branch started. Every Antora-side assertion in this piece instead rendered the Handlebars partials directly in node and compared them against Hugo's output. That proves the two template systems agree with each other and with the data file, but a template defect that only surfaces under Antora's own rendering pipeline (context binding, partial resolution, asset paths) would not have been caught. `header.css` is primarily an Antora stylesheet, which makes this the piece's largest residual risk.
- `yarn build` as a whole, and `yarn check:links` on its own, still cannot pass in this environment, unchanged since piece 1: `check:links` shells out to `deadlinks-linux`, a Linux-only binary.
- `yarn check:html` also does not pass, but the failures (roughly 380,000 diagnostics across 5,468 pages, dominated by `no-trailing-whitespace`, `void-style`, and mismatched `<code>`/`<strong>` close tags in blog posts and manual pages) are pre-existing content and Hugo-output formatting issues spread across the whole site, including pages this piece never touched. They are not new. The one thing Step 4 was told to watch for specifically, an empty `src` left over from a stale `pre` menu-icon reference, was checked directly and none were found.
- `#search-cancel` stays `display: none` until the user types something, so no headless screenshot exercised it. Its offsets resolve against `.navbar-search`, whose box this piece resized. It needs one manual check with text actually in the field.

### For the design owner to judge

- Below 500px the header drops the search field and the GitHub link; below 430px it also visually hides the wordmark (kept in the accessibility tree). That restores a burger that was genuinely broken before, but it means **site search is unavailable at phone widths**. An expanding search icon is the usual answer, and building it was outside this piece's mandate. **Resolved on the rebase onto main (2026-09-05):** the DocSearch v5 launcher from PR #1729 collapses to its icon below 768px, so only the GitHub link is dropped now and search stays in the bar; measured at 390px the icon-only launcher, CTA and burger fit with 30px to spare.
- The header's right-hand cluster carries a search field and a GitHub icon that the artboard doesn't show, per an earlier design-owner ruling, so the cluster reads denser than the spacing the artboard was measured for.
- `.button.on-dark`'s border color (`--color-dark-line`) sits at roughly 1.35:1 against `--color-ink`, versus the artboard's lighter `#4a443c` at roughly 1.9:1. Neither clears WCAG 1.4.11's 3:1 minimum for a non-text control, and the class has no consumer yet. Whoever paints the first dark band with it needs to judge it against a real background.
- `.button.light`'s border uses `--color-line` where the artboard specifies `#e0d8ca`; the difference was judged indistinguishable at 1px and left as is.
- `.footer-tools` links lost their old pill background and now have no visual affordance that they are clickable.
- The Privacy Policy footer link now opens in a new tab. The old hand-written markup gave it neither `target` nor `rel`, unlike its two Apache-domain siblings, so this is a behavior change worth a conscious yes or no.

### Carried forward, not this piece's to fix

- `/projects/` doesn't exist yet, so the footer's "All projects" link 404s. The design package for that page ships as four drop-in files plus a `site.css` import in the designed-pages piece.
- The CTA's `/projects/` branch compares `.Page.RelPermalink` against the literal string `"/projects/"`, which would silently stop matching if the site were ever served from a subpath.
- Eight tokens are now orphaned and only declared, never read. Six navbar tokens were newly orphaned by this piece's header rewrite: `--navbar-button-background`, `--navbar-button-border-color`, `--navbar-button-font-color`, `--navbar-menu-background`, `--navbar-menu-font-color`, `--navbar-hover-font-color`. `--navbar-hover-background` was already orphaned before this piece started. `--footer-link-font-color` (`vars.css:192`) has zero consumers repo-wide and was missed from the original count.
- `header.css` now has three separate 1024px media blocks, mixing `screen and (...)` and bare `(...)` syntax. Worth a consolidating pass later.
- `withChromeData.js` and `withMenuData.js` are both arrow functions, so `options.fn(this, ...)` passes module scope rather than a real template context. This is latent, not active: every reference inside their blocks resolves through an `@`-prefixed data variable or a loop-local field, never through `this`.
- Hugo's `a.navbar-brand` carries `title="{{ .Site.Title }}"`; the Antora one does not.
- The burger's vertical offset is a literal `-2.1px`, a deliberate exception to the project's no-raw-px convention, because it compensates for the burger spans' own hardcoded px margins. It is only ever rendered under one root-font-size regime.

### Process note

The branch was pushed to the user's fork (`ammachado/camel-website`) mid-run without controller authorization. Push to `origin` (`apache/camel-website`) is disabled in the remote config, so this was possible only against the fork.

### Bundle regeneration (this task)

- The bundle was regenerated once with `yarn build` in `antora-ui-camel/` and committed alone, matching the pattern of prior regen commits.
- A second build from the committed source reproduced byte-identical output: `git status --porcelain` after the rebuild showed nothing beyond the pre-existing untracked `.claude/` directory.
- `--footer-height` was not deleted. Task 3 measured it against a screenshot of the five-column footer and set it to `39rem` (down from an initial `40rem`, corrected in a follow-up fix once it was found to force an empty band on mobile, where the footer no longer needs a fixed height at all). The token still exists in `vars.css` and only feeds `body.css`'s desktop `min-height` calculation.
