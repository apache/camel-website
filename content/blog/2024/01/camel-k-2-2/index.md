---
title: "Camel K 2.2"
date: 2024-01-08
draft: false
authors: [squakez]
categories: ["Releases", "Camel K", "Roadmap"]
preview: "What's new in Camel K 2.2!"
---

Apache Camel community is happy to announce the general availability of **Camel K 2.2.0**. This release has slipped finally in 2024 but here we are with a lot of new exciting developments.

## Enable source less Integrations

This is the first step to onboard any Camel runtime. You may already have a process that build your application and containerize it in a container registry. From now on you can reference such container and use the operator to start that application without requiring the Integration to contain the source code:

```yaml
apiVersion: camel.apache.org/v1
kind: Integration
metadata:
  annotations:
    camel.apache.org/operator.id: camel-k
  name: test
spec:
  traits:
    container:
      image: docker.io/my-org/my-camel-app:1.0.0
```

See more detail in the official Camel K runtimes documentation. The nice thing is that with this approach you will be able to run **Camel Quarkus**, **Camel Springboot** and **Camel Main** runtimes from Camel K operator.

## Show root image hierarchy in IntegrationKits

IntegrationKit concept is a great abstraction that makes the operator run that fast when building and deploying a new Integration. As it manages a hierarchy of other IntegrationKits, as a user you may wonder which is the root image that was generated for a given Integration. Then, you can check it now by querying the API:

```shell
kubectl get ik
NAME                       ROOT
kit-ckofr2pbtegs738g3mog   eclipse-temurin:17
kit-ckofrf9btegs738g3mp0   eclipse-temurin:17
kit-ckofse1btegs738g3mqg   registry.access.redhat.com/ubi8/openjdk-17:1.16
kit-ckofsq1btegs738g3mr0   registry.access.redhat.com/ubi8/openjdk-17:1.16
kit-ckoh539btegs738g3mu0   eclipse-temurin:17.0.8.1_1-jdk-ubi9-minimal
```
We have also fixed the entire procedure and now each IntegrationKit hierarchy won't mix with any other hierarchy (as their root image may be different).

## IntegrationPlatform shortname is `itp`

So far we have used `ip` as a shortname for IntegrationPlatform. However this is clashing against a few other Kubernetes resources and it probably makes sense for use to use instead `itp`. Please, consider that we are **deprecating** the usage of `ip` with this release and it can be therefore removed in future releases.

## Expose trait conditions

One of the goal of Camel K is to simplify the developers life when they use Kubernetes. You know we have many traits that encapsulate logic to fine tune an Integration aspect. Some of them sometimes fail or reports warnings that were only provided in the operator log. From this release onward we are exposing these conditions into the Integration as well to simplify the troubleshooting. When something is not working as expected, you should get more useful information by just looking at the Integration conditions.

```yaml
...
    - firstTruthyTime: "2024-01-05T14:59:28Z"
      lastTransitionTime: "2024-01-05T14:59:28Z"
      lastUpdateTime: "2024-01-05T14:59:31Z"
      message: 'explicitly disabled by the platform: container image was not built
        via Camel K operator'
      reason: jvmTraitConfiguration
      status: "True"
      type: TraitInfo
...
```

## Knative installation procedure

We have provided some guidelines about the procedure required to work with Knative. Beside that we've fixed the procedure and have now the availability out of the box when running installation via Helm.

## Default runtime bound to latest Camel LTS

We have decided to use as the default runtime for Camel K, the latest available LTS version of Camel, which, in this release is 4.0.3. With this approach you can safely upgrade the operator to the latest stable version and getting always the latest LTS version available of Camel/Camel Quarkus as a default.

## ARM64 installation procedure

We've gone a step further in the support of ARM64 architectures. We have reviewed the procedure that will let you install and [run your first ARM64 based Camel K Integration](/camel-k/next/installation/advanced/multi-architecture.html).

## Pipeline build NodeSelectors

We have worked to make our pipeline more reliable and be able to derive the workload of each build to any specific cluster node. Thanks to the [build trait NodeSelector](/camel-k/next/traits/builder.html#_node_selectors) option you should be able to that very easily from now on.

## Full release notes

Those were the most interesting features we have delivered in Camel K 2.2.0. We have more minor things and a lot of bug fixed, documentation and dependency updates that you can check in the [2.2.0 release notes](https://github.com/apache/camel-k/releases/tag/v2.2.0).

# Thanks

Thanks a lot to our contributors and the hard work happening in the community. Feel free to provide any feedback or comment using the Apache Camel available channels.
