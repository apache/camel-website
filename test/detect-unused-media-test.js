'use strict'

const assert = require('node:assert/strict')
const fs = require('node:fs')
const os = require('node:os')
const ospath = require('node:path')
const test = require('node:test')

const classifierLib = ospath.dirname(require.resolve('@antora/content-classifier'))
const ContentCatalog = require(ospath.join(classifierLib, 'content-catalog'))
const extension = require('../extensions/detect-unused-media')

function addFile (catalog, src, contents) {
  return catalog.addFile({ src: Object.assign({ version: '1.0', module: 'ROOT' }, src), contents })
}

function createCatalog (asciidoc) {
  const catalog = new ContentCatalog()
  catalog.registerComponentVersion('source', '1.0', asciidoc ? { asciidoc } : undefined)
  catalog.registerComponentVersion('other', '1.0')
  return catalog
}

function runExtension (catalog, reportPath) {
  let contentClassified
  extension.register.call(
    {
      getLogger: () => ({ info: () => {}, warn: () => {} }),
      on: (event, listener) => {
        assert.equal(event, 'contentClassified')
        contentClassified = listener
      },
    },
    { config: { reportPath } }
  )
  contentClassified({ contentCatalog: catalog })
}

function withReport (t, callback) {
  const directory = fs.mkdtempSync(ospath.join(os.tmpdir(), 'unused-media-'))
  t.after(() => fs.rmSync(directory, { recursive: true, force: true }))
  callback(ospath.join(directory, 'unused-media.txt'))
}

test('a relative reference only marks the image in the source context as used', (t) => {
  withReport(t, (reportPath) => {
    const catalog = createCatalog()
    addFile(catalog, {
      component: 'source', family: 'page', relative: 'index.adoc', path: 'modules/ROOT/pages/index.adoc',
    }, Buffer.from('image::logo.png[]'))
    addFile(catalog, {
      component: 'source', family: 'image', relative: 'logo.png', path: 'modules/ROOT/images/logo.png',
    })
    addFile(catalog, {
      component: 'other', family: 'image', relative: 'logo.png', path: 'modules/ROOT/images/logo.png',
    })

    runExtension(catalog, reportPath)

    assert.equal(fs.readFileSync(reportPath, 'utf8'), 'other 1.0 modules/ROOT/images/logo.png\n')
  })
})

test('an Antora resource ID marks its cross-module target as used', (t) => {
  withReport(t, (reportPath) => {
    const catalog = createCatalog()
    addFile(catalog, {
      component: 'source', family: 'page', relative: 'index.adoc', path: 'modules/ROOT/pages/index.adoc',
    }, Buffer.from('image::other:image$logo.png[]'))
    addFile(catalog, {
      component: 'source', family: 'image', relative: 'logo.png', path: 'modules/ROOT/images/logo.png',
    })
    addFile(catalog, {
      component: 'source', module: 'other', family: 'image', relative: 'logo.png',
      path: 'modules/other/images/logo.png',
    })

    runExtension(catalog, reportPath)

    assert.equal(fs.readFileSync(reportPath, 'utf8'), 'source 1.0 modules/ROOT/images/logo.png\n')
  })
})

test('an attribute defined in the page resolves the target it appears in', (t) => {
  withReport(t, (reportPath) => {
    const catalog = createCatalog()
    addFile(catalog, {
      component: 'source', family: 'page', relative: 'index.adoc', path: 'modules/ROOT/pages/index.adoc',
    }, Buffer.from(':image-dir: sub\nimage::{image-dir}/logo.png[]'))
    addFile(catalog, {
      component: 'source', family: 'image', relative: 'sub/logo.png', path: 'modules/ROOT/images/sub/logo.png',
    })

    runExtension(catalog, reportPath)

    assert.equal(fs.existsSync(reportPath), false)
  })
})

test('an attribute defined in antora.yml resolves the target it appears in', (t) => {
  withReport(t, (reportPath) => {
    const catalog = createCatalog({ attributes: { 'image-dir': 'sub' } })
    addFile(catalog, {
      component: 'source', family: 'page', relative: 'index.adoc', path: 'modules/ROOT/pages/index.adoc',
    }, Buffer.from('image::{image-dir}/logo.png[]'))
    addFile(catalog, {
      component: 'source', family: 'image', relative: 'sub/logo.png', path: 'modules/ROOT/images/sub/logo.png',
    })

    runExtension(catalog, reportPath)

    assert.equal(fs.existsSync(reportPath), false)
  })
})

// NOTE the extension must under-report rather than name a referenced file as unused, because the
// report drives deletion. An attribute it cannot resolve has to protect every image it could name.
test('an unresolvable attribute suppresses the images it could name, and only those', (t) => {
  withReport(t, (reportPath) => {
    const catalog = createCatalog()
    addFile(catalog, {
      component: 'source', family: 'page', relative: 'index.adoc', path: 'modules/ROOT/pages/index.adoc',
    }, Buffer.from('image::{undefined-dir}/logo.png[]'))
    addFile(catalog, {
      component: 'source', family: 'image', relative: 'sub/logo.png', path: 'modules/ROOT/images/sub/logo.png',
    })
    addFile(catalog, {
      component: 'source', family: 'image', relative: 'sub/other.png', path: 'modules/ROOT/images/sub/other.png',
    })

    runExtension(catalog, reportPath)

    assert.equal(fs.readFileSync(reportPath, 'utf8'), 'source 1.0 modules/ROOT/images/sub/other.png\n')
  })
})

test('a successful clean scan removes a stale report', (t) => {
  withReport(t, (reportPath) => {
    const catalog = createCatalog()
    addFile(catalog, {
      component: 'source', family: 'page', relative: 'index.adoc', path: 'modules/ROOT/pages/index.adoc',
    }, Buffer.from('image::logo.png[]'))
    addFile(catalog, {
      component: 'source', family: 'image', relative: 'logo.png', path: 'modules/ROOT/images/logo.png',
    })
    fs.writeFileSync(reportPath, 'stale entry\n')

    runExtension(catalog, reportPath)

    assert.equal(fs.existsSync(reportPath), false)
  })
})
