---
title: "Built to Patch Fast: Apache Camel's Security Response in 2026"
date: 2026-07-29
draft: false
authors: [oscerd]
categories: ["Security"]
keywords: ["apache camel", "security", "cve", "security advisory", "camel 4.21", "backport", "lts", "vulnerability disclosure", "patch management", "response time"]
preview: "Camel 4.21.0 shipped with 32 security fixes, and both LTS lines were patched within four days. Here is how the release process makes that possible, why so many advisories landed at once, and what you need to upgrade to."
---

Camel [4.21.0](/blog/2026/07/RELEASE-4.21.0/) shipped on 1 July with 32 security fixes.
[4.18.3](/blog/2026/07/RELEASE-4.18.3/) followed on 3 July with 34, and
[4.14.8](/blog/2026/07/RELEASE-4.14.8/) on 4 July with 27. All three supported release lines were patched
inside four days, and every finding got a signed public [advisory](/security/).

A batch of 32 gets noticed, usually for the wrong reason. So I want to write about the process that
produced it rather than walk through the list. If you are running Camel in production, the number of
advisories in a release tells you very little. What tells you something is whether the fix reaches the
line you are actually on, and how long that takes.

## Nothing waited for a convenient release

The July batch is the biggest of the year but it is not unusual. Here is every 2026 release that carried
security fixes:

| Release | Date | Advisories fixed |
|---|---|---|
| 4.14.3 (LTS) | 1 Jan | 1 |
| 4.17.0 | 12 Jan | 1 |
| 4.14.5 (LTS) | 13 Feb | 1 |
| 4.18.0 (LTS) | 17 Feb | 2 |
| 4.18.1 (LTS) | 27 Mar | 3 |
| 4.19.0 | 16 Apr | 5 |
| 4.14.6 (LTS) | 18 Apr | 7 |
| 4.18.2 (LTS) | 22 Apr | 7 |
| 4.14.7 (LTS) | 24 Apr | 2 |
| 4.20.0 | 25 Apr | 7 |
| **4.21.0** | **1 Jul** | **32** |
| **4.18.3 (LTS)** | **3 Jul** | **34** |
| **4.14.8 (LTS)** | **4 Jul** | **27** |

The clustering is the part to look at. In April we cut five releases across three lines in nine days.
In July, three releases in four days. That is deliberate. A fix that only exists on `main` is not a fix
for anyone running an LTS in production, so we hold the releases together and ship them as a group.

The counts also run the opposite way to what people expect. 4.18.3 shipped 34 advisories, which is more
than 4.21.0's 32, and 4.14.8 shipped 27. The extra ones on the LTS lines are findings whose main-line fix
had already gone out in an earlier minor. Being on an LTS does not mean getting a reduced package.

## When the first fix turns out to be wrong

Shipping quickly is easy to claim. The harder case is what a project does when its own fix was not good
enough, because that is the moment where it is tempting to quietly widen the original patch and say
nothing about it.

That happened twice in this batch. Both times the follow-up went out in the next release on every line:

| First fix | Shipped in | Turned out to be incomplete | Follow-up shipped in |
|---|---|---|---|
| [CVE-2026-40048](/security/CVE-2026-40048.html) | 4.18.2, 4.20.0 (22 to 25 Apr) | [CVE-2026-46590](/security/CVE-2026-46590.html) | 4.18.3, 4.21.0 (1 to 3 Jul) |
| [CVE-2026-40860](/security/CVE-2026-40860.html) | 4.14.7, 4.18.2, 4.20.0 (22 to 25 Apr) | [CVE-2026-43866](/security/CVE-2026-43866.html) | 4.14.8, 4.18.3, 4.21.0 (1 to 4 Jul) |

Each follow-up got its own CVE and its own advisory saying, in those words, that the earlier remediation
was incomplete. The [camel-neo4j Cypher injection](/security/CVE-2026-46591.html) is a third case, a
follow-up to CVE-2025-66169 from last year.

We would rather publish a second CVE admitting the first fix missed something than extend it silently.
If we widen a patch without telling you, you have no way to know your assessment of the first advisory
was wrong.

There is a fourth case, and it is the uncomfortable one. An earlier hardening series of ours added a
default `ObjectInputFilter` across a dozen components. Good intention, bad pattern. We used
`java.**;javax.**;org.apache.camel.**;!*`, and that recursive glob admits `java.net.URL`, whose
`hashCode` does network I/O. Deserialize a `HashMap` with `URL` keys and the JVM issues DNS lookups to
whatever host the attacker chose. The class check passes, because the class is `HashMap` and `HashMap`
is on the allow list. That is [CVE-2026-42527](/security/CVE-2026-42527.html), a vulnerability we
introduced ourselves while trying to harden things, affecting twelve components. It went through the same
process as everything else: CVE, advisory, documented workaround, fixes on all three lines.

