---
title: "Apache Camel 4.23 What's New"
date: 2026-10-15
draft: false
authors: [ davsclaus ]
categories: [ "Releases" ]
keywords: ["apache camel", "whats new", "camel 4", "release", "camel 4.23", "integration framework", "ai", "security"]
preview: "Details of what we have done in the Camel 4.23 release."
---

Apache Camel 4.23 has just been [released](/blog/2026/10/RELEASE-4.23.0/).

This is the biggest Camel release in a long time. Since 4.22 we have resolved **1019 JIRA tickets**
(nearly twice as many as in 4.22): 493 bug fixes, 362 improvements and 52 new features,
made in over 2000 commits by 63 contributors.

It is also the first Camel release where AI-assisted development is the norm rather than the exception:
more than 80% of the commits that were not made by bots carry an AI co-author trailer. Every change
still went through the usual Apache process -- JIRA, pull request, CI and review by the Camel committers --
but having AI coding assistants on the team has allowed us to go much deeper on bug fixing, security hardening
and documentation than we could before, and still have time for new features.

The headline features in this release are:

- **Semantic EIPs** -- A new `semantic` language lets routes make decisions on the *meaning* of a message
  (classify, score, detect prompt injection) and use those decisions in Choice, Filter, Switch, Aggregate, error handling and more.
- **Authorization as components** -- New components for Open Policy Agent, OpenFGA and SPIFFE, so
  "who is calling" and "what may they do" become route steps and route policies, also for AI agent tools.
- **Camel Core** -- New Switch and Cache EIPs, a pluggable `KeyValueRepository` SPI, error messages that point
  to the line in your source file, and a much more robust dev mode reload.
- **Camel CLI and TUI** -- The TUI source editor now supports Java and XML routes (not only YAML), routes can be converted
  between YAML, XML and Java without running them, and the validator explains *what to write* in many more cases.
- **Secure out of the box** -- Around 145 tickets in this release are about security hardening and secure defaults.
- **Validated documentation** -- Every YAML, XML and Java DSL code snippet in the documentation is now validated,
  and the build fails if an invalid snippet is added.

## Camel Core

### Switch EIP

The new [Switch EIP](/components/next/eips/switch-eip.html) is a fast, literal value-based dispatcher.
It evaluates a selector expression once and sends the message to the endpoint of the case with the matching value.

Where the [Choice EIP](/components/next/eips/choice-eip.html) evaluates predicates in turn and can have nested steps,
each case in Switch is exactly one value and one endpoint, which makes it easy to read and fast to route:

```java
from("direct:tickets")
    .doSwitch(header("department"))
        .doCase("billing", "direct:billing")
        .doCase("technical", "direct:technical")
        .otherwise("direct:review")
    .end();
```

And in YAML DSL:

```yaml
- route:
    from:
      uri: direct:tickets
      steps:
        - switch:
            selector:
              header:
                expression: department
            case:
              - value: billing
                uri: direct:billing
              - value: technical
                uri: direct:technical
            otherwise:
              uri: direct:review
```

Values are matched case-insensitively, duplicate values are rejected at startup, and the endpoint URIs are fixed
(use `toD` when you need a computed URI). The Switch MBean counts how many messages went to each case.

### Cache EIP

The new [Cache EIP](/components/next/eips/cache-eip.html) adds read-through caching to a block of steps, similar to Spring's `@Cacheable`.
On a cache hit the cached value becomes the message body and the block is skipped; on a miss the block runs and its result is cached:

```yaml
- route:
    from:
      uri: direct:product
      steps:
        - cache:
            expression:
              simple:
                expression: "${header.productId}"
            ttl: 10m
            steps:
              - to:
                  uri: http://product-service/api/product
```

Failed exchanges are never cached, and a failing cache never fails the route: a failed read just runs the block.

### Key-Value Repository SPI and State Store

A new `KeyValueRepository` SPI is one key-value store abstraction behind several Camel features: the Cache EIP,
the Idempotent Consumer, the Aggregator, and the new [State Store](/components/next/state-store-component.html) component.

It comes with implementations for memory, JDBC, JPA, Cassandra, Kafka, Redis, Infinispan, Hazelcast, Caffeine, Ehcache and JCache.
The new `KeyValueIdempotentRepository` and `KeyValueAggregationRepository` adapters let the Idempotent Consumer and the Aggregator
use any of these backends.

