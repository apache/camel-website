---
title: "Command line utility with Camel Quarkus"
date: 2020-07-15
authors: ["ppalaga"]
categories: ["Howtos", "Camel Quarkus"]
preview: How to write a command line utility with Camel Quarkus
---

[Camel](/) and [Camel Quarkus](/camel-quarkus/latest/index.html) are
typically used to create integration applications that run as long living processes, a.k.a. daemons or services.
In this blog post, we are going to explain a slightly different use case: using Camel Quarkus in programs that exit by
themselves after performing some desired tasks.

## Where can this be useful?

The enterprise is full of scheduled batch processing. Say, some system exports some sort of reports daily at 4 a.m.
Those need to be transformed (e.g. XML -> Excel) and transferred somewhere else (e.g. via mail, FTP or similar).

Camel is a perfect match for doing the transformation and the transfer. However, having a service running 24/7 for
doing something useful just once a day would probably be an overkill. Combining a
[Cron job](https://en.wikipedia.org/wiki/Cron) (or a similar scheduling technology) with a command line utility may suit
much better in situations like this.

## So how can I write a command line tool with Camel Quarkus?

There are just two things where it would differ from a stock Camel Quarkus application:

1. Adding `camel-quarkus-main` dependency
2. Setting an exit condition in `application.properties`

The rest of the application - most notably the [Route](/manual/latest/routes.html) that
performs the actual data transformation and transfer - will look the same like with a traditional Camel service.


## A minimal Hello World!

Let's go through a minimal example that just prints `Hello World!` to the console and exits.

The route definition could look like the following:

```java
import org.apache.camel.builder.RouteBuilder;

@ApplicationScoped
public class CamelRoute extends RouteBuilder {

    @Override
    public void configure() {
        from("timer:hello?delay=-1&repeatCount=1")
                .setBody().constant("Hello World!")
                .to("log:hello");
    }
}
```

Note that we use the [timer](/components/latest/timer-component.html) component to trigger the
route execution. The URI parameter `delay=-1` causes the timer to be triggered with no initial delay and
`repeatCount=1` ensures that the route is executed just once.

However, doing just the above would not make our application exit by itself.
[camel-main](/components/latest/others/main.html) and its `camel.main.durationMax*`
family of configuration options offers a way to solve that. E.g. we can set the following in
`application.properties`

```properties
camel.main.durationMaxMessages = 1
```

to make the application exit after the route has processed a single message.

For the configuration to get effective, we need to add the respective dependency to the application. In case of Maven,
it is

```xml
<dependency>
    <groupId>org.apache.camel.quarkus</groupId>
    <artifactId>camel-quarkus-main</artifactId>
</dependency>
```

Of course, we also need to add the dependencies for `timer` and `log` components:

```xml
<dependency>
    <groupId>org.apache.camel.quarkus</groupId>
    <artifactId>camel-quarkus-log</artifactId>
</dependency>
<dependency>
    <groupId>org.apache.camel.quarkus</groupId>
    <artifactId>camel-quarkus-timer</artifactId>
</dependency>
```

When invoking the application on the command line, you should see something like the following:

```shell
]$ java -jar target/*-runner.jar
2020-07-15 11:32:13,577 INFO  [org.apa.cam.qua.cor.CamelBootstrapRecorder] (main) bootstrap runtime: org.apache.camel.quarkus.main.CamelMainRuntime
2020-07-15 11:32:13,623 INFO  [org.apa.cam.mai.BaseMainSupport] (main) Auto-configuration summary:
2020-07-15 11:32:13,623 INFO  [org.apa.cam.mai.BaseMainSupport] (main)  camel.main.durationMaxMessages=1
2020-07-15 11:32:13,700 INFO  [org.apa.cam.imp.eng.AbstractCamelContext] (main) Apache Camel 3.4.0 (camel-1) is starting
2020-07-15 11:32:13,701 INFO  [org.apa.cam.imp.eng.AbstractCamelContext] (main) StreamCaching is not in use. If using streams then its recommended to enable stream caching. See more details at http://camel.apache.org/stream-caching.html
2020-07-15 11:32:13,709 INFO  [org.apa.cam.imp.eng.InternalRouteStartupManager] (main) Route: route1 started and consuming from: timer://hello
2020-07-15 11:32:13,714 INFO  [org.apa.cam.imp.eng.AbstractCamelContext] (main) Total 1 routes, of which 1 are started
2020-07-15 11:32:13,715 INFO  [org.apa.cam.imp.eng.AbstractCamelContext] (main) Apache Camel 3.4.0 (camel-1) started in 0.014 seconds
2020-07-15 11:32:13,718 INFO  [org.apa.cam.mai.MainSupport] (camel-main) Waiting until: 1 messages has been processed
2020-07-15 11:32:13,719 INFO  [io.quarkus] (main) camel-quarkus-integration-test-main-command-mode 1.1.0-SNAPSHOT on JVM (powered by Quarkus 1.6.0.Final) started in 0.592s.
2020-07-15 11:32:13,720 INFO  [io.quarkus] (main) Profile prod activated.
2020-07-15 11:32:13,721 INFO  [io.quarkus] (main) Installed features: [camel-core, camel-log, camel-main, camel-policy, camel-support-common, camel-timer, cdi]
2020-07-15 11:32:13,725 INFO  [hello] (Camel (camel-1) thread #0 - timer://hello) Exchange[ExchangePattern: InOnly, BodyType: String, Body: Hello World!]
2020-07-15 11:32:13,729 INFO  [org.apa.cam.mai.MainLifecycleStrategy] (Camel (camel-1) thread #0 - timer://hello) Duration max messages triggering shutdown of the JVM.
2020-07-15 11:32:13,730 INFO  [org.apa.cam.imp.eng.AbstractCamelContext] (Camel (camel-1) thread #1 - CamelMainShutdownCamelContext) Apache Camel 3.4.0 (camel-1) is shutting down
2020-07-15 11:32:13,740 INFO  [org.apa.cam.mai.MainLifecycleStrategy] (Camel (camel-1) thread #1 - CamelMainShutdownCamelContext) CamelContext: camel-1 has been shutdown, triggering shutdown of the JVM.
2020-07-15 11:32:13,741 INFO  [org.apa.cam.imp.eng.AbstractCamelContext] (Camel (camel-1) thread #1 - CamelMainShutdownCamelContext) Apache Camel 3.4.0 (camel-1) uptime 0.041 seconds
2020-07-15 11:32:13,741 INFO  [org.apa.cam.imp.eng.AbstractCamelContext] (Camel (camel-1) thread #1 - CamelMainShutdownCamelContext) Apache Camel 3.4.0 (camel-1) is shutdown in 0.011 seconds
2020-07-15 11:32:13,745 INFO  [io.quarkus] (main) camel-quarkus-integration-test-main-command-mode stopped in 0.005s
```


## Command line parameters

That was really trivial. How about greeting a person whose name is passed via a command line parameter? We can use
[Quarkus MicroProfile Config](https://quarkus.io/guides/config) for that:

```java
import javax.enterprise.context.ApplicationScoped;
import org.apache.camel.builder.RouteBuilder;
import org.eclipse.microprofile.config.inject.ConfigProperty;

@ApplicationScoped
public class CamelRoute extends RouteBuilder {

    @ConfigProperty(name = "greeted.subject", defaultValue = "World")
    String greetedSubject;

    @Override
    public void configure() {
        from("timer:hello?delay=-1")
                .setBody().constant("Hello " + greetedSubject + "!")
                .to("log:hello");
    }
}
```

For the `@ConfigProperty` annotation to work, the `CamelRoute` class needs to be annotated with
`@ApplicationScoped`.

Having the above in place, we can call the application with the `-Dgreeted.subject=Joe` parameter at the command
line and voilà

```shell
$ $ java -Dgreeted.subject=Joe -jar target/*-runner.jar
2020-07-15 11:42:18,770 INFO  [org.apa.cam.qua.cor.CamelBootstrapRecorder] (main) bootstrap runtime: org.apache.camel.quarkus.main.CamelMainRuntime
2020-07-15 11:42:18,816 INFO  [org.apa.cam.mai.BaseMainSupport] (main) Auto-configuration summary:
2020-07-15 11:42:18,816 INFO  [org.apa.cam.mai.BaseMainSupport] (main)  camel.main.durationMaxMessages=1
2020-07-15 11:42:18,892 INFO  [org.apa.cam.imp.eng.AbstractCamelContext] (main) Apache Camel 3.4.0 (camel-1) is starting
2020-07-15 11:42:18,893 INFO  [org.apa.cam.imp.eng.AbstractCamelContext] (main) StreamCaching is not in use. If using streams then its recommended to enable stream caching. See more details at http://camel.apache.org/stream-caching.html
2020-07-15 11:42:18,902 INFO  [org.apa.cam.imp.eng.InternalRouteStartupManager] (main) Route: route1 started and consuming from: timer://hello
2020-07-15 11:42:18,907 INFO  [org.apa.cam.imp.eng.AbstractCamelContext] (main) Total 1 routes, of which 1 are started
2020-07-15 11:42:18,908 INFO  [org.apa.cam.imp.eng.AbstractCamelContext] (main) Apache Camel 3.4.0 (camel-1) started in 0.015 seconds
2020-07-15 11:42:18,911 INFO  [org.apa.cam.mai.MainSupport] (camel-main) Waiting until: 1 messages has been processed
2020-07-15 11:42:18,914 INFO  [io.quarkus] (main) camel-quarkus-integration-test-main-command-mode 1.1.0-SNAPSHOT on JVM (powered by Quarkus 1.6.0.Final) started in 0.569s.
2020-07-15 11:42:18,915 INFO  [io.quarkus] (main) Profile prod activated.
2020-07-15 11:42:18,915 INFO  [io.quarkus] (main) Installed features: [camel-core, camel-log, camel-main, camel-policy, camel-support-common, camel-timer, cdi]
2020-07-15 11:42:18,919 INFO  [hello] (Camel (camel-1) thread #0 - timer://hello) Exchange[ExchangePattern: InOnly, BodyType: String, Body: Hello Joe!]
2020-07-15 11:42:18,921 INFO  [org.apa.cam.mai.MainLifecycleStrategy] (Camel (camel-1) thread #0 - timer://hello) Duration max messages triggering shutdown of the JVM.
2020-07-15 11:42:18,922 INFO  [org.apa.cam.imp.eng.AbstractCamelContext] (Camel (camel-1) thread #1 - CamelMainShutdownCamelContext) Apache Camel 3.4.0 (camel-1) is shutting down
2020-07-15 11:42:18,931 INFO  [org.apa.cam.mai.MainLifecycleStrategy] (Camel (camel-1) thread #1 - CamelMainShutdownCamelContext) CamelContext: camel-1 has been shutdown, triggering shutdown of the JVM.
2020-07-15 11:42:18,933 INFO  [org.apa.cam.imp.eng.AbstractCamelContext] (Camel (camel-1) thread #1 - CamelMainShutdownCamelContext) Apache Camel 3.4.0 (camel-1) uptime 0.040 seconds
2020-07-15 11:42:18,933 INFO  [org.apa.cam.imp.eng.AbstractCamelContext] (Camel (camel-1) thread #1 - CamelMainShutdownCamelContext) Apache Camel 3.4.0 (camel-1) is shutdown in 0.011 seconds
2020-07-15 11:42:18,937 INFO  [io.quarkus] (main) camel-quarkus-integration-test-main-command-mode stopped in 0.005s
```

## Compiling the command line utility to a native executable

[As usual with Camel Quarkus](/camel-quarkus/latest/user-guide/first-steps.html#_native_mode),
the application can be compiled to native executable by activating the `native` profile.
GraalVM with `native-image` command installed and `GRAALVM_HOME` environment variable set is required for that,
see [Building a native executable](https://quarkus.io/guides/building-native-image) section of the Quarkus
documentation.

```shell
$ export GRAALVM_HOME=...
$ mvn clean package -Pnative
...
$ ls -lh target
...
-rwxr-xr-x. 1 ppalaga ppalaga  33M Jul 15 11:48 command-mode-runner
...
```

The basic command line application compiled into a Linux native executable has about 33 Megabytes.

Running it is easy:

```shell
$ target/*runner -Dgreeted.subject=Joe
2020-07-15 12:19:22,810 INFO  [org.apa.cam.qua.cor.CamelBootstrapRecorder] (main) bootstrap runtime: org.apache.camel.quarkus.main.CamelMainRuntime
2020-07-15 12:19:22,811 INFO  [org.apa.cam.mai.BaseMainSupport] (main) Auto-configuration summary:
2020-07-15 12:19:22,811 INFO  [org.apa.cam.mai.BaseMainSupport] (main)  camel.main.durationMaxMessages=1
2020-07-15 12:19:22,812 INFO  [org.apa.cam.imp.eng.AbstractCamelContext] (main) Apache Camel 3.4.0 (camel-1) is starting
2020-07-15 12:19:22,812 INFO  [org.apa.cam.imp.eng.AbstractCamelContext] (main) StreamCaching is not in use. If using streams then its recommended to enable stream caching. See more details at http://camel.apache.org/stream-caching.html
2020-07-15 12:19:22,812 INFO  [org.apa.cam.imp.eng.InternalRouteStartupManager] (main) Route: route1 started and consuming from: timer://hello
2020-07-15 12:19:22,812 INFO  [org.apa.cam.imp.eng.AbstractCamelContext] (main) Total 1 routes, of which 1 are started
2020-07-15 12:19:22,812 INFO  [org.apa.cam.imp.eng.AbstractCamelContext] (main) Apache Camel 3.4.0 (camel-1) started in 0.000 seconds
2020-07-15 12:19:22,812 INFO  [io.quarkus] (main) camel-quarkus-integration-test-main-command-mode 1.1.0-SNAPSHOT native (powered by Quarkus 1.6.0.Final) started in 0.007s.
2020-07-15 12:19:22,813 INFO  [io.quarkus] (main) Profile prod activated.
2020-07-15 12:19:22,812 INFO  [hello] (Camel (camel-1) thread #0 - timer://hello) Exchange[ExchangePattern: InOnly, BodyType: String, Body: Hello Joe!]
2020-07-15 12:19:22,813 INFO  [io.quarkus] (main) Installed features: [camel-core, camel-log, camel-main, camel-policy, camel-support-common, camel-timer, cdi]
2020-07-15 12:19:22,813 INFO  [org.apa.cam.mai.MainSupport] (camel-main) Waiting until: 1 messages has been processed
2020-07-15 12:19:22,813 INFO  [org.apa.cam.mai.MainLifecycleStrategy] (Camel (camel-1) thread #0 - timer://hello) Duration max messages triggering shutdown of the JVM.
2020-07-15 12:19:22,813 INFO  [org.apa.cam.imp.eng.AbstractCamelContext] (Camel (camel-1) thread #1 - CamelMainShutdownCamelContext) Apache Camel 3.4.0 (camel-1) is shutting down
2020-07-15 12:19:22,813 INFO  [org.apa.cam.mai.MainLifecycleStrategy] (Camel (camel-1) thread #1 - CamelMainShutdownCamelContext) CamelContext: camel-1 has been shutdown, triggering shutdown of the JVM.
2020-07-15 12:19:22,813 INFO  [org.apa.cam.imp.eng.AbstractCamelContext] (Camel (camel-1) thread #1 - CamelMainShutdownCamelContext) Apache Camel 3.4.0 (camel-1) uptime 0.001 seconds
2020-07-15 12:19:22,813 INFO  [org.apa.cam.imp.eng.AbstractCamelContext] (Camel (camel-1) thread #1 - CamelMainShutdownCamelContext) Apache Camel 3.4.0 (camel-1) is shutdown in 0.000 seconds
2020-07-15 12:19:22,813 INFO  [io.quarkus] (main) camel-quarkus-integration-test-main-command-mode stopped in 0.000s
```

## Show me the code!

The sources of the application used in this blog post are based on the `main-command-mode` integration test in
the Camel Quarkus source tree: https://github.com/apache/camel-quarkus/tree/master/integration-tests/main-command-mode

Bonus: The integration test module shows a way how to test command line applications.

Have a lot of fun!
