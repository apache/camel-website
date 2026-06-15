---
title: "Apache Camel: 19 Years of Continuous Development — 272 Releases, 100,000 Commits, Zero Gaps"
date: 2026-06-15
draft: false
authors: [davsclaus]
categories: ["Features"]
preview: "Apache Camel has been in continuous active development since 2007 — 232 consecutive months of commits with no gaps, 272 releases on Maven Central, and a new release every 15 days. The project has never gone more than 3 days without a commit since 2015. This is not a recent AI-era phenomenon — Camel's track record spans 19 years, 4 major versions, and over 1,500 contributors."
---

Apache Camel has shipped 272 production releases over 19 years without a single month of
inactivity. The project averages a new release every 15 days, maintains up to 10 release lines
in parallel, and has accumulated 100,000+ commits from over 1,500 contributors since 2007.
This track record is not a recent development — it has been sustained continuously since well
before the current wave of AI-driven open-source activity. This post presents the evidence.

In our [previous post](/blog/2026/06/camel-bug-fix-track-record/), we looked at how the
community handles bugs — 7,070 fixed with a median resolution time of 1 day. This companion
post answers a different question: **will this project still be here, actively maintained,
when you need it?**

## 232 months without a break

Since the very first commit in March 2007, there has been **at least one commit every single
month** — 232 consecutive months as of June 2026. Not a single month of inactivity in 19 years.

But "at least one commit per month" is a low bar. What does the daily picture look like?

| Year | Active Days | Out of | Coverage |
|------|-------------|--------|----------|
| 2008 | 319 | 366 | 87% |
| 2010 | 335 | 365 | 92% |
| 2012 | 346 | 366 | 95% |
| 2014 | 336 | 365 | 92% |
| 2016 | 366 | 366 | 100% |
| 2018 | 341 | 365 | 93% |
| 2020 | 366 | 366 | 100% |
| 2022 | 351 | 365 | 96% |
| 2024 | 358 | 366 | 98% |
| 2025 | 356 | 365 | 98% |

Since 2008, the project has had commits on **92–100% of all days in every year**. That's not a
seasonal project with bursts of activity. It's a continuous operation.

**The longest silence since 2015 is 3 days** — over Christmas/New Year. The all-time record was 10 days
in April 2007, in the project's first weeks. Since the project matured, it has essentially never
gone quiet.

## 272 releases — a new one every 15 days

Apache Camel has published **272 GA releases** to Maven Central since the first release on
July 2, 2007. 272 production-ready releases that users can depend on.
Milestones and release candidates are only used during major version transitions (2→3, 3→4).

Here is the full release history by year, broken down by release type:

| Year | Major | Minor | Patch | Total |
|------|-------|-------|-------|-------|
| 2007 | 1 | 2 | — | 3 |
| 2008 | — | 3 | — | 3 |
| 2009 | 1 | 2 | 2 | 5 |
| 2010 | — | 4 | 2 | 6 |
| 2011 | — | 4 | 7 | 11 |
| 2012 | — | 1 | 12 | 13 |
| 2013 | — | 2 | 11 | 13 |
| 2014 | — | 2 | 9 | 11 |
| 2015 | — | 2 | 10 | 12 |
| 2016 | — | 2 | 10 | 12 |
| 2017 | — | 2 | 12 | 14 |
| 2018 | — | 3 | 9 | 12 |
| 2019 | 1 | 1 | 12 | 14 |
| 2020 | — | 8 | 9 | 17 |
| 2021 | — | 7 | 14 | 21 |
| 2022 | — | 6 | 13 | 19 |
| 2023 | 1 | 5 | 22 | **28** |
| 2024 | — | 6 | 14 | 20 |
| 2025 | — | 7 | 19 | **26** |
| 2026* | — | 4 | 8 | 12 |
| **Total** | **4** | **73** | **195** | **272** |

*2026 is partial (through June)*

