---
title: "Apache Camel 4.19 What's New"
date: 2026-04-20
draft: false
authors: [ davsclaus ]
categories: [ "Releases" ]
preview: "Details of what we have done in the Camel 4.19 release."
---

Apache Camel 4.19 has just been [released](/blog/2026/04/RELEASE-4.19.0/).

This release introduces a set of new features and noticeable improvements that we will cover in this blog post.

## Camel Core

## Camel Simple

The simple language has been improved tremendously.

### More Functions

We have added 50 more functions to simple language so it now comes with a total of 114.

There are now a lot more functions to work with the data such as String related functions,
and also math functions so you can sum totals, find the maximum or minimum value and more.

For example, if you work with JSon data, then there is a new `safeQuote` function,
which will based on the data type quote the value if necessary.

We also made it possible for Camel components and custom components to provide simple functions.
For example `camel-attachments` and `camel-base64` has a set of functions out of the box.

## Camel JBang

## Camel Kafka

## Camel AI

### Camel OpenAI

### MCP Server

## Camel Spring Boot

## JDK25 compatibility

## Miscellaneous

Upgraded many third-party dependencies to the latest releases at the time of release.

## New Components

We have some new components to this release.

- `camel-azure-functions` -  Invoke and manage Azure Functions.
- `camel-camunda` - Interact with Camunda 8 Orchestration Clusters using the Camunda Java Client.
- `camel-event` - Subscribe to Camel internal events such as route started/stopped and exchange.
- `camel-google-firestore` - Store and retrieve data from Google Cloud Firestore NoSQL database.
- `camel-google-speech-to-text` - Transcribe audio to text using Google Cloud Speech-to-Text API
- `camel-google-text-to-speech` - Synthesize speech from text using the Google Cloud Text-to-Speech API
- `camel-google-vision` - Detect labels, text, faces, logos and more on images through Google Cloud Vis…
- `camel-groovy` - GroovyJson data format to transform between JSon and java.util.Map or java.util.List objects.
- `camel-hazelcast-pncounter` - Increment, decrement, get, etc. operations on a Hazelcast PN Counter
- `camel-huggingface` - Integration with Hugging Face's Model Hub by using the Deep Java Library
- `camel-ibm-watsonx-data` - Interact with IBM watsonx.data lakehouse for catalog, schema, table
- `camel-pgvector` - Perform operations on the PostgreSQL pgvector Vector Database.
- `camel-spring-ai-image` - Spring AI Image Generation

## Upgrading

Make sure to read the [upgrade guide](/manual/camel-4x-upgrade-guide-4_19.html) if you are upgrading from a previous
Camel version.

If you are upgrading from, for example, 4.4 to 4.8, then make sure to follow the upgrade guides for each release
in-between, i.e.
4.4 -> 4.5, 4.5 -> 4.6, and so forth.

The Camel Upgrade Recipes tool can also be used to automate upgrading.
See more at: https://github.com/apache/camel-upgrade-recipes

## Release Notes

You can find additional information about this release in the list of resolved JIRA tickets:

- [Release notes 4.19](/releases/release-4.19.0/)

## Roadmap

The next 4.20 release is planned in June.

