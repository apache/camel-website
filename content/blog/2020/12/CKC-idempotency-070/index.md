---
title: "Introducing Idempotency Support in Camel Kafka Connector"
date: 2020-12-21
authors: [oscerd]
categories: ["Releases", "Camel-Kafka-Connector"]
preview: Details of the work done to support idempontency in ckc and example.
---

In the next Camel Kafka connector release (0.7.0, on vote soon) there will be a new feature: the idempotency support on both source and sink connectors.
The aim of this post is giving some hints on how and when to use the idempotency feature.

### What is Idempotency?

The Idempotent Consumer from the EIP patterns is used to filter out duplicate messages: it essentially acts like a Message Filter to filter out duplicates, as reported in the [Camel documentation](/components/next/eips/idempotentConsumer-eip.html)

From the [Enterprise Integration Patterns documentation](https://www.enterpriseintegrationpatterns.com/patterns/messaging/MessagingEndpointsIntro.html):
_Sometimes the same message gets delivered more than once, either because the messaging system is not certain the message has been successfully delivered yet, or because the Message Channel’s quality-of-service has been lowered to improve performance. Message receivers, on the other hand, tend to assume that each message will be delivered exactly once, and tend to cause problems when they repeat processing because of repeat messages. A receiver designed as an Idempotent Receiver handles duplicate messages and prevents them from causing problems in the receiver application._

This is a very useful feature in the integration world and it is an important new feature in the camel-kafka-connector project. Apache Camel provides multiple implementation of the Idempotent Consumer, in Camel-Kafka-connector we'll support the in Memory and Kafka implementations.

### When to use idempotency

Suppose you're using a source connector of any kind. By using the idempotency feature you'll be able to avoid consuming the same message multiple times.

This means, in the Kafkish language, you won't ingest the same payload multiple times in the target Kafka topic. This is something critical on the cloud for example, where you'll pay for each API operation and for using increasing storage.

Now lets think about the sink connector scenario.

In this case, we'll stream out of a Kafka topic multiple records, transform/convert/manipulate them and send them to an external system, like a messaging broker, a storage infra, a database etc.

In the Kafka topic used as source we may have multiple repeated records with the same payload or same metadata. Based on this information we can choose to skip the same records while sending data to the external system and for doing this we can leverage the idempotency feature of ckc.

### Camel-Kafka-connector idempotency configuration

The idempotency feature can be enabled through a number of configuration options available in ckc with the 0.7.0 release. In particular we are talking about:

| Name                                     | Description                                                                                                                           | Default                     |
|------------------------------------------|---------------------------------------------------------------------------------------------------------------------------------------|-----------------------------|
| camel.idempotency.enabled                | If idempotency must be enabled or not                                                                                                 | false                       |
| camel.idempotency.repository.type        | The idempotent repository type to use, possible values are memory and kafka                                                           | memory                      |
| camel.idempotency.expression.type        | How the idempotency will be evaluated: possible values are body and header                                                            | body                        |
| camel.idempotency.expression.header      | The header name that will be evaluated in case of camel.idempotency.expression.type equals to header                                  | null                        |
| camel.idempotency.memory.dimension       | The Memory dimension of the in memory idempotent Repository                                                                           | 100                         |
| camel.idempotency.kafka.topic            | The Kafka topic name to use for the idempotent repository                                                                             | kafka_idempotent_repository |
| camel.idempotency.kafka.bootstrap.servers| A comma-separated list of host and port pairs that are the addresses of the Kafka brokers where the idempotent repository should live | localhost:9092              |
| camel.idempotency.kafka.max.cache.size   | Sets the maximum size of the local key cache                                                                                          | 1000                        |
| camel.idempotency.kafka.poll.duration.ms | Sets the poll duration (in milliseconds) of the Kafka consumer                                                                        | 100                         |

The in-memory approach has been provided for short running connector workload, while the kafka one is for long running/interruptable connector.

The table is self-explaining.

A typical configuration for the kafka idempotent repository approach could be:

```
camel.idempotency.enabled=true
camel.idempotency.repository.type=kafka
camel.idempotency.expression.type=body
camel.idempotency.kafka.topic=my.idempotency.topic
camel.idempotency.kafka.bootstrap.servers=localhost:9092
camel.idempotency.kafka.max.cache.size=1500
camel.idempotency.kafka.poll.duration.ms=150
```

Some of the options can be used with their default value, in this example we're just listing them for a Kafka idempotent repository configuration.

### A real example

The best way to show how the idempotency feature works, in camel-kafka-connector, it's through an example. We'll use the AWS2-S3 Source Connector for this purpose.

As first step you'll need to fully build the [Camel-Kafka-connector project](https://github.com/apache/camel-kafka-connector) and install the connectors/camel-aws2-s3-kafka-connector zip package in your Kafka Broker plugin.path. Once the connector is in the plugin.path location, just unzip it. We describe how to build and unpack in the next steps:

You'll need to setup the plugin.path property in your kafka

Open the `$KAFKA_HOME/config/connect-standalone.properties`

and set the `plugin.path` property to your choosen location

In this example we'll use `/home/connectors/`

```
> cd <ckc_project>
> mvn clean package
> cp <ckc_project>/connectors/camel-aws2-s3-kafka-connector/target/camel-aws2-s3-kafka-connector-0.7.0-SNAPSHOT-package.zip /home/connectors/
> cd /home/connectors/
> unzip camel-aws2-s3-kafka-connector-0.7.0-SNAPSHOT-package.zip
```

The configuration for the source connector should be like:

```
name=CamelAWS2S3SourceConnector
connector.class=org.apache.camel.kafkaconnector.aws2s3.CamelAws2s3SourceConnector
key.converter=org.apache.kafka.connect.storage.StringConverter
value.converter=org.apache.kafka.connect.converters.ByteArrayConverter

camel.source.maxPollDuration=10000

topics=s3.source.topic

camel.source.path.bucketNameOrArn=camel-kafka-connector

camel.source.endpoint.deleteAfterRead=false

camel.component.aws2-s3.access-key=xxxx
camel.component.aws2-s3.secret-key=yyyy
camel.component.aws2-s3.region=eu-west-1

camel.idempotency.enabled=true
camel.idempotency.repository.type=kafka
camel.idempotency.expression.type=body
camel.idempotency.kafka.topic=my.idempotency.topic
```

Don't forget to add the correct credentials for your AWS account.

We can call the configuration file s3-source.properties for example

At this point we can run the connector.

```bash
> $KAFKA_HOME/bin/connect-standalone.sh $KAFKA_HOME/config/connect-standalone.properties s3-source.properties
```

You have to have a running kafka cluster for this purpose.

In your camel-kafka-connector bucket, try to load two files (test1.txt and test2.txt) with the same content, for example "Camel-Kafka-connector rocks".

And consume from the s3.source.topic through kafkacat

```bash
> kafkacat -b localhost:9092 -t s3.source.topic
% Auto-selecting Consumer mode (use -P or -C to override)
% Reached end of topic s3.source.topic [0] at offset 0
Camel-Kafka-connector rocks
% Reached end of topic s3.source.topic [0] at offset 1
```

The body of the second file was discarded and you just have one message in the topic.

You can also have a look at the my.idempotency.topic content

```bash
> kafkacat -b localhost:9092 -t my.idempotency.topic -f 'Value:%s\nKey:%k\n'
% Auto-selecting Consumer mode (use -P or -C to override)
Value:add
Key:Camel-Kafka-connector rocks
```

We have just one operation of add with the body of the message as key.

### Conclusion

This is just a little introduction on the camel-kafka-connector idempotency support. There are more case to cover and probably more work to be done.
I just wanted to show something new in the camel-kafka-connector world. Feedback are welcome as always.
