---
title: "Camel K 2.3.0"
date: 2024-04-08
draft: false
authors: [squakez]
categories: ["Releases", "Camel K", "Roadmap"]
preview: "What's new in Camel K 2.3.0!"
---
© Sir John Soane’s Museum London

Apache Camel community is happy to announce the general availability of **Camel K 2.3.0**. This release version contains several fix which are increasing the operator stability and a few hidden changes which are making the software more modular, therefore future feature development quicker and independent from the Camel runtime chosen.

First of all, we have changed the default runtime to Camel K Runtime version 3.8.1 which is based on same Camel Quarkus version (and Camel 4.4.1 version). It follows a list of the most important features you'll be able to use from now on.

## Multi architecture manifest (ARM64)
The possibility to run an ARM64 based platform was already available since version 2.0. However, the procedure to run the new architecture platform was a bit clumsy as you had to declare most of the things manually. In this version we have published a manifest that will contain the various architecture we support (AMD64 and ARM64). Your cloud provider will be able to pick the right platform from the manifest, freeing you up from specifying the platform.

In order to maintain backward compatibility we still had to let the user declare which is the platform to use introducing the `builder.platforms` trait configuration. Configure this parameter either in each Integration or in general into the IntegrationPlatform in order to specify which platform you want to run for all your Integrations.
```
kamel run test.yaml -t builder.platforms=linux/arm64 -t builder.platforms=linux/amd64

```

## Add support for Strimzi Kafka
In this release we've dedicated a bit of time to enhance the user experience when it comes to use Kafka into your Integrations. From now on you'll be able to use Strimzi Kafka Custom Resource out of the box in a Pipe declaration. Here a brief example:
```
apiVersion: camel.apache.org/v1
kind: Pipe
...
spec:
  source:
...
  sink:
    ref:
      apiVersion: kafka.strimzi.io/v1beta2
      kind: Kafka
      name: my-cluster
    properties:
      topic: "my-topic"
```

## Polish Integration conditions
Running a software in Kubernetes always come with the requirement to be able to observe and understand what's going on. We've worked on a series of enhancement to include more custom resources conditions and let you be able to inspect what's going on on an Integration or the Build which have started. Just to name a few of them we've included the list of Integration and IntegrationKit traits execution, those warning or deprecation notices that a trait used to log on operator log only and a Build waiting condition (to let you know that the Build is queued for a given reason).

Hopefully these information are helping your SRE duties.

## Publishing strategy
In the previous Camel K versions we had deprecated certain supported publishing strategy. We have decided to remove them in this version in order to have an easier maintenance. We have also decided to default [Jib](https://github.com/GoogleContainerTools/jib) as publishing strategy for plain Kubernetes providers (S2I is still the default of Openshift). As we know this may potentially affect some user out there, we've provided a guideline to [adopt your own publishing strategy](/camel-k/next/pipeline/pipeline.html#build-pipeline-examples-buildah).

Mind that the [Spectrum](https://github.com/container-tools/spectrum) strategy will be very likely deprecated in future version of Camel K, leaving Jib as the only publishing strategy available out of the box. If you're still using it, you may think to start migrating to Jib as soon as possible.

## Introduce IntegrationProfile custom resource
The new IntegrationProfile custom resource allows users overwrite settings (e.g. trait configurations) for multiple integrations that all reference the same profile. The IntegrationProfile resource is keen to replace the namespace local IntegrationPlatform as well as the secondary platform. In contrast to the IntegrationPlatform resource the IntegrationProfile only exposes a subset of settings that are eligible to be controlled on a user namespace level. In upcoming releases the IntegrationPlatform is meant to be an operator resource with restricted access (e.g. only adjustable by cluster admins). You can now start using the IntegrationProfile as a declarative approach to adjusting settings for multiple integrations.

## Deprecated features
While working on several optimizations, we've decided to deprecate a few features. In this version we've deprecated the `kamel run -d file:xyz` feature (plus the related Registry trait) and we've introduced a flag to control a potential dangerous behavior which was happening by default in Kamelets. The `mount.scan-kamelets-implicit-label-secrets` is deprecated and still enabled by default in this version.

This feature was reading the content of certain labeled secret. Although it was something controlled by the user, we feel it's better to remove the inspection of the Secrets to avoid possible leaks.

## Builder annotation support
When running a pipeline with `pod` strategy, we had no way to control the spin-off Pods. In this version we've added the `builder.annotations` parameter in order to annotate the Pods with the value provided by the user.

## Full release notes

Those were the most interesting features we have delivered in Camel K 2.3.0. We have more minor things and a lot of bug fixed, documentation and dependency updates that you can check in the [2.3.0 release notes](https://github.com/apache/camel-k/releases/tag/v2.3.0).

# Thanks

Thanks a lot to our contributors and the hard work happening in the community. Feel free to provide any feedback or comment using the Apache Camel available channels.
