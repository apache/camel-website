---
title: "Camel DNA"
description: "The origin story of Apache Camel — from the very first JMS-to-File route in 2007 to the Camel CLI today. The core idea hasn't changed in nearly two decades."
keywords:
- apache camel
- camel history
- camel origin
- camel 1.0
- integration framework
- JMS
- enterprise integration patterns
- from to
---

## The first route ever written

In June 2007, Apache Camel 1.0 shipped with two examples. The very first one was called `camel-example-jms-file` — consume messages from a JMS queue and save them to the file system.

This is the original code:

```java
CamelContext context = new DefaultCamelContext();

ConnectionFactory connectionFactory =
    new ActiveMQConnectionFactory("vm://localhost?broker.persistent=false");
context.addComponent("test-jms",
    JmsComponent.jmsComponentAutoAcknowledge(connectionFactory));

context.addRoutes(new RouteBuilder() {
    public void configure() {
        from("test-jms:queue:test.queue").to("file://test");
    }
});

CamelTemplate template = new CamelTemplate(context);
context.start();

for (int i = 0; i < 10; i++) {
    template.sendBody("test-jms:queue:test.queue", "Test Message: " + i);
}
```

Forty lines of Java. A Maven project with a `pom.xml`. An embedded ActiveMQ broker running in-process. Manual connection factory wiring. And `CamelTemplate` — a class that was later renamed to `ProducerTemplate`.

But look at the route itself:

```java
from("test-jms:queue:test.queue").to("file://test");
```

One line. Take data from here, send it there. That's the DNA.

---

## Where Camel came from

Camel was born inside the Apache ActiveMQ project. The 1.0 README was signed *"The Apache ActiveMQ team"*. The website lived at `activemq.apache.org/camel`. The Spring XML namespace was `http://activemq.apache.org/camel/schema/spring`. The bug tracker was `issues.apache.org/activemq/browse/CAMEL`.

Camel 1.0 shipped with 19 components: activemq, cxf, ftp, http, irc, jms, jpa, mail, mina, quartz, rmi, xmpp, and a few others.

James Strachan, Camel's creator, had a clear architectural vision: a message is consumed from an **endpoint**, routed through a set of **processors**, and delivered to another **endpoint**. That's the entire model. Endpoints are the connection points to the outside world — a JMS queue, a file directory, an HTTP service, a Kafka topic. Processors are the steps in between — transform, filter, route, enrich, split, aggregate. A route is just an endpoint feeding into a chain of processors.

```
Endpoint → Processor → Processor → Processor → Endpoint
```

This simple pipeline model turned out to be powerful enough to express any integration pattern. A content-based router is a processor that picks the next endpoint. A splitter is a processor that turns one message into many. An aggregator collects messages until a condition is met. Every pattern in the [Enterprise Integration Patterns](https://www.enterpriseintegrationpatterns.com/) book by Gregor Hohpe and Bobby Woolf maps cleanly onto this model — and Camel turned all of them into code.

The `from().to()` syntax is the user-facing expression of this architecture. But underneath, it's always been endpoints and processors — a design so composable that it scaled from 19 components to 350+ without ever needing to change the core model.

---

## That same route today

Nearly two decades later, the same JMS-to-File route looks like this:

```yaml
- route:
    from:
      uri: jms
      parameters:
        destinationName: test.queue
      steps:
        - log:
            message: "Received: ${body}"
        - to:
            uri: file
            parameters:
              directoryName: test
```

Run it:

```bash
camel run jms-to-file.camel.yaml
```

No Maven project. No build step. No manual wiring. Just one YAML file and one command.

---

## What changed, what didn't

| | **Camel 1.0** (2007) | **Camel CLI** (today) |
|---|---|---|
| **Language** | Java (40+ lines) | YAML, Java, XML — your choice |
| **Build** | Maven project with pom.xml | No build needed |
| **Broker** | Embedded ActiveMQ (in-process) | Apache ActiveMQ Artemis (container) |
| **Component setup** | Manual ConnectionFactory wiring | Auto-configured via properties |
| **Run command** | `mvn camel:run` | `camel run *` |
| **Dependencies** | Declared in pom.xml | Auto-downloaded |
| **Components** | 19 | 350+ |
| **Patterns (EIPs)** | ~20 | 65+ |
| **Contributors** | A handful | 1,600+ |
| **Lines of code** | Tens of thousands | Millions |

What stayed the same: **`from("jms:queue:test.queue").to("file://test")`**

The core routing idea — take data from here, transform it if needed, send it there — is unchanged. It's the DNA of every Camel route ever written, from a simple file transfer to a complex multi-system integration handling billions of messages.

Some ideas are so right that they never need to change. SQL gave us `SELECT * FROM` over 50 years ago — and it's still the way the world queries data. Camel's `from().to()` is the same kind of idea. A syntax so natural that it reads like intent, not code. The ecosystem around it grew enormously — databases, cloud services, AI, containers — but the core abstraction endured because it matched how people actually think about moving data.

---

## Try the tribute example

We recreated the original Camel 1.0 example as a modern Camel CLI example. Run it yourself:

```bash
# Start an Artemis broker
camel infra run artemis

# Run the tribute example
camel run https://github.com/apache/camel-jbang-examples/tree/main/camel-1-tribute
```

It sends 10 test messages to a JMS queue and saves them to files — exactly like the original, nearly two decades later.

[See the tribute example on GitHub →](https://github.com/apache/camel-jbang-examples/tree/main/camel-1-tribute)

---

## The DNA

SQL has `SELECT * FROM`. Camel has `from().to()`.

Both are ideas so fundamental that they outlasted every technology shift around them — new languages, new runtimes, new architectures, cloud, containers, AI. The world changed; the abstraction didn't need to.

Thousands of companies. Billions of messages. 350+ connectors. 65+ patterns. 100,000+ commits. 1,600+ contributors. Nearly two decades of production use.

It all started with one line:

```java
from("test-jms:queue:test.queue").to("file://test");
```

*That's Camel.*
