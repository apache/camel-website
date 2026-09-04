'use strict'

const fs = require('fs')
const path = require('path')
const toml = require('toml')
const matches = /http\S+/

let configPath = path.join(process.cwd(), 'config.toml')
try {
  fs.accessSync(configPath)
} catch (err) {
  configPath = path.resolve(process.cwd(), '../config.toml')
  fs.accessSync(configPath)
}

const data = fs.readFileSync(configPath, 'utf8')
const hugoConfig = toml.parse(data)
const mainMenu = hugoConfig.menu.main

// Hugo orders menu.main by weight, not by its position in config.toml. Sort
// here too, on both levels, so the two renderings cannot silently diverge if
// a weight is ever reordered without moving the corresponding block.
const byWeight = (a, b) => (a.weight || 0) - (b.weight || 0)

const createMenu = (item) => {
  return {
    url: item.url || '#',
    name: item.name,
    children: mainMenu
      .filter((child) => child.parent === item.identifier)
      .sort(byWeight)
      .map(createMenu),
  }
}

const menuData = mainMenu
  .filter((item) => typeof item.parent === 'undefined')
  .sort(byWeight)
  .map(createMenu)

module.exports = (options) => {
  const siteRootPath = options.data.root.siteRootPath
  const mappedMenuData = menuData.map((item) => mapItem(item, siteRootPath))
  // Merge onto the existing data frame instead of replacing it outright:
  // replacing it drops inherited private variables such as @root, which
  // Handlebars templates inside this block need to reach the top-level
  // context (e.g. uiRootPath) from any depth, including inside {{#each}}.
  return options.fn(this, {
    data: Object.assign({}, options.data, {
      items: mappedMenuData,
    }),
  })
}

const mapItem = (item, siteRootPath) => {
  const url = item.url === '#' ? '#' : matches.test(item.url) ? item.url : siteRootPath + item.url
  return {
    url,
    name: item.name,
    children: item.children.map((child) => mapItem(child, siteRootPath)),
  }
}
