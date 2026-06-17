const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

const PUBLIC_DIR = 'public';
const BUNDLE_NAME = 'camel-docs-offline.zip';

/**
 * Generates an offline documentation bundle: a single .zip archive of all generated Markdown (.md)
 * files plus /llms.txt, preserving the website directory structure. It lets agents (and humans)
 * with no or restricted internet access read the Camel docs locally - download, unzip (e.g. into
 * /tmp) and read the Markdown from there. See CAMEL-23781.
 *
 * Must run after the .md files have been generated (see generate-markdown task). Uses the system
 * `zip` tool, so no extra dependency is required.
 */
function generateOfflineBundle() {
  const bundlePath = path.join(PUBLIC_DIR, BUNDLE_NAME);

  if (!fs.existsSync(PUBLIC_DIR)) {
    console.error(`Cannot generate ${BUNDLE_NAME}: '${PUBLIC_DIR}' directory not found`);
    return;
  }

  // remove any stale bundle so it is never zipped into itself
  if (fs.existsSync(bundlePath)) {
    fs.unlinkSync(bundlePath);
  }

  try {
    // run from public/ so paths stay relative to the site root; include only .md files and llms.txt
    execFileSync('zip', ['-r', '-q', BUNDLE_NAME, '.', '-i', '*.md', 'llms.txt'], {
      cwd: PUBLIC_DIR,
      stdio: 'inherit'
    });

    const sizeMb = (fs.statSync(bundlePath).size / (1024 * 1024)).toFixed(1);
    console.log(`Generated /${BUNDLE_NAME} (${sizeMb} MB)`);
  } catch (error) {
    console.error(`Failed to generate ${BUNDLE_NAME}:`, error.message);
  }
}

module.exports = {
  generateOfflineBundle
};
