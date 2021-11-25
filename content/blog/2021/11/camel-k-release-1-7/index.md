---
title: "Camel K 1.7 release"
date: 2021-11-18
draft: false
authors: [squakez]
categories: ["Releases", "Camel K"]
preview: "What's new in Camel K 1.7"
---

Today we're happy to announce a new major release for Camel K: [Camel K 1.7 version](https://github.com/apache/camel-k/releases/tag/v1.7.0), quite a big leap from latest 1.6 we released a couple of months ago. Keep reading to discover what's new in Camel K! 

First of all, let's highlight the set of technologies on which Camel K 1.7 is based:

* Apache Camel K Runtime 1.10.0
* Apache Camel Quarkus 2.4.0
* Apache Camel 3.12.0
* Apache Camel Kamelets 0.5.0

Thanks to Apache Camel, Camel Quarkus and Kamelet Catalog contributors for the great efforts they've put in those new releases as well.

## Quarkus native build support

The most exciting and promising feature we brought in Camel K 1.7 is probably the support for `Quarkus` native build. If you're not yet aware of it, Quarkus is the great technology that allows your Java application to **run as fast as any native compiled application**. That helps reducing the resource footprint and reduce almost to zero the startup time, making your application a `Cloud Native` first class citizen.

It was a long development and we're still polishing few things before adding official documentation (will do soon, keep tuned). You can find some useful information in the [discussion done during the development](https://github.com/apache/camel-k/pull/2536). In a nutshell, you can now launch your Camel application with a Quarkus Native profile:
```
$ kamel run -t quarkus.package-type=native ...
```
The build will need some time and some more resource than usual (average test of 5 minutes and 4GB of memory, but it will depend on each case) as there is an ahead of time compilation. The great news is that we thought that, while your native application is building, you can benefit the JVM mode as done normally so far:
```
$ kamel run -t quarkus.package-type=fast-jar -t quarkus.package-type=native ...
```
The Quarkus JVM application will be replaced with a rolling deployment update as soon as the native build will be completed!

We will provide more official documentation soon. In the meantime, feel free to try it and report any problem, feedback or suggestion, we'd love to hear about how you're using it.

This feature deserves a special mention to [Antonin Stefanutti](https://github.com/astefanutti) who has lead its development.

## Installation customization

In the last release we've dedicated some time to include improvements about the way you can customize your Camel K installation on a Kubernetes cluster.

We've introduced [Kustomize](https://kustomize.io/) support. Here the extract of the feature to be soon documented officially:

The `config` directory contains all the resources for installation and configuration of the camel-k operator. While, by default, those resource are installed through the `kamel` binary, they can also be applied directly to a cluster using `kustomize`. These resources can be modified prior to their installation and the `kustomize.yaml` files be changed to **include extra patches and settings**, as required.

More details on how to use it can be found in the [release page](https://github.com/apache/camel-k/releases/tag/v1.7.0).

## Polished Integration status

This one is a series of improvements to **include more descriptive information** related to the status of the integration. In particular we've worked to a couple of features that introduced a more detailed error reporting in the `Integration` and more reliability about the scaling status.

## Secondary Integration Platform

So far, a single operator was able to manage the `Integration` created on a namespace. This simple model was a bit limiting, as we were not able to distinguish a way to have more than one operator on the same namespace. With the new feature developed, now you will be able to declare a secondary `Integration Platform` and **have more than one operator** collaborating on the same `Namespace`. This is an advanced feature that will let you unlock more advanced deployment topology in order to have a [more scalable and resilient configuration](/camel-k/1.7.x/architecture/advanced.html).

## Traits enhancements

We have worked to a few interesting enhancements on the following traits:

* [Health](/camel-k/next/traits/health.html)
* [Camel](/camel-k/next/traits/camel.html)
* [Route](/camel-k/next/traits/route.html)
* [Deployment](/camel-k/next/traits/deployment.html)
* [Cron](/camel-k/next/traits/cron.html)

The new `health` trait was introduced to replace the responsibility of exposing the endpoint from `container` trait, encapsulating its responsibility in this self contained new trait. The new trait will also include the possibility to configure liveness and readiness probe individually.

We also moved the responsibility of `properties` from `deployment`, `cron` and `knative_service` to `camel` trait, in order to have a unique place where to manage this aspect.

In `route` trait we added the possibility to read certificates directly from Kubernetes `Secrets` instead of passing them as text.

There is a new property for `deployment` trait: `progress-deadline-seconds` which represents the maximum time in seconds for the deployment to make progress before it
is considered to be failed.

And finally, there are a new couple of properties for the `cron` trait as well. `active-deadline-seconds` which specifies the duration, relative to the start time, that the job may be continuously active before it is considered to be failed. `backoff-limit` which specifies the number of retries before marking the job failed.

## More Kamelet love

The [Apache Camel Kamelet Catalog](/camel-kamelets/next/index.html) keeps growing. We are also fixing the issue reported and making them more stable and consistent with the latest development delivered in Apache Camel ecosystem.

Let's also share some interesting news about the `Kamelets` world, as lately they became **one the stars of [ApacheCon](https://www.apachecon.com/)** with [a very nice presentation by Nicola Ferraro](https://www.youtube.com/watch?v=xVL1gJ5AJVg).

Also, let's remind a new interesting project we've already seen in some previous post, called [Karavan](/blog/2021/10/camel-karavan-preview-release/), whose one of the goals is to **simplify the usage/managment** of `Kamelets`.

## Dependencies upgrade

The upgrades we applied in this new release, deserve a dedicate section.

We upgraded Golang version to `1.6` which gave us the possibility to **bump several Kubernetes API** and so, be in line with the latest enhancements released in K8S space. We also moved to the latest Maven version, which now point to `3.8.3`. We took the opportunity to promote Knative and Service Binding to their first `1.x` stable release and to move Jolokia to version `1.7.1`. You can find more details on the [GitHub release page](https://github.com/apache/camel-k/releases/tag/v1.7.0).

## Documentation

As usual, we've tried to include all the official documentation for the new features and we've fixed things around. One interesting thing to mention is that **we moved our versioning label** from `latest` to `next` when we are talking about the development ongoing on `main` branch.

## Bug fixes and test coverage

We did not forget to take care of bug fixes, as you may see in the [release page](https://github.com/apache/camel-k/releases/tag/v1.7.0), many bugs were fixed. And, of course, we kept an eye on test, adding unit test and integration test for the new features we've developed.

# Thanks

Thanks to all contributors who made this possible. We're happy to receive feedback on this version through our [mailing list](/community/mailing-list/), our [official chat](https://camel.zulipchat.com/) or filing an issue on [Camel K Github repository](https://github.com/apache/camel-k).
