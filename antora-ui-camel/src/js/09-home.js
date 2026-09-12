;(function () {
  'use strict'

  var COPIED_MS = 1600

  // Tabs on the home page: the get-started paths in the hero and the DSL tabs
  // on the code example. Each tablist drives only its own tabs and panels.
  ;[].slice.call(document.querySelectorAll('.home [role="tablist"]')).forEach(function (tablist) {
    var tabs = [].slice.call(tablist.querySelectorAll('[role="tab"]'))

    var select = function (tab, focus) {
      tabs.forEach(function (candidate) {
        var selected = candidate === tab
        candidate.setAttribute('aria-selected', selected ? 'true' : 'false')
        candidate.setAttribute('tabindex', selected ? '0' : '-1')
        var panel = document.getElementById(candidate.getAttribute('aria-controls'))
        if (panel) panel.hidden = !selected
      })
      if (focus) tab.focus()
    }

    tabs.forEach(function (tab, index) {
      tab.addEventListener('click', function () {
        select(tab, false)
      })
      tab.addEventListener('keydown', function (event) {
        var next
        if (event.key === 'ArrowRight') next = tabs[(index + 1) % tabs.length]
        else if (event.key === 'ArrowLeft') next = tabs[(index - 1 + tabs.length) % tabs.length]
        else if (event.key === 'Home') next = tabs[0]
        else if (event.key === 'End') next = tabs[tabs.length - 1]
        if (!next) return
        event.preventDefault()
        select(next, true)
      })
    })
  })

  // Copy-to-clipboard buttons on any page, wired up via [data-copy-value]
  // (e.g. the home page's get-started and example panels, download's CLI
  // install line, post's "Copy link").
  var copyButtons = [].slice.call(document.querySelectorAll('[data-copy-value]'))
  copyButtons.forEach(function (copy) {
    if (!(window.navigator && window.navigator.clipboard)) {
      copy.remove()
      return
    }
    var idle = copy.textContent
    var timer
    var show = function (text) {
      copy.textContent = text
      clearTimeout(timer)
      timer = setTimeout(function () {
        copy.textContent = idle
      }, COPIED_MS)
    }
    copy.addEventListener('click', function () {
      var value = copy.dataset.copyValue
      // writeText rejects when the page is not focused or the embedder denies
      // clipboard access; say so instead of leaving the button silent.
      window.navigator.clipboard.writeText(value).then(function () {
        show('Copied!')
      }, function () {
        show('Copy failed')
      })
    })
  })
})()
