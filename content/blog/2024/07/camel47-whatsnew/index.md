---
title: "Apache Camel 4.7 What's New"
date: 2024-07-15
authors: [davsclaus,gzurowski,orpiske,tadayosi]
categories: ["Releases"]
preview: Details of what we have done in the Camel 4.7 release.
---

Apache Camel 4.7 has just been [released](/blog/2024/07/RELEASE-4.7.0/).

This release introduces a set of new features and noticeable improvements that we will cover in this blog post.

## Camel Core

The _route template_ has some fixes and improvements, such as that a full local copy
of the template is created when creating routes from the template; this prevents _unforeseen side effects_
when the same template is used later to create new routes.

Cleaned up the collection of type convertion statistics, reducing the need for runtime checks and simplifying 
the code.

## Camel Management

Added _remote_ performance counters to `CamelContext` and `Routes` which counts only
messages that are received from an endpoint that is _remote_. In other words internal endpoints
such as timers, cron, seda etc. are not being counted. This makes it quicker and easier
to know how many messages Camel has processed received from external systems.

For example suppose you have a small Camel integration with 2 routes: (timer and kafka).
The timer is triggering every second, and kafka is _remote_ and thus will only trigger when a message is received from Kafka.

If you use `camel-jbang` you can easily see this information as follows:

```bash
$ camel get
  PID   NAME    CAMEL  PLATFORM        PROFILE  READY  STATUS   RELOAD  AGE   ROUTE  MSG/S  TOTAL  FAIL  INFLIGHT  LAST  DELTA  SINCE-LAST
 42240  cheese  4.7.0  JBang v0.116.0  dev       1/1   Running       0  1m8s    2/2   1.01   1/65   0/0       0/0     0     -1     1s/1s/-
```

Here the _TOTAL_, _FAIL_, _INFLIGHT_ columns have been updated to show two numbers separated by slash.
The number `1/65` means that there has been only 1 remote message, and 65 in total, so that means the internal timer has triggered 64 times.

## Camel JBang

Many bug fixes and improvements to make the overall use of this great tool much better.

The `camel get bean` command shows your custom _beans_ from YAML and XML DSLs which makes
it easy to see their configuration vs runtime properties, to ensure they are configured correctly.

For example given the bean in the YAML DSL:

```yaml
- beans:
    - name: DemoDatabase
      type: "#class:org.apache.commons.dbcp2.BasicDataSource"
      properties:
        driverClassName: org.postgresql.Driver
        username: "{{env:DEMO_DATASOURCE_USERNAME:scott}}"
        password: "{{env:DEMO_DATASOURCE_PASSWORD:tiger}}"
        url: "{{env:DEMO_DATASOURCE_URL:postgresql://localhost:5432}}"
```

Then `camel get bean --dsl` will output the beans with columns showing the configuration vs runtime value as follows:

```bash
$ camel get bean --dsl
BEAN: DemoDatabase (#class:org.apache.commons.dbcp2.BasicDataSource):
---------------------------------------------------------------------
 PROPERTY         TYPE              CONFIGURATION                                            VALUE
 password         java.lang.String  {{env:DEMO_DATASOURCE_PASSWORD:tiger}}                   tiger
 driverClassName  java.lang.String  org.postgresql.Driver                                    org.postgresql.Driver
 url              java.lang.String  {{env:DEMO_DATASOURCE_URL:postgresql://localhost:5432}}  postgresql://localhost:5432
 username         java.lang.String  {{env:DEMO_DATASOURCE_USERNAME:scott}}                   mySpecialUser
```

Here we can learn that the password and url are using their default configured values.
However, the username is `mySpecialUser` which is not the default value, and hence must be from the environment variable.

Added `camel get rest` command to easily see all your rest endpoint and operations hosted in your Camel integrations.

The `camel generate` command has been moved into its own plugin, which must be installed first to be usable.

## Camel Tracing

Added more trace decorators for more components. This gives more components specific metadata
in the trace spans.

Camel now also includes more fine-grained service and protocol details in traces and in general for components that connects to remote systems.
For example connecting to databases and messaging systems, often requires using database drivers, connection pools, and other means, which
are configured _outside_ Apache Camel. And as such Camel may not be able to display the actual host:port that is used for the connection.

We have made an effort to let Camel detect this and attempt to gather such details for a set of known connection pools, database drivers, cloud providers, etc.

