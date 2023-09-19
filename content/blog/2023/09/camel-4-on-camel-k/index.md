---
title: "Camel 4 on Camel K"
date: 2023-09-19
draft: false
authors: [squakez]
categories: ["Releases", "Camel K", "Roadmap"]
preview: "Camel K Runtime 3.2.0 release, aka, how to run Camel 4 with Camel K."
---

This blog announce the availability of Camel K Runtime version 3.2.0 which will gives you the possibility to run **Camel 4 workloads on Kubernetes with Camel K**.

# Release details

* Apache Camel K Runtime 3.2.0
* Apache Camel Quarkus 3.2.0
* Apache Camel 4.0.0

# How to run Camel 4 with Camel K

If you are on Camel K 2.0, this is quite straightforward. If you recall, one of the major feature of version 2 is the ability to run any Camel K runtime. Here we are collecting the first fruits of that hard work of code refactoring.

```
kamel run test.yaml -t camel.runtime-version=3.2.0
kamel logs test
...
[1] 2023-09-19 08:51:59,475 INFO  [org.apa.cam.k.Runtime] (main) Apache Camel K Runtime 3.2.0
[1] 2023-09-19 08:51:59,496 INFO  [org.apa.cam.qua.cor.CamelBootstrapRecorder] (main) Bootstrap runtime: org.apache.camel.quarkus.main.CamelMainRuntime
[1] 2023-09-19 08:51:59,498 INFO  [org.apa.cam.mai.MainSupport] (main) Apache Camel (Main) 4.0.0 is starting
[1] 2023-09-19 08:51:59,475 INFO  [org.apa.cam.k.Runtime] (main) Apache Camel K Runtime 3.2.0
[1] 2023-09-19 08:51:59,496 INFO  [org.apa.cam.qua.cor.CamelBootstrapRecorder] (main) Bootstrap runtime: org.apache.camel.quarkus.main.CamelMainRuntime
[1] 2023-09-19 08:51:59,498 INFO  [org.apa.cam.mai.MainSupport] (main) Apache Camel (Main) 4.0.0 is starting
...
```

There may be a little caveat if you're running the Camel K 2 default configuration. As the default for this version is a previous version of Camel which was running on top of Java 11, now you need to create your Camel 4 integration based on a JDK 17 image. It's quite simple by changing the IntegrationPlatform base image parameter, ie:

```
kamel install --skip-operator-setup --base-image eclipse-temurin:17 --force
```

NOTE: you can use any other JDK 17 image if you prefer.

## Known limitations

The runtime we use is Camel Quarkus 3.2, which is based on Camel 4. Unfortunately we have discovered a last minute bug on the [Camel dependencies which is not making possible to run Kotlin DSL](https://github.com/apache/camel-k/issues/4738). If this is a requirement, we suggest not to switch yet to the new runtime and await next available version (probably any runtime based on Camel 4.0.1 or 4.1.0).

# Thanks

Thanks a lot to our contributors and the hard work happening in the community. Feel free to provide any feedback or comment using the Apache Camel available channels.

