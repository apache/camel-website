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

    search.addEventListener('keyup', debounce((key) => {
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
      index.search(search.value, {
        hitsPerPage: 10,
      })
        .then((results) => {
          const hits = results.hits
          const data = hits.reduce((data, hit) => {
            const d = {}
            d.url = hit.url
            d.breadcrumbs = Object.values(hit.hierarchy).slice(1).filter((lvl) => lvl !== null).join(' &raquo; ')
            if (hit._snippetResult !== undefined) {
              d.snippet = hit._snippetResult.content.value
            } else {
              d.snippet = ''
            }

            const section = hit.hierarchy.lvl0
            data[section] = data[section] || []
            data[section].push(d)

            return data
          }, {})

          return data
        })
        .then((data) => {
          if (Object.entries(data).length === 0 && data.constructor === Object) {
            return `
              <header>Nothing Found</header>
              `
          } else {
            return `
              <dl>
                ${Object.keys(data).map((section) => `
                  <dt>${section}</dt>
                  ${data[section].map((hit) => `
                    <a href="${hit.url}">
                      <dd>
                        <header class="result_header">${hit.breadcrumbs}</header>
                        <summary class="result_summary">${hit.snippet}</summary>
                      </dd>
                    </a>
                  `).join('')}
                `).join('')}
              </dl>
              `
          }
        })
        .then((markup) => {
          results.innerHTML = markup
          container.className = 'navbar-search'
        })
    }, 150))
    window.addEventListener('mouseup', debounce((element) => {
      if (element.target !== container && element.target.parentNode !== container) {
        container.className = 'navbar-search results-hidden'
        results.innerHTML = ''
      }
    }), 150)
    cancel.addEventListener('click', function () {
      container.className = 'navbar-search results-hidden'
      results.innerHTML = ''
      search.value = ''
      cancel.style.display = 'none'
    })
  })
})()
