;(function () {
  'use strict'

  // The index has no attributeForDistinct and no attributesForFaceting, so both the sub-project
  // exclusion and the per-page dedupe below have to run client side. Fetch deeper than the
  // DocSearch default of 20 so filtering does not starve the result list: for queries like
  // "timer" the default leaves hits from a single page.
  var HITS_PER_PAGE = 50

  // Cap anchors from the same page so one heavily matched document cannot fill a whole group.
  var MAX_HITS_PER_PAGE = 2

  // Sub-projects to exclude from main search - users can browse these directly
  var EXCLUDED_SUBPROJECTS = [
    '/camel-k/',
    '/camel-quarkus/',
    '/camel-spring-boot/',
    '/camel-kafka-connector/',
    '/camel-kamelets/',
    '/camel-karaf/',
  ]

  // Core docs patterns - these should rank higher than component pages
  var CORE_DOCS_PATTERNS = [
    '/manual/',
    '/user-guide/',
    '/architecture/',
    '/getting-started/',
    '/faq/',
  ]

  function matchesAny (url, patterns) {
    if (!url) return false
    return patterns.some(function (pattern) {
      return url.indexOf(pattern) !== -1
    })
  }

  function isSubProjectUrl (url) {
    return matchesAny(url, EXCLUDED_SUBPROJECTS)
  }

  function isCoreDocsUrl (url) {
    return matchesAny(url, CORE_DOCS_PATTERNS)
  }

  function isComponentUrl (url) {
    return url ? url.indexOf('/components/') !== -1 : false
  }

  // Extract the parent page path from a URL (removes anchor and trailing slash)
  function getParentPagePath (url) {
    if (!url) return ''
    var path = url.split('#')[0]
    return path.endsWith('/') ? path.slice(0, -1) : path
  }

  // Keep at most MAX_HITS_PER_PAGE hits per parent page, preserving Algolia's relevance order.
  // The original implementation kept the shallowest hit per page and needed the query to detect a
  // direct parent match; transformItems never receives the query, so cap by page instead.
  function limitHitsPerPage (items) {
    var seen = {}
    return items.filter(function (item) {
      var page = getParentPagePath(item.url)
      seen[page] = (seen[page] || 0) + 1
      return seen[page] <= MAX_HITS_PER_PAGE
    })
  }

  // Sort hits to prioritize core docs over components. DocSearch groups by hierarchy.lvl0 with a
  // plain object keyed in insertion order, so this ordering decides both which group renders first
  // and the order within each group.
  function sortByCoreDocs (items) {
    return items.slice().sort(function (a, b) {
      var aIsCore = isCoreDocsUrl(a.url)
      var bIsCore = isCoreDocsUrl(b.url)
      if (aIsCore !== bIsCore) return aIsCore ? -1 : 1

      var aIsComponent = isComponentUrl(a.url)
      var bIsComponent = isComponentUrl(b.url)
      if (aIsComponent !== bIsComponent) return aIsComponent ? 1 : -1

      return 0
    })
  }

  document.addEventListener('DOMContentLoaded', function () {
    // NOTE the vendor bundle is a separate script tag, so bail out instead of throwing if it
    // failed to load; the rest of site.js runs from the same listener chain.
    if (!window.docsearch || !document.getElementById('docsearch')) return
    window.docsearch({
      container: '#docsearch',
      appId: 'V62SL4FFIW',
      apiKey: '1b7e52df4759e32dd49adedb286997f6',
      indices: [{ name: 'apache_camel', searchParameters: { hitsPerPage: HITS_PER_PAGE } }],
      transformItems: function (items) {
        var filtered = items.filter(function (item) {
          return !isSubProjectUrl(item.url)
        })
        return sortByCoreDocs(limitHitsPerPage(filtered))
      },
    })
  })
})()
