'use strict'

const pino = require('pino')()

module.exports = {
  expressLogger: logger,
}

function logger() {
  return (req, res, next) => {
    pino.info(req)
    next()
  }
}
