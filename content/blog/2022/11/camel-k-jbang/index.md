---
title: "How to test an Integration for Camel K"
date: 2022-11-24
draft: false
authors: [squakez]
categories: ["Howtos", "Camel K", "Test", "JBang"]
preview: "How to use Camel JBang to locally test a Camel K integration"
---

Testing is probably one of those operations we use to repeat most of the time while building any application. Applications in Camel world are no difference. With the advent of **Camel JBang**, we have a unified place that can be used to perform our testing/fine tuning locally before moving to a higher environment.

During the last years of development, we have noticed that testing or fine tuning an integration directly connected to a **Cloud Native** environment can result a bit cumbersome. You need to be connected to the cluster, or alternatively you need a local Kubernetes cluster running on your machine (Minikube, Kind and the likes). Most of the time, the aspects inherent to the cluster fine tuning are coming very late in the development. Therefore, it would be nice to have a ligther way of testing our applications locally and, as soon as we're happy with the result, move to a deployment stage where we can apply those tuning tipical of a cloud native environment.

`kamel local` is a command we have used to test an Integration locally in the past. However, it overlaps the effort done by Camel community to have a single CLI used to test locally any Camel application, independently where this is going to be deployed. For this reason we may deprecate it in the near future in favour of `camel` CLI provided by Camel JBang.

# Camel JBang installation

First of all, we need to install and get familiar with `jbang` and `camel` CLIs. You can follow the [official documentation about Camel JBang](/manual/camel-jbang.html) in order to install the CLIs to your local environment. Once this is done, we can see how to test an Integration for Camel K with Camel JBang.

# Simple application development

The first application we develop is a simple one, but it defines the process you should follow when testing any Integration that will be eventually deployed in Kubernetes via Camel K. A good approach is to verify the target version of Camel in your Camel K installation. With this information we'll make sure to test locally against the very same version that we'll be later deploying in a cluster.

```
$ kamel version -a -v | grep Runtime
Runtime Version: 1.15.2

$ kubectl get camelcatalog camel-catalog-1.15.2 -o yaml | grep camel\.version
      camel.version: 3.18.3
```
The commands above are useful to find out what is the Camel version used by the runtime in my cluster Camel K installation. Our target is Camel version 3.18.3. Let's keep this in mind.

The easiest way to initialize a Camel route is to run `camel init` command:

```
$ camel init HelloJBang.java
```

At this stage, we could edit the file with the logic we need for our integration, or, simply run it:

```
$ camel run HelloJBang.java 
2022-11-23 12:11:05.407  INFO 52841 --- [           main] org.apache.camel.main.MainSupport        : Apache Camel (JBang) 3.18.1 is starting
2022-11-23 12:11:05.470  INFO 52841 --- [           main] org.apache.camel.main.MainSupport        : Using Java 11.0.17 with PID 52841. Started by squake in /home/squake/workspace/jbang/camel-blog
2022-11-23 12:11:07.537  INFO 52841 --- [           main] e.camel.impl.engine.AbstractCamelContext : Apache Camel 3.18.1 (CamelJBang) is starting
2022-11-23 12:11:07.675  INFO 52841 --- [           main] e.camel.impl.engine.AbstractCamelContext : Routes startup (started:1)
2022-11-23 12:11:07.676  INFO 52841 --- [           main] e.camel.impl.engine.AbstractCamelContext :     Started java (timer://java)
2022-11-23 12:11:07.676  INFO 52841 --- [           main] e.camel.impl.engine.AbstractCamelContext : Apache Camel 3.18.1 (CamelJBang) started in 397ms (build:118ms init:140ms start:139ms JVM-uptime:3s)
2022-11-23 12:11:08.705  INFO 52841 --- [ - timer://java] HelloJBang.java:14                       : Hello Camel from java
2022-11-23 12:11:09.676  INFO 52841 --- [ - timer://java] HelloJBang.java:14                       : Hello Camel from java
...
```

A local java process will start with a Camel application running. No need to create a Maven project, all the boilerplate is on Camel JBang! However, you may notice that the Camel version used is different from the one we want to target. This is because my Camel JBang is using a different version of Camel. No worry, we can re-run this application but specifying the Camel version we want to run:

