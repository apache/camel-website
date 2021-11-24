---
title: "Camel Quarkus 2.4.0 Released"
date: 2021-11-12
authors: ["ppalaga"]
categories: ["Releases", "Camel Quarkus"]
preview: "Camel Quarkus 2.4.0 Released"
summary: "Camel Quarkus 2.4.0 brings Quarkus 2.4, better test coverage and documentation"
---

<sub><sup>Image by <a href="https://www.flickr.com/photos/lanzen/5984113332">Anders Lanzen</a> <a href="https://creativecommons.org/licenses/by-nc-sa/2.0">CC BY-NC-SA 2.0</a></sup></sub>

We are pleased to announce the release 2.4.0 of Camel Quarkus.
It brings Camel 3.12.0 and Quarkus 2.4.0.Final, some test coverage and documentation improvements.
Many thanks to all contributors and issue reporters!

## Camel 3.12.0

Please follow the [Camel 3.12.0 announcement](/blog/2021/10/RELEASE-3.12.0/) for more details.

## Quarkus 2.4.0.Final

The highlights:

* Hibernate Reactive 1.0.0.Final
* Introducing Kafka Streams DevUI
* Support continuous testing for multi module projects
* Support AWT image resize via new AWT extension

Please refer to [Quarkus 2.4.0.Final announcement](https://quarkus.io/blog/quarkus-2-4-0-final-released/) for more details.

## Test coverage and closing functionality gaps

In this release, we continued our efforts started in 2.0.0 release to review existing tests and add new ones
to cover all major use cases mentioned in the main Camel documentation. Check the [GitHub issues](https://github.com/apache/camel-quarkus/pulls?q=is%3Apr+is%3Aclosed+test+merged%3A2021-10-01..2021-10-23) for more details.

## Documentation

We have updated the [Character encodings](/camel-quarkus/next/user-guide/native-mode.html#charsets) and [Locales](/camel-quarkus/next/user-guide/native-mode.html#locale) sections of the Native mode guide.


## Release notes

Fixed issues:

* [Milestone 2.4.0](https://github.com/apache/camel-quarkus/milestone/20?closed=1)

All commits:

* [2.3.0..2.4.0](https://github.com/apache/camel-quarkus/compare/2.3.0...2.4.0)
