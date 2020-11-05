---
title: "Apache Camel 3.3 What's New"
date: 2020-05-16
authors: [davsclaus]
categories: ["Releases"]
preview: Details of what we have done in the Camel 3.3 release.
---

A few days ago Apache Camel 3.3 was released. This is a continuation of the work we are doing on Camel leading up to the first long term support release (LTS) that will be the next release v3.4.

In case you have missed this, the release model in Camel 3.x is following the principe of LTS and non-LTS releases (like Java JDKs). For more details see this [blog post](/blog/2020/03/LTS-Release-Schedule/).

What this means is that we will not do patch releases for Camel 3.3.x, but move ahead for Camel 3.4.

### So whats in this release?

This release is mostly a more robust and bug fix release. 

We have also continued the work to make Camel more modular and lighter. There was some work done to
separate Camel more from JAXB which now should be complete. This helps Camel on GraalVM and native compilation
as JAXB is a heavy piece of stack, allowing GraalVM to eliminate it more easily.

We continued to remove usage of reflection in Camel and now all Circuit Breaker
implementations are reflection free. The rest-dsl is now also reflection free.

We also identified a bug reported that revealed the reactive routing engine would not in some rare
situations not execute tasks fairly.

The component list now lists whether a component is Stable, Preview or Experimental. This allows
our end users to better judge when to use a component. We have also updated the one line summary
of each component to better explain what the component does.

The endpoint-dsl had a number of annoying bugs fixed and other improvements.
More improvements coming in Camel 3.4.

We also worked on the supervising route controller which allows to startup Camel
and let the route controller gracefully handle routes that fails during startup, and
then have strategies for restarting those routes with backoff delays.
More improvements coming in Camel 3.4.

The `camel-main` has also been improved to give a better foundation for running Camel
across different runtimes such as Spring Boot, Standalone, Quarkus, Camel K, and Camel Kafka Connector.
More to come in Camel 3.4.

A few more components added to the release:

- Azure Storage Blob Service
- Azure Queue Blob Service
- Deep Java Library
- Splunk HEC

### Roadmap to Camel 3.4 LTS

The next release 3.4 is the first LTS release of Camel 3.x. This means the release will have patch releases
containing important bug fixes and security vulnerabilities (we focus on production stability).

We aim to release 3.4 in June or maybe it slips into start of July.

In this release we expect to upgrade to Spring Boot 2.3, finish the work on endpoint-dsl, 
and the supervising route controller, and the usual stuff with bug fixes and what else.
