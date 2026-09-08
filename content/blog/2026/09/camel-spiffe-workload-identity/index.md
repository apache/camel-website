---
title: "Workload identity in Apache Camel with SPIFFE and SPIRE"
date: 2026-09-07
draft: false
authors: [oscerd]
categories: ["Security", "Camel"]
keywords: ["apache camel", "spiffe", "spire", "workload identity", "zero trust", "mtls", "jwt-svid", "x509-svid", "camel 4.23", "security", "camel-spiffe"]
preview: "Camel 4.23 adds camel-spiffe. Routes can fetch and validate SPIFFE identity documents from the local Workload API, and an SSLContextParameters backed by SPIFFE gives rotating mutual TLS to the components that already support TLS. There is an example in camel-examples that runs the whole thing with Docker Compose."
---

Camel 4.23 is planned for [October](/blog/2026/08/camel422-whatsnew/) and it adds a new component,
`camel-spiffe`. The problem it solves is not obvious if you have never looked at SPIFFE, so I want to explain what
it is for, what it does, and point at the example I wrote for it.

## The problem

Two services that talk to each other need to know who is on the other side. The usual answer is a credential that
one side stores and the other side checks: an API key in a properties file, a password in a Kubernetes secret, a
client certificate that somebody generated years ago. It works, but the credential only proves that the caller has
the credential. It says nothing about who the caller is, it has to be delivered to the workload somehow, and rotating
it is manual work that tends not to happen.