The `state-store` component exposes the repository directly in routes, with operations such as `put`, `putIfAbsent`, `get`, `delete` and `keys`,
and optional TTL. If you are coming from MuleSoft, this is the equivalent of the Object Store.

### Simple Language

The Simple language has received a lot of attention:

- Predicates inside `${ }`, as in EL and Groovy: `${body != null && body.size() > 0}`.
- The ternary operator now accepts compound conditions: `${header.age > 18 && header.country == 'DK' ? 'yes' : 'no'}`.
- `!` as a negation prefix: `${!body.isEmpty()}`.
- `equals` and `!equals` operators for plain text comparison. Remember that `==` compares numeric strings as numbers, so `0001 == 001` is true.
- A new `escape` function for html, xml, json, js, sql and url: `${escape(html, ${body})}`.
- Error messages say what to write: `Unknown function: bdy (did you mean ${body}?)`.

A review of the language also fixed a number of corner cases, so check the upgrade guide.
If you want to extend Simple with your own functions, see the [Extending Apache Camel Simple](/blog/2026/09/camel-simple-customfunction/) blog post.

### Errors that point to your source

When source location is enabled (it is by default in the `dev` profile), Camel now tells you *where* in your source the problem is.
The failed delivery log, the error registry, and the inflight, blocked and shutdown dumps all include the file and line:

```text
... at route1[to3] orders.camel.yaml:18. Exhausted after delivery attempt: 1 ...
```

The error registry also records the origin of a handled error (the node that actually failed, not the `onException` that handled it),
and collapses repeated identical errors so a storm of one error no longer pushes the others out.

### Dev Mode Reload

Live reloading in dev mode is now much more forgiving:

- A failed reload keeps the previous routes running (restored from the last good definitions), and logs a WARN that says so.
- Directories created while the application runs (such as a new Java package) are now watched.
- An exchange that is cut off by a reload is logged as a single WARN line that says where it was waiting, instead of a full stack trace.
- Stopping or removing all routes is now one graceful shutdown, so `direct` consumers are drained first.

### Java DSL Parser

The new `camel-java-io` module can read Java DSL routes into the Camel model *without compiling them*. It works in milliseconds
and never runs, loads or compiles any code from the source file. It is what powers the Java support in the TUI source editor,
`camel transform route`, `camel overview` and the route diagrams.

### CamelEvent JSON

Camel events can now be serialized to JSON (`asJSon()` / `toJSon()`), with structured details such as exchange id, route id,
endpoint, step id and exception. The event dev console shows these details.

### Other Core Improvements

- The `marshal` EIP has an `allowNullBody` option (like `unmarshal`), and both say clearly when the body is null.
- The Splitter now unwraps `List<Exchange>` parts, such as from batching consumers like Kafka.
- A new `resolveResource` option on every expression loads the content when the result is a `resource:...` value.
- The Circuit Breaker EIP counts fallback, timed out and bulkhead-rejected calls in JMX, the dev console and the TUI.
- Many correctness fixes in Saga, Aggregate, Resequencer, Claim Check, Idempotent Consumer and onCompletion during graceful shutdown.
- `http:` and `https:` resources are now loaded with a connect and read timeout.

## Semantic EIPs

The new [Semantic](/components/next/languages/semantic-language.html) language lets a route make decisions on the meaning of a message.
You declare named evaluations once, and then use them anywhere Camel accepts an expression or predicate:

```yaml
- semantic:
    evaluation:
      department:
        type: choice
        instructions: Which department should handle this message?
        criteria:
          billing: Invoices, payments and refunds
          technical: Bugs, outages and technical problems
- route:
    from:
      uri: direct:tickets
      steps:
        - setProperty:
            name: department
            expression:
              language:
                language: semantic
                expression: ref:department
        - choice:
            when:
              - expression:
                  simple:
                    expression: "${exchangeProperty.department} == 'billing'"
                steps:
                  - to:
                      uri: direct:billing
            otherwise:
              steps:
                - to:
                    uri: direct:review
```

An evaluation returns a boolean, a category, a score or a set of labels, and can be used with Choice, Filter, Switch, Validate,
Aggregate correlation and completion, Recipient List, Loop, onException `retryWhile`, and more.
Several evaluations can be batched in one call (`refs:actionable,department,urgency`).
The evaluations are also available in the Simple language with `${semantic('name')}`.

