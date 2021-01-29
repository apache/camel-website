---
title: "Camel Quarkus Configuration Tips"
date: 2021-01-29
authors: ["aldettinger"]
categories: ["Camel Quarkus"]
preview: "Camel Quarkus Configuration Tips"
summary: "Some tips related to configuration in Camel Quarkus"
---

Lately, I have exchanged with a member of the Camel community around configuration properties in Camel Quarkus.
It's really interesting to hear about situations people are facing out there, so please keep reaching out to the community.
Thinking back about the case at hand, I think there is room for a refresher about some configuration tips.

## Configuration via application.properties file

Among the multiple ways to define configurations in Camel Quarkus, the more common must be the `application.properties` file, as illustrated below:
```properties
basic=a-basic-value
```

There are few possibilities for a developer to use the defined configurations.
One could use the `@ConfigProperty` annotation as beneath:
```
@ConfigProperty(name = "basic")
String basicPropertyFromAnnotation;
```

It's also possible to access the configuration values programmatically via the following code:
```
String basicPropertyFromConfigProvider = ConfigProvider.getConfig().getValue("basic", String.class);
```

From the Camel side, the `{{...}}` notation could be issued, for instance, in a simple expression:
```
from(...).setBody(simple("{{basic}}"))
```

It's worth noting that in a first pass the `application.properties` file is parsed thanks to `java.util.Properties`.
And as such, the corresponding character escaping rules apply. For instance one could define a configuration using the mathematical square root sign `\u221A` as beneath:
```properties
unicode = a-value-with-unicode-character-(\u221A9=3)
```

## Property expressions

But there is more processing happening in a second pass thanks to [smallrye-common](https://github.com/smallrye/smallrye-common) and it leads to more features.
For instance, with property expressions one could define a configuration as below:
```properties
embedded = resolved-via-a
property-expression = a-value-${embedded}-property-expression
```

Notice how the property from the second line embeds the value from the first line. The resulting value at the end would be `a-value-resolved-via-a-property-expression`.

## Environment variables

Another topic of interest is environment variable expansion. Look at the following property definition where the USERNAME environment variable is used:
```properties
environment-variable = a-value-with-environment-variable-${USERNAME}
```

So, it is possible to include references to environment variables. In case Camel Quarkus runs in an environment where the variable is not defined,
it is even feasible to define a default value after the `:` character like this:
```properties
environment-variable-or-default = ${UNEXISTING_ENV_VAR:a-default-value}
```

Last but not least, it's also possible to mix property expressions with environment variables as in the following lines:
```properties
default-value = a-default-value-resolved-via-a-property-expression
envvar-or-default-via-property-expression = ${UNEXISTING_ENV_VAR:${default-value}}
```
The more meaningful part is `${UNEXISTING_ENV_VAR:${default-value}}`. If the environment variable `UNEXISTING_ENV_VAR` is not defined, we end up embedding the `default-value` configured one line above.

## A tricky situation

The previous syntax `${VAR:default}` may sound familiar for some Camel users. Indeed, it reminds us of some parts of the [Camel simple language](/components/latest/languages/simple-language.html).
For instance, some developers could end up defining a property like below:
```properties
date-expression = ${date:now}
```
And then using it in a Camel simple expression like that:
```
from(...).setBody(simple("{{date-expression}}")
```
But when the simple expression `{{date-expression}}` is evaluated at runtime, the resulting body is... `null`

It could sound a bit strange at first, but let's review this situation with what we have learned so far.
On the first pass, the `application.properties` file is parsed with respect to the [Properties file format](https://docs.oracle.com/javase/7/docs/api/java/util/Properties.html). No special characters are used, so the parsing outcome would be `${date:now}` as expected.

But in the second pass, it turns out that this property value is interpreted as the expansion of an environment variable named `date` with a default value. As such, Camel is wrongly provided with the value `now`. The expansion algorithm is detailed in [io.smallrye.common.expression.Expression.parseString(...)](https://github.com/smallrye/smallrye-common/blob/0b59733491ff936808cd26a4b300f11fe3f2a5f0/expression/src/main/java/io/smallrye/common/expression/Expression.java#L245).
Paying close attention, it appears that the environment value expansion could be avoided using `$$`:
```properties
date-expression = $${date:now}
```
Exactly what we needed, Camel is now provided with the simple expression `${date:now}` and set the body to a value like `Fri Jan 29 17:07:44 CET 2021` on execution.

## Summary

At the end of the day, we had a refresher about `application.properties`, property expressions, and environment variables.
We have seen how to deal with a tricky situation. There must be even more corner cases out there but we hope this article offered some pointers to help.

The source code for this example could be found [here](https://github.com/aldettinger/camel-quarkus-properties). And, the Quarkus configuration reference guide is located [there](https://quarkus.io/guides/config-reference).

Many thanks for reading.