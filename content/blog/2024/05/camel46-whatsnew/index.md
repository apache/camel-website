---
title: "Apache Camel 4.6 What's New"
date: 2024-05-10
authors: [davsclaus]
categories: ["Releases"]
preview: Summary of what's new and improved in the Camel 4.6 release.
---

Apache Camel 4.6 has just been [released](/blog/2024/05/RELEASE-4.6.0/).

This release introduces a set of new features and noticeable improvements that we will cover in this blog post.

## Camel Core

TODO:

## Camel Main

TODO:

## Camel JBang

We fixed some issues using Camel JBang with Windows, but we would still like more feedback from Windows users.

TODO: Run with runtime
TODO: logging level in application.properties
TODO: datasource spring-boot style


## DSL

The XML and YAML DSL now have harmonized defining `beans` in both routes and kamelets to be the _same_ which
makes it possible to define beans using constructors, properties, builders, factory beans, scripts and much more, all in the same way.

Added `setVariables` EIP to make it possible to set multiple variables from a single EIP.

## Rest DSL with contract first 

TODO:

## Miscellaneous

Upgraded many third-party dependencies to the latest releases at the time of release.

The `camel-azure-eventbus` component has been refactored to use high-level client which is more robust and
have better failover and reconnection support.

The `camel-sql` component can now use variables in the SQL queries.

The `camel-kafka` component is upgraded to Kafka 3.7 client. Added `JMSDeserializer` to `camel-kafka` that users can use to
let Kafka handle serializing/de-serializing JMS headers correct by their expected types (long, int, string etc.)

The Rest DSL `clientRequestValidation` now supports validating for allowed values as well.

The `@PropertyInject` can inject as an array/list type where the string value is splitted by a separator (such as a comma)

Camel Spring Boot has been upgraded to Spring Boot 3.2.5.


## New Components

This release only brings two new components:  

- `camel-google-pubsub-lite` - Send and receive messages to/from Google Cloud Platform PubSub Lite Service.
- `camel-pinecone` - Perform operations on the Pinecone Vector Database.
- `camel-rest-openapi` - Refactored to use another json validator library that is Jakarta EE compatible.

## Upgrading

Make sure to read the [upgrade guide](/manual/camel-4x-upgrade-guide-4_6.html) if you are upgrading from a previous Camel version.

If you are upgrading from, for example, 4.0 to 4.4, then make sure to follow the upgrade guides for each release in-between, i.e.
4.0 -> 4.1, 4.1 -> 4.2, and so forth.

## Release Notes

You can find more information about this release in the list of JIRA tickets resolved in the release:

- [Release notes 4.6](/releases/release-4.6.0/)

## Roadmap

The following 4.7 release (non LTS) is planned to upgrade to Spring Boot 3.3, and to be released in July.

