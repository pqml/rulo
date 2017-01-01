const sh = require('kool-shell')

const log = {
  error: sh.error,
  warning: sh.warning,
  info: sh.info,
  log: sh.log
}

module.exports = log
