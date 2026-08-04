---
title: "Camel Routes as AI Tools: Unified Tooling and MCP Server in Camel 4.22"
date: 2026-08-07
draft: false
authors: [zbendhiba, Croway, JiriOndrusek]
categories: ["AI", "Camel"]
preview: "Camel 4.22 introduces a unified AI tool abstraction and a built-in MCP server. Define a tool once as a Camel route, and it works with LangChain4j, Spring AI, and OpenAI. Tag it, and any MCP-compatible AI agent can discover and call it over MCP."
---

Camel 4.22 brings two features that change how Camel integrates with AI: a unified tool abstraction (`camel-ai-tool`) and a built-in MCP server (`camel-mcp-server`). Together, they let you turn any Camel route into an AI tool that works across frameworks and protocols.

This post covers both features.

## The Problem: Fragmented Tool Definitions

Before 4.22, defining AI tools in Camel meant picking a framework and committing to it. Want to expose a route as a tool for LangChain4j? Use `camel-langchain4j-tools`. For Spring AI? Use `camel-spring-ai-tools`. Each had its own consumer, its own registry, its own way of describing parameters.

This created three problems:

- **Duplication.** The same tool logic had to be defined twice if you wanted it available to both LangChain4j and Spring AI.
- **Lock-in.** Switching AI frameworks meant rewriting your tool definitions.
- **No external access.** External AI agents could not discover or call your tools.

## The Solution: `camel-ai-tool`

The new `camel-ai-tool` component solves the first two problems. You define a tool once. Every AI framework sees it.

```
                  ┌─────────────────────────┐
                  │     ai-tool: routes     │
                  │       (weather, ...)    │
                  └───────────┬─────────────┘
                              │ register
                              ▼
                  ┌─────────────────────────┐
                  │     AiToolRegistry      │
                  │     (tags + specs)      │
                  └───┬───────┬─────────┬───┘
                      │       │         │
          ┌───────────┘       │         └───────────┐
          ▼                   ▼                     ▼
┌──────────────────┐ ┌──────────────┐   ┌──────────────────┐
│  LangChain4j     │ │  Spring AI   │   │   MCP Server     │
│  Agent / Quarkus │ │  Chat        │   │   Bridge         │
│@RegisterAiService│ │              │   │                  │
└──────────────────┘ └──────────────┘   └────────┬─────────┘
                                                 │ MCP protocol
                                                 ▼
                                        ┌──────────────────┐
                                        │    MCP Clients   │
                                        └──────────────────┘
```

### Define Once, Use Everywhere

A tool is just a Camel route with an `ai-tool:` consumer:

```yaml
- route:
    from:
      uri: ai-tool:weather
      parameters:
        tags: weather
        description: "Get current weather for a city"
        parameter.city: string
        parameter.city.description: "The city name"
    steps:
      - to:
          uri: bean:weatherService
```

That route is now registered in the `AiToolRegistry` with its name (`weather`), description, parameter schema, and tags. No framework-specific code. No annotations.

### Framework Bridges

When an AI producer starts, it queries the `AiToolRegistry` for tools matching its configured tags. Framework-specific bridges handle the translation:

- **LangChain4j Agent** reads from the registry and converts each `AiToolSpec` into a LangChain4j `ToolSpecification`.
- **Spring AI Chat** does the same, converting to Spring AI's `FunctionCallback`.

The same `weather` tool works with both. Switch your AI producer from LangChain4j to Spring AI. Your tools don't change.

### Quarkus AIService Integration

On Quarkus, the integration goes one step further. If `camel-quarkus-ai-tool` and `quarkus-langchain4j` are both on the classpath, Camel tools are automatically available to any `@RegisterAiService` interface. No Camel producer route needed:

```java
@RegisterAiService
@CamelAiTools("weather")
public interface WeatherAgent {
    String chat(@UserMessage String question);
}
```

The `@CamelAiTools` annotation filters which Camel tools the AI service can see, using the same tag mechanism as the Camel producers. Without the annotation, the service sees all registered tools:

```java
@RegisterAiService
@CamelAiTools("support")
public interface SupportAgent {
    String chat(@UserMessage String question);
}

@RegisterAiService
public interface GeneralAgent {
    // sees all ai-tool routes, regardless of tags
    String chat(@UserMessage String question);
}
```