The actual evaluation is done by an *expert*, which is a pluggable adapter that declares what it can do.
Camel 4.23 comes with two experts:

- **TypeSafe AI** (`camel-typesafe-ai`) -- calls the TypeSafe AI "System One" decision API (the Jev model),
  which answers yes/no, choice and score questions with probabilities. It is also available as a component and as a `typesafe-ai` language.
- **Wolf Defender** (`camel-wolf-defender`) -- detects prompt injection and jailbreak attempts *locally* on the CPU
  using ONNX Runtime and the Wolf-Defender model. No remote service is needed.

Semantic decisions can be audited (opt-in), and the audit history can be inspected with `camel semantic audit`, the dev console,
and the new Semantic tab in the Camel TUI.

To learn more, see the blog posts [TypeSafe Jev meets Apache Camel](/blog/2026/09/semantic-evaluation-system-one/)
and [One request, several agents: semantic routing](/blog/2026/10/semantic-agent-routing/).

_Note: the Semantic language is in Preview, and its YAML syntax changed during the 4.23 development cycle (`question:` became `evaluation:`
with an `expert`); the documentation shows the final syntax._

## Camel AI

### LLM Component

The `camel-openai` component works with many LLM vendors that offer an OpenAI-compatible API, and it is now also available
under the more neutral `llm:` scheme. The `openai:` scheme continues to work. The component gained:

- **Moderation** of text and images, with the verdict as headers so a route can block a flagged message before it reaches the model.
- **Image generation and editing**.
- **Batch API** support (`batch`, `batch-retrieve`, `batch-cancel`, `batch-results`) for half-price asynchronous processing.
- A **webhook consumer** that verifies OpenAI webhook signatures.
- **Agentic loop visibility** -- cumulative token headers, a per-iteration trace, lifecycle events, and a token budget (`maxAgenticTokens`)
  that also applies to the Responses API tool loop.
- **Phase-specific timeouts** (connect, read, write) and **structured error metadata** (`CamelAiErrorCategory` such as `RATE_LIMIT`, and `CamelAiRetryAfterMillis`)
  so `onException` can handle rate limits properly.
- Calling `ai-tool` routes from the `AiToolRegistry` (`tags` option), including `returnDirect`.

```yaml
- route:
    from:
      uri: platform-http:/chat
      steps:
        - to:
            uri: llm:moderation?moderationModel=omni-moderation-latest
        - choice:
            when:
              - expression:
                  simple:
                    expression: "${header.CamelOpenAIModerationFlagged} == true"
                steps:
                  - setBody:
                      expression:
                        constant:
                          expression: "Your message violates our usage policy."
            otherwise:
              steps:
                - to:
                    uri: llm:chat-completion?model=gpt-5
```

### AI Tools and MCP

Building on the AI tools from [Camel 4.22](/blog/2026/08/camel-ai-tools-mcp-422/):

- **Authorization** -- `ai-tool` has an `authorizationPolicy` option. Set it on the component and every tool route is guarded by construction.
  A denial is returned to the model as a short refusal, never as a stack trace. See [Authorizing what an AI agent may do](/blog/2026/09/securing-ai-agent-tools/).
- **Structured output** -- `outputSchema` lets a tool return MCP `structuredContent`.
- **AI resources** -- the new `ai-resource` component exposes a route as a read-only MCP resource (`resources/list` and `resources/read`).
- **MCP stdio transport** -- `camel run tools.yaml --mcp-stdio` lets an IDE or AI agent launch Camel as an MCP subprocess.
- **Wildcard tags** (`camel.server.mcp-tags=*` or `crm*`) and server metadata such as title, description, website and instructions.
- Tool routes called from `camel-openai` and `camel-spring-ai-chat` now see the calling exchange's properties and variables, as with LangChain4j.

### LangChain4j

- The new [LangChain4j Ingest](/components/next/langchain4j-ingest-component.html) component is the missing ingestion half of RAG:
  it splits documents, embeds them in batches and stores them in an embedding store, with filters and idempotency.
  It can also embed images, audio, video and PDF documents whole with a multimodal model.
- LangChain4j models can be declared without Java code, using `provider`, `modelName`, `baseUrl`, `apiKey` and friends,
  for example `camel.component.langchain4j-agent.provider=ollama`.
- The agent supports moderation, tool-calling limits and an `AiServices` builder customizer.
- Embeddings and embedding store support batch operations.

