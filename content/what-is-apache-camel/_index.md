---
title: "What is Apache Camel?"
description: "Apache Camel is an open-source integration framework with 350+ connectors, 65+ enterprise integration patterns, and multiple DSLs including Java, YAML, and XML. It connects applications, services, APIs, and data — whether they live in the cloud, on-premise, or both."
keywords:
- apache camel
- integration framework
- enterprise integration patterns
- EIP
- connectors
- kafka
- spring boot
- quarkus
- yaml dsl
- open source integration
- api integration
- message routing
- MCP server
---

## Apache Camel is an integration framework.

It connects your applications, services, APIs, and data — whether they live in the cloud, on-premise, or both.

---

## Why should I care?

### You probably already have this problem

Every application eventually needs to talk to other systems — databases, message brokers, cloud services, SaaS APIs, legacy systems, files, emails. The question is how.

You can write custom integration code for each connection. Or you can use Camel — which gives you **350+ ready-made connectors** and **65+ integration patterns** so you write the *what*, not the plumbing.

### What it looks like

You write a **route** that says: *take data from here, transform it, and send it there.* Camel handles the connectivity, the protocols, the formats, and the error handling.

**YAML:**

```yaml
- route:
    from:
      uri: kafka:incoming-orders
      steps:
        - log:
            message: "Received order ${body}"
        - to:
            uri: sql:INSERT INTO orders(data) VALUES(:#${body})
```

**Java:**

```java
from("kafka:incoming-orders")
    .log("Received order ${body}")
    .to("sql:INSERT INTO orders(data) VALUES(:#${body})");
```

Read from Kafka, log each order, insert into a database. A few lines that describe *what* should happen — not *how*. It reads like an architecture diagram written as code. Camel handles the Kafka consumer, the JDBC connection, and the error handling.

