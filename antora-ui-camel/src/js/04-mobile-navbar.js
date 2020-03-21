document.addEventListener('DOMContentLoaded', function () {
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

  var menuDropDowns = Array.prototype.slice.call(document.querySelectorAll('.has-dropdown'), 0)
  var maxMobileWidth = 1023
  menuDropDowns.forEach(function (el) {
    el.addEventListener('click', function (e) {
      var dropDownMenu = el.querySelectorAll('.navbar-dropdown')[0]
      if (window.innerWidth <= maxMobileWidth) {
        if (dropDownMenu.style.display === 'block') {
          dropDownMenu.style.display = 'none'
        } else {
          dropDownMenu.style.display = 'block'
        }
      } else {
        dropDownMenu.style.display = 'none'
      }
    })
  })
})
