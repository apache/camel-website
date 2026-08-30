---
title: "GenAI Observability with Spring Boot and the Camel Observability Stack"
date: 2026-08-30
draft: false
authors: [atiaomar1978-hub]
categories: ["AI", "Howtos"]
keywords: ["apache camel", "genai", "observability", "spring boot", "prometheus", "opentelemetry", "victoriatraces", "perses", "ollama", "langchain4j", "camel 4.23"]
preview: "Take Camel GenAI observability from CLI/TUI prototypes to production — Spring Boot Actuator, Prometheus scraping, OTLP traces in VictoriaTraces, and optional Perses dashboards."
---

In [Part 1](/blog/2026/08/camel-genai-observability-jbang/) we prototyped GenAI observability with the
Camel CLI and TUI. This follow-up — **Phase 3 (Operate)** — shows the same `gen_ai.*` telemetry in a
**Spring Boot** application wired to the observability stack Camel uses in test-infra: **Prometheus**,
**VictoriaTraces**, and **Perses**.

The runnable sample lives in the [camel-spring-boot-examples](https://github.com/apache/camel-spring-boot-examples)
repository at [`genai-observability`](https://github.com/apache/camel-spring-boot-examples/tree/main/genai-observability).

## Architecture

```
┌─────────────────┐     scrape      ┌──────────────┐
│  Spring Boot    │ ──────────────► │  Prometheus  │
│  Camel + LLM    │                 │  :9090       │
│  :8080          │                 └──────┬───────┘
└────────┬────────┘                        │
         │ OTLP traces                     ▼
         ▼                          ┌──────────────┐
┌─────────────────┐                 │   Perses     │
│ VictoriaTraces  │ ◄── dashboards  │   :8088      │
│ :9428           │                 └──────────────┘
└─────────────────┘

Optional: camel tui ──► Spring Boot via cli-connector
```

For every LLM call in the Java route:

- Actuator `/actuator/prometheus` exposes `gen_ai_client_*` metrics
- OTLP export sends spans with token attributes to VictoriaTraces
- You query traces by `gen_ai.operation.name="chat"`

## Quick start

### Prerequisites

```shell
java -version    # 17+
mvn -version     # 3.9+
docker --version # optional if using the example docker compose
ollama pull llama3.2
ollama serve
```

### Start the observability stack

**Option A — Camel CLI infra (recommended for local dev):**

```shell
camel infra run observability
```

This bundles Prometheus, VictoriaTraces, VictoriaLogs, and Perses — the same stack described in the
[Camel 4.22 what's new post](/blog/2026/08/camel422-whatsnew/#observability-stack). You can also start it
from the [Camel TUI](/manual/camel-jbang-tui.html) infrastructure panel.

**Option B — Example docker compose:**

From the example directory:

```shell
git clone https://github.com/apache/camel-spring-boot-examples.git
cd camel-spring-boot-examples/genai-observability
docker compose up -d
```

| Service | Port | Role |
|---------|------|------|
| Prometheus | 9090 | Scrapes Spring Boot Actuator Prometheus endpoint |
| VictoriaTraces | 9428 | Stores OTLP traces; UI at `/select/vmui` |
| Perses | 8088 | Metrics dashboards (optional visualization) |

The example `docker-compose.yml` uses the same container images as `camel-test-infra-observability`.
When using `camel infra run observability`, ports and OTLP endpoints align with the CLI stack so you can
switch between Part 1 CLI prototyping and this Spring Boot example without reconfiguring collectors.

### Run Spring Boot

```shell
mvn spring-boot:run
```

Wait for:

```text
Started GenAiObservabilityApplication
LLM reply: Apache Camel is an integration framework...
Models: req=llama3.2 resp=llama3.2
```

## Verify GenAI metrics

```shell
curl -s http://localhost:8080/actuator/prometheus | grep gen_ai
```

Expected Micrometer names:

- `gen_ai_client_operation` — timer/summary of LLM call duration
- `gen_ai_client_token_usage` — counter with tag `gen_ai_token_type=input|output`

### Prometheus queries

Open [http://localhost:9090](http://localhost:9090) and try:

```promql
# Total output tokens over time
increase(gen_ai_client_token_usage_total{gen_ai_token_type="output"}[1h])

# LLM call rate
rate(gen_ai_client_operation_count[5m])

# By Camel component
sum by (camel_component) (gen_ai_client_operation_count)
```

### Example alert rule (sketch)

```yaml
groups:
  - name: camel-genai
    rules:
      - alert: HighGenAITokenBurn
        expr: rate(gen_ai_client_token_usage_total[15m]) > 1000
        for: 10m
        labels:
          severity: warning
        annotations:
          summary: "High GenAI token usage on {{ $labels.job }}"
```

## Explore traces in VictoriaTraces

Open [http://localhost:9428/select/vmui](http://localhost:9428/select/vmui)

Useful trace search filters:

- `gen_ai.operation.name="chat"`
- `gen_ai.request.model="llama3.2"`
- `camel.component="langchain4j-chat"`

Each span carries `gen_ai.usage.input_tokens`, `gen_ai.usage.output_tokens`,
`gen_ai.response.finish_reasons`, and `gen_ai.system` (e.g. `langchain4j`).

Correlate traces with logs by passing the trace ID from MDC — see the
[OpenTelemetry docs](/manual/camel-jbang-tui.html#_opentelemetry_spans).

## Key configuration

### Maven dependencies (excerpt)

```xml
<dependency>
    <groupId>org.apache.camel.springboot</groupId>
    <artifactId>camel-spring-boot-starter</artifactId>
</dependency>
<dependency>
    <groupId>org.apache.camel.springboot</groupId>
    <artifactId>camel-observability-services-starter</artifactId>
</dependency>
<dependency>
    <groupId>org.apache.camel.springboot</groupId>
    <artifactId>camel-langchain4j-chat-starter</artifactId>
</dependency>
<dependency>
    <groupId>org.apache.camel</groupId>
    <artifactId>camel-ai-observability</artifactId>
    <version>${camel-version}</version>
</dependency>
<dependency>
    <groupId>dev.langchain4j</groupId>
    <artifactId>langchain4j-ollama-spring-boot-starter</artifactId>
</dependency>
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-actuator</artifactId>
</dependency>
<dependency>
    <groupId>io.micrometer</groupId>
    <artifactId>micrometer-registry-prometheus</artifactId>
</dependency>
```

### application.properties

```properties
# LangChain4j / Ollama (auto-configures chatLanguageModel bean)
langchain4j.ollama.chat-model.base-url=http://localhost:11434
langchain4j.ollama.chat-model.model-name=llama3.2
langchain4j.ollama.chat-model.temperature=0.2
langchain4j.ollama.chat-model.timeout=PT120S

# GenAI observability
camel.aiObservability.enabled=true
camel.opentelemetry2.enabled=true

# Spring Actuator (Prometheus scrape target)
management.endpoints.web.exposure.include=health,prometheus,info
management.prometheus.metrics.export.enabled=true

# OTLP export to VictoriaTraces
camel.opentelemetry2.export-target=jaeger
otel.exporter.otlp.endpoint=http://localhost:9428/insert/opentelemetry/v1/traces
otel.exporter.otlp.protocol=http/protobuf
```

The global toggle is `camel.aiObservability.enabled` (Camel Main and Spring Boot). It defaults to `true`
when tracing or metrics backends are present.

### The Camel route (Java)

Spring Boot examples typically use Java `RouteBuilder` classes — here the route calls the
LangChain4j `chatLanguageModel` bean auto-configured by `langchain4j-ollama-spring-boot-starter`:

```java
import org.apache.camel.builder.RouteBuilder;
import org.springframework.stereotype.Component;

@Component
public class GenAiRoute extends RouteBuilder {

    @Override
    public void configure() {
        from("timer:genai?period=15000")
                .routeId("genai-chat")
                .setBody(constant("In one sentence, what is Apache Camel integration?"))
                .to("langchain4j-chat:demo?chatModel=#chatLanguageModel")
                .log("LLM reply: ${body}")
                .log("Models: req=${header.CamelLangChain4jChatRequestModel} "
                        + "resp=${header.CamelLangChain4jChatResponseModel}");
    }
}
```

The [example repository](https://github.com/apache/camel-spring-boot-examples/tree/main/genai-observability)
also includes a YAML route variant under `src/main/resources/camel/` if you prefer route configuration in
files rather than Java.

## Optional: Camel TUI against Spring Boot

Uncomment `camel-cli-connector-starter` in `pom.xml` and set `camel.cli.enabled=true`, then run `camel tui`.
You get the same **Spans** tab and **Ctrl+U** AI Usage view as Part 1, but against a production-style runtime.

## CLI/TUI vs Spring Boot

| Concern | Part 1 (CLI/TUI) | Part 2 (Spring Boot) |
|---------|------------------|----------------------|
| Time to first span | Minutes (`camel run --observe`) | Minutes + observability stack |
| Metrics endpoint | `/observe/metrics` on port 9876 | `/actuator/prometheus` on port 8080 |
| Trace UI (dev) | TUI Spans tab (built-in) | VictoriaTraces VMUI |
| Production fit | Prototyping, CI demos | Standard Spring ops (Actuator, K8s probes) |

Most teams: **prototype in CLI/TUI**, **deploy observability pattern in Spring Boot**.

## Production checklist

1. Set `camel.aiObservability.enabled=true` explicitly in all environments
2. Scrape `/actuator/prometheus` (or `/observe/metrics` for Camel Main)
3. Export OTLP to your org's collector (Jaeger, Tempo, VictoriaTraces, etc.)
4. Alert on `gen_ai_client_token_usage` rate and `gen_ai_client_operation` p99
5. Use route IDs (`genai-chat`) in dashboards to attribute cost per integration

Disable globally with `camel.aiObservability.enabled=false` when running load tests without LLM overhead.

## Troubleshooting

| Issue | Resolution |
|-------|------------|
| Prometheus empty targets | Spring Boot must be running on 8080; check `host.docker.internal` on Linux |
| No traces in VictoriaTraces | Verify `otel.exporter.otlp.endpoint`; check app logs for OTLP export errors |
| `chatLanguageModel` not found | Confirm `langchain4j-ollama-spring-boot-starter` and Ollama properties |
| No `gen_ai` metrics | Add `camel-ai-observability` + `camel-observability-services-starter` |

## Learn more

- [Part 1: CLI and TUI](/blog/2026/08/camel-genai-observability-jbang/)
- [AI Observability component source](https://github.com/apache/camel/blob/main/components/camel-ai/camel-ai-observability/src/main/docs/ai-observability.adoc) (4.23+)
- [Observability Services](/components/next/others/observability-services.html)
- [LangChain4j Spring Boot Integration](/manual/langchain4j-spring-boot-integration.html)
- [Camel AI components](/components/next/ai-summary.html)
- [Spring Boot example](https://github.com/apache/camel-spring-boot-examples/pull/191)

---

*This post was written by Omar Atie ([@atiaomar1978-hub](https://github.com/atiaomar1978-hub)) with assistance from Cursor Cloud Agent.*
