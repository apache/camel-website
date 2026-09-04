;(function () {
  'use strict'

  var COPIED_MS = 1600

  // DSL tabs on the home page code example.
  var tablist = document.querySelector('.home-tablist')
  if (tablist) {
    var tabs = [].slice.call(tablist.querySelectorAll('.home-tab'))

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
  }

  // Copy-to-clipboard buttons: the home page's hero CLI bar, plus any later
  // page's copy button wired up via [data-copy-value] (e.g. download's CLI
  // install line, post's "Copy link"). Falls back to data-command so the
  // home page's existing markup keeps working with zero changes.
  var copyButtons = [].slice.call(document.querySelectorAll('.home-cli-copy, [data-copy-value]'))
  copyButtons.forEach(function (copy) {
    if (!(window.navigator && window.navigator.clipboard)) {
      copy.remove()
      return
    }
    var idle = copy.textContent
    var timer
    copy.addEventListener('click', function () {
      var value = copy.dataset.copyValue || copy.dataset.command
      window.navigator.clipboard.writeText(value).then(function () {
        copy.textContent = 'Copied!'
        clearTimeout(timer)
        timer = setTimeout(function () {
          copy.textContent = idle
        }, COPIED_MS)
      })
    })
  })
})()