And our beloved Camel JBang is able to easily show this information. For example running the Camel 1.0 example (17 years old) using ActiveMQ JMS broker will now present it as follows:

```bash
$ camel get route
  PID   NAME            ID      FROM                     REMOTE  STATUS   AGE  COVER  MSG/S  TOTAL  FAIL  INFLIGHT  MEAN  MIN  MAX  LAST  DELTA  SINCE-LAST
 75937  MyRouteBuilder  route1  activemq://test.MyQueue    x     Started  20s    0/1   0.00      0     0         0          0    0                    -/-/-
 75937  MyRouteBuilder  route2  file://test                x     Started  20s    0/1   0.00      0     0         0          0    0                    -/-/-
```

In the output above, we can see there are 2 routes, and that the first route is using the ActiveMQ component. However, we can not see the location of the broker
but only that it's using the queue named `test.MyQueue`.

In this new Camel 4.7 release, you can now execute the following command:

```bash
$ camel get service
  PID   NAME            COMPONENT  DIR  ROUTE   PROTOCOL  SERVICE                           TOTAL  ENDPOINT
 75937  MyRouteBuilder  activemq   in   route1  jms       failover://tcp://localhost:61616      0  activemq://test.MyQueue
```

And as you can see from the output above, the `camel get service` shows what hostname and port is in use. In this example we run a local broker using Docker
and hence why its `localhost:61616`. You can also see the direction from Camel point of view, meaning that Camel is receiving messages from the broker.
If Camel is also sending messages to the broker, then the command will show more lines with direction out.

And the `camel trace` command has also been enhanced to show this information when available.

## Camel Tests

We have started a multi-release effort to cleanup the base class used for testing. In this release
we introduced a new set of classes for configuring test behavior, marked several APIs as deprecated, 
split some of the responsibilities of the `CamelTestSupport` class. This change aims to make the 
testing code more aligned with JUnit 5 features and provide a simpler interface for the users.

## Miscellaneous

The `camel-as2` has been made more robust and better support for using compression.

Added `substring`, `replace` and `fromRouteId` functions to the simple language.

When using custom beans in YAML and XML DSL then constructor parameters now support
to lookup others beans.

We have fixes older reported bugs, and at this time of writing there are 8 known in JIRA.

We have also fixed and made our CI based test suite more stable and only have a few flaky tests
from time to time, across 4 different OS platforms.

Upgraded many third-party dependencies to the latest releases at the time of release.

Upgraded several containers used to test Camel.

The `camel-spring-boot` is upgraded to latest Spring Boot 3.3.1 release.

The `camel-djl` now supports a more comprehensive set of machine learning applications as follows and is ready for a wider variety of machine learning use cases:
- `cv/image_classification`
- `cv/object_detection`
- `cv/semantic_segmentation`
- `cv/instance_segmentation`
- `cv/pose_estimation`
- `cv/action_recognition`
- `cv/word_recognition`
- `cv/image_generation`
- `cv/image_enhancement`
- `nlp/fill_mask`
- `nlp/question_answer`
- `nlp/text_classification`
- `nlp/sentiment_analysis`
- `nlp/token_classification`
- `nlp/word_embedding`
- `nlp/text_generation`
- `nlp/machine_translation`
- `nlp/multiple_choice`
- `nlp/text_embedding`
- `audio`
- `timeseries/forecasting`

## New Components

We have added a few new components:  

- `camel-activemq6` - JMS component that are preset for ActiveMQ 6.x
- `camel-smooks` -  EDI, XML, CSV, etc. based data transformation using Smooks
- `camel-openapi-validator` - OpenAPI validator for Camel Rest DSL (using Atlassian Validator Client)

## Upgrading

Make sure to read the [upgrade guide](/manual/camel-4x-upgrade-guide-4_7.html) if you are upgrading from a previous Camel version.

If you are upgrading from, for example, 4.4 to 4.7, then make sure to follow the upgrade guides for each release in-between, i.e.
4.4 -> 4.5, 4.5 -> 4.6, and so forth.

## Release Notes

You can find more information about this release in the list of JIRA tickets resolved in the release:

- [Release notes 4.7](/releases/release-4.7.0/)

## Roadmap

The following 4.8 release (LTS) is planned for Sep 2024.

