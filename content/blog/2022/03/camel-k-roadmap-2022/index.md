---
title: "Camel K 2022 Roadmap"
date: 2022-03-01
draft: false
authors: [squakez]
categories: ["Roadmap", "Camel K"]
preview: "A brief overview of what we've planned for 2022"
---

<sub><sup><a href='https://pngtree.com/so/Signpost'>Signpost png from pngtree.com/</a></sup></sub>

During the last weeks we've been asked questions around the direction we're willing to take on the future development of **Camel K**. I think it would be good to have some blog in order to let the community understand where our efforts are going. It will be useful for every Camel K user and Camel K developer, as a guide for the future development of the project.

The below list of development areas are the ones identified at the end of 2021. The order is random, we haven't identified any clear priority yet. Some of those developments are already completed (fully or partially).

* Code/build (release process)
* Installation procedure
* API
* CLI
* Event Driven Architecture
* Builder (containers, images and registry)
* Runtime (Integration execution)
* Observability
* Kamelets

In each section, I've tried to detail the rationale and some ideas that can be furtherly refined. There may also be reference to Github issues that are related to the requirement under discussion.

DISCLAIMER: this is a wide list of desired areas we may work on. We may not be able to complete all of them for any reason, neither considered responsible for any kind of committment. The contributors must not consider this as a mandatory list of work to do, but as a suggested list of things to take in consideration when dedicating time to the project.

## Code/build (release process)
The goal we identified is to simplify and speed up the release process.

* Merge Camel K runtime into Camel Quarkus
* Multi-architecture images ([#1238](https://github.com/apache/camel-k/issues/1238))
* Modularised build ([#2801](https://github.com/apache/camel-k/issues/2801))
* Nightly builds ([#393](https://github.com/apache/camel-k/issues/393))

We now have a chain of relationships as `Camel K >> Camel K runtime >> Camel Quarkus >> Camel`. Camel K runtime could be seen as a bootstrap of `Camel Quarkus`: this approach simplifies the overall picture and releases dependencies. We may kick off joint initiative with **Camel Quarkus** community to bring the actual **Camel K Runtime**, under the Camel Quarkus umbrella.
Through multi architecture images we will be able to widen our target audience by extending the presence of the **Operator** on different architectures. Nightly build will also let everybody use partial fixes before any official release cycle.

## Installation procedure
We have several installation process options in place. We may need to harmonize them to simplify the maintenance of the installation procedure.

* Document the usage of Kustomize ([#2758](https://github.com/apache/camel-k/issues/2758))
* Deprecate `kamel install` in favor of `kubectl apply -k` / `kustomize`
* Move to descoped OLM model

There is some preliminary work introduced in release 1.7 around [Kustomize](https://github.com/apache/camel-k/releases/tag/v1.7.0). We may leverage that in order to identify a replacement for the kamel install. We should analyze how that will happen and the user experience around any new way we’ll propose to the community.
Another thread we should follow is related to the proposal about descoped OLM. This part should be put in a wider context around the OLM project.

## API
We can start thinking of Camel K as an enablement technology. Then, it makes sense to dedicate some effort in improving the way the technology may be consumed by others. APIs and Custom Resource Definitions (CRD) are the main scope of this section.

* Provide a full description of the APIs
* Comprehensive CRD structural schemas for tooling
* Traits configuration schema ([#1614](https://github.com/apache/camel-k/issues/1614))

Implementation of structural schema may be the goal of 2.0 as will probably require many breaking changes. Some draft was realized and it provided discussions we may take in consideration during the feature implementation (see [#2831](https://github.com/apache/camel-k/issues/2831)).

## CLI
The CLI is still a very useful tool when interacting with connected environments, in particular in the community. 

* Fill the gaps for `kamel local` commands
* Enable JBang
* Better auto-completion ([#2461](https://github.com/apache/camel-k/issues/2461))

We have many requests to enhance the `kamel local` command in order to perform more actions. It seems this is used in order to test the Integrations, like a development environment. We may also investigate how to leverage **JBang** as it seems a better approach for local testing. As long as the development of JBang on Camel gather maturity, we will probably address the required changes to have it better integrated in Camel K.

## Event Driven Architecture
We can think of Camel K as a technology to be used in **Kubernetes** space for event driven architectures. For this reason we will work to enable certain aspects required by EDA.

* Offset management
* Source partitioning and load balancing
* Integration with Keda auto-scalers
* Knative stability
* Kamelets support/stability

Following the strategy of the EDA positioning, we should focus on creating a stable environment for **Knative**, **Kamelets** and **Kafka**. In the same direction we must explore the **Keda** ecosystem and how the first implementation fits into Camel K model.

## Builder
Integration building process needs to be tweaked in order to guarantee scalability. We may revisit parts of the process in order to be more “production grade”.

* Improve concurrency / scalability ([#1784](https://github.com/apache/camel-k/issues/1784))
* Image garbage collection / compaction ([#2736](https://github.com/apache/camel-k/issues/2736))
* Support Open Container Initiative ([OCI](https://opencontainers.org/)) registries for universal artifacts management ([#2732](https://github.com/apache/camel-k/issues/2732))
* CI/CD support
* Build Pod compute resources

**[Mvnd](https://github.com/apache/maven-mvnd)** is a good candidate for improving the scalability of the builds. Some preliminary work already exists (see [#2832](https://github.com/apache/camel-k/issues/2832)). Some interesting work is already in place to provide layered images for dependencies (see [#2835](https://github.com/apache/camel-k/issues/2835)). There is certain demand for reducing the quantity of debris produced during the creation of images (ie, garbage collection) and to show how to integrate Camel K with some CI/CD tool.

## Runtime
Other efforts that will let Camel K be more mature are related to features around the runtime.

* Improve route DSL parsing ([#1266](https://github.com/apache/camel-k/issues/1266))
* Surface Camel health checks into integration status ([#2886](https://github.com/apache/camel-k/issues/2886))
* Business vs. technical errors

Route parsing has a great margin of improvement in order to automatically discover components, capabilities, dependencies, etc, and in general to be more reliable. Also, exposing more meaningful ways to query the healthy status of an Integration will let users speed up their troubleshooting (this part is almost completed in the latest releases).

## Observability
Monitoring running Integrations is another field which will let the user feel the maturity of the product.

* Migrate from [MicroProfile](https://microprofile.io/) metrics to [Micrometer](https://micrometer.io/)
* Secured monitoring (see proposal)
* [Grafana](https://grafana.com/) dashboards

The Micrometer looks to be the default choice of **Quarkus**, so, it makes sense to migrate what we already have in that direction: there may be some gap between what is provided by Microprofile and Micrometer, so we may have to review more in general the metrics collection offered.
We already have some monitoring in place with **Prometheus**. We probably need some improvements and some additional development on top of the existing features.

## Kamelets
The **Kamelet** model has been proved to be an easy way to create connections between different systems without needing a deep knowledge of the **Apache Camel** framework. We should keep adding more Kamelets and strengthening its usage gathering feedback from the communities.

* Develop new supported Kamelets

# How can I help?
Either you're a long time contributor or a first Camel K user, you can help us in many ways. Discover more in our [contribution guidelines page](/camel-k/next/contributing/developers.html).
