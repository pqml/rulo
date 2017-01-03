const path = require('path')
const fs = require('fs')

const Emitter = require('events')
const chokidar = require('chokidar')

const opts = { encoding: 'utf-8', persistent: true }

function moduleWatcher (userOpts = {}) {
  const opts = Object.assign({}, {
    ignoreInitial: true
    //cwd: process.cwd()
  }, userOpts)

  const emitter = new Emitter()
  let watched = {}
  let created = false
  let closed = false
  let watcher = null

  const api = {
    on: emitter.on.bind(emitter),
    watched,
    add,
    remove,
    close
  }

  return api

  function onWatch (event, modulePath) {
    modulePath = path.resolve(opts.cwd, modulePath)
    const changedModule = watched[modulePath]
    if (!changedModule) return
    if (event === 'rename' || event === 'unlink') {
      remove(modulePath)
        .then(() => { emitter.emit('watch') })
        .catch(err => { throw err })
    } else {
      fs.readFile(modulePath, 'utf-8', (err, data) => {
        if (err) {} // TODO: handle error
        if (data !== module.originalCode) {
          module.originalCode = data
          emitter.emit('watch')
        }
      })
    }
  }

  function add (moduleObj) {
    return new Promise((resolve, reject) => {
      if (closed) return resolve()
      const id = moduleObj.id
      // skip plugin helper modules
      if (/\0/.test(id)) return resolve()
      fs.realpath(id, (err, modulePath) => {
        if (err) return resolve() // file doesn't exist, don't watch it
        if (!watched[modulePath]) {
          if (!created) {
            watcher = chokidar.watch(modulePath, opts)
            watcher.on('all', onWatch)
          } else {
            watcher.add(modulePath)
          }
        }
        watched[modulePath] = moduleObj
        resolve()
      })
    })
  }

  function remove (moduleObj) {
    return new Promise((resolve, reject) => {
      if (!created || closed) return resolve()
      const id = moduleObj.id
      fs.realpath(id, (err, modulePath) => {
        if (err) {} // file doesn't exist
        if (!watched[modulePath]) return resolve()
        watcher.unwatch(modulePath)
        delete watched[modulePath]
      })
    })
  }

  function close () {
    if (closed) return
    if (created) watcher.close()
    closed = true
  }
}

function rollupWatch (rollup, opts) {
  const dests = opts.dest
    ? [path.resolve(opts.dest)]
    : opts.targets.map(target => path.resolve(target.dest))
  // TODO skip dest from add to the watcher
  const watcher = moduleWatcher(opts.chokidarOpts || {})
  watcher.on('watch', debouncedRebuild)

  let rebuildScheduled = false
  let building = false
  let watching = false
  let closed = false

  let timer
  let cache

  const api = new Emitter()
  api.close = close

  // build on next tick, so consumers can listen for BUILD_START
  process.nextTick(build)

  return api

  function debouncedRebuild () {
    clearTimeout(timer)
    rebuildScheduled = true
    timer = setTimeout(() => {
      if (!building) {
        rebuildScheduled = false
        build()
      }
    }, 50)
  }

  function build () {
    if (building || closed) return

    let start = Date.now()
    let initial = !watching
    const buildOpts = Object.assign({}, opts)
    if (cache) buildOpts.cache = cache

    api.emit('event', { code: 'BUILD_START' })
    building = true

    rollup.rollup(buildOpts)
      .then(bundle => {
        return new Promise((resolve, reject) => {
          cache = bundle
          if (closed) return resolve(bundle)
          let p = []
          for (let i = 0; i < bundle.modules.length; i++) {
            const module = bundle.modules[i]
            p.push(watcher.add(module))
          }
          Promise.all(p)
            .then(() => {
              watching = true
              resolve(bundle)
            })
            .catch(reject)
        })
      })
      .then(bundle => {
        return new Promise((resolve, reject) => {
          if (buildOpts.targets) {
            let p = []
            for (let i = 0; i < buildOpts.targets.length; i++) {
              const target = buildOpts.targets[i]
              const mergedOpts = Object.assign({}, buildOpts, target)
              p.push(bundle.write(mergedOpts))
            }
            Promise.all(p)
              .then(() => resolve(bundle))
              .catch(reject)
          } else if (buildOpts.dest) {
            bundle.write(buildOpts)
              .then(() => resolve(bundle))
              .catch(reject)
          } else { // todo: in-memory generation with bundle.generate().code
            resolve(bundle)
          }
        })
      })
      .then(bundle => {
        api.emit('event', {
          code: 'BUILD_END',
          duration: Date.now() - start,
          initial,
          bundle
        })
      }, error => {
        api.emit('event', {
          code: 'ERROR',
          error
        })
      })
      .then(() => {
        building = false
        if (rebuildScheduled && !closed) build()
      })
  }

  function close () {
    if (!closed) watcher.close()
    closed = true
  }
}

module.exports = rollupWatch
