'use strict'

const url = require('url')
const Readable = require('stream').Readable

function createIndexMiddleware (opts) {
  opts = opts || {}
  return indexMiddleware

  function indexMiddleware (req, res, next) {
    if (
    opts.force ||
    url.parse(req.url).pathname === '/' ||
     /\/index.html?/i.test(req.url)
    ) {
      res.setHeader('content-type', 'text/html')
      res.statusCode = 200
      const stream = new Readable()

      stream.push('<!DOCTYPE html><html><head><meta charset="utf-8">')

      if (opts.title) {
        stream.push('<title>' + opts.title + '</title>')
      }

      if (opts.css) {
        if (typeof opts.css === 'string') opts.css = [opts.css]
        for (let i = 0; i < opts.css.length; i++) {
          stream.push('<link rel="stylesheet" href="' + opts.css[i] + '">')
        }
      }

      stream.push('</head><body>')

      if (opts.script) {
        if (typeof opts.script === 'string') opts.script = [opts.script]
        for (let i = 0; i < opts.script.length; i++) {
          stream.push('<script src="' + opts.script[i] + '"></script>')
        }
      }

      stream.push('</body></html>')
      stream.push(null)
      stream.pipe(res)
    } else {
      next()
    }
  }
}

module.exports = createIndexMiddleware
