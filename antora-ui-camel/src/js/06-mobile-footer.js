document.addEventListener('DOMContentLoaded', function () {
  var footerToggles = Array.prototype.slice.call(document.querySelectorAll('.footer-toggle'), 0)
  if (footerToggles.length === 0) return
  footerToggles.forEach(function (el) {
    el.addEventListener('click', function (e) {
      e.stopPropagation()
      var parent = el.parentElement
      var index = Array.from(parent.parentElement.children).indexOf(parent)
      var element = `.footer dl:nth-child(${index + 1})`
      document.querySelector(`${element} img.show-menu`).classList.toggle('is-active')
      document.querySelector(`${element} img.hide-menu`).classList.toggle('is-active')
      document.querySelector(`${element} .footer-menu`).classList.toggle('is-active')
    })
  })
})
