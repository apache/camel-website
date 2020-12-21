---
title: "Apache Camel Kafka Connector 0.7.0: What's New"
date: 2020-12-24
draft: true
authors: [oscerd, valdar]
categories: ["Releases"]
preview: Details of what we have done in the Camel Kafka Connector 0.7.0 release.
---

Apache Camel Kafka Connector 0.7.0 has just been released.

This is based on the non-LTS release of Apache Camel 3.7.0, this means we will provide patch releases, as Camel 3.7.x is an LTS release.

## So what's in this release?

This release introduce bug fixes, improvements, new features and new connectors obviously

### New connectors

The new connectors introduced in this release are the following:

- AtlasMap: Transforms the message using an AtlasMap transformation
- Kubernetes Custom Resources: Perform operations on Kubernetes Custom Resources and get notified on Deployment changes
- Vert.X Kafka: Sent and receive messages to/from an Apache Kafka broker using vert.x Kafka client
- JSON JSON-B: Marshal POJOs to JSON and back using JSON-B
- CSimple: Evaluate a compile simple expression language
- DataSonnet: To use DataSonnet scripts in Camel expressions or predicates
- jOOR: Evaluate a jOOR (Java compiled once at runtime) expression language

### Support for idempotent repository

In this release we introduced the idempotency support. 

The initial support will provide:

- in-memory idempotent repository
- kafka idempotent repository

The idempotency will be supported on both source and sink connector, this means:

- From a source point of view, by enabling the idempotency, you'll be able to avoid ingesting the same payload to the target Kafka topic. This can be done at body or header level.
- From a sink point of view, by enabling the idempotency, you'll be able to avoid sending the same payload to an external system, through checking body or header of the Kafka record from the Kafka source topic.

### Support for remove headers option

There are situation in which you'll be using a Camel-Kafka-Connector source connector and sink connector together. Sometimes you'll need to remove some of the Camel headers to achieve a particular behavior. This option should be used in this case. The value of this option can be a list of headers or a regexp.

In the [camel-kafka-connector-examples repository](https://github.com/apache/camel-kafka-connector-examples/tree/master/aws2-s3/aws2-s3-move-bucket-to-bucket) we provided a little example based on 0.7.0 SNAPSHOT version.

### New Archetypes

We added two new archetypes:

- Apicurio Archetype: To be able to leveraging the apicurio service registry
- Dataformat Archetype: To extend a connector by adding a dataformat to it

### Improved integration tests

We improved the integration tests by leveraging the really good work by [Otavio R. Piske](https://github.com/orpiske) on the camel-test-infra platform.
We are now basing the integration on the camel-test-infra modules coming from the Camel release.

### Documentation

On the Archetypes side we added more documentation about the base extensible connector and on the apicurio archetype and dataformat archetype (added in this release)

### Strimzi and Kafka Version

This release has been based on Kafka 2.6.0 and Strimzi 0.20.1

### Examples

We added a bunch of new examples to the [camel-kafka-connector-examples repository](https://github.com/apache/camel-kafka-connector-examples)

### What to expect

We are already working on the next release based on the upcoming 3.8.0 Camel release.
We are working on improving the documentation and adding new stuff.
