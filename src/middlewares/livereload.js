const liveReload = require('inject-lr-script')

function createLRMiddleware (opts = {}) {
  return liveReload(opts)
}

module.exports = createLRMiddleware
