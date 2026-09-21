---
title: "Round 2: a real-world example set, a step-by-step benchmark, and 31 more Camel fixes"
date: 2026-09-22
draft: false
authors: [davsclaus]
categories: ["AI", "Tooling"]
keywords: ["apache camel", "AI", "local model", "ollama", "coding agent", "MCP", "camel cli", "yaml dsl", "validation", "camel 4.23"]
preview: "The second round of the local-model benchmark moved from thirteen beginner examples to a ladder of real-world ones with a web shop running through them, added a step-by-step mode that works the way developers do, and produced 33 issues, 31 of them fixed in Camel 4.23. Step-by-step went from 81 to 92 percent; one-shot reached 10 of 10 at least once."
---

Two weeks ago we [let a frontier model coach a small local model through Camel](/blog/2026/09/camel-local-model-benchmark/) and fixed Camel between every run: twelve of thirteen beginner examples in the end, and 99 findings that were wrong for humans too. That post ended with a promise: the next runs use a different set of examples, so the fixes land in the parts of Camel the first thirteen did not reach.

This is that round. Same laptop, same 22 GB local model (`qwen3.6:35b-a3b` in Ollama), same frontier model running the harness and reading every failed attempt, Camel 4.23 on the main branch. What changed is the examples, the way the model is asked to work, and 31 more things in Camel.

## A more realistic example set

