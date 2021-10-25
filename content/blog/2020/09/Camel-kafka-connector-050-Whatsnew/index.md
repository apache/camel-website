---
title: "Apache Camel Kafka Connector 0.5.0: What's New"
date: 2020-09-14
authors: [oscerd, valdar]
categories: ["Releases"]
preview: Details of what we have done in the Camel Kafka Connector 0.5.0 release.
---

Apache Camel Kafka Connector 0.5.0 has just been released.

This is based on the non-LTS release of Apache Camel 3.5.0, this means we will not provide patch releases, but use the release _as-is_.


## So what's in this release?

This release introduce bug fixes, improvements and new connectors obviously

### New connectors

The new connectors introduced in this release are the following:

- ArangoDB: Perform operations on ArangoDb when used as a Document Database, or as a Graph Database.
- AWS2-STS: Manage AWS STS cluster instances using AWS SDK version 2.x.
- Azure Eventhubs: The azure-eventhubs component which integrates Azure Event Hubs using AMQP protocol.
- JSonata: JSON to JSON transformation using JSONATA.
- Minio: Store and retrieve objects from Minio Storage Service using Minio SDK.
- OAI-PMH: Harvest metadata using OAI-PMH protocol.
- Vert.x HTTP Client: Camel HTTP client support with Vert.x.
- Vert.x WebSocket: Camel WebSocket support with Vert.x.

### Support for multiple topics from the source side

Users are now able to specify multiple topics as target for the source connector configuration.
This field needs a comma-separated list of topics.

### Documentation

The documentation of each connector (source/sink or both) now contains reference to the following information

- Explicit connector class to be used
- Converters list available in the connector as out of the box solutions
- Transformers list available in the connector as out of the box solutions
- Aggregation Strategies list available in the connector as out of the box solutions

On the Archetypes side: the archetype provided to extend the current connectors is now able to use a parameter to specify what connector you want to extend.
More information available at [Camel-Kafka-connector archetype documentation](/camel-kafka-connector/next/user-guide/extending-connector/index.html).

We added also a troubleshooting section in our documentation, to be able to debug and use the connectors in the best way possible.

### Improved performance

Thanks to our users we found out we could improve the performance of Source connectors: more details at https://github.com/apache/camel-kafka-connector/issues/414

### Examples

We added a bunch of new examples to the [camel-kafka-connector-examples repository](https://github.com/apache/camel-kafka-connector-examples)

### What to expect

We are already working on the next release based on the upcoming 3.6.0 Camel release: we'll add new connectors, we'll improve the user experience and we'll focus on improving the codebase and introducing new features.
