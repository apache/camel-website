;(function () {
  'use strict'

  const algoliasearch = require('algoliasearch/lite')

  window.addEventListener('load', () => {
    const client = algoliasearch('BH4D9OD16A', '16e3a9155a136e4962dc4c206f8278bd')
    const index = client.initIndex('apache_camel')
    const search = document.querySelector('#search')
    const container = search.parentNode
    const results = document.querySelector('#search_results')
    const cancel = document.querySelector('#search-cancel')

    function debounce (fn, wait) {
      var timeout
      return function () {
        var context = this
        var args = arguments
        var later = () => {
          timeout = null
          fn.apply(context, args)
        }
        clearTimeout(timeout)
        timeout = setTimeout(later, wait)
      }
    }

    search.addEventListener('click', function (e) {
      e.stopPropagation()
    })

    search.addEventListener(
      'keyup',
      debounce((key) => {
        if (search.value.trim() === '') {
          container.className = 'navbar-search results-hidden'
          results.innerHTML = ''
          cancel.style.display = 'none'
          return
        }
        if (key.which === 27) {
          container.className = 'navbar-search results-hidden'
          results.innerHTML = ''
          return
        }
        cancel.style.display = 'block'
        index
          .search(search.value, {
            hitsPerPage: 5,
          })
          .then((results) => {
            const hits = results.hits
            const data = hits.reduce((data, hit) => {
              const d = {}
              d.url = hit.url
              var section = hit.hierarchy.lvl0
              if (hit.hierarchy.lvl6 !== null) section = section + '/' + hit.hierarchy.lvl6
              var breadcrumbs = Object.values(hit.hierarchy)
                .slice(1)
                .filter((lvl) => lvl !== null)
                .join(' / ')

              d.breadcrumbs = ((breadcrumbs !== '') ? breadcrumbs : section)
              d.snippet = hit._snippetResult.content.value.split('&quot;').join('') + '...'

              data[section] = data[section] || []
              data[section].push(d)

              return data
            }, {})

            return data
          })
          .then((data) => {
            if (Object.entries(data).length === 0 && data.constructor === Object) {
              return `
              <header class="no_search_results">No results found for "${search.value}"</header>
              <div class="footer-search">
                <h4 id="algolia">Search By</h4>
                <img src="/_/img/algolia.svg" />
              </div>
              `
            } else {
              return `
              <dl>
                ${Object.keys(data)
    .map(
      (section) => `
                  <div class="result">
                    <div class="heading">
                      <dt>${section.split('/')[0]}</dt>
                      <dt class="version">${section.split('/')[1]}</dt>
                    </div>
                    ${data[section]
    .map(
      (hit) => `
                    <a href="${hit.url}">
                      <dd>
                        <header class="result_header">${hit.breadcrumbs}</header>
                        <summary class="result_summary">${hit.snippet}</summary>
                      </dd>
                    </a>
                  `
    )
    .join('')}
                </div>`
    )
    .join('')}
              </dl>
              <div class="footer-search">
                <h4 id="algolia">Search By</h4>
                <img src="/_/img/algolia.svg" />
              </div>
              `
            }
          })
          .then((markup) => {
            results.innerHTML = markup
            Array.from(results.querySelectorAll('.version')).forEach((version) => {
              if (version.innerHTML === 'undefined') {
                version.style.display = 'none'
              }
            })
            container.className = 'navbar-search'
          })
      }, 150)
    )
    window.addEventListener(
      'mouseup',
      debounce((element) => {
        if (element.target !== container && element.target.parentNode !== container) {
          container.className = 'navbar-search results-hidden'
          results.innerHTML = ''
        }
      }),
      150
    )
    cancel.addEventListener('click', function (e) {
      e.stopPropagation()
      container.className = 'navbar-search results-hidden'
      results.innerHTML = ''
      search.value = ''
      cancel.style.display = 'none'
    })
  })
})()
