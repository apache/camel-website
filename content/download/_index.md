---
title: "Downloads"
---

We do frequent releases, a release almost every month, and even though we strive to maintain backward compatibility, we may on occasion introduce a breaking change in the interest of the long-term evolution of the project. We document backward compatibility breaking changes in the [Migration and Upgrade](/manual/migration-and-upgrade.html) section of the user manual.

Unless you need the latest features, you might consider using a Long Term Support (LTS) version that will receive bug and security fixes for a longer time - up to one year.

A good strategy to prepare for future LTS releases might be to test the latest releases. You can do this on less impactful projects or by running tests of your codebase against newer releases. Please do [report any issues](/community/contributing/) with functionality or backward compatibility so they can be addressed in time for the LTS version.

For information on the release planning look at the blog posts in the [Roadmap](/categories/Roadmap/) category.

Here you will only find the supported releases, older unsupported releases can be found in the [Releases archive](/releases/).

**Note:** Apache Camel Spring Boot is released together with Apache Camel (core) and uses the same version number.

{{< downloads >}}

## SBOMs

Every release since 4.0.3 includes PGP-signed CycloneDX SBOMs (JSON and XML) listed alongside the source
download above. These machine-readable inventories list every dependency in the release and can be fed into
tools like [OWASP Dependency-Track](https://dependencytrack.org/) for automated vulnerability scanning.
To generate an SBOM for your own Camel application, see the [Generating SBOMs](/manual/sbom.html) guide.

## Keys

You can verify your download by following these [procedures](http://www.apache.org/info/verification.html) and using these [KEYS](https://www.apache.org/dist/camel/KEYS).
