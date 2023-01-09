---
title: "Camel K 2022 roadmap - retrospective"
date: 2023-01-09
authors: [squakez]
categories: ["Roadmap", "Camel K"]
preview: Quick review of Camel K development in 2022
---

[(c) @TivadarDanka](https://twitter.com/tivadardanka/status/1588131890040434688)

2023 has come, and with that it is time to make a little retrospective on the work we have completed in 2022 in Camel K project. We are already collecting ideas to submit to the community for 2023 in order to define the new roadmap. Stay tuned, more is coming shortly...

## Camel K 2022 roadmap update

It's been a long ride and here a short resume of what we accomplished during the last year in Camel K project. We had a [roadmap plan](/blog/2022/03/camel-k-roadmap-2022/) defined at the begining of the year, let's have a look and see what we accomplished:

### Multi-architecture images partially achieved

This was a nice contribution that is allowing to leverate the capability of building multi-architecture image containers via Buildah. Definetely a great way to start experimenting with the feature and likely something we'll be willing to invest time in 2023.

### Nightly releases

We now use the very last bits from Camel K Runtime and Kamelets as well. If you're one of those person that cannot stand waiting for a stable release to come to try out new exciting stuff, then, likely you haven't missed this. Every night you can get a version of Camel K with the latest features/fixes baked into it (though, it's not guaranteed to be fully working).

### Adding `kamel install` feature parity to Kustomize

We've worked to strenghten the offering of installation via [Kustomize](/camel-k/next/installation/advanced/kustomize.html), that may see more advance in 2023.

### Provided a full description of the APIs

We now all understand what an IntegrationKit is... :P Tools such as [Kaoto](https://kaoto.io/) or [Karavan](https://marketplace.visualstudio.com/items?itemName=camel-karavan.karavan) may benefit from this as it is easier to understand the meaning of Camel K API now that it's written in stone!

### Refactoring of traits: now they are part of the API definition

Quite big refactoring effort. We are now able to read the traits definition through the API.

### Encapsulated configuration logic into traits

We're harmonizing the way to configure Camel K Integration putting the logic into traits (`mount` trait). We've deprecated the possibility to directly do it in the Integration specification.

### `kamel promote` command

Tired of reinventing the wheel and to find out how to promote a Camel K Integration in your cluster? Just `kamel promote`!

### New multi tenancy

You can now create as many operators as you want and be able to define your own multi-tenancy model by assigning your Integration the name of the operator you whish to take care of it.

### Improved the user experience when an Integration fail

You should no longer look the operator log to know what's going on! Just look at the Integration failing conditions.

### Enabled support for KEDA autoscalers

If you want to auto-scale your resources such as data storages and other services.

### Bundle local java dependencies in your application

No more need to publish your local dependency to a Maven repository. Just use it from your local filesystem via `kamel run -d file:/path/to/dep.jar`.

### Howtos blogs

We've developed a series of "How to" blog post to show main operations on Camel K: [testing](/blog/2022/11/camel-k-jbang/), [monitoring](/blog/2022/07/camel-k-monitoring-ops/), [promoting](/blog/2022/10/camel-k-cicd/) an Integration. You now knows how to do all that stuff ;)

Beside all that stuff, we've made an enourmous work of stabilization (73 known bugs fixed) and an hidden work of automating the process that will strengthen our ability to focus on deliverying new exciting features. On behalf of Camel community we wish you a Happy New Year. 2023 is going to be a great year for Apache Camel with Camel 4 on the way!
