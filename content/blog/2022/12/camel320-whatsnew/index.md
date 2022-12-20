
---
title: "Apache Camel 3.20 What's New"
date: 2022-12-21
authors: [davsclaus]
categories: ["Releases"]
preview: Details of what we have done in the Camel 3.20 release.
---

Apache Camel 3.20 has just been [released](/blog/2022/12/RELEASE-3.20.0/).

This release introduces a set of new features and noticeable improvements that we will cover in this blog post.

## Camel Core

The Split EIP has been optimized to perform faster and reduced overhead, when splitting by a single separator char.

When working with EIPs you may want to temporarily disable one or more EIPs. Today you have to comment out code, or remove the EIPs.
We have now introduced the `disabled` option which you quickly can enable on EIPs to turn off.
The Rest DSL also has the new `disabled` option to quickly turn off specific Rest endpoints/verbs.

The _tracer_ now outputs message bodies that are stream caching based, so users can see the content easily.

Routes can now have `prefixId` specified, which is a prefix to assign every node IDs in the route.
This makes it easy to separate node IDs when you have many routes, or are using route templates.

### Data Format DSL

The Data Format DSL is a builder API that allows using type safe construction of Camel Data Formats, .
and is exclusively available as part of the Java DSL.

The DSL can be accessed directly from the `RouteBuilder` thanks to the method `dataFormat()`.

### Language DSL

The Language DSL is a builder API that allows using type safe construction of Camel Languages,
and is exclusively available as part of the Java DSL.

The DSL can be accessed directly from the `RouteBuilder` thanks to the method `expression()`.

## Camel JBang (Camel CLI)

In this release we continue the expansion of Camel CLI.

Camel JBang now uses standard Maven for downloading JARs instead of using the ShrinkWrap project.

We have reduced the configuration summary _logging noise_ when using Kamelets.

Custom type converters are now detected by Camel JBang when downloading new JARs.

Camel JBang makes using `camel-micrometer` work out of the box, by automatic
creating a `MeterRegistry` if none is provided.

When using Rest DSL with api-doc enabled, then Camel JBang will automatically download `camel-openapi-java` if needed. 

Camel JBang now has shell completions which can be installed with the `camel completion` command,
to generate bash/zsh scripts.

The `camel export` command now supports choose Gradle as build-tool instead of Maven.

We have also added new comments to easily get details about:
- metrics
- health-checks
- inflight messages
- blocked messages
- quickly check total message/failure (easily parseable in shell scripting)

The `camel doc main` command shows all the _main_ option in tables.

Camel JBang will now compile `csimple` languages on startup, if in use.

Added `camel run --code='...'` to quickly run some Java DSL code. 

There is a lot more that Camel JBang can do, so make sure to see the [Camel JBang documentation](/manual/camel-jbang.html).
It is also a good idea to run `camel --help` to list all available commands.

There you can also find information how to get JBang installed, and after that install the Camel app in JBang.

### Camel Open Telemetry

Camel can now correct associate spans across both synchronous and asynchronous endpoints.

### Camel YAML DSL

The `camel-yaml-dsl` schema now includes error handler and route configuration.

Fixed intercept EIP did not work, when used in YAML DSL.

### Camel Kafka

Many bug fixes and smaller improvements.

### New Components

There are 8 new components:

- `camel-etc3` - Get, set, delete or watch keys in etcd v3 key-value store.
- `camel-influxdb2` - Interact with InfluxDB v2, a time series database.
- `camel-js` - Evaluates a JavaScript expression
- `camel-kubernetes-events` - Perform operations on Kubernetes Events and get notified on Events changes
- `camel-plc4x` - Read and write to PLC devices
- `camel-rocketmq` Send and receive messages from RocketMQ cluster
- `camel-swift` - Encode and decode SWIFT MT/MX messages
- `camel-wal` - Camel WAL component for the Resume API

### Spring Boot

We have upgraded to the latest Spring Boot 2.7 release.

The `camel-micrometer-starter` now have additional auto configuration options,
to easily configure micrometer settings.

## Upgrading

Make sure to read the [upgrade guide](/manual/camel-3x-upgrade-guide-3_20.html) if you are upgrading from a previous Camel version.

## Release Notes

You can find more information about this release in the list of JIRA tickets resolved in the release: 

- [Release notes 3.20](/releases/release-3.20.0/)

