---
title: "Apache Camel 4.10 What's New"
date: 2025-02-12
authors: [davsclaus]
categories: ["Releases"]
preview: Details of what we have done in the Camel 4.10 release.
---

Apache Camel 4.10 LTS has just been [released](/blog/2025/02/RELEASE-4.10.0/).

This release introduces a set of new features and noticeable improvements that we will cover in this blog post.

## Camel Core

TODO:

## Camel JBang

TODO:

### Camel JBang Kubernetes

TODO:

## Camel Spring Boot

The `camel-spring-boot` is upgraded to latest Spring Boot 3.4.2 release.

### Camel Spring Boot Platform HTTP

TODO:

## Miscellaneous

Upgraded many third-party dependencies to the latest releases at the time of release.

## New Components

We have added a few new components:

- `camel-kserve` - Provide access to AI model servers with the KServe standard to run inference
- `camel-neo4j` - Perform operations on the Neo4j Graph Database
- `camel-tensorflow-serving` - Provide access to TensorFlow Serving model servers to run inference with TensorFlow saved models remotely

## Upgrading

Make sure to read the [upgrade guide](/manual/camel-4x-upgrade-guide-4_10.html) if you are upgrading from a previous Camel version.

If you are upgrading from, for example, 4.4 to 4.8, then make sure to follow the upgrade guides for each release in-between, i.e.
4.4 -> 4.5, 4.5 -> 4.6, and so forth.

The Camel Upgrade Recipes tool can also be used to automate upgrading.
See more at: https://github.com/apache/camel-upgrade-recipes

## Release Notes

You can find more information about this release in the list of JIRA tickets resolved in the release:

- [Release notes 4.10](/releases/release-4.10.0/)

## Roadmap

The following 4.11 release is planned for Apr 2025.

