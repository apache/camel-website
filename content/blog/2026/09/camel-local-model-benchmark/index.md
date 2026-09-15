---
title: "We had a frontier AI coach a small local model through Camel. It found 99 things wrong for humans too"
date: 2026-09-15
draft: false
authors: [davsclaus]
categories: ["AI", "Tooling"]
keywords: ["apache camel", "AI", "local model", "ollama", "coding agent", "MCP", "camel cli", "yaml dsl", "validation", "error messages", "camel 4.23"]
preview: "A frontier model ran the harness, a 22 GB local model on a laptop did the work, and Camel was what we changed between runs: from 0 to 12 of 13 beginner examples over twenty runs, and 99 of the findings were wrong for humans too. All of it ships in Camel 4.23."
---

Everyone claims their tool "works with any LLM". We wanted a number instead of a claim, so we measured two very different models on the same Camel tasks, on one laptop, with the same tooling. Then we did something more useful than reporting the score: we ran the weaker model twenty times over two days, and between every run we fixed whatever in Camel had made it fail.

The interesting result is not which model won. It is that nearly everything the losing model tripped over was also wrong for a person.

## The setup

One machine: an Apple M4 Pro with 64 GB of memory, running Camel 4.23 (main branch), Java 25, and Ollama. Two models:

- **A frontier model**, Claude, with the Camel CLI (`camel validate`, `camel run`, `camel doc`) as tools. It also drove the whole experiment: it wrote the harness, ran the local model, read every failed attempt, wrote the fixes, and filed the issues.
- **A local model**, `qwen3.6:35b-a3b`, a 22 GB mixture-of-experts model that fits in laptop memory and answers a short question in a couple of seconds.

