---
title: "Apache Camel 4.12 What's New"
date: 2025-05-30
draft: false
authors: [ davsclaus,squakez,gzurowski ]
categories: [ "Releases" ]
preview: "Details of what we have done in the Camel 4.12 release."
---

Apache Camel 4.12 has just been [released](/blog/2025/05/RELEASE-4.12.0/).

This release introduces a set of new features and noticeable improvements that we will cover in this blog post.

## Camel Core

The `camel-xml-io` XML DSL now has a generated XSD Schema that is independent from the classic Camel Spring XSD.
This allows tooling and end users to use this schema instead and ensure the schema matches exactly the capabilities
of the `camel-ml-io` XML DSL.

The schema is published online at: https://camel.apache.org/schema/xml-io

## Camel Main - Management Port

Camel Quarkus and Spring Boot runtimes allow a dedicated management port (instead of reusing the regular HTTP service port).
We have introduced the same feature for `camel-main` runtime.

You can use a management server where to expose management endpoints (such as health, metrics, etc.).
The new server will be available by default on port `9876`. This and several other configurations can be changed using
`camel.management` application properties group. In order to avoid breaking compatibility, the previous services running
on business port (default `8080`) will be still running on the old port AND on the new port for a few future releases.
However, you're invited to move your configuration and adopt the new `camel.management` embedded server for management
services as soon as possible.

### Camel Observability Services - Management Port

As we have made this feature available across all the runtimes, we're using a management port (`9876`) to expose the
observability services. This is an enhancement for security purposes and to allow any tool to be able to use a
management port where available without affecting the availability of the regular services exposed by the application.

## Camel JBang

Many smaller bug fixes and improvements to camel-jbang.

The `export` command now has a `--verbose` option that shows exporting activity which makes trouble shooting much easier.

Made the `camel get` and `camel ps` outputs a bit easier to understand by removing the remote counters. Use `--remote` to see these counters.

The route dumper to YAML is now tooling friendly (such as Camel Karavan and Kaoto) so these tools can load the dumped YAML.

The `camel cmd send` command now sends the message without the need for any existing running Camel integration.
To use any existing integration then specify the integration name or PID.

Improved the `camel edit` command to include Camel coding assistance (Camel LSP) so having a quick tool to quickly edit
Camel routes (All DSL supported). 

The `camel shell` now supports extra commands installed via plugins.

The `camel run` now also supports `--port` for Spring Boot and Quarkus runtimes (main already supported),
so you can run multiple instances without having port clashes.


## Camel HTTP

The `camel-http` can now easily handle file uploads as Multipart using `multipartUpload=true` option.

Added support for OAuth Bearer Token authentication.

## Camel Spring Cloud Config

The Spring Cloud Config component provides integration between Apache Camel and Spring Cloud Config,
allowing applications to retrieve configuration properties from a centralized Spring Cloud Config Server.
This component includes a Properties Function implementation that allows Apache Camel to resolve property placeholders
directly from Spring Cloud Config.

## Camel Spring Boot

`camel-spring-boot` is upgraded to the latest Spring Boot 3.5.0 release.

## Miscellaneous

Upgraded many third-party dependencies to the latest releases at the time of release.

The `camel-as2` has been upgraded to newer AS2 library and some internal bug fixes and improvements.

The `camel-aws-s3` component can now using `moveAfterRead` move the processed file into a sub-folder of the same bucket.

The `camel-smb` component has been changed to use similar URI syntax as other file based components, by declaring the path
directly in the context-path and not as a query parameter.

Fixed some bugs in `camel-kafka` in relation to partition balancing.

The `camel-xslt` component now supports taking the input directly from header or variable to make it easier to do transformations
without having to prepare data in the message body before invoking the xslt component.

We have fixed testing using _advice_with_ and Rest DSL with inlined routes. Previously you would have to turn off inlining to make _advice_with_ work.

## New Components

We have added a few new components:

- `camel-dapr` - Dapr component which interfaces with Dapr Building Blocks.
- `camel-jandex` - Custom class and resource loader using jandex.idx
- `camel-oauth` - Camel OAuth (Work in progress)
- `camel-pqc` - Post Quantum Cryptography Signature and Verification component.
- `camel-spring-cloud-config` - Spring Vault support
- `camel-weaviate` - Perform operations on the Weaviate Vector Database.

## Upgrading

Make sure to read the [upgrade guide](/manual/camel-4x-upgrade-guide-4_12.html) if you are upgrading from a previous
Camel version.

If you are upgrading from, for example, 4.4 to 4.8, then make sure to follow the upgrade guides for each release
in-between, i.e.
4.4 -> 4.5, 4.5 -> 4.6, and so forth.

The Camel Upgrade Recipes tool can also be used to automate upgrading.
See more at: https://github.com/apache/camel-upgrade-recipes

## Release Notes

You can find additional information about this release in the list of resolved JIRA tickets:

- [Release notes 4.12](/releases/release-4.12.0/)

## Roadmap

The following 4.13 release is planned for July 2025.

