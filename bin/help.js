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
'  --help, -h          ' + i('Show help message') + '\n' +
'  --version, -V       ' + i('Show version') + '\n' +
'  --input, -i         ' + i('Overide the entry file to bundle') + '\n' +
'  --entry             ' + i('Same as --input') + '\n' +
'  --output, -o        ' + i('Overide the default output') + '\n' +
'  --dest              ' + i('Same as --output') + '\n' +
'  --port, -p          ' + i('The port to run, default 8080') + '\n' +
'  --host, -H          ' + i('The host, default local IP and localhost') + '\n' +
'  --basedir, -d       ' + i('A path for base static content') + '\n' +
'  --no-live           ' + i('Disable LiveReload integration, default false') + '\n' +
'  --live-port, -l     ' + i('The LiveReload port, default 35729') + '\n' +
'  --watch-glob, --wg  ' + i('Glob(s) to watch for livereload, default \'**/*.{html,css}\'') + '\n' +
'  --pushstate, -P     ' + i('always render the index page instead of a 404 page') + '\n' +
'  --config, -c        ' + i('A path to a Rollup config file, default false') + '\n' +
'  --no-overlay        ' + i('Disable the DOM-based error reporter, default false') + '\n' +
'  --verbose, -v       ' + i('Log additional informations, default false') + '\n' +
'  --quiet, -q         ' + i('Don\'t write to the console, default false') + '\n'
  )
}

module.exports = help
