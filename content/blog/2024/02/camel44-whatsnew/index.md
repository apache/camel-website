---
title: "Apache Camel 4.4 What's New"
date: 2024-02-19
authors: [davsclaus]
categories: ["Releases"]
preview: Details of what we have done in the Camel 4.4 release.
---

Apache Camel 4.4 (LTS) has just been [released](/blog/2024/02/RELEASE-4.4.0/).

This release introduces a set of new features and noticeable improvements that we will cover in this blog post.

## Camel Core

The simple language has been improved with `hash` function, and further improved the embedded functions for `jsonpath`, `jq` and `xpath`
making it easier to grab data from JSon or XML within your simple expression or predicates.

We have optimized data formats to avoid converting payload to `byte[]` when unmarshalling, but allowing each data format
to unmarshal the payload _as-is_. 

Added JMX operation to update routes at runtime via XML format (requires to turn on this feature). This can be
useful for tooling where you can then change routes during troubleshooting an existing running Camel integration.

## DSL

TODO: Throttler EIP
TODO: Variables

## Camel JBang (Camel CLI)

We have continued investing in Camel JBang, and this time we have some great new stuff in the release.

The `camel-jbang` now supports new commands as plugins. And the first set of commands is [camel-k commands](/manual/camel-jbang-k.html),
that allows to use `camel-jbang` to manage and operate Camel K integrations.

You can now run `camel-jbang` with `--prompt` that lets users type in placeholder values during startup,
making it easy to build examples and prototypes that can easily be customized to users need, when trying.

You can now more easily run `camel-jbang` with custom `log4j2.properties` file to use your logging configuration,
instead of the _built-in_ logging.

Added support for using Jolokia 2.x with `camel-jbang`.

## Kamelets

When using Kamelets then the _route snippets_ due not use any error handler. This means that when calling a Kamelet
then if any error happens these are thrown back, and allows to use your current error handling configuration. This
avoids any confusing, and you can regard calling a Kamelet just as calling a component; If they fail the exception is thrown back.

## Camel Kafka

TODO: batching consumer and other stuff

## Spring and Spring Boot

We have changed the recommended ordering of BOM from:

- `spring-boot-dependencies`
- `camel-spring-boot-bom`

To reverse the order so Camel comes first:

- `camel-spring-boot-bom`
- `spring-boot-dependencies`

See more in the [upgrade guide](/manual/camel-4x-upgrade-guide-4_4.html). 

Upgraded to latest Spring Boot 3.2.2 release.


## Kotlin API

TODO: About the new DSL for Kotlin

## Miscellaneous

The `camel-grpc` can now do full streaming in proxy mode. 

The `camel-netty` has added support for using KQueue native transport.

The `camel-jms` component now adds a header to the `Message` with the actual JMS destination the message was sent to,
this is useful information, when using dynamic computed queue names.

The `camel-kubernetes` component can now auto-create `KubernetesClient` if needed, making it easier to use when running inside
a Kubernetes pod.

Upgraded many 3rd party dependencies to latest release at time of release.

## New Components

- `camel-beanio` - **Added back:** Marshal and unmarshal Java beans to and from flat files (such as CSV, delimited, or fixed length formats).
- `camel-jte` - Transform messages using a Java based template engine (JTE).
- `camel-wasm` - Invoke Wasm functions.
- `kotlin-api` - API for the new Kotlin DSL

## Upgrading

Make sure to read the [upgrade guide](/manual/camel-4x-upgrade-guide-4_4.html) if you are upgrading from a previous Camel version.

## Release Notes

You can find more information about this release in the list of JIRA tickets resolved in the release:

- [Release notes 4.4](/releases/release-4.4.0/)

## Roadmap

The following 4.5 release (non LTS) is planned for April/May 2024.

