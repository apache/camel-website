'use strict'

const { register } = require('@djencks/asciidoctor-jsonpath')

/**
 * Thin wrapper around @djencks/asciidoctor-jsonpath.
 *
 * Antora 3.1.9 added a heuristic that inspects the source text of an extension's
 * register function and warns when its first parameter is literally named
 * 'registry', on the assumption that it is an Asciidoctor extension mistakenly
 * listed under antora.extensions:
 *
 *   ASCIIDOCTOR_REGISTER_FUNCTION_RX = /^(?:(?:function(?: +register)? *)?\( *registry *[,)])/
 *
 * The upstream package is a genuine Antora extension that takes the generator
 * context as its first argument, but it happens to name that parameter
 * 'registry', so it trips the check. Antora still registers it (the warning is
 * advisory), but this playbook sets runtime.log.failure_level to warn, so the
 * warning alone fails the build.
 *
 * The package was last published in 2022 and cannot be fixed upstream, so this
 * wrapper simply forwards to it under a parameter name the heuristic ignores.
 * Keeping register's arity at 2 preserves how Antora invokes it.
 */
module.exports.register = function (context, config) {
  return register.call(this, context, config)
}
