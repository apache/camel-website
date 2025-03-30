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

## Camel JBang

## Camel AI

## Camel Micrometer

## Camel Spring Boot

The `camel-spring-boot` is upgraded to latest Spring Boot 3.4.4 release.

## Miscellaneous

Upgraded many third-party dependencies to the latest releases at the time of release.

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

