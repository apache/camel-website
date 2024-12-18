---
title: "Resolving LangChain4j AI services by interface"
date: 2024-12-20
draft: false
authors: [aldettinger]
categories: ["Camel", "AI"]
preview: "Explain the new feature to resolve AI services by interface directly from Camel Quarkus"
---

# Introduction

In a recent series [of Artificial Intelligence related blog posts](/categories/AI/), we have learned about the Camel Quarkus LangChain4j extension.
It offers possibilities to implement new AI related scenarios like data extraction.
The underlying implementation of Quarkus LangChain4j seems to offer interesting abstractions that, for instance make it possible to switch between Large Language Models quite simply.
We have also started to see some improvements when it comes to invoking AI services thanks to camel bean binding and annotations.
That's a good start, still after experimentation, there is room for more improvement, especially when it comes to AI service resolution from Camel.

# AI service resolution by interface

In the past we needed to manually inject the AI service as shown below:

```
@ApplicationScoped
public class MyRoutes extends RouteBuilder {

  @Inject
  MyAIService myAiService;

  @Override
  public void configure() {
    from("...")
      .bean(myAiService);
  }
}
```

Looking a bit more, is there really a great interest to manually inject the bean with `@Inject`?
As you know, the community is oriented toward inverting the developer experience with tools like [Camel JBang](/manual/camel-jbang.html).
This philosophy mandates to concentrate on the integration logic first and then deal with runtime intricacies later on, if ever needed.

And in the end, the code snippet seen above is kind of breaking this principle.
So how could we improve the situation ?
After some thought, it turns out that a more transparent injection could help in such a situation.

Indeed, if we could erase this explicit manual injection, chances are that the code would arguably be more:
 + Compact
 + Focused on the integration logic
 + Abstracted from the underlying runtime

Pushing the rationale further, the question should even be asked the opposite way.
Like, how would a common camel user write such an integration route ?
And actually, it could be done in a simpler way as follows:

```
@ApplicationScoped
public class MyRoutes extends RouteBuilder {

  @Override
  public void configure() {
    from("...")
      .bean(MyAIService.class);
  }
}
```

This time, we only mandate the expected AI service interface and let camel to do whatever is needed under the hood to resolve it.
This looks a nice idea, however while experimenting this construct... It resulted in a cryptic error message.

People used to create Camel Quarkus extensions will have noticed quickly that the Quarkus bean removal mechanism would hit there.
More precisely, with Quarkus, the dependency injection occurs at build time, once and for all.
In this spirit, a bean that is not referenced at build time could be considered useless and literally [removed](https://quarkus.io/blog/unused-beans/).

And in the case at hand, Camel and Quarkus do not play well to the point of automatically detecting that situation.
As always, there are manual [workarounds](https://quarkus.io/guides/cdi-reference#eliminate_false_positives) that could be applied.

However, this kind of issues is best fixed in the Camel Quarkus LangChain4j extension itself.
Indeed, this extension aims at solving as much as possible the intricacies of developing camel routes using high-level [AI services](https://docs.langchain4j.dev/tutorials/ai-services/).
The good news is that the [AI service resolution by interface](/camel-quarkus/next/reference/extensions/langchain4j.html#extensions-langchain4j-configuration-resolving-ai-services-by-interface) has just been delivered with the recent [Camel Quarkus 3.17.0 release](/blog/2024/12/camel-quarkus-release-3.17.0/).

# Conclusion

Initially, I hesitated to create the Camel Quarkus LangChain4j extension, as the scope was too narrow.
Still experimentation after experimentation, we discover some intricacies and user experience improvements that in the end amply justify the maintenance cost of this new extension.
Being able to resolve AI services by interface is just one of those goodness.
There are actually more coming in future versions.
That should be a good subject for a next blog post.
Meanwhile, I would encourage the community to test out the [Camel Quarkus Langchain4j extension](/camel-quarkus/next/reference/extensions/langchain4j.html).
And please, as usual, feel welcome to report any bugs and improvements [here](https://github.com/apache/camel-quarkus/issues/new/choose).
