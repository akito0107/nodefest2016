'use strict'

const test = require('ava')

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
  const now = Date.now()
  new Todo({ body: 'body', createdAt: now - 10000, isCompleted: false }).save().then((doc) => {
    const id = doc._id
    
    const request = {
      body: {
        id,
        isCompleted: true,
        updatedAt: now,
      },
    }
    
    update(request, {
      send: (result) => {
        t.deepEqual(result.todo._id, id)
        t.deepEqual(result.todo.updatedAt, now)
        t.is(result.todo.isCompleted, true)
        t.end()
      },
    }, t.end)
  })
})

test.cb.serial('IDを指定しないとError (403)', (t) => {

  t.fail()
  t.end()
})
