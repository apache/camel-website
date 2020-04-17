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

const createMenu = (item) => {
  return {
    url: item.url || '#',
    name: item.name,
    children: mainMenu.filter((child) => child.parent === item.identifier).map(createMenu),
  }
}

const menuData = mainMenu.filter((item) => (typeof (item.parent) === 'undefined')).map(createMenu)

module.exports = (options) => {
  const siteRootPath = options.data.root.siteRootPath
  const mappedMenuData = menuData.map((item) => mapItem(item, siteRootPath))
  return options.fn(this, {
    data: {
      items: mappedMenuData,
    },
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
