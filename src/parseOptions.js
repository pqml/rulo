const path = require('path')
const fs = require('fs')
const rollup = require('rollup')
const requireFromString = require('require-from-string')

const cwd = process.cwd()

const defaultOpts = {
  host: 'localhost',
  port: 8080,
  basedir: cwd,
  live: true,
  livePort: 35729,
  watchGlob: '**/*.{html,css}',
  middleware: [],
  pushState: false,
  config: false,
  index: {
    title: 'rulo',
    css: null,
    script: null,
    force: false
  },
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
      opts.basedir = path.resolve(cwd, opts.basedir)
      opts.index = Object.assign({}, defaultOpts.index, opts.index)
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
          : opts.rollup.entry

        // normalize entry path from cwd (rollup behaviour)
        // normalize dest path from opts.basedir (rulo behaviour)
        // opts.rollup.entry = path.resolve(cwd, splittedEntry[0])
        // opts.rollup.dest = splittedEntry[1]
        //   ? path.resolve(opts.basedir, splittedEntry[1])
        //   : opts.rollup.entry
      } else {
      // normalize path from cwd (rollup behaviour)
      //   if (opts.rollup.entry) {
      //     opts.rollup.entry = path.resolve(cwd, opts.rollup.entry)
      //   }
      //   if (opts.rollup.dest) {
      //     opts.rollup.dest = path.resolve(cwd, opts.rollup.dest)
      //   }
      //   if (opts.rollup.targets) {
      //     opts.rollup.targets = opts.rollup.targets.map(el => {
      //       if (el.dest) el.dest = path.resolve(cwd, el.dest)
      //       return el
      //     })
      //   }
      }

      if (!opts.index.script) {
        if (entry && typeof entry === 'string') {
          opts.index.script = '/' + opts.rollup.dest
        } else {
          if (opts.rollup.targets) {
            opts.index.script = []
            for (let i = 0; i < opts.rollup.targets.length; i++) {
              if (!opts.rollup.targets[i].dest) continue
              opts.index.script.push(
                '/' +
                path.relative(opts.basedir, opts.rollup.targets[i].dest)
              )
              // for now, use only the first bundle produced.
              break
            }
          } else if (opts.rollup.dest) {
            opts.index.script = (
              '/' +
              path.relative(opts.basedir, opts.rollup.dest)
            )
          }
        }
      }

      resolve(opts)
    }
  })
}

module.exports = parseOptions
