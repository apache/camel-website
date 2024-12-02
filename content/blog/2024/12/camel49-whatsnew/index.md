---
title: "Apache Camel 4.9 What's New"
date: 2024-12-06
authors: [davsclaus]
categories: ["Releases"]
preview: Details of what we have done in the Camel 4.9 release.
---

Apache Camel 4.9 has just been [released](/blog/2024/12/RELEASE-4.9.0/).

This release introduces a set of new features and noticeable improvements that we will cover in this blog post.

## Camel Core

Added _startup condition_ feature to let Camel perform some checks on startup,
before continuing. For example to check if a specific ENV exists, or wait
for a specific file to be created etc.

For low-code users that favour using Groovy then we made it possible to use the Log EIP with groovy instead of simple.
You can configure this with `camel.main.logLanguage = groovy`.

The Log EIP now formats the `${exchange}` output using the standard exchange formatter, which makes
it easier to see the content of the current `Exchange`.

The supervised route controller now emits `RouteRestartingEvent` when routes are attempted to be
started again after a previous failure. This allows to have _fined grained_ events for what happens.

TODO: stuff here

## DSL

You can now globally configure data formats in XML and YAML DSL also, which makes it easier to
set up your data formats once, and reuse these within all your routes by referring to their ids.

## Camel JBang

The `camel get properties` can now show property placeholder values with default vs actual value, such
as when values are applied from ENV variables. This makes it possible to better track how a value was configured.


## ???? 

TODO: stuff here

## Miscellaneous

Upgraded many third-party dependencies to the latest releases at the time of release.

The `camel-spring-boot` is upgraded to latest Spring Boot 3.4.0 release.


## New Components

We have added a few new components:

- `camel-clickup` - Receives events from ClickUp
- `camel-flowable` - Send and receive messages from the Flowable BPMN and CMMN engines.
- `camel-fury` - Serialize and deserialize messages using Apache Fury
- `camel-smooks` - Added smooks also as a data format

## Upgrading

Make sure to read the [upgrade guide](/manual/camel-4x-upgrade-guide-4_9.html) if you are upgrading from a previous Camel version.

If you are upgrading from, for example, 4.4 to 4.8, then make sure to follow the upgrade guides for each release in-between, i.e.
4.4 -> 4.5, 4.5 -> 4.6, and so forth.

TODO: Upgrade recipes
https://github.com/apache/camel-upgrade-recipes

## Release Notes

You can find more information about this release in the list of JIRA tickets resolved in the release:

- [Release notes 4.9](/releases/release-4.9.0/)

## Roadmap

The following 4.10 release is planned for Feb 2025.

