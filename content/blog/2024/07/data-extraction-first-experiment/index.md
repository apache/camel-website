---
title: "Experimenting extraction from unstructured data with Apache Camel and Langchain4j"
date: 2024-07-19
draft: false
authors: [aldettinger]
categories: ["Camel", "AI"]
preview: "Give directions about how to turn unstructured data into structured data with Camel and Langchain4j."
---

This blog is based on experiments done about extracting structured data into its structured counterpart. More precisely in this post, we'll give
directions about how to convert a conversation transcript into a Java object.

# Overview

Reading articles like [this](https://www.perfect-memory.com/unlock-the-potential-of-unstructured-data/) over the net, it seems that folks have a lot of unstructured data at disposal while not being able to take advantage on it. So probably, in the future we might expect to deal more and more with unstructured data extraction in integration flow.

From there, I started to experiment about ways to do it with Apache Camel. In this article, I don't come up with full packaged examples but still can share some directions about how to do it. Precisely, we'll use the [langchain4j](https://github.com/langchain4j/langchain4j) high level api in conjunction with camel [bean binding capabilities](manual/bean-binding.html).

Let's share some directions.

# Serve the model from a local container

Throughout this article, we'll stress the importance of JSON to achieve our goal.
And it starts here by choosing a model that has knowledge about JSON.

Let's run a `codellama` container locally:

```bash
docker run -p 11434:11434 langchain4j/ollama-codellama:latest
```

# Set up the langchain4j chat model

In order to request the served model from our Camel application, we need to setup the chat model based on [langchain4j instructions](https://docs.langchain4j.dev/integrations/language-models/ollama/).

Mainly, we add the `langchain4j-ollama` dependency:

```xml
<dependency>
            <groupId>dev.langchain4j</groupId>
            <artifactId>langchain4j-ollama</artifactId>
            <version>${langchain.version}</version>
</dependency>
```

Then create a chat model:

```java
ChatLanguageModel model = OllamaChatModel.builder()
                .baseUrl(modelServingUrl)
                .modelName(MODEL_NAME)
                .temperature(0.0)
                .format("json")
                .timeout(Duration.ofMinutes(1L))
                .build();
```

See how we lower the temperature to `0.0` in order to reduce the variability of the LLM answers.
Another key aspect, is that we configure the model to output JSON only which greatly reduces the problem space.

# Define the extraction service

Langchain4j offers [some examples](https://docs.langchain4j.dev/tutorials/structured-data-extraction/) about how to declare data extraction service with the high level api.

When extracting POJOs, we need to define the structure of the data we would like to extract as a class:

```java
static class CustomPojo {
  private boolean customerSatisfied;
  private String customerName;
  private LocalDate customerBirthday;
  private String summary;
}
```

See how we could mix different sort of information that langchain4j will stuff from the JSON output produced by the served model.

Then, we define the extraction service contract:

```java
interface CamelCustomPojoExtractor {
  @UserMessage(
    "Extract information about a customer from the text delimited by triple backticks: ```{{text}}```." +
    "The customerBirthday field should be formatted as YYYY-MM-DD." +
    "The summary field should concisely relate the customer main ask."
  )
  CustomPojo extractFromText(@V("text") String text);
}
```

As we return a custom POJO, langchain4j will automatically instructs the LLM to produce a valid JSON according to the needed schema.
Notice how we are able to complete langchain4j instructions with the `@UserMessage` annotation where we define the date format output.

As a last step, we create the extraction service and register it in the registry:

```java
@Override
protected RouteBuilder createRouteBuilder() {
  ...
  CamelCustomPojoExtractor extractionService = AiServices.create(CamelCustomPojoExtractor.class, chatLanguageModel);
  this.context.getRegistry().bind("extractionService", extractionService);
  ...
}
```

# Invoke the extraction service from a route

```
@Override
protected RouteBuilder createRouteBuilder() {
...
  from("...")
    .bean(extractionService)
    .bean(prettyPrintCustomPojo);
...
}
```

Now, using bean binding, Camel able to map any textual incoming body and inject it as the first parameter of the extraction service.
The extracted `CustomPojo` could then be pretty printed with any home defined method.

# Let's send a conversation transcript to the route

The goodness with Camel is that conversation transcript could originate from a lot of systems given the high number of [components available](components/latest/index.html).

So, let's send a conversation transcript into the route:

```
Operator: Hello, how may I help you?
Customer: Hello, I am currently at the police station because I've got an accident. The police would need a proof that I have an insurance. Could you please help me?
Operator: Sure, could you please remind me your name and birth date?
Customer: Of course, my name is Kate Hart and I was born on August the thirteen in the year nineteen ninety nine.
Operator: I'm sorry Kate, but we don't have any contract in our records.
Customer: Oh, I'm sorry that I've made a mistake. Actually, my last name is not Hart, but Boss. It changed since I'm married.
Operator: Indeed, I have now found your contract and everything looks good. Shall I send the proof of insurance to the police station?
Customer: Oh, if possible, my husband will go directly to your office in order to get it.
Operator: Yes, that's possible. I will let the paper at the entrance. Your beloved could just ask it to the front desk.
Customer: Many thanks. That's so helpful. I'm a bit more relieved now.
Operator: Sure, you're welcome Kate. Please come back to us any time in case more information is needed. Bye.
Customer: Bye.
```

Reading the whole discussion, we could realize that we have a few challenges at hand.

For instance, the customer name is spread in different parts of the text.
This is what is called the co-reference problem in the data extraction field.
Worst than that, the customer is giving a wrong name at first, and then correcting it later on.
So, we really need semantic capabilities here to unravel the situation.

Let's process this conversation, after more or less 20 seconds on my machine, I'm provided with the result below:

```
customerSatisfied: true
customerName: Kate Boss
customerBirthday: 13 August 1999
summary: Customer Kate Boss is satisfied with the assistance provided by the operator. The customer was able to provide their name and birth date correctly, and the operator was able to locate their insurance contract.
```

Hey, it looks pretty decent:
 + the customer satisfaction was detected has positive
 + the customer name was successfully corrected
 + the challenges around the date format were addressed and we have a valid `LocalDate` object
 + the summary is quite relevant

# Conclusion

At the end of the day, we were able to convert an unstructured conversation transcript into a structured POJO.

The process under the hood contains multiple steps:
 + Camel receives the conversation transcript as a `String`
 + Camel bean invokes the `extractFromText` method passing the conversation as first parameter
 + Langchain4j injects the conversation into the LLM prompt via the `@V("text")` annotation and `{{text}}` placeholder
 + Langchain4j completes the prompt with the JSON schema automatically generated from the `CustomPojo` class
 + The codellama model served from the container generate the JSON completion
 + Langchain4j maps the provided JSON output into a `CustomPojo` instance
 + Camel bean is now able to pretty print the `CustomPojo` instance helped with the `prettyPrintCustomPojo` bean
