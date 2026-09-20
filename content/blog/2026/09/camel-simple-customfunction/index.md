---
title: "Extending Apache Camel Simple with Your Own Functions"
date: 2026-09-20
draft: false
authors: [SiHartl]
categories: ["Howtos"]
keywords: ["apache camel", "simple language", "YAML"]
preview: "Apache Camel’s Simple language already covers much of the logic needed in integration routes. Functions can be composed directly in Simple, while custom Java functions provide a clean extension point for application-specific logic."
---

Apache Camel's Simple language is surprisingly powerful. It can access message bodies, headers, variables and exchange properties, work with strings and numbers, evaluate conditions, process dates, access JSON and XML data, and combine multiple functions into transformation pipelines. ([Apache Camel – Simple Language][1])

For a large part of the logic required inside an integration route, this means that no Java code is necessary. Simple goes another step further: existing functions can even be composed into local custom functions directly inside an expression. ([Apache Camel – Simple Advanced Features][2])

There will still be situations where application-specific logic does not fit naturally into an expression. For those cases, Camel allows us to extend Simple with functions implemented in Java without moving the complete route into Java.

In this article, we will use both approaches in one runnable example:

```text
cleanName  → composed entirely from Simple functions
maskEmail  → implemented as a Java SimpleFunction
```

The complete example consists of only two files:

```text
custom-simple-function/
├── route.camel.yaml
└── MaskEmailFunction.java
```

The examples below have been tested with Camel 4.22.1 and can be run using:

```shell
camel run route.camel.yaml MaskEmailFunction.java
```

The important part is that the integration flow remains a regular YAML route. We use Simple for the logic it already handles well and add a small piece of Java only where it provides additional value.

***NOTE for Camel 4.22.0:***

Camel 4.22.0 contains a bug, [CAMEL-24486][4], that affects custom functions declared in `$init{}` blocks when Camel is running with the `dev` profile. The issue is fixed in Camel 4.22.1. To run the example with Camel 4.22.0, use the `test` profile instead: ([Apache Camel – Using Profiles][5])

```shell
camel run --profile test route.camel.yaml MaskEmailFunction.java
```


## Quick start: custom functions in a few steps

