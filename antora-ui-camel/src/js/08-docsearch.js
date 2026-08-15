;(function () {
  'use strict'

  // The index has no attributeForDistinct and no attributesForFaceting, so both the sub-project
  // exclusion and the per-page dedupe below have to run client side. Fetch deeper than the
  // DocSearch default of 20 so filtering does not starve the result list: at 20 a query like
  // "timer" is left with hits from a single page. Measured against the live index, 75 lifts
  // "timer" from 5 to 8 distinct pages and "aggregate" from 9 to 13; 100 adds almost nothing
  // beyond that but doubles the response to ~36 KB gzipped.
  var HITS_PER_PAGE = 75

  // Cap anchors from the same page so one heavily matched document cannot fill a whole group.
  // Keep this at 2: DocSearch caps each lvl0 group at 5, so a larger value spends those slots on
  // repeats and yields FEWER distinct pages ("timer" drops from 5 to 4 at a cap of 3).
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

  // Deepest to shallowest, so the first match is the most specific heading for a hit.
  var HIERARCHY_LEVELS = ['lvl6', 'lvl5', 'lvl4', 'lvl3', 'lvl2', 'lvl1', 'lvl0']

  // Give each hit the `type` that DocSearch's standard record extractor would have emitted. This
  // index is not built by that extractor, so records carry no `type`, and DocSearch derives the
  // title from it as `hierarchy.${item.type}` - which becomes the literal 'hierarchy.undefined'
  // and resolves to nothing. Every hit therefore renders with an empty title and collapses into
  // its breadcrumb. Setting type to the deepest populated level restores the heading as the
  // title ("checkCrcs", "maxRequestSize") with the breadcrumb as subtext.
  // This is a workaround; the records should carry `type` (and `anchor`) - see CAMEL-24396.
  function withTitleType (items) {
    return items.map(function (item) {
      var hierarchy = item.hierarchy || {}
      var level = HIERARCHY_LEVELS.find(function (name) {
        return hierarchy[name]
      })
      return Object.assign({}, item, { type: level || 'content' })
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
        return withTitleType(sortByCoreDocs(limitHitsPerPage(filtered)))
      },
    })
  })
})()
