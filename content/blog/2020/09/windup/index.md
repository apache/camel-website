---
title: "Upgrading to Camel 3.0.0 with Windup"
date: 2020-09-07
authors: ["jpoth"]
categories: ["Tooling"]
preview: Plan your upgrade to Camel 3.0.0
summary: "We'll show you how Windup can help you plan and estimate your upgrade to Camel 3"
---

## TL;DR:

[Install](https://github.com/windup/windup#installation-and-usage) Windup and generate your migration report to Camel 3.0.0 by running: 

    _bin/mta-cli --input PATH_TO_CAMEL_PROJET --sourceMode --source camel:2 --target camel:3_

Checkout sample reports for [Camel in Action, Second Edition](http://windup.surge.sh/cia2/reports/migration_issues.html), [Apache Camel Developer's Cookbook](http://windup.surge.sh/cookbook/reports/migration_issues.html) and [Mastering Apache Camel](http://windup.surge.sh/mastering/reports/migration_issues.html).

## Introduction

Camel 3.0.0 has been released in late 2019 which comes a decade after Camel 2.0.0 was released back in 2009. Camel 3 is a major upgrade from Camel 2 with lots of breaking changes. The Camel team has done a great job [documenting](/manual/latest/camel-3-migration-guide.html) those changes. In order to ease the upgrade, [Matej](https://github.com/mmelko) and I have decided to leverage the open source application migration tool [Windup](https://github.com/windup/windup) and extend it's existing migration [rules](https://github.com/windup/windup-rulesets) by adding Camel 2.x --> Camel 3 [rules](https://github.com/windup/windup-rulesets/tree/master/rules-reviewed/camel3/camel2).

## Running Windup locally

The easiest way to run Windup against your Camel 2 project is to follow the installation [instructions](https://github.com/windup/windup#installation-and-usage) which is just downloading a ZIP archive containing a _bin/mta-cli_ executable. Unfortunately, you will need to create a https://developers.redhat.com account if you don't have one already. You can then run it against your project:

    _./mta-cli --input PATH_TO_CAMEL_PROJET --sourceMode --source camel:2 --target camel:3_

and that's it! Once it's done, you should see a message containing the location of the generated Windup report which you can view by opening the generated _index.html_ file with your favorite browser.

To get an idea of what a Windup report looks like, I've generated and published Windup reports for source codes of well known Camel books: [Camel in Action, Second Edition](http://windup.surge.sh/cia2/reports/migration_issues.html), [Apache Camel Developer's Cookbook](http://windup.surge.sh/cookbook/reports/migration_issues.html) and [Mastering Apache Camel](http://windup.surge.sh/mastering/reports/migration_issues.html).

## Contributing

If you like what you see and want to contribute: good news! Windup loves [PRs](https://github.com/windup/windup#get-involved) 😁

We've created tasks for Camel [3.0](https://issues.redhat.com/browse/WINDUPRULE-391) --> [3.1](https://issues.redhat.com/browse/WINDUPRULE-519)--><a href="">3.2</a>-->[3.3](https://issues.redhat.com/browse/WINDUPRULE-521).

To get an idea of what needs to be done to create a new rule, let's look at some examples.

The [rules](https://github.com/windup/windup-rulesets/tree/master/rules-reviewed/camel3/camel2) can be either written in Groovy or XML. Groovy rules are more powerful than XML rules but if you prefer writting XML and the rule isn't too complicated, you can go for XML.
Each file contains rules whose filename describes what kind of rules it holds. For example, the file [xml-removed-components.windup.xml](https://github.com/windup/windup-rulesets/blob/2cc95ff40536c31f8c836e3acf7339d53ab4b282/rules-reviewed/camel3/camel2/xml-removed-components.windup.xml)
contains XML rules that check whether your project uses Camel Components that have been removed in Camel 3. As with programming in general, some file names are better than others. For each file there is a corresponding test file and a test folder that are used to test your rules.

For example, [xml-removed-components.windup.xml](https://github.com/windup/windup-rulesets/blob/2cc95ff40536c31f8c836e3acf7339d53ab4b282/rules-reviewed/camel3/camel2/xml-removed-components.windup.xml) contains the rule with id
[xml-removed-components-00000](https://github.com/windup/windup-rulesets/blob/2cc95ff40536c31f8c836e3acf7339d53ab4b282/rules-reviewed/camel3/camel2/xml-removed-components.windup.xml#L15) that checks whether your Maven project is using the _camel-linkedin_ component,
which has been removed in Camel 3, and if so, output a helpful message:
```xml
<rule id="xml-removed-components-00000">
    <when>
        <project>
            <artifact groupId="org.apache.camel" artifactId="camel-linkedin" />
        </project>
    </when>
    <perform>
        <hint title="`org.apache.camel:camel-linkedin` artifact has been removed" effort="7" category-id="mandatory" >
            <message>`org.apache.camel:camel-linkedin` artifact has been removed in Apache Camel 3 so it won't be available</message>
            <link href="/manual/latest/camel-3-migration-guide.html#_removed_components" title="Camel 3 - Migration Guide: Removed components" />
        </hint>
    </perform>
</rule>
```

It's corresponding test is located in [tests/xml-removed-components.windup.test.xml](https://github.com/windup/windup-rulesets/blob/2cc95ff40536c31f8c836e3acf7339d53ab4b282/rules-reviewed/camel3/camel2/tests/xml-removed-components.windup.test.xml#L10):

```xml
<rule id="xml-removed-components-00000-test">
    <when>
        <not>
            <iterable-filter size="1">
                <hint-exists message="`org.apache.camel:camel-linkedin` artifact has been removed in Apache Camel 3 so it won't be available"/>
            </iterable-filter>
        </not>
    </when>
    <perform>
        <fail message="[xml-removed-components] 'camel-linkedin' dependency removed hint was not found!" />
    </perform>
</rule>
```

which tests that given the [test resources](https://github.com/windup/windup-rulesets/blob/2cc95ff40536c31f8c836e3acf7339d53ab4b282/rules-reviewed/camel3/camel2/tests/xml-removed-components.windup.test.xml#L5) located in the test [folder](https://github.com/windup/windup-rulesets/tree/2cc95ff40536c31f8c836e3acf7339d53ab4b282/rules-reviewed/camel3/camel2/tests/data/xml-removed-components), the camel-linkedin error message is produced exactly once. The syntax for writting rules is pretty self explanatory but you can always check the official [documentation](https://access.redhat.com/documentation/en-us/red_hat_application_migration_toolkit/4.3/html/rules_development_guide/index) for help. You can run the tests in _xml-removed-components.windup.test.xml_ by running:

    _mvn -DrunTestsMatching=xml-removed-components clean test_.

Notice how the rule only checks if the project refers to _org.apache.camel:camel-linkedin_. Sometimes that dependency is pulled transitively and so a better idea would be to _also_ check whether your project contains Java, Blueprint or Spring files referencing the LinkedIn Camel Component. You can find how to do that in XML by looking at the rule that checks for usage of the [twitter-streaming](https://github.com/windup/windup-rulesets/blob/2cc95ff40536c31f8c836e3acf7339d53ab4b282/rules-reviewed/camel3/camel2/xml-removed-components.windup.xml#L67) Component. A similar [example](https://github.com/windup/windup-rulesets/blob/2cc95ff40536c31f8c836e3acf7339d53ab4b282/rules-reviewed/camel3/camel2/xml-moved-components.windup.groovy#L59) exists in Groovy for AWS Components.

As you've probably figured out by now, the best way to write a new rule is to look at existing ones.

## Limitations

As we've seen in the previous section, the rules are only as powerful as you've written them to be. However there are some limitations. Behind the scenes, Windup uses parsing. It will not compile your project. This has some limitations. For example, the following snippets checks whether some deprecated methods are used:

```xml
<rule id="java-generic-information-00032">
    <when>
        <javaclass references="org.apache.camel.CamelContext.{get|set}Propert{y|ies}({*})" >
            <location>METHOD_CALL</location>
        </javaclass>
    </when>
    <perform>
        <hint title="`org.apache.camel.CamelContext` property methods have been removed." effort="1"
              category-id="mandatory">
            <message>The `getProperties` and `setProperty` methods have been removed from `org.apache.camel.CamelContext`. Please use `getGlobalOptions` and `setGlobalOptions` instead</message>
            <link title="Camel 3 - Migration Guide: CONFIGURING GLOBAL OPTIONS ON CAMELCONTEXT"
                  href="/manual/latest/camel-3-migration-guide.html#_configuring_global_options_on_camelcontext"/>
        </hint>
    </perform>
</rule>
```

When running the rule, Windup will scan your Java files and try to find ones that import _org.apache.camel.CamelContext_ and then use the _{get|set}Propert{y|ies}({*})_ regular expression to match method names on declared variables of type _CamelContext_. One would think that it convers all use cases right? Well no. What if the class in question is a sublclass of another class that already imports _org.apache.camel.CamelContext_ ? Then the subclass doesn't need to reimport it and the Windup rule won't detect it's usage. This also happens when chaining method calls e.g `getCamelContext().getProperties()` which happens a lot in Camel.

Another problem is string interpolation. When writting a rule that tries to match a certain String, for example:

```xml
<rule id="xml-removed-components-00004">
    <when>
        <filecontent pattern="from(&quot;twitter-streaming:{*}" filename="{*}.java"/>
    </when>
    <perform>
        <hint title="`twitter-streaming` component has been removed" effort="7" category-id="mandatory" >
            <message>`twitter-streaming` component has been deprecated in Apache Camel 2 and removed in Apache Camel 3 because it relied on the deprecated Twitter Streaming API and is no longer functional.</message>
            <link href="/manual/latest/camel-3-migration-guide.html#_removed_components" title="Camel 3 - Migration Guide: Removed components" />
        </hint>
    </perform>
</rule>
```

tries to match Camel routes using the _twitter-streaming_ component by matching _from("twitter-streaming..."_ in .java files. However if the route URI is stored in a variable as so:
```java
String route_uri = "twitter-streaming://filter?type=event&twitterStream=#twitterStream&keywords=#cameltest";
from(route_uri)
    .transform(body().convertToString())
    .to("direct:result");
```

then the rule's regular expression will not match.

Another limitation when writing XML rules is the lack of debugging capabilities. This can lead to some frustration. In best cases, this is because the project is setup incorrectly. In worst cases, it's because there is a bug in Windup or the rule syntax is misleading and should not be used that way. Fortunately, the latter doesn't happen too often and you can always ask for help by sending an email to _windup-users@lists.jboss.org_ or using IRC on the irc.freenode.net #windup channel.

Thanks!