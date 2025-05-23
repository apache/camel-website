---
date: 2018-03-11
eol: 2019-02-28
draft: false 
type: release-note
version: 2.21.0
title: "Release 2.21.0"
preview: "Major release for 2.21.x"
apiBreaking: "All the AwsEndpoint uri options have been removed: since we are now using AWS client builders, the way we were using the endpoint cannot be used anymore, since clients are immutable now. If you still need to set an AWS endpoint on your client, you can create your client instance and put it in the Camel registry."
knownIssues: ""
jiraVersionId: 12341576
category: camel
kind: legacy
jdk: [8]
---

Welcome to the 2.21.0 release which resolved 400 issues including new
features, improvements and bug fixes.

This release supports only Spring Boot 1.5.x. Support for Spring Boot
2.0.x is coming in Camel version 2.22 which is planned for early summer
2018.


* Upgraded to JAXB 2.3.0 which is more JDK9 compliant.
* Added better support for `javax.jms.StreamMessage` types
in JMS component.
* Optimised JMS to support ActiveMQ Artemis
http://activemq.apache.org/artemis/docs/latest/large-messages.html[large
messages] so you can send and receive big messages such as GB's in size.
There is an example demonstrating this in
camel-example-artemis-large-messages.
* Added support for route coverage reports which allows 3rd party
tooling via SPI to visualise route coverage to Camel developers.
* Added route-coverage goal to the
https://github.com/apache/camel/blob/master/tooling/maven/camel-maven-plugin/src/main/docs/camel-maven-plugin.adoc[Camel
Maven Plugin] so you can report route coverage from Maven command line.
* Added support for doing manual commits via Java code when using
Kafka consumer.
* Vendor extensions in the swagger generated API docs is now disabled
turned off, when using REST DSL (not all 3rd
party API gateways/tooling support vendor extensions). You can turn this
back-on via the apiVendorExtension option.
* The SFTP consumer now also supports the `useList` option which can be
used to download a single known file without use LIST operation on the
FTP server (which can be slow if the FTP server has many files in the
LIST results)
* Camel JSON with camel-jackson will now automatic use
shared ObjectMapper instance if there is only one instance in
the Registry. For example users with Spring Boot
then allows Camel to easily use the default mapper from Spring Boot.
* Added `ExtendedStartupListener` that allows a callback just after the
CamelContext has been fully started.
* You can now specify examples in the REST DSL that
are included in the generated Swagger api-doc via camel-swagger-java.
* Improved file/ftp consumer to use current thread to poll, instead of a
scheduled background task, when using pollEnrich (content enricher).
* Direct component now blocks by default if sending to
a consumer which is not yet ready, which may happen during startup
(little window of opportunity). This
avoids `DirectConsumerNotAvailableException` being thrown during startup
etc.
* The FTP component can now log progress (turn
on transferLoggingLevel) when perfomring download/upload and other
operations. You can also find this information for the consumer in JMX. 
* Added support for resuming downloads to FTP component.
For example if you download big files and has connection problems with
the FTP server. Then later when the connectivity works again, Camel can
resume download the in-progress file.
* The Jetty and Servlet consumers
will now return HTTP Status 405 (method not allowed) for requests that
would have been processed by another HTTP request method, for example
calling REST services with the wrong method. Beforehand a 404 error code
was always regardless.
* Reworked the `FileIdempotentRepository` so the internal in-memory
cache is only used for quick lookup of the most frequent file names, and
lookup from disk as well. See more details in the class javadoc of the
file.
* The SQL Stored Procedure component now
supports INOUT parameters.
* Added restart action to link:controlbus-component.html[ControlBus
Component] so you can easier restart a route.
* camel-spring-boot actuator endpoints for routes is now in read-only
mode by default. 
* Added option to Aggregate EIP so make it easier
to complete all previous groups on new incoming correlation key, and as
well to force completion from Java code logic in
the `AggregationStrategy` implementation. 
* Using AdviceWith for unit testing now logs the
routes before vs after in XML format so its easier to spot the change
route models.
* Added support for using SpEL in non-spring runtimes
(however there may be functionality that SpEL may only be able to
perform if using a Spring runtime).
* Made it easier to configure timeout options on HTTP4
component.
* Improvements to RabbitMQ component so for example
its easier to route between RabbitMQ exchagnes without having to remove
headers or turn on bridgeEndpoint option. Also reduced the logging noise
that occurred at INFO level.
* You can now configure many of the RabbitMQ options
on the component level instead of having to repeat them on each
endpoint.
* The Bean component language can now refer to method name via the
double colon syntax, eg `.to("bean:myBean::myMethod")`

