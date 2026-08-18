'use strict'

const fs = require('fs-extra')
const map = require('../lib/map')
const vfs = require('vinyl-fs')

module.exports = (files) => () =>
  vfs.src(files, { allowEmpty: true }).pipe(map((file, enc, next) => fs.remove(file.path, next)))
