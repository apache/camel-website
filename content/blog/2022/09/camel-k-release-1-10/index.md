---
title: "Camel K 1.10 release"
date: 2022-09-05
draft: false
authors: [squakez]
categories: ["Releases", "Camel K"]
preview: "What's new in Camel K 1.10"
---

It's been a long ride to bring our beloved Camel (K) from 1.9.0 to [1.10.0](https://github.com/apache/camel-k/releases/tag/v1.10.0). We're particularly happy as we had the time to introduce many features and enhancements that we had planned in our [2022 roadmap](/blog/2022/03/camel-k-roadmap-2022/) back at the beginning of the year. 

As usual let's start by acknowledging the tech stack on top of Camel K and the new exciting versions our fellows have baked:

* Apache Camel K Runtime 1.14.0
* Apache Camel Quarkus 2.11.0
* Apache Camel 3.18.0
* Apache Camel Kamelets 0.9.0

Thanks to Apache Camel, Camel Quarkus and Kamelet Catalog contributors for the great efforts they've put in those new releases.

## Traits configuration schema

This one was a big effort requiring a deep refactorying. Traits are now strongly typed and can be validated against their schema. We have worked to make this change retro compatible, but, from now on, you should be using the new structure. This is particularly true if you were used to specify the trait directly in the `Integration` custom resource.

Trait properties under spec.traits.<trait-id>.configuration are now defined directly under spec.traits.<trait-id>, for example:

```
traits:
  container:
    configuration:
      enabled: true
      name: my-integration
```
will become
```
traits:
  container:
    enabled: true
    name: my-integration
```

Same luck for the `addons`. If you need further details on how to use the new structure, you can have a look at the description in the original [trait configuration schema pull request](https://github.com/apache/camel-k/pull/3235).

## Add settings security to Maven build

Securing your applications should be a top one priority. With the addition of Maven settings security, we're giving some more option to our user to strenghten their security policies. Find more information in the Camel K Maven setting security documentation page.

## Environment promotion

One of the most requested features in the last months was about the promotion of a running integration from a lower environment (ie, from a development environment, to production). So far we had several strategies that every user has adopted but none was the one officially supported. With the new `kamel promote` command we are adding an opinionated way to stage your Integrations safely.

Just start developing your Integration according to your development model. Test it as much as you need and when you think this is ready to be promoted in a following environment, then, just use the `kamel promote` which will be in charge to do all the needed steps to validate in the promoting namespace.

We'll work to provide some official documentation soon, in the while, feel free to see how to use it following the instructions in the [kamel promote pull request](https://github.com/apache/camel-k/pull/3325).

## Garbage collector enhancements

While doing some stress tests, we've noticed that there were a high number of unauthorized requests to the cluster from the Garbage Collector trait. Altough this did not turn into any side effect, it was something we have removed. We took the opportunity to do other optimization as well, so, this trait is working better than ever now.

## Multi operator handling and multi tenancy model

Another big effort that required some heavy refactoring. Before version 1.10, there was no way to have more than one operator running at the same time. We had provided some development to partially allow multiple operators. Within this release, we're freeing the Camel K operator to be bound to a namespace, letting the Integrations (and the rest of CRDs) to declare which is the operator in charge of reconciling.

The new model translates into more liberty from the user which can define a "self service" tenancy model. You can have several Camel K operators running, each of them managing its own set of resources. The nice thing is that we have worked to maintain full compatibility with what we used to have. So, if you don't need this new advanced feature, the application will behave exactly as it was.

For a deep understanding of this new feature, I invite you to look at the [related pull request](https://github.com/apache/camel-k/pull/3358).

## Knative enhancements

Serverless is one of the features we've always sponsored in Camel K. That means **Knative**. We have therefore worked to several important fix/enhancements that will make your Serverless life easier:

* Upgrade Knative to 1.6.0
* Knative service visibility support
* Make knative broker name configurable
* Knative service triggering new pods until node exhaustion

## Resume API support

Lately in Camel there was the great addition of the _Resume API strategy_. Within this release, we've introduced this support to let you Integration consume data at scale. Let's add some quote from a nice blog written recently about the [Resume API](/blog/2022/03/resume-api-v2/):

> With this API the users can instruct Camel to start consuming data from the last offset that was processed. For instance, when reading a very large file Camel can skip reading the file offsets that have been previously consumed. It can start processing at the last processed offset.

## Wiretap EIP

As we've discussed some time ago in the 2022 roadmap, we have some limitations in detecting the whole Camel DSL. For this reason we appreciate this great contribution that will let you use the `wiretap` EIP in your Camel K integrations from this version onward.

## Kamel rebuild failsafe

If you're an experienced Camel K developer, you've surely run into some upgrade process. After upgrading the operator, one of the latest actions you have to perform is a `kamel rebuild` that _was_ in charge to rebuild all Integrations. But, what if you want to rebuild only some of them? and, what if you run this command by mistake!? Fear you not. From version 1.10 we've introduced the possibility to run `kamel rebuild my-integration` command that will rebuild only the one integration you really want to rebuild. And if you still are a brave one, then `kamel rebuild --all` is the command for you.

## Kamel local

`kamel local` is still a good approach for testing your Integration locally without a Kubernetes cluster. For this reason we've dedicate some effort to include all the latest development into this useful command.

## Nightly releases for all supported versions

As we're continuing our effort to improve the CI, we've extended the nightly build from the one we had on `main` branch, to the rest of releases branch we support. From now on you should be able to have **nightly releases** for any Camel K version back to 2 versions (ie, now we release 1.11-nightly, 1.10-nightly and 1.9-nightly).

## Dependencies upgrade

As usual, we have taken the opportunity to upgrade most of the dependencies we have. In particular we should mention we're now building Camel K with **Golang version 1.7**. Then, as we've mentioned earlier, we've upgraded the **Knative** versions to 1.6. Another important update we should mention is related to API as we've moved **CronJob** from batch/v1beta1 to batch/v1. Finally it is worth to mention that we've updated **Kubernetes** dependencies from version 0.22.5 to 0.23.5.

## Documentation

Within this release we've added and updated many entries. We'll probably work within next release to cover the feature we were not able to document within this release.

## Bug fixes and test coverage

As you may see in the [release page](https://github.com/apache/camel-k/releases/tag/v1.10.0) we have closed quite a good number of known bugs as well.

# Thanks

Thanks to all contributors who made this possible. We're happy to receive feedback on this version through our [mailing list](/community/mailing-list/), our [official chat](https://camel.zulipchat.com/) or filing an issue on [Camel K Github repository](https://github.com/apache/camel-k).
