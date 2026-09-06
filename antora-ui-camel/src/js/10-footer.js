;(function () {
  'use strict'

  // Matches the collapse breakpoint in footer.css.
  var COLLAPSES_AT = '(width <= 1024px)'

  // The footer columns collapse on narrow viewports. The control has to be a
  // real button so a screen reader announces expanded/collapsed rather than the
  // checked state of a checkbox, and it has to be absent above the breakpoint,
  // where the links are always visible and a toggle would do nothing. Building
  // it here instead of in the templates keeps both of those true, and leaves the
  // links reachable if this script never runs.
  var headings = [].slice.call(document.querySelectorAll('body > footer .footer-column > dt'))
  if (headings.length === 0) return

  var toggle = function (button) {
    button.setAttribute('aria-expanded', button.getAttribute('aria-expanded') === 'true' ? 'false' : 'true')
  }

  var collapse = function (dt) {
    if (dt.querySelector('.footer-column-toggle')) return
    var button = document.createElement('button')
    button.type = 'button'
    button.className = 'footer-column-toggle'
    button.setAttribute('aria-expanded', 'false')
    while (dt.firstChild) button.appendChild(dt.firstChild)
    button.addEventListener('click', function () {
      toggle(button)
    })
    dt.appendChild(button)
  }

  var expand = function (dt) {
    var button = dt.querySelector('.footer-column-toggle')
    if (!button) return
    while (button.firstChild) dt.appendChild(button.firstChild)
    dt.removeChild(button)
  }

  var query = window.matchMedia(COLLAPSES_AT)

  var sync = function () {
    headings.forEach(query.matches ? collapse : expand)
  }

  sync()
  query.addEventListener('change', sync)
})()
