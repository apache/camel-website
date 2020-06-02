---
title: "Camel Quarkus 1.0.0-CR2 Released"
date: 2020-06-02
authors: ["ppalaga"]
categories: ["Releases", "Camel Quarkus"]
preview: What's new in Camel Quarkus 1.0.0-CR2
---

We are pleased to announce the release 1.0.0-CR2 of Camel Quarkus. Camel Quarkus brings the outstanding integration
capabilities of Apache Camel to [Quarkus](https://quarkus.io/) - the toolkit for writing subatomically small and
supersonically fast Java, Kotlin and Scala applications.

So what is new in Camel Quarkus 1.0.0-CR2?

## New bits

While we do not have any new extensions this time, the following extensions were promoted from JVM-only to JVM+native:

* [REST OpenApi](https://camel.apache.org/camel-quarkus/latest/extensions/rest-openapi.html)
* [Avro data format](https://camel.apache.org/camel-quarkus/latest/extensions/avro.html)
* [MongoDB GridFS](https://camel.apache.org/camel-quarkus/latest/extensions/mongodb-gridfs.html)
* [Debezium PostgreSQL](https://camel.apache.org/camel-quarkus/latest/extensions/debezium-mysql.html)
* [Debezium MySQL](https://camel.apache.org/camel-quarkus/latest/extensions/debezium-mysql.html)

All supported bits can be seen in the [List of Camel Quarkus extensions](https://camel.apache.org/camel-quarkus/latest/list-of-camel-quarkus-extensions.html).

## New documentation pages

Each Camel Quarkus extension has a separate page now. Most of the content is generated from the data available in
[Camel Catalog](https://camel.apache.org/manual/latest/camel-catalog.html). This includes some basic description, Maven
coordinates and links to the involved Camel bits.
[ActiveMQ](https://camel.apache.org/camel-quarkus/latest/extensions/activemq.html) is an example of such a rudimentary
page.

In some cases, that generated content is combined with manually maintained sections that inform about Camel
Quarkus specific behavior, limitations, configuration options, etc. See [MicroProfile Health](https://camel.apache.org/camel-quarkus/latest/extensions/microprofile-health.html) as an example.

Within a couple of days, [code.quarkus.io](https://code.quarkus.io/) should start to reference the new extension pages
as "guides" of the individual Camel entries listed there.

## Camel 3.3.0

Camel was upgraded to [3.3.0](https://camel.apache.org/blog/Camel33-Whatsnew/) bringing less reflection and less JAXP to
Camel Quarkus, thus improving the disk size, startup time and RAM usage of Camel Quarkus applications.

## Quarkus 1.5.0.Final

Quarkus was upgraded to 1.5.0.Final (from 1.4.1.Final in Camel Quarkus 1.0.0-M7).

## The last release with Java 8

We deprecated Java 8 in the previous release and we announced to remove it two releases from then. Hence this is
the last release supporting Java 8.

## Camel Quarkus Hystrix deprecated

The Hystrix component was recently deprecated in Camel, so we deprecated it as well. It will be removed in the next
Camel Quarkus release. Please use
[Microprofile Fault Tolerance](https://camel.apache.org/camel-quarkus/latest/extensions/microprofile-fault-tolerance.html)
as a replacement.

Enjoy and give feedback either via [mailing lists](https://camel.apache.org/manual/latest/mailing-lists.html)
or [GitHub issues](https://github.com/apache/camel-quarkus/issues)!

