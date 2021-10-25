---
title: "Camel Quarkus 2.1.0 Released"
date: 2021-07-30
authors: ["zbendhiba"]
categories: ["Releases", "Camel Quarkus"]
preview: "Camel Quarkus 2.1.0 Released"
summary: "Camel Quarkus 2.1.0 brings Quarkus 2.1.0.Final"
---

<sub><sup>Image by <a href="https://www.flickr.com/photos/lanzen/5984113332">Anders Lanzen</a> <a href="https://creativecommons.org/licenses/by-nc-sa/2.0">CC BY-NC-SA 2.0</a></sup></sub>

We are pleased to announce the release 2.1.0 of Camel Quarkus.
It brings Quarkus 2.1, improved test coverage and one new promoted extension.

Many thanks to all contributors and issue reporters!

## Quarkus 2.1.0.Final
Please refer to [Quarkus 2.1.0.Final announcement](https://quarkus.io/blog/quarkus-2-1-0-final-released/) for more details.

## New extension

* [OpenTelemetry](/camel-quarkus/next/reference/extensions/opentelemetry.html)

## Serialization support
We introduced the support for Serialization. Please refer to the section in our [User guide](/camel-quarkus/next/user-guide/native-mode.html#serialization)


## More test coverage
We continued our efforts on adding more test coverage and fixing issues.

The extent of this effort can be assessed by running [this GitHub issues query](https://github.com/apache/camel-quarkus/issues?q=is%3Aissue+label%3Aintegration-test+closed%3A2021-06-25..2021-07-23). This endeavour is going to continue in coming Camel Quarkus releases.

## Breaking changes and migration steps

Please refer to our [2.1.0 Migration guide](/camel-quarkus/next/migration-guide/2.1.0.html).

## FULL CHANGELOG OF CAMEL QUARKUS 2.1.0

* [Fixed issues](https://github.com/apache/camel-quarkus/milestone/17?closed=1)
* [All commits](https://github.com/apache/camel-quarkus/compare/2.0.0...2.1.0)

## What's next?

Camel Quarkus 2.2.0 should appear within a couple of weeks, shortly after Quarkus 2.2.0.Final.

There is still a lot of [Camel components to port](https://github.com/apache/camel-quarkus/issues?q=is%3Aissue+is%3Aopen+label%3Aextension) to Quarkus.
Please upvote your favorites, or even better [contribute](/camel-quarkus/next/contributor-guide/index.html)!

