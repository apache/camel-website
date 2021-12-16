---
title: "Apache Camel 3.14 What's New"
date: 2021-12-17
authors: [davsclaus]
categories: ["Releases"]
preview: Details of what we have done in the Camel 3.14 LTS release.
---

Apache Camel 3.14 has just been [released](/blog/2021/12/RELEASE-3.14.0/).

This is the **last** LTS release supporting Java 8, and therefore we have
extended the support period from 1 to 2 years.

This blog post first details the noteworthy changes since the last 3.11 LTS release from 6 months ago.

## So what's in this release (6 months for work) 

This release introduces a set of new features and noticeable improvements that we will cover in this blog post.

### Documentation

We have polished, cleaned up, and updated most of the documentation in 2nd half this year.
We will continue this work in 1st half next year to complete this work.

### Core

Configuring data formats, and thread pools are now reflection free (Native compilation friendly).

We identified a few places to improve performance by reducing object allocations
in the Camel event notification system.

Logging with logMask=true to hide sensitive information now masks all known
secured keywords gather from all the Camel components.

Added a new `LambdaEndpointRouteBuilder` that uses the type-safe Endpoint DSL.

The tracer can now be set to standby, which allows enabling tracing later during runtime.

### Route Configuration

Route configuration is used for separating configurations from the routes. This can be used in situations such as configuring different error handling across a set of routes. In previous versions of Camel this was more cumbersome to do, as you would either have to copy the same configuration to a set of routes or rely on global error handling configuration.
Now you can configure a number of route configurations, and then specify on each route which configuration to use (you can use match by ids, wildcards, and regular expression).

### Reload Routes

The route reload functionality in Camel is capable of watching a directory folder for file changes, and then automatic trigger reload of the running routes in the Camel application.
This functionality is intended for development purposes, and not for production use.

You can see the reloading in action from one of the examples such as: https://github.com/apache/camel-examples/tree/master/examples/main-xml

### Kamelets

Kamelets is a higher level building blocks that we keep innovating and improve over the coming releases.
For Camel 3.14 we worked on making Kamelets more configurable, and more self-contained.

A Kamelet is now capable of configuring its own component instances which avoids clashing
with other kamelets or regular components (local beans). This ensures a Kamelet is a _black box_.

We made using `AggregationStrategy` easier with scripting languages, which allows
for example Kamelets to embed code as the strategy directly in the Kamelet spec file.

### Health Checks

Camel components can now provide custom health checks which can be automatic discovered by Camel.

We added new health checks for route consumers so a consumer can more preciesly
report health status, and in case of errors, then the consumer reports more detailed
information about the cause such as exception, and http status codes etc.

Camel now also ensures scheduled based consumers, is run at least once during startup
before the health check can be regarded as UP. Previously what could happen is that Camel
would report UP during startup, and then on first run by the consumer, it is causing an
error and then the health check status would soon after be flipped to DOWN.

There are now also more configurations to fine-tune the health checks such as number of
successive calls before a reporting as either UP or DOWN (flaky checks).

We will continue to improve health checks in the upcoming releases.

### JBang

CamelJBang is used to quickly try and run Camel applications.

[JBang](https://www.jbang.dev/) makes it very easy to run Java without all the ceremony.
With CamelJBang we made it possible for anyone to quickly try Camel.

The Camel Karavan Designer uses CamelJBang in its editor that allows you to visually
builder Camel integrations and run them with ease while designing directly from the editor or web-browser.

### Kafka

TODO:

### Salesforce

The `camel-salesforce` component has had many bug fixes and improvements implemented,
making it more reliable and robust.

### Cloud component

The Camel AWS, Azure, Google, and HuaweiCloud components have had various bug fixes and smaller improvements.

### Quarkus

The upcoming Camel Quarkus 2.6 release will be upgraded to Camel 3.14. 

### Spring Boot

We have upgraded to the latest Spring Boot 2.6 release.

### Better Java 17 support

Although Java 17 is not officially supported, we did improve a few Camel components to make them work with Java 17.
The official support is Java 11 (primary) and Java 8 (secondary).

### New components

This release has a number of new components:

- `camel-azure-servicebus` - Stream events from or to Azure Event Hubs using AMQP protocol.
- `camel-huaweicloud-imagerecognition` - To identify objects, scenes, and concepts in images on Huawei Cloud 
- `camel-huaweicloud-dms` - To integrate with a fully managed, high-performance message queuing service on Huawei Cloud 
- `camel-huaweicloud-obs` - To provide stable, secure, efficient, and easy-to-use cloud storage service on Huawei Cloud 
- `camel-json-patch` - Transforms JSON using JSON patch (RFC 6902). 
- `camel-springdoc-starter` - Springdoc Swagger UI for openapi-java in Spring Boot

## Upgrading

Make sure to read the [upgrade guide](/manual/camel-3x-upgrade-guide-3_14.html) if you are upgrading from a previous Camel version.

## Release Notes

You can find more information about this release in the with a list of JIRA tickets resolved in the release: 

- [release notes 3.12](/releases/release-3.12.0/)
- [release notes 3.13](/releases/release-3.13.0/)
- [release notes 3.14](/releases/release-3.14.0/)

