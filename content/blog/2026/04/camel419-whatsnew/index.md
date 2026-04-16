---
title: "Apache Camel 4.19 What's New"
date: 2026-04-20
draft: false
authors: [ davsclaus, croway, squakez ]
categories: [ "Releases" ]
preview: "Details of what we have done in the Camel 4.19 release."
---

Apache Camel 4.19 has just been [released](/blog/2026/04/RELEASE-4.19.0/).

This release introduces a set of new features and noticeable improvements that we will cover in this blog post.

## Camel Core

## Simple Language

Added more functions to the simple language to work with list/map:

- `listAdd(fun)` - Adds the result of the function to the message body as a list object.
- `listAdd(source,fun)` - Adds the result of the function to the source expression as a list object.
- `listRemove(fun)` - Removes the result of the function (use int to remove by position index) from the message body as a list object.
- `listRemove(source,fun)` - Removes the result of the function (use int to remove by position index) from the source expression as a list object.
- `mapAdd(key,fun)` - Adds the result of the function to the message body as a map object.
- `mapAdd(source,key,fun)` - Adds the result of the function to the source expression as a map object.
- `mapRemove(key)` - Removes the key from the message body as a map object.
- `mapRemove(source,key)` - Removes the key from the source expression as a map object.
- `sort(exp,reverse)` - Sorts the message body or expression in natural order

And also new functions for JSon:

- `toPrettyJson(exp)` - Converts the expression to a JSon `String` representation. String values are returned as-is, null values return null, all other types are serialized to JSon in pretty mode.
- `toPrettyJsonBody` - Converts the message body to a JSon `String` representation. String values are returned as-is, null values return null, all other types are serialized to JSon in pretty mode.
- `toJson(exp)` - Converts the expression to a JSon `String` representation. String values are returned as-is, null values return null, all other types are serialized to JSon.
- `toJsonBody` - Converts the message body to a JSon `String` representation. String values are returned as-is, null values return null, all other types are serialized to JSon.
- `simpleJsonpath(exp)` - When working with JSon data, then this allows using built-in Simple JsonPath, for example, to extract data from the message body (in JSon format).
- `simpleJsonpath(input,exp)` - Same as `simpleJsonpath(exp)` but to use the _input_ expression as the source of the JSon document.

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

### MCP Client Support

`camel-openai`, `camel-langchain4j-agent`, and `camel-spring-ai-chat` can now act as MCP clients, connecting to external MCP servers to discover and invoke tools during a conversation.

When MCP servers are configured, the component runs an agentic loop automatically. MCP Tools are exposed to the model, the component executes them via MCP, feeds results back, and repeats until the model produces a final text answer.

MCP servers are configured inline on the endpoint URI. For example, connecting to a filesystem MCP server:

```java
from("direct:chat")
    .to("openai:chat-completion?model=gpt-4"
        + "&mcpServer.fs.transportType=stdio"
        + "&mcpServer.fs.command=npx"
        + "&mcpServer.fs.args=-y,@modelcontextprotocol/server-filesystem,/tmp")
    .log("${body}");
```

Multiple servers can be configured on the same endpoint, tools from all servers are merged and made available to the model. Stdio, SSE, and Streamable HTTP transports are supported:

```java
from("direct:chat")
    .to("openai:chat-completion?model=gpt-4"
        + "&mcpServer.fs.transportType=stdio"
        + "&mcpServer.fs.command=npx"
        + "&mcpServer.fs.args=-y,@modelcontextprotocol/server-filesystem,/tmp"
        + "&mcpServer.weather.transportType=streamableHttp"
        + "&mcpServer.weather.url=http://localhost:9090/mcp");
```

####  OAuth for AI Components

A new OAuth SPI makes it easy to authenticate AI components against identity providers (e.g., Azure AD, Keycloak) using the OAuth 2.0 Client Credentials grant. Define a named profile in your Camel properties and reference it on the endpoint. The token is acquired and refreshed automatically, with caching built in. This requires `camel-oauth` on the classpath.

