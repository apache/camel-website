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
 - [Maven](https://maven.apache.org/) (optional) a build tool used to run the complete website generating process

## Build with Node and yarn

You can build the website locally using the tools `Node.js` and `yarn`. 

If you can not use these tools on your local machine for some reason you can also build the website using Maven as 
described in section ["Build with Maven"](#build-with-maven).

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

## Preview website locally

You can preview the Apache Camel website on your local machine once you have the generated website available in 
the `public` folder.

Hugo can start a simple web server serving the generated site content so you can view it in your favorite browser. 

Simply call

    $ yarn preview
    
and you will be provided with a web server running the site on [http://localhost:1313/](http://localhost:1313/) 

Point your favorite browser to `http://localhost:1313/` and you will see the Apache Camel website.

## Build with Maven

The project provides a simple way to build the website sources locally using the build tool [Maven](https://maven.apache.org/).

The Maven build automatically downloads the tool binaries such as `node` and `yarn` for you. You do not need to install 
those tools on your host then. The binaries are added to the local project sources only and generate the website content.

As the Maven build uses pinned versions of `node` and `yarn` that are tested to build the website you most likely avoid 
build errors due to incompatible versions of `Node.js` tooling installed on your machine.

### Preparing Maven

Make sure that you have Maven installed.

    $ mvn --version

If this command fails with an error, you do not have Maven installed.

Please install Maven using your favorite package manager (like [Homebrew](https://brew.sh/)) or from 
official [Maven binaries](https://maven.apache.org/install.html)
    
### Building from scratch    
    
When building everything from scratch the build executes following steps:

- Download `yarn` and `Node.js` binaries to the local project
- Load required libraries to the local project using `yarn`
- Build the Antora Camel UI theme ([antora-ui-camel](antora-ui-camel))
- Fetch the doc sources from [Camel](https://github.com/apache/camel) 
  and [Camel K](https://github.com/apache/camel-k) github reporsitories
- Build the website content using Hugo

You can do all of this with one single command:

    $ mvn package

The whole process takes up to five minutes (time to grab some coffee!)

When the build is finished you should see the generated website in the `public` folder.

### Rebuild website

When rebuilding the website you can optimize the build process as some of the steps are only required for a fresh
build from scratch. You can skip the ui theme rendering (unless you have changes in the theme itself).

    $ mvn package -Dskip.theme

This should save you some minutes in the build process. You can find the updated website content in the `public` folder.

### Clean build

When rebuilding the website the process uses some cached content (e.g. the fetched doc sources for 
[Camel](https://github.com/apache/camel) and [Camel K](https://github.com/apache/camel-k) or the Antora ui theme). 
If you want to start from scratch for some reason you can simply add the `clean` operation to the build which removes 
all generated sources in the project first.

    $ mvn clean package
    
Of course this then takes some more time than an optimized rebuild (time to grab another coffee!).

## Contribute changes

The Apache Camel website is composed of different sources. So where to add and contribute changes in particular?

### Changes on the website

#### Menu

The site main menu is defined in the top level configuration [config.toml](config.toml). You can add/change 
menu items there.

#### Content

The basic website content is located in [content](content). You can find several different folders representing different
areas of the website:

- [docs](content/docs): Getting started, user manual, component reference
- [download](content/download): Download Camel artifacts
- [news](content/news): News, blogs, posts
- [community](content/community): Support, contributing, articles, etc.
- [projects](content/projects): Subproject information (e.g. Camel K)
- [security](content/security): Security information and advisories

#### Adding new security advisory content

Use the `security-advisory` archetype to create a new markdown content file in `content/security`:

    $ yarn run hugo new --kind security-advisory security/CVE-YYYY-NNNNN # replace YYYY-NNNNN with the CVE number

This will create a `content/security/CVE-YYYY-NNNNN.md` file which you need to edit to and fill in the required parameters.
The content of the created markdown file is added to the _Notes_ section.

Place the signed PGP advisory in plain text as `content/security/CVE-YYYY-NNNNN.txt.asc`.

Make sure that you set the `draft: false` property to have the page published.

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

