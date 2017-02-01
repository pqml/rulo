'use strict'

const url = require('url')
const path = require('path')
const Readable = require('stream').Readable
const Emitter = require('events')
const rollup = require('rollup')
const rollupWatch = require('another-rollup-watch')
const log = require('./log')
const errorOverlayFn = require('./errorOverlay')

const cwd = process.cwd()

const criticalErrors = [
  /^Could not resolve entry/i
]

function isErrorCritical (err) {
  for (let i = 0; i < criticalErrors.length; i++) {
    const reg = criticalErrors[i]
    if (reg.test(err)) return true
  }
  return false
}

const mimeTypes = {
  '.js': 'application/javascript',
  '.map': 'application/json',
  '.css': 'text/css',
  '.html': 'text/html'
}

function createWatcher (options, resolve, reject) {
  return new Promise((resolve, reject) => {
    if (!options.entry || (!options.dest && !options.targets)) {
      reject(new Error('Missing input or output for the bundler'))
    }
    const watcher = rollupWatch(rollup, options)
    resolve(watcher)
  })
}

function bundlerWrapper () {
  let created = false
  let watcher = null
  let files = {}

  const api = new Emitter()
  api.bundle = bundle
  api.close = close
  api.middleware = middleware

  function servedURL (basedir, filepath) {
    return '/' + path.relative(basedir, path.resolve(cwd, filepath))
      .split(path.sep)
      .filter(v => v !== '..' && v !== '' && v !== '.')
      .join('/')
  }

  function middleware (req, res, next) {
    const filename = url.parse(req.url).pathname
    const ext = path.extname(filename)
    // serve last memory-bundled file
    if (filename && filename.length > 0 && files[filename]) {
      res.setHeader('content-type', mimeTypes[ext])
      res.statusCode = 200
      const stream = new Readable()
      stream.push(files[filename])
      stream.push(null)
      stream.pipe(res)
    // not for this middleware
    } else {
      next()
    }
  }

  function bundle (opts) {
    opts = opts || {}

    // save outputs to use the error handler
    let domReporting = opts.overlay
    let dests = opts.rollup.dest
      ? [servedURL(opts.basedir, opts.rollup.dest)]
      : opts.rollup.targets.map(target => servedURL(opts.basedir, target.dest))

    // override onwarn options to catch & log warning events
    let onwarncb = typeof opts.rollup.onwarn === 'function'
      ? opts.rollup.onwarn
      : function () {}

    opts.rollup.onwarn = function (msg) {
      log.warn(msg)
      onwarncb(msg)
    }

    return new Promise((resolve, reject) => {
      createWatcher(opts.rollup)
        .then(resolvedWatcher => {
          created = true
          watcher = resolvedWatcher
          watcher.on('event', event => {
            switch (event.code) {
              case 'BUILD_START':
                api.emit('bundle_start')
                break
              case 'BUILD_END':
                log.info(
                  log.colors.gray(
                    opts.rollup.entry +
                    ' bundled in ' +
                    event.duration + 'ms'
                  )
                )
                files = {}

                for (let k in event.files) {
                  files[servedURL(opts.basedir, k)] = event.files[k]
                }
                api.emit('bundle_end')
                break
              case 'ERROR':
                const error = event.error
                error.name = 'Rollup Error'

                log.error(event.error)

                if (error.message && isErrorCritical(error.message)) {
                  api.emit('bundle_fatal_error', error)
                }

                if (error && domReporting) {
                  files = {}
                  const errScript = errorOverlayFn({
                    name: error.name || 'Rollup Error',
                    message: error.message || '',
                    stack: error.stack || ''
                  })
                  dests.forEach(v => { files[v] = errScript })
                }
                api.emit('bundle_error', error)
                break
            }
          })
          return resolve()
        })
        .catch(reject)
    })
  }

  function close () {
    if (created && watcher) watcher.close()
  }

  return api
}

module.exports = bundlerWrapper
