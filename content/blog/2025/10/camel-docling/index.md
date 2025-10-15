---
title: "Building Intelligent Document Processing with Apache Camel: Docling meets LangChain4j"
date: 2025-10-15
draft: false
authors: [ oscerd ]
categories: ["Camel", "AI"]
preview: "The new camel-docling component meets camel-langchain4j"
---

In the rapidly evolving landscape of AI-powered applications, the ability to process and understand documents has become increasingly crucial. Whether you're dealing with PDFs, Word documents, or PowerPoint presentations, extracting meaningful insights from unstructured data is a challenge many developers face daily.

In this post, we'll explore how Apache Camel's new AI components enable developers to build sophisticated RAG (Retrieval Augmented Generation) pipelines with minimal code. We'll combine the power of Docling for document conversion with LangChain4j for AI orchestration, all orchestrated through Camel's YAML DSL.

## The Challenge: Document Intelligence at Scale

Companies are drowning in documents. Legal firms process contracts, healthcare providers manage medical records, and financial institutions analyze reports. The traditional approach of manual document review simply doesn't scale.

So this a possible space where we could apply RAG and Apache Camel. The steps:

* Convert documents from any format to structured text
* Extract key insights and summaries
* Answer questions about document content
* Process documents in real-time as they arrive

This is where the combination of Docling and LangChain4j shines, and Apache Camel provides the perfect integration layer to bring them together.

## Meet the Components

### Camel-Docling: Enterprise Document Conversion

The `camel-docling` component integrates IBM's Docling library, an AI-powered document parser that can handle various formats including PDF, Word, PowerPoint, and more. What makes Docling special is its ability to preserve document structure while converting to clean Markdown, HTML, or JSON.

Key features:

* **Multiple Operations**: Convert to Markdown, HTML, JSON, or extract structured data
* **Flexible Deployment**: Works with both CLI and API (docling-serve) modes
* **Content Control**: Return content directly in the message body or as file paths
* **OCR Support**: Handle scanned documents with optical character recognition

### Camel-LangChain4j: AI Orchestration Made Simple

The `camel-langchain4j-chat` component provides seamless integration with Large Language Models through the LangChain4j framework. It supports various LLM providers including OpenAI, Ollama, and more.

Perfect for:

* Document analysis and summarization
* Question-answering systems
* Content generation
* RAG implementations

## Building a RAG Pipeline with YAML

Let's walk through a complete example that demonstrates the power of combining these components. Our goal is to create a system that automatically processes documents, analyzes them with AI, and generates comprehensive reports: a classic example.

### Architecture Overview

The flow is straightforward:

1. Watch a directory for new documents
2. Convert documents to Markdown using Docling
3. Send the converted content to an LLM for analysis
4. Generate a comprehensive analysis report
5. Clean up processed files

All of this is defined declaratively in YAML, making it easy to understand and modify.

### Setting Up the Infrastructure

First, we need our services running. Thanks to camel infra command, this is pretty simple:

```shell
# Start Docling (if camel infra supports it)
$ jbang -Dcamel.jbang.version=4.16.0-SNAPSHOT camel@apache/camel infra run docling

# Start Ollama (if camel infra supports it)
$ jbang -Dcamel.jbang.version=4.16.0-SNAPSHOT camel@apache/camel infra run ollama
```

Or we could use docker

```shell
# Start Docling-Serve
$ docker run -d -p 5001:5001 --name docling-serve ghcr.io/docling-project/docling-serve:latest

# Start Ollama
$ docker run -d -p 11434:11434 --name ollama ollama/ollama:latest

# Pull orca-mini model
$ docker exec -it ollama ollama pull orca-mini
```

We could also use docker-compose:

```bash
$ docker compose up -d
$ docker exec -it ollama ollama pull orca-mini
```

### Configuring the Chat Model

We use a Groovy script bean to configure our LangChain4j chat model:

```yaml
- beans:
- name: chatModel
type: "#class:dev.langchain4j.model.ollama.OllamaChatModel"
scriptLanguage: groovy
script: |
import dev.langchain4j.model.ollama.OllamaChatModel
import static java.time.Duration.ofSeconds

return OllamaChatModel.builder()
.baseUrl("{{ollama.base.url}}")
.modelName("{{ollama.model.name}}")
.temperature(0.3)
.timeout(ofSeconds(120))
.build()
```

Notice how we use property placeholders (`{{ollama.base.url}}`) which Camel automatically resolves. This makes the configuration flexible and environment-agnostic.

### The Main RAG Route

Here's where the magic happens. The route watches for documents, processes them through Docling, and analyzes them with our LLM:

```yaml
- route:
id: document-analysis-workflow
from:
uri: file:{{documents.directory}}
parameters:
include: ".*\\.(pdf|docx|pptx|html|md)"
noop: true
idempotent: true
steps:
- log: "Processing document: ${header.CamelFileName}"

- setBody:
simple: "${body.file.absolutePath}"

- to:
uri: docling:CONVERT_TO_MARKDOWN
parameters:
useDoclingServe: true
doclingServeUrl: "{{docling.serve.url}}"
contentInBody: true

- setBody:
simple: |
You are a helpful document analysis assistant. Please analyze
the following document and provide:
1. A brief summary (2-3 sentences)
2. Key topics and main points
3. Any important findings or conclusions

Document content:
${exchangeProperty.convertedMarkdown}

- to:
uri: langchain4j-chat:analysis
parameters:
chatModel: "#chatModel"
```

### Interactive Q&A API

We also provide an HTTP endpoint for asking questions about documents:

```yaml
- route:
id: document-qa-api
from:
uri: platform-http:/api/ask
steps:
# Find latest document
# Convert with Docling
# Prepare RAG prompt with user question
# Get answer from LLM
```

This enables interactive workflows:

```bash
$ curl -X POST http://localhost:8080/api/ask \
-d "What are the main topics in this document?"
```

## Future Enhancements

Possible developments could be:

- **Vector Storage Integration**: Combine with camel-langchain4j-embeddings to store document chunks in vector databases for more sophisticated retrieval.
- **Multi-Model Workflows**: Use different models for different tasks - fast models for classification, powerful models for analysis.
- **Streaming Responses**: For long documents, stream LLM responses back to the client as they're generated.
- **Custom Tools**: Integrate camel-langchain4j-tools to give the LLM access to external data sources.

## Try It Yourself

The complete example is available in the Apache Camel repository under `camel-jbang-examples/docling-langchain4j-rag`. To run it:

```bash
$ jbang -Dcamel.jbang.version=4.16.0-SNAPSHOT camel@apache/camel run \
--fresh \
--dep=camel:docling \
--dep=camel:langchain4j-chat \
--dep=camel:platform-http \
--dep=dev.langchain4j:langchain4j:1.6.0 \
--dep=dev.langchain4j:langchain4j-ollama:1.6.0 \
--properties=application.properties \
docling-langchain4j-rag.yaml
```

Don't forget to copy the sample.md into the documents directory!

Watch the logs as your document is processed, analyzed, and cleaned up automatically!

## Conclusion

The combination of Apache Camel's integration capabilities, Docling's document conversion power, and LangChain4j's AI orchestration creates a compelling platform for building intelligent document processing systems.

What makes this especially powerful is the declarative nature of the solution. The entire workflow is defined in ~350 lines of readable YAML, making it easy to understand, modify, and extend.

We'd love to hear about what you build with these components. Share your experiences on the Apache Camel mailing list or join us on Zulip chat!

Stay tuned for more examples combining Camel's growing AI component ecosystem. The future of integration is intelligent, and we're just getting started.

Happy integrating!
