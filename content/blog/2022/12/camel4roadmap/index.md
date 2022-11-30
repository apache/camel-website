---
title: "Roadmap to Camel v4"
date: 2022-12-09
draft: false
authors: [davsclaus]
categories: ["Roadmap"]
preview: "Roadmap to Apache Camel v4 and impact on Camel v3"
---

Apache Camel v4 is on the way for 1st half in 2023.
The overall scope is that the leap from Camel 3 to 4 is a lot less than going from Camel 2 to 3.

The need for Camel v4 is mainly driven by Java open source projects migrating to jakarta APIs,
and to keep up with popular runtimes such as Spring Boot and Quarkus, 
and jump to Java 17 as minimum baseline.

## Primary Goals 
1. Migrate from javax -> jakarta (JEE 10)
2. ava 17 as base line
3. Spring Framework 4
4. Spring Boot 3
5. Quarkus 3

## Release Goals
6. Release only what is ready (JEE10 / Java17 etc)
   This means that Camel components that are not ready (yet) will be dropped in a release until they are ready.
7. Release core + Spring Boot together
8. Move camel-karaf to Apache Karaf as karaf-camel sub-project 

## Major Goals
9. Support Java 17 features such as records, multiline strings, and what else
10. EIP model without JAXB dependency (is possible)
11. Endpoint URI parsing (do not use java.net.URI)
12. Deprecate `message.getIn()` use `getMessage()` instead
13. Deprecate/Remove camel-cdi
14. Deprecate/Remove MDC logging (complex and buggy and does not fit modern app development)

## Minor Goals
15. Remove MEP InOptionalOut (not in use)
16. Remove JUnit 4 support

## Timeline

The timelines are _estminatees_ and the number of releases can vary depending on need and how far we are in the process

- Feb 2023: Camel 4.0 milestone 1
- Mar 2023: Camel 4.0 milestone 2
- Apr 2023: Camel 4.0 RC1
- May 2023: Camel 4.0
- Aug 2023: Camel 4.1 LTS
- Oct 2023: Camel 4.2
- Dec 2023: Camel 4.3 LTS

The plan is to start working on Camel 4 after the next Camel 3 LTS release, e.g. 3.20 which is planned for next month (December 2022).

For Camel 3 then we slow down in releases and provide 2 LTS releases per year.
For example a scheduled could look as follows:

- Dec 2022: Camel 3.20 LTS
- Jun 2023: Camel 3.21 LTS (likely last Camel v3 release, supported until Jun 2024)
- Dec 2023: Camel 3.22 LTS (maybe last Camel v3 release, supported until Dec 2024) (only if high demand in community and committers have time to support this)

Each Camel 3 LTS release will likely also contain less new features and improvements as previously, as our focus and work shifts to Camel v4 instead.
