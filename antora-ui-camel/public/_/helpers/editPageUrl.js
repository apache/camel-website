'use strict'

module.exports = (page) => {
  if (page.attributes.source) {
    const idx = page.origin.editUrlPattern.indexOf(page.origin.startPath + '/%s')
    return page.origin.editUrlPattern.substring(0, idx) + page.attributes.source
  }
  return page.editUrl
}
