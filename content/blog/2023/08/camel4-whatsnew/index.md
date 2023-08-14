---
title: "Apache Camel 4 What's New (top 10)"
date: 2023-08-15
authors: [davsclaus,gzurowski]
categories: ["Releases"]
preview: Top 10 of what's new in Apache Camel version 4
---

TODO: Something about Camel v4 just released

This blog post highlights some noteworthy new features and improvements in Camel v4.

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

TODO: Stuff that Otavio worked on

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

TODO: jbang stuff

### 8) XML with beans

We have been working on to unify the YAML, XML and Java DSL to be more aligned in feature parity related
to configuring beans. For example in XML DSL (`camel-xml-io`) you can now declare beans and Camel routes in
the same XML file with `<camel>` as the root tag:

```xml
<camel> 
    <beans>
        <bean id="messageString" class="java.lang.String">
            <constructor-arg index="0" value="Hello"/>
        </bean>

        <bean id="greeter" class="org.apache.camel.main.app.Greeter">
            <description>Spring Bean</description>
            <property name="message">
                <bean class="org.apache.camel.main.app.GreeterMessage">
                    <property name="msg" ref="messageString"/>
                </bean>
            </property>
        </bean>
    </beans>

    <route id="my-route">
        <from uri="direct:start"/>
        <bean ref="greeter"/>
        <to uri="mock:finish"/>
    </route>

</camel>
```

Then Camel handles the dependency injection, among the `<beans>`. 

You can also plugin Spring dependency injection, if you declare the beans to use spring namespace and include necessary Spring JARs.

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


