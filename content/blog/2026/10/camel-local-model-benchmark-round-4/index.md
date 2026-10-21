---
title: "Round 4: making Camel work for any AI model, now with intermediate examples"
date: 2026-10-21
draft: false
authors: [davsclaus]
categories: ["AI", "Tooling"]
keywords: ["apache camel", "AI", "local model", "ollama", "coding agent", "MCP", "camel cli", "kafka", "jms", "body type", "camel 4.24"]
preview: "The fourth round of our work to make Camel easy to use for any AI model, and especially for models small enough to run on a laptop or a mini PC. We moved on to intermediate examples with Kafka, a JMS broker, enrich, REST and an LLM in a route. A local model went from 37 to 64 percent in three nights as we fixed what it failed on, and that found real bugs in Camel. Also: a Camel CLI that any agent can rely on, and what comes next."
---

This is the fourth post in a series about making Camel easy to use for any AI model: the frontier models in the cloud, and especially the models that are small enough to run on your own laptop or a mini PC. The [first](/blog/2026/09/camel-local-model-benchmark/), [second](/blog/2026/09/camel-local-model-benchmark-round-2/) and [third](/blog/2026/10/camel-local-model-benchmark-round-3/) posts show how it works. A local model builds and changes Camel routes, with the [camel-jbang-mcp server](/manual/camel-jbang-mcp.html) as its tools. A frontier model reads every step that failed. We fix whatever in Camel made it fail, and run again. Most of what the model fails on is unclear or wrong for people too.

The setup has not changed: a Mac mini with 64 GB of memory, the local model `qwen3.6:35b-mlx` in Ollama, and Camel on the main branch. Since round 3, the runs have led to more than 50 Jira issues, most of them fixed for Camel 4.24. Here are the highlights.

## On to intermediate examples

The 21 examples from round 2 have stayed at about 92 percent since round 3. When the score stops moving, the examples have stopped finding problems, so we moved on to intermediate ones. Six new examples use the parts of Camel the first ones never touched:

- Kafka orders, with a multicast and record keys
- JMS request-reply on an ActiveMQ Artemis broker, with a dead letter queue
- enrich and dedupe, with pollEnrich, an idempotent consumer and a wire tap
- dynamic routing, with a recipient list, a failover load balancer and a throttle
- code-first REST, with a Java record, 404 and 400 answers, and the generated API description
- an AI ticket classifier, with an LLM inside the route

Kafka and the broker run in containers that `camel infra run` starts. Each example starts from a working route, and the model gets three or four requests, one at a time.

On the first night the model passed 37 percent of the steps. Then the loop did its work: fix in the day, measure at night. The second night it passed 57 percent, the third night 64 percent.

