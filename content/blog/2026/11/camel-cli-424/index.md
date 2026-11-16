---
title: "The Camel CLI in Camel 4.24: fast, so an AI can use it first-class"
date: 2026-11-17
draft: false
authors: [davsclaus]
categories: ["Camel", "Tooling"]
keywords: ["apache camel", "camel cli", "camel 4.24", "aesh", "picocli", "startup", "class data sharing", "exit codes", "ai agents", "self-update"]
preview: "The Camel CLI in Camel 4.24 runs a command in about 125 ms, where 4.23 took more than a second. That is on purpose: an AI agent calls the CLI 50 or 100 times for one task, and the CLI must be fast, and its answers right, for the agent to use it as a first-class tool. And it now runs on aesh, built together with its maintainer."
---

You type `camel` many times a day: `camel run`, `camel ps`, `camel get route`, `camel log`. And now so do AI agents,
which call the CLI over and over in a loop. In Camel 4.24 we made the Camel CLI a first-class tool for an AI agent:

* it is **fast**: a command takes about 125 ms, where 4.23 took more than a second
* it gives **answers an agent can trust**: exit codes, errors on stderr, JSON output and timeouts
* it runs on [aesh](https://github.com/aeshell/aesh) instead of picocli, and we built that together with its maintainer

## Why fast is the point

An agent works in a loop: it runs a command, reads what came back, decides the next step, and runs the next command.
To build and fix an integration it looks up a component, writes a route, validates it, runs it, reads the log, sends
a message, checks the routes, and goes around again. That is easily 50 or 100 calls of the CLI for one task.

When you type a command, one second is a short pause. For an agent, every call is a stop: the loop waits for the CLI
before the model can think about the next step. 100 calls of a CLI that takes 1.2 seconds is two minutes of waiting.
At 125 ms it is less than 13 seconds.

And it is not only about time. When a check is cheap, an agent does it: it looks up the option instead of guessing
it, it validates after each change, and it checks the routes once more after the reload. When every call costs a
second, there are fewer of those checks, and more guessing. A fast CLI makes the agent quicker, and it makes it
better, because it can afford to verify. With a local model, where the model is already the slow part, you want
every other part of the loop to be as fast as possible.

So being fast was not a nice side effect. It was the goal.

## Fast

This is the time a command takes, from typing it to the prompt coming back (median of 15 runs, Apple M4 Pro, Java 25):

| Command            | Camel 4.23 | Camel 4.24 |
|--------------------|-----------:|-----------:|
| `camel version`    | 1233 ms    | 128 ms     |
| `camel ps`         | 1223 ms    | 122 ms     |
| `camel init --help`| 1196 ms    | 138 ms     |
| `camel get --help` | 1182 ms    | 167 ms     |
| `camel run --help` | 1202 ms    | 256 ms     |
| `camel --help`     | 1198 ms    | 256 ms     |

That is about 10 times faster for the commands you, and your agent, use the most.

There was no one big fix, but many small ones, found by measuring first. The biggest:

* **Only the command you run is created.** The CLI has more than 160 commands, and 4.23 created all of them, and
  those of every plugin, before it ran one. Now `camel ps` creates only `camel ps`.
* **Only the jars and classes it needs.** A short command no longer looks through all 344 jars of the CLI, and no
  longer starts log4j when nothing logs. `camel ps` loads 1,591 classes, where 4.23 loaded 5,373.
* **Plain jars and class data sharing.** The distribution runs from plain jars instead of a Spring Boot fat jar, so
  the JVM can keep the classes a command loads in an archive, and map it in on the next run. The `camel` script does
  this by itself (set `CAMEL_CDS=false` to turn it off).
* **aesh.** More about that below.

## Answers an AI can trust

Fast is not enough. An agent cannot see your screen: all it has is the exit code and the text that came back, and it
builds its next step on that. A person reads "ERROR: no integration found" and knows what to do, even when the exit
code says `0`. An agent takes the `0` as a fact, and goes down the wrong path. A command that waits for a terminal
that is not there leaves the agent stuck until its own timeout.

So in Camel 4.24 the Camel CLI has a contract: the [exit codes and output](/manual/camel-jbang-exit-codes.html).
It is good for a script and a CI job too:

| Exit code | Meaning                                                          |
|----------:|------------------------------------------------------------------|
| 0         | success                                                          |
| 1         | the command failed                                               |
| 2         | usage error: a wrong option or argument                          |
| 3         | not found: no integration, route, Kamelet or plugin of that name |
| 66        | a file or directory that does not exist                          |
| 70        | internal error                                                   |
| 124       | timed out: the integration did not answer in time                |

And with it:

* Errors go to stderr, so the output on stdout can be read as is.
* With `--json`, stdout is exactly one JSON document, also when the command fails.
* Commands that talk to a running integration take a `--timeout`, instead of waiting forever.
* No command waits for a terminal that is not there.

We tested this by letting agents use the CLI, and fixed what tripped them up. The
[MCP server](/manual/camel-jbang-mcp.html) and `camel ask` pass these failures on to the agent as errors, so the model
sees what went wrong instead of guessing it.

## Keeping up with the agent

An agent does not only start commands, it talks to the integration it is building. Those got faster too:

* **An action is answered in about 25 ms**, such as `camel cmd send` or `camel get route`, where it took about 110 ms.
* **`camel run --background` returns when the routes are up**, about 0.4 s after Camel started, where it was 1.3 s.
* **`camel cmd reload --wait --json`** reloads the changed files in dev mode at once, and says if it was `reloaded`,
  `unchanged` or `failed`. Before, an agent wrote a file and had to guess when the reload had happened.
* **`camel status <name> --json`** is the state of an integration in one call: its routes, the problems first, the
  last errors and log lines, and the HTTP endpoints. In about 0.3 s, where four commands took about a second.

Fast and trustworthy go together: the agent calls the CLI often because each call is cheap, and it can act on what
comes back because the answer is right.

## On aesh instead of picocli

The Camel CLI has used [picocli](https://picocli.info/) from its start. picocli served us well, but it moves slowly
now: its last release was in April 2025. In Camel 4.24 the Camel CLI parses its command lines, prints its help and
completes its commands with [aesh](https://github.com/aeshell/aesh), the Java library for command line tools by
Ståle Pedersen.

The main reason for the move is not speed. It is that aesh is a living project, with a maintainer we can talk to. We
saw that during the port. Before switching, we ported all of the CLI on a branch and wrote down every gap and bug we
found in aesh: 36 issues and 17 pull requests. Ståle fixed or merged nearly all of them within days, and released aesh
3.19 and 3.19.1 with them.

aesh is a little faster too. In our measurements during the port, aesh took about 20 ms off `camel version`, and
about 60 ms off `camel --help`.

And it did not stop there. At the start of each command, aesh looked through all 344 jars of the CLI for its registry
of commands, which only its own jar has. We asked for a way to skip that search
([aesh#779](https://github.com/aeshell/aesh/issues/779)), and for aesh to start its logging only when it logs
([aesh#782](https://github.com/aeshell/aesh/issues/782)). Ståle has added both already, and they take about another
30 ms off `camel ps` in our test. That comes with the next release of aesh.

This is what open source at its best looks like: two projects that find a problem, talk about it, and fix it
together, in days. Thank you, Ståle!

For using the Camel CLI, not much changes. The commands and their options are the same: before the switch we wrote a
test with 2207 command lines and what picocli made of them, and the aesh port had to give the same answers. If you
wrote your own plugin for the Camel CLI, it must be changed for aesh; the
[upgrade guide](/manual/camel-4x-upgrade-guide-4_24.html) has the details.

## Try it

Try it now with the nightly build:

```shell
camel self-update --version SNAPSHOT
```

Nightly builds are development builds for testing, not Apache releases. When Camel 4.24 is released,
`camel self-update --version 4.24` switches back to the releases. Or install it with the
[web installer](/manual/camel-jbang-launcher-install.html):

```shell
curl -fsSL https://camel.apache.org/install.sh | sh
```

Camel 4.24 also has many smaller fixes and improvements to the CLI; see the release notes for all of them.

And then type `camel ps`, and see how fast it comes back.
