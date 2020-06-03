---
title: "How to quickly run 100 Camels with Apache Camel, Quarkus and GraalVM"
date: 2020-04-15
authors: [davsclaus]
categories: ["Videos"]
preview: 10 minute video of how to run Camel with Quarkus in both JVM and native compiled mode.
---

Today I continue me practice on youtube and recorded a [10 minute video](https://www.youtube.com/watch?v=4lXSf8DBQkQ) on creating a new Camel and Quarkus project that includes Rest and HTTP services with health checks and metrics out of the box.

Then comparing the memory usage of running the example in JVM mode vs native compiled with GraalVM. Then showing for the finale how to quickly run 100 instances of the example each on their own TCP port and how quick Camel are to startup and service the first requests faster than you can type and click.

For this demo I am using Java 11, Apache Camel 3.2.0, Quarkus 1.3.2 and GaalVM CE 20.0.0. You can find the source code for the example at camel-quarkus github with instructions how to try for yourself.

We are working on reducing the binary image size for Camel 3.3, by eliminating more classes that GraalVM includes that are not necessary. And we also have an experiment with an alternative lightweight CamelContext that are non dynamic at runtime which can improve this further. And then GraalVM and Quarkus will of course also keep innovative and make it smaller and faster.

- Link to video: https://www.youtube.com/watch?v=4lXSf8DBQkQ
