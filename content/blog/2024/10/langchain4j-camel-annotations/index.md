---
title: "Using Camel annotations with LangChain4j high level api available in next Camel Quarkus release"
date: 2024-10-10
draft: false
authors: [aldettinger]
categories: ["Camel", "AI"]
preview: "Explain how to use the Camel parameter binding annotations on LangChain4j AI service method parameters."
---

# Introduction

In a [previous blog post](/blog/2024/09/data-extraction-example/), we have seen how Camel could be used to transform raw unstructured text into structured Java objects. The shown example actually uses the [LangChain4j high level API](https://docs.langchain4j.dev/tutorials/ai-services) where a Java interface will handle the interactions needed with the underlying Large Language Model. However, at this time, a [Quarkus LangChain4j issue](https://github.com/quarkiverse/quarkus-langchain4j/issues/888) prevented the usage of the [Camel parameter binding annotations](/manual/parameter-binding-annotations.html).
This issue will be fixed in the next Camel Quarkus release, so let's see how it will work.

# Imagine a situation

Imagine a situation where an LLM should answer a question about an exchange with the following body:

```
The car ALPHA4 in its equipped version is priced 40000$. It means higher safety for no more than 2500 additional bucks.
In Europe, the situation is a bit different. The low equipped version of the TRIUMPH car series are far more secured in comparison.
And one would need to afford 50000€ to buy the high level model which is just barely safer.
```

After a close look, there are plenty of information that could be extracted by an LLM like the car model, price, level of equipment and so on.
Thinking a bit more, it would be very handy if we could customize a bit the questions sent to the LLM.
For instance, we could imagine an incoming exchange with a header named `carName` that would take values like `ALPHA4` and `TRIUMPH`.
If we were able to inject this header value in the LLM prompt, we would then be able to ask questions about distinct brand of cars.

Customizing an LLM request with dynamic values originating from an incoming message is interesting.
However, sometimes the application itself could provide a more static value.
Yet, we should be able to customize LLM requests with that kind of information. For instance, let's imagine a bean as below:

```
@Named("myBean")
@ApplicationScoped
public class MyBean {
  String getLevel() {
    return "HIGH";
  }
}
```

It would be very nice to inject that bean level inside the LLM prompt.
So, how could we build such a highly customizable LLM based application ?

# Camel bean annotations to the rescue

Starting with the next version of Camel Quarkus, such situations could be solved simply by using Camel annotations on the LangChain4j method parameters.
Let's see how.

First, a new [Camel Quarkus LangChain4j extension](https://github.com/apache/camel-quarkus/commit/11c7ebb2f623bfd8fba54d8bf5e41005be84ce0b) has been created, so let's add the correct dependency:

```xml
<dependency>
  <groupId>org.apache.camel.quarkus</groupId>
  <artifactId>camel-quarkus-langchain4j</artifactId>
</dependency>
```

Second, as [Quarkus Langchain4j](https://github.com/quarkiverse/quarkus-langchain4j) comes with a lot of dependencies, it's a best practice to align on a given version using the `quarkus-langchain4j-bom` as below:

```xml
<dependencyManagement>
  <dependencies>
    <dependency>
      <groupId>io.quarkiverse.langchain4j</groupId>
      <artifactId>quarkus-langchain4j-bom</artifactId>
      <version>${quarkus-langchain4j.version}</version>
      <type>pom</type>
      <scope>import</scope>
    </dependency>
  </dependencies>
</dependencyManagement>
```

It's up to every developers to choose the value of `${quarkus-langchain4j.version}`.
However, please keep in mind that to use Camel Quarkus parameter binding annotations with Langchain4j, we need to set `quarkus-langchain4j.version` to be greater than `0.19.0`.

From there, it's just a matter of using the right annotation on the AI service method parameters like below:

```java
@UserMessage("Given the text delimited by triple back ticks ```{body}```. What is the price of the car {carName} with equipment level {carLevel} ?")
@Handler
String getCarPrice(@Body String body, @Header("carName") String carName, @Bean(ref = "myBean", method = "getLevel") String carLevel);
```

See how each method parameter annotation will mandate Camel to inject values coming from body, header and even from a bean method.
Connecting Camel with LangChain4j seems easier than ever.
Finally, please notice how the method parameters could be used as prompt template variables like `{body}`, `{carName}` and `{carLevel}`.

Let's make it even more concrete and show the prompt with those template variables replaced as below:

```
Given the text delimited by triple back ticks ```The well equipped ALPHA4 costs 100$...```. What is the price of the car ALPHA4 with equipment level HIGH ?
```

Now we are able to build more customizable LLM prompts. From there, it is up to every developer to use prompt engineering and other LLM technics to finish the development.

Of course, there is a bit of magic handled by the `camel-quarkus-langchain4j` extension under the hood.
Precisely, there is a unique rule as of now, the annotations to be used should have a package name starting with `org.apache.camel`.
This is enough to inject values with parameter binding annotations like `@Variable`, `@ExchangeProperty`, `@JSonPath` or even `@XPath`.

# Conclusion

That's it for this pre-screening of this new feature that should be available with the next Camel Quarkus release, probably version 3.16.0.
The Camel Quarkus LangChain4j extension is experimental, so let's have a try and [give feedback to the community](/community/support/).