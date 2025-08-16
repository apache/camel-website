---
title: "Apache Camel 4.14 What's New"
date: 2025-08-20
draft: false
authors: [ davsclaus ]
categories: [ "Releases" ]
preview: "Details of what we have done in the Camel 4.14 LTS release."
---

Apache Camel 4.14 LTS has just been [released](/blog/2025/08/RELEASE-4.14.0/).

This release introduces a set of new features and noticeable improvements that we will cover in this blog post.

## Camel Core

## Camel JBang

## Camel AI

## Camel Spring Boot

`camel-spring-boot` is upgraded to the latest Spring Boot 3.5.4 release.

## Java 25

We have prepared the code-base for the upcoming Java 25 release. However, this release does
not officially support Java 25, but we are not aware of any issues (feedback is welcome).
We will work on official Java 25 support in the following releases.

## Miscellaneous

Upgraded many third-party dependencies to the latest releases at the time of release.

We made `camel-smb` more resilient and better recover when there are connectivity problems.

## New Components

- `camel-iso8583` - Create, edit and read ISO-8583 messages
- `came-langchain4j-agent` - AI Agent

## Upgrading

Make sure to read the [upgrade guide](/manual/camel-4x-upgrade-guide-4_14.html) if you are upgrading from a previous
Camel version.

If you are upgrading from, for example, 4.4 to 4.8, then make sure to follow the upgrade guides for each release
in-between, i.e.
4.4 -> 4.5, 4.5 -> 4.6, and so forth.

The Camel Upgrade Recipes tool can also be used to automate upgrading.
See more at: https://github.com/apache/camel-upgrade-recipes

## Release Notes

You can find additional information about this release in the list of resolved JIRA tickets:

- [Release notes 4.14](/releases/release-4.14.0/)

## Roadmap

The following 4.15 release is planned for October 2025.

