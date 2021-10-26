---
title: "Apache Camel 3.11 What's New"
date: 2021-06-29
authors: [davsclaus]
categories: ["Releases"]
preview: Details of what we have done in the Camel 3.11 LTS release.
---

Apache Camel 3.11 has just been [released](/blog/2021/06/RELEASE-3.11.0/).

This is a LTS release which will be supported for 1 year with regular patch and security releases.

This blog post first details the noteworthy changes since the last 3.10 release from last month.
For readers that are upgrading from the last 3.7 LTS release then we have added a summary section that highlights
all the important new features and changes (3.7 to 3.11).

At first what did we do since the 3.10 release.

## So what's in this release since 3.10

This release introduces a set of new features and noticeable improvements that we will cover in this blog post.

### Kamelets

Kamelets is a higher level building blocks that we keep innovating and improve over the coming releases.
For Camel 3.11 we worked on making Kamelets universal across the various runtimes such as standalone, Karaf, Spring Boot, and Quarkus.

We added a new `camel-kamelet-main` component that is intended for developers to try out or develop custom Kamelets.
This module runs standalone which is intentional as we want to ensure Kamelets are not tied to a specific runtime (or the cloud on Kubernetes)
but are truly universal in any environment where you can use Camel.

You can find an example with `camel-kamelet-main` at https://github.com/apache/camel-examples/tree/main/examples/kamelet-main

The YAML DSL has improved error reporting when parsing to better report to Camel end users where the problem is.

### Common Source timestamp

We added a `getSourceTimestamp` API on `Message` to get hold of the timestamp from the source of the message.
The idea is to have a common API across all the Camel components that has a timestamp of the event (such as JMS, Kafka, AWS, File/FTP etc).

### Cloud component

The Camel AWS, Azure, and HuaweiCloud components have had various bug fixes and smaller improvements.

### Quarkus

This release is the baseline for Quarkus 2 support which is to follow shortly after this release with a new Camel Quarkus release.

### Spring Boot

We have upgraded to latest Spring Boot 2.5.1 release.

### No OSGi code in main project

We had about six remaining Camel components which had some special OSGi Java source code.
The OSGi code has been ported over to the Camel Karaf project.

### Better Java 16 support

Although Java 16 is not officially supported, we did improve a few Camel components to make them work with Java 16.
The official support is Java 11 (primary) and Java 8 (secondary).

### New components

This release has a number of new components, data formats and languages:

- `camel-huaweicloud-functiongraph` - To call serverless functions on Huawei Cloud
- `camel-huaweicloud-iam` - To securely manage users on Huawei Cloud
- `camel-kamelet-main` - Main to run Kamelet standalone
- `camel-resourceresolver-github` - Resource resolver to load files from GitHub

## Upgrading

Make sure to read the [upgrade guide](/manual/camel-3x-upgrade-guide-3_11.html) if you are upgrading from a previous Camel version.

## Release Notes

You can find more information about this release in the [release notes](/releases/release-3.11.0/), with a list of JIRA tickets resolved in the release.


## Summary of changes since the last 3.7 LTS release

It is 6 months since the last 3.7 LTS release, and here is a high level summary of the most significant changes we have done:

- Optimized core (faster startup and quicker routing engine)
- Modularized core (even smaller core)
- Reduced Object Allocations (lower memory footprint)  
- Reflection free (Native compilation friendly)
- Optimized toD EIP for messaging based components
- Better startup and shutdown logging
- Java Flight Recorder
- Routes loader (Java, XML, YAML, Groovy, JavaScript, and Kotlin)
- YAML DSL
- Kamelets
- 17 new components
- Support for Spring Boot 2.5 and Quarkus 2.0

There are many other great new features and improvements that you can find detailed in each of the _Whats New_ blog posts:

- [Camel 3.8 What's New](/blog/2021/02/Camel38-Whatsnew/)
- [Camel 3.9 What's New](/blog/2021/03/Camel39-Whatsnew/)
- [Camel 3.10 What's New](/blog/2021/05/Camel310-Whatsnew/)
