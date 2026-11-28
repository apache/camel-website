---
title: "The Camel CLI in Camel 4.24 is 10 times faster"
date: 2026-11-17
draft: false
authors: [davsclaus]
categories: ["Camel", "Tooling"]
keywords: ["apache camel", "camel cli", "camel 4.24", "aesh", "picocli", "startup", "class data sharing", "exit codes", "ai agents", "self-update"]
preview: "The Camel CLI in Camel 4.24 runs a command in about 100 ms, where 4.23 took more than a second. It also has documented exit codes, JSON output and timeouts."
---

In Camel 4.24 a Camel CLI command takes about 100 ms, where 4.23 took more than a second. The CLI also has documented
exit codes and output, and it has moved from picocli to a new command line library,
[aesh](https://github.com/aeshell/aesh).

Part of the reason is AI agents, which call the CLI 50 or 100 times for one task: 100 calls at 1.2 seconds is two
minutes of waiting, at 100 ms about 10 seconds. Scripts and people typing `camel ps` benefit the same way.

## Startup time

Time from typing a command to the prompt coming back (median of 15 runs, Apple M4 Pro, Java 25.0.5):

| Command                   | Camel 4.23 | Camel 4.24 |
|---------------------------|-----------:|-----------:|
| `camel version`           | 1185 ms    | 73 ms      |
| `camel ps`                | 1201 ms    | 80 ms      |
| `camel get route`         | 1223 ms    | 120 ms     |
| `camel catalog component` | 1434 ms    | 153 ms     |
| `camel init --help`       | 1173 ms    | 85 ms      |
| `camel get --help`        | 1183 ms    | 98 ms      |
| `camel run --help`        | 1183 ms    | 193 ms     |
| `camel --help`            | 1167 ms    | 222 ms     |

The most used commands are 10 to 15 times faster. `camel version` and `--help` only start the CLI, so they show its
own cost; every command, including `camel run`, saves that second.

`camel run` also gains from a faster Maven downloader: it resolves dependencies together, downloads them in parallel,
skips what the CLI already has, and stops asking a Maven repository that cannot be reached.

The biggest of the many small fixes:

* **Only the command you run is created.** 4.23 created all 160+ commands, and those of every plugin, before
  running one.
* **Only the jars and classes it needs.** A short command no longer scans all 283 jars of the CLI, and no longer
  starts log4j when nothing logs. `camel ps` loads 1,487 classes, where 4.23 loaded 5,461.
* **Plain jars and class data sharing.** The distribution runs from plain jars instead of a Spring Boot fat jar, so
  the JVM can archive loaded classes and map them in on the next run (set `CAMEL_CDS=false` to turn it off).
* **A faster command line library**, aesh, see below.

## Exit codes and output

A script or CI job only sees the exit code and the output, so the CLI now documents both as a contract:
[exit codes and output](/manual/camel-jbang-exit-codes.html).

| Exit code | Meaning                                                          |
|----------:|------------------------------------------------------------------|
| 0         | success                                                          |
| 1         | the command failed                                               |
| 2         | usage error: a wrong option or argument                          |
| 3         | not found: no integration, route, Kamelet or plugin of that name |
| 66        | a file or directory that does not exist                          |
| 70        | internal error                                                   |
| 124       | timed out: the integration did not answer in time                |

* Errors go to stderr, so stdout can be read as is.
* With `--json`, stdout is exactly one JSON document, also when the command fails.
* Commands that talk to a running integration take a `--timeout`.
* No command waits for a terminal that is not there.

We tested this by letting AI agents use the CLI and fixed what tripped them up. The
[MCP server](/manual/camel-jbang-mcp.html) and `camel ask` pass these failures to the model as errors.

## Talking to a running integration

* `camel cmd send`, `camel get route` and similar actions answer in about 20 ms (4.23: half a second to a second).
* `camel run --background` returns when the routes are up, about 0.4 s after Camel started (4.23: 1.6 s).
* `camel cmd reload --wait --json` reloads the changed files in dev mode at once and reports `reloaded`, `unchanged`
  or `failed`, so you no longer guess when the reload happened.
* `camel status <name> --json` returns routes (problems first), last errors and log lines, and HTTP endpoints in one
  call of about 0.1 s, where four commands took about 0.4 s.

## A new command line library: aesh

The CLI used [picocli](https://picocli.info/) from the start; its last release was in April 2025. In 4.24 command
parsing, help and completion use aesh, the Java command line library by Ståle Pedersen, which is actively maintained.
We first ported the whole CLI on a branch and reported every gap and bug we found: 36 issues and 17 pull requests.
Ståle fixed or merged nearly all of them within days, in aesh 3.19, 3.19.1 and 3.19.2.

aesh also helped with startup time. aesh 3.19.2 can skip scanning all 283 jars for its command registry
([aesh#779](https://github.com/aeshell/aesh/issues/779)) and starts logging only when it logs
([aesh#782](https://github.com/aeshell/aesh/issues/782)), and its annotation processor writes the command metadata at
build time, so the CLI no longer reads annotations with reflection at startup. Together they took tens of milliseconds
off every command.

Thank you, Ståle!

Commands and options are unchanged: before the switch we wrote a test with 2207 command lines, and the aesh port had to parse them the same way picocli
did. Your own CLI plugins must be changed for aesh; see the [upgrade guide](/manual/camel-4x-upgrade-guide-4_24.html).

## Try it

With the nightly build:

```shell
camel self-update --version SNAPSHOT
```

Nightly builds are for testing, not Apache releases; once 4.24 is out, `camel self-update --version 4.24` switches
back. Or use the [web installer](/manual/camel-jbang-launcher-install.html):

```shell
curl -fsSL https://camel.apache.org/install.sh | sh
```

The release notes list the many smaller CLI fixes in 4.24.
