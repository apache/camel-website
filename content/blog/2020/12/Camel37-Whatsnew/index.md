---
title: "Apache Camel 3.7 What's New"
date: 2020-12-17
authors: [davsclaus]
categories: ["Releases"]
preview: Details of what we have done in the Camel 3.7 release.
---

Apache Camel 3.7 LTS has just been released.

This is a LTS release which means we will provide patch releases for one year.
The next planned LTS release is 3.10 scheduled towards summer 2021.


## So what's in this release?

This release introduces a set of new features and noticeable improvements that we will cover in this blog post.


### Spring Boot

We have upgraded to the latest release at this time which is Spring Boot 2.4.0.

TODO: csimple (and jOOR)
TODO: salesforce component fixes
TODO: vertx kafka component
TODO: optimize more core (direct and event notifier, avoid regexp, faster code)
TODO: optimize simple (singleton, eager load resource, concat expressions)
TODO: untangle reifier, model, processor
TODO: lightweight mode
TODO: optimize core - base converters in 2 classes, reduce memory overhead
TODO: optimize routing engine - reduce object allocations
TODO: reflection free
TODO: 2 blog posts from davsclaus
TODO: #autowired by type on component



### Language precompilation

As mentioned in the optimization section we moved initialization of languages to an earlier phase.
Camel now pre compile languages when its applicable, for example JSonPath, and XPath language.

And speaking of pre-compiled languages then Camel 3.7 introduces the [jOOR language](/components/latest/languages/joor-language.html)
to use runtime compile Java in the Camel DSL. A compiled simple language is also on the roadmap.


### Optimized components startup

The camel core has been optimized in Camel 3 to be small, slim, and fast on startup. This benefits Camel Quarkus which
can do built time optimizations that take advantage of the optimized camel core.

We have continued this effort in the Camel components where whenever possible initialization is moved ahead
to an earlier phase during startup, that allows enhanced built time optimizations. As there are a lot of Camel
components then this work will progress over the next couple of Camel releases.


### New components

This release has a number of new components, data formats and languages:

- AtlasMap: Transforms the message using an AtlasMap transformation
- Kubernetes Custom Resources: Perform operations on Kubernetes Custom Resources and get notified on Deployment changes
- Vert.X Kafka: Sent and receive messages to/from an Apache Kafka broker using vert.x Kafka client
- JSON JSON-B: Marshal POJOs to JSON and back using JSON-B
- CSimple: Evaluate a compile simple expression language
- DataSonnet: To use DataSonnet scripts in Camel expressions or predicates
- jOOR: Evaluate a jOOR (Java compiled once at runtime) expression language


## Upgrading

Make sure to read the [upgrade guide](/manual/latest/camel-3x-upgrade-guide-3_7.html) if you
are upgrading to this release from a previous Camel version.


## More details

The previous LTS release was Camel 3.4. We have blog posts for what's new in
[Camel 3.5](https://camel.apache.org/blog/2020/10/Camel36-Whatsnew/) and
[Camel 3.6](https://camel.apache.org/blog/2020/09/Camel35-Whatsnew/) you may want to read
to cover all news between the two LTS releases.


## Release Notes

You can find more information about this release in the [release notes](/releases/release-3.7.0/),
with a list of JIRA tickets resolved in the release.
