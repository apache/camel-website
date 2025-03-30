---
title: "Apache Camel 4.11 What's New"
date: 2025-04-12
authors: [davsclaus]
categories: ["Releases"]
preview: Details of what we have done in the Camel 4.11 release.
---

Apache Camel 4.11 has just been [released](/blog/2025/04/RELEASE-4.11.0/).

This release introduces a set of new features and noticeable improvements that we will cover in this blog post.

## Camel Core

The component _verifier extension_ has been deprecated. This functionality has not been in use for many years,
and we will start to deprecate more of these un-used features in camel-core going forward.

## Camel JBang

Camel JBang now supports running on Eclipse OpenJ9 Java platforms.

Added `camel edit` command to be able to edit source file using a terminal editor (nano).

Fixed Camel JBang to be able to run on Windows with Quarkus and Spring Boot runtimes.

The export command has been further hardened to better export using beans that may trigger initialization code
that would not work during export phase.

## Camel SQL

The `camel-sql` component now supports for non-named SQL queries to use Map message body, where the values
of the Map is used as SQL parameters (in the order they are in the Map, so use LinkedHashMap).

We have also significantly improved the performance when using SQL batch insert or updates.

## Camel Test

Added `@StubEndpoints` annotation to make it easy to stub a given component, such as kafka, so you
can easily write unit tests without having to use Kafka but let it be _stubbed_ by Camel and act
as an internal message queue (ala camel-seda).

We have also made it easier to turn off auto-starting specific routes, using the new `AutoStartupExcludePattern` option (or `@@AutoStartupExclude` annotation).
This allows to exclude routes (by pattern) so you can write unit tests  and fully control which routes are included and started in the tests.


## Camel Spring Boot

The `camel-spring-boot` is upgraded to latest Spring Boot 3.4.4 release.

## Miscellaneous

Upgraded many third-party dependencies to the latest releases at the time of release.

The `camel-bean` component has been improved to better support invoking methods with varargs parameter.

The file based components (`camel-file`, `camel-ftp`, `camel-azure-files`, and `camel-smb`) now better support dynamic polling using `poll` or `pollEnrich` EIPs with dynamic
computed endpoint, such as `fileName` by using `PollDynamicAware` that is specially optimized for these use-cases.

The `camel-smb` component now also has the `autoCreate` option to let Camel automatic create non-existing starting directory.

The `camel-http` component has more improvements in regards to OAuth2 support.

In `camel-kafka` we added the option `topicMustExists` to tell Camel to check whether a given topic exist or not on startup.
This can be used to ensure Camel will only consume from existing topics, and otherwise fail if an expected topic does not exists in the broker.

Added `list` and `map` functions to simple language so you can more easily create list/map objects.

The `camel-bom` Maven BOM no longer include a hugh google-bom that could cause builds to be much slower.

## New Components

We have added a few new components:

- `camel-dfdl` - Transforms fixed format data such as EDI message from/to XML using a Data Format Description Language (DFDL).
- `ibm-secrets-manager` - Manage secrets in IBM Secrets Manager Service
- `camel-oauth` - Camel OAuth
- `camel-opentelemetry2`  - Implementation of Camel Opentelemetry based on the Camel Telemetry spec
- `camel-telemetry` - Distributed telemetry common interfaces
- `camel-telemetry-dev` - Basic implementation of Camel Telemetry useful for development purposes

## Upgrading

Make sure to read the [upgrade guide](/manual/camel-4x-upgrade-guide-4_11.html) if you are upgrading from a previous Camel version.

If you are upgrading from, for example, 4.4 to 4.8, then make sure to follow the upgrade guides for each release in-between, i.e.
4.4 -> 4.5, 4.5 -> 4.6, and so forth.

The Camel Upgrade Recipes tool can also be used to automate upgrading.
See more at: https://github.com/apache/camel-upgrade-recipes

## Release Notes

You can find more information about this release in the list of JIRA tickets resolved in the release:

- [Release notes 4.11](/releases/release-4.11.0/)

## Roadmap

The following 4.12 release is planned for July 2025.