### GenAI Observability

The new `camel-ai-observability` module records LLM calls following the OpenTelemetry GenAI semantic conventions
(spans with model, operation and token usage) and as Micrometer metrics. It covers `langchain4j-chat`, `langchain4j-agent`,
`langchain4j-embeddings`, `openai`/`llm` and `spring-ai-chat`. See the blog posts
[Observe Your Camel AI Routes with GenAI OpenTelemetry](/blog/2026/09/camel-genai-observability-jbang/) and
[GenAI Observability with Spring Boot](/blog/2026/09/camel-genai-observability-spring-boot/).

### Other AI Changes

- `camel-docling` can consume completed asynchronous conversion tasks.
- The Maven archetypes now generate an `AGENTS.md` file for AI coding assistants, pointing to `llms.txt`, the Camel CLI and the Camel MCP server.

## Security

### Authorization and Identity Components

Three new components make authorization a first-class part of a route:

- [SPIFFE](/components/next/spiffe-component.html) -- *who is calling*. Fetch and validate SPIFFE identity documents from the Workload API,
  get rotating mutual TLS for any component that supports `sslContextParameters`, and authorize on the peer SPIFFE ID with `SpiffeSecurityPolicy`.
- [OPA](/components/next/opa-component.html) -- *what the rules say*. Evaluate Open Policy Agent (Rego) policies against the exchange,
  either against an OPA server or in-process with a WASM bundle. `OpaSecurityPolicy` guards a whole route.
- [OpenFGA](/components/next/openfga-component.html) -- *what the caller's relationship to the resource is*. Relationship-based (Zanzibar-style) authorization checks.

```yaml
- route:
    from:
      uri: platform-http:/orders
      steps:
        - to:
            uri: opa:authz/orders/allow
            parameters:
              serverUrl: http://localhost:8181
        - filter:
            expression:
              simple:
                expression: "${header.CamelOpaDecisionAllow} == true"
            steps:
              - to:
                  uri: direct:handleOrder
```

All of them fail closed by default. See the [Workload identity with SPIFFE and SPIRE](/blog/2026/09/camel-spiffe-workload-identity/) blog post,
which comes with an example where Open Policy Agent decides what each identity may do.

### Secure Out of the Box

We continue the effort to make Camel secure by default. Around 145 tickets in this release are about security hardening, including:

- **Deserialization filters on by default** in the Netty object codecs, JGroups, Spring Redis, Hazelcast and the key-value repositories.
- **Header filtering** of Camel internal headers in more components (JCR, Spring WS, Vert.x HTTP REST, Azure Event Hubs).
- **File containment** -- remote file consumers (FTP, SFTP, SMB, Azure Files) stay inside their directory, and the jail and local work directory checks resolve symbolic links.
- **TLS** -- `SSLContextParameters` now defaults to TLSv1.2 as minimum and excludes 3DES, plus fixes so client authentication, protocols and ciphers are applied in more components.
- **XML** -- external entity resolution is disabled by default in Smooks, Saxon XQuery, FOP and the XML converter.
- **Authentication** -- fixes in camel-oauth, Keycloak, Shiro, Netty HTTP and Undertow WebSockets, and CORS credentials only for configured origins.
- **Message input is not trusted as configuration** -- HTTP producers no longer resolve property placeholders in a URI from a message header,
  SQL and XSLT override headers are opt-in, and AWS S3 key and bucket headers are used as-is.
- **Secrets** -- more values are masked when logging properties and endpoint URIs.
- **Security policy** -- the security policy check now matches options per component, and more insecure options are marked so the check can report them.

## Camel CLI

### Runtimes

`camel run` now uses the `jbang` runtime by default (the fast in-process run you know). The `--runtime=main` option now works
like `spring-boot` and `quarkus`: it exports a Camel Main project, builds it with Maven and runs it in a separate JVM,
which gives a classpath much closer to production.

Flags such as `--console` and the max-duration options now work on all three runtimes.

### Convert Routes Between DSLs

A route file can be converted between YAML, XML and Java DSL without running it:

```bash
camel transform route --format=xml route.yaml
camel transform route --format=yaml src/main/java/com/acme/OrderRoute.java
camel transform route --format=java orders.camel.yaml
```

