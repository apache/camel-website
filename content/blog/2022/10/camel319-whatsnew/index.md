---
title: "Apache Camel 3.19 What's New"
date: 2022-10-10
authors: [davsclaus]
categories: ["Releases"]
preview: Details of what we have done in the Camel 3.19 release.
---

Apache Camel 3.19 has just been [released](/blog/2022/10/RELEASE-3.19.0/).

This release introduces a set of new features and noticeable improvements that we will cover in this blog post.

## Camel JBang (Camel CLI)

In this release we continue the expansion of Camel CLI.

You can now easily manage local running Camel integrations.

For example to list all running Camel processes:

    camel ps
    PID   NAME                          READY  STATUS    AGE
    61818  sample.camel.MyCamelApplica…   1/1   Running  26m38s
    62506  dude                           1/1   Running   4m34s

To see a bit more information, then you can use `camel get`.

Suppose you have two running processes, then you can manage them, such as stop,
or stop/start routes etc:

    camel stop dude
    Stopping running Camel integration (pid: 62506)

There is a lot more that Camel JBang can do, so make sure to see the [Camel JBang documentation](/manual/camel-jbang.html).
It is also a good idea to run `camel --help` to list all available commands.

There you can also find information how to get JBang installed, and after that install the camel app in JBang.

### Resume from Offset

TODO: Anything done here

### Camel YAML DSL

TODO: Anything done here

### Load properties from vault/secrets cloud services

TODO: Andrea update here

### Camel Kafka

TODO: Anything done here

### New Components

There are 5 new components:

- camel-aws-cloudtrail - Consume events from Amazon Cloudtrail
- camel-elasticsearch - Send requests to ElasticSearch via Java Client API
- camel-hyperledger-aries - Camel support for Hyperledger Aries
- camel-mapstruct - Type Conversion using Mapstruct
- camel-python - To use python scripts

### Spring Boot

We have upgraded to the latest Spring Boot 2.7 release.

## Upgrading

Make sure to read the [upgrade guide](/manual/camel-3x-upgrade-guide-3_19.html) if you are upgrading from a previous Camel version.

## Release Notes

You can find more information about this release in the list of JIRA tickets resolved in the release: 

- [Release notes 3.19](/releases/release-3.19.0/)

