---
title: "Apache Camel 4.18 What's New"
date: 2026-02-19
draft: false
authors: [ davsclaus, oscerd ]
categories: [ "Releases" ]
preview: "Details of what we have done in the Camel 4.18 LTS release."
---

Apache Camel 4.18 LTS has just been [released](/blog/2026/02/RELEASE-4.18.0/).

This release introduces a set of new features and noticeable improvements that we will cover in this blog post.

## Camel Core

Added the possibility to add `note`(s) to EIPs. This is intended for developer notes or other kind of notes,
that is convention to have at the source code. The note has no impaction on the running Camel. Another use case is
to build tutorials with half complete code, and have note(s) that describe what to do.

## Camel Simple

The simple language has been improved tremendously.

### More Functions

We have added 50 more functions to simple language so it now comes with a total of 114.

There are now a lot more functions to work with the data such as String related functions,
and also math functions so you can sum totals, find the maximum or minimum value and more.

For example, if you work with JSon data, then there is a new `safeQuote` function,
which will based on the data type quote the value if necessary.

We also made it possible for Camel components and custom components to provide simple functions.
For example `camel-attachments` and `camel-base64` has a set of functions out of the box.

#### Adding your own custom Functions 

You can now add custom functions that can be used as _first class_ functions in your simple expressions or predicates.

