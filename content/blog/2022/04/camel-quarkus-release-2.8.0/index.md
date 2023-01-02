---
title: "Camel Quarkus 2.8.0 Released"
date: 2022-04-12
authors: ["aldettinger","jamesnetherton"]
categories: ["Releases", "Camel Quarkus"]
preview: "Camel Quarkus 2.8.0 Released"
summary: "Camel Quarkus 2.8.0 brings Quarkus 2.8.0.Final, Camel 3.16.0"
---

<sub><sup>Image by <a href="https://www.flickr.com/photos/lanzen/5984113332">Anders Lanzen</a> <a href="https://creativecommons.org/licenses/by-nc-sa/2.0">CC BY-NC-SA 2.0</a></sup></sub>

We are pleased to announce the 2.8.0 release of Camel Quarkus.
It brings Camel 3.16.0 and Quarkus 2.8.0.Final.
Many thanks to all contributors and issue reporters!

## Camel 3.16.0

Please follow the [Camel 3.16.0 announcement](/blog/2022/03/RELEASE-3.16.0/) and the [Camel 3.16 What's new](/blog/2022/03/camel316-whatsnew/) post for more details about the 3.16 release.

## Quarkus 2.8.0.Final

Please refer to [Quarkus 2.8.0.Final announcement](https://quarkus.io/blog/quarkus-2-8-0-final-released/) for more details.

## What's new

Camel Quarkus 2.8.0 includes:

* New JVM extensions `azure-servicebus` & `google-secret-manager`
* Native support for the `mybatis` extension
* Vert.x based Azure HTTP client for the Azure extensions
* The deprecation of the `spark`, `ahc` and `ahc-ws` extensions
* The removal of the `ipfs` and `weka` extensions
* Improved support for Windows after the addition of a continuous integration build for the Windows O/S

## Release notes

Fixed issues:

* [Milestone 2.8.0-M1](https://github.com/apache/camel-quarkus/milestone/24?closed=1)
* [Milestone 2.8.0](https://github.com/apache/camel-quarkus/milestone/25?closed=1)

All commits:

* [2.7.0..2.8.0](https://github.com/apache/camel-quarkus/compare/2.7.0...2.8.0)

## Upgrading from Camel Quarkus 2.7.x:

Some deprecated extensions and features were removed in the 2.8.0 release. For further details see the [migration guide](/camel-quarkus/next/migration-guide/2.8.0.html).

Also note that the `spark`, `ahc` and `ahc-ws` extensions are now deprecated and will be removed in a future version (likely 2.9.0).
