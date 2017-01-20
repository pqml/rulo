'use strict'
const path = require('path')
const test = require('tape')
const parser = require('../src/parseOptions')
const waterfall = require('run-waterfall')
const cwd = path.resolve(__dirname)
// const sd = require('sander')

test('parseOption() function', t => {
  t.test('should have its entry arg overriding format, entry, targets from rollup options', t => {
    t.plan(5)
    waterfall([
      function (cb) {
        parser('entry.js:output.js', {
          rollup: {
            entry: 'app.js',
            dest: 'bundle.js',
            format: 'cjs'
          }
        })
        .then(opts => {
          t.notEqual(opts.rollup, undefined, 'opts.rollup is set')
          t.equal(opts.rollup.entry, 'entry.js', 'opts.rollup.entry is overriden')
          t.equal(opts.rollup.dest, 'output.js', 'opts.rollup.dest is overriden')
          t.equal(opts.rollup.format, 'iife', 'opts.rollup.format is overriden')
          cb()
        })
        .catch(err => { t.fail(err) })
      },
      function (cb) {
        parser('entry.js:output.js', {
          rollup: {
            entry: 'app.js',
            targets: [
              { dest: 'bundle.cjs.js', format: 'cjs' },
              { dest: 'bundle.es.js', format: 'es' }
            ]
          }
        })
        .then(opts => {
          t.equal(opts.rollup.targets, undefined, 'opts.rollup.targets is removed')
        })
        .catch(err => { t.fail(err) })
      }
    ])
  })

  t.test('should load a rollup config file', t => {
    t.plan(3)
    parser(false, { config: path.resolve(cwd, 'fixtures/configs/simple.config.js') })
      .then(opts => {
        t.notEqual(opts.rollup, undefined, 'opts.rollup is set')
        t.equal(opts.rollup.entry, 'main.js', 'entry comes from the config file')
        t.equal(opts.rollup.dest, 'bundle.js', 'dest comes from the config file')
      })
      .catch(err => { t.fail(err) })
  })

  t.test('should throw an error for invalid config file', t => {
    t.plan(1)
    parser(false, { config: path.resolve(cwd, 'fixtures/errors/error.config.js') })
      .then(opts => { t.fail('Not throwing an error') })
      .catch(err => { t.pass('Throws an error: ' + err.message || '') })
  })
})
