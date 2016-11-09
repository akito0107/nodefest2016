'use strict'

const test = require('ava')
const mongoClientInitializer = require('../../../lib/mongo_client')
const Todo = require('../../../models').Todo
const create = require('../index').create({ Todo })

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

test.cb.serial('与えられたパラメータでTodoが作成できる', (t) => {
  const request = {
    body: {
      body: 'todo task',
    },
  }
  
  create(request, {
    status: (code) => {
      t.is(code, 201)
    },
    json: () => {
      Todo.find({}).exec().then((doc) => {
        t.is(doc.length, 1)
        t.is(doc[0].body, 'todo task')
        t.end()
      })
    },
  }, t.end)
})

test.cb.serial('作成されたTodoのisCompletedの初期値がfalse', (t) => {
  const request = { body: { body: 'todo task' } }
  
  create(request, {
    status: (code) => {
      t.is(code, 201)
    },
    json: () => {
      Todo.find({}).exec().then((doc) => {
        t.is(doc.length, 1)
        t.is(doc[0].body, 'todo task')
        t.is(doc[0].isCompleted, false)
        t.end()
      })
    },
  })
})

test.todo('locationがセットされている')
