'use strict'

const os = require('os')

const path = require('path')
const Emitter = require('events')
const chokidar = require('chokidar')

const ignores = [
  'node_modules/**', 'bower_components/**',
  '.git', '.hg', '.svn', '.DS_Store',
  '*.swp', 'thumbs.db', 'desktop.ini'
]

function fileWatcherWrapper () {
  let watcher
  let closed = false
  let ready = false
  let api = new Emitter()
  api.watch = watch
  api.close = close

  function onAdd (path) {
    api.emit('watch', 'add', path)
  }

  function onChange (path) {
    api.emit('watch', 'change', path)
  }

  function watch (glob, userOpts) {
    const opts = Object.assign({}, {
      usePolling: os.platform() !== 'darwin',
      ignored: ignores,
      ignoreInitial: true,
      cwd: process.cwd()
    }, userOpts)

    watcher = chokidar.watch(glob, opts)
    watcher.on('add', onAdd)
    watcher.on('change', onChange)
    watcher.once('ready', () => {
      ready = true
      if (closed) close()
    })
  }

  function close () {
    closed = true
    if (ready && watcher) {
      let watchedFiles = watcher.getWatched()
      for (let key in watchedFiles) {
        let files = watchedFiles[key]
        for (let file in files) {
          let filePath = path.join(key, file)
          watcher.unwatch(filePath)
        }
      }
      watcher.close()
      watcher = null
    }
  }

  return api
}

module.exports = fileWatcherWrapper
