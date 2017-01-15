const path = require('path')
const fs = require('fs')
const rollup = require('rollup')
const requireFromString = require('require-from-string')

const defaultOpts = {
  host: 'localhost',
  port: 8080,
  basedir: process.cwd(),
  live: true,
  livePort: 35729,
  watchGlob: '**/*.{html,css}',
  middleware: [],
  pushState: false,
  config: false,
  rollup: {},
  stream: '', // process.stdout
  verbose: false
}

function loadConfigFile (configPath, cb) {
  fs.realpath(configPath, (err, resolvedPath) => {
    if (err) return cb(err)
    rollup.rollup({
      entry: configPath,
      onwarn: message => {
        if (message.code === 'UNRESOLVED_IMPORT') return
        cb(message.toString())
      }
    })
      .then(bundle => {
        const code = bundle.generate({ format: 'cjs' }).code
        const options = requireFromString(code)
        cb(null, options)
      })
      .catch(err => {
        cb(err)
      })
  })
}

function parseOptions (entry, _opts) {
  return new Promise((resolve, reject) => {
    _opts = _opts || {}

    if (_opts.config) {
      const configPath = (typeof _opts.config === 'string')
        ? _opts.config
        : './rollup.config.js'
      loadConfigFile(configPath, next)
    } else {
      next(null, {})
    }

    function next (err, configOpts) {
      if (err) return reject(err)

      // just to avoid some extra dependencies for a deep-assign function
      let opts = Object.assign({}, defaultOpts, _opts)
      opts.rollup = Object.assign({}, configOpts, opts.rollup)

      opts.rollup.watch = Object.assign(
        {},
        configOpts.watch || {},
        (_opts.rollup && _opts.rollup.watch) ? _opts.rollup.watch : {}
      )

      opts.rollup.watch.chokidar = Object.assign(
        {},
        (configOpts.watch && configOpts.watch.chokidar)
        ? configOpts.watch.chokidar : {},
        (_opts.rollup &&
          _opts.rollup.watch &&
          _opts.rollup.watch.chokidar)
        ? _opts.rollup.watch.chokidar : {}
      )

      if (entry && typeof entry === 'string') {
        const splittedEntry = entry.split(':')
        if (splittedEntry.length > 2) return reject('Bad entry syntax.')

        if (opts.rollup.targets) delete opts.rollup.targets
        if (!opts.watch) opts.watch = {}
        opts.rollup.watch.inMemory = true
        opts.rollup.watch.write = false
        opts.rollup.format = 'iife'
        opts.rollup.entry = splittedEntry[0]
        opts.rollup.dest = splittedEntry[1]
          ? splittedEntry[1]
          : splittedEntry[0]
      }
      resolve(opts)
    }
  })
}

module.exports = parseOptions
