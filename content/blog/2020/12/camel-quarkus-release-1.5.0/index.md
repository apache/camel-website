---
title: "Camel Quarkus 1.5.0 Released"
date: 2020-12-18
authors: ["ppalaga"]
categories: ["Releases", "Camel Quarkus"]
preview: "Camel Quarkus 1.5.0 Released"
summary: "The highlights of Camel Quarkus 1.5.0"
---

<sub><sup>Original image by <a href="https://commons.wikimedia.org/wiki/User:99of9">Toby Hudson</a> <a href="https://creativecommons.org/licenses/by-sa/3.0">CC BY-SA 3.0</a> via <a href="https://en.wikipedia.org/wiki/Camel_racing#/media/File:CamelRacingCamelCup2009Heat.JPG">Wikipedia</a></sup></sub>

We are pleased to announce the release 1.5.0 of Camel Quarkus! What's inside?

## Camel 3.7.0

Camel Quarkus 1.5.0 is based on Camel 3.7.0 LTS bringing new features and improvements relevant to Camel Quarkus:

### CSimple language

[CSimple language](/components/next/languages/csimple-language.html) is a new variant of the well known [Simple language](/components/next/languages/simple-language.html). The "C" in its name stands for "compiled" and indeed, the expressions are compiled into Java byte code or native code at application build time. This brings significant performance boost at runtime. Camel Quarkus 1.5.0 brings experimental support for the CSimple language in both JVM and native modes.

### Lightweight mode

In lightweight mode, Camel removes all references to the routes model after startup which allows the JVM to garbage collect all model objects and unload classes, freeing up memory. The downside is that after new Camel routes cannot be added once the application has fully started.

Lightweight mode can be activated by adding the `camel-quarkus-main` dependency and adding

```
camel.main.lightweight=true
```

to `application.properties`.

Check [Camel 3.7 what's new](/blog/2020/12/Camel37-Whatsnew/) blog post by Claus Ibsen for more information about Camel 3.7.0.

## New extensions

As usual, the new Camel Quarkus release brings some new extensions:

* CSimple language mentioned above
* Micrometer - in addition to MicroProfile Metrics, you can now collect your metrics using [Micrometer](https://micrometer.io/). See also [this blog post](https://quarkus.io/blog/micrometer-metrics/) by Ken Finnigan.
* Minio (JVM only)
* AtlasMap (JVM only)

The following extensions are now supported in native mode:

* Protobuf
* Avro RPC
* SCP
* Solr
* Google PubSub
* Google BigQuery
* OptaPlanner

Check the full list of supported extensions in the [extensions reference](/camel-quarkus/next/reference/index.html).

### Documentation

Following some recent user questions, we have added a new documetation page dedicated to [Testing with Camel Quarkus](/camel-quarkus/next/user-guide/testing.html). It gives the basic guidance how to test your applications in JVM and native modes.

We aim at further improving our [documentation](/camel-quarkus/next/index.html). Do not
hesitate to [ask](https://github.com/apache/camel-quarkus/issues/new) if you feel topics are missing or if details are lacking somewhere.

## What's next?

Camel Quarkus 1.6.0 should appear in the middle of January 2021, shortly after [Quarkus 1.11](https://groups.google.com/g/quarkus-platform-coordination/c/gXuyg4w3FPo).

There is still a lot of [Camel components to port](https://github.com/apache/camel-quarkus/issues?q=is%3Aissue+is%3Aopen+label%3Aextension) to Quarkus.
Please upvote your favorites, or even better [contribute](/camel-quarkus/next/contributor-guide/index.html)!
