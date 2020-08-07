;(function () {
  'use strict'

  var headings = Array.from(document.querySelectorAll('article.doc h1, article.doc h2, article.doc h3'))
  var links = Array.from(document.querySelectorAll('aside.toc-sidebar .toc-hugo a'))
  var selectorRange = document.querySelector('.toolbar.hugo')
  var minRange = selectorRange.getBoundingClientRect().top + selectorRange.getBoundingClientRect().height
  var maxRange = minRange + 20
  var prevLink = null
  var activeFragment = null

  headings.some((heading, idx) => {
    if (heading.innerText === 'Contents') {
      headings.splice(idx, 1)
      return true
    }
  })

  links.forEach((link) => {
    link.addEventListener('click', function (e) {
      if (prevLink !== null && prevLink !== link) prevLink.classList.remove('is-active')
      e.stopPropagation()
      link.classList.add('is-active')
      prevLink = link
    })
  })

  window.addEventListener('load', function () {
    onscroll()
    window.addEventListener('scroll', onscroll)
  })

  function onscroll () {
    headings.some((heading) => {
      var topVal = heading.getBoundingClientRect().top
      if (topVal >= minRange && topVal <= maxRange) {
        activeFragment = heading.id
        return true
      }
    })

    links.forEach((link) => {
      if (activeFragment !== null && link.href.toString().split('#')[1] === activeFragment) {
        if (prevLink !== null && prevLink !== link) prevLink.classList.remove('is-active')
        link.classList.add('is-active')
        prevLink = link
      }
    })
  }
})()