**71.7% of all releases are patch releases** — bug fixes and security patches shipped to existing
release lines. That's not a project chasing features at the expense of stability. For every
new-feature release, there are nearly three maintenance releases keeping production users safe.

The project has shipped **10 or more releases every year for 16 consecutive years** (2011–2026).
That streak has never been broken — through major version transitions, global events, and
the complete rewrite from Camel 2.x to 3.x to 4.x.

In the last 5 years (2021–2026), the pace has been **126 releases**, averaging a new release
**every 15 days**. The median gap between releases is just 13 days.

## The gap analysis: what's the worst case?

For an enterprise dependency, the question isn't just "how often do they release?" — it's
"what's the longest I might wait?"

Here are the largest gaps between consecutive GA releases on Maven Central — across the project's
entire history:

| Gap | Between | Period |
|-----|---------|--------|
| 174 days | 1.2.0 → 1.3.0 | Oct 2007 → Apr 2008 |
| 109 days | 1.5.0 → 1.6.0 | Oct 2008 → Feb 2009 |
| 106 days | 1.3.0 → 1.4.0 | Apr 2008 → Jul 2008 |
| 105 days | 2.4.0 → 2.5.0 | Jul 2010 → Oct 2010 |

Every gap longer than 100 days occurred **before 2011**, when the project had fewer than 20
contributors and was maintaining a single release line.

**Since 2015**, the largest gap between any two releases is **80 days** — during the Camel 3.0
preparation in summer 2019. Since 2021, the maximum gap has been **50 days**.

## 4 major versions in 19 years

The project has gone through exactly **4 major releases** — and the timing tells its own story:

| Transition | Gap | What changed |
|-----------|-----|-------------|
| 1.0 → 2.0 | 2.1 years | Component model redesign |
| 2.0 → 3.0 | 10.3 years | Jakarta EE, Java 11+, modular architecture |
| 3.0 → 4.0 | 3.7 years | Java 17+, virtual threads, Camel DSL |

Camel 2.x ran for **over a decade** — from August 2009 to May 2021, when the last 2.25.4 patch
shipped. That's the kind of stability enterprises need. The 2.x line alone produced **25 minor
releases and 96 patch releases** — 121 releases on a single major version.

Each major version has followed the same pattern:

| Version | Minor Releases | Patch Releases | Total | Active Period |
|---------|---------------|----------------|-------|---------------|
| Camel 1.x | 6 | 4 | 10 | 2007 – 2010 |
| Camel 2.x | 25 | 96 | 121 | 2009 – 2021 |
| Camel 3.x | 22 | 57 | 79 | 2019 – 2025 |
| Camel 4.x | 20 | 38 | 58 | 2023 – present |

### The Camel 4.x LTS model

Starting with Camel 4.x, the project introduced a formal **LTS (Long Term Support)** model.
Non-LTS minor releases ship roughly monthly with new features and improvements. Every few
months, one of these is designated as an LTS release and receives ongoing patch releases for
approximately one year.

| LTS Line | Patch Releases | Active Period |
|----------|---------------|---------------|
| 4.0.x | 7 | Aug 2023 – Aug 2024 |
| 4.4.x | 6 | Feb 2024 – Jan 2025 |
| 4.8.x | 10 | Sep 2024 – Sep 2025 |
| 4.10.x | 10 | Feb 2025 – Feb 2026 |
| 4.14.x | 8 | Aug 2025 – present |
| 4.18.x | 3 | Feb 2026 – present |

The 15 non-LTS lines (4.1, 4.2, 4.3, 4.5, ...) each shipped a single feature release. The 6
LTS lines produced **44 releases** — 75% of all Camel 4.x releases.

This model gives organizations a clear choice: **track the latest features** by following non-LTS
releases, or **pin to an LTS line** and receive bug and security fixes for a full year without
any feature churn. Either way, the release cadence never stops.

## Multiple release lines, maintained in parallel

