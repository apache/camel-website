---
title: "Camel Quarkus 2.6.0 Released"
date: 2021-12-23
authors: ["zbendhiba"]
categories: ["Releases", "Camel Quarkus"]
preview: "Camel Quarkus 2.6.0 Released"
summary: "Camel Quarkus 2.6.0 brings Quarkus 2.6, Camel 3.14 and JFR native support"
---

<sub><sup>Image by <a href="https://www.flickr.com/photos/lanzen/5984113332">Anders Lanzen</a> <a href="https://creativecommons.org/licenses/by-nc-sa/2.0">CC BY-NC-SA 2.0</a></sup></sub>

We are pleased to announce the release 2.6.0 of Camel Quarkus.
It brings Camel 3.14.0, Quarkus 2.6.0.Final and JFR native support.
Many thanks to all contributors and issue reporters!

## Camel 3.14.0

Please follow the [Camel 3.14.0 announcement](/blog/2021/12/RELEASE-3.14.0/) and [Camel 3.14 What's new](/blog/2021/12/camel314-whatsnew/) for more details.

## Quarkus 2.6.0.Final

The highlights:

* Some extensions moved to Quarkiverse Hub
* SmallRye Reactive Messaging 3.13 and Kafka 3
* Programmatic API for caching
* Smaller image for native executables
* Built-in UPX compression
* AWT extension
* Kotlin 1.6

Please refer to [Quarkus 2.6.0.Final announcement](https://quarkus.io/blog/quarkus-2-6-0-final-released/) for more details.

## JFR Native support
Camel JFR extension allows diagnosing Camel applications with Java Flight Recorder. The extension has been introduced in Camel Quarkus 1.7.0 with JVM support only. The extension is now fully supported in JVM mode and Native mode.

## Test coverage and closing functionality gaps
In this release, we continued our efforts started in 2.0.0 release to review existing tests and add new ones
to cover all major use cases mentioned in the main Camel documentation.

## Release notes

Fixed issues:

* [Milestone 2.6.0](https://github.com/apache/camel-quarkus/milestone/22?closed=1)

All commits:

* [2.5.0..2.6.0](https://github.com/apache/camel-quarkus/compare/2.5.0...2.6.0)
