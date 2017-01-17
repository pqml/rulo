'use strict'

const url = require('url')
const path = require('path')
const Readable = require('stream').Readable
const Emitter = require('events')
const rollup = require('rollup')
const rollupWatch = require('rollup-watch')
const log = require('./log')

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

  function middleware (req, res, next) {
    const filename = url.parse(req.url).pathname.slice(1)
    const ext = path.extname(filename)

    if (filename && filename.length > 0 && files[filename]) {
      res.setHeader('content-type', mimeTypes[ext])
      res.statusCode = 200
      const stream = new Readable()
      stream.push(files[filename])
      stream.push(null)
      stream.pipe(res)
    } else {
      next()
    }
  }

  function bundle (opts) {
    opts = opts || {}
    return new Promise((resolve, reject) => {
      createWatcher(opts.rollup)
        .then(resolvedWatcher => {
          created = true
          watcher = resolvedWatcher
          watcher.on('event', event => {
            switch (event.code) {
              case 'BUILD_START':
                break
              case 'BUILD_END':
                log.info(
                  log.colors.gray(
                    opts.rollup.entry +
                    ' bundled in ' +
                    event.duration + 'ms'
                  )
                )
                files = event.files
                api.emit('bundle_end')
                break
              case 'ERROR':
                const error = event.error
                error.name = 'Rollup Error'

                if (error.message && isErrorCritical(error.message)) {
                  log.exitError(event.error)
                } else {
                  log.error(event.error)
                }

                api.emit('bundle_error')
                break
            }
          })
          resolve()
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
