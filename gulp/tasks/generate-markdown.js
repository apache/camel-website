const fs = require('fs');
const { JSDOM } = require('jsdom');
const { parse, valid } = require('node-html-parser');
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
 * (home, download, community, ...) have no article.doc and are skipped.
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
      'public/blog/**/index.html', // blog posts: their Markdown is to come from the source, see #1763
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

/**
 * Converts the main content of one rendered HTML page to Markdown.
 *
 * @param {string} htmlContent the full HTML page
 * @param {TurndownService} turndownService configured Turndown instance
 * @param {{articleOnly?: boolean}} [options] articleOnly: only accept an article.doc as the main
 *   content, so list and section pages that merely have a <main> are not converted
 * @returns {{markdown: string|null, repaired: boolean}} the Markdown (null when the page has no
 *   main content), and whether the HTML was malformed and had to be repaired before parsing
 */
function convertPage(htmlContent, turndownService, { articleOnly = false } = {}) {
  // node-html-parser cannot repair mis-nested inline tags (Asciidoctor emits them for a `*` inside
  // backticks): it unwraps every unclosed ancestor, article.doc included. Let jsdom's HTML5 parser
  // repair such pages the way browsers do; it is much slower, so only malformed pages go through it.
  const repaired = !valid(htmlContent);
  const root = parse(repaired ? new JSDOM(htmlContent).serialize() : htmlContent);

  // Extract only the main article content
  // Try different selectors based on Antora and Hugo structure
  let mainContent = root.querySelector('article.doc');
  if (!mainContent && !articleOnly) {
    mainContent = root.querySelector('main') ||
                  root.querySelector('.article') ||
                  root.querySelector('article');
  }

  if (!mainContent) {
    return { markdown: null, repaired };
  }

  // Remove navigation elements, headers, footers and the embedded table of contents from the content
  const elementsToRemove = mainContent.querySelectorAll('nav, header, footer, .nav, .navbar, .toolbar, aside.toc');
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

  return { markdown, repaired };
}

module.exports = generateMarkdown;
module.exports.convertPage = convertPage;
