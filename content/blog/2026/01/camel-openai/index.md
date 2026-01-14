---
title: "Simple LLM Integration with Camel OpenAI Component"
date: 2026-01-14
draft: false
authors: [ ibek ]
categories: [ "Camel", "AI" ]
preview: "A deep dive into the new camel-openai component for chat completion with OpenAI and OpenAI-compatible APIs"
---

The integration of Large Language Models (LLMs) into enterprise applications has become increasingly important. Whether
you're building intelligent document processing pipelines, automated customer support systems, or data privacy
solutions, the ability to seamlessly connect your integration flows with AI capabilities is essential.

Apache Camel 4.17 introduces the new `camel-openai` component, providing native integration with OpenAI and
OpenAI-compatible APIs for chat completion. In this post, we'll explore the component's features and demonstrate a
practical use case: Personal Identifiable Information (PII) redaction using structured output.

## Component Overview

The `camel-openai` component leverages the official [openai-java SDK](https://github.com/openai/openai-java) to provide
robust integration with OpenAI's chat completion API. It offers a lightweight alternative to LangChain4j and Spring AI
for straightforward use cases, eliminating the need to instantiate `ChatModel` objects. Here are the key features:

- **Chat Completion**: Send prompts and receive AI-generated responses
- **Structured Output**: Get responses in a specific format using `outputClass` or `jsonSchema`
- **Streaming Responses**: Process responses chunk by chunk for real-time applications
- **Conversation Memory**: Maintain context across multiple exchanges within a route
- **Multi-Modal Input**: Support for text files and images with vision-capable models
- **OpenAI-Compatible APIs**: Works with OpenAI, Google Vertex AI, Mistral, Groq, vLLM, NVIDIA NIM, Ollama, Llama.cpp
  server, and other providers

**Note**: This component is not designed for autonomous agentic workflows. It explicitly excludes function calling (
tools). For complex agent architectures, we recommend using LangChain4j or Spring AI.

## Getting Started

Add the component dependency to your project:

```xml
<dependency>
    <groupId>org.apache.camel</groupId>
    <artifactId>camel-openai</artifactId>
    <version>4.17.0</version>
</dependency>
```

### Basic Chat Completion

The simplest usage sends a prompt and receives a response:

```java
from("direct:chat")
    .setBody(constant("What is Apache Camel?"))
    .to("openai:chat-completion")
    .log("Response: ${body}");
```

Or using YAML DSL:

```yaml
- route:
    from:
      uri: direct:chat
      steps:
        - to:
            uri: openai:chat-completion
            parameters:
              userMessage: What is Apache Camel?
        - log: "Response: ${body}"
```

### Authentication

The component requires setting the API key using, `apiKey` parameter, or `OPENAI_API_KEY` environment variable.

## PII Redaction Example: Structured Output in Action

Let's explore a practical example that demonstrates the power of structured output with JSON schemas. This example uses
an LLM to identify and redact Personal Identifiable Information from text, returning results in a structured JSON
format.

### The Route Definition

```yaml
- route:
    from:
      uri: "direct:pii-redaction"
      steps:
        - to:
            uri: "openai:chat-completion"
            parameters:
              temperature: 0.15
              jsonSchema: "resource:classpath:pii.schema.json"
              systemMessage: "You are a strict data privacy compliance assistant. Your goal is to analyze the user input, redact all PII, and return the results in the specified JSON format. RULES: 1. ONLY redact specific identifiers, 2. DO NOT redact generic titles, roles, or common nouns unless they are part of a proper noun. 3. Preserve the grammatical structure of the sentence."
- route:
    from:
      uri: stream
      parameters:
        kind: in
      steps:
        - to:
            uri: direct
            parameters:
              name: pii-redaction
        - to: "stream:out"
```

NOTE: We should set the temperature because in 4.17.0 release, temperature default is being set to 1.0 (this will be
removed to respect inference server's configuration in the next release)

The route uses:
- **Low Temperature (0.15)**: For consistent, deterministic responses
- **JSON Schema**: Enforces the structure of the output
- **System Message**: Instructs the model on its role and behavior

### The JSON Schema

The `pii.schema.json` defines the expected output structure:

```json
{
  "type": "object",
  "properties": {
    "detectedPII": {
      "type": "array",
      "description": "A list of all PII entities detected and redacted.",
      "items": {
        "type": "object",
        "properties": {
          "span": {
            "type": "string",
            "description": "The original text value that was detected."
          },
          "type": {
            "type": "string",
            "enum": [
              "PERSON",
              "EMAIL",
              "PHONE",
              "CREDIT_CARD",
              "NATIONAL_ID",
              "ADDRESS",
              "OTHER"
            ],
            "description": "The category of the detected PII"
          },
          "action": {
            "type": "string",
            "enum": [
              "MASKED",
              "REDACTED"
            ],
            "description": "The action taken on the data"
          }
        },
        "required": [
          "span",
          "type",
          "action"
        ],
        "additionalProperties": false
      }
    },
    "sanitizedText": {
      "type": "string",
      "description": "The input text with all PII replaced by placeholders"
    }
  },
  "required": [
    "detectedPII",
    "sanitizedText"
  ],
  "additionalProperties": false
}
```

### Configuration

Configure the component in `application.properties`:

```properties
camel.jbang.dependencies=camel-openai
camel.component.openai.apiKey={{env:OPENAI_API_KEY}}
camel.component.openai.baseUrl={{env:OPENAI_BASE_URL}}
camel.component.openai.model={{env:OPENAI_MODEL}}
camel.main.durationMaxMessages=1
```

### Running the Example

Set up your environment variables:

```shell
export OPENAI_API_KEY=<your-openai-api-key>
export OPENAI_BASE_URL=http://localhost:8181/v1
export OPENAI_MODEL=unsloth/Ministral-3-8B-Instruct-2512-GGUF
```

Run with Camel JBang:

```shell
echo 'Customer John Doe (email: john.doe@example.com) requested a refund for order #998877.' | camel run *
```

### Expected Output

```json
{
  "detectedPII": [
    {
      "span": "John Doe",
      "type": "PERSON",
      "action": "REDACTED"
    },
    {
      "span": "john.doe@example.com",
      "type": "EMAIL",
      "action": "REDACTED"
    }
  ],
  "sanitizedText": "Customer [REDACTED] (email: [REDACTED]) requested a refund for order #998877."
}
```

## Conclusion

The `camel-openai` component in Apache Camel 4.17 provides a powerful and flexible way to integrate LLM capabilities
into your integration flows. With support for structured output, streaming, conversation memory, and compatibility with
various OpenAI-compatible providers, you can build sophisticated AI-powered integrations with minimal code.

The PII redaction example demonstrates how structured output with JSON schemas enables reliable, parseable responses
from LLMs - a critical capability for enterprise applications where consistent data formats are required.

For more information, check out:

- [Apache Camel OpenAI Component Documentation](/components/next/openai-component.html)
- [Camel OpenAI examples](https://github.com/apache/camel-jbang-examples/openai)
- [Apache Camel 4.17 Release Notes](/releases/release-4.17.0/)
- [Apache Camel 4.17 What's New](/blog/2026/01/camel417-whatsnew/)

We'd love to hear about what you build with the OpenAI component. Share your experiences on the Apache Camel mailing
list or join us on Zulip chat!

Happy integrating!