Java routes are read with the new Java DSL parser, so no compilation is needed. When a route cannot be converted without loss
(such as a lambda processor), the command refuses and tells you why. In the TUI, press F12 on a file and choose *Convert to YAML/XML/Java*.

### A Validator That Says What to Write

`camel validate` and the YAML DSL validator now explain *what to write* in many more cases (about 35 new hints), for example:

- a `to:` URI with `${...}` says to use `toD:`
- a `${...}` placeholder in an endpoint option says the syntax is `{{key}}`
- a SQL query with `:name` says that camel-sql uses `:#name`
- a YAML indentation error is explained in plain words, and a misplaced key says where it goes
- a `direct:` or `seda:` endpoint that no route consumes is reported

There are new `camel validate source` and `camel validate properties` commands, `--camel-version` to validate against another Camel version,
`--canonical` to report the deprecated compact YAML notation, and `camel validate normalize` now handles Kamelets.

Many of these hints were found by having a frontier AI model coach a small local model through building Camel integrations.
Every message the local model could not act on became a hint -- and they help humans just the same.
Read about it in the local-model benchmark blog posts:
[round 1](/blog/2026/09/camel-local-model-benchmark/),
[round 2](/blog/2026/09/camel-local-model-benchmark-round-2/) and
[round 3](/blog/2026/10/camel-local-model-benchmark-round-3/).

### Examples

The bundled examples have been revamped into a ladder of real-world examples, from quick start to showcase,
with most of them sharing one web shop story. 27 of the 39 examples are bundled and run offline:

```bash
camel run --example                 # list the groups and what each example teaches
camel run --example=route           # one group in full
camel run --example=route/aggregator
```

### Project Overview

The new `camel overview` command analyzes a project and describes its routes and business capabilities.
With `--ai` it lets an AI model write the descriptions, and with `--save` it writes a `camel-summary.md` file where the AI-written
parts are marked as AI-assisted. The overview is also available in the TUI and as an MCP tool.

### MCP Servers

The two Camel MCP servers (`camel mcp` and `camel tui --mcp`) now share one set of authoring tools (`camel_catalog_doc`,
`camel_validate_source`, `camel_write_file`, `camel_edit_file`, `camel_run`, ...). Other improvements:

- `camel_edit_file` replaces snippets instead of rewriting the whole file, and several edits can be applied in one call.
- Writing a file in dev mode reports whether the reload succeeded, and the first output of the running integration.
- Runtime tool groups (SQL, tracing, resilience, HTTP) are loaded based on what the application actually uses.
- A repeated identical tool call gets a short "already answered" reply, so an agent can notice it is looping.
- Catalog tools serve samples for components, data formats and languages, and know about Kamelets.
- `camel_dependency_for_class` maps a class name to its Maven dependency.

### Other CLI Improvements

- `camel infra run` shows the progress of pulling the container image.
- `camel run --observe` adds GenAI observability automatically when AI components are used.
- `camel.main.duration=15s` as a shorter alternative to `durationMaxSeconds`.
- The CLI connector has a WebSocket transport, so developer tools such as IDEs can drive running integrations.
- The YAML generated by `camel init`, the examples and the MCP scaffold tools is now in the canonical YAML DSL format.

## Camel TUI

### Source Editor for Java and XML

The TUI source editor now supports Java DSL and XML DSL routes, in addition to YAML. All three get:

- **Problems as you type** -- endpoint URIs and options, Simple expressions, and `to` vs `toD`. F9 goes to the next problem,
  Shift+F9 applies a quick fix, and Shift+F8 asks the AI to fix it (also for a line that fails at runtime).
- **Tab completion** -- the Java DSL route chain (including inside arguments and the REST DSL), XML elements and attributes,
  the Simple language, and the arguments of Simple functions such as `${date:...}` and `${properties:...}`.
- **Refactorings** (Ctrl+R) -- replace an endpoint URI, extract a value to a property, or extract steps to a new route.
- **Navigation** -- jump links between routes (also across folders), Ctrl+G to go to a node, Ctrl+T for the tree of the current route.
- **Editing** -- undo/redo, block-aware move, duplicate and delete, and a diff of unsaved changes.
- **Live data** -- each line shows its exchange and failure counts while the integration runs.

There are also 16 new themes based on popular editor color schemes (Dracula, Nord, Solarized, Gruvbox, Catppuccin, Tokyo Night, and more)
with their own syntax highlighting.

### AI in the TUI

