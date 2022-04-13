---
title: "VS Code AtlasMap integrated in Camel-Designer"
date: 2022-04-13
authors: [brunoNetId]
categories: ["Tooling"]
preview: "VS Code AtlasMap integrated in Camel-Designer"
---

The latest release of the [VS Code Camel Designer](https://marketplace.visualstudio.com/items?itemName=brunoNetId.camel-designer) extension integrates [VS Code AtlasMap](https://marketplace.visualstudio.com/items?itemName=redhat.atlasmap-viewer): two visual tools to accelerate productivity in Camel.


# Two visual tools for Camel integrated in VS Code

[*AtlasMap*](https://www.atlasmap.io/) is a great visual data mapping tool that enables users to define data transformations that *Camel* can process at runtime.

The [0.1.0 release of the *VSCode* extension for *AtlasMap*](https://camel.apache.org/blog/2021/11/vscode-atlasmap-release-0.1.0/) introduced a series of improvements that allowed a better user experience when creating and editing *AtlasMap* definitions.

Provided that *AtlasMap* is a visual design-time tool that Camel can execute, it makes sense to integrate *AtlasMap* with other visual tooling for *Camel*. And that’s what the latest release of *Camel Designer* does, enable the user to model *Camel* routes, and include *AtlasMap* as a step in the processing flow.

[*Camel Designer*](https://brunonetid.github.io/2020/06/28/camel-designer.html) is a visual tool to intuitively compose integration processes using the Camel language. It tries to explore how to maximise user productivity and make the user feel comfortable, lowering the effort to define Camel routes.

Let’s explore how *AtlasMap* is integrated within *Camel Designer*.

<br>

# Using the AtlasMap activity in Camel Designer

Camel routes are composed of multiple processing steps. You first define the data source with a ```from``` DSL definition, and then you include actions. *AtlasMap* can be included as one of the processing actions in the Camel route. Using *Camel Designer* you just need to select from the menu the following option:

- ```eip… > transform > AtlasMap```

<br>

>**_TIP:_**
>
>Read Camel Designer’s [how-to](https://github.com/designer-for-camel/camel-designer/blob/master/docs/how-to.md) documentation to get familiar with common UI tasks.

<br>

From the visual editor, the above selection would render the following flow:

![Camel route rendering in Camel Designer showing the AtlasMap activity](./route-atlasmap.png)

In the illustration above, an *AtlasMap* activity follows the starting element (```direct```). The yellow ring indicates the activity under configuration (AtlasMap).

The default ADM file (*AtlasMap* data mapping definition) configured is ```demo.adm``` which does not exist. If you try to edit the file, you would get the following error displayed:


![Error message shown when ADM file not found in workspace.](./adm-not-found.png)


To create a new ADM file, click the ```New…``` button. This action will launch VSCode’s AtlasMap extension and prompt you to select the working folder where the ADM file will be located and its file name.

From AtlasMap’s UI you create your data mapping definition and will be stored in the ADM file when saved. *Camel Designer* defines your new *AtlasMap* activity pointing to the newly created ADM file.

If your current workspace already contains ADM files, *Camel Designer* will find them and include them in its configuration dropdown list. To open and edit any of the existing ADM files, hover your mouse cursor over the dropdown list and select the ADM file you’d like to configure, then click the ```Edit``` button. The following animated GIF illustrates the actions to follow:

<br>

![Error message shown when ADM file not found in workspace.](./edit-adm.gif)


<br>

You will observe how Camel Designer generates all your source code in real time on the left of your screen using Camel's DSL language.

<br>


# Learn more about *Camel Designer* and *AtlasMap*

- Read this [*Camel Designer* blog](https://brunonetid.github.io/2020/06/28/camel-designer.html) to understand how visualisation increases productivity

- A good place to get started with *Camel Designer* is its [how-to guide in GitHub](https://github.com/designer-for-camel/camel-designer/blob/master/docs/how-to.md).

- Explore [*AtlasMap*'s website](https://www.atlasmap.io/) to discover all its features.

- Read [this blog](https://camel.apache.org/blog/2021/11/vscode-atlasmap-release-0.1.0/) presenting the latest *VS Code AtlasMap* release

- Find [*Camel Designer*](https://marketplace.visualstudio.com/items?itemName=brunoNetId.camel-designer) in *VS Code*'s marketplace

- Find [*AtlasMap*](https://marketplace.visualstudio.com/items?itemName=redhat.atlasmap-viewer) in *VS Code*'s marketplace




