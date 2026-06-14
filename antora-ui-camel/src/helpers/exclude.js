'use strict'

module.exports = (elements, ...args) => {
  const del = new Set(args.slice(0, -1))
  return Object.fromEntries(Object.entries(elements).filter(([k, v]) => !del.has(v.name)))
}
