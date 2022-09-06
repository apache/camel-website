'use strict'

const { readFileSync } = require('fs')
const connect = require('gulp-connect')
const os = require('os')
const path = require('path')

const ANY_HOST = '0.0.0.0'
const URL_RX = /(https?):\/\/(?:[^/: ]+)(:\d+)?/

let base

module.exports = (root, opts = {}, watch = undefined) => (done) => {
  base = root
  connect.server({ ...opts, middleware, root }, function () {
    this.server.on('close', done)
    if (watch) watch()
  })
}

function middleware (_, app) {
  decorateLog(_, app)

  return [versionedResources]
}

function versionedResources (req, res, next) {
  // parse for each request to fetch the latest revisions
  const rev = JSON.parse(readFileSync(path.join(base, '_', 'data', 'rev-manifest.json')))
  const pathname = req.originalUrl.substring(3) // remove leading '/_/'
  const replacement = rev[pathname]
  if (replacement) {
    req.url = req.originalUrl.replace(pathname, replacement)
  }
  return next()
}

function decorateLog (_, app) {
  if (app.host !== ANY_HOST) {
    return
  }

  const _log = app.log
  app.log = (msg) => {
    if (msg.startsWith('Server started ')) {
      const localIp = getLocalIp()
      const replacement = '$1://localhost$2' + (localIp ? ` and $1://${localIp}$2` : '')
      msg = msg.replace(URL_RX, replacement)
    }
    _log(msg)
  }
}

function getLocalIp () {
  for (const records of Object.values(os.networkInterfaces())) {
    for (const record of records) {
      if (!record.internal && record.family === 'IPv4') return record.address
    }
  }
  return 'localhost'
}
