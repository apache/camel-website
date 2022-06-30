---
title: "How to use Camel textual Route Debugger with Unit test in VS Code"
date: 2022-06-22
authors: [apupier]
categories: ["Tooling"]
preview: "How to use Camel textual Route Debugger with Unit test in VS Code"
---

Textual debug for Camel routes allows to set breakpoints at Route definition. It is convenient to leverage this feature with a Unit test.

This article will explain how it is possible to configure the project and the VS Code IDE for that. Similar functionality should be possible with other IDEs but not covered in this article.

# Requirements

In this article, we will focus on using VS Code IDE. It implies the following requirements:

- [VS Code client for Debug Adapter for Camel](https://github.com/camel-tooling/camel-dap-client-vscode/issues) installed in your VS Code instance
- Maven available on system path
- Java 11+ installed
- Camel 3.17+

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

Two methods must have a specific value:

- `isUseDebugger` method must return false. This is the default implementation, just ensure that it is not overridden.
- `useJMX` method must return true. This needs to be overridden.


We also need to ensure that the test is starting after Debugger is attached and breakpoint set. For now, the only solution that I can propose is to insert a (ugly) `Thread.sleep` at the beginning of the test. It will work only if the test is triggering the route execution. If your route is automatically triggered like for a `timer`, some route executions might happen before the debugger is attached and breakpoints enabled.

You should end up with something like that:

```java
class MainTest extends CamelMainTestSupport {
	@Test
	void myTest() throws Exception {
		Thread.sleep(2000); // to let time to Debugger to attach and install breakpoints
		template.asyncSendBody("direct:demo", ""); // Take care to start the route in an async way
		NotifyBuilder notify = new NotifyBuilder(context)
			.whenCompleted(1).whenBodiesDone("Bye World").create();
		assertTrue(
			notify.matches(60, TimeUnit.SECONDS), "1 message should be completed"
		);
	}

	@Override
	protected boolean useJmx() {
		return true;
	}
}
```

You might also want to introduce a longer timeout to let you time to debug.

# IDE configuration

## VS Code Task configuration

The following VS Code task must be created in the `.vscode/tasks.json` file:

```json
{
	"version": "2.0.0",
	"tasks": [
		{
			"label": "Start test with camel.debug profile",
			"type": "shell",
			"command": "mvn", // mvn binary of Maven must be available on command-line
			"args": [
				"test",
				"-Pcamel.debug" // This depends on your project. The goal here is to have camel-debug on the classpath.
			],
			"problemMatcher": "$camel.debug.problemMatcher",
			"presentation": {
				"reveal": "always"
			},
			"isBackground": true // Must be set as background as the Maven commands doesn't return until the Camel application stops.
		}
	]
}
```

It allows to start the test with `camel-debug` on the classpath.

## VSCode Launch configuration

The following launch configuration must be created in the `.vscode/launch.json`:

```json
{
	"version": "0.2.0",
	"configurations": [
		{
			"name": "Start test and attach Camel Debugger",
			"type": "apache.camel",
			"request": "attach",
			"preLaunchTask": "Start test with camel.debug profile" // must reference the label of the VS Code task previously created
		}
	]
}
```

It allows to call the VS Code tasks starting the test and attach debugger when the Camel debugger is ready.

# Run & Debug

Place the breakpoint on your Camel Route.

Then you can launch the test with Camel debugger which will be automatically attached. You just have to enjoy your debug session!

# Resources

See the full configuration steps in [this video](https://youtu.be/be8XajY5G84).

You can see an adapted official example with checked-in VS Code settings [here](https://github.com/apupier/camel-examples/tree/Blogpost-Example-Debug-Camel-In-Test/examples/main).

# Limitations

We have seen one way to debug a Camel route textually which is part of a test. You might have noticed that it comes with several limitations. Let's summarize them:

- One test at a time
- Requires modification of test code to activate JMX
- Requires modification of test code to ensure debugger is ready on first route execution in the test
- Cannot use [Camel test Java Debugger](/manual/debugger.html)

Stay tuned as I expect several of these limitations to be overcome in following weeks.

# What's next

You can submit your enhancement requests on the [VS Code client for Debug Adapter for Camel](https://github.com/camel-tooling/camel-dap-client-vscode/issues) or in the [Red Hat Jira](https://issues.redhat.com/browse/FUSETOOLS2). Feel free to upvote or comment existing ones too and to provide Pull Requests if you are interested.
