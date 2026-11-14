---
title: "The Camel CLI in Camel 4.24: starts in a blink, now on aesh"
date: 2026-11-17
draft: false
authors: [davsclaus]
categories: ["Camel", "Tooling"]
keywords: ["apache camel", "camel cli", "camel 4.24", "aesh", "picocli", "startup", "class data sharing", "exit codes", "ai agents", "self-update"]
preview: "The Camel CLI in Camel 4.24 runs a command in about 150 ms, where 4.23 took more than a second. It parses its command lines with aesh instead of picocli, and it is a CLI an AI agent can trust and keep up with: documented exit codes, errors on stderr, JSON output and timeouts."
---

You type `camel` many times a day: `camel run`, `camel ps`, `camel get route`, `camel log`. And now so do AI agents,
which call the CLI over and over in a loop. In Camel 4.24 the Camel CLI got a lot of attention. This post is about
three changes:

* it is fast: a command such as `camel version` or `camel ps` takes about 150 ms, where 4.23 took more than a second
* it runs on [aesh](https://github.com/aeshell/aesh) instead of picocli
* it is a CLI an AI agent can trust: exit codes, errors on stderr, JSON output and timeouts

And then some of the smaller things that make the day better.

## Fast

This is the time a command takes, from typing it to the prompt coming back. It is the median of 15 runs of the
`camel` launcher of the distribution (4.23.0, and a nightly build of 4.24), on an Apple M4 Pro with Java 25:

| Command            | Camel 4.23 | Camel 4.24 |
|--------------------|-----------:|-----------:|
| `camel version`    | 1251 ms    | 146 ms     |
| `camel ps`         | 1292 ms    | 188 ms     |
| `camel init --help`| 1234 ms    | 149 ms     |
| `camel get --help` | 1232 ms    | 179 ms     |
| `camel run --help` | 1239 ms    | 326 ms     |
| `camel --help`     | 1242 ms    | 329 ms     |

That is about 8 times faster for the commands you use the most. A `camel ps` now comes back before you notice it
was gone. For you that is nice. For an AI agent it matters much more, as we will see below.

Where did the second go? Not into one big fix, but many small ones, found by measuring first:

* **Only the command you run is created.** The Camel CLI has more than 160 commands. Camel 4.23 created all of them,
  with all their options, and those of every plugin, before it ran one. Now `camel ps` creates `camel ps`, and a
  plugin command creates only that plugin.
* **No logging unless something logs.** Most commands log nothing, yet log4j was started for each of them. Also the
  check for a newer version of the CLI started log4j, before every command.
* **The launcher script no longer runs `java -version`** to find out the Java version. It reads the release file of
  the JDK instead, which saves starting a second JVM.
* **The JVM no longer waits at exit** for the thread of an HTTP client that a command created but never used, or
  for the update check.
* **The distribution runs from plain jars.** Camel 4.23 ran the CLI from one Spring Boot fat jar, which has its own
  class loader for the nested jars. Camel 4.24 has the jars in `lib/`, next to a thin launcher jar.
* **Class data sharing.** Because the jars are plain jars now, the JVM can keep the classes a command loads in an
  archive, and map it in on the next run. The `camel` script does this by itself: the first run of a command writes
  the archive (under `~/.cache/camel-cli/cds/`), and the runs after it are faster. Set `CAMEL_CDS=false` to turn it
  off. Without the archive, `camel version` takes 186 ms instead of 146 ms, and `camel --help` 559 ms instead of
  329 ms.
* **aesh.** More about that below.

## On aesh instead of picocli

The Camel CLI has used [picocli](https://picocli.info/) from its start. picocli served us well, but it moves slowly
now: its last release was in April 2025. In Camel 4.24 the Camel CLI parses its command lines, prints its help and
completes its commands with [aesh](https://github.com/aeshell/aesh), the Java library for command line tools by
Ståle Pedersen.

The main reason for the move is not speed. It is that aesh is a living project, with a maintainer we can talk to. We
saw that during the port. Before switching, we ported all of the CLI on a branch and wrote down every gap and bug we
found in aesh: 36 issues and 17 pull requests. Ståle fixed or merged nearly all of them within days, and released aesh
3.19 and 3.19.1 with them. Thank you, Ståle!

aesh is a little faster too. In our measurements during the port, aesh took about 20 ms off `camel version`, and
about 60 ms off `camel --help`. That is a small part of the second above, but it all adds up.

### What changes for you

For using the Camel CLI, not much. The commands and their options are the same. To be sure of that, before the
switch we wrote a test with 2207 command lines and what picocli made of them, and one with the help of all commands
and the errors of wrong command lines. The aesh port had to give the same answers.

The help looks a little different: the default value of an option is on a line of its own (`Default: ...`).

An argument `@file` is replaced by the arguments in that file, as it was with picocli, such as `camel @run.txt`.

If you wrote your own plugin for the Camel CLI, it must be changed and built for Camel 4.24: a plugin adds its
commands to a `CommandTree` instead of a picocli `CommandLine`, and the commands use the aesh annotations. The
[upgrade guide](/manual/camel-4x-upgrade-guide-4_24.html) has the details.

## A CLI that an AI can trust, and that keeps up with it

More and more, the Camel CLI is not called by a person, but by an AI agent. The agent works in a loop: it runs a
command, reads what came back, decides the next step, and runs the next command. To build and fix an integration it
looks up a component, writes a route, validates it, runs it, reads the log, sends a message, checks the routes, and
goes around again. That is easily 50 or 100 calls of the CLI for one task.

### Fast matters more for an AI than for you

When you type a command, one second is a short pause. You were reading the last output anyway. For an agent, every
call is a stop: the loop waits for the CLI before the model can think about the next step. 100 calls of a CLI that
takes 1.25 seconds is more than two minutes of waiting. At 150 ms it is 15 seconds.

And it is not only about time. When a check is cheap, an agent does it: it looks up the option instead of guessing
it, it validates after each change, and it checks the routes once more after the reload. When every call costs a
second, there are fewer of those checks for the same time and the same budget, and more guessing. A fast CLI makes the
agent quicker, and it makes it better, because it can afford to verify. Running a local model, where the model is
already the slow part, you want every other part of the loop to be as fast as possible.

### An answer an AI can trust

An agent cannot see your screen. All it has is the exit code and the text that came back, and it builds its next
step on that. A person reads "ERROR: no integration found" and knows what to do, even when the exit code says `0`. An
agent that gets `0` for a command that did not work takes it as a fact, and goes down the wrong path. A command that
waits for a terminal that is not there leaves the agent stuck until its own timeout. Every answer the CLI gets wrong
costs the agent more than the command took.

So in Camel 4.24 the Camel CLI has a contract: the
[exit codes and output](/manual/camel-jbang-exit-codes.html). The same contract is good for a script and a CI job too:

| Exit code | Meaning                                                        |
|----------:|----------------------------------------------------------------|
| 0         | success                                                        |
| 1         | the command failed                                             |
| 2         | usage error: a wrong option or argument                        |
| 3         | not found: no integration, route, Kamelet or plugin of that name |
| 66        | a file or directory that does not exist                        |
| 70        | internal error                                                 |
| 124       | timed out: the integration did not answer in time              |

And with it:

* Errors go to stderr, so the output on stdout can be read as is.
* With `--json`, stdout is exactly one JSON document, also when the command fails, so it can always be parsed. A
  listing with nothing in it prints `[]`.
* Commands that talk to a running integration take a `--timeout`, and say so when the integration did not answer,
  instead of waiting forever.
* No command waits for a terminal that is not there. Without one, `--watch` shows the output once, `camel log` does
  not follow, and a command that needs a terminal, such as `camel debug`, exits with `2` instead of hanging a CI job.
* `camel stop` and `camel restart` wait until the integration has stopped, and exit with `124` when it did not stop
  in time.
* `camel run --background` waits for the integration to start, and a file that does not exist fails before anything
  starts.
* A route that fails to start exits with `1`, which says "fix the route", with one line on stderr: the stack trace
  is in the log already. Before, it was `70`, which says "a bug in Camel, do not retry", so an agent gave up instead of
  fixing its route.
* With `orders` and `orders-v2` running, `camel stop orders` stops `orders`. A name was a prefix only, so it stopped
  both, and every command for one integration failed for `orders`. A name that no integration has is still a prefix.
* An option given on the command line wins over `application.properties`. With `camel.main.tracing=false` in the
  file, `camel run --trace` printed no trace.
* No ANSI color codes when the output is a file or a pipe, unless `--logging-color` is given: `camel cmd send
  --reply | cat` had them.
* `camel validate` exits with `66` for a file that does not exist, and for nothing to validate. It said "Validation
  success (files:0)" for a `notes.txt`.
* `X=$(camel eval expression ...)` is only the value. The Camel that `camel eval` starts for itself printed its state
  first.
* The `--timeout` of `camel cmd send` bounds the send, not only the wait of the CLI. A send to `direct:nope` waited
  30 seconds for a consumer and ended in a timeout of the CLI; now it fails at once with "No consumers available".
* Options do with `--json` what they do without: `camel cmd route-structure --json --filter=orders` printed every
  route, and a filter that matches nothing exits with `3`. `camel cmd receive --output=json` has only JSON on stdout.
* A row of a JSON listing says which integration it is of, with `pid` as a number and `name`, and a list is a list
  also for one integration.

The AI tools of the Camel CLI, the [MCP server](/manual/camel-jbang-mcp.html) and `camel ask`, pass these failures on
to the agent as errors, so the model sees what went wrong instead of guessing it. And they act on the integration the
agent named: a runtime tool takes the integration as `nameOrPid`, `name` or `pid`, where a `name` was ignored and the
tool acted on the only integration that ran, which could be another app. `camel_get_files` reads a large file in parts,
instead of an answer of a million tokens, and `camel_edit_file` keeps a `replace` of only whitespace, which matters in
YAML.

### Keeping up with the agent

An agent does not only start commands, it talks to the integration it is building: it sends a message, reloads a
changed route, and asks how the integration is doing. In Camel 4.24 those got faster, and some of them got a command
of their own:

* **An action is answered in about 25 ms**, such as `camel cmd send` or `camel get route`, where it took about 110 ms.
  The CLI and the integration looked for each other's files every 100 ms; now they look much more often, but only
  read the folder when it changed.
* **`camel run --background` returns when the routes are up**, about 0.4 s after Camel started, where it was about
  1.3 s. The integration writes its status at once when it has started, instead of on the next tick of a second.
* **`camel cmd reload --wait --json`** reloads the changed files of an integration in dev mode at once, and says how it
  went: `reloaded`, `unchanged` or `failed`, with the error. Before, an agent wrote a file and then had to guess when
  the reload had happened.
* **`camel status <name> --json`** is the state of an integration in one call: its routes, the problems first, the
  last errors and log lines, the HTTP endpoints, and the oldest exchange in flight. In about 0.3 s, where `camel get
  route`, `get health`, `get error` and `camel log` took about a second together.

Fast and trustworthy go together: the agent calls the CLI often because each call is cheap, and it can act on what
comes back because the answer is right.

## Stay up to date

The [web installer](/manual/camel-jbang-launcher-install.html) installs the latest release:

```shell
curl -fsSL https://camel.apache.org/install.sh | sh
```

You can ask it for the newest LTS release, or the newest release of a line, and `camel self-update` stays on it:

```shell
curl -fsSL https://camel.apache.org/install.sh | sh -s -- --version LTS
curl -fsSL https://camel.apache.org/install.sh | sh -s -- --version 4.24
```

And new in 4.24: try what is coming before it is released. Apache publishes a nightly build of the Camel CLI, and
`camel self-update` can switch to it, and back:

```shell
camel self-update --version SNAPSHOT
```

Nightly builds are development builds for testing, not Apache releases.

## The smaller things

* `camel cmd send` can feed a route: `--repeat` and `--interval` send many messages, and `--body=file:<folder>` sends the
  files of a folder, one message per file.

  ```shell
  camel cmd send --endpoint=kafka:refunds --body=file:refund.json --repeat=50 --interval=100..500
  ```

* `camel run --data-dir` names the folders with data files under the source directory, which dev mode does not watch,
  so writing a file there does not reload the routes. Nor do the files a run writes itself: `camel dev > run.log`
  reloaded the routes every 2 seconds. Log files, `target`, `.git` and the `.camel` folders are not watched.
* In dev mode, a reload applies changed `camel.beans` and `camel.component` properties, and a dependency added to
  `camel.jbang.dependencies` while the app runs is downloaded.
* The log of the previous run is kept, also for the Spring Boot and Quarkus runtimes, so you can read why it failed
  at startup. `camel dirty --clean` removes those logs too.
* `camel cmd route-diagram`, `route-structure` and `route-topology` read Java routes with the Java DSL parser, without
  compiling them.
* `camel cmd send --body=...` without a name sends to the integration that runs, such as after `camel run --stub=jms`.
  It sent to an empty Camel of its own, and said "Sent (success)". An endpoint of a system outside the integrations,
  such as `kafka:topic`, is still sent from the CLI.
* A `camel-cli.properties` in the current directory is laid over the global `~/.camel-cli.properties`, rather than
  hiding all of it.
* From the launcher, `camel export` exports the Citrus tests, `--jvm-debug` and `--jvm-args` work without JBang,
  and `camel.bat` has Windows line endings.
* `camel kubernetes` honours `--kube-config` in all commands, and `camel kubernetes logs` stops at a pod that has
  finished. `camel kubernetes export` puts `--env`, `--config`, `--volume`, `--label` and `--annotation` in a CronJob
  and a Knative Service too, where they were dropped without a word.
* `camel debug --breakpoint tick` and `--source-dir` work; the debug options were taken apart wrongly before they went
  to `camel run`.
* `camel init` gives a Kamelet its kind from the file name, puts `./x.yaml` in `--dir`, and refuses a Java file whose
  name is not a class name, such as `my-route.java`.
* `camel doctor` checks a nightly build against the Apache snapshots, where it reported Maven as failed.
* `camel cmd logger --logging-level=BOGUS` is a usage error instead of setting the level to `ERROR`, and
  `camel cmd browse --endpoint=seda:foo`, the example of its own help, finds `seda://foo`.
* `camel generate rest --routes` writes routes that validate and run, with a log step to replace, and `camel test init`
  does not overwrite a test you edited, unless `--force`.

## Try it

Try it now with the nightly build:

```shell
camel self-update --version SNAPSHOT
```

When Camel 4.24 is released, `camel self-update --version 4.24` switches back to the releases. Or install it with the
web installer above.

And then type `camel ps`, and see how fast it comes back.
