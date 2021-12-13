---
title: "Apache Camel and CVE-2021-44228 (log4j)"
date: 2021-12-13
draft: false
authors: [davsclaus]
categories: ["security"]
preview: "Apache Camel and CVE-2021-44228 (log4j)"
---

### Apache Camel is NOT using log4j for production

Apache Camel does not directly depend on Log4j 2, 
so we are not affected by CVE-2021-44228. 

If you explicitly added the Log4j 2 dependency to your own applications,
make sure to upgrade.

### Apache Camel is using log4j for testing itself

Apache Camel does use log4j during testing itself, and therefore you
can find that we have been using log4j v2.13.3 release in our latest LTS releases
Camel 3.7.6, 3.11.4. 

In the `camel-dependencies` BOM we extract all the 3rd party dependency
version that was used for building and testing the release:

    <log4j2-version>2.13.3</log4j2-version>

In the upcoming LTS releases 3.14.0, 3.11.5, and 3.7.7 we have upgraded to
log4j 2.15.0. For future releases then we plan to filter out testing
dependencies in the `camel-dependencies` BOM, meaning that `log4j2-version`
will no longer be included.

### 3rd party components with transitive dependency on log4j-core

There are two Camel components, camel-nsq and camel-corda which have a 
dependency on log4j-core by their 3rd party library. Those libraries
do not actively use log4j-core, but rely only on log4j-api. Therefore the maintainers
of those projects should correct this in their projects.

At Apache Camel we have corrected this by excluding log4j-core and only depend on log4-api
for these two components. This change will be in all upcoming LTS releases.

This should not be a security issue as you are only vulnerable if log4j-core
is active in use as the logging framework. Having log4j-core on the classpath
and using another logging framework such as logback or jboss-logging is not a problem.

### What about other Apache Camel projects?

Apache Camel Quarkus and Camel K uses Quarkus as the runtime, and Quarkus does not use log4j, and 
they are therefore not affected, [according to the Quarkus team](https://twitter.com/QuarkusIO/status/1469279468829265922).

Camel Spring Boot uses Spring Boot as the runtime, and Spring Boot is only
affected if you have chosen to use log4j instead of the default logback logger.
See more details from the [Spring Boot team announcement](https://spring.io/blog/2021/12/10/log4j2-vulnerability-and-spring-boot).

Apache Kafka Connectors runs on Apache Kafka and Kafka uses the older log4 v1 which is not affected.
 
### What about Apache Camel 2?

Apache Camel 2 is not affected. The camel-core from Camel 2 uses slf4j-api
as the logging facade, and log4j is only used during testing Camel itself.

