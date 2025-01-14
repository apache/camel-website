---
title: "Resolving LangChain4j AI services by name"
date: 2025-01-17
draft: false
authors: [aldettinger]
categories: ["Camel", "AI"]
preview: "Explain the new feature to resolve AI services by name directly from Camel Quarkus"
---

# Introduction

In a previous blog post related to Artificial Intelligence with Camel, we introduced the [resolution of AI services by interface](/blog/2024/12/langchain4j-bean-interface/).
This feature brings Camel and Quarkus LangChain4j closer than ever so that it takes less code to invoke a [LangChain4j AI service](https://docs.langchain4j.dev/tutorials/ai-services/) from a route.
In this blog post, we would like to introduce a related feature that should be released in the next Camel Quarkus version.
This time, we'll do the same kind of operation, except that we will resolve the bean by its name.
Let's see more details following in this blog post.

# AI service resolution by name

So, let's remember the context. When it comes to using a [Quarkus LangChain4j](https://docs.quarkiverse.io/quarkus-langchain4j/dev/index.html) AI service through the Camel bean syntax, we could proceed as below:

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

It works great for sure.
Still, it's possible to do better by avoiding the unnecessary `@Inject` statement.
And this time, we'll do this by resolving the AI service bean by its name as it could be seen below.

```
@ApplicationScoped
public class MyRoutes extends RouteBuilder {

  @Override
  public void configure() {
    from("...")
      .bean("myBeanName");
  }
}
```

Of course, to be resolved this way, the AI service should explicitly mandate a name, for instance with the `@Named` annotation:

```
@ApplicationScoped
@Named("myBeanName")
@RegisterAiService
public interface AiServiceResolvedByName {

    @UserMessage("My prompt")
    @Handler
    String chatByName(String input);
}
```

This is a pretty simple syntax and it should speak to most Camel users.
However, let's keep in mind that this feature becomes available only after a [fix](https://github.com/quarkiverse/quarkus-langchain4j/commit/00d1c533ef982fa5c429cee8661369c3fac379bd) released with [Quarkus LangChain4j 0.23.x](https://github.com/quarkiverse/quarkus-langchain4j/releases/tag/0.23.0).
From a Camel Quarkus point of view, it should become present in the coming release so that's just a bit of time to wait.

# Conclusion

In this article, we have seen yet another goodness of the [Camel Quarkus LangChain4j extension](/camel-quarkus/next/reference/extensions/langchain4j.html).
Camel users are used to invoke bean by name since years, so it really makes sense to also resolve AI services the same way.
So, if you are on the path of exploring what AI  could bring to integration scenarios and not afraid to write a few lines of code, I would encourage you to test out the [Camel Quarkus Langchain4j extension](/camel-quarkus/next/reference/extensions/langchain4j.html).
Of course, feedbacks and contributions are welcome, so feel free to report any bugs and improvements [here](https://github.com/apache/camel-quarkus/issues/new/choose).
