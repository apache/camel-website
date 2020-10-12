---
title: "Camel K 1.2.0 Released"
date: 2020-10-12
authors: ["nicolaferraro"]
categories: ["Releases", "Camel K"]
preview: "Camel K 1.2.0 Released"
---

Apache Camel K 1.2.0 has been released!

This version introduces some important features that will play an increasingly bigger role in future releases of Camel K.

## Quarkus as default runtime

Camel K 1.2.0 uses camel-quarkus 1.1.0 (Quarkus 1.8.0.Final) as runtime, but Quarkus is no longer an optional runtime for Camel K: **Quarkus is now the default runtime**.

This means that users no longer need to enable Quarkus explicitly when running their integrations (using `kamel run -t quarkus.enabled=true ...` for instance): Quarkus will be automatically enabled. It's still possible to use the old runtime, based on Camel main, but we are now deprecating it and it will be removed in future releases.
Having a single runtime will allow us to focus more on features and reduce the fragmentation.

Setting our base on Quarkus will also allow us to start introducing native compilation in the build workflow, a feature that we've always targeted since the inception of the project, that is tremendously useful especially in the serverless context.

## Kamelets

You'll hear more about Kamelets in the future. Kamelets are Kubernetes resources that can be installed on a cluster and used in Camel K integrations. They contain high level connectors in the form of "route templates". Kamelets abstract the details of connecting to complex systems and can be combined by Camel K users to create complex integrations with ease, just like if they were standard components.

The power of Kamelets is that they hide the complexity of connecting to external systems behind a simple interface, that contain all the information needed to instantiate them, even for users who are not familiar with Camel.

Kamelets are also suitable to be used as generic connectors for building UI-based projects that leverage the power of Apache Camel, expanding the possibilities of Apache Camel into new areas.

You can find more information about [Kamelets in the Camel K documentation](https://camel.apache.org/camel-k/latest/kamelets/kamelets.html).

## What's Next?

The changes introduced in Camel K 1.2.0 open the road to new developments in Apache Camel K.

"Quarkus native" compilation is one of the next items that we'll face in next iterations.

We also want to expand the concept of Kamelets and make it useful in many areas, starting from the serverless context, where they can offer a simplified interface for Knative users that want to create sources and sinks for their serverless workflows.

Contributions are welcome, as usual! But we also love to have your feedback about the recent changes.

Meet us on [Zulip](https://camel.zulipchat.com/)!
