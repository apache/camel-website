---
title: "Apache Camel 4 What's New (top 10)"
date: 2023-08-15
authors: [davsclaus,gzurowski,opiske]
categories: ["Releases"]
preview: Top 10 of what's new in Apache Camel version 4
---
After 10 months of development, with 3 milestones, and 2 RC releases, we are releasing Apache Camel v4 
today as LTS release. The Camel `4.0.x` is a LTS release, and we will support it for 1 year.

This blog post highlights some noteworthy new features and improvements in Camel v4.

The features are based on work since January 2023, which was the time when we switched `main` branch to
be Camel v4 based. Since then, we focused our effort primarily on Camel v4.

### 1) Major Goals

The need for Camel 4 is mainly driven by Java open source projects migrating from `javax` to `jakarta` APIs,
and to keep up with popular runtimes such as Spring Boot and Quarkus.

1. Migrate from `javax` -> `jakarta` (JEE 10)
2. Java 17 as minimum
3. Spring Boot 3
4. Quarkus 3

Camel 4 requires Java 17. We plan to support Java 21 on next LTS released by the end of this year. 

### 2) Dependency updates

We have upgraded all 3rd party dependencies to their latest releases where possible.

### 3) Performance optimizations

We have improved the performance of the internal Camel routing engine and framework. 

You can find more details in this blog post [camel 4 performance improvements](/blog/2023/05/camel-4-performance-improvements.html).

### 4) Camel Spring Boot

We tested Camel 4 with Spring Boot 3.1.2, the latest release available.

The `camel-platform-http-starter` is now using the embedded HTTP server directly from Spring Boot, instead of
using Servlet APIs as previously.

