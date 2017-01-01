const stacked = require('stacked')

const log = require('./log')
const serverWrapper = require('./server')
const lrWrapper = require('./tinylr')
const fileWatcherWrapper = require('./filewatcher')
const bundlerWrapper = require('./bundler')
const getPort = require('./getPort')
const getLocalIp = require('./getLocalIp')

const createIndexMiddleware = require('./middlewares/index')
const createStaticMiddleware = require('./middlewares/static')
const createLRMiddleware = require('./middlewares/livereload')

function hashi (entries = [], opts = {}) {
  const bundler = bundlerWrapper()
  const fileWatcher = fileWatcherWrapper()
  const server = serverWrapper()
  const tinylr = lrWrapper()
  let liveReloading = false

  const localip = getLocalIp()
  const app = stacked()
  let started = false

  opts.port = typeof opts.port === 'number' ? opts.port : 8080
  opts.basedir = process.cwd()

  if (entries.length > 0 || 1) {
    // bundler middleware
  }

  function reload (file) {
    if (!liveReloading) return
    tinylr.reload(file)
  }

  function startFileWatcher () {
    fileWatcher.watch(opts.watchGlob, {})
    fileWatcher.on('watch', (event, file) => reload(file))
    return Promise.resolve()
  }

  function startBundler () {
    return new Promise((resolve, reject) => {
      // if (!opts.entries) return
      bundler.bundle(opts)
        .then(resolve)
        .catch(reject)
      bundler.on('build', reload)
    })
  }

  function startLiveReload () {
    return new Promise((resolve, reject) => {
      // if (!opts.live) return resolve()
      tinylr.create()
        .then(() => getPort(opts.livePort))
        .then(availablePort => { opts.livePort = availablePort })
        .then(() => tinylr.listen(opts.livePort))
        .then(() => {
          liveReloading = true
          resolve()
        })
        .catch(reject)
    })
  }

  function setupMiddlewares () {
    if (liveReloading) {
      app.use(createLRMiddleware({port: opts.livePort}))
    }
    app.use(createStaticMiddleware(opts.basedir))
    app.use(createIndexMiddleware())
    return Promise.resolve
  }

  startLiveReload()
    .then(() => startFileWatcher())
    .then(() => startBundler())
    .then(() => { setupMiddlewares() })
    .then(() => server.create(app))
    .then(() => getPort(opts.port))
    .then(availablePort => { opts.port = availablePort })
    .then(() => server.listen(opts.port))
    .then(() => { started = true })
    .then(() => { log.info(`Server running on http://${localip}:${opts.port}`) })
    .catch((err) => log.error(err))

  function close () {
    if (server && started) server.close()
  }

  return {
    close
  }
}

module.exports = hashi
