'use strict'

/**
 * This Antora extension promotes the 'deprecated' and 'supportlevel' AsciiDoc
 * document attributes to page attributes so they can be accessed in
 * Handlebars templates as page.attributes.deprecated and page.attributes.supportlevel.
 *
 * This allows the UI to display warning banners for deprecated components.
 */
module.exports.register = function ({ config }) {
  this.on('documentsConverted', ({ contentCatalog }) => {
    contentCatalog.getPages().forEach((page) => {
      if (!page.asciidoc) return

      const attributes = page.asciidoc.attributes
      if (!attributes) return

      // Initialize page attributes if not present
      if (!page.asciidoc.attributes['page-deprecated']) {
        // Check if the page has deprecated attribute
        if (attributes.deprecated !== undefined) {
          // Promote deprecated to page-deprecated
          page.asciidoc.attributes['page-deprecated'] = attributes.deprecated || 'true'
        }
      }

      if (!page.asciidoc.attributes['page-supportlevel']) {
        // Check for supportlevel attribute (e.g., "Stable-deprecated")
        if (attributes.supportlevel !== undefined) {
          page.asciidoc.attributes['page-supportlevel'] = attributes.supportlevel
        }
      }

      if (!page.asciidoc.attributes['page-shortname']) {
        // Check for shortname attribute (e.g., "nitrite", "component")
        if (attributes.shortname !== undefined) {
          page.asciidoc.attributes['page-shortname'] = attributes.shortname
        }
      }
    })
  })
}
