const Emitter = require('events')
const stacked = require('stacked')

const log = require('./log')
const hashiDefaults = require('./hashiDefaults')
const serverWrapper = require('./server')
const lrWrapper = require('./tinylr')
const fileWatcherWrapper = require('./filewatcher')
const bundlerWrapper = require('./bundler')
const getPort = require('./getPort')
const getLocalIp = require('./getLocalIp')

const createIndexMiddleware = require('./middlewares/index')
const createStaticMiddleware = require('./middlewares/static')
const createLRMiddleware = require('./middlewares/livereload')
const faviconMiddleware = require('./middlewares/favicon')
const pushStateMiddleware = require('./middlewares/pushstate')

function hashi (entries = [], userOpts = {}) {
  const api = new Emitter()
  api.close = close

  const bundler = bundlerWrapper()
  const fileWatcher = fileWatcherWrapper()
  const server = serverWrapper()
  const tinylr = lrWrapper()
  let liveReloading = false

  const localip = getLocalIp()
  const app = stacked()

  let opts = Object.assign({}, hashiDefaults, userOpts)

  opts.live = !!opts.live
  opts.pushstate = !!opts.pushstate
  opts.port = opts.port | 0

  function reload (file) {
    if (!liveReloading) return
    tinylr.reload(file)
  }

  function startFileWatcher () {
    fileWatcher.watch(opts.watchGlob, { cwd: opts.basedir })
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
        .then(() => tinylr.listen(opts.livePort, opts.host))
        .then(() => {
          liveReloading = true
          resolve()
        })
        .catch(reject)
    })
  }

  function setupMiddlewares () {
    opts.middleware.forEach(middleware => {
      if (typeof middleware !== 'function') {
        throw new Error('middleware options must be functions')
      }
      app.use(middleware)
    })

    if (opts.pushstate) app.use(pushStateMiddleware)

    if (liveReloading) {
      app.use(createLRMiddleware({
        port: opts.livePort,
        host: opts.host
      }))
    }

    app.use(createStaticMiddleware(opts.basedir))
    app.use(createIndexMiddleware())

    app.mount('/favicon.ico', faviconMiddleware)

    return Promise.resolve
  }

  startLiveReload()
    .then(() => startFileWatcher())
    .then(() => startBundler())
    .then(() => { setupMiddlewares() })
    .then(() => server.create(app))
    .then(() => getPort(opts.port))
    .then(availablePort => { opts.port = availablePort })
    .then(() => server.listen(opts.port, opts.host))
    .then(() => { log.info(`Server running on http://${opts.host}:${opts.port}`) })
    .then(() => { log.info(`Local server on http://${localip}:${opts.port}`) })
    .catch((err) => log.error(err))

  function close () {
    tinylr.close()
    fileWatcher.close()
    bundler.close()
    server.close()
  }

  return api
}

module.exports = hashi
