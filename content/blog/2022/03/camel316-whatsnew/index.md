---
title: "Apache Camel 3.16 What's New"
date: 2022-03-28
authors: [davsclaus, opiske, essobedo]
categories: ["Releases"]
preview: Details of what we have done in the Camel 3.16 release.
---

Apache Camel 3.16 has just been [released](/blog/2022/03/RELEASE-3.16.0/).

This release introduces a set of new features and noticeable improvements that we will cover in this blog post.

### Resume from Offset

This release brings a new API to simplify consuming data at scale: the resume API V2. Please check the [blog post](/blog/2022/03/resume-api-v2/) we wrote to introduce it to our community.

### Load properties from valut/secrets cloud services

TODO:
https://camel.apache.org/blog/2022/03/secrets-properties-functions/

### Camel Main

We added base package scanning support when running a Camel Main application, that
makes it easier to auto-discover Camel routes, configuration classes, type converters,
and other classes using dependency injections.

A new `camel-test-main` module added to make it easier to unit test Camel Main based applications.

### Camel JBang

We continue to innovate and make running Camel quickly and easily with JBang better and better.
Now `camel-jbang` supports reloading `.properties` files in reload mode.

We also added support for loading `.java` source containing custom POJOs, processors,
or type-converters which can be reloaded. This allows users to modify the source code,
and let `camel-jbang` hot re-load changes.

The `camel-jbang` now also supports Camel K _modeline_ configurations, and other parts
from Camel K & Kamelets, that makes camel-jbang more on-par with Camel K and makes it possible to
run many more Camel K files out-of-the-box.

And we also made `camel-jbang` auto download DSLs, so for example It's possible to run a kotlin
source file and automatic download the needed `camel-kotlin-dsl` JAR.

A preliminary support for using dependency injection annotations from Spring, Quarkus, and CDI
has been added, which bridges the gap between camel-jbang and using Camel K, Camel Spring Boot,
or Camel Quarkus. The intention is to allow getting started with building Camel integrations
using `camel-jbang` / [Camel Karavan](https://github.com/apache/camel-karavan) and then
later transition to a regular Camel on Spring Boot or Quarkus project.
We will continue working on this story for upcoming releases.

See more details at the [Camel JBang documentation](/manual/camel-jbang.html)

### Camel UI Designer

The [Camel Karavan](https://github.com/apache/camel-karavan) project is progressing nicely, and during the development we have identified
a number of _mistakes_ in the route model in Camel that has been improved and corrected.

This overall makes it easier to build custom Camel tooling as there are less _model hacks_ you may need to
implement in the tool.

The changes to the model may affect users when upgrading, so make sure to read the [upgrade guide](/manual/camel-3x-upgrade-guide-3_16.html).

### Camel Health Checks

The `camel-health` has been overhauled to be made simpler to implement custom health-checks.

### Camel Route Templates

The XML, Spring XML, Java and YAML DSL now also support creating routes from route templates.

Assuming that you have a simple route template whose id is `someTemplate` with one template parameter `message`, according to the DSL of your choice, you can create a new route from this template as next:

In Java DSL
```java
templatedRoute("someTemplate")
    .parameter("message", "Hello Camel templated route!");
```

In Spring XML DSL
```xml
<camelContext>
    <templatedRoute routeTemplateRef="someTemplate">
        <parameter name="message" value="Hello Camel templated route!"/>
    </templatedRoute>
</camelContext>
```

In XML DSL
```xml
<templatedRoutes xmlns="http://camel.apache.org/schema/spring">
    <templatedRoute routeTemplateRef="someTemplate">
        <parameter name="message" value="Hello Camel templated route!"/>
    </templatedRoute>
</templatedRoutes>
```

In YAML DSL
```yaml
- templated-route:
    route-template-ref: "someTemplate"
    parameters:
      - name: "message"
        value: "Hello Camel templated route!"
```


### Component Headers

TODO: Work started on marking up all headers in every components for automatic documentation, and tooling support.

### Camel Kafka

TODO: 

We added specific health-checks for kafka producer and consumers that checks the kafka-client
internals if the connectivity with the kafka brokers is healthy or not.

We did other bug fixes, and we continue to make the camel-kafka component more robust. In this release we fixed offset management issues. Please check the release notes for details.

### Quarkus

The upcoming Camel Quarkus 2.8 release will be upgraded to Camel 3.16. 

### Spring Boot

We have upgraded to the latest Spring Boot 2.6 release.

Added more unit tests to various starter JARs to increase the QA of this project.

## Deprecated Components: Camel Testcontainers

In this release we are replacing the camel-testcontainers components with the camel-test-infra. These new set of test-related components simplify integration testing with Camel, allow us to test edge case scenarios more easily, reduce our maintenance effort and more. Please check the [blog post](/blog/2022/02/camel-test-infra/) where we explained about the changes.

## Upgrading

Make sure to read the [upgrade guide](/manual/camel-3x-upgrade-guide-3_16.html) if you are upgrading from a previous Camel version.

## Release Notes

You can find more information about this release in the with a list of JIRA tickets resolved in the release: 

- [release notes 3.16](/releases/release-3.16.0/)

