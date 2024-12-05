---
title: "Apache Camel 4.9 What's New"
date: 2024-12-05
authors: [davsclaus,squakez,tadayosi]
categories: ["Releases"]
preview: Details of what we have done in the Camel 4.9 release.
---

Apache Camel 4.9 has just been [released](/blog/2024/12/RELEASE-4.9.0/).

This release introduces a set of new features and noticeable improvements that we will cover in this blog post.

## Camel Core

Added _startup condition_ feature to let Camel perform some checks on startup,
before continuing. For example to check if a specific ENV exists, or wait
for a specific file to be created etc.

The supervised route controller now emits `RouteRestartingEvent` when routes are attempted to be
started again after a previous failure. This allows to have _fined grained_ events for what happens.

Added a _trust all certificate_ option for Camel SSL. To make it quick
to use HTTPS but without having a valid certificate. Only use this for development purposes.

The route dumper to XML and YAML no longer includes nodes with default values in the output.

### DSL

You can now globally configure data formats in XML and YAML DSL also, which makes it easier to
set up your data formats once, and reuse these within all your routes by referring to their ids.

### Camel Test

We have made it easier to use fluent builders with mock endpoints to set expectations using Camel languages such as
JSonPath, JQ, XPath, Simple, etc.  See `camel-mock` documentation for more details.

## Camel JBang

When showing _help_ (such as `camel get route --help`) then all the default values is now shown in the help text.

We have continued improving and bug fixing Camel JBang. For example the `camel export` functionality
can now handle more situations out of the box, and in case you have compilation errors and still want
to export, you can use the `--ignore-loading-error`.

When exporting to Spring Boot or Camel Main, then docker files are included, which makes it ready
to build runnable container images easily. This was already supported for Quarkus.

When running in dev mode (`camel run --dev *`) then any re-load errors is now also visible when using `camel get` command.
This allows to see the error, such as if you use `camel get --watch` to show updating list of running Camel integrations.
The error is of course always in the running integration log as well (which `camel log` can also show).

The `camel version list` now also includes all the old releases going all the way back to Camel 1.0 from 2007.

The `camel get properties` can now show property placeholder values with default vs actual value, such
as when values are applied from ENV variables. This makes it possible to better track how a value was configured.

The new `camel cmd receive` command can be used to consume messages from external systems. For example
if you work on a Camel prototype to send messages to Kafka, you can from another shell, run the `camel receive` command
to let it consume messages from Kafka, which allows you to see those messages that was sent to Kafka.

There is also the `camel cmd browse` command that makes it possible to only peak queues on systems, whichout
consuming the messages. However, this only works for a limited set of components such as JMS and file/ftp.

And we also added a new `camel shell` command that allows to run Camel JBang in an interactive shell,
(in REPL mode), so you can quickly execute Camel JBang commands.

### Camel JBang Kubernetes

We have done many improvements and bug fixes to make `camel kubernetes` work good on Kubernetes.
You can now run (also in `--dev` mode) and deploy as well for all 3 runtimes: main, spring-boot, and quarkus.

You can now also run `camel kubernetes` using k3s by setting `--cluster-type=k3s`.

The `camel-kubernets` is no longer dependent on Camel K.

## Camel Open Telemetry

We have fixed issues in relation to leaking spans when routing.
There is still some challenges related to MDC, and we continue to work on this for upcoming releases.

## Camel Observability Services

One of the main challenges of running a Microservices Oriented Architecture on cloud is to monitor how the different services deployed are interacting together. During the last years we have worked to introduce several components that cover the **Observability** stack. However all the different components contributing to the observability services had to be configured each of them separately. Even worse, each of the different runtimes we support in Camel (Main, Quarkus, Spring Boot) had its own configuration and its own endpoints.

The new component we're introducing in this release, `camel-observability-services` has the goal to uniform and harmonize the configuration and to provide a set of default configuration that are the same regardless the runtime of choice. This is going to be particularly handy when you need to manage Camel on the cloud, providing a set of opinionated tools with default settings. So far, when you are using this component, you're going to use these components out of the box:

* `camel-health`
* `camel-management`
* `camel-micrometer-prometheus`
* `camel-opentelemetry`

Read the manual to get more information about [how to do observability with Camel](xref:components::observability-services.adoc).

