---
title: "Apache Camel MCP Server: Bringing Camel Knowledge to AI Coding Assistants"
date: 2026-02-10
draft: false
authors: [ oscerd ]
categories: [ "Camel", "AI", "Tooling" ]
preview: "Introducing the Camel MCP Server, a Model Context Protocol server that exposes the full Camel Catalog, route validation, security analysis, and more to AI coding assistants like Claude Code, OpenAI Codex, and others."
---

Working with Apache Camel means dealing with over 300 components, dozens of Enterprise Integration Patterns, multiple DSL formats, and a rich set of configuration options. Keeping all of that in your head while writing integration routes is not trivial, and AI coding assistants have become a natural companion for this kind of work. The problem is that general-purpose LLMs lack deep, structured knowledge of Camel's catalog, its component options, its URI syntax rules, and its security best practices.

Apache Camel 4.18 addresses this gap with a dedicated MCP (Model Context Protocol) server: `camel-jbang-mcp`. This server exposes the Camel Catalog and a set of specialized tools through the [Model Context Protocol](https://modelcontextprotocol.io/), the open standard that allows AI assistants to call external tools. Instead of relying on the LLM's training data (which may be outdated or incomplete), the AI can query the live Camel Catalog, validate endpoint URIs against the real schema, and get structured security analysis for routes, all in real time.

In this post we will walk through what the MCP server offers, how to set it up with different AI assistants, and practical examples of interacting with the tools it provides.

## What the MCP Server Exposes

The server is built on [Quarkus](https://quarkus.io/) with the [quarkus-mcp-server](https://docs.quarkiverse.io/quarkus-mcp-server/dev/index.html) extension and supports two transports: STDIO for direct integration with CLI-based AI tools, and HTTP/SSE for web-based clients and remote scenarios. It ships as a single uber-JAR that can be launched via JBang.

The server exposes 15 tools organized into six functional areas:

### Catalog Exploration

- **`camel_catalog_components`** -- List available Camel components with filtering by name, label (e.g., `messaging`, `cloud`, `database`), and runtime type (`main`, `spring-boot`, `quarkus`). Supports querying specific Camel versions.
- **`camel_catalog_component_doc`** -- Get full documentation for a specific component including all endpoint options, component-level options, Maven coordinates, and URI syntax.
- **`camel_catalog_dataformats`** -- List available data formats (JSON, XML, CSV, Avro, Protobuf, and others).
- **`camel_catalog_dataformat_doc`** -- Get detailed documentation for a specific data format including all configuration options, Maven coordinates, and model information.
- **`camel_catalog_languages`** -- List expression languages (Simple, JsonPath, XPath, JQ, Groovy, and others).
- **`camel_catalog_language_doc`** -- Get detailed documentation for a specific expression language including all configuration options and Maven coordinates.
- **`camel_catalog_eips`** -- List Enterprise Integration Patterns with filtering by category.
- **`camel_catalog_eip_doc`** -- Get detailed documentation for a specific EIP including all its options.

### Kamelet Catalog

- **`camel_catalog_kamelets`** -- List available Kamelets from the Kamelet Catalog with filtering by name, description, and type (`source`, `sink`, `action`). Supports querying specific Kamelets catalog versions.
- **`camel_catalog_kamelet_doc`** -- Get detailed documentation for a specific Kamelet including all properties/options, their types, defaults, examples, and the Kamelet's Maven dependencies.

### Route Understanding

- **`camel_route_context`** -- Given a Camel route (YAML, XML, or Java DSL), extracts all components and EIPs used, looks up their documentation from the catalog, and returns structured context. This is what allows the AI to provide accurate explanations of routes it has never seen before.

### Security Analysis

- **`camel_route_harden_context`** -- Analyzes a route for security concerns. Identifies security-sensitive components (47 components are tracked, from `http` and `kafka` to `exec` and `docker`), assigns risk levels, detects issues like hardcoded credentials or plain-text protocols, and returns structured security findings alongside best practices.

### Validation and Transformation

- **`camel_validate_route`** -- Validates Camel endpoint URIs against the catalog schema. Catches unknown options, missing required parameters, invalid enum values, and type mismatches. Also provides suggestions for misspelled option names.
- **`camel_transform_route`** -- Assists with route DSL format transformation between YAML and XML.

### Version Management

- **`camel_version_list`** -- Lists available Camel versions for a given runtime, including release dates, JDK requirements, and LTS status.

## Setting Up the MCP Server

The MCP server is distributed as a Quarkus uber-JAR. You can run it via JBang, which means you need JBang installed and available on your PATH.

Until the release will be done, you could use the 4.18.0-SNAPSHOT version of the runner.

### Claude Code

[Claude Code](https://docs.anthropic.com/en/docs/claude-code/overview) supports MCP servers through its configuration file. Add the following to your project's `.mcp.json` (or `~/.claude/mcp.json` for global configuration):

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

After saving this file, Claude Code will automatically start the MCP server and make all 11 tools available during your session.

### OpenAI Codex

For [OpenAI Codex](https://openai.com/index/codex/), you need to configure the MCP server in the `codex-config.json` or through the CLI setup. Add the server to your MCP configuration:

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

### VS Code with Copilot

In VS Code, you can configure MCP servers in your `.vscode/mcp.json` or in the user settings:

```json
{
  "servers": {
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

### JetBrains IDEs

JetBrains IDEs support MCP servers starting from 2025.1. You can configure them in Settings > Tools > AI Assistant > MCP Servers, or create an `.junie/mcp.json` file in your project root:

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

### Generic STDIO-based MCP Clients

Any MCP client that supports the STDIO transport can use the server. The launch command is:

```shell
jbang org.apache.camel:camel-jbang-mcp:4.18.0:runner
```

The server communicates over stdin/stdout using the MCP protocol and logs to stderr to avoid interfering with the protocol messages.

### HTTP/SSE Transport

In addition to STDIO, the server also includes the `quarkus-mcp-server-http` dependency, which means it supports the HTTP/SSE (Server-Sent Events) transport. This is useful when you want to run the MCP server as a standalone service, for example on a shared development machine, in a container, or behind a reverse proxy, and have multiple clients connect to it remotely.

To start the server with the HTTP transport enabled:

```shell
jbang -Dquarkus.http.host-enabled=true -Dquarkus.http.port=8080 org.apache.camel:camel-jbang-mcp:4.18.0:runner
```

MCP clients that support HTTP/SSE can then connect to the server at `http://localhost:8080/mcp/sse`. This makes it possible to share a single Camel MCP Server instance across a team, or to integrate it into web-based development environments that do not support STDIO-based tools.

## Practical Examples

Let's walk through some real interactions that show what the MCP server enables.

### Discovering Components

Suppose you want to find all Camel components related to messaging. You can prompt your AI assistant with:

> "List all Camel components in the messaging category"

The assistant calls the `camel_catalog_components` tool with `label=messaging` and gets back structured results:

```json
{
  "count": 15,
  "camelVersion": "4.18.0",
  "components": [
    {
      "name": "kafka",
      "title": "Kafka",
      "description": "Sent and receive messages to/from an Apache Kafka broker.",
      "label": "messaging",
      "deprecated": false,
      "supportLevel": "Stable"
    },
    {
      "name": "jms",
      "title": "JMS",
      "description": "Sent and receive Jakarta Messaging messages to a JMS Queue or Topic.",
      "label": "messaging",
      "deprecated": false,
      "supportLevel": "Stable"
    },
    {
      "name": "amqp",
      "title": "AMQP",
      "description": "Messaging with AMQP protocol using Apache QPid Client.",
      "label": "messaging",
      "deprecated": false,
      "supportLevel": "Stable"
    }
  ]
}
```

The assistant can then present this information in a clear, conversational way, and you can drill down into any specific component.

### Getting Component Documentation

When you need the exact syntax and available options for a component, ask:

> "Show me the documentation for the Kafka component, including all endpoint options"

The assistant calls `camel_catalog_component_doc` with `component=kafka` and receives the full component model, including the URI syntax (`kafka:topic`), Maven coordinates, and every single endpoint option with types, defaults, and descriptions. This is the same information you'd find on the Camel website, but delivered directly into your coding session.

### Browsing Kamelets

Kamelets are pre-built integration connectors that abstract away the complexity of configuring individual components. The MCP server gives the AI direct access to the Kamelet Catalog, which is especially useful when you want to wire together sources and sinks without dealing with low-level component options.

> "Show me all available source kamelets related to AWS"

The assistant calls `camel_catalog_kamelets` with `type=source` and `filter=aws`:

```json
{
  "count": 5,
  "kameletsVersion": "4.18.0",
  "kamelets": [
    {
      "name": "aws-cloudwatch-sink",
      "type": "sink",
      "supportLevel": "Stable",
      "description": "Send metrics to AWS CloudWatch."
    },
    {
      "name": "aws-s3-source",
      "type": "source",
      "supportLevel": "Stable",
      "description": "Receive data from an Amazon S3 Bucket."
    },
    {
      "name": "aws-sqs-source",
      "type": "source",
      "supportLevel": "Stable",
      "description": "Receive data from AWS SQS."
    }
  ]
}
```

You can then drill into a specific Kamelet to get the full documentation:

> "What options does the aws-s3-source kamelet accept?"

The assistant calls `camel_catalog_kamelet_doc` with `kamelet=aws-s3-source` and returns the complete property list:

```json
{
  "name": "aws-s3-source",
  "type": "source",
  "supportLevel": "Stable",
  "description": "Receive data from an Amazon S3 Bucket.",
  "options": [
    {
      "name": "bucketNameOrArn",
      "description": "The S3 Bucket name or Amazon Resource Name (ARN).",
      "type": "string",
      "required": true,
      "defaultValue": null,
      "example": null,
      "enumValues": null
    },
    {
      "name": "region",
      "description": "The AWS region to access.",
      "type": "string",
      "required": true,
      "defaultValue": null,
      "example": null,
      "enumValues": null
    },
    {
      "name": "deleteAfterRead",
      "description": "Specifies to delete objects after consuming them.",
      "type": "boolean",
      "required": false,
      "defaultValue": "true",
      "example": null,
      "enumValues": null
    }
  ],
  "dependencies": [
    "camel:aws2-s3",
    "camel:kamelet"
  ]
}
```

This gives the AI the exact parameter names, types, and which ones are required, so it can generate correct Kamelet bindings and Pipe definitions without guessing.

### Validating an Endpoint URI

A common source of errors in Camel routes is a typo in an endpoint URI or using an option that does not exist. You can ask:

> "Validate this Kafka endpoint: `kafka:myTopic?brkers=localhost:9092&groupId=myGroup`"

The assistant calls `camel_validate_route` with the URI and gets:

```json
{
  "uri": "kafka:myTopic?brkers=localhost:9092&groupId=myGroup",
  "valid": false,
  "errors": {
    "unknownOptions": "brkers"
  },
  "suggestions": {
    "brkers": "brokers"
  }
}
```

The tool not only catches the typo but also suggests the correct option name. This is especially useful for components with many options (Kafka alone has over 100 endpoint parameters).

### Understanding a Route

Paste a route into your AI assistant and ask for an explanation:

> "Explain what this route does"

```yaml
- route:
    from:
      uri: kafka:orders
      parameters:
        brokers: localhost:9092
        groupId: order-processor
    steps:
      - choice:
          when:
            - simple: "${header.orderType} == 'priority'"
              steps:
                - to: direct:priority-processing
          otherwise:
            steps:
              - to: direct:standard-processing
      - marshal:
          json:
            library: jackson
      - to:
          uri: aws2-s3:processed-orders
          parameters:
            region: eu-west-1
```

The assistant calls `camel_route_context` with this route. The tool extracts the components (`kafka`, `direct`, `aws2-s3`) and the EIPs (`choice`, `when`, `otherwise`, `marshal`) used, looks up their documentation, and returns it all in a structured payload. The assistant can then use this enriched context to provide an accurate explanation, rather than guessing based on its training data.

### Security Hardening

Security analysis is where the MCP server really shines. Pass a route and ask:

> "Analyze this route for security concerns and suggest hardening measures"

```yaml
- route:
    from:
      uri: "http://api.partner.com/orders"
      parameters:
        password: s3cret123
    steps:
      - to: "sql:INSERT INTO orders VALUES (:#id, :#name)"
      - to: "ftp://files.internal.net/archive"
```

The assistant calls `camel_route_harden_context` and receives a detailed analysis:

```json
{
  "securitySensitiveComponents": [
    {
      "name": "http",
      "riskLevel": "high",
      "securityConsiderations": "Prefer HTTPS over HTTP. Validate certificates. Configure appropriate timeouts. Set security headers."
    },
    {
      "name": "sql",
      "riskLevel": "high",
      "securityConsiderations": "Use parameterized queries to prevent SQL injection. Limit database user privileges. Enable connection encryption."
    },
    {
      "name": "ftp",
      "riskLevel": "high",
      "securityConsiderations": "INSECURE: Use SFTP or FTPS instead. Plain FTP transmits credentials in cleartext."
    }
  ],
  "securityAnalysis": {
    "concerns": [
      {
        "severity": "critical",
        "category": "Secrets Management",
        "issue": "Potential hardcoded credentials detected",
        "recommendation": "Use property placeholders {{secret}} or vault services for credentials"
      },
      {
        "severity": "high",
        "category": "Encryption",
        "issue": "Using HTTP instead of HTTPS",
        "recommendation": "Use HTTPS for secure communication. Configure TLS version 1.2 or higher"
      },
      {
        "severity": "high",
        "category": "Encryption",
        "issue": "Using plain FTP instead of SFTP/FTPS",
        "recommendation": "Use SFTP or FTPS for encrypted file transfers"
      }
    ],
    "positives": [],
    "concernCount": 3,
    "positiveCount": 0
  },
  "summary": {
    "securityComponentCount": 3,
    "criticalRiskComponents": 0,
    "highRiskComponents": 3,
    "hasExternalConnections": true,
    "hasSecretsManagement": false,
    "usesTLS": false,
    "hasAuthentication": false
  }
}
```

The tool catches three issues: hardcoded credentials, HTTP instead of HTTPS, and plain FTP instead of SFTP/FTPS. Note that the SQL component actually uses parameterized queries correctly (the `:#id` and `:#name` syntax), so no SQL injection concern is flagged. This kind of context-aware analysis goes beyond what a generic AI can do on its own.

### Checking Camel Versions

When planning upgrades or checking compatibility:

> "What are the latest LTS versions of Camel for Spring Boot?"

The assistant calls `camel_version_list` with `runtime=spring-boot` and `lts=true`:

```json
{
  "count": 3,
  "versions": [
    {
      "camelVersion": "4.18.0",
      "runtime": "spring-boot",
      "runtimeVersion": "3.5.10",
      "jdkVersion": "17",
      "kind": "lts",
      "releaseDate": "2026-03-01",
      "eolDate": "2027-03-01"
    },
    {
      "camelVersion": "4.8.0",
      "runtime": "spring-boot",
      "runtimeVersion": "3.4.1",
      "jdkVersion": "17",
      "kind": "lts",
      "releaseDate": "2025-01-15",
      "eolDate": "2026-01-15"
    }
  ]
}
```

This makes upgrade planning straightforward since you get release dates, end-of-life dates, and JDK requirements in one shot.

## Architecture Notes

A few technical details worth noting:

- **Dual transport support**: The server ships with both STDIO and HTTP/SSE transports. The STDIO transport is what CLI-based AI tools like Claude Code and Codex expect, and is the default mode. The HTTP/SSE transport (provided by `quarkus-mcp-server-http`) opens the door to browser-based clients, remote access, and integration with web applications that speak the MCP protocol over Server-Sent Events. By default the HTTP server is disabled for clean STDIO operation, but you can enable it by setting `quarkus.http.host-enabled=true` and connecting to the SSE endpoint.
- **Uber-JAR packaging**: The server is packaged as a Quarkus uber-JAR, which means a single `java -jar` (or `jbang`) command starts everything. No application server, no container required.
- **Catalog accuracy**: All catalog queries go through `DefaultCamelCatalog`, the same catalog that powers the Camel website documentation and IDE plugins. This means the data is always consistent with the Camel release you are querying.
- **Runtime-aware queries**: The catalog tools support runtime-specific queries. Component availability differs between Camel Main, Spring Boot, and Quarkus runtimes, and the server handles this transparently.
- **Version-specific queries**: You can query the catalog for any released Camel version, not just the one the server was built with. This is useful when working on projects that use older Camel versions.

## What Comes Next

This is the first release of the Camel MCP Server, and we are marking it as Preview. There are several directions we are considering for future iterations:

- **Live Camel context access**: Connecting the MCP server to a running Camel application to expose runtime information, live route statistics, and health checks to the AI assistant.
- **Recipe-driven upgrades**: Providing structured upgrade guidance through the MCP server, powered by the [Camel Upgrade Recipes](https://github.com/apache/camel-upgrade-recipes) project.
- **Custom catalog overlays**: Supporting organizational catalogs that extend the standard Camel catalog with custom components and policies.

We would like to hear from the community about which of these directions would be most valuable, and what other use cases you see for AI-assisted Camel development. The MCP specification is evolving, and as new capabilities land (like resource subscriptions and sampling), we plan to adopt them.

If you build something interesting with the Camel MCP Server, or if you integrate it with an AI tool that we have not covered here, please share your experience on the Apache Camel [mailing list](mailto:dev@camel.apache.org) or join us on [Zulip chat](https://camel.zulipchat.com/).

Happy integrating!
