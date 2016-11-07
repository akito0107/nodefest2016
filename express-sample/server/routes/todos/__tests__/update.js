'use strict'

const test = require('ava')
const _ = require('lodash')

const mongoClientInitializer = require('../../../lib/mongo_client')
const Todo = require('../../../models').Todo
const update = require('../index').update({ Todo })

const TEST_DB = 'test_express_database'
let mongoClient

// DB Set Up
test.beforeEach(() => {
  mongoClient = mongoClientInitializer()
  return mongoClient.connect(`mongodb://localhost/${TEST_DB}`)
})

test.afterEach.always(() => {
  Todo.find({}).remove().exec()
  return mongoClient.close()
})

test.cb.serial('IDを指定してUpdateできる', (t) => {
  new Todo({ body: 'body', createdAt: Date.now(), isCompleted: false}).save().then((doc) => {
    const id = doc._id
    console.log(doc)
    t.fail()
    t.end()
  })
})
