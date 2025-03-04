---
title: "Camel Observability Services"
date: 2025-03-05
draft: false
authors: [squakez]
categories: ["Howtos", "Observability", "Devops"]
preview: "How to leverage Camel Observability Services component"
---

Observability is a pillar of any distributed Microservices oriented architecture. As the number of services to govern may rise in number, it's very important to have a clear and easy way to understand (observe) what's going on in a distributed system at any time. And this feature become even more important when you're running your application in the cloud.

## What is Observability from Camel perspective

The term *Observability* is often used with a wide perspective and may provide misunderstanding about what it really encompass. When we talk about observability in Camel we typically refer to four main areas: *metrics*, *health*, *logs* and *traces*.

The **metrics** are those information which describe certain KPI of your application (ie, resource consumption, application responsiveness, ...). **Health** is about a quick check on the status of the application (is it running or not?). **Logs** are those information which describe briefly what an application is doing (mostly useful to troubleshoot errors and performances). **Traces** are those information which correlate two or more application together (for example, an microservice calling another microservice).

## Camel Observability Services component

Observability features have been available in Camel since long time. However they have always configured as separate components. In version 4.9.0 we have introduced a new component, `camel-observability-services` which goal is to create a single component including the different observability features already available in Camel.

The goal of the component is twofold. For one side we want to provide a single place where the user can have a default setting or a customization of all the various observability features (the ones described above). On the other side we want to harmonize the various Camel runtimes and provide the very same "consuming" experience regardless what's the runtime chosen by the user (for example, consuming the same metrics endpoints).

### Services exposed

In this first implementation we have focused on metrics, health and traces. Logs are still to be configured separately, but the long term goal is to include this feature as well. The component is strongly opinionated toward the more recent standard de facto. It turns more efficient in terms of software management to use a given set of technologies.

The two "standard" technology we are using are [Micrometer Prometheus](https://docs.micrometer.io/micrometer/reference/implementations/prometheus.html) (for metrics) and [OpenTelemetry](https://opentelemetry.io/) (for traces).

The component is thought to be dropped as a dependency to your application and configure by itself (like a Spring Boot starter experience). Indeed, adding the dependency to your application POM will suffice to expose all the observability services available in Camel with a set of default settings. Any further customization can be included in the regular `application.properties` as it happens normally.

As soon the application run, you will have the following series of services exposed:

* Health endpoints: liveness and readiness health check you can use out of the box for your cluster configuration (endpoint `http://localhost:8080/observe/health`, `http://localhost:8080/observe/health/live`, `http://localhost:8080/observe/health/ready`).
* Micrometer Prometheus metrics endpoint: an endpoint "Prometheus-ready" to be scraped to get information about Camel application (`http://localhost:8080/observe/metrics`).
* OpenTelemetry traces: it includes the internal mechanism to create traces to be collected by an agent (either internal or external).
* JMX: it includes a set of metrics for Java Management eXtension.

The integration with any Prometheus and OpenTelemetry compatible tooling will therefore happens by configuring the third party tools to consume from the given endpoints.

## Quick demo

Let's see now how the above will turn into a real application. You can use any of your existing application as well. Let's use an application which exposes a "hello" REST endpoint:

```java
import org.apache.camel.builder.RouteBuilder;

public class PlatformHttpServer extends RouteBuilder {
 @Override
 public void configure() throws Exception {
   from("platform-http:/hello?httpMethodRestrict=GET")
     .setBody(simple("Hello ${header.name}"))
     .to("log:info");
 }
}
```
We can run or export the application with Camel JBang:

```bash
camel export PlatformHttpServer.java --dep camel:observability-services --dir ./app --runtime camel-main
```

NOTE: in version 4.11 there won't be any longer need to declare it as `camel export` will include the component by default.

Now that we have the application we can build it and run it:

```bash
cd app
mvn clean package
java -jar target/PlatformHttpServer-1.0-SNAPSHOT.jar
```

At this stage we can immediately check the healths conditions:

```bash
$ curl http://localhost:8080/observe/health
{
    "status": "UP"
,
    "checks": [
        {
            "name": "context",
            "status": "UP"        },
        {
            "name": "route:route1",
            "status": "UP"        },
        {
            "name": "consumer:route1",
            "status": "UP"        }
    ]
}
```

Of course, you can use these services to feed your Kubernetes liveness/readiness checks.

Let's also make some call to simulate some traffic:

```bash
curl -H name:world http://localhost:8080/hello
Hello world
$ curl -H name:universe http://localhost:8080/hello
Hello universe
```

We can quickly verify the metrics are updated accordingly:

```bash
curl http://localhost:8080/observe/metrics
...
camel_exchanges_total{camelContext="camel-1",eventType="context",kind="CamelRoute",routeId=""} 2.0
...
```

The endpoint exposes more useful information and it should be used to feed some third party tool (likely the Prometheus stack tooling) in order to scrape those results and see how those metrics evolves during the application lifecycle (via some cool graphics in [Grafana](https://grafana.com/)).

NOTE: the endpoints don't change when you use any other runtime.

## How to collect traces

Let's start a local collector which provide several interesting services, including a nice UI you can access at `http://localhost:16686` once the service is up and running:

```bash
docker run --rm --name jaeger -p 16686:16686 -p 4317:4317 -p 4318:4318 -p 5778:5778 -p 9411:9411 jaegertracing/jaeger:2.1.0
```

The Camel application built in the previous paragraph has already all the machinery required to generate traces as expected by OpenTelemetry. However you need to use a Java agent in order to be able to properly forward the traces to the telemetry collector.

Assuming you're using the OpenTelemetry Java agent (any other compatible agent should work in a similar fashion), you can run the application as:

```bash
$ java -javaagent:../opentelemetry-javaagent.jar -Dotel.logs.exporter=none -Dotel.metrics.exporter=none -jar target/PlatformHttpServer-1.0-SNAPSHOT.jar
```

Of course, the configuration of the agent may vary depending on various factors. Here, we're using the default collector which is available at localhost.

NOTE: Java agent is not required in Camel Quarkus runtime, which implementation, by default, provide an embedded client that pushes traces to the collector.

## Java management

Another part we've included in the observability component is the JMX. Camel was historically very well integrated with JMX and all the tooling built around this technology. As we've seen for tracing, the presence of this component will instrument your application with all the JMX machinery which will be adding several metrics. You can therefore use any of the JMX tooling you were previously using such as [Jolokia](https://jolokia.org/), [Hawt.io](https://hawt.io/) and the like to interact with the Java management dashboard.

## Conclusions

We've seen how the new `camel-observability-component` enables a straight observability experience to your Camel applications. Just drop the dependency in your application and unleash the power of **Observability on Camel**. Although the component was mainly thought for cloud native, it is very well suited as a general way to instrument your Camel applications wherever they are deployed.
