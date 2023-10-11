---
title: "Apache Camel 4.1 What's New"
date: 2023-10-12
authors: [davsclaus]
categories: ["Releases"]
preview: Details of what we have done in the Camel 4.1 release.
---

Apache Camel 4.1 (non LTS) has just been [released](/blog/2023/10/RELEASE-4.1.0/).

This release introduces a set of new features and noticeable improvements that we will cover in this blog post.

## DSL

The XML and YAML DSL now has better support for defining `<bean>` which can be configured with properties, and
references to other beans. We have added support for easier configuration to specify constructor arguments,
factory beans and methods, and inlined script or java code that gives full power for creating the bean.

We have also enhanced `camel-core` to make it able to dump route DSLs with <bean> included. This makes it possible
for Camel being able to migrate your route sources between XML and YAML DSLs (see more in next section).

The XML DSL `camel-xml-io` now have line-precise parsing error that shows you exactly where the problem is.

## Camel JBang (Camel CLI)

We have continued investing in Camel JBang, and this time we introduce the new DSL `transform` command, that can be
used for transforming your Camel source routes from one DSL to another (currently only XML and YAML is supported).

We also added best effort support for loading and running legacy OSGi blueprint XML files. This is intended for
Camel end users to have a tool they can use to assist them for migrating away from Apache Karaf to a modern
Camel runtime such as Spring Boot, Quarkus or vanilla Camel Main. You can use this to migrate those OSGi blueprint
XML files to standard Camel XML or YAML. We plan to publish a blog post about this in the near future.

Added `ignoreLoadingError` option to `run` and `transform` commands, that allows to keep running, even if there
is error loading route sources on startup.

The `export` is made more robust and can export, even if not all source code is present to fully run the project.

There is a new `sbom` command to generate SBom (CycloneDX or SPDX).

The `--jvm-debug` option in `run` can now be configured with the debugging port (4004 by default).

Added `camel get startup` command to output timed report of startup procedures that can help identify which part may be slow on startup.


## Camel Kafka

Added type converter for `byte[]` to `String` to make it easy to get Kafka header content as text value
(data is stored as byte array by Kafka).

## Camel OpenTelemtry

Added `OpenTelematryTracingStrategy` that allows fine-grained tracing of every step a message is routed by Camel.

Decorators now uses [OpenTelemtry Sematic Naming Style](https://opentelemetry.io/docs/specs/otel/trace/semantic_conventions/)
for tracing headers.

## Spring Boot

Upgraded to latest 3.1.4 release.

## Miscellaneous

The `camel-report:route-coverage` Maven plugin can now generate reports in HTML format.

The `file` component now have options to accept hidden files and directories.

The `xslt` component is more dynamic by make it possible to specify the XSLT template as a header,
meaning that each `Exchange` can use a dynamic computed stylesheet.

The `camel-aws-sqs` consumer is now batching visibility extension requests (reducing network bandwidth) for 
inflight messages currently being processed by Camel.

The `camel-aws-s3` producer can now upload big payloads without reading stream into memory.

The `rest` component can now use a custom `HeaderFilterStrategy`.

The HTTP server based components will now mute exceptions by default (avoid sending stactraces in HTTP 500 errors back to clients).
Set `muteException=false` to have old behaviour.

## New Components

- camel-aws2-redshift-data - Perform operations on AWS Redshift using Redshift Data API.
- camel-aws2-timestream - A Camel Amazon Web Services TimeStream component
- camel-thymeleaf - Transform messages using a Thymeleaf template.

## Upgrading

Make sure to read the [upgrade guide](/manual/camel-4x-upgrade-guide-4_1.html) if you are upgrading from a previous Camel version.

## Release Notes

You can find more information about this release in the list of JIRA tickets resolved in the release:

- [Release notes 4.1](/releases/release-4.1.0/)
