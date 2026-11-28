---
title: "Apache Camel 4.24 What's New"
date: 2026-12-04
draft: true
authors: [ davsclaus, croway, oscerd, allthingssecurity, luigidemasi, apupier ]
categories: [ "Releases", "Camel" ]
keywords: ["apache camel", "whats new", "camel 4", "release", "camel 4.24", "integration framework", "chaos", "testing", "security", "ai"]
preview: "Details of what we have done in the Camel 4.24 release."
---

Apache Camel 4.24 has just been [released](/blog/2026/12/RELEASE-4.24.0/).

Camel 4.23 was the biggest Camel release in a long time, and Camel 4.24 is twice as big again. Since 4.23 we have resolved
**2076 JIRA tickets**: 1233 bug fixes, 533 improvements and 46 new features, made in over 3100 commits by 63 contributors.

More than 90% of the commits that were not made by bots were made with an AI coding assistant -- the rest are mostly
dependency and container image upgrades. Every change still went
through the usual Apache process -- JIRA, pull request, CI and review by the Camel committers. A large part of the work
in this release comes from AI-assisted scans of the components: an AI reads a component, its documentation and its tests,
and reports what does not work as documented. Each finding becomes a JIRA ticket and a fix with a test.

Camel 4.24 is a release about reliability: tools that break your routes on purpose, tests that find the rare races
in Camel itself, and over 1200 bug fixes. The headline features in this release are:

- **Chaos testing** -- The new `camel-chaos` turns on faults in a running integration while you develop it, so you can see
  whether redelivery, the dead letter channel and the circuit breaker do what you expect -- and an AI can do the exploring for you.
- **Bug fixes and security hardening** -- Over 1200 bug fixes in 233 components, and around 180 tickets about security.
- **A 10 times faster Camel CLI** -- A command now takes about 100 ms instead of more than a second. The CLI has moved from picocli to aesh,
  and has documented exit codes, JSON output and timeouts, so scripts and AI agents can trust it.
- **See the messages move** -- The route diagram of the Camel TUI shows the messages flowing through your routes live,
  and spots a stuck step for you.
- **CVE audit** -- `camel dependency audit` and the `camel-report:audit` Maven goal tell you which version fixes a vulnerable JAR,
  how it got onto your classpath, and whether your routes use it.
- **Kamelets overhaul** -- Every Kamelet is documented, almost all are tested, and their data types now fit together.
- **SOAP without generated classes** -- XML to JSON driven by an XML Schema, and `camel generate wsdl` to scaffold a route from a WSDL.
- **Deterministic simulation testing** -- How we found the bugs that only happen once in a while: we control time,
  run thousands of scenarios in seconds, and replay a failing one exactly. A new exchange sanitizer checks that the
  routing engine keeps its own rules.
- **Java 21** -- Java 21 is now the minimum version, and Camel is upgraded to Spring Boot 4.2.

## Chaos Testing

Camel has had error handling for a long time: redelivery, `onException`, the dead letter channel and the circuit breaker.
Usually you only find out whether your configuration works when a remote service is down in production.

The new [Chaos](/components/next/others/chaos.html) module lets you break your routes on purpose while you develop them.
Run with `camel run * --chaos`, ask `camel cmd chaos-suggest` what to try, and turn on faults in the running integration --
"fail 30% of the sends to `kafka:orders` for one minute", or "stall the route `poller` for 20 seconds". A rule can say what
should hold, which gives a PASS or FAIL verdict, and rules can be saved as a scenario:

```text
# test/chaos/outage.chaos: the stock service is down for a minute, then slow for a minute
seed=42

endpoint=http:stock* error status=503 until=1m
endpoint=http:stock* delay duration=2s from=1m until=1m
# no order may be lost: the orders route completes 50 exchanges within 3 minutes
endpoint=http:stock* error rate=0.01 expect=orders:50 within=3m
```

The verdict is the exit code of `camel run --chaos=test/chaos/outage.chaos`, so a scenario can be a gate in your build pipeline.
The Camel TUI has a Chaos screen to add rules and watch their effect live. Chaos is for development: it never turns on with the `prod` profile.