What makes Camel's release record especially strong is how many lines are maintained simultaneously.
The community doesn't abandon older versions the moment a new one ships — it keeps them alive
with patch releases while users plan their migration.

Here is the number of distinct release lines (e.g. 4.14.x, 4.18.x) that received at least one
release each year:

| Year | Lines | Year | Lines |
|------|-------|------|-------|
| 2011 | 4 | 2019 | 5 |
| 2012 | 4 | 2020 | **9** |
| 2013 | 4 | 2021 | **10** |
| 2014 | 4 | 2022 | 8 |
| 2015 | 4 | 2023 | **9** |
| 2016 | 4 | 2024 | **9** |
| 2017 | 4 | 2025 | **10** |
| 2018 | 5 | 2026* | 6 |

In 2021 and 2025, the community maintained **10 distinct release lines** in a single year.
That includes LTS lines receiving security patches, the current development line shipping new
features, and transitional lines bridging major version upgrades.

This is the "upgrade on your schedule" promise, backed by data.

## 16-year release streak

To put the cadence in perspective, here is the unbroken streak of years with 10+ releases:

2011 → 2012 → 2013 → 2014 → 2015 → 2016 → 2017 → 2018 → 2019 → 2020 → 2021 → 2022 → 2023 → 2024 → 2025 → 2026

**16 consecutive years.** Through every major transition, older release lines continued
receiving patch releases. Users were never forced into a rushed upgrade — the prior version
kept getting fixes while they planned their migration.

## The community behind the commits

**100,000+ commits** don't happen by accident. Here is how the contributor base has grown:

| Year | Commits | Contributors | Year | Commits | Contributors |
|------|---------|-------------|------|---------|-------------|
| 2007 | 1,177 | 7 | 2017 | 5,337 | 213 |
| 2008 | 2,122 | 12 | 2018 | 4,607 | 191 |
| 2009 | 3,313 | 14 | 2019 | 7,887 | 226 |
| 2010 | 2,554 | 18 | 2020 | 8,882 | 269 |
| 2011 | 3,230 | 26 | 2021 | 6,973 | 236 |
| 2012 | 3,983 | 24 | 2022 | 7,142 | 224 |
| 2013 | 4,235 | 50 | 2023 | 8,208 | 221 |
| 2014 | 4,099 | 99 | 2024 | 6,563 | 165 |
| 2015 | 4,995 | 144 | 2025 | 5,282 | 153 |
| 2016 | 5,596 | 199 | 2026* | 3,226 | 92 |

The peak year was **2020 with 8,882 commits from 269 contributors**. That's the Camel 3.x
stabilization period — the community responding to its largest-ever migration with its
largest-ever effort.

Even after the peak, the project has sustained **5,000–8,000 commits per year**. The 2026 pace
(3,226 in ~5 months) shows no signs of slowing down, driven by AI
integration, the new TUI developer tools, and continued platform expansion.

## A stable core team — no bus factor

A common risk with open-source projects is key-person dependency. Apache Camel has avoided this
through **generational overlap** — each era's core team was already active before the previous
generation stepped back. There was never a clean break or a scramble to find replacements.

The commit counts below are based on git author data. The project started in Subversion, where
community patches were committed by a committer with a credit in the commit message — so the
early years undercount the actual community involvement.

The top 20 contributors by commit count, with merged git identities:

