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

  // Get-started carousel. The track already scrolls and snaps on its own; this
  // shows the arrows and dots and keeps them in step with the visible slide,
  // whether it got there by a click, a swipe, or focus moving into it.
  var carousel = document.querySelector('.home-carousel')
  if (carousel && 'IntersectionObserver' in window) {
    var track = carousel.querySelector('.home-carousel-track')
    var slides = [].slice.call(track.children)
    var prev = carousel.querySelector('.home-carousel-prev')
    var next = carousel.querySelector('.home-carousel-next')
    var dotRow = carousel.querySelector('.home-carousel-dots')
    var dots = [].slice.call(dotRow.children)
    var current = 0

    var goTo = function (index) {
      if (index < 0 || index >= slides.length) return
      track.scrollTo({ left: slides[index].offsetLeft })
    }

    var show = function (index) {
      current = index
      dots.forEach(function (dot, i) {
        if (i === index) dot.setAttribute('aria-current', 'true')
        else dot.removeAttribute('aria-current')
      })
      // aria-disabled rather than disabled, so focus stays on the button when
      // it reaches the last slide instead of dropping back to the page.
      prev.setAttribute('aria-disabled', index === 0 ? 'true' : 'false')
      next.setAttribute('aria-disabled', index === slides.length - 1 ? 'true' : 'false')
    }

    // A slide leaving the view also crosses the threshold, so check the ratio
    // rather than isIntersecting, which stays true for any partial overlap.
    var observer = new window.IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.intersectionRatio >= 0.6) show(slides.indexOf(entry.target))
      })
    }, { root: track, threshold: 0.6 })
    slides.forEach(function (slide) {
      observer.observe(slide)
    })

    prev.addEventListener('click', function () {
      goTo(current - 1)
    })
    next.addEventListener('click', function () {
      goTo(current + 1)
    })
    dots.forEach(function (dot, index) {
      dot.addEventListener('click', function () {
        goTo(index)
      })
    })

    show(0)
    prev.hidden = false
    next.hidden = false
    dotRow.hidden = false
    carousel.classList.add('home-carousel--ready')
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
    var show = function (text) {
      copy.textContent = text
      clearTimeout(timer)
      timer = setTimeout(function () {
        copy.textContent = idle
      }, COPIED_MS)
    }
    copy.addEventListener('click', function () {
      var value = copy.dataset.copyValue || copy.dataset.command
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
