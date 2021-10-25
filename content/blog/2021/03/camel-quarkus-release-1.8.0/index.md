---
title: "Camel Quarkus 1.8.0 Released"
date: 2021-03-31
authors: ["ppalaga"]
categories: ["Releases", "Camel Quarkus"]
preview: "Camel Quarkus 1.8.0 Released"
summary: "The highlights of Camel Quarkus 1.8.0"
---

<sub><sup>Image by <a href="https://www.flickr.com/photos/lanzen/5984113332">Anders Lanzen</a> <a href="https://creativecommons.org/licenses/by-nc-sa/2.0">CC BY-NC-SA 2.0</a></sup></sub>

We are pleased to announce the release 1.8.0 of Camel Quarkus! Here are the highlights.

## Camel 3.9.0

Camel 3.9.0 is rich in optimizations. It
[reduces object allocations](/blog/2021/03/Camel39-Whatsnew/#reduced-object-allocations),
[optimizes Camel Core](/blog/2021/03/Camel39-Whatsnew/#optimized-core) and
the [HTTP component](/blog/2021/03/Camel39-Whatsnew/#optimized-http-component).

Camel 3.9.0 further brings
[optional property placeholders](/blog/2021/03/Camel39-Whatsnew/#optional-property-placeholders)
(`file:foo?bufferSize={{?myBufferSize}}`)
and improvements in [Kafka components](/blog/2021/03/Camel39-Whatsnew/#kafka).

Please check the full release announcement of [Camel 3.9.0](/blog/2021/03/Camel39-Whatsnew).

## Quarkus 1.13.0.Final

The new release of Quarkus brings several new features:

* [DevServices](https://quarkus.io/blog/quarkus-1-13-0-final-released/#zero-config-setup-with-devservices) simplify testing with containers
* [OpenTelemetry](https://quarkus.io/blog/quarkus-1-13-0-final-released/#opentelemetry-extension) is now supported via two new extensions
* [Kubernetes Service Binding](https://quarkus.io/blog/quarkus-1-13-0-final-released/#kubernetes-service-binding) simplifies the deployment on Kubernetes.
* [New MicroProfile REST Client](https://quarkus.io/blog/quarkus-1-13-0-final-released/#microprofile-rest-client-based-on-resteasy-reactive) based on RESTEasy Reactive.
* [Test coverage reports](https://quarkus.io/blog/quarkus-1-13-0-final-released/#test-coverage-reports) with `quarkus-jacoco`.

## New [language DSLs](/blog/2021/03/Camel39-Whatsnew/#multi-language-dsls)

These are mostly motivated by [Camel K](/camel-k/next/)
and its project-less approach to defining Camel routes.
With Camel K, all you need to run an integration is a file where the routes are defined using one of the supported DSLs
([Java jOOR](/camel-quarkus/next/reference/extensions/java-joor-dsl.html),
[XML](/camel-quarkus/next/reference/extensions/xml-io-dsl.html),
[Groovy](/camel-quarkus/next/reference/extensions/groovy-dsl.html),
[YAML](/camel-quarkus/next/reference/extensions/yaml-dsl.html),
[Kotlin](/camel-quarkus/next/reference/extensions/kotlin-dsl.html)
or [JavaScript](/camel-quarkus/next/reference/extensions/js-dsl.html)).
With Camel Quarkus you still need the `pom.xml` file with the appropriate dependencies in addition to the route definition files.
Except for XML and YAML, these DSLs are supported only in JVM mode, because they load and compile the routes at runtime.

## New extensions

Except for the new DSLs mentioned above, there are six new extensions:

* [Azure Storage Data Lake](/camel-quarkus/next/reference/extensions/azure-storage-datalake.html) (JVM only)
* [Freemarker](/camel-quarkus/next/reference/extensions/freemarker.html) (native)
* [HL7](/camel-quarkus/next/reference/extensions/hl7.html) (native)
* [Huawei Cloud SMN](/camel-quarkus/next/reference/extensions/huaweicloud-smn.html) (JVM only)
* [Paho MQTT 5](/camel-quarkus/next/reference/extensions/paho-mqtt5.html) (native)
* [Stitch](/camel-quarkus/next/reference/extensions/stitch.html) (JVM only)

These three extensions are now supported in native mode:

* [LRA](/camel-quarkus/next/reference/extensions/lra.html)
* [Nitrite](/camel-quarkus/next/reference/extensions/nitrite.html)
* [Splunk](/camel-quarkus/next/reference/extensions/splunk.html)

## Deprecated extensions

* `camel-quarkus-componentdsl` and `camel-quarkus-endpointdsl` are a part of `camel-quarkus-core`
  since long, so you can remove them safely making sure that your application depends on `camel-quarkus-core`
  either directly or indirectly.
* Similarly, `camel-quarkus-main` is now a part of `camel-quarkus-core` and you can remove it safely making
  sure that your projects depends on `camel-quarkus-core` at least transitively.

## Breaking changes:

The following deprecated extensions were removed in this release:

* WebSocket JSR 356 (replaced by [Vert.x WebSocket](/camel-quarkus/next/reference/extensions/vertx-websocket.html))
* All AWS SDK v1 extensions (replaced by their AWS SDK v2 counterparts)

A part of the functionality originally present in `camel-quarkus-xml-io` has moved to
`camel-quarkus-xml-io-dsl`. Hence when you see e.g. `Cannot find RoutesBuilderLoader in classpath supporting file extension: xml` in your log, you'll need to replace `camel-quarkus-xml-io` with `camel-quarkus-xml-io-dsl`.


## Full Changelog of Camel Quarkus 1.8.0

* [Fixed issues](/releases/q-1.8.0/)
* [All commits](https://github.com/apache/camel-quarkus/compare/1.7.0...1.8.0)

## Known issues

* [Upgrading to Jackson 2.12.1 via Quarkus BOM 1.12 breaks Azure SDK v12 extensions](https://github.com/apache/camel-quarkus/issues/2207) - possible workaround: force Jackson 2.11.3 in your application

## What's next?

Quarkus team just [announced](https://groups.google.com/g/quarkus-dev/c/oTBc0iHLxrw) their plans for 2.0 release
integrating MicroProfile 4 and Vert.x 4. We will adapt to those changes and publish Camel Quarkus 2.0 alphas and betas
following the respective Quarkus milestones.
In the mean time, we may still consider releasing 1.9.0 if we have enough material for it.

There is still a lot of [Camel components to port](https://github.com/apache/camel-quarkus/issues?q=is%3Aissue+is%3Aopen+label%3Aextension) to Quarkus.
Please upvote your favorites, or even better [contribute](/camel-quarkus/next/contributor-guide/index.html)!
