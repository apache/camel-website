---
title: "Introducing the Resume API v2"
date: 2022-03-22
draft: false
authors: [orpiske]
categories: ["Features", "Camel"]
preview: "Introducing the Resume API v2"
---

The need to process larger quantities of data has been a growing concern and necessity within our community. For the last few releases we have been working to create mechanisms to simplify how our users can consume data at scale.

Although Camel is no stranger to consuming data at scale, recent trends in computing and systems architecture introduce the need for behaviors that improve agility, speed and scalability when doing so. That's why, starting with Camel 3.11, we included in the Kafka component the ability to restart data consumption at specific offsets in the topics. Subsequent releases of Camel expanded this feature to other components and opened up the API to give the users more flexibility.

With Camel 3.16.0 we are leveraging the work we did in the previous releases to create a more elegant and flexible API. We are calling it the [Resume API V2](/components/next/eips/resume-strategies.html).


With this API the users can instruct Camel to start consuming data from the last offset that was processed. For instance, when reading a very large file Camel can skip reading the file offsets that have been previously consumed. It can start processing at the last processed offset. 

The Resume API should not be confused with the [Idempotent Consumer](/components/next/eips/idempotentConsumer-eip.html). Although there is a small overlap between them (in the sense that they avoid processing twice) they operate at different levels. The Resume API works at the component level, ensuring that the component-specific lower level input skip the processed data, whereas the Idempotent Consumer reads it all and filters the duplicates. Additionally, the Resume API offers a greater deal of flexibility for evaluating the data to be resumed. 

Here's an example of that API in action, taken from the [Resume API File Offset Example](https://github.com/apache/camel-examples/tree/main/examples/resume-api/resume-api-file-offset):

[![asciicast](https://asciinema.org/a/477253.svg)](https://asciinema.org/a/477253)

This example shows a sample Camel integration reading a large file and publishing the offsets to a Kafka instance that serves as the storaged for the offsets. It displays it consuming batches of 30 lines, then stopping and then resuming from where it stopped.

A similar example to the one above, shows the Resume API v2 processing large directories [Resume API File Set Example](https://github.com/apache/camel-examples/tree/main/examples/resume-api/resume-api-fileset):

[![asciicast](https://asciinema.org/a/477253.svg)](https://asciinema.org/a/477253)

The Resume API v2 also works in clustered mode with the master component. This means that integrations using clustering with this component, can have their secondary nodes pick up the processing from where the primary left off. The [Resume API File Set Clusterized Example](https://github.com/apache/camel-examples/tree/main/examples/resume-api/resume-api-fileset-clusterized) demonstrates how this:

[![asciicast](https://asciinema.org/a/479064.svg)](https://asciinema.org/a/479064)

In this release we are starting with a limited set of supported components:

* camel-aws2-kinesis
* camel-couchdb
* camel-file
* camel-kafka

In the subsequent releases we plan to implement support for other components and continue to mature and stabilize the API. If you find an issue with this feature, don't hesitate to [report an issue](https://issues.apache.org/jira) or provide a [contribution](https://github.com/apache/camel) to Apache Camel.