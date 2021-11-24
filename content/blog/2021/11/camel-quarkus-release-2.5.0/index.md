---
title: "Camel Quarkus 2.5.0 Released"
date: 2021-11-26
authors: ["zbendhiba"]
categories: ["Releases", "Camel Quarkus"]
preview: "Camel Quarkus 2.5.0 Released"
summary: "Camel Quarkus 2.5.0 brings Quarkus 2.5, Camel 3.13, better test coverage and documentation"
---

<sub><sup>Image by <a href="https://www.flickr.com/photos/lanzen/5984113332">Anders Lanzen</a> <a href="https://creativecommons.org/licenses/by-nc-sa/2.0">CC BY-NC-SA 2.0</a></sup></sub>

We are pleased to announce the release 2.5.0 of Camel Quarkus.
It brings Camel 3.13.0 and Quarkus 2.5.0.Final, some test coverage and documentation improvements.
Many thanks to all contributors and issue reporters!

## Camel 3.13.0

Please follow the [Camel 3.13.0 announcement](/blog/2021/11/RELEASE-3.13.0/) for more details.

## Quarkus 2.5.0.Final

The highlights:

* Upgrade to GraalVM/Mandrel 21.3
* Support for JPA entity listeners for Hibernate ORM in native mode
* Ability to add HTTP headers to responses
* Various usability improvements in extensions and dev mode/testing infrastructure

Please refer to [Quarkus 2.5.0.Final announcement](https://quarkus.io/blog/quarkus-2-5-0-final-released/) for more details.

## Test coverage and closing functionality gaps

In this release, we continued our efforts started in 2.0.0 release to review existing tests and add new ones
to cover all major use cases mentioned in the main Camel documentation.

## Documentation

We have improved the user guide with :

* New section for additional configuration in the [AWS 2 Lambda documentation](/camel-quarkus/next/reference/extensions/aws2-lambda.html#_additional_camel_quarkus_configuration)
* New section explaining how to [generate Salesforce DTOs With the Salesforce-Maven-Plugin](/camel-quarkus/next/reference/extensions/salesforce.html#_generating_salesforce_dtos_with_the_salesforce_maven_plugin)
* Update section for [additional configuration in Avro](/camel-quarkus/next/reference/extensions/avro.html#_additional_camel_quarkus_configuration)


## Release notes

Fixed issues:

* [Milestone 2.5.0](https://github.com/apache/camel-quarkus/milestone/21?closed=1)

All commits:

* [2.4.0..2.5.0](https://github.com/apache/camel-quarkus/compare/2.4.0...2.5.0)
