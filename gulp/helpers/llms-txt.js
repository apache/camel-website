const fs = require('fs');
const path = require('path');

// Placeholder in llms-txt-template.md that the generated bundle list replaces
const BUNDLE_MARKER = '<!-- offline-bundles -->';
const BUNDLE_DOWNLOAD_BASE = 'https://github.com/apache/camel-website/releases/download';

/**
 * Lists the Camel versions that have versioned documentation built into the site, newest first.
 * Antora writes one directory per documented branch (4.18.x, 4.22.x, ...) next to the unversioned
 * `latest` and `next` aliases, so the site build itself is the source of truth for which offline
 * bundles exist.
 *
 * @param {string} componentsDir - Directory holding the versioned component docs
 * @returns {Array<string>} major.minor versions, e.g. ['4.22', '4.18']
 */
function bundleVersions(componentsDir = 'public/components') {
  if (!fs.existsSync(componentsDir)) {
    return [];
  }
  return fs.readdirSync(componentsDir)
    .filter(name => /^\d+\.\d+\.x$/.test(name))
    .map(name => name.replace(/\.x$/, ''))
    .sort((a, b) => {
      const [aMajor, aMinor] = a.split('.').map(Number);
      const [bMajor, bMinor] = b.split('.').map(Number);
      return bMajor - aMajor || bMinor - aMinor;
    });
}

/**
 * Fills the template with the offline bundle list.
 *
 * @param {string} template - Content of llms-txt-template.md
 * @param {Array<string>} versions - Camel versions with an offline bundle, as returned by bundleVersions
 * @returns {string} the llms.txt content
 */
function renderLlmsTxt(template, versions) {
  if (!template.includes(BUNDLE_MARKER)) {
    throw new Error(`llms.txt template has no ${BUNDLE_MARKER} placeholder for the offline bundle list`);
  }
  if (versions.length === 0) {
    throw new Error('No versioned component docs found, cannot list the offline documentation bundles');
  }
  const bundleList = versions
    .map(version => `- [Camel ${version}](${BUNDLE_DOWNLOAD_BASE}/docs-${version}/camel-docs-${version}.zip)`)
    .join('\n');
  return template.replace(BUNDLE_MARKER, bundleList);
}

/**
 * Generates the /llms.txt file as per https://llmstxt.org/ specification.
 * This file helps LLMs discover and understand the structure of the documentation.
 * Reads from llms-txt-template.md and fills in the offline bundle list from the built site.
 *
 * @param {Array<string>} pages - Array of page URLs that were converted to markdown
 */
function generateLlmsTxt(pages) {
  // Read the template file
  const templatePath = path.join(__dirname, '../../llms-txt-template.md');
  const template = fs.readFileSync(templatePath, 'utf8');

  fs.writeFileSync('public/llms.txt', renderLlmsTxt(template, bundleVersions()), 'utf8');
  console.log('Generated /llms.txt');
}

module.exports = {
  generateLlmsTxt,
  bundleVersions,
  renderLlmsTxt
};
