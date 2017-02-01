'use strict'
const path = require('path')
const testCwd = path.resolve(__dirname, '..')

function cwd (relPath) {
  return path.resolve(testCwd, relPath)
}

module.exports = cwd