```
$ jbang run -Dcamel.jbang.version=3.18.3 camel@apache/camel run HelloJBang.java 
...
[1] 2022-11-23 11:13:02,825 INFO  [org.apa.cam.imp.eng.AbstractCamelContext] (main) Apache Camel 3.18.3 (camel-1) started in 70ms (build:0ms init:61ms start:9ms)
...
```
This is a workaround, as, at the moment, the `camel` CLI has not available that option (yet). This time, we have the correct version running. Let's pretend we're happy with the integration as is. The next step is to run it in a Kubernetes cluster where Camel K is installed.

```
$ kamel run HelloJBang.java --dev
Integration "hello-j-bang" created
...
[1] 2022-11-23 11:13:01,971 INFO  [org.apa.cam.k.Runtime] (main) Apache Camel K Runtime 1.15.2
[1] 2022-11-23 11:13:01,997 INFO  [org.apa.cam.qua.cor.CamelBootstrapRecorder] (main) Bootstrap runtime: org.apache.camel.quarkus.main.CamelMainRuntime
[1] 2022-11-23 11:13:02,000 INFO  [org.apa.cam.mai.MainSupport] (main) Apache Camel (Main) 3.18.3 is starting
[1] 2022-11-23 11:13:02,044 INFO  [org.apa.cam.k.lis.SourcesConfigurer] (main) Loading routes from: SourceDefinition{name='HelloJBang', language='java', type='source', location='file:/etc/camel/sources/HelloJBang.java', }
[1] 2022-11-23 11:13:02,816 INFO  [org.apa.cam.imp.eng.AbstractCamelContext] (main) Apache Camel 3.18.3 (camel-1) is starting
[1] 2022-11-23 11:13:02,824 INFO  [org.apa.cam.imp.eng.AbstractCamelContext] (main) Routes startup (started:1)
[1] 2022-11-23 11:13:02,825 INFO  [org.apa.cam.imp.eng.AbstractCamelContext] (main)     Started java (timer://java)
[1] 2022-11-23 11:13:02,825 INFO  [org.apa.cam.imp.eng.AbstractCamelContext] (main) Apache Camel 3.18.3 (camel-1) started in 70ms (build:0ms init:61ms start:9ms)
[1] 2022-11-23 11:13:02,828 INFO  [io.quarkus] (main) camel-k-integration 1.10.3 on JVM (powered by Quarkus 2.13.4.Final) started in 2.234s. 
[1] 2022-11-23 11:13:02,829 INFO  [io.quarkus] (main) Profile prod activated. 
[1] 2022-11-23 11:13:02,829 INFO  [io.quarkus] (main) Installed features: [camel-bean, camel-core, camel-java-joor-dsl, camel-k-core, camel-k-runtime, camel-kubernetes, camel-timer, cdi, kubernetes-client, security]
[1] 2022-11-23 11:13:03,850 INFO  [java] (Camel (camel-1) thread #1 - timer://java) Hello Camel from java
```

You will see that the Camel K operator will take care to do the necessary transformation and build the Integration and related resources according to the expected lifecycle. Once this is live, you will be able to follow up with the operations you usually do on a deployed Integration.

