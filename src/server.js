// TODO: HTTPS Support
const http = require('http')

function serverWrapper (opts = {}) {
  let created = false

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
        resolve(api.handler)
      })
    })
  }

  function listen (port) {
    return new Promise((resolve, reject) => {
      if (!created) return reject(new Error('Server not created'))
      api.handler.listen(port, () => {
        resolve(api.handler)
      })
    })
  }

  function close () {
    if (created && api.handler) api.handler.close()
  }
}

module.exports = serverWrapper