You do not even have to know what to try: `camel cmd chaos-explore --budget=10m` lets the AI of `camel ask` run experiments
by itself, and report what held and what broke, with a replayable scenario for every failure.
Read more in [Chaos in Camel 4.24, part 1: break your routes on purpose](/blog/2026/11/camel-chaos/)
and [part 2: let there be chaos](/blog/2026/11/let-there-be-chaos/).

## Bug Fixes and Security

### Over 1200 Bug Fixes

Most of the tickets in this release are bug fixes: 1233 of them, in 233 components. We continued the AI-assisted scans of the
components that we started in Camel 4.23. A scan reads a component, its documentation and its tests, and finds where they
disagree: an option that has no effect, a header that is never set, a consumer that loses a message when it is stopped,
a page that documents a default the code does not have. Every fix comes with a test.

A scan that reads the code finds a lot, but not everything. The hardest bugs to find are the ones that only happen in a
specific order of events: a commit that times out during a rebalance, a lock that expires while a stop is in progress,
a connection that drops just before the first message is routed. Neither a human reviewer nor a frontier AI model reading the
code finds them reliably, and an ordinary test does not hit them either. For those we used two new techniques,
[deterministic simulation testing](#deterministic-simulation-testing) and [chaos testing](#chaos-testing), and both are
part of Camel 4.24 so you can use them too.

### Security Hardening

The AI-assisted component scans also looked for security problems, and around 180 tickets in this release are about security, including:

- **Credentials go only where they belong** -- the credentials of GraphQL, Elasticsearch and OpenSearch are bound to the configured
  host or cluster, and OAuth access tokens are sent only in the `Authorization` header.
- **TLS settings that had no effect are now applied** -- such as hostname verification in Netty, and the TLS options of gRPC, Thrift, MongoDB and Solr.
- **Message input is not trusted as configuration** -- more components use a header that overrides credentials or the target
  only when an option allows it (SSH, SMPP, Docker, Keycloak, DuckDB and more).
- **Secure defaults** -- webhooks verify their signatures by default, and the control bus `language` command is off by default.
- **Secrets** are masked in more places, and the security policy now also checks the beans that route files define.

Many of these fixes are also backported to the 4.22.x and 4.18.x LTS releases.

### Security Model

After the [38 security advisories](/blog/2026/10/camel-security-advisories-4.23.0/) published with Camel 4.23, we revisited the
[security model](/manual/security-model.html) of Camel: what Camel trusts and what it does not, which security properties it provides
(and which it does not), and which classes of vulnerability are in scope. It helps you secure your integrations, and it tells
security researchers what is a vulnerability in Camel and what is not.

### Authorization

The new [Cedar](/components/next/cedar-component.html) component evaluates [Cedar](https://www.cedarpolicy.com/) authorization
policies in-process, with no call to a remote service, and `CedarSecurityPolicy` guards a whole route.
It joins the authorization components from Camel 4.23, which have matured a lot:

- [OPA](/components/next/opa-component.html) -- atomic reload of WASM policy bundles, and the outcome of each item in a batch.
- [OpenFGA](/components/next/openfga-component.html) -- server-side batch checks, and a consumer of the change log with durable checkpoints.
- [SPIFFE](/components/next/spiffe-component.html) -- the verified identity of the peer on all the HTTP consumers, and readiness checks of the identity.

## Camel CLI

In Camel 4.24 a Camel CLI command takes about 100 ms, where 4.23 took more than a second:

| Command                   | Camel 4.23 | Camel 4.24 |
|---------------------------|-----------:|-----------:|
| `camel version`           | 1185 ms    | 73 ms      |
| `camel ps`                | 1201 ms    | 80 ms      |
| `camel get route`         | 1223 ms    | 120 ms     |
| `camel catalog component` | 1434 ms    | 153 ms     |

This matters for AI agents, which call the CLI 50 or 100 times for one task: 100 calls at 1.2 seconds is two minutes of waiting,
at 100 ms about 10 seconds. And when calls are cheap, an agent can verify instead of guess.

The CLI has also moved from picocli to [aesh](https://github.com/aeshell/aesh), and it documents its [exit codes and output](/manual/camel-jbang-exit-codes.html) as a contract
for scripts, CI jobs and AI agents: errors on stderr, JSON output, timeouts, and no command that waits for a terminal that is not there.
The web installers and `camel self-update` can follow the latest release, the latest LTS, an `X.Y` line, or a nightly build.

Other improvements:

- `camel export --runtime=spring-boot --packaging=war` exports a WAR file for Tomcat.
- `camel cmd send --repeat=100 --interval=200ms` feeds a route with many messages.
- `camel export` and `camel run` are now also a Java API, so IDEs and other tools can export and run integrations the same way.

Read more in the blog post [The Camel CLI in Camel 4.24 is 10 times faster](/blog/2026/11/camel-cli-424/).

## Camel TUI

### See the Messages Move

The route diagram of the Camel TUI now shows where the messages go while the integration runs. Dots move along the arrows
into each step: the more messages a second, the faster and closer together they are, and they turn red where most of the
messages fail. At a choice you see the dots split between the branches, so the busy path stands out at a glance --
not only as counts that go up. A step where exchanges wait and none has finished for a few seconds gets a spinner,
with how many wait and how long ago it last finished one (`⠹ 3 inflight · 12s`), so a call to a system that does
not answer is easy to spot:

![The orders route with the live flow: dots go along the arrows and split at the choice, most of them to the warehouse branch; then the sync route, whose delay step is stuck](./camel-tui-diagram-live-flow.gif)

The same works one level up. The topology shows the dots between the routes, and the architecture view between the groups
of routes, with red dots going into the error handling, and dots in from and out to the external systems.

The rates come from the counts the diagram already loads about once a second, so the live flow costs the integration
nothing extra, and an idle integration draws no frames. Press `w` to turn it off and on.

### Other TUI Improvements

- **Body types** -- the Routes, Diagram and Source views show the body type each step has been reached with
  (such as `LinkedHashMap → json` where a Kamelet converts the body), so you can see how the body changes along a route.
- **About** -- a new screen (and `camel get about`) says what an integration does and what has happened, at a glance and without AI.
- **Timeline** -- the errors and route outcomes of an integration per second, with the chaos rules as a layer.

## CVE Audit

Any scanner gives you a list of CVEs in your dependencies. Camel 4.24 also tells you which version fixes the JAR you have,
how it got onto your classpath, and whether your routes use it:

```bash
camel dependency audit
```

The audit checks every JAR against [OSV.dev](https://osv.dev/), and the Camel JARs against the
[Apache Camel security advisories](/security/). The FIX column shows the version that fixes the JAR,
VIA shows the dependency chain (such as `camel-kafka > kafka-clients > snappy-java`), and USED says whether your routes use the library.
With `--osv-database` the vulnerability database is matched locally, so no coordinates leave the machine.

The audit can fail your build with its exit code, and for Maven builds the new `camel-report:audit` goal writes JSON and SARIF reports.
The CVE Audit screen of the Camel TUI shows the same, and `camel dependency outdated` lists the dependencies that have newer releases.
Read more in the blog post [CVE audit in Camel 4.24](/blog/2026/11/camel-cve-audit/).

## Kamelets

The Kamelet catalog has its biggest overhaul since Kamelets were introduced:

- **Every Kamelet is documented** -- a new description that says what to use it for, its input and output,
  and its defaults, limits and error behaviour. They are written for integrators who do not know Camel, and for AI assistants.
- **Almost every Kamelet is tested** -- 220 of the 236 Kamelets are tested with Citrus and the Camel CLI, in about 270 tests
  against real brokers, databases and cloud emulators in containers. The tests found many bugs in the Kamelets and in Camel itself.
- **Removed and new Kamelets** -- about 40 Kamelets that could no longer work, were little used, or were variants are removed.
  New Kamelets include `soap-source` and `soap-action`, `debezium-postgresql-source`, `openai-chat-action`, `ai-tool-source`,
  `kafka-share-source`, and sources and sinks for SMB and MLLP.
- **Data types that fit together** -- many more Kamelets declare the data type they take and give (such as `text` or `json`),
  and Camel converts the message body to that type. A `Map` from `csv-deserialize-action` now goes into `postgresql-sink`,
  which takes JSON, without any code in between.

Read more in the blog post [Kamelets 4.24: documented, tested, and with data types that fit together](/blog/2026/12/kamelets-424/).

## SOAP and XML

Many Camel users still integrate with SOAP web services, and Camel 4.24 makes this much easier, also from YAML routes
and Kamelets, without generating Java classes.

### XML to JSON driven by an XML Schema

The new [XSD JSON](/components/next/dataformats/xsdJson-dataformat.html) data format maps XML to JSON and back using an
XML Schema, or the types of a WSDL. Values get their JSON types, repeating elements are always arrays, and marshal writes
the elements in schema order with the correct namespaces:

```yaml
- route:
    from:
      uri: direct:reply
      steps:
        - unmarshal:
            xsdJson:
              schema: classpath:orders.wsdl
        - to:
            uri: mock:json
```

### Routes from a WSDL

`camel generate wsdl` lists the services, ports and operations of a WSDL, and scaffolds a route that serves or calls it:

```bash
camel generate wsdl orders.wsdl --route=consumer --output=orders-service.camel.yaml
camel generate wsdl orders.wsdl --route=producer --operation=getOrder --output=orders-client.camel.yaml
```

With `--samples` it writes a sample request and response for each operation, as XML, as JSON, and as a SOAP envelope
with a `curl` command to try it. The same is available as MCP tools, and as a WSDL view in the Camel TUI.

### SOAP on the Platform HTTP Server

The new [CXF Platform HTTP](/components/next/others/cxf-platform-http.html) module serves CXF consumers on the
platform HTTP server of Camel Main and the Camel CLI, sharing the same port, TLS and authentication, so there is no need
for Jetty or Undertow. The CXF component also has first-class options for WS-Security UsernameToken (`wsSecurityUsername`,
`wsSecurityPassword`, ...), and a producer with only a `wsdlURL` now calls the address from the WSDL.

## Finding the Rare Bugs

### Deterministic Simulation Testing

Some bugs only happen once in a few hundred runs: when a connection drops at the moment a commit is in flight, or when a
lock expires during a slow poll. The AI code scans did not find them, and an ordinary test does not hit them,
because a test cannot choose the order in which things happen. As Unmesh Joshi writes in
[Deterministic Simulation Testing](https://martinfowler.com/articles/deterministic-simulation-testing.html) on martinfowler.com:
_"Standard testing simply cannot create these highly specific, degraded conditions on demand."_

Deterministic simulation testing (DST) turns this around. _"Nothing progresses on its own"_: the test controls the clock and
decides when each part runs. Time becomes something we can move forward as fast as we like, so a consumer that waits
30 seconds for a lock to expire costs nothing. And because every decision comes from a seed, the same seed runs the same
scenario again, in exactly the same order.

The new [Test DST](/components/next/others/test-dst.html) module brings this to Camel. It runs the real code of a Camel consumer
under a seeded, virtual-time scheduler. Only the external system is faked, by a *world* that injects faults chosen by the seed
and checks invariants at the end of each run, so thousands of scenarios run in seconds:

```java
@DstInstrument("org.apache.camel.component.aws2.sqs")
class SqsVisibilityDstTest {

    @DstTest(seeds = 1000)
    void noMessageIsDeliveredAgainWhileTheConsumerHoldsIt(Dst dst) throws Exception {
        new SqsWorld(dst).run();
    }
}
```

A failing seed replays exactly with `-Ddst.seed=4711`, so a race that happened once becomes a test you can debug.
Camel 4.24 comes with worlds for Kafka, Kafka Share, AWS Kinesis and SQS, Azure Event Hubs and Service Bus,
Google Pub/Sub, MongoDB change streams, NATS JetStream, MQTT 5, Pulsar, Slack and the ZooKeeper master consumer.
The component pages list the worlds that test them.

These worlds found real bugs, some of them in code that had already been fixed once for a related problem:

- The MongoDB change streams consumer skipped the changes made while it reopened its change stream before the first message
  was routed -- in 50 of 2000 seeds.
- The AWS Kinesis consumer with `iteratorType=LATEST` skipped records when the iterator of a quiet shard expired -- in 44 of 2000 seeds.
- The Azure Service Bus lock renewer gave up after one transient error, so the lock expired and the message was delivered again
  -- in 27 of 1000 seeds.

Each of them was then reproduced with a plain unit test and fixed. Chaos testing found bugs the same way: by making the
faults happen, instead of hoping they happen in a test.

### Exchange Sanitizer

The new [Sanitizer](/components/next/others/sanitizer.html) checks the internal invariants of the Camel routing engine:
that it behaves as specified in all situations. It watches every step of a route and reports when a rule is broken:
an async callback that is called twice or never, a consumer commit that runs twice or not at all, or two threads that use
the same exchange at the same time. We use it with the Camel core tests to keep the routing engine honest.
It can also check your own custom processors and components. In a test you add one annotation:

```java
@CamelSanitizer
class PriceRouteTest extends CamelTestSupport {
    ...
}
```

and with the Camel CLI:

```bash
camel run * --sanitizer
camel get sanitizer --report
```

### Testing with Citrus

The new [Citrus](/components/next/citrus-component.html) test component validates the messages a route sends to it with
[Citrus](https://citrusframework.org/) message validation (JSON, XML and YAML templates with `@ignore@` placeholders, JsonPath and XPath),
like a mock endpoint that can also stand in for a backend. The Citrus YAML tests of the Camel CLI (`camel test run`) are upgraded to
Citrus 5.2. These are the tests we use for the Kamelets and the Camel CLI examples, and there is more to come, see the [roadmap](#roadmap).

## A Faster Camel CI

None of this would be possible without a CI that we can trust. A year ago the Camel Core CI on Jenkins had between one and
four fully green builds per year. Today it has several per day, the build of main takes 1h24 instead of 5h45,
and a small pull request build takes 20 minutes instead of 35.

This matters a lot when much of the code is written with AI coding assistants: an agent can only verify its work when the
build and the tests give a fast and reliable answer, and a reviewer can only trust a green build when green means something.
Read how it was done in [Scaling the Apache Camel Core CI](/blog/2026/11/camel-core-ci-improvements/).

The CI also tests more than before. The integration tests of the Azure and Google Cloud components (Storage, Cosmos DB,
Event Hubs, Service Bus, Key Vault, Functions, Firestore, BigQuery, Secret Manager and more) now run on local emulators
in containers, so they can run in CI without a real cloud account. And the MCP server of
Camel Main is tested with the official MCP conformance suite.

## Camel Core

### Simple Language

[Simple](/components/next/languages/simple-functions.html) has new functions for XML and JSON, such as `stripXmlNamespaces`,
`canonicalXml`, `isValidXml` and `isValidJson`, which come in handy with SOAP payloads.

### Performance

We analyzed the cost of every exchange in the hot path of the routing engine: the time and memory used per step,
single- and multi-threaded, with JFR profiles. Each fix was prototyped and measured before it was made. The main ones:

- **JMX statistics that scale with threads** -- with the default statistics level (which is on as soon as `camel-management`
  is on the classpath), every step of every exchange updated several atomic counters and volatile fields of shared objects,
  so adding threads did not add throughput. The counters now avoid that contention, write only when a value changes, and compute
  the mean when it is read. On a 10-step route with 8 threads, the prototype ran 3.1 times faster (1.87 million instead of 604,000 exchanges a second).
- **Redelivery copies the message, not the exchange** -- with redelivery enabled (a very common production setup), the error handler
  made a full copy of the exchange at every step, just in case. It now keeps a copy of the message only: on a 10-step route
  the prototype used 72% less memory per exchange (2.4 KB instead of 8.7 KB), and 25% less time.
- **Smaller exchanges and messages** -- about 310 bytes less per exchange, and about 75 bytes less per message.
- **Type converter cache** -- a conversion such as `String` to `LoggingLevel` takes 14 ns instead of 1180 ns, and a failed lookup 165 ns instead of 2.6 µs.
- **Many small things** -- no regular expression for a pattern without wildcards, a fast path for endpoint URIs, no rescheduling
  of the throttle cleanup for every exchange, and fewer allocations for timing and async callbacks.
- **Many routes** -- adding routes with ids, and removing or reloading all routes, is no longer quadratic in the number of routes.

There is more to do, and the remaining items are planned for Camel 4.25.

### Other Core Improvements

- The `binary` data type keeps a stream or file body instead of reading it into memory.
- A polling consumer reports DOWN in its health check while a poll hangs.
- `direct` and `kamelet` say *why* no consumer is available: the route and its status, the time waited, and a close name.
- Camel Main runs `transacted` routes with a local transaction manager when the application has one datasource.

## Camel AI

### Semantic EIPs

The [Semantic](/components/next/languages/semantic-language.html) language from Camel 4.23, which lets a route make decisions
on the *meaning* of a message, has grown up in Camel 4.24:

- **A new expert: OpenAI Decisions** -- the [Semantic OpenAI](/components/next/others/semantic-openai.html) expert asks the
  OpenAI Decisions API for typed yes/no, choice and score assessments. It never falls back to a chat completion, so the
  answer is always the type you asked for.
- **Images as input** -- an evaluation can assess text, images or both, so a route can decide on a photo of a parcel, a scanned
  document or a screenshot.
- **Experts are explicit** -- every evaluation names its expert, and the expert modules are split out:
  `camel-semantic-openai`, `camel-semantic-typesafe-ai` and `camel-semantic-wolf-defender` (local prompt-injection detection).
- **Metrics and audit** -- `camel-semantic-micrometer` exports the assessments as Micrometer metrics, and the audit and current
  measurements are shared by JMX, the dev console, the Camel TUI and the CLI.

For example, to decide whether a parcel is damaged from a photo:

```yaml
- beans:
    - name: vision
      type: org.apache.camel.semantic.openai.OpenAIDecisionsSemanticAdapter
      properties:
        endpointUri: "openai:decisions?model=gpt-6-luna"
        maxImageBytes: 10000000
- semantic:
    evaluation:
      damaged:
        expert: vision
        operation: boolean
        state: "${body}"
        parameters:
          instructions: Is the package visibly damaged?
          threshold: 0.5
          uncertainty: 0.1
          uncertaintyPolicy: fail
- route:
    from:
      uri: direct:inspect
      steps:
        - setVariable:
            name: damaged
            expression:
              simple:
                expression: "${semantic('damaged')}"
        - to: direct:route-policy
```

With `uncertaintyPolicy: fail`, an answer that is too close to the threshold fails the exchange instead of guessing,
so your error handling decides what happens to the parcels the model is not sure about.

### Governed AI Agents

A new [Governed AI Agents](/manual/governed-ai-agents.html) page in the user manual brings the pieces from Camel 4.23 and 4.24 together.
In Camel the tools of an AI agent are routes, so every tool call can be governed in the route that does the work:
*who is calling* (SPIFFE), *may they do this* (authorization with OPA, OpenFGA, Cedar or roles), *does this action make sense*
(a semantic guard decision), and *what happened* (GenAI observability). The page has examples in Java, XML and YAML.

### MCP

- The new [AI Prompt](/components/next/ai-prompt-component.html) component exposes a route as an MCP prompt. This completes
  the MCP support with tools (`ai-tool`), resources (`ai-resource`) and now prompts.
- An `ai-tool` route can name the roles its caller needs with `allowedRoles` (such as `allowedRoles: finance,controlling`).
  The roles come from the caller's token -- never from headers or tool arguments.
- The [MCP server](/components/next/others/mcp-server.html) of Camel Main and the Camel CLI supports MCP protocol version 2026-07-28,
  serving without sessions, OAuth with protected resource metadata (RFC 9728), an Origin check, and resource templates.
- The MCP server of the Camel CLI sends instructions to the agent in its `initialize` response: the rules an agent needs before its first call.

### GenAI Observability Levels

The GenAI observability from Camel 4.23 can now record much more, for backends built around LLM traces such as Langfuse.
With `camel.aiObservability.level=detailed` an agent run becomes a span with one `chat` span per model call and one
`execute_tool` span per tool call, and `full` also records the messages and the tool arguments and results -- use it only when
your tracing backend is allowed to store them. The agent runs, model calls and tool calls are also shown in a new `genai`
dev console, in the Camel TUI and through the MCP server.

### Other AI Changes

- `camel-openai` works without an API key, for local OpenAI-compatible servers such as Ollama, vLLM and LM Studio,
  and `jsonSchemaStrict=true` makes the model follow the JSON schema exactly.
- `CamelContentRetriever` turns any Camel endpoint into a LangChain4j `ContentRetriever` for RAG.
- `camel-ibm-watsonx-ai` has new `detectContext` and `detectGenerated` operations, and much more of the chat options of the SDK.
- AI events have a common `AiEvent` API and their own event type in Camel core.
- The Camel examples have an `AGENTS.md` that points coding agents to `llms.txt` and the Camel MCP server.

## Camel Kafka

### Exactly-Once

Kafka-to-Kafka routes can now be exactly-once (read-process-write): the offsets of the consumed records are committed in the
same transaction as the records the route produces:

```java
from("kafka:in?groupId=my-group&exactlyOnce=true&allowManualCommit=true&autoCommitEnable=false&breakOnFirstError=true")
    .to("kafka:out?exactlyOnce=true&transactionalId={{orders.kafka.transactional-id}}");
```

See the [Kafka](/components/next/kafka-component.html) documentation for the requirements.

### Schema Registry

The new `schemaRegistryVendor` option (`confluent`, `apicurio`, `aws-glue` or `azure`) and `schemaFormat` (Avro, JSON or Protobuf)
set up the serializer, the deserializer and the registry properties for you, including the login to the registry:

```text
kafka:orders?brokers=localhost:9092&schemaRegistryVendor=confluent&schemaRegistryURL=http://localhost:8081
```

The Camel CLI downloads the serde JARs of the vendor. The `kafka-source` and `kafka-sink` Kamelets also take a schema registry now.

### Other Kafka Changes

Many fixes for manual commits, rebalances and stopping consumers, some of them found by the new Kafka DST world.

## Other Component Highlights

- `camel-sjms` -- batch consuming is back (`batching=true`).
- `camel-milo` -- one consumer can subscribe to many OPC UA nodes, and recovers when a subscription stops publishing.
- AWS SQS, Kinesis, S3 and Azure Storage Blob consumers fetch in batches, and no longer download a whole poll before routing the first message.
- `camel-hashicorp-vault` -- log in with AppRole, Kubernetes, JWT, a TLS certificate, AWS IAM, Azure managed identity or GCP.
- `camel-google-storage` -- Workload Identity Federation and service account impersonation.

## Documentation and AI Readiness

We want Camel to work well with any AI model, not only the frontier models, but also the small models you run locally.
A small model cannot guess what an option means, so what it reads has to be right and clear.

In Camel 4.23 we validated every code snippet in the documentation. In Camel 4.24 we have started to rewrite the
description of every component and every one of its options: what the component does, what each option is for,
and when to use it, as we did for the EIPs before. This is what an AI model reads from the catalog and the MCP server,
and it helps humans just the same. About a third of the components are done, and we continue in Camel 4.25.

We measure the effect with overnight benchmarks, where local models build real Camel integrations with the Camel CLI
and the MCP server, and every place where a model gets stuck becomes an improvement to the docs, the tools or the hints.
On the intermediate examples (Kafka, a JMS broker, enrich, REST and an LLM in a route), a local model went from 37 to 64 percent
in three nights as we fixed what it failed on -- and that found real bugs in Camel too. Read about it in the blog series [round 1](/blog/2026/09/camel-local-model-benchmark/),
[round 2](/blog/2026/09/camel-local-model-benchmark-round-2/), [round 3](/blog/2026/10/camel-local-model-benchmark-round-3/)
and [round 4: making Camel work for any AI model](/blog/2026/10/camel-local-model-benchmark-round-4/).

### Body Types

The Camel catalog now also describes the message body each component, data format, language and EIP consumes and produces,
using the same terms as the data types (such as `text`, `json` or `binary`). This is a win-win: visual tooling such as
[Kaoto](https://kaoto.io/) and the Camel TUI, and AI models alike, can tell at design time -- without running anything --
which steps fit together, and where the body does not fit and needs a data transformation in between.
The YAML DSL validator already uses it to warn about such a mismatch, and `camel validate` walks the body through a route
step by step, filling the gaps with the body types a running integration has observed.

Next, we are bringing the body types further into the MCP and CLI tools, so an AI model knows what each step takes and gives
while it writes the route, and builds routes that work the first time, instead of finding the mismatch when it runs.

The overhauled Kamelets build on this: they declare the body types they take in and give out, and come with better
data type transformers, so Camel converts the body for you where a conversion is well defined (see [Kamelets](#kamelets)).
And while the integration runs, the Camel TUI shows the body type each step has actually been reached with.

## Camel Spring Boot

Camel is upgraded to Spring Boot 4.2, Spring Framework 7.1 and Spring AI 2.1, and the Camel AI tools are now first class on Spring Boot.
The [MCP server starter](/camel-spring-boot/next/starters/mcp-server.html) serves your Camel `ai-tool`, `ai-resource` and `ai-prompt`
routes as the tools, resources and prompts of the Spring AI MCP server -- on par with Camel Main, including MCP protocol version 2026-07-28,
serving without sessions, OAuth 2.0 with Spring Security, and the identity of the caller passed on to the routes.
Camel routes and Spring-defined tools can be mixed in the same MCP server.

The Spring AI components follow Spring AI 2.1: `spring-ai-chat` has session memory (`sessionService`), the streamable HTTP
transport for the MCP servers it calls, and headers for the finish reason and the reasoning of the model, and
`spring-ai-vector-store` has `UPSERT` and similarity search with the vectors of `spring-ai-embeddings`.
And an option under a prefix that was removed or renamed is now reported at startup, instead of being silently ignored.

## New Components

- `camel-ai-prompt` -- Expose a route as an MCP prompt.
- `camel-apicurio-registry` -- Manage artifacts, groups and versions in Apicurio Registry v3, and validate against its schemas.
- `camel-azure-iothub` -- Send device-to-cloud telemetry and device twin properties to Azure IoT Hub.
- `camel-cedar` -- Embedded Cedar authorization.
- `camel-chaos` -- Chaos testing of a running integration.
- `camel-cxf-platform-http` -- Serve CXF consumers on the platform HTTP server.
- `camel-hibernate` -- HQL queries, natural-id lookups and polling consumers on the native Hibernate API, without JPA.
- `camel-mtconnect` -- Read machine tools through their MTConnect agent.
- `camel-protobuf-schema` -- Protobuf from `.proto` text, without generated classes.
- `camel-sanitizer` -- Exchange sanitizer.
- `camel-semantic-openai` -- OpenAI Decisions API as a semantic expert.
- `camel-semantic-typesafe-ai` and `camel-semantic-micrometer` -- TypeSafe AI expert and Micrometer metrics for the Semantic language.
- `camel-test-citrus` -- Citrus message validation in route tests.
- `camel-test-dst` -- Deterministic simulation testing.
- `camel-vertx-mqtt` -- MQTT 3.1.1 and 5 using the Vert.x MQTT client.
- `camel-xsd-json` -- XML to JSON and back, driven by an XML Schema (the `xsdJson` data format).

## Release Notes

You can find additional information about this release in the list of resolved JIRA tickets:

- [Release notes 4.24](/releases/release-4.24.0/)

If you are upgrading from a previous Camel version, make sure to read the [upgrade guide](/manual/camel-4x-upgrade-guide-4_24.html).

## Roadmap

The next 4.25 release is planned for January 2027, which leads up to Camel 4.26 LTS in about February 2027.

In Camel 4.25 we continue with the AI-assisted component scans, bug fixing and security hardening, and with the
second part of the performance work on the routing engine. Camel Quarkus is scoping the upgrade to Quarkus 4, which may come in Camel 4.25.

We continue to make Camel work for any AI model, also the small models you run locally: the descriptions of the remaining
components, more rounds of the overnight benchmarks, and the [body types](#body-types) in the MCP and CLI tools, so an AI model
knows what each step takes and gives, and builds routes where the body fits at every step.

The [Camel Kit](https://github.com/apache/camel-kit) project is being made ready for its first Apache release.
Camel Kit helps you design, implement and verify Camel integrations with an AI coding assistant: agent skills that take
you from the first idea through planning and implementation to validation, and a Knowledge MCP server that searches the
Camel documentation, release notes, security advisories and component metadata. After its first release, we expect
Camel Kit to work much closer together with Camel itself, such as the Camel CLI, the MCP server and the catalog.

We are also working with the [Citrus](https://citrusframework.org/) team on end-to-end testing with Camel and Citrus
that AI coding agents can do, without Java developers in the loop. A Camel route in YAML DSL and a Citrus test in YAML
are built from the same kind of high-level, low-code building blocks, and we are making the two stronger as a combination.
We use them ourselves to test all the Kamelets and the [Camel CLI examples](https://github.com/apache/camel-jbang-examples).
In the coming releases the Camel CLI, the MCP server and the catalog will know more about Citrus, so an agent can write
the test together with the route, and run both.
