---
title: "Apache Camel Meets MCP: Securely Exposing Your Enterprise Routes as MCP Tools with Wanaku"
date: 2025-10-22
draft: false
authors: [ orpiske ]
categories: ["Camel", "AI"]
preview: "Apache Camel Meets MCP: Securely Exposing Your Enterprise Routes as MCP Tools with Wanaku"
---

The biggest challenge for enterprises in the rapidly evolving world of Generative AI isn't just building "smarter" LLMs or agents — it's securely connecting that AI to the decades of business logic and data locked away in enterprise systems. How do you let an AI agent interact with your Salesforce data, your Kafka topics, or your internal databases without rewriting everything or creating a massive security hole?

It turns out the answer may already be running in your organization.

If you're using Apache Camel, you already have the most powerful, flexible, and comprehensive integration toolset on the planet. With its 300+ components, you've already built the bridges to your most critical systems.

Today, I am excited to show you how to connect those battle-tested Camel routes directly to AI agents using [Wanaku](https://wanaku.ai) and the [Model Context Protocol (MCP)](https://modelcontextprotocol.io/docs/getting-started/intro).

## What is Wanaku?

Before we dive in, let's briefly introduce the new player. [Wanaku](https://wanaku.ai) is an open source integration service designed to securely connect AI agents with enterprise systems.
At its core, it's an MCP Router—a central, secure gateway that manages and governs how AI agents access specific "Tools" (functions) and "Resources" (data).

It acts as a proxy, filtering and securing the capabilities you want to expose to your LLMs. And thanks to its new [Camel Integration Capability](https://wanaku.ai/docs/camel-integration-capability/), Apache Camel is now a first-class citizen in this new AI-driven world.

## The Magic: From Camel Route to AI Tool

The new capability allows you to take a standard Apache Camel route and, with a simple mapping file, expose it as a native MCP Tool that any compliant AI agent can use.

Let's walk through an example: promoting an employee.

### Step 1: Your Existing Apache Camel Route

First, imagine you have a standard Camel route definition written in YAML. This one defines a few internal endpoints for handling employee promotions.

```yaml
- route:
    id: route-3103
    from:
      id: from-4035
      uri: direct
      parameters:
        name: initiate-promotion
      steps:
        - log:
            id: log-2526
            message: Initiating promotion process for employee ${header.EMPLOYEE}
        - setBody:
            simple:
              expression: Promotion process for employee ${header.EMPLOYEE} has started.
- route:
    id: route-3104
    from:
      id: from-4035-1797
      uri: direct
      parameters:
        name: confirm-promotion
    # ... steps to confirm ...
- route:
    id: route-3105
    from:
      id: from-9762
      uri: file
      parameters:
        directoryName: /.../promote-employee
        fileName: employee-history.txt
    # ... steps to load file ...
```

This is pure, standard Apache Camel. We have two `direct` endpoints for initiating and confirming a promotion and a `file` endpoint for retrieving a resource. Notice that the first route expects a header named `EMPLOYEE`.

### Step 2: The Wanaku "Rules" Mapping 

Now, here's the bridge. We create a separate Wanaku rules file. This file declares our MCP Tools and maps them directly to our Camel routes.

```yaml
mcp:
  tools:
    - initiate-employee-promotion:
        route:
          id: "route-3103"
        description: "Initiate the promotion process for an employee"
        properties:
          - name: employee
            type: string
            description: The employee to confirm the promotion
            required: true
            mapping:
              type: header
              name: EMPLOYEE
    - confirm-employee-promotion:
        route:
          id: "route-3104"
        # ... other properties ...
  resources:
    - employee-performance-history:
        route:
          id: "route-3105"
        description: "Obtain the employee performance history"
```

Look at what's happening here. We're defining an MCP Tool named `initiate-employee-promotion`.

1. We give it a human-readable `description` for the AI.
2. We link it directly to our Camel `route-3103`.
3. We define an input property `employee` for the AI.
4. Crucially, we use the `mapping` block to tell Wanaku: "Take the AI's `employee` argument and inject it as a Camel header named `EMPLOYEE`".

We do the same for the `employee-performance-history`, mapping it as an MCP Resource to our `file`-based route (`route-3105`).

### Step 3: The Result

When Wanaku loads these two files, the following happens automagically:

1. An AI agent connects to Wanaku sees a new tool available: `initiate-employee-promotion`, which takes one argument: `employee`.
2. The agent decides to use it: "Please initiate the promotion for 'Jane Doe'."
3. Wanaku receives this request, validates it, and triggers your `route-3103` in Apache Camel.
4. It injects "Jane Doe" into the `EMPLOYEE` message header.
5. Your Camel route runs exactly as it always has, logging the message and returning a confirmation.
6. Wanaku passes this response back to the AI.

Your enterprise-grade Camel route is now an AI tool, and you didn't have to write a single line of new integration code.

## From 300+ Components to 300+ AI Tools

This example is simple, but now think bigger. That `uri` in your Camel route doesn't have to be `direct` or `file`. It can be:

* `kafka:my-topic`
* `salesforce:getSObject`
* `sql:select * from ...`
* `jms:queue:my-queue`
* `aws2-s3:my-bucket`

Anything you can do in Apache Camel, you can now securely expose to an AI agent. This opens up a new frontier for integration. You can even visually design your routes in a tool like Kaoto or Camel Karavan, export the YAML, add the Wanaku rules file, and instantly 
create a new AI-powered tool.

### Secure by Default

The best part? This isn't the Wild West. Wanaku is built for the enterprise. It provides a full MCP Authentication flow, including support for OIDC. This means you can use your existing identity provider (like Keycloak) to define exactly which agents, users, or applications are allowed to access which tools.

You have fine-grained control, ensuring that only an "HR-Admin" agent can run the initiate-employee-promotion tool, while a "Public-Chatbot" agent cannot.

### Conclusion

Generative AI is a powerful new interface, but its true value is unlocked when it can interact with the systems that run your business. With Apache Camel and Wanaku, you don't have to rebuild your integrations for the AI era. You can leverage the powerful, reliable, and secure routes you've already perfected.

This is the ultimate bridge between established enterprise integration and the future of AI.

Ready to give your Camel routes AI superpowers? Check out the Wanaku documentation to get started: https://wanaku.ai/docs/
