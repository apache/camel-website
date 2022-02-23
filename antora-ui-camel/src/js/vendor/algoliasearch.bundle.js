;(function () {
  'use strict'

  const algoliasearch = require('algoliasearch/lite')

  window.addEventListener('load', () => {
    const client = algoliasearch('V62SL4FFIW', '1b7e52df4759e32dd49adedb286997f6')
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
              const section = hit.hierarchy.lvl0
              const sectionKey = `${section}-${hit.version || ''}`

              data[sectionKey] = data[sectionKey] || []
              data[sectionKey].name = section
              data[sectionKey].version = hit.version
              data[sectionKey].push({
                url: hit.url,
                section,
                categories: hit.categories,
                breadcrumbs: Object.values(hit.hierarchy).slice(1).filter((lvl) => lvl !== null).join(' / '),
                snippet: hit._highlightResult.content.value,
              })

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
      (sectionKey) => `
                  <div class="result">
                    <div class="heading">
                      <dt>${data[sectionKey].name}</dt>
                      ${(data[sectionKey].version && `<dt class="version">${data[sectionKey].version}</dt>`) || ''}
                    </div>
                    ${data[sectionKey]
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
