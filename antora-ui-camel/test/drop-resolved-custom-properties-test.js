'use strict'

const assert = require('node:assert/strict')
const test = require('node:test')
const postcss = require('postcss')
const postcssVar = require('postcss-custom-properties')
const dropResolvedCustomProperties = require('../gulp.d/lib/drop-resolved-custom-properties')

// NOTE the plugin runs right after postcss-custom-properties with preserve: false, so it may
// only drop definitions that plugin has already substituted into every var() that reads them.
// Anything it leaves behind is still live and dropping it would silently change the styling.
const process = (input) =>
  postcss([postcssVar({ preserve: false }), dropResolvedCustomProperties])
    .process(input, { from: undefined })
    .then(({ css }) => css)

test('drops the resolved definitions from a top-level :root rule', async () => {
  const css = await process(':root { --resolved-color: red; }\n.doc { color: var(--resolved-color); }')

  assert.doesNotMatch(css, /--resolved-color/)
  assert.match(css, /color:\s*red/)
})

test('drops the resolved definitions when :root is part of a selector list', async () => {
  const css = await process(':root,\n:host { --resolved-color: red; }\n.doc { color: var(--resolved-color); }')

  assert.doesNotMatch(css, /--resolved-color/)
  assert.match(css, /color:\s*red/)
})

test('drops the resolved definitions from a top-level html rule but keeps its other declarations', async () => {
  const input = 'html { --resolved-color: red; text-size-adjust: 100%; }\n.doc { color: var(--resolved-color); }'
  const css = await process(input)

  assert.doesNotMatch(css, /--resolved-color/)
  assert.match(css, /text-size-adjust:\s*100%/)
})

test('preserves scoped custom properties, which postcss-custom-properties does not substitute', async () => {
  const css = await process('.DocSearch-FacetPopover { --arrow-width: 12px; width: var(--arrow-width); }')

  assert.match(css, /--arrow-width:\s*12px/)
  assert.match(css, /width:\s*var\(--arrow-width\)/)
})

test('preserves a :root rule nested in an at-rule, which postcss-custom-properties does not substitute', async () => {
  const css = await process('@media (max-width: 768px) { :root { --docsearch-spacing: 10px; } }')

  assert.match(css, /--docsearch-spacing:\s*10px/)
})
