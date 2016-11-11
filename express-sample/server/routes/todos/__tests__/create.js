'use strict'

const test = require('ava')
const app = require('express')()
const bodyParser = require('body-parser')
const request = require('supertest')

const mongoClientInitializer = require('../../../lib/mongo_client')
const Todo = require('../../../models').Todo
const create = require('../index').create({ Todo })

const TEST_DB = 'test_express_database'
let mongoClient

// DB Set Up
test.beforeEach(() => {
  app.use(bodyParser.json())
  app.route('/todos').post(create)
  mongoClient = mongoClientInitializer({ host: 'localhost', database: TEST_DB })
  return mongoClient.connect()
})

test.afterEach.always(() => {
  Todo.find({}).remove().exec()
  return mongoClient.close()
})

test.cb.serial('与えられたパラメータでTodoが作成できる', (t) => {
  request(app)
      .post('/todos')
      .type('json')
      .send({ body: 'todo task' })
      .expect(201)
      .then(() => {
        return Todo.find({}).exec()
      })
      .then((doc) => {
        t.is(doc.length, 1)
        t.is(doc[0].body, 'todo task')
        t.is(doc[0].isCompleted, false)
        t.end()
      })
      .catch(t.end)
})

test.todo('locationがセットされている')
