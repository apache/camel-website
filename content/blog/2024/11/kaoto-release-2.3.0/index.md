---
title: "Kaoto v2.3 release"
date: 2024-11-25
draft: false
authors: [igarashitm, lordrip]
categories: ["Releases", "Tooling", "Kaoto"]
preview: "Kaoto 2.3 has been released"
---

![Kaoto](cover.png)
<!-- Some image with a Camel performing some alchemy -->

Following the Apache Camel 4.8.1 release, we're happy to annonce the release of Kaoto 2.3.

## What’s New in Kaoto 2.3?

We're thrilled to announce the release of Kaoto 2.3, bringing new features, improvements, and bug fixes to enhance your integration experience.
This release also brings the first technical preview of a long awaited feature: the Kaoto DataMapper with the ability to perform data transformations using Camel.

### Here are the key highlights of this release:

### [Breaking] deprecated URI field serialization in favor of the YAML parameters field approach
The URI field has been deprecated in favor of the YAML parameters field approach. This change allows for a more flexible and user-friendly experience when configuring components.

### Improved look and feel
The canvas look and feel has been redesigned to provide a more modern and clean look. The new design is cleaner, with less borders and wider, making it more intuitive and user-friendly.

### Contextual toolbar on hovering Nodes
A contextual toolbar is now displayed when hovering over nodes, providing quick access to the most common actions for the selected node. It can be configured to also be shown on selecting the node.

### Less movement for the Canvas
The autofit functionality when selecting nodes has been removed, instead, the Canvas will move only when necessary to make the node visible, providing a more stable and predictable experience.

### Parameters Field
The Parameters Field styling has been improved to provide more room for editing and better visibility of the parameters, being open by default for a more intuitive experience.

### Sorting Languages and DataFormats properties
The properties for languages and data formats are now sorted following the official Camel catalog for easier navigation and discovery.

### Navigate to related locations
The web version of Kaoto now have convenient links to [the Kaoto examples repository](https://github.com/KaotoIO/kaoto-examples), [the Apache Camel website](https://camel.apache.org/camel-core/getting-started/index.html) and [the Hawtio project](https://hawt.io/docs/get-started.html).

### Group EIPs parameters consistently also from older Apache Camel versions
The parameters for EIPs are now grouped consistently across multiple Apache Camel versions, providing a more uniform experience when working with different versions of Camel.

### Show the appropriate Consumer / Producer properties
The Consumer and Producer properties are now displayed appropriately in the Config panel, ensuring the right properties are shown for the selected component.

### Kamelets sorting
Kamelets are now sorted alphabetically for easier discovery and navigation.

### Support for the new tokenizer EIP
[The new Tokenizer EIP](https://camel.apache.org/components/4.8.x/others/langchain4j-tokenizer.html) is now supported in the Canvas, allowing you to tokenize (chunk) larger blocks of texts into text segments that can be used when interacting with LLMs.

### Catalog ranked search
The catalog now supports ranked search, providing more relevant results when searching for components.
kudos to [@ibek](https://github.com/ibek/) for the contribution.

### Close the configuration panel clicking outside
The configuration panel can now be closed by clicking outside of it, providing a more intuitive experience when configuring components.
Once again, many kudos to [@ibek](https://github.com/ibek/) for the contribution.

### Enable all functionality
There's now an "Enable All" functionality to reenable multiple disabled EIPs at once.
Three in a row for [@ibek](https://github.com/ibek/) 💪.

### Nodes titles are collapsed by default
The nodes titles are now collapsed by default, providing a cleaner and more focused view of the Canvas, while still allowing you to see them when hovering over the nodes.

### Show endpoint URI for the `direct` component
The endpoint URI for the `direct` component is now displayed in the Config panel, making it easier to understand the configuration of the component.
