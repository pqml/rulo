'use strict'

const liveReload = require('inject-lr-script')

function createLRMiddleware (opts) {
  opts = opts || {}
  return liveReload(opts)
}

module.exports = createLRMiddleware