## Why 32 landed at once

The batch size comes from a decision about how to handle a report.

When a researcher tells us that one component copies untrusted inbound headers into the `Exchange`
without a `HeaderFilterStrategy`, we can patch that component and close the ticket, or we can read the
report as a description of a pattern and go look for every other place it could apply. We do the second
one. That is why advisories tend to arrive in families instead of one at a time, and it is most of the
explanation for 32.

Twenty-two of the 32 are the same broken boundary in twenty-two different components. Camel's routing
depends on a filter at each transport edge that keeps externally supplied headers from colliding with
Camel's own control headers. Nobody outside the process should be able to set `CamelHttpUri` by sending
a header called `CamelHttpUri`. Two things defeated that.

The first is consumers with no inbound filter at all. A client connecting to a `camel-vertx-websocket`
endpoint could set Camel control headers just by passing them as query parameters
([CVE-2026-46726](/security/CVE-2026-46726.html), HIGH). Bridge that consumer into an HTTP producer and
an injected `CamelHttpUri` sends the server-side request wherever the attacker wants. It gets worse: the
HTTP producer resolves Camel property placeholders on the resulting URI, so a placeholder in the injected
value, say an environment variable reference or a vault reference, gets resolved to its real value and
sent out. The same defect was in `camel-atmosphere-websocket`
([CVE-2026-55993](/security/CVE-2026-55993.html)) and `camel-iggy`
([CVE-2026-55994](/security/CVE-2026-55994.html)), both HIGH, and in the inbound mapping for
[NATS](/security/CVE-2026-46457.html), [CometD](/security/CVE-2026-46454.html),
[SQS](/security/CVE-2026-46456.html) and [Dapr](/security/CVE-2026-49086.html).

The second is control headers that never carried the `Camel` prefix. The default filter works on the
`Camel` namespace, so a component whose own control headers were called `operationName`, `sObjectQuery`,
`kafka.OVERRIDE_TOPIC`, `gridfs.*` or `IssueKey` went straight through it. An HTTP client earlier in the
route could set them and steer the component: send Kafka messages to a different topic
([CVE-2026-49098](/security/CVE-2026-49098.html)), inject SOQL and SOSL and redirect Apex REST calls with
the connected user's permissions ([CVE-2026-49099](/security/CVE-2026-49099.html)), switch a GridFS
operation to file deletion ([CVE-2026-48204](/security/CVE-2026-48204.html)), or run arbitrary JIRA
operations with the endpoint's credentials ([CVE-2026-48206](/security/CVE-2026-48206.html)).

One of them shows where this is going next.
[CVE-2026-49042](/security/CVE-2026-49042.html) is in `camel-langchain4j-tools`, where tool call
arguments were not checked against the tool's declared parameters, so the model on the other end of the
conversation could set arbitrary headers. Same root cause as the rest, new source of untrusted input.

The individual patches matter less than what came with them. 4.21.0 also
[renamed the header constants across 30+ components](/manual/camel-4x-upgrade-guide-4_21.html) to the
`Camel*` convention, so the filter now covers them by construction rather than by a list somebody has to
keep up to date. The deserialization side got the same treatment: the default filter denies
`java.net.**` and enforces JEP-290 graph shape limits, JMS `ObjectMessage` support is off by default,
the Java serialization type converters are gone from camel-core, and the Jackson data formats block
unsafe polymorphic base types.

That is also why the 4.21 upgrade guide is long, and why some of those changes will break routes. If a
route stops working because it was relying on unfiltered headers, that is the fix doing its job.

## Advisories with no exploit path

[CVE-2026-56140](/security/CVE-2026-56140.html) is rated LOW and has no exploit path at all. We added an
inbound Camel namespace filter to `camel-aws2-sns` to bring it in line with its siblings.
`camel-aws2-sns` is producer only, so there is no consumer and nothing to inject into.

We wrote an advisory for it anyway. If we harden a component quietly, there is no record of it, and no
way for you to check our judgement about whether it mattered. Sometimes we will get that judgement wrong,
which is the whole argument for writing it down.

The two worth reading first are the ones that did have an exploit path.
[CVE-2026-53913](/security/CVE-2026-53913.html) (HIGH) is a fail-open authentication bypass:
`KeycloakSecurityPolicy` only verified the bearer token inside its role and permission checks, so in the
default configuration, with no roles or permissions required, those checks never ran and any non-null
bearer value was accepted. Next to it,
[CVE-2026-46455](/security/CVE-2026-46455.html), where a missing `IS_ACTIVE` check meant expired tokens
were accepted.

