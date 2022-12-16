---
title: "Roadmap to Camel v4"
date: 2022-12-21
draft: false
authors: [davsclaus, oscerd, essobedo]
categories: ["Roadmap"]
preview: "Roadmap to Apache Camel v4 and impact on Camel v3"
---

Apache Camel v4 is on the way for 1st half in 2023.

The need for Camel v4 is mainly driven by Java open source projects migrating from `javax` to `jakarta` APIs
and to keep up with popular runtimes such as Spring Boot and Quarkus.

## Primary Goals 
1. Migrate from `javax` -> `jakarta` (JEE 10)
2. Java 17 as minimum
3. Spring Framework 6
4. Spring Boot 3
5. Quarkus 3

## Release Goals
6. Release only what is ready (JEE10 / Java17)
   This means that Camel components that are not ready (yet) will be dropped in a release until they are ready.
7. Release Camel Core + Camel Spring Boot together
8. Move Camel Karaf to Apache Karaf as karaf-camel sub-project 

## Major Goals
9. Support Java 17 features such as records, multiline strings, etc.
10. EIP model without JAXB dependency (if possible)
11. Endpoint URI parsing (do not use `java.net.URI`)
12. Deprecate `message.getIn()` use `getMessage()` instead
13. Deprecate/Remove camel-cdi
14. Deprecate/Remove MDC logging (complex and buggy and does not fit modern app development)

## Minor Goals
15. Remove MEP `InOptionalOut` (not in use)
16. Remove JUnit 4 support

## Dropping Java 11 support 

Some users have asked whether Camel v4 can support Java 11. Because Spring Framework 6 is
requiring Java 17, then this is _tricky_ as a number of Camel components rely on Spring.

Java 21 LTS is to be released in September 2023, meaning that Camel v4
should be forward-facing and prepare to support Java 21 instead of 11. 

Users that must use Java 11, can use Camel v3 and then later
upgrade to Camel v4 when they are ready to upgrade Java as well.

## Timeline

The milestones are _estimates_ and the number of versions may vary according to the needs and the state of progress of the process. In other words, Camel v4 could be released earlier than expected.

- Feb 2023: Camel 4.0 milestone 1
- Mar 2023: Camel 4.0 milestone 2
- Apr 2023: Camel 4.0 RC1
- May 2023: Camel 4.0 LTS (until 4.1 release)
- Aug 2023: Camel 4.1 LTS (until Jun 2024)
- Oct 2023: Camel 4.2
- Dec 2023: Camel 4.3 LTS (until Dec 2024)

For Camel 3, only LTS versions are released twice a year.
This means the Camel v3 schedule is as follows:

- Dec 2022: Camel 3.20 LTS (until Dec 2023)
- Jun 2023: Camel 3.21 LTS (until Jun 2024)
- Dec 2023: Camel 3.22 LTS (until Dec 2024. Last v3 release supporting Java 11.)
 
Each Camel 3 LTS release will contain fewer new features and improvements than before, 
because our focus and work shifted to Camel v4.

The Camel v4 work has already started, and there are some intermediate branches
with the jakarta migration such as: https://github.com/apache/camel/tree/jakarta/rewritten

