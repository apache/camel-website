---
title: "Apache Camel 4.19 What's New"
date: 2026-04-20
draft: false
authors: [ davsclaus ]
categories: [ "Releases" ]
preview: "Details of what we have done in the Camel 4.19 release."
---

Apache Camel 4.19 has just been [released](/blog/2026/04/RELEASE-4.19.0/).

This release introduces a set of new features and noticeable improvements that we will cover in this blog post.

## Camel Core

## Simple Language

Added more functions to the simple language to work with list/map and more functions for JSon:

- listAdd
- listRemove
- mapAdd
- mapRemove
- sort
- toPrettyJson
- toPrettyJsonBody
- toJson
- toJsonBody
- simpleJsonpath (to extract data from JSon using Camel simple OGNL syntax)

## XML and YAML DSL

You can now configure SSL/TLS directly in the XML and YAML DSL.

Here is a basic example in XML and YAML:

```xml
<camel xmlns="http://camel.apache.org/schema/xml-io">
    <sslContextParameters id="mySSL" keyStore="server.p12" keystorePassword="changeit"
                           trustStore="truststore.p12" trustStorePassword="changeit"/>

    <route id="sslRoute">
        <from uri="direct:ssl"/>
        <to uri="mock:ssl"/>
    </route>
</camel>
```

```yaml
- sslContextParameters:
    id: mySSL
    keyStore: server.p12
    keystorePassword: changeit
    trustStore: truststore.p12
    trustStorePassword: changeit
- from:
    uri: "direct:ssl"
    steps:
      - to: "mock:ssl"
```

In YAML DSL then we have added support for configuring transformer and validator, something like:

```yaml
- transformers:
    loadTransformer:
      defaults: true
    endpointTransformer:
      ref: myXmlEndpoint
      fromType: xml:XmlXOrder
      toType: "java:org.example.XOrder"
    customTransformer:
      className: org.example.MyTransformer
      fromType: other:OtherXOrder
      toType: "java:org.example.XOrder"

- validators:
    endpointValidator:
      type: xml:XmlXOrderResponse
      uri: "myxml:endpoint"
    customValidator:
      type: other:OtherXOrder
      className: org.example.OtherXOrderValidator
```


## Camel JBang

The output from the Camel JBang commands is now better fit within the current terminal width.  

Added `--json` option to many of the Camel JBang status commands to dump output in JSon instead of tables.

Added `camel transform dataweave` command to convert MuleSoft dataweave scripts into DataSonnet files which
can run in Camel using the `camel-datasonnet` component.

The `camel-tooling-maven` (Maven downloader) is now using the Apache Maven Mima library, which JBang also recently started using as well.

Added more smaller examples in the documentation and `--help` for the JBang commands.

Camel JBang can now easier run and export with JPA by automatic using Hibernates as the JPA provider (if none has been selected).

Removed exporting with Gradle as the build tool. Only Maven works reliable and is generally supported and recommended to be used.

Added `camel wrapper` command that installs Camel Launcher with wrapper scripts (`camelw`) which allows to run Camel JBang (without JBang)
using the Camel Launcher instead with the binary installed locally, just like Maven Wrapper. This ensures consistency and locked to use
the installed version. 


## Camel Groovy

The `camel-groovy` JAR now included `camel-groovy-json` and `camel-groovy-xml` all combined in a single dependency.

## Camel Kafka

Upgraded to Kafka 4.2 client.

## Camel AI

### Camel OpenAI

### MCP Server

## Camel Spring Boot

This is our first release that supports Spring Boot v4.
Spring Boot v3 is no longer supported.

## JDK25 compatibility

## Miscellaneous

Upgraded many third-party dependencies to the latest releases at the time of release.

## New Components

We have some new components to this release.

- `camel-azure-functions` -  Invoke and manage Azure Functions.
- `camel-camunda` - Interact with Camunda 8 Orchestration Clusters using the Camunda Java Client.
- `camel-event` - Subscribe to Camel internal events such as route started/stopped and exchange.
- `camel-google-firestore` - Store and retrieve data from Google Cloud Firestore NoSQL database.
- `camel-google-speech-to-text` - Transcribe audio to text using Google Cloud Speech-to-Text API
- `camel-google-text-to-speech` - Synthesize speech from text using the Google Cloud Text-to-Speech API
- `camel-google-vision` - Detect labels, text, faces, logos and more on images through Google Cloud Vis…
- `camel-groovy` - GroovyJson data format to transform between JSon and java.util.Map or java.util.List objects.
- `camel-hazelcast-pncounter` - Increment, decrement, get, etc. operations on a Hazelcast PN Counter
- `camel-huggingface` - Integration with Hugging Face's Model Hub by using the Deep Java Library
- `camel-ibm-watsonx-data` - Interact with IBM watsonx.data lakehouse for catalog, schema, table
- `camel-pgvector` - Perform operations on the PostgreSQL pgvector Vector Database.
- `camel-spring-ai-image` - Spring AI Image Generation

## Upgrading

Make sure to read the [upgrade guide](/manual/camel-4x-upgrade-guide-4_19.html) if you are upgrading from a previous
Camel version.

If you are upgrading from, for example, 4.4 to 4.8, then make sure to follow the upgrade guides for each release
in-between, i.e.
4.4 -> 4.5, 4.5 -> 4.6, and so forth.

The Camel Upgrade Recipes tool can also be used to automate upgrading.
See more at: https://github.com/apache/camel-upgrade-recipes

## Release Notes

You can find additional information about this release in the list of resolved JIRA tickets:

- [Release notes 4.19](/releases/release-4.19.0/)

## Roadmap

The next 4.20 release is planned in June.

