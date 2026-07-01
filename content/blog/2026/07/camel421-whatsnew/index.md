---
title: "Apache Camel 4.21 What's New"
date: 2026-07-03
draft: false
authors: [ davsclaus, squakez ]
categories: [ "Releases" ]
keywords: ["apache camel", "whats new", "camel 4", "release", "camel 4.21", "integration framework"]
preview: "Details of what we have done in the Camel 4.21 release."
---

Apache Camel 4.21 has just been [released](/blog/2026/07/RELEASE-4.21.0/).

This release introduces a large set of new features and noticeable improvements that we will cover in this blog post.

## Camel Core

### Error Registry

The Error Registry has been enhanced to capture rich exchange data snapshots at error time,
following the same pattern as BacklogTracer. This includes the message body, headers, exchange properties,
and variables — giving you a complete picture of what was happening when the error occurred.

Error registry configuration has moved to a dedicated `camel.errorRegistry.*` prefix:

```properties
camel.errorRegistry.enabled=true
camel.errorRegistry.maximumEntries=100
camel.errorRegistry.timeToLiveSeconds=300
```

The error registry integrates with the route diagram rendering, allowing you to visualize the
exact path a failed exchange took through your routes.

### Route Topology

A new route topology service computes inter-route relationships — which routes send messages to
which other routes (via `direct`, `seda`, `kafka`, etc.). The topology is available through a dev console
and powers the new topology diagram rendering in both the CLI and the embeddable web component.

See the dedicated [Route Topology](/blog/2026/06/camel-route-topology/) blog post for more details.

### Group-Scoped Variables

Variables can now be scoped to a route group. When multiple routes share a `routeGroup`,
they can share variables within that group scope using `variable.group:myVar`:

```java
from("direct:a").routeGroup("myGroup")
    .setVariable("group:counter", simple("${variable.group:counter}++"))
    .to("direct:b");

from("direct:b").routeGroup("myGroup")
    .log("Counter is ${variable.group:counter}");
```

### Exchange Memory Optimization

We made significant work to reduce memory pressure on the `Exchange` object:

- **Copy-on-write headers**: Message headers are now shared across exchange copies (multicast, splitter, etc.)
  and only copied when actually modified, reducing allocation overhead.
- **Lazy initialization**: Several internal data structures on the Exchange are now initialized lazily,
  reducing the baseline memory footprint.
- **O(1) CaseInsensitiveMap**: The default `CaseInsensitiveMap` used for message headers now uses a custom
  hash table with zero-allocation lookups and header key deduplication, making the external
  `camel-headersmap` dependency unnecessary (now deprecated).

### Virtual Threads

When virtual threads are enabled, the `threads()` EIP now honors `maxQueueSize`
for backpressure. Previously, `maxQueueSize` was silently ignored and tasks were accepted unboundedly.

A new `Block` rejected policy has been added to `ThreadPoolRejectedPolicy`, where the caller blocks
until capacity becomes available.

### JSpecify Null Annotations

The `camel-api` module now uses `@NullMarked` and `@Nullable` annotations from JSpecify to document
nullability contracts across the Camel API surface. This enables compile-time null checking with tools like NullAway.

### Simple Language

Several improvements to the Simple language:

- `floor`/`ceil` now return `long` instead of `int` to avoid overflow for large values.
- `range(N)` in csimple now starts at 1 (consistent with the `simple` language).
- The internal implementation has been refactored into domain-aligned builder classes for better maintainability.

## Camel CLI

Camel JBang has been rebranded as **Camel CLI** in the documentation.

### Camel TUI

The Camel TUI (Terminal User Interface) is a new feature currently in heavy development, and we will publish
dedicated blog posts to highlight this feature in more detail. More improvements are coming in the
following releases.

In this release the TUI received many improvements:

- **History tab** — Browse the exchange processing history.
- **Error tab** — View errors captured by the error registry with full exchange snapshots.
- **Shell tab** — An embedded shell for advanced CLI usage directly within the TUI.
- **OpenTelemetry tab** — View distributed traces and spans directly in the TUI.
- **Route diagrams** — Graphical route diagram rendering with live metrics overlay in the TUI.
- **Send Message dialog** — Send test messages to routes directly from the TUI.
- **Screenshot action (Shift+F5)** — Capture the current TUI screen as ASCII art.
- **F2 actions menu** — Quick actions including _Run an example_ and _Run Infra Service_.
- **Notifications** — TUI now shows `(n)` notification counts.

