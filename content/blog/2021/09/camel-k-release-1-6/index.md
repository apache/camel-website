---
title: "Camel K 1.6 release"
date: 2021-09-09
draft: false
authors: [squakez]
categories: ["Releases", "Camel K"]
preview: "What's new in Camel K 1.6"
---

We're happy to announce [Camel K 1.6 version](https://github.com/apache/camel-k/releases/tag/v1.6.0) release. About two months after releasing the previous version (1.5), we're now glad to provide you some new exciting features and a few fixes on bugs that we discovered along the way.

This is the new set of technologies on which Camel K 1.6 is depending:

* Apache Camel K Runtime 1.9.0
* Apache Camel Quarkus 2.2.0
* Apache Camel 3.11.1
* Apache Camel Kamelets 0.4.0

## New Camel Quarkus version

We have a set of new exciting dependencies that we leverage. Among them we can see the fresh [Camel Quarkus 2.2.0](/blog/2021/09/camel-quarkus-release-2.2.0/). Have a look at the dedicated blog to learn more about it.

## Scalable KameletBinding

We're more and more getting used to `Kamelet` and `KameletBinding` adoption. One of the new things introduced in version 1.6 is the possibility to scale a KameletBinding via `kubectl` (or `oc`) CLI. Learn more about [how to scale a KameletBinding](/camel-k/next/scaling/binding.html). One of the coolest thing is that you can even use HPA (Horizontal Pod Autoscaling)!

## Kamel bind enhancement

The `kamel bind` subcommand was recently introduced to simplify the creation of binding between source and sinks. We are enriching it with new features at every release. With this version you will be able to use `--error-handler` parameter in order to set an error handler that will take over in case of an event fault.

## Support https liveness and readiness probes

Security in transit is a must. Even for probes. We have improved the [container trait](/camel-k/next/traits/container.html) in order to allow setting liveness and readiness probes with `https` scheme.

## More Kamelet love

We have reached 150+ official Kamelet! If you need some connector to quickly source or sink your events, then, the [Apache Camel Kamelet Catalog](/camel-kamelets/next/index.html) is the place.

## Bug fixes, test coverage and documentation

And of course, last but not least, we have dedicated an important effort to close known bugs, keep raising the bar of quality adding tests and documentation.

# Thanks

Thanks to all contributors who made this possible. We're happy to receive feedback on this version through our [mailing list](/community/mailing-list/), our [official chat](https://camel.zulipchat.com/) or filing an issue on [Camel K Github repository](https://github.com/apache/camel-k).
