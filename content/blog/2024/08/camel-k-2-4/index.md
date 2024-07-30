---
title: "Camel K 2.4.0"
date: 2024-08-07
draft: false
authors: [squakez]
categories: ["Releases", "Camel K", "Roadmap"]
preview: "What's new in Camel K 2.4.0!"
---
© Seattle Art Museum

Apache Camel community is happy to announce the general availability of **Camel K 2.4.0**. We have released many new features and several works aimed to have a stable version, above all when using the so called "Sourceless" Integrations.

## Default security settings

The first important change we've introduced is the default setting of security configuration in Kubernetes (`SecurityContext`). We've worked to introduce this both in the operator and in every application deployed after your `Integration`. If you need to, you can configure the related parameters using the newly created "Security Context" trait or the Camel K operator installation procedure.

## Default resource settings

Another important change is the default setting of resources. This is a defensive requirement of Kubernetes in order to avoid any workload can consume all the available resources on the cluster node. By default you'll have this setting to limit each of your application to 1 Gigabyte of memory and 500 millicores of CPU. However you can still change these values using the "Container trait".

We've also added the default setting for the operator Pod, which is now limited to 8 Gigabyte and 2 cores. Also this configuration can be changed according to your specific needs.

## Enhance trait support on "sourceless" Integrations

Lately we're dedicating more support to this feature and we've enabled a few more traits to be fully or partially supported when running a "sourceless" Integration. One important achievement was the possibility to enable the "JVM" trait so that you can fine tune its configuration even when the application was built externally.

## Mount Emptydirs

There may be situations where you want to mount some `Emtptydir` volume to be shared among any of the sidecars of your application. From this version onward you can use the "Mount" trait in order to configure that as well.

## Cronjob Timezones

Recently Kubernetes have introduced the concept of timezones in its Cronjob API. From this Camel K version onward you'll be able to use the "Cron" trait to configure it.

## Ingress trait TLS configuration

Security is something we have at hearth. That's the reason why we've introduced the possibility to configure the "Ingress" trait with TLS.

## Deprecate CLI kamel install/uninstall

This one was a big effort that goes in the direction defined in the 2024 roadmap to remove the CLI commands to install Camel K. From this version onward, the command is deprecated so we strongly recommend you move to any other alternative way we have to install Camel K (OLM, Helm, Kustomize).

## Deprecate Spectrum publishing strategy

We're willing to simplify the project maintenance. That's the main reason why we've decided to deprecate Spectrum. Mind that this project was created and maintained exclusively for Camel K. Now that we see JIB is mature enough, we've decided to take this step. The JIB publishing strategy was the default for already some time and proved to be stable enough to take over Spectrum.

## Knative Trigger filter

In this version we've dedicated more time to the interoperability of Knative with Camel K. The result is several fixes that were opened for Knative and additionally the development of a new feature allowing to filter over Knative `Triggers`.

## Dependencies default order strategy

From this version onward we've decided to move the building strategy from a default "sequential" to a "dependencies" configuration. The latter will improve the performances a little bit as will queue up only those builds that depends on each other.

## Show Integration readiness in kubectl

A little but likely interesting feature we've introduced is the possibility to see the readiness status of an Integration directly in `kubectl` CLI (or `oc` if you're using Openshift). We're sure this will help you monitor better the status of your applications and let you know when they are really ready to get some traffic.

## Full release notes

Those were the most interesting features we have delivered in Camel K 2.4.0. We have more minor things and a lot of bug fixed, documentation and dependency updates that you can check in the [2.4.0 release notes](https://github.com/apache/camel-k/releases/tag/v2.4.0).

# Thanks

Thanks a lot to our contributors and the hard work happening in the community. Feel free to provide any feedback or comment using the Apache Camel available channels.
