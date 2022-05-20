---
title: "Camel Quarkus 1.4.0 Released"
date: 2020-11-23
authors: ["jamesnetherton"]
categories: ["Releases", "Camel Quarkus"]
preview: "Camel Quarkus 1.4.0 Released"
---

Apache Camel Quarkus 1.4.0 has been released!

We continue to integrate with the latest Camel and [Quarkus](https://quarkus.io/) releases, whilst adding new features and fixing bugs.

For a full overview of the changes see the [1.4.0 milestone details](https://github.com/apache/camel-quarkus/milestone/8?closed=1).

Here are some of the highlights.

## Major component upgrades

* Quarkus 1.10.0

## New extensions

As ever, we added some new extensions and enhanced existing ones with native support.

1 new JVM only extension was added:

* AWS 2 Eventbridge

7 extensions were enhanced with native support.

* JSLT
* Lumberjack
* MSV
* Nagios
* Saga
* Twilio
* Zendesk

You can browse the full list of supported extensions over at the [extensions reference](/camel-quarkus/next/reference/index.html).

## Improved integration with Quarkus Spring extensions

This release fixes a [bug](https://github.com/apache/camel-quarkus/issues/1759) which highlighted some incompatibilities between the Quarkus Spring extensions and some of the Camel Quarkus extensions that depend on Spring libraries for JDBC, JMS & transaction support. This prevented applications from being built successfully, but the problem is now fixed.

## What's next?

We move onwards towards supporting Camel 3.7.0, Quarkus 1.11.0 and continuing to work through the [list](https://github.com/apache/camel-quarkus/issues?q=is%3Aissue+is%3Aopen+label%3Anative) of extensions that need native support. 

As ever, we love contributions. So if you'd like to fix a bug, add a new extension or add native support to an existing one, check out the [list of issues](https://github.com/apache/camel-quarkus/issues) and the [contributor guide](/camel-quarkus/next/contributor-guide/index.html).

We hope you enjoy Camel Quarkus 1.4.0 and we look forward to your feedback and participation!
