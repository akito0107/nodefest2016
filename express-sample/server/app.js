'use strict'

const express = require('express')
const bodyParser = require('body-parser')
const expressLogger = require('./lib/middleware').expressLogger
const logger = require('pino')()

const app = express()
app.use(bodyParser())
app.use(expressLogger())

app.listen(3000, () => {
  logger.info('Express Server Started!')
})

app.get('/ping', (req, res) => {
  res.send('pong')
})

process.on('unhandledRejection', (e, p) => {
  logger.error(e, p)
})

process.on('uncaughtException', (e) => {
  logger.error(e)
  process.abort()
})
