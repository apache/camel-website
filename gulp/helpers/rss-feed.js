const fs = require('fs');
const xml2js = require('xml2js');

/**
 * Generic function to generate toon format markdown from RSS XML feeds.
 * Converts RSS feeds to plain text files (.md) as per https://github.com/toon-format/toon specification.
 *
 * @param {Object} config - Configuration object
 * @param {string} config.xmlPath - Path to the XML file (e.g., 'public/blog/index.xml')
 * @param {string} config.title - Title for the markdown file (e.g., 'Apache Camel Blog')
 * @param {string} config.description - Description text (e.g., 'Blog posts about Apache Camel')
 * @param {string} config.itemsName - Name for the items collection (e.g., 'posts', 'releases')
 */
async function generateRssFeedIndex(config) {
  const parser = new xml2js.Parser();

  const { xmlPath, title, description, itemsName } = config;
  const mdPath = xmlPath.replace(/\.xml$/, '.md');

  try {
    // Check if file exists
    if (!fs.existsSync(xmlPath)) {
      return;
    }

    // Read XML file
    const xmlContent = fs.readFileSync(xmlPath, 'utf8');

    // Parse XML to JavaScript object
    const result = await parser.parseStringPromise(xmlContent);

    let toonContent = '';

    // Check if it's an RSS feed
    if (result.rss && result.rss.channel && result.rss.channel[0]) {
      const channel = result.rss.channel[0];
      const items = channel.item || [];

      // Create toon format header
      toonContent = `# ${title}\n\n`;
      toonContent += `${description}\n\n`;
      toonContent += `${itemsName}[${items.length}]{title,link,pubDate,description}:\n`;

      // Add each item
      for (const item of items) {
        const itemTitle = item.title ? item.title[0] : '';
        const link = item.link ? item.link[0] : '';
        const pubDate = item.pubDate ? item.pubDate[0] : '';
        const itemDesc = item.description ? item.description[0].replace(/\n/g, ' ').substring(0, 200) : '';

        // Convert links to markdown format
        let mdLink = link;
        if (mdLink.endsWith('/')) {
          mdLink = mdLink + 'index.md';
        } else {
          mdLink = mdLink.replace(/\.html$/, '.md');
        }

        toonContent += `  ${itemTitle}|${mdLink}|${pubDate}|${itemDesc}\n`;
      }
    }

    // Write toon format file
    fs.writeFileSync(mdPath, toonContent, 'utf8');
  } catch (error) {
    console.error(`Error generating toon format for ${xmlPath}:`, error.message);
  }
}

/**
 * Generates toon format markdown for the Releases category RSS feed.
 * Converts public/categories/Releases/index.xml to index.md
 * as per https://github.com/toon-format/toon specification.
 */
async function generateReleasesIndex() {
  console.log('\nGenerating toon format for Releases index...');
  await generateRssFeedIndex({
    xmlPath: 'public/categories/Releases/index.xml',
    title: 'Apache Camel Releases',
    description: 'Release feed for Apache Camel and related projects.',
    itemsName: 'releases'
  });
  console.log('Releases index toon format generation complete');
}

/**
 * Generates toon format markdown for the Blog RSS feed.
 * Converts public/blog/index.xml to index.md
 * as per https://github.com/toon-format/toon specification.
 */
async function generateBlogIndex() {
  console.log('\nGenerating toon format for Blog index...');
  await generateRssFeedIndex({
    xmlPath: 'public/blog/index.xml',
    title: 'Apache Camel Blog',
    description: 'Blog posts about Apache Camel and related topics.',
    itemsName: 'posts'
  });
  console.log('Blog index toon format generation complete');
}

module.exports = {
  generateRssFeedIndex,
  generateReleasesIndex,
  generateBlogIndex
};
