'use strict'

// NOTE remove patch after upgrading from asciidoctor.js to @asciidoctor/core
Error.call = (self, ...args) => {
  const err = new Error(...args)
  return Object.assign(self, { message: err.message, stack: err.stack })
}

const asciidoctor = require('@asciidoctor/core')()
const data = require('gulp-data')
const fs = require('fs-extra')
const handlebars = require('handlebars')
const { objectTransform: map } = require('through2')
const ordered = require('ordered-read-streams')
const ospath = require('path')
const path = ospath.posix
const requireFromString = require('require-from-string')
const { Writable } = require('stream')
const { pipeline } = require('stream/promises')
const template = require('gulp-template')
const vfs = require('vinyl-fs')
const yaml = require('js-yaml')

const ASCIIDOC_ATTRIBUTES = { experimental: '', icons: 'font', sectanchors: '', 'source-highlighter': 'highlight.js' }

// NOTE the postprocessors antora-playbook-production.yml registers under asciidoc.extensions.
// Without them the preview silently diverges from the built site: table.js is what wraps every
// table in a div.table-wrapper, and its absence used to collapse the icon column of every
// admonition rendered here. Keep this list in step with the playbook.
// NOTE @asciidoctor/tabs is registered by the playbook too but is deliberately left out: the
// 1.0.0-beta.3 build targets the Opal runtime of asciidoctor.js 2 and throws on require under the
// @asciidoctor/core 3 this UI depends on. The site build is unaffected because Antora supplies its
// own Asciidoctor, so tabs simply render as description lists in the preview.
const ASCIIDOC_EXTENSIONS = [require('../../../extensions/table.js'), require('../../../extensions/inline-styles.js')]

function createExtensionRegistry () {
  const registry = asciidoctor.Extensions.create()
  ASCIIDOC_EXTENSIONS.forEach((extension) => extension.register(registry))
  return registry
}

module.exports = (src, previewSrc, previewDest, sink = () => map()) => async () => {
  const [baseUiModel, { layouts }] = await Promise.all([
    loadSampleUiModel(previewSrc),
    toPromise(
      ordered([
        compileLayouts(src),
        registerPartials(src),
        registerHelpers(src),
        registerTemplatedHelpers(src),
        copyImages(previewSrc, previewDest),
      ])
    ),
  ])

  const renderPages = map((file, enc, next) => {
    const siteRootPath = path.relative(ospath.dirname(file.path), ospath.resolve(previewSrc))
    const uiModel = { ...baseUiModel, env: process.env }
    uiModel.page = { ...uiModel.page }
    uiModel.siteRootPath = siteRootPath
    uiModel.siteRootUrl = path.join(siteRootPath, 'index.html')
    uiModel.uiRootPath = path.join(siteRootPath, '_')
    if (file.stem === '404') {
      uiModel.page = { layout: '404', title: 'Page Not Found' }
    } else {
      const doc = asciidoctor.load(file.contents, {
        safe: 'safe',
        attributes: ASCIIDOC_ATTRIBUTES,
        extension_registry: createExtensionRegistry(),
      })
      uiModel.page.attributes = Object.entries(doc.getAttributes())
        .filter(([name, val]) => name.startsWith('page-'))
        .reduce((accum, [name, val]) => {
          accum[name.substr(5)] = val
          return accum
        }, {})
      uiModel.page.layout = doc.getAttribute('page-layout', 'default')
      uiModel.page.title = doc.getDocumentTitle()
      uiModel.page.contents = Buffer.from(doc.convert())
    }
    file.extname = '.html'
    try {
      file.contents = Buffer.from(layouts.get(uiModel.page.layout)(uiModel))
      next(null, file)
    } catch (e) {
      next(transformHandlebarsError(e, uiModel.page.layout))
    }
  })

  // NOTE gulp 5 settles async tasks on their returned promise, so wait for the final
  // preview output stream (and optional live-reload sink) to drain before completing.
  await pipeline(
    vfs.src('**/*.adoc', { base: previewSrc, cwd: previewSrc }),
    renderPages,
    vfs.dest(previewDest),
    sink(),
    new Writable({ objectMode: true, write: (file, enc, next) => next() })
  )
}

function loadSampleUiModel (src) {
  return fs.readFile(ospath.join(src, 'ui-model.yml'), 'utf8').then((contents) => yaml.load(contents))
}

function registerPartials (src) {
  return vfs.src('partials/*.hbs', { base: src, cwd: src }).pipe(
    map((file, enc, next) => {
      handlebars.registerPartial(file.stem, file.contents.toString())
      next()
    })
  )
}

function registerHelpers (src) {
  handlebars.registerHelper('resolvePage', resolvePage)
  handlebars.registerHelper('resolvePageURL', resolvePageURL)
  return vfs.src('helpers/*.js', { base: src, cwd: src }).pipe(
    map((file, enc, next) => {
      handlebars.registerHelper(file.stem, requireFromString(file.contents.toString()))
      next()
    })
  )
}

function registerTemplatedHelpers (src) {
  return vfs
    .src('helpers/*.js.template', { base: src, cwd: src })
    .pipe(data(() => ({ manifest: fs.readFileSync('./public/_/data/rev-manifest.json').toString() })))
    .pipe(template())
    .pipe(
      map((file, enc, next) => {
        handlebars.registerHelper(file.stem.replace('.js', ''), requireFromString(file.contents.toString()))
        next()
      })
    )
}

function compileLayouts (src) {
  const layouts = new Map()
  return vfs.src('layouts/*.hbs', { base: src, cwd: src }).pipe(
    map(
      (file, enc, next) => {
        const srcName = path.join(src, file.relative)
        layouts.set(file.stem, handlebars.compile(file.contents.toString(), { preventIndent: true, srcName }))
        next()
      },
      function (done) {
        this.push({ layouts })
        done()
      }
    )
  )
}

function copyImages (src, dest) {
  return vfs
    .src('**/*.{png,svg}', { base: src, cwd: src })
    .pipe(vfs.dest(dest))
    .pipe(map((file, enc, next) => next()))
}

function resolvePage (spec, context = {}) {
  if (spec) return { pub: { url: resolvePageURL(spec) } }
}

function resolvePageURL (spec, context = {}) {
  if (spec) return '/' + (spec = spec.split(':').pop()).slice(0, spec.lastIndexOf('.')) + '.html'
}

function transformHandlebarsError ({ message, stack }, layout) {
  const m = stack.match(/^ *at Object\.ret \[as (.+?)\]/m)
  const templatePath = `src/${m ? 'partials/' + m[1] : 'layouts/' + layout}.hbs`
  const err = new Error(`${message}${~message.indexOf('\n') ? '\n^ ' : ' '}in UI template ${templatePath}`)
  err.stack = [err.toString()].concat(stack.substr(message.length + 8)).join('\n')
  return err
}

// NOTE resolves on 'end' rather than 'finish': ordered-read-streams returns a streamx
// readable, which has no writable side to emit 'finish'.
function toPromise (stream) {
  return new Promise((resolve, reject, data = {}) =>
    stream
      .on('error', reject)
      .on('data', (chunk) => chunk.constructor === Object && Object.assign(data, chunk))
      .on('end', () => resolve(data))
  )
}