The benefit of this process is that you don't need to worry about the remote cluster until you're really happy with your Integration tuned locally. Said in other words, you will be able to fine tune your complex Integration while flying back to Europe from last [ApacheCon in New Orleans](http://www.apachecon.com/acna2022/)...

# Fine tuning for Cloud

Once landed and with your Integration ready to rock, you'll need to take care about the kind of tuning related to cluster deployment. Having this separation of concerns is however positive, because you don't need to worry on deployments details at an early stage of the development. Or you can even have a separation of roles in your company where the domain expert may develop the integration locally and the cluster expert may do the deployment at a later stage.

Let's see some example about how to develop an integration that will later need some fine tuning in the cluster. This one is simple but it has certain aspects that will require attention at deployment stage:

```java
import org.apache.camel.builder.RouteBuilder;

public class MyJBangRoute extends RouteBuilder {

    @Override
    public void configure() throws Exception {
        from("file:/tmp/input")
            .convertBodyTo(String.class)
            .log("Processing file ${headers.CamelFileName} with content: ${body}")
            /*
            .filter(simple("${body} !contains 'checked'"))
                .log("WARN not checked: ${body}")
                .to("file:/tmp/discarded")
            .end()
            .to("file:/tmp/output");
            */
            .choice()
                .when(simple("${body} !contains 'checked'"))
                    .log("WARN not checked!")
                    .to("file:/tmp/discarded")
                .otherwise()
                    .to("file:/tmp/output")
            .end();
    }
}
```
There is a process that is in charge to write files into a directory. I need to filter those files based on their content. I've left the code comments on purpose because it was the way I developed iteratively. I tested something locally with Camel JBang, until I come to the final version of the integration. I had tested the [Filter EIP](/components/next/eips/filter-eip.html) but while testing I realized I needed a [Content Based Router EIP](/components/next/eips/choice-eip.html) instead. It should sound a familiar process as it happens probably every time we develop something.

Now that I'm ready, I run a last round of testing locally via Camel JBang:

```
$ jbang run -Dcamel.jbang.version=3.18.3 camel@apache/camel run MyJBangRoute.java 
2022-11-23 12:19:11.516  INFO 55909 --- [           main] org.apache.camel.main.MainSupport        : Apache Camel (JBang) 3.18.3 is starting
2022-11-23 12:19:11.592  INFO 55909 --- [           main] org.apache.camel.main.MainSupport        : Using Java 11.0.17 with PID 55909. Started by squake in /home/squake/workspace/jbang/camel-blog
2022-11-23 12:19:14.020  INFO 55909 --- [           main] e.camel.impl.engine.AbstractCamelContext : Apache Camel 3.18.3 (CamelJBang) is starting
2022-11-23 12:19:14.220  INFO 55909 --- [           main] e.camel.impl.engine.AbstractCamelContext : Routes startup (started:1)
2022-11-23 12:19:14.220  INFO 55909 --- [           main] e.camel.impl.engine.AbstractCamelContext :     Started route1 (file:///tmp/input)
2022-11-23 12:19:14.220  INFO 55909 --- [           main] e.camel.impl.engine.AbstractCamelContext : Apache Camel 3.18.3 (CamelJBang) started in 677ms (build:133ms init:344ms start:200ms JVM-uptime:3s)
2022-11-23 12:19:27.757  INFO 55909 --- [le:///tmp/input] MyJBangRoute.java:11                     : Processing file file_1669202367381 with content: some entry

2022-11-23 12:19:27.758  INFO 55909 --- [le:///tmp/input] MyJBangRoute:21                          : WARN not checked!
2022-11-23 12:19:32.276  INFO 55909 --- [le:///tmp/input] MyJBangRoute.java:11                     : Processing file file_1669202372252 with content: some entry checked
```

I've tested adding files on the input directory and I am pretty fine with it. Ready to promote to my development cluster! As we've seen previously, this should be as easy as running the following command:

```
kamel run MyJBangRoute.java --dev
```

The Integration started correctly, but, wait a minute: we are using a file system that will be local to the `Pod` where the Integration is running, is it what we really need?

## Kubernetes fine tuning

Probably it's not what we wanted. So, now it's turn to configure our application for the cloud. Cloud Native development should take in consideration a series of challenges that are implicit in the way how this new paradigm works (as a reference see the [12 factors](https://12factor.net/)).

Kubernetes could be sometimes a bit difficult to fine tune. Many resources to edit and check. Camel K provide a user friendly way to apply most of the tuning your application will need directly in the `kamel run` command (or in the [modeline](/camel-k/next/cli/modeline.html)). Most of the time you will need to get familiar with [Camel K Traits](/camel-k/next/traits/traits.html).

In this case we want to use certain volumes we had made available in our cluster. We can use the `--volume` option (syntactic sugar of [mount trait](/camel-k/next/traits/mount.html)) and enable them easily. We can read and write on those volumes from some other `Pod`: it depends on the architecture of our Integration process.

```
$ kamel run MyJBangRoute.java --volume my-pv-claim-input:/tmp/input --volume my-pv-claim-output:/tmp/output --volume my-pv-claim-discarded:/tmp/discarded --dev
...
[1] 2022-11-23 11:39:26,281 INFO  [route1] (Camel (camel-1) thread #1 - file:///tmp/input) Processing file file_1669203565971 with content: some entry
[1] 
[1] 2022-11-23 11:39:26,303 INFO  [route1] (Camel (camel-1) thread #1 - file:///tmp/input) WARN not checked!
[1] 2022-11-23 11:39:32,322 INFO  [route1] (Camel (camel-1) thread #1 - file:///tmp/input) Processing file file_1669203571981 with content: some entry checked
```

Probably you will need to iterate this tuning as well, but at least, now that the internals of the route have been polished locally you should be able to focus on deployments aspects only. And, once you're ready with this, have the benefit of `kamel promote` to [move your Integration through various stages of development](/camel-k/next/running/promoting.html).

# How to test Kamelet locally

Another great benefit of Camel JBang is the ability to test a [Kamelet](/camel-k/next/kamelets/kamelets.html) locally. Until now, the easiest possibility to test a Kamelet was to upload to a Kubernetes cluster and to run some Integration using it via Camel K. Not really a quick way to proceed.

Let's develop a simple Kamelet for this scope. It's a Beer source we'll be using to generate random beers events:

```yaml
apiVersion: camel.apache.org/v1alpha1
kind: Kamelet
metadata:
  name: beer-source
  labels:
    camel.apache.org/kamelet.type: "source"
spec:
  definition:
    title: "Beer Source"
    description: "Retrieve a random beer from catalog"
    properties:
      period:
        title: Period
        description: The interval between two events
        type: integer
        default: 1000
  types:
    out:
      mediaType: application/json
  flow:
    from:
      uri: timer:tick
      parameters:
        period: "#property:period"
      steps:
      - to: "https://random-data-api.com/api/beer/random_beer"
      - to: "kamelet:sink"
```
In order to test it, we can use it a very simple Integration to log its content:

```yaml
- from:
    uri: "kamelet:beer-source?period=5000"
    steps:
      - log: "${body}"
```

If we have the Kamelet in the same directory of the Integration, we can run:

```
$ camel run beer-integration.yaml 
2022-11-24 11:27:29.634  INFO 39527 --- [           main] org.apache.camel.main.MainSupport        : Apache Camel (JBang) 3.18.1 is starting
2022-11-24 11:27:29.706  INFO 39527 --- [           main] org.apache.camel.main.MainSupport        : Using Java 11.0.17 with PID 39527. Started by squake in /home/squake/workspace/jbang/camel-blog
2022-11-24 11:27:31.391  INFO 39527 --- [           main] e.camel.impl.engine.AbstractCamelContext : Apache Camel 3.18.1 (CamelJBang) is starting
2022-11-24 11:27:31.590  INFO 39527 --- [           main] org.apache.camel.main.BaseMainSupport    : Property-placeholders summary
2022-11-24 11:27:31.590  INFO 39527 --- [           main] org.apache.camel.main.BaseMainSupport    :     [beer-source.kamelet.yaml]     period=5000
2022-11-24 11:27:31.590  INFO 39527 --- [           main] org.apache.camel.main.BaseMainSupport    :     [beer-source.kamelet.yaml]     templateId=beer-source
2022-11-24 11:27:31.591  INFO 39527 --- [           main] e.camel.impl.engine.AbstractCamelContext : Routes startup (started:2)
2022-11-24 11:27:31.591  INFO 39527 --- [           main] e.camel.impl.engine.AbstractCamelContext :     Started route1 (kamelet://beer-source)
2022-11-24 11:27:31.591  INFO 39527 --- [           main] e.camel.impl.engine.AbstractCamelContext :     Started beer-source-1 (timer://beer)
2022-11-24 11:27:31.591  INFO 39527 --- [           main] e.camel.impl.engine.AbstractCamelContext : Apache Camel 3.18.1 (CamelJBang) started in 1s143ms (build:125ms init:819ms start:199ms JVM-uptime:2s)
2022-11-24 11:27:33.297  INFO 39527 --- [ - timer://beer] beer-integration.yaml:4                  : {"id":3975,"uid":"2df52cb0-ff5a-4c51-b33e-a2c3a65caac5","brand":"Birra Moretti","name":"St. Bernardus Abt 12","style":"English Pale Ale","hop":"Columbus","yeast":"5526 - Brettanomyces lambicus","malts":"Roasted barley","ibu":"41 IBU","alcohol":"2.1%","blg":"15.0°Blg"}
```
This is really a boost while you are programming a Kamelet, because you can have a very quick feedback without the need of a cluster. Once ready, you will be able to continue your development as usual uploading the Kamelet to the cluster and using in your Camel K integrations.

# Conclusion

With this blog post I have tried to provide some guidelines when it comes to the question: "How to test an Integration for Camel K?". There is not always a direct answer as it may depends on many factors. However, we see that the usage of Camel JBang is emerging as a way to support Camel K as well. In particular we've seen that separating the test of the Integration logic from the test of the "deployment" logic, may result beneficial as we'll be focusing on a single concern at a time.

