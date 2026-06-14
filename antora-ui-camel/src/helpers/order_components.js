'use strict'

const order = [
  'manual',
  'camel-core',
  'components',
  'camel-spring-boot',
  'camel-quarkus',
  'camel-kamelets',
  'camel-k',
  'camel-kafka-connector',
  'camel-karaf',
]

module.exports = (components) =>
  Object.entries(components)
    .sort((a, b) => {
      const idxA = order.indexOf(a[0])
      const idxB = order.indexOf(b[0])
      if (idxA !== -1 && idxB !== -1) return idxA - idxB
      if (idxA !== -1) return -1
      if (idxB !== -1) return 1
      return a[0].localeCompare(b[0])
    })
    .reduce((obj, [k, v]) => {
      obj[k] = v
      return obj
    }, {})
