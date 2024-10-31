---
title: "Camel K 2.5.0"
date: 2024-11-04
draft: false
authors: [squakez]
categories: ["Releases", "Camel K", "Roadmap"]
preview: "What's new in Camel K 2.5.0!"
---
© Charles Theodore Frere

Apache Camel community is happy to announce the general availability of **Camel K 2.5.0**. In this release you will find several new features, fixes and a few deprecations that will simplify the project management in the long run.

## Default Runtime

Let's start highlighting the default runtime we are using in this release. The default is Camel K Runtime version 3.15.0 which is based on **Camel Quarkus 3.15** and **Camel 4.8** (LTS support).

## Self Managed Integrations

Do you remind the "Sourceless Integrations"? Well, we have found a more appropriate name and we'll be calling this particular way of managing Camel application built externally as **Self managed build Integrations**. We are working to make this kind of Integrations as first class in order to let the operator manage easily every kind of Camel application coming from external builds.

In order to better support this use case, the operator will store the trait executed in each different `Integration` phase in the related Integration status. This is particularly useful and enables the possibility to run an `Integration` without an `IntegrationKit`. From now on, when you run a Self Managed Integration, no `IntegrationKit` will be created. This has led to a **simpler promotion** mechanism, as, you will be able to move the Integration from one environment to another, just specifying the container image to run and copying the status trait configuration to spec trait configuration.

More detailed information on the [official self managed build Integration documentation](/camel-k/next/running/self-managed.html).

## Explicit IntegrationPlatform creation

In the last releases we have deprecated the installation procedure from CLI. That methodology was scripting several checks that made the creation of an `IntegrationPlatform` implicit. This was leading to a missing opportunity to let the user understand the configuration required for the operator to run properly. When you're installing the Camel K operator, from now on, you will need to create **explicitly** the `IntegrationPlatform` in order to provide the minimum configuration to let the operator know what container registry to use. As the product is thought for real use case scenarios, where a container registry with secure credentials is required, we better educate the users to do such configuration and avoid many newbies pitfalls.

## Kamelets versioning

This one is a cool feature that will simplify the distribution and the **versioning of your Kamelets**. One critical requirement we always had, was to have the ability to store different versions of a Kamelet in the cluster keeping the same resource name. Well, this is now a reality. You can store multiple version of a Kamelet within the same resource and just instruct your `Pipe` or your `Integration` to use some given version:
```
- from:
    uri: "kamelet:my-kamelet?kameletVersion=v2"
    steps:
      - to: "log:info"
```
Have a look at the [official Kamelet versioning documentation](/camel-k/next/kamelets/kamelets-user.html#_kamelet_versioning).

## Traits improvement

There are several minor improvements to the traits configuration which should help the work of configuring your **Camel applications on Kubernetes**:

* EmptyDir configurable size limit
* IngressClassName Ingress trait
* Support Service annotations
* Support Dynamic creation of Persistent Volumes
* Environment values from Secrets/Configmaps

Some of those were long time required by the community, we're pretty sure they will be very helpful.

## Deprecations

We have a long list of deprecations in this version. Some of them are driven by the Camel core which is deprecating certain features and others are kind of duplication of what it already exists in the core, so we better support in the Camel core way (ie, setting some Camel property).

* OpenAPI trait: will be substituted by API contract first available in the core.
* IntegrationProfile custom resource: it feels like a duplication of IntegrationPlatform, so you should use that from now on.
* Service Binding: the project was deprecated, so, makes sense to deprecate as well as it won't be any longer supported.
* Kotlin DSL: deprecated by the core.
* Resume trait: it was an experimental feature and it can be performed by setting Camel properties.
* Vaults: the same level of compatibility can be performed by setting Camel properties.
* 3 Scale trait: the same level of compatibility can be performed by setting the new Service trait annotations.
* CLIs commands: most of those commands (ie, `config`, `kamelet`, `describe`) should be replaced by Kubernetes (`kubectl`) CLI directly.

## Full release notes

Those were the most interesting features we have delivered in Camel K 2.5.0. We have more minor things, bugs fixing, documentation and dependency updates that you can check in the [2.5.0 release notes](https://github.com/apache/camel-k/releases/tag/v2.5.0).

# Thanks

Thanks a lot to our contributors and the hard work happening in the community. Feel free to provide any feedback or comment using the Apache Camel available channels.