The first round used the beginner examples: a timer, a splitter, a memory-leak simulator, each a self-contained demo. Real integration work is not like that. So the [Camel CLI examples repository](https://github.com/apache/camel-jbang-examples) was reorganised into a ladder. Each rung is a group that builds on the ones before it: run, transform, route, fail well, connect without a service, connect to one service, contracts and security, AI, cloud. From the run rung onwards the examples share one fictional web shop, with orders, customers, a warehouse and a courier, so what one example sets up the next one uses. An order file that the first example generates is what the splitter example splits, what the content-based router routes, and what the SQL example registers in a customers table.

Every example got the same shape: a README that says what you will see when it runs, how it works, and how to build it yourself step by step; a `metadata.json` that lists what it teaches; and a test in the Citrus YAML DSL that `camel test run` executes. The description in the README is written as observable behaviour, "three orders land in the table and a report every ten seconds lists them", because that is what the benchmark checks in the log.

Twenty of those rungs were the one-shot set: one sentence in, a running route out. And the "build it step by step" sections became something new.

## Step by step, the way people work

Nobody writes an integration from one sentence. A developer starts a route, runs it, adds a step, watches the log, fixes what broke, adds the next. The second round measures that. The harness starts the example's first step with `camel run --dev`, then sends the README's remaining steps one at a time as requests through the [camel-jbang-mcp server](/manual/camel-jbang-mcp.html): "add a Java class OrderNumber and set the header from its method", "make the supplier throw for calls four to twelve and wrap the call in a circuit breaker with a fallback", "move the period to application.properties". After each request the harness waits for the reload, checks the files and the log against the README, and restores the reference state so the next step starts from known ground.

Eleven examples, 37 steps, each run five times. This is the benchmark that resembles a working day, and it is the one that moved.

## What the runs found

The loop was the same as before: run, read every failed attempt, decide whether the model or Camel was at fault, fix Camel, run again. 33 issues came out of it, 31 fixed and merged for Camel 4.23. A few, to give the flavour:

- **A failed reload left the app without routes.** Save a file with a mistake in dev mode and every route stopped, silently, until the next good save. Now the previous routes are restored and the log says so ([CAMEL-24860](https://issues.apache.org/jira/browse/CAMEL-24860)). Adding a second route file next to one with several routes failed with a duplicate route id ([CAMEL-24866](https://issues.apache.org/jira/browse/CAMEL-24866)). A directory created while the app ran was never watched ([CAMEL-24862](https://issues.apache.org/jira/browse/CAMEL-24862)).
- **The runtime now says what the validator knew.** When a YAML route fails to load, `camel run` prints the validator's report with the line and the fix instead of a YAML stack trace ([CAMEL-24851](https://issues.apache.org/jira/browse/CAMEL-24851)). A person prototyping with the CLI gets the same.
- **The validator says what to write.** `period: ${order.period}` in an endpoint option is a Simple expression, not a property placeholder; the validator now says to write `{{order.period}}` ([CAMEL-24857](https://issues.apache.org/jira/browse/CAMEL-24857)). A `cron` endpoint without its required name, a `:name` parameter in a SQL query that camel-sql spells `:#name`, a resource file next to the route that must be `resource:classpath:`, a nested Resilience4j key that silently does nothing: each is one row in the validator and one less minute of guessing.
- **The write tool reports the outcome.** Writing a file through the MCP server now waits for the reload and answers with what happened, reloaded, failed with the cause, or a properties reload, so an agent does not go on with a route that did not load ([CAMEL-24859](https://issues.apache.org/jira/browse/CAMEL-24859)).
- **The MCP server was missing tools.** It wrapped 27 of the 53 runtime tools and had none for SQL, datasources, circuit breakers, metrics, spans or route analysis. Now it has them ([CAMEL-24867](https://issues.apache.org/jira/browse/CAMEL-24867)).

Five of the 33 were plain bugs. The rest were places where Camel was right but silent or cryptic, and the fix is a better message for everyone.

## The numbers

Measured on the same clean build after the last merge.

| | before round 2 | after |
|---|---|---|
| Step by step, 10 examples, 34 steps, 5 runs each: steps passed | 81% | 92% |
| Runs with every step passed | 29 of 50 | 41 of 50 |
| One sentence, 10 examples, 5 attempts each: attempts passed | 66% | 70% |
| Passed at least once (pass@5) | 9 of 10 | 10 of 10 |
| Passed all five times (pass^5) | 4 of 10 | 4 of 10 |
| Tokens per one-shot attempt | ~3.1k | ~2.4k |

The step-by-step mode gained the most: the steps that used to fail on a placeholder, a missing cron name or a silent reload now pass, and four examples that were shaky pass five times out of five. The one-shot mode gained less, and honesty requires saying why. Its remaining failures are not Camel being silent. The files validate, the app starts, and the log does not show what the sentence described: two routes named in the description that the model merged into one, a pick list logged in another shape, a Postgres `ON CONFLICT` written against H2. The feedback names the missing lines, and the model gets three rounds; the misreading of one sentence, or the wrong dialect, is the model's. That is the hard problem the one-shot benchmark exists to find, and the next round starts from those four examples.

One more experiment, on the SQL example. The MCP server exposes many runtime tools, and a local model pays for every tool description in its prompt, so it normally gets a small core set. We ran the SQL example twice: once with the core set, once with three SQL tools added, which let the model query the app's datasource and see its SQL trace. Two things came out. When a step *was* a database task, "correct this customer's country in the customers table", the model with the SQL tool did it in one call every time; without the tool it wrote a throwaway route to run the update, and mostly failed. But when the step was writing the upsert route, the model never once used the SQL tool to try its statement against the database first, although the tool's description says to do exactly that. It wrote the Postgres syntax, H2 rejected it at runtime, and the model found out from the log.

So a tool helps a small model with the task it was asked to do; it does not make the model check its own work. That settles how the MCP server will pick tool groups for local models: from what the running app has, a datasource, a circuit breaker, tracing, rather than waiting for the model to ask for them, because it will not.

## Same loop, better Camel

This is a continuation, not a conclusion. The harness, the examples and every failed attempt are public; the model is a 22 GB file anyone can run; the fixes ship in 4.23 and none of them is an AI feature. What a coding agent trips over within seconds is what a person at the keyboard trips over an hour later, and we now have a way to find those places twenty times a day. We will keep running it, on the next rungs of the ladder and on the next models, and keep fixing Camel for both kinds of user at once.
