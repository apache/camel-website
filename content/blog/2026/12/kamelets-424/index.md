---
title: "Kamelets 4.24: documented, tested, and with data types that fit together"
date: 2026-12-01
draft: true
authors: [ davsclaus ]
categories: [ "Camel", "Kamelets" ]
keywords: ["apache camel", "kamelets", "camel 4.24", "data types", "camel cli", "citrus", "upgrade"]
preview: "The Kamelet catalog of Camel 4.24 has had a big overhaul: every Kamelet documented and almost all tested, old ones removed, new ones added, and data types in and out that Camel core matches for you."
---

The Kamelet catalog that comes with Camel 4.24 has had the biggest overhaul since Kamelets were introduced. This post gives a short tour, and then shows one change with a small example: two Kamelets whose data does not fit together, and how Camel 4.24 makes them fit.

## Every Kamelet is documented

Every Kamelet has a new description. It starts with a one-line summary, followed by what to use it for, what it takes as input, what it gives as output, and what is good to know: the defaults, the limits, and what happens when something goes wrong.

The descriptions are written for integrators who do not know Camel, and for AI assistants, which often read only the Kamelet YAML. Every fact in them was checked by running the Kamelet.

## Almost every Kamelet is tested

220 of the 236 Kamelets are now tested with [Citrus](https://citrusframework.org/) and Camel CLI, in about 270 tests that run against real brokers, databases and cloud emulators in containers. Writing the tests found many bugs, in the Kamelets and in Camel itself, and they are fixed in 4.24.

## Out with the old, in with the new

About 40 Kamelets are removed: some could no longer work (the Twitter v1.1 API, Dropbox, MinIO), some were little used, and some were variants that the plain Kamelets now cover, such as the Apicurio Registry variants of the Kafka Kamelets, as `kafka-source` and `kafka-sink` now take a schema registry.

There are also new Kamelets, among others:

- `soap-source` and `soap-action`, to serve a SOAP web service from a WSDL
- `debezium-postgresql-source`, the row changes of PostgreSQL tables as they happen
- `openai-chat-action`, to ask a chat model of OpenAI or of any OpenAI-compatible server, such as Ollama
- `ai-tool-source`, to offer a flow as a tool to AI agents over MCP
- `smb-source` and `smb-sink`, `mllp-source` and `mllp-sink`, `csv-deserialize-action` and `csv-serialize-action`, `xslt-action`, `aws-eventbridge-source`, `kafka-share-source`, and `jms-apache-activemq-source` and `jms-apache-activemq-sink`

New Kamelets start at the *Preview* support level.

## Data types that fit together

A Kamelet can declare the data type it takes in and the one it gives out, such as `text`, `json` or `binary`. In 4.24, many more Kamelets declare a default data type, and Camel core uses the data type transformers to turn the message body into that type. So the body between two Kamelets has a known type, and not whatever the component of the previous step happened to leave behind: a stream, a `String`, a `Map`.

Let's see what that means with an example: CSV files go into a PostgreSQL table.

```yaml
- route:
    from:
      uri: "kamelet:file-watch-source"
      parameters:
        filePath: "inbox"
        events: "CREATE"
      steps:
        - to: "kamelet:csv-deserialize-action"
        - split:
            simple: "${body}"
            steps:
              - log: "row: ${body} (${body.getClass().getSimpleName()})"
              - to:
                  uri: "kamelet:postgresql-sink"
                  parameters:
                    serverName: "localhost"
                    serverPort: "55432"
                    username: "demo"
                    password: "demo"
                    databaseName: "shop"
                    query: "INSERT INTO orders (id, item, qty) VALUES (CAST(:#id AS int), :#item, CAST(:#qty AS int))"
              - log: "inserted ${header.CamelSqlUpdateCount} row"
```

The two Kamelets in the middle do not naturally fit:

- `csv-deserialize-action` turns the CSV text into a `List` of rows, and each row is a Java `Map` from the column name to the value.
- `postgresql-sink` takes one JSON object, and fills `:#id`, `:#item` and `:#qty` in the SQL from its fields.

So after the split, a `Map` goes into a Kamelet that expects JSON.

With this file in the `inbox` folder:

```text
id,item,qty
1,Camel plush,2
2,Kamelet mug,1
```

Camel 4.24 logs:

```text
row: {id=1, item=Camel plush, qty=2} (LinkedHashMap)
inserted 1 row
row: {id=2, item=Kamelet mug, qty=1} (LinkedHashMap)
inserted 1 row
```

and the rows are in the table:

```text
 id |    item     | qty
----+-------------+-----
  1 | Camel plush |   2
  2 | Kamelet mug |   1
```

You can see how the body types line up in the [Camel TUI](/blog/2026/07/camel-tui/), the terminal UI of the Camel CLI. Start it with `camel tui` while the route runs, press `2` for the Source view, and open `csv-to-db.camel.yaml`. This screenshot is from the Camel TUI, after the file with two rows was processed:

![The Source view of the Camel TUI, with the body type of each step of the route](./camel-tui-body-types.png)

The Source view shows the route as you wrote it, and next to each step what happened when it ran:

- the column after the line number is how many messages reached the step, and how long the step took on average;
- the column on the right is the Java type of the message body when it reached the step;
- at a step that calls a Kamelet with a data type, an arrow shows what Camel turns the body into before the Kamelet sees it.

Read the right column from top to bottom: `csv-deserialize-action` gets the `File` from `file-watch-source`, and Camel turns it into `text`, which is what the Kamelet takes. The split gets the `ArrayList` of rows, and the log and `postgresql-sink` each get one row as a `LinkedHashMap`, twice. So the TUI shows exactly where the shapes do not fit, and what Camel does about it: on line 13 a `Map` goes into a sink that takes JSON, and `LinkedHashMap → json` says that Camel turns it into JSON first. The counts show that the sink ran for both rows, and the last log line that both inserts were done. Move the cursor to line 13, and the TUI explains it at the bottom: the Kamelet `postgresql-sink` takes `json`, and Camel turns the body into it before the Kamelet sees it, with the data type transformer.

The TUI shows the actual Java types, as they were when the route ran, and the `text` and `json` after the arrows are broader terms. Camel 4.24 describes message bodies in such terms in the Camel catalog too, so that tools and AI assistants can tell what a step takes and gives without running it:

- the kind of Java object the body is in: `text`, `bytes`, `stream`, `file`, `value`, `map`, `list`, `iterator` or `pojo`;
- the format of the data in it: `json`, `xml`, `csv`, `yaml`, `text` or `binary`, the same names as the data types of the Kamelets.

`camel doc` shows them, for example for the CSV data format (`camel doc dataformat:csv`):

```text
Marshal input    │ map or list. One row as a Map, or the rows as a List (or an Iterator) of Maps or Lists
Marshal output   │ stream, as csv. The CSV in the stream cache, or a byte array when stream caching is off
Unmarshal input  │ text, bytes, stream or file, as csv
Unmarshal output │ list. A List of the rows, each a List of its values; with useMaps or useOrderedMaps, a Map of the header names and the
                 │ values. With lazyLoad=true: iterator. Not known when recordConverterRef is set
```

In those terms, the route reads: `file-watch-source` gives a `file` (here with `csv` in it); `csv-deserialize-action` gives a `list` of `map`s; and `postgresql-sink` takes `json`.

While the route runs, the format travels with the message in the `Content-Type` header: the data types of the Kamelets set it to match, such as `application/json` for `json`, `text/plain` for `text` and `application/octet-stream` for `binary`.

### From a LinkedHashMap to JSON

A `LinkedHashMap` is a plain Java `Map` that keeps its keys in the order they were added. `csv-deserialize-action` gives each row as one, so the columns stay in the order of the CSV header. The log prints it the Java way, `{id=1, item=Camel plush, qty=2}`, which looks a bit like JSON but is not: it is just the `toString()` of the `Map`.

Why does a SQL sink want JSON at all? Kamelets come from event-driven and serverless integration, with Camel K, Knative and CloudEvents, where the data passed between steps is JSON. So a sink such as `postgresql-sink` takes a JSON object, and a source gives JSON. A Camel developer often has a `Map` or a Java object (POJO) instead, as here.

`postgresql-sink` needs JSON, and that is where Camel's own JSON support comes in. The sink declares the data type it takes:

```yaml
  dataTypes:
    in:
      default: json
      types:
        json:
          format: "application-json"
```

`application-json` is the name of a data type transformer that comes with Camel, in `camel-jackson3`, which the Kamelet already depends on. Because `json` is the `default`, Camel runs this transformer on every message before the template of the sink sees it. The transformer looks at what the body is:

- a `Map` becomes a JSON object, and a `List` a JSON array, written by Jackson;
- JSON text, bytes or a stream is kept as it is;
- a Jackson `JsonNode` or a Java object (POJO) is written as JSON too.

The result is JSON as bytes, and the `Content-Type` header is set to `application/json`. So the first row reaches the template of the sink as:

```json
{"id":"1","item":"Camel plush","qty":"2"}
```

From there the sink works as it always did: it reads the JSON object, and fills `:#id`, `:#item` and `:#qty` of the SQL from its fields. Nobody had to write a converter, and the route did not need an extra step: the Kamelet says what it needs, and Camel turns the body into it.

In Camel 4.23 the same route fails. `csv-deserialize-action` is new in 4.24, so for the comparison we used the CSV data format with `useOrderedMaps: true` in its place, which gives the same `Map` rows. The 4.23 `postgresql-sink` does not declare a data type, and fails on its first step:

```text
org.apache.camel.NoTypeConversionAvailableException: No type converter available to convert from type: java.util.LinkedHashMap to the required type: java.io.InputStream
```

and no rows are written. In 4.23 you had to know about this and put `json-serialize-action` in front of the sink yourself. In 4.24 you can still do that, but you no longer have to.

One thing data types do not do is guess types inside the data. CSV values are text, so the `id` and `qty` of the JSON are strings, and PostgreSQL refuses a string for an `int` column (`column "id" is of type integer but expression is of type character varying`). That is why the SQL above has `CAST(:#id AS int)`.

Not every Kamelet gets a default. `csv-deserialize-action` does not declare one for its output on purpose: there is no data type that keeps a `List` of `Map`s as it is, and a default would turn it into something else. A default data type runs its transformer on every message, so it is only added where it gives the body the Kamelet really needs.

To try the example yourself, start PostgreSQL in a container:

```shell
docker run -d --name shop-db -p 55432:5432 -e POSTGRES_USER=demo -e POSTGRES_PASSWORD=demo -e POSTGRES_DB=shop postgres:17
docker exec shop-db psql -U demo -d shop -c "CREATE TABLE orders (id int primary key, item text, qty int)"
```

save the route as `csv-to-db.camel.yaml`, run it with `camel run csv-to-db.camel.yaml`, and copy a CSV file into the `inbox` folder (`file-watch-source` only sees files created after it starts).

## Security model and SBOM

The catalog now has a [security model](/camel-kamelets/next/security-model.html), which says what counts as a vulnerability of a Kamelet, and what is the responsibility of the route author and the operator. Following it, many Kamelets now remove the Camel headers of an incoming message that could change where they send it, and secret options are marked as credentials.

The catalog also publishes an SBOM of the libraries that the Kamelets pin, such as JDBC drivers. It is checked against [OSV](https://osv.dev/) every week, as Dependabot cannot see versions inside Kamelet YAML.

## Upgrading

Some of these changes are not backwards compatible: removed Kamelets, renamed options, and changed defaults and behaviour, such as the data types above. They are all listed in the [Camel 4.24 upgrade guide](/manual/camel-4x-upgrade-guide-4_24.html), with what to use or change instead.

We would love to hear how the new catalog works for you, on the [mailing list](/community/mailing-list/) or in the [Zulip chat](https://camel.zulipchat.com/).
