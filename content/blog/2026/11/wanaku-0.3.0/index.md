---
title: "Wanaku 0.3.0: Semantic Routing with Apache Camel"
date: 2026-11-20
draft: false
authors: [ orpiske ]
categories: ["Releases", "AI"]
keywords: ["apache camel", "wanaku", "semantic routing", "kamelets", "mcp", "ai agents"]
preview: "Wanaku 0.3.0 brings semantic routing with Kamelets and Apache Camel to AI agents through MCP."
---

Apache Camel connects applications, services, and data. As AI agents become another client of those integrations, developers need a way to expose business actions and control how agents call them.

Wanaku 0.3.0 brings the first stable release using its new routing engine based on Praxis. For Camel developers, a central addition is the workflow around the **Wanaku Semantic Router (WSR)**: build actions with Kamelets, route messages by meaning, and expose the resulting Camel integration through the Model Context Protocol (MCP). [Explore Wanaku 0.3.0](https://wanaku.ai/docs/latest/).

## Route by meaning, execute with Camel

Consider a support integration that receives messages about billing and delivery. Customers describe the same problem in many ways, which can make keyword rules difficult to maintain.

A semantic router evaluates the meaning of a message and selects a configured category. With WSR, that category selects a predefined Camel branch. For example, a support router could send billing messages to one destination and delivery messages to another. The agent submits a message through a single MCP tool; Camel executes the selected integration.

The model selects from configured labels. It cannot supply destination URIs or executable expressions. If no category matches, the router returns a no-match result and executes no action. Evaluation failures and action failures return errors. See the [semantic routing guide](https://wanaku.ai/docs/latest/connect/semantic-routing.html).

## From Kamelets to a published integration

The authoring workflow starts in **Wanaku Barn**. Its semantic router wizard lets developers select compatible Kamelets, configure action parameters, define classification criteria, and save example messages with expected labels.

Developers can preview classification before publication. Previews use an isolated Camel context without loading the action routes, so a classification preview does not execute business actions.

Barn also stores uploaded Kamelets. Compatible native sink Kamelets can become routing destinations, including a Kafka sink configured to receive the selected message. The WSR runtime must include the Camel components that those Kamelets require.

Publication creates an immutable catalog revision. WSR downloads and verifies that catalog before starting Camel. Published integrations retain their selected Kamelet content, so later catalog changes do not silently change a deployed workflow. The [authoring guide](https://wanaku.ai/docs/barn/next/manage/semantic-routing-wizard.html) explains the process.

## Govern access to Camel actions

WSR exposes the published Camel integration as an MCP tool. Wanaku discovers that tool and applies governance before forwarding calls to it.

Namespaces separate tool catalogs. Action policies and evaluators control permitted calls. A policy denial stops a request before it reaches WSR. Once authorized, WSR executes the configured workflow with its service credentials.

The responsibilities are clear: **Barn authors and publishes the integration, WSR runs Camel, and Wanaku governs access to the tool.** Read the [architecture and authorization details](https://wanaku.ai/docs/latest/connect/semantic-routing.html).

For Camel developers, a useful starting point is a small set of Kamelets and a routing question with clear categories. Wanaku 0.3.0 brings those familiar integration building blocks into a workflow that AI agents can discover and call. Existing Wanaku users should also review the [migration guide](https://wanaku.ai/docs/latest/get-started/migration-from-classic.html) for the transition from the earlier Java-based server.
