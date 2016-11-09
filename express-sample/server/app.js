'use strict'

const express = require('express')
const bodyParser = require('body-parser')
const expressLogger = require('./lib/middleware').expressLogger
const logger = require('pino')()

const app = express()
const todo = require('./routes/todos')

const mongoClient = require('./lib/mongo_client')()

const DEFAULT_CONFIG = {
  mongo: {
    host: 'localhost',
    database: 'express_sample_development',
  },
}

app.use(bodyParser())
app.use(expressLogger())

app.get('/ping', (req, res) => {
  res.send('pong')
})

app.route('/todos')
    .get(todo.index())
    .post(todo.create())

app.route('/todos/:id')
    .get(todo.show())
    .put(todo.update())

mongoClient.connect(DEFAULT_CONFIG.mongo).then(() => {
  app.listen(3000, () => {
    logger.info('Express Server Started!')
  })
})

process.on('unhandledRejection', (e, p) => {
  logger.error(e, p)
})

process.on('uncaughtException', (e) => {
  logger.error(e)
  process.abort()
})
