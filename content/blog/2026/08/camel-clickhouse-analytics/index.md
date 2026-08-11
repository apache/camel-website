---
title: "Real-Time Analytics with Apache Camel and ClickHouse"
date: 2026-08-11
draft: false
authors: [atiaomar1978-hub]
categories: ["Howtos"]
keywords: ["apache camel", "clickhouse", "olap", "analytics", "kafka", "ingestion", "rowbinary", "camel component", "camel 4.22"]
preview: "Apache Camel 4.22 adds a dedicated ClickHouse component for high-throughput OLAP ingestion and queries — here's why it exists, how it works, and three routes you can copy today."
---

If you are building event pipelines, metrics dashboards, or log analytics, there is a good chance ClickHouse sits at the
end of the line. It is fast, column-oriented, and built for append-heavy workloads. The question for Camel users is
usually not *whether* to use ClickHouse, but *how* to connect to it cleanly from routes.

You can already reach ClickHouse through JDBC or the generic SQL component. That works — but you miss native format
streaming, server-side async inserts, and the tuning knobs that make ClickHouse fast at scale. Apache Camel **4.22**
introduces `camel-clickhouse`, a producer-only component built on the official ClickHouse Java client (v2).

In this post I walk through why a dedicated component helps, how the URI is structured, and three practical patterns:
Kafka batch ingestion, fire-and-forget HTTP ingest, and a simple health-check route.

## Why not just use JDBC?

ClickHouse shines when you bulk-load data in native formats like **RowBinary** or **JSONEachRow**. JDBC tends to push
you toward row-at-a-time inserts and generic type mapping. The dedicated component exposes ClickHouse capabilities as
first-class endpoint options:

- **Native format inserts** — stream `InputStream`, `byte[]`, `String`, `File`, or typed `List` bodies
- **Server-side async inserts** — let ClickHouse buffer small writes and flush in the background
- **Client-side batching** — split large lists before sending
- **OLAP queries** — run SQL and get results back as CSV, JSONEachRow, or other formats
- **Health checks** — a built-in `ping` operation for ops monitoring

The component is currently marked **Preview** in Camel 4.22, so APIs may evolve — but the patterns below are stable
enough to start prototyping today.

## Getting started

Add the dependency:

```xml
<dependency>
    <groupId>org.apache.camel</groupId>
    <artifactId>camel-clickhouse</artifactId>
    <version>4.22.0</version>
</dependency>
```

### URI format

```
clickhouse://database[.table]?[options]
```

Examples:

```text
# Default insert (JSONEachRow)
clickhouse://analytics.events?serverUrl=http://localhost:8123

# High-throughput RowBinary insert
clickhouse://analytics.events?operation=insert&format=RowBinary&serverUrl=http://clickhouse:8123

# OLAP query
clickhouse://analytics?operation=query&format=JSONEachRow&serverUrl=http://clickhouse:8123

# Connectivity check
clickhouse://default?operation=ping&serverUrl=http://clickhouse:8123
```

Connection settings can live on each URI, or you can configure them once at component level — handy in Spring Boot:

```properties
camel.component.clickhouse.serverUrl=http://clickhouse:8123
camel.component.clickhouse.username=admin
camel.component.clickhouse.password=${CLICKHOUSE_PASSWORD}
camel.component.clickhouse.compression=true
```

For production, you can also register a shared `com.clickhouse.client.api.Client` bean and autowire it into the
component. Every endpoint then reuses the same connection pool.

## Three operations

| Operation | Default? | Body in | Body out |
|-----------|----------|---------|----------|
| `insert` | Yes | Data to load | unchanged |
| `query` | No | SQL string | Result as `String` |
| `ping` | No | ignored | `boolean` |

Useful response headers:

- `CamelClickHouseWrittenRows` — rows inserted
- `CamelClickHouseReadRows` — rows returned by a query
- `CamelClickHousePingOk` — connectivity result

You can override `operation`, `database`, `table`, and `format` per message via headers — one endpoint can fan out to
many tables if your route sets `CamelClickHouseTable` dynamically.

## Pattern 1: Kafka → ClickHouse (batch ingestion)

This is the classic analytics pipeline: consume events, aggregate into batches, insert with RowBinary for throughput.

