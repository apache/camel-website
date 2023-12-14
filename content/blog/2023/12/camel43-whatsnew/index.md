---
title: "Apache Camel 4.3 What's New"
date: 2023-12-18
authors: [davsclaus,gzurowski,orpiske,apupier]
categories: ["Releases"]
preview: Details of what we have done in the Camel 4.3 release.
---

Apache Camel 4.3 (non LTS) has just been [released](/blog/2023/12/RELEASE-4.3.0/).

This release introduces a set of new features and noticeable improvements that we will cover in this blog post.

## Camel Core

TODO:

## Camel Main

TODO:

## DSL

We added the following EIPs:

- `setHeaders` EIP to make it easier and less verbose to set multiple headers from the same EIP.
- `convertHeaderTo` EIP to make it easy to convert header value to a specific type.

We improved configuring beans, that can now support builder beans, that are used to build the actual bean.
For example in the following YAML notice how the `builderClass` refers to class responsible for building the target bean:

```yaml
- beans:
    - name: myCustomer
      type: com.mycompany.Customer
      builderClass: com.mycompany.CustomerBuilder
      properties:
         name: "Acme"
         street: "Somestreet 42"
         zip: 90210
         gold: true
- from:
    uri: "timer:yaml"
    parameters:
      period: "5000"
    steps:
      - bean:
          ref: myCustomer
          method: summary
      - log: "${body}"
```

The builder class is required to have a build method that Camel invokes. The name of the method is `build` by default.

To see more see the following examples:

- https://github.com/apache/camel-kamelets-examples/tree/main/jbang/bean-builder
- https://github.com/apache/camel-kamelets-examples/tree/main/jbang/bean-inlined-code

## Camel JBang (Camel CLI)

We have continued investing in Camel JBang, and this time ...

TODO:

## Spring and Spring Boot

Upgraded to latest [Spring Boot 3.2.0](https://spring.io/blog/2023/11/23/spring-boot-3-2-0-available-now) release.

## SBom

TODO:

## Miscellaneous

The `camel-hdfs` component has been deprecated and planned for removal soon. The Apache Hadoop project is unfortunately
not offering client JARs with a limited set of dependencies, which leads to a giant dependency set that have many
old versions that has known CVEs. 

## New Components

- `camel-aws-config` - Manage AWS Config service.
- `camel-elasticsearch-rest-client` - Perform queries and other operations on Elasticsearch or OpenSearch (uses low-level client).
- `camel-kubernetes-cronjob` - Perform operations on Kubernetes CronJob.
- `camel-micrometer-prometheus` - Camel Micrometer Prometheus for Camel Main
- `camel-smb` - Receive files from SMB (Server Message Block) shares.

## Upgrading

Make sure to read the [upgrade guide](/manual/camel-4x-upgrade-guide-4_3.html) if you are upgrading from a previous Camel version.

## Release Notes

You can find more information about this release in the list of JIRA tickets resolved in the release:

- [Release notes 4.3](/releases/release-4.3.0/)

## Roadmap

The following 4.4 release (LTS) is planned for February 2024.

