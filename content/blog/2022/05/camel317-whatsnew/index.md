---
title: "Apache Camel 3.17 What's New"
date: 2022-03-19
authors: [davsclaus,gzurowski,essobedo,orpiske,aldettinger,apupier,zhfeng]
categories: ["Releases"]
preview: Details of what we have done in the Camel 3.17 release.
---

Apache Camel 3.17 has just been [released](/blog/2022/05/RELEASE-3.17.0/).

This release introduces a set of new features and noticeable improvements that we will cover in this blog post.

### Java 17 (runtime) support

Camel 3.17 is the first release where we have official support for Java 17, really easy to remember :) That said, the Java 17 support
is runtime only, meaning that we do not add special support for new Java 17 language features such as Java records.

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
At first install Camel into JBang so you can run using the `camel` command:

    jbang app install camel@apache/camel

Then you can quickly create a new basic Camel integration use the `init` command:

    camel init hello.java

And run the file (use `ctrl + c` to stop):

    camel run hello.java

We made it easy to run existing examples directly loaded from GitHub:

    camel run https://github.com/apache/camel-kamelets-examples/tree/main/jbang/hello-java

And we also made it easy to download the example to local disk, so you can edit the source and
see live updates, using the `init` command:

    camel init https://github.com/apache/camel-kamelets-examples/tree/main/jbang/hello-java

And then you can run in developer mode (`--dev`) with _live reloading_ on source changes (on save):

    camel run * --dev

We continue our effort on Camel JBang for the upcoming 3.18 LTS release.

There is a lot more that Camel JBang can do, so make sure to see the [Camel JBang documentation](/manual/camel-jbang.html).
There you can also find information how to get JBang installed, and after that install the camel app in JBang.

### Component Headers

We completed the work of documenting every header's of all supported components.

This means you can see in the website documentation what headers a component consumer or producer
uses, and their purpose.

This information is also available for tooling. For example the Camel IDEA plugin supports this
and can do code assistance in your Camel routes.

### Resume from Offset

This release adds experimental support for pausable Kafka consumers. Under certain error conditions, it is now possible to pause the Kafka consumer so that consumption can be further resumed once the conditions on the integration are adequate. Please check the Resume API documentation for details.

Experimental support for resume operations was added to the following components in this release: `camel-atom`, `camel-rss`, `camel-cassandraql` and `camel-couchbase`. 

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

We did other bug fixes, and we continue to make the camel-kafka component more robust. In particular, we fixed issues related to concurrency as well as resume API related issues. To simplify the code maintainance, we also simplified the way the code tracks the last processed offset. We added support for kafka transaction in producer and it can work with `transacted()`. It would commit the transaction or abort it if there is an Exception throwing or the exchange is marked with `RollbackOnly`. It can not be used in multi threads since kafka transaction does not support it right now. Also kafka transaction does not support JTA/XA spec, so there is still a risk with the data consistency when combining with some XA resources (SQL or JMS).

### New Components

There are three new components:

- camel-azure-key-vault - Manage secrets and keys in Azure Key Vault Service
- camel-debezium-db2 - Capture changes from a DB2 database
- camel-debezium-oracle - Capture changes from a Oracle database

### Spring Boot

We have upgraded to the latest Spring Boot 2.6 release.

Added more unit tests to various starter JARs to increase the QA of this project.

## Upgrading

Make sure to read the [upgrade guide](/manual/camel-3x-upgrade-guide-3_17.html) if you are upgrading from a previous Camel version.

## Release Notes

You can find more information about this release in the list of JIRA tickets resolved in the release: 

- [Release notes 3.17](/releases/release-3.17.0/)

