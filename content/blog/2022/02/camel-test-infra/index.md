---
title: "Good bye camel-testcontainers! Hello Camel's test-infra"
date: 2022-02-16
draft: false
authors: [orpiske]
categories: ["Features", "Camel"]
preview: "Good bye camel-testcontainers! Hello Camel's test-infra"
---

For Camel 3.16.0 we are removing the deprecated container-based test modules and
replacing them with a new set of modules called Camel [test-infra](/manual/test-infra.html).

They continue to support container-based tests via TestContainers, however they abstract the underlying test infrastructure.

One of the great benefits for our project is that they allow us to more easily switch from container-based tests, to external instances. Previously, we would need to create a new test or implement a more complex design if we wanted to test both a container instance and an external service instance (i.e.: one for a JMS broker container and another test for a remote JMS instance, one for a LocalStack container and another for the Amazon Web Services, etc). This new design helps us to reduce the maintenance effort for Camel, while also extending our ability to test for edge scenarios.

To achieve this we removed the necessity of extending classes such as `ContainerAwareTestSupport`, `CamelSpringTestSupport` and other similar classes in order to implement a container-based test. Instead, the new component leverages JUnit 5 extension mechanism, such as by using the `@RegisterExtension` annotation, to inject abstract services into a test.

For example, to inject an abstract Kafka service into a test class, this is all it takes with the Camel's `test-infra`:

```
@RegisterExtension
public static KafkaService service = KafkaServiceFactory.createService();
```

Naturally, the service instance comes with the appropriate methods to resolve URLs, ports, authentication parameters and more that may be necessary to run the test.

Futhermore, Camel's `test-infra` is in fact, a collection of modules. They include support for a broad range of services that can support both Camel's testing needs as well as Camel's users. For the upcoming Camel 3.16.0 release, these are the 38 supported modules:

* camel-test-infra-activemq
* camel-test-infra-arangodb
* camel-test-infra-artemis
* camel-test-infra-aws-v2
* camel-test-infra-azure-storage-blob
* camel-test-infra-azure-storage-datalake
* camel-test-infra-azure-storage-queue
* camel-test-infra-cassandra
* camel-test-infra-chatscript
* camel-test-infra-consul
* camel-test-infra-couchbase
* camel-test-infra-couchdb
* camel-test-infra-dispatch-router
* camel-test-infra-elasticsearch
* camel-test-infra-etcd
* camel-test-infra-fhir
* camel-test-infra-ftp
* camel-test-infra-google-pubsub
* camel-test-infra-hbase
* camel-test-infra-hdfs
* camel-test-infra-ignite
* camel-test-infra-infinispan
* camel-test-infra-jdbc
* camel-test-infra-kafka
* camel-test-infra-messaging-common
* camel-test-infra-minio
* camel-test-infra-mongodb
* camel-test-infra-mosquitto
* camel-test-infra-nats
* camel-test-infra-nsq
* camel-test-infra-openldap
* camel-test-infra-parent
* camel-test-infra-postgres
* camel-test-infra-pulsar
* camel-test-infra-rabbitmq
* camel-test-infra-redis
* camel-test-infra-solr
* camel-test-infra-xmpp
* camel-test-infra-zookeeper

From the perspective of Camel users and the overall community, these modules also bring many benefits.

For developers writing integrations using Camel, they are now able to use the same test service abstraction as our tests. This can reduce code duplications for our end users and help them benefit from test infrastructure components that are battle tested in Camel itself. Additionally, these components can be more easily extended to cover other scenarios. For instance, they can be used to implement a custom service that runs and manages the test infrastructure in a Kubernetes cluster.

There is also benefits for vendors creating products based on Apache Camel. Now they have the ability to test for edge scenarios more easily. They can switch from testing locally to testing against remote services with a few command-line parameters applied to their build or test automation.

To help users to migrate, we have written an extensive manual for the [test-infra](/manual/test-infra.html). If you find an issue with these modules, don't hesitate to [report an issue](https://issues.apache.org/jira) or provide a [contribution](https://github.com/apache/camel) to Apache Camel.