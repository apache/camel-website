---
title: "The Always-On Project: 19 Years of Uninterrupted Apache Camel Development"
date: 2026-06-08
draft: true
authors: [davsclaus]
categories: ["Features"]
preview: "232 consecutive months of commits, 272 releases on Maven Central, a new release every 15 days, and never more than 3 days of silence since 2015. The data behind Apache Camel's unbroken track record."
---

In our [previous post](/blog/2026/06/camel-bug-fix-track-record/), we looked at how the Apache
Camel community handles bugs — 7,070 fixed with a median resolution time of 1 day. But bug fixes
are only part of the story. The deeper question for any organization evaluating an open-source
dependency is: **will this project still be here, actively maintained, when we need it?**

We went through 19 years of [git history](https://github.com/apache/camel) and
[Maven Central](https://repo1.maven.org/maven2/org/apache/camel/camel-core/) data to find out.

The short version: **81,234 commits. 272 releases. 232 consecutive months of activity. Zero gaps.**

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
| 2016 | 367 | 366 | 100% |
| 2018 | 341 | 365 | 93% |
| 2020 | 367 | 366 | 100% |
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
July 2, 2007. No milestones, no release candidates — 272 production-ready releases
that users can depend on.

Here is the full release history by year:

| Year | Releases | Year | Releases |
|------|----------|------|----------|
| 2007 | 3 | 2017 | 14 |
| 2008 | 3 | 2018 | 12 |
| 2009 | 5 | 2019 | 14 |
| 2010 | 6 | 2020 | 17 |
| 2011 | 11 | 2021 | 21 |
| 2012 | 13 | 2022 | 19 |
| 2013 | 13 | 2023 | **28** |
| 2014 | 11 | 2024 | 20 |
| 2015 | 12 | 2025 | **27** |
| 2016 | 12 | 2026* | 11 |

*2026 is partial (through June)*

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

## 16-year release streak

To put the cadence in perspective, here is the unbroken streak of years with 10+ releases:

2011 → 2012 → 2013 → 2014 → 2015 → 2016 → 2017 → 2018 → 2019 → 2020 → 2021 → 2022 → 2023 → 2024 → 2025 → 2026

**16 consecutive years.** During this streak, the project went through:

- The Camel **2.x** era (2011–2019): 25 minor releases, each with multiple patch releases
- The Camel **3.x** era (2019–2023): major migration to Jakarta EE, Java 11+, modular architecture
- The Camel **4.x** era (2023–present): Java 17+, virtual threads, 50+ new AI components

Through every major transition, older release lines continued receiving patch releases.
Users were never forced into a rushed upgrade — the prior version kept getting fixes while
they planned their migration.

## The community behind the commits

**81,234 commits** don't happen by accident. Here is how the contributor base has grown:

| Year | Commits | Contributors | Year | Commits | Contributors |
|------|---------|-------------|------|---------|-------------|
| 2007 | 1,173 | 7 | 2017 | 4,439 | 200 |
| 2008 | 1,954 | 12 | 2018 | 3,602 | 184 |
| 2009 | 2,728 | 14 | 2019 | 6,734 | 218 |
| 2010 | 2,484 | 18 | 2020 | 8,299 | 265 |
| 2011 | 2,449 | 26 | 2021 | 6,314 | 229 |
| 2012 | 2,381 | 24 | 2022 | 6,186 | 212 |
| 2013 | 2,500 | 50 | 2023 | 6,106 | 195 |
| 2014 | 2,759 | 91 | 2024 | 5,484 | 152 |
| 2015 | 3,640 | 136 | 2025 | 4,457 | 144 |
| 2016 | 4,332 | 192 | 2026* | 3,213 | 91 |

The peak year was **2020 with 8,299 commits from 265 contributors**. That's the Camel 3.x
stabilization period — the community responding to its largest-ever migration with its
largest-ever effort.

Even after the peak, the project has sustained **4,000–6,000 commits per year**. The 2026 pace
(3,213 in ~5 months) projects to roughly 7,400 for the full year — a resurgence driven by AI
integration, the new TUI developer tools, and continued platform expansion.

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
line kept receiving patch releases. No "upgrade now or get nothing."

**The community is broad enough to sustain itself.** 1,100+ contributors over 19 years.
No single point of failure.

**The governance works.** The Apache Software Foundation's release process — requiring community
votes, license compliance, and reproducible builds — adds overhead. But 272 successful releases
prove that overhead pays for itself in reliability.

## The data is public

Every number in this post is verifiable:

- [GitHub repository](https://github.com/apache/camel) — 81,234 commits, full history since 2007
- [Maven Central](https://repo1.maven.org/maven2/org/apache/camel/camel-core/) — 272 GA releases with publish dates
- [Apache Camel JIRA](https://issues.apache.org/jira/projects/CAMEL) — issue tracking since day one
