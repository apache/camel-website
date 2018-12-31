'use strict'

const fs = require('fs-extra')
const handlebars = require('handlebars')
const { obj: map } = require('through2')
const merge = require('merge-stream')
const path = require('path')
const requireFromString = require('require-from-string')
const vfs = require('vinyl-fs')
const yaml = require('js-yaml')

module.exports = (src, dest, siteSrc, siteDest, sink = () => map((_0, _1, next) => next()), layouts = {}) => () =>
  Promise.all([
    loadSampleUiModel(siteSrc),
    toPromise(merge(compileLayouts(src, layouts), registerPartials(src), registerHelpers(src))),
  ]).then(([uiModel]) =>
    vfs
      .src('**/*.html', { base: siteSrc, cwd: siteSrc })
      .pipe(
        map((file, enc, next) => {
          const compiledLayout = layouts[file.stem === '404' ? '404.hbs' : 'default.hbs']
          const siteRootPath = path.relative(path.dirname(file.path), path.resolve(siteSrc))
          uiModel.env = process.env
          uiModel.siteRootPath = siteRootPath
          uiModel.siteRootUrl = path.join(siteRootPath, 'index.html')
          uiModel.uiRootPath = path.join(siteRootPath, '_')
          uiModel.page.contents = file.contents.toString().trim()
          file.contents = Buffer.from(compiledLayout(uiModel))
          next(null, file)
        })
      )
      .pipe(vfs.dest(siteDest))
      .pipe(sink())
  )

function loadSampleUiModel (siteSrc) {
  return fs.readFile(path.join(siteSrc, 'ui-model.yml'), 'utf8').then((contents) => yaml.safeLoad(contents))
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
  return vfs.src('helpers/*.js', { base: src, cwd: src }).pipe(
    map((file, enc, next) => {
      handlebars.registerHelper(file.stem, requireFromString(file.contents.toString()))
      next()
    })
  )
}

function compileLayouts (src, layouts) {
  return vfs.src('layouts/*.hbs', { base: src, cwd: src }).pipe(
    map((file, enc, next) => {
      layouts[file.basename] = handlebars.compile(file.contents.toString(), { preventIndent: true })
      next()
    })
  )
}

function toPromise (stream) {
  return new Promise((resolve, reject) => stream.on('error', reject).on('finish', resolve))
}
