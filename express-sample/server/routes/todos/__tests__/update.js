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
      params: {
        id,
      },
      body: {
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
  const request = { params: {}, body: { isCompleted: true } }
  update(request, {
    send: () => {
    },
  }, (err) => {
    t.is(err.code, 403)
    t.is(err.message, 'missing required parameter')
    t.end()
  })
})

test.cb.serial('指定されたtodoがなかったらError (404)', (t) => {
  const id = objectId('4edd40c86762e0fb12000003')
  const request = { params: { id }, body: { isCompleted: true } }
  
  update(request, {
    send: () => {
    },
  }, (err) => {
    t.is(err.code, 404)
    t.is(err.message, 'not found')
    t.end()
  })
})

test.cb.serial('指定されたIDがフォーマットに則っていなかったらError (403)', (t) => {
  const request = { params: { id: 'hoge' }, body: { isCompleted: true } }
  
  update(request, {
    send: () => {
    },
  }, (err) => {
    t.is(err.code, 403)
    t.is(err.message, 'invalid parameter')
    t.deepEqual(err.body, { id: { message: 'id must be a valid format', value: request.params.id } })
    t.end()
  })
})
