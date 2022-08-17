---
Title: "Documentation"
---
{{< div "box left" >}}

<a href="/manual/" class="icon" title="Camel User Manual">{{< icon "logo-d" "Apache Camel logo" >}}</a>

{{< div "content" >}}

## Camel Core

The [User Manual](/manual/) is a comprehensive guide meant to help you with the key concepts of Apache Camel and software integration, from how to [get started](/manual/getting-started.html) with Apache Camel, how to [upgrade to Camel 3.x](/manual/camel-3x-upgrade-guide.html), to [architecture](/manual/architecture.html) or [integration patterns](/components/latest/eips/enterprise-integration-patterns.html).

<p>
<a class="button dark" href="/manual/">Documentation</a>
<a class="button light" href="https://github.com/apache/camel/">Source</a>
<a class="button light" href="https://github.com/apache/camel-examples">Examples</a>
</p>


Camel is packed with several hundred components that are used to access databases, message queues and APIs. The [Component reference](/components/latest/) provides you information about the functionality and configuration of each component.

<p>
<a class="button dark" href="/components/latest/">Component Reference</a>
<a class="button light" href="https://www.javadoc.io/doc/org.apache.camel/camel-api/latest/index.html">API Documentation</a>
</p>

{{< /div >}}

{{< /div >}}

{{< div "box right" >}}

{{< div "content">}}

## Camel K

