---
title: "Camel K 2.7.0"
date: 2025-06-24
draft: false
authors: [squakez]
categories: ["Releases", "Camel K", "Roadmap"]
preview: "What's new in Camel K 2.7.0!"
---

Apache Camel community is happy to announce the general availability of **Camel K 2.7.0**. We have a lot of new exciting features we want to share within this release.

## Build from GIT

The coolest feature we've added to Camel K 2.7.0 is the possibility to [build directly from a Git repository](/camel-k/next/running/build-from-git.html). This is adding more flexibility and independence to your prototyping and building process. You can provide the operator a Git repository where your project is hosted, and, from there onward, let the operator taking care of building (testing included!), "containerizing" and deploying your Camel application to the cluster.

Just create an Integration with the proper configuration:

```yaml
spec:
  git:
    url: https://github.com/squakez/sample.git
    secret: my-secret
```

and the operator will take care to automate all the steps necessary to build and run you application.

> **NOTE:** mind the existence of `kamel --git` option as well.

You can also think this as a natural follow up of your prototyping via Camel Jbang. Whenever you're ready, you can easily export (via `camel export`) the project, push to a repo and release it via Camel K.

Thanks to this feature you will be also able to use any Camel runtime, `camel-main` and `spring-boot` included. Together with [Camel GitOps promotion](/camel-k/next/running/promoting.html#gitops) mechanism introduced in version 2.6, you can have a full automated GitOps experience.

## Pipe binding to Services, Integration and other Pipes

Pipe have been proved a great mechanism to provide an event driven architecture based on connectors. In this release we have introduced the possibility to [bind the Pipe to any other Service](/camel-k/next/pipes/pipes.html#_binding_to_a_service_integration_or_pipe), Integration or Pipe. This is going to give you the possibility to leverage existing Camel applications or any available Kubernetes Service.

## Stability fixes

During this release we have focused on stability and cleared most of the outstanding bugs. Feel free to report any issue as usual.

## Main dependencies

Let's have a look at the major dependencies changes. The operator is now built with Golang 1.24 and the Kubernetes API is aligned with version 1.32.3. We are also defaulting the runtime to latest Camel K Runtime LTS version 3.15.3 (based on Camel 4.8.5). However as already mentioned in previous release notes, you're very much invited to move already to any more recent plain Camel Quarkus version instead.

## Full release notes

Those were the most interesting features we have delivered in Camel K 2.7.0. We have more minor things, documentation and dependency updates that you can check in the [2.7.0 release notes](https://github.com/apache/camel-k/releases/tag/v2.7.0).

## Stats

Here some stats that may be useful for development team to track the health of the project:

* Github project stars: 881 (+0,5 %)
* [Docker pulls over time](https://hub.docker.com/v2/repositories/apache/camel-k/): 2361326 (+2 %)
* Unit test coverage: 47,3 (-0,3 %)

# Thanks

Thanks a lot to our contributors and the hard work happening in the community. Feel free to provide any feedback or comment using the Apache Camel available channels.
