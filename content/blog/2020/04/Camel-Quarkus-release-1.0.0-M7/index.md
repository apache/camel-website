---
title: "Camel Quarkus 1.0.0-M7 Released"
date: 2020-04-30
authors: ["ppalaga"]
categories: ["Releases"]
preview: What's new in Camel Quarkus 1.0.0-M7
---

The Apache Camel community is pleased to announce the release 1.0.0-M7 of Camel Quarkus. Camel Quarkus ports the
outstanding integration capabilities of Apache Camel to [Quarkus](https://quarkus.io/) - the toolkit for writing subatomically small and
supersonically fast Java, Kotlin and Scala applications.

So what is new in Camel Quarkus 1.0.0-M7?

## Java 8 is deprecated

Camel Quarkus works well on Java 11 (thanks Luca and James!). We can hardly support Java 8 without Quarkus itself
supporting it. As a matter of fact, Quarkus
[announced](https://quarkus.io/blog/quarkus-1-4-final-released/#java-8-deprecated) three days ago (2010-04-27) that
as of Quarkus 1.4 they are deprecating Java 8 and that it will be removed in Quarkus 1.6 in about two months from now.
Based on that we are deprecating Java 8 now.

Supporting both Java 8 and 11 binds some resources in our rather small team. We would like to simplify our testing
matrix and remove some Java version specific Maven profiles. We prefer doing it sooner rather than later so that we can
concentrate on other useful stuff (porting new extensions, etc.) So we are going to drop Java 8 support two Camel
Quarkus releases from now.

## New bits

We do not have many new extensions this time. Most of the work was invested into adding native support to existing
JVM-only components.

New components:

* AWS 2 S3 Storage Service

Components promoted from JVM-only to JVM+native:

* AWS 2 CloudWatch
* AWS 2 Simple Notification System
* AWS 2 Simple Queue Service
* InfluxDB
* Kubernetes ConfigMap
* Kubernetes Deployments
* Kubernetes HPA
* Kubernetes Job
* Kubernetes Namespaces
* Kubernetes Nodes
* Kubernetes Persistent Volume
* Kubernetes Persistent Volume Claim
* Kubernetes Pods
* Kubernetes Replication Controller
* Kubernetes Resources Quota
* Kubernetes Secrets
* Kubernetes Service Account
* Kubernetes Services
* Kudu
* Openshift Build Config
* Openshift Builds

All supported bits can be seen in the [List of Camel Quarkus extensions](/camel-quarkus/latest/reference/index.html).

## Quarkus 1.4.1

Quarkus was upgraded to 1.4.1 (from 1.3.2 in Camel Quarkus 1.0.0-M6).

Enjoy and give feedback either via [mailing lists](/community/mailing-list/)
or [GitHub issues](https://github.com/apache/camel-quarkus/issues)!
