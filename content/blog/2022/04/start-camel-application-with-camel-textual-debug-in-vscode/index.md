---
title: "Start a Camel Main application with Textual debug for Camel routes in VS Code with a single launch configuration"
date: 2022-04-14
authors: [apupier]
categories: ["Tooling"]
preview: "Start a Camel Main application with Textual debug for Camel routes in VS Code with a single launch configuration"
---

Textual debug for Camel routes allows to set breakpoints at Route definition.

The [Debug Adapter for Apache Camel VS Code extension](https://marketplace.visualstudio.com/items?itemName=redhat.vscode-debug-adapter-apache-camel) latest release 0.1.1 [supports JMX connection](/blog/2022/04/camel-textual-debug-0.1.0/). It opens the possibility to start a Camel application with Camel textual route debugging activated in a single VS Code launch configuration. I thought it would be a five minutes effort but it was a several hours search to configure a not-yet-perfect solution. I hope that sharing the current state will save you few hours! Let's see the different configurations required to achieve it.

# How to configure VS Code

## Minimal Camel version

Check that Camel 3.16+ is used.

## camel-debug on classpath

`camel-debug` must be on the classpath for the debug session. As it should not be used in production, a good way to achieve it is to use a Maven profile, for instance:

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

## VS Code task to start application

Next step consist in providing a VS Code task to start the Camel application with `camel-debug` on the classpath by using the `camel.debug` profile mentioned in previous point.

In `.settings/tasks.json` (the file might need to be created), you need to add this kind of task:

```json
{
	"version": "2.0.0",
	"tasks": [
		{
			"label": "Run Camel application with debug Profile",
			"type": "shell",
			"command": "mvn", // mvn binary of Maven must be available on command-line
			"args": [
				"camel:run",
				"-Pcamel.debug" // This depends on your project. The goal here is to have camel-debug on the classpath.
			],
			"problemMatcher": { // Problem matcher is mandatory to avoid a dialog warning on each launch but cannot find a good way to configure it
				"owner": "camel",
				"pattern": {
					"regexp": "^.*$"
				},
				"severity": "error",
				"source": "maven",
				"background": {
					"activeOnStart": true,
					"beginsPattern": "^.*$",
					"endsPattern": "^.*$"
				}
			},
			"presentation": {
				"reveal": "always"
			},
			"isBackground": true // Must be set as background as the Maven commands doesn't return until the Camel application stops.
		}
	]
}
```

## Launch configuration to Attach debugger and start application

The idea here is to provide a Launch configuration which will do both: start the Camel application and attach the Camel debugger.

In `.settings/launch.json` (the file might need to be created), you need to add this kind of configuration:

```json
{
	"version": "0.2.0",
	"configurations": [
		{
			"name": "Run with Camel Debugger",
			"type": "apache.camel",
			"request": "attach",
			"preLaunchTask": "Run Camel application with debug Profile" // This must match the label provided as task
		}
	]
}
```

On slow connection, it might not work the first time as the timeout to connect the debugger will be hit. It is not yet configurable, just relaunch it.

## Run & Debug

Last action is to call the Launch configuration. If you have a single launch configuration, hitting `F5` should work. Otherwise, you can go to the `Run and Debug panel` and then `Run & Debug` the launch configuration that you just configured.

Time to set breakpoints and enjoy!

# Resources

[Here](https://github.com/apupier/camel-examples/tree/Demo-for-blogpost/examples/main) you can see a branch of the Camel Main example with metadata preconfigured for VS Code.

I created a short video to see all of that in action [here](https://youtu.be/YSr-FccRgms).

# What's next

I really welcome feedback from VS Code advanced users. The main questions that I have in mind are:

* Are there better ways to handle this use case?
* How to configure properly the `problemMatcher`?
* Is it possible to stop the task launched in `preLaunchTask` when disconnecting the debugger (using the `postDebugTask`)?
* Are there ways to reuse `vscode-maven` execution commands instead of generic VS Code task of type `shell`?

Next step will be to provide completions to help combining these configurations. And then maybe providing a fully built-in specific launch configuration.

You can submit your enhancement requests on the [VS Code client for Debug Adapter for Camel](https://github.com/camel-tooling/camel-dap-client-vscode/issues) or in the [Red Hat Jira](https://issues.redhat.com/browse/FUSETOOLS2).
