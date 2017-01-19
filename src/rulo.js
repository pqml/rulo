'use strict'

const ruloVersion = require('../package.json').version
const Emitter = require('events')
const stacked = require('stacked')

const log = require('./log')
const serverWrapper = require('./server')
const lrWrapper = require('./tinylr')
const fileWatcherWrapper = require('./filewatcher')
const bundlerWrapper = require('./bundler')
const getPort = require('./getPort')
const getLocalIp = require('./getLocalIp')
const parseOptions = require('./parseOptions')

const createIndexMiddleware = require('./middlewares/index')
const createStaticMiddleware = require('./middlewares/static')
const createLRMiddleware = require('./middlewares/livereload')
const faviconMiddleware = require('./middlewares/favicon')
const pushStateMiddleware = require('./middlewares/pushstate')

function rulo (entry, _opts) {
  let opts = {}
  _opts = _opts || {}

  // setup log right now
  if (_opts.stream) log.setStream(_opts.stream)
  if (_opts.verbose) log.setLevel('debug')

  const api = new Emitter()
  api.close = close

  const bundler = bundlerWrapper()
  const fileWatcher = fileWatcherWrapper()
  const server = serverWrapper()
  const tinylr = lrWrapper()

  const localip = getLocalIp()
  const app = stacked()

  let liveReloading = false

  log.info(log.emoji('cyclone') + log.colors.blue(' version ' + ruloVersion))

  parseOptions(entry, _opts)
    .then(resolvedOpts => { opts = resolvedOpts })
    .then(() => startLiveReload())
    .then(() => startFileWatcher())
    .then(() => startBundler())
    .then(() => setupMiddlewares())
    .then(() => server.create(app))
    .then(() => getPort(opts.port))
    .then(availablePort => { opts.port = availablePort })
    .then(() => server.listen(opts.port, opts.host))
    .then(() => {
      log.hr(21)
      log.success('Server is running on port ' + opts.port)
      log.info(
        log.colors.gray('↳  Local URL     ') +
        log.colors.underline('http://' + opts.host + ':' + opts.port)
      )
      log.info(
        log.colors.gray('↳  External URL  ') +
        log.colors.underline('http://' + localip + ':' + opts.port)
      )
      log.hr(21)
    })
    .catch((err) => log.exitError(err))

  return api

  function reload (file) {
    if (!liveReloading) return
    tinylr.reload(file)
  }

  function startFileWatcher () {
    // No need to watch file if there is no glob or live option
    if (!opts.live || opts.watchGlob) return Promise.resolve()
    fileWatcher.watch(opts.watchGlob, { cwd: opts.basedir })
    fileWatcher.on('watch', (event, file) => reload(file))
    return Promise.resolve()
  }

  function startBundler () {
    return new Promise((resolve, reject) => {
      // if there is no entry for rollup, rulo act as a static server
      if (!opts.rollup || !opts.rollup.entry) {
        log.warn('No entry file. Rulo will act as a static server')
        return resolve()
      }
      bundler.bundle(opts)
        .then(resolve)
        .catch(reject)
      bundler.on('bundle_end', reload)
    })
  }

  function startLiveReload () {
    return new Promise((resolve, reject) => {
      // if no live parameter, don't start liveReload
      if (!opts.live) return resolve()
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

    if (opts.rollup && opts.rollup.entry) app.use(bundler.middleware)

    if (opts.pushstate) app.use(pushStateMiddleware)

    if (liveReloading) {
      app.use(createLRMiddleware({
        port: opts.livePort,
        host: opts.host
      }))
    }

    app.use(createStaticMiddleware(opts.basedir))
    app.use(createIndexMiddleware(opts.index))

    app.mount('/favicon.ico', faviconMiddleware)

    return Promise.resolve()
  }

  function close () {
    tinylr.close()
    fileWatcher.close()
    bundler.close()
    server.close()
  }
}

module.exports = rulo
