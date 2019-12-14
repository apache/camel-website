---
title: "Apache Camel Kafka Connector: Introducing the last project in the ecosystem"
date: 2019-12-14
author: Andrea Cosentino
categories: ["Apache"]
preview: Introducing Camel-Kafka-connector
---

In the last weeks the Apache Camel community introduced a new subproject in the ecosystem: Camel-Kafka-Connector. This project born as a PoC exploring the possibility of leveraging the Apache Camel components as Kafka source and sink connectors.
The main idea behind the project is reusing the Camel Components' flexibility in a simple way, through a configuration file mixing Kafka Connect configuration and Camel route definitions and options.

### What is Kafka Connect?

It is an Apache Kafka's framework that defines a standardized way to stream data in and out a kafka broker. In Kafka connect a user can define source and sink connectors to stream data, respectively, in and out a kafka broker.
This framework features:
- Distributed and standalone mode
- Rest interface
- Automatic offset management

### Kafka connect key concepts

- _Connector_: generally refer to a source/sink implemented using kafka connect framework.
- _SinkConnector_ / _SourceConnector_: are responsible to setting up the connector and partitiong the work by creating SinkTask / SourceTask.
- _SinkTask_ / _SourceTask_: are responsible to handle the actual work.
- _Key_ / _value converter_: a component able to convert the key or value of a kafka message from a format to another.
- _Transformer_: a component able to manipulate a message.

### Summarizing

This is just an introduction to the new subproject: we'll add more information and more posts while the project will go ahead. For the moment stay tuned and as always contributions are welcome. Show your love for the new arrival in the Camel family: [https://github.com/apache/camel-kafka-connector](https://github.com/apache/camel-kafka-connector):


