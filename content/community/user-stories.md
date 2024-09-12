---
title: "User Stories"
---

This page is intended as a place to collect user stories and feedback on Apache Camel. If you are using or have tried Apache Camel please add an entry or comment; or post to the mailing list.

{{< table >}}
| Company, Product, or Project  | Description |
|-------------------------------|------------|
|[Alpakka](https://github.com/akka/alpakka)|Alpakka uses Apache Camel to implement additional messaging interfaces for [actors](https://doc.akka.io/docs/akka/current/typed/actors.html). Any Camel [component](../../components/next/index.html) can be used to send and receive messages from Akka actors. For details, refer to the [documentation](https://doc.akka.io/docs/alpakka/current/external/apache-camel.html) of the extension module.|
|[Apache ActiveMQ](http://activemq.apache.org)|Uses Camel to add [Enterprise Integration Patterns](../../components/next/eips/enterprise-integration-patterns.html) support into the [ActiveMQ broker](http://activemq.apache.org/enterprise-integration-patterns.html). If you run an out-of-the-box classic ActiveMQ broker, look at `conf/camel.xml` and you'll see &lt;camelContext&gt; with some example routing rules. Can be used to bridge ActiveMQ with any of the camel [Components](../../manual/component.html).|
|[Apache Ignite](https://ignite.apache.org/)|Apache Ignite In-Memory Data Fabric is a high-performance, integrated and distributed in-memory platform for computing and transacting on large-scale data sets in real-time, orders of magnitude faster than possible with traditional disk-based or flash technologies.It uses Camel for its universal streamer.|
|[Apache ServiceMix](https://servicemix.apache.org/home.html)|Uses Camel as a routing engine. |
|[APIPass](https://apipass.com.br/)|Provides an Integration Platform as a Service (iPaaS) built on Apache Camel. |
|[Arla Foods](https://www.arla.com)|Uses Camel to integrate business backend with web application for farmers to access information about quality of their delivered milk. Application used in numerous european countries.|
|[Assimbly Gateway](https://github.com/assimbly/gateway)|A message gateway based on Apache Camel|
|[Babel](https://crossing-tech.github.io/babel)|Babel is a Domain-Specific Language for Integration made in Scala. It provides an elegant API to use well-known integration frameworks. Babel provides an API on top of Apache Camel which may be used in Scala.|
|[Bloomreach Forge](https://bloomreach-forge.github.io/)|The Apache Camel - Hippo Events Support uses Apache Camel for handling events provide richer integration with HippoCMS/Repository.|
|[Camel Extra project](https://camel-extra.github.io/)|contains a number of extension components which due to GPL/LGPL licensing cannot be hosted at Apache.
|[Camel-graph](https://github.com/avvero/camel-graph)|Camel-graph is a route graph viewer for ServiceMix and Camel applications, visualising your route topologies with metrics.|
|[GraphAware Hume Orchestra](https://graphaware.com/products/hume/)|Integration framework built on top of Apache Camel, making as easy as simple clicks.| ** added in MD ***
|[Guidewire Integration Framework](https://www.guidewire.com/blog/technology/cloud-integration-framework-the-right-tools-for-the-job/)| Integration Gateway is an open framework for developing integration apps that bridge Guidewire APIs with external apps and services. It is based on Apache Camel.|
|[Huawei Cloud ROMA](https://www.huaweicloud.com/intl/en-us/solution/roma/)|Apache camel powers the runtime engine for [Huawei Cloud ROMA](https://www.huaweicloud.com/en-us/product/roma.html) which is a commercial iPaaS offering by Huawei Cloud. ROMA integrates data, services, messages and devices under one unified platform which enables its customers to hook up systems spanning across multiple Paas, Saas and cloud services.|
|[IPF Open eHealth Integration Platform](https://oehf.github.io/ipf-docs/)|The Open eHealth Integration Platform (IPF) is an extension of the Apache Camel routing and mediation engine. It has an application programming layer based on the Groovy programming language and comes with comprehensive support for message processing and connecting systems in the eHealth domain.|
|[Islandora Alpaca](http://islandora.ca)|Islandora created Alpaca, an open-source software framework designed to help institutions and organizations and their audiences collaboratively manage, and discover digital assets using a best-practices framework. They use Camel and JMS queues in the platform.|
|[JBoss ESB](https://jbossesb.jboss.org/jbossesb)|JBoss ESB integrates with Camel.|
|[JBoss SwitchYard](https://switchyard.jboss.org)|SwitchYard is a lightweight service delivery framework for SOA and its integrated with Camel out of the box.|
|[JOnAS Application Server](https://jonas.ow2.org/view/Documentation/JOnAS%20Camel)|JOnAS Application Server integrates with Camel.|
|[Kogito](https://kogito.kie.org)|Kogito serverless workflow can integrate with Camel.|
|[Mifos](https://mifos.org/)|An [open core-banking platform](https://github.com/openMF), uses Camel.|
|[Multi-Channel Framework (MCF)](https://www.felpfe.com/multi-channel-framework-mcf/)| MCF utilizes Camel to provide developers with an empowering framework, enabling them to create, test, and deploy integration scenarios intuitively, without the need for extensive coding. By leveraging the robust capabilities of Apache Camel, MCF streamlines the development workflow, reducing complexity and the reliance on manual coding. Its configuration-driven approach facilitates seamless integration using Camel, allowing developers to achieve their goals with minimal coding effort.|
|[Netflix](https://www.youtube.com/watch?v=k_ckJ7QgLW0#t=480)|Netflix uses Apache Camel as part of the cloud payment system.|
|[OpenHub](http://www.openhub.cz)|OpenHub is an integration platform that is built on top of Apache Camel.|
|[OpenNMS](https://www.opennms.com/)|Enterprise-Grade Open-Source Network Management Platform [uses](https://github.com/OpenNMS/opennms) Apache Camel.|
|[PortX](https://portx.io/products/fintech-hub/connectivity-as-a-service/)|PortX, the Integration Platform as a Service (IPaaS) for financial institutions, is built on the open source Apache Camel framework.|
|[Rayvens](http://ibm.biz/rayvens) | Built on Apache Camel, Rayvens enables data scientists to interface with hundreds of data services with little effort to consume, process, and produce events and data in real time. |
|[Red Hat integration](https://www.redhat.com/en/technologies/jboss-middleware/fuse)|Red Hat provides a commercial distribution of an ESB which includes Camel, ActiveMQ, CXF, ServiceMix, Karaf, [Fabric8](http://fabric8.io), and [Hawtio](http://hawt.io).|
|[SAP HANA](https://www.linkedin.com/pulse/hana-smart-data-integration-simplifies-connecting-facebook-shankar/)| The platform from SAP uses Apache Camel.|
|[SAP Integration Suite](https://www.sap.com/products/technology-platform/integration-suite.html)| The Cloud Integration capability of SAP's iPaaS product uses Apache Camel.
|[Streamz](https://github.com/krasserm/streamz)|A combinator library for integrating Functional Streams for Scala (FS2), Akka Streams and Apache Camel.|
|[Wildfly Camel](https://github.com/wildflyext/wildfly-camel)|The WildFly-Camel Subsystem allows you to add Camel Routes as part of the WildFly configuration. Routes can be deployed as part of JavaEE applications. JavaEE components can access the Camel Core API and various Camel Component APIs. Your Enterprise Integration Solution can be architected as a combination of JavaEE and Camel functionality.|
{{< /table >}}

## Developer Tooling
{{< table >}}
| Company, Product, or Project  | Description |
|-------------------------------|-------------|
|[API Tracker 4j](https://abi-laboratory.pro/java/tracker/timeline/camel-core) of camel-core|The review of API changes for the Camel Core library since Camel 2.16 which is updated several times per week.|
|[Apache Camel IDEA Plugin](https://github.com/camel-idea-plugin/camel-idea-plugin)|Plugin for Intellij IDEA to provide a set of Apache Camel related editing capabilities to the code editor. It also provides Camel textual route debugging capabilities.|
|[Axiom](http://github.com/hyperthunk/axiom)|Axiom is is a framework for testing integration scenarios and uses Apache Camel to interact with your integration stack.|
|[Camel Debug Adapter](https://github.com/camel-tooling/camel-debug-adapter) | A server implementation of the [Debug Adapter Protocol](https://microsoft.github.io/debug-adapter-protocol/) that provides Camel textual route debugging capabilities. It is packaged for [VS Code](https://marketplace.visualstudio.com/items?itemName=redhat.vscode-debug-adapter-apache-camel) and [Eclipse Desktop IDE](https://marketplace.eclipse.org/content/textual-debugging-apache-camel). it can be embedded in several [other editors and IDEs](https://microsoft.github.io/debug-adapter-protocol/implementors/tools/).|
|[Camel Designer](https://marketplace.visualstudio.com/items?itemName=brunoNetId.camel-designer)| Visual designer generating Camel XML routes.|
|[Camel Language Server](https://github.com/camel-tooling/camel-language-server)| A server implementation of the [Language Server protocol](https://github.com/Microsoft/language-server-protocol) that provides Camel DSL smartness (completion, validation, hover, outline). It is packaged for [VS Code](https://marketplace.visualstudio.com/items?itemName=redhat.vscode-apache-camel), [Eclipse Desktop IDE](https://marketplace.eclipse.org/content/language-support-apache-camel) and [Eclipse Che](https://www.eclipse.org/che/). It can be embedded in several [other editors and IDEs](https://github.com/camel-tooling/camel-language-server#clients).|
|[CamelDiagramGenerator](http://code.google.com/p/rmannibucau/wiki/CamelDiagramGenerator)|A maven plugin to generate camel diagram from routes.|
|[Camelry](https://github.com/AlanFoster/Camelry)|This IntelliJ plugin is designed to improve the development experience when working with Apache Blueprint, Apache karaf and Apache Camel.|
|[Eclipse Desktop Tools for Apache Camel](http://tools.jboss.org/features/fusetools.html)|Red Hat provides developer tooling for Camel, ActiveMQ, ServiceMix, Karaf, CXF, and [Fabric8](http://fabric8.io). The tools are a set of Eclipse plugins, such as a graphical Camel editor and also includes a Camel route debugger, where you can set breakpoints in your routes.|
|[Fabric8](http://fabric8.io)|Fabric8 is an open source integration platform, allow to run Camel applications anywhere; whether its on-premise or in the cloud.|
|[JBoss Forge](http://forge.jboss.org)|The [Camel](http://forge.jboss.org/addon/io.fabric8.forge:camel) addon from [Fabric8](http://fabric8.io) allows to setup and manage your Apache Camel maven projects from a CLI, Eclipse, IDEA, and NetBeans. With this addon from the IDEs you can use a wizard driven UI to add new Camel components, add/edit existing endpoints in a UI that allows to edit each options individually in a more type safe manner. You can also setup your Maven project for Docker and Kubernetes platforms.|
|[JRebel](http://zeroturnaround.com/software/jrebel)|JRebel now supports [reloading](http://zeroturnaround.com/jrebel/jrebel-5-1-2-released-apache-camel-now-supported) Camel routes without any application server restarts.|
|[Jel](http://giacomolm.github.io/Jel)|Javascript graphical Editor that generates DSL. This is a web based tooling that offers a GUI for defining and editing Apache Camel routes using the XML DSL.|
|[Kaoto](https://kaoto.io/)|Kaoto is an integration editor to create and deploy workflows in a visual, low-code way; with developer-friendly features like a code editor and deployments to the cloud. Kaoto augments user productivity via Apache Camel: it accelerates new users and helps experienced developers.|
|[Syndesis](https://syndesis.io)|Syndesis is for anyone that wants to integrate services. Syndesis includes a swish UI that enables the user to design integration flows and manage them from their browser.No coding required… Unless you really want to and then Syndesis allows you to dive into the code, develop your own connectors (if one doesn’t already exist), or hack on the integration definition directly.|
|[VS Code extension pack for Camel](https://marketplace.visualstudio.com/items?itemName=redhat.apache-camel-extension-pack)|It provides a set of tools to develop Camel applications.|
|[hawt.io](http://hawt.io)|hawt.io is an open source HTML5 web application for visualizing, managing and tracing Camel routes &amp; endpoints, ActiveMQ brokers, JMX, OSGi, logging, and much more.|
{{< /table >}}

## User Groups

{{< table >}}
| User Groups  | Description |
|--------------|-------------|
|[Apache Camel LinkedIn Group](https://www.linkedin.com/groups/2447439/)|The Apache Camel group on LinkedIn.|
|[Apache Camel User Group Denmark](https://groups.google.com/group/camel-user-group-denmark)|A danish user group for Apache Camel.|
|[Apache Camel User Group Japan](https://jcug-oss.github.io/)|A Japanese user group for Apache Camel.|
|[Apache Camel User Group São Paulo](https://www.linkedin.com/groups/8893741/)|A brazilian user group on LinkedIn.|
|[Apache Camel User Group Tunisia](http://groups.google.com/group/apache-camel-user-group-tunisia)|A tunisian user group for Apache Camel.|
{{< /table >}}

## External Camel Components

{{< table >}}
| External Camel Components  | Description |
|----------------------------|-------------|
|[camel-openhtmltopdf](https://github.com/elevation-solutions/camel-openhtmltopdf)|A Camel component to generate nice looking PDF files from HTML, CSS, images, etc.|
|[camel-xtrasonnet](https://jam01.github.io/xtrasonnet/camel/)|xtrasonnet is an extensible, jsonnet-based, data transformation engine for Java or any JVM-based language. The Camel xtrasonnet component enables the use of xtrasonnet transformations as Expressions or Predicates in the DSL.|
{{< /table >}}
