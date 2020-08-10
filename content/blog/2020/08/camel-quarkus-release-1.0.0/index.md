---
title: "Camel Quarkus 1.0.0 Released"
date: 2020-08-10
authors: ["ppalaga"]
categories: ["Releases", "Camel Quarkus"]
preview: The first stable release of Camel Quarkus
summary: "Walk through the highlights of the first stable release: Developer joy, Camel component coverage, Bootstrap, CDI, native mode and more!"
---

<sub><sup>Original image by <a href="https://commons.wikimedia.org/wiki/User:99of9">Toby Hudson</a> <a href="https://creativecommons.org/licenses/by-sa/3.0">CC BY-SA 3.0</a> via <a href="https://en.wikipedia.org/wiki/Camel_racing#/media/File:CamelRacingCamelCup2009Heat.JPG">Wikipedia</a></sup></sub>

The Apache Camel community celebrates the release 1.0.0 of Camel Quarkus!

## What is Camel Quarkus?

Camel Quarkus brings the outstanding integration capabilities of Apache Camel to [Quarkus](https://quarkus.io/) - the
toolkit for writing subatomically small and supersonically fast Java and Kotlin applications. In addition to
memory consumption and start time improvements on stock JVMs, Quarkus also allows for compiling applications to
[native executables](https://camel.apache.org/camel-quarkus/latest/user-guide/first-steps.html#_package_and_run_the_application)
thus improving the performance characteristics even more.

Camel Quarkus is suitable not only for creating long living services and potentially short living serverless
applications but also for
[command-style applications](https://camel.apache.org/blog/2020/07/command-line-utility-with-camel-quarkus/)
that execute some specific task (or wait for some specific condition) and exit.

## Developer joy

Writing integrations has never been more joyful for developers than with Camel Quarkus:

* Easy to start with: either via [code.quarkus.io](https://code.quarkus.io/) or using `mvn quarkus:create`
* The "live coding" feature, a.k.a. `mvn compile quarkus:dev` shortens your development iterations - check
  [this 2 mins video](https://www.youtube.com/watch?v=4lXSf8DBQkQ)
* Easy to test using JUnit 5 extensions
* Hides the complexity of the native compilation using [GraalVM](https://www.graalvm.org/) or
  [Mandrell](https://github.com/graalvm/mandrel)

Check our [User guide](https://camel.apache.org/camel-quarkus/latest/user-guide/first-steps.html)!

## Camel components coverage

Since the [early beginnings](https://github.com/quarkusio/quarkus/tree/0.11.0/extensions/camel) the number of supported
Camel bits went up substantially. As of Quarkus 1.0.0 and
Camel 3.4, Camel Quarkus supports:

* 155 out of 350 Camel components (44%)
* 27 out of 43 Camel data formats (63%)
* 13 out of 17 Camel languages (76%)
* 17 out of 42 miscellaneous Camel components (40%)

Some of these are supported in JVM mode only - please refer to the
[complete list](https://camel.apache.org/camel-quarkus/latest/list-of-camel-quarkus-extensions.html) for details.

## Bootstrapping methods

There are two ways to bootstrap and configure Camel Quarkus:

1. Bare
2. With Camel Main

Both methods configure and start a Camel Context for you. The main difference is in how much the resulting Camel Context
obeys the conventions known from Camel on other platforms. If you like to configure your routes using
`camel.component.*` properties, then you need to add the `camel-quarkus-main` dependency and the properties
will work as usual on Camel standalone or Camel Spring Boot. You may prefer this option if you used Camel before or if
you are migrating from other platform.

If you rather come from the CDI side and you never wrote Camel integrations before, you may choose to use the bare
bootstrap and configure your routes using CDI. You can configure Camel using CDI even if you have Camel Main in your
application.

See the [Bootstrap section](https://camel.apache.org/camel-quarkus/latest/user-guide/bootstrap.html) of the User guide
for more details.

## CDI

CDI plays a central role in Quarkus and Camel Quarkus offers a first class support for it too. You may use `@Inject`,
`@ConfigProperty` and other annotations e.g. to inject beans and configuration values to your Camel RouteBuilder's.
See the [CDI section](https://camel.apache.org/camel-quarkus/latest/user-guide/cdi.html) of the User guide for more
details.

## Native mode

As mentioned above, Quarkus brings the option to compile an application to native executable. Compared to running on
JVM, native applications start faster, require less memory at runtime and are also smaller on disk.

However, the native compilation with GraalVM is all but easy and straightforward. First, there are
[limitations](https://github.com/oracle/graal/blob/master/substratevm/LIMITATIONS.md) for what your code and all your
dependencies may or may not do. Second, the native compiler needs to be configured through many options that may not be
easy to figure out and maintain.

Quarkus isolates application developers from most of those subtleties. The native compilation is driven by
extensions which configure the native compiler in a way suitable for the given aspect of the application.

On Camel Quarkus, the extensions roughly correspond to camel components - i.e. if you
need `camel-sql` you add the `camel-quarkus-sql` extension as a dependency to your application and it takes
care for both pulling the `camel-sql` artifact and configuring the native compiler. Extension pages document any
further configuration that needs to be done by the application developer. E.g. in case of the
[SQL extension](https://camel.apache.org/camel-quarkus/latest/extensions/sql.html#_additional_camel_quarkus_configuration),
the `quarkus.camel.sql.script-files` property needs to be set.

Check the [Native mode](https://camel.apache.org/camel-quarkus/latest/user-guide/native-mode.html) section of the Camel
Quarkus User guide and [Quarkus Native guide](https://quarkus.io/guides/writing-native-applications-tips) for more
details about the native compilation on Quarkus.

## Who is using Camel Quarkus?

While we mostly have only indirect information about the usage via
[GitHub issues](https://github.com/apache/camel-quarkus/issues), there is one prominent user, we are especially proud
of: [Camel K](https://camel.apache.org/camel-k/latest/index.html). As of
[Camel K 1.0](https://camel.apache.org/blog/2020/06/camel-k-release-1.0.0#fast-startup-and-low-memory), Camel Quarkus is
one of the two supported runtimes and "is expected to be the default underlying runtime in the next release".

## Highlights of the release 1.0.0

General:

* Camel 3.4.2
* Quarkus 1.7.0.Final

New extensions:

* [Grok](https://camel.apache.org/camel-quarkus/latest/extensions/grok.html)
* [JPA](https://camel.apache.org/camel-quarkus/latest/extensions/jpa.html)

## What's next?

* [More extensions](https://github.com/apache/camel-quarkus/issues?q=is%3Aissue+is%3Aopen+label%3Aextension) - upvote
  or even better [contribute](https://camel.apache.org/camel-quarkus/latest/contributor-guide/index.html)!
* Even less reflection with Camel 3.5

We wish you a lot of joy with Camel Quarkus and we look forward to your feedback and participation!

