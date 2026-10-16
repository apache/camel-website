---
title: "Apache Camel security advisories: 38 CVEs fixed in 4.18.5, 4.22.1 and 4.23.0"
date: 2026-10-16
draft: false
authors: [oscerd]
categories: ["Security"]
keywords: ["apache camel", "security", "cve", "security advisory", "camel 4.23", "camel 4.22", "camel 4.18", "lts", "glasswing"]
preview: "We have published 38 security advisories for Apache Camel. All of them are fixed in Camel 4.18.5, 4.22.1 and 4.23.0, and we recommend upgrading."
---

On 15 October we published 38 [security advisories](/security/) for Apache Camel. All of them are fixed in
[4.22.1](/blog/2026/09/RELEASE-4.22.1/), [4.18.5](/blog/2026/10/RELEASE-4.18.5/) and
[4.23.0](/blog/2026/10/RELEASE-4.23.0/), and we recommend upgrading.

Thirteen of the advisories are rated HIGH and twenty-five MEDIUM. Twenty-eight come from findings made by Claude as part
of the Glasswing initiative at the Apache Software Foundation, and ten were reported by security researchers.

## Upgrading

| You are on | Upgrade to |
|---|---|
| 4.22.x (LTS) | 4.22.1 |
| 4.18.x (LTS) | 4.18.5 |
| Any other release | 4.23.0, or 4.22.1 or 4.18.5 to stay on an LTS line |

The 4.14.x LTS line reached end of life after 4.14.9 and does not receive these fixes. 35 of the 38 advisories affect
4.14.x, so if you are on 4.14.x or an earlier release, please move to a supported one.

Some of the fixes change default behaviour. Each advisory describes its change, and the
[4.23 upgrade guide](/manual/camel-4x-upgrade-guide-4_23.html) lists all of them.

## The advisories

