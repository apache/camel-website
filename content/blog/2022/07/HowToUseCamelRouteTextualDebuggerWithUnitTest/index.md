---
title: "How to use Camel textual Route Debugger with Unit test in VS Code - Updated with Camel 3.18"
date: 2022-07-26
authors: [apupier]
categories: ["Tooling"]
preview: "How to use Camel textual Route Debugger with Unit test in VS Code - Updated with Camel 3.18"
---

Textual debug for Camel routes allows to set breakpoints at Route definition. It is convenient to leverage this feature with a Unit test.

Last month, I published a [blogpost](/blog/2022/06/HowToUseCamelRouteTextualDebuggerWithUnitTest) but it had several limitations listed. Most of them have been fixed. This article is an updated version that will explain how it is possible to configure the project and the VS Code IDE for that. Similar functionality should be possible with other IDEs but not covered in this article.

Note: If you prefer to watch than read, you can go to [this video](https://youtu.be/_hKIg81WJUs).

# Requirements

In this article, we will focus on using the [VS Code IDE](https://code.visualstudio.com/). It implies the following requirements:

- [VS Code client for Debug Adapter for Camel](https://github.com/camel-tooling/camel-dap-client-vscode/issues) installed in your VS Code instance
- [Maven](https://maven.apache.org/) available on system path
- Java 11+ installed
- Camel 3.18+

# Project configuration

## Pom file configuration

`camel-debug` must be on the classpath. One way to achieve that is to provide the dependency in a profile which needs to be activated when the tests are launched.

```xml
<profiles>
    <profile>
        <id>camel.debug</id>
        <activation>
            <property>
                <name>camel.debug</name>
                <value>true</value>
            </property>
        </activation>
        <dependencies>
            <dependency>
                <groupId>org.apache.camel</groupId>
                <artifactId>camel-debug</artifactId>
            </dependency>
        </dependencies>
    </profile>
</profiles>
```

## Test class configuration

You might need to provide a longer timeout to let you time to debug, something like:

```java
class MainTest extends CamelMainTestSupport {
	@Test
	void myTest() throws Exception {
		NotifyBuilder notify = new NotifyBuilder(context)
			.whenCompleted(1).whenBodiesDone("Bye World").create();
		assertTrue(
			notify.matches(90, TimeUnit.SECONDS), "1 message should be completed"
		);
	}
}
```

# IDE configuration

## VS Code Task configuration

A VS Code task must be created in the `.vscode/tasks.json` file to start the test with correct settings. You can use the snippet available on completion. It will create something like:

```json
{
	"version": "2.0.0",
	"tasks": [
		{
			"label": "Launch Camel test with Maven with camel.debug profile",
			"type": "shell",
			"command": "mvn", // mvn binary of Maven must be available on command-line
			"args": [
				"test",
				"-Dtest=*", // If more than one test is present, a specific one must be specified as a single test can be Camel debugged per launch.
				"-Pcamel.debug" // This depends on your project. The goal here is to have camel-debug on the classpath.
			],
			"options": {
				"env": {
					"CAMEL_DEBUGGER_SUSPEND": "true" // Set to true by default. A debugger must be attached for message to be processed.
				}
			},
			"problemMatcher": "$camel.debug.problemMatcher",
			"presentation": {
				"reveal": "always"
			},
			"isBackground": true // Must be set as background as the Maven commands doesn't return until the Camel application stops.
		}
	]
}
```

## VS Code Launch configuration

A launch configuration must be created in the `.vscode/launch.json`. It allows to call the VS Code tasks starting the test and attach debugger when the Camel debugger is ready. A snippet completiion is available to guide to create it. You will end up with something like:


```json
{
	"version": "0.2.0",
	"configurations": [
		{
			"name": "Start test and attach Camel Debugger",
			"type": "apache.camel",
			"request": "attach",
			"preLaunchTask": "Launch Camel test with Maven with camel.debug profile" // must reference the label of the VS Code task previously created
		}
	]
}
```

# Run & Debug

Place the breakpoint on your Camel Route *before* launching the test.

Then you can launch the test with Camel debugger which will be automatically attached. It is now time to enjoy your debug session!

# Resources

See the full configuration steps in [this video](https://youtu.be/_hKIg81WJUs).

You can see an adapted official example with checked-in VS Code settings [here](https://github.com/apupier/camel-examples/tree/demo-blogpost-test-v2/examples/main).

# Limitations

We have seen one way to debug a Camel route textually which is part of a test. You might have noticed that it remains one important limitations which is that we can launch a single test at a time.

# What's next

You can submit your enhancement requests on the [VS Code client for Debug Adapter for Camel](https://github.com/camel-tooling/camel-dap-client-vscode/issues) or in the [Red Hat Jira](https://issues.redhat.com/browse/FUSETOOLS2). Feel free to upvote or comment existing ones too and to provide Pull Requests if you are interested.
