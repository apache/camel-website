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
    const { resources, unresolved } = collectReferences(contentCatalog)
    const unused = contentCatalog
      .getFiles()
      .filter(({ src }) => src.family === 'image' && !excluded.has(src.extname))
      .filter((file) => !resources.has(file))
      .filter(({ src }) => !unresolved.some((pattern) => pattern.test(src.relative) || pattern.test(src.path)))

    logger.info(
      'Checked %s image assets against %s references, %s unused',
      contentCatalog.getFiles().filter(({ src }) => src.family === 'image').length,
      resources.size,
      unused.length
    )
    if (!unused.length) {
      if (reportPath !== false) fs.rmSync(reportPath, { force: true })
      return
    }

    const lines = unused.map(({ src }) => `${src.component} ${src.version} ${src.path}`).sort()
    lines.forEach((line) => logger[failOnUnused ? 'warn' : 'info'](line))
    if (reportPath === false) return

    fs.mkdirSync(ospath.dirname(reportPath), { recursive: true })
    fs.writeFileSync(reportPath, lines.join('\n') + '\n')
    logger.info('Wrote the unused media report to %s', reportPath)
  })
}

// NOTE this only ever under-reports. A target it cannot resolve does not silently drop out of the
// reference set, because that would report a file that IS referenced as unused; it becomes a
// pattern in `unresolved` that suppresses every image it could possibly match instead.
function collectReferences (contentCatalog) {
  const resources = new Set()
  const unresolved = []
  contentCatalog
    .getFiles()
    .filter(({ src }) => src.family === 'page' || src.family === 'partial')
    .forEach((file) => {
      if (!file.contents) return
      const contents = file.contents.toString()
      const attributes = collectAttributes(contents, componentAttributes(contentCatalog, file.src))
      const matches = contents.match(/(?:image|video)::?([^[\s]+)/g) || []
      matches.forEach((match) => {
        const target = resolveTarget(match.replace(/^(?:image|video)::?/, '').trim(), attributes)
        if (/\{[^}]+\}/.test(target)) return unresolved.push(toPattern(target))
        const resource = contentCatalog.resolveResource(target, file.src, 'image', ['image'])
        if (resource) resources.add(resource)
      })
    })
  return { resources, unresolved }
}

// NOTE attributes set in antora.yml or in the playbook, which Antora merges onto the component
// version. Without these, a target such as image::{image-dir}/logo.svg[] is unresolvable in every
// page that relies on them, which is the common case rather than the exception.
function componentAttributes (contentCatalog, src) {
  return contentCatalog.getComponentVersion(src.component, src.version)?.asciidoc?.attributes || {}
}

function collectAttributes (contents, inherited) {
  const attributes = new Map(Object.entries(inherited))
  for (const [, name, value] of contents.matchAll(/^:([^:!\s]+):\s*(.*)$/gm)) {
    attributes.set(name, value)
  }
  return attributes
}

function resolveTarget (target, attributes) {
  return target.replace(/\{([^}]+)\}/g, (match, name) => {
    const value = attributes.get(name)
    return value === undefined ? match : value
  })
}

// Turns a target that still holds an attribute reference into a matcher for every path it could
// name, so those candidates are suppressed rather than reported.
function toPattern (target) {
  const source = target
    .split(/\{[^}]+\}/)
    .map((literal) => literal.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))
    .join('.*')
  return new RegExp(`(?:^|/)${source}$`)
}
