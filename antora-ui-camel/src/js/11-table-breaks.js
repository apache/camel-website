;(function () {
  'use strict'

  // Option tables hold long single tokens with no natural break points:
  // property names such as camel.main.streamCachingRemoveSpoolDirectoryWhenStopping,
  // fully qualified class names, enum constants, classpath lists. A column can
  // never be narrower than its longest unbreakable token, so without break
  // points the Name, Default and Type columns widen to fit theirs and the table
  // takes the difference out of Description, or overflows the doc column (e.g.
  // AUTO_ACKNOWLEDGE and MessageListenerContainerFactory on the ActiveMQ page).
  // This inserts <wbr> after . , / : _ and before each camel-case hump in any
  // identifier of MIN_TOKEN characters or more, in every column, so a long one
  // wraps at a sensible place first. The page is still correct if this never
  // runs; doc.css keeps a floor on the first column.
  //
  // Identifiers are also kept from being hyphenated. doc.css turns on
  // hyphens: auto for the docs, and in a narrow column the browser hyphenated
  // identifiers at a syllable (local-host:61616, PooledCon-nectionFactory,
  // ex-cludePattern), which reads as part of the name. Each identifier (a
  // camel-case hump, or one of . , / : _ between two characters) of IDENT_MIN
  // characters or more goes into a span.identifier, which doc.css sets to
  // hyphens: none; from MIN_TOKEN characters it also gets the break points,
  // prose included, so it wraps at a hump or separator with no hyphen. Plain
  // words stay outside the span and hyphenate as before.
  var MIN_TOKEN = 12
  var IDENT_MIN = 5
  var SEPARATOR = /([.,/:_])/
  var HUMP = /([a-z0-9])(?=[A-Z])/g
  var IDENTIFIER = /[a-z0-9][A-Z]|\S[.,/:_]\S/
  var MARK = '\u0000'

  var breakToken = function (token, parent) {
    token.split(SEPARATOR).forEach(function (part) {
      if (!part) return
      if (SEPARATOR.test(part) && part.length === 1) {
        parent.appendChild(document.createTextNode(part))
        parent.appendChild(document.createElement('wbr'))
        return
      }
      // Mark each hump and split on the mark. Splitting on HUMP itself also
      // returns the captured letter as its own piece, which put a break one
      // letter early (additiona|l|Sensitiv|e).
      part.replace(HUMP, '$1' + MARK).split(MARK).forEach(function (hump, i, humps) {
        parent.appendChild(document.createTextNode(hump))
        if (i < humps.length - 1) parent.appendChild(document.createElement('wbr'))
      })
    })
  }

  var breakTextNode = function (node) {
    var text = node.nodeValue
    if (!new RegExp('[^\\s]{' + IDENT_MIN + ',}').test(text)) return
    var fragment = document.createDocumentFragment()
    var changed = false
    text.split(/(\s+)/).forEach(function (token) {
      if (token.length >= IDENT_MIN && IDENTIFIER.test(token)) {
        var identifier = document.createElement('span')
        identifier.className = 'identifier'
        if (token.length >= MIN_TOKEN) breakToken(token, identifier)
        else identifier.textContent = token
        fragment.appendChild(identifier)
        changed = true
      } else if (token) {
        fragment.appendChild(document.createTextNode(token))
      }
    })
    if (changed) node.parentNode.replaceChild(fragment, node)
  }

  ;[].slice.call(document.querySelectorAll('.doc table.tableblock td')).forEach(function (cell) {
    var walker = document.createTreeWalker(cell, window.NodeFilter.SHOW_TEXT)
    var nodes = []
    while (walker.nextNode()) {
      if (!walker.currentNode.parentNode.closest('pre')) nodes.push(walker.currentNode)
    }
    nodes.forEach(breakTextNode)
  })
})()
