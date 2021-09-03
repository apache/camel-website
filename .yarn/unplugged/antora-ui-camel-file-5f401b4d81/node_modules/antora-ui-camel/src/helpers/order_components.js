'use strict'

module.exports = (components) => Object.entries(components).sort((a, b) => {
  const nameA = a[0]
  const nameB = b[0]

  if (nameA === 'manual') {
    return -1
  }
  if (nameB === 'manual') {
    return 1
  }

  if (nameA === 'components') {
    return -1
  }
  if (nameB === 'components') {
    return 1
  }

  return nameA.localeCompare(nameB)
}).reduce((obj, [k, v]) => {
  obj[k] = v
  return obj
}, {})
