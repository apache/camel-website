'use strict'

const autoprefixer = require('autoprefixer')
const browserify = require('browserify')
const buffer = require('vinyl-buffer')
const concat = require('gulp-concat')
const cssnano = require('cssnano')
const data = require('gulp-data')
const fs = require('fs-extra')
const ordered = require('ordered-read-streams')
const ospath = require('path')
const path = ospath.posix
const postcss = require('gulp-postcss')
const postcssCalc = require('postcss-calc')
const postcssImport = require('postcss-import')
const postcssUrl = require('postcss-url')
const postcssVar = require('postcss-custom-properties')
const rename = require('gulp-rename')
const rev = require('gulp-rev')
const rewrite = require('gulp-rev-rewrite')
const template = require('gulp-template')
const terser = require('gulp-terser')
const vfs = require('vinyl-fs')
const { Writable } = require('stream')
const { pipeline } = require('stream/promises')
const { objectTransform: map } = require('through2')

module.exports = (src, dest, preview) => async () => {
  const opts = { base: src, cwd: src }
  const sourcemaps = preview || process.env.SOURCEMAPS === 'true'
  // NOTE these are PostCSS 8 visitor plugins; the bare `(css, result) => ...` form these
  // used to take is the PostCSS 7 API and is no longer invoked.
  const trackImportMtimes = {
    postcssPlugin: 'camel-track-import-mtimes',
    OnceExit (css, { result }) {
      const { messages, opts: { file } } = result
      return Promise.all(
        messages
          .reduce((accum, { file: depPath, type }) => (type === 'dependency' ? accum.concat(depPath) : accum), [])
          .map((importedPath) => fs.stat(importedPath).then(({ mtime }) => mtime))
      ).then((mtimes) => {
        const newestMtime = mtimes.reduce((max, curr) => (!max || curr > max ? curr : max), file.stat.mtime)
        if (newestMtime > file.stat.mtime) file.stat.mtimeMs = +(file.stat.mtime = newestMtime)
      })
    },
  }

  const pseudoElementFixer = {
    postcssPlugin: 'camel-pseudo-element-fixer',
    OnceExit: (css) => postcssPseudoElementFixer(css),
  }

  // NOTE postcss-custom-properties substitutes var() in real declarations but, unlike the
  // postcss 7 release, keeps the :root block that defines them. Once preserve is false
  // nothing reads those definitions any more, and the oldest browserslist targets (ie 11,
  // op_mini) ignore custom properties outright, so drop them rather than ship dead bytes.
  const dropResolvedCustomProperties = {
    postcssPlugin: 'camel-drop-resolved-custom-properties',
    OnceExit (css) {
      css.walkDecls(/^--/, (decl) => decl.remove())
      css.walkRules((rule) => rule.nodes.length || rule.remove())
    },
  }

  const postcssPlugins = [
    postcssImport,
    trackImportMtimes,
    postcssUrl([
      {
        filter: '**/*.@(woff|woff2)',
        url: (asset) => {
          const relpath = asset.pathname.substr(1)
          const abspath = require.resolve(relpath)
          const basename = ospath.basename(abspath)
          const destpath = ospath.join(dest, 'font', basename)
          if (!fs.pathExistsSync(destpath)) fs.copySync(abspath, destpath)
          return path.join('..', 'font', basename)
        },
      },
    ]),
    postcssVar({ preserve: preview }),
    ...(preview ? [postcssCalc()] : [dropResolvedCustomProperties]),
    autoprefixer,
    ...(preview ? [] : [cssnano({ preset: 'default' }), pseudoElementFixer]),
  ]

  const imagemin = await import('gulp-imagemin')

  let manifest

  // NOTE merge-stream is a node-core PassThrough and silently drops files from the streamx
  // streams vinyl-fs 4 produces; ordered-read-streams is the streamx-native equivalent.
  const staged = ordered([
    vfs
      .src('js/+([0-9])-*.js', { ...opts, sourcemaps })
      .pipe(terser())
      // NOTE concat already uses stat from newest combined file
      .pipe(concat('js/site.js'))
      .pipe(rev()),
    vfs
      .src('js/vendor/*.js', { ...opts, read: false })
      .pipe(
        // see https://gulpjs.org/recipes/browserify-multiple-destination.html
        map((file, enc, next) => {
          if (file.relative.endsWith('.bundle.js')) {
            const mtimePromises = []
            const bundlePath = file.path
            browserify(file.relative, { basedir: src, detectGlobals: false })
              .plugin('browser-pack-flat/plugin')
              .on('file', (bundledPath) => {
                if (bundledPath !== bundlePath) mtimePromises.push(fs.stat(bundledPath).then(({ mtime }) => mtime))
              })
              .bundle((bundleError, bundleBuffer) =>
                Promise.all(mtimePromises).then((mtimes) => {
                  const newestMtime = mtimes.reduce((max, curr) => (curr > max ? curr : max), file.stat.mtime)
                  if (newestMtime > file.stat.mtime) file.stat.mtimeMs = +(file.stat.mtime = newestMtime)
                  if (bundleBuffer !== undefined) file.contents = bundleBuffer
                  file.path = file.path.slice(0, file.path.length - 10) + '.js'
                  next(bundleError, file)
                })
              )
          } else {
            fs.readFile(file.path, 'UTF-8').then((contents) => {
              file.contents = Buffer.from(contents)
              next(null, file)
            })
          }
        })
      )
      .pipe(buffer())
      .pipe(terser())
      // NOTE use this statement to bundle a JavaScript library that cannot be browserified, like jQuery
      //vfs.src(require.resolve('<package-name-or-require-path>'), opts).pipe(concat('js/vendor/<library-name>.js')),
      .pipe(rev()),
    vfs
      .src('css/site.css', { ...opts, sourcemaps })
      .pipe(postcss((file) => ({ plugins: postcssPlugins, options: { file } })))
      .pipe(rev()),
    // NOTE fonts are not staged from src; the postcssUrl handler above copies them straight
    // into dest/font from their npm packages, and vinyl-fs 4 errors on a missing src/font.
    // NOTE gulp 5 decodes contents as UTF-8 by default, which would corrupt binary assets
    vfs
      .src('img/**/*.{jpg,ico,png,svg}', { ...opts, encoding: false })
      .pipe(
        imagemin.default([
          imagemin.gifsicle(),
          imagemin.mozjpeg(),
          imagemin.optipng(),
          imagemin.svgo({
            plugins: [
              { name: 'removeViewBox', active: false },
              { name: 'cleanupIDs', params: { remove: false } },
              { name: 'removeTitle', active: false },
              { name: 'removeDesc', active: false },
            ],
          }),
        ])
      )
      .pipe(rev()),
    vfs.src('helpers/*.js', opts),
    vfs.src('layouts/*.hbs', opts),
    vfs.src('partials/*.hbs', opts),
  ])
    .pipe(rewrite())
    .pipe(vfs.dest(dest, { sourcemaps: sourcemaps && '.' }))
    .pipe(rev.manifest())
    .pipe(vfs.dest(path.join(dest, 'data')))
    .pipe(
      map((file, enc, next) => {
        manifest = file.contents.toString()
        next(null, file)
      })
    )
    .pipe(vfs.src('helpers/*.js.template', opts))
    .pipe(data(() => ({ manifest: manifest })))
    .pipe(template())
    .pipe(
      rename((path) => {
        path.extname = '' // strip .template
      })
    )
    .pipe(vfs.dest(dest))

  // NOTE gulp settles an async task on its promise, and a stream is not a thenable, so the
  // pipeline must be awaited here or bundle:pack packs a partly written dest into
  // ui-bundle.zip. The sink consumes what the final vfs.dest re-emits so the pipeline keeps
  // draining instead of stalling once its object buffer fills. pipeline() is used over
  // finished() so a failure in any stage rejects rather than hanging the task.
  await pipeline(staged, new Writable({ objectMode: true, write: (file, enc, next) => next() }))
}

function postcssPseudoElementFixer (css, result) {
  css.walkRules(/(?:^|[^:]):(?:before|after)/, (rule) => {
    rule.selector = rule.selectors.map((it) => it.replace(/(^|[^:]):(before|after)$/, '$1::$2')).join(',')
  })
}
