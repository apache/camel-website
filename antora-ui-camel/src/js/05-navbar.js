document.addEventListener('DOMContentLoaded', function () {
  var navbar = document.querySelector('nav.navbar')
  var navbarToggles = Array.prototype.slice.call(document.querySelectorAll('.navbar-burger'), 0)
  if (navbarToggles.length === 0) return
  navbarToggles.forEach(function (el) {
    el.addEventListener('click', function (e) {
      e.stopPropagation()
      el.classList.toggle('is-active')
      document.getElementById(el.dataset.target).classList.toggle('is-active')
      document.documentElement.classList.toggle('is-clipped--navbar')
    })
  })

  window.addEventListener('scroll', function () {
    if (this.scrollY <= 30) navbar.classList.remove('scrolled')
    else navbar.classList.add('scrolled')
  })
})
