---
title: "Top 10 features of Camel 3.x"
date: 2022-06-15
draft: false
authors: ["assimbly"]
categories: ["Camel"]
preview: "Top 10 features of Camel 3.x"
---

At the end of 2019 Camel 3 arrived. Some main features were modularization of the core and support for Java 11. A bunch of other changes were mentioned in Claus Ibsen's blog:

[Apache Camel 3 What's New (top 10)](/blog/2019/12/Camel3-Whatsnew/)

In this blog, we focus on the top 10 of features that arrived since the 3.0 release. As an overview, but also to give some attention to features not everyone is aware of. Just in case you missed them :)

## 1. Optimizations

Changes that benefits every Camel user, are optimizations. Camel 3 started a big optimization round with faster startup and a lower footprint. From then, it was an ongoing process: 

- To make the startup faster
- To make the code reflection free
- To reduce object allocation

Altogether it makes Camel lighter to run, avoid unnecessary garbage collection and make the code native compilation friendly. Especially running as a microservice or a serverless function in the cloud, this makes a huge difference.

##  2. Camel Standalone

Camel main was introduced in Camel 3 to provide means to run Camel standalone without the need for a runtime (like Karaf, WildFly or Quarkus). It's possible to create a new project for Camel main and various other runtimes on:

https://kameleon.dev

## 3. Camel CLI (JBang)

Another option, to make it easier to run Camel, is support for the command line. JBang provides an environment to compile, resolve dependencies and see direct results on the command line:

https://www.jbang.dev/try/

Camel on JBang is now supported through a JBang extension:

https://camel.apache.org/manual/camel-jbang.html

After installing the Camel extension in JBang you can run routes (whether they are written in Java DSL, XML DSL or YAML DSL). You can even mix them like this:

```
camel run route1.java route2.xml route3.yaml
```

##  4. Camel UI Designer (Karavan)

Camel JBang is particularly there to run routes. Designing routes is possible through a new UI Designer named Karavan. Just give it a try in Visual Studio Code or the standalone version:

https://github.com/apache/camel-karavan

##  5. Camel DSL

Some benefits of Camel K have being ported into Camel 3. Now it's possible to create routes in various languages like:

- Java
- Kotlin
- Groovy
- XML
- Yaml

It's also possible to mix them. Another enhancement to the Camel DSL was the introduction of the Endpoint DSL. This allows a type-safe and intelligent code completion.

The following code:

```java
from("ftp://foo@myserver?password=secret&recursive=true&
               ftpClient.dataTimeout=30000&
               ftpClientConfig.serverLanguageCode=fr")
 ```
 
can be written with the Endpoint DSL like this:

```java
from(ftp("myserver").account("foo").password("secret").recursive(true)
            .advanced()
                .ftpClientParameters(Collections.singletonMap("dataTimeout", 30000))
                .ftpClientConfig(Collections.singletonMap("serverLanguageCode", "fr")))
```                

Also lambda expressions are now supported to write routes like the following example:

```java
public class MyConfiguration {
    @BindToRegistry
    public LambdaEndpointRouteBuilder myRoute() {
        return rb -> rb.from(rb.kafka("cheese")).to(rb.jms("queue:foo"));
    }
}
```

##  6. Route Templates (Kamelets)

One of the biggest new features of Camel 3 are Route Templates. A route can then be initiated by calling the template with its parameters.

Here is an example:

```java

public class MyRouteTemplates extends RouteBuilder {

    @Override
    public void configure() throws Exception {
        // create a route template with the given name
        routeTemplate("myTemplate")
            // here we define the required input parameters (can have default values)
            .templateParameter("name")
            .templateParameter("greeting")
            .templateParameter("myPeriod", "3s")
            // here comes the route in the template
            // notice how we use {{name}} to refer to the template parameters
            // we can also use {{propertyName}} to refer to property placeholders
            .from("timer:{{name}}?period={{myPeriod}}")
                .setBody(simple("{{greeting}} ${body}"))
                .log("${body}");
    }
}
```

This can now be initiated  as 

```java
TemplatedRouteBuilder.builder(context, "myTemplate")
    .parameter("name", "one")
    .parameter("greeting", "Hello")
    .add();
```

or 

```xml
<templatedRoutes xmlns="http://camel.apache.org/schema/spring">
  <templatedRoute routeTemplateRef="myTemplate">
    <parameter name="name" value="one"/>
    <parameter name="greeting" value="Hello"/>
  </templatedRoute>
</templatedRoutes>
```

or

```java
from("direct:setMyBody")
    .to("kamelet:myTemplate?name=one&greeting=Hello");
```    

The last example, a Kamelet, makes it possible to call a template as a normal Camel endpoint. Note there is a whole catalog with almost 200 predefined templates (aka Kamelets) available:

https://camel.apache.org/camel-kamelets/0.8.x/index.html

These Kamelets are about a certain use case, instead of components which are more about a certain protocol or technology.

##  7. Route Load and Reload

The routesloader enable to load or update Camel routes from various resources. These routes can be written in for example the XML DSL or the YAML DSL and load from file, classpath, string or URL. When the routes are loaded from a directory, the routes can also [reload](https://camel.apache.org/manual/route-reload.html) when a file changes.

## 8. Route Configuration

Camel 3.12 introduced route configuration, which is used for separating configurations from the routes. This can be used in situations such as configuring different error handlers across a set of routes. In previous versions of Camel, this somewhat cumbersome to do, as you would either have to copy the same configuration to a set of routes or rely on a global error handling configuration.
Now you can configure a number of route configurations, and then specify on each route which configuration to use (you can use match by IDs, wildcards, and regular expression).

https://camel.apache.org/manual/route-configuration.html

## 9. Running Java

In Camel 2 it was possible to run JavaScript code from a Camel route. With Camel supporting Java 11 (and now also 17) this is unfortunately no longer possible as the JavaScript engine (Nashorn) was deprecated since Java 9 (and removed altogether from Java since version 15). 

The good news it's now possible to run Java code (with some limitations) through the jOOR language:

https://camel.apache.org/components/3.17.x/languages/joor-language.html

## 10. Load properties from vault/secrets cloud services

Sometimes secrets like passwords are managed in the cloud. The question is, how can you use them within Camel? Since Camel 3.16 this is possible for various cloud providers like Amazon and Google. Then you can refer to a secret like this:

```xml
<camelContext>
    <route>
        <from uri="direct:start"/>
        <log message="Username is {{aws:username}}"/>
    </route>
</camelContext>
```

[Camel 3.16.0 new feature: Load properties from Vault/Secrets cloud services](https://medium.com/r/?url=https%3A%2F%2Fcamel.apache.org%2Fblog%2F2022%2F03%2Fsecrets-properties-functions%2F)
