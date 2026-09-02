'use strict'

// NOTE postcss-custom-properties only substitutes the custom properties declared by a
// top-level :root or html rule; scoped rules and :root rules nested inside an at-rule are
// left alone. Only those substituted definitions are dead, so only those may be dropped.
const RESOLVED_SELECTORS = [':root', 'html']

module.exports = {
  postcssPlugin: 'camel-drop-resolved-custom-properties',
  OnceExit (css) {
    css.each((node) => {
      if (node.type !== 'rule' || !node.selectors.some((it) => RESOLVED_SELECTORS.includes(it))) return
      node.walkDecls(/^--/, (decl) => decl.remove())
      node.nodes.length || node.remove()
    })
  },
}
