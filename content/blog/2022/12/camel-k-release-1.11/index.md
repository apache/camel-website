---
title: "Camel K 1.11 release"
date: 2022-12-15
draft: false
authors: [claudio4j]
categories: ["Releases", "Camel K"]
preview: "What's new in Camel K 1.11"
---

Hey Camel K riders, there is a new [Camel K 1.11.0](https://github.com/apache/camel-k/releases/tag/v1.11.0) release, there is no big new feature, as we focused on fixing bug, improving current features, updating dependencies and maintain our release cadence, since our 1.10 release, three months ago.

As usual let's start by acknowledging the tech stack on top of Camel K and the new exciting versions our fellows have baked:

* Apache Camel K Runtime 1.16.0
* Apache Camel Quarkus 2.14.0
* Apache Camel 3.19.0
* Apache Camel Kamelets 0.10.0

Thanks to Apache Camel, Camel Quarkus and Kamelet Catalog contributors for the great efforts they've put in those new releases.

## Enhanced dataformat dependency detection

Previously when using a `dataformat` endpoint, Camel K was not able to set the dependency. Now, it has been fixed, so given the following endpoint, the `camel:jackson` dependency is automatically added to the integration dependency list.

```
<to uri="dataformat:jackson:unmarshal"/>
```

## Updated Quarkus Mandrel to 22.2

We have updated the image of Quarkus Mandrel to 22.2.0.0

```
quay.io/quarkus/ubi-quarkus-mandrel:22.2.0.0-Final-java11
```

## Updated Maven to 3.8.6

Maven was changed from 3.8.4 to 3.8.6, this is not expected to affect Camel K users, since this is the internal maven version used to build the generated pom.xml for the integration.

## Deprecate kamel local and kamel init

We have deprecated the `local` and `init` commands of `kamel` CLI due to overlapping of [camel jbang](/manual/camel-jbang.html).
`camel jbang` may provide more features and a better developer experience to `kamel init` and `kamel local`, so we had to deprecate `kamel local`.

## Removed deprecated code

Some [deprecated code](https://github.com/apache/camel-k/pull/3819) were removed, a short summary:


* No possibility to bundle resources in the `Integration` spec, as any resources should use the `mount` trait or persistence volume.
* Removed `CASecret` from the Maven configuration, use the plural name `CASecrets`. This affects the IntegrationPlatform object.
* Removal of old `dead-letter-channel` error handler type of KameletBinding
* Removal of flow in Kamelets, a `template` should be used.
* Removal of openapi resource type. Use the `ConfigMap` option of the `openapi` trait to store the openapi specification. Previsouly the openapi spec was stored as part of the IntegrationSpec object.

## Updated the Go Policy API to v1

From `k8s.io/api/policy/v1beta1` to `k8s.io/api/policy/v1`

## Documentation

Within this release we've added and updated many entries. We'll probably work within next release to cover the feature we were not able to document within this release.

## Bug fixes and test coverage

As you may see in the [release page](https://github.com/apache/camel-k/releases/tag/v1.11.0) we have closed quite a good number of known bugs as well.

# Thanks

Thanks to all contributors who made this possible. We're happy to receive feedback on this version through our [mailing list](/community/mailing-list/), our [official chat](https://camel.zulipchat.com/) or filing an issue on [Camel K Github repository](https://github.com/apache/camel-k).
