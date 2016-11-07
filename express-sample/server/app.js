'use strict'

const express = require('express')
const logger = require('pino')()

const app = express()

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
