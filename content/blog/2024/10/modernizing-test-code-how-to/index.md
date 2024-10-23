---
title: "Modernizing Camel's Test Support Code: How To"
date: 2024-10-24
draft: false
authors: [orpiske]
categories: ["Camel", "Test"]
preview: "Modernizing Camel's Test Support Code: How To"
---

Earlier [I wrote a blog post](/blog/2024/09/modernizing-test-support) about a multi-release effort to clean up some of the legacy
test code for Camel 4. In this blog post, I will dive into more details about how to adjust your code to use the modernized interfaces. 

# New Interfaces 

Camel 4.9 will introduce two new interfaces to `CamelTestSupport` that will help users adjust their code and will help us 
with future maintenance of the test support code.
These interfaces provide a stable APIs for code needing to configure the test behavior and the context configuration. The new 
interfaces are: 

* `ConfigurableTest`: that indicates that the test is configurable. This interface defines the methods `configureTest` and `testConfiguration`.
* `ConfigurableContext`: that indicates that the context used in the test is configurable. This interface defines the methods `configureContext` and `camelContextConfiguration`.

During test setup, our code calls these methods at the most appropriate time. As such, user code doesn't necessarily need to worry about when to call them. 

Users willing to future-proof their code can leverage the two configuration methods provided by each of these interfaces and adjust their code so that the 
configuration is done inside them. 

We have updated our [JUnit 5 testing documentation](/components/next/others/test-junit5.html) to describe the migration steps in more details. 

# Removal of Deprecated Interfaces 

Originally, the plan was to remove the deprecated interfaces. However, removing these methods would unnecessarily cause overhead
when migrating from Camel 3, and would violate the goal of Camel 4 being as close as possible to a drop-in replacement for 3. Therefore, 
these APIs will not be removed at this point. 
