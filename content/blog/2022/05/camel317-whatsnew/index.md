---
title: "Apache Camel 3.17 What's New"
date: 2022-03-23
authors: [davsclaus]
categories: ["Releases"]
preview: Details of what we have done in the Camel 3.17 release.
---

Apache Camel 3.17 has just been TODO: released(/blog/2022/05/RELEASE-3.17.0/).

This release introduces a set of new features and noticeable improvements that we will cover in this blog post.

### Java 17 (runtime) support

This is the first release where we have official Java 17 support. The support is runtime only,
meaning that we do not add special support for new Java 17 language features such as Java records.

### Camel Main

We have improved the startup summary to list used configurations for auto-configuration and property placeholders
when running Camel standalone via `camel-main`.

The information displayed will show the source for each configuration; in other words
you can exactly see if the configuration is from `application.properties`, OS environment variable,
command line argument, or elsewhere.

### Camel JBang (Camel CLI)

In this release we have focused the most new development on the effort for Camel JBang.
This is a new way of getting started and using Apache Camel.

Users that are familiar with Camel K and its "ease of use", then we are taking that
same user experience to everyone; without the need for a Kubernetes platform.

Having JBang installed, then you can easily run a Camel application from a terminal.

To quickly create a new basic Camel integration use the `init` command:

    camel init hello.java

And then you can run the file:

    camel run hello.java

We made it easy to run existing examples directly loaded from GitHub:

    camel run https://github.com/apache/camel-kamelets-examples/tree/main/jbang/hello-java

And we also made it easy to download the example to local disk, so you can edit the source and
see live updates, using the `init` command:

    camel init https://github.com/apache/camel-kamelets-examples/tree/main/jbang/hello-java

And then you can run in developer mode that has live reloading on source changes (on save):

    camel run * --dev

We continue our effort on Camel JBang for the upcoming 3.18 LTS release.

There is a lot more that Camel JBang can do, so make sure to see the [Camel JBang documentation](/manual/camel-jbang.html).
There you can also find information how to get JBang installed, and after that install the camel app in JBang.

### Component Headers

We completed the work of documenting every headers of all supported components.

This means you can see in the website documentation what headers a component consumer or producer
uses, and their purpose.

This information is also available for tooling. For example the Camel IDEA plugin supports this
and can do code assistance in your Camel routes.

### Resume from Offset

TODO: Otavio anything to mention (pausable/resumable)

### Java DSL in Camel K

The `camel-java-joor-dsl` used by Camel K, and Camel JBang, now supports compiling all Java sources
in the same compilation unit, meaning they have the same classloader visibility and can use
dependency injection among themselves. 

### Camel YAML DSL

The YAML parser now have precise source:line error reporting, meaning you can see exactly
where there is a problem.

### Load properties from vault/secrets cloud services

We added support for Azure key vault service.
See more details at the following [blog post](/blog/2022/03/secrets-properties-functions/)

### Camel Kafka

TODO: More Kafka ???

We did other bug fixes, and we continue to make the camel-kafka component more robust. 1

### Spring Boot

We have upgraded to the latest Spring Boot 2.6 release.

Added more unit tests to various starter JARs to increase the QA of this project.

## Upgrading

Make sure to read the [upgrade guide](/manual/camel-3x-upgrade-guide-3_17.html) if you are upgrading from a previous Camel version.

## Release Notes

You can find more information about this release in the list of JIRA tickets resolved in the release: 

- TODO: release notes 3.17(/releases/release-3.17.0/)

