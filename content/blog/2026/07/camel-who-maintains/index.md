---
title: "Who Maintains Apache Camel: 19 Years, One Team, 100,000 Commits"
date: 2026-07-01
draft: false
authors: [davsclaus]
categories: ["Community"]
keywords: ["apache camel", "maintainers", "contributors", "open source", "community", "integration", "IBM", "Red Hat", "team", "who maintains"]
preview: "Apache Camel has had 1,500+ contributors over 19 years, but who actually maintains it day-to-day? The git history tells a remarkably consistent story: the same core engineering team, through four company transitions, has contributed 80–95% of all commits every single year since 2007."
---

Apache Camel has crossed **100,000 commits** from **1,500+ contributors** representing **450+ companies**. Those numbers paint a picture of a broad, thriving open source community — and that picture is real. But there's a more specific story inside the git history that's worth telling: *who actually maintains this project, day after day, year after year?*

The answer is remarkably consistent. A core engineering team has maintained Apache Camel since 2009 — and they're still here.

## The Same Team, Through Acquisitions

The core Camel team has stayed together through multiple acquisitions:

- **FuseSource** (2009–2012) — where the core team formed around Apache Camel
- **Red Hat** (2012–present) — FuseSource was acquired and the team continued at Red Hat. IBM acquired Red Hat in 2019, and the team is today part of IBM.

Through every transition, the same people continued working on the same codebase with the same mission.

## The Data

Every number below comes from the [git repository](https://github.com/apache/camel). Team membership is determined by commit email domains (`@ibm.com`, `@redhat.com`, `@fusesource.com`) cross-referenced with the official [team page](/community/team/) affiliations. Automated commits (bots, CI) are excluded. The percentages are a conservative floor — many team members use personal email addresses (`@gmail.com`, `@apache.org`) for commits, and the team page only reflects current affiliations, not past ones. The actual core team share is likely higher.

| Year | Total Commits | Core Team Commits | Core Team % | Company |
|------|--------------|-------------------|-------------|---------|
| 2007 | 1,173 | 940 | 80% | — |
| 2008 | 1,957 | 1,868 | 95% | — |
| 2009 | 2,725 | 2,624 | 96% | FuseSource |
| 2010 | 2,484 | 2,348 | 95% | FuseSource |
| 2011 | 2,448 | 2,243 | 92% | FuseSource |
| 2012 | 2,381 | 2,166 | 91% | FuseSource → Red Hat |
| 2013 | 2,487 | 2,210 | 89% | Red Hat |
| 2014 | 2,755 | 2,152 | 78% | Red Hat |
| 2015 | 3,655 | 3,110 | 85% | Red Hat |
| 2016 | 4,327 | 3,608 | 83% | Red Hat |
| 2017 | 4,439 | 3,550 | 80% | Red Hat |
| 2018 | 3,600 | 2,924 | 81% | Red Hat |
| 2019 | 6,735 | 5,739 | 85% | Red Hat |
| 2020 | 8,289 | 7,230 | 87% | Red Hat |
| 2021 | 6,243 | 5,678 | 91% | Red Hat |
| 2022 | 5,961 | 5,303 | 89% | Red Hat |
| 2023 | 5,740 | 5,090 | 89% | Red Hat |
| 2024 | 3,662 | 3,316 | 91% | Red Hat |
| 2025 | 2,464 | 2,199 | 89% | Red Hat / IBM |
| 2026 | 2,469 | 2,314 | 94% | Red Hat / IBM |

**19 years. Never below 78%. Typically 85–95%.**

## Current Top Committers

The following developers are the most active committers as of 2026, with affiliations from the official [team page](/community/team/):

| Committer | Affiliation | Active Since |
|-----------|-------------|-------------|
| Claus Ibsen | IBM | 2007 (19 years) |
| Andrea Cosentino | IBM | 2015 (11 years) |
| Otavio Piske | IBM | 2019 (7 years) |
| Guillaume Nodet | IBM | 2007 (19 years) |
| Aurélien Pupier | IBM | 2016 (10 years) |
| Federico Mariani | IBM | 2021 (5 years) |
| Pasquale Congiusti | IBM | 2019 (7 years) |
| Adriano Machado | Red Hat | 2022 (4 years) |
| Tom Cunningham | IBM | 2017 (9 years) |
| James Netherton | IBM | 2015 (11 years) |
| Luigi De Masi | IBM | 2019 (7 years) |
| Salvatore Mongiardo | IBM | 2023 (3 years) |
| Gregor Zurowski | Independent | 2013 (13 years) |

Claus Ibsen alone has contributed over **20,000 commits** since 2007, and Andrea Cosentino over **18,000**. These two have been the top two committers for most of the project's history.

## Not Just Code

The commit statistics only tell part of the story. The same core team also:

- **Triages and fixes bugs** — with a median fix time of 1–2 days (see [Camel by the Numbers](/blog/2026/06/camel-by-the-numbers/))
- **Answers user questions** on the [mailing list](https://lists.apache.org/list.html?users@camel.apache.org) — the primary support channel since 2007
- **Handles security vulnerabilities** — private triage, fixes, CVE coordination with the ASF Security Team, backports to all supported LTS lines
- **Cuts releases** — 300+ releases over 19 years, including multiple LTS lines maintained in parallel
- **Writes documentation** — user manuals, upgrade guides, component docs, migration recipes
- **Maintains backwards compatibility** — the `from().to()` pattern from [the very first commit in 2007](/blog/2026/06/camel-dna-19-years/) still compiles and runs unchanged today

## Community Contributions Matter

The 10–20% of commits from outside the core team are not token contributions. Companies like SAP and Talend contributed meaningfully in earlier years. Contributors from Amazon Web Services, Digibee, and many independent developers continue to fix bugs, add features, and improve components they use in production.

The project actively welcomes contributions — the modular architecture (350+ independent components) means you can contribute to `camel-kafka` without understanding `camel-salesforce`. Many contributors start by fixing a bug in one component and gradually expand their involvement.

But the sustained, daily maintenance — the bug triage, the security fixes, the release engineering, the backwards compatibility work, the dependency updates across 350+ components — that's the core team.

## What This Means

For users evaluating or depending on Apache Camel, the maintainer data tells a clear story:

**Continuity.** The people who wrote the code 10 years ago are still here to fix it. When you hit a bug in a component that was written in 2015, the person who wrote it is likely still an active committer. This kind of institutional memory is rare in open source.

**Responsiveness.** A dedicated, full-time engineering team means bugs get fixed in days, not months. The team doesn't depend on volunteer availability — this is their job, and it has been for nearly two decades.

**Stability.** Multiple acquisitions and the team stayed together. The project has survived business cycles, acquisitions, and technology shifts without losing its maintainers. That's a track record that matters when you're building on a framework for the long term.

## Learn More

- [Team Page](/community/team/) — full committer list with organizational affiliations
- [Camel by the Numbers](/blog/2026/06/camel-by-the-numbers/) — project statistics and adoption data
- [The DNA of Apache Camel](/blog/2026/06/camel-dna-19-years/) — how the core architecture survived 19 years unchanged
- [Community](/community/) — how to get involved
- [GitHub](https://github.com/apache/camel) — source code and contribution history

---

*All commit statistics in this post are derived from the [Apache Camel git repository](https://github.com/apache/camel). Team affiliations are from the official [team page](/community/team/). Automated commits (dependabot, GitHub Actions, Renovate) are excluded from all counts. Data collected June 2026.*
