---
title: "Camel Quarkus 1.0.0-CR3 Released"
date: 2020-07-07
authors: ["jamesnetherton"]
categories: ["Releases", "Camel Quarkus"]
preview: What's new in Camel Quarkus 1.0.0-CR3
---

We are pleased to announce the release 1.0.0-CR3 of Camel Quarkus. Camel Quarkus brings the outstanding integration
capabilities of Apache Camel to [Quarkus](https://quarkus.io/) - the toolkit for writing subatomically small and
supersonically fast Java, Kotlin and Scala applications.

Here are some highlights of Camel Quarkus 1.0.0-CR3.

## New extensions

The following new extensions were added:

* [AWS 2 Athena](/camel-quarkus/next/reference/extensions/aws2-athena.html)
* [Component DSL](https://github.com/apache/camel-quarkus/blob/1.0.0-CR3/docs/modules/ROOT/pages/extensions/componentdsl.adoc)
* [JOLT](/camel-quarkus/next/reference/extensions/jolt.html)
* [JTA](/camel-quarkus/next/reference/extensions/jta.html)
* [OpenApi Java](/camel-quarkus/next/reference/extensions/openapi-java.html)
* Tika
* [Vert.x](/camel-quarkus/next/reference/extensions/vertx.html)


The following extensions added native mode support:

* [AWS 2 DynamoDB Streams](/camel-quarkus/next/reference/extensions/aws2-ddb.html)
* [AWS 2 Elastic Compute Cloud (EC2)](/camel-quarkus/next/reference/extensions/aws2-ec2.html)
* [AWS 2 Elastic Container Service (ECS)](/camel-quarkus/next/reference/extensions/aws2-ecs.html)
* [AWS 2 Elastic Kubernetes Service (EKS)](/camel-quarkus/next/reference/extensions/aws2-eks.html)
* [AWS 2 Identity and Access Management (IAM)](/camel-quarkus/next/reference/extensions/aws2-iam.html)
* [AWS 2 Key Management Service (KMS)](/camel-quarkus/next/reference/extensions/aws2-kms.html)
* [AWS 2 Managed Streaming for Apache Kafka (MSK)](/camel-quarkus/next/reference/extensions/aws2-msk.html)
* [AWS 2 MQ](/camel-quarkus/next/reference/extensions/aws2-mq.html)
* [AWS 2 Simple Email Service (SES)](/camel-quarkus/next/reference/extensions/aws2-ses.html)
* [AWS 2 Translate](/camel-quarkus/next/reference/extensions/aws2-translate.html)

All supported extensions can be seen in the [List of Camel Quarkus extensions](/camel-quarkus/next/reference/).

## Camel 3.4.0

Camel was upgraded to [3.4.0](/blog/2020/06/camel34-whatsnew/). For Quarkus this brings some performance improvements, 
with JAXB dependencies having been removed from the OpenAPI components. There's also some enhancements to the health check APIs and a new 
[health example](https://github.com/apache/camel-quarkus/tree/master/examples/health) was added to demonstrate this.

## Quarkus 1.6.0.Final

Quarkus was upgraded to 1.6.0.Final.


Enjoy! Feel free to give feedback via the [mailing lists](/community/mailing-list/)
or [GitHub issues](https://github.com/apache/camel-quarkus/issues).
