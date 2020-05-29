;(function () {
  'use strict'

  var MutationObserver = window.MutationObserver
  var width = window.innerWidth
  var navToggle = document.getElementsByClassName('nav-toggle')[0]
  var toggleObserver = new MutationObserver(toggleWidthChange)
  var config = {
    attributes: true,
    childList: true,
  }

  if (width >= 975 && width < 1024) {
    if (navToggle) toggleObserver.observe(navToggle, config)
  } else if (width < 975) {
    var nav = document.getElementsByClassName('nav')[0]
    if (navToggle) {
      navToggle.addEventListener('click', function () {
        nav.style.width = width.toString() + 'px'
      })
    }
  }

  function toggleWidthChange (mutations, _) {
    var target = mutations[0].target
    var className = target.getAttribute('class')
    var condn = className.indexOf('is-active')
    var el = document.getElementsByClassName('doc')[0]
    condn > -1 ? openToggle(el) : closeToggle(el)
  }

  function openToggle (el) {
    el.style.marginRight = '2rem'
  }

  function closeToggle (el) {
    el.style.marginRight = 'auto'
  }
})()
