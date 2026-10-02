---
title: "Thirty years of command-line tools, and nobody knew them all"
date: 2026-10-02
draft: false
authors: [davsclaus]
categories: ["AI", "Tooling"]
keywords: ["apache camel", "AI", "cli", "mcp", "camel catalog", "connectors", "integration"]
preview: "My Mac mini ran warm, and an AI found the cause with Unix tools that have been around for most of my career. Camel has the same shape: twenty years of connectors and options that no single person knows, and an AI that can use all of them."
---

This afternoon my Mac mini felt warm. Not hot, just warmer than an idle computer should be. So I typed one sentence into my AI coding assistant: *my mac mini is warm, what is it doing?*

A few seconds later I had the answer. Two processes had been busy for days. One was a Python script that had been walking every JSON file in a `node_modules` folder for twenty days. The other was a shell loop with no `sleep` in it, spinning on a core for six days. Both were leftovers from earlier AI sessions; the sessions had ended, but the commands had not.

The tools it used were nothing new: `top` to find the busy processes, `ps` to see their parents and start times, `lsof` to find the folder each one was working in and the ports it listened on, `pmset` and `sysctl` for the thermal state. Every Unix administrator knows these commands. Few people know all their flags, and almost nobody knows how to combine them on the spot into "this Python process belongs to an orphaned script from a session that ended weeks ago".

The AI did. After the cleanup the CPU sat at 40 °C, drawing less than half a watt.

## The tools were never the problem

That moment made something clear to me. The command-line tools of the last thirty years were never closed or hard to reach. They are documented, scriptable, and they all speak plain text. The problem was always us: `find`, `awk`, `lsof` and their friends each have dozens of options, and the useful combinations run into the thousands. Most of us know less than five percent of it, and search for the rest.

It is the same with every big tool we use. You write documents in a word processor with a handful of menus you know by heart. You code in your IDE with twenty shortcuts and actions, and every now and then you go hunting for "that one action you can't really remember, but know is there somewhere".

An AI does not have that limit. It has read the manuals, and it can try a command, read the output, and decide the next one. We humans just say what we want in English.

## Camel has the same shape

Apache Camel is twenty years old. It has more than 300 connectors, thousands of endpoint options, the Enterprise Integration Patterns, the Simple language, data formats, error handling, and a lot of hard-won detail in every corner. Just like the Unix tools, nobody knows all of it. Most Camel users know the connectors they use every day, and look up the rest.

Now a user can say: *poll this S3 bucket, split the CSV, send each row to Kafka, and retry three times when Kafka is down*. The AI can pick the right connectors and the right options, including the ones the user never knew existed.

But there is a catch. When I asked about my warm Mac mini, the answer was right because it came from `ps` output, not from a guess. An AI writing Camel routes needs the same grounding. That is why so much of the recent Camel work is about making Camel readable for machines:

- The [Camel catalog](/manual/camel-catalog.html) describes every connector, option, EIP and language in a machine-readable form, generated from the code itself.
- The examples in the Camel documentation are now checked by the build, so what an AI learns from the docs is valid Camel.
- The [Camel MCP server](/manual/camel-jbang-mcp.html) lets any AI coding assistant look up the catalog, validate a route, and inspect a running integration, instead of guessing.
- The Camel CLI (`camel run`, `camel get`, `camel cmd`) does for a running integration what `ps` and `lsof` did for my Mac: it shows what is actually going on, in plain text.

## Discipline still matters

One more lesson from this afternoon: the two runaway processes were started by an AI in the first place. A tool that can operate your computer needs the habits of a careful administrator. Commands should have limits, loops should have exits, and someone should check that things actually stopped. The same goes for AI-written integrations: let the AI use all of Camel, but let the catalog, the validator and your tests keep it honest.

Thirty years of command-line tools, and nobody knew them all. Twenty years of Camel, and nobody knows all of it. We don't have to anymore.
