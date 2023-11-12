---
title: "Apache Camel 4.2 What's New"
date: 2023-11-15
authors: [davsclaus]
categories: ["Releases"]
preview: Details of what we have done in the Camel 4.2 release.
---

Apache Camel 4.2 (non LTS) has just been [released](/blog/2023/11/RELEASE-4.2.0/).

This release introduces a set of new features and noticeable improvements that we will cover in this blog post.

## Java 21

This is the first release that officially supports running on Java 21.

## Camel Core

The Java DSL now supports String text-blocks when defining Camel URIs, as shown:

```
from("""debezium-postgres:customerEvents
        ?databasePassword={{myPassword}}
        &databaseDbname=myDB
        &databaseHostname=myHost
        &pollIntervalMs=2000
        &queryFetchSize=100""")
    .to("kafka:cheese");
```


## DSL

TODO:

## Camel JBang (Camel CLI)

TOOD: debug command

## Spring Boot

Upgraded to latest 3.1.5 release.

## Miscellaneous

The `camel-azure` can now send binary files to Azure Service Bus,

## New Components

- `camel-azure-schema-registry` - Azure Schema Registry Component for utilities to deal with authentication
- `camel-smb` - SMB component which consumes natively from file shares using the Server Message Block (SMB, also known as Common Internet File System - CIFS) protocol

## Upgrading

Make sure to read the [upgrade guide](/manual/camel-4x-upgrade-guide-4_2.html) if you are upgrading from a previous Camel version.

## Release Notes

You can find more information about this release in the list of JIRA tickets resolved in the release:

- [Release notes 4.2](/releases/release-4.2.0/)

## Roadmap

The following 4.3 release is planned to support Spring Boot 3.2.

This release is likely to be the next LTS release in January 2024. But we may release it as a non-LTS
release in December and then let Camel 4.4 be the LTS release for January 2024.

