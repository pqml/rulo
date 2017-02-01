'use strict'
const test = require('tape')
const sd = require('sander')
const rulo = require('../src/rulo')
const onceEvents = require('./utils/onceEvents')
const cwd = require('./utils/cwd')

test('rulo', t => {
  t.test('should emit bundle_starts before any other events', t => {
    t.plan(1)
    let r = rulo(cwd('fixtures/simple/main.js'), { quiet: true })
    try { sd.unlinkSync('simple/bundle.js') } catch (err) {}
    let started = false
    r.once('bundle_start', () => {
      t.pass('bundle has started')
      started = true
      r.close()
      r = undefined
    })
    onceEvents(r, ['bundle_end', 'bundle_error', 'error'], () => {
      if (started) return
      t.fail('An event has been triggered before bundle_start')
    })
  })
})
