---
title: "User Stories"
---

This page is intended as a place to collect user stories and feedback on Apache Camel. If you are using or have tried Apache Camel please add an entry or comment; or post to the mailing list.

{{< table >}}
| Company, Product, or Project  | Description |
|-------------------------------|------------|
|[Apache ActiveMQ](http://activemq.apache.org)|Uses Camel to add [Enterprise Integration Patterns](../../components/next/eips/enterprise-integration-patterns.html) support into the [ActiveMQ broker](http://activemq.apache.org/enterprise-integration-patterns.html). If you run an out of the box ActiveMQ broker, look in *conf/camel.xml* and you'll see &lt;camelContext&gt; with some example routing rules. Can be used to bridge ActiveMQ with any of the camel [Components](../../manual/component.html).|
|[Apache ServiceMix](https://servicemix.apache.org/home.html)|Uses Camel as a routing engine. |
|[Apache Ignite](https://ignite.apache.org/)|Apache Ignite In-Memory Data Fabric is a high-performance, integrated and distributed in-memory platform for computing and transacting on large-scale data sets in real-time, orders of magnitude faster than possible with traditional disk-based or flash technologies.It uses Camel for its universal streamer.|
|[Red Hat integration](https://www.redhat.com/en/technologies/jboss-middleware/fuse)|Red Hat provides a commercial distribution of an ESB which includes Camel, ActiveMQ, CXF, ServiceMix, Karaf, [Fabric8](http://fabric8.io), and [Hawtio](http://hawt.io).|
|[Open eHealth Integration Platform](https://openehealth.org/display/ipf2/Home)|The Open eHealth Integration Platform (IPF) is an extension of the Apache Camel routing and mediation engine. It has an application programming layer based on the Groovy programming language and comes with comprehensive support for message processing and connecting systems in the eHealth domain.|
|[Camel SOAP](https://code.google.com/p/camel-soap)|Zero code WSDL based SOAP Client component for Apache Camel.|
|[PrismTech](https://www.opensplice.com/section-item.asp?id=964)|PrismTech Simplifies Systems Integration &amp; SOA Connectivity with Release of Open Source OpenSplice DDS Connector for Apache Camel.|
|[Capital Region of Denmark](https://www.regionh.dk/English/English.htm)|Chose to switch proprietary ESB to open source Apache Camel.|
|[Arla Foods](https://www.arla.com)|Uses Camel to integrate business backend with web application for farmers to access information about quality of their delivered milk. Application used in numerous european countries.|
|[Akka](https://akkasource.org)|Akka uses Apache Camel to implement additional messaging interfaces for [actors](https://doc.akkasource.org/actors). Any Camel [component](../../components/next/index.html) can be used to send and receive messages from Akka actors. For details refer to the documentation of the [akka-camel](https://doc.akkasource.org/camel) extension module.|
|[JBoss Drools](https://www.drools.org)|[Drools](https://blog.athico.com/2010/07/declarative-rest-services-for-drools.html) integrates with Camel.|
|[JBoss ESB](https://jbossesb.jboss.org/jbossesb)|JBoss ESB integrates with Camel.|
|[Simple-dm](https://code.google.com/archive/p/simple-dm)|Simple Dynamic Module System for Maven integrates with Camel.|
|[JOnAS Application Server](https://jonas.ow2.org/view/Documentation/JOnAS%20Camel)|JOnAS Application Server integrates with Camel.|
|[Active BAM](https://code.google.com/p/active-bam)|Web Console Business Activity Monitoring for ServiceMix, Camel and ActiveMQ.|
|[TouK](https://touk.pl/toukeu/rw/pages/index.en.do)|We are using Apache ServiceMix (both 3.x and 4.x) with Apache Camel, [Apache ODE](https://ode.apache.org/) and [Apache HISE](https://incubator.apache.org/hise/) as a middleware integration platform, with the biggest deployment for [Play](https://www.playmobile.pl), mobile telco operator in Poland|
|[camel-camelpe](https://github.com/obergner/camelpe)|A CDI Portable Extension for Apache Camel|
|[CaerusOne](http://code.google.com/p/caerusone)|CaerusOne is advanced application integration framework, sdk, server application server. It uses Apache Camel routing engine as part of core process engine.|
|[JBoss SwitchYard](https://switchyard.jboss.org)|SwitchYard is a lightweight service delivery framework for SOA and its integrated with Camel out of the box.|
|[camel-play](https://github.com/marcuspocus/play-camel)|A EIP + Messaging module for the Play! Framework|
|[EasyForms Camel Support](https://easyforms-camel.forge.onehippo.org)|The EasyForms Camel Support Components provides extended HST EasyForms Components which can invoke Apache Camel Routes.|
|[CamelWatch](https://sksamuel.github.com/camelwatch)|A web app for monitoring Camel applications.|
|[Streamz](https://github.com/krasserm/streamz)|A combinator library for integrating Functional Streams for Scala (FS2), Akka Streams and Apache Camel.|
|[scalaz-camel](https://github.com/krasserm/scalaz-camel)|A Scala(z)-based DSL for Apache Camel|
|[Babel](https://crossing-tech.github.io/babel)|Babel is a Domain Specific Language for Integration made in Scala. It provides elegant API in order to use well-known integration frameworks. Babel provides an API on top of Apache Camel which may be used in Scala.|
|[Wildfly Camel](https://github.com/wildflyext/wildfly-camel)|The WildFly-Camel Subsystem allows you to add Camel Routes as part of the WildFly configuration. Routes can be deployed as part of JavaEE applications. JavaEE components can access the Camel Core API and various Camel Component APIs. Your Enterprise Integration Solution can be architected as a combination of JavaEE and Camel functionality.|
|[Camel M2M gateway](https://github.com/hekonsek/camel-m2m-gateway)|This project summarizes the R&amp;D activities around the process of adopting the Apache Camel as the Internet Of Things M2M gateway. By the gateway we understand a field device with the moderate processing power (such as Raspberry Pi or BeagleBone Black) responsible for the routing of the messages between the IoT edge devices (sensors, drones, cars, etc) and the data center.|
|[Netflix](https://www.youtube.com/watch?v=k_ckJ7QgLW0#t=480)|Netflix uses Apache Camel as part of the cloud payment system.|
|[Islandora](http://islandora.ca)|Islandora is an open-source software framework designed to help institutions and organizations and their audiences collaboratively manage, and discover digital assets using a best-practices framework. They use Camel and JMS queues in the platform.|
|[SAP HANA](https://blogs.saphana.com/2016/02/01/hana-smart-data-integration-simplifies-connecting-consuming-facebook-data-hana-apache-camel-adapter)| The platform from SAP uses Apache Camel.|
|[Hammock](https://github.com/hammock-project/hammock])|Hammock is a CDI based microservices framework. Hammock integrates with Camel.|
|[OpenHub](http://www.openhub.cz)|OpenHub is an integration platform that is built on top of Apache Camel.|
|[Assimbly Gateway](https://github.com/assimbly/gateway)|A message gateway based on Apache Camel|
|[GraphAwareHume Orchestra](https://graphaware.com/products/hume/)|Integration framework built on top of Apache Camel, making as easy as simple clicks.| ** added in MD ***
|[Yeoman generator-camel-project](https://www.npmjs.com/package/generator-camel-project)|This project uses the Yeoman framework and node.js to generate the scaffold for Apache Camel projects as well as a simple template that can be used as a starting point.|
|[Camel-graph](https://github.com/avvero/camel-graph)|Camel-graph is a route graph viewer for ServiceMix and Camel applications, visualising your route topologies with metrics.|
|[Camel Extra project](https://camel-extra.github.io/)|contains a number of extension components which due to GPL/LGPL licensing cannot be hosted at Apache.
|[Platform6](https://www.platform6.io/) | Decentralised application framework for blockchains, called Platform 6 which heavily uses Apache Camel and Web3j.|
|[Rayvens](http://ibm.biz/rayvens) | Built on Apache Camel, Rayvens enables data scientists to interface with hundreds of data services with little effort to consume, process, and produce events and data in real time. |
|[Huawei Cloud ROMA](https://www.huaweicloud.com/en-us/product/roma.html)|Apache camel powers the runtime engine for [Huawei Cloud ROMA](https://www.huaweicloud.com/en-us/product/roma.html) which is a commercial iPaaS offering by Huawei Cloud. ROMA integrates data, services, messages and devices under one unified platform which enables it's customers to hook up systems spanning across multiple Paas, Saas and cloud services.|
|[ModusBox PortX](https://modusbox.com/portx-platform/)|PortX, the Integration Platform as a Service (IPaaS) for financial institutions, is built on the open source Apache Camel framework.|
|[Guidewire Integration Framework](https://www.guidewire.com/blog/technology/cloud-integration-framework-the-right-tools-for-the-job/)| Integration Gateway is an open framework for developing integration apps that bridge Guidewire APIs with external apps and services. It is based on Apache Camel.| 
|[Multi-Channel Framework (MCF)](https://www.felpfe.com/multi-channel-framework-mcf/)| Apache Camel Without Code! MCF is thoughtfully crafted to empower developers, granting them an intuitive framework for building, testing, and deploying intricate integration scenarios with unparalleled ease. By harnessing the powerful capabilities of Apache Camel, MCF remarkably simplifies the development workflow with its [configuration-based](https://www.felpfe.com/2023/06/30/multi-channel-framework-mcf-use-case-isx-sample-requirements/) approach, minimizing the complexity and amount of code required. This configuration-driven approach allows developers to achieve seamless integration using Camel with minimal coding effort| 
{{< /table >}}

## Developer Tooling
{{< table >}}
| Company, Product, or Project  | Description |
|-------------------------------|-------------|
|[Eclipse Desktop Tools for Apache Camel](http://tools.jboss.org/features/fusetools.html)|Red Hat provides developer tooling for Camel, ActiveMQ, ServiceMix, Karaf, CXF, and [Fabric8](http://fabric8.io). The tools are a set of Eclipse plugins, such as a graphical Camel editor and also includes a Camel route debugger, where you can set breakpoints in your routes.|
|[Apache Camel IDEA Plugin](https://github.com/camel-idea-plugin/camel-idea-plugin)|Plugin for Intellij IDEA to provide a set of Apache Camel related editing capabilities to the code editor. It also provides Camel textual route debugging capabilities.|
|[Camel Language Server](https://github.com/camel-tooling/camel-language-server)| A server implementation of the [Language Server protocol](https://github.com/Microsoft/language-server-protocol) that provides Camel DSL smartness (completion, validation, hover, outline). It is packaged for [VS Code](https://marketplace.visualstudio.com/items?itemName=redhat.vscode-apache-camel), [Eclipse Desktop IDE](https://marketplace.eclipse.org/content/language-support-apache-camel) and [Eclipse Che](https://www.eclipse.org/che/). It can be embedded in several [other editors and IDEs](https://github.com/camel-tooling/camel-language-server#clients).|
|[Camel Debug Adapter](https://github.com/camel-tooling/camel-debug-adapter) | A server implementation of the [Debug Adapter Protocol](https://microsoft.github.io/debug-adapter-protocol/) that provides Camel textual route debugging capabilities. It is packaged for [VS Code](https://marketplace.visualstudio.com/items?itemName=redhat.vscode-debug-adapter-apache-camel) and [Eclipse Desktop IDE](https://marketplace.eclipse.org/content/textual-debugging-apache-camel). it can be embedded in several [other editors and IDEs](https://microsoft.github.io/debug-adapter-protocol/implementors/tools/).|
|[VS Code extension pack for Camel](https://marketplace.visualstudio.com/items?itemName=redhat.apache-camel-extension-pack)|It provides a set of tools to develop Camel applications.|
|[Kaoto](https://kaoto.io/)|Kaoto is an integration editor to create and deploy workflows in a visual, low-code way; with developer-friendly features like a code editor and deployments to the cloud. Kaoto augments user productivity via Apache Camel: it accelerates new users and helps experienced developers.|
|[Camel Designer](https://marketplace.visualstudio.com/items?itemName=brunoNetId.camel-designer)| Visual designer generating Camel XML routes.|
|[Syndesis](https://syndesis.io)|Syndesis is for anyone that wants to integrate services. Syndesis includes a swish UI that enables the user to design integration flows and manage them from their browser.No coding required… Unless you really want to and then Syndesis allows you to dive into the code, develop your own connectors (if one doesn’t already exist), or hack on the integration definition directly.|
|[Fabric8](http://fabric8.io)|Fabric8 is an open source integration platform, allow to run Camel applications anywhere; whether its on-premise or in the cloud.|
|[hawt.io](http://hawt.io)|hawt.io is an open source HTML5 web application for visualizing, managing and tracing Camel routes &amp; endpoints, ActiveMQ brokers, JMX, OSGi, logging, and much more.|
|[Axiom](http://github.com/hyperthunk/axiom)|Axiom is is a framework for testing integration scenarios and uses Apache Camel to interact with your integration stack.|
|[CamelDiagramGenerator](http://code.google.com/p/rmannibucau/wiki/CamelDiagramGenerator)|A maven plugin to generate camel diagram from routes.|
|[JRebel](http://zeroturnaround.com/software/jrebel)|JRebel now supports [reloading](http://zeroturnaround.com/jrebel/jrebel-5-1-2-released-apache-camel-now-supported) Camel routes without any application server restarts.|
|[Camelry](https://github.com/AlanFoster/Camelry)|This IntelliJ plugin is designed to improve the development experience when working with Apache Blueprint, Apache karaf and Apache Camel.|
|[Jel](http://giacomolm.github.io/Jel)|Javascript graphical Editor that generates DSL. This is a web based tooling that offers a GUI for defining and editing Apache Camel routes using the XML DSL.|
|[JBoss Forge](http://forge.jboss.org)|The [Camel](http://forge.jboss.org/addon/io.fabric8.forge:camel) addon from [Fabric8](http://fabric8.io) allows to setup and manage your Apache Camel maven projects from a CLI, Eclipse, IDEA, and NetBeans. With this addon from the IDEs you can use a wizard driven UI to add new Camel components, add/edit existing endpoints in a UI that allows to edit each options individually in a more type safe manner. You can also setup your Maven project for Docker and Kubernetes platforms.|
|[API Tracker 4j](https://abi-laboratory.pro/java/tracker/timeline/camel-core) of camel-core|The review of API changes for the Camel Core library since Camel 2.16 which is updated several times per week.|
{{< /table >}}

## User Groups

{{< table >}}
| User Groups  | Description |
|--------------|-------------|
|[Apache Camel User Group Denmark](https://groups.google.com/group/camel-user-group-denmark)|A danish user group for Apache Camel.|
|[Apache Camel User Group Tunisia](http://groups.google.com/group/apache-camel-user-group-tunisia)|A tunisian user group for Apache Camel.|
|[Linkedin Apache Camel Group](http://www.linkedin.com/groups?gid=2447439&trk=hb_side_g)|The Apache Camel group in linkedin.|
|[Google+ Apache Camel Group](https://plus.google.com/communities/106271384875356488225)|The Apache Camel group in google+|
|[Apache Camel User Group Japan](https://jcug-oss.github.io/)|A Japanese user group for Apache Camel.|
{{< /table >}}

## External Camel Components

{{< table >}}
| External Camel Components  | Description |
|----------------------------|-------------|
|[camel-apama](https://github.com/gerco/camel-apama)|A Camel component for [Progress Apama](http://web.progress.com/en/apama/index.html)|
|[camel-arangdodb](https://github.com/bbonnin/camel-arangodb)|Camel component for accessing ArangoDB|
|[camel-beanstalk](http://github.com/osinka/camel-beanstalk)|Apache Camel component for beanstalk.|
|[camel-cassandra](http://github.com/ticktock/camel-cassandra)|A Camel Cassandra component.|
|[camel-cassandra](https://github.com/oscerd/camel-cassandra)|Another Camel Cassandra component based on Cassandra Datastax Java Driver.|
|[camel-gdrive](https://github.com/jdavisonc/camel-gdrive)|A Camel component for Google Drive.|
|[camel-grizzly](https://github.com/cdollins/camel-grizzly)|A component that works with the Glassfish Grizzly networking library|
|[camel-isotypes](https://code.google.com/p/isotypes/)|A Camel component for ISO8583 isotypes.|
|[camel-oftp2](http://accord.ow2.org/odetteftp/camel.html)|[Neociclo](http://www.neociclo.com/) provides an [OFTP2](http://accord.ow2.org/odetteftp/protocol.html) component for Apache Camel.|
|[camel-sipe](https://bitbucket.org/arkadi/camel-sipe)|A Camel component to communicate with Microsoft Office Communicator and Lync Servers.|
|[camel-smb](https://github.com/Redpill-Linpro/camel-smb)|This project is a Samba Camel component build on top of [JCIFS](http://jcifs.samba.org).|
|[camel-tika](https://github.com/wheijke/camel-tika)|Camel data format for [Apache Tika](http://tika.apache.org/)|
|[camel-tumblr](https://github.com/soluvas/tumblej)|A Camel component to post to Tumblr.|
|[Oracle Coherence Camel Component](http://code.google.com/p/oracle-coherence-camel-component/)|A Camel component for integrating with Oracle Coherence|
|[camel-scala-extra](https://github.com/osinka/camel-scala-extra)|Extra Apache Camel methods for Scala|
|[camel-spring-amqp](https://github.com/Bluelock/camel-spring-amqp)|A Camel component to integrate with Spring AMQP to communicate with for example RabbitMQ.|
|[camel-kamon](https://github.com/osinka/camel-kamon)|Kamon metrics and traces for Apache Camel routes, processors|
|[camel-spring-cloud-stream](https://github.com/donovanmuller/)|A component to integrate with Spring Cloud Stream|
|[camel-rocketmq](https://github.com/TeslaCN/camel-rocketmq)|A component to integrate with Apache RocketMQ|
|[camel-openhtmltopdf](https://github.com/elevation-solutions/camel-openhtmltopdf)|A Camel component to generate nice looking PDF files from HTML, CSS, images, etc.|
|[camel-xtrasonnet](https://jam01.github.io/xtrasonnet/camel/)|xtrasonnet is an extensible, jsonnet-based, data transformation engine  for Java or any JVM-based language. The Camel xtrasonnet component enables the use of xtrasonnet transformations as  Expressions or Predicates in the DSL.|
{{< /table >}}
