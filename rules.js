const Rule = require("html-validate").Rule;

class HtmlTitle extends Rule {
  documentation(context) {
    return {
      description: "Title of the page must be defined"
    };
  }

  setup() {
    this.on("dom:ready", event => {
      const title = event.document.querySelector('html head title');
      if (title === null) {
        this.report(event.document.querySelector('html'), "Missing <title> tag in the <head>");
      }
      else if (!title.textContent || title.textContent.trim().length === 0) {
        this.report(title, "No title specified");
      }
      else if (title.textContent[0] === '-') {
        this.report(title, "Title starts with the dash `-`, add the `title` front matter to the Hugo content");
      }
      else if (title.textContent.startsWith('Untitled')) {
        this.report(title, "Title starts with the `Untitled` make sure that the Asciidoc file starts with level 1 heading");
      }
    });
  }
}

module.exports = {
  rules: {
    "camel/title": HtmlTitle
  }
};
