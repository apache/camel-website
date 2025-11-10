const TurndownService = require('turndown');
const turndownPluginGfm = require('turndown-plugin-gfm');

/**
 * Creates and configures a TurndownService instance for converting HTML to Markdown.
 * Includes custom rules for Asciidoctor admonition blocks, table wrappers, and icons.
 *
 * @returns {TurndownService} Configured Turndown service instance
 */
function createTurndownService() {
  const turndownService = new TurndownService({
    headingStyle: 'atx',
    codeBlockStyle: 'fenced',
    bulletListMarker: '-',
    emDelimiter: '_',
  });

  // Use GitHub-flavored Markdown for tables, strikethrough, etc.
  const gfm = turndownPluginGfm.gfm;
  turndownService.use(gfm);

  // Custom rule to convert Asciidoctor admonition blocks to readable Markdown
  turndownService.addRule('admonitionBlocks', {
    filter: function (node) {
      return node.classList && node.classList.contains('admonitionblock');
    },
    replacement: function (content, node) {
      // Extract the icon type (tip, note, important, warning, caution)
      const iconElement = node.querySelector('.icon i');
      let admonitionType = 'Note';

      if (iconElement) {
        const title = iconElement.getAttribute('title') || '';
        admonitionType = title || 'Note';
      }

      // Extract the content text
      const contentDiv = node.querySelector('.content');
      if (!contentDiv) return '';

      // Convert the content div to markdown
      const contentHtml = contentDiv.innerHTML;
      const contentMarkdown = turndownService.turndown(contentHtml);

      // Format as a blockquote with the admonition type
      const lines = contentMarkdown.split('\n');
      const quotedLines = lines.map(line => line ? `> ${line}` : '>');

      return `\n> **${admonitionType}**\n${quotedLines.join('\n')}\n\n`;
    }
  });

  // Custom rule to handle table-wrapper divs
  turndownService.addRule('tableWrapper', {
    filter: function (node) {
      return node.classList && node.classList.contains('table-wrapper');
    },
    replacement: function (content, node) {
      // Just extract the table inside
      const table = node.querySelector('table');
      if (table) {
        return turndownService.turndown(table.outerHTML);
      }
      return content;
    }
  });

  // Custom rule to clean up icon elements and other UI-only content
  turndownService.addRule('removeIcons', {
    filter: function (node) {
      // Remove icon elements, anchors without text, etc.
      if (node.classList) {
        return node.classList.contains('icon') ||
               node.classList.contains('anchor') ||
               (node.tagName === 'I' && node.classList.contains('fa'));
      }
      return false;
    },
    replacement: function () {
      return '';
    }
  });

  return turndownService;
}

module.exports = { createTurndownService };
