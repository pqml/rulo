// TODO: Make a proper static middleware, serve-static is too much
const serveStatic = require('serve-static')

function createStaticMiddleware (basedir) {
  return serveStatic(basedir)
}

module.exports = createStaticMiddleware
