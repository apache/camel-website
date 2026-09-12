document.addEventListener('DOMContentLoaded', function () {
  var navbarToggles = Array.prototype.slice.call(document.querySelectorAll('.navbar-burger'), 0)
  if (navbarToggles.length === 0) return
  navbarToggles.forEach(function (el) {
    var menu = document.getElementById(el.dataset.target)
    if (!menu) return

    el.setAttribute('aria-controls', el.dataset.target)
    el.setAttribute('aria-expanded', 'false')

    var setOpen = function (open) {
      el.classList.toggle('is-active', open)
      menu.classList.toggle('is-active', open)
      document.documentElement.classList.toggle('is-clipped--navbar', open)
      el.setAttribute('aria-expanded', open ? 'true' : 'false')
    }

    var close = function (refocus) {
      setOpen(false)
      if (refocus) el.focus()
    }

    el.addEventListener('click', function (e) {
      e.stopPropagation()
      var open = !el.classList.contains('is-active')
      setOpen(open)
      // The menu sits before this button in the DOM, so tabbing on from the
      // button walks straight past the links it just revealed and into the page
      // behind them. Move into the menu so the links are the next stops.
      if (open) {
        var first = menu.querySelector('a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])')
        if (first) first.focus()
      }
    })

    // Escape closes from anywhere inside the menu, or from the button itself,
    // and hands focus back to the button that opened it.
    var onKeydown = function (e) {
      if (e.key !== 'Escape' && e.key !== 'Esc') return
      if (!el.classList.contains('is-active')) return
      e.stopPropagation()
      close(true)
    }

    el.addEventListener('keydown', onKeydown)
    menu.addEventListener('keydown', onKeydown)
  })

  document.documentElement.dataset.scroll = 0
  document.addEventListener('scroll', () => {
    document.documentElement.dataset.scroll = window.scrollY
  })
})
