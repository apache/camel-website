---
title: "How Apache Camel elevates Citrus Integration Testing to next levels"
date: 2026-07-06
draft: false
authors: [christophd]
categories: ["Tooling", "Howtos"]
keywords: ["apache camel", "citrus", "integration testing", "data formats", "processors", "quarkus", "testcontainers"]
preview: "Citrus gains the ability to speak every protocol that Camel supports, transform test data with Camel's rich data formats, and reach into running Camel routes to trigger or verify business logic directly. This post explores five concrete ways Apache Camel elevates Citrus integration testing."
---

 [Citrus](https://citrusframework.org) is a powerful integration testing framework that orchestrates end-to-end test scenarios with clean, readable Java code. As a framework Citrus provides several ready-to-use components to connect to messaging systems, cloud services, and protocols such as Http, Kafka, Jms and many more — but when you combine Citrus with the power of Apache Camel, something remarkable happens.

Citrus gains the ability to speak every protocol Camel supports, transform test data with Camel's rich data formats, and even reach into running Camel routes to trigger or verify business logic directly. In return, Camel gets a purpose-built test harness that can validate its routes in realistic, container-backed environments with proper message verification.

This post explores five concrete ways Apache Camel elevates Citrus integration testing. Each section focuses on a real scenario, backed by working sample projects that you can clone and run. By the end you will have a clear picture of how the two frameworks complement each other and where to reach for Camel when writing Citrus tests.

# Using Camel components to send and receive messages

The most immediate benefit of Camel integration in Citrus is access to Camel's massive component library. Citrus has excellent built-in support for protocols like HTTP, Kafka, JMS, and FTP — but the world of integration is vast. What about MQTT? AMQP 1.0? gRPC? Rather than waiting for Citrus to add native support for every protocol, you can leverage any Camel component directly in your tests.

The key is the `CamelSupport.camel()` DSL, which lets you send and receive messages through any Camel endpoint URI:

```java
runner.when(
    camel()
        .send()
        .endpoint("paho-mqtt5:temperature?brokerUrl={{mqtt.broker.url}}")
        .message()
        .fork(true)
        .body("{\"value\": 25}")
);
```

This snippet sends an MQTT message using Camel's `paho-mqtt5` component — something Citrus cannot do on its own. The message is published to the `temperature` topic on an MQTT broker, and the `{{mqtt.broker.url}}` placeholder is resolved from the application's Camel context at runtime.

What makes this powerful is how natural it feels. The `camel().send()` action follows the same Given-When-Then pattern as any other Citrus test action. You specify the Camel endpoint URI, set the message body and headers, and let Citrus handle the rest.

This approach can be mixed with arbitrary Citrus send and receive operations on endpoints such as Kafka. In the sample application the Camel route consumes MQTT messages, extracts the temperature value from the JSON body with a JQ expression, and uses a Content Based Router to decide whether the reading is warm or cold. Readings above 20 degrees go to the `temperature-warm` Kafka topic, everything else to `temperature-cold`. The test verifies this routing decision by sending a warm reading over MQTT and then checking that it arrives on the correct Kafka topic:

```java
@CitrusEndpoint
@KafkaEndpointConfig(topic = "temperature-warm")
KafkaEndpoint temperatureWarm;

runner.then(
    receive()
        .endpoint(temperatureWarm)
        .message()
        .body("25")
);
```

The test sends MQTT and verifies Kafka — two different protocols, coordinated in a single test method. Citrus handles the MQTT side through Camel and the Kafka side through its own native endpoint. This multi-protocol testing is where the combination really shines.

The `.fork(true)` flag deserves a brief mention. It tells Citrus to send the message asynchronously so the test thread can proceed to the verification step. Without it, the test would block waiting for the MQTT publish to complete before checking Kafka, which could cause timing issues with asynchronous routes.

You can see this pattern in action in the [Camel MQTT sample](https://github.com/citrusframework/citrus-quarkus-examples/tree/main/apache-camel/camel-mqtt).

# Connecting with third-party services Citrus does not support out of the box

The MQTT example above illustrates protocol bridging, but Camel's component library goes far beyond messaging protocols. It covers cloud services like AWS S3, Azure Blob Storage, and Google Cloud Pub/Sub. It connects to databases, file systems, social media APIs, and dozens more. Any of these become available to your Citrus tests the moment you add the corresponding Camel dependency.

Consider a Camel route that polls an AWS S3 bucket, splits each file into individual lines, wraps each line as a JSON event, and publishes the result to Kafka. Testing this route requires uploading a file to S3 — but Citrus does not have a native S3 endpoint. With Camel, you can upload the file using the `aws2-s3` component:

```java
runner.when(
    camel()
        .send()
        .endpoint("aws2-s3://citrus-camel-demo?" +
                      "overrideEndpoint=true&" +
                      "forcePathStyle=true&" +
                      "uriEndpointOverride={{aws.s3.uriEndpointOverride}}&" +
                      "accessKey={{aws.s3.accessKey}}&" +
                      "secretKey={{aws.s3.secretKey}}&" +
                      "region={{aws.s3.region}}")
        .message()
        .fork(true)
        .body("Hello Camel!\nHello Citrus!\nHello Quarkus!")
        .header("CamelAwsS3Key", "hello.txt")
);
```

The test writes a multi-line text file to an S3 bucket backed by a local AWS test instance that Citrus provisions automatically via the `@LocalStackContainerSupport` annotation and Testcontainers. The Camel endpoint URI points to the same AWS test instance that the application route polls, so the uploaded file is picked up and processed just as it would be in production.

After the route processes the file, the test verifies each line appears as a separate JSON event on Kafka:

```java
runner.then(
    receive()
        .endpoint(s3Events)
        .message()
        .body("{ \"message\": \"Hello Camel!\" }")
);
```

The pattern is the same as before: use Camel to interact with a technology that Citrus does not support natively, then verify the outcome with a Citrus endpoint that does. The infrastructure — a local AWS test instance for S3, a Kafka broker — is managed by Citrus annotations and Testcontainers, keeping the test self-contained and reproducible.

This approach scales to any service Camel supports. Need to drop a message on a RabbitMQ queue? Use `camel().send().endpoint("rabbitmq:...")`. Need to write a file to an FTP server? Use `camel().send().endpoint("ftp:...")`. The Camel component catalog becomes your test toolkit.

The full example is available in the [Camel AWS S3 to Kafka sample](https://github.com/citrusframework/citrus-quarkus-examples/tree/main/apache-camel/camel-aws-s3-kafka).

# Transforming test data with Camel data formats

Real-world integration rarely deals with plain strings. Messages arrive as compressed archives, Base64-encoded payloads, serialized Protobuf messages, or structured CSV files. When your Camel route expects a ZIP file as input, your test needs to produce a ZIP file. You could write the compression logic by hand — create a `ZipOutputStream`, add entries, close the stream — but that is boilerplate that obscures the test's intent.

Citrus lets you tap into Camel's data format system to marshal and unmarshal test data declaratively. Here is how you create a ZIP file in a test using Camel's `zipFile` data format:

```java
runner.when(
    camel()
        .send()
        .endpoint("file:inbox")
        .message()
        .header("CamelFileName", "words.zip")
        .body("Hello World")
        .transform(processor().camel()
                .marshal()
                .zipFile())
);
```

The `.transform()` call is where Camel's data format integration kicks in. The `processor().camel().marshal().zipFile()` expression tells Citrus to pass the message body through Camel's ZIP file marshaller before writing it to disk. The result is a properly compressed `words.zip` file in the `inbox` directory — exactly what the Camel route expects to consume.

Compare this with the manual approach:

```java
// Manual ZIP creation — verbose and error-prone
ByteArrayOutputStream baos = new ByteArrayOutputStream();
ZipOutputStream zos = new ZipOutputStream(baos);
zos.putNextEntry(new ZipEntry("content.txt"));
zos.write("Hello World".getBytes());
zos.closeEntry();
zos.close();
byte[] zipContent = baos.toByteArray();
```

The Camel-powered version is one line of transformation logic. It is declarative, readable, and uses the exact same data format implementation that the production route uses for unmarshalling. This test-production parity matters — if the route changes its compression format, the test adapts by changing one data format call.

The same pattern works with any Camel data format. Need to create JSON test data?

```java
.transform(processor().camel().marshal().json())
```

Base64-encoded content?

```java
.transform(processor().camel().marshal().base64())
```

GZIP compression?

```java
.transform(processor().camel().marshal().gzip())
```

Camel supports dozens of data formats including CSV, Protobuf, Avro, JAXB, and many more. All of them are available for creating test data through the same `.transform(processor().camel().marshal()...)` pattern.

The complete example is in the [Camel File Inbox sample](https://github.com/citrusframework/citrus-quarkus-examples/tree/main/apache-camel/camel-file-inbox).

# Using Camel processors for verification

Data formats handle structured transformations like compression and serialization, but sometimes you need more general processing power during verification. Camel processors fill this gap. They give you access to Camel's type conversion system, header manipulation, and arbitrary processing logic — all usable within Citrus test actions.

A common scenario is verifying the content of files produced by a Camel route. When a route aggregates multiple messages and writes the result to a file, the test needs to read that file and validate its content. The file arrives as a byte stream, but you want to validate it as a string. Camel's `convertBodyTo` processor handles the conversion:

```java
runner.then(
    camel()
        .receive()
        .endpoint("file:outbox")
        .process(processor().camel().convertBodyTo(String.class))
        .message()
        .header("CamelFileName", "tasks.txt")
        .body("""
        Doctor's appointment 9:00am
        Fetch kids from school
        Plan next vacation in June
        """)
);
```

The `.process()` call applies a Camel processor to the received message before validation. In this case, `convertBodyTo(String.class)` uses Camel's type conversion system to turn the raw file bytes into a `String`, which Citrus can then compare against the expected body content.

This approach works because Citrus and the application share the same `CamelContext`. The test injects and registers it:

```java
@Inject
@BindToRegistry
CamelContext camelContext;
```

With the shared context, the test has access to all of Camel's processing capabilities: type converters, data formats, header manipulation, and even custom processor logic. Instead of writing manual file-reading code, you express the transformation declaratively and let Camel do the heavy lifting.

The processor integration is not limited to type conversion. You can chain multiple processors, apply data format unmarshalling on received messages, or use any custom Camel processor that your application defines. This keeps test code focused on what it is verifying rather than how to prepare data for verification.

See the full example in the [Camel File Outbox sample](https://github.com/citrusframework/citrus-quarkus-examples/tree/main/apache-camel/camel-file-outbox).

# Accessing internal Camel routes for test control

The examples so far use Camel as a tool within Citrus — sending messages through Camel components, transforming data with Camel formats and processors. But there is another dimension to the integration: reaching into the application's own Camel routes to trigger business logic or inject test data at precise points in the processing pipeline.

Camel's `direct:` component provides synchronous, in-memory endpoints that are ideal for this. When your application defines a route starting with `from("direct:tasks")`, a Citrus test can send messages directly to that endpoint without going through any external transport:

```java
runner.when(
    send()
        .endpoint("camel:direct:tasks")
        .message()
        .body("Doctor's appointment 9:00am")
);
```

The `camel:direct:tasks` URI is a Citrus convention that resolves to the Camel `direct:tasks` endpoint in the shared CamelContext. This gives the test direct access to the route's entry point — no message broker, no HTTP server, no external transport required. Messages are passed in-memory, making this the fastest way to trigger a Camel route from a test.

This pattern is particularly useful for testing complex Camel routes that involve multiple processing steps. Consider a route that receives messages through a direct endpoint, aggregates three of them, and writes the result to a file. The test can send exactly three messages to trigger the aggregation:

```java
runner.when(
    Arrays.asList(
        send().endpoint("camel:direct:tasks").message()
            .body("Doctor's appointment 9:00am"),
        send().endpoint("camel:direct:tasks").message()
            .body("Fetch kids from school"),
        send().endpoint("camel:direct:tasks").message()
            .body("Plan next vacation in June")
    )
);
```

All three messages are delivered in-memory to the same Camel route, triggering the aggregation logic and producing the output file. The test has full control over what enters the route and can verify the aggregated result on the other side.

Direct endpoint access also works well with Camel's `mock:` component for verification. When a route ends with `to("mock:words-out")`, the test can access that mock endpoint through the shared CamelContext and assert on the messages it received:

```java
MockEndpoint mockEndpoint = getMockEndpoint("mock:words-out");
mockEndpoint.expectedBodiesReceived(">> HOWDY");

runner.when(
    send()
        .fork(true)
        .endpoint("camel:direct:words-in")
        .message()
        .header("lang", "us-texas")
        .body("Hello")
);

runner.then(
    context -> {
        try {
            mockEndpoint.assertIsSatisfied();
        } catch (InterruptedException e) {
            throw new CitrusRuntimeException("Failed to verify mock endpoint", e);
        }
    }
);
```

This combination of direct endpoints for input and mock endpoints for output gives you surgical precision in testing. You bypass external transports entirely, focus on the route's transformation and routing logic, and verify the results through Camel's own mock assertion API.

The `.fork(true)` flag is important here because the `direct:` component is synchronous — it executes the route in the caller's thread. Without forking, the send action would block until the entire route completes, which can cause timing issues when the route makes external calls (like the HTTP translation service in the example above) that the test needs to intercept.

Explore this pattern in the [Camel Direct sample](https://github.com/citrusframework/citrus-quarkus-examples/tree/main/apache-camel/camel-direct) for simple route testing and the [Camel Direct HTTP sample](https://github.com/citrusframework/citrus-quarkus-examples/tree/main/apache-camel/camel-direct-http) for a more advanced scenario that combines direct endpoint access with HTTP service simulation.

# Getting started

All the capabilities described in this post are available through the `citrus-camel` module. Add it as a test-scoped dependency in your Maven POM:

```xml
<dependency>
    <groupId>org.citrusframework</groupId>
    <artifactId>citrus-camel</artifactId>
    <version>${citrus.version}</version>
    <scope>test</scope>
</dependency>
```

The module provides the `CamelSupport.camel()` DSL for sending and receiving through Camel endpoints, the `processor().camel()` API for data formats and processors, and the `@BindToRegistry` annotation for sharing the CamelContext between your application and tests.

The sample projects referenced throughout this post are available in the [citrus-quarkus-examples](https://github.com/citrusframework/citrus-quarkus-examples/tree/main/apache-camel) repository. Each is a self-contained Quarkus application with a Camel route and a Citrus test that verifies it. Clone the repository, pick a sample, and run `./mvnw clean test` to see it in action.

# Wrapping up

Apache Camel and Citrus are a natural fit. Camel's strength is connecting systems — its 300+ components, rich data formats, and enterprise integration patterns cover virtually every integration scenario. Citrus's strength is testing those integrations — orchestrating multi-protocol test flows, provisioning infrastructure, and validating message content with precision.

When you bring them together, Citrus tests gain the ability to speak any protocol Camel supports, transform test data with production-grade data formats, and reach directly into Camel routes for surgical testing. The five patterns we explored — using Camel components for protocol bridging, connecting with unsupported services, transforming test data with data formats, verifying with processors, and accessing internal routes — give you a comprehensive toolkit for testing even the most complex integration scenarios.

The best part is how little ceremony is involved. A shared CamelContext, a few imports, and the familiar Citrus Given-When-Then pattern. The code reads like what it does, and the tests run fast because infrastructure is managed by Citrus and Testcontainers.

Give it a try, and let us know what you think!
