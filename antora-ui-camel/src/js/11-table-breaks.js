;(function () {
  'use strict'

  // Option tables hold long single tokens with no natural break points:
  // property names such as camel.main.streamCachingRemoveSpoolDirectoryWhenStopping,
  // fully qualified class names, classpath lists. Without break points the
  // browser either widens that column to fit the token, squeezing the
  // Description column, or, once the table is under pressure, breaks the token
  // one character per line. This inserts <wbr> after . , / : in any token of
  // MIN_TOKEN characters or more, and before each camel-case hump in the first
  // column, so a long token wraps at a sensible place first. The page is still
  // correct if this never runs; doc.css keeps a floor on the first column.
  var MIN_TOKEN = 20
  var SEPARATOR = /([.,/:])/
  var HUMP = /([a-z0-9])(?=[A-Z])/g
  var HAS_HUMP = /[a-z0-9][A-Z]/

  var breakToken = function (token, firstColumn, fragment) {
    token.split(SEPARATOR).forEach(function (part) {
      if (!part) return
      if (SEPARATOR.test(part) && part.length === 1) {
        fragment.appendChild(document.createTextNode(part))
        fragment.appendChild(document.createElement('wbr'))
        return
      }
      if (!firstColumn) {
        fragment.appendChild(document.createTextNode(part))
        return
      }
      part.split(HUMP).forEach(function (hump, i, humps) {
        if (!hump) return
        fragment.appendChild(document.createTextNode(hump))
        if (i < humps.length - 1) fragment.appendChild(document.createElement('wbr'))
      })
    })
  }

  var breakTextNode = function (node, firstColumn) {
    var text = node.nodeValue
    if (!new RegExp('[^\\s]{' + MIN_TOKEN + ',}').test(text)) return
    var fragment = document.createDocumentFragment()
    text.split(/(\s+)/).forEach(function (token) {
      if (token.length >= MIN_TOKEN && (SEPARATOR.test(token) || (firstColumn && HAS_HUMP.test(token)))) {
        breakToken(token, firstColumn, fragment)
      } else if (token) {
        fragment.appendChild(document.createTextNode(token))
      }
    })
    node.parentNode.replaceChild(fragment, node)
  }

  ;[].slice.call(document.querySelectorAll('.doc table.tableblock td')).forEach(function (cell) {
    var firstColumn = !cell.previousElementSibling
    var walker = document.createTreeWalker(cell, window.NodeFilter.SHOW_TEXT)
    var nodes = []
    while (walker.nextNode()) {
      if (!walker.currentNode.parentNode.closest('pre')) nodes.push(walker.currentNode)
    }
    nodes.forEach(function (node) {
      breakTextNode(node, firstColumn)
    })
  })
})()
