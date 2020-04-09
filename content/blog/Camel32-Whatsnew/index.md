---
title: "Apache Camel 3.2 What's New"
date: 2020-04-09
authors: [davsclaus]
categories: ["Releases"]
preview: Details of what we have done in the Camel 3.2 release.
---

A few days ago Apache Camel 3.2 was released. This is a continuation of the work we are doing on Camel leading up to the first long term support release (LTS) that would be either Camel 3.3 or 3.4.

In case you have missed this, the release model in Camel 3.x is following the principe of LTS and non-LTS releases (like Java JDKs). For more details see this [blog post](https://camel.apache.org/blog/LTS-Release-Schedule/).

What this means is that we will not do patch releases for Camel 3.2.x, but move ahead for Camel 3.3.

### So whats in this release?

We continued our work on making camel core smaller and faster. We managed to modularize the core a bit more. For example JAXB is now 99% separated and only in use when needed (XML). We missed one piece so its 99% and not 100%, but we have corrected this for Camel 3.3.0.

There is also a lighter XML route loader that does not use JAXB and is much faster and lighter.
See this [external blog post](http://www.davsclaus.com/2020/03/apache-camel-31-fast-loading-of-xml.html) for more details.

Another work is to make Camel reflection free (99%). We now source code generate configurer classes that is capable of configuring and setting properties on all components, data formats, and other areas in Camel. We missed some parts of Rest-DSL and Circuit Breakers which has been implemented for Camel 3.3. See this [external blog post](http://www.davsclaus.com/2020/03/apache-camel-32-reflection-free.html) for more details.

Camel core has also been further optimize to do more of its bootstrapping in an earlier phase where pssible. This makes Camel faster and ligther on Quarkus and GraalVM. This work will continue in the next release, as there are some Camel components that can be optimized more as well.

There is an ongoing experiment for a lightweight CamelContext that is locked-down and immutable which is an effort to make Camel even quicker and faster for Quarkus and GraalVM; where dynamism at runtime is not needed (for example adding new routes).

We also did some internal optimizations around creating endpoints and avoid excessive URI parsing and normalization. This makes Camel faster at runtime when using dynamic endpoints.

There were also some optimizations in the type converter and inners of Camel that makes Camel quicker and reduced number of methods executed during routing.

Configuring Camel via Camel Main (standalone), Quarkus, Spring Boot etc via application.properties now allows to configure using wildcards (*) to configure bulk components. For example to specify AWS credential on all AWS components.

The `@ProjectInject` annotation is now capable of auto creating POJO beans from external configurations and inject into your code. The use-cases are for configurations where you want both external configurations and code; for example:

```java
@BindToRegistry
public static AmazonS3 minioClient(
        @PropertyInject("minio") MinioConfig config) {

    var endpoint = new AwsClientBuilder.EndpointConfiguration(config.getAddress(), "US_EAST_1");
    var credentials = new BasicAWSCredentials(config.getAccessKey(), config.getSecretKey());
    var credentialsProvider = new AWSStaticCredentialsProvider(credentials);

    return AmazonS3ClientBuilder
        .standard()
        .withEndpointConfiguration(endpoint)
        .withCredentials(credentialsProvider)
        .withPathStyleAccessEnabled(true)
        .build();
}
```

And `minio` is a POJO class that is configured with options from `application.properties`:

```
minio.address = http://my-minio.com
minio.access-key = ...
minio.secret-key = ...
```

All the components now include all their options that can be configured (incl nested). Before these options was only available when using Camel on Spring Boot. They are now generally available and can therefore be configured everywhere, such as Camel Main, Camel Quarkus, Camel Kafka Connector, and via Component DSL. 

And we have also done other internal refactorings that allows GraalVM to do more dead-code elimination and can reduce the number of classes loaded. Together with all the other changes we see some use-cases a great reduction in the binary image size after the native compilation. We will continue this work for Camel 3.3.

All the AWS components is now completed as a set of components that uses the AWS JDK v2 library.

Running Camel on OSGi with Apache Karaf has been moved out to its own sub-project camel-karaf.
This has been done for other runtimes as well such as Spring Boot or Quarkus.

And then all the usual stuff with 3rd party dependency upgrades, new components, and other improvements.

But in this blog we wanted to spill out details about the heavy work that are ongoing to make Camel awesome for today and tomorrows modern Java workloads.

PS: And we have also worked on the website, which keep getting better and better.
