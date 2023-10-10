---
title: "Apache Camel 4.1 What's New"
date: 2023-10-12
authors: [davsclaus]
categories: ["Releases"]
preview: Details of what we have done in the Camel 4.1 release.
---

Apache Camel 4.1 (non LTS) has just been [released](/blog/2023/10/RELEASE-4.1.0/).

This release introduces a set of new features and noticeable improvements that we will cover in this blog post.

## Camel Core

TODO: Stuff here

## Camel JBang (Camel CLI)

TODO: A lot of stuff here

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

## New Components

- camel-aws2-redshift-data - Perform operations on AWS Redshift using Redshift Data API.
- camel-aws2-timestream - A Camel Amazon Web Services TimeStream component
- camel-thymeleaf - Transform messages using a Thymeleaf template.

## Upgrading

Make sure to read the [upgrade guide](/manual/camel-4x-upgrade-guide-4_1.html) if you are upgrading from a previous Camel version.

## Release Notes

You can find more information about this release in the list of JIRA tickets resolved in the release:

- [Release notes 4.1](/releases/release-4.1.0/)
