;(function () {
  'use strict'

  var headings = Array.from(document.querySelectorAll('article.doc h1, article.doc h2, article.doc h3'))
  var links = Array.from(document.querySelectorAll('aside.toc-sidebar .toc-menu a'))
  var selectorRange = document.querySelector('.static.toolbar')
  if (selectorRange) {
    var minRange = selectorRange.getBoundingClientRect().top + selectorRange.getBoundingClientRect().height - 5
    var maxRange = minRange + 25
    var prevLink = null
    var activeFragment = null
    var fragmentIndex

    headings.some((heading, idx) => {
      if (heading.innerText === 'Contents') {
        headings.splice(idx, 1)
        return true
      }
    })

    window.addEventListener('load', function () {
      onscroll()
      window.addEventListener('scroll', onscroll)
    })
  }

  function onscroll () {
    headings.some((heading, idx) => {
      var topVal = Math.ceil(heading.getBoundingClientRect().top)
      if (topVal >= minRange && topVal <= maxRange) {
        activeFragment = heading
        fragmentIndex = idx
        return true
      }
      if (activeFragment !== null && topVal < minRange && topVal > activeFragment.getBoundingClientRect().top) {
        activeFragment = heading
        fragmentIndex = idx
      }
    })

    if (activeFragment !== null && Math.ceil(headings[fragmentIndex].getBoundingClientRect().top) > maxRange) {
      --fragmentIndex
      activeFragment = headings[fragmentIndex]
      if (fragmentIndex === -1) {
        activeFragment = null
      }
    }
    links.some((link) => {
      if (activeFragment != null && activeFragment.id === link.href.toString().split('#')[1]) {
        if (prevLink !== null && prevLink !== link) prevLink.classList.remove('is-active')
        link.classList.add('is-active')
        prevLink = link
      }
      if ((activeFragment === null || fragmentIndex === 0) && prevLink !== null) {
        prevLink.classList.remove('is-active')
      }
    })
  }
})()
