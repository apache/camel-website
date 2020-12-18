'use strict'

module.exports = (elements, del) => {
  const ary = Object.entries(elements)
  const idx = ary.indexOf(del)
  return ary.splice(idx, 1)
}
