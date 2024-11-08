---
title: "Avoiding model lock in while building an AI Camel route"
date: 2024-11-15
draft: false
authors: [aldettinger]
categories: ["Camel", "AI"]
preview: "Touch the subject of Large Language Models lock in and how to prevent that"
---

# Introduction

In a [previous blog post](/blog/2024/10/langchain4j-camel-annotations/), we have seen how Camel parameter binding annotations could be used in conjunction with LangChain4J AI services to easily create Camel routes using Large Language Models. All this work is best reflected in a [Camel Quarkus example](https://github.com/apache/camel-quarkus-examples/tree/camel-quarkus-main/data-extract-langchain4j). While building this example, poor care was taken about the choice of the LLM as this was not the initial priority. Thinking a bit more, this situation is a great opportunity to experience the switch of an LLM inside of a Camel application. Let's discover this story together.

# Why would one need to switch to another model ?

In the present case, it turns out the first reason to switch the model was the license. Most of us reading this article might be convinced by the power of open source.
That said, I took a closer look at the [license](https://github.com/meta-llama/llama/blob/main/LICENSE) of the codellama model used in the example.
At first, the license looks quite permissive, and we need to acknowledge that it's really good for a commercial company to help with spreading LLMs to a large public.
On the less bright side, when taking a closer look, we quickly see the limitations of this license as explained in this [article](https://opensource.org/blog/metas-llama-2-license-is-not-open-source#:~:text=Stefano%20Maffulli-,Meta's%20LLaMa%202%20license%20is%20not%20Open%20Source,source%E2%80%9D%20%E2%80%93%20it%20is%20not.).
Thinking a bit more, a true open source LLM should probably open up the training data and does whatever it takes to have a community being able to contribute like [instructlab](https://instructlab.ai/). But that's a big subject far beyond the scope of this small blog post.

So, the license was the first driver for switching the model. That said, if we think about the lifecycle of an LLM based application, we could imagine that switching the model is a main use case. For instance, one developer could start with a SAAS based proprietary model and soon after realize that sending private data to an external company is not a good idea. Even developers using a true self hosted open source model could one day need to switch to a model with a better accuracy or a lower memory consumption. To go one step further, we could imagine companies giving up using large foundational models and preferring to train an in-house small language model specialized on their own company use case and even trained with their enterprise specific data.

So, what model could we adopt in the data extraction example ? After some research, I think [granite3 dense model](https://github.com/ibm-granite/granite-3.0-language-models) could be a match. It's [Apache V2 licensed](https://github.com/ibm-granite/granite-3.0-language-models/blob/main/LICENSE), and the dense version could probably bring a latency improvement that users would really appreciate while running inferences on their own machine. In the LLM memory bound world, less parameters is better.

# What it takes to switch to another model ?

Actually, not that much. At least in the Camel Quarkus example, a single configuration needed to be changed:

```
quarkus.langchain4j.ollama.chat-model.model-id = granite3-dense
```

Pretty easy indeed. Actually, this looks to me a good demonstration of the flexibility brought by [Quarkus LangChain4J](https://github.com/quarkiverse/quarkus-langchain4j) abstractions.
We also need to recognize that the model is served through ollama before and after the switch which really simplifies the migration.
I must admit I was surprised by the simplicity to adopt a new model, at first I was expecting the LLM prompt to be impacted.
By the way, remember that the [prompt](https://github.com/apache/camel-quarkus-examples/blob/3.16.x/data-extract-langchain4j/src/main/java/org/acme/extraction/CustomPojoExtractionService.java#L53-L55) is this piece of text a developer write in order to instruct the LLM what should be generated.

# Ensuring non regression while switching the model

Having the Camel route starting and running with a new model is great.
However, how could we ensure that the situation is not worse than before the migration.
For this, we would need to estimate possible regressions in distinct areas listed below.

## Accuracy

First one needs to check that the model output is still accurate enough.
In our case, I've checked that the result for the customer name, birth date and satisfaction are the same before and after the migration.
The last field, called [summary](https://github.com/apache/camel-quarkus-examples/blob/3.16.x/data-extract-langchain4j/src/main/java/org/acme/extraction/CustomPojoExtractionService.java#L38) is a bit more complicated to assess automatically.
Indeed, the summaries generated by the granite 3 dense model are different from the one generated previously by [codellama](https://ollama.com/library/codellama).
Often, the wording is different but the meaning is the same, actually there is even one case where granite 3 provides us with a more accurate summary.
Therefore, the summary comparison was done manually.
Still in a true production scenario, one might need a kind of automatic semantic comparison.

## Determinism

Second, LLM tends to be indeterministic by nature.
So likely, migration could worsen the situation here.
In our data extraction route, we would expect customer name, birth date and satisfaction to be extracted always the same way.
To stress the point, extracted the same way means that the same input conversation should output the same output object.
So, in order to estimate the determinism, I've run the same inferences 100 times and checked the distribution of the results.
It turns out that all fields were extracted exactly the same which tends to show that inferences are still deterministic.

Up to my knowledge, there are a few parameters that could influence the determinism:
 * The temperature
 * The seed
 * The hardware as some GPUs parallel computation are not always deterministic

In our example it's pretty simple:
 * The temperature is [set to zero](https://github.com/apache/camel-quarkus-examples/blob/3.16.x/data-extract-langchain4j/src/main/resources/application.properties#L25) ensuring greedy decoding.
 * The seed is set to a [default value](https://docs.quarkiverse.io/quarkus-langchain4j/dev/ollama.html#quarkus-langchain4j-ollama_quarkus-langchain4j-ollama-chat-model-seed) by Quarkus LangChain4j
 * The computation occurs on my local machine without any GPUs

## Performance

Now comes the third points of our non regression analysis, the performance.
Of course, we'll not enter into a full fledged performance testing as it's beyond the scope of this blog post.
So let's just have a few runs and compare the inferences latency as below:

| Run | CodeLlama | Granite 3 |
| -------- | -------- | ------- |
| Run 1 | 17s | 8s |
| Run 2 | 31s | 12s |
| Run 3 | 42s | 13s |

Cool, with a rough estimation, it looks that the mean latency is going from 30s down to 11s.
These are just a few experiments, yet we start to see what could be needed in a true production scenario where a model switch is needed:

 + A way to measure the accuracy
 + A way to measure the determinism
 + A way to measure the performance

# Conclusion

After this small story, I hope we share the idea that there are plenty of reasons to avoid being locked with a single Large Language Model supplier.
The good news is that with well chosen libraries, good abstractions and robust prompts, it might be possible to adopt a new model quite easily.
Finally, this flexibility of changing the model raises the question of non regression with Large Language Models.
