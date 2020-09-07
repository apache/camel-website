---
title: "Apache Camel 3.5 What's New"
date: 2020-09-04
authors: [oscerd, davsclaus]
categories: ["Releases"]
preview: Details of what we have done in the Camel 3.5 release.
---

Apache Camel 3.5 has just been released.

This is a non-LTS release which means we will not provide patch releases, but use the release _as-is_.
The next planned LTS release is 3.7 scheduled towards end of the year.


### So whats in this release?

This release introduces new set of features and noticeable improvements that will we cover in this blog post.

#### Java 14

This is the first release that supports Java 14. 


### Spring Boot

We have upgraded to latest release at this time which is Spring Boot 2.3.3.

A new `camel-spring-boot-bom` BOM has been added that only contains the supported Camel Spring JARs for Spring Boot.
The existing `camel-spring-boot-dependencies` is a much bigger set of BOM that is curated to align Camel and Spring Boot
dependencies. For more details see the [following documentation](https://camel.apache.org/camel-spring-boot/latest/#_camel_spring_boot_bom_vs_camel_spring_boot_dependencies_bom).


#### JUnit 5

We have finished migrating all the unit tests of Camel itself to JUnit 5. Support for JUnit 4 is still present
but will eventually be deprecated and removed in the future (when JUnit 5 is widespread adopted).

The Camel test modules that support JUnit 5 has conveniently -junit5 in their JAR name.

We have also refactored the `camel-test-spring-junit5` for Spring Boot users with a new `@CamelSpringBootTest` annotation
that you mark on your unit test class instead of using JUnit 4.x `@RunWith`.

See the [camel-spring-boot-example](https://github.com/apache/camel-spring-boot-examples/tree/master/camel-example-spring-boot)
for an example, or the Camel 3.5 [upgrade guide](https://camel.apache.org/manual/latest/camel-3x-upgrade-guide-3_5.html#_spring_boot_testing_with_junit_5).


#### LambdaRouteBuilder

We have added a new `LambdaRouteBuilder` which allows to easily define a Camel route using Java lambda style:

    rb -> rb.from("timer:foo").log("Hello Lambda");
        
For example users with Spring Boot or Quarkus may want to use dependency injection style to define
beans and configurations; and now also Camel routes via lambda styles:

For example in a Spring Boot configuration class you can add a Camel route via `@Bean` annotation:

    @Bean
    public LambdaRouteBuilder myRoute() {
        return rb -> rb.from("kafka:cheese").to("jms:cheese");
    }

Notice you can only define 1 route per lambda route builder (you can have many `@Bean` methods).
The regular `RouteBuilder` can define as many routes you want in the same builder.

See more details at the [LambdaRouteBuilder](https://camel.apache.org/manual/latest/lambda-route-builder.html)
documentation.


#### Parameterize routes

This is one of the biggest new feature which goes by the name [route templates](https://camel.apache.org/manual/latest/route-template.html).
A route template is a way of parameterizing a route where you specify parameters that are mandatory,
and which are optional, and potential default values and descriptions. Then you can instantiate new routes
from the route templates by its template id, and the provided parameters.

For example you can have a route template that define how clients can integrate with a given system of yours.
Then as new clients is added, you can standup a new route from the template with client specific parameters.

This feature will also play a great role in Apache Camel K and the serverless landscape with Knative.
In this world the route templates are used as part of a bigger puzzle which we named _kamelets_. More details
is coming in a new blog posts.

See more details at the [route templates](https://camel.apache.org/manual/latest/route-template.html) documentation,
and in this [little example](https://github.com/apache/camel-examples/tree/master/examples/camel-example-routetemplate).


#### Optimized components startup

The camel core has been optimized in Camel 3 to be small, slim and fast on startup. This benefits Camel Quarkus which
can do built time optimizations that take advantage of the optimized camel core.

We have continued this effort in the Camel components where whenever possible works is moved ahead
to an earlier phase during startup, that allows enhanced built time optimizations. As there are a lot of Camel
components then this work will progress over the next couple of Camel releases. 


#### Even more reflection free

We continued to remove usage of reflection in Camel and this time we discovered that were some parts
of API components that could still use reflection. This has now been improved so they are using source code
generated _configurers_ to configure themselves which means its all just regular Java method calls (no reflection).

There were also a few spots in Rest DSL which wasn't reflection free either, this has been corrected.


#### Enhanced properties binding

We have also enhanced the _configurers_ to include details about what value types collections contain (eg Map, List, arrays).

For example given the below configuration:

    camel.beans.foo.countries[usa] = #class:com.foo.MyCountry
    camel.beans.foo.countries[usa].name = United States of America
    camel.beans.foo.countries[usa].language = EN
    camel.beans.foo.countries[de] = #class:com.foo.MyCountry
    camel.beans.foo.countries[de].name = Germany
    camel.beans.foo.countries[de].language = DE

Then the `foo` bean has a property named `country` that is a `java.util.Map` type.
The Map contains element of type `com.foo.MyCountry` that has been explicit configured above.

However Camel is now capable to know this information by source code generated _configuers_:

        @Configurer
        public class Foo
        
            private Map<Country> countries;
            
            // getter/setter omitted
        } 

The `Foo` class has been annotated with `@Configurer` which allows Camel tooling to generate reflection free configurers source code.
This is what Camel internally uses to do its vast configuration of all its EIPs, components and so on. Now we have exposed
this for end users. Notice how the Map contains the collection type as a generic type with `Map<Country`. That information
is now generated in the configuers, so Camel knows. Therefore the configuration can be shortened to:

    camel.beans.foo.countries[usa].name = United States of America
    camel.beans.foo.countries[usa].language = EN
    camel.beans.foo.countries[de].name = Germany
    camel.beans.foo.countries[de].language = DE

The work did not stop there. By knowing the value type of the collection types, we allow to do reflection free
[binding collections](https://camel.apache.org/manual/latest/property-binding.html).

There has been many other smaller improvements in Camels properties bindind. Camel uses this heavily internally during
startup to configure and setup all of its things such as components, EIPs, routes etc. This work has been streamlined
across the various runtimes; whether its standalone, Spring Boot, Quarkus, Camel K, Camel Kafka Connector, 
or the good old XML routes.

The Camel Kafka Connector project is using property binding in its configuration and therefore is a heavy user of this.


#### FluentProducerTemplate thread-safety

The fluent `ProducerTemplate` had an issue where it may not be thread-safe. This has been corrected.


#### New components

There are a 8 new components:

- ArangoDB: Perform operations on ArangoDb when used as a Document Database, or as a Graph Database
- AWS2-STS: Manage AWS STS cluster instances using AWS SDK version 2.x.
- Azure Eventhubs: The azure-eventhubs component that integrates Azure Event Hubs using AMQP protocol. Azure EventHubs is a highly scalable publish-subscribe service that can ingest millions of events per second and stream them to multiple consumers.
- JSonata: JSON to JSON transformation using JSONATA.
- Minio: Store and retrieve objects from Minio Storage Service using Minio SDK.
- OAI-PMH: Harvest metadata using OAI-PMH protocol
- Vert.x HTTP Client: Camel HTTP client support with Vert.x
- Vert.x WebSocket: Camel WebSocket support with Vert.x


#### Camel-Kafka-connector

The next Camel-Kafka-connector 0.5.0 (not LTS) will be based on Camel 3.5.0. The project will leverage all the new shiny improvements done on the Property Binding.
With 3.5.0 Camel-Kafka-connector will also get a bunch of new connectors for free and this is super cool. So stay tuned for the next non-LTS release.


### Upgrading

Make sure to read the [upgrade guide](https://camel.apache.org/manual/latest/camel-3x-upgrade-guide-3_5.html) if you
are upgrading to this release from a previous Camel version. 

