---
title: "Apache Camel and CVE-2021-44228 (log4j)"
date: 2021-12-13
draft: false
authors: [davsclaus]
categories: ["security"]
preview: "Apache Camel and CVE-2021-44228 (log4j)"
---

### Apache Camel is NOT using log4j for production

Apache Camel does not directly depend on Log4j 2, 
so we are not affected by CVE-2021-44228. 

If you explicitly added the Log4j 2 dependency to your own applications,
make sure to upgrade.

### Apache Camel is using log4j for testing itself

Apache Camel does use log4j during testing itself, and therefore you
can find that we have been using log4j v2.13.3 release in our latest LTS releases
Camel 3.7.6, 3.11.4. 

In the `camel-dependencies` BOM we extract all the 3rd party dependency
version that was used for building and testing the release:

    <log4j2-version>2.13.3</log4j2-version>

In the upcoming LTS releases 3.14.0, 3.11.5, and 3.7.7 we have upgraded to
log4j 2.15.0. For future releases then we plan to filter out testing
dependencies in the `camel-dependencies` BOM, meaning that `log4j2-version`
will no longer be included.

### What about other Apache Camel projects?

Apache Camel Quarkus and Camel K uses Quarkus as the runtime, and Quarkus does not use log4j, and 
they are therefore not affected.



