---
title: "SBOMs Are Becoming a Requirement — Apache Camel Already Ships and Supports Them"
date: 2026-06-22
draft: false
authors: [davsclaus]
categories: ["Security"]
keywords: ["apache camel", "sbom", "software bill of materials", "supply chain security", "cyclonedx", "spdx", "cra", "cyber resilience act", "vulnerability scanning", "dependency track"]
preview: "With the EU Cyber Resilience Act and US Executive Order 14028 making SBOMs a hard requirement, Apache Camel already has you covered: signed CycloneDX SBOMs ship with every release, and the Camel CLI can generate one for your own application in a single command."
---

If your security or compliance team has started asking "does it ship with an SBOM?", you are not alone.
The EU Cyber Resilience Act (CRA) will require SBOM delivery for software sold in the EU, US Executive
Order 14028 and NIST guidance make SBOMs a federal procurement expectation, and enterprise evaluation
checklists increasingly treat SBOM availability as a gate.

Apache Camel has shipped SBOMs with every release since 4.0.3 — long before these regulations finalized.
Here is what that means for you in practice.

## What is an SBOM?

A Software Bill of Materials is a machine-readable inventory of every component in a piece of software:
direct dependencies, transitive dependencies, their versions, and their licenses. Think of it as a
nutrition label for your software supply chain.

Two formats dominate: [CycloneDX](https://cyclonedx.org/) (OWASP) and [SPDX](https://spdx.dev/) (Linux
Foundation). Camel supports both.

The value is straightforward: feed an SBOM into a vulnerability scanner, and you get an instant,
continuously updatable view of every known CVE in your dependency tree — no manual audit required.

## What Camel ships

Since release 4.0.3 (November 2023), every Apache Camel release includes PGP-signed CycloneDX SBOMs in
both JSON and XML formats. You will find them on the [download page](/download/) right next to the source
archive and its checksums.

These SBOMs cover the entire Camel distribution: all modules, all dependencies, all transitive
dependencies. Combined with Camel's track record of
[2,449 dependency updates across 20 releases](/blog/2026/06/camel-dependency-updates/), you get a
framework where the supply chain is not just documented — it is actively maintained.

## Generating SBOMs for your own applications

The framework SBOM tells you what is *in* Camel. But compliance teams typically also need an SBOM for
*your* application — the thing you actually deploy. Camel gives you three ways to do this, depending on
your runtime.

### Camel CLI

The fastest path. If you are using the Camel CLI, a single command does it:

```bash
camel sbom
```

This produces a `sbom.json` in CycloneDX format. Switch to SPDX with `--sbom-format=spdx`, or target a
specific runtime:

```bash
camel sbom --runtime=spring-boot
camel sbom --runtime=quarkus
```

See the [camel sbom command reference](/manual/camel-jbang-sbom.html) for the full set of options.

### Camel Spring Boot

Spring Boot 3.3+ has
[built-in SBOM support](https://spring.io/blog/2024/05/24/sbom-support-in-spring-boot-3-3/): it
generates a CycloneDX SBOM during the build, packages it inside the uber jar at
`META-INF/sbom/application.cdx.json`, and can expose it via an actuator endpoint. Since Camel Spring
Boot runs on top of Spring Boot, this automatically covers Camel and all its transitive dependencies —
no extra plugin or Camel-specific configuration needed.

### Camel Quarkus

Quarkus has its own dependency resolver that differs from standard Maven resolution, which means the
generic CycloneDX Maven plugin will not capture the full dependency graph. Instead, use the native
[Quarkus CycloneDX extension](https://quarkus.io/guides/cyclonedx). Add it to your project:

```xml
<dependency>
    <groupId>io.quarkus</groupId>
    <artifactId>quarkus-cyclonedx</artifactId>
</dependency>
```

This generates a distribution SBOM automatically every time you build. You can also generate a
dependency SBOM before building with `mvn quarkus:dependency-sbom`.

For the full guide, see [Generating SBOMs](/manual/sbom.html) in the user manual.

## Combining SBOMs with vulnerability scanning

An SBOM by itself is an inventory. The real value comes when you feed it into a scanner that matches
components against known CVEs. Here are three tools that ingest CycloneDX SBOMs directly:

**[OWASP Dependency-Track](https://dependencytrack.org/)** — a full platform for continuous SBOM
analysis. Upload your SBOM, and it monitors for new CVEs against your dependency tree automatically.
Supports policy-based alerting and integrates with CI/CD pipelines.

**[Grype](https://github.com/anchore/grype)** — a command-line vulnerability scanner. Point it at your
SBOM file:

```bash
grype sbom:./sbom.json
```

**[Trivy](https://github.com/aquasecurity/trivy)** — another CLI scanner, widely used in container
security. It can scan CycloneDX SBOMs directly:

```bash
trivy sbom ./sbom.json
```

Any of these will give you an immediate, actionable list of known vulnerabilities in your dependency
tree — turning the SBOM from a compliance checkbox into a practical security tool.

## The bigger picture

SBOMs are one piece of Camel's supply chain security story. The full picture includes:

- **[500+ dependencies kept current](/blog/2026/06/camel-dependency-updates/)** — 2,449 version updates
  across 20 releases, so you are not stuck on a vulnerable library waiting for an upstream bump
- **[Security advisories](/security/)** — every vulnerability handled through the ASF's coordinated
  disclosure process with full PGP-signed advisories going back to 2013
- **[Security model](/manual/security-model.html)** — a canonical reference documenting where trust
  boundaries sit and what is in or out of scope
- **[A 99.8% bug fix rate](/blog/2026/06/camel-bug-fix-track-record/)** with a median fix time of one
  day

When someone asks whether Camel is ready for regulated environments, the answer is in the public
record — including, now, every dependency in every release. See the [Trust](/trust/) page for the
complete picture.
