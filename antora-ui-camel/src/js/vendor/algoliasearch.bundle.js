;(function () {
  'use strict'

  const algoliasearch = require('algoliasearch/lite')

  const MAX_SNIPPET_LENGTH = 200
  const RESULTS_LIMIT = 10
  const MAX_INPUT_LENGTH = 200

  // Sub-projects to exclude from main search - users can browse these directly
  const EXCLUDED_SUBPROJECTS = [
    '/camel-k/',
    '/camel-quarkus/',
    '/camel-spring-boot/',
    '/camel-kafka-connector/',
    '/camel-kamelets/',
    '/camel-karaf/',
  ]

  // Core docs patterns - these should rank higher than component pages
  const CORE_DOCS_PATTERNS = [
    '/manual/',
    '/user-guide/',
    '/architecture/',
    '/getting-started/',
    '/faq/',
  ]

  // Check if a URL belongs to a sub-project that should be filtered out
  function isSubProjectUrl (url) {
    if (!url) return false
    return EXCLUDED_SUBPROJECTS.some(function (subproject) {
      return url.indexOf(subproject) !== -1
    })
  }

  // Check if a URL points to core documentation (should rank higher)
  function isCoreDocsUrl (url) {
    if (!url) return false
    return CORE_DOCS_PATTERNS.some(function (pattern) {
      return url.indexOf(pattern) !== -1
    })
  }

  // Check if a URL points to component documentation
  function isComponentUrl (url) {
    if (!url) return false
    return url.indexOf('/components/') !== -1
  }

  // Sort hits to prioritize core docs over components
  function sortByCoreDocs (hits) {
    return hits.sort(function (a, b) {
      var aIsCore = isCoreDocsUrl(a.url)
      var bIsCore = isCoreDocsUrl(b.url)
      var aIsComponent = isComponentUrl(a.url)
      var bIsComponent = isComponentUrl(b.url)

      // Core docs first
      if (aIsCore && !bIsCore) return -1
      if (!aIsCore && bIsCore) return 1

      // Components last
      if (aIsComponent && !bIsComponent) return 1
      if (!aIsComponent && bIsComponent) return -1

      return 0
    })
  }

  // Extract the parent page path from a URL (removes anchor and trailing segments)
  function getParentPagePath (url) {
    if (!url) return ''
    // Remove anchor fragment
    var path = url.split('#')[0]
    // Normalize trailing slash
    if (path.endsWith('/')) {
      path = path.slice(0, -1)
    }
    return path
  }

  // Check if hit represents a sub-section of a page (has anchor or deeper hierarchy)
  function isSubSection (hit) {
    if (!hit || !hit.url) return false
    return hit.url.indexOf('#') !== -1
  }

  // Get the breadcrumb depth (number of hierarchy levels)
  function getBreadcrumbDepth (hit) {
    if (!hit || !hit.hierarchy) return 0
    return Object.values(hit.hierarchy).filter(function (lvl) {
      return lvl !== null
    }).length
  }

  // Remove duplicate results for the same parent page
  // When parent page is a direct match, exclude its sub-sections
  function deduplicateHits (hits, query) {
    var seenPages = {}
    var parentMatches = {}
    var queryLower = (query || '').toLowerCase().trim()

    // First pass: identify parent pages that match the query directly
    hits.forEach(function (hit) {
      var parentPath = getParentPagePath(hit.url)
      var hierarchy = hit.hierarchy || {}

      // Check if any top-level hierarchy matches the search query
      var lvl1 = (hierarchy.lvl1 || '').toLowerCase()
      var lvl0 = (hierarchy.lvl0 || '').toLowerCase()

      if (lvl1 && lvl1.indexOf(queryLower) !== -1) {
        parentMatches[parentPath] = true
      }
      if (lvl0 && lvl0.indexOf(queryLower) !== -1) {
        parentMatches[parentPath] = true
      }
    })

    // Second pass: filter out sub-sections when parent is already matched
    return hits.filter(function (hit) {
      var parentPath = getParentPagePath(hit.url)
      var isSubSec = isSubSection(hit)
      var depth = getBreadcrumbDepth(hit)

      // If this is a sub-section and parent page already matched, skip it
      if (isSubSec && parentMatches[parentPath]) {
        // Only keep the main page hit, not sub-sections
        if (seenPages[parentPath]) {
          return false
        }
      }

      // For component pages, only show the main entry (depth <= 2)
      if (isComponentUrl(hit.url) && depth > 2 && seenPages[parentPath]) {
        return false
      }

      // Track that we've seen this parent page
      if (!seenPages[parentPath]) {
        seenPages[parentPath] = { depth: depth, hit: hit }
        return true
      }

      // If we already have this page, only keep if it's a better match (shallower)
      if (depth < seenPages[parentPath].depth) {
        seenPages[parentPath] = { depth: depth, hit: hit }
        return true
      }

      return false
    })
  }

  function truncateHighlightedHtml (html, maxChars) {
    if (!html || maxChars <= 0) return ''

    const template = document.createElement('template')
    template.innerHTML = html

    let remaining = maxChars
    let truncated = false

    const TEXT_NODE = 3
    const ELEMENT_NODE = 1

    function cloneUntilLimit (node) {
      if (remaining <= 0) return null

      if (node.nodeType === TEXT_NODE) {
        const text = node.nodeValue || ''
        if (text.length <= remaining) {
          remaining -= text.length
          return document.createTextNode(text)
        }
        truncated = true
        const slice = text.slice(0, remaining)
        remaining = 0
        return document.createTextNode(slice)
      }

      if (node.nodeType === ELEMENT_NODE) {
        const el = node
        const cloned = el.cloneNode(false)
        for (const child of Array.from(el.childNodes)) {
          if (remaining <= 0) break
          const childClone = cloneUntilLimit(child)
          if (childClone) cloned.appendChild(childClone)
        }
        return cloned
      }

      return null
    }

    const outFragment = document.createDocumentFragment()
    for (const child of Array.from(template.content.childNodes)) {
      if (remaining <= 0) break
      const childClone = cloneUntilLimit(child)
      if (childClone) outFragment.appendChild(childClone)
    }
    if (truncated) outFragment.appendChild(document.createTextNode('…'))

    const container = document.createElement('div')
    container.appendChild(outFragment)
    return container.innerHTML
  }

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

    // Enforce max input length as backup to HTML maxlength attribute
    search.addEventListener('input', function () {
      if (search.value.length > MAX_INPUT_LENGTH) {
        search.value = search.value.substring(0, MAX_INPUT_LENGTH)
      }
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
        var searchQuery = search.value
        index
          .search(searchQuery, {
            hitsPerPage: 50,
          })
          .then((results) => {
            // Filter out sub-project results to focus on camel-core documentation
            const filteredHits = results.hits.filter(function (hit) {
              return !isSubProjectUrl(hit.url)
            })
            // Remove duplicate results for the same parent page
            const dedupedHits = deduplicateHits(filteredHits, searchQuery)
            // Sort to prioritize core docs over components and limit results
            const sortedHits = sortByCoreDocs(dedupedHits).slice(0, RESULTS_LIMIT)
            const data = sortedHits.reduce((data, hit) => {
              const section = hit.hierarchy.lvl0
              const sectionKey = `${section}-${hit.version || ''}`

              data[sectionKey] = data[sectionKey] || []
              data[sectionKey].name = section
              data[sectionKey].version = hit.version
              data[sectionKey].push({
                url: hit.url,
                section,
                categories: hit.categories,
                breadcrumbs: Object.values(hit.hierarchy)
                  .slice(1)
                  .filter((lvl) => lvl !== null)
                  .join(' / '),
                snippet: truncateHighlightedHtml(hit._highlightResult.content.value, MAX_SNIPPET_LENGTH),
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
