---
title: "Apache Camel 2020 Release Schedule"
date: 2020-03-06
author: Claus Ibsen
draft: false
categories: ["Roadmap"]
preview: Apache Camel 2020 Release Schedule
---

The Apache Camel project is moving to release schedule with Long Term Support (LTS) and non-LTS releases.

The plan is to have 2 yearly LTS releases and then non-LTS releases in between.

This allows the Camel project to innovate and move much faster in non-LTS releases.

And as well to offer production stable branches (LTS) where end users can stay on
for a longer period of time and get CVEs and important/critical bug fixes only.
On these LTS branches, we plan to avoid introducing new features, improvements etc, and
keep changes with production in-mind only. However exceptions can be made.

For non-LTS releases then we plan to not release patch releases, for example there will
not be 3.1.1, 3.1.2 patch releases for the non-LTS release of Camel 3.1.0.

Other projects like Java JDK have moved to LTS and non-TLS releases as well. So we are doing the same,
but our LTS is limited to a 1-year schedule (typically same timeframe for Camel 2.x).

## Release Schedule

The tentative release schedule for 2020 is as follows:

| Release | Date | LTS | EOL | Java | 
|---------|------|-----|-----|------|
| 3.1.0 | Feb 2020 | No |  | 8, 11 |
| 3.2.0 | Apr 2020 | No |  | 8, 11 |
| 3.3.0 | Jun 2020 | Yes | Jun 2021 | 8, 11 |
| 3.4.0 | Aug 2020 | No | | 11 |
| 3.5.0 | Oct 2020 | No | | 11 | 
| 3.6.0 | Dec 2020 | Yes | Dec 2021 | 11 |

NOTE: The schedule is tentative and subject for change
(for example date's may slip into the following month). 

So for 2020, we have planned 2 LTS releases, Camel 3.3.x and 3.6.x where we will release
patch releases. The LTS releases are generally supported for 1-year
(latest 2 LTS releases are actively supported)

For each Camel release, we will mark in the release notes whether its a LTS or non-LTS release.

## Java 8 and 11

Java 8 is planned to be dropped after the first Camel 3 LTS release (currently
planned as Camel 3.3). 

Java 8 was originally intended to be dropped entirely for Camel 3,
but we wanted to allow end users to migrate from Camel 2.x to 3.x without having
to also upgrade from Java 8 to 11 at the same time. So this means that users
can safely migrate from Camel 2.x to Camel 3.3.x and stay on Java 8 and have this supported
until June 2021. But we encourage Camel users to move to Java 11 when possible.
