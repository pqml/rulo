'use strict'

function onceEvents (emitter, events, cb) {
  events.forEach(event => {
    emitter.once(event, cb)
  })
}

module.exports = onceEvents
