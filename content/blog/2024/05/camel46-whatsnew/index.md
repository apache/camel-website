---
title: "Apache Camel 4.6 What's New"
date: 2024-05-10
authors: [davsclaus]
categories: ["Releases"]
preview: Summary of what's new and improved in the Camel 4.6 release.
---

Apache Camel 4.6 has just been [released](/blog/2024/05/RELEASE-4.6.0/).

This release introduces a set of new features and noticeable improvements that we will cover in this blog post.

## Camel JBang

We fixed some issues using Camel JBang with Windows, but we would still like more feedback from Windows users.

Camel JBang is __primary__ intended to be Camel standalone only. However, we added
support for running with Spring Boot or Quarkus directly.

You use the `--runtime` option to specify which platform to use, as shown below:

    $ camel run foo.camel.yaml --runtime=spring-boot

And for Quarkus:

    $ camel run foo.camel.yaml --runtime=quarkus

There are several limitations, one would be that Spring Boot and Quarkus cannot automatically detect new components and download JARs.
(you can stop and run again to update dependencies).

You can now also configure logging levels per package name in `application.properties` as shown below:

    logging.level.org.apache.kafka = DEBUG
    logging.level.com.foo.something = TRACE

You can also do this using Quarkus _style_:

    quarkus.log.category."org.apache.kafka".level = DEBUG
    quarkus.log.category."com.foo.something".level = TRACE

And we also made it possible to define JDBC `DataSource` using Spring Boot _style_ directly in `application.properties` as follows:

    spring.datasource.url= jdbc:sqlserver://db.example.net:1433;databaseName=test_db
    spring.datasource.username=user
    spring.datasource.password=password
    spring.datasource.driverClassName=com.microsoft.sqlserver.jdbc.SQLServerDriver

## DSL

The XML and YAML DSL now have harmonized defining `beans` in both routes and kamelets to be the _same_ which
makes it possible to define beans using constructors, properties, builders, factory beans, scripts and much more, all in the same way.

Added `setVariables` EIP to make it possible to set multiple variables from a single EIP.

## Rest DSL with contract first 

The Rest DSL has been improved with a _contract first_ approach using vanilla OpenAPI specification.

The _contract first_ approach requires you to have an existing OpenAPI v3 specification file.
This contract is a standard OpenAPI contract, and you can use any existing API design tool to build such contracts.

This makes it super easy to define Rest DSL in Camel from an existing OpenAPI specification file, all you do
is to declare this small piece of Rest DSL code:

For example in Java DSL:

    public void configure() throws Exception {
        rest().openApi("petstore-v3.json");
    }

The `petstore-v3.json` is the OpenAPI specification file, and Camel will automatically parse and map each API endpoint
to a Camel route with the `direct:operationId` convention.

During development of these API endpoints in Camel you can tell Camel to ignore missing routes, so you can build, run, and test
this one API at a time. 

Here is an example for Camel Spring Boot: https://github.com/apache/camel-spring-boot-examples/tree/main/openapi-contract-first
And here is an example for YAML DSL with JBang: https://github.com/apache/camel-kamelets-examples/tree/main/jbang/open-api-contract-first

## Miscellaneous

Upgraded many third-party dependencies to the latest releases at the time of release.

The `camel-azure-eventbus` component has been refactored to use high-level client which is more robust and
have better failover and reconnection support.

The `camel-sql` component can now use variables in the SQL queries.

The `camel-kafka` component is upgraded to Kafka 3.7 client. Added `JMSDeserializer` to `camel-kafka` that users can use to
let Kafka handle serializing/de-serializing JMS headers correct by their expected types (long, int, string etc.)

The `camel-rest-openapi` - Refactored to use another json validator library that is Jakarta EE compatible.

The Rest DSL `clientRequestValidation` now supports validating for allowed values as well.

The `@PropertyInject` can inject as an array/list type where the string value is splitted by a separator (such as a comma)

Camel Spring Boot has been upgraded to Spring Boot 3.2.5.

## New Components

This release only brings two new components:  

- `camel-google-pubsub-lite` - Send and receive messages to/from Google Cloud Platform PubSub Lite Service.
- `camel-pinecone` - Perform operations on the Pinecone Vector Database.

## Upgrading

Make sure to read the [upgrade guide](/manual/camel-4x-upgrade-guide-4_6.html) if you are upgrading from a previous Camel version.

If you are upgrading from, for example, 4.0 to 4.4, then make sure to follow the upgrade guides for each release in-between, i.e.
4.0 -> 4.1, 4.1 -> 4.2, and so forth.

## Release Notes

You can find more information about this release in the list of JIRA tickets resolved in the release:

- [Release notes 4.6](/releases/release-4.6.0/)

## Roadmap

The following 4.7 release (non LTS) is planned to upgrade to Spring Boot 3.3, and to be released in July.

