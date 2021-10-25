---
title: "Custom Web API Component"
date: 2020-01-07
draft: false
authors: [fvaleri]
categories: ["Usecases"]
preview: "Build your own custom Web API Component from scratch."
---

Have you built a new great Web API for your product? Wouldn't be wonderful to have it available as a part of the great [Apache Camel component family](/components/next/)? We would love it.

The community just released [Camel 3](/blog/2019/12/Camel3-Whatsnew/) which is more modular, lightweight and already includes lots of components (300+) to quickly integrate various systems consuming or producing data. All of these components can be used with the same integration domain specific language (DSL) based on the famous [Enterprise Integration Patterns](https://www.enterpriseintegrationpatterns.com) (EIPs).

Creating a new component is actually pretty simple and, as a benefit, you will also have the possibility to use Camel sub-projects to make your Web API available within different runtimes: [SpringBoot](https://github.com/apache/camel-spring-boot) (auto-config), [Quarkus](https://github.com/apache/camel-quarkus) (Java native compilation) and [Camel-K](https://github.com/apache/camel-k) (serverless work).

This minimal, yet complete, example will focus on all the steps required to create and contribute your own Web API component to the Apache Camel codebase.

As prerequisites you just need OpenJDK 1.8 and Maven 3.5+.
[Download the complete source code](camel-chuck.zip).

## API endpoint

To keep the example short and simple, we have chosen the [free JSON API for hand curated Chuck Norris facts](https://api.chucknorris.io). This is perfect to showcase how to create our new component, without having to deal with all the details and complexity of a full blown API.

There are a few endpoints available, but we will use the following to retrieve a random joke in JSON format:

```sh
$ curl https://api.chucknorris.io/jokes/random | jq
{
  "categories": [],
  "created_at": "2016-05-01 10:51:41.584544",
  "icon_url": "https://assets.chucknorris.host/img/avatar/chuck-norris.png",
  "id": "TMGDYHjLSu-G5Jkueph9lA",
  "updated_at": "2016-05-01 10:51:41.584544",
  "url": "https://api.chucknorris.io/jokes/TMGDYHjLSu-G5Jkueph9lA",
  "value": "Who wins in a race car race? chuck Norris always wins. No excuses."
}
```

## Checkout and initial setup

The first step is to fork the official [Camel project on Github](https://github.com/apache/camel) and then clone it on your local machine with the following shell command (replace `$USERNAME` with yours):

```sh
$ git clone git@github.com:$USERNAME/camel.git
$ cd camel/components
```

At this point we could use the `camel-archetype-component` to generate the project skeleton, but I usually prefer to do it from scratch:

```sh
$ mkdir -p camel-chuck/src/main/java/org/apache/camel/component/chuck \
    && mkdir -p camel-chuck/src/main/docs/chuck-component.adoc \
    && mkdir -p camel-chuck/src/test/java/org/apache/camel/component/chuck \
    && mkdir -p camel-chuck/src/test/resources \
    && cd camel-chuck
```

Now we need to create the project object module (POM) for Maven build (use the same parent version that you find in `camel/pom.xml`):

```sh
$ cat <<EOF > pom.xml
<?xml version="1.0" encoding="UTF-8" ?>
<project xmlns="http://maven.apache.org/POM/4.0.0" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
    xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 http://maven.apache.org/maven-v4_0_0.xsd">
<modelVersion>4.0.0</modelVersion>

    <parent>
        <groupId>org.apache.camel</groupId>
        <artifactId>components</artifactId>
        <version>3.1.0-SNAPSHOT</version>
    </parent>

    <artifactId>camel-chuck</artifactId>
    <packaging>jar</packaging>
    <name>Camel :: Chuck</name>
    <description>Camel Chuck Norris API</description>

    <dependencies>
        <dependency>
            <groupId>org.apache.camel</groupId>
            <artifactId>camel-support</artifactId>
        </dependency>
        <!-- test dependencies -->
        <dependency>
            <groupId>org.apache.camel</groupId>
            <artifactId>camel-test-junit5</artifactId>
            <scope>test</scope>
        </dependency>
        <dependency>
            <groupId>org.apache.logging.log4j</groupId>
            <artifactId>log4j-core</artifactId>
            <scope>test</scope>
        </dependency>
        <dependency>
            <groupId>org.apache.logging.log4j</groupId>
            <artifactId>log4j-slf4j-impl</artifactId>
            <scope>test</scope>
        </dependency>
    </dependencies>
EOF
```

Let's also add the log4j2 configuration that will be useful while testing:

```sh
$ cat <<EOF > src/test/resources/log4j2.properties
appender.out.type = Console
appender.out.name = out
appender.out.layout.type = PatternLayout
appender.out.layout.pattern = %d [%15.15t] %highlight{%-5p} %-30.30c - %m%n
rootLogger.level = INFO
rootLogger.appenderRef.out.ref = out

loggers = mine
logger.mine.name = org.apache.camel.component.chuck
logger.mine.level = INFO
EOF
```

That's all for the initial setup, your project folder should look like this:

```sh
$ tree
.
├── pom.xml
├── src
│   ├── main
│   │   ├── docs
│   │   │   └── chuck-component.adoc
│   │   └── java
│   │       └── org
│   │           └── apache
│   │               └── camel
│   │                   └── component
│   │                       └── chuck
│   └── test
│       ├── java
│       │   └── org
│       │       └── apache
│       │           └── camel
│       │               └── component
│       │                   └── chuck
│       └── resources
│           └── log4j2.properties
```

## Component creation

After the initial project setup, we are ready to add the component main building blocks.

When the Camel Context starts, it creates the Component object, that creates the Endpoint object, that in turns creates the Producer and the Consumer objects as needed. The Camel API includes convenient default implementation for all of them, that are also easy to extend.

Our component class extends the DefaultComponent class and we also add a configuration class to hold component's query parameters that will allow some level of customization.

```java
@Component("chuck")
public class ChuckComponent extends DefaultComponent {
    @Override
    protected Endpoint createEndpoint(final String uri, String remaining, final Map<String, Object> parameters) throws Exception {
        final ChuckConfiguration configuration = new ChuckConfiguration();
        //…
    }
}
```

Then, we need to extend the DefaultEndpoint and the DefaultAsyncProducer to be able to support asynchronous HTTP requests. For the vast majority of web APIs we don't need to create a Consumer, unless you have a polling endpoint. In that case, you would need to extend ScheduledPollEndpoint and ScheduledPollConsumer.

```java
@UriEndpoint(firstVersion = "3.0.0", scheme = "chuck", title = "Chuck", syntax = "chuck:type", label = "chuck", producerOnly = true)
public class ChuckEndpoint extends DefaultEndpoint {
    @UriParam
    private ChuckConfiguration configuration;
    //…
    @Override
    protected void doStart() throws Exception {
        //…
    }
    @Override
    protected void doStop() throws Exception {
        //…
    }
    @Override
    public Producer createProducer() throws Exception {
        return new ChuckProducer(this);
    }
    @Override
    public Consumer createConsumer(Processor processor) throws Exception {
        throw new UnsupportedOperationException("No support for consumers");
    }
}

public class ChuckProducer extends DefaultAsyncProducer {
    @Override
    public boolean process(Exchange exchange, AsyncCallback callback) {
        //…
        return false;
    }
}
```

In the process method of the Producer we return false to signal that the processing will be executed asynchronously. Look at the repository for the full source code, but these are the only classes needed to start building a new component.

### API service

To implement the call logic we need to add some more dependencies, mainly to deal with the HTTP request and JSON parsing.

```xml
        <dependency>
            <groupId>org.asynchttpclient</groupId>
            <artifactId>async-http-client</artifactId>
            <version>${ahc-version}</version>
        </dependency>
        <dependency>
            <groupId>com.fasterxml.jackson.core</groupId>
            <artifactId>jackson-databind</artifactId>
        </dependency>
        <dependency>
            <groupId>com.fasterxml.jackson.core</groupId>
            <artifactId>jackson-annotations</artifactId>
            <version>${jackson2-version}</version>
        </dependency>
        <dependency>
            <groupId>com.fasterxml.jackson.datatype</groupId>
            <artifactId>jackson-datatype-jsr310</artifactId>
            <version>${jackson2-version}</version>
        </dependency>
```

The [AsyncHttpClient](https://github.com/AsyncHttpClient/async-http-client) (AHC) library is built on top of Netty and allows Java applications to easily execute asynchronous HTTP requests and it fits nicely with the Camel asynchronous routing engine. [JacksonDataBind](https://github.com/FasterXML/jackson-databind) is used to convert JSON data to and from plain old Java object (POJO) using annotations.

The model for our API is really basic and consists of one annotated class:

```java
@JsonIgnoreProperties(ignoreUnknown = true)
public class RandomJoke {
    @JsonProperty("id")
    private String id;
    @JsonProperty("url")
    private String url;
    @JsonProperty("value")
    private String value;
    …
}
```

The service interface represents our API adapter and contains a method to call the random jokes endpoint which takes a callback object. This is the method called by our AsyncProducer class as defined by the message pipeline (see the test example in the next section).

```java
public interface ApiService {
    void randomJoke(Exchange exchange, AsyncCallback callback);
}
```

You can check the implementation of this interface which uses the AsyncHttpClient to actually do the HTTP request. The most interesting part is the ChuckAsyncHandler inner class, that gets the response and handles the Camel Exchange object (message container).

### Unit and integration tests

A component would not be complete without a good set of unit and integration tests. This is also an easy task to do thanks to the CamelTestSupport which has some nice abstractions that allows you to create and test your routes.

In this case we add the [Wiremock](https://github.com/tomakehurst/wiremock) dependency, which is a tool for HTTP response stubbing:

```xml
        <dependency>
            <groupId>com.github.tomakehurst</groupId>
            <artifactId>wiremock</artifactId>
            <version>${wiremock-version}</version>
            <scope>test</scope>
        </dependency>
```

In the integration test we simply create a RouteBuilder and call our Web API by using Message Endpoint EIP (`to`) and our component's URI (`chuck:jokes`), also logging the response. We are implicitly using the default base API URL that you can find in the ChuckConfiguration class, among the other parameters.

```java
public class ChuckComponentTest extends CamelTestSupport {
    @Test
    public void testRandomJoke() throws Exception {
        MockEndpoint mock = getMockEndpoint("mock:result");
        mock.expectedMinimumMessageCount(1);
        mock.expectedBodyReceived().body(RandomJoke.class);
        template.sendBody("direct:test", "");
        assertMockEndpointsSatisfied();
    }

    @Override
    protected RouteBuilder createRouteBuilder() throws Exception {
        return new RouteBuilder() {
            public void configure() {
                from("direct:test")
                  .to("chuck:jokes")
                  .log("${body}")
                  .to("mock:result");
            }
        };
    }
}
```

The unit test is the same, but this time we need to abstract away the real API by using a Fake web server running on localhost that will return a fixed response contained in `src/main/resource/__files/json/random-joke.json`. Note how we use the Camel's `AvailablePortFinder` utility to get the mock's port.

```java
    private static WireMockServer wireMockServer;
 
    @BeforeAll
    public static void startServer() {
        port = AvailablePortFinder.getNextAvailable();
        wireMockServer = new WireMockServer(port);
        wireMockServer.start();
        setupStubs();
    }

    public static void setupStubs() {
        wireMockServer.stubFor(get(urlEqualTo("/jokes/random"))
            .willReturn(aResponse()
                .withHeader("Content-Type", "application/json; charset=UTF-8")
                .withStatus(HttpURLConnection.HTTP_OK)
                .withBodyFile("json/random-joke.json")));
    }
```

As an additional step we also need to customize the component's base URL to make it use our fake server on localhost:

```java
    @Override
    protected CamelContext createCamelContext() throws Exception {
        final CamelContext context = super.createCamelContext();
        context.disableJMX();
        final ChuckComponent component = new ChuckComponent();
        component.setBaseUrl("http://localhost:" + port);
        context.addComponent("chuck", component);
        return context;
    }
```

To run unit tests and code style check use the following command (check the required `maven-surefire-plugin` configuration in `pom.xml`):

```sh
$ mvn clean install -Psourcecheck
```

We run the slow integration tests using a different profile, that is not executed as part of the default build lifecycle:

```sh
$ mvn clean test -Pint
```

## Final integration and PR

The component is almost ready to be integrated in the current Camel codebase. To automatically generate the component documentation you just need to add the following placeholders and Camel plugins will take care of it.

```sh
$ cat <<EOF > src/docs/chuck-component.adoc

// component options: START
// component options: END

// endpoint options: START
// endpoint options: END

EOF
```

Then, put the new component into the list of all Camel components by manually adding the module in `components/pom.xml`. Before doing a full build, it is also good to rebase the project to get the latest changes:

```sh
$ git remote add upstream git@github.com:apache/camel.git
$ git pull --rebase upstream master

$ cd ../..
$ mvn clean install -Pfastinstall
```

Finally, if the build is successful, you can create a new branch to host your changes, commit to your local repository and push the branch:

```sh
$ git checkout -b camel-chuck
$ git add .
$ git commit -m "camel-chuck component"
$ git push
```

The last step is to open a Pull Request (PR) directly from GitHub pages and wait for the community review and feedback. If you need any help before the PR, simply send an email to the developers mailing list and we will do our best to help.

Happy coding :)
