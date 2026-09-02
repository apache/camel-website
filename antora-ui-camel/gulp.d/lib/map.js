'use strict'

const { Transform } = require('node:stream')

// NOTE this is the object-mode Transform that through2's obj() built, inlined so the theme does not
// carry the dependency. through2 5 is ESM only and cannot be require()d below Node 22.12, and every
// call site here only ever wanted a plain Transform. The default transform makes map() a
// passthrough, matching through2's behaviour when it is called with no arguments.
module.exports = (transform = (chunk, enc, next) => next(null, chunk), flush) =>
  new Transform({ objectMode: true, transform, flush })