The following issues has been fixed

* Fixed afterApplicationStart callback on camel-spring-boot to be called
later and after CamelContext has been fully started.
* Fixed an issue testing with @UseAdviceWith and Camel on Spring Boot.
* Fixed OnCompletion would not be triggered from
a route using Split EIP and an exception was thrown
during splitting.
* Fixed Kafka consumer stops consuming messages when
exception occurs during offset commit.
* Fixed Netty4 consumer to stop taking in new requests
while being shutdown, as otherwise it cannot graceful shutdown if new
requests come in faster than it can process existing in-flight messages.
* Fixed an issue with Routing Slip
and Dynamic Router when using context scoped
error handler, could cause the error handler to become stopped.
* Fixed Rest DSL with Jetty
security via custom define security handler and turned on api-doc as
well would not startup Jetty server due missing NoLoginService error.
* Fixed Blueprint error: "name is already instanciated as null and
cannot be removed"

* Fixed a CXF continuation timeout issue with camel-cxf consumer could cause the consumer to return a response with data instead of triggering a timeout to the calling SOAP client.
* Fixed camel-cxf consumer doesn't release UoW when using robust oneway operation
* Fixed using AdviceWith and using weave methods on onException etc. not working. 
* Fixed Splitter in parallel processing and streaming mode may block, while iterating message body when the iterator throws exception in first invoked next() method call.
* Fixed Kafka consumer to not auto commit if autoCommitEnable=false.
* Fixed file consumer was using markerFile as read-lock by default, which should have been none. 
* Fixed using manual commit with Kafka to provide the current record offset and not the previous (and -1 for first)
* Fixed Content Based Router in Java DSL may not resolve property placeholders in when predicates

Important changes to consider when upgrading

* Jetty has been upgraded to 9.4 by default, and camel-jetty is requring
version 9.3 or 9.4 to run in OSGi.
* Direct component now blocks by default if sending to
a consumer which is not yet ready, which may happen during startup
(little window of opportunity). This
avoids `DirectConsumerNotAvailableException` being thrown during startup
etc. The old beavhaior can be turned on by setting `block=false` on the
direct component level, or on endpoints where needed.
* When using `camel-saxon` then the SaxonXpathFactory class is created
in the
https://www.saxonica.com/html/documentation/xpath-api/jaxp-xpath/factory.html[recommended
way] from Saxon. It will fallback and create the factory the old way if
not possible.
* The `camel-json-validator` component has switched from using Everit to
NetworkNT JSon Schema validator library, as the former had ASF license
implications and would not be allowed in future Camel releases. The
NetworkNT supports v4 draft of JSon Schema as validation so make sure to
use that draft version in your schemas.
* Reworked the `FileIdempotentRepository` so the internal in-memory
cache is only used for quick lookup of the most frequent file names, and
lookup from disk as well. See more details in the class javadoc of the
file.
* The Karaf commands for routes is changed so the
arguments for the camel context is first, and the route id is the 2nd
argument. This allows the route completer to use the selected camel
context name to only show route ids from that camel context, as
otherwise it shows all the routes for every Camel application running in
Karaf.
* camel-spring-boot actuator endpoints for routes is now in read-only
mode by default. This means operations to start,stop,suspend,resume
routes is forbidden. You can turn off read-only mode by setting the
spring boot configuration `endpoints.camelroutes.read-only = false`