```properties
camel.oauth.azure.client-id=my-client
camel.oauth.azure.client-secret=my-secret
camel.oauth.azure.token-endpoint=https://login.microsoftonline.com/tenant/oauth2/v2.0/token
camel.oauth.azure.scope=https://cognitiveservices.azure.com/.default
```

```java
from("direct:chat")
    .to("openai:chat-completion?model=gpt-4&oauthProfile=azure");
```

MCP servers can also use their own OAuth profile independently, so a single route can authenticate against both the LLM provider and a secured MCP server:

```java
from("direct:chat")
    .to("openai:chat-completion?model=gpt-4"
        + "&oauthProfile=azure"
        + "&mcpServer.tools.transportType=streamableHttp"
        + "&mcpServer.tools.url=https://mcp.internal/mcp"
        + "&mcpServer.tools.oauthProfile=keycloak");
```

The OAuth SPI is also available on `camel-langchain4j-agent`, `camel-docling` and `camel-ibm-watsonx-ai`. It has been successfully tested with [Wanaku](https://www.wanaku.ai/), an open-source MCP router that federates multiple MCP servers behind a single secured endpoint.

## Meter logging on shutdown

In this release we're introducing the possibility to trace Micrometer metrics when the application is shutting down. When you have a controlled shutdown (for example, a cronjob executing) or a shutdown produced by any fatal error you are in a situation where your last metrics you may have not been able to scrape are lost. From now on you can enable the feature `camel.metrics.logMetricsOnShutdown=true` (and `camel.metrics.logMetricsOnShutdownFilters=camel.exchanges.*`, default `*`) and be able to store those values for any post mortem evaluation (for example when your Kubernetes Pod is stopping gracefully or crashed):

```bash
2026-03-02 10:50:13.021  INFO 269172 --- [           main] icrometer.json.AbstractMicrometerService : Micrometer component is stopping, here a list of metrics collected so far.
...
2026-03-02 10:50:13.050  INFO 269172 --- [           main] icrometer.json.AbstractMicrometerService : {"name":"camel.exchanges.succeeded","type":"counter","value":0.0,"tags":{"routeId":"","kind":"CamelRoute","camelContext":"camel-1","eventType":"context"}}
2026-03-02 10:50:13.050  INFO 269172 --- [           main] icrometer.json.AbstractMicrometerService : {"name":"camel.exchanges.failed","type":"counter","value":0.0,"tags":{"routeId":"","kind":"CamelRoute","camelContext":"camel-1","eventType":"context"}}
2026-03-02 10:50:13.050  INFO 269172 --- [           main] icrometer.json.AbstractMicrometerService : {"name":"camel.exchanges.total","type":"counter","value":0.0,"tags":{"routeId":"","kind":"CamelRoute","camelContext":"camel-1","eventType":"context"}}
```

## MDC Service wildcard filter

You can use the wildcard `*` into your headers (`camel.mdc.customHeaders`) or properties (`camel.mdc.customProperties`) filter configuration, for example `CAMEL_HTTP_*` or `my_*_property` to select the values to include in your MDC logging trace. From now on you can spare some time and avoid to include all configuration one by one.

## Camel Spring Boot

This is our first release that supports Spring Boot v4.
Spring Boot v3 is no longer supported.

### Camel Jackson 3 Components

Four new components have been added which provide Jackson 3 support - they are named similarly to the previously existing camel-jackson components. Jackson 3 operates under a different package name (tools.jackson.* vs. com.fasterxml.jackson) and there are a number of API changes between Jackson 2 and Jackson 3.    The [upgrade guide](/manual/camel-4x-upgrade-guide-4_19.html) has a lot of details on how to migrate your Camel application to Jackson 3.

## JDK25 compatibility

We expect the next Camel 4.20 release to support Java 25.

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

## Deprecations

Starting from this version we're deprecating the following components:

- `camel-tracing` based components (`camel-opentelemetry`, `camel-observation`): replaced by `camel-telemetry` components (`camel-opentelemetry2`, `camel-micrometer-observability`).
- Old MDC technology (`camel.main.useMdcLogging = true`): replaced by `camel-mdc` service.

You're invited to move to the new components already in this version.

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

