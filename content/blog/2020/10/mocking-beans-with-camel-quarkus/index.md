---
title: "The Camel: mocking more than ever helped by Quarkus friend"
date: 2020-10-31T17:02:10+02:00
authors: ["aldettinger"]
categories: ["Howtos", "Camel Quarkus"]
preview: ""
---

Even implementing a simple stateless micro-service, one could face situations where testing becomes hard.
A lot of tools and techniques could help, but having something at hand quickly is very handy.
In this post, I'm introducing a Quarkus feature that plays nice with Camel in order to mock beans for test purpose.

## Camel and Quarkus together for mocking beans

It's long known that Camel offers great support for Java beans. Every time a developer needs custom code, this feature comes to the rescue.

### A route using a bean

Let's take a simple route below for demonstration purpose:
```java
from("platform-http:/semester").
choice().
  when(simple("${bean:monthBean} <= 6")).
  setBody(constant("FIRST semester")).
otherwise().
  setBody(constant("SECOND semester")).
end();
```
This simple Camel route informs the web client about the current semester. Step by step, it reacts to an incoming HTTP request, invokes a select method on a bean
named `monthBean`, compares the returned value against the number `6` and finally set the reply accordingly. For instance, the HTTP response body will be
`FIRST semester` when executed from January until June.

### A bean used from a route

Now let's define the bean invoked from the route with the code beneath:
```java
@ApplicationScoped
@Named("monthBean")
@RegisterForReflection
public class MonthBean {
  public int month() {
    return LocalDateTime.now().getMonth().getValue();
  }
}
```
Helped with the `@Named` CDI annotation, we have just defined a bean named `monthBean` that could be referenced from a route.
The `month()` method will return values ranging from `1` when executed in January up to `12` when executed in December.

### A first canvas for testing

As we are creating a simple HTTP based service, we could leverage on the `@QuarkusTest` annotation and the `RestAssured.given()` method for testing purpose. A possible implementation is proposed underneath:
```java
@QuarkusTest
public class SemesterRouteTest {
  @Test
  void runningThisTestInOctoberShouldIssueSecondSemester() {
    given().get("/semester").then().statusCode(200).body(is("SECOND semester"));
  }
}
```
It looks to be a good start. However, this test will obviously fail when executed from January until June.
In other words, the test is not reproducible and it would be appreciable to fix this issue by mocking the `monthBean`.

### @InjectMock to the rescue

Luckily, Quarkus is providing the `@InjectMock` annotation in order to inject mocks in the CDI bean registry.
This annotation is packaged in the `quarkus-junit5-mockito` artifact, so maven users would need to add a dependency like below:
```xml
<dependency>
  <groupId>io.quarkus</groupId>
  <artifactId>quarkus-junit5-mockito</artifactId>
  <scope>test</scope>
</dependency>
```
Camel is well integrated with the Quarkus registry, allowing us to write the following kind of tests:
```java
@QuarkusTest
public class SemesterRouteTest {
  @InjectMock
  MonthBean monthBean;

  @Test
  void januaryShouldIssueFirstSemester() {
    when(monthBean.month()).thenReturn(1);
    given().get("/semester").then().statusCode(200).body(is("FIRST semester"));
  }
}
```
At first, notice how we used `@InjectMock` to define the `MonthBean` mock.
And later, the [Mockito](https://github.com/mockito/mockito) statement `when(monthBean.month()).thenReturn(1)` let us influence the behavior of the mock.
As such, we are now able to simulate that the `month()` method is called in January at will.

### More good news

Not solely have we fixed the reproducibility issue, but we are even able to complete the test coverage with more scenarios:
```java
@Test
void augustShouldIssueSecondSemester() {
  when(monthBean.month()).thenReturn(8);
  given().get("/semester").then().statusCode(200).body(is("SECOND semester"));
}

@Test
void exceptionShouldIssueHttp500() {
  doThrow(new IllegalArgumentException("Simulating an exception")).when(monthBean).month();
  given().get("/semester").then().statusCode(500);
}
```

### Conclusion

So far, we have introduced a way to mock beans in Camel Quarkus tests. It helped us to define reproducible tests and to improve the test coverage.
Note that `@InjectMock` works only in JVM Mode, yet it offers a good complement to native tests.

The source code used in this blog post is hosted [on my github repository](https://github.com/aldettinger/camel-quarkus-inject-mock).

More information are available about the Quarkus mocking features in the great	 article from Georgios Andrianakis about [Mocking CDI beans in Quarkus](https://quarkus.io/blog/mocking/). Finally, I would like to thank [Gerhard G.](https://pixabay.com/users/blende12-201217/?utm_source=link-attribution&utm_medium=referral&utm_campaign=image&utm_content=3901900) for the mocking camel picture.
