---
title: "Security"
lead: "Apache Camel security information."
read_first:
  eyebrow: "Read first"
  title: "Security model and report scope"
  body: |
    Before reporting, please read the **[Apache Camel Security Model](/manual/security-model.html)**.

    It is the canonical reference the Apache Camel PMC uses when triaging security reports. It documents who is trusted, where the trust boundaries sit, which vulnerability classes are accepted as framework vulnerabilities, and which categories are out of scope — route-author or operator responsibility, explicit opt-ins, denial of service through unthrottled routes, third-party transitive CVEs not reachable through Camel code, management surfaces placed on an untrusted network, and automated-scanner output with no proof of concept. Reports that fall outside the documented scope are closed with a reference to that page.

    The Camel subprojects — Camel Quarkus, Camel Spring Boot, Camel Karaf, Camel Kamelets, Camel Kafka Connector and Camel K — inherit the same trust model; report scope for them is governed by the same document unless a subproject publishes its own security model.
sbom:
  title: "Software Bill of Materials (SBOM)"
  body: |
    Every Camel release since 4.0.3 ships with PGP-signed CycloneDX SBOMs that list all dependencies, enabling supply chain risk analysis alongside the CVE advisories below.
    See [Generating SBOMs](/manual/sbom.html) for details.
policy_enforcement:
  title: "Security Policy Enforcement"
  body: |
    Camel includes built-in Security Policy Enforcement that validates security-sensitive configuration during startup and can prevent insecure configurations from reaching production.

    See [Security Policy Enforcement](/manual/security-policy.html) for configuration details.
reporting:
  title: "Reporting new security problems with Apache Camel"
  body: |
    The Apache Software Foundation takes a very active stance in eliminating security problems.

    We strongly encourage folks to report such problems to the private security mailing list of the ASF Security Team, before disclosing them in a public forum.
  cta_label: "ASF Security Team"
  cta_url: "https://www.apache.org/security/"
---
