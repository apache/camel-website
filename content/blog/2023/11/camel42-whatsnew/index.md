---
title: "Apache Camel 4.2 What's New"
date: 2023-11-15
authors: [davsclaus]
categories: ["Releases"]
preview: Details of what we have done in the Camel 4.2 release.
---

Apache Camel 4.2 (non LTS) has just been [released](/blog/2023/11/RELEASE-4.2.0/).

This release introduces a set of new features and noticeable improvements that we will cover in this blog post.

## Java 21

This is the first release that officially supports running on Java 21.

## Camel Core

TODO: performance and type converter stuff

The Java DSL now supports String text-blocks when defining Camel URIs, as shown:

```
from("""debezium-postgres:customerEvents
        ?databasePassword={{myPassword}}
        &databaseDbname=myDB
        &databaseHostname=myHost
        &pollIntervalMs=2000
        &queryFetchSize=100""")
    .to("kafka:cheese");
```

You can now use a bean method call with property placeholders.

For example a bean can be used to return the name for a topic to use in a Kafka route:

```
from("kafka:{{bean:myBean.computeTopic}}")
  .to("bean:cheese")
```

In this example Camel will invoke the method `computeTopic` on the bean with id `myBean` when the route is created.

## Camel Main

You can now configure the following in `application.properties`:

- global SSL options using `camel.ssl.`
- Camel route debugger options using `camel.debug.`
- Camel Open Telemetry options using `camel.opentelemetry.`

## DSL

The kebab-case syntax in YAML DSL has been deprecated and Camel will now report a WARN if detected.
You should use Camel Case of course ;) For example `set-header` should be `setHeader`.

## Camel JBang (Camel CLI)

TODO: debug command
TODO: other stuff

## Spring and Spring Boot

Upgraded to latest 3.1.5 release.

Added support for Spring beans using `@Primary` for auto-wiring. This allows Camel to use the primary bean when there are multiple
bean instance for the same Java type (such as database connection's).

## Rest DSL

You can now use wildcards (`*`) in Rest DSL to handle a wider range of requests from the same API service:

```
rest("myapi")
  .get("user/*")
  .to("direct:userStuff")
```

This will then let Camel service all HTTP GET requests that starts with `myapi/user/` such as `myapi/user/123`, `myapi/user/123/account/zip`, etc.

## Miscellaneous

The `camel-azure` can now send binary files to Azure Service Bus,

The `camel-micrometer` can be configured in backwards (Camel 3.20 or older) naming mode. This allows to keep using old naming style,
that monitoring systems have been pre-configured to use.

The `camel-platform-http-vertx` now supports streaming big HTTP payloads directly if `useStreaming=true` has been set.

The `camel-dynamic-router` component has been refactored to use Camel's `MulticastProcessor` as its engine instead of custom processor.

## New Components

- `camel-azure-schema-registry` - Azure Schema Registry Component for utilities to deal with authentication.
- `camel-smb` - Receive files from SMB (Server Message Block) shares.

## Upgrading

Make sure to read the [upgrade guide](/manual/camel-4x-upgrade-guide-4_2.html) if you are upgrading from a previous Camel version.

## Release Notes

You can find more information about this release in the list of JIRA tickets resolved in the release:

- [Release notes 4.2](/releases/release-4.2.0/)

## Roadmap

The following 4.3 release is planned to support Spring Boot 3.2.

This release is likely to be the next LTS release in January 2024. But we may release it as a non-LTS
release in December and then let Camel 4.4 be the LTS release for January 2024.

