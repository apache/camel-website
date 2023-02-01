---
title: "Camel K 2023 Roadmap"
date: 2022-02-06
draft: false
authors: [squakez]
categories: ["Roadmap", "Camel K"]
preview: "A brief overview of what we've planned for Camel K in 2023"
---

<sub><sup><a href='https://pngtree.com/so/Signpost'>Signpost png from pngtree.com/</a></sup></sub>

We're in 2023 since a while (just if nobody has noticed yet...) and we've taken the month of January to think about how to move Camel K development forward. We had a very good discussion about the [new features we'd like to see during this year](https://github.com/apache/camel-k/issues/3964) and this blog is trying to resume those ideas collected. I am going to do my best to resume everybody's comments in a shared view in order to inspire any contributor to understand the direction we're willing to take. As we may introduce some breaking change (but don't expect a full redesign), we probably will start the development of **Camel K 2.0**. As we have also **Camel 4** knocking at the doors, we felt it natural to take the opportunity and include any required change for the new Camel K during this year.

We'll keep supporting Camel K version 1 as long as the support for Camel 3 will be provided.

Let's have a sneak peek at the main areas we have discussed:

* Camel K release process
* Camel 4 support
* Enhance build and make it more enterprise
* Multitenancy
* Observability
* CLI
* Kustomize
* Kamelets
* Strengthen other operator supports relationship
* Kamelets

In each section, I've tried to detail the rationale and some ideas that can be furtherly refined. There may also be reference to Github issues that are related to the requirement under discussion.

DISCLAIMER: this is a wide list of desired areas we may work on. We may not be able to complete all of them for any reason, neither considered responsible for any kind of committment. The contributors must not consider this as a mandatory list of work to do, but as a suggested list of things to take in consideration when dedicating time to the project.

## Camel K release process

This area was already started during last year. Basically we have identified an important chain of dependencies between Camel, Camel Quarkus, Kamelets and Camel K (via Camel K Runtime). This is obviously making us slowing down as we need to wait for other projects to be released. Removing the dependencies will let us be more free and start thinking clearly on 2 kind of developments: Kubernetes based developments and Camel based developments.

One first piece in place is the Camel K Runtime which we're aiming to move as a Camel Quarkus provider. It means that any Camel based development will be normally done in the Camel/Camel Quarkus realm, whilst any other development (I like to call them the Kubernetes development) will be done independently in Camel K.

## Camel 4 support

Given the point discussed above, the support of Camel 4 will be inherited by the runtime we use. I don't expect any real impact on Camel K development that is coming from any change on Camel 4. In any case, we'll be integrating the first stable bits of this new major release to make sure everything will be running smoothly.

## Enhance build and make it more enterprise

This is the area where we likely will introduce some important change. Let's start from one point discussed in the release process. As we need to decouple from the runtime, we'll need also to remove any dependency from the tooling required to build the application (which version change based on the runtime): more details are exposed in [#3831](https://github.com/apache/camel-k/issues/3831). This development may bring us to a new situation where we can enable a building strategy which by default will schedule a Job/Pod to run the build.

Speaking about building strategy, something clear we have identified is the impossibility to support all the build strategy we have in place. We'll be deprecating Buildah, Kaniko and Spectrum favouring [JIB](https://github.com/apache/camel-k/issues/1656) which looks to be very solid and with a good community behind its back.

Something else we need to rework is the way we generate the Camel project (the Maven project built from the Integration source). We have some custom code right now to do all the heavy lift but we could (should!?) use something similar done by `camel` CLI (Camel JBang). If we delegate this task to an external tool we'd benefit from 3 aspect:

1. The Camel developer user experience is going to be the same independently on the final deployment choosen
2. Local development will be easier and straightforward
3. Something less to maintain... (just a joke, I promise we'll help Camel JBang instead)

Having a generic project, may open some new interesting scenario. For example, at this stage we may be in a better position to support any Camel application, not only Camel Quarkus. And once we're there, the operator could even "intercept" any Camel application deployed by other tools (pipelines, manually, ...) and extend its operations (such as monitoring).

In the same manner, the possibility to leverage the export feature provided by Camel JBang can lead us to a scenario where we can integrate more easily an external pipeline (ie, Tekton) and even think about some opinionated GitOps strategy to adopt.

All these ideas should be furtherly analyzed and refined as they may clash against some assumptions we have already in place (for instance, reusing a container image kit). However, the main concept is that the way we build the application is a strategic piece and we'll be working to make it flexible and more stable in Camel K 2.0.

## Multitenancy

The new multitenancy model development has still some aspect to polish. One of them is the ability to have more than one operator running in the same namespace. We may also think if it makes sense to remove the global operator once we are confident with the new model.

## Observability

We will move from opentracing to opentelemetry, this is something already in progress. As we are focusing on "enterprise" features, probably we should have something more on the Observability aspect, such as providing Service Level KPIs available in the exposed metrics.

## CLI

A lot of work is already done in Camel JBang. We should join effort and move the logic of `kamel` cli in `camel` cli instead. One very important feature we should enhance is the possibility to do a deep code introspection. Right now we can discover simple components and capabilities and it would be a great help to the user experience to have it automatic. In the long run we will be in a position where we hopefully have a full parity feature of what `kamel` offers now into `camel` (therefore having Camel K project in charge only of the operator part).

The benefits of having a common CLI experience from a single tool were previously discussed in the previous chapters.

## Kustomize

So far, we're using the `kamel` CLI also as an intallation method. As we're willing to shrink it, we'll need to work and provide full parity between the actual `kamel install` options and Kustomize.

## Kamelets

We've mentioned briefly the dependency of the release process between Camel K and Kamelets. We've already worked to remove such a dependency and let Kamelets catalog to be released at any time. However we may need to move the Kamelets Custom Resource Definition into the catalog project. Right now, the CRDs are part of the release cycle of Camel K, so it makes sense to move them out and be able to recover them when required by the installation procedure.

Another important point we may review is the ability to [bundle the Catalog as an OCI container](https://github.com/apache/camel-k/issues/2732). Right Camel K expects the catalog to be a Git repository, but it would be convenient to think other models of distributable artifacts.

## Strengthen other operator supports relationship

It's a bit of a cryptic header, but it means we need to retake the developments and the integrations we have with Knative, Keda and Service Binding. In particular, when we talk about serverless, we need to leverage the latest features offered by those projects and explore them in Camel K.

Quite a long list of desires for sure! Beside them we'll keep working on bug fixing, documentation and technical marketing, so, we'll [welcome any contribution you can provide](/camel-k/next/contributing/developers.html)!


Stay tuned and keep following us on the [community channels](/community/) in order to know how this roadmap plan is progressing along the year.
