const minimist = require('minimist')
const hashi = require('../src/hashi')
const hashiDefaults = require('../src/hashiDefaults')

const hashiVersion = require('../package.json').version
const rollupVersion = require('rollup/package.json').version
const rollupWatchVersion = require('rollup-watch/package.json').version

const args = process.argv.slice(2)

const help = (
`Usage:
  hashi index.js:bundle.js [opts] -- [rollup opts]

Options:
  --help, -h          show help message
  --version           show version
  --port, -p          the port to run, default 9966
  --host, -H          the host, default internal IP (localhost)
  --basedir, -d       a path for base static content
  --live, -l          enable default LiveReload integration
  --live-port, -L     the LiveReload port, default 35729
  --pushstate, -P     always render the index page instead of a 404 page
  --watch-glob, --wg  glob(s) to watch for reloads, default '**/*.{html,css}'
`
)

const argv = minimist(args, {
  boolean: [
    'live',
    'pushstate',
    'version'
  ],
  string: [
    'host',
    'port',
    'livePort',
    'basedir',
    'watchGlob'
  ],
  default: hashiDefaults,
  alias: {
    port: 'p',
    basedir: 'd',
    help: 'h',
    host: 'H',
    live: 'l',
    pushstate: 'P',
    watchGlob: [ 'wg', 'watch-glob' ],
    'livePort': ['L', 'live-port']
  },
  '--': true
})

const entries = argv._.map((entry) => {
  entry = '' + entry
  entry = entry.split(':')
  if (entry.length === 1) {
    return entry[0]
  } else if (entry.length === 2) {
    const entryObj = {}
    entryObj[entry[0]] = entry[1]
    return entryObj
  } else {
    throw new Error('Bad syntax on entry')
  }
})
delete argv._

argv.rollupArgs = argv['--']
delete argv['--']

if (argv.version) {
  console.log('hashi v' + hashiVersion)
  console.log('rollup v' + rollupVersion)
  console.log('rollup-watch v' + rollupWatchVersion)
  process.exit(0)
}

if (argv.help) {
  console.log(help)
  process.exit(0)
}

console.log(argv, entries)
