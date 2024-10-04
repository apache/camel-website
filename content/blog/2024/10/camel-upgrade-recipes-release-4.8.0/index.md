---
title: "Easier migration with Apache Camel"
date: 2024-10-04
draft: false
authors: [JiriOndrusek]
categories: ["Camel", "Migration"]
preview: "Introducing Camel Upgrade Recipes - A tool to make Apache Camel version upgrades easier."
---

This blog post introduces a [Camel Upgrade Recipes project](https://github.com/apache/camel-upgrade-recipes/) and shows an example of its usage.

# Introduction

Migrating Apache Camel code can often be a tedious and error-prone process, especially when it involves repetitive tasks like renaming classes, updating method signatures, or adapting to new Camel API changes. 
To address this need, [Camel Upgrade Recipes project](https://github.com/apache/camel-upgrade-recipes/) based on OpenRewrite was developed.
The project is not designed to provide fully automated migration but rather to assist with manual migrations, making them more efficient and less error-prone.

Newly developed Camel Upgrade Recipes for such purposes has been released for the first time at version 4.8.0 (version of the project matches the version of the Camel it assists with migrations). 

# Run the example

Consider a project built on Camel 4.3.0 that needs to be migrated to Camel 4.5.0. 
The tool should be executed prior to the manual migration to handle some of the simpler updates. 
In this case, running the tool would involve using the OpenRewrite plugin with the [Camel Upgrade Recipes](https://github.com/apache/camel-upgrade-recipes/)'s specified recipes.
Which might help by making some automated changes before starting the manual migration.

How to run the migration from Camel 4.3.0 to Camel 4.5.0 from terminal:

```shell
mvn -U org.openrewrite.maven:rewrite-maven-plugin:5.20.0:run -Drewrite.recipeArtifactCoordinates=org.apache.camel.upgrade:camel-upgrade-recipes:4.8.0  -DactiveRecipes=org.apache.camel.upgrade.camel44.CamelMigrationRecipe,org.apache.camel.upgrade.camel45.CamelMigrationRecipe
```

In this example, the migration aims to assist with the upgrade from 4.3.0 to 4.5.0. 
Therefore, the command must include all recipes that are greater than 4.3.0 and less than or equal to 4.5.0 from the [Camel Upgrade Recipes' recipes](https://github.com/apache/camel-upgrade-recipes/tree/main/src/main/resources/META-INF/rewrite). 
This ensures that all relevant transformations are applied during the migration process.

# Technical explanations

The project essentially consists of a collection of recipes that are applied using [OpenRewrite](https://docs.openrewrite.org/).

# Conclusion

OpenRewrite recipes were initially created as a part of the [quarkus-updates project](https://github.com/quarkusio/quarkus-updates/) to help migrate camel-quarkus.
Recipes also works with plain Camel. 
As a result, [Camel Upgrade Recipes project](https://github.com/apache/camel-upgrade-recipes/) was introduced to make the recipes available to others for plain Camel migration.

**4.8.0** is the first release of the recipes, and there is still a long way to go before they become widely recognized and fully integrated into Camel's migration process. 
However, other contributors are now helping, and together we are working to build an ecosystem that will make migrating Camel easier for everyone.

Recipes are not meant to replace the manual migration of Camel. They are simply a tool to make the process easier by handling some basic changes, but not all migrations.
