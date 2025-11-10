const fs = require('fs');
const path = require('path');

/**
 * Generates the /llms.txt file as per https://llmstxt.org/ specification.
 * This file helps LLMs discover and understand the structure of the documentation.
 * Reads from llms-txt-template.md and uses it as content.
 *
 * @param {Array<string>} pages - Array of page URLs that were converted to markdown
 */
function generateLlmsTxt(pages) {
  // Read the template file
  const templatePath = path.join(__dirname, '../../llms-txt-template.md');
  let llmsTxtContent = fs.readFileSync(templatePath, 'utf8');

  fs.writeFileSync('public/llms.txt', llmsTxtContent, 'utf8');
  console.log('Generated /llms.txt');
}

module.exports = {
  generateLlmsTxt
};
