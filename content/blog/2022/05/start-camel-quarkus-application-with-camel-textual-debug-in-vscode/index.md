---
title: "How to start a Camel Quarkus application with Textual debug for Camel routes in VS Code with a single launch configuration"
date: 2022-05-06
authors: [apupier]
categories: ["Tooling"]
preview: "How to start a Camel Quarkus application with Textual debug for Camel routes in VS Code with a single launch configuration"
---

Textual debug for Camel routes allows to set breakpoints at Route definition.

I previously blogged how to use Camel Route textual debugger targeting [Camel Main](/blog/2022/04/start-camel-application-with-camel-textual-debug-in-vscode/) or [Camel JBang](/blog/2022/05/vscode-extension-release-debug-0.2.0/#command-to-start-with-jbang-and-camel-debug).
In this blogpost, I will describe the process for a Camel Quarkus application. I'm using VS Code as example but similar pattern is possible in other IDEs.

Please note that it is working only with Quarkus in JVM mode and not Native mode.

# How to configure VS Code

## Minimal Camel Quarkus version

Check that Camel Quarkus 2.8+ is used.

## camel-debug enablement

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
             <groupId>org.apache.camel.quarkus</groupId>
             <artifactId>camel-quarkus-management</artifactId>
        	 </dependency>
            <dependency>
                <groupId>org.apache.camel</groupId>
                <artifactId>camel-debug</artifactId>
                <version>3.16.0</version>
            </dependency>
        </dependencies>
    </profile>
</profiles>
```

Note that you need to add the `camel-quarkus-management` dependency too.

Given that camel-debug has not been quarkified [yet](https://github.com/apache/camel-quarkus/issues/3775). You need to add a simple configuration in the `application.properties` file:

```properties
quarkus.camel.service.discovery.include-patterns=META-INF/services/org/apache/camel/debugger-factory/*
quarkus.naming.enable-jndi=true
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
				"compile",
				"quarkus:dev",
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

## Run & Debug

Last action is to call the Launch configuration. If you have a single launch configuration, hitting `F5` should work. Otherwise, you can go to the `Run and Debug panel` and then `Run & Debug` the launch configuration that you just configured.

Time to set breakpoints and enjoy!

# Resources

[Here](https://github.com/apupier/camel-quarkus-examples) you can see a branch of the Camel Quarkus Timer log example with project modified and metadata pre-configured for VS Code Eclipse Desktop.

I created a short video to see all of that in action [here](https://youtu.be/owNhWxf42qk).

# What's next

Several potentially interesting next steps:

- Provide completion to create the task launching with `quarkus:dev` [FUSETOOLS2-1623](https://issues.redhat.com/browse/FUSETOOLS2-1623)
- Quarkify `camel-debug` [apache/camel-quarkus#3775]https://github.com/apache/camel-quarkus/issues/3775)
- Enhance `quarkus:dev` to preconfigure application with `camel-debug` [apache/camel-quarkus#3775]https://github.com/apache/camel-quarkus/issues/3775)
- Support automatic redeploy [FUSETOOLS2-1624](https://issues.redhat.com/browse/FUSETOOLS2-1624)

You can submit your enhancement requests on the [VS Code client for Debug Adapter for Camel](https://github.com/camel-tooling/camel-dap-client-vscode/issues) or in the [Red Hat Jira](https://issues.redhat.com/browse/FUSETOOLS2).
