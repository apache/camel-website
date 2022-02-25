document.addEventListener('DOMContentLoaded', function () {
  var tokenize = function (c) {
    return '.*' + c + '.*'
  }
  var navSearch = document.querySelector('.nav-panel-menu input.search')
  if (!navSearch) {
    return
  }
  var navLinks = document.querySelectorAll('.nav-link')
  navSearch.addEventListener('keyup', function () {
    var tokens = navSearch.value.split('')
    var term = new RegExp(tokens.map(tokenize).join(''), 'i')
    for (var i = 0; i < navLinks.length; i++) {
      var text = navLinks[i].textContent
      var matches = term.test(text)
      var replacement = ''
      if (matches) {
        navLinks[i].classList.remove('filtered')
        if (tokens.length === 0) {
          replacement = text
        } else {
          var prev = 0
          var curr = 0
          for (var j = 0; j < tokens.length; j++) {
            curr = text.toLowerCase().indexOf(tokens[j].toLowerCase(), curr)
            replacement = replacement + text.substring(prev, curr) + '<b>' + text[curr] + '</b>'
            curr++
            prev = curr
          }
          if (curr < text.length) {
            replacement = replacement + text.substring(curr)
          }
        }
      } else {
        navLinks[i].classList.add('filtered')
        replacement = text
      }
      navLinks[i].innerHTML = replacement
    }
  })
})
