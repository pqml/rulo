'use strict'

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
      usePolling: userOpts && userOpts.poll,
      ignored: ignores,
      ignoreInitial: true,
      cwd: process.cwd()
    }, userOpts)

    ready = true
    watcher = chokidar.watch(glob, opts)
    watcher.on('add', onAdd)
    watcher.on('change', onChange)
    if (closed) close()
  }

  function close () {
    closed = true
    if (ready && watcher) watcher.close()
  }

  return api
}

module.exports = fileWatcherWrapper
