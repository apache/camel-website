'use strict'

const vfs = require('vinyl-fs')
const zip = require('@vscode/gulp-vinyl-zip')
const path = require('path')

module.exports = (src, dest, bundleName, onFinish) => () =>
  vfs
    // NOTE encoding: false keeps fonts and images byte-exact; gulp 5 would otherwise decode as UTF-8
    .src('**/*', { base: src, cwd: src, encoding: false })
    .pipe(zip.dest(path.join(dest, `${bundleName}-bundle.zip`)))
    .on('finish', () => onFinish && onFinish(path.resolve(dest, `${bundleName}-bundle.zip`)))
