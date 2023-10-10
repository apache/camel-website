---
title: "Migrating to Apache Camel 4"
date: 2023-10-10
authors: [davsclaus, essobedo]
categories: ["Howtos"]
preview: Guidelines for migrating to Apache Camel 4
---

Apache Camel 4 was released a few months back. This blog post is a general guideline for Camel users
that are seeking information how to migrate from Camel 2 or 3.

We plan to launch a series of blog posts in the near future with more specific details on migrating, such as migrating from Camel Karaf
to Camel 4 on Spring Boot or Quarkus. 

Apache Camel 4.0 is a fork of Camel 3.20. In other words, after the 3.20.0 release, we shifted the `main`
code branch to be Camel 4. This affects how to migrate to Camel 4, as you essentially need to migrate to Camel 3.20 first.
And then afterward you can migrate to Camel 4.x.

Camel 4 requirements:

- Java 17 or 21 (Official Java 21 support is planned for Camel 4.2)
- Spring Boot 3
- Quarkus 3
- Jakarta EE APIs

Migration Plan:

1. Migrate from Camel 2.x to 3.0 (only relevant for Camel 2 users)
2. Upgrade from Camel 3.x to 3.20
3. Migrate from Camel 3.20 to 4.0
4. Upgrade from 4.0.x to 4.x

You can find more details in the [migration and upgrade guides](/manual/migration-and-upgrade.html).

We anticipate the migration effort for most end users from Camel 3 to 4 is a _minor effort_, as Camel 4
was a release led by Spring Boot 3, Quarkus 3, and the Jakarta EE migration. 

There are Camel components that have been removed in Camel 4 as they were either deprecated in v3, or they do
not support Jakarta EE, or their underlying project is no longer active. You can find a list of components
that have been removed (with suggestions for new components to use) in the [camel 4 migration guide](manual/camel-4-migration-guide.html).

In terms of backward compatibility, then Camel 4 is mostly compatible with regular Camel applications.
However, if you are using some advanced features and other plugins in Camel, then migrating
the code to the new version might be needed. Additionally, custom components must be migrated and recompiled.

Users that uses custom or advanced features of Apache Camel, such as adding and removing routes dynamically
via programmatic APIs, and users that rely on `ExtendedCamelContext`, will need to migrate and adapt code.

