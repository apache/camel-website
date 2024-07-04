---
title: "Apache Camel 4.7 What's New"
date: 2024-07-12
authors: [davsclaus,gzurowski]
categories: ["Releases"]
preview: Details of what we have done in the Camel 4.7 release.
---

Apache Camel 4.7 has just been [released](/blog/2024/07/RELEASE-4.7.0/).

This release introduces a set of new features and noticeable improvements that we will cover in this blog post.

## Camel Core

The _route template_ has some fixes and improvements, such as that a full local copy
of the template is created when creating routes from the template; this prevents _unforeseen side effects_
when the same template is used later to create new routes.

## Camel Management

Added _remote_ performance counters to `CamelContext` and `Routes` which counts only
messages that are received from an endpoint that is _remote_. In other words internal endpoints
such as timers, cron, seda etc. are not being counted. This makes it quicker and easier
to know how many messages Camel has processed received from external systems.

## Camel JBang

Many bug fixes and improvements to make the overall use of this great tool much better.

The `camel get bean` command shows your custom _beans_ from YAML and XML DSLs which makes
it easy to see their configuration vs runtime properties, to ensure they are configured correctly.

Added `camel get rest` command to easily see all your rest endpoint and operations hosted in your Camel integrations.

The `camel generate` command has been moved into its own plugin, which must be installed first to be usable.

## Camel Tracing

Added more trace decorators for more components. This gives more components specific metadata
in the trace spans. 

## Miscellaneous

The `camel-as2` has been made more robust and better support for using compression.

Added `substring`, `replace` and `fromRouteId` functions to the simple language.

When using custom beans in YAML and XML DSL then constructor parameters now support
to lookup others beans.

We have fixes older reported bugs, and at this time of writing there are 12 known in JIRA.

Upgraded many third-party dependencies to the latest releases at the time of release.

The `camel-spring-boot` is upgraded to latest Spring Boot 3.3.1 release.

## New Components

We have added a few new components:  

- `camel-activemq6` - JMS component that are preset for ActiveMQ 6.x
- `camel-smooks` -  EDI, XML, CSV, etc. based data transformation using Smooks
- `openapi-validator` - OpenAPI validator for Camel Rest DSL (using Atlassian Validator Client)

## Upgrading

Make sure to read the [upgrade guide](/manual/camel-4x-upgrade-guide-4_7.html) if you are upgrading from a previous Camel version.

If you are upgrading from, for example, 4.4 to 4.7, then make sure to follow the upgrade guides for each release in-between, i.e.
4.4 -> 4.5, 4.5 -> 4.6, and so forth.

## Release Notes

You can find more information about this release in the list of JIRA tickets resolved in the release:

- [Release notes 4.7](/releases/release-4.7.0/)

## Roadmap

The following 4.8 release (LTS) is planned for Sep 2024.

