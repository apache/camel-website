'use strict'

const autoprefixer = require('autoprefixer')
const browserify = require('browserify')
const buffer = require('vinyl-buffer')
const concat = require('gulp-concat')
const cssnano = require('cssnano')
const data = require('gulp-data')
const fs = require('fs-extra')
const imagemin = require('gulp-imagemin')
const { obj: map } = require('through2')
const merge = require('merge-stream')
const ospath = require('path')
const path = ospath.posix
const postcss = require('gulp-postcss')
const postcssCalc = require('postcss-calc')
const postcssImport = require('postcss-import')
const postcssUrl = require('postcss-url')
const postcssVar = require('postcss-custom-properties')
const rename = require('gulp-rename')
const rev = require('gulp-rev')
const template = require('gulp-template')
const uglify = require('gulp-uglify')
const vfs = require('vinyl-fs')

module.exports = (src, dest, preview) => () => {
  const opts = { base: src, cwd: src }
  const sourcemaps = preview || process.env.SOURCEMAPS === 'true'
  const postcssPlugins = [
    postcssImport,
    postcssUrl([
      {
        filter: '**/~typeface-*/files/*',
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
    postcssVar({ preserve: preview ? 'preserve-computed' : false }),
    preview ? postcssCalc : () => {},
    autoprefixer,
    preview ? () => {} : cssnano({ preset: 'default' }),
  ]

  let manifest

  return merge(
    vfs
      .src('js/+([0-9])-*.js', { ...opts, sourcemaps })
      .pipe(uglify())
      .pipe(concat('js/site.js'))
      .pipe(rev()),
    vfs
      .src('js/vendor/*.js', { ...opts, read: false })
      .pipe(
        // see https://gulpjs.org/recipes/browserify-multiple-destination.html
        map((file, enc, next) => {
          if (file.relative.endsWith('.bundle.js')) {
            file.contents = browserify(file.relative, { basedir: src, detectGlobals: false })
              .plugin('browser-pack-flat/plugin')
              .bundle()
            file.path = file.path.slice(0, file.path.length - 10) + '.js'
            next(null, file)
          } else {
            fs.readFile(file.path, 'UTF-8').then((contents) => {
              file.contents = Buffer.from(contents)
              next(null, file)
            })
          }
        })
      )
      .pipe(buffer())
      .pipe(uglify())
      .pipe(rev()),
    vfs.src('css/site.css', { ...opts, sourcemaps })
      .pipe(postcss(postcssPlugins))
      .pipe(rev()),
    vfs.src('font/*.{ttf,woff*(2)}', opts),
    vfs
      .src('img/**/*.{jpg,ico,png,svg}', opts)
      .pipe(
        imagemin([
          imagemin.gifsicle(),
          imagemin.jpegtran(),
          imagemin.optipng(),
          imagemin.svgo({ plugins: [
            { removeViewBox: false },
            { cleanupIDs: { remove: false } },
            { removeTitle: false },
            { removeDesc: false },
          ] }),
        ])
      ),
    vfs.src('helpers/*.js', opts),
    vfs.src('layouts/*.hbs', opts),
    vfs.src('partials/*.hbs', opts)
  ).pipe(vfs.dest(dest, { sourcemaps: sourcemaps && '.' }))
    .pipe(rev.manifest())
    .pipe(vfs.dest(path.join(dest, 'data')))
    .pipe(map((file, enc, next) => {
      manifest = file.contents.toString()
      next(null, null)
    }))
    .pipe(vfs.src('helpers/*.js.template', opts))
    .pipe(data(() => ({ manifest: manifest })))
    .pipe(template())
    .pipe(rename((path) => {
      path.extname = '' // strip .template
    }))
    .pipe(vfs.dest(dest))
}
