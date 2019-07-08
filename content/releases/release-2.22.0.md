---
date: 2018-06-29
draft: false 
type: release-note
version: 2.22.0
preview: "Major release for 2.22.x"
apiBreaking: ""
knownIssues: ""
jiraVersionId: 12342707
---

Welcome to the 2.22.0 release which resolved 216 issues including new features, improvements and bug fixes.

This release supports only Spring Boot 2. Spring Boot v1 is no longer supported.

* Camel has upgraded from Spring Boot v1 to v2 and therefore v1 is no longer supported. 
* Upgraded to Spring Framework 5. Camel should work with Spring 4.3.x as well, but going forward Spring 5.x will be the minimum Spring version in future releases. 
* Upgraded to Karaf 4.2. You may run Camel on Karaf 4.1 but we only officially support Karaf 4.2 in this release.
* Optimised using toD DSL to reuse endpoints and producers for components where its possible. For example HTTP based components will now reuse producer (http clients) with dynamic uris sending to the same host. See more details in the toD documentation.
* The File2 consumer with read-lock idempotent/idempotent-changed can now be configured to delay the release tasks to expand the window when a file is regarded as in-process, which is usable in active/active cluster settings with a shared idempotent repository to ensure other nodes dont too quickly see a processed file as a file they can process (only needed if you have readLockRemoveOnCommit=true).
* Allow to plugin a custom request/reply correlation id manager implementation on Netty4 producer in request/reply mode.
The Twitter component now uses extended mode by default to support tweets > 140 characters
* Rest DSL producer now supports being configured in rest configuration via endpointProperties.
* The Kafka component now supports HeaderFilterStrategy to plugin custom implementations for controlling header mappings between Camel and Kafka messages.
* Rest DSL now supports client request validation to validate that Content-Type/Accept headers is possible for the rest service.
* Camel has now a Service Registry SPI which allow to register routes to a service registry such as consul, etcd, zookeeper using a Camel implementation or Spring Cloud
* The SEDA component now has a default queue size of 1000 instead of unlimited. 
And these important fixes:

* Fixed a CXF continuation timeout issue with camel-cxf consumer could cause the consumer to return a response with data instead of triggering a timeout to the calling SOAP client.
* Fixed camel-cxf consumer doesn't release UoW when using robust oneway operation
* Fixed using AdviceWith and using weave methods on onException etc. not working. 
* Fixed Splitter in parallel processing and streaming mode may block, while iterating message body when the iterator throws exception in first invoked next() method call.
* Fixed Kafka consumer to not auto commit if autoCommitEnable=false.
* Fixed file consumer was using markerFile as read-lock by default, which should have been none. 
* Fixed using manual commit with Kafka to provide the current record offset and not the previous (and -1 for first)
* Fixed Content Based Router in Java DSL may not resolve property placeholders in when predicates
