---
title: "Apache Camel 3.10 What's New"
date: 2021-05-21
authors: [davsclaus]
categories: ["Releases"]
preview: Details of what we have done in the Camel 3.10 release.
---

Apache Camel 3.10 has just been [released](/blog/2021/05/RELEASE-3.10.0/).

This is a non-LTS release which means we will not provide patch releases.
The next planned LTS release is 3.11 scheduled for June/July 2021.

## So what's in this release

This release introduces a set of new features and noticeable improvements that we will cover in this blog post.

### Reduced object allocations

We have optimized the remainder of the most complex EIPs to avoid excessive object allocations,
and also to support [exchange pooling](/manual/exchange-pooling.html).

The only EIP which is less optimized is the Aggregate EIP which also is the most complex EIP implementation in Camel.

We also optimized the remainder of the Camel components to support [exchange pooling](/manual/exchange-pooling.html).

### Optimized core

We continue the optimization and have improved the core in various small areas such as
avoiding the copy message id's if they are not in use, and also a faster way to lookup endpoints in the Camel endpoint registry,
which helps when using dynamic EIP patterns.

### Multi language DSLs

We did not introduce a new DSL language, but we have improved the YAML DSL to be a first class DSL.

YAML DSL fully support Kamelets and so far all the ready to use Kamelets from the
[Apache Camel Kamelet Catalog](https://github.com/apache/camel-kamelets) are in YAML.

You can now also tell Camel to dump all the routes during startup as XML (`camel.main.dump-routes = true`).
This allows to diagnose your routes, which comes handy if you write routes in different DSL's and you have some kind
of problem. Then the XML dump is a _view_ of the routes from Camel point of view.

### Kamelets

We have done significant work to [Kamelets](/camel-k/next/kamelets/kamelets-user.html) in this release.

Kamelets (route templates) are now more flexible and more isolated, which really helps
to build more sophisticated Kamelets that are plug and play ready in any Camel runtime.

A Kamelet can now specify [local beans](/manual/route-template.html) that are only present when the kamelet is creating
the runtime route that it represents. The Kamelet can even embed Java, Groovy, Kotlin (or other language)
as source code for creating the _local beans_. This gives more power to Kamelets, such as the AWS kamelets
that is self contained and can create _local beans_ for the AWS Client that is needed for connectivity with AWS cloud platform.

For example we added `Kamelet` as an EIP which allows you to call kamelets in a more sophisticated
way for, such as in a way similar to using asynchronous request/reply message patterns.

Kamelets can now be discovered lazy at runtime, such as from classpath. This allows you for example
to add 3rd party Kamelets easily by adding the JAR to your project. Or the JAR from
the official [Apache Camel Kamelet Catalog](https://github.com/apache/camel-kamelets).

### Kafka

In the Kafka world then it's common to use Avro or Protobuf serialization.
In this release we added support for Jackson based dataformats for Avro and Protobuf.

The [camel-kafka](/components/next/kafka-component.html) component has been made more
robust during stopping to better handle errors thrown by Kafka during client shutdown.

The components are upgraded to Kafka 2.8.

### Camel K

We have continued porting over more from the [Camel K](/camel-k/next/) runtime to this core Camel project.
The support for webhooks and kamelet reify component has been ported over.

### Rest DSL

The [Rest DSL](/manual/rest-dsl.html) have been improved to support the OpenAPI 3.1 specification
regarding security model and requirements declarations.

### Cloud component

The Camel AWS and Azure components have had various bug fixes and smaller improvements.

### Easier fat-jar packaging

We added a new `prepare-fatjar` goal to the
[camel-maven-plugin](https://github.com/apache/camel/blob/main/tooling/maven/camel-maven-plugin/src/main/docs/camel-maven-plugin.adoc)
which allows to prepare your Camel application for fat-jar packaging where the plugin scans your project
and generate one unique _uber metadata_ file. This allows _fat-jar_ packaging such
as various maven plugins to safely package together the Camel JARs and your application
in a single JAR which otherwise would cause Camel metadata files to be overridden.

### Debezium

Camel now supports Debezium 1.5.

### Quarkus

This release is preparing for supporting the upcoming Quarkus 2.0 release.
Camel is now upgraded to support Vert.X and the MicroProfile v4 specification.

### Spring Boot

We have upgraded to latest Spring Boot 2.4.5 release.

### New components

This release has a number of new components, data formats and languages:

- `camel-azure-cosmosdb` - Integrates with CosmoDB databases on MS Azure
- `camel-spring-jdbc` - The `camel-jdbc` component was made spring-less and this component adds support for using Spring Transactions with the JDBC component.
- `camel-jackson-avro` - Marshal POJOs to Avro and back using Jackson
- `camel-jackson-protobuf` - Marshal POJOs to Protobuf and back using Jackson

## Upgrading

Make sure to read the [upgrade guide](/manual/camel-3x-upgrade-guide-3_10.html) if you are upgrading from a previous Camel version.

## Release Notes

You can find more information about this release in the [release notes](/releases/release-3.10.0/), with a list of JIRA tickets resolved in the release.
