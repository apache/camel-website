---
title: "Camel Quarkus 2.8.0 Released"
date: 2022-04-06
authors: ["aldettinger"]
categories: ["Releases", "Camel Quarkus"]
preview: "Camel Quarkus 2.8.0 Released"
summary: "Camel Quarkus 2.8.0 brings Quarkus 2.8.0.Final, Camel 3.15.0"
---

<sub><sup>Image by <a href="https://www.flickr.com/photos/lanzen/5984113332">Anders Lanzen</a> <a href="https://creativecommons.org/licenses/by-nc-sa/2.0">CC BY-NC-SA 2.0</a></sup></sub>

We are pleased to announce the 2.8.0 release of Camel Quarkus.
It brings Camel 3.15.0 and Quarkus 2.8.0.Final.
Many thanks to all contributors and issue reporters!

Users are highly encouraged to test this milestone release in order to early catch possible flaws before the final Camel Quarkus 2.8.0 release.
Note that this milestone release is not published to Quarkus Platform.

## Camel 3.15.0

Please follow the [Camel 3.15.0 announcement](/blog/2022/02/RELEASE-3.15.0/) and the [Camel 3.15 What's new](/blog/2022/02/camel315-whatsnew/) post for more details about the 3.15 release.

## Quarkus 2.7.3.Final

Please refer to [Quarkus 2.8.0.Final announcement](https://quarkus.io/blog/quarkus-2-8-0-final-released/) for more details.

## What's new

Camel Quarkus 2.8.0 comes with:

* A new JVM extension: `azure-servicebus`
* Native support for the `mybatis` extension
* The deprecation of the `spark`, `ahc` and `ahc-ws` extensions
* The removal of the `ipfs` and `weka` extensions
* An additional continuous integration build on `Windows` O/S

## Release notes

Fixed issues:

* [Milestone 2.8.0-M1](https://github.com/apache/camel-quarkus/milestone/24?closed=1)
* [Milestone 2.8.0](https://github.com/apache/camel-quarkus/milestone/TODO?closed=1)

All commits:

* [2.7.0..2.8.0](https://github.com/apache/camel-quarkus/compare/2.7.0...2.8.0)

## Upgrading from Camel Quarkus 2.7.0:
The major difference when upgrading would be linked to the removal of `ipfs` and `weka` extensions.
Above, the migration is considered to be safe.
It's worth reminding that the `spark`, `ahc` and `ahc-ws` extensions were deprecated and will be removed in a future version.