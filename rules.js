const Rule = require("html-validate").Rule;

class HtmlTitle extends Rule {
  documentation(context) {
    return {
      description: "Title of the page must be defined"
    };
  }

  validateTitle(title) {
    if (!title.textContent || title.textContent.trim().length === 0) {
      this.report(title, "No title specified");
    } else if (title.textContent.startsWith('-')) {
      this.report(title, "Title starts with the dash `-`, add the `title` front matter to the Hugo content");
    } else if (title.textContent.startsWith('Untitled')) {
      this.report(title, "Title starts with the `Untitled` make sure that the Asciidoc file starts with level 1 heading");
    }
  }

  setup() {
    this.on("dom:ready", event => {
      const title = event.document.querySelector('html head title');
      if (title === null) {
        this.report(event.document.querySelector('html'), "Missing <title> tag in the <head>");
      } else {
        this.validateTitle(title);
      }
    });
  }
}

class RelativeLinks extends Rule {
  documentation(context) {
    return {
      description: "Within the Camel site we should use only relative links"
    };
  }

  setup() {
    this.on("dom:ready", event => {
      const anchors = event.document.getElementsByTagName('a');
      if (anchors === null) {
        return;
      }
      for (let i = 0; i < anchors.length; i++) {
        const href = anchors[i].getAttribute("href");
        if (href && href.startsWith("https://camel.apache.org")) {
          this.report(anchors[i], `For links within camel.apache.org use relative links, found: ${href}`);
        }
      }
    });
  }
}

class StructuredData extends Rule {
  documentation(context) {
    return {
      description: "Validates JSON-LD according to schema.org"
    };
  }

  setup() {
    let start = -1;

    this.on('tag:open', event => {
      const tag = event.target;
      if (tag.nodeName === 'script' && tag.hasAttribute('type') && tag.getAttribute('type').value === 'application/ld+json') {
        start = tag.location.offset;
      }
    });

    this.on('tag:close', event => {
      const tag = event.previous;
      if (tag.nodeName === 'script' && tag.hasAttribute('type') && tag.getAttribute('type').value === 'application/ld+json') {
        const startIdx = data.indexOf('>', start) + 1;
        const endIdx = tag.location.offset - 1; // omit the opening tag angled bracket
        const content = data.substring(startIdx, endIdx);
        try {
          JSON.parse(content);
        } catch (err) {
          this.report(tag, `Unable to parse JSON-LD as JSON: ${err}`);
        }
      }
    });
  }
}

let data;

module.exports = {
  setup(source) {
    data = source.data;
  },
  rules: {
    "camel/title": HtmlTitle,
    "camel/relative-links": RelativeLinks,
    "camel/structured-data": StructuredData
  }
};


