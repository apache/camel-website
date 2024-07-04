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

## Camel JBang

## Camel Tracing

## Miscellaneous

Upgraded many third-party dependencies to the latest releases at the time of release.

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

