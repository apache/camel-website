---
title: "Apache Camel 2020 Release Schedule"
date: 2020-03-06
authors: [davsclaus]
draft: false
categories: ["Roadmap"]
preview: The Apache Camel project is moving to release schedule with Long Term Support (LTS) and non-LTS releases.
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

{{< table >}}
| Release | Date     | LTS | EOL      | Java  
|---------|----------|-----|----------|------
| 2.25.0  | Jan 2020 | Yes | Jan 2021 | 8
| 3.1.0   | Feb 2020 | No  |          | 8, 11
| 3.2.0   | Apr 2020 | No  |          | 8, 11
| 3.3.0   | May 2020 | No  |          | 8, 11
| 3.4.0   | Jun 2020 | Yes | Jun 2021 | 8, 11
| 3.5.0   | Aug 2020 | No  |          | 8, 11
| 3.6.0   | Oct 2020 | No  |          | 8, 11
| 3.7.0   | Dec 2020 | Yes | Dec 2021 | 8, 11, 14
{{< /table >}}

**NOTE:** The schedule is tentative and subject for change
(for example date's may slip into the following month). 

So for 2020, we have planned 2 LTS releases, Camel 3.4.x and 3.7.x where we will release
patch releases. The LTS releases has support for 1-year.

For each Camel release, we will mark in the release notes whether it's a LTS or non-LTS release.

## Java 8

Java 8 is still supported, but at some time in the future we will drop Java 8.
Java 8 is best effort supported as Java 11 is the primary version used for development, testing, and QA.

## Java 11

Java 11 is the primary supported version.

## Java 14

We have not yet started working on support for Java 14. However after the first LTS release
where we drop Java 8, then this will give us space to work on support for Java 14.
