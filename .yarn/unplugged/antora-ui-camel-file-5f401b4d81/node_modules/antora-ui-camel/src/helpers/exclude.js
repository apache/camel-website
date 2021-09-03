'use strict'

module.exports = (elements, del) => Object.fromEntries(Object.entries(elements).filter(([k, v]) => v.name !== del))
