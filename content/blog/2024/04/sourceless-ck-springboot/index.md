---
title: "Camel K runtimes with Knative"
date: 2024-04-02
draft: false
authors: [squakez]
categories: ["Camel K", "Howtos"]
preview: "Build an external Camel application and run Camel Spring Boot runtime via Camel K as a Knative Service."
---

In the last 2.2.0 version release, Camel K added an interesting feature that gave the users the possibility to build their Camel application externally and run via the operator with certain limitations. In this blog we're trying to analyze those limitations and provide some example that will show you how to possibly leverage this feature.

## What is a "sourceless" Integration?

With a great effort of creativity (sarcasm), we have named this feature as **"sourceless" Integration**. The idea is that these kind of Integrations don't come with a source code as it happens with the regular Camel K Integrations because they have been built externally. Everything is already bundled into a container image. The operator cannot inspect the source code in order to perform certain operations (mostly build-time operations), however it can still offer its capability of deployment and monitoring. This is an example of these Integrations:

```yaml
apiVersion: camel.apache.org/v1
kind: Integration
metadata:
  annotations:
    camel.apache.org/operator.id: camel-k
  name: test
spec:
  traits:
    container:
      image: docker.io/my-org/my-camel-app:1.0.0
```

See more detail in the official [Camel K runtimes documentation](/camel-k/next/running/camel-runtimes.html). The nice thing is that with this approach you will be able to run **Camel Quarkus**, **Camel Spring Boot** and **Camel Main** runtimes from Camel K operator.

As we mentioned at the beginning, there are certain limitations you need to take in consideration. In the linked documentation you can see there is a matrix of traits and at what lifecycle stage of an Integration they are executed. A sourceless Integration will only be able to use "deployment" traits out of the box, that means, those aspects that are executed when the Integration is deployed to Kubernetes.

## How to run it

A **sourceless Integration** is built by the user. The operator does not care how this is built. What it needs to know is the final container image. Let's see an example in action in order to show how the Camel K operator will be able to leverage at least "deployment" traits and simplify certain operational aspects on Kubernetes. The list of trait you can use is available in [Camel K runtimes documentation](/camel-k/next/running/camel-runtimes.html).

We will build a simple REST Camel application and we want to leverage **Knative** in order to **scale to 0** if no traffic happens on the route. Without the Camel K operator, you'd be needed to manage all the Knative resources on your own. The operator will instead do all the heavy lift for you.

In order to prototype the application locally we'll use **Camel JBang** and when we're happy we'll be publishing this into the container registry used by Camel K operator.

> The entire building and publishing process can be substituted by a more formal CICD process. For simplicity reason we've preferred the local prototyping approach.

### Create the application

Let's create a Java application with a single endpoint:

```java
import org.apache.camel.builder.RouteBuilder;

public class PlatformHttpServer extends RouteBuilder {
  @Override
  public void configure() throws Exception {
    from("platform-http:/hello?httpMethodRestrict=GET").setBody(simple("Hello ${header.name}"));
  }
}
```

Thanks to Camel JBang, we can quickly run it locally and validate the prototype:

```
camel run PlatformHttpServer.java
```

In a separate shell:

```
$ curl localhost:8080/hello --header 'name: world'
Hello world
```

It works good enough to proceed to next step.

### Publish the application

Let's leverage the Camel JBang capabilities now to export the application in our runtime of choice, say, Camel Spring Boot:

```
$ camel export PlatformHttpServer.java --runtime spring-boot --gav org.acme:my-csb:1.0.0 --dir csb
```

In the `csb` directory, we'll have the exported Maven project. Let's build and run this as well. We should expect the same result, but, this time, with a Spring Boot application.

```
$ mvn clean package
...
$ java -jar target/my-csb-1.0.0.jar
...
2024-04-02T12:49:38.492+02:00  INFO 547806 --- [           main] org.acme.mycsb.CamelApplication          : Started CamelApplication in 3.684 seconds (process running for 4.121)
...
$ curl localhost:8080/hello --header 'name: world'
Hello world
```

As we have no surprises, let's put this into a container and publish the the same registry used by Camel K on Kubernetes. We need to create a Dockerfile:

```
FROM eclipse-temurin:17
COPY --chown=185 target/my-csb-1.0.0.jar /deployments/my-camel-app.jar
CMD java -jar /deployments/my-camel-app.jar
```

We can now use this manifest to build and push the container to our registry (in my case a local registry hosted on 10.103.186.147):

```
docker build -t 10.103.186.147/default/csb .
docker push 10.103.186.147/default/csb
```

### Operate the application

We are now in the position to operate the application with Camel K. The goal is to take care of the deployment. As this is a Knative, it will run the related traits required to run a `KnativeService` instead of a regular `Deployment` and scale to 0 when there is no traffic:

```
$ kamel run --image 10.103.186.147/default/csb
...
[1] 2024-04-02T11:00:14.950Z  INFO 7 --- [           main] org.acme.mycsb.CamelApplication          : Started CamelApplication in 3.239 seconds (process running for 3.7)
```

We can now start **monitoring the applications** and see if it really scale to 0 after some time of inactivity:

```
$ kubectl get it -w
NAME   PHASE     [...] KIT       REPLICAS
csb    Running   [...] kit-csb   1
csb    Running   [...] kit-csb   0
```

It really does. Let's try to send some traffic now and see if it correctly wake up and respond as expected. I am running this test in a local environment, so, I'm going to use the operator Pod as a bridge for testing. In a real connected cluster, you should be able to use the service URL out of the box.

```
$ kubectl -it exec camel-k-operator-5f77f8976b-qgknm -- curl http://csb.default.svc.cluster.local/hello --header 'name: CSB'
Hello CSB
```

As the application was scaled to 0, the first time we are calling this will take a few more seconds than normally because it will require the time to start it up again. However, in general, you have seen the possibility offered by the operator also when running applications which are built externally.