This release also comes with our first basic (and very limited) support for Spring Boot native (AOT compilation).
See more in the [aot-basic](https://github.com/apache/camel-spring-boot-examples/tree/main/aot-basic) example.

### 5) Camel Quarkus

The Camel Quarkus project is working on a new release with Camel 4 support, expected later this month.
Stay tuned for their release announcements.

### 6) Camel Main

For users who just want to run Camel as a standalone application, we have `camel-main` which is constantly being improved.
The core in `camel-main` is reused by Camel Spring Boot, Camel Quarkus, and Camel JBang as well.

The inclusion of an embedded HTTP server is now made easy with the new `camel-platform-http-main` module.
See more in the [camel-main](https://github.com/apache/camel-examples/tree/main/examples/main) example.

### 7) Camel JBang

We made a lot of improvements to Camel JBang. The `camel` CLI can now easily run with different Camel versions, for example:

    camel run foo.yaml --camel-version=3.21.0
    camel run foo.yaml --camel-version=3.20.6

This is very handy when, for example, you need to trouble-shoot why _something_ started failed. For instance, in occasions when
it works on version X but not on version Y, now you can quickly try to find out which version in between that started failing.

You can also specify that `camel` CLI should use a specific Camel version by default. For example, if you have a newer version of
Camel JBang installed, but must develop and use an older release:

    camel version set 3.20.6

We added the following new commands:

- `camel config`: you can use to set custom user configuration
- `camel log`: you can use to show logs of your running Camel integrations (can show logs for 1 or more Camel apps)
- `camel trace`: you can use to show message tracing of your running Camel integrations (can show logs for 1 or more Camel apps)
- `camel cmd send`: you can use to send messages to an existing running Camel integration
- `camel get route-dump`: you can use to dump routes in XML or YAML format

We migrated the maven resolver that Camel JBang uses to the latest version, and Camel JBang will now report more accurately whether
a dependency was downloaded or resolved from a local maven repository. The `camel run` command also has a `--verbose` flag to output
more details in dependency resolution that can help during troubleshooting.

The `camel-main` runtime now supports exporting with Kubernetes manifest and build support, to make it easier to build
container images that are ready to run on Kubernetes.

We made many improvements to Camel JBang, making it a great way to experiment with Camel and a useful companion tool for traditional 
Camel development.

### 8) XML DSL with beans

We have been working on to unify the YAML, XML and Java DSL, so that they have feature parity related to configuring beans. For example,
in XML DSL (`camel-xml-io`) you can now declare beans and Camel routes in the same XML file with `<camel>` as the root tag:

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

There is more work to be done, and we are planning to see if we can also use this to simplify migrating from legacy OSGi Blueprint 
(and Spring XML files, eg `<beans>`) to the modern Camel DSL.

### 9) New components

- `camel-aws2-step-functions`: Manage and invoke AWS Step functions
- `camel-azure-files`: Send and receive files on Azure File Storage
- `camel-dhis2`: Integrate with DHIS2 (health-level)
- `camel-observation`: Observability using Micrometer Observation
- `camel-opensearch`: Send requests to OpenSearch
- `camel-parquet-avro`: Parquet Avro serialization and de-serialization
- `camel-platform-http-main`: Platform HTTP for Camel Main runtime
- `camel-yaml-io`: YAML DSL route dumper
- `camel-zeebe`: Integration with Camunda Zeebe

### 10) Miscellaneous improvements

The Camel maven plugins has been made compatible with Apache Maven 4.

Camel 4 now requires JUnit 5 for unit tests, with the test components that have -junit5 as suffix.

If you work with XML or JSON payloads, then you can log the body in pretty format with:

    .log("${prettyBody}")

And in XML:

    <log message="${prettyBody}"/>

And in YAML:

    - log: "${prettyBody}"

We have added more _dev_console_s that provide insights into your running Camel application, which
can be used together with Camel JBang and also visible in the developer web console.

### Migrating to Camel 4

Support for OSGi (via Apache Karaf) and `camel-cdi` has been removed. 

Camel 4 is primary supporting Spring Boot, Quarkus, and standalone Camel with `camel-main`.
Other runtimes is not officially supported.

We have, of course, cleaned up the code base. For instance, we removed all the deprecated APIs and components. 

Some components that are not `jakarta` API compatible has been removed, until they have new releases,
that works with `jakarta` APIs. The removed components are listed in the migration guide.

We have also adjusted some APIs used to configure the `CamelContext` with custom settings.

In terms of backward compatibility, then Camel 4 is mostly compatible with regular Camel applications.

However, if you are using some of the more advanced features and other plugins in Camel, then migrating the code 
to the new version might be needed.

Additionally, custom components must be migrated and recompiled.

You can learn about all details can in the [migration guide](/manual/camel-4-migration-guide.html).

Good luck with your migration if you decide to continue your Camel journey. And for new users to Camel then good luck getting onboard.

### Roadmap for Camel 4 for remainger of 2023

We will continue working on Camel 4.x and do non-LTS releases, leading up to the next LTS release by end of this year.

The major goals for this year are to support Java 21, Spring Boot 3.2, and to catch up with newer Quarkus releases.

The following releases are currently scheduled (subject for change) for this year:

| Release | Date | Description |
|---------|------|-------------|
| 4.1     | Oct  | Non-LTS     |
| 4.2     | Dec  | LTS         |

An ongoing effort is also to keep stabilizing our CI builds, to ensure commits do not introduce regressions.
At this moment, the CI builds are occasionally have a few test errors that are related to flaky tests, that we keep fixing to 
ensure the CI reports are trustworthy.

Many people helped improve the Camel build and tests for high-end servers like Power and s390x during Camel 4's development. Users
and organizations building and leveraging Apache Camel on those platforms should have a smoother experience with Camel 4. This 
continues as an ongoing effort and we expect and even better experience for those platforms in subsequent releases.

We will continue to look for areas where we can improve the performance of Camel. At this point, we have identified that we can 
improve performance in the Camel type converter systems, and we plan to refactor for Camel 4.1 onwards.

And of course all the usual new features and improvements coming in from community users and contributors.

### Roadmap for Camel 3 releases

Our focus has shifted to primary work on Camel 4 onwards. We will continue to fix important bugs, CVEs and whatnot for the
supported LTS releases of Camel 3. The last Camel 3.x release is Camel 3.22 LTS that is planned for end of this year.
This means we will only do patch releases for Camel 3.22 LTS in 2024, and by end of 2024, then all of Camel 3 is EOL. 

The Camel 3.22 release will be a _small release_ with only limited new functionality.

Users are encourage to start new development, when possible, on Camel 4.
