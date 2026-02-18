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

## Camel Core

Added the possibility to add `note`(s) to EIPs. This is intended for developer notes or other kind of notes,
that is convention to have at the source code. The note has no impaction on the running Camel. Another use case is
to build tutorials with half complete code, and have note(s) that describe what to do.

## Camel Simple

The simple language has been improved tremendously.

TODO: Claus

### Adding custom functions 

You can now add custom functions that can be used as _first class_ functions in your simple expressions or predicates.

TODO: More stuff here


## Camel JBang

Every command now has a generated documentation page on the website, that explains what the command do,\
and every option supported.

The `camel cmd send` command can now also send messages to a running infra service (via `--infra`), such as 

```shell
$ camel cmd send --body=hello --infra=nats
```

The `camel version list --fresh` will store the result to local disk, so when using `camel version list` then it includes
the latest information.

Add new `validate` plugin that can be installed and then used for validating YAML DSL files without running Camel.
The validation is based on the YAML DSL schema specification.

```shell
$ camel plugin add validate
$ camel validate yaml foo.camel.yaml
```

This functionality is also available as a Maven Plugin.

```shell
$ mvn camel-yaml-dsl-validator:validate

[INFO] --- camel-yaml-dsl-validator:4.18.0:validate (default-cli) @ camel-example-main-yaml ---
[INFO] Found [.../camel-examples/main-yaml/src/main/resources/routes/my-route.camel.yaml] YAML files ...
[INFO] Validating 1 YAML files ...
[WARNING]

Validation error detected in 1 files

	File: my-route.camel.yaml
		/0/route/from: property 'step' is not defined in the schema and the schema does not allow additional properties
		/0/route/from: required property 'steps' not found
```

## Camel Kafka

Configuring security with `camel-kafka` has been streamlined to be much easier and _similar_ for all kinds of Kafka security configurations.

TODO: Andrea

## Camel AI

### Camel OpenAI

TODO: Ivo

### MCP Server

TODO: Andrea
TODO: link to blog post

## Camel Quarkus

When using `camel-main` or `camel-quarkus` then Rest DSL in _contract first_ style is now
registering each API endpoints individually with the underlying HTTP server which allows Quarkus
to register access control and metrics per endpoint instead of a single combined overall endpoints as previously.
This now works the same way as Rest DSL in _code first_ style behaves.

## Miscellaneous

Upgraded many third-party dependencies to the latest releases at the time of release.

The `camel-mock` component can now assert JSon where the ordering of the elements does not matter.

The new `camel-mina-sftp` has support for OpenSSH certifications for security. A feature the existing `camel-ftp`
does not offer via the JSch FTP library.

The `camel-zipfile` now avoids loading the entire zip content into memory when used with Split EIP. 

When testing routes that has been _advice with_ then the route coverage tool now handles this as well.

The `camel-file` when writing files and checksum has been enabled, then the checksum is now also stored
as a message header that allow to have this information directly in Camel.

When using Camel Spring Boot you can now also for **development purposes** turn on `camel.ssl.trustAllCertificates = true`
to accept all SSL certificates. Do not use in production!

The `camel-aws-s3` when uploading files to AWS S3 is now supporting directly streaming from file sources.

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

## Java 25

A few more 3rd party components has been made Java 25 compatible.
However, we expected still some time before all of Camel is Java 25 compatible.

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

