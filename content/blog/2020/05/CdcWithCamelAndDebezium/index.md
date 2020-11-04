---
title: "CDC with Camel and Debezium"
date: 2020-05-04
draft: false
authors: [fvaleri]
categories: ["Usecases"]
preview: "CDC approaches based on Camel and Debezium."
---

Change Data Capture (CDC) is a well-established software design pattern for a system that monitors and captures
data changes, so that other software can respond to those events.

Using a CDC engine like [Debezium](https://debezium.io) along with [Camel]() integration
framework, we can easily build data pipelines to bridge traditional data stores and new cloud-native event-driven
architectures.

The advantages of CDC comparing to a simple poll-based or query-based process are:

- *All changes captured*: intermediary changes (updates, deletes) between two runs of the poll loop may be missed.
- *Low overhead*: near real-time reaction to data changes avoids increased CPU load due to frequent polling.
- *No data model impact*: timestamp columns to determine the last update of data are not needed.

There are two main aproaches for building a CDC pipeline:

The first approach is *configuration-driven* and runs on top of [KafkaConnect](https://kafka.apache.org/documentation/#connect),
the streaming integration platform based on Kafka. The second approach is *code-driven* and it is purely implemented with Camel
(no Kafka dependency).

While KafkaConnect provides some *Connectors* for zero or low coding integrations, Camel's extensive collection of *Components*
(300+) enables you to connect to all kinds of external systems. The great news is that these Components can now be used as
Connectors thanks to a new sub-project called *CamelKafkaConnect* (will use the SJMS2 as an example).

## Use case

We want to focus on the technology, so the use case is relatively simple, but includes both routing and transformation
logic. The requirement is to stream all new customers from a source table to XML and JSON sink queues.
```
                                     |---> (xml-sink-queue)
(source-table) ---> [cdc-process] ---|
                                     |---> (json-sink-queue)
```

## Implementations

No matter what technology you use, the CDC process must run as a single thread to maintain ordering.
Since Debezium records the log offset asyncronously, any final consumer of these changes must be idempotent.

Important change event properties: `lsn` (offset) is the log sequence number that tracks the position in the database
WAL (write ahead log), `txId` represents the identifier of the server transaction which caused the event, `ts_ms`
represents the number of microseconds since Unix Epoch as the server time at which the transaction was committed.

Prerequisites: Postgres 11, OpenJDK 1.8 and Maven 3.5+.

[GET CODE HERE](https://github.com/fvaleri/cdc/tree/blog)

### External systems setup

Enable transaction log access and start Postgres.
```sh
# postgresql.conf: configure replication slot
wal_level = logical
max_wal_senders = 1
max_replication_slots = 1
# pg_hba.conf: allow localhost replication to debezium user
local   cdcdb       cdcadmin                                trust
host    cdcdb       cdcadmin        127.0.0.1/32            trust
host    cdcdb       cdcadmin        ::1/128                 trust
```

There is a simple script to create and initialize the database.
This script can also be used to query the table and produce a stream of changes.
```sh
./run.sh --database
./run.sh --query
./run.sh --stream
```

Then, start Artemis broker and open the [web console](http://localhost:8161/console) (login: admin/admin).
```sh
./run.sh --artemis
# status check
ps -ef | grep "[A]rtemis" | wc -l
```

### KafkaConnect CDC pipeline

This is the KafkaConnect distributed mode architecture that we will configure to fit our use case.
```
SourceConnector --> KafkaConnectDM [Worker0JVM(TaskA0, TaskB0, TaskB1),...] --> SinkConnector
                                |
                    Kafka (offsets, config, status)
```

We will run all components on localhost, but ideally each one should run in a different host (physical, VM or container).
Connect workers operate well in containers and in managed environments. Take a look at the [Strimzi](https://strimzi.io)
project if you want to know how to easily operate Kafka and KafkaConnect on Kubernetes platform.

We need a Kafka cluster up and running (3 ZooKeeper + 3 Kafka). This step also download and install all required Connectors
(debezium-connector-postgres, camel-sjms2-kafka-connector) and dependencies.
```sh
./run.sh --kafka
# status check
ps -ef | grep "[Q]uorumPeerMain" | wc -l
ps -ef | grep "[K]afka" | wc -l
```

Now we can start our 3-nodes KafkaConnect cluster in distributed mode (workers that are configured with matching `group.id`
values automatically discover each other and form a cluster).
```sh
./run.sh --connect
# status check
ps -ef | grep "[C]onnectDistributed" | wc -l
tail -n100 /tmp/kafka/logs/connect.log
/tmp/kafka/bin/kafka-topics.sh --zookeeper localhost:2180 --list
curl localhost:7070/connector-plugins | jq
```

The infrastructure is ready and we can finally configure our CDC pipeline.
```sh
# debezium source task (topic name == serverName.schemaName.tableName)
curl -sX POST -H "Content-Type: application/json" localhost:7070/connectors -d @connect-cdc/src/main/connectors/dbz-source.json

# jms sink tasks (powered by sjms2 component)
curl -sX POST -H "Content-Type: application/json" localhost:7070/connectors -d @connect-cdc/src/main/connectors/json-jms-sink.json
curl -sX POST -H "Content-Type: application/json" localhost:7070/connectors -d @connect-cdc/src/main/connectors/xml-jms-sink.json

# status check
curl -s localhost:7070/connectors | jq
curl -s localhost:7070/connectors/dbz-source/status | jq
curl -s localhost:7070/connectors/json-jms-sink/status | jq
curl -s localhost:7070/connectors/xml-jms-sink/status | jq
```

Produce some more changes and check queues.
```sh
./run.sh --stream
```

### Camel CDC pipeline

This is our Camel CDC pipeline designed using EIPs.
```
                                                                       |--> [format-converter] --> (xml-queue)
(postgres-db) --> [dbz-endpoint] --> [type-converter]--> [multicast] --|
                                                                       |--> [format-converter] --> (json-queue)
```

We use the *Debezium PostgreSQL Component* as the endpoint which creates an event-driven consumer.
This is a wrapper around Debezium embedded engine which enables CDC without the need to maintain Kafka clusters.

Compile and run the application.
```sh
mvn clean compile exec:java -f ./camel-cdc/pom.xml
```

Produce some more changes and check queues.
```sh
./run.sh --stream
```

## Considerations

Both CDC solutions are perfectly valid but, depending on your experience, you may find one of them more convenient.
If you already have a Kafka cluster, an implicit benefit of using KafkaConnect is that it stores the whole change log
in a topic, so you can easily rebuild the application state if needed.

Another benefit of running on top of KafkaConnect in  distributed mode is that you have a fault tolerant CDC process.
It is possible to achieve the same by running the Camel process as
[clustered singleton service](https://www.nicolaferraro.me/2017/10/17/creating-clustered-singleton-services-on-kubernetes)
on top of Kubernetes.

One thing to be aware of is that Debezium offers better performance because of the access to the internal transaction log,
but there is no standard for it, so a change to the database implementation may require a rewrite of the corresponding plugin.
This also means that every data source has its own procedure to enable access to its internal log.

Connectors configuration allows you to transform message payload by using single message transformations (SMTs), that can be
chained (sort of Unix pipeline) and extended with custom implementations. They are actually designed for simple modifications
and long chains of SMTs are hard to maintain and reason about. Moreover, remember that transformations are synchronous and
applied on each message, so you can really slowdown the streaming pipeline with heavy processing or external service calls.

In cases where you need to do heavy processing, split, enrich, aggregate records or call external services, you should use a
stream processing layer between Connectors such as Kafka Streams or plain Camel. Just remember that Kafka Streams creates
internal topics and you are forced to put transformed data back into some Kafka topic (data duplication), while this is just
an option using Camel.
