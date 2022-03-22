---
title: "Camel 3 Release Stats"
date: 2022-03-23
draft: false
authors: ["assimbly"]
categories: ["Camel"]
preview: "Camel 3 Release Stats"
---

Many developers know that Apache Camel is one of the most active [Apache](https://apache.org/) projects. Consider the top 3 Apache Code Authors in 2021:

1.   Andrea Cosentino: 4,447 commits (352,346 insertions, 399,815 deletions)
2.   Claus Ibsen: 2,974 commits (555,245 insertions, 567,896 deletions)
3.   Mark Thomas: 2,509 commits (186,889 insertions, 117,182 deletions)

The first two places are occupied by Camel committers. In 2021 the Camel project also reached the second place when it's about the number of commits (9541), just behind [Superset](https://superset.apache.org/). 
But there are other stats that goes beyond lines of code and deeper than just the number of commits. 

# The release stats

The release stats gives in insight in how stabile a project is. Questions to answer:

* How many releases are there?
* What are the biggest releases?
* What are the totals and averages?

This blog answers these questions for Camel 3 (so far). The major release was released on 28th of November 2019. Let's get into some numbers...


## Release Numbers

* Number of 3.x releases: 41
* Number of RC releases: 3
* Number of Major releases: 1
* Number of Minor releases: 14
* Number of Patch releases: 22
* Number of Long Term Support releases: 4

---
* Release with the most issues solved: 3.1.0 (289)
* Release with the most bugs fixed: 3.5.0 (70)
* Release with the most improvements: 3.1.0 (131)
* Release with the most features: 3.5.0 (131)
---
* Fastest release after the previous one: 16 days (3.6.0)
* Longest release after the previous one: 98 days (3.12.0)


## Release by number of issues solved

| Release | Date       | Total | Type        |
| ------- | ---------- | ----- | ----------- |
| 3.0.0   | 28/11/2019 | 306   | Major **      |
| 3.1.0   | 27/02/2020 | 289   | Minor       |
| 3.5.0   | 04/09/2020 | 243   | Minor       |
| 3.15.0  | 04/02/2022 | 218   | Minor       |
| 3.10.0  | 20/05/2021 | 211   | Minor       |
| 3.12.0  | 04/10/2021 | 205   | Minor       |
| 3.7.0   | 16/12/2020 | 185   | Minor (LTS) |
| 3.8.0   | 13/02/2021 | 166   | Minor       |
| 3.9.0   | 28/03/2021 | 162   | Minor       |
| 3.2.0   | 06/04/2020 | 160   | Minor       |
| 3.6.0   | 20/09/2020 | 152   | Minor       |
| 3.3.0   | 15/05/2020 | 148   | Minor       |
| 3.4.0   | 18/06/2020 | 148   | Minor       |
| 3.13.0  | 12/11/2021 | 118   | Minor       |
| 3.14.0  | 16/12/2021 | 114   | Minor (LTS) |
| 3.11.0  | 28/06/2021 | 102   | Minor (LTS) |

** Includes release candidates

Note that releases after LTS releases tend to be the biggest

## Totals and avarages **

* Total number of issues solved: 2927
* Total number of issues bugs: 799
* Total number of issues improvements: 1180
* Total number of issues features: 305
---
* Average time between minor releases: 43 days
* Average number of issues solved: 155
---
 
** The totals and average release stats rules out patch releases to avoid duplicated issues. That doesn't mean of course patch releases aren't important.
Exactly the opposite, when more projects would put that much attention to LTS Patch releases as Camel, then the world would be a happier place...

Of course this wasn't the last release of Camel 3, 3.16.0 is just around the corner.

**Sources:**

* [Camel releases](camel.apache.org/releases/)
* [Apache by the Digit](https://blogs.apache.org/foundation/entry/apache-in-2021-by-the)
* [Gist with release numbers](https://gist.github.com/assimbly/dc7cbd9aa90b67e42e5f66a84aae996f)