```java
from("kafka:events?groupId=analytics")
    .aggregate(constant(true), new GroupedBodyAggregationStrategy())
        .completionSize(5000)
        .completionTimeout(2000)
    .to("clickhouse://analytics.events?operation=insert&format=RowBinary")
    .log("Inserted ${header.CamelClickHouseWrittenRows} rows");
```

RowBinary is compact and fast. If your upstream already produces newline-delimited JSON, switch the format to
`JSONEachRow` and keep the same route shape — only the format parameter changes.

### Minimal insert + query round-trip

Here is a stripped-down version of the integration test that ships with the component:

```java
from("direct:insert")
    .to("clickhouse://mydb.camel_events?operation=insert&format=JSONEachRow");

from("direct:query")
    .to("clickhouse://mydb?operation=query&format=JSONEachRow");

// Send two JSON rows
String body = "{\"id\":1,\"name\":\"alice\"}\n{\"id\":2,\"name\":\"bob\"}\n";
template.sendBody("direct:insert", body);
// header CamelClickHouseWrittenRows == 2

String count = template.requestBody("direct:query",
    "SELECT count() FROM mydb.camel_events", String.class);
// count.trim() == "2"
```

## Pattern 2: HTTP ingest with async inserts

Microservices often POST small payloads one at a time. Inserts that small can overwhelm ClickHouse if you flush on
every request. Enable **server-side async inserts** and return quickly:

```java
from("platform-http:/ingest")
    .to("clickhouse://metrics.samples?operation=insert&asyncInsert=true&waitForAsyncInsert=false");
```

ClickHouse buffers the writes and merges them according to its own schedule. For high-concurrency HTTP endpoints this
is usually the right default. Turn `waitForAsyncInsert` back to `true` when you need stronger durability guarantees
before responding to the client.

## Pattern 3: Scheduled rollup + health check

Analytics is not only about loading data — you also query it. A timer route can run periodic rollups and push results
downstream:

```java
from("timer:rollup?period=60000")
    .setBody(constant("SELECT count() FROM analytics.events"))
    .to("clickhouse://analytics?operation=query&format=JSONEachRow")
    .to("kafka:rollup-metrics");
```

And a separate health route keeps ops informed:

```java
from("timer:health?period=30000")
    .to("clickhouse://default?operation=ping")
    .choice()
        .when(header("CamelClickHousePingOk").isEqualTo(true))
            .to("direct:markHealthy")
        .otherwise()
            .to("direct:alertOps")
    .end();
```

## File-based ingestion

If events land as files on disk — Parquet exports, CSV dumps, or pre-encoded RowBinary — the file component pairs
naturally with ClickHouse:

```java
from("file:/data/events?noop=true")
    .to("clickhouse://analytics.events?format=RowBinary&compression=true");
```

The producer accepts `File` and `WrappedFile` bodies and streams them through the native client, so you do not need to
load the entire file into memory first. Enable `compression=true` for LZ4 compression on the wire — useful when
ClickHouse runs in the cloud or on a remote cluster.

## When to choose what

| Scenario | Suggested approach |
|----------|-------------------|
| High-volume event stream | Kafka aggregate → RowBinary insert |
| Many small HTTP posts | `asyncInsert=true`, `waitForAsyncInsert=false` |
| Typed Java objects / maps | `List` body + optional `batchSize` |
| Periodic reporting | `timer` → `query` → downstream endpoint |
| Ops monitoring | `ping` on a timer |
| Bulk file loads | `file` → RowBinary or Parquet |

## Learn more

- [ClickHouse component documentation](/components/next/clickhouse-component.html)
- [ClickHouse official docs](https://clickhouse.com/docs)
- Source: [`camel-clickhouse`](https://github.com/apache/camel/tree/main/components/camel-clickhouse) in the Apache Camel repository

The component is producer-only by design — ClickHouse is a write-heavy OLAP store, and ingestion typically comes from
upstream systems (Kafka, HTTP, files, JMS) rather than polling. If you try these routes and have feedback, open an
issue or reach out on [Zulip](https://camel.zulipchat.com/) — more voices on the blog and in the community help
everyone.

---

*This post was written by Omar Atie ([@atiaomar1978-hub](https://github.com/atiaomar1978-hub)) with assistance from Cursor Cloud Agent.*
