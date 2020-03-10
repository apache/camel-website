---
title: Camel K
---

# Apache Camel K

Apache Camel K is a lightweight integration framework built from Apache Camel that runs natively on Kubernetes and is specifically designed for serverless and microservice architectures.

Users of Camel K can instantly run integration code written in Camel DSL on their preferred cloud (Kubernetes or OpenShift).

## HOW IT WORKS 

Just write a _helloworld.groovy_ integration file with the following content:

```groovy
from('timer:tick?period=3s')
  .setBody().constant('Hello world from Camel K')
  .to('log:info')
```

You can then execute the following command:

```
kamel run helloworld.groovy
```

The integration code immediately runs in the cloud. **Nothing else** is needed.

For more information checkout the [Camel K manual](../../camel-k/latest/installation/installation.html) and join the community on on the [Camel Users mailing list](../../community/mailing-list/) and have a look at the [Camel K GitHub repository](https://github.com/apache/camel-k/).
