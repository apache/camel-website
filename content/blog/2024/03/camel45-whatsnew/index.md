---
title: "Apache Camel 4.5 What's New"
date: 2024-03-28
authors: [davsclaus]
categories: ["Releases"]
preview: Details of what we have done in the Camel 4.5 release.
---

Apache Camel 4.5 has just been [released](/blog/2024/03/RELEASE-4.5.0/).

This release introduces a set of new features and noticeable improvements that we will cover in this blog post.

## Camel Core

When using Kamelets and/or Rest DSL then Camel will now hide their intermediate routes and only show user routes.
The number of routes that Camel logs on startup is thus only the number of _user_ routes. This also avoids cluttering
up the list of routes in monitoring and management tools.

## Camel Main

We added the concept of _profile_ to running Camel standalone or via camel-jbang. For example camel-jbang runs in `dev` profile
by default, and `camel-main` would run in `prod` profile by default. 

Using profiles allows you to have profile-specific _application.properties_ files, such as `application-dev.properties`
that can provide environment-specific configuration, for example hostname, username and passwords for connecting to systems.
To make it quick and easy to have settings for development, and then avoid having to remove those when building for UAT or production.

## Camel JBang

We fixed some issues using Camel JBang with Windows, but we would still like more feedback from Windows users.

Added `/q/info` as HTTP console to show some basic information about the Camel application. 

## Camel Catalog

We now generate more metadata for every Camel release and have added the following information into `camel-catalog`,
that can be useful for Camel tooling such as Karavan and Kaoto:

- `dev-consoles` - Provides a list of all available developer consoles
- `transformers` - Provides a list of all cloud event transformers (Camel K pipes)
- `beans` - Provides a list of all miscellaneous beans such as `AggregationRepository`, `IdempotentRepository` and all the options. (For example to know that Camel offers a Redis idempotent repository).

## Camel Micrometer

Added _context_ level metrics as well, so you have combined metrics for the entire Camel application.

Adjusted the tags in the metrics to be shorter. See the [upgrade guide](/manual/camel-4x-upgrade-guide-4_5.html) for more details.

## OpenAPI v2

Support for OpenAPI v2 (swagger) has been removed. Use OpenAPI v3 spec instead.
You can use online coverter tools such as: https://converter.swagger.io/

## Miscellaneous

The `camel-spring-rabbitmq` can now automatically bind and create if setting `autoDeclareProducer=true` for the producers as well.

The `camel-yaml-dsl` can now set error handler on the route level as well. Previously you had to do this via route configuration.

The `camel-kafka` has been upgraded to Kafka Client 3.7.

The documentation has many grammar, typo and cosmetic changes.

Upgraded many third-party dependencies to the latest releases at the time of release.

## New Components

We have added some new AI based components and support for wasm and jolokia.  

- `camel-aws-bedrock` - Invoke Model of AWS Bedrock service.
- `camel-aws-bedrock-agent` - Operate on AWS Bedrock through its Agent.
- `camel-aws-bedrock-agent-runtime` - Invoke Model of AWS Bedrock Agent Runtime service.
- `camel-langchain-chat` - LangChain4j Chat component
- `camel-langchain-embeddings` - LangChain4j Embeddings
- `camel-milvus` - Perform operations on the Milvus Vector Database.
- `camel-qdrant` - Perform operations on the Qdrant Vector Database.
- `camel-wasm` - Call a wasm (web assembly) function.
- `camel-platform-http-jolokia` - Jolokia plugin for standalone Camel HTTP Platform

## Upgrading

Make sure to read the [upgrade guide](/manual/camel-4x-upgrade-guide-4_5.html) if you are upgrading from a previous Camel version.

If you are upgrading from, for example, 4.0 to 4.4, then make sure to follow the upgrade guides for each release in-between, i.e.
4.0 -> 4.1, 4.1 -> 4.2, and so forth.

## Release Notes

You can find more information about this release in the list of JIRA tickets resolved in the release:

- [Release notes 4.5](/releases/release-4.5.0/)

## Roadmap

The following 4.6 release (non LTS) is planned for May 2024.

