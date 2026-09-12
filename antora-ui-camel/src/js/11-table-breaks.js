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
  // token of MIN_TOKEN characters or more, in every column, so a long token
  // wraps at a sensible place first. The page is still correct if this never
  // runs; doc.css keeps a floor on the first column.
  //
  // Text that runs as prose (more than one word, as in Description) only gets
  // breaks in tokens of PROSE_MIN_TOKEN characters or more. It already wraps
  // between words, and the browser takes a <wbr> as readily as a space, so
  // "Use the excludePattern property" would split as exclude|Pattern across
  // two lines and read as two words. A token of PROSE_MIN_TOKEN is about as
  // wide as the narrowest Description column, so it cannot wrap whole anyway,
  // and leaving it unbroken overflows the table (on the Main page:
  // classpath:camel/,classpath:camel-template/,classpath:camel-rest/*,
  // org.apache.camel.support.PatternHelper#matchPattern, docs URLs).
  var MIN_TOKEN = 12
  var PROSE_MIN_TOKEN = 24
  var SEPARATOR = /([.,/:_])/
  var HUMP = /([a-z0-9])(?=[A-Z])/g
  var HAS_HUMP = /[a-z0-9][A-Z]/
  var MARK = '\u0000'

  var breakToken = function (token, fragment) {
    token.split(SEPARATOR).forEach(function (part) {
      if (!part) return
      if (SEPARATOR.test(part) && part.length === 1) {
        fragment.appendChild(document.createTextNode(part))
        fragment.appendChild(document.createElement('wbr'))
        return
      }
      // Mark each hump and split on the mark. Splitting on HUMP itself also
      // returns the captured letter as its own piece, which put a break one
      // letter early (additiona|l|Sensitiv|e).
      part.replace(HUMP, '$1' + MARK).split(MARK).forEach(function (hump, i, humps) {
        fragment.appendChild(document.createTextNode(hump))
        if (i < humps.length - 1) fragment.appendChild(document.createElement('wbr'))
      })
    })
  }

  var breakTextNode = function (node) {
    var text = node.nodeValue
    var min = /\S\s+\S/.test(text) ? PROSE_MIN_TOKEN : MIN_TOKEN
    if (!new RegExp('[^\\s]{' + min + ',}').test(text)) return
    var fragment = document.createDocumentFragment()
    text.split(/(\s+)/).forEach(function (token) {
      if (token.length >= min && (SEPARATOR.test(token) || HAS_HUMP.test(token))) {
        breakToken(token, fragment)
      } else if (token) {
        fragment.appendChild(document.createTextNode(token))
      }
    })
    node.parentNode.replaceChild(fragment, node)
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
