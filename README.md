# Apache Camel Website ![Logo][1]

This is a site generator project for Apache Camel. It generates static HTML and
resources that are to be published. 

Tools used to generate the website:
 - [Git](https://git-scm.com/) a source code management tool used to fetch document sources from different 
   github repositories.
 - [Node.js](https://nodejs.org/) a JavaScript runtime used to build the website. You will need to use Node.js version 10.
 - [yarn](https://yarnpkg.com/) a blazing fast dependency and package manager tool used to download 
   and manage required libraries.
 - [Gulp](http://gulpjs.com/) a task automation tool. Used to build the Camel
   Antora UI theme.
 - [Hugo](https://gohugo.io) a static site generator. Simplified, it takes the
   documentation from the `content` folder and applies templates from `layouts`
   folder and together with any resources in `static` folder generates output in
   the `public` folder.
 - [Antora](https://antora.org/) a documentation site generator. It uses
   Asciidoc documents from different sources in the [Camel](https://github.com/apache/camel) 
   and [Camel K](https://github.com/apache/camel-k) repositories where user manual and component 
   reference documentation resides and renders them for inclusion in this website.

## Building the website

You can build the website locally using the tools `Node.js` and `yarn`.

### Preparing the tools

#### Node

Make sure that you have Node.js (herein "`Node`") installed.

    $ node --version

If this command fails with an error, you do not have Node installed.

This project requires the Node LTS version 10 (e.g., v10.15.2). 

Please make sure to have a suitable version of Node installed. You have several options to install
Node on your machine.

- Install using the Node version manager [nvm](https://github.com/creationix/nvm)
- Install using [Homebrew](https://brew.sh/) and [Node formulae](https://formulae.brew.sh/formula/node)
- Install from official [Node packages](https://nodejs.org/en/download/)

Now that you have Node 10 installed, you can proceed with checking the Yarn installation.

#### Yarn

You will need Yarn installed, which is the preferred package manager for the Node ecosystem.

You should install Yarn globally using the following command:

 $ npm install -g yarn

`npm` is the Node package manager that comes with the default Node installation. So when you have Node installed you 
should also be able to use the `npm` command.

Now that you have the prerequisites installed, you can fetch and build the camel-website project.

#### Clone and Initialize the project

Clone the Apache Camel Website project using git:

    $ git clone https://github.com/apache/camel-website.git

The command above clones the Apache Camel Website project. After that you can switch to the new 
project folder on your filesystem.

## Build the Antora Camel UI theme

First step is to build the Antora ui theme used for the Apache Camel website. The theme sources are located 
in [antora-ui-camel](antora-ui-camel). 

In that folder execute:

    $ yarn install // needed only once, or if dependencies change
    $ yarn build // to perform the ui theme build
    
You should see the Antora theme bundle generated in in [antora-ui-camel/build/ui-bundle.zip](antora-ui-camel).    
    
The Camel Antora UI theme should not be a subject to change very frequently. So you might execute this once and 
never come back. 

## Build the website content   

Building the website requires the built Antora Camel UI theme bundle. Please check that 
the theme bundle exists in [antora-ui-camel/build/ui-bundle.zip](antora-ui-camel).

To build the website go to the project root folder and run:

    $ yarn install // needed only once, or if dependencies change
    $ yarn build // to perform the build

This should fetch doc sources for [Camel](https://github.com/apache/camel) and [Camel K](https://github.com/apache/camel-k) 
and generate the website with Hugo. You should see the generated website in the `public` folder.

## Contribute changes

The Apache Camel website is composed of different sources. So where to add and contribute changes in particular?

### Changes on the website

#### Menu

The site main menu is defined in the top level configuration [config.toml](config.toml). You can add/change 
menu items there.

#### Website content

The basic website content is located in [content](content). You can find several different folders representing different
areas of the website:

- [docs](content/docs): Getting started, user manual, component reference
- [download](content/download): Download Camel artifacts
- [news](content/news): News, blogs, posts
- [community](content/community): Support, contributing, articles, etc.
- [projects](content/projects): Subproject information (e.g. Camel K)


#### Layout and templates

Layout related changes go into [layout](layout) folder where you will find HTML templates that define the common layout
of the different page categories including footer and header templates.

### Changes in Antora UI theme

The Antora UI theme basically defines the look and feel of the website. You can find the theme sources within this 
repository in [antora-ui-camel](antora-ui-camel).

You need to rebuild the Antora UI theme in order to see your changes reflected locally.

### Changes for Camel and Camel K docs

The Apache Camel website includes documentation sources from other github repositories. Content sources are defined in
[site.yml](site.yml).

At the moment these sources are documentation sources form [Camel](https://github.com/apache/camel) 
and [Camel K](https://github.com/apache/camel-k). These are basically the component reference docs and the Camel user 
manual. In case you want to change something here please go to the respective github repository and contribute your 
change there.

- [Camel components](https://github.com/apache/camel/tree/master/docs/components)
- [Camel user manual](https://github.com/apache/camel/tree/master/docs/user-manual)
- [Camel K docs](https://github.com/apache/camel-k/tree/antora/docs)

Your changes in these repositories will automatically get visible on the website after a site rebuild.

[1]: antora-ui-camel/src/img/logo32-d.png "Apache Camel"
