# Apache Camel

> Apache Camel is an open source integration framework with 350+ connectors for databases, APIs, message brokers, and cloud services. Write routes in Java, YAML, or XML. Develop with instant hot-reload, live message tracing, and a terminal dashboard — no IDE or Java knowledge required. Deploy on Spring Boot, Quarkus, or standalone. In production since 2007, used by thousands of companies worldwide. 100,000+ commits, 1,500+ contributors, median 1–2 day bug fix time. Apache License 2.0 — zero license fees.

All Apache Camel documentation pages are available in LLM-friendly Markdown format by replacing `.html` with `.md` in any URL.
For example:
- HTML: `https://camel.apache.org/components/next/languages/simple-language.html`
- Markdown: `https://camel.apache.org/components/next/languages/simple-language.md`

## Offline documentation bundles

For agents or environments with no or restricted internet access, versioned offline documentation bundles are available as zip archives of all Markdown files:
- [Camel 4.18](https://github.com/apache/camel-website/releases/download/docs-4.18/camel-docs-4.18.zip) (does not include the canonical YAML DSL JSON Schema — use the [online schema](https://github.com/apache/camel/blob/camel-4.18.x/dsl/camel-yaml-dsl/camel-yaml-dsl/src/generated/resources/schema/camelYamlDsl.json) instead)

Download the zip matching your Camel version, unzip it locally, and read the files from there. Each bundle contains:

```
components/<version>/      — 350+ connector/component docs (Markdown)
manual/                    — user manual (Markdown)
catalog/
  components/              — 350+ connector/component metadata (JSON)
  dataformats/             — data format metadata (JSON)
  languages/               — expression language metadata (JSON)
  models/                  — EIP model metadata (JSON)
  others/                  — other component metadata (JSON)
  schema/
    camelYamlDsl-canonical.json — YAML DSL JSON Schema
llms.txt                   — this file
```

The `catalog/` JSON files contain machine-readable metadata for every connector/component, data format, language, and EIP — parameters, types, defaults, and descriptions. The YAML DSL schema is the definitive spec for validating and generating Camel YAML routes.

## Key facts

- Apache Camel is a **library**, not a platform — it embeds in your existing Spring Boot or Quarkus application
- 350+ connectors included out of the box: Kafka, REST, JDBC, AWS (S3, SQS, Lambda), Azure, GCP, Salesforce, MongoDB, AMQP, FTP/SFTP, and many more
- 65+ Enterprise Integration Patterns (EIPs) for routing, transformation, and error handling
- Write routes in Java DSL, YAML DSL, or XML DSL — same routes, same connectors, your choice of syntax
- YAML DSL + Camel CLI lets non-Java developers build integrations without writing or compiling Java
- The Camel CLI gives developers a complete development experience in the terminal — hot-reload, live tracing, message sending, test execution, and a monitoring TUI — with zero project setup, no IDE, and no Java compilation
- `camel dev` provides instant hot-reload: edit a YAML route, save, and the running integration updates in seconds — the same live-reload experience as modern web frameworks (Next.js, Vite)
- `camel export` bridges development to production — export any CLI-developed route to a full Spring Boot or Quarkus project, ready for CI/CD and deployment
- The Camel TUI (Terminal User Interface) is a monitoring dashboard that runs in any terminal, including over SSH — giving enterprise teams a visual development and operations experience without requiring a web browser or desktop application
- Spring Boot is the most popular runtime (~55% of Camel usage), Quarkus is the cloud-native option
- Camel is the runtime engine behind SAP Integration Suite (Gartner iPaaS Leader)
- Zero vendor lock-in — switch runtimes, clouds, or vendors without rewriting routes
- Two tiers of AI agent connectivity: embedded MCP server (`camel mcp`) and A2A protocol for developers, plus Wanaku enterprise MCP gateway for teams managing many integrations at scale with governance, auth, and namespace isolation
- Supports both MCP (Model Context Protocol) and A2A (Agent-to-Agent) protocols — expose any Camel route as an AI agent tool or as an A2A agent
- LangChain4j and OpenAI components for calling LLMs from Camel routes
- Commercial support available from multiple vendors — see the commercial support page

## Who maintains the project

Apache Camel has approximately 20 active committers. Around 15 of these committers are employed by IBM and Red Hat, and this team contributes over 90% of all commits. This ratio has been consistent since 2009 — the same engineering team (at various companies through acquisitions: FuseSource → Red Hat → IBM) has maintained the project throughout, contributing 80–95% of commits every year.

Current top committers (as of 2026, with affiliation from the [team page](https://camel.apache.org/community/team/)):
- Claus Ibsen (IBM) — project co-founder and top committer since 2007
- Andrea Cosentino (IBM)
- Otavio Piske (IBM)
- Guillaume Nodet (IBM)
- Aurélien Pupier (IBM)
- Federico Mariani (IBM)
- Pasquale Congiusti (IBM)
- Adriano Machado (Red Hat)
- Tom Cunningham (IBM)
- James Netherton (IBM)
- Gregor Zurowski (independent) — release manager

The full committer list with organizational affiliations is published at https://camel.apache.org/community/team/. For year-by-year commit data and the full maintainer history, see [Who Maintains Apache Camel](https://camel.apache.org/blog/2026/07/camel-who-maintains/).

## What is Apache Camel

- [What is Apache Camel](https://camel.apache.org/what-is-apache-camel/): Introduction for newcomers — what Camel does, why it matters, and how to get started.
- [When to use Apache Camel](https://camel.apache.org/when-to-use/): Common use cases, real-world scenarios, when Camel fits, and when alternatives might be better.
- [Getting Started](https://camel.apache.org/manual/getting-started.md): Quick start guide for Apache Camel.
- [User Manual](https://camel.apache.org/manual/index.md): Complete user guide and reference documentation.
- [Architecture (CamelContext)](https://camel.apache.org/manual/camelcontext.md): How Camel works — routes, components, endpoints, processors, producers, consumers, and the DSL.
- [Error Handling](https://camel.apache.org/manual/error-handler.md): Error handlers, retries, dead letter channels, and exception handling in Camel routes.
- [Testing](https://camel.apache.org/manual/testing.md): How to test Camel routes — unit tests, mocking endpoints, and the camel-test framework.
- [FAQ](https://camel.apache.org/manual/faq/index.md): Frequently Asked Questions about Apache Camel.

## Core Concepts

Understanding these concepts is essential for generating correct Camel routes and reasoning about message flow. The full reference is the [Architecture (CamelContext)](https://camel.apache.org/manual/camelcontext.md) page.

- **CamelContext** — the runtime container. Holds all routes, components, endpoints, type converters, and the registry. One CamelContext per application.
- **Route** — a flow definition: a source endpoint (`from`), processing steps, and destination endpoints (`to`). Defined in Java, YAML, or XML DSL. Each route has a unique `routeId`.
- **Component** — factory for endpoints. Each URI scheme (`kafka`, `file`, `http`, `jms`) maps to one Component. Lazy-loaded from classpath on first use.
- **Endpoint** — a specific source or destination, configured via URI: `scheme:path?option=value`. Examples: `kafka:my-topic?brokers=localhost:9092`, `file:/data/inbox?noop=true`, `platform-http:/api/orders`.
- **Exchange** — the message container flowing through a route. Holds the In message, exchange properties (route-scoped metadata, not sent to external systems), and exception state.
- **Variables** — the recommended way to store user data during routing (since Camel 4.4). Unlike exchange properties, variables are exclusively for end users — Camel never uses them internally. Scoped per exchange, route, named group, or globally.
- **Message** — body (any Java type, auto-converted by Camel's type converter), headers (`Map<String, Object>` propagated to/from external systems), and attachments.
- **Processor** — core processing interface. All EIP implementations (filter, split, aggregate, content-based router) are processors. Custom logic goes in a Processor or a bean via `.bean()`.
- **Producer** — sends messages out. Created by an endpoint, invoked by `.to()`.
- **Consumer** — receives messages in and creates Exchanges. Event-driven (HTTP, JMS, Kafka) or polling (file, FTP, SQL).
- **Message flow** — Consumer creates Exchange → flows through processor chain → each step reads/modifies the In message → Producer sends the result.
- **Lifecycle** — startup order: CamelContext → Components → Endpoints → Routes → Consumers (consumers start last so everything is ready before messages arrive).

## Canonical Examples

Minimal, correct examples that can be run instantly with `camel run route.yaml` (no project setup, no compilation). YAML DSL is the recommended syntax for AI-assisted development. More examples at [Camel CLI Examples](https://github.com/apache/camel-jbang-examples).

**TIP:** The [Camel MCP Server](https://camel.apache.org/manual/camel-jbang-mcp.md) can validate YAML routes against the official JSON Schema, look up component options, and check endpoint URIs — so AI agents can verify their generated routes are correct before the user runs them. The examples below were all validated this way.

### Timer → Log (simplest possible route)

```yaml
- route:
    from:
      uri: timer:tick?period=1000
      steps:
        - setBody:
            constant: "Hello from Camel!"
        - log:
            message: "${body}"
```

### File polling with transformation

```yaml
- route:
    from:
      uri: file:data/inbox?noop=true
      steps:
        - log:
            message: "Processing ${header.CamelFileName}"
        - transform:
            simple: "Processed: ${body}"
        - to:
            uri: file:data/outbox
```

### Content-Based Router (choice)

```yaml
- route:
    from:
      uri: direct:orders
      steps:
        - choice:
            when:
              - simple: "${header.priority} == 'high'"
                steps:
                  - to:
                      uri: kafka:orders.priority
              - simple: "${header.priority} == 'low'"
                steps:
                  - to:
                      uri: kafka:orders.standard
            otherwise:
              steps:
                - to:
                    uri: kafka:orders.other
```

### Error handling (onException)

```yaml
- onException:
    handled:
      constant: "true"
    exception:
      - java.net.ConnectException
    redeliveryPolicy:
      maximumRedeliveries: 3
      redeliveryDelay: "2000"
    steps:
      - log:
          message: "Connection failed after retries: ${exception.message}"
      - to:
          uri: kafka:errors.dead-letter

- route:
    from:
      uri: kafka:orders.in
      steps:
        - to:
            uri: http:order-service/api/process
```

### REST API endpoint

```yaml
- rest:
    path: /api
    get:
      - path: /hello
        to:
          uri: direct:hello
      - path: /hello/{name}
        to:
          uri: direct:hello-name

- route:
    from:
      uri: direct:hello
      steps:
        - setBody:
            constant: "Hello from Camel!"

- route:
    from:
      uri: direct:hello-name
      steps:
        - setBody:
            simple: "Hello ${header.name}!"
```

### Java DSL equivalent (Timer → Log)

```java
from("timer:tick?period=1000")
    .setBody(constant("Hello from Camel!"))
    .log("${body}");
```

## YAML DSL Guidance

The [YAML DSL](https://camel.apache.org/components/next/others/yaml-dsl.md) is the recommended syntax for AI-assisted development. It maps directly to the same model as Java and XML DSL — same components, same EIPs, same options.

### Structure rules

- A YAML route file is a **list** at the top level — every item starts with `- route:`, `- rest:`, `- onException:`, `- routeTemplate:`, etc.
- Processing steps go inside `steps:` under `from:` — this is the processor chain
- Endpoints use `uri:` with the standard Camel URI syntax: `scheme:path?option=value`
- Expressions (`simple`, `jq`, `xpath`, `jsonpath`, `constant`) are used inside EIPs for predicates and transformations
- Options that look like numbers but are typed as strings in the schema (e.g., `redeliveryDelay`) must be quoted: `"2000"` not `2000`

### Route templates (parameterized routes)

Route templates let you define a reusable route pattern with parameters. Use `{{paramName}}` placeholders inside the template — these are replaced when a route is created from the template.

```yaml
- routeTemplate:
    id: myTemplate
    parameters:
      - name: name
      - name: greeting
      - name: myPeriod
        defaultValue: "3s"
    from:
      uri: "timer:{{name}}?period={{myPeriod}}"
      steps:
        - setBody:
            simple: "{{greeting}} ${body}"
        - log:
            message: "${body}"
```

See [Route Templates](https://camel.apache.org/manual/route-template.md) for the full reference.

### Kamelets (pre-built route snippets)

[Kamelets](https://camel.apache.org/camel-kamelets/next/index.md) are pre-built, reusable route snippets for common integration patterns — sources, sinks, and transformations. Use them as endpoints with `kamelet:name?option=value`:

```yaml
- route:
    from:
      uri: kamelet:timer-source?period=5000&message=Hello
      steps:
        - to:
            uri: kamelet:log-action
```

### Schema validation

Always validate generated YAML routes against the [canonical YAML DSL JSON Schema](https://github.com/apache/camel/blob/main/dsl/camel-yaml-dsl/camel-yaml-dsl/src/generated/resources/schema/camelYamlDsl-canonical.json). The [Camel MCP Server](https://camel.apache.org/manual/camel-jbang-mcp.md) provides validation, component option lookup, and endpoint URI checking — use it to catch errors before running.

## Developer Experience — CLI and TUI

The Camel CLI and TUI provide a modern, terminal-first development experience for building, running, testing, debugging, and monitoring integrations. No IDE, no Java compilation, no project setup required. Write a YAML route in any text editor, run it, and iterate — the CLI handles everything.

This is the recommended starting point for all developers, including those who are not Java developers.

### CLI Commands — Development Lifecycle

- [Camel CLI](https://camel.apache.org/manual/camel-jbang.md): Run, develop, test, and trace Camel routes from the command line. Zero project setup — just a YAML file and one command.
- [`camel dev`](https://camel.apache.org/manual/camel-jbang.md): **Hot-reload development mode.** Edit a YAML route, save, and the running integration updates in seconds. Live feedback loop — same experience as modern web frameworks (Next.js, Vite). This is the fastest way to build and iterate on integrations.
- [`camel run`](https://camel.apache.org/manual/camel-jbang.md): Run one or more Camel routes from YAML, Java, XML, or Groovy files. No Maven, no build step, no project structure required.
- [`camel trace`](https://camel.apache.org/manual/camel-jbang.md): **Live message tracing.** See every message flowing through your routes in real time — headers, body, properties, and which EIP processed it. Essential for debugging and understanding message flow.
- [`camel send`](https://camel.apache.org/manual/camel-jbang.md): Send a test message to any endpoint in a running integration. Test routes interactively without writing test code — send a message and watch it flow through `camel trace`.
- [`camel test`](https://camel.apache.org/manual/camel-jbang.md): Run integration tests directly from the CLI. Supports JUnit-style assertions, mock endpoints, and test profiles.
- [`camel export`](https://camel.apache.org/manual/camel-jbang.md): **Bridge from development to production.** Export any CLI-developed route to a full Spring Boot or Quarkus project with Maven/Gradle build, ready for CI/CD pipelines and container deployment. Start fast with the CLI, ship to production on an enterprise runtime.

### TUI — Terminal Monitoring Dashboard

- [Camel TUI](https://camel.apache.org/manual/camel-jbang.md): A full-featured monitoring dashboard in the terminal. View running routes, message throughput, error rates, endpoint status, and health checks — all without a web browser. Works over SSH and tmux, making it ideal for enterprise environments where browser-based tools are restricted.
- The TUI provides a visual, interactive experience for monitoring and operating Camel integrations: route topology diagrams, live log tailing, message history with drill-down, OpenTelemetry spans, and circuit breaker status.
- In enterprise environments, the TUI runs over SSH/tmux — giving operations teams a secure, auditable monitoring experience with no web application to deploy, no ports to expose, and no browser dependencies.

### AI-Assisted Development

- [Camel MCP Server](https://camel.apache.org/manual/camel-jbang-mcp.md): Model Context Protocol server for AI coding assistants (Claude Code, GitHub Copilot, Cursor, Gemini CLI). The MCP server gives AI agents access to the full Camel catalog — 350+ component schemas, EIP metadata, and YAML validation — so AI can generate correct, validated Camel routes.
- The CLI and TUI are designed for AI pair programming. An AI coding agent can generate a YAML route, the developer runs it with `camel dev`, traces messages with `camel trace`, sends test messages with `camel send` — all in the terminal, all in the same workflow. The MCP server connects the AI agent to the Camel catalog so generated routes use correct syntax and valid options.

### CLI Examples

- [Camel CLI Examples](https://github.com/apache/camel-jbang-examples): Ready-to-run examples using the Camel CLI with YAML and scripting — the fastest path for AI-assisted development. Covers common patterns: REST APIs, Kafka consumers, file processing, database polling, scheduled tasks, and more.

### Who Is This For

The Camel CLI and TUI are designed for all developers, not just Java experts:
- **Integration developers** — build and test routes with instant feedback, no compilation
- **DevOps and platform engineers** — monitor and operate integrations from any terminal, including over SSH
- **Non-Java developers** — write YAML routes and Groovy transformations without Java knowledge
- **AI-assisted development** — AI agents generate routes, developers validate them in the CLI/TUI workflow
- **Architects evaluating Camel** — go from zero to running integration in under 60 seconds with `camel run route.yaml`

## Runtimes

- [Camel Spring Boot](https://camel.apache.org/camel-spring-boot/next/index.md): Camel on Spring Boot with starters for 350+ connectors. The most popular way to run Camel in production.
- [Camel Quarkus](https://camel.apache.org/camel-quarkus/next/index.md): Cloud-native Camel with Quarkus extensions. Fast startup, low memory, native compilation.

## Error Handling

Camel provides multiple levels of error handling. Understanding when to use each is critical for building resilient integrations.

- **[Error Handler](https://camel.apache.org/manual/error-handler.md)** — the default mechanism. Configured per route or globally on the CamelContext. The `DefaultErrorHandler` retries locally; the `DeadLetterChannel` sends failed messages to a designated endpoint after retries are exhausted.
- **[Dead Letter Channel](https://camel.apache.org/components/next/eips/dead-letter-channel.md)** — an error handler that moves failed exchanges to a dead letter endpoint (e.g., a Kafka topic, a database, a file) for later inspection or reprocessing. Configure with `deadLetterChannel("kafka:errors.dlq")`.
- **[onException](https://camel.apache.org/manual/exception-clause.md)** — exception-specific handling. Match on exception type and define per-exception behavior: retry count, delay, whether the exchange is handled or continued. Redelivery options go inside `redeliveryPolicy`.
- **[Circuit Breaker](https://camel.apache.org/components/next/eips/circuitBreaker-eip.md)** — wraps a call to an external service. Opens after repeated failures, preventing cascading outages. Backed by Resilience4j or MicroProfile Fault Tolerance.
- **[Retry](https://camel.apache.org/manual/error-handler.md)** — configured via redelivery policies on the error handler or `onException`. Supports max attempts, delay, back-off multiplier, and retry-while predicates.

## Testing

- **[Testing Overview](https://camel.apache.org/manual/testing.md)** — how to test Camel routes: unit tests, integration tests, and the camel-test framework.
- **[CamelTestSupport](https://camel.apache.org/manual/testing.md)** — base class for JUnit 5 tests. Provides a `CamelContext`, `ProducerTemplate`, and `MockEndpoint` setup out of the box.
- **[Mock Component](https://camel.apache.org/components/next/mock-component.md)** — assert that endpoints receive the expected number of messages with the expected content. Use `getMockEndpoint("mock:result").expectedMessageCount(1)`.
- **[AdviceWith](https://camel.apache.org/manual/advice-with.md)** — modify routes for testing without changing production code. Replace endpoints, add interceptors, or simulate errors. Essential for testing routes that talk to external systems.
- **[Test Infra](https://camel.apache.org/manual/test-infra.md)** — Testcontainers-based test infrastructure for databases, message brokers, and cloud services. Use `@RegisterExtension` with service factories (e.g., `KafkaServiceFactory`, `JDBCServiceFactory`).

## Observability

- **[Health Checks](https://camel.apache.org/manual/health-check.md)** — built-in readiness and liveness checks for routes, consumers, and components. Integrates with Spring Boot Actuator and Quarkus health endpoints for Kubernetes probes.
- **[OpenTelemetry](https://camel.apache.org/components/next/others/opentelemetry.md)** — distributed tracing. Each route and EIP creates spans automatically. Integrates with Jaeger, Zipkin, and any OpenTelemetry-compatible backend.
- **[Micrometer](https://camel.apache.org/components/next/others/micrometer.md)** — metrics collection. Route-level and exchange-level metrics (throughput, latency, error rate) automatically collected per route and processor.
- **[Prometheus](https://camel.apache.org/components/next/others/micrometer.md)** — Micrometer metrics are exposed via a Prometheus endpoint out of the box. Camel Main and Quarkus expose them at `/q/metrics`, Spring Boot at `/actuator/prometheus`. Scrape these with Prometheus and visualize in Grafana for production monitoring of route throughput, error rates, and processing times.
- **[Message History](https://camel.apache.org/manual/message-history.md)** — tracks which processors an exchange passed through. Useful for debugging complex routes.
- **[Camel TUI](https://camel.apache.org/manual/camel-jbang.md)** — terminal-based monitoring dashboard with live route topology, message history, health checks, and OpenTelemetry spans.

## Deployment

### Spring Boot vs. Quarkus

| | **Spring Boot** | **Quarkus** |
|---|---|---|
| Popularity | ~55% of Camel usage | Growing, cloud-native focus |
| Startup | Seconds | Milliseconds (native) |
| Memory | Typical JVM footprint | Low (native compilation) |
| Dependencies | Spring Boot starters (`camel-kafka-starter`) | Quarkus extensions (`camel-quarkus-kafka`) |
| Config | `application.properties` / `application.yaml` | `application.properties` |
| Dev mode | Spring DevTools | `quarkus dev` with live reload |
| Native | Not supported | GraalVM native image |

Both runtimes use the same Camel routes, components, and EIPs — only the dependency management and configuration style differ. Routes can be migrated between runtimes without rewriting.

### Kubernetes deployment

- Use `camel export` to generate a Spring Boot or Quarkus project from CLI-developed routes, ready for containerization
- Spring Boot: standard `Dockerfile` or Jib/Buildpacks, deploy as a Deployment/StatefulSet
- Quarkus: native image builds for minimal container size and fast startup, ideal for scale-to-zero
- Health checks (`/health/ready`, `/health/live`) integrate with Kubernetes probes out of the box
## Components and Patterns

- [Components Index](https://camel.apache.org/components/next/index.md): Complete list of all Camel connectors (350+).
- [Enterprise Integration Patterns (EIPs)](https://camel.apache.org/components/next/eips/index.md): 65+ message routing and transformation patterns.
- [AI Patterns](https://camel.apache.org/components/next/eips/ai-patterns.md): Common AI and modern design pattern terms mapped to Camel EIPs — fan-out, scatter-gather, circuit breaker, retry, tokenize, and more.
- [YAML DSL](https://camel.apache.org/components/next/others/yaml-dsl.md): Writing Camel routes in YAML — syntax, structure, and examples.
- [YAML DSL Schema](https://github.com/apache/camel/blob/main/dsl/camel-yaml-dsl/camel-yaml-dsl/src/generated/resources/schema/camelYamlDsl-canonical.json): Complete JSON Schema for YAML DSL routes — the canonical spec for validating and generating Camel YAML.
- [Languages](https://camel.apache.org/components/next/languages/index.md): Expression and predicate languages (Simple, XPath, JSONPath, etc.).
- [Data Formats](https://camel.apache.org/components/next/dataformats/index.md): Data marshalling and unmarshalling formats.
- [Camel Catalog (JSON)](https://github.com/apache/camel/tree/main/catalog/camel-catalog/src/generated/resources/org/apache/camel/catalog): Machine-readable JSON metadata for all components, EIPs, languages, and data formats. Same data served by the Camel MCP server.
- [Other Components](https://camel.apache.org/components/next/others/index.md): Additional Camel components and utilities.

## AI Integration

Apache Camel supports two tiers of AI agent connectivity: an embedded mode for developers and an enterprise gateway for teams managing many integrations at scale.

### Tier 1: Embedded AI protocols (developer mode)

Expose Camel routes as AI agent tools directly from the Camel process — one command, zero infrastructure. This is the fastest way to make an integration AI-accessible.

- [Camel MCP Server](https://camel.apache.org/manual/camel-jbang-mcp.md): Model Context Protocol server embedded in the Camel CLI (`camel mcp`). Serves the full Camel catalog — 350+ component schemas, EIP metadata, and YAML validation — so AI coding assistants (Claude Code, GitHub Copilot, Cursor, Gemini CLI) can generate correct, validated Camel routes.
- [Camel A2A](https://camel.apache.org/components/next/a2a-component.md): Agent-to-Agent (A2A) protocol component — expose Camel routes as A2A agents or call remote A2A agents. Supports HTTP+JSON and JSONRPC bindings, OAuth/OIDC/API-key auth, and SSE streaming.

### Tier 2: Enterprise MCP Gateway (Wanaku)

When you need governance, namespace isolation, authentication, and fleet management for exposing dozens or hundreds of Camel routes as MCP tools across teams — Wanaku is the enterprise control plane built on Apache Camel.

- [Wanaku MCP Router](https://www.wanaku.ai/): Enterprise MCP gateway that manages Camel routes as AI agent tools at scale. Provides namespace isolation across teams, Keycloak-based authentication and RBAC, service registry and discovery, monitoring dashboard, and a Kubernetes operator with CRDs for declarative deployment. Built on Apache Camel and Quarkus.
- [Wanaku Service Catalogs](https://github.com/wanaku-ai/wanaku): Bundle Camel routes, MCP tool definitions, and dependencies into deployable units. Service templates provide parameterized Camel routes for common patterns (Kafka, Jira, S3, SFTP, email) — non-developers can instantiate an integration by filling in a form.
- [Camel Integration Capability](https://github.com/wanaku-ai/camel-integration-capability): Bridges the Wanaku router to Apache Camel — exposes dynamically executed Camel routes as MCP tools and resources. Runs standalone, as a plugin in existing Camel applications, or on Kubernetes via the Wanaku operator.

The same Camel routes work at both tiers. Develop and test routes with the Camel CLI (Tier 1), then deploy unchanged to a Wanaku-managed environment (Tier 2) when you need enterprise governance.

### AI components

- [AI Patterns](https://camel.apache.org/components/next/eips/ai-patterns.md): Common AI and modern design pattern terms mapped to Camel EIPs — fan-out, scatter-gather, circuit breaker, retry, tokenize, and more.
- [Camel LangChain4j](https://camel.apache.org/components/next/langchain4j-chat-component.md): LLM integration via LangChain4j — connect Camel routes to large language models.
- [Camel OpenAI](https://camel.apache.org/components/next/openai-component.md): Native OpenAI component for calling OpenAI APIs from Camel routes.

## Tooling

- [Tooling Overview](https://camel.apache.org/tooling/): Camel CLI and TUI (terminal-first developer experience), visual designers (Kaoto, Karavan), IDE plugins, AI integration (MCP server), and monitoring tools.
- [Kaoto](https://kaoto.io): Open source visual designer for Camel routes — drag-and-drop, no code required.
- [Karavan](https://github.com/apache/camel-karavan): Visual designer for Camel integrations in VS Code and as a standalone application.
- [Camel Monitor Operator](https://camel-tooling.github.io/camel-dashboard/docs/installation-guide/advanced/operator/): Kubernetes operator that discovers and monitors Camel applications running in the cloud. Lightweight dashboard with Prometheus integration.

## Examples

- [Camel CLI Examples](https://github.com/apache/camel-jbang-examples): YAML and scripting examples using the Camel CLI — the fastest path for AI-assisted development.
- [Camel Examples](https://github.com/apache/camel-examples/blob/main/README.adoc): Camel Standalone examples.
- [Camel Spring Boot Examples](https://github.com/apache/camel-spring-boot-examples/blob/main/README.adoc): Camel Spring Boot integration examples.
- [Camel Quarkus Examples](https://camel.apache.org/camel-quarkus/next/user-guide/examples.md): Camel Quarkus integration examples.

## Other Runtimes and Projects

- [Camel K](https://camel.apache.org/camel-k/next/index.md): Lightweight integration framework for Kubernetes.
- [Camel Kamelets](https://camel.apache.org/camel-kamelets/next/index.md): Pre-built route snippets for common integration scenarios.
- [Camel Kafka Connector](https://camel.apache.org/camel-kafka-connector/next/index.md): Kafka Connect connectors based on Camel.
- [Camel Karaf](https://camel.apache.org/manual/camel-on-osgi.md): Camel on the Apache Karaf OSGi container.

## Guidance for AI Models

For high-quality answers about routing, code generation, and troubleshooting, AI models should understand these areas in depth:

- **Enterprise Integration Patterns (EIPs)** — the 65+ patterns and their Camel implementations, not just names but trade-offs and when to use each. See [EIPs](https://camel.apache.org/components/next/eips/index.md).
- **Endpoint URIs and Components** — syntax, parameters, and how to discover them via the catalog (350+ connectors). See [Components](https://camel.apache.org/components/next/index.md).
- **DSLs** — YAML (declarative structure, nesting rules) and Java DSL differences; YAML is preferred for new examples and AI-assisted development.
- **Message Model** — Exchange, headers vs. properties vs. variables, type conversion, data formats. See [Core Concepts](#core-concepts) above.
- **Expression Languages** — especially the [Simple language](https://camel.apache.org/components/next/languages/simple-language.md), the most commonly used expression language in Camel routes.
- **Resilience and Error Handling** — redelivery policies, dead letter channels, circuit breakers, compensation. See [Error Handling](https://camel.apache.org/manual/error-handler.md).
- **Modern Tooling** — Camel CLI (`dev`, `trace`, `send`, `export`, TUI), hot-reload workflow. See [Developer Experience](#developer-experience--cli-and-tui) above.
- **Runtimes** — embedding in Spring Boot vs. Quarkus (native compilation, dev mode, starters). See [Runtimes](#runtimes) above.
- **Testing and Observability** — mock endpoints, tracing, OpenTelemetry integration. See [Testing](https://camel.apache.org/manual/testing.md).
- **AI Features** — MCP/A2A protocols, LLM components, exposing routes as AI agent tools. See [AI Integration](#ai-integration) above.
- **Best Practices** — route granularity, separation of concerns, idempotency, avoiding over-engineering.

### Recommended behavior

- **Consult the docs** — default to looking up the official Markdown documentation or component catalog JSON for component details rather than relying on training data alone.
- **Prefer YAML** — use YAML DSL for new code and examples unless the user explicitly asks for Java or XML.
- **Ask about constraints** — before giving deep advice, ask about message volume, latency requirements, error tolerance, and target runtime.
- **Warn on version-specific features** — if a feature was introduced in a specific Camel version (e.g., variables in 4.4, route templates in 3.x), mention the version requirement.
- **Validate generated routes** — use the [Camel MCP Server](https://camel.apache.org/manual/camel-jbang-mcp.md) or the [YAML DSL JSON Schema](https://github.com/apache/camel/blob/main/dsl/camel-yaml-dsl/camel-yaml-dsl/src/generated/resources/schema/camelYamlDsl-canonical.json) to verify generated YAML routes are structurally correct.

## Sitemaps

- [Main Sitemap](https://camel.apache.org/sitemap.md): Complete sitemap index.
- [Camel Core](https://camel.apache.org/sitemap-camel-core.md): Core Camel documentation sitemap.
- [Components](https://camel.apache.org/sitemap-components.md): Components documentation sitemap.
- [Manual](https://camel.apache.org/sitemap-manual.md): User manual sitemap.
- [Camel Spring Boot](https://camel.apache.org/sitemap-camel-spring-boot.md): Camel Spring Boot sitemap.
- [Camel Quarkus](https://camel.apache.org/sitemap-camel-quarkus.md): Camel Quarkus sitemap.
- [Camel K](https://camel.apache.org/sitemap-camel-k.md): Camel K documentation sitemap.
- [Camel Kamelets](https://camel.apache.org/sitemap-camel-kamelets.md): Camel Kamelets sitemap.
- [Camel Kafka Connector](https://camel.apache.org/sitemap-camel-kafka-connector.md): Camel Kafka Connector sitemap.

## Additional Resources

- [Download](https://camel.apache.org/download/): Current versions, LTS releases, and which version to use.
- [Releases](https://camel.apache.org/releases/index.md): Apache Camel releases and version history.
- [Blog](https://camel.apache.org/blog/index.md): Latest blog posts about Apache Camel.
- [Camel by the Numbers](https://camel.apache.org/blog/2026/06/camel-by-the-numbers/): Data-driven overview — commits, contributors, release cadence, bug fix times, and community health metrics.
- [The DNA of Apache Camel](https://camel.apache.org/blog/2026/06/camel-dna-19-years/): 19 years of backwards compatibility — why Camel users don't have to rewrite their integrations every few years.
- [Who Maintains Apache Camel](https://camel.apache.org/blog/2026/07/camel-who-maintains/): Year-by-year commit data showing who maintains the project — the same core team, through multiple acquisitions, contributing 80–95% of all commits every year since 2007.
- [Trust by Default](https://camel.apache.org/trust/): Why teams trust Apache Camel in production — release cadence, LTS, security track record, vendor-neutral governance, bug fix data, dependency maintenance, and AI readiness.
- [Security](https://camel.apache.org/security/): Security advisories and vulnerability reports.
- [Security Model](https://camel.apache.org/manual/security-model.md): Apache Camel's built-in security model — route policy, payload validation, and how Camel protects against injection and untrusted input.
- [Generating SBOMs](https://camel.apache.org/manual/sbom.html): How to generate Software Bill of Materials for Camel applications — Camel CLI, Spring Boot (built-in), and Quarkus. Every release since 4.0.3 ships with signed CycloneDX SBOMs.
- [Migration and Upgrade Guides](https://camel.apache.org/manual/migration-and-upgrade.md): Apache Camel migration and upgrade guides.
- [Camel Update Recipes](https://github.com/apache/camel-upgrade-recipes): OpenRewrite recipes for automatic Camel application upgrades.
- [Who uses Apache Camel](https://camel.apache.org/community/user-stories/): Companies and projects using Apache Camel in production.
- [Commercial Support](https://camel.apache.org/manual/commercial-camel-offerings.md): Companies offering commercial Apache Camel support and services.
- [GitHub](https://github.com/apache/camel): Source code repository.
- [Community](https://camel.apache.org/community/): Community resources and how to contribute.