This declarative style also means AI coding assistants generate reliable Camel routes — the intent is clear, and the [Camel MCP server](#works-with-ai-coding-assistants) provides first-class coding assistance to the AI.

### It runs where you already run

Camel is a library, not a server. It embeds in your application:

- **Spring Boot** — `camel-spring-boot-starter`, auto-configuration, Spring beans, dependency injection. The most popular choice for running Camel in production.
- **Quarkus** — cloud-native, GraalVM-optimized, sub-second startup, low memory footprint. Ideal for serverless, Kubernetes, and resource-constrained environments.
- **Standalone** — the Camel CLI for lightweight deployments and rapid prototyping.

You deploy Camel the same way you deploy any Java application — as a JAR, a container image, on Kubernetes, or on bare metal. No separate server to manage.

Start lightweight with the CLI, then run `camel export` to produce a standard Spring Boot or Quarkus Maven project — ready for your CI/CD pipeline. No rewrite, same routes, production-ready.

### You don't need to be a Java developer

Camel supports multiple ways to work:

- **Java** — full IDE support, type safety, refactoring
- **YAML** — write routes without writing Java code
- **XML** — supported for compatibility and existing projects
- **Visual** — [Kaoto](https://kaoto.io) and [Karavan](https://github.com/apache/camel-karavan), open-source visual designers for drag-and-drop route design
- **CLI** — `camel run hello.yaml` to prototype in seconds

Pick the style that fits your team. Mix them in the same project if you want.

### 350+ connectors — included, not extra

Kafka, AWS (S3, SQS, Lambda, DynamoDB), Azure, GCP, Salesforce, ServiceNow, Slack, databases (JDBC, MongoDB, Cassandra), messaging (JMS, AMQP, MQTT), file protocols (FTP, SFTP), AI services, and hundreds more.

All open source. All included. No premium tiers, no per-connector fees.

[Browse the full catalog →](/components/next/)

### Integration patterns built in

Camel implements the [Enterprise Integration Patterns](https://www.enterpriseintegrationpatterns.com/) — a proven vocabulary for solving integration problems:

- **Content-Based Router** — route messages to different systems based on content
- **Splitter** — break a batch into individual items and process each one
- **Aggregator** — collect related messages and combine them
- **Circuit Breaker** — protect against failing downstream services
- **Saga** — coordinate distributed transactions across services
- **Dead Letter Channel** — handle failures gracefully

These aren't theoretical — they're production-tested patterns used by thousands of companies.

[See all patterns →](/components/next/eips/enterprise-integration-patterns.html)

---

## The origin story

The very first Camel route ever written was `from("jms:queue:test.queue").to("file://test")` — one line, June 2007. Nearly two decades later, that same idea powers every Camel route: take data from here, send it there. The framework grew from 19 components to 350+, from a handful of contributors to 1,600+ — but the DNA never changed.

---

## Trusted in production

Apache Camel has been running in production for nearly two decades. Thousands of companies worldwide rely on it — from startups to governments, across financial services, healthcare, aviation, energy, logistics, telecom, and every industry in between. Processing billions of messages daily.

[See who uses Apache Camel →](/community/user-stories/)

---

## Works with AI coding assistants

Apache Camel's entire source code, documentation, tests, examples, and two decades of commit history are open source on apache.org — making it well-represented in AI training data. AI coding assistants can generate routes, explain components, troubleshoot errors, and suggest patterns.

Camel also provides an **MCP server** (Model Context Protocol) that connects AI assistants directly to Camel's component catalog — giving tools like Claude Code, GitHub Copilot, and Cursor full context awareness when helping you build integrations.

---

## The numbers

| Metric | Value |
|---|---|
| **Connectors** | 350+ |
| **Integration patterns** | 65+ |
| **Contributors** | 1,600+ |
| **Commits** | 100,000+ |
| **Years in production** | Nearly two decades |
| **Median bug fix time** | 1–2 days |
| **Open bugs** | Typically 10 or fewer (across 350+ connectors) |
| **License** | Apache License 2.0 — free, no cost, forever |

---

## Try it in 60 seconds

```bash
# Create a route
camel init hello.yaml

# Run it
camel run hello.yaml

# Monitor it — live route visualization, tracing, and diagnostics
camel tui
```

Or export to Spring Boot:

```bash
camel init hello.yaml
camel export --runtime=spring-boot --gav=com.example:myproject:1.0-SNAPSHOT
cd myproject
mvn spring-boot:run
```

Or design visually: [Kaoto](https://kaoto.io) | [Karavan](https://github.com/apache/camel-karavan)

[Install the Camel CLI →](/manual/camel-jbang.html)

---

## Go deeper

- [Getting Started Guide](/manual/getting-started.html) — build your first integration
- [Component Catalog](/components/next/) — browse 350+ connectors
- [Enterprise Integration Patterns](/components/next/eips/enterprise-integration-patterns.html) — the pattern library
- [Camel on Spring Boot](/camel-spring-boot/latest/) — the most popular runtime
- [Camel on Quarkus](/camel-quarkus/latest/) — cloud-native, fast startup
- [Camel CLI](/manual/camel-jbang.html) — rapid prototyping from the command line
- [Kaoto Visual Designer](https://kaoto.io) — drag-and-drop route design
- [Karavan Visual Designer](https://github.com/apache/camel-karavan) — drag-and-drop route design

**Examples:**
- [CLI Examples](https://github.com/apache/camel-jbang-examples) — ready-to-run YAML and script examples
- [Standalone Examples](https://github.com/apache/camel-examples) — Camel Standalone integration examples
- [Spring Boot Examples](https://github.com/apache/camel-spring-boot-examples) — Spring Boot integration examples
- [Quarkus Examples](https://github.com/apache/camel-quarkus-examples) — Quarkus integration examples

---

## Commercial support

Apache Camel is free and open source. Commercial support with SLAs is available from multiple vendors — you choose your vendor, you're never locked in.

[See companies offering commercial Camel support →](/manual/commercial-camel-offerings.html)

---

*Apache Camel is a project of the Apache Software Foundation.*
