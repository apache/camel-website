---
title: "Apache Camel 4.8 What's New"
date: 2024-09-16
authors: [davsclaus, squakez, orpiske, oscerd]
categories: ["Releases"]
preview: Details of what we have done in the Camel 4.8 release.
---

Apache Camel 4.8 LTS has just been [released](/blog/2024/09/RELEASE-4.8.0/).

This release introduces a set of new features and noticeable improvements that we will cover in this blog post.

## Camel Core

The simple language has new functions such as a `iif` (ternary if).
The `@BindToRegistry` now supports init/destroy methods, and can be declared as lazy as well.

The `log` EIP can more easily configure its logger name using dynamic patterns.

Add `poll` EIP as an easier and simpler version of `pollEnrich` EIP which is also more tooling friendly.

The performance of the Camel tracer has been significantly improved, with a reduction of overhead.
When using Camel JBang, tracing is now in _standby_ mode instead of enabled.
You can use `camel trace --action=start` to start tracing.

We continued with micro-optimizations on the core code. For the `simple` language, matching predicates should be 
about 12% faster - on average. Additionally, we have fine-tuned the buffer sizes used for multiple operations, 
which should help reduce the CPU cycles required for generating strings, handling input and input data and more.


### Cloud configuration

In this version we've added the capability for the core to automatically read the cloud configuration that the user can mount at deployment time. Simply add the configuration option `camel.main.cloud-properties-location` to allow the runtime to scan such directories (using comma separated values) and consume those values as regular properties.

For example, given the following application:

```yaml
- from:
    uri: "timer:yaml"
    parameters:
      period: "1000"
    steps:
      - setBody:
          simple: "Hello Camel from {{my-property}}"
      - log: "${body}"
```

and the following Kubernetes Secret:

```yaml
apiVersion: v1
data:
  my-property: Q2FtZWwgNC44
kind: Secret
metadata:
  name: my-secret
type: Opaque
```

You can provide the `camel.main.cloud-properties-location = /etc/camel/conf.d/_secrets` application property. Then, just wire your Kubernetes secret (or configmap) to the Deployment specification as you usually do with your cloud configuration:

```yaml
    spec:
      containers:
...
        volumeMounts:
          - name: secret-volume
            readOnly: true
            mountPath: "/etc/camel/conf.d/_secrets"
      volumes:
      - name: secret-volume
        secret:
          secretName: my-secret
```

It's nice to notice that the management of secrets (and configuration) would be entirely delegated to the cluster and transparent for the final user.


## Camel JBang

We continue to improve and innovate with the Camel JBang CLI. For this release we have cleaned up the `camel export` command
and made it more consistent exporting to the three runtimes (Main, Spring Boot, and Quarkus).

The `camel kubernetes` plugin has had major overhaul and we added more support for traits, export to Spring Boot and Quarkus,
and as well to deploy and run directly via `run`.

It is now easier to see why a Camel route failed to start using `camel get route --error` command such as follows:

