document.addEventListener('DOMContentLoaded', function () {
  var search = document.getElementById('search')
  if (!search) return
  document.addEventListener('keydown', function (e) {
    if (e.key !== '/' || e.ctrlKey || e.metaKey || e.altKey) return
    var target = e.target
    if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable)) return
    // Only swallow the key when the field could take focus (it is hidden in
    // the closed docs drawer and on narrow Hugo headers).
    search.focus()
    if (document.activeElement === search) e.preventDefault()
  })
})