The JMS example shows how the loop works. On the first night, the first request failed in all eight runs: connect to the broker and put each order on a queue. The model used all 25 of its tool calls looking for how to do that, and the jms page had no example of it. The next day the page got one ([CAMEL-25783](https://issues.apache.org/jira/browse/CAMEL-25783)). Dev mode learned to apply new component options and beans from `application.properties` ([CAMEL-25767](https://issues.apache.org/jira/browse/CAMEL-25767)). And the tools learned to wait until the app has really started, and to read the log of an app that died ([CAMEL-25784](https://issues.apache.org/jira/browse/CAMEL-25784)). The next night, that step passed 12 of 12 times.

## Bugs that people hit too

The intermediate examples went deeper, into the runtime that every Camel user runs, and found plain bugs.

The one that stood out: after a pollEnrich times out, the result should be empty. Instead, the message of a file consumer brought its own file back, because it creates its body on demand. So a route that looked up a customer got the order file, and failed later with an error that pointed somewhere else. The messages of JMS, mail, HTTP and other consumers did the same. It is fixed in Camel 4.24, and in the coming LTS releases 4.22.3 and 4.18.6 ([CAMEL-25860](https://issues.apache.org/jira/browse/CAMEL-25860)).

Some others:

- pollEnrich with a file name such as `${body[customer]}.json` read the wrong message, since Camel 4.11 ([CAMEL-25792](https://issues.apache.org/jira/browse/CAMEL-25792)).
- A reload in dev mode did not apply component options, and once that was fixed, it kept only the last one ([CAMEL-25767](https://issues.apache.org/jira/browse/CAMEL-25767), [CAMEL-25858](https://issues.apache.org/jira/browse/CAMEL-25858)).
- The tokenizer EIP did not work in XML and YAML routes ([CAMEL-25777](https://issues.apache.org/jira/browse/CAMEL-25777)).
- The REST binding answered 500 to a GET with `Content-Type: text/plain` ([CAMEL-25769](https://issues.apache.org/jira/browse/CAMEL-25769)).

## The docs are what the model knows

Camel's tools give a model the documentation and its examples. A missing example is missing knowledge, for a model and for a person. Since round 3, 64 more component pages got a YAML example, every data format has one, and every example on the EIP pages is shown in Java, XML and YAML ([CAMEL-25736](https://issues.apache.org/jira/browse/CAMEL-25736), [CAMEL-25774](https://issues.apache.org/jira/browse/CAMEL-25774)). One lesson for anyone who writes docs: the tools return the first two examples of a page, so put the common case first.

## A Camel CLI that any agent can rely on

Coding agents work in a shell. They run a command, read what comes back, and decide what to do next. In Camel 4.24 the Camel CLI says clearly how each command went ([CAMEL-25388](https://issues.apache.org/jira/browse/CAMEL-25388)). So any agent works better with it: a frontier coding agent in the cloud, or a local model on your laptop, with or without the MCP server.

- Each exit code has one meaning: 0 success, 1 failed, 2 usage error, 3 not found, 70 internal error, 124 timed out ([Exit Codes and Output](/manual/camel-jbang-exit-codes.html)).
- Errors go to stderr and data to stdout. With `--json`, stdout is exactly one JSON document, also when a command fails, and more commands have `--json` now, such as `camel validate` and `camel doc`.
- No command waits for a terminal that is not there. A command that follows a log or watches a status shows it once, or for as long as `--duration=30s` says, and then exits.
- `camel stop` and `camel restart` wait, and check that it happened. `camel log <name> --previous` prints the log of an app that stopped, such as one that failed at startup, like `kubectl logs --previous`.

Around this came many fixes in the CLI itself, and some were bugs that people hit too. `camel stop 1234 --kill` killed whatever process had that number; now it only stops a Camel integration. `camel debug` without a terminal waited at full CPU. The docs got a page on exit codes and output, and the upgrade guide for 4.24 already has 50 sections on the CLI. The module with the CLI commands now has more than 2,300 tests, three times as many as in Camel 4.22.

Together with the bug fixes and the docs above, this is what makes Camel work better with any agent, not only with the model in our benchmark. It helps every script and CI pipeline as well. Next, we want to measure it: the model with a shell and the `camel` command, and nothing else.

## Also new

- **Lenient input.** The write tools repair YAML shapes that have only one reading, such as steps written next to a split instead of under it ([CAMEL-25532](https://issues.apache.org/jira/browse/CAMEL-25532)). The model gets fewer refused writes and needs fewer calls.
- **Honest numbers.** We found false passes in our own benchmark: a check that saw log lines from before the step. We fixed it, and the scores went down. If you run a benchmark of your own, read the passes too.
- **A newer model is not always better at Camel.** Qwen3.8 27B, which its makers rate better at agent work, scored 88 percent against 93 percent for our model. It looked up every option before it used it, and ran out of calls.

## Next: knowing what the body is, everywhere

Look at what still fails, and one question keeps coming back: what is the message body at this step? The file as it was read, where the model expected the customer. A Map, where text was needed. A list, where one order was wanted. The LLM's answer, which replaced the ticket. People ask the same question, and often find the answer in a stack trace.

Camel has started to answer it from the runtime, because only the running route knows for certain. An error about the body now says what the body is, which step made it so, and what to write instead ([CAMEL-25749](https://issues.apache.org/jira/browse/CAMEL-25749)). An app in dev mode records the body types at each step, and the validator uses them ([CAMEL-25750](https://issues.apache.org/jira/browse/CAMEL-25750)).

The next step is to make this knowledge part of Camel itself: every component, EIP, data format and language says what body it takes and what body it gives ([CAMEL-24961](https://issues.apache.org/jira/browse/CAMEL-24961)). Then every tool that reads the catalog knows it: the docs, the validator, the MCP tools, IDEs and visual designers. This was asked for in 2008 ([CAMEL-330](https://issues.apache.org/jira/browse/CAMEL-330)) and again in 2017 ([CAMEL-11132](https://issues.apache.org/jira/browse/CAMEL-11132)). It never happened, because someone had to fill it in by hand for more than 300 components. Now an AI pass can propose the values, and the runtime can check them. How we do that will get its own post.

## The person steers

The benchmark is a stress test: a model alone, which is harder than a normal working day. In daily work a person steers, and a local model makes that person fast. The models get better every few months, and the fixes stay in Camel, for people and for every AI model. They ship in Camel 4.24.
