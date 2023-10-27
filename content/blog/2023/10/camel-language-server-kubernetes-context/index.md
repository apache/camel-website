---
title: "VSCode Language Support Autocompletion from Kubernetes Context"
date: 2023-10-27
authors: ["delawen"]
categories: ["Tooling"]
preview: "VSCode Language Support Autocompletion from Kubernetes Context"
summary: "The Camel Language Server is now able to autocomplete configmaps and secrets coming from a Kubernetes connection."
---

Coming in the next VS Code Language support for Apache Camel, we are introducing a better context based autocompletion. We already had namespaces being auto completed when a related property was filled and there was a kubernetes connection configured. 

Now the auto completion loads kubernetes context placeholders too as suggestions. On this case, it doesn't discriminate by name of the property or which camel connector we are configuring; it detects when a `{{secret:` or`{{configmap:` is being written as value in camel uri properties.

<video loop="true" autoplay="true" src="https://user-images.githubusercontent.com/726590/273884659-c03020ae-bd5b-4328-a57c-d8aa7750e79f.webm" controls="controls" muted="muted" ></video>

The auto completion also works with more complex strings that can contain more than one kubernetes placeholder at the same time.

<video loop="true" autoplay="true" src="https://user-images.githubusercontent.com/726590/274902534-60b33a05-ee2d-4701-8fab-9d2e35ac7a2e.webm" controls="controls" muted="muted"> </video>