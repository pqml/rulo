const fs = require('fs')
const Emitter = require('events')
const rollup = require('rollup')
const rollupWatch = require('another-rollup-watch')
const requireFromString = require('require-from-string')
const log = require('./log')

function loadConfigFile (configPath) {
  return new Promise((resolve, reject) => {
    fs.realpath(configPath, (err, resolvedPath) => {
      if (err) return reject(err)
      rollup.rollup({
        entry: configPath,
        onwarn: message => {
          if (message.code === 'UNRESOLVED_IMPORT') return
          reject(message.toString())
        }
      })
        .then(bundle => {
          const code = bundle.generate({ format: 'cjs' }).code
          const options = requireFromString(code)
          resolve(options)
        })
        .catch(err => {
          reject(err)
        })
    })
  })
}

function parseOptions (entries, options) {
  return new Promise((resolve, reject) => {
    // if we need to load a config
    const configPath = 'rollup.config.js'
    loadConfigFile(configPath)
      .then(options => {
        resolve(options)
      })
      .catch(reject)
  })
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

  const api = new Emitter()
  api.bundle = bundle
  api.close = close

  function bundle (entries = [], options = {}) {
    return new Promise((resolve, reject) => {
      parseOptions(entries, options)
        .then(resolvedOpts => createWatcher(resolvedOpts))
        .then(resolvedWatcher => {
          created = true
          watcher = resolvedWatcher
          watcher.on('event', event => {
            switch (event.code) {
              case 'BUILD_START':
                break
              case 'BUILD_END':
                log.info('Rollup > bundled in ' + event.duration + 'ms')
                api.emit('build')
                break
              case 'ERROR':
                log.error('Rollup Error', event.error)
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
