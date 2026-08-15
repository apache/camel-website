'use strict'

const fs = require('fs')
const ospath = require('path')

/**
 * This Antora extension reports image assets that no page or partial references,
 * so stray media can be found and deleted.
 *
 * It deliberately logs at info and never at warn. The playbook sets
 * runtime.log.failure_level to warn, so a warning here would fail the whole site
 * build over a housekeeping issue. Set failOnUnused to true to opt into that.
 *
 * Options:
 *   excludeExtensions  extensions to skip, defaults to ['.cast']
 *   reportPath         file to write the list to, defaults to build/unused-media.txt
 *                      set to false to skip the report
 *   failOnUnused       log at warn instead of info, defaults to false
 */
module.exports.register = function ({ config }) {
  const logger = this.getLogger('detect-unused-media')
  const {
    excludeExtensions = ['.cast'],
    reportPath = ospath.join('build', 'unused-media.txt'),
    failOnUnused = false,
  } = config || {}
  const excluded = new Set(excludeExtensions)

  this.on('contentClassified', ({ contentCatalog }) => {
    const referenced = collectReferences(contentCatalog)
    const unused = contentCatalog
      .getFiles()
      .filter(({ src }) => src.family === 'image' && !excluded.has(src.extname))
      .filter(({ src }) => !(referenced.has(src.relative) || referenced.has(`${src.module}:${src.relative}`)))

    logger.info(
      'Checked %s image assets against %s references, %s unused',
      contentCatalog.getFiles().filter(({ src }) => src.family === 'image').length,
      referenced.size,
      unused.length
    )
    if (!unused.length) return

    const lines = unused.map(({ src }) => `${src.component} ${src.version} ${src.path}`).sort()
    lines.forEach((line) => logger[failOnUnused ? 'warn' : 'info'](line))
    if (reportPath === false) return

    fs.mkdirSync(ospath.dirname(reportPath), { recursive: true })
    fs.writeFileSync(reportPath, lines.join('\n') + '\n')
    logger.info('Wrote the unused media report to %s', reportPath)
  })
}

// NOTE the same shapes the crawler-independent extension used: image:target[] and image::target[]
// for images, video::target[] for video. Anything the reference cannot be resolved from, such as a
// target built from an attribute, is simply not matched, so this under-reports rather than
// reporting a used file as unused.
function collectReferences (contentCatalog) {
  const references = new Set()
  contentCatalog
    .getFiles()
    .filter(({ src }) => src.family === 'page' || src.family === 'partial')
    .forEach((file) => {
      if (!file.contents) return
      const matches = file.contents.toString().match(/(?:image|video)::?([^[\s]+)/g) || []
      matches.forEach((match) => references.add(match.replace(/^(?:image|video)::?/, '').trim()))
    })
  return references
}
