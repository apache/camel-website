;(function () {
  'use strict'

  var parent
  var child = []
  var lastActiveLink = null
  var selector = document.querySelector('.toolbar')
  var headings = Array.from(document.querySelectorAll('article.doc h1, article.doc h2, article.doc h3'))
  var links = Array.from(document.querySelectorAll('aside.toc-sidebar .toc-hugo a'))
  var width = document.querySelector('.navbar').offsetWidth
  var parentSelector = document.querySelectorAll('.toc-hugo li ul:first-child')

  var topValMin = selector.getBoundingClientRect().top + selector.getBoundingClientRect().height - 5
  var topValMax = topValMin + 20
  var lastActiveFragment = headings[0]
  var activeFragment = lastActiveFragment
  var detectedFragment = false
  var fragmentIndex = 0

  headings.some((heading, idx) => {
    if (heading.innerText === 'Contents') {
      headings.splice(idx, 1)
      return true
    }
  })
  createDataLevel()
  function createDataLevel () {
    if (parentSelector) {
      parent = (width < 1024) ? Array.from(parentSelector[0].children) : Array.from(parentSelector[1].children)
      parent.forEach(function (subParent) {
        var subParentSelector = subParent.querySelector('ul')
        if (subParentSelector) child = Array.from(subParentSelector.children)
        if (child.length >= 1) {
          child.forEach(function (base) {
            base.setAttribute('data-level', '2')
          })
        }
      })
    }
  }

  window.addEventListener('load', function () {
    onScroll()
    window.addEventListener('scroll', onScroll)
  })

  function onScroll () {
    headings.some((heading, idx) => {
      detectedFragment = false
      var topVal = Math.ceil(heading.getBoundingClientRect().top)
      if (topVal >= topValMin && topVal <= topValMax) {
        detectedFragment = true
        lastActiveFragment = activeFragment
        activeFragment = heading
        fragmentIndex = idx
        return true
      }
    })
    if (!detectedFragment) {
      if (Math.ceil(headings[fragmentIndex].getBoundingClientRect().top) > topValMax) {
        if (fragmentIndex !== 0) {
          lastActiveFragment = headings[fragmentIndex]
          --fragmentIndex
          activeFragment = headings[fragmentIndex]
        }
        fragmentIndex = headings.indexOf(activeFragment)
      } else {
        lastActiveFragment = activeFragment
      }
    }
    if (window.pageYOffset + window.innerHeight + 2 >= document.documentElement.scrollHeight) {
      ++fragmentIndex
      lastActiveFragment = activeFragment
      activeFragment = headings[fragmentIndex]
    }
    if (fragmentIndex !== 0) {
      links.some((link) => {
        var linkId = link.href.toString().split('#')[1]
        if (activeFragment.id === linkId) {
          if (lastActiveLink !== null && lastActiveLink !== link) lastActiveLink.classList.remove('is-active')
          lastActiveLink = link
          link.classList.add('is-active')
          return true
        }
      })
    }
    if (fragmentIndex === 0 && lastActiveLink !== null) {
      lastActiveLink.classList.remove('is-active')
    }
  }
})()
