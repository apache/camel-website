---
title: "Apache Camel 4.20 What's New"
date: 2026-04-27
draft: false
authors: [ davsclaus ]
categories: [ "Releases" ]
preview: "Details of what we have done in the Camel 4.20 release."
---

Apache Camel 4.20 has just been [released](/blog/2026/04/RELEASE-4.20.0/).

This release is an expedited security fix release on top of the previous [4.19 release](/blog/2026/04/camel419-whatsnew).

## JDK25 compatibility

This is the first release supporting JDK25. 

However, there are a few 3rd party libraries that does not yet fully support JDK25, 
see more in [CAMEL-22114](https://issues.apache.org/jira/browse/CAMEL-22114).

## Camel JBang

You can now easier configure HTTPS for development purposes with self-signed certificates, so you can host services
via HTTPS locally in Camel. 

```properties
# use https instead of http with self-signed certificate
# making it easy for development purpose
camel.ssl.enabled=true
camel.ssl.selfSigned=true
```

## Upgrading

Make sure to read the [upgrade guide](/manual/camel-4x-upgrade-guide-4_20.html) if you are upgrading from a previous
Camel version.

If you are upgrading from, for example, 4.4 to 4.8, then make sure to follow the upgrade guides for each release
in-between, i.e.
4.4 -> 4.5, 4.5 -> 4.6, and so forth.

The Camel Upgrade Recipes tool can also be used to automate upgrading.
See more at: https://github.com/apache/camel-upgrade-recipes

## Release Notes

You can find additional information about this release in the list of resolved JIRA tickets:

- [Release notes 4.20](/releases/release-4.20.0/)

## Roadmap

The next 4.21 release is planned in June.

