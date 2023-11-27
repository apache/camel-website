---
title: "Migrating from Camel Karaf to Apache Camel 4"
date: 2023-11-01
authors: [davsclaus]
categories: ["Howtos"]
preview: Guidelines for migrating from Camel Karaf to Apache Camel 4
---

Apache Camel 4 was released a few months back. 

This is the 2nd blog post in a series of _migration blogs_ to provide details and help for
users to Camel 4.

The first blog post that focus on [general migration principles can be found here](/blog/2023/10/migrate4]. 

This blog post focuses on migrating from legacy Apache Karaf OSGi Blueprint to Camel 4.

## Migration Tasks

The migration from Camel Karaf and OSGi Blueprint to Camel 4 is not a trivial migration effort.

The migration consists of the following major _tasks_:

1. Upgrading from Camel 2.x/3.x to Camel 4.x.
2. Upgrading to Java 17 or 21
3. Replacing Karaf (OSGi) with Spring Boot, Quarkus, Standalone Camel, etc.
4. Migrating your Camel integrations

All these tasks may seem overwhelming at first, but don't panic. 

## Migrating Camel Karaf to Camel 4

To migrate Camel integrations that are camel-karaf based requires migrating:

1. Java code from Camel 2.x/3.x to Camel 4.x
2. Migrate OSGi Blueprint XML files to Camel 4 XML/YAML DSL.

To help you with this migration effort on the way, we have built support into [camel-jbang](/manual/camel-jbang.html),
that can be used during this migration.

Let's use one of the examples from camel-karaf and go over the effort needed.

### Migration your first example

We will first go over the [camel-example-sql-blueprint](https://github.com/apache/camel-karaf-examples/tree/main/examples/camel-example-sql-blueprint) example.
This example has some custom Java source and Camel routes in OSGi blueprint XML file.

To quickly check _how bad_ the situation is, we will use `camel-jbang` and let it run the example and see what happens:

```
cd examples/camel-example-sql-blueprint
camel run pom.xml
```

In `camel-jbang` we have made it possible to let Camel run as _best effort_ any existing Maven based project, but running the `pom.xml` file.
This is not expected to be a replacement for Maven or how you should use to run Camel, but its part of the migration experience that greatly helps you.

If you run the example you will notice it runs without any error. 

What happens is that `camel-jbang` was able to load the OSGi blueprint XML file, parse <bean> and <camelContext> and run this on a modern Camel 4.
This means the migration effort for this example is minimal.

What is needed to be migrated is the OSGi Blueprint XML file to either XML or YAML DSL. This can be done with the new `transform` command in
`camel-jbang` as follows:

```
cd examples/camel-example-sql-blueprint
camel transform pom.xml 
```

**NOTE:** The `transform` command is renamed to `transform route` in Camel 4.3 onwards.

This will dump the Blueprint XML file _transformed_ into modern Camel 4 YAML DSL. If you want to output in XML you can do:

```
cd examples/camel-example-sql-blueprint
camel transform pom.xml --format=xml
```

You can also use `camel transform` to write the output to file/dirs, instead of printing to console.

```
cd examples/camel-example-sql-blueprint
camel transform pom.xml --format=xml --output=code
```

This will write the migrated files into code sub folder. 

Use `camel transform --help` to see more details of this command.

The migration effort, is then afterward to export this to a chosen runtime such as Spring Boot, Quarkus or Camel Main.
Notice that the export functionality does not support migrate and transform in one go. So you would need to manually
copy the transformed OSGi Blueprint file into appropriate folder. 

You can export as shown below:

```
cd examples/camel-example-sql-blueprint
camel export pom.xml --gav=com.mycompany:myproject:1.0 --runtime=spring-boot --dir=code 
```

After the export you would need to clean up the project a bit as the export is not fully supporting Camel Karaf based projects (yet).

You would need to copy the transformed XML file into `src/main/resources/camel` folder, and delete the old OSGI blueprint file.
Also, the karaf `features.xml` file should be deleted.

You also need to copy over values from `sql.properties` as the export tool only support when they are defined in `application.properties`.
So we copy the values from `sql.properties` to `code/src/main/resources/application.properties`.

And after this you can compile and run this with Spring Boot

```
cd code
mvn package spring-boot:run
```

The application runs on Spring Boot and has been successfully migrated.

Now let's migrate another example that is a bit more complex and requires more effort 

### Migrating with more difficulty 

This time we migrate [camel-example-openapi-osgi](https://github.com/apache/camel-karaf-examples/tree/main/examples/camel-example-openapi-osgi) example,
that requires changes in the DSL as well.

So first lets try to run it out of the box:

```
cd camel-example-openapi-osgi
camel run pom.xml
```

TODO: 


## Summary

TODO: Limitations in OSGi transform

You can find more details in the Camel 3.x/4.x [migration and upgrade guides](/manual/migration-and-upgrade.html).