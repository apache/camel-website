---
title: "Camel Karaf 4.14.5 Released"
date: 2026-03-17
authors: ["jbonofre"]
categories: ["Releases", "Camel Karaf"]
preview: "Camel Karaf 4.14.5 Released"
summary: "Camel Karaf 4.14.5 release"
---

We are pleased to announce the 4.14.5 release of Camel Karaf.

Camel Karaf 4.14.5 provides Camel 4.14.5 support for Karaf 4.x.
It includes:
* Add org.apache.camel.model packages import in camel-xml-jaxb bundle
* Add optional import to org.apache.camel.component.cxf.common.header package in camel-cxf transport bundles
* Fix camel-ehcache feature
* Fix camel-elasticsearch feature
* Fix xml-specs-api feature start levels
* Register CXF servlet via OSGi Servlet Whiteboard to restore service listing page
* Add camel-dsl-support and camel-xml-io-dsl bundles and features
* Replace init() with build() in OsgiDefaultCamelContext
* Invalidate OsgiTypeConverter delegate when new TypeConverterLoader arrives
* Fix bean method resolution for OSGi Blueprint proxy classes

For more information, please check the [Release notes](/releases/karaf-4.14.5/).
