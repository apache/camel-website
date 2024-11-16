---
date: 2018-11-24
eol: 2019-09-30
draft: false 
type: release-note
version: 2.23.0
title: "Release 2.23.0"
preview: "Major release for 2.23.x"
apiBreaking: "The HttpBinding interface has new methods for setting fileNameExtWhiteList option. The copy, copyFrom methods on org.apache.camel.Message now also copy over reference to the exchange"
knownIssues: ""
jiraVersionId: 12343345
category: camel
kind: legacy
jdk: [8]
---

Welcome to the Apache Camel 2.23.0 release which is a new minor release and resolved 262 issues
including new features, improvements and bux fixes.

* Upgraded to Spring Boot 2.1.
* Additional component level options can now be configured via spring-boot auto-configuration and
these options is included in spring-boot component metadata json file descriptor for tooling
assistance.
* Added section with all the spring boot auto configuration options for all the components,
data-formats and languages to the documentation.
* All the Camel Spring Boot starter JARs now include
META-INF/spring-autoconfigure-metadata.properties file in their JARs to optimize Spring Boot
auto-configuration
* The Throttler now supports correlation groups based on dynamic expression so you can group
messages into different throttled sets.
* The Hystrix EIP now allows to inherit Camel's error handler so you retry the entire Hystrix EIP
block again if you have enabled error handling with redeliveries.
* SQL and ElSql consumers now support dynamic query parameters in route from. Notice it's limited
to be mostly about calling beans via simple expressions.
* The swagger-restdsl maven plugin now has supports for generating DTO model classes from the
swagger specification file.

The following noteworthy bugs has been fixed:

* The Aggregator2 has been fixed to not propagate control headers for forcing completion of all
groups, so it will not happen again if another aggregator EIP are in use later during routing.
* Fixed Tracer not working if redelivery was turned on the error handler
* The built-in type converter for XML Documents may output parsing errors to stdout, which has now
been fixed to output via the logging API.
* Fixed SFTP writing files via the charset option would not work if the message body was streaming
based.
* Fixed Zipkin root id to not be reused when routing over multiple routes to group them together
into a single parent span.
* Fixed optimised toD when using HTTP endpoints had a bug when hostname contains ip address with
digits.
* Fixed issue with RabbitMQ with request/reply over temporary queues and using manual acknowledge
mode, would not acknowledge the temporary queue (which is needed to make request/reply possible)
* Fixed various HTTP consumer components may not return all allowed HTTP verbs in Allow header for
OPTIONS requests (such as when using rest-dsl)
* Fixed thread-safety issue with FluentProducerTemplate
