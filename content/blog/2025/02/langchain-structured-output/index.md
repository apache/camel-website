---
title: "Toward better data extraction with structured output"
date: 2025-02-14
draft: false
authors: [aldettinger]
categories: ["Camel", "AI"]
preview: "Demonstrate new improvements in data extraction thanks to the structured output feature"
---

# Introduction

This has been several [blog posts](/categories/AI/) now where we have learned about how to use generative AI for data extraction from a Camel route.
Starting from the initial inception, we have then focused a lot on how to best combine Camel and [Quarkus LangChain4j](https://docs.quarkiverse.io/quarkus-langchain4j/dev/index.html).
In this blog post, we will reap the benefit of this great combination to improve the accuracy of our data extraction almost for free.
Almost for free really?
Let's explain what it means throughout this article.

# Small recap about the JSON mode

Up until there, a key feature to achieve credible data extraction was to use the [JSON mode](https://github.com/apache/camel-quarkus-examples/blob/3.18.x/data-extract-langchain4j/src/main/resources/application.properties#L25).
The [JSON mode](https://js.langchain.com/v0.1/docs/integrations/chat/ollama/#json-mode) actually coerces the LLM so that it generates only JSON conforming text, so no more free form text in this case.
This improves the data extraction accuracy as the LLM has less choice about what to generate, so less chances to make a mistake.
Taking a step back, the JSON mode is just about the user providing the LLM with a bit more details about the expected structure.
And this idea is quite interesting, perhaps it could be pushed even further.

# Comes the structured output feature

Providing even more details about the expected structure of the LLM output is at the core of a new feature called [structured output](https://platform.openai.com/docs/guides/structured-outputs).
Actually, in this case the LLM is provided with a specific JSON schema to comply with.
In the same spirit, the more guidance given to our AI system, the less complex it is to generate meaningful completions.

There are probably multiple ways to coerce the model output to make it comply with a specific JSON schema.
After a bunch of investigations, it seems the most common techniques use [grammar based constraint at sampling time](https://medium.com/better-programming/testing-out-llama-cpp-grammar-constraint-based-sampling-f154e48e6028).
Let's review an overly simplistic example in order to feel how it works.

First, let's imagine a JSON schema matching expected AI responses like this one: `{"name": "John", "size": 10}`.
So, the LLM is in the process of generating a completion and the current proposal is `{"`.
The LLM try to mimic the pattern it learned at training time and is hesitating between possible completions like one of `n s o , } ù`.
Without the JSON schema, each proposal could be perfectly valid.
However, with a grammar describing the structure of the language, we could figure out that only a few completions are really valid against the expected JSON schema.
Indeed, in our example only one of `n s }` is possible.
Overly simplistic view indeed, still it's probably a good way to feel the general spirit that inspired the structured output feature.

It's worth noting that structured output is implemented by more and more providers like OpenAI, Gemini, Ollama...
It should logically improve the data extraction accuracy though I have not found any concrete benchmark at this stage.
So it seems like a good feature to use, but how do we implement this in our data [extraction example](https://github.com/apache/camel-quarkus-examples/tree/3.18.x/data-extract-langchain4j).

# Implementing structured output with Camel and Quarkus Langchain4j

Actually, it is very handy. The Quarkus Langchain4j community has arbitrated toward automatic enrollment of structured output as far as possible.
In our case, ollama `0.5.7` is offering [structured output](https://ollama.com/blog/structured-outputs).
Our [AI service](https://docs.langchain4j.dev/tutorials/ai-services/) is returning an object of type [CustomPojo](https://github.com/apache/camel-quarkus-examples/blob/3.18.0/data-extract-langchain4j/src/main/java/org/acme/extraction/CustomPojoExtractionService.java#L70) and the corresponding JSON schema will automatically be included in the LLM request.

Let's see the Ollama request and response to better illustrate:

```
2025-02-03 11:03:50,722 INFO  [io.qua.lan.oll.OllamaRestApi$OllamaLogger] (vert.x-eventloop-thread-1) Request:
- method: POST
- url: http://localhost:11434/api/chat
- headers: [Accept: application/json], [Content-Type: application/json], [User-Agent: Quarkus REST Client], [content-length: 1448]
- body: {
  "model" : "granite3-dense",
  "messages" : [ {
    "role" : "user",
    "content" : "Extract information about a customer from the text delimited by triple backticks: ```Operator: Hello, how may I help you ?\nCustomer: Hello, I'm calling because I need to declare an accident on my main vehicle.\nOperator: Ok, can you please give me your name ?\nCustomer: My name is Sarah London.\nOperator: Could you please give me your birth date ?\nCustomer: 1986, July the 10th.\nOperator: Ok, I've got your contract and I'm happy to share with you that we'll be able to reimburse all expenses linked to this accident.\nCustomer: Oh great, many thanks.```.The summary field should concisely relate the customer main ask."
  } ],
  "options" : {
    "temperature" : 0.0,
    "top_k" : 40,
    "top_p" : 0.9
  },
  "format" : {
    "type" : "object",
    "properties" : {
      "customerSatisfied" : {
        "type" : "boolean"
      },
      "customerName" : {
        "type" : "string"
      },
      "customerBirthday" : {
        "type" : "object",
        "properties" : {
          "year" : {
            "type" : "integer"
          },
          "month" : {
            "type" : "integer"
          },
          "day" : {
            "type" : "integer"
          }
        },
        "required" : [ "year", "month", "day" ]
      },
      "summary" : {
        "type" : "string"
      }
    },
    "required" : [ "customerSatisfied", "customerName", "customerBirthday", "summary" ]
  },
  "stream" : false
}
2025-02-03 11:03:56,962 INFO  [io.qua.lan.oll.OllamaRestApi$OllamaLogger] (vert.x-eventloop-thread-1) Response:
- status code: 200
- headers: [Content-Type: application/json; charset=utf-8], [Date: Mon, 03 Feb 2025 10:03:56 GMT], [Content-Length: 645]
- body: {
  "model" : "granite3-dense",
  "created_at" : "2025-02-03T10:03:56.946464977Z",
  "message" : {
    "role" : "assistant",
    "content" : "{\n  \"customerSatisfied\": true,\n  \"customerName\": \"Sarah London\",\n  \"customerBirthday\": {\n    \"year\": 1986,\n    \"month\": 7,\n    \"day\": 10\n  },\n  \"summary\": \"The customer, Sarah London, called to declare an accident on her main vehicle and was informed that the expenses related to the accident would be reimbursed.\"\n}"
  },
  "done_reason" : "stop",
  "done" : true,
  "total_duration" : 6227793363,
  "load_duration" : 5201966,
  "prompt_eval_count" : 189,
  "prompt_eval_duration" : 2087000000,
  "eval_count" : 97,
  "eval_duration" : 4132000000
}
```

The most interesting part is the `format` property in the request. This shows how the JSON schema is conveyed to later influence the LLM generation.
Upgrading the example in order to use structured output was actually fairly easy with only a few changes listed in this [commit](https://github.com/apache/camel-quarkus-examples/commit/5e9ecb06730806990b41897ad9c977cfd17829f3).

# Conclusion

We have seen that the structured output feature makes it possible to constrain the LLM generation by providing a JSON schema.
With Quarkus LangChain4j, this schema is automatically deduced from the Java class and sent to the LLM provider in the right format.
So there is basically nothing the developer should worry about, structured output is automatically enrolled when possible.
In this sense, this improvement comes almost for free.
By making the LLM to adhere to a specific JSON schema, the data extraction accuracy is expected to raise up.
Still, it would be good to find concrete benchmarks about impact on performance and accuracy.
Anyway, it seems to be a good milestone on our journey toward using AI with the [Camel Quarkus Langchain4j extension](/camel-quarkus/next/reference/extensions/langchain4j.html).
By the way, feel welcome to play with it and report any bugs and improvements [here](https://github.com/apache/camel-quarkus/issues/new/choose).