If you already know Camel and just want the short version, there are two ways to add functionality to Simple. If you prefer a detailed, step-by-step walkthrough, you can [skip ahead to What we are going to build](#what-we-are-going-to-build).

### 1. Compose existing Simple functions

If the functionality can already be expressed with Simple, define a local function inside an `$init{}` block:

```text
$init{
  $cleanName ~:= ${trim()} ~> ${normalizeWhitespace()} ~> ${uppercase()};
}init$

${cleanName(${header.customerName})}
```

No Java is required. The function is local to the Simple expression and can accept the current body or a single explicit input value. ([Apache Camel – Simple Advanced Features][2])

### 2. Implement application-specific logic in Java

For functionality that is easier to express in Java, implement `SimpleFunction` and make it available through Camel's Registry:

```java
import org.apache.camel.BindToRegistry;
import org.apache.camel.Exchange;
import org.apache.camel.spi.SimpleFunction;

@BindToRegistry("mask-email-function")
public class MaskEmailFunction implements SimpleFunction {

    @Override
    public String getName() {
        return "maskEmail";
    }

    @Override
    public Object apply(Exchange exchange, Object input) throws Exception {
        String email = input.toString().trim();

        int at = email.indexOf('@');

        if (at <= 0 || at == email.length() - 1) {
            return "***";
        }

        String localPart = email.substring(0, at);
        String domain = email.substring(at);

        return localPart.substring(0, 1) + "***" + domain;
    }
}
```

The name returned by `getName()` becomes the function name available to Simple. For standalone Camel, `@BindToRegistry` makes the implementation discoverable by Camel. ([Apache Camel – Simple Advanced Features][2]) ([Apache Camel – Java Beans][3])

### 3. Call the function from the YAML route

The Java implementation can then be used like another Simple function:

```yaml
- setBody:
    simple: |
      Customer: ${cleanName(${header.customerName})}
      Contact: ${maskEmail(${header.customerEmail})}
```

From the route developer's perspective, the two functions look almost identical even though one is composed entirely in Simple and the other is implemented in Java.

### 4. Run the route and Java file together

Put the route and Java source file in the same directory:

```text
route.camel.yaml
MaskEmailFunction.java
```

and run them with Camel CLI:

```shell
camel run route.camel.yaml MaskEmailFunction.java
```

That's the short version. The rest of the article walks through the example step by step, explains how both types of functions work, and discusses when each approach is useful.

## What we are going to build

Imagine an integration that receives some simple customer data. The customer name arrives with inconsistent whitespace:

```text
  John   Doe
```

We want to normalize it to:

```text
JOHN DOE
```

This transformation can already be expressed by combining existing Simple functions, so there is little reason to implement it in Java. We will create a local `cleanName` function that performs the following operations:

```text
trim
  → normalizeWhitespace
  → uppercase
```

The same customer also has the following email address:

```text
john.doe@example.com
```

Before writing that address to another message, we want to mask it:

```text
j***@example.com
```

For the purpose of this example, we will treat the masking rule as application-specific logic and implement it as a reusable Java function:

```text
${maskEmail(${header.customerEmail})}
```

The final route therefore demonstrates two different ways of extending what we can do from a Simple expression. `cleanName` is composed entirely from existing Simple functions, while `maskEmail` is implemented in Java and exposed back to the route as a Simple function.

## Step 1: Create the example directory

Create a directory for the example and change into it:

```shell
mkdir custom-simple-function
cd custom-simple-function
```

Inside this directory, we will create the following two files:

```text
route.camel.yaml
MaskEmailFunction.java
```

The complete integration flow stays in `route.camel.yaml`. The Java file contains only the small piece of functionality that we want to add to Simple.

## Before using Java: composing functions with Simple

Before implementing our Java function, it is worth looking at what Simple itself can already do. In Camel 4.22, a Simple expression can contain an initialization block using `$init{}`. ([Apache Camel – Simple Advanced Features][2])

```text
$init{
    ...
}init$
```

Inside this block, we can define a local function by composing existing Simple functions with the `~:=` operator. For example, our `cleanName` function can be defined like this:

```text
$init{
  $cleanName ~:= ${trim()} ~> ${normalizeWhitespace()} ~> ${uppercase()};
}init$

${cleanName(${header.customerName})}
```

The function definition combines three existing Simple functions using Camel's chain operator `~>`:

```text
${trim()}
    ~> ${normalizeWhitespace()}
    ~> ${uppercase()}
```

The result of each function becomes the input of the next one. A value such as:

```text
  John   Doe
```

therefore moves through the chain like this:

```text
input
  │
  ▼
trim()
  │
  ▼
normalizeWhitespace()
  │
  ▼
uppercase()
  │
  ▼
JOHN DOE
```

Once defined, the complete transformation can be called through the much more meaningful expression:

```text
${cleanName(${header.customerName})}
```

There is no Java implementation behind `cleanName`; the entire function is composed from functionality that Simple already provides. Functions defined in an `$init{}` block are local to the Simple expression in which they are declared, which makes them particularly useful for structuring larger transformations and giving them meaningful names. ([Apache Camel – Simple Advanced Features][2])

If the required logic can be expressed clearly by combining existing Simple operations, this is often all we need. Our email masking requirement is deliberately different: instead of composing existing operations, we want to implement our own application-specific algorithm and expose it as a reusable function.

For that, we will create a Java-based `SimpleFunction`.

## Step 2: Create the Java Simple function

Create a file called:

```text
MaskEmailFunction.java
```

and add the following code:

```java
import org.apache.camel.BindToRegistry;
import org.apache.camel.Exchange;
import org.apache.camel.spi.SimpleFunction;

@BindToRegistry("mask-email-function")
public class MaskEmailFunction implements SimpleFunction {

    @Override
    public String getName() {
        return "maskEmail";
    }

    @Override
    public Object apply(Exchange exchange, Object input) throws Exception {
        String email = input.toString().trim();

        int at = email.indexOf('@');

        if (at <= 0 || at == email.length() - 1) {
            return "***";
        }

        String localPart = email.substring(0, at);
        String domain = email.substring(at);

        return localPart.substring(0, 1) + "***" + domain;
    }
}
```

That is the complete Java implementation. To understand how Camel makes this available to Simple, there are three parts worth looking at.

### Implement `SimpleFunction`

The class implements:

```java
org.apache.camel.spi.SimpleFunction
```

The actual function logic is contained in the `apply()` method:

```java
public Object apply(Exchange exchange, Object input)
```

`input` contains the value passed to the function. In our example, the input will be:

```text
john.doe@example.com
```

and the function returns:

```text
j***@example.com
```

The method also receives the current Camel `Exchange`. We do not need it for this simple example, but it gives more advanced functions access to information associated with the current message. ([Apache Camel – Simple Advanced Features][2])

### Give the function a name

The name exposed to the Simple language comes from:

```java
@Override
public String getName() {
    return "maskEmail";
}
```

This means that the function can later be called from a Simple expression using:

```text
${maskEmail(...)}
```

The Java class name therefore does not become part of the route. The route developer only needs to know the meaningful function name `maskEmail`.

### Make the function available to Camel

The class is annotated with:

```java
@BindToRegistry("mask-email-function")
```

When running this example with Camel CLI, the annotation makes an instance available through Camel's Registry so that the `SimpleFunction` can be discovered. Camel CLI can run regular Java source files alongside route DSL files, which makes this particularly convenient for small standalone examples. ([Apache Camel – Java Beans][3])

The registry bean name and the Simple function name are two different things:

```text
Registry bean:   mask-email-function
Simple function: maskEmail
```

For somebody writing the route, `maskEmail` is the relevant name.

## Step 3: Create the YAML route

Now create the second file:

```text
route.camel.yaml
```

with the following content:

```yaml
- route:
    id: custom-simple-function
    from:
      uri: "timer:demo?repeatCount=1"
      steps:
        - setHeader:
            name: customerName
            constant: "  John   Doe  "

        - setHeader:
            name: customerEmail
            constant: "john.doe@example.com"

        - log:
            message: |
              Original customer:
              Name: ${header.customerName}
              Email: ${header.customerEmail}

        - setBody:
            simple: |
              $init{
                $cleanName ~:= ${trim()} ~> ${normalizeWhitespace()} ~> ${uppercase()};
              }init$

              Customer: ${cleanName(${header.customerName})}
              Contact: ${maskEmail(${header.customerEmail})}

        - log:
            message: |
              Processed customer:
              ${body}
```

This route now demonstrates both approaches in the same Simple expression.

The first function is defined directly inside the `$init{}` block:

```text
$cleanName ~:= ${trim()} ~> ${normalizeWhitespace()} ~> ${uppercase()};
```

and then called with:

```text
${cleanName(${header.customerName})}
```

There is no Java implementation involved. Camel passes the header value through `trim()`, `normalizeWhitespace()` and `uppercase()`, resulting in `JOHN DOE`.

Immediately below it, we call:

```text
${maskEmail(${header.customerEmail})}
```

From the perspective of somebody reading the YAML route, this looks very similar to `cleanName`. The difference is that the implementation comes from `MaskEmailFunction.java`.

That is an important property of this approach: the route does not have to change its programming model just because one operation requires Java. Both Simple-composed logic and application-specific Java functionality can be used naturally inside the same expression.

## Step 4: Run the integration

At this point, the directory should look like this:

```text
custom-simple-function/
├── route.camel.yaml
└── MaskEmailFunction.java
```

Camel CLI can run multiple files together, including YAML route definitions and regular Java source files. Both files can therefore simply be started using: ([Apache Camel – Java Beans][3])

```shell
camel run route.camel.yaml MaskEmailFunction.java
```

## Expected result

The route executes once and should produce output similar to:

```text
Original customer:
Name: John   Doe
Email: john.doe@example.com
```

followed by:

```text
Processed customer:
Customer: JOHN DOE
Contact: j***@example.com
```

Both extension mechanisms are now active in the same route. The customer name is transformed entirely through Simple, while the email address passes through our Java implementation:

```text
customerName
    │
    ▼
cleanName
    │
    ├── trim()
    ├── normalizeWhitespace()
    └── uppercase()
    │
    ▼
JOHN DOE


customerEmail
    │
    ▼
maskEmail
    │
    └── MaskEmailFunction.java
    │
    ▼
j***@example.com
```

## Using the current message body as input

A custom function does not necessarily need an explicit argument. Suppose the current message body already contains:

```text
john.doe@example.com
```

Our Java function can then be called using:

```text
${maskEmail}
```

or:

```text
${maskEmail()}
```

Camel uses the current message body as the function input. This behavior is supported by custom Simple functions and allows them to fit naturally into transformation pipelines. ([Apache Camel – Simple Advanced Features][2])

A simple route fragment could therefore look like this:

```yaml
- setBody:
    constant: "john.doe@example.com"

- setBody:
    simple: "${maskEmail}"

- log:
    message: "Masked email: ${body}"
```

The same principle applies to a function composed inside `$init{}`:

```text
$init{
  $cleanName ~:= ${trim()} ~> ${normalizeWhitespace()} ~> ${uppercase()};
}init$

${cleanName()}
```

Without an explicit argument, the current message body passes through the complete function chain. This becomes particularly useful when building transformation pipelines.

## Combining custom and built-in functions

Simple's chain operator allows built-in and custom functions to be combined. The operator:

```text
~>
```

passes the result of the expression on its left to the function on its right. ([Apache Camel – Simple Advanced Features][2])

Instead of writing:

```text
${maskEmail(${header.customerEmail})}
```

we can therefore write:

```text
${header.customerEmail} ~> ${maskEmail}
```

We can also add built-in operations before our custom function:

```text
${header.customerEmail}
    ~> ${trim()}
    ~> ${maskEmail}
```

The email address is first trimmed and the resulting value is then passed to the Java-based `maskEmail` function. Application-specific functionality therefore becomes another building block in the same transformation pipeline as Camel's built-in functions.

## Simple already avoids a lot of Java

A custom Java function should not be the first solution for every transformation. Simple itself already handles a considerable amount of route-level logic involving message bodies, headers, variables, exchange properties, strings, numbers, dates, collections, JSON, XML, predicates, conditions and type conversions. ([Apache Camel – Simple Language][1])

For example:

```text
${header.customerName}
    ~> ${trim()}
    ~> ${normalizeWhitespace()}
    ~> ${uppercase()}
```

is short enough to remain directly inside a route. Creating a Java processor or helper class for such a transformation would add complexity without adding much value.

If the expression becomes larger or is easier to understand under a meaningful name, `$init{}` gives us another option:

```text
$init{
  $cleanName ~:= ${trim()} ~> ${normalizeWhitespace()} ~> ${uppercase()};
}init$

${cleanName(${header.customerName})}
```

We still have not written any Java. Simple should therefore normally be the first place to look when implementing small pieces of route-level transformation or decision logic.

## When Java is useful

There will still be cases where an expression language is no longer the right place for the implementation. Company-specific material-number normalization, proprietary naming rules, complex classifications, special validation algorithms, application-specific identifier generation or the reuse of existing Java libraries are all examples where a Java implementation may be clearer and easier to maintain.

In such cases, a `SimpleFunction` provides a small extension point without changing the architecture of the route. For example, we could implement:

```java
public class MaterialNumberFunction implements SimpleFunction {
    // company-specific implementation
}
```

and expose that functionality to route developers as:

```text
${normalizeMaterialNumber(...)}
```

The same principle could be applied to functions such as:

```text
${calculateCustomerClass(...)}
${sanitizeForLogging(...)}
```

The implementation complexity stays behind the function, while the route only sees a concise and meaningful operation.

## Local Simple functions or Java functions?

The two approaches serve slightly different purposes. A function declared inside `$init{}` is local to the Simple expression and is a good fit when existing Simple functionality already does what we need, but we want to compose several operations and give the result a meaningful name. ([Apache Camel – Simple Advanced Features][2])

A Java `SimpleFunction`, on the other hand, is registered with Camel and is better suited to application-specific functionality that should be encapsulated independently of one particular expression.

A useful way to think about the decision is:

```text
Can Simple already do it?
        │
        ├── Yes
        │    │
        │    ▼
        │  Use built-in Simple
        │
        ▼
Is the expression becoming harder to read?
        │
        ├── Yes
        │    │
        │    ▼
        │  Compose a local function with $init{}
        │
        ▼
Does it require genuinely custom logic?
        │
        ├── Yes
        │    │
        │    ▼
        │  Implement a Java SimpleFunction
        │
        ▼
Use it from the YAML route like another function
```

This keeps the amount of Java in an integration proportional to the actual complexity of the problem rather than making Java the default choice for every transformation.

## Accessing the Camel Exchange

A Java custom function receives not only its input value but also the current Camel `Exchange`:

```java
public Object apply(Exchange exchange, Object input)
```

This means a function can do more than simply transform its argument. When required, it can access headers, variables, exchange properties, the Camel context or other information associated with the current message. ([Apache Camel – Simple Advanced Features][2])

That makes `SimpleFunction` a lightweight bridge between declarative route expressions and more advanced application-specific functionality. For simple transformations such as our email masking function, however, the explicit input value is all we need.

## Handling null values

There is one implementation detail worth knowing when implementing `SimpleFunction`. By default, Camel does not call `apply()` when the resolved function input is `null`. ([Apache Camel – Simple Advanced Features][2])

For example:

```text
${maskEmail(${header.customerEmail})}
```

will resolve to a `null` input if the `customerEmail` header does not exist. The default implementation of:

```java
allowNull()
```

returns `false`, so Camel does not invoke the function in that case.

If handling a missing value should be part of the function itself, override `allowNull()`:

```java
@Override
public boolean allowNull() {
    return true;
}
```

The implementation can then decide how to deal with the missing input:

```java
@Override
public Object apply(Exchange exchange, Object input) throws Exception {
    if (input == null) {
        return "not provided";
    }

    String email = input.toString();

    // ...
}
```

For many transformation functions, Camel's default behavior is appropriate. Overriding `allowNull()` is only necessary when handling the missing value is explicitly part of the function's responsibility.

## Simple first, Java where useful

The main point of custom Simple functions is not that every transformation should eventually be implemented in Java. Quite the opposite: Simple already provides a powerful toolbox that can keep a significant amount of route logic directly inside the YAML definition. ([Apache Camel – Simple Language][1])

For straightforward transformations, use Simple directly:

```text
${header.customerName} ~> ${trim()} ~> ${uppercase()}
```

If several existing operations form a larger transformation, compose them into a local function:

```text
$init{
  $cleanName ~:= ${trim()} ~> ${normalizeWhitespace()} ~> ${uppercase()};
}init$

${cleanName(${header.customerName})}
```

Only when the requirement becomes genuinely application-specific do we add the missing functionality in Java:

```text
${maskEmail(${header.customerEmail})}
```

The resulting architecture can remain simple:

```text
YAML route
    │
    ▼
Simple expressions
    │
    ▼
Built-in functions
    │
    ▼
Composed local functions with $init{}
    │
    ▼
Custom Java functions where required
```

Java remains available whenever we need its full capabilities, but we do not have to use it for every small piece of route logic. Even when Java is necessary, `SimpleFunction` lets us encapsulate the implementation behind a concise expression while the integration flow itself remains declarative.

## Complete runnable example

For reference, the complete example consists of these two files:

```text
custom-simple-function/
├── route.camel.yaml
└── MaskEmailFunction.java
```

### `MaskEmailFunction.java`

```java
import org.apache.camel.BindToRegistry;
import org.apache.camel.Exchange;
import org.apache.camel.spi.SimpleFunction;

@BindToRegistry("mask-email-function")
public class MaskEmailFunction implements SimpleFunction {

    @Override
    public String getName() {
        return "maskEmail";
    }

    @Override
    public Object apply(Exchange exchange, Object input) throws Exception {
        String email = input.toString().trim();

        int at = email.indexOf('@');

        if (at <= 0 || at == email.length() - 1) {
            return "***";
        }

        String localPart = email.substring(0, at);
        String domain = email.substring(at);

        return localPart.substring(0, 1) + "***" + domain;
    }
}
```

### `route.camel.yaml`

```yaml
- route:
    id: custom-simple-function
    from:
      uri: "timer:demo?repeatCount=1"
      steps:
        - setHeader:
            name: customerName
            constant: "  John   Doe  "

        - setHeader:
            name: customerEmail
            constant: "john.doe@example.com"

        - log:
            message: |
              Original customer:
              Name: ${header.customerName}
              Email: ${header.customerEmail}

        - setBody:
            simple: |
              $init{
                $cleanName ~:= ${trim()} ~> ${normalizeWhitespace()} ~> ${uppercase()};
              }init$

              Customer: ${cleanName(${header.customerName})}
              Contact: ${maskEmail(${header.customerEmail})}

        - log:
            message: |
              Processed customer:
              ${body}
```

### Run with Camel CLI

```shell
camel run route.camel.yaml MaskEmailFunction.java
```

The output should look similar to:

```text
Original customer:
Name: John   Doe
Email: john.doe@example.com

Processed customer:
Customer: JOHN DOE
Contact: j***@example.com
```

With two files and one command, the example demonstrates both extension mechanisms: reusable logic composed directly from Simple functions and application-specific Java logic exposed back to the route as another Simple function.

## Conclusion

Apache Camel's Simple language can handle far more than just accessing a message body or header. For many integrations, its built-in functions and operators cover a significant part of the transformation and decision logic required directly inside a route. ([Apache Camel – Simple Language][1])

When several existing operations belong together, `$init{}` allows us to compose them into meaningful local functions without writing Java. And when something genuinely application-specific is missing, a Java `SimpleFunction` provides a clean extension mechanism without forcing the integration route itself into Java. ([Apache Camel – Simple Advanced Features][2])

The result is a useful balance: the route remains YAML, specialized implementations stay encapsulated, and both approaches can be consumed through concise Simple expressions such as:

```text
${cleanName(...)}
${maskEmail(...)}
```

**Use Simple wherever it keeps the route clear. Compose what you can. Add Java where it actually provides value.**

[1]: /components/next/languages/simple-language.html "Apache Camel - Simple Language"
[2]: /components/next/languages/simple-advanced.html "Apache Camel - Simple Advanced Features"
[3]: /manual/camel-jbang-beans.html "Apache Camel - Java Beans"
[4]: https://issues.apache.org/jira/browse/CAMEL-24486 "CAMEL-24486"
[5]: /manual/camel-jbang-running.html#_using_profiles "Apache Camel CLI - Using Profiles"
