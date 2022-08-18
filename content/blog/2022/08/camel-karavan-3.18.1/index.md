---
title: "Karavan Preview Release 3.18"
date: 2022-08-19
authors: [mgubaidullin]
categories: ["Releases","Tooling"]
preview: "New integration designer capabilities, Karavan on OpenShift, Tekton Pipelines and much more"
---

![logo](toolkit.png)

Karavan is an Integration Toolkit for Apache Camel aimed to increase developer performance through the visualization of routes, integration with runtimes and pipelines for package, image build and deploy to kubernetes out-of-the-box.

Karavan Visual Designer for Integrations supports:
- Enterprise Integration Patterns DSL
- REST DSL
- OpenAPI to REST DSL generator
- Beans and dependencies
- All Kamelets source/sink/action
- All Components consumer/producer
- Integration CRD (*.yaml with kind:Integration) and plain yaml routes

Karavan integrates with the following Camel Runtimes:
- Camel Jbang (local run)
- Camel Quarkus (export and CI pipeline)
- Camel Spring-boot (export only)
- Camel Main (export only)

Karavan can be used as: 
 - a cloud-native application in Kubernetes/OpenShift (FKA cloud/serverless mode)
 - a VS Code extenson

Disclamer:

The version of Karavan is now aligned to the Camel release that the UI designer is based upon. This makes it easier to understand which Camel version Karavan can be used as design editor. However Karavan 3.18 is not LTS.

# Designer Improvements

## Step EIP

To make route clean and good looking user can incapsulate integration logic using `Step` EIP.

`Step` element in Karavan is **expanded** when selected and **collapsed** when not selected.

![theme](./karavan-step-eip.gif)

For existing routes it is possible to move existing DSL elements into `Step` DSL

![theme](./karavan-add-to-step.gif)

# Cloud-native Itegration Toolkit

Karavan cloud-native integration toolkit aimed to be deployed to OpenShift (Kubernetes version is comming) to provide full lifecycle for integrators to build, deploy and monitor their integrations in OpenShift/Kubernetes.

## Architecture

Cloud-native mode includes end-user application integrated with Git repository to store projects, Tekton pipelines to build and deploy integrations to OpenShift/Kubernetes and all menifests required to deploy the toolkit itself. Check [how to deploy Karavan to OpenShift](https://github.com/apache/camel-karavan/tree/main/karavan-builder).

![architecture](./karavan-cloud-native.png)

## Projects

One of the new features in this preview release is projects. Although projects temporary stored in build-in or external [Infinispan](https://infinispan.org/) Karavan uses Git as permanent project storage. Git repository, user and token are configured in Karavan deployment manifest

![theme](./karavan-projects.png)

![theme](./github-projects.png)

## Build and deploy
Karavan uses Tekton Pipelines to build and deploy integrations. Pipeline generates canonical camel-quarkus maven project, then maven package command makes compilation, image build and deployment. No magic!

Caninical Tekton Task and Pipeline come with Karavan. However they could be customize by users to align with their internal requitrements, common practices and standards.

![theme](./karavan-deploy.gif)

## Kubernetes integration

Starting from 3.18 Camel supports placeholders for secrets and configMaps
Karavan supports them as well. In addition Karavan provides selectors for ConfigMaps, Secrets and Services retrieved from Kubernetes.

![theme](./karavan-kube-resourses.gif)

# VS Code extension 

For developers and integrator who prefer local development Karavan could be used as a VS Code extension.
In addidion to the main feature - visual integration designer, Karavan provides a developer performance booster: integration with camel-jbang.

## Run application

Create integration using visual designer and then just click `run` button to run it locally using camel-jbang.
If `--dev` mode is **on** (configurable in VS Code Settings) your integration reloads while editing.
This gives a quick feedback loop.

![theme](./karavan-run.gif)

## Create Application

For advanced features like additional dependencies, export to maven, deployment to Kubernetes/OpenShift camel-jbang requires `application.properties` file configured. User can create it using Karavan with predefined properties for Camel-Qurkus (Spring-Boot and Camel-Main to come). Predefined properties are configurable in VS Code Settings.

![theme](./karavan-vscode-package.gif)

## Export

The latest Camel-jbang 3.18 implements export plain projectless integrations to canonical maven projects.
Karavan provides integration with this feature. Preconfigured `application.properties` (see above) makes this process simple and smooth.

![theme](./karavan-vscode-export.gif)




# Feedback is gold

Deploy Karavan as a [cloud-native integration toolkit](https://github.com/apache/camel-karavan/tree/main/karavan-builder) or install [VS Code extension](https://marketplace.visualstudio.com/items?itemName=camel-karavan.karavan) from the Marketplace.

If you have any idea or find a new issue, please [create a new issue report in GitHub](https://github.com/apache/camel-karavan/issues)!
