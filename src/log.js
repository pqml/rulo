const termColors = require('term-color')
const nodeEmoji = require('node-emoji')

const levels = {'debug': 0, 'info': 1, 'warn': 2, 'error': 3}
const noop = function () {}

let stream = process.stdout
let level = 1
let colors = termColors

function emoji (name) {
  return nodeEmoji.get(name) + ' '
}

function setColors (enable) {
  colors = enable ? termColors : noop
}

function setLevel (_lvl) {
  if (!levels[_lvl]) throw new Error('This log level doesn\'t exist.')
  level = levels[_lvl]
}

function setStream (_stream) {
  stream = _stream
}

function hr (count) {
  count = count !== undefined ? count : 1
  let line = colors.gray(Array(count).join('-'))
  line += '\n'
  write(line)
}

function write (msg) {
  if (!stream || !stream.write) return
  msg = colors.blue('Rulo') + colors.gray('  ') + msg
  stream.write(msg)
}

function debug (msg) {
  if (level > 0) return
  let line = ''

  line += colors.gray(msg) || ''

  line += '\n'
  write(line)
}

function info (msg) {
  if (level > 1) return
  let line = ''

  line += msg || ''

  line += '\n'
  write(line)
}

function warn (msg) {
  if (level > 2) return
  let line = emoji('warning') + colors.yellow(' Warning: ')

  line += msg || ''

  line += '\n'
  write(line)
}

function error (err) {
  if (level > 3) return
  let line = emoji('skull') + ' '

  if (err instanceof Error) {
    line += (err.name) ? colors.red(err.name + ': ') : colors.red('Error: ')
    line += colors.red(err.message) || ''
    line += '\n'
    line += err.stack ? '\n' + colors.gray(err.stack) + '\n' : ''
  } else {
    line += err || ''
  }

  line += '\n'
  write(line)
}

function success (msg) {
  msg = emoji('sparkles') + ' ' + msg
  info(msg)
}

const log = {
  setLevel,
  setStream,
  setColors,
  colors,
  emoji,
  debug,
  info,
  warn,
  error,
  success,
  hr
}

module.exports = log
