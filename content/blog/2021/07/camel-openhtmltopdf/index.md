---
title: "camel-openhtmltopdf: A new component to generate PDF documents"
date: 2021-07-21
draft: false
authors: [jeremyross]
categories: ["Usecases"]
preview: "Create beautiful PDFs from HTML and CSS with the new Camel component, camel-openhtmltopdf"
---

We are pleased to announce that [Elevation Solutions](https://elevation.solutions) has released a new component, [camel-openhtmltopdf](https://github.com/elevation-solutions/camel-openhtmltopdf). With this component, your integrations can easily produce beautiful, pixel-perfect PDF documents from HTML, CSS and images. This component leverages the popular [openhtmltopdf](https://github.com/danfickle/openhtmltopdf), which in turn builds on Apache PDFBox.

Input HTML can be provided as a `String`, `InputStream`, or URI. For URIs, `file`, `http`, and `https` are supported. And there's no need to worry if your markup is not compliant XHTML. The `leniantParsing` option (enabled by default) can deal with all sorts of tag soup. 

For more information, and to get started, visited the project's GitHub at https://github.com/elevation-solutions/camel-openhtmltopdf.
