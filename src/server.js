'use strict'

// TODO: HTTPS Support
const http = require('http')

function serverWrapper (opts) {
  opts = opts || {}
  let created = false
  let closed = false

  const api = {
    handler: null,
    create,
    listen,
    close
  }

  return api

  function create (app) {
    return new Promise((resolve, reject) => {
      if (created) return reject(new Error('Server already created'))
      api.handler = http.createServer(app)
      process.nextTick(() => {
        created = true
        if (closed) close()
        resolve(api.handler)
      })
    })
  }

  function listen (port, host) {
    return new Promise((resolve, reject) => {
      if (closed) return reject(new Error('Server closed'))
      if (!created) return reject(new Error('Server not created'))
      api.handler.listen(port, host, () => {
        resolve(api.handler)
      })
    })
  }

  function close () {
    closed = true
    if (created && api.handler) api.handler.close()
  }
}

module.exports = serverWrapper