### Embedded MCP Server

The TUI now includes an embedded MCP server that allows AI coding agents to observe and interact
with a running Camel application's screen. New MCP runtime tools provide access to topology, errors,
thread dumps, exchange history, and the ability to stop routes or send messages.

### `camel dev` Alias

A new `camel dev` command has been added as a convenient alias for `camel run --dev`.

### Auto-Detect application.properties

The `camel run` and `camel export` commands now auto-detect `application.properties` (and profile-specific
variants) in the current directory and include them automatically. You no longer need to list the
properties file explicitly on the command line.

### Container-Optimized Docker Export

The `camel export` command now generates Dockerfiles optimized for container image layer caching.
Dependencies (stable) and application code (volatile) are placed in separate Docker layers,
so rebuilds only update the thin application layer.

- **Camel Main**: uses `maven-jar-plugin` with classpath manifest and `maven-dependency-plugin:copy-dependencies`.
- **Spring Boot**: uses Spring Boot's `jarmode=tools extract --layers` for 4-layer Docker images.

### Lazy Plugin Loading

Plugins are now loaded lazily. Built-in commands that do not consume plugins
(such as `camel get`, `camel version`, `camel ps`) skip plugin discovery entirely,
making these commands faster. Plugin classpath resolution is also cached.

### Wrapper Renamed

The `camel wrapper` command now installs scripts as `camel` instead of `camelw`.

### Quarkus Version Auto-Resolution

The default Quarkus Platform version is now determined at runtime by querying the Quarkus Extension Registry,
finding the newest platform compatible with the current Camel version. No more stale hardcoded defaults.

### AI-Friendly Exports

Exported projects now include an `AGENTS.md` file and a _For AI coding assistants_ section in the generated
`readme.md`, linking to the Apache Camel LLM index for better AI coding assistant context.

### Multi architecture, Multi JDK container

In this release we've also worked to start delivering [Camel JBang official Docker container image](https://hub.docker.com/r/apache/camel-jbang) in multiple architectures and JVM. This is nice if you want to use the container image with different architecture or JVM. So far we're supporting **AMD64** (as usual) and **ARM64** (new), **JDK 17** or **JDK 21**.

### Jib profile

We've enabled the **Jib** Maven profile in order to allow you turning your Camel application into a container via Jib very easily. After running the `camel export`, just run:

```
mvn clean package jib:build -Pjib \
    -Djib.to.image=my-registry.io/my-registry-org/my-container:latest \
    -Djib.from.image=eclipse-temurin:21-jdk \
```

You're application will be pushed to the registry and you will be able to run it right away directly from Docker (or Kubernetes, sure).

## Route Diagrams

The new `camel-diagram` component provides route diagram rendering in multiple formats:

- **ASCII art** — Text-based diagrams for CLI and logging with configurable themes.
- **HTML** — Interactive diagrams with an embeddable `<camel-route-diagram>` web component that renders
  routes as SVG with optional live metrics overlay and periodic refresh.
- **Topology** — Inter-route relationship diagrams showing how routes connect to each other.

The component includes a dev console, integrates with the TUI, and can highlight error paths
from the error registry message history.

```properties
# show route diagrams with live counters
camel.diagram.enabled=true
```

## Camel AI

### Agent-to-Agent Protocol (A2A)

