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

### Camel File

The `camel-file` component has been optimized on the consumer scanning for files,
to lazy evaluate file size/modification, which often yields better performance,
as file filtering is usually only based on file names.

### Rest DSL

It is now possible to inline routes in Rest DSL which means that a Rest service corresponds to 1 route,
and not 2 as before. This requires to enable `inline-routes=true` in Rest configuration,
and to link the routes using `direct` endpoints.

### Security

We have upgraded to `TLSv1.3` as default, in components that are using SSL/TLS.


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

Camel Spring Boot now supports `platform-http` to make it easy to
define Camel routes that starts from the embedded HTTP server inside Spring Boot.

## Upgrading

Make sure to read the [upgrade guide](/manual/camel-3x-upgrade-guide-3_19.html) if you are upgrading from a previous Camel version.

## Release Notes

You can find more information about this release in the list of JIRA tickets resolved in the release: 

- [Release notes 3.19](/releases/release-3.19.0/)

