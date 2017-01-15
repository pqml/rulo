const Emitter = require('events')
const rollup = require('rollup')
const rollupWatch = require('another-rollup-watch')
const log = require('./log')

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

  const api = new Emitter()
  api.bundle = bundle
  api.close = close

  function bundle (opts) {
    opts = opts || {}
    return new Promise((resolve, reject) => {
      createWatcher(opts)
        .then(resolvedWatcher => {
          created = true
          watcher = resolvedWatcher
          watcher.on('event', event => {
            switch (event.code) {
              case 'BUILD_START':
                break
              case 'BUILD_END':
                log.info(
                  log.colors.gray(opts.entry + ' bundled in ') +
                  event.duration + 'ms'
                )
                api.emit('build')
                break
              case 'ERROR':
                log.error(event.error)
                api.emit('error')
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
