'use strict'

function errorOverlay (err) {
  err = err || {}
  var dom = { body: document.body }

  dom.box = document.createElement('div')
  text(dom.box, '')
  css(dom.box, {
    'position': 'fixed',
    'width': '100%',
    'height': '100%',
    'zIndex': '999999',
    'top': '0',
    'left': '0',
    'padding': '8%',
    'margin': '0px',
    'box-sizing': 'border-box',
    'background': '#fff',
    'overflow': 'auto'
  })

  dom.titleRulo = document.createElement('span')
  text(dom.titleRulo, 'rulo')
  dom.titleEmoji = document.createElement('span')
  text(dom.titleEmoji, '🌀')
  css(dom.titleEmoji, {
    'font-size': '0.70em'
  })
  dom.title = document.createElement('h1')
  css(dom.title, {
    'margin': 0,
    'padding': 0,
    'font-size': '50px',
    'font-weight': 900,
    'font-family': '\'Arial Black\', \'Helvetica\', sans-serif',
    'color': '#317ae1'
  })
  dom.title.appendChild(dom.titleEmoji)
  dom.title.appendChild(dom.titleRulo)

  dom.console = document.createElement('div')
  css(dom.console, {
    'font-family': '\'Monaco\', monospace',
    'font-size': '14px',
    'margin': '0px',
    'margin-top': '30px',
    'padding': '40px',
    'background': '#f1f8fd',
    'word-wrap': 'break-word',
    'white-space': 'pre-wrap',
    'border-radius': '5px'
  })

  addLine('💀 ' + err.name + ': ' + err.message, '#f73859')
  addLine('\n' + err.stack, '#539ddb')

  dom.box.appendChild(dom.title)
  dom.box.appendChild(dom.console)
  dom.body.appendChild(dom.box)

  function addLine (str, color) {
    var el = document.createElement('div')
    text(el, str)
    css(el, {
      'color': color || '#c3d3df',
      'line-height': '150%'
    })
    dom.console.appendChild(el)
  }

  function css (element, style) {
    for (var k in style) {
      element.style[k] = style[k]
    }
  }

  function text (element, txt) {
    element.textContent = txt
  }
}

function renderOverlayFn (err) {
  return (
    '\'use strict\';\n' +
    '(' + errorOverlay + ')(' + JSON.stringify(err) + ');\n'
  )
}

module.exports = renderOverlayFn
