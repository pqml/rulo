const url = require('url')
const Readable = require('stream').Readable

function createIndexMiddleware (opts = {}) {
  return indexMiddleware

  function indexMiddleware (req, res, next) {
    if (url.parse(req.url).pathname === '/' || /\/index.html?/i.test(req.url)) {
      res.setHeader('content-type', 'text/html')
      res.statusCode = 200
      const stream = new Readable()
      stream.push(
        '<!DOCTYPE html>' +
        '<html>' +
        '<head>' +
        '<meta charset="utf-8">' +
        '</head>' +
        '<body>' +
        '</body>' +
        '</html>'
      )
      stream.push(null)
      stream.pipe(res)
    } else {
      next()
    }
  }
}

module.exports = createIndexMiddleware
