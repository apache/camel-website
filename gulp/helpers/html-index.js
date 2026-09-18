const fs = require('fs');
const { convertPage } = require('./convert-page');
const { createTurndownService } = require('./turndown-config');

/**
 * Generic function to generate markdown from HTML index pages.
 *
 * @param {Object} config - Configuration object
 * @param {string} config.htmlPath - Path to the HTML file (e.g., 'public/components/next/index.html')
 * @param {string} config.title - Title for the markdown file (e.g., 'Components Index')
 * @param {string} config.description - Description text (e.g., 'List of all Camel components')
 */
async function generateHtmlIndex(config) {
  const { htmlPath, title, description } = config;
  const mdPath = htmlPath.replace(/\.html$/, '.md');

  try {
    // Check if file exists
    if (!fs.existsSync(htmlPath)) {
      return;
    }

    const htmlContent = fs.readFileSync(htmlPath, 'utf8');
    let { markdown } = convertPage(htmlContent, createTurndownService());

    if (markdown === null) {
      return;
    }

    // Add header if title and description provided
    if (title && description) {
      markdown = `# ${title}\n\n${description}\n\n${markdown}`;
    }

    // Write markdown file
    fs.writeFileSync(mdPath, markdown, 'utf8');
  } catch (error) {
    console.error(`Error generating markdown for ${htmlPath}:`, error.message);
  }
}

/**
 * Generates markdown for all index files (HTML index pages).
 * This function processes all the index files specified in the configuration.
 */
async function generateAllIndexes() {
  console.log('\nGenerating markdown for all index files...');

  const glob = require('glob');

  // Define all HTML index files to process
  const htmlIndexes = [
    {
      htmlPath: 'public/camel-k/next/index.html',
      title: 'Camel K Documentation Index',
      description: 'Index of Camel K documentation pages.'
    },
    {
      htmlPath: 'public/camel-kafka-connector/next/index.html',
      title: 'Camel Kafka Connector Documentation Index',
      description: 'Index of Camel Kafka Connector documentation pages.'
    },
    {
      htmlPath: 'public/camel-kamelets/next/index.html',
      title: 'Camel Kamelets Documentation Index',
      description: 'Index of Camel Kamelets documentation pages.'
    },
    {
      htmlPath: 'public/camel-quarkus/next/index.html',
      title: 'Camel Quarkus Documentation Index',
      description: 'Index of Camel Quarkus documentation pages.'
    },
    {
      htmlPath: 'public/camel-spring-boot/next/index.html',
      title: 'Camel Spring Boot Documentation Index',
      description: 'Index of Camel Spring Boot documentation pages.'
    },
    {
      htmlPath: 'public/components/next/index.html',
      title: 'Components Index',
      description: 'Index of all Camel components.'
    },
    {
      htmlPath: 'public/components/next/others/index.html',
      title: 'Other Components Index',
      description: 'Index of other Camel components.'
    },
    {
      htmlPath: 'public/components/next/languages/index.html',
      title: 'Languages Index',
      description: 'Index of Camel expression and predicate languages.'
    },
    {
      htmlPath: 'public/components/next/eips/index.html',
      title: 'Enterprise Integration Patterns Index',
      description: 'Index of Enterprise Integration Patterns (EIPs).'
    },
    {
      htmlPath: 'public/components/next/dataformats/index.html',
      title: 'Data Formats Index',
      description: 'Index of Camel data formats.'
    },
    {
      htmlPath: 'public/manual/index.html',
      title: 'User Manual Index',
      description: 'Index of Apache Camel user manual pages.'
    },
    {
      htmlPath: 'public/manual/faq/index.html',
      title: 'FAQ Index',
      description: 'Frequently Asked Questions about Apache Camel.'
    },
    {
      htmlPath: 'public/releases/index.html',
      title: 'Releases Index',
      description: 'Apache Camel version releases Index.'
    }
  ];

  // Process all HTML indexes
  for (const config of htmlIndexes) {
    await generateHtmlIndex(config);
  }

  // Find all index.html files under public/releases/**/
  console.log('\nGenerating markdown for all release index files...');
  const releaseIndexFiles = glob.sync('public/releases/**/index.html');
  console.log(`Found ${releaseIndexFiles.length} release index files to process`);

  // Process each release index file without custom title/description
  for (const htmlPath of releaseIndexFiles) {
    await generateHtmlIndex({ htmlPath });
  }

  console.log('All index files generation complete');
}

module.exports = {
  generateHtmlIndex,
  generateAllIndexes
};