[SPIFFE](https://spiffe.io/) (Secure Production Identity Framework For Everyone) takes a different route. The
platform gives every workload a name and a short-lived proof of that name, and renews the proof on its own. The
workload asks a local API for the proof when it needs one and never stores anything.

## The vocabulary

SPIFFE is a set of specifications and [SPIRE](https://spiffe.io/docs/latest/spire-about/) is the reference
implementation. These are the terms you need for the rest of the post.

A SPIFFE ID is the name of a workload. It is a URI such as `spiffe://example.org/frontend`, where `example.org` is
the trust domain.

An SVID (SPIFFE Verifiable Identity Document) is the proof of that name. There are two kinds. An X.509-SVID is a
certificate with the SPIFFE ID as URI subject alternative name, meant for mutual TLS. A JWT-SVID is a signed token
whose subject is the SPIFFE ID and whose audience is the service it is meant for, sent as a bearer token.

The Workload API is a gRPC service on a local Unix domain socket. A workload connects to it to get its SVIDs and
the trust bundle of the domain. There is nothing to authenticate with, on purpose: the API works out who is calling
by looking at the process on the other end of the socket. That step is called attestation, and it can use the Unix
user of the process, the Kubernetes pod and service account, container labels, and a few other things.

A registration entry maps what attestation finds to a SPIFFE ID, for example "the process with uid 1001 on this
node is `spiffe://example.org/frontend`".

In SPIRE, a server issues the documents for the trust domain and an agent on every node attests the workloads and
serves them the Workload API. By default an X.509-SVID lasts one hour and a JWT-SVID five minutes. The agent renews
them before they expire and the workload just asks again.

For an integration developer this changes two things. Authentication becomes "ask the local socket for a token for
service X". Authorization becomes "is this SPIFFE ID allowed to do this". Nothing has to be stored, delivered or
rotated.

## The component

`camel-spiffe` is a producer-only component built on [java-spiffe](https://github.com/spiffe/java-spiffe). It is
marked Preview in 4.23, so details may still change. It has three operations.

`fetchJwtSvid` mints a JWT-SVID for the audience given in the `audience` option or in the `CamelSpiffeAudience`
header. The token ends up in the message body, the SPIFFE ID and the expiry in the `CamelSpiffeSpiffeId` and
`CamelSpiffeExpiry` headers.

`validateJwtSvid` validates the token found in the `CamelSpiffeToken` header, or in the body, against the audience.
The body becomes the validated `JwtSvid` and the SPIFFE ID of the caller is set as `CamelSpiffeSpiffeId`. If the
token is expired, signed by an unknown key or minted for another audience, the route gets an
`io.spiffe.exception.JwtSvidException` with the reason in its cause.

`fetchX509Svid`, the default operation, returns the X.509-SVID of the workload as an `X509Svid` with the certificate
chain, the private key and the SPIFFE ID.

The address of the Workload API comes from the `SPIFFE_ENDPOINT_SOCKET` environment variable, which is the standard
way, or from the `spiffeSocketPath` option. Since the API is gRPC on a Unix socket, java-spiffe needs a native
transport on the classpath: `io.spiffe:grpc-netty-linux` on Linux, `grpc-netty-macos` or `grpc-netty-macos-aarch64`
on macOS.

This is a client that gets a token for the backend and calls it:

```java
from("timer:orders?period=10s")
    .to("spiffe:frontend?operation=fetchJwtSvid&audience=spiffe://example.org/backend")
    .setHeader("Authorization", simple("Bearer ${body}"))
    .setBody(simple("${null}"))
    .removeHeaders("CamelSpiffe*")
    .to("http://backend:8080/api/orders?httpMethod=GET");
```

And this is the backend. The Workload API checks the signature, the expiry and the audience, and the route decides
what the caller may do from its SPIFFE ID:

```java
from("platform-http:/api/orders")
    .setHeader(SpiffeConstants.TOKEN).method(BearerToken.class, "extract")
    .to("spiffe:backend?operation=validateJwtSvid&audience=spiffe://example.org/backend")
    .log("Authenticated caller ${header.CamelSpiffeSpiffeId}")
    .choice()
        .when(method(allowList, "isAllowed(${routeId}, ${header.CamelSpiffeSpiffeId})"))
            .bean(OrderService.class, "listOrders")
            .marshal().json()
        .otherwise()
            .setHeader(Exchange.HTTP_RESPONSE_CODE, constant(403))
    .end();
```

An `onException` clause for `JwtSvidException` turns a failed validation into the HTTP 401 you want.

Two practical notes. The `workloadApiClient` option is autowired from the registry, so a unit test can bind a
mocked `WorkloadApiClient` and run the real routes without a SPIRE agent. And the body after `fetchX509Svid`
contains a private key, the body after `fetchJwtSvid` a bearer token, so keep those steps out of your log
statements.

## Mutual TLS

JWT-SVIDs cover the bearer token case. For mutual TLS with X.509-SVIDs, 4.23 also has
`SpiffeSSLContextParameters` ([CAMEL-24571](https://issues.apache.org/jira/browse/CAMEL-24571)). It is an
`SSLContextParameters` whose `SSLContext` is backed by the Workload API: the X.509-SVID and the trust bundles are
fetched live and rotated automatically. Any component that takes an `sslContextParameters` reference, such as
camel-http, camel-netty-http, camel-jetty or camel-vertx-http, can use it without knowing anything about SPIFFE.

```java
SpiffeSSLContextParameters ssl = new SpiffeSSLContextParameters();
// ssl.setSpiffeSocketPath("unix:///tmp/spire-agent/public/api.sock"); // or SPIFFE_ENDPOINT_SOCKET
ssl.setAcceptedSpiffeIds("spiffe://example.org/backend");
getCamelContext().getRegistry().bind("spiffeSsl", ssl);

from("direct:start")
    .to("https://backend.example.org/api?sslContextParameters=#spiffeSsl");
```

You have to say which peers you accept: a list of SPIFFE IDs in `acceptedSpiffeIds`, or `acceptAnySpiffeId=true`
to accept any workload of the trust domain. Setting neither fails closed. The rest of `SSLContextParameters` still
applies, including `serverParameters.clientAuthentication` when you are the server and want to require client
certificates. The `X509Source` behind it is created lazily, with a timeout, and closed together with the
`CamelContext`.

With the two together, a route can authenticate its peers on the transport with certificates that renew themselves,
and at the application level with tokens scoped to one audience. There is no keystore anywhere.

## The example

I wrote an [example](https://github.com/apache/camel-examples/tree/main/spiffe) for camel-examples that runs four
Camel applications and a SPIRE deployment with Docker Compose, all in the trust domain `example.org`. You do not
need a Kubernetes cluster to try it.

```
frontend (uid 1001)  ---- GET /api/orders, Bearer JWT ---->  backend (uid 1002)  ---- GET /api/stock ---->  inventory (uid 1004)
auditor  (uid 1003)  ---- GET /api/audit,  Bearer JWT ---->                          Bearer JWT (backend)
                                                                                     X-On-Behalf-Of: caller
```

A single `spire` container runs a SPIRE server and agent, registers the four workloads by the Unix user they run as,
and shares the Workload API socket with them. The applications never see a credential. The agent attests the process
that connects to the socket and issues the identity registered for it.

The backend exposes the orders and an audit trail, the inventory exposes stock levels. Both use the same policy, a
Camel route configuration whose `interceptFrom` validates the JWT-SVID, checks the caller against a per-route
allow-list in `application.properties`, and records the decision, all before the route itself runs. The routes
contain business logic only. Who may do what is three lines:

```properties
backend.allow.orders = spiffe://example.org/frontend
backend.allow.audit = spiffe://example.org/auditor
inventory.allow.stock = spiffe://example.org/backend
```

Serving the orders takes a second hop. The backend mints a JWT-SVID with the inventory as audience and calls it,
passing the original caller along in a header for the audit trail of the inventory. The inventory trusts that header
because the backend is authenticated and on its allow-list.

The frontend reads the orders every ten seconds (HTTP 200) and is turned away from the audit trail (403). The
auditor runs the same code and the same image, but as another Unix user, so it gets another identity with the
opposite permissions. Now and then the frontend asks for a token minted for some other service and presents that
one. The agent refuses it and the backend answers 401 with the reason.

Every application also logs its X.509-SVID once a minute. The SPIRE configuration of the example gives the
certificates ten minutes, so you can watch the serial number change while the SPIFFE ID stays the same.

Build it with Maven, start it with `docker compose up --build`, and read the logs. The README lists a few things to
try, like calling the services yourself (you have no identity, so you get a 401) or letting the auditor read the
orders by changing one property. The unit tests run without SPIRE: they mock the Workload API client and drive the
two HTTP services over a real embedded server.

## What is next

The component is in Preview and I would like to hear from people who run SPIFFE before the API settles. Things I
have in mind for the releases after 4.23, none of them scheduled yet: an mTLS version of the example built on
`SpiffeSSLContextParameters`; getting the SPIFFE ID of the TLS peer into the exchange, so that authorization by
identity works on the mTLS path too; a Kubernetes walkthrough, since that is where most people will run this and
attestation works by namespace and service account there; Spring Boot and Quarkus support.

If you use SPIFFE and have a use case, or something in the Preview does not work for you, open an issue in
[Jira](https://issues.apache.org/jira/browse/CAMEL) or write on [Zulip](https://camel.zulipchat.com/).

## Links

* [camel-spiffe component documentation](/components/next/spiffe-component.html)
* [The example in camel-examples](https://github.com/apache/camel-examples/tree/main/spiffe)
* [CAMEL-23305](https://issues.apache.org/jira/browse/CAMEL-23305), the component
* [CAMEL-24571](https://issues.apache.org/jira/browse/CAMEL-24571), the SSLContextParameters backed by the Workload API
* [SPIFFE](https://spiffe.io/), [SPIRE](https://spiffe.io/docs/latest/spire-about/) and [java-spiffe](https://github.com/spiffe/java-spiffe)
