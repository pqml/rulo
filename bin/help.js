'use strict'

const emoji = require('node-emoji')
const log = require('../src/log')
const b = function (v) { return log.colors.bold(log.colors.bgBlack(v)) }
const i = function (v) { return log.colors.italic(log.colors.gray(v)) }

function help () {
  return (
emoji.get('cyclone') + log.colors.blue('  CLI Usage\n') +
'\n' +
'Command syntax:\n' +
b('  ' + log.colors.green('rulo') + ' index.js:bundle.js [opts] -- [rollup opts]  ') + '\n' +
'\n' +
'Options:\n' +
'  --help, -h          ' + i('show help message') + '\n' +
'  --version, -V       ' + i('show version') + '\n' +
'  --port, -p          ' + i('the port to run, default 8080') + '\n' +
'  --host, -H          ' + i('the host, default local IP and localhost') + '\n' +
'  --basedir, -d       ' + i('a path for base static content') + '\n' +
'  --no-live           ' + i('disable LiveReload integration, default false') + '\n' +
'  --live-port, -l     ' + i('the LiveReload port, default 35729') + '\n' +
'  --watch-glob, --wg  ' + i('glob(s) to watch for livereload, default \'**/*.{html,css}\'') + '\n' +
'  --pushstate, -P     ' + i('always render the index page instead of a 404 page') + '\n' +
'  --config, -c        ' + i('A path to a Rollup config file, default false') + '\n' +
'  --no-overlay        ' + i('Disable the DOM-based error reporter, default false') + '\n' +
'  --verbose, -v       ' + i('Log additional informations, default false') + '\n'

  )
}

module.exports = help
