'use strict'

const { register } = require('@djencks/asciidoctor-antora-indexer')

/**
 * Thin wrapper around @djencks/asciidoctor-antora-indexer.
 *
 * See extensions/asciidoctor-jsonpath.js for why this wrapper exists: Antora
 * 3.1.9+ warns when an extension's register function names its first parameter
 * 'registry', and runtime.log.failure_level is set to warn, so that advisory
 * warning fails the build. Forwarding under a different parameter name avoids
 * the heuristic without changing behaviour.
 */
module.exports.register = function (context, config) {
  return register.call(this, context, config)
}
