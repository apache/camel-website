---
title: "Camel Quarkus 2.0.0 Released"
date: 2021-06-30
authors: ["ppalaga"]
categories: ["Releases", "Camel Quarkus"]
preview: "Camel Quarkus 2.0.0 Released"
summary: "Camel Quarkus 2.0.0 brings Quarkus 2.0.0.Final and Camel 3.11.0"
---

<sub><sup>Image by <a href="https://www.flickr.com/photos/lanzen/5984113332">Anders Lanzen</a> <a href="https://creativecommons.org/licenses/by-nc-sa/2.0">CC BY-NC-SA 2.0</a></sup></sub>

We are pleased to announce the release 2.0.0 of Camel Quarkus.
It brings Quarkus 2.0, Camel 3.11, improved test coverage and 13 new or promoted extensions.
Many thanks to all contributors and issue reporters!

## Quarkus 2.0.0.Final

Like in Camel 3.11, in Quarkus 2.0, Vert.x and MicroProfile were upgraded to their newest major versions 4.
Further, in Quarkus 2.0, Java 8 support was dropped permanently and Java 11 is the minimal supported version.
21.1 is the recommended version of GraalVM.

When it comes to developer experience, Quarkus 2.0 introduces continuous testing.
Quarkus dev mode (a.k.a. `mvn quarkus:dev`) exists since the very beginnings of Quarkus.
It not only starts your application so that you can test it manually,
but it also keeps watching for changes in your workspace, recompiling the modified classes as needed
and reloading the running application.
Now with continuous testing, your tests are executed as you change your application code.
You have to press `r` to enable it.
You may want to watch [this video](https://www.youtube.com/watch?v=rUyiTzbezjw) to learn more about the new continuous testing feature.

Please refer to [Quarkus 2.0.0.Final announcement](https://quarkus.io/blog/quarkus-2-0-0-final-released/) for more details.

## Camel 3.11.0

Please check the [What's new in Camel 3.11.0](/blog/2021/06/Camel311-Whatsnew/) blog post for more information.

## New extensions and promotions to native

New extensions:

* [Avro Jackson](/camel-quarkus/latest/reference/extensions/jackson-avro.html)
* [AWS Secrets Manager](/camel-quarkus/latest/reference/extensions/aws-secrets-manager.html) (JVM only)
* [Azure CosmosDB](/camel-quarkus/latest/reference/extensions/azure-cosmosdb.html) (JVM only)
* [Etcd3](/camel-quarkus/latest/reference/extensions/etcd3.html) (JVM only)
* [Google Cloud Functions](/camel-quarkus/latest/reference/extensions/google-functions.html) (JVM only)
* [Google Storage](/camel-quarkus/latest/reference/extensions/google-storage.html)
* [jOOR](/camel-quarkus/latest/reference/extensions/joor.html) (JVM only)
* [Kamelet Reify](/camel-quarkus/latest/reference/extensions/kamelet-reify.html) (JVM only)
* [Protobuf Jackson](/camel-quarkus/latest/reference/extensions/jackson-protobuf.html)

Extensions newly supported in native mode:

* [DigitalOcean](/camel-quarkus/latest/reference/extensions/digitalocean.html)
* [OpenStack](/camel-quarkus/latest/reference/extensions/openstack.html)
* [XChange](/camel-quarkus/latest/reference/extensions/xchange.html)
* [XQuery](/camel-quarkus/latest/reference/extensions/saxon.html)


## Test coverage and closing functionality gaps

In this release, we invested a lot of effort into reviewing existing tests and adding new test cases.
We proceeded methodically, following the main Camel documentation.
We took care to cover every use case mentioned on the Camel component pages.
For example for the HTTP component, we went through the use cases mentioned on its [component page](/components/latest/http-component.html),
and we checked whether they are covered by existing tests.
All the missing scenarios were listed in a ["Test expansion" issue](https://github.com/apache/camel-quarkus/issues/2794)
and fixed by adding the [respective tests](https://github.com/apache/camel-quarkus/commit/5c969cac27abd1af122b895fc0a7e7f26b69df25).

In this way, we not only found and fixed bugs, but we also uncovered fully missing features.
This was the case e.g. with `@org.apache.camel.EndpointInject`, `@org.apache.camel.Produce` and `@org.apache.camel.Consume` annotations from `camel-core`.
These are supported by Camel Quarkus now - see [here](/camel-quarkus/latest/user-guide/cdi.html#_endpointinject_and_produce) and [here](/camel-quarkus/latest/user-guide/cdi.html#_consume).

The extent of this effort can be assessed by running [this GitHub issues query](https://github.com/apache/camel-quarkus/issues?q=is%3Aissue+label%3Aintegration-test+closed%3A2021-04-26..2021-06-25). This endeavour is going to continue in coming Camel Quarkus releases.

## Deprecations

* Avro extension: `@BuildTimeAvroDataFormat` is deprecated - see the [Avro extension](/camel-quarkus/latest/reference/extensions/avro.html#_additional_camel_quarkus_configuration) page.


## Breaking changes and migration steps

Please refer to our [2.0.0 Migration guide](/camel-quarkus/latest/migration-guide/2.0.0.html).

## Release notes

Fixed issues:

* [Milestone 2.0.0-M1](https://github.com/apache/camel-quarkus/milestone/13?closed=1)
* [Milestone 2.0.0-M2](https://github.com/apache/camel-quarkus/milestone/16?closed=1)
* [Milestone 2.0.0](https://github.com/apache/camel-quarkus/milestone/15?closed=1)

All commits:

* [1.8.1..2.0.0](https://github.com/apache/camel-quarkus/compare/1.8.1...2.0.0)
