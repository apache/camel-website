# Apache Camel Website

This is a site generator project for Apache Camel. It generates static HTML and
resources that are to be published. Tools used to generate the website:
 - [Gulp](http://gulpjs.com/) a task automation tool. Used to build the Camel
   Antora UI theme.
 - [Hugo](https://gohugo.io) a static site generator. Simplified, it takes the
   documentation from the `content` folder and applies templates from `layouts`
   folder and together with any resources in `static` folder generates output in
   the `public` folder.
 - [Antora](https://antora.org/) a documentation site generator. It uses
   Asciidoc documents in the [Camel repostory](https://github.com/apache/camel)
   where User manual and Component reference documentation resides and renders
   them for inclusion in the website.

## Building the website

To build the website run:

    $ yarn install // needed only once, or if dependencies change
    $ yarn build // to perform the build

This should generate the website in the `public` folder.

__TEST__
