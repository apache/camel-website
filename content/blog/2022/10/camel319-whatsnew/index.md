---
title: "Apache Camel 3.19 What's New"
date: 2022-10-10
authors: [davsclaus,gzurowski,essobedo,oscerd]
categories: ["Releases"]
preview: Details of what we have done in the Camel 3.19 release.
---

Apache Camel 3.19 has just been [released](/blog/2022/10/RELEASE-3.19.0/).

This release introduces a set of new features and noticeable improvements that we will cover in this blog post.

## Camel JBang (Camel CLI)

In this release we continue the expansion of Camel CLI.

You can now easily manage local running Camel integrations.

For example to list all running Camel processes:

    camel ps
    PID   NAME                          READY  STATUS    AGE
    61818  sample.camel.MyCamelApplica…   1/1   Running  26m38s
    62506  dude                           1/1   Running   4m34s

To see a bit more information, you can use `camel get`.

Suppose you have two running integrations, then you can manage them, such as stop (with `camel stop <integration-name-or-pid>`),
or stop/start routes (with respectively `camel cmd stop-route --id=<id-route> <integration-name-or-pid>`/`camel cmd start-route --id=<id-route> <integration-name-or-pid>`) etc:

    camel stop dude
    Stopping running Camel integration (pid: 62506)

There is a lot more that Camel JBang can do, so make sure to see the [Camel JBang documentation](/manual/camel-jbang.html).
It is also a good idea to run `camel --help` to list all available commands.

There you can also find information how to get JBang installed, and after that install the Camel app in JBang.

### Camel File

The `camel-file` component has been optimized on the consumer scanning for files,
to lazy evaluate file size/modification, which often yields better performance,
as file filtering is usually only based on file names.

### Camel Salesforce

When querying from salesforce, Camel can now sniff the query result and detect the correct DTO class to use
for deserializing the response, alleviating the need to provide sObjectClass and sObjectName options.

### Rest DSL

It is now possible to inline routes in Rest DSL which means that a Rest service corresponds to 1 route,
and not 2 as before. This requires to enable `inline-routes=true` in Rest configuration,
and to link the routes using `direct` endpoints.

### Security

We have upgraded to `TLSv1.3` as default in all components that are using SSL/TLS.

### Load properties from vault/secrets cloud services

In 3.19.0, we introduced the feature of automatically reloading context on Secrets update events on Cloud Services.

We currently support this for AWS Secrets Manager, Google Secret Manager and Azure Key Vault.

The features are using some of the services provided on the cloud

- For AWS, we're leveraging AWS Cloudtrail
- For GCP, we're leveraging Google Pubsub
- For Azure Key Vault, we're leveraging Azure Eventgrid and Azure Eventhubs

We provide some [Examples](https://github.com/apache/camel-examples/tree/main/examples/vault) in our camel-examples repository.

**NOTE:**
The context reloading feature is implemented as general functionality, which means, that its possible
to use for other use-cases.

### Camel Kafka

We upgraded to Kafka Clients 3.2.x.
Various other improvements and bug fixes as well, such as better error messages with health checks.

### New Components

There are 5 new components:

- `camel-aws-cloudtrail` - Consume events from Amazon Cloudtrail
- `camel-elasticsearch` - Send requests to ElasticSearch via Java Client API
- `camel-hyperledger-aries` - Camel support for Hyperledger Aries
- `camel-mapstruct` - Type Conversion using Mapstruct
- `camel-python` - To use python scripts

### Spring Boot

We have upgraded to the latest Spring Boot 2.7 release.

Camel Spring Boot now supports `platform-http` to make it easy to
define Camel routes that start from the embedded HTTP server inside Spring Boot.

## Upgrading

Make sure to read the [upgrade guide](/manual/camel-3x-upgrade-guide-3_19.html) if you are upgrading from a previous Camel version.

## Release Notes

You can find more information about this release in the list of JIRA tickets resolved in the release: 

- [Release notes 3.19](/releases/release-3.19.0/)

