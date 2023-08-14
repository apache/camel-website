---
title: "Apache Camel 4 What's New (top 10)"
date: 2023-08-15
authors: [davsclaus]
categories: ["Releases"]
preview: Top 10 of what's new in Apache Camel version 4
---

TODO: Something about Camel v4 just released

This blog post highlights some noteworthy new features and improvements in Camel v4.

### 1) Major Goals

TODO: SB3, Q3, Javax -> Jakarta, Java 17

### 2) Java 17

Camel 4 requires Java 17. Support for Java 21 is planned for next LTS released by end of this year. 

### 3) Dependency updates

We have upgraded all 3rd party dependencies to their latest releases where possible.

### 4) Performance optimizations

TODO: Stuff that Otavio worked on

### 5) Camel JBang

TODO: jbang stuff

### 6) Spring Boot native

TODO: Nicolas work on limited support for AOT

### 7) YAML DSL

TODO: Improved YAML DSL

### 8) XML DSL with beans

TODO: Gregorz stuff (preview)

### 9) New components

- `camel-aws2-step-functions`: Manage and invoke AWS Step functions
- `camel-azure-files`: Send and receive files on Azure File Storage
- `camel-dhis2`: Integrate with DHIS2 (health-level)
- `camel-opensearch`: Send requests to OpenSearch
- `camel-parquet-avro`: Parquet Avro serialization and de-serialization
- `camel-platform-http-main`: Platform HTTP for Camel Main runtime
- `camel-yaml-io`: YAML DSL route dumper

### 10) Miscellaneous improvements

Camel 4 now requires JUnit 5 for unit tests, with the test components that have -junit5 as suffix.

If you work with XML or JSon payloads then the body can be logged in pretty format with:

    .log("${prettyBody}")

And in XML

    <log message="${prettyBody}"/>

And in YAML

    - log: "${prettyBody}"

TODO: Other bits and pieces

### 11) Migrating to Camel 4

We have of course cleaned up the code base, such as removing all deprecated APIs and components. 
We have also adjusted some APIs in regard to configuring `CamelContext` with custom settings.

In terms of backward compatibility then Camel 4 is mostly compatible for regular Camel applications.
However, if you are using some of the more advanced features and other plugins in Camel then migration is needed.
Also, custom components must be migrated and recompiled.
All details can be seen in the [migration guide](/manual/camel-4-migration-guide.html).

Good luck with your migration if you decide to continue your Camel journey. And for new users to Camel then good luck getting onboard.

### 12) Camel Quarkus

The Camel Quarkus project is working on a new release with Camel 4 support, expected later this month.
Stay tuned for their release announcements.

