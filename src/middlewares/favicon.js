function faviconMiddleware (req, res) {
  var maxAge = 345600 // 4 days
  res.setHeader('Cache-Control', 'public, max-age=' + Math.floor(maxAge / 1000))
  res.setHeader('Content-Type', 'image/x-icon')
  res.statusCode = 200
  res.end()
}

module.exports = faviconMiddleware
