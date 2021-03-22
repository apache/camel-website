---
title: "Camel Quarkus 1.1.0 Released"
date: 2020-09-14
authors: ["jamesnetherton"]
categories: ["Releases", "Camel Quarkus"]
preview: "Camel Quarkus 1.1.0 Released"
---

Apache Camel Quarkus 1.1.0 has been released!

We continue to integrate with the latest Camel and [Quarkus](https://quarkus.io/) releases, whilst adding new features and fixing bugs.

For a full overview of the changes see the [1.1.0 milestone details](https://github.com/apache/camel-quarkus/milestone/5?closed=1).

Here are some of the highlights.

## Major component upgrades

* [Camel 3.5.0](/blog/2020/09/Camel35-Whatsnew/)
* Quarkus 1.8.0

## New extensions

We added a whopping 174 new extensions in this release! This is because Camel Quarkus will shortly become [the only and default runtime](http://camel.465427.n5.nabble.com/camel-k-switch-to-Quarkus-as-default-framework-for-integrations-td5869959.html) in our sibling project [Camel K](/camel-k/latest/). 
159 of the new extensions initially have support for JVM mode only.

In addition, native support has been added to the following 16 extensions:

* [ArangoDB](/camel-quarkus/latest/reference/extensions/arangodb.html)
* [AS2](/camel-quarkus/latest/reference/extensions/as2.html)
* [AWS 2 Lambda](/camel-quarkus/latest/reference/extensions/aws2-lambda.html)
* [AWS 2 Security Token Service (STS)](/camel-quarkus/latest/reference/extensions/aws2-sts.html)
* AWS IAM
* [Dropbox](/camel-quarkus/latest/reference/extensions/dropbox.html)
* [Flatpack](/camel-quarkus/latest/reference/extensions/flatpack.html)
* [Git](/camel-quarkus/latest/reference/extensions/git.html)
* [Master](/camel-quarkus/latest/reference/extensions/master.html)
* [NATS](/camel-quarkus/latest/reference/extensions/nats.html)
* [RabbitMQ](/camel-quarkus/latest/reference/extensions/rabbitmq.html)
* [SmallRye Reactive Messaging](/camel-quarkus/latest/reference/extensions/smallrye-reactive-messaging.html)
* [ThreadPoolFactory Vert.x](/camel-quarkus/latest/reference/extensions/threadpoolfactory-vertx.html)
* [Vert.x HTTP Client](/camel-quarkus/latest/reference/extensions/vertx-http.html)
* [Vert.x WebSocket](/camel-quarkus/latest/reference/extensions/vertx-websocket.html)
* [Weather](/camel-quarkus/latest/reference/extensions/weather.html)

You can browse the full list of supported extensions over at the [extensions reference](/camel-quarkus/latest/reference/index.html).

## Less use of reflection

Over the past months, we have gradually reduced the number of Camel classes that were needlessly required to be registered for reflection. Thanks to Camel 3.5.0, 
we have been able to eliminate all of these remaining cases and take advantage of the resulting performance boost.

## SNAPSHOT builds

The project has started publishing SNAPSHOT releases from the `master` branch (builds with stable Camel & Quarkus releases), the `camel-master` branch (builds with the latest Camel SNAPSHOT) and also from the `quarkus-master` branch (builds with the latest Quarkus SNAPSHOT). There are more details about this here:

/camel-quarkus/latest/contributor-guide/ci.html#_snapshot_deploy_build

## We ❤️ new contributors!
We were happy to welcome as many as four new contributors in this release period. [Lukáš](https://github.com/llowinge) improved some of our tests, [Zineb](https://twitter.com/ZinebBendhiba) and [Marcel](https://twitter.com/JeansenML) were brave enough to deliver two native extensions each and [Pooja](https://github.com/PoojaChandak) invested her time in improving our documentation.
Many thanks for the contributions!

## What's next?

We move onwards towards supporting Camel 3.6.0 and Quarkus 1.9.0. There's also a [large list](https://github.com/apache/camel-quarkus/issues?q=is%3Aissue+is%3Aopen+label%3Anative) of extensions that need native support. 

As ever, we love contributions. So if you'd like to fix a bug, add a new extension or add native support to an existing one, check out the [list of issues](https://github.com/apache/camel-quarkus/issues) and the [contributor guide](/camel-quarkus/latest/contributor-guide/index.html).

We hope you enjoy Camel Quarkus 1.1.0 and we look forward to your feedback and participation!