NOTE: the component will require an extension and will be available on Quarkus runtime with the first release of Camel Quarkus supporting 4.9.0 which should be done some week after this core release.

## Camel Groovy

We have aligned the syntax to use same naming pattern as the simple language, which makes it easier
to use both languages with Camel. This means you can refer to exchange, headers, variables in the same way.

Added `log` function to make it easy to write to log from within a groovy script.

For low-code users that favour using Groovy then we made it possible to use the Log EIP with groovy instead of simple.
You can configure this with `camel.main.logLanguage = groovy`.

The Log EIP now formats the `${exchange}` output using the standard exchange formatter, which makes
it easier to see the content of the current `Exchange`.

## Camel JMS

The JMS component will now default filter out `CamelXXX` headers as done by other Camel components.

## Camel HTTP

The `camel-http` component now supports caching and refreshing OAuth2 tokens.

## Security Vaults

In the `camel-kubernetes` you can now let Camel be auto-reloaded on configmap updates, just as it was possible with secret updates.

In Camel Spring Boot you can use security vaults to store configuration values, which now can also be used in Spring configurations
such as `spring.datasource.password = {{aws:myDatabasePassword}}`

## Camel Kamelets

We have moved `kamelets-utils` from Camel Kamelets to Camel Core project (inside `camel-kamelets`) to make it easier to maintain,
and also because Kamelets are first-class everywhere with Camel.

You can now configure kamelets with ENV variables using a more human ready for lang parameters.

The option `bucketNameOrArn` can now be configured using both of the following styles:

```properties
CAMEL_KAMELET_AWS_S3_SOURCE_BUCKETNAMEORARN = myBucket
CAMEL_KAMELET_AWS_S3_SOURCE_BUCKET_NAME_OR_ARN = myBucket
```

This actually applies to all the Camel configuration you can (not only for Kamelets).

## Camel JAXB

We have optimized `camel-jaxb` to include a cache on `ObjectFactory` that makes this faster when using JAXB
for type converters.

## Camel AMQP

You can now more easily configure SSL/TLS configurations on the `camel-amqp` component.

## Camel Spring Boot

The `camel-spring-boot` is upgraded to latest Spring Boot 3.4.0 release.

### Camel Spring Boot Platform HTTP

Camel Platform HTTP Starter component now implements all the Camel REST Configurations features, moreover, REST service's best practices are implemented in the component itself. This may cause some issues, if you are facing HTTP errors when upgrading to 4.9 they may be caused by the following features:

* Produces/Consumes enforce, if you are using something like `rest().consumes("application/json")`, the client has to provide the `Content-Type` header with value `application/json`, in the past, this check was not enforced.
* Attachments (application/octet-stream) are now handled, and they can be found in the Exchange Message Attachments.
* Streaming Requests and Responses are implemented as expected, Camel Platform HTTP Starter now handles hughe files streaming, this way, OutOfMemory Errors are not faced anymore.
* HTML Forms can now be POSTED as expected.

## Miscellaneous

Upgraded many third-party dependencies to the latest releases at the time of release.

## New Components

We have added a few new components:

- `camel-clickup` - Receives events from ClickUp
- `camel-flowable` - Send and receive messages from the Flowable BPMN and CMMN engines.
- `camel-fury` - Serialize and deserialize messages using Apache Fury
- `camel-observability-services` - Opinionated observability for Camel on cloud
- `camel-smooks` - Added smooks also as a data format
- `camel-torchserve` - Provide access to PyTorch TorchServe servers to run inference with PyTorch models remotely
- `camel-jolokia-starter` - To make using Jolokia easy with Camel Spring Boot

## Upgrading

Make sure to read the [upgrade guide](/manual/camel-4x-upgrade-guide-4_9.html) if you are upgrading from a previous Camel version.

If you are upgrading from, for example, 4.4 to 4.8, then make sure to follow the upgrade guides for each release in-between, i.e.
4.4 -> 4.5, 4.5 -> 4.6, and so forth.

The Camel Upgrade Recipes tool can also be used to automate upgrading.
See more at: https://github.com/apache/camel-upgrade-recipes

## Release Notes

You can find more information about this release in the list of JIRA tickets resolved in the release:

- [Release notes 4.9](/releases/release-4.9.0/)

## Roadmap

The following 4.10 release is planned for Feb 2025.

