const fs = require('fs');
const { convertPage, rewriteDirectoryLinks } = require('../helpers/convert-page');
const { createTurndownService } = require('../helpers/turndown-config');
const { generateToonSitemaps } = require('../helpers/toon-format');
const { generateLlmsTxt } = require('../helpers/llms-txt');
const { generateReleasesIndex, generateBlogIndex } = require('../helpers/rss-feed');
const { generateAllIndexes } = require('../helpers/html-index');

/**
 * Generates Markdown (.md) files from HTML files for LLM consumption.
 * This task converts HTML documentation pages to Markdown format, making them
 * accessible to LLMs as per https://llmstxt.org/ specification.
 *
 * For each .html file, it creates a corresponding .md file with:
 * - Only the main article content (excluding nav, header, footer)
 * - Clean Markdown formatting using Turndown
 * - GitHub-flavored Markdown for tables and code blocks
 *
 * Hugo renders every website page as <page>/index.html, so an index.html is converted too
 * when it is a content page (has an article.doc): the .md then sits next to it as
 * <page>/index.md, which keeps the page's relative links valid. List and section pages
 * (home, download, community, ...) have no article.doc and are skipped. Blog posts are
 * content pages too and are reduced to their title, byline and body, see trimBlogPost.
 */
async function generateMarkdown() {
  const turndownService = createTurndownService();

  // Keep track of processed files for llms.txt
  const processedPages = [];

  const glob = require('glob');

  // Get all HTML files
  const htmlFiles = glob.sync('public/**/*.html', {
    ignore: [
      'public/404.html',
      'public/releases/**/index.html' // release pages are converted by generateAllIndexes below
    ]
  });

  let processedCount = 0;
  const totalFiles = htmlFiles.length;
  const BATCH_SIZE = 500; // Process in batches to avoid memory issues

  console.log(`Found ${totalFiles} HTML files to convert`);

  // Process files in batches
  for (let i = 0; i < htmlFiles.length; i += BATCH_SIZE) {
    const batch = htmlFiles.slice(i, i + BATCH_SIZE);

    for (const htmlFile of batch) {
      try {
        const htmlContent = fs.readFileSync(htmlFile, 'utf8');
        const articleOnly = htmlFile.endsWith('/index.html');
        const { markdown, repaired } = convertPage(htmlContent, turndownService, { articleOnly });

        if (repaired) {
          console.warn(`Repaired malformed HTML in ${htmlFile}, fix the mis-nested markup in its source`);
        }

        if (markdown === null) {
          if (!articleOnly) {
            console.warn(`Skipping ${htmlFile}: no main content found`);
          }
          continue;
        }

        // Write .md file (replace .html extension with .md)
        const mdFile = htmlFile.replace(/\.html$/, '.md');
        fs.writeFileSync(mdFile, markdown, 'utf8');

        // Track for llms.txt (convert to URL path)
        const urlPath = htmlFile.replace('public/', '/').replace('.html', '.md');
        processedPages.push(urlPath);

        processedCount++;
      } catch (error) {
        console.error(`Error processing ${htmlFile}:`, error.message);
      }
    }
  }

  console.log(`\nSuccessfully generated ${processedCount} Markdown files`);

  // Website pages and blog posts link to each other by directory; now that every mirror is
  // written, point such links at the mirror where there is one
  const mirrors = new Set(processedPages);
  for (const urlPath of processedPages.filter(p => p.endsWith('/index.md'))) {
    const mdFile = `public${urlPath}`;
    const markdown = fs.readFileSync(mdFile, 'utf8');
    const rewritten = rewriteDirectoryLinks(markdown, urlPath, p => mirrors.has(p));
    if (rewritten !== markdown) {
      fs.writeFileSync(mdFile, rewritten, 'utf8');
    }
  }

  // Generate llms.txt file
  generateLlmsTxt(processedPages);

  // Generate toon format sitemaps
  await generateToonSitemaps();

  // Generate toon format for releases RSS feed
  await generateReleasesIndex();

  // Generate toon format for blog RSS feed
  await generateBlogIndex();

  // Generate all other index files
  await generateAllIndexes();
}

module.exports = generateMarkdown;
