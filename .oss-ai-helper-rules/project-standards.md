# Project Standards

This rule file contains build tools, commands, and code style constraints for the project. Commands read this file to determine how to build, test, and format code.

- **Build tool:** Yarn workspaces (Node.js, version in `.nvmrc`) driving Antora, Hugo and gulp. `README.md` is the build documentation ("Build with Node and yarn", "Build the website and Antora theme", "Preview website locally", "Contribute changes"); read it before changing the build.
- **Build command:** `yarn build` — runs `build:antora` (Antora pulls the documentation sources listed in `antora-playbook-production.yml` and renders them into `documentation/`), `build:hugo` (Hugo renders the website pages, blog and releases from `content/`, `layouts/` and `data/` into `public/`), `build:post` (sitemap, `.htaccess`, and the Markdown/`llms.txt` pipeline) and `build:minify`. First-time setup: `yarn workspaces foreach --all install`, then `cd antora-ui-camel && yarn build` to produce `antora-ui-camel/build/ui-bundle.zip`, which the website build needs; `yarn build-all` builds the theme and the website in one go.
- **Test command:** `yarn test` — Node's built-in `node:test`, files in `test/*-test.js`, covering the gulp helpers and scripts. Not run by CI, so run it locally.
- **Test with coverage command:** _(none)_
- **Format command:** _(none)_ for the website; `yarn format` inside `antora-ui-camel/` for the theme
- **Module-specific build:** yes — the Antora UI theme (`antora-ui-camel/`) is its own workspace with its own `yarn build`; it changes rarely and must be rebuilt for theme changes to show
- **Parallelized Maven:** n/a
- **Build notes:**
  - Hugo fetches release notes and author data from the GitHub API; an unauthenticated build fails with rate-limit errors. Set `GITHUB_TOKEN`, or `HUGO_PARAMS_GitHubUsername` and `HUGO_PARAMS_GitHubToken` (for example `HUGO_PARAMS_GitHubUsername=<user> HUGO_PARAMS_GitHubToken=$(gh auth token) yarn build`)
  - A full build fetches every documentation repository and takes 10+ minutes; `NODE_OPTIONS="--max_old_space_size=4096"` if Node runs out of heap
  - `CAMEL_ENV=production` enables the HTML minification used for the live site (`development` is the default)
  - `yarn preview` serves `public/` on http://localhost:1313/ with live reload for Hugo content; Antora content and theme changes need a rebuild (see the README)
  - The Markdown/`llms.txt` pipeline alone (`gulp/tasks/generate-markdown.js`, `gulp/helpers/*`, `llms-txt-template.md`) can be exercised against an existing `public/` with `yarn build:markdown`
  - `yarn checks` runs the link, HTML and redirect checks that CI runs after the build
- **Code style restrictions:**
  - Two content systems: Hugo owns the website pages (`content/`, `layouts/`, `data/`, `config.toml`, `static/`); Antora owns the documentation (user manual, components, sub-projects), whose AsciiDoc sources live in the upstream repositories listed in the Antora playbook — documentation content is fixed upstream, not here
  - Build scripts are CommonJS (`gulp/`, `scripts/`); tests use `node:test` with `node:assert/strict`
  - The Antora UI theme (`antora-ui-camel/`) is Handlebars partials plus CSS/JS; rebuild the UI bundle after changing it
  - Do NOT add new dependencies without justification (Dependabot and `yarn check:dependencies` police the lockfile)

## Version
e961a0b5742be5bda18e4fd8b31d36fd68a91ac7