A new `camel-a2a` component (Preview) provides support for the
[Agent-to-Agent (A2A) protocol](https://google.github.io/A2A/). As a consumer, it exposes Camel routes
as A2A-compliant agents; as a producer, it calls remote A2A agents. The component also provides an
`a2aSubTask` route step for scoped progress updates.

### Audio Transcription

The `camel-openai` component now supports audio transcription (speech-to-text) via the Whisper API.

The component also now accepts `WrappedFile`, `byte[]`, and `InputStream` bodies for vision models,
so you can pipe files directly from `camel-file`, `camel-ftp`, or `camel-aws2-s3` to an AI model
without conversion issues.

### LangChain4j Structured Output

The `camel-langchain4j-agent` component now supports structured outputs, allowing you to specify a
Java class as the response format. The LLM response is automatically parsed into the specified type.

### MCP Server Improvements

The Camel MCP Server received further improvements:

- **Runtime tools** — New tools for route topology, errors, thread dumps, exchange history,
  stopping routes, and sending messages to running Camel applications.
- **MCP SDK 2.0** — Embraced the new MCP Java SDK 2.0 API.
- **Claude Code plugin** — The Camel MCP Server is now published as a Claude Code plugin.
- **Route diagram tool** — Generate visual route diagrams via MCP, including ASCII diagrams.
- **Leaner responses** — Reduced token consumption by removing verbose descriptions from catalog
  list responses and stripping null fields from JSON responses.

### Tool Argument Filtering

Tool argument headers in `camel-langchain4j-tools`, `camel-langchain4j-agent`, and `camel-spring-ai-tools`
are now filtered against the tool's declared parameter schema. Only declared parameters are set as headers,
preventing undeclared LLM-generated arguments from leaking into the Exchange.

### Multi-Tool Isolation

When the LLM requests multiple tool invocations within a single request, each tool is now invoked on its
own independent copy of the exchange, guaranteeing complete isolation between tool calls.

## Observability

### OpenTelemetry Java Agent in TUI

A new `--open-telemetry-agent` flag for `camel run`/`camel dev` attaches the OpenTelemetry Java Agent
to the Camel process. An embedded OTLP receiver feeds spans directly into the TUI Spans tab — no
external collector needed.

```bash
camel dev myRoute.yaml --open-telemetry-agent
```

### Opentelemetry2 consistency

We've worked to a few adjustment to the Opentelemetry2 component in order to make it more consistent. From this version onward, we've dropped the usage of `ThreadLocal` in favour of the Camel `Exchange` passing mechanism. This is transparent to the users, although it _may_ produce a slighter higher amount of `Spans`.

We've also included a new parameter `includePatterns` which you can use to choose the processors you want to include explicitly in your traces.

### Reduced Span Verbosity

Processors that send to an endpoint (`to`, `toD`, `wireTap`, `enrich`) no longer emit a redundant
processor span wrapping the endpoint event span. This reduces span tree depth and total span count.

### AWS Span Decorators

New span decorators have been added for AWS components, providing better trace context for AWS service calls.

### Baggage Management

The `camel-micrometer-observability` component now supports baggage management for propagating
contextual data across service boundaries.

## Security Hardening

This release includes a comprehensive security hardening effort:

### Header Naming Convention

Exchange header constants across 30+ components have been aligned to the `Camel*` naming convention
(e.g., `kafka.TOPIC` -> `CamelKafkaTopic`). This ensures that framework-internal headers are properly
filtered by the default `HeaderFilterStrategy` at transport boundaries, preventing header injection attacks.

Components affected include: Kafka, Salesforce, CXF, Elasticsearch, OpenSearch, JGroups, Jira, IRC,
OpenStack, Web3j, PDF, Solr, and many more. See the [upgrade guide](/manual/camel-4x-upgrade-guide-4_21.html)
for the complete list.

### Deserialization Hardening

- Default `ObjectInputFilter` now includes JEP-290 graph-shape limits (`maxdepth=20`, `maxrefs=10000`,
  `maxbytes=10485760`) and denies `java.net.**` classes across all deserialization sites.
- JMS `ObjectMessage` support is disabled by default in `camel-jms` and `camel-sjms`.
- Java serialization type converters for `ObjectInput`/`ObjectOutput` have been removed from camel-core.
- Jackson data formats (`camel-jackson`, `camel-jacksonxml`, `camel-jackson-avro`, `camel-jackson-protobuf`)
  now block unsafe polymorphic base types by default.

### Mail Security

The `camel-mail` component now defaults `useHeaderRecipients`, `useHeaderFrom`, `useHeaderSubject`,
and `useHeaderReplyTo` to `false`, preventing untrusted exchange headers from overriding endpoint-configured
mail settings.

### CXF WS-Security Optional

The `cxf-rt-ws-security` dependency in `camel-cxf-soap` is now optional. Most users don't need
WS-Security, and the transitive OpenSAML dependencies hosted on the unreliable `build.shibboleth.net`
repository caused build failures.

## Canonical YAML DSL

A new canonical JSON Schema variant (`camelYamlDsl-canonical.json`) removes all implicit patterns (string
shorthands, inline expressions, `oneOf`/`anyOf`/`not` constructs) to provide a simpler, more predictable
schema for tooling and AI assistants.

A new `camel validate normalize` command rewrites YAML routes from the compact (shorthand) form
to the canonical (explicit) form. Camel also now logs a WARN when YAML routes use compact notation,
encouraging adoption of the canonical style.

The YAML DSL now supports a classpath-discovered extension point for component-provided custom route step
deserializers, enabling optional modules to contribute YAML step names automatically.

## Camel Kafka / Spring Boot

### Spring Kafka Properties Bridge

When using `camel-kafka-starter` with Spring Boot, the standard `spring.kafka.*` properties are now
automatically bridged to the Camel Kafka component. You no longer need to duplicate settings under both
`spring.kafka.*` and `camel.component.kafka.*`.

```properties
# These Spring Boot properties are now automatically picked up by Camel Kafka
spring.kafka.bootstrap-servers=localhost:9092
spring.kafka.consumer.group-id=my-group
spring.kafka.security.protocol=SASL_SSL
```

Explicit `camel.component.kafka.*` settings always take precedence.

### Spring Boot 4.1

Upgraded to Spring Boot 4.1.

## Azure Blob Storage

The `camel-azure-storage-blob` component gained several new operations:

- **Index tags** — Set, get, and find blobs by index tags.
- **Blob versions** — List all versions of blobs in a container with version ID and current-version flag.
- **Immutability policies** — Set immutability policies and legal holds on blobs.
- **Soft-delete recovery** — Undelete soft-deleted blobs.
- **Access tier** — Change the access tier of existing blobs.

## Miscellaneous

The `camel-bindy` component can now handle parse failures gracefully with a new `continueParseOnFailure`
option, substituting default values instead of aborting the entire unmarshal.

The `camel-keycloak` component gained support for Keycloak 26+ Organizations API and token revocation
and session logout operations.

The `camel-nats` component now works properly in JetStream pull mode (previously pull requests were
never issued) and supports manual acknowledgement.

The `camel-mongodb` consumer now exposes the resume token for change streams,
and supports resume strategies for resuming change stream processing from the last known position.

The `camel-milo` (OPC UA) component now supports explicit username and password parameters for
handling special characters, and exposes the underlying Eclipse Milo `OpcUaClient` for custom
DataType handling.

Upgraded many third-party dependencies including Kafka 4.2 client, Kubernetes 7.6 client,
Apache Artemis 2.5, HttpClient 5.6, Testcontainers 2.0.4, and Infinispan 16.2.

Added Java DSL model writer for full-circle DSL transformation — you can now transform routes
between XML/YAML and Java DSL in both directions.

## New Components

- `camel-a2a` - Agent-to-Agent (A2A) protocol integration for AI agents (Preview).
- `camel-shell` - Execute shell commands from Camel routes.

## Removed Components

The following previously deprecated components have been removed:

- `camel-stomp` (unmaintained library since 10+ years)
- `camel-aws-xray` (AWS X-Ray is in maintenance mode since February 2026)
- `camel-guava-eventbus` (deprecated since 4.6)
- `camel-grape` (deprecated since 4.1)
- `camel-elytron` (deprecated since 4.0)
- `camel-github` (replaced by `camel-github2`)

## Deprecated Components

The following components are now deprecated:

- `camel-headersmap` (core now provides equivalent performance)
- `camel-ironmq` (unmaintained since 2017)
- `camel-digitalocean` (unmaintained Java library)
- `camel-irc` (no stable library release since 2007)
- `camel-iec-60870` (NeoScada unmaintained since 2021)
- `camel-paho` (no new release since 2020)
- `camel-reactive-executor-vertx` (experimental, no user feedback)
- `camel-threadpoolfactory-vertx` (experimental, no user feedback)

## Upgrading

Make sure to read the [upgrade guide](/manual/camel-4x-upgrade-guide-4_21.html) if you are upgrading from a previous
Camel version. This release has a large upgrade guide due to the header naming convention alignment across 30+
components and the security hardening changes.

If you are upgrading from, for example, 4.4 to 4.8, then make sure to follow the upgrade guides for each release
in-between, i.e.
4.4 -> 4.5, 4.5 -> 4.6, and so forth.

The Camel Upgrade Recipes tool can also be used to automate upgrading.
See more at: https://github.com/apache/camel-upgrade-recipes

## Release Notes

You can find additional information about this release in the list of resolved JIRA tickets:

- [Release notes 4.21](/releases/release-4.21.0/)

## Roadmap

The next 4.22 LTS release is planned in August.
