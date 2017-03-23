#! /usr/bin/env node

'use strict'

const minimist = require('minimist')
const parseRollupArgs = require('./parseRollupArgs')
const rulo = require('../src/rulo')
const log = require('../src/log')

const ruloVersion = require('../package.json').version
const rollupVersion = require('rollup/package.json').version
const rollupWatchVersion = require('another-rollup-watch/package.json').version
const help = require('./help')

const args = process.argv.slice(2)

const minimistOpts = {
  boolean: [
    'noOverlay',
    'noLive',
    'pushState',
    'version',
    'verbose',
    'quiet'
  ],
  string: [
    'entry',
    'dest',
    'format',
    'moduleName',
    'host',
    'port',
    'livePort',
    'basedir',
    'watchGlob'
  ],
  default: {
    live: true
  },
  alias: {
    entry: ['i', 'input'],
    dest: ['o', 'output'],
    format: 'f',
    moduleName: ['n', 'module-name'],
    config: 'c',
    port: 'p',
    basedir: 'd',
    help: 'h',
    version: 'V',
    verbose: 'v',
    quiet: 'q',
    host: 'H',
    noLive: 'no-live',
    noOverlay: 'no-overlay',
    pushState: 'P',
    watchGlob: [ 'wg', 'watch-glob' ],
    livePort: ['L', 'live-port']
  },
  '--': true
}

const argv = minimist(args, minimistOpts)

if (argv.version) {
  log.info('rulo v' + ruloVersion)
  log.info('rollup v' + rollupVersion)
  log.info('rollup-watch v' + rollupWatchVersion)
  process.exit(0)
}

if (argv.help) {
  log.info(help())
  process.exit(0)
}

if (argv.version !== undefined) delete argv.version
if (argv.help !== undefined) delete argv.help

// setup entry
// let entry
// if (argv._ && argv._[0]) {
//   entry = argv._[0]
//   if (entry.split(':').length > 2) {
//     log.exitError('Bad syntax on entry')
//   }
// }
delete argv._

// get rollup options
const rollupOptions = parseRollupArgs(argv['--'])
delete argv['--']

// keep only real options
const keys = Object.keys(minimistOpts.alias)
let cliOptions = {}
keys.forEach(key => {
  if (
  argv.hasOwnProperty(key) !== undefined &&
  typeof argv[key] !== 'undefined'
  ) {
    cliOptions[key] = argv[key]
  }
})

const options = Object.assign({}, cliOptions)
options.rollup = Object.assign({}, rollupOptions, options.rollup)

// copy config from rollup in base options
if (options.rollup.config) {
  if (!options.config) options.config = options.rollup.config
  delete options.rollup.config
}

// change noLive to live option, and noOverlay to overlay
options.live = options.noLive !== undefined ? !options.noLive : true
options.overlay = options.noOverlay !== undefined ? !options.noOverlay : true
delete options.noLive
delete options.noOverlay

rulo(options)
