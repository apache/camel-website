---
title: "Apache Camel 4 What's New (top 10)"
date: 2023-08-15
authors: [davsclaus,gzurowski,opiske]
categories: ["Releases"]
preview: Top 10 of what's new in Apache Camel version 4
---

After 10 months of development, with 3 milestone, and 2 RC releases, then Apache Camel v4 is released
today as LTS release. The Camel `4.0.x` is a LTS release that is supported for 1 year.

This blog post highlights some noteworthy new features and improvements in Camel v4.

The features are based on work since January 2023, which was the time, where we switched `main` branch
to be Camel v4 based, and our effort was focused primary on Camel v4.

### 1) Major Goals

The need for Camel 4 is mainly driven by Java open source projects migrating from `javax` to `jakarta` APIs
and to keep up with popular runtimes such as Spring Boot and Quarkus.

1. Migrate from `javax` -> `jakarta` (JEE 10)
2. Java 17 as minimum
3. Spring Boot 3
4. Quarkus 3

Camel 4 requires Java 17. Support for Java 21 is planned for next LTS released by end of this year. 

### 2) Dependency updates

We have upgraded all 3rd party dependencies to their latest releases where possible.

### 3) Performance optimizations

We have improved the performance of the internal Camel routing engine and framework. 

You can find more details in this blog post [camel 4 performance improvements](/blog/2023/05/camel-4-performance-improvements.html).

### 4) Camel Spring Boot

Camel 4 is at the time of release, tested with the latest Spring Boot 3.1.2 release.

This release also comes with our first basic (and very limited) support for Spring Boot native (AOT compilation).
See more in the [aot-basic](https://github.com/apache/camel-spring-boot-examples/tree/main/aot-basic) example.

### 5) Camel Quarkus

The Camel Quarkus project is working on a new release with Camel 4 support, expected later this month.
Stay tuned for their release announcements.

### 6) Camel Main

For users that just want to run standalone Camel, then we have `camel-main` that are constantly being improved.
The foundation in `camel-main` is reused by Camel Spring Boot, Camel Quarkus, and Camel JBang as well.

For Camel 4 we have made it possible to easily include an embedded HTTP server with the new `camel-platform-http-main` module.
See more in the [camel-main](https://github.com/apache/camel-examples/tree/main/examples/main) example.

### 7) Camel JBang

A lot of improvements was put into `camel-jbang`. The `camel` CLI is now able to easily run with different Camel versions,
for example

    camel run foo.yaml --camel-version=3.21.0
    camel run foo.yaml --camel-version=3.20.6

This is very handy when you for example need to trouble-shoot why _something_ started failed. It works on X but not on Y,
and now you can quickly try and find out which version in between that started failing.

You can also specify that `camel` CLI should by default use a specific Camel version, for example if you have a newer version
of Camel JBang installed but must develop and use an older release.

    camel version set 3.20.6

The following new commands has been added

- `camel config` - to set custom user configuration
- `camel log` - to show logs of your running Camel integrations (can show logs for 1 or more Camel apps)
- `camel trace` - to show message tracing of your running Camel integrations (can show logs for 1 or more Camel apps)
- `camel cmd send` - to send messages to an existing running Camel integration
- `camel get route-dump` - to dump routes in XML or YAML format

The maven resolver that Camel JBang uses has been migrated to latest, and Camel JBang will now report more accurately
whether a dependency was downloaded or resolved from a local maven repository. The `camel run` command also has a `--verbose`
flag to output more details in dependency resolution that can help during troubleshooting.

The `camel-main` runtime now supports exporting with Kubernetes manifest and build support, to make it easier to build
container images that are ready to run on Kubernetes.

In general there has been many improvements to Camel JBang making this a great way to try Camel, and as well as
a companion tool you can use during traditional Camel development.

### 8) XML DSL with beans

We have been working on to unify the YAML, XML and Java DSL to be more aligned in feature parity related
to configuring beans. For example in XML DSL (`camel-xml-io`) you can now declare beans and Camel routes in
the same XML file with `<camel>` as the root tag:

```xml
<camel>

    <bean name="greeter" type="com.foo.Greeter">
        <properties>
            <property key="message" value="Hello World" />
        </properties>
    </bean>

    <route id="my-route">
        <from uri="direct:start"/>
        <bean ref="greeter"/>
        <to uri="mock:finish"/>
    </route>

</camel>
```

Then Camel handles the dependency injection, among the `<beans>`. 

You can also use Spring dependency injection (which is more advanced), by inlining Spring `<beans>` tag with the spring namespace.
See more in the documentation for `camel-xml-io-dsl` module.

There is more work to be done, and we are planning to see if we can also use this to make migration from legacy
OSGi Blueprint (and Spring XML files, eg `<beans>`) to modern Camel DSL.

### 9) New components

- `camel-aws2-step-functions`: Manage and invoke AWS Step functions
- `camel-azure-files`: Send and receive files on Azure File Storage
- `camel-dhis2`: Integrate with DHIS2 (health-level)
- `camel-opensearch`: Send requests to OpenSearch
- `camel-parquet-avro`: Parquet Avro serialization and de-serialization
- `camel-platform-http-main`: Platform HTTP for Camel Main runtime
- `camel-yaml-io`: YAML DSL route dumper

### 10) Miscellaneous improvements

Camel 4 now requires JUnit 5 for unit tests, with the test components that have -junit5 as suffix.

If you work with XML or JSon payloads then the body can be logged in pretty format with:

    .log("${prettyBody}")

And in XML

    <log message="${prettyBody}"/>

And in YAML

    - log: "${prettyBody}"


TODO: Other bits and pieces

### 11) Migrating to Camel 4

We have of course cleaned up the code base, such as removing all deprecated APIs and components. 
We have also adjusted some APIs in regard to configuring `CamelContext` with custom settings.

In terms of backward compatibility then Camel 4 is mostly compatible for regular Camel applications.
However, if you are using some of the more advanced features and other plugins in Camel then migration is needed.
Also, custom components must be migrated and recompiled.
All details can be seen in the [migration guide](/manual/camel-4-migration-guide.html).

Good luck with your migration if you decide to continue your Camel journey. And for new users to Camel then good luck getting onboard.

### 12) Roadmap for remainder of 2023

We will continue working on Camel 4.x and do non-LTS releases, leading up to the next LTS release by end of this year.
The major goals for this is Java 21 support, Spring Boot 3.2, and to catch up with newer Quarkus releases.

The following release scheduled, is subject for change.

| Release | Date | Description |
|---------|------|-------------|
| 4.1     | Oct  | Non-LTS     |
| 4.2     | Dec  | LTS         |

An ongoing effort is also to keep stabilizing our CI builds, to ensure commits do not introduce regressions.
At this moment then the CI builds are occasionally have a few test errors that are related to flaky tests, that
we keep fixing, to ensure the CI reports are trustworthy.

During the development of Camel 4, our community received many contributions for improving Camel build and tests on higher 
end server platforms such as Power (ppc64le) and s390x (Linux On Mainframe). Users and organizations building and leveraging 
Apache Camel on those platforms should have a smoother experience with Camel 4.

We have also identified that we can improve performance in the Camel type converter systems, which we plan to refactor
for Camel 4.1 onwards.

And of course all the usual new features and improvements coming in from community users and contributors.
