'use strict'

const os = require('os')

function localIp () {
  const interfaces = os.networkInterfaces()
  let localip

  Object.keys(interfaces).forEach((name) => {
    interfaces[name].forEach((iface) => {
      if (!iface.internal && iface.family === 'IPv4') {
        localip = iface.address
      }
    })
  })

  return localip
}

module.exports = localIp
