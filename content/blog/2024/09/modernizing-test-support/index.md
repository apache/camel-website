---
title: "Modernizing Camel's Test Support Code: What You Need to Know"
date: 2024-09-11
draft: false
authors: [orpiske]
categories: ["Camel", "Test"]
preview: "Modernizing Camel's Test Support Code: What You Need to Know"
---

The [first law of software complexity](https://maheshba.bitbucket.io/blog/2024/05/08/2024-ThreeLaws.html) says that _"a well-designed system will degrade into a badly designed system over time"_. 
This law can be ruthless for open source projects receiving hundreds of contributions every month.

That's why projects must refactor code, evaluate APIs, review tests, and modernize code to leverage the latest and greatest features from Java.

# Camel Test Support

One area in Camel that has had little attention until recently was our test support code. 
This code is typically associated with two base classes used for testing: `CamelTestSupport` and `CamelSpringTestSupport`).

Cleaning up this code, however, is not an easy task: not only it is used by thousands of tests in Camel, but also it used by our users as part of their own tests. 
Additionally, the first bits of these classes date to more than 15 years ago, and the code in these classes has gone through a lot: multiple Java versions, JUnit versions (including a migration from JUnit 4 to 5), 
and multiple Camel versions.

As such, we started a multi-release effort. 
In Camel 4.7 ([CAMEL-20785](https://issues.apache.org/jira/browse/CAMEL-20785)) we kicked off this work by performing relatively safe code cleanups and marking restricted APIs as deprecated. 
In Camel 4.8, we started blocking the usage of those restricted APIs ([CAMEL-20838](https://issues.apache.org/jira/browse/CAMEL-20838)). 
Starting with 4.9, we have decoupled even further the functionality on CamelTestSupport and have switched the code internally to use a JUnit 5 extension ([CAMEL-20837](https://issues.apache.org/jira/browse/CAMEL-20837)).

# Preparing Your Code

From the user's perspective, a refactoring like this certainly raises questions such as _"how will this affect my code?"_, 
_"how do I ensure the code is minimally impacted?"_ and _"how can I migrate the code?"_.

When doing refactoring like this, we strive to retain backward compatibility as much as possible, but in some cases that's not entirely the case. 
The refactoring of the test support classes is one of those. Although, the changes required are relatively simple.

To ensure a smooth transition, the very first thing that our users should pay attention to is to avoid relying on deprecated interfaces. 
In many cases, they are used for pre- and post-test setup. 
As such, that code can almost always be safely replaced by JUnit's setup and tear-down code (represented by annotations such as `@BeforeEach` and `@AfterEach`). 
The second is to use the new classes `TestExecutionConfiguration` and `CamelContextConfiguration` (via their accessor methods) for adjusting the test and the Camel Context behavior. 
The third, is to avoid relying on the per-class lifecycle (i.e.: annotating the tests with `@TestInstance(TestInstance.Lifecycle.PER_CLASS)`) - with Camel 4.9 this will trigger the legacy context management code which will, eventually, be removed.

The migration can also be made easier, by applying a few additional good practices for writing tests, such as ensuring a clean environment between tests. 
For instance, in some cases, it might be necessary to reset the mocks between each test execution.
This can be done using code like this:

```java
@BeforeEach
void reset() throws Exception {
    MockEndpoint mock = getMockEndpoint("mock:result");
    mock.reset();
}
```

You can also simplify the migration by avoiding writing tests that use that infrastructure and, at the same time, stop and start the Camel context. 
As of Camel 4.9, the lifecycle of the context is the responsibility of the JUnit extension that manages it.

Lastly, for those extremely complex use cases, Camel 4.8 comes with a new abstract class named `AbstractTestSupport`.
Although this is aimed at internal usage, it can offer a stepping stone for users in need of greater time to migrate.
With that class, users can implement their own `CamelTestSupport` class if they choose to do so.

# Conclusion

By following these relatively simple tips, you can ensure that the test code transition will occur relatively smoothly for your projects.
We have conducted intensive testing to ensure the code work wells. 
However, if you find problems with the test code, don't hesitate to [reach out](https://camel.zulipchat.com) and [report](https://issues.apache.org/jira/projects/CAMEL/issues/).