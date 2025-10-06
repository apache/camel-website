---
title: "Apache Camel 4.15 What's New"
date: 2025-10-08
draft: false
authors: [ davsclaus]
categories: [ "Releases" ]
preview: "Details of what we have done in the Camel 4.15 release."
---

Apache Camel 4.15 has just been [released](/blog/2025/10/RELEASE-4.15.0/).

This release introduces a set of new features and noticeable improvements that we will cover in this blog post.

## Camel Core

## Camel JBang

## Camel Spring Boot

`camel-spring-boot` is upgraded to the latest Spring Boot 3.5.6 release.

When Spring Boot Actuators and the camel-undertow-starter are used in a project, the undertow metrics are now exposed out of the box under the actuator endpoint.

## Java 25

We have prepared the code-base for the upcoming Java 25 release. However, this release does
not officially support Java 25, but we are not aware of any issues (feedback is welcome).
We will work on official Java 25 support in the following releases.

## Miscellaneous

Upgraded many third-party dependencies to the latest releases at the time of release.

## New Components

- `camel-aws2-textract` - Extract text and data from documents using AWS Textract
- `camel-aws2-transcribe` - Automatically convert speech to text using AWS Transcribe service
- `camel-docling` - Process documents using Docling library for parsing and conversion
- `camel-groovy-xml` - Transform between XML and Groovy Node (Map structure) objects.
- `camel-langchain4j-embeddingstore` - Provides support for 25+ vector databases using the LangChain4j EmbeddingStore API.
- `camel-keycloak` - Manage Keycloak instances via Admin API
- `camel-mdc` - Logging MDC (Mapped Diagnostic Context) Service
- `camel-micrometer-observability` - Micrometer Observability implementation of Camel Telemetry
- `camel-resilience4j-micrometer` - Micrometer statistics for Resilience4j circuit breaker

## Upgrading

Make sure to read the [upgrade guide](/manual/camel-4x-upgrade-guide-4_14.html) if you are upgrading from a previous
Camel version.

If you are upgrading from, for example, 4.4 to 4.8, then make sure to follow the upgrade guides for each release
in-between, i.e.
4.4 -> 4.5, 4.5 -> 4.6, and so forth.

The Camel Upgrade Recipes tool can also be used to automate upgrading.
See more at: https://github.com/apache/camel-upgrade-recipes

## Release Notes

You can find additional information about this release in the list of resolved JIRA tickets:

- [Release notes 4.15](/releases/release-4.15.0/)

## Roadmap

The following 4.16 release is planned for December 2025.

