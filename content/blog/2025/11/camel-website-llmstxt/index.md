---
title: "Making Apache Camel Documentation Accessible to LLMs"
date: 2025-11-12
draft: false
authors: [ croway ]
categories: [ "Tooling" ]
preview: "How we implemented llms.txt to make Apache Camel documentation easily accessible to AI coding agents and LLM training"
---

The Apache Camel website now generates markdown versions of all documentation pages following the [llms.txt specification](https://llmstxt.org/). This makes our documentation easily accessible to Large Language Models (LLMs) and AI coding assistants.

## What is llms.txt?

The llms.txt specification is a standardized format that helps LLMs discover and consume website content efficiently. Similar to how `robots.txt` guides web crawlers and `sitemap.xml` helps search engines, `llms.txt` provides a structured entry point for AI systems to understand and access documentation.

The Apache Camel website now exposes [/llms.txt](/llms.txt) which provides:

- An overview of Apache Camel and its documentation structure
- Instructions for accessing markdown versions of pages
- Information about key documentation sections (components, languages, patterns, user guides)
- A count of available markdown pages (5,355+ pages)
- Direct links to important documentation areas

This standardized file makes it easy for LLM training pipelines and AI coding assistants to discover and consume Apache Camel documentation efficiently.

## Why This Matters

Making Apache Camel documentation LLM-friendly brings two significant benefits:

### 1. Better AI Training Data

When LLMs are trained or updated, they can easily crawl and index Apache Camel documentation through the standardized llms.txt format. This ensures that AI models have access to accurate, well-structured information about Apache Camel.

### 2. Enhanced Developer Experience with AI Coding Agents

Modern coding assistants like Claude Code, Cursor, GitHub Copilot, and Gemini CLI can now directly access Apache Camel documentation in a format optimized for their consumption. This means:

- More accurate code suggestions for Apache Camel integrations
- Better understanding of component configurations and patterns
- Improved troubleshooting and debugging assistance
- Up-to-date knowledge of the latest Camel features and versions

## Using the Markdown Documentation

### Example: AI Assistant Using llms.txt

Here's a real example of an AI coding assistant using the llms.txt endpoint to answer Apache Camel questions:

**User:** Reply to Apache Camel-related questions using the llms.txt `https://camel.apache.org/llms.txt` follow links and redirect.
What is the latest Camel release? And the latest Camel Quarkus?

**Assistant:**
> I'll fetch the Apache Camel llms.txt file and follow any links to find the latest release information.
>
> Fetch(`https://camel.apache.org/llms.txt`)
>
> Let me follow the releases page link to get the specific version numbers:
>
> Fetch(`https://camel.apache.org/releases/index.md`)
>
> Fetch(`https://camel.apache.org/camel-quarkus/next/index.md`)
>
> Based on the Apache Camel documentation:
>
> **Latest Apache Camel Release:** 4.16.0 (released 2025-11-05)
>
> **Latest Camel Quarkus:** 3.27.x (compatible with Camel 4.14.2 and Quarkus 3.27.0)
>
> Note that the Camel Quarkus version (3.27.x) is currently tracking Camel 4.14.2, which is a few versions behind the latest Camel core release (4.16.0). This is typical as Camel Quarkus needs to maintain compatibility with both Apache Camel and Quarkus frameworks.

This demonstrates how AI assistants can autonomously navigate the llms.txt file, follow links to relevant documentation, and provide accurate, up-to-date information about Apache Camel releases.

### Accessing Markdown Documentation

For any HTML page on the Apache Camel website, a markdown version is available by appending `.md` to the URL:

- **HTML**: `https://camel.apache.org/components/4.10.x/languages/simple-language.html`
- **Markdown**: `https://camel.apache.org/components/4.10.x/languages/simple-language.html.md`

## Try It Yourself

Visit [/llms.txt](/llms.txt) to see the implementation in action. You can access markdown versions of any documentation page by appending `.md` to the URL.

When using AI coding assistants like Claude Code, Cursor, or GitHub Copilot, they can now provide more accurate and up-to-date information about Apache Camel by accessing these markdown pages directly.

## Implementation Details

The implementation integrates into the existing build pipeline:

### Build Pipeline Integration

The markdown generation runs automatically during the website build process:

1. **Antora** generates HTML documentation from AsciiDoc sources
2. **Hugo** builds the website structure
3. **Gulp task** converts HTML to markdown
4. Generated markdown files are deployed alongside HTML pages

### Content Extraction and Cleaning

The conversion process focuses on extracting only the essential documentation content:

- Removes navigation elements, headers, and footers
- Extracts the main article content using semantic HTML selectors
- Converts tables, code blocks, and formatting to GitHub Flavored Markdown
- Preserves document structure and hierarchy

## Results and Impact

The implementation generates:

- **5,355+ markdown pages** automatically during each build
- **Coverage** of components, languages, data formats, and user guides
- **Clean, structured content** optimized for LLM consumption
- **No manual maintenance required** - fully automated with the build pipeline

## Conclusion

By implementing the llms.txt specification, we've made Apache Camel documentation more accessible to both AI training pipelines and developer-facing coding assistants. This automated solution requires no manual maintenance while providing structured, clean documentation in a format optimized for LLM consumption.