The tasks came from the [Camel CLI examples repository](https://github.com/apache/camel-jbang-examples): the 13 beginner-level examples, each requested with only its one-line catalog description, such as "Split a batch of items into individual messages for processing." A pass meant the result validated, started with `camel run`, and the log showed the described behaviour within a few seconds.

Not all thirteen are what a beginner writes on day one; a memory-leak simulator is not a typical first route. That turned out to be a strength. Between them they touch beans and Java, XSLT, Groovy, REST, the aggregator and the circuit breaker, properties and logging, so the failures landed in different parts of Camel and the fixes did too: the YAML validator, the Simple parser, the catalog, camel-xslt, camel-file, the aggregator, the MCP tools.

The local model's only source of Camel knowledge was `camel mcp`, the Camel MCP server, with the authoring tools any agent gets: the catalog (components, patterns, languages, samples), validation of a file before it is written, and a `camel run` loop. The example catalog tools were withheld so it could not look up the answers. Nothing was fine-tuned.

## Part one: build it from one sentence

| Condition | Pass |
|---|---|
| Frontier model with validate and run as tools | 13 of 13 |
| Local model, bare prompt, no tools | 0 of 13 |
| Local model, one round of validator feedback | 2 of 13 |
| Local model, four rounds of validator and runtime feedback | 3 of 13 |
| Local model with the Camel MCP server's catalog and validation as tools | 7 of 13 |

The frontier model got nine right first time; four needed a single correction, and every one of those was caught by a tool rather than a person.

The local model, given nothing but a prompt, wrote every file as a YAML object instead of a list, so the runtime loaded zero routes thirteen times out of thirteen. Told about it, it fixed that and invented option names instead. Given the catalog and the validator as tools, it passed the simple half of the set: timer, scheduled log, bean call, splitter, content-based router. It did not pass anything that needed runtime semantics the validator could not see: the REST DSL shape, a working aggregation strategy, a circuit breaker with a body.

For the frontier model the tools were verification: it knew Camel, and the loop turned nine into thirteen. For the local model the tools were knowledge: the catalog moved it from nothing to something. Same tools, different job.

## Part two: the way people actually work

Nobody builds an integration from one sentence. They start with something small, run it, and change it in steps. So the second benchmark started from the timer-log example and gave the local model eight requests one at a time: fire every five seconds, set a random body, add a choice, send the hot ones to a queue, add a consumer route, add error handling, move the threshold to a property, rename the route.

It passed five of eight. The passes took about forty seconds and one to three writes each. The three failures were the useful part.

**Adding error handling** failed because the model nested `onException` inside the route. The write tool refused the file with a precise schema error, which is correct, and the model then did the right thing: it looked up the pattern in the catalog. The catalog told it every option `onException` has and nothing about where it goes in a YAML file. It tried another wrong place, was refused again, and gave up after seven minutes.

**Moving the threshold to a property** failed because the validator was wrong. The model wrote `${body} >= {{hot.threshold}}`, which is correct and which the runtime accepts, and the validator rejected it four times with "Binary operator >= does not support token ^". That became [CAMEL-24692](https://issues.apache.org/jira/browse/CAMEL-24692).

**Renaming the route** failed on a wrong option name, `loggerName` instead of `logName`, compounded by the same validator bug.

## The loop: read every failure, fix Camel, run again

The point of measuring was never the score. It was that a small model fails in ways a person silently works around, and each of those is a place Camel can be more precise. So we made it a loop. After each run, every failed attempt was read: what the model wrote, what the validator said, what the runtime said. Every message that told the model what was wrong without telling it what to write became a hint. Every check the runtime made that the validator did not became a validator check. The fixes were merged, the server rebuilt, and the same 13 examples and 8 edits run again.

Twenty runs later, the tally has 117 entries. A few of the messages, before and after:

| The model wrote | Before | After |
|---|---|---|
| `${bean:myBean:getCount}` | No bean could be found in the registry for: myBean:getCount | The method is written as `${bean:myBean.getCount}` or `${bean:myBean?method=getCount}`, not with a single colon (the whole `myBean:getCount` would be looked up as the bean name) |
| `from: uri: mock:result` | Validates; fails at start with "You cannot consume from this endpoint" | mock is a producer-only component: it cannot be a from:. To pass messages between routes send with `to: direct:name` and consume with `from: direct:name` |
| `to: xslt:transform.xsl` on a timer route | Could not extract IN message body as type Source body is: null | The xslt step got no message body to transform (the body is null): read the XML before the step with `poll: file:...`, pollEnrich or a from: consumer, or set it with setBody |
| `handled: true` in onException | "boolean found, object expected" | handled is a predicate: write `handled: {constant: "true"}` |
| `${size}` in a log inside an aggregate | Unknown function: size (did you mean ${length}?) | The same, plus: inside an aggregate the number of aggregated messages is `${exchangeProperty.CamelAggregatedSize}` |
| `beans:` written as a map | property 'myBean' is not defined in the schema | beans is a list: `- name: myBean` followed by `type: "#class:com.example.MyBean"` (the name is a property, not the key) |

None of these are AI features. A person writing YAML by hand, an IDE plugin, or a visual designer hits the same validator and reads the same messages. The model simply hits them faster and does not know how to route around them.

Some findings were bigger than a message. Java, XSLT and XML files were not checked at all before `camel run`; they are now compiled or parsed at write time. The Simple language's own parser messages named what was wrong but never what to write, so they were rewritten ([CAMEL-24703](https://issues.apache.org/jira/browse/CAMEL-24703)). The YAML schema left the expression of split, setBody and forty other patterns optional when the runtime requires it ([CAMEL-24707](https://issues.apache.org/jira/browse/CAMEL-24707)). The catalog got a tool that returns a validated YAML sample for any pattern by name, extracted from the documentation and checked at build time ([CAMEL-24693](https://issues.apache.org/jira/browse/CAMEL-24693)). Several MCP tools required arguments a small model omits, such as the Camel version on every catalog lookup; a client had received "Missing required argument" 36 times before we noticed.

## One finding, up close

One task, three attempts, and what we changed because of them. The example is the content-based router: "route messages to different destinations based on their content". In Camel YAML that is a `choice` with `when` branches, and each `when` needs a condition written in Simple, Camel's small expression language, where `${body}` means the message body.

The model's first attempt put the condition inside the braces:

```yaml
- choice:
    when:
      - expression:
          simple: "${body contains 'critical'}"
        steps:
          - log: "CRITICAL alert detected! Escalating to operations team."
```

Before this series, the parser's answer to that was "Unknown function: body contains 'critical'": true, and no help. By run 18 it said what to write:

```
Line 61: Simple syntax error: Operators go outside the function: ${body} contains 'critical'
```

The model read it, looked up the Simple language in the catalog, checked its file again, and then thought for six minutes and produced nothing. That is what a local model does when it cannot find a way forward: it does not give up, it gets slow. A message that says what to write is the way out, and that is what this work is for.

On its third and last attempt it wrote:

```yaml
      - expression:
          simple: "body contains 'critical'"
```

It had moved the operator out of the braces, as told, and taken the braces off `body` too. Now every check said the file was fine:

- The schema check said valid. It only knows that `simple` takes a string, and this is a string.
- `camel validate` said valid. It does know that a `when` condition must be a true-or-false expression, where `body` without braces is just a word. But the model had wrapped its condition in an optional `expression:` key, and the check looked at the key instead of the `when` above it, so the text was checked as an ordinary expression, where a bare word is a legal literal.

So the file was written, and the run failed:

```
Unexpected token body: text outside ${...} is a literal, functions are written as
${body}, ${header.name}; did you mean ${body} contains 'critical'?
```

That message was right, and it came one attempt too late: each task gets three, and this was the third.

Reading those three attempts side by side gave two fixes, both merged before run 19. The condition check now looks past the `expression:` wrapper to the `when` that owns it, so a condition is checked as a condition wherever it is written. And the schema check now runs the same catalog checks as the write tool once the schema passes, so no tool says "valid" about a file the runtime will reject. In run 19 the same example passed on the first attempt: a documentation lookup, a sample, one schema error corrected, a clean validation, a running route. Four tool calls, 86 seconds.

Nothing in that loop is about the model. A person who writes `body contains 'critical'` under an `expression:` key gets the same "valid" from the same tools and the same failure from the same run. The model only got there faster, and did not know to distrust the tool.

## The curve

Same model, same harness, same examples. Only the Camel build changed.

| | before | run 3 | run 9 | run 19 | run 20 |
|---|---|---|---|---|---|
| One sentence, 13 examples: passes | 7 | 10 | 13 | 12 | 12 |
| Passes on the first attempt | 5 | 2 | 3 | 9 | 7 |
| Tokens generated | 170k | 63k | 42k | 60k | 61k |
| Step by step, 8 requests: passes | 5 | 8 | 8 | 8 | 8 |
| Writes refused by the validator | 9 | 2 | 2 | 2 | 2 |
| Whole suite, wall clock | 72 min | 31 min | n/a | 28 min | 29 min |

The step-by-step benchmark was the first to move: eight of eight from run 3 on, in a fifth of the tokens. The error-handling step that used to end in a give-up became three tool calls: ask for a sample of `onException`, learn it goes at the top of the file, write it. The one-sentence score followed more slowly, and honesty requires saying where it stopped. From run 14 on, the passes stayed between 10 and 12 and the failures were no longer Camel's. They were the model's: a thinking spiral of 20,000 tokens ending in an empty answer, or answering with the files pasted in text after a correct hint instead of using the write tool. In the last three runs, every Camel message the model reached was right.

That is the point where a benchmark stops being sensitive to the thing you are improving, and the reason we stopped at twenty. The fixes kept coming from the traces, three in the last run alone, but they no longer showed in the score.

## Who benefits

We went through all 117 findings and asked who hits each one.

| Who benefits | Findings |
|---|---|
| Everyone: a person, an IDE, a visual designer, any model | 56 |
| Any beginner, or any model of any size | 43 |
| Local models in particular | 12 |
| Not Camel (the harness, the benchmark itself) | 6 |

Twelve of 117 are about a small model's particular weaknesses: things a frontier model would never write, such as putting the file content in an endpoint option. The other ninety-nine are Camel being less clear than it could be, found by a user who is fast, literal, tireless, and never routes around a bad message. A local model turned out to be the best usability tester Camel has had.

## What it means

A frontier model with Camel's tools builds the beginner examples from one sentence each. A local model on a laptop got there too, once Camel told it what to write instead of only what was wrong: twelve of thirteen, in a third of the tokens and less than half the time of the first attempt.

The Camel side of that ships in Camel 4.23, and none of it is an AI feature. Better messages from the Simple parser, the YAML loader and the runtime; a validator that says what to write; catalog tools that answer the question asked; a schema that requires what the runtime requires. And one thing we did not go looking for: validating every YAML example in the EIP documentation, 71 of 280 failed. They all pass in 4.23, the build now checks them, and the component pages are next ([CAMEL-24698](https://issues.apache.org/jira/browse/CAMEL-24698) has the full list). The next runs use a different set of examples, so the fixes land in the parts of Camel these thirteen did not reach; the harness and every failed attempt live with the results, for anyone who wants to repeat it with another model.

There is a larger point behind the numbers. Camel has spent twenty years making integration work for developers, and for most of that time "the user" meant a person at a keyboard. That is no longer the whole picture. A coding agent, whether a frontier model in the cloud or a small model on a laptop, is now a Camel user too: it reads the same docs, calls the same tools, and gets the same error messages, only faster and with less patience for guessing. The way to find out whether Camel works for that user is to be one. So we used AI to build Camel with Camel, ate our own dog food, and let a model that cannot route around a bad message show us where the bad messages were.

That changes the feedback loop more than anything else. For twenty years it ran through people: someone hit an unclear message, worked around it, and perhaps filed an issue weeks later, if they had the time. An agent hits it within seconds, cannot work around it, and shows it to you the same afternoon, twenty times a day. What we fixed from that raised the bar for humans and agents alike, and everybody benefits: everything the model found is now in the project, and it is better for the person at the keyboard as well.
