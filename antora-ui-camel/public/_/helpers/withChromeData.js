'use strict'

const fs = require('fs')
const path = require('path')
const yaml = require('js-yaml')

const absolute = /^(?:https?:)?\/\//

let dataPath = path.join(process.cwd(), 'data', 'chrome.yaml')
try {
  fs.accessSync(dataPath)
} catch (err) {
  dataPath = path.resolve(process.cwd(), '..', 'data', 'chrome.yaml')
  fs.accessSync(dataPath)
}

// js-yaml 4's load() uses the safe schema by default; safeLoad was removed in
// v4 because it became redundant. This is not PyYAML's unsafe load.
const chromeData = yaml.load(fs.readFileSync(dataPath, 'utf8'))

const mapLink = (link, siteRootPath) => {
  return Object.assign({}, link, {
    url: absolute.test(link.url) ? link.url : siteRootPath + link.url,
  })
}

module.exports = (options) => {
  const siteRootPath = options.data.root.siteRootPath
  // Merge onto the existing data frame instead of replacing it outright:
  // replacing it drops inherited private variables such as @root, which
  // Handlebars templates inside this block need to reach the top-level
  // context (e.g. uiRootPath) from any depth, including inside {{#each}}.
  return options.fn(this, {
    data: Object.assign({}, options.data, {
      brand: chromeData.brand,
      columns: chromeData.columns.map((column) => ({
        title: column.title,
        id: column.id,
        links: column.links.map((link) => mapLink(link, siteRootPath)),
      })),
      social: chromeData.social.map((link) => mapLink(link, siteRootPath)),
      legal: chromeData.legal.map((link) => mapLink(link, siteRootPath)),
    }),
  })
}