Apache Camel K is a lightweight integration framework built on Apache Camel that runs natively on [Kubernetes](https://kubernetes.io/) and is specifically designed for serverless and micro service architectures. It allows you to run integration code written in Camel DSL on your cloud.

<p>
<a class="button dark" href="/camel-k/latest/">Documentation</a>
<a class="button light" href="https://github.com/apache/camel-k/">Source</a>
<a class="button light" href="https://github.com/apache/camel-k-examples">Examples</a>
</p>

Apache Camel K now leverages a catalog of connectors called "Kamelets" (_Kamel_ route snipp_ets_) that allow creating sources or sinks towards external systems via a
simplified interface, hiding all the low level details about how those connections are implemented.

<p>
<a class="button dark" href="/camel-kamelets/latest/">Kamelet Catalog</a>
</p>

{{< /div >}}

<a href="/camel-k/latest/" class="icon" title="Camel-K Manual ">{{< icon "logo-d" "Apache Camel logo" "knative" "KNative logo" >}}</a>

{{< /div >}}

{{< div "box left" >}}

<a href="/camel-kafka-connector/latest/" class="icon" title="Camel Kafka Connector Manual ">{{< icon "logo-d" "Apache Camel logo" "apache-kafka" "Apache Kafka logo" >}}</a>

{{< div "content">}}

## Camel Kafka Connector

Camel Kafka Connector allows you to use all [Camel components](/components/latest/) as [Kafka Connect](http://kafka.apache.org/documentation/#connect) connectors, which, as a result, expands Kafka Connect compatibility by allowing Camel components to be used in the Kafka ecosystem.

<p>
<a class="button dark" href="/camel-kafka-connector/latest/">Documentation</a>
<a class="button light" href="https://github.com/apache/camel-kafka-connector/">Source</a>
<a class="button light" href="https://github.com/apache/camel-kafka-connector-examples/">Examples</a>
</p>

{{< /div >}}

{{< /div >}}

{{< div "box right" >}}

{{< div "content">}}

## Camel Quarkus

This project hosts the efforts to port and package the 280+ Camel components as Quarkus extensions. [Quarkus](https://quarkus.io/) is a Java platform offering fast boot times and low memory footprint. It targets both stock JVMs and GraalVM.

<p>
<a class="button dark" href="/camel-quarkus/latest/">Documentation</a>
<a class="button light" href="https://github.com/apache/camel-quarkus/">Source</a>
<a class="button light" href="https://github.com/apache/camel-quarkus-examples/">Examples</a>
</p>

{{< /div >}}

<a href="/camel-quarkus/latest/" class="icon" title="Camel Quarkus Manual ">{{< icon "logo-d" "Apache Camel logo" "quarkus" "Quarkus logo" >}}</a>

{{< /div >}}

{{< div "box left" >}}

<a href="/camel-spring-boot/latest/" class="icon" title="Camel Spring Boot latest documentation">{{< icon "logo-d" "Apache Camel logo" "spring-boot" "Spring Boot logo" >}}</a>

{{< div "content">}}

## Camel Spring Boot

Camel support for Spring Boot provides auto-configuration of the Camel context by auto-detecting Camel routes available in the Spring context and registers the key Camel utilities as beans. It also provides starters for many Camel components.

<p>
<a class="button dark" href="/camel-spring-boot/latest/">Documentation</a>
<a class="button light" href="https://github.com/apache/camel-spring-boot">Source</a>
<a class="button light" href="https://github.com/apache/camel-spring-boot-examples">Examples</a>
</p>

{{< /div >}}

{{< /div >}}

{{< div "box right" >}}

{{< div "content">}}

## Camel Karaf

[Apache Karaf](https://karaf.apache.org/) makes running Apache Camel in [OSGi](https://www.osgi.org/) container easy, which as a result, expands Apache Camel's compatibility by allowing Camel components to run in the OSGi environment.

<p>
<a class="button dark" href="/camel-karaf/latest/">Documentation</a>
<a class="button light" href="https://github.com/apache/camel-karaf">Source</a>
<a class="button light" href="https://github.com/apache/camel-karaf-examples">Examples</a>
</p>

{{< /div >}}

<a href="/camel-karaf/latest/" class="icon" title="Camel Karaf Manual ">{{< icon "logo-d" "Apache Camel logo" "apache-karaf" "Apache Karaf logo" >}}</a>

{{< /div >}}

{{< div "box left" >}}

<a class="icon" title="Camel Karavan latest documentation">{{< icon "logo-d" "Apache Camel logo" "karavan" "Karavan logo" >}}</a>

{{< div "content">}}

## Camel Karavan

An Integration Toolkit aimed to increase developer performance through a graphical user interface to design and configure routes (EIP and REST) using Kamelets and Components, integration with runtimes and package, image build and deploy to Kubernetes out-of-the-box.

Being deployed in Kubernetes Karavan in cloud-native mode helps to manage projects, design and monitor integrations, Tekton pipeline to build and deploy integrations.

[Karavan VS Code Extension](https://marketplace.visualstudio.com/items?itemName=camel-karavan.karavan) is integrated with [Camel Jbang](/manual/camel-jbang.html) runtime for fast local development cycles.

<p>
<!-- <a class="button dark" href="/camel-karavan/latest/">Documentation</a> -->
<a class="button light" href="https://github.com/apache/camel-karavan">Source</a>
<a class="button light" href="https://github.com/apache/camel-karavan/tree/main/karavan-demo">Examples</a>
</p>

{{< /div >}}

{{< /div >}}

{{< div "box right" >}}

{{< div "content">}}

## Camel JBang

Camel CLI (Command Line Interface) to easily install and get started with Apache Camel,
in only a few minutes. Camel JBang is excellent for no-code/low-code use-cases and
when you need to quickly build a prototype with Camel.

<p>
<a class="button dark" href="/manual/camel-jbang.html">Documentation</a>
<a class="button light" href="https://github.com/apache/camel/tree/main/dsl/camel-jbang">Source</a>
<a class="button light" href="https://github.com/apache/camel-kamelets-examples/tree/main/jbang">Examples</a>
</p>

{{< /div >}}

<a href="/manual/camel-jbang.html" class="icon" title="Camel JBang ">{{< icon "logo-d" "Apache Camel logo" "jbang" "JBang logo" >}}</a>

{{< /div >}}
