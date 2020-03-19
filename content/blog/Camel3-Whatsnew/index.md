---
title: "Apache Camel 3 What's New (top 10)"
date: 2019-12-02
author: Claus Ibsen
github_user: davsclaus
categories: ["Releases"]
preview: Top 10 of what's new in Apache Camel version 3
---

Apache Camel 3 was released last thursday November 28th 2019, which also happens to be the day of the US Thanksgiving. This was not intentionally but we can say its a big thanks from us to the community with a brand new major version of Camel - this does not come often by. In fact, its 10 years since Camel 2 hit the streets. So this 3rd generation is long overdue.


This blog post highlights the noteworthy new features and improvements in Camel v3.

### 1) Camel is now a family of projects

Apache Camel, is now a family of projects (3 at this time of writing).
- [Camel 3](https://github.com/apache/camel):
  **Integration Framework** _Swiss knife of integration_
- [Camel K](https://github.com/apache/camel-k/):
  **Lightweight Serverless Integration Platform** _Camel on Kubernetes & Knative_
- [Camel Quarkus](https://github.com/apache/camel-quarkus):
  **Camel extensions for Quarkus** _Optimized JVM & Native compiled Java (GraalVM)_

{{< image "camel3-projects.png" "Camel 3 projects" >}}

The Camel code-base is very large, and we have setup sub-projects for new innovative projects using Camel. The first sub-project was to run Camel as cloud-native on Kubernetes in a serverless manner which became Camel K. Then Camel Quarkus came to make Java and Camel with very fast startup and very small memory footprint primary for container based deployments. 

### 2) New Website

{{< image "camel3-website.png" "Camel 3 website" >}}

A major goal for Camel 3 was to finally revamp the old aging website to use modern technologies and be able to auto-generate content from the source code. This has taken years to get to this point as we have built tools over the last many Camel 2.x releases that could take us closer.
At the end of 2019 then the Camel community and others stepped up and provided the new art-work, logo, and look and feel for the new website - thank you very much!.

For Camel 3.x we will continue to improve the website and the documentation. This is much easier for us to do, and also for people to contribute changes as its just a regular github PR to provide updates. We love contributions.

Zoran had some fun with the new look and feel and he added a little gem; if you stare at the front page, then you should see a little animation of the curved bezel ;)

### 3) Java 11

Camel 3 is the first official release that supports Java 11. Java 8 will still be supported for the first number of 3.x releases, but is expected to be dropped later in 2020. However we wanted to provide Java 8 support to help migrate Camel 2.x users who may be restricted to Java 8 for some time to come.

### 4) Modularized camel-core

The camel-core has been modularized from 1 JAR to 33 JARs. The core functionality has been splitup into:

**Artifact**

- camel-api
- camel-base
- camel-caffeine-lrucache
- camel-cloud
- camel-core
- camel-core-engine
- camel-core-osgi
- camel-core-xml
- camel-endpointdsl
- camel-headersmap
- camel-jaxp
- camel-main
- camel-management-api
- camel-management-impl
- camel-support
- camel-util
- camel-util-json

For Camel end users then only a few JARs are relevant.

**camel-api** contains the public API for Camel (eg interfaces such as CamelContext, Endpoint, Exchange, Message, and so on).

**camel-support** contains the base classes and `RouteBuilder` which you would use to build Camel routes and applications. This JAR also contains necessary base classes for building custom Camel components, and other kinds of plugins.

The components that resided in camel-core has also be externalized into individual components:

**Artifact**

- camel-bean
- camel-log
- camel-stub
- camel-browse
- camel-mock
- camel-timer
- camel-controlbus
- camel-properties
- camel-validator
- camel-dataformat
- camel-ref
- camel-vm
- camel-direct
- camel-rest
- camel-xpath
- camel-directvm
- camel-saga
- camel-xslt
- camel-file
- camel-scheduler
- camel-zip-deflater
- camel-language
- camel-seda

Camel end users can then pick and choose exactly only what they need, or keep using everything.

Therefore we have `camel-core` and `camel-core-engine` as two starting dependencies.
You can use `camel-core` which gives you all the JARs which is similar to Camel 2.x.
When you use `camel-core-engine` you get the minimum set of JARs that makes a functional Camel.

{{< image "camel3-core-vs-engine.png" "Camel 3 core vs engine" >}}

`camel-core` contains 33 JARs and `camel-core-engine` contains 12 JARs.

### 5) Faster startup and lower footprint

We have reduced the size of core Camel and the number of classes loaded. For example, in Camel 2 about 5200 classes were loaded, which has been reduced to about 4300 loaded classes in Camel 3.

We have also done many smaller optimizations in the core, to reduce the number of allocated Java objects, and speed-up initialization and other means. We have used JVM profiling tools to assist and find the bottlenecks.

Another area of improvement is to reduce Java reflections. In Camel 2 all the configuration of Camel components, endpoints, and routes are reflection based. In Camel 3 we have source code generated Java code for a configuration that allows us to use direct Java calls instead of reflection. 

Another similar area is Camel's type converters which in Camel 2 are Java reflection based (you could build custom type converts that were not reflection based). In Camel 3 we also generate Java source code which means that type converting is direct Java calls at runtime.

We have also moved initialization logic to earlier phases when it was possible. For example, there is a new build phase that allows Camel to do special initialization during building your project (this requires Camel Quarkus).

All this optimization improves the startup performance of Camel and reduces the memory overhead. With Camel Quarkus you can natively compile your Camel application and make it startup in 30 milli seconds and consume only 10mb of memory (RSS) with a full blown HTTP REST server and health-checks and metrics.

{{< image "camel3-quarkus.png" "Camel 3 Quarkus native compiled" >}}

There are still a few items on the agenda that we want to work on in Camel 3.x to further optimize Camel core.

### 6) Type Safe Endpoint DSL

Camel end users whom have configured endpoints using URI strings, would all have experienced the problem when you make a configuration mistake in the endpoint, which then makes Camel fail on startup.

In Camel 3, we have a new type-safe DSL for endpoints that you can use in Java routes.
You can continue to use the classic URI strings, but if you want to try the endpoint DSL, then you need to add `camel-endpointdsl` to your classpath. Then you should extend `EndpointRouteBuilder` instead of `RouteBuilder` to access the endpoint DSL.

Here is a basic example without and with the endpoint DSL:

```
from("timer:click?period=3000&fixedRate=true")
    .to("seda:foo?blockWhenFull=true");

from(timer("click").period(3000).fixedRate(true))
    .to(seda("foo").blockWhenFull(true));
```

You can also find a [little example](https://github.com/apache/camel/tree/master/examples/camel-example-cafe-endpointdsl) in the source code.

### 7) Reactive Routing Engine

The routing engine in Camel has internally been reactive'fied and all EIPs has been retrofitted to work in a reactive manner. However this is internal only, and the Camel API for both end users and component developers are based on existing callback behavior.

We will later introduce and work on a client-side facing reactive API after we have jumped to Java 11 as minimum version (then we can support Java 9 flowable API). 

Camel already has integrations with reactive frameworks such as Vert.X, RxJava and Reactor Core in the dedicated Camel components.

### 8) Camel Main

We have introduced `camel-main` as a standalone JAR that makes it easier to run just Camel.
There are a [couple of examples](https://github.com/apache/camel-examples/blob/master/examples/camel-example-main/readme.adoc) with the source code that demonstrates how to do that.

We also use `camel-main` to have common code to configure and bootstrap Camel for standalone, Spring Boot, Camel K, and Camel Quarkus. This allows us to share the same code, and configuration options.

### 9) Camel Microprofile

Camel 3 now integrates better with Eclipse Microprofile and we have Camel components for Microprofile configuration, metrics, health checks, and fault tolerance (on the way).

More components to come in upcoming Camel releases. These microprofile components are also used by Camel Quarkus.

### 10) Miscellaneous improvements

Camel 3 now supports JUnit 5 for unit tests, with the test components that have -junit5 as suffix.

The Camel `Registry` is now also writeable, so you can add beans to the registry at runtime, or from unit tests etc.

You can also configure endpoints (producer) to a lazy start. By default Camel works in a fail-fast mode, which means that Camel components that fail to connect to external systems during startup may cause the route to fail on startup. For Camel 3 you can now configure these endpoints to a lazy start, which means the route will startup and they will first fail when a message is routed to the endpoint.

Camel also allows to configure your routes to be supervised during startup, which allows Camel to more intelligently start routes in a more safe manner, by restarting routes that failed.

### 11) Migrating to Camel 3

We have of course cleaned up the code base, such as removing all deprecated APIs and components. We have also adjusted some APIs to make them easier to use from end users, and more Java 8 lambda friendly.

Internally we have also adjusted the route model, to make it easier to extend into new DSLs; and there is a YAML DSL on the way which was initiated in Camel K.

In terms of backward compatibility then Camel 3 is mostly compatibility for regular Camel applications. However, if you are using some of the more advanced features and other plugins in Camel then migration is needed. Also, custom components must be migrated and recompiled. There are other adjustments such as Spring Boot users must use `org.apache.camel.springboot` as groupId instead of `org.apache.camel` etc. All details can be seen in the [migration guide](https://camel.apache.org/manual/latest/camel-3-migration-guide.html).

Good luck with your migration if you decide to continue your Camel journey. And for new users to Camel then good luck getting onboard.
