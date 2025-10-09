---
title: "Apache Camel 4.15 What's New"
date: 2025-10-09
draft: false
authors: [ davsclaus,cunningt,squakez]
categories: [ "Releases" ]
preview: "Details of what we have done in the Camel 4.15 release."
---

Apache Camel 4.15 has just been [released](/blog/2025/10/RELEASE-4.15.0/).

This release introduces a set of new features and noticeable improvements that we will cover in this blog post.

## Camel Core

You can now easier extend Camel via 3d-party dependencies via Java ServiceLoader using the `ContextServicePlugin` SPI.

You can add custom sensitive keys to `camel.main.additionalSensitiveKeywords` which Camel will mask in logging.

## Camel JBang

`camel debug` now also supports debugging Camel Quarkus applications, by executing `camel debug pom.xml` which will
detect that it's a Camel Quarkus Maven project, and then startup Quarkus via `mvn quarkus:dev` and attach
the Camel route debugger automatically.

The `camel get route-dump` now dumps in YAML format by default.

Added IBM MQ to `camel infra` which makes it easy to start up a local MQ broker for development purposes.

## Camel Groovy

Added the new `camel-groovy-xml` data format is a basic data format to transform XML to Groovy Node objects,
and back to XML. This is convenient when working with XML and using Groovy for data manipulation.

This data format is limited in functionality but intended to be easier to use. There are none or only a few options to configure.

## Camel Spring Boot

`camel-spring-boot` is upgraded to the latest Spring Boot 3.5.6 release.

When Spring Boot Actuators and the camel-undertow-starter are used in a project, the undertow metrics are now exposed out of the box under the actuator endpoint.

## YAML DSL

It is now possible to inline Maps in the `parameters` section. However Camel components rarely have options
that are Map based, but when they do this makes it easier to use. For example the plc4j component allow to
configure _tags_ as a Map:

```yaml
- from:
    uri: "timer://tick"
    parameters:
      period: "1s"
    steps:
      - to:
          uri: "plc4j"
          parameters:
            driver: "some driver url here"
            tags:
              "tags_2": "XXX"
              "tags_6": "YYY"
```

In this example the _tags_ options is of Map type and can be configured using YAML map syntax.
Because the keys use underscore, then they are quoted.

## Java 25

We have prepared the code-base for the upcoming Java 25 release. However, this release does
not officially support Java 25, but we are not aware of any issues (feedback is welcome).
We will work on official Java 25 support in the following releases.

## Micrometer Observability implementation of Camel Telemetry

Here a new implementation of the `camel-telemetry` component: `camel-micrometer-observability`. This component uses the technology offered by Micrometer and is available both trough Main and Spring Boot runtime. This component may result a bit more complicated to configure than other telemetry components: the framework is an abstraction layer, therefore it is expected that the integration developers configure the Registry and the Context Propagation mechanisms adding the concrete technology (Opentelemetry, Brave/Zipkin) of choice.

If you're using Spring Boot runtime, it will be much more easy as there are dependencies in charge to autoconfigure it. You can read all detailed information in the component page documentation.

## Logging MDC (Mapped Diagnostic Context) Service

We have introduced a new component which will make it easier the setting and usage of MDC traces in your applications. We haven't yet deprecated the older feature, but we'll likely do in the future. You're invited to start adopting the new component as soon as possible.

Adding the `camel-mdc` component (or related starter in Spring Boot and extension in Quarkus runtimes), you will be able to include traces information you want in the log by just declaring which are the Exchange headers or properties containing such info. This new component will let you include the trace in any DSL (you were kind of forced to do it only in Java before), for example:

```yaml
      - setHeader:
          name: "customHead"
          constant: "I am an header"
      - setProperty:
          name: "customProp"
          constant: "I am a property"
```

When activated (`camel.mdc.enabled=true`) you will get automatically a series of default MDC parameters and additionally you can add your own (see more configuration detail in the component page). From there onward you can declare the MDC you want to trace in your log according to your logging framework notation. For example, in Log4j it will be:

```text
... [%X{camel.contextId}, %X{camel.routeId}, %X{camel.exchangeId}, %X{camel.messageId}, %X{customHead}, %X{customProp}]
```

You won't need any longer to worry about context propagation. Neither the MDC will be interleaved in Camel threads which don't belong to route processing: consistent and clean.

## Miscellaneous

Upgraded many third-party dependencies to the latest releases at the time of release.

The `camel-file` used as clustered file-lock (`FileLockClusterView`) is now more resilient to split-brain scenarios.

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

