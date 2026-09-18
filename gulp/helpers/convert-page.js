const { JSDOM } = require('jsdom');
const { parse, valid } = require('node-html-parser');

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

  if (mainContent.classList.contains('post')) {
    trimBlogPost(mainContent);
  }

  // Remove navigation elements, headers, footers, the embedded table of contents and the eyebrow
  // label above the title (the Antora UI puts the component title there, e.g. "User manual")
  const elementsToRemove = mainContent.querySelectorAll('nav, header, footer, .nav, .navbar, .toolbar, aside.toc, .doc-eyebrow');
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

/**
 * Reduces a rendered blog post (layouts/blog/post.html) to its title, lead and body, with the
 * date, authors and categories from the rail folded into one line under the title. The rail
 * itself (avatars, share links, table of contents, previous/next), the "All posts" link, the
 * featured image and the related posts are page chrome and are dropped.
 *
 * @param {HTMLElement} article the article.post element
 */
function trimBlogPost(article) {
  const date = article.querySelector('time.post-date')?.getAttribute('datetime');
  const authors = article.querySelectorAll('.post-author-name').map(el => el.text.trim());
  const categories = article.querySelectorAll('.post-tags a').map(el => el.text.trim());

  article.querySelectorAll('a.post-back, .post-tags, aside.post-rail, img.featured, section.post-related')
    .forEach(el => el.remove());

  const byline = [
    date && `Published ${date}`,
    authors.length && `by ${authors.join(', ')}`,
    categories.length && `in ${categories.join(', ')}`
  ].filter(Boolean).join(' ');
  const title = article.querySelector('h1.post-title');
  if (byline && title) {
    title.insertAdjacentHTML('afterend', `<p>${byline}</p>`);
  }
}

module.exports = { convertPage };
