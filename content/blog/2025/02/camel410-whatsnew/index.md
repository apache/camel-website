---
title: "Apache Camel 4.10 What's New"
date: 2025-02-12
authors: [davsclaus, opiske]
categories: ["Releases"]
preview: Details of what we have done in the Camel 4.10 release.
---

Apache Camel 4.10 LTS has just been [released](/blog/2025/02/RELEASE-4.10.0/).

This release introduces a set of new features and noticeable improvements that we will cover in this blog post.

## Camel Core

TODO:

Added `customize` to `RouteBuilder` to make it easier to configure a specific Camel component / dataformat, service
from a Java lambda style, such as follows:

```java
@Override
public void configure() throws Exception {
    customize(KServeComponent.class, k -> {
        k.getConfiguration().setTarget("localhost:8888");
    });

    from("timer:kserve?repeatCount=1")
        .to("kserve:model/metadata?modelName=myModel")
        .log("${body}");
}
```

This makes it possible for low-code users that want to have a single Java file with the Camel route
and all its configuration done entirely from the same `configure` method.

## Camel JBang

Using _modeline_ has been deprecated. It is recommended to configure externally in `application.properties`
files.

The `debug` command now supports step in and step over. For example debugging a splitter allows
now to step over and continue after the entire split is complete, while step in, will step
inside the splitter (default mode). You can now also debug inside Kamelets as well.

The `camel-smb` component has been refactored to include alot more shared features from the `camel-file` component.

The `camel-http` component has a new `logHttpActivity` option you can enable, to make it easy to log
all HTTP request/response when using this component to call external HTTP services.

### Camel JBang Kubernetes

TODO:

## Camel Kamelet

The error handling of the kamelets has been aligned to be Camel _standard_ and act
similar to Camel routes. See the migration guide for more details.

You can now also configure the `bridgeErrorHandler` option on a Kamelet.

And it's now also possible to call another Kamelet from within a Kamelet.

## Camel AI

TODO:

## Camel Groovy

Camel now reports a bit better when groovy scripts have compilation errors, to indicate at what
position the error is located.

## Camel Attachments / Camel Platform HTTP

We have improved the `platform-http` component to better handle file uploads using `multipart/data-form`
across all runtimes. The files are stored in `camel-attachments`, and this API has been made
easier to use from Java, and simple and groovy languages. And if there is a single file
uploaded, then the file content is automatically stored in the message body, and the file name
in `CamelFileName` header, length in `CamelFileLength` header, and content-type in `CamelFileContentType`.

We have also included a mime-detector algorithm that has a huge list of well known types,
(similar to what Spring Boot uses). This means if xml,json,cxf, and various image files is uploaded,
then the content-type refers to these types instead of the default `application/octet-stream`.


## Camel Kafka

This release brings a couple of fixes for minor performance issues when evaluating Kafka record metadata.

## Camel SJMS / SJMS2

This release brings a couple of fixes for minor performance issues when working with standard JMS headers. 

## Camel Vault

The hashicorp vault can now be configured to use cloud-based vault as well.

## Camel Spring Boot

The `camel-spring-boot` is upgraded to latest Spring Boot 3.4.2 release.

### Camel Spring Boot Platform HTTP

TODO:

## Miscellaneous

Upgraded many third-party dependencies to the latest releases at the time of release.

The `camel-file` component has been optimized when filtering based on file-names to
be faster.

## New Components

We have added a few new components:

- `camel-kserve` - Provide access to AI model servers with the KServe standard to run inference
- `camel-neo4j` - Perform operations on the Neo4j Graph Database
- `camel-tensorflow-serving` - Provide access to TensorFlow Serving model servers to run inference with TensorFlow saved models remotely

## Upgrading

Make sure to read the [upgrade guide](/manual/camel-4x-upgrade-guide-4_10.html) if you are upgrading from a previous Camel version.

If you are upgrading from, for example, 4.4 to 4.8, then make sure to follow the upgrade guides for each release in-between, i.e.
4.4 -> 4.5, 4.5 -> 4.6, and so forth.

The Camel Upgrade Recipes tool can also be used to automate upgrading.
See more at: https://github.com/apache/camel-upgrade-recipes

## Release Notes

You can find more information about this release in the list of JIRA tickets resolved in the release:

- [Release notes 4.10](/releases/release-4.10.0/)

## Roadmap

The following 4.11 release is planned for Apr 2025.

