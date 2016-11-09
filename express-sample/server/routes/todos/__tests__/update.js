'use strict'

const test = require('ava')
const objectId = require('mongoose').Types.ObjectId

const mongoClientInitializer = require('../../../lib/mongo_client')
const Todo = require('../../../models').Todo
const update = require('../index').update({ Todo })

const TEST_DB = 'test_express_database'
let mongoClient

// DB Set Up
test.beforeEach(() => {
  mongoClient = mongoClientInitializer({ host: 'localhost', database: TEST_DB })
  return mongoClient.connect()
})

test.afterEach.always(() => {
  Todo.find({}).remove().exec()
  return mongoClient.close()
})

test.cb.serial('IDを指定してUpdateできる', (t) => {
  const now = Date.now()
  const todo = new Todo({ body: 'body', createdAt: now - 10000, isCompleted: false })
  todo.save().then((doc) => {
    const id = doc._id
    
    const request = {
      params: {
        id,
      },
      body: {
        isCompleted: true,
        updatedAt: now,
      },
    }
    
    update(request, {
      json: (result) => {
        t.deepEqual(result.todo._id, id)
        t.deepEqual(result.todo.updatedAt, new Date(now))
        t.is(result.todo.isCompleted, true)
        t.end()
      },
    }, t.end)
  }).catch(t.end)
})

test.cb.serial('IDを指定しないとError (403)', (t) => {
  const request = { params: {}, body: { body: 'Test', createdAt: Date.now(), isCompleted: true } }
  update(request, {
    json: () => {
    },
  }, (err) => {
    t.is(err.code, 403)
    t.is(err.message, 'missing required parameter')
    t.end()
  })
})

test.cb.serial('指定されたtodoがなかったらError (404)', (t) => {
  const id = objectId('4edd40c86762e0fb12000003')
  const request = { params: { id }, body: { body: 'Test', createdAt: Date.now(), isCompleted: true } }
  
  update(request, {
    json: () => {
    },
  }, (err) => {
    t.is(err.code, 404)
    t.is(err.message, 'not found')
    t.end()
  })
})

test.cb.serial('指定されたIDがフォーマットに則っていなかったらError (403)', (t) => {
  const request = { params: { id: 'hoge' }, body: { body: 'Test', createdAt: Date.now(), isCompleted: true } }
  
  update(request, {
    json: () => {
    },
  }, (err) => {
    t.is(err.code, 403)
    t.is(err.message, 'invalid parameter')
    t.deepEqual(err.body, { id: { message: 'id must be a valid format', value: request.params.id } })
    t.end()
  })
})
