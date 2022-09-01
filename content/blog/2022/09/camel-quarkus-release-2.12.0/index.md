---
title: "Camel Quarkus 2.12.0 Released"
date: 2022-09-01
authors: ["jamesnetherton"]
categories: ["Releases", "Camel Quarkus"]
preview: "Camel Quarkus 2.12.0 Released"
summary: "Camel Quarkus 2.12.0 is released and aligns with Camel 3.18.1 and Quarkus 2.12.0.Final"
---

<sub><sup>Image by <a href="https://www.flickr.com/photos/lanzen/5984113332">Anders Lanzen</a> <a href="https://creativecommons.org/licenses/by-nc-sa/2.0">CC BY-NC-SA 2.0</a></sup></sub>

We are pleased to announce the 2.12.0 release of Camel Quarkus.
It aligns with Camel 3.18.1 and Quarkus 2.12.0.Final.
Many thanks to all contributors and issue reporters!

## Camel 3.18.1

Camel Quarkus 2.12.0 is aligned to Camel 3.18.1. Please refer to the [Camel 3.18.1 announcement](/blog/2022/08/RELEASE-3.18.1/) for more details about the 3.18.1 release.

## Quarkus 2.12.0.Final

Please refer to the [Quarkus 2.12.0.Final announcement](https://quarkus.io/blog/quarkus-2-12-0-final-released/) for more details.

## New extensions

There is one new extension in the 2.12.0 release. The long awaited and highly requested [CXF SOAP](/camel-quarkus/2.12.x/reference/extensions/cxf-soap.html) extension is now avilable 
for both JVM and native modes.

## JVM mode testing improvements

Another highly requested feature has been the ability to use testing constructs available in other Camel runtimes such as `CamelTestSupport`. The good news is that support for such tests has now 
arrived in the form of a new `camel-quarkus-junit5` dependency and `CamelQuarkusTestSupport` class.

You can read more about how it works in the [documentation](/camel-quarkus/2.12.x/user-guide/testing.html#_cameltestsupport_style_of_testing).

## Release notes

Fixed issues:

* [Milestone 2.12.0](https://github.com/apache/camel-quarkus/milestone/31?closed=1)

All commits:

* [2.11.0..2.12.0](https://github.com/apache/camel-quarkus/compare/2.11.0...2.12.0)