## What to upgrade to

| You are on | Upgrade to | You get |
|---|---|---|
| 4.19.x or 4.20.x | **4.21.0** | all 32 |
| 4.18.x (LTS) | **4.18.3** | all 32, plus 2 earlier findings |
| 4.14.x (LTS) | **4.14.8** | 26 of the 32, plus 1 earlier finding |

Five of the six missing from 4.14.8 are in `camel-pqc`, `camel-keycloak` and `camel-iggy`, components
that did not exist in the 4.14.x line, so they are not a concern there. The real exception is
[CVE-2026-49042](/security/CVE-2026-49042.html) in `camel-langchain4j-tools`, which does affect 4.14.x
going back to 4.8.0. Its fix changes behaviour, because afterwards only tool arguments matching a
declared parameter become headers, and that breaks routes relying on implicit passthrough. We did not
backport it to the older LTS for that reason. If you run `camel-langchain4j-tools` on 4.14.x, use the
workaround from the advisory: declare explicit parameter schemas for every tool, and strip untrusted
headers after the endpoint with `removeHeaders("Camel*")` and `removeHeaders("camel*")`.

Read the [4.21 upgrade guide](/manual/camel-4x-upgrade-guide-4_21.html) before you upgrade. The header
renames and the changed deserialization and mail defaults are intentional breaking changes.

## Who found them

Thirty-two advisories in one batch is not something a maintainer team produces on its own. Six external
researchers are credited:

| Reporter | Advisories |
|---|---|
| Yu Bao (PayPal) | 24 |
| Kamalpreet Singh | 3 |
| gaorenyusi | 2 |
| Venkatraman Kumar (Securin) | 2 |
| Lidor Ben Shitrit (Novee Security) | 1 |
| Leon Zlobecki | 1 |
| Andrea Cosentino (ASF) | 2 |

Some advisories have more than one reporter, which is why the column adds up to more than 32. Yu Bao's
work is the reason the header family turned up in twenty-two components rather than two. That was a
methodical sweep across the component set, not a one-off report, and it saved us a lot of time.

