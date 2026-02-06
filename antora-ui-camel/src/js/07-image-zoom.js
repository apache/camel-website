;(function () {
  'use strict'

  var defined = document.querySelectorAll('.blog .post-content img:not(.featured)')
  if (!defined.length) return

  // Create overlay element
  var overlay = document.createElement('div')
  overlay.className = 'image-zoom-overlay'
  document.body.appendChild(overlay)

  function closeZoom () {
    overlay.classList.remove('active')
    overlay.innerHTML = ''
  }

  ;[].slice.call(defined).forEach(function (img) {
    img.addEventListener('click', function (e) {
      e.stopPropagation()
      // Clone the image into the overlay
      var clone = this.cloneNode(true)
      clone.classList.remove('zoomed')
      overlay.innerHTML = ''
      overlay.appendChild(clone)
      overlay.classList.add('active')

      // Close when clicking the cloned image
      clone.addEventListener('click', function (e) {
        e.stopPropagation()
        closeZoom()
      })
    })
  })

  // Close zoomed image when clicking overlay background
  overlay.addEventListener('click', function (e) {
    if (e.target === overlay) {
      closeZoom()
    }
  })

  // Close zoomed image on Escape key
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') {
      closeZoom()
    }
  })
})()
