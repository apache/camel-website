document.addEventListener('DOMContentLoaded', function () {
  var search = document.getElementById('search')
  if (!search) return
  document.addEventListener('keydown', function (e) {
    if (e.key !== '/' || e.ctrlKey || e.metaKey || e.altKey) return
    var target = e.target
    if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable)) return
    e.preventDefault()
    search.focus()
  })
})
