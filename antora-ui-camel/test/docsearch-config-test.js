'use strict'

const assert = require('node:assert/strict')
const fs = require('node:fs')
const path = require('node:path')
const test = require('node:test')
const vm = require('node:vm')

const SOURCE = path.join(__dirname, '..', 'src', 'js', '08-docsearch.js')

// NOTE the source is a browser IIFE with no exports, so evaluate it against stubbed globals and
// capture the config it hands to docsearch. That keeps the test on the file we actually ship
// rather than a reimplementation of it.
function loadConfig ({ docsearchLoaded = true, containerPresent = true } = {}) {
  let listener
  let config = null

  const sandboxDocument = {
    addEventListener: (type, fn) => {
      if (type === 'DOMContentLoaded') listener = fn
    },
    getElementById: (id) => (containerPresent && id === 'docsearch' ? {} : null),
  }
  const sandboxWindow = {}
  if (docsearchLoaded) {
    sandboxWindow.docsearch = (value) => {
      config = value
    }
  }

  vm.runInNewContext(fs.readFileSync(SOURCE, 'utf8'), {
    window: sandboxWindow,
    document: sandboxDocument,
  })

  assert.ok(listener, 'expected the source to register a DOMContentLoaded listener')
  listener()
  return config
}

// Mirrors DocSearch 5's own grouping (buildQuerySources in @docsearch/react): it groups the
// transformItems output by hierarchy.lvl0 into a plain object, caps each group, then renders
// Object.values(...) in key insertion order. Ordering we emit therefore decides group order.
function groupByLvl0 (items, maxResultsPerGroup = 5) {
  const groups = items.reduce((acc, item) => {
    const key = item.hierarchy.lvl0
    if (!acc[key]) acc[key] = []
    if (acc[key].length < maxResultsPerGroup) acc[key].push(item)
    return acc
  }, {})
  return Object.values(groups)
}

const fixture = (name) => require(path.join(__dirname, 'fixtures', `algolia-${name}.json`))
const parentPage = (url) => url.split('#')[0].replace(/\/$/, '')

const SUB_PROJECT_PATHS = [
  '/camel-k/',
  '/camel-quarkus/',
  '/camel-spring-boot/',
  '/camel-kafka-connector/',
  '/camel-kamelets/',
  '/camel-karaf/',
]

const FIXTURES = ['timer', 'kamelet', 'routing']

test('bails out when the vendor bundle failed to load', () => {
  // The vendor bundle ships as its own script tag, so a CDN miss or an ad blocker must not throw
  // and take down the rest of the site.js listener chain.
  assert.doesNotThrow(() => loadConfig({ docsearchLoaded: false }))
})

test('bails out when the search container is absent from the page', () => {
  assert.equal(loadConfig({ containerPresent: false }), null)
})

test('over-fetches so the client-side filtering has material to work with', () => {
  // The index has no attributeForDistinct and no attributesForFaceting, so exclusion and dedupe
  // both run after Algolia picks the window of hits. At the DocSearch default of 20 a query like
  // "timer" is left with hits from a single page. See the index-settings follow-up.
  const { searchParameters } = loadConfig().indices[0]

  assert.ok(searchParameters.hitsPerPage >= 50, 'expected to fetch well past the default of 20')
})

for (const name of FIXTURES) {
  test(`excludes sub-project hits for "${name}"`, () => {
    // Sub-projects are browsable directly and otherwise crowd out camel-core docs.
    const items = loadConfig().transformItems(fixture(name).hits)

    const leaked = items.filter((item) => SUB_PROJECT_PATHS.some((p) => item.url.includes(p)))
    assert.deepEqual(leaked.map((item) => item.url), [])
  })

  test(`keeps one page from monopolizing the results for "${name}"`, () => {
    // Algolia indexes every anchor, so a single heavily matched document returns dozens of hits;
    // unchecked, "timer" fills the entire first group with anchors from one page.
    const items = loadConfig().transformItems(fixture(name).hits)

    const perPage = new Map()
    for (const item of items) {
      const page = parentPage(item.url)
      perPage.set(page, (perPage.get(page) || 0) + 1)
    }

    const worst = Math.max(...perPage.values())
    assert.ok(worst <= 2, `expected at most 2 hits per page, got ${worst}`)
  })
}

test('ranks core documentation ahead of component reference pages', () => {
  const items = loadConfig().transformItems(fixture('routing').hits)

  const firstComponent = items.findIndex((item) => item.url.includes('/components/'))
  const lastCoreDoc = items.map((item) => item.url).reduce((last, url, index) => {
    return /\/(manual|user-guide|architecture|getting-started|faq)\//.test(url) ? index : last
  }, -1)

  assert.notEqual(firstComponent, -1, 'fixture should contain component pages')
  assert.notEqual(lastCoreDoc, -1, 'fixture should contain core docs')
  assert.ok(lastCoreDoc < firstComponent, 'every core doc should precede the first component page')
})

test('core documentation survives DocSearch grouping as the first rendered group', () => {
  // Ordering only matters if it outlives groupBy; this is the assertion that would catch a
  // DocSearch change that sorts or re-keys the groups.
  const items = loadConfig().transformItems(fixture('routing').hits)

  const [firstGroup] = groupByLvl0(items)
  assert.equal(firstGroup[0].hierarchy.lvl0, 'User manual')
})
