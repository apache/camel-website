---
title: "Camel Micrometer Observation: Observability with Micrometer"
date: 2023-03-28
draft: false
authors: [marcingrzejszczak]
categories: ["Camel Observation", "Features"]
preview: "Micrometer Observation: how to configure Distributed Tracing and Metrics"
---

The Spring Observability Team has added native observability support for Spring Applications with Spring Framework 6 and Spring Boot 3. You can read more about the feature in [the Spring blog](https://spring.io/blog/2022/10/12/observability-with-spring-boot-3). This blog post will explain what Observability is, how it's done with Micrometer Observation and how you can add observability to your Camel projects.

## What is Observability?

In our understanding, it is _"how well you can understand the internals of your system by examining its outputs"_. We believe that the interconnection between metrics, logging, and distributed tracing gives you the ability to reason about the state of your system in order to debug exceptions and latency in your applications. You can watch more about what we think observability is in https://tanzu.vmware.com/developer/tv/enlightning/10/[this episode of Enlightning with Jonatan Ivanov].

With Spring Boot `3.0.0` release we've added numerous autoconfigurations for improved metrics with [Micrometer](https://micrometer.io/) and new distributed tracing support with [Micrometer Tracing](https://micrometer.io/docs/tracing)  (formerly [Spring Cloud Sleuth](https://spring.io/projects/spring-cloud-sleuth)).

## What is Micrometer Observation?

With Micrometer 1.10.0 we have introduced a new API: the Observation API.

> The idea of its founding was that we want the users to instrument their code once using a single API and have multiple benefits out of it (e.g. metrics, tracing, logging).

For any observation to happen, you need to register `ObservationHandler` objects through an `ObservationRegistry`. An `ObservationHandler` reacts only to supported implementations of an `Observation.Context` and can create, for example, timers, spans, and logs by reacting to the lifecycle events of an observation, such as:

* `start` - Observation has been started. Happens when the `Observation#start()` method gets called.
* `stop` - Observation has been stopped. Happens when the `Observation#stop()` method gets called.
* `error` - An error occurred while observing. Happens when the `Observation#error(exception)` method gets called.
* `event` - An event happened when observing. Happens when the `Observation#event(event)` method gets called.
* `scope started` - Observation opens a scope. The scope must be closed when no longer used. Handlers can create thread local variables on start that are cleared upon closing of the scope. Happens when the `Observation#openScope()` method gets called.
* `scope stopped` - Observation stops a scope. Happens when the `Observation.Scope#close()` method gets called.

Whenever any of these methods is called, an `ObservationHandler` method (such as `onStart(T extends Observation.Context ctx)`, `onStop(T extends Observation.Context ctx)`, and so on) are called. To pass state between the handler methods, you can use the `Observation.Context`.

The observation state diagram looks like this:

```
        Observation           Observation
        Context               Context
Created ----------> Started ----------> Stopped
```

The observation Scope state diagram looks like this:

```
              Observation
              Context
Scope Started ----------> Scope Closed
```

To make it possible to debug production problems, an observation needs additional metadata, such as key-value pairs (also known as tags). You can then query your metrics or distributed tracing backend by using those tags to find the required data. Tags can be of either high or low cardinality.

This is an example of the Micrometer Observation API.

```java
        // Create an ObservationRegistry
        ObservationRegistry registry = ObservationRegistry.create();
        // Register an ObservationHandler
        registry.observationConfig().observationHandler(new MyHandler());

        // Create an Observation and observe your code!
        Observation.createNotStarted("user.name", registry)
                .contextualName("getting-user-name")
                .lowCardinalityKeyValue("userType", "userType1") // let's assume that you can have 3 user types
                .highCardinalityKeyValue("userId", "1234") // let's assume that this is an arbitrary number
                .observe(() -> log.info("Hello")); // this is a shortcut for starting an observation, opening a scope, running user's code, closing the scope and stopping the observation
```

IMPORTANT:  *High cardinality* means that a pair will have an unbounded number of possible values. An HTTP URL is a good
example of such a key value (for example, `/user/user1234`, `/user/user2345`, and so on). *Low cardinality* means that a key value will  have a bounded number of possible values. A *templated* HTTP URL (such as `/user/{userId}`) is a good example of such a key value.

Assuming that the code above does instrumentation you haven't seen any tracing or metrics related setup so far. That's because we separate instrumentation from its configuration. The fact of doing metrics, tracing or logging should be a configuration problem. Let's look now how we could configure the `ObservationRegistry` to do metrics and tracing.

### Setting up the ObservationRegistry

The following snippet of code shows how to set up basic metrics and tracing capabilities for an `ObservationRegistry`.

```java
// Micrometer Core JAR
import io.micrometer.core.instrument.MeterRegistry;
import io.micrometer.core.instrument.simple.SimpleMeterRegistry;
// Micrometer Observation JAR
import io.micrometer.core.instrument.observation.DefaultMeterObservationHandler;
import io.micrometer.observation.ObservationRegistry;
// Micrometer Tracing JAR
import io.micrometer.tracing.Tracer;

// [Tracing]
// Skipped the whole setup of a Micrometer Tracing tracer
// you can check the https://micrometer.io/docs/tracing docs
// for examples of Brave and OpenTelemetry Tracer setup
io.micrometer.tracing.Tracer tracer = ...; // <1>

// [Metrics]
MeterRegistry meterRegistry = new SimpleMeterRegistry(); // <2>

// Setting up ObservationRegistry
ObservationRegistry registry = ObservationRegistry.create(); // <3>
// Adding metrics support
registry.observationConfig().observationHandler(new DefaultMeterObservationHandler(meterRegistry)); // <4>
// Adding basic tracing support
registry.observationConfig().observationHandler(new DefaultTracingObservationHandler(tracer)); // <5>
```

- <1> - for tracing a `Tracer` is needed. Check the [docs](https://micrometer.io/docs/tracing) on more information on how to set it up
- <2> - for metrics a `MeterRegistry` is needed. Check the [docs](https://micrometer.io/docs/concepts) on more information on how to wotk with Micrometer
- <3> - an `ObservationRegistry` is required to create `Observation`. Check the [docs](https://micrometer.io/docs/observation) on more information on how to set it up
- <4> - to add capabilities to `ObservationRegistry` one needs to add handlers. Here you have an example of a handler for metrics
- <5> - Here you have an example of a handler for tracing. This is a basic sample, for moew information check this [part of the docs](https://micrometer.io/docs/tracing#_handler_configuration)


## How does Micrometer Observation work with Camel?

Apache Camel comes with an abstraction of a [`Tracer`](https://camel.apache.org/components/3.20.x/others/tracing.html). It automatically creates spans for Camel Routes.

With Micrometer Observation we've modified the concept of a `Tracer` to allow distingushing between high and low cardinality tags. That in turn allowed us to use the `Tracer` API to create `Observations` instead of spans. That allowed us to automatically create both traces and metrics depending on your `ObservationRegistry` setup.

### Setting up Micrometer Observation with Camel

In order to set up Micrometer Observation with Camel you need to use the new `camel-observation` component and set up a `MicrometerObservationTracer` and register it in the `CamelContext`.

```java
// Camel
CamelContext context = ...;
MicrometerObservationTracer micrometerObservationTracer = new MicrometerObservationTracer();

// Micrometer Core
MeterRegistry meterRegistry = new SimpleMeterRegistry();

// Micrometer Tracing
Tracer tracer = ...; 
Propagator propagator = ...;

// Micrometer Observation setup
ObservationRegistry observationRegistry = ObservationRegistry.create();
observationRegistry.observationConfig().observationHandler(new DefaultMeterObservationHandler(meterRegistry));
observationRegistry.observationConfig().observationHandler(
    new ObservationHandler.FirstMatchingCompositeObservationHandler(
        new PropagatingSenderTracingObservationHandler<>(tracer, propagator), 
        new PropagatingReceiverTracingObservationHandler<>(tracer, propagator), 
        new DefaultTracingObservationHandler(tracer)
    )
);

// Camel
// Setting up Micrometer Observation Tracer
micrometerObservationTracer.setObservationRegistry(observationRegistry);
micrometerObservationTracer.setTracer(tracer);
micrometerObservationTracer.init(context);
```

With this setup you will start creating spans and metrics for your routes.

### Setting up Micrometer Observation with Camel and Spring Boot

With Spring Boot the setup is easier, because all the components come pre-configured for you. Just annotate your class with `@CamelObservation` and your `CamelContext` will automatically be setup depending on your classpath.

```java
@SpringBootApplication
@CamelObservation
public class ClientApplication {

    public static void main(String[] args) {
		SpringApplication.run(ClientApplication.class, args);
	}
}
```

## Example

In this section you will see an example of running different applciations that use Camel with Micrometer, send their spans to [Zipkin](https://zipkin.io) and expose their metrics on a [Prometheus](https://prometheus.io/) endpoint. You can find the Camel & Micrometer Observation examples [here](https://github.com/apache/camel-spring-boot-examples/tree/main/observation).

For Metrics we are using Micrometer Core, for Tracing we're using Micrometer Tracing with [Brave](https://github.com/openzipkin/brave). The application have their tracing sampling probabilities set to always sample. Check the [Spring Boot docs](https://docs.spring.io/spring-boot/docs/current/reference/htmlsingle/#actuator.micrometer-tracing.getting-started) for more information on how to configure Spring Boot with Micrometer Tracing.

The example includes three applications

* client
* service1
* service2

Where client -> service1 -> service2 using HTTP.

All of them have `org.apache.camel.springboot:camel-observation-starter` dependency on the classpath.

### Outcome

You should get a trace view similar to this one

![Zipkin full trace](trace.png)

You will get Camel metrics. Example of one of the metrics from Prometheus

![Prometheus](metrics.jpeg) 

Example of plotting metrics in Grafana

![Grafana](metrics2.jpeg)

## Summary

In this blog post you've managed to learn how you can leverage the new `camel-observation` component that uses Micrometer Observation to make your Camel routes observable.