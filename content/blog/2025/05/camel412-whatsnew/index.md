---
title: "Apache Camel 4.12 What's New"
date: 2025-05-28
draft: false
authors: [davsclaus]
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