We added a small example with a custom function [stock function](https://github.com/apache/camel-kamelets-examples/tree/main/jbang/simple-custom-function),
which returns a stock value which can be with Camels simple language with `${stock()}` as shown below:

```yaml
- from:
    uri: "timer:stock"
    parameters:
      period: 5000
    steps:
      - log: |


          Stock prices today

          ${stock()}
          ${stock('AAPL')}
          ${stock('IBM')}

          Have a nice day
```

### More Operators

We also added 3 new operators.

#### Elvis Operator

The Elvis operator `?:` is used for returning the current value or a default value.
The following will return the username header unless its null or empty, which then the default value of Guest is returned.

```java
simple("${header.username} ?: 'Guest'");
```

#### Ternary Operator

We have added the beloved `? :` ternary operator so you can do:

```java
simple("${header.foo > 0 ? 'positive' : 'negative'}");
```

#### Chain Operator

The new `~>` chain operator is fantastic, when you have a new for calling functions from functions.
As this makes it much more readable and avoids cluttering when nesting functions inside functions.

```java
simple("${substringAfter('Hello')} ~> ${trim()} ~> ${uppercase()}");
```

The example above, will first substring the message body, then trim the result, and lastly then uppercase.

### Init Blocks

For users that use simple language for data mapping, or when having a larger simple expression,
then we have introduced init block.

You can now in the top of your Simple expressions declare an initialization block that are used to define a set of local variables that are pre-computed, and can be used in the following Simple expression. This allows to reuse variables, and also avoid making the simple expression complicated when having inlined functions, and in general make the simple expression easier to maintain and understand.

```text
$init{
  $greeting := ${upper('Hello $body}'}
  $level := ${header.code > 999 ? 'Gold' : 'Silver'}
}init$
{
  "message": "$greeting",
  "status": "$level"
}
```

Here we have an init block which has 2 local variables assigned, that can then easily be reused in the simple
expression.

You can also build local custom functions in the init block:

```text
$init{
  $cleanUp ~:= ${trim()} ~> ${normalizeWhitespace()} ~> ${uppercase()}
}init$
```

Notice how the function is defined using `~:=` which then allows the function to take in a parameter (message body by default).
You can then use that in the simple expression:

```text
{
  "message": "$greeting ~> $cleanUp()",
  "status": "$level"
}
```

### Better Documentation

The simple documentation has been updated and all the functions and operators has been grouped
in different set of tables such as grouped by: numeric functions, string functions, list functions, date functions, etc.

We also added some examples of many of the functions so you have a better understanding what each function can do.

### Other Simple Improvements

When using the simple language the returned result can now be trimmed via `trimResult: true`.
You can also pretty print the result (JSon or XML) via `pretty: true`. 

## Camel JBang

Every command now has a generated documentation page on the website, that explains what the command do,\
and every option supported.

The `camel cmd send` command can now also send messages to a running infra service (via `--infra`), such as 

```shell
$ camel cmd send --body=hello --infra=nats
```

The `camel version list --fresh` will store the result to local disk, so when using `camel version list` then it includes
the latest information.

Add new `validate` plugin that can be installed and then used for validating YAML DSL files without running Camel.
The validation is based on the YAML DSL schema specification.

```shell
$ camel plugin add validate
$ camel validate yaml foo.camel.yaml
```

This functionality is also available as a Maven Plugin.

```shell
$ mvn camel-yaml-dsl-validator:validate

[INFO] --- camel-yaml-dsl-validator:4.18.0:validate (default-cli) @ camel-example-main-yaml ---
[INFO] Found [.../camel-examples/main-yaml/src/main/resources/routes/my-route.camel.yaml] YAML files ...
[INFO] Validating 1 YAML files ...
[WARNING]

Validation error detected in 1 files

	File: my-route.camel.yaml
		/0/route/from: property 'step' is not defined in the schema and the schema does not allow additional properties
		/0/route/from: required property 'steps' not found
```

## Camel Kafka

Configuring security with `camel-kafka` has been streamlined to be much easier and _similar_ for all kinds of Kafka security configurations.

Previously, setting up authentication required manually constructing JAAS configuration strings, knowing the
correct login module class names, matching `securityProtocol` with `saslMechanism`, and handling special character
escaping in credentials. This complexity also led to 24 separate Kafka Kamelets in `camel-kamelets` to cover
different authentication combinations.

A new `saslAuthType` option has been added that supports: `PLAIN`, `SCRAM_SHA_256`, `SCRAM_SHA_512`, `SSL`,
`OAUTH`, `AWS_MSK_IAM`, and `KERBEROS`. When set, the appropriate `securityProtocol`, `saslMechanism`,
and `saslJaasConfig` are automatically derived.

For example, configuring SCRAM-SHA-512 authentication is now as simple as:

```java
from("kafka:my-topic?brokers=localhost:9092&saslAuthType=SCRAM_SHA_512&saslUsername=user&saslPassword=pass")
```

Instead of the previous verbose approach:

```java
from("kafka:my-topic?brokers=localhost:9092&securityProtocol=SASL_SSL&saslMechanism=SCRAM-SHA-512"
    + "&saslJaasConfig=org.apache.kafka.common.security.scram.ScramLoginModule required username=\"user\" password=\"pass\";")
```

OAuth 2.0 authentication is also supported with dedicated options: `oauthClientId`, `oauthClientSecret`,
`oauthTokenEndpointUri`, and `oauthScope`.

For programmatic use, a new `KafkaSecurityConfigurer` builder class provides a fluent API with
convenient factory methods such as `plain(username, password)`, `scramSha512(username, password)`,
`oauth(clientId, clientSecret, tokenEndpointUri)`, and more.

The existing explicit configuration approach with `securityProtocol`, `saslMechanism`, and `saslJaasConfig`
continues to work as before -- the new simplified options are fully backward compatible.

## Camel AI

### Camel OpenAI

TODO: Ivo

### MCP Server

We introduced the **Camel MCP Server**, a [Model Context Protocol (MCP)](https://modelcontextprotocol.io/) server
that exposes the Apache Camel Catalog and a set of specialized tools to AI coding assistants
such as Claude Code, OpenAI Codex, GitHub Copilot, and JetBrains AI.

The server is built on Quarkus using the [quarkus-mcp-server](https://docs.quarkiverse.io/quarkus-mcp-server/dev/index.html)
extension and ships as a single uber-JAR that can be launched via [JBang](https://www.jbang.dev/).
It supports both **STDIO** (default, for CLI-based AI tools) and **HTTP/SSE** transports.

The server exposes 16 tools organized into six functional areas:

- **Catalog Exploration** -- Query components, data formats, expression languages, and EIPs with filtering and multi-version support.
- **Kamelet Catalog** -- Browse and get documentation for Kamelets.
- **Route Understanding** -- Extract components and EIPs from a route (YAML, XML, or Java DSL) and return enriched context from the catalog.
- **Security Analysis** -- Analyze routes for security concerns such as hardcoded credentials or plain-text protocols, with risk levels and remediation recommendations.
- **Validation and Transformation** -- Validate endpoint URIs and YAML DSL structure against the catalog schema, and transform routes between YAML and XML formats.
- **Version Management** -- List available Camel versions with release dates, JDK requirements, and LTS status.

Setting it up is straightforward. For example, with Claude Code add the following to your `.mcp.json`:

```json
{
  "mcpServers": {
    "camel": {
      "command": "jbang",
      "args": [
        "-Dquarkus.log.level=WARN",
        "org.apache.camel:camel-jbang-mcp:4.18.0:runner"
      ]
    }
  }
}
```

This module is in **Preview** status as of Camel 4.18. For a deeper dive, see the dedicated
[blog post](/blog/2026/02/camel-jbang-mcp/).

## Camel Quarkus

When using `camel-main` or `camel-quarkus` then Rest DSL in _contract first_ style is now
registering each API endpoints individually with the underlying HTTP server which allows Quarkus
to register access control and metrics per endpoint instead of a single combined overall endpoints as previously.
This now works the same way as Rest DSL in _code first_ style behaves.

## Miscellaneous

Upgraded many third-party dependencies to the latest releases at the time of release.

The `camel-mock` component can now assert JSon where the ordering of the elements does not matter.

The new `camel-mina-sftp` has support for OpenSSH certifications for security. A feature the existing `camel-ftp`
does not offer via the JSch FTP library.

The `camel-zipfile` now avoids loading the entire zip content into memory when used with Split EIP. 

When testing routes that has been _advice with_ then the route coverage tool now handles this as well.

The `camel-file` when writing files and checksum has been enabled, then the checksum is now also stored
as a message header that allow to have this information directly in Camel.

When using Camel Spring Boot you can now also for **development purposes** turn on `camel.ssl.trustAllCertificates = true`
to accept all SSL certificates. Do not use in production!

The `camel-aws-s3` when uploading files to AWS S3 is now supporting directly streaming from file sources.

## New Components

We have some new components to this release.

- `camel-aws-security-hub` - Manage and interact with AWS Security Hub for security findings.
- `camel-aws2-comprehend` - Perform natural language processing using AWS Comprehend and AWS SDK version  2.x.
- `camel-aws2-polly` - Synthesize speech using AWS Polly and AWS SDK version 2.x.
- `camel-azure-functions` - Invoke and manage Azure Functions.
- `camel-github2` - Interact with the GitHub API.
- `camel-google-firestore` - Store and retrieve data from Google Cloud Firestore NoSQL database.
- `camel-ocsf` - Marshal and unmarshal OCSF (Open Cybersecurity Schema Framework) security events to/from JSON.
- `camel-ibm-watsonx-ai` - Interact with IBM watsonx.ai foundation models for text generation, chat, camel-embeddings, and more.
- `camel-mina-sftp` - Upload and download files to/from SFTP servers using Apache MINA SSHD.

## Java 25

A few more 3rd party components has been made Java 25 compatible.
However, we expected still some time before all of Camel is Java 25 compatible.

## Upgrading

Make sure to read the [upgrade guide](/manual/camel-4x-upgrade-guide-4_18.html) if you are upgrading from a previous
Camel version.

If you are upgrading from, for example, 4.4 to 4.8, then make sure to follow the upgrade guides for each release
in-between, i.e.
4.4 -> 4.5, 4.5 -> 4.6, and so forth.

The Camel Upgrade Recipes tool can also be used to automate upgrading.
See more at: https://github.com/apache/camel-upgrade-recipes

## Release Notes

You can find additional information about this release in the list of resolved JIRA tickets:

- [Release notes 4.18](/releases/release-4.18.0/)

## Roadmap

The next 4.19 release is planned in April.

The goal of that release is to migrate to Spring Boot v4, however all together
there will be related work to be done in upcoming release to get all of this aligned.