| Contributor | Commits | Years Active | Span |
|------------|---------|-------------|------|
| Claus Ibsen | ~26,900 | 19 | 2007–now |
| Andrea Cosentino | ~18,500 | 13 | 2011–now |
| Otavio Piske | ~4,600 | 8 | 2019–now |
| Willem Jiang | ~4,100 | 15 | 2008–2022 |
| Guillaume Nodet | 1,435 | 20 | 2007–now |
| James Strachan | 1,385 | 7 | 2007–2013 |
| Babak Vahdat | 906 | 14 | 2012–2025 |
| Hadrian Zbarcea | 757 | 8 | 2007–2014 |
| Luca Burgazzoli | 677 | 12 | 2013–2024 |
| Jonathan Anstey | 573 | 12 | 2008–2019 |
| Christian Mueller | 532 | 10 | 2010–2020 |
| James Netherton | 487 | 12 | 2015–now |
| Aurélien Pupier | 471 | 11 | 2016–now |
| Zoran Regvart | 468 | 10 | 2016–2025 |
| Pascal Schumacher | 437 | 7 | 2015–2021 |
| Gregor Zurowski | 413 | 14 | 2013–now |
| Pasquale Congiusti | 399 | 8 | 2019–now |
| Alex Dettinger | 328 | 9 | 2016–now |
| Nicolas Filotto | 309 | 5 | 2022–now |
| Federico Mariani | 283 | 6 | 2021–now |

What stands out:

- **8 contributors with 10+ year tenures.** Guillaume Nodet has been active for 20 years,
  Claus Ibsen for 19, Willem Jiang for 15, Babak Vahdat and Gregor Zurowski for 14 each.
- **Generational overlap, not handoff.** James Strachan founded the project (2007–2013),
  but Claus Ibsen was already contributing patches and code reviews from 2007. Andrea
  Cosentino started in 2011 while
  the founding team was still active. Otavio Piske joined in 2019, years before any
  predecessor left. Each generation ramps up while the previous one is still fully engaged.
- **Deepening bench.** The concentration of commits among the top 3 contributors has dropped
  from 94% in 2007 to **53% in 2026** — the most distributed the project has ever been.
  The long tail of contributors is growing, not shrinking.
- **20 people with 280+ commits spanning 5+ years.** This is not a project that depends on one
  or two individuals. It is a deep bench of experienced engineers who know the codebase
  intimately.

## Weekends and holidays? Still shipping.

Open-source sustainability isn't just about volume — it's about consistency. Does the project
go dark on weekends? Over the holidays?

- **11.3% of all commits** (9,210) are on weekends
- **Every December** since 2015 has seen 160–500+ commits
- **Every Christmas week** (Dec 24–31) since 2015 has had commits — from 5 to 109

This doesn't mean maintainers are expected to work holidays. It means the contributor base is
global and diverse enough that someone, somewhere, is always working on Camel.

## What "always on" means for your organization

When you choose a dependency for production systems, you're not just evaluating today's features.
You're betting on the project's future. Here is what 19 years of data tells you about Apache Camel:

**It won't disappear.** 232 consecutive months of activity. The project has survived every
technology shift — SOA, microservices, cloud-native, serverless, AI — by adapting, not by starting over.

**Fixes ship fast.** A new release every 15 days means your critical patch isn't sitting in
a queue waiting for a quarterly release cycle.

**Major transitions don't break you.** Through three major version bumps, the prior version
line kept receiving patch releases — up to 10 release lines maintained in parallel.
No "upgrade now or get nothing."

**Maintenance comes first.** 72% of all releases are patch releases — bug fixes and security
patches to existing lines. The project ships nearly three maintenance releases for every
feature release.

**The community is broad enough to sustain itself.** 1,500+ contributors over 19 years,
with 8 core committers spanning 10+ years each. The project has never depended on a single
person — generational overlap ensures continuity.

**The governance works.** The Apache Software Foundation's release process — requiring community
votes, license compliance, and reproducible builds — adds overhead. But 272 successful releases
prove that overhead pays for itself in reliability.

## The data is public

Every number in this post is verifiable:

- [GitHub repository](https://github.com/apache/camel) — 100,000+ commits, full history since 2007
- [Maven Central](https://repo1.maven.org/maven2/org/apache/camel/camel-core/) — 272 GA releases with publish dates
- [Apache Camel JIRA](https://issues.apache.org/jira/projects/CAMEL) — issue tracking since day one
