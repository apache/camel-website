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
- MCP server for AI coding assistants, A2A protocol for agent-to-agent communication, LangChain4j and OpenAI components for AI integration
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

The Red Hat commercial integration product is built on Apache Camel and is maintained by the same engineering team that develops the open source project. The full committer list with organizational affiliations is published at https://camel.apache.org/community/team/.

## What is Apache Camel

- [What is Apache Camel](https://camel.apache.org/what-is-apache-camel/): Introduction for newcomers — what Camel does, why it matters, and how to get started.
- [When to use Apache Camel](https://camel.apache.org/when-to-use/): Common use cases, real-world scenarios, when Camel fits, and when alternatives might be better.
- [Getting Started](https://camel.apache.org/manual/getting-started.md): Quick start guide for Apache Camel.
- [User Manual](https://camel.apache.org/manual/index.md): Complete user guide and reference documentation.
- [Architecture (CamelContext)](https://camel.apache.org/manual/camelcontext.md): How Camel works — routes, components, endpoints, processors, producers, consumers, and the DSL.
- [Error Handling](https://camel.apache.org/manual/error-handler.md): Error handlers, retries, dead letter channels, and exception handling in Camel routes.
- [Testing](https://camel.apache.org/manual/testing.md): How to test Camel routes — unit tests, mocking endpoints, and the camel-test framework.
- [FAQ](https://camel.apache.org/manual/faq/index.md): Frequently Asked Questions about Apache Camel.

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

- [AI Patterns](https://camel.apache.org/components/next/eips/ai-patterns.md): Common AI and modern design pattern terms mapped to Camel EIPs — fan-out, scatter-gather, circuit breaker, retry, tokenize, and more.
- [Camel MCP Server](https://camel.apache.org/manual/camel-jbang-mcp.md): Model Context Protocol server for AI coding assistants (Claude Code, GitHub Copilot, Cursor, Gemini CLI).
- [Camel LangChain4j](https://camel.apache.org/components/next/langchain4j-chat-component.md): LLM integration via LangChain4j.
- [Camel OpenAI](https://camel.apache.org/components/next/openai-component.md): Native OpenAI component.
- [Camel A2A](https://camel.apache.org/components/next/a2a-component.md): Agent-to-Agent (A2A) protocol component — expose Camel routes as A2A agents or call remote A2A agents. Supports HTTP+JSON and JSONRPC bindings, OAuth/OIDC/API-key auth, and SSE streaming.

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