| CVE | Component | Severity | Description |
|---|---|---|---|
| [CVE-2026-78162](/security/CVE-2026-78162.html) | camel-hazelcast | MEDIUM | Missing Java deserialization filter on two configuration paths, incomplete fix of CVE-2026-43865 |
| [CVE-2026-78163](/security/CVE-2026-78163.html) | camel-docling | MEDIUM | Server-side request forgery and local file disclosure through the message body |
| [CVE-2026-78164](/security/CVE-2026-78164.html) | camel-http, camel-netty-http, camel-undertow, camel-vertx-http | HIGH | Property placeholders resolved on the message-supplied `CamelHttpUri` and `CamelRestHttpUri` headers |
| [CVE-2026-78165](/security/CVE-2026-78165.html) | camel-spring-redis | HIGH | Unfiltered Java deserialization of Redis payloads |
| [CVE-2026-79983](/security/CVE-2026-79983.html) | camel-ftp | HIGH | Path traversal through file names in the server directory listing |
| [CVE-2026-79984](/security/CVE-2026-79984.html) | camel-mina-sftp | HIGH | Path traversal through file names in the server directory listing |
| [CVE-2026-79985](/security/CVE-2026-79985.html) | camel-smb | HIGH | Path traversal through file names in the share listing |
| [CVE-2026-79986](/security/CVE-2026-79986.html) | camel-azure-files | HIGH | Path traversal through file names in the share listing |
| [CVE-2026-80312](/security/CVE-2026-80312.html) | camel-oauth | HIGH | Authentication bypass: a failed authentication did not stop the route |
| [CVE-2026-80343](/security/CVE-2026-80343.html) | camel-netty-http | HIGH | Security constraint bypass through the case of the request path |
| [CVE-2026-80344](/security/CVE-2026-80344.html) | camel-as2 | HIGH | Server-side request forgery and credential disclosure through the asynchronous MDN address |
| [CVE-2026-83531](/security/CVE-2026-83531.html) | camel-dynamic-router | HIGH | Code execution through a predicate supplied in a control message |
| [CVE-2026-84176](/security/CVE-2026-84176.html) | camel-platform-http-vertx | MEDIUM | Cross-origin credential exposure |
| [CVE-2026-84178](/security/CVE-2026-84178.html) | camel-oauth | MEDIUM | Login cross-site request forgery |
| [CVE-2026-84180](/security/CVE-2026-84180.html) | camel-knative | MEDIUM | Information disclosure through route exceptions returned to the caller |
| [CVE-2026-84181](/security/CVE-2026-84181.html) | camel-shiro | MEDIUM | Authentication bypass when a subject was already bound to the thread |
| [CVE-2026-85243](/security/CVE-2026-85243.html) | camel-crypto-pgp | MEDIUM | Integrity verification downgrade |
| [CVE-2026-85245](/security/CVE-2026-85245.html) | camel-thrift | MEDIUM | Data from one exchange visible to the next |
| [CVE-2026-85246](/security/CVE-2026-85246.html) | camel-mina | MEDIUM | Information disclosure through route exceptions returned to the caller |
| [CVE-2026-85247](/security/CVE-2026-85247.html) | camel-knative | MEDIUM | Improper certificate validation when SSL is enabled without a truststore |
| [CVE-2026-85248](/security/CVE-2026-85248.html) | camel-pqc | MEDIUM | Signature verification bypass under concurrent use |
| [CVE-2026-85249](/security/CVE-2026-85249.html) | camel-tika | MEDIUM | Header injection through document metadata |
| [CVE-2026-85250](/security/CVE-2026-85250.html) | camel-xpath | HIGH | XML external entity processing with `documentType=InputSource` |
| [CVE-2026-85251](/security/CVE-2026-85251.html) | camel-http | HIGH | Credential disclosure on redirects with `followRedirects` |
| [CVE-2026-85254](/security/CVE-2026-85254.html) | camel-platform-http | MEDIUM | Request-header echo suppression bypass |
| [CVE-2026-85257](/security/CVE-2026-85257.html) | camel-cxf | MEDIUM | Information disclosure through route exceptions returned in SOAP faults |
| [CVE-2026-85260](/security/CVE-2026-85260.html) | camel-mllp | MEDIUM | Protected health information written to the log by default |
| [CVE-2026-85296](/security/CVE-2026-85296.html) | camel-as2 | MEDIUM | Receipts signed with another trading partner's key |
| [CVE-2026-85300](/security/CVE-2026-85300.html) | camel-pqc | MEDIUM | Generated private keys written with default file permissions |
| [CVE-2026-85301](/security/CVE-2026-85301.html) | camel-keycloak | MEDIUM | Issuer validation bypass when the `iss` claim is missing |
| [CVE-2026-85312](/security/CVE-2026-85312.html) | camel-core | MEDIUM | Saga hijacking through the `Long-Running-Action` header |
| [CVE-2026-85313](/security/CVE-2026-85313.html) | camel-jetty | MEDIUM | Cross-origin credential exposure with `enableCORS` |
| [CVE-2026-85314](/security/CVE-2026-85314.html) | camel-mail | MEDIUM | Header injection through the `MimeMultipart` data format, incomplete fix of CVE-2026-46584 |
| [CVE-2026-85315](/security/CVE-2026-85315.html) | camel-grpc | MEDIUM | Information disclosure through route exceptions returned in the gRPC status |
| [CVE-2026-85316](/security/CVE-2026-85316.html) | camel-platform-http | MEDIUM | Unintended proxy mode for paths starting with `proxy` |
| [CVE-2026-85317](/security/CVE-2026-85317.html) | camel-http | MEDIUM | OAuth2 token confusion in the shared token cache |
| [CVE-2026-88901](/security/CVE-2026-88901.html) | camel-smooks | HIGH | XML external entity processing of the message body |
| [CVE-2026-91858](/security/CVE-2026-91858.html) | camel-fop | MEDIUM | XML external entity processing with a third-party `TransformerFactory` |

Each advisory has the affected versions, the fixed versions and the mitigation.

## Credits

The 28 findings from the Glasswing initiative are credited in their advisories to the Claude Security Scan Tool. The
other ten were reported by:

- Dilrevx from NSSL, SJTU: CVE-2026-79983, CVE-2026-79984, CVE-2026-79985 and CVE-2026-79986
- Leon Zlobecki: CVE-2026-78162, CVE-2026-78165 and CVE-2026-83531
- cattier from TCBS: CVE-2026-78162
- Li Zhiyao (BUPT): CVE-2026-78163
- h1ei1: CVE-2026-88901
- 1428265354@qq.com: CVE-2026-78164

Thank you to all of them.

If you find a security issue in Apache Camel, please report it privately to
[security@apache.org](mailto:security@apache.org). The [ASF security policy](https://www.apache.org/security/)
describes how the process works.

## Learn more

- [Security advisories](/security/), every Apache Camel advisory, PGP-signed
- Release announcements for [4.22.1](/blog/2026/09/RELEASE-4.22.1/), [4.18.5](/blog/2026/10/RELEASE-4.18.5/) and
  [4.23.0](/blog/2026/10/RELEASE-4.23.0/)
- Upgrade guides for [4.23](/manual/camel-4x-upgrade-guide-4_23.html), [4.22](/manual/camel-4x-upgrade-guide-4_22.html)
  and [4.18](/manual/camel-4x-upgrade-guide-4_18.html)
- [Security model](/manual/security-model.html)
