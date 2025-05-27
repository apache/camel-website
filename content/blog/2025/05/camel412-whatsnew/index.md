---
title: "Apache Camel 4.12 What's New"
date: 2025-05-28
draft: false
authors: [davsclaus,squakez]
categories: ["Releases"]
preview: "Details of what we have done in the Camel 4.12 release."
---

Apache Camel 4.12 has just been [released](/blog/2025/05/RELEASE-4.12.0/).

This release introduces a set of new features and noticeable improvements that we will cover in this blog post.

## Camel Core

## Camel JBang

## Camel Spring Boot

The `camel-spring-boot` is upgraded to latest Spring Boot 3.5.0 release.

## Miscellaneous

Upgraded many third-party dependencies to the latest releases at the time of release.

## New Components

We have added a few new components:

- `camel-dapr` - Dapr component which interfaces with Dapr Building Blocks.
- `camel-pqc` - Post Quantum Computing Signature and Verification component.
- `camel-weaviate` - Perform operations on the Weaviate Vector Database.
- `camel-jandex` - Custom class and resource loader using jandex.idx
- `camel-oauth` - Camel OAuth (Work in progress)

## Camel Main management port

Camel Quarkus and Spring Boot runtimes allow distinguish a managemet port from the regular HTTP services. We have introduced the same feature for `camel-main` runtime.

You can use a management server where to expose management endpoints (such as health, metrics, etcetera). The new server will be available by default on port `9876`. This and other several configuration can be changed using `camel.management` application properties group. In order to avoid breaking compatibility, the previous services running on business port (default `8080`) will be still running on the old port AND on the new port for a few future releases. However, you're invited to move your configuration and adopt the new `camel.management` embedded server for management services as soon as possible.

## Camel Observability Services using management port

As we have made this feature available across all the runtimes, we're using a management port (`9876`) to expose the observability services. This is an enhancement for security purposes and to allow any tool to be able to use a management port where available without affecting the availability of the regular services exposed by the application.

## Upgrading

Make sure to read the [upgrade guide](/manual/camel-4x-upgrade-guide-4_12.html) if you are upgrading from a previous Camel version.

If you are upgrading from, for example, 4.4 to 4.8, then make sure to follow the upgrade guides for each release in-between, i.e.
4.4 -> 4.5, 4.5 -> 4.6, and so forth.

The Camel Upgrade Recipes tool can also be used to automate upgrading.
See more at: https://github.com/apache/camel-upgrade-recipes

## Release Notes

You can find additional information about this release in the list of resolved JIRA tickets:

- [Release notes 4.12](/releases/release-4.12.0/)

## Roadmap

The following 4.13 release is planned for July 2025.

