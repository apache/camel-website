---
title: "Round 3: making Kamelets AI-ready"
date: 2026-10-09
draft: false
authors: [davsclaus]
categories: ["AI", "Tooling"]
keywords: ["apache camel", "AI", "local model", "ollama", "coding agent", "MCP", "kamelets", "camel cli", "yaml dsl", "validation", "camel 4.23"]
preview: "A local model knows Camel's components from memory, but hardly knows Kamelets. Once Camel's catalog tools and validator knew them too, Kamelets went from 1 of 15 steps to 47 of 50, ahead of the components they wrap, and the model wrote its own Kamelets 19 times out of 20. The step-by-step ladder reached 92 percent. All of it ships in Camel 4.23."
---

This is the third post in a series. In the [first](/blog/2026/09/camel-local-model-benchmark/) a frontier model coached a small local model through thirteen beginner examples, and we fixed Camel between the runs. In the [second](/blog/2026/09/camel-local-model-benchmark-round-2/) the examples became a ladder of real-world ones, and the model worked step by step, the way developers do. Both rounds ended the same way: most of what the model tripped over was wrong or unclear for people too, and the fixes ship in Camel 4.23.

The setup has not changed: the same 22 GB local model (`qwen3.6:35b-a3b` in Ollama), the [camel-jbang-mcp server](/manual/camel-jbang-mcp.html) as its tools, a frontier model reading every failed attempt, and Camel on the main branch. This round looked at something new: Kamelets.

## Models know components, not Kamelets

[Kamelets](/camel-kamelets/next/) are Camel's route snippets with a name and a set of properties: `kafka-source`, `timer-source`, `extract-field-action`. They hide the details of a component behind a few properties, which makes them the natural building blocks for low-code tools, and, it seemed to us, for AI agents.

So we wrote the same tasks twice, once with Kamelets and once with the plain components they wrap: a timer that makes orders, then extracts a field, then filters; a Kafka sink and a source. A third task asked the model to write its own Kamelet, `tag-order-action`, use it, and then add a property to it. The model did each task in two ways: *bare*, with only tools to read and write files, and *with tools*, through the camel-jbang-mcp server with its catalog, validation and the running app.

The first result was clear. With the components, the model passed 13 of 15 steps bare and 14 of 15 with tools. With Kamelets it passed 3 of 15 bare, and 1 of 15 with tools.

The tools made it *worse*, and the traces said why. The catalog tools knew every component, every EIP and every data format, but not a single Kamelet. The model asked `camel_catalog_find` for the Kamelet 13 to 20 times per step, found nothing, and ran out of calls before it wrote a file. Bare, it guessed the Kamelet's properties from the component it wraps: `brokerList` on `kafka-sink` (the property is `bootstrapServers`), `jsonBody` on `timer-source`, a `timer-source` without its required `message`. The validator accepted all of it, and the app failed at startup with "mandatory parameters must be provided". It also reached for `kafka-not-secured-source`, a Kamelet that has been folded into `kafka-source`. The frontier model writing the reference solution made the same mistake on its first try.

None of this was a problem with the Kamelets. It was a gap in Camel's tooling: the tools an agent uses did not know Kamelets existed.

## Making Kamelets AI-ready

The fixes are small, and every one of them helps a person at the keyboard too.

