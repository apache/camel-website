---
title: "Apache Camel 4.5 What's New"
date: 2024-03-29
authors: [davsclaus]
categories: ["Releases"]
preview: Details of what we have done in the Camel 4.5 release.
---

Apache Camel 4.5 has just been [released](/blog/2024/03/RELEASE-4.5.0/).

This release introduces a set of new features and noticeable improvements that we will cover in this blog post.

## Camel Core



## Miscellaneous

TODO:

Upgraded many third-party dependencies to the latest release at the time of release.

## New Components

We have added some new AI based components and support for wasm and jolokia.  

- `camel-aws-bedrock` - Invoke Model of AWS Bedrock service.
- `camel-aws-bedrock-agent` - Operate on AWS Bedrock through its Agent.
- `camel-aws-bedrock-agent-runtime` - Invoke Model of AWS Bedrock Agent Runtime service.
- `camel-langchain-chat` - LangChain4j Chat component
- `camel-langchain-embeddings` - LangChain4j Embeddings
- `camel-milvus` - Perform operations on the Milvus Vector Database.
- `camel-qdrant` - Perform operations on the Qdrant Vector Database.
- `camel-wasm` - Call a wasm (web assembly) function.
- `camel-platform-http-jolokia` - Jolokia plugin for standalone Camel HTTP Platform

## Upgrading

Make sure to read the [upgrade guide](/manual/camel-4x-upgrade-guide-4_5.html) if you are upgrading from a previous Camel version.

If you are upgrading from, for example, 4.0 to 4.4, then make sure to follow the upgrade guides for each release in-between, i.e.
4.0 -> 4.1, 4.1 -> 4.2, and so forth.

## Release Notes

You can find more information about this release in the list of JIRA tickets resolved in the release:

- [Release notes 4.5](/releases/release-4.5.0/)

## Roadmap

The following 4.6 release (non LTS) is planned for May 2024.

