'use strict'

const PluginError = require('plugin-error')
const { pipeline } = require('node:stream/promises')
const { run } = require('node:test')
const { spec: Spec } = require('node:test/reporters')
const { Writable } = require('node:stream')
const vfs = require('vinyl-fs')
const { objectTransform: map } = require('through2')

// NOTE run() from node:test rather than spawning `node --test`, so gulp settles on the returned
// promise and a failing test fails the task it is sequenced into. The reporter is piped to stdout
// with end: false, since closing stdout would take the rest of the gulp run down with it.
module.exports = (files) => async () => {
  const paths = []
  await pipeline(
    vfs.src(files, { read: false }),
    map((file, enc, next) => next(null, paths.push(file.path) && file)),
    new Writable({ objectMode: true, write: (file, enc, next) => next() })
  )
  if (!paths.length) throw new PluginError('test', `no test files matched ${[].concat(files).join(', ')}`)

  let failed = 0
  const events = run({ files: paths.sort() }).on('test:fail', ({ todo }) => todo || failed++)
  await pipeline(events.compose(new Spec()), process.stdout, { end: false })
  if (failed) throw new PluginError('test', `${failed} test${failed === 1 ? '' : 's'} failed`)
}