- **The catalog tools know Kamelets** ([CAMEL-25379](https://issues.apache.org/jira/browse/CAMEL-25379)). `camel_catalog_doc` answers a Kamelet with its type, the YAML to write and its properties: which are required, their types, defaults and allowed values. `camel_catalog_find` lists the Kamelets that match. An unknown name suggests the close ones, so `kafka-not-secured-source` points to `kafka-source`.
- **The validator checks `kamelet:` endpoints**, against the Kamelet catalog and the project's own `*.kamelet.yaml` files. An unknown Kamelet, a misspelled property or a missing required one is reported when the file is written, with the line, instead of at startup. A misspelled *optional* property used to never fail at all; it was silently ignored.
- **Writing your own Kamelet gets hints.** The model's own Kamelet files failed on their shape: `definition:` written as a list, the property read as `${properties.tag}` instead of the placeholder `{{tag}}`, a property used but never declared. The validator now says, for example, that "in a Kamelet's template its property tag is the placeholder {{tag}}", and that a property is declared under `spec.definition.properties`.
- **Bugs the runs found on the way.** A Kamelet whose template starts from the Kamelet itself made the JVM die with a `StackOverflowError`; it now fails with a message that names the loop ([CAMEL-25387](https://issues.apache.org/jira/browse/CAMEL-25387)). An unset optional path option could be cut out of the value of another option when a Kamelet's endpoint was built ([CAMEL-25383](https://issues.apache.org/jira/browse/CAMEL-25383)). Camel's own Kamelets no longer log a compact-notation warning on every reload ([CAMEL-25380](https://issues.apache.org/jira/browse/CAMEL-25380)), and `camel validate normalize` handles Kamelet files ([CAMEL-25381](https://issues.apache.org/jira/browse/CAMEL-25381)). Kamelet defaults showed as `AnyType(value=1000)` in `camel doc` and now show as `1000`.

## The numbers

After the fixes we ran the side check twice, five runs each time, on two builds a few days apart. Steps passed, both series together:

| | bare | with tools |
|---|---|---|
| Catalog Kamelets (before the fixes, 3 runs) | 3 of 15 | 1 of 15 |
| Catalog Kamelets (after, 10 runs) | 39 of 50 | **47 of 50** |
| The same tasks with components (after, 10 runs) | 45 of 50 | 37 of 50 |
| Writing your own Kamelet (after, 10 runs) | 5 of 20 | **19 of 20** |

Three things stand out.

**From memory, a model knows components, not Kamelets.** Bare, the components still do better, 45 against 39. That is what you would expect: a model has read years of component examples and few Kamelets.

**With tools that know Kamelets, Kamelets do better than the components they wrap**, 47 against 37. A Kamelet has fewer and better-named properties than its component, and once the model can look them up, there is less to get wrong. One caveat: the component tasks with tools are the noisier row. In the orders task the model often writes a `choice` where the request asks for a `filter`, which is the model's misreading, not the component's.

**The model can write its own Kamelets, with tools: 19 of 20.** Bare it manages 5 of 20. This is the result we care about most.

## Your own Kamelets as building blocks for agents

The catalog Kamelets are useful, but a model that has the component docs can manage without them. Custom Kamelets are different. A team's own Kamelets, "tag an order", "call the courier", "send to the archive", put a name on the business steps of that team, hide how they are done, and are versioned and tested as files in the project. They are exactly the vocabulary you would want an agent to use when it builds or changes a route: fewer choices, the right ones, and named the way the business talks.

That only works if an agent can find those Kamelets, use them correctly, and write new ones in the right shape. That is what the side check measured, and with the tools of Camel 4.23 a 22 GB local model does it nineteen times out of twenty. Making Kamelets AI-ready did not mean changing the Kamelets. It meant teaching Camel's tools about them.

## The ladder: 92 percent

The step-by-step ladder from round 2 kept running alongside. It has grown to 21 real-world examples and 71 steps, each run five times, from a file splitter to a contract-first OpenAPI service, all of them around one fictional web shop.

| Series | Steps passed | Final state right |
|---|---|---|
| r3, Oct 3 | 300 of 355 (84.5%) | |
| r4, Oct 5 | 307 of 355 (86.5%) | 318 of 355 |
| r5, Oct 6 | 318 of 355 (89.6%) | 329 of 355 |
| r6, Oct 7 | 315 of 355 (88.7%) | 326 of 355 |
| r7, Oct 9 | **328 of 355 (92.4%)** | **335 of 355** |

From r4 the model has a 64k context instead of 32k; r3 ran out of context on a few steps. In r7, 79 of the 105 runs passed every step, and ten examples passed all five runs.

Between the series came another long list of small fixes, all in Camel 4.23. A few:

- **Say how to write an expression.** `split: {expression: "${body}"}` was reported twice as "expression: string found, object expected", which does not say what to write. In r6 that message turned up 183 times in the model's traces, in ten steps where it looped on it. Now it is reported once, with the YAML to write ([CAMEL-25402](https://issues.apache.org/jira/browse/CAMEL-25402)). In r7 the new message turned up 7 times, and the CSV-to-JSON example went from 16 to 20 of 20.
- **The log tool keeps the error line and leaves out the stack trace** by default, with the first frame of your own code ([CAMEL-25296](https://issues.apache.org/jira/browse/CAMEL-25296)). It halved what the model had to read.
- **Tools that fit the running app.** The camel-jbang-mcp server offers SQL, tracing, circuit breaker and HTTP tools when the app has a datasource, a circuit breaker, tracing or HTTP endpoints ([CAMEL-24834](https://issues.apache.org/jira/browse/CAMEL-24834), [CAMEL-25307](https://issues.apache.org/jira/browse/CAMEL-25307)), rather than waiting for the model to ask, because it does not.
- **JSON that is already JSON stays as it is.** `marshal: json` on a file, a stream or a JSON string used to fail or encode it twice; it now writes it as it is ([CAMEL-25329](https://issues.apache.org/jira/browse/CAMEL-25329)).
- **Messages that say what is wrong:** a Map sent to an HTTP endpoint says to marshal it to JSON first ([CAMEL-25309](https://issues.apache.org/jira/browse/CAMEL-25309)); a missing Map key lists the keys that are there ([CAMEL-25322](https://issues.apache.org/jira/browse/CAMEL-25322)); unmarshal on a null body says the body is null ([CAMEL-25285](https://issues.apache.org/jira/browse/CAMEL-25285)), and marshal can now skip a null body, as unmarshal could ([CAMEL-25284](https://issues.apache.org/jira/browse/CAMEL-25284)).
- **The catalog tools answer where an option goes:** asked for `deadLetterUri` on the error handler, they answer that it goes under `deadLetterChannel` ([CAMEL-25377](https://issues.apache.org/jira/browse/CAMEL-25377)).

## The method is the point

Kamelets were one area. The way we got there is what we will keep doing, on other parts of Camel: real tasks, measured runs with a fixed setup, every failed attempt read, and many small fixes, each one a better message, a missing check, a tool that knows a little more. None of them is an AI feature. Each one helps the person at the keyboard and the agent next to them at the same time, and the next run tells us whether it worked.

The harness, the examples and the model are open, and the fixes ship in Camel 4.23.
