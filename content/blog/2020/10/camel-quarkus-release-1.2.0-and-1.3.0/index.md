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
[improvements and optimizations](https://camel.apache.org/blog/2020/10/Camel36-Whatsnew/) that make Camel Quarkus
even faster and more effective than before.

### New extensions and extensions newly supporting native mode

There are 10 new extensions:

* [AWS XRay](https://camel.apache.org/camel-quarkus/latest/reference/extensions/aws-xray.html) (JVM only)
* [HBase](https://camel.apache.org/camel-quarkus/latest/reference/extensions/hbase.html) (JVM only)
* [Headersmap](https://camel.apache.org/camel-quarkus/latest/reference/extensions/headersmap.html)
* [Jasypt](https://camel.apache.org/camel-quarkus/latest/reference/extensions/jasypt.html) (JVM only)
* [JCache](https://camel.apache.org/camel-quarkus/latest/reference/extensions/jcache.html) (JVM only)
* [LevelDB](https://camel.apache.org/camel-quarkus/latest/reference/extensions/leveldb.html)
* [LRA](https://camel.apache.org/camel-quarkus/latest/reference/extensions/lra.html) (JVM only)
* [Ribbon](https://camel.apache.org/camel-quarkus/latest/reference/extensions/ribbon.html) (JVM only)
* [Shiro](https://camel.apache.org/camel-quarkus/latest/reference/extensions/shiro.html) (JVM only)
* [Spark](https://camel.apache.org/camel-quarkus/latest/reference/extensions/spark.html) (JVM only)

And there are 16 promotions from JVM-only to native:

* [Atom](https://camel.apache.org/camel-quarkus/latest/reference/extensions/atom.html)
* [Browse](https://camel.apache.org/camel-quarkus/latest/reference/extensions/browse.html)
* [Caffeine Cache](https://camel.apache.org/camel-quarkus/latest/reference/extensions/caffeine.html)
* [Crypto (JCE)](https://camel.apache.org/camel-quarkus/latest/reference/extensions/crypto.html)
* [Disruptor](https://camel.apache.org/camel-quarkus/latest/reference/extensions/disruptor.html)
* [FOP](https://camel.apache.org/camel-quarkus/latest/reference/extensions/fop.html)
* [Geocoder](https://camel.apache.org/camel-quarkus/latest/reference/extensions/geocoder.html)
* [Jing](https://camel.apache.org/camel-quarkus/latest/reference/extensions/jing.html)
* [NSQ](https://camel.apache.org/camel-quarkus/latest/reference/extensions/nsq.html)
* [PostgresSQL Event](https://camel.apache.org/camel-quarkus/latest/reference/extensions/pgevent.html)
* [PostgresSQL Replication Slot](https://camel.apache.org/camel-quarkus/latest/reference/extensions/pg-replication-slot.html)
* [RSS](https://camel.apache.org/camel-quarkus/latest/reference/extensions/rss.html)
* [SSH](https://camel.apache.org/camel-quarkus/latest/reference/extensions/ssh.html)
* [String Template](https://camel.apache.org/camel-quarkus/latest/reference/extensions/stringtemplate.html)
* [uniVocity CSV](https://camel.apache.org/camel-quarkus/latest/reference/extensions/univocity-parsers.html)
* [Velocity](https://camel.apache.org/camel-quarkus/latest/reference/extensions/velocity.html)

Check the full list of supported extensions in the [extensions reference](https://camel.apache.org/camel-quarkus/latest/reference/index.html).

With Camel Quarkus 1.3.0, we got very close to supporting all components required by
[Camel K](https://camel.apache.org/camel-k/latest/index.html).

### Documentation

* Following [a request from a user](https://github.com/apache/camel-quarkus/issues/1781) Native since and JVM since
  versions are now kept in separate columns on our
  [Extensions reference pages](https://camel.apache.org/camel-quarkus/latest/reference/index.html)
* We have added a section about defining
  [Camel routes in XML](https://camel.apache.org/camel-quarkus/latest/user-guide/bootstrap.html)
* We now have a [Change log](https://github.com/apache/camel-quarkus/blob/master/CHANGELOG.md) updated by the CI.

## What's next?

We would like to promote
[more extensions](https://github.com/apache/camel-quarkus/issues?q=is%3Aissue+is%3Aopen+label%3Anative) to native.
Please upvote your favorites, or even better [contribute](https://camel.apache.org/camel-quarkus/latest/contributor-guide/index.html)!

We hope Camel Quarkus 1.3.0 brings some tangible value to you and we look forward to your feedback and participation!
