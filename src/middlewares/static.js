'use strict'

const serveStatic = require('serve-static')

function createStaticMiddleware (basedir) {
  return serveStatic(basedir)
}

module.exports = createStaticMiddleware
