const fs = require('fs');
const path = require('path');
const toml = require('toml');
const Handlebars = require('handlebars');

const data = fs.readFileSync(path.join(__dirname, 'config.toml'), 'utf8');
const hugoConfig = toml.parse(data);
const mainMenu = hugoConfig.menu.main;

const createMenu = item => {
  return {
    url: item.url || '#',
    name: item.name,
    children: mainMenu.filter(child => child.parent === item.identifier).map(createMenu)
  }
}

const menuData = mainMenu.filter(item => typeof(item.parent) === 'undefined').map(createMenu);

Handlebars.registerHelper('withMenuData', (options) => {
  return options.fn(this, {
    data: {
      items: menuData
    }
  });
});