- **Bring your own agent** -- the AI panel (F8) can use ACP coding agents such as Claude Code, Codex, Qwen and OpenCode (Ctrl+P).
  See the blog post [Bring Your Own Agent to Camel TUI](/blog/2026/09/camel-tui-byoa/).
- **Ollama tab** -- shows local model performance: throughput, context fill, cache hits, GPU/CPU and a request log.
  Prompts and context sizes are tuned for local models.
- **Checked answers** -- Simple expressions in an AI answer are checked against the catalog before they are shown, and the model gets one turn to fix them.
- **Semantic tab** -- inspect semantic evaluations and experts, try them in a playground, and browse the audit history.

### Recording Demos

`camel tui --record=demo.tape` now plays the tape itself and writes an asciinema `.cast` file. On top of the usual key commands,
the tape can show captions, highlight areas, switch tabs and themes, and wait for text on the screen,
which makes it easy to keep demos and documentation screenshots up to date.

## Documentation

All the route examples in the Camel documentation have been validated and fixed -- in the EIP, component,
data format and language pages, and in the user manual. This was a big job: in the component and data format pages alone,
about 375 YAML examples did not validate, and many Java and XML examples were out of date or plain wrong
(some still used Camel 1.x and 2.x syntax).

To keep it that way, the build now checks every code snippet in the documentation:

- **YAML** examples are validated against the YAML DSL schema, and checked with the same authoring checks as `camel validate yaml`
  (endpoint URIs and options, Simple expressions, headers).
- **XML** examples are validated against the Camel XML schemas.
- **Java** examples are read with the new Java DSL parser, which fails on DSL methods that do not exist or have wrong arguments,
  and their imports are checked.

If someone adds an invalid snippet, the build fails. You can now copy an example from the documentation and trust that it is correct.

This matters for AI as well. The documentation is what AI models learn Camel from, and the validated examples are also
served by the Camel MCP servers (`camel_catalog_sample`), so an AI coding assistant gets a correct example instead of guessing.

The language pages also show their examples in Java, XML and YAML tabs.

## Camel Kafka

- The new [Kafka Share](/components/next/kafka-share-component.html) component consumes from Kafka share groups (KIP-932, Queues for Kafka),
  where many consumers can read from the same partition and each record is acknowledged on its own (accept, release or reject).
  It requires Kafka 4.2 or newer.
- The shared Kafka client code has moved to a new `camel-kafka-common` module (same packages).
- Fewer per-message allocations in the producer, consumer and transformers.
- `autoOffsetReset` accepts `by_duration` (Kafka 4.0+).
- A suspended consumer keeps its partitions, and `sslContextParameters` now applies the SSL settings correctly.

## DataWeave Conversion

The DataWeave to DataSonnet converter (`camel transform dataweave`) has been rewritten to convert real-world MuleSoft DataWeave scripts faithfully.
A converted script either gives the same result as DataWeave or fails at startup -- it no longer converts silently into something that gives a wrong result.
The converter is tested against a corpus of 332 DataWeave snippets, with expected outputs produced by the DataWeave CLI.

## Camel Spring Boot

- New starters for the new components, including `camel-opa-starter`, `camel-openfga-starter`, `camel-openfeature-starter`,
  `camel-odata-starter`, `camel-kafka-share-starter` and `camel-ai-observability-starter`.
- Security hardening of the starters: the Jolokia starter binds to localhost, the debug starter no longer opens a JMX connector,
  the Undertow Spring Security starter validates the token issuer and audience, vault starters fail closed,
  and the Jasypt starter uses a modern default algorithm.
- Starter configuration options that cannot be bound are now reported instead of silently ignored.

## New Components

- `camel-ai-resource` -- Expose a route as a read-only AI (MCP) resource.
- `camel-alibaba-*` -- Alibaba Cloud: EventBridge, Function Compute, KMS, MNS, OSS, OTS (Tablestore), SLS and SMS.
- `camel-hivemq` -- MQTT 5 and 3.1.1 using the maintained HiveMQ MQTT client.
- `camel-kafka-share` -- Consume from Kafka share groups (KIP-932).
- `camel-langchain4j-ingest` -- Document ingestion for RAG.
- `camel-odata` -- OData V4, the successor to the deprecated `camel-olingo4`.
- `camel-opa` -- Open Policy Agent policy evaluation.
- `camel-openfeature` -- Feature flags using the OpenFeature specification (component and language).
- `camel-openfga` -- Relationship-based authorization with OpenFGA.
- `camel-rest-postman` -- Call and expose REST services using a Postman Collection as contract.
- `camel-spiffe` -- SPIFFE workload identity and rotating mTLS.
- `camel-state-store` -- Key-value operations on a pluggable store.
- `camel-typesafe-ai` -- TypeSafe AI decision API (component, language and semantic expert).

