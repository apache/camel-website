---
title: "Camel K 1.5 release"
date: 2021-07-13
draft: false
authors: [squakez]
categories: ["Releases", "Camel K"]
preview: "What's new in Camel K 1.5"
---

[Camel K 1.5 version](https://github.com/apache/camel-k/releases/tag/v1.5.0) is public since a few days. We're proud to announce this new release containing enhancements and fixes. We've worked hard to fix the most important issues discovered with an eye on stabilization and performances. This new release is based on **Camel Quarkus 2.0** and **Apache Camel 3.11**.

Let's find out what's new in Camel K 1.5!

## New Camel Quarkus and Quarkus versions

**Camel Quarkus** runtime has become the building block on which the `Integration` is materialized. With the new 2.0 version out, there are great improvements which are leveraging the major release of **Quarkus 2.0**. We're inheriting all the good stuff in performance and components coverage that is introduced lately in this new version.

* [Camel Quarkus 2.0.0 released](/blog/2021/06/camel-quarkus-release-2.0.0/)
* [What's new in Camel 3.11.0](/blog/2021/06/Camel311-Whatsnew/)

## Tune your logs

As software developers, we are daily watching logs to discover what's going on for a piece of software that is failing. **Observability** and all the activities around that area are needed in order to have a reliable software solution. We know that, and we've introduced a new `trait` that will simplify the work of tuning and integrating the log streams in your logging systems.

You can learn more in [a blog dedicated to the topic](/blog/2021/05/new-camel-k-logging-features/).

## S3 dependencies

**S3** protocol is often used as a way to store Maven dependencies. With version 1.5 you will be able to configure your Camel K to retrieve such dependencies.

## Configuration refactoring

Prior to this version, we may have found a bit clumsy the work of providing a configuration file to our `Integration`. As a developer, you will now be able to define in details how and where to load a configuration file, filter a `Configmap` or a `Secret` and also distinguish between __build-time__ and __runtime__ properties. An entire blog covering this feature will be soon available, stay tuned!
 
## More Kamelet commands

Since their appearence, **Kamelets** have gained quite a lot of traction. With this new release we've introduced new commands in the `kamel` CLI to help you discovering and managing them. You will have a new command available `kamel kamelet` that will help you listing and deleting any `Kamelet`. Also `kamel describe kamelet` has been introduced to help you analyising the available Kamelets.

## Allow configuration via traits annotations

We are aware that the CLI is not the only way to create an `Integration`. For this reason we've introduced a new way to simplify the setting of a `trait` directly in the `Integration` specification. Instead of specifying a trait in the `.spec.integration.traits.trait-id.configuration.trait-property` you will be now able to do so via `.metadata.annotations`.

## More test coverage

Of course, we haven't forgot to include more unit and integration tests to our code base. With this release we've introduced new test cases that are giving more confidence to the development lifecycle.

## Polish documentation

We are happy to announce a few new improvements in the online documentation. We're dedicating some more time to refresh the documentation that may be missing or that can be incomplete.

### Versioned documentation

One little but great improvements we've introduced lately is the versioning of the Camel K documentation website. Just look on the left bottom bar of your browser and you will be able to select either `latest` or `1.4.x`.

### Generated API

Another thing that is worth to mention is a first version of our API that is now available through the documentation pages. Have a look at [Camel K API resources documentation page](/camel-k/latest/apis/camel.html) in order to understand how to interact directly with them.

# Thanks

Thanks to all contributors who made this possible. We're happy to receive feedback on this version through the [usual channels](/camel-k/latest/contributing/developers.html) or filing an issue on [Camel K Github repository](https://github.com/apache/camel-k).