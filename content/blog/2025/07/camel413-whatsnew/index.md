---
title: "Apache Camel 4.13 What's New"
date: 2025-07-08
draft: false
authors: [ davsclaus ]
categories: [ "Releases" ]
preview: "Details of what we have done in the Camel 4.13 release."
---

Apache Camel 4.13 has just been [released](/blog/2025/07/RELEASE-4.13.0/).

This release introduces a set of new features and noticeable improvements that we will cover in this blog post.

## Camel Core

We have made management possible for `BackOff`, `ForegroundTask`, and `BackgroundTask` which
are used as internal tasks to perform repetitive tasks, usually related to re-connection or recovery.
Some of the Came components uses these features, and other components has native recovery built-in from
the underlying library. However, those that uses these Camel tasks, is now exposed as JMX management,
and also provide more logging details during activity. All together it's easier to follow what is happening.

If possible Camel will now report file name:line-number of the source file in the `FailedToStartRouteException`
if a route threw an exception on startup.

## Camel JBang

Added `camel get internal-task` command to show state of internal tasks (see above).

### Camel Launcher

TODO:

## Rest DSL

Overall improved the request validator, for both the built-in and as well when using `camel-openapi-validator` component.
The latter will now also validate the request payload is valid according to the OpenAPI schema.

Added support for find-grained validation levels with `camel-openapi-validator`. 
For example, you can ignore query parameters:

```properties
camel.rest.validation-levels[validation.schema.required] = INFO
camel.rest.validation-levels[validation.request.parameter.query.missing] = IGNORE
camel.rest.validation-levels[validation.response.body.missing] = WARN
```

Added response validator which can be turned on via `clientResponseValidation=true`, which
makes Camel check what is being returned as response is valid according to the OpenAPI spec.

## YAML DSL

Removed support for using kebab-case in the DSL. So for example `set-body` should be migrated to `setBody` which
is the canonical syntax used in all the DSLs.

## Camel Kafka

TODO: Made TX easier

## Camel Spring Boot

`camel-spring-boot` is upgraded to the latest Spring Boot 3.5.3 release.

Removed deprecated `camel.springboot.xxx` auto configuration naming. Use `camel.main.xxx` instead.

## Miscellaneous

Upgraded many third-party dependencies to the latest releases at the time of release.

The `camel-nats` component now has support for using the Nats JetStreams feature.

## New Components

There are no new components.

## Upgrading

Make sure to read the [upgrade guide](/manual/camel-4x-upgrade-guide-4_13.html) if you are upgrading from a previous
Camel version.

If you are upgrading from, for example, 4.4 to 4.8, then make sure to follow the upgrade guides for each release
in-between, i.e.
4.4 -> 4.5, 4.5 -> 4.6, and so forth.

The Camel Upgrade Recipes tool can also be used to automate upgrading.
See more at: https://github.com/apache/camel-upgrade-recipes

## Release Notes

You can find additional information about this release in the list of resolved JIRA tickets:

- [Release notes 4.13](/releases/release-4.13.0/)

## Roadmap

The following 4.14 LTS release is planned for September 2025.

