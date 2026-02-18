---
title: "Apache Camel 4.18 What's New"
date: 2026-02-19
draft: false
authors: [ davsclaus ]
categories: [ "Releases" ]
preview: "Details of what we have done in the Camel 4.18 LTS release."
---

Apache Camel 4.18 LTS has just been [released](/blog/2026/02/RELEASE-4.18.0/).

This release introduces a set of new features and noticeable improvements that we will cover in this blog post.

## New Components

We have some new components to this release.

- `camel-aws-security-hub` - Manage and interact with AWS Security Hub for security findings.
- `camel-aws2-comprehend` - Perform natural language processing using AWS Comprehend and AWS SDK version  2.x.
- `camel-aws2-polly` - Synthesize speech using AWS Polly and AWS SDK version 2.x.
- `camel-azure-functions` - Invoke and manage Azure Functions.
- `camel-github2` - Interact with the GitHub API.
- `camel-google-firestore` - Store and retrieve data from Google Cloud Firestore NoSQL database.
- `camel-ocsf` - Marshal and unmarshal OCSF (Open Cybersecurity Schema Framework) security events to/from JSON.
- `camel-ibm-watsonx-ai` - Interact with IBM watsonx.ai foundation models for text generation, chat, camel-embeddings, and more.
- `camel-mina-sftp` - Upload and download files to/from SFTP servers using Apache MINA SSHD.

## Upgrading

Make sure to read the [upgrade guide](/manual/camel-4x-upgrade-guide-4_18.html) if you are upgrading from a previous
Camel version.

If you are upgrading from, for example, 4.4 to 4.8, then make sure to follow the upgrade guides for each release
in-between, i.e.
4.4 -> 4.5, 4.5 -> 4.6, and so forth.

The Camel Upgrade Recipes tool can also be used to automate upgrading.
See more at: https://github.com/apache/camel-upgrade-recipes

## Release Notes

You can find additional information about this release in the list of resolved JIRA tickets:

- [Release notes 4.18](/releases/release-4.18.0/)

## Roadmap

The next 4.19 release is planned in April.

The goal of that release is to migrate to Spring Boot v4, however all together
there will be related work to be done in upcoming release to get all of this aligned.

