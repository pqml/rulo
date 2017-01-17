/*

latest rollup version checked : v0.41.4
ommited properties :
- watch
- config

 */

'use strict'

const minimist = require('minimist')
const log = require('../src/log')

const minimistOpts = {
  alias: {
    // Aliases
    strict: 'useStrict',

    // Short options
    c: 'config',
    d: 'indent',
    e: 'external',
    f: 'format',
    g: 'globals',
    h: 'help',
    i: 'input',
    l: 'legacy',
    m: 'sourcemap',
    n: 'name',
    o: 'output',
    u: 'id',
    v: 'version',
    W: 'watch-write',
    M: 'watch-in-memory'
  },
  boolean: [
    'W',
    'M'
  ],
  default: {
    'M': false,
    'W': true
  }
}

const equivalents = {
  useStrict: 'useStrict',
  banner: 'banner',
  footer: 'footer',
  format: 'format',
  globals: 'globals',
  id: 'moduleId',
  indent: 'indent',
  input: 'entry',
  intro: 'intro',
  legacy: 'legacy',
  name: 'moduleName',
  output: 'dest',
  outro: 'outro',
  sourcemap: 'sourceMap',
  treeshake: 'treeshake',
  // custom properties for rulo
  config: 'config',
  'watch-write': 'watchWrite',
  'watch-in-memory': 'watchInMemory'
}

function handleError (err) {
  const error = 'Rollup args error - ' + err.message || ''
  log.exitError(error)
}

function parseRollupArgs (args) {
  let options = {}
  const argv = minimist(args, minimistOpts)

  if (argv._.length > 1) {
    handleError({
      code: 'ONE_AT_A_TIME',
      message: 'rollup can only bundle one file at a time'
    })
  }

  if (argv._.length === 1) {
    if (argv.input) {
      handleError({
        code: 'DUPLICATE_IMPORT_OPTIONS',
        message: 'use --input, or pass input path as argument'
      })
    }
    argv.input = argv._[0]
  }

  if (argv.environment) {
    argv.environment.split(',').forEach(pair => {
      const index = pair.indexOf(':')
      if (index > -1) {
        process.env[pair.slice(0, index)] = pair.slice(index + 1)
      } else {
        process.env[pair] = true
      }
    })
  }

  Object.keys(equivalents).forEach(cliOption => {
    if (
    argv.hasOwnProperty(cliOption) &&
    typeof argv[cliOption] !== 'undefined'
    ) {
      options[equivalents[cliOption]] = argv[cliOption]
    }
  })

  // custom watch property
  if (
  typeof options.watchWrite !== 'undefined' ||
  typeof options.watchInMemory !== 'undefined'
  ) {
    options.watch = {}
  }
  if (typeof options.watchWrite !== 'undefined') {
    options.watch.write = options.watchWrite
    delete options.watchWrite
  }
  if (typeof options.watchInMemory !== 'undefined') {
    options.watch.inMemory = options.watchInMemory
    delete options.watchInMemory
  }
  return options
}

module.exports = parseRollupArgs
