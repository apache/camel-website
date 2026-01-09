---
title: "Apache Camel 4.17 What's New"
date: 2026-01-14
draft: false
authors: [ davsclaus, Croway ]
categories: [ "Releases" ]
preview: "Details of what we have done in the Camel 4.17 release."
---

Apache Camel 4.17 has just been [released](/blog/2026/01/RELEASE-4.17.0/).

This release introduces a set of new features and noticeable improvements that we will cover in this blog post.

## Camel Core

TODO:

## Camel Test

We have added `camel-test` modules for JUnit 6 support.

## Camel JBang

TODO:

## Camel Spring Boot

`camel-spring-boot` is upgraded to the latest Spring Boot 3.5.9 release.

### Spring AI Integration

Camel 4.17 introduces comprehensive integration with [Spring AI](https://docs.spring.io/spring-ai/reference/), providing four new components that bring AI/LLM capabilities to Camel routes:

- **camel-spring-ai-chat**: Perform chat operations with any LLM supported by Spring AI. Features include prompt templates, conversation memory (message-based and vector-based semantic memory), Retrieval Augmented Generation (RAG) with VectorStore, multimodal support (images, audio, documents), SafeGuard content filtering, structured output conversion, and token usage tracking.

- **camel-spring-ai-tools**: Enable function calling / tool use that allows AI models to invoke Camel routes as tools during conversations. This enables building agentic AI applications where LLMs can execute business logic, query databases, call external APIs, and more.

- **camel-spring-ai-embeddings**: Compute embeddings using Spring AI embedding models for semantic similarity search, text clustering, and RAG pipelines.

- **camel-spring-ai-vector-store**: Store and retrieve documents in vector databases with similarity search and metadata filtering.

Together, these components provide a foundation for integrating AI capabilities into Camel integration flows, leveraging the AI models and vector stores supported by Spring AI.

## Java 25

We continue to prepare the code-base for the upcoming Java 25 release. However, this release does
not officially support Java 25, but we are not aware of any issues (feedback is welcome).
We will work on official Java 25 support later in 2026.

There are some 3rd-party libraries that are not yet Java 25 compatible, and we are waiting for those
to release compatible versions.

## Miscellaneous

Upgraded many third-party dependencies to the latest releases at the time of release.

## New Components

- `camel-aws2-rekognition` - Manage and invoke AWS Rekognition.
- `camel-aws2-s3-vectors` - Store and query vector embeddings using AWS S3 Vectors with similarity search.
- `camel-chroma` - Perform operations on the Chroma Vector Database.
- `camel-cli-debug` - Remote CLI debugger
- `camel-cyberark-vault` - Retrieve secrets from CyberArk Conjur Vault.
- `camel-google-vertexai` - Interact with Google Cloud Vertex AI generative models.
- `camel-ibm-watson-speech-to-text` - Convert speech audio to text using IBM Watson Speech to Text
- `camel-ibm-watson-text-to-speech` - Convert text to natural-sounding speech using IBM Watson Text to Speech
- `camel-once` - Camel Once component
- `camel-opentelemetry-metrics` - Camel metrics based on the Camel Telemetry spec
- `camel-spring-ai-chat` - Perform chat operations using Spring AI.
- `camel-spring-ai-embeddings` - Spring AI Embeddings
- `camel-spring-ai-tools` - Spring AI Tools and Function Calling Features
- `camel-spring-ai-vector-store` - Spring AI Vector Store
- `camel-stripe` - Camel Stripe component
- `camel-test-junit6` - Camel unit testing with JUnit 6
- `camel-test-main-junit6` - Camel unit testing with Main and JUnit 6
- `camel-test-spring-junit6` - Camel unit testing with Spring and JUnit 6

## Upgrading

Make sure to read the [upgrade guide](/manual/camel-4x-upgrade-guide-4_17.html) if you are upgrading from a previous
Camel version.

If you are upgrading from, for example, 4.4 to 4.8, then make sure to follow the upgrade guides for each release
in-between, i.e.
4.4 -> 4.5, 4.5 -> 4.6, and so forth.

The Camel Upgrade Recipes tool can also be used to automate upgrading.
See more at: https://github.com/apache/camel-upgrade-recipes

## Release Notes

You can find additional information about this release in the list of resolved JIRA tickets:

- [Release notes 4.17](/releases/release-4.17.0/)

## Roadmap

The following 4.18 LTS release is planned for February/March 2026.

This will be the last release that supports Spring Boot 3.5.x.

From Camel 4.19 onwards we are on a journey to migrate to Spring Boot v4, Spring Framework v7, JUnit v6, 
Jackson v3, Groovy v5, and other major upgrades that would be a bumpy road to travel.
