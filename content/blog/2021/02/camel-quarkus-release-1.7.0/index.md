---
title: "Camel Quarkus 1.7.0 Released"
date: 2021-02-24
authors: ["ppalaga"]
categories: ["Releases", "Camel Quarkus"]
preview: "Camel Quarkus 1.7.0 Released"
summary: "The highlights of Camel Quarkus 1.7.0"
---

<sub><sup>Original image by <a href="https://commons.wikimedia.org/wiki/User:99of9">Toby Hudson</a> <a href="https://creativecommons.org/licenses/by-sa/3.0">CC BY-SA 3.0</a> via <a href="https://en.wikipedia.org/wiki/Camel_racing#/media/File:CamelRacingCamelCup2009Heat.JPG">Wikipedia</a></sup></sub>

We are pleased to announce the release 1.7.0 of Camel Quarkus! Here are the highlights.

## Camel 3.8.0 and Quarkus 1.12.0.Final

We stand on the shoulders of two giants. Please check the release announcements for
[Camel 3.8.0](/blog/2021/02/Camel38-Whatsnew/) and [Quarkus 1.12.0.Final](https://quarkus.io/blog/quarkus-1-12-0-final-released/) to learn about the news they bring.

The [change of default packaging format](https://quarkus.io/blog/quarkus-1-12-0-final-released/#fast-jar-as-default)
to Fast JAR in Quarkus 1.12 is worth mentioning also here. Before Camel Quarkus 1.7.0 you used to start your application
in JVM mode via something like

```sh
$ java -jar target/*-runner.jar
```

and now since Camel Quarkus 1.7.0, you have to use

```sh
$ java -jar target/quarkus-app/quarkus-run.jar
```

Your Docker files and deployment scripts might need an adjustment when you upgrade to Camel Quarkus 1.7.0.

You can go back to the original behavior by setting `quarkus.package.type=legacy-jar` in your
`application.properties`.

## Support for more Camel components

Camel Quarkus brings support for six new Camel components:

* [Azure Event Hubs](/camel-quarkus/latest/reference/extensions/azure-eventhubs.html)
* [Kamelet](/camel-quarkus/latest/reference/extensions/kamelet.html)
* [OAI-PMH](/camel-quarkus/latest/reference/extensions/oaipmh.html)
* [Spring RabbitMQ](/camel-quarkus/latest/reference/extensions/spring-rabbitmq.html)
* [XML Security Sign and Verify](/camel-quarkus/latest/reference/extensions/xmlsecurity.html)
* [JFR](/camel-quarkus/latest/reference/extensions/jfr.html) (JVM only)

Components newly supported in native mode:

* [AtlasMap](/camel-quarkus/latest/reference/extensions/atlasmap.html)
* [AWS 2 Eventbridge](/camel-quarkus/latest/reference/extensions/aws2-eventbridge.html)
* [AWS 2 Kinesis and Firehose](/camel-quarkus/latest/reference/extensions/aws2-kinesis.html)
* [Azure Storage Queue Service](/camel-quarkus/latest/reference/extensions/azure-storage-queue.html)
* [Cassandra CQL](/camel-quarkus/latest/reference/extensions/cassandraql.html)
* [IPFS](/camel-quarkus/latest/reference/extensions/ipfs.html)
* [PubNub](/camel-quarkus/latest/reference/extensions/pubnub.html)
* [StAX](/camel-quarkus/latest/reference/extensions/stax.html)
* [CBOR](/camel-quarkus/latest/reference/extensions/cbor.html)
* [Syslog](/camel-quarkus/latest/reference/extensions/syslog.html)

## Deprecated extensions

We are following the deprecation of the underlying Camel components:

* [AWS EC2 (SDK v1)](/camel-quarkus/latest/reference/extensions/aws-ec2.html)
* [AWS ECS (SDK v1)](/camel-quarkus/latest/reference/extensions/aws-ecs.html)
* [AWS EKS (SDK v1)](/camel-quarkus/latest/reference/extensions/aws-eks.html)
* [AWS IAM (SDK v1)](/camel-quarkus/latest/reference/extensions/aws-iam.html)
* [AWS Kinesis (SDK v1)](/camel-quarkus/latest/reference/extensions/aws-kinesis.html)
* [AWS KMS (SDK v1)](/camel-quarkus/latest/reference/extensions/aws-kms.html)
* [AWS Lambda (SDK v1)](/camel-quarkus/latest/reference/extensions/aws-lambda.html)
* [AWS S3 (SDK v1)](/camel-quarkus/latest/reference/extensions/aws-s3.html)
* [AWS SDB (SDK v1)](/camel-quarkus/latest/reference/extensions/aws-sdb.html)
* [AWS SNS (SDK v1)](/camel-quarkus/latest/reference/extensions/aws-sns.html)
* [AWS SQS (SDK v1)](/camel-quarkus/latest/reference/extensions/aws-sqs.html)
* [AWS SWF (SDK v1)](/camel-quarkus/latest/reference/extensions/aws-swf.html)
* [AWS Translate](/camel-quarkus/latest/reference/extensions/aws-translate.html)
* [Azure (old SDK)](/camel-quarkus/latest/reference/extensions/azure.html) (there is a new set of Azure SDK v12 extensions which are not deprecated)
* [Javax Websocket (JSR 356)](/camel-quarkus/latest/reference/extensions/websocket-jsr356.html)

## More test coverage for AWS 2 components

So far, our AWS SDK v2 extensions were not tested properly. We started adding
[tests](https://github.com/apache/camel-quarkus/tree/master/integration-tests-aws2) that check their behavior
against the real AWS services. Some of the tests can also run against a
[Localstack](https://github.com/localstack/localstack) mock container.

## Full Changelog of Camel Quarkus 1.7.0

* [Fixed issues](https://github.com/apache/camel-quarkus/milestone/11?closed=1)
* [All commits](https://github.com/apache/camel-quarkus/compare/1.6.0...1.7.0)

## Known issues

* [Upgrading to Jackson 2.12.1 via Quarkus BOM 1.12 breaks Azure SDK v12 extensions](https://github.com/apache/camel-quarkus/issues/2207) - possible workarounds: force Jackson 2.11.3 in your application or stay on Camel Quarkus 1.6.0
* [Camel Quarkus OptaPlanner does not work as of Quarkus 1.12 in apps generated by code.quarkus.io](https://github.com/apache/camel-quarkus/issues/2253) - this is caused by a conflicting OptaPlanner version in Quarkus Universe BoM. Workaround:
use plain Camel Quarkus BoM instead of Quarkus Universe BoM.

## What's next?

Camel Quarkus 1.8.0 should appear within a couple of weeks, shortly after Quarkus 1.13.

There is still a lot of [Camel components to port](https://github.com/apache/camel-quarkus/issues?q=is%3Aissue+is%3Aopen+label%3Aextension) to Quarkus.
Please upvote your favorites, or even better [contribute](/camel-quarkus/latest/contributor-guide/index.html)!
