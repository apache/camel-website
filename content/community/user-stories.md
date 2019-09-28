---
title: "User Stories"
---

This page is intended as a place to collect user stories and feedback on Apache Camel. If you are using or have tried Apache Camel please add an entry or comment; or post to the mailing list.

{{< table >}}
| Company, Product, or Project  | Description |
|-------------------------------|-------------|
|[Apache ActiveMQ](http://activemq.apache.org)|Uses Camel to add [Enterprise Integration Patterns](../../manual/latest/enterprise-integration-patterns.html) support into the [ActiveMQ broker](http://activemq.apache.org/enterprise-integration-patterns.html). If you run an out of the box ActiveMQ broker, look in *conf/camel.xml* and you'll see *camelContext* with some example routing rules. Can be used to bridge ActiveMQ with any of the camel [Components](../../manual/latest/component.html).|
|[Apache ServiceMix](http://servicemix.apache.org/home.html)|Uses Camel as a routing engine as a [JBI service](http://servicemix.apache.org/servicemix-camel.html) unit for use either in [JBI](http://servicemix.apache.org/docs/4.4.x/jbi/components/index.html) or OSGi to route between JBI endpoints. See the [tutorial](http://servicemix.apache.org/3-beginner-using-apache-camel-inside-servicemix.html) or [example](http://servicemix.apache.org/camel-example.html)|
|[Apache Ignite](https://ignite.apache.org/)|Apache Ignite In-Memory Data Fabric is a high-performance, integrated and distributed in-memory platform for computing and transacting on large-scale data sets in real-time, orders of magnitude faster than possible with traditional disk-based or flash technologies.It uses Camel for its universal streamer.|
|[JBoss Fuse](http://www.jboss.org/products/fuse/overview) ([formerly known as Fuse ESB](http://fusesource.com/products/enterprise-servicemix))|Red Hat provides a commercial distribution of an ESB which includes Camel, ActiveMQ, CXF, ServiceMix, Karaf, [Fabric8](http://fabric8.io), and [Hawtio](http://hawt.io).|
|[Tools for Apache Camel](http://tools.jboss.org/features/apachecamel.html) (formerly know as Fuse IDE)|JBoss provides developer tooling for Camel, ActiveMQ, ServiceMix, Karaf, CXF, and [Fabric8](http://fabric8.io). The tools is a set of Eclipse plugins, such as a graphical Camel editor and also includes a Camel route debugger, where you can set breakpoints in your routes.|
|[Apache Camel IDEA Plugin](https://github.com/camel-idea-plugin/camel-idea-plugin)|Plugin for Intellij IDEA to provide a set of Apache Camel related editing capabilities to the code editor.|
|[Syndesis](https://syndesis.io)|Syndesis is for anyone that wants to integrate services. Syndesis includes a swish UI that enables the user to design integration flows and manage them from their browser.No coding required… Unless you really want to and then Syndesis allows you to dive into the code, develop your own connectors (if one doesn’t already exist), or hack on the integration definition directly.|
|[Fabric8](http://fabric8.io)|Fabric8 is an open source integration platform, allow to run Camel applications anywhere; whether its on-premise or in the cloud.|
|[hawt.io](http://hawt.io)|hawt.io is an open source HTML5 web application for visualizing, managing and tracing Camel routes &amp; endpoints, ActiveMQ brokers, JMX, OSGi, logging, and much more.|
|[Grails](http://grails.org)|The [Grails Camel Routing Plugin](http://grails.org/plugin/routing) provides integration of Camel into Grails|
|[Open ESB Camel SE](http://wiki.open-esb.java.net/Wiki.jsp?page=CamelSE)|Provides a JBI Service Engine for [Open ESB](https://open-esb.dev.java.net). See the [example](http://blogs.sun.com/polyblog/entry/camel_fuji) using OpenESB and Fuji|
|[SubRecord](http://www.subrecord.org)|Uses Camel for routing and EDA processing|
|[Open eHealth Integration Platform](http://openehealth.org/display/ipf2/Home)|The Open eHealth Integration Platform (IPF) is an extension of the Apache Camel routing and mediation engine. It has an application programming layer based on the Groovy programming language and comes with comprehensive support for message processing and connecting systems in the eHealth domain.|
|[Camel SOAP](http://code.google.com/p/camel-soap)|Zero code WSDL based SOAP Client component for Apache Camel.|
|[PrismTech](http://www.opensplice.com/section-item.asp?id=964)|PrismTech Simplifies Systems Integration &amp; SOA Connectivity with Release of Open Source OpenSplice DDS Connector for Apache Camel.|
|[Axiom](http://github.com/hyperthunk/axiom)|Axiom is is a framework for testing integration scenarios and uses Apache Camel to interact with your integration stack.|
|[Capital Region of Denmark](http://www.regionh.dk/English/English.htm)|Chose to switch proprietary ESB to open source Apache Camel.|
|[Arla Foods](http://www.arla.com)|Uses Camel to integrate business backend with web application for farmers to access information about quality of their delivered milk. Application used in numerous european countries.|
|[Akka](http://akkasource.org)|Akka uses Apache Camel to implement additional messaging interfaces for [actors](http://doc.akkasource.org/actors). Any Camel [component](http://camel.apache.org/components.html) can be used to send and receive messages from Akka actors. For details refer to the documentation of the [akka-camel](http://doc.akkasource.org/camel) extension module.|
|[JBoss Drools](http://jboss.org/drools)|[Drools](http://blog.athico.com/2010/07/declarative-rest-services-for-drools.html) integrates with Camel.|
|[JBoss ESB](http://www.jboss.org/jbossesb)|JBoss ESB integrates with Camel.|
|[Simple-dm](http://code.google.com/p/simple-dm)|Simple Dynamic Module System for Maven integrates with Camel.|
|[JOnAS Application Server](http://wiki.jonas.ow2.org/xwiki/bin/view/Main/WebHome)|JOnAS Application Server integrates with Camel.|
|[Active BAM](http://code.google.com/p/active-bam)|Web Console Business Activity Monitoring for ServiceMix, Camel and ActiveMQ.|
|[Apache Hise](http://incubator.apache.org/hise/)|Apache Hise (Open Source Implementation of WS-Human-Task Specification) integrates with Camel.|
|[Catify](http://www.catify.com)|Catify is build on top of proven software stack like Spring, Apache ActiveMQ, Apache Camel, Apache Felix and MongoDB.|
|[TouK](http://touk.pl/toukeu/rw/pages/index.en.do)|We are using Apache ServiceMix (both 3.x and 4.x) with [Apache Camel](http://camel.apache.org/), [Apache ODE](http://ode.apache.org/) and [Apache HISE](http://incubator.apache.org/hise/) as a middleware integration platform, with the biggest deployment for [Play](http://www.playmobile.pl), mobile telco operator in Poland|
|[Progress Sonic ESB](http://web.progress.com/en/sonic/sonic-esb.html)|Progress Sonic ESB uses Camel internally to mediate Web Service messages (leveraging CXF stack) and Sonic ESB messages|
|[scalaz-camel](https://github.com/krasserm/scalaz-camel)|A Scala(z)-based DSL for Apache Camel|
|[camel-camelpe](https://github.com/obergner/camelpe)|A CDI Portable Extension for Apache Camel|
|[Kuali Ole](http://www.kuali.org/ole)|Kuali OLE uses Apache Camel in their open source administrative software|
|[CaerusOne](http://code.google.com/p/caerusone)|CaerusOne is advanced application integration framework, sdk, server application server. It uses apache camel routing engine as part of core process engine.|
|[JBoss SwitchYard](http://www.jboss.org/switchyard)|SwitchYard is a lightweight service delivery framework for SOA and its integrated with Camel out of the box.|
|[camel-scala-extra](https://github.com/osinka/camel-scala-extra)|Extra Apache Camel methods for Scala|
|[camel-play](https://github.com/marcuspocus/play-camel)|A EIP + Messaging module for the Play! Framework|
|[Activiti](http://activiti.org)|[Activiti BPM](http://bpmn20inaction.blogspot.com/2011/05/supersize-activiti-with-mule-esb-and.html) has direct Apache Camel integration.|
|[EasyForms Camel Support](http://easyforms-camel.forge.onehippo.org)|The EasyForms Camel Support Components provides extended HST EasyForms Components which can invoke Apache Camel Routes.|
|[CamelDiagramGenerator](http://code.google.com/p/rmannibucau/wiki/CamelDiagramGenerator)|A maven plugin to generate camel diagram from routes.|
|[CamelWatch](http://sksamuel.github.com/camelwatch)|A web app for monitoring Camel applications.|
|[JRebel](http://zeroturnaround.com/software/jrebel)|JRebel now supports [reloading](http://zeroturnaround.com/jrebel/jrebel-5-1-2-released-apache-camel-now-supported) Camel routes without any application server restarts.|
|[Camelry](https://github.com/AlanFoster/Camelry)|This IntelliJ plugin is designed to improve the development experience when working with Apache Blueprint, Apache karaf and Apache Camel.|
|[Jel](http://giacomolm.github.io/Jel)|Javascript graphical Editor that generates DSL. This is a web based tooling that offers a GUI for defining and editing Apache Camel routes using the XML DSL.|
|[Babel](http://crossing-tech.github.io/babel)|Babel is a Domain Specific Language for Integration made in Scala. It provides elegant API in order to use well-known integration frameworks. Babel provides an API on top of Apache Camel which may be used in Scala.|
|[Wildfly Camel](https://github.com/wildflyext/wildfly-camel)|The WildFly-Camel Subsystem allows you to add Camel Routes as part of the WildFly configuration. Routes can be deployed as part of JavaEE applications. JavaEE components can access the Camel Core API and various Camel Component APIs. Your Enterprise Integration Solution can be architected as a combination of JavaEE and Camel functionality.|
|[Camel M2M gateway](https://github.com/hekonsek/camel-m2m-gateway)|This project summarizes the R&amp;D activities around the process of adopting the Apache Camel as the Internet Of Things M2M gateway. By the gateway we understand a field device with the moderate processing power (such as Raspberry Pi or BeagleBone Black) responsible for the routing of the messages between the IoT edge devices (sensors, drones, cars, etc) and the data center.|
|[Netflix](https://www.youtube.com/watch?v=k_ckJ7QgLW0#t=480)|Netflix uses Apache Camel as part of the cloud payment system.|
|[JBoss Forge](http://forge.jboss.org)|The [Camel](http://forge.jboss.org/addon/io.fabric8.forge:camel) addon from [Fabric8](http://fabric8.io) allows to setup and manage your Apache Camel maven projects from a CLI, Eclipse, IDEA, and NetBeans. With this addon from the IDEs you can use a wizard driven UI to add new Camel components, add/edit existing endpoints in a UI that allows to edit each options individually in a more type safe manner. You can also setup your Maven project for Docker and Kubernetes platforms. 
|[Islandora](http://islandora.ca)|Islandora is an open-source software framework designed to help institutions and organizations and their audiences collaboratively manage, and discover digital assets using a best-practices framework.&nbsp;&nbsp;They use Camel and JMS queues in the platform.|
|SAP HANA|[HANA](https://blogs.saphana.com/2016/02/01/hana-smart-data-integration-simplifies-connecting-consuming-facebook-data-hana-apache-camel-adapter) The platform from SAP uses Apache Camel.|
|[Hammock](https://github.com/hammock-project/hammock])|Hammock is a CDI based microservices framework. Hammock integrates with Camel.|
|[Streamz](https://github.com/krasserm/streamz)|A combinator library for integrating Functional Streams for Scala (FS2), Akka Streams and Apache Camel.|
|[OpenHub](http://www.openhub.cz)|OpenHub is an integration platform that is built on top of Apache Camel.|
|[API Tracker 4j](https://abi-laboratory.pro/java/tracker/timeline/camel-core) of camel-core|The review of API changes for the Camel Core library since Camel 2.16 which is updated several times per week.|
|[Assimbly Gateway](https://github.com/assimbly/gateway)|A message gateway based on Apache Camel|
|[Yeoman generator-camel-project](https://www.npmjs.com/package/generator-camel-project)|This project uses the Yeoman framework and node.js to generate the scaffold for Apache Camel projects as well as a simple template that can be used as a starting point.|
|[Camel-graph](https://github.com/avvero/camel-graph)|Camel-graph is a route graph viewer for ServiceMix and Camel applications, visualising your route topologies with metrics.|
|[Camel Extra project](https://camel-extra.github.io/)|contains a number of extension components which due to GPL/LGPL licensing cannot be hosted at Apache.
{{< /table >}}


{{< table >}}
| User Groups  | Description |
|--------------|-------------|
|[Apache Camel User Group Denmark](https://groups.google.com/group/camel-user-group-denmark)|A danish user group for Apache Camel.|
|[Apache Camel User Group Tunisia](http://groups.google.com/group/apache-camel-user-group-tunisia)|A tunisian user group for Apache Camel.|
|[Linkedin Apache Camel Group](http://www.linkedin.com/groups?gid=2447439&trk=hb_side_g)|The Apache Camel group in linkedin.|
|[Google+ Apache Camel Group](https://plus.google.com/communities/106271384875356488225)|The Apache Camel group in google+|
|[Apache Camel User Group Japan](https://jcug-oss.github.io/)|A Japanese user group for Apache Camel.|
{{< /table >}}


{{< table >}}
| External Camel Components  | Description |
|--------------|-------------|
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
{{< /table >}}
