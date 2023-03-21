---
title: "Camel K 1.8 release"
date: 2022-01-26
draft: false
authors: [squakez]
categories: ["Releases", "Camel K"]
preview: "What's new in Camel K 1.8"
---

<sub><sup>Image copyright: <a rel="nofollow" href='https://stock.pixlr.com/creator/stockunlimited'>stockunlimited</a></sup></sub>

Time for a new release! Time for [Camel K 1.8 version](https://github.com/apache/camel-k/releases/tag/v1.8.0). Keep reading to discover what's new in Camel K! 

This is the set of technologies on which Camel K 1.8 is based:

* Apache Camel K Runtime 1.11.0
* Apache Camel Quarkus 2.6.0
* Apache Camel 3.14.0
* Apache Camel Kamelets 0.7.0

As usual, thanks to Apache Camel, Camel Quarkus and Kamelet Catalog contributors for the great efforts they've put in those new releases as well.

## KEDA support

The most remarkable feature available in this new release, is the support of [KEDA](https://keda.sh/). Thanks to this feature, you will be now able to add **autoscaling features to any kind of event** supported by KEDA, not only based on HTTP as we used to have with Knative. Learn more about this fantastic feature reading the dedicated blog, [Camel meets Keda](/blog/2022/01/camel-keda/).

## Faster Operator startup

You already know, Camel K was imprinted with the concept of fast execution. One great work we carried on, was to **reduce the time to startup the operator** in less than a second. Quite remarkable and very welcome in the era of Cloud Native!

## Honor HTTP proxy settings

We had this feature in our TODO list since a while. You will be able to use your HTTP(S) proxy in the Camel K Operator for any kind of egress operation (Maven dependencies, image pulling, ...). Moreover, once set, you will be able to have it automatically **configure the HTTP proxy settings** in all your `Integrations`. Just declare the typical HTTP proxy environment variables during Camel K Operator installation. Have a look a the [official documentation](/camel-k/next/    installation/advanced/http-proxy.html) for more details. 

## Configurable Maven CLI options

Maven is our preferred tool for managing projects dependencies. However, sometimes it is very verbose, in particular when it downloads the Internet... Jokes apart, we introduced the possibility to set the `.IntegrationPlatform.spec.build.maven.cliOption`, which will allow you **provide any `maven` configuration you want** (ie, `-V,--no-transfer-progress,-Dstyle.color=never, ...`). Your log aggregation tool will breath now.

## Encapsulated configuration, volumes and properties logic into traits

This is a bit an hidden feature, but you must be aware of what's behind the scenes. We moved part of the logic previously run by the `kamel run` command, into a dedicated trait, which will be in charge to take care of that aspect only. With this strategy we aim to **simplify the `Integration` configuration** and the execution which is not done via `kamel` CLI.

More in detail, with this release we've moved the `-p|--property` logic into the [Camel trait](/camel-k/next/traits/camel.html). We've also created the [Mount trait](/camel-k/next/traits/mount.html) which will be take care of `--config`, `--resource` and `--volume` parameters of the `kamel run` CLI command. Nothing will change for the CLI users. If you instead are directly editing the `Integration`, be aware that we have deprecated the `.Integration.Configuration` and `Integration.Resources` field in favour of those traits. We will still support it for a few more releases, but you should no longer use it in the future.

## Report runtime health checks into Integration readiness condition

In the latest releases we're improving the monitoring aspect in order to provide the user all the information about the health of an `Integration`. In this release we're improving the **readiness condition** which now incorporates the Camel runtime health status into the Integration status.

## More Kamelet love

The [Apache Camel Kamelet Catalog](/camel-kamelets/next/index.html) is already on `0.7.0` version. It's **growing and getting more mature** at each new release.

## Dependencies upgrade

There are several dependency upgrades. Nothing really remarkable, you can find more details on the [GitHub release page](https://github.com/apache/camel-k/releases/tag/v1.8.0).

## Documentation

We've worked on completing known gaps on the documentation. It worths to mention the section explaining [how to use Jitpack](/camel-k/next/configuration/dependencies.html#dependencies-kind-jitpack).

## Bug fixes and test coverage

As you may see in the [release page](https://github.com/apache/camel-k/releases/tag/v1.8.0) we have closed quite a good number of known bugs as well.

# Thanks

Thanks to all contributors who made this possible. We're happy to receive feedback on this version through our [mailing list](/community/mailing-list/), our [official chat](https://camel.zulipchat.com/) or filing an issue on [Camel K Github repository](https://github.com/apache/camel-k).
