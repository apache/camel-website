---
title: "How to Java debug a Camel K integration in VS Code with Camel K 1.3.0"
date: 2021-01-20
authors: [apupier]
categories: ["Tooling","Camel K"]
preview: "How to Java debug a Camel K integration in VS Code with Camel K 1.3.0"
---

Camel K 1.3.0 is providing a new feature to Java debug deployed integrations. Even if Camel K 1.3.0 is [not fully compatible](https://github.com/apache/camel-k/issues/1872) with VS Code Tooling for Apache Camel K extension, it remains possible to leverage the VS Code Java debugging capabilities.

I recorded a [video](https://youtu.be/cFPuxd1Je3c) which is following the steps in this blogpost. I let you choose your preferred way to discover how to java debug your Camel K integration in VS Code.

# Requirements

- [VS Code Extension Pack for Apache Camel](https://marketplace.visualstudio.com/items?itemName=redhat.apache-camel-extension-pack)
- Uncheck _Camelk -> Integrations: Auto-upgrade_ in _File -> Preferences -> Settings -> Extensions -> Apache Camel K Tooling_
- [Camel K 1.3.0 binary](/download/#camel-k) available on command-line
- Camel K deployed to a cluster. In this demo, we will use a Camel K instance deployed on minikube.

# How to java debug

#### Create an Integration written in Java

- Open command palette _View -> Command Palette..._
- Select _Create a new Apache Camel K integration_
- Select _Java_
- Select the folder
- Provide a name, for instance: _Demo_

![Create java file](./1-CreateJavaCamelKIntegration.gif)

#### Set a breakpoint

To have a breakpoint during the execution of the Camel Route, as opposite at the creation of the Camel Route, you need to add a small piece of code. This is a classical trick for Java debugging of Camel Routes, not specific to Camel K.

The trick consists of adding a Processor between the steps you want to observe. It will be something like:

		  .process(new Processor(){
			  @Override
			  public void process(Exchange exchange) throws Exception {
				  System.out.println("can be breakpoint on this line");
			  }
		  })

Then, you can add a breakpoint to the line by clicking in the left ruler. A red dot will appear.

![Provide breakpoint inside a Processor](./2-putBreakpoint.gif)

#### Start integration

You can then start the integration:

- Ensure the editor is still opened on the Java Integration file
- Open command palette _View -> Command Palette..._
- Select _Start Apache Camel K Integration_
- Select _Basic_
- Check in the _Apache Camel K Integrations_ view that the example is deployed successfully. it will have a green dot. It can take few minutes for the first deployment.

![Start integration in basic mode](./3-startIntegration.gif)

Note: If starting in --dev, it will allow to automatically reload the Integration. But take care, debugger will need to be restarted on each change. Meaning that the next two steps will need to be repeated.

#### Start debugger on runtime

- Open terminal: _terminal -> New Terminal_
- Call _kamel debug demo_ (replace _demo_ by the integration name that appears in _Apache Camel K Integrations_ view if you choose a different name.

![Start debugger on runtime](4-startDebuggerOnRuntime.gif)

Note: Take care to use the kamel 1.3.0 binaries.

#### Attach debugger

- In the left panel, select the _Run & Debug_ container
- Click on _create a launch.json_
- Remove the default _configuration_
- Use completion to pick the _Java: Attach_
- Provide a meaningful name
- Update port, by default Camel K is using _5005_
- Click on the green triangle to _Start debugging_

![Attach debugger](5-AttachDebugger.gif)

#### Enjoy

Now, it is time to enjoy. You can notice that you have access to the message content. It is providing a good insight into what is going on in the Camel Route.

# What's next?

There is room for improvements, provide your feedback and ideas!

You can start discussions on [Zulip camel-tooling channel](https://camel.zulipchat.com/#narrow/stream/258729-camel-tooling).

You can create and vote for issues on GitHub [VS Code Tooling support for Apache Camel K](https://github.com/camel-tooling/vscode-camelk/issues) repository.

You can create and vote for issues on the [related epic in Jira](https://issues.redhat.com/browse/FUSETOOLS2-941) which is used by the Red Hat Integration tooling team.
