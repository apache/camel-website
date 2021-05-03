---
title: "New release of VS Code Language Support for Apache Camel 0.0.32 and VS Code Tooling for Camel K 0.0.24"
date: 2021-05-03
authors: [apupier]
categories: ["Releases","Tooling"]
preview: "New release of VS Code Language Support for Apache Camel 0.0.32 and VS Code Tooling for Camel K 0.0.24: catalog updates, connected mode for Kafka topic completion and dependencies support for Camel K Java integration file"
---

A new release of [VS Code Language Support for Apache Camel](https://marketplace.visualstudio.com/items?itemName=redhat.vscode-apache-camel) 0.0.32 is available. It includes upgrade of Camel catalogs, connected mode for Kafka topic completion and dependencies support for Camel K Java integration file.

# Camel version upgrades

The default Camel catalog has been upgraded from 3.8.0 to 3.9.0.

The Camel Quarkus catalog has been upgraded from 1.7.0 to 1.8.1.

The Camel Kafka Connector catalog has been upgraded from 0.8.0 to 0.9.0.

The default Camel K CLI has been upgraded from 1.3.2 to 1.4.0.

# Connected mode for Kafka topic completion

The list of Kafka topics are provided in completion. By default, they are retrieved from an unauthenticated local Kafka instance running at localhost:9092.

A setting allows to configure the Kafka connection URL. It can be found at *File -> Preferences -> Settings -> Apache Camel Tooling -> Kafka Connection URL*

Check this [video](https://youtu.be/e4dkV8YhSoE) to see it in action.

# Command to update dependencies of Camel K Integration

A command has been provided to refresh the classpath of a Camel K Integration file written in Java which is opened in the current editor.

Check this [video](https://youtu.be/C2gKvnmSYVA) to see it in action.

See [FUSETOOLS2-1079](https://issues.redhat.com/browse/FUSETOOLS2-1079) for potential improvements and current limitations.

# What's next?

Provide your feedback and ideas!
You can start discussions on [Zulip camel-tooling channel](https://camel.zulipchat.com/#narrow/stream/258729-camel-tooling).
You can create and vote for issues on github [Camel Language Server](https://github.com/camel-tooling/camel-language-server/issues), [VS Code Language support for Apache Camel](https://github.com/camel-tooling/camel-lsp-client-vscode/issues) and [VS Code Tooling for Apache Camel K](https://github.com/camel-tooling/vscode-camelk/issues) repositories.
You can create and vote for issues on the [jira](https://issues.redhat.com/browse/FUSETOOLS2) used by the Red Hat Integration tooling team.
