---
title: "Camel Quarkus 1.2.0 and 1.3.0 Released"
date: 2020-10-20
authors: ["ppalaga"]
categories: ["Releases", "Camel Quarkus"]
preview: "Camel Quarkus 1.2.0 and 1.3.0 Released"
summary: "The highlights of Camel Quarkus 1.2.0 and 1.3.0"
---

<sub><sup>Original image by <a href="https://commons.wikimedia.org/wiki/User:99of9">Toby Hudson</a> <a href="https://creativecommons.org/licenses/by-sa/3.0">CC BY-SA 3.0</a> via <a href="https://en.wikipedia.org/wiki/Camel_racing#/media/File:CamelRacingCamelCup2009Heat.JPG">Wikipedia</a></sup></sub>

## Why two releases one after another?

Camel Quarkus 1.2.0 was scheduled - with some reasonable time reserve - to be included in the Quarkus Platform release
1.9.0. The next day after we opened the voting, we realized that Camel 3.6.0 is going to be released in the coming days
and that it could actually catch Quarkus 1.9.0 too. Therefore we did one more release upgrading to Camel 3.6.0, so that
the freshly released [Quarkus Platform 1.9.0](https://quarkus.io/blog/quarkus-1-9-0-final-released/) contains the newest
and greatest Camel.

## What's new

First of all, Camel 3.6.0 alone brings a lot of
[improvements and optimizations](/blog/2020/10/Camel36-Whatsnew/) that make Camel Quarkus
even faster and more effective than before.

### New extensions and extensions newly supporting native mode

There are 10 new extensions:

* AWS XRay
* HBase
* Headersmap
* Jasypt
* JCache
* LevelDB
* LRA
* Ribbon
* Shiro
* Spark

And there are 16 promotions from JVM-only to native:

* Atom
* Browse
* Caffeine Cache
* Crypto (JCE)
* Disruptor
* FOP
* Geocoder
* Jing
* NSQ
* PostgresSQL Event
* PostgresSQL Replication Slot
* RSS
* SSH
* String Template
* uniVocity CSV
* Velocity

Check the full list of supported extensions in the [extensions reference](/camel-quarkus/next/reference/index.html).

With Camel Quarkus 1.3.0, we got very close to supporting all components required by
[Camel K](/camel-k/next/index.html).

### Documentation

* Following [a request from a user](https://github.com/apache/camel-quarkus/issues/1781) Native since and JVM since
  versions are now kept in separate columns on our
  [Extensions reference pages](/camel-quarkus/next/reference/index.html)
* We have added a section about defining
  [Camel routes in XML](/camel-quarkus/next/user-guide/defining-camel-routes.html)
* We now have a [Change log](https://github.com/apache/camel-quarkus/blob/master/CHANGELOG.md) updated by the CI.

## What's next?

We would like to promote
[more extensions](https://github.com/apache/camel-quarkus/issues?q=is%3Aissue+is%3Aopen+label%3Anative) to native.
Please upvote your favorites, or even better [contribute](/camel-quarkus/next/contributor-guide/index.html)!

We hope Camel Quarkus 1.3.0 brings some tangible value to you and we look forward to your feedback and participation!
