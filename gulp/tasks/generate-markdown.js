const fs = require('fs');
const { parse } = require('node-html-parser');
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
 */
async function generateMarkdown(done) {
  const turndownService = createTurndownService();

  // Keep track of processed files for llms.txt
  const processedPages = [];

  const glob = require('glob');

  // Get all HTML files
  const htmlFiles = glob.sync('public/**/*.html', {
    ignore: ['public/404.html', 'public/**/index.html'] // Skip error pages and index pages
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
        const root = parse(htmlContent);

        // Extract only the main article content
        // Try different selectors based on Antora and Hugo structure
        let mainContent = root.querySelector('article.doc') ||
                         root.querySelector('main') ||
                         root.querySelector('.article') ||
                         root.querySelector('article');

        if (!mainContent) {
          // Silently skip files without main content
          continue;
        }

        // Remove navigation elements, headers, and footers from the content
        const elementsToRemove = mainContent.querySelectorAll('nav, header, footer, .nav, .navbar, .toolbar');
        elementsToRemove.forEach(el => el.remove());

        // Remove anchor links (they are just UI navigation aids)
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

  done();
}

module.exports = generateMarkdown;