This bridges Camel's tool registry directly into the Quarkus LangChain4j `ToolProvider` SPI at build time. No manual wiring, no runtime reflection.

### Tags for Organization

Tags group tools into logical sets. An AI producer selects tools by tag:

```yaml
- route:
    from:
      uri: langchain4j-agent:myAgent
      parameters:
        tags: orders,inventory
```

This agent sees only tools tagged `orders` or `inventory`. Tools tagged `admin` or left untagged are not visible. Tags are the mechanism for controlling which tools are exposed to which agents.

### Migration

`camel-langchain4j-tools` is deprecated in 4.22. `camel-spring-ai-tools` has been removed. If you have existing tool routes using these components, the migration is straightforward: replace `langchain4j-tools:myTool` with `ai-tool:myTool` and add a `tags` parameter. The route body stays the same.

## The Next Level: `camel-mcp-server`

Unified tooling solves the internal problem. But what about external AI agents? That is where MCP comes in.

The [Model Context Protocol](https://modelcontextprotocol.io/) (MCP) is an open standard for connecting AI models to external tools and data sources. IDE assistants like Claude Desktop, Cursor, and Windsurf support it. So do AI frameworks like LangChain4j, OpenAI, Spring AI, and Quarkus LangChain4j `@RegisterAiService`. With `camel-mcp-server`, your Camel routes become MCP tools that any MCP-compatible client can discover and call.

### How It Works

The `McpServerBridge` is a CamelContext service that watches the `AiToolRegistry`. When a route with an `ai-tool:` consumer starts, the bridge picks it up and exposes it as an MCP tool. When a route stops, the tool is removed and connected clients are notified via `tools/list_changed`.

The bridge selects tools **by tag**. You configure which tags to expose to MCP clients:

```properties
camel.server.mcp.tags=orders,inventory
```

Only tools matching those tags are visible over MCP. Untagged tools and tools with other tags are never exposed. This is a security boundary: external MCP clients are untrusted senders, so you control exactly which tools they can see.

### Architecture

Two modules work together:

- **`camel-mcp-server-api`** contains the `McpServerBridge`, the `McpServerEngine` SPI, and a conformance test kit. It has no dependency on any specific HTTP server.
- **`camel-mcp-server`** provides a Vert.x-based engine for Camel Main and JBang, built on top of the [MCP Java SDK](https://modelcontextprotocol.io/sdk/java).

The SPI design follows the same pattern as Camel's `PlatformHttpEngine`. Each runtime provides its own engine backed by its native MCP stack:

```
┌───────────────────┐ ┌────────────────────────┐ ┌───────────────────┐
│  camel-mcp-server │ │camel-quarkus-mcp-server│ │camel-mcp-server-  │
│   (Main / JBang)  │ │      (Quarkus)         │ │  starter (Boot)   │
│                   │ │                        │ │                   │
│  Vert.x engine    │ │  quarkus-mcp-server    │ │  Spring AI MCP    │
│  + MCP Java SDK   │ │  + ToolManager API     │ │  server           │
└─────────┬─────────┘ └───────────┬────────────┘ └─────────┬─────────┘
          │                       │                        │
          └───────────────────────┼────────────────────────┘
                                  │
                    ┌─────────────┴─────────────┐
                    │    camel-mcp-server-api   │
                    │  (McpServerBridge + SPI)  │
                    └───────────────────────────┘
```

- **Camel Quarkus** uses the [Quarkus MCP server](https://docs.quarkiverse.io/quarkus-mcp-server/dev/) extension and its programmatic `ToolManager` API. The MCP Java SDK and Reactor never reach the classpath.
- **Camel Spring Boot** uses the [Spring AI MCP server](https://docs.spring.io/spring-ai/reference/api/mcp/mcp-server-boot-starter-docs.html). Camel tools coexist with Spring AI's native `@McpTool` beans on the same server.
- **Camel Main / JBang** uses the Vert.x-based engine from `camel-mcp-server`, built on top of the [MCP Java SDK](https://modelcontextprotocol.io/sdk/java).

### Runtime Configuration

Each runtime uses its own property namespace for the Camel MCP bridge, and delegates serving concerns (path, transport, auth) to its native MCP stack.

#### Camel Main / JBang

```properties
# Camel bridge
camel.server.mcp.tags=weather
camel.server.mcp.tool-timeout=20000
```

Serving is handled by the built-in Vert.x engine on the platform HTTP port.

#### Quarkus

```properties
# Camel bridge
quarkus.camel.mcp-server.tags=weather
quarkus.camel.mcp-server.tool-timeout=10000

# Serving (quarkus-mcp-server)
quarkus.mcp.server.server-info.name=my-integration-app
quarkus.mcp.server.server-info.version=1.0.0
quarkus.mcp.server.http.root-path=/mcp
```

Quarkus uses the [quarkus-mcp-server](https://github.com/quarkiverse/quarkus-mcp-server) extension. Quarkus-annotated `@Tool` beans and Camel `ai-tool` routes coexist on the same MCP server. Native compilation works out of the box.

#### Spring Boot

```properties
# Camel bridge
camel.mcp-server.tags=weather
camel.mcp-server.tool-timeout=10000

# Serving (Spring AI MCP Server)
spring.ai.mcp.server.protocol=STREAMABLE
spring.ai.mcp.server.name=my-integration-app
spring.ai.mcp.server.version=1.0.0
spring.ai.mcp.server.streamable-http.mcp-endpoint=/mcp
```

Spring Boot uses the Spring AI MCP server. Set `spring.ai.mcp.server.protocol=STREAMABLE` explicitly for streamable HTTP transport. Without it, the auto-configuration falls back to the deprecated SSE transport. Spring AI's `@McpTool` beans and Camel `ai-tool` routes coexist on the same server.

For **stdio transport** (useful for Claude Desktop and similar desktop MCP clients), swap to `spring-ai-starter-mcp-server` (without webmvc) and configure:

```properties
spring.ai.mcp.server.stdio=true
spring.main.web-application-type=none
logging.threshold.console=OFF
```

The Quarkus equivalent uses `quarkus.mcp.server."<default>".http.enabled=false` to disable the HTTP transport.

### Security Built In

The bridge enforces several security rules:

- **Error sanitization.** Raw route exception messages never reach the MCP client. Errors are wrapped in a safe format.
- **Timeout protection.** Each tool call has a bounded execution timeout.
- **Name collision detection.** If two tools share the same name, the bridge refuses to register the duplicate and logs an error.

### End-to-End Example

Here is a complete setup: a Camel route defined as an AI tool, exposed to both a LangChain4j agent and MCP clients in the same application.

```yaml
- route:
    from:
      uri: ai-tool:weather
      parameters:
        tags: weather
        description: "Get current weather for a city"
        parameter.city: string
        parameter.city.description: "The city name"
    steps:
      - to:
          uri: bean:weatherService

# LangChain4j agent using weather tools
- route:
    from:
      uri: direct:askAgent
    steps:
      - to:
          uri: langchain4j-agent:assistant?tags=weather
```

Expose the weather tool to MCP clients using the property matching your runtime:

```properties
# Camel Main / JBang
camel.server.mcp.tags=weather

# Quarkus
quarkus.camel.mcp-server.tags=weather

# Spring Boot
camel.mcp-server.tags=weather
```

With this setup:

- The `langchain4j-agent` producer discovers the `weather` tool via the `AiToolRegistry` and uses it to answer questions.
- Any MCP client connecting to the application discovers the same tool via the MCP protocol and can call it over MCP.
- The tool is defined once. No duplication. No framework-specific code.

Connect any MCP client to this server, and it can check the weather through the same Camel route your LangChain4j agent uses.

## Try It

All of these features ship in Apache Camel 4.22. The `camel-ai-tool` and `camel-mcp-server` components work with Camel Main, JBang, Quarkus, and Spring Boot.

To get started:

1. Add `camel-ai-tool` to your dependencies and define your tools as `ai-tool:` routes with tags and descriptions.
2. Use them from a Camel AI producer (`langchain4j-agent`, `spring-ai-chat`), from a Quarkus `@RegisterAiService` with `@CamelAiTools`, or both.
3. To expose tools over MCP, add your runtime's MCP server dependency (`camel-mcp-server` for Main/JBang, `camel-quarkus-mcp-server` for Quarkus, or `camel-mcp-server-starter` for Spring Boot) and configure the MCP tags (see [Runtime Configuration](#runtime-configuration) above).

Your Camel routes are now AI tools. Define once, use everywhere, serve to any agent.
