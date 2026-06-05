---
title: "Tooling"
---

Apache Camel ships with a rich set of built-in developer tools and is supported by a growing ecosystem of third-party tooling. Whether you prefer the command line, an IDE, a visual editor, or AI-assisted development — there is tooling to help you build, test, debug, and manage your Camel integrations.

## Camel CLI

The Camel CLI, powered by [JBang](https://www.jbang.dev/), lets you get started with Camel instantly — no project setup, no build tool configuration. Install it once, then use the `camel` command to develop, run, test, and export your integrations.

{{< table >}}
| Command | Description |
|---------|-------------|
|`camel run`|Run Camel routes from source files (Java, YAML, XML, etc.) with automatic classpath management|
|`camel dev`|Run in developer mode with hot-reload — changes are picked up automatically without restarting|
|`camel trace`|Live message tracing, step by step through your routes to see how messages are processed|
|`camel send`|Send test messages to running Camel routes for quick testing and debugging|
|`camel test`|Run tests for your Camel routes|
|`camel export`|Export your Camel project to Spring Boot, Quarkus, or standalone Java for production deployment|
{{< /table >}}

See the [Camel CLI documentation](/manual/camel-jbang.html) for installation instructions and detailed usage.

### Camel TUI

The `camel tui` command launches a full terminal-based UI that provides fast, real-time feedback during development — a natural fit for CLI-first and AI-assisted workflows. It gives you route status, message flow, and tracing all in a single terminal view, so you can stay in the flow without switching tools. Ideal for low-code and AI-assisted development where quick iteration matters.

## Camel MCP Server

The [Camel MCP Server](https://github.com/apache/camel-mcp-server) connects Apache Camel to AI coding assistants through the [Model Context Protocol (MCP)](https://modelcontextprotocol.io/). It gives AI tools access to Camel's component catalog, DSL documentation, and integration patterns — so they can help you write, debug, and optimize Camel routes with full context.

Supported AI tools include Claude Code, GitHub Copilot, Gemini CLI, Cursor, Windsurf, and any MCP-compatible assistant.

## AI-Assisted Development

{{< table >}}
| Tool | Description |
|------|-------------|
|[Camel Kit](https://github.com/luigidemasi/camel-kit)|A set of structured slash commands for AI coding assistants that guide you through the complete integration lifecycle — from design and planning to implementation and verification. Supports Claude Code, Gemini CLI, and more.|
{{< /table >}}

## Maven Plugins

For production projects, Camel provides a set of Maven plugins that integrate with your existing build workflow:

{{< table >}}
| Plugin | Description |
|--------|-------------|
|[Camel Maven Plugin](/manual/camel-maven-plugin.html)|The main plugin for running and developing Camel applications from Maven. Goals: `camel:run` (run routes), `camel:dev` (developer mode with hot-reload), `camel:debug` (debug mode for textual route debugging), `camel:prepare-fatjar` (prepare for fat-jar packaging).|
|[Camel Report Maven Plugin](/manual/camel-report-maven-plugin.html)|Validates source code for invalid Camel endpoint URIs, Simple expressions, duplicate route IDs, and generates route coverage reports after unit testing.|
|[Camel YAML DSL Validator Maven Plugin](/manual/camel-yaml-dsl-validator-maven-plugin.html)|Validates YAML DSL route files for syntax errors according to the spec, without needing to run Camel.|
|[Camel Component Maven Plugin](/manual/camel-component-maven-plugin.html)|Assists third-party component developers in generating all necessary metadata and configuration Java classes for custom Camel components.|
|[Camel REST DSL OpenAPI Plugin](/manual/rest-dsl-openapi.html)|Generates REST DSL routes and DTOs from OpenAPI v3 specification files for a contract-first approach.|
{{< /table >}}

## Maven Archetypes

Camel provides [Maven Archetypes](/manual/camel-maven-archetypes.html) to quickly scaffold new projects:

{{< table >}}
| Archetype | Description |
|-----------|-------------|
|camel-archetype-java|Creates a new Camel project using Java DSL|
|camel-archetype-main|Creates a new Camel project using standalone Camel Main|
|camel-archetype-spring|Creates a new Camel project with Spring DSL support|
|camel-archetype-component|Creates a new Camel component|
|camel-archetype-dataformat|Creates a new Camel data format|
|camel-archetype-api-component|Creates a new Camel component that wraps one or more API proxies|
{{< /table >}}

## IDE Plugins and Extensions

{{< table >}}
| Tool | Description |
|------|-------------|
|[Apache Camel IDEA Plugin](https://github.com/camel-idea-plugin/camel-idea-plugin)|Plugin for IntelliJ IDEA to provide a set of Apache Camel related editing capabilities to the code editor. It also provides Camel textual route debugging capabilities.|
|[VS Code Extension Pack for Camel](https://marketplace.visualstudio.com/items?itemName=redhat.apache-camel-extension-pack)|A set of VS Code extensions for developing Camel applications — includes language support, debugging, and more.|
|[Camel Language Server](https://github.com/camel-tooling/camel-language-server)|A [Language Server Protocol](https://github.com/Microsoft/language-server-protocol) implementation that provides Camel DSL smartness (completion, validation, hover, outline). Packaged for [VS Code](https://marketplace.visualstudio.com/items?itemName=redhat.vscode-apache-camel) and [Eclipse Desktop](https://marketplace.eclipse.org/content/language-support-apache-camel).|
|[Camel Debug Adapter](https://github.com/camel-tooling/camel-debug-adapter)|A [Debug Adapter Protocol](https://microsoft.github.io/debug-adapter-protocol/) implementation that provides Camel textual route debugging capabilities. Packaged for [VS Code](https://marketplace.visualstudio.com/items?itemName=redhat.vscode-debug-adapter-apache-camel) and [Eclipse Desktop](https://marketplace.eclipse.org/content/textual-debugging-apache-camel).|
{{< /table >}}

## Visual Editing

{{< table >}}
| Tool | Description |
|------|-------------|
|[Camel Karavan](https://karavan.space/)|Camel Karavan is a visual development tool for Apache Camel that provides a rich graphical editor for designing and deploying integration routes.|
|[Kaoto](https://kaoto.io/)|Kaoto is an integration editor to create and deploy workflows in a visual, low-code way; with developer-friendly features like a code editor and deployments to the cloud.|
{{< /table >}}

## Monitoring and Management

{{< table >}}
| Tool | Description |
|------|-------------|
|[Camel Monitor Operator](https://camel-tooling.github.io/camel-dashboard/docs/installation-guide/advanced/operator/)|A Kubernetes operator that discovers and monitors Camel applications running in the cloud. Provides a lightweight monitoring layer with a GUI dashboard and integrates with advanced monitoring systems like Prometheus.|
|[hawt.io](http://hawt.io)|hawt.io is an open source HTML5 web application for visualizing, managing and tracing Camel routes & endpoints, ActiveMQ brokers, JMX, and much more.|
{{< /table >}}

## Libraries

{{< table >}}
| Tool | Description |
|------|-------------|
|[Forage](https://kaotoio.github.io/forage/)|Opinionated bean factories for Apache Camel — configure data sources, connection factories, AI models, transaction managers, and more via properties instead of Java code. Works with Camel JBang, Spring Boot, and Quarkus.|
{{< /table >}}

---

If you are using or have developed tooling for Apache Camel please add an entry via a [pull request](https://github.com/apache/camel-website); or post to the [mailing list](/community/mailing-list/).
