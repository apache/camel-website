---
title: "Security"
---

# Apache Camel security information

## Security model and report scope

Before reporting, please read the **[Apache Camel Security Model](/manual/security-model.html)**.

It is the canonical reference the Apache Camel PMC uses when triaging security reports. It
documents who is trusted, where the trust boundaries sit, which vulnerability classes are
accepted as framework vulnerabilities, and which categories are out of scope — route-author or
operator responsibility, explicit opt-ins, denial of service through unthrottled routes,
third-party transitive CVEs not reachable through Camel code, management surfaces placed on an
untrusted network, and automated-scanner output with no proof of concept. Reports that fall
outside the documented scope are closed with a reference to that page.

The Camel subprojects — Camel Quarkus, Camel Spring Boot, Camel Karaf, Camel Kamelets, Camel
Kafka Connector and Camel K — inherit the same trust model; report scope for them is governed
by the same document unless a subproject publishes its own security model.

## Reporting new security problems with Apache Camel

The Apache Software Foundation takes a very active stance in eliminating security problems.

We strongly encourage folks to report such problems to the private security mailing list of the ASF Security Team, before disclosing them in a public forum.

Please see the [page of the ASF Security Team](https://www.apache.org/security/) for further information and contact information.

## Security advisories

