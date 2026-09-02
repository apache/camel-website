'use strict'

const assert = require('node:assert/strict')
const fs = require('node:fs')
const path = require('node:path')
const test = require('node:test')

const SOURCE = path.join(__dirname, '..', 'src', 'css', 'docsearch.css')
const source = fs.readFileSync(SOURCE, 'utf8')

const themeBlock = () => {
  const start = source.indexOf('.DocSearch {')
  assert.notEqual(start, -1, 'expected a .DocSearch rule declaring the theme custom properties')
  return source.slice(start, source.indexOf('}', start))
}

test('declares the theme on .DocSearch rather than :root', () => {
  // postcss-custom-properties resolves every :root custom property in site.css and
  // drop-resolved-custom-properties then deletes the declarations, so a :root block here would be
  // stripped from the build and the vendor stylesheet would keep its Algolia defaults. .DocSearch
  // is on both the launch button and the modal container, so it covers the whole widget.
  assert.match(source, /^\.DocSearch \{/m)
  assert.doesNotMatch(source, /^\s*(:root|html)[\s,{]/m)
})

test('gives the theme custom properties literal values', () => {
  // postcss-custom-properties substitutes var() in ordinary declarations only, not inside custom
  // property declarations, and the palette it would resolve against is stripped from the built
  // stylesheet. A var(--color-...) here would therefore resolve to nothing in the browser and
  // silently leave the widget in Algolia blue.
  const offenders = themeBlock()
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line.startsWith('--') && line.includes('var('))

  assert.deepEqual(offenders, [])
})

test('sizes the search box in rem so the query text is not clipped', () => {
  // The vendor fixes the search box at 56px while sizing its padding and font in rem. This site's
  // root font-size is 18px, not the 16px DocSearch assumes, which collapses the input's content
  // box to 19px around a 25.2px line; overflow-y:clip then cuts the descenders off the query.
  // A rem height keeps the box in step with the text at both root sizes the site uses.
  const block = themeBlock()

  for (const name of ['--docsearch-searchbox-height', '--docsearch-searchbox-initial-height']) {
    const value = new RegExp(`${name}:\\s*([^;]+);`).exec(block)
    assert.ok(value, `expected ${name} to be set`)
    assert.match(value[1].trim(), /rem$/, `${name} must scale with the root font size`)
  }
})

test('restates the vendor properties that are derived from other custom properties', () => {
  // These are declared on the vendor :root as var() references, so the substitution already
  // happened against Algolia's values; descendants inherit the resolved colour and never see the
  // inputs we override. Each one has to be set explicitly or it stays Algolia blue/grey.
  const DERIVED = [
    '--docsearch-hit-focus-background',
    '--docsearch-search-button-text-color',
    '--docsearch-chip-text-color',
    '--docsearch-dropdown-menu-background',
    '--docsearch-dropdown-menu-item-hover-background',
    '--docsearch-menu-trigger-active-background',
    '--docsearch-menu-trigger-active-text-color',
  ]
  const block = themeBlock()

  const missing = DERIVED.filter((name) => !block.includes(`${name}:`))
  assert.deepEqual(missing, [])
})