```console
$ camel get route --error
 PID   NAME     ID      FROM                                     REMOTE  STATUS  PHASE  MESSAGE
81814  MyKafka  route1  kafka://cheese?brokers=localhost:119092    x      Error  Start  Invalid port in bootstrap.servers: localhost:119092

------------------------------------------------------------------------------------------------------------------------
                                                       STACK-TRACE
------------------------------------------------------------------------------------------------------------------------
	org.apache.kafka.common.config.ConfigException: Invalid port in bootstrap.servers: localhost:119092
		at org.apache.kafka.clients.ClientUtils.parseAndValidateAddresses(ClientUtils.java:96)
		at org.apache.kafka.clients.ClientUtils.parseAndValidateAddresses(ClientUtils.java:62)
		at org.apache.camel.component.kafka.KafkaConsumer.doStart(KafkaConsumer.java:165)
		at org.apache.camel.support.service.BaseService.start(BaseService.java:113)
		at org.apache.camel.support.service.ServiceHelper.startService(ServiceHelper.java:126)
		at org.apache.camel.impl.engine.AbstractCamelContext.startService(AbstractCamelContext.java:3170)
		at org.apache.camel.impl.engine.InternalRouteStartupManager.doStartOrResumeRouteConsumers(InternalRouteStartupManager.java:415)
		at org.apache.camel.impl.engine.InternalRouteStartupManager.doStartRouteConsumers(InternalRouteStartupManager.java:331)
		at org.apache.camel.impl.engine.InternalRouteStartupManager.safelyStartRouteServices(InternalRouteStartupManager.java:217)
		at org.apache.camel.impl.engine.InternalRouteStartupManager.safelyStartRouteServices(InternalRouteStartupManager.java:245)
		at org.apache.camel.impl.engine.AbstractCamelContext.startRouteService(AbstractCamelContext.java:3217)
		at org.apache.camel.impl.engine.AbstractCamelContext.startRoute(AbstractCamelContext.java:1114)
		at org.apache.camel.impl.engine.InternalRouteController.startRoute(InternalRouteController.java:126)
		at org.apache.camel.impl.engine.DefaultRouteController.startRoute(DefaultRouteController.java:133)
		at org.apache.camel.cli.connector.LocalCliConnector.doActionRouteTask(LocalCliConnector.java:823)
		at org.apache.camel.cli.connector.LocalCliConnector.actionTask(LocalCliConnector.java:237)
		at org.apache.camel.cli.connector.LocalCliConnector.task(LocalCliConnector.java:220)
		at java.base/java.util.concurrent.Executors$RunnableAdapter.call(Executors.java:539)
		at java.base/java.util.concurrent.FutureTask.runAndReset(FutureTask.java:305)
		at java.base/java.util.concurrent.ScheduledThreadPoolExecutor$ScheduledFutureTask.run(ScheduledThreadPoolExecutor.java:305)
		at java.base/java.util.concurrent.ThreadPoolExecutor.runWorker(ThreadPoolExecutor.java:1136)
		at java.base/java.util.concurrent.ThreadPoolExecutor$Worker.run(ThreadPoolExecutor.java:635)
		at java.base/java.lang.Thread.run(Thread.java:840)
```

We also made it easy to include small web apps with Camel JBang. Just include your .html, .js, and .css files together with the Camel source code,
and run it all together via `camel run *`.

Added new `camel cmd browse` to browse messages on external systems such as JMS brokers, and FTP servers.

Added `camel get kafka` to show Kafka topic information such as _comitted offset_.

There are many other small improvements and bug fixes in Camel JBang.


## Camel Kubernetes Secrets refresh

The Kubernetes Secrets component has been enriched with a Camel Context reload based on Kubernetes Secrets update.

The needed properties are:

```properties
camel.vault.kubernetes.refreshEnabled=true
camel.vault.kubernetes.secrets=<secret_name>
```

The component will monitor the secrets listed, as comma separated names or regex, through a Kubernetes Client watcher.

Whenever a modification happens on the secret value, the component will trigger a Camel context reload.

To see this feature in action you can have a look at the [example](https://github.com/apache/camel-kamelets-examples/tree/main/jbang/external-secrets-aws)

## Camel Tests

We continued to modernize the testing framework which you can read about in [this blog post](/blog/2024/09/modernizing-test-support/) . 


## Miscellaneous

The `camel-as2` has added more security algorithms.

The `camel-azure-servicebus` component has been made more robust and fault-tolerant.

Upgraded many third-party dependencies to the latest releases at the time of release.

The `camel-spring-boot` is upgraded to latest Spring Boot 3.3.3 release.


## New Components

We have added a few new components:

- `camel-langchain4j-tools` - LangChain4j Tools and Function Calling Features
- `camel-langchain4j-tokenizer` - LangChain4j Tokenizer
- `camel-langchain4j-web-search` - LangChain4j Web Search Engine
- `camel-solr` - Perform operations against Apache Lucene Solr
- `camel-tahu` - Sparkplug B Host/Edge support over MQTT using Eclipse Tahu


## Upgrading

Make sure to read the [upgrade guide](/manual/camel-4x-upgrade-guide-4_8.html) if you are upgrading from a previous Camel version.

If you are upgrading from, for example, 4.4 to 4.8, then make sure to follow the upgrade guides for each release in-between, i.e.
4.4 -> 4.5, 4.5 -> 4.6, and so forth.

## Release Notes

You can find more information about this release in the list of JIRA tickets resolved in the release:

- [Release notes 4.8](/releases/release-4.8.0/)

## Roadmap

The following 4.9 release is planned for Oct/Nov 2024.

