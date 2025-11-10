const fs = require('fs');
const { parse } = require('node-html-parser');
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
    const root = parse(htmlContent);

    // Create turndown service
    const turndownService = createTurndownService();

    // Extract only the main article content
    let mainContent = root.querySelector('article.doc') ||
                     root.querySelector('main') ||
                     root.querySelector('.article') ||
                     root.querySelector('article');

    if (!mainContent) {
      return;
    }

    // Remove navigation elements
    const elementsToRemove = mainContent.querySelectorAll('nav, header, footer, .nav, .navbar, .toolbar');
    elementsToRemove.forEach(el => el.remove());

    // Remove anchor links
    const anchors = mainContent.querySelectorAll('a.anchor');
    anchors.forEach(el => el.remove());

    // Clean up table cells by unwrapping div.content and div.paragraph wrappers
    const tableCells = mainContent.querySelectorAll('td.tableblock, th.tableblock');
    tableCells.forEach(cell => {
      let html = cell.innerHTML;
      // Unwrap <div class="content"><div class="paragraph"><p>...</p></div></div>
      html = html.replace(/<div class="content"><div class="paragraph">\s*<p>(.*?)<\/p>\s*<\/div><\/div>/gs, '$1');
      // Unwrap <div class="content"><div id="..." class="paragraph"><p>...</p></div></div>
      html = html.replace(/<div class="content"><div[^>]*class="paragraph"[^>]*>\s*<p>(.*?)<\/p>\s*<\/div><\/div>/gs, '$1');
      // Also handle simple <p class="tableblock">...</p> wrappers
      html = html.replace(/<p class="tableblock">(.*?)<\/p>/gs, '$1');
      cell.set_content(html);
    });

    // Convert to Markdown
    let markdown = turndownService.turndown(mainContent.innerHTML);

    // Update links to point to .md files instead of .html
    // Replace https://camel.apache.org/**/*.html with https://camel.apache.org/**/*.md
    markdown = markdown.replace(/(https:\/\/camel\.apache\.org\/[^)\s]*?)\.html/g, '$1.md');
    // Replace relative links *.html with *.md
    markdown = markdown.replace(/\[([^\]]+)\]\(([^)]+?)\.html\)/g, '[$1]($2.md)');

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
