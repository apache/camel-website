'use strict'

const assert = require('node:assert/strict')
const fs = require('node:fs')
const os = require('node:os')
const path = require('node:path')
const test = require('node:test')

const { bundleVersions, renderLlmsTxt } = require('../gulp/helpers/llms-txt')

function componentsDir (...names) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'llms-txt-'))
  for (const name of names) fs.mkdirSync(path.join(dir, name))
  return dir
}

const TEMPLATE = 'Bundles:\n<!-- offline-bundles -->\n\nUnzip it.\n'

test('the built versioned component docs give the bundle versions, newest first', () => {
  const dir = componentsDir('4.18.x', 'latest', 'next', '4.22.x', '4.8.x', 'README.md')

  assert.deepEqual(bundleVersions(dir), ['4.22', '4.18', '4.8'])
})

test('a missing components directory yields no versions', () => {
  assert.deepEqual(bundleVersions(path.join(os.tmpdir(), 'llms-txt-missing')), [])
})

test('the placeholder becomes one download link per version', () => {
  assert.equal(renderLlmsTxt(TEMPLATE, ['4.22', '4.18']), `Bundles:
- [Camel 4.22](https://github.com/apache/camel-website/releases/download/docs-4.22/camel-docs-4.22.zip)
- [Camel 4.18](https://github.com/apache/camel-website/releases/download/docs-4.18/camel-docs-4.18.zip)

Unzip it.
`)
})

test('rendering fails rather than publishing an empty or unfilled bundle list', () => {
  assert.throws(() => renderLlmsTxt(TEMPLATE, []), /No versioned component docs/)
  assert.throws(() => renderLlmsTxt('no placeholder', ['4.22']), /placeholder/)
})

test('the real template carries the placeholder', () => {
  const template = fs.readFileSync(path.join(__dirname, '../llms-txt-template.md'), 'utf8')

  assert.match(renderLlmsTxt(template, ['4.22']), /^- \[Camel 4\.22\]\(.*camel-docs-4\.22\.zip\)$/m)
})
