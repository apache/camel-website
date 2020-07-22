---
title: "RELEASE 3.4.2"
url: /blog/release-3-4-2.html
date: 2020-07-22
draft: false
authors: [gzurowski]
categories: ["Releases"]
preview: "The Camel community announces the immediate availability of the new Camel 3.4.2 patch release"
---


The Camel community announces the immediate availability of Camel 3.4.2, a new patch release for the 3.4 LTS version with 6 new features, improvements and fixes.

The main reason we are releasing this version is that we compiled 3.4.1 with Java 11 which leads to issues as described in [this Github issue](https://github.com/eclipse/jetty.project/issues/3244).
Although we already have a fix for this problem (see [CAMEL-15309](https://issues.apache.org/jira/browse/CAMEL-15309)), we found that it would be safer to push out a release compiled with Java 8 so nobody gets affected by this or any similar problems. We plan to continue compiling with Java 8 until we eventually make Java 11 the base version for Camel.

The artifacts are published and ready for you to download from the Central Maven repository. For more details please take a look at the [release notes](/releases/release-3.4.2/).

Many thanks to all who made this release possible.

On behalf of the Camel PMC,  
Gregor Zurowski