## New Languages

- `python3` -- Python 3 using GraalPy (the existing `python` language is Jython based).
- `quickjs` -- JavaScript using QuickJS4J, a pure Java engine with no native code.
- `semantic` -- Semantic evaluation of message content.
- `openfeature` -- Feature flag as a predicate.

## New Data Formats

- `toon` -- TOON (Token-Oriented Object Notation), a compact JSON-like format that uses fewer tokens when sending data to an LLM.
- `ubl` -- UBL 2.1 (Universal Business Language) documents, such as used in Peppol and EU e-invoicing.

## Other

- `camel-wolf-defender` -- Local prompt-injection detection as a semantic expert.
- `camel-ai-observability` -- GenAI observability with OpenTelemetry and Micrometer.

## Deprecated

- `camel-minio` -- The MinIO project has been archived. Use `camel-aws2-s3` with an endpoint override instead.
- Exchange pooling (`camel.main.exchange-factory=pooled`).
- `MemoryIdempotentRepository` and `MemoryAggregationRepository` -- Use the new key-value repository adapters.
- YAML DSL `kind: Pipe` (aka KameletBinding) -- Use a regular route.
- `camel-catalog-suggest` -- Did-you-mean suggestions are now built into the catalog.

## Removed Components

The following components, deprecated in earlier releases, have been removed:

- `camel-csimple` -- Use `simple`.
- `camel-joor` language -- Use `java`.
- `camel-langchain4j-tools` -- Use `camel-ai-tool` with `camel-langchain4j-agent`.
- `camel-zeebe` -- Use `camel-camunda`.
- `camel-splunk` -- Use `camel-splunk-hec` for sending events.
- `camel-headersmap` -- The built-in header map is now as fast; just remove the dependency.
- `camel-hazelcast-atomicvalue`, `camel-digitalocean`, `camel-iec60870`, `camel-irc`, `camel-ironmq`, `camel-json-patch`, `camel-leveldb`
  -- the libraries they used are no longer maintained.
- `camel-reactive-executor-tomcat`, `camel-reactive-executor-vertx`, `camel-threadpoolfactory-vertx`.
- `camel-archetype-spring` and `camel-catalog-lucene`.

## Upgrading

Make sure to read the [upgrade guide](/manual/camel-4x-upgrade-guide-4_23.html) if you are upgrading from a previous
Camel version. With more than a thousand tickets resolved, the upgrade guide for this release is long.
Many entries are fixes that make Camel behave as documented, but some changes may affect you, such as:

- Message headers keep the case of their names as they were set (as in Camel 4.20 and older); header lookup is still case-insensitive.
- `SSLContextParameters` uses TLSv1.2 as the minimum protocol by default.
- `camel-http` is now the default client for the REST producer and `rest-openapi`.
- `@PropertyInject` fails on an invalid value instead of using the default value, and its `separator` is no longer a regular expression.
- `CAMEL_COMPONENT_*`, `CAMEL_DATAFORMAT_*` and `CAMEL_LANGUAGE_*` environment variables now take effect.
- Endpoint URI normalization is now order-independent.
- The Jasypt Spring Boot starter has a new default algorithm, which affects existing encrypted values.
- Several MCP tools were renamed or removed in favour of the shared authoring tools (see the mapping table in the upgrade guide).

If you are upgrading from, for example, 4.4 to 4.8, then make sure to follow the upgrade guides for each release
in-between, i.e.
4.4 -> 4.5, 4.5 -> 4.6, and so forth.

The Camel Upgrade Recipes tool can also be used to automate upgrading.
See more at: https://github.com/apache/camel-upgrade-recipes

## Release Notes

You can find additional information about this release in the list of resolved JIRA tickets:

- [Release notes 4.23](/releases/release-4.23.0/)

## Roadmap

The next 4.24 release is planned for December.

In Camel 4.24 we plan to upgrade to Quarkus 4 and drop support for Java 17, which makes Java 21 the minimum version.