Everyone here is named in the advisory they reported. If you find something, mail
[security@camel.apache.org](mailto:security@camel.apache.org) privately, and see the
[ASF security policy](https://www.apache.org/security/) for how the process works.

## The full batch

All 32 fixed in 4.21.0, for reference:

| CVE | Component | Severity | What it allowed |
|---|---|---|---|
| [CVE-2026-42527](/security/CVE-2026-42527.html) | camel-jms + 11 others | MEDIUM | Out-of-band DNS disclosure through a too-permissive default deserialization filter |
| [CVE-2026-43865](/security/CVE-2026-43865.html) | camel-hazelcast | MEDIUM | Remote code execution via unsafe deserialization |
| [CVE-2026-43866](/security/CVE-2026-43866.html) | camel-jms | HIGH | Forged `ExchangeHolder` passed the class check and injected body, headers and properties |
| [CVE-2026-43867](/security/CVE-2026-43867.html) | camel-pqc | MEDIUM | Unfiltered `ObjectInputStream` on persisted key metadata |
| [CVE-2026-46453](/security/CVE-2026-46453.html) | camel-elasticsearch-rest-client | MEDIUM | Client override of the Elasticsearch query and operation |
| [CVE-2026-46454](/security/CVE-2026-46454.html) | camel-cometd | MEDIUM | Control header injection by unauthenticated Bayeux clients |
| [CVE-2026-46455](/security/CVE-2026-46455.html) | camel-keycloak | MEDIUM | Expired access tokens accepted |
| [CVE-2026-46456](/security/CVE-2026-46456.html) | camel-aws2-sqs | MEDIUM | Control header injection by a message sender |
| [CVE-2026-46457](/security/CVE-2026-46457.html) | camel-nats | MEDIUM | Control header injection by any publisher to the subject |
| [CVE-2026-46584](/security/CVE-2026-46584.html) | camel-mail | MEDIUM | Weakened SMTP transport security, and SMTP credential theft before 4.19.0 |
| [CVE-2026-46585](/security/CVE-2026-46585.html) | camel-lucene | MEDIUM | HTTP client injection of the full-text search query |
| [CVE-2026-46587](/security/CVE-2026-46587.html) | camel-couchbase | MEDIUM | Operation override from untrusted input |
| [CVE-2026-46588](/security/CVE-2026-46588.html) | camel-couchdb | MEDIUM | Operation override from untrusted input |
| [CVE-2026-46590](/security/CVE-2026-46590.html) | camel-pqc | MEDIUM | Unfiltered `ObjectInputStream`, incomplete fix of CVE-2026-40048 |
| [CVE-2026-46591](/security/CVE-2026-46591.html) | camel-neo4j | MEDIUM | Cypher injection, incomplete fix of CVE-2025-66169 |
| [CVE-2026-46592](/security/CVE-2026-46592.html) | camel-cxf | MEDIUM | HTTP client redirect of the invoked SOAP operation |
| [CVE-2026-46726](/security/CVE-2026-46726.html) | camel-vertx-websocket | HIGH | SSRF and secret disclosure via injected `CamelHttpUri` |
| [CVE-2026-48203](/security/CVE-2026-48203.html) | camel-solr | MEDIUM | Solr query parameter injection (SSRF) and document field injection |
| [CVE-2026-48204](/security/CVE-2026-48204.html) | camel-mongodb-gridfs | MEDIUM | GridFS operation switch, including file deletion |
| [CVE-2026-48205](/security/CVE-2026-48205.html) | camel-dns | MEDIUM | DNS queries redirected to an attacker's server, and internal hostname enumeration |
| [CVE-2026-48206](/security/CVE-2026-48206.html) | camel-jira | MEDIUM | Arbitrary JIRA operations using the endpoint's credentials |
| [CVE-2026-49042](/security/CVE-2026-49042.html) | camel-langchain4j-tools | MEDIUM | Arbitrary header injection via LLM tool call arguments |
| [CVE-2026-49086](/security/CVE-2026-49086.html) | camel-dapr | MEDIUM | Re-published message redirected to an arbitrary component and topic |
| [CVE-2026-49097](/security/CVE-2026-49097.html) | camel-irc | MEDIUM | Outgoing IRC messages redirected to arbitrary channels or users |
| [CVE-2026-49098](/security/CVE-2026-49098.html) | camel-kafka | MEDIUM | Kafka messages redirected to an arbitrary topic |
| [CVE-2026-49099](/security/CVE-2026-49099.html) | camel-salesforce | MEDIUM | SOQL and SOSL injection, SObject override, Apex REST redirect |
| [CVE-2026-49365](/security/CVE-2026-49365.html) | camel-netty-http | MEDIUM | Full Java stack traces returned to unauthenticated clients |
| [CVE-2026-53913](/security/CVE-2026-53913.html) | camel-keycloak | HIGH | Fail-open authentication bypass in the default configuration |
| [CVE-2026-55993](/security/CVE-2026-55993.html) | camel-atmosphere-websocket | HIGH | SSRF and secret disclosure via injected control headers |
| [CVE-2026-55994](/security/CVE-2026-55994.html) | camel-iggy | HIGH | SSRF and secret disclosure via injected control headers |
| [CVE-2026-56139](/security/CVE-2026-56139.html) | camel-undertow | MEDIUM | Full Java stack traces returned, and the option ignored for Rest DSL |
| [CVE-2026-56140](/security/CVE-2026-56140.html) | camel-aws2-sns | LOW | Defence-in-depth alignment, no reachable inbound path |

Five HIGH, twenty-six MEDIUM, one LOW.

## Why we publish all of it

A project with a quiet advisory page is not a project without vulnerabilities. It is usually a project
where nobody looked, or where what was found never got written down. Neither of those helps you plan.

What is worth checking is the response. Do findings get fixed on the line you are running, or only on
`main`? Does that take days or quarters? When a fix turns out to be incomplete, does anyone say so in
public? And is the record complete enough that you can verify any of this without taking our word for it?

Camel's [advisory history](/security/) goes back to 2013 and is complete, signed and public. That
includes the vulnerability we introduced ourselves, the two fixes that turned out to be incomplete, and
the one with no exploit path at all. We would rather have those on the record than a shorter page.

## Learn more

- [Security advisories](/security/), every Camel advisory since 2013, PGP-signed
- [Security model](/manual/security-model.html), where the trust boundaries sit and what is in scope
- [Camel 4.21 What's New](/blog/2026/07/camel421-whatsnew/), the rest of the release
- [4.21 upgrade guide](/manual/camel-4x-upgrade-guide-4_21.html), the header renames and changed defaults
- [SBOMs and supply chain](/blog/2026/06/camel-sbom-supply-chain/), scanning your own dependency tree
- [Trust](/trust/), the wider picture

---

*Release dates and advisory data in this post come from the published
[Apache Camel release announcements](/blog/) and [security advisories](/security/). Report
vulnerabilities privately to [security@camel.apache.org](mailto:security@camel.apache.org).*
