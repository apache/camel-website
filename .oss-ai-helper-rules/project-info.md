# Project Information

This rule file contains project-specific metadata used by OSS Helper commands. Commands detect the current project by matching `git remote get-url origin` against the remote pattern below.

- **Remote pattern:** `apache/camel-website`
- **GitHub repo:** `apache/camel-website`
- **Issue tracker:** GitHub
- **Issue tracker URL:** `https://github.com/apache/camel-website/issues/`
- **Issue ID format:** numeric (e.g., `1764`)
- **SonarCloud component key:** _(none)_
- **Documentation URL:** `https://camel.apache.org` (the site this repository builds; `README.md` documents the build)
- **Related repositories:** `apache/camel` — the Antora documentation sources (user manual, components) and the Camel Catalog are pulled from there at build time; a problem in documentation *content* is fixed upstream, this repository only owns the Hugo website pages, the blog, the Antora UI and the build pipeline
- **Create-issue supported:** yes

## Version
e961a0b5742be5bda18e4fd8b31d36fd68a91ac7
