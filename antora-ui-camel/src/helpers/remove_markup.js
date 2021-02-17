'use strict'

module.exports = (text) => text.replace(/<[^>]*>/g, '').trim()
