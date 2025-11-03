---
title: "Apache Camel 4.16 What's New"
date: 2025-11-05
draft: false
authors: [ davsclaus]
categories: [ "Releases" ]
preview: "Details of what we have done in the Camel 4.16 release."
---

Apache Camel 4.16 has just been [released](/blog/2025/11/RELEASE-4.16.0/).

This release introduces a set of new features and noticeable improvements that we will cover in this blog post.

## Camel Core

## Camel JBang

## Camel Spring Boot

`camel-spring-boot` is upgraded to the latest Spring Boot 3.5.7 release.

Camel now works again with JDK17 on Spring Boot (was not working in previous 4.15 release).

## Java 25

We continue to prepare the code-base for the upcoming Java 25 release. However, this release does
not officially support Java 25, but we are not aware of any issues (feedback is welcome).
We will work on official Java 25 support in the following releases.

There are some 3rd-party libraries that are not yet Java 25 compatible, and we are waiting for those
to release compatible versions.

## Miscellaneous

Upgraded many third-party dependencies to the latest releases at the time of release.

## New Components

- `camel-ibm-cos` - Store and retrieve objects from IBM Cloud Object Storage.
- `camel-ibm-watson-discovery` - Perform document understanding and search using IBM Watson Discovery
- `camel-ibm-watson-language` - Perform natural language processing using IBM Watson Natural Language Understanding
- `camel-pqc` - Encrypt and decrypt messages using Post-Quantum Cryptography Key Encapsulation Mechanisms (KEM).

## Upgrading

Make sure to read the [upgrade guide](/manual/camel-4x-upgrade-guide-4_15.html) if you are upgrading from a previous
Camel version.

If you are upgrading from, for example, 4.4 to 4.8, then make sure to follow the upgrade guides for each release
in-between, i.e.
4.4 -> 4.5, 4.5 -> 4.6, and so forth.

The Camel Upgrade Recipes tool can also be used to automate upgrading.
See more at: https://github.com/apache/camel-upgrade-recipes

## Release Notes

You can find additional information about this release in the list of resolved JIRA tickets:

- [Release notes 4.16](/releases/release-4.16.0/)

## Roadmap

The following 4.17 release is planned for January 2026.

